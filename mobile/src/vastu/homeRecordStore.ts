/**
 * Persistence for the मेरा घर roster (PRD-24 Phase 2 §C2) — one payload per
 * device under `@vedansh:vastu-homes:v1`, enumerated as a NON-cache key in
 * `derivedCacheReset.test.ts` (user data, never swept).
 *
 * Same storage rules as `kulParamparaStore`: one in-memory snapshot, one
 * subscriber list, one serialized write queue; only a successful read is
 * memoized; a mutation publishes only after its write lands. No provider in
 * `App.tsx` — the roster is read only by the vastu screens, so the first
 * screen to mount pays the one small read, never launch.
 *
 * Privacy (RULEBOOK §22): nothing outside the vastu screens reads this key —
 * not Home, not the Today strip, not widgets, not notifications.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { isKnownVastuRoomId } from '@/data/vastu/roomGuidance';
import { isKnownTemplateId } from '@/data/vastu/homeTemplates';
import {
  EMPTY_HOME_ROSTER,
  VASTU_HOMES_STORAGE_KEY,
  parseHomeRoster,
  removeHome,
  serializeHomeRoster,
  upsertHome,
  type HomeRecord,
  type HomeRecordValidators,
  type HomeRoster,
} from './homeRecord';

const VALIDATORS: HomeRecordValidators = {
  isRoomKnown: isKnownVastuRoomId,
  isTemplateKnown: isKnownTemplateId,
};

export type HomeRosterState = {
  hydrated: boolean;
  roster: HomeRoster;
};

const INITIAL_STATE: HomeRosterState = { hydrated: false, roster: EMPTY_HOME_ROSTER };

let state: HomeRosterState = INITIAL_STATE;
let loadPromise: Promise<HomeRosterState> | null = null;
let lastReadFailed = false;
let writeQueue: Promise<unknown> = Promise.resolve();
const listeners = new Set<(next: HomeRosterState) => void>();

function publish(next: HomeRosterState): void {
  state = next;
  listeners.forEach((listener) => listener(next));
}

export function getHomeRosterSnapshot(): HomeRosterState {
  return state;
}

export function subscribeHomeRoster(listener: (next: HomeRosterState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Hydrate once per process. Only a successful read is memoized. */
export function loadHomeRoster(): Promise<HomeRosterState> {
  if (state.hydrated && !lastReadFailed) return Promise.resolve(state);
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(VASTU_HOMES_STORAGE_KEY)
      .then((raw) => {
        lastReadFailed = false;
        const next: HomeRosterState = { hydrated: true, roster: parseHomeRoster(raw, VALIDATORS) };
        publish(next);
        return next;
      })
      .catch(() => {
        loadPromise = null;
        lastReadFailed = true;
        const next: HomeRosterState = { hydrated: true, roster: EMPTY_HOME_ROSTER };
        publish(next);
        return next;
      });
  }
  return loadPromise;
}

async function persist(next: HomeRoster): Promise<HomeRoster> {
  await AsyncStorage.setItem(VASTU_HOMES_STORAGE_KEY, serializeHomeRoster(next));
  lastReadFailed = false;
  publish({ hydrated: true, roster: next });
  return next;
}

/** Upsert one home (the setup flow saves after every capture). */
export async function saveHome(home: HomeRecord): Promise<HomeRoster> {
  const run = async (): Promise<HomeRoster> => {
    const current = await loadHomeRoster();
    return persist(upsertHome(current.roster, home));
  };
  const queued = writeQueue.then(run, run);
  writeQueue = queued.catch(() => undefined);
  return queued;
}

export async function deleteHome(homeId: string): Promise<HomeRoster> {
  const run = async (): Promise<HomeRoster> => {
    const current = await loadHomeRoster();
    return persist(removeHome(current.roster, homeId));
  };
  const queued = writeQueue.then(run, run);
  writeQueue = queued.catch(() => undefined);
  return queued;
}

/** Subscribe to the roster. First mount pays the one storage read. */
export function useHomeRoster(): HomeRosterState {
  const [current, setCurrent] = useState<HomeRosterState>(() => getHomeRosterSnapshot());
  useEffect(() => {
    const unsubscribe = subscribeHomeRoster(setCurrent);
    void loadHomeRoster().then(setCurrent);
    return unsubscribe;
  }, []);
  return current;
}

export function __resetHomeRosterStoreForTests(): void {
  state = INITIAL_STATE;
  loadPromise = null;
  lastReadFailed = false;
  writeQueue = Promise.resolve();
  listeners.clear();
}

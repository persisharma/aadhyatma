/**
 * Persistence for the कुल परम्परा record (PRD-29 Part B) — one record per
 * device under `@vedansh:kul-parampara:v1`, enumerated as a NON-cache key in
 * `derivedCacheReset.test.ts` (user data, never swept).
 *
 * Same storage rules as `birthProfileStore`: one in-memory snapshot, one
 * subscriber list, one serialized write queue; only a successful read is
 * memoized; a mutation publishes only after its write lands. No provider in
 * `App.tsx` — the record is read only by the More-stack screens and the
 * export, so the first screen to mount pays the one small read, never launch.
 *
 * Rule-id validation is injected into the pure half from here (`festivals.ts`
 * is already on the launch graph via the festival engine; `vratCatalog`'s
 * katha corpus deliberately is NOT, so do not swap this import for it).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { OBSERVANCE_RULES } from './festivals';
import { resolveObservancesForYear } from './festivalEngine';
import {
  EMPTY_KUL_RECORD,
  KUL_PARAMPARA_STORAGE_KEY,
  normalizeKulRecord,
  parseKulRecord,
  serializeKulRecord,
  type KulRecord,
} from './kulParampara';
import type { ObservanceRule } from './types';

const RULE_BY_ID = new Map(OBSERVANCE_RULES.map((rule) => [rule.id, rule] as const));

export function kulVratRuleById(ruleId: string): ObservanceRule | null {
  return RULE_BY_ID.get(ruleId) ?? null;
}

const isRuleKnown = (ruleId: string): boolean => RULE_BY_ID.has(ruleId);

/**
 * Next occurrence of the linked kul vrat — the bundled precomputed table via
 * the festival engine, the same no-location choice the vrat reminders make.
 * NOT `vratCatalog.getNextOccurrence`: that module drags the katha corpus, and
 * this store sits on the eagerly-loaded More stack (launch-graph budget).
 */
export function nextKulVratOccurrence(ruleId: string, fromDate: Date): Date | null {
  if (!RULE_BY_ID.has(ruleId)) return null;
  const year = fromDate.getFullYear();
  const start = new Date(year, fromDate.getMonth(), fromDate.getDate()).getTime();
  try {
    const all = [...resolveObservancesForYear(year), ...resolveObservancesForYear(year + 1)];
    return (
      all
        .filter((item) => item.rule.id === ruleId && item.date.getTime() >= start)
        .sort((a, b) => a.date.getTime() - b.date.getTime())[0]?.date ?? null
    );
  } catch {
    return null; // an unsolvable rule dates nothing, never breaks the record screen
  }
}

export type KulRecordState = {
  hydrated: boolean;
  record: KulRecord;
};

const INITIAL_STATE: KulRecordState = { hydrated: false, record: EMPTY_KUL_RECORD };

let state: KulRecordState = INITIAL_STATE;
let loadPromise: Promise<KulRecordState> | null = null;
let lastReadFailed = false;
let writeQueue: Promise<unknown> = Promise.resolve();
const listeners = new Set<(next: KulRecordState) => void>();

function publish(next: KulRecordState): void {
  state = next;
  listeners.forEach((listener) => listener(next));
}

export function getKulRecordSnapshot(): KulRecordState {
  return state;
}

export function subscribeKulRecord(listener: (next: KulRecordState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Hydrate once per process. Only a successful read is memoized. */
export function loadKulRecord(): Promise<KulRecordState> {
  if (state.hydrated && !lastReadFailed) return Promise.resolve(state);
  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(KUL_PARAMPARA_STORAGE_KEY)
      .then((raw) => {
        lastReadFailed = false;
        const next: KulRecordState = { hydrated: true, record: parseKulRecord(raw, isRuleKnown) };
        publish(next);
        return next;
      })
      .catch(() => {
        loadPromise = null;
        lastReadFailed = true;
        const next: KulRecordState = { hydrated: true, record: EMPTY_KUL_RECORD };
        publish(next);
        return next;
      });
  }
  return loadPromise;
}

/** Replace the record (the edit screen saves whole). Rejects propagate to the caller. */
export async function saveKulRecord(candidate: KulRecord): Promise<KulRecord> {
  const run = async (): Promise<KulRecord> => {
    await loadKulRecord();
    const next = normalizeKulRecord(candidate, isRuleKnown);
    await AsyncStorage.setItem(KUL_PARAMPARA_STORAGE_KEY, serializeKulRecord(next));
    lastReadFailed = false;
    publish({ hydrated: true, record: next });
    return next;
  };
  const queued = writeQueue.then(run, run);
  writeQueue = queued.catch(() => undefined);
  return queued;
}

/** Subscribe to the record. First mount pays the one storage read. */
export function useKulRecord(): KulRecordState {
  const [current, setCurrent] = useState<KulRecordState>(() => getKulRecordSnapshot());
  useEffect(() => {
    const unsubscribe = subscribeKulRecord(setCurrent);
    void loadKulRecord().then(setCurrent);
    return unsubscribe;
  }, []);
  return current;
}

export function __resetKulRecordStoreForTests(): void {
  state = INITIAL_STATE;
  loadPromise = null;
  lastReadFailed = false;
  writeQueue = Promise.resolve();
  listeners.clear();
}

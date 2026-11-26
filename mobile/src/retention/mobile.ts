import { AppState, Platform, type AppStateStatus } from 'react-native';
import type { Action } from './cohort';

// Configuring the first-party collector enables measurement for Android only.
const endpoint = process.env.EXPO_PUBLIC_RETENTION_URL;
const localTest =
  typeof __DEV__ !== 'undefined' &&
  __DEV__ &&
  /^http:\/\/127\.0\.0\.1:\d+\/events$/.test(endpoint ?? '');
const enabled =
  Platform.OS === 'android' && !!endpoint && (endpoint.startsWith('https://') || localTest);
const KEY = '@vedansh/first-action-retention-v1';
let session = String(Date.now());
let eligible: boolean | undefined;
let backgroundAt: number | undefined;
let active = AppState.currentState === 'active';
let pendingAction: { action: Action; session: string; time: number } | undefined;
let opening: { time: number; session: string } | undefined;
let tracker: ReturnType<typeof createTracker> | undefined;
let recorded = false;
let retry: ReturnType<typeof setTimeout> | undefined;

function createTracker() {
  const { createCohort } = require('./cohort') as typeof import('./cohort');
  const storage = require('@react-native-async-storage/async-storage')
    .default as typeof import('@react-native-async-storage/async-storage').default;
  const { randomUUID } = require('expo-crypto') as typeof import('expo-crypto');
  return createCohort({
    now: Date.now,
    uuid: randomUUID,
    read: () => storage.getItem(KEY),
    write: (value) => storage.setItem(KEY, value),
    send: async (event) => {
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 8000);
      try {
        const response = await fetch(endpoint!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          redirect: 'error',
          body: JSON.stringify(event),
          signal: abort.signal,
        });
        return response.ok;
      } finally {
        clearTimeout(timeout);
      }
    },
  });
}

async function persistAction() {
  if (!tracker || !pendingAction) return;
  const { action, session: key, time } = pendingAction;
  if (await tracker.complete(action, key, time)) {
    recorded = true;
    pendingAction = undefined;
  }
}

function open(time: number, key: string) {
  if (eligible === undefined) {
    opening ??= { time, session: key };
    return;
  }
  try {
    const app = require('expo-application') as typeof import('expo-application');
    if (!app.nativeApplicationVersion || !app.nativeBuildVersion) return;
    tracker ??= createTracker();
    void tracker.foreground(eligible, app.nativeApplicationVersion, app.nativeBuildVersion, key, time);
    void persistAction();
    if (retry) clearTimeout(retry);
    retry = setTimeout(() => {
      void persistAction();
      void tracker?.flush();
    }, 60_000);
  } catch {
    /* Optional modules can be unavailable on older binaries. */
  }
}

export function startRetention(fresh: boolean) {
  if (!enabled) return;
  eligible = fresh;
  active = AppState.currentState === 'active';
  if (opening) {
    open(opening.time, opening.session);
    opening = undefined;
  } else if (active) open(Date.now(), session);
}

export function retentionLifecycle(next: AppStateStatus) {
  if (!enabled) return;
  const now = Date.now();
  if (next === 'active' && !active) {
    if (backgroundAt !== undefined && now - backgroundAt >= 30 * 60_000) session = String(now);
    backgroundAt = undefined;
    open(now, session);
  }
  if (next === 'background') {
    backgroundAt ??= now;
    if (retry) clearTimeout(retry);
  }
  active = next === 'active';
}

export function waitingForAction() {
  return enabled && !recorded;
}

export function completedAction(action: Action) {
  if (!enabled || recorded || pendingAction || AppState.currentState !== 'active') return;
  const time = Date.now();
  pendingAction = { action, session, time };
  void persistAction();
}

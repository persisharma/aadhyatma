import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
export const LAUNCH_ASK_KEY = '@vedansh/launch-asks-v1';
export type LaunchAskRecord = {
  firstDay: string;
  lastDay: string | null;
  declines: number;
  stopped: boolean;
};
export function localDay(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function reminderDue(
  record: LaunchAskRecord,
  now = new Date(),
): boolean {
  if (record.stopped || record.lastDay === localDay(now)) return false;
  if (!record.lastDay) return true;
  const days = record.declines < 3 ? 2 : record.declines === 3 ? 3 : 7;
  const [y, m, d] = record.lastDay.split('-').map(Number);
  const since =
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(y, m - 1, d)) /
    86400000;
  return since >= days;
}
let snapshot: { ready: boolean; taken: boolean; record: LaunchAskRecord } = {
  ready: false,
  taken: false,
  record: { firstDay: localDay(), lastDay: null, declines: 0, stopped: false },
};
let writes = Promise.resolve();
function persistRecord() {
  const raw = JSON.stringify(snapshot.record);
  writes = writes
    .then(() => AsyncStorage.setItem(LAUNCH_ASK_KEY, raw))
    .catch(() => undefined);
}
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((fn) => fn());
}
let loading: Promise<void> | undefined;
export function hydrateLaunchAsks() {
  return (loading ??= AsyncStorage.getItem(LAUNCH_ASK_KEY)
    .then((raw) => {
      let record = snapshot.record;
      try {
        const r = JSON.parse(raw ?? 'null');
        if (r && /^\d{4}-\d{2}-\d{2}$/.test(r.firstDay))
          record = {
            firstDay: r.firstDay,
            lastDay:
              typeof r.lastDay === 'string' &&
              /^\d{4}-\d{2}-\d{2}$/.test(r.lastDay)
                ? r.lastDay
                : null,
            declines:
              Number.isSafeInteger(r.declines) && r.declines >= 0
                ? r.declines
                : 0,
            stopped: r.stopped === true,
          };
      } catch {
        /* safe defaults */
      }
      snapshot = { ...snapshot, ready: true, record };
      if (!raw) persistRecord();
      emit();
    })
    .catch(() => {
      snapshot = { ...snapshot, ready: true };
      emit();
    }));
}
export function suppressLaunchAsks() {
  snapshot = { ...snapshot, taken: true };
  emit();
}
export function claimLaunchAsk(resumeSetup = false) {
  if (
    !snapshot.ready ||
    snapshot.taken ||
    (!resumeSetup && snapshot.record.lastDay === localDay())
  )
    return false;
  snapshot = {
    ...snapshot,
    taken: true,
    record: { ...snapshot.record, lastDay: localDay() },
  };
  emit();
  persistRecord();
  return true;
}
export function declineLaunchReminder(stopped = false) {
  snapshot = {
    ...snapshot,
    record: {
      ...snapshot.record,
      declines: snapshot.record.declines + 1,
      stopped,
    },
  };
  emit();
  persistRecord();
}
export function useLaunchAsks() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => snapshot,
    () => snapshot,
  );
}

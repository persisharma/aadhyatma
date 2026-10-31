import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { isWidgetPinSupported, requestPinWidget } from '@/widgets/native';
import {
  EMPTY_NUDGE_RECORD,
  NUDGE_STORAGE_KEY,
  parseNudgeRecord,
  widgetAddedPatch,
  type NudgeRecord,
  type NudgeWidget,
} from './dailyBhaktiNudgeView';
let record: NudgeRecord = EMPTY_NUDGE_RECORD;
let pending: Promise<void> | undefined;
let writes = Promise.resolve();
const listeners = new Set<(next: NudgeRecord) => void>();
export function loadNudgeRecord() {
  return (pending ??= writes
    .then(() => AsyncStorage.getItem(NUDGE_STORAGE_KEY))
    .then((raw) => {
      record = parseNudgeRecord(raw);
      listeners.forEach((fn) => fn(record));
    })
    .catch(() => undefined)
    .finally(() => {
      pending = undefined;
    }));
}
export function nudgeSnapshot() {
  return record;
}
export function subscribeNudge(fn: (next: NudgeRecord) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
export function updateNudge(patch: Partial<NudgeRecord>) {
  record = { ...record, ...patch };
  const raw = JSON.stringify(record);
  writes = writes
    .then(() => AsyncStorage.setItem(NUDGE_STORAGE_KEY, raw))
    .catch(() => undefined);
  listeners.forEach((fn) => fn(record));
  return writes;
}
let queue: NudgeWidget[] = [];
let left = false;
let running = false;
let subscribed = false;
/** Queue belongs to the process, so dismissing/unmounting a sheet cannot lose the second pin. */
export async function startWidgetPinFlow(
  widgets: readonly NudgeWidget[],
): Promise<boolean> {
  if (running && left) return true;
  if (!widgets.length || !(await isWidgetPinSupported())) return false;
  if (!subscribed) {
    subscribed = true;
    AppState.addEventListener('change', (state) => {
      if (!queue.length) return;
      if (state !== 'active') {
        left = true;
        return;
      }
      if (!left) return;
      left = false;
      const next = queue.shift()!;
      void requestPinWidget(next)
        .then((opened) => {
          if (opened) void updateNudge(widgetAddedPatch(next, Date.now()));
        })
        .catch(() => undefined)
        .finally(() => {
          running = false;
        });
    });
  }
  const [first, ...rest] = widgets;
  queue = rest;
  left = false;
  running = true;
  try {
    const opened = await requestPinWidget(first);
    if (!opened) {
      queue = [];
      running = false;
      return false;
    }
    await updateNudge(widgetAddedPatch(first, Date.now()));
    return true;
  } catch {
    queue = [];
    running = false;
    return false;
  } finally {
    if (!queue.length) running = false;
  }
}

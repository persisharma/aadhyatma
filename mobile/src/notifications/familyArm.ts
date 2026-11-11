/**
 * The one place a notification family is armed and cancelled.
 *
 * Every family used to do the same three things on every cold start AND every
 * return to the foreground: read the whole pending list, cancel each of its own
 * slots, schedule each of them again. Ten families, so ten full reads of the
 * store and — for the daily verse alone — thirty cancels and thirty schedules,
 * each one a SharedPreferences write plus an AlarmManager call on Android
 * (`docs/engineering/android-anr-audit-2026-11.md` §3 #6). Sharing a verse opens
 * the system sheet and comes back through `AppState`, so a single share re-armed
 * all ten.
 *
 * Three rules replace that, and none of them changes what ends up scheduled:
 *
 *   1. AN IDENTICAL PLAN IS NOT RE-ARMED (same process only). If the family was
 *      armed in this process with exactly this plan — same identifiers, fire
 *      instants, copy and payload — the OS already holds exactly what a re-arm
 *      would produce, so nothing is read, cancelled or scheduled.
 *
 *      This is an equality check, not a "recently armed" heuristic, and it is
 *      deliberately NOT persisted. The first arm of every process always runs:
 *      a force-stop (or an OEM task-killer swipe) clears an app's alarms without
 *      touching the store they are listed in, and re-arming on the next launch
 *      is what brings them back. A persisted "unchanged" flag would skip that.
 *
 *   2. ONLY STALE SLOTS ARE CANCELLED. Scheduling an identifier that is already
 *      pending replaces it on both platforms (Android overwrites the stored
 *      request and re-sets the alarm through the same `PendingIntent`; iOS
 *      replaces the request with that identifier). So the cancel-everything
 *      pass was pure overhead for every slot that is about to be scheduled
 *      again; only identifiers the new plan no longer contains need removing.
 *
 *   3. ONE READ SERVES EVERY FAMILY THAT ASKS TOGETHER. Families arming in the
 *      same wave (a launch, a return to the foreground) share one pending-list
 *      read, unless that read began before the caller's own last write finished
 *      — a family never acts on a list that predates its own changes. Another
 *      family's writes do not matter: each one only ever looks at its own
 *      identifiers.
 *
 * Operations on one family run strictly one after another. Two overlapping
 * re-arms (an effect re-running while the previous arm is mid-schedule) used to
 * interleave and could leave slots from the older plan behind.
 */
import * as Notifications from 'expo-notifications';

export type FamilySlot = Notifications.NotificationRequestInput & { identifier: string };

/** prefix → the plan this process last armed in full. */
const armed = new Map<string, string>();
/** prefix → the tail of that family's operation queue. */
const queues = new Map<string, Promise<void>>();
/** prefix → the clock value at its last completed (or started) write. */
const lastWrite = new Map<string, number>();
let clock = 0;
let lastRead: { startedAt: number; at: number; promise: Promise<Notifications.NotificationRequest[]> } | null = null;

/** How long one read keeps serving the families of the same wave. */
const READ_REUSE_MS = 2000;

const NOTHING_ARMED = '[]';

function planSignature(slots: readonly FamilySlot[]): string {
  // `Date` serialises as its UTC instant, so a time-zone change that moves a
  // "07:00 local" slot produces a different plan.
  return JSON.stringify(slots.map(slot => [slot.identifier, slot.content, slot.trigger]));
}

function serially<T>(prefix: string, work: () => Promise<T>): Promise<T> {
  const result = (queues.get(prefix) ?? Promise.resolve()).then(work);
  queues.set(prefix, result.then(() => undefined, () => undefined));
  return result;
}

function wrote(prefix: string): void {
  clock += 1;
  lastWrite.set(prefix, clock);
}

/** The pending list, never one that predates this family's own last write. */
function readPending(prefix: string): Promise<Notifications.NotificationRequest[]> {
  const now = Date.now();
  if (lastRead && lastRead.startedAt >= (lastWrite.get(prefix) ?? 0) && now - lastRead.at < READ_REUSE_MS) {
    return lastRead.promise;
  }
  const read = { startedAt: clock, at: now, promise: Notifications.getAllScheduledNotificationsAsync() };
  lastRead = read;
  // A failed read is never handed to a later caller.
  read.promise.catch(() => { if (lastRead === read) lastRead = null; });
  return read.promise;
}

/**
 * Make the OS hold exactly `slots` for the family owning `prefix`. Returns how
 * many slots are scheduled. A slot that fails to schedule is skipped (and the
 * plan is then not remembered, so the next call tries again).
 */
export function armNotificationFamily(prefix: string, slots: readonly FamilySlot[]): Promise<number> {
  return serially(prefix, async () => {
    const signature = planSignature(slots);
    if (armed.get(prefix) === signature) return slots.length;
    armed.delete(prefix);

    const wanted = new Set(slots.map(slot => slot.identifier));
    const pending = await readPending(prefix);
    wrote(prefix);
    try {
      await Promise.all(
        pending
          .filter(n => n.identifier.startsWith(prefix) && !wanted.has(n.identifier))
          .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
      let scheduled = 0;
      for (const slot of slots) {
        try {
          await Notifications.scheduleNotificationAsync(slot);
          scheduled += 1;
        } catch {
          // Per-slot scheduling failure is non-fatal.
        }
      }
      if (scheduled === slots.length) armed.set(prefix, signature);
      return scheduled;
    } finally {
      wrote(prefix);
    }
  });
}

/** Cancel every pending notification the family owns, leaving the others untouched. */
export function cancelNotificationFamily(prefix: string): Promise<void> {
  return serially(prefix, async () => {
    if (armed.get(prefix) === NOTHING_ARMED) return;
    armed.delete(prefix);
    const pending = await readPending(prefix);
    wrote(prefix);
    try {
      await Promise.all(
        pending
          .filter(n => n.identifier.startsWith(prefix))
          .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
      armed.set(prefix, NOTHING_ARMED);
    } finally {
      wrote(prefix);
    }
  });
}

/** Test seam — model a new app process. */
export function resetNotificationFamiliesForTests(): void {
  armed.clear();
  queues.clear();
  lastWrite.clear();
  clock = 0;
  lastRead = null;
}

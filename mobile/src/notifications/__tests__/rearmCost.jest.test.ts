/**
 * What a day of ordinary use costs in native notification calls.
 *
 * The real scheduler glue for three always-on families (daily verse, festive,
 * return ladder) runs against a stateful stand-in for the OS queue. A "process"
 * is a fresh module registry, so nothing in here depends on test-only seams and
 * the same file measures any revision of the schedulers:
 *
 *   PERF_REPORT=1 npx jest src/notifications/__tests__/rearmCost.jest.test.ts
 *
 * prints the table. Every native call counted here is a SharedPreferences write
 * and/or an AlarmManager call on Android (ANR audit §3 #6), which is why the
 * budgets below are assertions and not just a report.
 */
type Pending = { identifier: string; content: unknown; trigger: unknown };
const mockOs = { pending: new Map<string, Pending>(), reads: 0, cancels: 0, schedules: 0 };

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(async () => { mockOs.reads += 1; return [...mockOs.pending.values()]; }),
  cancelScheduledNotificationAsync: jest.fn(async (identifier: string) => { mockOs.cancels += 1; mockOs.pending.delete(identifier); }),
  scheduleNotificationAsync: jest.fn(async (request: Pending) => { mockOs.schedules += 1; mockOs.pending.set(request.identifier, request); return request.identifier; }),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { DEFAULT: 3 },
}));

type Cost = { reads: number; cancels: number; schedules: number };
const festivals = (year: number) => [
  { ruleId: 'diwali', nameHi: 'दीपावली', nameEn: 'Diwali', occurrences: [new Date(year, 10, 8)], entry: { ruleId: 'diwali', sourceId: 'mahalakshmi-ashtakam', greetingHi: 'शुभ दीपावली', greetingEn: 'Happy Diwali', inviteHi: 'पाठ करें।', inviteEn: 'Read.' } },
  { ruleId: 'holi', nameHi: 'होली', nameEn: 'Holi', occurrences: [new Date(year, 8, 2)], entry: { ruleId: 'holi', sourceId: 'mahalakshmi-ashtakam', greetingHi: 'शुभ होली', greetingEn: 'Happy Holi', inviteHi: 'पाठ करें।', inviteEn: 'Read.' } },
];

/** One "app open": every always-on family arms, as the headless schedulers do. */
async function open(now: Date): Promise<Cost> {
  const before = { reads: mockOs.reads, cancels: mockOs.cancels, schedules: mockOs.schedules };
  const { scheduleDailyVerseRollingWindow } = require('@/notifications/scheduler') as typeof import('@/notifications/scheduler');
  const { scheduleFestiveReminders } = require('@/notifications/festiveScheduler') as typeof import('@/notifications/festiveScheduler');
  const { scheduleReturnReminders } = require('@/notifications/returnScheduler') as typeof import('@/notifications/returnScheduler');
  await Promise.all([
    scheduleDailyVerseRollingWindow({ enabled: true, times: [{ hour: 7, minute: 0 }] }, now, 'hi'),
    scheduleFestiveReminders(festivals(now.getFullYear()) as never, now, 'hi'),
    scheduleReturnReminders(now, 'hi'),
  ]);
  return { reads: mockOs.reads - before.reads, cancels: mockOs.cancels - before.cancels, schedules: mockOs.schedules - before.schedules };
}
/** Kill the process; the OS queue survives. */
const coldStart = (now: Date) => { jest.resetModules(); return open(now); };
const total = (cost: Cost) => cost.reads + cost.cancels + cost.schedules;

test('a day of opens: one full arm per process, nothing for an unchanged plan', async () => {
  const morning = new Date(2026, 7, 7, 9, 0, 0, 0);
  const firstInstall = await coldStart(morning);
  const held = mockOs.pending.size;
  const relaunch = await coldStart(new Date(2026, 7, 7, 9, 30));
  const afterShare = await open(new Date(2026, 7, 7, 9, 31));
  const afterShareAgain = await open(new Date(2026, 7, 7, 13, 0));
  const nextMorning = await open(new Date(2026, 7, 8, 9, 0));

  if (process.env.PERF_REPORT) {
    // eslint-disable-next-line no-console
    console.log(`REARM_COST ${JSON.stringify({ held, firstInstall, relaunch, afterShare, afterShareAgain, nextMorning })}`);
  }

  // Whatever it costs, the queue must hold the same notifications as before.
  expect(held).toBeGreaterThanOrEqual(30 + 2 + 5);
  expect(mockOs.pending.size).toBe(held);

  // A relaunch re-registers every slot (it has to: see `familyArm`), but with
  // one shared read and without first cancelling what it is about to schedule.
  expect(relaunch).toEqual({ reads: 1, cancels: 0, schedules: held });
  // Returning to the app with nothing changed is free.
  expect(total(afterShare)).toBe(0);
  expect(total(afterShareAgain)).toBe(0);
  // A new day rolls the windows: only the slots that left the plan are
  // cancelled, and only the families whose plan changed are armed.
  expect(nextMorning.cancels).toBeLessThanOrEqual(6);
  expect(nextMorning.schedules).toBeLessThanOrEqual(held);
});

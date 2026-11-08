import { localDay, reminderDue, type LaunchAskRecord } from '../launchAskStore';
const date = (d: number) => new Date(2026, 9, d, 12);
const record: LaunchAskRecord = {
  firstDay: '2026-10-01',
  lastDay: '2026-10-01',
  declines: 1,
  stopped: false,
};
test('local civil day is independent of UTC conversion', () =>
  expect(localDay(date(3))).toBe('2026-10-03'));
test('reminders rest for two days, then three, then weekly', () => {
  expect(reminderDue(record, date(2))).toBe(false);
  expect(reminderDue(record, date(3))).toBe(true);
  expect(reminderDue({ ...record, declines: 3 }, date(3))).toBe(false);
  expect(reminderDue({ ...record, declines: 3 }, date(4))).toBe(true);
  expect(reminderDue({ ...record, declines: 4 }, date(7))).toBe(false);
  expect(reminderDue({ ...record, declines: 4 }, date(8))).toBe(true);
});
test('stop and same-day asks suppress re-asks', () => {
  expect(reminderDue({ ...record, stopped: true }, date(30))).toBe(false);
  expect(reminderDue(record, date(1))).toBe(false);
});
test('widget and Explore days do not move the reminder cadence', () => {
  const afterOtherPrompt = { ...record, lastDay: '2026-10-02', lastReminderDay: '2026-10-01' };
  expect(reminderDue(afterOtherPrompt, date(3))).toBe(true);
  expect(reminderDue({ ...afterOtherPrompt, lastReminderDay: null }, date(3))).toBe(true);
  expect(reminderDue({ ...afterOtherPrompt, lastDay: '2026-10-03' }, date(3))).toBe(false);
});

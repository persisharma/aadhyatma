import * as Notifications from 'expo-notifications';
import {
  cancelAllPitruSmaranReminders,
  schedulePitruSmaranReminders,
} from '../pitruSmaranScheduler';
import {
  cancelAllPitruPakshaReminders,
  schedulePitruPakshaReminders,
} from '../pitruPakshaScheduler';
import { PITRU_SMARAN_NOTIF_PREFIX } from '../pitruSmaranReminderPure';
import { PITRU_PAKSHA_NOTIF_PREFIX } from '../pitruPakshaReminderPure';

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { DEFAULT: 3 },
}));

const pending = Notifications.getAllScheduledNotificationsAsync as jest.Mock;
const cancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const schedule = Notifications.scheduleNotificationAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  pending.mockResolvedValue([]);
  cancel.mockResolvedValue(undefined);
  schedule.mockResolvedValue('scheduled');
});

test('personal scheduler creates two private payloads with the opted-in entry id', async () => {
  const count = await schedulePitruSmaranReminders([{
    entryId: 'father',
    displayNameHi: 'पिताजी',
    displayNameEn: 'Father',
    tithiHi: 'माघ कृष्ण अष्टमी',
    tithiEn: 'Magha Krishna Ashtami',
    nextDate: new Date(2026, 7, 20),
  }], new Date(2026, 7, 1), 'hi');
  expect(count).toBe(2);
  expect(schedule).toHaveBeenCalledTimes(2);
  expect(schedule.mock.calls[0][0].content.data).toMatchObject({
    type: 'pitru-smaran-reminder', entryId: 'father', kind: 'advance', occurrenceDateKey: '2026-08-20',
  });
  expect(schedule.mock.calls[0][0].content.body).toContain('पिताजी');
  expect(schedule.mock.calls[1][0].content.data.kind).toBe('dayOf');
});

test('public season scheduler creates two person-free payloads opening the overview', async () => {
  const count = await schedulePitruPakshaReminders([{
    year: 2026,
    window: { purnima: new Date(2026, 8, 26), start: new Date(2026, 8, 27), end: new Date(2026, 9, 10) },
  }], new Date(2026, 7, 1), 'hi');
  expect(count).toBe(2);
  expect(schedule).toHaveBeenCalledTimes(2);
  for (const [request] of schedule.mock.calls) {
    expect(request.content.data).toMatchObject({ type: 'pitru-paksha-reminder', year: 2026 });
    expect(`${request.content.title} ${request.content.body}`).not.toMatch(/पिताजी|माताजी|Father|Mother/);
  }
});

test('each cancellation function removes only its own notification family', async () => {
  pending.mockResolvedValue([
    { identifier: `${PITRU_SMARAN_NOTIF_PREFIX}:father:advance:2026-08-20` },
    { identifier: `${PITRU_PAKSHA_NOTIF_PREFIX}:2026:seasonStart` },
    { identifier: 'daily-verse:2026-08-20:0700' },
  ]);
  await cancelAllPitruSmaranReminders();
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(cancel).toHaveBeenCalledWith(`${PITRU_SMARAN_NOTIF_PREFIX}:father:advance:2026-08-20`);
  cancel.mockClear();
  await cancelAllPitruPakshaReminders();
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(cancel).toHaveBeenCalledWith(`${PITRU_PAKSHA_NOTIF_PREFIX}:2026:seasonStart`);
});

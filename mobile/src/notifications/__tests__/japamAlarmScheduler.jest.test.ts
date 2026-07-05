import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  firedOnceAlarmIds,
  maybeHandleJapamSnoozeResponse,
  scheduleJapamAlarms,
  cancelAllJapamAlarmNotifications,
} from '@/notifications/japamAlarmScheduler';
import {
  JAPAM_ALARM_CATEGORY,
  JAPAM_SNOOZE_ACTION_ID,
  SNOOZE_MINUTES,
  type JapamAlarm,
} from '@/notifications/japamAlarms';

// This suite exercises the expo-notifications fallback tier (Expo Go /
// iOS < 26 / Android builds without the native module): trigger shapes per
// repeat kind, the snooze action, and the once-armed bookkeeping.

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationCategoryAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DAILY: 'daily', WEEKLY: 'weekly', DATE: 'date' },
  AndroidImportance: { HIGH: 4 },
}));

// Force the fallback path: the native module is "not bound".
jest.mock('@/notifications/japamAlarmNative', () => ({
  isNativeAlarmSupported: jest.fn(() => false),
  cancelAllNativeAlarms: jest.fn(),
  scheduleNativeAlarmsForDay: jest.fn(),
}));

jest.mock('@/data/japam', () => ({
  findJapamMantra: jest.fn(() => ({
    id: 'om-namah-shivaya',
    nameHi: 'ॐ नमः शिवाय',
    nameEn: 'Om Namah Shivaya',
  })),
}));

const mockGetPending = Notifications.getAllScheduledNotificationsAsync as jest.Mock;
const mockCancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockGetPending.mockResolvedValue([]);
  mockCancel.mockResolvedValue(undefined);
  mockSchedule.mockResolvedValue('ok');
});

const alarm = (id: string, extra: Partial<JapamAlarm> = {}): JapamAlarm => ({
  id,
  mantraId: 'om-namah-shivaya',
  time: { hour: 6, minute: 30 },
  enabled: true,
  ...extra,
});

const tomorrowKey = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

describe('scheduleJapamAlarms — expo fallback trigger shapes', () => {
  test('daily alarm → single DAILY trigger with the snooze category attached', async () => {
    const n = await scheduleJapamAlarms([alarm('a1')]);
    expect(n).toBe(1);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const call = mockSchedule.mock.calls[0][0];
    expect(call.identifier).toBe('japam-alarm:a1');
    expect(call.trigger).toMatchObject({ type: 'daily', hour: 6, minute: 30 });
    expect(call.content.categoryIdentifier).toBe(JAPAM_ALARM_CATEGORY);
    expect(Notifications.setNotificationCategoryAsync).toHaveBeenCalledWith(
      JAPAM_ALARM_CATEGORY,
      expect.arrayContaining([
        expect.objectContaining({ identifier: JAPAM_SNOOZE_ACTION_ID }),
      ])
    );
  });

  test('weekly subset → one WEEKLY trigger per day (expo weekday = getDay + 1)', async () => {
    await scheduleJapamAlarms([alarm('a1', { repeatDays: [1, 3] })]);
    expect(mockSchedule).toHaveBeenCalledTimes(2);
    const calls = mockSchedule.mock.calls.map((c) => c[0]);
    expect(calls[0].identifier).toBe('japam-alarm:a1:d1');
    expect(calls[0].trigger).toMatchObject({ type: 'weekly', weekday: 2, hour: 6, minute: 30 });
    expect(calls[1].identifier).toBe('japam-alarm:a1:d3');
    expect(calls[1].trigger).toMatchObject({ type: 'weekly', weekday: 4 });
  });

  test('one-time alarm → single DATE one-shot, recorded for auto-disable', async () => {
    await scheduleJapamAlarms([alarm('a1', { repeatDays: [] })]);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const call = mockSchedule.mock.calls[0][0];
    expect(call.trigger.type).toBe('date');
    expect(call.trigger.date).toBeGreaterThan(Date.now());
    // Bookkeeping: recorded as armed, but not yet "fired".
    expect(await firedOnceAlarmIds(new Date())).toEqual([]);
    expect(await firedOnceAlarmIds(new Date(call.trigger.date + 1000))).toEqual(['a1']);
  });

  test('pending skip-next → discrete DATE one-shots instead of a repeating trigger', async () => {
    await scheduleJapamAlarms([alarm('a1', { skipNextDate: tomorrowKey() })]);
    expect(mockSchedule).toHaveBeenCalledTimes(3);
    const calls = mockSchedule.mock.calls.map((c) => c[0]);
    expect(calls.every((c) => c.trigger.type === 'date')).toBe(true);
    expect(calls.map((c) => c.identifier)).toEqual([
      'japam-alarm:a1',
      'japam-alarm:a1:occ1',
      'japam-alarm:a1:occ2',
    ]);
  });

  test('disabled alarms schedule nothing', async () => {
    const n = await scheduleJapamAlarms([alarm('a1', { enabled: false })]);
    expect(n).toBe(0);
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});

describe('cancelAllJapamAlarmNotifications', () => {
  test('cancels japam slots but spares in-flight snoozes and other prefixes', async () => {
    mockGetPending.mockResolvedValue([
      { identifier: 'japam-alarm:a1' },
      { identifier: 'japam-alarm:a1:d3' },
      { identifier: 'japam-alarm:a2:snooze' },
      { identifier: 'daily-verse:x' },
    ]);
    await cancelAllJapamAlarmNotifications();
    const cancelled = mockCancel.mock.calls.map((c) => c[0]);
    expect(cancelled).toContain('japam-alarm:a1');
    expect(cancelled).toContain('japam-alarm:a1:d3');
    expect(cancelled).not.toContain('japam-alarm:a2:snooze');
    expect(cancelled).not.toContain('daily-verse:x');
  });
});

describe('maybeHandleJapamSnoozeResponse', () => {
  const response = (actionIdentifier: string, data: unknown) =>
    ({
      actionIdentifier,
      notification: {
        request: {
          identifier: 'japam-alarm:a1',
          content: { title: 'Brahmamuhurta', data },
        },
      },
    }) as unknown as Notifications.NotificationResponse;

  const payload = { type: 'japam-alarm', alarmId: 'a1', mantraId: 'om-namah-shivaya' };

  test('ignores non-snooze actions and foreign payloads', () => {
    expect(maybeHandleJapamSnoozeResponse(response('default', payload))).toBe(false);
    expect(
      maybeHandleJapamSnoozeResponse(
        response(JAPAM_SNOOZE_ACTION_ID, { type: 'daily-verse' })
      )
    ).toBe(false);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  test('snooze action re-arms a one-shot ~SNOOZE_MINUTES out and dismisses', async () => {
    const before = Date.now();
    expect(
      maybeHandleJapamSnoozeResponse(response(JAPAM_SNOOZE_ACTION_ID, payload))
    ).toBe(true);
    // The scheduling is fired-and-forgotten; flush microtasks.
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    const call = mockSchedule.mock.calls[0][0];
    expect(call.identifier).toBe('japam-alarm:a1:snooze');
    expect(call.trigger.type).toBe('date');
    const delta = call.trigger.date - before;
    expect(delta).toBeGreaterThanOrEqual(SNOOZE_MINUTES * 60_000 - 1000);
    expect(delta).toBeLessThanOrEqual(SNOOZE_MINUTES * 60_000 + 5000);
    // Keeps the user's label as the snoozed title.
    expect(call.content.title).toBe('Brahmamuhurta');
    expect(Notifications.dismissNotificationAsync).toHaveBeenCalledWith(
      'japam-alarm:a1'
    );
  });
});

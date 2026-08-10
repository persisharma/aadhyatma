import * as Notifications from 'expo-notifications';
import {
  cancelAllFestiveReminders,
  scheduleFestiveReminders,
  FESTIVE_CHANNEL_ID,
} from '@/notifications/festiveScheduler';
import {
  FESTIVE_NOTIF_PREFIX,
  type FestiveReminderInput,
} from '@/notifications/festiveReminderPure';
import { NOTIF_IDENTIFIER_PREFIX } from '@/notifications/pure';
import { VRAT_NOTIF_PREFIX } from '@/notifications/vratReminderPure';

// The expo-notifications glue around the (separately unit-tested) pure planner:
// cancel/re-arm isolation, payload shape, and the localized content that lands on
// the lock screen.

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { DEFAULT: 3 },
}));

const mockGetPending = Notifications.getAllScheduledNotificationsAsync as jest.Mock;
const mockCancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPending.mockResolvedValue([]);
  mockCancel.mockResolvedValue(undefined);
  mockSchedule.mockResolvedValue('ok');
});

const NOW = new Date(2026, 7, 7, 9, 0, 0, 0);

const diwali: FestiveReminderInput = {
  ruleId: 'diwali',
  nameHi: 'दीपावली',
  nameEn: 'Diwali',
  occurrences: [new Date(2026, 10, 8)],
  entry: {
    ruleId: 'diwali',
    sourceId: 'mahalakshmi-ashtakam',
    greetingHi: 'शुभ दीपावली',
    greetingEn: 'Happy Diwali',
    inviteHi: 'दीप जलाएँ और महालक्ष्म्यष्टकम् का पाठ करें।',
    inviteEn: 'Light a lamp and read the Mahalakshmi Ashtakam.',
  },
};

describe('scheduleFestiveReminders', () => {
  test('schedules one dated notification carrying the content target in its payload', async () => {
    const count = await scheduleFestiveReminders([diwali], NOW, 'hi');

    expect(count).toBe(1);
    expect(mockSchedule).toHaveBeenCalledTimes(1);

    const req = mockSchedule.mock.calls[0][0];
    expect(req.identifier).toBe(`${FESTIVE_NOTIF_PREFIX}:diwali:2026-11-08`);
    expect(req.trigger).toMatchObject({ type: 'date' });
    expect(req.trigger.date.getHours()).toBe(7);
    expect(req.trigger.date.getMinutes()).toBe(30);
    expect(req.content.title).toBe('दीपावली');
    expect(req.content.body).toContain('महालक्ष्म्यष्टकम्');
    expect(req.content.data).toEqual({
      type: 'festive-reminder',
      ruleId: 'diwali',
      // Baked in, so the deep link cannot be re-pointed by a later catalog edit.
      sourceId: 'mahalakshmi-ashtakam',
      occurrenceDateKey: '2026-11-08',
    });
  });

  test('renders the copy in the reader language', async () => {
    await scheduleFestiveReminders([diwali], NOW, 'en');

    const req = mockSchedule.mock.calls[0][0];
    expect(req.content.title).toBe('Diwali');
    expect(req.content.body).toBe(
      'Happy Diwali · Light a lamp and read the Mahalakshmi Ashtakam.'
    );
  });

  test('re-arming cancels only our own slots', async () => {
    mockGetPending.mockResolvedValue([
      { identifier: `${FESTIVE_NOTIF_PREFIX}:diwali:2025-10-20` },
      { identifier: `${NOTIF_IDENTIFIER_PREFIX}:2026-08-08:0700` },
      { identifier: `${VRAT_NOTIF_PREFIX}:nirjala-ekadashi:dayOf:2026-06-20` },
      { identifier: 'japam-alarm:abc' },
    ]);

    await scheduleFestiveReminders([diwali], NOW, 'hi');

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockCancel).toHaveBeenCalledWith(`${FESTIVE_NOTIF_PREFIX}:diwali:2025-10-20`);
  });

  test('cancelAllFestiveReminders leaves other families alone', async () => {
    mockGetPending.mockResolvedValue([
      { identifier: `${FESTIVE_NOTIF_PREFIX}:holi:2027-03-13` },
      { identifier: `${NOTIF_IDENTIFIER_PREFIX}:2026-08-08:0700` },
    ]);

    await cancelAllFestiveReminders();

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockCancel).toHaveBeenCalledWith(`${FESTIVE_NOTIF_PREFIX}:holi:2027-03-13`);
  });

  test('nothing in the window still clears our slots and schedules nothing', async () => {
    mockGetPending.mockResolvedValue([
      { identifier: `${FESTIVE_NOTIF_PREFIX}:diwali:2025-10-20` },
    ]);

    // Occurrence is years out — well past the rolling window.
    const count = await scheduleFestiveReminders(
      [{ ...diwali, occurrences: [new Date(2030, 10, 8)] }],
      NOW,
      'hi'
    );

    expect(count).toBe(0);
    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockCancel).toHaveBeenCalledWith(`${FESTIVE_NOTIF_PREFIX}:diwali:2025-10-20`);
  });

  test('a per-slot scheduling failure is non-fatal', async () => {
    mockSchedule
      .mockRejectedValueOnce(new Error('OS budget full'))
      .mockResolvedValueOnce('ok');

    const holi: FestiveReminderInput = {
      ...diwali,
      ruleId: 'holi',
      nameHi: 'होली',
      nameEn: 'Holi',
      occurrences: [new Date(2026, 8, 2)],
      entry: { ...diwali.entry, ruleId: 'holi' },
    };

    // Holi (Sep) sorts before Diwali (Nov), so the rejection hits Holi's slot.
    const count = await scheduleFestiveReminders([diwali, holi], NOW, 'hi');

    expect(count).toBe(1);
    expect(mockSchedule).toHaveBeenCalledTimes(2);
  });

  test('does not create an Android channel on iOS', async () => {
    // Platform.OS is 'ios' under the react-native Jest preset.
    await scheduleFestiveReminders([diwali], NOW, 'hi');

    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
    expect(mockSchedule.mock.calls[0][0].trigger.channelId).toBeUndefined();
    // The id still has to exist for the Android path to reference.
    expect(FESTIVE_CHANNEL_ID).toBe('festive-reminders');
  });
});

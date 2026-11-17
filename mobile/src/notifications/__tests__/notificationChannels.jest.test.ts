import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetNotificationFamiliesForTests } from '@/notifications/familyArm';
import {
  ensureFamilyChannel,
  FAMILY_CHANNEL_IDS,
  LEGACY_CHANNEL_RETIRED_KEY,
  LEGACY_SHARED_CHANNEL_ID,
  markFamilySettled,
  resetNotificationChannelsForTests,
  type ChannelFamily,
} from '@/notifications/notificationChannels';
import { scheduleVratReminders } from '@/notifications/vratScheduler';
import { VRAT_NOTIF_PREFIX } from '@/notifications/vratReminderPure';

// BEH-15: per-family Android channels, re-arm onto them, and retire the old
// shared channel only once every family has moved.

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  deleteNotificationChannelAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { DEFAULT: 3 },
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));

const mockGetPending = Notifications.getAllScheduledNotificationsAsync as jest.Mock;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
const mockSetChannel = Notifications.setNotificationChannelAsync as jest.Mock;
const mockDeleteChannel = Notifications.deleteNotificationChannelAsync as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

const FAMILIES = Object.keys(FAMILY_CHANNEL_IDS) as ChannelFamily[];
const realOS = Platform.OS;

beforeEach(() => {
  jest.clearAllMocks();
  resetNotificationFamiliesForTests();
  resetNotificationChannelsForTests();
  mockGetPending.mockResolvedValue([]);
  mockSchedule.mockResolvedValue('ok');
  mockSetChannel.mockResolvedValue(undefined);
  mockDeleteChannel.mockResolvedValue(undefined);
  (Platform as { OS: string }).OS = 'android';
});
afterAll(() => {
  (Platform as { OS: string }).OS = realOS;
});

const flush = () => new Promise((r) => setImmediate(r));

describe('per-family channels', () => {
  test('every family has its own new id, none equal to the legacy shared channel', () => {
    const ids = FAMILIES.map((f) => FAMILY_CHANNEL_IDS[f]);
    expect(new Set(ids).size).toBe(FAMILIES.length);
    expect(ids).not.toContain(LEGACY_SHARED_CHANNEL_ID);
  });

  test('names and descriptions follow the reading language; a language change renames in place', async () => {
    await ensureFamilyChannel('vrat', 'en');
    expect(mockSetChannel.mock.calls[0][0]).toBe('vrat-reminders');
    expect(mockSetChannel.mock.calls[0][1].name).toBe('Vrat reminders');
    await ensureFamilyChannel('vrat', 'en');
    expect(mockSetChannel).toHaveBeenCalledTimes(1); // cached for the same language
    await ensureFamilyChannel('vrat', 'gu');
    expect(mockSetChannel).toHaveBeenCalledTimes(2);
    const gu = mockSetChannel.mock.calls[1][1];
    expect(gu.name + gu.description).toMatch(/[઀-૿]/);
    expect(gu.name + gu.description).not.toMatch(/[ऀ-ॿ]/);
  });

  test('a failed creation returns undefined so the notice still goes out on the fallback channel', async () => {
    mockSetChannel.mockRejectedValue(new Error('boom'));
    expect(await ensureFamilyChannel('routine', 'hi')).toBeUndefined();
  });

  test('no channel work off Android', async () => {
    (Platform as { OS: string }).OS = 'ios';
    expect(await ensureFamilyChannel('vrat', 'hi')).toBeUndefined();
    expect(mockSetChannel).not.toHaveBeenCalled();
  });

  test('re-arming vrat reminders puts every slot on the new channel', async () => {
    const now = new Date(2026, 6, 1, 9, 0);
    const count = await scheduleVratReminders(
      [
        {
          ruleId: 'ekadashi',
          order: 0,
          nameHi: 'एकादशी',
          nameEn: 'Ekadashi',
          nextDate: new Date(2026, 6, 6),
          pref: { advanceDays: 1, dayOf: true, dayOfTime: { hour: 7, minute: 0 } },
        },
      ],
      now,
      'en'
    );
    expect(count).toBe(2);
    for (const call of mockSchedule.mock.calls) {
      expect(call[0].trigger.channelId).toBe('vrat-reminders');
      expect(call[0].identifier.startsWith(VRAT_NOTIF_PREFIX)).toBe(true);
    }
    expect(mockSchedule.mock.calls[0][0].content.body).toMatch(/Ekadashi (today|tomorrow)/);
  });
});

describe('retiring the legacy shared channel', () => {
  test('is deleted only after all five families have settled, then recorded', async () => {
    for (const f of FAMILIES.slice(0, 4)) markFamilySettled(f);
    await flush();
    expect(mockDeleteChannel).not.toHaveBeenCalled();

    markFamilySettled(FAMILIES[4]);
    await flush();
    expect(mockDeleteChannel).toHaveBeenCalledTimes(1);
    expect(mockDeleteChannel).toHaveBeenCalledWith(LEGACY_SHARED_CHANNEL_ID);
    expect(mockSetItem).toHaveBeenCalledWith(LEGACY_CHANNEL_RETIRED_KEY, '1');
  });

  test('is kept when any family had to fall back from its own channel', async () => {
    mockSetChannel.mockRejectedValueOnce(new Error('boom'));
    await ensureFamilyChannel('sadhana', 'hi');
    for (const f of FAMILIES) markFamilySettled(f);
    await flush();
    expect(mockDeleteChannel).not.toHaveBeenCalled();
  });

  test('a failed delete is not recorded as retired', async () => {
    mockDeleteChannel.mockRejectedValueOnce(new Error('boom'));
    for (const f of FAMILIES) markFamilySettled(f);
    await flush();
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});

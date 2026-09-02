import React from 'react';
import { Platform } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  isIosNativeAlarmSupported,
  requestIosAlarmPermission,
  getIosAlarmAuthorizationStatus,
} from '@/notifications/japamAlarmNative';
import { firedOnceAlarmIds } from '@/notifications/japamAlarmScheduler';
import { localDateKey } from '@/notifications/japamAlarms';
import { JapamAlarmsProvider, useJapamAlarms } from '../JapamAlarmsContext';

// iOS is the platform under test: on iOS 26 the scheduler routes Japam alarms
// through the AlarmKit native module, so the permission the user must grant is
// AlarmKit authorisation — NOT expo-notifications. These tests pin that down.
// (The RN jest preset defaults Platform.OS to 'ios'; set it explicitly so the
// intent is clear and the suite is robust to preset changes.)
Platform.OS = 'ios';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

// The reconcile effect calls into the scheduler — stub it so these tests stay
// about permission logic only.
jest.mock('@/notifications/japamAlarmScheduler', () => ({
  scheduleJapamAlarms: jest.fn().mockResolvedValue(0),
  cancelAllJapamAlarmNotifications: jest.fn().mockResolvedValue(undefined),
  firedOnceAlarmIds: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/notifications/japamAlarmNative', () => ({
  isIosNativeAlarmSupported: jest.fn(),
  requestIosAlarmPermission: jest.fn(),
  getIosAlarmAuthorizationStatus: jest.fn(),
}));

const mockIsIosNative = isIosNativeAlarmSupported as jest.Mock;
const mockRequestAlarmKit = requestIosAlarmPermission as jest.Mock;
const mockGetAlarmKitStatus = getIosAlarmAuthorizationStatus as jest.Mock;
const mockGetNotifPerms = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestNotifPerms = Notifications.requestPermissionsAsync as jest.Mock;

type Ctx = ReturnType<typeof useJapamAlarms>;
let captured!: Ctx;
function Probe() {
  captured = useJapamAlarms();
  return null;
}

async function flush() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  });
}

async function mountAndHydrate(): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <JapamAlarmsProvider>
        <Probe />
      </JapamAlarmsProvider>
    );
  });
  await flush();
  return tree;
}

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  // Sensible defaults; individual tests override.
  mockIsIosNative.mockReturnValue(false);
  mockRequestAlarmKit.mockResolvedValue(false);
  mockGetAlarmKitStatus.mockResolvedValue('undetermined');
  mockGetNotifPerms.mockResolvedValue({ status: 'undetermined' });
  mockRequestNotifPerms.mockResolvedValue({ status: 'undetermined' });
  (firedOnceAlarmIds as jest.Mock).mockResolvedValue([]);
});

describe('JapamAlarmsContext permission — iOS AlarmKit', () => {
  test('requestPermission asks AlarmKit (not expo-notifications) when the native iOS module is available', async () => {
    mockIsIosNative.mockReturnValue(true);
    mockRequestAlarmKit.mockResolvedValue(true);
    await mountAndHydrate();

    let result: string | undefined;
    await act(async () => {
      result = await captured.requestPermission();
    });

    expect(result).toBe('granted');
    expect(captured.permissionStatus).toBe('granted');
    expect(mockRequestAlarmKit).toHaveBeenCalledTimes(1);
    expect(mockRequestNotifPerms).not.toHaveBeenCalled();
  });

  test('requestPermission reports denied when the user refuses the AlarmKit prompt', async () => {
    mockIsIosNative.mockReturnValue(true);
    mockRequestAlarmKit.mockResolvedValue(false);
    await mountAndHydrate();

    let result: string | undefined;
    await act(async () => {
      result = await captured.requestPermission();
    });

    expect(result).toBe('denied');
    expect(captured.permissionStatus).toBe('denied');
  });

  test('requestPermission falls back to expo-notifications when the native module is absent', async () => {
    mockIsIosNative.mockReturnValue(false);
    mockRequestNotifPerms.mockResolvedValue({ status: 'granted' });
    await mountAndHydrate();

    let result: string | undefined;
    await act(async () => {
      result = await captured.requestPermission();
    });

    expect(result).toBe('granted');
    expect(mockRequestNotifPerms).toHaveBeenCalledTimes(1);
    expect(mockRequestAlarmKit).not.toHaveBeenCalled();
  });

  test('initial status reads AlarmKit authorisation (not notification status) on the native iOS path', async () => {
    mockIsIosNative.mockReturnValue(true);
    mockGetAlarmKitStatus.mockResolvedValue('granted');
    // Notification status is deliberately different to prove it is NOT consulted.
    mockGetNotifPerms.mockResolvedValue({ status: 'denied' });

    await mountAndHydrate();

    expect(captured.permissionStatus).toBe('granted');
    expect(mockGetAlarmKitStatus).toHaveBeenCalled();
    expect(mockGetNotifPerms).not.toHaveBeenCalled();
  });
});

describe('JapamAlarmsContext permission-gated mutations', () => {
  const STORAGE_KEY = '@vedansh/japam-alarms';

  test.each(['denied', 'undetermined'] as const)(
    'does not create an enabled alarm when permission resolves as %s',
    async (status) => {
      mockRequestNotifPerms.mockResolvedValue({ status });
      await mountAndHydrate();

      let result: Awaited<ReturnType<Ctx['addAlarm']>> | undefined;
      await act(async () => {
        result = await captured.addAlarm({
          mantraId: 'om-namah-shivaya',
          time: { hour: 6, minute: 0 },
        });
      });

      expect(result).toBeNull();
      expect(captured.alarms).toEqual([]);
      expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
    }
  );

  test('keeps a disabled alarm off when an enable request is refused', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'disabled-alarm',
          mantraId: 'om-namah-shivaya',
          time: { hour: 6, minute: 0 },
          enabled: false,
        },
      ])
    );
    mockRequestNotifPerms.mockResolvedValue({ status: 'denied' });
    await mountAndHydrate();

    await act(async () => {
      await captured.toggleAlarm('disabled-alarm', true);
    });

    expect(captured.alarms[0].enabled).toBe(false);
    expect(mockRequestNotifPerms).toHaveBeenCalledTimes(1);
    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!)[0].enabled).toBe(false);
  });
});

describe('JapamAlarmsContext — repeat days, skip-next, one-time housekeeping', () => {
  const STORAGE_KEY = '@vedansh/japam-alarms';

  beforeEach(() => {
    mockRequestNotifPerms.mockResolvedValue({ status: 'granted' });
  });

  test('addAlarm normalizes repeat days; all-seven is stored as daily (no field)', async () => {
    await mountAndHydrate();

    await act(async () => {
      await captured.addAlarm({
        mantraId: 'om-namah-shivaya',
        time: { hour: 6, minute: 0 },
        repeatDays: [5, 1, 3],
      });
      await captured.addAlarm({
        mantraId: 'om-namah-shivaya',
        time: { hour: 7, minute: 0 },
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
      });
      await captured.addAlarm({
        mantraId: 'om-namah-shivaya',
        time: { hour: 8, minute: 0 },
        repeatDays: [],
      });
    });

    expect(captured.alarms).toHaveLength(3);
    expect(captured.alarms[0].repeatDays).toEqual([1, 3, 5]);
    expect(captured.alarms[1].repeatDays).toBeUndefined();
    expect(captured.alarms[2].repeatDays).toEqual([]);
  });

  test('updateAlarm sets skip-next; a later time change clears it', async () => {
    await mountAndHydrate();
    let id = '';
    await act(async () => {
      const a = await captured.addAlarm({
        mantraId: 'om-namah-shivaya',
        time: { hour: 6, minute: 0 },
      });
      id = a!.id;
    });

    await act(async () => {
      await captured.updateAlarm(id, { skipNextDate: '2099-01-01' });
    });
    expect(captured.alarms[0].skipNextDate).toBe('2099-01-01');

    // Changing the time redefines "next" — the old skip no longer applies.
    await act(async () => {
      await captured.updateAlarm(id, { time: { hour: 7, minute: 15 } });
    });
    expect(captured.alarms[0].time).toEqual({ hour: 7, minute: 15 });
    expect(captured.alarms[0].skipNextDate).toBeUndefined();

    // repeatDays: null clears back to daily.
    await act(async () => {
      await captured.updateAlarm(id, { repeatDays: [2, 4] });
    });
    expect(captured.alarms[0].repeatDays).toEqual([2, 4]);
    await act(async () => {
      await captured.updateAlarm(id, { repeatDays: null });
    });
    expect(captured.alarms[0].repeatDays).toBeUndefined();
  });

  test('housekeeping drops a stale skip date and auto-disables fired one-time alarms', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'stale-skip',
          mantraId: 'om-namah-shivaya',
          time: { hour: 6, minute: 0 },
          enabled: true,
          skipNextDate: localDateKey(yesterday),
        },
        {
          id: 'fired-once',
          mantraId: 'om-namah-shivaya',
          time: { hour: 7, minute: 0 },
          enabled: true,
          repeatDays: [],
        },
      ])
    );
    (firedOnceAlarmIds as jest.Mock).mockResolvedValue(['fired-once']);

    await mountAndHydrate();
    await flush();

    const staleSkip = captured.alarms.find((a) => a.id === 'stale-skip')!;
    expect(staleSkip.skipNextDate).toBeUndefined();
    expect(staleSkip.enabled).toBe(true);

    const firedOnce = captured.alarms.find((a) => a.id === 'fired-once')!;
    expect(firedOnce.enabled).toBe(false);
  });

  test('a pending (today-or-future) skip date survives housekeeping', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'pending-skip',
          mantraId: 'om-namah-shivaya',
          time: { hour: 6, minute: 0 },
          enabled: true,
          skipNextDate: localDateKey(tomorrow),
        },
      ])
    );

    await mountAndHydrate();
    await flush();

    expect(captured.alarms[0].skipNextDate).toBe(localDateKey(tomorrow));
  });
});

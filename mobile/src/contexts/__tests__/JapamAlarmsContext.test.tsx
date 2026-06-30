import React from 'react';
import { Platform } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import * as Notifications from 'expo-notifications';
import {
  isIosNativeAlarmSupported,
  requestIosAlarmPermission,
  getIosAlarmAuthorizationStatus,
} from '@/notifications/japamAlarmNative';
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

beforeEach(() => {
  jest.clearAllMocks();
  // Sensible defaults; individual tests override.
  mockIsIosNative.mockReturnValue(false);
  mockRequestAlarmKit.mockResolvedValue(false);
  mockGetAlarmKitStatus.mockResolvedValue('undetermined');
  mockGetNotifPerms.mockResolvedValue({ status: 'undetermined' });
  mockRequestNotifPerms.mockResolvedValue({ status: 'undetermined' });
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

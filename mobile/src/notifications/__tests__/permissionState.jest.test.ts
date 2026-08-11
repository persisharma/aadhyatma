import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  NOTIF_PROMPTED_KEY,
  hasPromptedForNotifications,
  readNotificationPermissionState,
  requestNotificationPermission,
  resolveNotificationPermission,
} from '../permissionState';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

const mockGet = Notifications.getPermissionsAsync as unknown as jest.Mock;
const mockRequest = Notifications.requestPermissionsAsync as unknown as jest.Mock;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

describe('resolveNotificationPermission', () => {
  test('Android fresh install (denied + askable, never asked) reads as undetermined', () => {
    // expo-notifications derives the Android status from
    // areNotificationsEnabled(), so a POST_NOTIFICATIONS the app has never
    // requested comes back `denied`. Treating that as a refusal is the bug.
    expect(
      resolveNotificationPermission({ status: 'denied', canAskAgain: true }, false)
    ).toEqual({ status: 'undetermined', canAskAgain: true });
  });

  test('the same response after we have asked is a real denial', () => {
    expect(
      resolveNotificationPermission({ status: 'denied', canAskAgain: true }, true)
    ).toEqual({ status: 'denied', canAskAgain: true });
  });

  test('canAskAgain=false is a hard denial even before we ever asked', () => {
    // Android < 13 (no runtime prompt, notifications switched off in Settings)
    // and iOS after a refusal both land here.
    expect(
      resolveNotificationPermission({ status: 'denied', canAskAgain: false }, false)
    ).toEqual({ status: 'denied', canAskAgain: false });
  });

  test('granted stays granted', () => {
    expect(
      resolveNotificationPermission({ status: 'granted', canAskAgain: false }, true)
    ).toEqual({ status: 'granted', canAskAgain: true });
  });

  test("iOS' pre-ask undetermined is preserved", () => {
    expect(
      resolveNotificationPermission({ status: 'undetermined', canAskAgain: true }, false)
    ).toEqual({ status: 'undetermined', canAskAgain: true });
  });

  test('a missing or unreadable response is undetermined, not denied', () => {
    expect(resolveNotificationPermission(null, true)).toEqual({
      status: 'undetermined',
      canAskAgain: true,
    });
  });
});

describe('readNotificationPermissionState', () => {
  test('folds the stored "we asked" flag into the status', async () => {
    mockGet.mockResolvedValue({ status: 'denied', canAskAgain: true });

    expect(await readNotificationPermissionState()).toEqual({
      status: 'undetermined',
      canAskAgain: true,
    });

    await AsyncStorage.setItem(NOTIF_PROMPTED_KEY, '1');

    expect(await readNotificationPermissionState()).toEqual({
      status: 'denied',
      canAskAgain: true,
    });
  });

  test('a throwing native call degrades to undetermined', async () => {
    mockGet.mockRejectedValue(new Error('no module'));
    expect(await readNotificationPermissionState()).toEqual({
      status: 'undetermined',
      canAskAgain: true,
    });
  });
});

describe('requestNotificationPermission', () => {
  test('records the ask so a later denial is understood as a refusal', async () => {
    mockRequest.mockResolvedValue({ status: 'denied', canAskAgain: true });

    expect(await requestNotificationPermission()).toEqual({
      status: 'denied',
      canAskAgain: true,
    });
    expect(await hasPromptedForNotifications()).toBe(true);
  });

  test('does not burn the first ask when the native call throws', async () => {
    mockRequest.mockRejectedValue(new Error('no module'));

    expect(await requestNotificationPermission()).toEqual({
      status: 'undetermined',
      canAskAgain: true,
    });
    expect(await hasPromptedForNotifications()).toBe(false);
  });

  test('passes iOS options through to expo', async () => {
    mockRequest.mockResolvedValue({ status: 'granted', canAskAgain: false });
    await requestNotificationPermission({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    expect(mockRequest).toHaveBeenCalledWith({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
  });
});

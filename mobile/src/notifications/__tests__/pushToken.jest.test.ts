import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  __resetPushTokenSyncState,
  getCapturedPushToken,
  getInstallId,
  syncPushToken,
} from '../pushToken';
import {
  INSTALL_ID_KEY,
  PUSH_TOKEN_KEY,
  PUSH_TOKEN_SYNC_KEY,
  isUsableInstallId,
} from '../pushTokenPure';
import * as permissionState from '../permissionState';

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '11111111-2222-3333-4444-555555555555'),
}));

jest.mock('../permissionState', () => ({
  readNotificationPermissionState: jest.fn(),
  requestNotificationPermission: jest.fn(),
}));

const getToken = Notifications.getExpoPushTokenAsync as unknown as jest.Mock;
const readPermission = permissionState.readNotificationPermissionState as unknown as jest.Mock;
const requestPermission =
  permissionState.requestNotificationPermission as unknown as jest.Mock;

const TOKEN = 'ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]';

beforeEach(async () => {
  jest.clearAllMocks();
  __resetPushTokenSyncState();
  await AsyncStorage.clear();
  // No API key ships configured, so this suite stays capture-only — nothing
  // below should ever reach the network. A spy that fails the test if it is
  // called proves it.
  delete process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY;
  delete process.env.EXPO_PUBLIC_PUSH_REGISTRY_URL;
  readPermission.mockResolvedValue({ status: 'granted', canAskAgain: true });
  getToken.mockResolvedValue({ data: TOKEN });
  (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() => {
    throw new Error('no request may be made while the API key is unset');
  });
});

describe('the device id is captured on open, regardless of permission', () => {
  test('an undetermined permission still captures the install id, without reading a token', async () => {
    readPermission.mockResolvedValue({ status: 'undetermined', canAskAgain: true });
    expect(await syncPushToken()).toEqual({ status: 'captured', token: null });
    // The token needs a grant, so it is never requested here...
    expect(getToken).not.toHaveBeenCalled();
    // ...but the permission-free install id is minted and persisted on open.
    expect(isUsableInstallId(await AsyncStorage.getItem(INSTALL_ID_KEY))).toBe(true);
  });

  test('a refusal still captures the install id too', async () => {
    readPermission.mockResolvedValue({ status: 'denied', canAskAgain: false });
    expect(await syncPushToken()).toEqual({ status: 'captured', token: null });
    expect(getToken).not.toHaveBeenCalled();
    expect(isUsableInstallId(await AsyncStorage.getItem(INSTALL_ID_KEY))).toBe(true);
  });

  test('no path ever raises the OS prompt', async () => {
    // The permission moment belongs to NotificationPreferencesContext and
    // RoutineDetailScreen; this family must only ever ride an existing grant.
    for (const status of ['granted', 'denied', 'undetermined']) {
      readPermission.mockResolvedValue({ status, canAskAgain: true });
      __resetPushTokenSyncState();
      await syncPushToken();
    }
    expect(requestPermission).not.toHaveBeenCalled();
  });
});

describe('capture', () => {
  test('a granted permission captures the install id and the token, with no upload', async () => {
    const result = await syncPushToken();
    expect(result).toEqual({ status: 'captured', token: TOKEN });
    expect(await AsyncStorage.getItem(PUSH_TOKEN_KEY)).toBe(TOKEN);
    expect(await getCapturedPushToken()).toBe(TOKEN);
    expect(isUsableInstallId(await AsyncStorage.getItem(INSTALL_ID_KEY))).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
    // Capture-only ⇒ nothing was registered, so no fingerprint is recorded.
    expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeNull();
  });

  test('the token is requested against the EAS project id', async () => {
    await syncPushToken();
    expect(getToken).toHaveBeenCalledWith({
      projectId: 'c83547c2-423c-4902-9087-a9ec9879a1f9',
    });
  });

  test('a simulator or credential-less build still captures the install id, with no token', async () => {
    getToken.mockRejectedValue(new Error('Must use physical device for push notifications'));
    expect(await syncPushToken()).toEqual({ status: 'captured', token: null });
    expect(await getCapturedPushToken()).toBeNull();
    expect(isUsableInstallId(await AsyncStorage.getItem(INSTALL_ID_KEY))).toBe(true);
  });

  test('an empty token string is treated as no token, but the install id is still captured', async () => {
    getToken.mockResolvedValue({ data: '' });
    expect(await syncPushToken()).toEqual({ status: 'captured', token: null });
    expect(isUsableInstallId(await AsyncStorage.getItem(INSTALL_ID_KEY))).toBe(true);
  });

  test('a storage failure is swallowed — capture still reports the token', async () => {
    // Fail both of this sync's writes (install id, then token) — but with
    // `mockRejectedValueOnce`, NOT `mockRejectedValue`: a persistent rejection
    // on AsyncStorage's shared jest mock would leak into every later test.
    (AsyncStorage.setItem as unknown as jest.Mock)
      .mockRejectedValueOnce(new Error('disk full'))
      .mockRejectedValueOnce(new Error('disk full'));
    expect(await syncPushToken()).toEqual({ status: 'captured', token: TOKEN });
    expect(await getCapturedPushToken()).toBeNull();
  });
});

describe('concurrency', () => {
  test('overlapping calls collapse onto one attempt', async () => {
    const [a, b, c] = await Promise.all([
      syncPushToken(),
      syncPushToken(),
      syncPushToken(),
    ]);
    expect(getToken).toHaveBeenCalledTimes(1);
    expect([a.status, b.status, c.status]).toEqual(['captured', 'captured', 'captured']);
  });

  test('the guard is released, so a later foreground syncs again', async () => {
    await syncPushToken();
    await syncPushToken();
    expect(getToken).toHaveBeenCalledTimes(2);
  });
});

describe('install id', () => {
  test('minted once, permission-free, then read back unchanged', async () => {
    const first = await getInstallId();
    expect(isUsableInstallId(first)).toBe(true);
    expect(first.startsWith('vd-')).toBe(true);
    // A second call never re-mints — the stored id is the point of having one.
    expect(await getInstallId()).toBe(first);
    expect(await AsyncStorage.getItem(INSTALL_ID_KEY)).toBe(first);
  });

  test('a corrupt stored id is replaced rather than reused', async () => {
    await AsyncStorage.setItem(INSTALL_ID_KEY, '  ');
    const minted = await getInstallId();
    expect(isUsableInstallId(minted)).toBe(true);
    expect(minted.startsWith('vd-')).toBe(true);
  });
});

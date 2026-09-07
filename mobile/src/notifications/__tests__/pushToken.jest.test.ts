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
  readPermission.mockResolvedValue({ status: 'granted', canAskAgain: true });
  getToken.mockResolvedValue({ data: TOKEN });
  // No endpoint ships configured, so nothing below should ever reach the
  // network. A spy that fails the test if it is called proves it.
  (global as unknown as { fetch: jest.Mock }).fetch = jest.fn(() => {
    throw new Error('no request may be made while PUSH_REGISTRY_ENDPOINT is unset');
  });
});

describe('permission is never requested, only read', () => {
  test('an undetermined permission stands down without asking for a token', async () => {
    readPermission.mockResolvedValue({ status: 'undetermined', canAskAgain: true });
    expect(await syncPushToken({ lang: 'hi' })).toEqual({ status: 'not-granted', token: null });
    expect(getToken).not.toHaveBeenCalled();
  });

  test('a refusal stands down too', async () => {
    readPermission.mockResolvedValue({ status: 'denied', canAskAgain: false });
    __resetPushTokenSyncState();
    expect((await syncPushToken({ lang: 'hi' })).status).toBe('not-granted');
    expect(getToken).not.toHaveBeenCalled();
  });

  test('no path ever raises the OS prompt', async () => {
    // The permission moment belongs to NotificationPreferencesContext and
    // RoutineDetailScreen; this family must only ever ride an existing grant.
    for (const status of ['granted', 'denied', 'undetermined']) {
      readPermission.mockResolvedValue({ status, canAskAgain: true });
      __resetPushTokenSyncState();
      await syncPushToken({ lang: 'hi' });
    }
    expect(requestPermission).not.toHaveBeenCalled();
  });
});

describe('capture', () => {
  test('a granted permission captures and persists the token, with no upload', async () => {
    const result = await syncPushToken({ lang: 'hi' });
    expect(result).toEqual({ status: 'captured', token: TOKEN });
    expect(await AsyncStorage.getItem(PUSH_TOKEN_KEY)).toBe(TOKEN);
    expect(await getCapturedPushToken()).toBe(TOKEN);
    expect(global.fetch).not.toHaveBeenCalled();
    // No endpoint ⇒ no install id is minted and no fingerprint stored either.
    expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeNull();
  });

  test('the token is requested against the EAS project id', async () => {
    await syncPushToken({ lang: 'hi' });
    expect(getToken).toHaveBeenCalledWith({
      projectId: 'c83547c2-423c-4902-9087-a9ec9879a1f9',
    });
  });

  test('a simulator or credential-less build resolves to no-token, not a throw', async () => {
    getToken.mockRejectedValue(new Error('Must use physical device for push notifications'));
    expect(await syncPushToken({ lang: 'hi' })).toEqual({ status: 'no-token', token: null });
    expect(await getCapturedPushToken()).toBeNull();
  });

  test('an empty token string is treated as no token', async () => {
    getToken.mockResolvedValue({ data: '' });
    expect((await syncPushToken({ lang: 'hi' })).status).toBe('no-token');
  });

  test('a storage failure is swallowed — capture still reports the token', async () => {
    // `mockRejectedValueOnce`, NOT `jest.spyOn(...).mockRestore()`: spying on a
    // function that is already a mock (AsyncStorage's official jest mock is all
    // jest.fn) returns that same mock, and restoring it strips its
    // implementation — which silently turns every later setItem in the file
    // into a no-op.
    (AsyncStorage.setItem as unknown as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
    expect((await syncPushToken({ lang: 'hi' })).status).toBe('captured');
    expect(await getCapturedPushToken()).toBeNull();
  });
});

describe('concurrency', () => {
  test('overlapping calls collapse onto one attempt', async () => {
    const [a, b, c] = await Promise.all([
      syncPushToken({ lang: 'hi' }),
      syncPushToken({ lang: 'hi' }),
      syncPushToken({ lang: 'hi' }),
    ]);
    expect(getToken).toHaveBeenCalledTimes(1);
    expect([a.status, b.status, c.status]).toEqual(['captured', 'captured', 'captured']);
  });

  test('the guard is released, so a later foreground syncs again', async () => {
    await syncPushToken({ lang: 'hi' });
    await syncPushToken({ lang: 'hi' });
    expect(getToken).toHaveBeenCalledTimes(2);
  });
});

describe('install id', () => {
  test('minted once from the token seed, then read back unchanged', async () => {
    const first = await getInstallId(TOKEN, 1_757_000_000_000);
    expect(isUsableInstallId(first)).toBe(true);
    // A rotated token must NOT re-mint the id — that is the point of having it.
    expect(await getInstallId('ExponentPushToken[bbbbbbbbbbbbbbbbbbbbbb]')).toBe(first);
    expect(await AsyncStorage.getItem(INSTALL_ID_KEY)).toBe(first);
  });

  test('a corrupt stored id is replaced rather than reused', async () => {
    await AsyncStorage.setItem(INSTALL_ID_KEY, '  ');
    const minted = await getInstallId(TOKEN, 1_757_000_000_000);
    expect(isUsableInstallId(minted)).toBe(true);
    expect(minted.startsWith('vd-')).toBe(true);
  });
});

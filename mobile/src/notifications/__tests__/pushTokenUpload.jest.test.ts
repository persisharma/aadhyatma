/**
 * The upload half of `pushToken.ts`.
 *
 * `PUSH_REGISTRY_ENDPOINT` ships as `null` (proved by `pushTokenPure.test.ts`),
 * so this suite substitutes a configured endpoint to reach the code that runs
 * once a backend exists — the fingerprint dedupe, and the rule that only an
 * accepted upload is allowed to advance the stored fingerprint.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { __resetPushTokenSyncState, syncPushToken } from '../pushToken';
import { INSTALL_ID_KEY, PUSH_TOKEN_SYNC_KEY } from '../pushTokenPure';
import * as permissionState from '../permissionState';

const ENDPOINT = 'https://push.example.com/devices';

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
  addPushTokenListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('../permissionState', () => ({
  readNotificationPermissionState: jest.fn(),
  requestNotificationPermission: jest.fn(),
}));

jest.mock('../pushTokenPure', () => ({
  ...jest.requireActual('../pushTokenPure'),
  PUSH_REGISTRY_ENDPOINT: 'https://push.example.com/devices',
}));

const getToken = Notifications.getExpoPushTokenAsync as unknown as jest.Mock;
const readPermission = permissionState.readNotificationPermissionState as unknown as jest.Mock;

const TOKEN = 'ExponentPushToken[aaaaaaaaaaaaaaaaaaaaaa]';
const NEXT_TOKEN = 'ExponentPushToken[bbbbbbbbbbbbbbbbbbbbbb]';

function mockFetch(impl: () => unknown): jest.Mock {
  const fn = jest.fn(impl);
  (global as unknown as { fetch: jest.Mock }).fetch = fn;
  return fn;
}

let fetchMock: jest.Mock;

beforeEach(async () => {
  jest.clearAllMocks();
  __resetPushTokenSyncState();
  await AsyncStorage.clear();
  readPermission.mockResolvedValue({ status: 'granted', canAskAgain: true });
  getToken.mockResolvedValue({ data: TOKEN });
  fetchMock = mockFetch(() => Promise.resolve({ ok: true }));
});

test('a first capture POSTs the registration as JSON and stores its fingerprint', async () => {
  const result = await syncPushToken({ lang: 'hi', now: 1_757_000_000_000 });
  expect(result).toEqual({ status: 'synced', token: TOKEN });
  expect(fetchMock).toHaveBeenCalledTimes(1);

  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe(ENDPOINT);
  expect(init.method).toBe('POST');
  expect(init.headers).toEqual({ 'content-type': 'application/json' });
  expect(init.signal).toBeDefined();

  const body = JSON.parse(init.body);
  expect(body).toMatchObject({ token: TOKEN, lang: 'hi' });
  expect(body.installId).toBe(await AsyncStorage.getItem(INSTALL_ID_KEY));
  // Only what a server needs to address and segment an install — no OS
  // identifier, no location, and nothing from the private Smaran/Kundali data.
  expect(Object.keys(body).sort()).toEqual([
    'appVersion',
    'installId',
    'lang',
    'platform',
    'timezone',
    'token',
  ]);
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeTruthy();
});

test('an unchanged registration makes no second request', async () => {
  await syncPushToken({ lang: 'hi' });
  __resetPushTokenSyncState();
  const second = await syncPushToken({ lang: 'hi' });
  expect(second.status).toBe('unchanged');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('a rotated token re-syncs under the same install id', async () => {
  await syncPushToken({ lang: 'hi' });
  const installId = await AsyncStorage.getItem(INSTALL_ID_KEY);

  getToken.mockResolvedValue({ data: NEXT_TOKEN });
  __resetPushTokenSyncState();
  expect((await syncPushToken({ lang: 'hi' })).status).toBe('synced');
  expect(fetchMock).toHaveBeenCalledTimes(2);
  const body = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(body.token).toBe(NEXT_TOKEN);
  expect(body.installId).toBe(installId);
});

test('a reading-language change re-syncs, so pushes match the reader', async () => {
  await syncPushToken({ lang: 'hi' });
  __resetPushTokenSyncState();
  expect((await syncPushToken({ lang: 'gu' })).status).toBe('synced');
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).lang).toBe('gu');
});

test('being offline is a silent failure that leaves the fingerprint unset', async () => {
  fetchMock = mockFetch(() => Promise.reject(new Error('Network request failed')));
  expect((await syncPushToken({ lang: 'hi' })).status).toBe('failed');
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeNull();
});

test('a rejected upload is retried rather than remembered as done', async () => {
  fetchMock = mockFetch(() => Promise.resolve({ ok: false, status: 500 }));
  expect((await syncPushToken({ lang: 'hi' })).status).toBe('failed');
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeNull();

  fetchMock = mockFetch(() => Promise.resolve({ ok: true }));
  __resetPushTokenSyncState();
  expect((await syncPushToken({ lang: 'hi' })).status).toBe('synced');
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeTruthy();
});

test('a hung request is aborted rather than left holding a socket', async () => {
  jest.useFakeTimers();
  try {
    fetchMock = mockFetch(
      (...args: unknown[]) =>
        new Promise((_resolve, reject) => {
          const { signal } = args[1] as { signal: AbortSignal };
          signal.addEventListener('abort', () => reject(new Error('Aborted')));
        })
    );
    const pending = syncPushToken({ lang: 'hi' });
    await jest.advanceTimersByTimeAsync(9000);
    expect((await pending).status).toBe('failed');
  } finally {
    jest.useRealTimers();
  }
});

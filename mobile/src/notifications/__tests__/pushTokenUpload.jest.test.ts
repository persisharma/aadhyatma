/**
 * The upload half of `pushToken.ts`.
 *
 * `PUSH_REGISTRY_ENDPOINT` is pinned in source and registration also needs an
 * API key, so this suite mocks the endpoint to a stable test URL and sets the
 * key env var to reach the code that actually calls the registry — the once-only
 * guard, the Bearer auth, and the rule that only an accepted call records the
 * device id as registered.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { __resetPushTokenSyncState, syncPushToken } from '../pushToken';
import { PUSH_TOKEN_SYNC_KEY } from '../pushTokenPure';
import * as permissionState from '../permissionState';

const ENDPOINT = 'https://push.example.com/devices';
const API_KEY = 'test-registration-key';

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

/**
 * Run a sync under a fake clock, so the retry backoffs (~2 s then ~6 s) and the
 * per-attempt timeout cost no real wall time. The single generous advance
 * flushes every nested timer the retry loop schedules.
 */
async function underFakeClock<T>(run: () => Promise<T>): Promise<T> {
  jest.useFakeTimers();
  try {
    const pending = run();
    await jest.advanceTimersByTimeAsync(120_000);
    return await pending;
  } finally {
    jest.useRealTimers();
  }
}

beforeEach(async () => {
  jest.clearAllMocks();
  __resetPushTokenSyncState();
  await AsyncStorage.clear();
  delete process.env.EXPO_PUBLIC_PUSH_REGISTRY_URL;
  process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY = API_KEY;
  readPermission.mockResolvedValue({ status: 'granted', canAskAgain: true });
  getToken.mockResolvedValue({ data: TOKEN });
  fetchMock = mockFetch(() => Promise.resolve({ status: 200 }));
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY;
});

test('a first capture POSTs the device id as JSON, bearer-authed, and records it', async () => {
  const result = await syncPushToken({ now: 1_757_000_000_000 });
  expect(result).toEqual({ status: 'synced', token: TOKEN });
  expect(fetchMock).toHaveBeenCalledTimes(1);

  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe(ENDPOINT);
  expect(init.method).toBe('POST');
  expect(init.headers).toEqual({
    'content-type': 'application/json',
    authorization: `Bearer ${API_KEY}`,
  });
  expect(init.signal).toBeDefined();

  // Exactly the documented contract: nothing but the device id leaves the
  // device — no OS identifier, no location, no private Smaran/Kundali data.
  expect(JSON.parse(init.body)).toEqual({ deviceIds: [TOKEN] });
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBe(TOKEN);
});

test('with no API key configured it stays capture-only and makes no request', async () => {
  delete process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY;
  const result = await syncPushToken();
  expect(result).toEqual({ status: 'captured', token: TOKEN });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeNull();
});

test('an already-registered device id makes no second request', async () => {
  await syncPushToken();
  __resetPushTokenSyncState();
  const second = await syncPushToken();
  expect(second.status).toBe('unchanged');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('a rotated token is a new device id and registers afresh', async () => {
  await syncPushToken();
  getToken.mockResolvedValue({ data: NEXT_TOKEN });
  __resetPushTokenSyncState();

  expect((await syncPushToken()).status).toBe('synced');
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ deviceIds: [NEXT_TOKEN] });
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBe(NEXT_TOKEN);
});

test('a transient failure is retried and the retry can succeed', async () => {
  const statuses = [null, 503, 200];
  let call = 0;
  fetchMock = mockFetch(() => {
    const status = statuses[call];
    call += 1;
    return status === null
      ? Promise.reject(new Error('Network request failed'))
      : Promise.resolve({ status });
  });

  const result = await underFakeClock(() => syncPushToken());
  expect(result.status).toBe('synced');
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBe(TOKEN);
});

test('being offline exhausts the retries, then leaves the device id unrecorded', async () => {
  fetchMock = mockFetch(() => Promise.reject(new Error('Network request failed')));
  const result = await underFakeClock(() => syncPushToken());
  expect(result.status).toBe('failed');
  expect(fetchMock).toHaveBeenCalledTimes(3);
  // Nothing recorded ⇒ a later foreground tries the whole thing again.
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeNull();
});

test('a persistent 500 is retried, then re-attempted on a later sync', async () => {
  fetchMock = mockFetch(() => Promise.resolve({ status: 500 }));
  expect((await underFakeClock(() => syncPushToken())).status).toBe('failed');
  expect(fetchMock).toHaveBeenCalledTimes(3);

  fetchMock = mockFetch(() => Promise.resolve({ status: 200 }));
  __resetPushTokenSyncState();
  expect((await syncPushToken()).status).toBe('synced');
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBe(TOKEN);
});

test('a 4xx is not retried, and is not remembered as done either', async () => {
  fetchMock = mockFetch(() => Promise.resolve({ status: 401 }));
  // Real timers: a rejection must return without ever scheduling a backoff.
  const result = await syncPushToken();
  expect(result.status).toBe('rejected');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(await AsyncStorage.getItem(PUSH_TOKEN_SYNC_KEY)).toBeNull();

  // A server-side fix is picked up on the next foreground.
  fetchMock = mockFetch(() => Promise.resolve({ status: 201 }));
  __resetPushTokenSyncState();
  expect((await syncPushToken()).status).toBe('synced');
});

test('a hung request is aborted per attempt rather than left holding a socket', async () => {
  fetchMock = mockFetch(
    (...args: unknown[]) =>
      new Promise((_resolve, reject) => {
        const { signal } = args[1] as { signal: AbortSignal };
        signal.addEventListener('abort', () => reject(new Error('Aborted')));
      })
  );
  const result = await underFakeClock(() => syncPushToken());
  expect(result.status).toBe('failed');
  // Each attempt aborts on its own timeout instead of one hanging forever.
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

/**
 * The glue of `deviceHeartbeat.ts`.
 *
 * Mocks the permission read and the network so the suite can reach the parts
 * that matter: the once-a-day/state-change dedup, the Bearer-authed POST of a
 * PII-free body, the retry/abort behaviour, and the rule that only an accepted
 * send records the fingerprint. The endpoint is pinned to a test URL via the env
 * override and the API key env var is set to reach the request path.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { __resetDeviceHeartbeatState, sendDeviceHeartbeat } from '../deviceHeartbeat';
import { HEARTBEAT_FINGERPRINT_KEY, JAPAM_ALARMS_KEY } from '../deviceHeartbeatPure';
import { INSTALL_ID_KEY } from '../pushTokenPure';
import * as permissionState from '../permissionState';

const ENDPOINT = 'https://hb.example.com/heartbeat';
const API_KEY = 'test-registration-key';
const NOW = Date.UTC(2026, 9, 25, 6, 0, 0); // 2026-10-25 within Asia/Kolkata

jest.mock('expo-constants', () => ({ default: { expoConfig: { version: '1.5.2' } } }));

jest.mock('../permissionState', () => ({
  readNotificationPermissionState: jest.fn(),
}));

const readPermission = permissionState.readNotificationPermissionState as unknown as jest.Mock;

function mockFetch(impl: (...args: unknown[]) => unknown): jest.Mock {
  const fn = jest.fn(impl);
  (global as unknown as { fetch: jest.Mock }).fetch = fn;
  return fn;
}

let fetchMock: jest.Mock;

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
  __resetDeviceHeartbeatState();
  await AsyncStorage.clear();
  process.env.EXPO_PUBLIC_HEARTBEAT_URL = ENDPOINT;
  process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY = API_KEY;
  readPermission.mockResolvedValue({ status: 'granted', canAskAgain: true });
  fetchMock = mockFetch(() => Promise.resolve({ status: 200 }));
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_HEARTBEAT_URL;
  delete process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY;
});

test('a first open POSTs a PII-free body, bearer-authed, and records the fingerprint', async () => {
  await AsyncStorage.setItem(
    JAPAM_ALARMS_KEY,
    JSON.stringify([{ id: '1', enabled: true }, { id: '2', enabled: false }])
  );

  const result = await sendDeviceHeartbeat({ now: NOW });
  expect(result).toEqual({ status: 'sent' });
  expect(fetchMock).toHaveBeenCalledTimes(1);

  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe(ENDPOINT);
  expect(init.method).toBe('POST');
  expect(init.headers).toEqual({
    'content-type': 'application/json',
    authorization: `Bearer ${API_KEY}`,
  });
  expect(init.signal).toBeDefined();

  const body = JSON.parse(init.body);
  expect(body).toEqual({
    installId: expect.stringMatching(/^vd-/),
    platform: expect.any(String),
    appVersion: '1.5.2',
    notifPermission: 'granted',
    notifCanAskAgain: true,
    alarmEnabled: true,
    alarmCount: 1,
    dayKey: '2026-10-25',
  });
  // No OS identifier, location, name, Kundali, or scripture content.
  expect(Object.keys(body).sort()).toEqual(
    ['alarmCount', 'alarmEnabled', 'appVersion', 'dayKey', 'installId', 'notifCanAskAgain', 'notifPermission', 'platform']
  );
  expect(await AsyncStorage.getItem(HEARTBEAT_FINGERPRINT_KEY)).toBeTruthy();
});

test('reports denied/undetermined too — it does not gate on a grant', async () => {
  readPermission.mockResolvedValue({ status: 'denied', canAskAgain: false });
  const result = await sendDeviceHeartbeat({ now: NOW });
  expect(result).toEqual({ status: 'sent' });
  const body = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(body.notifPermission).toBe('denied');
  expect(body.notifCanAskAgain).toBe(false);
});

test('reuses the push registrar install id when one already exists', async () => {
  await AsyncStorage.setItem(INSTALL_ID_KEY, 'vd-existing-id-value');
  await sendDeviceHeartbeat({ now: NOW });
  expect(JSON.parse(fetchMock.mock.calls[0][1].body).installId).toBe('vd-existing-id-value');
});

test('the same unchanged day makes no second request', async () => {
  await sendDeviceHeartbeat({ now: NOW });
  __resetDeviceHeartbeatState();
  const second = await sendDeviceHeartbeat({ now: NOW + 60_000 });
  expect(second).toEqual({ status: 'unchanged' });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test('a new day re-sends', async () => {
  await sendDeviceHeartbeat({ now: NOW });
  __resetDeviceHeartbeatState();
  const nextDay = NOW + 24 * 60 * 60 * 1000;
  expect((await sendDeviceHeartbeat({ now: nextDay })).status).toBe('sent');
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).dayKey).toBe('2026-10-26');
});

test('a same-day permission change re-sends', async () => {
  await sendDeviceHeartbeat({ now: NOW });
  __resetDeviceHeartbeatState();
  readPermission.mockResolvedValue({ status: 'granted', canAskAgain: true });
  await AsyncStorage.setItem(JAPAM_ALARMS_KEY, JSON.stringify([{ id: '1', enabled: true }]));
  const result = await sendDeviceHeartbeat({ now: NOW + 1000 });
  expect(result.status).toBe('sent');
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).alarmEnabled).toBe(true);
});

test('with no API key configured it stays capture-only and makes no request', async () => {
  delete process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY;
  const result = await sendDeviceHeartbeat({ now: NOW });
  expect(result).toEqual({ status: 'captured' });
  expect(fetchMock).not.toHaveBeenCalled();
  expect(await AsyncStorage.getItem(HEARTBEAT_FINGERPRINT_KEY)).toBeNull();
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
  const result = await underFakeClock(() => sendDeviceHeartbeat({ now: NOW }));
  expect(result.status).toBe('sent');
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(await AsyncStorage.getItem(HEARTBEAT_FINGERPRINT_KEY)).toBeTruthy();
});

test('being offline exhausts the retries and records nothing', async () => {
  fetchMock = mockFetch(() => Promise.reject(new Error('Network request failed')));
  const result = await underFakeClock(() => sendDeviceHeartbeat({ now: NOW }));
  expect(result.status).toBe('failed');
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(await AsyncStorage.getItem(HEARTBEAT_FINGERPRINT_KEY)).toBeNull();
});

test('a 4xx is not retried and is not remembered as done', async () => {
  fetchMock = mockFetch(() => Promise.resolve({ status: 401 }));
  const result = await sendDeviceHeartbeat({ now: NOW });
  expect(result.status).toBe('rejected');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(await AsyncStorage.getItem(HEARTBEAT_FINGERPRINT_KEY)).toBeNull();
});

test('a hung request is aborted per attempt', async () => {
  fetchMock = mockFetch(
    (...args: unknown[]) =>
      new Promise((_resolve, reject) => {
        const { signal } = args[1] as { signal: AbortSignal };
        signal.addEventListener('abort', () => reject(new Error('Aborted')));
      })
  );
  const result = await underFakeClock(() => sendDeviceHeartbeat({ now: NOW }));
  expect(result.status).toBe('failed');
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

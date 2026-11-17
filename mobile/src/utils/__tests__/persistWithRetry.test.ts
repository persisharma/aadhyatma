import { Alert } from 'react-native';

const mockSetItem = jest.fn<Promise<void>, [string, string]>();
const mockGetItem = jest.fn<Promise<string | null>, [string]>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: (k: string, v: string) => mockSetItem(k, v),
    getItem: (k: string) => mockGetItem(k),
  },
}));

import { resetSaveNoticeThrottle, setItemWithRetry, showBookmarksLoadingNotice } from '../persistWithRetry';

let alertSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;

beforeEach(() => {
  jest.useFakeTimers();
  mockSetItem.mockReset();
  mockGetItem.mockReset().mockResolvedValue(null);
  resetSaveNoticeThrottle();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const flush = async (ms = 600) => {
  await jest.advanceTimersByTimeAsync(ms);
};

test('a write that succeeds first time is not retried and shows nothing (BEH-14)', async () => {
  mockSetItem.mockResolvedValue(undefined);
  await expect(setItemWithRetry('k', 'v')).resolves.toBe(true);
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(alertSpy).not.toHaveBeenCalled();
});

test('a transient failure is retried once and recovers silently', async () => {
  mockSetItem.mockRejectedValueOnce(new Error('disk full')).mockResolvedValue(undefined);
  const result = setItemWithRetry('k', 'v');
  await flush();
  await expect(result).resolves.toBe(true);
  expect(mockSetItem).toHaveBeenCalledTimes(2);
  expect(alertSpy).not.toHaveBeenCalled();
});

test('two failures surface a localized notice instead of vanishing', async () => {
  mockGetItem.mockResolvedValue('gu');
  mockSetItem.mockRejectedValue(new Error('disk full'));
  const result = setItemWithRetry('k', 'v');
  await flush();
  await expect(result).resolves.toBe(false);
  await flush(0);
  expect(mockSetItem).toHaveBeenCalledTimes(2);
  expect(warnSpy).toHaveBeenCalled();
  expect(alertSpy).toHaveBeenCalledTimes(1);
  expect(alertSpy.mock.calls[0][0]).toBe('સાચવી શકાયું નહીં');
});

test('a stream of failing writes raises one notice, not one per write', async () => {
  mockSetItem.mockRejectedValue(new Error('disk full'));
  for (const v of ['1', '2', '3']) {
    const r = setItemWithRetry(`k${v}`, v);
    await flush();
    await r;
  }
  await flush(0);
  expect(alertSpy).toHaveBeenCalledTimes(1);
});

test('a stale retry never overwrites a newer write to the same key', async () => {
  mockSetItem.mockRejectedValueOnce(new Error('transient')).mockResolvedValue(undefined);
  const first = setItemWithRetry('k', 'old');
  const second = setItemWithRetry('k', 'new');
  await flush();
  await Promise.all([first, second]);
  const writtenValues = mockSetItem.mock.calls.map((c) => c[1]);
  expect(writtenValues).toEqual(['old', 'new']);
  expect(writtenValues.lastIndexOf('old')).toBeLessThan(writtenValues.lastIndexOf('new'));
});

test('a bookmark tap during load gives feedback in the stored language (UX-09)', async () => {
  mockGetItem.mockResolvedValue('en');
  showBookmarksLoadingNotice();
  await flush(0);
  expect(alertSpy).toHaveBeenCalledTimes(1);
  expect(alertSpy.mock.calls[0][0]).toBe('Still loading');
});

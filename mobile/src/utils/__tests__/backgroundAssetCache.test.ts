import * as FileSystem from 'expo-file-system/legacy';
import { subscribeBackgroundAsset, evictBackgroundAsset, BACKGROUND_DOWNLOAD_TIMEOUT_MS } from '../backgroundAssetCache';
import type { CachedAssetRequest } from '../assetCache';

const mockFiles = new Set<string>();
const mockEmptyFiles = new Set<string>();
const mockTasks: { path: string; finish: (status?: number, empty?: boolean) => void; fail: () => void; cancel: jest.Mock; progress: () => void }[] = [];
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  getInfoAsync: jest.fn(async (path: string) => mockFiles.has(path) ? { exists: true, size: mockEmptyFiles.has(path) ? 0 : 20, isDirectory: false } : { exists: false }),
  makeDirectoryAsync: jest.fn(async () => undefined),
  moveAsync: jest.fn(async ({ from, to }) => { mockFiles.delete(from); mockFiles.add(to); }),
  deleteAsync: jest.fn(async (path: string) => { mockFiles.delete(path); }),
  createDownloadResumable: jest.fn((url: string, path: string, _options?: object, onProgress?: () => void) => {
    let finish!: (status?: number, empty?: boolean) => void;
    let fail!: () => void;
    const promise = new Promise((resolve, reject) => {
      finish = (status = 200, empty = false) => {
        mockFiles.add(path);
        if (empty) mockEmptyFiles.add(path);
        resolve({ status, uri: path });
      };
      fail = () => reject(new Error('Network unavailable'));
    });
    const cancel = jest.fn(async () => undefined);
    mockTasks.push({ path, finish, fail, cancel, progress: () => onProgress?.() });
    return { downloadAsync: () => promise, cancelAsync: cancel };
  }),
}));

const request = (key: string): CachedAssetRequest => ({ key, ext: 'webp', subdir: 'reading-backgrounds', remoteUrl: `https://cdn.test/${key}.webp` });
const flush = async () => { for (let i = 0; i < 15; i++) await Promise.resolve(); };
const subscriptions: (() => void)[] = [];
function subscribe(key: string, listener = jest.fn()) {
  subscriptions.push(subscribeBackgroundAsset(request(key), listener));
  return listener;
}

beforeEach(() => { jest.useFakeTimers(); mockFiles.clear(); mockEmptyFiles.clear(); mockTasks.length = 0; jest.clearAllMocks(); });
afterEach(async () => { subscriptions.splice(0).forEach(release => release()); await flush(); jest.useRealTimers(); });

test('returns a persisted image asynchronously without downloading it again', async () => {
  mockFiles.add('file:///docs/reading-backgrounds/cached.webp');
  const listener = subscribe('cached');
  expect(listener).not.toHaveBeenCalled();
  await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/cached.webp');
  expect(FileSystem.createDownloadResumable).not.toHaveBeenCalled();
});

test('a warm image resolves while both network slots are occupied by slow downloads', async () => {
  subscribe('slow-a'); subscribe('slow-b'); await flush();
  expect(mockTasks).toHaveLength(2);
  mockFiles.add('file:///docs/reading-backgrounds/warm.webp');
  const warm = subscribe('warm');
  expect(warm).not.toHaveBeenCalled();
  await flush();
  expect(warm).toHaveBeenCalledWith('file:///docs/reading-backgrounds/warm.webp');
  expect(mockTasks).toHaveLength(2);
  mockTasks.forEach(task => task.finish()); await flush();
});

test('leaving during the independent disk lookup never queues a later download', async () => {
  let finishLookup!: (info: Awaited<ReturnType<typeof FileSystem.getInfoAsync>>) => void;
  jest.mocked(FileSystem.getInfoAsync).mockImplementationOnce(() => new Promise(resolve => {
    finishLookup = resolve;
  }));
  const listener = subscribe('left-during-lookup');
  subscriptions[0]();
  finishLookup({ exists: false, uri: 'file:///docs/reading-backgrounds/left-during-lookup.webp', isDirectory: false });
  await flush();
  expect(listener).not.toHaveBeenCalled();
  expect(FileSystem.createDownloadResumable).not.toHaveBeenCalled();
});

test('deduplicates backdrop and illustration and promotes only complete files', async () => {
  const a = subscribe('shared'); const b = subscribe('shared'); await flush();
  expect(mockTasks).toHaveLength(1);
  expect(a).not.toHaveBeenCalled();
  mockTasks[0].finish(); await flush();
  expect(a).toHaveBeenCalledWith('file:///docs/reading-backgrounds/shared.webp');
  expect(b).toHaveBeenCalledWith('file:///docs/reading-backgrounds/shared.webp');
  expect(FileSystem.moveAsync).toHaveBeenCalledTimes(1);
});

test('a completed image is reused on future visits without expiry or network revalidation', async () => {
  subscribe('lifetime'); await flush();
  mockTasks[0].finish(); await flush();
  subscriptions[0]();
  jest.advanceTimersByTime(365 * 24 * 60 * 60 * 1000);
  const nextVisit = subscribe('lifetime'); await flush();
  expect(nextVisit).toHaveBeenCalledWith('file:///docs/reading-backgrounds/lifetime.webp');
  expect(FileSystem.createDownloadResumable).toHaveBeenCalledTimes(1);
  expect(FileSystem.moveAsync).toHaveBeenCalledTimes(1);
});

test('a fresh module after app restart reuses disk content even when the CDN host changes', async () => {
  subscribe('restart'); await flush();
  mockTasks[0].finish(); await flush();
  subscriptions[0](); await flush();
  // New module state models a new app process. Only the filesystem persists.
  let restarted!: typeof import('../backgroundAssetCache');
  jest.isolateModules(() => { restarted = jest.requireActual('../backgroundAssetCache'); });
  const listener = jest.fn();
  subscriptions.push(restarted.subscribeBackgroundAsset({ ...request('restart'), remoteUrl: 'https://new-cdn.test/restart.webp' }, listener));
  expect(listener).not.toHaveBeenCalled();
  await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/restart.webp');
  expect(mockTasks).toHaveLength(1);
});

test('simultaneous requests for identical content share one download across CDN URLs', async () => {
  const a = subscribe('same-hash'); const b = jest.fn();
  subscriptions.push(subscribeBackgroundAsset({ ...request('same-hash'), remoteUrl: 'https://other-cdn.test/same-hash.webp' }, b));
  await flush();
  expect(mockTasks).toHaveLength(1);
  mockTasks[0].finish(); await flush();
  expect(a).toHaveBeenCalledWith('file:///docs/reading-backgrounds/same-hash.webp');
  expect(b).toHaveBeenCalledWith('file:///docs/reading-backgrounds/same-hash.webp');
});

test('a changed content hash downloads the new image and leaves unchanged content reusable', async () => {
  subscribe('old-hash'); await flush(); mockTasks[0].finish(); await flush();
  subscribe('new-hash'); await flush(); mockTasks[1].finish(); await flush();
  expect(mockFiles.has('file:///docs/reading-backgrounds/old-hash.webp')).toBe(true);
  expect(mockFiles.has('file:///docs/reading-backgrounds/new-hash.webp')).toBe(true);
  const oldAgain = subscribe('old-hash'); const newAgain = subscribe('new-hash'); await flush();
  expect(oldAgain).toHaveBeenCalledWith('file:///docs/reading-backgrounds/old-hash.webp');
  expect(newAgain).toHaveBeenCalledWith('file:///docs/reading-backgrounds/new-hash.webp');
  expect(mockTasks).toHaveLength(2);
});

test('explicitly removed app artwork is downloaded again on the next visit', async () => {
  subscribe('deleted'); await flush(); mockTasks[0].finish(); await flush();
  mockFiles.delete('file:///docs/reading-backgrounds/deleted.webp');
  const nextVisit = subscribe('deleted'); await flush();
  expect(mockTasks).toHaveLength(2);
  expect(nextVisit).not.toHaveBeenCalled();
  mockTasks[1].finish(); await flush();
  expect(nextVisit).toHaveBeenCalledWith('file:///docs/reading-backgrounds/deleted.webp');
});

test('different file formats have distinct cache identities', async () => {
  subscribe('formats');
  subscriptions.push(subscribeBackgroundAsset({ ...request('formats'), ext: 'png', remoteUrl: 'https://cdn.test/formats.png' }, jest.fn()));
  await flush();
  expect(mockTasks).toHaveLength(2);
  mockTasks.forEach(task => task.finish()); await flush();
  expect(mockFiles.has('file:///docs/reading-backgrounds/formats.webp')).toBe(true);
  expect(mockFiles.has('file:///docs/reading-backgrounds/formats.png')).toBe(true);
});

test('timeout cancels native work and settles to fallback without a partial cache hit', async () => {
  const listener = subscribe('timeout'); await flush();
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_TIMEOUT_MS); await flush();
  expect(mockTasks[0].cancel).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(null);
  expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith(mockTasks[0].path, { idempotent: true });
});

test('a slow download that keeps receiving bytes outlives the timeout; a stall still aborts it', async () => {
  const slow = subscribe('slow'); const stalled = subscribe('stalled'); await flush();
  for (let i = 0; i < 4; i++) { jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_TIMEOUT_MS - 1000); mockTasks[0].progress(); }
  await flush();
  expect(mockTasks[0].cancel).not.toHaveBeenCalled();
  expect(stalled).toHaveBeenCalledWith(null);
  mockTasks[0].finish(); await flush();
  expect(slow).toHaveBeenCalledWith('file:///docs/reading-backgrounds/slow.webp');
});

test('leaving one viewer keeps shared work; leaving the last cancels it without callbacks', async () => {
  const a = subscribe('leaving'); const b = subscribe('leaving'); await flush();
  subscriptions[0](); await flush();
  expect(mockTasks[0].cancel).not.toHaveBeenCalled();
  subscriptions[1](); await flush();
  expect(mockTasks[0].cancel).toHaveBeenCalledTimes(1);
  expect(a).not.toHaveBeenCalled(); expect(b).not.toHaveBeenCalled();
});

test('limits downloads to two and removes unused queued work', async () => {
  subscribe('a'); subscribe('b'); subscribe('c'); subscribe('unused'); await flush();
  expect(mockTasks).toHaveLength(2);
  subscriptions[3](); mockTasks[0].finish(); await flush();
  expect(mockTasks).toHaveLength(3);
  mockTasks[1].finish(); mockTasks[2].finish(); await flush();
  expect(mockTasks).toHaveLength(3);
});

test('a cancelled attempt cannot delete the next attempt’s temporary file', async () => {
  subscribe('retry'); await flush(); const oldPath = mockTasks[0].path;
  subscriptions[0](); const listener = subscribe('retry'); await flush();
  expect(mockTasks[1].path).not.toBe(oldPath);
  mockTasks[1].finish(); await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/retry.webp');
  expect(mockFiles.has('file:///docs/reading-backgrounds/retry.webp')).toBe(true);
});

test('decode-failed files are evicted so the next visit can retry', async () => {
  const path = 'file:///docs/reading-backgrounds/bad.webp'; mockFiles.add(path);
  await evictBackgroundAsset(request('bad'));
  expect(mockFiles.has(path)).toBe(false);
});

test.each([204, 404, 503])('HTTP %i never becomes a permanent artwork cache hit', async status => {
  const listener = subscribe('http-error'); await flush();
  mockTasks[0].finish(status); await flush();
  expect(listener).toHaveBeenCalledWith(null);
  expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  expect(mockFiles.has(mockTasks[0].path)).toBe(false);
  subscribe('http-error'); await flush();
  expect(mockTasks).toHaveLength(2);
});

test('an empty HTTP 200 body is removed and can retry instead of poisoning lifetime storage', async () => {
  const listener = subscribe('empty'); await flush();
  mockTasks[0].finish(200, true); await flush();
  expect(listener).toHaveBeenCalledWith(null);
  expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  expect(mockFiles.has(mockTasks[0].path)).toBe(false);
  subscribe('empty'); await flush();
  expect(mockTasks).toHaveLength(2);
});

test('a rejected download releases a slot for queued artwork and removes its scratch file', async () => {
  const listener = subscribe('network-error'); subscribe('other'); subscribe('queued'); await flush();
  expect(mockTasks).toHaveLength(2);
  mockFiles.add(mockTasks[0].path);
  mockTasks[0].fail(); await flush();
  expect(listener).toHaveBeenCalledWith(null);
  expect(mockFiles.has(mockTasks[0].path)).toBe(false);
  expect(mockTasks).toHaveLength(3);
  mockTasks[1].finish(); mockTasks[2].finish(); await flush();
});

test('a disk lookup failure settles to fallback without starting network work', async () => {
  jest.mocked(FileSystem.getInfoAsync).mockRejectedValueOnce(new Error('Disk unavailable'));
  const listener = subscribe('disk-error'); await flush();
  expect(listener).toHaveBeenCalledWith(null);
  expect(FileSystem.createDownloadResumable).not.toHaveBeenCalled();
});

test('a failed atomic promotion cleans the download and leaves no persistent hit', async () => {
  jest.mocked(FileSystem.moveAsync).mockRejectedValueOnce(new Error('Disk full'));
  const listener = subscribe('disk-full'); await flush();
  mockTasks[0].finish(); await flush();
  expect(listener).toHaveBeenCalledWith(null);
  expect(mockFiles.has(mockTasks[0].path)).toBe(false);
  expect(mockFiles.has('file:///docs/reading-backgrounds/disk-full.webp')).toBe(false);
  subscribe('disk-full'); await flush();
  expect(mockTasks).toHaveLength(2);
});

test('abandoned partial files are never reused as valid artwork', async () => {
  mockFiles.add('file:///docs/reading-backgrounds/interrupted.webp.99.part');
  const listener = subscribe('interrupted'); await flush();
  expect(listener).not.toHaveBeenCalled();
  expect(mockTasks).toHaveLength(1);
  mockTasks[0].finish(); await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/interrupted.webp');
});

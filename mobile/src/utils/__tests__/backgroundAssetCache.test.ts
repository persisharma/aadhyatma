import * as FileSystem from 'expo-file-system/legacy';
import {
  subscribeBackgroundAsset,
  evictBackgroundAsset,
  BACKGROUND_DOWNLOAD_STALL_MS,
  BACKGROUND_DOWNLOAD_MAX_MS,
} from '../backgroundAssetCache';
import { resetResumableDownloadsForTests } from '../resumableDownload';
import type { CachedAssetRequest } from '../assetCache';

/** path → bytes on disk. A size of 0 models an empty body. */
const mockFiles = new Map<string, number>();
type MockTask = {
  path: string;
  /** The byte offset a ranged request asked to continue from, if any. */
  resumeFrom: number | undefined;
  /** Bytes arrive: the file grows to `written` and the progress event fires. */
  progress: (written: number, total: number) => void;
  finish: (status?: number, empty?: boolean) => void;
  fail: () => void;
  cancel: jest.Mock;
};
const mockTasks: MockTask[] = [];
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  getInfoAsync: jest.fn(async (path: string) => mockFiles.has(path) ? { exists: true, size: mockFiles.get(path), isDirectory: false } : { exists: false }),
  makeDirectoryAsync: jest.fn(async () => undefined),
  readDirectoryAsync: jest.fn(async (directory: string) =>
    [...mockFiles.keys()].filter(path => path.startsWith(directory)).map(path => path.slice(directory.length))),
  moveAsync: jest.fn(async ({ from, to }) => { mockFiles.set(to, mockFiles.get(from) ?? 0); mockFiles.delete(from); }),
  deleteAsync: jest.fn(async (path: string) => { mockFiles.delete(path); }),
  createDownloadResumable: jest.fn((url: string, path: string, _options: unknown, onProgress: (p: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => void, resumeData?: string) => {
    let settle!: (value: { status: number; uri: string } | undefined) => void;
    let reject!: (error: Error) => void;
    let total = 0;
    const promise = new Promise<{ status: number; uri: string } | undefined>((resolve, fail) => { settle = resolve; reject = fail; });
    // Native resolves a cancelled transfer with nothing once it has stopped writing.
    const cancel = jest.fn(async () => { settle(undefined); });
    mockTasks.push({
      path,
      resumeFrom: resumeData === undefined ? undefined : Number(resumeData),
      progress: (written, expected) => { total = expected; mockFiles.set(path, written); onProgress({ totalBytesWritten: written, totalBytesExpectedToWrite: expected }); },
      finish: (status = 200, empty = false) => { mockFiles.set(path, empty ? 0 : total || 20); settle({ status, uri: path }); },
      fail: () => reject(new Error('Network unavailable')),
      cancel,
    });
    return { downloadAsync: () => promise, resumeAsync: () => promise, cancelAsync: cancel };
  }),
}));

const request = (key: string): CachedAssetRequest => ({ key, ext: 'webp', subdir: 'reading-backgrounds', remoteUrl: `https://cdn.test/${key}.webp` });
const flush = async () => { for (let i = 0; i < 60; i++) await Promise.resolve(); };
const subscriptions: (() => void)[] = [];
function subscribe(key: string, listener = jest.fn()) {
  subscriptions.push(subscribeBackgroundAsset(request(key), listener));
  return listener;
}

beforeEach(() => { jest.useFakeTimers(); mockFiles.clear(); mockTasks.length = 0; jest.clearAllMocks(); resetResumableDownloadsForTests({ resumable: false }); });
afterEach(async () => { subscriptions.splice(0).forEach(release => release()); await flush(); jest.restoreAllMocks(); jest.useRealTimers(); });
/** The platform is read once per process, so a test picks it as it would a device. */
const onAndroid = () => resetResumableDownloadsForTests({ resumable: true });

test('returns a persisted image asynchronously without downloading it again', async () => {
  mockFiles.set('file:///docs/reading-backgrounds/cached.webp', 20);
  const listener = subscribe('cached');
  expect(listener).not.toHaveBeenCalled();
  await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/cached.webp');
  expect(FileSystem.createDownloadResumable).not.toHaveBeenCalled();
});

test('a warm image resolves while both network slots are occupied by slow downloads', async () => {
  subscribe('slow-a'); subscribe('slow-b'); await flush();
  expect(mockTasks).toHaveLength(2);
  mockFiles.set('file:///docs/reading-backgrounds/warm.webp', 20);
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

test('no byte for the stall limit cancels native work and settles to fallback without a partial cache hit', async () => {
  const listener = subscribe('timeout'); await flush();
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  expect(mockTasks[0].cancel).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(null);
  expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith(mockTasks[0].path, { idempotent: true });
});

test('a slow download that keeps receiving bytes outlives the old 8 s limit and completes', async () => {
  const listener = subscribe('slow'); await flush();
  // 340 KB at ~28 KB/s: twelve seconds, a byte arriving every second.
  for (let second = 1; second <= 12; second++) {
    jest.advanceTimersByTime(1000);
    mockTasks[0].progress(second * 28_000, 340_000);
    await flush();
  }
  expect(mockTasks[0].cancel).not.toHaveBeenCalled();
  expect(listener).not.toHaveBeenCalled();
  mockTasks[0].progress(340_000, 340_000); mockTasks[0].finish(); await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/slow.webp');
  expect(mockFiles.get('file:///docs/reading-backgrounds/slow.webp')).toBe(340_000);
});

test('a download that stops mid-way is abandoned one stall limit after its last byte', async () => {
  const listener = subscribe('stalled'); await flush();
  jest.advanceTimersByTime(5000); mockTasks[0].progress(100_000, 340_000); await flush();
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS - 1); await flush();
  expect(listener).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1); await flush();
  expect(mockTasks[0].cancel).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(null);
});

test('a trickling download still yields its slot at the ceiling', async () => {
  const listener = subscribe('trickle'); await flush();
  for (let elapsed = 0; elapsed < BACKGROUND_DOWNLOAD_MAX_MS; elapsed += 4000) {
    jest.advanceTimersByTime(4000);
    if (!mockTasks[0].cancel.mock.calls.length) mockTasks[0].progress(elapsed / 4 + 1, 900_000);
    await flush();
  }
  expect(mockTasks[0].cancel).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(null);
});

test('Android keeps the bytes of a stalled attempt and the next visit asks only for the rest', async () => {
  onAndroid();
  subscribe('resume'); await flush();
  mockTasks[0].progress(200_000, 340_000);
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  subscriptions[0](); await flush();
  expect(mockFiles.get(mockTasks[0].path)).toBe(200_000);

  const listener = subscribe('resume'); await flush();
  expect(mockTasks).toHaveLength(2);
  expect(mockTasks[1].path).toBe(mockTasks[0].path);
  expect(mockTasks[1].resumeFrom).toBe(200_000);
  mockTasks[1].progress(340_000, 340_000); mockTasks[1].finish(206); await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/resume.webp');
  expect(mockFiles.get('file:///docs/reading-backgrounds/resume.webp')).toBe(340_000);
  expect(mockFiles.has(mockTasks[0].path)).toBe(false);
});

test('Android keeps the bytes when the last viewer leaves and resumes when one returns', async () => {
  onAndroid();
  subscribe('left'); await flush();
  mockTasks[0].progress(120_000, 500_000);
  subscriptions[0]();
  // The viewer is back before the cancelled attempt has finished settling.
  const listener = subscribe('left'); await flush();
  expect(mockTasks[0].cancel).toHaveBeenCalledTimes(1);
  expect(mockTasks).toHaveLength(2);
  expect(mockTasks[1].resumeFrom).toBe(120_000);
  mockTasks[1].progress(500_000, 500_000); mockTasks[1].finish(206); await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/left.webp');
});

test('Android keeps the bytes of a dropped connection', async () => {
  onAndroid();
  const first = subscribe('dropped'); await flush();
  mockTasks[0].progress(64_000, 300_000);
  mockTasks[0].fail(); await flush();
  expect(first).toHaveBeenCalledWith(null);
  subscribe('dropped'); await flush();
  expect(mockTasks[1].resumeFrom).toBe(64_000);
});

test('a server that ignores Range never produces a cached file, and resuming is switched off', async () => {
  onAndroid();
  subscribe('norange'); await flush();
  mockTasks[0].progress(200_000, 340_000);
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  subscriptions[0](); await flush();

  const listener = subscribe('norange'); await flush();
  // Whole file again, appended after the 200 KB already held: total is offset + full.
  mockTasks[1].progress(210_000, 540_000); await flush();
  expect(mockTasks[1].cancel).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith(null);
  expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  expect(mockFiles.has(mockTasks[1].path)).toBe(false);

  // Later interruptions in this session start over rather than trusting Range.
  subscriptions[1](); await flush();
  subscribe('norange'); await flush();
  expect(mockTasks[2].resumeFrom).toBeUndefined();
  mockTasks[2].progress(100_000, 340_000);
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  expect(mockFiles.has(mockTasks[2].path)).toBe(false);
});

test.each([200, 416, 503])('a resumed response of HTTP %i is discarded, not appended into the cache', async status => {
  onAndroid();
  subscribe('badresume'); await flush();
  mockTasks[0].progress(50_000, 340_000);
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  subscriptions[0](); await flush();
  const listener = subscribe('badresume'); await flush();
  mockTasks[1].finish(status); await flush();
  expect(listener).toHaveBeenCalledWith(null);
  expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  expect(mockFiles.has(mockTasks[1].path)).toBe(false);
});

test('a resumed file of the wrong length is discarded', async () => {
  onAndroid();
  subscribe('short'); await flush();
  mockTasks[0].progress(50_000, 340_000);
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  subscriptions[0](); await flush();
  const listener = subscribe('short'); await flush();
  // 206, but the body ended early and no progress event corrected the total.
  mockTasks[1].finish(206); mockFiles.set(mockTasks[1].path, 300_000); await flush();
  expect(listener).toHaveBeenCalledWith(null);
  expect(FileSystem.moveAsync).not.toHaveBeenCalled();
});

test('a kept partial that changed on disk is not resumed', async () => {
  onAndroid();
  subscribe('tampered'); await flush();
  mockTasks[0].progress(50_000, 340_000);
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  subscriptions[0](); await flush();
  mockFiles.set(mockTasks[0].path, 51_000);
  subscribe('tampered'); await flush();
  expect(mockTasks[1].resumeFrom).toBeUndefined();
  expect(mockTasks[1].path).not.toBe(mockTasks[0].path);
  expect(mockFiles.has(mockTasks[0].path)).toBe(false);
});

test('iOS restarts an interrupted attempt and keeps no partial', async () => {
  subscribe('ios'); await flush();
  mockTasks[0].progress(200_000, 340_000);
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  expect(mockFiles.has(mockTasks[0].path)).toBe(false);
  subscriptions[0](); await flush();
  subscribe('ios'); await flush();
  expect(mockTasks[1].resumeFrom).toBeUndefined();
});

test('evicting artwork also drops the bytes kept for resuming it', async () => {
  onAndroid();
  subscribe('evicted'); await flush();
  mockTasks[0].progress(50_000, 340_000);
  jest.advanceTimersByTime(BACKGROUND_DOWNLOAD_STALL_MS); await flush();
  subscriptions[0](); await flush();
  await evictBackgroundAsset(request('evicted'));
  expect(mockFiles.has(mockTasks[0].path)).toBe(false);
  subscribe('evicted'); await flush();
  expect(mockTasks[1].resumeFrom).toBeUndefined();
});

test('a download completing as its last viewer leaves is still stored for the next visit', async () => {
  subscribe('late'); await flush();
  let release!: () => void;
  jest.mocked(FileSystem.getInfoAsync).mockImplementationOnce(() => new Promise(resolve => {
    release = () => resolve({ exists: true, size: 20, isDirectory: false, uri: mockTasks[0].path, modificationTime: 0 });
  }));
  mockTasks[0].finish(); await flush();
  subscriptions[0](); release(); await flush();
  expect(mockFiles.has('file:///docs/reading-backgrounds/late.webp')).toBe(true);
  const next = subscribe('late'); await flush();
  expect(next).toHaveBeenCalledWith('file:///docs/reading-backgrounds/late.webp');
  expect(mockTasks).toHaveLength(1);
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
  // The cancelled attempt has fully settled (its own scratch is gone) before
  // the next one creates a file, so its cleanup has nothing left to race.
  expect(mockFiles.has(oldPath)).toBe(false);
  mockTasks[1].finish(); await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/retry.webp');
  expect(mockFiles.has('file:///docs/reading-backgrounds/retry.webp')).toBe(true);
});

test('decode-failed files are evicted so the next visit can retry', async () => {
  const path = 'file:///docs/reading-backgrounds/bad.webp'; mockFiles.set(path, 20);
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
  mockFiles.set(mockTasks[0].path, 20);
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
  mockFiles.set('file:///docs/reading-backgrounds/interrupted.webp.99.part', 20);
  const listener = subscribe('interrupted'); await flush();
  expect(listener).not.toHaveBeenCalled();
  expect(mockTasks).toHaveLength(1);
  expect(mockTasks[0].resumeFrom).toBeUndefined();
  mockTasks[0].finish(); await flush();
  expect(listener).toHaveBeenCalledWith('file:///docs/reading-backgrounds/interrupted.webp');
});

test('scratch left by a killed process is swept once, before the first download', async () => {
  onAndroid();
  mockFiles.set('file:///docs/reading-backgrounds/old-a.webp.3.part', 9000);
  mockFiles.set('file:///docs/reading-backgrounds/old-b.png.1.part', 500);
  mockFiles.set('file:///docs/reading-backgrounds/kept.webp', 20);
  subscribe('first'); subscribe('second'); await flush();
  expect(mockFiles.has('file:///docs/reading-backgrounds/old-a.webp.3.part')).toBe(false);
  expect(mockFiles.has('file:///docs/reading-backgrounds/old-b.png.1.part')).toBe(false);
  expect(mockFiles.has('file:///docs/reading-backgrounds/kept.webp')).toBe(true);
  // Both in-flight downloads still own their scratch files.
  expect(mockTasks).toHaveLength(2);
  mockTasks.forEach(task => task.finish()); await flush();
  expect(mockFiles.has('file:///docs/reading-backgrounds/first.webp')).toBe(true);
  expect(mockFiles.has('file:///docs/reading-backgrounds/second.webp')).toBe(true);
  expect(FileSystem.readDirectoryAsync).toHaveBeenCalledTimes(1);
});

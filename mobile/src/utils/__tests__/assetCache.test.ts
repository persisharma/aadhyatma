/**
 * The heavy-asset cache (audio library + kids-stories art served from R2).
 *
 * The product rule this file pins down is exact: a given remote asset is pulled
 * over the network AT MOST ONCE per device, ever. Every claim below defends one
 * half of that promise:
 *
 *   1. Persistence — the file lands under `Paths.document`, the OS-safe dir that
 *      survives app close and memory pressure (NOT `Paths.cache`, which the OS
 *      may reclaim the moment the app backgrounds). Only uninstall / user
 *      "clear storage" removes it.
 *   2. Hit-once — a second request for an already-stored key returns the local
 *      file with NO download, and two concurrent first-requests collapse into a
 *      single download (the in-flight dedupe), so a list prefetch racing the
 *      reader never double-fetches.
 *   3. No silent corruption — a failed download propagates (never a blank
 *      fallback) and leaves nothing stored, so the next mount retries cleanly.
 */
import { ASSET_DOWNLOAD_STALL_MS, assetDownloadStallMs, cachedAssetUri, cachedFileUri } from '@/utils/assetCache';
import { resetResumableDownloadsForTests } from '@/utils/resumableDownload';

/**
 * One fake disk behind both file-system APIs the cache touches: the object API
 * (`File`/`Directory`) for lookups and the atomic move, and the legacy module
 * for the transfer itself, which is the only one that reports progress and can
 * continue from a byte offset.
 */
type MockTransfer = {
  url: string;
  path: string;
  resumeFrom: number | undefined;
  progress: (written: number, total: number) => void;
  finish: (status?: number) => void;
  fail: (message?: string) => void;
  cancelled: boolean;
};
type MockState = {
  /** uri → bytes. Directories are stored with size -1. */
  files: Map<string, number>;
  downloads: string[];
  fail: Set<string>;
  /** When set, transfers wait to be driven by the test instead of completing. */
  manual: boolean;
  transfers: MockTransfer[];
};
const mockState: MockState = { files: new Map(), downloads: [], fail: new Set(), manual: false, transfers: [] };

jest.mock('expo-file-system', () => {
  const join = (parts: unknown[]) =>
    parts.map(p => (typeof p === 'string' ? p : (p as { uri: string }).uri)).join('/');
  class Directory {
    uri: string;
    constructor(...parts: unknown[]) { this.uri = join(parts); }
    get exists() { return mockState.files.has(this.uri); }
    create() { mockState.files.set(this.uri, -1); }
  }
  class File {
    uri: string;
    constructor(...parts: unknown[]) { this.uri = join(parts); }
    get exists() { return mockState.files.has(this.uri); }
    delete() { mockState.files.delete(this.uri); }
    move(dest: { uri: string }) {
      if (!mockState.files.has(this.uri)) throw new Error('Source does not exist');
      mockState.files.set(dest.uri, mockState.files.get(this.uri)!);
      mockState.files.delete(this.uri);
    }
  }
  const Paths = {
    get document() { return new Directory('file:///doc'); },
    get cache() { return new Directory('file:///cache'); },
  };
  return { Directory, File, Paths };
});

jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: jest.fn(async (uri: string) => {
    const size = mockState.files.get(uri);
    return size === undefined ? { exists: false } : { exists: true, size: Math.max(size, 0), isDirectory: size < 0 };
  }),
  deleteAsync: jest.fn(async (uri: string) => { mockState.files.delete(uri); }),
  readDirectoryAsync: jest.fn(async (directory: string) =>
    [...mockState.files.keys()].filter(uri => uri.startsWith(directory) && uri !== directory).map(uri => uri.slice(directory.length))),
  createDownloadResumable: jest.fn((url: string, path: string, _options: unknown, onProgress: (p: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => void, resumeData?: string) => {
    let settle!: (value: { status: number; uri: string } | undefined) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<{ status: number; uri: string } | undefined>((resolve, no) => { settle = resolve; reject = no; });
    let total = 0;
    const transfer: MockTransfer = {
      url,
      path,
      resumeFrom: resumeData === undefined ? undefined : Number(resumeData),
      progress: (written, expected) => { total = expected; mockState.files.set(path, written); onProgress({ totalBytesWritten: written, totalBytesExpectedToWrite: expected }); },
      finish: (status = 200) => { mockState.files.set(path, total || 4096); settle({ status, uri: path }); },
      fail: (message = 'network down') => reject(new Error(message)),
      cancelled: false,
    };
    const start = () => {
      mockState.downloads.push(path);
      mockState.transfers.push(transfer);
      if (mockState.fail.has(url)) transfer.fail();
      else if (!mockState.manual) transfer.finish(resumeData === undefined ? 200 : 206);
      return promise;
    };
    return {
      downloadAsync: start,
      resumeAsync: start,
      // Native resolves a cancelled transfer with nothing once it stops writing.
      cancelAsync: async () => { transfer.cancelled = true; settle(undefined); },
    };
  }),
}));

const fsState = mockState;

const req = (over: Partial<Parameters<typeof cachedAssetUri>[0]> = {}) => ({
  key: 'a3f9c2',
  ext: 'webp',
  subdir: 'kids-stories',
  remoteUrl: 'https://cdn.example.com/a3f9c2.webp',
  ...over,
});
const flush = async () => { for (let i = 0; i < 60; i++) await Promise.resolve(); };

beforeEach(() => {
  fsState.files.clear();
  fsState.downloads.length = 0;
  fsState.transfers.length = 0;
  fsState.fail.clear();
  fsState.manual = false;
  resetResumableDownloadsForTests({ resumable: false });
});
afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });

describe('cachedAssetUri', () => {
  it('stores under the OS-safe document dir, not the evictable cache dir', async () => {
    const uri = await cachedAssetUri(req());
    expect(uri).toBe('file:///doc/kids-stories/a3f9c2.webp');
    expect(uri.startsWith('file:///cache')).toBe(false);
  });

  it('downloads once to a scratch, moves it into place, then serves locally', async () => {
    const first = await cachedAssetUri(req());
    const second = await cachedAssetUri(req());
    expect(first).toBe(second);
    // The download targets a .part sibling; the final file is the atomic result.
    expect(fsState.downloads).toEqual(['file:///doc/kids-stories/a3f9c2.webp.1.part']);
    expect(fsState.files.has('file:///doc/kids-stories/a3f9c2.webp')).toBe(true);
    expect(fsState.files.has('file:///doc/kids-stories/a3f9c2.webp.1.part')).toBe(false);
  });

  it('collapses concurrent first-requests into a single download', async () => {
    const [a, b] = await Promise.all([cachedAssetUri(req()), cachedAssetUri(req())]);
    expect(a).toBe(b);
    expect(fsState.downloads).toHaveLength(1);
  });

  it('changed content (new hash) is a new file, fetched once on its own', async () => {
    await cachedAssetUri(req({ key: 'a3f9c2' }));
    await cachedAssetUri(req({ key: 'b7e100', remoteUrl: 'https://cdn.example.com/b7e100.webp' }));
    expect(fsState.downloads).toEqual([
      'file:///doc/kids-stories/a3f9c2.webp.1.part',
      'file:///doc/kids-stories/b7e100.webp.2.part',
    ]);
  });

  it('propagates a download failure and stores nothing, so the next try retries', async () => {
    fsState.fail.add('https://cdn.example.com/a3f9c2.webp');
    await expect(cachedAssetUri(req())).rejects.toThrow('network down');
    expect(fsState.files.has('file:///doc/kids-stories/a3f9c2.webp')).toBe(false);
    // Nothing half-written is left behind either.
    expect([...fsState.files.keys()].filter(uri => uri.endsWith('.part'))).toEqual([]);

    fsState.fail.clear();
    const uri = await cachedAssetUri(req());
    expect(uri).toBe('file:///doc/kids-stories/a3f9c2.webp');
    expect(fsState.downloads).toHaveLength(2);
  });

  it('clears a leftover scratch from an interrupted attempt so it stays retryable', async () => {
    // A prior run was killed mid-download, leaving a .part behind — both the
    // single `.part` older builds wrote and a numbered one. Neither is progress
    // (nothing vouches for its bytes), and neither may block or outlive a retry.
    fsState.files.set('file:///doc/kids-stories', -1);
    fsState.files.set('file:///doc/kids-stories/a3f9c2.webp.part', 700);
    fsState.files.set('file:///doc/kids-stories/a3f9c2.webp.7.part', 900);
    const uri = await cachedAssetUri(req());
    expect(uri).toBe('file:///doc/kids-stories/a3f9c2.webp');
    expect(fsState.files.has('file:///doc/kids-stories/a3f9c2.webp')).toBe(true);
    expect(fsState.transfers[0].resumeFrom).toBeUndefined();
    expect([...fsState.files.keys()].filter(uri => uri.endsWith('.part'))).toEqual([]);
  });

  it('keeps audio and image subdirs separate', async () => {
    const art = await cachedAssetUri(req({ subdir: 'kids-stories', ext: 'webp' }));
    const audio = await cachedAssetUri(req({ subdir: 'audio', ext: 'mp3', remoteUrl: 'https://cdn.example.com/a3f9c2.mp3' }));
    expect(art).toBe('file:///doc/kids-stories/a3f9c2.webp');
    expect(audio).toBe('file:///doc/audio/a3f9c2.mp3');
  });
});

describe('cachedFileUri', () => {
  it('returns null before the asset is cached, so the caller can stream the url', () => {
    expect(cachedFileUri(req())).toBeNull();
  });

  it('returns the local file uri once the asset has been downloaded', async () => {
    await cachedAssetUri(req());
    expect(cachedFileUri(req())).toBe('file:///doc/kids-stories/a3f9c2.webp');
  });
});

describe('slow and interrupted connections', () => {
  /** The platform is read once per process, so a test picks it as it would a device. */
  const onAndroid = () => resetResumableDownloadsForTests({ resumable: true });

  it('lets a slow download run as long as bytes keep arriving', async () => {
    jest.useFakeTimers();
    fsState.manual = true;
    const pending = cachedAssetUri(req({ ext: 'mp3', subdir: 'audio', remoteUrl: 'https://cdn.example.com/a3f9c2.mp3' }));
    await flush();
    // 3 MB at 30 KB/s: one hundred seconds, a byte arriving every ten.
    for (let second = 10; second <= 100; second += 10) {
      jest.advanceTimersByTime(10_000);
      fsState.transfers[0].progress(second * 30_000, 3_000_000);
      await flush();
    }
    expect(fsState.transfers[0].cancelled).toBe(false);
    fsState.transfers[0].finish();
    await expect(pending).resolves.toBe('file:///doc/audio/a3f9c2.mp3');
  });

  it('gives up one stall limit after the last byte, and propagates the failure', async () => {
    jest.useFakeTimers();
    fsState.manual = true;
    const pending = cachedAssetUri(req());
    const settled = pending.then(() => 'stored', (error: Error) => error.name);
    await flush();
    fsState.transfers[0].progress(40_000, 310_000);
    jest.advanceTimersByTime(ASSET_DOWNLOAD_STALL_MS - 1); await flush();
    expect(fsState.transfers[0].cancelled).toBe(false);
    jest.advanceTimersByTime(1); await flush();
    expect(fsState.transfers[0].cancelled).toBe(true);
    await expect(settled).resolves.toBe('DownloadInterrupted');
    expect(fsState.files.has('file:///doc/kids-stories/a3f9c2.webp')).toBe(false);
  });

  it('Android continues an interrupted download from its stored bytes on the next request', async () => {
    onAndroid();
    fsState.manual = true;
    const first = cachedAssetUri(req({ ext: 'mp3', subdir: 'audio', remoteUrl: 'https://cdn.example.com/a3f9c2.mp3' }));
    const firstSettled = first.then(() => 'stored', () => 'failed');
    await flush();
    fsState.transfers[0].progress(1_200_000, 3_000_000);
    fsState.transfers[0].fail();
    await expect(firstSettled).resolves.toBe('failed');
    expect(cachedFileUri(req({ ext: 'mp3', subdir: 'audio' }))).toBeNull();

    const second = cachedAssetUri(req({ ext: 'mp3', subdir: 'audio', remoteUrl: 'https://cdn.example.com/a3f9c2.mp3' }));
    await flush();
    expect(fsState.transfers[1].resumeFrom).toBe(1_200_000);
    fsState.transfers[1].progress(3_000_000, 3_000_000);
    fsState.transfers[1].finish(206);
    await expect(second).resolves.toBe('file:///doc/audio/a3f9c2.mp3');
    expect(fsState.files.get('file:///doc/audio/a3f9c2.mp3')).toBe(3_000_000);
    expect([...fsState.files.keys()].filter(uri => uri.endsWith('.part'))).toEqual([]);
  });

  it('never stores a resumed file when the server sent the whole body again', async () => {
    onAndroid();
    fsState.manual = true;
    const first = cachedAssetUri(req()).then(() => 'stored', () => 'failed');
    await flush();
    fsState.transfers[0].progress(100_000, 310_000);
    fsState.transfers[0].fail();
    await first;

    const second = cachedAssetUri(req()).then(() => 'stored', () => 'failed');
    await flush();
    fsState.transfers[1].progress(110_000, 410_000);
    await expect(second).resolves.toBe('failed');
    expect(fsState.files.has('file:///doc/kids-stories/a3f9c2.webp')).toBe(false);
    expect([...fsState.files.keys()].filter(uri => uri.endsWith('.part'))).toEqual([]);

    // The retry after that starts clean and succeeds.
    fsState.manual = false;
    await expect(cachedAssetUri(req())).resolves.toBe('file:///doc/kids-stories/a3f9c2.webp');
    expect(fsState.transfers[2].resumeFrom).toBeUndefined();
  });

  it.each([404, 503])('HTTP %i is a failure, not a stored asset', async status => {
    fsState.manual = true;
    const pending = cachedAssetUri(req()).then(() => 'stored', () => 'failed');
    await flush();
    fsState.transfers[0].finish(status);
    await expect(pending).resolves.toBe('failed');
    expect(fsState.files.has('file:///doc/kids-stories/a3f9c2.webp')).toBe(false);
  });
});

test('the stall limit is never stricter than the platform’s own client was', () => {
  // Android's client gave up after 10 s without a byte; resuming keeps what arrived.
  expect(assetDownloadStallMs('android')).toBe(15_000);
  // iOS's waits 60 s and cannot resume, so an earlier cut-off would discard a download that was only waiting.
  expect(assetDownloadStallMs('ios')).toBe(60_000);
  expect([15_000, 60_000]).toContain(ASSET_DOWNLOAD_STALL_MS);
});

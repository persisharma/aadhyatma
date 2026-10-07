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
import { cachedAssetUri } from '@/utils/assetCache';

type MockState = { exists: Set<string>; downloads: string[]; fail: Set<string> };

jest.mock('expo-file-system', () => {
  const state: MockState = { exists: new Set(), downloads: [], fail: new Set() };
  const join = (parts: unknown[]) =>
    parts.map(p => (typeof p === 'string' ? p : (p as { uri: string }).uri)).join('/');
  class Directory {
    uri: string;
    constructor(...parts: unknown[]) { this.uri = join(parts); }
    get exists() { return state.exists.has(this.uri); }
    create() { state.exists.add(this.uri); }
  }
  class File {
    uri: string;
    constructor(...parts: unknown[]) { this.uri = join(parts); }
    get exists() { return state.exists.has(this.uri); }
    delete() { state.exists.delete(this.uri); }
    static async downloadFileAsync(url: string, dest: { uri: string }) {
      if (state.fail.has(url)) throw new Error('network down');
      state.downloads.push(dest.uri);
      state.exists.add(dest.uri);
      return dest;
    }
  }
  const Paths = {
    get document() { return new Directory('file:///doc'); },
    get cache() { return new Directory('file:///cache'); },
  };
  return { Directory, File, Paths, __state: state };
});

const fsState = (jest.requireMock('expo-file-system') as { __state: MockState }).__state;

const req = (over: Partial<Parameters<typeof cachedAssetUri>[0]> = {}) => ({
  key: 'a3f9c2',
  ext: 'webp',
  subdir: 'kids-stories',
  remoteUrl: 'https://cdn.example.com/a3f9c2.webp',
  ...over,
});

beforeEach(() => {
  fsState.exists.clear();
  fsState.downloads.length = 0;
  fsState.fail.clear();
});

describe('cachedAssetUri', () => {
  it('stores under the OS-safe document dir, not the evictable cache dir', async () => {
    const uri = await cachedAssetUri(req());
    expect(uri).toBe('file:///doc/kids-stories/a3f9c2.webp');
    expect(uri.startsWith('file:///cache')).toBe(false);
  });

  it('downloads exactly once, then serves the local file with no network', async () => {
    const first = await cachedAssetUri(req());
    const second = await cachedAssetUri(req());
    expect(first).toBe(second);
    expect(fsState.downloads).toEqual(['file:///doc/kids-stories/a3f9c2.webp']);
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
      'file:///doc/kids-stories/a3f9c2.webp',
      'file:///doc/kids-stories/b7e100.webp',
    ]);
  });

  it('propagates a download failure and stores nothing, so the next try retries', async () => {
    fsState.fail.add('https://cdn.example.com/a3f9c2.webp');
    await expect(cachedAssetUri(req())).rejects.toThrow('network down');
    expect(fsState.exists.has('file:///doc/kids-stories/a3f9c2.webp')).toBe(false);

    fsState.fail.clear();
    const uri = await cachedAssetUri(req());
    expect(uri).toBe('file:///doc/kids-stories/a3f9c2.webp');
    expect(fsState.downloads).toEqual(['file:///doc/kids-stories/a3f9c2.webp']);
  });

  it('keeps audio and image subdirs separate', async () => {
    const art = await cachedAssetUri(req({ subdir: 'kids-stories', ext: 'webp' }));
    const audio = await cachedAssetUri(req({ subdir: 'audio', ext: 'mp3', remoteUrl: 'https://cdn.example.com/a3f9c2.mp3' }));
    expect(art).toBe('file:///doc/kids-stories/a3f9c2.webp');
    expect(audio).toBe('file:///doc/audio/a3f9c2.mp3');
  });
});

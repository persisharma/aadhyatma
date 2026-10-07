/**
 * The protected audio cache. Two promises matter and both are tested against
 * real AES (only the filesystem + keychain are mocked):
 *
 *   1. Protection — the persisted `.enc` file is NOT the plaintext mp3 (so a
 *      pulled-off-device copy is unplayable), yet it decrypts back to the exact
 *      original for playback.
 *   2. Download-once — the first play fetches once; a replay in the same session
 *      reuses the plaintext temp, and a later session (temp gone) re-decrypts the
 *      stored `.enc` with NO network. Concurrent first-plays fetch once.
 */
import { playableAudioUri } from '@/utils/encryptedAudioCache';

const PLAINTEXT = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]);

type FsState = { downloads: string[] };

jest.mock('expo-file-system', () => {
  const store = new Map<string, Uint8Array>();
  const dirs = new Set<string>();
  const state: FsState = { downloads: [] };
  const join = (parts: unknown[]) =>
    parts.map(p => (typeof p === 'string' ? p : (p as { uri: string }).uri)).join('/');
  class Directory {
    uri: string;
    constructor(...parts: unknown[]) { this.uri = join(parts); }
    get exists() { return dirs.has(this.uri); }
    create() { dirs.add(this.uri); }
    delete() { dirs.delete(this.uri); for (const k of [...store.keys()]) if (k.startsWith(this.uri)) store.delete(k); }
  }
  class File {
    uri: string;
    constructor(...parts: unknown[]) { this.uri = join(parts); }
    get exists() { return store.has(this.uri); }
    delete() { store.delete(this.uri); }
    async bytes() { return store.get(this.uri)!; }
    write(content: Uint8Array) { store.set(this.uri, content); }
    static async downloadFileAsync(url: string, dest: { uri: string }) {
      state.downloads.push(url);
      store.set(dest.uri, new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]));
      return dest;
    }
  }
  const Paths = {
    get document() { return new Directory('file:///doc'); },
    get cache() { return new Directory('file:///cache'); },
  };
  return { Directory, File, Paths, __store: store, __state: state };
});

jest.mock('@/utils/audioKey', () => ({ getAudioKey: jest.fn(async () => new Uint8Array(32).fill(7)) }));

const fs = jest.requireMock('expo-file-system') as { __store: Map<string, Uint8Array>; __state: FsState };

const HASH = '35646b444c9320a4';
const ENC = `file:///doc/audio-library-enc/${HASH}.enc`;
const TMP = `file:///cache/audio-library-play/${HASH}.mp3`;
const req = () => ({
  key: HASH, ext: 'mp3', subdir: 'audio-library',
  remoteUrl: `https://cdn.vedansh.app/audio-library/${HASH}.mp3`,
});

beforeEach(() => { fs.__store.clear(); fs.__state.downloads.length = 0; });

describe('playableAudioUri', () => {
  it('stores ciphertext (not the mp3) at rest, and decrypts to a playable temp', async () => {
    const uri = await playableAudioUri(req());
    expect(uri).toBe(TMP);
    // persisted .enc is encrypted — different bytes from the original mp3
    expect([...fs.__store.get(ENC)!]).not.toEqual([...PLAINTEXT]);
    // the playable temp round-trips back to the exact plaintext
    expect([...fs.__store.get(TMP)!]).toEqual([...PLAINTEXT]);
  });

  it('downloads once; a same-session replay reuses the temp with no fetch', async () => {
    await playableAudioUri(req());
    await playableAudioUri(req());
    expect(fs.__state.downloads).toHaveLength(1);
  });

  it('collapses concurrent first-plays into a single download', async () => {
    const [a, b] = await Promise.all([playableAudioUri(req()), playableAudioUri(req())]);
    expect(a).toBe(b);
    expect(fs.__state.downloads).toHaveLength(1);
  });

  it('a later session (temp gone) re-decrypts the stored .enc offline', async () => {
    await playableAudioUri(req());
    fs.__store.delete(TMP); // temp cache cleared between sessions
    const uri = await playableAudioUri(req());
    expect(uri).toBe(TMP);
    expect(fs.__state.downloads).toHaveLength(1); // no second network fetch
    expect([...fs.__store.get(TMP)!]).toEqual([...PLAINTEXT]);
  });
});

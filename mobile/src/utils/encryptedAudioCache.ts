/**
 * The protected on-device cache for the audio library (RULEBOOK §audio).
 *
 * Download-once like `assetCache`, but the persisted copy is stored ENCRYPTED
 * (AES-256-CTR, device-local key — see `audioKey`) under the app-private
 * document dir, so the saved file is not a playable mp3: it can't be pulled off
 * the device and opened in another player or shared. Playback decrypts to a
 * transient plaintext file in the (app-private, OS-evictable) cache dir — the
 * unavoidable DRM window — reused for the session and wiped on teardown AND on
 * next launch (see `clearDecryptedAudioCache`) so a force-kill leaves no
 * plaintext lingering across sessions.
 *
 *   first play : download → play the plaintext at once; encrypt → store .enc
 *                in the BACKGROUND (playback never waits on the AES pass)
 *   replay     : decrypt stored .enc → play           (offline, no network)
 *   same session: the plaintext temp is reused directly
 *
 * First play is latency-critical, so it never blocks on crypto: the freshly
 * downloaded bytes are already plaintext, so we play them directly and persist
 * the encrypted `.enc` off the playback path (see `persistEncrypted`). A replay
 * in a later session (temp wiped on launch) still decrypts the stored `.enc`.
 *
 * Every write lands via a `.part`/scratch sibling that is renamed into place
 * only once complete, so an interrupted download/encrypt/decrypt never leaves a
 * half-written `.enc` or temp that a later call would trust — and a leftover
 * scratch from a failed attempt is cleared before retrying (else the native
 * downloader throws `DestinationAlreadyExists` and the track is stuck forever).
 */
import { Directory, File, Paths } from 'expo-file-system';
import * as aesjs from 'aes-js';

import type { CachedAssetRequest } from '@/utils/assetCache';
import { getAudioKey } from '@/utils/audioKey';

const inFlight = new Map<string, Promise<string>>();
// Background `.enc` writes started by a first play, so callers (and tests) can
// await the at-rest encryption that playback deliberately does not wait on.
const persisting = new Map<string, Promise<void>>();

// A 16-byte CTR nonce derived from the content hash, so two different files
// never share a keystream under the one device key (which would leak bytes).
function nonceFor(hash: string): Uint8Array {
  const iv = new Uint8Array(16);
  iv.set(aesjs.utils.hex.toBytes(hash).slice(0, 16));
  return iv;
}

// AES-256-CTR is symmetric: the same keystream XOR both encrypts and decrypts.
// A fresh cipher instance per call keeps the counter from advancing across uses.
// Single seam for the crypto: a native AES backend could slot in here behind a
// `requireOptionalNativeModule` check, keeping the aes-js path as the fallback.
async function cryptAudio(bytes: Uint8Array, hash: string): Promise<Uint8Array> {
  const key = await getAudioKey();
  const ctr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(nonceFor(hash)));
  return ctr.encrypt(bytes);
}

// Encrypt the just-downloaded plaintext and store it at rest, OFF the playback
// path. Best-effort: a failure (or a force-kill mid-write) just means the next
// session re-downloads — it never leaves a half-written `.enc` behind.
async function persistEncrypted(
  plain: Uint8Array,
  hash: string,
  encDir: Directory,
  encFile: File,
  encPart: File,
): Promise<void> {
  try {
    if (encFile.exists) return;
    if (!encDir.exists) encDir.create({ intermediates: true });
    if (encPart.exists) encPart.delete();
    encPart.write(await cryptAudio(plain, hash));
    encPart.move(encFile); // atomic: .enc only ever exists complete
  } catch {
    try {
      if (encPart.exists) encPart.delete();
    } catch {
      /* nothing persisted; next session re-downloads */
    }
  }
}

/** Resolves once the background `.enc` write for a track finishes (test seam). */
export function whenAudioPersisted(key: string): Promise<void> {
  return persisting.get(key) ?? Promise.resolve();
}

/**
 * A playable local `file://` uri for the track. First play downloads once and
 * plays the plaintext immediately (the `.enc` is written in the background);
 * later sessions decrypt the stored `.enc`. Throws if the download fails (caller
 * leaves the track un-started).
 */
export async function playableAudioUri(req: CachedAssetRequest): Promise<string> {
  const tmpDir = new Directory(Paths.cache, `${req.subdir}-play`);
  const tmpFile = new File(tmpDir, `${req.key}.${req.ext}`);
  if (tmpFile.exists) return tmpFile.uri;

  const pending = inFlight.get(req.key);
  if (pending) return pending;

  const task = (async () => {
    const encDir = new Directory(Paths.document, `${req.subdir}-enc`);
    const encFile = new File(encDir, `${req.key}.enc`);
    const encPart = new File(encDir, `${req.key}.enc.part`);
    const dlScratch = new File(tmpDir, `${req.key}.dl`);
    const tmpPart = new File(tmpDir, `${req.key}.${req.ext}.part`);
    try {
      if (!tmpDir.exists) tmpDir.create({ intermediates: true });
      if (!encDir.exists) encDir.create({ intermediates: true });
      if (tmpPart.exists) tmpPart.delete();
      if (encFile.exists) {
        // Cached: decrypt the stored ciphertext for playback (offline, no fetch).
        tmpPart.write(await cryptAudio(await encFile.bytes(), req.key));
      } else {
        // First play: fetch once and play the plaintext straight away. Clear any
        // scratch from a prior interrupted attempt first, or the native
        // downloader rejects (DestinationAlreadyExists) and never retries.
        if (dlScratch.exists) dlScratch.delete();
        await File.downloadFileAsync(req.remoteUrl, dlScratch);
        const plain = await dlScratch.bytes();
        dlScratch.delete();
        tmpPart.write(plain);
        // Encrypt + store at rest OFF the playback path, so start isn't blocked
        // on the AES pass. Tracked so a caller/test can await the .enc write.
        const p = persistEncrypted(plain, req.key, encDir, encFile, encPart)
          .finally(() => { if (persisting.get(req.key) === p) persisting.delete(req.key); });
        persisting.set(req.key, p);
      }
      tmpPart.move(tmpFile); // atomic: the playable temp is complete or absent
      return tmpFile.uri;
    } catch (err) {
      // Leave nothing half-written that a later call would treat as valid.
      if (dlScratch.exists) dlScratch.delete();
      if (tmpPart.exists) tmpPart.delete();
      throw err;
    } finally {
      inFlight.delete(req.key);
    }
  })();

  inFlight.set(req.key, task);
  return task;
}

/** Wipe the plaintext playback temps (called on player teardown and on launch). */
export function clearDecryptedAudioCache(subdir: string): void {
  const tmpDir = new Directory(Paths.cache, `${subdir}-play`);
  if (tmpDir.exists) tmpDir.delete();
}

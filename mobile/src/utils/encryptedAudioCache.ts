/**
 * The protected on-device cache for the audio library (RULEBOOK §audio).
 *
 * Download-once like `assetCache`, but the persisted copy is stored ENCRYPTED
 * (AES-256-CTR, device-local key — see `audioKey`) under the app-private
 * document dir, so the saved file is not a playable mp3: it can't be pulled off
 * the device and opened in another player or shared. Playback decrypts to a
 * transient plaintext file in the (app-private, OS-evictable) cache dir — the
 * unavoidable DRM window — reused for the session and wiped on teardown.
 *
 *   first play : download → encrypt → store .enc → decrypt → play (one fetch)
 *   replay     : decrypt stored .enc → play           (offline, no network)
 *   same session: the plaintext temp is reused directly
 *
 * The .enc file lives in the document dir (survives app close, only cleared on
 * uninstall/clear-storage); the plaintext temp lives in the cache dir.
 */
import { Directory, File, Paths } from 'expo-file-system';
import * as aesjs from 'aes-js';

import type { CachedAssetRequest } from '@/utils/assetCache';
import { getAudioKey } from '@/utils/audioKey';

const inFlight = new Map<string, Promise<string>>();

// A 16-byte CTR nonce derived from the content hash, so two different files
// never share a keystream under the one device key (which would leak bytes).
function nonceFor(hash: string): Uint8Array {
  const iv = new Uint8Array(16);
  iv.set(aesjs.utils.hex.toBytes(hash).slice(0, 16));
  return iv;
}

// AES-256-CTR is symmetric: the same keystream XOR both encrypts and decrypts.
// A fresh cipher instance per call keeps the counter from advancing across uses.
async function xcrypt(bytes: Uint8Array, hash: string): Promise<Uint8Array> {
  const key = await getAudioKey();
  const ctr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(nonceFor(hash)));
  return ctr.encrypt(bytes);
}

/**
 * A playable local `file://` uri for the track, ensuring the source has been
 * downloaded once and stored encrypted, then decrypted for playback. Throws if
 * the download fails (caller leaves the track un-started).
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
    try {
      if (!tmpDir.exists) tmpDir.create({ intermediates: true });
      if (!encFile.exists) {
        if (!encDir.exists) encDir.create({ intermediates: true });
        const scratch = new File(tmpDir, `${req.key}.dl`);
        await File.downloadFileAsync(req.remoteUrl, scratch);
        encFile.write(await xcrypt(await scratch.bytes(), req.key));
        scratch.delete();
      }
      tmpFile.write(await xcrypt(await encFile.bytes(), req.key));
      return tmpFile.uri;
    } finally {
      inFlight.delete(req.key);
    }
  })();

  inFlight.set(req.key, task);
  return task;
}

/** Wipe the plaintext playback temps (called on player teardown). */
export function clearDecryptedAudioCache(subdir: string): void {
  const tmpDir = new Directory(Paths.cache, `${subdir}-play`);
  if (tmpDir.exists) tmpDir.delete();
}

/**
 * The device-local key that encrypts cached audio at rest.
 *
 * A single random 256-bit key per install, held in the OS secure enclave
 * (iOS Keychain / Android Keystore) via `expo-secure-store` — it never touches
 * JS-readable storage, the bundle, or the network. Because the key lives only
 * on this device, an encrypted audio file copied off the device (a backup dump,
 * a rooted pull) is undecryptable elsewhere.
 *
 * `getAudioKey` is memoized on a single in-flight promise so concurrent
 * first-use (two tracks resolving at once) can't each generate-and-store a
 * different key — which would leave the first file's ciphertext undecryptable
 * once the second key overwrote it. On failure the promise is cleared so a
 * transient keychain error stays retryable.
 */
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as aesjs from 'aes-js';

const KEY_NAME = 'vedansh.audioCacheKey.v1';

let keyPromise: Promise<Uint8Array> | null = null;

export function getAudioKey(): Promise<Uint8Array> {
  if (!keyPromise) {
    keyPromise = (async () => {
      const stored = await SecureStore.getItemAsync(KEY_NAME);
      if (stored) return aesjs.utils.hex.toBytes(stored);
      const key = Crypto.getRandomBytes(32);
      await SecureStore.setItemAsync(KEY_NAME, aesjs.utils.hex.fromBytes(key));
      return key;
    })().catch((err) => {
      keyPromise = null; // keep a keychain failure retryable
      throw err;
    });
  }
  return keyPromise;
}

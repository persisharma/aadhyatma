/**
 * The device-local key that encrypts cached audio at rest.
 *
 * A single random 256-bit key per install, held in the OS secure enclave
 * (iOS Keychain / Android Keystore) via `expo-secure-store` — it never touches
 * JS-readable storage, the bundle, or the network. Because the key lives only
 * on this device, an encrypted audio file copied off the device (a backup dump,
 * a rooted pull) is undecryptable elsewhere. Cached in memory after first read
 * so playback doesn't hit the keychain every track.
 */
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as aesjs from 'aes-js';

const KEY_NAME = 'vedansh.audioCacheKey.v1';

let cachedKey: Uint8Array | null = null;

export async function getAudioKey(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey;
  const stored = await SecureStore.getItemAsync(KEY_NAME);
  if (stored) {
    cachedKey = aesjs.utils.hex.toBytes(stored);
    return cachedKey;
  }
  const key = Crypto.getRandomBytes(32);
  await SecureStore.setItemAsync(KEY_NAME, aesjs.utils.hex.fromBytes(key));
  cachedKey = key;
  return key;
}

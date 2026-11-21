/**
 * The one place this install's id is minted.
 *
 * Both the push registrar (`pushToken.ts`) and the daily heartbeat
 * (`deviceHeartbeat.ts`) need the same permission-free handle, and either can run
 * first (the heartbeat runs on devices that never granted notifications). They
 * used to mint it differently — a random UUID here, `Math.random` there; this
 * keeps one minting path with `Crypto.randomUUID()` as the entropy source.
 * An id already stored on the device is always returned unchanged.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { INSTALL_ID_KEY, isUsableInstallId, makeInstallId } from './pushTokenPure';

/**
 * Our stable install id — the device id captured on open.
 *
 * Minted once from a fresh random UUID (no permission, no OS identifier, no push
 * token required), persisted, then read back forever. It is the permission-free
 * handle a server joins the push token to later, so it must exist on the very
 * first open; `Crypto.randomUUID()` carries no privacy-disclosure weight. A
 * failure to read/write storage only costs a redundant mint-and-register on the
 * next open.
 */
export async function getInstallId(now: number = Date.now()): Promise<string> {
  let existing: string | null = null;
  try {
    existing = await AsyncStorage.getItem(INSTALL_ID_KEY);
  } catch {
    existing = null;
  }
  if (isUsableInstallId(existing)) return existing.trim();
  const minted = makeInstallId(Crypto.randomUUID(), now);
  try {
    await AsyncStorage.setItem(INSTALL_ID_KEY, minted);
  } catch {
    // Non-fatal by design: next launch re-captures and re-uploads.
  }
  return minted;
}

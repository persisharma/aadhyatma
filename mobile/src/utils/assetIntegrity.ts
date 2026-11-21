/**
 * Integrity check for a freshly downloaded CDN asset, run BEFORE the scratch
 * file is moved into the persistent cache (and so before it is trusted forever).
 *
 * The bundled manifests carry the file's content digest, not its size: every
 * `key` is the first 16 hex characters of the SHA-256 of the exact bytes
 * (`scripts/upload-r2-assets.mjs`, checked against the live CDN). So:
 *
 *   - Always: the file must exist and be non-empty.
 *   - When the key is such a digest and the file is at most
 *     `VERIFY_DIGEST_MAX_BYTES` (every image and every track today): the bytes are
 *     read natively and hashed with expo-crypto's native SHA-256, then compared to
 *     the key. Nothing is hashed in JS; the JS thread only awaits two native calls.
 *   - Larger files get the size check only. Pulling a multi-megabyte body through
 *     JS to hash it is not worth it for public audio; the transport already fails
 *     a connection that ends short of Content-Length.
 *
 * It runs once per download, never on a cache hit, so launches pay nothing.
 */
export const VERIFY_DIGEST_MAX_BYTES = 4 * 1024 * 1024;
const KEY_IS_DIGEST_PREFIX = /^[0-9a-f]{16}$/;

export class AssetIntegrityError extends Error {
  constructor(reason: string) {
    super(`Downloaded asset failed verification: ${reason}`);
    this.name = 'AssetIntegrityError';
  }
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Resolves when `uri` holds the bytes `key` names; rejects with `AssetIntegrityError` otherwise. */
export async function verifyDownloadedAsset(uri: string, key: string): Promise<void> {
  // Required at call time, not imported: this module sits on the artwork-cache
  // path, and the native modules are only needed once a download has finished.
  const { File } = require('expo-file-system') as typeof import('expo-file-system');
  const file = new File(uri);
  const size = file.exists ? file.size : 0;
  if (size <= 0) throw new AssetIntegrityError('file is empty');
  if (size > VERIFY_DIGEST_MAX_BYTES || !KEY_IS_DIGEST_PREFIX.test(key)) return;
  const Crypto = require('expo-crypto') as typeof import('expo-crypto');
  const digest = toHex(await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, await file.bytes()));
  if (!digest.startsWith(key)) throw new AssetIntegrityError('content does not match its key');
}

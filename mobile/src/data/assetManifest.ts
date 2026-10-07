/**
 * Resolves a remote-asset manifest entry to a concrete download request.
 *
 * The heavy folders (kids-stories art, audio library) are uploaded to R2 under
 * content-hashed keys and described by a committed manifest JSON per type
 * (`kidsStoryAssetManifest.json`, `audioAssetManifest.json`): a stable stem
 * (`kj-01`) → `{ hash, ext }`. The live CDN base is injected at build time via
 * `EXPO_PUBLIC_ASSET_BASE_URL` (public, not a secret — it is a plain URL), so
 * swapping the host never touches code or the manifest.
 *
 * When no base URL is configured, or the stem is unknown, resolution returns
 * null and the caller falls back to its placeholder — nothing throws.
 */
import type { CachedAssetRequest } from '@/utils/assetCache';

export const ASSET_BASE_URL_ENV_VAR = 'EXPO_PUBLIC_ASSET_BASE_URL';

export interface RemoteAssetManifest {
  /** R2 key prefix / document subdir, e.g. `kids-stories` or `audio-library`. */
  prefix: string;
  /** stem (e.g. `kj-01`) → content hash + extension. */
  assets: Record<string, { hash: string; ext: string }>;
}

/**
 * The configured CDN base (trailing slash trimmed), or null when unset or not
 * an https URL. Read as the full literal so babel inlines it in release bundles
 * (see the EXPO_PUBLIC note in `pushTokenPure.ts`).
 */
export function assetBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_ASSET_BASE_URL;
  if (!value || !value.startsWith('https://')) return null;
  return value.replace(/\/+$/, '');
}

/**
 * The download request for one manifest stem, or null when the stem is unknown
 * or no base URL is configured.
 */
export function remoteAssetRequest(
  manifest: RemoteAssetManifest,
  stem: string,
  baseUrl: string | null,
): CachedAssetRequest | null {
  const entry = manifest.assets[stem];
  if (!entry || !baseUrl) return null;
  return {
    key: entry.hash,
    ext: entry.ext,
    subdir: manifest.prefix,
    remoteUrl: `${baseUrl}/${manifest.prefix}/${entry.hash}.${entry.ext}`,
  };
}

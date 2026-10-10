/**
 * Audio-library track registry.
 *
 * The recordings are served from the R2 CDN (not bundled). The player streams
 * the CDN url on first play and caches the file once on-device (plain, see
 * `assetCache`) for instant/offline replay. A track id maps to its uploaded file
 * through `audioAssetManifest.json` via `audioRemoteRequest(id)`.
 *
 * Only tracks present in the manifest have audio: the library and the reader
 * play button show a track ONLY when `hasRealAudio` is true, so nothing surfaces
 * without a recording behind it. Add a track by uploading its mp3 (the manifest
 * entry) — no bundled `require()`.
 */
import audioManifestJson from '@/data/audioAssetManifest.json';
import { assetBaseUrl, remoteAssetRequest, type RemoteAssetManifest } from '@/data/assetManifest';
import type { CachedAssetRequest } from '@/utils/assetCache';

const audioManifest = audioManifestJson as RemoteAssetManifest;

/** True when a recording exists for this track id (drives the play button). */
export function hasRealAudio(trackId: string): boolean {
  return Object.prototype.hasOwnProperty.call(audioManifest.assets, trackId);
}

/** The CDN download request for a track, or null when it has no audio / no base URL. */
export function audioRemoteRequest(trackId: string): CachedAssetRequest | null {
  return remoteAssetRequest(audioManifest, trackId, assetBaseUrl());
}

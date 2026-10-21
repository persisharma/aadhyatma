import manifestJson from './vidhiArtworkManifest.json';
import { assetBaseUrl, remoteAssetRequest, type RemoteAssetManifest } from './assetManifest';
import type { VidhiVisualKey } from './vidhi/stepVisuals';

export type VidhiArtwork = Readonly<{ kind: 'vidhi-artwork'; stem: VidhiVisualKey }>;
const manifest: RemoteAssetManifest & {
  assets: Record<string, { hash: string; ext: string; width: number; height: number }>;
} = manifestJson;

/** R2 descriptors only: source paintings never enter the app asset graph. */
export function vidhiArtworkAsset(stem: VidhiVisualKey): VidhiArtwork {
  return { kind: 'vidhi-artwork', stem };
}

export function vidhiArtworkRequest(source: VidhiArtwork) {
  return remoteAssetRequest(manifest, source.stem, assetBaseUrl());
}

/** Complete canvas dimensions are known before any image downloads. */
export function vidhiArtworkAspectRatio(stem: VidhiVisualKey): number {
  const entry = manifest.assets[stem];
  return entry && entry.width > 0 && entry.height > 0 ? entry.width / entry.height : 1.5;
}

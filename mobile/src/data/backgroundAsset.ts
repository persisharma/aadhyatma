import manifest from './backgroundAssetManifest.json';
import { assetBaseUrl, remoteAssetRequest } from './assetManifest';
import type { CachedAssetRequest } from '@/utils/assetCache';

export type RemoteBackground = Readonly<{ kind: 'remote-background'; stem: string }>;
export type BackgroundImage = number | RemoteBackground;
const BUNDLED_READING_STEM = 'backgrounds--reading-parchment-option2';

/** Descriptors keep the original paintings out of Metro's bundled asset graph. */
export function backgroundAsset(stem: keyof typeof manifest.assets): RemoteBackground {
  return { kind: 'remote-background', stem };
}

export function backgroundRequest(source?: BackgroundImage | null): CachedAssetRequest | null {
  // This exact paper is already in the asset graph as the offline fallback.
  // Neutral surfaces can reuse it immediately without fetching a duplicate copy.
  if (!source || typeof source === 'number' || source.stem === BUNDLED_READING_STEM) return null;
  return remoteAssetRequest(manifest, source.stem, assetBaseUrl());
}

/** Known before fetching, so artwork never resizes or shifts text after loading. */
export function backgroundAspectRatio(source?: BackgroundImage | null): number | undefined {
  if (!source || typeof source === 'number') return undefined;
  const asset = manifest.assets[source.stem as keyof typeof manifest.assets];
  return asset && asset.width > 0 && asset.height > 0 ? asset.width / asset.height : undefined;
}

export const readingParchment = backgroundAsset(BUNDLED_READING_STEM);

// Neutral paper is suitable for every deity and tradition. Never show a
// different deity or a generic painting labelled as a specific temple offline.
export const bundledReadingFallback = require('@assets/backgrounds/reading-parchment-option2.webp') as number;

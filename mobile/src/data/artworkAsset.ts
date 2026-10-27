import { backgroundRequest, type BackgroundImage } from './backgroundAsset';
import { readerIllustrationRequest, type ReaderIllustration } from './readerIllustrationAsset';
import type { VidhiArtwork } from './vidhiArtworkAsset';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';

export type DevotionalPortrait = Readonly<{ kind: 'devotional-portrait'; art: DevotionalArt }>;
export type KidsStoryPortrait = Readonly<{ kind: 'kids-story-portrait'; stem: string }>;
export type ArtworkImage = BackgroundImage | ReaderIllustration | VidhiArtwork | DevotionalPortrait | KidsStoryPortrait;

/** One loader/cache queue, independent manifests and R2 categories. */
export function artworkRequest(source?: ArtworkImage | null) {
  if (source && typeof source !== 'number' && source.kind === 'kids-story-portrait') {
    const { assetBaseUrl, remoteAssetRequest } = require('./assetManifest') as typeof import('./assetManifest');
    const manifest = require('./kidsStoryAssetManifest.json') as import('./assetManifest').RemoteAssetManifest;
    return remoteAssetRequest(manifest, source.stem, assetBaseUrl());
  }
  if (source && typeof source !== 'number' && source.kind === 'devotional-portrait') {
    const { devotionalArtRequest } = require('./devotionalShareArt') as typeof import('./devotionalShareArt');
    return devotionalArtRequest(source.art);
  }
  if (source && typeof source !== 'number' && source.kind === 'vidhi-artwork') {
    // The shared loader is reached at launch; puja metadata belongs to its guide.
    const { vidhiArtworkRequest } = require('./vidhiArtworkAsset') as typeof import('./vidhiArtworkAsset');
    return vidhiArtworkRequest(source);
  }
  if (source && typeof source !== 'number' && source.kind === 'reader-illustration') {
    return readerIllustrationRequest(source);
  }
  return backgroundRequest(source);
}

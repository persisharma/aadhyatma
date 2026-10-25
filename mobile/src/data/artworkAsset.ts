import { backgroundRequest, type BackgroundImage } from './backgroundAsset';
import { readerIllustrationRequest, type ReaderIllustration } from './readerIllustrationAsset';
import type { VidhiArtwork } from './vidhiArtworkAsset';

export type ArtworkImage = BackgroundImage | ReaderIllustration | VidhiArtwork;

/** One loader/cache queue, independent manifests and R2 categories. */
export function artworkRequest(source?: ArtworkImage | null) {
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

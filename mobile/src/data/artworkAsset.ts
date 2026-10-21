import { backgroundRequest, type BackgroundImage } from './backgroundAsset';
import { readerIllustrationRequest, type ReaderIllustration } from './readerIllustrationAsset';
import { vidhiArtworkRequest, type VidhiArtwork } from './vidhiArtworkAsset';

export type ArtworkImage = BackgroundImage | ReaderIllustration | VidhiArtwork;

/** One loader/cache queue, independent manifests and R2 categories. */
export function artworkRequest(source?: ArtworkImage | null) {
  if (source && typeof source !== 'number' && source.kind === 'vidhi-artwork') {
    return vidhiArtworkRequest(source);
  }
  if (source && typeof source !== 'number' && source.kind === 'reader-illustration') {
    return readerIllustrationRequest(source);
  }
  return backgroundRequest(source);
}

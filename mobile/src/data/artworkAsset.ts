import { backgroundRequest, type BackgroundImage } from './backgroundAsset';
import { readerIllustrationRequest, type ReaderIllustration } from './readerIllustrationAsset';

export type ArtworkImage = BackgroundImage | ReaderIllustration;

/** One loader/cache queue, independent manifests and R2 categories. */
export function artworkRequest(source?: ArtworkImage | null) {
  if (source && typeof source !== 'number' && source.kind === 'reader-illustration') {
    return readerIllustrationRequest(source);
  }
  return backgroundRequest(source);
}

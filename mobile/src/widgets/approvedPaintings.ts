// Approved Heritage painted subjects for the in-app widget gallery.
// Use the existing published R2 manifest + CachedArtwork queue. Loading 11
// source WebPs with require() would violate RULEBOOK 11.8 and bloat the app
// bundle. The independent iOS WidgetKit extension bundles bounded native art.
import { readerIllustrationAsset, type ReaderIllustration } from '@/data/readerIllustrationAsset';

export const vividHeritageImages: Record<string, ReaderIllustration> = {
  prayer: readerIllustrationAsset('category-granth-open-scripture'),
  vishnu: readerIllustrationAsset('source-vishnu-narayana'),
  krishna: readerIllustrationAsset('deity-krishna-bansuri'),
  shiva: readerIllustrationAsset('shiva'),
  hanuman: readerIllustrationAsset('ram-hanuman'),
  rama: readerIllustrationAsset('deity-rama-darbar'),
  ganesha: readerIllustrationAsset('deity-ganesha-modak'),
  durga: readerIllustrationAsset('deity-durga-lion'),
  saraswati: readerIllustrationAsset('deity-saraswati-veena'),
  surya: readerIllustrationAsset('deity-surya'),
  panchang: readerIllustrationAsset('panchang-celestial-almanac'),
};

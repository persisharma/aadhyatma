import backgrounds from './backgroundAssetManifest.json';
import devotional from './devotionalShareManifest.json';
import suvichar from './suvicharManifest.json';
import artwork from './parshuramPublication.json';
import reader from './readerIllustrationManifest.json';

const manifests: Record<string, { assets: Record<string, { hash: string }> }> = { 'reading-backgrounds': backgrounds, 'devotional-share': devotional, suvichar, 'reader-illustrations': reader };
/** Activation is written only after every public CDN object matches its source bytes. */
export const parshuramPublished = artwork.publication === 'verified' && artwork.assets
  .every(a => manifests[a.prefix]?.assets[a.stem]?.hash === a.hash);

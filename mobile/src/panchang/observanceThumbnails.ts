import type { ArtworkImage } from '@/data/artworkAsset';

/** Small whole-canvas copies of approved paintings; calendar art paints offline. */
const thumbnails: Readonly<Record<string, number>> = {
  'reader-illustration:category-aarti-diya': require('@assets/icons/observance-thumbnails/category-aarti-diya.webp'),
  'reader-illustration:category-granth-open-scripture': require('@assets/icons/observance-thumbnails/category-granth-open-scripture.webp'),
  'reader-illustration:daan-annapurna-bhiksha': require('@assets/icons/observance-thumbnails/daan-annapurna-bhiksha.webp'),
  'reader-illustration:deity-dattatreya': require('@assets/icons/observance-thumbnails/deity-dattatreya.webp'),
  'reader-illustration:deity-durga-lion': require('@assets/icons/observance-thumbnails/deity-durga-lion.webp'),
  'reader-illustration:deity-ganesha-modak': require('@assets/icons/observance-thumbnails/deity-ganesha-modak.webp'),
  'reader-illustration:deity-ganga': require('@assets/icons/observance-thumbnails/deity-ganga.webp'),
  'reader-illustration:deity-krishna-bansuri': require('@assets/icons/observance-thumbnails/deity-krishna-bansuri.webp'),
  'reader-illustration:deity-lakshmi': require('@assets/icons/observance-thumbnails/deity-lakshmi.webp'),
  'reader-illustration:deity-narasimha-prahlad': require('@assets/icons/observance-thumbnails/deity-narasimha-prahlad.webp'),
  'reader-illustration:deity-parvati-bhavani': require('@assets/icons/observance-thumbnails/deity-parvati-bhavani.webp'),
  'reader-illustration:deity-radha-krishna': require('@assets/icons/observance-thumbnails/deity-radha-krishna.webp'),
  'reader-illustration:deity-rama-darbar': require('@assets/icons/observance-thumbnails/deity-rama-darbar.webp'),
  'reader-illustration:deity-saraswati-veena': require('@assets/icons/observance-thumbnails/deity-saraswati-veena.webp'),
  'reader-illustration:deity-shani': require('@assets/icons/observance-thumbnails/deity-shani.webp'),
  'reader-illustration:deity-surya': require('@assets/icons/observance-thumbnails/deity-surya.webp'),
  'reader-illustration:hanuman-sita': require('@assets/icons/observance-thumbnails/hanuman-sita.webp'),
  'reader-illustration:shiva': require('@assets/icons/observance-thumbnails/shiva.webp'),
  'reader-illustration:source-vishnu-narayana': require('@assets/icons/observance-thumbnails/source-vishnu-narayana.webp'),
  'reader-illustration:theerth-gogaji-gogamedi': require('@assets/icons/observance-thumbnails/theerth-gogaji-gogamedi.webp'),
  'reader-illustration:theerth-khandoba-jejuri': require('@assets/icons/observance-thumbnails/theerth-khandoba-jejuri.webp'),
  'reader-illustration:theerth-ramdevra': require('@assets/icons/observance-thumbnails/theerth-ramdevra.webp'),
  'reader-illustration:theerth-tejaji-kharnal': require('@assets/icons/observance-thumbnails/theerth-tejaji-kharnal.webp'),
  'reader-illustration:theerth-vetrimalai-murugan': require('@assets/icons/observance-thumbnails/theerth-vetrimalai-murugan.webp'),
  'vidhi-artwork:kalash': require('@assets/icons/observance-thumbnails/kalash.webp'),
  'vidhi-artwork:vrat-naivedya': require('@assets/icons/observance-thumbnails/vrat-naivedya.webp'),
};

export function observanceThumbnail(source: ArtworkImage): ArtworkImage {
  if (typeof source === 'number') return source;
  if (source.kind === 'reader-illustration' || source.kind === 'vidhi-artwork') {
    return thumbnails[`${source.kind}:${source.stem}`] ?? source;
  }
  return source;
}

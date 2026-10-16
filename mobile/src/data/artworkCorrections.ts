import type { ArtworkImage } from './artworkAsset';

/** Reviewed refinements ship offline and supersede stale CDN cache entries. */
export function bundledArtworkCorrection(source?: ArtworkImage | null): number | null {
  if (!source || typeof source === 'number') return null;
  if (source.kind === 'remote-background') {
    if (source.stem === 'backgrounds--theerth-karni-mata') {
      return require('@assets/artwork-corrections/theerth-karni-mata-background.webp') as number;
    }
    if (source.stem === 'chalisa--Hanuman_sita') {
      return require('@assets/artwork-corrections/hanuman-sita-background.webp') as number;
    }
    if (source.stem === 'chalisa--Ram_hanuman') {
      return require('@assets/artwork-corrections/ram-hanuman-background.webp') as number;
    }
    if (source.stem === 'backgrounds--deity-rama-darbar') {
      return require('@assets/artwork-corrections/rama-darbar-background.webp') as number;
    }
  } else if (source.kind === 'reader-illustration' && source.stem === 'theerth-karni-mata') {
    return require('@assets/artwork-corrections/theerth-karni-mata-banner.webp') as number;
  }
  return null;
}

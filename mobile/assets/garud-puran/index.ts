import type { GarudPuranArtId } from '../../src/data/garud-puran';

/** Each scene is pinned to its own story; no random rotation. */
export const garudPuranImages: Record<GarudPuranArtId, number> = {
  cover: require('./cover.webp'),
  daan: require('./daan.webp'),
  babhruvahana: require('./babhruvahana.webp'),
  'five-pretas': require('./five-pretas.webp'),
  viravahana: require('./viravahana.webp'),
  'sita-ancestors': require('./sita-ancestors.webp'),
  ancestors: require('./ancestors.webp'),
  yama: require('./yama.webp'),
  vaitarani: require('./vaitarani.webp'),
};

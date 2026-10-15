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

/**
 * Where each 2:1 painting's subject sits (0–1 across its width), so the 4:5
 * listing thumb crops around it rather than the empty middle (design.md §81).
 */
export const garudPuranThumbFocus: Record<GarudPuranArtId, number> = {
  cover: 0.68, // Vishnu
  daan: 0.52, // the offering between giver and sage
  babhruvahana: 0.45,
  'five-pretas': 0.6, // the five pretas
  viravahana: 0.47,
  'sita-ancestors': 0.5, // the ancestors above the shraddha
  ancestors: 0.42, // pinda and kalash
  yama: 0.75, // Yama
  vaitarani: 0.3, // the cow at the river
};

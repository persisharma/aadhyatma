import type { GarudPuranArtId } from '../../src/data/garud-puran';
import { backgroundAsset, type RemoteBackground } from '../../src/data/backgroundAsset';

/**
 * Each scene is pinned to its own story; no random rotation. The paintings
 * here are publishing sources for R2 (`prepare-reading-backgrounds.mjs`),
 * resolved through the background manifest rather than bundled.
 */
export const garudPuranImages: Record<GarudPuranArtId, RemoteBackground> = {
  cover: backgroundAsset('garud-puran--cover'),
  daan: backgroundAsset('garud-puran--daan'),
  babhruvahana: backgroundAsset('garud-puran--babhruvahana'),
  'five-pretas': backgroundAsset('garud-puran--five-pretas'),
  viravahana: backgroundAsset('garud-puran--viravahana'),
  'sita-ancestors': backgroundAsset('garud-puran--sita-ancestors'),
  ancestors: backgroundAsset('garud-puran--ancestors'),
  yama: backgroundAsset('garud-puran--yama'),
  vaitarani: backgroundAsset('garud-puran--vaitarani'),
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

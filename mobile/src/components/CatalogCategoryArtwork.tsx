import React from 'react';
import { View } from 'react-native';
import CachedArtwork from './CachedArtwork';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';
import { vidhiArtworkAsset } from '@/data/vidhiArtworkAsset';
import { observanceThumbnail } from '@/panchang/observanceThumbnails';
import type { ArtworkImage } from '@/data/artworkAsset';

export const catalogCategoryScenes = {
  vrat: vidhiArtworkAsset('kalash'),
  aarti: readerIllustrationAsset('category-aarti-diya'),
  practice: vidhiArtworkAsset('vrat-naivedya'),
  granth: readerIllustrationAsset('category-granth-open-scripture'),
} satisfies Record<string, ArtworkImage>;
export type CatalogArtworkName = keyof typeof catalogCategoryScenes;

/** Existing ritual paintings, sized as the same wide vignettes as the reference. */
export default function CatalogCategoryArtwork({ name }: { name: CatalogArtworkName }) {
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: 64, height: 44, borderRadius: 10, overflow: 'hidden' }}>
    <CachedArtwork source={observanceThumbnail(catalogCategoryScenes[name])} style={{ width: 64, height: 44 }} />
  </View>;
}

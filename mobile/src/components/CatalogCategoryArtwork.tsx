import React from 'react';
import { View } from 'react-native';
import CachedArtwork from './CachedArtwork';
import StoryIcon, { type StoryIconName } from './StoryIcon';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';
import { vidhiArtworkAsset } from '@/data/vidhiArtworkAsset';
import type { ArtworkImage } from '@/data/artworkAsset';

const scenes: Record<string, ArtworkImage> = {
  vrat: vidhiArtworkAsset('kalash'),
  aarti: readerIllustrationAsset('category-aarti-diya'),
  practice: vidhiArtworkAsset('thali-phera'),
  granth: readerIllustrationAsset('category-granth-open-scripture'),
};

/** Existing ritual paintings, sized as the same wide vignettes as the reference. */
export default function CatalogCategoryArtwork({ name }: { name: StoryIconName }) {
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={{ width: 64, height: 44, borderRadius: 10, overflow: 'hidden' }}>
    <CachedArtwork source={scenes[name]} style={{ width: 64, height: 44 }}
      fallback={<StoryIcon name={name} size={44} />} />
  </View>;
}

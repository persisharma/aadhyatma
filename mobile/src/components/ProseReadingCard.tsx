import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { ReadingImage } from '@/data/readerIllustrationAsset';
import ReadingArtwork from './ReadingArtwork';

/** The approved continuous folio: heading, full painting, divider, then prose. */
export default function ProseReadingCard({ children, heading, illustration, style }: {
  children: React.ReactNode;
  heading?: React.ReactNode;
  illustration?: ReadingImage | null;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View testID="prose-reading-card" style={style}>
      {heading}
      <ReadingArtwork source={illustration} />
      {children}
    </View>
  );
}

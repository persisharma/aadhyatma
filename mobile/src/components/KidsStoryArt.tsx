import React from 'react';
import { Image, View, Text, type ImageSourcePropType } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

// Static Metro imports keep shared illustrations bundled and available offline.
const images: Record<string, ImageSourcePropType> = {
  cover: require('../../assets/kids-stories/kj-01.webp'),
  chariot: require('../../assets/kids-stories/kj-02.webp'),
  sword: require('../../assets/kids-stories/kj-03.webp'),
  prison: require('../../assets/kids-stories/kj-04.webp'),
  midnight: require('../../assets/kids-stories/kj-05.webp'),
  vishnu: require('../../assets/kids-stories/kj-06.webp'),
  escape: require('../../assets/kids-stories/kj-07.webp'),
  yamuna: require('../../assets/kids-stories/kj-08.webp'),
  gokul: require('../../assets/kids-stories/kj-09.webp'),
  devi: require('../../assets/kids-stories/kj-10.webp'),
};
export default function KidsStoryArt({ art, label }: { art: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="image" accessibilityLabel={label} style={{ width: '100%', aspectRatio: 1, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.parchmentSoft }}>
      {images[art] ? (
        // Every illustration is a 4:5 (1122×1402) watercolour with a wide empty parchment floor
        // baked into its bottom. A square frame + `cover` center-crops that portrait art, trimming
        // the empty floor (and a sliver of the top wall) so the figures sit framed — tighter art
        // and more room for the caption below.
        <Image accessible={false} source={images[art]} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ color: colors.ink, padding: 20 }}>{label}</Text>
      )}
    </View>
  );
}

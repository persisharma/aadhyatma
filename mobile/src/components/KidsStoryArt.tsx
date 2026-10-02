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
// The art fills whatever vertical space the page layout leaves for it (`flex: 1`
// from the parent), so the caption below always stays on screen. `cover` crops
// the 4:5 illustration to fill that frame — trimming the soft parchment/ground
// band at the foot (and a little sky) rather than letterboxing — so no empty
// space remains. minHeight keeps the art readable when a long caption squeezes it.
export default function KidsStoryArt({ art, label }: { art: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="image" accessibilityLabel={label} style={{ flex: 1, width: '100%', minHeight: 150, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.parchmentSoft }}>
      {images[art] ? (
        <Image accessible={false} source={images[art]} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
      ) : (
        <Text style={{ color: colors.ink, padding: 20 }}>{label}</Text>
      )}
    </View>
  );
}

import React from 'react';
import { Image, View, Text, type ImageSourcePropType } from 'react-native';
import { SvgXml } from 'react-native-svg';
import placeholderArt from '@/data/kidsStories/placeholder-art.json';
import { useTheme } from '@/theme/ThemeContext';

// Static Metro imports keep shared illustrations bundled and available offline.
const images: Record<string, ImageSourcePropType> = {
  yamuna: require('../../assets/kids-stories/kj-08.webp'),
};
const placeholders: Record<string, string> = placeholderArt;
export default function KidsStoryArt({ art, label }: { art: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="image" accessibilityLabel={label} style={{ width: '100%', aspectRatio: 4 / 5, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.parchmentSoft }}>
      {images[art] ? (
        <Image accessible={false} source={images[art]} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
      ) : placeholders[art] ? (
        <SvgXml accessible={false} xml={placeholders[art]} width="100%" height="100%" />
      ) : (
        <Text style={{ color: colors.ink, padding: 20 }}>{label}</Text>
      )}
    </View>
  );
}

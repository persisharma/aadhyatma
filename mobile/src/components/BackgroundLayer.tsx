import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { backgroundAspectRatio, readingParchment, type BackgroundImage } from '@/data/backgroundAsset';
import BackgroundArtwork from './BackgroundArtwork';

type Props = {
  source?: BackgroundImage | null;
};

export default function BackgroundLayer({ source }: Props) {
  const { colors } = useTheme();

  if (source === readingParchment) {
    return <BackgroundArtwork source={source} style={StyleSheet.absoluteFill} />;
  }

  if (!source) {
    return (
      <LinearGradient
        pointerEvents="none"
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  const bundled = typeof source === 'number' ? Image.resolveAssetSource(source) : undefined;
  const aspectRatio = backgroundAspectRatio(source)
    ?? (bundled?.width && bundled?.height ? bundled.width / bundled.height : 1);

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { backgroundColor: colors.parchment }]}>
      {/* Keep complete figures and attributes visible; fade the paper edge. */}
      <View style={[styles.artwork, { aspectRatio }]}>
        <BackgroundArtwork source={source} resizeMode="contain" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[colors.artworkFadeClear, colors.parchment]}
          locations={[0.65, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <LinearGradient
        colors={[colors.overlayTop, colors.overlayUpper, colors.overlayLower, colors.overlayBottom]}
        locations={[0, 0.4, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  artwork: { position: 'absolute', top: 0, left: 0, width: '100%', maxHeight: '100%' },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { readingParchment, type BackgroundImage } from '@/data/backgroundAsset';
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

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
      <BackgroundArtwork source={source} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[colors.overlayTop, colors.overlayUpper, colors.overlayLower, colors.overlayBottom]}
        locations={[0, 0.4, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import BackgroundLayer from '@/components/BackgroundLayer';
import { useTheme } from '@/theme/ThemeContext';

// One detailed wheel is reused by Home and Panchang. The small introduction
// seal has simpler strokes; neither drawing represents a calculated chart.
export const celestialChakraSources = {
  wheel: require('@assets/decorations/celestial-chakra/wheel.png'),
  seal: require('@assets/decorations/celestial-chakra/seal.png'),
};

const decorative = {
  accessible: false,
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants' as const,
  pointerEvents: 'none' as const,
};

export function PanchangChakraBackground() {
  return (
    <View {...decorative} style={[StyleSheet.absoluteFillObject, styles.clip]}>
      <BackgroundLayer />
      <Image source={celestialChakraSources.wheel} resizeMode="contain" style={styles.backdropWheel} />
    </View>
  );
}

export function TodayChakraOrnament() {
  const { radii } = useTheme();
  return (
    // Clip only the decoration. Clipping TodayStrip itself loses its iOS shadow.
    <View {...decorative} style={[StyleSheet.absoluteFillObject, styles.clip, { borderRadius: radii.lg }]}>
      <Image source={celestialChakraSources.wheel} resizeMode="contain" style={styles.cardWheel} />
    </View>
  );
}

export function JyotishChakraSeal() {
  return <Image {...decorative} source={celestialChakraSources.seal} resizeMode="contain" style={styles.seal} />;
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  backdropWheel: { position: 'absolute', width: 360, height: 360, left: -70, top: -110, opacity: 0.18 },
  cardWheel: { position: 'absolute', width: 160, height: 160, right: 4, top: -32, opacity: 0.32 },
  seal: { width: 54, height: 54 },
});

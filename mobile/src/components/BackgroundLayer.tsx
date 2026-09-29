import React from 'react';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  source?: number | null;
  /**
   * `cover` (default) fills the screen, cropping a square plate to its middle
   * ~46% on a portrait phone. `width` pins the whole plate, screen-wide, to the
   * top — for wide compositions whose subjects sit near the edges.
   */
  fit?: 'cover' | 'width';
};

export default function BackgroundLayer({ source, fit = 'cover' }: Props) {
  const { colors } = useTheme();

  if (!source) {
    return (
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  const overlay = (
    <LinearGradient
      colors={[colors.overlayTop, colors.overlayUpper, colors.overlayLower, colors.overlayBottom]}
      locations={[0, 0.4, 0.85, 1]}
      style={StyleSheet.absoluteFill}
    />
  );

  if (fit === 'width') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.widthFit}>
          <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
          {/* Dissolve the plate's worn lower edge into the page so no seam shows. */}
          <LinearGradient
            colors={['rgba(243, 231, 201, 0)', colors.parchment]}
            locations={[0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
        {overlay}
      </View>
    );
  }

  return (
    <ImageBackground source={source} style={StyleSheet.absoluteFill} resizeMode="cover">
      {overlay}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  widthFit: { width: '100%', aspectRatio: 1 },
});

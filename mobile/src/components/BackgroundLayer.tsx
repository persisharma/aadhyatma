import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  source?: number | null;
};

export default function BackgroundLayer({ source }: Props) {
  const { colors } = useTheme();

  if (!source) {
    return (
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <ImageBackground source={source} style={StyleSheet.absoluteFill} resizeMode="cover">
      <LinearGradient
        colors={[colors.overlayTop, colors.overlayUpper, colors.overlayLower, colors.overlayBottom]}
        locations={[0, 0.4, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />
    </ImageBackground>
  );
}

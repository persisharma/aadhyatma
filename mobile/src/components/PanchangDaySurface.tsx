import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

type Props = Omit<React.ComponentProps<typeof LinearGradient>, 'colors' | 'start' | 'end'> & {
  avoid?: boolean;
};

/** Shared 160-degree painted-card surface for the Panchang day panel. */
export default function PanchangDaySurface({ avoid = false, style, ...props }: Props) {
  const { colors, radii, elevation } = useTheme();
  return (
    <LinearGradient
      {...props}
      colors={avoid
        ? [colors.panchangAvoidFrom, colors.panchangAvoidTo]
        : [colors.panchangTileFrom, colors.panchangTileTo]}
      start={{ x: 0.329, y: 0.03 }}
      end={{ x: 0.671, y: 0.97 }}
      style={[
        { borderWidth: 1, borderRadius: radii.lg, borderColor: avoid ? colors.panchangAvoidBorder : colors.panchangTileBorder },
        elevation.card,
        style,
      ]}
    />
  );
}

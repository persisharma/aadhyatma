import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

/**
 * A fully-bloomed lotus built from View+gradient petals (the repo has no SVG —
 * see CategoryIcon for the same convention). Twelve identical petals radiate a
 * full 360° around a central saffron hub: each petal pivots from its base at the
 * box centre via `transformOrigin`, so rotating it sweeps the petal outward like
 * an open bloom. Used as the completed routine's "पूर्ण" achievement mark and the
 * settle frame of the pushpa-varsha.
 */
const PETALS = 12;
const ANGLES = Array.from({ length: PETALS }, (_, i) => Math.round((360 / PETALS) * i));

export default function LotusMark({ size = 30 }: { size?: number }) {
  const { colors } = useTheme();
  const center = size / 2;
  const pw = Math.max(4, Math.round(size * 0.16));
  const ph = Math.round(size * 0.44);
  const hub = Math.round(size * 0.3);

  return (
    <View style={{ width: size, height: size }} accessible={false}>
      {ANGLES.map((deg) => (
        <LinearGradient
          key={deg}
          colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            left: center - pw / 2,
            top: center - ph,
            width: pw,
            height: ph,
            borderRadius: pw,
            borderWidth: 0.5,
            borderColor: colors.saffronDeep,
            transform: [{ rotate: `${deg}deg` }],
            transformOrigin: '50% 100%',
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          left: center - hub / 2,
          top: center - hub / 2,
          width: hub,
          height: hub,
          borderRadius: hub,
          backgroundColor: colors.saffronDeep,
        }}
      />
    </View>
  );
}

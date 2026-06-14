import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

/**
 * A small bloomed lotus built from View+gradient petals (the repo has no SVG —
 * see CategoryIcon for the same convention). Five petals fan from a base pivot
 * via `transformOrigin`; a saffron calyx grounds them. Used as the completed
 * routine's "पूर्ण" achievement mark and as the settle frame of the pushpa-varsha.
 */
const ANGLES = [-52, -26, 0, 26, 52];

export default function LotusMark({ size = 30 }: { size?: number }) {
  const { colors } = useTheme();
  const W = size;
  const H = Math.round(size * 0.64);
  const pw = Math.max(4, Math.round(size * 0.2));
  const phInner = Math.round(size * 0.5);
  const phOuter = Math.round(size * 0.4);
  const calyxW = Math.round(size * 0.28);

  return (
    <View style={{ width: W, height: H }} accessible={false}>
      {ANGLES.map((deg) => {
        const ph = Math.abs(deg) > 30 ? phOuter : phInner;
        return (
          <LinearGradient
            key={deg}
            colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: 'absolute',
              left: (W - pw) / 2,
              bottom: Math.round(H * 0.14),
              width: pw,
              height: ph,
              borderRadius: pw,
              borderWidth: 0.5,
              borderColor: colors.saffronDeep,
              transform: [{ rotate: `${deg}deg` }],
              transformOrigin: '50% 100%',
            }}
          />
        );
      })}
      <View
        style={{
          position: 'absolute',
          left: (W - calyxW) / 2,
          bottom: Math.round(H * 0.04),
          width: calyxW,
          height: Math.round(size * 0.2),
          borderRadius: size,
          backgroundColor: colors.saffronDeep,
        }}
      />
    </View>
  );
}

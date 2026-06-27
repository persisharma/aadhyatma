import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

/**
 * A fully-bloomed lotus built from View+gradient petals (the repo has no SVG —
 * see CategoryIcon for the same convention). Twelve identical petals radiate a
 * full 360° around a central saffron hub. Each petal sits in a full-size wrapper
 * that we rotate around its own centre (the flower centre) — we deliberately do
 * NOT use `transformOrigin`, which composites inconsistently on Android and made
 * the bloom render "weird" there. A sub-pixel (0.5) petal border was also dropped
 * for `StyleSheet.hairlineWidth` so the outline rasterises the same on both
 * platforms. Used as the completed routine's "पूर्ण" mark and the settle frame of
 * the pushpa-varsha.
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
        // Full-size wrapper rotated about its own centre (= the flower centre),
        // so the petal — whose base sits at that centre — sweeps outward without
        // relying on transformOrigin.
        <View
          key={deg}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: size,
            height: size,
            transform: [{ rotate: `${deg}deg` }],
          }}
        >
          <LinearGradient
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
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.saffronDeep,
            }}
          />
        </View>
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

import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

/**
 * The Panchang sky's mark (design.md §33): the moon in the day's phase on
 * a night view, the sun by day. Plain Views — a lit disc with an offset shadow
 * disc clipped inside it — so it needs no SVG and stays crisp at any scale. The
 * two-disc lune is a stylisation of the terminator, not an ephemeris drawing.
 * Decorative only: the card states everything in text.
 */
export default function CelestialGlyph({
  kind,
  tithiIndex = 14,
  size = 26,
}: {
  kind: 'sun' | 'moon';
  /** 0-based tithi (0 = Shukla Pratipada, 14 = Purnima, 29 = Amavasya). */
  tithiIndex?: number;
  size?: number;
}) {
  const { colors } = useTheme();
  const halo = Math.round(size * 1.6);
  // Lit fraction rises through Shukla to Purnima and falls through Krishna. The
  // shadow disc slides off the lit limb: waxing light is on the right, so its
  // shadow sits left; waning the reverse. A centre distance of `size` clears it.
  const waxing = tithiIndex < 15;
  const lit = waxing ? (tithiIndex + 1) / 15 : (29 - tithiIndex) / 15;
  const shadowLeft = Math.round(lit * size) * (waxing ? -1 : 1);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: halo,
        height: halo,
        borderRadius: halo / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: kind === 'moon' ? colors.moonHalo : colors.sunHalo,
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: kind === 'moon' ? colors.moonLight : colors.sunCore,
        }}
      >
        {kind === 'moon' && lit < 1 && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: shadowLeft,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.moonShadow,
            }}
          />
        )}
      </View>
    </View>
  );
}

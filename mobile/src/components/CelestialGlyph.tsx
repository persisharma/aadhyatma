import React, { useId } from 'react';
import { Image, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Image as SvgImage, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { moonLitPath, moonPhaseForTithi } from '@/utils/moonPhase';
import { storybookSources } from './storybookSources';

/**
 * The Panchang sky's mark (design.md §33): the moon in the day's phase on
 * a night view, the sun by day. Reuses the painted full-moon and eight-ray sun.
 * An elliptical terminator reveals the moon's actual tithi-based lit limb:
 * right-lit while waxing, full on Purnima, left-lit while waning, dark at Amavasya.
 * This is an illustration of the named tithi, not an exact lunar photograph.
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
  const clipId = `moon-phase-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const halo = Math.round(size * 1.6);
  const phase = moonPhaseForTithi(tithiIndex);
  const litPath = moonLitPath(tithiIndex);

  return (
    <View
      testID={`celestial-${kind}-${kind === 'moon' ? phase.index : 'painted'}`}
      pointerEvents="none"
      accessible={false}
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
      {kind === 'sun' ? (
        <Image source={storybookSources.gayatri} resizeMode="contain" fadeDuration={0}
          accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
          style={{ width: size * 512 / 432, height: size * 512 / 432 }} />
      ) : (
        // Both normalized paintings have their visible bounds inside 40..472.
        // Frame the painted disc itself, rather than shrinking it by PNG margins.
        <Svg width={size} height={size} viewBox="40 40 432 432" accessible={false}>
          <Defs><ClipPath id={clipId}>{litPath && <Path d={litPath} />}</ClipPath></Defs>
          <SvgImage href={storybookSources.chandra} x={0} y={0} width={512} height={512} />
          {phase.illuminatedFraction < 1 && (
            <Circle testID="moon-unlit-shade" cx={256} cy={256} r={216} fill={colors.moonPaintedShade} />
          )}
          {litPath && phase.illuminatedFraction < 1 && (
            <G clipPath={`url(#${clipId})`}>
              <SvgImage href={storybookSources.chandra} x={0} y={0} width={512} height={512} />
            </G>
          )}
        </Svg>
      )}
    </View>
  );
}

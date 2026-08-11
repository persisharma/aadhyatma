import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { titleScriptFont } from '@/utils/scriptFont';
import { useReducedMotion } from '@/utils/useReducedMotion';

/**
 * Festive toran (design.md §55) — the garland Home hangs below the wordmark on
 * each of the 18 catalog festivals (`notifications/festiveReminders.ts`), the way
 * a doorway is dressed for the day. A sagging string carries marigolds and
 * leaves, with a chip underneath naming the day's greeting — the same greeting
 * the morning's festive reminder led with.
 *
 * Grammar rules it lives under:
 *  - Drawn, never emoji (§42): marigolds are View compositions like the
 *    pushpa-varsha blossoms; only the string is SVG.
 *  - Warm tokens only (§2): saffron/gold/amber, all from the theme.
 *  - Motion restraint (§11): one ±0.7° sway on a slow loop; `useReducedMotion`
 *    hangs the garland still.
 *  - Fixed height: the component always occupies TORAN_HEIGHT, so it can never
 *    nudge the Today strip once mounted.
 */

// 46 garland + ~26 chip (top offset 48 + ~25 tall) + ~16 clearance so the
// greeting chip never kisses the Today strip's Panchang banner below it.
export const TORAN_HEIGHT = 90;
const GARLAND_HEIGHT = 46;

/**
 * Ornament stations along the string, mirroring the sag of the SVG path
 * (`M-4 6 Q150 44 304 6` in a 300-wide viewBox): x as % of width, y matching
 * y = 6 + 19·sin(πx/300). Flowers and leaves alternate.
 */
const STATIONS = [18, 52, 86, 120, 150, 180, 214, 248, 282].map((x, i) => ({
  leftPct: x / 3,
  top: 6 + 19 * Math.sin((Math.PI * x) / 300),
  kind: i % 2 === 0 ? ('flower' as const) : ('leaf' as const),
}));

const FLOWER_SIZE = 13;
const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];

function Marigold({ petalA, petalB, core }: { petalA: string; petalB: string; core: string }) {
  return (
    <View style={styles.flower} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {PETALS.map((deg, i) => (
        <View
          key={deg}
          style={[
            styles.petal,
            {
              backgroundColor: i % 2 === 0 ? petalA : petalB,
              transform: [{ rotate: `${deg}deg` }, { translateY: -FLOWER_SIZE / 3.2 }],
            },
          ]}
        />
      ))}
      <View style={[styles.flowerCore, { backgroundColor: core }]} />
    </View>
  );
}

type Props = {
  /** Festival greeting from the festive catalog; gu/kn re-script the Devanagari. */
  greetingHi: string;
  greetingEn: string;
};

export default function FestiveToran({ greetingHi, greetingEn }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const reduceMotion = useReducedMotion();

  const greeting = contentByLang(lang, greetingHi, greetingEn);

  const sway = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (reduceMotion) {
      sway.setValue(0.5);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, sway]);

  const rotate = useMemo(
    () => sway.interpolate({ inputRange: [0, 1], outputRange: ['-0.7deg', '0.7deg'] }),
    [sway]
  );

  return (
    <View style={styles.wrap} testID="festive-toran">
      <Animated.View
        style={[styles.garland, { transform: [{ rotate }] }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={GARLAND_HEIGHT}
          viewBox="0 0 300 46"
          preserveAspectRatio="none"
        >
          <Path
            d="M-4 6 Q150 44 304 6"
            fill="none"
            stroke={colors.saffronDeep}
            strokeOpacity={0.55}
            strokeWidth={1.4}
          />
        </Svg>
        {STATIONS.map((s, i) =>
          s.kind === 'flower' ? (
            <View
              key={i}
              testID={`toran-flower-${i}`}
              style={{ position: 'absolute', left: `${s.leftPct}%`, top: s.top }}
            >
              <Marigold
                petalA={colors.cardThumbActiveFrom}
                petalB={colors.cardThumbActiveTo}
                core={colors.saffronDeep}
              />
            </View>
          ) : (
            <View
              key={i}
              testID={`toran-leaf-${i}`}
              style={[
                styles.leaf,
                {
                  backgroundColor: colors.gold,
                  left: `${s.leftPct}%`,
                  top: s.top + 1,
                },
              ]}
            />
          )
        )}
      </Animated.View>
      <View
        style={[
          styles.chip,
          { backgroundColor: colors.goldChipBg, borderColor: colors.cardActiveBorder },
        ]}
        testID="toran-chip"
      >
        <Text
          style={[
            styles.chipText,
            {
              color: colors.saffronDeep,
              fontFamily: titleScriptFont(greeting, typography.cardHindi.fontFamily),
            },
          ]}
          accessibilityLabel={greeting}
        >
          {greeting}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: TORAN_HEIGHT,
    alignItems: 'center',
  },
  garland: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: GARLAND_HEIGHT,
    // Sway pivots where the string is tied, not the garland's middle.
    transformOrigin: '50% 0%',
  },
  flower: {
    width: FLOWER_SIZE,
    height: FLOWER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    width: 5,
    height: 7,
    borderRadius: 4,
  },
  flowerCore: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  leaf: {
    position: 'absolute',
    width: 7,
    height: 11,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 7,
    opacity: 0.75,
    transform: [{ rotate: '18deg' }],
  },
  chip: {
    position: 'absolute',
    top: GARLAND_HEIGHT + 2,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    includeFontPadding: false,
  },
});

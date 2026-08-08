import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import type { PalmLineId } from '@/panchang/hastRekha';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  /** Emphasise one guide line; the others dim. `null`/undefined shows all equally. */
  highlight?: PalmLineId | null;
};

// Stylised right palm, fingers up, thumb left, in a 100×130 viewBox. The
// geometry is a framing aid, not an anatomical claim — it shows where each
// classical line usually sits so the user can compare against their own hand.
const GUIDE_PATHS: Readonly<Record<PalmLineId, string>> = {
  heart: 'M30,62 Q52,52 80,58',
  head: 'M28,74 Q52,68 78,72',
  life: 'M36,60 Q28,86 40,112',
  fate: 'M56,114 Q54,84 56,58',
};

export const PALM_GUIDE_ORDER: readonly PalmLineId[] = [
  'heart',
  'head',
  'life',
  'fate',
];

export function usePalmGuideColors(): Readonly<Record<PalmLineId, string>> {
  const { colors } = useTheme();
  return {
    heart: colors.gold,
    head: colors.saffron,
    life: colors.parchment,
    fate: colors.avoid,
  };
}

export default function PalmGuideOverlay({ highlight }: Props) {
  const { colors } = useTheme();
  const guideColors = usePalmGuideColors();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 130"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Palm silhouette — dashed, neutral, purely for framing. */}
        <Ellipse
          cx={54}
          cy={78}
          rx={32}
          ry={44}
          fill="none"
          stroke={colors.onPrimary}
          strokeOpacity={0.55}
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
        <Path
          d="M25,92 Q12,76 23,60"
          fill="none"
          stroke={colors.onPrimary}
          strokeOpacity={0.55}
          strokeWidth={1.4}
          strokeDasharray="4 3"
        />
        {[
          { x: 33, y: 18, h: 22 },
          { x: 45, y: 12, h: 26 },
          { x: 57, y: 14, h: 24 },
          { x: 69, y: 22, h: 18 },
        ].map((finger) => (
          <Rect
            key={finger.x}
            x={finger.x}
            y={finger.y}
            width={9}
            height={finger.h}
            rx={4.5}
            fill="none"
            stroke={colors.onPrimary}
            strokeOpacity={0.45}
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
        ))}

        {/* The four classical lines. A white underlay keeps every accent
            legible over an unpredictable live-photo background. */}
        {PALM_GUIDE_ORDER.map((line) => {
          const dimmed = highlight != null && highlight !== line;
          return (
            <React.Fragment key={line}>
              <Path
                d={GUIDE_PATHS[line]}
                fill="none"
                stroke={colors.onPrimary}
                strokeOpacity={dimmed ? 0.14 : 0.9}
                strokeWidth={4.4}
                strokeLinecap="round"
              />
              <Path
                d={GUIDE_PATHS[line]}
                fill="none"
                stroke={guideColors[line]}
                strokeOpacity={dimmed ? 0.2 : 1}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

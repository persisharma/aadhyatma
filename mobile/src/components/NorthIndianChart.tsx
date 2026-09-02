import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import {
  GRAHA_NAMES_EN,
  RASHI_NAMES_EN,
  type KundaliChart,
} from '@/panchang/kundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';

type Props = {
  chart: KundaliChart;
  size?: number;
};

const HOUSE_CENTRES = [
  [150, 78],
  [82, 44],
  [42, 82],
  [82, 150],
  [42, 218],
  [82, 256],
  [150, 218],
  [218, 256],
  [258, 218],
  [218, 150],
  [258, 82],
  [218, 44],
] as const;

const GRAHA_ABBREVIATIONS = {
  sun: 'Su',
  moon: 'Mo',
  mars: 'Ma',
  mercury: 'Me',
  jupiter: 'Ju',
  venus: 'Ve',
  saturn: 'Sa',
  rahu: 'Ra',
  ketu: 'Ke',
} as const;

export function buildChartAccessibilityLabel(chart: KundaliChart): string {
  const houses = chart.houses.map((rashiIndex, index) => {
    const grahas = chart.grahas
      .filter((position) => position.house === index + 1)
      .map((position) => GRAHA_NAMES_EN[position.graha])
      .join(', ');
    return `House ${index + 1}, ${RASHI_NAMES_EN[rashiIndex]}${grahas ? `: ${grahas}` : ''}`;
  });
  return `North Indian Kundali. ${houses.join('. ')}.`;
}

export default function NorthIndianChart({ chart, size = 300 }: Props) {
  const { colors } = useTheme();

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={buildChartAccessibilityLabel(chart)}
      style={[styles.wrap, { width: size, height: size }]}
      testID="north-indian-chart"
    >
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Rect x="7" y="7" width="286" height="286" fill={colors.parchmentSoft} stroke={colors.saffronDeep} strokeWidth="2" />
        <Polygon points="150,7 293,150 150,293 7,150" fill="none" stroke={colors.saffronDeep} strokeWidth="1.5" />
        <Line x1="7" y1="7" x2="150" y2="150" stroke={colors.saffronDeep} strokeWidth="1.2" />
        <Line x1="293" y1="7" x2="150" y2="150" stroke={colors.saffronDeep} strokeWidth="1.2" />
        <Line x1="293" y1="293" x2="150" y2="150" stroke={colors.saffronDeep} strokeWidth="1.2" />
        <Line x1="7" y1="293" x2="150" y2="150" stroke={colors.saffronDeep} strokeWidth="1.2" />
        {chart.houses.map((rashiIndex, index) => {
          const [x, y] = HOUSE_CENTRES[index];
          const grahas = chart.grahas
            .filter((position) => position.house === index + 1)
            .map((position) => GRAHA_ABBREVIATIONS[position.graha])
            .join(' ');
          return (
            <React.Fragment key={index}>
              <SvgText
                x={x}
                y={y - 5}
                fill={colors.saffronDeep}
                fontFamily={fontFamilies.interSemiBold}
                fontSize="10"
                textAnchor="middle"
              >
                {rashiIndex + 1}
              </SvgText>
              <SvgText
                x={x}
                y={y + 8}
                fill={colors.ink}
                fontFamily={fontFamilies.interSemiBold}
                // These sizes are viewBox units, not points: the chart scales
                // with `size`, so unlike the fixed UI chrome covered by the 10pt
                // floor (design.md §3) they grow with the diagram. The dense
                // branch keeps a 9-graha house from overrunning its cell.
                fontSize={grahas.length > 8 ? '8' : '9'}
                textAnchor="middle"
              >
                {grahas}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
});

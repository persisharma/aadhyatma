import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Polygon, Rect, Text as SvgText, TSpan } from 'react-native-svg';

import {
  GRAHA_NAMES_EN,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  type KundaliChart,
  type Graha,
} from '@/panchang/kundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';

type Props = {
  chart: KundaliChart;
  size?: number;
  lang?: Lang;
  onSelectHouse?: (house: number) => void;
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

const GRAHA_ABBREVIATIONS_HI: Record<Graha, string> = {
  sun: 'सू', moon: 'चं', mars: 'मं', mercury: 'बु', jupiter: 'गु',
  venus: 'शु', saturn: 'श', rahu: 'रा', ketu: 'के',
};

/** Explicit short forms preserve Indic vowel signs and conjuncts. */
export function chartGrahaAbbreviation(graha: Graha, lang: Lang): string {
  return contentByLang(lang, GRAHA_ABBREVIATIONS_HI[graha], GRAHA_ABBREVIATIONS[graha]);
}

export function buildChartAccessibilityLabel(chart: KundaliChart): string {
  const houses = chart.houses.map((rashiIndex, index) => {
    const grahas = chart.grahas
      .filter((position) => position.house === index + 1)
      .map((position) => GRAHA_NAMES_EN[position.graha])
      .join(', ');
    return `House ${index + 1}${index === 0 ? ' (Lagna)' : ''}, ${RASHI_NAMES_EN[rashiIndex]}${grahas ? `: ${grahas}` : ''}`;
  });
  return `North Indian Kundali. ${houses.join('. ')}.`;
}

const HOUSE_POLYGONS = [
  '150,7 221.5,78.5 150,150 78.5,78.5',
  '7,7 150,7 78.5,78.5', '7,7 78.5,78.5 7,150',
  '7,150 78.5,78.5 150,150 78.5,221.5',
  '7,150 78.5,221.5 7,293', '7,293 78.5,221.5 150,293',
  '150,150 221.5,221.5 150,293 78.5,221.5',
  '150,293 221.5,221.5 293,293', '221.5,221.5 293,150 293,293',
  '150,150 221.5,78.5 293,150 221.5,221.5',
  '221.5,78.5 293,7 293,150', '150,7 293,7 221.5,78.5',
] as const;

export default function NorthIndianChart({ chart, size = 300, lang = 'en', onSelectHouse }: Props) {
  const { colors } = useTheme();

  return (
    <View
      accessible={!onSelectHouse}
      accessibilityRole={onSelectHouse ? undefined : 'image'}
      accessibilityLabel={onSelectHouse ? undefined : buildChartAccessibilityLabel(chart)}
      style={[styles.wrap, { width: size, height: size }]}
      testID="north-indian-chart"
    >
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Rect x="7" y="7" width="286" height="286" fill={colors.parchmentSoft} stroke={colors.saffronDeep} strokeWidth="2" />
        {/* House 1 — the Lagna — is tinted: the box numbers are rashis, so
            without it readers hunt for a "1" and land in the wrong house. */}
        <Polygon points="150,7 221.5,78.5 150,150 78.5,78.5" fill={colors.saffronTint} />
        <Polygon points="150,7 293,150 150,293 7,150" fill="none" stroke={colors.saffronDeep} strokeWidth="1.5" />
        <Line x1="7" y1="7" x2="150" y2="150" stroke={colors.saffronDeep} strokeWidth="1.2" />
        <Line x1="293" y1="7" x2="150" y2="150" stroke={colors.saffronDeep} strokeWidth="1.2" />
        <Line x1="293" y1="293" x2="150" y2="150" stroke={colors.saffronDeep} strokeWidth="1.2" />
        <Line x1="7" y1="293" x2="150" y2="150" stroke={colors.saffronDeep} strokeWidth="1.2" />
        {chart.houses.map((rashiIndex, index) => {
          const [x, y] = HOUSE_CENTRES[index];
          const occupants = chart.grahas.filter(position => position.house === index + 1);
          const shortNames = occupants.map(position => onSelectHouse ? chartGrahaAbbreviation(position.graha, lang) : GRAHA_ABBREVIATIONS[position.graha]);
          const rows = Array.from({ length: Math.ceil(shortNames.length / 3) }, (_, row) => shortNames.slice(row * 3, row * 3 + 3).join(' '));
          const grahas = chart.grahas
            .filter((position) => position.house === index + 1)
            .map((position) => GRAHA_ABBREVIATIONS[position.graha])
            .join(' ');
          return (
            <G key={index} accessible={!!onSelectHouse} accessibilityRole={onSelectHouse ? 'button' : undefined}
              accessibilityLabel={`Explore house ${index + 1}, ${RASHI_NAMES_EN[rashiIndex]} (${RASHI_NAMES_WESTERN[rashiIndex]})${occupants.length ? `, ${occupants.map(position => GRAHA_NAMES_EN[position.graha]).join(', ')}` : ', empty house'}`}
              onPress={onSelectHouse ? () => onSelectHouse(index + 1) : undefined}
              testID={onSelectHouse ? `kundali-house-${index + 1}` : undefined}>
              {onSelectHouse && <Polygon points={HOUSE_POLYGONS[index]} fill="transparent" />}
              <SvgText
                x={x}
                y={y - (onSelectHouse ? 12 : 5)}
                fill={colors.saffronDeep}
                fontFamily={scriptBodyFont(lang, lang === 'hi' ? fontFamilies.devanagariBold : fontFamilies.interSemiBold)}
                fontSize="10"
                textAnchor="middle"
              >
                {onSelectHouse ? contentByLang(lang, `भाव ${index + 1}`, `House ${index + 1}`) : rashiIndex + 1}
              </SvgText>
              {onSelectHouse && <SvgText x={x} y={y} fill={colors.inkSoft} fontFamily={scriptBodyFont(lang, lang === 'hi' ? fontFamilies.devanagariBold : fontFamilies.interSemiBold)} fontSize="8" textAnchor="middle">{contentByLang(lang, RASHI_NAMES_HI[rashiIndex], RASHI_NAMES_WESTERN[rashiIndex])}</SvgText>}
              <SvgText
                x={x}
                y={y + (onSelectHouse ? 12 : 8)}
                fill={colors.ink}
                fontFamily={scriptBodyFont(lang, lang === 'hi' ? fontFamilies.devanagariBold : fontFamilies.interSemiBold)}
                // These sizes are viewBox units, not points: the chart scales
                // with `size`, so unlike the fixed UI chrome covered by the 10pt
                // floor (design.md §3) they grow with the diagram. The dense
                // branch keeps a 9-graha house from overrunning its cell.
                fontSize={onSelectHouse && rows.length > 1 ? '8' : grahas.length > 8 ? '8' : '9'}
                textAnchor="middle"
                testID={onSelectHouse ? `kundali-house-grahas-${index + 1}` : undefined}
              >
                {onSelectHouse ? rows.length ? rows.map((row, rowIndex) => <TSpan key={rowIndex} x={x} dy={rowIndex ? 9 : 0}>{row}</TSpan>) : '—' : grahas}
              </SvgText>
            </G>
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


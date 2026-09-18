/**
 * The आधार chain — the evidence trail under an interpretive reading
 * (RULEBOOK §14.3.1, design.md §72).
 *
 * Every sentence Vedansh now says about a chart is derived from named chart
 * facts, and this is where the reader sees them: bhava → lord → placement →
 * dasha → gochar, as small chips joined by arrows. It is deliberately set in
 * the UI sans (`fontFamilies.inter`) while the reading above it is serif:
 * the serif is tradition speaking, the sans is the arithmetic. A reader who
 * distrusts the sentence audits the chips.
 *
 * Renders nothing for an empty chain — the ENGINE refuses to emit one (a test
 * fails the build), so an empty prop here means a fact-only section.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import { basisLabelEn, basisLabelHi, type BasisNode } from '@/panchang/kundaliBasis';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle } from '@/utils/langType';

export default function BasisChain({
  basis,
  lang,
  labelHi = 'आधार',
  labelEn = 'Basis',
  testID,
}: {
  basis: readonly BasisNode[];
  lang: Lang;
  labelHi?: string;
  labelEn?: string;
  testID?: string;
}) {
  const { colors, typography, radii } = useTheme();
  if (basis.length === 0) return null;
  const labels = basis.map((node) => contentByLang(lang, basisLabelHi(node), basisLabelEn(node)));
  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={`${labelEn}: ${basis.map(basisLabelEn).join(', then ')}`}
      style={[
        styles.root,
        {
          backgroundColor: colors.cardSurface,
          borderLeftColor: colors.cardActiveBorder,
          borderRadius: radii.md,
        },
      ]}
    >
      <Text
        style={[
          pillTextStyle(lang, typography.sectionLabel),
          styles.label,
          { color: colors.saffronDeep },
        ]}
      >
        {contentByLang(lang, labelHi, labelEn)}
      </Text>
      <View style={styles.row}>
        {labels.map((label, index) => (
          <React.Fragment key={`${index}-${label}`}>
            {index > 0 && (
              <Text style={[styles.arrow, { color: colors.saffron }]} accessibilityElementsHidden>
                →
              </Text>
            )}
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.sm,
                },
              ]}
            >
              <Text maxFontSizeMultiplier={1.25} style={[styles.chipText, { color: colors.ink }]}>
                {label}
              </Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderLeftWidth: 2,
  },
  label: { fontSize: 10, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  arrow: { fontSize: 11, lineHeight: 14 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: fontFamilies.inter,
    fontSize: 10.5,
    lineHeight: 14,
    fontVariant: ['tabular-nums'],
  },
});

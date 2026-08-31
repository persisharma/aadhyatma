import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { scriptTitleFont } from '@/utils/langType';

/**
 * The one shared muhurat vocabulary chip (PRD-27, RULEBOOK §23): a शुभ योग and
 * a dosha render through the SAME component so the two vocabularies stay
 * visually paired — word + tint per design.md §12, never colour alone (the
 * label IS the word). Two tones only, deliberately: no "strong" variant, no
 * fill hierarchy — a yoga is present or absent, never graded against another.
 */
export default function MuhuratChip({
  label,
  tone,
  testID,
}: {
  label: string;
  tone: 'yoga' | 'dosha';
  testID?: string;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <Text
      testID={testID}
      style={{
        fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
        fontSize: 12,
        lineHeight: 19,
        // Deep cuts on the chip tints — the composite darkens the surface, so
        // raw saffron/avoid drop under AA there (colors.contrast.test.ts).
        color: tone === 'yoga' ? colors.saffronDeep : colors.avoidDeep,
        backgroundColor: tone === 'yoga' ? colors.goldChipBg : colors.avoidChipBg,
        borderRadius: radii.sm,
        overflow: 'hidden',
        paddingHorizontal: 8,
        paddingVertical: 3,
      }}
    >
      {label}
    </Text>
  );
}

/**
 * क्षेत्र filter — the area chip row on the व्रत / पर्व / उपवास lists (design.md §33).
 *
 * `सभी` (every row) · `सर्वत्र` (pan-India only) · one chip per area actually
 * present in the list. It narrows the LIST, never the calendar: area tags are
 * display metadata (`panchang/observanceAreas.ts`), unlike a lens.
 *
 * Same control class as PersonChips: 44 pt floor, 1.25 font-scale cap, English
 * accessibility labels so Maestro can target them in any reading language.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { Lang } from '@/data/gita/language';
import { getLensDefinition, type ObservanceLens } from '@/panchang/lenses';
import type { AreaFilter } from '@/panchang/observanceAreas';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';

const CHIP_FONT_CAP = 1.25;

export function areaName(area: ObservanceLens, lang: Lang): string {
  const def = getLensDefinition(area);
  return def ? contentByLang(lang, def.nameHi, def.nameEn) : area;
}

export default function AreaFilterChips({
  areas,
  value,
  lang,
  onChange,
}: {
  areas: readonly ObservanceLens[];
  value: AreaFilter;
  lang: Lang;
  onChange: (next: AreaFilter) => void;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  if (areas.length === 0) return null;

  const options: { id: AreaFilter; label: string; a11y: string }[] = [
    { id: 'all', label: contentByLang(lang, 'सभी', 'All'), a11y: 'Area: all' },
    { id: 'pan-india', label: contentByLang(lang, 'सर्वत्र', 'Pan-India'), a11y: 'Area: pan-India' },
    ...areas.map((area) => ({
      id: area as AreaFilter,
      label: areaName(area, lang),
      a11y: `Area: ${getLensDefinition(area)?.nameEn ?? area}`,
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.wrap}
      contentContainerStyle={[styles.row, { paddingRight: spacing.xxl }]}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="Area filter"
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.a11y}
            style={({ pressed }) => [
              styles.chip,
              {
                borderColor: selected ? colors.saffronDeep : colors.divider,
                backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft,
                borderRadius: radii.pill,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={CHIP_FONT_CAP}
              style={{
                color: selected ? colors.saffronDeep : colors.inkSoft,
                fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
                fontSize: 14,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8, flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    maxWidth: 220,
  },
});

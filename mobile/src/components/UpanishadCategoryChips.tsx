/**
 * Upanishad group filter — the chip row on the Upanishads index (design.md §75).
 *
 * `सभी` (all 108) · one chip per traditional group (Mukhya · Sāmānya · Sannyāsa ·
 * Śākta · Vaiṣṇava · Śaiva · Yoga). It narrows the LIST only. Same control class
 * as AreaFilterChips / PersonChips: 44 pt floor, 1.25 font-scale cap, English
 * accessibility labels so Maestro can target them in any reading language.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { Lang } from '@/data/gita/language';
import { upanishadCategories, type UpanishadCategory } from '@/data/upanishad/registry';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';

const CHIP_FONT_CAP = 1.25;

export type UpanishadCategoryFilter = UpanishadCategory | 'all';

export default function UpanishadCategoryChips({
  value,
  lang,
  counts,
  onChange,
}: {
  value: UpanishadCategoryFilter;
  lang: Lang;
  /** Readable-text count per group, shown after the name so an empty group is visibly empty. */
  counts: Readonly<Record<UpanishadCategory, { total: number; available: number }>>;
  onChange: (next: UpanishadCategoryFilter) => void;
}) {
  const { colors, typography, spacing, radii } = useTheme();

  const options: { id: UpanishadCategoryFilter; label: string; a11y: string }[] = [
    { id: 'all', label: contentByLang(lang, 'सभी', 'All'), a11y: 'Group: all' },
    ...upanishadCategories.map((c) => ({
      id: c.id,
      label: `${contentByLang(lang, c.nameHi, c.nameEn)} · ${counts[c.id].available}/${counts[c.id].total}`,
      a11y: `Group: ${c.nameEn}`,
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.wrap}
      contentContainerStyle={[styles.row, { paddingHorizontal: spacing.screenGutter }]}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="Upanishad group filter"
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
    maxWidth: 240,
  },
});

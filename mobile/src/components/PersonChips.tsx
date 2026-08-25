/**
 * The person switcher — "whose chart is this" (design.md §51a).
 *
 * ONE control class for every personalised Jyotish surface: the Kundali screen,
 * the Jyotish landing and Daily Rashifal. It is deliberately a chip row rather
 * than a dropdown, because who-am-I-reading-for is a *visible* state, not a
 * setting: on a shared family phone the wrong active person is a wrong Rashifal,
 * and a collapsed picker hides that.
 *
 * Chips are controls, so they carry the §12 44 pt floor and a 1.25 font-scale cap
 * (dense navigation chrome — the same rule the Namkaran result controls follow).
 * Accessibility labels are ENGLISH and caller-supplied so Maestro can target them
 * whatever the reading language is.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import type { PersonProfile } from '@/panchang/birthProfiles';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptTitleFont } from '@/utils/langType';

const CHIP_FONT_CAP = 1.25;

/**
 * What a person is CALLED on a chip. The name when they have one; otherwise their
 * birth date — never an invented "Person 2", and never a bare id.
 */
export function personLabel(person: PersonProfile): string {
  const name = person.name?.trim();
  if (name) return name;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${person.date}T00:00:00.000Z`));
}

export default function PersonChips({
  people,
  activeId,
  lang,
  onSelect,
  onAdd,
  canAdd = true,
  labelHi = 'किसके लिए',
  labelEn = 'Showing for',
  selectAccessibilityLabel,
  addAccessibilityLabel = 'Add another person',
  fullMessageHi,
  fullMessageEn,
}: {
  people: readonly PersonProfile[];
  activeId: string | null;
  lang: Lang;
  onSelect: (id: string) => void;
  /** Omitted where adding is not reachable from the surface (e.g. Rashifal). */
  onAdd?: () => void;
  canAdd?: boolean;
  labelHi?: string;
  labelEn?: string;
  selectAccessibilityLabel: (label: string) => string;
  addAccessibilityLabel?: string;
  fullMessageHi?: string;
  fullMessageEn?: string;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  if (people.length === 0) return null;

  return (
    <View style={styles.wrap} accessibilityLabel="Person switcher">
      <Text
        maxFontSizeMultiplier={CHIP_FONT_CAP}
        style={[
          pillTextStyle(lang, typography.sectionLabel),
          styles.label,
          { color: colors.inkMuted },
        ]}
      >
        {contentByLang(lang, labelHi, labelEn)}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, { paddingRight: spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        {people.map((person) => {
          const label = personLabel(person);
          const selected = person.id === activeId;
          return (
            <Pressable
              key={person.id}
              onPress={() => onSelect(person.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={selectAccessibilityLabel(label)}
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
                {label}
              </Text>
            </Pressable>
          );
        })}
        {onAdd && canAdd ? (
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            accessibilityLabel={addAccessibilityLabel}
            style={({ pressed }) => [
              styles.chip,
              styles.addChip,
              {
                borderColor: colors.divider,
                backgroundColor: colors.cardSurface,
                borderRadius: radii.pill,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              maxFontSizeMultiplier={CHIP_FONT_CAP}
              style={{
                color: colors.saffronDeep,
                fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily),
                fontSize: 14,
              }}
            >
              + {contentByLang(lang, 'जोड़ें', 'Add')}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
      {onAdd && !canAdd && fullMessageHi && fullMessageEn ? (
        <Text
          maxFontSizeMultiplier={CHIP_FONT_CAP}
          style={[styles.full, { color: colors.inkMuted }]}
        >
          {contentByLang(lang, fullMessageHi, fullMessageEn)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 10, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    maxWidth: 220,
  },
  addChip: { borderStyle: 'dashed' },
  full: { fontSize: 11, lineHeight: 16, marginTop: 6 },
});

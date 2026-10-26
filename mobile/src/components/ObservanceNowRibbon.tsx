import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { formatClock } from '@/panchang/muhuratFormat';
import type { ResolvedObservance } from '@/panchang/types';
import CelestialGlyph from './CelestialGlyph';

/**
 * The day's observance, promoted above the Muhurat card (design.md §33): the
 * व्रत और पर्व section sits past the fold, so a festival day used to open on
 * timings alone. `tonight` is the pre-dawn carry-over — before sunrise the
 * Hindu day is still yesterday's, so a festival kept last night (a nishita
 * Sharad Purnima, a moonrise Karwa Chauth) is still the one running, even though
 * the civil date has turned. Tapping opens the observance detail. Renders
 * nothing without an observance.
 */
export default function ObservanceNowRibbon({
  items,
  tonight,
  sunrise,
  tithiIndex,
  onOpen,
}: {
  items: ResolvedObservance[];
  tonight: boolean;
  /** Today's sunrise — the end of a `tonight` carry-over. */
  sunrise: Date;
  tithiIndex: number;
  onOpen: (ruleId: string) => void;
}) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  if (items.length === 0) return null;
  const { rule } = items[0];
  const more = items.length - 1;
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const name = contentByLang(lang, rule.nameHi, rule.nameEn);
  const deity = contentByLang(lang, rule.deityHi, rule.deityEn);
  const title = tonight ? contentByLang(lang, `${rule.nameHi} की रात्रि`, `${rule.nameEn} night`) : name;
  const meta = [
    deity,
    tonight
      ? contentByLang(lang, `सूर्योदय ${formatClock(sunrise)} तक`, `until sunrise ${formatClock(sunrise)}`)
      : rule.kathaId
        ? contentByLang(lang, 'कथा पढ़ें', 'Read the katha')
        : null,
  ].filter(Boolean).join(' · ');

  return (
    <Pressable
      testID="observance-now-ribbon"
      onPress={() => onOpen(rule.id)}
      accessibilityRole="button"
      accessibilityLabel={`${tonight ? `${rule.nameEn} night, until sunrise ${formatClock(sunrise)}` : rule.nameEn}${more > 0 ? `, and ${more} more` : ''}. Opens details.`}
      style={({ pressed }) => [
        styles.ribbon,
        { backgroundColor: colors.cardActiveFrom, borderColor: colors.goldChipBg, borderRadius: radii.lg },
        elevation.card,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.mark, { backgroundColor: colors.skyNightTop }]}>
        <CelestialGlyph kind="moon" tithiIndex={tithiIndex} size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>
          {title}
        </Text>
        {meta.length > 0 && (
          <Text numberOfLines={1} style={{ fontFamily: bodyFont, fontSize: 12, color: colors.inkMuted, marginTop: 1 }}>
            {meta}
          </Text>
        )}
      </View>
      {more > 0 && (
        <Text style={[styles.more, { fontFamily: bodyFont, color: colors.saffronDeep, backgroundColor: colors.saffronTint }]}>
          {`+${more}`}
        </Text>
      )}
      <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ribbon: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, minHeight: 56 },
  mark: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  more: { fontSize: 11, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
});

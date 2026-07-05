import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import { useMuhurat } from '@/panchang/useMuhurat';
import { formatClock, formatRange } from '@/panchang/muhuratFormat';
import type { CalendarSystem } from '@/panchang/types';

/**
 * "Today's Timings" glance card (PRD-14 Variant A). Docked below the anga grid
 * on the Panchang → Calendar view. Answers "is now good?" and opens the full
 * Muhurat detail. Auspicious/avoid always carry a text label, never colour alone.
 */
export default function MuhuratGlanceCard({
  date,
  calendarSystem,
  onViewAll,
}: {
  date: Date;
  calendarSystem: CalendarSystem;
  onViewAll: () => void;
}) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { isToday, nowChoghadiya, abhijit, rahu } = useMuhurat(date, calendarSystem);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  const showNow = isToday && nowChoghadiya != null;
  const nowAvoid = nowChoghadiya?.quality === 'avoid';

  return (
    <LinearGradient
      colors={[colors.cardActiveFrom, colors.cardActiveTo]}
      style={[styles.card, { borderColor: colors.cardActiveBorder, borderRadius: radii.lg, padding: spacing.lg }, elevation.raised]}
    >
      <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.saffronDeep, letterSpacing: 0.4 }}>
        {contentByLang(lang, 'आज का मुहूर्त', "Today's Timings")}
      </Text>

      {/* Hero line: current choghadiya when today, else the day's Abhijit. */}
      <View style={styles.nowRow}>
        <View
          style={[
            styles.dot,
            { backgroundColor: showNow && nowAvoid ? colors.avoid : colors.saffronDeep },
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.inkMuted }}>
            {showNow ? contentByLang(lang, 'अभी', 'Now') : contentByLang(lang, 'शुभ मुहूर्त', 'Auspicious')}
          </Text>
          <Text style={{ fontFamily: titleFont, fontSize: 20, color: colors.ink }}>
            {showNow
              ? contentByLang(lang, `${nowChoghadiya!.nameHi} चौघड़िया`, `${nowChoghadiya!.nameEn} Choghadiya`)
              : contentByLang(lang, 'अभिजीत मुहूर्त', 'Abhijit Muhurat')}
          </Text>
          <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>
            {showNow
              ? contentByLang(lang, `${formatClock(nowChoghadiya!.end)} तक`, `till ${formatClock(nowChoghadiya!.end)}`)
              : abhijit
                ? formatRange(abhijit.start, abhijit.end)
                : ''}
          </Text>
        </View>
        {showNow && (
          <Text
            style={[
              styles.tag,
              {
                fontFamily: typography.cardLatin.fontFamily,
                color: nowAvoid ? colors.avoid : colors.saffronDeep,
                backgroundColor: nowAvoid ? colors.avoidTint : colors.goldTint,
              },
            ]}
          >
            {nowAvoid ? contentByLang(lang, 'त्याज्य', 'avoid') : contentByLang(lang, 'शुभ', 'auspicious')}
          </Text>
        )}
      </View>

      <View style={styles.tiles}>
        <View style={[styles.tile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
          <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.inkMuted }}>{contentByLang(lang, 'राहु काल', 'Rahu Kaal')}</Text>
          <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 13, color: colors.avoid, marginTop: 3 }}>{formatRange(rahu.start, rahu.end)}</Text>
        </View>
        <View style={[styles.tile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
          <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.inkMuted }}>{contentByLang(lang, 'अभिजीत', 'Abhijit')}</Text>
          <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 13, color: colors.saffronDeep, marginTop: 3 }}>
            {abhijit ? formatRange(abhijit.start, abhijit.end) : '—'}
          </Text>
        </View>
      </View>

      <Pressable onPress={onViewAll} accessibilityRole="button" style={[styles.viewAll, { borderTopColor: colors.divider }]}>
        <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffron }}>
          {contentByLang(lang, 'सभी मुहूर्त व चौघड़िया', 'All timings & choghadiya')}
        </Text>
        <Text style={{ color: colors.saffron, fontSize: 18 }}>›</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, marginTop: 12 },
  nowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  tag: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 13 },
  tile: { flex: 1, borderWidth: 1, padding: 11 },
  viewAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
});

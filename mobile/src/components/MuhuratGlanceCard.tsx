import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, eyebrowTextStyle } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
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
  const { isToday, nowChoghadiya, muhurat } = useMuhurat(date, calendarSystem);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  // The solve runs off the render path (and only the first time per day — it is
  // memoised in useMuhurat). Until it lands we render a skeleton that reserves
  // the card's footprint, so the section no longer pops in below the day panel.
  if (!muhurat) {
    const bar = (w: number, h: number, soft?: boolean) => (
      <View style={[styles.skelBar, { width: w, height: h, backgroundColor: soft ? colors.parchmentSoft : colors.divider }]} />
    );
    return (
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        style={[styles.card, { borderColor: colors.cardActiveBorder, borderRadius: radii.lg, padding: spacing.lg }, elevation.raised]}
        accessibilityRole="progressbar"
        accessibilityLabel={contentByLang(lang, 'मुहूर्त लोड हो रहा है', 'Loading timings')}
      >
        <Text style={[eyebrowTextStyle(lang, 12), { color: colors.saffronDeep }]}>
          {contentByLang(lang, 'आज का मुहूर्त', "Today's Timings")}
        </Text>
        <View style={styles.nowRow}>
          <View style={[styles.dot, { backgroundColor: colors.divider }]} />
          <View style={{ flex: 1, gap: 6 }}>
            {bar(60, 9)}
            {bar(168, 18)}
            {bar(92, 11, true)}
          </View>
        </View>
        <View style={styles.tiles}>
          {[0, 1].map((i) => (
            <View key={i} style={[styles.tile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
              {bar(52, 10)}
              <View style={{ height: 5 }} />
              {bar(84, 13)}
            </View>
          ))}
        </View>
        <View style={[styles.viewAll, { borderTopColor: colors.divider }]}>{bar(150, 12)}</View>
      </LinearGradient>
    );
  }
  const { abhijit, rahu } = muhurat;

  const showNow = isToday && nowChoghadiya != null;
  const nowAvoid = nowChoghadiya?.quality === 'avoid';

  return (
    <LinearGradient
      colors={[colors.cardActiveFrom, colors.cardActiveTo]}
      style={[styles.card, { borderColor: colors.cardActiveBorder, borderRadius: radii.lg, padding: spacing.lg }, elevation.raised]}
    >
      <Text style={[eyebrowTextStyle(lang, 12), { color: colors.saffronDeep }]}>
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
          <Text
            style={[
              eyebrowTextStyle(lang, 9, 0.6),
              { textTransform: lang === 'en' ? 'uppercase' : 'none', color: colors.inkMuted },
            ]}
          >
            {showNow ? contentByLang(lang, 'अभी', 'Now') : contentByLang(lang, 'शुभ मुहूर्त', 'Auspicious')}
          </Text>
          <Text style={{ fontFamily: titleFont, fontSize: 20, color: colors.ink }}>
            {showNow
              ? contentByLang(lang, `${nowChoghadiya!.nameHi} चौघड़िया`, `${nowChoghadiya!.nameEn} Choghadiya`)
              : contentByLang(lang, 'अभिजीत मुहूर्त', 'Abhijit Muhurat')}
          </Text>
          {/* Times use the non-italic semibold face, never the thin italic
              cardLatin — italic strokes wash out on the gradient (design.md §3/§12). */}
          <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>
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
                fontFamily: fontFamilies.latinBold,
                // Deep cuts on the chip tints — the composite darkens the surface,
                // so raw `avoid` drops under AA there (colors.contrast.test.ts).
                color: nowAvoid ? colors.avoidDeep : colors.saffronDeep,
                backgroundColor: nowAvoid ? colors.avoidChipBg : colors.goldChipBg,
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
          <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 13, color: colors.avoid, marginTop: 3 }}>{formatRange(rahu.start, rahu.end)}</Text>
        </View>
        <View style={[styles.tile, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
          <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.inkMuted }}>{contentByLang(lang, 'अभिजीत', 'Abhijit')}</Text>
          <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 13, color: colors.saffronDeep, marginTop: 3 }}>
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
  card: { borderWidth: 1 },
  nowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  // No fontWeight: the call site sets fontFamilies.latinBold, a static 700 file
  // that already carries the weight (see utils/langType.ts).
  tag: { fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 13 },
  tile: { flex: 1, borderWidth: 1, padding: 11 },
  viewAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  skelBar: { borderRadius: 5, opacity: 0.55 },
});

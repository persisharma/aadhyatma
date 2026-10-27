import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont, eyebrowTextStyle } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { useMuhurat } from '@/panchang/useMuhurat';
import { prevailingTithi, successorTithiToday } from '@/panchang/prevailingTithi';
import { formatRangeCompact, formatEndInstant } from '@/panchang/muhuratFormat';
import { windowState } from '@/panchang/muhuratSpan';
import type { CalendarSystem } from '@/panchang/types';
import ChoghadiyaStrip from './ChoghadiyaStrip';

// Cormorant's default figures are old-style; clock digits read as one height.
const LINING = ['lining-nums', 'tabular-nums'] as const;

/**
 * The Muhurat card (PRD-14; design.md §33) under the Panchang sky. The sky
 * header answers "what is running now and for how long"; this card lays out the
 * rest of the day's timing: the running tithi, the half's eight choghadiya as a
 * tappable strip, and Rahu Kaal / Abhijit — then opens the full Muhurat detail.
 * Auspicious/avoid always carry a text label, never colour alone.
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
  const { isToday, nowChoghadiya, nowRun, muhurat, panchang } = useMuhurat(date, calendarSystem);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

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
        <View style={styles.skelStrip}>
          {bar(110, 12)}
          {bar(240, 14, true)}
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
  // Live progress through the running period; the useMuhurat minute tick is what
  // re-renders this card, so the fraction advances once a minute.
  const at = Date.now();
  const nowProgress = showNow
    ? Math.min(
        1,
        Math.max(
          0,
          (at - nowChoghadiya!.start.getTime()) /
            Math.max(1, nowChoghadiya!.end.getTime() - nowChoghadiya!.start.getTime())
        )
      )
    : 0;

  // The kicker tithi is LIVE on a today surface: a tithi usually ends mid-day
  // (and kshaya days hold two), so past the end instant the minute tick moves
  // this to the tithi actually running now — never a stale sunrise answer next
  // to a live "now" row. Browsed dates keep the sunrise (udaya-vyapini) tithi,
  // the almanac's answer for that day.
  const kickerTithi = panchang
    ? isToday
      ? prevailingTithi(panchang, new Date(at))
      : { nameHi: panchang.tithi.nameHi, nameEn: panchang.tithi.nameEn, endTime: panchang.tithi.endTime }
    : null;
  // "तक 8:51 AM" states when the day's label stops being true and nothing else —
  // leaving the remaining fifteen hours unnamed, and a reader unable to tell that
  // a Chaturthi vrat is kept on THIS date rather than the next one headed
  // Chaturthi. The handover line names the successor whenever it takes over
  // within this civil day. Only while the kicker is still showing the sunrise
  // tithi: once "now" has moved past the handover, the successor IS the kicker.
  const handover =
    panchang && kickerTithi && kickerTithi.nameEn === panchang.tithi.nameEn
      ? successorTithiToday(panchang)
      : null;

  // The strip draws the half that holds "now" (last night's, before sunrise);
  // a browsed date shows its daytime run with nothing marked.
  const run = showNow && nowRun ? nowRun : muhurat.dayChoghadiya;
  const nowIndex = showNow && nowRun
    ? nowRun.findIndex((p) => p.start.getTime() === nowChoghadiya!.start.getTime())
    : -1;

  return (
    <LinearGradient
      colors={[colors.cardActiveFrom, colors.cardActiveTo]}
      style={[styles.card, { borderColor: colors.cardActiveBorder, borderRadius: radii.lg, padding: spacing.lg }, elevation.raised]}
    >
      {/* Kicker row: the eyebrow on the left, the running tithi on the right —
          the one calendar fact promoted into the first-viewport card (the anga
          grid it belongs to sits past the fold on most phones). The end instant
          renders when this day's solve knows it (the successor tithi's end
          belongs to tomorrow's solve — name only there, never a guess);
          formatEndInstant adds a short date on past-midnight ends. The anga
          tile below stays the canonical sunrise-tithi + kshaya detail. */}
      <View style={styles.kickerRow}>
        <Text style={[eyebrowTextStyle(lang, 12), { color: colors.saffronDeep }]}>
          {contentByLang(lang, 'आज का मुहूर्त', "Today's Timings")}
        </Text>
        {kickerTithi && panchang && (
          // A column, not one line: the handover sits UNDER the तक line rather
          // than extending it, so the kicker never has to shrink to fit both.
          <View style={styles.kickerTithi}>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.kickerTithiLine}>
              <Text style={[eyebrowTextStyle(lang, 10, 0.6), { color: colors.saffronDeep }]}>
                {contentByLang(lang, 'तिथि · ', 'Tithi · ')}
              </Text>
              <Text style={{ fontFamily: titleFont, fontSize: 14.5, color: colors.ink }}>
                {contentByLang(lang, kickerTithi.nameHi, kickerTithi.nameEn)}
              </Text>
              {kickerTithi.endTime && (
                // Same face rule as the anga tiles' तक line: Latin semibold for
                // en; the script body face otherwise — Cormorant has no Indic
                // glyphs, and formatEndInstant's short-date suffix is Devanagari
                // in hi (§3).
                <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : bodyFont, fontSize: 11, color: colors.inkSoft, fontVariant: [...LINING] }}>
                  {contentByLang(lang, ' तक ', ' till ')}
                  {formatEndInstant(kickerTithi.endTime, panchang.date, lang)}
                </Text>
              )}
            </Text>
            {handover && (
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={{ fontFamily: bodyFont, fontSize: 10.5, color: colors.inkMuted, textAlign: 'right', marginTop: 1 }}
              >
                {contentByLang(lang, `फिर ${handover.nameHi} — शेष दिन`, `then ${handover.nameEn} — rest of day`)}
              </Text>
            )}
          </View>
        )}
      </View>

      {run.length === 8 && (
        <ChoghadiyaStrip
          key={run[0].start.getTime()}
          periods={run}
          nowIndex={nowIndex >= 0 ? nowIndex : null}
          progress={nowProgress}
        />
      )}

      {/* Rahu and Abhijit as equal halves, tinted avoid/gold with a dot and a
          label (never colour alone); a today view says how far off each is. */}
      <View style={styles.tiles}>
        <View style={[styles.tile, { backgroundColor: colors.avoidTint, borderColor: colors.avoidChipBg, borderRadius: radii.md }]}>
          <View style={styles.tileLabel}>
            <View style={[styles.tileDot, { backgroundColor: colors.avoid }]} />
            <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.avoidDeep }}>{contentByLang(lang, 'राहु काल', 'Rahu Kaal')}</Text>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 15, color: colors.ink, marginTop: 3, fontVariant: [...LINING] }}>
            {formatRangeCompact(rahu.start, rahu.end)}
          </Text>
          {isToday && (
            <Text style={{ fontFamily: bodyFont, fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
              {windowState(rahu.start, rahu.end, at, lang)}
            </Text>
          )}
        </View>
        <View style={[styles.tile, { backgroundColor: colors.goldTint, borderColor: colors.goldChipBg, borderRadius: radii.md }]}>
          <View style={styles.tileLabel}>
            <View style={[styles.tileDot, { backgroundColor: colors.gold }]} />
            <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.saffronDeep }}>{contentByLang(lang, 'अभिजीत', 'Abhijit')}</Text>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 15, color: colors.ink, marginTop: 3, fontVariant: [...LINING] }}>
            {abhijit ? formatRangeCompact(abhijit.start, abhijit.end) : '—'}
          </Text>
          {isToday && abhijit && (
            <Text style={{ fontFamily: bodyFont, fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
              {windowState(abhijit.start, abhijit.end, at, lang)}
            </Text>
          )}
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
  // Baseline-aligned so the 12pt eyebrow and the 14.5pt tithi name share one
  // visual line; the tithi shrinks first if the row runs out of width.
  kickerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  kickerTithi: { flexShrink: 1, alignItems: 'flex-end' },
  kickerTithiLine: { textAlign: 'right' },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 13 },
  tile: { flex: 1, borderWidth: 1, padding: 11 },
  tileLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tileDot: { width: 7, height: 7, borderRadius: 3.5 },
  viewAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  skelStrip: { gap: 8, marginTop: 14 },
  skelBar: { borderRadius: 5, opacity: 0.55 },
});

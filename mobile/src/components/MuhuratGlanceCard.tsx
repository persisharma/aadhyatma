import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont, eyebrowTextStyle } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { useMuhurat } from '@/panchang/useMuhurat';
import { nextAuspiciousPeriod } from '@/panchang/muhurat';
import { prevailingTithi, successorTithiToday } from '@/panchang/prevailingTithi';
import { formatClock, formatRange, formatRangeCompact, formatEndInstant } from '@/panchang/muhuratFormat';
import type { CalendarSystem } from '@/panchang/types';
import type { Lang } from '@/data/gita/language';
import CelestialGlyph from './CelestialGlyph';
import ChoghadiyaStrip from './ChoghadiyaStrip';

// Cormorant's default figures are old-style; clock digits read as one height.
const LINING = ['lining-nums', 'tabular-nums'] as const;

/** "41 मिनट" / "1 घं 11 मि" — a span of whole minutes, rounded up. */
function formatSpan(ms: number, lang: Lang): string {
  const total = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return contentByLang(lang, `${m} मिनट`, `${m} min`);
  if (m === 0) return contentByLang(lang, `${h} घं`, `${h} h`);
  return contentByLang(lang, `${h} घं ${m} मि`, `${h} h ${m} m`);
}

/** Where a today window stands against the clock: "in 5 h 13 m" / running / passed. */
function windowState(start: Date, end: Date, at: number, lang: Lang): string {
  if (at < start.getTime()) return contentByLang(lang, `${formatSpan(start.getTime() - at, lang)} में`, `in ${formatSpan(start.getTime() - at, lang)}`);
  if (at < end.getTime()) return contentByLang(lang, 'अभी चल रहा', 'running now');
  return contentByLang(lang, 'बीत गया', 'passed');
}

/**
 * The Muhurat now-card (PRD-14; design.md §33). Leads the Panchang → Calendar day
 * panel and answers "is now good, and for how long?" before anything else. On a
 * today view between sunset and sunrise it turns to night — moon in the day's
 * phase on a deep sepia surface — and by day it keeps the warm gradient with the
 * sun. Below the hero, the running half's eight choghadiya as a tappable strip.
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
  // Clock digits: Latin semibold for en (non-italic — italic strokes wash out on
  // the gradient, §3/§12); the script face otherwise, since Cormorant has no
  // Indic glyphs and these lines carry तक/से/में.
  const clockFont = lang === 'en' ? fontFamilies.latinSemiBold : bodyFont;

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
  // Night surface only for a live night read; a browsed date is a day almanac.
  const night = showNow && nowChoghadiya!.phase === 'night';
  const ink = night ? colors.nightInk : colors.ink;
  const inkSoft = night ? colors.nightInkSoft : colors.inkSoft;
  const inkMuted = night ? colors.nightInkMuted : colors.inkMuted;
  const accent = night ? colors.nightGold : colors.saffronDeep;
  const divider = night ? colors.nightDivider : colors.divider;
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
  // "When is it good next?" — only while an avoid period runs (an auspicious
  // "now" already answers the question). Null late at night when nothing
  // auspicious remains before the next sunrise.
  const nextShubh = showNow && nowAvoid ? nextAuspiciousPeriod(muhurat, new Date(at)) : null;

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

  const tileStyle = night
    ? { backgroundColor: colors.nightChipBg, borderColor: colors.nightDivider }
    : null;

  return (
    <LinearGradient
      colors={night ? [colors.nightCardFrom, colors.nightCardTo] : [colors.cardActiveFrom, colors.cardActiveTo]}
      style={[styles.card, { borderColor: night ? colors.nightCardBorder : colors.cardActiveBorder, borderRadius: radii.lg, padding: spacing.lg }, elevation.raised]}
    >
      {/* Kicker row: the eyebrow on the left, the running tithi on the right —
          the one calendar fact promoted into the first-viewport hero card (the
          anga grid it belongs to sits past the fold on most phones). The end
          instant renders when this day's solve knows it (the successor tithi's
          end belongs to tomorrow's solve — name only there, never a guess);
          formatEndInstant adds a short date on past-midnight ends. The anga
          tile below stays the canonical sunrise-tithi + kshaya detail. */}
      <View style={styles.kickerRow}>
        <Text style={[eyebrowTextStyle(lang, 12), { color: accent }]}>
          {contentByLang(lang, 'आज का मुहूर्त', "Today's Timings")}
        </Text>
        {kickerTithi && panchang && (
          // A column, not one line: the handover sits UNDER the तक line rather
          // than extending it, so the kicker never has to shrink to fit both.
          <View style={styles.kickerTithi}>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.kickerTithiLine}>
              <Text style={[eyebrowTextStyle(lang, 10, 0.6), { color: accent }]}>
                {contentByLang(lang, 'तिथि · ', 'Tithi · ')}
              </Text>
              <Text style={{ fontFamily: titleFont, fontSize: 14.5, color: ink }}>
                {contentByLang(lang, kickerTithi.nameHi, kickerTithi.nameEn)}
              </Text>
              {kickerTithi.endTime && (
                // Same face rule as the anga tiles' तक line: Latin semibold for
                // en; the script body face otherwise — Cormorant has no Indic
                // glyphs, and formatEndInstant's short-date suffix is Devanagari
                // in hi (§3).
                <Text style={{ fontFamily: clockFont, fontSize: 11, color: inkSoft, fontVariant: [...LINING] }}>
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
                style={{ fontFamily: bodyFont, fontSize: 10.5, color: inkMuted, textAlign: 'right', marginTop: 1 }}
              >
                {contentByLang(lang, `फिर ${handover.nameHi} — शेष दिन`, `then ${handover.nameEn} — rest of day`)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Hero: the sky mark, then the current choghadiya and how long it has
          left when today — else the day's Abhijit. */}
      <View style={styles.nowRow}>
        <CelestialGlyph kind={night ? 'moon' : 'sun'} tithiIndex={panchang?.tithi.index} />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              eyebrowTextStyle(lang, 9, 0.6),
              { textTransform: lang === 'en' ? 'uppercase' : 'none', color: inkMuted },
            ]}
          >
            {showNow ? contentByLang(lang, 'अभी', 'Now') : contentByLang(lang, 'शुभ मुहूर्त', 'Auspicious')}
          </Text>
          <Text style={{ fontFamily: titleFont, fontSize: 22, color: ink }}>
            {showNow
              ? contentByLang(lang, `${nowChoghadiya!.nameHi} चौघड़िया`, `${nowChoghadiya!.nameEn} Choghadiya`)
              : contentByLang(lang, 'अभिजीत मुहूर्त', 'Abhijit Muhurat')}
          </Text>
          {showNow ? (
            <Text style={{ marginTop: 1 }}>
              <Text style={{ fontFamily: titleFont, fontSize: 14, color: ink }}>
                {contentByLang(lang, `${formatSpan(nowChoghadiya!.end.getTime() - at, lang)} शेष`, `${formatSpan(nowChoghadiya!.end.getTime() - at, lang)} left`)}
              </Text>
              <Text style={{ fontFamily: clockFont, fontSize: 12.5, color: inkSoft, fontVariant: [...LINING] }}>
                {contentByLang(lang, ` · ${formatClock(nowChoghadiya!.end)} तक`, ` · till ${formatClock(nowChoghadiya!.end)}`)}
              </Text>
            </Text>
          ) : (
            <Text style={{ fontFamily: clockFont, fontSize: 12.5, color: inkSoft, marginTop: 1, fontVariant: [...LINING] }}>
              {abhijit ? formatRange(abhijit.start, abhijit.end) : ''}
            </Text>
          )}
        </View>
        {showNow && (
          <Text
            style={[
              styles.tag,
              {
                fontFamily: lang === 'en' ? fontFamilies.latinBold : titleFont,
                // Deep cuts on the chip tints — the composite darkens the surface,
                // so raw `avoid` drops under AA there (colors.contrast.test.ts).
                // At night both tints composite to a mid brown that coloured text
                // cannot clear; cream ink does, and the tint carries the quality.
                color: night ? colors.nightInk : nowAvoid ? colors.avoidDeep : accent,
                backgroundColor: nowAvoid ? (night ? colors.nightAvoidTrack : colors.avoidChipBg) : (night ? colors.nightGoldTrack : colors.goldChipBg),
              },
            ]}
          >
            {nowAvoid ? contentByLang(lang, 'त्याज्य', 'avoid') : contentByLang(lang, 'शुभ', 'auspicious')}
          </Text>
        )}
      </View>

      {/* While an avoid period runs, answer the natural follow-up — "when is it
          good next?" — inline, so the inauspicious case doesn't need a tap into
          the detail. Quality is carried by the gold dot PLUS the text (§12). */}
      {nextShubh && (
        <View style={styles.nextShubhRow} accessibilityLabel={`Next auspicious: ${nextShubh.nameEn}, from ${formatClock(nextShubh.start)}`}>
          <View style={[styles.nextDot, { backgroundColor: night ? colors.nightGold : colors.gold }]} />
          <Text style={{ flexShrink: 1 }} numberOfLines={1}>
            <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: inkSoft }}>
              {contentByLang(lang, 'अगला शुभ: ', 'Next auspicious: ')}
            </Text>
            <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: ink }}>
              {contentByLang(lang, `${nextShubh.nameHi} चौघड़िया`, `${nextShubh.nameEn} Choghadiya`)}
            </Text>
            {/* Clock digits stay on the Latin semibold face; the Indic 'से'
                suffix must not — Cormorant has no Indic glyphs (§3). */}
            <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 13, color: accent, fontVariant: [...LINING] }}>
              {lang === 'en' ? ` from ${formatClock(nextShubh.start)}` : ` ${formatClock(nextShubh.start)}`}
            </Text>
            {lang !== 'en' && (
              <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: inkSoft }}>
                {contentByLang(lang, ' से', '')}
              </Text>
            )}
          </Text>
        </View>
      )}

      {run.length === 8 && (
        <ChoghadiyaStrip
          key={run[0].start.getTime()}
          periods={run}
          nowIndex={nowIndex >= 0 ? nowIndex : null}
          progress={nowProgress}
          tone={night ? 'night' : 'day'}
        />
      )}

      {/* Rahu and Abhijit as equal halves, tinted avoid/gold with a dot and a
          label (never colour alone); a today view says how far off each is. */}
      <View style={styles.tiles}>
        <View style={[styles.tile, { backgroundColor: colors.avoidTint, borderColor: colors.avoidChipBg, borderRadius: radii.md }, tileStyle]}>
          <View style={styles.tileLabel}>
            <View style={[styles.tileDot, { backgroundColor: night ? colors.nightAvoid : colors.avoid }]} />
            <Text style={{ fontFamily: titleFont, fontSize: 12, color: night ? colors.nightAvoidText : colors.avoidDeep }}>{contentByLang(lang, 'राहु काल', 'Rahu Kaal')}</Text>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 15, color: ink, marginTop: 3, fontVariant: [...LINING] }}>
            {formatRangeCompact(rahu.start, rahu.end)}
          </Text>
          {isToday && (
            <Text style={{ fontFamily: bodyFont, fontSize: 11, color: inkMuted, marginTop: 1 }}>
              {windowState(rahu.start, rahu.end, at, lang)}
            </Text>
          )}
        </View>
        <View style={[styles.tile, { backgroundColor: colors.goldTint, borderColor: colors.goldChipBg, borderRadius: radii.md }, tileStyle]}>
          <View style={styles.tileLabel}>
            <View style={[styles.tileDot, { backgroundColor: night ? colors.nightGold : colors.gold }]} />
            <Text style={{ fontFamily: titleFont, fontSize: 12, color: accent }}>{contentByLang(lang, 'अभिजीत', 'Abhijit')}</Text>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 15, color: ink, marginTop: 3, fontVariant: [...LINING] }}>
            {abhijit ? formatRangeCompact(abhijit.start, abhijit.end) : '—'}
          </Text>
          {isToday && abhijit && (
            <Text style={{ fontFamily: bodyFont, fontSize: 11, color: inkMuted, marginTop: 1 }}>
              {windowState(abhijit.start, abhijit.end, at, lang)}
            </Text>
          )}
        </View>
      </View>

      <Pressable onPress={onViewAll} accessibilityRole="button" style={[styles.viewAll, { borderTopColor: divider }]}>
        <Text style={{ fontFamily: titleFont, fontSize: 13, color: night ? colors.nightGold : colors.saffron }}>
          {contentByLang(lang, 'सभी मुहूर्त व चौघड़िया', 'All timings & choghadiya')}
        </Text>
        <Text style={{ color: night ? colors.nightGold : colors.saffron, fontSize: 18 }}>›</Text>
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
  nowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  // No fontWeight: the call site sets fontFamilies.latinBold, a static 700 file
  // that already carries the weight (see utils/langType.ts).
  tag: { fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  nextShubhRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  nextDot: { width: 8, height: 8, borderRadius: 4 },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 13 },
  tile: { flex: 1, borderWidth: 1, padding: 11 },
  tileLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tileDot: { width: 7, height: 7, borderRadius: 3.5 },
  viewAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  skelBar: { borderRadius: 5, opacity: 0.55 },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { formatClock, formatRangeCompact } from '@/panchang/muhuratFormat';
import { formatSpan, windowState } from '@/panchang/muhuratSpan';
import { panchangDateLabel as fmtDate } from '@/panchang/panchangShareText';
import { PAKSHA_NAMES_EN, PAKSHA_NAMES_HI } from '@/panchang/names';
import { computeShubhYogas } from '@/panchang/shubhYoga';
import type { PanchangData } from '@/panchang/types';
import type { ChoghadiyaPeriod, MuhuratDay } from '@/panchang/muhurat';
import CelestialGlyph from './CelestialGlyph';
import PanchangAngaCard from './PanchangAngaCard';
import PanchangPanel from './PanchangPanel';
import ShubhYogaCard from './ShubhYogaCard';
import SunMoonCard from './SunMoonCard';

// Cormorant's default figures are old-style; clock digits read as one height.
const LINING = ['lining-nums', 'tabular-nums'] as const;

/**
 * The Muhurat detail body (design.md §33, Muhurat Detail): the day's full
 * timings in the Panchang tab's panel language — the same anga, शुभ योग and
 * sun/moon panels as the day panel, the four kaal windows as the Muhurat card's
 * tinted tiles, and all 16 choghadiya as two agenda panels. On today the running
 * period is ringed with how much is left and a progress track, and passed ones
 * dim; the parent's minute tick re-renders it. Quality is always a word (शुभ /
 * त्याज्य) beside its colour bar, never colour alone (design.md §12).
 */
export default function MuhuratCardBody({
  p,
  md,
  nowStartMs,
  cityLabel,
  isToday = true,
}: {
  p: PanchangData;
  md: MuhuratDay;
  /** Epoch-ms start of the choghadiya running now, to flag the exact period
   * (never the repeated key). Null/undefined when not today. */
  nowStartMs?: number | null;
  cityLabel: string;
  /** A specific future/past day (reached via the Muhurat Finder, design.md
   * §60) shows no live state — nothing is "now" or "passed" there. */
  isToday?: boolean;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const at = Date.now();

  // Pure arithmetic over data this body already holds — derived per render
  // like MuhuratDay itself, never cached or persisted (RULEBOOK §17.6).
  const shubhYogas = React.useMemo(() => computeShubhYogas(p, md.nextSunrise), [p, md]);

  const masa = contentByLang(
    lang,
    `${p.lunarMonth.nameHi}${p.lunarMonth.isAdhik ? ' (अधिक)' : ''} ${PAKSHA_NAMES_HI[p.tithi.paksha]} ${p.tithi.nameHi}`,
    `${p.lunarMonth.nameEn}${p.lunarMonth.isAdhik ? ' (Adhik)' : ''} ${PAKSHA_NAMES_EN[p.tithi.paksha]} ${p.tithi.nameEn}`,
  );

  // A kaal/abhijit window as the Muhurat card's half tile: tint + dot + label
  // (never colour alone), the window, and on today where it stands.
  const Tile = ({ label, start, end, avoid }: { label: string; start: Date; end: Date; avoid: boolean }) => (
    <View
      style={[
        styles.tile,
        { backgroundColor: avoid ? colors.avoidTint : colors.goldTint, borderColor: avoid ? colors.avoidChipBg : colors.goldChipBg, borderRadius: radii.md },
      ]}
    >
      <View style={styles.tileLabel}>
        <View style={[styles.dot, { backgroundColor: avoid ? colors.avoid : colors.gold }]} />
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: titleFont, fontSize: 12, color: avoid ? colors.avoidDeep : colors.saffronDeep }}>{label}</Text>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 15, color: colors.ink, marginTop: 3, fontVariant: [...LINING] }}>
        {formatRangeCompact(start, end)}
      </Text>
      {isToday && (
        <Text style={{ fontFamily: bodyFont, fontSize: 11, color: colors.inkMuted, marginTop: 1 }}>
          {windowState(start, end, at, lang)}
        </Text>
      )}
    </View>
  );

  const Chog = ({ c, first }: { c: ChoghadiyaPeriod; first: boolean }) => {
    const avoid = c.quality === 'avoid';
    const now = c.start.getTime() === nowStartMs;
    const past = isToday && !now && c.end.getTime() <= at;
    const progress = now ? Math.min(1, Math.max(0, (at - c.start.getTime()) / Math.max(1, c.end.getTime() - c.start.getTime()))) : 0;
    // §12 — quality carries a text cue, never colour alone.
    const quality = avoid ? contentByLang(lang, 'त्याज्य', 'avoid') : contentByLang(lang, 'शुभ', 'auspicious');
    const left = now ? formatSpan(c.end.getTime() - at, lang) : null;
    return (
      <View
        accessibilityLabel={`${c.nameEn} choghadiya, ${formatRangeCompact(c.start, c.end)}, ${avoid ? 'avoid' : 'auspicious'}${now ? ', now' : past ? ', passed' : ''}`}
        style={[
          styles.chog,
          !first && !now && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider },
          now && [styles.chogNow, { backgroundColor: avoid ? colors.avoidTint : colors.goldTint, borderColor: colors.saffron, borderRadius: radii.md }],
          past && { opacity: 0.5 },
        ]}
      >
        <View style={styles.chogRow}>
          <View style={[styles.chogBar, { backgroundColor: avoid ? colors.choghadiyaAvoid : colors.choghadiyaShubh }]} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink }}>
              {contentByLang(lang, c.nameHi, c.nameEn)}
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : bodyFont, fontSize: 11.5, color: avoid ? colors.avoidDeep : colors.saffronDeep, marginTop: 1 }}>
              {quality}
              {now && left ? contentByLang(lang, ` · अभी · ${left} शेष`, ` · now · ${left} left`) : ''}
            </Text>
          </View>
          <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 14.5, color: now ? colors.ink : colors.inkSoft, fontVariant: [...LINING] }}>
            {formatRangeCompact(c.start, c.end)}
          </Text>
        </View>
        {now && (
          <View style={[styles.track, { backgroundColor: avoid ? colors.choghadiyaAvoidTrack : colors.choghadiyaShubhTrack }]}>
            <View style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: avoid ? colors.avoidDeep : colors.gold }} />
          </View>
        )}
      </View>
    );
  };

  const Half = ({ title, periods, from, to }: { title: string; periods: ChoghadiyaPeriod[]; from: Date; to: Date }) => (
    <PanchangPanel title={title} meta={`${formatClock(from)} – ${formatClock(to)}`}>
      <View style={{ marginTop: 4 }}>
        {periods.map((c, i) => (
          <Chog key={c.start.getTime()} c={c} first={i === 0} />
        ))}
      </View>
    </PanchangPanel>
  );

  return (
    <View>
      {/* The day, stated once: the moon in its phase (the sky's mark), the
          date, and masa · paksha · tithi · samvat. */}
      <View style={styles.head}>
        <View style={[styles.moon, { backgroundColor: colors.skyNightTop }]}>
          <CelestialGlyph kind="moon" tithiIndex={p.tithi.index} size={16} />
        </View>
        <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 19, color: colors.ink, textAlign: 'center', marginTop: 8 }}>
          {contentByLang(lang, p.vara.nameHi, p.vara.nameEn)}, {fmtDate(p.date, lang)}
        </Text>
        <Text style={{ fontFamily: bodyFont, fontSize: 12.5, color: colors.inkMuted, textAlign: 'center', marginTop: 2 }}>
          {masa} · {contentByLang(lang, `संवत ${p.vikramSamvat}`, `Samvat ${p.vikramSamvat}`)}
        </Text>
      </View>

      <PanchangAngaCard p={p} />
      <ShubhYogaCard yogas={shubhYogas} referenceDay={p.date} />

      <PanchangPanel title={contentByLang(lang, 'मुहूर्त व काल', 'Muhurat & Kaal')}>
        <View style={styles.tiles}>
          {md.abhijit ? (
            <Tile label={contentByLang(lang, 'अभिजीत मुहूर्त', 'Abhijit Muhurat')} start={md.abhijit.start} end={md.abhijit.end} avoid={false} />
          ) : null}
          <Tile label={contentByLang(lang, md.rahu.nameHi, md.rahu.nameEn)} start={md.rahu.start} end={md.rahu.end} avoid />
          <Tile label={contentByLang(lang, md.gulika.nameHi, md.gulika.nameEn)} start={md.gulika.start} end={md.gulika.end} avoid />
          <Tile label={contentByLang(lang, md.yamaganda.nameHi, md.yamaganda.nameEn)} start={md.yamaganda.start} end={md.yamaganda.end} avoid />
        </View>
      </PanchangPanel>

      <Half title={contentByLang(lang, 'दिन के चौघड़िया', 'Day Choghadiya')} periods={md.dayChoghadiya} from={md.sunrise} to={md.sunset} />
      <Half title={contentByLang(lang, 'रात्रि के चौघड़िया', 'Night Choghadiya')} periods={md.nightChoghadiya} from={md.sunset} to={md.nextSunrise} />

      <SunMoonCard p={p} />

      <Text style={[styles.footnote, { color: colors.inkMuted, fontFamily: bodyFont }]}>
        {contentByLang(lang, `सभी समय ${cityLabel} के अनुसार`, `All times for ${cityLabel}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', paddingTop: 4, paddingBottom: 4 },
  moon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 8 },
  // Two per row: (100% − one 8 pt gap) / 2.
  tile: { flexBasis: '47%', flexGrow: 1, borderWidth: 1, padding: 11 },
  tileLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  chog: { paddingVertical: 9 },
  // The running period: ringed, inset from the panel edge by its own padding.
  chogNow: { borderWidth: 1.5, paddingHorizontal: 10, marginHorizontal: -10, marginVertical: 2 },
  chogRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chogBar: { width: 4, height: 30, borderRadius: 2 },
  track: { height: 3, borderRadius: 1.5, overflow: 'hidden', marginTop: 8, marginLeft: 14 },
  footnote: { fontSize: 11.5, textAlign: 'center', marginTop: 14 },
});

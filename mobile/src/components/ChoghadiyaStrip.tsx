import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { formatClock, formatRangeCompact } from '@/panchang/muhuratFormat';
import type { ChoghadiyaPeriod } from '@/panchang/muhurat';

// Cormorant's default figures are old-style; clock digits read as one height.
const LINING = ['lining-nums', 'tabular-nums'] as const;

/**
 * One half (day or night) of choghadiya as eight segments (design.md §33): past
 * segments dimmed, the running one taller with its elapsed part filled and a
 * notch at "now". Tapping a segment states it below — name, window, quality and
 * whether it has passed. Quality is carried by the printed name and the detail
 * pill, never by colour alone (§12). Parents key it by the run's first start so
 * a picked segment resets when the run rolls over.
 */
export default function ChoghadiyaStrip({
  periods,
  nowIndex,
  progress,
  tone,
}: {
  periods: ChoghadiyaPeriod[];
  nowIndex: number | null;
  /** 0..1 through the running period; ignored when `nowIndex` is null. */
  progress: number;
  tone: 'day' | 'night';
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const [picked, setPicked] = useState<number | null>(null);
  const shown = picked ?? nowIndex;
  const night = tone === 'night';
  const ink = night ? colors.nightInk : colors.ink;
  const inkSoft = night ? colors.nightInkSoft : colors.inkSoft;
  const inkMuted = night ? colors.nightInkMuted : colors.inkMuted;
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const clockFont = lang === 'en' ? fontFamilies.latinSemiBold : bodyFont;

  const fill = (p: ChoghadiyaPeriod) =>
    p.quality === 'avoid'
      ? night ? colors.nightAvoid : colors.choghadiyaAvoid
      : night ? colors.nightShubh : colors.choghadiyaShubh;
  const elapsedFill = (p: ChoghadiyaPeriod) =>
    p.quality === 'avoid'
      ? night ? colors.nightAvoid : colors.avoidDeep
      : night ? colors.nightGold : colors.gold;
  const trackFill = (p: ChoghadiyaPeriod) =>
    p.quality === 'avoid'
      ? night ? colors.nightAvoidTrack : colors.choghadiyaAvoidTrack
      : night ? colors.nightGoldTrack : colors.choghadiyaShubhTrack;
  const qualityLabel = (p: ChoghadiyaPeriod) =>
    p.quality === 'avoid' ? contentByLang(lang, 'त्याज्य', 'avoid') : contentByLang(lang, 'शुभ', 'auspicious');

  const first = periods[0];
  const last = periods[periods.length - 1];
  const startLabel = first.phase === 'night' ? contentByLang(lang, 'सूर्यास्त', 'Sunset') : contentByLang(lang, 'सूर्योदय', 'Sunrise');
  const endLabel = first.phase === 'night' ? contentByLang(lang, 'सूर्योदय', 'Sunrise') : contentByLang(lang, 'सूर्यास्त', 'Sunset');
  const pct = Math.round(progress * 100);
  const detail = shown != null ? periods[shown] : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {periods.map((p, i) => {
          const isNow = i === nowIndex;
          const past = nowIndex != null && i < nowIndex;
          const selected = i === shown;
          const name = contentByLang(lang, p.nameHi, p.nameEn);
          return (
            <Pressable
              key={p.start.getTime()}
              onPress={() => setPicked(i)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${p.nameEn} choghadiya, ${formatRangeCompact(p.start, p.end)}, ${p.quality === 'avoid' ? 'avoid' : 'auspicious'}${isNow ? `, now, ${pct}% elapsed` : past ? ', passed' : ''}`}
              style={styles.segment}
            >
              {isNow && (
                <View
                  style={[styles.notch, { left: `${pct}%`, borderTopColor: night ? colors.nightGold : colors.saffronDeep }]}
                />
              )}
              <View style={[styles.ring, { borderColor: selected ? ink : 'transparent', opacity: past ? 0.45 : 1 }]}>
                {isNow ? (
                  <View style={[styles.bar, styles.barNow, { backgroundColor: trackFill(p) }]}>
                    <View style={{ width: `${pct}%`, height: '100%', backgroundColor: elapsedFill(p) }} />
                  </View>
                ) : (
                  <View style={[styles.bar, { backgroundColor: fill(p) }]} />
                )}
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                maxFontSizeMultiplier={1.3}
                style={{ fontFamily: isNow ? titleFont : bodyFont, fontSize: 10.5, lineHeight: 15, color: isNow ? (night ? colors.nightGold : colors.saffronDeep) : past ? inkMuted : inkSoft }}
              >
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.ends}>
        <Text style={{ fontFamily: bodyFont, fontSize: 10.5, color: inkMuted }}>
          {startLabel} <Text style={{ fontFamily: clockFont, fontVariant: [...LINING] }}>{formatClock(first.start)}</Text>
        </Text>
        <Text style={{ fontFamily: bodyFont, fontSize: 10.5, color: inkMuted }}>
          {endLabel} <Text style={{ fontFamily: clockFont, fontVariant: [...LINING] }}>{formatClock(last.end)}</Text>
        </Text>
      </View>

      {detail && (
        <View
          accessibilityLiveRegion="polite"
          style={[styles.detail, { backgroundColor: night ? colors.nightChipBg : colors.cardSurface, borderColor: night ? colors.nightDivider : colors.divider }]}
        >
          <Text style={{ flex: 1 }} numberOfLines={1}>
            <Text style={{ fontFamily: titleFont, fontSize: 13.5, color: ink }}>
              {contentByLang(lang, detail.nameHi, detail.nameEn)}
            </Text>
            <Text style={{ fontFamily: clockFont, fontSize: 13, color: inkSoft, fontVariant: [...LINING] }}>
              {'  '}{formatRangeCompact(detail.start, detail.end)}
            </Text>
          </Text>
          <Text style={{ fontFamily: bodyFont, fontSize: 11, color: inkMuted }}>
            {shown === nowIndex
              ? contentByLang(lang, 'अभी', 'now')
              : nowIndex != null && shown != null && shown < nowIndex
                ? contentByLang(lang, 'बीत चुका', 'passed')
                : nowIndex != null
                  ? contentByLang(lang, 'आगे', 'later')
                  : ''}
          </Text>
          <Text
            style={[
              styles.pill,
              {
                fontFamily: lang === 'en' ? fontFamilies.latinBold : titleFont,
                // Cream at night: coloured text on the composited tints falls under AA.
                color: night ? colors.nightInk : detail.quality === 'avoid' ? colors.avoidDeep : colors.saffronDeep,
                backgroundColor: detail.quality === 'avoid' ? (night ? colors.nightAvoidTrack : colors.avoidChipBg) : (night ? colors.nightGoldTrack : colors.goldChipBg),
              },
            ]}
          >
            {qualityLabel(detail)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12 },
  row: { flexDirection: 'row', gap: 3 },
  // ≥ 44 dp tall so each of the eight is a real touch target.
  segment: { flex: 1, minHeight: 44, alignItems: 'center', paddingTop: 9, gap: 5 },
  notch: {
    position: 'absolute',
    top: 0,
    marginLeft: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  // The selected ring is always laid out (transparent when unselected) so a tap
  // never shifts the row.
  ring: { alignSelf: 'stretch', borderWidth: 1.5, borderRadius: 7, padding: 1.5, height: 19, justifyContent: 'center' },
  bar: { height: 9, borderRadius: 4.5, overflow: 'hidden' },
  barNow: { height: 13, borderRadius: 5, flexDirection: 'row' },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingVertical: 8, paddingHorizontal: 11, borderRadius: 12, borderWidth: 1 },
  pill: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
});

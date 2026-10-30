import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { formatClock, formatRange } from '@/panchang/muhuratFormat';
import type { ChoghadiyaPeriod } from '@/panchang/muhurat';

// Cormorant's default figures are old-style; clock digits read as one height.
const LINING = ['lining-nums', 'tabular-nums'] as const;

/**
 * One half (day or night) of choghadiya as eight segments (design.md §33): past
 * segments dimmed, the running one taller with its elapsed part filled and a
 * notch at "now". Tapping a segment states it below — name, window, quality and
 * whether it has passed. Quality is carried by the printed name, the legend and
 * the detail pill, never by colour alone (§12). Parents key it by the run's
 * first start so a picked segment resets when the run rolls over.
 */
export default function ChoghadiyaStrip({
  periods,
  nowIndex,
  progress,
}: {
  periods: ChoghadiyaPeriod[];
  nowIndex: number | null;
  /** 0..1 through the running period; ignored when `nowIndex` is null. */
  progress: number;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const [picked, setPicked] = useState<number | null>(null);
  const shown = picked ?? nowIndex;
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const clockFont = lang === 'en' ? fontFamilies.latinSemiBold : bodyFont;
  const avoid = (p: ChoghadiyaPeriod) => p.quality === 'avoid';

  const first = periods[0];
  const last = periods[periods.length - 1];
  const night = first.phase === 'night';
  const pct = Math.round(progress * 100);
  const detail = shown != null ? periods[shown] : null;
  const small = { fontFamily: bodyFont, fontSize: 10.5, color: colors.inkMuted };

  return (
    <View style={styles.wrap}>
      <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.ink }}>
        {night ? contentByLang(lang, 'रात्रि के चौघड़िया', 'Night choghadiya') : contentByLang(lang, 'दिन के चौघड़िया', 'Day choghadiya')}
      </Text>
      <View style={styles.row}>
        {periods.map((p, i) => {
          const isNow = i === nowIndex;
          const past = nowIndex != null && i < nowIndex;
          const selected = i === shown;
          return (
            <Pressable
              key={p.start.getTime()}
              onPress={() => setPicked(i)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${p.nameEn} choghadiya, ${formatRange(p.start, p.end)}, ${avoid(p) ? 'avoid' : 'auspicious'}${isNow ? `, now, ${pct}% elapsed` : past ? ', passed' : ''}`}
              style={styles.segment}
            >
              {isNow && <View style={[styles.notch, { left: `${pct}%`, borderTopColor: colors.saffronDeep }]} />}
              <View style={[styles.ring, { borderColor: selected ? colors.ink : 'transparent', opacity: past ? 0.45 : 1 }]}>
                {isNow ? (
                  <View style={[styles.bar, styles.barNow, { backgroundColor: avoid(p) ? colors.choghadiyaAvoidTrack : colors.choghadiyaShubhTrack }]}>
                    <View style={{ width: `${pct}%`, height: '100%', backgroundColor: avoid(p) ? colors.avoidDeep : colors.gold }} />
                  </View>
                ) : (
                  <View style={[styles.bar, { backgroundColor: avoid(p) ? colors.choghadiyaAvoid : colors.choghadiyaShubh }]} />
                )}
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                maxFontSizeMultiplier={1.3}
                // No fixed lineHeight: with adjustsFontSizeToFit it lets iOS ratchet
                // the size down past minimumFontScale on every live re-render (§3.0).
                style={{ fontFamily: isNow ? titleFont : bodyFont, fontSize: 10.5, color: isNow ? colors.saffronDeep : past ? colors.inkMuted : colors.inkSoft }}
              >
                {contentByLang(lang, p.nameHi, p.nameEn)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.ends}>
        <Text style={small}>
          <Text style={{ fontFamily: clockFont, fontVariant: [...LINING] }}>{formatClock(first.start)}</Text>
        </Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.choghadiyaShubh }]} />
            <Text style={small}>{contentByLang(lang, 'शुभ', 'auspicious')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.choghadiyaAvoid }]} />
            <Text style={small}>{contentByLang(lang, 'त्याज्य', 'avoid')}</Text>
          </View>
        </View>
        <Text style={small}>
          <Text style={{ fontFamily: clockFont, fontVariant: [...LINING] }}>{formatClock(last.end)}</Text>
        </Text>
      </View>

      {detail && (
        <View accessibilityLiveRegion="polite" style={[styles.detail, { backgroundColor: colors.cardSurface, borderColor: colors.divider }]}>
          <Text style={{ flex: 1 }} numberOfLines={1}>
            <Text style={{ fontFamily: titleFont, fontSize: 13.5, color: colors.ink }}>
              {contentByLang(lang, detail.nameHi, detail.nameEn)}
            </Text>
            <Text style={{ fontFamily: clockFont, fontSize: 13, color: colors.inkSoft, fontVariant: [...LINING] }}>
              {'  '}{formatRange(detail.start, detail.end)}
            </Text>
          </Text>
          {nowIndex != null && shown != null && (
            <Text style={{ fontFamily: bodyFont, fontSize: 11, color: colors.inkMuted }}>
              {shown === nowIndex
                ? contentByLang(lang, `अभी · ${pct}% बीता`, `now · ${pct}% gone`)
                : shown < nowIndex
                  ? contentByLang(lang, 'बीत चुका', 'passed')
                  : contentByLang(lang, 'आगे', 'later')}
            </Text>
          )}
          <Text
            style={[
              styles.pill,
              {
                fontFamily: lang === 'en' ? fontFamilies.latinBold : titleFont,
                color: avoid(detail) ? colors.avoidDeep : colors.saffronDeep,
                backgroundColor: avoid(detail) ? colors.avoidChipBg : colors.goldChipBg,
              },
            ]}
          >
            {avoid(detail) ? contentByLang(lang, 'त्याज्य', 'avoid') : contentByLang(lang, 'शुभ', 'auspicious')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 12 },
  row: { flexDirection: 'row', gap: 3, marginTop: 4 },
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
  ends: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  legend: { flexDirection: 'row', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 10, height: 6, borderRadius: 3 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingVertical: 8, paddingHorizontal: 11, borderRadius: 12, borderWidth: 1 },
  pill: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
});

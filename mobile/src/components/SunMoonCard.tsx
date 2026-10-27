import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { formatClock, formatRangeCompact } from '@/panchang/muhuratFormat';
import { formatSpan } from '@/panchang/muhuratSpan';
import type { PanchangData } from '@/panchang/types';
import CelestialGlyph from './CelestialGlyph';
import PanchangPanel from './PanchangPanel';

// Cormorant's default figures are old-style; clock digits read as one height.
const LINING = ['lining-nums', 'tabular-nums'] as const;

/**
 * Sunrise, sunset and moonrise as three columns under a दिनमान eyebrow, then
 * ब्रह्म मुहूर्त as a gold tile in the Muhurat card's tile register (design.md
 * §33). The marks are the sky's: the sun, and the moon in the day's phase on a
 * night disc. Static — no clock reads, so the screen gains no minute tick.
 */
export default function SunMoonCard({ p }: { p: PanchangData }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const labelFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const dayLength = formatSpan(p.sunset.getTime() - p.sunrise.getTime(), lang);

  const Col = ({ mark, label, value, first }: { mark: React.ReactNode; label: string; value: string; first?: boolean }) => (
    <View style={[styles.col, !first && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: colors.divider }]}>
      <View style={styles.mark}>{mark}</View>
      <Text numberOfLines={1} style={{ fontFamily: labelFont, fontSize: 11.5, color: colors.inkMuted, marginTop: 4 }}>{label}</Text>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85} style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 16, color: colors.ink, marginTop: 1, fontVariant: [...LINING] }}>
        {value}
      </Text>
    </View>
  );

  return (
    <PanchangPanel
      testID="panchang-sun-moon-card"
      title={contentByLang(lang, 'सूर्य · चन्द्र', 'Sun · Moon')}
      meta={contentByLang(lang, `दिनमान ${dayLength}`, `Day length ${dayLength}`)}
    >
      <View style={styles.row}>
        <Col first mark={<CelestialGlyph kind="sun" size={11} />} label={contentByLang(lang, 'सूर्योदय', 'Sunrise')} value={formatClock(p.sunrise)} />
        <Col mark={<CelestialGlyph kind="sun" size={11} />} label={contentByLang(lang, 'सूर्यास्त', 'Sunset')} value={formatClock(p.sunset)} />
        <Col
          mark={
            <View style={[styles.moon, { backgroundColor: colors.skyNightTop }]}>
              <CelestialGlyph kind="moon" tithiIndex={p.tithi.index} size={11} />
            </View>
          }
          label={contentByLang(lang, 'चंद्रोदय', 'Moonrise')}
          value={p.moonrise ? formatClock(p.moonrise) : '—'}
        />
      </View>
      <View style={[styles.tile, { backgroundColor: colors.goldTint, borderColor: colors.goldChipBg, borderRadius: radii.md }]}>
        <View style={[styles.dot, { backgroundColor: colors.gold }]} />
        <Text style={{ flex: 1, fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
          {contentByLang(lang, 'ब्रह्म मुहूर्त', 'Brahma Muhurta')}
        </Text>
        <Text style={{ fontFamily: fontFamilies.latinSemiBold, fontSize: 15, color: colors.ink, fontVariant: [...LINING] }}>
          {formatRangeCompact(p.brahmaMuhurta.start, p.brahmaMuhurta.end)}
        </Text>
      </View>
    </PanchangPanel>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginHorizontal: -14, marginTop: 6 },
  col: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2 },
  mark: { height: 20, alignItems: 'center', justifyContent: 'center' },
  moon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tile: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, marginTop: 12, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});

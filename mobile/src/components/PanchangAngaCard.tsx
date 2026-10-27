import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { buildAngaLines } from '@/panchang/panchangShareModel';
import type { ShareAnga } from '@/panchang/panchangShareModel';
import type { PanchangData } from '@/panchang/types';
import CelestialGlyph from './CelestialGlyph';
import PanchangPanel, { PanelGrid } from './PanchangPanel';

// Cormorant's default figures are old-style; clock digits read as one height.
const LINING = ['lining-nums', 'tabular-nums'] as const;

/**
 * The day's four angas in one panel (design.md §33) — the Panchang day panel
 * and the Muhurat detail both show it. Each cell: the type label, the sunrise
 * (udaya) anga, and when it ends with what follows (`7:01 AM तक, फिर द्वितीया`);
 * a kshaya anga adds its own line (`… फिर द्वितीया (क्षय)` · `4:07 AM, 28 अक्टू
 * तक, फिर तृतीया`). The lines are the share card's (`buildAngaLines`), so the
 * screen and the image never disagree. The tithi cell carries the moon in the
 * day's phase, the sky's mark.
 */
export default function PanchangAngaCard({ p }: { p: PanchangData }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const a = buildAngaLines(p, lang);
  const valueFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const lineFont = lang === 'en' ? fontFamilies.latinSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily);

  const Cell = ({ label, anga, mark }: { label: string; anga: ShareAnga; mark?: React.ReactNode }) => (
    <>
      <View style={styles.labelRow}>
        {/* Tracked uppercase Cormorant in English (TITHI · NAKSHATRA — the
            smoke flows read them so); plain script serif otherwise, since
            letterSpacing splits the shirorekha. */}
        <Text
          style={{
            flexShrink: 1,
            fontSize: 12,
            color: colors.saffronDeep,
            fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptTitleFont(lang, typography.cardHindi.fontFamily),
            letterSpacing: lang === 'en' ? 1 : 0,
            textTransform: lang === 'en' ? 'uppercase' : 'none',
          }}
        >
          {label}
        </Text>
        {mark}
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ fontFamily: valueFont, fontSize: 20, color: colors.ink, marginTop: 3 }}>
        {anga.name}
      </Text>
      {anga.lines.map((l, i) => (
        <Text key={i} numberOfLines={2} style={{ fontFamily: lineFont, fontSize: 12.5, lineHeight: 18, color: i === 0 ? colors.inkSoft : colors.inkMuted, marginTop: i === 0 ? 3 : 1, fontVariant: [...LINING] }}>
          {l}
        </Text>
      ))}
    </>
  );

  return (
    <PanchangPanel testID="panchang-anga-card" title={contentByLang(lang, 'पंचांग', 'Panchang')}>
      <PanelGrid>
        <Cell
          label={contentByLang(lang, 'तिथि', 'Tithi')}
          anga={a.tithi}
          mark={
            <View style={[styles.moon, { backgroundColor: colors.skyNightTop }]}>
              <CelestialGlyph kind="moon" tithiIndex={p.tithi.index} size={11} />
            </View>
          }
        />
        <Cell label={contentByLang(lang, 'नक्षत्र', 'Nakshatra')} anga={a.nakshatra} />
        {/* नित्य योग, never bare योग — the 27-cycle Sun+Moon yoga must stay
            distinguishable from the PRD-27 शुभ योग panel (one nitya yoga is
            literally named सिद्धि; RULEBOOK §24 naming rule). */}
        <Cell label={contentByLang(lang, 'नित्य योग', 'Nitya Yoga')} anga={a.yoga} />
        <Cell label={contentByLang(lang, 'करण', 'Karana')} anga={a.karana} />
      </PanelGrid>
    </PanchangPanel>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, minHeight: 20 },
  moon: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});

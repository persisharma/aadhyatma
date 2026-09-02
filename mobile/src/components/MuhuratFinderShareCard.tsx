import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { TIER_LABELS, type DayVerdict, type EventRule } from '@/panchang/eventMuhurat';
import { formatRangeCompact } from '@/panchang/muhuratFormat';
import { VARA_NAMES_HI, VARA_NAMES_EN, PAKSHA_NAMES_HI, PAKSHA_NAMES_EN } from '@/panchang/names';
import { RASHI_NAMES_HI, RASHI_NAMES_EN } from '@/panchang/kundali';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { Lang } from '@/data/gita/language';
import type { PanchangData } from '@/panchang/types';

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HI = ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्तूबर','नवंबर','दिसंबर'];

function monthName(d: Date, lang: Lang): string {
  if (lang === 'en') return MONTHS_EN[d.getMonth()];
  if (lang === 'hi') return MONTHS_HI[d.getMonth()];
  return transliterateDevanagari(MONTHS_HI[d.getMonth()], lang);
}

/**
 * The finder's shareable day card (PRD-16; design.md §60) — captured
 * off-screen to a PNG, same pipeline as MuhuratCardBody's share variant.
 * Carries no personal data by construction: occasion, date, panchang line,
 * tier + convention, windows, brand. Never rendered for excluded days.
 */
export default function MuhuratFinderShareCard({
  rule,
  verdict,
  p,
  cityLabel,
}: {
  rule: EventRule;
  verdict: DayVerdict;
  p: PanchangData;
  cityLabel: string;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const date = new Date(verdict.dateMs);
  const weekday =
    lang === 'en' ? VARA_NAMES_EN[date.getDay()] : lang === 'hi' ? VARA_NAMES_HI[date.getDay()] : transliterateDevanagari(VARA_NAMES_HI[date.getDay()], lang);
  const tier = verdict.tier === 'shreshtha' ? TIER_LABELS.shreshtha : TIER_LABELS.madhyam;
  const best = verdict.windows[0];

  return (
    <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }]}>
      <Text style={[styles.om, { color: colors.gold, fontFamily: typography.thumb.fontFamily }]}>॥</Text>
      <Text style={{ fontFamily: titleFont, fontSize: 19, color: colors.saffronDeep, textAlign: 'center', lineHeight: 30 }}>
        {contentByLang(lang, rule.nameHi, rule.nameEn)}
      </Text>
      <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 26, color: colors.ink, textAlign: 'center', lineHeight: 40, marginTop: 4 }}>
        {date.getDate()} {monthName(date, lang)} {date.getFullYear()}
      </Text>
      <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.inkSoft, textAlign: 'center', lineHeight: 21 }}>
        {weekday} · {contentByLang(lang, p.lunarMonth.nameHi, p.lunarMonth.nameEn)}{' '}
        {contentByLang(lang, PAKSHA_NAMES_HI[p.tithi.paksha], PAKSHA_NAMES_EN[p.tithi.paksha])}{' '}
        {contentByLang(lang, p.tithi.nameHi, p.tithi.nameEn)} · {contentByLang(lang, p.nakshatra.nameHi, p.nakshatra.nameEn)}
      </Text>
      <View style={[styles.tierPill, { backgroundColor: colors.goldChipBg, borderRadius: radii.sm }]}>
        <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.saffronDeep, lineHeight: 19 }}>
          {contentByLang(lang, tier.hi, tier.en)}
          {contentByLang(lang, ' · दृक्पंचांग पद्धति', ' · DrikPanchang convention')}
        </Text>
      </View>

      {best && (
        <View style={[styles.best, { borderTopColor: colors.divider }]}>
          <Text
            style={{
              fontFamily: typography.sectionLabel.fontFamily,
              fontSize: typography.sectionLabel.fontSize,
              letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
              textTransform: 'uppercase',
              color: colors.inkMuted,
              textAlign: 'center',
            }}
          >
            {contentByLang(lang, 'सर्वोत्तम समय', 'Best time')}
          </Text>
          <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 22, color: colors.ink, textAlign: 'center', lineHeight: 33, marginTop: 2 }}>
            {formatRangeCompact(best.start, best.end)}
          </Text>
          <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep, textAlign: 'center', lineHeight: 21 }}>
            {contentByLang(lang, best.nameHi, best.nameEn)}
            {/* Phase 3 (PRD-16/P3 §7): the best window's lagna — general
                panchang data, not personal; this card still carries no
                personal data by construction (Tarabala/Chandrabala NEVER
                render here — pinned by test). */}
            {best.lagnaRashiIndex != null
              ? ` · ${
                  lang === 'en'
                    ? RASHI_NAMES_EN[best.lagnaRashiIndex]
                    : lang === 'hi'
                      ? RASHI_NAMES_HI[best.lagnaRashiIndex]
                      : transliterateDevanagari(RASHI_NAMES_HI[best.lagnaRashiIndex], lang)
                } ${contentByLang(lang, 'लग्न', 'lagna')}`
              : ''}
          </Text>
        </View>
      )}

      {verdict.windows.slice(1, 3).map((w) => (
        <View key={w.start.getTime()} style={[styles.windowRow, { backgroundColor: colors.goldTint, borderRadius: radii.md }]}>
          <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.ink, lineHeight: 20 }}>
            {contentByLang(lang, w.nameHi, w.nameEn)}
          </Text>
          <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 12.5, color: colors.ink, marginLeft: 'auto', lineHeight: 20 }}>
            {formatRangeCompact(w.start, w.end)}
          </Text>
        </View>
      ))}

      <Text style={{ fontFamily: bodyFont, fontSize: 11, color: colors.inkMuted, textAlign: 'center', lineHeight: 17.5, marginTop: 12 }}>
        {contentByLang(lang, 'परम्परागत मार्गदर्शन — पुरोहित से पुष्टि करें।', 'Traditional guidance — confirm with your purohit.')}
      </Text>

      <View style={[styles.brandRow, { borderTopColor: colors.divider }]}>
        <Text style={{ color: colors.saffron, fontFamily: typography.readerTitle.fontFamily, fontSize: 14 }}>ॐ</Text>
        <Text style={{ color: colors.saffronDeep, fontFamily: titleFont, fontSize: 13 }}>वेदांश़</Text>
        <Text style={{ color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily, fontSize: 11 }}>· {cityLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 18 },
  om: { textAlign: 'center', fontSize: 20, lineHeight: 30 },
  tierPill: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4, marginTop: 10 },
  best: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, marginBottom: 8 },
  windowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 6 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderTopWidth: 1, marginTop: 12, paddingTop: 10 },
});

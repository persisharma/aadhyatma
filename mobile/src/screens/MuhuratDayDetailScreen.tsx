import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { computePanchangForDate } from '@/panchang/engine';
import { computeMuhuratDay } from '@/panchang/muhurat';
import {
  DOSHA_LABELS,
  TIER_LABELS,
  computeAstaFlags,
  evaluateDay,
  getEventRule,
  type DayVerdict,
} from '@/panchang/eventMuhurat';
import { formatRangeCompact } from '@/panchang/muhuratFormat';
import { VARA_NAMES_HI, VARA_NAMES_EN, PAKSHA_NAMES_HI, PAKSHA_NAMES_EN } from '@/panchang/names';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { PanchangData } from '@/panchang/types';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MuhuratDayDetail'>;

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HI = ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्तूबर','नवंबर','दिसंबर'];

/**
 * Day detail — Answer → Action → Evidence (design.md §53). One dominant
 * element (the best window); the panchang reasoning renders below the
 * actions, never above them. Provenance is part of the copy: the tier line
 * names the convention, the footer says traditions may differ.
 */
export default function MuhuratDayDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const rule = getEventRule(route.params.occasionId);
  const date = new Date(route.params.dateMs);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  const [data, setData] = useState<{ v: DayVerdict; p: PanchangData } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      const opts = { calendarSystem, location };
      const p = computePanchangForDate(date, opts);
      const next = computePanchangForDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), opts);
      const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, date.getDay());
      const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
      const v = evaluateDay(rule, date.getTime(), date.getDay(), p, m, computeAstaFlags(noon));
      if (!cancelled) setData({ v, p });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params.occasionId, route.params.dateMs, calendarSystem, location]);

  const weekday =
    lang === 'en' ? VARA_NAMES_EN[date.getDay()] : lang === 'hi' ? VARA_NAMES_HI[date.getDay()] : transliterateDevanagari(VARA_NAMES_HI[date.getDay()], lang);
  const monthName = lang === 'en' ? MONTHS_EN[date.getMonth()] : lang === 'hi' ? MONTHS_HI[date.getMonth()] : transliterateDevanagari(MONTHS_HI[date.getMonth()], lang);

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  };

  const KV = ({ k, v, verdict }: { k: string; v?: string; verdict: string }) => (
    <View style={[styles.kv, { borderBottomColor: colors.border }]}>
      <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.inkSoft, flex: 1, lineHeight: 21 }}>{k}</Text>
      {v ? <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.ink, lineHeight: 21 }}>{v}</Text> : null}
      <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.saffronDeep, minWidth: 56, textAlign: 'right', lineHeight: 20 }}>
        {verdict}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.topBar, { paddingHorizontal: spacing.xl }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={pick(lang, { hi: 'वापस', en: 'Back', gu: 'પાછળ', kn: 'ಹಿಂದೆ' })}
          hitSlop={12}
          style={[styles.back, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.xl }]}
        >
          <Text style={{ color: colors.saffron, fontSize: 18, lineHeight: 20 }}>‹</Text>
        </Pressable>
        <Text style={{ fontFamily: titleFont, fontSize: 17, color: colors.ink, flex: 1, lineHeight: 26 }}>
          {contentByLang(lang, rule.nameHi, rule.nameEn)}
        </Text>
      </View>

      {!data ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.saffron} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl }}>
          <LinearGradient
            colors={[colors.cardActiveFrom, colors.cardActiveTo]}
            style={[styles.answer, { borderColor: colors.cardActiveBorder, borderRadius: radii.lg }, elevation.raised]}
          >
            <Text style={{ fontFamily: typography.thumb.fontFamily, fontSize: 18, color: colors.gold, textAlign: 'center', lineHeight: 28 }}>॥</Text>
            <Text testID="muhurat-day-answer" style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 26, color: colors.ink, textAlign: 'center', lineHeight: 40 }}>
              {date.getDate()} {monthName}
            </Text>
            <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.inkSoft, textAlign: 'center', lineHeight: 21 }}>
              {weekday} · {contentByLang(lang, data.p.lunarMonth.nameHi, data.p.lunarMonth.nameEn)}{' '}
              {contentByLang(lang, PAKSHA_NAMES_HI[data.p.tithi.paksha], PAKSHA_NAMES_EN[data.p.tithi.paksha])}{' '}
              {contentByLang(lang, data.p.tithi.nameHi, data.p.tithi.nameEn)} · {contentByLang(lang, data.p.nakshatra.nameHi, data.p.nakshatra.nameEn)}
            </Text>
            {data.v.tier !== 'excluded' ? (
              <>
                <View style={[styles.tierPill, { backgroundColor: colors.goldChipBg, borderRadius: radii.sm }]}>
                  <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.saffronDeep, lineHeight: 19 }}>
                    {contentByLang(lang, TIER_LABELS[data.v.tier].hi, TIER_LABELS[data.v.tier].en)}
                    {contentByLang(lang, ' · दृक्पंचांग पद्धति', ' · DrikPanchang convention')}
                  </Text>
                </View>
                {data.v.windows[0] && (
                  <View style={[styles.best, { borderTopColor: colors.divider }]}>
                    <Text style={[sectionLabelStyle, { marginTop: 0, marginBottom: 2, textAlign: 'center' }]}>
                      {contentByLang(lang, 'सर्वोत्तम समय', 'Best time')}
                    </Text>
                    <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 22, color: colors.ink, textAlign: 'center', lineHeight: 33 }}>
                      {formatRangeCompact(data.v.windows[0].start, data.v.windows[0].end)}
                    </Text>
                    <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep, textAlign: 'center', lineHeight: 21 }}>
                      {contentByLang(lang, data.v.windows[0].nameHi, data.v.windows[0].nameEn)}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={[styles.tierPill, { backgroundColor: colors.avoidChipBg, borderRadius: radii.sm }]}>
                <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.avoidDeep, lineHeight: 19 }}>
                  {contentByLang(lang, 'इस कार्य हेतु उपयुक्त नहीं', 'Not suitable for this occasion')}
                </Text>
              </View>
            )}
          </LinearGradient>

          <Pressable
            testID="muhurat-day-timings-link"
            accessibilityRole="button"
            onPress={() => navigation.navigate('MuhuratDetail', { dateMs: route.params.dateMs })}
            style={[styles.timingsLink, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.pill }, elevation.subtle]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.saffronDeep, lineHeight: 22 }}>
              {contentByLang(lang, 'दिन के सभी शुभ समय', "Day's full timings")} ›
            </Text>
          </Pressable>

          <Text style={sectionLabelStyle}>{contentByLang(lang, 'यह तिथि क्यों?', 'Why this date')}</Text>
          <View style={[styles.evidence, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.md }, elevation.card]}>
            <KV
              k={contentByLang(lang, 'नक्षत्र', 'Nakshatra')}
              v={contentByLang(lang, data.p.nakshatra.nameHi, data.p.nakshatra.nameEn)}
              verdict={data.v.factors.nakshatra ? contentByLang(lang, 'अनुकूल', 'Favourable') : contentByLang(lang, 'सामान्य', 'Neutral')}
            />
            <KV
              k={contentByLang(lang, 'तिथि', 'Tithi')}
              v={contentByLang(lang, data.p.tithi.nameHi, data.p.tithi.nameEn)}
              verdict={data.v.factors.tithi ? contentByLang(lang, 'अनुकूल', 'Favourable') : contentByLang(lang, 'सामान्य', 'Neutral')}
            />
            <KV
              k={contentByLang(lang, 'वार', 'Weekday')}
              v={weekday}
              verdict={data.v.factors.vara ? contentByLang(lang, 'अनुकूल', 'Favourable') : contentByLang(lang, 'सामान्य', 'Neutral')}
            />
          </View>

          <Text style={sectionLabelStyle}>
            {data.v.tier === 'excluded' ? contentByLang(lang, 'दोष', 'Doshas') : contentByLang(lang, 'दोष रहित', 'Clear of doshas')}
          </Text>
          <View style={[styles.evidence, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.md }, elevation.card]}>
            {rule.doshas.map((d) => {
              const hit = data.v.doshas.includes(d);
              return (
                <View key={d} style={[styles.kv, { borderBottomColor: colors.border }]}>
                  <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.inkSoft, flex: 1, lineHeight: 21 }}>
                    {contentByLang(lang, DOSHA_LABELS[d].hi, DOSHA_LABELS[d].en)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: titleFont,
                      fontSize: 12,
                      color: hit ? colors.avoid : colors.saffronDeep,
                      minWidth: 56,
                      textAlign: 'right',
                      lineHeight: 20,
                    }}
                  >
                    {hit ? contentByLang(lang, 'उपस्थित', 'Present') : contentByLang(lang, 'नहीं', 'Clear')}
                  </Text>
                </View>
              );
            })}
          </View>

          {data.v.windows.length > 1 && (
            <>
              <Text style={sectionLabelStyle}>{contentByLang(lang, 'दिन के अन्य शुभ समय', 'Other windows that day')}</Text>
              {data.v.windows.slice(1, 4).map((w) => (
                <View
                  key={w.start.getTime()}
                  style={[styles.windowRow, { backgroundColor: colors.goldTint, borderRadius: radii.md }]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.ink, lineHeight: 21 }}>
                    {contentByLang(lang, w.nameHi, w.nameEn)}
                  </Text>
                  <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 13, color: colors.ink, marginLeft: 'auto', lineHeight: 21 }}>
                    {formatRangeCompact(w.start, w.end)}
                  </Text>
                </View>
              ))}
            </>
          )}

          <Text
            style={{
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 11.5,
              color: colors.inkMuted,
              textAlign: 'center',
              marginTop: spacing.lg,
              lineHeight: 18,
            }}
          >
            {contentByLang(lang, 'परम्पराएँ भिन्न हो सकती हैं। पुरोहित से पुष्टि करें।', 'Traditions may differ — confirm with your purohit.')}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8, paddingBottom: 10 },
  back: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  answer: { borderWidth: 1, padding: 16, marginTop: 6 },
  tierPill: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4, marginTop: 10 },
  best: { borderTopWidth: 1, marginTop: 12, paddingTop: 12 },
  timingsLink: { borderWidth: 1, alignItems: 'center', paddingVertical: 12, marginTop: 12 },
  evidence: { borderWidth: 1, paddingHorizontal: 14 },
  kv: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 38 },
  windowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 6 },
});

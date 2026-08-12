import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import ReaderHeader from '@/components/ReaderHeader';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useMuhuratFinder } from '@/panchang/useMuhuratFinder';
import { DOSHA_LABELS, TIER_LABELS, getEventRule, type DayVerdict, type DoshaKey } from '@/panchang/eventMuhurat';
import { formatRangeCompact, formatShortDate } from '@/panchang/muhuratFormat';
import { VARA_NAMES_HI, VARA_NAMES_EN } from '@/panchang/names';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { Lang } from '@/data/gita/language';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MuhuratResults'>;

function weekdayName(dateMs: number, lang: Lang): string {
  const wd = new Date(dateMs).getDay();
  if (lang === 'en') return VARA_NAMES_EN[wd];
  if (lang === 'hi') return VARA_NAMES_HI[wd];
  return transliterateDevanagari(VARA_NAMES_HI[wd], lang);
}

/**
 * Ranked results — answer-first (design.md §60): the best window is the
 * dominant element on each card; the factor breakdown lives on the day detail
 * behind "यह तिथि क्यों?". Two tiers only, never a score (the Rashifal
 * no-luck-score rule). A zero-result window renders the empty-with-reason
 * card and the first dates after it — the trust surface, not a dead end.
 */
export default function MuhuratResultsScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { location } = usePanchangLocation();
  const rule = getEventRule(route.params.occasionId);
  const { loading, summary, firstAfter } = useMuhuratFinder(rule.id);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  };

  const Card = ({ v, rank }: { v: DayVerdict; rank: number | null }) => {
    const top = rank === 1;
    const best = v.windows[0];
    return (
      <Pressable
        testID={`muhurat-result-${new Date(v.dateMs).getDate()}`}
        accessibilityRole="button"
        onPress={() => navigation.navigate('MuhuratDayDetail', { occasionId: rule.id, dateMs: v.dateMs })}
        style={[
          styles.card,
          { borderColor: top ? colors.cardActiveBorder : colors.border, borderRadius: radii.lg, backgroundColor: top ? 'transparent' : colors.cardSurface },
          top ? elevation.lifted : elevation.card,
        ]}
      >
        {top && (
          <LinearGradient
            colors={[colors.cardActiveFrom, colors.cardActiveTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
          />
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 20, color: colors.ink, lineHeight: 30 }}>
              {formatShortDate(new Date(v.dateMs), lang)}
            </Text>
            <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.inkSoft, lineHeight: 20 }}>
              · {weekdayName(v.dateMs, lang)}
            </Text>
          </View>
          <Text style={{ fontFamily: titleFont, fontSize: 12, color: v.tier === 'shreshtha' ? colors.saffronDeep : colors.inkMuted, lineHeight: 19 }}>
            {contentByLang(lang, TIER_LABELS[v.tier === 'shreshtha' ? 'shreshtha' : 'madhyam'].hi, TIER_LABELS[v.tier === 'shreshtha' ? 'shreshtha' : 'madhyam'].en)}
            {top ? contentByLang(lang, ' · दृक्पंचांग पद्धति', ' · DrikPanchang convention') : ''}
          </Text>
          {best && (
            <Text style={{ marginTop: 6, fontFamily: typography.cardHindi.fontFamily, fontSize: 17, color: colors.ink, lineHeight: 26 }}>
              <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                {contentByLang(lang, best.nameHi, best.nameEn)}{' '}
              </Text>
              {formatRangeCompact(best.start, best.end)}
            </Text>
          )}
        </View>
        <Text style={{ color: colors.saffron, fontSize: 24, lineHeight: 28 }}>›</Text>
      </Pressable>
    );
  };

  const Empty = () => {
    const doshaDays = summary?.doshaDays ?? {};
    const reasons = (Object.keys(doshaDays) as DoshaKey[])
      .filter((k) => rule.doshas.includes(k))
      .sort((a, b) => (doshaDays[b] ?? 0) - (doshaDays[a] ?? 0))
      .slice(0, 2);
    return (
      <View
        testID="muhurat-empty-reason"
        style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.lg }, elevation.card]}
      >
        <Text style={{ fontFamily: typography.thumb.fontFamily, fontSize: 20, color: colors.gold, textAlign: 'center', lineHeight: 30 }}>॥</Text>
        <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink, textAlign: 'center', lineHeight: 24, marginTop: 4 }}>
          {contentByLang(lang, 'अगले 3 महीनों में कोई शुभ मुहूर्त नहीं', 'No auspicious muhurat in the next 3 months')}
        </Text>
        <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 13, color: colors.inkSoft, textAlign: 'center', lineHeight: 21, marginTop: 6 }}>
          {contentByLang(
            lang,
            'यह उत्तर सही है — आँकड़ों की कमी नहीं।',
            'That is the correct answer, not a gap in the data.'
          )}
        </Text>
        {reasons.map((k) => (
          <View key={k} style={[styles.reason, { backgroundColor: colors.goldTint, borderColor: colors.border, borderRadius: radii.md }]}>
            <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.saffronDeep, lineHeight: 19 }}>
              {contentByLang(lang, 'कारण · ', 'Reason · ')}
              {contentByLang(lang, DOSHA_LABELS[k].hi, DOSHA_LABELS[k].en)}
            </Text>
            <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12.5, color: colors.inkSoft, lineHeight: 20 }}>
              {contentByLang(lang, 'इस अवधि के ', 'Applies to ')}
              {doshaDays[k]}
              {contentByLang(lang, ' दिनों पर लागू', ' days of this window')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const hasResults = (summary?.shreshtha.length ?? 0) + (summary?.madhyam.length ?? 0) > 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ReaderHeader
        title={contentByLang(lang, rule.nameHi, rule.nameEn)}
        variant="index"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loading} testID="muhurat-results-loading">
          <ActivityIndicator color={colors.saffron} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
          <Text
            style={{
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 12.5,
              color: colors.inkMuted,
              textAlign: 'center',
            }}
          >
            {contentByLang(lang, location.labelHi, location.labelEn)}
          </Text>
          {hasResults ? (
            <>
              {summary!.shreshtha.length > 0 && (
                <>
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'सर्वोत्तम तिथियाँ', 'Best dates')}</Text>
                  {summary!.shreshtha.slice(0, 5).map((v, i) => (
                    <Card key={v.dateMs} v={v} rank={i + 1} />
                  ))}
                </>
              )}
              {summary!.madhyam.length > 0 && (
                <>
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'अन्य उपयुक्त तिथियाँ', 'More suitable dates')}</Text>
                  {summary!.madhyam.slice(0, 6).map((v) => (
                    <Card key={v.dateMs} v={v} rank={null} />
                  ))}
                </>
              )}
              <Pressable
                testID="muhurat-view-on-calendar"
                accessibilityRole="button"
                accessibilityLabel={contentByLang(lang, 'कैलेंडर में देखें', 'View on calendar')}
                onPress={() =>
                  navigation.navigate('PanchangHome', {
                    muhuratOverlay: {
                      occasionId: rule.id,
                      days: [...summary!.shreshtha, ...summary!.madhyam].map((v) => v.dateMs),
                    },
                  })
                }
                style={[
                  styles.calendarLink,
                  { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.pill },
                  elevation.subtle,
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.saffronDeep, lineHeight: 22 }}>
                  {contentByLang(lang, 'कैलेंडर में देखें', 'View on calendar')} ›
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Empty />
              {firstAfter.length > 0 && (
                <>
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'इसके बाद पहली तिथियाँ', 'First dates after')}</Text>
                  {firstAfter.map((v, i) => (
                    <Card key={v.dateMs} v={v} rank={i + 1} />
                  ))}
                </>
              )}
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
            {contentByLang(lang, 'परम्परागत मार्गदर्शन। पुरोहित से पुष्टि करें।', 'Traditional guidance — confirm with your purohit.')}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, padding: 16, marginBottom: 12, overflow: 'hidden' },
  empty: { borderWidth: 1, padding: 16, marginTop: 12 },
  calendarLink: { borderWidth: 1, alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  reason: { borderWidth: 1, padding: 12, marginTop: 12 },
});

import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import ReaderHeader from '@/components/ReaderHeader';
import ListCard, { CardThumb } from '@/components/ListCard';
import MuhuratFollowControl from '@/components/MuhuratFollowControl';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useMuhuratFinder } from '@/panchang/useMuhuratFinder';
import { DOSHA_LABELS, TIER_LABELS, getEventRule, type DayVerdict, type DoshaKey } from '@/panchang/eventMuhurat';
import { formatRangeCompact, formatShortDate } from '@/panchang/muhuratFormat';
import { VARA_NAMES_HI, VARA_NAMES_EN } from '@/panchang/names';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { Lang } from '@/data/gita/language';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MuhuratResults'>;

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HI = ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्तूबर','नवंबर','दिसंबर'];

function weekdayName(dateMs: number, lang: Lang): string {
  const wd = new Date(dateMs).getDay();
  if (lang === 'en') return VARA_NAMES_EN[wd];
  if (lang === 'hi') return VARA_NAMES_HI[wd];
  return transliterateDevanagari(VARA_NAMES_HI[wd], lang);
}

/**
 * Ranked results — answer-first (design.md §60): the date is the answer, the
 * best window is the emphasised line. Every card is the shared `ListCard` (the
 * library list-card grammar) so the list reads like every other list in the app
 * — no bespoke "hero" first card. Two tiers only, never a score. A zero-result
 * window renders the empty-with-reason card and the first dates after it.
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

  const Card = ({ v }: { v: DayVerdict }) => {
    const d = new Date(v.dateMs);
    const best = v.windows[0];
    const tier = v.tier === 'shreshtha' ? 'shreshtha' : 'madhyam';
    return (
      <ListCard
        testID={`muhurat-result-${d.getDate()}`}
        accessibilityLabel={`${formatShortDate(d, lang)} · ${weekdayName(v.dateMs, lang)}`}
        onPress={() => navigation.navigate('MuhuratDayDetail', { occasionId: rule.id, dateMs: v.dateMs })}
        leading={
          <CardThumb>
            <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 22, color: colors.parchmentSoft }}>
              {d.getDate()}
            </Text>
          </CardThumb>
        }
      >
        <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.ink, lineHeight: 24 }}>
          {contentByLang(lang, MONTHS_HI[d.getMonth()], MONTHS_EN[d.getMonth()])} · {weekdayName(v.dateMs, lang)}
        </Text>
        <Text style={{ fontFamily: titleFont, fontSize: 12, color: tier === 'shreshtha' ? colors.saffronDeep : colors.inkMuted, lineHeight: 19, marginTop: 1 }}>
          {contentByLang(lang, TIER_LABELS[tier].hi, TIER_LABELS[tier].en)}
        </Text>
        {best && (
          <Text style={{ marginTop: 4, fontFamily: typography.cardHindi.fontFamily, fontSize: 16, color: colors.ink, lineHeight: 25 }}>
            <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
              {contentByLang(lang, best.nameHi, best.nameEn)}{' '}
            </Text>
            {formatRangeCompact(best.start, best.end)}
          </Text>
        )}
      </ListCard>
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
            {contentByLang(lang, ' · दृक्पंचांग पद्धति', ' · DrikPanchang convention')}
          </Text>
          {hasResults ? (
            <>
              {summary!.shreshtha.length > 0 && (
                <>
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'सर्वोत्तम तिथियाँ', 'Best dates')}</Text>
                  {summary!.shreshtha.slice(0, 5).map((v) => (
                    <Card key={v.dateMs} v={v} />
                  ))}
                </>
              )}
              {summary!.madhyam.length > 0 && (
                <>
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'अन्य उपयुक्त तिथियाँ', 'More suitable dates')}</Text>
                  {summary!.madhyam.slice(0, 6).map((v) => (
                    <Card key={v.dateMs} v={v} />
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
              {/* Empty-with-reason must END IN AN ACTION (PRD-16 §8 measures
                  exactly this). The follow targets the first day that actually
                  qualifies — a real graded muhurat with a window — rather than
                  the season boundary, which would notify the user days early
                  with nothing they could act on. */}
              {firstAfter.length > 0 && (
                <>
                  <MuhuratFollowControl
                    occasionId={rule.id}
                    occasionNameHi={rule.nameHi}
                    occasionNameEn={rule.nameEn}
                    date={new Date(firstAfter[0].dateMs)}
                    tier={firstAfter[0].tier}
                    bestWindow={firstAfter[0].windows[0] ?? null}
                  />
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'इसके बाद पहली तिथियाँ', 'First dates after')}</Text>
                  {firstAfter.map((v) => (
                    <Card key={v.dateMs} v={v} />
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
  empty: { borderWidth: 1, padding: 16, marginTop: 12 },
  calendarLink: { borderWidth: 1, alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  reason: { borderWidth: 1, padding: 12, marginTop: 12 },
});

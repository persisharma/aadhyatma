import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang, pick, type LocalizedStrings } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import { useBookmarks } from '@/contexts/BookmarksContext';
import {
  toDateKey,
  toMonthKey,
  useUserActivity,
  type ActivityTotals,
} from '@/contexts/UserActivityContext';
import { library } from '@/data/texts';
import { japamMantras } from '@/data/japam';
import type { MoreStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Profile'>;

type RangeMode = 'lifetime' | 'monthly' | 'daily';

const HI_MONTHS = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितम्बर',
  'अक्टूबर',
  'नवम्बर',
  'दिसम्बर',
];

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const HI_WEEKDAYS = ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'];
const EN_WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function sourceLabel(sourceId: string, lang: Lang): string {
  const fromLibrary = library.find((e) => e.id === sourceId);
  if (fromLibrary) return contentByLang(lang, fromLibrary.nameHi, fromLibrary.nameEn);
  return sourceId;
}

function mantraLabel(mantraId: string, lang: Lang): string {
  const m = japamMantras.find((j) => j.id === mantraId);
  if (m) return contentByLang(lang, m.nameHi, m.nameEn);
  return mantraId;
}

export default function ProfileScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { bookmarks } = useBookmarks();
  const {
    lifetimeTotals,
    monthTotals,
    dayTotals,
    totalsBetween,
    activeDateKeys,
    currentStreak,
  } = useUserActivity();

  const [mode, setMode] = useState<RangeMode>('lifetime');
  const today = useMemo(() => new Date(), []);

  const totals: ActivityTotals = useMemo(() => {
    if (mode === 'lifetime') return lifetimeTotals();
    if (mode === 'monthly') return monthTotals(toMonthKey(today));
    return dayTotals(toDateKey(today));
  }, [mode, today, lifetimeTotals, monthTotals, dayTotals]);

  const sevenDayTrend = useMemo(() => {
    const out: { key: string; value: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const t = dayTotals(key);
      const sum = t.totalReads + t.totalBeads + t.totalRounds * 108;
      out.push({
        key,
        value: sum,
        label: contentByLang(lang, HI_WEEKDAYS[d.getDay()], EN_WEEKDAYS[d.getDay()]),
      });
    }
    return out;
  }, [today, lang, dayTotals]);

  const rangeLabel =
    mode === 'lifetime'
      ? pick(lang, { hi: 'सर्वकालिक', en: 'Lifetime', gu: 'સર્વકાલિક', kn: 'ಸಾರ್ವಕಾಲಿಕ' })
      : mode === 'monthly'
        ? `${contentByLang(lang, HI_MONTHS[today.getMonth()], EN_MONTHS[today.getMonth()])} ${today.getFullYear()}`
        : pick(lang, { hi: 'आज', en: 'Today', gu: 'આજ', kn: 'ಇಂದು' });

  const streak = currentStreak();
  const lifetimeDayCount = activeDateKeys().length;

  const trendMax = Math.max(1, ...sevenDayTrend.map((d) => d.value));

  const sevenDayWindow = useMemo(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return totalsBetween(toDateKey(start), toDateKey(today));
  }, [today, totalsBetween]);

  const perSourceList = Object.entries(totals.perSource)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  const perMantraList = Object.entries(totals.perMantra)
    .filter(([, jr]) => jr.beads > 0 || jr.rounds > 0)
    .sort((a, b) => b[1].rounds * 108 + b[1].beads - (a[1].rounds * 108 + a[1].beads));

  const isEmpty =
    totals.totalReads === 0 && totals.totalBeads === 0 && totals.totalRounds === 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={16}
            style={[
              styles.backBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 16,
                color: colors.ink,
              }}
            >
              {pick(lang, { hi: 'साधक प्रोफ़ाइल', en: 'Sadhak Profile', gu: 'સાધક પ્રોફાઇલ', kn: 'ಸಾಧಕ ಪ್ರೊಫೈಲ್' })}
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Identity card */}
          <View
            style={[
              styles.identityCard,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.lg,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.cardActiveFrom, colors.cardActiveTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
            />
            <View style={[styles.crest, { backgroundColor: colors.saffron }]}>
              <Text
                style={{
                  fontFamily: typography.readerTitle.fontFamily,
                  fontSize: 26,
                  color: colors.onPrimary,
                }}
              >
                ॐ
              </Text>
            </View>
            <Text
              style={{
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 22,
                color: colors.ink,
                marginTop: 12,
              }}
            >
              साधक
            </Text>
            <Text
              style={{
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: 13,
                color: colors.inkMuted,
                marginTop: 2,
              }}
            >
              Sadhak
            </Text>
            <View
              style={[styles.identityDivider, { backgroundColor: colors.divider }]}
            />
            <View style={styles.identityFooter}>
              <View style={styles.identityFooterCell}>
                <Text
                  style={[
                    styles.identityFooterValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {streak}
                </Text>
                <Text style={[styles.identityFooterLabel, { color: colors.inkMuted }]}>
                  {pick(lang, { hi: 'दिवस श्रृंखला', en: 'DAY STREAK', gu: 'દિવસ શ્રેણી', kn: 'ದಿನ ಸರಣಿ' })}
                </Text>
              </View>
              <View
                style={[styles.identityFooterRule, { backgroundColor: colors.divider }]}
              />
              <View style={styles.identityFooterCell}>
                <Text
                  style={[
                    styles.identityFooterValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {lifetimeDayCount}
                </Text>
                <Text style={[styles.identityFooterLabel, { color: colors.inkMuted }]}>
                  {pick(lang, { hi: 'सक्रिय दिन', en: 'ACTIVE DAYS', gu: 'સક્રિય દિવસો', kn: 'ಸಕ್ರಿಯ ದಿನಗಳು' })}
                </Text>
              </View>
              <View
                style={[styles.identityFooterRule, { backgroundColor: colors.divider }]}
              />
              <View style={styles.identityFooterCell}>
                <Text
                  style={[
                    styles.identityFooterValue,
                    {
                      color: colors.saffronDeep,
                      fontFamily: typography.readerTitle.fontFamily,
                    },
                  ]}
                >
                  {bookmarks.length}
                </Text>
                <Text style={[styles.identityFooterLabel, { color: colors.inkMuted }]}>
                  {pick(lang, { hi: 'सहेजे श्लोक', en: 'SAVED VERSES', gu: 'સાચવેલા શ્લોક', kn: 'ಉಳಿಸಿದ ಶ್ಲೋಕಗಳು' })}
                </Text>
              </View>
            </View>
          </View>

          {/* Range tabs */}
          <View
            style={[
              styles.tabBar,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.pill,
              },
            ]}
          >
            {(['lifetime', 'monthly', 'daily'] as RangeMode[]).map((m) => {
              const active = mode === m;
              const tabLabel =
                m === 'lifetime'
                  ? pick(lang, { hi: 'सर्वकालिक', en: 'Lifetime', gu: 'સર્વકાલિક', kn: 'ಸಾರ್ವಕಾಲಿಕ' })
                  : m === 'monthly'
                    ? pick(lang, { hi: 'मासिक', en: 'Monthly', gu: 'માસિક', kn: 'ಮಾಸಿಕ' })
                    : pick(lang, { hi: 'दैनिक', en: 'Daily', gu: 'દૈનિક', kn: 'ದೈನಿಕ' });
              return (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.tabItem,
                    active && { backgroundColor: colors.saffron },
                    { borderRadius: radii.pill },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: typography.readerTitle.fontFamily,
                      fontSize: 13,
                      color: active ? colors.onPrimary : colors.ink,
                    }}
                  >
                    {tabLabel}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text
            style={[
              styles.rangeCaption,
              {
                color: colors.inkMuted,
                fontFamily: typography.cardLatin.fontFamily,
              },
            ]}
          >
            {rangeLabel}
          </Text>

          {/* Stat tiles */}
          <View style={styles.statGrid}>
            <StatTile
              valueLabel={String(totals.totalReads)}
              label={{ hi: 'श्लोक पढ़े', en: 'Verses Read', gu: 'વાંચેલા શ્લોક', kn: 'ಓದಿದ ಶ್ಲೋಕಗಳು' }}
              colors={colors}
              typography={typography}
              radii={radii}
              lang={lang}
            />
            <StatTile
              valueLabel={String(totals.totalBeads)}
              label={{ hi: 'बीज जपे', en: 'Beads Chanted', gu: 'જપેલા મણકા', kn: 'ಜಪಿಸಿದ ಮಣಿಗಳು' }}
              colors={colors}
              typography={typography}
              radii={radii}
              lang={lang}
            />
            <StatTile
              valueLabel={String(totals.totalRounds)}
              label={{ hi: 'आवृत्तियाँ', en: 'Rounds (Mala)', gu: 'આવૃત્તિ (માળા)', kn: 'ಆವೃತ್ತಿ (ಮಾಲಾ)' }}
              colors={colors}
              typography={typography}
              radii={radii}
              lang={lang}
            />
            <StatTile
              valueLabel={String(totals.activeDays)}
              label={{ hi: 'दिन', en: 'Days Active', gu: 'દિવસો', kn: 'ಸಕ್ರಿಯ ದಿನಗಳು' }}
              colors={colors}
              typography={typography}
              radii={radii}
              lang={lang}
            />
          </View>

          {/* 7-day mini trend */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
                borderRadius: radii.md,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text
                style={{
                  fontFamily: typography.readerTitle.fontFamily,
                  fontSize: 15,
                  color: colors.ink,
                }}
              >
                {pick(lang, { hi: 'पिछले ७ दिन', en: 'Last 7 Days', gu: 'છેલ્લા ૭ દિવસ', kn: 'ಕಳೆದ ೭ ದಿನ' })}
              </Text>
              <Text
                style={{
                  fontFamily: typography.cardLatin.fontFamily,
                  fontSize: 12,
                  color: colors.inkMuted,
                }}
              >
                {sevenDayWindow.totalReads + sevenDayWindow.totalBeads}{' '}
                {pick(lang, { hi: 'क्रियाएँ', en: 'actions', gu: 'ક્રિયાઓ', kn: 'ಕ್ರಿಯೆಗಳು' })}
              </Text>
            </View>
            <View style={styles.chartRow}>
              {sevenDayTrend.map((d) => {
                const h = Math.max(4, (d.value / trendMax) * 64);
                const isToday = d.key === toDateKey(today);
                return (
                  <View key={d.key} style={styles.chartCol}>
                    <View style={styles.chartBarTrack}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: h,
                            backgroundColor: isToday ? colors.saffron : colors.gold,
                            opacity: d.value === 0 ? 0.25 : 1,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.chartLabel,
                        {
                          color: isToday ? colors.saffronDeep : colors.inkMuted,
                          fontFamily: typography.cardLatin.fontFamily,
                        },
                      ]}
                    >
                      {d.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Empty state */}
          {isEmpty ? (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.md,
                  alignItems: 'center',
                  paddingVertical: 28,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: typography.readerTitle.fontFamily,
                  fontSize: 22,
                  color: colors.inkMuted,
                  opacity: 0.5,
                }}
              >
                ॥
              </Text>
              <Text
                style={{
                  fontFamily: typography.meaning.fontFamily,
                  fontSize: 14,
                  color: colors.inkMuted,
                  textAlign: 'center',
                  marginTop: 10,
                }}
              >
                {pick(lang, {
                  hi: 'इस अवधि में अभी कोई गतिविधि नहीं',
                  en: 'No activity recorded for this period',
                  gu: 'આ સમયગાળામાં હજી કોઈ પ્રવૃત્તિ નથી',
                  kn: 'ಈ ಅವಧಿಯಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಚಟುವಟಿಕೆ ಇಲ್ಲ',
                })}
              </Text>
              <Text
                style={{
                  fontFamily: typography.cardLatin.fontFamily,
                  fontSize: 12,
                  color: colors.inkMuted,
                  textAlign: 'center',
                  marginTop: 4,
                  opacity: 0.7,
                }}
              >
                {pick(lang, {
                  hi: 'पढ़ना या जप आरम्भ करें — आपकी साधना यहाँ अंकित होगी',
                  en: 'Begin reading or chanting — your practice will appear here',
                  gu: 'વાંચન કે જપ શરૂ કરો — તમારી સાધના અહીં દેખાશે',
                  kn: 'ಓದು ಅಥವಾ ಜಪ ಆರಂಭಿಸಿ — ನಿಮ್ಮ ಸಾಧನೆ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ',
                })}
              </Text>
            </View>
          ) : null}

          {/* Per-source reads */}
          {perSourceList.length > 0 ? (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {pick(lang, { hi: 'पाठ-अनुसार', en: 'By Text', gu: 'પાઠ અનુસાર', kn: 'ಪಠ್ಯದ ಪ್ರಕಾರ' })}
              </Text>
              {perSourceList.map(([src, count], i) => (
                <View
                  key={src}
                  style={[
                    styles.row,
                    i < perSourceList.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: titleFontByLang(lang),
                      fontSize: 14,
                      color: colors.ink,
                      fontStyle: lang === 'en' ? 'italic' : 'normal',
                    }}
                    numberOfLines={1}
                  >
                    {sourceLabel(src, lang)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: typography.readerTitle.fontFamily,
                      fontSize: 15,
                      color: colors.saffronDeep,
                      marginLeft: 8,
                    }}
                  >
                    {count}
                  </Text>
                  <Text
                    style={{
                      fontFamily: typography.cardLatin.fontFamily,
                      fontSize: 11,
                      color: colors.inkMuted,
                      marginLeft: 6,
                    }}
                  >
                    {pick(lang, { hi: 'श्लोक', en: 'verses', gu: 'શ્લોક', kn: 'ಶ್ಲೋಕ' })}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Per-mantra japa */}
          {perMantraList.length > 0 ? (
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                  borderRadius: radii.md,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {pick(lang, { hi: 'जप-अनुसार', en: 'By Japa', gu: 'જપ અનુસાર', kn: 'ಜಪದ ಪ್ರಕಾರ' })}
              </Text>
              {perMantraList.map(([mid, jr], i) => (
                <View
                  key={mid}
                  style={[
                    styles.row,
                    i < perMantraList.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.divider,
                    },
                  ]}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: titleFontByLang(lang),
                      fontSize: 14,
                      color: colors.ink,
                      fontStyle: lang === 'en' ? 'italic' : 'normal',
                    }}
                    numberOfLines={1}
                  >
                    {mantraLabel(mid, lang)}
                  </Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        fontFamily: typography.readerTitle.fontFamily,
                        fontSize: 15,
                        color: colors.saffronDeep,
                      }}
                    >
                      {jr.rounds}{' '}
                      <Text
                        style={{
                          fontFamily: typography.cardLatin.fontFamily,
                          fontSize: 11,
                          color: colors.inkMuted,
                        }}
                      >
                        {pick(lang, { hi: 'आवृत्ति', en: 'rounds', gu: 'આવૃત્તિ', kn: 'ಆವೃತ್ತಿ' })}
                      </Text>
                    </Text>
                    <Text
                      style={{
                        fontFamily: typography.cardLatin.fontFamily,
                        fontSize: 11,
                        color: colors.inkMuted,
                        marginTop: 2,
                      }}
                    >
                      {jr.rounds * 108 + jr.beads}{' '}
                      {pick(lang, { hi: 'बीज', en: 'beads', gu: 'મણકા', kn: 'ಮಣಿ' })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatTile({
  valueLabel,
  label,
  colors,
  typography,
  radii,
  lang,
}: {
  valueLabel: string;
  label: LocalizedStrings;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  radii: ReturnType<typeof useTheme>['radii'];
  lang: Lang;
}) {
  return (
    <View
      style={[
        styles.statTile,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.md,
        },
      ]}
    >
      <Text
        style={[
          styles.statValue,
          { color: colors.saffronDeep, fontFamily: typography.readerTitle.fontFamily },
        ]}
      >
        {valueLabel}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {
            color: colors.inkMuted,
            fontFamily: typography.cardLatin.fontFamily,
          },
        ]}
      >
        {pick(lang, label)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingTop: 8, paddingBottom: 48, gap: 14 },
  identityCard: {
    borderWidth: 1,
    paddingTop: 22,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  crest: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityDivider: {
    height: 1,
    width: '100%',
    opacity: 0.6,
    marginTop: 16,
    marginBottom: 14,
  },
  identityFooter: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  identityFooterCell: {
    flex: 1,
    alignItems: 'center',
  },
  identityFooterRule: {
    width: 1,
    opacity: 0.4,
    marginVertical: 2,
  },
  identityFooterValue: {
    fontSize: 22,
    includeFontPadding: false,
  },
  identityFooterLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  rangeCaption: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: -6,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 28,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  section: {
    borderWidth: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 84,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBarTrack: {
    height: 64,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

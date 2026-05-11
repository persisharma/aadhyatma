import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
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

function sourceLabel(sourceId: string, lang: 'hi' | 'en'): string {
  const fromLibrary = library.find((e) => e.id === sourceId);
  if (fromLibrary) return lang === 'hi' ? fromLibrary.nameHi : fromLibrary.nameEn;
  return sourceId;
}

function mantraLabel(mantraId: string, lang: 'hi' | 'en'): string {
  const m = japamMantras.find((j) => j.id === mantraId);
  if (m) return lang === 'hi' ? m.nameHi : m.nameEn;
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
        label: (lang === 'hi' ? HI_WEEKDAYS : EN_WEEKDAYS)[d.getDay()],
      });
    }
    return out;
  }, [today, lang, dayTotals]);

  const rangeLabelHi =
    mode === 'lifetime'
      ? 'सर्वकालिक'
      : mode === 'monthly'
        ? `${HI_MONTHS[today.getMonth()]} ${today.getFullYear()}`
        : 'आज';
  const rangeLabelEn =
    mode === 'lifetime'
      ? 'Lifetime'
      : mode === 'monthly'
        ? `${EN_MONTHS[today.getMonth()]} ${today.getFullYear()}`
        : 'Today';

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
              {lang === 'hi' ? 'साधक प्रोफ़ाइल' : 'Sadhak Profile'}
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
                  {lang === 'hi' ? 'दिवस श्रृंखला' : 'DAY STREAK'}
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
                  {lang === 'hi' ? 'सक्रिय दिन' : 'ACTIVE DAYS'}
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
                  {lang === 'hi' ? 'सहेजे श्लोक' : 'SAVED VERSES'}
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
              const labelHi = m === 'lifetime' ? 'सर्वकालिक' : m === 'monthly' ? 'मासिक' : 'दैनिक';
              const labelEn = m === 'lifetime' ? 'Lifetime' : m === 'monthly' ? 'Monthly' : 'Daily';
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
                    {lang === 'hi' ? labelHi : labelEn}
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
            {lang === 'hi' ? rangeLabelHi : rangeLabelEn}
          </Text>

          {/* Stat tiles */}
          <View style={styles.statGrid}>
            <StatTile
              valueLabel={String(totals.totalReads)}
              hi="श्लोक पढ़े"
              en="Verses Read"
              colors={colors}
              typography={typography}
              radii={radii}
              lang={lang}
            />
            <StatTile
              valueLabel={String(totals.totalBeads)}
              hi="बीज जपे"
              en="Beads Chanted"
              colors={colors}
              typography={typography}
              radii={radii}
              lang={lang}
            />
            <StatTile
              valueLabel={String(totals.totalRounds)}
              hi="आवृत्तियाँ"
              en="Rounds (Mala)"
              colors={colors}
              typography={typography}
              radii={radii}
              lang={lang}
            />
            <StatTile
              valueLabel={String(totals.activeDays)}
              hi="दिन"
              en="Days Active"
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
                {lang === 'hi' ? 'पिछले ७ दिन' : 'Last 7 Days'}
              </Text>
              <Text
                style={{
                  fontFamily: typography.cardLatin.fontFamily,
                  fontSize: 12,
                  color: colors.inkMuted,
                }}
              >
                {sevenDayWindow.totalReads + sevenDayWindow.totalBeads}{' '}
                {lang === 'hi' ? 'क्रियाएँ' : 'actions'}
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
                {lang === 'hi'
                  ? 'इस अवधि में अभी कोई गतिविधि नहीं'
                  : 'No activity recorded for this period'}
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
                {lang === 'hi'
                  ? 'पढ़ना या जप आरम्भ करें — आपकी साधना यहाँ अंकित होगी'
                  : 'Begin reading or chanting — your practice will appear here'}
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
                {lang === 'hi' ? 'पाठ-अनुसार' : 'By Text'}
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
                      fontFamily:
                        lang === 'hi'
                          ? typography.readerTitle.fontFamily
                          : typography.cardLatin.fontFamily,
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
                    {lang === 'hi' ? 'श्लोक' : 'verses'}
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
                {lang === 'hi' ? 'जप-अनुसार' : 'By Japa'}
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
                      fontFamily:
                        lang === 'hi'
                          ? typography.readerTitle.fontFamily
                          : typography.cardLatin.fontFamily,
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
                        {lang === 'hi' ? 'आवृत्ति' : 'rounds'}
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
                      {lang === 'hi' ? 'बीज' : 'beads'}
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
  hi,
  en,
  colors,
  typography,
  radii,
  lang,
}: {
  valueLabel: string;
  hi: string;
  en: string;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  radii: ReturnType<typeof useTheme>['radii'];
  lang: 'hi' | 'en';
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
        {lang === 'hi' ? hi : en}
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

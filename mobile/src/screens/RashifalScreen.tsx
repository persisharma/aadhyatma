import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGitaLanguage } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import {
  computeRashifal,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
} from '@/panchang/kundali';
import { useKundali } from '@/panchang/useKundali';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'Rashifal'>;

export default function RashifalScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { chart, hydrated } = useKundali();
  const natalMoon = chart?.grahas.find((position) => position.graha === 'moon')?.rashiIndex;
  const initial = route.params?.rashiIndex ?? natalMoon ?? 0;
  const [rashiIndex, setRashiIndex] = useState(initial);

  useEffect(() => {
    if (route.params?.rashiIndex === undefined && natalMoon !== undefined) {
      setRashiIndex(natalMoon);
    }
  }, [natalMoon, route.params?.rashiIndex]);

  const today = useMemo(() => new Date(), []);
  const guidance = useMemo(() => computeRashifal(today, rashiIndex), [today, rashiIndex]);
  const source = library.find((entry) => entry.id === guidance.sourceId);

  const openPractice = () => {
    const target = source ? buildEntryStartTarget(source) : null;
    if (target) rootNav.navigate('HomeTab', target);
  };

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
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [
              styles.backButton,
              { borderColor: colors.divider, backgroundColor: colors.parchmentSoft },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              accessibilityLabel="Daily Rashifal"
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 18,
              }}
            >
              {contentByLang(lang, 'आज का राशिफल', 'Daily Rashifal')}
            </Text>
            <Text style={[styles.caption, { color: colors.inkMuted }]}>
              {guidance.dateKey} · {contentByLang(lang, 'चन्द्र राशि', 'Moon sign')}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.disclaimer,
              { backgroundColor: colors.goldTint, borderColor: colors.divider, borderRadius: radii.md },
            ]}
          >
            <Text
              style={{
                color: colors.inkSoft,
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 12,
                lineHeight: 18,
              }}
            >
              {meaningByLang(
                lang,
                'पारम्परिक गोचर-आधारित मार्गदर्शन—निश्चित भविष्यवाणी नहीं। इसे चिंतन और साधना के संकेत की तरह पढ़ें।',
                'Traditional transit-based guidance—not a certain prediction. Read it as a prompt for reflection and practice.'
              )}
            </Text>
          </View>

          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 15,
              marginTop: 16,
            }}
          >
            {contentByLang(lang, 'अपनी चन्द्र राशि चुनें', 'Choose your Moon sign')}
          </Text>
          {!chart && hydrated && (
            <Text
              style={{
                color: colors.inkMuted,
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 11,
                marginTop: 4,
              }}
            >
              {meaningByLang(
                lang,
                'कुंडली बनाने पर आपकी चन्द्र राशि यहाँ अपने-आप चुनी जाएगी।',
                'Create a Kundali and your Moon sign will be selected automatically.'
              )}
            </Text>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rashiRail}
          >
            {RASHI_NAMES_EN.map((name, index) => {
              const selected = index === rashiIndex;
              return (
                <Pressable
                  key={name}
                  onPress={() => setRashiIndex(index)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${name} Moon sign`}
                  style={({ pressed }) => [
                    styles.rashiChip,
                    {
                      borderColor: selected ? colors.saffron : colors.divider,
                      backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft,
                      borderRadius: radii.pill,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.rashiHi, { color: selected ? colors.saffronDeep : colors.ink }]}>
                    {contentByLang(lang, RASHI_NAMES_HI[index], name)}
                  </Text>
                  <Text style={[styles.caption, { color: colors.inkMuted }]}>{name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View
            style={[
              styles.hero,
              { borderColor: colors.cardActiveBorder, borderRadius: radii.lg },
              elevation.card,
            ]}
          >
            <Text style={[styles.eyebrow, { color: colors.saffronDeep }]}>
              {contentByLang(lang, 'आज की दृष्टि', "TODAY'S LENS")}
            </Text>
            <Text
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 24,
                marginTop: 5,
              }}
            >
              {contentByLang(lang, RASHI_NAMES_HI[rashiIndex], RASHI_NAMES_EN[rashiIndex])}
            </Text>
          </View>

          <GuidanceCard
            marker="↑"
            hi="जिसे स्थान दें"
            en="Favour"
            bodyHi={guidance.favourHi}
            bodyEn={guidance.favourEn}
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
          />
          <GuidanceCard
            marker="—"
            hi="जहाँ ठहरें"
            en="Pause"
            bodyHi={guidance.pauseHi}
            bodyEn={guidance.pauseEn}
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
          />
          <GuidanceCard
            marker="?"
            hi="चिंतन प्रश्न"
            en="Reflection"
            bodyHi={guidance.reflectionHi}
            bodyEn={guidance.reflectionEn}
            lang={lang}
            colors={colors}
            typography={typography}
            radii={radii}
          />

          <Pressable
            onPress={openPractice}
            accessibilityRole="button"
            accessibilityLabel={`Open ${source?.nameEn ?? 'traditional'} practice`}
            style={({ pressed }) => [
              styles.practice,
              { backgroundColor: colors.saffronDeep, borderRadius: radii.lg },
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.practiceOm, { color: colors.onPrimary }]}>ॐ</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eyebrow, { color: colors.parchmentDeep }]}>
                {contentByLang(lang, 'आज की साधना', "TODAY'S PRACTICE")}
              </Text>
              <Text
                style={{
                  color: colors.onPrimary,
                  fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                  fontSize: 17,
                  marginTop: 4,
                }}
              >
                {source ? contentByLang(lang, source.nameHi, source.nameEn) : guidance.practiceEn}
              </Text>
            </View>
            <Text style={{ color: colors.onPrimary, fontSize: 20 }}>›</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function GuidanceCard({
  marker,
  hi,
  en,
  bodyHi,
  bodyEn,
  lang,
  colors,
  typography,
  radii,
}: {
  marker: string;
  hi: string;
  en: string;
  bodyHi: string;
  bodyEn: string;
  lang: ReturnType<typeof useGitaLanguage>['lang'];
  colors: any;
  typography: any;
  radii: any;
}) {
  return (
    <View
      style={[
        styles.guidanceCard,
        { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.lg },
      ]}
    >
      <View style={[styles.marker, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
        <Text style={{ color: colors.saffronDeep, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>{marker}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.eyebrow, { color: colors.saffronDeep }]}>
          {contentByLang(lang, hi, en).toUpperCase()}
        </Text>
        <Text
          style={{
            color: colors.ink,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 13,
            lineHeight: 20,
            marginTop: 5,
          }}
        >
          {meaningByLang(lang, bodyHi, bodyEn)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  caption: { fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: 14 },
  disclaimer: { borderWidth: 1, padding: 12, marginTop: 6 },
  rashiRail: { gap: 8, paddingVertical: 12 },
  rashiChip: { minWidth: 78, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8, alignItems: 'center' },
  rashiHi: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  hero: { backgroundColor: '#FFF5E0', borderWidth: 1, padding: 18, marginBottom: 12 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.3 },
  guidanceCard: { borderWidth: 1, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12 },
  marker: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  practice: { minHeight: 78, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  practiceOm: { fontFamily: 'NotoSansDevanagari_600SemiBold', fontSize: 24 },
});

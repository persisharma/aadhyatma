import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import JyotishGuidanceRows from '@/components/JyotishGuidanceRows';
import JyotishPracticeCard from '@/components/JyotishPracticeCard';
import JyotishShareCard from '@/components/JyotishShareCard';
import JyotishShareSheet from '@/components/JyotishShareSheet';
import JyotishStateCard from '@/components/JyotishStateCard';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import { computePersonalGuidance, type PersonalGuidance } from '@/panchang/gochar';
import {
  computeRashifal,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  type RashifalGuidance,
} from '@/panchang/kundali';
import { useKundali } from '@/panchang/useKundali';
import { radii } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import {
  pillTextStyle,
  scriptBodyFont,
  scriptTitleFont,
} from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'Rashifal'>;

const DATE_LOCALES: Record<Lang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
};

function formatToday(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[lang], {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function signPair(lang: Lang, index: number): { primary: string; secondary: string } {
  return {
    primary: contentByLang(lang, RASHI_NAMES_HI[index], RASHI_NAMES_EN[index]),
    secondary: lang === 'en' ? RASHI_NAMES_WESTERN[index] : RASHI_NAMES_EN[index],
  };
}

export default function RashifalScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { chart, loadState } = useKundali();
  const natalMoon = chart?.grahas.find((position) => position.graha === 'moon')?.rashiIndex;
  const routeSelection = route.params?.rashiIndex;
  const [rashiIndex, setRashiIndex] = useState<number | null>(routeSelection ?? null);
  const [signPickerOpen, setSignPickerOpen] = useState(routeSelection === undefined);
  const [userSelected, setUserSelected] = useState(routeSelection !== undefined);
  const [shareVisible, setShareVisible] = useState(false);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!userSelected && routeSelection === undefined && natalMoon !== undefined) {
      setRashiIndex(natalMoon);
      setSignPickerOpen(false);
    }
  }, [natalMoon, routeSelection, userSelected]);

  const isNatalSelection =
    loadState === 'saved' && rashiIndex !== null && rashiIndex === natalMoon;
  // The base favour/pause/reflect fields are identical either way (superset
  // lock in gochar.engine.test.ts); the natal path only layers personal
  // context, so a manually chosen sign never reads birth-derived extras.
  const guidance = useMemo<RashifalGuidance | PersonalGuidance | null>(() => {
    if (rashiIndex === null) return null;
    if (isNatalSelection && chart) return computePersonalGuidance(chart, today);
    return computeRashifal(today, rashiIndex);
  }, [chart, isNatalSelection, rashiIndex, today]);
  const personal = guidance && 'taraBala' in guidance ? guidance : null;
  const source = guidance
    ? library.find((entry) => entry.id === guidance.sourceId)
    : undefined;
  const selectedSign = rashiIndex === null ? null : signPair(lang, rashiIndex);

  const openPractice = () => {
    const target = source ? buildEntryStartTarget(source) : null;
    if (target) rootNav.navigate('HomeTab', target);
  };

  const chooseSign = (index: number) => {
    setUserSelected(true);
    setRashiIndex(index);
    setSignPickerOpen(false);
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
          <View style={styles.headerCopy}>
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
              {formatToday(today, lang)} · {contentByLang(lang, 'चन्द्र राशि', 'Moon sign')}
            </Text>
          </View>
          {guidance ? (
            <Pressable
              onPress={() => setShareVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Share today’s Rashifal"
              style={({ pressed }) => [
                styles.sharePill,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.pill,
                },
                pressed && { opacity: 0.65 },
              ]}
            >
              <Text style={[styles.shareText, { color: colors.saffronDeep }]}>
                ↗ {contentByLang(lang, 'साझा करें', 'Share')}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.xxl,
            paddingBottom: spacing.xxl * 2,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.reflectionNote}>
            <View
              style={[
                styles.infoMark,
                { borderColor: colors.divider, borderRadius: radii.pill },
              ]}
            >
              <Text style={[styles.infoText, { color: colors.saffronDeep }]}>i</Text>
            </View>
            <Text
              style={{
                flex: 1,
                color: colors.inkMuted,
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 13,
                // Devanagari needs ~1.6× or top (चंद्रबिंदु on नहीं) / bottom matras clip.
                lineHeight: 21,
              }}
            >
              {meaningByLang(
                lang,
                'पारम्परिक गोचर-आधारित मार्गदर्शन—निश्चित भविष्यवाणी नहीं।',
                'Traditional transit-based guidance—not a certain prediction.'
              )}
            </Text>
          </View>

          {loadState === 'loading' ? (
            <JyotishStateCard
              kind="loading"
              lang={lang}
              titleHi="चन्द्र राशि खोजी जा रही है"
              titleEn="Finding your Moon sign"
              bodyHi="आज का मार्गदर्शन दिखाने से पहले सुरक्षित कुंडली पढ़ी जा रही है।"
              bodyEn="Reading the saved Kundali before showing today’s guidance."
            />
          ) : (
            <>
              {loadState === 'error' && (
                <View
                  accessibilityRole="alert"
                  style={[
                    styles.recoveryNote,
                    {
                      backgroundColor: colors.goldTint,
                      borderColor: colors.divider,
                      borderRadius: radii.md,
                    },
                  ]}
                >
                  <Text style={[styles.recoveryMark, { color: colors.avoidDeep }]}>!</Text>
                  <Text
                    style={{
                      flex: 1,
                      color: colors.inkSoft,
                      fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                      fontSize: 11,
                      lineHeight: 16,
                    }}
                  >
                    {meaningByLang(
                      lang,
                      'सुरक्षित चन्द्र राशि नहीं मिली। आज के लिए स्वयं चुनें।',
                      'Your saved Moon sign couldn’t be loaded. Choose one manually for today.'
                    )}
                  </Text>
                </View>
              )}

              {selectedSign && rashiIndex !== null ? (
                <View
                  style={[
                    styles.signSource,
                    {
                      backgroundColor: colors.parchmentSoft,
                      borderColor: colors.divider,
                      borderRadius: radii.lg,
                    },
                    elevation.card,
                  ]}
                >
                  <View style={styles.signSourceCopy}>
                    <Text
                      style={[
                        pillTextStyle(lang, typography.sectionLabel),
                        styles.eyebrow,
                        { color: colors.saffronDeep },
                      ]}
                    >
                      {isNatalSelection
                        ? contentByLang(lang, 'आपकी कुंडली से', 'From your Kundali')
                        : contentByLang(lang, 'चुनी हुई चन्द्र राशि', 'Selected Moon sign')}
                    </Text>
                    <Text
                      style={{
                        color: colors.ink,
                        fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                        fontSize: 20,
                        marginTop: 3,
                      }}
                    >
                      {selectedSign.primary}
                      <Text style={[styles.signTranslation, { color: colors.inkMuted }]}>
                        {' '}· {selectedSign.secondary}
                      </Text>
                    </Text>
                    <Text
                      style={{
                        color: colors.inkMuted,
                        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                        fontSize: 10,
                        lineHeight: 15,
                        marginTop: 2,
                      }}
                    >
                      {isNatalSelection
                        ? meaningByLang(
                          lang,
                          'आपकी जन्म चन्द्र राशि प्रतिदिन अपने-आप चुनी जाती है।',
                          'Your natal Moon sign is selected automatically each day.'
                        )
                        : meaningByLang(
                          lang,
                          'आज के पाठ के लिए चुनी गई। स्वतः चयन के लिए एक बार कुंडली बनाएँ।',
                          'Selected for today. Create a Kundali once for automatic daily selection.'
                        )}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setSignPickerOpen((current) => !current)}
                    accessibilityRole="button"
                    accessibilityLabel={signPickerOpen ? 'Done choosing Moon sign' : 'Change Moon sign'}
                    style={({ pressed }) => [
                      styles.changeButton,
                      {
                        borderColor: colors.divider,
                        backgroundColor: colors.parchmentSoft,
                        borderRadius: radii.pill,
                      },
                      pressed && { opacity: 0.65 },
                    ]}
                  >
                    <Text style={[styles.changeText, { color: colors.saffronDeep }]}>
                      {signPickerOpen
                        ? contentByLang(lang, 'हो गया', 'Done')
                        : contentByLang(lang, 'बदलें', 'Change')}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.chooseIntro}>
                  <Text
                    style={[
                      pillTextStyle(lang, typography.sectionLabel),
                      styles.eyebrow,
                      { color: colors.saffronDeep },
                    ]}
                  >
                    {contentByLang(lang, 'अपनी चन्द्र राशि चुनें', 'Choose your Moon sign')}
                  </Text>
                  <Text
                    style={{
                      color: colors.inkMuted,
                      fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    {meaningByLang(
                      lang,
                      'पारम्परिक नाम · सरल अंग्रेज़ी अर्थ',
                      'Traditional name · plain-English equivalent'
                    )}
                  </Text>
                </View>
              )}

              {(rashiIndex === null || signPickerOpen) && (
                <View
                  accessibilityRole="radiogroup"
                  accessibilityLabel="Choose your Moon sign"
                  style={styles.signGrid}
                >
                  {RASHI_NAMES_EN.map((name, index) => {
                    const selected = index === rashiIndex;
                    const sign = signPair(lang, index);
                    const natal = loadState === 'saved' && index === natalMoon;
                    return (
                      <Pressable
                        key={name}
                        testID={`rashifal-sign-${index}`}
                        onPress={() => chooseSign(index)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={`${sign.primary}, ${sign.secondary} Moon sign`}
                        style={({ pressed }) => [
                          styles.signOption,
                          {
                            borderColor: selected ? colors.saffron : colors.divider,
                            backgroundColor: selected
                              ? colors.saffronTint
                              : colors.parchmentSoft,
                            borderRadius: radii.md,
                          },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <View style={styles.signNameRow}>
                          <Text
                            style={{
                              color: selected ? colors.saffronDeep : colors.ink,
                              fontFamily: scriptTitleFont(
                                lang,
                                typography.readerTitle.fontFamily
                              ),
                              fontSize: 16,
                            }}
                          >
                            {sign.primary}
                          </Text>
                          {natal && (
                            <View
                              accessibilityLabel="Your Moon sign"
                              style={[
                                styles.natalDot,
                                { backgroundColor: colors.saffron },
                              ]}
                            />
                          )}
                        </View>
                        <Text style={[styles.signSecondary, { color: colors.inkMuted }]}>
                          {sign.secondary}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {guidance && rashiIndex !== null && selectedSign ? (
                <>
                  <View
                    style={[
                      styles.guidanceBlock,
                      {
                        borderColor: colors.cardActiveBorder,
                        backgroundColor: colors.cardActiveFrom,
                        borderRadius: radii.lg,
                      },
                      elevation.card,
                    ]}
                  >
                    <View
                      style={[
                        styles.guidanceHead,
                        {
                          backgroundColor: colors.cardActiveFrom,
                          borderBottomColor: colors.divider,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          pillTextStyle(lang, typography.sectionLabel),
                          styles.eyebrow,
                          { color: colors.saffronDeep },
                        ]}
                      >
                        {isNatalSelection
                          ? contentByLang(
                            lang,
                            'चन्द्र राशि · आपकी कुंडली से',
                            'Moon sign · From your Kundali'
                          )
                          : contentByLang(
                            lang,
                            'आज का मार्गदर्शन · चन्द्र राशि',
                            'Today’s guidance · Moon sign'
                          )}
                      </Text>
                      <Text
                        style={{
                          color: colors.ink,
                          fontFamily: scriptTitleFont(
                            lang,
                            typography.readerTitle.fontFamily
                          ),
                          fontSize: 21,
                          marginTop: 3,
                        }}
                      >
                        {selectedSign.primary}
                        <Text style={[styles.signTranslation, { color: colors.inkMuted }]}>
                          {' '}· {selectedSign.secondary}
                        </Text>
                      </Text>
                      <Text style={[styles.caption, { color: colors.inkMuted, marginTop: 2 }]}>
                        {formatToday(today, lang)}
                      </Text>
                      {personal && (
                        <View style={styles.personalPillRow}>
                          <View
                            accessibilityLabel={`Personal reading from your Kundali. Tara bala ${personal.taraBala.nameEn}`}
                            style={[
                              styles.personalPill,
                              {
                                borderColor: colors.divider,
                                backgroundColor:
                                  personal.taraBala.tone === 'favourable'
                                    ? colors.goldTint
                                    : personal.taraBala.tone === 'reflective'
                                      ? colors.saffronTint
                                      : colors.cardSurface,
                                borderRadius: radii.pill,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                pillTextStyle(lang, typography.sectionLabel),
                                styles.personalPillText,
                                { color: colors.inkSoft },
                              ]}
                            >
                              {contentByLang(
                                lang,
                                `तारा बल · ${personal.taraBala.nameHi}`,
                                `Tara bala · ${personal.taraBala.nameEn}`
                              )}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.personalPill,
                              {
                                borderColor: colors.divider,
                                backgroundColor: colors.cardSurface,
                                borderRadius: radii.pill,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                pillTextStyle(lang, typography.sectionLabel),
                                styles.personalPillText,
                                { color: colors.inkSoft },
                              ]}
                            >
                              {contentByLang(lang, 'व्यक्तिगत पाठ', 'Personal reading')}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <JyotishGuidanceRows guidance={guidance} lang={lang} showContext />
                  </View>
                  <Text
                    style={[
                      pillTextStyle(lang, typography.sectionLabel),
                      styles.sectionLabel,
                      { color: colors.inkMuted },
                    ]}
                  >
                    {contentByLang(lang, 'साधना', 'Practice')}
                  </Text>
                  <JyotishPracticeCard
                    titleHi={source?.nameHi}
                    titleEn={source?.nameEn}
                    subtitleHi="आज के चन्द्र-राशि मार्गदर्शन के साथ"
                    subtitleEn="Suggested alongside today’s Moon-sign guidance"
                    accessibilityLabel={`Open ${source?.nameEn ?? 'traditional'} practice`}
                    onPress={openPractice}
                  />
                </>
              ) : (
                <>
                  <View
                    style={[
                      styles.empty,
                      {
                        borderColor: colors.divider,
                        backgroundColor: colors.cardSurface,
                        borderRadius: radii.lg,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.inkMuted,
                        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                        fontSize: 12,
                        lineHeight: 18,
                        textAlign: 'center',
                      }}
                    >
                      {meaningByLang(
                        lang,
                        'आज जिसे स्थान दें, जहाँ ठहरें और चिंतन प्रश्न देखने के लिए चन्द्र राशि चुनें।',
                        'Choose a Moon sign to see today’s Favour, Pause, and Reflect guidance.'
                      )}
                      {'\n\n'}
                      {meaningByLang(
                        lang,
                        'एक बार कुंडली बनाने पर यह प्रतिदिन अपने-आप चुनी जाएगी।',
                        'Create your Kundali once for automatic daily selection.'
                      )}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => rootNav.navigate('Kundali')}
                    accessibilityRole="button"
                    accessibilityLabel="Create Kundali"
                    style={({ pressed }) => [
                      styles.createButton,
                      {
                        borderColor: colors.divider,
                        backgroundColor: colors.parchmentSoft,
                        borderRadius: radii.pill,
                      },
                      pressed && { opacity: 0.72 },
                    ]}
                  >
                    <Text style={[styles.changeText, { color: colors.saffronDeep }]}>
                      {contentByLang(lang, 'जन्म कुंडली बनाएँ', 'Create Kundali')}
                    </Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {guidance && rashiIndex !== null && source && (
        <JyotishShareSheet
          visible={shareVisible}
          lang={lang}
          titleHi={`आज का ${RASHI_NAMES_HI[rashiIndex]} राशिफल साझा करें`}
          titleEn={`Share today’s ${RASHI_NAMES_EN[rashiIndex]} Rashifal`}
          privacyHi="केवल चन्द्र-राशि मार्गदर्शन साझा होगा। नाम या जन्म विवरण शामिल नहीं हैं।"
          privacyEn="Only Moon-sign guidance is shared. No name or birth details are included."
          onClose={() => setShareVisible(false)}
          renderCard={(width) => (
            <JyotishShareCard
              kind="rashifal"
              width={width}
              lang={lang}
              guidance={guidance}
              rashiIndex={rashiIndex}
              practiceHi={source.nameHi}
              practiceEn={source.nameEn}
              date={today}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    // 44 to match every other back control (design.md §12).
    width: 44,
    height: 44,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  headerSpacer: { width: 48 },
  caption: {
    fontFamily: fontFamilies.inter,
    fontSize: 12,
    lineHeight: 18,
  },
  sharePill: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  reflectionNote: {
    marginTop: 3,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  infoMark: {
    width: 18,
    height: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  recoveryNote: {
    padding: 11,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  recoveryMark: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 12,
  },
  signSource: {
    padding: 13,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signSourceCopy: { flex: 1 },
  eyebrow: { fontSize: 15 },
  signTranslation: {
    fontFamily: fontFamilies.inter,
    fontSize: 12,
  },
  changeButton: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  chooseIntro: { marginHorizontal: 2, marginBottom: 8 },
  signGrid: {
    marginBottom: 11,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  signOption: {
    width: '31.8%',
    minHeight: 64,
    padding: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signSecondary: {
    marginTop: 1,
    fontFamily: fontFamilies.inter,
    fontSize: 14,
  },
  natalDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  guidanceBlock: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  personalPillRow: {
    marginTop: 7,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  personalPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
  },
  personalPillText: {
    fontSize: 12,
  },
  guidanceHead: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionLabel: {
    fontSize: 12,
    marginTop: 18,
    marginBottom: 8,
  },
  empty: {
    padding: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  createButton: {
    minHeight: 42,
    marginTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

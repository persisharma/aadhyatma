import React, { useEffect, useMemo, useState } from 'react';
import {
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import JyotishStateCard from '@/components/JyotishStateCard';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import {
  activeHouseThemes,
  computeGocharSnapshot,
  computeSadeSati,
  computeUpcomingIngresses,
  type GocharSnapshot,
  type IngressEvent,
  type SadeSatiStatus,
} from '@/panchang/gochar';
import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
} from '@/panchang/kundali';
import { useKundali } from '@/panchang/useKundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import {
  pillTextStyle,
  scriptBodyFont,
  scriptTitleFont,
} from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'Gochar'>;

const DATE_LOCALES: Record<Lang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
};

function formatDay(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(DATE_LOCALES[lang], {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function ordinal(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function transitSummaryEn(snapshot: GocharSnapshot): string {
  const parts = snapshot.transits.map(
    (transit) =>
      `${GRAHA_NAMES_EN[transit.graha]} in ${RASHI_NAMES_EN[transit.transitRashiIndex]}, `
      + `${ordinal(transit.houseFromMoon)} from Moon, ${ordinal(transit.houseFromLagna)} from Lagna`
      + `${transit.retrograde ? ', retrograde' : ''}`
  );
  return `Today's graha transits against your chart: ${parts.join('; ')}.`;
}

export default function GocharScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { chart, loadState } = useKundali();
  const today = useMemo(() => new Date(), []);

  // Cheap solves render immediately; the ingress scans (day-walks over the
  // ephemeris) wait for interactions, the same discipline as useMuhurat.
  const snapshot = useMemo(
    () => (chart ? computeGocharSnapshot(chart, today) : null),
    [chart, today]
  );
  const sadeSatiNow = useMemo(
    () => (chart ? computeSadeSati(chart, today, { boundaryScanDays: 0 }) : null),
    [chart, today]
  );
  const [sadeSati, setSadeSati] = useState<SadeSatiStatus | null>(null);
  const [ingresses, setIngresses] = useState<readonly IngressEvent[] | null>(null);

  useEffect(() => {
    if (!chart) return undefined;
    let cancelled = false;
    const interaction = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (cancelled) return;
        setSadeSati(computeSadeSati(chart, today));
        setIngresses(computeUpcomingIngresses(today));
      }, 0);
    });
    return () => {
      cancelled = true;
      interaction.cancel();
    };
  }, [chart, today]);

  const sadeSatiView = sadeSati ?? sadeSatiNow;
  const themes = snapshot ? activeHouseThemes(snapshot) : [];
  const shaniEntry = library.find((entry) => entry.id === 'shani-ashtakam');

  const openShaniPractice = () => {
    const target = shaniEntry ? buildEntryStartTarget(shaniEntry) : null;
    if (target) rootNav.navigate('HomeTab', target);
  };

  const sectionLabel = (hi: string, en: string) => (
    <Text
      style={[
        pillTextStyle(lang, typography.sectionLabel),
        styles.sectionLabel,
        { color: colors.inkMuted },
      ]}
    >
      {contentByLang(lang, hi, en)}
    </Text>
  );

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
              accessibilityLabel="Gochar"
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 18,
              }}
            >
              {contentByLang(lang, 'गोचर', 'Gochar')}
            </Text>
            <Text style={[styles.caption, { color: colors.inkMuted }]}>
              {formatDay(today, lang)} ·{' '}
              {contentByLang(lang, 'आज के ग्रह आपकी कुंडली में', 'Today’s grahas in your chart')}
            </Text>
          </View>
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
                // Devanagari needs ~1.6× leading or top/bottom matras clip.
                lineHeight: 21,
              }}
            >
              {meaningByLang(
                lang,
                'पारम्परिक गोचर दृष्टि—निश्चित भविष्यवाणी नहीं।',
                'A traditional transit view—not a certain prediction.'
              )}
            </Text>
          </View>

          {loadState === 'loading' && (
            <JyotishStateCard
              kind="loading"
              lang={lang}
              titleHi="आपकी कुंडली पढ़ी जा रही है"
              titleEn="Reading your chart"
              bodyHi="गोचर दिखाने से पहले सहेजी गई कुंडली पढ़ी जा रही है।"
              bodyEn="Loading your saved Kundali before showing transits."
            />
          )}

          {loadState === 'error' && (
            <JyotishStateCard
              kind="error"
              lang={lang}
              titleHi="जन्म विवरण पढ़े नहीं जा सके"
              titleEn="We couldn’t read your birth details"
              bodyHi="कुछ हटाया नहीं गया। गोचर के लिए कुंडली फिर बनाएँ।"
              bodyEn="Nothing was deleted. Rebuild your Kundali to see transits."
              actionHi="जन्म विवरण फिर भरें"
              actionEn="Re-enter birth details"
              actionAccessibilityLabel="Re-enter birth details"
              onAction={() => rootNav.navigate('Kundali')}
            />
          )}

          {loadState === 'guest' && (
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
                    'गोचर आपकी जन्म कुंडली के सापेक्ष पढ़ा जाता है। एक बार कुंडली बनाने पर यह पृष्ठ प्रतिदिन तैयार मिलेगा।',
                    'Transits are read against your birth chart. Create your Kundali once and this page is ready every day.'
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
                <Text style={[styles.createText, { color: colors.saffronDeep }]}>
                  {contentByLang(lang, 'जन्म कुंडली बनाएँ', 'Create Kundali')}
                </Text>
              </Pressable>
            </>
          )}

          {snapshot && (
            <>
              <View
                style={[
                  styles.referenceCard,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    borderRadius: radii.lg,
                  },
                ]}
              >
                {[
                  {
                    labelHi: 'जन्म राशि (चन्द्र)',
                    labelEn: 'Moon sign',
                    index: snapshot.janmaRashiIndex,
                  },
                  {
                    labelHi: 'लग्न',
                    labelEn: 'Lagna',
                    index: snapshot.lagnaRashiIndex,
                  },
                ].map((fact) => (
                  <View key={fact.labelEn} style={styles.referenceFact}>
                    <Text
                      style={[
                        pillTextStyle(lang, typography.sectionLabel),
                        styles.referenceLabel,
                        { color: colors.inkMuted },
                      ]}
                    >
                      {contentByLang(lang, fact.labelHi, fact.labelEn)}
                    </Text>
                    <Text
                      style={{
                        color: colors.ink,
                        fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                        fontSize: 15,
                        marginTop: 2,
                      }}
                    >
                      {contentByLang(
                        lang,
                        RASHI_NAMES_HI[fact.index],
                        RASHI_NAMES_EN[fact.index]
                      )}
                      <Text style={[styles.referenceDetail, { color: colors.inkMuted }]}>
                        {' '}· {lang === 'en'
                          ? RASHI_NAMES_WESTERN[fact.index]
                          : RASHI_NAMES_EN[fact.index]}
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>

              {sectionLabel('आज के गोचर', 'Today’s transits')}
              <View
                accessibilityLabel={transitSummaryEn(snapshot)}
                style={[
                  styles.transitTable,
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
                    styles.transitHeadRow,
                    { borderBottomColor: colors.divider },
                  ]}
                >
                  {[
                    contentByLang(lang, 'ग्रह', 'Graha'),
                    contentByLang(lang, 'राशि', 'Sign'),
                    contentByLang(lang, 'चन्द्र से', 'From Moon'),
                    contentByLang(lang, 'लग्न से', 'From Lagna'),
                  ].map((head, index) => (
                    <Text
                      key={head}
                      style={[
                        pillTextStyle(lang, typography.sectionLabel),
                        styles.transitHeadText,
                        index === 0 ? styles.transitGrahaCol : styles.transitCol,
                        { color: colors.inkMuted },
                      ]}
                    >
                      {head}
                    </Text>
                  ))}
                </View>
                {snapshot.transits.map((transit, index) => (
                  <View
                    key={transit.graha}
                    style={[
                      styles.transitRow,
                      {
                        borderBottomColor:
                          index < snapshot.transits.length - 1
                            ? colors.divider
                            : 'transparent',
                      },
                    ]}
                  >
                    <View style={[styles.transitGrahaCol, styles.transitGrahaCell]}>
                      <View
                        style={[
                          styles.supportDot,
                          {
                            backgroundColor: transit.supportive
                              ? colors.gold
                              : colors.divider,
                          },
                        ]}
                      />
                      <Text
                        style={{
                          color: colors.ink,
                          fontFamily: scriptTitleFont(
                            lang,
                            typography.readerTitle.fontFamily
                          ),
                          fontSize: 14,
                        }}
                      >
                        {contentByLang(
                          lang,
                          GRAHA_NAMES_HI[transit.graha],
                          GRAHA_NAMES_EN[transit.graha]
                        )}
                        {transit.retrograde && (
                          <Text style={{ color: colors.saffronDeep, fontSize: 11 }}>
                            {' '}℞
                          </Text>
                        )}
                      </Text>
                    </View>
                    <Text style={[styles.transitCol, styles.transitValue, { color: colors.inkSoft }]}>
                      {contentByLang(
                        lang,
                        RASHI_NAMES_HI[transit.transitRashiIndex],
                        RASHI_NAMES_EN[transit.transitRashiIndex]
                      )}
                    </Text>
                    <Text style={[styles.transitCol, styles.transitValue, { color: colors.inkSoft }]}>
                      {contentByLang(
                        lang,
                        `${transit.houseFromMoon} भाव`,
                        ordinal(transit.houseFromMoon)
                      )}
                    </Text>
                    <Text style={[styles.transitCol, styles.transitValue, { color: colors.inkSoft }]}>
                      {contentByLang(
                        lang,
                        `${transit.houseFromLagna} भाव`,
                        ordinal(transit.houseFromLagna)
                      )}
                    </Text>
                  </View>
                ))}
                <View style={styles.legendRow}>
                  <View style={[styles.supportDot, { backgroundColor: colors.gold }]} />
                  <Text style={[styles.legendText, { color: colors.inkMuted }]}>
                    {contentByLang(
                      lang,
                      'पारम्परिक रूप से सहायक भाव में · ℞ वक्री',
                      'In a traditionally supportive house · ℞ retrograde'
                    )}
                  </Text>
                </View>
              </View>

              {themes.length > 0 && (
                <>
                  {sectionLabel('सक्रिय भाव-विषय', 'Active house themes')}
                  <View style={styles.themeWrap}>
                    {themes.map((theme) => (
                      <View
                        key={theme.house}
                        style={[
                          styles.themeChip,
                          {
                            borderColor: colors.divider,
                            backgroundColor: colors.parchmentSoft,
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            pillTextStyle(lang, typography.sectionLabel),
                            styles.themeChipText,
                            { color: colors.inkSoft },
                          ]}
                        >
                          {contentByLang(
                            lang,
                            `${theme.house} भाव · ${theme.themeHi}`,
                            `${ordinal(theme.house)} · ${theme.themeEn}`
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {sadeSatiView && (
                <>
                  {sectionLabel('साढ़े साती', 'Sade Sati')}
                  <View
                    accessibilityLabel={`${sadeSatiView.headlineEn}. ${sadeSatiView.bodyEn}`}
                    style={[
                      styles.sadeSatiCard,
                      {
                        borderColor:
                          sadeSatiView.phase === 'none'
                            ? colors.divider
                            : colors.cardActiveBorder,
                        backgroundColor:
                          sadeSatiView.phase === 'none'
                            ? colors.parchmentSoft
                            : colors.cardActiveFrom,
                        borderRadius: radii.lg,
                      },
                      sadeSatiView.phase !== 'none' && elevation.card,
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.ink,
                        fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                        fontSize: sadeSatiView.phase === 'none' ? 14 : 17,
                      }}
                    >
                      {contentByLang(lang, sadeSatiView.headlineHi, sadeSatiView.headlineEn)}
                    </Text>
                    <Text
                      style={{
                        color: colors.inkSoft,
                        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                        fontSize: 12,
                        lineHeight: 19,
                        marginTop: 5,
                      }}
                    >
                      {meaningByLang(lang, sadeSatiView.bodyHi, sadeSatiView.bodyEn)}
                    </Text>
                    {sadeSati?.nextTransitionAt && (
                      <Text style={[styles.sadeSatiBoundary, { color: colors.inkMuted }]}>
                        {contentByLang(
                          lang,
                          `शनि का अगला राशि-प्रवेश · ${formatDay(sadeSati.nextTransitionAt, lang)}`,
                          `Saturn’s next sign change · ${formatDay(sadeSati.nextTransitionAt, lang)}`
                        )}
                      </Text>
                    )}
                    {sadeSatiView.phase !== 'none' && shaniEntry && (
                      <Pressable
                        onPress={openShaniPractice}
                        accessibilityRole="button"
                        accessibilityLabel="Open Shani Ashtakam practice"
                        style={({ pressed }) => [
                          styles.practiceLink,
                          {
                            borderColor: colors.divider,
                            backgroundColor: colors.parchmentSoft,
                            borderRadius: radii.pill,
                          },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text style={[styles.practiceLinkText, { color: colors.saffronDeep }]}>
                          {contentByLang(lang, 'शनि अष्टकम् पढ़ें', 'Read Shani Ashtakam')} ›
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </>
              )}

              {sectionLabel('आगामी राशि-प्रवेश', 'Upcoming sign changes')}
              {ingresses === null ? (
                <View
                  style={[
                    styles.ingressPending,
                    {
                      borderColor: colors.divider,
                      backgroundColor: colors.cardSurface,
                      borderRadius: radii.md,
                    },
                  ]}
                >
                  <Text style={[styles.legendText, { color: colors.inkMuted }]}>
                    {contentByLang(lang, 'गणना हो रही है…', 'Calculating…')}
                  </Text>
                </View>
              ) : (
                ingresses.map((event) => (
                  <View
                    key={`${event.graha}-${event.at.getTime()}`}
                    accessibilityLabel={`${GRAHA_NAMES_EN[event.graha]} enters ${RASHI_NAMES_EN[event.toRashiIndex]} on ${formatDay(event.at, 'en')}`}
                    style={[
                      styles.ingressRow,
                      {
                        borderColor: colors.divider,
                        backgroundColor: colors.parchmentSoft,
                        borderRadius: radii.md,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: colors.ink,
                        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                        fontSize: 12,
                        lineHeight: 18,
                      }}
                    >
                      {contentByLang(
                        lang,
                        `${GRAHA_NAMES_HI[event.graha]} → ${RASHI_NAMES_HI[event.toRashiIndex]}`,
                        `${GRAHA_NAMES_EN[event.graha]} → ${RASHI_NAMES_EN[event.toRashiIndex]}`
                      )}
                    </Text>
                    <Text style={[styles.ingressDate, { color: colors.inkMuted }]}>
                      {formatDay(event.at, lang)}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
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
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  caption: {
    fontFamily: fontFamilies.inter,
    fontSize: 12,
    lineHeight: 18,
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
  empty: {
    padding: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  createButton: {
    minHeight: 44,
    marginTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  referenceCard: {
    padding: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  referenceFact: { flex: 1 },
  referenceLabel: { fontSize: 12 },
  referenceDetail: {
    fontFamily: fontFamilies.inter,
    fontSize: 11,
  },
  sectionLabel: {
    fontSize: 12,
    marginTop: 18,
    marginBottom: 8,
  },
  transitTable: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  transitHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  transitHeadText: { fontSize: 12 },
  transitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  transitGrahaCol: { flex: 1.4 },
  transitCol: { flex: 1 },
  transitGrahaCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  transitValue: {
    fontFamily: fontFamilies.inter,
    fontSize: 12,
  },
  supportDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  legendText: {
    fontFamily: fontFamilies.inter,
    fontSize: 11,
    lineHeight: 16,
  },
  themeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  themeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  themeChipText: { fontSize: 12 },
  sadeSatiCard: {
    padding: 14,
    borderWidth: 1,
  },
  sadeSatiBoundary: {
    fontFamily: fontFamilies.inter,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },
  practiceLink: {
    minHeight: 38,
    marginTop: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceLinkText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  ingressPending: {
    padding: 12,
    borderWidth: 1,
  },
  ingressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 7,
  },
  ingressDate: {
    fontFamily: fontFamilies.inter,
    fontSize: 11,
  },
});

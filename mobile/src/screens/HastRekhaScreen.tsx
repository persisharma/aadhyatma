import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import JyotishPracticeCard from '@/components/JyotishPracticeCard';
import JyotishStateCard from '@/components/JyotishStateCard';
import { useGitaLanguage } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import {
  computeHastRekha,
  PALM_LINES,
  type PalmLineId,
  type PalmProfile,
} from '@/panchang/hastRekha';
import { useHastRekha } from '@/panchang/useHastRekha';
import { radii } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import {
  pillTextStyle,
  scriptBodyFont,
  scriptTitleFont,
} from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'HastRekha'>;

type Selections = Partial<PalmProfile>;

const LINE_ACCENT: Record<PalmLineId, 'gold' | 'saffronDeep' | 'avoidDeep'> = {
  heart: 'gold',
  head: 'saffronDeep',
  life: 'gold',
  fate: 'saffronDeep',
};

function isComplete(selections: Selections): selections is PalmProfile {
  return Boolean(
    selections.heart && selections.head && selections.life && selections.fate
  );
}

export default function HastRekhaScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { profile, loadState, saveProfile, clearProfile } = useHastRekha();
  const [selections, setSelections] = useState<Selections>({});
  const [touched, setTouched] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // Adopt the stored profile once, unless the user already started choosing.
  useEffect(() => {
    if (!touched && profile) setSelections(profile);
  }, [profile, touched]);

  const reading = useMemo(
    () => (isComplete(selections) ? computeHastRekha(selections) : null),
    [selections]
  );
  const source = reading
    ? library.find((entry) => entry.id === reading.sourceId)
    : undefined;

  const choose = (line: PalmLineId, traitId: string) => {
    setTouched(true);
    setSaveFailed(false);
    const next: Selections = { ...selections, [line]: traitId };
    setSelections(next);
    if (isComplete(next)) {
      void saveProfile(next).catch(() => setSaveFailed(true));
    }
  };

  const reset = () => {
    setTouched(true);
    setSelections({});
    setSaveFailed(false);
    void clearProfile().catch(() => setSaveFailed(true));
  };

  const openPractice = () => {
    const target = source ? buildEntryStartTarget(source) : null;
    if (target) rootNav.navigate('HomeTab', target);
  };

  const answered = PALM_LINES.filter((spec) => selections[spec.line]).length;

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
              accessibilityLabel="Palm Reading"
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 18,
              }}
            >
              {contentByLang(lang, 'हस्तरेखा दर्शन', 'Palm Reading')}
            </Text>
            <Text style={[styles.caption, { color: colors.inkMuted }]}>
              {contentByLang(lang, 'हस्तरेखा शास्त्र', 'Hast Rekha Shastra')}
            </Text>
          </View>
          {reading ? (
            <Pressable
              onPress={reset}
              accessibilityRole="button"
              accessibilityLabel="Start over"
              style={({ pressed }) => [
                styles.resetPill,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.pill,
                },
                pressed && { opacity: 0.65 },
              ]}
            >
              <Text style={[styles.resetText, { color: colors.saffronDeep }]}>
                {contentByLang(lang, 'फिर से', 'Start over')}
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
                // Devanagari needs ~1.6× or top/bottom matras clip.
                lineHeight: 21,
              }}
            >
              {meaningByLang(
                lang,
                'पारम्परिक हस्तरेखा-आधारित चिंतन—निश्चित भविष्यवाणी नहीं।',
                'Traditional palm-line reflection—not a certain prediction.'
              )}
            </Text>
          </View>

          {loadState === 'loading' ? (
            <JyotishStateCard
              kind="loading"
              lang={lang}
              titleHi="सहेजी हुई हस्तरेखा पढ़ी जा रही है"
              titleEn="Reading your saved palm profile"
              bodyHi="इस उपकरण पर सुरक्षित चयन पढ़े जा रहे हैं।"
              bodyEn="Loading the selections stored on this device."
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
                      'सहेजे हुए चयन पढ़े नहीं जा सके। कुछ हटाया नहीं गया—नीचे फिर से चुनें।',
                      'Your saved selections couldn’t be loaded. Nothing was deleted—choose again below.'
                    )}
                  </Text>
                </View>
              )}
              {saveFailed && (
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
                      'चयन सहेजे नहीं जा सके। पाठ नीचे उपलब्ध है, पर अगली बार फिर चुनना होगा।',
                      'Selections couldn’t be saved. Your reading still shows below, but you may need to choose again next time.'
                    )}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.introCard,
                  {
                    backgroundColor: colors.parchmentSoft,
                    borderColor: colors.divider,
                    borderRadius: radii.lg,
                  },
                  elevation.card,
                ]}
              >
                <Text
                  style={[
                    pillTextStyle(lang, typography.sectionLabel),
                    styles.eyebrow,
                    { color: colors.saffronDeep },
                  ]}
                >
                  {contentByLang(lang, 'अपनी हथेली देखें', 'Observe your palm')}
                </Text>
                <Text
                  style={{
                    color: colors.ink,
                    fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                    fontSize: 13,
                    lineHeight: 21,
                    marginTop: 4,
                  }}
                >
                  {meaningByLang(
                    lang,
                    'अच्छे प्रकाश में अपने सक्रिय (प्रमुख) हाथ की हथेली देखें। हर रेखा के लिए वही रूप चुनें जो सबसे निकट लगे।',
                    'In good light, look at the palm of your active (dominant) hand. For each line, choose the form that looks closest.'
                  )}
                </Text>
                <Text style={[styles.progressText, { color: colors.inkMuted }]}>
                  {`${answered}/4`}
                </Text>
              </View>

              {PALM_LINES.map((spec) => {
                const accent = colors[LINE_ACCENT[spec.line]];
                return (
                  <View key={spec.line} style={styles.lineBlock}>
                    <Text
                      style={[
                        pillTextStyle(lang, typography.sectionLabel),
                        styles.sectionLabel,
                        { color: colors.inkMuted },
                      ]}
                    >
                      {contentByLang(lang, spec.nameHi, spec.nameEn)}
                    </Text>
                    <Text
                      style={{
                        color: colors.inkMuted,
                        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                        fontSize: 12,
                        lineHeight: 18,
                        marginBottom: 7,
                      }}
                    >
                      {meaningByLang(lang, spec.locateHi, spec.locateEn)}
                    </Text>
                    <View
                      accessibilityRole="radiogroup"
                      accessibilityLabel={`Choose your ${spec.nameEn} form`}
                      style={styles.optionRow}
                    >
                      {spec.options.map((option) => {
                        const selected = selections[spec.line] === option.id;
                        return (
                          <Pressable
                            key={option.id}
                            testID={`hastrekha-${spec.line}-${option.id}`}
                            onPress={() => choose(spec.line, option.id)}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            accessibilityLabel={`${spec.nameEn}: ${option.labelEn}. ${option.descEn}`}
                            style={({ pressed }) => [
                              styles.option,
                              {
                                borderColor: selected ? accent : colors.divider,
                                backgroundColor: selected
                                  ? colors.saffronTint
                                  : colors.parchmentSoft,
                                borderRadius: radii.md,
                              },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <Text
                              style={{
                                color: selected ? colors.saffronDeep : colors.ink,
                                fontFamily: scriptTitleFont(
                                  lang,
                                  typography.readerTitle.fontFamily
                                ),
                                fontSize: 15,
                              }}
                            >
                              {contentByLang(lang, option.labelHi, option.labelEn)}
                            </Text>
                            <Text
                              style={{
                                color: colors.inkMuted,
                                fontFamily: scriptBodyFont(
                                  lang,
                                  typography.meaning.fontFamily
                                ),
                                fontSize: 11,
                                lineHeight: 16,
                                marginTop: 2,
                              }}
                            >
                              {meaningByLang(lang, option.descHi, option.descEn)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}

              {reading ? (
                <>
                  <View
                    accessibilityLabel="Palm reading result"
                    style={[
                      styles.readingBlock,
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
                        styles.readingHead,
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
                        {contentByLang(lang, 'आपका पाठ', 'Your reading')}
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
                        {contentByLang(lang, 'चार रेखाएँ, चार संकेत', 'Four lines, four cues')}
                      </Text>
                      <Text style={[styles.caption, { color: colors.inkMuted, marginTop: 2 }]}>
                        {contentByLang(lang, 'इसी उपकरण पर सुरक्षित', 'Saved on this device')}
                      </Text>
                    </View>
                    {reading.insights.map((row, index) => (
                      <View
                        key={row.line}
                        accessibilityLabel={`${row.eyebrowEn}: ${row.titleEn}. ${row.bodyEn}`}
                        style={[
                          styles.insightRow,
                          {
                            backgroundColor: colors.parchmentSoft,
                            borderLeftColor: colors[LINE_ACCENT[row.line]],
                            borderBottomColor:
                              index < reading.insights.length - 1
                                ? colors.divider
                                : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            pillTextStyle(lang, typography.sectionLabel),
                            styles.insightLabel,
                            { color: colors.inkSoft },
                          ]}
                        >
                          {contentByLang(lang, row.eyebrowHi, row.eyebrowEn)}
                          {' · '}
                          {contentByLang(lang, row.titleHi, row.titleEn)}
                        </Text>
                        <Text
                          style={{
                            color: colors.ink,
                            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                            fontSize: 12,
                            lineHeight: 18,
                            marginTop: 2,
                          }}
                        >
                          {meaningByLang(lang, row.bodyHi, row.bodyEn)}
                        </Text>
                      </View>
                    ))}
                    <View
                      accessibilityLabel={`Reflect. ${reading.reflectionEn}`}
                      style={[
                        styles.insightRow,
                        {
                          backgroundColor: colors.saffronTint,
                          borderLeftColor: colors.saffronDeep,
                          borderBottomColor: 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          pillTextStyle(lang, typography.sectionLabel),
                          styles.insightLabel,
                          { color: colors.inkSoft },
                        ]}
                      >
                        {contentByLang(lang, 'चिंतन प्रश्न', 'Reflect')}
                      </Text>
                      <Text
                        style={{
                          color: colors.ink,
                          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                          fontSize: 12,
                          lineHeight: 18,
                          marginTop: 2,
                        }}
                      >
                        {meaningByLang(lang, reading.reflectionHi, reading.reflectionEn)}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      pillTextStyle(lang, typography.sectionLabel),
                      styles.sectionLabel,
                      { color: colors.inkMuted, marginTop: 18 },
                    ]}
                  >
                    {contentByLang(lang, 'साधना', 'Practice')}
                  </Text>
                  <JyotishPracticeCard
                    titleHi={source?.nameHi}
                    titleEn={source?.nameEn}
                    subtitleHi="आज के हस्तरेखा चिंतन के साथ"
                    subtitleEn="Suggested alongside today’s palm reflection"
                    accessibilityLabel={`Open ${source?.nameEn ?? 'traditional'} practice`}
                    onPress={openPractice}
                  />
                </>
              ) : (
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
                      'चारों रेखाओं का रूप चुनते ही आपका पाठ यहाँ दिखाई देगा।',
                      'Choose a form for all four lines to see your reading here.'
                    )}
                  </Text>
                </View>
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
  resetPill: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
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
  introCard: {
    padding: 13,
    borderWidth: 1,
    marginBottom: 6,
  },
  eyebrow: { fontSize: 15 },
  progressText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
    marginTop: 6,
  },
  lineBlock: { marginTop: 12 },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  option: {
    flexBasis: '31.5%',
    flexGrow: 1,
    minHeight: 88,
    padding: 9,
    borderWidth: 1,
  },
  readingBlock: {
    marginTop: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  readingHead: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  insightRow: {
    minHeight: 64,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderLeftWidth: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  insightLabel: {
    fontSize: 12,
  },
  empty: {
    marginTop: 18,
    padding: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});

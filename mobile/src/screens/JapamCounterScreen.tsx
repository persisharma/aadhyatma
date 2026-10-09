import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { pick, verseLinesByLang } from '@/utils/localize';
import { isLatinLang } from '@/utils/langType';
import { getSourceBackground } from '@/data/backgrounds';
import {
  findJapamMantra,
  JAPAM_BEADS_PER_ROUND,
  type JapamMantra,
} from '@/data/japam';
import { useJapamCounter } from '@/contexts/JapamCounterContext';
import { useJapamAlarms } from '@/contexts/JapamAlarmsContext';
import { useFontScale } from '@/contexts/FontScaleContext';
import { toDateKey, useUserActivity } from '@/contexts/UserActivityContext';
import BackgroundLayer from '@/components/BackgroundLayer';
import AppIcon from '@/components/AppIcon';
import JapamAudioPlayer from '@/components/JapamAudioPlayer';
import JapamMala, { JapamMalaTray } from '@/components/JapamMala';
import LanguageToggle from '@/components/LanguageToggle';
import Ornament from '@/components/Ornament';
import ShareButton from '@/components/ShareButton';
import { AlarmEditorSheet } from '@/screens/JapamAlarmsScreen';
import { useShare } from '@/utils/shareVerse';
import { useRatingAsk } from '@/contexts/ratingAsk';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JapamCounter'>;

export default function JapamCounterScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { getEntry, increment, resetBeads, clear } = useJapamCounter();
  const { addAlarm, updateAlarm, removeAlarm } = useJapamAlarms();
  const { share, busy: shareBusy } = useShare();
  const requestRatingAsk = useRatingAsk();
  const { factor } = useFontScale();
  const { activity } = useUserActivity();
  const { width: windowWidth } = useWindowDimensions();

  // Mantra is reading text → it scales with the global M/L size on EVERY device
  // (no per-device hardcoding, so M/L always takes effect). The tap surface
  // scrolls, so a larger mantra never clips — including the long 4-line mantras
  // (gayatri, hare-krishna). Non-Latin uses the themed (already-scaled) verse
  // token; the Latin transliteration scales its own smaller base by the factor.
  const verseFontSize = typography.verse.fontSize;
  const verseLineHeight = typography.verse.lineHeight;
  const verseFontSizeEn = Math.round(20 * factor);
  const verseLineHeightEn = Math.round(34 * factor);
  // The turning mala (§35) takes whatever height the tap surface has left after
  // the mantra above it, so the ring never runs past the stats row. The tray,
  // today count and reset live in that fixed row and the hint sits inside the
  // ring, so nothing below the ring can grow mid-japa and make it jump.
  // Window-height breakpoints can't do this: the tab bar, mantra length and M/L
  // size all eat into the same viewport. Below MALA_MIN the surface scrolls
  // instead of shrinking the beads further.
  const [tapViewportH, setTapViewportH] = useState(0);
  const [headH, setHeadH] = useState(0);
  const measured = tapViewportH > 0 && headH > 0;
  const fitH = tapViewportH - headH - TAP_CHROME_H;
  const malaSize = Math.round(
    Math.min(windowWidth - 2 * spacing.xxl, MALA_MAX, measured ? Math.max(MALA_MIN, fitH) : MALA_MAX)
  );

  const mantra: JapamMantra | null = useMemo(
    () => findJapamMantra(route.params.mantraId),
    [route.params.mantraId]
  );

  React.useEffect(() => {
    if (!mantra) {
      const id = setTimeout(() => navigation.goBack(), 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [mantra, navigation]);

  const entry = getEntry(mantra?.id ?? '__none__');
  const [resetSheetOpen, setResetSheetOpen] = useState(false);
  const [alarmEditorOpen, setAlarmEditorOpen] = useState(false);
  const lastRoundRef = useRef(entry.rounds);
  const [audioPlaying, setAudioPlaying] = useState(false);
  // Brief "turn the mala" notice when a round completes at the Sumeru.
  const [sumeruNotice, setSumeruNotice] = useState(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    },
    []
  );
  /** Did the user complete at least one full mala while this screen was open? */
  const completedRoundThisVisitRef = useRef(false);

  const registerBead = useCallback(
    (beads: number = 1) => {
      if (!mantra) return;
      const next = increment(mantra.id, beads);
      if (next.rounds > lastRoundRef.current) {
        lastRoundRef.current = next.rounds;
        setSumeruNotice(true);
        if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
        noticeTimerRef.current = setTimeout(() => setSumeruNotice(false), 2200);
        completedRoundThisVisitRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => undefined
        );
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }
    },
    [increment, mantra]
  );

  // Ask for a rating when the user LEAVES the counter after finishing a mala —
  // never a card over the beads mid-japa (§54). The moment is the settle point:
  // the screen blurs, and the rating gate + delay decide whether the sheet opens
  // on the screen behind. `requestAsk` no-ops silently if the gate says no.
  const requestRatingAskRef = useRef(requestRatingAsk);
  requestRatingAskRef.current = requestRatingAsk;
  useFocusEffect(
    useCallback(
      () => () => {
        if (completedRoundThisVisitRef.current) {
          completedRoundThisVisitRef.current = false;
          requestRatingAskRef.current('mala-complete');
        }
      },
      []
    )
  );

  // A screen tap is exactly one bead. Wrapped so the Pressable's gesture event
  // is never passed through as a bead count.
  const handleTap = useCallback(() => registerBead(1), [registerBead]);

  if (!mantra) {
    return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;
  }

  const titleEn = mantra.nameEn;
  // The mantra itself is shown once, in the tap surface; the top bar names the screen.
  const screenTitle = pick(lang, { hi: 'जपमाला', en: 'JapaMala', gu: 'જપમાળા', kn: 'ಜಪಮಾಲೆ' });

  const todayBeads = activity[toDateKey(new Date())]?.japa[mantra.id]?.beads ?? 0;
  const todayLabel = pick(lang, {
    hi: `आज ${todayBeads} जप`,
    en: `${todayBeads} japa today`,
    gu: `આજે ${todayBeads} જપ`,
    kn: `ಇಂದು ${todayBeads} ಜಪ`,
  });
  const malasDoneLabel = pick(lang, { hi: 'माला पूर्ण', en: 'Malas done', gu: 'માળા પૂર્ણ', kn: 'ಮಾಲೆ ಪೂರ್ಣ' });
  const firstMalaLabel = pick(lang, {
    hi: 'पहली माला आरम्भ',
    en: 'First mala on its way',
    gu: 'પહેલી માળા શરૂ',
    kn: 'ಮೊದಲ ಮಾಲೆ ಆರಂಭ',
  });
  const sumeruLabel = pick(lang, {
    hi: 'सुमेरु · माला पलटें',
    en: 'Sumeru · turn the mala',
    gu: 'સુમેરુ · માળા ફેરવો',
    kn: 'ಸುಮೇರು · ಮಾಲೆ ತಿರುಗಿಸಿ',
  });
  const tapHint = audioPlaying
    ? pick(lang, {
        hi: 'सुनें · मंत्र के साथ मनके आगे बढ़ते हैं',
        en: 'Listening · beads advance with the chant',
        gu: 'સાંભળો · મંત્ર સાથે મણકા આગળ વધે છે',
        kn: 'ಆಲಿಸಿ · ಮಂತ್ರದೊಂದಿಗೆ ಮಣಿಗಳು ಮುಂದುವರಿಯುತ್ತವೆ',
      })
    : pick(lang, { hi: 'जप के लिए स्पर्श करें', en: 'Tap to chant', gu: 'જપ માટે સ્પર્શ કરો', kn: 'ಜಪಕ್ಕಾಗಿ ಸ್ಪರ್ಶಿಸಿ' });
  const resetBeadsLabel = pick(lang, { hi: 'बीज पुनः ०', en: 'Reset Beads', gu: 'મણકા ફરી ૦', kn: 'ಮಣಿ ಮರು ೦' });
  const clearAllLabel = pick(lang, { hi: 'सब साफ़', en: 'Clear All', gu: 'બધું સાફ', kn: 'ಎಲ್ಲ ತೆರವು' });
  const nothingToReset = entry.count === 0 && entry.rounds === 0;
  // Script serif for gu/kn (constrained surface keeps its own sizes); null for hi/en.
  const scriptSerif = lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada : null;
  const scriptSerifBold = lang === 'gu' ? fontFamilies.gujaratiBold : lang === 'kn' ? fontFamilies.kannadaBold : null;


  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getSourceBackground(mantra.id)} />
      {/* The visible bottom tab bar already owns the bottom safe-area inset. */}
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.back,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
          </Pressable>

          <View style={styles.titleBlock}>
            <Text
              style={[
                isLatinLang(lang) ? styles.titleEn : styles.titleHi,
                isLatinLang(lang)
                  ? {
                      color: colors.ink,
                      fontFamily: typography.cardLatin.fontFamily,
                      fontSize: 16,
                    }
                  : {
                      color: colors.ink,
                      fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily,
                      fontSize: typography.readerTitle.fontSize,
                    },
              ]}
              numberOfLines={1}
            >
              {screenTitle}
            </Text>
          </View>

          <View style={styles.topRightCluster}>
            <LanguageToggle compact />
            <Pressable
              onPress={() => setAlarmEditorOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={
                lang === 'hi'
                  ? 'इस मंत्र के लिए स्मरण बनाएँ'
                  : 'Set an alarm for this mantra'
              }
              hitSlop={8}
              style={({ pressed }) => [
                styles.alarmBtn,
                {
                  backgroundColor: colors.parchmentSoft,
                  borderColor: colors.divider,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.alarmGlyph, { color: colors.saffronDeep }]}>⏰</Text>
            </Pressable>
            <ShareButton
              busy={shareBusy}
              onPress={() => {
                share(
                  {
                    sourceId: mantra.id,
                    sectionNameHi: mantra.nameHi,
                    sectionNameEn: mantra.nameEn,
                    verseLabelHi: `जप · ${entry.rounds} आवृत्ति`,
                    verseLabelEn: `Japa · ${entry.rounds} rounds`,
                    linesHi: [...mantra.lines],
                    linesEn: [...mantra.linesEn],
                    meaningHi: mantra.meaningHi,
                    meaningEn: mantra.meaningEn,
                  },
                  lang
                );
              }}
            />
          </View>
        </View>

        <ScrollView
          style={styles.tapArea}
          contentContainerStyle={styles.tapScroll}
          onLayout={(e) => setTapViewportH(e.nativeEvent.layout.height)}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={handleTap}
            accessibilityRole="button"
            accessibilityLabel={`${titleEn}. Tap to count one bead. ${entry.count} of ${JAPAM_BEADS_PER_ROUND} on this mala, ${entry.rounds} malas completed.`}
            style={({ pressed }) => [
              styles.tapContent,
              { paddingHorizontal: spacing.xxl },
              pressed && styles.tapAreaPressed,
            ]}
          >
            <View style={styles.headBlock} onLayout={(e) => setHeadH(e.nativeEvent.layout.height)}>
              <View style={styles.mantraBlock}>
                {verseLinesByLang(lang, mantra.lines, mantra.linesEn).map((line, i) => (
                  <Text
                    key={`${lang}-${i}`}
                    style={[
                      isLatinLang(lang) ? styles.mantraLineEn : styles.mantraLine,
                      isLatinLang(lang)
                        ? {
                            color: colors.ink,
                            fontFamily: typography.cardLatin.fontFamily,
                            fontSize: verseFontSizeEn,
                            lineHeight: verseLineHeightEn,
                          }
                        : {
                            color: colors.ink,
                            fontFamily: scriptSerif ?? typography.verse.fontFamily,
                            fontSize: verseFontSize,
                            lineHeight: verseLineHeight,
                          },
                    ]}
                  >
                    {line}
                  </Text>
                ))}
              </View>

              <Ornament compact />
            </View>

            {/* Held invisible for the first layout pass so the ring doesn't visibly snap to its fitted size. */}
            <View style={[styles.malaBlock, !measured && styles.unmeasured]}>
              <JapamMala
                count={entry.count}
                rounds={entry.rounds}
                size={malaSize}
                playing={audioPlaying}
                notice={sumeruNotice ? sumeruLabel : null}
                hint={tapHint}
                labelFontFamily={scriptSerif ?? undefined}
              />
            </View>
          </Pressable>
        </ScrollView>

        {/* One fixed line replaces the tray, the today label and the two reset buttons. */}
        <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
          <JapamMalaTray
            rounds={entry.rounds}
            label={malasDoneLabel}
            emptyLabel={firstMalaLabel}
          />
          <View style={[styles.statsDivider, { backgroundColor: colors.divider }]} />
          <Text
            style={[
              styles.todayLabel,
              {
                color: colors.saffronDeep,
                fontFamily: isLatinLang(lang)
                  ? typography.cardLatin.fontFamily
                  : scriptSerifBold ?? typography.readerTitle.fontFamily,
              },
            ]}
            numberOfLines={1}
          >
            {todayLabel}
          </Text>
          <Pressable
            onPress={() => setResetSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Reset or clear the count"
            accessibilityState={{ disabled: nothingToReset }}
            disabled={nothingToReset}
            hitSlop={8}
            style={({ pressed }) => [
              styles.resetBtn,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.cardActiveBorder,
              },
              pressed && { opacity: 0.7 },
              nothingToReset && { opacity: 0.4 },
            ]}
          >
            <AppIcon name="reset" size={18} color={colors.saffronDeep} />
          </Pressable>
        </View>

        <View
          style={[
            styles.audioRow,
            { borderTopColor: colors.divider },
          ]}
        >
          <JapamAudioPlayer
            mantraId={mantra.id}
            lang={lang}
            onIteration={registerBead}
            onPlayingChange={setAudioPlaying}
            autoPlay={route.params.autoPlay === true}
          />
        </View>
      </SafeAreaView>

      {/* The ↺ icon opens both choices; picking one is the confirmation. */}
      <Modal
        visible={resetSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setResetSheetOpen(false)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
          onPress={() => setResetSheetOpen(false)}
          accessibilityLabel="Close"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.sheet,
              {
                backgroundColor: colors.parchment,
                borderColor: colors.cardActiveBorder,
                borderTopLeftRadius: radii.lg,
                borderTopRightRadius: radii.lg,
              },
            ]}
          >
            <SafeAreaView edges={['bottom']}>
              <View style={[styles.sheetGrip, { backgroundColor: colors.dotRest }]} />
              <Text
                style={[
                  styles.sheetTitle,
                  {
                    color: colors.ink,
                    fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {pick(lang, { hi: 'गिनती साफ़ करें?', en: 'Clear the count?', gu: 'ગણતરી સાફ કરવી?', kn: 'ಎಣಿಕೆ ತೆರವುಗೊಳಿಸಬೇಕೆ?' })}
              </Text>

              <Pressable
                onPress={() => {
                  resetBeads(mantra.id);
                  setResetSheetOpen(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Reset bead count"
                accessibilityState={{ disabled: entry.count === 0 }}
                disabled={entry.count === 0}
                style={({ pressed }) => [
                  styles.sheetOption,
                  {
                    backgroundColor: colors.parchmentSoft,
                    borderColor: colors.cardActiveBorder,
                    borderRadius: radii.md,
                  },
                  pressed && { opacity: 0.85 },
                  entry.count === 0 && { opacity: 0.4 },
                ]}
              >
                <Text
                  style={[
                    styles.sheetOptionTitle,
                    { color: colors.saffronDeep, fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily },
                  ]}
                >
                  {resetBeadsLabel}
                </Text>
                <Text
                  style={[
                    styles.sheetOptionBody,
                    { color: colors.inkMuted, fontFamily: scriptSerif ?? typography.cardLatin.fontFamily },
                  ]}
                >
                  {pick(lang, {
                    hi: 'चालू आवृत्ति की गिनती शून्य हो जायेगी। पूर्ण आवृत्तियाँ सुरक्षित रहेंगी।',
                    en: 'The current bead count will reset to 0. Completed rounds are kept.',
                    gu: 'ચાલુ આવૃત્તિની ગણતરી શૂન્ય થઈ જશે. પૂર્ણ આવૃત્તિઓ સચવાશે.',
                    kn: 'ಪ್ರಸ್ತುತ ಮಣಿ ಎಣಿಕೆ ೦ ಗೆ ಮರುಹೊಂದಿಸಲಾಗುತ್ತದೆ. ಪೂರ್ಣ ಆವೃತ್ತಿಗಳು ಉಳಿಯುತ್ತವೆ.',
                  })}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  clear(mantra.id);
                  lastRoundRef.current = 0;
                  setResetSheetOpen(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Clear bead count and rounds"
                style={({ pressed }) => [
                  styles.sheetOption,
                  {
                    backgroundColor: colors.avoidTint,
                    borderColor: colors.avoid,
                    borderRadius: radii.md,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.sheetOptionTitle,
                    { color: colors.avoidDeep, fontFamily: scriptSerifBold ?? typography.readerTitle.fontFamily },
                  ]}
                >
                  {clearAllLabel}
                </Text>
                <Text
                  style={[
                    styles.sheetOptionBody,
                    { color: colors.inkMuted, fontFamily: scriptSerif ?? typography.cardLatin.fontFamily },
                  ]}
                >
                  {pick(lang, {
                    hi: 'बीज तथा सभी आवृत्तियाँ मिट जायेंगी। यह क्रिया पूर्ववत् नहीं की जा सकती।',
                    en: 'Beads and all rounds will be erased. This cannot be undone.',
                    gu: 'મણકા તથા બધી આવૃત્તિઓ ભૂંસાઈ જશે. આ ક્રિયા પાછી લઈ શકાતી નથી.',
                    kn: 'ಮಣಿ ಮತ್ತು ಎಲ್ಲಾ ಆವೃತ್ತಿಗಳು ಅಳಿಸಲ್ಪಡುತ್ತವೆ. ಇದನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗದು.',
                  })}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setResetSheetOpen(false)}
                style={styles.confirmCancel}
                hitSlop={8}
              >
                <Text
                  style={[
                    styles.confirmCancelText,
                    {
                      color: colors.inkMuted,
                      fontFamily: scriptSerif ?? typography.cardLatin.fontFamily,
                    },
                  ]}
                >
                  {pick(lang, { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' })}
                </Text>
              </Pressable>
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>

      <AlarmEditorSheet
        state={alarmEditorOpen ? { kind: 'new' } : null}
        presetMantraId={mantra.id}
        onClose={() => setAlarmEditorOpen(false)}
        onCreate={async (draft) => {
          await addAlarm(draft);
          setAlarmEditorOpen(false);
        }}
        onSave={async (id, patch) => {
          await updateAlarm(id, patch);
          setAlarmEditorOpen(false);
        }}
        onDelete={async (id) => {
          await removeAlarm(id);
          setAlarmEditorOpen(false);
        }}
      />
    </View>
  );
}

// Mala box bounds; the fitted size lands between them (and under the width cap).
// Below ~230 the 108 beads (min radius 2.2) start to overlap on the thread.
const MALA_MAX = 330;
const MALA_MIN = 230;
// tapContent paddingVertical (2 × 8) + malaBlock marginTop (4).
const TAP_CHROME_H = 20;

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: spacing.readingGutter,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alarmBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmGlyph: {
    fontSize: 15,
    includeFontPadding: false,
  },
  backGlyph: {
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
    includeFontPadding: false,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  titleHi: {
    includeFontPadding: false,
    textAlign: 'center',
  },
  titleEn: {
    fontStyle: 'italic',
    includeFontPadding: false,
    textAlign: 'center',
    marginTop: 2,
  },
  tapArea: {
    flex: 1,
  },
  tapScroll: {
    // flexGrow lets the tap surface fill the viewport (tappable everywhere) yet
    // grow past it so a long/large mantra scrolls instead of clipping.
    flexGrow: 1,
  },
  tapAreaPressed: {
    opacity: 0.92,
  },
  tapContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headBlock: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  mantraBlock: {
    alignItems: 'center',
  },
  mantraLine: {
    textAlign: 'center',
    // No includeFontPadding:false here — this line is Devanagari, and on Android
    // that prop strips the padding reserved for the shirorekha/top-matras and
    // clips them (iOS ignores the prop, so it only shows on Android).
  },
  mantraLineEn: {
    textAlign: 'center',
    fontStyle: 'italic',
    includeFontPadding: false,
    marginTop: 6,
  },
  malaBlock: {
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
  },
  unmeasured: {
    opacity: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingLeft: 20,
    paddingRight: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  statsDivider: {
    width: 1,
    height: 28,
  },
  todayLabel: {
    flex: 1,
    fontSize: 14,
    includeFontPadding: false,
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioRow: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  sheetGrip: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    textAlign: 'center',
    includeFontPadding: false,
    marginBottom: 14,
  },
  sheetOption: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    minHeight: 60,
    justifyContent: 'center',
  },
  sheetOptionTitle: {
    fontSize: 15,
    includeFontPadding: false,
  },
  sheetOptionBody: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  confirmCancel: {
    marginTop: 2,
    paddingVertical: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.85,
  },
});

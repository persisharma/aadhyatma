import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { spacing } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, pick, verseLinesByLang } from '@/utils/localize';
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
import BackgroundLayer from '@/components/BackgroundLayer';
import AppIcon from '@/components/AppIcon';
import JapamAudioPlayer from '@/components/JapamAudioPlayer';
import JapamMala, { JapamMalaTray } from '@/components/JapamMala';
import JapamInfinity from '@/components/JapamInfinity';
import { japaAutoCountSource } from '@/components/japamInfinityPlayback';
import { infinityRecitationMs, normalizeJapaRate, recitationUnits } from '@/components/japamRecitationTiming';
import KaraokeText from '@/components/KaraokeText';
import { compactJapamReadingLines } from '@/components/japamReadingLayout';
import { LinearGradient } from 'expo-linear-gradient';
import { useJapamStyle, type JapamStyle } from '@/utils/useJapamStyle';
import { useJapamControls } from '@/utils/useJapamControls';
import LanguageToggle from '@/components/LanguageToggle';
import Ornament from '@/components/Ornament';
import ShareButton from '@/components/ShareButton';
import { AlarmEditorSheet } from '@/screens/JapamAlarmsScreen';
import JapaSankalpSheet from '@/components/JapaSankalpSheet';
import JapaSankalpRow from '@/components/JapaSankalpRow';
import { fitMalaBesideRail, fitMandalaBesideRail, RAIL_CLEARANCE } from '@/components/japamControlRail';
import { SANKALP_COPY, sankalpA11yLabel } from '@/components/japaSankalpCopy';
import { useShare } from '@/utils/shareVerse';
import { useRatingAsk } from '@/contexts/ratingAsk';
import { useReducedMotion } from '@/utils/useReducedMotion';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JapamCounter'>;
const japaWordWeight = (word: string) => recitationUnits([word]);

export default function JapamCounterScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const {
    getEntry, increment, resetBeads, clear, isLoading: counterLoading,
    getSankalp, takeSankalp, releaseSankalp,
  } = useJapamCounter();
  const { addAlarm, updateAlarm, removeAlarm } = useJapamAlarms();
  const { share, busy: shareBusy } = useShare();
  const requestRatingAsk = useRatingAsk();
  const { factor } = useFontScale();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  // Full screen pads past the notch/home indicator; zeros when no provider is mounted.
  const insets = React.useContext(SafeAreaInsetsContext) ?? NO_INSETS;
  const { style: japaStyle, ready: styleReady, selectStyle } = useJapamStyle();
  // The control column is open by default; minimising it is remembered.
  const { open: controlsOpen, ready: controlsReady, setOpen: setControlsOpen } = useJapamControls();
  const showControls = controlsReady && controlsOpen;
  // Full screen (§35): only the mala or the Infinity frame, over everything —
  // an overlay, so the screen underneath (and the tab bar) never resizes.
  const [fullScreen, setFullScreen] = useState(false);
  const [fullHint, setFullHint] = useState(false);
  const fullHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The faint enter icon sits at the view's top-right (end of the Mala/Anant row);
  // the exit icon takes its place on screen, so one corner opens and closes.
  const fullEnterRef = useRef<View>(null);
  const [fullExitTop, setFullExitTop] = useState<number | null>(null);
  const enterFullScreen = useCallback(() => {
    setFullScreen(true);
    setFullHint(true);
    if (fullHintTimer.current) clearTimeout(fullHintTimer.current);
    fullHintTimer.current = setTimeout(() => setFullHint(false), 2500);
    const node = fullEnterRef.current as { measureInWindow?: (cb: (x: number, y: number) => void) => void } | null;
    if (typeof node?.measureInWindow === 'function') {
      node.measureInWindow((_x, y) => setFullExitTop(Number.isFinite(y) ? y : null));
    }
  }, []);
  const exitFullScreen = useCallback(() => {
    if (fullHintTimer.current) clearTimeout(fullHintTimer.current);
    fullHintTimer.current = null;
    setFullHint(false);
    setFullScreen(false);
  }, []);
  useEffect(() => () => {
    if (fullHintTimer.current) clearTimeout(fullHintTimer.current);
  }, []);
  const [infinityRunning, setInfinityRunning] = useState(false);
  const [infinityPhase] = useState(() => new Animated.Value(0));
  const [tempo, setTempo] = useState({ mantraId: route.params.mantraId, rate: 1 });
  const chantRate = tempo.mantraId === route.params.mantraId ? tempo.rate : 1;
  const setChantRate = useCallback((rate: number) => {
    setTempo({ mantraId: route.params.mantraId, rate: normalizeJapaRate(rate) });
  }, [route.params.mantraId]);
  const [audioCadence, setAudioCadence] = useState<{ mantraId: string; durationMs: number } | null>(null);
  const cadenceMantraRef = useRef(route.params.mantraId);
  cadenceMantraRef.current = route.params.mantraId;
  const receiveAudioCadence = useCallback((mantraId: string, durationMs: number) => {
    if (mantraId !== cadenceMantraRef.current || !Number.isFinite(durationMs) || durationMs <= 0) return;
    setAudioCadence(previous => previous?.mantraId === mantraId && previous.durationMs === durationMs
      ? previous : { mantraId, durationMs });
  }, []);
  // The Infinity mandala rests when paused, blurred or in the background.
  const [screenFocused, setScreenFocused] = useState(true);
  useLayoutEffect(() => {
    setInfinityRunning(false);
    infinityPhase.stopAnimation();
    infinityPhase.setValue(0);
  }, [japaStyle, route.params.mantraId, infinityPhase]);

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
  // the mantra above it, so the ring never runs past the stats row. Completed rounds
  // and reset live in that fixed row and the hint sits inside the
  // ring, so nothing below the ring can grow mid-japa and make it jump.
  // Window-height breakpoints can't do this: the tab bar, mantra length and M/L
  // size all eat into the same viewport. Below MALA_MIN the surface scrolls
  // instead of shrinking the beads further.
  const [tapViewportH, setTapViewportH] = useState(0);
  const [headH, setHeadH] = useState(0);
  const measured = tapViewportH > 0 && headH > 0;
  const fitH = tapViewportH - headH - TAP_CHROME_H;
  const fittedMala = Math.round(
    Math.min(windowWidth - 2 * spacing.xxl, MALA_MAX, measured ? Math.max(MALA_MIN, fitH) : MALA_MAX)
  );
  // The control column (speedometer, ▶/❚❚, ↺) stands in the tap area's bottom-
  // right corner. From the same measurement, the ring shrinks only as far as it
  // must for its beads, Sumeru and rotating tassel to clear it — computed before
  // the ring is revealed, so it never resizes on screen.
  const malaSize = measured
    ? fitMalaBesideRail({ width: windowWidth, viewport: tapViewportH, head: headH, size: fittedMala, min: MALA_MIN })
    : fittedMala;
  // Infinity: the frame (280–340) likewise, sized from the viewport alone and
  // held hidden until the viewport is known.
  const mandalaSize = tapViewportH > 0
    ? fitMandalaBesideRail({ width: windowWidth, viewport: tapViewportH, size: Math.min(windowWidth - 24, 340), min: 280 })
    : Math.min(windowWidth - 24, 340);

  const mantra: JapamMantra | null = useMemo(
    () => findJapamMantra(route.params.mantraId),
    [route.params.mantraId]
  );
  const displayedLines = useMemo(() => verseLinesByLang(lang, mantra?.lines ?? [], mantra?.linesEn ?? []), [lang, mantra]);
  const compactReadingLines = useMemo(() => compactJapamReadingLines(displayedLines), [displayedLines]);

  React.useEffect(() => {
    if (!mantra) {
      const id = setTimeout(() => navigation.goBack(), 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [mantra, navigation]);

  const entry = getEntry(mantra?.id ?? '__none__');
  // Japa sankalp (§35.2): a one-time per-mantra vow; progress accrues in the provider.
  const sankalp = getSankalp(mantra?.id ?? '__none__');
  const [sankalpSheetOpen, setSankalpSheetOpen] = useState(false);
  const [resetSheetOpen, setResetSheetOpen] = useState(false);
  const [alarmEditorOpen, setAlarmEditorOpen] = useState(false);
  const lastRoundRef = useRef(entry.rounds);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const infinityCycleMs = useMemo(() => infinityRecitationMs(mantra?.lines ?? [], chantRate,
    audioPlaying && audioCadence?.mantraId === mantra?.id ? audioCadence?.durationMs : null),
  [mantra, chantRate, audioPlaying, audioCadence]);
  const autoSourceRef = useRef(japaAutoCountSource(japaStyle, infinityRunning, audioPlaying));
  autoSourceRef.current = japaAutoCountSource(japaStyle, infinityRunning, audioPlaying);
  // Naam japa (a single divine name, e.g. राधा): the name reads large and gives
  // a small pulse on every bead, so each name visibly lands on the mala.
  const naam = mantra?.naam === true;
  // Sloka japa (§35.1): one shloka of a stotram, chanted like a mantra. Its
  // name (stotra · shloka N) sits under the lines, as naam japa's does.
  const sloka = mantra?.sloka ?? null;
  const reduceMotion = useReducedMotion();
  const nameBeat = useRef(new Animated.Value(1)).current;
  // Every completed Infinity loop also lands visibly for mantras and shlokas
  // (gently: multi-line text must stay inside the page gutters), so completion
  // feedback matches naam japa. Mala keeps its bead motion as the per-tap cue.
  const beatScale = naam ? 1.14 : japaStyle === 'infinity' ? 1.04 : null;
  const lastBeatRef = useRef<{ id: string; beat: string } | null>(null);
  const beatId = mantra?.id ?? '';
  useEffect(() => {
    // No pulse for the count restored on open, a mantra or style switch, only for beads chanted here.
    if (counterLoading) {
      lastBeatRef.current = null;
      return;
    }
    const beat = `${entry.count}|${entry.rounds}`;
    const previous = lastBeatRef.current;
    lastBeatRef.current = { id: beatId, beat };
    if (!previous || previous.id !== beatId || previous.beat === beat || beatScale === null || reduceMotion) return;
    nameBeat.setValue(beatScale);
    Animated.timing(nameBeat, {
      toValue: 1,
      duration: 460,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
      // Repeats every Infinity loop: never hold InteractionManager work back.
      isInteraction: false,
    }).start();
  }, [counterLoading, beatId, entry.count, entry.rounds, beatScale, reduceMotion, nameBeat]);
  // Brief "turn the mala" notice when a round completes at the Sumeru.
  const [sumeruNotice, setSumeruNotice] = useState(false);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    },
    []
  );
  // A sankalp reaching its target here (not one restored complete on open, nor a
  // mantra switch) gets a Success haptic and briefly takes the ring's notice slot.
  // Reaching the target also pauses automatic chanting (Infinity loops and the
  // recording), so an unattended session never keeps adding beads past the vow.
  const [sankalpNotice, setSankalpNotice] = useState(false);
  const [audioStopToken, setAudioStopToken] = useState(0);
  const infinityRunningRef = useRef(infinityRunning);
  infinityRunningRef.current = infinityRunning;
  const audioPlayingRef = useRef(audioPlaying);
  audioPlayingRef.current = audioPlaying;
  const sankalpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSankalpRef = useRef<{ id: string; complete: boolean } | null>(null);
  const sankalpComplete = sankalp?.completedAt !== undefined;
  useEffect(() => {
    if (counterLoading) {
      lastSankalpRef.current = null;
      return;
    }
    const previous = lastSankalpRef.current;
    lastSankalpRef.current = { id: beatId, complete: sankalpComplete };
    if (!previous || previous.id !== beatId || previous.complete || !sankalpComplete) return;
    const autoChanting = infinityRunningRef.current || audioPlayingRef.current;
    setInfinityRunning(false);
    if (audioPlayingRef.current) setAudioStopToken((n) => n + 1);
    setSankalpNotice(true);
    if (sankalpTimerRef.current) clearTimeout(sankalpTimerRef.current);
    sankalpTimerRef.current = setTimeout(() => setSankalpNotice(false), 3200);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    AccessibilityInfo.announceForAccessibility(
      autoChanting ? 'Japa sankalp complete. Automatic chanting paused.' : 'Japa sankalp complete.'
    );
  }, [counterLoading, beatId, sankalpComplete]);
  useEffect(
    () => () => {
      if (sankalpTimerRef.current) clearTimeout(sankalpTimerRef.current);
    },
    []
  );
  /** Did the user complete at least one full mala while this screen was open? */
  const completedRoundThisVisitRef = useRef(false);

  // Automatic counts (an Infinity loop or a recording's repetition) arrive with
  // no finger on the glass, often seconds apart. iOS (expo-haptics) builds a new
  // generator and fires it at once, so after a long gap the Taptic Engine is
  // cold and a Light tick is easy to miss: shlokas and long mantras felt silent
  // while 0.88 s naam loops kept the engine warm. They get a Medium tick instead.
  const registerBead = useCallback(
    (beads: number = 1, source: 'tap' | 'auto' = 'tap') => {
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
        Haptics.impactAsync(source === 'auto' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light)
          .catch(() => undefined);
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
    useCallback(() => {
      setScreenFocused(true);
      return () => {
        setScreenFocused(false);
        setInfinityRunning(false);
        if (completedRoundThisVisitRef.current) {
          completedRoundThisVisitRef.current = false;
          requestRatingAskRef.current('mala-complete');
        }
      };
    }, [])
  );

  // Mala taps count a bead; Infinity taps only toggle continuous visual motion.
  const handleTap = useCallback(() => {
    if (japaStyle === 'infinity') setInfinityRunning((value) => !value);
    else registerBead(1);
  }, [japaStyle, registerBead]);
  const handleInfinityCycle = useCallback(() => {
    if (autoSourceRef.current === 'motion') registerBead(1, 'auto');
  }, [registerBead]);
  const handleAudioIteration = useCallback((beads: number) => {
    if (autoSourceRef.current === 'audio') registerBead(beads, 'auto');
  }, [registerBead]);

  if (!mantra) {
    return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;
  }

  const titleEn = mantra.nameEn;
  // The mantra itself is shown once, in the tap surface; the top bar names the screen.
  const screenTitle = pick(lang, { hi: 'जपमाला', en: 'JapaMala', gu: 'જપમાળા', kn: 'ಜಪಮಾಲೆ' });

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
  const infinityCompleteLabel = pick(lang, {
    hi: 'माला पूर्ण · 108 जप', en: 'Mala complete · 108 chants',
    gu: 'માળા પૂર્ણ · 108 જપ', kn: 'ಮಾಲೆ ಪೂರ್ಣ · 108 ಜಪ',
  });
  const sankalpCompleteLabel = pick(lang, {
    hi: 'संकल्प पूर्ण 🙏', en: 'Sankalp complete 🙏', gu: 'સંકલ્પ પૂર્ણ 🙏', kn: 'ಸಂಕಲ್ಪ ಪೂರ್ಣ 🙏',
  });
  const infinityHint = infinityRunning
    ? pick(lang, { hi: 'रोकने के लिए स्पर्श करें', en: 'Tap to pause', gu: 'રોકવા માટે સ્પર્શ કરો', kn: 'ನಿಲ್ಲಿಸಲು ಸ್ಪರ್ಶಿಸಿ' })
    : pick(lang, { hi: 'शुरू करने के लिए स्पर्श करें', en: 'Tap to start', gu: 'શરૂ કરવા માટે સ્પર્શ કરો', kn: 'ಪ್ರಾರಂಭಿಸಲು ಸ್ಪರ್ಶಿಸಿ' });
  const tapHint = japaStyle === 'infinity' ? infinityHint : audioPlaying
    ? pick(lang, {
        hi: 'सुनें · मंत्र के साथ मनके आगे बढ़ते हैं',
        en: 'Listening · beads advance with the chant',
        gu: 'સાંભળો · મંત્ર સાથે મણકા આગળ વધે છે',
        kn: 'ಆಲಿಸಿ · ಮಂತ್ರದೊಂದಿಗೆ ಮಣಿಗಳು ಮುಂದುವರಿಯುತ್ತವೆ',
      })
    : sloka
      ? pick(lang, {
          hi: 'स्पर्श करें · हर श्लोक एक मनका',
          en: 'Tap · one bead per shloka',
          gu: 'સ્પર્શ કરો · દરેક શ્લોકે એક મણકો',
          kn: 'ಸ್ಪರ್ಶಿಸಿ · ಪ್ರತಿ ಶ್ಲೋಕಕ್ಕೆ ಒಂದು ಮಣಿ',
        })
    : naam
      ? pick(lang, {
          hi: 'स्पर्श करें · हर नाम एक मनका',
          en: 'Tap · one bead per name',
          gu: 'સ્પર્શ કરો · દરેક નામે એક મણકો',
          kn: 'ಸ್ಪರ್ಶಿಸಿ · ಪ್ರತಿ ನಾಮಕ್ಕೆ ಒಂದು ಮಣಿ',
        })
      : pick(lang, { hi: 'जप के लिए स्पर्श करें', en: 'Tap to chant', gu: 'જપ માટે સ્પર્શ કરો', kn: 'ಜಪಕ್ಕಾಗಿ ಸ್ಪರ್ಶಿಸಿ' });
  const resetBeadsLabel = pick(lang, { hi: 'बीज पुनः ०', en: 'Reset Beads', gu: 'મણકા ફરી ૦', kn: 'ಮಣಿ ಮರು ೦' });
  const clearAllLabel = pick(lang, { hi: 'सब साफ़', en: 'Clear All', gu: 'બધું સાફ', kn: 'ಎಲ್ಲ ತೆರವು' });
  const nothingToReset = entry.count === 0 && entry.rounds === 0;
  // Script serif for gu/kn (constrained surface keeps its own sizes); null for hi/en.
  const scriptSerif = lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada : null;
  const scriptSerifBold = lang === 'gu' ? fontFamilies.gujaratiBold : lang === 'kn' ? fontFamilies.kannadaBold : null;

  const infinityReading = <Animated.View style={{ width: '100%', transform: [{ scale: nameBeat }] }}>
    <KaraokeText lines={compactReadingLines} referenceLines={mantra.lines} wordWeight={japaWordWeight}
      progress={infinityPhase} color={colors.ink} highlightColor={colors.saffronDeep}
      fontFamily={isLatinLang(lang) ? typography.cardLatin.fontFamily : scriptSerif ?? typography.verse.fontFamily}
      fontSize={Math.round(18 * factor)} lineHeight={Math.round(30 * factor)}
      fontStyle={isLatinLang(lang) ? 'italic' : 'normal'} includeFontPadding={!isLatinLang(lang)} />
  </Animated.View>;
  const labelFont = scriptSerif ?? (isLatinLang(lang) ? typography.cardLatin.fontFamily : typography.verse.fontFamily);
  const infinityNotice = sankalpNotice ? sankalpCompleteLabel : sumeruNotice ? infinityCompleteLabel : null;
  // Keep the approved frame; the complete reader replaces its former count row.
  // Only one Infinity drives the shared phase: this one rests while full screen runs.
  const infinityVisual = japaStyle === 'infinity' ? <View style={[styles.malaBlock, tapViewportH === 0 && styles.unmeasured]}>
    <JapamInfinity key={mantra.id} count={entry.count} size={mandalaSize}
      running={infinityRunning && !fullScreen} cycleMs={infinityCycleMs} phase={infinityPhase} onCycle={handleInfinityCycle}
      railClearance={RAIL_CLEARANCE}
      notice={infinityNotice} hint={tapHint}
      ringText={displayedLines.join(' ')} ringsActive={screenFocused && !fullScreen}
      labelFontFamily={labelFont}
      reading={infinityReading} />
  </View> : null;
  // Minimise / show the control column: a faint 28 dp circle (44 dp touch area)
  // in the count bar, left of the Sankalp target. Not drawn until the remembered
  // choice is known.
  const controlsToggle = controlsReady ? (
    <Pressable
      testID="japam-controls-toggle"
      onPress={() => setControlsOpen(!controlsOpen)}
      accessibilityRole="button"
      accessibilityLabel={controlsOpen ? 'Hide controls' : 'Show controls'}
      accessibilityState={{ expanded: controlsOpen }}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 2 }}
      style={({ pressed }) => [styles.toggle, { opacity: pressed ? 0.35 : 0.55 }]}
    >
      <View style={[styles.toggleDot, { borderColor: colors.divider, backgroundColor: colors.parchmentSoft }]}>
        <AppIcon name={controlsOpen ? 'caretDown' : 'caretUp'} size={14} color={colors.inkMuted} />
      </View>
    </Pressable>
  ) : null;
  const fullMalaSize = Math.round(Math.max(MALA_MIN, Math.min(windowWidth - 48, 360, windowHeight - insets.top - insets.bottom - 240)));
  const fullHintLabel = pick(lang, {
    hi: 'बाहर निकलने के लिए देर तक दबाएँ',
    en: 'Press and hold to exit full screen',
    gu: 'બહાર નીકળવા લાંબું દબાવો',
    kn: 'ಹೊರಬರಲು ಒತ್ತಿ ಹಿಡಿಯಿರಿ',
  });


  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getSourceBackground(sloka?.sourceId ?? mantra.id)} />
      {japaStyle === 'infinity' ? <LinearGradient pointerEvents="none"
        colors={[colors.parchmentSoft, colors.parchment, colors.parchmentDeep]}
        locations={[0, 0.55, 1]} style={[StyleSheet.absoluteFill, { opacity: 0.65 }]} /> : null}
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
                    sourceId: mantra.sloka?.sourceId ?? mantra.id,
                    stanza: mantra.sloka?.chapter,
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

        <View style={styles.styleBar}>
        <View style={styles.styleChoices} accessibilityRole="radiogroup">
          {(['mala', 'infinity'] as const).map((value: JapamStyle) => {
            const label = value === 'mala'
              ? pick(lang, { hi: 'माला', en: 'Mala', gu: 'માળા', kn: 'ಮಾಲೆ' })
              : pick(lang, { hi: 'अनंत ∞', en: 'Infinity ∞', gu: 'અનંત ∞', kn: 'ಅನಂತ ∞' });
            const selected = japaStyle === value;
            return (
              <Pressable key={value} testID={`japam-style-${value}`} accessibilityRole="radio"
                accessibilityLabel={label} accessibilityState={{ selected, checked: selected, disabled: !styleReady }}
                disabled={!styleReady} onPress={() => selectStyle(value)}
                style={({ pressed }) => [styles.styleChoice, {
                  backgroundColor: selected ? colors.saffronTint : colors.parchmentSoft,
                  borderColor: selected ? colors.saffronDeep : colors.divider,
                  opacity: pressed ? 0.7 : 1,
                }]}>
                <Text style={{ textAlign: 'center', fontSize: Math.round(14 * factor),
                  fontFamily: scriptSerif ?? (isLatinLang(lang) ? typography.cardLatin.fontFamily : typography.verse.fontFamily),
                  color: selected ? colors.saffronDeep : colors.inkMuted }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
          {/* Faint full-screen icon at the view's top-right, on the column's axis (right 16).
              Kept out of the tap area so it never covers a long mantra's first line. */}
          <Pressable
            ref={fullEnterRef}
            testID="japam-fullscreen"
            onPress={enterFullScreen}
            accessibilityRole="button"
            accessibilityLabel="Full screen"
            style={({ pressed }) => [styles.fullEnter, pressed && { opacity: 0.3 }]}
          >
            <AppIcon name="fullscreen" size={18} color={colors.inkMuted} />
          </Pressable>
        </View>

        <View style={styles.tapArea}>
        <ScrollView
          style={styles.tapArea}
          contentContainerStyle={styles.tapScroll}
          onLayout={(e) => setTapViewportH(e.nativeEvent.layout.height)}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={handleTap}
            disabled={counterLoading || !styleReady}
            testID={`japam-counter-${japaStyle}`}
            accessibilityRole="button"
            accessibilityLabel={`${titleEn}. ${japaStyle === 'infinity' ? infinityHint : 'Tap to count one bead'}. ${entry.count} of ${JAPAM_BEADS_PER_ROUND} on this mala, ${entry.rounds} malas completed.`}
            accessibilityState={{ disabled: counterLoading || !styleReady }}
            style={({ pressed }) => [
              styles.tapContent,
              { paddingHorizontal: spacing.xxl },
              pressed && styles.tapAreaPressed,
            ]}
          >
            {infinityVisual}
            {japaStyle === 'mala' ? <View style={styles.headBlock} onLayout={(e) => setHeadH(e.nativeEvent.layout.height)}>
              <Animated.View style={[styles.mantraBlock, { transform: [{ scale: nameBeat }] }]}>
                {displayedLines.map((line, i) => (
                  <Text
                    key={`${lang}-${i}`}
                    style={[
                      isLatinLang(lang) ? styles.mantraLineEn : styles.mantraLine,
                      isLatinLang(lang)
                        ? {
                            color: colors.ink,
                            fontFamily: typography.cardLatin.fontFamily,
                            fontSize: naam ? Math.round(verseFontSizeEn * 1.6) : verseFontSizeEn,
                            lineHeight: naam ? Math.round(verseLineHeightEn * 1.25) : verseLineHeightEn,
                          }
                        : {
                            color: colors.ink,
                            fontFamily: scriptSerif ?? typography.verse.fontFamily,
                            fontSize: naam ? Math.round(verseFontSize * 1.5) : verseFontSize,
                            // Scale the leading with the name (the verse token's ~1.7×). The
                            // former ×1.25 left 35/49 (1.40×) at M and 39/56 at L, and iOS cut
                            // the ी loop above the shirorekha of सीता / श्री (Nov 2026 report).
                            lineHeight: naam ? Math.round(verseLineHeight * 1.5) : verseLineHeight,
                          },
                    ]}
                  >
                    {line}
                  </Text>
                ))}
              </Animated.View>
              {naam || sloka ? (
                <Text
                  style={[
                    styles.naamCaption,
                    {
                      color: colors.inkMuted,
                      fontFamily: isLatinLang(lang)
                        ? typography.cardLatin.fontFamily
                        : scriptSerif ?? typography.verse.fontFamily,
                    },
                  ]}
                >
                  {contentByLang(lang, mantra.nameHi, mantra.nameEn)}
                </Text>
              ) : null}

              <Ornament compact />
            </View> : null}

            {/* Held invisible for the first layout pass so the ring doesn't visibly snap to its fitted size. */}
            {japaStyle === 'mala' ? <View style={[styles.malaBlock, (!measured || !styleReady) && styles.unmeasured]}>
              <JapamMala
                count={entry.count}
                rounds={entry.rounds}
                size={malaSize}
                playing={audioPlaying}
                notice={sankalpNotice ? sankalpCompleteLabel : sumeruNotice ? sumeruLabel : null}
                hint={tapHint}
                labelFontFamily={scriptSerif ?? undefined}
              />
            </View> : null}
          </Pressable>
        </ScrollView>

        {/* Icon-only control column (§35): speedometer, ▶/❚❚, ↺ above the count bar's
            Sankalp target. Open by default; the count bar's toggle minimises it. The
            player owns the recording, so it stays mounted (hidden) while minimised.
            The view is sized for the open column, so minimising never resizes it. */}
        <View style={styles.railSlot} pointerEvents="box-none">
          <View testID="japam-controls" style={[styles.railColumn, !showControls && styles.hidden]}>
          <JapamAudioPlayer
            layout="rail"
            mantraId={mantra.id}
            lang={lang}
            onIteration={handleAudioIteration}
            onPlayingChange={setAudioPlaying}
            rate={chantRate}
            onRateChange={setChantRate}
            onRecitationDurationChange={receiveAudioCadence}
            showSilentTempo={japaStyle === 'infinity'}
            autoPlay={route.params.autoPlay === true}
            stopToken={audioStopToken}
          />
          <Pressable
            onPress={() => setResetSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Reset or clear the count"
            accessibilityState={{ disabled: nothingToReset }}
            disabled={nothingToReset}
            hitSlop={4}
            style={({ pressed }) => [
              styles.resetBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder },
              pressed && { opacity: 0.7 },
              nothingToReset && { opacity: 0.4 },
            ]}
          >
            <AppIcon name="reset" size={18} color={colors.saffronDeep} />
          </Pressable>
          </View>
        </View>
        </View>

        {/* Count bar: all-time malas + [controls toggle] + the Sankalp target, or — while a vow is active —
            the vow's own count in the same 56 dp row (§35.2), so nothing above moves. */}
        <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
          {sankalp && !sankalpComplete ? (
            <>
              <JapaSankalpRow
                sankalp={sankalp}
                lang={lang}
                disabled={counterLoading}
                onPress={() => setSankalpSheetOpen(true)}
              />
              {controlsToggle}
            </>
          ) : (
            <>
              <JapamMalaTray
                rounds={entry.rounds}
                label={malasDoneLabel}
                emptyLabel={firstMalaLabel}
              />
              <View style={styles.barEnd}>
              {controlsToggle}
              <Pressable
                testID="japa-sankalp-open"
                onPress={() => setSankalpSheetOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={sankalp ? `${sankalpA11yLabel(sankalp)}. Take a new sankalp or clear it.` : 'Take a japa sankalp'}
                accessibilityState={{ disabled: counterLoading }}
                disabled={counterLoading}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.resetBtn,
                  sankalp
                    ? { backgroundColor: colors.saffron, borderColor: colors.saffronDeep }
                    : { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <AppIcon name="sankalp" size={20} color={sankalp ? colors.onPrimary : colors.saffronDeep} />
              </Pressable>
              </View>
            </>
          )}
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
              {sankalp && !sankalpComplete ? (
                <Text
                  style={[
                    styles.sheetNote,
                    { color: colors.inkMuted, fontFamily: scriptSerif ?? (isLatinLang(lang) ? typography.cardLatin.fontFamily : typography.verse.fontFamily) },
                  ]}
                >
                  {pick(lang, SANKALP_COPY.keptOnReset)}
                </Text>
              ) : null}

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

      {/* Full screen: the view only, no controls. Taps count (Mala) or start/pause
          (Infinity) as usual; the faint corner icon, a long press or Back exits. */}
      <Modal
        visible={fullScreen}
        transparent
        animationType="fade"
        statusBarTranslucent
        supportedOrientations={['portrait']}
        onRequestClose={exitFullScreen}
      >
        {fullScreen ? (
          <View testID="japam-fullscreen-view" style={[StyleSheet.absoluteFill, { backgroundColor: colors.parchment }]}>
            <KeepAwakeWhileMounted />
            <StatusBar hidden animated />
            <BackgroundLayer source={getSourceBackground(sloka?.sourceId ?? mantra.id)} />
            <Pressable
              testID={`japam-full-${japaStyle}`}
              onPress={handleTap}
              onLongPress={exitFullScreen}
              delayLongPress={550}
              disabled={counterLoading}
              accessibilityRole="button"
              accessibilityLabel={`${titleEn}. ${japaStyle === 'infinity' ? infinityHint : 'Tap to count one bead'}. Press and hold to exit full screen. ${entry.count} of ${JAPAM_BEADS_PER_ROUND} on this mala, ${entry.rounds} malas completed.`}
              style={[styles.fullTap, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
            >
              {japaStyle === 'mala' ? (
                <>
                  <Animated.View style={[styles.mantraBlock, { transform: [{ scale: nameBeat }] }]}>
                    {displayedLines.map((line, i) => (
                      <Text
                        key={`full-${lang}-${i}`}
                        style={[
                          isLatinLang(lang) ? styles.mantraLineEn : styles.mantraLine,
                          isLatinLang(lang)
                            ? { color: colors.ink, fontFamily: typography.cardLatin.fontFamily, fontSize: verseFontSizeEn, lineHeight: verseLineHeightEn }
                            : { color: colors.ink, fontFamily: scriptSerif ?? typography.verse.fontFamily, fontSize: verseFontSize, lineHeight: verseLineHeight },
                        ]}
                      >
                        {line}
                      </Text>
                    ))}
                  </Animated.View>
                  <View style={styles.fullMala}>
                    <JapamMala
                      count={entry.count}
                      rounds={entry.rounds}
                      size={fullMalaSize}
                      playing={audioPlaying}
                      notice={sankalpNotice ? sankalpCompleteLabel : sumeruNotice ? sumeruLabel : null}
                      hint=""
                      labelFontFamily={scriptSerif ?? undefined}
                    />
                  </View>
                </>
              ) : (
                <JapamInfinity key={`${mantra.id}-full`} count={entry.count} size={Math.min(windowWidth - 24, 340)}
                  running={infinityRunning} cycleMs={infinityCycleMs} phase={infinityPhase} onCycle={handleInfinityCycle}
                  notice={infinityNotice} hint="" ringText={displayedLines.join(' ')} ringsActive
                  labelFontFamily={labelFont} reading={infinityReading} />
              )}
            </Pressable>
            <Pressable
              testID="japam-fullscreen-exit"
              onPress={exitFullScreen}
              accessibilityRole="button"
              accessibilityLabel="Exit full screen"
              hitSlop={8}
              style={[styles.fullExit, { top: Math.max(insets.top + 8, fullExitTop ?? 0) }]}
            >
              <AppIcon name="exitFullscreen" size={18} color={colors.inkMuted} />
            </Pressable>
            {fullHint ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[styles.fullHint, { bottom: insets.bottom + 24, color: colors.inkMuted, fontFamily: labelFont }]}
              >
                {fullHintLabel}
              </Text>
            ) : null}
          </View>
        ) : null}
      </Modal>

      <JapaSankalpSheet
        visible={sankalpSheetOpen}
        lang={lang}
        mantraName={contentByLang(lang, mantra.nameHi, mantra.nameEn)}
        sankalp={sankalp}
        onTake={(unit, amount) => {
          if (takeSankalp(mantra.id, unit, amount)) setSankalpSheetOpen(false);
        }}
        onRelease={() => {
          releaseSankalp(mantra.id);
          setSankalpSheetOpen(false);
        }}
        onClose={() => setSankalpSheetOpen(false)}
      />

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

const NO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };

/** Keeps the phone awake only while full screen is shown. */
function KeepAwakeWhileMounted() {
  useKeepAwake('japam-full-screen');
  return null;
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
  styleBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 24, paddingRight: 16, paddingBottom: 4,
    width: '100%', maxWidth: 420, alignSelf: 'center',
  },
  styleChoices: { flex: 1, flexDirection: 'row', gap: 8 },
  fullEnter: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  styleChoice: {
    flex: 1, minHeight: 44, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 22, borderWidth: 1, justifyContent: 'center',
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
  mantraFullWidth: { width: '100%' },
  mantraLine: {
    textAlign: 'center',
    // No includeFontPadding:false here — this line is Devanagari, and on Android
    // that prop strips the padding reserved for the shirorekha/top-matras and
    // clips them (iOS ignores the prop, so it only shows on Android).
  },
  naamCaption: {
    marginTop: 2,
    fontSize: 13,
    textAlign: 'center',
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
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingLeft: 20,
    paddingRight: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railSlot: {
    position: 'absolute',
    // Centred over the count bar's Sankalp target (statsRow paddingRight 16 + 44 dp).
    right: 16,
    bottom: 8,
    alignItems: 'center',
    gap: 8,
  },
  railColumn: { alignItems: 'center', gap: 8 },
  hidden: { display: 'none' },
  barEnd: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggle: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullTap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  fullMala: {
    marginTop: 16,
    alignItems: 'center',
  },
  fullExit: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  fullHint: {
    position: 'absolute',
    left: 24,
    right: 24,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
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
  sheetNote: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 12,
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

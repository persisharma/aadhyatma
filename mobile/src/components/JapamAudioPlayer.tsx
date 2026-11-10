import AppIcon from '@/components/AppIcon';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { ensureBackgroundAudioMode } from '@/audio/audioSession';
import { claimPlayback, registerStopper } from '@/audio/playbackArbiter';
import { getJapamAudioRepetitions, getJapamAudioSource } from '@assets/japam-audio';
import {
  advanceBeadProgress,
  INITIAL_BEAD_PROGRESS,
  type BeadProgress,
} from '@/components/japamBeadProgress';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import RateStepper from './RateStepper';
import JapamTempoControl from './JapamTempoControl';
import { MIN_JAPA_RATE as MIN_RATE, MAX_JAPA_RATE as MAX_RATE, japaAudioPlaybackRate } from './japamRecitationTiming';

type Props = {
  mantraId: string;
  lang: Lang;
  /** Register newly-chanted beads. Called with the number of beads completed
   *  since the last call (>= 1) — one per recitation, batched per status tick. */
  onIteration: (beads: number) => void;
  /** Start playing as soon as the audio is loaded. Used by the alarm
   *  deep-link flow so a tap on the notification drops the user into
   *  chanting without a second press. */
  autoPlay?: boolean;
  /** Told whenever the auto-chant starts or stops, so the counter can show a
   *  listening state (marker pulse, hint copy). Called with `false` on unmount. */
  onPlayingChange?: (playing: boolean) => void;
  rate?: number;
  onRateChange?: (rate: number) => void;
  /** Natural-tempo average, before applying the selected playback rate. */
  onRecitationDurationChange?: (mantraId: string, durationMs: number) => void;
  /** Infinity supports tempo adjustment even without a bundled recording. */
  showSilentTempo?: boolean;
  /** Changing this value pauses an active chant — the counter bumps it when a
   *  japa sankalp reaches its target (design.md §35.2). The value on mount is ignored. */
  stopToken?: number;
  /** `rail`: the counter's icon-only control column — speedometer above ▶/❚❚,
   *  no text (design.md §35). `row` (default): Play pill + tempo in one line. */
  layout?: 'row' | 'rail';
};

const RATE_STEP = 0.1;

// How often the wall-clock bead counter samples. Matches the audio status
// update cadence; fine-grained enough for a smooth bead cadence.
const BEAD_TICK_MS = 250;

// When the counter is opened by tapping an alarm (`autoPlay`), the mantra
// plays from the shared recording and auto-stops after this long — so the
// alarm "rings" the mantra then falls silent, rather than looping forever.
// Reuses the same bundled mp3 (no separate, size-adding alarm clip). Any
// manual play/pause cancels the cap so a real chanting session isn't cut off.
const ALARM_AUTO_STOP_MS = 30_000;

export default function JapamAudioPlayer({
  mantraId,
  lang,
  onIteration,
  autoPlay,
  onPlayingChange,
  rate,
  onRateChange,
  onRecitationDurationChange,
  showSilentTempo,
  stopToken,
  layout = 'row',
}: Props) {
  const { colors, typography, radii } = useTheme();
  const source = useMemo(() => getJapamAudioSource(mantraId), [mantraId]);

  if (source == null) {
    return <UnavailableNotice key={mantraId} lang={lang} rate={rate} layout={layout}
      onRateChange={showSilentTempo ? onRateChange : undefined} />;
  }

  return (
    <ActiveAudioPlayer
      key={mantraId}
      source={source}
      mantraId={mantraId}
      lang={lang}
      onIteration={onIteration}
      autoPlay={autoPlay}
      onPlayingChange={onPlayingChange}
      rate={rate}
      onRateChange={onRateChange}
      onRecitationDurationChange={onRecitationDurationChange}
      showSilentTempo={showSilentTempo}
      stopToken={stopToken}
      layout={layout}
      colors={colors}
      typography={typography}
      radii={radii}
    />
  );
}

type ActivePlayerProps = Props & {
  source: number;
  colors: ReturnType<typeof useTheme>['colors'];
  typography: ReturnType<typeof useTheme>['typography'];
  radii: ReturnType<typeof useTheme>['radii'];
};

function ActiveAudioPlayer({
  source,
  mantraId,
  lang,
  onIteration,
  autoPlay,
  onPlayingChange,
  rate: controlledRate,
  onRateChange,
  onRecitationDurationChange,
  showSilentTempo,
  stopToken,
  layout = 'row',
  colors,
  typography,
  radii,
}: ActivePlayerProps) {
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [localRate, setLocalRate] = useState(1.0);
  const rate = controlledRate ?? localRate;
  const setRate = onRateChange ?? setLocalRate;
  // Whether a chant session is active — our own play/pause intent, NOT the
  // native `status.playing`. On a looping clip the native flag flickers false
  // at every loop seam (and its update stream can stall), which both flickered
  // the Play button and froze the bead count. We set this true when we start
  // playback and false when we stop it, and drive the button, the listening
  // hint and the bead counter from it.
  const [chanting, setChanting] = useState(false);
  const autoPlayedRef = useRef(false);
  // How many times the recording chants the mantra per full playback. A plain
  // single-recitation clip is 1 (one bead per loop); musical renditions repeat
  // the mantra many times, so the count is spread across the clip.
  const repetitions = useMemo(() => getJapamAudioRepetitions(mantraId), [mantraId]);
  const durationRef = useRef(0);
  if (Number.isFinite(status.duration) && (status.duration ?? 0) > 0) durationRef.current = status.duration;
  const recitationMs = durationRef.current > 0 ? durationRef.current * 1000 / repetitions : 0;
  const playbackRate = japaAudioPlaybackRate(recitationMs, rate);
  // Cumulative bead-counting state (audio time played, beads emitted, last
  // clock). Advanced by the pure `advanceBeadProgress` reducer each tick.
  const progressRef = useRef<BeadProgress>(INITIAL_BEAD_PROGRESS);
  // Pending alarm auto-stop timer (see ALARM_AUTO_STOP_MS).
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearCapTimer = useCallback(() => {
    if (capTimerRef.current) {
      clearTimeout(capTimerRef.current);
      capTimerRef.current = null;
    }
  }, []);

  const onIterationRef = useRef(onIteration);
  useEffect(() => {
    onIterationRef.current = onIteration;
  }, [onIteration]);

  // Configure the global audio session once, on first mount of any player.
  useEffect(() => {
    ensureBackgroundAudioMode();
  }, []);

  // Reset playback when the mantra changes.
  useEffect(() => {
    setLocalRate(1.0);
    setChanting(false);
    autoPlayedRef.current = false;
    progressRef.current = INITIAL_BEAD_PROGRESS;
    clearCapTimer();
    if (player.isLoaded) {
      player.pause();
      player.seekTo(0).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mantraId]);

  // Configure the padded cadence before an alarm can start native playback.
  useEffect(() => {
    player.shouldCorrectPitch = true;
    player.setPlaybackRate(playbackRate, 'high');
  }, [player, playbackRate]);

  // Honour an `autoPlay` request once the file is ready. Gated on
  // `status.isLoaded` because `play()` is a no-op before the player has
  // loaded; gated on a ref so we don't re-trigger on every status update.
  // The alarm wake reuses the shared recording, so cap it at
  // ALARM_AUTO_STOP_MS — the mantra rings then stops instead of looping.
  useEffect(() => {
    if (!autoPlay || autoPlayedRef.current) return;
    if (!status.isLoaded) return;
    autoPlayedRef.current = true;
    try {
      claimPlayback('japam');
      player.play();
      setChanting(true);
      clearCapTimer();
      capTimerRef.current = setTimeout(() => {
        capTimerRef.current = null;
        try {
          player.pause();
        } catch {
          /* player may already be released */
        }
        setChanting(false);
      }, ALARM_AUTO_STOP_MS);
    } catch {
      /* next render will retry via the gate above */
    }
  }, [autoPlay, status.isLoaded, player, clearCapTimer]);

  // Use the player's native `loop` flag for the auto-chant repeat. Manually
  // restarting via `seekTo(0)` + `play()` on `didJustFinish` is unreliable on
  // iOS: after the track finishes the restart often fails to resume and
  // `didJustFinish` does not toggle back cleanly, which froze both the
  // playback and the bead count. Native looping repeats gaplessly on every
  // platform.
  useEffect(() => {
    player.loop = true;
  }, [player]);

  // Advance the bead count on a WALL CLOCK, via the pure `advanceBeadProgress`
  // reducer. A single-recitation clip (`repetitions === 1`) registers one bead
  // per loop-length of play; a musical rendition that chants the mantra
  // `repetitions` times registers one bead per equal-time segment, so the count
  // tracks the chanting rather than the multi-minute file. Counting is timer-
  // driven (not driven by `status.currentTime`) because native looping does not
  // reliably report a position wrap, and gated on our own `chanting` intent
  // (not `status.playing`) because that native flag flickers false at every loop
  // seam and its update stream can stall — which froze the count after the first
  // loop. Duration is latched to the last non-zero value so a transient 0 from
  // the native status doesn't stall the clock. A multi-bead tick is applied as
  // ONE `onIteration(delta)` call — a single atomic counter update.
  useEffect(() => {
    if (recitationMs > 0) onRecitationDurationChange?.(mantraId, recitationMs);
  }, [mantraId, recitationMs, onRecitationDurationChange]);
  const beadInputsRef = useRef({ duration: 0, repetitions, rate: playbackRate, playing: false });
  beadInputsRef.current = {
    duration: durationRef.current,
    repetitions,
    rate: playbackRate,
    playing: chanting,
  };
  useEffect(() => {
    const id = setInterval(() => {
      const inputs = beadInputsRef.current;
      const { state, delta } = advanceBeadProgress(progressRef.current, {
        nowMs: Date.now(),
        duration: inputs.duration,
        repetitions: inputs.repetitions,
        rate: inputs.rate,
        playing: inputs.playing,
      });
      progressRef.current = state;
      if (delta > 0) onIterationRef.current(delta);
    }, BEAD_TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Pause and release the global audio session when unmounting.
  useEffect(() => {
    return () => {
      clearCapTimer();
      try {
        player.pause();
      } catch {
        /* player may already be released */
      }
    };
  }, [player, clearCapTimer]);

  // Let read-aloud / the recorded player silence this loop when they start.
  useEffect(
    () =>
      registerStopper('japam', () => {
        clearCapTimer();
        try {
          player.pause();
        } catch {
          /* player may already be released */
        }
        setChanting(false);
      }),
    [player, clearCapTimer]
  );

  // A changed `stopToken` ends the chant session (a japa sankalp reached its
  // target). Ignored on mount, so remounting for a new mantra never pauses.
  const stopTokenRef = useRef(stopToken);
  useEffect(() => {
    if (stopTokenRef.current === stopToken) return;
    stopTokenRef.current = stopToken;
    clearCapTimer();
    try {
      player.pause();
    } catch {
      /* player may already be released */
    }
    setChanting(false);
  }, [stopToken, player, clearCapTimer]);

  const isPlaying = chanting;

  const onPlayingChangeRef = useRef(onPlayingChange);
  useEffect(() => {
    onPlayingChangeRef.current = onPlayingChange;
  }, [onPlayingChange]);
  useEffect(() => {
    onPlayingChangeRef.current?.(!!isPlaying);
  }, [isPlaying]);
  useEffect(() => () => onPlayingChangeRef.current?.(false), []);

  const togglePlay = useCallback(() => {
    // A deliberate tap means the user is chanting, not just hearing the alarm
    // out — drop the auto-stop so their session isn't cut off at 30 s. Toggle on
    // our own `chanting` intent, not the flicker-prone native `status.playing`.
    clearCapTimer();
    setChanting((wasChanting) => {
      if (wasChanting) {
        player.pause();
        return false;
      }
      claimPlayback('japam');
      player.play();
      return true;
    });
  }, [player, clearCapTimer]);

  const playLabel = isPlaying
    ? pick(lang, { hi: 'विराम', en: 'Pause', gu: 'વિરામ', kn: 'ವಿರಾಮ' })
    : pick(lang, { hi: 'चलाएँ', en: 'Play', gu: 'ચલાવો', kn: 'ಚಲಾಯಿಸಿ' });
  const tempoLabel = pick(lang, { hi: 'गति', en: 'Tempo', gu: 'ગતિ', kn: 'ಗತಿ' });
  const a11yPlay = isPlaying ? 'Pause auto-chant' : 'Play auto-chant';
  const labelHeadFont =
    lang === 'gu'
      ? fontFamilies.gujaratiBold
      : lang === 'kn'
        ? fontFamilies.kannadaBold
        : typography.readerTitle.fontFamily;
  const labelSubFont =
    lang === 'gu'
      ? fontFamilies.gujarati
      : lang === 'kn'
        ? fontFamilies.kannada
        : typography.cardLatin.fontFamily;

  if (layout === 'rail') {
    return (
      <View style={styles.rail}>
        <JapamTempoControl iconOnly value={rate} onChange={setRate} lang={lang} fontFamily={labelSubFont} />
        <Pressable
          testID="japam-play"
          onPress={togglePlay}
          accessibilityRole="button"
          accessibilityLabel={a11yPlay}
          accessibilityState={{ disabled: !status.isLoaded }}
          disabled={!status.isLoaded}
          hitSlop={6}
          style={({ pressed }) => [
            styles.railBtn,
            {
              backgroundColor: isPlaying ? colors.saffron : colors.parchmentSoft,
              borderColor: isPlaying ? colors.saffronDeep : colors.cardActiveBorder,
            },
            pressed && { opacity: 0.85 },
            !status.isLoaded && { opacity: 0.5 },
          ]}
        >
          <AppIcon name={isPlaying ? 'pause' : 'play'} size={18} color={isPlaying ? colors.onPrimary : colors.saffronDeep} weight="fill" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={togglePlay}
        accessibilityRole="button"
        accessibilityLabel={a11yPlay}
        accessibilityState={{ disabled: !status.isLoaded }}
        disabled={!status.isLoaded}
        hitSlop={8}
        style={({ pressed }) => [
          styles.playBtn,
          {
            backgroundColor: isPlaying ? colors.saffron : colors.parchmentSoft,
            borderColor: isPlaying ? colors.saffronDeep : colors.cardActiveBorder,
            borderRadius: radii.pill ?? 999,
          },
          pressed && { opacity: 0.85 },
          !status.isLoaded && { opacity: 0.5 },
        ]}
      >
        <AppIcon name={isPlaying ? "pause" : "play"} size={16} color={isPlaying ? colors.onPrimary : colors.iconInk} weight="fill" />
        <Text
          style={[
            styles.playLabel,
            {
              color: isPlaying ? colors.onPrimary : colors.saffronDeep,
              fontFamily: labelHeadFont,
            },
          ]}
        >
          {playLabel}
        </Text>
      </Pressable>

      {showSilentTempo ? <JapamTempoControl value={rate} onChange={setRate} lang={lang} fontFamily={labelSubFont} /> : <RateStepper
        value={rate}
        onChange={setRate}
        min={MIN_RATE}
        max={MAX_RATE}
        step={RATE_STEP}
        label={tempoLabel}
        labelFontFamily={labelSubFont}
        inlineLabel
      />}
    </View>
  );
}

function UnavailableNotice({ lang, rate = 1, onRateChange, layout = 'row' }: Pick<Props, 'lang' | 'rate' | 'onRateChange' | 'layout'>) {
  const { colors, typography } = useTheme();
  const text = pick(lang, {
    hi: 'इस मंत्र की ध्वनि उपलब्ध नहीं है',
    en: 'Audio not available',
    gu: 'આ મંત્રનો ધ્વનિ ઉપલબ્ધ નથી',
    kn: 'ಈ ಮಂತ್ರದ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ',
  });
  const noticeFont =
    lang === 'gu'
      ? fontFamilies.gujarati
      : lang === 'kn'
        ? fontFamilies.kannada
        : typography.swipeHint.fontFamily;
  if (layout === 'rail') {
    // No recording: the speedometer stays for silent Infinity; a dimmed ▶ says
    // there is nothing to play instead of the notice text.
    return (
      <View style={styles.rail}>
        {onRateChange ? <JapamTempoControl iconOnly value={rate} onChange={onRateChange} lang={lang} fontFamily={noticeFont} /> : null}
        <View
          testID="japam-play"
          accessible
          accessibilityRole="button"
          accessibilityLabel="Audio not available"
          accessibilityState={{ disabled: true }}
          style={[styles.railBtn, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, opacity: 0.45 }]}
        >
          <AppIcon name="play" size={18} color={colors.inkMuted} weight="fill" />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.wrap, !onRateChange && styles.wrapCentered]}>
      <Text
        style={[
          styles.unavailable,
          {
            color: colors.inkMuted,
            fontFamily: noticeFont,
            fontSize: typography.swipeHint.fontSize,
          },
        ]}
      >
        {text}
      </Text>
      {onRateChange ? <JapamTempoControl value={rate} onChange={onRateChange} lang={lang} fontFamily={noticeFont} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // One line: Play at the start, the inline-labelled tempo stepper at the end.
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  wrapCentered: {
    justifyContent: 'center',
  },
  // The counter's control column: speedometer above ▶/❚❚, 8 apart.
  rail: {
    alignItems: 'center',
    gap: 8,
  },
  railBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    minHeight: 44,
  },
  playGlyph: {
    fontSize: 14,
    includeFontPadding: false,
  },
  playLabel: {
    fontSize: 14,
    includeFontPadding: false,
  },
  unavailable: {
    fontStyle: 'italic',
    opacity: 0.85,
    textAlign: 'center',
  },
});

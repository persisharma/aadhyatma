import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { ensureBackgroundAudioMode } from '@/audio/audioSession';
import { getJapamAudioRepetitions, getJapamAudioSource } from '@assets/japam-audio';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';

type Props = {
  mantraId: string;
  lang: Lang;
  /** Called once per completed audio loop (= one bead). */
  onIteration: () => void;
  /** Start playing as soon as the audio is loaded. Used by the alarm
   *  deep-link flow so a tap on the notification drops the user into
   *  chanting without a second press. */
  autoPlay?: boolean;
};

const MIN_RATE = 0.5;
const MAX_RATE = 1.5;
const RATE_STEP = 0.1;

export default function JapamAudioPlayer({
  mantraId,
  lang,
  onIteration,
  autoPlay,
}: Props) {
  const { colors, typography, radii } = useTheme();
  const source = useMemo(() => getJapamAudioSource(mantraId), [mantraId]);

  if (source == null) {
    return <UnavailableNotice lang={lang} />;
  }

  return (
    <ActiveAudioPlayer
      source={source}
      mantraId={mantraId}
      lang={lang}
      onIteration={onIteration}
      autoPlay={autoPlay}
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
  colors,
  typography,
  radii,
}: ActivePlayerProps) {
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [rate, setRate] = useState(1.0);
  const autoPlayedRef = useRef(false);
  // How many times the recording chants the mantra per full playback. A plain
  // single-recitation clip is 1 (one bead per loop); musical renditions repeat
  // the mantra many times, so the count is spread across the clip.
  const repetitions = useMemo(() => getJapamAudioRepetitions(mantraId), [mantraId]);
  // Last-seen playback position and how many beads this loop has already
  // registered, used to advance the count once per repetition segment.
  const prevTimeRef = useRef(0);
  const emittedBeadsRef = useRef(0);

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
    setRate(1.0);
    autoPlayedRef.current = false;
    prevTimeRef.current = 0;
    emittedBeadsRef.current = 0;
    if (player.isLoaded) {
      player.pause();
      player.seekTo(0).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mantraId]);

  // Honour an `autoPlay` request once the file is ready. Gated on
  // `status.isLoaded` because `play()` is a no-op before the player has
  // loaded; gated on a ref so we don't re-trigger on every status update.
  useEffect(() => {
    if (!autoPlay || autoPlayedRef.current) return;
    if (!status.isLoaded) return;
    autoPlayedRef.current = true;
    try {
      player.play();
    } catch {
      /* next render will retry via the gate above */
    }
  }, [autoPlay, status.isLoaded, player]);

  // Use the player's native `loop` flag for the auto-chant repeat. Manually
  // restarting via `seekTo(0)` + `play()` on `didJustFinish` is unreliable on
  // iOS: after the track finishes the restart often fails to resume and
  // `didJustFinish` does not toggle back cleanly, which froze both the
  // playback and the bead count. Native looping repeats gaplessly on every
  // platform.
  useEffect(() => {
    player.loop = true;
  }, [player]);

  // Advance the bead count as the clip plays. A single-recitation clip
  // (`repetitions === 1`) registers one bead per completed loop; a musical
  // rendition that chants the mantra `repetitions` times is split into that
  // many equal segments and registers one bead as each segment completes, so
  // the count tracks the chanting rather than the multi-minute file.
  //
  // Segment crossings are detected from the reported position (not
  // `didJustFinish`, which is not emitted while `loop` is enabled and behaves
  // inconsistently across platforms), keeping counting reliable on iOS. The
  // loop wrap — position jumping backwards past the midpoint — closes out any
  // remaining beads for the loop, then re-seeds the counter for the new pass.
  useEffect(() => {
    if (!status.isLoaded) return;
    const duration = status.duration ?? 0;
    const current = status.currentTime ?? 0;
    if (duration <= 0) {
      prevTimeRef.current = current;
      return;
    }
    const prev = prevTimeRef.current;
    const segmentsAt = (t: number) =>
      Math.min(repetitions, Math.floor((t / duration) * repetitions));
    const wrapped =
      status.playing && prev > duration * 0.5 && current + duration * 0.4 < prev;
    if (wrapped) {
      // Finish the loop (every remaining repetition), then account for any
      // segments already elapsed at the new position.
      for (let k = emittedBeadsRef.current; k < repetitions; k++) {
        onIterationRef.current();
      }
      const seeded = segmentsAt(current);
      for (let k = 0; k < seeded; k++) onIterationRef.current();
      emittedBeadsRef.current = seeded;
    } else if (status.playing) {
      const reached = segmentsAt(current);
      for (let k = emittedBeadsRef.current; k < reached; k++) {
        onIterationRef.current();
      }
      if (reached > emittedBeadsRef.current) emittedBeadsRef.current = reached;
    }
    prevTimeRef.current = current;
  }, [status.currentTime, status.duration, status.isLoaded, status.playing, repetitions]);

  useEffect(() => {
    player.shouldCorrectPitch = true;
    player.setPlaybackRate(rate, 'high');
  }, [player, rate]);

  // Pause and release the global audio session when unmounting.
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {
        /* player may already be released */
      }
    };
  }, [player]);

  const isPlaying = status.playing;

  const togglePlay = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, status.playing]);

  const decreaseRate = useCallback(() => {
    setRate((r) => Math.max(MIN_RATE, +(r - RATE_STEP).toFixed(2)));
  }, []);

  const increaseRate = useCallback(() => {
    setRate((r) => Math.min(MAX_RATE, +(r + RATE_STEP).toFixed(2)));
  }, []);

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
        <Text
          style={[
            styles.playGlyph,
            {
              color: isPlaying ? colors.onPrimary : colors.saffronDeep,
            },
          ]}
        >
          {isPlaying ? '❚❚' : '▶'}
        </Text>
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

      <View style={styles.tempoBlock}>
        <Text
          style={[
            styles.tempoLabel,
            {
              color: colors.inkMuted,
              fontFamily: labelSubFont,
            },
          ]}
        >
          {tempoLabel}
        </Text>
        <View style={styles.tempoRow}>
          <Pressable
            onPress={decreaseRate}
            accessibilityRole="button"
            accessibilityLabel="Slower"
            accessibilityState={{ disabled: rate <= MIN_RATE + 1e-3 }}
            disabled={rate <= MIN_RATE + 1e-3}
            hitSlop={8}
            style={({ pressed }) => [
              styles.tempoBtn,
              {
                borderColor: colors.divider,
                borderRadius: radii.md,
              },
              pressed && { opacity: 0.7 },
              rate <= MIN_RATE + 1e-3 && { opacity: 0.4 },
            ]}
          >
            <Text style={[styles.tempoGlyph, { color: colors.inkSoft }]}>−</Text>
          </Pressable>

          <Text
            style={[
              styles.tempoValue,
              {
                color: colors.ink,
                fontFamily: typography.pageCounter.fontFamily,
              },
            ]}
          >
            {rate.toFixed(1)}×
          </Text>

          <Pressable
            onPress={increaseRate}
            accessibilityRole="button"
            accessibilityLabel="Faster"
            accessibilityState={{ disabled: rate >= MAX_RATE - 1e-3 }}
            disabled={rate >= MAX_RATE - 1e-3}
            hitSlop={8}
            style={({ pressed }) => [
              styles.tempoBtn,
              {
                borderColor: colors.divider,
                borderRadius: radii.md,
              },
              pressed && { opacity: 0.7 },
              rate >= MAX_RATE - 1e-3 && { opacity: 0.4 },
            ]}
          >
            <Text style={[styles.tempoGlyph, { color: colors.inkSoft }]}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function UnavailableNotice({ lang }: { lang: Lang }) {
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
  return (
    <View style={styles.wrap}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
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
  tempoBlock: {
    alignItems: 'center',
  },
  tempoLabel: {
    fontSize: 11,
    fontStyle: 'italic',
    includeFontPadding: false,
    marginBottom: 4,
  },
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tempoBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempoGlyph: {
    fontSize: 18,
    lineHeight: 20,
    includeFontPadding: false,
  },
  tempoValue: {
    fontSize: 14,
    minWidth: 38,
    textAlign: 'center',
    includeFontPadding: false,
  },
  unavailable: {
    fontStyle: 'italic',
    opacity: 0.85,
    textAlign: 'center',
  },
});

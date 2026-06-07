import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { useTheme } from '@/theme/ThemeContext';
import { getJapamAudioSource } from '@assets/japam-audio';

type Props = {
  mantraId: string;
  lang: 'hi' | 'en';
  /** Called once per completed audio loop (= one bead). */
  onIteration: () => void;
};

const MIN_RATE = 0.5;
const MAX_RATE = 1.5;
const RATE_STEP = 0.1;

let audioModeConfigured = false;
async function ensureBackgroundAudioMode() {
  if (audioModeConfigured) return;
  audioModeConfigured = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
      interruptionModeAndroid: 'duckOthers',
    });
  } catch {
    audioModeConfigured = false;
  }
}

export default function JapamAudioPlayer({ mantraId, lang, onIteration }: Props) {
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
  colors,
  typography,
  radii,
}: ActivePlayerProps) {
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [rate, setRate] = useState(1.0);

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
    if (player.isLoaded) {
      player.pause();
      player.seekTo(0).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mantraId]);

  // Use the player's native `loop` flag for the auto-chant repeat. Manually
  // restarting via `seekTo(0)` + `play()` on `didJustFinish` is unreliable on
  // iOS: after the track finishes the restart often fails to resume and
  // `didJustFinish` does not toggle back cleanly, which froze both the
  // playback and the bead count. Native looping repeats gaplessly on every
  // platform.
  useEffect(() => {
    player.loop = true;
  }, [player]);

  // Count one bead per completed recitation by detecting the loop wrap: the
  // reported position jumps backwards toward the start after passing the
  // midpoint of the track. This does not depend on `didJustFinish` (which is
  // not emitted while `loop` is enabled, and behaves inconsistently across
  // platforms), so counting stays reliable on iOS.
  const prevTimeRef = useRef(0);
  useEffect(() => {
    if (!status.isLoaded) return;
    const duration = status.duration ?? 0;
    const current = status.currentTime ?? 0;
    if (duration <= 0) {
      prevTimeRef.current = current;
      return;
    }
    const prev = prevTimeRef.current;
    const wrapped =
      status.playing &&
      prev > duration * 0.5 &&
      current + duration * 0.4 < prev;
    if (wrapped) {
      onIterationRef.current();
    }
    prevTimeRef.current = current;
  }, [status.currentTime, status.duration, status.isLoaded, status.playing]);

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

  const playLabel = lang === 'hi' ? (isPlaying ? 'विराम' : 'चलाएँ') : isPlaying ? 'Pause' : 'Play';
  const tempoLabel = lang === 'hi' ? 'गति' : 'Tempo';
  const a11yPlay = isPlaying ? 'Pause auto-chant' : 'Play auto-chant';

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
              fontFamily: typography.readerTitle.fontFamily,
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
              fontFamily: typography.cardLatin.fontFamily,
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

function UnavailableNotice({ lang }: { lang: 'hi' | 'en' }) {
  const { colors, typography } = useTheme();
  const text =
    lang === 'hi'
      ? 'इस मंत्र की ध्वनि उपलब्ध नहीं है'
      : 'Audio not available';
  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.unavailable,
          {
            color: colors.inkMuted,
            fontFamily: typography.swipeHint.fontFamily,
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

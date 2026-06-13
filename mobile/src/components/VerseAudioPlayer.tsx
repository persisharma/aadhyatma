import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTheme } from '@/theme/ThemeContext';
import { ensureBackgroundAudioMode } from '@/audio/audioMode';
import {
  clampVerseIndex,
  findVerseIndexAtMs,
  segmentStartMs,
} from '@/audio/segments';
import { getSectionAudio } from '@/data/audio/registry';
import type { SectionAudio } from '@/data/audio/types';

type Props = {
  sourceId: string;
  /** Verse the user is currently viewing; a change here seeks the audio. */
  userVerseIndex: number;
  /** Fired when playback advances into a new verse so the reader can follow. */
  onAudioVerseChange: (index: number) => void;
  lang: 'hi' | 'en';
};

/**
 * Bottom-anchored recitation player for a reader. Bundle-only (PRD-02): the
 * single per-section `.m4a` is played from `[startMs,endMs)` segments. Renders
 * nothing for sections without a bundled recitation, so it never becomes a
 * dead control during the staged content rollout.
 */
export default function VerseAudioPlayer({
  sourceId,
  userVerseIndex,
  onAudioVerseChange,
  lang,
}: Props) {
  const audio = getSectionAudio(sourceId);
  if (audio == null || audio.asset == null) return null;
  return (
    <ActivePlayer
      audio={audio}
      asset={audio.asset}
      userVerseIndex={userVerseIndex}
      onAudioVerseChange={onAudioVerseChange}
      lang={lang}
    />
  );
}

function ActivePlayer({
  audio,
  asset,
  userVerseIndex,
  onAudioVerseChange,
  lang,
}: {
  audio: SectionAudio;
  asset: number;
  userVerseIndex: number;
  onAudioVerseChange: (index: number) => void;
  lang: 'hi' | 'en';
}) {
  const { colors, typography, radii } = useTheme();
  const player = useAudioPlayer(asset, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const { segments, durationMs } = audio;
  const verseCount = segments.length;

  const reportedIndexRef = useRef(userVerseIndex);
  const appliedUserIndexRef = useRef<number>(-1);
  const onChangeRef = useRef(onAudioVerseChange);
  useEffect(() => {
    onChangeRef.current = onAudioVerseChange;
  }, [onAudioVerseChange]);

  useEffect(() => {
    ensureBackgroundAudioMode();
  }, []);

  // User swiped to a different verse → seek there (keeps current play/pause
  // state). Guarded by a ref so unrelated re-renders don't re-seek.
  useEffect(() => {
    if (appliedUserIndexRef.current === userVerseIndex) return;
    appliedUserIndexRef.current = userVerseIndex;
    reportedIndexRef.current = userVerseIndex;
    const ms = segmentStartMs(segments, userVerseIndex);
    player.seekTo(ms / 1000).catch(() => undefined);
  }, [userVerseIndex, segments, player]);

  // Playback crossed into a new verse → tell the reader to follow. Only while
  // actually playing, so paused seeks/scrubs don't yank the page.
  useEffect(() => {
    if (!status.playing) return;
    const idx = findVerseIndexAtMs(segments, status.currentTime * 1000);
    if (idx !== reportedIndexRef.current) {
      reportedIndexRef.current = idx;
      onChangeRef.current(idx);
    }
  }, [status.playing, status.currentTime, segments]);

  // Stop at the end so the next tap replays from the visible verse.
  useEffect(() => {
    if (status.didJustFinish) {
      player.pause();
      player.seekTo(segmentStartMs(segments, reportedIndexRef.current) / 1000).catch(
        () => undefined
      );
    }
  }, [status.didJustFinish, player, segments]);

  useEffect(
    () => () => {
      try {
        player.pause();
      } catch {
        /* already released */
      }
    },
    [player]
  );

  const togglePlay = useCallback(() => {
    if (status.playing) player.pause();
    else player.play();
  }, [player, status.playing]);

  const skip = useCallback(
    (delta: number) => {
      const current = findVerseIndexAtMs(segments, status.currentTime * 1000);
      const target = clampVerseIndex(current + delta, verseCount);
      reportedIndexRef.current = target;
      player.seekTo(segmentStartMs(segments, target) / 1000).catch(() => undefined);
      onChangeRef.current(target);
    },
    [segments, verseCount, status.currentTime, player]
  );

  const isPlaying = status.playing;
  const progress =
    durationMs > 0 ? Math.min(1, (status.currentTime * 1000) / durationMs) : 0;

  const playLabel = lang === 'hi' ? (isPlaying ? 'विराम' : 'पाठ सुनें') : isPlaying ? 'Pause' : 'Play';
  const attribution = lang === 'hi' ? audio.artistHi : audio.artistEn;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider }]}>
      <View style={styles.controls}>
        <Pressable
          onPress={() => skip(-1)}
          accessibilityRole="button"
          accessibilityLabel="Previous verse"
          hitSlop={10}
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.skipGlyph, { color: colors.inkSoft }]}>‹‹</Text>
        </Pressable>

        <Pressable
          onPress={togglePlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause recitation' : 'Play recitation'}
          accessibilityState={{ selected: isPlaying, disabled: !status.isLoaded }}
          disabled={!status.isLoaded}
          hitSlop={8}
          style={({ pressed }) => [
            styles.playBtn,
            {
              backgroundColor: isPlaying ? colors.saffron : colors.parchment,
              borderColor: isPlaying ? colors.saffronDeep : colors.cardActiveBorder ?? colors.divider,
              borderRadius: radii.pill ?? 999,
            },
            pressed && { opacity: 0.85 },
            !status.isLoaded && { opacity: 0.5 },
          ]}
        >
          <Text style={[styles.playGlyph, { color: isPlaying ? colors.onPrimary : colors.saffronDeep }]}>
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

        <Pressable
          onPress={() => skip(1)}
          accessibilityRole="button"
          accessibilityLabel="Next verse"
          hitSlop={10}
          style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.skipGlyph, { color: colors.inkSoft }]}>››</Text>
        </Pressable>
      </View>

      <View style={[styles.track, { backgroundColor: colors.divider }]}>
        <View style={[styles.fill, { backgroundColor: colors.saffron, width: `${progress * 100}%` }]} />
      </View>

      {attribution ? (
        <Text
          style={[
            styles.attribution,
            { color: colors.inkMuted, fontFamily: typography.swipeHint.fontFamily },
          ]}
          numberOfLines={1}
        >
          {attribution}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 22,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
    gap: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  skipBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipGlyph: {
    fontSize: 20,
    includeFontPadding: false,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  playGlyph: {
    fontSize: 13,
    includeFontPadding: false,
  },
  playLabel: {
    fontSize: 14,
    includeFontPadding: false,
  },
  track: {
    height: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    borderRadius: 999,
  },
  attribution: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import {
  MAX_RATE,
  MIN_RATE,
  SKIP_SECONDS,
  useAudioPlayerContext,
} from '@/contexts/AudioPlayerContext';

const RATE_STEP = 0.1;

function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

/**
 * Full-screen now-playing surface. Mounted once at the app root and shown when
 * `nowPlayingOpen` is set (by tapping the mini-player), so it overlays any
 * tab/stack without navigation plumbing.
 */
export default function NowPlayingScreen() {
  const { colors, radii, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const {
    currentTrack,
    nowPlayingOpen,
    isPlaying,
    positionSec,
    durationSec,
    rate,
    isLooping,
    togglePlay,
    seekTo,
    skipBy,
    skipToNext,
    skipToPrevious,
    setRate,
    toggleLoop,
    closeNowPlaying,
  } = useAudioPlayerContext();

  const [barWidth, setBarWidth] = useState(0);

  if (!nowPlayingOpen || !currentTrack) return null;

  const title = contentByLang(lang, currentTrack.titleHi, currentTrack.titleEn);
  const subtitle = currentTrack.artistEn ?? (currentTrack.kind === 'recitation' ? 'Recitation' : 'Bhajan');
  const progress = durationSec > 0 ? Math.min(1, positionSec / durationSec) : 0;

  const tempoLabel = pick(lang, { hi: 'गति', en: 'Tempo', gu: 'ગતિ', kn: 'ಗತಿ' });
  const downloadLabel = pick(lang, {
    hi: 'ऑफ़लाइन सहेजें',
    en: 'Save offline',
    gu: 'ઑફલાઇન સાચવો',
    kn: 'ಆಫ್‌ಲೈನ್ ಉಳಿಸಿ',
  });
  const headerLabel = pick(lang, { hi: 'अभी बज रहा है', en: 'Now Playing', gu: 'હમણાં વાગે છે', kn: 'ಈಗ ಪ್ಲೇ ಆಗುತ್ತಿದೆ' });

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={closeNowPlaying}
            accessibilityRole="button"
            accessibilityLabel="Minimize player"
            hitSlop={16}
            style={({ pressed }) => [
              styles.headerBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={[styles.headerGlyph, { color: colors.inkSoft }]}>⌄</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.inkMuted, fontFamily: typography.swipeHint.fontFamily }]}>
            {headerLabel}
          </Text>
          <View style={styles.headerBtn} />
        </View>

        {/* Artwork */}
        <View style={styles.artworkWrap}>
          <View
            style={[
              styles.artwork,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
            ]}
          >
            <Text style={[styles.artworkGlyph, { color: colors.saffron }]}>ॐ</Text>
          </View>
        </View>

        {/* Title */}
        <Text numberOfLines={2} style={[styles.title, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily }]}>
          {subtitle}
        </Text>

        {/* Seek bar */}
        <View style={styles.seekBlock}>
          <Pressable
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            onPress={(e) => {
              if (barWidth > 0 && durationSec > 0) {
                seekTo((e.nativeEvent.locationX / barWidth) * durationSec);
              }
            }}
            accessibilityRole="adjustable"
            accessibilityLabel="Seek"
            style={styles.seekHit}
          >
            <View style={[styles.seekTrack, { backgroundColor: colors.divider }]}>
              <View style={[styles.seekFill, { backgroundColor: colors.saffron, width: `${progress * 100}%` }]} />
            </View>
          </Pressable>
          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily }]}>
              {fmt(positionSec)}
            </Text>
            <Text style={[styles.time, { color: colors.inkMuted, fontFamily: typography.pageCounter.fontFamily }]}>
              {fmt(durationSec)}
            </Text>
          </View>
        </View>

        {/* Transport controls */}
        <View style={styles.controls}>
          <ControlButton label={`−${SKIP_SECONDS}`} small onPress={() => skipBy(-SKIP_SECONDS)} color={colors.inkSoft} a11y="Rewind 15 seconds" />
          <ControlButton label="◀◀" onPress={skipToPrevious} color={colors.inkSoft} a11y="Previous track" />
          <Pressable
            onPress={togglePlay}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            style={({ pressed }) => [
              styles.playBtn,
              { backgroundColor: colors.saffron, borderColor: colors.saffronDeep, borderRadius: radii.pill },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={[styles.playGlyph, { color: colors.onPrimary }]}>{isPlaying ? '❚❚' : '▶'}</Text>
          </Pressable>
          <ControlButton label="▶▶" onPress={skipToNext} color={colors.inkSoft} a11y="Next track" />
          <ControlButton label={`+${SKIP_SECONDS}`} small onPress={() => skipBy(SKIP_SECONDS)} color={colors.inkSoft} a11y="Forward 15 seconds" />
        </View>

        {/* Secondary row: loop + tempo + download */}
        <View style={styles.secondaryRow}>
          <Pressable
            onPress={toggleLoop}
            accessibilityRole="button"
            accessibilityState={{ selected: isLooping }}
            accessibilityLabel="Toggle loop"
            hitSlop={8}
            style={({ pressed }) => [
              styles.loopBtn,
              {
                borderColor: isLooping ? colors.saffronDeep : colors.divider,
                backgroundColor: isLooping ? colors.saffron : 'transparent',
                borderRadius: radii.md,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.loopGlyph, { color: isLooping ? colors.onPrimary : colors.inkSoft }]}>⟳</Text>
          </Pressable>

          <View style={styles.tempoBlock}>
            <Text style={[styles.tempoLabel, { color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily }]}>
              {tempoLabel}
            </Text>
            <View style={styles.tempoRow}>
              <Pressable
                onPress={() => setRate(rate - RATE_STEP)}
                accessibilityRole="button"
                accessibilityLabel="Slower"
                accessibilityState={{ disabled: rate <= MIN_RATE + 1e-3 }}
                disabled={rate <= MIN_RATE + 1e-3}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.tempoBtn,
                  { borderColor: colors.divider, borderRadius: radii.md },
                  pressed && { opacity: 0.7 },
                  rate <= MIN_RATE + 1e-3 && { opacity: 0.4 },
                ]}
              >
                <Text style={[styles.tempoGlyph, { color: colors.inkSoft }]}>−</Text>
              </Pressable>
              <Text style={[styles.tempoValue, { color: colors.ink, fontFamily: typography.pageCounter.fontFamily }]}>
                {rate.toFixed(1)}×
              </Text>
              <Pressable
                onPress={() => setRate(rate + RATE_STEP)}
                accessibilityRole="button"
                accessibilityLabel="Faster"
                accessibilityState={{ disabled: rate >= MAX_RATE - 1e-3 }}
                disabled={rate >= MAX_RATE - 1e-3}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.tempoBtn,
                  { borderColor: colors.divider, borderRadius: radii.md },
                  pressed && { opacity: 0.7 },
                  rate >= MAX_RATE - 1e-3 && { opacity: 0.4 },
                ]}
              >
                <Text style={[styles.tempoGlyph, { color: colors.inkSoft }]}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => undefined}
            accessibilityRole="button"
            accessibilityLabel={downloadLabel}
            hitSlop={8}
            style={({ pressed }) => [
              styles.loopBtn,
              { borderColor: colors.divider, borderRadius: radii.md },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.loopGlyph, { color: colors.inkSoft }]}>↓</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ControlButton({
  label,
  onPress,
  color,
  small,
  a11y,
}: {
  label: string;
  onPress: () => void;
  color: string;
  small?: boolean;
  a11y: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      hitSlop={10}
      style={({ pressed }) => [styles.ctrl, pressed && { opacity: 0.6 }]}
    >
      <Text style={[small ? styles.ctrlGlyphSmall : styles.ctrlGlyph, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 20, elevation: 20 },
  safe: { flex: 1, paddingHorizontal: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  headerBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  headerGlyph: { fontSize: 24, includeFontPadding: false },
  headerTitle: { fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' },
  artworkWrap: { alignItems: 'center', marginTop: 24, marginBottom: 28 },
  artwork: { width: 220, height: 220, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  artworkGlyph: { fontSize: 96, includeFontPadding: false },
  title: { fontSize: 26, textAlign: 'center', includeFontPadding: false },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 6 },
  seekBlock: { marginTop: 28 },
  seekHit: { paddingVertical: 8 },
  seekTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  seekFill: { height: 4, borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  time: { fontSize: 12, includeFontPadding: false },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, paddingHorizontal: 4 },
  ctrl: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  ctrlGlyph: { fontSize: 22, includeFontPadding: false },
  ctrlGlyphSmall: { fontSize: 13, includeFontPadding: false },
  playBtn: { width: 72, height: 72, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  playGlyph: { fontSize: 24, includeFontPadding: false },
  secondaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 32 },
  loopBtn: { width: 44, height: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  loopGlyph: { fontSize: 20, includeFontPadding: false },
  tempoBlock: { alignItems: 'center' },
  tempoLabel: { fontSize: 11, fontStyle: 'italic', includeFontPadding: false, marginBottom: 4 },
  tempoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tempoBtn: { width: 32, height: 32, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tempoGlyph: { fontSize: 18, lineHeight: 20, includeFontPadding: false },
  tempoValue: { fontSize: 14, minWidth: 38, textAlign: 'center', includeFontPadding: false },
});

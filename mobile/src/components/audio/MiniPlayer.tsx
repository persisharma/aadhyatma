import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { useAudioPlayerContext } from '@/contexts/AudioPlayerContext';

// Matches the bottom tab bar height in TabNavigator (60 + safe-area inset).
const TAB_BAR_BASE_HEIGHT = 60;

/**
 * Persistent mini-player. Rendered ONCE at the app root (App.tsx) so it floats
 * over every tab/stack while a track is loaded. Docks just above the tab bar,
 * mirroring the RoutineBanner; tapping the body expands the now-playing
 * overlay.
 */
export default function MiniPlayer() {
  const { colors, radii, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const { lang } = useGitaLanguage();
  const {
    currentTrack,
    isPlaying,
    positionSec,
    durationSec,
    togglePlay,
    stop,
    openNowPlaying,
  } = useAudioPlayerContext();

  if (!currentTrack) return null;

  const title = contentByLang(lang, currentTrack.titleHi, currentTrack.titleEn);
  const progress = durationSec > 0 ? Math.min(1, positionSec / durationSec) : 0;
  const bottom = TAB_BAR_BASE_HEIGHT + insets.bottom + spacing.xs;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { left: spacing.lg, right: spacing.lg, bottom }]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.parchmentSoft,
            borderColor: colors.divider,
            borderRadius: radii.lg,
            shadowColor: colors.ink,
          },
        ]}
      >
        <Pressable
          onPress={openNowPlaying}
          accessibilityRole="button"
          accessibilityLabel={`Now playing: ${currentTrack.titleEn}. Open player.`}
          style={styles.body}
        >
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}
          >
            {title}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.divider }]}>
            <View
              style={[styles.progressFill, { backgroundColor: colors.saffron, width: `${progress * 100}%` }]}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={togglePlay}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.glyph, { color: colors.saffronDeep }]}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>

        <Pressable
          onPress={stop}
          accessibilityRole="button"
          accessibilityLabel="Stop and close player"
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.closeGlyph, { color: colors.inkMuted }]}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 6,
    elevation: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 12,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  body: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 15,
    includeFontPadding: false,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontSize: 15,
    includeFontPadding: false,
  },
  closeGlyph: {
    fontSize: 16,
    includeFontPadding: false,
  },
});

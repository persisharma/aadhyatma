import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { pick } from '@/utils/localize';
import { deityIconKey } from '@/data/deities';
import DeityIcon from '@/components/DeityIcon';
import type { AudioTrack } from '@/data/audio/tracks';

/**
 * A single audio track rendered in the app's catalog-card language — the same
 * gradient surface, Devanagari-letter thumb, bilingual title slotting, and sub
 * meta as `LibraryCard` (design.md §8) — with a saffron play affordance in the
 * tail instead of the navigate chevron.
 */
function fmt(sec?: number): string {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

type Props = {
  track: AudioTrack;
  onPress: () => void;
  /** Marks the card whose track is the one currently loaded in the player. */
  playing?: boolean;
};

export default function TrackCard({ track, onPress, playing }: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { primary, secondary } = orderTitlesByLanguage(lang, track.titleHi, track.titleEn, {
    devPrimary: 17,
    devSecondary: 13,
    latPrimary: 19,
    latSecondary: 12,
  });

  const kindLabel =
    track.kind === 'recitation'
      ? pick(lang, { hi: 'पाठ', en: 'Recitation', gu: 'પાઠ', kn: 'ಪಠಣ' })
      : pick(lang, { hi: 'भजन', en: 'Bhajan', gu: 'ભજન', kn: 'ಭಜನೆ' });
  const duration = fmt(track.durationSec);
  const sub = duration ? `${kindLabel} · ${duration}` : kindLabel;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Play ${track.titleEn}. ${kindLabel}.`}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: radii.lg,
          borderColor: colors.cardActiveBorder,
          borderWidth: 1,
          ...elevation.raised,
        },
        pressed && styles.cardPressed,
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
      />

      <LinearGradient
        colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.thumb, { borderRadius: radii.md }]}
      >
        <DeityIcon
          iconKey={track.deity ? deityIconKey(track.deity) : undefined}
          fallbackText={track.thumb}
        />
      </LinearGradient>

      <View style={styles.meta}>
        <Text
          style={[
            styles.nameHi,
            {
              color: colors.ink,
              fontFamily: primary.fontFamily,
              fontSize: primary.fontSize,
              fontStyle: primary.fontStyle,
              letterSpacing: primary.letterSpacing,
            },
          ]}
          numberOfLines={1}
        >
          {primary.text}
        </Text>
        <Text
          style={[
            styles.nameEn,
            {
              color: colors.inkMuted,
              fontFamily: secondary.fontFamily,
              fontSize: secondary.fontSize,
              fontStyle: secondary.fontStyle,
            },
          ]}
          numberOfLines={1}
        >
          {secondary.text}
        </Text>
        <Text style={[styles.cardSub, { color: colors.inkMuted, fontSize: typography.cardMeta.fontSize }]}>
          {sub}
        </Text>
      </View>

      <View
        style={[
          styles.playBtn,
          {
            backgroundColor: playing ? colors.saffron : colors.saffronTint,
            borderColor: colors.cardActiveBorder,
            borderRadius: radii.pill,
          },
        ]}
        pointerEvents="none"
      >
        <Text style={[styles.playGlyph, { color: playing ? colors.onPrimary : colors.saffronDeep }]}>
          {playing ? '❚❚' : '▶'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.85 },
  thumb: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1, minWidth: 0 },
  nameHi: { marginBottom: 2 },
  nameEn: { marginBottom: 6 },
  cardSub: { opacity: 0.9 },
  playBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    fontSize: 13,
    includeFontPadding: false,
  },
});

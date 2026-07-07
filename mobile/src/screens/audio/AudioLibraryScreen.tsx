import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { deities } from '@/data/deities';
import type { Deity } from '@/data/texts';
import { AUDIO_TRACKS, type AudioTrack } from '@/data/audio/tracks';
import { hasRealAudio } from '@assets/audio-library';
import { useAudioPlayerContext } from '@/contexts/AudioPlayerContext';
import TrackCard from '@/components/audio/TrackCard';
import { useTourTarget } from '@/components/tour/tourTargets';

// A single Devanagari glyph per deity for the filter avatar (the chip mirrors the
// catalog thumb — a letter on a saffron-gold disc).
const DEITY_GLYPH: Partial<Record<Deity, string>> = {
  rama: 'रा',
  krishna: 'कृ',
  vishnu: 'वि',
  shiva: 'शि',
  hanuman: 'ह',
  durga: 'दु',
  ganesha: 'ग',
  savitr: 'गा',
  saraswati: 'स',
};

export default function AudioLibraryScreen() {
  const { colors, spacing, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const { currentTrack, isPlaying, playTrack, openNowPlaying } = useAudioPlayerContext();
  const [filter, setFilter] = useState<Deity | null>(null);
  // Feature-tour anchor for the Bhajan "inside" step (design.md §47).
  const bhajanInsideRef = useTourTarget('bhajanInside');

  // Only tracks with a real recording are shown — nothing surfaces without audio.
  const available = useMemo(() => AUDIO_TRACKS.filter((t) => hasRealAudio(t.id)), []);

  // Deities that have an available track, in the canonical deities.ts order.
  const presentDeities = useMemo(() => {
    const have = new Set(available.map((t) => t.deity).filter(Boolean) as Deity[]);
    return deities.filter((d) => have.has(d.id));
  }, [available]);

  const matches = (t: AudioTrack) => !filter || t.deity === filter;
  const recitations = available.filter((t) => t.kind === 'recitation' && matches(t));
  const standalone = available.filter((t) => t.kind === 'standalone' && matches(t));

  const titleLabel = pick(lang, { hi: 'भजन', en: 'Bhajan', gu: 'ભજન', kn: 'ಭಜನೆ' });
  const allLabel = pick(lang, { hi: 'सभी', en: 'All', gu: 'બધા', kn: 'ಎಲ್ಲಾ' });

  const play = (t: AudioTrack) => {
    playTrack(t);
    openNowPlaying();
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        {/* Header — dedicated tab root, so a centered title (no back chevron) */}
        <View style={[styles.titleBar, { paddingHorizontal: spacing.screenGutter }]}>
          <Text style={[styles.screenTitle, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}>
            {titleLabel}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Deity filter — circular avatars; tap to filter, saffron ring marks the active one */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.screenGutter, gap: 16, paddingVertical: 6 }}
          >
            <DeityChip glyph="ॐ" label={allLabel} selected={filter === null} onPress={() => setFilter(null)} />
            {presentDeities.map((d) => (
              <DeityChip
                key={d.id}
                glyph={DEITY_GLYPH[d.id] ?? 'ॐ'}
                label={contentByLang(lang, d.nameHi, d.nameEn)}
                selected={filter === d.id}
                onPress={() => setFilter((cur) => (cur === d.id ? null : d.id))}
              />
            ))}
          </ScrollView>

          <View ref={bhajanInsideRef} collapsable={false} style={{ paddingHorizontal: spacing.screenGutter, gap: 12 }}>
            {currentTrack && (
              <>
                <SectionHeading hi="जारी रखें" en="Continue listening" />
                <TrackCard track={currentTrack} playing={isPlaying} onPress={openNowPlaying} />
              </>
            )}

            {recitations.length > 0 && (
              <>
                <SectionHeading hi="पाठ" en="Recitations" />
                {recitations.map((t) => (
                  <TrackCard
                    key={t.id}
                    track={t}
                    playing={currentTrack?.id === t.id && isPlaying}
                    onPress={() => play(t)}
                  />
                ))}
              </>
            )}

            {standalone.length > 0 && (
              <>
                <SectionHeading hi="भजन व आरती" en="Bhajans & Aartis" />
                {standalone.map((t) => (
                  <TrackCard
                    key={t.id}
                    track={t}
                    playing={currentTrack?.id === t.id && isPlaying}
                    onPress={() => play(t)}
                  />
                ))}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/** Circular deity filter chip — saffron-gold disc + Devanagari glyph, selected ring (design.md §20). */
function DeityChip({
  glyph,
  label,
  selected,
  onPress,
}: {
  glyph: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, typography, radii } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
    >
      <View
        style={[
          styles.chipRing,
          {
            borderRadius: radii.pill,
            borderColor: selected ? colors.saffron : 'transparent',
            backgroundColor: selected ? colors.saffronTint : 'transparent',
          },
        ]}
      >
        <LinearGradient
          colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.chipDisc, { borderRadius: radii.pill }]}
        >
          <Text style={[styles.chipGlyph, { color: colors.parchmentSoft, fontFamily: typography.thumb.fontFamily }]}>
            {glyph}
          </Text>
        </LinearGradient>
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.chipLabel,
          {
            color: selected ? colors.saffronDeep : colors.inkMuted,
            fontFamily: fontFamilies.devanagari,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Bilingual section heading in the design.md "देवता · By Deity" style. */
function SectionHeading({ hi, en }: { hi: string; en: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.heading, { color: colors.ink, fontFamily: fontFamilies.devanagariBold }]}>
      {hi}
      <Text style={{ color: colors.inkMuted, fontFamily: fontFamilies.latinItalic, fontStyle: 'italic', fontSize: 13 }}>
        {'  ·  '}
        {en}
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  titleBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  screenTitle: { fontSize: 22, includeFontPadding: false },
  chip: {
    alignItems: 'center',
    width: 64,
  },
  chipRing: {
    padding: 3,
    borderWidth: 2,
  },
  chipDisc: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipGlyph: {
    fontSize: 22,
    includeFontPadding: false,
  },
  chipLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    includeFontPadding: false,
  },
  heading: {
    fontSize: 15,
    marginTop: 16,
    marginBottom: 2,
    includeFontPadding: false,
  },
});

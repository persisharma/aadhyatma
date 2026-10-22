import AppIcon from '@/components/AppIcon';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { pick } from '@/utils/localize';
import { deityIconKey } from '@/data/deities';
import DeityIcon from '@/components/DeityIcon';
import ListCard, { CARD_TITLE_SIZES, CardThumb, CardTitles } from '@/components/ListCard';
import type { AudioTrack } from '@/data/audio/tracks';

/**
 * A single audio track as the shared regular `ListCard` (design.md §8) —
 * painted deity thumb, bilingual title slotting (titles wrap, never clamped)
 * and kind · duration meta — with a saffron play affordance in the tail
 * instead of the navigate chevron (▶ plays in place).
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
  /** Fired on touch-down — used to warm the track's cache before the tap lands. */
  onPressIn?: () => void;
  /** Marks the card whose track is the one currently loaded in the player. */
  playing?: boolean;
};

export default function TrackCard({ track, onPress, onPressIn, playing }: Props) {
  const { colors, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { primary, secondary } = orderTitlesByLanguage(lang, track.titleHi, track.titleEn, CARD_TITLE_SIZES);

  const kindLabel =
    track.kind === 'recitation'
      ? pick(lang, { hi: 'पाठ', en: 'Recitation', gu: 'પાઠ', kn: 'ಪಠಣ' })
      : pick(lang, { hi: 'भजन', en: 'Bhajan', gu: 'ભજન', kn: 'ಭಜನೆ' });
  const duration = fmt(track.durationSec);
  const sub = duration ? `${kindLabel} · ${duration}` : kindLabel;

  return (
    <ListCard
      onPress={onPress}
      onPressIn={onPressIn}
      accessibilityLabel={`Play ${track.titleEn}. ${kindLabel}.`}
      // The audio library spaces its cards with the container's `gap`.
      style={styles.inList}
      leading={
        <CardThumb>
          <DeityIcon iconKey={track.deity ? deityIconKey(track.deity) : undefined} />
        </CardThumb>
      }
      right={
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
          <AppIcon name={playing ? "pause" : "play"} size={18} color={playing ? colors.onPrimary : colors.iconInk} weight="fill" />
        </View>
      }
    >
      <CardTitles primary={primary} secondary={secondary} meta={sub} />
    </ListCard>
  );
}

const styles = StyleSheet.create({
  inList: { marginBottom: 0 },
  playBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import type { DeityIconKey } from '@/data/deities';
import DeityIcon from './DeityIcon';

type Props = {
  nameHi: string;
  nameEn: string;
  itemCount: string;
  iconKey?: DeityIconKey;
  onPress?: () => void;
  /** When true, shows a green "NEW" badge top-right (deity has unseen content). */
  hasNew?: boolean;
};

export default function DeityCard({ nameHi, nameEn, itemCount, iconKey, onPress, hasNew }: Props) {
  const { colors, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const { primary, secondary } = orderTitlesByLanguage(lang, nameHi, nameEn, {
    devPrimary: 16,
    devSecondary: 12,
    latPrimary: 18,
    latSecondary: 11,
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          // Match the active LibraryCard treatment used across other sections:
          // warm gradient fill (below), saffron-tinted border, lifted shadow.
          borderColor: colors.cardActiveBorder,
          borderRadius: radii.lg,
          ...elevation.raised,
        },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${nameEn}. ${itemCount}.${hasNew ? ' New.' : ''}`}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardBg, { borderRadius: radii.lg }]}
      />
      <LinearGradient
        colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <DeityIcon iconKey={iconKey} fallbackText={nameHi.slice(0, 2)} />
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
        >
          {secondary.text}
        </Text>
        <Text
          style={[
            styles.count,
            { color: colors.inkMuted, fontSize: 10 },
          ]}
        >
          {itemCount}
        </Text>
      </View>

      <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>

      {hasNew && (
        <View
          style={[styles.badge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}
          pointerEvents="none"
        >
          <Text style={[styles.badgeText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>
            NEW
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 12,
    overflow: 'hidden',
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  cardPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  nameHi: {
    marginBottom: 1,
  },
  nameEn: {
    fontStyle: 'italic',
    marginBottom: 3,
  },
  count: {
    opacity: 0.9,
  },
  chev: {
    fontSize: 18,
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

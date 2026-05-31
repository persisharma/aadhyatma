import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  nameHi: string;
  nameEn: string;
  status: 'active' | 'coming';
  icon?: React.ReactNode;
  onPress?: () => void;
  /** When true (and active), shows a green "NEW" badge top-right. */
  hasNew?: boolean;
};

export default function CategoryCard({ nameHi, nameEn, status, icon, onPress, hasNew }: Props) {
  const { colors, typography, radii } = useTheme();
  const isActive = status === 'active';

  const content = (
    <>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text
        style={[
          styles.nameHi,
          {
            color: colors.ink,
            fontFamily: typography.cardHindi.fontFamily,
            fontSize: 15,
          },
        ]}
      >
        {nameHi}
      </Text>
      <Text
        style={[
          styles.nameEn,
          {
            color: colors.inkSoft,
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 13,
          },
        ]}
      >
        {nameEn}
      </Text>
    </>
  );

  if (isActive) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            borderRadius: 16,
            borderColor: colors.cardActiveBorder,
            borderWidth: 1,
            shadowColor: '#3C1E0A',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          },
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${nameEn}.${hasNew ? ' New.' : ''} Tap to open.`}
      >
        <LinearGradient
          colors={[colors.cardActiveFrom, colors.cardActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardBg, { borderRadius: 16 }]}
        />
        {content}
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

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: 16,
          backgroundColor: colors.cardSurface,
          borderColor: colors.divider,
          borderWidth: 1,
          opacity: 0.55,
          shadowColor: '#3C1E0A',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      accessibilityLabel={`${nameEn}. Coming soon.`}
    >
      {content}
      <View
        style={[
          styles.badge,
          { backgroundColor: colors.goldTint, borderRadius: radii.pill },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: colors.inkMuted, letterSpacing: 1.6 },
          ]}
        >
          SOON
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    marginBottom: 4,
  },
  nameHi: {
    textAlign: 'center',
    marginBottom: 2,
  },
  nameEn: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

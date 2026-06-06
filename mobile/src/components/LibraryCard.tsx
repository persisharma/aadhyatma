import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type AccessibilityRole,
  type AccessibilityState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import type { LibraryEntry } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';

type Props = {
  entry: LibraryEntry;
  onPress?: () => void;
};

export default function LibraryCard({ entry, onPress }: Props) {
  const { colors, typography, radii } = useTheme();
  const { isNew } = useNewContent();
  const { lang } = useGitaLanguage();
  const { primary, secondary } = orderTitlesByLanguage(lang, entry.nameHi, entry.nameEn, {
    devPrimary: 17,
    devSecondary: 14,
    latPrimary: 17,
    latSecondary: 13,
  });
  const isActive = entry.status === 'active';
  const showNew = isActive && isNew(entry.id);

  const accessibilityRole: AccessibilityRole | undefined = isActive ? 'button' : undefined;
  const accessibilityLabel = `${entry.nameEn}. ${entry.sub}.${showNew ? ' New.' : ''} ${isActive ? 'Tap to open.' : 'Coming soon.'}`;
  const accessibilityState: AccessibilityState = { disabled: !isActive };

  const body = (
    <>
      {isActive ? (
        <LinearGradient
          colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.thumb, { borderRadius: radii.md }]}
        >
          <Text
            style={[
              styles.thumbText,
              {
                color: colors.parchmentSoft,
                fontFamily: typography.thumb.fontFamily,
                fontSize: typography.thumb.fontSize,
              },
            ]}
          >
            {entry.thumb}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.cardThumbRest,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.divider,
            },
          ]}
        >
          <Text
            style={[
              styles.thumbText,
              {
                color: colors.saffronDeep,
                fontFamily: typography.thumb.fontFamily,
                fontSize: typography.thumb.fontSize,
                opacity: 0.55,
              },
            ]}
          >
            {entry.thumb}
          </Text>
        </View>
      )}

      <View style={styles.meta}>
        <Text
          style={[
            styles.nameHi,
            {
              color: colors.ink,
              fontFamily: primary.fontFamily,
              fontSize: primary.fontSize,
              fontStyle: primary.fontStyle,
              opacity: isActive ? 1 : 0.55,
            },
          ]}
        >
          {primary.text}
        </Text>
        <Text
          style={[
            styles.nameEn,
            {
              color: colors.inkSoft,
              fontFamily: secondary.fontFamily,
              fontSize: secondary.fontSize,
              fontStyle: secondary.fontStyle,
              opacity: isActive ? 1 : 0.55,
            },
          ]}
        >
          {secondary.text}
        </Text>
        <Text
          style={[
            styles.cardSub,
            { color: colors.inkMuted, fontSize: typography.cardMeta.fontSize },
          ]}
        >
          {entry.sub}
        </Text>
      </View>

      {isActive ? (
        <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
      ) : (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.goldTint, borderRadius: radii.pill },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: colors.inkMuted,
                letterSpacing: 1.6,
              },
            ]}
          >
            SOON
          </Text>
        </View>
      )}
      {showNew && (
        <View
          style={[styles.badge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}
          pointerEvents="none"
        >
          <Text style={[styles.badgeText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>
            NEW
          </Text>
        </View>
      )}
    </>
  );

  const cardStyle = [
    styles.card,
    { borderRadius: radii.lg },
    isActive
      ? {
          borderColor: colors.cardActiveBorder,
          borderWidth: 1,
          shadowColor: '#3C1E0A',
          shadowOpacity: 0.14,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        }
      : {
          backgroundColor: colors.cardSurface,
          borderColor: colors.divider,
          borderWidth: 1,
          shadowColor: '#3C1E0A',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        },
  ];

  if (isActive) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.cardPressed]}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
      >
        <LinearGradient
          colors={[colors.cardActiveFrom, colors.cardActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardBg, { borderRadius: radii.lg }]}
        />
        {body}
      </Pressable>
    );
  }

  return (
    <View
      style={cardStyle}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
    >
      {body}
    </View>
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
  cardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  cardPressed: {
    opacity: 0.85,
  },
  thumb: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {
    includeFontPadding: false,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  nameHi: {
    marginBottom: 2,
  },
  nameEn: {
    marginBottom: 6,
  },
  cardSub: {
    opacity: 0.9,
  },
  chev: {
    fontSize: 26,
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

import React from 'react';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  Text,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import type { LibraryEntry } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';
import { useRoutineSheet } from '@/contexts/RoutineSheetContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';

type Props = {
  entry: LibraryEntry;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'compact';
};

export default function LibraryCard({ entry, onPress, style, variant = 'default' }: Props) {
  const { colors, typography, radii } = useTheme();
  const { isNew } = useNewContent();
  const { openAddToRoutine } = useRoutineSheet();
  const { lang } = useGitaLanguage();
  const { primary, secondary } = orderTitlesByLanguage(lang, entry.nameHi, entry.nameEn, {
    devPrimary: 17,
    devSecondary: 13,
    latPrimary: 19,
    latSecondary: 12,
  });
  const compact = variant === 'compact';
  const isActive = entry.status === 'active';
  const showNew = isActive && isNew(entry.id);
  const sub = lang === 'en' ? entry.subEn : entry.sub;

  const accessibilityRole: AccessibilityRole | undefined = isActive ? 'button' : undefined;
  const accessibilityLabel = `${entry.nameEn}. ${entry.subEn}.${showNew ? ' New.' : ''} ${isActive ? 'Tap to open.' : 'Coming soon.'}`;
  const accessibilityState: AccessibilityState = { disabled: !isActive };

  const body = (
    <>
      {isActive ? (
        <LinearGradient
          colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.thumb, compact && styles.thumbCompact, { borderRadius: radii.md }]}
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
            compact && styles.thumbCompact,
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
              letterSpacing: primary.letterSpacing,
              opacity: isActive ? 1 : 0.55,
            },
          ]}
          numberOfLines={compact ? 2 : undefined}
        >
          {primary.text}
        </Text>
        {!compact && (
          <Text
            style={[
              styles.nameEn,
              {
                color: colors.inkMuted,
                fontFamily: secondary.fontFamily,
                fontSize: secondary.fontSize,
                fontStyle: secondary.fontStyle,
                opacity: isActive ? 1 : 0.55,
              },
            ]}
          >
            {secondary.text}
          </Text>
        )}
        {!compact && (
          <Text
            style={[
              styles.cardSub,
              { color: colors.inkMuted, fontSize: typography.cardMeta.fontSize },
            ]}
          >
            {sub}
          </Text>
        )}
      </View>

      {isActive ? (
        <View style={styles.tail}>
          {/* Theerth (pilgrimage) entries can't be added to a routine — they open
              a map + temple detail, not a reader — so no add-to-routine button. */}
          {entry.category !== 'theerth' ? (
            <Pressable
              onPress={() => openAddToRoutine(entry.id)}
              accessibilityRole="button"
              accessibilityLabel={`Add ${entry.nameEn} to a routine`}
              hitSlop={12}
              style={({ pressed }) => [
                styles.addBtn,
                { borderColor: colors.gold, borderRadius: radii.pill },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={{ color: colors.saffron, fontSize: 18, lineHeight: 20 }}>＋</Text>
            </Pressable>
          ) : null}
          <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
        </View>
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
    compact && styles.cardCompact,
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
        style={({ pressed }) => [cardStyle, style, pressed && styles.cardPressed]}
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
      style={[cardStyle, style]}
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
  cardCompact: {
    padding: 14,
    gap: 12,
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
  thumbCompact: {
    width: 44,
    height: 44,
  },
  thumbText: {
    // Devanagari letter avatar (ग / ॐ …) — keep Android's font padding so the
    // glyph's top (chandrabindu/matra) isn't clipped.
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
  tail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chev: {
    fontSize: 26,
    marginLeft: 4,
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

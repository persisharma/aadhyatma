import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';

type Props = {
  nameHi: string;
  nameEn: string;
  status: 'active' | 'coming';
  icon?: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  /** When true (and active), shows a green "NEW" badge top-right. */
  hasNew?: boolean;
  /**
   * `card` (default): the classic gradient card with the name inside — used by
   * any 2-column layout. `launcher`: the Home 3×3 grid tile — a compact glyph
   * square with the name *below* it at caption size (design.md §19). The
   * accessibility label always carries the full `nameEn` in both variants.
   */
  variant?: 'card' | 'launcher';
  /** Short English label for the launcher grid; falls back to `nameEn`. */
  displayNameEn?: string;
  /** Compact launchers default to one line; dense named indexes may opt into two. */
  launcherLabelLines?: 1 | 2;
  /** Home keeps captions below; dense indexes can place the title inside the tile. */
  launcherLabelPosition?: 'below' | 'tile';
};

function CategoryCard({
  nameHi,
  nameEn,
  status,
  icon,
  onPress,
  onPressIn,
  onPressOut,
  hasNew,
  variant = 'card',
  displayNameEn,
  launcherLabelLines = 1,
  launcherLabelPosition = 'below',
}: Props) {
  const { colors, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const isActive = status === 'active';
  const isLauncher = variant === 'launcher';

  // Home tiles show a single language line (the reader's primary). The demoted
  // second-language line is dropped here to tighten the grid; catalog/detail
  // screens keep the bilingual pairing. The English accessibilityLabel below is
  // left intact, so screen readers still announce the (full) English name.
  const { primary } = orderTitlesByLanguage(
    lang,
    nameHi,
    isLauncher ? (displayNameEn ?? nameEn) : nameEn,
    isLauncher
      ? // Caption-sized label under the launcher tile; Latin one step up as usual.
        { devPrimary: 13, devSecondary: 11, latPrimary: 14, latSecondary: 11 }
      : { devPrimary: 16, devSecondary: 12, latPrimary: 17, latSecondary: 12 }
  );

  if (isLauncher) {
    const launcherLabel = (
      <Text
        numberOfLines={launcherLabelLines}
        adjustsFontSizeToFit={launcherLabelPosition === 'tile'}
        minimumFontScale={launcherLabelPosition === 'tile' ? 0.8 : undefined}
        style={[
          styles.launcherName,
          launcherLabelPosition === 'tile' && styles.launcherNameInTile,
          {
            color: colors.ink,
            fontFamily: primary.fontFamily,
            fontSize: primary.fontSize,
            fontStyle: primary.fontStyle,
            letterSpacing: primary.letterSpacing,
            lineHeight: launcherLabelPosition === 'tile' ? 21 : undefined,
          },
        ]}
      >
        {primary.text}
      </Text>
    );

    if (!isActive) {
      return (
        <View
          style={styles.launcher}
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          accessibilityLabel={`${nameEn}. Coming soon.`}
        >
          <View
            style={[
              styles.launcherTile,
              styles.launcherTileComing,
              {
                borderRadius: radii.lg,
                backgroundColor: colors.cardSurface,
                borderColor: colors.divider,
                borderWidth: 1,
              },
              elevation.card,
            ]}
          >
            {icon}
            {launcherLabelPosition === 'tile' ? launcherLabel : null}
            <View
              style={[
                styles.badge,
                styles.launcherBadge,
                { backgroundColor: colors.goldTint, borderRadius: radii.pill },
              ]}
            >
              <Text style={[styles.badgeText, { color: colors.inkMuted, letterSpacing: 1.6 }]}>
                SOON
              </Text>
            </View>
          </View>
          {launcherLabelPosition === 'below' ? launcherLabel : null}
        </View>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [styles.launcher, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${nameEn}.${hasNew ? ' New.' : ''} Tap to open.`}
      >
        <View
          style={[
            styles.launcherTile,
            {
              borderRadius: radii.lg,
              borderColor: colors.cardActiveBorder,
              borderWidth: 1,
              // Opaque base so the Android shadow renders; the gradient carries
              // its own radius instead of overflow:'hidden', which would clip
              // the iOS shadow (design.md §4).
              backgroundColor: colors.cardActiveFrom,
            },
            elevation.card,
          ]}
        >
          <LinearGradient
            colors={[colors.cardActiveFrom, colors.cardActiveTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cardBg, { borderRadius: radii.lg }]}
          />
          {icon}
          {launcherLabelPosition === 'tile' ? launcherLabel : null}
          {hasNew && (
            <View
              style={[
                styles.badge,
                styles.launcherBadge,
                { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill },
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.badgeText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>
                NEW
              </Text>
            </View>
          )}
        </View>
        {launcherLabelPosition === 'below' ? launcherLabel : null}
      </Pressable>
    );
  }

  const content = (
    <>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
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
    </>
  );

  if (isActive) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            borderRadius: radii.lg,
            borderColor: colors.cardActiveBorder,
            borderWidth: 1,
            ...elevation.lifted,
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
          style={[styles.cardBg, { borderRadius: radii.lg }]}
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
          borderRadius: radii.lg,
          backgroundColor: colors.cardSurface,
          borderColor: colors.divider,
          borderWidth: 1,
          opacity: 0.55,
          ...elevation.subtle,
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
    paddingVertical: 12,
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
    marginBottom: 6,
  },
  nameHi: {
    textAlign: 'center',
  },
  launcher: {
    alignItems: 'stretch',
  },
  launcherTile: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launcherTileComing: {
    opacity: 0.55,
  },
  launcherName: {
    marginTop: 6,
    textAlign: 'center',
  },
  launcherNameInTile: {
    marginTop: 0,
    paddingHorizontal: 8,
  },
  launcherBadge: {
    top: 6,
    right: 6,
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

// Memoized: HomeScreen renders 9 of these with memoized icon/onPress props, so
// unrelated Home re-renders skip reconciling the gradient + glyph subtrees.
export default React.memo(CategoryCard);

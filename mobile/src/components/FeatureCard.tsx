import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';

/**
 * Content for a single Home "Discover" spotlight (§ design.md Home hero feature
 * section). One flexible shell carries every app section — readers, the daily
 * verse, the Panchang, pilgrimage, the daily routine — so awareness of each
 * surface can be raised from one carousel.
 *
 * Compact layout: the reader's primary-language title sits inline next to the
 * icon (one row), a one-line blurb follows, then a CTA pill. The demoted second
 * language and the old context eyebrow chip were dropped — the title conveys the
 * section on its own — to keep the card short.
 *
 * `compact` (design.md §50) is a shorter *strip* form of the same shell for the
 * FOR TODAY row: icon left, title over blurb in one text column, and a bare
 * chevron where the CTA pill sat. It roughly halves the card height (~68 vs
 * ~130) so Home's today cluster stops eating a screenful before the grid.
 */
export type FeatureSpotlight = {
  /** Stable key for the carousel list. */
  key: string;
  /** Section name — the prominent title, shown next to the icon. */
  titleHi: string;
  titleEn: string;
  /** One-line supporting blurb explaining the section. */
  descHi: string;
  descEn: string;
  /** Call-to-action label rendered in the bottom pill. */
  ctaHi: string;
  ctaEn: string;
  /** Icon glyph/vector — wrapped in the icon tile by the card. */
  icon: React.ReactNode;
  /** When true, a saffron "NEW" badge shows at the end of the title row. */
  hasNew?: boolean;
};

type Props = {
  item: FeatureSpotlight;
  /** Carousel item width — owned by the screen so it can size to the viewport. */
  width: number;
  onPress: () => void;
  /** Home first-tap recovery (TilePressContext) — a no-op elsewhere. */
  onPressIn?: () => void;
  onPressOut?: () => void;
  /**
   * Short strip form (FOR TODAY row): one row of icon · title/blurb · chevron,
   * no CTA pill. Roughly half the height of the default spotlight card.
   */
  compact?: boolean;
};

export default function FeatureCard({
  item,
  width,
  onPress,
  onPressIn,
  onPressOut,
  compact = false,
}: Props) {
  const { colors, radii, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const isHi = lang === 'hi';

  // Home spotlight shows a single language line (the reader's primary); the
  // demoted second-language title is dropped to shorten the card. Catalog/detail
  // screens keep the pairing. The English accessibilityLabel below is unchanged.
  // The compact strip steps the title down one notch — it shares its row with
  // the icon and the chevron rather than owning a full line.
  const { primary } = orderTitlesByLanguage(
    lang,
    item.titleHi,
    item.titleEn,
    compact
      ? { devPrimary: 17, devSecondary: 13, latPrimary: 18, latSecondary: 13 }
      : { devPrimary: 19, devSecondary: 13, latPrimary: 21, latSecondary: 13 }
  );

  const desc = isHi ? item.descHi : item.descEn;
  const cta = isHi ? item.ctaHi : item.ctaEn;

  const titleText = (
    <Text
      style={{
        flex: compact ? undefined : 1,
        flexShrink: compact ? 1 : undefined,
        color: colors.ink,
        fontFamily: primary.fontFamily,
        fontSize: primary.fontSize,
        fontStyle: primary.fontStyle,
        letterSpacing: primary.letterSpacing,
      }}
      numberOfLines={1}
    >
      {primary.text}
    </Text>
  );

  const newBadge = item.hasNew ? (
    <View
      style={[styles.tag, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}
      pointerEvents="none"
    >
      <Text style={[styles.tagText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>NEW</Text>
    </View>
  ) : null;

  const descText = (
    <Text
      style={[
        styles.desc,
        {
          color: colors.inkSoft,
          fontFamily: isHi ? typography.cardHindi.fontFamily : typography.cardLatin.fontFamily,
          fontSize: isHi ? (compact ? 12 : 13) : compact ? 13 : 14,
          fontStyle: isHi ? 'normal' : 'italic',
          // Devanagari needs ~1.7 leading (design.md type scale); the Latin
          // default of 19 is too tight for Hindi and clips the upper matras.
          lineHeight: isHi ? (compact ? 20 : 22) : compact ? 18 : 19,
          marginTop: compact ? 1 : spacing.sm,
        },
      ]}
      numberOfLines={1}
    >
      {desc}
    </Text>
  );

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={({ pressed }) => [
          styles.card,
          styles.cardCompact,
          {
            width,
            borderRadius: radii.lg,
            borderColor: colors.cardActiveBorder,
            ...elevation.raised,
          },
          pressed && styles.cardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${item.titleEn}.${item.hasNew ? ' New.' : ''} ${item.descEn} Tap to open.`}
      >
        <LinearGradient
          colors={[colors.cardActiveFrom, colors.cardActiveTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
        />

        <View style={styles.compactRow}>
          <View
            style={[
              styles.iconTile,
              styles.iconTileCompact,
              { backgroundColor: colors.saffronTint, borderRadius: radii.md },
            ]}
          >
            {item.icon}
          </View>
          <View style={styles.compactText}>
            <View style={styles.compactTitleRow}>
              {titleText}
              {newBadge}
            </View>
            {descText}
          </View>
          {/* The CTA pill is dropped here — the chevron alone carries the
              "opens something" affordance at strip height. */}
          <Text style={[styles.ctaChevron, { color: colors.saffronDeep }]}>›</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          borderRadius: radii.lg,
          borderColor: colors.cardActiveBorder,
          ...elevation.raised,
        },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.titleEn}.${item.hasNew ? ' New.' : ''} ${item.descEn} Tap to open.`}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
      />

      {/* Icon and title share one line to keep the card compact. */}
      <View style={styles.header}>
        <View
          style={[styles.iconTile, { backgroundColor: colors.saffronTint, borderRadius: radii.md }]}
        >
          {item.icon}
        </View>
        {titleText}
        {newBadge}
      </View>

      {descText}

      <View style={styles.spacer} />

      <View style={[styles.cta, { backgroundColor: colors.saffronTint, borderRadius: radii.pill }]}>
        <Text
          style={{
            color: colors.saffronDeep,
            fontFamily: isHi ? typography.cardHindi.fontFamily : typography.cardLatin.fontFamily,
            fontSize: 13,
            fontStyle: isHi ? 'normal' : 'italic',
          }}
        >
          {cta}
        </Text>
        <Text style={[styles.ctaChevron, { color: colors.saffronDeep }]}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    minHeight: 112,
    padding: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardCompact: {
    // No flex spacer and no CTA pill: the strip is exactly its one row plus
    // padding, which is what halves the FOR TODAY row's height.
    minHeight: 0,
    paddingVertical: 11,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  cardPressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactText: {
    flex: 1,
  },
  compactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconTile: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTileCompact: {
    width: 34,
    height: 34,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  desc: {
    // lineHeight is set inline per language (Hindi needs more leading than Latin).
  },
  spacer: {
    flex: 1,
    minHeight: 6,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  ctaChevron: {
    fontSize: 16,
    lineHeight: 16,
  },
});

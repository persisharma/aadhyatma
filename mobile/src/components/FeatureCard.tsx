import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
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
};

export default function FeatureCard({ item, width, onPress }: Props) {
  const { colors, radii, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const isHi = lang === 'hi';

  // Home spotlight shows a single language line (the reader's primary); the
  // demoted second-language title is dropped to shorten the card. Catalog/detail
  // screens keep the pairing. The English accessibilityLabel below is unchanged.
  const { primary } = orderTitlesByLanguage(lang, item.titleHi, item.titleEn, {
    devPrimary: 19,
    devSecondary: 13,
    latPrimary: 21,
    latSecondary: 13,
  });

  const desc = isHi ? item.descHi : item.descEn;
  const cta = isHi ? item.ctaHi : item.ctaEn;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          borderRadius: radii.lg,
          borderColor: colors.cardActiveBorder,
          shadowColor: '#3C1E0A',
          shadowOpacity: 0.16,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 5,
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
        <Text
          style={{
            flex: 1,
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
        {item.hasNew && (
          <View
            style={[styles.tag, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}
            pointerEvents="none"
          >
            <Text style={[styles.tagText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>
              NEW
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.desc,
          {
            color: colors.inkSoft,
            fontFamily: isHi ? typography.cardHindi.fontFamily : typography.cardLatin.fontFamily,
            fontSize: isHi ? 13 : 14,
            fontStyle: isHi ? 'normal' : 'italic',
            // Devanagari needs ~1.7 leading (design.md type scale); the Latin
            // default of 19 is too tight for Hindi and clips the upper matras.
            lineHeight: isHi ? 22 : 19,
            marginTop: spacing.sm,
          },
        ]}
        numberOfLines={1}
      >
        {desc}
      </Text>

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
  cardPressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconTile: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 9,
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

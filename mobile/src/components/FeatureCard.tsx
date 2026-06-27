import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { pillTextStyle } from '@/utils/langType';

/**
 * Content for a single Home "Discover" spotlight (§ design.md Home hero feature
 * section). One flexible shell carries every app section — readers, the daily
 * verse, the Panchang, pilgrimage, the daily routine — so awareness of each
 * surface can be raised from one carousel. Every text field is bilingual; the
 * card renders the slot that matches the active reading language and demotes the
 * other, exactly like the catalog cards (`orderTitlesByLanguage`).
 */
export type FeatureSpotlight = {
  /** Stable key for the carousel list. */
  key: string;
  /** Small uppercase context tag shown top-right (e.g. "TODAY", "CALENDAR"). */
  eyebrowHi: string;
  eyebrowEn: string;
  /** Section name — the prominent title. */
  titleHi: string;
  titleEn: string;
  /** One- to two-line supporting blurb explaining the section. */
  descHi: string;
  descEn: string;
  /** Call-to-action label rendered in the bottom pill. */
  ctaHi: string;
  ctaEn: string;
  /** Icon glyph/vector — wrapped in the icon tile by the card. */
  icon: React.ReactNode;
  /** When true, the eyebrow slot shows a saffron "NEW" badge instead. */
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

  const { primary, secondary } = orderTitlesByLanguage(lang, item.titleHi, item.titleEn, {
    devPrimary: 19,
    devSecondary: 13,
    latPrimary: 21,
    latSecondary: 13,
  });

  const eyebrow = isHi ? item.eyebrowHi : item.eyebrowEn;
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

      <View style={styles.header}>
        <View
          style={[styles.iconTile, { backgroundColor: colors.saffronTint, borderRadius: radii.md }]}
        >
          {item.icon}
        </View>
        {item.hasNew ? (
          <View
            style={[styles.tag, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}
            pointerEvents="none"
          >
            <Text style={[styles.tagText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>
              NEW
            </Text>
          </View>
        ) : (
          <Text
            style={[
              // Eyebrow is Devanagari only when reading Hindi (English otherwise);
              // base the pill treatment on the actual script so Hindi keeps its
              // shirorekha (no Latin tracking → no "नि त्य" gaps) — see pillTextStyle.
              pillTextStyle(isHi ? 'hi' : 'en', typography.versePill),
              { color: colors.saffronDeep },
            ]}
            numberOfLines={1}
          >
            {eyebrow}
          </Text>
        )}
      </View>

      <View style={[styles.body, { marginTop: spacing.md }]}>
        <Text
          style={{
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
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: secondary.fontFamily,
            fontSize: secondary.fontSize,
            fontStyle: secondary.fontStyle,
            marginTop: 1,
          }}
          numberOfLines={1}
        >
          {secondary.text}
        </Text>
        <Text
          style={[
            styles.desc,
            {
              color: colors.inkSoft,
              fontFamily: isHi ? typography.cardHindi.fontFamily : typography.cardLatin.fontFamily,
              fontSize: isHi ? 13 : 14,
              fontStyle: isHi ? 'normal' : 'italic',
              // Devanagari needs ~1.7 leading (design.md type scale); the Latin
              // default of 19 is too tight for Hindi and clips the upper matras of
              // the first line. Cormorant italic stays at 19.
              lineHeight: isHi ? 22 : 19,
              marginTop: spacing.sm,
            },
          ]}
          numberOfLines={2}
        >
          {desc}
        </Text>
      </View>

      <View style={styles.spacer} />

      <View
        style={[
          styles.cta,
          { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
        ]}
      >
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
    minHeight: 186,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconTile: {
    width: 46,
    height: 46,
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
  body: {
    minWidth: 0,
  },
  desc: {
    // lineHeight is set inline per language (Hindi needs more leading than Latin).
  },
  spacer: {
    flex: 1,
    minHeight: 12,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  ctaChevron: {
    fontSize: 16,
    lineHeight: 16,
  },
});

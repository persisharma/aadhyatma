import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage } from '@/data/gita/language';
import { isLatinLang, meaningToken, pillTextStyle, titleFontByLang } from '@/utils/langType';
import { coverRect } from '@/utils/coverRect';

/**
 * The one content-listing card (design.md §82, RULEBOOK §3 "Listing cards").
 * Every screen that lists the units of one section — comic episodes, Garud Puran
 * readings, a kids-story shelf — renders this card, so the three listings can
 * never drift apart again:
 *
 *   [ thumb ]  eyebrow · title · one-line description · meta   ›
 *
 * - The thumb is 92 wide and stretches to the card's full height (at least
 *   115 = 4:5); `thumbnail` must fill it (absolute fill, cover-cropped).
 * - The title is the reading language only — the toggle above the list gives
 *   the other language. Never a second-language subtitle.
 * - `description` is optional and always one line; copy is written to fit, not
 *   truncated (RULEBOOK §3 budget).
 * - `meta` is the unit count ("4 पृष्ठ"). Age, kind and other tags do not go
 *   on cards; shelf-wide facts belong in `ListingScope`.
 */
export const LISTING_THUMB_WIDTH = 92;
export const LISTING_THUMB_MIN_HEIGHT = 115;

type Props = {
  testID?: string;
  title: string;
  eyebrow?: string;
  description?: string;
  meta: string;
  /** Read fraction 0–1 where the section tracks progress; omitted otherwise. */
  progress?: number;
  thumbnail: React.ReactNode;
  onPress: () => void;
  /** Defaults to `eyebrow. title. meta. Tap to open.` (the Maestro selector shape). */
  accessibilityLabel?: string;
};

export default function ListingCard({ testID, title, eyebrow, description, meta, progress, thumbnail, onPress, accessibilityLabel }: Props) {
  const { colors, radii, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const latin = isLatinLang(lang);
  const bodyFont = meaningToken(lang, typography).fontFamily;
  const body = latin ? typography.listingBodyLatin : typography.listingBody;
  const titleSize = latin ? typography.listingTitleLatin : typography.listingTitle;
  const eyebrowStyle = latin
    ? pillTextStyle(lang, typography.sectionLabel)
    : { fontFamily: titleFontByLang(lang), ...typography.listingEyebrow };
  const label = accessibilityLabel ?? `${eyebrow ? `${eyebrow}. ` : ''}${title}. ${meta}. Tap to open.`;
  const read = progress === undefined ? undefined : Math.min(1, Math.max(0, progress));

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={read === undefined ? undefined : { min: 0, max: 100, now: Math.round(read * 100) }}
      style={({ pressed }) => [
        styles.card,
        { borderRadius: radii.lg, borderColor: colors.cardActiveBorder },
        pressed && { opacity: 0.86 },
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]}
      />
      <View testID={testID ? `${testID}-thumb` : undefined} style={[styles.thumb, { borderRadius: radii.sm, backgroundColor: colors.parchmentSoft }]}>
        {thumbnail}
      </View>
      <View style={styles.body}>
        {eyebrow ? <Text style={[eyebrowStyle, { color: colors.saffronDeep }]}>{eyebrow}</Text> : null}
        <Text
          numberOfLines={2}
          style={{ color: colors.ink, fontFamily: titleFontByLang(lang), fontStyle: latin ? 'italic' : 'normal', ...titleSize }}
        >
          {title}
        </Text>
        {description ? (
          <Text numberOfLines={1} style={{ color: colors.inkSoft, fontFamily: bodyFont, ...body }}>
            {description}
          </Text>
        ) : null}
        <Text style={{ color: colors.inkMuted, fontFamily: bodyFont, ...body }}>{meta}</Text>
        {read === undefined ? null : (
          <View testID={testID ? `${testID}-progress` : undefined} style={[styles.track, { backgroundColor: colors.saffronTint }]}>
            <View style={[styles.fill, { width: `${read * 100}%`, backgroundColor: colors.saffron }]} />
          </View>
        )}
      </View>
      <Text accessible={false} style={[styles.chev, { color: colors.saffron }]}>›</Text>
    </Pressable>
  );
}

/** A group heading inside a listing ("जीवन की सीख", "नवरात्रि के नौ रूप"). */
export function ListingSectionHeader({ children }: { children: string }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <Text
      accessibilityRole="header"
      style={{
        color: colors.saffronDeep,
        fontFamily: isLatinLang(lang) ? fontFamilies.latinSemiBold : titleFontByLang(lang),
        marginTop: 6,
        ...typography.listingSection,
      }}
    >
      {children}
    </Text>
  );
}

/** The one centred line under the toggle that states what the whole list is. */
export function ListingScope({ children, testID }: { children: string; testID?: string }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <Text
      testID={testID}
      style={{ color: colors.inkSoft, fontFamily: meaningToken(lang, typography).fontFamily, textAlign: 'center', ...typography.listingScope }}
    >
      {children}
    </Text>
  );
}

/**
 * A bundled image cover-cropped into the listing thumb, keeping `focusX` (0–1
 * across the painting) in view — wide paintings put their subject off-centre.
 */
export function ListingThumbImage({ source, focusX = 0.5 }: { source: ImageSourcePropType; focusX?: number }) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const asset = Image.resolveAssetSource(source);
  const rect = box.width && asset?.width ? coverRect(asset.width, asset.height, box.width, box.height, focusX) : null;
  return (
    <View
      style={StyleSheet.absoluteFillObject}
      onLayout={event => setBox({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
    >
      {rect ? (
        <Image
          source={source}
          accessible={false}
          resizeMode="stretch"
          style={{ position: 'absolute', width: rect.width, height: rect.height, left: rect.left, top: rect.top }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    ...elevation.lifted,
  },
  thumb: {
    width: LISTING_THUMB_WIDTH,
    minHeight: LISTING_THUMB_MIN_HEIGHT,
    alignSelf: 'stretch',
    flexShrink: 0,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  track: {
    height: 3,
    borderRadius: 2,
    marginTop: 5,
    overflow: 'hidden',
  },
  fill: {
    height: 3,
  },
  chev: {
    fontSize: 26,
    includeFontPadding: false,
  },
});

import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { fontFamilies } from '@/theme/typography';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { captionFont } from '@/utils/scriptFont';
import { isLatinLang, meaningToken, pillTextStyle, titleFontByLang } from '@/utils/langType';
import { coverRect } from '@/utils/coverRect';
import { backgroundAspectRatio, type BackgroundImage } from '@/data/backgroundAsset';
import CachedArtwork from './CachedArtwork';

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
 * - The standard title is the reading language only — the toggle above the list gives
 *   the other language. Never a second-language subtitle.
 * - `description` is optional and always one line; copy is written to fit, not
 *   truncated (RULEBOOK §3 budget).
 * - `meta` is the unit count ("4 पृष्ठ"). Age, kind and other tags do not go
 *   on cards; shelf-wide facts belong in `ListingScope`.
 * - Vrat uses `observance` (78dp square) and `upcoming` (110x72 scene)
 *   variants of this same shell. Their bilingual caption/date/save slots are
 *   calendar metadata, not changes to the standard story/reading contract.
 */
export const LISTING_THUMB_WIDTH = 92;
export const LISTING_THUMB_MIN_HEIGHT = 115;

type Props = {
  testID?: string;
  title: string;
  eyebrow?: string;
  description?: string;
  meta: React.ReactNode;
  secondary?: string;
  variant?: 'standard' | 'observance' | 'upcoming';
  language?: Lang;
  action?: React.ReactNode;
  showChevron?: boolean;
  actionCount?: 1 | 2;
  /** Read fraction 0–1 where the section tracks progress; omitted otherwise. */
  progress?: number;
  thumbnail: React.ReactNode;
  onPress: () => void;
  /** Defaults to `eyebrow. title. meta. Tap to open.` (the Maestro selector shape). */
  accessibilityLabel?: string;
};

export default function ListingCard({ testID, title, eyebrow, description, meta, progress, thumbnail, onPress, accessibilityLabel, secondary, variant = 'standard', language, action, showChevron = true, actionCount = 1 }: Props) {
  const { colors, radii, typography } = useTheme();
  const { lang: readingLang } = useGitaLanguage();
  const lang = language ?? readingLang;
  const upcoming = variant === 'upcoming';
  const observance = variant === 'observance';
  const special = upcoming || observance;
  const latin = isLatinLang(lang);
  const bodyFont = meaningToken(lang, typography).fontFamily;
  const body = latin ? typography.listingBodyLatin : typography.listingBody;
  const titleSize = latin ? typography.listingTitleLatin : typography.listingTitle;
  const eyebrowStyle = latin
    ? pillTextStyle(lang, typography.sectionLabel)
    : { fontFamily: titleFontByLang(lang), ...typography.listingEyebrow };
  const label = accessibilityLabel ?? `${eyebrow ? `${eyebrow}. ` : ''}${title}. ${typeof meta === 'string' ? meta : ''}. Tap to open.`;
  const read = progress === undefined ? undefined : Math.min(1, Math.max(0, progress));

  return (
    <ListingCardFrame testID={testID} onPress={onPress} accessibilityLabel={label}
      accessibilityValue={read === undefined ? undefined : { min: 0, max: 100, now: Math.round(read * 100) }}
      action={action} tone={special ? 'catalog' : 'reading'}
      style={special ? (upcoming ? styles.upcomingCard : [styles.observanceCard, actionCount === 2 && { minHeight: 104 }]) : styles.card}
      contentStyle={special ? (upcoming ? styles.upcomingContent : styles.observanceContent) : undefined}>
      <View testID={testID ? `${testID}-thumb` : undefined} style={[special ? (upcoming ? styles.upcomingThumb : styles.observanceThumb) : styles.thumb, { borderRadius: radii.sm, backgroundColor: colors.parchmentSoft }]}>
        {thumbnail}
      </View>
      <View style={[styles.body, upcoming && styles.upcomingBody]}>
        {eyebrow ? <Text style={[eyebrowStyle, { color: colors.saffronDeep }]}>{eyebrow}</Text> : null}
        <Text
          numberOfLines={special ? undefined : 2}
          style={{ color: special ? colors.catalogAccent : colors.ink, fontFamily: titleFontByLang(lang), fontStyle: latin ? 'italic' : 'normal', ...titleSize, ...(special ? { fontSize: upcoming ? 15 : 17, lineHeight: upcoming ? 24 : 27 } : {}) }}
        >
          {title}
        </Text>
        {secondary ? <Text style={{ ...captionFont(secondary), fontSize: 13, lineHeight: 18, color: colors.inkMuted }}>{secondary}</Text> : null}
        {description ? (
          <Text numberOfLines={1} style={{ color: colors.inkSoft, fontFamily: bodyFont, ...body }}>
            {description}
          </Text>
        ) : null}
        {typeof meta === 'string' ? <Text style={{ color: colors.inkMuted, fontFamily: bodyFont, ...body }}>{meta}</Text> : meta}
        {read === undefined ? null : (
          <View testID={testID ? `${testID}-progress` : undefined} style={[styles.track, { backgroundColor: colors.saffronTint }]}>
            <View style={[styles.fill, { width: `${read * 100}%`, backgroundColor: colors.saffron }]} />
          </View>
        )}
      </View>
      {!upcoming && showChevron && <Text accessible={false} style={[styles.chev, observance && styles.observanceChevron, { color: colors.saffron }]}>›</Text>}
    </ListingCardFrame>
  );
}

/** Shared painted listing surface, also used by Vrat's scene cards. The
 * action is a sibling of the open target, so saving never opens the detail. */
export function ListingCardFrame({ children, action, onPress, accessibilityLabel, accessibilityValue, testID, style, contentStyle, tone = 'reading' }: {
  children: React.ReactNode;
  action?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityValue?: { min: number; max: number; now: number };
  testID?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  tone?: 'reading' | 'catalog';
}) {
  const { colors, radii } = useTheme();
  const calendar = tone === 'catalog';
  const corner = calendar ? radii.md : radii.lg;
  const depth = calendar ? elevation.card : elevation.lifted;
  const frame = { borderWidth: 1, borderRadius: corner, borderColor: calendar ? colors.catalogBorder : colors.cardActiveBorder, backgroundColor: calendar ? colors.catalogSurface : colors.cardActiveFrom };
  const painting = <LinearGradient colors={calendar ? [colors.catalogSurface, colors.parchmentSoft] : [colors.cardActiveFrom, colors.cardActiveTo]}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: corner }]} />;
  if (!onPress) return <View testID={testID} style={[frame, depth, style]}>{painting}{children}</View>;
  if (action) {
    return <View style={[frame, depth, style]}>
      {painting}
      <Pressable testID={testID} onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityValue={accessibilityValue}
        style={({ pressed }) => [contentStyle, pressed && { opacity: 0.86 }]}>{children}</Pressable>
      {action}
    </View>;
  }
  return <Pressable testID={testID} onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    accessibilityValue={accessibilityValue}
    style={({ pressed }) => [frame, depth, style, contentStyle, pressed && { opacity: 0.86 }]}>
    {painting}{children}
  </Pressable>;
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
 * A painting cover-cropped into the listing thumb, keeping `focusX` (0–1
 * across the painting) in view — wide paintings put their subject off-centre.
 * Bundled images use their intrinsic size; published R2 paintings use the
 * manifest dimensions, so the crop is known before anything downloads.
 */
export function ListingThumbImage({ source, focusX = 0.5 }: { source: BackgroundImage; focusX?: number }) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const asset = typeof source === 'number' ? Image.resolveAssetSource(source) : undefined;
  const remoteRatio = backgroundAspectRatio(source);
  const size = asset?.width && asset.height ? { width: asset.width, height: asset.height }
    : remoteRatio ? { width: remoteRatio, height: 1 } : null;
  const rect = box.width && size ? coverRect(size.width, size.height, box.width, box.height, focusX) : null;
  // right/bottom 'auto' so the cached image's absolute-fill base cannot stretch it back to the box.
  const placement = rect ? { position: 'absolute' as const, width: rect.width, height: rect.height, left: rect.left, top: rect.top, right: 'auto' as const, bottom: 'auto' as const } : null;
  return (
    <View
      style={StyleSheet.absoluteFillObject}
      onLayout={event => setBox({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
    >
      {placement && typeof source === 'number' ? (
        <Image source={source} accessible={false} resizeMode="stretch" style={placement} />
      ) : null}
      {placement && typeof source !== 'number' ? (
        <CachedArtwork source={source} style={StyleSheet.absoluteFill} imageStyle={placement} resizeMode="stretch" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  observanceCard: { marginBottom: 6, minHeight: 92 },
  upcomingCard: { width: 155, flexShrink: 0 },
  observanceContent: { minWidth: 0, flexDirection: 'row', alignItems: 'center', padding: 6, paddingRight: 48, gap: 12 },
  upcomingContent: { padding: 6, gap: 3 },
  observanceThumb: { width: 78, height: 78, flexShrink: 0, overflow: 'hidden' },
  upcomingThumb: { width: 110, height: 72, flexShrink: 0, overflow: 'hidden' },
  upcomingBody: { flex: 0, alignSelf: 'stretch', paddingHorizontal: 2, gap: 0 },
  observanceChevron: { position: 'absolute', bottom: 5, right: 16, fontSize: 20 },
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

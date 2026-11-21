import React from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { isLatinLang, meaningToken, pillTextStyle, titleFontByLang } from '@/utils/langType';
import ProseParagraph from '@/components/ProseParagraph';
import FramedPainting from '@/components/FramedPainting';
import { ListingCardFrame } from '@/components/ListingCard';
import AppIcon from '@/components/AppIcon';
import { sanatanArtwork } from '@/data/sanatan-parichay/artwork';
import type { Pair } from '@/data/sanatan-parichay';

export function useSanatanText() {
  const { lang } = useGitaLanguage();
  return (pair: Pair) => contentByLang(lang, pair[0], pair[1]);
}

/** A page heading sits one step above the reading size; section heads use `ListingSectionHeader`. */
const HEADING_STEP = 2;

export function Copy({ children, heading = false, testID }: { children: string; heading?: boolean; testID?: string }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const token = meaningToken(lang, typography);
  return <ProseParagraph testID={testID} accessibilityRole={heading ? 'header' : undefined} style={{
    ...token, color: colors.ink, marginVertical: 8,
    ...(heading ? { fontFamily: titleFontByLang(lang), fontSize: token.fontSize + HEADING_STEP, lineHeight: Math.max(token.lineHeight + 3, Math.ceil((token.fontSize + HEADING_STEP) * 1.7)) } : {}),
  }}>{children}</ProseParagraph>;
}

/** All collection artwork has the same approved crop. No icon fallback family. */
export function Painting({ id, small = false }: { id: string; small?: boolean }) {
  return <FramedPainting source={sanatanArtwork[id]} small={small} testID={`sanatan-artwork-${id}${small ? '-thumbnail' : ''}`} />;
}

export function Action({ label, onPress, selected = false, disabled = false, testID, style }: {
  label: string; onPress: () => void; selected?: boolean; disabled?: boolean; testID?: string; style?: ViewStyle;
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  return <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled }}
    accessibilityLabel={label} testID={testID} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [{ minHeight: 48, padding: 12, borderRadius: 14, borderWidth: 1,
      borderColor: selected ? colors.saffronDeep : colors.divider,
      backgroundColor: selected ? colors.saffronDeep : colors.parchmentSoft,
      opacity: disabled ? 0.45 : pressed ? 0.7 : 1, justifyContent: 'center', ...style }]}>
    <Text style={{ ...meaningToken(lang, typography), fontFamily: titleFontByLang(lang), color: selected ? colors.brandIvory : colors.ink }}>{label}</Text>
  </Pressable>;
}

export function Panel({ children }: { children: React.ReactNode }) {
  return <ListingCardFrame style={{ padding: 16, gap: 8, overflow: 'hidden' }}>{children}</ListingCardFrame>;
}

/** The small saffron-tint tag above a page heading: the collection, or what the page is. */
export function PagePill({ children }: { children: string }) {
  const { colors, radii, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const text = isLatinLang(lang) ? pillTextStyle(lang, typography.sectionLabel) : { fontFamily: titleFontByLang(lang), ...typography.listingEyebrow };
  return <View style={{ flexShrink: 1, minWidth: 0, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 3, borderRadius: radii.pill, backgroundColor: colors.saffronTint }}>
    <Text style={[text, { color: colors.saffronDeep }]}>{children}</Text>
  </View>;
}

/** A defined word or a sub-point's name: the title face at reading size, in saffron. */
export function TermHead({ children }: { children: string }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  return <Text style={{ ...meaningToken(lang, typography), fontFamily: titleFontByLang(lang), color: colors.saffronDeep }}>{children}</Text>;
}

/** An onward link in the listing voice: the shared card surface, a wrapping listing title, a chevron. */
export function LinkRow({ label, description, onPress, testID }: { label: string; description?: string; onPress: () => void; testID?: string }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const latin = isLatinLang(lang);
  return <ListingCardFrame testID={testID} onPress={onPress} accessibilityLabel={label}
    contentStyle={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
    <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
      <Text style={{ ...(latin ? typography.listingTitleLatin : typography.listingTitle), fontFamily: titleFontByLang(lang), fontStyle: latin ? 'italic' : 'normal', color: colors.ink }}>{label}</Text>
      {description ? <Text style={{ ...(latin ? typography.listingBodyLatin : typography.listingBody), fontFamily: meaningToken(lang, typography).fontFamily, color: colors.inkSoft }}>{description}</Text> : null}
    </View>
    <AppIcon name="next" size={18} color={colors.saffronDeep} />
  </ListingCardFrame>;
}

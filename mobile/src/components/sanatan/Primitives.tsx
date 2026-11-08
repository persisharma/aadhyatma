import React from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import ProseParagraph from '@/components/ProseParagraph';
import FramedPainting from '@/components/FramedPainting';
import { ListingCardFrame } from '@/components/ListingCard';
import AppIcon, { type AppIconName } from '@/components/AppIcon';
import { sanatanArtwork } from '@/data/sanatan-parichay/artwork';
import type { Pair } from '@/data/sanatan-parichay';

export function useSanatanText() {
  const { lang } = useGitaLanguage();
  return (pair: Pair) => contentByLang(lang, pair[0], pair[1]);
}

export function Copy({ children, heading = false, testID }: { children: string; heading?: boolean; testID?: string }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const token = meaningToken(lang, typography);
  return <ProseParagraph testID={testID} accessibilityRole={heading ? 'header' : undefined} style={{
    ...token, color: colors.ink, marginVertical: 8,
    ...(heading ? { fontFamily: titleFontByLang(lang), fontSize: token.fontSize + 5, lineHeight: Math.max(token.lineHeight + 7, Math.ceil((token.fontSize + 5) * 1.7)) } : {}),
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

export function PrimaryAction({ label, onPress, testID }: { label: string; onPress: () => void; testID?: string }) {
  const { colors, radii } = useTheme();
  const { lang } = useGitaLanguage();
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 52, paddingHorizontal: 18, paddingVertical: 12, borderRadius: radii.md,
      backgroundColor: colors.saffronDeep, opacity: pressed ? 0.8 : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 })}>
    <Text style={{ flex: 1, fontFamily: titleFontByLang(lang), fontSize: 17, lineHeight: 29, color: colors.brandIvory }}>{label}</Text>
    <AppIcon name="next" size={20} color={colors.brandIvory} />
  </Pressable>;
}

export function ToolAction({ label, icon, onPress, selected = false, disabled = false, compact = false }: {
  label: string; icon: AppIconName; onPress: () => void; selected?: boolean; disabled?: boolean; compact?: boolean;
}) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 48, flexDirection: 'row', alignItems: 'center',
      gap: 7, width: compact ? 48 : undefined, justifyContent: compact ? 'center' : undefined, paddingHorizontal: compact ? 0 : 10, borderRadius: 12, backgroundColor: selected ? colors.saffronTint : 'transparent', opacity: disabled ? 0.5 : pressed ? 0.7 : 1 })}>
    <AppIcon name={icon} size={20} color={colors.saffronDeep} weight={selected ? 'fill' : 'regular'} />
    {!compact && <Text style={{ fontFamily: titleFontByLang(lang), color: colors.saffronDeep, fontSize: 13, lineHeight: 22 }}>{label}</Text>}
  </Pressable>;
}

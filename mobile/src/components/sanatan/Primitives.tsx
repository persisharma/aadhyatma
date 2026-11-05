import React from 'react';
import { Image, Pressable, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { meaningToken, titleFontByLang } from '@/utils/langType';
import ProseParagraph from '@/components/ProseParagraph';
import { sanatanArtwork } from '@/data/sanatan-parichay/artwork';
import type { Pair } from '@/data/sanatan-parichay';

export function useSanatanText() {
  const { lang } = useGitaLanguage();
  return (pair: Pair) => contentByLang(lang, pair[0], pair[1]);
}

export function Copy({ children, heading = false }: { children: string; heading?: boolean }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const token = meaningToken(lang, typography);
  return <ProseParagraph accessibilityRole={heading ? 'header' : undefined} style={{
    ...token, color: colors.ink, marginVertical: 8,
    ...(heading ? { fontFamily: titleFontByLang(lang), fontSize: token.fontSize + 5, lineHeight: token.lineHeight + 7 } : {}),
  }}>{children}</ProseParagraph>;
}

/** All collection artwork has the same approved crop. No icon fallback family. */
export function Painting({ id, small = false }: { id: string; small?: boolean }) {
  return <Image source={sanatanArtwork[id]} accessible={false} resizeMode="cover"
    style={small ? { width: 81, height: 54, borderRadius: 10 } : { width: '100%', aspectRatio: 1.5, borderRadius: 16 }} />;
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
      backgroundColor: selected ? colors.parchmentSoft : colors.parchment,
      opacity: disabled ? 0.45 : pressed ? 0.7 : 1, justifyContent: 'center', ...style }]}>
    <Text style={{ ...meaningToken(lang, typography), fontFamily: titleFontByLang(lang), color: colors.ink }}>{label}</Text>
  </Pressable>;
}

export function Panel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={{ padding: 16, gap: 8, borderRadius: 18, backgroundColor: colors.parchmentSoft,
    borderWidth: 1, borderColor: colors.divider }}>{children}</View>;
}

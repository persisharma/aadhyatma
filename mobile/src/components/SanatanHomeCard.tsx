import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { titleFontByLang } from '@/utils/langType';
import AppIcon from '@/components/AppIcon';
import FramedPainting from '@/components/FramedPainting';

/** A single lazy Home door; the full learning registry stays outside launch evaluation. */
export default function SanatanHomeCard(props: { onPress: () => void; onPressIn: () => void; onPressOut: () => void }) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const title = contentByLang(lang, 'सनातन परिचय', 'Sanatan Parichay');
  const subtitle = contentByLang(lang, 'कभी सोचा है? चित्रों से जानें परम्पराओं का अर्थ।', 'Ever wondered? Discover the meaning behind traditions.');
  return <Pressable {...props} testID="home-sanatan-card" accessibilityRole="button" accessibilityLabel={`${title}. ${subtitle}`}
    style={({ pressed }) => ({ borderRadius: 18, borderWidth: 1, borderColor: colors.divider, backgroundColor: colors.parchmentSoft,
      overflow: 'hidden', opacity: pressed ? 0.7 : 1, marginBottom: 20 })}>
    <FramedPainting source={require('@assets/sanatan-parichay/basics.webp')} testID="sanatan-home-artwork" />
    <View style={{ padding: 18, gap: 8 }}>
      <Text style={{ fontFamily: titleFontByLang(lang), fontSize: typography.readerTitle.fontSize + 5, color: colors.ink }}>{title}</Text>
      <Text style={{ fontFamily: titleFontByLang(lang), fontSize: typography.readerTitle.fontSize, lineHeight: typography.readerTitle.fontSize * 1.6, color: colors.inkSoft }}>{subtitle}</Text>
      <AppIcon name="next" size={20} color={colors.saffronDeep} />
    </View>
  </Pressable>;
}

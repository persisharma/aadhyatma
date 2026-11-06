import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { titleFontByLang } from '@/utils/langType';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import AppIcon from '@/components/AppIcon';

type Props = {
  testID: string;
  titleHi: string;
  titleEn: string;
  localizedTitle?: string;
  action: string;
  accessibilityLabel: string;
  artwork: React.ReactNode;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

/** Shared illustrated Home entry: keep neighbouring banners in one visual family. */
export default function HomeBannerCard({ testID, titleHi, titleEn, localizedTitle, action,
  accessibilityLabel, artwork, onPress, onPressIn, onPressOut }: Props) {
  const { colors, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titles = orderTitlesByLanguage(lang, titleHi, titleEn, {
    devPrimary: 18, devSecondary: 12, latPrimary: 21, latSecondary: 12,
  });
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
    style={({ pressed }) => [styles.card, { borderRadius: radii.lg, borderColor: colors.cardActiveBorder,
      backgroundColor: colors.cardActiveFrom }, elevation.card, pressed && styles.pressed]}>
    <LinearGradient colors={[colors.cardActiveFrom, colors.cardActiveTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      pointerEvents="none" style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]} />
    <View style={styles.artwork} accessible={false}>{artwork}</View>
    <View style={styles.content}>
      <Text style={{ color: colors.ink, fontFamily: titles.primary.fontFamily, fontSize: titles.primary.fontSize,
        fontStyle: titles.primary.fontStyle, letterSpacing: titles.primary.letterSpacing,
        lineHeight: titles.primary.script === 'latin' ? 28 : 31 }}>
        {localizedTitle ?? titles.primary.text}
      </Text>
      <Text style={{ color: colors.inkMuted, fontFamily: titles.secondary.fontFamily, fontSize: titles.secondary.fontSize,
        fontStyle: titles.secondary.fontStyle, lineHeight: titles.secondary.script === 'latin' ? 18 : 22 }}>
        {titles.secondary.text}
      </Text>
      <View style={styles.actionRow}>
        <Text style={{ flexShrink: 1, color: colors.saffronDeep, fontFamily: titleFontByLang(lang), fontSize: 14, lineHeight: 24 }}>
          {action}
        </Text>
        <AppIcon name="next" size={18} color={colors.saffronDeep} />
      </View>
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { minHeight: 138, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 15 },
  pressed: { opacity: 0.88 },
  artwork: { width: 100, height: 100, flexShrink: 0, justifyContent: 'center' },
  content: { flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center', gap: 6 },
  actionRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 5 },
});

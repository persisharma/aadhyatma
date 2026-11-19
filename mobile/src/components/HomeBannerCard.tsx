import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { titleFontByLang } from '@/utils/langType';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import AppIcon from '@/components/AppIcon';

/** Side of the square picture; the card is as tall as it (more only when the text needs it). */
export const HOME_BANNER_ART = 84;

type Props = {
  testID: string;
  /** Already localized: the reading language only (RULEBOOK §3, one language per card). */
  title: string;
  action: string;
  accessibilityLabel: string;
  artwork: React.ReactNode;
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

/** Shared illustrated Home entry: keep neighbouring banners in one visual family. */
export default function HomeBannerCard({ testID, title, action,
  accessibilityLabel, artwork, onPress, onPressIn, onPressOut }: Props) {
  const { colors, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  // Only the primary line's type is used: the second-language line was dropped.
  const face = orderTitlesByLanguage(lang, title, title, {
    devPrimary: 18, devSecondary: 12, latPrimary: 21, latSecondary: 12,
  }).primary;
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
    style={({ pressed }) => [styles.card, { borderRadius: radii.lg, borderColor: colors.cardActiveBorder,
      backgroundColor: colors.cardActiveFrom }, elevation.card, pressed && styles.pressed]}>
    <LinearGradient colors={[colors.cardActiveFrom, colors.cardActiveTo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      pointerEvents="none" style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]} />
    {/* Edge to edge on the left and the full height of the card; it fills this slot. */}
    <View style={[styles.artwork, { borderTopLeftRadius: radii.lg - 1, borderBottomLeftRadius: radii.lg - 1 }]} accessible={false}>{artwork}</View>
    <View style={styles.content}>
      <Text style={{ color: colors.ink, fontFamily: face.fontFamily, fontSize: face.fontSize,
        fontStyle: face.fontStyle, letterSpacing: face.letterSpacing,
        lineHeight: face.script === 'latin' ? 28 : 31 }}>
        {title}
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
  card: { borderWidth: 1, flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  pressed: { opacity: 0.88 },
  artwork: { width: HOME_BANNER_ART, minHeight: HOME_BANNER_ART, flexShrink: 0, overflow: 'hidden' },
  content: { flex: 1, minWidth: 0, paddingVertical: 8, paddingRight: 12, justifyContent: 'center', gap: 2 },
  actionRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 5 },
});

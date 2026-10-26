import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import StoryIcon, { type StoryIconName } from './StoryIcon';
import AppIcon from './AppIcon';
import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

export default function CatalogCategoryTile({ title, subtitle, artwork, lang, accessibilityLabel, onPress, wide = false, testID }: {
  title: string;
  subtitle: string;
  artwork: StoryIconName;
  lang: Lang;
  accessibilityLabel: string;
  onPress: () => void;
  wide?: boolean;
  testID?: string;
}) {
  const { colors, typography, radii, spacing, elevation } = useTheme();
  const { width } = useWindowDimensions();
  const artSize = width < 360 ? 44 : 60;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { width: wide ? '100%' : '48%', padding: spacing.sm, gap: spacing.sm, borderRadius: radii.lg, borderColor: colors.catalogBorder, backgroundColor: colors.catalogSurface },
        elevation.subtle,
        pressed && { opacity: 0.7 },
      ]}
    >
      <StoryIcon name={artwork} size={artSize} />
      <View style={styles.meta}>
        <Text style={{ ...typography.cardHindi, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.catalogAccent }}>{title}</Text>
        <Text style={{ ...typography.catalogMeta, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkSoft }}>{subtitle}</Text>
      </View>
      {(wide || width >= 360) && <AppIcon name="next" size={16} color={colors.inkMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { minHeight: 88, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  meta: { flex: 1, minWidth: 0 },
});

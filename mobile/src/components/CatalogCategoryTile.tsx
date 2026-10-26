import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { StoryIconName } from './StoryIcon';
import CatalogCategoryArtwork from './CatalogCategoryArtwork';
import { ListingCardFrame } from './ListingCard';
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
  const { colors, typography } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const fullWidth = wide || width < 360 || fontScale > 1.2;
  return (
    <ListingCardFrame testID={testID} accessibilityLabel={accessibilityLabel} onPress={onPress}
      style={[styles.tile, { width: fullWidth ? '100%' : '48%' }]}>
      <CatalogCategoryArtwork name={artwork} />
      <View style={styles.meta}>
        <Text style={{ ...typography.cardHindi, fontSize: 15, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.catalogAccent }}>{title}</Text>
        <Text style={{ ...typography.catalogMeta, fontSize: lang === 'en' ? 11 : 12, lineHeight: 18, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkSoft }}>{subtitle}</Text>
      </View>
      <AppIcon name="next" size={16} color={colors.inkMuted} />
    </ListingCardFrame>
  );
}

const styles = StyleSheet.create({
  tile: { minHeight: 60, padding: 6, gap: 8, flexDirection: 'row', alignItems: 'center' },
  meta: { flex: 1, minWidth: 0 },
});

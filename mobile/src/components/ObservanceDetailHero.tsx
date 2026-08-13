import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { scriptTitleFont } from '@/utils/langType';

/**
 * Shared observance-detail hero: optional leading tags/ornament, centred title
 * and caption, then the quiet next-date pill. Domain copy stays with callers.
 */
export default function ObservanceDetailHero({
  leading,
  title,
  caption,
  nextLabel,
  layout = 'observance',
  style,
}: {
  leading?: React.ReactNode;
  title: string;
  caption?: React.ReactNode;
  nextLabel?: string | null;
  layout?: 'observance' | 'smaran';
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  return (
    <View style={[styles.hero, style]}>
      {leading != null && <View style={styles.leading}>{leading}</View>}
      <Text
        style={{
          fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
          fontSize: 24,
          color: colors.ink,
          textAlign: 'center',
          marginTop: leading != null ? (layout === 'smaran' ? 6 : 8) : 0,
        }}
      >
        {title}
      </Text>
      {caption != null && <View style={styles.caption}>{caption}</View>}
      {nextLabel ? (
        <View
          style={[
            styles.nextPill,
            layout === 'smaran' && styles.smaranNextPill,
            { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
          ]}
        >
          <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffronDeep }}>
            {nextLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 6, marginBottom: 8 },
  leading: { alignItems: 'center' },
  caption: { alignItems: 'center', marginTop: 4 },
  nextPill: { marginTop: 8, paddingHorizontal: 14, paddingVertical: 6 },
  smaranNextPill: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 7 },
});

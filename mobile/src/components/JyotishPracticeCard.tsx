import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = {
  titleHi?: string;
  titleEn?: string;
  subtitleHi?: string;
  subtitleEn?: string;
  accessibilityLabel?: string;
  onPress: () => void;
};

export default function JyotishPracticeCard({
  titleHi = 'नवग्रह स्तोत्रम्',
  titleEn = 'Navagraha Stotram',
  subtitleHi = 'ऐप में पहले से उपलब्ध पारम्परिक पाठ',
  subtitleEn = 'An existing traditional practice in your library',
  accessibilityLabel = 'Open Navagraha Stotram',
  onPress,
}: Props) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: colors.divider,
          backgroundColor: colors.goldTint,
          borderRadius: radii.lg,
        },
        pressed && { opacity: 0.72 },
      ]}
    >
      <Text style={[styles.symbol, { color: colors.gold }]}>ॐ</Text>
      <View style={styles.copy}>
        <Text
          style={[
            pillTextStyle(lang, typography.sectionLabel),
            styles.label,
            { color: colors.saffronDeep },
          ]}
        >
          {contentByLang(lang, 'सुझाई गई साधना', 'Recommended practice')}
        </Text>
        <Text
          style={{
            color: colors.ink,
            fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
            fontSize: 15,
            marginTop: 2,
          }}
        >
          {contentByLang(lang, titleHi, titleEn)}
        </Text>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 10,
            lineHeight: 14,
            marginTop: 1,
          }}
        >
          {meaningByLang(lang, subtitleHi, subtitleEn)}
        </Text>
      </View>
      <Text style={{ color: colors.saffronDeep, fontSize: 19 }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbol: {
    fontFamily: fontFamilies.devanagariBold,
    fontSize: 24,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontSize: 8,
  },
});

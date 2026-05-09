import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  width: number;
  nextTitle: string;
  lang: 'hi' | 'en';
};

export default function NextChapterCard({ width, nextTitle, lang }: Props) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.root, { width }]}>
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            {
              color: colors.inkMuted,
              fontFamily: typography.pageCounter.fontFamily,
              fontSize: 14,
            },
          ]}
        >
          {lang === 'hi' ? 'अगला' : 'Next'}
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: colors.saffronDeep,
              fontFamily:
                lang === 'hi'
                  ? typography.readerTitle.fontFamily
                  : typography.cardLatin.fontFamily,
              fontSize: 20,
              fontStyle: lang === 'en' ? 'italic' : 'normal',
            },
          ]}
        >
          {nextTitle}
        </Text>
        <Text style={[styles.chevron, { color: colors.saffronDeep }]}>›</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    includeFontPadding: false,
  },
  title: {
    includeFontPadding: false,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  chevron: {
    fontSize: 32,
    lineHeight: 36,
    includeFontPadding: false,
    marginTop: 4,
  },
});

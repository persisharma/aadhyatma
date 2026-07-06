import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import type { Lang } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { titleFontByLang, scriptBodyFont } from '@/utils/langType';

type Props = {
  width: number;
  prevTitle: string;
  lang: Lang;
};

export default function PrevChapterCard({ width, prevTitle, lang }: Props) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.root, { width }]}>
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            {
              color: colors.inkMuted,
              fontFamily:
                lang === 'en'
                  ? typography.pageCounter.fontFamily
                  : scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 14,
            },
          ]}
        >
          {pick(lang, { hi: 'पिछला', en: 'Previous', gu: 'પાછળ', kn: 'ಹಿಂದಿನ' })}
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: colors.saffronDeep,
              fontFamily: titleFontByLang(lang),
              fontSize: 20,
              fontStyle: lang === 'en' ? 'italic' : 'normal',
            },
          ]}
        >
          {prevTitle}
        </Text>
        <Text style={[styles.chevron, { color: colors.saffronDeep }]}>‹</Text>
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
    // Indic label — keep Android's font padding so matras aren't clipped.
  },
  title: {
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

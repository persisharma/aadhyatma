import React from 'react';
import { Text } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken } from '@/utils/langType';

/**
 * Comic editions are authored in Hindi, English, Gujarati and Kannada. Marathi reads
 * the Hindi edition and Telugu the English one (`comicLanguage`); say so instead of
 * silently switching language. Authored languages render nothing.
 */
export default function ComicLanguageNotice() {
  const { lang } = useGitaLanguage();
  const { colors, typography, spacing } = useTheme();
  if (lang !== 'mr' && lang !== 'te') return null;
  return <Text testID="comic-language-fallback" style={{ ...meaningToken(lang, typography), fontSize: typography.listingBody.fontSize + 2, lineHeight: typography.listingBody.lineHeight + 4, color: colors.inkSoft, paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.sm }}>
    {lang === 'mr'
      ? 'ही कॉमिक अद्याप मराठीत उपलब्ध नाही. हिंदी आवृत्ती दाखवली आहे.'
      : 'ఈ కామిక్ ఇంకా తెలుగులో అందుబాటులో లేదు. ఆంగ్ల సంచిక చూపబడుతోంది.'}
  </Text>;
}

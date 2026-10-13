import React from 'react';
import { Text } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken } from '@/utils/langType';

export default function ComicLanguageNotice() {
  const { lang } = useGitaLanguage();
  const { colors, typography, spacing } = useTheme();
  if (lang === 'hi' || lang === 'en') return null;
  return <Text testID="comic-language-fallback" style={{ ...meaningToken(lang, typography), color: colors.inkSoft, paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.sm }}>
    {lang === 'gu' ? 'આ વાર્તા હાલમાં હિન્દી અને અંગ્રેજીમાં ઉપલબ્ધ છે. અંગ્રેજી બતાવવામાં આવી છે.' : 'ಈ ಕಥೆ ಸದ್ಯ ಹಿಂದಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಲಭ್ಯವಿದೆ. ಇಂಗ್ಲಿಷ್ ತೋರಿಸಲಾಗಿದೆ.'}
  </Text>;
}

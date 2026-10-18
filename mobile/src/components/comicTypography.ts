import type { ComicLanguage } from '@/data/comicBooks';
import type { TypographyScale } from '@/theme/typography';
import { meaningToken } from '@/utils/langType';

// Approved comic metrics, using the shared script face and reading-size setting.
export function comicTextStyle(language: ComicLanguage, typography: TypographyScale, caption = false) {
  const token = meaningToken(language, typography);
  const large = token.fontSize > 20;
  const latin = language === 'en';
  return {
    fontFamily: token.fontFamily,
    fontSize: caption ? (latin ? (large ? 25 : 21) : (large ? 20 : 17)) : (latin ? (large ? 27 : 23) : (large ? 23 : 20)),
    lineHeight: caption ? (language === 'kn' ? (large ? 35 : 29) : (large ? (latin ? 31 : 32) : 26))
      : (language === 'kn' ? (large ? 40 : 34) : (large ? (latin ? 35 : 38) : (latin ? 30 : 32))),
  };
}

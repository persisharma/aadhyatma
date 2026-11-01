import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, pick } from '@/utils/localize';
import { titleFontByLang, scriptBodyFont } from '@/utils/langType';

export function companionTagline(lang: Lang): string {
  return pick(lang, {
    hi: 'आपका आध्यात्मिक साथी', en: 'Your spiritual companion',
    gu: 'તમારો આધ્યાત્મિક સાથી', kn: 'ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಗಾತಿ',
  });
}

/** Shared live typography; the reference's custom lettering is still pending. */
export default function VedanshWordmark({ lang = 'hi', compact = false,
  bilingual = false, showTagline = true, fixedExport = false,
}: { lang?: Lang; compact?: boolean; bilingual?: boolean; showTagline?: boolean; fixedExport?: boolean }) {
  const { colors } = useTheme();
  const size = compact ? 18 : 32;
  return <View testID="vedansh-wordmark" style={styles.wrap}>
    <Text allowFontScaling={!fixedExport} style={{ color: colors.ink,
      fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : titleFontByLang(lang),
      fontSize: size, lineHeight: size * 1.6, letterSpacing: 0, textAlign: 'center', includeFontPadding: false,
    }}>{contentByLang(lang, 'वेदांश', 'Vedansh')}</Text>
    {bilingual && <Text allowFontScaling={!fixedExport} style={{ color: colors.saffronDeep,
      fontFamily: lang === 'en' ? fontFamilies.devanagariBold : fontFamilies.latinSemiBold,
      fontSize: compact ? 14 : 22, lineHeight: compact ? 23 : 35, textAlign: 'center', includeFontPadding: false,
    }}>{lang === 'en' ? 'वेदांश' : 'Vedansh'}</Text>}
    {showTagline && <Text allowFontScaling={!fixedExport} style={{ color: colors.inkSoft,
      fontFamily: lang === 'en' ? fontFamilies.latinItalic : scriptBodyFont(lang, fontFamilies.devanagari),
      fontSize: compact ? 12 : 16, lineHeight: compact ? 20 : 26,
      textAlign: 'center', includeFontPadding: false,
    }}>{companionTagline(lang)}</Text>}
  </View>;
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center', flexShrink: 1, maxWidth: '100%' } });

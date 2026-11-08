import React, { useContext, useLayoutEffect, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, pick } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';
import { ArtworkCaptureContext } from './ArtworkCaptureContext';
import manifest from '@assets/branding/wordmarks/manifest.json';

const marks = {
  en: require('@assets/branding/wordmarks/english.png'),
  hi: require('@assets/branding/wordmarks/hindi.png'),
};

export function companionTagline(lang: Lang): string {
  return pick(lang, {
    hi: 'आपका आध्यात्मिक साथी', en: 'Your spiritual companion',
    gu: 'તમારો આધ્યાત્મિક સાથી', kn: 'ನಿಮ್ಮ ಆಧ್ಯಾತ್ಮಿಕ ಸಂಗಾತಿ',
  });
}

export function WordmarkArtwork({ kind, width, tintColor }: {
  kind: 'hi' | 'en'; width: number; tintColor?: string;
}) {
  const capture = useContext(ArtworkCaptureContext);
  const painted = useRef(false);
  const release = useRef<(() => void) | undefined>(undefined);
  useLayoutEffect(() => {
    const done = capture?.register();
    release.current = done;
    if (painted.current) done?.();
    return () => { done?.(); release.current = undefined; };
  }, [capture]);
  const finish = () => { painted.current = true; release.current?.(); };
  const metrics = manifest.names[kind];
  return <Image testID={`vedansh-wordmark-${kind}`} source={marks[kind]} accessible={false}
    accessibilityIgnoresInvertColors resizeMode="contain" onLoad={finish} onError={finish}
    // RN supplies the bundled PNG's intrinsic height before applying this style.
    // Width + aspectRatio alone leaves that height in place (391dp for Hindi),
    // inflating centered rows and clipping the lettering at the share sky edge.
    style={{ width, height: width * metrics.height / metrics.width,
      maxWidth: '100%', aspectRatio: metrics.width / metrics.height, tintColor }} />;
}

/** Approved lettering is artwork, independent of app-language script selection. */
export default function VedanshWordmark({ lang = 'hi', compact = false,
  bilingual = false, showTagline = true, fixedExport = false,
}: { lang?: Lang; compact?: boolean; bilingual?: boolean; showTagline?: boolean; fixedExport?: boolean }) {
  const { colors } = useTheme();
  const primary = lang === 'hi' ? 'hi' : 'en';
  const secondary = primary === 'hi' ? 'en' : 'hi';
  const width = (kind: 'hi' | 'en', small = false) => kind === 'en'
    ? (compact ? 86 : small ? 132 : 180) : (compact ? 58 : small ? 78 : 110);
  return <View testID="vedansh-wordmark" style={styles.wrap} accessible accessibilityRole="image"
    accessibilityLabel={`${contentByLang(lang, 'वेदांश़', 'Vedansh')}${showTagline ? ` · ${companionTagline(lang)}` : ''}`}>
    <WordmarkArtwork key={primary} kind={primary} width={width(primary)} />
    {bilingual && <WordmarkArtwork key={secondary} kind={secondary} width={width(secondary, true)} />}
    {showTagline && <Text allowFontScaling={!fixedExport} style={{ color: colors.inkSoft,
      fontFamily: lang === 'en' ? fontFamilies.latinItalic : scriptBodyFont(lang, fontFamilies.devanagari),
      fontSize: compact ? 12 : 16, lineHeight: compact ? 20 : 26,
      textAlign: 'center', includeFontPadding: false,
    }}>{companionTagline(lang)}</Text>}
  </View>;
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center', flexShrink: 1, maxWidth: '100%', gap: 3 } });


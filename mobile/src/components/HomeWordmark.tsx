import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { scriptBodyFont } from '@/utils/langType';
import { contentByLang } from '@/utils/localize';
import manifest from '@assets/branding/wordmarks/manifest.json';
import { companionTagline, WordmarkArtwork } from './VedanshWordmark';

/** Home keeps its small Om-flanked crest; only the lettering style is new. */
export default function HomeWordmark({ compact = false, showTagline = true }: {
  compact?: boolean; showTagline?: boolean;
}) {
  const { lang } = useGitaLanguage();
  const { colors, typography } = useTheme();
  const kind = lang === 'hi' ? 'hi' : 'en';
  const metrics = manifest.names[kind];
  // Fit the approved glyphs to the old 27pt title's visible height, not the
  // larger launch/share lockup. The extra row space preserves Indic marks.
  const width = 28 * metrics.width / metrics.height;
  const mark = (side: 'left' | 'right') => (
    <View testID={`home-wordmark-om-${side}`} style={[styles.mark, { borderColor: colors.iconAccent }]}>
      <Text accessible={false} allowFontScaling={false} style={[styles.markText,
        { color: colors.iconAccent, fontFamily: typography.thumb.fontFamily }]}>ॐ</Text>
    </View>
  );
  return <View testID="home-wordmark" style={styles.wrap}>
    <View testID="home-wordmark-crest" accessible accessibilityRole="image"
      accessibilityLabel={contentByLang(lang, 'वेदांश़', 'Vedansh')}
      style={[styles.lockup, compact && styles.compact]}>
      {!compact && <View testID="home-wordmark-rule-left" style={[styles.rule, { backgroundColor: colors.iconAccent }]} />}
      {mark('left')}
      <View style={{ width, position: 'relative' }}>
        <WordmarkArtwork kind={kind} width={width} tintColor={colors.ink} />
        {kind === 'hi' && <View testID="home-wordmark-nukta" accessible={false}
          style={[styles.nukta, { backgroundColor: colors.ink }]} />}
      </View>
      {mark('right')}
      {!compact && <View testID="home-wordmark-rule-right" style={[styles.rule, { backgroundColor: colors.iconAccent }]} />}
    </View>
    {showTagline && <Text testID="home-wordmark-tagline" allowFontScaling style={[styles.subtitle, {
      color: colors.inkSoft,
      fontFamily: lang === 'en' ? fontFamilies.latinItalic : scriptBodyFont(lang, fontFamilies.devanagari),
    }]}>{companionTagline(lang)}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', maxWidth: '100%' },
  lockup: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  compact: { gap: 6 },
  rule: { width: 22, height: 1, opacity: 0.6 },
  mark: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 19, lineHeight: 30, includeFontPadding: false, textAlign: 'center', transform: [{ translateY: 1.5 }] },
  // The source crop has no nukta. This small brand detail sits below श, clear
  // of its baseline; the original approved animation and bitmap stay intact.
  nukta: { position: 'absolute', width: 1.6, height: 1.6, borderRadius: 0.8, left: '80%', bottom: -0.4 },
  subtitle: { marginTop: 5, textAlign: 'center', fontSize: 14, lineHeight: 22, includeFontPadding: false },
});

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
  // Align the visible dark lettering to the 30pt Om circles; decorative
  // flute/feather bounds must not shrink or vertically displace the name.
  // never tint the master, which would erase its copper/green accents.
  const frame = metrics.homeFrame;
  const width = frame.artworkWidth;
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
      <View testID="home-wordmark-artwork-frame" style={{ width: frame.width, height: frame.height, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: frame.translateY }] }}>
        <WordmarkArtwork kind={kind} width={width} />
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
  lockup: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  compact: { gap: 6 },
  rule: { width: 22, height: 1, opacity: 0.6 },
  mark: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 19, lineHeight: 30, includeFontPadding: false, textAlign: 'center', transform: [{ translateY: 1.5 }] },
  subtitle: { marginTop: 5, textAlign: 'center', fontSize: 14, lineHeight: 22, includeFontPadding: false },
});

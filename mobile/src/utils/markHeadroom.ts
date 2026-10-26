import { StyleSheet, type StyleProp, type TextStyle } from 'react-native';

/** Tallest above-base mark + descent, in em, over the card faces: Noto Devanagari/Kannada and
 * VedanshDevotionalText 1.53, Noto Gujarati 1.37, Tiro 1.21 (shaped hhea/glyf, plus margin). */
const GLYPH_EXTENT = 1.55;
/** iOS and Android cut a line box shorter than its glyphs from the top, and the Text clips there:
 * the first line lost matras, reph and anusvara (हे→ह, चौपाई→चापाइ, अर्थ→अथ). Pad the Text by the
 * shortfall and pull it up by the same amount, so the marks paint while layout stays unchanged. */
export function withMarkHeadroom(style: StyleProp<TextStyle>, fontScale = 1): StyleProp<TextStyle> {
  const { fontSize = 14, lineHeight } = StyleSheet.flatten(style) ?? {};
  const room = lineHeight ? Math.max(0, Math.ceil((GLYPH_EXTENT * fontSize - lineHeight) * fontScale)) : 0;
  return room ? [style, { paddingTop: room, marginTop: -room }] : style;
}

import React, { useEffect, useState } from 'react';
import { Image, PixelRatio, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { Lang } from '@/data/gita/language';
import { devotionalArtRequest } from '@/data/devotionalShareArt';
import { evictBackgroundAsset, subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';
import { devotionalFrameSpec, devotionalFrameCanvas as canvas } from '@/data/devotionalFrameSpec';
import { devotionalFrameType as type, devotionalFrameColors } from '@/theme/devotionalFrame';
import { fontFamilies } from '@/theme/typography';
import { pick } from '@/utils/localize';
import { splitDevotionalMeaning, type DevotionalArt } from '@/utils/devotionalShareLayout';

export function devotionalFace(lang: Lang): string {
  return lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada : fontFamilies.sanskritLatin;
}
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
/**
 * Resolve a master from R2 through the shared download-once cache. Every slice of one
 * card subscribes to the same content hash, so a card costs one download. `failed`
 * reports a download that could not complete, so capture refuses instead of sharing
 * a card with missing artwork.
 */
function useDevotionalArt(art: DevotionalArt): { uri: string | null; failed: boolean } {
  const request = devotionalArtRequest(art);
  const url = request?.remoteUrl ?? null;
  const [state, setState] = useState<{ url: string | null; uri: string | null; failed: boolean }>({ url: null, uri: null, failed: false });
  useEffect(() => {
    if (!request) { setState({ url, uri: null, failed: true }); return; }
    let active = true;
    const unsubscribe = subscribeBackgroundAsset(request, local => { if (active) setState({ url, uri: local, failed: !local }); });
    return () => { active = false; unsubscribe(); };
    // The manifest URL identifies the master; request objects are rebuilt per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return state.url === url ? state : { uri: null, failed: false };
}
/** One master image (or the paper colour while it downloads), reporting paint or failure. */
function MasterImage({ art, testID, style, resizeMode, onLoad, onError }: {
  art: DevotionalArt; testID?: string; style: { [key: string]: number | string };
  resizeMode: 'stretch' | 'cover'; onLoad?: () => void; onError?: () => void;
}) {
  const { uri, failed } = useDevotionalArt(art);
  useEffect(() => { if (failed) onError?.(); }, [failed]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!uri) return <View testID={testID} accessible={false} style={[style, { backgroundColor: devotionalFrameColors.paper }]} />;
  return <Image testID={testID} source={{ uri }} accessible={false} resizeMode={resizeMode} style={style} onLoad={onLoad}
    onError={() => { const request = devotionalArtRequest(art); if (request) void evictBackgroundAsset(request); onError?.(); }} />;
}
const plateArt = (art: DevotionalArt): DevotionalArt => (art === 'prayer' ? 'ganesha' : art);
/** Clip the full lossless master. Stretch only a specified plain-paper band. */
export function DevotionalSlice({ art, width, top, bottom, height, testID, onLoad, onError }: {
  art: DevotionalArt; width: number; top: number; bottom: number; height?: number;
  testID?: string; onLoad?: () => void; onError?: () => void;
}) {
  const displayHeight = height ?? (bottom - top) * width / canvas.width;
  const verticalScale = displayHeight / (bottom - top);
  return <View pointerEvents="none" accessible={false} style={{ width, height: displayHeight, overflow: 'hidden' }}>
    <MasterImage art={plateArt(art)} testID={testID} resizeMode="stretch"
      style={{ position: 'absolute', left: 0, top: -top * verticalScale, width, height: canvas.height * verticalScale }}
      onLoad={onLoad} onError={onError} />
  </View>;
}
export function DevotionalHero({ art, width, onLoad, onError }: {
  art: DevotionalArt; lang: Lang; width: number; onLoad?: () => void; onError?: () => void;
}) {
  const h = devotionalFrameSpec(art).hero;
  if (art === 'prayer') return <View testID="devotional-share-artwork" style={{ height: h * width / canvas.width, overflow: 'hidden' }}>
    <MasterImage art="prayer" testID="devotional-hero-image" resizeMode="cover"
      style={{ width, height: h * width / canvas.width }} onLoad={onLoad} onError={onError} />
  </View>;
  return <View testID="devotional-share-artwork"><DevotionalSlice art={art} width={width} top={0} bottom={h}
    testID="devotional-hero-image" onLoad={onLoad} onError={onError} /></View>;
}
/** Both decorated caps stay intact while the middle paper/vertical rules grow. */
function Panel({ art, width, top, bottom, topCap = 0, bottomCap = 0, children, overlay, testID, contentStyle, onLoad, onError }: {
  art: DevotionalArt; width: number; top: number; bottom: number; topCap?: number; bottomCap?: number;
  children?: React.ReactNode; overlay?: React.ReactNode; testID: string; contentStyle?: ViewStyle; onLoad?: () => void; onError?: () => void;
}) {
  const scale = width / canvas.width, minimum = (bottom - top) * scale;
  const [height, setHeight] = React.useState(minimum);
  const painted = React.useRef(new Set<string>());
  const paintedPart = (part: string) => { painted.current.add(part); if (painted.current.size === 1 + Number(topCap > 0) + Number(bottomCap > 0)) onLoad?.(); };
  return <View testID={testID} onLayout={e => setHeight(e.nativeEvent.layout.height)} style={{ minHeight: minimum }}>
    <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
      {topCap ? <DevotionalSlice art={art} width={width} top={top} bottom={top + topCap} onLoad={() => paintedPart('top')} onError={onError} /> : null}
      <DevotionalSlice art={art} width={width} top={top + topCap} bottom={bottom - bottomCap}
        height={Math.max(0, height - (topCap + bottomCap) * scale)} testID={`${testID}-image`} onLoad={() => paintedPart('middle')} onError={onError} />
      {bottomCap ? <DevotionalSlice art={art} width={width} top={bottom - bottomCap} bottom={bottom} onLoad={() => paintedPart('bottom')} onError={onError} /> : null}
    </View>
    <View style={contentStyle}>{children}</View>{overlay}
  </View>;
}
export function DevotionalVerseBody({ header, verse, meaning, lang, art, verseStyle, meaningStyle, width = 540, exportMode = false, onLoad, onError }: {
  header: string; verse: string; meaning: string; lang: Lang; art: DevotionalArt;
  verseStyle: TextStyle; meaningStyle: TextStyle; width?: number; inset?: number; exportMode?: boolean;
  onLoad?: () => void; onError?: () => void;
}) {
  const spec = devotionalFrameSpec(art), scale = width / canvas.width;
  const parts = splitDevotionalMeaning(meaning), face = devotionalFace(lang);
  const decoded = React.useRef(new Set<string>());
  const mark = (id: string) => { decoded.current.add(id); if (decoded.current.size === 6) onLoad?.(); };
  // Commentary sits on plain paper (its own flow box, no baked scenery), so there is
  // no image to await — clear its paint barrier on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { mark('comment'); }, []);
  const shortVerse = lang === 'hi' && !verse.includes('\n') && Array.from(verse).length <= 32;
  const shortMeaning = Array.from(parts.meaning).length < 55;
  // One calibrated size + one script-correct face for every header; long source
  // lines shrink-to-fit inside two lines instead of jumping size/face (which read
  // as the header flicking big↔small) or wrapping unbounded into the hero/divider.
  const sourceSize = spec.sourceFont * width / 540;
  const reading = { fontFamily: face, textAlign: 'center' as const, includeFontPadding: false };
  const bodyFace = lang === 'hi' ? shortMeaning ? fontFamilies.devanagari : type.bodyFace : face;
  const fit = (style: StyleProp<TextStyle>) => withMarkHeadroom(style, exportMode ? 1 : PixelRatio.getFontScale());
  return <View>
    <Panel art={art} width={width} top={spec.hero} bottom={spec.sourceEnd} bottomCap={28} testID="devotional-source-panel"
      contentStyle={{ paddingTop: spec.sourceTop * scale, paddingHorizontal: 120 * scale, paddingBottom: 22 * scale }} onLoad={() => mark('source')} onError={onError}>
      <Text testID="devotional-share-source" allowFontScaling={!exportMode} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.6} style={fit([reading, { fontSize: sourceSize, lineHeight: sourceSize * 1.3, color: '#7C210D', fontFamily: lang === 'hi' ? type.verseFace : face }])}>{header}</Text>
    </Panel>
    <Panel art={art} width={width} top={spec.sourceEnd} bottom={spec.verseEnd} testID="devotional-verse-panel"
      contentStyle={{ paddingHorizontal: 92 * scale }} onLoad={() => mark('verse')} onError={onError}>
      <Text testID="devotional-share-verse" allowFontScaling={!exportMode}
        style={fit([reading, verseStyle, exportMode && { fontSize: shortVerse ? 52 : lang === 'en' ? 27 : type.verseSize, lineHeight: shortVerse ? (spec.verseEnd - spec.sourceEnd) / 2 : lang === 'kn' ? 48 : lang === 'gu' ? 46 : type.verseLeading }, { color: '#2D1005', fontFamily: lang === 'hi' ? type.verseFace : face, transform: [{ translateY: shortVerse ? 16 * scale : 9 * scale }] }])}>{verse.trim()}</Text>
    </Panel>
    <DevotionalSlice art={art} width={width} top={spec.verseEnd} bottom={spec.meaningTop} testID="devotional-divider-image" onLoad={() => mark('divider')} onError={onError} />
    <Panel art={art} width={width} top={spec.meaningTop} bottom={spec.meaningBottom} topCap={68} bottomCap={48} testID="devotional-meaning-frame"
      overlay={<Text testID="devotional-meaning-label" allowFontScaling={!exportMode} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1}
        style={fit([reading, { position: 'absolute', top: (art === 'vishnu' ? 31 : 30) * scale, left: 490 * scale, width: 100 * scale, fontSize: (lang === 'en' ? 21 : art === 'vishnu' ? 30 : 42) * scale, lineHeight: 44 * scale, color: '#7C210D' }])}>{pick(lang, { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' })}</Text>}
      onLoad={() => mark('meaning')} onError={onError} contentStyle={{ paddingTop: spec.meaningPad * scale, paddingBottom: 22 * scale, paddingHorizontal: 86 * scale }}>
      <Text testID="devotional-share-meaning" allowFontScaling={!exportMode}
        style={fit([reading, meaningStyle, exportMode && { fontSize: shortMeaning ? 28 : lang === 'en' ? 23 : type.meaningSize, lineHeight: lang === 'kn' ? 38 : lang === 'gu' ? 34 : shortMeaning ? 34 : type.meaningLeading }, { color: '#602D0E', fontFamily: bodyFace }])}>{parts.meaning}</Text>
    </Panel>
    <DevotionalSlice art={art} width={width} top={spec.meaningBottom} bottom={spec.commentTop} testID="devotional-comment-divider-image" onLoad={() => mark('commentDivider')} onError={onError} />
    {/* Explanation on plain paper, its own flow box — no baked scenery to stretch,
        and it collapses to nothing when absent so the footer scenery rises to meet
        the reading instead of a large empty band (design.md §23). */}
    {parts.commentary ? (
      <View testID="devotional-commentary-panel"
        style={{ paddingHorizontal: 124 * scale, paddingTop: 11 * scale, paddingBottom: 18 * scale, backgroundColor: devotionalFrameColors.paper }}>
        <Text testID="devotional-share-commentary" allowFontScaling={!exportMode}
          style={fit([reading, meaningStyle, exportMode && { fontSize: shortMeaning || lang === 'en' ? 23 : type.commentarySize, lineHeight: lang === 'kn' ? 38 : lang === 'gu' ? 34 : type.commentaryLeading }, { color: '#602D0E', fontFamily: bodyFace }])}>{parts.commentary}</Text>
      </View>
    ) : null}
  </View>;
}
export function DevotionalFooter({ art, width, onLoad, onError }: { art: DevotionalArt; width: number; onLoad?: () => void; onError?: () => void }) {
  return <View testID="devotional-footer" accessible accessibilityLabel="Vedansh.app"><DevotionalSlice art={art} width={width} top={canvas.footerTop} bottom={canvas.height}
    testID="devotional-footer-image" onLoad={onLoad} onError={onError} /></View>;
}

import React, { useEffect, useState } from 'react';
import { Image, PixelRatio, Platform, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { Lang } from '@/data/gita/language';
import { devotionalArtRequest, devotionalPlateArt } from '@/data/devotionalShareArt';
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
/** Clip the complete portrait master. Stretch only a specified plain-paper band. */
export function DevotionalSlice({ art, width, top, bottom, height, testID, onLoad, onError }: {
  art: DevotionalArt; width: number; top: number; bottom: number; height?: number;
  testID?: string; onLoad?: () => void; onError?: () => void;
}) {
  const displayHeight = height ?? (bottom - top) * width / canvas.width;
  const verticalScale = displayHeight / (bottom - top);
  return <View pointerEvents="none" accessible={false} style={{ width, height: displayHeight, overflow: 'hidden' }}>
    <MasterImage art={devotionalPlateArt(art)} testID={testID} resizeMode="stretch"
      style={{ position: 'absolute', left: 0, top: -top * verticalScale, width, height: canvas.height * verticalScale }}
      onLoad={onLoad} onError={onError} />
  </View>;
}
export function DevotionalHero({ art, width, onLoad, onError }: {
  art: DevotionalArt; lang: Lang; width: number; onLoad?: () => void; onError?: () => void;
}) {
  const h = devotionalFrameSpec(art).hero;
  const [paintedArt, setPaintedArt] = useState<DevotionalArt | null>(null);
  const loaded = () => { setPaintedArt(art); onLoad?.(); };
  const failed = () => { setPaintedArt(null); onError?.(); };
  return <View testID="devotional-share-artwork">
    <View testID={`devotional-subject-${paintedArt === art ? art : `loading-${art}`}`} collapsable={false}>
      {art === 'prayer' ? <View style={{ height: h * width / canvas.width, overflow: 'hidden' }}>
        <MasterImage key={art} art={art} testID="devotional-hero-image" resizeMode="cover"
          style={{ width, height: h * width / canvas.width }} onLoad={loaded} onError={failed} />
      </View> : <DevotionalSlice key={art} art={art} width={width} top={0} bottom={h}
        testID="devotional-hero-image" onLoad={loaded} onError={failed} />}
    </View>
  </View>;
}
/** Mirror-tile a clean band of paper and rules into `height`, each tile `stretch`× the band, so a
 * tall box grows without smearing grain into streaks and each seam joins identical rows. */
function Tiles({ art, width, top, bottom, height, stretch, testID, onLoad, onError }: {
  art: DevotionalArt; width: number; top: number; bottom: number; height: number; stretch: number;
  testID?: string; onLoad?: () => void; onError?: () => void;
}) {
  const tile = (bottom - top) * width / canvas.width * stretch;
  const count = height > 0 ? Math.ceil(height / tile) : 0;
  const painted = React.useRef(new Set<number>());
  const report = () => { if (count && Array.from({ length: count }, (_, i) => i).every(i => painted.current.has(i))) onLoad?.(); };
  React.useEffect(report, [count]); // eslint-disable-line react-hooks/exhaustive-deps
  return <View style={{ height, overflow: 'hidden' }}>
    {Array.from({ length: count }, (_, i) => <View key={i} style={i % 2 ? { transform: [{ scaleY: -1 }] } : undefined}>
      <DevotionalSlice art={art} width={width} top={top} bottom={bottom} height={tile} testID={testID}
        onLoad={() => { painted.current.add(i); report(); }} onError={onError} />
    </View>)}
  </View>;
}
/** Both decorated caps stay intact while the middle paper/vertical rules grow: stretched, or
 * mirror-tiled at `tile`× when the middle is a clean band and the box may grow very tall. */
function Panel({ art, width, top, bottom, topCap = 0, bottomCap = 0, tile, children, overlay, testID, contentStyle, onLoad, onError }: {
  art: DevotionalArt; width: number; top: number; bottom: number; topCap?: number; bottomCap?: number; tile?: number;
  children?: React.ReactNode; overlay?: React.ReactNode; testID: string; contentStyle?: ViewStyle; onLoad?: () => void; onError?: () => void;
}) {
  const scale = width / canvas.width, minimum = (bottom - top) * scale;
  const [height, setHeight] = React.useState(minimum);
  const painted = React.useRef(new Set<string>());
  const paintedPart = (part: string) => { painted.current.add(part); if (painted.current.size === 1 + Number(topCap > 0) + Number(bottomCap > 0)) onLoad?.(); };
  const middle = Math.max(0, height - (topCap + bottomCap) * scale);
  return <View testID={testID} onLayout={e => setHeight(e.nativeEvent.layout.height)} style={{ minHeight: minimum }}>
    <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
      {topCap ? <DevotionalSlice art={art} width={width} top={top} bottom={top + topCap} onLoad={() => paintedPart('top')} onError={onError} /> : null}
      {tile ? <Tiles art={art} width={width} top={top + topCap} bottom={bottom - bottomCap} height={middle} stretch={tile}
        testID={`${testID}-tile`} onLoad={() => paintedPart('middle')} onError={onError} />
        : <DevotionalSlice art={art} width={width} top={top + topCap} bottom={bottom - bottomCap}
          height={middle} testID={`${testID}-image`} onLoad={() => paintedPart('middle')} onError={onError} />}
      {bottomCap ? <DevotionalSlice art={art} width={width} top={bottom - bottomCap} bottom={bottom} onLoad={() => paintedPart('bottom')} onError={onError} /> : null}
    </View>
    <View style={contentStyle}>{children}</View>{overlay}
  </View>;
}
/** Rows below the meaning box's 68px top cap that hold only paper and rules on every master
 * (a few above are the label dashes; below, some masters' corner curls begin, e.g. Durga +63). */
const BOX_TILE = [82, 128] as const;
export function DevotionalVerseBody({ header, verse, verseRows, meaning, lang, art, verseStyle, meaningStyle, width = 540, exportMode = false, onLoad, onError }: {
  /** `verseRows` (one charan each) replace `verse` when every row fits on one line. */
  header: string; verse: string; verseRows?: readonly string[]; meaning: string; lang: Lang; art: DevotionalArt;
  verseStyle: TextStyle; meaningStyle: TextStyle; width?: number; inset?: number; exportMode?: boolean;
  onLoad?: () => void; onError?: () => void;
}) {
  const spec = devotionalFrameSpec(art), scale = width / canvas.width;
  const parts = splitDevotionalMeaning(meaning), face = devotionalFace(lang);
  const decoded = React.useRef(new Set<string>());
  // Source, verse, divider, meaning and closing divider; the explanation adds its divider and box.
  const mark = (id: string) => { decoded.current.add(id); if (decoded.current.size === (parts.commentary ? 7 : 5)) onLoad?.(); };
  // On a phone, charan rows only when native layout shows each on one line: a row that
  // wraps would break mid-charan again, so the caller's `verse` (today's flow) is shown
  // instead. Undecided rows stay invisible for that one layout pass. The 540dp export
  // fits a chaupai charan, so it skips the probe and its capture gate; web has no
  // onTextLayout and wraps a long row in place.
  const rowsText = verseRows?.join('\n');
  const fitKey = rowsText && rowsText !== verse.trim() ? [width, verseStyle.fontSize, PixelRatio.getFontScale(), rowsText].join('|') : null;
  const [rowFit, setRowFit] = React.useState<{ key: string; rows: boolean } | null>(null);
  const fits = !fitKey ? false : exportMode || Platform.OS === 'web' ? true : rowFit?.key === fitKey ? rowFit.rows : null;
  const shown = fits === false ? verse.trim() : rowsText!;
  React.useEffect(() => {
    if (fits !== null) return;
    // A Text that never reports layout falls back to the caller's verse, never stays hidden.
    const timer = setTimeout(() => setRowFit(prev => prev?.key === fitKey ? prev : { key: fitKey!, rows: false }), 500);
    return () => clearTimeout(timer);
  }, [fits, fitKey]);
  const shortVerse = lang === 'hi' && !shown.includes('\n') && Array.from(shown).length <= 32;
  const shortMeaning = Array.from(parts.meaning).length < 55;
  // One calibrated size + one script-correct face for every header; long source
  // lines shrink-to-fit inside two lines instead of jumping size/face (which read
  // as the header flicking big↔small) or wrapping unbounded into the hero/divider.
  const sourceSize = spec.sourceFont * width / 540;
  const reading = { fontFamily: face, textAlign: 'center' as const, includeFontPadding: false };
  const bodyFace = lang === 'hi' ? shortMeaning ? fontFamilies.devanagari : type.bodyFace : face;
  const fit = (style: StyleProp<TextStyle>) => withMarkHeadroom(style, exportMode ? 1 : PixelRatio.getFontScale());
  // A box label sits in the gap its master leaves between the top-cap dashes.
  const boxLabel = (testID: string, label: string) => <Text testID={testID} allowFontScaling={!exportMode} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1}
    style={fit([reading, { position: 'absolute', top: (art === 'vishnu' ? 31 : 30) * scale, left: 490 * scale, width: 100 * scale, fontSize: (lang === 'en' ? 21 : art === 'vishnu' ? 30 : 42) * scale, lineHeight: 44 * scale, color: '#7C210D' }])}>{label}</Text>;
  const boxContent = { paddingTop: spec.meaningPad * scale, paddingBottom: 22 * scale, paddingHorizontal: 86 * scale };
  return <View>
    <Panel art={art} width={width} top={spec.hero} bottom={spec.sourceEnd} bottomCap={28} testID="devotional-source-panel"
      contentStyle={{ paddingTop: spec.sourceTop * scale, paddingHorizontal: 120 * scale, paddingBottom: 22 * scale }} onLoad={() => mark('source')} onError={onError}>
      <Text testID="devotional-share-source" allowFontScaling={!exportMode} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.6} style={fit([reading, { fontSize: sourceSize, lineHeight: sourceSize * 1.3, color: '#7C210D', fontFamily: lang === 'hi' ? type.verseFace : face }])}>{header}</Text>
    </Panel>
    <Panel art={art} width={width} top={spec.sourceEnd} bottom={spec.verseEnd} testID="devotional-verse-panel"
      // Use the paper inside the ornamental rules; extra inset here needlessly
      // wraps verses even when the surrounding card has room. Keep the reading
      // size and let Panel grow vertically rather than shrinking scripture.
      contentStyle={{ paddingHorizontal: 55 * scale }} onLoad={() => mark('verse')} onError={onError}>
      <Text testID="devotional-share-verse" allowFontScaling={!exportMode}
        onTextLayout={fits === null ? e => setRowFit({ key: fitKey!, rows: e.nativeEvent.lines.length <= verseRows!.length }) : undefined}
        style={fit([reading, verseStyle, exportMode && { fontSize: shortVerse ? 52 : lang === 'en' ? 27 : type.verseSize, lineHeight: shortVerse ? (spec.verseEnd - spec.sourceEnd) / 2 : lang === 'kn' ? 48 : lang === 'gu' ? 46 : type.verseLeading }, { color: '#2D1005', fontFamily: lang === 'hi' ? type.verseFace : face, transform: [{ translateY: shortVerse ? 16 * scale : 9 * scale }] }, fits === null && { opacity: 0 }])}>{shown}</Text>
    </Panel>
    <DevotionalSlice art={art} width={width} top={spec.verseEnd} bottom={spec.meaningTop} testID="devotional-divider-image" onLoad={() => mark('divider')} onError={onError} />
    <Panel art={art} width={width} top={spec.meaningTop} bottom={spec.meaningBottom} topCap={68} bottomCap={48} testID="devotional-meaning-frame"
      overlay={boxLabel('devotional-meaning-label', pick(lang, { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' }))}
      onLoad={() => mark('meaning')} onError={onError} contentStyle={boxContent}>
      <Text testID="devotional-share-meaning" allowFontScaling={!exportMode}
        style={fit([reading, meaningStyle, exportMode && { fontSize: shortMeaning ? 28 : lang === 'en' ? 23 : type.meaningSize, lineHeight: lang === 'kn' ? 38 : lang === 'gu' ? 34 : shortMeaning ? 34 : type.meaningLeading }, { color: '#602D0E', fontFamily: bodyFace }])}>{parts.meaning}</Text>
    </Panel>
    {/* The explanation gets a twin of the meaning box behind the same lotus divider: its caps stay
        intact and its clean middle mirror-tiles, so any length keeps undistorted corners. Absent,
        nothing renders and the footer scenery rises to meet the reading instead of an empty band. */}
    {parts.commentary ? <>
      <DevotionalSlice art={art} width={width} top={spec.verseEnd} bottom={spec.meaningTop} testID="devotional-commentary-divider-image" onLoad={() => mark('commentLead')} onError={onError} />
      <Panel art={art} width={width} top={spec.meaningTop} bottom={spec.meaningBottom} topCap={BOX_TILE[0]} bottomCap={spec.meaningBottom - spec.meaningTop - BOX_TILE[1]} tile={3}
        testID="devotional-commentary-panel" overlay={boxLabel('devotional-commentary-label', pick(lang, { hi: 'महत्त्व', en: 'Significance', gu: 'મહત્ત્વ', kn: 'ಮಹತ್ತ್ವ' }))}
        onLoad={() => mark('comment')} onError={onError} contentStyle={boxContent}>
        <Text testID="devotional-share-commentary" allowFontScaling={!exportMode}
          style={fit([reading, meaningStyle, exportMode && { fontSize: shortMeaning || lang === 'en' ? 23 : type.commentarySize, lineHeight: lang === 'kn' ? 38 : lang === 'gu' ? 34 : type.commentaryLeading }, { color: '#602D0E', fontFamily: bodyFace }])}>{parts.commentary}</Text>
      </Panel>
    </> : null}
    <DevotionalSlice art={art} width={width} top={spec.meaningBottom} bottom={spec.commentTop} testID="devotional-comment-divider-image" onLoad={() => mark('commentDivider')} onError={onError} />
  </View>;
}
export function DevotionalFooter({ art, width, onLoad, onError }: { art: DevotionalArt; width: number; onLoad?: () => void; onError?: () => void }) {
  return <View testID="devotional-footer" accessible accessibilityLabel="Vedansh.app"><DevotionalSlice art={art} width={width} top={canvas.footerTop} bottom={canvas.height}
    testID="devotional-footer-image" onLoad={onLoad} onError={onError} /></View>;
}

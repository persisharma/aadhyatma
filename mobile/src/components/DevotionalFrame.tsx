import React from 'react';
import { Image, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import type { Lang } from '@/data/gita/language';
import { devotionalArtAsset } from '@/data/devotionalShareArt';
import { devotionalFrameSpec, devotionalFrameCanvas as canvas } from '@/data/devotionalFrameSpec';
import { devotionalFrameType as type, devotionalFrameColors } from '@/theme/devotionalFrame';
import { fontFamilies } from '@/theme/typography';
import { pick } from '@/utils/localize';
import { splitDevotionalMeaning, type DevotionalArt } from '@/utils/devotionalShareLayout';

export function devotionalFace(lang: Lang): string {
  return lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada : fontFamilies.sanskritLatin;
}
function plate(art: DevotionalArt) { return devotionalArtAsset(art === 'prayer' ? 'ganesha' : art); }
/** Clip the full lossless master. Stretch only a specified plain-paper band. */
export function DevotionalSlice({ art, width, top, bottom, height, testID, onLoad, onError }: {
  art: DevotionalArt; width: number; top: number; bottom: number; height?: number;
  testID?: string; onLoad?: () => void; onError?: () => void;
}) {
  const displayHeight = height ?? (bottom - top) * width / canvas.width;
  const verticalScale = displayHeight / (bottom - top);
  return <View pointerEvents="none" accessible={false} style={{ width, height: displayHeight, overflow: 'hidden' }}>
    <Image testID={testID} source={plate(art)} accessible={false} resizeMode="stretch"
      style={{ position: 'absolute', left: 0, top: -top * verticalScale, width, height: canvas.height * verticalScale }}
      onLoad={onLoad} onError={onError} />
  </View>;
}
export function DevotionalHero({ art, width, onLoad, onError }: {
  art: DevotionalArt; lang: Lang; width: number; onLoad?: () => void; onError?: () => void;
}) {
  const h = devotionalFrameSpec(art).hero;
  if (art === 'prayer') return <View testID="devotional-share-artwork" style={{ height: h * width / canvas.width, overflow: 'hidden' }}>
    <Image testID="devotional-hero-image" source={devotionalArtAsset('prayer')} resizeMode="cover" accessible={false}
      style={{ width, height: h * width / canvas.width }} onLoad={onLoad} onError={onError} />
  </View>;
  return <View testID="devotional-share-artwork"><DevotionalSlice art={art} width={width} top={0} bottom={h}
    testID="devotional-hero-image" onLoad={onLoad} onError={onError} /></View>;
}
/** Both decorated caps stay intact while the middle paper/vertical rules grow.
 *  `solidMiddle` fills the growing middle with a flat paper colour instead of
 *  stretching the master — for bands (the commentary foot) whose master has no
 *  plain-paper strip to stretch, so any image stretch would smear the scenery. */
function Panel({ art, width, top, bottom, topCap = 0, bottomCap = 0, solidMiddle, children, overlay, testID, contentStyle, onLoad, onError }: {
  art: DevotionalArt; width: number; top: number; bottom: number; topCap?: number; bottomCap?: number; solidMiddle?: string;
  children?: React.ReactNode; overlay?: React.ReactNode; testID: string; contentStyle?: ViewStyle; onLoad?: () => void; onError?: () => void;
}) {
  const scale = width / canvas.width, minimum = (bottom - top) * scale;
  const [height, setHeight] = React.useState(minimum);
  const painted = React.useRef(new Set<string>());
  const paintedPart = (part: string) => { painted.current.add(part); if (painted.current.size === 1 + Number(topCap > 0) + Number(bottomCap > 0)) onLoad?.(); };
  const middleHeight = Math.max(0, height - (topCap + bottomCap) * scale);
  // A flat-colour middle has no image decode to await, so mark it painted on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { if (solidMiddle) paintedPart('middle'); }, []);
  return <View testID={testID} onLayout={e => setHeight(e.nativeEvent.layout.height)} style={{ minHeight: minimum }}>
    <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
      {topCap ? <DevotionalSlice art={art} width={width} top={top} bottom={top + topCap} onLoad={() => paintedPart('top')} onError={onError} /> : null}
      {solidMiddle
        ? <View testID={`${testID}-image`} style={{ width, height: middleHeight, backgroundColor: solidMiddle }} />
        : <DevotionalSlice art={art} width={width} top={top + topCap} bottom={bottom - bottomCap}
            height={middleHeight} testID={`${testID}-image`} onLoad={() => paintedPart('middle')} onError={onError} />}
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
  const shortVerse = lang === 'hi' && !verse.includes('\n') && Array.from(verse).length <= 32;
  const shortMeaning = Array.from(parts.meaning).length < 55;
  // One calibrated size + one script-correct face for every header; long source
  // lines shrink-to-fit inside two lines instead of jumping size/face (which read
  // as the header flicking big↔small) or wrapping unbounded into the hero/divider.
  const sourceSize = spec.sourceFont * width / 540;
  const reading = { fontFamily: face, textAlign: 'center' as const, includeFontPadding: false };
  const bodyFace = lang === 'hi' ? shortMeaning ? fontFamilies.devanagari : type.bodyFace : face;
  return <View>
    <Panel art={art} width={width} top={spec.hero} bottom={spec.sourceEnd} bottomCap={28} testID="devotional-source-panel"
      contentStyle={{ paddingTop: spec.sourceTop * scale, paddingHorizontal: 120 * scale, paddingBottom: 22 * scale }} onLoad={() => mark('source')} onError={onError}>
      <Text testID="devotional-share-source" allowFontScaling={!exportMode} adjustsFontSizeToFit numberOfLines={2} minimumFontScale={0.6} style={[reading, { fontSize: sourceSize, lineHeight: sourceSize * 1.4, color: '#7C210D', fontFamily: lang === 'hi' ? type.verseFace : face }]}>{header}</Text>
    </Panel>
    <Panel art={art} width={width} top={spec.sourceEnd} bottom={spec.verseEnd} testID="devotional-verse-panel"
      contentStyle={{ paddingHorizontal: 92 * scale }} onLoad={() => mark('verse')} onError={onError}>
      <Text testID="devotional-share-verse" allowFontScaling={!exportMode}
        style={[reading, verseStyle, exportMode && { fontSize: shortVerse ? 52 : lang === 'en' ? 27 : type.verseSize, lineHeight: shortVerse ? (spec.verseEnd - spec.sourceEnd) / 2 : lang === 'kn' ? 48 : lang === 'gu' ? 46 : type.verseLeading }, { color: '#2D1005', fontFamily: lang === 'hi' ? type.verseFace : face, transform: [{ translateY: shortVerse ? 16 * scale : 9 * scale }] }]}>{verse.trim()}</Text>
    </Panel>
    <DevotionalSlice art={art} width={width} top={spec.verseEnd} bottom={spec.meaningTop} testID="devotional-divider-image" onLoad={() => mark('divider')} onError={onError} />
    <Panel art={art} width={width} top={spec.meaningTop} bottom={spec.meaningBottom} topCap={68} bottomCap={48} testID="devotional-meaning-frame"
      overlay={<Text testID="devotional-meaning-label" allowFontScaling={!exportMode} adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1}
        style={[reading, { position: 'absolute', top: (art === 'vishnu' ? 31 : 30) * scale, left: 490 * scale, width: 100 * scale, fontSize: (lang === 'en' ? 21 : art === 'vishnu' ? 30 : 42) * scale, lineHeight: 44 * scale, color: '#7C210D' }]}>{pick(lang, { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' })}</Text>}
      onLoad={() => mark('meaning')} onError={onError} contentStyle={{ paddingTop: spec.meaningPad * scale, paddingBottom: 22 * scale, paddingHorizontal: 86 * scale }}>
      <Text testID="devotional-share-meaning" allowFontScaling={!exportMode}
        style={[reading, meaningStyle, exportMode && { fontSize: shortMeaning ? 28 : lang === 'en' ? 23 : type.meaningSize, lineHeight: lang === 'kn' ? 38 : lang === 'gu' ? 34 : shortMeaning ? 34 : type.meaningLeading }, { color: '#602D0E', fontFamily: bodyFace }]}>{parts.meaning}</Text>
    </Panel>
    <DevotionalSlice art={art} width={width} top={spec.meaningBottom} bottom={spec.commentTop} testID="devotional-comment-divider-image" onLoad={() => mark('commentDivider')} onError={onError} />
    <Panel art={art} width={width} top={spec.commentTop} bottom={canvas.footerTop} bottomCap={canvas.footerTop - spec.commentTop}
      solidMiddle={devotionalFrameColors.paper} testID="devotional-commentary-panel"
      onLoad={() => mark('comment')} onError={onError} contentStyle={{ paddingHorizontal: 124 * scale, paddingTop: 11 * scale }}>
      {parts.commentary ? <Text testID="devotional-share-commentary" allowFontScaling={!exportMode}
        style={[reading, meaningStyle, exportMode && { fontSize: shortMeaning || lang === 'en' ? 23 : type.commentarySize, lineHeight: lang === 'kn' ? 38 : lang === 'gu' ? 34 : type.commentaryLeading }, { color: '#602D0E', fontFamily: bodyFace }]}>{parts.commentary}</Text> : null}
    </Panel>
  </View>;
}
export function DevotionalFooter({ art, width, onLoad, onError }: { art: DevotionalArt; width: number; onLoad?: () => void; onError?: () => void }) {
  return <View testID="devotional-footer" accessible accessibilityLabel="Vedansh.app"><DevotionalSlice art={art} width={width} top={canvas.footerTop} bottom={canvas.height}
    testID="devotional-footer-image" onLoad={onLoad} onError={onError} /></View>;
}

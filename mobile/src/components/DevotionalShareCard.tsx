import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Lang } from '@/data/gita/language';
import { lightColors as colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/typography';
import { devotionalMetrics as m, devotionalCardGeometry, type DevotionalPage } from '@/utils/devotionalShareLayout';
import { DevotionalBorder, DevotionalHero, DevotionalFooter, DevotionalVerseBody, devotionalFace } from './DevotionalFrame';

export type DevotionalShareCardProps = {
  header: string; page: DevotionalPage; lang: Lang; pageIndex: number; pageCount: number;
  onReady?: (ready: boolean) => void;
  onHeight?: (height: number) => void;
};
/** Design 2 with native text. Capture waits for BOTH paintings and final layout. */
const DevotionalShareCard = React.forwardRef<View, DevotionalShareCardProps>(function DevotionalShareCard({ header, page, lang, pageIndex, pageCount, onReady, onHeight }, ref) {
  const [heroPainted, setHeroPainted] = React.useState(false);
  const [footerPainted, setFooterPainted] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [bodyHeight, setBodyHeight] = React.useState<number | null>(null);
  const [nativeHeight, setNativeHeight] = React.useState<number | null>(null);
  const validBody = bodyHeight !== null && Number.isFinite(bodyHeight) && bodyHeight > 0;
  const geometry = devotionalCardGeometry(validBody ? bodyHeight : 0);
  const laidOut = validBody && nativeHeight === geometry.height;
  React.useEffect(() => {
    if (failed || (bodyHeight !== null && !validBody)) onReady?.(false);
    else if (laidOut && heroPainted && footerPainted) { onHeight?.(geometry.height); onReady?.(true); }
  }, [heroPainted, footerPainted, failed, bodyHeight, validBody, laidOut, geometry.height, onReady, onHeight]);
  const latin = lang === 'en';
  const face = devotionalFace(lang);
  return <View ref={ref} collapsable={false} testID="devotional-share-card"
    style={[styles.card, { height: geometry.height }]}
    onLayout={e => setNativeHeight(Math.ceil(e.nativeEvent.layout.height))}>
    <LinearGradient colors={[colors.parchmentHighlight, colors.parchmentHighlight]} style={StyleSheet.absoluteFill} />
    <DevotionalHero art={page.art} lang={lang} width={m.width} onLoad={() => setHeroPainted(true)} onError={() => setFailed(true)} />
    <View testID="devotional-share-content" onLayout={e => {
      const h = e.nativeEvent.layout.height;
      setBodyHeight(Number.isFinite(h) && h > 0 ? Math.ceil(h) : Infinity);
    }}>
      <DevotionalVerseBody header={header} verse={page.verse} meaning={page.meaning} lang={lang} art={page.art} inset={m.inset} exportMode
        verseStyle={{ fontFamily: face, fontSize: latin ? m.latinVerseSize : m.verseSize, lineHeight: latin ? m.latinVerseLeading : m.verseLeading, color: colors.ink }}
        meaningStyle={{ fontFamily: face, fontSize: latin ? m.latinMeaningSize : m.meaningSize, lineHeight: latin ? m.latinMeaningLeading : m.meaningLeading, color: colors.inkSoft }} />
    </View>
    <View style={styles.footer}>
      <DevotionalFooter art={page.art} width={m.width} onLoad={() => setFooterPainted(true)} onError={() => setFailed(true)} />
      {pageCount > 1 ? <Text allowFontScaling={false} style={styles.pageNumber}>{pageIndex + 1}/{pageCount}</Text> : null}
    </View>
    <DevotionalBorder inset={10} />
  </View>;
});
export default DevotionalShareCard;
const styles = StyleSheet.create({
  card: { width: m.width, minHeight: m.height, backgroundColor: colors.parchmentHighlight },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  pageNumber: { position: 'absolute', right: 20, bottom: 16, fontFamily: fontFamilies.latinSemiBold, fontSize: 12, lineHeight: 18, color: colors.inkMuted, backgroundColor: colors.parchmentSoft },
});

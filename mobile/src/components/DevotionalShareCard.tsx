import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Lang } from '@/data/gita/language';
import { devotionalArtAsset } from '@/data/devotionalShareArt';
import { lightColors as colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, pick } from '@/utils/localize';
import { devotionalMetrics as m, devotionalCardGeometry, type DevotionalPage } from '@/utils/devotionalShareLayout';

export type DevotionalShareCardProps = {
  header: string; page: DevotionalPage; lang: Lang; pageIndex: number; pageCount: number;
  onReady?: (ready: boolean) => void;
  onHeight?: (height: number) => void;
};
/** Export-only parchment: readable fixed type, full artwork and a native fit/decode gate. */
const DevotionalShareCard = React.forwardRef<View, DevotionalShareCardProps>(function DevotionalShareCard({ header, page, lang, pageIndex, pageCount, onReady, onHeight }, ref) {
  const [painted, setPainted] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [bodyHeight, setBodyHeight] = React.useState<number | null>(null);
  const [nativeHeight, setNativeHeight] = React.useState<number | null>(null);
  const validBody = bodyHeight !== null && Number.isFinite(bodyHeight) && bodyHeight > 0;
  const geometry = validBody ? devotionalCardGeometry(bodyHeight) : { heroHeight: page.heroHeight, height: m.height };
  const heroHeight = geometry.heroHeight;
  const laidOut = validBody && nativeHeight === geometry.height;
  React.useEffect(() => {
    if (failed || (bodyHeight !== null && !validBody)) onReady?.(false);
    else if (laidOut && painted) { onHeight?.(geometry.height); onReady?.(true); }
  }, [painted, failed, bodyHeight, validBody, laidOut, geometry.height, onReady, onHeight]);
  const latin = lang === 'en';
  const face = lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada : latin ? fontFamilies.latin : fontFamilies.devanagari;
  const hasVerse = !!page.verse.trim();
  return <View ref={ref} collapsable={false} testID="devotional-share-card" style={[styles.card, validBody && { height: geometry.height }]} onLayout={e => setNativeHeight(Math.ceil(e.nativeEvent.layout.height))}>
    <LinearGradient colors={[colors.parchmentHighlight, colors.parchment]} style={StyleSheet.absoluteFill} />
    <View testID="devotional-share-artwork" style={{ height: heroHeight, overflow: 'hidden' }}>
      <Image source={devotionalArtAsset(page.art)} resizeMode="contain" accessibilityIgnoresInvertColors
        style={{ position: 'absolute', left: 0, top: 0, width: m.width, height: m.width / 1.5 }}
        onLoad={() => setPainted(true)} onError={() => setFailed(true)} />
      <LinearGradient colors={['rgba(246, 236, 208, 0)', colors.parchmentHighlight]} style={styles.fade} />
      <LinearGradient colors={[colors.parchmentHighlight, 'rgba(246, 236, 208, 0)']} style={styles.brandWash} />
      <Text allowFontScaling={false} style={[styles.brand, { fontFamily: face }]}>
        {latin ? <><Text style={{ fontFamily: fontFamilies.devanagari }}>ॐ</Text>{' Vedansh'}</> : contentByLang(lang, 'ॐ वेदांश', 'ॐ Vedansh')}
      </Text>
    </View>
    <View testID="devotional-share-content" style={styles.content} onLayout={e => {
      const h = e.nativeEvent.layout.height;
      setBodyHeight(Number.isFinite(h) && h > 0 ? Math.ceil(h) : Infinity);
    }}>
      <Text allowFontScaling={false} style={[styles.source, { fontFamily: face }]}>{header}</Text>
      {hasVerse ? <Text allowFontScaling={false} testID="devotional-share-verse" style={{ fontFamily: face, fontSize: latin ? m.latinVerseSize : m.verseSize, lineHeight: latin ? m.latinVerseLeading : m.verseLeading, color: colors.ink, textAlign: 'center', includeFontPadding: false }}>{page.verse.trim()}</Text> : null}
      {page.meaning.trim() ? <>
        <View style={styles.divider}><View style={styles.rule} /></View>
        <Text allowFontScaling={false} style={[styles.meaningLabel, { fontFamily: face }]}>{pick(lang, { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' })}{page.continuation && !hasVerse ? pick(lang, { hi: ' · जारी', en: ' · continued', gu: ' · આગળ', kn: ' · ಮುಂದುವರಿಕೆ' }) : ''}</Text>
        <Text allowFontScaling={false} testID="devotional-share-meaning" style={{ fontFamily: face, fontSize: latin ? m.latinMeaningSize : m.meaningSize, lineHeight: latin ? m.latinMeaningLeading : m.meaningLeading, color: colors.inkSoft, textAlign: 'center', includeFontPadding: false }}>{page.meaning.trim()}</Text>
      </> : null}
    </View>
    <View pointerEvents="none" style={styles.frame} />
    <View style={styles.footer}>
      <Text allowFontScaling={false} style={styles.wordmark}>Vedansh.app</Text>
      {pageCount > 1 ? <Text allowFontScaling={false} style={styles.pageNumber}>{pageIndex + 1}/{pageCount}</Text> : null}
    </View>
  </View>;
});
export default DevotionalShareCard;
const styles = StyleSheet.create({
  card: { width: m.width, minHeight: m.height, paddingBottom: 67, backgroundColor: colors.parchment },
  fade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 28 },
  brandWash: { position: 'absolute', left: 0, top: 0, width: 180, height: 80 },
  brand: { position: 'absolute', left: 28, top: 24, fontSize: 20, color: colors.saffronDeep, paddingHorizontal: 6, paddingVertical: 2 },
  content: { paddingTop: m.contentTop, paddingHorizontal: m.inset },
  source: { fontSize: m.sourceSize, lineHeight: m.sourceLeading, textAlign: 'center', color: colors.saffronDeep, marginBottom: m.sourceGap, includeFontPadding: false },
  divider: { height: m.meaningGap, alignItems: 'center', justifyContent: 'center' },
  rule: { width: 76, height: 1, backgroundColor: colors.gold },
  meaningLabel: { fontSize: m.meaningLabelSize, lineHeight: m.meaningLabelLeading, textAlign: 'center', color: colors.saffronDeep, includeFontPadding: false },
  frame: { position: 'absolute', inset: 10, borderWidth: 1, borderColor: colors.gold },
  footer: { position: 'absolute', left: 38, right: 38, bottom: 18, borderTopWidth: 1, borderColor: colors.gold, paddingTop: 7 },
  wordmark: { fontFamily: fontFamilies.latinSemiBold, fontSize: 15, lineHeight: 22, color: colors.inkMuted, textAlign: 'center' },
  pageNumber: { position: 'absolute', right: 0, bottom: 0, fontFamily: fontFamilies.latinSemiBold, fontSize: 12, lineHeight: 18, color: colors.inkMuted },
});

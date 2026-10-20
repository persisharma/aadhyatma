import React from 'react';
import { Image, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { Lang } from '@/data/gita/language';
import { devotionalArtAsset } from '@/data/devotionalShareArt';
import { devotionalFooterAsset, devotionalOrnamentAsset } from '@/data/devotionalFrameArt';
import { devotionalFrameColors as colors } from '@/theme/devotionalFrame';
import { fontFamilies } from '@/theme/typography';
import { pick } from '@/utils/localize';
import { devotionalHeroGeometry, splitDevotionalMeaning, type DevotionalArt } from '@/utils/devotionalShareLayout';

export function devotionalFace(lang: Lang): string {
  return lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada
    : lang === 'en' ? fontFamilies.sanskritLatin : fontFamilies.devanagari;
}

/** Display a clipped, unwarped part of the approved ornament atlas. */
function DevotionalSprite({ art, part, width, onLoad, onError, testID }: {
  art: DevotionalArt; part: 'source' | 'verse' | 'comment' | 'corner' | 'labelLeft' | 'labelRight' | 'shoulders'; width: number;
  onLoad?: () => void; onError?: () => void; testID?: string;
}) {
  const rect = part === 'shoulders' ? { x: 0, y: 224, w: 1080, h: 130 } : part === 'source' ? { x: 120, y: 0, w: 480, h: 40 }
    : part === 'verse' ? { x: 0, y: 40, w: 720, h: 80 }
      : part === 'comment' ? { x: 150, y: 120, w: 420, h: 40 } : part === 'labelLeft' ? { x: 80, y: 160, w: 160, h: 32 } : part === 'labelRight' ? { x: 260, y: 160, w: 160, h: 32 } : { x: 0, y: 160, w: 64, h: 64 };
  const scale = width / rect.w;
  return <View pointerEvents="none" accessible={false} style={{ width, height: rect.h * scale, overflow: 'hidden' }}>
    <Image testID={testID} source={devotionalOrnamentAsset(art)} accessible={false} resizeMode="stretch"
      style={{ position: 'absolute', left: -rect.x * scale, top: -rect.y * scale, width: 1080 * scale, height: 354 * scale }}
      onLoad={onLoad} onError={onError} />
  </View>;
}

/** Source scroll corners stay outside padded text as the frame grows. */
export function DevotionalBorder({ inset = 8, art = 'ganesha', meaning = false, scale = 1 }: {
  inset?: number; art?: DevotionalArt; meaning?: boolean; scale?: number;
}) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[styles.border, { top: inset, left: inset, right: inset, bottom: inset }, !meaning && { borderLeftWidth: 1, borderRightWidth: 1 }]}>
    {meaning ? <>
      {[0, 2].map(offset => <React.Fragment key={offset}>
        <View style={{ position: 'absolute', top: offset, left: 26 * scale, right: 26 * scale, borderTopWidth: offset ? 0.5 : 1, borderColor: colors.gold }} />
        <View style={{ position: 'absolute', bottom: offset, left: 26 * scale, right: 26 * scale, borderTopWidth: offset ? 0.5 : 1, borderColor: colors.gold }} />
        <View style={{ position: 'absolute', left: offset, top: 26 * scale, bottom: 26 * scale, borderLeftWidth: offset ? 0.5 : 1, borderColor: colors.gold }} />
        <View style={{ position: 'absolute', right: offset, top: 26 * scale, bottom: 26 * scale, borderLeftWidth: offset ? 0.5 : 1, borderColor: colors.gold }} />
      </React.Fragment>)}
      {(['tl', 'tr', 'bl', 'br'] as const).map(corner => <View key={corner}
        style={{ position: 'absolute', ...(corner.includes('t') ? { top: -4 * scale } : { bottom: -4 * scale }),
          ...(corner.includes('l') ? { left: -4 * scale } : { right: -4 * scale }),
          transform: [{ rotate: corner === 'tr' ? '90deg' : corner === 'br' ? '180deg' : corner === 'bl' ? '270deg' : '0deg' }] }}>
        <DevotionalSprite art={art} part="corner" width={32 * scale} />
      </View>)}
    </> : null}
  </View>;
}

export function DevotionalHero({ art, width, onLoad, onError }: {
  art: DevotionalArt; lang: Lang; width: number; onLoad?: () => void; onError?: () => void;
}) {
  const geometry = devotionalHeroGeometry(art, width);
  return <View testID="devotional-share-artwork" style={{ height: geometry.height, overflow: 'hidden' }}>
    <Image testID="devotional-hero-image" source={devotionalArtAsset(art)} resizeMode="contain" accessible={false}
      accessibilityIgnoresInvertColors style={{ position: 'absolute', left: 0, top: 0, width, height: geometry.imageHeight }} onLoad={onLoad} onError={onError} />
    <LinearGradient pointerEvents="none" colors={[colors.paperClear, colors.paper]} style={styles.heroFade} />
  </View>;
}

/** Fine approved paper grain, explicitly sized for native Image layout. */
export function DevotionalPaper({ width, height, onLoad, onError }: {
  width: number; height: number; onLoad?: () => void; onError?: () => void;
}) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
    <Image testID="devotional-paper-image" source={require('@assets/devotional-share/parchment.webp')} resizeMode="stretch" accessible={false}
      style={{ position: 'absolute', left: 0, top: 0, width, height }} onLoad={onLoad} onError={onError} />
    <LinearGradient pointerEvents="none" start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      colors={[colors.centerClear, colors.center, colors.centerClear]} style={StyleSheet.absoluteFill} />
  </View>;
}

/** Exact approved deity motif, with separate source and commentary ornaments. */
export function DevotionalDivider({ art, compact = false, commentary = false, scale = 0.5, onLoad, onError }: {
  art: DevotionalArt; compact?: boolean; commentary?: boolean; scale?: number; onLoad?: () => void; onError?: () => void;
}) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[styles.divider, compact && { marginTop: 6, marginBottom: 10 }]}>
    <DevotionalSprite art={art} part={commentary ? 'comment' : compact ? 'source' : 'verse'}
      width={(commentary ? 420 : compact ? 480 : 720) * scale} testID={onLoad ? 'devotional-ornament-image' : undefined} onLoad={onLoad} onError={onError} />
  </View>;
}

export function DevotionalVerseBody({ header, verse, meaning, lang, art, verseStyle, meaningStyle, inset = 28, exportMode = false, width = 540, onLoad, onError }: {
  header: string; verse: string; meaning: string; lang: Lang; art: DevotionalArt;
  verseStyle: TextStyle; meaningStyle: TextStyle; inset?: number; exportMode?: boolean; width?: number; onLoad?: () => void; onError?: () => void;
}) {
  const parts = splitDevotionalMeaning(meaning);
  const face = devotionalFace(lang);
  return <View style={{ paddingHorizontal: inset, paddingTop: 12, paddingBottom: 16 }}>
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0 }}><DevotionalSprite art={art} part="shoulders" width={width} /></View>
    <Text allowFontScaling={!exportMode} style={[styles.source, { fontFamily: face }]}>{header}</Text>
    <DevotionalDivider scale={width / 1080} art={art} compact onLoad={onLoad} onError={onError} />
    {verse.trim() ? <Text testID="devotional-share-verse" allowFontScaling={!exportMode}
      style={[styles.reading, verseStyle, { color: colors.ink }]}>{verse.trim()}</Text> : null}
    {parts.meaning ? <>
      <DevotionalDivider scale={width / 1080} art={art} />
      <View testID="devotional-meaning-frame" style={styles.meaningFrame}>
        <DevotionalBorder inset={0} art={art} meaning scale={width / 540} />
        <View style={styles.meaningHeading}>
          <DevotionalSprite art={art} part="labelLeft" width={80 * width / 540} />
          <Text allowFontScaling={!exportMode} style={[styles.meaningLabel, { fontFamily: face }]}>{pick(lang, { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' })}</Text>
          <DevotionalSprite art={art} part="labelRight" width={80 * width / 540} />
        </View>
        <Text testID="devotional-share-meaning" allowFontScaling={!exportMode}
          style={[styles.reading, meaningStyle, { color: colors.meaning }]}>{parts.meaning}</Text>
      </View>
    </> : null}
    {parts.commentary ? <>
      <DevotionalDivider scale={width / 1080} art={art} compact commentary />
      <Text testID="devotional-share-commentary" allowFontScaling={!exportMode}
        style={[styles.reading, meaningStyle, styles.commentary, { color: colors.meaning }]}>{parts.commentary}</Text>
    </> : null}
  </View>;
}

/** Separate footer in document flow: scenery cannot ever overlap reading text. */
export function DevotionalFooter({ art, width, onLoad, onError }: {
  art: DevotionalArt; width: number; onLoad?: () => void; onError?: () => void;
}) {
  return <View testID="devotional-footer" accessible accessibilityLabel="Vedansh.app" style={{ width, height: width * 280 / 1080 }}>
    <Image testID="devotional-footer-image" accessible={false} accessibilityIgnoresInvertColors
      source={devotionalFooterAsset(art)} resizeMode="stretch" style={{ position: 'absolute', left: 0, top: 0, width, height: width * 280 / 1080 }}
      onLoad={onLoad} onError={onError} />
  </View>;
}

const styles = StyleSheet.create({
  border: { position: 'absolute', borderColor: colors.gold },
  heroFade: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 6 },
  source: { alignSelf: 'center', maxWidth: '62%', fontSize: 15, lineHeight: 26, textAlign: 'center', color: colors.maroon, includeFontPadding: false },
  divider: { alignItems: 'center', marginVertical: 8 },
  reading: { textAlign: 'center', includeFontPadding: false },
  meaningFrame: { position: 'relative', paddingHorizontal: 32, paddingTop: 18, paddingBottom: 24, backgroundColor: 'transparent' },
  meaningHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 },
  meaningLabel: { fontSize: 18, lineHeight: 28, textAlign: 'center', color: colors.maroon, includeFontPadding: false },
  commentary: { marginTop: 4 },
});

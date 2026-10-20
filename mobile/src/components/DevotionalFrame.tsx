import React from 'react';
import { Image, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Path } from 'react-native-svg';
import type { Lang } from '@/data/gita/language';
import { devotionalArtAsset } from '@/data/devotionalShareArt';
import { devotionalFooterAsset } from '@/data/devotionalFrameArt';
import { devotionalFrameColors as colors } from '@/theme/devotionalFrame';
import { fontFamilies } from '@/theme/typography';
import { pick } from '@/utils/localize';
import { devotionalHeroGeometry, splitDevotionalMeaning, type DevotionalArt } from '@/utils/devotionalShareLayout';

export function devotionalFace(lang: Lang): string {
  return lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada
    : lang === 'en' ? fontFamilies.sanskritLatin : fontFamilies.devanagari;
}

/** Fixed-size corner ornaments live outside the padded text; never stretch them. */
export function DevotionalBorder({ inset = 8 }: { inset?: number }) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[styles.border, { top: inset, left: inset, right: inset, bottom: inset }]}>
    <View style={{ position: 'absolute', top: 2, left: 2, right: 2, bottom: 2, borderWidth: 0.5, borderColor: colors.goldLight }} />
    {(['tl', 'tr', 'bl', 'br'] as const).map(corner => <Svg key={corner} width={22} height={22} viewBox="0 0 32 32"
      style={{ position: 'absolute', ...(corner.includes('t') ? { top: -1 } : { bottom: -1 }),
        ...(corner.includes('l') ? { left: -1 } : { right: -1 }),
        transform: [{ rotate: corner === 'tr' ? '90deg' : corner === 'br' ? '180deg' : corner === 'bl' ? '270deg' : '0deg' }] }}>
      <Path d="M1 31V17C10 17 17 10 17 1H31M5 29V21C13 20 20 13 21 5H29M5 15C-2 11 3 1 9 4C17 8 8 20 3 13M13 5C9 -1 1 4 5 9C10 15 18 6 11 3M9 23C15 22 23 15 23 9M2 26C8 28 12 24 10 21C8 17 3 21 7 23" fill="none" stroke={colors.gold} strokeWidth={1.35} />
    </Svg>)}
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

/** A small motif changes with the deity; the gold scrollwork stays identical. */
export function DevotionalDivider({ art, compact = false }: { art: DevotionalArt; compact?: boolean }) {
  const leaf = art === 'shiva';
  const sun = art === 'surya';
  const feather = art === 'krishna';
  const flower = art === 'hanuman' || art === 'ganesha' || art === 'prayer';
  const pigment = leaf ? '#59723B' : feather ? '#4D7771' : art === 'saraswati' ? '#FFFBEB' : art === 'durga' ? '#B95142' : '#D99496';
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[styles.divider, compact && { marginVertical: 7 }]}>
    <Svg width={compact ? 130 : 224} height={24} viewBox="0 0 224 24">
      <Path d="M0 12H66M158 12H224M70 12C84 12 83 2 93 4C103 6 97 20 91 17C85 13 94 8 95 13M154 12C140 12 141 2 131 4C121 6 127 20 133 17C139 13 130 8 129 13M76 12C80 23 91 22 99 17M148 12C144 23 133 22 125 17" stroke={colors.gold} fill="none" strokeWidth={1} />
      <G stroke={colors.gold} strokeWidth={0.8}>
        {sun ? <><Circle cx={112} cy={12} r={5} fill={colors.gold} />{Array.from({ length: 12 }, (_, i) => <Path key={i} d="M112 1V4" transform={`rotate(${i * 30} 112 12)`} />)}</>
          : leaf || feather ? <><Path d="M112 21C99 11 109 2 112 1C119 7 125 12 112 21Z" fill={pigment} /><Path d="M112 21V7M111 17C98 18 99 9 99 9C107 8 111 11 111 17M113 17C126 18 125 9 125 9C117 8 113 11 113 17" fill={pigment} /></>
          : flower ? <>{Array.from({ length: 6 }, (_, i) => <Path key={i} d="M112 11C108 8 109 4 112 1C115 4 116 8 112 11Z" transform={`rotate(${i * 60} 112 12)`} fill={art === 'hanuman' || art === 'ganesha' ? '#C98A29' : colors.gold} />)}<Circle cx={112} cy={12} r={2} fill={colors.paper} /></>
          : <><Path d="M112 21C100 11 108 4 112 1C116 5 124 12 112 21Z" fill={pigment} /><Path d="M112 21C100 21 97 11 98 7C105 8 109 12 112 21ZM112 21C124 21 127 11 126 7C119 8 115 12 112 21Z" fill={pigment} /><Path d="M100 21H124" fill="none" /></>}
      </G>
    </Svg>
  </View>;
}

export function DevotionalVerseBody({ header, verse, meaning, lang, art, verseStyle, meaningStyle, inset = 24, exportMode = false }: {
  header: string; verse: string; meaning: string; lang: Lang; art: DevotionalArt;
  verseStyle: TextStyle; meaningStyle: TextStyle; inset?: number; exportMode?: boolean;
}) {
  const parts = splitDevotionalMeaning(meaning);
  const face = devotionalFace(lang);
  return <View style={{ paddingHorizontal: inset, paddingTop: 12, paddingBottom: 16 }}>
    <Text allowFontScaling={!exportMode} style={[styles.source, { fontFamily: face }]}>{header}</Text>
    <DevotionalDivider art={art} compact />
    {verse.trim() ? <Text testID="devotional-share-verse" allowFontScaling={!exportMode}
      style={[styles.reading, verseStyle, { color: colors.ink }]}>{verse.trim()}</Text> : null}
    {parts.meaning ? <>
      <DevotionalDivider art={art} />
      <View testID="devotional-meaning-frame" style={styles.meaningFrame}>
        <DevotionalBorder inset={0} />
        <Text allowFontScaling={!exportMode} style={[styles.meaningLabel, { fontFamily: face }]}>{pick(lang, { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' })}</Text>
        <Text testID="devotional-share-meaning" allowFontScaling={!exportMode}
          style={[styles.reading, meaningStyle, { color: colors.meaning }]}>{parts.meaning}</Text>
      </View>
    </> : null}
    {parts.commentary ? <>
      <DevotionalDivider art={art} compact />
      <Text testID="devotional-share-commentary" allowFontScaling={!exportMode}
        style={[styles.reading, meaningStyle, styles.commentary, { color: colors.meaning }]}>{parts.commentary}</Text>
    </> : null}
  </View>;
}

/** Separate footer in document flow: scenery cannot ever overlap reading text. */
export function DevotionalFooter({ art, width, onLoad, onError }: {
  art: DevotionalArt; width: number; onLoad?: () => void; onError?: () => void;
}) {
  return <View testID="devotional-footer" accessible accessibilityLabel="Vedansh.app" style={{ width, height: width * 160 / 1080 }}>
    <Image testID="devotional-footer-image" accessible={false} accessibilityIgnoresInvertColors
      source={devotionalFooterAsset(art)} resizeMode="stretch" style={{ position: 'absolute', left: 0, top: 0, width, height: width * 160 / 1080 }}
      onLoad={onLoad} onError={onError} />
    <LinearGradient pointerEvents="none" colors={[colors.paper, colors.paperClear]} style={styles.footerFade} />
  </View>;
}

const styles = StyleSheet.create({
  border: { position: 'absolute', borderWidth: 1, borderColor: colors.gold },
  heroFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 28 },
  source: { fontSize: 15, lineHeight: 26, textAlign: 'center', color: colors.maroon, includeFontPadding: false },
  divider: { alignItems: 'center', marginVertical: 12 },
  reading: { textAlign: 'center', includeFontPadding: false },
  meaningFrame: { position: 'relative', paddingHorizontal: 26, paddingTop: 16, paddingBottom: 22, backgroundColor: colors.panel },
  meaningLabel: { fontSize: 15, lineHeight: 25, textAlign: 'center', marginBottom: 8, color: colors.maroon, includeFontPadding: false },
  commentary: { marginTop: 4 },
  footerFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 14 },
});

import React from 'react';
import { Image, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Path } from 'react-native-svg';
import type { Lang } from '@/data/gita/language';
import { devotionalArtAsset } from '@/data/devotionalShareArt';
import { devotionalFooterAsset } from '@/data/devotionalFrameArt';
import { lightColors as colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, pick } from '@/utils/localize';
import { splitDevotionalMeaning, type DevotionalArt } from '@/utils/devotionalShareLayout';

export function devotionalFace(lang: Lang): string {
  return lang === 'gu' ? fontFamilies.gujarati : lang === 'kn' ? fontFamilies.kannada
    : lang === 'en' ? fontFamilies.sanskritLatin : fontFamilies.devanagari;
}

/** Fixed-size corner ornaments live outside the padded text; never stretch them. */
export function DevotionalBorder({ inset = 8 }: { inset?: number }) {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    style={[styles.border, { top: inset, left: inset, right: inset, bottom: inset }]}>
    {(['tl', 'tr', 'bl', 'br'] as const).map(corner => <Svg key={corner} width={20} height={20} viewBox="0 0 24 24"
      style={{ position: 'absolute', ...(corner.includes('t') ? { top: -1 } : { bottom: -1 }),
        ...(corner.includes('l') ? { left: -1 } : { right: -1 }),
        transform: [{ rotate: corner === 'tr' ? '90deg' : corner === 'br' ? '180deg' : corner === 'bl' ? '270deg' : '0deg' }] }}>
      <Path d="M1 23V12C8 12 12 8 12 1H23M5 21V16C11 15 15 11 16 5H21M4 10C-1 7 5 1 8 5C11 9 3 15 2 8" fill="none" stroke={colors.gold} strokeWidth={1.1} />
    </Svg>)}
  </View>;
}

export function DevotionalHero({ art, lang, width, onLoad, onError }: {
  art: DevotionalArt; lang: Lang; width: number; onLoad?: () => void; onError?: () => void;
}) {
  return <View testID="devotional-share-artwork" style={{ height: width / 2, overflow: 'hidden' }}>
    <Image testID="devotional-hero-image" source={devotionalArtAsset(art)} resizeMode="contain" accessible={false}
      accessibilityIgnoresInvertColors style={{ position: 'absolute', width, height: width / 1.5 }} onLoad={onLoad} onError={onError} />
    <LinearGradient pointerEvents="none" colors={['rgba(246, 236, 208, 0)', colors.parchmentHighlight]} style={styles.heroFade} />
    <View style={styles.brand}>
      <Text allowFontScaling={false} style={[styles.brandName, { fontFamily: devotionalFace(lang) }]}>{contentByLang(lang, 'वेदांश', 'Vedansh')}</Text>
      <Text allowFontScaling={false} style={styles.brandUrl}>Vedansh.app</Text>
    </View>
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
      <Path d="M0 12H70M154 12H224M72 12C90 12 88 1 98 5C106 10 90 19 92 10M152 12C134 12 136 1 126 5C118 10 134 19 132 10" stroke={colors.gold} fill="none" strokeWidth={1} />
      <G stroke={colors.gold} strokeWidth={0.8}>
        {sun ? <><Circle cx={112} cy={12} r={5} fill={colors.gold} />{Array.from({ length: 12 }, (_, i) => <Path key={i} d="M112 1V4" transform={`rotate(${i * 30} 112 12)`} />)}</>
          : leaf || feather ? <><Path d="M112 21C99 11 109 2 112 1C119 7 125 12 112 21Z" fill={pigment} /><Path d="M112 21V7M111 17C98 18 99 9 99 9C107 8 111 11 111 17M113 17C126 18 125 9 125 9C117 8 113 11 113 17" fill={pigment} /></>
          : flower ? <>{Array.from({ length: 6 }, (_, i) => <Path key={i} d="M112 12C102 6 107 0 112 2C117 0 122 6 112 12Z" transform={`rotate(${i * 60} 112 12)`} fill={colors.gold} />)}<Circle cx={112} cy={12} r={2} fill={colors.parchmentHighlight} /></>
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
      style={[styles.reading, verseStyle]}>{verse.trim()}</Text> : null}
    {parts.meaning ? <>
      <DevotionalDivider art={art} />
      <View testID="devotional-meaning-frame" style={styles.meaningFrame}>
        <DevotionalBorder inset={0} />
        <Text allowFontScaling={!exportMode} style={[styles.meaningLabel, { fontFamily: face }]}>{pick(lang, { hi: 'अर्थ', en: 'Meaning', gu: 'અર્થ', kn: 'ಅರ್ಥ' })}</Text>
        <Text testID="devotional-share-meaning" allowFontScaling={!exportMode}
          style={[styles.reading, meaningStyle]}>{parts.meaning}</Text>
      </View>
    </> : null}
    {parts.commentary ? <>
      <DevotionalDivider art={art} compact />
      <Text testID="devotional-share-commentary" allowFontScaling={!exportMode}
        style={[styles.reading, meaningStyle, styles.commentary]}>{parts.commentary}</Text>
    </> : null}
  </View>;
}

/** Separate footer in document flow: scenery cannot ever overlap reading text. */
export function DevotionalFooter({ art, width, onLoad, onError }: {
  art: DevotionalArt; width: number; onLoad?: () => void; onError?: () => void;
}) {
  return <View testID="devotional-footer" accessible accessibilityLabel="Vedansh.app" style={{ width, height: width * 160 / 1080 }}>
    <Image testID="devotional-footer-image" accessible={false} accessibilityIgnoresInvertColors
      source={devotionalFooterAsset(art)} resizeMode="stretch" style={StyleSheet.absoluteFill}
      onLoad={onLoad} onError={onError} />
    <LinearGradient pointerEvents="none" colors={[colors.parchmentHighlight, 'rgba(246, 236, 208, 0)']} style={styles.footerFade} />
  </View>;
}

const styles = StyleSheet.create({
  border: { position: 'absolute', borderWidth: 1, borderColor: colors.gold },
  heroFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 28 },
  brand: { position: 'absolute', left: 18, top: 18, backgroundColor: colors.parchmentSoft,
    borderColor: colors.gold, borderWidth: 1, borderRadius: 7, paddingHorizontal: 12, paddingTop: 7, paddingBottom: 5, alignItems: 'center' },
  brandName: { fontSize: 20, lineHeight: 29, color: colors.saffronDeep, includeFontPadding: false },
  brandUrl: { fontFamily: fontFamilies.latinSemiBold, fontSize: 12, lineHeight: 16, color: colors.inkSoft },
  source: { fontSize: 15, lineHeight: 26, textAlign: 'center', color: colors.saffronDeep, includeFontPadding: false },
  divider: { alignItems: 'center', marginVertical: 12 },
  reading: { textAlign: 'center', includeFontPadding: false },
  meaningFrame: { position: 'relative', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18, backgroundColor: colors.parchmentSoft },
  meaningLabel: { fontSize: 15, lineHeight: 25, textAlign: 'center', marginBottom: 8, color: colors.saffronDeep, includeFontPadding: false },
  commentary: { marginTop: 4 },
  footerFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 14 },
});

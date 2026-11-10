import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { Lang } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { WordmarkArtwork } from './VedanshWordmark';

type PaintProps = { width: number; onLoad?: () => void; onError?: () => void };

/** Master-space coordinates. Covers the old painted names without republishing
 * the scenery or adding a bitmap/network request. Branding stays fixed in exports. */
export function DevotionalHeaderBrand({ lang, width, onLoad, onError }: PaintProps & { lang: Lang }) {
  const scale = width / 1080;
  const gradient = `plaque-${React.useId().replace(/:/g, '')}`;
  return <View testID="devotional-header-brand" pointerEvents="none" accessible accessibilityRole="image"
    accessibilityLabel={lang === 'hi' ? 'वेदांश' : 'Vedansh'}
    style={{ position: 'absolute', left: 32 * scale, top: 44 * scale, width: 244 * scale, height: 132 * scale, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={244 * scale} height={132 * scale} viewBox="0 0 244 132" style={StyleSheet.absoluteFill} accessible={false}>
      <Defs><LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFF4D6" /><Stop offset="0.55" stopColor="#FCECC5" /><Stop offset="1" stopColor="#F4DCA3" />
      </LinearGradient></Defs>
      <Rect x="1" y="1" width="242" height="130" rx="12" fill={`url(#${gradient})`} stroke="#99651F" strokeWidth="2" />
      <Path d="M24 6H220Q220 18 238 18V114Q220 114 220 126H24Q24 114 6 114V18Q24 18 24 6Z"
        fill="none" stroke="#B9812E" strokeWidth="1.6" />
      <Path d="M29 11H215Q215 23 233 23V109Q215 109 215 121H29Q29 109 11 109V23Q29 23 29 11Z"
        fill="none" stroke="#C99A4B" strokeWidth="0.8" />
      <Path d="M94 23H109Q115 23 116 17Q117 12 122 17Q127 12 128 17Q129 23 135 23H150M122 17V27"
        fill="none" stroke="#A46B21" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
    <View style={{ marginTop: 12 * scale }}>
      <WordmarkArtwork kind={lang === 'hi' ? 'hi' : 'en'} width={196 * scale} onLoad={onLoad} onError={onError} />
    </View>
  </View>;
}

/** The fixed English domain suffix is live serif text; only Vedansh is the
 * approved flute artwork. The soft paper glow removes the old burned-in name. */
export function DevotionalFooterBrand({ width, onLoad, onError }: PaintProps) {
  const scale = width / 1080;
  const gradient = `footer-${React.useId().replace(/:/g, '')}`;
  return <View testID="devotional-footer-brand" pointerEvents="none" accessible accessibilityRole="image" accessibilityLabel="Vedansh.app"
    style={{ position: 'absolute', left: 330 * scale, top: 44 * scale, width: 420 * scale, height: 88 * scale, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={420 * scale} height={88 * scale} viewBox="0 0 420 88" style={StyleSheet.absoluteFill} accessible={false}>
      <Defs><RadialGradient id={gradient} cx="50%" cy="50%" rx="50%" ry="50%">
        <Stop offset="0" stopColor="#FBE5B4" stopOpacity="1" /><Stop offset="0.65" stopColor="#FBE5B4" stopOpacity="1" />
        <Stop offset="1" stopColor="#FBE5B4" stopOpacity="0" />
      </RadialGradient></Defs>
      <Ellipse cx="210" cy="44" rx="210" ry="44" fill={`url(#${gradient})`} />
    </Svg>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <WordmarkArtwork kind="en" width={210 * scale} onLoad={onLoad} onError={onError} />
      <Text testID="devotional-domain-suffix" allowFontScaling={false} style={{ fontFamily: fontFamilies.latinSemiBold,
        // The feather extends beyond the final letter in the PNG. Tuck the
        // suffix under that transparent right edge so the domain stays joined.
        fontSize: 36 * scale, lineHeight: 44 * scale, includeFontPadding: false, color: '#4A210F', marginLeft: -24 * scale }}>.app</Text>
    </View>
  </View>;
}

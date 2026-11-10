import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { Lang } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import { WordmarkArtwork } from './VedanshWordmark';

type PaintProps = { width: number; onLoad?: () => void; onError?: () => void };

/** Master-space badge. It hugs the unchanged 196px approved wordmark with a slim double frame,
 * and must still hide the painted legacy plaque (outer gold edge ≈ 38–210 × 53–163 on every
 * subject master, Parshuram's blank plaque to ≈ 227): never narrower or shorter than that. */
export const devotionalHeaderBadge = { left: 32, top: 48, width: 224, height: 120 } as const;
/** The approved wordmark keeps its original size; only the box around it was tightened. */
export const devotionalHeaderMarkWidth = 196;

/** Master-space coordinates. Covers the old painted names without republishing
 * the scenery or adding a bitmap/network request. Branding stays fixed in exports. */
export function DevotionalHeaderBrand({ lang, width, onLoad, onError }: PaintProps & { lang: Lang }) {
  const scale = width / 1080;
  const gradient = `plaque-${React.useId().replace(/:/g, '')}`;
  const badge = devotionalHeaderBadge;
  return <View testID="devotional-header-brand" pointerEvents="none" accessible accessibilityRole="image"
    accessibilityLabel={lang === 'hi' ? 'वेदांश' : 'Vedansh'}
    style={{ position: 'absolute', left: badge.left * scale, top: badge.top * scale, width: badge.width * scale, height: badge.height * scale, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={badge.width * scale} height={badge.height * scale} viewBox="0 0 224 120" style={StyleSheet.absoluteFill} accessible={false}>
      <Defs><LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFF4D6" /><Stop offset="0.55" stopColor="#FCECC5" /><Stop offset="1" stopColor="#F4DCA3" />
      </LinearGradient></Defs>
      <Rect x="1" y="1" width="222" height="118" rx="10" fill={`url(#${gradient})`} stroke="#99651F" strokeWidth="2" />
      <Path d="M18 5H206Q206 13 219 13V107Q206 107 206 115H18Q18 107 5 107V13Q18 13 18 5Z"
        fill="none" stroke="#B9812E" strokeWidth="1.6" />
      <Path d="M21 8H203Q203 16 216 16V104Q203 104 203 112H21Q21 104 8 104V16Q21 16 21 8Z"
        fill="none" stroke="#C99A4B" strokeWidth="0.8" />
      <Path d="M92 18H102Q107 18 108 13Q109 9 112 13Q115 9 116 13Q117 18 122 18H132M112 13V22"
        fill="none" stroke="#A46B21" strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
    <View style={{ marginTop: 6 * scale }}>
      <WordmarkArtwork kind={lang === 'hi' ? 'hi' : 'en'} width={devotionalHeaderMarkWidth * scale} onLoad={onLoad} onError={onError} />
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

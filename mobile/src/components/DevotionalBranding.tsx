import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { Lang } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';
import { WordmarkArtwork } from './VedanshWordmark';

type PaintProps = { width: number; onLoad?: () => void; onError?: () => void };

/** Master-space footprint of the painted legacy plaque (outer gold edge ≈ 38–210 × 53–163
 * on every subject master) plus a 4–5px safety margin. The badge must stay this small:
 * any wider covers scenery, any narrower lets the old printed name show at its edges.
 * Parshuram's blank plaque alone is painted wider (right edge ≈ 227). */
export function devotionalHeaderBadge(art: DevotionalArt) {
  return { left: 34, top: 48, width: art === 'parshuram' ? 198 : 180, height: 120 };
}
/** Wordmark widths inside the inner frame; both clear the ornament and corner notches. */
export const devotionalHeaderMarkWidth = { hi: 142, en: 146 } as const;

/** Master-space coordinates. Covers the old painted names without republishing
 * the scenery or adding a bitmap/network request. Branding stays fixed in exports. */
export function DevotionalHeaderBrand({ art, lang, width, onLoad, onError }: PaintProps & { art: DevotionalArt; lang: Lang }) {
  const scale = width / 1080;
  const gradient = `plaque-${React.useId().replace(/:/g, '')}`;
  const badge = devotionalHeaderBadge(art);
  const right = badge.width - 180; // extra width shifts only the right-hand frame geometry
  const kind = lang === 'hi' ? 'hi' : 'en';
  return <View testID="devotional-header-brand" pointerEvents="none" accessible accessibilityRole="image"
    accessibilityLabel={lang === 'hi' ? 'वेदांश' : 'Vedansh'}
    style={{ position: 'absolute', left: badge.left * scale, top: badge.top * scale, width: badge.width * scale, height: badge.height * scale, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={badge.width * scale} height={badge.height * scale} viewBox={`0 0 ${badge.width} 120`} style={StyleSheet.absoluteFill} accessible={false}>
      <Defs><LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFF4D6" /><Stop offset="0.55" stopColor="#FCECC5" /><Stop offset="1" stopColor="#F4DCA3" />
      </LinearGradient></Defs>
      <Rect x="1" y="1" width={badge.width - 2} height="118" rx="10" fill={`url(#${gradient})`} stroke="#99651F" strokeWidth="2" />
      <Path d={`M21 6H${159 + right}Q${159 + right} 16 ${174 + right} 16V104Q${159 + right} 104 ${159 + right} 114H21Q21 104 6 104V16Q21 16 21 6Z`}
        fill="none" stroke="#B9812E" strokeWidth="1.6" />
      <Path d={`M25 10H${155 + right}Q${155 + right} 20 ${170 + right} 20V100Q${155 + right} 100 ${155 + right} 110H25Q25 100 10 100V20Q25 20 25 10Z`}
        fill="none" stroke="#C99A4B" strokeWidth="0.8" />
      <Path d="M-20 0H-10Q-5 0 -4 -5Q-3 -9 0 -5Q3 -9 4 -5Q5 0 10 0H20M0 -5V4" transform={`translate(${badge.width / 2} 20)`}
        fill="none" stroke="#A46B21" strokeWidth="1.3" strokeLinecap="round" />
    </Svg>
    <View style={{ marginTop: 8 * scale }}>
      <WordmarkArtwork kind={kind} width={devotionalHeaderMarkWidth[kind] * scale} onLoad={onLoad} onError={onError} />
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

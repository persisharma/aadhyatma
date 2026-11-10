import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { Lang } from '@/data/gita/language';
import { fontFamilies } from '@/theme/typography';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';
import { WordmarkArtwork } from './VedanshWordmark';

type PaintProps = { width: number; onLoad?: () => void; onError?: () => void };

/** Master-space badge = the painted legacy plaque it hides (outer gold edge ≈ 37–209 × 54–167
 * on every subject master) plus a 3–4px margin; Parshuram's blank plaque alone runs to ≈ 227.
 * Never smaller, or the old printed name/edge shows. The wordmark is sized to this box. */
export function devotionalHeaderBadge(art: DevotionalArt) {
  return { left: 34, top: 48, width: art === 'parshuram' ? 198 : 180, height: 120 };
}
/** Approved wordmark widths, stacked above the live `Vedansh.app` line like the old plaque. */
export const devotionalHeaderMarkWidth = { hi: 140, en: 148 } as const;
/** Fixed master-space type for the header domain line (never system-scaled: it is badge art). */
export const devotionalHeaderDomain = { text: 'Vedansh.app', fontSize: 25, lineHeight: 28 } as const;

/** Master-space coordinates. Covers the old painted names without republishing
 * the scenery or adding a bitmap/network request. Branding stays fixed in exports. */
export function DevotionalHeaderBrand({ art, lang, width, onLoad, onError }: PaintProps & { art: DevotionalArt; lang: Lang }) {
  const scale = width / 1080;
  const gradient = `plaque-${React.useId().replace(/:/g, '')}`;
  const badge = devotionalHeaderBadge(art);
  const w = badge.width, kind = lang === 'hi' ? 'hi' : 'en';
  return <View testID="devotional-header-brand" pointerEvents="none" accessible accessibilityRole="image"
    accessibilityLabel={lang === 'hi' ? `वेदांश · ${devotionalHeaderDomain.text}` : devotionalHeaderDomain.text}
    style={{ position: 'absolute', left: badge.left * scale, top: badge.top * scale, width: w * scale, height: badge.height * scale, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={w * scale} height={badge.height * scale} viewBox={`0 0 ${w} 120`} style={StyleSheet.absoluteFill} accessible={false}>
      <Defs><LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#FFF4D6" /><Stop offset="0.55" stopColor="#FCECC5" /><Stop offset="1" stopColor="#F4DCA3" />
      </LinearGradient></Defs>
      <Rect x="1" y="1" width={w - 2} height="118" rx="10" fill={`url(#${gradient})`} stroke="#99651F" strokeWidth="2" />
      <Path d={`M18 5H${w - 18}Q${w - 18} 13 ${w - 5} 13V107Q${w - 18} 107 ${w - 18} 115H18Q18 107 5 107V13Q18 13 18 5Z`}
        fill="none" stroke="#B9812E" strokeWidth="1.6" />
      <Path d={`M21 8H${w - 21}Q${w - 21} 16 ${w - 8} 16V104Q${w - 21} 104 ${w - 21} 112H21Q21 104 8 104V16Q21 16 21 8Z`}
        fill="none" stroke="#C99A4B" strokeWidth="0.8" />
    </Svg>
    <View style={{ alignItems: 'center' }}>
      <WordmarkArtwork kind={kind} width={devotionalHeaderMarkWidth[kind] * scale} onLoad={onLoad} onError={onError} />
      <Text testID="devotional-header-domain" accessible={false} allowFontScaling={false} numberOfLines={1} style={{
        fontFamily: fontFamilies.latinBold, color: '#4A210F', includeFontPadding: false, textAlign: 'center',
        fontSize: devotionalHeaderDomain.fontSize * scale, lineHeight: devotionalHeaderDomain.lineHeight * scale, marginTop: 2 * scale,
      }}>{devotionalHeaderDomain.text}</Text>
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

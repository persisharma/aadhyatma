import React, { useEffect, useState } from 'react';
import Svg, { ClipPath, Defs, Polygon, Image as SvgImage } from 'react-native-svg';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import type { ComicPanel } from '@/data/comicBooks';
import { getComicManifest } from '@/data/comicBooks';
import { assetBaseUrl, remoteAssetRequest } from '@/data/assetManifest';
import { cachedAssetUri } from '@/utils/assetCache';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';
import { coverRect } from '@/utils/coverRect';

export function comicArtRequest(art: string, comicId?: string) {
  return remoteAssetRequest(getComicManifest(comicId ?? ''), art, assetBaseUrl());
}
export function comicArtGeometry(panel: ComicPanel, width: number) {
  const { frame, dimensions } = panel;
  const sheetWidth = width / frame.width;
  const sheetHeight = sheetWidth * dimensions.height / dimensions.width;
  return { height: sheetHeight * frame.height, sheetWidth, sheetHeight, left: -sheetWidth * frame.x, top: -sheetHeight * frame.y };
}
/** Sheet placement that makes the panel's frame cover a box (the listing thumb), cropped around `focusX`. */
export function comicArtCoverGeometry(panel: ComicPanel, boxWidth: number, boxHeight: number, focusX = 0.5) {
  const { frame, dimensions } = panel;
  const rect = coverRect(dimensions.width * frame.width, dimensions.height * frame.height, boxWidth, boxHeight, focusX);
  const sheetWidth = dimensions.width * rect.scale;
  const sheetHeight = dimensions.height * rect.scale;
  return { sheetWidth, sheetHeight, left: rect.left - sheetWidth * frame.x, top: rect.top - sheetHeight * frame.y };
}

/**
 * `fill` renders the panel cover-cropped into its parent (absolute fill) — the
 * listing thumb — instead of at the panel's own aspect ratio.
 */
export default function ComicArt({ panel, label, comicId, compact = false, fill = false, focusX = 0.5 }: {
  panel: ComicPanel; label: string; comicId?: string; compact?: boolean; fill?: boolean; focusX?: number;
}) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const width = box.width;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ art: string; uri?: string; failed?: boolean }>({ art: panel.art });
  useEffect(() => {
    let active = true;
    setState({ art: panel.art });
    const req = comicArtRequest(panel.art, comicId);
    if (!req) { setState({ art: panel.art, failed: true }); return; }
    cachedAssetUri(req).then(uri => {
      if (active) setState({ art: panel.art, uri });
    }).catch(error => {
      if (active) {
        if (__DEV__) console.warn(`[comic-art] ${panel.art} download failed`, String(error));
        setState({ art: panel.art, failed: true });
      }
    });
    return () => { active = false; };
  }, [panel.art, attempt]);
  const current = state.art === panel.art ? state : { art: panel.art };
  const frameGeometry = comicArtGeometry(panel, width);
  const geometry = fill ? comicArtCoverGeometry(panel, box.width, box.height, focusX) : frameGeometry;
  return (
    <View testID={`comic-art-${panel.id}`} onLayout={event => setBox({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}
      style={fill
        ? { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden', backgroundColor: colors.parchmentSoft }
        : { width: '100%', aspectRatio: panel.dimensions.width * panel.frame.width / (panel.dimensions.height * panel.frame.height), overflow: 'hidden', backgroundColor: colors.parchmentSoft }}>
      {current.uri && width > 0 && (!fill || box.height > 0) ? panel.mask && !fill ? <Svg width={width} height={frameGeometry.height} accessible accessibilityLabel={label}>
        <Defs><ClipPath id={`frame-${panel.id}`}><Polygon points={panel.mask.map(([x,y]) => `${x * width},${y * frameGeometry.height}`).join(' ')} /></ClipPath></Defs>
        <SvgImage testID={`comic-image-${panel.id}`} href={{ uri: current.uri }} clipPath={`url(#frame-${panel.id})`}
          x={geometry.left} y={geometry.top} width={geometry.sheetWidth} height={geometry.sheetHeight} preserveAspectRatio="none" />
      </Svg> : <Image testID={`comic-image-${panel.id}`} source={{ uri: current.uri }} accessibilityLabel={label}
        onError={() => setState({ art: panel.art, failed: true })} resizeMode="stretch"
        style={{ position: 'absolute', width: geometry.sheetWidth, height: geometry.sheetHeight, left: geometry.left, top: geometry.top }} />
        : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
          {current.failed ? <Pressable testID={`comic-art-retry-${panel.id}`} accessibilityRole="button" accessibilityLabel={pick(lang, { hi: 'चित्र फिर लोड करें', en: 'Retry picture', gu: 'ચિત્ર ફરી લોડ કરો', kn: 'ಚಿತ್ರವನ್ನು ಮತ್ತೆ ಲೋಡ್ ಮಾಡಿ' })} onPress={() => setAttempt(value => value + 1)} style={{ padding: 12 }}>
            <Text style={{ color: colors.inkSoft, textAlign: 'center' }}>{compact ? '↻' : pick(lang, { hi: 'चित्र लोड नहीं हुआ। फिर कोशिश करें', en: 'Picture unavailable. Tap to retry', gu: 'ચિત્ર લોડ થયું નહીં. ફરી પ્રયાસ કરો', kn: 'ಚಿತ್ರ ಲೋಡ್ ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' })}</Text>
          </Pressable> : <ActivityIndicator color={colors.saffron} />}
        </View>}
    </View>
  );
}

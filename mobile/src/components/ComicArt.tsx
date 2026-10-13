import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import type { ComicPanel } from '@/data/comicBooks';
import manifest from '@/data/comicAssetManifest.json';
import { assetBaseUrl, remoteAssetRequest } from '@/data/assetManifest';
import { cachedAssetUri } from '@/utils/assetCache';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { pick } from '@/utils/localize';

export function comicArtRequest(art: string) {
  return remoteAssetRequest(manifest, art, assetBaseUrl());
}
export function comicArtGeometry(panel: ComicPanel, width: number) {
  const { frame, dimensions } = panel;
  const sheetWidth = width / frame.width;
  const sheetHeight = sheetWidth * dimensions.height / dimensions.width;
  return { height: sheetHeight * frame.height, sheetWidth, sheetHeight, left: -sheetWidth * frame.x, top: -sheetHeight * frame.y };
}

export default function ComicArt({ panel, label, compact = false }: { panel: ComicPanel; label: string; compact?: boolean }) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const [width, setWidth] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ art: string; uri?: string; failed?: boolean }>({ art: panel.art });
  useEffect(() => {
    let active = true;
    setState({ art: panel.art });
    const req = comicArtRequest(panel.art);
    if (!req) { setState({ art: panel.art, failed: true }); return; }
    cachedAssetUri(req).then(uri => {
      if (active) setState({ art: panel.art, uri });
    }).catch(() => {
      if (active) setState({ art: panel.art, failed: true });
    });
    return () => { active = false; };
  }, [panel.art, attempt]);
  const current = state.art === panel.art ? state : { art: panel.art };
  const geometry = comicArtGeometry(panel, width);
  return (
    <View testID={`comic-art-${panel.id}`} onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={{ width: '100%', aspectRatio: panel.dimensions.width * panel.frame.width / (panel.dimensions.height * panel.frame.height), overflow: 'hidden', backgroundColor: colors.parchmentSoft }}>
      {current.uri && width > 0 ? <Image testID={`comic-image-${panel.id}`} source={{ uri: current.uri }} accessibilityLabel={label}
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

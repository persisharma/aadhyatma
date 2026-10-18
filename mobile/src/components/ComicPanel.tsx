import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ComicPanel as Panel, ComicLanguage } from '@/data/comicBooks';
import { comicBalloonPath } from '@/data/comicSpeechLayouts';
import ComicArt, { comicArtGeometry } from './ComicArt';
import { useTheme } from '@/theme/ThemeContext';
import { comicTextStyle } from './comicTypography';

export default function ComicPanel({ panel, language }: { panel: Panel; language: ComicLanguage }) {
  const { colors, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [speechHeight, setSpeechHeight] = useState(0);
  const copy = panel[language];
  const artHeight = comicArtGeometry(panel, width).height;
  const original = panel.zone;
  const flow = original[1] < .7 && originalHeight > 96 && originalHeight + 7 - artHeight * original[2] > 64;
  const zone = flow ? [.05, .9, 0, original[3], original[4]] : original;
  const extra = copy.dialogue ? Math.max(0, speechHeight + 7 - artHeight * zone[2]) : 0;
  const y = extra + artHeight * zone[2] - speechHeight;
  const speechStyle = comicTextStyle(language, typography);
  const captionStyle = { ...comicTextStyle(language, typography, true), color: colors.ink, paddingHorizontal: 10, paddingVertical: 9, borderTopWidth: 1, borderColor: '#c9b38e', backgroundColor: '#f5e7c7', textAlign: 'left' as const };
  return <View testID={`comic-panel-${panel.id}`} style={{ borderWidth: 2, borderColor: colors.ink, backgroundColor: '#fbf4df' }}
    onLayout={event => setWidth(Math.max(0, event.nativeEvent.layout.width - 4))}>
    <View testID="comic-scene" style={{ minHeight: artHeight + extra }}>
      <View style={{ paddingTop: extra }}><ComicArt panel={panel} label={copy.narration || copy.dialogue || panel.source} /></View>
      {!!copy.dialogue && width > 0 && <>
        <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
          onLayout={event => setOriginalHeight(event.nativeEvent.layout.height)}
          style={{ position: 'absolute', opacity: 0, width: width * original[1], paddingHorizontal: 10, paddingVertical: 8 }}>
          <Text style={{ ...speechStyle, textAlign: 'center' }}>{copy.dialogue}</Text>
        </View>
        {speechHeight > 0 && <Svg pointerEvents="none" accessible={false} width={width} height={artHeight + extra} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Path testID="comic-balloon-outline" d={comicBalloonPath(width * zone[0], y, width * zone[1], speechHeight, width * zone[3], extra + artHeight * zone[4], 'bottom')} fill="#fffdf5" stroke={colors.ink} strokeWidth={1.5} />
        </Svg>}
        <View key={`${language}-${zone[1]}-${speechStyle.fontSize}`} testID="comic-speech" pointerEvents="none"
          onLayout={event => setSpeechHeight(event.nativeEvent.layout.height)}
          style={{ position: 'absolute', left: width * zone[0], top: y, width: width * zone[1], paddingHorizontal: 10, paddingVertical: 8 }}>
          <Text accessibilityLabel={`${copy.speaker}: ${copy.dialogue}`} style={{ ...speechStyle, color: colors.ink, textAlign: 'center' }}>{copy.dialogue}</Text>
        </View>
      </>}
    </View>
    {!!copy.narration && <Text testID="comic-narration" style={captionStyle}>{copy.narration}</Text>}
    {!!copy.note && <Text testID="comic-context" style={captionStyle}>{copy.note}</Text>}
  </View>;
}

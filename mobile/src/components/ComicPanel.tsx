import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ComicPanel as Panel, ComicLanguage } from '@/data/comicBooks';
import { comicSpeechLayouts, comicSpeechGeometry, comicBalloonPath, comicSpeechFits } from '@/data/comicSpeechLayouts';
import ComicArt, { comicArtGeometry } from './ComicArt';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken } from '@/utils/langType';

export default function ComicPanel({ panel, language }: { panel: Panel; language: ComicLanguage }) {
  const { colors, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const [speechHeight, setSpeechHeight] = useState(0);
  const copy = panel[language];
  const artHeight = comicArtGeometry(panel, width).height;
  const layout = comicSpeechLayouts[panel.id];
  const overlay = layout && comicSpeechFits(layout, artHeight, speechHeight);
  const speech = layout && comicSpeechGeometry(layout, width, artHeight, speechHeight);
  return <View testID={`comic-panel-${panel.id}`} style={{ borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.parchment }}
    onLayout={event => setWidth(Math.max(0, event.nativeEvent.layout.width - 4))}>
    {!!copy.narration && <Text testID="comic-narration" style={{ ...meaningToken(language, typography), color: colors.ink, textAlign: 'left', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1.5, borderColor: colors.ink }}>{copy.narration}</Text>}
    <View testID="comic-scene" style={{ minHeight: speech?.canvasHeight }}>
      <ComicArt panel={panel} label={copy.narration} />
      {copy.dialogue && speech && <>
        {overlay && width > 0 && speechHeight > 0 && <Svg pointerEvents="none" accessible={false} width={width} height={speech.canvasHeight} style={{ position: 'absolute', top: 0, left: 0 }}>
          <Path testID="comic-balloon-outline" d={comicBalloonPath(speech.x, speech.y, speech.width, speech.height, width * layout.tipX, artHeight * layout.tipY, layout.tail)} fill="#fffdf5" stroke={colors.ink} strokeWidth={1.5} />
        </Svg>}
        <View testID="comic-speech" pointerEvents="none" onLayout={event => setSpeechHeight(event.nativeEvent.layout.height)}
          style={{ position: overlay ? 'absolute' : 'relative', left: speech.x, top: overlay ? speech.y : 0, width: speech.width, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text accessibilityLabel={`${copy.speaker}: ${copy.dialogue}`} style={{ ...meaningToken(language, typography), color: colors.ink, textAlign: 'center' }}>{copy.dialogue}</Text>
        </View>
      </>}
    </View>
  </View>;
}

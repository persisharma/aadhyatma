import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { ComicPanel as Panel, ComicLanguage, ComicCopy } from '@/data/comicBooks';
import ComicArt, { comicArtGeometry } from './ComicArt';
import { useTheme } from '@/theme/ThemeContext';
import { meaningToken, titleFontByLang } from '@/utils/langType';

// One continuous outline, with its tip in the painted frame's coordinate space.
export function comicBalloonPath(width: number, height: number, tipX: number, overlay = false) {
  const rx = overlay ? width * 0.42 : Math.min(28, width / 4);
  const ry = overlay ? height * 0.42 : Math.min(28, height / 2);
  const base = Math.max(rx + 13, Math.min(width - rx - 13, tipX));
  const bottom = overlay ? `H ${rx}` : `H ${base + 13} L ${tipX} ${height + 23} L ${base - 13} ${height} H ${rx}`;
  const left = overlay ? `L -22 ${height * 0.9} L 0 ${ry}` : `V ${ry}`;
  return `M ${rx} 0 H ${width - rx} Q ${width} 0 ${width} ${ry} V ${height - ry} Q ${width} ${height} ${width - rx} ${height} ${bottom} Q 0 ${height} 0 ${height - ry} ${left} Q 0 0 ${rx} 0 Z`;
}
function Speech({ copy, language, artWidth, anchor, overlay = false }: { copy: ComicCopy; language: ComicLanguage; artWidth: number; anchor: number; overlay?: boolean }) {
  const { colors, typography } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  return <View testID="comic-speech" onLayout={event => setSize(event.nativeEvent.layout)} style={{ paddingVertical: 12, paddingHorizontal: 14 }}>
    {size.width > 0 && <Svg pointerEvents="none" accessible={false} width={size.width + (overlay ? 26 : 4)} height={size.height + 27}
      viewBox={`${overlay ? -24 : -2} -2 ${size.width + (overlay ? 26 : 4)} ${size.height + 27}`} style={{ position: 'absolute', top: -2, left: overlay ? -24 : -2, overflow: 'visible' }}>
      <Path testID="comic-balloon-outline" d={comicBalloonPath(size.width, size.height, artWidth * anchor - 18, overlay)} fill={colors.parchment} stroke={colors.ink} strokeWidth={1.5} />
    </Svg>}
    {!overlay && <Text style={{ fontFamily: titleFontByLang(language), color: colors.inkSoft, fontSize: typography.meaningLabel.fontSize, textAlign: 'center', marginBottom: 4 }}>{copy.speaker}</Text>}
    <Text accessibilityLabel={overlay ? `${copy.speaker}: ${copy.dialogue}` : undefined} style={{ ...meaningToken(language, typography), color: colors.ink, textAlign: 'center' }}>{copy.dialogue}</Text>
  </View>;
}
export default function ComicPanel({ panel, language }: { panel: Panel; language: ComicLanguage }) {
  const { colors, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const [overlayHeight, setOverlayHeight] = useState(0);
  const copy = panel[language];
  const artHeight = comicArtGeometry(panel, width).height;
  const overlay = !!panel.overlaySpeech && overlayHeight > 0 && overlayHeight <= artHeight * 0.46;
  return <View testID={`comic-panel-${panel.id}`} style={{ borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.parchment }}
    onLayout={event => setWidth(Math.max(0, event.nativeEvent.layout.width - 4))}>
    {!!copy.narration && <Text testID="comic-narration" style={{ ...meaningToken(language, typography), color: colors.ink, textAlign: 'left', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1.5, borderColor: colors.ink }}>{copy.narration}</Text>}
    {panel.overlaySpeech && <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', width: '54%', opacity: 0 }}>
      <Text onLayout={event => setOverlayHeight(event.nativeEvent.layout.height + 24)} style={{ ...meaningToken(language, typography), paddingHorizontal: 14, textAlign: 'center' }}>{copy.dialogue}</Text>
    </View>}
    {copy.dialogue && !overlay && <View style={{ marginHorizontal: 18, marginTop: 14, marginBottom: 29 }}>
      <Speech copy={copy} language={language} artWidth={width} anchor={panel.speakerAnchor!.x} />
    </View>}
    <View>
      <ComicArt panel={panel} label={copy.narration} />
      {copy.dialogue && overlay && <View style={{ position: 'absolute', right: '3%', top: '5%', width: '54%' }}>
        <Speech copy={copy} language={language} artWidth={width} anchor={panel.speakerAnchor!.x} overlay />
      </View>}
    </View>
  </View>;
}

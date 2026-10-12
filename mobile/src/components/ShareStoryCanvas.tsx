import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import ShareCard, { type ShareCardProps } from './ShareCard';
import { storyCanvas, storySafeInsets } from '@/utils/shareStoryLayout';

/**
 * Short verses retain their 9:16 story frame. A longer verse keeps the same
 * readable card width/type and grows this single image by its measured height,
 * retaining the frame's top/bottom breathing room. No card transform or crop.
 */

const CARD_WIDTH = 540;
const CARD_HEIGHT = 675;

type Props = Omit<ShareCardProps, 'width' | 'height'>;

const ShareStoryCanvas = React.forwardRef<View, Props>(function ShareStoryCanvas(props, ref) {
  const { colors } = useTheme();

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={event => props.onHeight?.(event.nativeEvent.layout.height)}
      style={[
        styles.canvas,
        {
          width: storyCanvas.width,
          minHeight: storyCanvas.height,
          paddingTop: storySafeInsets.top,
          paddingBottom: storySafeInsets.bottom,
          backgroundColor: colors.parchment,
        },
      ]}
    >
      {/* Full-bleed source sketch so the frame reads as a designed story rather
          than a letterboxed screenshot. Same plate the card itself carries. */}
      <BackgroundLayer source={getReaderBackground(props.sourceId, { stanza: props.stanza })} />

      {/* The card, at its native size, sitting in the band no chrome covers. */}
      <ShareCard {...props} onHeight={undefined} width={CARD_WIDTH} height={CARD_HEIGHT} />
    </View>
  );
});

export default ShareStoryCanvas;

const styles = StyleSheet.create({
  canvas: { overflow: 'hidden' },
});

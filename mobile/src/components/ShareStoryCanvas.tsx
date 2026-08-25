import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { getReaderBackground } from '@/data/backgrounds';
import BackgroundLayer from './BackgroundLayer';
import ShareCard, { type ShareCardProps } from './ShareCard';
import { placeStoryCard, storyCanvas } from '@/utils/shareStoryLayout';

/**
 * 9:16 wrapper that makes the 4:5 share card safe to post as an Instagram Story
 * or Reel (design.md §39.3).
 *
 * Posting the bare 4:5 card to a Story or Reel makes Instagram scale it up to fill
 * the 9:16 frame and crop the overflow — which is exactly the header band and the
 * branding footer. This renders a real 1080×1920 canvas instead: the source's own
 * faded sketch full-bleed behind, and the card placed, unscaled in composition and
 * only uniformly shrunk, inside the rectangle neither Story nor Reel chrome covers
 * (`shareStoryLayout.ts`).
 *
 * The card keeps its native 540×675 layout and is placed with a `transform`
 * scale, not re-laid-out at story width — re-flowing it would re-wrap the verse
 * lines and change a composition the §39 fit tests already pin.
 */

const CARD_WIDTH = 540;
const CARD_HEIGHT = 675;

type Props = Omit<ShareCardProps, 'width' | 'height'>;

const ShareStoryCanvas = React.forwardRef<View, Props>(function ShareStoryCanvas(props, ref) {
  const { colors } = useTheme();
  const place = placeStoryCard(CARD_WIDTH, CARD_HEIGHT);

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.canvas,
        {
          width: storyCanvas.width,
          height: storyCanvas.height,
          backgroundColor: colors.parchment,
        },
      ]}
    >
      {/* Full-bleed source sketch so the frame reads as a designed story rather
          than a letterboxed screenshot. Same plate the card itself carries. */}
      <BackgroundLayer source={getReaderBackground(props.sourceId, { stanza: props.stanza })} />

      {/* Visual box inside the safe area. The card is absolutely positioned so its
          centre coincides with the box's centre, then scaled about that centre —
          the layout box stays 540×675 while the painted result is `place.width`
          × `place.height`. */}
      <View
        style={{
          position: 'absolute',
          left: place.left,
          top: place.top,
          width: place.width,
          height: place.height,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: (place.width - CARD_WIDTH) / 2,
            top: (place.height - CARD_HEIGHT) / 2,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: [{ scale: place.scale }],
          }}
        >
          <ShareCard {...props} width={CARD_WIDTH} height={CARD_HEIGHT} />
        </View>
      </View>
    </View>
  );
});

export default ShareStoryCanvas;

const styles = StyleSheet.create({
  canvas: { overflow: 'hidden' },
});

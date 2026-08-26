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
 * The card is neither re-laid-out at story width nor transformed: the canvas
 * insets are chosen so a native 540×675 card fits the safe band at 1:1
 * (`shareStoryLayout.ts`). Re-flowing it would re-wrap the verse lines and change
 * a composition the §39 fit tests pin; scaling it would put a `transform` on the
 * view being handed to `captureRef`. What gets captured is a plain, unscaled
 * hierarchy — one absolutely-positioned card over a full-bleed plate.
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

      {/* The card, at its native size, sitting in the band no chrome covers. */}
      <View style={{ position: 'absolute', left: place.left, top: place.top }}>
        <ShareCard {...props} width={place.width} height={place.height} />
      </View>
    </View>
  );
});

export default ShareStoryCanvas;

const styles = StyleSheet.create({
  canvas: { overflow: 'hidden' },
});

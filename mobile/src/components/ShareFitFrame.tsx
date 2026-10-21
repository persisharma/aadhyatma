import type { BackgroundImage } from '@/data/backgroundAsset';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import BackgroundLayer from './BackgroundLayer';
import { placeStoryCard, storyCanvas } from '@/utils/shareStoryLayout';
import { feedCanvas, placeFeedCard } from '@/utils/shareFeedLayout';
import type { ShareFormat } from '@/utils/shareVerse';

export type ShareFitFrameProps = {
  /** `post` → 4:5 feed canvas; `story` → 9:16 Story/Reel canvas. */
  format: ShareFormat;
  /** The plate behind the card, full-bleed. */
  background: BackgroundImage | null;
  /** Natural (unscaled) size of the card being placed. */
  cardWidth: number;
  cardHeight: number;
  /** The card, laid out at its natural size; this frame scales it to fit. */
  children: React.ReactNode;
};

/**
 * Scales a devotional card to fit an Instagram frame whole (design.md §39.3).
 *
 * The card grows with its verse + meaning, so a long one is taller than the 4:5
 * feed and 9:16 story frames. Exporting it at its native height makes Instagram
 * crop the overflow — the header band and the footer branding. Instead we export
 * a true-aspect canvas and place the whole card inside it with a uniform scale,
 * centred (in the safe box for story, in the canvas for feed), on paper. The card
 * lays out at its native size; a `scale` transform shrinks it about its centre, so
 * no type sizes or the meaning-fit budget change — only the rasterised result.
 */
export default function ShareFitFrame({ format, background, cardWidth, cardHeight, children }: ShareFitFrameProps) {
  const { colors } = useTheme();
  const canvas = format === 'story' ? storyCanvas : feedCanvas;
  const place = format === 'story' ? placeStoryCard(cardWidth, cardHeight) : placeFeedCard(cardWidth, cardHeight);
  // Centre the native-size card on the placement centre, then scale about it: a
  // transform scales around the view's own centre, so the shrunk card stays put.
  const centreX = place.left + place.width / 2;
  const centreY = place.top + place.height / 2;
  return (
    <View collapsable={false} style={[styles.canvas, { width: canvas.width, height: canvas.height, backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={background} />
      <View
        style={{
          position: 'absolute',
          left: centreX - cardWidth / 2,
          top: centreY - cardHeight / 2,
          width: cardWidth,
          height: cardHeight,
          transform: [{ scale: place.scale }],
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { overflow: 'hidden' },
});

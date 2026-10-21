import type { StoryCardPlacement } from './shareStoryLayout';

/**
 * Feed (4:5) canvas geometry for the Instagram-post fit frame.
 *
 * Kept OUT of `shareStoryLayout.ts` on purpose: this module is reached only
 * through the deferred `ShareFitFrame` (itself a `require()` thunk in `shareVerse`),
 * so it never enters the static launch graph. `shareStoryLayout` is statically
 * imported app-wide, so anything added there counts against the cold-start budget
 * (`data/__tests__/launchGraph.test.ts`). A short devotional card is already 4:5
 * and fills the canvas; a long one scales down to fit whole — never cropped to 4:5
 * by Instagram, which is what a taller-than-4:5 export triggers. Output is 2× =
 * 1080×1350.
 */
export const feedCanvas = { width: 540, height: 675 } as const;
export const FEED_OUTPUT_WIDTH = 1080;
export const FEED_OUTPUT_HEIGHT = 1350;

/**
 * Place a card inside the 4:5 feed canvas, scaled to fit whole and centred. A card
 * at or under 540×675 lands at scale 1; a taller one shrinks so nothing is cropped
 * when Instagram shows the post. Same shape as `placeStoryCard`.
 */
export function placeFeedCard(cardWidth: number, cardHeight: number): StoryCardPlacement {
  const scale = Math.min(1, feedCanvas.width / cardWidth, feedCanvas.height / cardHeight);
  const width = cardWidth * scale;
  const height = cardHeight * scale;
  return {
    scale,
    width,
    height,
    left: (feedCanvas.width - width) / 2,
    top: (feedCanvas.height - height) / 2,
  };
}

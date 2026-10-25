/** Guards for the 4:5 feed canvas geometry (design.md §39.3) — the Instagram-post
 *  fit frame. Kept out of the launch graph; see `shareFeedLayout.ts`. */
import { FEED_OUTPUT_HEIGHT, FEED_OUTPUT_WIDTH, feedCanvas, placeFeedCard } from '@/utils/shareFeedLayout';

const CARD_WIDTH = 540;
const CARD_HEIGHT = 675;

describe('placeFeedCard (4:5 feed)', () => {
  test('the feed canvas is 4:5 and exports 2× to 1080×1350', () => {
    expect(feedCanvas.width / feedCanvas.height).toBeCloseTo(4 / 5, 5);
    expect(FEED_OUTPUT_WIDTH).toBe(feedCanvas.width * 2);
    expect(FEED_OUTPUT_HEIGHT).toBe(feedCanvas.height * 2);
    expect(FEED_OUTPUT_WIDTH / FEED_OUTPUT_HEIGHT).toBeCloseTo(4 / 5, 5);
  });
  test('a 4:5 card fills the canvas at scale 1', () => {
    const place = placeFeedCard(CARD_WIDTH, CARD_HEIGHT);
    expect(place.scale).toBe(1);
    expect(place.width).toBe(feedCanvas.width);
    expect(place.height).toBe(feedCanvas.height);
    expect(place.left).toBe(0);
    expect(place.top).toBe(0);
  });
  test('a tall card scales down to fit whole and centres, never cropped', () => {
    const place = placeFeedCard(540, 1350);
    expect(place.scale).toBeCloseTo(0.5, 5);
    expect(place.height).toBeCloseTo(feedCanvas.height, 5);
    expect(place.width).toBeLessThanOrEqual(feedCanvas.width);
    expect(place.left + place.width / 2).toBeCloseTo(feedCanvas.width / 2, 5);
    expect(place.width / place.height).toBeCloseTo(540 / 1350, 5);
  });
  test('never scales a small card up', () => {
    expect(placeFeedCard(100, 100).scale).toBe(1);
  });
});

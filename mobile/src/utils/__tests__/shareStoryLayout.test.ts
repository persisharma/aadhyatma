/**
 * Guards for the 9:16 story/reel canvas geometry (design.md §39.3).
 *
 * The bug being prevented is silent: if the card drifts outside the safe box the
 * export still succeeds and still looks fine in the app's own preview — the crop
 * only shows up on someone's phone, after they posted it. So the invariants are
 * pinned numerically here rather than eyeballed.
 */

import {
  STORY_OUTPUT_HEIGHT,
  STORY_OUTPUT_WIDTH,
  placeStoryCard,
  storyCanvas,
  storySafeBox,
  storySafeInsets,
} from '@/utils/shareStoryLayout';

const CARD_WIDTH = 540;
const CARD_HEIGHT = 675;

describe('story canvas', () => {
  test('is 9:16, and the export is exactly 2× the render size', () => {
    expect(storyCanvas.width / storyCanvas.height).toBeCloseTo(9 / 16, 5);
    expect(STORY_OUTPUT_WIDTH).toBe(storyCanvas.width * 2);
    expect(STORY_OUTPUT_HEIGHT).toBe(storyCanvas.height * 2);
    // A true 1080×1920 export is the whole point: Instagram scales a 4:5 image
    // up to fill the frame and crops it, and only a native-aspect frame avoids that.
    expect(STORY_OUTPUT_WIDTH / STORY_OUTPUT_HEIGHT).toBeCloseTo(9 / 16, 5);
  });

  test('the safe box excludes the chrome insets on every edge', () => {
    const safe = storySafeBox();
    expect(safe.x).toBe(storySafeInsets.horizontal);
    expect(safe.y).toBe(storySafeInsets.top);
    expect(safe.x + safe.width).toBe(storyCanvas.width - storySafeInsets.horizontal);
    expect(safe.y + safe.height).toBe(storyCanvas.height - storySafeInsets.bottom);
  });
});

describe('placeStoryCard', () => {
  const place = placeStoryCard(CARD_WIDTH, CARD_HEIGHT);

  test('keeps the card whole inside the safe box', () => {
    const safe = storySafeBox();
    expect(place.left).toBeGreaterThanOrEqual(safe.x);
    expect(place.top).toBeGreaterThanOrEqual(safe.y);
    expect(place.left + place.width).toBeLessThanOrEqual(safe.x + safe.width);
    expect(place.top + place.height).toBeLessThanOrEqual(safe.y + safe.height);
  });

  test('scales uniformly — the 4:5 card is never stretched to fill 9:16', () => {
    expect(place.width / place.height).toBeCloseTo(CARD_WIDTH / CARD_HEIGHT, 5);
    expect(place.scale).toBeGreaterThan(0);
    expect(place.scale).toBeLessThanOrEqual(1);
  });

  test('centres in the SAFE box, not the canvas', () => {
    const safe = storySafeBox();
    expect(place.left + place.width / 2).toBeCloseTo(safe.x + safe.width / 2, 5);
    expect(place.top + place.height / 2).toBeCloseTo(safe.y + safe.height / 2, 5);
    // Centring in the canvas instead would push the card's branding footer down
    // under the Reel caption strip, so the two centres must NOT coincide.
    expect(place.top + place.height / 2).not.toBeCloseTo(storyCanvas.height / 2, 1);
    expect(place.top).toBe(storySafeInsets.top);
  });

  test('the shipped card fits at 1:1 — nothing is transformed', () => {
    // The insets exist to make this true. If it ever fails, the capture starts
    // carrying a scale transform, which is the thing §39.3 set out to avoid.
    expect(place.scale).toBe(1);
    expect(place.width).toBe(CARD_WIDTH);
    expect(place.height).toBe(CARD_HEIGHT);
  });

  test('the card fills the safe band exactly, with no horizontal inset', () => {
    const safe = storySafeBox();
    expect(place.width).toBe(safe.width);
    expect(place.height).toBe(safe.height);
    expect(place.left).toBe(0);
  });

  test('a card that outgrows the band scales down rather than overflowing', () => {
    const tall = placeStoryCard(100, 10000);
    const safe = storySafeBox();
    expect(tall.height).toBeCloseTo(safe.height, 5);
    expect(tall.width).toBeLessThanOrEqual(safe.width);
    expect(tall.scale).toBeLessThan(1);
  });

  test('never scales a small card UP to fill the band', () => {
    expect(placeStoryCard(100, 100).scale).toBe(1);
  });
});

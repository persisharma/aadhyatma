/**
 * Geometry for the 9:16 Instagram Story / Reel share canvas (design.md §39.3).
 *
 * ## The problem this solves
 *
 * The share card is 4:5 (1080×1350). That is the tallest aspect a **feed post**
 * accepts, so a post shows it whole. A **Story** or **Reel** is 9:16 — Instagram
 * fills the frame from a 4:5 image by scaling it up and cropping the top and
 * bottom off, which eats the card's header band and its branding footer. The fix
 * is not to stretch the card: it is to render a 9:16 canvas and place the card,
 * unchanged, inside the part of that canvas Instagram will neither crop nor cover.
 *
 * ## Two different things are being avoided
 *
 * 1. **Crop** — handled by exporting a true 1080×1920 image, so nothing is scaled
 *    to fill.
 * 2. **Chrome** — Story and Reel both paint UI over the frame: the avatar and
 *    close button at the top, the reply bar at the bottom of a Story, the caption
 *    and audio strip at the bottom of a Reel. The vertical insets below are the
 *    **union** of Story and Reel chrome, so one exported image is safe posted
 *    either way.
 *
 * ## Why there is no horizontal inset
 *
 * A Reel also paints a like/comment/share rail down the right edge (~100 px). An
 * inset wide enough to clear it would force the card below its native 540 dp
 * width, i.e. a scale transform on the captured view — and the card's type sizes
 * and its meaning-fit budget are tuned against exactly 540×675 (§39). The cheaper
 * trade is to run the card full-bleed horizontally and let the rail sit over its
 * 28 dp internal padding: the rail overlaps the card's margin, never its text.
 * That keeps the capture a plain, unscaled view hierarchy.
 *
 * The insets below are therefore chosen so the card fits at **scale 1**. All
 * values are dp against {@link storyCanvas}; the capture is taken at 2×.
 * Pure module — the unit tests import it without bootstrapping React Native.
 */

/** Render size of the off-screen story canvas, in dp. 2× = the 1080×1920 export. */
export const storyCanvas = { width: 540, height: 960 } as const;

/** Exported PNG dimensions for the story/reel format. */
export const STORY_OUTPUT_WIDTH = 1080;
export const STORY_OUTPUT_HEIGHT = 1920;

/**
 * Vertical chrome insets in dp, the union of what Story and Reel paint over the
 * frame. Horizontal is 0 by design — see the header.
 *
 * - `top` 120 (240 px) — the Story avatar/progress row and the Reel header.
 * - `bottom` 165 (330 px) — the Reel caption + audio strip, which reaches lower
 *   than the Story reply bar.
 *
 * Their sum leaves exactly the card's 675 dp height, so `placeStoryCard` lands on
 * scale 1 for the shipped card size. Change one and the card starts scaling —
 * `shareStoryLayout.test.ts` fails loudly if that happens.
 */
export const storySafeInsets = { top: 120, bottom: 165, horizontal: 0 } as const;

/** The rectangle inside the canvas that neither format crops nor covers. */
export function storySafeBox(): { x: number; y: number; width: number; height: number } {
  return {
    x: storySafeInsets.horizontal,
    y: storySafeInsets.top,
    width: storyCanvas.width - storySafeInsets.horizontal * 2,
    height: storyCanvas.height - storySafeInsets.top - storySafeInsets.bottom,
  };
}

export type StoryCardPlacement = {
  /** Uniform scale. 1 at the shipped card size — the canvas is sized to make it so. */
  scale: number;
  /** Size of the placed card's visual box, in dp. */
  width: number;
  height: number;
  /** Top-left of that box within the canvas, in dp. */
  left: number;
  top: number;
};

/**
 * Place the share card inside the safe box, centred **in the safe box, not the
 * canvas** — canvas-centring would push the card's branding footer down under the
 * Reel caption strip.
 *
 * The scale is a backstop, not a design tool: the insets are chosen so a
 * 540×675 card fits at 1:1. It only drops below 1 if the card outgrows the band,
 * which the tests treat as a regression to look at rather than absorb silently.
 */
export function placeStoryCard(cardWidth: number, cardHeight: number): StoryCardPlacement {
  const safe = storySafeBox();
  const scale = Math.min(1, safe.width / cardWidth, safe.height / cardHeight);
  const width = cardWidth * scale;
  const height = cardHeight * scale;
  return {
    scale,
    width,
    height,
    left: safe.x + (safe.width - width) / 2,
    top: safe.y + (safe.height - height) / 2,
  };
}

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
 *    and audio strip at the bottom of a Reel, and the like/comment/share rail down
 *    the right edge of a Reel. The insets below are the **union** of Story and
 *    Reel chrome, so one exported image is safe posted either way.
 *
 * All values are in dp against the {@link storyCanvas} render size; the capture
 * is taken at 2× (1080×1920). Pure module — the unit tests import it without
 * bootstrapping React Native.
 */

/** Render size of the off-screen story canvas, in dp. 2× = the 1080×1920 export. */
export const storyCanvas = { width: 540, height: 960 } as const;

/** Exported PNG dimensions for the story/reel format. */
export const STORY_OUTPUT_WIDTH = 1080;
export const STORY_OUTPUT_HEIGHT = 1920;

/**
 * Chrome insets in dp, the union of what Story and Reel paint over the frame.
 *
 * - `top` 125 (250 px) — the Story avatar/progress row and the Reel header.
 * - `bottom` 170 (340 px) — the Reel caption + audio strip, which reaches lower
 *   than the Story reply bar.
 * - `horizontal` 50 (100 px) — the Reel action rail on the right; mirrored on the
 *   left so the card stays optically centred rather than nudged off-axis.
 */
export const storySafeInsets = { top: 125, bottom: 170, horizontal: 50 } as const;

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
  /** Uniform scale applied to the natively-sized card. */
  scale: number;
  /** Size of the scaled card's visual box, in dp. */
  width: number;
  height: number;
  /** Top-left of that box within the canvas, in dp. */
  left: number;
  top: number;
};

/**
 * Place the share card inside the safe box: the largest uniform scale that fits,
 * centred in the safe box (**not** in the canvas — centring in the canvas would
 * push the card's footer under the Reel caption strip).
 *
 * The card is scaled rather than re-laid-out at story dimensions on purpose. Its
 * type sizes are hand-tuned against 540×675 (§39) and its meaning block fits
 * itself to that geometry; re-flowing it at a different width would re-wrap the
 * verse lines and silently change a composition that is already guarded by
 * `shareCardFit` / `shareCardType` tests.
 */
export function placeStoryCard(cardWidth: number, cardHeight: number): StoryCardPlacement {
  const safe = storySafeBox();
  const scale = Math.min(safe.width / cardWidth, safe.height / cardHeight);
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

/**
 * Decode a bundled painted icon near the size it is DRAWN at, not the size it
 * was painted at (Android; the props are ignored on iOS).
 *
 * The painted icon sets are 256–512 px masters drawn at 22–96 dp. React Native
 * only asks Fresco to size-match `file://` and `content://` images
 * (`resizeMethod="auto"`), so a bundled icon was decoded whole: 512×512 ARGB is
 * 1 MB of bitmap for a tile that covers 88×88 px on an xhdpi phone. A screen of
 * them costs tens of megabytes on exactly the devices that have the least.
 *
 * `resize` makes the pipeline pick a power-of-two sample size from the laid-out
 * view. `resizeMultiplier` is the quality margin: Fresco rounds a sample size
 * UP by a third of an interval, so at 1.0 a 128 px bitmap could be stretched
 * over a 142 px view. At 1.5 the decoded bitmap is never smaller than the view
 * for any size these icons are drawn at, so the icon is never upscaled.
 *
 * DO NOT spread this onto an image that is rendered inside an exported share
 * card: a capture can be drawn at more pixels than the on-screen view, and the
 * export would inherit the smaller bitmap. Share cards use `brandMark` and
 * `VedanshWordmark`, which deliberately do not take it.
 */
export const PAINTED_ICON_DECODE = { resizeMethod: 'resize', resizeMultiplier: 1.5 } as const;

/**
 * A model of how big a bitmap Android decodes for a React Native `<Image>`.
 *
 * NOT app code: nothing on a screen imports this. It exists so the choice of
 * `PAINTED_ICON_DECODE` (`components/paintedIconDecode.ts`) is a tested fact
 * instead of a comment, and so `scripts/perf-report.mts` reports the same
 * numbers the tests assert.
 *
 * What it models, read from the sources of the versions this app ships
 * (React Native 0.81.5, Fresco 3.6):
 *
 *   - `ReactImageView.shouldResize`: `resizeMethod="auto"` passes the view size
 *     to Fresco only for `file://` and `content://` sources. A bundled image is
 *     a `res:` source in a release build, so `auto` decodes it whole;
 *     `resizeMethod="resize"` always passes the size, scaled by
 *     `resizeMultiplier`.
 *   - `DecodeProducer` with `DownsampleMode.AUTO` (React Native's setting):
 *     local sources with a requested size are downsampled at decode time.
 *   - `DownsampleUtil.determineDownsampleRatio` / `ratioToSampleSize`: the
 *     ratio is the LARGER of the two axis ratios; the sample size is the
 *     largest `s` whose threshold `1/s + (1/(s-1) - 1/s) / 3` is still above
 *     the ratio — i.e. a sample size is rounded up by a third of an interval.
 *   - `BitmapFactory.Options.inSampleSize`: the platform decoder rounds any
 *     value DOWN to a power of two.
 */
const INTERVAL_ROUNDING = 1 / 3;

/** Fresco's `DownsampleUtil.ratioToSampleSize` (non-JPEG formats). */
export function frescoSampleSize(ratio: number): number {
  if (ratio > 0.5 + 0.5 * INTERVAL_ROUNDING) return 1;
  let sampleSize = 2;
  for (;;) {
    const intervalLength = 1 / (sampleSize * sampleSize - sampleSize);
    const compare = 1 / sampleSize + intervalLength * INTERVAL_ROUNDING;
    if (compare <= ratio) return sampleSize - 1;
    sampleSize += 1;
  }
}

/** What `BitmapFactory` actually applies for a requested `inSampleSize`. */
export function platformSampleSize(requested: number): number {
  let power = 1;
  while (power * 2 <= requested) power *= 2;
  return power;
}

export type DecodedBitmap = { width: number; height: number; bytes: number };

/**
 * The bitmap decoded for a `sourceWidth`×`sourceHeight` PNG/WebP shown in a
 * view of `viewWidth`×`viewHeight` PIXELS (dp × density).
 *
 * `resizeMultiplier` of `null` models an image Fresco is given no size for —
 * a bundled image under the default `resizeMethod="auto"`.
 */
export function decodedBitmap(
  sourceWidth: number,
  sourceHeight: number,
  viewWidth: number,
  viewHeight: number,
  resizeMultiplier: number | null,
): DecodedBitmap {
  let sample = 1;
  if (resizeMultiplier !== null) {
    const ratio = Math.max(
      Math.round(viewWidth * resizeMultiplier) / sourceWidth,
      Math.round(viewHeight * resizeMultiplier) / sourceHeight,
    );
    sample = platformSampleSize(frescoSampleSize(ratio));
  }
  const width = Math.floor(sourceWidth / sample);
  const height = Math.floor(sourceHeight / sample);
  return { width, height, bytes: width * height * 4 };
}

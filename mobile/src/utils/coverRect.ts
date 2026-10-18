/**
 * CSS `object-fit: cover` for React Native: the size and offset that make a
 * source region fill a box, cropping the overflow around a focal point.
 *
 * `focusX` / `focusY` (0–1) name the point of the source that should sit as
 * close to the box centre as the crop allows; the result never leaves a gap,
 * so `left`/`top` stay within `[box - size, 0]`.
 */
export function coverRect(
  srcWidth: number,
  srcHeight: number,
  boxWidth: number,
  boxHeight: number,
  focusX = 0.5,
  focusY = 0.5,
) {
  const scale = Math.max(boxWidth / srcWidth, boxHeight / srcHeight);
  const width = srcWidth * scale;
  const height = srcHeight * scale;
  const left = Math.min(0, Math.max(boxWidth - width, boxWidth / 2 - focusX * width));
  const top = Math.min(0, Math.max(boxHeight - height, boxHeight / 2 - focusY * height));
  return { scale, width, height, left, top };
}

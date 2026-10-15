// Coordinates follow the painted portrait. The bubble edge is anchored near
// the cast; changing language or text size grows its body away from their faces.
export type ComicSpeechLayout = {
  x: number; width: number; bodyEdge: number; tipX: number; tipY: number;
  tail: 'top' | 'bottom';
};
const above = (bodyEdge: number, tipX: number, tipY: number): ComicSpeechLayout =>
  ({ x: 0.04, width: 0.92, bodyEdge, tipX, tipY, tail: 'bottom' });
export const comicSpeechLayouts: Record<string, ComicSpeechLayout> = {
  'bk-01-01': above(0.34, 0.24, 0.375),
  'bk-01-02': above(0.34, 0.75, 0.365),
  'bk-01-04': above(0.27, 0.69, 0.3),
  'bk-03-01': above(0.235, 0.16, 0.295),
  'bk-05-03a': above(0.37, 0.24, 0.39),
  'bk-06-01': above(0.325, 0.2, 0.345),
  'bk-06-02': above(0.3, 0.58, 0.395),
  'bk-06-03': above(0.35, 0.45, 0.425),
  'bk-07-03': above(0.43, 0.53, 0.495),
  'bk-08-02': above(0.28, 0.47, 0.32),
  'bk-09-02': above(0.255, 0.64, 0.39),
  'bk-09-02a': above(0.3, 0.44, 0.365),
  'bk-10-04': above(0.335, 0.23, 0.355),
  'bk-12-01': above(0.28, 0.38, 0.38),
  'bk-13-06': above(0.32, 0.74, 0.345),
  'bk-14-02': above(0.33, 0.69, 0.35),
  'bk-17-01': above(0.34, 0.43, 0.38),
  'bk-18-02': above(0.3, 0.18, 0.43),
  'bk-19-02': above(0.305, 0.82, 0.325),
  'bk-19-07': above(0.335, 0.78, 0.355),
  'bk-20-03': above(0.31, 0.3, 0.475),
  'bk-21-03': above(0.35, 0.46, 0.565),
  'bk-22-04': above(0.39, 0.43, 0.41),
  'bk-23-04': above(0.305, 0.3, 0.325),
  'bk-23-06': above(0.315, 0.64, 0.435),
  'bk-26-02': above(0.34, 0.86, 0.37),
  'bk-27-04': above(0.305, 0.26, 0.495),
  'bk-27-05': above(0.335, 0.27, 0.355),
  'bk-28-01': above(0.295, 0.77, 0.38),
  'bk-28-03': above(0.415, 0.24, 0.475),
  // Trishanku's head is below his feet: approach it from the empty sky below.
  'bk-20-05': { x: 0.04, width: 0.92, bodyEdge: 0.785, tipX: 0.27, tipY: 0.745, tail: 'top' },
};

export function comicSpeechGeometry(layout: ComicSpeechLayout, width: number, artHeight: number, textHeight: number) {
  return { x: width * layout.x, y: layout.tail === 'bottom' ? Math.max(0, artHeight * layout.bodyEdge - textHeight) : artHeight * layout.bodyEdge,
    width: width * layout.width, height: textHeight, canvasHeight: artHeight };
}

// At extreme accessibility scales, retain complete dialogue in normal flow.
// Standard/Large Hindi and English must pass the painted-headroom review.
export function comicSpeechFits(layout: ComicSpeechLayout, artHeight: number, textHeight: number) {
  const available = layout.tail === 'bottom' ? layout.bodyEdge - 0.005 : 0.995 - layout.bodyEdge;
  return textHeight <= artHeight * available;
}

// One continuous balloon outline, ending at the visually reviewed speaker point.
export function comicBalloonPath(x: number, y: number, width: number, height: number, tipX: number, tipY: number, edge: ComicSpeechLayout['tail']) {
  const r = Math.min(22, width / 4, height / 3);
  const bx = Math.max(x + r + 10, Math.min(x + width - r - 10, tipX));
  const top = edge === 'top' ? `H ${bx - 10} L ${tipX} ${tipY} L ${bx + 10} ${y}` : '';
  const bottom = edge === 'bottom' ? `H ${bx + 10} L ${tipX} ${tipY} L ${bx - 10} ${y + height}` : '';
  return `M ${x + r} ${y} ${top} H ${x + width - r} Q ${x + width} ${y} ${x + width} ${y + r} V ${y + height - r} Q ${x + width} ${y + height} ${x + width - r} ${y + height} ${bottom} H ${x + r} Q ${x} ${y + height} ${x} ${y + height - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}

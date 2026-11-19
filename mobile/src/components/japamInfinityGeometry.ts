/** Normalized horizontal infinity, starting at its centre crossing. */
export function infinityPoint(turns: number) {
  const t = turns * 2 * Math.PI;
  return { x: 0.5 + 0.44 * Math.sin(t), y: 0.325 - 0.25 * Math.sin(2 * t) };
}

export const INFINITY_SAMPLES = 216;
export const INFINITY_PATH = Array.from({ length: INFINITY_SAMPLES + 1 }, (_, i) => {
  const { x, y } = infinityPoint(i / INFINITY_SAMPLES);
  return `${i === 0 ? 'M' : 'L'}${(x * 1000).toFixed(3)} ${(y * 1000).toFixed(3)}`;
}).join(' ');

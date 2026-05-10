export function clampIndex(idx: number | undefined, length: number): number {
  if (length <= 0) return 0;
  const value = typeof idx === 'number' && Number.isFinite(idx) ? Math.floor(idx) : 0;
  if (value < 0) return 0;
  if (value >= length) return length - 1;
  return value;
}

export function isChapterInRange(chapter: number | undefined, manifestLength: number): boolean {
  if (typeof chapter !== 'number' || !Number.isFinite(chapter)) return false;
  return chapter >= 1 && chapter <= manifestLength;
}

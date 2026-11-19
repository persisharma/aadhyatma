/** Shared whole-word timing. The host owns playback, speed and page/loop changes.
 * This module has no Japam, audio, pager or React dependency.
 */
export type KaraokeWord = { text: string; start: number; end: number };
export type KaraokeLine = { text: string; words: readonly KaraokeWord[] };
export type KaraokeWordWeight = (word: string) => number;

const defaultWeight: KaraokeWordWeight = word => word.trim().replace(/[।॥|.,!?;:–—-]/g, '').length;

/** Keep all whitespace/punctuation and shape complete words, never glyph pieces. */
function runs(line: string): string[] {
  return line.match(/\s*\S+\s*|\s+/g) ?? [];
}

function weights(words: readonly string[], weight: KaraokeWordWeight): number[] {
  return words.map(word => {
    const value = weight(word);
    return Number.isFinite(value) && value > 0 ? value : 0;
  });
}

/** Normalised intervals for one complete passage, independent of playback rate.
 * Matching reference/display words share reference timing (e.g. sister scripts).
 * Different word counts use proportional display timing within reference lines
 * where possible, or across the displayed passage when line counts also differ.
 * No visible text is removed, duplicated or abbreviated.
 */
export function buildKaraokeTimeline(
  lines: readonly string[],
  options: { referenceLines?: readonly string[]; wordWeight?: KaraokeWordWeight } = {},
): readonly KaraokeLine[] {
  const reference = options.referenceLines ?? lines;
  const weight = options.wordWeight ?? defaultWeight;
  const displayRuns = lines.map(runs);
  const referenceRuns = reference.map(runs);
  const allReferenceWeights = weights(referenceRuns.flat(), weight);
  const aligned = displayRuns.reduce((sum, words) => sum + words.length, 0) === allReferenceWeights.length;
  let referenceOffset = 0;
  const prepared = lines.map((text, index) => {
    const words = displayRuns[index];
    const referenceWords = reference.length === lines.length ? referenceRuns[index] : words;
    const referenceWeights = aligned
      ? allReferenceWeights.slice(referenceOffset, referenceOffset + words.length)
      : weights(referenceWords, reference.length === lines.length ? weight : defaultWeight);
    referenceOffset += words.length;
    let wordWeights = aligned || words.length === referenceWords.length
      ? referenceWeights : weights(words, defaultWeight);
    if (!wordWeights.some(n => n > 0)) wordWeights = words.map(() => 1);
    const referenceTotal = referenceWeights.reduce((sum, n) => sum + n, 0);
    return { text, words, wordWeights,
      lineWeight: referenceTotal || wordWeights.reduce((sum, n) => sum + n, 0) };
  });
  const total = prepared.reduce((sum, line) => sum + line.lineWeight, 0);
  let lineStart = 0;
  return prepared.map(line => {
    const lineEnd = total > 0 ? Math.min(1, lineStart + line.lineWeight / total) : lineStart;
    const wordTotal = line.wordWeights.reduce((sum, n) => sum + n, 0);
    let start = lineStart;
    const words = line.words.map((text, index) => {
      const end = index === line.words.length - 1 ? lineEnd
        : wordTotal > 0 ? Math.min(lineEnd, start + (lineEnd - lineStart) * line.wordWeights[index] / wordTotal) : start;
      const word = { text, start, end };
      start = end;
      return word;
    });
    lineStart = lineEnd;
    return { text: line.text, words };
  });
}

/** Shared configurable-speed arithmetic. A zero duration means no passage. */
export function karaokeDurationMs(baseMs: number, rate = 1): number {
  if (!Number.isFinite(baseMs) || baseMs <= 0) return 0;
  const speed = Number.isFinite(rate) && rate > 0 ? rate : 1;
  return Math.max(1, Math.round(baseMs / speed));
}

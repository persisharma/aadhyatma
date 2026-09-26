/**
 * Keep very long prose out of a single native Text layout. iOS TextKit can
 * throw while shaping long Kannada commentary (reproduced with Gita 13.9).
 * Split only after sentence punctuation or whitespace; preserve every code
 * unit and never cut through a word/conjunct to satisfy the preferred bound.
 */
export function readingParagraphs(text: string, preferredLimit = 1200): string[] {
  if (!Number.isInteger(preferredLimit) || preferredLimit < 1) throw new Error('Invalid paragraph limit');
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > preferredLimit) {
    const prefix = remaining.slice(0, preferredLimit);
    const sentenceEnds = [...prefix.matchAll(/[।!?]+\s*|\.\s+/gu)];
    let boundary = sentenceEnds.at(-1);
    // Prefer a sentence end; otherwise a word boundary. A pathological single
    // token remains intact rather than splitting an Indic combining sequence.
    if (!boundary) boundary = [...prefix.matchAll(/\s+/gu)].at(-1);
    if (!boundary) break;
    const end = boundary.index! + boundary[0].length;
    chunks.push(remaining.slice(0,end));
    remaining = remaining.slice(end);
  }
  if (remaining.length || !chunks.length) chunks.push(remaining);
  return chunks;
}

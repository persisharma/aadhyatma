/** Presentation only: preserve every word and let native words wrap as needed.
 * Four-pada mantras such as Gayatri pair their padas into two reading rows.
 * Larger text/long compounds can still grow; this is never a two-line clamp.
 */
export function compactJapamReadingLines(lines: readonly string[]): string[] {
  if (lines.length === 4) return [lines.slice(0, 2).join(' '), lines.slice(2).join(' ')];
  return lines.length ? [lines.join(' ')] : [];
}

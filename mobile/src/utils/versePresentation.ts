// Presentation only: canonical scripture and stable verse identities stay intact.
const DIGITS = '0-9०-९૦-૯೦-೯';
const REFERENCE = new RegExp(`([${DIGITS}]+(?:\\.[${DIGITS}]+)*)\\s*$`, 'u');
const CLOSING_REFERENCE = new RegExp(`(॥|।{2}|\\|{2})\\s*([${DIGITS}]+(?:\\.[${DIGITS}]+)*)\\s*(?:॥|।{2}|\\|{2})\\s*$`, 'u');

function asciiDigits(value: string): string {
  return value.replace(/[०-९૦-૯೦-೯]/gu, digit => {
    const code = digit.charCodeAt(0);
    const zero = code >= 0x0ce6 ? 0x0ce6 : code >= 0x0ae6 ? 0x0ae6 : 0x0966;
    return String(code - zero);
  });
}

/** Remove only a terminal citation that is already supplied by the visible label.
 * Keep the closing danda, every recitation word, original rows and input arrays.
 * No label, a mismatching citation, prose numbers and unnumbered mantras are unchanged.
 */
export function verseLinesForDisplay(lines: readonly string[], referenceLabel?: string): readonly string[] {
  const reference = referenceLabel?.match(REFERENCE)?.[1];
  if (!reference) return lines;
  let last = lines.length - 1;
  while (last >= 0 && !lines[last].trim()) last--;
  if (last < 0) return lines;
  const match = CLOSING_REFERENCE.exec(lines[last]);
  if (!match || asciiDigits(match[2]) !== asciiDigits(reference)) return lines;
  const result = [...lines];
  result[last] = lines[last].slice(0, match.index) + match[1];
  return result;
}

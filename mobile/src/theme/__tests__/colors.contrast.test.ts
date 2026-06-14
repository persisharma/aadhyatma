import { lightColors } from '../colors';

/**
 * Readability guard for the primary reading color.
 *
 * The reader renders verses and English meaning prose in `colors.ink` over the
 * `colors.parchment` background, using a thin serif (Cormorant Garamond). The
 * original #2F1E10 passed WCAG AAA on paper (~13:1) yet still read as "too light"
 * because it is a warm brown, not a true dark, sitting under a textured backdrop.
 *
 * These tests pin the deepened value AND the contrast rationale behind it, so a
 * future palette tweak can't silently lighten reading text back below the level
 * we deliberately chose. Bumping the threshold here should be a conscious design
 * decision, not an accident.
 */

// WCAG 2.x relative-luminance + contrast-ratio, computed from a #RRGGBB string.
function relativeLuminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`Expected #RRGGBB, got ${hex}`);
  const channels = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

describe('reading color readability', () => {
  test('ink is the deepened "strong" shade', () => {
    expect(lightColors.ink).toBe('#1A0E03');
    // text is a semantic alias of the same darkest-ink concept; keep it in sync.
    expect(lightColors.text).toBe(lightColors.ink);
  });

  test('ink contrasts strongly against the parchment background', () => {
    const ratio = contrastRatio(lightColors.ink, lightColors.parchment);
    // ~15.4:1 with the chosen shade. Floor at 15 to lock the deepening in and
    // reject any regression toward the lighter browns that felt washed out.
    expect(ratio).toBeGreaterThanOrEqual(15);
  });

  test('contrast helper matches a known WCAG reference (black on white = 21:1)', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });
});

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

describe('secondary text readability', () => {
  // inkMuted carries every subtitle, caption, and demoted secondary-language line
  // app-wide. The original #8A6A47 only reached ~4.0:1 on parchment — under the
  // WCAG AA 4.5 floor — so secondary text read as dull/half-visible. This pins the
  // deepened value so it can't silently drift light again.
  test('inkMuted clears WCAG AA against both the background and cards', () => {
    expect(contrastRatio(lightColors.inkMuted, lightColors.parchment)).toBeGreaterThanOrEqual(5.5);
    expect(contrastRatio(lightColors.inkMuted, lightColors.parchmentSoft)).toBeGreaterThanOrEqual(5.5);
  });

  test('textMuted stays in sync with inkMuted', () => {
    expect(lightColors.textMuted).toBe(lightColors.inkMuted);
  });

  // Hierarchy must hold: muted is a caption, not a peer of the body text — so it
  // must stay clearly LOWER-contrast (lighter) than inkSoft.
  test('inkMuted reads lighter than inkSoft (caption < body)', () => {
    const muted = contrastRatio(lightColors.inkMuted, lightColors.parchment);
    const soft = contrastRatio(lightColors.inkSoft, lightColors.parchment);
    expect(muted).toBeLessThan(soft);
  });
});

describe('signal text readability on card surfaces (design.md §12)', () => {
  // The Muhurat glance card renders times and quality chips in the SIGNAL colors
  // (`avoid` terracotta, `saffronDeep`) on the `cardActive*` gradient and on
  // `parchmentSoft` tiles — not on the base parchment the tokens above are tuned
  // for. NOTE: for DARK text on these light surfaces, a tinted chip background
  // *lowers* the ratio (it darkens the surface toward the text) — so raw-surface
  // checks are necessary but NOT sufficient for chip text; the composited checks
  // in the next describe block cover the chips. This pins the signal colors so a
  // palette tweak can't lighten them below the WCAG AA 4.5:1 floor and
  // reintroduce the "faint secondary text" regression.
  const cardSurfaces = ['cardActiveFrom', 'cardActiveTo', 'parchmentSoft'] as const;

  for (const surface of cardSurfaces) {
    test(`avoid clears WCAG AA on ${surface}`, () => {
      expect(contrastRatio(lightColors.avoid, lightColors[surface])).toBeGreaterThanOrEqual(4.5);
    });
    test(`saffronDeep clears WCAG AA on ${surface}`, () => {
      expect(contrastRatio(lightColors.saffronDeep, lightColors[surface])).toBeGreaterThanOrEqual(4.5);
    });
    test(`inkSoft clears WCAG AA on ${surface}`, () => {
      expect(contrastRatio(lightColors.inkSoft, lightColors[surface])).toBeGreaterThanOrEqual(4.5);
    });
    // The Home Today strip (§48) renders its muhurat-windows meta line in
    // inkMuted directly on the cardActive gradient.
    test(`inkMuted clears WCAG AA on ${surface}`, () => {
      expect(contrastRatio(lightColors.inkMuted, lightColors[surface])).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe('chip text readability on COMPOSITED chip tints (design.md §3/§12)', () => {
  // The quality/muhurat chips (Muhurat glance card §31) render
  // text on an rgba tint stacked over the cardActive gradient. The effective
  // surface is the alpha composite, which sits DARKER than the raw card surface —
  // `avoid` on `avoidChipBg` over the gradient's dark stop measured ~3.5:1, which
  // is why chip text uses the deeper `avoidDeep` cut. These tests do the actual
  // compositing so the chip text colors are pinned against the surfaces they
  // really render on.
  function compositeOver(rgba: string, hexBelow: string): string {
    const m = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(rgba);
    if (!m) throw new Error(`Expected rgba(r, g, b, a), got ${rgba}`);
    const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 10));
    const a = parseFloat(m[4]);
    const below = [1, 3, 5].map((i) => parseInt(hexBelow.slice(i, i + 2), 16));
    const out = [r, g, b].map((c, i) => Math.round(a * c + (1 - a) * below[i]));
    return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
  }

  const gradientStops = ['cardActiveFrom', 'cardActiveTo'] as const;

  for (const stop of gradientStops) {
    test(`avoidDeep clears WCAG AA on avoidChipBg composited over ${stop}`, () => {
      const surface = compositeOver(lightColors.avoidChipBg, lightColors[stop]);
      expect(contrastRatio(lightColors.avoidDeep, surface)).toBeGreaterThanOrEqual(4.5);
    });
    test(`saffronDeep clears WCAG AA on goldChipBg composited over ${stop}`, () => {
      const surface = compositeOver(lightColors.goldChipBg, lightColors[stop]);
      expect(contrastRatio(lightColors.saffronDeep, surface)).toBeGreaterThanOrEqual(4.5);
    });
  }

  test('regression: raw avoid does NOT clear AA on the composited avoid chip (why avoidDeep exists)', () => {
    const surface = compositeOver(lightColors.avoidChipBg, lightColors.cardActiveTo);
    expect(contrastRatio(lightColors.avoid, surface)).toBeLessThan(4.5);
  });
});

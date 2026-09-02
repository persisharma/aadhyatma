/**
 * Doc/code sync guard for the token tables in `design.md` §2 and §4.
 *
 * RULEBOOK §0.1 makes doc updates a merge gate, and `.claude/rules/design-doc-sync.md`
 * records why: a July 2026 audit found ~35 design.md sections describing an app that no
 * longer existed, because nothing coupled the doc to the code. Prose can't be checked
 * mechanically, but the **numeric token tables** can — and those are exactly what silently
 * rots when someone tunes a value in `theme/`.
 *
 * This asserts the doc's own stated values still match the tokens. If you change a token,
 * this test tells you which doc line to update instead of letting the table go stale.
 *
 * Scope note: colour rows are matched by token name, so a token the doc doesn't list is not
 * a failure (the §2 table is a curated subset, not an exhaustive dump). A *listed* token
 * that disagrees with code, or names a token that no longer exists, is a failure.
 */
import * as fs from 'fs';
import * as path from 'path';

import { lightColors } from '../colors';
import { elevation } from '../elevation';
import { radii, spacing } from '../spacing';

const DESIGN_DOC = path.resolve(__dirname, '..', '..', '..', '..', 'design.md');
const doc = fs.readFileSync(DESIGN_DOC, 'utf8');

const kebabToCamel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

describe('design.md §2 colour table matches colors.ts', () => {
  // | `token-name` | `#HEX` | role |
  const rows = [...doc.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|\s*`(#[0-9A-Fa-f]{3,8})`\s*\|/gm)].map(
    (m) => ({ name: m[1], hex: m[2] }),
  );

  it('finds the colour table', () => {
    expect(rows.length).toBeGreaterThan(5);
  });

  it.each(rows.map((r) => [r.name, r.hex]))('%s = %s', (name, hex) => {
    const key = kebabToCamel(name as string) as keyof typeof lightColors;
    expect(lightColors[key]).toBeDefined();
    expect(String(lightColors[key]).toLowerCase()).toBe(String(hex).toLowerCase());
  });
});

describe('design.md §4 token prose matches spacing/radii/elevation', () => {
  it('states the radii scale as the code defines it', () => {
    // The doc writes the scale inline: `radii.sm` **10** · `radii.md` **14** · …
    for (const [name, value] of Object.entries(radii)) {
      if (name === 'pill') continue;
      const re = new RegExp(`\`radii\\.${name}\`\\s*\\*\\*${value}\\*\\*`);
      expect(doc).toMatch(re);
    }
  });

  it('states readingGutter and screenGutter as the code defines them', () => {
    expect(doc).toMatch(new RegExp(`\`spacing\\.screenGutter\`\\s*\\(\\*\\*${spacing.screenGutter}\\*\\*\\)`));
    expect(doc).toMatch(new RegExp(`\`spacing\\.readingGutter\`\\s*\\n?>?\\s*\\(\\*\\*${spacing.readingGutter}\\*\\*\\)`));
  });

  it('lists every elevation tier with its real offset · opacity · radius · Android values', () => {
    for (const [name, tier] of Object.entries(elevation)) {
      // | `elevation.card` | `0,2` · `0.10` · `6` · `2` | use |
      // Rows live inside a blockquote, so allow a leading '> '.
      const row = doc.match(new RegExp(`^>?\\s*\\|\\s*\`elevation\\.${name}\`\\s*\\|([^|]*)\\|`, 'm'));
      expect(row).not.toBeNull();
      const cell = row![1];
      expect(cell).toContain(`0,${tier.shadowOffset.height}`);
      // opacity is written to 2dp in the doc (0.10), toFixed keeps 0.1 -> 0.10
      expect(cell).toContain(tier.shadowOpacity.toFixed(2));
      expect(cell).toContain(`\`${tier.shadowRadius}\``);
      expect(cell).toContain(`\`${tier.elevation}\``);
    }
  });

  it('does not list an elevation tier that no longer exists', () => {
    const listed = [...doc.matchAll(/^>?\s*\|\s*`elevation\.([a-z]+)`/gm)].map((m) => m[1]);
    expect(listed.length).toBeGreaterThan(0);
    for (const name of listed) expect(Object.keys(elevation)).toContain(name);
  });
});

describe('the 10pt chrome floor the docs promise is actually held', () => {
  const SRC = path.resolve(__dirname, '..', '..');
  // NorthIndianChart is the documented exception: its sizes are viewBox units.
  const EXEMPT = ['NorthIndianChart.tsx'];

  function sourceFiles(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return e.name === '__tests__' ? [] : sourceFiles(full);
      return /\.(ts|tsx)$/.test(e.name) && !EXEMPT.includes(e.name) ? [full] : [];
    });
  }

  it('has no fontSize below 10 anywhere in src', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(SRC)) {
      const text = fs.readFileSync(file, 'utf8');
      text.split('\n').forEach((line, i) => {
        const m = line.match(/fontSize:\s*([0-9](?:\.[0-9]+)?)(?![0-9.])/);
        if (m && parseFloat(m[1]) < 10) {
          offenders.push(`${path.relative(SRC, file)}:${i + 1} → fontSize: ${m[1]}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});

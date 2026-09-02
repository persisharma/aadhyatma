/**
 * PRD-31 §13.7: the ask engine costs the launch path ZERO. Nothing under
 * `src/ask/` except the types file and the lazy hook may be reachable through
 * STATIC imports from `index.ts`. One stray `import { askQuestion } from
 * '@/ask/engine'` in a Home-stack screen would put the registries and the
 * panchang engine behind the splash that already waits on fonts and prefs —
 * silently. Same walker as `data/__tests__/launchGraph.test.ts`.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.json'];

function resolveSpec(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(ROOT, 'src', spec.slice(2));
  else if (spec.startsWith('@assets/')) base = path.join(ROOT, 'assets', spec.slice(8));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
  for (const ext of ['', ...EXTS]) {
    const c = base + ext;
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  for (const ext of EXTS) {
    const c = path.join(base, `index${ext}`);
    if (fs.existsSync(c)) return c;
  }
  return null;
}

/**
 * Static VALUE imports only. `import()` and `require()` thunks are the lazy
 * path this test rewards, and `import type` / `export type … from` are erased
 * by Babel before Metro ever sees them, so they cost the launch nothing.
 */
const STATIC_IMPORT = /(?:^|\n)\s*(?:import|export)(?!\s+type\b)[^;\n]*?from\s+['"]([^'"]+)['"]/g;

function walk(): Map<string, string | null> {
  const parents = new Map<string, string | null>();
  const queue: [string, string | null][] = [[path.join(ROOT, 'index.ts'), null]];
  while (queue.length) {
    const [file, parent] = queue.shift()!;
    if (parents.has(file)) continue;
    parents.set(file, parent);
    if (file.endsWith('.json')) continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(STATIC_IMPORT)) {
      const r = resolveSpec(m[1], file);
      if (r && !parents.has(r)) queue.push([r, file]);
    }
  }
  return parents;
}

const ALLOWED = new Set(['types.ts', 'useAsk.ts', 'actions.ts']);

test('no ask-engine module is on the static launch graph', () => {
  const graph = walk();
  const askDir = path.join(ROOT, 'src', 'ask') + path.sep;
  const offenders = [...graph.keys()].filter((f) => f.startsWith(askDir) && !ALLOWED.has(path.relative(askDir, f)));
  const chain = (f: string) => {
    const out: string[] = [];
    for (let cur: string | null | undefined = f; cur; cur = graph.get(cur) ?? null) out.unshift(path.relative(ROOT, cur));
    return out.join(' → ');
  };
  assert.deepEqual(offenders.map(chain), [], 'ask engine reached from launch path');
});

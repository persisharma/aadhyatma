/**
 * The launch import graph has a budget, and the big corpora are not in it.
 *
 * WHY THIS EXISTS. Metro bundles every STATIC import reachable from `index.ts`,
 * and Hermes evaluates all of it before the first frame — so a single
 * `import ch18 from './chapter-18.json'` in a module that something on the
 * launch path happens to touch puts megabytes of JSON on every cold start. The
 * repo already learned this three times by hand:
 *
 *   - `valmiki-ramayan/index.ts` loads its seven 2.5–6 MB kāṇḍas through
 *     `require()` thunks, with a comment saying why.
 *   - `pincodes.ts` requires its 700 KB table lazily, with a wiki gotcha saying
 *     why ("700 KB parsed at launch").
 *   - `data/gita/index.ts` did NOT, and nobody noticed: `entryRoutes.ts` wants
 *     `gitaChaptersManifest.length`, it is reached from `notifications/deepLink`
 *     at `App.tsx` module scope, and that dragged all 6.5 MB of the Gītā into
 *     every launch — plus a module-scope walk of all 701 verses.
 *
 * All three were rules living in comments, which is why the third one broke. This
 * is the same rule as a test. A corpus belongs behind `getXChapter()`; only its
 * manifest may be imported eagerly.
 *
 * WHEN IT FAILS. Do not raise the budget to make it pass. Find what pulled the
 * payload in (the failure prints the import chain) and make that module read a
 * manifest instead, or load the payload through a `require()` thunk.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.json'];

/** Metro's resolution, narrowed to what this repo actually uses. */
function resolveSpec(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(ROOT, 'src', spec.slice(2));
  else if (spec.startsWith('@assets/')) base = path.join(ROOT, 'assets', spec.slice(8));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null; // node_modules — not ours to budget
  for (const ext of ['', ...EXTS]) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  for (const ext of EXTS) {
    const candidate = path.join(base, `index${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * STATIC imports only. A `require()` inside a function body (the corpus-loader
 * pattern) and a dynamic `await import()` (the widget planner) are both
 * deliberately excluded — being lazy is exactly what this test rewards.
 */
const STATIC_IMPORT = /(?:^|\n)\s*(?:import|export)[^;\n]*?from\s+['"]([^'"]+)['"]/g;

function walkLaunchGraph(): Map<string, string | null> {
  const parents = new Map<string, string | null>();
  const queue: [string, string | null][] = [[path.join(ROOT, 'index.ts'), null]];
  while (queue.length > 0) {
    const [file, parent] = queue.shift()!;
    if (parents.has(file)) continue;
    parents.set(file, parent);
    if (file.endsWith('.json')) continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const match of src.matchAll(STATIC_IMPORT)) {
      const resolved = resolveSpec(match[1], file);
      if (resolved && !parents.has(resolved)) queue.push([resolved, file]);
    }
  }
  return parents;
}

const graph = walkLaunchGraph();

function chainTo(file: string): string {
  const chain: string[] = [];
  let cursor: string | null = file;
  while (cursor) {
    chain.push(path.relative(ROOT, cursor));
    cursor = graph.get(cursor) ?? null;
  }
  return chain.reverse().join('\n    -> ');
}

/**
 * Payloads that must never be evaluated before the first frame. Each is a whole
 * text a reader screen opens on demand; none of them is needed to paint Home.
 */
const FORBIDDEN = [
  /^src\/data\/gita\/chapter-\d+\.json$/,
  /^src\/data\/valmiki-ramayan\/chapter-\d+\.json$/,
  /^src\/panchang\/pincodeData\.json$/,
];

test('no on-demand corpus payload is statically reachable from the app entry', () => {
  const offenders = [...graph.keys()]
    .map((file) => path.relative(ROOT, file))
    .filter((rel) => FORBIDDEN.some((pattern) => pattern.test(rel)));
  assert.deepEqual(
    offenders,
    [],
    `These payloads are evaluated before the first frame. Import chain for the first:\n    ${
      offenders.length > 0 ? chainTo(path.join(ROOT, offenders[0])) : ''
    }\nFix the importer (read a manifest, or load through a require() thunk) — do not add it to an allowlist.`
  );
});

/**
 * A ceiling, not a target. It was 12.77 MB when the Gītā was eager and is
 * ~6.3 MB now; the remaining bulk is `panchang/kathaContent` (~1.3 MB) and the
 * stotram/chalisa corpora pulled in through `versePool` and `texts.ts`, which are
 * the obvious next candidates for the same treatment. Lower this number when you
 * shrink the graph; never raise it to make a red test green.
 */
const LAUNCH_GRAPH_BUDGET_BYTES = 7_000_000;

test('the static launch graph stays inside its byte budget', () => {
  const sized = [...graph.keys()].map((file) => [fs.statSync(file).size, file] as const);
  const total = sized.reduce((sum, [size]) => sum + size, 0);
  const largest = [...sized]
    .sort((a, b) => b[0] - a[0])
    .slice(0, 8)
    .map(([size, file]) => `      ${String(size).padStart(9)}  ${path.relative(ROOT, file)}`)
    .join('\n');
  assert.ok(
    total <= LAUNCH_GRAPH_BUDGET_BYTES,
    `Static launch graph is ${total.toLocaleString()} bytes across ${graph.size} modules, over the ${LAUNCH_GRAPH_BUDGET_BYTES.toLocaleString()} budget.\n    Largest members:\n${largest}`
  );
});

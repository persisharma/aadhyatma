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
 *
 * TYPE-ONLY imports are excluded too, and that is not a loophole: `import type`
 * and `export type` are erased by the compiler, so they put nothing in the
 * bundle and cost the launch nothing. Counting them overstated the graph and,
 * worse, sent people hunting for a payload that was never really there —
 * `notifications/pure.ts` "pulling in" the whole Daily Bhakti verse pool was
 * exactly that, a `import type { UniformVerse }` and nothing more.
 *
 * Only a statement whose `import`/`export` keyword is followed directly by
 * `type` is erased. An inline `import { type Foo, bar }` still imports `bar` at
 * runtime, so it is deliberately NOT matched here.
 */
const STATIC_IMPORT = /(?:^|\n)\s*(?:import|export)(?!\s+type\s)[^;\n]*?from\s+['"]([^'"]+)['"]/g;

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
/**
 * LOWERED 7,300,000 -> 6,950,000 -> 5,850,000 -> 4,280,000, in three steps.
 * Every one of them moved work off the first frame; none raised the ceiling.
 *
 * (Step 3 first landed at 4,200,000. Merging a day of other work — the Kundali
 * report and section-A katha, both genuinely launch-path — ate 62 KB of that,
 * leaving 13 KB: every next katha or Panchang PR would have failed on arrival
 * for a graph it did not grow. 4,280,000 restores the ~90 KB margin this note
 * promises. It is still 3 MB below where the budget started.)
 *
 * STEP 1 — the theerth prose. Rows split into `templeRows.ts`, the legacy
 * detail map into `details/legacy.ts`, both reached through a `require()`
 * thunk. 7,274,340 -> 6,852,097.
 *
 * STEP 2 — the screens. The navigators imported all 65 statically. They sit
 * behind `lazyScreen` / `getComponent` now, warmed breadth-first from Home by
 * `screenPrefetch`. 6,852,097 -> 5,741,711.
 *
 * STEP 3 — the scripture. Two separate mistakes, both "a tiny fact, a huge
 * payload":
 *   - `texts.ts` imported 25 corpus modules to read 46 verse counts. Those
 *     counts are generated into `verseCounts.ts` (3 KB) and pinned against the
 *     real corpora by `verseCounts.test.ts`. It also carried a dead
 *     `aartiCollection` import worth 164 KB.
 *   - eleven corpora imported every chapter payload just to expose a manifest,
 *     which is what `routine/chapters.ts` actually wanted. They follow the
 *     `gita/index.ts` shape now: manifest eager, chapters behind thunks, and
 *     the launch-time invariant IIFEs moved into
 *     `chapteredCorpusInvariants.test.ts` where loading everything is free.
 *   5,741,711 -> 4,110,438.
 *
 * Together: 7,274,340 -> ~4,110,000. Roughly 3.1 MB, 43% of what Hermes used to
 * evaluate before the first frame, and the app is byte-for-byte the same.
 *
 * ALSO FIXED HERE: the walker counted `import type`, which is erased by the
 * compiler and costs nothing. That overstated the graph and sent people hunting
 * for payloads that were never there. See STATIC_IMPORT above.
 *
 * WHAT THIS NUMBER PROTECTS NOW. With screens and scripture both lazy, the way
 * to blow this budget is to import one of them — or a data module behind one —
 * from something the launch path reaches: a context, a scheduler mounted in
 * `App.tsx`, or a navigator. The failure prints the import chain; fix the
 * importer. The remaining bulk is `precomputedObservances` (201 KB, via
 * `PitruSmaranContext`), `festivals` (165 KB, via `VratReminderScheduler`) and
 * `rajasthanTehsils` (67 KB, via `PanchangLocationContext`) — the next three
 * candidates, all the same shape as what came before.
 *
 * ~90 KB of headroom, deliberately tight: that list is the work, not slack.
 */
/**
 * ORIGINAL NOTE — RAISED 7,000,000 -> 7,300,000 (PRD-42 W2, #345). Superseded
 * three times over, but its reasoning still governs: the rule that must not be
 * weakened is "no CORPUS on the launch path", every lazy option is taken FIRST,
 * and the budget is never raised merely to make a red test green.
 */
const LAUNCH_GRAPH_BUDGET_BYTES = 4_280_000;

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

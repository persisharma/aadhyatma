/**
 * Low-end Android / slow-network numbers, reproducibly.
 *
 *   npx tsx scripts/perf-report.mts            # table
 *   npx tsx scripts/perf-report.mts --json     # machine-readable
 *   node --expose-gc --import tsx scripts/perf-report.mts   # adds heap figures
 *
 * WHAT THIS IS, AND IS NOT. Every number here is either COUNTED from the repo
 * (files, bytes, import graphs), MEASURED on the machine running the script
 * (search-index build time and heap, under Node/V8 — a desktop proxy), or
 * MODELLED from the code's own constants (download policy, Android decode
 * size). None of it is a reading from a phone. Device profiling stays a
 * separate, pending check (docs/engineering/vedansh-build-checklist.md U10.1).
 *
 * The notification figures come from the Jest harness instead, because they
 * need the real scheduler glue:
 *   PERF_REPORT=1 npx jest src/notifications/__tests__/rearmCost.jest.test.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { decodedBitmap } from '../src/utils/androidImageDecode';
import { PAINTED_ICON_DECODE } from '../src/components/paintedIconDecode';
import { CONSTRAINED_BUNDLE_EVALUATION_MS } from '../src/utils/devicePace';

const ROOT = path.resolve(import.meta.dirname, '..');
const KB = 1000;
const MB = 1000 * 1000;

// ───────────────────────── 1. artwork downloads ─────────────────────────────

/** Mirrors `utils/backgroundAssetCache.ts` before and after this change. */
const OLD_TOTAL_LIMIT_S = 8;
const NEW_CEILING_S = 120;
/** Connection setup before the first body byte on a slow link (DNS+TCP+TLS+TTFB). */
const SETUP_S = 1.5;

type Link = { name: string; bytesPerSecond: number };
const LINKS: Link[] = [
  { name: '2G EDGE (15 KB/s)', bytesPerSecond: 15 * KB },
  { name: 'weak 3G (40 KB/s)', bytesPerSecond: 40 * KB },
  { name: 'slow 4G (150 KB/s)', bytesPerSecond: 150 * KB },
];

function imageSizes(dir: string): number[] {
  const out: number[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(webp|jpg|jpeg|png|mp3)$/i.test(entry.name)) out.push(fs.statSync(p).size);
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return out.sort((a, b) => a - b);
}

/** The artwork the 8-second cache serves, by the local master folder it is published from. */
const ARTWORK_SETS = [
  { name: 'Reading backgrounds', dir: 'assets/backgrounds' },
  { name: 'Reader illustrations', dir: 'assets/reader-illustrations' },
  { name: 'Puja vidhi steps', dir: 'assets/vidhi-steps' },
  { name: 'Festival heroes', dir: 'assets/festival-hero' },
  { name: 'Daily Bhakti frames', dir: 'assets/devotional-share' },
  { name: 'Suvichar masters', dir: 'assets/suvichar' },
];

function downloads() {
  return ARTWORK_SETS.map((set) => {
    const sizes = imageSizes(path.join(ROOT, set.dir));
    const median = sizes[Math.floor(sizes.length / 2)] ?? 0;
    const largest = sizes[sizes.length - 1] ?? 0;
    const perLink = LINKS.map((link) => {
      const seconds = (bytes: number) => SETUP_S + bytes / link.bytesPerSecond;
      // Before: more than 8 s in total and the attempt is cancelled and its bytes deleted.
      const neverLoadedBefore = sizes.filter((bytes) => seconds(bytes) > OLD_TOTAL_LIMIT_S);
      // Each failed visit downloaded for the full 8 s and kept nothing.
      const wastedPerVisit = Math.round((OLD_TOTAL_LIMIT_S - SETUP_S) * link.bytesPerSecond);
      // After, iOS: no resume, so the file must fit inside one ceiling.
      const neverLoadedAfterIos = sizes.filter((bytes) => seconds(bytes) > NEW_CEILING_S);
      // After, Android: an attempt that reaches the ceiling keeps its bytes.
      const visitsForLargest = Math.max(1, Math.ceil((largest / link.bytesPerSecond) / (NEW_CEILING_S - SETUP_S)));
      return {
        link: link.name,
        neverLoadedBefore: neverLoadedBefore.length,
        wastedBytesPerFailedVisitBefore: neverLoadedBefore.length ? wastedPerVisit : 0,
        neverLoadedAfterAndroid: 0,
        neverLoadedAfterIos: neverLoadedAfterIos.length,
        secondsToLargestAfter: Math.round(seconds(largest)),
        visitsForLargestAfterAndroid: visitsForLargest,
      };
    });
    return { set: set.name, files: sizes.length, medianBytes: median, largestBytes: largest, perLink };
  });
}

// ───────────────────────── 2. painted-icon bitmaps ──────────────────────────

/** What Home mounts (screens/HomeScreen.tsx, navigation/tabBarIcons.tsx, TodayRecommendationsRow). */
const HOME_ICONS = [
  { what: 'category tiles', count: 16, dp: 62.7, master: 512 },
  { what: 'feature spotlights', count: 9, dp: 32, master: 512 },
  { what: 'tab-bar icons', count: 3, dp: 27, master: 512 },
  { what: 'today-row icons', count: 2, dp: 31, master: 512 },
];
const DENSITIES = [
  { name: 'hdpi 1.5x (480p-class)', value: 1.5 },
  { name: 'xhdpi 2x (720p HD+)', value: 2 },
  { name: '2.625x (1080p)', value: 2.625 },
  { name: 'xxhdpi 3x', value: 3 },
];

function icons() {
  return DENSITIES.map((density) => {
    let before = 0;
    let after = 0;
    for (const icon of HOME_ICONS) {
      const view = icon.dp * density.value;
      before += icon.count * decodedBitmap(icon.master, icon.master, view, view, null).bytes;
      after += icon.count * decodedBitmap(icon.master, icon.master, view, view, PAINTED_ICON_DECODE.resizeMultiplier).bytes;
    }
    return { density: density.name, beforeBytes: before, afterBytes: after, savedPercent: Math.round((1 - after / before) * 100) };
  });
}

// ───────────────────────── 3. background warm-up ────────────────────────────

const EXTS = ['.ts', '.tsx', '.js', '.jsx', '.json'];
function resolveSpec(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith('@/')) base = path.join(ROOT, 'src', spec.slice(2));
  else if (spec.startsWith('@assets/')) base = path.join(ROOT, 'assets', spec.slice(8));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
  else return null;
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
/** Same rule as `data/__tests__/launchGraph.test.ts`: static, non-type imports only. */
const STATIC_IMPORT = /(?:^|\n)\s*(?:import|export)(?!\s+type\s)[^;\n]*?from\s+['"]([^'"]+)['"]/g;
const SIDE_EFFECT_IMPORT = /(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g;

function closure(entries: string[], seen = new Set<string>()): Set<string> {
  const queue = [...entries];
  while (queue.length > 0) {
    const file = queue.shift()!;
    if (seen.has(file)) continue;
    seen.add(file);
    if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    for (const pattern of [STATIC_IMPORT, SIDE_EFFECT_IMPORT]) {
      for (const match of src.matchAll(pattern)) {
        const resolved = resolveSpec(match[1], file);
        if (resolved && !seen.has(resolved)) queue.push(resolved);
      }
    }
  }
  return seen;
}
const bytesOf = (files: Iterable<string>) => {
  let total = 0;
  for (const file of files) if (/\.(ts|tsx|js|jsx|json)$/.test(file)) total += fs.statSync(file).size;
  return total;
};

function warmup() {
  const launch = closure([path.join(ROOT, 'index.ts')]);
  const navDir = path.join(ROOT, 'src/navigation');
  const registered: { label: string; depth: number; file: string }[] = [];
  const LAZY = /(?:lazyScreen|prefetchedRoute)\(\s*['"]([^'"]+)['"],\s*(\d+),\s*\(\)\s*=>\s*(?:import|require)\(\s*['"]([^'"]+)['"]\)/g;
  for (const name of fs.readdirSync(navDir)) {
    if (!/\.tsx?$/.test(name)) continue;
    const file = path.join(navDir, name);
    for (const match of fs.readFileSync(file, 'utf8').matchAll(LAZY)) {
      const resolved = resolveSpec(match[3], file);
      if (resolved) registered.push({ label: match[1], depth: Number(match[2]), file: resolved });
    }
  }
  const beyondLaunch = (entries: string[]) => {
    const all = closure(entries, new Set(launch));
    return bytesOf([...all].filter((file) => !launch.has(file)));
  };
  const everything = registered.map((r) => r.file);
  const oneTap = registered.filter((r) => r.depth <= 2).map((r) => r.file);
  return {
    launchGraphBytes: bytesOf(launch),
    screensRegistered: registered.length,
    screensOneTapFromHome: oneTap.length,
    fullWalkBytes: beyondLaunch(everything),
    constrainedWalkBytes: beyondLaunch(oneTap),
    constrainedThresholdMs: CONSTRAINED_BUNDLE_EVALUATION_MS,
  };
}

async function searchIndex() {
  const gc = (globalThis as { gc?: () => void }).gc;
  gc?.();
  const heapBefore = process.memoryUsage().heapUsed;
  const loadStart = performance.now();
  const mod = await import('../src/data/searchIndex');
  const loaded = performance.now();
  const index = mod.getSearchIndex();
  const built = performance.now();
  gc?.();
  const heapAfter = process.memoryUsage().heapUsed;
  return {
    moduleLoadMs: Math.round(loaded - loadStart),
    buildMs: Math.round(built - loaded),
    versesIndexed: index.verses.length,
    heapRetainedBytes: gc ? heapAfter - heapBefore : null,
  };
}

// ─────────────────────────────── output ─────────────────────────────────────

const fmt = (bytes: number) => (bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.round(bytes / KB)} KB`);

async function main() {
  const report = { downloads: downloads(), icons: icons(), warmup: warmup(), searchIndex: await searchIndex() };
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('## 1. Artwork that could never finish downloading (modelled from the cache constants)\n');
  console.log('| Artwork set | Files | Median | Largest | Link | Never loaded BEFORE | Data re-spent per failed visit | Never loaded AFTER (Android / iOS) | Largest file now arrives in |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const set of report.downloads) {
    for (const link of set.perLink) {
      console.log(
        `| ${set.set} | ${set.files} | ${fmt(set.medianBytes)} | ${fmt(set.largestBytes)} | ${link.link} | ` +
          `${link.neverLoadedBefore} of ${set.files} | ${link.wastedBytesPerFailedVisitBefore ? fmt(link.wastedBytesPerFailedVisitBefore) : '—'} | ` +
          `${link.neverLoadedAfterAndroid} / ${link.neverLoadedAfterIos} | ${link.secondsToLargestAfter} s` +
          `${link.visitsForLargestAfterAndroid > 1 ? ` (${link.visitsForLargestAfterAndroid} visits on Android)` : ''} |`,
      );
    }
  }

  console.log('\n## 2. Bitmap memory for the painted icons Home mounts (modelled from RN 0.81 / Fresco 3.6)\n');
  console.log(`Home mounts ${HOME_ICONS.reduce((n, i) => n + i.count, 0)} painted icons: ${HOME_ICONS.map((i) => `${i.count} ${i.what} at ${i.dp} dp`).join(', ')}.\n`);
  console.log('| Screen density | Before | After | Saved |');
  console.log('|---|---|---|---|');
  for (const row of report.icons) console.log(`| ${row.density} | ${fmt(row.beforeBytes)} | ${fmt(row.afterBytes)} | ${row.savedPercent}% |`);

  const w = report.warmup;
  console.log('\n## 3. Background warm-up after launch (counted from the import graph)\n');
  console.log('| | Ordinary phone (unchanged) | Constrained phone |');
  console.log('|---|---|---|');
  console.log(`| Screen modules warmed up front | ${w.screensRegistered} | ${w.screensOneTapFromHome} |`);
  console.log(`| Source evaluated beyond the launch graph | ${fmt(w.fullWalkBytes)} | ${fmt(w.constrainedWalkBytes)} |`);
  console.log(`| Search index built at launch | yes | no (built when Search opens) |`);
  console.log(`\nLaunch graph itself: ${fmt(w.launchGraphBytes)}. A phone is "constrained" when that graph took ≥ ${w.constrainedThresholdMs} ms to evaluate.`);

  const s = report.searchIndex;
  console.log('\n## 4. What the search-index build costs (measured here, on Node/V8 — a desktop proxy)\n');
  console.log(`- ${s.versesIndexed.toLocaleString('en-IN')} entries indexed`);
  console.log(`- ${s.moduleLoadMs} ms to load the indexed corpora, ${s.buildMs} ms to build the index`);
  console.log(`- heap retained for the life of the process: ${s.heapRetainedBytes === null ? 'run with --expose-gc' : fmt(s.heapRetainedBytes)}`);
}

void main();

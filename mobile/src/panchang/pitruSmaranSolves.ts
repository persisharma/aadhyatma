/**
 * Persistence for the पितृ स्मरण annual solves — the answers the list and detail
 * screens exist to show, kept across app launches instead of re-derived on every
 * entry.
 *
 * WHY. A person's next observance is a tithi solve: `scanForRule` walks civil days
 * calling `computeTithiAndMonth` until the rule's tithi prevails. Measured on a
 * desktop JIT (`TZ=Asia/Kolkata`, Kartik Krishna Ekadashi, Aug 2026), the detail
 * screen's four solves cost:
 *
 *     next occurrence          117 ms   (~3 lunations ahead)
 *     the one after it         259 ms   (a further ~12 lunations)
 *     pitruPakshaWindow(year)   43 ms
 *     pakshaShraddhaDay          3 ms   (window warm)
 *     ────────────────────────────────
 *                              423 ms
 *
 * Hermes on a mid-range phone is several times slower, which is the multi-second
 * stall users see on a screen whose content they already saved. The engine memos
 * (`tithiMonthCache`, `sunriseCache`) make a repeat free, but they are per-process
 * — so every cold launch paid it again, and the two paths that reach the detail
 * screen WITHOUT the list (`PitruSmaranDayChip` on Home/Panchang, and the
 * `pitru-smaran` notification deep link) paid the whole 423 ms with nothing warm.
 *
 * An occurrence is deterministic from (rule, engine), so it is worth keeping on
 * disk. Same split and the same hazards as `panchangDayStore` ⇄ `panchangDayCache`,
 * one layer up: that cache persists the per-DAY solve, this one persists the
 * ANSWER a scan over hundreds of those days produced.
 *
 * PRIVACY. A record is keyed by TITHI ONLY (`m8-krishna-11`) — never by entry id,
 * relation or name. Two people remembered on the same tithi share one record, and
 * nothing here says whose it is or that anyone is remembered at all beyond the
 * tithi itself, which is already on this device in `@vedansh/pitru-smaran`. This
 * is why the key is not the entry id, which would be both a worse cache and a
 * disclosure. Nothing syncs.
 *
 * SCOPE. Every Pitru Smaran surface solves at the engine default (Ujjain,
 * purnimant) — the feature deliberately does not follow `PanchangLocationContext`,
 * because a family's shraddha tithi does not move when the user changes city. So
 * these keys carry NO location/system scope. If a location option is ever threaded
 * through the screens, this cache must gain a scope segment first, exactly like
 * `panchangDayCache`'s — otherwise one city's answers would be served for another.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { awaitDerivedCacheReset } from '@/utils/derivedCacheReset';
import { addDays } from './calendarGrid';
import { PANCHANG_DAY_CACHE_VERSION } from './panchangDaySerde';
import {
  nextObservanceForEntry,
  pitruPakshaWindow,
  primePitruPakshaWindow,
  type PitruPakshaWindow,
  type TithiRule,
} from './pitruSmaran';

/** What a screen may ask a rule for. */
export type SmaranRule = TithiRule | 'sarvapitri';

const KEY_ROOT = '@vedansh:pitru-solves:';
/**
 * Versioned with the panchang day cache deliberately: both hold engine-computed
 * calendar output, and an engine change that moves a day's tithi moves the
 * occurrence a scan over those days found. One bump invalidates both, so there is
 * no second version number to forget (RULEBOOK §17.6).
 */
const KEY_PREFIX = `${KEY_ROOT}v${PANCHANG_DAY_CACHE_VERSION}:`;

const occKey = (ruleKey: string): string => `${KEY_PREFIX}occ:${ruleKey}`;
const winKey = (year: number): string => `${KEY_PREFIX}win:${year}`;

/**
 * What the PREWARM solves ahead, and the most a record holds.
 *
 * The detail screen shows two dates (अगला and अगले वर्ष), so an on-demand solve
 * asks for two and no more — a third would put another year-long scan on the very
 * path this file exists to shorten. The third is margin bought on the list's idle
 * time instead: without it, the morning after someone's tithi passes, the screen
 * wants the 2nd and 3rd dates while disk holds the 1st and 2nd, and re-solves a
 * year on the one launch of the year when the page matters most.
 */
export const KEPT_OCCURRENCES = 3;

/** Years of window records kept. Only the current and next year are ever read. */
const RETAINED_PAST_YEARS = 1;

/**
 * `YYYY-MM-DD` for a local civil day. Occurrences are stored as date keys, not
 * epoch ms: a device that changes timezone would revive a stored instant as the
 * wrong civil day, and "which day is the shraddha" is exactly the question.
 * Deliberately a local copy of `panchangDayStore.dateKeyFor` — importing it would
 * drag the whole panchang scan graph in for two lines of formatting.
 */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fromDateKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * The disk/memory key for a rule — tithi only, see PRIVACY above. `sarvapitri`
 * entries all share one record, which is correct: they resolve to the same
 * सर्वपितृ अमावस्या.
 */
export function smaranRuleKey(rule: SmaranRule): string {
  if (rule === 'sarvapitri') return 'sarvapitri';
  return `m${rule.lunarMonth}-${rule.paksha}-${rule.tithi}`;
}

/** Future occurrence date-keys per rule, ascending. In-memory mirror of disk. */
const occurrences = new Map<string, string[]>();
/** Rule keys and years whose in-memory value is ahead of disk. */
const dirtyRules = new Set<string>();
const dirtyYears = new Set<number>();
/** Years whose window is known here (memory or disk), so persist can skip them. */
const windows = new Map<number, PitruPakshaWindow>();
/**
 * Storage keys this process has already asked disk for, HIT OR MISS. Without the
 * misses, a device that has never solved anything — every first-ever entry to the
 * feature — repeats the whole `multiGet` on each screen, which is the same "disk
 * round trip in front of a screen that could already paint" this file removes.
 *
 * Safe as a negative cache: a key absent from disk can only become present via
 * this same process, and that path puts the record in memory too.
 */
const fetched = new Set<string>();

// ---------------------------------------------------------------------------
// Reads — synchronous, memory only. A screen calls these first so a warm cache
// paints on the FIRST render rather than after an effect + a state round trip.
// ---------------------------------------------------------------------------

/**
 * The occurrences already known for `rule` on/after `today`, or null when fewer
 * than `count` are known. Null means "solve"; it never means "no occurrence".
 */
export function knownOccurrences(rule: SmaranRule, today: Date, count: number): Date[] | null {
  const future = futureOccurrences(smaranRuleKey(rule), today);
  return future.length >= count ? future.slice(0, count) : null;
}

/** This year's (or next year's) Pitru Paksha window, if already known. */
export function knownPakshaWindow(year: number): PitruPakshaWindow | null {
  return windows.get(year) ?? null;
}

function futureOccurrences(ruleKey: string, today: Date): Date[] {
  const stored = occurrences.get(ruleKey);
  if (!stored) return [];
  const cutoff = dateKey(startOfLocalDay(today));
  // Lexical compare is chronological for YYYY-MM-DD. `>=` keeps the day itself:
  // a shraddha is "आज" until midnight, not until the previous evening.
  return stored
    .filter((k) => k >= cutoff)
    .map(fromDateKey)
    .filter((d): d is Date => d !== null);
}

// ---------------------------------------------------------------------------
// Solves — CPU. Callers run these off the render path.
// ---------------------------------------------------------------------------

/**
 * `count` occurrences on/after `today`, solving and recording only the ones not
 * already known. Returns fewer only when the engine cannot place the rule at all.
 */
export function ensureOccurrences(rule: SmaranRule, today: Date, count: number): Date[] {
  const ruleKey = smaranRuleKey(rule);
  const known = futureOccurrences(ruleKey, today);
  if (known.length >= count) return known.slice(0, count);

  const solved = [...known];
  // Continue from the last known occurrence rather than from today — the whole
  // point of the record is not to re-walk the months already walked.
  let cursor = solved.length > 0 ? addDays(solved[solved.length - 1], 1) : startOfLocalDay(today);
  while (solved.length < count) {
    let found: Date | null = null;
    try {
      found = nextObservanceForEntry({ tithiRule: rule }, cursor);
    } catch {
      found = null; // a failed solve must never break a screen — see the callers
    }
    if (!found) break;
    solved.push(found);
    cursor = addDays(found, 1);
  }

  if (solved.length > known.length) {
    occurrences.set(ruleKey, solved.slice(0, KEPT_OCCURRENCES).map(dateKey));
    dirtyRules.add(ruleKey);
  }
  return solved.slice(0, count);
}

/**
 * The Pitru Paksha window for `year`, solved if needed and recorded for persist.
 * The engine keeps its own per-process memo; this adds the across-launch half.
 */
export function ensurePakshaWindow(year: number): PitruPakshaWindow | null {
  const cached = windows.get(year);
  if (cached) return cached;
  let window: PitruPakshaWindow | null = null;
  try {
    window = pitruPakshaWindow(year);
  } catch {
    window = null;
  }
  if (!window) return null;
  windows.set(year, window);
  dirtyYears.add(year);
  return window;
}

// ---------------------------------------------------------------------------
// Disk
// ---------------------------------------------------------------------------

function parseOccurrences(raw: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const keys = parsed.filter((k): k is string => typeof k === 'string' && fromDateKey(k) !== null);
    return keys.length > 0 ? keys : null;
  } catch {
    return null;
  }
}

function parseWindow(raw: string): PitruPakshaWindow | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 3) return null;
    const [purnima, start, end] = parsed.map((k) => (typeof k === 'string' ? fromDateKey(k) : null));
    if (!purnima || !start || !end) return null;
    return { purnima, start, end };
  } catch {
    return null;
  }
}

/**
 * Load the records for `rules` (and the two window years a screen can ask for)
 * into memory in ONE `multiGet`, so the screens that follow find their answers
 * already solved. Never throws; a miss just means the caller solves.
 */
export async function hydrateSmaranSolves(rules: SmaranRule[], today: Date): Promise<void> {
  const year = today.getFullYear();
  const years = [year, year + 1].filter((y) => !windows.has(y) && !fetched.has(winKey(y)));
  const ruleKeys = [...new Set(rules.map(smaranRuleKey))].filter(
    (k) => !occurrences.has(k) && !fetched.has(occKey(k))
  );
  // Fully warm already — a disk round trip could not teach this session anything,
  // and putting one in front of a re-entry is the whole bug this file exists for.
  if (ruleKeys.length === 0 && years.length === 0) return;

  // A build change (store update or OTA) drops these records wholesale; hydrating
  // ahead of that sweep would pull back the very answers it is about to delete and
  // serve them for the rest of the session. A correctness gate, so it stays ahead
  // of the read — the same order `panchangDayCache` uses.
  await awaitDerivedCacheReset();

  try {
    const keys = [...ruleKeys.map(occKey), ...years.map(winKey)];
    const pairs = await AsyncStorage.multiGet(keys);
    // Asked for, so never asked again — including the ones that came back empty.
    keys.forEach((k) => fetched.add(k));
    pairs.forEach(([key, raw]) => {
      if (!raw) return;
      if (key.startsWith(`${KEY_PREFIX}occ:`)) {
        const ruleKey = key.slice(`${KEY_PREFIX}occ:`.length);
        if (occurrences.has(ruleKey)) return;
        const parsed = parseOccurrences(raw);
        if (parsed) occurrences.set(ruleKey, parsed);
        return;
      }
      const y = Number(key.slice(`${KEY_PREFIX}win:`.length));
      if (!Number.isInteger(y) || windows.has(y)) return;
      const parsed = parseWindow(raw);
      if (!parsed) return;
      windows.set(y, parsed);
      // Seed the engine's own memo too, or `pakshaShraddhaDay` — which reaches it
      // directly — would re-solve the window this read just avoided.
      primePitruPakshaWindow(y, parsed);
    });
  } catch {
    // best-effort — a miss costs a solve, never a wrong answer
  }

  void purgeUnusable();
}

/**
 * Flush records solved this session. Fire-and-forget from the screens: never
 * throws, and no paint waits on it.
 */
export async function persistSmaranSolves(): Promise<void> {
  if (dirtyRules.size === 0 && dirtyYears.size === 0) return;
  // Same gate as hydrate, opposite hazard: writing ahead of the sweep would leave
  // the dirty sets cleared for records the sweep then removed, so nothing would
  // rewrite them and every later launch would re-solve.
  await awaitDerivedCacheReset();

  const pending: [string, string][] = [];
  const rules = [...dirtyRules];
  const years = [...dirtyYears];
  rules.forEach((ruleKey) => {
    const stored = occurrences.get(ruleKey);
    if (stored) pending.push([occKey(ruleKey), JSON.stringify(stored)]);
  });
  years.forEach((y) => {
    const w = windows.get(y);
    if (w) pending.push([winKey(y), JSON.stringify([dateKey(w.purnima), dateKey(w.start), dateKey(w.end)])]);
  });
  if (pending.length === 0) return;

  try {
    await AsyncStorage.multiSet(pending);
    // Only clear what this pass actually wrote — a solve that landed while the
    // write was in flight must stay dirty for the next flush.
    rules.forEach((k) => dirtyRules.delete(k));
    years.forEach((y) => dirtyYears.delete(y));
  } catch {
    // best-effort — memory still serves this session, and the next flush retries
  }
}

let swept = false;
let sweep: Promise<void> | null = null;

/**
 * Drop records an older cache version wrote, and windows for years nothing reads
 * again. NEVER awaited by a read: a stale-version key lives under a different
 * prefix and can never be returned by a current-prefix `multiGet`, so this is
 * pure housekeeping and runs after the caller has its answers.
 *
 * Occurrence records are NOT purged by age — they self-trim, because a record is
 * rewritten with the future-only list whenever a solve extends it, and a wholly
 * past record simply re-solves on next read. There are at most a handful of them
 * (one per distinct tithi the user saved).
 */
function purgeUnusable(): Promise<void> {
  if (swept) return sweep ?? Promise.resolve();
  swept = true;
  sweep = (async () => {
    try {
      const oldestYear = new Date().getFullYear() - RETAINED_PAST_YEARS;
      const doomed = (await AsyncStorage.getAllKeys()).filter((key) => {
        if (!key.startsWith(KEY_ROOT)) return false;
        if (!key.startsWith(KEY_PREFIX)) return true; // stale cache version
        if (!key.startsWith(`${KEY_PREFIX}win:`)) return false;
        const y = Number(key.slice(`${KEY_PREFIX}win:`.length));
        return Number.isInteger(y) && y < oldestYear;
      });
      if (doomed.length > 0) await AsyncStorage.multiRemove(doomed);
    } catch {
      // best-effort
    }
  })();
  return sweep;
}

/** Test-only: resolve once this session's housekeeping sweep has finished. */
export function smaranSolvesSwept(): Promise<void> {
  return sweep ?? Promise.resolve();
}

/** Test-only: forget everything this process knows (memory + dirty + sweep). */
export function __resetSmaranSolvesForTests(): void {
  occurrences.clear();
  windows.clear();
  dirtyRules.clear();
  dirtyYears.clear();
  fetched.clear();
  swept = false;
  sweep = null;
}

/**
 * The one path every पितृ स्मरण screen takes to an annual answer.
 *
 * Three rules, learned the expensive way on the panchang surfaces (see
 * `wiki/subsystems/panchang.md` → "A cache HIT is only fast if…"):
 *
 *  1. **Seed from memory synchronously.** A warm answer must paint on the FIRST
 *     render. Going through an effect and a `setState` costs a frame the cache
 *     was supposed to buy back.
 *  2. **Hydrate immediately; defer only the SOLVE.** Disk I/O is not JS work and
 *     must not queue behind `InteractionManager` — that is what left the panchang
 *     strip on its `—` headline. The interaction gate is for astronomy alone.
 *  3. **Publish in the order the user reads.** The detail screen's `अगला` pill is
 *     the answer people open the screen for; next year's date and the Pitru Paksha
 *     mapping are reference. Batching all three into one `setState` made the pill
 *     wait on a ~259 ms solve of a date further down the page.
 */
import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

import {
  ensureOccurrences,
  ensurePakshaWindow,
  hydrateSmaranSolves,
  knownOccurrences,
  knownPakshaWindow,
  persistSmaranSolves,
  smaranRuleKey,
  KEPT_OCCURRENCES,
  type SmaranRule,
} from './pitruSmaranSolves';
import { pakshaShraddhaDay, type PitruPakshaWindow, type SmaranEntry } from './pitruSmaran';
import { startOfLocalDay } from './pitruSmaranDisplay';

/**
 * The Gregorian year whose Pitru Paksha a surface should show: this one until its
 * सर्वपितृ अमावस्या has passed, then next year's. Shared so the list banner, the
 * detail card and the prewarm cannot disagree about which fortnight is "the" one.
 */
function pakshaYearFor(today: Date): { year: number; window: PitruPakshaWindow | null } {
  const year = today.getFullYear();
  const thisYear = ensurePakshaWindow(year);
  if (thisYear && thisYear.end.getTime() < today.getTime()) {
    return { year: year + 1, window: ensurePakshaWindow(year + 1) };
  }
  return { year, window: thisYear };
}

/** Same decision, memory-only — for the synchronous first-render seed. */
function knownPakshaYearFor(today: Date): { year: number; window: PitruPakshaWindow | null } {
  const year = today.getFullYear();
  const thisYear = knownPakshaWindow(year);
  if (thisYear && thisYear.end.getTime() < today.getTime()) {
    return { year: year + 1, window: knownPakshaWindow(year + 1) };
  }
  return { year, window: thisYear };
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export type SmaranListSolve = {
  /** Next occurrence per entry id. Null when the engine cannot place the rule. */
  nextByEntryId: Map<string, Date | null>;
  /** The banner's fortnight, or null until solved. */
  window: PitruPakshaWindow | null;
};

/**
 * Next-occurrence dates for the list, warm-first. After the rows are published it
 * PREWARMS what only the detail screen needs — the following occurrence and each
 * person's day inside the fortnight — so opening a row is a memory read rather
 * than the ~300 ms of scanning that used to happen after the push animation.
 */
export function useSmaranListSolve(entries: SmaranEntry[], todayMs: number): SmaranListSolve | null {
  const [solve, setSolve] = useState<SmaranListSolve | null>(() => readListFromMemory(entries, todayMs));

  // Entry ids + rules are what the answers depend on; a rename must not re-solve.
  const signature = entries.map((e) => `${e.id}:${smaranRuleKey(e.tithiRule)}`).join('|');

  useEffect(() => {
    let cancelled = false;
    let handle: ReturnType<typeof setTimeout> | undefined;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;

    // Rule 2: the read starts now, not after the interactions.
    void hydrateSmaranSolves(entries.map((e) => e.tithiRule), new Date(todayMs)).then(() => {
      if (cancelled) return;
      const warm = readListFromMemory(entries, todayMs);
      if (warm) setSolve(warm);

      interaction = InteractionManager.runAfterInteractions(() => {
        handle = setTimeout(() => {
          if (cancelled) return;
          const today = new Date(todayMs);
          const nextByEntryId = new Map<string, Date | null>();
          entries.forEach((entry) => {
            nextByEntryId.set(entry.id, ensureOccurrences(entry.tithiRule, today, 1)[0] ?? null);
          });
          const { window } = pakshaYearFor(today);
          if (!cancelled) setSolve({ nextByEntryId, window });

          // Prewarm, deliberately after the rows are published and deliberately
          // not fed to React state: this is work for the NEXT screen.
          prewarmDetail(entries, today);
          void persistSmaranSolves();
        }, 0);
      });
    });

    return () => {
      cancelled = true;
      interaction?.cancel();
      if (handle !== undefined) clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, todayMs]);

  return solve;
}

function readListFromMemory(entries: SmaranEntry[], todayMs: number): SmaranListSolve | null {
  const today = new Date(todayMs);
  // The seasonal banner renders above the rows and shows even on an EMPTY list,
  // so the window is part of being warm, not an extra the rows can go without.
  const window = knownPakshaYearFor(today).window;
  if (!window) return null;
  const nextByEntryId = new Map<string, Date | null>();
  for (const entry of entries) {
    const known = knownOccurrences(entry.tithiRule, today, 1);
    if (!known) return null; // partial is not warm — one miss and the list solves
    nextByEntryId.set(entry.id, known[0]);
  }
  return { nextByEntryId, window };
}

/**
 * Solve what the detail screen will want, for every person in the list. Runs on
 * the list's idle time so the push into a detail row finds it done. Pure
 * background work: it touches no state and its result is read back out of the
 * shared cache.
 */
function prewarmDetail(entries: SmaranEntry[], today: Date): void {
  const { year } = pakshaYearFor(today);
  const seen = new Set<string>();
  entries.forEach((entry) => {
    const key = smaranRuleKey(entry.tithiRule);
    if (seen.has(key)) return; // two people on one tithi share one answer
    seen.add(key);
    try {
      // One past what the detail screen shows — the rollover margin, bought here
      // on idle time rather than on that screen's critical path.
      ensureOccurrences(entry.tithiRule, today, KEPT_OCCURRENCES);
      pakshaShraddhaDay(entry.tithiRule, year);
    } catch {
      // a rule the engine cannot place is a cache miss, never a crash
    }
  });
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export type SmaranDetailSolve = {
  /** The hero pill's date. Published BEFORE the two cards below are solved. */
  next: Date | null;
  /** True once `next` is settled — `next: null` then means "cannot be placed". */
  nextReady: boolean;
  /** अगले वर्ष. */
  following: Date | null;
  /** The fortnight the पितृ पक्ष card names. */
  pakshaYear: number;
  pakshaDay: Date | null;
  /** True once `following`/`pakshaDay` are settled. */
  restReady: boolean;
};

const EMPTY_DETAIL = (today: Date): SmaranDetailSolve => ({
  next: null,
  nextReady: false,
  following: null,
  pakshaYear: today.getFullYear(),
  pakshaDay: null,
  restReady: false,
});

/**
 * The detail screen's four answers, published in two stages (rule 3). A fully
 * warm cache — the common path, because the list prewarms it — returns everything
 * `restReady` on the first render, with no effect and no flash of a missing pill.
 */
export function useSmaranDetailSolve(rule: SmaranRule | undefined, todayMs: number): SmaranDetailSolve {
  const [solve, setSolve] = useState<SmaranDetailSolve>(() =>
    rule ? readDetailFromMemory(rule, todayMs) : EMPTY_DETAIL(new Date(todayMs))
  );

  const ruleKey = rule ? smaranRuleKey(rule) : null;

  useEffect(() => {
    if (!rule) return undefined;
    let cancelled = false;
    let handle: ReturnType<typeof setTimeout> | undefined;
    let restHandle: ReturnType<typeof setTimeout> | undefined;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;

    void hydrateSmaranSolves([rule], new Date(todayMs)).then(() => {
      if (cancelled) return;
      const warm = readDetailFromMemory(rule, todayMs);
      setSolve(warm);
      if (warm.restReady) return; // disk had everything — nothing left to solve

      interaction = InteractionManager.runAfterInteractions(() => {
        handle = setTimeout(() => {
          if (cancelled) return;
          const today = new Date(todayMs);
          const next = ensureOccurrences(rule, today, 1)[0] ?? null;
          // Stage one: the pill. Everything below it is still unsolved, and that
          // is the point — it used to wait on them.
          setSolve((prev) => ({ ...prev, next, nextReady: true }));

          restHandle = setTimeout(() => {
            if (cancelled) return;
            const following = ensureOccurrences(rule, today, 2)[1] ?? null;
            const { year } = pakshaYearFor(today);
            let pakshaDay: Date | null = null;
            try {
              pakshaDay = pakshaShraddhaDay(rule, year);
            } catch {
              pakshaDay = null; // the rows render only when solved
            }
            setSolve((prev) => ({ ...prev, following, pakshaYear: year, pakshaDay, restReady: true }));
            void persistSmaranSolves();
          }, 0);
        }, 0);
      });
    });

    return () => {
      cancelled = true;
      interaction?.cancel();
      if (handle !== undefined) clearTimeout(handle);
      if (restHandle !== undefined) clearTimeout(restHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleKey, todayMs]);

  return solve;
}

function readDetailFromMemory(rule: SmaranRule, todayMs: number): SmaranDetailSolve {
  const today = new Date(todayMs);
  const both = knownOccurrences(rule, today, 2);
  const one = both ?? knownOccurrences(rule, today, 1);
  const { year, window } = knownPakshaYearFor(today);
  // With the window warm, `pakshaShraddhaDay` is a ~3 ms scan inside the
  // fortnight — cheap enough to run on the seed path, unlike the year-long scans.
  let pakshaDay: Date | null = null;
  if (window) {
    try {
      pakshaDay = pakshaShraddhaDay(rule, year);
    } catch {
      pakshaDay = null;
    }
  }
  return {
    next: one?.[0] ?? null,
    nextReady: one !== null,
    following: both?.[1] ?? null,
    pakshaYear: year,
    pakshaDay,
    restReady: both !== null && pakshaDay !== null,
  };
}

/** Today at local midnight — the anchor every Pitru surface shares. */
export function smaranToday(): Date {
  return startOfLocalDay(new Date());
}

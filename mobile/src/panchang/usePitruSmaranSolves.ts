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
  ensureOccurrencesAsync,
  ensurePakshaWindowAsync,
  hydrateSmaranSolves,
  knownOccurrences,
  knownPakshaWindow,
  persistSmaranSolves,
  smaranRuleKey,
  KEPT_OCCURRENCES,
  type SmaranRule,
} from './pitruSmaranSolves';
import {
  isPitruPakshaDayTableWarm,
  pakshaShraddhaDay,
  pakshaShraddhaDayAsync,
  type PitruPakshaWindow,
  type SmaranEntry,
} from './pitruSmaran';
import { startOfLocalDay } from './pitruSmaranDisplay';

/**
 * The Gregorian year whose Pitru Paksha a surface should show: this one until its
 * सर्वपितृ अमावस्या has passed, then next year's. Shared so the list banner, the
 * detail card and the prewarm cannot disagree about which fortnight is "the" one.
 */
async function pakshaYearFor(
  today: Date,
  isCancelled: () => boolean
): Promise<{ year: number; window: PitruPakshaWindow | null }> {
  const year = today.getFullYear();
  const thisYear = await ensurePakshaWindowAsync(year, isCancelled);
  if (thisYear && thisYear.end.getTime() < today.getTime()) {
    return { year: year + 1, window: await ensurePakshaWindowAsync(year + 1, isCancelled) };
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
    const isCancelled = () => cancelled;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;

    // Rule 2: the read starts now, not after the interactions.
    void hydrateSmaranSolves(entries.map((e) => e.tithiRule), new Date(todayMs)).then(() => {
      if (cancelled) return;
      const warm = readListFromMemory(entries, todayMs);
      if (warm) setSolve(warm);

      // Every solve below is cooperative (`runInBackground`, 4 ms slices): a
      // cold list used to run all of it — each person's annual scan, the
      // fortnight and the detail prewarm — as ONE task, seconds long on a
      // phone, during which no tap could land. A warm list skips straight to
      // the prewarm, which is itself a memory read once the detail is warm.
      interaction = InteractionManager.runAfterInteractions(() => {
        void (async () => {
          const today = new Date(todayMs);
          if (!warm) {
            const nextByEntryId = new Map<string, Date | null>();
            for (const entry of entries) {
              const [next] = await ensureOccurrencesAsync(entry.tithiRule, today, 1, isCancelled);
              if (cancelled) return;
              nextByEntryId.set(entry.id, next ?? null);
            }
            const { window } = await pakshaYearFor(today, isCancelled);
            if (cancelled) return;
            setSolve({ nextByEntryId, window });
            void persistSmaranSolves();
          }

          // Prewarm, deliberately after the rows are published and deliberately
          // not fed to React state: this is work for the NEXT screen.
          await prewarmDetail(entries, today, isCancelled);
          if (!cancelled) void persistSmaranSolves();
        })();
      });
    });

    return () => {
      cancelled = true;
      interaction?.cancel();
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
async function prewarmDetail(
  entries: SmaranEntry[],
  today: Date,
  isCancelled: () => boolean
): Promise<void> {
  const { year } = await pakshaYearFor(today, isCancelled);
  const seen = new Set<string>();
  for (const entry of entries) {
    if (isCancelled()) return;
    const key = smaranRuleKey(entry.tithiRule);
    if (seen.has(key)) continue; // two people on one tithi share one answer
    seen.add(key);
    try {
      // One past what the detail screen shows — the rollover margin, bought here
      // on idle time rather than on that screen's critical path.
      await ensureOccurrencesAsync(entry.tithiRule, today, KEPT_OCCURRENCES, isCancelled);
      await pakshaShraddhaDayAsync(entry.tithiRule, year, isCancelled);
    } catch {
      // a rule the engine cannot place is a cache miss, never a crash
    }
  }
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
    const isCancelled = () => cancelled;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;

    void hydrateSmaranSolves([rule], new Date(todayMs)).then(() => {
      if (cancelled) return;
      const warm = readDetailFromMemory(rule, todayMs);
      setSolve(warm);
      if (warm.restReady) return; // disk had everything — nothing left to solve

      // Cooperative solves (see the list above): a notification or deep link
      // can open this screen cold, and each stage used to be one long task.
      interaction = InteractionManager.runAfterInteractions(() => {
        void (async () => {
          const today = new Date(todayMs);
          const [next] = await ensureOccurrencesAsync(rule, today, 1, isCancelled);
          if (cancelled) return;
          // Stage one: the pill. Everything below it is still unsolved, and that
          // is the point — it used to wait on them.
          setSolve((prev) => ({ ...prev, next: next ?? null, nextReady: true }));

          const [, following] = await ensureOccurrencesAsync(rule, today, 2, isCancelled);
          if (cancelled) return;
          const { year } = await pakshaYearFor(today, isCancelled);
          if (cancelled) return;
          let pakshaDay: Date | null = null;
          try {
            pakshaDay = (await pakshaShraddhaDayAsync(rule, year, isCancelled)) ?? null;
          } catch {
            pakshaDay = null; // the rows render only when solved
          }
          if (cancelled) return;
          setSolve((prev) => ({ ...prev, following: following ?? null, pakshaYear: year, pakshaDay, restReady: true }));
          void persistSmaranSolves();
        })();
      });
    });

    return () => {
      cancelled = true;
      interaction?.cancel();
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
  // With the window AND its day table warm, `pakshaShraddhaDay` is a lookup —
  // cheap enough for the seed path. A window primed from disk leaves the table
  // to solve (~80 ms cold on V8), which belongs to the cooperative path, not to
  // a render: `isPitruPakshaDayTableWarm` is the render-time gate.
  let pakshaDay: Date | null = null;
  if (window && isPitruPakshaDayTableWarm(year)) {
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

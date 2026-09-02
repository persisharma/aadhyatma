/**
 * जन्म तिथि hooks (PRD-29 Part A) — the living side of the tithi engine.
 *
 * Every date answer takes the SAME three-rule path Pitru Smaran learned the
 * expensive way (`usePitruSmaranSolves`): seed synchronously from memory,
 * hydrate disk immediately (I/O is not JS work), and defer only the SOLVE
 * behind `InteractionManager`. Janma rules ride the shared `pitruSmaranSolves`
 * layer — tithi-keyed and person-free, so a janma tithi and a shraddha tithi
 * on the same rule share one persisted answer.
 */
import { useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';

import { useBirthProfileRoster } from './useKundali';
import { janmaTithiRuleFromBirthDate } from './janmaTithi';
import { tithiRuleMatchesDate, type TithiRule } from './pitruSmaran';
import {
  ensureOccurrences,
  hydrateSmaranSolves,
  knownOccurrences,
  persistSmaranSolves,
  smaranRuleKey,
} from './pitruSmaranSolves';
import {
  getJanmaPrefsSnapshot,
  loadJanmaPrefs,
  subscribeJanmaPrefs,
  type JanmaPrefsState,
} from './janmaTithiPrefs';
import type { PersonProfile } from './birthProfiles';

export type JanmaTithiPerson = {
  person: PersonProfile;
  /** Null when the stored birth date cannot be placed — the row says so. */
  rule: TithiRule | null;
};

export type JanmaTithiListEntry = JanmaTithiPerson & {
  /** This year's occurrence (or next year's once passed). Null while solving. */
  next: Date | null;
};

/** Roster people paired with their derived janma rules — pure, memoised. */
export function useJanmaTithiPeople(): { people: JanmaTithiPerson[]; hydrated: boolean } {
  const { roster, hydrated } = useBirthProfileRoster();
  const people = useMemo(
    () =>
      roster.people.map((person) => ({
        person,
        rule: janmaTithiRuleFromBirthDate(person.date),
      })),
    [roster.people]
  );
  return { people, hydrated };
}

/** Subscribe to the per-person reminder opt-ins. */
export function useJanmaPrefs(): JanmaPrefsState {
  const [state, setState] = useState<JanmaPrefsState>(() => getJanmaPrefsSnapshot());
  useEffect(() => {
    const unsubscribe = subscribeJanmaPrefs(setState);
    void loadJanmaPrefs().then(setState);
    return unsubscribe;
  }, []);
  return state;
}

function readNextFromMemory(people: JanmaTithiPerson[], today: Date): Map<string, Date | null> | null {
  const nextById = new Map<string, Date | null>();
  for (const { person, rule } of people) {
    if (!rule) {
      nextById.set(person.id, null);
      continue;
    }
    const known = knownOccurrences(rule, today, 1);
    if (!known) return null; // partial is not warm — one miss and the list solves
    nextById.set(person.id, known[0]);
  }
  return nextById;
}

/**
 * Next janma-tithi occurrence per roster person, warm-first. The list screen's
 * one data source; the detail screen re-reads the same cache and is warm by
 * construction after this ran once.
 */
export function useJanmaTithiList(todayMs: number): JanmaTithiListEntry[] | null {
  const { people, hydrated } = useJanmaTithiPeople();
  const [nextById, setNextById] = useState<Map<string, Date | null> | null>(
    () => readNextFromMemory(people, new Date(todayMs))
  );

  const signature = people
    .map(({ person, rule }) => `${person.id}:${rule ? smaranRuleKey(rule) : 'none'}`)
    .join('|');

  useEffect(() => {
    if (!hydrated) return undefined;
    let cancelled = false;
    let handle: ReturnType<typeof setTimeout> | undefined;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;

    const today = new Date(todayMs);
    const rules = people
      .map(({ rule }) => rule)
      .filter((rule): rule is TithiRule => rule !== null);

    void hydrateSmaranSolves(rules, today).then(() => {
      if (cancelled) return;
      const warm = readNextFromMemory(people, today);
      if (warm) {
        setNextById(warm);
        return;
      }
      interaction = InteractionManager.runAfterInteractions(() => {
        handle = setTimeout(() => {
          if (cancelled) return;
          const solved = new Map<string, Date | null>();
          people.forEach(({ person, rule }) => {
            solved.set(person.id, rule ? ensureOccurrences(rule, today, 1)[0] ?? null : null);
          });
          if (!cancelled) setNextById(solved);
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
  }, [signature, hydrated, todayMs]);

  return useMemo(() => {
    if (!hydrated) return null;
    if (people.length === 0) return [];
    if (!nextById) return null;
    return people.map((entry) => ({ ...entry, next: nextById.get(entry.person.id) ?? null }));
  }, [people, hydrated, nextById]);
}

export type JanmaDetailSolve = {
  /** This year's date — the hero pill. Published before the year after it. */
  next: Date | null;
  /** True once `next` is settled — `next: null` then means "cannot be placed". */
  nextReady: boolean;
  /** अगले वर्ष. */
  following: Date | null;
  restReady: boolean;
};

const EMPTY_DETAIL: JanmaDetailSolve = { next: null, nextReady: false, following: null, restReady: false };

function readJanmaDetailFromMemory(rule: TithiRule, todayMs: number): JanmaDetailSolve {
  const today = new Date(todayMs);
  const both = knownOccurrences(rule, today, 2);
  const one = both ?? knownOccurrences(rule, today, 1);
  return {
    next: one?.[0] ?? null,
    nextReady: one !== null,
    following: both?.[1] ?? null,
    restReady: both !== null,
  };
}

/**
 * The detail screen's two dates, warm-first and published in reading order —
 * `useSmaranDetailSolve` minus the Pitru-Paksha mapping, which is the dead's
 * and must never be solved (or shown) for a living person.
 */
export function useJanmaTithiDetailSolve(rule: TithiRule | null, todayMs: number): JanmaDetailSolve {
  const [solve, setSolve] = useState<JanmaDetailSolve>(() =>
    rule ? readJanmaDetailFromMemory(rule, todayMs) : EMPTY_DETAIL
  );

  const ruleKey = rule ? smaranRuleKey(rule) : null;

  useEffect(() => {
    if (!rule) {
      setSolve(EMPTY_DETAIL);
      return undefined;
    }
    let cancelled = false;
    let handle: ReturnType<typeof setTimeout> | undefined;
    let restHandle: ReturnType<typeof setTimeout> | undefined;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;

    void hydrateSmaranSolves([rule], new Date(todayMs)).then(() => {
      if (cancelled) return;
      const warm = readJanmaDetailFromMemory(rule, todayMs);
      setSolve(warm);
      if (warm.restReady) return;

      interaction = InteractionManager.runAfterInteractions(() => {
        handle = setTimeout(() => {
          if (cancelled) return;
          const today = new Date(todayMs);
          const next = ensureOccurrences(rule, today, 1)[0] ?? null;
          setSolve((prev) => ({ ...prev, next, nextReady: true }));
          restHandle = setTimeout(() => {
            if (cancelled) return;
            const following = ensureOccurrences(rule, today, 2)[1] ?? null;
            setSolve((prev) => ({ ...prev, following, restReady: true }));
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

/**
 * The roster people whose जन्म तिथि falls on `date` — drives the Home Today
 * chip. Matching needs a couple of memoised tithi reads, so it runs off the
 * render path (the `usePitruSmaranForDate` deferral); empty until resolved and
 * always empty with an empty roster — zero cost for the common case.
 */
export function useJanmaTithiForDate(date: Date): JanmaTithiPerson[] {
  const { people } = useJanmaTithiPeople();
  const dateMs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const [matches, setMatches] = useState<JanmaTithiPerson[]>([]);

  const signature = people
    .map(({ person, rule }) => `${person.id}:${rule ? smaranRuleKey(rule) : 'none'}`)
    .join('|');

  useEffect(() => {
    if (people.length === 0) {
      setMatches([]);
      return undefined;
    }
    let cancelled = false;
    setMatches([]);
    let handle: ReturnType<typeof setTimeout> | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      handle = setTimeout(() => {
        const day = new Date(dateMs);
        const result = people.filter(({ rule }) => {
          if (!rule) return false;
          try {
            return tithiRuleMatchesDate(rule, day);
          } catch {
            return false; // a failed solve must never break the strip
          }
        });
        if (!cancelled) setMatches(result);
      }, 0);
    });
    return () => {
      cancelled = true;
      interaction.cancel();
      if (handle !== undefined) clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, dateMs]);

  return matches;
}

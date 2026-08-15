/**
 * The persistence layer under the पितृ स्मरण annual answers — what turns a
 * per-process memo into one that survives a launch, so the screen whose content
 * the user already saved does not re-derive it for seconds on every cold entry.
 *
 * These pin the STORAGE contract: that a solve is written once and hydrated back,
 * that a hydrated answer costs no engine call, that a record is keyed by tithi and
 * never by person, that a midnight rollover is still a hit, and that stale-version
 * keys are purged. The CALENDRICAL contract (which day a rule actually lands on)
 * belongs to `pitruSmaran.test.ts` under the tsx engine suite, so the solver is
 * spied here rather than run.
 *
 * Lives in `__tests__/jest/` for the same reason the panchang cache suite does:
 * `npm run test:engine` globs `src/panchang/__tests__/*.test.ts` into `tsx --test`,
 * which cannot run a Jest suite.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PANCHANG_DAY_CACHE_VERSION } from '../../panchangDaySerde';
import * as engine from '../../pitruSmaran';
import type { PitruPakshaWindow, TithiRule } from '../../pitruSmaran';
import {
  ensureOccurrences,
  KEPT_OCCURRENCES,
  ensurePakshaWindow,
  hydrateSmaranSolves,
  knownOccurrences,
  persistSmaranSolves,
  smaranRuleKey,
  smaranSolvesSwept,
  __resetSmaranSolvesForTests,
} from '../../pitruSmaranSolves';
import { DERIVED_CACHE_KEY_PREFIXES } from '@/utils/derivedCacheReset';

const PREFIX = `@vedansh:pitru-solves:v${PANCHANG_DAY_CACHE_VERSION}:`;

// माघ कृष्ण अष्टमी — the fixture the screen suite uses for पिताजी.
const RULE: TithiRule = { lunarMonth: 11, paksha: 'krishna', tithi: 8 };
const TODAY = new Date(2026, 7, 15); // 15 Aug 2026, local midnight

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Three successive occurrences, the amount a record keeps. */
const OCCURRENCES = [day(2027, 2, 4), day(2028, 1, 25), day(2029, 2, 11)];

const WINDOW: PitruPakshaWindow = {
  purnima: day(2026, 9, 26),
  start: day(2026, 9, 27),
  end: day(2026, 10, 10),
};

let solveSpy: jest.SpyInstance;

beforeEach(async () => {
  await AsyncStorage.clear();
  __resetSmaranSolvesForTests();
  // The solver is a stub: each call returns the first fixture occurrence strictly
  // after `fromDate`, which is the only property this layer depends on.
  solveSpy = jest
    .spyOn(engine, 'nextObservanceForEntry')
    .mockImplementation((_entry, fromDate) =>
      OCCURRENCES.find((o) => o.getTime() >= fromDate.getTime()) ?? null
    );
  // Stubbed for its return value only — the window solve itself is the engine's
  // contract, pinned in the tsx suite.
  jest.spyOn(engine, 'pitruPakshaWindow').mockReturnValue(WINDOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('occurrence records', () => {
  test('a solve is persisted, and a later launch hydrates it without touching the engine', async () => {
    expect(ensureOccurrences(RULE, TODAY, 2)).toEqual([OCCURRENCES[0], OCCURRENCES[1]]);
    expect(solveSpy).toHaveBeenCalled();
    await persistSmaranSolves();

    // A fresh process: memory is gone, disk is not.
    __resetSmaranSolvesForTests();
    solveSpy.mockClear();
    expect(knownOccurrences(RULE, TODAY, 1)).toBeNull(); // cold — nothing in memory

    await hydrateSmaranSolves([RULE], TODAY);
    expect(knownOccurrences(RULE, TODAY, 2)).toEqual([OCCURRENCES[0], OCCURRENCES[1]]);
    expect(ensureOccurrences(RULE, TODAY, 2)).toEqual([OCCURRENCES[0], OCCURRENCES[1]]);
    expect(solveSpy).not.toHaveBeenCalled();
  });

  test('NON-VACUITY: without the hydrate, the same launch is cold and re-solves', async () => {
    ensureOccurrences(RULE, TODAY, 2);
    await persistSmaranSolves();

    __resetSmaranSolvesForTests();
    solveSpy.mockClear();
    // Deliberately no hydrate — this is the state the feature shipped in.
    expect(ensureOccurrences(RULE, TODAY, 2)).toEqual([OCCURRENCES[0], OCCURRENCES[1]]);
    expect(solveSpy).toHaveBeenCalled();
  });

  test('an on-demand solve asks for exactly what the screen shows, never more', () => {
    ensureOccurrences(RULE, TODAY, 2);
    // Two, not KEPT_OCCURRENCES: a third scan here would land on the very path
    // this cache exists to shorten. The margin is the prewarm's job.
    expect(solveSpy).toHaveBeenCalledTimes(2);
  });

  test('the prewarm depth makes the morning AFTER a tithi a hit', async () => {
    // What `prewarmDetail` asks for, on the list's idle time.
    ensureOccurrences(RULE, TODAY, KEPT_OCCURRENCES);
    await persistSmaranSolves();

    __resetSmaranSolvesForTests();
    solveSpy.mockClear();
    // The day after the first occurrence: the detail screen now wants the SECOND
    // and THIRD dates. Without the margin this re-solves a whole year, on the one
    // launch of the year when the page matters most.
    const afterFirst = day(2027, 2, 5);
    await hydrateSmaranSolves([RULE], afterFirst);
    expect(knownOccurrences(RULE, afterFirst, 2)).toEqual([OCCURRENCES[1], OCCURRENCES[2]]);
    expect(solveSpy).not.toHaveBeenCalled();
  });

  test('the occurrence on the day itself still counts as next — a shraddha is आज until midnight', () => {
    ensureOccurrences(RULE, TODAY, 3);
    expect(knownOccurrences(RULE, OCCURRENCES[0], 1)).toEqual([OCCURRENCES[0]]);
  });

  test('extending a record resumes from the last known date, not from today', async () => {
    ensureOccurrences(RULE, TODAY, 1);
    solveSpy.mockClear();
    ensureOccurrences(RULE, TODAY, 2);
    // One further solve, started past the occurrence already known — never a
    // re-walk of the months the first call already walked.
    expect(solveSpy).toHaveBeenCalledTimes(1);
    expect(solveSpy.mock.calls[0][1].getTime()).toBeGreaterThan(OCCURRENCES[0].getTime());
  });

  test('a rule the engine cannot place degrades to empty rather than throwing', () => {
    solveSpy.mockReturnValue(null);
    expect(ensureOccurrences(RULE, TODAY, 2)).toEqual([]);
    solveSpy.mockImplementation(() => {
      throw new Error('engine blew up');
    });
    expect(() => ensureOccurrences(RULE, TODAY, 2)).not.toThrow();
  });
});

describe('privacy of the key space', () => {
  test('a record is keyed by TITHI ONLY — never by entry id, relation or name', async () => {
    ensureOccurrences(RULE, TODAY, 2);
    ensurePakshaWindow(2026);
    await persistSmaranSolves();

    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    expect(keys).toEqual(expect.arrayContaining([`${PREFIX}occ:m11-krishna-8`, `${PREFIX}win:2026`]));
    const written = keys.join(' ');
    ['smaran-father', 'पिताजी', 'pitaji', 'father'].forEach((secret) => {
      expect(written.toLowerCase()).not.toContain(secret.toLowerCase());
    });
  });

  test('two people on one tithi share one record', async () => {
    expect(smaranRuleKey(RULE)).toBe(smaranRuleKey({ ...RULE }));
    ensureOccurrences(RULE, TODAY, 2);
    await persistSmaranSolves();
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`${PREFIX}occ:`));
    expect(keys).toHaveLength(1);
  });

  test('sarvapitri entries get their own shared record', () => {
    expect(smaranRuleKey('sarvapitri')).toBe('sarvapitri');
  });
});

describe('paksha windows', () => {
  test('a window is persisted, hydrated, and seeded back into the engine memo', async () => {
    expect(ensurePakshaWindow(2026)).toEqual(WINDOW);
    await persistSmaranSolves();

    __resetSmaranSolvesForTests();
    const prime = jest.spyOn(engine, 'primePitruPakshaWindow');

    await hydrateSmaranSolves([], TODAY);
    // `pakshaShraddhaDay` reaches the engine's own memo directly, so without this
    // seed the disk read above would buy the detail screen nothing. (That the
    // memo then serves the seeded value is the engine's contract, pinned in the
    // tsx suite — asserting it through the spied solver here would be circular.)
    expect(prime).toHaveBeenCalledWith(2026, WINDOW);
  });

  test('hydrate fetches this year and next in ONE multiGet with the rules', async () => {
    // Never `jest.spyOn` an AsyncStorage method: every method on the official
    // mock is ALREADY a jest.fn, so the spy hands back that same fn and a
    // call-through recurses. Clear the counter on the existing mock instead —
    // same trap the panchang cache suite documents.
    const multiGet = AsyncStorage.multiGet as unknown as jest.Mock;
    multiGet.mockClear();
    await hydrateSmaranSolves([RULE, 'sarvapitri'], TODAY);
    expect(multiGet).toHaveBeenCalledTimes(1);
    expect(multiGet.mock.calls[0][0]).toEqual([
      `${PREFIX}occ:m11-krishna-8`,
      `${PREFIX}occ:sarvapitri`,
      `${PREFIX}win:2026`,
      `${PREFIX}win:2027`,
    ]);
  });

  test('a fully warm hydrate does NOT touch storage', async () => {
    await hydrateSmaranSolves([RULE], TODAY);
    const multiGet = AsyncStorage.multiGet as unknown as jest.Mock;
    multiGet.mockClear();
    // Re-entry must not put a disk round trip in front of a screen that can
    // already paint — the whole reason this file exists.
    await hydrateSmaranSolves([RULE], TODAY);
    expect(multiGet).not.toHaveBeenCalled();
  });
});

describe('persistence hygiene', () => {
  test('an unchanged session rewrites nothing', async () => {
    ensureOccurrences(RULE, TODAY, 2);
    await persistSmaranSolves();
    const multiSet = AsyncStorage.multiSet as unknown as jest.Mock;
    multiSet.mockClear();
    await persistSmaranSolves();
    expect(multiSet).not.toHaveBeenCalled();
  });

  test('a hydrated record is not written straight back', async () => {
    ensureOccurrences(RULE, TODAY, 2);
    await persistSmaranSolves();
    __resetSmaranSolvesForTests();

    await hydrateSmaranSolves([RULE], TODAY);
    const multiSet = AsyncStorage.multiSet as unknown as jest.Mock;
    multiSet.mockClear();
    await persistSmaranSolves();
    expect(multiSet).not.toHaveBeenCalled();
  });

  test('corrupt records are ignored and simply re-solved', async () => {
    await AsyncStorage.setItem(`${PREFIX}occ:m11-krishna-8`, '{not json');
    await AsyncStorage.setItem(`${PREFIX}win:2026`, '["2026-09-26"]'); // wrong arity
    await hydrateSmaranSolves([RULE], TODAY);
    expect(knownOccurrences(RULE, TODAY, 1)).toBeNull();
    expect(ensureOccurrences(RULE, TODAY, 1)).toEqual([OCCURRENCES[0]]);
  });

  test('stale-version keys are purged, and the sweep never blocks the read', async () => {
    const stale = '@vedansh:pitru-solves:v0:occ:m11-krishna-8';
    const oldWindow = `${PREFIX}win:2024`;
    await AsyncStorage.multiSet([[stale, '["2027-02-04"]'], [oldWindow, '["a","b","c"]']]);

    await hydrateSmaranSolves([RULE], TODAY);
    await smaranSolvesSwept();

    const keys = await AsyncStorage.getAllKeys();
    expect(keys).not.toContain(stale);
    expect(keys).not.toContain(oldWindow);
  });
});

describe('the build-change sweep', () => {
  test('covers the derived prefix but never the user-authored ledger', () => {
    expect(DERIVED_CACHE_KEY_PREFIXES).toContain('@vedansh:pitru-solves:');
    // One character apart, and only one of them is recomputable.
    const ledger = '@vedansh/pitru-smaran';
    expect(DERIVED_CACHE_KEY_PREFIXES.some((p) => ledger.startsWith(p))).toBe(false);
    expect(`${PREFIX}occ:m11-krishna-8`.startsWith('@vedansh:pitru-solves:')).toBe(true);
  });
});

describe('date keys, not instants', () => {
  test('an occurrence round-trips as a civil day', async () => {
    ensureOccurrences(RULE, TODAY, 1);
    await persistSmaranSolves();
    const raw = await AsyncStorage.getItem(`${PREFIX}occ:m11-krishna-8`);
    // Stored as YYYY-MM-DD: an epoch instant would revive as the wrong civil day
    // on a device that moved timezone, and "which day" is the entire question.
    expect(JSON.parse(raw ?? '[]')[0]).toBe(keyOf(OCCURRENCES[0]));

    __resetSmaranSolvesForTests();
    await hydrateSmaranSolves([RULE], TODAY);
    const revived = knownOccurrences(RULE, TODAY, 1)?.[0];
    expect(revived?.getFullYear()).toBe(2027);
    expect(revived?.getMonth()).toBe(1);
    expect(revived?.getDate()).toBe(4);
    expect(revived?.getHours()).toBe(0);
  });
});

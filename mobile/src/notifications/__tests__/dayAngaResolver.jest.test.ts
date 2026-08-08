import { resolveDayAngas, ANGA_WINDOW_DAYS } from '@/notifications/dayAngaResolver';
import { toDateKey } from '@/notifications/seed';
import { ROLLING_WINDOW_DAYS } from '@/notifications/pure';
import * as festivalEngine from '@/panchang/festivalEngine';

// Exercises the resolver against the REAL panchang engine and the real precomputed
// observance table (Ujjain / purnimant), so a change to either surfaces here rather
// than in a shipped notification title.
//
// Every assertion compares local calendar dates on both sides, so the suite does not
// depend on the machine's timezone even though the precomputed table was generated
// under Asia/Kolkata.

describe('resolveDayAngas', () => {
  it('covers the whole scheduling window with well-formed angas', async () => {
    const from = new Date(2026, 5, 1); // 1 Jun 2026
    const map = await resolveDayAngas({ from });

    expect(Object.keys(map)).toHaveLength(ANGA_WINDOW_DAYS);
    // One day of slack past the rolling window: a fire can land on day 30 when
    // today's reminder time has already passed.
    expect(ANGA_WINDOW_DAYS).toBe(ROLLING_WINDOW_DAYS + 1);

    for (let i = 0; i < ANGA_WINDOW_DAYS; i += 1) {
      const day = new Date(2026, 5, 1 + i);
      const anga = map[toDateKey(day)];
      expect(anga).toBeDefined();
      expect(anga.tithiIndex).toBeGreaterThanOrEqual(0);
      expect(anga.tithiIndex).toBeLessThan(30);
      // Paksha is derived from the index and must never contradict it — the title
      // prints them together.
      expect(anga.paksha).toBe(anga.tithiIndex < 15 ? 'shukla' : 'krishna');
    }
    // 31 days of real sunrise+tithi bisection: well under a second warm, but the
    // first cold solve on a loaded runner has been seen past jest's 5 s default.
  }, 30000);

  it('names the day\'s headline observance, preferring the more significant one', async () => {
    // 16 Feb 2026 carries both Maha Shivaratri (star / festival) and Masik
    // Shivaratri (halfmoon / vrat) for Ujjain.
    const target = new Date(2026, 1, 16);
    const ids = festivalEngine
      .getObservancesForDate(target, 'purnimant')
      .map((o) => o.rule.id);
    expect(ids).toEqual(expect.arrayContaining(['maha-shivaratri', 'masik-shivaratri']));

    const map = await resolveDayAngas({ from: new Date(2026, 1, 14), days: 5 });
    const anga = map[toDateKey(target)];

    expect(anga.observanceEn).toBe('Maha Shivaratri');
    expect(anga.observanceHi).toBe('महा शिवरात्रि');
  });

  it('leaves ordinary days with a tithi and no observance', async () => {
    // A quiet stretch: the resolver must not invent an observance for every day,
    // or the tithi would never reach a title.
    const map = await resolveDayAngas({ from: new Date(2026, 1, 14), days: 5 });
    const plain = Object.values(map).filter((a) => !a.observanceEn);
    expect(plain.length).toBeGreaterThan(0);
    plain.forEach((a) => {
      expect(a.observanceHi).toBeUndefined();
      expect(typeof a.tithiIndex).toBe('number');
    });
  });

  it('stops early when the caller cancels', async () => {
    let calls = 0;
    // Cancel after the resolver has had a chance to start the window.
    const map = await resolveDayAngas({ from: new Date(2026, 5, 1) }, () => {
      calls += 1;
      return calls > 3;
    });
    expect(Object.keys(map).length).toBeLessThan(ANGA_WINDOW_DAYS);
  }, 30000);

  it('keeps the tithi when the observance lookup fails', async () => {
    const spy = jest
      .spyOn(festivalEngine, 'getObservancesForDate')
      .mockImplementation(() => {
        throw new Error('observance store unavailable');
      });
    try {
      const from = new Date(2026, 1, 14);
      const map = await resolveDayAngas({ from, days: 3 });
      expect(Object.keys(map)).toHaveLength(3);
      Object.values(map).forEach((a) => {
        expect(a.tithiIndex).toBeGreaterThanOrEqual(0);
        expect(a.observanceEn).toBeUndefined();
      });
    } finally {
      spy.mockRestore();
    }
  });
});

import * as engine from '../../engine';
import { matchesRuleOnDate, matchesRuleOnDateSteps } from '../../festivalEngine';
import { OBSERVANCE_RULES } from '../../festivals';
const location = { cityId: 'jaipur', latitude: 26.9124, longitude: 75.7873, elevation: 431 };
const relative = OBSERVANCE_RULES.find(r => r.id === 'varalakshmi-vrat')!;
afterEach(() => jest.restoreAllMocks());
test('a non-Friday relative check does zero astronomy rather than a full-year scan', () => {
  const reads = jest.spyOn(engine, 'computeTithiAndMonth');
  expect(matchesRuleOnDate(relative, new Date(2026, 10, 8), 'purnimant', location)).toBe(false);
  expect(reads).not.toHaveBeenCalled();
});
test('a Friday only examines seven forward anchors, yielding between each', () => {
  const reads = jest.spyOn(engine, 'computeTithiAndMonth').mockReturnValue({ tithiIndex: 0, lunarMonth: 1, isAdhik: false } as any);
  const work = matchesRuleOnDateSteps(relative, new Date(2026, 10, 6), 'purnimant', location);
  let count = 0;
  for (;;) { const next = work.next(); if (next.done) { expect(next.value).toBe(false); break; } count++; }
  expect(count).toBe(7);
  expect(reads.mock.calls.length).toBeLessThanOrEqual(21);
  for (const [date] of reads.mock.calls) expect((date as Date).getMonth()).toBe(10);
});
test('a solar check uses only the queried civil-day boundaries', () => {
  const reads = jest.spyOn(engine, 'getSiderealSunLng');
  const rule = OBSERVANCE_RULES.find(r => r.id === 'makar-sankranti')!;
  expect(matchesRuleOnDate(rule, new Date(2026, 0, 14), 'purnimant', location)).toBe(true);
  expect(reads).toHaveBeenCalledTimes(2);
  expect(reads.mock.calls.map(([date]) => date.getDate())).toEqual([14, 15]);
});

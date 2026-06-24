import { rotateLeadByDay, dayOfYear } from '@/utils/rotateByDay';

describe('rotateLeadByDay', () => {
  const items = ['a', 'b', 'c', 'd'];

  test('day 0 keeps the original order', () => {
    expect(rotateLeadByDay(items, 0)).toEqual(['a', 'b', 'c', 'd']);
  });

  test('rotates the lead by the day offset', () => {
    expect(rotateLeadByDay(items, 1)).toEqual(['b', 'c', 'd', 'a']);
    expect(rotateLeadByDay(items, 2)).toEqual(['c', 'd', 'a', 'b']);
  });

  test('wraps around past the array length', () => {
    expect(rotateLeadByDay(items, 4)).toEqual(['a', 'b', 'c', 'd']);
    expect(rotateLeadByDay(items, 5)).toEqual(['b', 'c', 'd', 'a']);
  });

  test('every section is always present (coverage), only order changes', () => {
    for (let d = 0; d < 10; d++) {
      expect([...rotateLeadByDay(items, d)].sort()).toEqual(['a', 'b', 'c', 'd']);
    }
  });

  test('handles negative and non-integer day indices', () => {
    expect(rotateLeadByDay(items, -1)).toEqual(['d', 'a', 'b', 'c']);
    expect(rotateLeadByDay(items, 1.9)).toEqual(['b', 'c', 'd', 'a']);
  });

  test('does not mutate the input and is stable for the same day', () => {
    const original = [...items];
    const a = rotateLeadByDay(items, 3);
    const b = rotateLeadByDay(items, 3);
    expect(a).toEqual(b);
    expect(items).toEqual(original);
  });

  test('empty input returns empty output', () => {
    expect(rotateLeadByDay([], 5)).toEqual([]);
  });
});

describe('dayOfYear', () => {
  test('Jan 1 is day 1, Dec 31 is day 365 (non-leap)', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(365);
  });

  test('advances by one each day', () => {
    expect(dayOfYear(new Date(2026, 0, 2))).toBe(2);
    expect(dayOfYear(new Date(2026, 1, 1))).toBe(32);
  });

  test('leap year reaches 366', () => {
    expect(dayOfYear(new Date(2024, 11, 31))).toBe(366);
  });
});

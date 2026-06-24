import { shuffleBySeed } from '@/utils/shuffleBySeed';

describe('shuffleBySeed', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  test('same seed always yields the same order (deterministic)', () => {
    expect(shuffleBySeed(items, 12345)).toEqual(shuffleBySeed(items, 12345));
  });

  test('different seeds can yield different orders', () => {
    const seeds = [1, 2, 3, 4, 5, 6, 7, 8];
    const orders = new Set(seeds.map((s) => shuffleBySeed(items, s).join('')));
    // Not all eight seeds should collapse to one ordering.
    expect(orders.size).toBeGreaterThan(1);
  });

  test('every section is always present (coverage) — it is a permutation', () => {
    for (let s = 0; s < 50; s++) {
      expect([...shuffleBySeed(items, s)].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
    }
  });

  test('does not mutate the input', () => {
    const original = [...items];
    shuffleBySeed(items, 999);
    expect(items).toEqual(original);
  });

  test('handles non-integer and large seeds', () => {
    expect(shuffleBySeed(items, 3.7)).toEqual(shuffleBySeed(items, 3));
    expect([...shuffleBySeed(items, 2 ** 40)].sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  test('empty and single-element inputs are returned as-is', () => {
    expect(shuffleBySeed([], 5)).toEqual([]);
    expect(shuffleBySeed(['only'], 5)).toEqual(['only']);
  });
});

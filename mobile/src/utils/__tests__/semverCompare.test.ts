import { compareSemver } from '../semverCompare';

describe('compareSemver', () => {
  test('returns 0 for equal versions', () => {
    expect(compareSemver('1.3.1', '1.3.1')).toBe(0);
    expect(compareSemver('0.0.0', '0.0.0')).toBe(0);
  });

  test('returns -1 when a < b', () => {
    expect(compareSemver('1.3.0', '1.3.1')).toBe(-1);
    expect(compareSemver('1.2.0', '1.3.0')).toBe(-1);
    expect(compareSemver('0.0.0', '1.3.0')).toBe(-1);
  });

  test('returns 1 when a > b', () => {
    expect(compareSemver('1.4.0', '1.3.9')).toBe(1);
    expect(compareSemver('2.0.0', '1.9.9')).toBe(1);
    expect(compareSemver('1.3.1', '1.3.0')).toBe(1);
  });

  test('handles unequal segment lengths', () => {
    expect(compareSemver('1.3', '1.3.0')).toBe(0);
    expect(compareSemver('1.3.1', '1.3')).toBe(1);
    expect(compareSemver('1.3', '1.3.1')).toBe(-1);
  });

  test('treats non-numeric segments as 0', () => {
    expect(compareSemver('1.x.0', '1.0.0')).toBe(0);
    expect(compareSemver('', '0.0.0')).toBe(0);
    expect(compareSemver('1.3.0-beta', '1.3.0')).toBe(0); // pre-release suffix ignored (parseInt('0-beta')=0)
  });

  test('compares major before minor before patch', () => {
    expect(compareSemver('2.0.0', '1.99.99')).toBe(1);
    expect(compareSemver('1.10.0', '1.9.0')).toBe(1);
  });
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AUTO_SLIDE_SPEEDS,
  autoSlideDurationMs,
  setAutoSlideSpeed,
  __resetAutoSlideStore,
} from '../autoSlideStore';

describe('autoSlideDurationMs pace factors (design.md §85)', () => {
  // A Hanuman Chalisa chaupai page counts ~134 characters (verse + Hindi meaning).
  const CHAUPAI = 134;

  test('very fast holds a page exactly half as long as fast', () => {
    for (const chars of [0, 20, CHAUPAI, 600, 1200, 5000]) {
      expect(autoSlideDurationMs(chars, 'veryFast')).toBe(Math.round(autoSlideDurationMs(chars, 'fast') / 2));
    }
  });

  test('a chaupai: normal 10.4 s, fast 6.2 s, very fast 3.1 s', () => {
    expect(autoSlideDurationMs(CHAUPAI, 'normal')).toBe(10370);
    expect(autoSlideDurationMs(CHAUPAI, 'fast')).toBe(6222);
    expect(autoSlideDurationMs(CHAUPAI, 'veryFast')).toBe(3111);
  });

  test('the 6 s floor and 120 s ceiling scale with very fast (1.8 s – 36 s)', () => {
    expect(autoSlideDurationMs(0, 'veryFast')).toBe(1800);
    expect(autoSlideDurationMs(100_000, 'veryFast')).toBe(36_000);
  });

  test('paces are strictly ordered slow > normal > fast > very fast', () => {
    const times = AUTO_SLIDE_SPEEDS.map((s) => autoSlideDurationMs(CHAUPAI, s));
    expect(AUTO_SLIDE_SPEEDS).toEqual(['slow', 'normal', 'fast', 'veryFast']);
    for (let i = 1; i < times.length; i++) expect(times[i]).toBeLessThan(times[i - 1]);
  });
});

describe('autoSlideStore persistence', () => {
  beforeEach(() => {
    __resetAutoSlideStore();
    jest.mocked(AsyncStorage.setItem).mockClear();
  });

  test('very fast persists like the other paces', () => {
    setAutoSlideSpeed('veryFast');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@vedansh/auto-slide', JSON.stringify({ speed: 'veryFast' }));
  });
});

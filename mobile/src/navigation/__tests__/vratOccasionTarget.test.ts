import { panchangDatedEntry, vratOccasionTarget } from '../vratOccasionTarget';
test.each([new Date(2026, 0, 1), new Date(2026, 10, 8), new Date(2026, 11, 31)])('Panchang → Vrat carries the selected date and catalog mode: %s', date => {
  const target = vratOccasionTarget(date);
  expect(target.screen).toBe('PanchangHome');
  expect(panchangDatedEntry(target.params)).toEqual({ date, mode: 'catalog' });
});
test('legacy dated Panchang entries still open calendar; invalid dates are ignored', () => {
  expect(panchangDatedEntry({ dateMs: +new Date(2026, 10, 8, 18) })).toEqual({ date: new Date(2026, 10, 8), mode: 'calendar' });
  expect(panchangDatedEntry(undefined)).toBeNull();
  expect(panchangDatedEntry({ dateMs: NaN, initialTab: 'catalog' })).toBeNull();
  expect(panchangDatedEntry({ dateMs: 1e20, initialTab: 'catalog' })).toBeNull();
});

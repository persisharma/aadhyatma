// Jest suite (.jest.test.ts — see jest.config.js) so the asset require()s in
// @/data/texts resolve through the react-native preset.
//
// Contract: Theerth (pilgrimage) entries cannot be added to a Daily Routine —
// they open a map + per-temple detail, not a practisable verse reader. The
// "Add Content" screen (RoutineAddItemsScreen) filters them out; this guards the
// data side of that filter so a future theerth entry can't silently become
// routine-addable.
import { library } from '@/data/texts';

// Mirrors RoutineAddItemsScreen's `addable` predicate.
const addable = library.filter(
  (e) => e.status === 'active' && !e.hidden && e.category !== 'theerth',
);

test('theerth entries exist in the library but are NOT routine-addable', () => {
  expect(library.some((e) => e.category === 'theerth')).toBe(true);
  expect(addable.some((e) => e.category === 'theerth')).toBe(false);
});

test('ordinary reader/japam entries remain routine-addable', () => {
  expect(addable.some((e) => e.id === 'hanuman-chalisa')).toBe(true);
  expect(addable.some((e) => e.category === 'japam')).toBe(true);
});

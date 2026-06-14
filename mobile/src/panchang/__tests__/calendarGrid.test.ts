import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildCalendarMonth } from '../calendarGrid';

test('calendar grid includes leading and trailing dates for a stable six-week month', () => {
  const cells = buildCalendarMonth({
    visibleMonth: new Date(2026, 4, 1),
    selectedDate: new Date(2026, 4, 22),
    today: new Date(2026, 4, 23),
    observanceDates: [new Date(2026, 4, 22)],
  });

  assert.equal(cells.length, 42);
  assert.equal(cells[0].date.getFullYear(), 2026);
  assert.equal(cells[0].date.getMonth(), 3);
  assert.equal(cells[0].date.getDate(), 26);
  assert.equal(cells[41].date.getFullYear(), 2026);
  assert.equal(cells[41].date.getMonth(), 5);
  assert.equal(cells[41].date.getDate(), 6);
});

test('calendar grid marks selected, today, current month, and observance dates', () => {
  const cells = buildCalendarMonth({
    visibleMonth: new Date(2026, 4, 1),
    selectedDate: new Date(2026, 4, 22),
    today: new Date(2026, 4, 23),
    observanceDates: [new Date(2026, 4, 22)],
  });

  const selected = cells.find((cell) => cell.date.getDate() === 22 && cell.date.getMonth() === 4);
  const today = cells.find((cell) => cell.date.getDate() === 23 && cell.date.getMonth() === 4);
  const leading = cells[0];

  assert.ok(selected);
  assert.equal(selected.isSelected, true);
  assert.equal(selected.hasObservance, true);
  assert.equal(selected.isToday, false);

  assert.ok(today);
  assert.equal(today.isToday, true);
  assert.equal(today.isSelected, false);

  assert.equal(leading.isCurrentMonth, false);
  assert.equal(leading.isSelected, false);
  assert.equal(leading.hasObservance, false);
});

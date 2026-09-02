import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { buildCalendarMonth, calendarWeeks, WEEK_LENGTH } from '../calendarGrid';

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

test('every date sits in the column its own weekday names, for eight years of months', () => {
  for (let year = 2024; year <= 2031; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      const visibleMonth = new Date(year, month, 1);
      const weeks = calendarWeeks(
        buildCalendarMonth({ visibleMonth, selectedDate: visibleMonth, today: visibleMonth })
      );

      assert.equal(weeks.length, 6, `${year}-${month + 1}: expected six week rows`);
      weeks.forEach((week, weekIndex) => {
        assert.equal(week.length, WEEK_LENGTH, `${year}-${month + 1} week ${weekIndex}: expected seven columns`);
        week.forEach((cell, column) => {
          // Column 0 is the Sunday header in both calendars, so the column index
          // IS the weekday. This is the invariant that broke when the grid was
          // one wrapping row and Yoga's float rounding gave it six columns:
          // 15 Aug 2026 (Saturday) landed in column 2 and read as Tuesday.
          assert.equal(
            cell.date.getDay(),
            column,
            `${cell.key} rendered in column ${column} but is weekday ${cell.date.getDay()}`
          );
        });
      });
    }
  }
});

test('15 August 2026 is a Saturday in the last column', () => {
  const weeks = calendarWeeks(
    buildCalendarMonth({
      visibleMonth: new Date(2026, 7, 1),
      selectedDate: new Date(2026, 7, 15),
      today: new Date(2026, 7, 15),
    })
  );
  const row = weeks.find((week) => week.some((cell) => cell.key === '2026-08-15'));
  assert.ok(row);
  assert.equal(row.findIndex((cell) => cell.key === '2026-08-15'), 6);
});

test('neither calendar sizes a column by a fractional percentage', () => {
  // Yoga resolves percentage widths in 32-bit float, so seven `100 / 7` columns
  // can sum to just over the container and wrap the seventh onto the next line —
  // silently turning a seven-column month into six under a seven-column header.
  // Columns must come from `flex: 1` inside a per-week row instead.
  for (const file of ['src/screens/PanchangScreen.tsx', 'src/components/CalendarDatePicker.tsx']) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /width:\s*`\$\{100\s*\/\s*7\}%`/, `${file} still divides a row by percentage width`);
  }
});

export type CalendarCell = {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  hasObservance: boolean;
};

/** Days in a calendar week — the one number the grid and its header agree on. */
export const WEEK_LENGTH = 7;

export type BuildCalendarMonthInput = {
  visibleMonth: Date;
  selectedDate: Date;
  today: Date;
  observanceDates?: Date[];
};

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = startOfLocalDay(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildCalendarMonth({
  visibleMonth,
  selectedDate,
  today,
  observanceDates = [],
}: BuildCalendarMonthInput): CalendarCell[] {
  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const selectedKey = dateKey(selectedDate);
  const todayKey = dateKey(today);
  const observanceKeys = new Set(observanceDates.map(dateKey));

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    const key = dateKey(date);
    return {
      date,
      key,
      isCurrentMonth: date.getMonth() === visibleMonth.getMonth() && date.getFullYear() === visibleMonth.getFullYear(),
      isSelected: key === selectedKey,
      isToday: key === todayKey,
      hasObservance: observanceKeys.has(key),
    };
  });
}

/**
 * The month's cells split into explicit weeks of seven.
 *
 * Both calendars used to render all 42 cells into ONE `flexWrap: 'wrap'` row and
 * let each cell's `width: '14.285714285714286%'` produce the columns. Yoga
 * resolves percentages in 32-bit float, so on some container widths seven cells
 * sum to a hair OVER 100% (e.g. 320.000008 pt inside 320 pt — the Panchang month
 * grid on a 390 dp iPhone) and the seventh wraps to the next line. The grid then
 * laid out six columns under a seven-column header, so every date sat under the
 * wrong weekday: 15 Aug 2026 (a Saturday) read as मंगलवार / Tuesday.
 *
 * Rendering a row per week with `flex: 1` cells makes the column count
 * structural — it cannot be lost to sub-pixel rounding, on any screen width.
 */
export function calendarWeeks(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  for (let index = 0; index < cells.length; index += WEEK_LENGTH) {
    weeks.push(cells.slice(index, index + WEEK_LENGTH));
  }
  return weeks;
}

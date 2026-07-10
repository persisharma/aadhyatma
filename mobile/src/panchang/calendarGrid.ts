export type CalendarCell = {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  hasObservance: boolean;
};

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

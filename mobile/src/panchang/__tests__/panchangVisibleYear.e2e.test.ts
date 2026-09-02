import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildCalendarMonth, dateKey } from '../calendarGrid';
import { computePanchangForDate } from '../engine';
import {
  getObservancesForDate,
  getObservancesForMonth,
  getUpcomingObservances,
} from '../festivalEngine';
import type { CalendarSystem, PanchangData, PanchangElement, ResolvedObservance } from '../types';

const START_DATE = new Date(2026, 5, 1);
const DAYS_TO_SCAN = 366;
const UPCOMING_VISIBLE_COUNT = 6;
const SYSTEMS: CalendarSystem[] = ['purnimant', 'amanta'];

type VisibleElement = {
  index: number;
  nameHi: string;
  nameEn: string;
  endTime: string;
};

type VisibleSnapshot = {
  selectedDate: string;
  system: CalendarSystem;
  vara: PanchangData['vara'];
  vikramSamvat: number;
  paksha: PanchangData['tithi']['paksha'];
  lunarMonth: PanchangData['lunarMonth'];
  elements: {
    tithi: VisibleElement & { paksha: PanchangData['tithi']['paksha'] };
    nakshatra: VisibleElement;
    yoga: VisibleElement;
    karana: VisibleElement;
  };
  timeCards: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    brahmaMuhurta: string;
  };
  observanceCards: ReturnType<typeof visibleObservance>[];
  upcomingRows: ReturnType<typeof visibleUpcomingRow>[];
};

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatTime12(date: Date | null): string {
  if (!date) return '';
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function visibleElement(element: PanchangElement): VisibleElement {
  return {
    index: element.index,
    nameHi: element.nameHi,
    nameEn: element.nameEn,
    endTime: formatTime12(element.endTime),
  };
}

function visibleObservance(item: ResolvedObservance) {
  return {
    id: item.rule.id,
    date: dateKey(item.date),
    category: item.rule.category,
    marker: item.rule.marker,
    nameHi: item.rule.nameHi,
    nameEn: item.rule.nameEn,
    deityHi: item.rule.deityHi,
    deityEn: item.rule.deityEn,
    shortDescriptionHi: item.rule.shortDescriptionHi,
    shortDescriptionEn: item.rule.shortDescriptionEn,
    linkSectionId: item.rule.linkSectionId ?? '',
    articleId: item.rule.articleId ?? '',
    detailRoute: item.rule.detailRoute ?? '',
  };
}

function visibleUpcomingRow(item: ResolvedObservance) {
  return {
    id: item.rule.id,
    date: dateKey(item.date),
    marker: item.rule.marker,
    nameHi: item.rule.nameHi,
    nameEn: item.rule.nameEn,
  };
}

function visibleSnapshot(date: Date, system: CalendarSystem): VisibleSnapshot {
  const panchang = computePanchangForDate(date, { calendarSystem: system });

  return {
    selectedDate: dateKey(panchang.date),
    system,
    vara: panchang.vara,
    vikramSamvat: panchang.vikramSamvat,
    paksha: panchang.tithi.paksha,
    lunarMonth: panchang.lunarMonth,
    elements: {
      tithi: { ...visibleElement(panchang.tithi), paksha: panchang.tithi.paksha },
      nakshatra: visibleElement(panchang.nakshatra),
      yoga: visibleElement(panchang.yoga),
      karana: visibleElement(panchang.karana),
    },
    timeCards: {
      sunrise: formatTime12(panchang.sunrise),
      sunset: formatTime12(panchang.sunset),
      moonrise: formatTime12(panchang.moonrise),
      brahmaMuhurta: `${formatTime12(panchang.brahmaMuhurta.start)} - ${formatTime12(panchang.brahmaMuhurta.end)}`,
    },
    observanceCards: getObservancesForDate(date, system).map(visibleObservance),
    upcomingRows: getUpcomingObservances(date, UPCOMING_VISIBLE_COUNT, system).map(visibleUpcomingRow),
  };
}

function commonVisibleData(snapshot: VisibleSnapshot) {
  return {
    selectedDate: snapshot.selectedDate,
    vara: snapshot.vara,
    vikramSamvat: snapshot.vikramSamvat,
    paksha: snapshot.paksha,
    elements: snapshot.elements,
    timeCards: snapshot.timeCards,
  };
}

function previousMonthIndex(monthIndex: number): number {
  return monthIndex === 1 ? 12 : monthIndex - 1;
}

function assertNonEmpty(value: string, label: string) {
  assert.ok(value.trim().length > 0, `${label} should be visible`);
}

function assertVisibleSnapshotComplete(snapshot: VisibleSnapshot) {
  assertNonEmpty(snapshot.selectedDate, `${snapshot.system} selected date`);
  assertNonEmpty(snapshot.vara.nameHi, `${snapshot.selectedDate} vara Hindi`);
  assertNonEmpty(snapshot.vara.nameEn, `${snapshot.selectedDate} vara English`);
  assert.ok(snapshot.vikramSamvat >= 2000, `${snapshot.selectedDate} Vikram Samvat should be populated`);
  assert.ok(snapshot.lunarMonth.index >= 1 && snapshot.lunarMonth.index <= 12, `${snapshot.selectedDate} lunar month index`);
  assertNonEmpty(snapshot.lunarMonth.nameHi, `${snapshot.selectedDate} lunar month Hindi`);
  assertNonEmpty(snapshot.lunarMonth.nameEn, `${snapshot.selectedDate} lunar month English`);

  for (const [key, element] of Object.entries(snapshot.elements)) {
    assert.ok(element.index >= 0, `${snapshot.selectedDate} ${key} index`);
    assertNonEmpty(element.nameHi, `${snapshot.selectedDate} ${key} Hindi`);
    assertNonEmpty(element.nameEn, `${snapshot.selectedDate} ${key} English`);
  }

  assertNonEmpty(snapshot.timeCards.sunrise, `${snapshot.selectedDate} sunrise`);
  assertNonEmpty(snapshot.timeCards.sunset, `${snapshot.selectedDate} sunset`);
  assertNonEmpty(snapshot.timeCards.brahmaMuhurta, `${snapshot.selectedDate} Brahma Muhurta`);

  const observanceIds = snapshot.observanceCards.map((item) => item.id);
  assert.equal(new Set(observanceIds).size, observanceIds.length, `${snapshot.selectedDate} observance cards should be deduped`);
  for (const item of snapshot.observanceCards) {
    assertNonEmpty(item.nameHi, `${item.id} Hindi name`);
    assertNonEmpty(item.nameEn, `${item.id} English name`);
    assertNonEmpty(item.deityHi, `${item.id} Hindi deity/category`);
    assertNonEmpty(item.deityEn, `${item.id} English deity/category`);
    assertNonEmpty(item.shortDescriptionHi, `${item.id} Hindi short description`);
    assertNonEmpty(item.shortDescriptionEn, `${item.id} English short description`);
  }

  const upcomingIds = snapshot.upcomingRows.map((item) => `${item.date}:${item.id}`);
  assert.equal(new Set(upcomingIds).size, upcomingIds.length, `${snapshot.selectedDate} upcoming rows should be deduped`);
  for (const item of snapshot.upcomingRows) {
    assertNonEmpty(item.date, `${item.id} upcoming date`);
    assertNonEmpty(item.nameHi, `${item.id} upcoming Hindi name`);
    assertNonEmpty(item.nameEn, `${item.id} upcoming English name`);
  }
}

test('Panchang visible data is stable for the next year except expected lunar month labels', () => {
  let krishnaMonthDifferences = 0;

  for (let offset = 0; offset < DAYS_TO_SCAN; offset += 1) {
    const date = addDays(START_DATE, offset);
    const purnimant = visibleSnapshot(date, 'purnimant');
    const amanta = visibleSnapshot(date, 'amanta');

    assertVisibleSnapshotComplete(purnimant);
    assertVisibleSnapshotComplete(amanta);
    assert.deepEqual(
      commonVisibleData(amanta),
      commonVisibleData(purnimant),
      `${dateKey(date)} changed visible data other than the calendar-system label and lunar month`
    );

    if (purnimant.paksha === 'shukla' || purnimant.lunarMonth.isAdhik || amanta.lunarMonth.isAdhik) {
      assert.deepEqual(amanta.lunarMonth, purnimant.lunarMonth, `${dateKey(date)} same-month paksha should match`);
    } else {
      krishnaMonthDifferences += 1;
      assert.equal(
        amanta.lunarMonth.index,
        previousMonthIndex(purnimant.lunarMonth.index),
        `${dateKey(date)} Amanta month should be one month behind Purnimant in Krishna Paksha`
      );
    }
  }

  assert.ok(krishnaMonthDifferences > 0, 'year scan should include Krishna Paksha dates');
});

test('calendar grid tags every resolved observance date for the next year', () => {
  const today = START_DATE;

  for (const system of SYSTEMS) {
    for (let monthOffset = 0; monthOffset <= 12; monthOffset += 1) {
      const visibleMonth = addMonths(START_DATE, monthOffset);
      const observances = getObservancesForMonth(visibleMonth.getFullYear(), visibleMonth.getMonth(), system);
      const cells = buildCalendarMonth({
        visibleMonth,
        selectedDate: visibleMonth,
        today,
        observanceDates: observances.map((item) => item.date),
      });

      for (const observance of observances) {
        const cell = cells.find((item) => item.key === dateKey(observance.date));
        assert.ok(cell, `${system} ${observance.rule.id} should be inside ${dateKey(visibleMonth)} grid`);
        assert.equal(cell.hasObservance, true, `${system} ${observance.rule.id} should show a calendar tag on ${dateKey(observance.date)}`);
        assertNonEmpty(observance.rule.nameEn, `${observance.rule.id} calendar tag English name`);
        assertNonEmpty(observance.rule.nameHi, `${observance.rule.id} calendar tag Hindi name`);
      }
    }
  }
});

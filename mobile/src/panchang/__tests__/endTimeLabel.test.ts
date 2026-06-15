import assert from 'node:assert/strict';
import { test } from 'node:test';

import { endsAfterDay, localDayDelta } from '../endTimeLabel';
import { computePanchangForDate } from '../engine';

test('localDayDelta counts calendar days, not 24h spans', () => {
  // 11pm → next day 1am is < 24h apart but a different calendar day → delta 1.
  assert.equal(localDayDelta(new Date(2026, 5, 1, 1, 0), new Date(2026, 4, 31, 23, 0)), 1);
  assert.equal(localDayDelta(new Date(2026, 5, 30, 7, 38), new Date(2026, 5, 30, 5, 44)), 0);
  assert.equal(localDayDelta(new Date(2026, 6, 1, 7, 38), new Date(2026, 5, 30, 5, 44)), 1);
});

test('endsAfterDay: null and same-day are false, later day is true', () => {
  const base = new Date(2026, 5, 30);
  assert.equal(endsAfterDay(null, base), false);
  assert.equal(endsAfterDay(new Date(2026, 5, 30, 23, 59), base), false, 'same day, late evening');
  assert.equal(endsAfterDay(new Date(2026, 6, 1, 0, 1), base), true, 'crosses midnight');
});

// Regression for the reported Tithi Vriddhi case: Krishna Pratipada is present at
// sunrise on both 30 Jun and 1 Jul 2026 (Ujjain), ending Wed 1 Jul ~7:38 AM. The
// 30 Jun tile must flag "next day"; the 1 Jul tile (ends same day) must not.
test('Pratipada vriddhi 30 Jun → next day, 1 Jul → same day (Ujjain)', () => {
  const jun30 = computePanchangForDate(new Date(2026, 5, 30));
  const jul1 = computePanchangForDate(new Date(2026, 6, 1));
  assert.equal(jun30.tithi.nameEn, 'Pratipada');
  assert.equal(jul1.tithi.nameEn, 'Pratipada');
  assert.equal(endsAfterDay(jun30.tithi.endTime, jun30.date), true, '30 Jun Pratipada ends next day');
  assert.equal(endsAfterDay(jul1.tithi.endTime, jul1.date), false, '1 Jul Pratipada ends same day');
});

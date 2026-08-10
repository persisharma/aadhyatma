import test from 'node:test';
import assert from 'node:assert/strict';
import { planWidgetPayload } from '../planPayload';
import { DEFAULT_LOCATION } from '@/panchang/locations';

test('real bundle planner produces a dated, validated 14-day Panchang and verse window', async () => {
  const payload = await planWidgetPayload({ generatedAt: new Date('2026-08-10T06:30:00Z'), locale: 'kn', location: DEFAULT_LOCATION, calendarSystem: 'purnimant', deviceTimeZone: 'Asia/Kolkata', activity: {} });
  assert.equal(payload.panchang.days.length, 14);
  assert.equal(payload.verses.days.length, 14);
  assert.equal(payload.panchang.days[0].dateKey, '2026-08-10');
  assert.equal(payload.panchang.days[13].dateKey, '2026-08-23');
  assert.ok(payload.verses.days.every((day) => day.excerpt.kn.length > 0 && day.accessibilityLabel.kn.length > day.excerpt.kn.length));
  assert.ok(payload.panchang.days.every((day) => day.deepLink.endsWith(day.dateKey)));
  assert.ok(payload.panchang.days.every((day) => day.sunrise.kn.startsWith('ಸೂರ್ಯೋದಯ')));
});

test('Panchang dates and timings are stable when the process zone is non-IST', async () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'UTC';
    const utc = await planWidgetPayload({ generatedAt: new Date('2026-08-10T00:30:00Z'), locale: 'en', location: DEFAULT_LOCATION, calendarSystem: 'purnimant', deviceTimeZone: 'America/Los_Angeles', activity: {} });
    process.env.TZ = 'Pacific/Auckland';
    const auckland = await planWidgetPayload({ generatedAt: new Date('2026-08-10T00:30:00Z'), locale: 'en', location: DEFAULT_LOCATION, calendarSystem: 'purnimant', deviceTimeZone: 'America/Los_Angeles', activity: {} });
    assert.deepEqual(auckland.panchang.days, utc.panchang.days);
    assert.equal(utc.panchang.days[0].dateKey, '2026-08-10');
    assert.equal(utc.verses.days[0].dateKey, '2026-08-09');
    assert.equal(utc.japam.dateKey, '2026-08-09');
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { planWidgetPayload } from '../planPayload';
import { DEFAULT_LOCATION, CITIES, toPanchangLocation } from '@/panchang/locations';
import { prevailingTithi } from '@/panchang/prevailingTithi';
import { computePanchangForDate } from '@/panchang/engine';
import { runningTithi } from '../planner';

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

// The reported bug (Sept 2026): the placed Panchang widget still read षष्ठी
// long after the app's own glance had moved to सप्तमी, because the payload
// carried one tithi per civil day and no handover instant. Every dated day now
// carries the chain, and the widget's selector must agree with the app's live
// point query at every instant of it — not just at sunrise.
test('every dated day carries a chain that agrees with the app’s live tithi', async () => {
  const bengaluru = toPanchangLocation(CITIES.find((city) => city.id === 'bengaluru') ?? CITIES[0], 'city');
  const payload = await planWidgetPayload({ generatedAt: new Date('2026-09-17T04:00:00Z'), locale: 'hi', location: bengaluru, calendarSystem: 'purnimant', deviceTimeZone: 'Asia/Kolkata', activity: {} });
  assert.ok(payload.panchang.days.every((day) => (day.tithiSegments?.length ?? 0) > 0));

  const day = payload.panchang.days[0];
  assert.equal(day.dateKey, '2026-09-17');
  // 17 Sept 2026, Bengaluru: षष्ठी runs till 10:48 AM IST, then सप्तमी.
  assert.equal(day.tithi.hi, 'षष्ठी');
  assert.equal(day.tithiSegments![0].till!.hi, 'तक 10:48 AM');
  assert.equal(day.tithiSegments![0].till!.en, 'till 10:48 AM');
  assert.equal(runningTithi(day, new Date('2026-09-17T04:00:00Z')).name.hi, 'षष्ठी');
  assert.equal(runningTithi(day, new Date('2026-09-17T09:00:00Z')).name.hi, 'सप्तमी');

  // Sampled hourly across the window, the payload's selector and the app's
  // prevailingTithi must never disagree — the widget and the Home glance are
  // then the same answer by construction, not by coincidence.
  for (const dated of payload.panchang.days) {
    const [year, month, date] = dated.dateKey.split('-').map(Number);
    const solved = computePanchangForDate(new Date(year, month - 1, date, 12), { calendarSystem: 'purnimant', location: bengaluru, civilTimeZone: 'Asia/Kolkata' });
    for (let hour = 0; hour < 24; hour += 1) {
      const at = new Date(`${dated.dateKey}T${String(hour).padStart(2, '0')}:30:00+05:30`);
      assert.equal(runningTithi(dated, at).name.hi, prevailingTithi(solved, at).nameHi, `${dated.dateKey} ${hour}:30 IST`);
    }
  }
});

test('a handover past midnight carries its date, so “तक 5:22 AM” never reads as this morning', async () => {
  // Bengaluru 10 Jul 2026 — the documented kshaya day: Dashami till 8:16 AM,
  // then a kshaya Ekadashi that ends at ~5:22 AM the NEXT morning.
  const bengaluru = toPanchangLocation(CITIES.find((city) => city.id === 'bengaluru') ?? CITIES[0], 'city');
  const payload = await planWidgetPayload({ generatedAt: new Date('2026-07-10T04:00:00Z'), locale: 'hi', location: bengaluru, calendarSystem: 'purnimant', deviceTimeZone: 'Asia/Kolkata', activity: {} });
  const segments = payload.panchang.days[0].tithiSegments!;
  assert.equal(segments[0].name.hi, 'दशमी');
  assert.ok(!segments[0].till!.hi.includes(','), `same-day end must stay bare: ${segments[0].till!.hi}`);
  assert.equal(segments[1].name.hi, 'एकादशी');
  assert.match(segments[1].till!.hi, /, 11 जुल॰$/);
  assert.match(segments[1].till!.en, /, 11 Jul$/);
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

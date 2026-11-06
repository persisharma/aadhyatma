import test from 'node:test';
import assert from 'node:assert/strict';
import { OCCASION_PROFILES, findTimingOccurrences, intersect, paranaWindows, solveOccasion, timingsOnDay } from '../occasionTimings';
import { computeDayInputs, dayAt, type ScanOptions } from '../panchangDayStore';
import { runSynchronously } from '../backgroundWork';
import { occasionRange } from '../occasionTimingFormat';
import { buildPanchangShareModel } from '../panchangShareModel';
import { computeMuhuratDay } from '../muhurat';
import { PUBLISHED_OCCASIONS } from './fixtures/occasionPublished';
const delhi = { cityId: 'delhi', latitude: 28.6139, longitude: 77.209, elevation: 216 };
const bengaluru = { cityId: 'bengaluru', latitude: 12.9716, longitude: 77.5946, elevation: 920 };
function solved(date: Date, location = delhi, system: ScanOptions['calendarSystem'] = 'purnimant') {
  const options = { calendarSystem: system, location };
  const occurrences = [-1, 0, 1].flatMap(i => runSynchronously(findTimingOccurrences(dayAt(date, i), options, new Set())));
  const days = [-1, 0, 1, 2].map(i => computeDayInputs(dayAt(date, i), options));
  return { items: timingsOnDay(occurrences.map(o => solveOccasion(o, days)), date), days };
}
// Published clocks, transcribed from Drik festival pages; 3-minute engine
// horizon convention bound. Calendar day equality is exact, never ±1 day.
for (const [id, month, day, start, end, city] of [
  ['diwali', 11, 8, '17:54', '19:50', delhi],
  ['diwali', 11, 8, '18:17', '20:20', bengaluru],
  ['dhanteras', 11, 6, '18:02', '19:57', delhi],
  ['ganesh-chaturthi', 9, 14, '11:02', '13:31', delhi],
  ['ram-navami', 3, 26, '11:13', '13:41', delhi],
  ['dussehra', 10, 20, '13:59', '14:45', delhi],
  ['maha-navami', 10, 20, '13:59', '14:45', delhi],
  ['raksha-bandhan', 8, 28, '05:57', '09:48', delhi],
  ['bhai-dooj', 11, 11, '13:10', '15:20', delhi],
  ['akshaya-tritiya', 4, 19, '10:49', '12:20', delhi],
  ['govardhan-puja', 11, 10, '06:40', '08:50', delhi],
] as const) test(`published: ${id} ${city.cityId} ${month}/${day}`, () => {
  const date = new Date(2026, month - 1, day), { items } = solved(date, city);
  const w = items.find(i => i.ruleId === id)?.windows[0];
  assert.ok(w, 'must match exact published day');
  for (const [instant, clock] of [[w.start, start], [w.end, end]] as const) {
    const minutes = instant.getHours() * 60 + instant.getMinutes();
    const [h, m] = clock.split(':').map(Number);
    assert.ok(Math.abs(minutes - h * 60 - m) <= 3, `${instant.toString()} vs ${clock}`);
  }
});
for (const fixture of PUBLISHED_OCCASIONS) test(`source audit: ${fixture.id} ${fixture.date}`, () => {
  const [year, month, day] = fixture.date.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  for (const calendarSystem of ['purnimant', 'amanta'] as const) {
    // Test the actual occurrence lookup, without injecting a profile on an
    // engine-chosen date. Monthly Ganesh may be hidden by its annual sibling
    // in timingsOnDay, so inspect the raw source-backed occurrence here.
    const options = { calendarSystem, location: delhi };
    const found = runSynchronously(findTimingOccurrences(date, options, new Set(), fixture.id));
    assert.equal(found.length, 1, `${calendarSystem}: exact source date ${fixture.source}`);
    const item = solveOccasion(found[0], [0, 1].map(i => computeDayInputs(dayAt(date, i), options)));
    if (fixture.guidanceOnly) {
      // This is a withholding regression, NOT a passed preferred-clock match.
      assert.deepEqual(item.windows, [], 'unverified Ghatasthapana must not advertise a clock');
      assert.match(item.noteEn ?? '', /not yet verified/);
      continue;
    }
    assert.equal(item.windows.length, fixture.clocks.length, `${fixture.source}: complete window count`);
    fixture.clocks.forEach((pair, index) => pair.forEach((clock, endpoint) => {
      const [hm, offset] = clock.split('+');
      const [h, m] = hm.split(':').map(Number);
      const expected = dayAt(date, Number(offset ?? 0)); expected.setHours(h, m);
      const actual = endpoint === 0 ? item.windows[index].start : item.windows[index].end;
      assert.equal(+dayAt(actual, 0), +dayAt(expected, 0), 'civil date is exact, including next-day endpoints');
      assert.ok(Math.abs(+actual - +expected) <= 3 * 60000, `${calendarSystem}: ${actual} vs ${expected}; ${fixture.source}`);
    }));
  }
});
test('source audit accounts for every registered occasion, including guidance-only profiles', () => {
  assert.deepEqual(new Set(PUBLISHED_OCCASIONS.map(f => f.id)), new Set(OCCASION_PROFILES.map(p => p.ruleId)));
});
test('coincident Janmashtami traditions are not duplicated in 2026', () => {
  const options = { calendarSystem: 'purnimant' as const, location: delhi };
  const found = runSynchronously(findTimingOccurrences(new Date(2026, 8, 4), options, new Set()));
  assert.ok(found.some(i => i.profile.ruleId === 'janmashtami'));
  assert.ok(!found.some(i => i.profile.ruleId === 'janmashtami-vaishnava'));
});
test('Rama Ekadashi parana is on 6 Nov, after Hari Vasara, 06:37–08:48', () => {
  const item = solved(new Date(2026, 10, 6)).items.find(i => i.ruleId === 'rama-ekadashi');
  assert.ok(item); const w = item.windows[0]; assert.equal(w.start.getDate(), 6);
  assert.ok(Math.abs(w.start.getHours() * 60 + w.start.getMinutes() - 397) <= 3);
  assert.ok(Math.abs(w.end.getHours() * 60 + w.end.getMinutes() - 528) <= 3);
});
test('the vrat day also shows its next-day parana, with both endpoint dates', () => {
  const date = new Date(2026, 10, 5);
  const item = solved(date).items.find(i => i.ruleId === 'rama-ekadashi');
  assert.ok(item);
  assert.match(occasionRange(item.windows[0], date, 'en'), /06:3[5-9], 6 Nov – 08:4[6-9], 6 Nov/);
});
test('Holika 2026 uses the shifted evening; exceptional 2027 never fabricates a clock', () => {
  assert.ok(solved(new Date(2026, 2, 3)).items.some(i => i.ruleId === 'holi' && i.windows.length));
  const exceptional = solved(new Date(2027, 2, 21)).items.find(i => i.ruleId === 'holi');
  assert.ok(exceptional?.noteHi); assert.equal(exceptional.windows.length, 0);
});
test('Hari Vasara clips morning; no positive overlap at touching boundaries', () => {
  const d = (hour: number) => new Date(2026, 0, 1, hour);
  const result = paranaWindows({ start: d(0), end: d(28) }, d(6), d(18));
  assert.equal(result[0].start.getHours(), 7);
  assert.equal(intersect({ start: d(1), end: d(2) }, { start: d(2), end: d(3) }), null);
});
test('both endpoints carry next-day dates; midnight end is unambiguous', () => {
  const date = new Date(2026, 10, 5), w = { start: dayAt(date, 1), end: new Date(2026, 10, 6, 1), labelHi: '', labelEn: '' };
  assert.equal(occasionRange(w, date, 'en'), '00:00, 6 Nov – 01:00, 6 Nov');
});
test('ordinary day is empty; city changes clocks; both lunar calendars agree on Diwali', () => {
  assert.equal(solved(new Date(2026, 10, 12)).items.length, 0);
  const date = new Date(2026, 10, 8);
  assert.deepEqual(solved(date, delhi, 'amanta').items, solved(date, delhi).items);
});
test('Diwali leads its share strip over the previous night Shivratri carryover', () => {
  const { items } = solved(new Date(2026, 10, 8));
  assert.equal(items[0].ruleId, 'diwali');
  assert.ok(items.some(i => i.ruleId === 'masik-shivaratri'));
});
test('registry is unique, catalog-backed and source-bearing; Vaishnava parana stays absent', () => {
  assert.equal(new Set(OCCASION_PROFILES.map(p => p.id)).size, OCCASION_PROFILES.length);
  assert.ok(OCCASION_PROFILES.every(p => p.source.startsWith('https://www.drikpanchang.com/')));
  assert.ok(OCCASION_PROFILES.every(p => !p.ruleId.includes('vaishnava') || p.recipe !== 'ekadashi'));
});
test('share model retains all existing sections and receives exact same solved windows', () => {
  const date = new Date(2026, 10, 8), { items, days } = solved(date);
  const p = days[1].p, md = computeMuhuratDay(p.sunrise, p.sunset, days[2].p.sunrise, date.getDay());
  const model = buildPanchangShareModel({ p, md, observances: [], placeHi: 'नई दिल्ली', placeEn: 'New Delhi', calendarSystem: 'purnimant', lang: 'hi', occasionTimings: items });
  assert.equal(model.occasionTimings, items); assert.equal(model.day.length, 8); assert.equal(model.night.length, 8);
  for (const key of ['tithi', 'nakshatra', 'yoga', 'karana', 'rahu', 'gulika', 'yamaganda', 'surya', 'chandra', 'dishaShool', 'agni'] as const) assert.ok(model[key]);
});

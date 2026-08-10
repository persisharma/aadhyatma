import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWidgetPayload, computeJapaStreak, twoLineExcerpt } from '../planner';
import { DEFAULT_LOCATION } from '@/panchang/locations';

const localized = { hi: 'अ', en: 'A', gu: 'અ', kn: 'ಅ' };
const panchang = (dateKey: string) => ({ dateKey, representedDate: localized, tithi: localized, sunrise: localized, rahuKaal: localized, deepLink: `vedansh://widget/panchang?date=${dateKey}` });
const verse = (dateKey: string) => ({ dateKey, sourceId: 'gita', verseIndex: 0, lines: { hi: ['अ'], en: ['A'], gu: ['અ'], kn: ['ಅ'] }, excerpt: localized, source: localized, accessibilityLabel: localized, deepLink: 'vedansh://widget/verse?sourceId=gita&verseIndex=0' });

test('japa streak ignores reading-only days and may end yesterday', () => {
  const activity = {
    '2026-08-07': { reads: {}, japa: { gayatri: { beads: 10, rounds: 0 } } },
    '2026-08-08': { reads: {}, japa: { gayatri: { beads: 108, rounds: 1 } } },
    '2026-08-09': { reads: {}, japa: { gayatri: { beads: 1, rounds: 0 } } },
    '2026-08-10': { reads: { gita: 2 }, japa: {} },
  };
  assert.equal(computeJapaStreak(activity, '2026-08-10'), 3);
});

test('builds true >108 totals and an exact mantra deep link', () => {
  const dateKey = '2026-08-10';
  const payload = buildWidgetPayload({ generatedAt: new Date('2026-08-10T06:30:00Z'), writerAppVersion: '1.4.6', locale: 'hi', location: DEFAULT_LOCATION, calendarSystem: 'amanta', deviceTimeZone: 'Asia/Kolkata', panchangDays: [panchang(dateKey)], verseDays: [verse(dateKey)], activity: { [dateKey]: { reads: {}, japa: { gayatri: { beads: 216, rounds: 2 } } } }, lastUsedMantraId: 'gayatri' });
  assert.equal(payload.japam.totalBeads, 216);
  assert.equal(payload.japam.totalRounds, 2);
  assert.match(payload.japam.deepLink, /mantraId=gayatri/);
  assert.equal(payload.panchang.calendarSystem, 'amanta');
  assert.equal(payload.japam.timeZone, 'Asia/Kolkata');
});

test('Japam uses the device-local UserActivity day while Panchang remains represented IST', () => {
  const payload = buildWidgetPayload({
    generatedAt: new Date('2026-08-10T00:30:00.000Z'), writerAppVersion: '1.4.6', locale: 'en',
    location: DEFAULT_LOCATION, calendarSystem: 'purnimant', deviceTimeZone: 'America/Los_Angeles',
    panchangDays: [panchang('2026-08-10')], verseDays: [verse('2026-08-09')],
    activity: { '2026-08-09': { reads: {}, japa: { gayatri: { beads: 54, rounds: 0 } } } },
  });
  assert.equal(payload.panchang.days[0].dateKey, '2026-08-10');
  assert.equal(payload.verses.days[0].dateKey, '2026-08-09');
  assert.equal(payload.japam.dateKey, '2026-08-09');
  assert.equal(payload.japam.totalBeads, 54);
});

test('two-line policy is deterministic and bounded', () => {
  const first = twoLineExcerpt(['one '.repeat(30)], 40);
  assert.equal(first, twoLineExcerpt(['one '.repeat(30)], 40));
  assert.ok(first.length <= 40);
  assert.ok(first.endsWith('…'));
});

test('two-line excerpt never leaves a dangling virama/joiner before the ellipsis (◌ U+25CC)', () => {
  // A space-less Devanagari conjunct run forces the fallback cut to land inside a
  // cluster; the excerpt must trim back to a complete cluster, not "…" after a virama.
  const excerpt = twoLineExcerpt(['क्षेत्रे'.repeat(15)], 10);
  assert.ok(excerpt.endsWith('…'));
  assert.doesNotMatch(excerpt, /[्્್‌‍]…$/u, 'ends on a dangling conjunct-former');
  assert.ok(!excerpt.includes('◌'), 'contains no dotted-circle placeholder');
  // A trailing matra is a legal final and must be preserved (not over-trimmed).
  assert.equal(twoLineExcerpt(['को '.repeat(20)], 12).includes('…'), true);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OBSERVANCE_RULES } from '../festivals';
import { resolveObservancesForYear } from '../festivalEngine';
import { runSynchronously } from '../backgroundWork';
import { findTimingOccurrences, OCCASION_CARD_PROFILES, occasionGuidance } from '../occasionTimings';
import { ALL_LENSES } from '../lenses';
import { UJJAIN_GEO } from '../engine';
import { occasionCardReference } from '../occasionTimingFormat';
import reviewed from './fixtures/occasionCards.json';

test('the closed inventory covers every app occasion without treating guidance as a clock recipe', () => {
  assert.deepEqual(new Set(reviewed.map(r => r.id)), new Set(OBSERVANCE_RULES.map(r => r.id)));
  assert.deepEqual(new Set(OCCASION_CARD_PROFILES.map(p => p.ruleId)), new Set(reviewed.map(r => r.id)));
  assert.equal(new Set(OCCASION_CARD_PROFILES.map(p => p.id)).size, OCCASION_CARD_PROFILES.length);
});
for (const calendarSystem of ['purnimant', 'amanta'] as const) test(`${calendarSystem}: all twelve months resolve dated share-card identities`, () => {
  const events = resolveObservancesForYear(2026, calendarSystem);
  const byDay = new Map<number, typeof events>();
  for (const event of events) {
    const key = +event.date;
    byDay.set(key, [...(byDay.get(key) ?? []), event]);
  }
  assert.equal(new Set(events.map(e => e.date.getMonth())).size, 12);
  let checked = 0;
  for (const [date, expected] of byDay) {
    const found = runSynchronously(findTimingOccurrences(new Date(date), { calendarSystem, location: UJJAIN_GEO }, ALL_LENSES));
    for (const event of expected) {
      const card = found.find(o => o.profile.ruleId === event.rule.id);
      assert.ok(card, `${event.rule.id} ${event.date.toDateString()}`);
      if (card.profile.recipe === 'guidance') {
        const guide = occasionGuidance(card.rule, card.date);
        assert.equal(guide.windows.length, 0);
        assert.ok(guide.noteHi && guide.noteEn);
      }
      checked++;
    }
  }
  assert.equal(checked, events.length, `every dated event is checked: ${checked}`);
});
test('Holi and Maha Navami retain guidance on their published date, separately from the ritual', () => {
  for (const [id, date, ceremonyDate] of [
    ['holi', new Date(2026, 2, 4), new Date(2026, 2, 3)],
    ['maha-navami', new Date(2026, 9, 19), new Date(2026, 9, 20)],
  ] as const) {
    const find = (d: Date) => runSynchronously(findTimingOccurrences(d, { calendarSystem: 'purnimant', location: UJJAIN_GEO }, ALL_LENSES, id));
    assert.ok(find(date).some(o => o.profile.recipe === 'guidance'));
    assert.ok(find(ceremonyDate).some(o => o.profile.recipe !== 'guidance'));
  }
});

test('adjacent ceremony exports use their own date; current-day parana uses today', () => {
  const rule = OBSERVANCE_RULES.find(r => r.id === 'holi')!;
  const march3 = new Date(2026, 2, 3), march4 = new Date(2026, 2, 4);
  const card = { ...occasionGuidance(rule, march3), windows: [{ start: new Date(2026, 2, 3, 18), end: new Date(2026, 2, 3, 21), labelHi: 'दहन', labelEn: 'Dahan' }] };
  assert.equal(+occasionCardReference(card, march4), +march3);
  const tomorrow = { ...card, windows: [{ ...card.windows[0], start: new Date(2026, 2, 4, 6), end: new Date(2026, 2, 4, 8) }] };
  assert.equal(+occasionCardReference(tomorrow, march4), +march4);
});

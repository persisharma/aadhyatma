import assert from 'node:assert/strict';
import { test } from 'node:test';
import { composeHomeRashifal } from '../homeRashifal';
import { EMPTY_ROSTER, birthProfileToInput, type ProfileRoster } from '../birthProfiles';
import { computeKundali, HOUSE_THEME_HI, RASHI_NAMES_HI } from '../kundali';

const anita = { id: 'p-1', name: 'Anita', date: '1990-03-15', time: '06:30', cityId: 'ujjain' };
const raghav = { id: 'p-2', name: 'Raghav', date: '1985-11-02', time: '21:10', cityId: 'delhi' };
const day = new Date(2026, 8, 5, 10, 0);

test('a guest roster composes nothing — no chart, no transit solve', () => {
  assert.equal(composeHomeRashifal(EMPTY_ROSTER, day), null);
});

test("names the ACTIVE person's Moon sign and a house-theme day line", () => {
  const roster: ProfileRoster = { activeId: 'p-1', people: [anita] };
  const out = composeHomeRashifal(roster, day);
  assert.ok(out);
  const moon = computeKundali(birthProfileToInput(anita)).grahas.find((g) => g.graha === 'moon')!;
  assert.equal(out.rashiIndex, moon.rashiIndex);
  assert.equal(out.rashiHi, RASHI_NAMES_HI[moon.rashiIndex]);
  // The theme is the Favour row's house theme, never fresh copy.
  assert.equal(out.themeHi, `${HOUSE_THEME_HI[out.guidance.favourHouse - 1]} का दिन`);
  assert.match(out.themeEn, /^a day for /);
  assert.equal(out.guidance.rashiIndex, moon.rashiIndex);
});

test('a solo roster keeps the "your" phrasing; two people name the active one', () => {
  const solo = composeHomeRashifal({ activeId: 'p-1', people: [anita] }, day);
  assert.equal(solo?.personName, null);
  const pair = composeHomeRashifal({ activeId: 'p-2', people: [anita, raghav] }, day);
  assert.equal(pair?.personName, 'Raghav');
  const pairMoon = computeKundali(birthProfileToInput(raghav)).grahas.find((g) => g.graha === 'moon')!;
  assert.equal(pair?.rashiIndex, pairMoon.rashiIndex);
});

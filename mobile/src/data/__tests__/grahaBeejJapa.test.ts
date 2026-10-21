import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getJapamMantra, japamMantras } from '../japam';
import { GRAHA_BEEJ_JAPA_ID } from '../japam/grahaBeej';
import { GRAHA_UPAY } from '../../panchang/grahaReadingContent';
import { getVersePool } from '../versePool';

// Navagraha beej japa (design.md §35, RULEBOOK §14.3.5): the Kundali upay names
// a beej mantra per graha, and its japam counter must chant exactly that text.
// Run: npx tsx --test src/data/__tests__/grahaBeejJapa.test.ts

test('every graha has a beej japam entry whose line is its GRAHA_UPAY mantra', () => {
  assert.deepEqual(Object.keys(GRAHA_BEEJ_JAPA_ID).sort(), Object.keys(GRAHA_UPAY).sort());
  for (const [graha, id] of Object.entries(GRAHA_BEEJ_JAPA_ID)) {
    const upay = GRAHA_UPAY[graha as keyof typeof GRAHA_UPAY];
    const mantra = getJapamMantra(id);
    assert.ok(japamMantras.includes(mantra), `${id} is a list mantra`);
    assert.deepEqual(mantra.lines, [upay.mantraHi], `${id} chants the upay text`);
    assert.ok(mantra.deities.includes('navagraha'), `${id} is listed under Navagraha`);
    assert.ok(mantra.sub.includes(upay.vaarHi) && mantra.subEn.includes(upay.vaarEn), `${id} names the upay day`);
  }
});

test('beej meanings frame the japa as a practice, never a fix', () => {
  for (const id of Object.values(GRAHA_BEEJ_JAPA_ID)) {
    const { meaningHi, meaningEn } = getJapamMantra(id);
    assert.ok(meaningEn.includes('not a fix or a guarantee'), id);
    assert.ok(meaningHi.includes('कोई उपचार या गारंटी नहीं'), id);
  }
});

test('graha beej mantras stay off the verse of the day; the deity mantras join it', () => {
  const sources = new Set(getVersePool().map((v) => v.sourceId));
  for (const id of Object.values(GRAHA_BEEJ_JAPA_ID)) assert.equal(sources.has(id), false, id);
  assert.ok(sources.has('ganapati-gam-mantra'));
});

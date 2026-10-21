import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  allSlokaJapaIds,
  findJapamMantra,
  getJapamMantra,
  japamMantras,
  slokaJapaId,
  slokaJapaSourceIds,
} from '../japam';
import { library } from '../texts';

// Sloka japa (design.md §35.1, RULEBOOK §3): any shloka of a stotram-category
// text can be chanted on the mala like a mantra.
// Run: npx tsx --test src/data/__tests__/slokaJapa.test.ts

test('every active stotram-category library entry is a sloka-japa source, and nothing else is', () => {
  const stotramIds = library
    .filter((e) => e.category === 'stotram' && e.status === 'active')
    .map((e) => e.id);
  assert.deepEqual([...slokaJapaSourceIds].sort(), [...stotramIds].sort());
});

test('every recited shloka resolves to a counter entry like a mantra', () => {
  const ids = allSlokaJapaIds();
  assert.ok(ids.length > slokaJapaSourceIds.length);
  assert.equal(new Set(ids).size, ids.length, 'sloka ids are unique');
  for (const id of ids) {
    const m = findJapamMantra(id);
    assert.ok(m?.sloka, `${id} resolves`);
    assert.equal(m.id, id);
    assert.ok(m.nameHi.includes(' · ') && m.nameEn.includes(' · '), `${id} names its stotra and shloka`);
    assert.ok(m.lines.length > 0 && m.lines.every((l) => l.trim()), `${id} has its lines`);
    assert.ok(m.linesEn.length > 0, `${id} has its transliteration`);
    assert.ok(m.meaningHi.trim() && m.meaningEn.trim(), `${id} carries its meaning`);
    assert.equal(getJapamMantra(id), m, `${id} resolves through getJapamMantra too`);
    assert.equal(findJapamMantra(id), m, `${id} identity is stable`);
  }
});

test('the reader page maps to the shloka on screen; a title card starts the first shloka', () => {
  // Shiva Stotram ch. 4 (Shiv Tandav): index 0 is the title card, index 5 is shloka 5.
  assert.equal(slokaJapaId('shiva-strotam', 4, 5), 'sloka.shiva-strotam.4.5');
  assert.equal(slokaJapaId('shiva-strotam', 4, 0), 'sloka.shiva-strotam.4.1');
  const tandav5 = findJapamMantra('sloka.shiva-strotam.4.5');
  assert.equal(tandav5?.nameHi, 'शिव ताण्डव स्तोत्रम् · श्लोक 5');
  assert.equal(tandav5?.nameEn, 'Shiv Tandav Stotram · Shloka 5');
  assert.ok(tandav5?.lines[0].startsWith('सहस्रलोचन'));
  // Bajrang Baan's verse 0 is the opening doha — a recited shloka, with its own label.
  assert.equal(slokaJapaId('bajrang-baan', 1, 0), 'sloka.bajrang-baan.1.0');
  assert.equal(findJapamMantra('sloka.bajrang-baan.1.0')?.nameHi, 'बजरंग बाण · दोहा');
  // A stotra spanning chapters names the part too.
  assert.equal(findJapamMantra('sloka.vishnu-sahasranama.2.1')?.nameEn, 'Vishnu Sahasranama Excerpt · Dhyanam · Shloka 1');
  // Registry readers have one chapter.
  assert.equal(slokaJapaId('krishna-stuti', 1, 2), 'sloka.krishna-stuti.1.3');
  assert.equal(slokaJapaId('hanuman-chalisa', 1, 0), null);
});

test('a shloka that is also a list mantra opens that mantra, so one chant keeps one count', () => {
  // Shiva Stotram ch. 3 is the Mahamrityunjaya mantra: its title card and shloka both open the list entry.
  assert.equal(slokaJapaId('shiva-strotam', 3, 1), 'mahamrityunjaya-mantra');
  assert.equal(slokaJapaId('shiva-strotam', 3, 0), 'mahamrityunjaya-mantra');
  const mantra = getJapamMantra('mahamrityunjaya-mantra');
  const sloka = findJapamMantra('sloka.shiva-strotam.3.1');
  assert.ok(sloka, 'the sloka id still resolves for counts and alarms made before the alias');
  assert.deepEqual(mantra.lines, sloka.lines);
  assert.deepEqual(mantra.linesEn, sloka.linesEn);
});

test('sloka ids are URL-safe (the Japam widget deep link carries them)', () => {
  for (const id of allSlokaJapaIds()) assert.equal(encodeURIComponent(id), id);
});

test('malformed or unknown sloka ids do not resolve', () => {
  for (const id of [
    'sloka.',
    'sloka.shiva-strotam',
    'sloka.shiva-strotam.4',
    'sloka.shiva-strotam.4.0',
    'sloka.shiva-strotam.4.05',
    'sloka.shiva-strotam.4.99',
    'sloka.shiva-strotam.9.1',
    'sloka.shiva-strotam.0.1',
    'sloka.hanuman-chalisa.1.1',
    'shiva-strotam.4.5',
  ]) {
    assert.equal(findJapamMantra(id), null, id);
  }
  assert.throws(() => getJapamMantra('sloka.shiva-strotam.4.99'));
});

test('slokas never join the mantra list', () => {
  assert.equal(japamMantras.some((m) => m.sloka), false);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  allStotramPaathIds,
  findJapamMantra,
  getJapamMantra,
  japamMantras,
  paathSourceIds,
  stotramPaathId,
} from '../japam';
import { library } from '../texts';

// Stotra paath as japa (design.md §35.1, RULEBOOK §3): every stotram-category
// text can be counted on the mala, one bead per complete recitation.
// Run: npx tsx --test src/data/__tests__/stotramPaath.test.ts

test('every active stotram-category library entry is a paath source, and nothing else is', () => {
  const stotramIds = library
    .filter((e) => e.category === 'stotram' && e.status === 'active')
    .map((e) => e.id);
  assert.deepEqual([...paathSourceIds].sort(), [...stotramIds].sort());
});

test('every paath id resolves to a counter entry with its full text', () => {
  const ids = allStotramPaathIds();
  assert.ok(ids.length >= paathSourceIds.length);
  assert.equal(new Set(ids).size, ids.length, 'paath ids are unique');
  for (const id of ids) {
    const m = findJapamMantra(id);
    assert.ok(m?.paath, `${id} resolves`);
    assert.equal(m.id, id);
    assert.ok(m.nameHi.trim() && m.nameEn.trim(), `${id} is named`);
    assert.ok(m.lines.length > 0 && m.linesEn.length > 0, `${id} has an opening verse`);
    const verses = m.paath.parts.flatMap((p) => p.verses);
    assert.equal(m.paath.verseCount, verses.length, `${id} verse count`);
    assert.ok(verses.length > 0, `${id} has verses`);
    for (const v of verses) {
      assert.ok(v.lines.length > 0 && v.lines.every((l) => l.trim()), `${id}: empty line`);
      assert.ok(v.linesEn.length > 0, `${id}: missing transliteration`);
    }
    assert.equal(getJapamMantra(id), m, `${id} resolves through getJapamMantra too`);
    assert.equal(findJapamMantra(id), m, `${id} identity is stable`);
  }
});

test('title cards are skipped but every recited verse is kept', () => {
  // Shiva Stotram ch. 4 (Shiv Tandav) ships 17 entries: the title card + 16 shlokas.
  const tandav = findJapamMantra('paath.shiva-strotam.4');
  assert.equal(tandav?.paath?.verseCount, 16);
  assert.ok(!tandav?.lines[0].startsWith('॥'), 'opening line is a shloka, not the title');
  // Bajrang Baan's verse 0 is the opening doha — recited, not a title card.
  assert.equal(findJapamMantra('paath.bajrang-baan')?.paath?.verseCount, 20);
  // Vishnu Sahasranama is one stotra across four chapters.
  const vs = findJapamMantra('paath.vishnu-sahasranama');
  assert.equal(vs?.paath?.parts.length, 4);
});

test('paath ids are URL-safe (the Japam widget deep link carries them)', () => {
  for (const id of allStotramPaathIds()) assert.equal(encodeURIComponent(id), id);
});

test('stotramPaathId maps a reader to its paath', () => {
  assert.equal(stotramPaathId('shiva-strotam', 4), 'paath.shiva-strotam.4');
  assert.equal(stotramPaathId('shiva-strotam'), null, 'a multi-hymn section needs the chapter');
  assert.equal(stotramPaathId('vishnu-sahasranama', 3), 'paath.vishnu-sahasranama');
  assert.equal(stotramPaathId('krishna-stuti'), 'paath.krishna-stuti');
  assert.equal(stotramPaathId('hanuman-chalisa', 1), null);
});

test('malformed or unknown paath ids do not resolve', () => {
  for (const id of [
    'paath.',
    'paath.shiva-strotam',
    'paath.shiva-strotam.0',
    'paath.shiva-strotam.01',
    'paath.shiva-strotam.9',
    'paath.vishnu-sahasranama.1',
    'paath.hanuman-chalisa',
    'shiva-strotam.4',
  ]) {
    assert.equal(findJapamMantra(id), null, id);
  }
  assert.throws(() => getJapamMantra('paath.shiva-strotam.9'));
});

test('paath entries never join the mantra list', () => {
  assert.equal(japamMantras.some((m) => m.paath), false);
});

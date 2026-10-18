import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { findDevanagariDefects } from '../devanagariWellFormed';
import { toGujarati, toKannada } from '../../utils/transliterate';
import { aartiIndexById } from '../aarti/ids';

const data = JSON.parse(readFileSync(resolve('src/data/aarti/jay-adhya-shakti.json'), 'utf8'));

test('places the unity stanza before the signature in the maintainer-approved ending', () => {
  assert.equal(data.counts.totalVerses, 21);
  assert.equal(data.verses.length, 21);
  // The first seventeen positions stay stable; existing verse IDs keep their text.
  assert.equal(createHash('sha256').update(JSON.stringify(data.verses.slice(0, 17))).digest('hex'),
    '4dc904307226671f7167aaa41902a75dd2b380824e2c1379ddc695a6b877da05');
  assert.equal(aartiIndexById['jay-adhya-shakti'], 10);
  const openings = ['एकमे एक स्वरूप', 'शिवशक्तिनी आरती', 'भाव न जाणुं', 'मानो मंडप लाल गुलाल'];
  const ids = ['jas-19', 'jas-18', 'jas-20', 'jas-21'];
  for (const [i, opening] of openings.entries()) {
    const verse = data.verses[i + 17];
    assert.equal(verse.id, ids[i]);
    assert.equal(verse.number, i + 18);
    assert.equal(verse.labelEn, `Stanza · ${i + 18}`);
    assert.equal(verse.labelHi, `पद · ${String(i + 18).replace(/\d/g, (digit) => String.fromCharCode(0x966 + Number(digit)))}`);
    assert.ok(verse.lines[0].startsWith(opening));
    assert.equal(verse.lines.at(-1), '॥ ॐ जयो जयो मा जगदंबे ॥');
  }
  assert.ok(data.verses[19].lines[1].includes('वल्लभ भट्टने आपी'));
  assert.ok(data.verses[20].lines[1].includes('अबील उडे आनंदे, गुलाल उडे आनंदे, जय बहुचर वाळी'));
});

test('closing pages retain English parity, authored meanings and valid regional scripts', () => {
  assert.equal(data.verses.slice(17).length, 4);
  const guOpenings = ['એકમે એક સ્વરૂપ', 'શિવશક્તિની આરતી', 'ભાવ ન જાણું', 'માનો મંડપ લાલ ગુલાલ'];
  for (const [i, verse] of data.verses.slice(17).entries()) {
    assert.equal(verse.lines.length, verse.linesEn.length);
    assert.ok(verse.meaningHi.trim() && verse.meaningEn.trim() && verse.meaningGu.trim());
    assert.doesNotMatch(verse.linesEn.join(' '), /[\u0900-\u097f।॥|]/);
    assert.match(verse.meaningGu, /[\u0a80-\u0aff]/);
    assert.ok(toGujarati(verse.lines[0]).startsWith(guOpenings[i]));
    for (const line of [...verse.lines, verse.meaningHi, verse.labelHi]) {
      assert.deepEqual(findDevanagariDefects(line), [], line);
      assert.doesNotMatch(toGujarati(line), /[\u0900-\u0963\u0966-\u097f]/);
      assert.doesNotMatch(toKannada(line), /[\u0900-\u0963\u0966-\u097f]/);
    }
  }
});

test('listing count and source disclosure describe the extended edition', () => {
  const catalog = readFileSync(resolve('src/data/texts.ts'), 'utf8');
  const row = catalog.slice(catalog.indexOf("id: 'jay-adhya-shakti'"), catalog.indexOf("id: 'shani-aarti'"));
  assert.match(row, /sub: '21 पद/);
  assert.match(row, /subEn: '21 verses/);
  assert.match(row, /verseCount: 21/);
  assert.match(data.source.canonicalEditionStatus, /^Pending/);
  const closing = data.source.closingStanzas;
  assert.equal(closing.retrievedOn, '2026-10-18');
  assert.ok(new Set(closing.referenceUrls.map((url: string) => new URL(url).hostname)).size >= 2);
  assert.match(closing.verificationNote, /NJ readings/);
  assert.match(closing.orderNote, /Maintainer-directed order correction/);
  assert.doesNotMatch(data.source.baseText, /stanzas.*are not included/);
});

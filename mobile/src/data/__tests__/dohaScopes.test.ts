import test from 'node:test';
import assert from 'node:assert/strict';
import { dohaIds, getDoha } from '../doha';
import { flatPoolSegments } from '../versePoolFlat';
import { suvicharDohaThoughts, suvicharDohasFor } from '../doha/suvichar';
import { suvicharDeityCatalog, suvicharDeities, parseSuvicharPreferences, MESSAGE_LIMIT } from '../suvichar';
import { suvicharSourcedThoughts, suvicharOriginalThoughts, suvicharThoughtsFor, suvicharThoughtForDay, findSuvicharThought, nextSuvicharThought, sourceForSuvichar, suvicharSourceLabel } from '../suvicharContent';
import { suvicharTemplatesFor, isSuvicharThought } from '../suvicharTemplates';
import { contentByLang } from '../../utils/localize';
const canonical = dohaIds.flatMap(id => getDoha(id).verses);
const langs = ['hi', 'en', 'gu', 'kn'] as const;

test('Daily Bhakti serves all eight canonical dohas with complete meanings', () => {
  const segments = flatPoolSegments({ isActive: id => dohaIds.some(d => d === id), nameHi: id => id, nameEn: id => id });
  assert.equal(segments.length, 2);
  assert.equal(segments.reduce((n, s) => n + s.length, 0), 8);
  for (const segment of segments) {
    const verses = getDoha(segment.sourceId as typeof dohaIds[number]).verses;
    verses.forEach((v, i) => {
      const pooled = segment.getAt(i)!;
      assert.deepEqual(pooled.textHi, v.lines);
      assert.deepEqual(pooled.textEn, v.linesEn);
      assert.equal(pooled.meaningHi, v.meaningHi);
      assert.equal(pooled.meaningEn, v.meaningEn);
      assert.deepEqual(segment.find(i), pooled);
    });
  }
});

test('Suvichar projects canonical full poems and poet credits without changing existing corpora', () => {
  assert.equal(suvicharSourcedThoughts.length, 621);
  // Doha integration must preserve the original stable IDs as newer originals are appended.
  assert.deepEqual(suvicharOriginalThoughts.slice(0, 84).map(t => t.id),
    Array.from({ length: 84 }, (_, i) => `VD-${String(i + 1).padStart(4, '0')}`));
  assert.equal(suvicharDohaThoughts.length, 8);
  assert.equal(new Set(suvicharDohaThoughts.map(t => t.id)).size, 8);
  for (const verse of canonical) {
    const thought = suvicharDohaThoughts.find(t => t.id === `DH-${verse.id}`)!;
    assert.ok(thought);
    assert.equal(thought.hi, verse.lines.join('\n'));
    assert.equal(thought.en, verse.linesEn.join('\n'));
    const source = sourceForSuvichar(thought);
    assert.equal(source.url, verse.source.referenceUrls[0]);
    assert.match(source.referenceEn, verse.id.startsWith('kabir') ? /^Kabir/ : /^Rahim/);
    assert.equal(source.modeEn, 'Romanized doha');
  }
});

test('named Ram and Hari dohas retain their deity scope across the full prepared catalogue', () => {
  const hari = ['rama','ram-lalla','ram-darbar','krishna','radha-krishna','vishnu','tirupati-balaji','khatu-shyam','sanwariya-seth','jagannath'];
  for (const deity of suvicharDeityCatalog) {
    const ids = suvicharDohasFor(deity.id).map(t => t.id);
    assert.equal(ids.includes('DH-rahim-doha-sharan'), ['rama','ram-lalla','ram-darbar'].includes(deity.id));
    assert.equal(ids.includes('DH-rahim-doha-ahankar'), hari.includes(deity.id));
    // Parshuram keeps only its own collection, so it takes none of the six general dohas.
    const general = deity.id === 'parshuram' ? 0 : 6;
    assert.equal(ids.length, general + Number(hari.includes(deity.id)) + Number(['rama','ram-lalla','ram-darbar'].includes(deity.id)));
    assert.deepEqual(suvicharThoughtsFor(deity.id).filter(t => t.id.startsWith('DH-')).map(t => t.id), ids);
  }
});

test('four-script dohas fit storage, restore favorites and keep credit only for unedited text', () => {
  for (const thought of suvicharDohaThoughts) for (const lang of langs) {
    const message = contentByLang(lang, thought.hi, thought.en);
    assert.ok(message.length <= MESSAGE_LIMIT, `${thought.id}/${lang}: ${message.length}`);
    const favorite = { deity:'rama', frame:'mandir-jharokha', name:'', message, thoughtId:thought.id };
    const saved = parseSuvicharPreferences(JSON.stringify({ ...favorite, favorites:[favorite] }));
    assert.equal(saved.message, message);
    assert.equal(saved.thoughtId, thought.id);
    assert.equal(saved.favorites[0].thoughtId, thought.id);
    assert.equal(findSuvicharThought('rama', saved.message, saved.thoughtId)?.id, thought.id);
    assert.equal(findSuvicharThought('rama', message + ' edited', thought.id), undefined);
    assert.ok(suvicharSourceLabel(thought, lang));
    assert.equal(isSuvicharThought(message), true);
  }
  for (const id of ['SV-0001','APP-01','VD-0001']) assert.equal(parseSuvicharPreferences(JSON.stringify({thoughtId:id})).thoughtId,id);
  for (const id of ['DH-../bad','DH-', 'DH-'+'a'.repeat(100)]) assert.equal(parseSuvicharPreferences(JSON.stringify({thoughtId:id})).thoughtId,'');
});

test('daily cards and Another thought reach every eligible doha without changing original priority', () => {
  for (const deity of suvicharDeityCatalog) {
    const pool = suvicharThoughtsFor(deity.id);
    const daily = pool.filter(t => t.id.startsWith('VD-') || t.id.startsWith('DH-'));
    const expectedOriginals = [...suvicharOriginalThoughts.filter(t => t.deities.includes(deity.id)), ...suvicharOriginalThoughts.filter(t => !t.deities.length)];
    assert.deepEqual(daily.slice(0, expectedOriginals.length), expectedOriginals);
    daily.forEach((thought, day) => {
      assert.equal(suvicharThoughtForDay(deity.id, day).id, thought.id);
      const card = suvicharTemplatesFor(day).find(t => t.id === `daily-${deity.id}`);
      if (suvicharDeities.some(d => d.id === deity.id)) {
        assert.ok(card, `Missing daily card for enabled deity ${deity.id}`);
        assert.equal(card.thoughtId, thought.id);
        assert.equal(card.messageHi, thought.hi);
        assert.equal(card.messageEn, thought.en);
      } else {
        assert.equal(card, undefined, `Unpublished deity ${deity.id} leaked into daily cards`);
      }
    });
    assert.equal(suvicharThoughtForDay(deity.id, -1).id, daily.at(-1)!.id);
    for (const thought of suvicharDohasFor(deity.id)) {
      const before = pool[(pool.indexOf(thought)-1+pool.length)%pool.length];
      assert.equal(nextSuvicharThought(deity.id, before.hi, before.id).id, thought.id);
    }
  }
});

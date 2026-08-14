import assert from 'node:assert/strict';

import { deities } from '../deities';
import { library } from '../texts';
import { VIDHI_ENTRIES } from '../vidhi';
import {
  _resetSearchIndexForTest,
  getSearchIndex,
  runSearch,
  VERSE_RESULT_CAP,
} from '../searchIndex';

_resetSearchIndexForTest();
const index = getSearchIndex();

// Every active, non-hidden section in `library` is represented in the index.
{
  const activeIds = library
    .filter((e) => e.status === 'active' && !e.hidden)
    .map((e) => e.id);
  const indexedSourceIds = new Set(index.sections.map((s) => s.sourceId));
  for (const id of activeIds) {
    assert.ok(
      indexedSourceIds.has(id),
      `library entry '${id}' is missing from search index sections`
    );
  }
}

// Every active, non-hidden section also produces at least one verse entry —
// otherwise the user can't find any verses for that section. Mirrors the
// RULEBOOK §7 contract for new sections.
{
  const activeIds = library
    .filter((e) => e.status === 'active' && !e.hidden)
    .map((e) => e.id);
  const verseSourceIds = new Set(index.verses.map((v) => v.sourceId));
  for (const id of activeIds) {
    assert.ok(
      verseSourceIds.has(id),
      `library entry '${id}' has zero verse entries in the search index — ` +
        `add a new branch in searchIndex.buildVerseEntries() for its shape`
    );
  }
}

// Section count matches library count plus one row per published vidhi
// (PRD-19 Phase 2B — vidhi rows ride the section group).
{
  const activeCount = library.filter((e) => e.status === 'active' && !e.hidden)
    .length;
  assert.equal(index.sections.length, library.length + VIDHI_ENTRIES.length);
  assert.ok(activeCount > 0);
}

// Every published vidhi is findable by title and by the "पूजा विधि" keyword,
// and its row carries the vidhi id as sourceId so SearchScreen can route it
// to VidhiDetail. Vidhis are procedures, not texts — they contribute no verse
// entries.
{
  const indexedSourceIds = new Set(index.sections.map((s) => s.sourceId));
  for (const vidhi of VIDHI_ENTRIES) {
    assert.ok(indexedSourceIds.has(vidhi.id), `vidhi '${vidhi.id}' missing from section rows`);
  }
  const verseSourceIds = new Set(index.verses.map((v) => v.sourceId));
  for (const vidhi of VIDHI_ENTRIES) {
    assert.ok(!verseSourceIds.has(vidhi.id), `vidhi '${vidhi.id}' must not produce verse rows`);
  }

  const byTitle = runSearch('घटस्थापना', index);
  assert.ok(
    byTitle.sections.some((h) => h.entry.sourceId === 'navratri-ghatasthapana'),
    'Devanagari title query should find the Ghatasthapana vidhi row'
  );
  const byKeyword = runSearch('पूजा विधि', index);
  for (const vidhi of VIDHI_ENTRIES) {
    assert.ok(
      byKeyword.sections.some((h) => h.entry.sourceId === vidhi.id),
      `"पूजा विधि" should surface vidhi '${vidhi.id}'`
    );
  }
  const byLatin = runSearch('karwa chauth', index);
  assert.ok(
    byLatin.sections.some((h) => h.entry.sourceId === 'karwa-chauth-puja'),
    'Latin title query should find the Karwa Chauth vidhi row'
  );
}

// Every deity is indexed.
{
  assert.equal(index.deities.length, deities.length);
  assert.ok(index.deities.some((d) => d.deityId === 'saraswati'));
}

// Hanuman query returns multiple sections (chalisa, ashtak, aarti, sankat-mochan).
{
  const res = runSearch('hanuman', index);
  const sectionIds = res.sections.map((h) => h.entry.sourceId);
  assert.ok(sectionIds.includes('hanuman-chalisa'), 'expected hanuman-chalisa in results');
  assert.ok(sectionIds.includes('hanuman-ashtak'), 'expected hanuman-ashtak in results');
  assert.ok(sectionIds.includes('hanuman-aarti'), 'expected hanuman-aarti in results');
  assert.ok(res.deities.some((d) => d.entry.deityId === 'hanuman'));
}

// Devanagari query finds Devanagari verses.
{
  const res = runSearch('हनुमान', index);
  assert.ok(res.sections.length > 0);
}

// Theerth detail prose is searchable, not just temple names/locations.
{
  const res = runSearch('Somraj', index);
  const hit = res.verses.find((v) => v.entry.sourceId === 'famous-theerth');
  assert.ok(hit, 'expected Somnath origin-story text to be indexed under theerth');
  assert.equal(hit.entry.labelEn, 'Somnath');
}

// BG 2.47 query finds the right verse via a partial of the famous line.
{
  const res = runSearch('कर्मण्ये', index);
  const gitaHits = res.verses.filter((v) => v.entry.sourceId === 'bhagavad-gita');
  assert.ok(gitaHits.length > 0, 'expected at least one Gita verse hit');
  const ch2 = gitaHits.find((h) => h.entry.chapter === 2);
  assert.ok(ch2, 'expected a Gita ch.2 hit for `कर्मण्ये`');
}

// IAST-folded query against an IAST corpus. The Gita ships transliteration
// with whitespace between words, so a word-shaped query (`karmany`) hits the
// substring path; a glued-word query would not (by design — we don't strip
// whitespace inside the field).
{
  const res = runSearch('karmany', index);
  const gitaHits = res.verses.filter((v) => v.entry.sourceId === 'bhagavad-gita');
  assert.ok(gitaHits.length > 0, 'IAST query should find Gita verses');
}

// Diacritic-bearing IAST query lands at the same normalized form as the
// ASCII-folded version, so `kṛṣṇa` and `krsna` find the same verses.
{
  const a = runSearch('kṛṣṇa', index);
  const b = runSearch('krsna', index);
  assert.equal(a.verses.length, b.verses.length);
}

// Empty query yields empty results, not a crash.
{
  const res = runSearch('', index);
  assert.equal(res.sections.length, 0);
  assert.equal(res.deities.length, 0);
  assert.equal(res.verses.length, 0);
  assert.equal(res.versesCapped, false);
}

// Whitespace-only query is treated as empty.
{
  const res = runSearch('   ', index);
  assert.equal(res.verses.length, 0);
}

// Verses are capped at VERSE_RESULT_CAP and versesCapped flag is set.
{
  // 'a' is a substring of countless English/IAST words → forces overflow.
  const res = runSearch('a', index);
  assert.ok(res.verses.length <= VERSE_RESULT_CAP);
  if (res.verses.length === VERSE_RESULT_CAP) {
    assert.equal(res.versesCapped, true);
  }
}

// Exact section title outranks substring hits in the same group.
{
  const res = runSearch('hanuman chalisa', index);
  const top = res.sections[0];
  assert.ok(top, 'expected at least one section hit');
  assert.equal(top.entry.sourceId, 'hanuman-chalisa');
}

// PRD-B purpose names are searchable as section metadata, so users can type an
// intent instead of a title.
{
  const res = runSearch('protection', index);
  const sectionIds = res.sections.map((h) => h.entry.sourceId);
  assert.ok(sectionIds.includes('rama-raksha-stotra'), 'protection should find Rama Raksha Stotra');
  assert.ok(sectionIds.includes('durga-kavach'), 'protection should find Durga Kavach');
}

{
  const res = runSearch('सुरक्षा', index);
  const sectionIds = res.sections.map((h) => h.entry.sourceId);
  assert.ok(sectionIds.includes('rama-raksha-stotra'), 'सुरक्षा should find Rama Raksha Stotra');
}

// Rebuild is idempotent — second call returns the same instance.
{
  const a = getSearchIndex();
  const b = getSearchIndex();
  assert.equal(a, b);
}

// Verse entries carry routing data — sourceId always, chapter for chaptered sections.
{
  const gitaVerses = index.verses.filter((v) => v.sourceId === 'bhagavad-gita');
  assert.ok(gitaVerses.length > 100, 'expected >100 Gita verses indexed');
  for (const v of gitaVerses.slice(0, 5)) {
    assert.ok(v.chapter != null, 'gita verse must carry chapter');
    assert.ok(typeof v.verseIndex === 'number');
  }
  const chalisaVerses = index.verses.filter((v) => v.sourceId === 'hanuman-chalisa');
  assert.ok(chalisaVerses.length > 0);
  // Chalisas have no chapter — should be undefined, not 0.
  assert.equal(chalisaVerses[0]!.chapter, undefined);
}

// Vālmīki Rāmāyaṇa verses are searchable in Devanagari and in IAST, and every
// hit carries the kāṇḍa as `chapter` so the result row can route into the
// chaptered reader (RULEBOOK §8 Path A).
{
  const valmikiVerses = index.verses.filter((v) => v.sourceId === 'valmiki-ramayan');
  assert.equal(valmikiVerses.length, 28, 'expected the 28 lightweight Valmiki Ramayan search anchors');
  for (const v of valmikiVerses) {
    assert.ok(v.chapter != null, 'valmiki-ramayan verse must carry its kāṇḍa as chapter');
    assert.ok(v.chapter >= 1 && v.chapter <= 7, `unexpected kāṇḍa ${v.chapter}`);
    assert.ok(typeof v.verseIndex === 'number');
  }

  const hindi = runSearch('मा निषाद', index);
  assert.ok(
    hindi.verses.some((h) => h.entry.sourceId === 'valmiki-ramayan'),
    'Devanagari query should reach the Valmiki Ramayan verse'
  );

  const latin = runSearch('anirveda', index);
  assert.ok(
    latin.verses.some((h) => h.entry.sourceId === 'valmiki-ramayan'),
    'IAST-folded query should reach the Valmiki Ramayan verse'
  );

  const section = runSearch('Valmiki Ramayan', index);
  assert.equal(section.sections[0]?.entry.sourceId, 'valmiki-ramayan');
}

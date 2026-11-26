import { library } from '../texts';
import { ashtakamIds, getAshtakam } from '../ashtakam';
import { suktamIds, getSuktam } from '../suktam';
import { kavachamIds, getKavacham } from '../kavacham';
import { stutiIds, getStuti } from '../stuti';
import { getVersePool, DAILY_POOL_EXCLUDED_SOURCES, isDailyPoolSource } from '../versePool';
import { parshuramPublished } from '../parshuramAvailability';
import { devotionalArtForVerse, isDevotionalSubjectArt } from '../devotionalShareArt';

// Named-subject portraits that still have a pooled verse after chalisas and
// aartis left the daily rotation. Each surviving subject is now carried by an
// ashtakam, stotram or sanskar rather than its aarti/chalisa. (Portraits whose
// only backing was an aarti/chalisa — gayatri, khatu-shyam, santoshi, ahoi,
// vaishno, ekadashi, shakambhari — keep their masters but no longer surface.)
const sourceGroups = {
  lakshmi: ['mahalakshmi-ashtakam'],
  shani: ['shani-ashtakam'],
  dattatreya: ['datta-ashtakam'],
  ganga: ['gangashtakam'],
  kali: ['kalika-ashtakam'],
  kubera: ['kubera-stotram'],
  radha: ['radhashtakam'],
  kartikeya: ['subrahmanya-ashtakam'],
  narasimha: ['narasimha-ashtakam'],
  navagraha: ['navagraha-stotram'],
  ...(parshuramPublished ? { parshuram: ['parshuram-stotram'] } : {}),
  tulsi: ['tulsi-puja'],
};

it('gives every pooled named-subject its distinct portrait', () => {
  const pool = getVersePool();
  for (const [art, sources] of Object.entries(sourceGroups)) {
    expect(isDevotionalSubjectArt(art as never)).toBe(true);
    for (const sourceId of sources) {
      const verses = pool.filter(v => v.sourceId === sourceId);
      expect(verses.length).toBeGreaterThan(0);
      for (const verse of verses) expect(devotionalArtForVerse(verse)).toBe(art);
    }
  }
});

it('pools the flat ashtakam/suktam/kavach/stuti sources without the neutral fallback', () => {
  const pool = getVersePool();
  // Compare the owning registries, not yesterday's growing pool size.
  const entries = [
    ...ashtakamIds.map(id => ({id, count:getAshtakam(id).verses.length})),
    ...suktamIds.map(id => ({id, count:getSuktam(id).verses.length})),
    ...kavachamIds.map(id => ({id, count:getKavacham(id).verses.length})),
    ...stutiIds.map(id => ({id, count:getStuti(id).verses.length})),
  ].filter(({id}) => library.some(e => e.id===id && e.status==='active' && !e.hidden && !['kabir-bhakti-dohe','rahim-bhakti-dohe'].includes(id)) && isDailyPoolSource(id));
  for (const {id,count} of entries) {
    const verses=pool.filter(v=>v.sourceId===id);
    expect(verses).toHaveLength(count);
    for(const verse of verses) expect(devotionalArtForVerse(verse)).not.toBe('prayer');
  }
  expect(pool.some(v=>v.sourceId==='durga-kavach')).toBe(false);
  // Daily-pool curation (Nov 2026): these registered sources are held out of the
  // verse of the day while keeping their own readers.
  const pooledSources = new Set(pool.map(v => v.sourceId));
  for (const id of DAILY_POOL_EXCLUDED_SOURCES) expect(pooledSources.has(id)).toBe(false);
  // The three Durga Saptashati stuti chapters and the invocation/dhyānam/
  // phalaśruti of Vishnu Sahasranama stay; the thousand-name chapter does not.
  for (const id of ['durga-saptashati-chapter-4','durga-saptashati-chapter-5','durga-saptashati-chapter-11','rama-raksha-stotra','vishnu-sahasranama'])
    expect(pooledSources.has(id)).toBe(true);
  expect(pool.some(v => v.sourceId==='vishnu-sahasranama' && v.chapter===3)).toBe(false);
  for (const sourceId of ['kabir-bhakti-dohe', 'rahim-bhakti-dohe', 'unknown-source', 'matribhumi-vandana', 'sandhya-deepam']) {
    expect(devotionalArtForVerse({ sourceId, verseIndex: 0 })).toBe('prayer');
  }
});

it('no longer surfaces any chalisa or aarti in the daily pool', () => {
  const sources = new Set(getVersePool().map(v => v.sourceId));
  expect([...sources].filter(id => id.includes('chalisa'))).toEqual([]);
  // The 22 aarti ids (mostly `*-aarti`, plus a few titled forms).
  for (const id of ['om-jai-jagdish', 'jai-ambe-gauri', 'aarti-kunj-bihari', 'jay-adhya-shakti', 'ambe-tu-hai-jagdambe-kali', 'hanuman-aarti']) {
    expect(sources.has(id)).toBe(false);
  }
});

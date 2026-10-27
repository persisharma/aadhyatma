import { getVersePool } from '../versePool';
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
  expect(pool).toHaveLength(1676);
  // The flat sources that remain after chalisas and aartis left the rotation.
  const flatSourceIds = new Set(["lingashtakam", "madhurashtakam", "achyutashtakam", "mahalakshmi-ashtakam", "surya-ashtakam", "radhashtakam", "subrahmanya-ashtakam", "gangashtakam", "bhavani-ashtakam", "narasimha-ashtakam", "datta-ashtakam", "shani-ashtakam", "kalika-ashtakam", "rudrashtakam", "devi-suktam", "purusha-suktam", "narayana-suktam", "rama-raksha-stotra", "ganesha-kavacham", "shiva-kavacham", "durga-kavach", "krishna-stuti", "durga-stuti-arjuna", "kubera-stotram", "navagraha-stotram"]);
  const flat = pool.filter(v => flatSourceIds.has(v.sourceId));
  expect(new Set(flat.map(v => v.sourceId)).size).toBe(25);
  for (const verse of flat) expect(devotionalArtForVerse(verse)).not.toBe('prayer');
  for (const sourceId of ['unknown-source', 'matribhumi-vandana', 'sandhya-deepam']) {
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

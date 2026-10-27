import { getVersePool } from '../versePool';
import { devotionalArtForVerse, devotionalSubjectArt } from '../devotionalShareArt';

const sourceGroups = {
  lakshmi: ['lakshmi-chalisa', 'om-jai-lakshmi-mata', 'mahalakshmi-ashtakam'],
  gayatri: ['gayatri-chalisa', 'gayatri-aarti'],
  'khatu-shyam': ['khatu-shyam-chalisa', 'khatu-shyam-aarti'],
  shani: ['shani-aarti', 'shani-ashtakam'],
  dattatreya: ['dattatreya-aarti', 'datta-ashtakam'],
  ganga: ['om-jai-gange-mata', 'gangashtakam'],
  kali: ['ambe-tu-hai-jagdambe-kali', 'kalika-ashtakam'],
  kubera: ['kubera-aarti', 'kubera-stotram'],
  santoshi: ['santoshi-mata-aarti'], ahoi: ['ahoi-mata-aarti'],
  vaishno: ['vaishno-devi-aarti'], ekadashi: ['ekadashi-mata-aarti'],
  tulsi: ['tulsi-aarti'], shakambhari: ['shakambhari-aarti'],
  radha: ['radhashtakam'], kartikeya: ['subrahmanya-ashtakam'],
  narasimha: ['narasimha-ashtakam'], navagraha: ['navagraha-stotram'],
};

it('gives every formerly neutral verse its named subject, including distinct Devi forms', () => {
  const pool = getVersePool();
  let covered = 0;
  expect(Object.keys(devotionalSubjectArt).filter(a => a !== 'mahakaal').sort()).toEqual(Object.keys(sourceGroups).sort());
  for (const [art, sources] of Object.entries(sourceGroups)) {
    for (const sourceId of sources) {
      const verses = pool.filter(v => v.sourceId === sourceId);
      expect(verses.length).toBeGreaterThan(0);
      for (const verse of verses) expect(devotionalArtForVerse(verse)).toBe(art);
      covered += verses.length;
    }
  }
  expect(covered).toBe(330);
});

it('covers all 1,014 additions without changing the neutral fallback for general prayers', () => {
  const pool = getVersePool();
  expect(pool).toHaveLength(2387);
  // Pin this PR's sources rather than a prefix that unrelated new japam entries can move.
  const addedSourceIds = new Set(["hanuman-chalisa", "shiv-chalisa", "durga-chalisa", "ganesh-chalisa", "gayatri-chalisa", "ram-chalisa", "krishna-chalisa", "vishnu-chalisa", "saraswati-chalisa", "khatu-shyam-chalisa", "lakshmi-chalisa", "surya-chalisa", "om-jai-jagdish", "hanuman-aarti", "jai-ganesh-deva", "om-jai-shiv-omkara", "jai-ambe-gauri", "aarti-kunj-bihari", "saraswati-aarti", "gayatri-aarti", "khatu-shyam-aarti", "om-jai-lakshmi-mata", "jay-adhya-shakti", "shani-aarti", "dattatreya-aarti", "om-jai-gange-mata", "ambe-tu-hai-jagdambe-kali", "kubera-aarti", "santoshi-mata-aarti", "ahoi-mata-aarti", "vaishno-devi-aarti", "ekadashi-mata-aarti", "tulsi-aarti", "shakambhari-aarti", "lingashtakam", "madhurashtakam", "achyutashtakam", "mahalakshmi-ashtakam", "surya-ashtakam", "radhashtakam", "subrahmanya-ashtakam", "gangashtakam", "bhavani-ashtakam", "narasimha-ashtakam", "datta-ashtakam", "shani-ashtakam", "kalika-ashtakam", "rudrashtakam", "devi-suktam", "purusha-suktam", "narayana-suktam", "rama-raksha-stotra", "ganesha-kavacham", "shiva-kavacham", "durga-kavach", "krishna-stuti", "durga-stuti-arjuna", "kubera-stotram", "navagraha-stotram"]);
  const added = pool.filter(v => addedSourceIds.has(v.sourceId));
  expect(added).toHaveLength(1014);
  expect(new Set(added.map(v => v.sourceId)).size).toBe(59);
  for (const verse of added) expect(devotionalArtForVerse(verse)).not.toBe('prayer');
  for (const sourceId of ['unknown-source', 'matribhumi-vandana', 'sandhya-deepam']) {
    expect(devotionalArtForVerse({ sourceId, verseIndex: 0 })).toBe('prayer');
  }
});

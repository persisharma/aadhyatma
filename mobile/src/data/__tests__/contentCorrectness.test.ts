/**
 * Content correctness validation tests.
 * Verifies all religious content against internet-verified canonical sources.
 * Run: npx tsx src/data/__tests__/contentCorrectness.test.ts
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { library } from '../texts';
import { deities } from '../deities';

const DATA = join(__dirname, '..');
const TRANSLATIONS = join(DATA, '..', '..', '.translations');

function readJson(rel: string) {
  return JSON.parse(readFileSync(join(DATA, rel), 'utf8'));
}

function readTranslationJson(rel: string) {
  return JSON.parse(readFileSync(join(TRANSLATIONS, rel), 'utf8'));
}

const VERIFIED_NATIVE_MEANING_SECTIONS = [
  {
    id: 'hanuman-chalisa',
    fusionFile: 'hanuman-chalisa.fusion.json',
    dataFiles: ['hanuman-chalisa/hanuman-chalisa.json'],
  },
  {
    id: 'shiv-chalisa',
    fusionFile: 'shiv-chalisa.fusion.json',
    dataFiles: ['shiv-chalisa/shiv-chalisa.json'],
  },
  {
    id: 'ganesh-chalisa',
    fusionFile: 'ganesh-chalisa.fusion.json',
    dataFiles: ['ganesh-chalisa/ganesh-chalisa.json'],
  },
  {
    id: 'durga-chalisa',
    fusionFile: 'durga-chalisa.fusion.json',
    dataFiles: ['durga-chalisa/durga-chalisa.json'],
  },
  {
    id: 'aartis',
    fusionFile: 'aartis.fusion.json',
    dataFiles: [
      'aarti/aarti-kunj-bihari.json',
      'aarti/hanuman-aarti.json',
      'aarti/jai-ambe-gauri.json',
      'aarti/jai-ganesh-deva.json',
      'aarti/om-jai-jagdish.json',
      'aarti/om-jai-shiv-omkara.json',
      'aarti/saraswati-aarti.json',
    ],
  },
] as const;

// ─── 1. Deity type correctness ───────────────────────────────────────────────

const omJaiJagdish = readJson('aarti/om-jai-jagdish.json');
assert.equal(omJaiJagdish.deity, 'vishnu', 'Om Jai Jagdish deity should be vishnu');
assert.doesNotMatch(JSON.stringify(omJaiJagdish), /स्वमी/, 'Om Jai Jagdish should spell स्वामी correctly');

const japam = readJson('japam/japam.json');
const gayatri = japam.mantras.find((m: any) => m.id === 'gayatri-mantra');
assert.ok(gayatri, 'Gayatri mantra should exist');
assert.deepEqual(gayatri.deities, ['savitr'], 'Gayatri deity should be savitr');

// Rule 10.9: deity display names must be the recognizable devotional name.
// The 'savitr' tag is theologically correct, but users identify this deity as Gayatri.
const savitrDeity = deities.find((d) => d.id === 'savitr');
assert.ok(savitrDeity, 'savitr deity should exist in deities array');
assert.equal(savitrDeity.nameEn, 'Maa Gayatri', 'Rule 10.9: savitr deity must display as "Maa Gayatri", not "Savitr Deva"');
assert.equal(savitrDeity.nameHi, 'माँ गायत्री', 'Rule 10.9: savitr deity must display as "माँ गायत्री", not "सवितृ देव"');

// Vishnu Sahasranama is a hymn to Vishnu (the thousand names of Vishnu), so it
// must surface under the Vishnu deity — not Krishna/Rama (his avatars). Guards
// the #99 retag from regressing back to ['krishna', 'rama'].
const vishnuSahasranama = library.find((entry) => entry.id === 'vishnu-sahasranama');
assert.ok(vishnuSahasranama, 'vishnu-sahasranama should exist in library');
assert.deepEqual(
  vishnuSahasranama.deities,
  ['vishnu'],
  'Vishnu Sahasranama must be tagged under the Vishnu deity only'
);

// Newly-added discoverable content must carry addedInVersion, or NewContentContext
// seeds it as already-known for upgrading users and the NEW badge never shows.
for (const id of ['saraswati-stotram', 'saraswati-aarti', 'vidyarambha-prarthana']) {
  const entry = library.find((e) => e.id === id);
  assert.ok(entry, `${id} should exist in library`);
  assert.ok(entry.addedInVersion, `${id} must set addedInVersion so upgraders see its NEW badge`);
}
// The sanskar batch debuted together, so every sanskar entry must carry addedInVersion.
for (const entry of library.filter((e) => e.category === 'sanskar')) {
  assert.ok(entry.addedInVersion, `sanskar entry ${entry.id} must set addedInVersion`);
}

// ─── 2. Aarti verse counts (verified from internet) ─────────────────────────

const hanumanAarti = readJson('aarti/hanuman-aarti.json');
assert.ok(
  hanumanAarti.verses.length >= 13,
  `Hanuman Aarti should have >= 13 verses, got ${hanumanAarti.verses.length}`
);

const sankatMochan = readJson('hanuman-ashtak/chapter-01.json');
assert.ok(
  sankatMochan.verses.length >= 9,
  `Sankat Mochan (in stotram) should have >= 9 verses (8 pada + doha), got ${sankatMochan.verses.length}`
);

const jaiAmbeGauri = readJson('aarti/jai-ambe-gauri.json');
assert.ok(
  jaiAmbeGauri.verses.length >= 12,
  `Jai Ambe Gauri should have >= 12 verses, got ${jaiAmbeGauri.verses.length}`
);

const aartiKunjBihari = readJson('aarti/aarti-kunj-bihari.json');
assert.ok(
  aartiKunjBihari.verses.length >= 4 && aartiKunjBihari.verses.length <= 6,
  `Aarti Kunj Bihari should have 4-6 verses (4 canonical + refrain), got ${aartiKunjBihari.verses.length}`
);

const jaiGaneshDeva = readJson('aarti/jai-ganesh-deva.json');
assert.ok(
  jaiGaneshDeva.verses.length >= 5,
  `Jai Ganesh Deva should have >= 5 verses, got ${jaiGaneshDeva.verses.length}`
);

const omJaiShivOmkara = readJson('aarti/om-jai-shiv-omkara.json');
assert.ok(
  omJaiShivOmkara.verses.length >= 8,
  `Om Jai Shiv Omkara should have >= 8 verses, got ${omJaiShivOmkara.verses.length}`
);
for (const v of omJaiShivOmkara.verses) {
  assert.equal(v.lines.length, 2, `Om Jai Shiv Omkara ${v.id} should stay as 2 display rows`);
  assert.equal(v.linesEn.length, 2, `Om Jai Shiv Omkara ${v.id} romanization should stay as 2 display rows`);
}

// ─── 3. Sankat Mochan has correct Tulsidas refrain ───────────────────────────

const SM_REFRAIN = 'संकटमोचन नाम तिहारो';
const smBodyVerses = sankatMochan.verses.filter((v: any) => v.number >= 0 && v.number <= 7);
for (const v of smBodyVerses) {
  const lines = v.sanskrit || v.lines || [];
  const lastLine = lines[lines.length - 1];
  assert.ok(
    lastLine.includes(SM_REFRAIN),
    `Sankat Mochan verse ${v.id} should end with refrain "${SM_REFRAIN}", got: "${lastLine.slice(-60)}"`
  );
}

// ─── 4. No fabricated Hanuman Aarti closing ──────────────────────────────────

const FABRICATED_LINE = 'हनुमत बीर सकल दुख भावे';
for (const v of hanumanAarti.verses) {
  for (const line of v.lines) {
    assert.ok(
      !line.includes(FABRICATED_LINE),
      `Hanuman Aarti should NOT contain fabricated line "${FABRICATED_LINE}"`
    );
  }
}

// ─── 5. No Devanagari in transliteration fields ──────────────────────────────

const DEVANAGARI_RANGE = /[ऀ-ॿ]/;

function checkNoDevanagariInTranslit(dir: string, fieldName: string) {
  const files = readdirSync(join(DATA, dir)).filter(f => f.endsWith('.json') && f !== 'chapters-manifest.json');
  for (const file of files) {
    const data = readJson(`${dir}/${file}`);
    const verses = data.verses || [];
    for (const v of verses) {
      const translitLines: string[] = v[fieldName] || v.transliteration || [];
      for (let i = 0; i < translitLines.length; i++) {
        assert.ok(
          !DEVANAGARI_RANGE.test(translitLines[i]),
          `${dir}/${file} verse ${v.id || v.number} ${fieldName}[${i}] contains Devanagari: "${translitLines[i].slice(0, 60)}..."`
        );
      }
    }
  }
}

checkNoDevanagariInTranslit('sundarkand', 'linesEn');
checkNoDevanagariInTranslit('gita', 'transliteration');

for (const file of collectJsonFiles()) {
  const data = readJson(file);
  const verses = data.verses || data.mantras || [];
  for (const v of verses) {
    const translitLines: string[] = v.linesEn || v.transliteration || [];
    for (let i = 0; i < translitLines.length; i++) {
      assert.ok(
        !DEVANAGARI_RANGE.test(translitLines[i]),
        `${file} verse ${v.id || v.number || v.nameEn} transliteration[${i}] contains Devanagari: "${translitLines[i].slice(0, 60)}..."`
      );
    }
  }
}

// ─── 6. Display romanization style stays readable ───────────────────────────

const READABLE_AARTI_ROMANIZATION_BAD_PATTERNS = [
  [/\baaratee\b/i, 'aarti'],
  [/\bhanumaana\b/i, 'Hanuman'],
  [/\bhanumaanajee\b/i, 'Hanumanji'],
  [/\basura dala\b/i, 'asur dal'],
  [/\bsantajana\b/i, 'santjan'],
  [/\bjagadeeshajee\b/i, 'Jagdishji'],
  [/\bsvaamee\b/i, 'Swami'],
  [/\bkoee nara\b/i, 'koi nar'],
] as const;

for (const file of collectJsonFiles('aarti')) {
  const data = readJson(file);
  for (const v of data.verses || []) {
    for (const line of (v.linesEn || [])) {
      assert.match(line, /^[\"'‘“]?[A-Z]/, `${file} verse ${v.id || v.number} linesEn should preserve display capitalization: "${line}"`);
      assert.doesNotMatch(
        line,
        /\|$/,
        `${file} verse ${v.id || v.number} linesEn should not end with generated pipe punctuation: "${line}"`
      );
      for (const [pattern, preferred] of READABLE_AARTI_ROMANIZATION_BAD_PATTERNS) {
        assert.doesNotMatch(
          line,
          pattern,
          `${file} verse ${v.id || v.number} linesEn should use readable "${preferred}" style: "${line}"`
        );
      }
    }
  }
}

// ─── 6. Gita commentary corruption checks ───────────────────────────────────

const QUESTION_AS_COMMA = /[a-z]\? [a-zA-Z]/g;
const BENGALI_DANDA = /৷/g;

let questionAsCommaCount = 0;
let bengaliDandaCount = 0;

for (let ch = 1; ch <= 18; ch++) {
  const chStr = String(ch).padStart(2, '0');
  const data = readJson(`gita/chapter-${chStr}.json`);
  for (const v of data.verses) {
    for (const line of (v.commentaryEn || [])) {
      const matches = line.match(QUESTION_AS_COMMA);
      if (matches) questionAsCommaCount += matches.length;
    }
    for (const line of (v.commentaryHi || [])) {
      const matches = line.match(BENGALI_DANDA);
      if (matches) bengaliDandaCount += matches.length;
    }
  }
}

assert.ok(
  questionAsCommaCount < 10,
  `Gita commentaryEn should have < 10 "? as comma" instances, got ${questionAsCommaCount}`
);

assert.equal(
  bengaliDandaCount, 0,
  `Gita commentaryHi should have 0 Bengali dandas, got ${bengaliDandaCount}`
);

// ─── 7. BG 18.2 meaningHi is not placeholder ────────────────────────────────

const ch18 = readJson('gita/chapter-18.json');
const bg18_2 = ch18.verses.find((v: any) => v.number === 2 || v.id === 'bg-18-2');
assert.ok(bg18_2, 'BG 18.2 should exist');
assert.ok(
  !bg18_2.meaningHi.includes('Hindi Translation By Swami Ramsukhdas'),
  'BG 18.2 meaningHi should not be a placeholder'
);

// ─── 8. Gita transliteration line counts match Sanskrit ──────────────────────

const TRANSLITERATION_SPILLOVER_PAIRS = [
  [1, 5], [1, 20], [1, 26],
  [5, 8], [5, 27],
  [10, 33],
  [11, 19], [11, 26],
  [12, 3],
  [16, 15],
  [18, 36],
];

for (const [ch, verseNum] of TRANSLITERATION_SPILLOVER_PAIRS) {
  const chStr = String(ch).padStart(2, '0');
  const data = readJson(`gita/chapter-${chStr}.json`);
  const verse = data.verses.find((v: any) => v.number === verseNum);
  if (!verse) continue;
  const sanskritLines = verse.sanskrit?.length || 0;
  const translitLines = verse.transliteration?.length || 0;
  assert.equal(
    translitLines, sanskritLines,
    `Gita ${ch}.${verseNum}: transliteration lines (${translitLines}) should equal sanskrit lines (${sanskritLines})`
  );
}

// ─── 9. Durga Chalisa starts with canonical opening ─────────────────────────

const durgaChalisa = readJson('durga-chalisa/durga-chalisa.json');
const firstChaupai = durgaChalisa.verses.find((v: any) => v.type === 'chaupai' && v.number === 1);
assert.ok(firstChaupai, 'Durga Chalisa should have chaupai 1');
assert.ok(
  firstChaupai.lines[0].includes('नमो नमो दुर्गे सुख करनी'),
  `Durga Chalisa chaupai 1 should start with "नमो नमो दुर्गे सुख करनी", got: "${firstChaupai.lines[0]}"`
);

// ─── 10. Shiv Chalisa opening doha spelling ──────────────────────────────────

const shivChalisa = readJson('shiv-chalisa/shiv-chalisa.json');
const shivDoha2 = shivChalisa.verses.find((v: any) => v.type === 'doha' && v.number === 2);
assert.ok(shivDoha2, 'Shiv Chalisa should have doha 2');
const shivAllText = shivDoha2.lines.join(' ');
assert.ok(
  shivAllText.includes('दीनदयाला') || shivAllText.includes('दीन दयाला'),
  `Shiv Chalisa doha 2 should have "दीनदयाला" (with long ii), got: "${shivDoha2.lines[0]}"`
);

// ─── 10a. Gayatri Chalisa canonical structure & opening ──────────────────────

const gayatriChalisa = readJson('gayatri-chalisa/gayatri-chalisa.json');
assert.equal(
  gayatriChalisa.verses.length,
  43,
  'Gayatri Chalisa should have 43 verses (2 opening dohas + 40 chaupais + 1 closing doha)'
);
assert.equal(
  gayatriChalisa.verses.filter((v: any) => v.type === 'chaupai').length,
  40,
  'Gayatri Chalisa should have exactly 40 chaupais'
);
const gayatriFirstChaupai = gayatriChalisa.verses.find(
  (v: any) => v.type === 'chaupai' && v.number === 1
);
assert.ok(gayatriFirstChaupai, 'Gayatri Chalisa should have chaupai 1');
assert.ok(
  gayatriFirstChaupai.lines[0].includes('भूर्भुवः स्वः'),
  `Gayatri Chalisa chaupai 1 should open with the Vyahriti "भूर्भुवः स्वः", got: "${gayatriFirstChaupai.lines[0]}"`
);
const gayatriClosing = gayatriChalisa.verses.find((v: any) => v.section === 'closing');
assert.ok(
  gayatriClosing?.lines.join(' ').includes('यह चालीसा भक्ति'),
  'Gayatri Chalisa closing doha should be the canonical phala-shruti'
);

// ─── 10b. Gayatri Mata Aarti canonical structure & refrain ───────────────────

const gayatriAarti = readJson('aarti/gayatri-aarti.json');
assert.equal(
  gayatriAarti.verses.length,
  12,
  'Gayatri Mata Aarti should have 12 verses (2 refrains + 10 stanzas)'
);
assert.equal(
  gayatriAarti.verses.filter((v: any) => v.type === 'stanza').length,
  10,
  'Gayatri Mata Aarti should have exactly 10 stanzas'
);
assert.equal(gayatriAarti.deity, 'savitr', 'Gayatri Mata Aarti deity should be savitr (Maa Gayatri)');
const gayatriAartiRefrain = gayatriAarti.verses.find((v: any) => v.type === 'refrain');
assert.ok(gayatriAartiRefrain, 'Gayatri Mata Aarti should open with a refrain');
assert.ok(
  gayatriAartiRefrain.lines[0].includes('जयति जय गायत्री माता'),
  `Gayatri Mata Aarti refrain should be "जयति जय गायत्री माता", got: "${gayatriAartiRefrain.lines[0]}"`
);

// ─── 11. Library labels are precise about excerpts and verse types ───────────

const libraryById = new Map(library.map((entry) => [entry.id, entry]));

assert.equal(libraryById.get('hanuman-chalisa')?.sub, '40 चौपाई + 3 दोहा · अर्थ सहित');
assert.equal(libraryById.get('shiv-chalisa')?.sub, '40 चौपाई + 3 दोहा · अर्थ सहित');
assert.equal(libraryById.get('ganesh-chalisa')?.sub, '40 चौपाई + 3 दोहा · अर्थ सहित');
assert.equal(libraryById.get('gayatri-chalisa')?.sub, '40 चौपाई + 3 दोहा · अर्थ सहित');
assert.equal(libraryById.get('durga-chalisa')?.sub, '40 चौपाई + 1 दोहा · अर्थ सहित');
assert.equal(libraryById.get('sundarkand')?.sub, '16 अनुभाग · 354 पद');
assert.match(libraryById.get('ramcharitmanas')?.nameHi || '', /मंगलाचरण/);
assert.doesNotMatch(libraryById.get('ramcharitmanas')?.sub || '', /अंश|Excerpt/i);
assert.match(libraryById.get('vishnu-sahasranama')?.nameHi || '', /अंश/);
assert.equal(libraryById.get('durga-stotram')?.nameHi, 'दुर्गा स्तोत्रम्');
assert.match(libraryById.get('durga-stotram')?.sub || '', /चयनित/);

// Every library entry must carry an English count-detail string that is free of
// Devanagari, so the card subtitle matches the selected language. Guards the
// regression where English-selected cards still showed the Hindi `sub`.
for (const entry of library) {
  assert.ok(
    typeof entry.subEn === 'string' && entry.subEn.trim() !== '',
    `${entry.id}: subEn must be a non-empty string`
  );
  assert.doesNotMatch(
    entry.subEn,
    /[ऀ-ॿ]/,
    `${entry.id}: subEn should not contain Devanagari, got: "${entry.subEn}"`
  );
}

const durgaStotramManifest = readJson('durga-stotram/chapters-manifest.json');
for (const chapter of durgaStotramManifest) {
  assert.doesNotMatch(chapter.titleHi, /चयनित/, `Durga Stotram chapter ${chapter.chapter} titleHi should not say चयनित`);
  assert.doesNotMatch(chapter.titleEn, /selected/i, `Durga Stotram chapter ${chapter.chapter} titleEn should not say selected`);
}

// Krishna Stotram must include the Krishna Pranama mantra ('Krishnaya Vasudevaya')
// added next to Krishnashtakam.
const krishnaStotramManifest = readJson('krishna-stotram/chapters-manifest.json');
const krishnaPranama = krishnaStotramManifest.find((c: any) => c.titleEn === 'Krishna Pranama Mantra');
assert.ok(krishnaPranama, 'krishna-stotram should list the Krishna Pranama Mantra chapter');
assert.equal(krishnaPranama.titleHi, 'कृष्ण प्रणाम मन्त्र');
const krishnaPranamaCh = readJson('krishna-stotram/chapter-02.json');
const krishnaPranamaText = krishnaPranamaCh.verses.flatMap((v: any) => v.sanskrit).join(' ');
assert.match(krishnaPranamaText, /कृष्णाय वासुदेवाय हरये परमात्मने/, 'Krishna Pranama should contain the opening line');
assert.match(krishnaPranamaText, /गोविन्दाय नमो नमः/, 'Krishna Pranama should contain the closing line');
for (const v of krishnaPranamaCh.verses) {
  assert.ok(v.meaningHi.trim() && v.meaningEn.trim(), `krishna-stotram ch2 ${v.id} must be bilingual`);
}

const mahishasuraMardini = readJson('durga-stotram/chapter-02.json');
const mahishasuraBody = mahishasuraMardini.verses.filter((v: any) => v.number > 0);
assert.equal(mahishasuraMardini.verseCount, 22, 'Mahishasura Mardini should include intro + 21 verses');
assert.equal(mahishasuraBody.length, 21, 'Mahishasura Mardini should have 21 body verses');
assert.doesNotMatch(
  JSON.stringify(mahishasuraMardini),
  /Adi Shankar|Shankaracharya|शंकराचार्य/i,
  'Mahishasura Mardini should not carry unsupported Adi Shankaracharya attribution'
);
assert.ok(
  mahishasuraMardini.source.referenceUrls.some((url: string) => url.includes('sanskritdocuments.org/doc_devii/mahisha')),
  'Mahishasura Mardini should cite SanskritDocuments source'
);
assert.ok(
  mahishasuraMardini.source.referenceUrls.some((url: string) => url.includes('vignanam.org/veda/sree-mahishaasura-mardini')),
  'Mahishasura Mardini should cite Vaidika Vignanam source'
);
for (const v of mahishasuraBody) {
  assert.equal(v.sanskrit.length, 4, `Mahishasura Mardini verse ${v.number} should be a complete 4-line verse`);
  assert.ok(
    v.sanskrit[3].includes('जय जय हे महिषासुरमर्दिनि'),
    `Mahishasura Mardini verse ${v.number} should end with canonical refrain`
  );
}

for (const v of aartiKunjBihari.verses) {
  for (const line of v.linesEn || []) {
    assert.match(line, /^[A-Z]/, `Aarti Kunj Bihari roman line should preserve display capitalization: "${line}"`);
    assert.doesNotMatch(line, /\|$/, `Aarti Kunj Bihari roman line should use display punctuation, not generated pipe: "${line}"`);
  }
}

// ─── 12. Gita speaker prefixes are not glued to verse text ──────────────────

for (let ch = 1; ch <= 18; ch++) {
  const chStr = String(ch).padStart(2, '0');
  const data = readJson(`gita/chapter-${chStr}.json`);
  for (const v of data.verses) {
    for (const line of (v.sanskrit || [])) {
      assert.ok(
        !/उवाच[^\s।॥]/u.test(line),
        `Gita ${ch}.${v.number} speaker prefix should be separated from verse text: "${line}"`
      );
    }
  }
}

// ─── 13. Sundarkand punctuation does not contain triple daṇḍa ───────────────

for (let ch = 1; ch <= 16; ch++) {
  const chStr = String(ch).padStart(2, '0');
  const data = readJson(`sundarkand/chapter-${chStr}.json`);
  for (const v of data.verses) {
    for (const line of (v.lines || [])) {
      assert.ok(!line.includes('॥।'), `Sundarkand ${v.id} has extra danda: "${line}"`);
    }
  }
}

// ─── 14. Content JSON declares source provenance ────────────────────────────

function collectJsonFiles(dirRel = ''): string[] {
  const dir = join(DATA, dirRel);
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const rel = dirRel ? `${dirRel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') files.push(...collectJsonFiles(rel));
    } else if (entry.name.endsWith('.json') && entry.name !== 'chapters-manifest.json') {
      files.push(rel);
    }
  }
  return files;
}

for (const file of collectJsonFiles()) {
  const data = readJson(file);
  assert.ok(data.source, `${file} should declare source provenance`);
  assert.ok(
    Array.isArray(data.source.referenceUrls) && data.source.referenceUrls.length >= 2,
    `${file} should declare at least 2 source referenceUrls`
  );
}

// ─── 15. Chalisa/Aarti meanings are real translations, not placeholders ──────
// Guards the #98 fix. Two distinct placeholder shapes had shipped:
//   • Chalisas cloned a label-echoing boilerplate onto every verse, e.g.
//     "Chaupai · 1 praises Lord Shiva's glory and grace. The devotee asks for
//     refuge, wisdom, and relief from distress." (same sentence, only N varies).
//   • An aarti repeated one generic gloss across most verses (few unique values).
// The combined guard below caught every pre-#98 file and passes all six now.
const LABEL_ECHO_PLACEHOLDER = /^(Doha|Chaupai|Verse|Stanza)\s*·?\s*\d+\s+praises\b/i;
const BOILERPLATE_GLOSS = /glory and grace\. The devotee asks for/i;
for (const file of [
  'shiv-chalisa/shiv-chalisa.json',
  'ganesh-chalisa/ganesh-chalisa.json',
  'durga-chalisa/durga-chalisa.json',
  'gayatri-chalisa/gayatri-chalisa.json',
  'aarti/om-jai-shiv-omkara.json',
  'aarti/jai-ambe-gauri.json',
  'aarti/jai-ganesh-deva.json',
  'aarti/gayatri-aarti.json',
]) {
  const meaningsEn: string[] = readJson(file)
    .verses.map((v: any) => v.meaningEn)
    .filter(Boolean);
  assert.ok(meaningsEn.length > 0, `${file} should provide per-verse English meanings`);

  for (const m of meaningsEn) {
    assert.doesNotMatch(
      m,
      LABEL_ECHO_PLACEHOLDER,
      `${file}: meaningEn echoes the verse label instead of translating it: "${m}"`
    );
    assert.doesNotMatch(
      m,
      BOILERPLATE_GLOSS,
      `${file}: meaningEn is the #98 placeholder boilerplate, not a real translation: "${m}"`
    );
  }

  // Real per-verse translations are overwhelmingly distinct; a cloned template
  // collapses to a handful of unique strings. Require ≥90% unique.
  const uniqueEn = new Set(meaningsEn);
  assert.ok(
    uniqueEn.size >= Math.ceil(meaningsEn.length * 0.9),
    `${file}: meaningEn should be per-verse translations, not a repeated template (${uniqueEn.size} unique of ${meaningsEn.length})`
  );
}

// ─── 16. Verified native gu/kn meaning sections stay complete ───────────────
// Native Gujarati/Kannada meanings are shipped only after source verification.
// Once a section is marked verified, every meaning row must carry both native
// fields and a matching fusion provenance artifact. Incomplete sections are not
// listed here so they continue to use the runtime transliteration fallback.
for (const section of VERIFIED_NATIVE_MEANING_SECTIONS) {
  const fusionPath = join(TRANSLATIONS, section.fusionFile);
  assert.ok(existsSync(fusionPath), `${section.id} should have ${section.fusionFile}`);

  const fusion = readTranslationJson(section.fusionFile);
  assert.equal(fusion.section, section.id, `${section.fusionFile} should identify ${section.id}`);
  assert.ok(fusion.source_verification, `${section.fusionFile} should record source_verification`);
  assert.ok(
    Array.isArray(fusion.source_verification.gu_sources) &&
      fusion.source_verification.gu_sources.length >= 2,
    `${section.fusionFile} should cite at least 2 Gujarati verification sources`
  );
  assert.ok(
    Array.isArray(fusion.source_verification.kn_sources) &&
      fusion.source_verification.kn_sources.length >= 2,
    `${section.fusionFile} should cite at least 2 Kannada verification sources`
  );
  assert.ok(
    typeof fusion.source_verification.result === 'string' &&
      fusion.source_verification.result.includes('/'),
    `${section.fusionFile} should summarize verified row counts`
  );

  let checkedRows = 0;
  for (const file of section.dataFiles) {
    const data = readJson(file);
    const rows = (data.verses || data.mantras || []).filter(
      (row: any) => row.meaningHi || row.meaningEn
    );
    assert.ok(rows.length > 0, `${file} should have meaning rows`);

    for (const row of rows) {
      const label = `${file} ${row.id || row.number || row.nameEn}`;
      assert.ok(row.meaningGu?.trim(), `${label} should carry verified meaningGu`);
      assert.ok(row.meaningKn?.trim(), `${label} should carry verified meaningKn`);
      checkedRows += 1;
    }
  }
  assert.ok(checkedRows > 0, `${section.id} should check at least one native meaning row`);
}

// ─── 17. japam per-mantra source URLs roll up into the top-level source ──────
const japamSourceUrls = new Set(japam.source.referenceUrls);
for (const mantra of japam.mantras) {
  for (const url of mantra.source?.referenceUrls ?? []) {
    assert.ok(
      japamSourceUrls.has(url),
      `japam/japam.json top-level source should include ${mantra.id} reference ${url}`
    );
  }
}

// ─── Done ────────────────────────────────────────────────────────────────────

console.log('All content correctness tests passed');

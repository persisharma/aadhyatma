/**
 * Content correctness validation tests.
 * Verifies all religious content against internet-verified canonical sources.
 * Run: npx tsx src/data/__tests__/contentCorrectness.test.ts
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA = join(__dirname, '..');

function readJson(rel: string) {
  return JSON.parse(readFileSync(join(DATA, rel), 'utf8'));
}

// ─── 1. Deity type correctness ───────────────────────────────────────────────

const omJaiJagdish = readJson('aarti/om-jai-jagdish.json');
assert.equal(omJaiJagdish.deity, 'vishnu', 'Om Jai Jagdish deity should be vishnu');

const japam = readJson('japam/japam.json');
const gayatri = japam.mantras.find((m: any) => m.id === 'gayatri-mantra');
assert.ok(gayatri, 'Gayatri mantra should exist');
assert.deepEqual(gayatri.deities, ['savitr'], 'Gayatri deity should be savitr');

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

// ─── Done ────────────────────────────────────────────────────────────────────

console.log('All content correctness tests passed');

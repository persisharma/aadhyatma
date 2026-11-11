/**
 * The Valmiki Ramayan corpus ships as bundled asset files, not as JavaScript.
 *
 * Two things have to stay true for that to hold, and neither is visible in a
 * diff that breaks it:
 *
 *   1. NOTHING IN THE APP IMPORTS A KĀṆḌA MASTER. One
 *      `import ch from './chapter-06.json'` anywhere reachable puts 6.4 MB back
 *      in the Hermes bundle and in every OTA download. `launchGraph.test.ts`
 *      only guards the launch path; this guards the whole app.
 *
 *   2. THE PUBLISHED PARTS ARE THE MASTERS. The masters remain the editorial
 *      source of truth (`scripts/build-valmiki-ramayan.py` writes them, the
 *      corpus tests read them). The parts the app actually reads are generated
 *      from them by `scripts/build-valmiki-assets.mjs`; a master edited without
 *      regenerating would ship the old text.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { valmikiSargaStarts } from '../valmiki-ramayan/sargaStarts';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const CORPUS = path.join(ROOT, 'src/data/valmiki-ramayan');
const ASSETS = path.join(ROOT, 'assets/valmiki-ramayan');

type Verse = { id: string; reference: string };
type Summary = { chapter: number; sargaCount: number; verseCount: number };
const manifest = JSON.parse(fs.readFileSync(path.join(CORPUS, 'chapters-manifest.json'), 'utf8')) as Summary[];
const master = (kanda: number) =>
  JSON.parse(fs.readFileSync(path.join(CORPUS, `chapter-${String(kanda).padStart(2, '0')}.json`), 'utf8')) as {
    verses: Verse[];
  };

function appSources(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) appSources(full, out);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !/\.test\./.test(entry.name)) out.push(full);
  }
  return out;
}

test('no app module imports or requires a kāṇḍa master', () => {
  const loads = /(?:from\s+|require\(\s*|import\(\s*)['"][^'"]*valmiki-ramayan\/chapter-\d+\.json['"]|(?:from\s+|require\(\s*|import\(\s*)['"]\.\/chapter-\d+\.json['"]/;
  const offenders = [...appSources(path.join(ROOT, 'src')), path.join(ROOT, 'App.tsx'), path.join(ROOT, 'index.ts')]
    .filter((file) => {
      const source = fs.readFileSync(file, 'utf8');
      // `./chapter-NN.json` is only the Valmiki master inside its own directory.
      return file.startsWith(CORPUS) ? loads.test(source) : /valmiki-ramayan\/chapter-\d+\.json/.test(source) && loads.test(source);
    })
    .map((file) => path.relative(ROOT, file));
  assert.deepEqual(
    offenders,
    [],
    'These modules put the corpus back in the JS bundle. Load a kāṇḍa with loadValmikiRamayanChapter() instead.'
  );
});

test('the published parts are generated from the current masters', () => {
  // The generator re-derives every part, the part table and the sarga table in
  // memory and compares them with what is committed.
  const output = execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-valmiki-assets.mjs'), '--check'], {
    encoding: 'utf8',
  });
  assert.match(output, /in sync/);
});

test('the parts of each kāṇḍa are its verses, all of them, in order', () => {
  const table = fs.readFileSync(path.join(CORPUS, 'parts.ts'), 'utf8');
  const rows = [...table.matchAll(/valmiki-ramayan\/(k(\d+)_p\d+\.txt)'\) as number, firstVerse: (\d+), verseCount: (\d+)/g)].map(
    (m) => ({ file: m[1], kanda: Number(m[2]), firstVerse: Number(m[3]), verseCount: Number(m[4]) })
  );
  assert.equal(new Set(rows.map((row) => row.file)).size, rows.length, 'a part is listed twice');
  assert.deepEqual(
    rows.map((row) => row.file).sort(),
    fs.readdirSync(ASSETS).filter((name) => name.endsWith('.txt')).sort(),
    'the part table and the files on disk disagree'
  );
  for (const summary of manifest) {
    const ids: string[] = [];
    for (const row of rows.filter((r) => r.kanda === summary.chapter)) {
      assert.equal(row.firstVerse, ids.length, `${row.file} does not start where the previous part ended`);
      const verses = JSON.parse(fs.readFileSync(path.join(ASSETS, row.file), 'utf8')) as Verse[];
      assert.equal(verses.length, row.verseCount, `${row.file} verse count`);
      for (const verse of verses) ids.push(verse.id);
    }
    assert.deepEqual(ids, master(summary.chapter).verses.map((verse) => verse.id), `kāṇḍa ${summary.chapter} verse order`);
    assert.equal(ids.length, summary.verseCount);
  }
});

test('Android resource names derived from the part files do not collide', () => {
  // Metro's Android identifier: lower-case, every character outside [a-z0-9_] deleted.
  const names = fs.readdirSync(ASSETS).filter((name) => name.endsWith('.txt'));
  const identifiers = names.map((name) => name.replace(/\.txt$/, '').toLowerCase().replace(/[^a-z0-9_]/g, ''));
  assert.equal(new Set(identifiers).size, names.length);
});

test('the sarga table names the first verse of every sarga', () => {
  for (const summary of manifest) {
    const verses = master(summary.chapter).verses;
    const table = valmikiSargaStarts[summary.chapter];
    assert.equal(table.length, summary.sargaCount);
    for (let sarga = 1; sarga <= summary.sargaCount; sarga += 1) {
      const expected = verses.findIndex((verse) => verse.reference.startsWith(`${summary.chapter}.${sarga}.`));
      assert.equal(table[sarga - 1], expected, `kāṇḍa ${summary.chapter} sarga ${sarga}`);
    }
  }
});

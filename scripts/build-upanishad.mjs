#!/usr/bin/env node
/**
 * Builds mobile/src/data/upanishad/texts/<slug>.json (one file per Upanishad)
 * and mobile/src/data/upanishad/chapters-manifest.json (the readable subset of
 * the 108-text registry) from the authored modules in scripts/upanishad-content/.
 *
 * Each content module exports `{ slug, muktika, vedaHi, vedaEn, source, shanti,
 * mantras | khandas }` (Devanagari `lines` + `meaningHi/En`; `linesEn` is generated) — see isha.mjs (flat mantras) and kena.mjs (khaṇḍas). The
 * Muktikā number is the reader's `chapter` id and never changes; names come from
 * registry.ts so the catalogue and the payload cannot disagree.
 *
 * Run manually (not a build step):  cd mobile && npx tsx ../scripts/build-upanishad.mjs
 */
import { mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  upanishadRegistry,
  upanishadTitleEnOf,
  upanishadTitleHiOf,
} from '../mobile/src/data/upanishad/registry.ts';
import { transliterateLine } from './transliterate-shloka.mjs';

/**
 * `linesEn` is DERIVED from the Devanagari, never authored: the house IAST +
 * Hunterian style of design.md §3.1 (śh, ṣh, ṛi, ch/chh), one line per line,
 * dandas dropped (RULEBOOK §11.12). ॐ is spelled out because the converter
 * leaves the ligature untouched.
 */
const iast = (line) => transliterateLine(line.replace(/ॐ/g, 'ओम्')).replace(/\s+/g, ' ').trim();

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(HERE, 'upanishad-content');
const OUT = join(HERE, '..', 'mobile', 'src', 'data', 'upanishad');
const TEXTS = join(OUT, 'texts');

const DEV_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const dev = (s) => String(s).replace(/\d/g, (d) => DEV_DIGITS[Number(d)]);

function verse(muktika, slug, numInSection, reference, labelHi, labelEn, body, section) {
  return {
    id: `${slug}-${reference.replace(/\./g, '-')}`,
    upanishad: muktika,
    section,
    stanza: muktika,
    numInSection,
    reference,
    labelHi,
    labelEn,
    lines: body.lines,
    linesEn: body.lines.map(iast),
    meaningHi: body.meaningHi,
    meaningEn: body.meaningEn,
  };
}

function buildVerses(u) {
  const verses = [
    verse(u.muktika, u.slug, 1, 'shanti', 'शान्ति मन्त्र', 'Shanti Mantra', u.shanti, 'shanti'),
  ];
  const push = (ref, body) =>
    verses.push(
      verse(u.muktika, u.slug, verses.length + 1, ref, `मन्त्र · ${dev(ref)}`, `Mantra · ${ref}`, body, 'mantra')
    );
  if (u.khandas) {
    // Nested numbering: [[…khaṇḍa 1…], …] → `k.m`; three levels ([[[…]]]) → `a.v.m`.
    u.khandas.forEach((k, ki) => {
      if (Array.isArray(k[0])) k.forEach((v, vi) => v.forEach((m, mi) => push(`${ki + 1}.${vi + 1}.${mi + 1}`, m)));
      else k.forEach((m, mi) => push(`${ki + 1}.${mi + 1}`, m));
    });
  } else {
    u.mantras.forEach((m, i) => push(String(i + 1), m));
  }
  return verses;
}

const release = JSON.parse(readFileSync(join(CONTENT, 'release-reviewed.json'), 'utf8'));
if (!Array.isArray(release)) throw new Error('release-reviewed.json must be an array');
const modules = readdirSync(CONTENT).filter((f) => f.endsWith('.mjs')).sort();
const releasedSlugs = new Set(release.map((r) => r.slug));
if (releasedSlugs.size !== release.length) throw new Error('duplicate Upanishad release entry');
if (modules.length !== release.length) throw new Error('every top-level Upanishad module requires one reviewed release entry');
const built = [];
for (const file of modules) {
  const u = (await import(pathToFileURL(join(CONTENT, file)).href)).default;
  const audit = release.find((r) => r.slug === u.slug);
  if (!audit || audit.status !== 'reviewed' || !audit.reviewer || !/^\d{4}-\d{2}-\d{2}$/.test(audit.reviewedOn) ||
      !Array.isArray(audit.scanPages) || audit.scanPages.length < 1 ||
      !Array.isArray(audit.referenceUrls) || new Set(audit.referenceUrls.map((url) => new URL(url).hostname)).size < 2 ||
      !audit.completeTextCollated || !audit.meaningsReviewed) {
    throw new Error(`${file}: missing complete scan, independent source, meaning and reviewer evidence`);
  }
  if (!u.source?.baseText || !/^\d{4}-\d{2}-\d{2}$/.test(u.source.retrievedOn) ||
      !Array.isArray(u.source.referenceUrls) ||
      audit.referenceUrls.some((url) => !u.source.referenceUrls.includes(url)) ||
      /from memory|scan check owed|not verified/i.test(`${u.source.baseText} ${u.source.notes ?? ''}`)) {
    throw new Error(`${file}: source claim does not match the reviewed record`);
  }
  const meta = upanishadRegistry.find((r) => r.slug === u.slug);
  if (!meta) throw new Error(`${file}: slug '${u.slug}' is not in registry.ts`);
  if (meta.muktika !== u.muktika) throw new Error(`${file}: muktika ${u.muktika} != registry ${meta.muktika}`);
  const verses = buildVerses(u);
  built.push({
    summary: {
      chapter: meta.muktika,
      slug: meta.slug,
      titleHi: upanishadTitleHiOf(meta),
      titleEn: upanishadTitleEnOf(meta),
      vedaHi: u.vedaHi,
      vedaEn: u.vedaEn,
      mantraCount: verses.length - 1,
      verseCount: verses.length,
    },
    source: u.source,
    verses,
  });
}
built.sort((a, b) => a.summary.chapter - b.summary.chapter);

rmSync(TEXTS, { recursive: true, force: true });
mkdirSync(TEXTS, { recursive: true });
for (const { summary, source, verses } of built) {
  writeFileSync(join(TEXTS, `${summary.slug}.json`), JSON.stringify({ ...summary, source, verses }, null, 2) + '\n');
}
writeFileSync(
  join(OUT, 'chapters-manifest.json'),
  JSON.stringify(built.map((b) => b.summary), null, 2) + '\n'
);
// Generate one SQLite/source-adapter thunk per reviewed text so the reader never
// imports verse JSON into the native JavaScript bundle.
writeFileSync(
  join(OUT, 'textLoaders.ts'),
  [
    '// GENERATED by scripts/build-upanishad.mjs — do not edit. One loader per',
    '// reviewed Upanishad, keyed by slug; native reads SQLite and web reads source JSON.',
    "import type { UpanishadChapter } from './index';",
    "import { readContent } from '../../storage/content';",
    '',
    'export const upanishadTextLoaders: Readonly<Record<string, () => UpanishadChapter>> = {',
    ...built.map((b) => `  ${b.summary.slug.includes('-') ? `'${b.summary.slug}'` : b.summary.slug}: () => readContent<UpanishadChapter>('upanishad/texts/${b.summary.slug}.json'),`),
    '};',
    '',
  ].join('\n')
);
console.log(built.map((b) => `${b.summary.chapter}. ${b.summary.titleEn}: ${b.summary.mantraCount} mantras`).join('\n'));

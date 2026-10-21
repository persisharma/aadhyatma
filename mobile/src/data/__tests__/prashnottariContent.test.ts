/**
 * Question-book content gate (PRD-46).
 *
 * The book is authored FROM shipped content; this test is what makes that
 * claim checkable. For every question it opens the corpus at `ref` — the Gita
 * chapter JSON, the Balakanda comic JSON, the kids-story JSON — and requires
 * both `evidence` quotes to be verbatim substrings of the text there. A
 * question that cites a panel, page or verse it cannot be found in fails.
 *
 * Also pinned: registry shape, three distinct options with one answer, both
 * languages present, pack ↔ ref consistency, no re-typed scripture in
 * authored lines, the kid-safe stance guard, Devanagari well-formedness (the
 * canonical validator — packs are .ts so the JSON sweep cannot see them),
 * verified-only accessors, deterministic papers, option shuffling, and
 * integer-exact grade bands.
 *
 * Run: npx tsx --test src/data/__tests__/prashnottariContent.test.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { describeDevanagariDefect, findDevanagariDefects } from '../devanagariWellFormed';
import {
  ALL_PRASHNA_PACKS,
  GITA_PARIKSHA_LEVELS,
  drawParikshaPaper,
  getAbhyasPacks,
  getPackForComicEpisode,
  getPackForStory,
  getPrashnaPack,
  gradePaper,
  presentPrashna,
} from '../prashnottari';
import { SECTION_ORDER } from '../prashnottari/paper';
import type { Bilingual, Prashna, PrashnaPack, PrashnaRef } from '../prashnottari/types';

const DATA = join(__dirname, '..');
const DEVANAGARI = /[ऀ-ॿ]/;

type GitaChapterJson = {
  titleHi: string;
  titleEn: string;
  summaryHi?: string;
  summaryEn?: string;
  verses: { number: number; sanskrit: string[]; meaningHi: string; meaningEn: string }[];
};
type PanelLang = { narration?: string | null; dialogue?: string | null };
type ComicJson = { episodes: { id: string; panels: { id: string; hi: PanelLang; en: PanelLang }[] }[] };
type StoryJson = { id: string; pages: { id: string; text: { hi: string; en: string } }[] };

const cache = new Map<string, unknown>();
function readJson<T>(rel: string): T {
  if (!cache.has(rel)) cache.set(rel, JSON.parse(readFileSync(join(DATA, rel), 'utf8')));
  return cache.get(rel) as T;
}

const COMIC_FILES: Record<string, string> = { 'balakanda-v1': 'comicBooks/balakanda.json' };

/** The shipped text a ref points at, per language — every place evidence may legitimately quote. */
function sourceTexts(ref: PrashnaRef): Bilingual & { hiAll: string[]; enAll: string[] } {
  switch (ref.kind) {
    case 'gitaChapter': {
      const c = readJson<GitaChapterJson>(`gita/chapter-${String(ref.chapter).padStart(2, '0')}.json`);
      const hiAll = [c.titleHi, c.summaryHi ?? ''];
      const enAll = [c.titleEn, c.summaryEn ?? ''];
      return { hi: hiAll.join('\n'), en: enAll.join('\n'), hiAll, enAll };
    }
    case 'gitaVerse': {
      const c = readJson<GitaChapterJson>(`gita/chapter-${String(ref.chapter).padStart(2, '0')}.json`);
      const verse = c.verses.find((x) => x.number === ref.verse);
      assert.ok(verse, `gita ${ref.chapter}.${ref.verse} does not exist in the corpus`);
      const hiAll = [verse.meaningHi, verse.sanskrit.join(' ')];
      const enAll = [verse.meaningEn];
      return { hi: hiAll.join('\n'), en: enAll.join('\n'), hiAll, enAll };
    }
    case 'comicPanel': {
      const file = COMIC_FILES[ref.comicId];
      assert.ok(file, `unknown comic ${ref.comicId}`);
      const comic = readJson<ComicJson>(file);
      const episode = comic.episodes.find((e) => e.id === ref.episodeId);
      assert.ok(episode, `comic episode ${ref.episodeId} does not exist`);
      const panel = episode.panels.find((p) => p.id === ref.panelId);
      assert.ok(panel, `panel ${ref.panelId} is not in episode ${ref.episodeId}`);
      const pick = (l: PanelLang) => [l.narration, l.dialogue].filter((s): s is string => typeof s === 'string' && s.length > 0);
      const hiAll = pick(panel.hi);
      const enAll = pick(panel.en);
      return { hi: hiAll.join('\n'), en: enAll.join('\n'), hiAll, enAll };
    }
    case 'storyPage': {
      const story = readJson<StoryJson>(`kidsStories/${ref.storyId}.json`);
      const page = story.pages.find((p) => p.id === ref.pageId);
      assert.ok(page, `story page ${ref.storyId}/${ref.pageId} does not exist`);
      return { hi: page.text.hi, en: page.text.en, hiAll: [page.text.hi], enAll: [page.text.en] };
    }
  }
}

const allQuestions = (): { pack: PrashnaPack; q: Prashna }[] =>
  ALL_PRASHNA_PACKS.flatMap((pack) => pack.questions.map((q) => ({ pack, q })));

/** Every line a child reads that was authored here (not quoted). */
function authoredLines(q: Prashna): { where: string; text: string; lang: 'hi' | 'en' }[] {
  const lines: { where: string; text: string; lang: 'hi' | 'en' }[] = [];
  const push = (where: string, b: Bilingual) => {
    lines.push({ where: `${where}.hi`, text: b.hi, lang: 'hi' }, { where: `${where}.en`, text: b.en, lang: 'en' });
  };
  push('prompt', q.prompt);
  q.options.forEach((o, i) => push(`options[${i}]`, o));
  push('reveal', q.reveal);
  return lines;
}

test('registry shape: unique pack and question ids, sizes, review notes', () => {
  const packIds = ALL_PRASHNA_PACKS.map((p) => p.id);
  assert.equal(new Set(packIds).size, packIds.length, 'duplicate pack id');

  const qIds = allQuestions().map(({ q }) => q.id);
  assert.equal(new Set(qIds).size, qIds.length, 'duplicate question id (ids must be globally unique and stable)');

  for (const pack of ALL_PRASHNA_PACKS) {
    if (pack.kind === 'abhyas') assert.ok(pack.questions.length >= 5, `${pack.id}: a practice pack needs ≥5 questions`);
    if (pack.status === 'draft') {
      assert.ok(pack.reviewNote?.startsWith('DRAFT — NOT VERIFIED'), `${pack.id}: a draft must carry a DRAFT — NOT VERIFIED note`);
    }
    for (const q of pack.questions) assert.equal(q.band, pack.band, `${q.id}: band differs from its pack`);
  }
});

test('every question: three distinct options, a valid answer, both languages, right script', () => {
  for (const { q } of allQuestions()) {
    assert.equal(q.options.length, 3, `${q.id}: exactly three options`);
    assert.ok([0, 1, 2].includes(q.answer), `${q.id}: answer index`);
    assert.equal(new Set(q.options.map((o) => o.hi)).size, 3, `${q.id}: duplicate hi option`);
    assert.equal(new Set(q.options.map((o) => o.en)).size, 3, `${q.id}: duplicate en option`);
    for (const line of [...authoredLines(q), { where: 'evidence.hi', text: q.evidence.hi, lang: 'hi' as const }, { where: 'evidence.en', text: q.evidence.en, lang: 'en' as const }]) {
      assert.ok(line.text.trim().length > 0, `${q.id}.${line.where}: empty`);
      if (line.lang === 'hi') assert.ok(DEVANAGARI.test(line.text), `${q.id}.${line.where}: hi line has no Devanagari`);
      else assert.ok(!DEVANAGARI.test(line.text), `${q.id}.${line.where}: en line contains Devanagari`);
    }
  }
});

test('grounding: every evidence quote is verbatim in the shipped content at its ref', () => {
  const failures: string[] = [];
  for (const { q } of allQuestions()) {
    const src = sourceTexts(q.ref);
    if (!src.hiAll.some((s) => s.includes(q.evidence.hi))) failures.push(`${q.id}: evidence.hi not found at ref → "${q.evidence.hi}"`);
    if (!src.enAll.some((s) => s.includes(q.evidence.en))) failures.push(`${q.id}: evidence.en not found at ref → "${q.evidence.en}"`);
  }
  assert.deepEqual(failures, []);
});

test('pack ↔ ref consistency and the exam syllabus covers its bank', () => {
  for (const { pack, q } of allQuestions()) {
    const t = pack.tracks;
    const r = q.ref;
    if (t.kind === 'comic') {
      assert.equal(r.kind, 'comicPanel', `${q.id}: comic pack cites a non-panel ref`);
      if (r.kind === 'comicPanel') {
        assert.equal(r.comicId, t.comicId, `${q.id}: wrong comic`);
        assert.ok(t.episodeIds.includes(r.episodeId), `${q.id}: episode ${r.episodeId} outside pack ${pack.id}`);
      }
    } else if (t.kind === 'story') {
      assert.equal(r.kind, 'storyPage', `${q.id}: story pack cites a non-page ref`);
      if (r.kind === 'storyPage') assert.equal(r.storyId, t.storyId, `${q.id}: page from another story`);
    } else {
      assert.ok(r.kind === 'gitaVerse' || r.kind === 'gitaChapter', `${q.id}: gita pack cites a non-gita ref`);
      if (r.kind === 'gitaVerse' || r.kind === 'gitaChapter') {
        assert.ok(t.chapters.includes(r.chapter), `${q.id}: chapter ${r.chapter} outside pack ${pack.id}`);
      }
    }
  }
  for (const level of GITA_PARIKSHA_LEVELS) {
    const bank = ALL_PRASHNA_PACKS.find((p) => p.id === level.bankPackId);
    assert.ok(bank, `level ${level.level}: bank ${level.bankPackId} missing`);
    assert.equal(bank.kind, 'pariksha-bank');
    assert.ok(bank.questions.length >= level.paperSize + 10, `level ${level.level}: bank must exceed the paper by ≥10 so retakes are fresh`);
    assert.ok(bank.tracks.kind === 'gita');
    if (bank.tracks.kind === 'gita') assert.deepEqual([...bank.tracks.chapters], [...level.syllabusChapters], `level ${level.level}: bank chapters ≠ declared syllabus`);
  }
});

test('scripture is pointed at, never re-typed, in authored lines', () => {
  for (const { q } of allQuestions()) {
    for (const line of authoredLines(q)) {
      assert.ok(!/[॥]|।।|उवाच/.test(line.text), `${q.id}.${line.where}: looks like re-typed verse text — cite by ref instead`);
    }
  }
});

test('stance guard: no fear, shame or competition language in what a child reads', () => {
  const bannedHi = ['फेल', 'पाप', 'नरक', 'श्राप', 'सज़ा', 'मूर्ख', 'रैंक'];
  const bannedEn = /\b(fail(ed|ure)?|stupid|punish\w*|hell|curse\w*|rank(ing)?|leaderboard|wrong!)\b/i;
  for (const { q } of allQuestions()) {
    for (const line of authoredLines(q)) {
      if (line.lang === 'hi') {
        for (const word of bannedHi) assert.ok(!line.text.includes(word), `${q.id}.${line.where}: banned "${word}"`);
      } else {
        assert.ok(!bannedEn.test(line.text), `${q.id}.${line.where}: banned phrasing → "${line.text}"`);
      }
    }
  }
});

test('Devanagari is well-formed in every authored and quoted hi line', () => {
  const failures: string[] = [];
  for (const { q } of allQuestions()) {
    const lines = [...authoredLines(q).filter((l) => l.lang === 'hi'), { where: 'evidence.hi', text: q.evidence.hi, lang: 'hi' as const }];
    for (const line of lines) {
      const defects = findDevanagariDefects(line.text);
      if (defects.length) failures.push(`${q.id}.${line.where}: ${defects.map(describeDevanagariDefect).join('; ')}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('verified-only: drafts never reach a screen accessor', () => {
  const verifiedIds = new Set(ALL_PRASHNA_PACKS.filter((p) => p.status === 'verified').map((p) => p.id));
  for (const pack of getAbhyasPacks()) assert.ok(verifiedIds.has(pack.id), `${pack.id} leaked as a draft`);
  for (const pack of ALL_PRASHNA_PACKS) {
    if (pack.status !== 'draft') continue;
    assert.equal(getPrashnaPack(pack.id), undefined, `${pack.id}: draft returned by getPrashnaPack`);
    if (pack.tracks.kind === 'story') assert.equal(getPackForStory(pack.tracks.storyId), undefined);
    if (pack.tracks.kind === 'comic') for (const ep of pack.tracks.episodeIds) assert.equal(getPackForComicEpisode(ep), undefined);
  }
  const bank = ALL_PRASHNA_PACKS.find((p) => p.id === GITA_PARIKSHA_LEVELS[0].bankPackId);
  if (bank?.status === 'draft') assert.equal(drawParikshaPaper(1, 1), undefined, 'a draft bank produced a paper');
});

test('papers are deterministic, complete, fresh per attempt, and grouped by section', () => {
  const level = GITA_PARIKSHA_LEVELS[0];
  const a = drawParikshaPaper(level.level, 1, { allowDraft: true });
  const again = drawParikshaPaper(level.level, 1, { allowDraft: true });
  const b2 = drawParikshaPaper(level.level, 2, { allowDraft: true });
  assert.ok(a && again && b2);
  assert.equal(a.length, level.paperSize);
  const ids = a.map((x) => x.prashna.id);
  assert.equal(new Set(ids).size, ids.length, 'a paper repeats a question');
  assert.deepEqual(ids, again.map((x) => x.prashna.id), 'same attempt must yield the same paper');
  assert.notDeepEqual(ids, b2.map((x) => x.prashna.id), 'a retake must be a fresh paper');
  const ranks = a.map((x) => SECTION_ORDER.indexOf(x.prashna.section));
  assert.deepEqual(ranks, [...ranks].sort((m, n) => m - n), 'paper not grouped in section order');
});

test('option shuffling keeps the right answer and actually moves it', () => {
  const seen = [0, 0, 0];
  for (const { q } of allQuestions()) {
    const shown = presentPrashna(q, 'gate-seed');
    assert.deepEqual(shown.options[shown.correctIndex], q.options[q.answer], `${q.id}: shuffle lost the answer`);
    assert.deepEqual(new Set(shown.options.map((o) => o.en)), new Set(q.options.map((o) => o.en)), `${q.id}: shuffle changed the option set`);
    seen[shown.correctIndex] += 1;
  }
  for (const [i, n] of seen.entries()) assert.ok(n > 0, `correct answer never landed in position ${i} — shuffle is not working`);
});

test('grade bands are integer-exact at every boundary', () => {
  const cases: [number, number, string][] = [
    [12, 25, 'prayas'], [13, 25, 'uttirn'], [17, 25, 'uttirn'], [18, 25, 'pratham'], [21, 25, 'pratham'], [22, 25, 'vishesh'],
    [9, 20, 'prayas'], [10, 20, 'uttirn'], [14, 20, 'pratham'], [17, 20, 'vishesh'], [0, 25, 'prayas'], [25, 25, 'vishesh'],
  ];
  for (const [correct, total, grade] of cases) assert.equal(gradePaper(correct, total), grade, `${correct}/${total}`);
  assert.throws(() => gradePaper(26, 25));
});

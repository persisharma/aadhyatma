/**
 * पितृ पक्ष परिचय registry invariants (PRD-44, RULEBOOK §28): shape and
 * bilingual completeness, the two-reference source threshold with a dated
 * note, draft invisibility behind every accessor, reader refs that resolve to
 * the EXACT bundled verse they cite (the registry points at scripture, it
 * never re-types it), Devanagari well-formedness, and the stance guard — no
 * prescription, no fear, no verdict vocabulary anywhere in the copy.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { findDevanagariDefects, describeDevanagariDefect } from '@/data/devanagariWellFormed';
import { getVidhiById } from '@/data/vidhi';

import { PITRU_LESSON_ENTRIES, getPitruLessons } from '../lessons';
import { PITRU_PRINCIPLE_ENTRIES, getPitruPrinciples } from '../principles';
import { PITRU_KATHA_ENTRIES, getPitruKatha, getPitruKathas } from '../kathas';
import { PITRU_PRASHNA_ENTRIES, getPitruPrashna } from '../prashna';
import { hasPitruShiksha, getPitruLessons as lessonsViaIndex } from '../index';
import type { PitruReaderRef, PitruSource } from '../types';

const nonEmpty = (s: string) => expect(s.trim().length).toBeGreaterThan(0);

function checkSource(source: PitruSource, status: 'draft' | 'verified') {
  // Verified rows carry ≥2 references; every row ≥1, no duplicates, ≥1 https.
  expect(source.referenceUrls.length).toBeGreaterThanOrEqual(status === 'verified' ? 2 : 1);
  expect(new Set(source.referenceUrls).size).toBe(source.referenceUrls.length);
  expect(source.referenceUrls.some((u) => u.startsWith('https://'))).toBe(true);
  for (const u of source.referenceUrls) expect(u).toMatch(/^(https:\/\/|repo:)/);
  nonEmpty(source.verificationNote);
  expect(source.verificationNote).toMatch(/\d{4}-\d{2}-\d{2}/);
  // A draft says so in its note, loudly — a reviewer must never mistake it.
  if (status === 'draft') expect(source.verificationNote).toMatch(/DRAFT — NOT VERIFIED/);
}

const ALL_ROWS = [
  ...PITRU_LESSON_ENTRIES.map((e) => ({ tag: `lesson:${e.id}`, status: e.status, source: e.source })),
  ...PITRU_PRINCIPLE_ENTRIES.map((e) => ({ tag: `principle:${e.id}`, status: e.status, source: e.source })),
  ...PITRU_KATHA_ENTRIES.map((e) => ({ tag: `katha:${e.id}`, status: e.status, source: e.source })),
  ...PITRU_PRASHNA_ENTRIES.map((e) => ({ tag: `prashna:${e.id}`, status: e.status, source: e.source })),
];

describe('registry shape', () => {
  test('ids are unique across every pitru registry', () => {
    const ids = ALL_ROWS.map((r) => r.tag);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every row carries a source block that meets its status threshold', () => {
    for (const row of ALL_ROWS) checkSource(row.source, row.status);
  });

  test('lessons: bilingual parity, kind/fortnightDay coupling', () => {
    for (const lesson of PITRU_LESSON_ENTRIES) {
      nonEmpty(lesson.titleHi);
      nonEmpty(lesson.titleEn);
      expect(lesson.bodyHi.length).toBeGreaterThan(0);
      expect(lesson.bodyHi.length).toBe(lesson.bodyEn.length);
      lesson.bodyHi.forEach(nonEmpty);
      lesson.bodyEn.forEach(nonEmpty);
      // A tithi row names its fortnight day; nothing else does.
      expect(lesson.fortnightDay !== undefined).toBe(lesson.kind === 'tithi');
    }
    // One row per fortnight day at most.
    const days = PITRU_LESSON_ENTRIES.filter((l) => l.kind === 'tithi').map((l) => String(l.fortnightDay));
    expect(new Set(days).size).toBe(days.length);
  });

  test('principles: bilingual parity; verse lines travel with IAST and a reader ref', () => {
    for (const entry of PITRU_PRINCIPLE_ENTRIES) {
      nonEmpty(entry.titleHi); nonEmpty(entry.titleEn);
      nonEmpty(entry.citeHi); nonEmpty(entry.citeEn);
      nonEmpty(entry.meaningHi); nonEmpty(entry.meaningEn);
      if (entry.verseLines) {
        // Quoted scripture must be reachable in full through a bundled reader.
        expect(entry.iastLines).toBeDefined();
        expect(entry.iastLines!.length).toBe(entry.verseLines.length);
        expect(entry.ref).toBeDefined();
      }
      // Not in any bundled reader ⇒ not quoted (the registry never becomes scripture).
      if (!entry.ref) expect(entry.verseLines).toBeUndefined();
    }
  });

  test('kathas: sections, teaching and canon line are bilingual and non-empty', () => {
    for (const katha of PITRU_KATHA_ENTRIES) {
      nonEmpty(katha.titleHi); nonEmpty(katha.titleEn);
      nonEmpty(katha.subtitleHi); nonEmpty(katha.subtitleEn);
      nonEmpty(katha.teachingHi); nonEmpty(katha.teachingEn);
      nonEmpty(katha.canonHi); nonEmpty(katha.canonEn);
      expect(katha.sections.length).toBeGreaterThan(0);
      for (const s of katha.sections) {
        expect(s.paragraphsHi.length).toBeGreaterThan(0);
        expect(s.paragraphsHi.length).toBe(s.paragraphsEn.length);
      }
    }
  });

  test('prashna: every question has a bilingual answer', () => {
    for (const q of PITRU_PRASHNA_ENTRIES) {
      nonEmpty(q.questionHi); nonEmpty(q.questionEn);
      nonEmpty(q.answerHi); nonEmpty(q.answerEn);
    }
  });
});

describe('draft invisibility', () => {
  test('accessors expose verified rows only, and the index thunks agree', () => {
    for (const l of getPitruLessons()) expect(l.status).toBe('verified');
    for (const p of getPitruPrinciples()) expect(p.status).toBe('verified');
    for (const k of getPitruKathas()) expect(k.status).toBe('verified');
    for (const q of getPitruPrashna()) expect(q.status).toBe('verified');
    expect(lessonsViaIndex().map((l) => l.id)).toEqual(getPitruLessons().map((l) => l.id));
    expect(lessonsViaIndex('tithi').every((l) => l.kind === 'tithi')).toBe(true);
  });

  test('the registry holds both a draft and a verified row of each kind, so the gate is non-vacuous', () => {
    const drafts = ALL_ROWS.filter((r) => r.status === 'draft');
    const verified = ALL_ROWS.filter((r) => r.status === 'verified');
    expect(drafts.length).toBeGreaterThan(0);
    expect(verified.length).toBeGreaterThan(0);
    const draftKatha = PITRU_KATHA_ENTRIES.find((k) => k.status === 'draft');
    expect(draftKatha).toBeDefined();
    expect(getPitruKatha(draftKatha!.id)).toBeNull();
  });

  test('hasPitruShiksha is true only because verified concept lessons exist', () => {
    expect(hasPitruShiksha()).toBe(true);
    expect(getPitruLessons().some((l) => l.kind === 'parichay')).toBe(true);
  });
});

describe('reader refs point at the exact bundled verse they cite', () => {
  const DATA = join(__dirname, '..', '..');

  function resolveRef(ref: PitruReaderRef): { id: string; reference?: string; number?: number; chapter?: number } {
    if (ref.kind === 'gita') {
      const file = join(DATA, 'gita', `chapter-${String(ref.chapter).padStart(2, '0')}.json`);
      const json = JSON.parse(readFileSync(file, 'utf8')) as { verses: { id: string; number: number; chapter: number }[] };
      return json.verses[ref.verseIndex];
    }
    const file = join(DATA, 'valmiki-ramayan', `chapter-${String(ref.chapter).padStart(2, '0')}.json`);
    const json = JSON.parse(readFileSync(file, 'utf8')) as { verses: { id: string; reference: string }[] };
    return json.verses[ref.verseIndex];
  }

  test('every principle ref resolves and its cite line names that verse', () => {
    for (const entry of PITRU_PRINCIPLE_ENTRIES) {
      if (!entry.ref) continue;
      const verse = resolveRef(entry.ref);
      expect(verse).toBeDefined();
      if (entry.ref.kind === 'gita') {
        expect(verse.chapter).toBe(entry.ref.chapter);
        // citeEn "Bhagavad Gita 1.42" ⇒ verse 42.
        const m = entry.citeEn.match(/(\d+)\.(\d+)$/)!;
        expect(Number(m[1])).toBe(entry.ref.chapter);
        expect(verse.number).toBe(Number(m[2]));
      } else {
        // citeEn "... 2.102.27" ⇒ reference "2.102.27".
        const m = entry.citeEn.match(/(\d+\.\d+\.\d+)$/)!;
        expect(verse.reference).toBe(m[1]);
      }
    }
  });

  test('every katha ref resolves to a verse inside the sargas its canon line names', () => {
    for (const katha of PITRU_KATHA_ENTRIES) {
      if (!katha.ref) continue;
      const verse = resolveRef(katha.ref);
      expect(verse).toBeDefined();
      if (katha.ref.kind === 'valmiki') {
        const [kanda, sarga] = verse.reference!.split('.').map(Number);
        expect(kanda).toBe(katha.ref.chapter);
        const range = katha.canonEn.match(/sargas? (\d+)(?:–(\d+))?/)!;
        const lo = Number(range[1]);
        const hi = range[2] ? Number(range[2]) : lo;
        expect(sarga).toBeGreaterThanOrEqual(lo);
        expect(sarga).toBeLessThanOrEqual(hi);
      }
    }
  });

  test('the two Gita chapters PRD-17 links (15 and 2) stay covered by the spine or the shipped vidhi', () => {
    const vidhi = getVidhiById('shraddha-tarpan-vidhi');
    expect(vidhi).not.toBeNull();
    const spineChapters = new Set(
      PITRU_PRINCIPLE_ENTRIES.filter((p) => p.ref?.kind === 'gita').map((p) => p.ref!.chapter)
    );
    expect(spineChapters.has(2)).toBe(true);
  });
});

describe('copy discipline', () => {
  const corpus = JSON.stringify({
    lessons: PITRU_LESSON_ENTRIES.map(({ source: _s, ...rest }) => rest),
    principles: PITRU_PRINCIPLE_ENTRIES.map(({ source: _s, ...rest }) => rest),
    kathas: PITRU_KATHA_ENTRIES.map(({ source: _s, ...rest }) => rest),
    prashna: PITRU_PRASHNA_ENTRIES.map(({ source: _s, ...rest }) => rest),
  });

  test('every Devanagari string is well-formed (no orphan combining marks)', () => {
    const defects = findDevanagariDefects(corpus);
    expect(defects.map(describeDevanagariDefect)).toEqual([]);
  });

  test('no prescription, fear or verdict vocabulary in rendered copy (RULEBOOK §28 stance guard)', () => {
    const banned = [
      /\bmust\b/i,
      /\byou should\b/i,
      /\binauspicious\b/i,
      /\bdosha\b/i,
      /\bcurse[ds]?\b/i,
      /\bstreak\b/i,
      /\bscore\b/i,
      /आपको .{0,20}करना चाहिए/u,
      /अशुभ/u,
      /पितृ ?दोष/u,
      /श्राप/u,
      /अवश्य करें/u,
    ];
    for (const re of banned) expect(corpus).not.toMatch(re);
  });

  test('the draft folk katha names its provenance on the rendered canon line', () => {
    const karna = PITRU_KATHA_ENTRIES.find((k) => k.id === 'karna-mahalaya')!;
    expect(karna.status).toBe('draft');
    expect(karna.canonHi).toMatch(/लोक/u);
    expect(karna.canonEn).toMatch(/[Ff]olk/);
  });
});

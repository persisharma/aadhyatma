/**
 * प्रथा और मान्यता registry invariants (PRD-46, RULEBOOK §32): every PRD
 * Appendix A row is present, bilingual and complete; every story names its
 * tier and a canon line that matches it; every link points at something the
 * app ships; reader refs resolve to the exact bundled verse their canon line
 * cites; drafts are invisible behind every accessor; and the stance guard —
 * no prescription, fear or verdict vocabulary in what a row says about the
 * custom.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { DAAN_OCCASION_ENTRIES } from '@/data/daan/occasions';
import { describeDevanagariDefect, findDevanagariDefects } from '@/data/devanagariWellFormed';
import { library } from '@/data/texts';
import { baseTemples } from '@/data/theerth/templeRows';
import { ALL_VIDHI_ENTRIES } from '@/data/vidhi';
import { BHOG_CONTENT } from '@/panchang/bhogContent';
import { KATHA_CATALOG, OBSERVANCE_RULES } from '@/panchang/festivals';

import {
  getAllPratha,
  getPratha,
  getPrathaByAxis,
  getPrathaForMasa,
  getPrathaForRule,
  getPrathaForVaar,
  hasPratha,
  hasPrathaForMasa,
} from '../index';
import {
  PRATHA_ENTRIES,
  selectById,
  selectForMasa,
  selectForRule,
  selectForVaar,
  verifiedOnly,
} from '../registry';
import type { PrathaEntry, PrathaReaderRef } from '../types';
import { isPrathaPilotReady, prathaVerificationIssues } from '../verification';

const REPO = join(__dirname, '..', '..', '..', '..', '..');
const DATA = join(__dirname, '..', '..');
const nonEmpty = (s: string | undefined) => expect((s ?? '').trim().length).toBeGreaterThan(0);

describe('catalogue coverage', () => {
  test('every PRD-46 Appendix A row is in the registry exactly once, and nothing else is', () => {
    const prd = readFileSync(join(REPO, 'docs/roadmap/prds/46-pratha-manyata.md'), 'utf8');
    // Only Appendix A is the catalogue; other tables (e.g. the §12 handover) cite row ids too.
    const appendixA = prd.slice(prd.indexOf('## Appendix A'), prd.indexOf('## Appendix B'));
    expect(appendixA.length).toBeGreaterThan(0);
    const listed = [...appendixA.matchAll(/^\| ((?:K|C|V|J|A|S|B|AS|M|P|MG|F|W|N|PN|PR|SN|T|BD)\d+) \|/gm)].map((m) => m[1]);
    // The unnumbered Kartik regional rows and the Adhik Maas line carry these ids.
    const expected = [...listed, 'K27', 'K28', 'K29', 'AD1'].sort();
    const ids = PRATHA_ENTRIES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(expected);
  });
});

describe('row shape', () => {
  test.each(PRATHA_ENTRIES.map((e) => [e.id, e] as const))('%s is bilingual and complete', (_id, e) => {
    nonEmpty(e.questionHi); nonEmpty(e.questionEn);
    nonEmpty(e.practiceHi); nonEmpty(e.practiceEn);
    nonEmpty(e.bhavHi); nonEmpty(e.bhavEn);
    expect(e.bodhHi === undefined).toBe(e.bodhEn === undefined);
    if (e.kind === 'bodh') { nonEmpty(e.bodhHi); nonEmpty(e.bodhEn); }
    expect([1, 2, 3, 4]).toContain(e.phase);
    expect(e.kathas.length).toBeGreaterThan(0);
    for (const k of e.kathas) {
      nonEmpty(k.titleHi); nonEmpty(k.titleEn);
      nonEmpty(k.canonHi); nonEmpty(k.canonEn);
      expect(k.bodyHi.length).toBeGreaterThan(0);
      expect(k.bodyEn.length).toBe(k.bodyHi.length);
      k.bodyHi.forEach(nonEmpty); k.bodyEn.forEach(nonEmpty);
      expect(k.regionHi === undefined).toBe(k.regionEn === undefined);
    }
  });

  test('month rows name a lunar month (or Adhik Maas), weekday rows a weekday, and no other row does', () => {
    for (const e of PRATHA_ENTRIES) {
      const { masa, adhikMasa, vaar } = e.anchors;
      if (e.axis === 'masa') expect(Boolean(masa?.length) !== Boolean(adhikMasa)).toBe(true);
      else expect(masa === undefined && adhikMasa === undefined).toBe(true);
      for (const m of masa ?? []) expect(m >= 1 && m <= 12).toBe(true);
      expect(Boolean(vaar?.length)).toBe(e.axis === 'vaar');
      for (const d of vaar ?? []) expect(d >= 0 && d <= 6).toBe(true);
    }
  });
});

describe('provenance (PRD-46 §4)', () => {
  const kathas = PRATHA_ENTRIES.flatMap((e) => e.kathas.map((k) => ({ id: e.id, k })));

  test('a folk story says so and names no text', () => {
    for (const { k } of kathas.filter(({ k }) => k.tier === 'lok')) {
      expect(k.canonHi).toMatch(/लोक-परम्परा/u);
      expect(k.canonEn).toMatch(/Folk tradition/);
    }
  });

  test('a Purana story names its adhyaya or says it is under review', () => {
    for (const { k } of kathas.filter(({ k }) => k.tier === 'purana')) {
      expect(k.canonHi).toMatch(/\d|समीक्षाधीन/u);
    }
  });

  test('a historical origin is labelled as history', () => {
    for (const { k } of kathas.filter(({ k }) => k.tier === 'itihas')) {
      expect(k.canonHi).toMatch(/इतिहास/u);
      expect(k.canonEn).toMatch(/History/);
    }
  });

  test('every row meets its status threshold, and every draft says so loudly', () => {
    for (const e of PRATHA_ENTRIES) {
      const { referenceUrls, verificationNote, confidence } = e.source;
      expect(['Certain', 'Likely', 'Guessing']).toContain(confidence);
      expect(new Set(referenceUrls).size).toBe(referenceUrls.length);
      for (const u of referenceUrls) expect(u).toMatch(/^(https:\/\/|repo:)/);
      expect(verificationNote).toMatch(/^\d{4}-\d{2}-\d{2}/);
      if (e.status === 'verified') {
        expect(prathaVerificationIssues(e)).toEqual([]);
        expect(referenceUrls.length).toBeGreaterThanOrEqual(2);
        expect(referenceUrls.some((u) => u.startsWith('https://'))).toBe(true);
        expect(verificationNote).not.toMatch(/DRAFT/);
      } else {
        expect(verificationNote).toMatch(/DRAFT — NOT VERIFIED/);
      }
    }
  });
});

describe('reader refs point at the exact bundled verse their canon line cites', () => {
  function resolve(ref: PrathaReaderRef): { number?: number; chapter?: number; reference?: string } | undefined {
    const dir = ref.kind === 'gita' ? 'gita' : 'valmiki-ramayan';
    const file = join(DATA, dir, `chapter-${String(ref.chapter).padStart(2, '0')}.json`);
    return (JSON.parse(readFileSync(file, 'utf8')) as { verses: { number?: number; chapter?: number; reference?: string }[] }).verses[ref.verseIndex];
  }
  const withRefs = PRATHA_ENTRIES.flatMap((e) => e.kathas.filter((k) => k.ref).map((k) => ({ e, k })));

  test('the registry quotes something, so this check is not vacuous', () => {
    expect(withRefs.length).toBeGreaterThan(0);
  });

  test.each(withRefs.map(({ e, k }) => [`${e.id} · ${k.titleEn}`, e, k] as const))('%s', (_label, e, k) => {
    const ref = k.ref!;
    const verse = resolve(ref);
    expect(verse).toBeDefined();
    const cite = ref.kind === 'gita' ? `${ref.chapter}.${verse!.number}` : verse!.reference!;
    const canon = `${k.canonHi} ${k.canonEn}`;
    if (ref.kind === 'gita') {
      expect(verse!.chapter).toBe(ref.chapter);
      // "Gita 10.35" or a range "Gita 17.7–10" that contains the verse.
      const covered = [...canon.matchAll(/(\d+)\.(\d+)(?:–(\d+))?/g)].some(
        (m) => Number(m[1]) === ref.chapter && verse!.number! >= Number(m[2]) && verse!.number! <= Number(m[3] ?? m[2])
      );
      expect(covered).toBe(true);
    } else {
      expect(canon).toContain(cite);
    }
    // The bundled Aditya Hridaya sarga is a defective corpus row (PRD-46 §0.2).
    expect(cite.startsWith('6.107.')).toBe(false);
    // The corpus file is named as a reference, so a reviewer opens it.
    const file = `repo:mobile/src/data/${ref.kind === 'gita' ? 'gita' : 'valmiki-ramayan'}/chapter-${String(ref.chapter).padStart(2, '0')}.json`;
    expect(e.source.referenceUrls).toContain(file);
  });
});

describe('links point at what the app ships', () => {
  const sets: Record<string, Set<string>> = {
    ruleIds: new Set(OBSERVANCE_RULES.map((r) => r.id)),
    kathaIds: new Set(KATHA_CATALOG.map((k) => k.id)),
    bhogIds: new Set(BHOG_CONTENT.map((b) => b.id)),
    vidhiIds: new Set(ALL_VIDHI_ENTRIES.map((v) => v.id)),
    daanOccasionIds: new Set(DAAN_OCCASION_ENTRIES.map((d) => d.id)),
    theerthIds: new Set<string>(baseTemples.map((t) => t.id)),
    libraryIds: new Set(library.map((l) => l.id)),
    prathaIds: new Set(PRATHA_ENTRIES.map((p) => p.id)),
  };
  type LinkKey = 'ruleIds' | 'kathaIds' | 'bhogIds' | 'vidhiIds' | 'daanOccasionIds' | 'theerthIds' | 'libraryIds' | 'prathaIds';

  test.each(Object.keys(sets) as LinkKey[])('every %s anchor resolves', (key) => {
    const missing = PRATHA_ENTRIES.flatMap((e) => (e.anchors[key] ?? []).filter((id) => !sets[key].has(id)).map((id) => `${e.id}→${id}`));
    expect(missing).toEqual([]);
  });

  test('a row never links to itself', () => {
    for (const e of PRATHA_ENTRIES) expect(e.anchors.prathaIds ?? []).not.toContain(e.id);
  });
});

describe('draft invisibility', () => {
  const drafts = PRATHA_ENTRIES.filter((e) => e.status === 'draft');

  test('accessors expose verified rows only, and the door predicate agrees', () => {
    expect(drafts.length).toBeGreaterThan(0);
    for (const e of getAllPratha()) expect(e.status).toBe('verified');
    expect(getPratha(drafts[0].id)).toBeNull();
    expect(getPrathaByAxis(drafts[0].axis).some((e) => e.id === drafts[0].id)).toBe(false);
    expect(hasPratha()).toBe(isPrathaPilotReady(PRATHA_ENTRIES));
    for (const e of [...getPrathaForRule('dhanteras'), ...getPrathaForMasa(8), ...getPrathaForVaar(0)]) {
      expect(e.status).toBe('verified');
    }
  });

  test('flipping a row lights it on every selector with no code change (non-vacuous gate)', () => {
    const k10 = PRATHA_ENTRIES.find((e) => e.id === 'K10')!;
    const w8 = PRATHA_ENTRIES.find((e) => e.id === 'W8')!;
    const flipped: PrathaEntry[] = PRATHA_ENTRIES.map((e) =>
      e === k10 || e === w8 ? { ...e, status: 'verified' as const } : e
    );
    const visible = verifiedOnly(flipped);
    expect(visible.map((e) => e.id).sort()).toEqual(
      [k10, w8].filter((e) => e.status === 'draft').map((e) => e.id).concat(getAllPratha().map((e) => e.id)).sort()
    );
    expect(selectById(visible, 'K10')).not.toBeNull();
    expect(selectForRule(visible, 'dhanteras').map((e) => e.id)).toContain('K10');
    expect(selectForMasa(visible, 8).map((e) => e.id)).toContain('K10');
    expect(selectForMasa(visible, 8, true).map((e) => e.id)).not.toContain('K10');
    expect(selectForVaar(visible, 0).map((e) => e.id)).toContain('W8');
  });
});

describe('activation and provenance regression cases', () => {
  const seed = PRATHA_ENTRIES.find((entry) => entry.id === 'K1')!;
  const rows = (count: number): PrathaEntry[] => Array.from({ length: count }, (_, i) => ({ ...seed, id: `fixture-${i}` }));

  test('nine Kartik rows, drafts and other months cannot open the pilot; ten can', () => {
    expect(isPrathaPilotReady(rows(9))).toBe(false);
    expect(isPrathaPilotReady(rows(10))).toBe(true);
    expect(isPrathaPilotReady(rows(10).map((e) => ({ ...e, status: 'draft' })))).toBe(false);
    expect(isPrathaPilotReady(rows(10).map((e) => ({ ...e, anchors: { masa: [9] } })))).toBe(false);
    expect(hasPrathaForMasa(8)).toBe(hasPratha() && getPrathaForMasa(8).length >= 3);
    expect(hasPrathaForMasa(8, true)).toBe(hasPratha() && getPrathaForMasa(8, true).length >= 3);
  });

  test('two row references do not verify every story automatically', () => {
    const invalid = { ...seed, kathas: [{ ...seed.kathas[0], referenceUrls: [seed.source.referenceUrls[0]] }] };
    expect(prathaVerificationIssues(invalid)).toContain('K1.kathas[0]: two opened sources required for this story');
  });

  test('pending chapter cannot be published by merely flipping status', () => {
    const invalid = { ...seed, kathas: [{ ...seed.kathas[0], canonEn: 'Padma Purana (adhyaya under review)' }] };
    expect(prathaVerificationIssues(invalid)).toContain('K1.kathas[0]: unresolved canon');
  });
});

describe('copy discipline', () => {
  const rendered = JSON.stringify(PRATHA_ENTRIES.map(({ source: _s, ...rest }) => rest));

  test('every Devanagari string is well-formed (no orphan combining marks)', () => {
    expect(findDevanagariDefects(rendered).map(describeDevanagariDefect)).toEqual([]);
  });

  test('English fields carry no Devanagari, and no Hindi body quotes verse text', () => {
    for (const e of PRATHA_ENTRIES) {
      const en = [e.questionEn, e.practiceEn, e.bhavEn, e.bodhEn ?? '', ...e.kathas.flatMap((k) => [k.titleEn, k.canonEn, k.regionEn ?? '', ...k.bodyEn])];
      for (const s of en) expect(s).not.toMatch(/[ऀ-ॿ]/u);
      for (const k of e.kathas) for (const p of k.bodyHi) expect(p).not.toMatch(/॥/u);
    }
  });

  test('what a row says about the custom never prescribes, threatens or rules (PRD-46 §7)', () => {
    // Curses inside a story are narrative and stay; the guard covers the
    // practice, the meaning and the correction — the app's own voice.
    const banned = [
      /चाहिए/u, /अवश्य/u, /अशुभ/u, /दोष/u, /श्राप/u, /शाप/u, /पाप लगेगा/u, /अनिष्ट/u, /दुर्भाग्य/u, /गलती से भी/u,
      /\bmust\b/i, /\bshould\b/i, /\bhave to\b/i, /\binauspicious\b/i, /\bunlucky\b/i, /\bbad luck\b/i, /\bdosha\b/i, /\bcurse/i, /\bnever do\b/i,
    ];
    const offenders: string[] = [];
    for (const e of PRATHA_ENTRIES) {
      for (const [field, text] of [['practice', e.practiceHi + ' ' + e.practiceEn], ['bhav', e.bhavHi + ' ' + e.bhavEn], ['bodh', (e.bodhHi ?? '') + ' ' + (e.bodhEn ?? '')]] as const) {
        for (const re of banned) if (re.test(text)) offenders.push(`${e.id}.${field} ${re}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

/**
 * दान-पुण्य registry invariants (PRD-26, RULEBOOK §24): shape and bilingual
 * completeness, the two-reference source threshold, draft invisibility,
 * rule-id referential integrity against the LIVE observance solver, the
 * exact-beats-suffix matching contract, directory hygiene (https, no UPI,
 * staleness), the gupt-daan structural guarantee, and the stance-guard copy
 * check (no score/streak/fear vocabulary anywhere in the feature's copy).
 */
import chapter17 from '../../gita/chapter-17.json';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { getRuleById } from '@/panchang/vratCatalog';
import { getKathaContent } from '@/panchang/kathaContent';

import { DAAN_PRINCIPLE_ENTRIES, getDaanPrinciples } from '../principles';
import { DAAN_OCCASION_ENTRIES, getDaanOccasions } from '../occasions';
import { DAAN_VAAR_ENTRIES, DAAN_VAAR_SOURCE, getDaanVaarEntry } from '../vaar';
import { DAAN_KATHA_ENTRIES, getDaanKatha } from '../kathas';
import { DAAN_ORG_ENTRIES, getDaanOrgs, isOrgRowStale } from '../directory';
import { getDaanOccasionForRule } from '../index';
import {
  DAAN_CATEGORIES,
  buildLedgerCsv,
  isDaanLedgerEntry,
  sanitizeLedgerEntry,
  parseLedgerPayload,
  type DaanLedgerEntry,
} from '../ledger';
import type { DaanSource } from '../types';

const nonEmpty = (s: string) => expect(s.trim().length).toBeGreaterThan(0);

function checkSource(source: DaanSource, status: 'draft' | 'verified' = 'verified') {
  // Verified rows carry ≥2 references (a draft is draft precisely because it
  // still lacks the second); every row carries ≥1 https URL, no duplicates.
  expect(source.referenceUrls.length).toBeGreaterThanOrEqual(status === 'verified' ? 2 : 1);
  expect(new Set(source.referenceUrls).size).toBe(source.referenceUrls.length);
  expect(source.referenceUrls.some((u) => u.startsWith('https://'))).toBe(true);
  nonEmpty(source.verificationNote);
  // Dated adjudication — the note carries an ISO date.
  expect(source.verificationNote).toMatch(/\d{4}-\d{2}-\d{2}/);
}

describe('registry shape', () => {
  test('ids are unique across every daan registry', () => {
    const ids = [
      ...DAAN_PRINCIPLE_ENTRIES.map((e) => `p:${e.id}`),
      ...DAAN_OCCASION_ENTRIES.map((e) => `o:${e.id}`),
      ...DAAN_KATHA_ENTRIES.map((e) => `k:${e.id}`),
      ...DAAN_ORG_ENTRIES.map((e) => `d:${e.id}`),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('principles: bilingual fields, verse/iast pairing, sources', () => {
    for (const entry of DAAN_PRINCIPLE_ENTRIES) {
      for (const field of [entry.titleHi, entry.titleEn, entry.citeHi, entry.citeEn, entry.meaningHi, entry.meaningEn]) nonEmpty(field);
      expect(Boolean(entry.verseLines)).toBe(Boolean(entry.iastLines));
      if (entry.verseLines) expect(entry.verseLines.length).toBe(entry.iastLines!.length);
      checkSource(entry.source, entry.status);
    }
  });

  test('occasions: bilingual fields, non-empty items with reasons, sources', () => {
    for (const entry of DAAN_OCCASION_ENTRIES) {
      for (const field of [entry.titleHi, entry.titleEn, entry.whyHi, entry.whyEn]) nonEmpty(field);
      expect(entry.items.length).toBeGreaterThan(0);
      for (const item of entry.items) {
        for (const field of [item.nameHi, item.nameEn, item.reasonHi, item.reasonEn]) nonEmpty(field);
      }
      // A row must key to something: exact ids or a suffix family.
      expect(entry.ruleIds.length + (entry.ruleIdSuffixes?.length ?? 0)).toBeGreaterThan(0);
      checkSource(entry.source);
    }
  });

  test('kathas: bilingual paragraph parity, teaching + canon lines, sources', () => {
    for (const entry of DAAN_KATHA_ENTRIES) {
      for (const field of [entry.titleHi, entry.titleEn, entry.subtitleHi, entry.subtitleEn, entry.teachingHi, entry.teachingEn, entry.canonHi, entry.canonEn]) nonEmpty(field);
      expect(entry.sections.length).toBeGreaterThan(0);
      for (const section of entry.sections) {
        expect(section.paragraphsHi.length).toBeGreaterThan(0);
        expect(section.paragraphsHi.length).toBe(section.paragraphsEn.length);
        for (const p of [...section.paragraphsHi, ...section.paragraphsEn]) nonEmpty(p);
      }
      checkSource(entry.source);
    }
  });

  test('vaar table covers each weekday exactly once and wraps safely', () => {
    expect([...DAAN_VAAR_ENTRIES].map((e) => e.weekday).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    for (const entry of DAAN_VAAR_ENTRIES) {
      for (const field of [entry.vaarHi, entry.vaarEn, entry.grahaHi, entry.grahaEn, entry.itemsHi, entry.itemsEn]) nonEmpty(field);
    }
    checkSource(DAAN_VAAR_SOURCE);
    expect(getDaanVaarEntry(7).weekday).toBe(0);
    expect(getDaanVaarEntry(-1).weekday).toBe(6);
  });
});

describe('draft invisibility (RULEBOOK §24)', () => {
  test('draft rows never reach the accessors', () => {
    expect(DAAN_PRINCIPLE_ENTRIES.some((e) => e.status === 'draft')).toBe(true); // dasa-dana exercises the gate
    expect(getDaanPrinciples().every((e) => e.status === 'verified')).toBe(true);
    expect(getDaanOccasions().every((e) => e.status === 'verified')).toBe(true);
    expect(getDaanOrgs().every((e) => e.status === 'verified')).toBe(true);
  });
});

describe('referential integrity against the live solver and katha library', () => {
  test('every exact ruleId is a real observance rule', () => {
    for (const entry of DAAN_OCCASION_ENTRIES) {
      for (const ruleId of entry.ruleIds) {
        expect(getRuleById(ruleId)).not.toBeNull();
      }
    }
  });

  test('every suffix family matches at least one real rule', () => {
    const ids = OBSERVANCE_RULES.map((r) => r.id);
    for (const entry of DAAN_OCCASION_ENTRIES) {
      for (const suffix of entry.ruleIdSuffixes ?? []) {
        expect(ids.some((id) => id.endsWith(suffix))).toBe(true);
      }
    }
  });

  test('every kathaId cross-link resolves to shipped katha content', () => {
    for (const entry of DAAN_OCCASION_ENTRIES) {
      if (entry.kathaId) expect(getKathaContent(entry.kathaId)).not.toBeNull();
      if (entry.daanKathaId) expect(getDaanKatha(entry.daanKathaId)).not.toBeNull();
    }
    for (const org of DAAN_ORG_ENTRIES) {
      if (org.daanKathaId) expect(getDaanKatha(org.daanKathaId)).not.toBeNull();
    }
  });

  test('the Gita deep link points at the bundled 17.20', () => {
    const sattvik = DAAN_PRINCIPLE_ENTRIES.find((e) => e.id === 'sattvik-daan')!;
    expect(sattvik.gitaRef).toEqual({ chapter: 17, verseIndex: 19 });
    const verse = (chapter17 as { verses: { sanskrit: string[] }[] }).verses[19];
    expect(verse.sanskrit[0].startsWith('दातव्यमिति')).toBe(true);
    // The registry carries the bundle's own text, verbatim.
    expect(sattvik.verseLines![0]).toBe(verse.sanskrit[0]);
  });
});

describe('rule matching: exact beats suffix (PRD-26 §10.1)', () => {
  test('named exceptions win their families', () => {
    expect(getDaanOccasionForRule('shattila-ekadashi')?.id).toBe('shattila-ekadashi');
    expect(getDaanOccasionForRule('kamada-ekadashi')?.id).toBe('ekadashi-parana');
    expect(getDaanOccasionForRule('makar-sankranti')?.id).toBe('makar-sankranti');
    expect(getDaanOccasionForRule('kumbha-sankranti')?.id).toBe('sankranti-snana-daan');
  });

  test('days without an attested daan tradition get NO row', () => {
    expect(getDaanOccasionForRule('masik-shivaratri')).toBeNull();
    expect(getDaanOccasionForRule('pradosh-vrat-shukla')).toBeNull();
    expect(getDaanOccasionForRule('sankashti-chaturthi-vrat')).toBeNull();
  });
});

describe('directory hygiene (PRD-26 §6.2)', () => {
  test('https-only official channels, no UPI anywhere, dated verification', () => {
    for (const org of DAAN_ORG_ENTRIES) {
      expect(org.officialUrl.startsWith('https://')).toBe(true);
      expect(org.donateUrl.startsWith('https://')).toBe(true);
      expect(org.donateUrl.toLowerCase()).not.toContain('upi');
      expect(org.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const field of [org.nameHi, org.nameEn, org.aboutHi, org.aboutEn, org.registrationHi, org.registrationEn]) nonEmpty(field);
      expect(Boolean(org.nonMonetaryHi)).toBe(Boolean(org.nonMonetaryEn));
      expect(org.categories.length).toBeGreaterThan(0);
      for (const cat of org.categories) expect(DAAN_CATEGORIES).toContain(cat);
      checkSource(org.source);
    }
  });

  test('registration copy never claims a number the app did not read', () => {
    // Numbers are never transcribed: no long digit runs in registration lines.
    for (const org of DAAN_ORG_ENTRIES) {
      expect(org.registrationHi).not.toMatch(/\d{5,}/);
      expect(org.registrationEn).not.toMatch(/\d{5,}/);
    }
  });

  test('stale rows (18 months past verification) disappear from the accessor', () => {
    const org = DAAN_ORG_ENTRIES[0];
    const verified = new Date(`${org.verifiedOn}T00:00:00Z`);
    const fresh = new Date(verified);
    fresh.setUTCMonth(fresh.getUTCMonth() + 17);
    const stale = new Date(verified);
    stale.setUTCMonth(stale.getUTCMonth() + 19);
    expect(isOrgRowStale(org, fresh)).toBe(false);
    expect(isOrgRowStale(org, stale)).toBe(true);
    expect(getDaanOrgs(stale).find((o) => o.id === org.id)).toBeUndefined();
  });
});

describe('gupt-daan structural guarantee + ledger core', () => {
  const base: DaanLedgerEntry = {
    id: 'daan-1',
    isoDate: '2026-01-14',
    tithiHi: 'माघ कृष्ण द्वितीया, रविवार',
    tithiEn: 'Magha Krishna Dwitiya, Sunday',
    category: 'anna',
    gupt: false,
    createdAtMs: 1700000000000,
  };

  test('sanitize strips detail from gupt entries; validator rejects unsanitized ones', () => {
    const gupt: DaanLedgerEntry = { ...base, gupt: true, note: 'x', amountInr: 100, occasionId: 'makar-sankranti' };
    expect(isDaanLedgerEntry(gupt)).toBe(false);
    const sanitized = sanitizeLedgerEntry(gupt);
    expect(sanitized.note).toBeUndefined();
    expect(sanitized.amountInr).toBeUndefined();
    expect(sanitized.occasionId).toBeUndefined();
    expect(isDaanLedgerEntry(sanitized)).toBe(true);
  });

  test('payload parsing drops malformed rows and wrong versions, never throws', () => {
    expect(parseLedgerPayload('not json')).toEqual([]);
    expect(parseLedgerPayload(JSON.stringify({ version: 99, entries: [base] }))).toEqual([]);
    const mixed = JSON.stringify({ version: 1, entries: [base, { id: '' }, { ...base, id: 'daan-2', amountInr: -5 }] });
    expect(parseLedgerPayload(mixed)).toEqual([base]);
  });

  test('CSV export keeps the gupt guarantee and escapes fields', () => {
    const noted: DaanLedgerEntry = { ...base, id: 'daan-2', note: 'khichdi, "mandir"', amountInr: 251 };
    const gupt = sanitizeLedgerEntry({ ...base, id: 'daan-3', isoDate: '2026-01-20', gupt: true, note: 'secret' });
    const csv = buildLedgerCsv([noted, gupt, base]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('date,tithi,category,note,amount_inr');
    expect(csv).not.toContain('secret');
    expect(csv).toContain('"khichdi, ""mandir"""');
    const guptLine = lines.find((l) => l.includes('gupt'))!;
    expect(guptLine.endsWith(',,')).toBe(true);
  });
});

describe('stance-guard copy check (PRD-26 §2.2/§2.7)', () => {
  test('no score/streak/fear vocabulary anywhere in daan copy', () => {
    const corpus = JSON.stringify({
      p: DAAN_PRINCIPLE_ENTRIES.map(({ source, ...rest }) => rest),
      o: DAAN_OCCASION_ENTRIES.map(({ source, ...rest }) => rest),
      k: DAAN_KATHA_ENTRIES.map(({ source, ...rest }) => rest),
      d: DAAN_ORG_ENTRIES.map(({ source, ...rest }) => rest),
      v: DAAN_VAAR_ENTRIES,
    }).toLowerCase();
    const banned = [
      'streak', 'score', 'leaderboard', 'points', 'lucky', 'jackpot',
      'दुर्भाग्य', 'अशुभ फल', 'दोष-निवारण', 'दोष लगेगा', 'संकट टलेगा', 'पाप लगेगा',
    ];
    for (const word of banned) {
      expect(corpus.includes(word)).toBe(false);
    }
  });
});

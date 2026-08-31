/**
 * वास्तु registry invariants (PRD-24, RULEBOOK §22.10): shape, the two-domain
 * source threshold, draft invisibility, the stance-guard copy check, and full
 * declination coverage of the bundled city list.
 */
import { CITIES } from '@/panchang/locations';
import { DISHA_ORDER } from '@/panchang/eventMuhurat';
import { DECLINATION_BY_CITY, getDeclinationForCity } from '../declination';
import {
  MANDIR_GUIDANCE_ENTRIES,
  getMandirGuidance,
} from '../mandirGuidance';
import {
  VASTU_ROOM_ENTRIES,
  getVastuRoomEntries,
  getVastuRoomEntry,
} from '../roomGuidance';
import type { MandirGuidanceEntry, VastuRoomEntry } from '../types';

const uniqueDomains = (urls: readonly string[]): number =>
  new Set(urls.map((u) => new URL(u).hostname.replace(/^www\./, ''))).size;

describe('registry shape', () => {
  test('ids are unique across both registries', () => {
    const ids = [...VASTU_ROOM_ENTRIES, ...MANDIR_GUIDANCE_ENTRIES].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('room entries carry non-empty bilingual convention + reason, and valid dik', () => {
    for (const entry of VASTU_ROOM_ENTRIES) {
      for (const field of [entry.titleHi, entry.titleEn, entry.conventionHi, entry.conventionEn, entry.reasonHi, entry.reasonEn]) {
        expect(field.trim().length).toBeGreaterThan(0);
      }
      for (const dik of entry.directions) expect(DISHA_ORDER).toContain(dik);
      // Accommodation is bilingual-or-absent, never half-authored.
      expect(Boolean(entry.accommodationHi)).toBe(Boolean(entry.accommodationEn));
    }
  });

  test('the Brahmasthan is the single centre entry and carries no dik', () => {
    const centres = VASTU_ROOM_ENTRIES.filter((e) => e.isCenter);
    expect(centres.map((e) => e.id)).toEqual(['brahmasthan']);
    expect(centres[0].directions).toHaveLength(0);
    // Every non-centre entry names at least one dik.
    for (const entry of VASTU_ROOM_ENTRIES) {
      if (!entry.isCenter) expect(entry.directions.length).toBeGreaterThan(0);
    }
  });

  test('mandir entries carry non-empty bilingual rows; notes are bilingual-or-absent', () => {
    for (const entry of MANDIR_GUIDANCE_ENTRIES) {
      expect(entry.rows.length).toBeGreaterThan(0);
      for (const row of [...entry.rows, ...(entry.avoidRows ?? [])]) {
        expect(row.textHi.trim().length).toBeGreaterThan(0);
        expect(row.textEn.trim().length).toBeGreaterThan(0);
      }
      expect(Boolean(entry.noteHi)).toBe(Boolean(entry.noteEn));
    }
  });
});

describe('source threshold (RULEBOOK §22.3)', () => {
  test('every VERIFIED entry cites ≥2 independent domains and a dated verification note', () => {
    for (const entry of [...VASTU_ROOM_ENTRIES, ...MANDIR_GUIDANCE_ENTRIES]) {
      if (entry.status !== 'verified') continue;
      expect(uniqueDomains(entry.source.referenceUrls)).toBeGreaterThanOrEqual(2);
      expect(entry.source.verificationNote).toMatch(/20\d{2}-\d{2}-\d{2}/);
    }
  });
});

describe('draft invisibility (RULEBOOK §22.2)', () => {
  test('accessors expose verified entries only', () => {
    expect(getVastuRoomEntries().every((e) => e.status === 'verified')).toBe(true);
    expect(getMandirGuidance().every((e) => e.status === 'verified')).toBe(true);
  });

  test('the draft ancestor-photos entry is indistinguishable from absence', () => {
    const draft = MANDIR_GUIDANCE_ENTRIES.find((e) => e.id === 'ancestor-photos');
    expect(draft?.status).toBe('draft');
    expect(getMandirGuidance().some((e) => e.id === 'ancestor-photos')).toBe(false);
  });

  test('getVastuRoomEntry returns null for unknown ids', () => {
    expect(getVastuRoomEntry('no-such-room')).toBeNull();
  });
});

describe('stance guard (RULEBOOK §22.5) — customer copy carries no fear/remedy register', () => {
  const customerText = (entry: VastuRoomEntry | MandirGuidanceEntry): string => {
    const parts: string[] = [entry.titleHi, entry.titleEn];
    if ('conventionHi' in entry) {
      parts.push(entry.conventionHi, entry.conventionEn, entry.reasonHi, entry.reasonEn);
      if (entry.accommodationHi) parts.push(entry.accommodationHi, entry.accommodationEn ?? '');
    } else {
      for (const row of [...entry.rows, ...(entry.avoidRows ?? [])]) parts.push(row.textHi, row.textEn);
      if (entry.noteHi) parts.push(entry.noteHi, entry.noteEn ?? '');
    }
    return parts.join(' ');
  };

  // The forbidden register — dosha verdicts, remedies/upsell, pseudo-science,
  // misfortune threats. (वर्जित/'avoided' is convention language and stays legal.)
  const FORBIDDEN = [/dosha/i, /दोष/, /remed/i, /उपाय/, /यंत्र/, /yantra/i, /magnet/i, /चुंबक/, /misfortune/i, /अनिष्ट/, /हानि होगी/, /detox/i, /energy field/i];

  test.each([...VASTU_ROOM_ENTRIES, ...MANDIR_GUIDANCE_ENTRIES].map((e) => [e.id, e] as const))(
    '%s',
    (_id, entry) => {
      const text = customerText(entry);
      for (const pattern of FORBIDDEN) expect(text).not.toMatch(pattern);
    }
  );
});

describe('declination table (PRD-24 §3)', () => {
  test('covers every bundled city id', () => {
    for (const city of CITIES) {
      expect(getDeclinationForCity(city.id)).not.toBeNull();
    }
  });

  test('values sit in the honest India band (−5°…+5°) and unknown ids return null', () => {
    for (const value of Object.values(DECLINATION_BY_CITY)) {
      expect(Math.abs(value)).toBeLessThanOrEqual(5);
    }
    expect(getDeclinationForCity('atlantis')).toBeNull();
  });
});

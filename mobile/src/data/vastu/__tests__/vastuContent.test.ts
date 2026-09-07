/**
 * वास्तु registry invariants (PRD-24, RULEBOOK §22.10): shape, the two-domain
 * source threshold, draft invisibility, the stance-guard copy check, and full
 * declination coverage of the bundled city list.
 */
import { CITIES } from '@/panchang/locations';
import { DISHA_ORDER } from '@/panchang/eventMuhurat';
import { DECLINATION_BY_CITY, getDeclinationForCity } from '../declination';
import { getAllDoorPadaEntriesForReview, getDoorPadaByIndex, getDoorPadasForSide } from '../doorPadas';
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

describe('typed placement sets (PRD-24 Phase 2 §B1)', () => {
  test('alternateDirections never overlap directions', () => {
    for (const entry of VASTU_ROOM_ENTRIES) {
      for (const dik of entry.alternateDirections ?? []) {
        expect(DISHA_ORDER).toContain(dik);
        expect(entry.directions).not.toContain(dik);
      }
    }
  });

  test('avoidDirections never overlap directions or alternates, and are diks or center', () => {
    for (const entry of VASTU_ROOM_ENTRIES) {
      for (const zone of entry.avoidDirections ?? []) {
        expect(zone === 'center' || DISHA_ORDER.includes(zone)).toBe(true);
        expect(entry.directions as readonly string[]).not.toContain(zone);
        expect((entry.alternateDirections ?? []) as readonly string[]).not.toContain(zone);
      }
    }
  });

  test('centre entries carry none of the three placement sets', () => {
    for (const entry of VASTU_ROOM_ENTRIES) {
      if (!entry.isCenter) continue;
      expect(entry.directions).toHaveLength(0);
      expect(entry.alternateDirections ?? []).toHaveLength(0);
      expect(entry.avoidDirections ?? []).toHaveLength(0);
    }
  });

  test('facingWhileUsing values are diks', () => {
    for (const entry of VASTU_ROOM_ENTRIES) {
      for (const dik of entry.facingWhileUsing ?? []) expect(DISHA_ORDER).toContain(dik);
    }
  });

  test('the typed sets mirror what the shipped prose already states', () => {
    expect(getVastuRoomEntry('kitchen')?.alternateDirections).toEqual(['northwest']);
    expect(getVastuRoomEntry('toilet')?.avoidDirections).toEqual(['northeast', 'center']);
    expect(getVastuRoomEntry('sleeping')?.avoidDirections).toEqual(['north']);
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
  // Phase 2 (PRD-24 Phase 2 §7) adds the score/verdict register: no composite
  // score, percentage, rating, or consult-an-expert copy anywhere in the registry.
  const FORBIDDEN = [/dosha/i, /दोष/, /remed/i, /उपाय/, /यंत्र/, /yantra/i, /magnet/i, /चुंबक/, /misfortune/i, /अनिष्ट/, /हानि होगी/, /detox/i, /energy field/i, /score/i, /\d+\s?%/, /अंक/, /rating/i, /needs? (fixing|attention)/i, /सुधार/, /expert/i, /विशेषज्ञ से/];

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

describe('द्वार-पद registry (PRD-24 Phase 2 §B3/§A5)', () => {
  const sides = getAllDoorPadaEntriesForReview();

  test('four cardinal walls, 8 padas each, global indexes contiguous 1–32 clockwise', () => {
    expect(sides.map((s) => s.side)).toEqual(['north', 'east', 'south', 'west']);
    const indexes = sides.flatMap((s) => s.padas.map((p) => p.index));
    expect(indexes).toEqual(Array.from({ length: 32 }, (_, i) => i + 1));
    for (const side of sides) expect(side.padas).toHaveLength(8);
  });

  test('every pada is bilingual and each wall names at least one auspicious pada', () => {
    for (const side of sides) {
      expect(side.padas.some((p) => p.auspicious)).toBe(true);
      for (const pada of side.padas) {
        expect(pada.nameHi.trim().length).toBeGreaterThan(0);
        expect(pada.nameEn.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('draft ships invisible: the verified-only accessors return null for every side (US-11)', () => {
    // The R2 ship state — every side draft, the ring hidden, door flow
    // facing-only. Each later flip to verified is a data-only OTA; when one
    // lands, THIS pin moves to that side deliberately.
    for (const side of ['north', 'east', 'south', 'west'] as const) {
      expect(getDoorPadasForSide(side)).toBeNull();
    }
    for (let index = 1; index <= 32; index += 1) {
      expect(getDoorPadaByIndex(index)).toBeNull();
    }
  });

  test('a draft side still carries the review bar: a source note pending §22.3', () => {
    for (const side of sides) {
      if (side.status === 'verified') {
        expect(side.source.referenceUrls.length).toBeGreaterThanOrEqual(2);
      } else {
        expect(side.source.verificationNote.length).toBeGreaterThan(0);
      }
    }
  });

  test('pada names carry no fear/remedy register (RULEBOOK §22.5)', () => {
    const FORBIDDEN = [/dosha/i, /दोष/, /remed/i, /उपाय/, /यंत्र/, /score/i, /अंक/, /rating/i];
    for (const side of sides) {
      const text = side.padas.map((p) => `${p.nameHi} ${p.nameEn} ${p.variantNote ?? ''}`).join(' ');
      for (const pattern of FORBIDDEN) expect(text).not.toMatch(pattern);
    }
  });
});

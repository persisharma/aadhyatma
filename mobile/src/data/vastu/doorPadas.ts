/**
 * द्वार-पद registry (PRD-24 Phase 2 §B3/§A5, US-11) — the 32 border padas of
 * the vastu purusha mandala, 8 per cardinal wall, and which of them the texts
 * name auspicious for a main door on that wall.
 *
 * Content-gated exactly like the room registry (RULEBOOK §22.2/§22.3): every
 * side ships `status: 'draft'` and is INVISIBLE behind the verified-only
 * accessor until two independent published domains concord — the pada ring
 * simply does not render and the door flow falls back to facing-only (US-11:
 * "facing only, no placeholder"). Each later flip to `verified` is a
 * data-only OTA.
 *
 * Geometry convention (shared with `padaForHeading` in vastu/compass.ts):
 * global indices 1–32 run CLOCKWISE from the north wall's western end (315°),
 * 11.25° per pada; a side's `padas` walk its wall clockwise on the compass —
 * north NW→NE, east NE→SE, south SE→SW, west SW→NW.
 */
import type { VastuContentStatus, VastuSource } from './types';

export type DoorPadaSide = 'north' | 'east' | 'south' | 'west';

export type DoorPada = {
  /** Global index 1–32, clockwise from 315°; side-contiguous (north 1–8, east 9–16, south 17–24, west 25–32). */
  index: number;
  nameHi: string;
  nameEn: string;
  /** The concordant convention: sources name this pada auspicious for a door on this wall. */
  auspicious: boolean;
  /** Named split between source traditions, when one exists. */
  variantNote?: string;
};

export type DoorPadaSideEntry = {
  side: DoorPadaSide;
  /** Exactly 8, clockwise along the wall. */
  padas: readonly DoorPada[];
  status: VastuContentStatus;
  source: VastuSource;
};

const PENDING_SOURCE: VastuSource = {
  referenceUrls: [],
  verificationNote:
    'DRAFT 2026-09-07 — border-deity names follow the common 45-devata paramasayika layout; ' +
    'the auspicious sets are the Brihat Samhita chapter-53 door convention (3rd/4th pada of each wall). ' +
    'Ships invisible until two independent published domains concord per RULEBOOK §22.3.',
};

const side = (
  s: DoorPadaSide,
  firstIndex: number,
  names: readonly [string, string, boolean][]
): DoorPadaSideEntry => ({
  side: s,
  status: 'draft',
  source: PENDING_SOURCE,
  padas: names.map(([nameHi, nameEn, auspicious], i) => ({
    index: firstIndex + i,
    nameHi,
    nameEn,
    auspicious,
  })),
});

const DOOR_PADAS: readonly DoorPadaSideEntry[] = [
  side('north', 1, [
    ['रोग', 'Roga', false],
    ['नाग', 'Naga', false],
    ['मुख्य', 'Mukhya', true],
    ['भल्लाट', 'Bhallata', true],
    ['सोम', 'Soma', false],
    ['भुजग', 'Bhujaga', false],
    ['अदिति', 'Aditi', false],
    ['दिति', 'Diti', false],
  ]),
  side('east', 9, [
    ['शिखी', 'Shikhi', false],
    ['पर्जन्य', 'Parjanya', false],
    ['जयन्त', 'Jayanta', true],
    ['इन्द्र', 'Indra', true],
    ['सूर्य', 'Surya', false],
    ['सत्य', 'Satya', false],
    ['भृश', 'Bhrisha', false],
    ['आकाश', 'Akasha', false],
  ]),
  side('south', 17, [
    ['अनिल', 'Anila', false],
    ['पूषा', 'Pusha', false],
    ['वितथ', 'Vitatha', true],
    ['गृहक्षत', 'Grihakshata', true],
    ['यम', 'Yama', false],
    ['गन्धर्व', 'Gandharva', false],
    ['भृंगराज', 'Bhringaraja', false],
    ['मृग', 'Mriga', false],
  ]),
  side('west', 25, [
    ['पितृ', 'Pitri', false],
    ['दौवारिक', 'Dauvarika', false],
    ['सुग्रीव', 'Sugriva', true],
    ['पुष्पदन्त', 'Pushpadanta', true],
    ['वरुण', 'Varuna', false],
    ['असुर', 'Asura', false],
    ['शोष', 'Shosha', false],
    ['पापयक्ष्मा', 'Papayakshma', false],
  ]),
];

/** Verified-only accessor (RULEBOOK §22.2): a draft side is indistinguishable
 * from absence — the ring hides, the door flow stays facing-only (US-11). */
export function getDoorPadasForSide(side: DoorPadaSide): DoorPadaSideEntry | null {
  const entry = DOOR_PADAS.find((candidate) => candidate.side === side);
  return entry && entry.status === 'verified' ? entry : null;
}

/** The pada a stored global index (1–32) names — verified sides only, so a
 * record captured against later-retracted content degrades to silence. */
export function getDoorPadaByIndex(index: number): { side: DoorPadaSide; pada: DoorPada } | null {
  for (const entry of DOOR_PADAS) {
    if (entry.status !== 'verified') continue;
    const pada = entry.padas.find((candidate) => candidate.index === index);
    if (pada) return { side: entry.side, pada };
  }
  return null;
}

/** Review/test-only view of every row including drafts — never for render. */
export function getAllDoorPadaEntriesForReview(): readonly DoorPadaSideEntry[] {
  return DOOR_PADAS;
}

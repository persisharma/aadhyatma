/**
 * वास्तु दिशा content shapes (PRD-24, RULEBOOK §22). Same discipline as the
 * bhog registry (§21): bilingual Hi/En parallel fields, a review-only `source`
 * block that is never rendered, and draft entries invisible behind the
 * verified-only accessors. Direction vocabulary is the muhurat engine's
 * `DishaDirection` — one 8-dik vocabulary app-wide, never a second enum.
 */
import type { DishaDirection } from '@/panchang/eventMuhurat';

export type VastuContentStatus = 'draft' | 'verified';

/** The nine mandala zones — the eight diks plus the ब्रह्मस्थान centre.
 * The assessment engine's whole vocabulary of place (PRD-24 Phase 2 §B1). */
export type VastuZone = DishaDirection | 'center';

/** Registry bucket a row belongs to (template grouping only — never a rule). */
export type VastuRoomCategory =
  | 'worship'
  | 'living'
  | 'utility'
  | 'structure'
  | 'element'
  | 'activity'
  | 'plot';

/**
 * Weight of the PRESCRIBED placement (PRD-24 Phase 2 §0.1):
 * `vidhana` (विधान — the texts prescribe it) or `shreyas` (श्रेयस् — preferred;
 * absence is not a fault). A row's `avoidDirections` is ALWAYS the निषेध class
 * regardless of this weight.
 */
export type VastuWeight = 'vidhana' | 'shreyas';

/** Which home kinds list the row in templates; plot-level rows are villa/plot only. */
export type HomeKind = 'flat' | 'villa' | 'plot';

export type VastuSource = {
  /** ≥2 independent published domains; review-only, never rendered. */
  referenceUrls: string[];
  /** Dated adjudication note (what was checked, where sources agree). */
  verificationNote: string;
  /** Named regional/sampradaya variance, when the sources split. */
  variantNote?: string;
};

/**
 * One room/element of the house. `directions` is the classical placement in
 * shared dik vocabulary; the Brahmasthān is the one centre entry (`isCenter`),
 * which carries no dik. The row is *convention with its reason*, never a
 * verdict — `accommodation*` holds the traditional allowance where the texts
 * state one (PRD-24 §2 stance guard).
 */
export type VastuRoomEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  directions: readonly DishaDirection[];
  isCenter?: boolean;
  /** Registry bucket; default `'living'`. Grouping only — never a rule. */
  category?: VastuRoomCategory;
  /** Weight of the prescribed placement; default `'vidhana'` (the shipped rows are all prescriptions). */
  weight?: VastuWeight;
  /** The texts' stated second place(s) — typed so it can be COMPARED, not just read in prose. */
  alternateDirections?: readonly DishaDirection[];
  /** Zones the texts PROSCRIBE for this room — always the निषेध class in a finding.
   * May include `'center'` (e.g. toilet). Typed only where the prose already states it. */
  avoidDirections?: readonly VastuZone[];
  /** The direction one FACES while using the room (cook → east). */
  facingWhileUsing?: readonly DishaDirection[];
  /** Which home kinds show this row in templates; default all. */
  appliesTo?: readonly HomeKind[];
  conventionHi: string;
  conventionEn: string;
  reasonHi: string;
  reasonEn: string;
  accommodationHi?: string;
  accommodationEn?: string;
  status: VastuContentStatus;
  source: VastuSource;
};

export type VastuGuidanceRow = {
  id: string;
  textHi: string;
  textEn: string;
};

/** घर का मंदिर upkeep set — bulleted guidance, with an optional warning-toned
 * "avoid" list (the निषेध half, same split the bhog panel draws). */
export type MandirGuidanceEntry = {
  id: string;
  titleHi: string;
  titleEn: string;
  rows: readonly VastuGuidanceRow[];
  avoidRows?: readonly VastuGuidanceRow[];
  noteHi?: string;
  noteEn?: string;
  status: VastuContentStatus;
  source: VastuSource;
};

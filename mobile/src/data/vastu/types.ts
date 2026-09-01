/**
 * वास्तु दिशा content shapes (PRD-24, RULEBOOK §22). Same discipline as the
 * bhog registry (§21): bilingual Hi/En parallel fields, a review-only `source`
 * block that is never rendered, and draft entries invisible behind the
 * verified-only accessors. Direction vocabulary is the muhurat engine's
 * `DishaDirection` — one 8-dik vocabulary app-wide, never a second enum.
 */
import type { DishaDirection } from '@/panchang/eventMuhurat';

export type VastuContentStatus = 'draft' | 'verified';

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

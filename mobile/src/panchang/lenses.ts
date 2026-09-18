/**
 * क्षेत्रीय पंचांग — the regional / sampradaya lens registry (PRD-42 §4.1–4.2).
 *
 * A *lens* is a calendar the user turns on. It is metadata on rules that would
 * otherwise not ship at all — never a retagging of what already ships. The two
 * rules that matter:
 *
 *   1. **A lens only ever ADDS.** A rule with no `lens` is UNIVERSAL and shown to
 *      everyone exactly as today. Turning a lens on can only grow a day; turning
 *      it off returns the day to what it was. A Jain household still sees
 *      Janmashtami; a Bengali household still sees Diwali.
 *   2. **An empty set is today's app, byte for byte.** Every engine entry point
 *      defaults to the empty set, so any caller that does not opt in — every
 *      notification path above all — behaves precisely as it did before this file
 *      existed.
 *
 * WHY A SEPARATE MODULE. This is pure data and pure functions: no React, no
 * AsyncStorage, no `expo-*`. `panchangPrefs.ts` reads the stored set on the launch
 * path and must stay importable there (see that file's isolation rules), and
 * `festivalEngine.ts` filters with it on a render path. Both can import this; it
 * imports nothing but its own types.
 */

/**
 * The 22 lenses: 20 regional + 2 traditions.
 *
 * The taxonomy is a CALENDAR taxonomy, not a political map — `braj-awadh-kashi`
 * rather than "Uttar Pradesh", because the UP calendar that differs from the
 * default *is* Braj and Kashi; `telugu` rather than two states, because Bathukamma
 * and Bonalu are Telangana's while Atla Tadde is both. Naming a lens after the
 * calendar keeps the app out of arguments it has no business in.
 */
export type ObservanceLens =
  // By region — 20
  | 'rajasthan' | 'braj-awadh-kashi' | 'bundelkhand-malwa' | 'punjab-haryana'
  | 'uttarakhand' | 'himachal' | 'kashmir'
  | 'bihar-mithila' | 'jharkhand' | 'chhattisgarh' | 'bengal' | 'odisha' | 'assam-northeast'
  | 'gujarat' | 'maharashtra' | 'goa-konkan'
  | 'karnataka' | 'telugu' | 'tamil' | 'kerala'
  // By tradition — 2
  | 'jain' | 'sindhi';

/** Sheet grouping. `tradition` renders last and is the only group that never auto-seeds. */

/** Every lens id, in registry order. The ONLY part of the taxonomy the launch path needs. */
export const LENS_IDS: readonly ObservanceLens[] = [
  'rajasthan', 'braj-awadh-kashi', 'bundelkhand-malwa', 'punjab-haryana',
  'uttarakhand', 'himachal', 'kashmir',
  'bihar-mithila', 'jharkhand', 'chhattisgarh', 'bengal', 'odisha', 'assam-northeast',
  'gujarat', 'maharashtra', 'goa-konkan',
  'karnataka', 'telugu', 'tamil', 'kerala',
  'jain', 'sindhi',
];

export const LENS_COUNT = LENS_IDS.length;

const LENS_ID_SET: ReadonlySet<string> = new Set(LENS_IDS);

export function isObservanceLens(value: unknown): value is ObservanceLens {
  return typeof value === 'string' && LENS_ID_SET.has(value);
}

/**
 * Every lens at once — NOT a user-facing state.
 *
 * `festivalEngine` resolves the year with this so the per-year cache is
 * lens-INDEPENDENT: a lens toggle must not invalidate an expensive astronomy
 * solve, and a day's answer must not depend on which calendars happened to be on
 * when the year was first resolved. Narrowing happens at the query layer, where
 * it is a cheap array filter.
 */
export const ALL_LENSES: ReadonlySet<ObservanceLens> = new Set(LENS_IDS);

/**
 * One lens's display definition, loaded LAZILY.
 *
 * The registry is bilingual names plus examples for 22 calendars and must not be
 * evaluated before the first frame — see `lensRegistry.ts`. Every caller of this
 * is a render path that has already painted (the sheet, a ledger subtitle), so a
 * `require` here costs nothing and keeps ~15 KB off every cold start.
 */
export function getLensDefinition(id: ObservanceLens): LensDefinitionShape | undefined {
  const registry = require('./lensRegistry') as typeof import('./lensRegistry');
  return registry.getLensDefinition(id);
}

/** What a chosen location seeds. Lazy for the same reason — seeding runs after interactions settle. */
export function lensesForLocation(input: {
  cityId: string;
  isTehsil?: boolean;
  labelEn?: string;
}): readonly ObservanceLens[] {
  const registry = require('./lensRegistry') as typeof import('./lensRegistry');
  return registry.lensesForLocation(input);
}

/** The shape `lensRegistry` exports, restated so this module never imports it for types either. */
export type LensDefinitionShape = {
  id: ObservanceLens;
  nameHi: string;
  nameEn: string;
  group: string;
  exampleHi: string;
  exampleEn: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Serialisation — a sorted comma list, so the stored string is canonical
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Serialise to a SORTED comma list. Sorting makes the stored value canonical, so
 * two sets with the same members always write the same bytes — which is what lets
 * the store skip a disk write, and a memo key compare by string.
 */
export function serializeLenses(lenses: Iterable<ObservanceLens>): string {
  return Array.from(new Set(lenses)).sort().join(',');
}

/**
 * Parse the stored value, dropping anything this build no longer ships.
 *
 * Unknown ids are dropped rather than rejected: a user who turned on a lens that a
 * later build renamed keeps the rest of their choices instead of losing all of
 * them. Absent, empty and corrupt all mean the same thing — the empty set, which
 * is today's app.
 */
export function parseStoredLenses(raw: string | null | undefined): Set<ObservanceLens> {
  const out = new Set<ObservanceLens>();
  if (typeof raw !== 'string' || raw.length === 0) return out;
  for (const part of raw.split(',')) {
    const id = part.trim();
    if (isObservanceLens(id)) out.add(id);
  }
  return out;
}

/**
 * Is this rule visible to a user holding `active`?
 *
 * A rule with no `lens` is universal — always true, which is the whole "a lens
 * only ever adds" contract in one line. A rule carrying several lenses (Rath
 * Yatra is `['odisha','bengal']`) needs only ONE of them: a shared observance is
 * one rule, never two.
 */
export function ruleVisibleForLenses(
  ruleLenses: readonly ObservanceLens[] | undefined,
  active: ReadonlySet<ObservanceLens>
): boolean {
  if (!ruleLenses || ruleLenses.length === 0) return true;
  return ruleLenses.some((l) => active.has(l));
}

// ──────────────────────────────────────────────────────────────────────────────
// The in-memory set — deliberately I/O-free, so the launch path can read it
// ──────────────────────────────────────────────────────────────────────────────

/**
 * The stored key. Declared here rather than in `lensStore.ts` because
 * `panchangPrefs.ts` reads it in the launch `multiGet` and must not pull an
 * AsyncStorage-importing module onto the launch path to learn its name.
 */
export const LENS_STORAGE_KEY = '@vedansh:panchang-lenses';

const lensListeners = new Set<() => void>();
let lensSnapshot: Set<ObservanceLens> | null = null;

/** The last loaded/saved set, or null before the first read lands. */
export function getLensSnapshot(): Set<ObservanceLens> | null {
  return lensSnapshot;
}

export function subscribeLenses(listener: () => void): () => void {
  lensListeners.add(listener);
  return () => {
    lensListeners.delete(listener);
  };
}

/** Publish a new set to every subscriber. The only writer is `lensStore.ts`. */
export function publishLenses(next: Set<ObservanceLens>): void {
  lensSnapshot = next;
  lensListeners.forEach((listener) => listener());
}

/**
 * Seed the snapshot synchronously from an already-read raw value.
 *
 * `panchangPrefs` reads this key in the SAME `multiGet` as the location and the
 * calendar system — the launch path may not grow a serial round trip — then hands
 * the raw string here, so the first painted day already knows the user's lenses
 * instead of flashing the unlensed day and correcting itself.
 */
export function seedLensSnapshot(raw: string | null): Set<ObservanceLens> {
  const parsed = parseStoredLenses(raw);
  publishLenses(parsed);
  return parsed;
}

/** Test-only: forget the in-memory set. */
export function __resetLensSnapshotForTests(): void {
  lensSnapshot = null;
  lensListeners.clear();
}

import {
  baseTemples,
  groupMeta,
  groupOrder,
  THEERTH_LAUNCH_VERSION,
  type BaseTempleEntry,
  type TheerthGroup,
} from './templeRows';

// Re-exported so every existing `from '@/data/theerth/temples'` import keeps
// working unchanged; the rows themselves now live in `templeRows.ts`, which the
// launch path reads on its own (see that file's header).
export { groupMeta, groupOrder, THEERTH_LAUNCH_VERSION };
export type { BaseTempleEntry, TheerthGroup };

/**
 * Theerth (तीर्थ) — curated list of famous Hindu pilgrimage temples across India.
 *
 * Each temple carries an array of group tags so it can appear under multiple
 * yatras (e.g., Rameshwaram is both a Jyotirlinga and a Char Dham; Kedarnath
 * is both a Jyotirlinga and a Chota Char Dham). Temples not in any structured
 * yatra carry an empty `groups: []` and appear under "Other Famous Temples".
 *
 * Coordinates are approximate (~10 m precision) and used only for pin
 * placement on the stylised India map.
 *
 * Detail prose is concise, paraphrased, and source-linked. It is not meant to
 * replace local temple-trust material or a qualified guide, but it gives every
 * detail screen useful location, significance, and origin-story context.
 */

export type TheerthSource = {
  label: string;
  url: string;
};

/**
 * One optional extended-detail section on a temple (सालासर बालाजी shipped the
 * first set). Each is a single prose block per language — the same contract as
 * significance/origin — under its own bilingual heading. Sections render after
 * the Origin Story in the order given, so author them as a reading sequence:
 * founding story → form of the deity → traditions → festivals → journey.
 */
export type TempleSection = {
  id: string;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
};

export type TempleDetail = {
  significanceHi: string;
  significanceEn: string;
  originStoryHi: string;
  originStoryEn: string;
  sources: readonly TheerthSource[];
  /** Deeper per-temple reading (sthapana katha, traditions, melas, yatra). Omit when unauthored. */
  sections?: readonly TempleSection[];
};

/**
 * A temple as the BROWSE surfaces know it: rows only — id, names, location,
 * deity, yatra groups. No prose. This is what `temples` holds and what the
 * launch path is allowed to touch.
 */
export type TempleListEntry = BaseTempleEntry & { addedInVersion: string };

/** A browse row with its reading merged in. Only `getTempleDetailById()` and
 * `templesWithDetails()` produce one, because only they pay to load the prose. */
export type TempleEntry = TempleListEntry & TempleDetail;

type TempleId = (typeof baseTemples)[number]['id'];

export const temples: readonly TempleListEntry[] = (
  baseTemples as readonly BaseTempleEntry[]
).map((temple) => ({ addedInVersion: THEERTH_LAUNCH_VERSION, ...temple }));

export function getTempleById(id: string): TempleListEntry | undefined {
  return temples.find((t) => t.id === id);
}

export function templesInGroup(group: TheerthGroup): TempleListEntry[] {
  return temples.filter((t) => t.groups.includes(group));
}

export function otherFamous(): TempleListEntry[] {
  return temples.filter((t) => t.groups.length === 0);
}

/**
 * The prose — legacy details plus every authored §12.6 reading — behind a
 * `require()` thunk, memoised after the first call.
 *
 * WHY A THUNK. `HomeStackNavigator` imports every screen statically, so this
 * module is on the launch path and anything it imports statically is evaluated
 * by Hermes before the first frame. The readings are ~460 KB today and grow by
 * ~70-100 KB per authored chunk; none of it is needed until someone opens a
 * temple. Requiring it lazily keeps it off the static graph entirely — the same
 * pattern `panchang/pincodes.ts` uses for its table. Do NOT turn either of
 * these back into a top-level `import`.
 */
let detailCache: Record<string, TempleDetail> | null = null;
function loadDetails(): Record<string, TempleDetail> {
  if (!detailCache) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { legacyDetails } = require('./details/legacy') as {
      legacyDetails: Record<string, TempleDetail>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { extendedDetails } = require('./details') as {
      extendedDetails: Record<string, TempleDetail>;
    };
    // A chunk entry under `details/` replaces that temple's legacy two-line
    // detail wholesale once its full §12.6 reading has been authored.
    detailCache = { ...legacyDetails, ...extendedDetails };
  }
  return detailCache;
}

/**
 * One temple with its full reading. This is the call that pays for the prose,
 * so make it from a detail screen — never from a list, a context or anything
 * else that runs before the user has chosen a temple.
 */
export function getTempleDetailById(id: string): TempleEntry | undefined {
  const row = getTempleById(id);
  if (!row) return undefined;
  return { ...row, ...loadDetails()[row.id] };
}

/** Every temple with its reading merged in — for the search index and the data
 * tests, which genuinely need all 71 at once. Loads the prose. */
export function templesWithDetails(): readonly TempleEntry[] {
  const details = loadDetails();
  return temples.map((t) => ({ ...t, ...details[t.id] }));
}

/**
 * Nationwide pincode → location resolution: the third and finest location tier, and
 * the ~165k post-office names (towns and villages) that make it searchable by name.
 *
 * WHY THIS IS NOT PART OF `CITIES`. Two hard reasons, both structural:
 *
 *   1. SIZE. 19,654 pincodes are 605 KB and their office names another 1.9 MB.
 *      `CITIES` is imported by `panchangPrefs`, which is imported by the launch
 *      prefetch — putting either table there would drag megabytes of JSON parse onto
 *      the cold-start path that #268/#269/#272 spent three commits clearing. So both
 *      are `require`d LAZILY, separately: GPS snapping and an exact pincode need only
 *      the coordinates; only a typed place name loads the office names.
 *   2. LANGUAGE. A `City` must carry `nameHi` in Devanagari (`location.test.ts` asserts
 *      it). Neither source dataset has Hindi place names, and `utils/transliterate.ts`
 *      runs Devanagari → Gujarati/Kannada, not Latin → Devanagari. Rather than machine-
 *      transliterate 165k names into plausible-but-wrong Devanagari, a pincode labels
 *      itself with Devanagari DIGITS plus its state — the only Hindi the generator
 *      hand-authors (36 strings). Hence `४१६००१ · महाराष्ट्र`, with district and office
 *      names carried in Latin, which the picker renders as their own line.
 *
 * Because the Hindi label is real Devanagari, it transliterates correctly into the gu/kn
 * reading languages through the normal `contentByLang` path — nothing special needed.
 *
 * A PLACE IS ITS PINCODE. Picking "Shahupuri" selects 416001: same `pin-` id, same
 * coordinate (the pincode's consensus point, not the office's own — office coordinates
 * are the noisy half of the source, see the generator). Only the English label
 * remembers the name the user picked. That keeps one id per coordinate, which every
 * cache keyed on `cityId` depends on.
 *
 * A pincode location is SELF-DESCRIBING on disk. `parseStoredLocation` rebuilds city
 * locations by looking `cityId` up in the bundled list; it cannot do that here without
 * importing this module's tables at launch, so a persisted `pin-` record carries its own
 * coordinates and labels and is validated structurally instead. That is safe precisely
 * because the tables are generated, immutable data: a stored record can only disagree
 * with the bundle if the dataset was regenerated, and the coordinates it holds were
 * still correct when written.
 *
 * Data provenance, gates and measured accuracy: `scripts/build-pincodes.mjs`.
 */
import { nearestCity } from './locations';
import type { LocationSource, PanchangLocation } from './types';

export type PincodeEntry = {
  /** The 6-digit pincode as typed, zero-padded. */
  pincode: string;
  /** The directory's district — current names, so 781001 is Kamrup Metro. */
  districtEn: string;
  stateEn: string;
  stateHi: string;
  latitude: number;
  longitude: number;
  elevation: number;
};

type PincodeTable = {
  format: number;
  count: number;
  stride: number;
  districts: string[];
  states: string[];
  statesEn: string[];
  statesHi: string[];
  rows: number[];
};

type OfficeTable = {
  format: number;
  pincodeCount: number;
  count: number;
  perPincode: number[];
  names: string;
  kinds: string;
};

const EXPECTED_FORMAT = 2;
const STRIDE = 6;

// Field offsets: [pincode, lat×1e4, lng×1e4, districtIdx, stateIdx, elevation].
const PIN = 0;
const LAT = 1;
const LNG = 2;
const DISTRICT = 3;
const STATE = 4;
const ELEVATION = 5;

let table: PincodeTable | null = null;
let loadFailed = false;

/**
 * The lazy load. Synchronous by necessity (Metro inlines JSON as a CommonJS module), so
 * callers should reach it off the interaction path — `PanchangLocationContext` does the
 * GPS lookup inside an already-async handler, and the picker only calls it once a query
 * actually looks like a pincode.
 */
function loadTable(): PincodeTable | null {
  if (table || loadFailed) return table;
  try {
    const data = require('./pincodeData.json') as PincodeTable;
    if (data.format !== EXPECTED_FORMAT || data.stride !== STRIDE) {
      loadFailed = true;
      return null;
    }
    table = data;
    return table;
  } catch {
    loadFailed = true;
    return null;
  }
}

/** Preload the table off the critical path (e.g. after the picker opens). Safe to call repeatedly. */
export function warmPincodeTable(): void {
  loadTable();
}

export function isPincodeQuery(query: string): boolean {
  return /^[1-9]\d{5}$/.test(query.trim());
}

function entryAt(data: PincodeTable, row: number): PincodeEntry {
  const at = row * STRIDE;
  const stateIdx = data.rows[at + STATE];
  return {
    pincode: String(data.rows[at + PIN]).padStart(6, '0'),
    districtEn: data.districts[data.rows[at + DISTRICT]],
    stateEn: data.statesEn[stateIdx],
    stateHi: data.statesHi[stateIdx],
    latitude: data.rows[at + LAT] / 1e4,
    longitude: data.rows[at + LNG] / 1e4,
    elevation: data.rows[at + ELEVATION],
  };
}

/** Row index of an exact pincode. Rows are pincode-ascending, so this is a binary search. */
function rowOf(data: PincodeTable, pincode: string): number {
  const target = Number(pincode);
  let lo = 0;
  let hi = data.count - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = data.rows[mid * STRIDE + PIN];
    if (value === target) return mid;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

/** Exact lookup over the ~19.6k pincodes. */
export function lookupPincode(pincode: string): PincodeEntry | null {
  const trimmed = pincode.trim();
  if (!isPincodeQuery(trimmed)) return null;
  const data = loadTable();
  if (!data) return null;
  const row = rowOf(data, trimmed);
  return row < 0 ? null : entryAt(data, row);
}

/**
 * Nearest pincode centroid to a GPS fix, by the same equirectangular metric `nearestCity`
 * uses. A linear scan of ~19.6k rows off a flat numeric array — no allocation per row, and
 * only the winner is materialised into an object.
 */
export function nearestPincode(latitude: number, longitude: number): PincodeEntry | null {
  return nearestPincodeWithDistance(latitude, longitude)?.entry ?? null;
}

/** The squared equirectangular distance too, so callers can compare against another tier. */
function nearestPincodeWithDistance(
  latitude: number,
  longitude: number
): { entry: PincodeEntry; distanceSq: number } | null {
  const data = loadTable();
  if (!data) return null;

  const cosLat = Math.cos((latitude * Math.PI) / 180);
  let bestRow = -1;
  let bestDist = Infinity;
  for (let row = 0; row < data.count; row += 1) {
    const at = row * STRIDE;
    const dLat = data.rows[at + LAT] / 1e4 - latitude;
    const dLng = (data.rows[at + LNG] / 1e4 - longitude) * cosLat;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < bestDist) {
      bestDist = dist;
      bestRow = row;
    }
  }
  return bestRow < 0 ? null : { entry: entryAt(data, bestRow), distanceSq: bestDist };
}

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/** 416001 → ४१६००१. Real Devanagari, so gu/kn transliteration handles it downstream. */
export function toDevanagariDigits(value: string): string {
  let out = '';
  for (const ch of value) {
    const digit = ch.charCodeAt(0) - 48;
    out += digit >= 0 && digit <= 9 ? DEVANAGARI_DIGITS[digit] : ch;
  }
  return out;
}

export const PINCODE_ID_PREFIX = 'pin-';

export function pincodeCityId(pincode: string): string {
  return `${PINCODE_ID_PREFIX}${pincode}`;
}

export function isPincodeCityId(cityId: string): boolean {
  return new RegExp(`^${PINCODE_ID_PREFIX}[1-9]\\d{5}$`).test(cityId);
}

/**
 * `place` is the post-office name the user searched for and picked, if any. It goes
 * into the English label only (there is no Devanagari spelling to put in the Hindi
 * one — see the header), and the label keeps ending in `, <State>` either way because
 * `lensRegistry.lensesForStoredLabel` reads the state back off that tail.
 */
export function toPincodeLocation(entry: PincodeEntry, source: LocationSource, place?: string): PanchangLocation {
  return {
    cityId: pincodeCityId(entry.pincode),
    labelHi: `${toDevanagariDigits(entry.pincode)} · ${entry.stateHi}`,
    labelEn: place
      ? `${place} · ${entry.pincode}, ${entry.stateEn}`
      : `${entry.pincode} · ${entry.districtEn}, ${entry.stateEn}`,
    latitude: entry.latitude,
    longitude: entry.longitude,
    elevation: entry.elevation,
    source,
  };
}

// ── Place names ─────────────────────────────────────────────────────────────────

export type PlaceKind = 'head' | 'sub' | 'branch';

export type PlaceMatch = {
  /** The post-office name as the directory spells it, type marker removed. */
  name: string;
  /** Head and sub offices are towns or city localities; branch offices are villages. */
  kind: PlaceKind;
  entry: PincodeEntry;
};

/** Shortest query that searches names — two letters match a third of India. */
export const MIN_PLACE_QUERY = 3;

const KIND_OF: Record<string, PlaceKind> = { H: 'head', S: 'sub', B: 'branch' };
const KIND_RANK: Record<string, number> = { H: 0, S: 1, B: 2 };

type PlaceIndex = {
  offices: OfficeTable;
  /** `offices.names` lower-cased. Names are ASCII-only, so offsets index both. */
  lower: string;
  /** Start offset of name i in `names`; `starts[count]` is one past the end. */
  starts: Int32Array;
  /** Pincode-table row of name i. */
  rowOfName: Int32Array;
  /** Index of the first name of pincode-table row r. */
  firstOfRow: Int32Array;
};

let placeIndex: PlaceIndex | null = null;
let placeIndexFailed = false;

/**
 * The second lazy load — 1.9 MB of names, reached only once a query looks like a name.
 * Built once: a lower-cased copy to search with `indexOf` (native, so 1.9 MB scans in
 * milliseconds) and two typed arrays mapping a hit offset back to its name and pincode.
 */
function loadPlaceIndex(): PlaceIndex | null {
  if (placeIndex || placeIndexFailed) return placeIndex;
  const data = loadTable();
  if (!data) {
    placeIndexFailed = true;
    return null;
  }
  try {
    const offices = require('./pincodeOffices.json') as OfficeTable;
    if (offices.format !== EXPECTED_FORMAT || offices.pincodeCount !== data.count) {
      placeIndexFailed = true;
      return null;
    }
    const starts = new Int32Array(offices.count + 1);
    let name = 0;
    for (let i = 0; i < offices.names.length; i += 1) {
      if (offices.names.charCodeAt(i) === 124 /* | */) starts[++name] = i + 1;
    }
    starts[offices.count] = offices.names.length + 1;
    const rowOfName = new Int32Array(offices.count);
    const firstOfRow = new Int32Array(offices.perPincode.length);
    let next = 0;
    for (let row = 0; row < offices.perPincode.length; row += 1) {
      firstOfRow[row] = next;
      for (let k = 0; k < offices.perPincode[row]; k += 1) rowOfName[next++] = row;
    }
    placeIndex = { offices, lower: offices.names.toLowerCase(), starts, rowOfName, firstOfRow };
    return placeIndex;
  } catch {
    placeIndexFailed = true;
    return null;
  }
}

/** Preload the name index off the critical path. Safe to call repeatedly. */
export function warmPlaceIndex(): void {
  loadPlaceIndex();
}

function nameAt(index: PlaceIndex, i: number): string {
  return index.offices.names.slice(index.starts[i], index.starts[i + 1] - 1);
}

/** The largest i with starts[i] <= offset. */
function nameContaining(index: PlaceIndex, offset: number): number {
  let lo = 0;
  let hi = index.offices.count - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (index.starts[mid] <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Lower-case, single-spaced, and stripped of the name separator. */
export function normalizePlaceQuery(query: string): string {
  return query.toLowerCase().replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Latin letters are what the directory has; a Devanagari query cannot match it. */
export function isPlaceQuery(query: string): boolean {
  const q = normalizePlaceQuery(query);
  return q.length >= MIN_PLACE_QUERY && /[a-z]/.test(q);
}

// Enough hits to rank well without letting a two-syllable query walk all 165k names.
const MAX_SCANNED_HITS = 4000;

/**
 * Post offices whose name contains `query`, best first: names starting with it, then a
 * later word starting with it, then any substring. Within each, head and sub offices
 * (towns) come before branch offices (villages) — "srinagar" must put Srinagar GPO
 * above the six villages also called Srinagar — then the exact name, then shorter
 * names, then directory order. Same-named villages in different districts are all
 * returned; the picker tells them apart by district and state.
 */
export function searchPlaces(query: string, limit = 50): PlaceMatch[] {
  if (!isPlaceQuery(query)) return [];
  const index = loadPlaceIndex();
  const data = loadTable();
  if (!index || !data) return [];
  const q = normalizePlaceQuery(query);

  const hits: { i: number; rank: number; exact: boolean }[] = [];
  let lastName = -1;
  let from = 0;
  while (hits.length < MAX_SCANNED_HITS) {
    const at = index.lower.indexOf(q, from);
    if (at < 0) break;
    from = at + 1;
    const i = nameContaining(index, at);
    if (i === lastName) continue;
    // A query is single-spaced and separator-free, so a hit never spans two names.
    const start = index.starts[i];
    const length = index.starts[i + 1] - 1 - start;
    let tier: number;
    if (at === start) tier = 0;
    else tier = /[ (\-./]/.test(index.lower[at - 1]) ? 1 : 2;
    lastName = i;
    hits.push({ i, rank: tier * 3 + KIND_RANK[index.offices.kinds[i]], exact: at === start && length === q.length });
  }

  hits.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    if (a.exact !== b.exact) return a.exact ? -1 : 1;
    const la = index.starts[a.i + 1] - index.starts[a.i];
    const lb = index.starts[b.i + 1] - index.starts[b.i];
    if (la !== lb) return la - lb;
    return a.i - b.i;
  });

  return hits.slice(0, limit).map(({ i }) => ({
    name: nameAt(index, i),
    kind: KIND_OF[index.offices.kinds[i]],
    entry: entryAt(data, index.rowOfName[i]),
  }));
}

/**
 * The post offices a pincode serves, towns first — what tells a user typing 416001
 * that it is Kolhapur RS and Shahupuri, not just "Kolhapur".
 */
export function placesForPincode(pincode: string): string[] {
  const data = loadTable();
  const index = loadPlaceIndex();
  if (!data || !index || !isPincodeQuery(pincode)) return [];
  const row = rowOf(data, pincode.trim());
  if (row < 0) return [];
  const first = index.firstOfRow[row];
  const out: string[] = [];
  for (let k = 0; k < index.offices.perPincode[row]; k += 1) out.push(nameAt(index, first + k));
  return out;
}

/**
 * Snap a GPS fix to whichever tier is genuinely CLOSER — nearest pincode or nearest bundled
 * city. Not "always prefer the pincode": the geocoder's coverage is very uneven, carrying
 * just 1 of 207 Jammu & Kashmir pincodes, so a Srinagar fix finds its nearest pincode 156 km
 * away in Doda while the bundled Srinagar entry sits right on top of it. Preferring pincodes
 * unconditionally would have made those users worse off than before this tier existed.
 *
 * Ties go to the city, which is the better label when the distances are equal: a real
 * bilingual place name rather than six digits and a state.
 */
export function snapToNearestLocation(latitude: number, longitude: number): PanchangLocation {
  const city = nearestCity(latitude, longitude);
  const cityLocation: PanchangLocation = {
    cityId: city.id,
    labelHi: city.nameHi,
    labelEn: city.nameEn,
    latitude: city.latitude,
    longitude: city.longitude,
    elevation: city.elevation,
    source: 'gps',
  };

  const nearest = nearestPincodeWithDistance(latitude, longitude);
  if (!nearest) return cityLocation;

  const cosLat = Math.cos((latitude * Math.PI) / 180);
  const dLat = city.latitude - latitude;
  const dLng = (city.longitude - longitude) * cosLat;
  const cityDistanceSq = dLat * dLat + dLng * dLng;

  return nearest.distanceSq < cityDistanceSq ? toPincodeLocation(nearest.entry, 'gps') : cityLocation;
}

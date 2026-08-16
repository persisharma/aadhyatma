/**
 * Nationwide pincode → location resolution: the third and finest location tier.
 *
 * WHY THIS IS NOT PART OF `CITIES`. Two hard reasons, both structural:
 *
 *   1. SIZE. 18,466 rows is 566 KB. `CITIES` is imported by `panchangPrefs`, which is
 *      imported by the launch prefetch — putting this table there would drag half a
 *      megabyte of JSON parse onto the cold-start path that #268/#269/#272 spent three
 *      commits clearing. So the table is `require`d LAZILY, on the first lookup, and a
 *      user who never touches a pincode never pays for it.
 *   2. LANGUAGE. A `City` must carry `nameHi` in Devanagari (`location.test.ts` asserts
 *      it). Neither source dataset has Hindi place names, and `utils/transliterate.ts`
 *      runs Devanagari → Gujarati/Kannada, not Latin → Devanagari. Rather than machine-
 *      transliterate 18k names into plausible-but-wrong Devanagari, a pincode labels
 *      itself with Devanagari DIGITS plus its state — the only Hindi the generator
 *      hand-authors (36 strings). Hence `४१६००१ · महाराष्ट्र`, with the district name
 *      carried in Latin as a secondary line the picker renders in both languages.
 *
 * Because the Hindi label is real Devanagari, it transliterates correctly into the gu/kn
 * reading languages through the normal `contentByLang` path — nothing special needed.
 *
 * A pincode location is SELF-DESCRIBING on disk. `parseStoredLocation` rebuilds city
 * locations by looking `cityId` up in the bundled list; it cannot do that here without
 * importing this module (and its 566 KB) at launch, so a persisted `pin-` record carries
 * its own coordinates and labels and is validated structurally instead. That is safe
 * precisely because this table is generated, immutable data: a stored record can only
 * disagree with the bundle if the dataset was regenerated, and the coordinates it holds
 * were still correct when written.
 *
 * Data provenance, gates and the elevation measurement: `scripts/build-pincodes.mjs`.
 */
import { nearestCity } from './locations';
import type { LocationSource, PanchangLocation } from './types';

export type PincodeEntry = {
  /** The 6-digit pincode as typed, zero-padded. */
  pincode: string;
  /** District — the source directory's `city` field. 416001 is Kolhapur, not Karvir. */
  districtEn: string;
  /** Taluka — the directory's `district` field. Sometimes the name users know: 781001 is
   *  district Kamrup but taluka Guwahati. Equal to `districtEn` in cities like Mumbai. */
  talukaEn: string;
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
  talukas: string[];
  states: string[];
  statesEn: string[];
  statesHi: string[];
  rows: number[];
};

const EXPECTED_FORMAT = 1;
const STRIDE = 7;

// Field offsets: [pincode, lat×1e4, lng×1e4, districtIdx, talukaIdx, stateIdx, elevation].
const PIN = 0;
const LAT = 1;
const LNG = 2;
const DISTRICT = 3;
const TALUKA = 4;
const STATE = 5;
const ELEVATION = 6;

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
    talukaEn: data.talukas[data.rows[at + TALUKA]],
    stateEn: data.statesEn[stateIdx],
    stateHi: data.statesHi[stateIdx],
    latitude: data.rows[at + LAT] / 1e4,
    longitude: data.rows[at + LNG] / 1e4,
    elevation: data.rows[at + ELEVATION],
  };
}

/** Exact lookup. Rows are pincode-ascending, so this is a binary search over 18k entries. */
export function lookupPincode(pincode: string): PincodeEntry | null {
  const trimmed = pincode.trim();
  if (!isPincodeQuery(trimmed)) return null;
  const data = loadTable();
  if (!data) return null;

  const target = Number(trimmed);
  let lo = 0;
  let hi = data.count - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = data.rows[mid * STRIDE + PIN];
    if (value === target) return entryAt(data, mid);
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return null;
}

/**
 * Nearest pincode centroid to a GPS fix, by the same equirectangular metric `nearestCity`
 * uses. A linear scan of 18k rows off a flat numeric array — no allocation per row, and
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

export function toPincodeLocation(entry: PincodeEntry, source: LocationSource): PanchangLocation {
  return {
    cityId: pincodeCityId(entry.pincode),
    labelHi: `${toDevanagariDigits(entry.pincode)} · ${entry.stateHi}`,
    labelEn: `${entry.pincode} · ${entry.districtEn}, ${entry.stateEn}`,
    latitude: entry.latitude,
    longitude: entry.longitude,
    elevation: entry.elevation,
    source,
  };
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

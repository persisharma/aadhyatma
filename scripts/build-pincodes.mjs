#!/usr/bin/env node
/**
 * Generates the location picker's two nationwide postal tables:
 *
 *   - `mobile/src/panchang/pincodeData.json`    pincode → coordinate, district, state
 *   - `mobile/src/panchang/pincodeOffices.json` every post office (town / village)
 *                                               name, grouped under its pincode
 *
 * WHY A GENERATOR. Same reason `rajasthanTehsils.ts` documents its provenance: the
 * container's egress allows package registries only, so no gazetteer, census or
 * Wikipedia host is reachable. Both inputs are pulled off npm and joined here, and
 * the gates below are the whole reason the output is trustworthy — re-running this
 * script must reproduce the committed files byte for byte.
 *
 * INPUTS (all npm, none a runtime dependency):
 *   1. `india-pincode`        India Post's All-India Pincode Directory as republished on
 *                             data.gov.in — 165,627 post offices, each with its own
 *                             lat/lng, current district names, and Ladakh / Telangana /
 *                             the merged Dadra-Nagar-Haveli-Daman-Diu UT as they are now.
 *   2. `pincode-lat-long`     an independent pincode → coordinate geocoder (18,925 rows).
 *                             Until Oct 2026 this was the ONLY coordinate source; it is
 *                             now one vote among the offices.
 *   3. `india-pincode-search` the previous build's directory, consulted only for the
 *                             220 pincodes (mostly urban Gujarat and West Bengal) the
 *                             current directory lacks, so codes that resolved before
 *                             this rebuild keep resolving.
 *
 * WHY THE SWITCH (Oct 2026: "a lot of places not in the list"). The previous build
 * joined `pincode-lat-long` to a directory that carried one office per pincode, so
 * only pincodes and 52 city names were findable — a user from a village had to know
 * their pincode. The office directory makes ~165k town and village names searchable,
 * and its coordinates cover the states the old geocoder barely touched (Jammu &
 * Kashmir went from 1 of 207 pincodes to all of them; Ladakh from 0 to 13).
 *
 * THE OFFICE COORDINATES ARE NOISY, in four measurable ways, and every gate below
 * exists because of one of them:
 *
 *   1. JUNK VALUES. ~12k offices are at 0,0; 434 sit at exactly 1,1; 2,608 fall
 *      outside India. Dropped (14,621 in all).
 *   2. SNAPPED CENTROIDS. 250 Gaya-district (Bihar) offices share ONE coordinate —
 *      Aurangabad, Maharashtra, geocoded off the same-named Bihar district; 100
 *      Azamgarh (UP) offices share a point near Bengaluru. Real offices never share an
 *      exact coordinate across pincodes, so any coordinate (to 3 decimals, ~100 m)
 *      that offices of 3+ different pincodes share is a snap and is not a vote.
 *      16.7k offices are removed this way — most are harmless district centroids,
 *      but the harmful ones are indistinguishable from them.
 *   3. BROKEN COLUMNS inside one pincode. 20 of 391120's 28 offices (Tilakwada,
 *      Gujarat) share latitude 15.5934 — Goa — under scattered longitudes; 18 of
 *      125121's sit on one point 170 km west of Hisar. Offices linked by an identical
 *      latitude OR longitude (to 4 decimals, ~10 m) are therefore ONE witness, voting
 *      once at their median however many rows repeat it. 150k offices collapse to
 *      ~103k witnesses.
 *   4. DEGREES-MINUTES TYPED AS DECIMALS. Seven of 700001's thirteen offices (Kolkata
 *      BBD Bagh) read 22.3425, 88.2088 — 22°34'25" typed into a decimal field, landing
 *      30 km south-west in the Hooghly. Each witness whose fraction reads as valid
 *      mm[ss] also casts half its weight at the repaired coordinate, which out-votes
 *      the raw cluster once the correct offices and the geocoder agree with it.
 *
 * CONSENSUS. A pincode's coordinate is the median of its densest cluster of votes
 * (15 km radius). A head or sub office (a town) votes 2, a branch office (a village)
 * 1, and the `pincode-lat-long` coordinate 1.5. Towns outweigh villages because a
 * pincode can cover 150 km of desert — 345001 is Jaisalmer city AND the border
 * villages — and its people live where its town offices are; the geocoder's 1.5 is
 * what lets it overrule one mistyped sub office (110072's CRPF Jharoda Kalan reads
 * 77.96° for 76.96°). A second pass restricts every pincode's votes to within R of
 * its sorting district's medoid (3-digit prefix AND state — 682 is both Kochi and
 * Lakshadweep), R = max(150 km, 3 × the median pincode distance from that medoid):
 * wide enough for Leh and Kutch, narrow enough to reject a vote in another state.
 * The two archipelagos skip that pass (744 spans 800 km of sea).
 *
 * A finer, 4-digit pass was tried and removed: 3033xx holds both Dausa and Phulera,
 * 100 km apart, and that pass dragged Phulera and Jobner to Dausa.
 *
 * MEASURED, not assumed: against the bundled city/tehsil coordinates (GeoNames-
 * sourced points matched to their same-named head/sub office; n = 239), median error
 * is 3.3 km (5.4 km with the geocoder alone), p90 12.3 km (21.8), p95 28 km (35),
 * and 15 are off by more than 20 km (26). 20 km of longitude is ~45 s of sunrise; the
 * gross errors these gates remove were hundreds of km.
 *
 * MISFILED STATES. Three pincodes are filed under a state with no other pincode in
 * their sorting district and none within 150 km (799001, Agartala's head office, is
 * filed as Nirmal, Telangana). They take their sorting district's majority state —
 * see step 4a, and its enclave exemption.
 *
 * Army/field post offices (9xxxxx) are not places and are excluded.
 *
 * ELEVATION is not in either dataset. Each pincode inherits the elevation of the
 * nearest bundled city, which can be badly wrong where the coast meets a plateau —
 * Kolhapur (~550 m) inherits Panaji's 7 m. Measured against `astronomy-engine`'s
 * `Observer`, 7 m vs 550 m at Kolhapur moves sunrise by 7.5 SECONDS and 0 m vs 1000 m
 * by 13.6 s, so no elevation dataset is worth more payload here.
 *
 * NO HINDI PLACE NAMES exist in either dataset, and `utils/transliterate.ts` runs
 * Devanagari → Gujarati/Kannada, not Latin → Devanagari. Machine-transliterating 150k
 * place names would put wrong Devanagari spellings in front of users, so the Hindi
 * label is built from Devanagari digits plus the state name — hand-authored strings,
 * small enough to check by eye. See STATES below.
 *
 * OFFICE NAMES are cleaned, not rewritten: the trailing B.O / S.O / H.O type marker
 * and any "(Account S.O)" parenthetical are removed, G.P.O. is normalised to GPO,
 * names typed entirely in capitals are title-cased (keeping a short acronym list),
 * and only printable ASCII survives. Search runs on a second, spelling-folded copy
 * (`foldPlaceName`: chh/ch → c, aspirate h dropped, w → v, doubled letters collapsed…)
 * so "Chhapra" finds India Post's "Chapra" — precomputed here, because folding 165k
 * names on a phone at first search would take seconds.
 *
 * Usage:  node scripts/build-pincodes.mjs
 */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const OUT = path.join(REPO, 'mobile/src/panchang/pincodeData.json');
const OUT_OFFICES = path.join(REPO, 'mobile/src/panchang/pincodeOffices.json');

const DIRECTORY_PKG = 'india-pincode@2.5.9';
const GEOCODER_PKG = 'pincode-lat-long@1.0.3';
const LEGACY_DIRECTORY_PKG = 'india-pincode-search@1.0.2';

// Bump when either file's layout changes — `pincodes.ts` asserts on both.
const FORMAT = 2;

// India bounding box, generous enough to include Andaman & Nicobar and Lakshadweep.
const INDIA = { latMin: 6.5, latMax: 37.6, lngMin: 68.0, lngMax: 97.5 };

const CLUSTER_KM = 15;
const SNAP_PINCODES = 3;
const WEIGHT_VILLAGE_OFFICE = 1;
const WEIGHT_TOWN_OFFICE = 2;
const DMS_REPAIR_SHARE = 0.5;
const WEIGHT_GEOCODER = 1.5;
const PREFIX_NEIGHBOUR_KM = 50;
const PREFIX_MIN_RADIUS_KM = 150;
const MISFILED_STATE_KM = 150;

/**
 * The states/UTs the directory uses, keyed by its own upper-case label and mapped to
 * the name we display in each script. Hand-authored and hand-checked: these Devanagari
 * strings are the ONLY Hindi in the generated files, which is exactly why this is a
 * bounded list and not a transliterator. A state missing here fails the build rather
 * than shipping an English-only Hindi label.
 *
 * The English names are spelled with "and", never "&", because `lensRegistry.ts`
 * reads the state back off a stored pincode label (`…, Jammu and Kashmir`) and keys
 * `STATE_LENS` that way. The previous dataset's "Jammu & Kashmir" silently matched
 * nothing there.
 */
const STATES = {
  'ANDAMAN AND NICOBAR ISLANDS': { en: 'Andaman and Nicobar Islands', hi: 'अंडमान और निकोबार' },
  'ANDHRA PRADESH': { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' },
  'ARUNACHAL PRADESH': { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश' },
  ASSAM: { en: 'Assam', hi: 'असम' },
  BIHAR: { en: 'Bihar', hi: 'बिहार' },
  CHANDIGARH: { en: 'Chandigarh', hi: 'चंडीगढ़' },
  CHHATTISGARH: { en: 'Chhattisgarh', hi: 'छत्तीसगढ़' },
  DELHI: { en: 'Delhi', hi: 'दिल्ली' },
  GOA: { en: 'Goa', hi: 'गोवा' },
  GUJARAT: { en: 'Gujarat', hi: 'गुजरात' },
  HARYANA: { en: 'Haryana', hi: 'हरियाणा' },
  'HIMACHAL PRADESH': { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' },
  'JAMMU AND KASHMIR': { en: 'Jammu and Kashmir', hi: 'जम्मू और कश्मीर' },
  JHARKHAND: { en: 'Jharkhand', hi: 'झारखंड' },
  KARNATAKA: { en: 'Karnataka', hi: 'कर्नाटक' },
  KERALA: { en: 'Kerala', hi: 'केरल' },
  LADAKH: { en: 'Ladakh', hi: 'लद्दाख' },
  LAKSHADWEEP: { en: 'Lakshadweep', hi: 'लक्षद्वीप' },
  'MADHYA PRADESH': { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
  MAHARASHTRA: { en: 'Maharashtra', hi: 'महाराष्ट्र' },
  MANIPUR: { en: 'Manipur', hi: 'मणिपुर' },
  MEGHALAYA: { en: 'Meghalaya', hi: 'मेघालय' },
  MIZORAM: { en: 'Mizoram', hi: 'मिज़ोरम' },
  NAGALAND: { en: 'Nagaland', hi: 'नागालैंड' },
  ODISHA: { en: 'Odisha', hi: 'ओडिशा' },
  PUDUCHERRY: { en: 'Puducherry', hi: 'पुदुचेरी' },
  PUNJAB: { en: 'Punjab', hi: 'पंजाब' },
  RAJASTHAN: { en: 'Rajasthan', hi: 'राजस्थान' },
  SIKKIM: { en: 'Sikkim', hi: 'सिक्किम' },
  'TAMIL NADU': { en: 'Tamil Nadu', hi: 'तमिलनाडु' },
  TELANGANA: { en: 'Telangana', hi: 'तेलंगाना' },
  'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU': {
    en: 'Dadra and Nagar Haveli and Daman and Diu',
    hi: 'दादरा और नगर हवेली और दमन और दीव',
  },
  TRIPURA: { en: 'Tripura', hi: 'त्रिपुरा' },
  'UTTAR PRADESH': { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  UTTARAKHAND: { en: 'Uttarakhand', hi: 'उत्तराखंड' },
  'WEST BENGAL': { en: 'West Bengal', hi: 'पश्चिम बंगाल' },
};

/**
 * The legacy directory's spellings (pre-2019, ampersands, old names) → STATES keys.
 * Only consulted for the pincodes the current directory lacks — see main().
 */
const LEGACY_STATE = {
  'ANDAMAN & NICOBAR ISLANDS': 'ANDAMAN AND NICOBAR ISLANDS',
  CHATTISGARH: 'CHHATTISGARH',
  'DADRA & NAGAR HAVELI': 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
  'DAMAN & DIU': 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
  'JAMMU & KASHMIR': 'JAMMU AND KASHMIR',
  PONDICHERRY: 'PUDUCHERRY',
};

/**
 * Archipelagos, exempt from the sorting-district gate: 744xxx runs 800 km from Port
 * Blair to Campbell Bay, and Lakshadweep's 6825xx shares Kochi's sorting prefix from
 * 300+ km out at sea. Their votes still pass the junk and snap gates.
 */
const ISLANDS = new Set(['ANDAMAN AND NICOBAR ISLANDS', 'LAKSHADWEEP']);

/** Union territories made of enclaves inside other states' sorting districts — see 4a. */
const ENCLAVES = new Set(['PUDUCHERRY', 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU', 'LAKSHADWEEP', 'CHANDIGARH']);

/** Office kinds, one character each in `pincodeOffices.json` → `kinds`. */
const KIND = { HO: 'H', PO: 'S', BO: 'B' };

/** Kept upper-case when title-casing an all-capitals name. */
const ACRONYMS = new Set(['GPO', 'NDC', 'MDG', 'RS', 'CRPF', 'BSF', 'CISF', 'ITBP', 'ITI', 'IIT', 'IIM', 'AIIMS', 'HAL', 'BHEL', 'ONGC', 'NTPC', 'SAIL', 'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII']);

function titleCase(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/**
 * "Jogia  B.O (Alauli S.O)" → "Jogia";  "Guwahati G.P.O." → "Guwahati GPO";
 * "Town Hall SO Mumbai" → "Town Hall (Mumbai)".
 */
/**
 * The spelling-variant fold search compares on. MUST stay identical to
 * `foldPlaceName` in `mobile/src/panchang/pincodes.ts` (a test pins it). India Post
 * spells Chhapra "Chapra"; users type Muzzafarpur for Muzaffarpur. So: lower-case,
 * punctuation to spaces, ph → f, chh/ch → c, drop the h of an aspirate (bh dh gh jh
 * kh th) and of sh, w → v, z → j, q → k, then collapse doubled letters.
 */
export function foldPlaceName(raw) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/ph/g, 'f')
    .replace(/chh/g, 'ch')
    .replace(/ch/g, 'c')
    .replace(/([kgjtdbs])h/g, '$1')
    .replace(/w/g, 'v')
    .replace(/z/g, 'j')
    .replace(/q/g, 'k')
    .replace(/([a-z])\1+/g, '$1');
}

export function cleanOfficeName(raw) {
  let name = raw
    .replace(/[^\x20-\x7e]/g, ' ')
    .replace(/\(([^)]*\b[SBH]\.?\s?O\b[^)]*)\)/gi, ' ')
    .replace(/\bG\.\s?P\.\s?O\.?/gi, 'GPO')
    .replace(/\s*\b(?:[BSHP]\.\s?O\.?|[BSHP]O)\s*$/i, '')
    // "Aliganj SO South Delhi" / "Ashok Nagar S.O (West Delhi)" → "Aliganj (South Delhi)".
    .replace(/\s+\b(?:[BSH]\.\s?O\.?|[BSH]O)\s+\(?([^()]+?)\)?\s*$/, ' ($1)')
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length > 0 && name === name.toUpperCase() && /[A-Z]/.test(name)) {
    name = name
      .split(' ')
      .map((word) => (ACRONYMS.has(word.replace(/[^A-Z]/g, '')) ? word : titleCase(word)))
      .join(' ');
  }
  return name;
}

function km(lat1, lng1, lat2, lng2) {
  const x = (lng2 - lng1) * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const y = lat2 - lat1;
  return Math.sqrt(x * x + y * y) * 111.2;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[sorted.length >> 1];
}

function inIndia(lat, lng) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0) &&
    !(lat === 1 && lng === 1) &&
    lat >= INDIA.latMin &&
    lat <= INDIA.latMax &&
    lng >= INDIA.lngMin &&
    lng <= INDIA.lngMax
  );
}

/** 22.3425 read as 22°34'25" → 22.5736, or null when the fraction is not a valid mm[ss]. */
function dmsRepair(value) {
  const [deg, frac] = value.toFixed(6).split('.');
  const minutes = Number(frac.slice(0, 2));
  const seconds = Number(frac.slice(2, 4));
  if (minutes >= 60 || seconds >= 60) return null;
  return Number(deg) + minutes / 60 + seconds / 3600;
}

/** Median of the densest CLUSTER_KM cluster of weighted votes; ties go nearer `centre`. */
function consensus(votes, centre) {
  let best = null;
  let bestSupport = -1;
  let bestDistance = Infinity;
  for (const vote of votes) {
    let support = 0;
    for (const other of votes) if (km(vote.lat, vote.lng, other.lat, other.lng) <= CLUSTER_KM) support += other.weight;
    const distance = centre ? km(centre.lat, centre.lng, vote.lat, vote.lng) : 0;
    if (support > bestSupport + 1e-9 || (Math.abs(support - bestSupport) < 1e-9 && distance < bestDistance)) {
      best = vote;
      bestSupport = support;
      bestDistance = distance;
    }
  }
  const cluster = votes.filter((v) => km(best.lat, best.lng, v.lat, v.lng) <= CLUSTER_KM);
  return { lat: median(cluster.map((v) => v.lat)), lng: median(cluster.map((v) => v.lng)) };
}

/**
 * For each named group of points: its medoid (the point with the most others within
 * PREFIX_NEIGHBOUR_KM — the densest place, which a scattered minority of wrong points
 * cannot move) and a radius of max(minRadius, 3 × the median distance from it).
 */
function medoidGates(groups, minRadius) {
  const out = new Map();
  for (const [key, points] of groups) {
    let medoid = points[0];
    let bestNeighbours = -1;
    for (const p of points) {
      let neighbours = 0;
      for (const q of points) if (km(p.lat, p.lng, q.lat, q.lng) <= PREFIX_NEIGHBOUR_KM) neighbours += 1;
      if (neighbours > bestNeighbours) {
        bestNeighbours = neighbours;
        medoid = p;
      }
    }
    const radius = Math.max(minRadius, 3 * median(points.map((p) => km(medoid.lat, medoid.lng, p.lat, p.lng))));
    out.set(key, { lat: medoid.lat, lng: medoid.lng, radius });
  }
  return out;
}

function majority(counts) {
  let best = null;
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}

function installInputs() {
  const dir = mkdtempSync(path.join(tmpdir(), 'pincode-build-'));
  console.log(`· installing inputs into ${dir}`);
  execSync(`npm install --silent --no-save --ignore-scripts --prefix "${dir}" ${DIRECTORY_PKG} ${GEOCODER_PKG} ${LEGACY_DIRECTORY_PKG}`, {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  const require = createRequire(path.join(dir, 'noop.js'));
  const directory = JSON.parse(gunzipSync(readFileSync(path.join(dir, 'node_modules/india-pincode/data/pincodes.json.gz'))));
  const geocoderModule = require('pincode-lat-long/pincode.js');
  const legacy = require('india-pincode-search/db/pincode_db.json');
  return { directory, geocoder: geocoderModule.default ?? geocoderModule, legacy };
}

/** The bundled major cities, parsed straight out of the TS source for their elevations. */
function bundledCityElevations() {
  const src = readFileSync(path.join(REPO, 'mobile/src/panchang/locations.ts'), 'utf8');
  const cities = [];
  const row = /latitude:\s*(-?[\d.]+),\s*longitude:\s*(-?[\d.]+),\s*elevation:\s*(-?[\d.]+)/g;
  let m;
  while ((m = row.exec(src)) !== null) {
    cities.push({ latitude: +m[1], longitude: +m[2], elevation: +m[3] });
  }
  // Ujjain's row references UJJAIN_GEO rather than literals, so it is absent above.
  cities.push({ latitude: 23.1765, longitude: 75.7885, elevation: 494 });
  return cities;
}

function nearestElevation(cities, lat, lng) {
  const cosLat = Math.cos((lat * Math.PI) / 180);
  let best = 0;
  let bestDist = Infinity;
  for (const c of cities) {
    const dLat = c.latitude - lat;
    const dLng = (c.longitude - lng) * cosLat;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < bestDist) {
      bestDist = dist;
      best = c.elevation;
    }
  }
  return best;
}

function main() {
  const { directory, geocoder, legacy } = installInputs();
  const elevations = bundledCityElevations();
  const stats = { offices: directory.length };

  // ── 0. Pincodes the current directory lacks but the legacy one (the previous
  //    build's only directory) has: ~200, mostly urban Gujarat and West Bengal codes
  //    that resolved before this rebuild and must keep resolving. They join with their
  //    legacy office name and no office coordinate, so the geocoder is their one vote.
  const currentPins = new Set(directory.map((row) => row.p));
  stats.legacy = 0;
  for (const row of legacy) {
    if (currentPins.has(row.pincode)) continue;
    currentPins.add(row.pincode);
    stats.legacy += 1;
    const type = /\bH\.?O\b/i.test(row.office) ? 'HO' : /\bB\.?O\b/i.test(row.office) ? 'BO' : 'PO';
    directory.push({ p: row.pincode, o: row.office, t: type, i: row.city, s: LEGACY_STATE[row.state] ?? row.state, a: NaN, n: NaN });
  }

  // ── 1. Labels. 715 offices carry "NA" for state and/or district; they take their
  //    pincode's majority, then their 3-digit sorting district's.
  const offices = directory.filter((row) => /^[1-8]\d{5}$/.test(row.p));
  stats.armyPost = directory.length - offices.length;
  const tally = (keyOf, valueOf) => {
    const out = new Map();
    for (const row of offices) {
      const value = valueOf(row);
      if (!value || value === 'NA') continue;
      const key = keyOf(row);
      const counts = out.get(key) ?? new Map();
      counts.set(value, (counts.get(value) ?? 0) + 1);
      out.set(key, counts);
    }
    return out;
  };
  const stateByPin = tally((r) => r.p, (r) => r.s);
  const stateByPrefix = tally((r) => r.p.slice(0, 3), (r) => r.s);
  const districtByPin = tally((r) => r.p, (r) => r.i);
  const districtByPrefix = tally((r) => r.p.slice(0, 3), (r) => r.i);
  for (const row of offices) {
    if (row.s === 'NA') row.s = majority(stateByPin.get(row.p) ?? new Map()) ?? majority(stateByPrefix.get(row.p.slice(0, 3)) ?? new Map());
    if (row.i === 'NA') row.i = majority(districtByPin.get(row.p) ?? new Map()) ?? majority(districtByPrefix.get(row.p.slice(0, 3)) ?? new Map());
    if (!row.s || !STATES[row.s]) throw new Error(`no Hindi name for state "${row.s}" (pincode ${row.p}) — extend STATES`);
  }

  // ── 2. Votes.
  const snapPins = new Map();
  for (const row of offices) {
    const lat = Number(row.a);
    const lng = Number(row.n);
    if (!inIndia(lat, lng)) continue;
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    (snapPins.get(key) ?? snapPins.set(key, new Set()).get(key)).add(row.p);
  }
  const votes = new Map();
  const vote = (pin, lat, lng, weight) => (votes.get(pin) ?? votes.set(pin, []).get(pin)).push({ lat, lng, weight });
  stats.junk = 0;
  stats.snapped = 0;
  stats.dmsRepairs = 0;
  const survivors = new Map();
  for (const row of offices) {
    const lat = Number(row.a);
    const lng = Number(row.n);
    if (!inIndia(lat, lng)) {
      if (!Number.isNaN(lat)) stats.junk += 1;
      continue;
    }
    if (snapPins.get(`${lat.toFixed(3)},${lng.toFixed(3)}`).size >= SNAP_PINCODES) {
      stats.snapped += 1;
      continue;
    }
    const weight = row.t === 'BO' ? WEIGHT_VILLAGE_OFFICE : WEIGHT_TOWN_OFFICE;
    (survivors.get(row.p) ?? survivors.set(row.p, []).get(row.p)).push({ lat, lng, weight, latKey: lat.toFixed(4), lngKey: lng.toFixed(4) });
  }
  // A broken column inside one pincode: 20 of 391120's 28 offices share latitude
  // 15.5934 (Goa) with scattered longitudes, and 18 of 125121's sit on one point 170 km
  // west of Hisar. Real offices do not repeat a coordinate component (to 4 decimals,
  // ~10 m), so offices linked by a shared latitude OR longitude are one witness, voting
  // once at their median — however many rows repeat it.
  stats.witnesses = 0;
  for (const [pin, list] of survivors) {
    const parent = list.map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const firstWith = new Map();
    list.forEach((o, i) => {
      for (const key of [`a${o.latKey}`, `n${o.lngKey}`]) {
        if (firstWith.has(key)) parent[find(i)] = find(firstWith.get(key));
        else firstWith.set(key, i);
      }
    });
    const groups = new Map();
    list.forEach((o, i) => (groups.get(find(i)) ?? groups.set(find(i), []).get(find(i))).push(o));
    for (const group of groups.values()) {
      const lat = median(group.map((o) => o.lat));
      const lng = median(group.map((o) => o.lng));
      const weight = Math.max(...group.map((o) => o.weight));
      vote(pin, lat, lng, weight);
      stats.witnesses += 1;
      const rLat = dmsRepair(lat);
      const rLng = dmsRepair(lng);
      if (rLat !== null && rLng !== null && inIndia(rLat, rLng) && km(lat, lng, rLat, rLng) > CLUSTER_KM) {
        vote(pin, rLat, rLng, weight * DMS_REPAIR_SHARE);
        stats.dmsRepairs += 1;
      }
    }
  }
  const directoryPins = new Set(offices.map((row) => row.p));
  for (const pin of directoryPins) {
    const coords = geocoder[pin];
    if (!coords) continue;
    const lat = Number(coords.lat);
    const lng = Number(coords.long);
    if (inIndia(lat, lng)) vote(pin, lat, lng, WEIGHT_GEOCODER);
  }

  // ── 3. Consensus, then the sorting-district gate.
  const firstPass = new Map();
  for (const [pin, pinVotes] of votes) firstPass.set(pin, consensus(pinVotes, null));
  // A sorting district is keyed by prefix AND state: 682 is both Kochi and Lakshadweep.
  const stateOfPin = tally((r) => r.p, (r) => r.s);
  const gateKey = (pin) => `${pin.slice(0, 3)}|${majority(stateOfPin.get(pin))}`;
  const byPrefix = new Map();
  for (const [pin, point] of firstPass) {
    const prefix = gateKey(pin);
    (byPrefix.get(prefix) ?? byPrefix.set(prefix, []).get(prefix)).push(point);
  }
  const prefixGate = medoidGates(byPrefix, PREFIX_MIN_RADIUS_KM);
  const coordinates = new Map();
  stats.noCoordinate = 0;
  stats.outsideSortingDistrict = 0;
  for (const pin of directoryPins) {
    const pinVotes = votes.get(pin);
    if (!pinVotes) {
      stats.noCoordinate += 1;
      continue;
    }
    if (ISLANDS.has(majority(stateOfPin.get(pin)))) {
      coordinates.set(pin, consensus(pinVotes, null));
      continue;
    }
    const gate = prefixGate.get(gateKey(pin));
    const inside = pinVotes.filter((v) => km(gate.lat, gate.lng, v.lat, v.lng) <= gate.radius);
    if (inside.length === 0) {
      stats.outsideSortingDistrict += 1;
      continue;
    }
    coordinates.set(pin, consensus(inside, gate));
  }

  // ── 4. Rows. A pincode's labels come from its own offices' majority district/state.
  const pins = [...coordinates.keys()].sort();
  const officesByPin = new Map();
  for (const row of offices) (officesByPin.get(row.p) ?? officesByPin.set(row.p, []).get(row.p)).push(row);
  const districtOfPin = tally((r) => r.p, (r) => r.i);
  const labels = new Map(pins.map((pin) => [pin, { state: majority(stateOfPin.get(pin)), district: majority(districtOfPin.get(pin) ?? new Map()) ?? '' }]));

  // ── 4a. Misfiled states. A handful of pincodes are filed under a state that has no
  //    other pincode in their sorting district and none within MISFILED_STATE_KM —
  //    799001 is Agartala's head office, filed as Nirmal, Telangana, 1,400 km away.
  //    Those take their sorting district's majority state and their nearest same-
  //    district neighbour's district. Real enclaves are exempt by name, since being a
  //    lone state inside another's sorting district is exactly what Mahe, Yanam,
  //    Karaikal, Diu and Daman are.
  const pinsByPrefix = new Map();
  for (const pin of pins) (pinsByPrefix.get(pin.slice(0, 3)) ?? pinsByPrefix.set(pin.slice(0, 3), []).get(pin.slice(0, 3))).push(pin);
  const misfiled = [];
  for (const pin of pins) {
    const { state } = labels.get(pin);
    if (ENCLAVES.has(state)) continue;
    const siblings = pinsByPrefix.get(pin.slice(0, 3)).filter((p) => p !== pin);
    if (siblings.length === 0 || siblings.some((p) => labels.get(p).state === state)) continue;
    const here = coordinates.get(pin);
    const nearSameState = pins.some((p) => p !== pin && labels.get(p).state === state && km(here.lat, here.lng, coordinates.get(p).lat, coordinates.get(p).lng) <= MISFILED_STATE_KM);
    if (nearSameState) continue;
    const stateCounts = new Map();
    for (const p of siblings) stateCounts.set(labels.get(p).state, (stateCounts.get(labels.get(p).state) ?? 0) + 1);
    const prefixState = majority(stateCounts);
    let nearest = null;
    let nearestKm = Infinity;
    for (const p of siblings) {
      if (labels.get(p).state !== prefixState) continue;
      const d = km(here.lat, here.lng, coordinates.get(p).lat, coordinates.get(p).lng);
      if (d < nearestKm) {
        nearestKm = d;
        nearest = p;
      }
    }
    misfiled.push(`${pin} ${state} → ${prefixState}`);
    labels.set(pin, { state: prefixState, district: labels.get(nearest).district });
  }

  const districts = [];
  const districtIndex = new Map();
  const states = [];
  const stateIndex = new Map();
  const indexOf = (list, index, value) => {
    if (!index.has(value)) {
      index.set(value, list.length);
      list.push(value);
    }
    return index.get(value);
  };

  const flat = [];
  const names = [];
  const kinds = [];
  const perPincode = [];
  stats.droppedNames = 0;
  for (const pin of pins) {
    const rows = officesByPin.get(pin);
    const district = titleCase(labels.get(pin).district);
    const { state } = labels.get(pin);
    const { lat, lng } = coordinates.get(pin);
    flat.push(
      Number(pin),
      Math.round(lat * 1e4),
      Math.round(lng * 1e4),
      indexOf(districts, districtIndex, district),
      indexOf(states, stateIndex, state),
      nearestElevation(elevations, lat, lng)
    );

    // Head office first, then sub offices, then branch (village) offices, each A→Z,
    // with duplicate names inside one pincode collapsed.
    const seen = new Set();
    const cleaned = rows
      .map((r) => ({ name: cleanOfficeName(r.o), kind: KIND[r.t] ?? 'B' }))
      .filter((o) => {
        if (o.name.length < 2 || seen.has(o.name.toLowerCase())) {
          stats.droppedNames += 1;
          return false;
        }
        seen.add(o.name.toLowerCase());
        return true;
      })
      .sort((a, b) => 'HSB'.indexOf(a.kind) - 'HSB'.indexOf(b.kind) || a.name.localeCompare(b.name));
    for (const o of cleaned) {
      if (o.name.includes('|')) throw new Error(`office name contains the separator: ${o.name}`);
      names.push(o.name);
      kinds.push(o.kind);
    }
    perPincode.push(cleaned.length);
  }

  const out = {
    format: FORMAT,
    generatedBy: 'scripts/build-pincodes.mjs',
    sources: [DIRECTORY_PKG, GEOCODER_PKG, LEGACY_DIRECTORY_PKG],
    count: pins.length,
    stride: 6,
    districts,
    states,
    statesEn: states.map((s) => STATES[s].en),
    statesHi: states.map((s) => STATES[s].hi),
    // [pincode, lat×1e4, lng×1e4, districtIdx, stateIdx, elevation] × count,
    // pincode-ascending so `pincodes.ts` can binary-search it.
    rows: flat,
  };
  const officesOut = {
    format: FORMAT,
    generatedBy: 'scripts/build-pincodes.mjs',
    sources: [DIRECTORY_PKG, LEGACY_DIRECTORY_PKG],
    // Must equal pincodeData.json's count: `perPincode[i]` is how many of the names
    // below belong to row i of that table, in the same order.
    pincodeCount: pins.length,
    count: names.length,
    perPincode,
    // One string, not 165k: one allocation to load. Display only.
    names: names.join('|'),
    // The same names through `foldPlaceName`, in the same order — what search runs on.
    // Precomputed because folding 165k names on a phone at first search took seconds
    // (520 ms in Node); `pincodes.test.ts` asserts the runtime fold reproduces it.
    folded: names.map(foldPlaceName).join('|'),
    // H = head office, S = sub office (a town), B = branch office (a village).
    kinds: kinds.join(''),
  };

  writeFileSync(OUT, `${JSON.stringify(out)}\n`);
  writeFileSync(OUT_OFFICES, `${JSON.stringify(officesOut)}\n`);

  console.log(`· directory offices  : ${stats.offices} (${stats.armyPost} army/field post excluded); ${stats.legacy} legacy-only pincodes joined`);
  console.log(`· office coordinates : ${stats.junk} junk, ${stats.snapped} snapped centroids dropped; ${stats.witnesses} independent witnesses; ${stats.dmsRepairs} DMS repair votes`);
  console.log(`· pincodes           : ${directoryPins.size} in directory; ${stats.noCoordinate} with no usable coordinate, ${stats.outsideSortingDistrict} outside their sorting district`);
  console.log(`· labels             : ${misfiled.length} misfiled states repaired (${misfiled.join('; ')})`);
  console.log(`· written            : ${pins.length} pincodes, ${districts.length} districts, ${states.length} states, ${names.length} office names (${stats.droppedNames} empty/duplicate)`);
  console.log(`· ${path.relative(REPO, OUT)} (${(Buffer.byteLength(JSON.stringify(out)) / 1024).toFixed(0)} KB)`);
  console.log(`· ${path.relative(REPO, OUT_OFFICES)} (${(Buffer.byteLength(JSON.stringify(officesOut)) / 1024).toFixed(0)} KB)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

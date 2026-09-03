#!/usr/bin/env node
/**
 * Generates `mobile/src/panchang/pincodeData.json` — the nationwide pincode →
 * coordinate table behind the location picker's pincode tier.
 *
 * WHY A GENERATOR. Same reason `rajasthanTehsils.ts` documents its provenance: the
 * container's egress allows package registries only, so no gazetteer, census or
 * Wikipedia host is reachable. Both inputs are pulled off npm and joined here, and
 * the gates below are the whole reason the output is trustworthy — re-running this
 * script must reproduce the committed file byte for byte.
 *
 * INPUTS (both npm, neither a runtime dependency — devDependencies of this script):
 *   1. `india-pincode-search`  pincode → state / district / taluka / office (19,019 rows)
 *   2. `pincode-lat-long`      pincode → { lat, long }                     (18,925 rows)
 *
 * The join is on the 6-digit pincode and lands 18,581 rows (99.0% of the directory's
 * 18,777 distinct pincodes). Rows the directory has but the geocoder does not are
 * dropped rather than approximated — the same rule the Rajasthan file follows, and for
 * the same reason: a wrong coordinate serves another town's sunrise under the user's
 * own pincode, which is worse than an absent row the picker can honestly not find.
 *
 * GATES (each one drops rows; counts are printed on every run):
 *   - no geocoder row for the pincode
 *   - lat/lng of exactly 0,0 — the geocoder's null island, 160 rows
 *   - coordinates outside the India bounding box — 1 row
 *
 * Unlike the Rajasthan postal extract, this data needed no district-box gate: only 18
 * coordinates are shared by more than one pincode, so the mass snapping-onto-district-HQ
 * that forced the percentile box there simply is not present here.
 *
 * FIELD SEMANTICS — the directory's two name fields are confusingly named and BOTH are
 * needed. Its `city` is the real district (615 distinct, matching India's ~640) and its
 * `district` is the taluka (4,671 distinct). Neither alone is reliably the name a user
 * recognises: 416001 is district Kolhapur / taluka Karvir (district wins), but 781001 is
 * district Kamrup / taluka Guwahati (taluka wins). So both ship, district first, and the
 * picker renders "Kolhapur · Karvir" and "Kamrup · Guwahati" — collapsed to one name when
 * they are equal, as for Mumbai.
 *
 * COVERAGE IS UNEVEN, and callers must not assume otherwise. The geocoder is thin in the
 * north and northeast: it carries just 1 of the directory's 207 Jammu & Kashmir pincodes,
 * and 19 of 48 for Arunachal Pradesh. A Srinagar GPS fix would therefore find its "nearest"
 * pincode 156 km away in Doda — much worse than the bundled Srinagar city entry. This is
 * why `snapToNearestLocation` in `pincodes.ts` picks whichever of the nearest pincode and
 * the nearest city is actually CLOSER, rather than always preferring a pincode.
 *
 * ELEVATION is not in either dataset. Each pincode inherits the elevation of the nearest
 * bundled city, which can be badly wrong where the coast meets a plateau — Kolhapur (~550 m)
 * inherits Panaji's 7 m, a 543 m error. That was worth measuring rather than assuming, and
 * it is fine: against `astronomy-engine`'s `Observer`, 7 m vs 550 m at Kolhapur moves
 * sunrise by 7.5 SECONDS, and 0 m vs 1000 m by 13.6 s. The library's rise/set model weights
 * elevation far less than a textbook horizon-dip term would, so no elevation dataset is
 * worth 18k more rows of payload here.
 *
 * NO HINDI PLACE NAMES exist in either dataset, and `utils/transliterate.ts` runs
 * Devanagari → Gujarati/Kannada, not Latin → Devanagari. Machine-transliterating 18k
 * place names would put wrong Devanagari spellings in front of users, so the Hindi label
 * is built from Devanagari digits plus the state name — 36 hand-authored strings, small
 * enough to check by eye. See STATES below.
 *
 * Usage:  node scripts/build-pincodes.mjs
 */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const OUT = path.join(REPO, 'mobile/src/panchang/pincodeData.json');

const DIRECTORY_PKG = 'india-pincode-search@1.0.2';
const GEOCODER_PKG = 'pincode-lat-long@1.0.3';

// India bounding box, generous enough to include Andaman & Nicobar and Lakshadweep.
const INDIA = { latMin: 6.5, latMax: 37.6, lngMin: 68.0, lngMax: 97.5 };

/**
 * The 36 states/UTs the directory uses, keyed by its own (upper-case, ampersand-spelling)
 * label and mapped to the name we actually display in each script. Hand-authored and
 * hand-checked: these Devanagari strings are the ONLY Hindi in the generated file, which
 * is exactly why this is a bounded list and not a transliterator. A state missing here
 * fails the build rather than shipping an English-only Hindi label.
 *
 * DATASET VINTAGE. The directory predates two renames and one reorganisation, so the KEYS
 * below are deliberately its spellings while the values are current usage:
 *   - "CHATTISGARH" / "PONDICHERRY" are the directory's spellings; we display Chhattisgarh
 *     and Puducherry.
 *   - Ladakh is absent — the directory still files Leh and Kargil under Jammu & Kashmir.
 *     A Ladakh pincode therefore resolves to correct COORDINATES under a stale state label.
 *     That is a labelling wart, not a panchang error: sunrise comes from the coordinate.
 */
const STATES = {
  'ANDAMAN & NICOBAR ISLANDS': { en: 'Andaman & Nicobar Islands', hi: 'अंडमान और निकोबार' },
  'ANDHRA PRADESH': { en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' },
  'ARUNACHAL PRADESH': { en: 'Arunachal Pradesh', hi: 'अरुणाचल प्रदेश' },
  ASSAM: { en: 'Assam', hi: 'असम' },
  BIHAR: { en: 'Bihar', hi: 'बिहार' },
  CHANDIGARH: { en: 'Chandigarh', hi: 'चंडीगढ़' },
  CHATTISGARH: { en: 'Chhattisgarh', hi: 'छत्तीसगढ़' },
  'DADRA & NAGAR HAVELI': { en: 'Dadra & Nagar Haveli', hi: 'दादरा और नगर हवेली' },
  'DAMAN & DIU': { en: 'Daman & Diu', hi: 'दमन और दीव' },
  DELHI: { en: 'Delhi', hi: 'दिल्ली' },
  GOA: { en: 'Goa', hi: 'गोवा' },
  GUJARAT: { en: 'Gujarat', hi: 'गुजरात' },
  HARYANA: { en: 'Haryana', hi: 'हरियाणा' },
  'HIMACHAL PRADESH': { en: 'Himachal Pradesh', hi: 'हिमाचल प्रदेश' },
  'JAMMU & KASHMIR': { en: 'Jammu & Kashmir', hi: 'जम्मू और कश्मीर' },
  JHARKHAND: { en: 'Jharkhand', hi: 'झारखंड' },
  KARNATAKA: { en: 'Karnataka', hi: 'कर्नाटक' },
  KERALA: { en: 'Kerala', hi: 'केरल' },
  LAKSHADWEEP: { en: 'Lakshadweep', hi: 'लक्षद्वीप' },
  'MADHYA PRADESH': { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' },
  MAHARASHTRA: { en: 'Maharashtra', hi: 'महाराष्ट्र' },
  MANIPUR: { en: 'Manipur', hi: 'मणिपुर' },
  MEGHALAYA: { en: 'Meghalaya', hi: 'मेघालय' },
  MIZORAM: { en: 'Mizoram', hi: 'मिज़ोरम' },
  NAGALAND: { en: 'Nagaland', hi: 'नागालैंड' },
  ODISHA: { en: 'Odisha', hi: 'ओडिशा' },
  PONDICHERRY: { en: 'Puducherry', hi: 'पुदुचेरी' },
  PUNJAB: { en: 'Punjab', hi: 'पंजाब' },
  RAJASTHAN: { en: 'Rajasthan', hi: 'राजस्थान' },
  SIKKIM: { en: 'Sikkim', hi: 'सिक्किम' },
  'TAMIL NADU': { en: 'Tamil Nadu', hi: 'तमिलनाडु' },
  TELANGANA: { en: 'Telangana', hi: 'तेलंगाना' },
  TRIPURA: { en: 'Tripura', hi: 'त्रिपुरा' },
  'UTTAR PRADESH': { en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश' },
  UTTARAKHAND: { en: 'Uttarakhand', hi: 'उत्तराखंड' },
  'WEST BENGAL': { en: 'West Bengal', hi: 'पश्चिम बंगाल' },
};

/** Title-case a SCREAMING directory name, keeping the interior capitals of "Mc"-style rows alone. */
function titleCase(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function installInputs() {
  const dir = mkdtempSync(path.join(tmpdir(), 'pincode-build-'));
  console.log(`· installing inputs into ${dir}`);
  execSync(`npm install --silent --no-save --prefix "${dir}" ${DIRECTORY_PKG} ${GEOCODER_PKG}`, {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  const require = createRequire(path.join(dir, 'noop.js'));
  const directory = require('india-pincode-search/db/pincode_db.json');
  const geocoderModule = require('pincode-lat-long/pincode.js');
  return { directory, geocoder: geocoderModule.default ?? geocoderModule };
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
  const { directory, geocoder } = installInputs();
  const elevations = bundledCityElevations();

  // First directory row wins: a pincode with several post offices gets one entry, and
  // the rows are already ordered so the head/sub office precedes its branches.
  const byPin = new Map();
  for (const row of directory) if (!byPin.has(row.pincode)) byPin.set(row.pincode, row);

  const dropped = { noGeocode: 0, nullIsland: 0, outsideIndia: 0, unknownState: 0 };
  const rows = [];

  for (const [pin, row] of byPin) {
    const coords = geocoder[pin];
    if (!coords) {
      dropped.noGeocode += 1;
      continue;
    }
    const lat = Number(coords.lat);
    const lng = Number(coords.long);
    if (lat === 0 && lng === 0) {
      dropped.nullIsland += 1;
      continue;
    }
    if (lat < INDIA.latMin || lat > INDIA.latMax || lng < INDIA.lngMin || lng > INDIA.lngMax) {
      dropped.outsideIndia += 1;
      continue;
    }
    if (!STATES[row.state]) {
      dropped.unknownState += 1;
      console.error(`  ! no Hindi name for state "${row.state}" (pincode ${pin})`);
      continue;
    }
    rows.push({
      pin,
      lat: Math.round(lat * 1e4),
      lng: Math.round(lng * 1e4),
      district: titleCase(row.city),
      taluka: titleCase(row.district),
      state: row.state,
      elevation: nearestElevation(elevations, lat, lng),
    });
  }

  if (dropped.unknownState > 0) {
    throw new Error(`${dropped.unknownState} rows carry a state with no Hindi name — extend STATES`);
  }

  rows.sort((a, b) => a.pin.localeCompare(b.pin));

  // Compact layout: two string dictionaries plus one flat numeric array, five numbers
  // per row. Cuts the payload from 1.36 MB of verbose JSON to ~600 KB, and the flat
  // array parses into one contiguous typed structure instead of 18k little objects.
  const districts = [...new Set(rows.map((r) => r.district))];
  const talukas = [...new Set(rows.map((r) => r.taluka))];
  const states = [...new Set(rows.map((r) => r.state))];
  const districtIndex = new Map(districts.map((d, i) => [d, i]));
  const talukaIndex = new Map(talukas.map((t, i) => [t, i]));
  const stateIndex = new Map(states.map((s, i) => [s, i]));

  const flat = [];
  for (const r of rows) {
    flat.push(
      Number(r.pin),
      r.lat,
      r.lng,
      districtIndex.get(r.district),
      talukaIndex.get(r.taluka),
      stateIndex.get(r.state),
      r.elevation
    );
  }

  const out = {
    // Bump when the row layout changes — `pincodes.ts` asserts on it.
    format: 1,
    generatedBy: 'scripts/build-pincodes.mjs',
    sources: [DIRECTORY_PKG, GEOCODER_PKG],
    count: rows.length,
    stride: 7,
    districts,
    talukas,
    states,
    statesEn: states.map((s) => STATES[s].en),
    statesHi: states.map((s) => STATES[s].hi),
    // [pincode, lat×1e4, lng×1e4, districtIdx, talukaIdx, stateIdx, elevation] × count,
    // pincode-ascending so `pincodes.ts` can binary-search it.
    rows: flat,
  };

  writeFileSync(OUT, `${JSON.stringify(out)}\n`);

  const bytes = Buffer.byteLength(JSON.stringify(out));
  console.log(`· directory pincodes : ${byPin.size}`);
  console.log(`· dropped            : ${dropped.noGeocode} no geocode, ${dropped.nullIsland} null island, ${dropped.outsideIndia} outside India`);
  console.log(`· written            : ${rows.length} rows, ${districts.length} districts, ${talukas.length} talukas, ${states.length} states`);
  console.log(`· ${path.relative(REPO, OUT)} (${(bytes / 1024).toFixed(0)} KB)`);
}

main();

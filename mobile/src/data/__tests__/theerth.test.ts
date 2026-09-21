/**
 * Theerth data-contract tests.
 * Verifies the temple dataset + the generated India map agree, that pins land
 * on real geography, and that every temple has sourced detail prose.
 * Run: npx tsx src/data/__tests__/theerth.test.ts
 */
import assert from 'node:assert/strict';
import { temples, getTempleById, otherFamous, templesInGroup } from '../theerth/temples';
import { library } from '../texts';
import {
  INDIA_PROJECTION,
  INDIA_STATES,
} from '../../components/indiaMapPaths.generated';

const VALID_DEITIES = new Set([
  'rama',
  'krishna',
  'vishnu',
  'shiva',
  'hanuman',
  'durga',
  'ganesha',
  'savitr',
  'surya',
]);

const { lngMin, lngMax, latMin, latMax, width, height } = INDIA_PROJECTION;

function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng - lngMin) / (lngMax - lngMin)) * width,
    y: ((latMax - lat) / (latMax - latMin)) * height,
  };
}
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

// Parse a generated SVG path → projected-space bounding box.
function pathBBox(path: string) {
  const nums = [...path.matchAll(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g)];
  let minx = Infinity,
    miny = Infinity,
    maxx = -Infinity,
    maxy = -Infinity;
  for (const m of nums) {
    const x = +m[1];
    const y = +m[2];
    minx = Math.min(minx, x);
    maxx = Math.max(maxx, x);
    miny = Math.min(miny, y);
    maxy = Math.max(maxy, y);
  }
  return { minx, miny, maxx, maxy };
}

const stateByNorm = new Map(INDIA_STATES.map((s) => [norm(s.nameEn), s] as const));

// ─── 1. Unique ids ───────────────────────────────────────────────────────────
const ids = temples.map((t) => t.id);
assert.equal(new Set(ids).size, ids.length, 'temple ids must be unique');

// ─── 2. Deity ∈ union (RULEBOOK §11.4) ────────────────────────────────────────
for (const t of temples) {
  assert.ok(VALID_DEITIES.has(t.deity), `${t.id}: invalid deity "${t.deity}"`);
}

// ─── 3. Coordinates in projection bounds (catches lat/lng swaps) ──────────────
for (const t of temples) {
  const { lat, lng } = t.coordinates;
  assert.ok(
    lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax,
    `${t.id}: coords out of India bounds (lat=${lat}, lng=${lng})`,
  );
}

// ─── 4. Each temple's stateEn matches a generated state (highlight works) ─────
for (const t of temples) {
  assert.ok(
    stateByNorm.has(norm(t.stateEn)),
    `${t.id}: stateEn "${t.stateEn}" has no matching India map state`,
  );
}

// ─── 5. Projection alignment: pin lands inside its declared state's bbox ──────
// Guards against a broken projection — if the math drifts, pins leave the state.
const MARGIN = 2; // px slack for boundary temples + path simplification
for (const t of temples) {
  const { x, y } = project(t.coordinates.lat, t.coordinates.lng);
  const st = stateByNorm.get(norm(t.stateEn))!;
  const bb = pathBBox(st.path);
  assert.ok(
    x >= bb.minx - MARGIN &&
      x <= bb.maxx + MARGIN &&
      y >= bb.miny - MARGIN &&
      y <= bb.maxy + MARGIN,
    `${t.id}: projected pin (${x.toFixed(1)},${y.toFixed(1)}) outside ${t.stateEn} bbox`,
  );
}

// ─── 6. Sourced detail prose exists for every temple ──────────────────────────
for (const t of temples) {
  for (const [key, value] of Object.entries({
    significanceHi: t.significanceHi,
    significanceEn: t.significanceEn,
    originStoryHi: t.originStoryHi,
    originStoryEn: t.originStoryEn,
  })) {
    assert.ok(value.trim().length >= 24, `${t.id}: missing ${key}`);
    assert.ok(!/RULEBOOK|placeholder|pending/i.test(value), `${t.id}: ${key} is still placeholder prose`);
  }
  assert.ok(t.sources.length > 0, `${t.id}: must list at least one source`);
  for (const source of t.sources) {
    assert.ok(source.label.trim().length > 0, `${t.id}: source label is empty`);
    assert.match(source.url, /^https:\/\//, `${t.id}: source URL must be https`);
  }
}

// ─── 6a. Optional extended sections follow the same sourced-prose contract ────
for (const t of temples) {
  const sections = t.sections ?? [];
  const sectionIds = sections.map((s) => s.id);
  assert.equal(new Set(sectionIds).size, sectionIds.length, `${t.id}: section ids must be unique`);
  for (const s of sections) {
    for (const [key, value] of Object.entries({ titleHi: s.titleHi, titleEn: s.titleEn })) {
      assert.ok(value.trim().length > 0, `${t.id}/${s.id}: missing ${key}`);
    }
    for (const [key, value] of Object.entries({ bodyHi: s.bodyHi, bodyEn: s.bodyEn })) {
      assert.ok(value.trim().length >= 80, `${t.id}/${s.id}: ${key} too short for an extended section`);
      assert.ok(!/RULEBOOK|placeholder|pending/i.test(value), `${t.id}/${s.id}: ${key} is still placeholder prose`);
    }
  }
  if (sections.length > 0) {
    assert.ok(t.sources.length >= 2, `${t.id}: extended sections need ≥2 sources (RULEBOOK §12.4)`);
  }
}

// ─── 6a′. RULEBOOK §12.6 — every NEW temple ships the full extended reading ─
// The 64 rows that predate the rule are pinned here (70 at the rule's birth; the Rajasthan wave enriched 6). A new id that lacks
// `sections` fails; extending this allowlist needs a recorded product decision.
const LEGACY_WITHOUT_SECTIONS = new Set([
  'somnath', 'mallikarjuna', 'mahakaleshwar', 'omkareshwar', 'kedarnath', 'bhimashankar',
  'kashi-vishwanath', 'trimbakeshwar', 'vaidyanath', 'nageshwar', 'rameshwaram',
  'grishneshwar', 'badrinath', 'dwarkadhish', 'jagannath-puri', 'yamunotri', 'gangotri',
  'kamakhya', 'vaishno-devi', 'kalighat', 'naina-devi', 'jwala-devi', 'chamunda-devi',
  'tirupati-balaji', 'meenakshi', 'konark-sun', 'brihadeeswarar', 'padmanabhaswamy',
  'banke-bihari', 'srinathji', 'udupi-krishna', 'vishnupad-gaya', 'bhadrachalam',
  'danteshwari', 'mangueshi', 'lakshmi-narayan', 'durgiana', 'mansa-devi', 'govindajee-imphal',
  'tripura-sundari', 'manakula-vinayagar', 'parashuram-kund', 'nartiang-durga', 'kirateshwar',
  'vetrimalai-murugan', 'iskcon-chandigarh', 'dimapur-kalibari', 'khandoba-jejuri', 'sabarimala', 'mahasu-devta-hanol',
  'kamakshi', 'shrinkhala', 'chamundeshwari', 'jogulamba',
  'bhramaramba', 'mahalakshmi-kolhapur', 'ekaveerika-mahur', 'harsiddhi-ujjain', 'puruhutika',
  'biraja', 'manikyamba', 'madhaveswari', 'mangala-gauri', 'vishalakshi',
]);
assert.equal(LEGACY_WITHOUT_SECTIONS.size, 64, 'legacy no-sections allowlist is pinned at 64');
for (const t of temples) {
  if (LEGACY_WITHOUT_SECTIONS.has(t.id)) continue;
  const ids = (t.sections ?? []).map((s) => s.id);
  assert.deepEqual(
    ids,
    ['sthapana', 'svarup', 'parampara', 'mela', 'yatra'],
    `${t.id}: new temples must ship the five RULEBOOK §12.6 sections in order (got [${ids.join(', ')}])`,
  );
}

// Salasar Balaji ships the first full extended reading: sthapana → form → traditions → melas → yatra.
const salasar = getTempleById('salasar-balaji');
assert.ok(salasar, 'salasar-balaji must exist');
assert.deepEqual(
  (salasar.sections ?? []).map((s) => s.id),
  ['sthapana', 'svarup', 'parampara', 'mela', 'yatra'],
  'salasar-balaji extended sections in reading order',
);
assert.match(salasar.sections![0].bodyHi, /1811/, 'sthapana katha carries the Samvat 1811 consecration');
assert.match(salasar.sections![0].bodyEn, /Mohandas/, 'sthapana katha names Mohandas Ji');
assert.match(salasar.sections![0].bodyEn, /Asota/, 'sthapana katha names Asota');

// Rajasthan wave: the six Rajasthan lokdevta/kuldevi shrines carry the same five-section reading.
const RAJASTHAN_WAVE: Record<string, { hi: RegExp; en: RegExp; fact: string }> = {
  'khatu-shyam': { hi: /रूपसिंह चौहान/, en: /1027 CE/, fact: 'Roop Singh Chauhan founded the shrine in 1027 CE' },
  'karni-mata': { hi: /1476/, en: /Ganga Singh/, fact: 'Deshnoke founded in Samvat 1476; Ganga Singh built the marble temple' },
  'jeen-mata': { hi: /1029/, en: /Aurangzeb/, fact: 'oldest inscription 1029 CE; the Aurangzeb akhand jyot' },
  'gogaji-gogamedi': { hi: /फ़िरोज़शाह तुग़लक़/, en: /1911 CE/, fact: 'the Tughlaq medi restored by Ganga Singh in 1911' },
  'tejaji-kharnal': { hi: /1130/, en: /28 August 1103/, fact: 'born Samvat 1130, sacrifice at Sursura on 28 August 1103' },
  ramdevra: { hi: /1442/, en: /1931 CE/, fact: 'samadhi in Samvat 1442; Ganga Singh built the temple in 1931' },
};
for (const [id, pin] of Object.entries(RAJASTHAN_WAVE)) {
  const temple = getTempleById(id);
  assert.ok(temple, `${id} must exist`);
  assert.deepEqual(
    (temple.sections ?? []).map((s) => s.id),
    ['sthapana', 'svarup', 'parampara', 'mela', 'yatra'],
    `${id} extended sections in reading order`,
  );
  assert.match(temple.sections![0].bodyHi, pin.hi, `${id}: ${pin.fact} (hi)`);
  assert.match(temple.sections![0].bodyEn, pin.en, `${id}: ${pin.fact} (en)`);
  for (const s of temple.sections!) {
    assert.ok(s.bodyHi.length >= 80 && s.bodyEn.length >= 80, `${id}/${s.id}: each body is a real prose block`);
    assert.ok(/[\u0900-\u097F]/.test(s.bodyHi) && !/[\u0900-\u097F]/.test(s.bodyEn), `${id}/${s.id}: hi is Devanagari, en is not`);
  }
}

// ─── 6b. Shakti Peeth membership = every recognised peeth plotted on this map ─
// The pre-existing 7 peeths plus the 14 India-located Ashtadasha additions (= 21).
assert.deepEqual(
  templesInGroup('shakti-peeth').map((t) => t.id).sort(),
  [
    'bhramaramba',
    'biraja',
    'chamundeshwari',
    'danteshwari',
    'ekaveerika-mahur',
    'harsiddhi-ujjain',
    'jogulamba',
    'jwala-devi',
    'kalighat',
    'kamakhya',
    'kamakshi',
    'madhaveswari',
    'mahalakshmi-kolhapur',
    'mangala-gauri',
    'manikyamba',
    'naina-devi',
    'nartiang-durga',
    'puruhutika',
    'shrinkhala',
    'tripura-sundari',
    'vishalakshi',
  ].sort(),
  'Shakti Peeth group should include every recognised peeth plotted on this map',
);

// ─── 6c. All 16 India-located Ashtadasha Maha Shakti Peeths are present + tagged ─
// Adi Shankara's Ashtadasha stotram lists 18; 16 lie in modern India (these +
// Kamakhya/Kamarupa & Jwala/Vaishnavi). The 2 abroad (Shankari/Sri Lanka,
// Sharada/PoK) fall outside the India map and are catalog-documented, not pinned.
const ASHTADASHA_INDIA = [
  'kamakshi', 'shrinkhala', 'chamundeshwari', 'jogulamba', 'bhramaramba',
  'mahalakshmi-kolhapur', 'ekaveerika-mahur', 'harsiddhi-ujjain', 'puruhutika',
  'biraja', 'manikyamba', 'madhaveswari', 'mangala-gauri', 'vishalakshi',
  'kamakhya', 'jwala-devi',
];
assert.equal(ASHTADASHA_INDIA.length, 16, 'expected 16 India-located Ashtadasha peeths');
const shaktiIds = new Set(templesInGroup('shakti-peeth').map((t) => t.id));
for (const id of ASHTADASHA_INDIA) {
  assert.ok(getTempleById(id), `Ashtadasha shrine missing from dataset: ${id}`);
  assert.ok(shaktiIds.has(id), `Ashtadasha shrine not tagged shakti-peeth: ${id}`);
}

// ─── 7. Statewise coverage — these states must each have ≥1 temple ────────────
const EXPECTED_STATES = [
  // pre-existing
  'Gujarat', 'Andhra Pradesh', 'Madhya Pradesh', 'Uttarakhand', 'Maharashtra',
  'Uttar Pradesh', 'Jharkhand', 'Tamil Nadu', 'Odisha', 'Assam',
  'Jammu & Kashmir', 'West Bengal', 'Himachal Pradesh', 'Kerala',
  // statewise additions
  'Rajasthan', 'Karnataka', 'Bihar', 'Telangana', 'Chhattisgarh', 'Goa',
  'Delhi', 'Punjab', 'Haryana', 'Manipur', 'Tripura', 'Puducherry',
  'Arunachal Pradesh', 'Meghalaya', 'Sikkim',
  // gap-state gap-fill (marquee shrine added for each)
  'Andaman and Nicobar Islands', 'Chandigarh', 'Nagaland',
];
const presentStates = new Set(temples.map((t) => norm(t.stateEn)));
for (const s of EXPECTED_STATES) {
  assert.ok(presentStates.has(norm(s)), `no temple for expected state "${s}"`);
}

// ─── 8. getTempleById + otherFamous sanity ────────────────────────────────────
assert.ok(getTempleById('srinathji'), 'getTempleById should find a statewise temple');
assert.equal(getTempleById('does-not-exist'), undefined);
assert.ok(
  otherFamous().every((t) => t.groups.length === 0),
  'otherFamous must only return ungrouped temples',
);

// ─── 9. Total temple count is pinned (guards accidental drops on enrichment) ──
assert.equal(temples.length, 71, `expected 71 temples, got ${temples.length}`);

// ─── 10. User-facing library counts stay in sync with the live data ──────────
const famousTheerth = library.find((entry) => entry.id === 'famous-theerth');
assert.ok(famousTheerth, 'famous-theerth library entry should exist');
assert.match(famousTheerth.sub, /71 तीर्थ/, 'Hindi famous-theerth subtitle should match temple count');
assert.match(famousTheerth.subEn, /71 Theerths/, 'English famous-theerth subtitle should match temple count');

console.log(
  `✓ theerth data-contract: ${temples.length} temples, ${EXPECTED_STATES.length} states covered, projection aligned, sourced prose present`,
);

/**
 * Theerth data-contract tests.
 * Verifies the temple dataset + the generated India map agree, that pins land
 * on real geography, and that every temple has sourced detail prose.
 * Run: npx tsx src/data/__tests__/theerth.test.ts
 */
import assert from 'node:assert/strict';
import { temples, getTempleById, otherFamous, templesInGroup } from '../theerth/temples';
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

// ─── 2. Deity ∈ union (RULEBOOK §10.4) ────────────────────────────────────────
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

console.log(
  `✓ theerth data-contract: ${temples.length} temples, ${EXPECTED_STATES.length} states covered, projection aligned, sourced prose present`,
);

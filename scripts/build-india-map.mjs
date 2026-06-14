#!/usr/bin/env node
/**
 * build-india-map.mjs
 * ---------------------------------------------------------------------------
 * Generates mobile/src/components/indiaMapPaths.generated.ts — the real India
 * outline + state-boundary SVG paths used by <IndiaMap> — from open
 * public-domain Natural Earth data. Run once at build time; the output is
 * committed as static constants (design.md §28: no runtime GeoJSON parsing).
 *
 *   node scripts/build-india-map.mjs
 *
 * Source: Natural Earth 50m admin_0_countries + admin_1_states_provinces
 *   (public domain — https://www.naturalearthdata.com/about/terms-of-use/).
 *
 * The projection MUST match design.md §28 (equirectangular, lng∈[68,98],
 * lat∈[6,38], latitude flipped) AND IndiaMap.projectLatLng — pins are placed
 * with the same constants the paths are generated from, so they land exactly
 * on the real outline.
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const CACHE = path.join(__dirname, '.cache');
const OUT = path.join(REPO, 'mobile/src/components/indiaMapPaths.generated.ts');

const SOURCES = {
  admin0: {
    file: path.join(CACHE, 'ne_50m_admin_0.geojson'),
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson',
  },
  admin1: {
    file: path.join(CACHE, 'ne_50m_admin_1.geojson'),
    url: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson',
  },
};

// design.md §28 projection. width:height ≈ 1:1.15 approximates India's true
// proportions via the viewBox (pure per-axis linear map, no cosine term).
const PROJ = { lngMin: 68, lngMax: 98, latMin: 6, latMax: 38, width: 300, height: 345 };
const SIMPLIFY_EPS = 0.4; // px tolerance in projected space
const MIN_RING_AREA = 1.0; // px² — drop islands smaller than this (keep largest per feature)

// Natural Earth uses a few legacy spellings; normalise to current usage so the
// generated nameEn matches TheerthTemple.stateEn.
const NAME_ALIASES = {
  'Jammu and Kashmir': 'Jammu & Kashmir',
  Orissa: 'Odisha',
  Uttaranchal: 'Uttarakhand',
  Pondicherry: 'Puducherry',
};

async function loadGeoJSON({ file, url }) {
  if (!existsSync(file)) {
    await mkdir(CACHE, { recursive: true });
    process.stdout.write(`fetching ${url}\n`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${url} → HTTP ${res.status}`);
    await writeFile(file, await res.text());
  }
  return JSON.parse(await readFile(file, 'utf8'));
}

function project([lng, lat]) {
  const x = ((lng - PROJ.lngMin) / (PROJ.lngMax - PROJ.lngMin)) * PROJ.width;
  const y = ((PROJ.latMax - lat) / (PROJ.latMax - PROJ.latMin)) * PROJ.height;
  return [x, y];
}

function perpDist(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const cx = a[0] + t * dx;
  const cy = a[1] + t * dy;
  return Math.hypot(p[0] - cx, p[1] - cy);
}

function rdp(points, eps) {
  if (points.length < 3) return points;
  let dmax = 0;
  let idx = 0;
  const a = points[0];
  const b = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], a, b);
    if (d > dmax) {
      dmax = d;
      idx = i;
    }
  }
  if (dmax > eps) {
    const left = rdp(points.slice(0, idx + 1), eps);
    const right = rdp(points.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }
  return [a, b];
}

function ringArea(pts) {
  let area = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    area += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]);
  }
  return Math.abs(area / 2);
}

const r1 = (n) => Math.round(n * 10) / 10;

/** Outer ring of each polygon → projected, simplified, area-filtered subpaths. */
function geometryToSubpaths(geometry) {
  const polys =
    geometry.type === 'MultiPolygon'
      ? geometry.coordinates
      : geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : [];
  const rings = [];
  for (const poly of polys) {
    const outer = poly[0]; // ignore holes — negligible for India states
    if (!outer || outer.length < 4) continue;
    const projected = outer.map(project);
    const simplified = rdp(projected, SIMPLIFY_EPS);
    if (simplified.length < 3) continue;
    rings.push({ pts: simplified, area: ringArea(simplified) });
  }
  if (rings.length === 0) return [];
  const maxArea = Math.max(...rings.map((r) => r.area));
  return rings
    .filter((r) => r.area >= MIN_RING_AREA || r.area === maxArea)
    .map(
      (r) =>
        'M' +
        r.pts.map((p, i) => `${i === 0 ? '' : 'L'}${r1(p[0])} ${r1(p[1])}`).join(' ') +
        'Z',
    );
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const [admin0, admin1] = await Promise.all([
    loadGeoJSON(SOURCES.admin0),
    loadGeoJSON(SOURCES.admin1),
  ]);

  const indiaCountry = admin0.features.find(
    (f) => f.properties.ADM0_A3 === 'IND' || (f.properties.ADMIN || f.properties.admin) === 'India',
  );
  if (!indiaCountry) throw new Error('India not found in admin_0');
  const outline = geometryToSubpaths(indiaCountry.geometry);

  const indiaStates = admin1.features
    .filter((f) => (f.properties.admin || '').toLowerCase() === 'india' || f.properties.adm0_a3 === 'IND')
    .map((f) => {
      const rawName = f.properties.name_en || f.properties.name;
      const nameEn = NAME_ALIASES[rawName] || rawName;
      const subpaths = geometryToSubpaths(f.geometry);
      return { id: slug(nameEn), nameEn, path: subpaths.join(' ') };
    })
    .filter((s) => s.path.length > 0)
    .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

  const retrievedOn = new Date().toISOString().slice(0, 10);
  const outlineSize = outline.join('').length;
  const statesSize = indiaStates.reduce((n, s) => n + s.path.length, 0);

  const header = `// AUTO-GENERATED by scripts/build-india-map.mjs — DO NOT EDIT BY HAND.
// Regenerate: node scripts/build-india-map.mjs
//
// Source: Natural Earth 50m admin_0_countries + admin_1_states_provinces.
//   Public domain — https://www.naturalearthdata.com/about/terms-of-use/
//   Retrieved: ${retrievedOn}
//
// Projection (design.md §28): equirectangular, lng∈[68,98]→x, lat∈[6,38]→y,
// latitude flipped. IndiaMap.projectLatLng uses INDIA_PROJECTION so pins land
// exactly on this outline. ${indiaStates.length} states/UTs.
`;

  const body = `${header}
export type IndiaProjection = {
  lngMin: number; lngMax: number; latMin: number; latMax: number;
  width: number; height: number;
};

export const INDIA_PROJECTION: IndiaProjection = ${JSON.stringify(PROJ)};

/** India national outline (mainland + major islands), one entry per landmass. */
export const INDIA_OUTLINE: readonly string[] = [
${outline.map((p) => `  ${JSON.stringify(p)},`).join('\n')}
];

export type IndiaStatePath = { id: string; nameEn: string; path: string };

/** State/UT boundaries — also used as fill regions for the By-State highlight. */
export const INDIA_STATES: readonly IndiaStatePath[] = [
${indiaStates.map((s) => `  { id: ${JSON.stringify(s.id)}, nameEn: ${JSON.stringify(s.nameEn)}, path: ${JSON.stringify(s.path)} },`).join('\n')}
];
`;

  await writeFile(OUT, body);
  process.stdout.write(
    `wrote ${path.relative(REPO, OUT)}\n` +
      `  outline: ${outline.length} landmasses, ${outlineSize} path chars\n` +
      `  states:  ${indiaStates.length}, ${statesSize} path chars\n` +
      `  total:   ${((outlineSize + statesSize) / 1024).toFixed(1)} KB of path data\n`,
  );
}

main().catch((err) => {
  process.stderr.write(`build-india-map error: ${err?.message ?? err}\n`);
  process.exit(1);
});

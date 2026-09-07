# Regenerating `src/data/vastu/declination.ts` (PRD-24 §3)

The table carries one WMM declination value (deg, east-positive, 0.1° rounding) per
bundled city id in `CITIES` (`src/panchang/locations.ts` + `src/panchang/rajasthanTehsils.ts`).
Secular variation across India is ≤ ~0.2°/yr — regenerate when a new WMM epoch ships
(next: WMM-2030), not per release.

Method (BGS geomag web service, no key needed):

1. Extract `{id, latitude, longitude}` for every entry of `CITIES` (Ujjain's coordinates
   live in `src/panchang/engine.ts` as `UJJAIN_LAT`/`UJJAIN_LNG`).
2. For each, GET
   `https://geomag.bgs.ac.uk/web_service/GMModels/wmm/current?latitude=<lat>&longitude=<lng>&altitude=0&date=<today>&format=json`
   and read `geomagnetic-field-model-result.field-value.declination.value`.
3. Round to 0.1°, emit `DECLINATION_BY_CITY` in `CITIES` order, update the header
   comment's model + evaluation date.
4. `vastuContent.test.ts` pins that every bundled city id has a value — run it.

Last generated: 2026-08-27, WMM-2025, 394 entries, 0 fetch errors, range −1.7° … +2.8°.

## Grid method (`src/data/vastu/declinationGrid.ts`, PRD-24 Phase 2 §A3)

The grid carries one WMM value per 1° × 1° node over 6–38°N, 66–100°E (33 rows ×
35 cols = 1,155 nodes), stored as INTEGER TENTHS of a degree, east-positive,
row-major (latitude ascending, longitude ascending within a row). Bilinear
interpolation serves any coordinate inside the box; outside returns null
(silently magnetic — RULEBOOK §22.7).

1. For each node, GET the same BGS endpoint as above with `latitude=<lat>`,
   `longitude=<lon>` (integers), `altitude=0`, `date=<today>`.
2. `declination.units` is reported as `deg (east)` — verify it, then emit
   `Math.round(value * 10)` into `DECLINATION_GRID_TENTHS`.
3. Update the header comment's model + evaluation date.
4. `declinationGrid.test.ts` pins the shape AND that every bundled city's grid
   value agrees with `DECLINATION_BY_CITY` within 0.2° — the city table is the
   oracle; a breach means re-verify that city, never loosen the tolerance.

Last generated: 2026-09-07, WMM-2025, 1,155 nodes, 0 fetch errors, range −2.2° … +4.8°.

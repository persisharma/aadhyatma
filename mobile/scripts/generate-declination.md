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

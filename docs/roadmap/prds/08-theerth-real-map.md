# PRD-08 — Theerth: Real India Map + Statewise Famous Temples

| | |
|---|---|
| **Status** | In progress (autonomous build on branch `india-map-temple-walkthrough`) |
| **Parent** | Extends PRD-07 (Theerth) — replaces the prototype map; adds statewise coverage |
| **T-shirt size** | M (map data generation, ~16 new temples, By-State highlight, Jest + Maestro e2e) |
| **Owner** | TBA |

---

## 1. Why

PRD-07 shipped the Theerth surface with a **hand-drawn 14-point polygon** standing in
for India (`IndiaMap.tsx` → `INDIA_OUTLINE_PATH`). Pins are placed by a naive
lat/lng→x/y projection onto that fake outline, so they don't sit on real geography.
The walkthrough is approved; this PRD productionises it:

1. **Replace the fake polygon with a real, accurate India map** — national outline +
   state boundaries — generated once from open public-domain data, committed as static
   SVG path constants (no map provider, no API key, no runtime GeoJSON parsing — per
   design.md §28).
2. **Add statewise famous temples** so the map and the By-State view cover all of India
   (one marquee temple per state/UT not already represented).
3. **Highlight the focused state** on the map in the By-State view.
4. **Lock it with e2e tests** — Jest integration (render + tap + navigation + projection)
   and Maestro device flows.

## 2. Non-goals (unchanged from PRD-07)

- No `react-native-maps` / tile provider / GPS / pinch-zoom.
- **No LLM-generated significance/origin prose** (RULEBOOK §10.3, hard gate). New temples
  are **factual metadata only** (name, city, state, coordinates, deity); the detail
  screen keeps the existing "pending verification" placeholder until prose is sourced.
- No new dependencies (`react-native-svg` already present).

## 3. Real-map generation

**Source.** Natural Earth (public domain — no attribution required):
- `admin_0_countries` (50m) → India polygon → **national outline**.
- `admin_1_states_provinces` (50m) → India states → **internal state borders** and the
  fillable regions used for the By-State highlight.

**Build script** `scripts/build-india-map.mjs` (re-runnable, records source URL + license
+ retrieval date in the generated header):
1. Fetch both GeoJSONs, filter features to India (`admin === 'India'` / `adm0_a3 === 'IND'`).
2. Normalise legacy NE state names to current usage (Orissa→Odisha, Uttaranchal→Uttarakhand,
   Pondicherry→Puducherry, "Jammu and Kashmir"→"Jammu & Kashmir", etc.) so generated
   `nameEn` matches temple `stateEn`.
3. Project every coordinate with the **design.md §28 projection** — equirectangular,
   `lng ∈ [68,98] → x ∈ [0,width]`, `lat ∈ [6,38] → y ∈ [0,height]`, latitude flipped.
   `width = 300`; `height = 345` (≈ India's true 1:1.15 proportions via the viewBox
   dimensions — a pure per-axis linear map, no cosine term in the formula).
4. Simplify (Douglas–Peucker, tolerance ~0.4 px in projected space) to keep path strings
   small; drop islands smaller than a min-area threshold (keep Andaman/Nicobar +
   Lakshadweep clusters).
5. Emit `mobile/src/components/indiaMapPaths.generated.ts`:
   ```ts
   export const INDIA_PROJECTION = { lngMin:68, lngMax:98, latMin:6, latMax:38, width:300, height:345 } as const;
   export const INDIA_OUTLINE: readonly string[];                              // country polygons
   export const INDIA_STATES: readonly { id:string; nameEn:string; path:string }[];
   ```

**The alignment invariant:** `IndiaMap.projectLatLng` reads the *same* `INDIA_PROJECTION`
constants the paths were generated from, so pins land exactly on the real outline. This
is the entire fix for "pins on a random map".

## 4. `IndiaMap.tsx` changes

- Render `INDIA_OUTLINE` (saffron-deep @0.6, 1.2px) + `INDIA_STATES[].path` (saffron @0.25,
  0.6px) when `showStates`.
- `projectLatLng` uses `INDIA_PROJECTION`; dev out-of-bounds warning uses [6,38]/[68,98].
- New prop `highlightStateEn?: string` → fills the matching state path saffron @~0.12
  (matched via a normalising comparison of `nameEn`).
- Props extend the §28 API; `showStates` defaults true on the Theerth surface.

## 5. Statewise temples (~16 new, metadata only)

One marquee temple per state/UT not already represented by the 31 existing entries, e.g.
Lingaraj (Odisha already via Konark — pick uncovered states), Virupaksha/Hampi (Karnataka),
Mahabodhi-area Vishnupad (Bihar), Kamakhya already (Assam), Govind Dev/Galtaji (Rajasthan),
Mahakaleshwar already (MP)… Final list selects states with **no** existing temple. All
carry `groups: []` (→ "Other Famous Temples" in By-Yatra, and grouped by `stateEn` in
By-State). Backed by a data-contract test (coords in projection bounds, `deity` ∈ union,
every state/UT with a famous temple represented, **no prose fields present**).

## 6. By-State highlight

By-State view renders a **compact India map on top** (`showStates`, `highlightStateEn` =
the focused state), grouped list below. Tapping a state header focuses/highlights that
state. Map view stays the default.

## 7. Tests (e2e — both)

- **Jest integration** (`src/screens/__tests__/`, `src/components/__tests__/`,
  `src/data/__tests__/`): projection math + alignment; `IndiaMap` renders real paths +
  bounds warning; `TheerthMapScreen` Map/By-State/By-Yatra toggle, pin tap → navigate
  with `templeId`, state highlight; `TheerthDetailScreen` render + placeholder + language
  flip; temples data contract.
- **Maestro** (`mobile/.maestro/theerth.yaml`): Home → Theerth → map renders → tap pin →
  detail → back → By-State → tap row → detail. Run on iOS sim per the known
  Metro + Expo Go + openurl workflow.
- Coverage target ≥95% (CLAUDE.md).

## 8. design.md / RULEBOOK compliance

- design.md §28 amended: document `showStates: true` usage on Theerth, the
  `highlightStateEn` prop, `height=345`, and the real-map provenance (generation script,
  source, license). Projection numbers unchanged.
- RULEBOOK §10.3 enforced by the data-contract test (no prose on new temples).

# PRD-07 — Theerth (तीर्थ): Pilgrimage Map of India

| | |
|---|---|
| **Status** | Proposed — rulebook + design.md extension AND a new map dependency required before scaffold |
| **Target release** | TBD |
| **T-shirt size** | XL (new category, new screen archetype, new map infrastructure, sourced content per temple) |
| **Owner** | TBA |

---

## 0. Why this PRD exists

`/add-section` was invoked with a request for a "temple tour" section. The skill's only known shape is a verse-based recitation reader (`lines[] + meaningHi + meaningEn`). The user has clarified the intended UX:

> "Once we select category of temples then it's shows on map of India or group by state. The name will be **Theerth**."

This is **not** a reader at all — it's a **map-driven discovery surface** with a state-grouped list as the alternate view, and a per-temple detail screen as the destination. Three new screen archetypes, one new infrastructure dependency (map rendering), and a category type the existing rulebook does not know about.

**Nothing in this document has been implemented yet.** Treat it as a proposal for review.

---

## 1. Problem

Aadhyatma is a recitation/meditation app — every existing section is a verse pager (Gita-style, Sundarkand-style, or Chalisa-style) or a counter (Japam). Users have asked for a way to discover and learn about India's famous temples: their location, presiding deity, spiritual significance, and origin story (Sthala Purāṇa).

The natural mental model for "famous temples of India" is **geographic**, not textual. A user does not swipe verse-by-verse through temples; they look at the map, tap one near them or one they've heard of, and read its story. State-by-state grouping is the same idea expressed as a list, for users who prefer a non-spatial interface.

Forcing this into the verse reader would:

- Violate RULEBOOK §3 (*Type safety on verse pages*) — `VersePage` expects `verse.lines[]`.
- Violate RULEBOOK §10.3 (*No AI-generated liturgical text*) — origin stories must come from published authoritative sources.
- Throw away the geographic UX entirely.

## 2. Goal

Add a new top-level category **Theerth (तीर्थ)** that opens to a **map of India with temples pinned by location**, with a secondary **state-grouped list** view via segmented toggle. Tapping a pin or a list row opens a vertical-scroll detail screen with the temple's significance and origin story.

v1 success: a curated set of ~12 famous temples (start with the 12 Jyotirlingas — they're geographically distributed and have well-documented Sthala Purāṇas) shipped end-to-end, reachable from Home → Theerth tile.

## 3. Non-goals

- **Real-time maps.** No "near me" / GPS / location permissions. The map is a static rendering of India with pinned temples — no panning to live road networks, no street view.
- **Photographs of real temples.** design.md §1 mandates faded hand-drawn sketches. Each temple's detail-screen background must be sourced in the same treatment.
- **Booking, darshan timings, live aartis** — out of scope.
- **User-generated content / reviews** — never in scope.
- **Audio narration** — defer to PRD-02 infrastructure when it lands.
- **Comprehensive temple database.** v1 ships ~12 curated temples (Jyotirlingas), not every temple in India. Char Dham, Shakti Peethas, Divya Desam can ship as additional Theerth entries in later phases.
- **Routing between temples / pilgrimage planner** — out of scope.

## 4. New content archetype

### 4.1 Section-level shape (the Theerth "tour")

```ts
type Theerth = {
  id: string;                     // e.g. "dvadasha-jyotirlinga", "char-dham"
  nameHi: string;                 // "द्वादश ज्योतिर्लिङ्ग"
  nameEn: string;                 // "Twelve Jyotirlingas"
  introHi: string;                // 1-2 paragraphs of context (shown above the map)
  introEn: string;
  temples: TheerthTemple[];
  source: { baseText: string; retrievedOn: string };  // per RULEBOOK §10.2
};
```

### 4.2 Per-temple shape

```ts
type TheerthTemple = {
  id: string;                     // e.g. "somnath", "kashi-vishwanath"
  nameHi: string;                 // "सोमनाथ"
  nameEn: string;                 // "Somnath"
  stateHi: string;                // "गुजरात"   ← mandatory for grouping
  stateEn: string;                // "Gujarat"
  cityHi: string;                 // "वेरावल"
  cityEn: string;                 // "Veraval"
  coordinates: { lat: number; lng: number };  // mandatory — pin position
  deity: Deity;                   // existing union — MUST match invocation per §10.4
  deityFormHi?: string;           // optional named form, e.g. "सोमेश्वर"
  deityFormEn?: string;
  significanceHi: string[];       // 1-3 prose paragraphs — why this theerth matters
  significanceEn: string[];
  originStoryHi: string[];        // 2-5 prose paragraphs — Sthala Purāṇa narrative
  originStoryEn: string[];
  background: string;             // image key from mobile/assets/<id>/index.ts
  sources: Array<{ url: string; title: string; retrievedOn: string }>;  // ≥ 2 per §10.1
};
```

**Why no `verses[]`:** the unit is the temple, not a verse line. Prose paragraphs are arrays of strings so the renderer can space them; no per-line meaning pairs exist.

**Why `coordinates` is mandatory:** the map can't pin without them. Approximate lat/lng (4 decimal places, ~10 m precision) is fine — these are pilgrimage sites, not surveyed coordinates.

**Why `stateHi` / `stateEn` is mandatory and not derived from coordinates:** the state-grouped list view groups by state label. Deriving state from lat/lng requires a polygon dataset (heavy bundle, fragile across border disputes). Storing the state label per temple is 16 bytes and unambiguous.

### 4.3 Category

Add a new category to RULEBOOK §1 row 6:

```
category: 'granth' | 'stotram' | 'chalisa' | 'japam' | 'aarti' | 'bhajan' | 'veda' | 'theerth'
```

The Home grid (design.md §18 step 4) currently has 6 tiles. Adding `theerth` makes it 7 — design lead decides whether v1 ships as the 7th tile (4×2 with one empty slot) or as `coming` until a clean 8-tile grid is in reach.

## 5. New screen archetypes (three of them)

### 5.1 `TheerthMapScreen` (primary entry)

Tapping the Theerth category tile on Home pushes this screen.

**Layer stack:**
1. Parchment base colour.
2. **Stylised India map** — a single SVG outline of India with state boundaries as thin saffron strokes, rendered on top of the parchment. NOT a Google Maps / Apple Maps tile layer (see §5.4 for the why). The map is the visual centrepiece, occupying ~60 % of the vertical space.
3. **Temple pins** — small saffron `॥` glyphs (or simple dots) positioned by lat/lng. Tap target ≥ 44×44 with `hitSlop`, even though the visual pin is ~14 px.
4. Above the map: top bar (back button, title `तीर्थ` / `Theerth`, language toggle).
5. Below the map: **segmented toggle** `मानचित्र · Map` / `राज्य · By State` — toggling switches to §5.2. Map view is default.
6. Below the toggle (map view): a brief intro paragraph from `Theerth.introHi/En`, then a "Tap a pin" hint.
7. Below the toggle (state view): the state-grouped list from §5.2.

**Interactions:**
- Tap pin → push `TheerthDetailScreen` for that temple.
- Long-press pin → small label tooltip with temple name (Devanagari/English by toggle). Auto-dismiss on release.
- No pinch-zoom / pan in v1. The map is fixed-aspect, fully visible, not interactive beyond pin taps. Future v2 can add pinch-zoom for dense regions.
- Language toggle flips: title, intro, pin tooltips, state labels in the state-list view, segmented toggle labels.

### 5.2 State-grouped list view (lives inside `TheerthMapScreen`, switched via segmented toggle)

Not a separate screen — the segmented toggle hides the map and reveals a vertically-scrolling list. State headers, temples under each.

**Card layout per temple:**
```
[ thumb (deity glyph, e.g. "ॐ") ]  [ temple-name (lang-swapped) · city ]  [ › ]
```

**State header:**
- `गुजरात · Gujarat` (Hindi + English stacked-bilingual, same treatment as listing screens per RULEBOOK §3 *Top-bar title rule* carve-out)
- Inter 11 600 uppercase tracking `0.22em`, `ink-muted` — same as the existing `LIBRARY` / `CATEGORIES` section labels.

**Ordering:** states alphabetised by Devanagari sort key (the same way the existing listing screens order entries). Within a state, temples sorted by `nameHi` Devanagari sort.

### 5.3 `TheerthDetailScreen` (the destination)

Vertical-scroll screen. Tapping a pin (5.1) or a card (5.2) pushes this.

**Structure (top to bottom):**
1. Top bar — back button (returns to `TheerthMapScreen`, preserving its toggle state and scroll position), title swaps on language: `सोमनाथ` (hi) / `Somnath` (en).
2. Hero background — the per-temple sketch, parchment overlay (design.md §6 treatment).
3. Hero title block: temple name (large Devanagari title type) · city + state subtitle · deity badge.
4. Ornament divider (`॥`).
5. **Significance** section — label `महिमा · Significance` (mirrors `अर्थ · Meaning` token order — flips by language). Body: prose paragraphs in the active language. 14 px paragraph gap.
6. Ornament divider.
7. **Origin Story** section — label `उद्भव कथा · Origin Story`. Same prose treatment.
8. Sources footer — small Cormorant italic line listing `TheerthTemple.sources` URLs as plain text (NOT links in v1; surface in v2 if user wants).
9. Bottom bar — language toggle (visible per RULEBOOK §3).

**No verse pill, no transliteration, no `*VersePage` reuse.** The romanization rules in design.md §3.1 do NOT apply — significance/origin-story `*En` fields are independent English prose, not transliteration of the same source line.

### 5.4 The map technology decision (CONFIRMED)

**Decision: a stylised SVG India map. No external map provider, no API keys, no billing. Static view, no live tiles.** Confirmed by product on 2026-05-28.

| Concern | `react-native-maps` (Google/Apple) | Stylised SVG India outline |
|---|---|---|
| Visual fit with parchment aesthetic | Hard — Google/Apple tiles are glossy and colourful, the opposite of a faded manuscript | Native — vector strokes blend into the parchment treatment |
| Bundle size | Adds native Google Maps SDK on Android (~5 MB) | One SVG file, ~30 KB |
| Platform setup | Google Maps API key, billing, iOS Info.plist key, Android manifest entry | Zero |
| Offline behaviour | Tiles fail offline | Works offline (vector data is bundled) |
| Pinch-zoom / pan | Built in | Would need custom gesture handler |
| "Near me" | Built in | Out of scope per §3 — no real-time location anyway |
| Dependency | `react-native-maps` (already a common dep) | `react-native-svg` (one new dep) |

A handful of competitive devotional apps already use stylised India maps for this exact pattern, and it matches the app's design language. The trade-off is no pinch-zoom — acceptable for v1 when ~12 pins are widely spaced.

**Add `react-native-svg` as a dependency. Do NOT add `react-native-maps`.** Source the India SVG outline from an open-licensed dataset (e.g. simplified GeoJSON from naturalearthdata.com, converted to SVG paths via `mapshaper` once at build time, committed as a static file).

## 6. Required RULEBOOK.md amendments

| RULEBOOK § | Amendment |
|---|---|
| §1 row 6 | Add `'theerth'` to the category union. |
| §1 row 7 | (no change — deities still required, tagged the same way; Jyotirlingas are all `shiva`, Char Dham mixes deities) |
| §1 rows 10–14 | Add: "for `category === 'theerth'`, replace rows 10–14 with the `TheerthTemple` shape in PRD-07 §4.2 (`significanceHi/En`, `originStoryHi/En`, `coordinates`, `stateHi/En`); no `lines[]`." |
| §2 row 4 | Restrict the `*VersePage` requirement to "verse-based archetypes only". For theerth, the renderer is `TheerthDetailScreen` — no per-section component to scaffold. |
| §2 row 5 | Add a theerth-specific reader template: `TheerthMapScreen.tsx` + `TheerthDetailScreen.tsx`. |
| §2 row 6 | (chapters screen) — N/A for theerth; the map screen IS the index. |
| §3 *Type safety on verse pages* | Extend: same no-cast rule on `TheerthDetailScreen.route.params.templeId` and the `TheerthTemple` prop. |
| §3 *Top-bar title rule* | Already applies — detail screen title swaps; the segmented `Map / By State` labels swap; the state-list section headers remain bilingual-stacked (intentional carve-out, same as `LibraryCard` subtitle). |
| §4 step 6 | Add: "for theerth: toggle flips intro, significance, origin-story, state labels, segmented control labels, pin tooltips." |
| §4 step 8 | Add: "for theerth: map view renders; tapping each pin lands on the correct detail; segmented toggle reveals state list; tapping a list row lands on the same detail screen the pin would; back from detail preserves the toggle state." |
| §8 | Add Path C: theerth sections index by `nameHi/En + stateHi/En + cityHi/En + significanceHi/En + originStoryHi/En` per temple. New branch in `buildSearchEntries()`. Result tap routes to `TheerthDetailScreen` via `entryRoutes.ts`. |
| §10.1, §10.2, §10.3 | Already applies — each temple's `originStoryHi/En` cites ≥ 2 authoritative sources; no LLM-generated origin stories. |
| §10.4 | Already applies — `deity` field must match actual presiding deity. |
| §10.8 | Already applies — each temple needs its own background image. |

## 7. Required `design.md` amendments

| design.md § | Amendment |
|---|---|
| §1 | No change — map outline must follow parchment-first philosophy (saffron strokes on cream, no glossy tiles). |
| §2 | Add `map-stroke` colour token if `saffron-deep @ 0.4 opacity` isn't reused; otherwise reuse. |
| §3 | Add type-scale rows for: temple title (detail screen), state-header label, segmented-toggle labels, significance/origin-story labels (mirror `Meaning label`). |
| §3.1 | Add: "does not apply to theerth prose; significance/origin-story `*En` fields are independent English prose, not transliteration." |
| §6 | Amend background rotation: "verse-based sections rotate deterministically across a pool; **theerth detail screens pin one background per temple** — the temple's identity is the image, not interchangeable." |
| §10 | Add a `TheerthTemple` content model block alongside `Chalisa` / `Gita`. |
| §13 | Add a third pattern: "Theerth (map-driven, prose-per-entry)" with build steps and the dependency call-out (add `react-native-svg`, do not add `react-native-maps`). |
| §18 step 4 | Note category grid becomes 7 tiles; layout decision per §10 below. |
| **New §26 — Screen: Theerth Map.** | Full spec: layer stack, map outline rendering, pin treatment, segmented toggle, state-list view, language behaviour. |
| **New §27 — Screen: Theerth Detail.** | Full spec: hero, significance, origin story, sources, back-stack behaviour. |
| **New §28 — Component: India Map.** | The reusable `<IndiaMap>` SVG component (paths, viewport, pin overlay API). |
| **New §29 — Component: Theerth Pin.** | The pin glyph treatment (`॥`, saffron, hit-slop, tooltip). |

## 8. Content sourcing plan (v1: 12 Jyotirlingas)

Per RULEBOOK §10.1 / §10.3, origin-story prose for each Jyotirlinga must come from published authoritative sources — no LLM generation. The v1 set:

| # | Temple | State | Approx. coordinates |
|---|---|---|---|
| 1 | Somnath | Gujarat | 20.8880, 70.4017 |
| 2 | Mallikarjuna | Andhra Pradesh | 16.0744, 78.8687 |
| 3 | Mahakaleshwar | Madhya Pradesh | 23.1828, 75.7682 |
| 4 | Omkareshwar | Madhya Pradesh | 22.2425, 76.1497 |
| 5 | Kedarnath | Uttarakhand | 30.7346, 79.0669 |
| 6 | Bhimashankar | Maharashtra | 19.0721, 73.5360 |
| 7 | Kashi Vishwanath | Uttar Pradesh | 25.3109, 83.0107 |
| 8 | Trimbakeshwar | Maharashtra | 19.9325, 73.5306 |
| 9 | Vaidyanath | Jharkhand | 24.4923, 86.7000 |
| 10 | Nageshwar | Gujarat | 22.3373, 69.0814 |
| 11 | Rameshwaram | Tamil Nadu | 9.2881, 79.3174 |
| 12 | Grishneshwar | Maharashtra | 20.0265, 75.1798 |

8 states. Comfortable density on the map; comfortable state-list length.

**Sources to verify against (≥ 2 per temple per RULEBOOK §10.1):**
- Shiva Purāṇa (Gita Press Gorakhpur edition) — primary for Sthala Purāṇa narratives.
- *Bharat ke Jyotirlinga* (Gita Press) — secondary.
- Respective temple trust websites (somnath.org, shrikedarnathji.com, etc.).
- ASI listings for heritage / architectural notes.

A content sourcing sprint (separate from this PRD) lands all 12 temples' verified prose before the section flips to `active`. Until then it ships as `status: 'coming'`.

## 9. Phased delivery

**Phase 1 — Contract.** Land the RULEBOOK.md + design.md amendments in §6 and §7 as a documentation-only PR. No code, no dependencies. Reviewed and approved by design lead.

**Phase 2 — Infrastructure.** Add `react-native-svg` dependency, ship a working `<IndiaMap>` component with state outlines and a pin-overlay API. No data wired yet — a standalone demo screen confirms the rendering and tap behaviour.

**Phase 3 — Skill + templates.** Extend `/add-section` to recognise `category === 'theerth'` and scaffold from the new template set (`TheerthMapScreen`, `TheerthDetailScreen`, `TheerthTemple` data shape). Skill PR ships the templates with placeholder data.

**Phase 4 — Content + section #1 (Dvādaśa Jyotirlinga).** Source and verify 12 temples per §8. Add the `LibraryEntry` (`status: 'coming'` initially), assets (12 sketches), data file. Flip to `status: 'active'` only after RULEBOOK §10 audit.

**Phase 5 — Additional tours (out of v1).** Char Dham, Shakti Peethas, Divya Desam — each a separate `LibraryEntry` under `theerth`, same data shape, same screens.

## 10. Open questions for the design lead

1. ~~Map technology — confirm SVG over react-native-maps?~~ **Resolved — stylised SVG, no provider, no API cost (see §5.4).**
2. **Tile slot.** Does `theerth` ship as the 7th category tile (grid becomes 4×2 with one empty), or as `coming` until a cleaner grid lands?
3. **One entry or multiple in v1?** Option A: a single LibraryEntry "Dvādaśa Jyotirlinga" with 12 temples. Option B: a single LibraryEntry "Tirth Darshan" combining Jyotirlingas + Char Dham + a few showpiece temples (~20 total) on one map. Recommend A for v1 (smaller content surface to verify) — B as v2 if user feedback wants more.
4. **Default view: map or state list?** Recommend map (it's the headline UX). State list is one toggle-tap away.
5. **Pin glyph.** Saffron `॥` (matches existing ornament vocabulary) or a simple saffron dot? Recommend `॥` — the existing language.
6. **Pinch-zoom on the map.** Recommend deferring to v2. 12 widely-spaced pins fit fine without zoom; gesture-handler integration is a real chunk of work.
7. **Romanization of temple/state names.** `Kashi Vishwanath` vs `Kāśī Viśvanātha`; `Gujarat` vs `Gujarāt`. Recommend the popular English spelling per design.md §3.1's "common Sanskrit terms keep conventional spelling outside verse lines" carve-out.

## 11. What NOT to do until this PRD is signed off

- Do **not** add a `library` entry for any temple set yet.
- Do **not** install any map dependency.
- Do **not** scaffold `TheerthMapScreen` / `TheerthDetailScreen`.
- Do **not** generate origin-story prose with an LLM — RULEBOOK §10.3 is a hard gate.
- Do **not** reuse another deity's background image (RULEBOOK §10.8).
- Do **not** ship a "verse"-shaped placeholder version of theerth to flip the tile sooner — RULEBOOK §3 (*Type safety on verse pages*) will reject it.

---

**Next step:** review §5.4 (map tech choice), §6 / §7 amendments, and §10 open questions. If approved, the follow-up is a docs-only PR amending RULEBOOK.md + design.md (Phase 1). Phase 2 (`react-native-svg` + `<IndiaMap>` component) only starts after Phase 1 ships.

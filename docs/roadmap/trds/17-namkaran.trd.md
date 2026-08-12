# TRD-17 — Namkaran (नामकरण) — Technical Design

| | |
|---|---|
| **Companion PRD** | [PRD-17](../prds/17-namkaran.md) |
| **Convention** | [`namkaran-namakshar-v1.md`](../conventions/namkaran-namakshar-v1.md) |
| **Status** | Draft — design for the Phase-1 build |
| **Feasibility** | ✅ One existing pure primitive (`getSiderealPlanetLongitude`) supplies the whole calculation; the naming-day muhurat is already shipped (`EVENT_RULES.namkaran`). The engineering risk is **not** the math — it is corpus size, corpus correctness, and newborn-data privacy. |

> **Non-negotiables (from PRD-17 §7/§10):** no numerology/score/ranking; no claim about the child;
> no remote or AI name source; warm palette + existing tokens only; no emoji; no new native
> dependency; no private panchang cache. This TRD introduces nothing outside those choices.

## 0. Scope

Derive the nāmākṣara from a birth instant (or an explicit nakshatra/pada), render it answer-first
with a filtered list of attested names, persist a shortlist, cross-check by rashi, and hand off to
the shipped muhurat finder. Phase 1 only — no reminders, no vidhi module, no Home tile.

## 1. Ground truth (verified in source)

| Fact | Source | Consequence |
|---|---|---|
| `getSiderealPlanetLongitude(graha, date)` returns a Lahiri sidereal longitude and is pure | `src/panchang/kundali.ts:306` | The entire calculation is one call; no new astronomy. |
| `computeGrahaPositions` already derives `nakshatraIndex` via `Math.floor(lon / NAKSHATRA_SPAN) % 27` and `pada` via `Math.min(4, floor((lon % NAKSHATRA_SPAN)/PADA_SPAN)+1)` | `kundali.ts:437-444` | Reuse this *exact* flooring convention; a second, subtly different derivation is the likeliest silent bug in this feature. |
| `NAKSHATRA_SPAN = 360/27`, `PADA_SPAN = NAKSHATRA_SPAN/4` are module-private | `kundali.ts:249-250` | Export them (or a shared `charanaOf(lon)`) rather than re-declaring the constants in a second file. |
| `NAKSHATRA_NAMES_HI/EN` (27 each), `RASHI_NAMES_HI/EN/WESTERN`, `DASHA_ORDER` (9) are exported | `panchang/names.ts`, `kundali.ts:154-227` | Every label and the lord column come from shipped data. |
| `EVENT_RULES` already contains `id: 'namkaran'` with nakshatras/tithis/varas + a 6-dosha stack, `source.verified: false` | `panchang/eventMuhurat.ts` | The muhurat door is **navigation only** — zero engine work. |
| The muhurat finder scans through `panchangDayStore` (LRU 5 scopes, persisted via `panchangDayCache`) | design.md §60, wiki `panchang` | Do not add a cache; navigate into the shipped surface. |
| Guna Milan established a controlled `BirthDetailsForm` + an opt-in versioned persistence model with an invalidating mutation queue | PRD-16 §3.2/§3.4, `GunaMilanScreen` | Input and persistence are extensions of a shipped pattern, not new work. |
| Share = off-screen card + `captureRef` → `expo-sharing`, 4:5 / 1080×1350 | `JyotishShareCard/Sheet`, `utils/shareVerse.tsx` | Reused verbatim. |
| Panchang stack is lazy (`React.lazy` + `Suspense`) | `TabNavigator.tsx` | A corpus required from inside it cannot delay Home's first frame — **provided** nothing in `data/texts.ts` imports it. |
| Jest cannot run `src/data` / engine suites; those run under `tsx --test` with `TZ=Asia/Kolkata` | `mobile/jest.config.js`, wiki `overview` | Test placement is dictated, not chosen (§10). |

## 2. Architecture

```
 birth date + time (IST)  ──or──  explicit { nakshatraIndex, pada }
            │
            ▼  (hook: IST→UTC, validation, state)
  getSiderealPlanetLongitude('moon', instant)          ← existing, pure
            │
            ▼
  namkaran.ts   (PURE: longitude|interval → NamkaranResult)
     ├── charanaOf(lon)            → 0..107
     ├── syllablesForCharana(c)    → from namkaranConvention.ts
     ├── rashiSyllables(rashi)     → derived, 9 charanas (convention §4)
     └── charanaSetForDay(dayIST)  → candidate charanas, ordered by IST window
            │
            ▼
  data/namkaran/index.ts   (LAZY require: charana → name ids → name records)
            │
            ├── NamkaranScreen        (input / browse)
            └── NamkaranResultScreen  (syllable hero → names → rashi card → doors)
                     ├── NameDetailSheet ──▶ Deity Index / reader dispatcher (existing)
                     ├── ShareButton ──▶ NamkaranShareCard ──▶ captureRef → expo-sharing (existing)
                     └── muhurat door ──▶ MuhuratResults { occasionId: 'namkaran' } (existing)
```

`namkaran.ts` holds no React, no storage, no `Date.now()` — the `kundali.ts` boundary, pinned by the
same source-purity test pattern.

## 3. Data model

```ts
// src/panchang/namkaranConvention.ts
export const NAMAKSHAR_CONVENTION_VERSION = 1;

export type Syllable = {
  hi: string;      // 'चू'
  latin: string;   // 'Chu' — pronunciation aid, not IAST (design.md §3.1)
};

export type CharanaEntry = {
  charanaIndex: number;        // 0..107
  nakshatraIndex: number;      // 0..26  (= charanaIndex >> 2)
  pada: 1 | 2 | 3 | 4;
  /** First = primary, rest = अन्य विकल्प. Never empty. */
  syllables: readonly Syllable[];
  /** True where the traditional syllable begins essentially no modern name (PRD §5.3). */
  thin: boolean;
};

export type NakshatraAttrs = {
  nakshatraIndex: number;
  lord: DashaLord;             // MUST equal DASHA_ORDER[nakshatraIndex % 9] — test-asserted
  gana: 'dev' | 'manushya' | 'rakshasa';
  deityHi: string;
  deityEn: string;
};

export const CHARANA_TABLE: readonly CharanaEntry[];      // exactly 108
export const NAKSHATRA_ATTRS: readonly NakshatraAttrs[];  // exactly 27
export const NAMAKSHAR_SOURCE: {
  convention: 'namakshar-v1';
  verified: false;              // literal false until the §11.1 gate closes
  referenceUrls: readonly string[];
  notes: string;
};
```

```ts
// src/panchang/namkaran.ts
export type NamkaranBasis =
  | { kind: 'instant'; at: Date }                                  // exact birth moment (UTC)
  | { kind: 'dayIST'; civilDate: string }                          // 'YYYY-MM-DD', time unknown
  | { kind: 'manual'; nakshatraIndex: number; pada: 1|2|3|4 };      // path B

export type CharanaCandidate = {
  entry: CharanaEntry;
  rashiIndex: number;
  /** Present only for kind: 'dayIST' — the IST window this charana held. */
  window?: { startMs: number; endMs: number };
};

export type NamkaranResult =
  | { kind: 'exact'; candidate: CharanaCandidate; conventionVersion: number }
  | { kind: 'range'; candidates: readonly CharanaCandidate[]; conventionVersion: number };
//   'range' ⇒ no hero syllable, no exact share (PRD §4.2, §8.3.5)

export type NameRecord = {
  id: string;                  // stable, persisted in the shortlist — never a display string
  hi: string;                  // 'केशव'
  latin: string;               // 'Keshav'
  gender: 'boy' | 'girl' | 'any';
  charanas: readonly number[]; // usually 1; >1 when the initial spans alternates
  meaningHi: string;
  meaningEn: string;
  root?: string;
  deityId?: Deity;             // links into deities.ts / Deity Index §42
  syllableCount: 2 | 3 | 4;    // 4 = "4+", the list's short-name filter
};
```

`NameRecord.id` is a **persisted key** (it lands in the shortlist), so the `City.id` rule from the
Panchang gotchas applies verbatim: adding ids is free, renaming one silently drops a parent's
shortlist entry.

## 4. Core algorithm (pure)

```ts
const CHARANA_SPAN = 360 / 108;   // 3°20′

export function charanaOf(siderealLongitude: number): number {
  const lon = ((siderealLongitude % 360) + 360) % 360;      // normalize first, always
  return Math.min(107, Math.floor(lon / CHARANA_SPAN));
}
```

- `nakshatraIndex = charanaIndex >> 2`, `pada = (charanaIndex & 3) + 1`, `rashiIndex = floor(lon/30)`.
  These **must** agree with `computeGrahaPositions` for the same longitude; a cross-check test
  asserts that rather than trusting two derivations.
- `Math.min(107, …)` mirrors the existing `Math.min(4, …)` pada clamp — it guards the exact-360°
  boundary after normalization, not general sloppiness.

### 4.1 Unknown time → charana set (no noon, ever)

```ts
export function charanaSetForDay(civilDateIST: string,
                                moonLongitudeAt: (d: Date) => number): CharanaCandidate[]
```

- Walk the IST civil day `[00:00:00, 23:59:59]`. The Moon advances ≈ 12–15°/day and is **monotonic
  in longitude** modulo one 360° wrap, so the boundary crossings are found by **bisection**, not by
  sampling: for each charana boundary strictly between `lon(start)` and `lon(end)`, bisect to the
  crossing instant (the same technique `engine.ts` already uses to bisect anga end times).
- Emit one candidate per charana held, each with its `{ startMs, endMs }` IST window, in time order.
  Expect 4–5 candidates; never fewer than 1.
- Handle the 360°→0° wrap explicitly: if `lon(end) < lon(start)`, the day crosses Revati→Ashwini and
  the candidate list wraps through charana 107 → 0.
- **No midpoint, no "most likely", no persisted fabricated time** (PRD §4.2).

### 4.2 Rashi syllables — derived, not tabulated

```ts
export function rashiSyllables(rashiIndex: number): readonly Syllable[] {
  // A rashi spans exactly 30° = 9 charanas (convention §4).
  return range(rashiIndex * 9, rashiIndex * 9 + 9)
    .flatMap(c => CHARANA_TABLE[c].syllables);
}
```

A hard-coded 12-row rashi-letter table is a defect. A test asserts the derivation yields exactly 9
charanas per rashi and that the 12 sets partition all 108.

## 5. Name corpus — storage and lookup

**Shape on disk** (`mobile/src/data/namkaran/`):

```
index.ts                 // lazy loader + charana→ids index accessor (no name data at module scope)
charanaIndex.json        // { "0": ["kesh-1","chan-4", …], … }  108 keys → name ids
names.01.json … names.NN.json   // sharded records, ~200 names per shard
types.ts
```

- `index.ts` exposes `loadNamesForCharana(c): Promise<NameRecord[]>`; it `require`s only the shard(s)
  a charana needs. **Nothing here may be imported by `data/texts.ts`, `searchIndex.ts`, or any Home
  module** — that import is what would drag the corpus into the startup bundle graph. Add an ESLint
  `no-restricted-imports` rule for this, in the spirit of the three lint-enforced token rules
  (wiki `overview` gotchas): the failure mode is a silent startup regression, exactly the class the
  repo already chose to lint rather than review for.
- `charanaIndex.json` is **generated** from the shards by `scripts/gen-namkaran-index.mjs` (manual,
  like every other script in `scripts/`), so the index can never disagree with the records. The
  generator also emits the coverage report (names per charana × gender) that gate §11.2 reads.
- Shard boundaries follow charana groups so a result loads one or two shards, not all of them.

**Byte budget.** CI asserts the raw JSON total ≤ **512 KB** (PRD §8.4). If exceeded: shard finer or
trim the corpus — never raise the budget in the same commit that breaches it.

## 6. React integration

```ts
// src/panchang/useNamkaran.ts
type NamkaranState =
  | { status: 'input' }
  | { status: 'computing' }
  | { status: 'result'; result: NamkaranResult; names: NameRecord[] }
  | { status: 'error'; reason: 'invalid-input' | 'storage' | 'compute' };
```

- IST→UTC conversion and strict input parsing follow `useKundali`'s model (fixed IST semantics, never
  the device timezone).
- The Moon-longitude call and the shard require both run inside
  `InteractionManager.runAfterInteractions` + one `setTimeout(0)` yield — the discipline `useMuhurat`
  and `useObservancesForDate` already enforce so a push animation never janks.
- **Persistence is opt-in and versioned**, reusing Guna Milan's invalidating mutation queue so
  switching the toggle off removes a write already in flight. Keys:

| Key | Contents | Lifetime |
|---|---|---|
| `@vedansh:namkaran-session:v1` | `{ conventionVersion, basis }` — only when the toggle is on | Cleared by the visible clear action or the toggle |
| `@vedansh:namkaran-shortlist:v1` | `{ conventionVersion, ids: string[] }` — **name ids only** | Independent of the session key (PRD §8.3.2) |

- `useNamkaranShortlist` is a small hook over the second key. It stores **no** birth data and **no**
  charana-plus-date pair. On a `conventionVersion` mismatch it keeps the ids and re-derives their
  syllables rather than discarding a parent's shortlist.
- **No Kundali autofill.** `useNamkaran` must not read `@vedansh:kundali-birth-profile:v1`. Leave the
  code comment explaining why (PRD §4.4) so a later "consistency" refactor doesn't add it.

## 7. Surfaces

### 7.1 `NamkaranScreen` — input / browse
`ReaderHeader variant="index"`, title `नामकरण · Namkaran`. Body: the `BirthDetailsForm` primitive
(date + time only; **no city, no name**), the समय ज्ञात नहीं affordance with its explanatory note,
the opt-in remember row, the primary action, then the two path-B doors (`ListCard`: नक्षत्र से चुनें,
सभी नामाक्षर). Primary action stays reachable above the keyboard or in a keyboard-safe sticky footer
(§58 precedent).

### 7.2 `NamkaranResultScreen`
Answer → context → list → cross-check → doors:

1. **Syllable hero** — `cardActiveFrom→cardActiveTo` gradient + gold `॥`, `elevation.lifted`,
   `radii.lg`. The glyph gets an explicit fixed line box (not an inherited text style) so the
   largest dynamic-type step cannot clip it; a11y label = Devanagari name + Latin aid.
   For `kind: 'range'`, this becomes **N stacked candidate groups**, each labelled with its IST
   window — no hero treatment on any one of them, and the ShareButton is absent from the header.
2. **कैसे निकला?** disclosure — longitude → charana → syllable + convention name and DRAFT state.
3. **Nakshatra context** row — deity / lord / gana with the neutral gloss (convention §3).
4. **Name list** — `ListCard` rows, gender segment + syllable-count chips, 44 pt shortlist toggle,
   thin-charana fallback notice as a `goldTint` row. `FlatList`, always — a `ScrollView` + `.map()`
   over a few hundred rows is the mistake the Kundali city sheet already made (wiki gotcha).
5. **राशि अनुसार अक्षर** card — `rashiSyllables()`, with the "some families name by rashi" line.
6. **Doors** — `ListCard` rows to `MuhuratResults { occasionId: 'namkaran' }` and (Phase 2) the vidhi
   reader.

### 7.3 `NameDetailSheet`
A bottom sheet, not a route. Name, pronunciation, meaning hi/en, root, charana provenance, shortlist
toggle, copy action, and a deity row that routes through the existing reader dispatcher when
`deityId` is set. Expanded/collapsed semantics exposed; standard layout animation; reduced motion
respected.

### 7.4 `NamkaranShareCard`
4:5 / 1080×1350, off-screen, `collapsable={false}`, captured with the shipped
`captureRef` → `expo-sharing` path. Allow-list model **only**:

```ts
type NamkaranShareModel = {
  syllables: Syllable[];          // syllable(s) — always safe
  nakshatraHi: string; pada: number; rashiHi: string;
  shortlistNames?: { hi: string; latin: string }[];   // requires per-share opt-in + visible warning
  conventionNote: string;         // convention name + guidance disclaimer
  brand: 'ॐ वेदांश़';
};
```

Never serialize `NamkaranBasis`, never a birth date/time, never a city. Absent entirely for
`kind: 'range'`. Card height is pinned like every 4:5 card — the shortlist block is the variable-height
element, so it gets a **capped row count with an overflow line** (`+3 और`) rather than growing the
column; raise the chrome budget constant if anything is added, per the §51 share-card-fit lesson.

## 8. Edge cases

| Case | Handling |
|---|---|
| Birth time unknown | Charana **set** with IST windows; no hero, no exact share (§4.1) |
| Moon crosses 360°→0° during the day | Candidate list wraps 107 → 0; explicitly tested |
| Longitude exactly on a charana boundary | Belongs to the **higher** charana (half-open `[start,end)`), matching `kundali.ts` |
| Thin charana (ङ / ञ / ष / ण / ठ / थ) | Fall back to the nakshatra-level syllable set + a visible notice; never invent a name |
| Empty name result on a non-thin charana | **Treated as a bug, not a state** — gate §11.2 makes it unreachable; the screen still renders an honest empty card rather than a blank list |
| Corpus shard fails to load | `status: 'error'` with retry; the syllable hero still renders (the calculation does not depend on the corpus) |
| Storage write fails | Surface it — a failed save must never look like success (§51 rule) |
| Convention version bump | Shortlist ids kept, syllables re-derived; session record re-derived or dropped with a notice |
| Future / far-past birth date | Path A range is last 24 months → today-IST; anything else goes through path B |
| Device timezone ≠ IST | Fixed IST civil semantics; a test pins a non-IST device producing the identical result |

## 9. Performance

One `getSiderealPlanetLongitude` call for the exact case; ~4–5 bisections (a few dozen calls) for the
unknown-time case — cheaper than a single `computePanchangForDate`. No panchang solve is needed at
all on this screen; the muhurat door pays that cost inside the shipped finder, reusing
`panchangDayStore`. The only real cost is the corpus shard require, which is deferred behind
`InteractionManager` and bounded by §5's budget.

## 10. Testing

| Layer | Test | Runner |
|---|---|---|
| `charanaOf`, pada/nakshatra/rashi derivation, 108 boundaries | below/at/above every multiple of 3°20′; independently sourced goldens | `tsx` → `test:engine` |
| Cross-check vs `computeGrahaPositions` | same longitude ⇒ same nakshatraIndex/pada | `tsx` |
| `charanaSetForDay` | stable-charana day; multi-crossing day; 360° wrap; IST day edges; window ordering; no noon | `tsx` |
| `rashiSyllables` | 9 charanas per rashi; the 12 sets partition 108 | `tsx` |
| Convention integrity | 108 entries; 27 attrs; `lord === DASHA_ORDER[n % 9]`; non-empty syllables; `verified === false` | `tsx` |
| Corpus integrity | Devanagari initial matches its charana cell; coverage ≥ 6+6 or `thin` fallback; unique ids; meanings present hi+en; `deityId` resolves in `deities.ts`; byte budget | `tsx` → `test:data` (**not** Jest — `src/data` is excluded by `jest.config.js`) |
| Source purity | `namkaran.ts` imports no React / AsyncStorage / clock | `tsx` |
| `useNamkaran` | IST→UTC; opt-in persistence + in-flight cancel; no Kundali-profile read; error states; non-IST device parity | Jest (mock storage) |
| Shortlist hook | independence from the session key; version-mismatch re-derivation | Jest |
| Screens | hero renders; range renders N groups with no share action; gender/count filters; thin fallback notice; sheet a11y; `FlatList` used | Jest |
| Share | allow-list model contains no birth field; card fit at 312 dp and 334 dp; opt-in warning shown when names included | Jest (mock `view-shot`) |
| Journey | `.maestro/namkaran-smoke.yaml`: clear state → Jyotish → Namkaran → date+time → hero → filter → shortlist → name detail → deity link → rashi card → muhurat door → guest browse path | Maestro, **iOS and Android reported separately** (RULEBOOK §8) |

Jest suites rendering the name `FlatList` **must unmount their trees** (`afterEach` + `act`) — the
VirtualizedList late-timer trap that makes a fully-green run exit 1 (wiki `overview` gotcha).

## 11. Module inventory

**New**
- `src/panchang/namkaranConvention.ts`
- `src/panchang/namkaran.ts` (+ `__tests__/namkaran.engine.test.ts`, `namkaran.boundaries.test.ts`, `namkaran.purity.test.ts`)
- `src/panchang/useNamkaran.ts`, `src/panchang/useNamkaranShortlist.ts`
- `src/data/namkaran/{index.ts,types.ts,charanaIndex.json,names.NN.json}` (+ `__tests__/namkaranCorpus.test.ts`)
- `src/screens/NamkaranScreen.tsx`, `src/screens/NamkaranResultScreen.tsx`
- `src/components/NamaksharCard.tsx`, `NameDetailSheet.tsx`, `NamkaranShareCard.tsx`
- `scripts/gen-namkaran-index.mjs`
- `.maestro/namkaran-smoke.yaml`

**Edited**
- `src/screens/PanchangScreen.tsx` — the नामकरण card in both Jyotish landing states
- `src/navigation/types.ts` + `PanchangStackNavigator.tsx` — two routes in `PanchangStackParamList`
- `src/panchang/kundali.ts` — export `NAKSHATRA_SPAN` / `PADA_SPAN` (or a shared `charanaOf`) instead of re-declaring them
- `mobile/eslint.config.js` — `no-restricted-imports` barring `data/namkaran` from startup modules
- `package.json` — corpus + engine suites into `test:data` / `test:engine`
- `design.md` (**new §61**), `RULEBOOK.md` (**new §18**), `docs/roadmap/README.md`

**Reused unchanged:** `BirthDetailsForm`, `CalendarDatePicker`, `ClockTimePicker`, `TextField`,
`ListCard`, `ReaderHeader`, `ShareButton`, `JyotishStateCard`, `deities.ts`, the reader dispatcher,
`eventMuhurat.ts`, `MuhuratResultsScreen`, `panchangDayStore`, `utils/shareVerse.tsx`.

## 12. Design compliance

Tokens from `colors.ts` only (no hard-coded hex, no new token expected); Noto Serif Devanagari /
Cormorant Garamond / Inter only; no emoji; `radii.lg` + theme elevation; 44 pt controls and 48 pt
field-buttons; shortlist/filter/fallback states carry a word plus a tint, never colour alone; 10 pt
micro-chrome that can carry Indic uses a script-capable face at ≥ 1.4× leading (§3.0). The syllable
hero's fixed line box and the share card's capped shortlist block are the two places this feature
could repeat a known clipping bug — both are pinned by tests (§10).

## 13. Rollout

Phase 1 is pure JS + bundled JSON → **OTA-capable**, subject to the usual runtime/channel check
(publish at the live store runtime, not `app.json`'s version). No feature flag: the surface is
gated by the two content gates instead, and it ships whole or not at all. `PANCHANG_DAY_CACHE_VERSION`
needs **no** bump — this feature adds no panchang-engine behaviour. Phase 2's vidhi module follows
RULEBOOK §1–§4 and lands with its own NEW badge; if it carries audio it becomes a store release and
drags `APP_TOUR_VERSION` + a `whatsNew` entry with it.

## 14. Open technical questions

1. **Where does `charanaOf` live** — exported from `kundali.ts` (single source of the flooring
   convention, but grows that module) or in `namkaran.ts` importing the two spans? Recommendation:
   spans exported from `kundali.ts`, `charanaOf` in `namkaran.ts`, with the cross-check test as the
   guard against drift.
2. **Bisection tolerance for `charanaSetForDay`** — the window labels are displayed to the minute, so
   ±30 s is sufficient; confirm against `engine.ts`'s existing anga bisection tolerance rather than
   picking a new number.
3. **Shard granularity** — one shard per nakshatra (27 files, ~50 names each) vs ~8 shards by charana
   group. Recommendation: nakshatra shards; a result then needs exactly one file.
4. **Alternates in the corpus index** — should a name whose initial matches an *alternate* syllable
   (Shravana's ख series) be indexed under that charana, or only under the primary? Blocked on
   PRD-17 §13.1.
5. **Copy action vs share** — is a plain text-copy of a name enough for Phase 1, deferring the share
   card to Phase 2? It would remove the largest privacy surface from the first release.

# PRD-24 · Phase 2 — गृह वास्तु · from a compass to the whole-home vastu companion

| | |
|---|---|
| **Status** | Plan — drafted 2026-09-04, not yet built |
| **Parent** | [PRD-24 वास्तु दिशा](./24-vastu-disha.md) §4 Phase 2 (this document IS that phase line) |
| **Design** | `design.md` §66 (to be extended as §66.1–§66.5 in the build PRs) |
| **Contract** | `RULEBOOK.md` §22 (rules 11–15 added in the build PRs) |
| **T-shirt size** | Part A: M · Part B: L (content-gated, parallelisable) · Part C: L · Part D: S |
| **Release** | **OTA-eligible at the 1.4.8 runtime.** Every native module this phase touches — `expo-sensors`, `expo-location`, `expo-haptics`, `react-native-svg` — is already in the shipped binary. Nothing here needs a store release. |

> **Why a Phase 2.** Phase 1 shipped (1.4.8) a live 8-dik compass with an honest accuracy
> state, seven room conventions and the home-mandir upkeep set. That is a *reference card*
> held up against a compass. "Fully vastu compliant for the home" means three more things,
> and this phase delivers exactly those: **(A)** a compass trustworthy enough to place a room
> in its 45° sector and a door in its 11.25° pada anywhere indoors; **(B)** the *complete*
> classical household set — every room, utility and element the Vastu Purusha Mandala
> speaks to, the nine zones with their dikpalas and elements, and the 32 door padas; and
> **(C)** a saved map of *the user's own home* so the guidance is read against their rooms,
> not against a generic list. Part D is the griha-pravesh tie-in Phase 1 deferred.

---

## 0. What "compliant" means here — and what it never means

The word "compliant" is the user's; the app's register is PRD-24 §2's and does not move.
In this document *compliant* means **complete coverage of the classical convention, read
against the user's own home, with the traditional accommodation stated wherever the two
differ.** It never means a verdict, a score, a percentage, a dosha, a colour-coded warning
or a remedy. Concretely (RULEBOOK §22.5 extended, pinned by test in §7):

- A room that sits where tradition places it is **मेल · in keeping**.
- A room that sits in the direction the texts name as the *second place* is **परंपरागत
  विकल्प · the traditional alternate** — stated as such, not as second-best.
- A room that sits elsewhere is **परंपरा में अन्यत्र · tradition places this elsewhere**,
  followed immediately by the entry's `accommodation*` text. Nothing else. No count of
  such rooms, no ordering by them, no summary line.

Those three phrases are the *entire* comparison vocabulary of the feature. RULEBOOK §22.4
(no universal rule by aggregation) and §22.5 (no fear/remedy/pseudo-science) apply to every
new row verbatim.

## 1. Where Phase 1 stops (from the shipped code, not the PRD)

| Area | Shipped (1.4.8) | Gap this phase closes |
|---|---|---|
| Heading source | Raw magnetometer via `expo-sensors`, `atan2(-x, y)`, flat-portrait only (`vastu/compass.ts`) | No tilt awareness; a phone held at 30° reads wrong with `status: 'ok'`. No use of the OS-fused, tilt-compensated heading `expo-location` already exposes. |
| True north | Per-city WMM table keyed by the **selected panchang city** (`data/vastu/declination.ts`, 394 ids) | A user whose GPS fix snapped to the nearest bundled city gets that city's declination; a user who never picked a city gets Ujjain's. No coordinate-based value. |
| Reading stability | Wrap-aware EMA, α = 0.25, 5-sample unreliable debounce | No way to *hold* a reading while walking to a wall; no haptic at a sector change; no VoiceOver announcement of the faced dik changing. |
| Precision | 45° sectors only (the classical unit — correct) | Door placement classically uses 32 padas (11.25°); the shipped `main-door` row can only say "padas exist" in prose. |
| Registry | 7 `VastuRoomEntry` rows (puja, kitchen, main door, sleeping, tulsi, toilet, brahmasthan); 4 `MandirGuidanceEntry` rows (1 draft) | Bedrooms by member, living, dining, study, staircase, water (overhead/underground), septic, store, safe, balcony, windows, heavy furniture, parking, garden, wash area, dikpala/element zones, door padas — none exist. |
| Data shape | `directions` (primary) + prose `accommodation*` | Alternate and avoided directions live only in prose, so nothing can be *compared*; no zone, no category, no "facing while using" field. |
| Personalisation | None — the screen is stateless | The user cannot record their home; every visit starts from "which way am I facing right now". |
| Ask (PRD-41) | `vastu.direction` answers from the 7 rooms; lexicon derives room forms from the registry | Nothing answers "मेरी रसोई किस दिशा में है" because there is no saved home. |
| Doors | More hub row; griha-pravesh muhurat result | The griha-pravesh door lands on the generic screen; no checklist tie-in. |

Everything in the *Shipped* column stays. Phase 2 is additive; no Phase 1 behaviour, testID
or copy string is removed.

## 2. Product principles (Phase 1's three, plus two)

1. **Classical convention with its reason — never a verdict on someone's home.** (PRD-24 §2.1, unchanged.)
2. **The honest degraded state is part of the feature.** (§2.2, unchanged — and now extends to *tilt* and to the OS heading's own accuracy signal.)
3. **One direction vocabulary.** (§2.3, unchanged — `DishaDirection` / `DISHA_ORDER` / `DISHA_LABELS` from `eventMuhurat.ts`; the pada ring is a *subdivision of a dik*, not a new vocabulary.)
4. **Your home is yours.** The home record is one private, versioned AsyncStorage payload on this device; it is never inferred (no GPS-derived facing, no camera, no floor plan capture), never shared except through the explicit export door, and never surfaced on any public panel (Home, Today strip, widgets). The PRD-29 कुल परम्परा stance, applied to a house.
5. **Comparison without judgement.** The three relation phrases of §0 are the whole vocabulary. No score, no percentage, no ranking, no red, no "N rooms need attention". Registry order is display order, always.

---

# PART A — Compass trust (the sensor half)

## A1. Fused heading as the primary source

`expo-location` (already a config plugin in `app.json`, already used by `PanchangLocationContext`)
exposes `Location.watchHeadingAsync`, whose `HeadingObject` carries `magHeading`, `trueHeading`
and a platform `accuracy` level. It is the OS's own sensor-fusion output — tilt-compensated,
hard/soft-iron calibrated, and on iOS the same figure the Compass app shows.

- `useCompassHeading` gains a **source ladder**: `fused` (watchHeadingAsync) → `magnetometer`
  (the shipped path) → `unavailable`. The ladder is chosen once per mount; the hook's return
  type gains `source: 'fused' | 'magnetometer' | null` so the status line can be honest about
  which it is using, and tests can pin the fallback.
- `trueHeading` is used **only when ≥ 0** (iOS reports −1 when location services are off or the
  permission is missing). Otherwise `magHeading` + the bundled declination (A3) — the shipped
  behaviour, unchanged.
- **No new permission prompt.** If location permission is already granted (the panchang
  "use my location" flow), true heading comes free. If not, the feature runs on `magHeading`
  and never asks — a compass asking for location on open is the wrong moment; the copy under
  the dial states plainly: `सटीक उत्तर के लिए पंचांग स्थान चालू करें` when `source === 'fused'`
  and `trueHeading < 0`.
- Platform `accuracy` maps onto the existing vocabulary: iOS `accuracy ≤ 1` / Android
  `accuracy ≤ 1` → `unreliable`; else `ok`. The 25–65 µT band check stays on the magnetometer
  path only (the fused path has no raw field vector).
- Smoothing: the fused heading is already filtered by the OS; `smoothHeading` is applied with
  α = 0.5 (pinned) to soften Android's coarser update cadence without adding lag.

Pure math stays in `vastu/compass.ts`; the ladder and subscription lifecycle stay in the hook.
`compass.test.ts` gains the accuracy-level mapping pins; a new `useCompassHeading.test.tsx`
(Jest, mocking both modules) pins the ladder order, the −1 true-heading fallback, and that an
`unavailable` fused source falls through to the magnetometer rather than to `unavailable`.

## A2. Tilt honesty (magnetometer path)

The shipped math assumes a flat phone and folds tilt error into "unreliable" without detecting
it. On the magnetometer path, subscribe to `Accelerometer` (same `expo-sensors` module — no new
dependency) and compute pitch/roll in a pure `tiltFromAccel(sample)` helper:

- |pitch| or |roll| > **20°** for ≥ 5 samples → new status **`tilted`** (the fifth vocabulary
  word). The dial keeps moving; the status line reads `फ़ोन समतल रखें — झुका हुआ फ़ोन दिशा
  बदल देता है।` in `saffron-deep`. Below 20° the status returns to whatever the field check
  says.
- `tilted` outranks `unreliable` (the user can fix tilt in a second; a bad field needs a walk).
- On the fused path `tilted` is never emitted — the OS output is already tilt-compensated.

Pins: the threshold and hysteresis in `compass.test.ts`; the precedence in the hook test.

## A3. Declination by coordinates (grid), city table retained

Replace "selected city only" with a two-tier lookup in `data/vastu/declination.ts`:

1. **Coordinates known** (the panchang location's `latitude`/`longitude` — every `City` carries
   them, and a GPS-snapped location is a `City`) → bilinear interpolation over a bundled
   **1° × 1° WMM-2025 grid** covering 6–38 °N, 66–100 °E (33 × 35 = 1,155 values, ~9 KB as a
   typed array literal). Regenerated per WMM epoch by extending
   `mobile/scripts/generate-declination.md`.
2. **Unknown** → `null` → magnetic, silently (RULEBOOK §22.7 unchanged).

The per-city table stays as the regression oracle: a new test asserts every bundled city's
table value and its grid interpolation agree within 0.2°. This closes the "GPS snapped me to a
city 60 km away" case without changing any UI.

## A4. Hold, haptics, and the announced dik

- **दिशा रोकें · Hold** — a pill beside the status line freezes `heading` (the subscription is
  removed, exactly the manual-chip mechanics; the frozen dik is what `facingDik` reports). Tap
  again to resume. This is the "walk to the wall, then read" affordance every real compass
  session needs and the chip row cannot give (a chip *chooses*, it does not *capture*).
- **Haptic tick** on a `facingDik` change (`expo-haptics` `selectionAsync`, already in the
  binary), debounced to one per 400 ms. Off when the phone is in manual or hold mode.
- **Accessibility**: `AccessibilityInfo.announceForAccessibility` of the new dik label on
  change (rate-limited to once per 1.5 s) — the chakra's one `accessibilityLabel` already
  narrates the current state; this adds the *change*.
- `DishaChakra` grows to `min(screenWidth − 2·gutter, 300)` pt instead of the fixed 264.

## A5. The pada ring (door flow only)

A **32-pada ring** (11.25° each, 8 per side, drawn as a thin outer band with the pada names
from the door-pada registry, B3) renders **only inside the door-placement step of Part C**.
The default chakra keeps its eight labels — the classical unit for a room stays the 45° sector
and the UI never claims per-degree precision (RULEBOOK §22.7). `padaForHeading(heading, facing)`
lives in `compass.ts` with boundary pins like `dikForHeading`'s.

---

# PART B — The complete household registry (content-gated)

Every row follows RULEBOOK §22.3 exactly: two concordant independent published domains, a
dated claim-level `verificationNote`, a `variantNote` where traditions split. **Rows ship
`draft` and are invisible until verified** — the §20/§21/§22 pattern. The code lands first;
verification is data work that can proceed in parallel and in any order.

## B1. Type extensions (`data/vastu/types.ts`) — backward compatible

```ts
export type VastuZone =
  | 'east' | 'southeast' | 'south' | 'southwest' | 'west' | 'northwest' | 'north' | 'northeast'
  | 'center';                       // = DishaDirection | 'center' — the 9 mandala zones

export type VastuRoomCategory = 'worship' | 'living' | 'utility' | 'structure' | 'element' | 'activity';

export type VastuRoomEntry = {
  …existing fields…
  /** Classification for grouping on the screen and for Ask slot filling. Defaults to 'living'. */
  category?: VastuRoomCategory;
  /** The texts' stated SECOND place(s), when one exists. Typed so it can be compared, not just read. */
  alternateDirections?: readonly DishaDirection[];
  /** Directions the texts explicitly keep this room OUT of (e.g. toilet ∉ northeast). */
  avoidDirections?: readonly DishaDirection[];
  /** The direction one FACES while using the room (cook → east, study → east/north). */
  facingWhileUsing?: readonly DishaDirection[];
};
```

Registry invariants added to `vastuContent.test.ts`: `alternateDirections ∩ directions = ∅`;
`avoidDirections ∩ (directions ∪ alternateDirections) = ∅`; every `avoidDirections` and
`facingWhileUsing` value is a `DISHA_ORDER` member; `isCenter` entries carry none of the three.
The seven shipped rows gain `alternateDirections` where their prose already states one
(kitchen → `['northwest']`) and `avoidDirections` where already stated (toilet →
`['northeast']`, sleeping head → `['north']` expressed on the activity row, B2) — **the prose
does not change**, so the stance-guard grep and the screen tests stay green.

## B2. New rows (target ≈ 20, each content-gated)

Grouped by `category`. Primary / alternate / avoid are the *candidate* conventions to verify —
the build commits nothing the two-domain check does not confirm, and a split becomes a
`variantNote`, never an averaged rule (§22.4).

**living** — master bedroom (SW; alt S/W); children's bedroom (W/NW; alt E); guest room
(NW; alt NE per some texts → variant); living/drawing room (N/E/NE; alt NW); dining (W; alt
E/N; facing E while eating); study (NE/N/E; face E/N; avoid SW per some → variant); balcony/
verandah (N/E; avoid S/W → variant).

**utility** — store room (SW/W; light goods NW); overhead water tank (SW/W; avoid NE);
underground tank/borewell (NE/N; avoid SW/SE); septic tank (NW; avoid NE/centre); wash/utility
area (NW/SE — split → variant); garage/parking (NW/SE; avoid NE/SW).

**structure** — staircase (S/W/SW; clockwise ascent; avoid NE/centre); windows & ventilation
(N/E; more open than S/W); heavy furniture/almirah (SW/S/W; avoid NE); safe/locker (SW room,
door opening north — Kubera; avoid facing S).

**element** — garden/plants (N/E; tulsi already shipped); mirrors (N/E walls; avoid facing
the bed → variant). *Colours by direction is deliberately excluded* — sources split widely and
the register drifts into décor-commerce; PRD-24 §7 non-goals hold.

**activity** — sleeping head-direction (already shipped; re-tagged `activity`); studying/
working facing (E/N); eating facing (E; alt N); worship facing (E/N — already in the puja row's
prose; a typed `facingWhileUsing` makes it askable).

## B3. Frameworks: the mandala and the door padas (`data/vastu/mandala.ts`, `doorPadas.ts`)

- **Nine zones** (`VastuZone`) each with: dikpala (Indra E · Agni SE · Yama S · Nirriti SW ·
  Varuna W · Vayu NW · Kubera N · Ishana NE · Brahma centre), pancha-bhuta where the texts
  assign one (jala NE · agni SE · prithvi SW · vayu NW · akasha centre), the classical
  "quality" phrase and its reason, bilingual. Where a dikpala matches a registry deity
  (`kubera`, and Ishana → `shiva` with a `variantNote` naming the identification), the zone
  row carries the `deityId` so the screen can show the existing `DeityIcon` and link the
  deity's texts — through the shipped `buildEntryStartTarget()`, never a hand-rolled route.
  The remaining dikpalas render as text (no glyph is invented — the deity-icons no-emoji rule).
- **32 door padas**: per facing side, the eight pada names in order (the Mayamata /
  Vishwakarma-prakash sequence) and the set each source calls auspicious for that facing.
  This is the fuller rule the shipped `main-door` row already points to in prose. Sources
  *do* split on exact sets → the registry stores each source's set and the row states the
  agreement (padas both name) as the convention and the difference as `variantNote`. Rows
  ship `draft` until the two-domain bar is met.
- **Ancestor photographs** (the shipped draft) — find the second domain and flip to
  `verified`; nothing else about the row changes.

## B4. Ask (PRD-41) follows automatically — with one check

`lexicon.ts` derives room surface forms from `VASTU_ROOM_ENTRIES`, so every verified row is
askable the day it flips. Two additions: the `vastu.direction` intent reads
`facingWhileUsing` for "किस ओर मुख करके…" questions, and the golden corpus
(`ask/__tests__/corpus.test.ts`) gains ≥ 2 questions per new verified row, keeping the ≥ 85 %
top-1 / zero-wrong-answer gate.

---

# PART C — मेरा घर · the saved home map (the "for home" half)

## C1. The flow (`GharVastuSetupScreen`, three steps, skippable)

1. **घर का मुख · Facing.** "Stand inside the main door, facing out. Hold the phone flat."
   The chakra + A5 pada ring; **Hold** captures; the screen records `facing: DishaDirection`
   and `doorPada: 1–8 | null`. With the sensor `unavailable` the 8 chips (and a pada picker)
   do the same by hand — the sensor never gates the record (RULEBOOK §22.6).
2. **कक्ष · Rooms.** "Stand at the centre of the home. Point the phone at each room and tap
   it." The registry's `living`/`utility`/`structure`/`worship` rows appear as chips; tapping
   one while a dik is faced (or held, or manually chosen) records `{ roomId, dik }`. Rooms
   may be skipped, recorded twice (two bedrooms → `roomId` + ordinal), or marked `center`.
3. **सारांश · Summary** → the screen in C3.

Copy throughout is instruction, not evaluation. No step says "good" or "wrong".

## C2. The record (`vastu/homeRecord.ts`, `homeRecordStore.ts`)

```ts
export type HomeRoomPlacement = { roomId: string; ordinal?: number; zone: VastuZone; recordedAt: string };
export type HomeRecord = {
  version: 1;
  facing: DishaDirection;
  doorPada: number | null;                 // 1–8 within the facing side
  rooms: readonly HomeRoomPlacement[];
  updatedAt: string;
};
```

- Key `@vedansh:vastu-home:v1`, enumerated as a **NON-cache key** in `derivedCacheReset`
  (the `kulParamparaStore` precedent) so a cache sweep never deletes a home.
- Parse validates every `roomId` against the registry; a retired id is **dropped, never a
  crash** (PRD-29's rule). Unknown `version` → treated as absent, with the raw payload left in
  place for a future migration.
- **One home in v1.** A roster (city flat + village house) is a real ask and is deferred to an
  explicit product decision (§10) — the record shape leaves room (`HomeRecord[]` under a
  `v2` key) and nothing in v1 assumes a single home *forever*.
- **Export**: a `vastu-home` section in the PRD-29 envelope style (`format: 'vedansh-vastu-home',
  version: 1`, display strings denormalised beside ids) via the same `expo-sharing` path. Import
  waits for PRD-06's one importer, as kul parampara's does.
- Nothing about the home is read by widgets, the Today strip, notifications, or Ask's briefing.

## C3. The screen (`GharVastuScreen`) — the mandala with your rooms in it

- **Header**: `ReaderHeader variant="index"`, title `मेरा घर · वास्तु`; header action `पुनः मापें ·
  Re-measure` → C1 at step 2 with the record pre-filled.
- **Mandala card**: a 3 × 3 grid (`react-native-svg`, rotated so the *facing* side is at the
  bottom — the way one stands inside the door looking in). Each cell: zone label
  (`DISHA_LABELS` or ब्रह्मस्थान), the dikpala name in 11 pt muted, and the user's room chips in
  that zone. The centre cell is drawn open (the shipped Brahmasthan idiom). One accessibility
  label narrates the whole grid (the §51 chart text-equivalence rule).
- **मुख्य द्वार row**: facing + pada name; then exactly one of the three §0 phrases derived
  from the door-pada registry for that facing; then the shipped `main-door` accommodation text
  when the phrase is the third.
- **Room rows**, in **registry order** (never re-sorted): title · `परंपरा: <directions>` ·
  `आपके घर में: <zone>` · the relation phrase (`मेल` / `परंपरागत विकल्प` / `परंपरा में अन्यत्र`)
  · the accommodation line when the third phrase applies. The phrase is computed by the pure
  `relationFor(entry, zone)` in `vastu/homeRelation.ts`:
  `directions ∋ zone → 'in-keeping'`, else `alternateDirections ∋ zone → 'alternate'`, else
  `'elsewhere'`; `isCenter` rows compare against `'center'`. **The `avoidDirections` field is
  never surfaced as a fourth phrase** — an avoided direction is `elsewhere` plus the
  accommodation, exactly like any other. (Naming the avoidance would be the dosha register.)
- **Unrecorded rooms** appear at the end as `अभी मापा नहीं · Not measured yet` with a tap into
  C1 step 2 — quiet rows, no prompt to "complete".
- **Closing line**: Phase 1's stance sentence, then the privacy line in the PRD-29 idiom
  (2 px `goldTint` left border, italic muted): "यह मानचित्र केवल इस फ़ोन पर है।"
- **Delete** in the header overflow, with the standard destructive confirm.

## C4. Doors

- `VastuDishaScreen`: a `मेरा घर` ListCard under the chip row — `NEW`-state until a record
  exists, then the facing + room count as its state text. Tapping without a record → C1.
- `MuhuratResultsScreen` griha-pravesh door: unchanged target when a record exists; **without
  one it opens C1** ("नए घर का मुख मापें") — the move-in moment is exactly when the map is
  first drawn.
- More hub row: unchanged (the Phase 1 row stays the single More door; §37's row count does
  not grow).
- `GharVastu` and `GharVastuSetup` register on the More **and** Panchang stacks (the PRD-19
  multi-stack pattern the Phase 1 screen already uses).

## C5. Ask: `vastu.myhome`

A fourteenth intent, family `vastu`: triggers "मेरा/मेरी/हमारा … किस दिशा", "ghar ka mukh",
"mera kitchen kahan hai"; slot `room` (existing kind). Reads the store's parsed record (pure
accessor, no React); **abstains** (returns `null`) without a record, and the abstain card's
did-you-mean chip offers "मंदिर किस दिशा में" — the generic intent — rather than a nudge to set
up. Answer card: headline = the zone, rows = परंपरा / आपके घर में / the relation phrase,
working = `HomeRecord.rooms[<roomId>]`, action = `मेरा घर खोलें`. Stance guard: the
`declined` register is untouched — this intent is factual recall of the user's own record.

---

# PART D — गृह प्रवेश tie-in (small, cross-link only)

- The griha-pravesh muhurat result already opens Vastu; C4 makes it open the home setup on a
  fresh home.
- **No griha-pravesh vidhi is authored here.** PRD-19's registry has none; when one exists,
  its तैयारी checklist gains a `मुख्य द्वार की दिशा मापें` row that deep-links to C1 step 1.
  This PRD adds the deep-link target (`entryRoutes.ts`) and nothing else.

---

## 5. Files (planned)

`mobile/src/vastu/{compass,useCompassHeading}.ts` (A1–A5) · `mobile/src/vastu/{homeRecord,homeRecordStore,homeRelation}.ts` (C2–C3) · `mobile/src/data/vastu/{types,roomGuidance,mandirGuidance,declination,mandala,doorPadas}.ts` (B) · `components/DishaChakra.tsx` (A4–A5) · `components/VastuMandalaGrid.tsx` (C3) · `screens/{VastuDishaScreen,GharVastuScreen,GharVastuSetupScreen}.tsx` · doors in `screens/MuhuratResultsScreen.tsx` · routes in `navigation/{types,MoreStackNavigator,PanchangStackNavigator}.tsx` + `entryRoutes.ts` · `ask/intents/index.ts` (`vastu.myhome`) · `utils/derivedCacheReset.ts` (NON-cache key) · `mobile/scripts/generate-declination.md` (grid regen).

## 6. Tests (planned, per RULEBOOK §22.10 extended)

- **Jest** — `compass.test.ts` (accuracy mapping, tilt threshold/hysteresis, `padaForHeading`
  boundaries, grid interpolation vs city table ≤ 0.2°); `useCompassHeading.test.tsx` (source
  ladder, −1 true-heading fallback, `tilted` precedence, hold removes the subscription);
  `vastuContent.test.ts` (new set-algebra invariants, zone/dikpala completeness = 9, pada
  registry = 8 per side × 4 sides, draft invisibility for every new row, extended copy guard);
  `homeRecordStore.jest.test.ts` (serde round-trip, retired-id drop, unknown-version
  passthrough, NON-cache enumeration); `homeRelation.test.ts` (the three phrases, centre
  handling, avoid-never-a-phrase pin); `GharVastuScreens.test.tsx` (sensor-unavailable setup
  completes by hand; registry order preserved; no numeral summary rendered).
- **tsx** — `ask/__tests__/corpus.test.ts` additions; `launchPath.test.ts` must stay green
  (the store module is reachable only behind the existing dynamic `import()`).
- **Maestro** — `ghar-vastu-setup-smoke.yaml` (More → Vastu → मेरा घर → manual facing →
  two rooms by chip → summary shows both relation rows → back); the live-heading, tilt and
  haptic paths stay device-only release-candidate steps (simulators have no magnetometer).

## 7. Stance guards (pinned, not vibes)

Extend `vastuContent.test.ts`'s `FORBIDDEN` list with the *comparison* register this phase
could drift into: `/score/i`, `/\d+\s?%/`, `/अंक/`, `/गलत/`, `/wrong/i`, `/अशुभ स्थान/`,
`/needs? (fixing|attention)/i`, `/सुधार/`. Add a screen-level pin: `GharVastuScreen` renders
no `Text` whose content matches `/\d+ (of|में से) \d+/`. Add a store-level pin: the relation
enum has exactly three members. Add a data pin: `avoidDirections` never reaches a renderable
prop (the §22.8 provenance rule applied to the one field that could become a warning).

## 8. Design and contract updates (same PRs, per `.claude/rules/design-doc-sync.md`)

- `design.md` §66 gains: §66.1 *Fused heading, tilt & hold* (status vocabulary of five, the
  hold pill, haptic + announcement rules); §66.2 *Pada ring* (door flow only); §66.3 *Registry
  categories & the mandala card*; §66.4 *मेरा घर setup flow*; §66.5 *मेरा घर screen* (grid
  spec, row anatomy, the three phrases, privacy line). §37 (More hub) unchanged; §60 chip idiom
  unchanged.
- `RULEBOOK.md` §22 gains rules 11–15: fused-source ladder & the no-prompt rule; tilt state;
  the three-phrase comparison vocabulary and the never-surfaced `avoidDirections`; the home
  record's privacy/NON-cache/export contract; the pada ring's door-flow-only scope.
- `wiki/subsystems/vastu-disha.md` — Shape, Gotchas (add: "the OS true heading is −1 without
  location permission — never treat it as a bearing"; "registry order is display order — a
  sorted list is a score") and Working rules, via the `llm-wiki` skill's ingest.

## 9. Sequencing and sizing

```
A1 fused heading + A3 grid        ████          M · OTA · ships alone, pure trust win
B1 types + set-algebra tests      ██            S · OTA · unblocks B2/B3 and C
C2 store + C3 relation (pure)     ████          M · OTA · testable without a screen
C1 + C3 screens + C4 doors + C5   ██████        L · OTA · the headline
A2 tilt · A4 hold/haptics/a11y    ███           S–M · OTA · polish, any time after A1
B2 rows (≈20, draft → verified)   ░░░░░░░░      content-gated · parallel, data-only flips
B3 mandala + door padas · A5 ring ░░░████       content-gated · the pada ring waits for B3
D deep-link target                █             S · with C4
                                  └ ██ = buildable now   ░░ = gated on verification
```

Recommended order: **A1+A3 → B1 → C2/C3 (pure) → C screens + C5 → A2/A4**, with B2/B3
verification running alongside from day one so rows flip as the screen lands. A5 last.
Each block is its own PR with its design.md/RULEBOOK/wiki deltas.

## 10. Open product decisions (block only what they gate)

1. **One home vs a roster** — v1 ships one (§C2); a roster is a `v2` key and a list screen.
   Gates nothing in this phase.
2. **Pada precision copy** — the ring shows pada *names*; should the door row also show the
   11.25° arc? Recommendation: names only (RULEBOOK §22.7). Gates A5 copy only.
3. **Deity-facing table** (which way each murti faces) — sources split by deity and
   sampradaya; recommendation: exclude, keep the shipped family-tradition note. Gates nothing.
4. **Colours by direction** — recommendation: exclude (§B2). Gates nothing.
5. **Location prompt** — A1 never asks. If product wants a one-time explanatory ask inside
   Vastu, it is a copy + one-call change gated on that decision.

## 11. Acceptance and release gates

1. Unit/Jest/tsx suites in §6 green; `npm run lint` 0 errors; `tsc` clean; `npm test` exit
   code 0 (checked as `$?`, not the summary line — the repo gotcha).
2. Every new registry row is `draft` unless its two-domain note is present and dated; the
   accessor tests prove invisibility.
3. Sensor-`unavailable` path completes the whole मेरा घर setup and renders the full summary.
4. Maestro `ghar-vastu-setup-smoke.yaml` green on the isolated simulator recipe.
5. Device RC step: fused vs magnetometer headings agree within one sector on two phones; tilt
   state appears at ~20°; hold freezes; haptic ticks on sector change.
6. `design.md` §66.1–66.5, RULEBOOK §22 rules 11–15 and the wiki page land in the same PRs.
7. OTA publish at the live store runtime (1.4.8) — no `app.json`/`APP_TOUR_VERSION` bump is
   required, but the `whatsNew` entry for the *next* store version describes मेरा घर.

# PRD-24 · Phase 2 — गृह वास्तु · from a compass to the whole-home vastu companion

| | |
|---|---|
| **Status** | Plan — drafted 2026-09-04, revised the same day with buyer/renter mode, floor-plan input, tiered rules and the AI layer. **UX decided 2026-09-05** (owner, from the prototype): Variant A capture + Variant C floor-plan mark-up, the **mandala grid as the single assessment reading**; the ledger reading is dropped. Not yet built |
| **Parent** | [PRD-24 वास्तु दिशा](./24-vastu-disha.md) §4 Phase 2 (this document IS that phase line) |
| **Design** | `design.md` §66 (to be extended as §66.1–§66.8 in the build PRs) |
| **Contract** | `RULEBOOK.md` §22 (rule 5 amended, rules 11–17 added — see §8) |
| **Prototype** | [`docs/ghar-vastu-prototype.html`](../../ghar-vastu-prototype.html) — three live UX variants (A · चक्कर compass walk, B · मंडल placement + ledger + compare, C · floor-plan mark-up + AI pre-read), one shared five-class engine; **registry rows, weights and pada names in it are illustrative placeholders** |
| **T-shirt size** | A: M · B: L (content-gated) · C: L · D: S · E: L · F1: M (store) · F2: L (backend) |
| **Release** | **Parts A–E and F0 ship OTA at the 1.4.8 runtime** — `expo-sensors`, `expo-location`, `expo-haptics`, `expo-sharing`, `expo-file-system`, `react-native-svg` are all in the shipped binary. **F1 needs `expo-image-picker` (new native module → store release).** **F2 needs the runtime backend** the 2027 bets introduce in Stage 2 (PRD-32); it cannot ship before that and is planned here so the data shapes are ready for it. |

> **Why a Phase 2.** Phase 1 shipped (1.4.8) a live 8-dik compass with an honest accuracy
> state, seven room conventions and the home-mandir upkeep set. That is a *reference card*
> held up against a compass. A whole-home vastu companion means six more things:
> **(A)** a compass trustworthy enough to place a room in its 45° sector and a door in its
> 11.25° pada anywhere indoors; **(B)** the *complete* classical household set — every room,
> utility and element, the nine mandala zones with their dikpalas and elements, the 32 door
> padas — each rule carrying its **weight** (forbidden · prescribed · preferred); **(C)** a
> saved map of the user's own home, assessed room by room against those weighted rules;
> **(D)** the griha-pravesh tie-in; **(E)** a **buyer/renter mode** — pick the home type
> (1–5 BHK, villa, plot), walk the property marking positions step by step, keep several
> shortlisted homes and compare them; **(F)** a **floor-plan input** — mark rooms on an
> uploaded plan offline (F1), and later let a vision model pre-read the plan and write
> grounded pointers (F2), while the assessment itself stays the deterministic rule engine.

---

## 0. The stance, amended: weighted rules, honest findings, still no score

Phase 1's RULEBOOK §22.5 said *never a verdict on a home*. The product decision recorded
here (owner, 2026-09-04) is that a person choosing a flat or plot needs an **assessment**,
and that an assessment can be honest without becoming fear copy. The register moves from
"convention with its reason" to **"convention with its reason and its weight, read against
your rooms"**. What stays fixed, pinned by test (§7):

- **No composite score, no percentage, no rank between homes by a number.** Counts *per
  finding class* are allowed (a buyer needs them); a single number for a home is not.
- **No remedies, products, yantras, or "consult our expert".** Where the texts state an
  accommodation, the row carries it; where they do not, the row says so.
- **No pseudo-science, no misfortune language.** The reason field keeps the classical
  register (RULEBOOK §22.5 as shipped).
- **The weight belongs to the rule, not to the home.** Every finding is "the texts say X
  about this placement", never "your home is bad".

### 0.1 Weight of a convention (the user's "not allowed / must have / good to have")

| `weight` | Sanskrit register | Meaning in the texts | Examples (to verify per §22.3) |
|---|---|---|---|
| `nishedha` | **निषेध** — forbidden | The texts *proscribe* a placement | toilet in ईशान; mandir under a staircase or on a bathroom wall; head north while sleeping; heavy construction on the ब्रह्मस्थान |
| `vidhana` | **विधान** — prescribed | The texts *prescribe* a placement (with, often, a stated alternate) | kitchen आग्नेय (alt वायव्य); master bedroom नैऋत्य; puja ईशान; overhead tank नैऋत्य/पश्चिम |
| `shreyas` | **श्रेयस्** — preferred | The texts *prefer* it; absence is not a fault | tulsi in ईशान; windows north/east; safe opening north; study facing east |

Modelled as: each entry's positive placement (`directions` + `alternateDirections`) carries
`weight: 'vidhana' | 'shreyas'`; each entry's `avoidDirections` is *always* the `nishedha`
class (a proscription is a proscription regardless of where the room is prescribed).

### 0.2 Finding classes (relation × weight) — the entire assessment vocabulary

| class | Hindi label | When |
|---|---|---|
| `in-keeping` | **मेल** | zone ∈ `directions` |
| `alternate` | **परंपरागत विकल्प** | zone ∈ `alternateDirections` |
| `forbidden` | **निषिद्ध स्थान** | zone ∈ `avoidDirections` |
| `differs` | **विधान से भिन्न** | weight `vidhana`, zone in none of the three sets |
| `preferred-unmet` | **श्रेयस् अनुपलब्ध** | weight `shreyas`, zone in none of the three sets |

Five members, no sixth. `forbidden` renders in the shipped `avoid`/`avoidDeep` tokens (the
§65.1 निषेध split), the others in ink. Every `forbidden`/`differs` row is followed by the
entry's accommodation text where one exists. The Phase-1 draft of this plan pinned
"avoid never becomes a phrase"; **this revision reverses that pin by product decision** and
records the reversal in RULEBOOK §22.5's amendment (§8).

## 1. Where Phase 1 stops (from the shipped code, not the PRD)

| Area | Shipped (1.4.8) | Gap this phase closes |
|---|---|---|
| Heading source | Raw magnetometer via `expo-sensors`, `atan2(-x, y)`, flat-portrait only (`vastu/compass.ts`) | No tilt awareness; a phone held at 30° reads wrong with `status: 'ok'`. No use of the OS-fused, tilt-compensated heading `expo-location` already exposes. |
| True north | Per-city WMM table keyed by the **selected panchang city** (`data/vastu/declination.ts`, 394 ids) | A GPS fix snapped to the nearest bundled city gets that city's declination; no coordinate-based value. |
| Reading stability | Wrap-aware EMA, α = 0.25, 5-sample unreliable debounce | No way to *hold* a reading while walking to a wall; no haptic at a sector change; no VoiceOver announcement of the faced dik changing. |
| Precision | 45° sectors only (the classical unit — correct) | Door placement classically uses 32 padas (11.25°); the shipped `main-door` row can only say "padas exist" in prose. |
| Registry | 7 `VastuRoomEntry` rows; 4 `MandirGuidanceEntry` rows (1 draft) | Bedrooms by member, living, dining, study, staircase, water, septic, store, safe, balcony, windows, furniture, parking, garden, plot-level rows, dikpala/element zones, door padas — none exist. No rule carries a weight. |
| Data shape | `directions` (primary) + prose `accommodation*` | Alternate and avoided directions live only in prose, so nothing can be *compared*; no zone, no category, no weight, no "facing while using". |
| Personalisation | None — the screen is stateless | The user cannot record a home, let alone several. |
| Input modes | Live compass or manual chip | No floor-plan input; no home-type template. |
| Ask (PRD-41) | `vastu.direction` answers from the 7 rooms | Nothing answers "मेरी रसोई किस दिशा में है". |
| Doors | More hub row; griha-pravesh muhurat result | The griha-pravesh door lands on the generic screen. |

Everything in the *Shipped* column stays. Phase 2 is additive; no Phase 1 testID or copy
string is removed. (The Phase-1 closing line "not a verdict on a home" is *reworded*, not
removed — §C3.)

## 2. Product principles

1. **Classical convention with its reason and its weight** — sourced per RULEBOOK §22.3, never averaged into an invented universal (§22.4).
2. **The honest degraded state is part of the feature** — now extended to tilt, to the OS heading's own accuracy signal, and to an AI pre-read the user must confirm pin by pin.
3. **One direction vocabulary** — `DishaDirection`/`DISHA_ORDER`/`DISHA_LABELS`; the pada ring subdivides a dik, the mandala zone adds only `'center'`.
4. **Your homes are yours.** The roster is one private, versioned AsyncStorage payload; never inferred from GPS, never on a public panel (Home, Today strip, widgets), exported only through the explicit door. Floor-plan images stay in the app's document directory and are never uploaded except by the F2 action the user taps.
5. **The engine judges; a model never does.** Every finding comes from `assessHome()` (pure, tested). An LLM may *read a drawing* and may *phrase* the engine's output; it may not add, remove or reweight a finding.

---

# PART A — Compass trust (the sensor half)

## A1. Fused heading as the primary source

`expo-location` (already a config plugin in `app.json`, already used by `PanchangLocationContext`)
exposes `Location.watchHeadingAsync`, whose `HeadingObject` carries `magHeading`, `trueHeading`
and a platform `accuracy` level — the OS's tilt-compensated, calibrated fusion output.

- `useCompassHeading` gains a **source ladder**: `fused` (watchHeadingAsync) → `magnetometer`
  (the shipped path) → `unavailable`; the return type gains `source` so the status line is
  honest about which it is using and tests can pin the fallback.
- `trueHeading` is used **only when ≥ 0** (iOS reports −1 without location permission);
  otherwise `magHeading` + the bundled declination (A3).
- **No new permission prompt.** Location permission already granted by the panchang "use my
  location" flow gives true heading free; otherwise the copy under the dial reads
  `सटीक उत्तर के लिए पंचांग स्थान चालू करें`. (§10 decision 5 can add a one-time in-Vastu ask.)
- Platform `accuracy ≤ 1` → `unreliable`; else `ok`. The 25–65 µT band stays on the
  magnetometer path only. Fused smoothing α = 0.5 (pinned).

## A2. Tilt honesty (magnetometer path)

Subscribe to `Accelerometer` (same module); pure `tiltFromAccel(sample)` → pitch/roll.
|pitch| or |roll| > **20°** for ≥ 5 samples → new status **`tilted`** (`फ़ोन समतल रखें — झुका
हुआ फ़ोन दिशा बदल देता है।`, `saffron-deep`; dial keeps moving). `tilted` outranks
`unreliable`; never emitted on the fused path.

## A3. Declination by coordinates (grid), city table retained

Two-tier lookup in `data/vastu/declination.ts`: coordinates known (every `City` carries
lat/lon) → bilinear interpolation over a bundled **1° × 1° WMM-2025 grid**, 6–38 °N,
66–100 °E (1,155 values, ~9 KB); unknown → `null` → magnetic, silently (§22.7). The per-city
table becomes the regression oracle (grid vs table ≤ 0.2° for every city, by test).
`mobile/scripts/generate-declination.md` gains the grid method.

## A4. Hold, haptics, and the announced dik

- **दिशा रोकें · Hold** pill freezes `heading` (subscription removed — the manual-chip
  mechanics); tap again to resume. The capture affordance every step of C1/E2 uses.
- **Haptic tick** on `facingDik` change (`expo-haptics` `selectionAsync`, ≤ 1 per 400 ms;
  off in manual/hold).
- **`announceForAccessibility`** of the new dik label on change (≤ 1 per 1.5 s).
- `DishaChakra` grows to `min(screenWidth − 2·gutter, 300)` pt.

## A5. The pada ring (door flow only)

A 32-pada ring (11.25°, names from B3) renders **only** inside the door step of C1/E2. The
default chakra keeps eight labels; the UI never claims per-degree precision (§22.7).
`padaForHeading(heading, facing)` in `compass.ts`, boundary-pinned like `dikForHeading`.

---

# PART B — The complete, weighted household registry (content-gated)

Every row follows RULEBOOK §22.3: two concordant independent published domains, a dated
claim-level `verificationNote`, a `variantNote` where traditions split. **Rows ship `draft`
and are invisible until verified.** Code lands first; verification proceeds in parallel.

## B1. Type extensions (`data/vastu/types.ts`) — backward compatible

```ts
export type VastuZone = DishaDirection | 'center';            // the 9 mandala zones
export type VastuRoomCategory =
  | 'worship' | 'living' | 'utility' | 'structure' | 'element' | 'activity' | 'plot';
export type VastuWeight = 'vidhana' | 'shreyas';               // positive placement weight
export type HomeKind = 'flat' | 'villa' | 'plot';               // which templates list the row

export type VastuRoomEntry = {
  …existing fields…
  category?: VastuRoomCategory;                 // default 'living'
  /** Weight of the PRESCRIBED placement. Default 'vidhana' (the seven shipped rows are all prescriptions). */
  weight?: VastuWeight;
  /** The texts' stated second place(s). Typed so it can be compared, not just read. */
  alternateDirections?: readonly DishaDirection[];
  /** Directions the texts PROSCRIBE for this room — always the निषेध class in a finding. */
  avoidDirections?: readonly VastuZone[];       // may include 'center' (e.g. toilet, staircase)
  /** The direction one FACES while using the room (cook → east). */
  facingWhileUsing?: readonly DishaDirection[];
  /** Which home kinds show this row in templates; default all. Plot-level rows are ['villa','plot']. */
  appliesTo?: readonly HomeKind[];
};
```

Registry invariants added to `vastuContent.test.ts`: `alternateDirections ∩ directions = ∅`;
`avoidDirections ∩ (directions ∪ alternateDirections) = ∅`; every value is a `DISHA_ORDER`
member or `'center'`; `isCenter` entries carry none of the three placement sets; a `shreyas`
row never carries `avoidDirections` whose sole justification is the same source claim as its
preference (a preference and a proscription are two claims, each needing its own two-domain
note). The seven shipped rows gain typed sets where their prose already states them
(kitchen alt → `['northwest']`; toilet avoid → `['northeast','center']`; puja avoid → none
typed — "not on a bathroom wall" is adjacency, not a direction, and stays prose). **Prose
does not change**, so the stance-guard grep and screen tests stay green.

## B2. New rows (≈ 24, each content-gated)

Primary / alternate / avoid / weight below are the *candidates* to verify; a split becomes a
`variantNote`, never an averaged rule.

**living** — master bedroom (SW; alt S/W; `vidhana`); children's bedroom (W/NW; alt E);
guest room (NW; alt NE → variant); living/drawing room (N/E/NE; alt NW); dining (W; alt E/N;
facing E; `shreyas`); study (NE/N/E; face E/N; avoid SW → variant); balcony/verandah (N/E;
`shreyas`).

**utility** — store room (SW/W); overhead water tank (SW/W; avoid NE); underground tank/
borewell (NE/N; avoid SW/SE); septic tank (NW; avoid NE/center); wash/utility (NW/SE → variant);
garage/parking (NW/SE; avoid NE/SW).

**structure** — staircase (S/W/SW, clockwise ascent; avoid NE/center); windows & ventilation
(N/E; `shreyas`); heavy furniture/almirah (SW/S/W; avoid NE; `shreyas`); safe/locker (SW room,
door opening north; `shreyas`).

**element** — garden/plants (N/E; `shreyas`); mirrors (N/E walls; avoid facing the bed →
variant; `shreyas`). *Colours by direction excluded* (sources split; décor-commerce register).

**activity** — sleeping head-direction (shipped; re-tagged; avoid → `['north']`); studying/
working facing (E/N; `shreyas`); eating facing (E; alt N; `shreyas`).

**plot** (`appliesTo: ['villa','plot']`, for Part E) — plot facing / road side (N/E/NE
favoured; every side has its auspicious padas → the door-pada rule); gate (per facing side's
padas); plot shape (square/rectangular; irregular → variant, stated not judged); slope (toward
N/E; avoid toward SW → verify); compound wall height (S/W higher; `shreyas`); open space
(more N/E; `shreyas`); well/borewell (NE; avoid SW/SE); trees (large ones S/W; avoid front-of-
door — already in the door row).

## B3. Frameworks: the mandala and the door padas (`data/vastu/mandala.ts`, `doorPadas.ts`)

- **Nine zones** with dikpala (Indra E · Agni SE · Yama S · Nirriti SW · Varuna W · Vayu NW ·
  Kubera N · Ishana NE · Brahma centre), pancha-bhuta where assigned (jala NE · agni SE ·
  prithvi SW · vayu NW · akasha centre), the classical quality phrase and reason, bilingual.
  Where a dikpala matches a registry deity (`kubera`; Ishana → `shiva` with a `variantNote`),
  the row carries `deityId` so the screen shows the existing `DeityIcon` and links the deity's
  texts via `buildEntryStartTarget()`. Others render as text (no invented glyph).
- **32 door padas**: per facing side, eight pada names in the Mayamata / Vishwakarma-prakash
  order and each source's auspicious set; the agreement is the convention, the difference the
  `variantNote`. `draft` until the two-domain bar is met.
- **Ancestor photographs** (shipped draft) — second domain, flip to `verified`.

## B4. Ask (PRD-41) follows automatically

`lexicon.ts` derives room forms from the registry, so every verified row is askable on flip.
`vastu.direction` reads `facingWhileUsing`; the golden corpus gains ≥ 2 questions per new
verified row (≥ 85 % top-1, zero wrong answers).

---

# PART C — मेरा घर · the home you live in

## C1. The flow (`GharVastuSetupScreen`, skippable steps)

1. **घर का मुख · Facing.** "Stand inside the main door, facing out. Hold the phone flat."
   Chakra + A5 pada ring; **Hold** captures `facing` and `doorPada`. With the sensor
   `unavailable`, chips and a pada picker do the same by hand (§22.6).
2. **कक्ष · Rooms.** "Stand at the centre of the home. Point the phone at each room and tap
   it." The home's **template chips** (E1 — for the lived-in home the user picks a type too,
   or `custom`) appear; tapping one while a dik is faced/held/chosen records `{ roomId,
   ordinal, zone }`. Skip, repeat (two bedrooms), or mark `center`.
3. **सारांश · Assessment** → C3.

Copy is instruction, never evaluation, until step 3.

## C2. The record (`vastu/homeRecord.ts`, `homeRecordStore.ts`) — a roster from day one

```ts
export type HomePlacement = { roomId: string; ordinal?: number; zone: VastuZone; recordedAt: string;
                              /** How the zone was captured — the provenance the assessment shows. */
                              via: 'compass' | 'manual' | 'plan' | 'plan-ai-confirmed' };
export type HomeRecord = {
  id: string; version: 1;
  label: string;                                  // "हमारा घर", "Prestige 3BHK, 7th floor"
  kind: HomeKind; template: string;               // e.g. 'flat-3bhk', 'villa', 'plot', 'custom'
  role: 'living' | 'considering';                 // Part C vs Part E
  facing: DishaDirection | null; doorPada: number | null;
  rooms: readonly HomePlacement[];
  plan?: { uri: string; northDeg: number; centre: { x: number; y: number } };   // F1
  createdAt: string; updatedAt: string;
};
export type HomeRoster = { version: 1; homes: readonly HomeRecord[]; livingId: string | null };
```

- Key `@vedansh:vastu-homes:v1`, enumerated as a **NON-cache key** in `derivedCacheReset`
  (the `kulParamparaStore` precedent). Cap: 12 homes (a shortlist, not a database).
- Parse validates every `roomId`/`template` against the registries; a retired id is
  **dropped, never a crash**; unknown `version` → treated as absent, payload left in place.
- **Export**: `format: 'vedansh-vastu-homes', version: 1`, display strings denormalised
  beside ids, via `expo-sharing` (the PRD-29 envelope). Import waits for PRD-06's importer.
- Nothing about any home is read by widgets, the Today strip, notifications or the briefing.

## C3. The assessment engine and screen

**Engine — `vastu/assessHome.ts` (pure, tsx-tested).** `assessHome(record, registry) →
HomeAssessmentModel`: for each placement, `classify(entry, zone)` per §0.2; door finding from
the pada registry; unrecorded template rooms listed as `unmeasured`; output grouped by class
in the fixed order `forbidden → differs → preferred-unmet → alternate → in-keeping →
unmeasured`, **registry order within a group**, each finding carrying the entry's convention,
reason, accommodation and `via`. The model is **versioned, fully serialisable JSON with no
`Date` instances** (serde round-trip pinned) — deliberately the grounding object F2 consumes,
exactly as `KundaliReportModel` was designed for PRD-32.

**UX decision (2026-09-05, from the prototype).** The assessment has **one** reading: the mandala grid (Variant A step 3 / Variant C grid toggle). The ledger reading (prototype Variant B) is dropped — no view toggle, no second layout to maintain. Rooms are captured by the compass walk (C1/E2, Variant A) or by pinning a floor plan (F1, Variant C); the manual chip fallback stays as the sensor-unavailable path, not as a third mode. The compare screen (E3) is unaffected — it is a roster surface, not a reading of one home.

**Screen — `GharVastuScreen`.**
- `ReaderHeader variant="index"`, title = the home's label; actions `पुनः मापें`, overflow
  (rename · export · delete with the destructive confirm).
- **Mandala card**: 3 × 3 `react-native-svg` grid rotated so the facing side is at the
  bottom (standing inside the door looking in); each cell: zone label, dikpala 11 pt muted,
  the home's room chips (chip border in the finding-class tone); centre drawn open. One
  accessibility label narrates the grid (§51 text-equivalence).
- **Class summary strip**: five quiet pills, `<label> · <count>`, in the fixed order; a pill
  with count 0 still renders (absence is information). **No total, no percentage, no bar.**
- **Finding groups** in the fixed order, each row: title · `परंपरा: <directions> (<weight
  word>)` · `आपके घर में: <zone>` · class label · accommodation (forbidden/differs) ·
  `via` glyph (compass / hand / plan). `unmeasured` rows tap into C1 step 2.
- **Closing lines**: "यह शास्त्रीय परंपरा का, भार सहित, पाठ है — घर का नहीं, स्थान का विधान।"
  then the privacy line (2 px `goldTint` left border, italic muted).

## C4. Doors

- `VastuDishaScreen`: `मेरे घर` ListCard under the chip row — NEW until the roster has a
  home; then `<living label> · <n> और` as state text → the roster (E3) or straight to the one
  home.
- `MuhuratResultsScreen` griha-pravesh door: opens C1 as `role: 'living'` when the roster has
  no living home; else the living home.
- More hub row unchanged. `GharVastu*` register on the More **and** Panchang stacks (the
  PRD-19 multi-stack pattern).

## C5. Ask: `vastu.myhome`

Fourteenth intent, family `vastu`: "मेरा/मेरी/हमारा … किस दिशा", "ghar ka mukh", "mera
kitchen kahan hai"; slot `room`. Reads the roster's **living** home (pure accessor); abstains
without one (did-you-mean chip → the generic intent). Answer rows: परंपरा (with weight) /
आपके घर में / class label; action `मेरा घर खोलें`. The `declined` register is untouched —
this is recall of the user's own record.

---

# PART D — गृह प्रवेश tie-in (small)

The griha-pravesh muhurat result opens C1 on a fresh roster (C4). No griha-pravesh vidhi is
authored here; when PRD-19's registry gains one, its तैयारी checklist links to C1 step 1.
This PRD adds the `entryRoutes.ts` deep-link target only.

---

# PART E — नया घर देखें · buyer / renter mode

The user's framing: *anyone planning to buy or rent can use this and mark — select 2/3/4/5
BHK, villa and so on, then mark positions step by step.* Part C's record and engine already
carry this; Part E adds the templates, the site-visit flow, the roster and the comparison.

## E1. Home-type templates (`data/vastu/homeTemplates.ts`, pure data)

| template | kind | seeded room chips (registry ids × count) |
|---|---|---|
| `flat-1bhk` … `flat-5bhk` | flat | main door · living · kitchen · dining · puja · bedroom ×N (first = master) · toilet ×⌈N/2⌉+1 · balcony · store (3+) · study (4+) |
| `villa` | villa | the flat set + staircase · overhead tank · underground tank · septic · parking · garden · plot rows (B2 `plot`) |
| `plot` | plot | plot rows only + intended main-door side |
| `custom` | any | empty; the user adds chips from the whole registry |

Templates are **seed lists, not rules**: any chip can be removed or added. A template row
whose registry entry is still `draft` is silently absent (the verified-only accessor applies
to templates too). Pinned: every template id resolves, counts are ≥ 1, `appliesTo` respected.

## E2. The site-visit flow (`GharVastuSetupScreen`, `role: 'considering'`)

Step 0 **घर का प्रकार** (template picker + label + optional note field for the listing) →
Step 1 facing (C1.1) → Step 2 rooms, **as a checklist in template order**, each chip showing
`✓ <zone>` once captured — this is the "step by step" walk: living → kitchen → … The flow is
resumable (a visit is interrupted by the broker); the record saves after every capture.
For `plot`, step 1 captures the road/entry side and step 2 walks the plot rows (slope, well,
open space…) with the compass at the plot's centre.

## E3. Roster and comparison (`GharVastuRosterScreen`, `GharVastuCompareScreen`)

- **Roster**: §33 ObservanceList rows — label · template · facing · a five-count micro-strip
  in the fixed class order · `role` glyph. Living home pinned first. Swipe: rename · delete.
  `+ नया घर` → E2. Cap 12.
- **Compare**: pick 2–3 `considering` homes → a column per home. Rows: facing + door finding;
  the five class counts; then every registry room present in any home, showing each home's
  zone + class label side by side. **No winner, no ranking, no colour heat beyond the
  finding-class tokens already in use.** Registry order. A closing line names the trade the
  screen refuses to make: "कौन-सा घर — यह निर्णय आपका है; यहाँ केवल विधान का पाठ है।"
- **Share a home**: the C2 export, plus a **full-text handoff** (F0) so the assessment can go
  to a family group or the user's own assistant.

## E4. Ask

`vastu.myhome` gains a home slot by label ("Prestige वाले घर की रसोई") → the named home; a
bare question still means the living home.

---

# PART F — Floor-plan input and the AI layer

## F0. Full-text handoff (ships with E, zero backend)

The PRD-20 §68 pattern: `vastu/homeHandoff.ts` renders the `HomeAssessmentModel` as plain
text — label, template, facing + pada, **the grid as a 3 × 3 text table with your rooms in
each zone**, and for every room three lines: *the ideal* (the convention's directions,
alternates, avoided zones and its weight), *yours* (the recorded zone and how it was
captured), *the finding* (class + accommodation) — then the privacy note and the JSON
model. Where a plan image exists (F1), the share sheet carries the image beside the text
(`expo-sharing` with the OS multi-item sheet; text-only where the platform cannot). The user
may paste all of it into **any** assistant (ChatGPT, Gemini, Claude) and ask it to summarise
or explain. The app contacts no service; the framing inside the export states that the
findings are classical convention with weight, not a prediction or a valuation, and asks the
reader's assistant to stay inside those findings.

## F1. Mark on a plan — offline, deterministic (store release: `expo-image-picker`)

- **Input**: pick a floor-plan image (photo of the brochure page, PDF page screenshot) via
  `expo-image-picker`; copy to the app's documents dir; store `plan.uri`. No camera module —
  the picker's camera option is enough.
- **Orient**: drag a north arrow over the plan (or type the plan's facing — brochures state
  it); the arrow's angle is `plan.northDeg`. Tap once to set the **centre** (the ब्रह्मस्थान
  pin) — default = image centre.
- **Mark**: tap a template chip, then tap its place on the plan. Zone = `dikForHeading(angle
  from centre to pin − northDeg)`; a pin within 12 % of the image diagonal from the centre is
  `center`. Pins are draggable; `via: 'plan'`.
- **Assess**: the same engine; the mandala card can toggle to **plan view** — the image under
  the 3 × 3 overlay, pins tinted by class.
- Pinned: the pin→zone geometry in `compass.test.ts` (north-arrow rotation, centre radius),
  the store's `plan` serde, and that a missing image file degrades to the grid view with the
  placements intact.

## F2. AI pre-read and grounded pointers (Stage-2 backend, 2027)

*The user's ask: upload an image, evaluate against the rules, let GPT/Gemini add the feature
or suggest pointers.* The architecture keeps §2.5 intact:

1. **Vision pre-read** (replaces F1's manual pins, never the confirmation): the plan image
   goes to the backend, which calls a vision model with a strict JSON schema —
   `{ northArrow?: deg, centre?: {x,y}, rooms: [{ label, roomId?: registry id, x, y, confidence }] }`
   — and returns pins. Every pin lands **unconfirmed**; the user confirms/moves/deletes each
   (`via: 'plan-ai-confirmed'`). Unconfirmed pins are not assessed. A room the model labels
   but the registry lacks is offered as `custom` text, never assessed.
2. **Grounded summary and pointers**: the backend receives three things and nothing else —
   the `HomeAssessmentModel` JSON (the grid with your placements and every finding), the
   registry rows for the rooms present (the *ideal*: directions, alternates, avoided zones,
   weight, reason, accommodation — so the model can explain ideal-versus-yours in its own
   words), and, **only when the user ticks it on the consent sheet**, the plan image again so
   the summary can point at the drawing ("the kitchen in the top-right of your plan…"). It
   returns a short bilingual narrative — a summary paragraph, then pointers — in which every
   sentence must cite finding ids; the client renders only sentences whose cited ids exist in
   the model and drops the rest (the PRD-32 citation-validation rule). The model cannot add
   a finding, change a class or a weight, or name a remedy — the system prompt forbids it and
   the client filter enforces it (a sentence with a `remedy/उपाय/यंत्र` token is dropped, the
   §7 guard applied to model output). The user never types free text into this request —
   questions go through Ask (C5) or the F0 handoff to their own assistant.
3. **Provider-agnostic**: the endpoint is the Stage-2 service PRD-32 stands up; the provider
   (Anthropic / OpenAI / Google) is a server-side choice with a JSON-schema contract, so
   "GPT or Gemini" is a config value, not an app change. **No API key ever ships in the
   binary; BYOK is rejected** (key-handling UX, cost surprises, and a support burden the app
   cannot carry).
4. **Consent + privacy**: one explicit action `योजना AI से पढ़वाएँ`, a sheet stating exactly
   what leaves the device — the plan image for the pre-read; for the summary, the assessment
   JSON and the registry rows, plus the image only if its checkbox is ticked — nothing stored
   server-side beyond the request, and the F0 handoff offered as the no-upload alternative.
5. **Eval gate** (from PRD-32's method): a 40-plan labelled set; pre-read ships when ≥ 90 %
   of rooms land in the correct zone before confirmation; pointers ship when 0 of 100 sampled
   narratives survive the filter with an uncited or remedy sentence.

Until Stage 2 exists, F2 is **designed, not built**: the model shapes (C3's grounding object,
F1's `plan` block, the `via` provenance) are the parts that must be right now.

---

## 5. Files (planned)

`mobile/src/vastu/{compass,useCompassHeading}.ts` (A) · `mobile/src/vastu/{homeRecord,homeRecordStore,assessHome,homeHandoff}.ts` (C, E, F0) · `mobile/src/vastu/planGeometry.ts` (F1) · `mobile/src/data/vastu/{types,roomGuidance,mandirGuidance,declination,mandala,doorPadas,homeTemplates}.ts` (B, E1) · `components/{DishaChakra,VastuMandalaGrid,VastuClassStrip,VastuPlanCanvas}.tsx` · `screens/{VastuDishaScreen,GharVastuScreen,GharVastuSetupScreen,GharVastuRosterScreen,GharVastuCompareScreen}.tsx` · doors in `screens/MuhuratResultsScreen.tsx` · routes in `navigation/{types,MoreStackNavigator,PanchangStackNavigator}.tsx` + `entryRoutes.ts` · `ask/intents/index.ts` (`vastu.myhome`) · `utils/derivedCacheReset.ts` · `mobile/scripts/generate-declination.md`.

## 6. Tests (planned, RULEBOOK §22.10 extended)

- **Jest** — `compass.test.ts` (accuracy mapping, tilt threshold/hysteresis, `padaForHeading`,
  grid vs city ≤ 0.2°, F1 pin→zone geometry); `useCompassHeading.test.tsx` (ladder, −1
  fallback, `tilted` precedence, hold removes the subscription); `vastuContent.test.ts` (set
  algebra, weight defaults, zones = 9, padas = 8 × 4, template resolution, draft invisibility,
  extended copy guard); `homeRecordStore.jest.test.ts` (serde, retired-id drop, version
  passthrough, cap 12, NON-cache enumeration, plan-block optionality);
  `GharVastuScreens.test.tsx` (sensor-unavailable setup completes; fixed group order; registry
  order within groups; five pills always render; **no numeral total/percent anywhere**;
  compare shows no winner copy).
- **tsx** — `assessHome.test.ts` (every class reachable, serde round-trip, centre handling,
  door finding, unmeasured listing, order pins); `homeHandoff.test.ts` (text carries every
  finding + the framing line); `ask/__tests__/corpus.test.ts` additions; `launchPath.test.ts`
  stays green (store and engine reachable only behind dynamic `import()`).
- **Maestro** — `ghar-vastu-setup-smoke.yaml` (More → Vastu → मेरे घर → template 3BHK →
  manual facing → two rooms by chip → assessment shows a forbidden and an in-keeping row →
  back); `ghar-vastu-compare-smoke.yaml` (two considering homes → compare renders three
  columns). Live heading, tilt, haptics, image picking (F1) are device-only RC steps.

## 7. Stance guards (pinned, not vibes)

- `FORBIDDEN` in `vastuContent.test.ts` gains the score/remedy register: `/score/i`,
  `/\d+\s?%/`, `/अंक/`, `/rating/i`, `/needs? (fixing|attention)/i`, `/सुधार/`,
  `/expert/i`, `/विशेषज्ञ से/`. (`निषिद्ध`, `वर्जित`, `टालें` remain legal — they are the
  texts' own register.)
- Screen pins: no `Text` matching `/\d+ (of|में से) \d+/` or `/%/` on `GharVastuScreen` or
  the compare screen; the class enum has exactly five members; the group order is a frozen
  array; the compare screen renders no superlative (`/best|सर्वोत्तम घर|winner/i`).
- Data pin: `source`/`status`/`verificationNote` never reach renderable props (§22.8);
  `via` does (it is the user's own provenance).
- F2 pin (when built): the narrative filter drops any sentence without a valid finding id or
  with a `FORBIDDEN` token; a fixture with a smuggled remedy line yields zero rendered
  sentences from it.

## 8. Design and contract updates (same PRs, per `.claude/rules/design-doc-sync.md`)

- `design.md` §66 → §66.1 fused heading/tilt/hold (five-word status vocabulary, haptic +
  announcement rules); §66.2 pada ring; §66.3 weighted registry + mandala card; §66.4 setup /
  site-visit flow; §66.5 assessment screen (grid — the only reading — class strip, group anatomy, closing lines);
  §66.6 roster + compare; §66.7 plan canvas (F1); §66.8 AI pre-read/pointers consent sheet (F2).
- `RULEBOOK.md` §22: **rule 5 amended** — from "never a verdict" to "weighted convention read
  against the user's placements; five finding classes; no composite score/percentage/rank; no
  remedies/products/experts; classical register only"; rules 11–17 added: source ladder and
  no-prompt; tilt; the finding vocabulary and fixed order; roster privacy/NON-cache/export/cap;
  pada ring scope; templates are seeds not rules; the engine-judges-model-never rule with the
  citation filter. `docs/roadmap/README.md` "Constraint" gains the F2 exception pointing at
  the 2027 Stage-2 backend.
- `wiki/subsystems/vastu-disha.md` — Shape, Gotchas (OS true heading is −1 without location
  permission; registry order within a group is display order; the class enum is closed; the
  roster key is NON-cache) and Working rules, via the `llm-wiki` skill.

## 9. Sequencing and sizing

```
A1 fused heading + A3 grid            ████            M · OTA · pure trust win, ships alone
B1 types + weight + set-algebra tests ██              S · OTA · unblocks everything below
C2 roster store + C3 engine (pure)    █████           M · OTA · testable without a screen
E1 templates                          ██              S · OTA · data only
C1/E2 setup + C3 screen + C4 doors    ███████         L · OTA · the headline
E3 roster + compare · F0 handoff · C5 █████           M · OTA
A2 tilt · A4 hold/haptics/a11y        ███             S–M · OTA · polish after A1
B2 rows (≈24) + B3 mandala/padas      ░░░░░░░░░░      content-gated · parallel, data-only flips
A5 pada ring                          ░░░░██          after B3 verifies
F1 plan canvas (+ expo-image-picker)  ░░░░░░████      store release · pairs with the next native bump
F2 AI pre-read + pointers             ░░░░░░░░░░░░██  2027 Stage-2 backend (PRD-32) · design now
D deep-link target                    █               S · with C4
                                      └ ██ = buildable now   ░░ = gated
```

Recommended order: **A1+A3 → B1 → C2/C3 (pure) + E1 → setup/assessment screens → E3/F0/C5 →
A2/A4**, with B2/B3 verification running from day one and F1 riding the next store release.
With the ledger reading dropped (§C3 decision) the assessment screen is one layout; F1's
plan canvas reuses that grid as its toggle target, so C's store-release block is smaller than
first sized (M → S–M).
Each block is its own PR with its design.md / RULEBOOK / wiki deltas.

## 10. Open product decisions (block only what they gate)

1. **Per-class counts on the summary strip and roster** — this plan says yes (a buyer needs
   them); a composite number stays out. Gates the strip copy only.
2. **Weight of each candidate row** — assigned at verification from what the sources actually
   say; where sources split on weight, the row states the split. Gates individual flips.
3. **Template contents** (E1 table) — a seed list; confirm the per-BHK counts.
4. **Pada precision copy** — names only, no 11.25° arc in copy (RULEBOOK §22.7). Gates A5.
5. **Location ask inside Vastu** — A1 never prompts; a one-time explanatory ask is a copy +
   one-call change.
6. **F2 provider and cost model** — server-side config on the Stage-2 service; decide with
   PRD-32. **BYOK rejected here.**
7. **Deity-facing table and colours by direction** — excluded (split sources, commerce
   register); revisit only with a two-domain dossier.

## 11. Acceptance and release gates

1. All §6 suites green; `npm run lint` 0 errors; `tsc` clean; `npm test` exit code 0 (checked
   as `$?`, not the summary line).
2. Every new registry row is `draft` unless its two-domain note is present and dated;
   accessor and template tests prove invisibility.
3. Sensor-`unavailable` path completes a full 3BHK site visit by hand and renders the grouped
   assessment; compare renders with two hand-marked homes.
4. Maestro flows green on the isolated simulator recipe.
5. Device RC: fused vs magnetometer within one sector on two phones; tilt at ~20°; hold
   freezes; haptic ticks; (F1) picker → arrow → pins → assessment on one iPhone and one Android.
6. `design.md` §66.1–§66.8, RULEBOOK §22 (rule 5 amendment + 11–17), README constraint note,
   and the wiki page land in the same PRs as the code they describe.
7. A–E/F0 OTA at the live store runtime (1.4.8) with the next store version's `whatsNew`
   describing मेरा घर; F1 with the store release that adds `expo-image-picker`
   (`app.json` + `APP_TOUR_VERSION` + `whatsNew` triple bump); F2 only after the Stage-2
   backend exists and the §F2.5 eval gate passes.

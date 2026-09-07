# वास्तु दिशा (Vastu Disha) + गृह वास्तु (मेरा घर)

Live 8-dik compass + room-by-room classical vastu guidance + घर-का-मंदिर upkeep (PRD-24),
and — Phase 2 — the गृह वास्तु journey: capture a home's rooms on the 3×3 mandala
(drag-first), read them as weighted findings, keep a private roster (living + considering
homes), compare buyer candidates side by side, share the reading as text, ask about your
own home. Reached from the More hub (साधना group), the `मेरे घर` door on the compass
screen, and contextually from a गृह प्रवेश muhurat result.
Spec: `design.md` §66–§66.6 · contract: `RULEBOOK.md` §22 (rules 1–17) · PRDs:
`docs/roadmap/prds/24-vastu-disha.md`, `24-vastu-disha-phase2.md`.

## Shape

- **Pure math** — `mobile/src/vastu/compass.ts`: heading from a flat-portrait magnetometer
  sample (`atan2(-x, y)`), wrap-aware exponential smoothing (shortest arc), 45° dik
  sector mapping in the shared `DishaDirection` vocabulary, east-positive declination
  application, the 25–65 µT field-plausibility band, tilt-from-gravity
  (`tiltDegreesFromAccel`, 20° limit), and the door-pada wall math
  (`cardinalSideForHeading`, `padaForHeading` — 11.25°/pada, north arc wraps 0°,
  intercardinal facings null).
- **Sensor hook** — `mobile/src/vastu/useCompassHeading.ts`: the SOURCE LADDER
  (Phase 2 §A1) — `fused` (expo-location `watchHeadingAsync`: OS sensor fusion, true
  north when located, α=0.5) → `magnetometer` (Phase-1 raw path, α=0.25, plus the
  accelerometer tilt watch) → `none`. Status: `starting | ok | unreliable | tilted |
  unavailable`. Permission is only ever QUERIED. `useDikFeedback.ts` adds one haptic
  tick (≥400 ms) + one VoiceOver announcement (≥1.5 s) per faced-dik change.
- **Data** — `mobile/src/data/vastu/`: `roomGuidance.ts` (verified rooms + Phase-2 typed
  placement sets: `category`, `weight`, `alternateDirections`, `avoidDirections`,
  `facingWhileUsing`; 6 new rows still DRAFT), `mandirGuidance.ts`, `declination.ts`
  (394 per-city WMM values) + `declinationGrid.ts` (1°×1° WMM grid, 6–38°N/66–100°E,
  integer tenths, bilinear `getDeclinationForCoords`; combined coords-first
  `getDeclination`), `mandala.ts` (3×3 zones + dikpalas), `doorPadas.ts` (32 border
  padas, ALL four walls `draft`), `homeTemplates.ts` (seed lists, never layouts),
  `types.ts`.
- **Home record & engine** — `mobile/src/vastu/`: `homeRecord.ts` (HomeRecord/roster
  serde + validators; `doorPada` 1–32|null), `homeRecordStore.ts` (hydrate-once
  singleton + `useHomeRoster`, save-after-every-capture, NON-cache key
  `@vedansh:vastu-homes:v1`, cap 12), `assessHome.ts` (pure five-class engine,
  `FINDING_CLASS_ORDER` frozen), `homeHandoff.ts` (full-text share builder — the
  `kundaliHandoff` twin with a JSON model tail).
- **UI** — `components/DishaChakra.tsx` (SVG rose; optional `size`; optional `padaRing`,
  null while padas stay draft) · `components/VastuMandalaGrid.tsx` (reading + drag-first
  placement modes; a11y-grouped ONLY in reading mode) · `screens/VastuDishaScreen.tsx`
  (chakra, source-aware status, Hold pill, chips, `मेरे घर` door, guidance) ·
  `screens/GharVastu{Setup,,Roster,Compare}Screen.tsx` (3-step walk / the one reading /
  roster + compare) — all four loaded via `getComponent` require() thunks.
- **Ask** — `vastu.myhome` intent (possessive triggers; answers from the LIVING home
  supplied through `useAsk`'s context builder; abstains to a did-you-mean without one);
  possessive blockers on `vastu.direction`.

## Gotchas

1. **The sensor never gates content.** Simulators report no magnetometer —
   `unavailable` opens manual mode and every capture/guidance surface still renders
   (the whole गृह वास्तु walk is drivable by hand; that IS the e2e path).
2. **Phase 1 was store-gated; Phase 2 is OTA.** expo-sensors shipped native at 1.5.0.
   Everything Phase 2 adds (expo-location heading, expo-haptics, the journey) is JS
   over modules already in the shipped binary — OTA-safe at the current runtime.
3. **One dik vocabulary.** `DishaDirection`/`DISHA_ORDER`/`DISHA_LABELS` come from
   `panchang/eventMuhurat.ts`. Never mint a second direction enum; the Brahmasthan is
   `isCenter`/`'center'`, not a ninth dik.
4. **trueHeading is −1 without location permission** (iOS) — the fused rung then uses
   the OS magnetic heading + bundled declination. Android REJECTS `watchHeadingAsync`
   ungranted, so the rung is skipped there. Never call `request*` from the hook — the
   Panchang flow owns the prompt. An iOS-sim fused subscription resolves and then never
   emits: the 2 s watchdog falls to the magnetometer, else the dial hangs at `starting`.
5. **Declination sign & bounds.** East-positive (WMM): true = magnetic + declination.
   The grid stores INTEGER TENTHS, row-major lat-then-lon from 6°N/66°E; outside the
   box → null → silently magnetic (never invent a value). The per-city table is the
   grid's regression oracle (±0.2°, test-pinned).
6. **Draft rows are invisible, not styled.** The 6 Phase-2 room rows AND all 4
   `doorPadas.ts` walls are `draft` — verified-only accessors filter them; the pada
   ring simply doesn't render (facing-only, no placeholder). Each flip is a data-only
   OTA plus a deliberate move of the `draft ⇒ null` test pin.
7. **The roster key is USER DATA, not cache.** `@vedansh:vastu-homes:v1` is in
   `derivedCacheReset`'s MUST_SURVIVE list. Home data renders on the vastu screens and
   the `vastu.myhome` answer ONLY — never Home/Today, widgets or notifications.
8. **Frozen class order everywhere.** forbidden → differs → preferred-unmet →
   alternate → in-keeping → unmeasured; five pills always render (zero included); no
   total/percent/rank anywhere (`GharVastuScreens.test.tsx` sweeps rendered text).
9. **`at` is a sketch.** The drop point inside a cell ({fx,fy}) renders the user's
   mental map; it NEVER enters `classifyPlacement` — the engine reads `{roomId, zone}`
   alone.
10. **All vastu suites are Jest** (`src/vastu/__tests__`, `src/data/vastu/__tests__`,
    `src/screens/__tests__`); only `myhome.test.ts`/corpus (tsx `test:ask`) and
    `entryRoutes.test.ts` (tsx `test:data`) differ — new files there must join the
    hand-listed `test:data` command or they silently don't run.
11. **Launch-graph budget.** The GharVastu screens register via `getComponent`
    require() thunks in BOTH navigators — static imports put ~100 KB (screens + engine
    + grid) on every cold start and tripped `launchGraph.test.ts`.
12. **A11y grouping vs testability.** An `accessible` container swallows descendant
    pressables on iOS — the mandala grid groups only in reading mode so placement
    cells stay reachable (VoiceOver AND Maestro).
13. **मेरे घर door → the roster whenever a home exists.** Straight-to-the-one-home
    strands the user: only the roster owns `+ नया घर`.

## Working rules

- New room/element/pada entries follow RULEBOOK §22.3: two concordant independent
  published domains, a dated claim-level `verificationNote`, `variantNote` where
  traditions split. Rows ship `draft` and invisible until then.
- Compass math changes need `compass.test.ts` pins first (wrap smoothing, sector and
  pada-wall boundaries are the regression-prone spots); ladder changes need
  `useCompassHeading.test.tsx` pins (query-never-request is contractual).
- The stance guard is a test, not a vibe: `vastuContent.test.ts` +
  `GharVastuScreens.test.tsx` + `homeHandoff.test.ts` grep customer copy for the
  dosha/remedy/score register.
- The chip row reuses the muhurat finder's दिशा chip idiom — if that idiom changes in
  §60, change both.
- Maestro: `vastu-disha-smoke`, `ghar-vastu-setup-smoke`, `ghar-vastu-compare-smoke` —
  bottom-edge `scrollUntilVisible` needs `centerElement: true` (tab-bar mis-tap), and
  cell taps need a scroll-to-cell first (the step transition can leave the grid below
  the fold).

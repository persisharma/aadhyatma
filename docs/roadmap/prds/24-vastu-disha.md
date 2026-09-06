# PRD-24 — वास्तु दिशा · disha chakra, ghar-ka-mandir & murti placement

| | |
|---|---|
| **Status** | Phase 1 shipped in 1.4.8 (store). Phase 2 planned — see [24-vastu-disha-phase2.md](./24-vastu-disha-phase2.md) |
| **Origin** | `docs/roadmap/2026-Q4-candidates.md` §PRD-24 (number reserved there) |
| **Design** | `design.md` §66 |
| **Contract** | `RULEBOOK.md` §22 |
| **Release** | **Store release required** — `expo-sensors` is a new native module; cannot ship OTA |

## 1. Problem and outcome

The only दिशा in the app is travel disha-shool inside the muhurat engine. Nothing answers
the direction questions Indian households actually ask — at every move-in, rental,
renovation, and Diwali cleaning: which way should the mandir face; where does the tulsī
go; which direction should my head point when sleeping; what belongs in a home shrine
and what does not. These cluster around the griha pravesh the muhurat finder already
dates.

**Outcome:** a वास्तु दिशा surface with (a) a live 8-dik compass that is honest about its
own accuracy, (b) room-by-room classical guidance keyed to the direction being faced,
and (c) the घर-का-मंदिर upkeep set — reached from the More hub and contextually from a
griha-pravesh muhurat result.

## 2. Product principles

1. **Classical convention with its reason — never a verdict on someone's home.** No fear
   copy, no "vastu dosha detected", no remedy products, no upsell. Most people cannot
   move their kitchen; the register is *understanding*, with the traditional
   accommodation where one exists.
2. **The honest degraded state is part of the feature.** Magnetometers fail near rebar,
   wiring and appliances — precisely where this feature is used. The compass shows a
   visible accuracy state, a calibration hint, and a manual-direction fallback that
   keeps every guidance surface fully usable with the sensor off or absent.
3. **Direction vocabulary is shared, not duplicated.** The 8 dik ids, order and hi/en
   labels come from `eventMuhurat.ts` (`DishaDirection`, `DISHA_ORDER`, `DISHA_LABELS`)
   — one vocabulary for disha-shool and vastu.

## 3. True north (decision — closes Q4-candidates open decision #4)

**Per-city declination, bundled beside the existing city list; honest magnetic north as
the fallback.**

- `mobile/src/data/vastu/declination.ts` carries a WMM-2025 declination value for every
  bundled city (all `CITIES` ids — major cities + Rajasthan tehsils), generated from the
  BGS geomag web service (`scripts/generate-declination.md` records the method) on
  2026-08-27. Values across the list span −1.7° … +2.8°, so a fixed zero would be wrong
  by up to ~3° — more than the classical 45° sectors care about, but not honest.
- The compass corrects magnetic heading by the **selected panchang city's** declination
  (`usePanchangLocation()` → `cityId`), the same location the muhurat engine already
  uses. With a declination available the readout is true north; the correction is
  silent (sub-degree UI copy would be false precision).
- Secular variation over the list is ≤ ~0.2°/yr; the table regenerates per WMM epoch —
  the regen method doc pins this.

## 4. Phased scope

### Phase 0 — sensor spike (folded into Phase 1)

The two Q4-candidate risks were resolved in code rather than a throwaway spike:
true north per §3; indoor accuracy per the `useCompassHeading` contract — field-magnitude
sanity check (Earth's field is 25–65 µT; outside that band the state is `unreliable`),
a "hold flat, away from metal" calibration hint while unreliable, and a manual override
that never expires. On simulators and devices without a magnetometer the hook reports
`unavailable` and the screen opens directly in manual mode.

### Phase 1 — दिशा चक्र + guidance (this build)

- **दिशा चक्र** — `react-native-svg` compass: 8 dik + open Brahmasthān centre, the rose
  rotating under a fixed top needle; centre shows the faced dik and rounded degrees.
  Accuracy state line (`ok` / `unreliable` / `unavailable` / manual).
- **Room-by-room guidance** — puja room (ईशान; deity facing west so the worshipper faces
  east), kitchen (आग्नेय), main door, sleeping head-direction, tulsī, toilet/utility,
  Brahmasthān — each entry: the classical convention, its stated reason, and the
  traditional accommodation where one exists. The entry matching the faced (or manually
  chosen) direction surfaces first; the full list follows.
- **घर का मंदिर** — upkeep guidance the app has never covered: what belongs in a home
  shrine and what does not, murti condition and count conventions, where ancestor
  photographs go (and why not inside the mandir), diyā and water discipline.
- **Doors:** a More-hub row (साधना group), and a contextual door on a griha-pravesh
  muhurat result. `VastuDisha` registers on both the More and Panchang stacks so each
  door pushes in place and Back retraces the journey (the PRD-19 multi-stack pattern).

### Phase 2 — planned (2026-09-04)

Compass-overlay floor sketching, per-room saved layouts, and a griha-pravesh checklist
tie-in were explicitly out of Phase 1; nothing in the Phase 1 data shapes assumes them.
The Phase 2 plan — fused/tilt-honest heading, the complete household registry with each
rule's weight (निषेध · विधान · श्रेयस्), the mandala zones and 32 door padas, the private मेरा घर
roster with a five-class no-score assessment, a buyer/renter site-visit mode with home-type
templates and comparison, floor-plan mark-up, and an AI pre-read layer for the 2027 Stage-2
backend — lives in [`24-vastu-disha-phase2.md`](./24-vastu-disha-phase2.md). Parts A–E ship
OTA at the 1.4.8 runtime; the plan amends RULEBOOK §22.5 (weighted findings, still no score).

## 5. Source method and release gate

Guidance rows follow the RULEBOOK §10-family discipline as adapted by §22: every entry
carries ≥2 independent published reference domains and a dated verification note in a
review-only `source` block that is never rendered. Entries whose conventions are stated
concordantly across sources ship `verified`; contested or regionally split claims either
state the variance in the row itself or stay `draft` (draft entries are invisible —
verified-only accessors, the §20/§21 pattern).

**Store-release gate:** `expo-sensors` requires a native build. Per the repo gotcha the
release that carries this feature bumps `app.json` version + `APP_TOUR_VERSION` together
and adds a `whatsNew` entry (done in this build: 1.5.0). No OTA push may include this
feature at the old runtime.

## 6. Surfaces

- **VastuDishaScreen** — ReaderHeader (index variant); दिशा चक्र; accuracy line +
  calibration hint; 8 direction chips (manual override, `muhurat-disha-*` chip idiom);
  faced-direction guidance card; रूम-दर-रूम list; घर का मंदिर section.
- **More hub** — साधना group row "वास्तु दिशा / Vastu Disha", `testID="more-vastu-disha"`.
- **MuhuratResultsScreen** — griha-pravesh only: a quiet ListCard door below the results
  ("नए घर की वास्तु दिशा देखें"), pushing `VastuDisha` in place on the Panchang stack.

## 7. Non-goals

No dosha detection or scoring of a home; no remedies or products; no floor-plan capture;
no per-degree precision claims (the classical unit is the 45° sector); no AR. The
compass never blocks guidance — every content surface works with the sensor absent.

## 8. Acceptance and release gates

1. Unit: heading math (wrap-aware smoothing, sector mapping, declination application),
   registry invariants (bilingual fields, ≥2 source domains, draft invisibility, copy
   guard — no fear words), declination table covers every bundled city id.
2. Screen: sensor-`unavailable` path opens manual mode with full guidance rendered.
3. Maestro: More → वास्तु दिशा → manual chip → guidance visible (+ door assertions).
4. `npm run lint` at 0 errors; `tsc` clean; design.md §66 + RULEBOOK §22 in the same PR.
5. Store release ships it; the OTA channel must not (runtime mismatch).

## Verification records

- **2026-08-27 — Phase 1 build.** Declination table generated from BGS WMM-2025 for all
  bundled city ids (394 rows, 0 fetch errors, range −1.74° … +2.76°). Unit + screen
  suites and lint/typecheck run green in this workspace.
- **2026-08-28 — e2e + stale-runtime hardening.** `vastu-disha-smoke.yaml` runs green on
  the iOS simulator (dev client + isolated Metro): More door → sections render →
  south-east chip → kitchen guidance leads → back. The first run exposed a real
  hazard: requiring the expo-sensors barrel on a binary that predates it initialises
  every sensor class and redboxes (`Cannot find native module 'ExponentPedometer'`) —
  `useCompassHeading` now probes `requireOptionalNativeModule` before touching the
  barrel and degrades to `unavailable`. Device verification of the LIVE compass
  (headings, calibration states) remains a release-candidate step — simulators have no
  magnetometer, so the manual path is what CI can see. Full gates green: `npm test`
  exit 0 (166 Jest suites / 1279 tests + engine 77 + widgets/data tsx suites),
  `npm run lint` 0 errors, `tsc` clean.

# वास्तु दिशा (Vastu Disha)

Live 8-dik compass + room-by-room classical vastu guidance + घर-का-मंदिर upkeep (PRD-24).
Reached from the More hub (साधना group) and contextually from a गृह प्रवेश muhurat result.
Spec: `design.md` §66 · contract: `RULEBOOK.md` §22 · PRD: `docs/roadmap/prds/24-vastu-disha.md`.

## Shape

- **Pure math** — `mobile/src/vastu/compass.ts`: heading from a flat-portrait magnetometer
  sample (`atan2(-x, y)`), wrap-aware exponential smoothing (shortest arc), 45° dik
  sector mapping in the shared `DishaDirection` vocabulary, east-positive declination
  application, and the 25–65 µT field-plausibility band.
- **Sensor hook** — `mobile/src/vastu/useCompassHeading.ts`: expo-sensors Magnetometer
  behind the honest-accuracy contract (`starting | ok | unreliable | unavailable`).
  `unreliable` needs 5 consecutive implausible samples (no flapping at a door frame);
  the dial keeps moving while the calibration hint shows. Corrected to TRUE north by
  the selected panchang city's declination.
- **Data** — `mobile/src/data/vastu/`: `roomGuidance.ts` (7 room entries: puja room,
  kitchen, main door, sleeping, tulsi, toilet, brahmasthan), `mandirGuidance.ts` (4
  entries; ancestor-photos row is DRAFT), `declination.ts` (394 per-city WMM values,
  regen via `mobile/scripts/generate-declination.md`), `types.ts`.
- **UI** — `components/DishaChakra.tsx` (SVG rose rotating under a fixed needle; the
  open centre labelled ब्रह्मस्थान) + `screens/VastuDishaScreen.tsx` (chakra, status
  line, 8 manual chips, faced-direction guidance first, room list, mandir section).

## Gotchas

1. **The sensor never gates content.** Simulators report no magnetometer —
   `unavailable` opens manual mode and every guidance surface still renders. Never add
   a surface that requires a live heading.
2. **expo-sensors is native.** This feature CANNOT ship OTA — store release only, with
   the `app.json` + `APP_TOUR_VERSION` + `whatsNew` triple bump (done at 1.5.0). An OTA
   publish at the old runtime would crash on the missing native module.
3. **One dik vocabulary.** `DishaDirection`/`DISHA_ORDER`/`DISHA_LABELS` come from
   `panchang/eventMuhurat.ts` (shared with यात्रा disha-shool). Never mint a second
   direction enum; the Brahmasthan is `isCenter`, not a ninth dik.
4. **Manual chip semantics.** A chip tap pauses the sensor (subscription removed, not
   just ignored); tapping the ACTIVE chip returns live — except when the sensor is
   `unavailable`, where manual is all there is.
5. **Stance guard is a test, not a vibe.** `vastuContent.test.ts` greps customer copy
   for the dosha/remedy/fear register. The naksha source pages carry a "remedy"
   register — the registry deliberately does not copy it.
6. **Declination sign.** East-positive (WMM): true = magnetic + declination. India's
   bundled range is −1.7°…+2.8°; an unknown cityId silently stays magnetic (never
   invent a value).
7. **Draft rows are invisible, not styled.** The ancestor-photos mandir entry is
   `draft` pending its second published domain — accessors filter it; no screen may
   special-case it.

## Working rules

- New room/element entries follow RULEBOOK §22.3: two concordant independent published
  domains, a dated claim-level `verificationNote`, `variantNote` where traditions split.
- Compass math changes need `compass.test.ts` pins first (wrap smoothing and sector
  boundaries are the regression-prone spots).
- The chip row reuses the muhurat finder's दिशा chip idiom — if that idiom changes in
  §60, change both.

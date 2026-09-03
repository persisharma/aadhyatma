# PRD-43 — प्रवासी · Vedansh beyond India (world locations & honest civil days)

> *A family in Leicester opens the app and is told Rahu Kaal in Rajkot. The label looks right, the number is wrong by five hours, and nothing on the screen says so.*

| | |
|---|---|
| **Status** | Proposed — Q4 2026 slate: **Phase 0 + Phase 1 this quarter (OTA)**, Phase 2 in Q1 2027 |
| **Parent** | [2026-Q4-roadmap.md §2.2 / §3](../2026-Q4-roadmap.md) |
| **T-shirt size** | L overall; P0 = XS, P1 = M, P2 = M |
| **Delivery** | P0/P1 pure JS + bundled data, OTA. P1 bumps `PANCHANG_DAY_CACHE_VERSION` (solves change) and `observanceCache` `CACHE_VERSION` is untouched (matching does not change; new cities have no prior scan). P2 touches the widget extension bridge → rides a store release. |
| **Feasibility** | ✅ The engine already takes `civilTimeZone` (`engine.ts` `civilParts`/`civilStart`, used in production by the widget writer); `Intl.DateTimeFormat` with `timeZone` is proven in-app on both platforms. What is missing is a product boundary, not astronomy. |
| **Prototype** | owed — the P0 honest state, the world tier in the picker, and one abroad day card |

**Bundle-only:** a curated city table with IANA zone ids ships in the binary; `Intl` does DST. No
geocoding service, no time-zone API, no network.

---

## 1. Problem

Three facts in source, read together:

1. `panchang/locations.ts`: *"India-only for v1: the engine and the precomputed observance table…"*.
   The location universe is 52 national cities + 342 Rajasthan tehsils + 18,466 pincodes — all in India.
2. `PanchangLocationContext` snaps a GPS fix with `snapToNearestLocation(lat, lon)` — **whichever
   Indian pincode or city is geometrically nearest**, with no bound on the distance. From Dubai that is
   a Gujarat coast pincode; from London or New York it is whichever Indian point happens to minimise
   great-circle distance. The row then shows that Indian label.
3. `panchangDayStore` declares `civilTimeZone?: never` — the scope key models `(location,
   calendarSystem)` only, so the whole app solves the **device's** civil day against an **Indian**
   coordinate.

The consequences for a user outside India are not cosmetic:

- **Sunrise, Rahu Kaal, Choghadiya, Abhijit** are for a place thousands of kilometres away —
  off by the longitude difference plus the time-zone offset. The Today strip, Daily Muhurat, the
  finder's windows and every muhurat reminder inherit it.
- **The udaya tithi that names today's observance** can differ by a day between India and the
  Americas (a tithi ending at 09:00 IST ended *yesterday evening* in New York). Ekadashi, Sankashti
  moonrise, Karwa Chauth's moon — the app names the wrong evening.
- **Kundali** offers only Indian birth cities, so a child born abroad cannot have a chart;
  **Guna Milan and Namkaran** interpret birth time as IST regardless of where the person was born.
- **Widgets** are IST-anchored by design (PRD-15), so a widget in Toronto rolls its day at 13:30 local.

Nothing in the UI discloses any of this. Diaspora households are among the most devoted users this
category has — they are the ones who *need* an almanac because there is no temple down the road
announcing the tithi — and the competitor almanacs that serve them do so by computing for the local
city. The engine can already do that; the product refuses to.

## 2. Goal

**Phase 0 — stop being wrong silently** (week 40, OTA). **Phase 1 — be right for the places the
diaspora actually lives** (December, OTA). **Phase 2 — be right about people born abroad and on the
home screen** (Q1 2027, store).

Success = no device outside India is ever served an Indian location without saying so; a chosen world
city produces sunrise/tithi/observances for *that* city's civil day; widgets and Jyotish follow in P2.

## 3. What ships

### 3.1 Phase 0 — the honest state (OTA, XS)

- `snapToNearestLocation` gains a **distance bound**: a fix farther than `SNAP_MAX_KM` (recommend
  120 km — comfortably inside India's coverage where both tiers exist, outside it nowhere) from every
  bundled point returns `null` instead of a snap. `PanchangLocationContext` maps `null` to a new
  **`outside-coverage`** state: the location row reads **"भारत के बाहर? शहर चुनें"** / *"Outside India?
  Choose a city"*, the previously chosen city stays in force **and is labelled as such** on the Today
  strip and the Panchang card kicker (*"उज्जैन के लिए"* in the muted meta register — never implied to
  be "here"). No panchang surface changes its numbers in P0; the change is that the numbers are
  attributed.
- Device time zone ≠ `Asia/Kolkata` is used as a **soft hint only** — it surfaces the P0 copy on the
  picker's empty state (a traveller in Dubai with an Indian city chosen is fine; a resident should be
  told there is a better option once P1 exists). Never a decision input: a zone is not a place.
- A local counter records `outside-coverage` so P1's adoption can be measured against it.

### 3.2 Phase 1 — the world tier (OTA, M)

**Data — `panchang/worldCities.ts`.** A third bundled tier, *curated*, ~300 rows: every city with a
significant Hindu diaspora plus national capitals, chosen from published diaspora-population lists
(the source list and its date are recorded in the file header, the Rajasthan-tehsil precedent). Each
row is a `City` with the two new optional fields:

```ts
timeZone?: string;   // IANA id — 'Europe/London'. Absent ⇒ 'Asia/Kolkata' (every existing row unchanged)
country?: { code: string; nameHi: string; nameEn: string };  // the picker's group + the row's second line
```

`nameHi` is **hand-authored Devanagari** (लंदन · न्यूयॉर्क · टोरंटो · दुबई · सिंगापुर · सिडनी · नैरोबी · पोर्ट लुइस
· काठमांडू · कोलंबो…) — the pincode tier's lesson: no machine Latin→Devanagari. Elevation from a
published value per city; coordinates from GeoNames. `location.test.ts` gains: every world row has a
`timeZone` that `Intl` accepts; `|lon/15 − zoneOffsetHours(at a fixed winter instant)| ≤ 3`; unique
ids `w-<country>-<slug>`; unique coordinates; Devanagari `nameHi`.

**Picker.** `LocationPickerModal` gains a third labelled group **विश्व · World** under the two Indian
groups, rows `<city> · <country>`, searched by `cityMatchesQuery` extended to country in both scripts.
The pincode field is unchanged (India-only, clearly labelled). GPS: a fix outside coverage now snaps
to the nearest *world* city if within `SNAP_MAX_KM` (a diaspora metro list is dense where the users
are), else the P0 honest state persists with the picker opened to the World group.

**Engine plumbing — the one real change.**
- `City.timeZone` becomes the *only* source of `civilTimeZone` for a solve: `computePanchangForDate`
  callers pass `location.timeZone` (absent ⇒ undefined ⇒ device-local, today's behaviour, so **every
  Indian city solves exactly as before**).
- `panchangDayStore`'s `ScanOptions` drops `civilTimeZone?: never` in favour of **deriving the zone
  from the location** — the scope key stays `(cityId, calendarSystem)` because the city determines
  the zone, and the day key is the city's civil date. The widget writer's explicit
  `civilTimeZone: WIDGET_TIME_ZONE` remains the one caller allowed to override (it stays IST until P2)
  and the type makes that explicit rather than forbidden. `PANCHANG_DAY_CACHE_VERSION` → 4.
- `useMuhurat`, `usePanchang`, the finder scan, the observance scan for non-Ujjain cities
  (`observanceStore`), `upvasParana`, `tithiAtMoonrise`/`tithiAtMadhyahna`, `shubhYogasForDate` and
  the Pitru/janma solvers all already flow through `computePanchangForDate` with a location — they
  inherit the zone. **Pitru Smaran deliberately keeps the engine default** (a shraddha tithi does not
  move with the user's city — the recorded gotcha), and this PRD does not change that.
- "Today" on a today-surface is **the chosen city's civil today**, computed with `Intl` in the city
  zone; a traveller whose device is in Dubai with London chosen sees London's day. The Today strip
  kicker names the city in the meta register whenever `city.timeZone` differs from the device zone.

**Reminders.** The festive and vrat families currently take dates from the location-less table
(Ujjain). For a world city, P1 switches both to the location-aware scan (the same `observanceStore`
path Indian non-Ujjain cities use), so Diwali's notification fires on London's Diwali. Fire instants
are already absolute. The muhurat family already re-derives per location.

**Polar guard.** `useMuhurat`'s existing `null` on `sunset ≤ sunrise` becomes a **named state**
("इस अक्षांश पर आज सूर्योदय/अस्त परिभाषित नहीं") rather than an indefinite skeleton — Oslo and Edmonton
in midsummer are now reachable cities.

### 3.3 Phase 2 — born abroad, and the home screen (Q1 2027, store)

- **Kundali birth city**: the birth-city sheet gains the World group; `useKundali`'s IST→UTC
  conversion becomes zone-aware from the chosen city (`birthProfileToInput` carries `timeZone`; the
  roster parser adds the optional field — the one roster schema change this PRD owns, coordinated with
  PRD-44 सङ्कल्प per PRD-29 §5). Lagna for a London birth becomes possible.
- **Guna Milan / Namkaran**: an optional birth **zone** beside the IST default; the unknown-time
  enumeration runs over that zone's civil day. Convention docs gain the sentence.
- **Widgets**: `WIDGET_TIME_ZONE` follows the chosen city's zone; the snapshot's `timeZone` field
  already exists in the payload (PRD-15 §), so the native side needs only to honour it — the store
  release is the extension bridge.
- **Reading-language names** for the world tier in gu/kn flow through the normal `contentByLang` path
  from the hand-authored Devanagari.

## 4. Where it lands (surfaces)

Location picker (third group; P0 empty-state copy) · Today strip + Panchang kicker attribution line ·
Muhurat glance/detail (city name when zone ≠ device) · Kundali birth-city sheet (P2) · Guna Milan /
Namkaran birth-details form (P2) · widget snapshot (P2) · जिज्ञासा intents `location.set`
("लंदन का पंचांग", "set city to Toronto") resolving to the picker pre-filtered.

## 5. Data model

- `City.timeZone?`, `City.country?` (P1) — additive; absent on every existing row.
- `@vedansh:panchang-location` stores the world city id like any other id (`w-gb-london`);
  `parseStoredLocation` validates structurally as it does for `pin-` ids. **Never rename an id.**
- `BirthProfile.timeZone?` (P2) — additive; absent ⇒ IST, so every saved profile is unchanged.
- No new user-state key. `outside-coverage` counters live in the existing local-metrics pattern.

## 6. Conventions — decided here

- **Civil day = the chosen city's civil day, in its zone, with the city's sunrise.** The udaya-vyapini
  and per-rule `dayRule` conventions (RULEBOOK §23) apply unchanged in the local frame — this is what
  published diaspora panchangs do, and it is the only reading under which "Ekadashi is today" and the
  app's own parana time can agree.
- **DST is `Intl`'s job.** No offset tables of our own; the zone id is the only stored fact.
- **India rows carry no zone** on purpose: the absence is what keeps 18,860 existing locations
  byte-identical in behaviour and in the persisted day cache after the version bump.
- **Distance bound over bounding box.** A bbox test would still snap Kathmandu or Colombo to India;
  the bound handles every case with one number, and the World tier's density where users live keeps
  the bound small.

## 7. Open decisions

1. **City list** — curated ~300 (recommended, roadmap §7 №5) vs GeoNames ≥ 100k. Label quality and
   Devanagari authoring decide it; the long tail is P2 material.
2. **`SNAP_MAX_KM`** — 120 km recommended; needs a sweep test showing no Indian pincode/city pair
   exceeds it inside coverage.
3. **Precomputed table for a second anchor city?** The Ujjain table exists for launch speed. World
   cities scan at runtime like non-Ujjain Indian cities (persisted, versioned). Recommend no second
   table in P1; revisit if the first-scan cost on a slow Android is felt.
4. **Attribution copy** — the P0 line is the most brand-defining string here; it must say "for
   Ujjain" without implying the user did something wrong.

## 8. Non-goals

- No reverse geocoding, no map, no arbitrary lat/lon entry (a coordinate without a place has no
  `nameHi` and no zone the user can verify).
- No per-country festival variants (regional calendars remain amanta/purnimant + the shipped rules).
- No change to Pitru Smaran's engine-default anchoring.
- No translation of UI or content into new languages (PRD-45 owns scripts).

## 9. Risks

| Risk | Mitigation |
|---|---|
| A wrong zone on one row (worse than no row) | `Intl` acceptance + longitude-band + fixed-instant offset tests per row; data file header records sources |
| Cache version bump collides with festival-week OTAs | P1 is sequenced to December (roadmap §4.3) |
| Reminder families switching to location-aware scans for world cities changes copy/dates for Indian users | Gated on `city.timeZone` present — Indian behaviour unchanged, test-pinned |
| Hermes `Intl` zone coverage on some Android OEM builds | The widget writer already depends on it in production; add a launch-time probe that falls back to the P0 honest state if a zone is unsupported |
| First observance scan for a world city on a slow device | Same persisted `observanceStore` path Indian non-Ujjain cities use; chunked, behind `InteractionManager` |
| Users who *want* the Indian tithi while abroad (a family keeping the home village's day) | The Indian tier remains selectable; the attribution line tells them which they have — the choice is theirs, stated |

## 10. Tests & release gates

- **Engine (tsx):** `worldCities.test.ts` (row invariants), `dayCacheParity.e2e.test.ts` extended
  with one world city × both systems over a year, a London and a New York **golden** for a handful of
  dates (sunrise, tithi, one Ekadashi, Karwa Chauth moonrise) against a published diaspora panchang —
  recorded as owed if egress blocks it, exactly as the drikfixture debt was.
- **Jest:** `PanchangLocationContext.test.tsx` gains outside-coverage GPS → P0 state, world snap,
  attribution rendering; picker group + search cases.
- **E2E:** `world-location-smoke.yaml` — picker → World → London → Today strip shows लंदन → Panchang
  card renders; P0 state assertable by clearing location and asserting the empty-state copy.
- **Docs in the same PR:** `design.md` §33 (location picker: third group, attribution line, P0
  copy), §48 (Today strip kicker), new **§73 प्रवासी**; `RULEBOOK.md` §23 (civil-day frame) + a new
  **§27 world-city row contract** (fields, zone tests, no-rename rule). `PANCHANG_DAY_CACHE_VERSION`
  bump recorded in the panchang wiki page.

## 11. Why it fits

The app's whole stance is *show the working, never a confident wrong answer* (PRD-41 §3). Today, for
every user outside India, it gives a confident wrong answer with no working shown. P0 fixes the
honesty in a week; P1 fixes the answer with data the engine was already built to take.

# PRD-42 — क्षेत्रीय पर्व · The Regional, Sampradaya & Jain Calendar

| | |
|---|---|
| **Status** | **Wave 1 shipped 2026-09-06** (§14 build record) — 17 observances, data only, no new mechanism. **Waves 2–5 proposed.** Wave 2 (the lens) is the gate: waves 3–5 are content that has nowhere to live until it exists. |
| **Trigger** | Sept 2026 user report: *"A lot of important dates like Goga Navami missing from calendar. Do a check for all Rajasthani and Bihari related dates. Also let's plan something around Jain specific or regional category too from different states."* |
| **Owner surface** | Panchang tab (design.md §33) — no new tab, no new Home category, no new notification family. |
| **T-shirt size** | W1 **S** (done) · W2 **M** (one rule field, one preference, one filter, a bigger table, four surfaces) · W3 **M** content + S code · W4 **L** content, 5 lenses · W5 **M** code (nakshatra rule types) + M content |
| **Delivery** | OTA-safe throughout: TypeScript + bundled data. No native dependency, no backend, no migration. `CACHE_VERSION` bump per wave. No `PANCHANG_DAY_CACHE_VERSION` bump in W1–W4 (nothing in `DayInputs` moves); W5's nakshatra-in-solar-month solver may need one — decide when it is written. |
| **Contract** | RULEBOOK **§23a** (adding an observance — written by W1) · **§23** (vyapini day selection) · **§21** (bhog) · **§20** (upvas) · **§19/§26** (vidhi, arcs) · **§11** (content integrity) · **§25** (ask intents) · design.md **§33** |
| **Prototype owed** | W2 lens sheet + the Observance Detail lens caption. Two frames; not yet drawn. |

> **Locked decisions (do not drift).**
> ① **The app never asks a user to declare a religion, caste or community.** A lens is a *calendar* the user turns on, seeded silently from the city they already chose. Everything stays findable through search whether a lens is on or off.
> ② **A lens only ever ADDS.** It never hides a universal observance. Subtraction is a religion question wearing a filter's clothes.
> ③ **A lens filters presentation only.** The precomputed table carries every rule, so toggling is instant, offline and re-runs no scan.
> ④ **Nothing here changes an existing rule's tithi, month, paksha or `dayRule`** — the one exception is §5.1, which is its own separately-verified change and must never ride a content wave.
> ⑤ **No new notification family, and nothing joins the default-on festive catalog.** A lensed observance reaches reminders the way every other one does: ★ follow.
> ⑥ **Where two lineages differ, both ship, both named.** Never one as "the" date.

---

## 1. The problem

### 1.1 What the audit found

The Sept 2026 check covered every Rajasthani and Bihari/Maithil observance a household would expect, against the 118-rule catalog as it then stood. It found two layers, and the second one is the reason the gap felt larger than "one missing festival".

**Twelve observances were absent outright** — Goga Navami, Ramdev Jayanti, Teja Dashami, Shitala Ashtami, Dasha Mata, Chaiti Chhath, Madhushravani, Sama Chakeva, Chitragupta Puja, and the three pan-Hindu gaps the same sweep surfaced (Kartik Purnima, Chaitra Navratri, Mahavir Jayanti).

**Five more shipped a katha but no date.** गणगौर · सकट चौथ · शीतला सप्तमी · बछ बारस · आशा दशमी each had a full bilingual katha *and* a verified bhog profile in the binary while their rule was `hidden()` / `ruleType: 'catalog-only'` — no `lunarMonth`, no `tithi`. `resolveRuleDates` returns `[]` for those, so the app could tell you the story of Gangaur and could not tell you when Gangaur was.

### 1.2 Why this is structural, not a content backlog

Three mechanisms, not three oversights:

1. **`hidden()` looks like "ship it quietly" and actually means "ship it dateless."** The helper sets `recurrence: 'catalog'` + `ruleType: 'catalog-only'`, and the matcher short-circuits on both — *even when the seed carries a tithi* (`ashoka-ashtami` does, and still resolves to nothing). Nothing in the type system or the tests distinguished "deliberately undateable" (`chaturmasa`) from "we never got round to the tithi".
2. **`visibility: 'regional'` is a trapdoor, not a label.** `getObservanceCatalog()` returns `default` only and **no surface anywhere passes `includeHidden`**. So the one field that reads like "this is a regional festival" is, in effect, delete. It is currently carrying `karthigai-vrat` and `rohini-vrat` — two real observances that render nowhere.
3. **There was no contract for adding an observance at all.** RULEBOOK §23 said which *day* a rule lands on and nothing about what it takes to add one. W1 wrote §23a to close that.

### 1.3 The scale of what is still missing

The catalog after W1 is **130 rules, 116 default-visible, 4,482 precomputed date rows** — and it is still, structurally, a North-Indian purnimant calendar. Appendix A registers **63 further candidate observances** across eleven traditions. Some of the absences are large by any measure: **Rath Yatra** is missing, **Onam** is missing, **Kali Puja** is missing, **Vat Purnima** is missing (the app ships only the northern Amavasya form of Vat Savitri), and the entire **Jain** calendar past Mahavir Jayanti is missing.

Adding all 63 to the universal catalog would take a typical day in Bhadrapada from ~4 observances to ~9, most of which no single household keeps. That is the actual product problem this PRD exists to solve, and it is why W1 stopped at 17.

## 2. The bet

A devotional calendar earns trust by being **the household's** calendar, not a national average. The bet is that we can go deep on eleven traditions **without** making the Panchang tab unreadable for anyone, because the app already knows the one fact that predicts almost all of it: the city the user chose in the very first session.

Success looks like a Maithil family seeing Sama Chakeva and Jur Sital where they expect them; a Jain family seeing Paryushana as an eight-day arc with Samvatsari at its close; a Malayali family seeing Onam; and a user in Ujjain seeing exactly what they see today.

## 3. Product principles — the stance guards

1. **No identity question, ever.** Not at onboarding, not in settings, not as a "personalise your calendar" card. The lens is seeded from the city and is a plain list of calendars with checkboxes.
2. **A lens adds; it never subtracts.** A Jain household still sees Janmashtami. (Open decision 2 keeps a record of why we considered otherwise and rejected it.)
3. **Search is lens-blind.** `searchObservances` always searches the whole catalog. A user must never be unable to *find* a festival because a checkbox is off — only unable to see it uninvited on a day.
4. **Both lineages, both named.** Śvetāmbara Paryushana and Digambara Das Lakshan are two observances that abut, not variants of one. Purnimant and amanta forms of the same vrat get their own names where they genuinely differ (Vat Savitri vs Vat Purnima).
5. **Sources or silence (§11.1).** Two independent published sources per rule, or the rule does not ship. A mela date that three sources disagree about stays out — Appendix B is the register of exactly that.
6. **A folk deity is a deity.** Gogaji, Tejaji, Ramdevji, Khatu Shyamji, Chhathi Maiya, Manasa and Sama-Chakeva get the same `deityHi`/`deityEn` treatment, the same content depth and the same respect as the pan-Hindu names. No "folk" or "minor" language anywhere in user-facing copy.
7. **No score, no ranking, no "your festivals".** A lensed day renders identically to a universal day. There is no "for you" badge and no personalisation language.

## 4. Architecture — the lens

### 4.1 Data model (`panchang/types.ts`, `festivals.ts`)

```ts
export type ObservanceLens =
  | 'rajasthan' | 'bihar-mithila' | 'maharashtra-konkan' | 'gujarat'
  | 'bengal-odisha' | 'punjab-haryana' | 'tamil' | 'kerala'
  | 'telugu-kannada' | 'assam-northeast'
  | 'jain';

export type ObservanceRule = {
  // …
  /** Absent ⇒ UNIVERSAL: shown to everyone, exactly as today. */
  lens?: ObservanceLens[];
};
```

Three rules about the field, all test-pinned:

- **`lens` is additive metadata on rules that would otherwise not ship at all.** It is **not** a retagging of wave 1. Gangaur, Chhath and Goga Navami stay universal: they are kept by tens of millions, their `shortDescription*` already names the region, and demoting them behind a switch would take away exactly what the report asked for.
- **A rule gets a lens only when showing it to everyone is genuinely noise** — Navpad Oli, Sama Chakeva's nine intermediate days, Bathukamma, Attukal Pongala, Champa Shashthi.
- **`visibility: 'regional'` is retired** in the same change. Its two occupants become `default` + a lens and get real rule types (§5.3). Leaving the value in the union with no occupants is how it grows a third occupant next year.

### 4.2 The preference, and seeding without asking

`@vedansh:panchang-lenses` — a `Set<ObservanceLens>` serialised as a sorted comma list, read in the **same `multiGet`** as location and calendar system (`panchangPrefs.ts`). Empty set = today's behaviour, byte for byte.

`panchangPrefs.ts`'s header documents why that file exists — the launch path may not grow a serial round trip — so the lens read joins the existing batch and adds **zero** round trips. Its launch-path isolation rules are inherited unchanged: no `expo-*`, no React, and the 700 KB pincode table stays behind its lazy require.

**Seeding is silent and post-launch.** The user already chose a city. On the first Panchang entry after the update, *after interactions settle*:

- a bundled-city id → its `stateCode` (new field, §9 W2-3) → the matching lens;
- a `pin-` id → the pincode table already carries `stateEn`/`stateHi`, and that table is loaded lazily here anyway;
- Ujjain, the default nobody chose → **no seed**. A default is not a signal.

The user sees one dismissible line above the day panel — *"राजस्थान के पर्व भी दिख रहे हैं · बदलें"* / *"Rajasthan's festivals are showing too · Change"* — never a modal, never an onboarding step. `jain` is **never** auto-seeded from anything; it is only ever a deliberate tap.

### 4.3 The read path and the precomputed table

The filter runs at **read**, not at scan:

- `resolveObservancesForYearLive` and `gen-precomputed-observances.mts` scan **every** rule, lensed included. `festivalEngine`'s module-scope `defaultRules` must widen or the generator silently drops them — the single most likely bug in this wave, and it fails open (missing dates, green tests), so it gets its own test.
- `resolveObservancesForYear` applies the active lens set after the table read, before the per-year memo. **The memo key must include the lens set**, or turning a lens on mid-session serves the pre-filter list.
- `getObservancesForDateKey` reads the raw table directly (the widget/notification path) and needs the same filter applied at its own call site.
- `searchObservances` and `getRuleById` ignore lenses entirely (principle 3).

**Table growth.** ≈4.5k rows today → ≈9k at the full 63. Measure the bundle delta in the W2 PR. If it matters, split the lensed years into a lazily-required sibling module keyed the same way — **do not** answer a size problem by dropping the precompute and scanning live on a render path; that scan is precisely what the precomputed table exists to prevent (wiki `[[panchang]]`, the "Panchang screen froze" incident).

### 4.4 What must not be lensed

- **`dayAnga.ts`'s notification-title picker keeps its universal-only gate.** It already filters to `visibility === 'default'`; it must additionally exclude any rule carrying a `lens`, regardless of the user's set, until the scheduler can read the preference. A lensed observance titling a stranger's lock screen is the worst failure mode this feature has.
- **The widget snapshot** (`planPayload.ts`) takes the filtered list, but the 14-day payload is written by a background coordinator that may run before the preference hydrates — it must read the lens set through the same store, never a default.
- **`festiveReminders.ts`** does not change at all (principle: RULEBOOK §23a.9).

### 4.5 Surfaces

Everything downstream of `resolveObservancesForYear` needs no change: the day panel, the month grid's `पर्व`/`व्रत` tags, आगामी, the Vrat & Parv catalog counts, Observance List, the Home Today strip, the ask engine's date intents. Four surfaces do change:

| Surface | Change |
|---|---|
| Panchang header (`PanchangScreen.tsx`) | A **`क्षेत्र · Calendars`** chip beside the location chip → the lens sheet. Shows a count badge when any lens is on. |
| **Lens sheet** (new, `LensPickerSheet.tsx`) | The `LocationPickerModal` shell: eleven rows, each a name + a one-line example (*"गणगौर, गोगा नवमी, तेजा दशमी"*) + a checkmark. Grouped `राज्य · By state` / `सम्प्रदाय · By tradition`. No search, no "select all". |
| Observance Detail (`ObservanceDetailScreen.tsx`) | A quiet lens caption under the deity line — `राजस्थान · Rajasthan` — so a user can always see *why* a day is on their calendar. Absent on universal rules. |
| Seed notice (`PanchangScreen.tsx`) | The one dismissible line of §4.2, persisted dismissed at `@vedansh:panchang-lens-seen`. |

## 5. Engine work these waves depend on

Four items. Each is independently shippable and each gates specific content.

### 5.1 `dayRule: 'pradosh'` — gates Bachh Baras, Vasubaras, Vagh Baras, Dhanteras, Diwali

The three-part job RULEBOOK §23.7 names: the enum value; a `tithiAtPradosh` instant solver in `engine.ts` (the pradosh window opens at sunset — gate it on the expected tithi index exactly like `tithiAtMoonrise` / `tithiAtMadhyahna`, so a year scan pays ~50 solves and not 365 per rule); and published-date tests across several years. It reuses `matchesInstantVyapiniRuleOnDate` unchanged.

It closes the `bachh-baras` shift W1 shipped knowingly (§14). **It must not retag `dhanteras` and `diwali` in the same PR as any content wave** — those two move the single most-viewed date in the app and deserve a change whose entire diff is that decision.

### 5.2 `ruleType: 'solar-offset'` — gates Jur Sital, Lohri, Aadi Perukku

A solar ingress plus a fixed civil-day offset: `{ solarLongitude, solarDayOffset: number }`. `findSolarFestivalDate` already memoises the ingress day per rule per year; the offset applies to its result. Jur Sital is Mesha Sankranti **+1**, Lohri is Makar Sankranti **−1**, Aadi Perukku is Karka Sankranti **+17**.

### 5.3 Nakshatra rule types — gates the `tamil`, `kerala` and `assam-northeast` lenses

`ruleType: 'nakshatra'` is in the type union and **nothing resolves it** — `karthigai-vrat` and `rohini-vrat` are `catalog-only` in practice. Two solvers are needed, and they are different problems:

- **`nakshatra-in-lunar-month`** — Krittika in Kartika (Karthigai Deepam), Rohini each lunar month (the Jain Rohini Vrat, ~12–13 a year). Straightforward: the existing per-day nakshatra is already solved by `computeTithiAndMonth`'s neighbours.
- **`nakshatra-in-solar-month`** — Thiruvonam in Simha (Onam), Pushya in Makara (Thai Pusam), Uttara Phalguni in Meena (Panguni Uthiram), Pooram in Medam (Thrissur Pooram). This needs the **solar** month, which the engine derives only as sankranti instants today. Build it as a small `solarMonthForDate` helper over the cached ingress table rather than a second month engine.

This is the largest of the four and should be its own PR with its own convention doc (`docs/roadmap/conventions/nakshatra-rules-v1.md`), because the vyapini question repeats here: Onam is the day Thiruvonam prevails at *sunrise*, Thai Pusam at *the nakshatra's own peak* in some almanacs.

### 5.4 Per-rule month system — gates Sama Chakeva, Kali Puja, Bengali rules

`ObservanceRule.monthSystem` is declared on the type and plumbed through `createRule`, and then **no rule sets it and no matcher reads it** — `monthForRuleInSystem` shifts every krishna-paksha rule by the user's toggle with no per-rule escape. Several regional rules are reckoned in a fixed system whatever the user chose (Mithila is purnimant; the Bengali and southern reckonings are amanta). Wire the matcher to honour an explicit `monthSystem: 'purnimant' | 'amanta'`, keep `'both'` meaning today's behaviour, and audit every existing rule for whether it needs one (Open decision 3). Like `lens`, a field that exists and is never read is a field that will be set wrongly the first time someone reaches for it.

### 5.5 Regional arcs reuse PRD-28, and add nothing

Paryushana, Das Lakshan, Navpad Oli, Ashtahnika, Bathukamma, both Chhaths, Sama Chakeva's nine days, Madhushravani's fortnight and Gangaur's eighteen days are **arcs**. `ARC_DEFINITIONS` in `panchang/arcs.ts` already models an observance seen across days with a sthapana and a close, an occurrence-scoped user choice and a reminder that rides the vrat family. Adding them means adding definitions — never a second multi-day mechanism, and never a fabricated rule to make a strip look complete (RULEBOOK §26.6).

Two get a *duration choice* like Ganesh Utsav (the family decides): none. Every one of these has a fixed close. That simplifies the arc definitions to the Navratri/Diwali shape.

## 6. Content depth — what each new observance actually gets

A rule is the floor, not the deliverable. Each observance in waves 3–5 is graded, and the grade is declared in the wave's PR:

| Tier | What ships | Applies to |
|---|---|---|
| **T1 — dated** | Rule + bilingual `shortDescription*` + `searchTerms` + `deityHi/En` | Every observance. The W1 bar. |
| **T2 — + food** | `bhogId` → a verified `BhogContentEntry` (RULEBOOK §21) | Every `vrat`/`upavas` rule — **enforced**, `bhogContent.test.ts` fails otherwise |
| **T3 — + fast** | `upvasId` → a verified `UpvasInfoEntry` (§20) | Observances whose defining act is a fast: Paryushana, Samvatsari, Chaiti Chhath, Jitiya, Vat Purnima |
| **T4 — + story** | `kathaId` → a bilingual `KathaContentEntry` | Observances with a household katha: Sama Chakeva, Bihula-Bishahari, Dasha Mata, Nuakhai |
| **T5 — + procedure** | `vidhiId` → a `VidhiEntry`, verified-or-invisible (§19/§26) | Only where a published, instruction-level sequence exists. Expect **very few**. |

**T5 is where this PRD is most likely to overreach.** §11.3 forbids generated liturgy, §26.2 makes a draft vidhi invisible in code, and regional puja sequences are exactly the material for which two concordant published sources are hardest to find. Plan every wave to be shippable at T1–T2 and treat T4/T5 as follow-ons.

## 7. Phasing

| Wave | What ships | Gated by | Size |
|---|---|---|---|
| **W1** ✅ | 17 universal observances (Rajasthan, Bihar/Mithila, 3 pan-Hindu) + RULEBOOK §23a | — | S |
| **W2** | The lens: field, preference, seeding, filter, sheet, caption. Ships with **zero lensed rules** — a mechanism with a visible no-op, verified by the two W1 `regional` rules converting | — | M |
| **W3** | **Jain lens** — 11 observances, 2 Paryushana arcs, Rohini Vrat fixed. Needs §5.3's simpler solver | W2, §5.3a | M |
| **W4** | **Five state lenses** that need no new rule type: `maharashtra-konkan`, `gujarat`, `bengal-odisha`, `punjab-haryana`, `telugu-kannada` — ~31 observances, 2 arcs | W2, §5.1, §5.2, §5.4 | L |
| **W5** | **Three nakshatra lenses**: `tamil`, `kerala`, `assam-northeast` — ~13 observances | W2, §5.3b | M+M |
| **W6** | Rajasthan/Bihar depth: the mela arcs (Gangaur 18 days, Ramdevra, both Chhaths, Madhushravani, Sama Chakeva) + the Appendix B re-verification pass | W2, §5.5 | M |

W2 is deliberately a no-op release. Shipping the mechanism separately from the first content that uses it is what lets the filter, the seeding and the widget/notification gates be verified against a calendar whose dates nobody's household depends on yet.

## 8. Metrics — bundle-only, as always

There is no analytics SaaS and no backend (roadmap README, *Constraint*). Three honest instruments:

1. **Build-time coverage**, printed by an extended `verify:observances`: for each lens, the number of days in a calendar year carrying ≥1 observance, and the number of *distinct* observances. The W1 → W6 target is Rajasthan 40+, Bihar/Mithila 30+, Jain 25+, each state lens 15+.
2. **Universal-day load**, the counter-metric that keeps this feature honest: the mean observances per day with **no lens on** must not move from its W1 value (±0). A regression here means something was tagged universal that should have been lensed.
3. **The ask engine's unanswered log** (PRD-41 §7.2, on-device, user-shared) is the only field signal we get. A named festival that shows up there repeatedly is the next wave's input — the same loop `aliases.ts` already grows on.

## 9. The complete build inventory

Everything this PRD will build, by wave. **N** = new file, **M** = modified.

### W2 — the lens mechanism

| # | Item | Files |
|---|---|---|
| W2-1 | `ObservanceLens` type + `lens?` on `ObservanceRule`; retire `visibility: 'regional'` | M `panchang/types.ts` |
| W2-2 | `getObservanceCatalog({ lenses })`; convert `karthigai-vrat` + `rohini-vrat` off `regional` | M `panchang/festivals.ts` |
| W2-3 | `stateCode?: StateCode` on `City`; tag 52 major cities; Rajasthan tehsils tagged at generation | M `panchang/locations.ts`, `panchang/rajasthanTehsils.ts`, M `scripts/build-*` if tehsils are generated |
| W2-4 | Lens preference in the launch `multiGet`; store + hydration + `useLenses()` | M `panchang/panchangPrefs.ts`, M `panchang/panchangLaunchPrefetch.ts` |
| W2-5 | Lens filter at the read path; lens set in the memo key | M `panchang/festivalEngine.ts` |
| W2-6 | Widen the live scan + generator to all rules | M `panchang/festivalEngine.ts`, M `scripts/gen-precomputed-observances.mts` |
| W2-7 | Regenerate the table; `CACHE_VERSION` 4→5; measure and record the bundle delta | M `panchang/precomputedObservances.ts`, M `panchang/observanceCache.ts` |
| W2-8 | Seeding from city/pincode after interactions; `@vedansh:panchang-lens-seen` | N `panchang/lensSeeding.ts` |
| W2-9 | The lens sheet | N `components/LensPickerSheet.tsx` |
| W2-10 | Header chip + count badge + the dismissible seed line | M `screens/PanchangScreen.tsx` |
| W2-11 | Lens caption on the detail hero | M `screens/ObservanceDetailScreen.tsx`, M `components/ObservanceDetailHero.tsx` |
| W2-12 | Notification-title gate: exclude any lensed rule | M `notifications/dayAnga.ts`, M `notifications/dayAngaResolver.ts` |
| W2-13 | Widget payload reads the lens set through the store, never a default | M `widgets/planPayload.ts` |
| W2-14 | Catalog counts + list respect lenses; search does not | M `panchang/vratCatalog.ts`, M `screens/ObservanceListScreen.tsx` |
| W2-15 | Lens names/examples in the ask lexicon so *"राजस्थान के पर्व"* resolves | M `ask/lexicon.ts`, M `ask/aliases.ts`, M `ask/__tests__/corpus.ts` |
| W2-16 | **Tests** — filter on/off across day·month·upcoming·catalog·widget·notification; memo-key correctness; seeding table; launch-path round-trip count; `regional` fully retired | N `panchang/__tests__/lens.test.ts`, N `components/__tests__/LensPickerSheet.test.tsx`, M `observances.test.ts`, M `notifications/__tests__/*`, M `widgets/__tests__/planPayload.test.ts` |
| W2-17 | **e2e** — turn a lens on, see a day gain an observance, turn it off, see it go | N `.maestro/lens-smoke.yaml` |
| W2-18 | **Docs** — design.md §33 lens block + §72 the sheet; RULEBOOK §23a.5 rewritten now that `regional` means something; wiki `[[panchang]]` | M `design.md`, M `RULEBOOK.md`, M `wiki/subsystems/panchang.md`, M `wiki/log.md` |

### W3 — the Jain lens

| # | Item | Files |
|---|---|---|
| W3-1 | 11 rules (Appendix A.1), each with two sources in-comment | M `panchang/festivals.ts` |
| W3-2 | `rohini-vrat` → a real monthly nakshatra rule | M `panchang/festivals.ts`, M `panchang/festivalEngine.ts` |
| W3-3 | Two arcs: `paryushana` (Śvetāmbara, 8 days → Samvatsari), `das-lakshan` (Digambara, 10 days → Anant Chaturdashi) | M `panchang/arcs.ts` |
| W3-4 | Sibling-day rules: Mahavir Nirvana ≡ `diwali`, Veer Nirvana Samvat ≡ `govardhan-puja`, Maun Ekadashi ≡ `mokshada-ekadashi`, Das Lakshan close ≡ `anant-chaturdashi` | M `panchang/festivals.ts` |
| W3-5 | T2 bhog: a `jain-parva-bhog` profile (and the Paryushana fast's own) | M `panchang/bhogContentExtended.ts` |
| W3-6 | T3 upvas: Paryushana / Samvatsari / Ayambil — fast type, window, parana | N `panchang/upvasContent/entries/*.ts`, M `panchang/upvasContent/index.ts` |
| W3-7 | Deity/glyph: Bhagwan Mahavir + Parshvanath in the deity registry if content warrants (§11.8 background image obligation applies — **do not** add a deity without one) | M `data/deities.ts`, M `data/backgrounds.ts`, M `components/deityGlyphs/` |
| W3-8 | **Tests** — published dates, arc occurrences, sibling days, both lineages distinct, bhog/upvas gates | M `observanceDates.test.ts`, M `arcs.test.ts`, M `upvasContent.test.ts`, M `bhogContent.test.ts` |
| W3-9 | **Docs** — design.md §33 wave list, this PRD's Appendix A marked shipped | M `design.md`, M this file |

### W4 — five state lenses

| # | Item | Files |
|---|---|---|
| W4-1 | `pradosh` dayRule (§5.1), applied to `bachh-baras` + Vasubaras + Vagh Baras **only** | M `panchang/types.ts`, `panchang/engine.ts`, `panchang/festivalEngine.ts` |
| W4-2 | `solar-offset` ruleType (§5.2) → Lohri, Jur Sital | M `panchang/types.ts`, `panchang/festivalEngine.ts` |
| W4-3 | Per-rule `monthSystem` honoured (§5.4) + an audit of every existing rule | M `panchang/festivalEngine.ts`, M `panchang/festivals.ts` |
| W4-4 | ~31 rules across the five lenses (Appendix A.2–A.6) | M `panchang/festivals.ts` |
| W4-5 | Two arcs: `bathukamma`, `ganesh-utsav` Maharashtra day labels | M `panchang/arcs.ts` |
| W4-6 | T2 bhog for every new `vrat`/`upavas` — expect ~8 new profiles (Vat Purnima, Nuakhai, Shitala Satam, Jayaparvati, Atla Tadde, Nagula Chavithi, Kali Puja, Labh Pancham) | M `panchang/bhogContentExtended.ts` |
| W4-7 | T4 katha where a household story exists: Nuakhai, Dasha Mata (backfill), Bihula-Bishahari | N `panchang/kathaContent/entries/*.ts`, M `panchang/kathaContent/index.ts`, M `festivals.ts` KATHA_CATALOG |
| W4-8 | Regenerate + `CACHE_VERSION` 5→6; diff by rule id | M `precomputedObservances.ts`, M `observanceCache.ts` |
| W4-9 | **Tests** per §12; a `pradosh` published-date suite across 5 years | M `observanceDates.test.ts`, N `panchang/__tests__/pradoshDayRule.test.ts` |
| W4-10 | **Docs** — VERIFICATION.md Class B shrinks (bachh-baras leaves it) | M `src/panchang/VERIFICATION.md`, M `design.md` |

### W5 — the nakshatra lenses

| # | Item | Files |
|---|---|---|
| W5-1 | Convention doc — vyapini rule per nakshatra observance, sources, reviewer | N `docs/roadmap/conventions/nakshatra-rules-v1.md` |
| W5-2 | `nakshatra-in-lunar-month` solver | M `panchang/engine.ts`, `panchang/festivalEngine.ts` |
| W5-3 | `solarMonthForDate` + `nakshatra-in-solar-month` solver | M `panchang/engine.ts`, `panchang/festivalEngine.ts` |
| W5-4 | ~13 rules (Appendix A.7–A.9) incl. Onam, Karthigai Deepam, Thai Pusam, Kati Bihu, Ambubachi | M `panchang/festivals.ts` |
| W5-5 | Onam as an arc (Atham → Thiruvonam, 10 days) | M `panchang/arcs.ts` |
| W5-6 | Possible `PANCHANG_DAY_CACHE_VERSION` bump if the solar-month solve enters `DayInputs` — decide, don't default | M `panchang/panchangDaySerde.ts` |
| W5-7 | **Tests** — row-for-row against the convention doc; published dates 2025–2028 | N `panchang/__tests__/nakshatraRules.test.ts` |

### W6 — Rajasthan/Bihar depth

| # | Item | Files |
|---|---|---|
| W6-1 | Five arcs: Gangaur 18 days, Ramdevra Bhadva 2→11, Chhath ×2 (4 days each), Madhushravani fortnight, Sama Chakeva 9 days | M `panchang/arcs.ts` |
| W6-2 | Appendix B re-verification: Dhinga Gavar, Khatu Shyam Phalgun Mela, Kaila Devi, Salasar, Bihula-Bishahari, Sonepur | M `panchang/festivals.ts` (only what clears §11.1) |
| W6-3 | T4 katha backfill: Goga, Tejaji, Ramdevji — three of the most-told stories in Rajasthan and the app has none of them | N `panchang/kathaContent/entries/*.ts` |
| W6-4 | Chhath 4-day arc labels (Nahay-Khay · Kharna · Sandhya Arghya · Usha Arghya) — the single highest-value arc in the whole PRD | M `panchang/arcs.ts` |

### Cross-wave, every wave

Regenerate `precomputedObservances.ts` and diff by rule id · bump `CACHE_VERSION` · extend `verify-observances.mts` `ANNUAL` + `ANCHORS` · pin published dates in `observanceDates.test.ts` · sibling-day assertions · design.md §33 + this file + `wiki/subsystems/panchang.md` + `wiki/log.md` · one Maestro flow, date-independent.

## 10. Non-goals

- **No Sikh Gurpurabs.** The Nanakshahi calendar is a different reckoning, not a lens over this engine. Kartik Purnima ships as Kartik Purnima; if Guru Nanak Jayanti is ever added it is its own PRD with its own calendar.
- **No Islamic, Christian, Parsi or Buddhist calendars.** Same reason. (Buddha Purnima ships because it is a Vaishakha Purnima tithi.)
- **No multi-language UI.** A lens changes *which observances*, never the app's language. Regional-language names ride `searchTerms` and the existing hi/en/gu/kn scheme.
- **No per-observance toggles**, no "hide this festival", no favourites-as-filter.
- **No location-derived automatic behaviour beyond the one-time seed.** Travelling does not change anyone's calendar (Open decision 1).
- **No festive-reminder catalog change.** Ever, in this PRD.
- **No temple/mela ticketing, timings, live darshan or travel content.** A mela is named inside an observance's description; it is not a feature.

## 11. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **The generator silently drops lensed rules** (`defaultRules` not widened). Fails open: tests green, dates missing. | A test that resolves a known lensed rule *through the precomputed table*, not the live scan. W2-16. |
| R2 | **A lensed observance titles a stranger's notification** — the worst failure mode here. | Two independent gates (`dayAnga` excludes any `lens`, and the scheduler filters), each with its own test. W2-12. |
| R3 | **Bundle size.** 63 rules × 8 years × 2 systems. | Measured in W2 before any content lands; lazy sibling module is the pre-agreed answer (§4.3). |
| R4 | **Content verification is the real cost, not code.** 63 observances × 2 sources × bilingual copy. | Tier the depth (§6). Ship T1–T2 and let T4/T5 follow. A wave that cannot clear §11.1 ships fewer rules, never thinner sources. |
| R5 | **Sect and regional disputes** — Digambara vs Śvetāmbara dates, purnimant vs amanta, Drik vs local panchang. | Principle 4 + `variantNote` in every source block + §5.4's per-rule month system. Where sources genuinely conflict, Appendix B, not a guess. |
| R6 | **Seeding feels like profiling.** A user in Patna opens the app and sees "Bihar's festivals are showing". | One dismissible line, never a modal; the copy names the *city*, not the person; `jain` never auto-seeds; Open decision 4 tests the copy. |
| R7 | **Universal-day creep** — each wave quietly tags something universal because it feels famous. | Metric 2 in §8 is a hard gate: mean observances/day with no lens on must not move. |
| R8 | **W5's solar-month solver leaks into `DayInputs`** and forces a `PANCHANG_DAY_CACHE_VERSION` bump nobody planned. | W5-6 makes it an explicit decision with its own line item. |

## 12. Verification & release gates

Per wave, on top of RULEBOOK §23a:

1. Two independent published sources per rule; the second in a code comment beside the published civil date used to pin it. A search-result snippet is not a source.
2. Published civil dates in `observanceDates.test.ts` for ≥1 year per rule, plus the once-a-year invariant 2024–2031.
3. A row in `verify-observances.mts` `ANNUAL` with the rule's **real** muhurta — including a muhurta the engine does not model, so the shift is reported every run rather than forgotten.
4. Sibling-day assertions for every rule sharing a tithi with a shipped rule.
5. Precomputed table regenerated and diffed **by rule id**: only new ids, **no existing date moved**. Stated in the PR.
6. `CACHE_VERSION` bumped.
7. `bhogContent.test.ts` count updated and every new `vrat`/`upavas` carrying a verified profile, hooked both directions.
8. `npm test` green (typecheck + widgets + readers + engine + data + ask), `npm run lint` at 0 errors, `npm run verify:observances` with `wrong-month=0`.
9. One date-independent Maestro flow per wave; device run recorded, not assumed.
10. design.md §33 + this PRD + `wiki/subsystems/panchang.md` + `wiki/log.md` in the same PR.

**W2 additionally:** lens-filter tests across all six consumers; the notification gate test; a launch-path test proving the preference adds no round trip; a test proving `visibility: 'regional'` has no occupants left.

## 13. Open decisions

1. **Does a seeded lens ever un-seed when the user changes city?** Proposal: **no**. A lens is sticky once shown — a week in Chennai should not delete someone's Rajasthani calendar. Changing city may *offer* an additional lens, once.
2. **Should a lens ever suppress a universal rule?** Proposal: **no** (principle 2). Recorded because it will be re-proposed: a Jain household does not keep Janmashtami, and it is still not our place to remove it.
3. **Which rules need a forced `monthSystem`?** Sama Chakeva and Madhushravani are Maithil-purnimant; the Bengali and southern entries are amanta-reckoned. Needs a per-rule audit before W4, including a re-check of the seventeen W1 rules.
4. **The seed copy.** *"राजस्थान के पर्व भी दिख रहे हैं"* names a state at a user who never named one. Alternative: *"आपके पंचांग में राजस्थान के पर्व जोड़े गए हैं · बदलें"*. Decide with the W2 prototype.
5. **Does the lens sheet belong in Panchang's header or in More?** Header is where the calendar-system toggle lives and is the right neighbour; More is where preferences live. Proposal: header, because it changes what the screen in front of you shows.
6. **Onam's vyapini rule** — sunrise-prevailing Thiruvonam, or the nakshatra's peak? Sources differ. Blocks W5; belongs in the convention doc, not in a rule.

## 14. Build record — Wave 1 (2026-09-06)

**Shipped:** 17 observances, data only, no new mechanism, all universal.

- **Rajasthan (10):** गोगा नवमी (Bhadrapada K9) · रामदेव जयंती (Bhadrapada S2) · तेजा दशमी (Bhadrapada S10) · बछ बारस (Bhadrapada K12)* · गणगौर (Chaitra S3)* · शीतला सप्तमी (Chaitra K7)* · शीतला अष्टमी·बसोड़ा (Chaitra K8) · दशा माता व्रत (Chaitra K10) · सकट चौथ (Magha K4, `chandrodaya`)* · आशा दशमी (Ashadha S10)*
- **Bihar / Mithila (4):** चैती छठ (Chaitra S6) · मधुश्रावणी (Shravana S3) · सामा-चकेवा (Kartika S7) · चित्रगुप्त पूजा (Kartika S2)
- **Pan-Hindu gaps the same audit surfaced (3):** कार्तिक पूर्णिमा (Kartika S15) · चैत्र नवरात्रि प्रारंभ (Chaitra S1) · महावीर जयंती (Chaitra S13)

`*` = promoted from a `catalog-only` rule that already shipped a katha and a bhog profile.

**Aliases, not rules:** जलझूलनी / देव झूलनी ग्यारस and मौन एकादशी on the existing Ekadashis (`EKADASHI_EXTRA_SEARCH_TERMS`); सतुआनी · बैसाखी · बोहाग बिहू · पोहेला बोइशाख · पुथांडु · विषु on Mesha and पोंगल · खिचड़ी पर्व · उत्तरायण on Makar (`SANKRANTI_ALIASES`).

**Also landed:** RULEBOOK **§23a** (the ten-point contract for adding an observance, which did not exist); design.md §33's regional-coverage block; `observances.test.ts`'s source-host allowlist widened from Drik-only to the §11.1 set actually used; the `devi-vrat-bhog`, `shitala-bhog` and `chhath-bhog` profiles extended to name their new members; `verify-observances.mts` extended by 16 rules and 21 anchors; `CACHE_VERSION` 3→4; `.maestro/regional-parv-smoke.yaml`.

**Known shift, shipped knowingly:** `bachh-baras` resolves at sunrise (8 Sep 2026) where Drik publishes pradosh-vyapini (7 Sep 2026), while the popular Hindi almanacs reasoned from sunrise for 2025 and agreed with the engine. No convention invented from one contested data point; pinned by a named test and a `pradosh` row in `verify-observances.mts`, and reported in the Class B list every run. §5.1 closes it.

**Verification:** 2,049 tests green, lint 0 errors, `verify:observances` `wrong-month=0`, precomputed table diffed — 17 ids added, **no existing date moved**.

---

## Appendix A — the candidate register

Every observance found by the audit and not yet shipped. **These tithis are what the sources consulted for this plan agree on — they are candidates, not a verified table.** Each becomes a rule only after its own §11.1 pass.

### A.1 `jain` — 11 (W3)

| Observance | Tithi | Tier | Note |
|---|---|---|---|
| पर्युषण पर्व (Śvetāmbara) | Bhadrapada K12 → S4 | T3 | **Arc**, 8 days |
| संवत्सरी | Bhadrapada S4 | T3 | Closes Paryushana; 15 Sep 2026 |
| दस लक्षण पर्व (Digambara) | Bhadrapada S5 → Anant Chaturdashi | T2 | **Arc**, 10 days; close ≡ `anant-chaturdashi` |
| क्षमावाणी | Ashvina K1 | T1 | Day after Anant Chaturdashi |
| ज्ञान पंचमी | Kartika S5 | T1 | Śvetāmbara |
| महावीर निर्वाण | Kartika Amavasya | T1 | Sibling of `diwali` |
| वीर निर्वाण संवत् नववर्ष | Kartika S1 | T1 | Sibling of `govardhan-puja` |
| मौन एकादशी | Margashirsha S11 | T2 | Sibling of `mokshada-ekadashi`; alias already shipped |
| पौष दशमी (पार्श्वनाथ जन्म कल्याणक) | Pausha K10–11 | T1 | |
| नवपद ओली | Chaitra & Ashvina S7–15 | T3 | **Arc ×2**, 9 days each |
| अष्टाह्निका पर्व | Kartika / Phalguna / Ashadha S8–15 | T1 | **Arc ×3** |
| *(fix)* रोहिणी व्रत | Rohini nakshatra, monthly | T2 | Exists; resolves nowhere (§5.3) |

### A.2 `maharashtra-konkan` — 7 (W4)

गुड़ी पड़वा (Chaitra S1, lensed name for a universal tithi) · **वट पूर्णिमा** (Jyeshtha S15 — the app ships only the northern Amavasya Vat Savitri) · आषाढ़ी एकादशी/वारी (Ashadha S11, alias on Devshayani) · दीप अमावस्या·गटारी (Ashadha Amavasya) · पोळा (Shravana Amavasya) · वसुबारस (Kartika K12, `pradosh`) · चंपा षष्ठी (Margashirsha S6)

### A.3 `gujarat` — 5 (W4)

रांधण छठ (Shravana K6) · शीतला सातम (Shravana K7) · **जयापार्वती व्रत** (Ashadha S13 — *another* `catalog-only` rule with a katha and no date: the §1.1 defect again) · लाभ पंचम (Kartika S5) · वाघ बारस (Kartika K12, `pradosh`)

### A.4 `bengal-odisha` — 8 (W4)

**रथ यात्रा** (Ashadha S2) · उल्टा रथ (Ashadha S10) · स्नान यात्रा (Jyeshtha S15) · **काली पूजा** (Kartika Amavasya, sibling of `diwali`) · जगद्धात्री पूजा (Kartika S9) · नुआखाई (Bhadrapada S5) · कौशिकी अमावस्या (Bhadrapada Amavasya) · रज पर्व (Mithuna Sankranti-based)

### A.5 `punjab-haryana` — 2 (W4)

लोहड़ी (Makar Sankranti − 1, needs §5.2) · सांझी (Ashvina Navratri)

### A.6 `telugu-kannada` — 5 (W4)

उगादि (Chaitra S1, lensed name) · **बतुकम्मा** (Bhadrapada Amavasya → Ashvina S9, **arc**) · बोनालु (Ashadha) · नागुल चविति (Kartika S4) · अट्ल तद्दे (Ashvina K3)

### A.7 `tamil` — 6 (W5)

कार्तिगई दीपम (Krittika in Kartika — `karthigai-vrat` exists and resolves nowhere) · तै पूसम (Pushya in Makara) · पंगुनी उत्तिरम् (Uttara Phalguni in Meena) · आदि पेरुक्कु (Karka Sankranti + 17, §5.2) · आदि पूरम् · चित्रा पौर्णमी (Chaitra S15)

### A.8 `kerala` — 5 (W5)

**ओणम** (Thiruvonam in Simha, **arc** Atham → Thiruvonam) · तिरुस्सूर पूरम् (Pooram in Medam) · अट्टुकाल पोंगाल (Pooram in Kumbham) · मण्डल पूजा / मकरविलक्कु (Makar, alias) · कर्किडक वावु (Karka Amavasya)

### A.9 `assam-northeast` — 2 (W5)

काति बिहू (Kartika Amavasya) · अम्बुबाची (Ardra in Mithuna)

### A.10 `rajasthan` / `bihar-mithila` depth — 12 (W6)

Five arcs (Gangaur 18 days · Ramdevra Bhadva S2→S11 · Chhath ×2 four-day · Madhushravani fortnight · Sama Chakeva nine days) · जुड़ शीतल (Mesha Sankranti + 1, §5.2) · plus the Appendix B entries that clear re-verification · T4 kathas for Goga, Tejaji and Ramdevji.

**Two more `catalog-only` rules with a katha and no date** were found alongside the five W1 promoted, and belong to whichever wave reaches them first: **अशोक अष्टमी** (Chaitra S8 — the seed already *carries* the tithi and `hidden()` throws it away, which is §1.2's point 1 in one line) and **जयापार्वती व्रत** (Ashadha S13, A.3). A sweep for any remaining `hidden()` rule whose seed carries `lunarMonth`+`tithi` should run in W2 and be turned into a lint, not a memory.

## Appendix B — found, deliberately not shipped

| Observance | Why not |
|---|---|
| बिहुला-बिषहरी (Anga/Bhagalpur, Manasa) | Reckoned on the Anga solar calendar; published dates disagree with each other. §11.1 not satisfied. |
| धींगा गवर (Jodhpur) | Sources place it differently relative to Holi and to Vaishakha. Needs a Jodhpur-specific authority. |
| खाटू श्याम फाल्गुन मेला | The Lakkhi Mela spans Phalguna S9–S12 and the "main" day is reported inconsistently. A mela span is an arc, not a tithi. |
| कैला देवी मेला · सालासर मेला · पाबूजी जयंती | Mela dates, single-source. |
| सोनपुर मेला | Opens on Kartik Purnima (shipped) and runs for weeks — a fair, not an observance. |
| Sikh Gurpurabs | Nanakshahi calendar — §10. |
| मे-डैम-मे-फी (Ahom) | Fixed Gregorian date, not a panchang observance. |

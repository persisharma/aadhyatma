# PRD-46 — आज खोजें · Explore Sheet (launch discovery of unvisited sections)

| | |
|---|---|
| **Status** | **Prototype + plan. Design review in progress.** No app code yet. The cadence is decided (§2). Five questions are open (§9). Two independent reviews are complete. The rebuttal round and the Codex review have not run yet (§10–§11). |
| **T-shirt size** | Phase 1 (visit ledger, silent): S–M · Phase 2 (sheet + 6 preview kinds): M · Phase 3 (remaining 7 previews + context boosts): M. |
| **Parent** | design.md §32 DISCOVER carousel (awareness), §47 onboarding surfaces (tour · setup sheet · What's New), RULEBOOK §6.2 (auto-opening surfaces, no-stacking contract). |
| **Prototypes** | [`docs/explore-sheet-prototype.html`](../../explore-sheet-prototype.html): in-phone launch flow with a simulated clock, drag-to-dismiss and interactive previews. [`docs/explore-sheet-gallery-prototype.html`](../../explore-sheet-gallery-prototype.html): all 16 sheets side by side, in hi/en. [`docs/explore-sheet-plan-prototype.html`](../../explore-sheet-plan-prototype.html): the selection-rule simulator and visit ledger, plus the build plan. |
| **Feasibility** | JS + AsyncStorage only. **Every phase ships OTA.** No native module. |

> **Design intent.** On launch, a bottom sheet rises over Home and previews **one section this user has never opened**. The preview shows real content from that section. One tap opens the section. The sheet stops appearing once every section has been visited.

---

## 0. Read first

1. **No visit ledger exists.** `UserActivityContext` logs verse reads and japa beads. `NewContentContext` logs which individual texts were opened. "Has this user ever opened Kundali?" cannot be answered today. Phase 1 builds that record.
2. **Existing users start with an empty ledger.** If the sheet ships with the ledger, day one suggests sections people use daily. So ship the ledger **one OTA before** the sheet, and seed it from data people already have: routines, japam counter, reading progress, sankalps, Pitru records, vrat follows, daan ledger, Kundali profiles.
3. **A launch pop-up goes against a decision already made.** The rating prompt lost its cold-start trigger in Sept 2026 because it interrupted whatever the user opened the app to do (RULEBOOK §6.2). This sheet ships only with the guards in §4: one auto-opening surface per launch, never on a notification, widget or deep-link launch, a daily limit, and an off switch.
4. **Preview data must stay off the launch path.** The temple registry and other preview sources are kept out of Home's static import graph (launch-budget test). The sheet's component and its preview data load only after the gate decides to open.
5. **Success cannot be measured today.** Meta app events cover standard activation only and carry no feature payloads, so shows and taps stay on the device. See §9.

## 1. Problem

DISCOVER (§32) shows every cross-cutting section, shuffled, below the category grid. That covers every section but isn't personal: it shows sections the user already lives in next to ones they've never seen, and it sits a scroll below the first screen. About 16 sections (Kundali, Vastu, Sankalp, Pitru Smaran, Guided Pujas…) are each one tap from Home but invisible to most users. The Explore Sheet is personal (unvisited only), shows one section at a time, and stops appearing on its own once every section has been visited.

## 2. Decided

| Decision | Value | Source |
|---|---|---|
| Format | A **bottom sheet** over Home with a live preview of the section. An inline Home banner was prototyped first and rejected. | Product owner |
| Cadence | Can show **on any launch**, at most **2 per local calendar day**, at least **6 hours apart**. A sheet counts toward both limits once **shown**, whatever the user taps. | Product owner |
| Day boundary | Midnight on the phone's own clock. The 6-hour gap already stops a sheet at 23:00 being followed by another at 00:30. | Proposal, not objected to |
| Clock moved backwards | The 6 hours restart from the current time instead of blocking indefinitely. | Proposal |

## 3. Definitions

**Section**: one of 16 entries in `data/discovery/sections.ts`. Bottom tabs are excluded because the tab bar always shows them. Content categories are excluded because NEW badges cover them.

| # | Section | Visit routes (any of) | Preview kind | Priority |
|---|---|---|---|---|
| 1 | नित्य साधना · Daily Practice | RoutineToday, RoutineList, RoutineCreate, RoutineDetail | Checklist | 90 |
| 2 | जप माला · Japa Mala | JapamCounter, CategoryList{japam} | Mala counter | 85 |
| 3 | पूजा विधि · Guided Pujas | VidhiCatalog, VidhiDetail, VidhiConduct | List | 75 |
| 4 | संकल्प · Sadhana Programs | SadhanaPrograms, SadhanaProgramDetail | Day grid | 70 |
| 5 | गीता सार · Gita Saar | GitaSaarChapters, GitaSaarReader | List | 70 |
| 6 | जिज्ञासा · Ask Vedansh | TodayVidhan, Prashna | Questions | 65 |
| 7 | कुंडली · Kundali | Kundali, KundaliReport | Kundali chart | 60 |
| 8 | पितृ स्मरण · Pitru Smaran | PitruSmaranList, PitruSmaranEdit, PitruSmaranDetail | Three steps | 55 |
| 9 | शुभ मुहूर्त · Muhurat Finder | MuhuratFinder, MuhuratResults | Occasion chips | 55 |
| 10 | दान-पुण्य · Daan Punya | DaanPunya, DaanJourney, DaanLedger | Three pillars | 50 |
| 11 | तीर्थ यात्रा · Sacred Journeys | TheerthMap, TheerthDetail | List | 50 |
| 12 | दैनिक राशिफल · Daily Rashifal | Rashifal | Rashi grid | 50 |
| 13 | बच्चों की कहानियाँ · Stories for Kids | KidsStoryLibrary, KidsStoryDeity, KidsStoryReader | List | 45 |
| 14 | सुविचार · Suvichar Wishes | Suvichar | Wish card | 45 |
| 15 | वास्तु दिशा · Vastu Compass | VastuDisha, GharVastu* | Compass | 40 |
| 16 | होम-स्क्रीन विजेट · Home-Screen Widgets | WidgetGallery | Widget mock | 35 |

Preview names in the prototypes come from bundled data: sadhana `programs.ts`, `vidhi/*.ts`, `japam/japam.json`, `gita-saar/themes/*.ts`, `kidsStories/*.json`, and the theerth yatra groups. Hooks for Kundali, Muhurat, Gita Saar, Kids, Vastu, Rashifal and Suvichar are **placeholder copy** and need an editorial pass.

**Visit**: landing on any route the section owns, by any route in: the sheet, DISCOVER, a tile, search, a deep link or a notification. Recorded once in `App.tsx` `handleRouteChange`, one map lookup per navigation.

**Launch**: a cold start, or a return to the app after 30+ minutes in the background.

**Fallback**: if the ledger fails to load, show no sheet. Never treat every section as unvisited.

## 4. Selection rules (in order)

1. **Stand down** when any of these is true:
   - Settings has the sheet off;
   - this is a fresh install's first session (the tour runs instead);
   - another auto-opening surface wants this launch (What's New, update ready, reminder opt-in);
   - the app was opened from a notification, widget or deep link;
   - a sheet was shown **less than 6 hours ago**, or **2 have already been shown today**;
   - the sheet is asleep.
2. **Pool** = the 16 sections minus visited, minus any dismissed with "Not now" in the last 14 days, minus sections this device can't use (widgets on an unsupported OS, Vastu without a magnetometer).
3. **No repeat**: skip the last section shown when anything else qualifies.
4. **Score** = base priority + today's boost (a festival day lifts Guided Pujas; Pitru Paksha lifts Pitru Smaran) − 10 for each earlier "Not now".
5. **Highest score wins.** Ties break on a shuffle seeded at launch, so the pick stays stable while the user is on Home.
6. **Wait for Home to settle** (after interactions, plus ~800 ms), then rise. If the user has already left Home, skip this launch; it does not count toward the limits.
7. **Two "Not now" in a row** pause the sheet for 7 days. If the pool is empty, the sheet stops appearing.

## 5. Sheet spec (v0, before review changes)

- **Shell**: same as `OnboardingSetupSheet`: transparent `Modal` sliding up over `modalBackdrop`, a grabber, `parchmentHighlight` fill, 22 top corners, `elevation.overlay`, max height 88% with a scrolling body.
- **Hero**: a 132 dp band for the section's R2 artwork via `CachedArtwork`, with the parchment plate as the offline fallback. Explored count "3 / 16 देखे".
- **Text**: only the active reading language (as in What's New, §47). Text goes through `contentByLang`, fonts through `titleFontByLang`. Title 24 (lat 28), two-line description in the meaning face.
- **Preview**: 13 kinds (§3 table). Each reads from the section's own bundled data and never retypes scripture (RULEBOOK §11.6). Tapping it opens the section.
- **Actions**:
  - Primary: solid `saffron`.
  - Secondary: "अभी नहीं / Not now", a11y label `Not now` (distinct from the OTA modal's "Later").
  - ✕, swiping down, tapping the backdrop and Android back all count as Not now.
- **Motion**: backdrop fades in over 200 ms and the sheet rises over 280 ms. Nothing animates under Reduce Motion. No haptic on arrival.

## 6. Build plan

| Phase | File | Change |
|---|---|---|
| 1 · Ledger (silent OTA) | `mobile/src/data/discovery/sections.ts` | Registry: id, routes, hi/en title, description and CTA, artwork key, preview kind plus a lazy data loader, priority, availability. |
| | `mobile/src/data/discovery/routeToSection.ts` | Pure route → section map, typed against the ParamLists so a renamed route fails `tsc`. |
| | `mobile/src/data/discovery/seedVisits.ts` | Seeds visits for upgraders from existing storage keys. |
| | `mobile/src/contexts/SectionVisitContext.tsx` | Persists `@vedansh/section-visits` (visited, shownAt[], not-now record, sleepUntil) and exposes `recordRoute`, `markShown`, `markNotNow` and the `shouldShowExploreSheet` gate. Updates memory before the storage write (the TourContext pattern). |
| | `mobile/App.tsx` | Adds the provider. `handleRouteChange` also calls `recordRoute(name)`. |
| 2 · Sheet | `mobile/src/data/discovery/pickExploreSection.ts` | Pure picker for §4. Takes `now` as an argument so the time limits can be tested. |
| | `mobile/src/components/ExploreSheet.tsx` | Loaded lazily and mounted next to `WhatsNewModal`. Opens only when the gate first turns true, guarded by a ref. |
| | `mobile/src/components/explore/*Preview.tsx` | List, Checklist, Mala, Day grid, Questions and Occasion chips (9 of the 16 sections). |
| | `mobile/src/contexts/RatingPromptContext.tsx` | Add the flag to `blockedBySurface` (RULEBOOK §6.2 rule 1). |
| | `mobile/src/screens/MoreScreen.tsx` | Settings toggle "नए भाग सुझाएँ / Suggest sections on launch". |
| 3 · Polish | `explore/*Preview.tsx`, picker | Three steps, Three pillars, Kundali chart, Compass, Rashi grid, Wish card and Widget mock previews, plus festival and Pitru Paksha boosts. |

## 7. Tests (RULEBOOK §0: unit **and** e2e)

- **Picker**:
  - each stand-down condition;
  - the 6-hour gap at 5:59 vs 6:00, the daily limit, rollover at midnight, the clock moving backwards;
  - each pool filter, no-repeat, sleep, an empty pool, determinism.
- **Route map**: every registry route exists. **Seeding**: upgrader vs fresh install.
- **`SectionVisitContext`**:
  - persistence;
  - a storage failure means no sheet.
- **`ExploreSheet`**:
  - four languages and the a11y labels;
  - Not now, ✕ and back all record a dismissal;
  - the rating gate stands down while the sheet is open.
- **Maestro**: add an optional tap on `Not now` to `_launch.yaml`. The sheet can fire on any relaunch after the first, so without that tap unrelated flows break (§6.2 rule 2). New flow `explore-sheet.yaml`: the second launch shows the sheet, the CTA opens the section, and a launch 6+ hours later shows a different section.

## 8. Docs to update when code lands

design.md: a new §86 (Explore Sheet), §47 (place in the onboarding-surface order), §37 (Settings toggle). RULEBOOK §6.2: list the sheet and its priority. Wiki: a page for the visit ledger.

## 9. Open decisions

1. **Off switch**: a Settings row (recommended), a link inside the sheet, or both. The rating prompt's missing off switch is already listed as a store-review risk in RULEBOOK §6.2.
2. **Measurement**: ship without metrics, or decide separately to log when the sheet is shown and opened.
3. **7-day pause vs 2 a day**: two "Not now" taps can now happen in one day, which would pause the sheet on day one. Keep it, or require the two dismissals to be on different days.
4. **Festival days** (from review D10): skip the sheet because the Toran owns Home (§55), or pick the festival's section.
5. **Reviewer U contests the §2 cadence** (U1): not in the first 5 cold starts, one every 3+ days, about 6 in total, "Not now" ends that section for good. The owner's decision stands unless re-opened.

## 10. Review log

**Debate format**: reviewers work independently, then each answers the other's points; the owner decides each disagreement against design.md and the code.

### Reviewer D: delight advocate (independent Claude subagent), complete

**Verdict:** "Clean and token-correct, but nothing about it says Vedansh." The 16 heroes are identical CSS arcs with a letter. The mala looks like a loading spinner and the Kundali is an empty grid. The English "PREVIEW" label stays English in Hindi mode. The ✕ collides with the hero border. There is no §5 ornament anywhere.

| ID | Proposal | Cost |
|---|---|---|
| D1 | Painted hero: `CachedArtwork` 2:1 R2 painting in a ~140 dp band, a `parchmentDeep` margin and a 1px `gold` hairline (the `PracticeHero.tsx` pattern). The section's bundled painted icon at 64 dp is the first paint and the fallback. | M |
| D2 | Replace the "PREVIEW" label with `<Ornament compact/>` (the ॥ divider) plus a localized hint. Drop the ✕, or put it in a 34 dp circle with a 48 dp target. | S |
| D3 | Mount the real components at mini size: `JapamMala`, `MalaStreak capacity={41}`, `DishaChakra`, `NorthIndianChart`, a published Suvichar master, `GitaSaarThemeIcon`, and the occasion icons. Load them lazily after the sheet settles. | M–L |
| D4 | Live data: today's sky (gochar) in the chart, a real upcoming muhurat date, the next festival in Puja Vidhi. Compute after the entrance and fall back to static content. | M |
| D5 | Calm entrance: hero fades in over 420 ms (the `PracticeSeal` timing), then the preview +280 ms, opacity only. Light haptic on mala taps only. Needs a one-line §11 amendment. | S |
| D6 | Show the explored count as a 16-bead mala (the `MalaStreak` style) instead of a "3 / 16" score pill, keeping a text label of at least 10 pt. | S |
| D7 | On the 16th section, play `RoutineCelebration` once with "सम्पूर्ण दर्शन". Needs product sign-off and a §11 amendment. | S |
| D8 | CTA verbs that fit each section, using the `FeatureSpotlight` `ctaHi/En` pattern ("जप आरम्भ करें", "कुंडली बनाएँ"…). | S |
| D9 | `prioritise(targetRoute)` in `screenPrefetch.ts` when the sheet opens, so the CTA lands on a warm screen. | S |
| D10 | Festival days: skip, or show the festival's section with its greeting chip. | S |
| (copy) | Remove "Name (stays on this phone)": §1 and `userFacingImplementationCopy.test.ts` ban privacy and on-device captions. **Fixed in the prototypes on this branch.** | — |

Checked against the repo: `JapamMala`, `MalaStreak`, `DishaChakra`, `NorthIndianChart`, `Ornament`, `PracticeHero`, `PracticeSeal`, `LotusMark`, `GitaSaarThemeIcon` and `CachedArtwork` all exist in `mobile/src/components/`, and the copy-guard rule is in design.md §1. No decisions have been made on D1–D10 yet.

### Reviewer U: restraint, usability and consistency advocate (independent Claude subagent), complete

**Verdict:** "The shell looks like the app, but as specified it would be the most aggressive auto-opening surface the app ships." Ship it only as a rare sheet with static previews and pinned actions. Better still, make it an inline Home card or the lead DISCOVER card. Measured at 390×844 and at 360×640 with 1.3× text.

| ID | Finding | Fix | Sev |
|---|---|---|---|
| U1 | Interruption cost. At 2 a day, a 14-day rest and a 7-day pause, a user who never wants Vastu or Kundali still sees about 2 sheets a week indefinitely. That is the launch moment the rating prompt gave up (design.md §54, RULEBOOK §6.2). | Not in the first 5 cold starts. Lowest priority in the stand-down set. One every 3+ days, about 6 in total. "Not now" ends that section for good. A "don't suggest" control on the sheet as well as in More. | high |
| U2 | Interactive previews act out commitments that never persist: "Day 1 of 41 · sankalp begun", "You'll be reminded every year", "1/3 offered", a dragged compass inventing a heading, Ask's typing dots. | Previews are static, or a tap opens the section at that item. Cut to about 3 kinds: list, rashi, occasion. | high |
| U3 | Actions leave the screen. At 390×844 the sheet covers 79–89% and "Not now" ends at 848 px. At 360×640 with 1.3× text only the ✕ is visible. | Pin the CTA and "Not now" in a footer that doesn't scroll and has a safe-area inset (as in `WhatsNewModal`). Cap content at about 60% of the screen. Replace the hero with a 36 dp icon tile. | high |
| U4 | Tap targets below 44 pt: chips 35 px, rashi 78×37, Kundali houses 28×28, sankalp dot 20×20, gallery "Not now" 40 px. | 44 pt minimum, at most 3 per row. | high |
| U5 | Typography. Devanagari hints render in fake italic. English hints and meta lines use thin Cormorant italic at 13 (a defect on sight, design.md §3). The English description uses Cormorant, which is no longer the English reading face (design.md:91). | Description in the meaning face at 15/23 `inkSoft`. Hints non-italic `pillTextStyle`, or dropped. Use Inter, not IBM Plex. | med |
| U6 | Copy. "PREVIEW" stays English in Hindi mode. "आज खोजें" reuses the Search bar's word. The "0 / 16 देखे" counter tells the user nothing to act on (§1). Numerals mix ४१ and 41. | Eyebrow "यह भी देखें". Drop the label and the counter. Use one numeral system. | med |
| U7 | Only hi/en are covered, but returning gu/kn readers will see the sheet. English rashi names already truncate. | `pick()` for all four languages, `contentByLang`, `titleFontByLang`, `indicLabelReset` (§47). | med |
| U8 | The CTA gets focus on open, so a TalkBack user's first double-tap opens the section. The ✕ is labelled "Close" but acts as Not now. | Focus the header on open. Label the ✕ "Not now" (`ReminderOptInModal.tsx:116`). Make "Not now" a full-width row of at least 44 pt. | med |
| U9 | Geometry drifts from `OnboardingSetupSheet`: padding 16/18 vs 24, max height 90% vs 88%, title face. The ✕ overlaps the hero. The wish gradient is off-palette. The toast is a new pattern. | Reuse the onboarding sheet's shell. Put the ✕ in a header row. Drop the toast. | low |
| U10 | The mala shrinks slightly when pressed and the typing dots blink without stopping (§11). White on saffron is 4.37:1, but that is app-wide, not specific to this sheet. | No scale effect, no looping animation. | low |

Owner checks: design.md:91 (Cormorant retired for English reading) and the copy-guard rule are confirmed. **U1's claim that visits are counted only through the sheet is a misread.** §3 counts a visit from every route in. U1's cadence proposal contests the owner's §2 decision and is listed in §9.

### Where D and U clash (the debate agenda)

| Topic | D says | U says |
|---|---|---|
| Hero | A larger painted R2 miniature (~140 dp) | Replace it with a 36 dp icon tile and cap the sheet at 60% |
| Previews | Mount the real `JapamMala`, `MalaStreak`, `DishaChakra`, `NorthIndianChart`, with live data | Static, or tap-to-open only, about 3 kinds. Fake interactions mislead |
| Explored count | A 16-bead mala | Drop it; it is a score |
| 16th-section moment | A one-time `RoutineCelebration` | Implicitly no (§11 restraint) |
| Format | A sheet (as decided) | Prefer an inline card or the lead DISCOVER card |

**Both agree on:** the English "PREVIEW" label in Hindi mode (D2/U6), the ✕ colliding with the hero (D2/U9), the off-palette wish gradient (D3/U9), and the privacy caption (already fixed).

### Codex: pending

It has to run on the product owner's computer. See §11.

## 11. Resume on another machine (Codex review)

1. Check out the branch: `git fetch origin claude/explore-sheet-prd && git checkout claude/explore-sheet-prd`.
2. Run Codex non-interactively from the repo root with the prompt below, and save its output **verbatim** to `docs/reviews/explore-sheet-codex-review.md`.
3. Hold the debate: for every Codex finding and every D/U item in §10, record adopt / modify / reject with a one-line reason grounded in design.md or code. Where reviewers disagree, state both positions and decide.
4. Apply the adopted changes to the three prototypes. Keep tokens from `mobile/src/theme/`, a warm palette for chrome, reverent motion (§11), the 10 pt floor, 44 pt targets, and no on-device or privacy captions. Re-render them with Playwright and check for no console errors and no horizontal scroll at 390 px.
5. Update §5 and §10 here, commit, and push to the same branch. **No app code** until §9 is answered.

Codex prompt:

```
Review docs/explore-sheet-prototype.html, docs/explore-sheet-gallery-prototype.html
and docs/explore-sheet-plan-prototype.html (plan in docs/roadmap/prds/46-explore-sheet.md).
You are a senior mobile product designer. The app's design system is design.md
(§1, §2, §3, §5, §11, §12, §18, §32, §43, §47) and mobile/src/theme/. Existing
surfaces to stay consistent with: mobile/src/components/OnboardingSetupSheet.tsx,
WhatsNewModal.tsx, FeatureCard.tsx, PracticeHero.tsx. Judge three things:
(1) visual delight within the app's reverent manuscript identity,
(2) usability for Hindi-first older readers — tap targets, text at Large reading
size, contrast, CTA vs "Not now" parity, interruption cost on launch,
(3) consistency with the shipped app. Then respond to the reviewer proposals in
§10 of the PRD: agree / disagree with each, with a reason.
Return up to 12 prioritized findings, each with evidence (file:line or design.md §)
and a concrete fix. Do not edit any files.
```

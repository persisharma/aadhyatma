# PRD-29 — कुल परम्परा · Kuldevta, Family Observance & the Tithis of the Living

| | |
|---|---|
| **Status** | Implemented (2026-08-31) — Part A जन्म तिथि + Part B कुल परम्परा record & export; Maestro flow authored, device run owed |
| **Parent** | [2026-Q4-candidates-round-2.md §2 · PRD-29](../2026-Q4-candidates-round-2.md#prd-29--कुल-परम्परा--kuldevta-family-observance-and-the-tithis-of-the-living) |
| **T-shirt size** | M — two screens per part plus one chip, one notification planner, one export path; zero new engine work by construction |
| **Delivery** | OTA-safe. Pure TS + existing deps (`expo-sharing`, `expo-file-system` already ship for the verse share card) |
| **Prototype** | [`docs/kul-parampara-prototype.html`](../../kul-parampara-prototype.html) — 6 frames |
| **Feasibility** | ✅ Confirmed against current main: `deriveTithiRuleFromDate` + `solveNextOccurrence` shipped and tested (PRD-17), multi-person birth profiles shipped (#294), deity registry (21) and Theerth registry (73) shipped |

> **Design intent (validated in the prototype):** the app keeps the tithis of the dead with real
> care (PRD-17) and not one tithi of the living. And the kul — kuldevta/kuldevi, the family temple,
> the gotra, the observance the family has always kept — is the one piece of practice a family most
> reliably loses in a generation. Both halves are *record-keeping over engines already paid for*,
> framed devotionally, never socially.

**Bundle-only & private by construction:** every field is user-entered on this device, nothing is
inferred, nothing syncs, and nothing leaves the device except through the explicit user-driven
export in §3.7.

---

## 1. Problem

A Hindu birthday is a **tithi**, not a Gregorian date — the practice attached to it (abhishek, the
ishta's paath, feeding) is what elders observe while the Gregorian date gets the cake. The app
already holds every input: multi-person birth profiles (#294) carry date/time/place, and PRD-17
ships `deriveTithiRuleFromDate(birthDate)` and `solveNextOccurrence(rule, fromDate)` with
adhik-masa and kshaya/vriddhi handled. Nothing connects them: no surface answers "when is my Hindu
birthday this year". Separately, `kuldev`/lineage appear nowhere in source outside katha prose —
the family record with the highest generational loss rate has no home in an app that is otherwise
a devotional record-keeper.

## 2. Goal

Two parts, one feature. **A — जन्म तिथि:** every saved birth profile gains its tithi, this year's
date, a Home Today chip on the day, one opt-in reminder, and the day's traditional practice
pointing only at shipped sections. **B — कुल परम्परा:** a single private family record —
kuldevta/kuldevi from the shipped deity registry, the family temple linked into the Theerth
registry (free text as a first-class fallback), gotra, the family's kept observance linked to a
real vrat rule so it dates itself, and free-text notes — exportable through a device-controlled
share, because a lineage record that cannot leave the device fails at the one job it has.

Success = the two new More rows' open counts and the export action count (per-device local
counters, per the Q3 measurement stance); no remote analytics.

## 3. Where it lands in the app (surfaces)

### 3.1 More hub (entry point)
Two rows in the साधना group, after पितृ स्मरण, before वास्तु दिशा (safely below no tour target —
RULEBOOK §6.1's tour rows are in the App group): **जन्म तिथि** (state = `N · <next date>` like the
Pitru row, `NEW` when the roster is empty) → `JanmaTithiList`; **कुल परम्परा** (state = the saved
kuldev name, `NEW` when no record) → `KulParampara`.

### 3.2 जन्म तिथि list (`JanmaTithiListScreen`)
The living and the remembered, side by side — one tithi engine, both directions. Section
**जीवित · जन्म तिथि**: one row per birth-profile person (label = name or birth date, exactly
`PersonChips.personLabel`), caption = tithi rule in words + this year's date, → `JanmaTithiDetail`.
Section **पितृ · स्मरण तिथि**: the saved PRD-17 entries as quiet rows → the shipped
`PitruSmaranDetail`. Empty roster → an explainer + a door to the Kundali screen (where people are
added); the roster itself is never editable here (RULEBOOK §14.5: one store, one owner).

### 3.3 Person detail (`JanmaTithiDetailScreen { personId }`)
The profile's four new lines, per the prototype: जन्म (date · time · city), **जन्म तिथि** (rule in
words, sunrise-tithi convention — §4), **इस वर्ष** (this year's date, weekday, days remaining; rolls
to next year's once passed), नक्षत्र (janma nakshatra from the saved birth details). Then
**इस दिन की परम्परा**: practice rows pointing ONLY at shipped sections — विष्णु सहस्रनाम (the
traditional dirghayu paath), plus the kuldev's own texts when the कुल record names a registry deity
with shipped entries (`library` rows via `navigateToEntryStart`, ids validated). Then the
**स्मरण toggle** (§3.5). No greeting card, no share action, no age arithmetic.

### 3.4 Home Today strip chip
`JanmaTithiDayChip` renders beside `PitruSmaranDayChip` in the Today strip's chip row — same
muted-gold register, never festive saffron: `✦ जन्म तिथि — <label>`, one per matching person, only
on the day, only on this device. Tap → that person's `JanmaTithiDetail`. Matching runs off the
render path through the same interaction-aware deferral as `usePitruSmaranForDate`.

### 3.5 The reminder (opt-in, per person)
The eighth local family in the shipped personal shape (pure planner + glue + headless scheduler):
prefix `janma-tithi-reminder`, **one notice per person per year** — the evening before at 18:00
(`कल <label> की जन्म तिथि है · <tithi>`), cap 8 soonest-first (the roster itself caps at 8 people).
**Default OFF, opted into per person** (open decision №2, resolved — see §8). Enabling requests the
shared OS grant and persists `true` only after success, exactly PRD-17's pattern. Tap →
`JanmaTithiDetail`. Payload carries only the person id + occurrence key.

### 3.6 The कुल परम्परा record (`KulParamparaScreen` + `KulParamparaEditScreen`)
One record per device, five fields, all optional: **kuldevta/kuldevi** — chosen from the 21-deity
registry glyph grid or entered as free text ("जो आपके परिवार में कहा जाता है, वही चुनें। ऐप अनुमान
नहीं लगाता।"); **कुल मन्दिर** — searched against the 73-temple Theerth registry (row opens
`TheerthDetail`), free text as a first-class fallback, never a required link; **गोत्र** — free
text, never validated against any list, never used for anything but display and export;
**कुल व्रत** — a rule id from the shipped observance catalog so the record shows its next date via
`getNextOccurrence` (row opens `ObservanceDetail`), or free text when the family's observance has
no rule; **परिवार की बात** — free-text notes. The view screen closes with the privacy line: the
record lives on this device, joins no list, is sent nowhere.

### 3.7 Export — आगे सौंपें (`KulParamparaExportScreen`)
The point of the record. A summary screen listing exactly what will leave the device — the kul
fields, the janma tithis (person label + birth details + tithi), the pitru tithis (relation +
optional name + tithi) — then ONE action: the OS share sheet (`expo-sharing` over a JSON file in
the cache directory, the `shareVerse` mechanism). Versioned envelope
`{ format: 'vedansh-kul-parampara', version: 1, exportedAt, appVersion, kul, people, pitru }`,
values denormalized to display strings beside their ids so the file is legible to a human and to a
future import alike. Sharing is the user's decision, never prompted.

**PRD-06 reality check:** PRD-06's backup path is still `Proposed` — no backup code exists in the
binary (verified 2026-08-31: no `mobile/src/backup/`, no backup key registry, no restore). This
export therefore ships as its own minimal device-controlled path on deps already in the binary,
with the envelope designed to become a PRD-06 section verbatim when that lands. **Import/restore is
deliberately NOT built here** — it needs `expo-document-picker` (absent, native dep, store release)
and belongs to PRD-06's one importer with its version-gate UX.

## 4. What it computes (all from existing engine)

- **Rule:** `deriveTithiRuleFromDate(birthDate)` — the **sunrise tithi** of the birth civil date
  (udaya-vyapini, Ujjain/purnimant, the identical convention PRD-17 applies to death dates and the
  festival engine applies to every rule). The birth *time* deliberately does not refine the tithi
  in v1 — the tithi prevailing at the birth instant is a different convention needing an
  `angaAt`-style solve; the derived rule is shown back in words on the detail screen, so the
  convention is visible, and the same person's rule is stable across both halves of the app.
- **This year's date:** `solveNextOccurrence(rule, today)` — adhik-masa (nija-month guard), kshaya
  fallback and vriddhi dedupe all inherited from the shared matcher. Day-of matching for the chip
  goes through the same matcher (`tithiRuleMatchesDate`, a thin exported wrapper).
- **Persistence of answers:** janma rules ride the SAME `pitruSmaranSolves` layer (tithi-keyed,
  person-free, versioned with `PANCHANG_DAY_CACHE_VERSION`, swept by the derived-cache reset) — a
  janma tithi and a shraddha tithi on the same rule genuinely share an answer, and the layer's
  privacy stance (never keyed by person) carries over unchanged.
- **Kul vrat date:** `getNextOccurrence(ruleId, today)` off the precomputed table, the vrat-reminder
  choice. **Janma nakshatra:** the Moon nakshatra from the saved birth date/time via the shipped
  Kundali/namkaran Moon-longitude primitive.

## 5. Data model — and the birth-profile schema coordination (PRD-20/21)

Round 1 flagged that its PRD-20 candidate (सङ्कल्प, which owns `gotra`) and PRD-21 (natal Moon)
must not migrate the birth-profile store twice; PRD-29 would be the third consumer.
**Resolution: PRD-29 does not touch `@vedansh:kundali-profiles:v1` at all.** The sankalp candidate
has not landed — no `gotra` exists in source, and the number 20 has since been taken by the
unrelated [Deep Personal Horoscope PRD](./20-personal-horoscope.md), which also leaves the roster
schema untouched (both facts verified 2026-08-31, re-verified after merging main). The roster
parser is a strict allow-list that drops unknown fields, so any field added there is a schema
change the sankalp PRD still owns under whatever number it lands with. PRD-29 keeps its state in
two new sibling keys, both enumerated as non-cache keys in `derivedCacheReset.test.ts`:

- `@vedansh:janma-tithi:v1` — `{ version: 1, reminders: Record<personId, true> }`. Reminder opt-ins
  keyed by person id; ids that leave the roster are pruned on load, and the scheduler joins against
  the live roster so an orphan can never schedule.
- `@vedansh:kul-parampara:v1` — `{ version: 1, record: KulRecord }` with
  `KulRecord = { kuldev?: { kind: 'kuldevta'|'kuldevi'; deityId?: Deity; customName?: string };
  temple?: { templeId?: string; customName?: string }; gotra?: string;
  kulVrat?: { ruleId?: string; customText?: string }; notes?: string }`. Ids are validated against
  their registries on parse (an id a release retired degrades to the free-text field, never a
  crash); versioned-payload parse per the `PitruSmaranContext` pattern.

**Note for the sankalp PRD:** gotra lives here at the *family* level, which is where the sankalp
needs it. When that PRD lands, read it from `@vedansh:kul-parampara:v1` first and add a per-person
override on the roster only if the sankalp flow actually needs one — that keeps the roster
migration single and that PRD's own.

## 6. Tone & privacy stance (product stance, locked)

- **Chosen, never inferred — structurally.** There is no gotra→kuldevta mapping in the binary to be
  tempted by; the deity picker's copy says the app does not guess. No caste or community
  classification exists anywhere in the data model.
- **No directory of families.** One local record; no browse, no aggregate, no list membership.
- **The birthday stays devotional, not social.** Round 1 §3 rejected greeting cards; accordingly no
  card, no share prompt, no confetti, no age. The day gets a quiet chip, a paath, and a reminder
  the user asked for.
- **Nothing leaves the device unless the user shares it** — and the export screen shows exactly
  what is in the file before the share sheet opens.

## 7. What it does NOT do (non-goals)

- **No inference, ever** — no gotra→kuldevta, no surname→gotra, no community detection.
- **No greeting cards, no birthday share card, no social framing** (round 1 §3, upheld).
- **No import/restore in v1** — PRD-06 owns the one importer (§3.7).
- **No roster editing outside Kundali** — birth details keep their single owner (RULEBOOK §14.5).
- **No monetization hooks, ever** (kuldev puja booking, temple donations — the incumbents' pattern).
- **No new notification default-on** — the shared iOS 64-pending budget is already over-subscribed
  in the worst case ([[notifications]] gotcha); this family adds at most 8, all explicit opt-ins.

## 8. Open decisions — resolved

1. **Reminder default: OFF, opted into per person** (recommended and implemented). Matches the
   shipped notification-preferences pattern (vrat/muhurat opt-in; only broadcast families default
   on) and keeps the iOS pending budget honest.
2. **Sunrise-tithi convention for the janma rule** (§4) — visible on the detail screen, revisit
   only with an explicit convention doc if users ask for birth-instant tithi.
3. **Kul vrat with no matching rule** → free text, un-dated (prototype open question 4, confirmed).
4. **Export rides its own share path now** rather than waiting on PRD-06 (§3.7).

## 9. Design compliance (design.md is authoritative)

- **Colour:** existing tokens only — chips in `gold-tint`/`gold` muted register (the PRD-17 chip
  rule: never festive saffron for private family surfaces). No new tokens.
- **Type:** hub rows and dense chrome cap the font multiplier per §12; Devanagari micro lines keep
  ≥1.4× leading (§3.0); devotional text scales.
- **Components:** `SettingsRow` anatomy for hub rows, `ObservanceListRow`/information-panel
  patterns from PRD-17 screens, `DeityIcon` glyphs for the picker, `CalendarDatePicker` untouched —
  no hand-rolled inputs or cards (RULEBOOK §3).
- **Iconography:** deity glyphs and text marks only, no emoji (§5).
- **A11y:** English accessibility labels on every control (Maestro contract), 44 pt touch floor.
- **Bilingual, Hindi-led:** hi/en authored; gu/kn derive via `contentByLang` transliteration.

## 10. Why it fits the moat

An account-less, cloud-less app's only switching cost is holding something the user cannot get
elsewhere. A family's kul record and the janma tithis of its living members are exactly that — and
the export turns the moat inside out honestly: the record is valuable because it can be handed on,
not because it is trapped.

---

### 2026-08-31 verification record

- Implemented in this PR: §3.1–§3.7 complete; unit suites (`janmaTithi.test.ts`,
  `kulParampara.test.ts` under `test:engine`; `janmaTithiReminderPure.test.ts` under `test:data`;
  Jest store/screen suites) green; `npm run test` and `npm run lint` at 0 errors.
- `.maestro/kul-parampara-smoke.yaml` authored and parse-checked; **device run owed** (authoring
  environment has no simulator), per the [[e2e-verification]] recipe.
- design.md gains the कुल परम्परा section — currently **§70**, renumbered twice as PRD-20 (§67/§68)
  and PRD-27 (§69) merged into main mid-branch — and §37's row list is refreshed in the same PR.

# PRD-28 — पर्व-अर्क · festival arcs — स्थापना → विसर्जन, and "what do we do today"

> *The app knows how to install a deity and has never once concluded a rite. The biggest festivals are arcs; the app only knows days.*

| | |
|---|---|
| **Status** | **Deferred** (product decision 2026-09-03: the Q4 2026 slate is PRD-42 + PRD-43 only) — build-ready; Q1 2027 candidate. The Diwali/Dhanteras pradosh day-rule fix in §5 is **not** deferred with it — it moves to the Q4 debt line and is due before 7 Nov 2026 (roadmap §8) |
| **Parent** | [2026-Q4-candidates-round-2.md §2 · PRD-28](../2026-Q4-candidates-round-2.md) (candidate) · [2026-Q4-roadmap.md §2.3](../2026-Q4-roadmap.md) |
| **T-shirt size** | M — one additive relation over existing rules, one solver, one strip, one chip, one opt-in reminder planner; visarjan vidhi text sourced separately |
| **Delivery** | OTA, in **two drops**: drop 1 (arc relation + strip + chip) by **9 Oct** for Navratri; drop 2 (duration solver, Diwali-5, Chhath-4, Dev Uthani → Tulsi Vivah, reminder) by **1 Nov**. Visarjan vidhi entries land `status: 'draft'` and flip when verified — the mechanic never waits on them |
| **Prototype** | [`docs/parv-arc-prototype.html`](../../parv-arc-prototype.html) — 6 frames: silence after day 1, the duration chooser, day 4 of 10, visarjan day, the Diwali five-day arc, Navratri feeding the bhog list a day early |
| **Feasibility** | ✅ Confirmed against `main`: every anchor rule exists (`navratri-start`, `dussehra`, `dhanteras`, `diwali`, `govardhan-puja`, `bhai-dooj`, `chhath-puja`, `dev-uthani-ekadashi`, `tulasi-vivah`, `ganesh-chaturthi`, `anant-chaturdashi`); occurrence-scoped user state has a shipped shape (`vidhi/checklistStore.ts`, PRD-23 kitchen list); the sthapana vidhis ship; 43 bhog profiles cover the days |
| **Backup** | `@vedansh:parv-arc:v1` registers in PRD-42's registry |

**Bundle-only:** the arc relation is data over rules already in the binary; the solver is arithmetic
over dates the engine already resolves.

---

## 1. Problem

`data/vidhi/` ships `ganesh-chaturthi-sthapana` and `navratri-ghatasthapana` — and no visarjan of
anything. `festivals.ts` models Diwali's five days as unrelated rules and Ganesh Chaturthi / Anant
Chaturdashi as strangers; Chhath — a four-day rite (नहाय-खाय → खरना → सन्ध्या अर्घ्य → उषा अर्घ्य) — is
one date. So on day 4 of a 10-day Ganesh, or the morning after Dhanteras, the app is silent on the
live question of the week: **आज क्या करना है, और क्या बाकी है।** And the concluding date of the most
popular arc depends on a choice only the family makes (1½ · 3 · 5 · 7 · 10 days), which is exactly
why it cannot be a static calendar entry.

**This quarter, per the app's own engine (Ujjain, purnimant):** Navratri 11 Oct → Dussehra 21 Oct ·
Karwa Chauth 29 Oct · Dhanteras 7 Nov → Diwali 9 Nov → Govardhan 10 Nov → Bhai Dooj 11 Nov · Chhath
15 Nov · Dev Uthani Ekadashi 20 Nov → Tulsi Vivah 21 Nov · Gita Jayanti 20 Dec. The densest festival
quarter of the year.

## 2. Goal

Any member day of an arc shows **where today sits, what is done, what remains** — and for arcs whose
end is a family decision, the app records the choice once and computes its consequence: the visarjan
date, its window, and an opt-in reminder. It never says which duration is correct.

Success (roadmap §5): ≥ 40 % of app opens on Navratri/Diwali days reach the arc strip or its
detail; ≥ 25 % of users who open a sthapana vidhi record a duration. Local counters.

## 3. What ships

### 3.1 The arc relation — `panchang/arcs.ts` (pure, data)

Purely additive; **no existing rule is rewritten and no date changes.**

```ts
type ParvArc = {
  id: string;                          // 'sharad-navratri' | 'diwali' | 'chhath' | 'ganesh-utsav' | 'dev-uthani-tulsi'
  nameHi: string; nameEn: string;
  anchorRuleId: string;                // the rule whose resolved date is day 1
  days: ArcDay[];                      // ordered
  duration?: { choices: number[]; visarjanLabelHi: string; visarjanLabelEn: string };  // family-chosen arcs only
};
type ArcDay = {
  ordinal: number;                     // 1-based from the anchor
  role: 'sthapana' | 'day' | 'visarjan';
  labelHi: string; labelEn: string;    // 'घटस्थापना', 'कन्या पूजन', 'नरक चतुर्दशी'…
  ruleId?: string;                     // when a shipped rule names this day — its resolved date is authoritative
  vidhiId?: string; bhogId?: string;   // doors into shipped content, ids validated by test
};
```

**Date resolution rule — decided here.** A day with a `ruleId` takes the **rule's own resolved date**
(the festival engine's kshaya/vriddhi/vyapini handling is the truth); a day without one is
`anchorDate + (ordinal − 1)`, **but is clamped to sit strictly between its rule-dated neighbours**.
Rationale: tithi arithmetic is not day arithmetic — a kshaya or vriddhi tithi can put a gap day between
Diwali and Govardhan, or make Bhai Dooj fall two days after Amavasya. A test sweeps 2024–2031 from the
precomputed table and asserts every arc's rule-dated members are monotonic and that offset-derived
days never collide with a rule-dated one; where the sweep finds a year in which they would, that arc
year renders the rule-dated days only and the strip says so ("इस वर्ष अंतराल का दिन").

**v1 arcs:**

| Arc | Days (roles) | Duration |
|---|---|---|
| **शारदीय नवरात्रि** | 1 घटस्थापना (`navratri-start`, vidhi `navratri-ghatasthapana`) · 2–7 day (form of the day as label) · 8 महाष्टमी · कन्या पूजन (bhog) · 9 महानवमी · हवन · 10 विजयादशमी · विसर्जन (`dussehra`) | fixed 9/10 — kalash visarjan on Navami or Dashami is the one choice (2 options) |
| **दीपावली** | 1 धनतेरस (`dhanteras`, bhog) · 2 नरक चतुर्दशी · छोटी दीवाली (offset) · 3 दीपावली · लक्ष्मी पूजन (`diwali`, vidhi `diwali-lakshmi-ganesh-puja`) · 4 गोवर्धन · अन्नकूट (`govardhan-puja`, bhog) · 5 भाई दूज (`bhai-dooj`) | none |
| **छठ** | 1 नहाय-खाय (offset −2) · 2 खरना (−1) · 3 सन्ध्या अर्घ्य (`chhath-puja`, bhog) · 4 उषा अर्घ्य · पारण (+1) | none |
| **देवउठनी → तुलसी विवाह** | 1 देवउठनी एकादशी (`dev-uthani-ekadashi`) · 2 तुलसी विवाह (`tulasi-vivah`) | none |
| **गणेशोत्सव** | 1 स्थापना (`ganesh-chaturthi`, vidhi `ganesh-chaturthi-sthapana`, bhog) · 2…N day · N विसर्जन (`anant-chaturdashi` when N = 10; else offset) | **1½ · 3 · 5 · 7 · 10** — the chooser; ships in drop 2 for the 2027 season |

### 3.2 The solver — `panchang/arcSolve.ts` (pure)

`resolveArcYear(arc, year, { location, system, choice? }) → ArcOccurrence { days: [{ ordinal, date,
role, label, ruleId?, isToday }], visarjanDate?, visarjanWindow? }`. For a chosen duration `d`,
visarjan = day `d` (1½ ⇒ day 2, afternoon — the traditional reading, stated). The visarjan **window**
is the day's Choghadiya/Abhijit from the shipped muhurat engine, annotated (never graded) with
शुभ योग; the day's Rahu Kaal is shown struck through as the Daily Muhurat card does. `arcForDate(date)`
answers "is today inside an arc, and where" for the strip and the chip; it reads the persisted
occurrence store, never re-matches tithis (the kshaya rule).

### 3.3 Occurrence-scoped state — `@vedansh:parv-arc:v1`

`{ version: 1, choices: Record<'<arcId>:<year>', { durationDays: number; chosenAt }> ,
reminders: Record<'<arcId>:<year>', true> }` — the exact `vidhi/checklistStore.ts` shape (keyed by
occurrence, pruned once the year is past). Registered in PRD-42 as `incoming-wins` per key.

### 3.4 Surfaces

- **Arc strip** on `ObservanceDetail` for any member rule: a horizontal day rail (ordinal · label ·
  date), today marked, done days muted, remaining days plain; tap a day → that day's detail: its rule's
  `ObservanceDetail` when it has one, else an **arc-day sheet** with the label, the date, the
  bhog/vidhi doors (verified content only — `getUpvasInfo`'s draft rule), and the "what remains" line.
- **Today strip chip** (Home): `नवरात्रि · दिन 4 / 9` on arc days, muted-gold register, → the arc
  strip. Same interaction-aware deferral as the pitru/janma chips; **the festive catalog's leading
  card and the toran are untouched** (`festiveReminders.test.ts` contract).
- **Duration chooser** — on the sthapana vidhi's तैयारी and on the arc strip when today is day 1 and no
  choice is recorded: the arc's `choices` as pills, **no default selected** (round 2 §5.4), one-line
  copy: *"आपके परिवार की परम्परा जो हो — ऐप वही दिनांक निकालता है।"* Choice is changeable until visarjan.
- **Visarjan reminder** — opt-in, shown once a choice exists: the evening before at 18:00 and the
  morning of at 07:00, through a small planner `arcReminderPure.ts` reusing `VratReminderSheet`
  (extended like the muhurat family did) — prefix `arc-reminder`, **cap 4**, soonest-first, inside the
  shared iOS budget. Tap → the arc strip. Nothing schedules without a choice.
- **Bhog a day early** — the arc-day sheet for tomorrow surfaces tomorrow's `bhogId` kitchen list
  (prototype frame 6), since the shopping happens the day before.
- **Ask intents** (RULEBOOK §25): `arc.today` ("आज नवरात्रि का कौन सा दिन", "diwali ka kya bacha
  hai"), `arc.visarjan` ("विसर्जन कब है", "ganpati visarjan date") — the second answers from the
  recorded choice or asks for it.

### 3.5 Content (separate track, never blocking)

`data/vidhi/` gains **`ganesh-visarjan`**, **`navratri-kalash-visarjan`** and a short **Diwali
day-by-day** entry (Dhanteras deepdaan, Naraka Chaturdashi abhyanga, Govardhan annakut, Bhai Dooj
tilak — hand-offs to shipped aartis/bhog, not new liturgy), all at `status: 'draft'` until two
independent sources clear them (RULEBOOK §19). The arc-day sheet renders the door only when verified.

## 4. Where it lands (one list)

Observance Detail arc strip · arc-day sheet · Home Today chip · sthapana vidhi तैयारी chooser · opt-in
reminder (VratReminderSheet) · kitchen-list-a-day-early · two जिज्ञासा intents · FOR TODAY row
unchanged (the leading festival card already exists).

## 5. Conventions — decided here

- **Duration is the family's decision; the app records it and computes its consequence.** No default,
  no "most common", no regional recommendation in copy.
- **Rule-dated days beat offsets** (§3.1). Never "fix" a gap year by moving a rule.
- **The Diwali Class B day rule becomes user-visible in this PRD.** The engine currently places Diwali
  by the udaya tithi (9 Nov 2026) while published almanacs use the pradosh-kaal reading (8 Nov 2026);
  a five-day strip makes the discrepancy obvious. Drop 2 settles `dayRule: 'pradosh'` for `diwali`
  and `dhanteras` under RULEBOOK §23 (a `tithiAtPradosh` instant solver shaped like `tithiAtMadhyahna`),
  regenerates the precomputed table, and bumps `observanceCache` `CACHE_VERSION`. Owned here because
  this is where the wrong day would first be *seen*.
- **Arc ≠ vidhi.** An arc is a calendar object; a vidhi is a procedure. The strip links to procedures;
  it does not become one.

## 6. Open decisions

1. **Navratri visarjan choice** — Navami vs Dashami kalash visarjan as a two-option chooser, or fixed
   at Dashami with copy? Recommend the two-option chooser (regional practice genuinely differs).
2. **Where the Ganesh chooser lives in 2026** — the season has passed (14–25 Sep); ship the arc and
   chooser in drop 2 so they are exercised in tests and appear in 2027 without a release. Recommended.
3. **Reminder times** — 18:00 eve + 07:00 morning (the pitru pattern) vs the visarjan window's start
   − 30 min (the muhurat pattern). Recommend the pitru pattern: a visarjan is a day, not an instant.
4. **Diwali pradosh rule** — settle in drop 2 (§5) or hold for a separate convention PR before 1 Nov.
   Recommend settling here; the strip should not ship showing a date the family's almanac contradicts.

## 7. Non-goals

- No arcs beyond the five in v1 (Holi-Holika, Janmashtami-Nandotsav, Rath Yatra are 2027 candidates).
- No new notification default-on; the reminder is opt-in and capped.
- No regional recommendation of durations; no "most families choose".
- No visarjan **location** features (ghats, timings) — round 1's darshan-timings rejection applies.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Drop 1 misses 11 Oct | Drop 1 is *relation + strip + chip* only; if it slips, Diwali (9 Nov) is the larger target and the same code |
| Offset days collide with rule days in some year | The 2024–2031 sweep test + the "gap year" render rule (§3.1) |
| The Diwali date discrepancy ships visibly | Drop 2 settles the pradosh rule before the arc renders (§5, §6 №4) |
| iOS pending budget | Cap 4, opt-in, soonest-first; audited against the total in [[notifications]] |
| Content lands late | Mechanic ships regardless; doors render only when verified |
| A strip on Observance Detail crowds the four-state "How to observe" home | Strip sits above the hero as a rail, not a card; design decision recorded in §62/§65 updates |

## 9. Tests & release gates (RULEBOOK §0/§0.1)

- **Engine (tsx):** `arcs.test.ts` (ids validated against rules/vidhis/bhog; monotonic sweep
  2024–2031 for both systems; gap-year detection), `arcSolve.test.ts` (durations, 1½-day rule,
  window derivation, arcForDate), `arcReminderPure.test.ts` (fire times, cap, no-choice silence),
  pradosh day-rule goldens 2024–2026 for Diwali/Dhanteras against published dates.
- **Jest:** arc strip render states (before/during/after, gap year), chooser (no default, changeable),
  Today chip deferral, arc-day sheet verified-only doors, PRD-42 registry entry.
- **E2E:** `parv-arc-smoke.yaml` — Panchang → Vrat & Parv → Navratri → arc strip present → tap day 8 →
  sheet; chooser assertable on the ghatasthapana vidhi's तैयारी. Date-dependent chip pinned by units.
- **Docs in the same PR:** `design.md` §33 (day panel chip), §48 (Today chip), §62 (तैयारी chooser),
  §65 (arc-day bhog door), new **§75 पर्व-अर्क**; `RULEBOOK.md` §19 (visarjan vidhi entries), §23
  (pradosh rule), new **§28 arc relation contract** (a new multi-day festival rule ships with its arc
  membership or an explicit "single day" note); `observanceCache` + precomputed table regenerated.

## 10. Why it fits

The app's calendar is the most careful in the category about *which day* — kshaya, vriddhi, moonrise,
midday. This PRD gives that care a shape users actually live in: the week, not the day. And it closes
the one asymmetry round 2 called out that nothing since has touched: the app installs deities and never
concludes anything.

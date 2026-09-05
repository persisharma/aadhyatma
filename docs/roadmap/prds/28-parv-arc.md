# PRD-28 — पर्व-अर्क · Festival Arcs, स्थापना → विसर्जन

| | |
|---|---|
| **Status** | Phase A implemented (2026-09-03) — arc relation, sthapana → visarjan solver, occurrence-scoped choice, reminder through the shipped vrat family, arc strip on Observance Detail, Diwali + Navratri consumers. Phase B authored as **draft** (user-invisible) — two-source review scheduled, see §7. Maestro flow authored; device run owed. |
| **Parent** | [2026-Q4-candidates-round-2.md §2 · PRD-28](../2026-Q4-candidates-round-2.md#prd-28--पर्व-अर्क--festival-arcs-स्थापना--विसर्जन) |
| **T-shirt size** | S code (pure relation + solver + one strip component) · M content (two sourced visarjan vidhis) |
| **Delivery** | OTA-safe: TypeScript/data only; no native dependency, no new notification family, no `DayInputs` change (⇒ no `PANCHANG_DAY_CACHE_VERSION` bump), no data migration |
| **Prototype** | [`docs/parv-arc-prototype.html`](../../parv-arc-prototype.html) — 6 frames |
| **Contract** | RULEBOOK **§26** (visarjan vidhi content contract) · design.md **§33** (Observance Detail), **§62** (vidhi status boundary), **§65.2** (the arc strip) |
| **Deadline** | **Diwali 2026 falls on 8 Nov (arc 7–11 Nov).** Ganesh Chaturthi 14 Sep, Navratri 11–21 Oct. Phase A must be in a store build before 7 Nov or the Diwali frame's value defers a year. |

> **Locked design decisions (do not drift):** the duration is the **family's** decision — the app offers 1½ / 3 / 5 / 7 / 10, **defaults to nothing**, and never says which is correct (§5). A user who never chooses sees exactly today's behaviour (independent days) and is **never nagged**: no choice ⇒ no visarjan slot ⇒ no reminder. The arc relation is **purely additive** — no rule rewritten, no date changed (§3.1, test-pinned). The visarjan vidhi ships **`verified` or user-invisible** (§7, RULEBOOK §26).

**Bundle-only & private by construction:** the only user state is one occurrence-scoped record per arc (`@vedansh/parv-arc`), the same shape as the vidhi samagri checklist; nothing syncs, nothing leaves the device.

---

## 1. Problem

The biggest festivals are arcs, and the app only knew days. `data/vidhi/` shipped `ganesh-chaturthi-sthapana` and `navratri-ghatasthapana` and **no visarjan of anything** — the app knew how to install a deity and had never once concluded a rite. `festivals.ts` modelled Diwali's five days as four unrelated rules (`dhanteras`, `diwali`, `govardhan-puja`, `bhai-dooj`) and `ganesh-chaturthi` / `anant-chaturdashi` as strangers. Verified absent from every doc: no `visarjan`, no arc concept.

The practice the app missed: you install Ganesh on Chaturthi and the family decides its own visarjan — 1½ day, 3, 5, 7 or 10 days to Anant Chaturdashi — and the concluding date depends on **that choice**, which is exactly why it cannot be a static calendar entry. Navratri runs ghatasthapana → kanya pujan → visarjan. Diwali's live question for five days is "what do we do today, and what is left".

## 2. Goal

Make the app know that these festivals are one observance seen on different days: show where today sits in the arc, compute the **family's own** visarjan from **their** choice, remind them of it through plumbing that already exists, and — in the same slot — surface content the binary already carries at the moment it is useful (PRD-23's Kanya Pujan bhog list and grocery checklist, a day before). Sequenced so the **content gate cannot block the mechanic**.

## 3. Phase A — the mechanic (code only, shipped first)

### 3.1 The arc relation (`panchang/types.ts`, `festivals.ts`)

Three optional fields on `ObservanceRule`, present together or absent together: `arcId`, `arcRole: 'sthapana' | 'day' | 'visarjan'`, `arcOrdinal`. Set on eight **existing** rules; nothing else about them changes (tithi, month, paksha, `dayRule` pinned by `arcs.test.ts`):

| Arc (`arcs.ts`) | Rules (role · ordinal) | Length |
|---|---|---|
| `ganesh-utsav` गणेश उत्सव | `ganesh-chaturthi` (sthapana · 1) → `anant-chaturdashi` (visarjan · 10) | **chosen** — 1½/3/5/7/10 |
| `sharad-navratri` शारदीय नवरात्रि | `navratri-start` (sthapana · 1) → `dussehra` (visarjan · 10) | calendar-fixed |
| `deepavali` दीपावली | `dhanteras` (day · 1) · `diwali` (day · 3) · `govardhan-puja` (day · 4) · `bhai-dooj` (day · 5) | calendar-fixed |

Diwali reuses the same three-role vocabulary — `'day'` covers a day that is neither sthapana nor visarjan (prototype open question 4, closed). Diwali's day 2 has no rule; the arc definition carries a **gap label** (`नरक चतुर्दशी`) for the day(s) strictly between Dhanteras and Diwali, so the strip names it without inventing an observance rule.

`ARC_DEFINITIONS` in `panchang/arcs.ts` is the single home of the relation's *shape* (roster, customary length, max span, duration choices, gap labels, preparation hand-off, visarjan vidhi id). `festivals.ts` never imports `arcs.ts` (direction pinned) — the relation is data on the rules; the behaviour is in the pure module.

### 3.2 The sthapana → visarjan solver (`arcs.ts`, pure)

`solveVisarjanDate(arc, sthapanaDate, durationDays)`: 1½ → day 2, 3 → day 3, 5 → day 5, 7 → day 7 (civil-day count from the family's day 1); **10 → the Anant Chaturdashi rule** when it resolves 8–11 days out (the tithi count, not a fixed offset — 2026: 14 Sep → 25 Sep, an honest 12-civil-day arc), else day 10 by count.

`resolveArcOccurrence(arc, today, calendarSystem, choiceFor)` builds the occurrence that **contains** today (an open chooser arc stays current for `maxSpanDays`), else the next one, from the shipped festival engine (`resolveObservancesForYear`, precomputed Ujjain table like every other occurrence consumer). Every civil day gets a slot; ordinals come from **dates**, never from the customary count (Navratri 2026 is 11 civil days and the strip says so). `arcDayFor` answers before / during (ordinal, remaining) / after; on an open arc it counts honestly and reports `daysRemaining: null`.

### 3.3 The choice — occurrence-scoped user state (`arcChoiceStore.ts`)

One AsyncStorage document `@vedansh/parv-arc`: `{ [arcId]: { dateKey, durationDays } }`, keyed per arc per **sthapana date** — the exact shape `data/vidhi/checklistStore.ts` and PRD-23's grocery ledger use. Last year's ten days never bind this year's arc (`arcChoiceFor` answers only for its own `dateKey`); corrupt or foreign documents parse to "no choice"; storage failure degrades to today's behaviour. The module publishes a snapshot + listeners (the `observanceStore` pattern) so the strip and the reminder scheduler re-derive together. No new storage pattern.

### 3.4 The reminder — through a shipped family (`VratReminderScheduler`)

`visarjanReminderInputs(choices, today)` yields one `VratReminderInput` per chosen visarjan whose occurrence is current or upcoming: the evening-before **advance** notice (18:00) and the **07:00 day-of** notice vrat followers already know, under the existing `VRAT_REMINDER_CAP` (order ≥ 1000 so follows keep priority). The only planner change is an optional `titleHi` override (`'विसर्जन स्मरण'`). The payload's `ruleId` is the **sthapana rule**, so a tap lands on the detail page that carries the strip through the existing `vrat-reminder` deep link. The family is gated on OS permission already granted — the scheduler never prompts (unchanged). No choice ⇒ no input ⇒ silence.

### 3.5 The arc strip (`components/ArcStrip.tsx`, design.md §65.2)

Rendered on **Observance Detail** for every arc member, directly under the action row, null for every other rule (the six other detail pages are byte-for-byte unchanged — Jest-pinned). Eyebrow `पर्व-अर्क · Festival arc` + arc name + a `दिन N` chip during the arc; a compressed strip (first, last, every rule-bound/labelled day, today, `…` between) with done/now/future circles; a status line (`प्रारम्भ · date · in N days` / `आज दिन N / M · K दिन शेष · विसर्जन weekday date` / `आज विसर्जन`); rule-bound slots push that day's own detail.

- **Chooser** (chooser arcs, sthapana rule only): `कितने दिन विराजेंगे?`, the stance note, five tiles + `बाद में` — **no tile pre-selected**; tapping the selected tile or `बाद में` clears. With a choice: the `स्थापना / आपका विसर्जन` fact box and, when permission is granted, the reminder note.
- **Preparation hand-off** (Navratri): from three days before Vijayadashami to its eve, a `कन्या पूजन की तैयारी` row → `VidhiDetail {navratri-ghatasthapana, dateMs: sthapana}` — whose तैयारी tab **already** renders PRD-23's `navratri-bhog` panel and grocery ledger, keyed to the sthapana date so checks persist through the arc. Copy says *अष्टमी या नवमी — परिवार की परम्परा अनुसार*; the app does not pick the day.
- **Visarjan vidhi door** (eve + day): only when `getVidhiById(arc.visarjanVidhiId)` resolves — verified-only, so the door is absent until Phase B clears.

## 4. Second consumers

- **Diwali** (the deadline): four existing rules gained one `arcId` and became one observance. Each of the four detail pages carries the same five-day strip; Dhanteras's page shows Diwali three days out, Bhai Dooj's shows what is done.
- **Navratri**: the strip on `navratri-start` / `dussehra`, plus the Kanya Pujan hand-off — new value from content already in the binary (PRD-23 profile `navratri-bhog`, PRD-19 vidhi `navratri-ghatasthapana`).

## 5. Stance guards

- Duration is the family's decision. Offered set 1½ / 3 / 5 / 7 / 10; **default nothing**; the ten-day tile names Anant Chaturdashi as a fact, not a recommendation; no tile is visually "primary".
- Degrade gracefully: never chosen ⇒ independent days, one `दिन N` count, no presumed end, no reminder, no re-ask. The chooser is a section on a page the user opened, never a modal or a push.
- Kanya Pujan day is not chosen by the app (Ashtami vs Navami varies by family) — the hand-off window spans both and says so.
- Nothing about a duration is exported, synced or inferred from location.

## 6. Non-goals (v1)

Chaitra Navratri and regional Diwali variants (Bengali Kali Puja, Marathi Padwa) as arcs; a Home Today chip for the arc; a widget slot; arc-aware festive reminders (the festive family stays day-scoped); the daily "prātaḥ ārti · bhog · sāyaṁ ārti" to-do of the prototype's frame 3 (a routine, not an arc concern — PRD-07 owns it).

## 7. Phase B — visarjan vidhi content (authored draft, review scheduled)

Two entries authored in `data/vidhi/` as **`status: 'draft'`** — `ganesh-visarjan-uttar-puja` (hook `anant-chaturdashi`) and `durga-visarjan` (hook `dussehra`) — instruction-only, no mantra, freshly authored both languages (§9), the permanent-vs-festival-murti boundary stated in both. `VidhiEntry.status` is new; the seven PRD-19 entries are verified by omission. **`VIDHI_ENTRIES`, `getVidhiById` and `getVidhiForFestival` expose verified entries only** — the catalog, search rows, day-panel pill, Observance Detail card and arc door never see a draft (test-pinned).

Why draft: the authoring session's outbound network was refused (proxy 403), so no source could be opened; RULEBOOK §11.1 makes internet verification mandatory. Each `source.canonicalEditionStatus` states exactly what is outstanding. **Schedule (not a hope — PRD-23 proved the gate passable):**

1. Open Gita Press code 592 *Nitya Karma Puja Prakash* — Ganapati chapter concluding section (uttara-puja/visarjana) and the Navaratra kalash chapter's conclusion (kalash worship begins printed p. 202); collate both instruction-only sequences.
2. Open the two `referenceUrls` per entry; confirm concordance on order (uttara-puja → aarti → utthapana → immersion; Dashami as Durga visarjan day, kalash/jawara handling). Record regional scope in a `variantNote`.
3. Named reviewer, dated note → flip `status` to `'verified'`. The arc door, the day-panel pill on Anant Chaturdashi / Dussehra, the search row and the catalog card all light up with **zero code change**.
4. Target: before Anant Chaturdashi 2026 (25 Sep) for Ganesh; before Vijayadashami 2026 (21 Oct) for Durga.

## 8. Tests & gates

- **tsx** `panchang/__tests__/arcs.test.ts` (17): relation all-or-none + back-references + roster/ordinal order; the eight rules' tithi fields pinned unchanged; the offered set and no default; solver (1½/3/5/7 by count, 10 → Anant Chaturdashi 2026-09-25, fallback); open occurrence; 5-day and 10-day Ganesh occurrences; Diwali 2026 five days with gap label; Navratri 2026 eleven civil days; containing-vs-next selection and occurrence-scoped choices; `arcDayFor`; the Kanya Pujan window; reminder inputs (none / one / stale-year / bad duration / fixed arc); purity + import-direction guards.
- **tsx** `vratReminderPure.test.ts`: `titleHi` override rides both notices and leaks onto nothing else. `vidhiContent.test.ts`: drafts meet the full contract, are hidden by every accessor, carry no mantra, state the outstanding review and the permanent-murti boundary.
- **Jest** `ArcStrip.test.tsx` (11), `arcChoiceStore.jest.test.ts` (4), `ObservanceDetailScreen.test.tsx` (+3: non-arc rule unchanged; sthapana chooser unselected; Diwali strip + slot push).
- **Maestro** `.maestro/parv-arc-smoke.yaml` (date-independent: strip, chooser with nothing selected, choose → `Your visarjan`, decide later → gone, Diwali five days, slot push).
- `npm run test` and `npm run lint` at 0 errors; design.md §33/§62/§65.2 and RULEBOOK §19/§26 in this PR (RULEBOOK §0.1).

## 9. Open questions carried

1. Should the ten-day tile read `१० दिन` or `अनन्त चतुर्दशी तक` when the resolved arc is 11–12 civil days? v1 shows both lines on the tile and the honest total in the status line.
2. A Home Today chip during an arc (`दिन ४ · गणेश उत्सव`) — after usage shows the strip earns its place, same bar as PRD-27 §9.4.
3. Chaitra Navratri as a fourth arc once a `chaitra-navratri-start` rule exists (Ram Navami is not its visarjan).

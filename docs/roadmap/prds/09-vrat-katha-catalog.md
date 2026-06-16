# PRD-09 — व्रत-पर्व (Vrat & Parv): Catalog, Tracking & Reminders

| | |
|---|---|
| **Status** | Draft for review |
| **Target release** | TBD (post PRD-01 notifications, alongside PRD-07 routines) |
| **Window** | TBA |
| **T-shirt size** | L (multi-PR; phased) |
| **Owner** | TBA |
| **Prototype** | `docs/panchang-vrat-catalog-prototype-v2.html` (interactive, Variant A) |

---

**Local-first constraint:** follows, priority order, and per-vrat reminder settings are stored on-device via `AsyncStorage`, exactly like `BookmarksContext`, `RoutineContext`, and `NotificationPreferencesContext`. Observance dates are computed on-device by the existing Panchang engine; reminders are scheduled with the existing local `expo-notifications` scheduler. **No account, no server, no remote fetch** — consistent with the app's stance and shippable without backend work.

---

## 1. Problem

The **Panchang** tab (`mobile/src/screens/PanchangScreen.tsx`) is date-first: it shows a month grid, the selected day's observances ("व्रत और पर्व"), and a short "upcoming" peek. Underneath it sits real capability that the UI never exposes:

- **114 rule-based observances** (`mobile/src/panchang/festivals.ts`, typed by `ObservanceRule` in `types.ts`) — festivals, vrats, upavas, regional days — each with `nameHi/En`, `category`, `deity`, a date-rule, optional `kathaId`, and `searchTerms`.
- A working **`searchObservances()`** in `festivalEngine.ts` that **no screen calls**.
- **82 bilingual kathas** with a polished reader (`VratKathaReaderScreen.tsx` + `KathaSectionPage.tsx`), reachable today only incidentally.

So a devotee **cannot browse** "all the vrats," **cannot search** them, **cannot open a dedicated page** for one, **cannot keep a personal list** of the vrats they observe, and **gets no reminder** before or on the day. The calendar answers "what is today"; it does not answer "which vrats matter to *me*, when are they, and remind me." The closest primitive — PRD-07 routines — composes *daily reading practice*, not *date-anchored observance tracking* (see §3).

## 2. Goal

Give the Panchang tab a second, discovery-first surface — **व्रत-पर्व (Vrat & Parv)** — and the screens behind it, so a user can:

- **Browse** every observance by type and **search** across them.
- Open a **dedicated detail page** for any vrat/festival, and **read its katha**.
- **Follow** the ones they care about and **order them by priority** into their own list (**My Vrat / मेरा व्रत**).
- Get a **reminder the day before and on the day** of a followed vrat.

Success looks like: a returning user opens Panchang, taps **व्रत-पर्व**, finds Nirjala Ekadashi, reads its katha, follows it, and is reminded the evening before and the morning of — all offline.

## 3. Non-goals

- **Not a re-implementation of PRD-07 routines.** Routines compose *reading practice* (sections/japam, daily/weekday, check-offs). This PRD tracks *date-anchored observances* (vrats/festivals) and surfaces their kathas. They share the persistence and notification patterns but are distinct stores and surfaces. PRD-07 Phase 4 ("festival-day routines") may later *consume* a followed-vrat, but that link is out of scope here.
- **No authored fasting/upvas content in v1.** The detail page reserves a "How to observe" slot but ships it as a *Coming soon* placeholder; structured fasting data (fast type, parana window, strictness) is **Phase 4**, gated on content authoring (none exists today).
- **No per-user location in v1.** Panchang is computed for the Ujjain reference (hardcoded today). Location configuration is **Phase 4**.
- **No server / account / sync.** Local-only, per the constraint above.
- **No new bottom tab.** व्रत-पर्व lives inside the existing Panchang tab; My Vrat is reached from it (see §6).

## 4. User stories

> As a devotee, I want to **browse all vrats by type** (and search by name) so I can find the ones I keep — without scrolling a calendar month by month.

> As someone who keeps Ekadashi, I want to open **एकादशी**'s page, understand when it falls and why, and **read its katha** in Hindi.

> As a planner, I want to **follow** the 4–5 vrats I observe and **order them by my priority**, so "my vrats" are one glance, not buried among 114.

> As a busy observer, I want a **reminder the evening before** (to prepare) **and on the morning of** each followed vrat, delivered locally even with no signal.

> As a story lover, I want to **browse the 82 kathas** as a library and read any of them, independent of a specific date.

## 5. Concepts & data model

### 5.1 Follow + priority (new `VratFollowContext`)

A thin store mirroring `BookmarksContext` / `RoutineContext`. Each follow references an existing `ObservanceRule` by id; ordering is explicit (user-controlled priority).

```ts
type VratFollow = {
  ruleId: string;        // -> ObservanceRule.id in festivals.ts
  addedAt: number;
  order: number;         // user priority; lower = higher in My Vrat
  reminder?: VratReminderPref;   // undefined => use global default
};

type VratReminderPref = {
  advanceDays: 0 | 1 | 2 | 3;    // evening-before notice; 0 = off
  dayOf: boolean;                // morning-of notice
  dayOfTime?: { hour: number; minute: number };  // else global default / "sunrise"
};
```

**Storage:** `@vedansh/vrat-follows` (follows + order) and `@vedansh/vrat-reminder-default` (the global default, e.g. `advanceDays:1, dayOf:true, 07:00`). Load-migrate-persist exactly like the existing contexts; `ruleId`s are stable strings from `festivals.ts` (use the same migration discipline as `sourceIdMigration.ts` if a rule id is ever renamed).

### 5.2 Reminder scheduling (extends the existing scheduler)

Reuse `mobile/src/notifications/scheduler.ts` + `NotificationPreferencesContext`. For each followed vrat, resolve its **next occurrence(s)** via the Panchang engine and schedule up to two local notifications: an **advance** (evening, `advanceDays` before) and a **day-of** (morning). Deep-link the tap to the observance detail via `entryRoutes.ts`.

**iOS 64-pending cap (hard constraint).** iOS allows ≤64 scheduled local notifications. With N follows × 2 notifications × multiple future dates this overflows fast. Strategy: schedule only the **next occurrence** per followed vrat within a **rolling window** (mirror `ROLLING_WINDOW_DAYS`), **followed-first**, and **re-arm on app open** (same rolling pattern as the daily-verse scheduler). Never schedule the whole year.

### 5.3 Observances & kathas (reuse, no new model)

`ObservanceRule` (festival/vrat/upavas/katha/regional, `deity`, date-rule, `kathaId`, `searchTerms`, `visibility`) and the 82-entry katha catalog already exist. The catalog **filters/groups these**; detail **renders one**; "Read Katha" pushes the existing `VratKathaReaderScreen`. `searchObservances()` finally gets a UI.

## 6. Surfaces

The Panchang tab gains a segmented spine: **`[ Calendar | व्रत-पर्व ]`**. Calendar stays date-first (refined). **व्रत-पर्व** is the discovery surface. **Observance Detail**, **Katha Reader**, and **My Vrat** are pushed screens.

### 6.1 व्रत-पर्व — browse-by-type landing (replaces "Catalog")
No filter-chip row (explicitly rejected in review). The landing is:
- a **search field** (wires `searchObservances()`),
- a pinned **Upcoming** strip (next few observances, chronological → full Upcoming list),
- **category tiles** with live counts — **व्रत (Vrat)**, **पर्व (Festivals)**, **उपवास (Upvas)**, **कथा (Katha library, 82)** — each drilling into a per-type **list screen** (next-date + type; optional sticky sub-groups + scoped search). Reuses the app's existing `CategoryCard` browse pattern.
- a pinned **"मेरा व्रत · My Vrat — N following"** row (the Variant-A door, see §6.4).

The **कथा** tile opens the **Katha library** — all 82 as story-styled rows with "Read" → reader (observance-first elsewhere; stories browsable here).

### 6.2 Observance Detail (vertical scroll)
Order (settled in review): **hero** (type · **deity**, name Hi/En, the lunar **rule** as subtitle, **next date + countdown**) → one row of compact actions **`[★ Follow] [🔔 Remind] [॥ Read Katha]`** → **महत्व · About** → **कथा · Story** (card → push to reader) → **उपवास विधि · How to observe** (*Coming soon* placeholder, **last**, Phase 4).
- **Removed in review:** a separate "When it occurs" block (rule + next date already in the hero) and a panchang "Why this date" facts block (those belong on the Calendar, not the vrat detail).
- Katha is a **push** to the full-screen reader — never an embedded horizontal deck (avoids the nested-swipe gesture conflict in the v1 prototype).

### 6.3 Katha Reader
The existing `VratKathaReaderScreen` (horizontal paged, bilingual). Unchanged; reached from a detail's "Read Katha" or the Katha library.

### 6.4 My Vrat (मेरा व्रत) — Variant A (decided)
A **dedicated pushed screen**, reached two ways that are always visible on Calendar and व्रत-पर्व: a **★ icon with a count badge in the header**, and a pinned **"My Vrat · N following"** row on the व्रत-पर्व landing. Following a vrat shows a brief "Added — View in My Vrat" confirmation. (Mirrors how Wishlist/Bookmarks are reached. *Variant B — a third `[Calendar | व्रत-पर्व | My Vrat]` segment — was prototyped and rejected in favour of A.*)

The screen shows: a small metric band (following / reminders-on / this-month), the **priority list** (reorder ▲▼; each row → its detail; a per-row reminder **bell**), a **month timeline** of upcoming-among-followed, and an **empty/first-run** state nudging "Browse व्रत-पर्व →".

### 6.5 Reminders
Per-vrat from the bell / detail "Remind"; a bottom sheet sets **advance notice** (off/1/2/3 days, evening) + **on-the-day** (toggle) + **day-of time** (07:00 / 08:00 / Sunrise). A global default lives alongside (editor mirrors `ReminderSettingsScreen`). Local notifications only; honors the iOS cap (§5.2).

### 6.6 Calendar (refined)
Stays date-first. Day chips get **text labels** (व्रत / पर्व) + better contrast; today's observances link to Detail; the "आगामी व्रत" peek links to the full Upcoming list. The header carries the My Vrat ★.

**Navigation map:** `Calendar / व्रत-पर्व` → tile → `Type list` → card → **Detail** → "Read Katha" → **Reader**; **My Vrat** via header ★ / "My Vrat" row → item → its Detail; **★ Follow** adds to My Vrat; **Upcoming** strip → full list. (All wired as real taps in the prototype.)

## 7. Phasing

1. **P1 — Discover.** Segmented `[Calendar | व्रत-पर्व]`; browse-by-type landing (tiles + counts + Upcoming + search wiring `searchObservances`); per-type list screens; **Observance Detail**; **Katha library** + reader linkage. Ships value with zero new persistence.
2. **P2 — Follow & prioritize.** `VratFollowContext` (+ AsyncStorage); ★ Follow from detail/cards; **My Vrat** screen (priority reorder, month timeline, empty state); header ★ + landing row (Variant A).
3. **P3 — Reminders.** Per-vrat advance + day-of via the existing scheduler; global default editor; iOS-cap-safe rolling re-arm; deep-link to detail.
4. **P4 — Content & location.** Authored **upvas/fasting guidance** (fills the "How to observe" slot); optional **location** configuration for vrat timings.

## 8. Reuse map (lean on, don't rebuild)

| Need | Existing asset |
|---|---|
| Observance data + search | `mobile/src/panchang/festivals.ts`, `types.ts` (`ObservanceRule`), `festivalEngine.ts` (`searchObservances`) |
| Katha content + reader | `VratKathaReaderScreen.tsx`, `KathaSectionPage.tsx`, `kathaId` links |
| Local persistence pattern | `BookmarksContext.tsx`, `RoutineContext.tsx`, `UserActivityContext.tsx` (`@vedansh/*` + migrate) |
| Reminders | `notifications/scheduler.ts` (rolling window, iOS 64-cap), `NotificationPreferencesContext`, `ReminderSettingsScreen.tsx` |
| Browse UI | `CategoryCard`, `LibraryCard`, `GitaChapterCard` |
| Bilingual labels + chrome | `LanguageToggle`, `Ornament`, theme tokens (`colors.ts`, `typography.ts`, `spacing.ts`) |
| Deep-link routing | `mobile/src/navigation/entryRoutes.ts`, `HomeStackNavigator`, `types.ts` |

## 9. Design review (v1 prototype → v2)

The v1 prototype (`docs/panchang-vrat-catalog-prototype.html`) was the starting point; the v2 prototype incorporates this critique:

- **No filter-chip row** → browse-by-type **category tiles** + Upcoming + search (chips don't scale to 114 and don't match the app's browse pattern).
- **Linked, not loose** → screens navigate by real taps; My Vrat has an **explicit, always-visible door** (the v1 frames were disconnected; "how do I reach My Vrat?" was unanswered).
- **No nested horizontal swipe** → detail is vertical; katha is a push (v1 nested a swipe deck inside a swipe deck).
- **Detail de-duplicated** → removed "When it occurs" and panchang "Why this date" (both already implied by the hero / belong on Calendar); deity moved into the hero; actions on one line.
- **Priority is first-class** → My Vrat is a user-ordered list, not just a flat "tracked" pile.
- **Reminders are real** → an actual advance + day-of model, not a dead button.
- **Phased honesty** → fasting guidance shows as *Coming soon* (no fake data); accessibility fixes (labeled chips ≥11px, larger touch targets).

## 10. Decisions & open questions

**Decided:**
- **Surface name:** **व्रत-पर्व (Vrat & Parv)**, not "Catalog" (covers vrats, festivals, upvas; the Katha library is a tile within it).
- **My Vrat IA:** **Variant A** — header ★ + landing row → dedicated screen. (Variant B / third segment rejected.)
- **Navigation:** browse-by-type landing (no chips); detail vertical; katha as a push.
- **Detail order:** hero (with deity, rule, next date) → About → Story → How-to-observe (Coming soon, last). No "When it occurs", no panchang facts on the detail.
- **Reminders:** advance (evening) + day-of (morning), local-only, iOS-cap-safe rolling re-arm.
- **Upvas content & location:** deferred to P4.

**Open:** none blocking P1–P3. P4 (authored upvas guidance, location config) tracked as follow-ups. Whether a followed vrat can seed a PRD-07 festival-day routine is a future cross-PRD question.

# PRD-07 — Daily Routine (नित्य साधना) & Weekday Deity Schedule

| | |
|---|---|
| **Status** | Approved — Phase 1–2 in implementation |
| **Target release** | TBD (post v1.4.0 notifications) |
| **Window** | TBA |
| **T-shirt size** | L (multi-PR; phased) |
| **Owner** | TBA |

---

**Local-first constraint:** routines, schedules, and completion state are stored on-device via `AsyncStorage`, exactly like `BookmarksContext`, `UserActivityContext`, and `NotificationPreferencesContext`. No account, no server. This keeps the feature consistent with the app's no-account stance and lets it ship without backend work.

---

## 1. Problem

The app is a library of devotional texts with a single time-anchored surface — the **Daily Bhakti** tab (`mobile/src/screens/DailyBhaktiScreen.tsx`), which shows one *random* verse from `versePool.ts`. But real practice (sadhana) is **deliberate and repeated**, not random: a devotee reads *their* texts, in *their* order, often **keyed to the day of the week** (Monday → Shiva, Saturday → Hanuman, etc.).

Today there is no way for a user to say "this is what I read every day" or "this is my Monday practice." The closest primitive is the **Wishlist** (`BookmarksContext`), but that is a flat pile of saved *verses* with no ordering, no schedule, and no notion of completion. Wishlist answers "save this for later"; it does not answer "this is my daily practice."

## 2. Goal

Let a user **compose one or more named routines** from existing content, optionally **schedule them by weekday** (with a sensible deity-of-the-day default), **work through them with check-offs**, and (later) **be reminded**. Success looks like:

- A returning user opens the app and sees **today's practice**, pre-filtered to the day, in their chosen order.
- Adding content to a routine is a one-tap action available anywhere content is listed (`LibraryCard`, reader top-bar, `DeityListScreen`).
- Completion feeds the existing streak/activity machinery (`UserActivityContext`) so practice is measurable.

## 3. Non-goals

- **Merging with — or feeding from — Wishlist.** Wishlist stays as **verse-level** favorites (saved from a card inside a reader). Routine works at **section / subsection / chapter** granularity. Because the two operate at different levels, there is **no "add wishlisted verse to a routine" cross-link** — it would force a verse into a surface that doesn't accept verses. They remain entirely distinct concepts and stores.
- **Folding the Daily Bhakti verse into the routine.** The random daily verse stays exactly as it is. The routine banner is a separate surface docked below it; a lone verse is the *one* thing the routine deliberately does **not** accept (that's what Daily Bhakti is for).
- **Arbitrary scroll-position bookmarking.** A routine item points at a *complete reciting unit* — a whole text/section, a named subsection, a whole granth or its chapter, or a japam mantra — never "page 3 of the reader" and never a single stotram verse.
- **Server sync / multi-device.** Local-only, per the constraint above.
- **A full festival calendar engine.** Date-anchored entries are Phase 4 and lean on PRD-01's bundled festival JSON rather than reinventing it.

## 4. User stories

> As a daily practitioner, I want to create a routine called "प्रातः साधना / Morning Sadhana" and add the Hanuman Chalisa, the Gayatri mantra (1 round), and a favorite Gita shloka to it, so I read the same things each morning.

> As a Shiva devotee, I want a routine that **changes by weekday** — Shiva stotrams on Monday, Hanuman on Saturday — and I want the app to *suggest* the deity for each day so I don't start from a blank page.

> As someone with two practices, I want **separate routines** — a short weekday one and a longer weekend one — not a single list I have to mentally filter.

> As a japa practitioner, I want a routine item to be "Gayatri × 1 round (108)" that opens the counter and counts toward my daily total.

> As a user who reads the whole Bhagavad Gītā over time, I want to add a **specific chapter** to my routine (not the entire 701-verse granth), because adding the whole thing as one item is meaningless.

## 5. Concepts & data model

The central reframing from the initial idea: **a user has many routines**, not one. A *Routine* is a named container with a schedule mode; it holds ordered *items*; each item references existing content.

### 5.1 Routine (container)

```ts
type RoutineScheduleMode = 'daily' | 'weekday';

type Routine = {
  id: string;                 // uuid
  nameHi: string;             // user-entered; both fields optional-but-one-required
  nameEn: string;
  mode: RoutineScheduleMode;  // chosen at creation: "daily" or "day-wise"
  createdAt: number;
  order: number;              // ordering of routines in the list
};
```

At **creation** the user is asked the single branching question: **"Should this routine be the same every day, or change by day of the week?"** → sets `mode`.

- `mode: 'daily'` → every item shows every day.
- `mode: 'weekday'` → each item carries a `weekdays` set; "today" is filtered to items whose set includes today. This is where the **vaar (deity-of-day)** layer lives.

### 5.2 Routine item

```ts
type RoutineItem = {
  id: string;                 // uuid
  routineId: string;
  kind: 'section' | 'subsection' | 'granth' | 'granth-chapter' | 'japam';
  sourceId: string;           // library entry id, e.g. 'shiva-strotam', 'gayatri'
  // 'section'        : whole text (Hanuman Chalisa) — opens reader at start
  // 'subsection'     : a named sub-block (one stotra, one kāṇḍa) — needs subId
  // 'granth'         : whole granth
  // 'granth-chapter' : one chapter/sarga of a granth — needs chapter
  // 'japam'          : a mantra with a target
  subId?: string;             // present for 'subsection' (e.g. stotra id)
  chapter?: number;           // present for 'granth-chapter'
  targetRounds?: number;      // present for 'japam', e.g. 1 (= 108 beads)
  // scheduling — only meaningful when the parent routine.mode === 'weekday'
  weekdays?: number[];        // 0=Sun .. 6=Sat
  order: number;
  addedAt: number;
};
```

**Granularity rules (from product).** A routine item is always a **complete reciting unit**, never an arbitrary verse-screen:
- ✅ A **whole section** — e.g. *Hanuman Chalisa*. Opens the reader at the start.
- ✅ A **named subsection** — e.g. one of the four stotras inside *Shiva Stotram*, or a kāṇḍa. The unit is the named sub-block, not a single verse within it.
- ✅ A **whole granth** *or* a **chapter of a granth** — `category: 'granth'` (Gītā, Sundarkand, Ramcharitmanas) may be added whole **or** by chapter/sarga (the "add" affordance offers a chapter picker). Granths are the only content allowed to go to chapter level, because they are large enough for a chapter to be a meaningful daily unit.
- ✅ A **japam mantra with a target** — e.g. Gayatri × 1 round (108); opens `JapamCounterScreen`, counts into `UserActivityContext.logJapaRound`.
- ❌ **Never a single verse/shloka of a stotram or chalisa, and never "a particular reader screen/scroll page."** A lone verse only makes sense as the *Daily Bhakti* random verse — not as a routine item. (This is also why Wishlist, which is verse-level, does not feed routines — see §3.)

### 5.3 Completion state — hybrid (auto + manual fallback)

Tapping a routine item in the Today view **opens the content** (reader or japam counter at the start of the unit) — that is the primary action; the point of a routine is to *do* the practice, not tick a box. An item is then marked complete by **either** path:

- **Auto (default, honest).** The item completes when the reader reports the user **reached the last verse-page of the unit** — detected by comparing the live `verseIndex`/`chapter` from `setProgress` (`ReadingProgressContext`) against the unit's known total (`verseCount` / chapter totals in `texts.ts`). For japam, completion fires when `targetRounds` is met in `JapamCounterContext`. *"Reached the final verse-page"* is the agreed proxy for "read it" — the app cannot (and shouldn't) police that every word was read; no dwell timers.
- **Manual fallback.** A small mark-done affordance on the item (for reciting offline / from memory). The Today row distinguishes the two — *"✓ read to end"* vs *"✓ marked"* — so the user knows which were genuinely completed in-app.

**Storage.** A per-day completion set lives alongside the existing day log; reads/rounds still flow into `UserActivityContext` (`logRead` / `logJapaRound`) so streaks and Profile stats light up for free. Completion is keyed by `routineId·itemId·YYYY-MM-DD` and resets at the day boundary.

### 5.4 Weekday → deity default map (vaar)

Used only to **pre-suggest** content when building a `weekday` routine; always overridable. Constrained to deities the catalog actually has (`mobile/src/data/deities.ts`):

| Day | Suggested deity tag(s) | Rationale |
|---|---|---|
| Sunday | `savitr` (Sūrya) | Ravivar — Sun |
| Monday | `shiva` | Somvar — Shiva |
| Tuesday | `hanuman` | Mangalvar — Hanuman |
| Wednesday | `ganesha` | Budhvar — Ganesha |
| Thursday | `vishnu` | Guruvar — Vishnu |
| Friday | `durga` | Shukravar — Devi |
| Saturday | `hanuman` (labelled "Shani Dev · Hanuman") | Shanivar — Shani Dev; Hanuman worshipped for relief from Shani. No Shani content yet, so Hanuman is surfaced while the label names the presiding deity. |

"Suggested for today" is then just: filter `library` by the day's deity tag — no hand-curation, because every entry is already deity-tagged.

## 6. Surfaces

**No dedicated bottom tab and no `More` entry.** A tab is too heavy for a v1, and `More` is a low-traffic graveyard where the feature would never be noticed. Instead the daily driver is an **embedded routine chip** that lives inside the two screens users already open every day — **Home** and **Daily Bhakti** — and the full management screens are reached *through* that chip.

### 6.1 Routine banner (the entry point) — docked above the tab bar, two states

A single `RoutineBanner` component **pinned just above the bottom tab bar** (not scrolled inline), rendered on the **Home** and **Daily Bhakti** screens. It rides above the tab bar like a mini now-playing bar, always in view, with no new navigation chrome. **The Daily Bhakti random verse is left completely untouched** — the banner is a separate surface that sits below it.

- **State A — no routine yet (nudge):** a slim dashed banner — *"अपनी नित्य साधना बनाएँ · Set your daily practice ›"* — tapping opens routine creation. Has a small ✕ to dismiss for the session so it never nags.
- **State B — routine(s) set (progress):** a slim banner showing **today's** progress — *"नित्य साधना · 2 / 5 आज"* with a thin progress strip and the current streak (read from `UserActivityContext`). Tapping opens the **Today** view.

Both screens render the *same* component and state, so progress stays consistent. Because it's docked (not inline in the `ScrollView`), it never competes with the hero, library grid, or verse card for scroll position.

### 6.2 Management screens (reached via the chip)

- **`RoutineListScreen`** — lists the user's routines; "＋ New routine" → name + the daily-vs-weekday question. Reached from the Today view / chip overflow, not from a tab.
- **`RoutineDetailScreen`** — one routine. For `weekday` routines, a Sun–Sat strip (with the suggested deity per day); tapping a day shows that day's items. Reorder, edit schedule, remove. Each item taps through to its reader via the existing `entryRoutes.ts` helpers.
- **"Today" view** — what the chip opens: union of all routines' items scheduled for today, grouped by routine, with check-offs and a streak header. The daily-driver screen.
- **"Add to routine" action** — a `＋` mirroring `BookmarkButton`'s placement, on `LibraryCard`, reader top-bars, `DeityListScreen`, and the Wishlist row. Opens a sheet: pick routine(s), and for granths pick a chapter.

All screens follow the parchment design system and the bilingual rules in `RULEBOOK.md` §3 (every user-facing string branches on `lang`; reader/title screens swap Hi/En rather than stacking).

## 7. Phasing

1. **Phase 1 — Foundation.** `RoutineContext` (+ AsyncStorage), `RoutineListScreen`, `RoutineDetailScreen`, multiple named routines, the daily-vs-weekday creation choice, "add to routine" (sections, verses, japam, granth-chapter rule), check-off → `UserActivityContext`. Ships value alone.
2. **Phase 2 — Vaar.** Weekday strip, per-item `weekdays`, deity-of-day suggestions sourced from existing tags. "Suggested for today."
3. **Phase 3 — Reminders.** Wire routines into the existing notification scheduler (`mobile/src/notifications/scheduler.ts`, `NotificationPreferencesContext`) — per-routine reminder time that deep-links to the Today view.
4. **Phase 4 — Calendar.** Date-anchored entries / sankalp ("read X for N days"), reusing PRD-01's bundled festival JSON for festival-day routines.

## 7a. Implementation status (Phase 1 + vaar)

**Shipped in this branch** (`tsc --noEmit` clean; `RoutineCompletion.test.tsx` green in the CI screens gate):

- `src/data/routine/{types,vaar,units,useRoutineToday}.ts` — model, weekday→deity map, completion resolver, today composition.
- `src/contexts/RoutineContext.tsx` — AsyncStorage persistence, multiple named routines, CRUD, daily-scoped manual completion. Wired into `App.tsx`.
- `src/components/RoutineBanner.tsx` — docked banner (nudge / progress) on `HomeScreen` + `DailyBhaktiScreen`.
- Screens: `CreateRoutineScreen` (name → daily/weekday), `RoutineAddItemsScreen` (whole-text + japam, weekday selector + vaar suggestions), `RoutineTodayScreen` (check-off + progress + streak), `RoutineListScreen`, `RoutineDetailScreen`. Registered in `HomeStackNavigator` + `types.ts`.
- Routing centralised via `navigateToRoutineItem` in `entryRoutes.ts` (RULEBOOK §3).
- Completion is **derived** (no per-reader edits): manual marks persist (daily); auto = reached last verse-page *today* (`ReadingProgress`) or target japa rounds today (`UserActivity`).

**Add-to-routine — complete touch-points (§6.2a):**
- `AddToRoutineSheet` — app-level bottom sheet (mounted once via `RoutineSheetProvider`; opened from anywhere through the lightweight `useRoutineSheet()` hook). Toggles a unit in/out of any routine, offers a **whole-vs-chapter selector** for chaptered sources (`chaptersForSource` registry over all 11 chapter manifests), and a "New routine" shortcut.
- `LibraryCard` gains a `＋` → lights up **CategoryList** and **DeityList** browse surfaces.
- `AddToRoutineButton` in **every reader top-bar** (all 14 readers), **pre-selecting the chapter being read** for chaptered sources.

**Kind model simplified** from the §5.2 draft to `section | chapter | japam` (`chapter` covers both a granth chapter and a single stotra; whole = `section`).

**Deferred (follow-ups):** auto-complete for a *whole* multi-chapter granth (chapters complete individually today); Phase 3 reminders; Phase 4 calendar/sankalp. Banner/Search-FAB stacking on Home is a known polish item.

## 8. Reuse map (what we lean on, not rebuild)

| Need | Existing asset |
|---|---|
| Local persistence pattern | `BookmarksContext.tsx`, `UserActivityContext.tsx` |
| Content catalog + deity/category tags | `mobile/src/data/texts.ts`, `deities.ts` |
| Verse/section addressing & navigation | `mobile/src/navigation/entryRoutes.ts` |
| Bilingual source/verse labels | `getSourceLabel` / `getVerseLabel` in `WishlistScreen.tsx` |
| Completion / streaks | `UserActivityContext.tsx` |
| Reminders (Phase 3) | `NotificationPreferencesContext`, `notifications/scheduler.ts` |
| Japam counter + targets | `JapamCounterScreen.tsx`, `JapamCounterContext.tsx` |

## 9. Decisions & open questions

**Decided:**
- **Placement (§6):** no new tab, no `More` entry. A `RoutineBanner` **docked above the bottom tab bar** on **Home** and **Daily Bhakti** is the entry point — nudge when no routine is set, today's progress when one is. Management screens are reached through it.
- **Daily Bhakti stays as-is.** The random daily verse is untouched; the banner is a separate surface below it. No merge.
- **No Wishlist → Routine link.** Different granularity (verse vs. section); a cross-link would push a verse into a surface that only takes complete units.
- **Granularity (§5.2):** section · named subsection · whole granth · granth chapter · japam-with-target. No single stotram verse.
- **Completion (§5.3):** hybrid — tap opens content; auto-completes on reaching the **last verse-page** (or target rounds); manual mark-done fallback for offline recitation.
- **Mode is locked at creation** for Phase 1 — switching daily↔weekday would orphan per-item `weekdays` tags; users can make a second routine instead.

**Open:** none blocking Phase 1–2. Phase 3 (reminders) and Phase 4 (calendar/sankalp) tracked as follow-ups.

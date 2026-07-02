# PRD-11 — Sadhana Programs (संकल्प) — Guided Multi-Day Practice

| | |
|---|---|
| **Status** | Draft — competitive-analysis flagship bet |
| **Target release** | TBD (post-Daily-Routine; reuses its infra) |
| **Window** | TBA |
| **T-shirt size** | M (multi-PR; phased) — most of the substrate already exists |
| **Owner** | TBA |
| **Bet** | #1 (flagship) — the retention difference-maker |

---

**Local-first constraint:** program *definitions* are bundled JSON (same pipeline as texts); a user's *enrolled sankalp* + daily progress are stored on-device via `AsyncStorage`, exactly like `RoutineContext`, `UserActivityContext`, and `NotificationPreferencesContext`. No account, no server, no sync. This keeps the feature inside the bundle-only constraint and lets it ship without backend work.

---

## 1. Problem

Vedansh today is a **reader** with a **Daily Routine** (नित्य साधना, PRD-07) for open-ended everyday practice. What it does not have is a way to make and keep a **time-bound devotional commitment** — a *sankalp*.

Sankalp / anushthan is one of the most deeply held practices in Hindu observance: a devotee resolves to complete a *defined* practice over a *defined* number of days — **41-day Hanuman Chalisa anushthan**, **Gita in 18 days (one chapter/day)**, the **9 days of Navratri**, **Shravan Somvar (all Mondays of Shravan)**, a **21-day japam sankalp**. The practice has a beginning (the sankalp), a spine (the daily unit), and a completion (पूर्णाहुति / a fulfilled vow). That arc is exactly the arc that produces a durable daily habit — the product's stated north-star is **D30 return rate**, and a 41-day vow *is* a 41-day retention contract.

PRD-07 explicitly deferred this: its Phase 4 is *"Date-anchored entries / sankalp (read X for N days)."* This PRD picks that up and makes it the headline, because it is the single highest-leverage thing we can build on infra we already own.

### Why this is a difference-maker, not a gap-filler

- **It changes the product's category** — from *"an app where I read scriptures"* to *"the app that carries me through my sadhana."* That is an identity leap, not a feature.
- **The incumbents structurally can't copy it well.** The large devotional apps (online-puja / astrology / darshan marketplaces) monetize transactions. A quiet, ad-free, offline, N-day vow with **no upsell and no commerce** is antithetical to their revenue model — durable whitespace, not a feature race.
- **It compounds on infra already shipped** — routine model, reading-progress completion, japam targets, streaks, notifications, and the "full-bloom completion seal" from PRD-10. This is weeks, not a quarter.

## 2. Goal

Let a user **take a sankalp** by enrolling in a guided, multi-day program, **work through one day's unit at a time** (reusing the reader / japam counter), **see honest progress and a grace-aware streak**, and **arrive at a completion (पूर्णाहुति)**. Success looks like:

- A user starts the **"41-day Hanuman Chalisa"** sankalp, and every day the app shows *"Day 7 of 41 — today's Chalisa"* with one tap into the reader.
- Completing a day feeds the existing `UserActivityContext` streak/activity machinery — no parallel bookkeeping.
- Missing a day **pauses** the sankalp (grace), it does not shame or silently break it.
- Finishing the last day triggers a पूर्णाहुति celebration (the existing completion-seal pattern).

## 3. Non-goals

- **Not a replacement for Daily Routine.** A Routine is the user's open-ended everyday practice. A Sadhana Program is a *bounded, pre-authored commitment* with a defined length and a completion. Both can be active at once; the Program surfaces alongside the routine, it does not merge into it.
- **No user-authored programs (v1).** Programs are curated bundled JSON. "Build your own N-day sankalp" is a possible follow-up but out of scope — the value is in the curated, culturally-correct arc, not a program editor.
- **No server, no leaderboard, no social.** Local-only. There is no "share your streak with friends" surface; that would import the gamification-and-guilt dynamic this feature deliberately avoids.
- **No content authoring.** Programs reference **existing** sections/chapters/japam mantras from `texts.ts` / `japam.ts`. A program that needs a text we don't ship is out of scope until that text ships.
- **No fasting / vrat rules engine.** A program may be *themed* around a vrat (Shravan Somvar), but the app does not track fasting; it tracks the reciting/japam units.

## 4. User stories

> As a Hanuman devotee, I want to take a **41-day Chalisa sankalp** so that I have a structured, finite commitment with a clear completion — not just an open-ended routine.

> As someone who has always meant to "read the whole Gita," I want an **18-day, one-chapter-a-day** program so the 701 verses become 18 achievable days.

> As an observer of **Navratri**, I want a 9-day program that gives me the right Durga path for each of the nine days, starting on the festival's first day.

> As a working professional, I want the app to understand that **I missed yesterday** — I want to resume my sankalp today without it telling me I "broke" a 30-day streak and lost everything.

> As someone finishing a 41-day anushthan, I want a **पूर्णाहुति moment** — a real acknowledgement that I completed the vow — not just the counter rolling to 41/41.

> As a new user setting up my practice, when I tap "create a routine" I want the option to **pick a ready-made sankalp** instead of building one from a blank page — so I'm not staring at an empty list wondering what to add.

## 5. Concepts & data model

Two clean halves: **catalog** (bundled, authored) and **enrollment** (on-device, per-user).

### 5.1 Program catalog (bundled JSON — authored)

```ts
type SadhanaCadence =
  | { kind: 'consecutive'; days: number }          // 41-day Chalisa: N days from start
  | { kind: 'weekday'; weekday: number; count: number } // Shravan Somvar: all Mondays, capped at count
  | { kind: 'festival-window'; festivalId: string; days: number }; // Navratri: 9 days anchored to a festival date

type SadhanaProgram = {
  id: string;                    // 'hanuman-41', 'gita-18', 'navratri-durga-9'
  titleHi: string;
  titleEn: string;
  subtitleHi: string;            // "इक्कीस दिन का संकल्प"
  subtitleEn: string;
  deity?: Deity;                 // for theming + browse; reuses deities.ts tags
  intro: { hi: string; en: string }; // the sankalp framing shown before enrolling
  cadence: SadhanaCadence;
  // The per-day unit(s). A "day" is an ordered set of RoutineItem-shaped units,
  // reusing the EXACT item shape from routine/types.ts so the reader/japam
  // deep-links and completion resolver are shared, not reimplemented.
  day: SadhanaDay;               // for uniform programs (same unit every day)
  days?: SadhanaDay[];           // for programs whose unit changes per day (Gita ch.1..18, Navratri)
};

// Reuses RoutineItem from src/data/routine/types.ts verbatim.
type SadhanaDay = { items: RoutineItem[] };
```

**Design note — reuse over reinvention.** `RoutineItem` (`section | chapter | japam`, with `chapter` / `targetRounds`) is exactly the reciting-unit abstraction a program day needs. A program day *is* an ordered list of `RoutineItem`s. This means the reader/japam deep-links (`navigateToRoutineItem` in `entryRoutes.ts`) and the completion resolver (`useRoutineToday` / reading-progress + japam targets) are **shared**, not duplicated.

**Seed catalog (v1 — 4 programs, all reference existing content):**

| Program | Cadence | Per-day unit |
|---|---|---|
| Hanuman Chalisa — 41 दिन का संकल्प | `consecutive` 41 | `section: hanuman-chalisa` (auto-completes on last verse-page) |
| श्रीमद्भगवद्गीता — 18 दिनों में | `consecutive` 18, unit changes per day | `chapter: gita` ch. 1…18 (one/day via `days[]`) |
| Navratri — नौ दिन दुर्गा आराधना | `festival-window: navratri` 9 | per-day Durga stotram/chapter (`days[]`) |
| 21-दिन जप संकल्प | `consecutive` 21 | `japam` chosen mantra × N rounds |

### 5.2 Enrollment (on-device — `SadhanaContext`)

```ts
type SadhanaEnrollment = {
  programId: string;
  startedOn: string;         // 'YYYY-MM-DD' (local)
  status: 'active' | 'completed' | 'abandoned';
  // completion is DERIVED per day from the shared resolver; we persist only the
  // per-day done-set so re-derivation is cheap and honest.
  completedDays: Record<number, DayCompletion>;  // dayIndex (1-based) -> how
  completedOn?: string;      // set when the last day completes -> पूर्णाहुति
};

type DayCompletion = { at: string; via: 'read-to-end' | 'japam-target' | 'marked' };
```

- One enrollment per program at a time. Re-enrolling a completed program starts a fresh vow (history is not merged).
- **`dayIndex` is computed, not stored per calendar date.** For `consecutive`, `dayIndex = min(daysSince(startedOn) + 1, N)`. This is what makes grace natural: a missed day does not consume a program day — see §5.3.

### 5.3 Grace model (the ethos-defining decision)

A sankalp is a devotional vow, not a Duolingo streak. The completion contract is **"N days of practice done,"** not **"N consecutive calendar days."**

- **Grace-by-default.** A program day is only "spent" when its unit is completed (read-to-end / japam target / manual mark). If the user opens the app three days later having done nothing, they are still on the same `dayIndex` — the sankalp **paused**, it did not break.
- **The visible streak is informational, not punitive.** We surface *"7 days done · last practiced Tuesday"* — never *"you lost your streak."* The `UserActivityContext` streak still lights up for genuinely consecutive days (a bonus), but the *program* does not fail on a gap.
- **Abandon is explicit and gentle.** There is a "set this sankalp aside" action; nothing auto-fails a vow. Guilt-free by design — this is the single most important line between "authentic practice companion" and "gamified habit app," and it is what protects the calm ethos (see §9).

## 6. Surfaces

Reuses the PRD-07 pattern (embedded entry point + management screens reached through it), so no new tab is introduced.

### 6.0 Primary entry — clubbed into the routine-creation flow (decided)

Rather than a separate discovery surface, the **first step of the existing `CreateRoutineScreen` becomes a fork**:

> **How would you like to begin?**
> **① अपनी साधना बनाएँ / Build your own** — the current flow (name → daily/weekday → add items).
> **② तैयार संकल्प चुनें / Choose a prebuilt sankalp** — pick from the curated `SadhanaProgram` catalog.

Rationale: the create-routine screen is *already* where a user goes with the intent "set up my practice." Meeting them there — with a ready-made, culturally-correct sankalp as the low-effort option next to the blank-canvas builder — removes the empty-page problem and gives the prebuilt programs their highest-intent placement, for free. A separate "Programs" destination would compete for discovery; this piggybacks on an entry point users already reach.

**Interaction:**
- Path ① is the existing PRD-07 create flow, unchanged.
- Path ② lists program cards → tapping one opens `SadhanaProgramDetailScreen` (below). "Begin this sankalp" enrolls and returns the user to the Today view with the program's day already showing.
- The fork is skippable/rememberable enough not to nag a power user who always builds their own (the two options sit side by side; there is no forced modal).

### 6.1 Detail & other surfaces

- **`SadhanaProgramDetailScreen`** — the sankalp framing (`intro`), the day-by-day shape, and a single **"संकल्प लें / Begin this sankalp"** CTA. This is the intentional threshold: taking a vow should feel deliberate.
- **Secondary discovery (optional).** The same program catalog can *also* be surfaced on the Home Discover carousel later, but the routine-creation fork (§6.0) is the primary, sufficient entry for v1.
- **Today integration.** When a program is active, **today's program day** appears as a distinct, visually-marked block in the existing `RoutineTodayScreen` / routine banner — *"संकल्प · Hanuman Chalisa · Day 7 of 41"* — with the same tap-to-open, auto-complete behavior as routine items. It is grouped separately from open-ended routine items so the commitment reads as special.
- **पूर्णाहुति (completion).** On the final day's completion, the existing **full-bloom completion seal** (PRD-10) fires with program-specific copy, and the program moves to a **"Completed sankalps"** shelf on the list screen — a quiet record of vows kept.
- **Reminders (phased).** Reuse `notifications/scheduler.ts` — an active program can schedule a daily nudge deep-linking to today's program day, respecting `NotificationPreferencesContext` and quiet hours.

All screens follow the parchment design system and the bilingual rules in `RULEBOOK.md` §3.

## 7. Phasing

1. **Phase 1 — Foundation (ships value alone).** `SadhanaContext` (+ AsyncStorage), the bundled catalog with the **Hanuman 41-day** and **Gita-18** programs (both `consecutive`), the **build-your-own vs. choose-a-sankalp fork on `CreateRoutineScreen`** (§6.0), `SadhanaProgramDetailScreen`, enroll → derived per-day completion reusing the routine resolver, and the Today block. No reminders, no festival anchoring yet.
2. **Phase 2 — पूर्णाहुति + grace polish.** Completion seal wiring, the "Completed sankalps" shelf, the grace/pause copy pass, abandon flow.
3. **Phase 3 — Reminders.** Per-program daily reminder via the existing scheduler; deep-link to today's day.
4. **Phase 4 — Festival & weekday cadences.** `festival-window` (Navratri, anchored to PRD-01's bundled festival JSON) and `weekday` (Shravan Somvar). These are additive catalog entries + two new cadence branches in the day-resolver.

## 8. Reuse map (what we lean on, not rebuild)

| Need | Existing asset |
|---|---|
| Per-day reciting-unit shape | `RoutineItem` (`src/data/routine/types.ts`) — used verbatim |
| Open content from a unit | `navigateToRoutineItem` (`src/navigation/entryRoutes.ts`) |
| Auto-complete (read-to-end / japam target) | `ReadingProgressContext`, `JapamCounterContext`, `useRoutineToday` resolver |
| Local persistence pattern | `RoutineContext.tsx`, `UserActivityContext.tsx` |
| Streaks / activity | `UserActivityContext` (`logRead` / `logJapaRound`) |
| Completion celebration | PRD-10 full-bloom completion seal |
| Festival dates (Phase 4) | PRD-01 bundled festival JSON / panchang engine |
| Reminders (Phase 3) | `NotificationPreferencesContext`, `notifications/scheduler.ts` |
| Content catalog + deity tags | `texts.ts`, `deities.ts`, `japam.ts` |

## 9. Why it won't ruin the product

- **100% offline / bundle-only.** Program definitions are bundled JSON; enrollment is `AsyncStorage`. No backend, login, ads, or commerce — the moat is untouched.
- **Additive & opt-in.** The library, free-reading, Daily Bhakti, and Daily Routine are all unchanged. A sankalp is a *mode the user chooses to enter*, never a wall.
- **Grace over gamification (§5.3).** Framed as *sankalp and पूर्णाहुति*, not streaks-and-guilt. A missed day pauses; it never shames. This is what keeps a retention feature from corroding the calm, devotional identity — the feature drives return *because* it is authentic, not because it punishes.

## 10. Decisions & open questions

**Decided:**
- Reuse `RoutineItem` for program days rather than a parallel unit type (§5.1).
- Grace-by-default: the vow is "N days done," not "N consecutive calendar days" (§5.3).
- Curated catalog only for v1; no user-authored programs (§3).
- Programs live alongside — not inside — Daily Routine as *practice objects* (§3), **but share a single entry point**: the create-routine flow forks into "build your own" vs. "choose a prebuilt sankalp" (§6.0). Clubbing the entry avoids a competing discovery surface and solves the blank-page problem.
- Primary entry is the routine-creation fork; a Discover-carousel placement is optional/secondary (§6.1).

**Open:**
1. **Seed catalog scope for Phase 1** — ship 2 programs (Hanuman-41, Gita-18) or 4? Default: 2 consecutive programs first, festival/weekday in Phase 4.
2. **One active enrollment per program, or fully concurrent multi-program?** Default: one enrollment per program id; multiple *different* programs may be active at once.
3. **Fork default & memory** — should the create-routine fork remember a power user's preference for "build my own," or always present both? Default: always show both side-by-side (no forced modal); revisit if it annoys.
4. **Does an enrolled sankalp also appear in the routine list**, or only in the Today block + Completed shelf? Default: it shows as a distinct, badged block in Today and on a "Sankalps" shelf, kept visually separate from user-built routines.

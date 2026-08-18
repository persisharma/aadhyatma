# PRD-14 · Phase 2 — Daily Muhurat Notifications (राहु काल चेतावनी · प्रातः मुहूर्त सार)

| | |
|---|---|
| **Status** | Proposed — detail PRD for the final phase; prototype attached |
| **Parent PRD** | [`14-daily-muhurat.md`](./14-daily-muhurat.md) (Phase 2 of §6 — **the only remaining phase; PRD-14 is complete when this ships**) |
| **Parent TRD** | [`../trds/14-daily-muhurat.trd.md`](../trds/14-daily-muhurat.trd.md) (§13 reserved this phase for the scheduler) |
| **Prototype** | [`docs/muhurat-notifications-prototype.html`](../../muhurat-notifications-prototype.html) — settings, both lock-screen notices, landed detail |
| **T-shirt size** | S (one pure planner + glue + headless scheduler + two settings cards; every input already computed) |
| **Feasibility** | ✅ `muhurat.ts` already yields Rahu Kaal / Abhijit / choghadiya as absolute `Date`s from the shared day store; the notification architecture ships seven families with an identical shape to mirror. |

> **This is the final phase of PRD-14.** Phase 1 (compute + glance card + detail + share) and the parent's "home-tab glance" idea (shipped as Home's Today strip, PRD-16 work) are done. No further PRD-14 phases exist or are planned — anything beyond this document is a new PRD.

**Bundle-only:** local notifications via `expo-notifications`, planned from windows the engine already solves. No network, no new dependency, OTA-shippable JS.

## 1. Problem

Phase 1 made "is now a good time?" answerable **when the user opens the app**. But the two highest-value moments are exactly when the app is closed: (a) *just before Rahu Kaal begins* — the whole point of knowing it is to not start something in it — and (b) *first thing in the morning*, when the day's tasks get slotted against its windows. Every incumbent panchang app ships a Rahu Kaal alert; Vedansh computes the window to the minute and then stays silent.

## 2. What ships — two alerts, both opt-in, both OFF by default

| | **राहु काल चेतावनी** (Rahu Kaal warning) | **प्रातः मुहूर्त सार** (morning muhurat digest) |
|---|---|---|
| Cadence | one per day, `leadMinutes` before Rahu Kaal starts | one per day, at a user-chosen morning time |
| Default | **off** (opt-in) | **off** (opt-in) |
| Lead / time | 10 / 15 / **30 (default)** min before the window | default **06:30**, steppable, clamped 05:00–11:00 |
| Content | the day's Rahu Kaal range | Abhijit + the day's auspicious day-choghadiya + the Rahu Kaal caution |
| Tap → | `PanchangTab → MuhuratDetail { dateMs: today }` | `PanchangTab → PanchangHome { dateMs }` (lands on the calendar view, `MuhuratGlanceCard` in place) |

**Why exactly these two, and why off by default.** The parent PRD floated "Rahu Kaal soon / auspicious window now". A per-window "auspicious window starting" alert is rejected: there are 4–5 auspicious day-choghadiya every day, so it means 4–5 pushes/day — the notification-fatigue pattern that gets an app's permission revoked wholesale, taking the daily verse and japam alarms down with it (one OS grant covers all families). The **digest folds all of the day's windows into one morning notice**, which is the planning moment anyway; the **Rahu warning is the single time-critical alert** the category actually values. And unlike the festive family (18 notices/*year*, default-on), these fire **every day** — a default-on daily push nobody asked for is how devotional apps become uninstalls. Opt-in keeps the marginal pending-budget cost of this phase **zero** for every user who doesn't flip a switch.

**Default lead = 30 min**, matching the shipped `WINDOW_LEAD_MINUTES = 30` that `clampDayOf` uses in `muhuratReminderPure.ts` — the two "before the window" notions in the app must agree. 10/15 are offered because "about to step out" users asked incumbents for tighter leads; nothing shorter, since delivery is not guaranteed to the second.

## 3. What does NOT ship (locked)

1. **No per-choghadiya alerts** ("Amrit starting now") — fatigue, see §2. The digest is the answer.
2. **No night-choghadiya alerts, and the digest covers daytime only.** Night windows (sunset → next sunrise) cross midnight; a "tonight's Amrit at 2:47 AM" push is noise for a devotional daily-planning audience, and a midnight-crossing notice is ambiguous about *which* civil day it belongs to. The night table remains one tap away on `MuhuratDetail`. A user who needs a specific night muhurat has the **muhurat-follow family** (PRD-16 §6.7), which alerts on exactly the windows they chose.
3. **No Gulika/Yamaganda alerts** — Rahu Kaal is the only kaal with mass daily-avoidance behaviour; three avoid-alerts a day is fatigue again. Both stay on card + detail.
4. **No smart suppression** ("skip the digest if the app was opened") — a local notification is scheduled in advance; the OS offers no "cancel if app was used" hook, and re-arming on foreground already refreshes content.
5. **No new visual language** — settings reuse the existing card/toggle/`TimeStepper` spec; notices are plain OS notifications.

## 4. Differentiation from the shipped muhurat-follow family (do not conflate)

| | `muhurat-reminder` (shipped, PRD-16 §6.7) | **`daily-muhurat` (this phase)** |
|---|---|---|
| Trigger | the user **followed a dated one-shot** (occasion + one civil day) | a **recurring daily timing**, no follow object at all |
| Source of truth | `MuhuratFollowContext` + `verdictForDate` (event grading) | `computeMuhuratDay` over the day store — pure arithmetic, no grading |
| Cap / ranking | `MUHURAT_REMINDER_CAP = 8`, soonest-first over follows | `DAILY_MUHURAT_CAP = 8`, soonest-first over days (§6) |
| Prefs home | per-follow `VratReminderSheet` on the day detail | two global toggles in **Reminder Settings** |
| Identifier prefix | `muhurat-reminder` | `daily-muhurat` (see §7 — deliberately NOT an extension of any existing prefix) |
| Deep link | `MuhuratDayDetail { occasionId, dateMs }` | `MuhuratDetail { dateMs }` / `PanchangHome { dateMs }` |

## 5. Architecture — the eighth family, same three-layer shape

Mirror `muhuratReminderPure.ts` / `muhuratScheduler.ts` / `MuhuratReminderScheduler.tsx` end-to-end:

```
panchangDayStore (persisted solves; hydratePanchangDays → cachedDayInputs)
        │  sunrise/sunset per day (+ next day's sunrise)
        ▼
computeMuhuratDay (existing, pure)            prefs (NotificationPreferencesContext)
        │  rahu / abhijit / dayChoghadiya            │
        ▼                                            ▼
dailyMuhuratReminderPure.ts   ── PURE planner: (days[], prefs, now) → planned[] ≤ cap
        │
        ▼
dailyMuhuratScheduler.ts      ── glue: prefix-scoped cancel → scheduleNotificationAsync
        │
        ▼
<DailyMuhuratReminderScheduler>  ── headless, in App.tsx INSIDE PanchangLocationProvider
```

- **Planner is pure** (`now` parameterised, no `Date.now()`, no expo imports, no astronomy) so it runs under `tsx --test` via `npm run test:data` — the family rule, not Jest.
- Planner input is a `DailyMuhuratDayInput[]` of already-solved days (`dateKey`, `date`, `rahu: {start,end}`, `abhijit`, auspicious day-choghadiya) + a prefs snapshot. The **glue** derives those via `hydratePanchangDays` + `cachedDayInputs` + `computeMuhuratDay` — never a private cache (RULEBOOK §17.6), never a persisted window (a stored time lies on city change, same law as the follow family).
- Headless component sits **inside `PanchangLocationProvider`** (it reads the panchang location, like `MuhuratReminderScheduler`), runs behind `InteractionManager`, and only schedules when permission is already `granted`.

## 6. iOS pending-budget math + horizon (RULEBOOK §17.6)

**Horizon: `DAILY_MUHURAT_HORIZON_DAYS = 4`** — today + the next 3 days.

- **Budget arithmetic:** Rahu warning 1/day × 4 days + digest 1/day × 4 days = **8 slots = `DAILY_MUHURAT_CAP = 8`** (matching `MUHURAT_REMINDER_CAP`'s modesty). The seven existing families already over-subscribe iOS's shared `IOS_PENDING_CAP = 64` in the worst case (daily verse up to 64, vrat 24, sadhana 18, festive 8, muhurat-follow 8, pitru smaran 8, pitru paksha ≤4 — wiki `notifications` Gotcha #1). This family adds **at most 8 and typically 0** (both toggles off by default). Capping is soonest-first with an identifier tie-break, so under pressure the alerts that survive are the ones about to fire.
- **Why not 30 days like the verse window?** A long horizon exists to cover absent users — but these alerts fire *daily*; a user absent 4 days has not formed the habit they serve, and every foreground re-arms the window anyway. A 30-day horizon would burn 60 slots to serve nobody.
- **Why 4 ≤ 7:** `panchangDayPrewarm.ts` keeps `PREWARM_DAYS = 7` days past today solved and persisted, and RULEBOOK §17.6 requires any new daily surface to **read inside that window, never sit on its edge**. Reading days 0–4 (day 4 needed only for day 3's `nextSunrise` argument) stays comfortably inside the prewarmed 0–7, so a re-arm is a hydrate, not fresh astronomy — and never extends the prewarm.

## 7. Idempotent scheduling, dedupe, identifier prefix

- Prefix **`daily-muhurat`**, identifiers `daily-muhurat:rahu:<dateKey>` and `daily-muhurat:digest:<dateKey>` — deterministic, so a re-plan of unchanged inputs yields byte-identical ids.
- Re-arm = **prefix-scoped cancel, then schedule the planned set** (the `cancelAllMuhuratReminders` pattern in `muhuratScheduler.ts`). Idempotent; safe on every trigger in §8.
- **Prefix-collision rule (new families must check this):** cancels filter with `identifier.startsWith(prefix)`. `daily-muhurat` neither extends nor is extended by any shipped prefix (`daily-verse`, `vrat-reminder`, `muhurat-reminder`, `festive-reminder`, `pitru-smaran-reminder`, `pitru-paksha-reminder`, japam) — note that e.g. `muhurat-reminder-daily` would have been silently cancelled by the follow family's sweep. A tsx test pins mutual non-prefixing across all eight.
- **Android:** own channel `daily-muhurat-reminders` (importance DEFAULT) so daily timing pushes mute independently of the verse and festivals. Channel attributes are pinned at creation — changing them later needs the `-v2` dance (wiki gotcha).

## 8. Re-plan triggers, location & timezone interplay

Every window is **sunrise-derived**, so the trigger set is the follow family's, plus prefs:

1. **Location change** — a city change moves every window; scheduled absolute fire dates are stale the moment it happens. Re-derive from the store and re-arm (pinned by test: the Rahu fire time MOVES between Ujjain and Bengaluru).
2. **Calendar-system change** — doesn't move sunrise, but it scopes `panchangDayStore` keys; re-arm to read the right scope (same dep the follow scheduler carries).
3. **Foreground** (`AppState` → active) — rolls the 4-day window forward and catches device-clock/timezone changes.
4. **Prefs change** (either toggle, lead minutes, digest time) and **permission change** — a hard `denied` cancels all and flips both stored toggles off (the `NotificationPreferencesContext` convention: an "on" switch the OS will never deliver is a lie).
5. **Reading-language change** — copy is baked at schedule time through `contentByLang` (gu/kn re-script the Devanagari), so `lang` is an effect dep, as in `FestiveReminderScheduler`.

**Timezone:** the engine solves device-local civil days against the chosen location's coordinates, and every fire date is an **absolute instant** (`SchedulableTriggerInputTypes.DATE`), so delivery is timezone-proof by construction. IST is DST-free, so for the India audience a scheduled instant never drifts against wall-clock intent. A traveller whose device timezone changes gets corrected on the next foreground re-arm (trigger 3); between landing and first app-open the *instants* are still astronomically correct for the chosen city — the same contract the follow family ships.

## 9. Permission flow & settings UX

- Both toggles live in **`ReminderSettingsScreen`** (More → स्मरण · Reminders), as two new cards **below the Festival-reminders card**, in its exact card/toggle spec: a **राहु काल चेतावनी** card whose toggle reveals a lead-time row (10/15/30 min segmented chips), and a **प्रातः मुहूर्त सार** card whose toggle reveals the shared `TimeStepper` (clamped 05:00–11:00). Subtitles read constants off the planner (`FESTIVE_CLOCK` pattern) so copy can't drift.
- Turning a toggle ON while permission is not granted routes through the shared flow: `requestNotificationPermission()` (`notifications/permissionState.ts` — the module that disambiguates Android's fake `denied` from a real refusal via the app-wide `@vedansh/notif-permission-asked` flag). The pref persists `true` only after a grant; a refusal leaves it honestly off. The screen's existing denied-banner (ask-again vs open-Settings, keyed on `canAskAgain`) covers these cards for free.
- Prefs extend `@vedansh/notif-prefs` (`NotificationPreferencesContext`): `rahuKaalAlertEnabled` (default **false**), `rahuKaalLeadMinutes` (default 30), `muhuratDigestEnabled` (default **false**), `muhuratDigestTime` (default `{hour: 6, minute: 30}`). **`parsePrefs` gotcha, inverted:** "a missing key means default" resolved absent `festiveRemindersEnabled` to `true`; here the default is `false`, so upgraders are correctly OFF with no migration.
- The digest default **06:30** deliberately avoids the 07:00 daily-verse default and the 07:30 festive slot — three same-minute morning pushes read as spam.

## 10. Copy spec (Devanagari-first; no emoji, per design.md §5)

| Notice | Title | Body (hi-led; gu/kn re-script via `contentByLang`) |
|---|---|---|
| Rahu warning | `राहु काल चेतावनी` | `राहु काल 30 मिनट में — 3:44 – 5:21 PM · Rahu Kaal begins soon` (lead + `formatRangeCompact` range) |
| Digest | `आज के शुभ मुहूर्त` | `अभिजित 12:05 – 12:57 · शुभ चौघड़िया 9:18 AM से · राहु काल 3:44 – 5:21 PM से बचें · Today's windows` |

- Ranges via the existing pure `formatRangeCompact` (`muhuratFormat.ts`) — the shared meridiem convention the Today strip uses.
- Digest body caps at ~170 chars: Abhijit (omit row if `null`), the **first** auspicious choghadiya start, the Rahu range. Never an enumeration of all eight windows — the tap lands on the full table.
- **Quiet hours:** the digest's steppable time is clamped to 05:00–11:00 in both UI and planner (planner clamps defensively, since a pref written by a future build must not fire a 2 AM push). The Rahu warning is quiet-safe **by construction**: `RAHU_SEG`'s earliest segment is the 2nd daytime eighth, so the earliest possible fire is ≈ sunrise + 1½ h − lead — never at night.

## 11. Edge cases

| Case | Handling |
|---|---|
| Rahu Kaal already started (or passed) at plan time | Planner keeps only fires strictly `> now` — today's alert is silently skipped, tomorrow's is armed. Never a late "starting soon" for a window already open. |
| Toggle flipped ON during Rahu Kaal | Same rule: today yields nothing; the settings card subtitle sets the expectation ("कल से"). |
| Digest time already past at plan time | Today's digest is skipped by the same `> now` filter; the day-1..3 digests still arm. |
| Digest and Rahu fire near-collide (e.g. Monday's early Rahu ≈ 7:42 AM vs a 07:15 digest) | Both fire — different jobs; the digest already names the Rahu range so the pair reads coherently. No suppression logic. |
| Abhijit collapses (`abhijit: null`) | Digest omits that clause; never blocks the notice. |
| Degenerate day (`sunset ≤ sunrise` etc. — the `composeSolved` guard) | That day contributes no candidates; planner skips it, like the prewarm skips unsolvable days. |
| Midnight-crossing night choghadiya | **Out of alert scope entirely** (§3.2) — no window that crosses a civil-day boundary is ever named in either notice. |
| Location/calendar/timezone change | §8 — re-arm re-derives; nothing persisted. |
| Permission revoked in OS Settings | Next foreground read flips the effective status; scheduler cancels all; toggles flip off per the shared convention. |
| Stale notification tapped after an OTA | Payload carries only `{ type, kind, dateMs }`; `MuhuratDetail { dateMs }` and `PanchangHome { dateMs }` are date-driven screens that recompute from the date — nothing to validate against a retired registry (unlike the follow family's `occasionId`). |

## 12. Deep links (`deepLink.ts` + `entryRoutes.ts`)

- Payloads: `{ type: 'daily-muhurat', kind: 'rahu' | 'digest', dateKey, dateMs }`.
- `kind: 'rahu'` → `navigate('PanchangTab', panchangTabTarget('MuhuratDetail', { dateMs }))` — the Phase-1 detail screen, Rahu row in view. `panchangTabTarget` is mandatory (`initial: false`, or a cold-start tap makes the detail the lazily-mounted stack's initial route and strands the calendar).
- `kind: 'digest'` → `navigate('PanchangTab', panchangTabTarget('PanchangHome', { dateMs }))` — the calendar view with the `MuhuratGlanceCard` for that day; the card *is* the digest, expanded.
- Both handled in `handleNotificationResponse` beside the `muhurat-reminder` branch; covered in `deepLink.jest.test.tsx`.

## 13. Test plan

| Layer | Suite | Runner | Pins |
|---|---|---|---|
| Pure planner | `dailyMuhuratReminderPure.test.ts` | **tsx** (`npm run test:data`) | fire = rahu.start − lead for each of 10/15/30; `> now` skip (started/past Rahu, past digest time); digest clamp 05:00–11:00; cap = 8 soonest-first + id tie-break; deterministic identifiers; degenerate-day skip; copy (Devanagari-first, `formatRangeCompact` ranges, null-abhijit omission); **prefix mutual non-extension across all eight families** |
| Glue | `dailyMuhuratScheduler.jest.test.ts` | Jest (`.jest.test.ts` — imports expo-notifications) | prefix-scoped cancel leaves seeded `muhurat-reminder:*` / `daily-verse*` slots untouched (non-vacuous: seed both); payload shape; channel id |
| Headless | `DailyMuhuratReminderScheduler.test.tsx` | Jest | Rahu fire time MOVES Ujjain→Bengaluru; re-arm on calendar-system/foreground/lang; permission-denied and both-toggles-off cancel everything; reads via `hydratePanchangDays` (no private cache) |
| Deep links | `deepLink.jest.test.tsx` (extend) | Jest | rahu → `MuhuratDetail{dateMs}`; digest → `PanchangHome{dateMs}`; both through `panchangTabTarget` |
| Settings | `ReminderSettings` render test + `.maestro/reminders-smoke.yaml` (extend) | Jest / Maestro | cards **present** only — Maestro cannot flip a toggle (native permission dialog) nor drive a notification tap; wiki `notifications` gotcha |

## 14. Module inventory

**New:** `src/notifications/dailyMuhuratReminderPure.ts` (+ tsx test), `src/notifications/dailyMuhuratScheduler.ts` (+ jest test), `src/components/DailyMuhuratReminderScheduler.tsx` (+ test).
**Edited:** `contexts/NotificationPreferencesContext.tsx` (four prefs + parse defaults), `screens/ReminderSettingsScreen.tsx` (two cards), `notifications/deepLink.ts` (+ payload branch), `App.tsx` (mount headless inside `PanchangLocationProvider`), `package.json` (`test:data` glob already covers the dir).
**Doc-sync obligations (design-doc-sync rule):** design.md — extend the Reminders-settings section with the two cards and add the notices' copy spec; RULEBOOK — extend the notification-family enumeration (§ the seven-families references) to eight; wiki `notifications` page re-ingested post-merge (llm-wiki skill).

## 15. Design compliance

Settings cards: existing card spec (radius 18 / padding 18, `parchmentSoft`, `divider`, saffron track) — zero new tokens. Notices are OS-rendered — no emoji in copy (§5), quality conveyed in words (चेतावनी / शुभ), Hindi-led with Latin secondary (§1/§3). The prototype uses only the shipped palette.

## 16. Rollout & success

- **OTA-safe:** pure JS over the existing engine and `expo-notifications`; the only store-sensitive piece is the new Android
  channel, which `expo-notifications` creates at runtime — no native rebuild, no feature flag. Ship planner + glue + settings
  together (a toggle with no scheduler behind it is a lie, and vice versa).
- **Sequencing inside the release:** land the pure planner + tsx suite first (reviewable in isolation, like every family),
  then glue + headless + deep links, then the settings cards — the cards are the only user-visible switch, so nothing fires
  until the whole chain is in.
- **Success looks like:** opt-in rate on the two toggles (local counter only — no analytics backend exists or is wanted),
  and the qualitative one the category is judged on: the Rahu warning **always lands before the window**, in the user's
  city's real times, with zero pushes for everyone who never opted in. There is no engagement target that would tempt a
  default-on flip; §2's fatigue argument is the durable decision.
- **Kill-switch:** turning both prefs off cancels every `daily-muhurat:*` slot on the next scheduler pass — the same
  cancel-all path the permission-denied branch uses, so "off" is verified by the same test.

## 17. Open questions (to close during build, not new phases)

1. **Digest scope on a festival day** — should the digest's body lead with the festival greeting when the fire date is one of the 18 festive-catalog days, or stay purely timing? Proposal: stay timing-only; the festive family already owns the greeting 60 minutes later. Decide at copy review.
2. **Second auspicious clause** — body currently names only the *first* auspicious choghadiya start; is "शुभ चौघड़िया 9:18 AM से" enough, or should it carry the count ("+3 और")? Decide against real device lock-screen truncation.
3. **Lead-time options** — 10/15/30 shipped; confirm 30-default against user feedback in the first release, then freeze.

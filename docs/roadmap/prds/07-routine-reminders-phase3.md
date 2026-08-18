# PRD-07 · Phase 3 — Per-Routine Reminders (साधना स्मरण)

| | |
|---|---|
| **Status** | Proposed — detail PRD for the final phase; prototype attached |
| **Parent** | [07-daily-routine-sadhana.md](./07-daily-routine-sadhana.md) §7 item 3 |
| **Prototype** | [docs/routine-reminders-prototype.html](../../routine-reminders-prototype.html) |
| **Target release** | TBD — OTA-shippable (pure JS, no native module changes → EAS Update) |
| **T-shirt size** | S–M (one PR: planner + glue + scheduler component + detail-screen row + deep link) |
| **Feasibility** | High — mirrors the shipped PRD-11 sadhana-reminder family end to end |
| **Owner** | TBA |

---

**Local-first constraint:** reminders are **local notifications only** (`expo-notifications`), planned and scheduled on-device exactly like the seven shipped families (`daily-verse`, `vrat-reminder`, `muhurat-reminder`, `festive-reminder`, `pitru-smaran-reminder`, `pitru-paksha-reminder`, japam alarms). No server push, no network, no account. The reminder time lives on the routine record in `AsyncStorage` (`@vedansh/routines`).

**This is the final phase of PRD-07. There are no phases beyond this one.** Phase 1 (foundation), Phase 2 (vaar/weekday) shipped long ago; Phase 4 (calendar/sankalp) was delivered in full by [PRD-11 Sadhana Programs](./11-sadhana-programs.md) and must not be re-scoped here.

---

## 1. Problem

A routine is a *commitment* — "this is what I read every morning" — but the app only honours it while open. Every other standing commitment in the app can already tap the user on the shoulder: an enrolled sankalp nudges daily (`SadhanaReminderScheduler`), a followed vrat warns in advance, a japam alarm rings. A hand-built routine — the feature whose whole premise is *deliberate, repeated* practice — is the one commitment that stays silent. Users who built a नित्य साधना and then miss a day get nothing; the streak machinery quietly notices, the notification machinery does not.

The gap is sharpest for **weekday routines**: "Hanuman Chalisa on Saturdays" is exactly the kind of once-a-week practice a person forgets, and exactly the case a naive daily reminder would get wrong by nagging on the six days nothing is scheduled.

## 2. Goal

Let a user attach an **opt-in reminder time to each routine** (off by default, one time per routine), which:

- fires **daily** for `daily` routines and **only on scheduled days** for `weekday` routines;
- carries **Devanagari-first copy** naming the routine;
- deep-links, on tap, to **`RoutineToday`** (Today's Practice) — the same landing the shipped `sadhana-reminder` tap uses;
- is **suppressed for today** once today's items are all complete (see §7 decision);
- stays honest about the OS permission via the shared `permissionState.ts` machinery, and honest about the **shared iOS 64-pending budget** via a small hard cap.

## 3. Non-goals

- **No new phases.** This PRD closes PRD-07. Calendar/sankalp lives in PRD-11; nothing further is planned.
- **No multiple times per routine.** One optional time. A second practice at a second time is a second routine — the model PRD-07 already established ("As someone with two practices, I want separate routines").
- **No per-item reminders.** The unit of reminding is the routine, matching the unit of the RoutineToday ledger. Item-level alarms exist already for japam ([[japam-alarms]] tier).
- **No advance/evening-before notice.** That is vrat/pitru semantics (a dated observance you prepare for). A routine is same-day practice; one nudge at the chosen time.
- **No change to the shared Daily-Bhakti reminder times** (`prefs.times`). Sadhana reminders reuse that shared time deliberately; routines get a *per-routine* time because the parent PRD promised one (§7 item 3) and because two routines ("प्रातः" and "संध्या") only make sense at two different times.
- **No native alarm tier.** `expo-notifications` date triggers only — this is what keeps the phase OTA-shippable.

## 4. Data model — one additive optional field

`mobile/src/data/routine/types.ts`:

```ts
export type RoutineReminder = { hour: number; minute: number }; // local time

export type Routine = {
  id: string;
  nameHi: string;
  nameEn: string;
  mode: RoutineScheduleMode;
  items: RoutineItem[];
  createdAt: number;
  /** Per-routine reminder time. Absent/undefined = reminders off (the default). */
  reminder?: RoutineReminder;
};
```

- **Presence is the switch.** `reminder` set ⇒ on; deleted ⇒ off. No parallel `reminderEnabled` boolean to drift out of sync (contrast: sadhana keeps a separate `@vedansh/sadhana-reminders` id list because programs are catalog data the user doesn't own; a routine record *is* user data, so the field belongs on it).
- **Migration is free.** The field is additive and optional; `RoutineContext.tsx`'s `isRoutineArray` guard (`'id' in r && 'items' in r`) accepts old records unchanged, and old builds reading a new record simply ignore the key. No storage-version bump, no migration code.
- **New context API** (`RoutineContext.tsx`): `setReminder(routineId, reminder | undefined)` — persists through the existing `persistRoutines` path so the headless scheduler's `routines` dependency re-arms automatically.

## 5. UX spec (keyed to the prototype)

### 5.1 RoutineDetail — the reminder row (prototype frame A)

A new **स्मरण / REMINDER** card on `RoutineDetailScreen`, below the weekday strip / above the item list:

- A toggle row — `दैनिक स्मरण` / *Daily reminder* (for `weekday` routines: `साप्ताहिक स्मरण` / *Weekly reminder*) — default **off**.
- When on, a `TimeStepper` row (reuse `mobile/src/components/TimeStepper.tsx`, the same control `ReminderSettingsScreen` and `JapamAlarmsScreen` use) defaulting to **07:00**. The daily verse defaults to 07:00 and festive to 07:30; a routine reminder is user-chosen, so a collision is the user's own schedule — no offset games.
- A caption under the stepper, **weekday-aware**: for `daily` routines *"प्रतिदिन इसी समय · every day at this time"*; for `weekday` routines it lists the union of the routine's item-weekdays — e.g. *"केवल सोम · शनि — इस साधना के दिनों पर · only Mon · Sat, this sadhana's days"*. If the union is empty (a weekday routine with no items yet) the caption warns *"कोई दिन निर्धारित नहीं — पहले सामग्री जोड़ें"* and nothing is scheduled.
- All strings follow the bilingual house rules (RULEBOOK §3): Devanagari via `scriptBodyFont`, no `letterSpacing` on Devanagari, captions in the `meaning` face.

### 5.2 The opt-in / permission moment (prototype frame B)

Turning the toggle **on** is the permission gate — the scheduler itself never prompts (same contract as `SadhanaReminderScheduler`: "we only schedule when it is already granted, and never prompt from here").

- Effective state comes from `NotificationPreferencesContext.permissionStatus`, which is built on `notifications/permissionState.ts` — including its **Android quirk**: a never-requested `POST_NOTIFICATIONS` reports `denied + canAskAgain: true`, which `resolveNotificationPermission` maps back to `undetermined` unless the app has genuinely prompted before (`@vedansh/notif-permission-asked`). Reading raw `status` alone would wrongly treat every fresh Android install as a refusal.
- `undetermined` → call `requestPermission()` (shared, app-wide — whichever family asks first answers for all). **Persist `reminder` only after a grant** — the Pitru-Smaran honesty pattern: a refusal leaves the routine saved with the toggle honestly off, never an "on" switch for pushes the OS will not deliver.
- Hard `denied` (`canAskAgain: false`) → the toggle row is replaced by the shared settings-path banner (as on `ReminderSettingsScreen`): *"सूचनाएँ बंद हैं — Settings में सक्षम करें"*.
- If the OS grant is later revoked, the headless scheduler cancels all `routine-reminder` slots (mirror of `cancelAllSadhanaReminders` on `permissionStatus !== 'granted'`); the stored `reminder` field is left intact so re-granting restores it without re-setup.

### 5.3 The notification (prototype frame C)

Devanagari-first copy, mirroring `formatSadhanaReminderContent` in shape:

- **Title:** `नित्य साधना स्मरण`
- **Body:** `«nameHi» · आज की साधना` — falling back to `nameEn` when `nameHi` is empty (routine names are user-entered, either field may be blank).
- **No live counts** ("2 of 5 left") in the copy: content is **baked at schedule time, not fire time** (a family-wide invariant), so any count would be stale by the moment it fires. The name is stable; progress is what `RoutineToday` shows on tap.
- Android: default channel (importance DEFAULT), like sadhana reminders — no new channel, so nothing to `-v2`-migrate later.

### 5.4 Tap → RoutineToday (prototype frame D)

Payload `{ type: 'routine-reminder', routineId, dateKey }`; `handleNotificationResponse` in `mobile/src/notifications/deepLink.ts` gains a `routine-reminder` branch that dispatches `HomeTab → RoutineToday` — byte-for-byte the `sadhana-reminder` landing, and for the same reasons: RoutineToday is where *all* of today's practice lives (this routine, other routines, active sankalps), and a lock-screen tap must never land inside a reader where a `setProgress` effect could clobber the resume position. Routing is gated on `type` only; `routineId` rides along as a record. A stale notification for a since-deleted routine still lands safely — RoutineToday simply doesn't show it.

## 6. Architecture — the proven three-piece shape

Mirror the sadhana family file-for-file (all under `mobile/src/`):

| Piece | New file | Mirrors |
|---|---|---|
| Pure planner | `notifications/routineReminderPure.ts` | `notifications/sadhanaReminderPure.ts` |
| Scheduling glue | `notifications/routineScheduler.ts` | `notifications/sadhanaScheduler.ts` |
| Headless arm-er | `components/RoutineReminderScheduler.tsx` (mounted in `App.tsx` inside `NotificationPreferencesProvider` + `RoutineProvider`) | `components/SadhanaReminderScheduler.tsx` |

- **Identifier prefix `routine-reminder`** — the eighth prefix; slot ids `routine-reminder:{routineId}:{dateKey}` so the cancel-then-reschedule cycle (`cancelAllRoutineReminders` filters `getAllScheduledNotificationsAsync` by prefix) can never touch another family's slots.
- **Planner purity:** `planRoutineReminders(inputs, now, windowDays?, cap?)` — no `Date.now()`, no `expo-notifications`, no imports beyond constants; `now` always parameterised. Input per routine: `{ routineId, order, nameHi, nameEn, time, days: 'daily' | number[], completedToday?: boolean }`. The **weekday filter is planner logic**: for `days: number[]`, only fire dates whose local weekday is in the set are candidates (empty set ⇒ no candidates).
- **Glue** cancels-then-schedules with `SchedulableTriggerInputTypes.DATE` triggers, per-slot failures non-fatal, exactly as `scheduleSadhanaReminders`.
- **Headless component** re-arms on: `routines` (any create/delete/rename/re-time/reminder change), `permissionStatus`, foreground tick (`AppState` → the rolling window advances with the calendar), and today's per-routine completion signal (§7). Cancels everything when permission is not granted. Renders nothing.

### 6.1 iOS pending-budget math

iOS silently drops everything past **64 pending** local notifications (`IOS_PENDING_CAP` in `notifications/pure.ts`). Current worst-case claims: daily verse up to 64 (4 times × 16 days via `computeFireDatesMulti`), vrat 24, sadhana 18, festive 8, muhurat 8, pitru smaran 8, pitru paksha ≤ 4 — the per-family caps are honest but the **sum (~134) already over-subscribes the OS cap** (documented wiki gotcha: audit before adding). This family therefore stays deliberately small:

- **`ROUTINE_REMINDER_CAP = 12`** and **`ROUTINE_WINDOW_DAYS = min(7, ROLLING_WINDOW_DAYS)`** — routines may consume at most 12 of the 64 slots, over a 7-day horizon.
- Sizing: one daily routine = 7 slots; two = 14 candidates → capped at 12. A weekday routine claims only its scheduled days (Sat-only = 1/week). A 7-day horizon is enough because the scheduler **re-arms on every app foreground** — the window only has to outlast an absence, and a user absent longer than a week has the (uncapped-by-us) daily verse still nudging.
- Capping is **priority-first** like sadhana (order = position in the `routines` array, i.e. creation order — the user's first routine is presumed primary), soonest-fire as tie-break.

## 7. Suppression when today is already done — **decided: yes, best-effort cancel**

**Decision:** when every item of a routine scheduled for today is complete **before the reminder fires**, today's slot for that routine is cancelled. Rationale: the app's completion story is *honesty* (auto-complete only on genuinely reaching the last verse-page); a 6 pm reminder for a practice finished at 7 am is the opposite — it tells the user the app isn't paying attention, and trains them to ignore the whole family.

**Mechanism (stays pure):** the planner takes `completedToday: boolean` per routine and simply skips the `dateKey === today` candidate for it — tomorrow onward is always planned, because completion is a per-day fact. The glue derives `completedToday` from the same composition `useRoutineToday()` uses (manual marks + ReadingProgress + UserActivity day totals), per routine; the headless component lists that signal in its effect deps so finishing the last item re-arms and drops today's slot.

**Accepted limitation (stated, not hidden):** suppression is **best-effort — it only happens while the app is running**, since completion is derived on-device and there is no server. Complete your practice, background the app, and the cancel has already happened (the effect ran on the completion-state change); but a completion the app never observed (offline recitation never marked) obviously cannot suppress. This is the same trade every derived-completion surface in the routine subsystem makes, and it is why suppression is a planner *input*, not a fire-time check (expo local notifications cannot run code at fire time).

## 8. Edge cases

| Case | Behaviour |
|---|---|
| **Routine deleted** | `routines` dep changes → re-arm cancels all `routine-reminder:` slots and replans from the surviving set. A race where the OS fires a stale slot first: tap lands on RoutineToday, which is safe (§5.4). |
| **Routine renamed** | Copy is baked at schedule time → the re-arm on `routines` change rebakes every slot with the new name. Same for a changed reminder time. |
| **Reminder time changed** | Full cancel-then-reschedule; the old time's slots cannot survive because the identifiers are date-keyed, not time-keyed, and the whole prefix is cancelled first. |
| **All items done before the reminder fires** | Today's slot suppressed (§7), tomorrow's untouched. |
| **Weekday routine's item-days edited** | Union recomputed on re-arm; days dropped from the union lose their future slots. |
| **Weekday routine with zero items / empty union** | Planner yields no candidates; detail caption says so (§5.1). |
| **Device reboot** | iOS restores pending locals natively; Android is restored by expo-notifications' boot receiver — and the next app open re-arms regardless (foreground tick), so drift self-heals within one launch. |
| **Permission revoked in OS settings** | Next read of `permissionStatus` → glue cancels the family; `reminder` field kept for a later re-grant (§5.2). |
| **Clock/timezone change** | Fire dates are local-time `Date`s; the next foreground re-arm replans in the new zone — same exposure and same heal as every sibling family. |
| **> cap candidates** | Priority-first trim (§6.1); `truncated` count returned for the test suite, as in `planSadhanaReminders`. |

## 9. Reuse map (what we lean on, not rebuild)

| Need | Existing asset |
|---|---|
| Planner/glue/headless shape, copy shape, cap discipline | `notifications/sadhanaReminderPure.ts` + `sadhanaScheduler.ts` + `components/SadhanaReminderScheduler.tsx` |
| Shared permission truth (incl. Android quirk) | `notifications/permissionState.ts` via `NotificationPreferencesContext` (`permissionStatus`, `requestPermission`) |
| Time picker control | `components/TimeStepper.tsx` (as used by `ReminderSettingsScreen`, `JapamAlarmsScreen`) |
| Routine storage + re-arm trigger | `contexts/RoutineContext.tsx` (`persistRoutines`; new `setReminder`) |
| Weekday semantics | `data/routine/types.ts` `itemRunsOn` / per-item `weekdays` (0=Sun…6=Sat) |
| Today-completion signal for suppression | the `data/routine/useRoutineToday.ts` composition (manual marks + ReadingProgress + UserActivity) |
| Deep-link dispatch | `notifications/deepLink.ts` `handleNotificationResponse` (new `routine-reminder` branch beside `sadhana-reminder`) |
| Budget constants | `notifications/pure.ts` (`IOS_PENDING_CAP`, `ROLLING_WINDOW_DAYS`) |

## 10. Acceptance criteria

1. A routine with no `reminder` field behaves exactly as today — zero notifications, zero permission prompts, detail screen shows the स्मरण card with the toggle off.
2. Enabling the toggle on `undetermined` shows the OS prompt once; a grant persists `reminder` and schedules; a refusal persists nothing and the toggle stays off.
3. A `daily` routine with reminder 07:00 has one pending `routine-reminder:` slot per day across the window (≤ cap, minus a suppressed today).
4. A Mon+Sat `weekday` routine has pending slots **only** on Mondays and Saturdays.
5. Completing all of today's items while the app is open removes today's slot; tomorrow's remains.
6. Deleting the routine (or disabling the toggle) leaves zero `routine-reminder:` slots pending; all other families' pending slots are untouched.
7. Tapping the notification from a cold start and from a running app both land on `HomeTab → RoutineToday`.
8. Renaming the routine or moving its time is reflected in the next pending slots after one foreground.
9. Total pending claimed by this family never exceeds 12.

## 11. Test plan

Per repo convention, `src/notifications` is **excluded from Jest**; pure suites run under **`tsx --test`** via `npm run test:data`, and anything importing `expo-notifications` / `@react-navigation/native` uses the `.jest.test.ts(x)` suffix.

- **`notifications/__tests__/routineReminderPure.test.ts`** (tsx; add to the `test:data` file list in `mobile/package.json`): daily-mode window fill; weekday filtering (Sat-only routine → only Saturday fire dates); empty-union ⇒ zero candidates; past-time-today skipped; `completedToday` suppresses today only; cap trim priority-then-soonest with `truncated` count; identifier shape `routine-reminder:{id}:{dateKey}`; copy formatting incl. blank-`nameHi` fallback; `now` determinism (fixed dates, no clock reads).
- **`notifications/__tests__/deepLink.jest.test.tsx`** (existing Jest suite): add the `routine-reminder` payload → `HomeTab → RoutineToday` dispatch case + malformed-payload rejection.
- **`contexts/__tests__/RoutineContext.test.tsx`** (existing Jest suite): `setReminder` persists/clears the field; legacy records without `reminder` load unchanged (migration-free proof).
- **Maestro e2e** (`routine-reminder-smoke.yaml`): asserts only that the स्मरण card renders on RoutineDetail with the toggle off by default. Maestro **cannot drive a notification tap, nor safely flip the toggle** (it raises the native permission dialog) — the shipped `reminders-smoke.yaml` limitation, recorded in the e2e runbook; planners and deep links are unit-covered instead.
- Gates: `tsc --noEmit` clean; `npm run test:data` green.

## 12. Rollout

Pure TypeScript over already-linked `expo-notifications` — **no config-plugin, entitlement, or native-module change**, so the phase ships as an **EAS Update (OTA)** on the current binary. Docs in the same PR (per `.claude/rules/design-doc-sync.md`): design.md gains a RoutineDetail-reminder subsection; the wiki `routine`/`notifications` pages take the eighth family via the `llm-wiki` skill flow.

## 13. Open questions

1. **Should the notification body name the day's vaar deity for weekday routines** (e.g. `शनिवार · हनुमान — «name»`)? Cheap (the fire date's weekday is known at plan time and `WEEKDAY_DEITY_LABEL` is static), but it lengthens the body and duplicates what RoutineToday shows on tap. Default: no; revisit with usage.
2. **Cap split when both sankalp and routine reminders are popular:** sadhana holds 18, routines take 12. If real devices show OS-cap pressure, the honest fix is shrinking `SADHANA_WINDOW_DAYS`/`ROUTINE_WINDOW_DAYS` together rather than per-family favouritism — flagged for the audit the wiki gotcha already mandates.
3. **A "set a reminder" nudge** on RoutineToday after N consecutive missed days — deliberately out of scope (smells like engagement-bait; the family's premise is user-initiated commitment). Recorded so it isn't re-invented.

*(No further phases follow. With Phase 3 shipped, PRD-07 is complete.)*

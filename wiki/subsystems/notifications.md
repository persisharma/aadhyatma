---
title: Local Notifications & Reminders
type: subsystem
sources: [mobile/src/notifications/pure.ts, mobile/src/notifications/scheduler.ts, mobile/src/notifications/seed.ts, mobile/src/notifications/dayAnga.ts, mobile/src/notifications/dayAngaResolver.ts, mobile/src/notifications/vratReminderPure.ts, mobile/src/notifications/vratScheduler.ts, mobile/src/notifications/sadhanaReminderPure.ts, mobile/src/notifications/sadhanaScheduler.ts, mobile/src/notifications/festiveReminders.ts, mobile/src/notifications/festiveReminderPure.ts, mobile/src/notifications/festiveScheduler.ts, mobile/src/notifications/pitruSmaranReminderPure.ts, mobile/src/notifications/pitruSmaranScheduler.ts, mobile/src/notifications/pitruPakshaReminderPure.ts, mobile/src/notifications/pitruPakshaScheduler.ts, mobile/src/notifications/deepLink.ts, mobile/src/contexts/NotificationPreferencesContext.tsx, mobile/src/contexts/PitruSmaranContext.tsx, mobile/src/components/DailyVerseAngaBridge.tsx, mobile/src/components/VratReminderScheduler.tsx, mobile/src/components/SadhanaReminderScheduler.tsx, mobile/src/components/FestiveReminderScheduler.tsx, mobile/src/components/PitruSmaranReminderScheduler.tsx, mobile/src/screens/ReminderSettingsScreen.tsx, mobile/src/screens/PitruSmaranDetailScreen.tsx, mobile/src/components/ReminderOptInModal.tsx, mobile/src/navigation/entryRoutes.ts]
last_verified_date: 2026-08-13
confidence: high
status: current
---

## Summary

Every notification is **local and on-device** (`expo-notifications`, plus the native alarm tiers of [[japam-alarms]]) — there is no server push and no network. Six families share one OS permission grant, and each owns an **identifier prefix** so its cancel-then-reschedule cycle can never touch another's slots: `daily-verse`, `vrat-reminder`, `festive-reminder`, `pitru-smaran-reminder`, `pitru-paksha-reminder`, and the japam alarms. Every family follows the same shape: a **pure planner** that decides what to schedule (unit-tested under `tsx --test`, `now` always parameterised) plus thin scheduling glue, armed by a headless component in `App.tsx`.

## Details

**Preferences** (`contexts/NotificationPreferencesContext.tsx`, `@vedansh/notif-prefs` + `@vedansh/notif-meta`): owns `dailyVerseEnabled`, `times[]` (≤ `MAX_REMINDER_TIMES = 4`), and `festiveRemindersEnabled`. Both toggles default **on**, so the provider requests OS permission once per cold start while the status is still `undetermined`. A hard `denied` flips both stored flags off — an "on" switch for pushes the OS will never deliver is a lie — and the user must re-toggle to re-prompt. The daily-verse reconcile effect depends on `prefs.dailyVerseEnabled` + `prefs.times` (not the whole `prefs` object), so toggling festive reminders cannot trigger a pointless reschedule of the 30-day window.

**Daily verse** (`pure.ts` + `seed.ts` planners, `scheduler.ts` glue) — a rolling `ROLLING_WINDOW_DAYS = 30` window per configured time, hard-capped at `IOS_PENDING_CAP = 64` and shared fairly across times (`computeFireDatesMulti`). The verse per slot is an FNV-1a hash of the local date key, so rescheduling never changes today's verse and same-day times get distinct verses. Content is baked at schedule time in the reader's language.

**Panchang-aware titles** (`dayAnga.ts` pure + `dayAngaResolver.ts` engine glue, fed by `<DailyVerseAngaBridge>`): the title leads with the fire day's observance, else its sunrise tithi, then ` · दैनिक भक्ति`; past `TITLE_MAX_CHARS = 38` the suffix is dropped whole. `pickTitleObservance` picks one `default`-visibility observance per day, ordered marker → category → id.

**Vrat reminders** (`vratReminderPure.ts` / `vratScheduler.ts`, armed by `<VratReminderScheduler>`) — **opt-in**: derived from `VratFollowContext` follows and their per-vrat/global prefs. Each next occurrence can yield an *advance* notice (`ADVANCE_HOUR = 18`, 1–3 days out) and a *day-of* notice at the chosen morning time, under `VRAT_REMINDER_CAP = 24`. When over the cap, **follow order wins**.

**Sadhana reminders** (`sadhanaReminderPure.ts` / `sadhanaScheduler.ts`, armed by `<SadhanaReminderScheduler>`) — a daily nudge per reminder-enabled sankalp at the shared reminder time, `SADHANA_WINDOW_DAYS = min(9, 30)`, `SADHANA_REMINDER_CAP = 18`, priority-first capping.

**Festive reminders** (`festiveReminders.ts` catalog + `festiveReminderPure.ts` planner + `festiveScheduler.ts` glue, armed by `<FestiveReminderScheduler>`) — the **default-ON** counterpart to the opt-in vrat family: the user follows nothing and configures nothing. The catalog also drives two Home surfaces: the FOR TODAY row's festival tier and the **Festive Toran** (`components/FestiveToran.tsx`, design.md §55) — a garland + greeting chip Home hangs under the wordmark on those 18 days, resolved by `getTodayFestival(date)` in `data/discoveryMeta.ts` (first observance in the catalog, same order as the row's tier 1, so all three surfaces name the same festival).
- `festiveReminders.ts` is a **data-only** curated catalog of 18 famous festivals (no imports from `festivals.ts`/`texts.ts`, which is what keeps the planner pure). Each entry pins an `ObservanceRule.id`, a hand-authored Devanagari greeting, an invitation naming a specific text, and that text's `LibraryEntry.id`.
- **One notification, on the day, at 07:30 local** (`FESTIVE_HOUR`/`FESTIVE_MINUTE`) — half an hour after the 07:00 daily-verse default so the two never collide. No advance notice: that is what following a vrat buys.
- `FESTIVE_WINDOW_DAYS = 120` (festivals are ~monthly, so a six-week-absent user should still get Diwali), `FESTIVE_REMINDER_CAP = 8`.
- Capping is **soonest-first** — the inverse of the vrat rule — with catalog (fame) order only as the same-instant tie-break. Nobody opted into these, so a festival three days out must not lose its slot to a more famous one four months out.
- Copy: the **title is the festival's own name**, never concatenated; the **body is `<greeting> · <invite>`**. Both go through `contentByLang`, so gu/kn re-script the Devanagari (see [[languages]]).
- Dates come from `getNextOccurrences` **without a location**, i.e. the bundled precomputed table (same choice vrat reminders make); the lookup runs behind `InteractionManager`.
- Own Android channel `festive-reminders` (importance DEFAULT), so festival pushes can be muted separately from the daily verse.

**Pitru Smaran reminders** (`pitruSmaranReminderPure.ts` / `pitruSmaranScheduler.ts`, armed by `<PitruSmaranReminderScheduler>`) — **opt-in per person** from that person's detail page. Each next annual occurrence yields an evening-before notice at 18:00 and a day-of notice at 07:00, soonest-first under `PITRU_SMARAN_REMINDER_CAP = 8`. The stored `reminderEnabled` flag defaults false for old and new entries; enabling it requests the shared OS permission. Payloads carry only the private entry id, occurrence key, and slot kind, and tapping opens that person's local detail.

**Pitru Paksha reminders** (`pitruPakshaReminderPure.ts` / `pitruPakshaScheduler.ts`, reconciled alongside `<FestiveReminderScheduler>`) — the **default-ON public-season** counterpart. When festive reminders are enabled, the current and next Pitru Paksha windows produce two notices per year: 18:00 on the eve of Bhadrapada Purnima and 18:00 on the eve of Sarvapitri Amavasya. They share the existing `festive-reminders` Android channel but retain their own `pitru-paksha-reminder` identifier prefix. No family entry, name, or other private Smaran data enters these public-season payloads; tapping opens the Pitru Paksha overview.

**Deep links** (`deepLink.ts`): a module-level `navigationRef` lets `handleNotificationResponse` dispatch from outside the React tree; `App.tsx` wires both the cold-start response and the live listener. Routing is by payload `type`:
- `daily-verse` → the **Daily Bhakti tab** carrying the baked verse identity — deliberately *not* a reader.
- `vrat-reminder` → `PanchangTab → ObservanceDetail`.
- `festive-reminder` → **`HomeTab → Home`**; the reading the message named is the first card in Home's FOR TODAY row, which leads with the festival's content on a festival day. Gated on `ruleId` only — `sourceId` rides along as a record but no longer drives routing.
- `sadhana-reminder` → `HomeTab → RoutineToday`.
- `pitru-smaran-reminder` → `MoreTab → PitruSmaranDetail` for the payload's local entry id.
- `pitru-paksha-reminder` → `MoreTab → PitruPakshaOverview` for the payload's year.
- japam alarm → `HomeTab → JapamCounter` with `autoPlay: true`.

**Settings** (`screens/ReminderSettingsScreen.tsx`, More tab → Reminders): a Daily-verse toggle card (with the shared permission banner), a Times card of `TimeStepper` rows, and a Festival-reminders toggle card whose subtitle reads the festival count and fire time off the planner constants. `ReminderOptInModal` is the once-only, third-app-open ask for the daily verse.

**Testing** — `src/notifications` is deliberately **excluded from Jest**; pure suites run under `tsx --test` via `npm run test:data`, and anything importing `expo-notifications` or `@react-navigation/native` uses the `.jest.test.ts(x)` suffix instead.
- tsx: `scheduler.test.ts`, `reminderVerseLookup.test.ts`, `vratReminderPure.test.ts`, `sadhanaReminder.test.ts`, `japamAlarms.test.ts`, `festiveReminderPure.test.ts`, `festiveReminders.test.ts`, `pitruReminderPure.test.ts`, `dayAngaResolver.jest.test.ts`.
- Jest: `deepLink.jest.test.tsx`, `festiveScheduler.jest.test.ts`, `pitruSchedulers.jest.test.ts`, `japamAlarm*.jest.test.ts`, `androidAlarmPolicy.jest.test.ts`.
- `festiveReminders.test.ts` is the seam that holds the data-only catalog to the code it names: it fails if a `ruleId` leaves `OBSERVANCE_RULES`, stops being `default`-visibility, resolves to no upcoming date, or if a `sourceId` is not a library entry with a `buildEntryStartTarget` route.

## Dependencies

- [[overview]] — `NotificationPreferencesProvider` in `App.tsx`; the headless schedulers mount inside it.
- [[panchang]] — observance dates (`resolveObservancesForYear`, `getNextOccurrences`) and the sunrise tithi behind daily-verse titles.
- [[japam-alarms]] — the native AlarmKit/AlarmManager family plus the expo fallback.
- [[languages]] — `contentByLang` / `verseLinesByLang` render every notification in the reading language.
- `navigation/entryRoutes.ts` — `buildEntryStartTarget` is the single "open this content" table the festive deep link reuses.

## Gotchas

- **The six families are collectively over-subscribed against iOS's 64 pending limit** in the worst case: daily verse alone can claim up to `IOS_PENDING_CAP` (4 times × 16 days), plus vrat 24 + sadhana 18 + festive 8 + personal Pitru 8 + up to four Pitru Paksha season notices. Each family's own cap is honest; the *sum* is not. Anything past 64 is silently discarded by the OS, and the festive/Pitru Paksha scheduler re-arms last. Audit total pending usage before raising any cap.
- **Planners are pure; only the glue touches the clock or the OS.** No `Date.now()`, no `expo-notifications`, no astronomy in `pure.ts` / `*ReminderPure.ts`. `now` is a parameter everywhere so the suites are deterministic.
- **Content is baked at schedule time, not at fire time** — up to 30 days ahead for the daily verse and **120 for festive reminders**. Anything that changes the copy (reading language, panchang resolution, a pref) must trigger a re-arm, which is why every headless scheduler lists `lang` in its effect deps. It also means a queued notification can outlive an OTA content change: validate ids from a payload (`findVerse`, `findJapamMantra`, the festive `library.find`) instead of trusting them.
- **The festive catalog must never point at content it cannot open.** A festival with no honest match is left out, not aimed at a loosely-related text — the message's whole promise is that the named reading is one tap away. `festiveReminders.test.ts` enforces this.
- **A festive tap lands on Home, not in a reader** — same instinct as `daily-verse` staying on the Daily Bhakti tab: a tap made from a lock screen must not run a reader's `setProgress` effect and clobber the resume position. The invitation is still honoured because `getTodayRecommendationDetails` puts the festival's reading first in Home's FOR TODAY row. `{ screen: 'Home' }` is passed explicitly — focusing `HomeTab` alone restores whatever screen the stack was left on.
- **The catalog is load-bearing in two places now**, `festiveScheduler` and `data/discoveryMeta.ts`. That is deliberate (one source, so the message and the homepage cannot disagree) and it is why `festiveReminders.ts` imports nothing — `discoveryMeta` already imports `texts.ts` and `festivalEngine`, so a catalog that reached back into either would close a cycle. Keep it data-only.
- **`getTodayRecommendationsForDate` is now a view over `getTodayRecommendationDetails`.** New callers that need to know *why* an entry is recommended (festival vs weekday) must use the details variant; the old name is kept only so existing callers and `contentCorrectness.test.ts` are untouched.
- **Android channel attributes are pinned at creation** — changing `festive-reminders`'s sound or importance later requires a **new channel id** plus deleting the old one, the same `-v2` dance documented in [[japam-alarms]].
- **A missing pref key means default, not off.** `parsePrefs` resolves an absent `festiveRemindersEnabled` to `true`, so users upgrading from a build before the feature existed are enabled like a fresh install. Do not "fix" this into an opt-in.
- **Maestro cannot drive a notification tap, nor safely flip a toggle** (enabling raises the native permission dialog). `reminders-smoke.yaml` therefore asserts the cards' presence only; the toggles, planners, and deep links are covered by unit tests. Same rationale recorded in [[e2e-verification]].

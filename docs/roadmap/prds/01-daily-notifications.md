# PRD-01 — Daily Bhakti Notifications & Festival Reminders

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.4.0 |
| **Window** | Weeks 27–30 (1 Jul – 31 Jul 2026) |
| **T-shirt size** | M (~4 dev-weeks) |
| **Owner** | TBA |

---

## 1. Problem

Vedansh has a **Daily Bhakti** tab that surfaces one random verse from the pool (`mobile/src/data/versePool.ts`). It only fires when the user opens the tab. There is no surface that brings a user back to the app once they've left it. For a devotional product this is a defining gap — the use-case is morning sadhana, evening aarti, and festival days, all of which are time-anchored rituals the user wants the app to nudge.

Today the dependency list (`mobile/package.json`) does not include `expo-notifications`, so the surface does not exist at all.

## 2. Goal

Ship a single, reverent daily-verse notification, plus opt-in reminders on major festival days, that opens directly to the relevant content. Measured by:

- ≥ 55% notification opt-in on new installs (post-onboarding).
- ≥ 25% notification → app open rate within 60 minutes of delivery.
- +10 percentage points on D7 return rate for users who opted in vs. those who didn't.

## 3. Non-goals

- Personalized "you haven't read in 3 days" win-back nudges. Too easy to feel pushy on a devotional app. Q4 if data justifies.
- Per-section / per-deity drip campaigns.
- Push from a server. Local notifications only, scheduled on-device. Avoids server cost and aligns with the no-account stance for Q3.
- Rich notifications with audio playback (deferred to PRD-02 follow-up).

## 4. User stories

> As a daily practitioner, I want a single verse to land on my lock screen every morning at the time I choose, so opening the app becomes part of my routine.

> As a Hanuman devotee, I want a reminder on Hanuman Jayanti morning that opens the Hanuman Chalisa, so I don't have to remember the calendar.

> As a user who finds notifications stressful, I want to disable all of this in one tap from the same screen where I enabled it, without losing my bookmarks or progress.

## 5. Scope

### In scope

1. **First-run opt-in.** On the third app open (not the first — earn the ask), show a one-screen sheet explaining the daily-verse notification and offering a time picker (default 07:00 local).
2. **Daily verse local notification.** Scheduled via `expo-notifications`. Body = one Devanagari line + short English subtitle. Tap routes to the Daily Bhakti tab with that verse pre-selected (deep link by `verse.id`).
3. **Settings surface.** New "Reminders" row in the Profile/More tab with:
   - Daily verse toggle + time picker.
   - Festival reminders toggle (default on if daily verse is on).
   - Quiet hours (default 22:00–06:00 — schedule shifts forward if user's chosen time falls inside).
4. **Festival reminder calendar.** Bundle a static JSON for the next 18 months of dates (Hanuman Jayanti, Janmashtami, Ram Navami, Maha Shivratri, Navratri × 9 days, Ganesh Chaturthi, Ekadashi × 24/yr). One reminder per festival day at the user's daily-verse time, with a section-specific deep link.
5. **Onboarding entry-point.** The opt-in flow is also reachable from the help modal's existing "Reminders" affordance (today this row does not exist — add it).

### Out of scope

- Server-pushed personalization.
- Audio playback from notification.
- Granular per-festival opt-out (all-or-nothing for v1).
- Android-specific notification channels until the Play Store launch lands.

## 6. UX notes

- The opt-in sheet must follow the parchment system: cream background, saffron CTA, no system blue. Reuse the help modal's component structure.
- Notification body example (Hindi-led):
  - Title: `दैनिक भक्ति`
  - Body (line 1): `कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।`
  - Body (line 2): `Bhagavad Gītā · 2.47`
- Deep link target uses the existing `entryRoutes.ts` helpers (`navigateToEntryStart`, `navigateToProgress`) — do not invent a parallel path. If the verse the notification carries can be resolved to a `(sourceId, verseIndex)`, navigate via `navigateToProgress`; otherwise fall back to Daily Bhakti tab.
- Festival reminder copy ships in both languages, swapped by `useGitaLanguage` at render time.

## 7. Technical sketch

- New dep: `expo-notifications`. Requires updating `app.json` plugin list and `mobile/ios/` config; iOS push permission strings in `infoPlist`.
- New context: `NotificationPreferencesContext` (parallel to existing persistence contexts in `mobile/src/contexts/`), backed by `AsyncStorage` key `@vedansh/notif-prefs`.
- Scheduling layer in `mobile/src/notifications/scheduler.ts`. On app foreground, reconcile the OS schedule against the preference state. iOS limits 64 pending local notifications — we'll schedule a rolling 30-day window and refresh on each open.
- Daily verse selection at scheduling time pulls from `versePool.ts`. Seed by `(YYYY-MM-DD + deviceId-hash) % poolSize` for deterministic same-day verses across reschedule.
- Festival JSON in `mobile/src/data/calendar/festivals.json` with shape:
  ```ts
  { date: '2026-07-21', festivalId: 'hanuman-jayanti', sectionId: 'hanuman-chalisa', titleHi: '...', titleEn: '...' }
  ```
- Deep-link handler in `mobile/App.tsx` (or wherever the navigation root lives) for `expo-notifications` response listener.
- New test: `mobile/src/notifications/scheduler.test.ts` verifies (a) the rolling window stays ≤ 64, (b) verse seed is deterministic per day, (c) festival overrides daily verse on collision.

## 8. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Opt-in rate | Local count in `UserActivityContext`, opt-in to "yes" | ≥ 55% |
| Notification → open rate | `expo-notifications` response listener event | ≥ 25% |
| 7-day retention lift (opt-in vs. not) | Sentry/PostHog (PRD-06) | +10 pp |
| Notification scheduling errors | Sentry breadcrumbs | < 0.1% of sessions |

## 9. Risks

| Risk | Mitigation |
|---|---|
| iOS APNS permission ask backfires (user denies forever) | Defer prompt to app-open #3, use OS-native sheet only after the in-app sheet's primary CTA tap (never auto-prompt). |
| Festival calendar drift (lunar dates) | Bundle 18 months, but make the JSON server-hot-reloadable via `expo-updates` once cloud config lands (PRD-06). |
| Multiple-device same-user duplication | N/A in Q3 (no accounts). Flag for Q4 sync work. |

## 10. Definition of done

- Notification fires reliably for 7 consecutive days in QA across an iPhone and iPhone-with-Focus-Mode.
- Tapping notification opens to the correct verse / section.
- Settings toggle disables future notifications within 1 reconcile.
- Festival reminder fires on a synthetic "today is Hanuman Jayanti" QA build.
- App Store review note explains festival reminders and daily verse use-case (reviewers reject vague "engagement" descriptions for push).
- Tests pass. PRD-06's smoke-test gate enforced.

## 11. Open questions

1. Default time — 07:00 or 06:00? Devotional schedule varies; 07:00 chosen by default but worth a quick user-research check.
2. Should festival opt-in default to **on** if the user enabled daily verse? Current proposal: yes; ~5 reminders / month is not noisy.
3. Do we need a "verse of the moon-day" surface (Ekadashi as a sub-class), or treat all 24 ekadashis as the same reminder copy? v1 = same copy; revisit after data.

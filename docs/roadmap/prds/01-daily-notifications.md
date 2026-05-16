# PRD-01 — Daily Bhakti Notifications

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.4.0 |
| **Window** | Weeks 27–29 (1 Jul – 24 Jul 2026) |
| **T-shirt size** | M (~3 dev-weeks) |
| **Owner** | TBA |

---

**Bundle-only constraint:** all notifications are scheduled locally on-device via `expo-notifications`. No server push, no remote calendar fetch, no analytics SDK.

**Festival reminders were cut from this PRD.** They are deferred to a follow-up (see §12) so v1.4.0 ships the one feature that materially moves retention. Rationale captured in §3.

---

## 1. Problem

Vedansh has a **Daily Bhakti** tab that surfaces one random verse from the pool (`mobile/src/data/versePool.ts`). It only fires when the user opens the tab. There is no surface that brings a user back to the app once they've left it. For a devotional product this is a defining gap — the use-case is morning sadhana, and the user wants the app to nudge them.

Today the dependency list (`mobile/package.json`) does not include `expo-notifications`, so the surface does not exist at all.

## 2. Goal

Ship a single, reverent daily-verse notification that opens directly to the relevant verse. Measured by:

- ≥ 55% notification opt-in on new installs (post-onboarding).
- ≥ 25% notification → app open rate within 60 minutes of delivery.
- +10 percentage points on D7 return rate for users who opted in vs. those who didn't.

## 3. Non-goals

- **Festival reminders.** Calendar-day reminders (Hanuman Jayanti, Janmashtami, Maha Shivratri, Ekadashi, etc.) are deferred. Reasons:
  - The daily notification at 365/year does ~92% of the engagement work. ~30 festival days/year is incremental, not load-bearing.
  - Lunar / panchang date accuracy has regional variance (different sampradayas disagree on Ekadashi dates). Sourcing a defensible calendar is a real research task that doesn't belong on the critical path for v1.4.0.
  - Bundled festival JSON needs to be regenerated every App Store release forever. Maintenance burden compounds.
  - The strongest pro-festival argument — "festival mornings are when users most want recitation" — actually requires **audio** to land first. Festival reminders are far more valuable once chalisa audio (PRD-02) is live and the reminder can offer playback. See §12.
- "You haven't read in 3 days" win-back nudges. Too easy to feel pushy on a devotional app. Q4 if data justifies.
- Per-section / per-deity drip campaigns.
- Push from a server. Local notifications only, scheduled on-device.
- Rich notifications with audio playback (waits on PRD-02 anyway).

## 4. User stories

> As a daily practitioner, I want a single verse to land on my lock screen every morning at the time I choose, so opening the app becomes part of my routine.

> As a user who finds notifications stressful, I want to disable this in one tap from the same screen where I enabled it, without losing my bookmarks or progress.

> As a first-time user, I don't want to be ambushed by a permission prompt on launch. Ask me after I've used the app a few times.

## 5. Scope

### In scope

1. **First-run opt-in.** On the third app open (not the first — earn the ask), show a one-screen sheet explaining the daily-verse notification and offering a time picker (default 07:00 local).
2. **Daily verse local notification.** Scheduled via `expo-notifications`. Body = one Devanagari line + short English subtitle. Tap routes to the Daily Bhakti tab with that verse pre-selected (deep link by `verse.id`).
3. **Settings surface.** New "Reminders" row in the More tab with:
   - Daily verse toggle + time picker.
   - Quiet hours (default 22:00–06:00 — schedule shifts forward if user's chosen time falls inside).
4. **Onboarding entry-point.** The opt-in flow is also reachable from the help modal's existing "Reminders" affordance (today this row does not exist — add it).

### Out of scope

- Festival reminder calendar — see §3 and §12.
- Server-pushed personalization, server-fetched festival data, or any FCM/APNS push from us. Out of scope by constraint, not preference.
- Audio playback from notification.
- Android-specific notification channels until the Play Store launch lands. Default channel is fine for v1.4.0.

## 6. UX notes

- The opt-in sheet must follow the parchment system: cream background, saffron CTA, no system blue. Reuse the help modal's component structure.
- Notification body example (Hindi-led):
  - Title: `दैनिक भक्ति`
  - Body (line 1): `कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।`
  - Body (line 2): `Bhagavad Gītā · 2.47`
- Deep link target uses the existing `entryRoutes.ts` helpers (`navigateToEntryStart`, `navigateToProgress`) — do not invent a parallel path. If the verse the notification carries can be resolved to a `(sourceId, verseIndex)`, navigate via `navigateToProgress`; otherwise fall back to Daily Bhakti tab.
- Copy ships in both languages, swapped by `useGitaLanguage` at render time.

## 7. Technical sketch

- **New dep:** `expo-notifications`. Requires updating `app.json` plugin list and `mobile/ios/` config; iOS push permission strings in `infoPlist`.
- **New context:** `NotificationPreferencesContext` (parallel to existing persistence contexts in `mobile/src/contexts/`), backed by `AsyncStorage` key `@vedansh/notif-prefs`.
- **Scheduling layer** in `mobile/src/notifications/scheduler.ts`. On app foreground, reconcile the OS schedule against the preference state. iOS limits 64 pending local notifications — we'll schedule a rolling 30-day window and refresh on each app open. All scheduling is on-device; no server is involved at any point.
- **Daily verse selection** at scheduling time pulls from `versePool.ts`. Seed by `(YYYY-MM-DD + deviceId-hash) % poolSize` for deterministic same-day verses across reschedule.
- **Deep-link handler** in `mobile/App.tsx` (or wherever the navigation root lives) for `expo-notifications` response listener.
- **New test:** `mobile/src/notifications/scheduler.test.ts` verifies (a) the rolling window stays ≤ 64 and (b) verse seed is deterministic per day.

## 8. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Opt-in rate | Local count in preferences context, opt-in to "yes" | ≥ 55% |
| Notification → open rate | `expo-notifications` response listener event, local counter | ≥ 25% |
| 7-day retention lift (opt-in vs. not) | Local diagnostics ledger (PRD-06) + App Store Connect | +10 pp |
| Notification scheduling errors | Local crash log (PRD-06) | < 0.1% of sessions |

## 9. Risks

| Risk | Mitigation |
|---|---|
| iOS permission ask backfires (user denies forever) | Defer prompt to app-open #3, use OS-native sheet only after the in-app sheet's primary CTA tap (never auto-prompt). |
| Multiple-device same-user duplication | N/A in Q3 (no accounts). Each device schedules its own local notifications. |
| User chooses 23:00; quiet hours collide | Schedule shifts forward to the next allowed slot. Documented in Settings copy. |
| Battery drain from frequent rescheduling | Reconcile only on app foreground, not on background timer. Rolling window refresh = one batch operation. |

## 10. Definition of done

- Notification fires reliably for 7 consecutive days in QA across an iPhone and iPhone-with-Focus-Mode.
- Tapping notification opens to the correct verse.
- Settings toggle disables future notifications within 1 reconcile.
- App Store review note explains the daily verse use-case (reviewers reject vague "engagement" descriptions for push).
- Tests pass. PRD-06's smoke-test gate enforced.

## 11. Open questions

1. Default time — 07:00 or 06:00? Devotional schedule varies; 07:00 chosen by default but worth a quick user-research check.
2. Should the daily verse rotate across all sections, or weight toward what the user already reads? v1 = uniform across the pool; revisit once `UserActivityContext` data is mature.

## 12. Deferred: festival reminders

Festival reminders move to a follow-up release. They become much more valuable **after** PRD-02 ships, because the payoff on a festival morning is recitation audio, not just text. Sequencing:

- **v1.4.0 (this PRD):** daily verse only.
- **v1.5.x (after audio):** add festival reminders. The bundled JSON, the collision logic with daily verse, the "Calendar through {Month}" Settings line, and the section-specific deep-link routing all live there. Reminder body for festivals includes a "Tap to play" affordance once audio is wired.
- **Calendar sourcing** is a parallel research task that starts in Q3 but doesn't gate v1.4.0. We need a single authoritative panchang source (or a tight set of rules with documented sampradaya choices) before festival reminders ship.

This sequencing keeps v1.4.0 small (~3 dev-weeks instead of 4), removes the maintenance burden from a release where it isn't earning its keep, and lands festivals where they actually shine — alongside audio.

# PRD-46 — पहली बार · First-launch asks, each with its reason

| | |
|---|---|
| **Status** | **Plan, for review.** Nothing in §5–§8 is built yet. The Bhakti-tab widget pair (§6.4's add flow) is already built on this branch. |
| **T-shirt size** | M. All JS/TS, **OTA-shippable**; no native module, entitlement or Info.plist change. |
| **Parent** | design.md §23 (Daily Bhakti setup strip), §38 (reminder opt-in), §47 (tour + first-run setup), §59 (widgets). wiki `subsystems/notifications`, `subsystems/home-widgets`, `integrations/meta-app-events`. |
| **Prototype** | [`docs/first-launch-asks-prototype.html`](../../first-launch-asks-prototype.html) — every control at launch, open by open, today vs proposed, clickable on Android and iPhone. Sunrise times in it come from the app's engine for 30 Oct 2026. |

> **Design intent.** A new user should be asked for three things on the first open, one per screen, each with the reason in their own language: their reading language, their city, and whether they want reminders. Widgets come on a later day. Nothing the OS shows should appear before the user has seen why.

## 0. The honest constraints (read first)

1. **The OS notification prompt cannot be repeated.** iOS shows it once per install; after "Don't Allow" only the Settings app can turn notifications on. Android 13+ shows it at most twice; after the second refusal, Settings only. Android ≤12 has no prompt (notifications start on). "Keep asking until yes" can therefore only mean **our own screen** asks again. After a hard denial it can only send the user to Settings.
2. **No app can place a widget by itself.** iOS has no API. Android's `requestPinAppWidget` always shows the launcher's confirmation, one widget per dialog.
3. **The tracking (ATT) prompt cannot move far.** App Review rejected 1.5.0 under 2.1 because reviewers could not find the ATT prompt (wiki `integrations/meta-app-events`). Meta is never activated while ATT is unanswered, so delaying ATT also delays install measurement for every user who leaves before it appears. This plan keeps ATT on the first open but moves it from launch to after setup and the tour (§6.5). The prototype's earlier "3rd open" idea is withdrawn for this reason.

## 1. Problem: what a fresh install sees today

On a fresh iPhone production install, in the first seconds:

| # | Surface | Where it comes from |
|---|---|---|
| 1 | OS notification prompt, at cold start, before a language exists | `NotificationPreferencesContext.tsx` hydrate effect (~L312) requests while `undetermined` on **every** cold start |
| 2 | ATT prompt | `App.tsx` `handleNavigationReady` → `startMetaAppEvents` |
| 3 | Feature tour, 25 steps | `FeatureTour.tsx`, `data/tour/steps.ts` |
| 4 | Language + reading size sheet | `OnboardingSetupSheet.tsx`, shown after the tour closes |

The city is never asked. `PanchangLocationContext` silently defaults to Ujjain, so sunrise, Rahu Kaal and muhurat are wrong for most users until they find the picker. On 30 Oct 2026 sunrise is 06:30 in Ujjain and 05:39 in Kolkata (`sunriseForDate`).

## 2. Goal

- First open: **language → city → reminders**, then the tour, then (iPhone) ATT.
- A later day: **widget pair** (verse + Panchang).
- Reminders: re-ask with our own screen **at most once per day the app is opened, until yes**; after five "बाद में", once a week; after a hard OS denial, a Settings variant on the same cadence.
- **At most one launch ask per cold start.**

## 3. UX by open (see the prototype)

### 3.1 First open
1. **Language + reading size** — today's sheet, step 1 of 3, bilingual chrome. Primary "आगे · Next".
2. **Your city** — step 2 of 3, in the chosen language. Reason line with two live sunrise times. "मेरा स्थान उपयोग करें" (the OS location prompt only after this tap; the purpose string is already "only to compute accurate sunrise and panchang times… never leaves your device"). Search (city, village, pincode) reusing the picker's search. Popular cities when the query is empty. Choice applies live. Primary "आगे" (enabled once a place is chosen); secondary "बाद में · अभी उज्जैन का समय दिखेगा".
3. **Reminders** — step 3 of 3. Says exactly what arrives: the daily verse at the chosen time (default 07:00) and one notice on each of the 18 catalogue festivals at 07:30 (counts and times read from `FESTIVE_REMINDERS`, `FESTIVE_HOUR`/`FESTIVE_MINUTE`). Two notification previews. "हाँ, याद दिलाएँ" → the OS prompt. "बाद में" → no OS prompt (the one-time iOS ask stays unused). Skipped when the permission is already granted and reminders are on (Android ≤12).
4. **Feature tour** — unchanged, after setup.
5. **ATT (iPhone)** — after the tour closes or is skipped.

### 3.2 A later day
- If reminders are still off and the re-ask is due: the **reminder re-ask sheet** takes this open. Nothing else.
- Otherwise, if the widget offer is still open: the **widget pair sheet**. Android "दोनों जोड़ें" → launcher dialog for the verse, then the Panchang one when it closes (the built AppState chain). iPhone: both facsimiles + four WidgetKit steps + "समझ गया". "अभी नहीं" ends the widget offer (shared with the Bhakti strip's record).

### 3.3 Re-ask cadence
- Shown at most once per local day the app is opened, until reminders are on.
- After the fifth "बाद में", at least 7 days between asks.
- A manual switch-off in Reminder Settings is respected: no re-ask after it.
- Hard OS denial (`denied` + `!canAskAgain`): the Settings variant (steps + "सेटिंग खोलें" → `Linking.openSettings()`), same cadence.
- The Bhakti strip's reminder row does not appear on a day the sheet already asked.

## 4. Data model

`@vedansh/notif-meta` gains (all optional, parsed defensively like `lastDeclinedAt`):

| Field | Meaning |
|---|---|
| `firstOpenDay` | Local `YYYY-MM-DD` of the first counted open; the widget sheet waits for a later day. |
| `reminderAskDay` | Local day the re-ask (or setup step 3) last showed. |
| `reminderDeclineCount` | "बाद में" taps on the reminder ask, setup step 3 included. |
| `reminderOptedOut` | Set by a manual switch-off in Reminder Settings; ends re-asks. |

`@vedansh/daily-bhakti-nudge` (built) stays the single widget-offer record, read and written through one module-level store so the Bhakti strip and the launch sheet never disagree.

## 5. Implementation plan

| Change | Files |
|---|---|
| Remove the cold-start OS request; add `enableReminders(time)` (one OS request, sets both toggles) and `declineReminders()`; new meta fields; drop `osAskInFlight` | `contexts/NotificationPreferencesContext.tsx` |
| Setup first, tour after; replay from More shows only the tour | `contexts/TourContext.tsx` |
| Three-step setup sheet (language, city, reminders) | `components/OnboardingSetupSheet.tsx`; extract `buildLocationRows(query)` from `components/LocationPickerModal.tsx` |
| Pure gates: re-ask cadence, launch-ask selection | new `components/reminderAskView.ts`, `components/launchAskView.ts` |
| One ask per cold start | new `components/LaunchAskHost.tsx` replaces `<ReminderOptInModal />` in `App.tsx`; `ReminderOptInModal` becomes the re-ask sheet |
| Widget pair sheet | new `components/WidgetOfferSheet.tsx`; facsimiles + Android pin chain extracted from `DailyBhaktiNudge.tsx` |
| ATT after setup + tour on a fresh install | `App.tsx` (start Meta from a small gate component instead of `handleNavigationReady`) |
| Rating prompt blocked while a launch ask is up | `contexts/RatingPromptContext.tsx` |
| Strip reminder row: hide on an asked day; `undetermined` no longer means "prompt in flight" | `components/dailyBhaktiNudgeView.ts` |
| First-run Maestro boot | `.maestro/_launch.yaml` (Next → keep Ujjain → Not now → Skip tour → ATT) |

## 6. Decisions to review

1. **Existing users with `undetermined` permission and reminders on** were prompted on every launch. After this change they get the re-ask sheet on their next open instead. Accept?
2. **Skip on the city step** keeps Ujjain and says so. Forcing a choice adds a wall; skipping leaves wrong times. Plan: allow skip.
3. **Step 3 time picker**: keep the existing `TimeStepper` (one compact row), or fix 07:00 and leave changes to Settings?
4. **Daily re-ask** is the owner's call; five daily asks then weekly is the proposed ceiling. Apple requires the app to work without notifications (4.5.4); every ask is dismissable.
5. **ATT placement** (§0.3): after setup and the tour on the first open.
6. **Tour length**: 25 steps after three setup screens is heavy. Out of scope here; flagged.

## 7. Verification

- Pure gates under Jest (`*View.ts` pattern, like `dailyBhaktiNudgeView.test.ts`).
- Update `NotificationPreferencesContext*.test.tsx` (no auto-request), `TourContext.test.tsx` (setup before tour), `OnboardingSetupSheet.test.tsx` (three steps), `DailyBhaktiNudge*.test.*`, `RatingPromptSheet.test.tsx`.
- `npm run typecheck`, the touched Jest suites, `npm run test:widgets`, launch-graph tests (`data/__tests__/launchGraph.test.ts`, `widgets/__tests__/startup.test.ts`).
- Maestro: `_launch.yaml` boot path; `feature-tour-e2e.yaml` order.
- Device checks still needed: Android launcher pause between pin dialogs; ATT shown after the tour on iPad (App Review).

## 8. Risks

- Fewer grants if users tap "बाद में" more than they would have tapped "Allow" on a cold prompt. Mitigated by the re-ask, which a cold prompt never had.
- A forgotten gate stacks two asks. `LaunchAskHost` latches one choice per cold start.
- Setup getting longer on first open. Each step has a skip.
- Sunrise solves in the city step on low-end Android; bounded to a handful of cities, off the launch path (the sheet is already open).

## 9. Review log

Codex was not reachable from the cloud session that wrote this plan. The owner will run the Codex review on a machine with access to both. The Claude reviews below were independent agents, given the code and this plan but not each other's conclusions.

### 9.1 Design review (Claude agent, 30 Oct 2026)

Adopt (no conflict with §2):
- **One shared sheet shell** for setup, re-ask and widget offer: `parchmentHighlight`, `radii.xl` top corners, grabber, ≤88% height, body scrolls, footer pinned. Title `scriptTitleFont` 24/36; reason `scriptBodyFont` 15/24 `inkSoft`, with times and counts in the bold script face.
- **Primary buttons on `saffronDeep`, not `saffron`.** White on `saffron` is 4.37:1 and fails AA. Today's Begin and Enable both fail.
- **Progress dots** in the tour style, fixed when the sheet opens (2 when step 3 is skipped), a11y "चरण 2 / 3 · Step 2 of 3". Back button on steps 2–3.
- **City step:** order is title → live reason → GPS row → six city chips (Ahmedabad first for gu, Bengaluru first for kn) → search. Search results show in the same sheet, never a nested Modal. Sunrise only in the reason line ("वाराणसी में आज सूर्योदय 06:04 — उज्जैन से 26 मिनट पहले"), so there are two `sunriseForDate` calls, not one per city. **"आगे" always enabled**, because the reason line already says Ujjain is in use. Drop "बाद में · अभी उज्जैन…" and the privacy caption.
- **Reminders step:** one notification facsimile instead of two. No time picker, because it turns a yes/no into a form. The meta line "इसके बाद फ़ोन अनुमति माँगेगा" appears only when the OS will actually prompt. Secondary "अभी नहीं" (the app's existing phrase), not "बाद में".
- **Re-ask** is the same body as step 3 in a second host. Drop "कल फिर पूछेंगे", which reads as a threat. The Settings variant drops "आपने अनुमति नहीं दी थी", which blames the user. When the user returns from Settings with the permission granted, turn reminders on and confirm for 1.5 s.
- **Widget offer:** reuse the how-to sheet's facsimiles. Android meta "फ़ोन हर विजेट के लिए एक बार पूछेगा।", primary "दोनों जोड़ें". iOS primary "ठीक है". "समझ गया" is masculine, so fix the built how-to sheet too. Drop "सभी विजेट देखें".
- **Copy fixes in shipped UI:** the setup note says "अधिक/More", but the tab is now "सेटिंग्स/Settings". Tour steps 24–25 still call setup "next". `_launch.yaml` taps "Begin".
- **Test ids:** `launch-setup-{n}-next/-back`, `city-gps`, `city-chip-{id}`, `city-search`, `reminder-yes/-not-now/-never`, `reask-settings`, `widget-offer-add/-not-now`.

Disagreements for the owner:
1. **Cadence.** The reviewer argues "daily ×5" puts a sheet on 6 of a regular user's first 7 opens and starves the widget offer. Proposal: never the same ask on two consecutive day-opens, so the widget takes day 2; re-asks on day-opens 3, 5 and 8, then weekly; the Settings variant weekly from the start. This conflicts with §2's owner-approved "once per day until yes". **Owner to decide.**
2. **"फिर न पूछें · Don't ask again"** from the third decline, which stops the sheet while the strip and the Settings banner remain. This conflicts with "until yes". **Owner to decide.**
3. **ATT between setup and the tour**, not after the tour. After the tour it lands on the first real screen. Both keep it on the first open (§0.3), so either works.

### 9.2 Engineering review (Claude agent)

_Pending; appended when it completes._

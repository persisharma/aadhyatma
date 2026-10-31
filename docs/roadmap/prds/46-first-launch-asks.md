# PRD-46 — पहली बार · First-launch asks, each with its reason

| | |
|---|---|
| **Status** | **Plan, for review.** Nothing in §5–§10 is built yet. §10 is the revised plan after the design and engineering reviews (§9) and lists the owner decisions still open. The Bhakti-tab widget pair is already built on this branch. |
| **T-shirt size** | M. All JS/TS, **OTA-shippable**; no native module, entitlement or Info.plist change. |
| **Parent** | design.md §23 (Daily Bhakti setup strip), §38 (reminder opt-in), §47 (tour + first-run setup), §59 (widgets). wiki `subsystems/notifications`, `subsystems/home-widgets`, `integrations/meta-app-events`. |
| **Prototype** | [`docs/first-launch-asks-prototype.html`](../../first-launch-asks-prototype.html) — every control at launch, open by open, today vs proposed, clickable on Android and iPhone. Sunrise times in it come from the app's engine for 30 Oct 2026. |

> **Design intent.** A new user should be asked for three things on the first open, one per screen, each with the reason in their own language: their reading language, their city, and whether they want reminders. Widgets come on a later day. Nothing the OS shows should appear before the user has seen why.

## 0. The honest constraints (read first)

1. **The OS notification prompt cannot be repeated.** iOS shows it once per install; after "Don't Allow" only the Settings app can turn notifications on. Android 13+ shows it at most twice; after the second refusal, Settings only. Android ≤12 has no prompt (notifications start on). "Keep asking until yes" can therefore only mean **our own screen** asks again. After a hard denial it can only send the user to Settings.
2. **No app can place a widget by itself.** iOS has no API. Android's `requestPinAppWidget` always shows the launcher's confirmation, one widget per dialog.
3. **The tracking (ATT) prompt cannot move far.** App Review rejected 1.5.0 under 2.1 because reviewers could not find the ATT prompt (wiki `integrations/meta-app-events`). Meta is never activated while ATT is unanswered, so delaying ATT also delays install measurement for every user who leaves before it appears. This plan keeps ATT on the first open but moves it from launch to right after setup, before the tour (§10). The prototype's earlier "3rd open" idea is withdrawn for this reason.

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

### 9.2 Engineering review (Claude agent, 30 Oct 2026)

Severity is the reviewer's. Items marked ✔ were re-checked against the code before they were recorded here.

1. **Critical: setup-before-tour breaks `TourContext`.**
   - ✔ What's New is gated only on `!shouldShowFirstLaunchTour` (`TourContext.tsx` ~L184), and only `markTourCompleted` stamps it seen. On a fresh install, What's New 1.5.5 would therefore open during setup.
   - ✔ `setLang` writes `@vedansh/language`, which is one of `UPGRADER_SIGNAL_KEYS` (`NewContentContext.tsx`). Any relaunch after step 1 (a kill, a crash, or `UpdateReadyModal`'s `reloadAsync`) reclassifies the install as an upgrader. The user then loses the tour and steps 2–3, and gets What's New instead.
   - `resetTour` clears the setup key, so a tour-only replay gated on setup would never show.
   - **Fix:** an explicit persisted `@vedansh/onboarding-phase` (`setup → tour → done`), written on the first hydrate of a genuine fresh install. All three surfaces gate on it, and What's New shows only when the phase is `done`.
2. **High: the re-ask gate nags real "no"s.**
   - A Settings toggle-off and a "later" share `lastDeclinedAt`.
   - Existing decliners' running 15-day snooze would be lost.
   - Today, iOS hard-denied users see no sheet at all.
   - Returning from Settings with the grant leaves both toggles off, because the denial effect flipped them.
   - **Fix:** a separate `optedOutAt` (a toggle-off ends auto-asks). Migrate `declineCount = lastDeclinedAt ? 1 : 0`, honouring a running snooze once. When the grant appears after Settings, turn both toggles on. Add the new fields to `parseMeta`'s whitelist, or they are dropped on the next hydrate.
3. **High: "बाद में" must persist both toggles as `false`.**
   - Prefs default on, and other features request the shared grant: the Vrat bell, Pitru save, Routine, Japam alarms.
   - A user who said "later" and then sets a japam alarm would silently get the 07:00 verse, festival notices, Pitru eves and the return ladder.
   - The return ladder has no pref at all (`ReturnReminderScheduler.tsx`). Android ≤12 is granted by default.
   - Name what the grant covers in step 3's copy.
4. **High: ATT.**
   - Waiting for setup plus a 25-step tour risks a reviewer never reaching ATT, which repeats the 1.5.0 rejection.
   - Android has no ATT, so delaying Meta there only loses activations.
   - **Fix:** Android stays unchanged. On iOS, request ATT when setup closes, and mount the tour only after ATT resolves. On later opens, an unanswered ATT counts as that open's one ask. Add App Review notes saying where ATT appears.
5. **High: the latch has to sit above `RatingPromptProvider`.**
   - `RatingPromptProvider` sits above `NavigationContainer` in `App.tsx`, so the latch must be a provider or module store above it.
   - Make "setup or tour ran this open" a sticky ref.
   - What's New uses up the open.
   - Skip all asks on a cold start from a notification or widget tap.
   - Decide only after notification prefs (with `firstOpenDay` written in the same hydrate), the tour state and the nudge store have all hydrated. Decide from derived state, because the denial flip lands one render late.
   - Route `UpdateReadyModal` through the latch.
   - Cap asks at one per day, not one per open, so a second open on the same day doesn't get a second ask.
6. **Medium-high: iOS modal stacking.**
   - Sibling `Modal`s presented while another is open or mid-dismiss can fail silently. Render one Modal from the host and swap its content, and sequence anything after What's New or setup on `onDismiss`.
   - No `LocationPickerModal` inside the setup Modal.
   - `await enableReminders()` before finishing setup, so the tour never runs under the system alert.
   - Step 2 needs `KeyboardAvoidingView`. Cap search results at about 30 rows rendered plainly, not a FlatList nested in a ScrollView.
7. **Medium: live-applying the city is the cost.**
   - `sunriseForDate` is cheap: one memoized rise/set, and the engine is already on the launch graph.
   - Each `applyLocation` triggers an observance scan, a widget replan (14 day solves on a fresh install), muhurat re-arming and the anga bridge.
   - **Fix:** stage the choice and commit once on "आगे". Warm the 2.5 MB pincode and place tables only on the first pincode or place keystroke.
8. **Medium: the widget sheet's pin chain must live in a module store, not a component hook.** Otherwise closing the sheet kills the AppState listener and the Panchang pin is lost.
   - The strip must write through the same store.
   - The verse facsimile cannot take lines from `DailyBhaktiScreen` in a launch-path component: ✔ it is forbidden in `launchGraph.test.ts`. Use `readWidgetPayload` or `getVerseAtPoolIndex`.
9. **Medium: tests the change will trip.**
   - These encode the removed or reordered behaviour: `NotificationPreferencesContext.test.tsx` (L73, L172, the L138–292 block), `.ios.test.tsx` (L76, L85, L96), `dailyBhaktiNudgeView.test.ts:52`, `DailyBhaktiNudge.test.tsx:186`, `TourContext.test.tsx` (L149, L164, L200, L223), `OnboardingSetupSheet.test.tsx` (L150, L157) and `RatingPromptSheet.test.tsx:60`.
   - The setup-sheet test will throw once the sheet calls `useNotificationPreferences` outside the provider.
   - ✔ `.maestro/_launch.yaml` is the shared boot for about 88 flows. Update it and `feature-tour-e2e.yaml` in the same PR, with stable English a11y labels, and never tap "yes" in the boot flow.
   - Pure tsx tests run only if they are listed in `test:data`. Keep the gates as `components/*View.ts` under Jest, importing only types from `permissionState`.
   - design.md §54 (the rating gate) also changes.
10. **Low-medium: store policy.**
    - A daily custom screen *before* the single iOS prompt is standard.
    - A recurring modal pushing people to Settings after an OS denial is the part that invites a 5.1.1(iv) or "respect the user's choice" problem.
    - **Fix:** add a lifetime cap (for example, 90 days or 12 asks). Keep the Settings variant passive (strip and Reminder Settings only).
11. **Low: upgraders.** Seed `firstOpenDay` in the past when `appOpenCount > 1`, so the widget-offer timing is right for existing users.

Reviewer's cuts to keep it shippable:
- Drop the widget offer sheet from this PR; the strip already offers the pair.
- Drop the Settings launch variant.
- Drop pincode/place search from step 2. Keep the popular cities, a name search over `CITIES`, GPS, and a hand-off to the full picker after setup.
- Drop per-city sunrise lists.

## 10. Revised plan (supersedes §3, §5 and §6 where they differ)

Adopted from both reviews, no owner decision needed:

| Area | Revision |
|---|---|
| Onboarding state | Persisted `@vedansh/onboarding-phase` (`setup → tour → done`) gates setup, tour and What's New. Replay re-arms the tour only. |
| First-open order | language → city → reminders → **(iOS) ATT** → tour. The tour mounts after the system alerts resolve. Android Meta start is unchanged. |
| "बाद में / अभी नहीं" | Persists both reminder toggles as `false`. Step 3's copy names what the one grant covers. |
| Toggle-off in Reminder Settings | Sets `optedOutAt`; no auto re-ask after it. |
| Migration | `declineCount` seeded from `lastDeclinedAt`; a running 15-day snooze honoured once; `firstOpenDay` seeded in the past for `appOpenCount > 1`; new fields added to `parseMeta`. |
| Settings round-trip | When the grant appears after Settings, both toggles turn on, with a short confirmation. |
| Launch-ask latch | A provider above `RatingPromptProvider`. One ask per day. What's New, ATT and `UpdateReadyModal` count as asks. Nothing on a notification or widget cold start. Decides after all stores hydrate. |
| iOS presentation | One host Modal that swaps content; sequencing on `onDismiss`. |
| City step | Stage the choice, commit on "आगे". Two sunrise solves only (Ujjain + chosen). `KeyboardAvoidingView`; ≤30 plain result rows; pincode/place tables warmed on first such keystroke. "आगे" always enabled. |
| Step 3 | One notification facsimile, no time picker, the "फ़ोन अनुमति माँगेगा" line only when the OS will prompt. |
| Visuals | Shared sheet shell; primary on `saffronDeep` (AA); tour-style dots; back on steps 2–3; the §9.1 copy fixes ("सेटिंग्स" tab, "ठीक है", tour steps 24–25). |
| Tests | As §9.2 item 9; `_launch.yaml` and `feature-tour-e2e.yaml` in the same PR. |

**Owner decisions still open** (Codex review welcome on each):

1. **Re-ask cadence.**
   - (a) Once a day until yes, weekly after five "later" (as approved).
   - (b) Design: day-opens 3, 5 and 8, then weekly, so the widget offer gets day 2.
   - (c) Engineering: (a) plus a lifetime cap (90 days or 12 asks).
2. **The Settings variant after an OS denial.**
   - Engineering says keep it passive, for policy risk.
   - The owner asked to keep asking.
   - Recommendation: passive, plus one launch reminder at most weekly.
3. **"फिर न पूछें · Don't ask again"** from the third decline (design). It conflicts with "until yes".
4. **Widget offer sheet on a later day.** Keep it in this PR (owner ask; needs the module-store pin chain), or ship the asks first and add the sheet after (engineering).
5. **City search depth in step 2.** Full pincode/place search, or cities plus GPS with a hand-off to the full picker.

## 11. Quiet companion implementation — 31 October 2026

The owner selected Quiet companion for all setup and nudge surfaces and requested implementation. The follow-up uses the shared native sheet and the revised order in §10. Decisions implemented from the preview: passive hard-denial recovery, bundled-city search + staged GPS, later-day widget offer, two/two/three-day reminder rests then weekly, and a stop control from the third decline. These are calendar-day rests, not a count of opens; sparse users are not asked repeatedly within a day. Source and validation details live in design.md's Quiet companion section. Device QA is explicitly pending.

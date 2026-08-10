# PRD-15 — Home-Screen Widgets (विजेट)

| | |
|---|---|
| **Status** | Draft for review — prototype attached |
| **T-shirt size** | M–L (native WidgetKit/AppWidget targets; JS side is small) |
| **Prototype** | [`docs/widgets-prototype.html`](../../widgets-prototype.html) — all three widgets on iOS home/lock screen + Android, the More-tab Widget Gallery, and the stale fallback, every interaction annotated |
| **Feasibility** | ✅ Confirmed — the repo already ships custom native code via CNG (`modules/japam-alarm-ios` local Swift module, `plugins/withJapamAlarmIos.js`, `plugins/native-android`), so the EAS pipeline and team can carry native targets. New surface: an iOS widget-extension target + App Group, an Android `AppWidgetProvider`. **Store release only — no OTA path.** |

> **Design intent (validated in the prototype):** widgets are the **parchment system rendered on the OS canvas** — `parchment-hi → parchment` gradient card, ॐ brand mark top-right, Noto Serif Devanagari content, no emoji. Three widgets in v1: **आज का श्लोक** (daily verse), **आज का पंचांग** (tithi · vrat · timings), **जप-साधना** (streak ring). All state is precomputed by the app; widgets never compute or fetch.

---

**Bundle-only:** the app writes a ~14-day JSON payload (verse-of-day, per-day panchang summary, streak/japam counters) into the shared container (iOS App Group / Android SharedPreferences) on every foreground and after the headless notification scheduler runs. The native widget reads that payload on its midnight timeline. **No network, no account, no new runtime dependency on the JS side.**

## 1. Problem

Vedansh's daily-return loop currently has exactly two re-entry surfaces: the user remembering to open the app, and notifications (PRD-01 families). Notifications are interruptive and capped by the shared iOS pending budget; memory is unreliable. The highest-retention surface in mobile — the **home screen itself** — carries nothing. Competing panchang apps ship tithi widgets as table stakes; devotional users check "आज कौन सी तिथि/व्रत है?" multiple times a day, and today that always costs a full app open (or goes to a competitor's widget).

## 2. Goal

Put the three highest-frequency glances — today's verse, today's panchang, the japam streak — on the user's home and lock screen as **zero-interruption ambient surfaces**. Success = D7/D30 lift in the widget-adopter cohort (local launch-ring-buffer comparison, per the Q3 measurement approach) and widget adoption ≥ 20% of active devices within two releases.

## 3. Where it lands in the app (surfaces)

Validated in the prototype; five surfaces total:

### 3.1 iOS home screen — small + medium WidgetKit widgets
- **आज का श्लोक (small):** one verse from the Daily-Bhakti pool, refreshed at local midnight. Tap → Daily Bhakti tab (existing `entryRoutes` deep link).
- **आज का पंचांग (medium):** tithi headline + today's vrat line (the same line PRD-followup #237 leads notification titles with) + sunrise / Rahu Kaal / Abhijit tiles from the PRD-14 muhurat engine. Tap → Panchang tab. City follows the in-app panchang location.
- **जप-साधना (small):** 108-bead progress ring for today + day-streak count from `UserActivityContext`. Tap → Japam counter. **Read-only in v1.**

### 3.2 iOS lock screen — accessory widgets
- **Inline (above clock):** today's tithi, or the vrat name on observance days.
- **Circular:** the streak ring. Accessories are OS-tinted/monochrome; the design carries no colour-only state, so it survives desaturation (design.md §12 discipline).

### 3.3 Android home screen — one resizable 4×2 AppWidget (Phase 2)
Panchang block + one-line verse teaser. 4×1 collapses to the tithi line; 4×3 expands the verse. Two tap zones: panchang → Panchang tab, verse → Daily Bhakti. Ships through the existing `plugins/native-android` config-plugin path.

### 3.4 In-app: More → "होम-स्क्रीन विजेट" row + Widget Gallery screen
A new row in the existing MoreHome list (standard NEW badge, one release). The gallery renders each widget preview **with today's real values** (the same JS that writes the payload) and per-OS "how to add" steps. No permission prompts anywhere — widgets need none.

### 3.5 Stale fallback state
If the app hasn't run past the precomputed window, the widget must never show a wrong tithi. It swaps to a reverent "पंचांग ताज़ा करने हेतु वेदांश खोलें" card; tapping opens the app, which rewrites the payload.

### Discovery
One Home-tab DISCOVER carousel card (existing `FeatureCard` mechanism, design.md §32) in the launch release, pointing at the gallery.

## 4. Architecture (the shape that keeps native thin)

| Layer | Responsibility |
|---|---|
| JS "widget planner" (new, pure) | Build the 14-day payload: per-day `{tithi, vratName?, sunrise, rahuKaal, abhijit}` via `computePanchangForDate` + `muhurat.ts`; verse-of-day ids from the Daily-Bhakti pool; streak/japam snapshot. Pure function + `tsx --test` suite, same pattern as the notification planner. |
| JS glue | Serialize payload → shared container on app foreground + after the headless scheduler runs. |
| iOS widget extension (Swift/SwiftUI) | Read App-Group JSON, render, midnight timeline entries, deep-link URLs. **No computation.** |
| Android `AppWidgetProvider` (Kotlin) | Same, from SharedPreferences, `AlarmManager`-free (midnight update via `updatePeriodMillis`/WorkManager). |

The "pure planner + native consumer" split mirrors the notification subsystem deliberately — it keeps all logic testable in TypeScript and the native code dumb.

## 5. Constraints & risks (why this is M–L, not S)

1. **New native targets.** iOS widget extension = a separate app target with its own provisioning profile — added via a config plugin (`expo-apple-targets` or equivalent), plus an **App Group** entitlement on both app and extension. EAS credentials must be updated.
2. **Store release only.** No OTA path for any of it; align with the next binary bump (content releases already ride store versions).
3. **Fonts in the extension.** Noto Serif Devanagari must be bundled into the widget target explicitly — the RN font pipeline does not reach extensions. The lint rule's lesson (silent system-font fallback) applies doubly here; verification must include a Devanagari render check on device.
4. **Timeline discipline.** WidgetKit budgets refreshes; one midnight entry per day + payload-rewrite on app-open stays far inside the budget.
5. **New Architecture / SDK 54** — WidgetKit extensions are independent of the RN runtime, so no interaction with the New-Arch flag; the Android provider must avoid the full-screen-intent class of permissions (#216 lesson).

## 6. What it does NOT do (non-goals)

- **No interactive widgets in v1** — counting japam from the widget (App Intents) is Phase 3.
- **No Live Activities / Dynamic Island**, no Apple Watch app.
- **No configurable widget options** (choosing a deity/text per widget) in v1 — one canonical form each.
- **No Android lock-screen widgets** (fragmented OS support).
- **No new notification behaviour** — widgets are the quiet counterpart to PRD-01, not an extension of it.

## 7. Phasing

1. **Phase 1 (iOS):** widget planner + payload glue; आज का पंचांग (medium) + आज का श्लोक (small); Widget Gallery + More row; stale state; deep links.
2. **Phase 2 (Android + lock screen):** the 4×2 AppWidget; iOS accessory widgets; जप-साधना small widget.
3. **Phase 3 (optional):** App-Intents japam counting from the widget; per-widget configuration.

## 8. Why it fits the moat

Every competitor widget is an ad-funnel or requires an account; Vedansh's is computed on-device from an engine already validated against DrikPanchang, renders in a reverent visual system, and asks for nothing — no permission, no login, no network. It converts the app's strongest asset (the panchang engine) into daily ambient presence.

## 9. Design compliance (design.md is authoritative)

- **Colour** — widget cards use only `parchment*`, `ink*`, `saffron*`, `gold`, `divider` token values; Rahu Kaal uses the PRD-14 terracotta `avoid` tone, never red. No hex outside the token values mirrored into the native targets (documented as the single sanctioned mirror, kept in sync by a checklist item in the RULEBOOK verification steps).
- **Type** — Noto Serif Devanagari for Devanagari, Cormorant Garamond for Latin secondary lines, Inter for tiny uppercase kickers (§3); bundled into each native target.
- **Iconography** — **no emoji** (§5); the ॐ mark and `॥` ornament only.
- **Accessibility** — no colour-only state (§12): the avoid window carries its label, the streak ring carries its number; accessory widgets are designed monochrome-first.
- **Bilingual, Hindi-led** — Devanagari primary, Latin/times secondary (§1).

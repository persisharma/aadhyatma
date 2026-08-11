# PRD-15 — Home-Screen Widgets (विजेट)

| | |
|---|---|
| **Status** | Revised draft — native feasibility gate required before implementation |
| **T-shirt size** | M–L after Phase 0 (new WidgetKit/AppWidget targets; JS planner is small, native delivery/signing is the risk) |
| **Prototype** | [`docs/widgets-prototype.html`](../../widgets-prototype.html) — iOS home/lock-screen states, Android, the in-app Widget Gallery, and freshness fallbacks |
| **Feasibility** | 🟡 Architecture plausible, not yet proven. Existing CNG native modules show that the repo can carry native code, but not that a clean prebuild can reproducibly create, entitle, sign, install, and update a second iOS application target. Phase 0 must prove that path before feature work begins. The initial feature requires a store binary; later JS-planner changes are OTA-safe only while the native payload schema remains compatible with that binary. |

> **Design intent:** widgets are the parchment system rendered on the OS canvas — `parchment-hi → parchment`, ॐ brand mark, script-aware serif content, no emoji. V1 surfaces are **आज का श्लोक** (daily verse), **आज का पंचांग** (tithi · vrat · timings), and **जप-साधना** (japa-only progress and streak). JS precomputes content without delaying Home; native code validates, selects, and renders the correct dated entry without performing astronomy or network work.

---

**Bundle-only data:** the app writes a versioned ~14-day payload into an iOS App Group / dedicated Android SharedPreferences file after foreground interactions settle, and again when the selected Panchang location/calendar system, app language, or Japam activity changes. Writes are deduplicated and throttled. There is no background/headless JS runner at notification-delivery time. After a successful atomic write, native glue explicitly requests a WidgetKit timeline reload / Android AppWidget update.

## 1. Problem

Vedansh's daily-return loop currently has two re-entry surfaces: the user remembering to open the app and notifications. Notifications are interruptive and share a finite iOS pending budget; memory is unreliable. Devotional users repeatedly ask “आज कौन सी तिथि/व्रत है?”, but the home screen currently carries none of Vedansh's daily value.

## 2. Goal and measurement boundary

Put the three highest-frequency glances — today's verse, today's Panchang, and today's Japam practice — on the user's home and lock screen as quiet ambient surfaces.

V1 adds **no remote analytics**. A local ring buffer may record widget installation visibility, payload freshness, widget deep-link opens, and subsequent app-launch days for on-device diagnostics, but it cannot establish fleet-wide adoption or causal D7/D30 lift. “20% of active devices” and cohort-retention claims require a separate, explicitly approved consented-telemetry decision. Until then, release gates are operational:

- no measurable regression to Home first-frame or first-tap readiness;
- no wrong-date Panchang display in missing, corrupt, incompatible, or expired payload states;
- every widget deep link reaches the intended destination on a cold and warm app;
- a foregrounded app refreshes changed content and requests a widget reload;
- every supported size passes native-device Devanagari/Gujarati/Kannada/English, contrast, truncation, VoiceOver/TalkBack, and large-text checks.

## 3. Where it lands in the app

### 3.1 iOS home screen — small + medium WidgetKit widgets

- **आज का श्लोक (small):** a deterministic Daily-Bhakti selection for the devotional/device-local day. The widget renders a maximum of two verse lines plus a compact source. Long verses use a deterministic excerpt/fallback selected by the planner; the full verse and source remain in the accessibility label. Tap → the exact Daily Bhakti entry through the existing deep-link dispatcher.
- **आज का पंचांग (medium):** represented IST date + tithi headline + vrat line + sunrise / Rahu Kaal / Abhijit from the PRD-14 engine. It carries the selected city and lunar calendar system used to compute it. Tap → Panchang on the represented date.
- **जप-साधना (small, Phase 2):** **Japam-only**, not the broader `UserActivityContext.currentStreak()`. The ring fills toward the first 108 beads of the day and stays full after 108; the caption shows actual total beads/rounds and a separately computed japa-active-day streak. The payload carries `lastUsedMantraId?`. Tap → that mantra's counter when present, otherwise the existing Japam library/category; it never invents a default mantra. Read-only in v1.

### 3.2 iOS lock screen — accessory widgets (Phase 2)

- **Inline:** represented IST date's tithi, or the vrat name on observance days.
- **Circular:** japa-only progress/streak with a numeric/text cue that survives monochrome and tinted appearances.

Accessory widgets require the supported OS family; unsupported versions simply do not advertise those families.

### 3.3 Android home screen — one responsive AppWidget (Phase 2)

One widget provides explicit responsive layouts rather than assuming launcher cell dimensions: compact = dated tithi line; standard ≈ 4×2 = Panchang + one-line verse teaser; expanded = two-line verse. Panchang and verse are separate tap zones. On Android 8+ launchers that support it, the gallery offers the system `requestPinAppWidget()` confirmation. Unsupported launchers fall back to written steps.

Android midnight refresh is **best-effort**, never exact: `updatePeriodMillis`/WorkManager may be delayed by the OS. Every layout therefore shows or exposes the represented date, rejects expired data, and refreshes immediately when the app next writes a payload.

### 3.4 In-app: More → “होम-स्क्रीन विजेट” + Widget Gallery

Add the standard MoreHome row with a one-release NEW badge. The gallery renders previews from the same validated payload contract as native consumers and shows platform-specific instructions.

- **Android:** “Add widget” invokes `requestPinAppWidget()` only when supported, otherwise shows steps.
- **iOS:** show accurate long-press → Edit Home Screen → Add Widget instructions. Do not promise a system widget-picker jump; WidgetKit exposes configuration discovery/reload, not an in-app add-widget API.
- No permission prompt is introduced.

One launch-release Home DISCOVER card may point to this gallery through the existing `FeatureCard` mechanism.

### 3.5 Missing, invalid, and expired states

The native reader validates schema, required fields, dates, and freshness before rendering:

- **first run / missing:** “विजेट तैयार करने हेतु वेदांश़ खोलें”;
- **corrupt or incompatible:** same safe open-app recovery, never partially decoded values;
- **Panchang expired:** “पंचांग ताज़ा करने हेतु वेदांश़ खोलें” and no old tithi;
- **verse expired:** a neutral open-app card, not an old verse labelled as today;
- **Japam snapshot old:** show the last-updated date or a refresh prompt, never imply that an old count is today's.

Tap opens the relevant app surface; a successful app write requests an immediate native reload rather than waiting for an unspecified next timeline tick.

## 4. Architecture

### 4.1 Versioned payload

The shared document includes at minimum:

```ts
type WidgetPayloadV1 = {
  schemaVersion: 1;
  generatedAt: string;
  writerAppVersion: string;
  locale: 'hi' | 'en' | 'gu' | 'kn';
  panchang: {
    timeZone: 'Asia/Kolkata';
    cityId: string;
    calendarSystem: 'purnimant' | 'amanta';
    validThrough: string;
    days: PanchangWidgetDay[];
  };
  verses: { timeZone: string; validThrough: string; days: VerseWidgetDay[] };
  japam: { dateKey: string; timeZone: string; totalBeads: number; totalRounds: number; japaStreak: number; lastUsedMantraId?: string };
};
```

Native readers ignore unknown additive fields, reject unsupported schema versions, and never assume missing required values. JS writes to a temporary file/value and atomically replaces the committed payload. A committed JSON fixture is decoded by TypeScript, Swift, and Kotlin tests to pin cross-language parity.

### 4.2 Responsibilities

| Layer | Responsibility |
|---|---|
| Pure JS planner | Build dated Panchang/verse entries and Japam snapshot from explicit inputs. No React, storage, network, wall clock, or native APIs. |
| Deferred JS coordinator | After interactions, deduplicate by day/location/calendar/language/activity revision, plan only when stale, atomically persist, then request native reload. It must not import/evaluate the Panchang graph on Home's initial path. |
| iOS extension | Decode and validate App-Group payload; emit dated WidgetKit timeline entries; render supported families; route deep links. No astronomy/network. |
| Android provider/worker | Decode and validate dedicated SharedPreferences payload; choose responsive RemoteViews; perform best-effort refresh; route PendingIntents. No astronomy/network. |

The active app language is respected: Hindi/English/Gujarati/Kannada copy and the corresponding existing serif assets must be included in the extension/provider targets. A deliberate Hindi-only native surface would require a separate product decision rather than silently ignoring the app preference.

## 5. Phase 0 — mandatory native feasibility gate

Before estimating/starting Phase 1, a throwaway vertical spike must prove all of the following from a **clean CNG prebuild**:

1. Reproducible WidgetKit target creation with a stable extension bundle identifier.
2. App Group entitlement present in both compiled app and extension provisioning profiles.
3. EAS development/internal build signs every target and installs on a physical device.
4. Main app atomically writes a fixture; extension reads it; `WidgetCenter` reload displays the changed value.
5. Cold/warm widget deep links reach the intended nested route.
6. Noto Serif Devanagari plus Gujarati/Kannada assets render from the extension target without fallback/clipping.
7. A second clean prebuild produces no unexplained Xcode-project drift.

Failure of any gate returns the PRD to architecture review. A local Swift module is not accepted as proof of extension-target feasibility.

## 6. Constraints and non-goals

- Initial delivery is store-binary-only. No OTA can add or change native target code, entitlements, SwiftUI/RemoteViews layout, or fonts.
- Compatible JS planner/copy changes may ship only to a runtime whose native reader supports that schema.
- No interactive counting, Live Activities, Dynamic Island, Apple Watch app, account, network fetch, or notification behavior.
- No per-widget deity/text configuration in v1.
- No Android lock-screen widget promise.
- WidgetKit/Android refresh dates are requests, not exact execution guarantees.

## 7. Phasing

0. **Native spike:** Phase 0 gate above.
1. **iOS:** payload schema/planner/coordinator; Panchang medium + verse small; gallery/More/Discover; recovery states; deep links.
2. **Android + accessories + Japam:** responsive Android widget with supported pin flow; iOS accessory families; japa-only widget.
3. **Optional:** App-Intent Japam counting and per-widget configuration, each requiring a fresh product/privacy review.

## 8. Verification

- Pure planner fixtures: date/time-zone boundaries, location/calendar/language changes, long-verse truncation selection, japa-only streak and >108 behavior.
- Shared-schema round trip in TypeScript/Swift/Kotlin; missing/corrupt/expired/newer-schema fixtures.
- Startup benchmark proving no Home first-frame/first-tap regression and no eager Panchang-stack evaluation.
- Clean prebuild drift check plus EAS multi-target build/sign/install evidence.
- Physical iOS and Android screenshots for every supported size, light/tinted/monochrome where applicable, and hostile wallpapers.
- VoiceOver/TalkBack labels include complete verse/source, represented date/location, each timing label/value, bead total and streak.
- Real cold/warm deep-link tests and app-write → widget-reload tests.

## 9. Design compliance

- Mirror documented theme token values into native targets through one reviewed mapping; use `avoidDeep` for text on terracotta-tinted surfaces.
- Final native specs—not scaled prototype CSS—must keep meaningful widget text at **10 pt or above**. Remove labels that cannot fit instead of shrinking them.
- Numerals/times/status labels use a readable non-italic ≥600 face; italic Cormorant remains limited to short prose flourishes.
- The verse has a deterministic two-line fit policy and full accessible text; dynamic/large-text snapshots must not clip Devanagari matras.
- State is never colour-only; the streak carries a number/label and avoid windows carry their names.
- No emoji in widget or in-app feature chrome; OS-app icons shown in the prototype are illustrative context only.

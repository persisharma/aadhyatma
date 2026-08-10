---
title: Home Widgets
type: subsystem
sources: [mobile/src/widgets, mobile/src/screens/WidgetGalleryScreen.tsx, mobile/plugins/withHomeWidgets.js, mobile/plugins/withHomeWidgetsIos.js, mobile/plugins/home-widgets, mobile/modules/home-widgets-ios, mobile/App.tsx]
last_verified_date: 2026-08-10
confidence: high
status: current
---

## Summary

Vedansh publishes a single versioned JSON snapshot for native Home/Lock Screen widgets. JavaScript owns all Panchang, verse, locale, and Japam planning; Android and iOS only validate and render that snapshot, so the native extensions do not duplicate domain calculations.

## Details

`WidgetCoordinator` waits for interaction completion plus language, Panchang-location, Panchang-calendar, and Japam hydration. It then dynamically imports `planPayload`, builds a 14-day IST window, deduplicates/throttles writes, and sends one atomic document through `widgets/native.ts`. This keeps the Home first frame independent of the Panchang dependency graph.

The schema is `WidgetPayloadV1` in `widgets/contract.ts`:

- `panchang.days` and `verses.days` are indexed by an IST `dateKey` and each slice owns an ISO `validThrough` timestamp.
- `generatedAt` is provenance, not freshness; a snapshot remains valid throughout its precomputed 14-day window.
- every localized field carries `hi`, `en`, `gu`, and `kn` so native consumers never transliterate.
- Japam stores true total beads/rounds, a japa-only streak, the last-used mantra, and its snapshot date.

Android stores the complete document as one synchronously committed SharedPreferences string, updates `AppWidgetProvider`, and supports launcher pin requests. iOS writes a temporary file into the shared App Group, replaces/moves it atomically, and reloads WidgetKit timelines. The Expo config plugins generate the Android receiver/package wiring and an iOS 16 widget extension with an explicit host target dependency, Embed App Extensions phase, App Group entitlements, and bundled Indic/Latin fonts.

Deep links are exact and shared by warm/cold starts: verse links carry source/chapter/index, Panchang links carry the represented civil date, and Japam links carry a known mantra id or fall back to the Japam library. The in-app Widget Gallery provides previews, recovery text, platform instructions, and Android pin actions; it does not claim to prove launcher rendering.

## Dependencies

[[panchang]]

[[languages]]

[[japam-alarms]]

[[e2e-verification]]

## Gotchas

- Native decoders fail closed on missing, corrupt, newer-schema, wrong-time-zone, incomplete-localization, or expired documents. Never partially render a decoded payload.
- All represented dates are IST by product decision; widget location comes from the existing Panchang city selection, not a new location permission.
- A 36-hour `generatedAt` cutoff would break the promised offline window. Freshness must continue to use both slice `validThrough` values.
- Lock-screen Japam is a snapshot, not an interactive counter; when its `dateKey` is stale, show a refresh affordance rather than yesterday's progress as current.
- Maestro verifies gallery/deep-link app behavior on both platforms, but cannot establish that iOS WidgetKit or an Android launcher actually rendered the OS widget. That needs signed-device/launcher evidence.

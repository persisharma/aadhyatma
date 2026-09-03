---
title: Home Widgets
type: subsystem
sources: [mobile/src/widgets, mobile/src/data/versePool.ts, mobile/src/screens/WidgetGalleryScreen.tsx, mobile/plugins/withHomeWidgets.js, mobile/plugins/withHomeWidgetsIos.js, mobile/plugins/home-widgets, mobile/modules/home-widgets-ios, mobile/App.tsx]
last_verified_date: 2026-09-02
confidence: high
status: current
---

## Summary

Vedansh publishes a single versioned JSON snapshot for native Home/Lock Screen widgets. JavaScript owns all Panchang, verse, locale, and Japam planning; Android and iOS only validate and render that snapshot, so the native extensions do not duplicate domain calculations.

## Details

`WidgetCoordinator` waits for interaction completion plus language, Panchang-location, Panchang-calendar, and Japam hydration. It then dynamically imports `planPayload`, builds a 14-day IST window, deduplicates/throttles writes, and sends one atomic document through `widgets/native.ts`. Verse selection uses the manifest-derived range index in `data/versePool.ts`: each date resolves to a global pool index first, then loads only the selected verse's chapter. It never constructs the complete 1,362-record pool, and the planner yields between days so Home presses can run while the offline window is prepared.

The schema is `WidgetPayloadV1` in `widgets/contract.ts`:

- `panchang.days` and `verses.days` are indexed by an IST `dateKey` and each slice owns an ISO `validThrough` timestamp.
- `generatedAt` is provenance, not freshness; a snapshot remains valid throughout its precomputed 14-day window.
- every localized field carries `hi`, `en`, `gu`, and `kn` so native consumers never transliterate.
- Japam stores true total beads/rounds, a japa-only streak, the last-used mantra, and its snapshot date.

Content and size are independent. Each content type is its own widget kind — `VedanshVerseWidget`, `VedanshPanchangWidget`, `VedanshJapamWidget` on iOS; `VedanshVerseWidgetProvider` and `VedanshPanchangWidgetProvider` on Android — so the OS gallery lists them separately and the user picks the size. `widgets/catalog.ts` declares content → native kind, offered sizes, and recommended size once; the gallery renders from it and `catalog.test.ts` fails when the Swift `supportedFamilies`, the Kotlin providers, the `withHomeWidgets.js` receivers, or their `appwidget-provider`/layout resources drift from it. Every kind renders every size it advertises: the verse reads the full `lines` array on every cell except the small square (large gives each pada its own line, wide flows them as one ` · `-joined paragraph over three lines), and the Panchang goes from a tithi glance to labelled sunrise/Rahu Kaal/Abhijit rows.

Android stores the complete document as one synchronously committed SharedPreferences string, updates both `AppWidgetProvider`s, and supports per-kind launcher pin requests (`requestPinWidget(content)`). iOS writes a temporary file into the shared App Group, replaces/moves it atomically, and reloads WidgetKit timelines. The Expo config plugins generate the Android receiver/package wiring and an iOS 16 widget extension with an explicit host target dependency, Embed App Extensions phase, App Group entitlements, and bundled Indic/Latin fonts.

Deep links are exact and shared by warm/cold starts: verse links carry source/chapter/index, Panchang links carry the represented civil date, and Japam links carry a known mantra id or fall back to the Japam library. `App.tsx` resolves a cold initial widget URL alongside the font gate and passes its validated target into `TabNavigator`, so the target tab is the navigator's initial route and Home never mounts as an intermediate screen. Warm links still dispatch through the shared handler after navigation is ready. The in-app Widget Gallery provides previews, recovery text, platform instructions, and Android pin actions; it does not claim to prove launcher rendering.

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
- A widget kind is an OS-persisted identity: renaming or removing one drops every placed instance of it. The Aug 2026 split retired `VedanshAmbientWidget` (and the single combined Android receiver) deliberately — placed instances of the old kind disappear and must be re-added from the gallery.
- `twoLineExcerpt` is a **small-cell** budget (88 characters ≈ 4 lines at 13 pt), not a payload-wide summary. The wide verse cell rendered it too and so ellipsized any verse past the cap on a card sized for three 16 pt lines — BG 5.12 lost its closing pada with the third line empty. Only the iOS small / Android narrow (<180 dp) cell may read `excerpt`; everything wider reads `lines`. `catalog.test.ts` pins that in both native sources. Generally: never apply a size-specific cap on the shared payload path — put the full text in the payload and let the widest consumer decide.
- Section eyebrows (`आज का श्लोक`, `जप-साधना`) are not in the payload, so both native surfaces carry their own four-language literals. Anything else user-visible must come from the payload, which is always fully localized.
- `getVersePool()` is a bulk compatibility/test API, not a production startup API. Home routine completion, widget planning, daily reminders, random Daily Bhakti entry, and exact deep-link lookup must use manifest positions, `getVersePoolSize()`, `getVerseAtPoolIndex()`, or `findVerse()` so they load at most the selected chapter.

---
title: Home Widgets
type: subsystem
sources: [mobile/src/widgets, mobile/assets/widget-backgrounds, mobile/scripts/build-widget-backgrounds.mts, mobile/src/data/versePool.ts, mobile/src/screens/WidgetGalleryScreen.tsx, mobile/src/components/DailyBhaktiNudge.tsx, mobile/plugins/withHomeWidgets.js, mobile/plugins/withHomeWidgetsIos.js, mobile/plugins/home-widgets, mobile/modules/home-widgets-ios, mobile/App.tsx]
last_verified_date: 2026-11-13
confidence: high
status: current
---

## Summary

Vedansh publishes a single versioned JSON snapshot for native Home/Lock Screen widgets. JavaScript owns all Panchang, verse, locale, and Japam planning; Android and iOS only validate and render that snapshot, so the native extensions do not duplicate domain calculations.

## Details

`WidgetCoordinator` waits for interaction completion and preference/activity hydration, then dynamically reads `planCache.ts`. A valid persisted 14-day public window avoids all day solves on same-day launches and activity updates. The key covers OTA/build, engine cache version, both civil dates, coordinates/elevation, calendar, device zone and current observance labels. Language and private Japam totals are recomposed from current inputs, never stored in the derived cache. Misses dynamically load `planPayload`, which runs 14 cooperative day solves and reuses each next sunrise; the previous implementation performed 28 full solves. The numerical generators yield inside boundary searches through the shared queue. Cancelled generations abandon work before further calculation/publication. Native writes retain content deduplication, throttling and atomic transport.

`@vedansh:widget-plan:` is a derived-cache-reset prefix. The window stays separate from the device-local day store because its days are IST-anchored. Verse selection still uses `getVerseAtPoolIndex`, loading only selected chapters. `scripts/profile-home-startup.mts` measures desktop event-loop gaps; release-device Hermes latency requires device verification.

The schema is `WidgetPayloadV1` in `widgets/contract.ts`:

- `panchang.days` and `verses.days` are indexed by an IST `dateKey` and each slice owns an ISO `validThrough` timestamp.
- `generatedAt` is provenance, not freshness; a snapshot remains valid throughout its precomputed 14-day window.
- every localized field carries `hi`, `en`, `gu`, and `kn` so native consumers never transliterate.
- Japam stores true total beads/rounds, a japa-only streak, the last-used mantra, and its snapshot date.

Content and size are independent. Each content type is its own widget kind — `VedanshVerseWidget`, `VedanshPanchangWidget`, `VedanshJapamWidget` on iOS; `VedanshVerseWidgetProvider` and `VedanshPanchangWidgetProvider` on Android — so the OS gallery lists them separately and the user picks the size. `widgets/catalog.ts` declares content → native kind, offered sizes, and recommended size once; the gallery renders from it and `catalog.test.ts` fails when the Swift `supportedFamilies`, the Kotlin providers, the `withHomeWidgets.js` receivers, or their `appwidget-provider`/layout resources drift from it. Every kind renders every size it advertises: the verse reads the full `lines` array on every cell except the small square (large gives each pada its own line, wide flows them as one ` · `-joined paragraph over three lines), and the Panchang goes from a tithi glance to labelled sunrise/Rahu Kaal/Abhijit rows.

Android stores the complete document as one synchronously committed SharedPreferences string, updates both `AppWidgetProvider`s, and supports per-kind launcher pin requests (`requestPinWidget(content)`). iOS writes a temporary file into the shared App Group, replaces/moves it atomically, and reloads WidgetKit timelines. The Expo config plugins generate the Android receiver/package wiring and an iOS 16 widget extension with an explicit host target dependency, Embed App Extensions phase, App Group entitlements, and bundled Indic/Latin fonts.

Deep links are exact and shared by warm/cold starts: verse links carry source/chapter/index, Panchang links carry the represented civil date, and Japam links carry a known mantra id or fall back to the Japam library. `App.tsx` resolves a cold initial widget URL alongside the font gate; `widgetStartTarget` maps the parsed kind-based `WidgetDeepLinkTarget` to a shared `StartTarget` (`navigation/startTarget.ts`), which becomes the `NavigationContainer`'s `initialState`, so the target screen is the first one committed and Home never mounts as an intermediate screen. A Panchang landing also awaits `preloadPanchangStack()` first, so the cold path evaluates that lazy chunk off the render path and a chunk failure lands on Home rather than a stuck screen (see [[notifications]]). **The Panchang and Japam widget links used to be passed as the tab's `initialParams` instead, which React Navigation re-consumed on every return to that tab — each time pushing another `PanchangHome` (a full engine solve) until the tap appeared to land nowhere and the app froze (Sept 2026); see [[notifications]] for the rule.** The notification tap that launched the app is read in the same race and yields the same target shape for every notification family (see [[notifications]]); a widget URL wins and never waits on that read. Warm links still dispatch through the shared handler after navigation is ready. The in-app Widget Gallery provides previews, recovery text, platform instructions, and Android pin actions; it does not claim to prove launcher rendering. The Daily Bhakti setup strip (design.md §23) also offers the **verse + Panchang pair** once the daily reminder is set up: Android pins `verse`, queues `panchang` and requests it when the launcher's pin dialog closes (fallback: the gallery), iOS opens a how-to sheet with both facsimiles and the WidgetKit steps; a user whose verse flow already ran (`widgetAddedAt` without `panchangAddedAt`) gets a Panchang-only ask. It is gated on `hasWidgetHost()` in `widgets/native.ts`, which is false in Expo Go and in any binary without the extension, so an OTA never offers a widget the build cannot render.

Every home-screen cell (not Lock Screen) draws a faded sketch plate behind its text. There is one pre-cropped JPEG per (content, size), generated by `scripts/build-widget-backgrounds.mts` from `assets/backgrounds/` into `assets/widget-backgrounds/`, tone-mapped as a sepia duotone from `parchmentSoft` (paper) down to the darkest background the widget text tokens still read on at 4.75:1. The text tokens are `WIDGET_TEXT_TOKENS` in `catalog.ts`, deeper than the app's `inkMuted`/`saffronDeep`/`gold`. The plate sizes in `catalog.ts` `WIDGET_BACKGROUND_DIMENSIONS` double as the iOS pixel budget. The art is optional on both platforms: iOS `WidgetArt.image` returns nil (plain parchment) outside `systemSmall/Medium/Large`, outside `.fullColor` rendering, for recovery cards, or for a missing/undecodable/over-budget file. Android's `widget_art` ImageView is GONE in XML and shown only by `applyArt` on API 31+.

## Adaptive illustrated iOS verse layout (10 November 2026)
## Visual rebalancing — small iOS Panchang (11 November 2026)

The small Panchang's SwiftUI branch has a dedicated adaptive composition:
date/city masthead, running Tithi hero, optional verified-vrat saffron band,
and sunrise + Vedansh footer separated by a gold hairline. It uses only
existing validated payload fields and the bundled Heritage/Midnight Temple
plate, so there are no network calls, newly loaded artwork, schema changes or
freshness-policy changes. The in-app Widget Gallery now approximates the
same small composition. Wide/large Shloka compositions are vertically centred
when there is enough room, with a decorative source separator. Real WidgetKit
placement, fonts/size/appearance and accessibility remain device-only gates;
the best-effort SpringBoard screenshot flow is non-gating because system-UI
automation can fail across simulator releases. Any screenshots it produces
must be identified as native simulator evidence, not as a production build.


The SwiftUI medium and large Shloka families measure full content via
`ViewThatFits(in: .vertical)` before selecting an art/text composition:
32% art strip, 16% art strip, or 0% with a parchment contrast wash.
A bounded last resort explicitly cues a full-verse tap; the complete
localized verse and source remain in VoiceOver and the original deep link.
Small keeps its validated 88-character excerpt. No schema migration, new
asset download, engine computation or new widget kind is introduced.
The RN widget gallery approximates this progression for a wide preview;
actual iOS rendering is authoritative. Android's current RemoteViews
implementation is unaffected. The iOS layout needs a new store/TestFlight
binary; OTA alone cannot ship it. Multisource tests sample real Daily Bhakti
Gita, Sahasranama, stotra, Ramcharitmanas and Sundarkand entries in all four
languages. Native per-size typography/art/VoiceOver acceptance remains
pending until a device run with screenshots is recorded.

## Dependencies

[[panchang]]

[[languages]]

[[japam-alarms]]

[[e2e-verification]]

## Gotchas

- **`AppWidgetManager.getInstance()` can be null.** Devices without `FEATURE_APP_WIDGETS` have no widget service. `VedanshWidgetModule` is a legacy `@ReactMethod` module, where a throw is not a promise rejection, so every method settles its promise (pin support/request resolve `false`) and `updateAll` returns early. `androidWidgetNullSafety.jest.test.ts` pins this.

- Native decoders fail closed on missing, corrupt, newer-schema, wrong-time-zone, incomplete-localization, or expired documents. Never partially render a decoded payload.
- **The app cannot know whether a widget is placed.** Neither bridge exposes `getAppWidgetIds` / `WidgetCenter.getCurrentConfigurations`, and an Android pin request resolving `true` only means the launcher showed its dialog. Anything that offers a widget (the Daily Bhakti strip) must therefore end its ask on a completed add *flow*, not on placement; real detection needs a native bridge change and a store build.
- **Neither OS lets the app place a widget itself** — iOS has no API at all, and Android's `requestPinAppWidget` always shows a launcher confirmation, one widget per dialog. The native `requestPinWidget` passes no success callback, so the strip chains the second pin on the AppState return to `active` after the first dialog paused the app; the queue is set *before* the first request so the pause is never missed. A launcher that never pauses the app simply leaves the Panchang ask on the strip.
- All represented dates are IST by product decision; widget location comes from the existing Panchang city selection, not a new location permission.
- A 36-hour `generatedAt` cutoff would break the promised offline window. Freshness must continue to use both slice `validThrough` values.
- Lock-screen Japam is a snapshot, not an interactive counter; when its `dateKey` is stale, show a refresh affordance rather than yesterday's progress as current.
- Maestro verifies gallery/deep-link app behavior on both platforms, but cannot establish that iOS WidgetKit or an Android launcher actually rendered the OS widget. That needs signed-device/launcher evidence.
- **An iOS accessory (Lock Screen) branch with no `.widgetURL` is inert — the tap does nothing at all, forever.** The Panchang kind advertises `lock`, and its `.accessoryInline` branch rendered a bare `Text` while `.widgetURL` sat on the else-branch's `VStack`; the placed Lock Screen widget swallowed every tap, which reads as "the widget doesn't open anything" rather than as a bug in the app. `catalog.test.ts` walks every `family == .accessory*` branch and `recovery()` and fails if any renders no `widgetURL`. Per-branch modifiers are the trap: adding a family to `supportedFamilies` means adding its branch AND its URL.
- A widget kind is an OS-persisted identity: renaming or removing one drops every placed instance of it. The Aug 2026 split retired `VedanshAmbientWidget` (and the single combined Android receiver) deliberately — placed instances of the old kind disappear and must be re-added from the gallery.
- `twoLineExcerpt` is a **small-cell** budget (88 characters ≈ 4 lines at 13 pt), not a payload-wide summary. The wide verse cell rendered it too and so ellipsized any verse past the cap on a card sized for three 16 pt lines — BG 5.12 lost its closing pada with the third line empty. Only the iOS small / Android narrow (<180 dp) cell may read `excerpt`; everything wider reads `lines`. `catalog.test.ts` pins that in both native sources. Generally: never apply a size-specific cap on the shared payload path — put the full text in the payload and let the widest consumer decide.
- Section eyebrows (`आज का श्लोक`, `जप-साधना`) are not in the payload, so both native surfaces carry their own four-language literals. Anything else user-visible must come from the payload, which is always fully localized.
- `getVersePool()` is a bulk compatibility/test API, not a production startup API. Home routine completion, widget planning, daily reminders, random Daily Bhakti entry, and exact deep-link lookup must use manifest positions, `getVersePoolSize()`, `getVerseAtPoolIndex()`, or `findVerse()` so they load at most the selected chapter.
- **A widget image larger than the cell's pixel area makes WidgetKit drop the whole render (blank widget), not just the image.** That is why the plates are small (256², 560×260, 560²: under the smallest iOS 16 cell at @2x) and why `WidgetArt` refuses anything over its family budget. Upscaled on @3x phones they are slightly soft; that is accepted for background linework. Regenerate with the script; never drop in a bigger plate by hand.
- **Android art needs explicit hiding on every non-art render.** The launcher reapplies a same-layout RemoteViews onto the previous view tree, so `recovery()` must `setViewVisibility(widget_art, GONE)` or a stale plate survives behind the refresh card. Below API 31 the root cannot clip to its rounded outline, so those devices keep the flat card.
- The plates' contrast gate lives in the generator, not a test (Node has no JPEG decoder here). `catalog.test.ts` pins presence, exact SOF dimensions, the iOS budget constants, the Android drawable references and the gallery index. A wash or source change must re-run the script, which fails below 4.5:1 for `ink`/`inkMuted`/`saffronDeep`.
- **Background art visibility is capped by the lightest text colour, not by the art.** With the app's `inkMuted #6E5230` the legal floor was a pale `#DED0B5`, and every stronger plate failed 4.5:1. The fix was deeper widget-only text (`WIDGET_TEXT_TOKENS`, floor `#C0AD8E`), not a weaker gate. `catalog.test.ts` pins `WidgetTheme` and the Android layouts' `textColor`s to that table, because a surface drawing the app shades would sit under the gate on the darkest linework.

## Shared Quiet companion offer (31 October 2026)

The strip and later-day offer share `widgetNudgeStore.ts`, serialized record writes and a process-owned pin queue. A dismissed/unmounted sheet cannot remove the listener before the second Android dialog. On launchers without lifecycle transitions, a manual Panchang follow-up still pins it. iPhone's snapshot previews and manual instructions now use `QuietCompanionSheet`. Flow stamps still do not establish actual placement. The parent PR's Android-device validation gap remains open.


## Solar widget appearance (2 November 2026)

Verse and Panchang share the selected city's solved sunrise/sunset window. Day is Illustrated Heritage; night is Midnight Temple. Optional `sunriseAt`/`sunsetAt` fields are validated as one ordered same-IST-day pair in all readers; absent means legacy daytime, malformed means invalid. The offline iOS timeline and Android next-boundary alarm include both solar events. Verse date rollover remains device-local while solar appearance remains selected-city/IST.

`appearance.ts` owns preview selection/palettes; `heritage.ts` owns the source-to-reviewed-subject mapping. The deferred planner emits `artKey?`, and the cache key explicitly versions this solar payload addition. `scripts/build-widget-heritage.mjs` generates 66 budgeted plates from existing reader art and records hashes. Native paint sits in a separate right region; small verse keeps full-width text. Missing art has a palette-correct plain fallback. Recovery/iOS tinted modes keep day styling; Japam retains its existing artwork. Android's dynamic resource lookup requires `res/raw/vedansh_widget_keep.xml` to survive release shrinking.

Native compilation, signed device timelines, four-language/size visual and accessibility review remain pending until executed; generated plates and source tests do not establish native fidelity. A new binary is required.


## First-run widget setup (5 November 2026)

`OnboardingSetupSheet` starts widgets from language Continue. Android saves city as its resume point before the existing process-owned pair pin flow; iPhone persists a `widgets` substep and embeds the shared `WidgetHowToBody` in the same Modal. Continue records instruction completion, Not now records widget dismissal, and both lead to city without changing reminder preferences. No iOS placement API exists; flow records remain bookkeeping only. Missing hosts and failed/unsupported Android pinning continue onboarding. The later launch offer retains its day/priority policy and the gallery remains available. Source tests and native evidence must be reported separately.


## Android composition parity (13 November 2026)

The solar change (2 Nov) gave Android the palettes and plates but none of the iOS composition, so placed Android widgets looked like the old design. The verse layout now has a header row (eyebrow capsule `vedansh_widget_pill[_night]` + `widget_brand_header`), a 1 dp gold `widget_rule` above the source, and a footer mark only on the small cell. The Panchang layout has a rule for the small cell's divided sunrise row, and large gets separate sunrise / Rahu Kaal / Abhijit lines under a 32 sp tithi. The rule is an `ImageView` (RemoteViews rejects a bare `View`). Every toggled view is set explicitly on every render path, and recovery clears the capsule and rule, because launchers reapply RemoteViews onto the previous tree. The Kotlin was compiled against Robolectric's `android-all` 12 jar with a stub `R`; no Gradle/AAPT build or launcher run was done. This needs a new Android binary. Pins: `appearance.test.ts`.

- **Gotcha:** native widget work needs a store build on **each** platform. iOS 1.5.6 (build 76) shipped the 2 Nov design. `app.json`'s Android `versionCode` stayed at 15 (1.5.5, bumped 27 Oct, before #595 merged). Check which binary a device runs before treating a missing native design as a code bug.

---
title: E2E (Maestro) — authoring, verification, and the ship-with-e2e policy
type: runbook
sources: [mobile/.maestro, mobile/.maestro/README.md, mobile/.maestro/_launch.yaml, mobile/.maestro/vidhi-smoke.yaml, mobile/scripts/e2e-screen-text.sh, mobile/scripts/e2e-visual-check.sh, RULEBOOK.md]
last_verified_date: 2026-09-26
confidence: high
status: current
---

## Summary

Every user-facing change ships with an e2e flow. UI e2e is [Maestro](https://maestro.mobile.dev)
flows in `mobile/.maestro/*.yaml`, targeting the installed native app on dedicated iOS and Android simulators.
Use the embedded Release bundle for normal journeys and Debug for development-only fixtures. This runbook covers the
**policy**, how to **author** a flow, and how to **verify** one on a live simulator — including
the isolated-simulator recipe for machines running many Conductor worktrees at once. For the flow
catalog, setup, and element-selection rules, see `mobile/.maestro/README.md`.

The SQLite verification runs ordinary flows against Release without Metro. Three
`new-content-badge*` upgrade-fixture flows carry `requires-dev` and require Debug plus
this worktree's Metro on port 8084. Use `--exclude-tags requires-dev` for Release and
`--include-tags requires-dev` for Debug. Keep `RCT_jsLocation=127.0.0.1:8084` on warm
Debug launches too: clearing or omitting that address can produce “No script URL provided”.
The Expo Go instructions below describe legacy setup; current native flow app IDs take precedence.

## Policy — every change ships with e2e

Per RULEBOOK §0, a change that alters a **user-facing surface** (a screen, a card, navigation,
a new content section, a label a flow asserts) MUST add or update a Maestro flow in the same PR,
in addition to unit tests. Concretely:

- **New content section** → update the owning per-category smoke (`chalisa-smoke`, `aarti-smoke`,
  `stotram-smoke`, …): bump the count in the header comment and add an `assertVisible` /
  `scrollUntilVisible` for the new card. (`.maestro/README.md` §"Adding a new section".)
- **New screen / nav route** → add a smoke flow that reaches it from Home and asserts its key surface.
- **Changed label / structure a flow asserts** → update every flow that selects it (grep `.maestro/`).
- **Expanded a large bundled corpus** → make the owning smoke load a late subsection, not only
  assert the library card. `granth-smoke.yaml` scrolls through all seven Vālmīki kāṇḍa counts,
  opens Uttara Kāṇḍa, and pages from `7.1.1`, while data tests exhaustively validate all records.
- **Pure logic with no user-facing surface** → unit test only; no e2e required.

A change is not "done" until its e2e is written **and** the flow parses (`js-yaml` load) — and, for
anything reachable in Expo Go, run green at least once on a simulator (see Verification).

## Authoring rules (the ones that bite)

- **Select on stable English accessibility labels, not visible text.** iOS default Hindi renders
  Devanagari, which Maestro's iOS tree can't read; card/tile a11y labels are English by contract.
  Flip to English first when a flow needs to read verse/screen text (`More → Language → English`).
- **Category / library cards use `.*` when a NEW badge is possible.** `CategoryCard` /`LibraryCard`
  a11y label is `` `${nameEn}.${hasNew ? ' New.' : ''} Tap to open.` ``. A category with any
  debut-new entry (`addedInVersion` > `1.2.0`, see [[languages]]/NewContentContext) can render
  `"X. New. Tap to open."`, so its selector must be `"X\\..*Tap to open\\."`, NOT the exact form.
  `sanskar-smoke`'s 6-tile block encodes the convention: no-debut-new tiles (granth/japam) use the
  exact form, badge-capable tiles (stotram/aarti/sanskar/chalisa) use `.*`. Adding a debut-new entry
  to a previously-clean category flips its tile to badge-capable — fix every flow that asserts it.
- **Multi-instance readers** (chalisas via `chalisaRegistry`, aartis via `aarti/index.ts`) are
  dispatched by a route param; a smoke opens ≥1 instance to prove dispatch. Aarti legacy positional
  ids (`aarti-N`) canonicalize by index — appending an aarti makes `aarti-<lastIndex>` valid
  (`sourceIdMigration`).
- **`_launch.yaml` dismisses onboarding BEFORE asserting the Home canary.** The fresh-install
  feature tour is an overlay (Home visible behind it), but the returning-user What's New sheet is a
  full modal that covers Home — so the optional "Skip tour" / "Close" (What's New ✕) / "Got it" taps
  run *before* the `"Good Habits"` canary, else a covering modal fails the canary first. Do not
  reorder them back.

## Verification — isolated simulator (recommended on multi-worktree machines)

This box often runs several Conductor worktrees, each with its own Metro and all showing the same
Expo Go app name "Vedansh". Running against the shared booted sim is unsafe — `tapOn "Vedansh"` is
ambiguous and can load the wrong worktree's bundle (a false green). Use a **dedicated** sim + this
worktree's **own** Metro:

1. Start this worktree's Metro on a free port (not 8081/8082/8083/8090):
   `cd mobile && npx expo start --port 8084 -c` (background; `-c` clears the stale cache).
2. Boot a dedicated, currently-shutdown simulator (leave the shared one alone):
   `xcrun simctl boot <UDID>` — pick one from `xcrun simctl list devices available`.
   Confirm Expo Go is present: `xcrun simctl listapps <UDID> | grep host.exp.Exponent`.
3. Warm the bundle + prime Expo Go's project recents:
   `xcrun simctl terminate <UDID> host.exp.Exponent; xcrun simctl openurl <UDID> exp://127.0.0.1:8084`.
   Wait for `iOS Bundled … index.ts` in the Metro log.
4. Run against that device explicitly:
   `maestro --device <UDID> test .maestro/<flow>.yaml`.
   Confirm the correct bundle loaded with TEXT, not a screenshot: prove bundle freshness with
   `curl 'http://127.0.0.1:8084/index.bundle?platform=ios&dev=true&minify=false' -o /tmp/b.out && grep -c '<UniqueStringFromYourEdit>' /tmp/b.out`
   (must be >0), and/or run `mobile/scripts/e2e-screen-text.sh <UDID>` and check an expected label.

### Native debug build (Kundali and native-module coverage)

Use this when a flow declares `appId: com.prashantsharma.vedansh`:

1. Boot a dedicated shutdown simulator and confirm its UDID.
2. From `mobile/`, run
   `npx expo run:ios --device <UDID> --port 8084`.
   The generated `ios/` directory is gitignored; the command prebuilds, compiles, installs, starts
   the worktree's Metro, and launches the native debug binary.
3. Confirm the installed bundle:
   `xcrun simctl listapps <UDID> | grep com.prashantsharma.vedansh`.
4. Run
   `maestro --device <UDID> test .maestro/kundali-smoke.yaml`.
   The flow clears only this app's simulator state and launches the native development build with
   React Native's `RCT_jsLocation=127.0.0.1:8084` launch argument, so it cannot inherit a Metro
   server from another workspace and never touches Expo Go.

### Android embedded release proof

Use a release APK when a cross-platform gate must prove the current worktree independently of any
Metro or OTA state. PRD-23 used this path on Android 16 / API 36:

1. Build and install with JDK 17 and this machine's Android SDK:
   `JAVA_HOME=/opt/homebrew/opt/openjdk@17 ANDROID_HOME=/opt/homebrew/share/android-commandlinetools npx expo run:android --variant release --device <avd> --no-bundler`.
2. Clear the package, disable emulator Wi-Fi/mobile data, and launch `com.prashantsharma.vedansh/.MainActivity` directly. This forces the embedded bundle and prevents a published update or unrelated Metro from replacing it.
3. Run `maestro --device <serial> test .maestro/<flow>.yaml`. Re-enable network after evidence collection if the emulator is shared.

The PRD-23 `vidhi-smoke.yaml` run passed separately on iOS 26.4 and this Android path on 2026-08-25.

The 2026-09-26 SQLite follow-up passed the full 76-flow Android inventory and
114-document / 25,395-verse / four-language native audit. Details, build hashes and
all attempts: `docs/testing/sqlite-android-2026-09-26.md`.

- Android Debug upgrade fixtures require the compiled Gradle option
  `-PreactNativeDevServerPort=8084` plus `adb reverse tcp:8084 tcp:8084`; the iOS
  `RCT_jsLocation` launch argument does not configure Android Metro.
- Save the normal APK before `e2e/library-audit/build-android.mjs`, which reuses
  Gradle's Release output path. It restores temporary generated entry/Updates
  configuration in `finally`. Reinstall the normal APK afterwards and rebuild the
  normal Gradle output before delivering that path.
- `e2e/library-audit/run-android.py` needs a dedicated root-capable Google APIs
  emulator to collect the Release app's private report. The app runs under its
  normal UID; root is for report collection. Never run a UI flow on its device
  concurrently with the audit.
- Android can append `accessibilityValue` as `label, value`. Match an optional
  comma suffix after the exact action prefix and retain content assertions.
- Require real destination content after navigation. Search empty tiles can
  share briefing titles, and a visible Rahu Kaal tile is not the All timings
  navigation control. Center targets that sit beneath fixed navigation bars.
- A passing matching JUnit case can coexist with a Maestro CLI teardown hang.
  Retain exit code and teardown termination separately; terminate only a runner
  whose flow has finished, then reuse its device. Keep failed attempts and require
  the exact inventory without missing/skipped cases.
- Android has Verse and Panchang native widget providers. The gallery's Japam
  preview/deep link does not establish a native Japam provider. Launcher XML and
  matching tap destinations provide evidence beyond in-app previews.


## Token-cheap verification (agent policy)

Reading screenshots into an LLM context costs ~1,100–1,600 tokens per full-res image; a whole
verification session can burn hundreds of thousands of tokens on pixels that carry no extra
information over the accessibility tree. Rules, in order:

1. **A green `maestro test` exit is the verdict.** The flows are assertion-based
   (`assertVisible` against the a11y tree). After a pass, do NOT open any screenshot —
   including the `takeScreenshot` artifacts some flows emit (those are for humans).
2. **"What's on screen?" → `mobile/scripts/e2e-screen-text.sh [UDID]`.** Wraps
   `maestro hierarchy`: one line per labelled element (`[bounds] #testID label`), typically
   ~100–300 tokens for a full screen. It prints the exact merged a11y strings Maestro
   regex-matches, so it's also the right tool for debugging selector failures (the
   comma-joined Pressable labels, NEW-badge variants, etc.).
3. **Bundle freshness is proven by `curl` + `grep`** (see step 4 above), never by
   eyeballing the run screenshot.
4. **On a failure**, escalate in this order: (a) Maestro's console output — it names the
   failed step and reason; (b) `e2e-screen-text.sh` against the failure state; (c) only if a
   genuinely *visual* question remains (layout overlap, theming, clipping), read ONE
   screenshot — downscaled first: `sips -Z 640 shot.png --out /tmp/shot-small.png`
   (~4–5× fewer tokens than full-res).
5. **Visual regressions are caught by the cached golden-diff harness, not by eyeballing.**
   Flow checkpoints (`takeScreenshot: e2e-shots/<name>`) are pixel-diffed against committed
   goldens by `mobile/scripts/e2e-visual-check.sh` (normalize to 440×956 → per-pixel compare,
   status-bar clock masked). Unchanged screens verify at ZERO token cost (`PASS 0.014%`);
   a real change exits 1 with a `FAIL <diff%> bbox=…` line and writes
   `e2e-shots/<name>.diff.png` (changed pixels in red) — read that one small image, nothing
   else. Intentional UI change → delete the golden, re-run to reseed, commit the new golden.
   Thresholds: `E2E_VISUAL_THRESH` (default 0.10 %), `E2E_DIFF_TOL`, `E2E_DIFF_MASK_TOP`.
6. **True visual/design review** (a new screen with no golden yet): downscale every capture
   (`sips -Z 640`), and prefer delegating the image-reading to a subagent that returns a
   one-line text verdict, so pixels never enter the main context.
7. **Prefer adding an `assertVisible` over a screenshot check.** If you needed to look at a
   screen to verify a change, encode that check as a flow assertion — it's cheaper on every
   future run and survives as a regression gate. Reserve `takeScreenshot` checkpoints for
   genuinely visual surfaces (layout, theming, celebration overlays).

## Gotchas

- **Corpus coverage is separate from navigation coverage.** `mobile/e2e/library-audit/`
  mounts every SQLite verse through production components in four languages, validates
  source fingerprints and speech chunks, and requires exact per-document counters. It
  replaces the app on a dedicated simulator; reinstall normal Release afterwards. Clear
  the audit app data and disable Expo Updates only in its temporary copied app to avoid
  reusing an earlier custom entry cached under the same manifest identity.
- **Visibility is not always tappability.** Native accessibility bounds may extend under
  the bottom tab bar. Center ordinary tappable rows before tapping. Do not demand
  centering for fixed headers or top/bottom content that cannot scroll to the midpoint.
  Large accessibility groups may exceed the viewport; use a suitable visibility percentage
  and assert the meaningful child/control rather than requiring 100% of the group.
- **Search input and result can share a label.** Use a partial query or a stable row ID
  so a result tap does not hit the input instead.
- **Long Maestro runs can fail during log archiving after reporting verdicts.** This run
  observed `DebugLogStore.finalizeRun` / `NoSuchFileException` for a missing own log directory.
  Preserve JUnit and command records, distinguish teardown from app failures, and stop only
  a runner that has already completed its flows before reusing its device.

- **Expo Go reloads mid-flow** (repeated `iOS Bundled … index.ts (1 module)` in the Metro log)
  reset navigation to Home, so reader-open steps can intermittently "bounce". Re-run once; it's
  transient dev-server flakiness, not a regression. For rock-solid reader coverage use a dev build —
  Expo Go also lacks custom native modules (see [[japam-alarms]]).
- **`runFlow:` paths resolve relative to the flow file**, not the cwd. A flow in `/tmp` cannot
  `runFlow: .maestro/_launch.yaml`; keep flows in `.maestro/` or inline the launch steps.
- **Device disconnect** ("… was requested, but it is not connected") means the sim shut down
  (idle) — re-`boot` it; Metro survives.
- **Back-to-back full-suite runs flake** — reboot the sim between them.
- No CI e2e gate today; flows are run manually per `.maestro/README.md`. Keep them green locally.

## Dependencies

- `mobile/.maestro/README.md` — setup, running, flow catalog, element-selection rules (authority).
- `mobile/.maestro/_launch.yaml` — shared boot subflow (onboarding dismissal, Home canary).
- [[readers]] — multi-instance reader dispatch (chalisas/aartis) the smokes exercise.
- `RULEBOOK.md` §0 (test gate), §3 (multi-instance readers), §4 (readers serve right content).

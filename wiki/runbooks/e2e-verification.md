---
title: E2E (Maestro) — authoring, verification, and the ship-with-e2e policy
type: runbook
sources: [mobile/.maestro, mobile/.maestro/README.md, mobile/.maestro/_launch.yaml, mobile/.maestro/vidhi-smoke.yaml, RULEBOOK.md]
last_verified_date: 2026-08-25
confidence: high
status: current
---

## Summary

Every user-facing change ships with an e2e flow. UI e2e is [Maestro](https://maestro.mobile.dev)
flows in `mobile/.maestro/*.yaml`, normally run against **Expo Go** on an iOS simulator; native
module and app-shell coverage uses an installed development build. This runbook covers the
**policy**, how to **author** a flow, and how to **verify** one on a live simulator — including
the isolated-simulator recipe for machines running many Conductor worktrees at once. For the flow
catalog, setup, and element-selection rules, see `mobile/.maestro/README.md`.

PRD-C's `kundali-smoke.yaml` is the first native-build exception: it launches
`com.prashantsharma.vedansh` directly so custom native configuration and the real app shell are
covered rather than Expo Go. Its file header and the native recipe below are authoritative.

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
   The screenshot in `~/.maestro/tests/<ts>/` confirms the correct bundle loaded
   (look for the app's version, e.g. the What's New sheet showing the expected `V1.4.x`).

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

## Gotchas

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

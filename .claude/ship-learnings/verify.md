# /ship Learnings — verify phase

Learnings are auto-captured after each /ship run. Read before starting the phase.

### Expo lint first-run bug: invoke `npx eslint .` directly when `expo lint` fails with "Cannot find module 'eslint'"

**Seen:** 1x — 2026-04-22
**Category:** tooling
**Example:** `npx expo lint` on a freshly scaffolded project auto-installs eslint+eslint-config-expo, writes eslint.config.js, then crashes trying to `require('eslint')` from its own vendored @expo/cli directory (module resolution picks the wrong node_modules). Fallback: `npx eslint .` reads the same config and runs clean. Second invocation of `expo lint` also works. Not our bug.
**Resolution pattern:** If `expo lint` crashes on first scaffold run, run `npx eslint .` directly to confirm zero lint errors, then re-run `expo lint` once node_modules settles.

### Use `expo export` (not `expo start`) for non-interactive Metro verification in CI/automation

**Seen:** 1x — 2026-04-22
**Category:** verification
**Example:** Verified the scaffold bundles cleanly with `npx expo export --platform ios --output-dir .expo-verify-out` → "iOS Bundled 5408ms index.ts (908 modules)" exit 0. This is a non-interactive bundle, safe for automation; `expo start` would hang waiting on user input.
**Resolution pattern:** For CI/automation Metro smoke tests, use `expo export --platform ios` (or android) to a throwaway dir, then delete the output. Never rely on `expo start` in unattended contexts.

### Expo Go first-launch triggers a tutorial + URL-confirmation dialog that can't be dismissed without UI automation or user assist

**Seen:** 1x — 2026-04-22
**Category:** simulator-verification
**Example:** Running `xcrun simctl openurl booted exp://...` on a fresh Expo Go install triggers an "Open in Expo Go?" iOS dialog AND Expo Go's one-time dev-menu intro screen. `osascript` tap is blocked without Accessibility grant; `xcrun simctl ui` only exposes appearance/contrast. Workaround: launch Expo Go directly via `simctl launch booted host.exp.Exponent --args -EXKernelLaunchUrlDefaultsKey <url>` to avoid the Open? dialog, then ask the user to tap through the one-time tutorial.
**Resolution pattern:** For Expo Go sim verification in an automated context without Accessibility: (1) launch via `simctl launch --args -EXKernelLaunchUrlDefaultsKey exp://...` to skip the Open? prompt; (2) watch Metro log for "iOS Bundled" as the bundle-delivered signal; (3) ask the human to dismiss the dev-menu tutorial once, then snapshot to confirm.

### When port 8081 is taken, pass `--port 8082` to `expo start` + run from the app's directory (not repo root)

**Seen:** 2x — 2026-04-22, 2026-04-25
**Category:** tooling
**Example:** Ran `npx expo start --ios` from repo root → ConfigError (no package.json at root) and port conflict with another running Metro (CreditScore's on 8081 in one case, a stale workspace Metro in another). Fix: `cd mobile && CI=1 npx expo start --ios --port 8083` (always pick a port ≥ 8083 to avoid the common Metro default range).
**Resolution pattern:** Always `cd` into the Expo app's dir (not monorepo root). Run `lsof -i :8081` and `lsof -i :8082` first; pick a free port explicitly. Never rely on the CLI's interactive port-prompt in a background harness.

### React Navigation state persists across Expo Go bundle reloads — capture screenshots with that in mind

**Seen:** 1x — 2026-04-25
**Category:** simulator-qa
**Example:** After a fresh Expo Go install and bundle rebuild, the app reopened directly to the last-visited route (GitaPreview) instead of Home. Surprising for multi-screen screenshot capture. `xcrun simctl terminate + launch` did NOT clear it — state persistence is inside Expo Go / React Navigation. Workarounds: (a) `xcrun simctl uninstall host.exp.Exponent` + re-install, (b) change initialRouteName temporarily then revert, (c) accept it and ask the user to tap back manually.
**Resolution pattern:** When capturing multi-screen simulator screenshots, don't assume initialRouteName. Plan for cold-start captures explicitly: `simctl uninstall + install` Expo Go between runs, or ask the user to reset manually.

### `osascript` keystroke to Simulator is blocked without Accessibility grant

**Seen:** 1x — 2026-04-25
**Category:** tooling
**Example:** Tried `osascript -e 'tell ... keystroke "d" using {command down}'` to send Cmd+D to dismiss Expo dev menu. System Events blocked it with error 1002 "osascript is not allowed to send keystrokes". Conductor workspaces don't have Accessibility pre-granted.
**Resolution pattern:** Simulator automation toolbox: screenshots (simctl io), deep links (simctl openurl), app lifecycle (simctl terminate/launch/install/uninstall). Not: keystrokes, coordinate taps, UI scripting. When interactive taps are required, ask the human.

### Adding new font weights to App.tsx requires a full Metro `--clear` restart, not HMR

**Seen:** 1x — 2026-04-25
**Category:** simulator-qa
**Example:** Bumped transliteration to `CormorantGaramond_600SemiBold` and added the new import to App.tsx's `useCormorantFonts` call. Hot reload didn't pick up the new font — Metro cached the old font-manifest and the rendered text fell back to system default. Fix: kill Metro and relaunch with `--clear`. Expect two full bundles (~1106 modules each) + an Expo Go terminate/launch before the new weight renders.
**Resolution pattern:** Anytime you edit the `useFonts()` call in App.tsx (new weight, new family, reordering), do NOT rely on HMR. Kill Metro, relaunch with `npx expo start --ios --port <free> --clear`, terminate Expo Go on the sim, then openurl to force a fresh bundle.

### `Bundled Nms … 1 module` means incremental HMR — use module count to tell HMR apart from a full rebundle

**Seen:** 1x — 2026-04-25
**Category:** simulator-qa
**Example:** After deleting `GitaPreviewScreen.tsx` and editing LibraryCard to remove `isPreview`, Metro emitted `Bundled 19ms … 1 module` and the sim crashed with `ReferenceError: Property 'isPreview' doesn't exist`. Metro was hot-swapping one file at a time; the intermediate JS still referenced the variable from before the second edit. The last `Bundled Nms … 1000+ modules` line is the source of truth — module count ≈ total dependency graph means full rebundle.
**Resolution pattern:** Read Metro logs for both duration and module count. Single-digit / low-double-digit module counts are incremental swaps that can be stale during multi-file edits. When renaming or removing identifiers referenced elsewhere, plan to do a `--clear` restart after the last file edit.

### iOS "Open in <OtherApp>?" scheme-picker hijack — launch Expo Go directly instead

**Seen:** 1x — 2026-04-25
**Category:** simulator-qa
**Example:** `xcrun simctl openurl booted exp://…` triggered an iOS system dialog "Open in Maxify?" because another installed app registered for the `exp://` scheme. Neither tap nor `simctl` dismiss works programmatically — user has to reach for the sim window.
**Resolution pattern:** Avoid the scheme picker by launching Expo Go directly with the bundle URL: `xcrun simctl launch <udid> host.exp.Exponent -EXKernelLaunchUrlDefaultsKey "exp://…"`. This hands the URL to Expo Go's built-in handler and skips iOS's scheme registry.

### Maestro requires a Java Runtime — install JDK before first run

**Seen:** 1x — 2026-05-28
**Category:** tooling-setup
**Example:** Installed Maestro via `curl -Ls "https://get.maestro.mobile.dev" | bash` — installer succeeded and added `~/.maestro/bin` to PATH. First `maestro --version` failed with "Unable to locate a Java Runtime." Maestro's binary is a JVM wrapper that needs JDK 8+ at runtime.
**Resolution pattern:** Document this prerequisite in `mobile/.maestro/README.md`. Install Java via `brew install --cask temurin` (free, Adoptium) before installing Maestro. Don't suggest Oracle JDK — Temurin is the standard now.

### Maestro flow assertions must match actual rendered strings, including ASCII-vs-Devanagari digits

**Seen:** 1x — 2026-05-28
**Category:** test-design
**Example:** Sanskar smoke flow originally asserted `"चरण १"` (Devanagari digit). The rendering component uses a JS template literal `` `चरण ${stepNum}` `` which produces ASCII `"चरण 1"`. Test would fail at runtime. Caught by re-reading the component before running.
**Resolution pattern:** Before writing Maestro `assertVisible` strings, grep the rendering component for the exact string it produces. JS template literals with numbers always produce ASCII digits unless explicitly converted via `toLocaleString('hi-IN')`.

### Expo Go from `expo start --go` ships only the latest SDK — pinned SDK 54 projects crash at boot

**Seen:** 1x — 2026-05-28
**Category:** sdk-lifecycle
**Example:** Project pinned to `expo: ~54.0.33`. `expo start --go` auto-installed Expo Go from the CDN, but Expo serves only the latest binary (SDK 55+/56+). The new Hermes runtime removed legacy globals like `require`. Result: bundle delivers cleanly (731ms, 1319 modules) but crashes at boot with `[runtime not ready]: ReferenceError: Property 'require' doesn't exist`. Maestro flow couldn't execute because the app never reached Home. This is environmental, not a code defect.
**Resolution pattern:** For Maestro/simulator verification on pinned-SDK projects: (a) build a local dev client via `eas build --profile development --platform ios --local` (5-10 min build, matches your SDK), (b) sideload the SDK-matched Expo Go archive from Expo's release tarballs if still hosted, or (c) bump the project's Expo SDK to current. Don't rely on `expo start --go` for pinned old-SDK projects.

### RN feature verify bar = tsc + expo lint (0 errors) + jest + expo export (clean bundle); export catches bundle-time issues tsc/jest miss

**Seen:** 1x — 2026-05-29
**Category:** verification
**Example:** NEW-chip feature added a provider to App.tsx's tree. Verified with `tsc --noEmit` (0), `expo lint` (0 errors), `jest` (27/27), and `npx expo export --platform ios --output-dir .expo-verify-out` → "Exported" with a 9.23 MB iOS hbc bundle, confirming Metro resolves the new provider/context at bundle time. Then `rm -rf` the throwaway dir.
**Resolution pattern:** For an Expo/RN feature (no web build), run all four. Use `expo export --output-dir <throwaway>` for a non-interactive bundle smoke (never `expo start` in automation), and clean up the output dir after.

### New test files must mirror the repo's existing test lint conventions or they add fresh warnings

**Seen:** 1x — 2026-05-29
**Category:** lint
**Example:** New jest test files used `require('react').createElement` in a mock factory and placed module imports after `jest.mock(...)`, producing 8 new warnings (`no-require-imports`, `import/first`). The existing SanskarReaderScreen test was warning-free because it uses `import React, * as mockReact from 'react'` (mock-prefixed namespace) and keeps all imports above the mocks (babel-jest still hoists jest.mock).
**Resolution pattern:** Copy the test-file header convention from an existing clean test in the repo: namespace-import React as `mockReact` for factory use, put all imports first, jest.mock blocks after. Re-run lint scoped to your new files to confirm zero added warnings.

### SDK-54 Expo Go boot block was environment-transient — re-attempt Phase 5C; Maestro DID run on-device this round

**Seen:** 1x — 2026-05-29
**Category:** simulator-qa
**Example:** The 2026-05-28 session documented Expo Go (CDN) crashing SDK-54 at boot (`[runtime not ready] require doesn't exist`), blocking Maestro. This session, the same SDK-54 project booted cleanly in Expo Go on the iPhone 17 sim (bundle delivered, app reached Home), and the full Maestro suite ran. Env conditions (Expo Go version / sim) had changed.
**Resolution pattern:** Always RE-ATTEMPT Phase 5C even if a prior run logged an env block — re-check `xcrun simctl list devices booted` + boot the bundle and watch for a crash vs Home. Don't assume the prior block persists.

### A bottom-of-screen dev/test control inside a tab navigator taps THROUGH to the tab bar — center it before tapping

**Seen:** 1x — 2026-05-29
**Category:** maestro
**Example:** A `__DEV__` seed/reset control at the bottom of HomeScreen (inside a bottom-tab navigator) sat over the center "Bhakti" tab. `scrollUntilVisible` stops with the element at the viewport BOTTOM (right above the tab bar), so `tapOn` fell through to the tab → navigated to Daily Verse, and the next control wasn't found. `marginBottom` alone didn't fix it (scroll still stops at viewport bottom). Fix: `centerElement: true` on the scroll (plus enough bottom spacer for scroll room) so the control lands mid-viewport, clear of the tab bar.
**Resolution pattern:** For Maestro taps on controls near the bottom of a tabbed screen, use `scrollUntilVisible … centerElement: true`. Also: `assertVisible` does NOT scroll — for list items below the fold use `scrollUntilVisible` to bring each into view before asserting.


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


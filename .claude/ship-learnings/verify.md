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

**Seen:** 1x — 2026-04-22
**Category:** tooling
**Example:** Ran `npx expo start --ios` from repo root → ConfigError (no package.json at root) and port conflict with another running Metro (CreditScore's). Fix: `cd mobile && CI=1 npx expo start --ios --port 8082`. `CI=1` suppresses interactive port-change prompt.
**Resolution pattern:** Always `cd` into the Expo app's dir (not monorepo root). If 8081 is in use, set `--port 8082` + `CI=1` for non-interactive sessions.


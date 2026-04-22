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


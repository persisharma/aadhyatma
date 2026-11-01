# Saved verses: automatic source filters

Base: `3a6e4c6ee6fe8aeee453448a2937f72c92b594e8` (main).
Branch: `codex/saved-verses-source-filters`.

## Behavior

Settings → संग्रह / Saved Verses shows All and canonical scripture filters with live counts when at least two sources are saved. Filtering preserves stored order and `buildBookmarkTarget` navigation. Aliased aartis group under their canonical identity. No bookmark schema/storage change, added content, artwork or network request.

Selection is session-only, retained through a reader visit and recreation of Settings. Hydration finishes before invalidating it. Removing the final save for a selected source, or reducing to one source, immediately falls back to All. App restart begins on All. The heart/remove action is now a sibling of the opening action, making confirmation independently accessible. Existing verse/source labels and reader targets are preserved.

## Evidence

- PASS: 16 focused Jest integration tests using the real BookmarksProvider, language/theme/font providers, in-memory AsyncStorage adapter and real route builder. Covers 30 mixed saves/order/exact older Gita target, filter retention/remount, cancellation/confirmation/persisted removal/counts, external reader removal, one/zero sources, legacy aarti hydration, unknown sources, loading and four-language script/font selection with Large reading preference.
- PASS: TypeScript check; targeted ESLint; `git diff --check`; revised Maestro flow parses with js-yaml.
- PASS: full mobile verification groups on implementation tree `0c1653475bb989e354670c27f017993deec428c9` (remote commit `e12ce633fe8660abe7f35ba5721adf4f7fbbccb1`): `npm run typecheck`, `npm run test:readers` (316 suites / 2,987 tests), plus all `test:widgets`, `test:engine`, `test:data` and `test:ask` commands. The stock `npm test` launcher fails at the widgets tsx CLI IPC socket with environment `EPERM`; each package.json tsx test group was run with `node --import tsx --test` instead. Repository scripts/dependencies are unchanged. A direct shell invocation initially could not resolve `tsc`; the actual `npm run typecheck` was separately rerun and passed.
- FAIL (existing baseline): full `npm run lint` reports 5 errors / 427 warnings. Errors are `react/display-name` in unchanged `DailyBhaktiNudge.test.tsx` and `OnboardingSetupSheet.test.tsx`, plus three missing JSX keys in unchanged `ReaderActionTargets.test.tsx`. All three files match main. Targeted lint for both changed TypeScript files passes with no errors or warnings. These unrelated files were not modified.
- Remote durability: [PR #583](https://github.com/persisharma/aadhyatma/pull/583), branch `codex/saved-verses-source-filters`; implementation head `e12ce633fe8660abe7f35ba5721adf4f7fbbccb1` was verified through the remote branch-ref endpoint. Its tree exactly equals the locally tested implementation tree above. The evidence-only follow-up does not change app code. PR was conflict-free when inspected. GitHub Actions remains in progress.
- PENDING: native Maestro execution and visual review on iOS/Android at Standard/Large, compact viewport and enlarged system text; native screen-reader focus/announcements; offline installed-device journey. Maestro, adb and xcrun are unavailable here. Unrestricted chip scaling/wrapping and independent pressable semantics are structurally tested, not proof of native appearance.
- PENDING: proposed usability target (5/6 participants find an older Gita save within 15 seconds in 30 mixed saves). No participant test or measured frustration is claimed.

All eight open PR file lists were inspected at the start: #575, #564, #553, #526, #411, #398, #81, #73. None changes WishlistScreen or BookmarksContext. Counts derive from bookmarks and source labels from the existing library; future registered scriptures need no new filter mapping. This change adds no imports to the eager launch graph.

The PR stays draft while required native/verification evidence is outstanding. No build, release, version bump or OTA publication is part of this task.

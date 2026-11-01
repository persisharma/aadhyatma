# Saved verses: automatic source filters

Base: `3a6e4c6ee6fe8aeee453448a2937f72c92b594e8` (main).
Branch: `codex/saved-verses-source-filters`.

## Behavior

Settings → संग्रह / Saved Verses shows All and canonical scripture filters with live counts when at least two sources are saved. Filtering preserves stored order and `buildBookmarkTarget` navigation. Aliased aartis group under their canonical identity. No bookmark schema/storage change, added content, artwork or network request.

Selection is session-only, retained through a reader visit and recreation of Settings. Hydration finishes before invalidating it. Removing the final save for a selected source, or reducing to one source, immediately falls back to All. App restart begins on All. The heart/remove action is now a sibling of the opening action, making confirmation independently accessible. Existing verse/source labels and reader targets are preserved.

## Evidence

- PASS: 16 focused Jest integration tests using the real BookmarksProvider, language/theme/font providers, in-memory AsyncStorage adapter and real route builder. Covers 30 mixed saves/order/exact older Gita target, filter retention/remount, cancellation/confirmation/persisted removal/counts, external reader removal, one/zero sources, legacy aarti hydration, unknown sources, loading and four-language script/font selection with Large reading preference.
- PASS: TypeScript check; targeted ESLint; `git diff --check`; revised Maestro flow parses with js-yaml.
- Full mobile checks: running; results will be recorded in the PR. The stock `npm test` launcher reaches `test:widgets` and fails with an environment `EPERM` on the tsx CLI IPC socket. Equivalent tsx tests are invoked with `node --import tsx --test`; repository scripts/dependencies are unchanged.
- PENDING: native Maestro execution and visual review on iOS/Android at Standard/Large, compact viewport and enlarged system text; native screen-reader focus/announcements; offline installed-device journey. Maestro, adb and xcrun are unavailable here. Unrestricted chip scaling/wrapping and independent pressable semantics are structurally tested, not proof of native appearance.
- PENDING: proposed usability target (5/6 participants find an older Gita save within 15 seconds in 30 mixed saves). No participant test or measured frustration is claimed.

All eight open PR file lists were inspected at the start: #575, #564, #553, #526, #411, #398, #81, #73. None changes WishlistScreen or BookmarksContext. Counts derive from bookmarks and source labels from the existing library; future registered scriptures need no new filter mapping. This change adds no imports to the eager launch graph.

The PR stays draft while required native/verification evidence is outstanding. No build, release, version bump or OTA publication is part of this task.

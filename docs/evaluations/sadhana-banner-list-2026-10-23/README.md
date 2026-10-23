# Internal Sadhana banner + list

PR #524 was opened before validation as requested. Source was restored on current main after automated workspace maintenance removed the original unpublished checkout. Earlier test counts and screenshots are not evidence for this reconstructed change.

## Scope

RoutineToday banner, visible daily readings and shared Sankalp unit rows only. HomeScreen, RoutineBanner, enrollment/progress schemas, reading routing and bundled icon registries remain unchanged. Existing published reader artwork is fetched via R2/CachedArtwork; no upload or app release is required.

## Validation

- Targeted Jest: 4 suites / 28 tests passed, including row action separation, manual undo, disabled derived completion, four scripts, empty creation, deity manifest coverage, Sankalp preview/commit and routine completion.
- TypeScript passed. Focused ESLint passed without errors or warnings.
- All 21 deity artwork SHA-256 prefixes match the published R2 reader-illustration manifest. Both Maestro YAML flows parse.
- Full-source artwork contact sheet inspected. Reviewed portrait centres are explicit; preserve the full Navagraha composition. Banner shows the complete original painting, with text below.
- Routine and weekday Maestro selectors updated to visible rows and banner; native execution remains pending.

## Pending before merge

Native device Standard/Large typography, narrow-screen layout, screen-reader controls, full-page visual review, R2 network hydration and warm-cache/offline replay. This host has no Maestro, iOS simulator or Android emulator. Unit tests mock image delivery and do not prove CDN hydration. Full aggregate npm test is pending; targeted tests are the evidence listed above.

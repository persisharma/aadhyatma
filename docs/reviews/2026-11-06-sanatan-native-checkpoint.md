# Sanatan native checkpoint — 6 November 2026

Application source: 62af7ebf11ca8232c325e45b4a29ba7623ddff37. PR #624 remains draft. No merge or release.

## Executed
- CI 42178480420 PASS: TypeScript, 350 suites / 3,452 reader/component tests, engine 630, data 223, observance checks and both production exports/asset gates.
- Android Release compiled in 13m 5s, installed and launched on API 34 at 320×568 logical pixels. APK SHA-256: 9c855093ecdfe1bece7f73bd859c661beeab20ef3dd01c93f6092e40a0d39f2b. Source receipt is exactly 62af7eb.
- Run 42178480200 Android: Home/search → thirty-three lesson → save → page 2 → Rudras expansion → plain source credits/no URLs → Back/query retention passed. Cold restart reached the hub, but direct resume lookup failed below the compact fold. Native UI acceptance did not pass.
- iOS native host/extension compiled, installed and launched. Current JS uses the verified simulator SDK with receipts and unchanged native executable/framework hashes. XCTest driver passed. Runs reached English search, collection introductions and reader openings; Home/reader scrolling assertions failed. No full native visual acceptance.
- Independent phases: iOS 42182217409 and Android 42182363513. Android phases failed their automation; iOS phases still need final reconciliation at this checkpoint. Previous independent iOS run 42179682918 failed. These results are not counted as acceptance.

## Evidence retained
- Current-source native artifacts: run 42178480200, iOS artifact 13485212684 and Android artifact 13485024126. Android artifact includes the usable APK; screenshots/JUnit/driver diagnostics are preserved.
- Local execution environment became unavailable during the task. Native GitHub runners remained available.
- Automatic approval review rejected broad artifact/log/hierarchy/screenshot export into additional workflow logs due to possible sensitive data. A materially safer approved diagnostic workflow emits only allowlisted public app control IDs, status/timing, numeric bounds and APK hashes. Future QA workflows no longer export screenshots to logs. No screenshots from that rejected export route were used as visual acceptance.

## Known test correction prepared in this branch
- LanguagePickerSheet closes on selection (source verified). The regional-search driver incorrectly tapped Done afterwards; remove that tap.
- The original compact Android cold-resume step did not scroll to its target. Add a bounded native scroll/centering step before tapping; retain the exact 2/3 persistence assertion.
- These corrections are preserved but have not been rerun in this branch. No production app code changed here.

## Pending before acceptance
- Inspect actual native Home/hub/collection/reader/diagram screenshots; compare the approved hierarchy and painting family.
- Reconcile and repair scroll-driver failures before calling any complete script/size/platform matrix passed. Do not copy the later lower-viewport gesture experiment into production acceptance unreviewed: it regressed previously passing Android search navigation.
- Native artifact geometry shows the hub's lower usable viewport differs from the full display. Comparable prose readers explicitly own top/left/right safe areas; Sanatan currently uses default edges. Confirm viewport/safe-area ownership from the native screen before a production layout change.
- Gujarati/Kannada displayed-name search has unit coverage but no completed native regional-search pass.
- Native audio/playback, actual branded share export/handoff and independent editorial acceptance remain pending.
- Keep PR #624 draft. Approval or restored local execution is needed for screenshot inspection; structural tests and successful native compilation are not visual approval.

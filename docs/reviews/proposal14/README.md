# Muhurat Finder and Abujh India-midnight rollover fix

Base: `6f97ae4c3d5916552421eade72f628bd49ee7503`. Isolated branch: `codex/proposal14-india-scan-date`.

## Scope and reference

Panchang → Muhurat Finder → results and Panchang → Special auspicious days use India civil today. Picker warm-up and rolling cache warm-up agree. The existing `useCivilToday` hook handles IST midnight and foreground refresh. Results are keyed by date and scan inputs; the old list is hidden during render before cleanup, and obsolete progressive/final callbacks cannot publish.

Horizon, location, calendar, direction, ranking, Back/detail routing, idle work, cancellation and absolute-date cache keys remain. Valid overnight window instants within scanned days are not filtered or shortened. Finder additionally checks yesterday once for windows that cross today's IST midnight and have not ended. Only those original windows carry over, with unchanged endpoints and tier. They expire by a bounded timer or foreground refresh without rescanning or extending the upcoming horizon. Abujh entries are day labels with no timed-window payload, so expired prior-day entries leave that list. Daily Panchang's separate pre-dawn carry-over behavior is unchanged. No astrology rule, backend, reminder or release changes.

Approved reference: Library `libfile_924af9318ed4819180c8872bc5d054bd`, `vedansh-proposal-14-muhurat.png`, SHA-256 `48455558b892db95aa554b04bd6bdda7cce522769ba3c25aff7004c1c421ea59`, 330233 bytes. Materialized using current Library flow, metadata applied, readability checked and image viewed. Illustrative dates only.

Open PRs checked before editing: no finder-date fix identified; #703 is already in main and its shared civil clock is reused. #720 already addresses the unrelated tour-version mismatch found below.

## Checks

| Check | Result | Evidence |
|---|---|---|
| U1/U2 source and scope | PASS | Current main, root instructions, checklist, RULEBOOK §17, design §60, Panchang wiki, PRD-16 and approved reference inspected. |
| U3 actual native design | PENDING | No installed app or simulator available. Proposed preview is not native evidence. |
| U4 language/size | PARTIAL | Four localized copy/font/unclamped scaling assertions pass. Native hi/en/gu/kn × Standard/Large, compact width and enlarged system text remain pending. |
| U5 journey | PARTIAL | Existing finder and personal-strip screen suites pass (routing included); native journey pending. |
| U6 lifecycle/cancellation | PASS at hook level | Matrix below, stale hydration/progressive results, warm-up cancellation and listener cleanup. |
| U7 artwork/content | N/A | No app artwork/content publication changes. |
| U8 related callers | PASS | Picker and rolling warm-up audited; TodayStrip already uses useCivilToday; TodayRecommendations accepts its caller's date label. Shared startOfToday semantics unchanged. |
| U9 tests/native | PARTIAL | Results below; inherited full-gate failure and native pending. |
| U10 performance/data | PARTIAL | Existing horizon, chunks, idle scheduling and cache preserved. Native tap/ANR profiling pending. |
| U11 integration/docs | PASS locally | Current main base; design/rulebook/wiki and smoke flow updated. Remote branch/PR and CI pending approval. |
| U12 preservation | LOCAL PASS / GITHUB PENDING | Source, tests and preview committed locally; GitHub blob approval pending after Git CLI authentication failed. No branch/PR confirmed. No cleanup. |

Applicable: C5 calendar/timezone and C9 accessibility. C1–4, C6–8 and C10 N/A: no reader, artwork publication, export flow, reminder, launch, audio or release behavior changed.

### Target matrix

Run `muhuratCivilScan.jest.test.tsx` in three separate processes with `TZ=Asia/Kolkata`, `TZ=America/Los_Angeles`, `TZ=Asia/Tokyo`.

Each process passes 14 tests: **8 target cases = two list hooks × fresh 00:30 IST launch / open midnight / foreground after midnight / same-day return**, plus current-day overnight windows, obsolete Abujh progress, picker warm-up cancellation, and three prior-sunrise carry-over/expiry cases. **24/24 target hook cases pass, 0 stale lists.** These exercise real civil-clock hooks/AppState with mocked solver/storage boundaries, not native devices. The final matrix uses 18 December 2026 18:29:59/18:30:01 UTC: Tokyo is already 19 December before the boundary and Los Angeles remains 18 December after it. Four rollover cases fail against an unchanged-main hook copy, then pass with the fix. Temporary baseline copies were removed.

### Repository gates

- TypeScript: PASS.
- Widget tests: 51/51 PASS.
- Engine tests: 878/878 PASS.
- Data/content/navigation/cache-budget tests: 265/265 PASS.
- Ask: 49/49 PASS.
- Reader shard 1: 147 suites pass, 1 inherited failure; 1631 tests pass, 1 fails. `tourContent.jest.test.ts` expects APP_TOUR_VERSION 1.5.8 but main contains 1.5.6. No unrelated version fix included.
- Reader shard 2: initially five failures in one obsolete fixture; updated `MuhuratPersonalStrip` fixture, targeted rerun 7/7 PASS. Other 147 suites / 1770 tests passed in the full shard run.
- Reader shard 3: 148 suites / 1568 tests PASS.
- Added four-language scan-label suite: 4/4 PASS.
- Final focused India screen/cache/lifecycle run: 6 suites / 44 tests PASS. Final Los Angeles and Tokyo hook runs: 14/14 each PASS.
- Repository instruction policy: PASS.
- Original `npm test` stops at the tsx CLI's optional Unix socket (EPERM). The same configured widget/engine/data/Ask file lists were executed with `node --import tsx --test`, preserving all assertions. All reader shards were executed independently so the inherited failure did not hide later results.
- No adb, Maestro or xcrun is installed. Native E2E is PENDING; `mobile/.maestro/muhurat-finder-smoke.yaml` now asserts the date line on both lists.

Cache audit: persisted retention is two device-local past days; current India scan keys remain within that range across the supported zones. No persistence schema, scope or eviction change.

## Visual

[Proposed preview](proposed-preview.png) and [HTML reconstruction](proposed-preview.html). PNG inspected; both plainly label illustrative dates and pending native verification. The preview is manually reconstructed from the implemented date-line placement and existing card grammar, not a screenshot of the app. Chromium rendering was unavailable because the executor blocks its Unix socket; the PNG was rendered locally.

Preview Library: `libfile_c11b4d29cb2c8191a721355543dc8639` (78091 bytes).

## Remaining before readiness

Run the native finder smoke on an authorized iOS/Android install, both entry routes and Back, the 24 native lifecycle cases, four languages, Standard/Large, compact and enlarged system text, VoiceOver/TalkBack and cold-cache responsiveness. Resolve inherited main gate separately and inspect CI on the final remote head.

Keep draft. No merge, deploy, auto-merge, OTA or verified-release claim.

## Separate follow-up finding

The adjacent daily Muhurat hook uses fixed DAY_MS arithmetic on civil date labels in neededDateKeys/composeSolved. Los Angeles fall-back can repeat the same date key (1 November 2026 midnight +24h is still 1 November). Consider dayAt calendar stepping in a separate scoped fix. No change made here; native behavior remains unverified.

## Prior-session preservation history

Git CLI push failed because this executor has no GitHub HTTPS credentials. Connected GitHub create_blob requested approval (card reference patient-haze-81641451); its result is unconfirmed after the tool runtime was replaced. No branch update or PR creation was attempted through that tool. Automatic review initially rejected the shell push as an unverified destination; after verified room authorization and origin inspection, the retry was permitted but failed authentication. Do not bypass the pending connector approval. Preserve this checkout and apply the final binary patch if another executor resumes.

## Separate implementation session — 21 November 2026

The saved implementation at `c526a906fa65b90ce9d46e8c283d75dcbf4a81a0` was preserved and reused in a separate checkout. Remote main was verified as `6f97ae4c3d5916552421eade72f628bd49ee7503`, already an ancestor of this fix; no rebase or source changes were needed. No existing branch or PR for `codex/proposal14-india-scan-date`, and no open Muhurat PR, was found. This is an implemented bug-fix PR; the Proposal 14 directory retains its historical reference name.

Fresh verification: focused India run passed 5 suites / 41 tests (civil lifecycle, cache warm-up, localized scan label, Finder screens and personal strip). Los Angeles and Tokyo lifecycle runs each passed 14/14 tests. Full-suite totals above are preserved prior-session evidence, not a claim of a fresh full-suite run. Native Maestro, iOS/Android visuals, four-language Standard/Large/compact/system-text coverage and device responsiveness remain PENDING because this environment has no Maestro, adb or xcrun. The illustrative preview remains non-native evidence. Adjacent daily-Muhurat DST is out of scope.

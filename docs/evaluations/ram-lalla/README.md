# Ram Lalla Ayodhya sharing cards

Requested behaviour: add the real Ayodhya Ram Lalla photograph to the Daily Bhakti sharing-card collection.

Base: `57f80588fe33257c39e8176fedb85c0daf99e9ba`. Branch: `codex/ram-lalla-daily-cards`.

## Reachability and integration

Bhakti tab → Suvichar card → Devotional cards, or Create your own → **राम लला · अयोध्या / Ram Lalla · Ayodhya**. The new option supports all three frames, Thursday cards, editable message/sender, saved favorites and the existing branded 1080px provider flow. Shri Ram/Ram Darbar and their default frames remain stable.

The real PMO photograph uses one 960×1619 JPEG (663,352 bytes) from the byte-verified public Wikimedia delivery URL. Its source, author, licence and exact SHA-256 are preserved in `mobile/assets/suvichar/photos/sources.json`; the delivery file is committed alongside it. There is no generated replacement or bundled photo. Its legal credit is printed on the measured capture surface. The photograph is top-aligned with preserved source aspect; the complete crown/face are visible. Only the existing Rama masters' paper/footer slices are reused, without their painted hero. All three current R2 objects were downloaded with curl and their full bytes verified against manifest hashes:

| Frame | Bytes | SHA-256 prefix |
| --- | ---: | --- |
| Temple arch | 662254 | 966c1cacb831712a |
| Lotus garden | 520720 | 60a0bc955f8ab9eb |
| Devotional letter | 506722 | 975ed4d6e20152b3 |

The shared persistent cache deduplicates the photo across frames/thumbnails, bounds concurrent downloads to two, times them out and cancels abandoned subscriptions. Cold offline use refuses incomplete capture; already-cached art is reusable offline. Photo decode joins the existing art/brand/sender-photo/layout gate. Subject/frame and URL identity reject stale images/readiness. First use depends on Wikimedia plus the existing R2 host; no new unpublished R2 object is activated.

The Ram sourced family, six explicit Ram originals and eligible Ram/Hari dohas supply messages. VD-0029 remains excluded because it explicitly names Ram Darbar. No text, source ID or saved-card format is rewritten.

## Acceptance evidence

| Check | Result | Evidence / remaining work |
| --- | --- | --- |
| U1 Current scope | PASS | Current main, instructions, share/Suvichar wiki and open PRs inspected; no overlapping photo work |
| U2 Criteria | PASS | Separate actual-photo option; three frames; existing routes, messages, defaults and saved cards preserved |
| U3 Visual fidelity | PENDING | Actual component reviewed through React Native Web; installed iOS/Android comparison required |
| U4 Languages/sizes | PENDING | 24 browser cells: hi/en/gu/kn × 320/540dp × three frames; native Standard/Large and enlarged system text pending |
| U5 Journeys | PENDING | Screen/provider/favorite integration tests pass; Maestro route/Back/restore flow authored, device execution pending |
| U6 Failure/lifecycle | PENDING | Cache ownership and decode failure gates tested; actual offline/retry/background device paths pending |
| U7 Assets/content | PASS | Photo/public source hash verified; source bytes/rights ledger committed; three paper masters' public full hashes verified; source-scoped messages |
| U8 Related surfaces | PASS | Ready-made/custom, frame/deity thumbnails, Thursday, favorites, provider mount and source eligibility covered |
| U9 Automated/native | PENDING | Focused and full mobile checks recorded below; native export/handoff/E2E remains pending |
| U10 Performance/data | PENDING | One bounded 1.55-megapixel photo, shared persistent cache, no startup binary import/new timer/loop; lower-configuration Android release/ANR and iOS hang evidence pending |
| U11 Integration/docs | PASS | Against current main; design/RULEBOOK/wiki updated; final CI tracked in draft PR |
| U12 Preservation | PENDING | Final commit/remote tree recorded in PR after upload; required files include photo, ledger, scripts, tests, flow and review evidence |

C1/C3/C4/C7/C9 apply. C2/C5/C6/C8/C10 N/A: no story, calendar engine, reminder/consent, playback or release changes. U3/U4/U5/U6/U9/U10 remain pending until native acceptance; keep the PR draft.

## Validation

- New regression was run before implementation: 25 failures, including absent catalogue option and missing photo capture surface.
- Focused share/content/screen suites: 160 tests passed before the final stable-frame regression was added; subsequent/full final results belong in the PR.
- TypeScript passed. `npm test` reached the widget runner but its tsx CLI failed to create a Unix IPC pipe (`EPERM /tmp/tsx-0/...pipe`). The same widget, engine, data and Ask file lists were executed with `node --import tsx --test`; all four gates exited 0, without changing test assertions or repository commands.
- The first reader run exposed an unapplied dependency patch because dependencies installed before the sparse checkout included `mobile/patches`. Running the repository's `patch-package` applied both patches; the focused installed-expo-speech guard then passed (2 tests). Full reader shards were rerun; record their final result in the PR.
- `verify-agent-instructions.mjs`, `git diff --check` and Maestro YAML parsing passed. Maestro, adb and xcrun are absent here; written YAML is not executed E2E.
- `browser-matrix.json`: all 24 component cells passed, all images decoded, no root horizontal overflow and no page errors. Three JPEGs are browser component screenshots, **not** native PNG exports or device acceptance.
- No native build, version bump, merge, store publication or OTA was performed.

## Reproduce component review

Install temporary preview-only packages outside the app:

```sh
npm install --prefix /tmp/ram-lalla-preview react-native-web@0.21.0 react-dom@19.1.0 playwright@1.56.1
node /tmp/ram-lalla-preview/node_modules/playwright/cli.js install chromium-headless-shell
export RAM_LALLA_PREVIEW_DEPS=/tmp/ram-lalla-preview/node_modules
node docs/evaluations/ram-lalla/preview.mjs
node docs/evaluations/ram-lalla/verify-preview.mjs
```

The harness renders the production SuvicharCard with the production fonts/tokens and preserved photo/frame bytes. Only cache transport and reading-size context are adapted; capture typography is fixed by contract. Request interception avoids an HTTP listener. It does not exercise the native cache or platform handoff.

Remaining: execute `suvichar-ram-lalla.yaml` on installed iOS/Android; check complete 1080px capture and WhatsApp/Instagram handoff without sending; native four-language/Standard/Large/compact/enlarged-text, offline/retry/Back/lifecycle checks; representative Android release profiling/ANR logs and iOS responsiveness. No acceptance claim is inferred from absence of reported crashes.

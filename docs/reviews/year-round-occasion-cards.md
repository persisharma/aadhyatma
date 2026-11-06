# Year-round occasion share cards

Base: main `354c87f0f29f49369886e6bb6c7873fa988b4677` (published timing audit #629).
Branch: `codex/year-round-occasion-cards`.

## Scope and acceptance

Every one of the app catalog's 197 distinct observance IDs has an individual native share-card path, preserving IDs, date rules, regional lenses, calendar system, names and catalog guidance. This is catalog coverage, not a claim to cover every local Hindu tradition or to compute a special muhurat for every observance. The existing 53 timing profiles remain separately audited: 49 recipes produce clocks; four Ghatasthapana profiles provide tradition guidance. The remaining identities show their actual catalog description without inventing a clock. Holi and Holika Dahan, and Maha Navami and Ayudha Puja, retain separate ceremony/date identities.

Approved visual: Card 1, festive hero. A single title, large text-free painting, live timing plaque, floral corners, Vedansh wordmark, date/place and download footer. The hero artwork is never a baked screenshot or hardcoded clock. Longer notes and all five Maha Shivaratri windows increase export height; both next-day endpoint dates remain visible. Catalog-only entries do not print today's date as an occasion date.

Entry points: Panchang below the festival ribbon; Muhurat detail; Vrat/Parv detail. Each row shares only that named occasion through the existing share provider (four card languages, image/text and OS handoff). The compact full Panchang keeps its existing 16 Choghadiya starts, Kaal, Vaas and footer, with the small occasion strip. Unsupported special timing is not described as a local clock needing confirmation.

## Artwork and publication

Ten new text-free scenes are preserved in `mobile/assets/festival-hero/`, with full SHA-256/dimensions and prompts in `festival-hero/`. Govardhan's hill rests on the raised left little finger. Other catalog entries reuse complete existing deity/ritual paintings, not face-only thumbnails. Explicit known identities prevent unknown named deities from silently becoming an unrelated painting.

New heavy paintings use the `festival-hero` R2 prefix; they are not required into the native bundle. `festivalHeroManifest.json` remains `pending` until the publisher downloads every production CDN object and verifies its full source hash. The publication workflow emits a verified manifest and proof as artifacts; it cannot change the app manifest automatically. Never treat an upload dry-run as publication. Capture waits for actual image decode; errors cannot unlock a blank export.

## Evidence

Local implementation tree: `cbf584904cac9992435ea5db3d58b746a897ae8c` (remote checkpoint `13c6864954a7aaf4cc23240782f03e46d61ca27c`), with subsequent test/evidence-only changes included in the final PR head.

| Gate | Result | Evidence |
| --- | --- | --- |
| Scope / closed inventory | PASS | All 197 catalog IDs have profiles and known artwork subjects; additions require an explicit fixture update. |
| Whole-year date coverage | PASS | All 366 resolved 2026 occurrence records in each of Purnimant and Amanta; every month represented; five tests include ceremony-date regressions. This proves catalog wiring, not a new source audit of every tradition. |
| Engine / verified clocks | PASS | 772 tests, including all 137 timing assertions and the 115 existing Drik fixtures. |
| TypeScript / widgets / Ask | PASS | Typecheck; 46 widget and 49 Ask tests. |
| New card/provider tests | PASS | Four scripts, individual row share payloads, undated catalog cards, source hashes, stale identity and decode readiness. Native rendering remains separate. |
| Full reader suite | FAIL: existing main expectations | All three unmodified package shards executed: 3487 assertions, 3484 pass, three failures in dailyBhaktiShare, DeityIcon and RoutineTodayVisual. The unchanged-main expectation drift is recorded in the earlier audit. |
| Full data suite | FAIL: existing main expectations | 223 assertions, 220 pass; three dohaScopes failures (92 vs 84, 19 vs 18, missing thought). New text-free art manifest is routed alongside existing non-scripture asset manifests; its source hashes have their own gate. |
| Artwork source / durability | PASS | Ten WebP masters with full hashes and prompt ledger committed remotely; final Govardhan revision inspected. |
| Public CDN integration | BLOCKED | Run 42209628916, job 127864761920: missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY. Upload failed and activation was withheld. Add the repository R2 secrets, rerun publication, inspect all public hashes, and commit the emitted verified manifest/proof. |
| Installed native size/language/export matrix | PENDING | Push-triggered macOS Release run. Stable Xcode 16.4 selection passed. No native success or visual parity is claimed; inspect actual screens/PNGs before readiness. |
| Actual Android / physical devices | PENDING | No successful installed-app run available in this environment. |
| Startup / source validity | PASS | Launch import graph and byte budget, instruction routing and whitespace gates. Share-only hero renderer loads on demand. |
| Merge / OTA / store release | N/A | No merge, EAS, TestFlight, store or OTA publication requested/performed. |

The existing main failures are not bypassed or weakened. Required pending/failed checks keep this PR draft. The new scene-dependent exports wait for verified publication and decoded artwork rather than sharing a blank painting.

## Date distinctions checked

Drik's 2026 Hindu calendar lists Holika Dahan on 3 March and Holi on 4 March: https://www.drikpanchang.com/calendars/hindu/hinducalendar.html . Maha Navami is 19 October: https://www.drikpanchang.com/navratri/durga-puja/maha-navami-date-time.html . The source-backed clock/withholding ledger remains `festival-muhurat-audit.md`, with primary URL per fixture.

## Release gates

Keep the PR draft until mandatory native visual, CDN and final CI gates are satisfied. Source code and mock tests do not establish installed-app fidelity or a successful exported image.

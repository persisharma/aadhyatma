# A3 — Santoshi Mata Chalisa

## Scope and authorization

Final base b748ff2e3b8887f0f9bcd6e87b848221d8e0db97 (A1 #693 and its UTF-8 preview correction #694 merged). Original base was 199e05b3 (A2). Only `santoshi-mata-chalisa`, category `chalisa`, deity `durga`, addedInVersion 1.5.7. No new artwork/audio, release, merge or A4.

On 2026-11-16 the owner instructed “resolve as before” after the missing checklist and source variants were reported. Applied the A2 approach: current AGENTS/build checklist/RULEBOOK/design and the merged Chalisa pattern substitute for unavailable `competitor-analysis/2026-10-19/claude-code-plan.md` §4a. A single complete Drik edition is retained, with alternate readings documented. This is not a claim of a majority or a mixture of compositions.

## Sources and collation

- Drik Panchang: https://www.drikpanchang.com/lyrics/chalisa/santoshi-mata/santoshi-mata-chalisa.html?lang=hi — full prayer read via web retrieval; direct HTTP 403.
- Ved Puran: https://vedpuran.net/wp-content/uploads/2021/05/santoshi-maa-chalisa.pdf — HTTP 200, two-page complete prayer read. Extraction has font/OCR artifacts; do not transplant these into the chosen text.

Both have the required Ganapati/Sharada opening, 40 chaupais in the same order and the same closing-doha identity. They are separate publications, not proof of independent manuscript lineages. No source with the different बन्दौं सन्तोषी चरण opening is included. Search results for further editions were not counted as fully read sources.

| Body unit | Drik retained | Ved Puran comparison |
| --- | --- | --- |
| 3–4 | माता-पिता / को छवि | मात-पिता / की छवि |
| 10 | भक्त की | भक्त का |
| 12 | गिरजा | गिरिजा |
| 13 | प्रगटी जन जानी | प्रकट जग जानी |
| 16 | पुरनान / भक्तन | पुरानन / भक्त |
| 20–21 | तुमहीं / नित / लावे | तुम्ही / निज / लावें |
| 22 | मनोकमना | मनोकामना |
| 32 | गोदी | गोद |
| 34 | सात शुक्र | सोलह शुक्र |
| 38–39 | जो कोई / नित / तुम्हारा | जो यह / निज / तुहारा |

The shared obscure व्याकुलयारी in body 25 is preserved. Its editorial meaning conveys the clear theme of separation and distress without inventing a word-level correction. Typographic spelling, grammar and punctuation remain those of Drik, including पुरनान and निश वास. All other units align in identity and sequence, with spelling/inflection differences. No copied modern explanations: Hindi/English meanings and pronunciation-based ASCII romanization are editorial. Benefits are expressed as the hymn's devotional claims, not guaranteed outcomes. The seven-Friday line is not presented as a universal vrat instruction.

Entire chosen text digest: `99e9fa421fbe8891cacefd956c4a9a2e93fd47e80678e09fe6239ca5eb7115aa` (SHA-256 of each unit's lines joined with spaces, units joined by newline). Tests pin all 42 units, sequence, count, variant and metadata; they do not replace editorial verification.

## Integration

Append-only IDs, registry, catalog, search, routes and generated counts. Existing Durga background and first-page illustration; no new asset manifest or publication. Shared reader production code is unchanged. Source metadata is internal only. Opening/closing dispatch and Back tested for hi/en/gu/kn, with route tests for listing/resume/bookmarks and verse-search coverage.

## Acceptance evidence

U1/U2: PASS — current source, owner decision, A3-only scope and acceptance defined. No overlapping Santoshi PR found.
U3/U4: PENDING native — actual-component web preview is separate evidence; four languages, Standard/Large, compact/system text on devices remain required.
U5/U6: unit route/reader evidence plus native saved-state/cold-start, cancellation/lifecycle/offline checks pending.
U7/C1/C3: sourced complete payload and existing Durga mapping; native artwork visibility pending.
U8: existing A2/Lakshmi/Surya reader patterns inspected; no shared UI change.
U9: test results below; Maestro on both platforms pending.
U10/U10.1: bounded 42-unit corpus; generated counts preserve launch-path discipline and stable IDs. Release-mode lower-end Android responsiveness/ANR evidence pending; no performance claim from tests.
U11/U12: final rebase, checkpoint and PR verification to be recorded.
C4/C7/C8/C9: existing exports, saved routes, playback, accessibility reused; device execution pending. C2/C5/C6/C10 N/A: no stories/calendar/reminders/release.

Native matrix: hi/en/gu/kn × Standard/Large × iOS/Android all PENDING. This Linux host has no Maestro, adb or iOS simulator. Run the extended chalisa-smoke flow and check first/longest/closing pages, fresh/saved entry, Back, offline, share exports, read-aloud and lifecycle before readiness. No native builds or OTA initiated.

## Executed validation

- PASS: TypeScript; widget tests 51/51; engine 842/842; data 242/242; Ask 49/49.
- Reader shard 1: 136 suites/1,449 tests pass; six failures in YouTubeReadyPlayback. All six reproduce on unchanged 199e05b3. Neither that test nor its production player is changed by A3 or the subsequent A1 merges.
- Reader shard 2: 137 suites/1,559 tests pass. Shard 3: 137 suites/1,405 tests pass. The real ChalisaReaderScreen suite, including A3's eight hi/en/gu/kn opening/closing/Back cases, passes.
- PASS lint: 0 errors, 480 warnings. PASS git diff --check. These are not an all-green full-suite claim.
- The npm test wrapper fails on the environment's blocked tsx CLI IPC socket. Executed every independent group with node --import tsx for tsx tests and normal Jest commands. An initial duplicated legacy-aarti assertion introduced while copying tests was corrected; all existing migration assertions are preserved and the data suite rerun passes.
- The first test run overlapping a rebase was invalidated and discarded. Complete groups above were rerun after A1 conflict resolution on tree 9fdc4367fe8305fb23654e42a269cae1b02142be. The later main update changes only A1's preview encoding; A3 runtime/test files are unchanged by that rebase.
- PASS actual-component web bundle build. PENDING visual inspection: system Chromium aborts with socket EPERM; the available desktop browser cannot reach the isolated preview server and blocks local-file navigation. The bundled Playwright browser is absent; installation returned an invalid ZIP. No screenshot was fabricated and no browser restriction was bypassed.
- Added the existing A1 capture harness adapted to A3 (four languages, Standard/Large, pages 0/25/41) and UTF-8 HTML. Run it in a supported browser environment before actual-component visual acceptance. Native checks remain separate.

Draft PR: https://github.com/persisharma/aadhyatma/pull/695 . Remote publication uses the authorized GitHub connector because local git has no push credentials. Published tree hashes are compared with local Git before moving the branch. Only dependency symlinks and regenerable preview output remain local; no task implementation is discarded. Keep PR draft until required native checks pass.

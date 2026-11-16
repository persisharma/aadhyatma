# A3 — Santoshi Mata Chalisa

## Scope and authorization

Base 199e05b3c6613d41fe14708832515b022019a299 (A2 merged). Only `santoshi-mata-chalisa`, category `chalisa`, deity `durga`, addedInVersion 1.5.7. No new artwork/audio, release, merge or A4.

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

Pending execution. Keep PR draft until required native checks pass.

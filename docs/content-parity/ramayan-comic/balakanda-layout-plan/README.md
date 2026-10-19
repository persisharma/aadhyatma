# Bālakāṇḍa illustrated preview and layout plan

The complete illustrated local preview is now available: [all 62 screens](http://127.0.0.1:8745/full-book/index.html) · [phone reader](http://127.0.0.1:8745/?book=full).

This supersedes the reference-image wall as the current visual review. It contains 62 distinct selected comic sheets (59 newly generated with built-in ImageGen and three accepted Parashurama sheets), 199 distinct framed shots and 196 live text blocks in Hindi, English, Gujarati and Kannada. All 140 original panel IDs remain mapped in order across77 sarga arcs. Layout:8 one-row,19 two-row and35 three-row pages;70 dialogue frames with natural scroll.

- [Complete illustrated pacing and visual review](illustrated-preview-review.md): every page/transition, evidence, selected asset boundaries and pending gates.
- [Four-language full script](illustrated-preview-script.json): titles, scene/source IDs, all character dialogue and narration.
- [Selected artwork and exact prompt provenance](illustrated-preview-assets.json): saved asset paths, measured frames, hashes and full prompts/reference records.
- [Final validation](illustrated-preview-validation.json):496 reader states and48 overview states; all paintings loaded, text contained and no horizontal overflow.
- [Current source fetch evidence](illustrated-preview-source-fetches.json):77 English retrievals succeeded, Hindi raw fetches returned406; complete independent collation remains pending.

Project/artwork location: `/Users/prashant/.codex/visualizations/2026/10/15/01a140bd-70ab-7c12-9ecd-fa9a2489d1e7/balakanda-comic-preview`. The project-root `design-qa.md` records the accepted-sample comparison and final passed browser-preview QA. Human editorial approval in all four languages and complete native Standard/Large review remain pending. No production/mobile/CDN/OTA activation was performed.

## Original prebuild plan (retained history)

Review draft · 2026-10-16 · before artwork/reader implementation.

Open [the storyboard wall](index.html) through a local server rooted at `docs/content-parity/ramayan-comic`, or use the retained local review link: http://127.0.0.1:8744/comic/balakanda-layout-plan/ .

All 140 current panels were reviewed, in Hindi and English at Standard/Large browser-model sizes. Every source panel is mapped, in order, to62 proposed pages with 199 frames. The59 extra shots separate existing actions/reactions; they are not new story events.

| Layout | Proposed pages | Use |
| --- | ---: | --- |
| 1 row | 8 | Birth, emotional departures/resolutions, Ganga descent, renunciation, bow break and wedding emphasis |
| 2 rows | 19 | Establishment, paired scenes and calm transitions |
| 3 rows | 35 | Questions/answers, action/response and linked consequences |

70 draft dialogue frames (current book31) plus9 named teller captions. Silence remains useful; do not add chatter to a ceremony or invent scripture dialogue. The 62-page count may change after complete script/art review.

- [Complete page-by-page storyboard](PAGE-PLAN.md): every row/frame, draft Hindi/English speech, purpose, transition, scroll target and artwork instruction.
- [Full140-page audit](AUDIT.md): quantified spacing, per-panel diagnosis and28 current-run visual sheets.
- [Machine-readable plan](page-plan.json): source refs, stable scene IDs, chapter jumps, geometry intentions and inherited publication links.
- [Original panel inventory](current-panel-inventory.json): complete original Hindi/English facts, actual asset hashes/frames, measurements and proposed destinations.
- [Panel-to-page map](panel-to-page.csv): all 199 planned frame assignments, including repeated source IDs for separately staged shots.
- [Validation](validation.json): coverage, ordering, source/native parity and image evidence checks.

Reference images in the wall are the existing art. They are not newly illustrated shots, approved final crops or final balloon placements. Long captions must be rewritten after plan acceptance; do not simply place the original prose above each thumbnail.

Natural scroll targets are authoring estimates, not tested output: a hero about 1 viewport, a gentle page about 1.05–1.35 Standard, and dense pages about 1.2–1.6 Standard (Large may reach1.85). Complete art/readability wins over a cap. Keep the same page/scene when switching language or size; permit per-language height and balloon placement.

Next sequence: review this storyboard → compare changed speech against both publication sources and finalise the full hi/en script → author/review gu/kn against the same beats → approve representative dense/hero/legend layouts → commission/review art in episode batches → integrate the native rows renderer → inspect every page in all four languages at Standard/Large. No full-book build starts from this planning task.

# Story pacing revision

Dates: 2026-10-07–08. Delivery: [PR #429](https://github.com/persisharma/aadhyatma/pull/429). Branch: `codex/kids-story-pacing`, based on `25fb414b` after PR #425 merged. The prior opening-only change did not resolve compressed transitions through the stories. This revision expands the complete arcs.

| Story | Before | After | Added connections |
| --- | ---: | ---: | --- |
| Putana | 7 | 10 | Krishna recognizes the concealed intention; Putana cries for release; her disguise falls before the separate rescue scene |
| Ganesha Birth | 8 | 11 | The incident behind Parvati's decision; the guardian's conflict with the attendants; the plea for life and honor |
| Hanuman and the Sun | 7 | 10 | Anjana's departure and the child's hunger; Rahu's appeal to Indra; the world's appeal to Brahma |

Each new page has a distinct illustration. Existing stable page IDs, covers and closing scenes remain. Adjacent narration is rewritten to remove duplicate beats and premature conclusions. Hindi, English, Gujarati and Kannada share the illustrations. Horizontal paging and locale/page stability remain. The follow-up layout preserves the illustration independently of caption length and permits vertical scrolling. All 56 illustrations now have reviewed bottom-band frames (top 78–88% retained), keeping painted content visible while removing empty parchment that caused needless scrolling. Kaliya Nag (8 pages) and Krishna Janma (16) retain their narration and scene sequence.

To prevent the same gaps in future stories, AGENTS.md directs future story work to RULEBOOK §29, which now requires a complete sourced outline, a page-by-page causal transition review, all four full narratives and the entire native walkthrough before sign-off. The [reusable authoring checklist and review template](authoring-checklist.md) includes the Putana, Ganesha and Hanuman regression examples. Narrative review is a separate gate from passing technical tests; there is no fixed page/word-count heuristic claiming to establish comprehension.

## Source checks and adaptation

- Putana: [Bhagavata 10.6, BBT](https://vedabase.io/en/library/sb/10/6/), [Aadhar translation](https://bhagavata.org/canto10/chapter6.html). New pages map to 10.6.7–9, 11–12 and 13–17. The existing nursing page now stops at the drawing of life-force (10.6.10); the existing rescue artwork narrates 18–19. Kansa's fear is explained by the prophecy in 10.1.34, without claiming he already knew Krishna's whereabouts. No poison recipe, invented dialogue, graphic injury or ritual verse is added. The aftermath is represented gently, but death is not concealed in the prose.
- Ganesha: [Shiva Purana 2.4.13](https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226133.html), [chapter 15](https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226135.html), [chapter 17](https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226137.html), checked against [Sanskrit Kumara-khanda](https://sanskritdocuments.org/doc_purana/shivapurANam2rudrasaMhitA4kumArakhaNDaH.pdf). Decision: 13.15–19; conflict: chapters 14–15; plea: 17.30–46. Artwork shows the fully clothed decision after the privacy incident, a defensive standoff and sages asking forgiveness. It does not depict bathing or the fatal injury. This remains the Shvetakalpa account, without mixing the Shani variant.
- Hanuman: [Ramayana Uttara-kanda 35, Sanskrit](https://sanskritdocuments.org/mirrors/ramayana/utf/7_uttarakanda_35.html), [Shastri translation](https://www.wisdomlib.org/hinduism/book/the-ramayana-of-valmiki/d/doc424801.html). Departure: 35.21–22; Rahu: 31–38; appeal to Brahma: 55–65. This remains the childhood flight toward the sun, not the sun-swallowing folk version. Indra's arrival and injury are narrated on the following page; Rahu is introduced before that event.

All narration is an original child adaptation, with brief paraphrases of speech rather than quotations. Four-language text is checked for aligned events; independent regional editorial approval is still a release check.

## Artwork and validation

The [full-arc pacing review](pacing-review.md) records every page’s purpose, source and next transition. The nine full prompts, reference paths, original master paths and visual acceptance notes are recorded in [artwork.json](artwork.json). Built-in image generation is used; WebP export retains the top, packages the image at 1122×1402 and duplicates identical bytes into native and browser assets. Faces/actions are requested within the upper 60% for Large captions.

The earlier [opening-only report](../kids-story-openings/README.md) and [original delivery report](../kids-stories-expansion/validation.md) remain historical evidence.

### Local gates

- Literal `npm test`: **2,971 tests pass**, including TypeScript, 230 Jest suites (2,128 tests), widgets (37), engine (590), data (167) and Ask (49). Final log: `/tmp/kids-pacing-scroll-npm-test.log`. An initial concurrent run timed out in the unrelated share-series suite; its isolated 10-test rerun and the complete final run both passed without changing tests/timeouts.
- Changed TypeScript/TSX ESLint and `git diff --check`: pass (four existing `require()` warnings in the reader-test mocks; zero ESLint errors). After the final Kannada caption edits, the focused six-test story-data suite also passes, including 39 distinct scene hashes and native/browser byte parity.
- Final iOS simulator Release build and install after the scroll-layout change: pass, zero errors/warnings in `/tmp/kids-pacing-ios-scroll-final.log`. The initial attempt hit a stale local Node path; ignored `.xcode.env.local` was corrected to `/opt/homebrew/bin/node`. The full retry had seven existing native warnings. No tracked native configuration changed.

### Native walkthrough

Device: owned `Vedansh-Kids-Openings-QA`, iPhone 17 / iOS 26.5, `F6DC4B82-AD6C-4C6B-B677-D50F249857D6`, installed final Release build. Captures are 1206×2622.

### Narrative walkthroughs before the scroll-layout follow-up

| Flow | Coverage | Result / captures |
| --- | --- | --- |
| `kids-stories-new-stories-smoke.yaml` | All 39 Putana/Kaliya/Ganesha/Hanuman pages in English Standard; Hindi openings, counters, source scroll and navigation | Pass; 47 PNGs in `/tmp/kids-pacing-standard/screenshots/` |
| `kids-stories-pacing-hindi-smoke.yaml` | All 31 revised Putana/Ganesha/Hanuman pages in Hindi Large | Pass; 34 PNGs in `/tmp/kids-pacing-hindi/screenshots/` |
| Regional Large walkthrough, split after simulator interruption and a translated settings-selector failure | All 39 pages in Gujarati and all 39 in Kannada, including full non-final caption assertions and ending sources | Gujarati completes in `/tmp/kids-pacing-regional-retry/`; Kannada resume passes in `/tmp/kids-pacing-kannada/`, 43 captures each |

All 39 English Standard scenes/four source endings and all 31 Hindi Large scenes/three source endings were visually inspected. The nine new scenes were inspected in Gujarati and Kannada Large, including adjacent sensitive captions. Kannada screenshots exposed the hidden-danger baby and restoration face being cropped, despite passing text assertions. Three Kannada captions were shortened, preserving their causal events. The user then requested full illustrated content with vertical scrolling; the resulting layout change supersedes the earlier fixed art-frame screenshots.

Brahma's appeal illustration was repaired from three clearly visible arms to four connected arms before native capture; the rejected master and repair are in `artwork.json`. The initial regional run was interrupted when the simulator shut down externally. A later run completed Gujarati but used Hindi/English-only text to close a Gujarati settings sheet; all four translated Done labels are now accepted by the flow.

### Scroll-layout verification before the all-image framing follow-up

The final Release build preserves the full 4:5 illustration by default. `hs09` trims only its reviewed empty bottom 16%; all supporting people, the cow, village and deities remain. Scene captions and ending material scroll vertically. The horizontal pager still handles page turns and keeps the scene when language changes. Maintained full-story flows now capture art separately and scroll to complete captions rather than assuming everything fits in one viewport.

- Focused Kannada Large native walkthrough passes the three corrected Putana/Ganesha captions, art captures, vertical scrolling and horizontal page turns. Evidence: `/tmp/kids-pacing-scroll-focus/`. The run then used an unsupported `label` selector to return to the Hanuman artwork; the tracked flow now uses `text`, and the remaining Hanuman checks pass in the resume below.
- “The World Needs Air” passes complete art and caption checks in Kannada and English Large, plus return navigation: `/tmp/kids-pacing-world-scroll/`. Both art/caption pairs were visually inspected; all supporting figures remain and only blank parchment is trimmed.
- Current English Standard: all 39 Putana/Kaliya/Ganesha/Hanuman pages pass counter/ID, art capture, complete non-final caption, four Hindi opening switches, ending source scroll and return navigation checks. This result combines the completed Putana segment in `/tmp/kids-pacing-scroll-standard-final/` and the final passing 29-page Kaliya/Ganesha/Hanuman run in `/tmp/kids-pacing-scroll-remaining/`. The initial run hit disk exhaustion; its first resume hit an XCTest runner exit/restart. Task-owned build intermediates were removed, and the final remaining-story run passes. Earlier interrupted logs are retained and are not described as complete runs.
- Unchanged Krishna Janma: all 16 page counters/IDs, forward/backward swipes, catalog/shelf routing and return pass on the final layout; 16 scene captures plus catalog/shelf captures in `/tmp/kids-pacing-krishna/screenshots/`. Balarama, return, Devi and final Gokul art were visually inspected. This flow checks paging/art reachability, not full-caption assertions for all 16 pages. Scope: iOS simulator, phone portrait. Android, physical-device, tablet/rotation and independent Gujarati/Kannada editorial approval remain separate release checks.

Historical unmodified native captures remain under [screenshots/](screenshots/); current scroll-layout captures are identified with an `-art` or `-caption` suffix.

## All-image bottom-band framing follow-up

The full-height default left the lower parchment band in every scene and added unnecessary vertical scrolling. All 56 bundled images were individually reviewed. `mobile/src/components/kidsStoryArtFrames.json` now records a retained top height of 78–88% according to each painted boundary, together with that actual image’s SHA-256. `KidsStoryArt` keeps the same full-width image scale and hides only the reviewed empty bottom; captions cannot resize or crop the painting. `hs09` now retains 82%, preserving the world’s supporting figures. The Kaliya leap retains 88% to keep its water; Parvati’s decision retains 86% to keep her clothing fade. At a 358-point frame width, the previously untrimmed scenes lose roughly 54–98 points of empty space. The reader also drops its duplicate bottom safe-area inset because the visible tab bar already owns it, uses an 8-point image/caption gap and bottom content inset, and reduces caption vertical padding to 12 points. This reclaims another 54 points on the QA iPhone (34-point duplicate inset plus 20 points of spacing). Long narration and ending sources still scroll when needed.

The image-review sheets cover every scene and the separate Krishna cover: [Krishna](framing/kj-reviewed-frames.jpg), [Putana](framing/pt-reviewed-frames.jpg), [Kaliya](framing/ka-reviewed-frames.jpg), [Ganesha](framing/gb-reviewed-frames.jpg), [Hanuman](framing/hs-reviewed-frames.jpg). No image bytes or story text change in this follow-up.

- Full `npm test`: **2,973 pass** (230 Jest suites / 2,129 tests, widgets 37, engine 590, data 168, Ask 49, plus TypeScript). Log: `/tmp/kids-art-framing-tests-final2.log`. The first run caught the UI metadata being placed in the scripture-data directory; it was moved beside the art component without weakening the provenance gate, then the complete run passed.
- Changed-source ESLint, framing-flow YAML parse and `git diff --check`: pass.
- Final iOS simulator Release build/install after the inset/spacing correction: pass, zero errors and one build warning. Log: `/tmp/kids-art-framing-ios-final.log`.
- Manual visual approval: the user inspected the updated simulator and confirmed “looks fine” before authorizing the commit and PR update. Automated final framing walkthrough remains incomplete. The first all-page run was stopped for the additional inset/spacing fix; the final-build attempt did not reach the stories because its settings selector was unavailable. Neither is reported as a complete final native run. The final native Hanuman screen confirms the bottom strip is removed; [current simulator preview](framing/hanuman-spacing-preview.png). Full Standard/Large verification remains pending.
- Future-image guard: the data suite requires a reviewed frame for every static art import and verifies the image SHA-256, so replacing art fails until its bottom boundary is re-reviewed. Unknown/unreviewed art displays full-height. AGENTS.md, RULEBOOK §29, the design record and the authoring checklist now require this step.

## Added payload

The nine bundled WebP files add **2,222,910 bytes (2.22 MB / 2.12 MiB)**. Canonical story JSON grows by **17,315 bytes** versus `25fb414b`. The reviewed frame metadata adds **7,067 bytes**. Combined artwork/story JSON/frame metadata growth is **2,247,292 bytes (2.25 MB / 2.14 MiB)**. This is bundled payload, not a measured App Store download or installed-size delta. Browser copies and review screenshots are outside the mobile bundle. This revision adds no dependencies; the tracking-transparency dependency already belongs to the main-branch base.

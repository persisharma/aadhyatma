# Fitted bilingual episode review

2026-10-12. One-episode authoring preview: bk-05, The Four Princes / चार राजकुमार. Open `fitted.html` through the local preview server. This corrects the rejected `compact-review.html` proof, not the published mobile story or the other 28 episodes.

## Layout correction

Narration uses natural document flow in a top caption compartment **inside the same ink-bordered comic panel**, rather than absolute positioning over completed artwork. This is an intentional composition change from overlay lettering, not a claim that the failed overlays were made safe by shrinking their fonts. All art stays full width at its original 4:3 ratio; captions increase the scrollable panel height instead of changing/cropping the painted image. At 390px / 18px narration is approximately 20% (Hindi) or 24% (English) of the first three framed panels' height. No new empty scenery was generated to hold paragraphs.

Dasharatha's existing spoken question moves to inserted panel `bk-05-03a`, an illustrated close-up. The native balloon sits in the quiet backdrop beside his large face, with its tail pointing toward the king. The measured speech box must be no taller than 46% of the artwork height; when it exceeds that limit, the balloon reflows above the art, still within the same panel border. This fallback occurs for both languages at 320px / 23px. It preserves the complete artwork and readable type rather than overlaying hands or faces. The balloon is not clipped or shrunk.

## Complete-episode pacing and copy review

Base: existing sourced bk-05 adaptation in `../balakanda-v1/book.json`, Bāla 1.18, and prior English layout draft. No new scripture translation, event, or sacred dialogue is introduced. The earlier episode's source/publication/editorial limitations still apply. Colour, crown and gesture details are artistic conventions, not quotations from the source.

| Stable panel ID | Retained narrative / art | Transition |
| --- | --- | --- |
| `bk-05-01` | All three mothers, four named sons and palace celebration; three queens/four infants and the king remain visible. | Infancy gives way to education; heading and next caption explicitly signal elapsed time. |
| `bk-05-02` | Four brothers grow up with education and arms training; both brother pairings retain their special closeness. Vashishtha teaches, with books and bows in view. | The next caption explicitly advances to adolescence and the sage's court visit. |
| `bk-05-03` | Adolescent princes, Vishwamitra's arrival and Dasharatha's respectful welcome. The established court cast remains visible. | The new close-up continues this same welcome rather than introducing another event. |
| `bk-05-03a` | Dasharatha asks the existing question in a speaker-identified balloon, with welcoming expression/open palm. Same crown, older face, grey moustache/temples, no beard. | The next existing episode supplies the sage's request and the father's response. |

Full Hindi and English preview sequences were read and visually inspected from birth through the closing question. Gujarati/Kannada versions are not added or validated. Independent editorial/source comparison, native Standard/Large, physical-device and screen-reader testing remain pending. The corrected typography is not a claim that the full book's previously reported Tataka or 1.28→1.29 continuity problems have been fixed.

## Browser validation

Tail repair after user review: the two CSS triangles left a seam against the rounded bubble. The bubble and tail now use one closed SVG outline beneath the unchanged native text, redrawn from the measured box in overlay and flowing layouts. All 16 language/size/width combinations were rechecked for text containment, a single closed outline and absence of the old triangles. Detail captures: `.context/ramayan-preview/repaired-tail-en.png`, `repaired-tail-hi.png` and `repaired-tail-en-large-320.png`. No artwork or narrative changed.

- 16 states checked: viewport widths 320, 360, 390 and 430px; Hindi/English; normal 18px and Large 23px.
- Every state: four loaded 1448 × 1086 images; full 4:3 aspect ratio; no horizontal page overflow; narration outside all painted art; spoken text contained within the balloon; balloon clear of the visually reviewed face/hand regions.
- Art dimensions do not depend on language or text size. Normal and Large use the same shared text-free images, not separately generated language images.
- Browser console: no captured warnings/errors. `node --check fitted-reader.js` passed.
- Visual walkthrough captures: `.context/ramayan-preview/fitted-{en,hi}-390.png`, `fitted-{en,hi}-large-390.png`, `fitted-{en,hi}-large-320.png`.
- Measurement artifact: `.context/ramayan-preview/fitted-layout-checks.json`. An earlier scrollHeight diagnostic included the decorative balloon tail as overflow; final checks inspect the spoken text's actual line rectangles and screenshots instead.
- These are local browser results, not native app/device certification or user design acceptance.

## Artwork provenance

The first three images and hashes are recorded in `text-fit-review.md`; they are reused without image editing or cropping. New `bk-05-03a-welcome-v1.png` was created with the built-in image generation tool using `bk-05-03-compact-v1.png` as the scene/identity reference. Exact prompt: `welcome-closeup-prompt.txt`. The full 1448 × 1086 painted boundary is retained, frame `[0, 0, 1, 1]`; the image was inspected alone and with both languages at both text sizes. All fingers, extended hand, face and royal identity remain visible.

- Reference SHA-256: `a9dd440506ff75b827b1e509fb4a90f7456ec010c5b702d4e1ec5f125427bd17`.
- New close-up SHA-256: `46cccdf45d6777aa30173e3554bc0bba732b339d5991116f68beed6f88436fa4`.
- Generated source: `/Users/prashant/.codex/generated_images/01a12ed2-6484-7391-a3e0-a6c656fc2807/exec-84497938-266c-43bf-b00b-0148377fd2f5.png`.

The local source PNG remains in the author's generated-images folder, and a project copy is retained here. These are authoring-only assets: no mobile story/frame registry, CDN, original book, commit or publication was changed. Production registration and all release gates remain deferred until approval and integration.

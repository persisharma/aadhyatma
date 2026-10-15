# चार राजकुमार — one-episode lettering proof

## Current: fitted Hindi / English episode

[Open the corrected four-panel preview](fitted.html). Narration now flows in a compact top box inside each panel's ink border, outside the painted artwork. The king's existing question has its own illustrated close-up. Images retain full bounds and constant width-derived size; changing language or text size never crops art or places narration over a face.

Browser verification passed 16 combinations: Hindi/English × 18/23px × 320/360/390/430px viewport widths. At 320px / 23px the speech balloon moves into normal flow inside the fourth panel above its complete artwork; otherwise it occupies the close-up's side background. Complete screenshots were inspected at 390px in both sizes/languages and 320px in Large. See `fitted-review.md` for pacing, provenance and validation boundaries. User/editorial/native acceptance is still pending; production and the other episodes are unchanged.

## Earlier rejected experiments

**Actual-text review:** `compact-review.html` now overlays proposed short Hindi/English captions and the king's dialogue on all three compact images. At 390px / 18px it fails: narration hides important faces, and the court balloon hides the speaker. See `text-fit-review.md` for scene-by-scene evidence. This diagnostic is not the final proposed design.

The user correctly flagged that enlarging backgrounds to fit paragraphs reduces the focus on characters and action. The tall bilingual `index.html` experiment is not the selected design, and its Larger text option is not evidence of a passed fit check. The compact text-free alternatives restored character scale but did not themselves provide sufficient lettering space. These earlier layouts failed review; use `fitted.html` for the subsequent correction.

The correction uses concise Hindi and English comic captions preserving the existing narrative beats, protected faces/hands/action, and an additional close-up for the king's existing question. Do not shrink text, omit necessary narrative, or add oversized background merely to force a fit. Review one complete episode before extending the treatment. The original book and mobile assets remain unchanged. English copy remains a layout draft. Exact earlier generation prompts are in `exploration-prompts.json`; the new close-up prompt is in `welcome-closeup-prompt.txt`.

The sections below describe the earlier static Hindi proof only, not acceptance of the subsequent bilingual experiment. See `continuity-findings.md` for confirmed gaps elsewhere; no whole-book continuity pass is claimed.

2026-10-12. The user identified that the complete Bala Kanda draft placed text beneath artwork instead of following the accepted in-panel narration and speech-balloon design. They selected one complete episode for review before any broader correction.

[Open the review](index.html) or [the full-resolution proof](bk-05-lettering-v1.png).

## Scope

- Episode `bk-05`, all three existing panels: birth, education, and Vishwamitra's arrival.
- In the static Hindi proof, narration, the king's dialogue and the time-transition subtitle remain verbatim from `../balakanda-v1/book.json`. The later bilingual experiment adds an unapproved English layout draft.
- Narration boxes now sit within the painted panels. Dasharatha's balloon sits within the court scene and its tail points toward the king.
- The built-in image_gen tool recomposed the episode using the existing episode sheet, accepted friendship mockup, queens, sages and brothers references. Exact instructions are in `generation-prompt.txt`; the static proof SHA-256 is `5648799d4ebcbeeb2bc3cb7c3f49f20e645fb43f2e56e3b2f38d2bff9a31abd1`.
- Selected image: 768 × 2048 PNG, retained in full, no crop, no trimmed lower band. It is a continuous three-scene review plate, not a new app cover or a replacement for the current reader's panel frames.

## Complete-episode visual and pacing review

| Scene | Retained action and character check | Text placement | Transition |
| --- | --- | --- | --- |
| `bk-05-01` | Three queens and four infants; red-clad Kaushalya holds blue Rama, blue-clad Kaikeyi holds Bharata, yellow-clad Sumitra holds two infants. Dasharatha is present. | Complete narration in the palace background at upper left; no face or infant is covered. No invented speech. | The births lead to childhood and education; the subtitle explicitly signals elapsed time. |
| `bk-05-02` | Four child princes learn with white-bearded, cream-clad Vashishtha. Rama stays blue; the other three have natural skin tones. Training bows and manuscripts connect both kinds of education. | Complete narration inside the upper-left forest background, above the children. | Children become adolescents; the next caption states the age transition and the sage's arrival. |
| `bk-05-03` | Elder grey-bearded Vishwamitra in orange, Dasharatha in royal dress, adolescent Rama and Lakshmana at court. Vashishtha is not substituted for Vishwamitra. | Complete narration inside the palace at upper left. The only balloon contains Dasharatha's exact question and points toward him. | The king's welcome/question closes this episode; the sage's request belongs to the following existing episode. No departure or wedding is added. |

All three captions, the subtitle and the single dialogue were visually compared with the existing Hindi text. Faces, infants, hands, cast counts and the third-scene speaker were inspected. This is an authoring visual review, not independent Sanskrit/Hindi editorial approval.

## Review boundary

This is a **static lettering/composition proof awaiting user review**. Text is baked into this image to establish the composition; it is not the production multilingual asset. The review page supplies the unchanged full transcript directly from the existing book for accessibility. Its enlargement control scales the whole image and must not be reported as Standard/Large font reflow validation.

If accepted, the next implementation step is to reproduce the approved placement using text-free compositions plus separately rendered narration/balloons. At that point actual font size, per-language wrapping, balloon geometry, accessibility and the full native Standard/Large sequence must be checked. Do not use this baked-lettering image as shared hi/en/gu/kn production art.

The other 28 episodes, original reader, original selected sheets, mobile registries, `kidsStoryArtFrames.json`, CDN and native resources are unchanged. The static proof retains its full 768 × 2048 bounds; production registration is deferred until native integration. English/Gujarati/Kannada approved narratives, independent editorial review, rights and device checks remain pending as documented in the original draft.

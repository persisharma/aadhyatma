# Compact artwork reviewed with text

2026-10-12. Scope: all three scenes of bk-05 with proposed shortened Hindi and English captions, plus Dasharatha's question. This is a rejected fit diagnostic, not a corrected/approved episode or production content.

Open `compact-review.html` through the local server. Both language buttons and the text-size toggle work. The screenshots retained in `.context/ramayan-preview/compact-{en,hi}-text-review.png` show the full episode at 390px viewport width, 18px caption type, and 372 × 279px artwork per panel. All three images loaded; no horizontal page overflow was observed. Large-font/native/accessibility acceptance is not established by this review.

## Findings with actual lettering

| Scene | English | Hindi | Verdict |
| --- | --- | --- | --- |
| Birth | Caption is 89px high and hides Dasharatha's face and parts of the queens' heads. | Caption is 69px high and still hides Dasharatha. | Fail: caption placement removes a principal expression. |
| Education | Caption is 113px high and covers the teacher's face and portions of the princes' faces. | Caption is 69px high; boys remain visible, but the teacher's upper face is covered. | Fail: the teaching interaction is weakened. |
| Court | Caption is 89px high, obscuring the sage/princes; the speech balloon covers Dasharatha's face. | Caption is 95px high, obscuring the sage/princes; balloon also covers the king. | Fail: speaker identity and welcome are not readable visually. |

Caption boxes alone occupy approximately 25–40% of panel height at normal type. Fitting within a rectangle and avoiding horizontal overflow do not establish an acceptable comic composition. The missing fit cannot be solved by asserting that the text-free art is approved.

## Copy and pacing boundary

The copy in `compact-review.js` is a review-only condensation of the existing `../balakanda-v1/book.json` episode and `episode-en.json` layout draft, not new source translation or independent editorial validation. Scene 1 retains all three mothers, all four names and the celebration. Scene 2 retains elapsed childhood, education, weapons training and the two close brother pairings. Scene 3 retains adolescence, Vishwamitra's arrival, Dasharatha's respectful welcome and his existing question. The move from infancy to childhood to adolescence remains explicit. The next episode supplies the sage's request. No new sacred dialogue was added.

## Art boundary and next correction

All three compact PNGs retain their complete 1448 × 1086 painted bounds; no crop or caption-driven trim was applied. The exact generation instructions are the `compact` entries of `exploration-prompts.json`. They are local rejected authoring assets, not mobile frame registrations, CDN assets or approved replacements.

| File | SHA-256 |
| --- | --- |
| `bk-05-01-compact-v1.png` | `b7aaf018a7206fbf48f052e86f4a2d216065f2a65620ee971a6125b6d8cecd4d` |
| `bk-05-02-compact-v1.png` | `e9b6578a638ab04bb7723b9e18ceb6eeb440901a4812bf0ca039b763147547be` |
| `bk-05-03-compact-v1.png` | `a9dd440506ff75b827b1e509fb4a90f7456ec010c5b702d4e1ec5f125427bd17` |

The next storyboard must place the actual bilingual lettering before final art composition: separate the birth identities/celebration or learning/brotherly affection into extra visual beats where necessary; give the arrival narration and the king's spoken welcome distinct readable space. Protect faces, hands and decisive action. Preserve causal content rather than simply deleting it, and do not expand scenery or shrink type to force a fit. Review the complete text-and-art episode again before extending the treatment.

The existing 29-episode book is unchanged. Gujarati/Kannada parity, independent source/editorial review, screen-reader validation and native Standard/Large sequence checks remain pending.

# Prashna current-phase pilot — 21 September 2026

Status: implemented for adult career/business **for review**, not approved for release or extension to the remaining topics. `PHASE_SOURCE.verified` stays false. This is a limited D1 interpretation, not a complete astrologer's judgement. The user's approved first checkpoint is actual readings across people and dates before extending the model.

## Computation and source register

The calculation foundation is unchanged: Lahiri, whole-sign houses, existing Vimshottari intervals, shared daily gochar at 06:00 IST. Period membership uses exact half-open instants. Display dates use IST. This document distinguishes traditional inputs from our editorial composition rules.

| Rule ID | Implemented condition | Reference / review status |
| --- | --- | --- |
| `natal-lord-condition` | Examine the question's priority house ruler. Own/exalted sign or placement in 1/4/5/7/9/10/11 contributes support; debilitation or placement in 6/8/12 contributes a competing demand. Both can remain present. Nodes do not receive this polarity shortcut. | Phaladeepika 20.1, 20.14 provides condition-sensitive dasha reasoning. The selected house subset and modern wording are an explicit simplified convention; not a complete bala assessment. |
| `dasha-activation` | Running maha and antar activate their actual topic-house lordships or occupied topic house. An occupant never becomes a house lord. No direct link produces limited timing, not a bad period. | Phaladeepika 20; PVR Narasimha Rao §16.5.1. Natural-karaka-only, dispositor and natal-aspect activation remain outside this pilot. |
| `transit-reference` | Lagna placement identifies topic contact. Moon-relative placement supplies the classical transit-support input. The two reference frames are retained independently in each basis node. | Phaladeepika 26.1–2; Rao §25.2–25.3. |
| `transit-aspect` | Whole-sign Jupiter aspects 5/7/9; Saturn 3/7/10 from its transit house. These add topic contact, not automatic support. | Rao §10.2 and §25.3. Second independent classical reference review remains pending. |
| `transit-vedha` | Jupiter favourable Moon houses 2/5/7/9/11 have obstruction houses 12/4/3/10/8. Saturn 3/6/11 has 12/9/5. Any other graha there obstructs; Sun does not obstruct Saturn. | Phaladeepika 26.5,7; Rao table 63 and §26.3. Nodes as obstruction occupants are included in this convention; needs recension review. |

Sources opened on 2026-09-21:

- [Phaladeepika, V. Subrahmanya Sastri, 1950, chapter 20](https://www.wisdomlib.org/hinduism/book/phaladeepika-by-mantreswara-text-and-translation/d/doc1621592.html). Its OCR warns that page scans need checking; no claim of a completed edition/page audit.
- [Phaladeepika chapter 26](https://www.wisdomlib.org/hinduism/book/phaladeepika-by-mantreswara-text-and-translation/d/doc1621598.html).
- [PVR Narasimha Rao, Vedic Astrology: An Integrated Approach](https://www.vedicastrologer.org/articles/vedic_astro_textbook.pdf), PDF pages 111, 225, 330–331, 358–359 (printed pages differ).
- [Phaladeepika chapter 19](https://www.wisdomlib.org/hinduism/book/phaladeepika-by-mantreswara-text-and-translation/d/doc1621591.html), especially the conditional Rahu discussion. An occupied house alone is not used to assign node-period polarity.

These are references for traditional rules, not evidence of predictive accuracy. Two URLs repeating one text are not counted as independent traditions. Pending items above remain pending regardless of green tests.

## Composition policy (editorial, not a classical formula)

1. Question priority selects the natal focus: career 10; first job 6; partnership 7; new business 3. All topic-house contacts remain visible. These question mappings are product conventions inherited from the purpose registry, still source-review pending.
2. Determine direct activation by maha/antar. Keep them separate; repeating the same graha does not create extra independent votes.
3. Combine natal condition, active-period condition and relevant Jupiter/Saturn transit conditions. A supportive phase requires an active period contributing support and a relevant unobstructed transit, without a competing signal. Relevant support plus challenge is mixed; only challenge is effort; activation without enough supporting conditions is active. No direct activation is limited.
4. No numeric score, weighted average, probability, event date or guaranteed result. In particular a favourable Moon transit alone does not establish a career opportunity. Absence of a favourable transit rule is rendered as limited ease, not a predicted mishap.
5. Directions are bilingual phrase-table interpretations keyed by question and phase, with explicit signal IDs. They are not ordinary checklists and are not observed personal circumstances.
6. The next card names the actual next Antardasha, crossing Mahadasha boundaries when needed. Its natal topic meaning is a preview; it does not carry today's transit judgement forward. The UI says **Next period change**, not next improvement or next overall change.
7. For an explicit job-switch question, the same phase tone becomes a short decision: pursue interviews (supportive), search without resigning (mixed), prepare before an immediate move (effort), or say that the checked timing is insufficient (active/limited). The screen shows up to two signals in favour and two reasons to pause, each linked to its exact phase signal and birth/period/transit reference. A neutral or absent dasha link is labelled uncertainty, not an adverse graha. Practical steps require an actual offer and role details before a final decision. This is an editorial decision aid, not a classical yes/no prediction.

## Deliberate limits and the next review

- This does not yet synthesize D9/D10, Shadbala, combustion, natal conjunction/aspect patterns, cancellation yogas, dispositors, functional lordship interactions or maha/antar mutual relationships. Natural-karaka-only links do not decide timing. These can materially change an astrologer's interpretation.
- Rahu/Ketu contribute only topic activation. The comparison exposed disagreement around Rahu in the sixth; the generic difficult-house polarity was removed for nodes instead of selecting GPT's favourable interpretation without the missing checks.
- Only slow Jupiter/Saturn transits determine the phase. Vedha uses all current grahas, so a daily blocker can change independently of a slow ingress. The current interpretation is stamped for today, never for the full multi-year period.
- Next slow-transit change prediction is still outside the phase card. Legacy scans remain available for the other topics. Do not say the next dasha card enumerates every upcoming change.
- Ask resolves an explicit job-switch phrase in English, Hindi or Hinglish to `job-switch` and opens that selected question on Prashna. All other job phrases still use the general-purpose phase; Ask does not infer first-job or growth subtypes. Its general-purpose phase equals the screen's general-purpose phase at the same instant.
- The remaining seven topics retain the previous model. Health, mind, children and minor restrictions are unchanged.

Review the six-profile comparison before widening scope. It must show what changed, what did not, which GPT assertions disagree with supplied facts, and which comparisons cannot be made against the public platform reports.

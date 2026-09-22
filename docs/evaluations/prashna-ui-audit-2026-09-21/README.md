# Prashna app UX/UI review — 21 September 2026

**Verdict: visual polish improved; user-value/content review remains open.** The screenshots do not demonstrate that the original goal of useful, question-specific interpretation has been achieved. A visually clean card and green engine tests are insufficient.

## Scope correction from user review

The requested product is a plain-language Jyotish interpretation of **this person’s natal graha + current Mahadasha/Antardasha + current gochar**, explaining the present phase and the plan appropriate to that phase. Generic business/study checklists are not an acceptable substitute. Question context alone is insufficient: different charts and changes in the running period must change the reasoning and guidance. The current implementation does not yet provide this combined interpretation.

The missing work is an explicit, traceable synthesis layer: natal topic factors; activation and condition of running lords; relevant current transit support/tension; conflicts and missing evidence; actual next period/transit boundary; then bilingual phase-specific guidance. Do not label a related period favourable merely because it touches a topic. Preserve rule-source provenance and validate the synthesis over multiple people and dates before claiming completion.

## Current user-value gaps

1. **The selected question does not sufficiently shape the main answer.** In `composePrashnaGuidance`, the main title, summary and insights are built from purpose-level chart factors. Question choice selects actions and caution. First job and job switch therefore largely share the interpretation. The screen promises a more specific answer than the composer supplies.
2. **Abstract language remains.** “Test the support ... against your experience,” “contacts and shared goals,” and “आगे की दिशा परखें” require the user to translate the interpretation again. Explain a concrete implication for the selected question and its supporting chart facts.
3. **Repetition reduces usefulness.** The summary repeats the headline's themes. General study actions can repeat the same exercise/help prompt. The timing card repeats its caveat for each period.
4. **Personal context is missing.** The engine knows the chart and selected question, not whether the person has an offer, is unemployed, or wants better pay, workload or growth. It must not imply those circumstances are known. Optional context may refine the question, but must not replace the requested Jyotish synthesis with ordinary coaching.
5. **Advice provenance must stay clear.** Practical advice is editorial. A more conversational answer must not imply that a checklist, employer behaviour, outcome date or successful job change was established by chart calculations.

The next content revision should connect **specific question + natal chart + current dasha + current gochar → current-phase interpretation → period-specific guidance → next calculated transition**, with the calculation basis expandable. This audit does not approve content for release.

## Visual findings and fixes

- Question selection relied on a faint border. Added a filled radio indicator, stronger saffron border and active fill.
- English reading copy used the Devanagari face's Latin glyphs while several headings used an unrelated system face. Reading text now uses the app's Cormorant family in English and Noto Serif Devanagari in Hindi, with consistent headings and leading.
- Action/practice links were 38 dp high with 10 pt labels. Increased minimum targets to 44 dp, labels to 12/21, and bounded the width so translations wrap.
- Hindi technical chips used Inter and tight Latin leading. Shared `BasisChain` now uses the script face, 21 dp Hindi leading and maximum card width. Its accessibility text follows the reading language.
- The expanded strength pill stretched across the card and empty evidence categories appeared as adjacent headings. The pill now fits its content; empty groups are omitted.
- The expanded toggle's accessibility name still said “See”. Its name now follows the show/hide action.
- Completed instructions were struck through in full. They now retain legibility with a checkmark and muted colour.
- Rephrased Hindi takeaway templates to avoid attaching the wrong grammatical suffix to a theme label.

## Screen-by-screen review

1. **Entry / person / purpose / question — improved.** Theme matches the app, identity is visible and selected questions are clear. The horizontal purpose row intentionally scrolls; a partially visible next card is a scroll affordance, not inaccessible text.
2. **Your reading — layout good, content needs revision.** Headings wrap; Hindi letterforms are intact. The takeaway is still too abstract and repeats the summary.
3. **Meaning — layout good, content needs revision.** Two themes have clear hierarchy and spacing. The prose still asks the user to interpret generic connections.
4. **Practical plan — improved layout, partial usefulness.** Instructions wrap within the card and links have adequate minimum targets. General study has redundant prompts; question-specific job actions are more useful.
5. **Timing — readable, limited utility.** Dates wrap and remain inside the card. Related periods do not establish favourable timing or an outcome date; do not present them as such.
6. **Expanded evidence / practice / footer — improved.** Hindi chips stay within their card, headings are separated and the strength badge fits its content. Technical source review remains pending.
7. **Full report / share handoff — English native flow passed on iPhone 17.** The warned preview is readable and includes the question-export notice. The first report screenshot caught the navigation animation and is rejected as layout evidence; the settled share preview confirms the destination. No external sharing was performed.

## Evidence and verification

All `before/` and `after/` screenshots were captured from the actual native app during this audit, not a web mockup. Existing debug native shell (1.4.8 build 63), current worktree JS served by Metro on 8084. Synthetic Aarav fixture, 14 August 1992, 05:42 IST, Ujjain. Simulator date: 21 September 2026.

- iPhone 17 / iOS 26.4: 402 × 874 logical points, English and Hindi study and job-switch screens reviewed. English navigation through report/share preview passed after the corrected scroll sequence.
- iPhone SE 3 / iOS 26.4: 375 × 667 logical points, English primary content sweep reviewed. This is a general-study visual sweep, not a successful exam-question functional run.
- No permanent text overflow was observed in the reviewed cards/buttons. Content at the top and bottom of scroll captures is naturally outside the viewport; subsequent captures show it. This is not a claim that every device, text size or language has been verified.
- TypeScript check passed; 465 engine tests and 10 focused screen tests passed after changes.
- Refreshed frozen-date comparison artifacts for the Hindi copy change; existing GPT recordings were reused, not replaced with invented responses. Chart inputs and chart-check results remain unchanged.
- Early Maestro passes had offscreen/stale-coordinate taps: one selected a different question, one hit a tab instead of the report link. Those runs are not certified as functional passes. Screenshots were inspected independently; rejected/wrong-screen captures are not treated as proof.
- Android, physical devices, VoiceOver and the full accessibility size range have not been certified. Existing source-review release gate and the inherited launch-byte-budget failure are unchanged.

Large-system-text verification was prepared but not completed before the user redirected the work to the missing interpretation logic. The isolated compact simulator was restored to standard system text size. No large-text pass is claimed.

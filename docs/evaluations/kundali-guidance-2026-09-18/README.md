# Kundali question guidance: implementation and comparison

Date: 18 September 2026. Branch: `codex/kundali-prashna-guidance`. Before baseline: `14861226`.

Open [comparison.html](comparison.html) for the actual before/after engine outputs, recorded GPT responses, bilingual engine copy, source links and chart checks. Nothing has been committed, published or released as part of this evaluation.

## What changed

The question screen now presents a short answer, two everyday interpretations and a practical checklist before its technical evidence. Users can choose first job/job switch/growth, exam/course choice, or business idea/partner. Other topics retain general guidance. Checklist state and question context reset across people; the evidence expands on request. The selected question and full provenance travel through the existing warned text export.

`buildPrashnaReading` uses the existing deterministic calculation pipeline:

1. Birth instant and coordinates produce Lahiri sidereal positions, whole-sign houses, house lords, dignity and Vimshottari periods.
2. The existing purpose registry selects relevant houses and karakas. Existing rules produce support/resistance/qualifying factors with a basis at creation.
3. House-lord and occupant factors are grouped into everyday themes. Both support and resistance produce a mixed theme. We show the main theme plus a caution when present; its lord's destination gives the actual chart-specific connection. Karaka factors remain in detailed analysis, rather than being silently treated as a complete visible assessment.
4. The selected question picks editorial practical suggestions. A theme can add an action; duplicate workload advice is avoided for job switching. These are prompts to examine real circumstances, not facts inferred about employment, ability or income.
5. Dasha/transit relevance now qualifies timing, rather than increasing favourable strength. Related dates remain available, with explicit limits. Health, mind and children topics produce no event timing.

The low-level legacy summary remains for compatibility, but the question screen and Ask use the new guidance. No API call was added to the app. Source verification is still pending under the existing release gate; traceable rules do not establish predictive validity.

## Comparison design

All engine readings use **18 Sep 2026, 12:00 IST**. Four birth inputs were used:

| Fixture | Birth input | Question | External comparison |
|---|---|---|---|
| Public sample A | 11 Apr 1979, 18:23:24 IST, Agra (27°09′N, 78°00′E) | General work guidance | Official AstroSage CogniAstro sample + actual GPT |
| Public sample B | 7 Sep 1982, 07:14:25 IST, Firozpur (30°55′N, 74°35′E) | General work guidance | Official AstroSage career sample + actual GPT |
| Synthetic adult | 14 Aug 1992, 05:42 IST, Ujjain (23°11′N, 75°47′E) | Considering a job switch | Actual GPT; no platform output obtained |
| Synthetic adolescent | 10 Aug 2013, 10:30 IST, Ujjain (same coordinates) | Exam preparation | Actual GPT; no platform output obtained |

Platform sources: [sample A](https://cdn.astrosage.com/pdf/ca_report_pro_en.pdf), [sample B](https://www.astrosage.com/pdf/as-career-report-en.pdf). These are published natal-career reports; sample B is dated 22 April 2019. They are not September 2026 consultations or exact responses to our contextual questions. A free-report form attempt redirected to a consultation sign-in flow, so no fresh private platform report is claimed. No account or paid consultation was created.

The two public reports agree with all 20 checked sign assignments (ascendant + nine grahas per profile). Maximum angular differences are **2.845 arcminutes for A** and **1.100 for B**. `chart-check.json` records each row. This does not check exact dasha boundaries, alternative conventions, divisional charts, or interpretive accuracy.

GPT used **`gpt-5.5-2026-04-23`**, one completed Responses API call per fixture, `store:false`, no tools. It received raw calculated facts, question and as-of date, without our prose or competitor output. Requests, returned model, response IDs, usage, latency and complete text are in `gpt-*.json`. This is a language comparison conditional on our chart calculations, not an independent calculation test or a consumer ChatGPT session. No human outcomes or blind user study were measured.

## Findings

- The old engine sometimes told a general-question user to pursue growth in their current role, although it did not know they had a current role. Explicit context fixes that mismatch. It also used timing relevance to inflate support; that rule is corrected.
- The new readings vary in the actual house-lord connections and caution themes. They still reuse a small phrase library and are less fluent and less detailed than GPT. More reviewed interpretation combinations and real user context are needed before claiming pandit-like depth.
- GPT's practical suggestions are often clearer, but its outputs also introduce unestablished occupation, compensation and behavioural claims. For the adolescent it infers daydreaming/screen-time issues and gives specific study durations without knowing the child.
- On sample B, GPT suggests technology-related paths while the platform report discourages them. Agreement with either output cannot be used as an accuracy score. The new app avoids ruling out careers from a chart.
- The four profiles also run through all nine purposes (36 combinations). The adolescent correctly has five adult-only topics gated. Question variants, contradiction handling, provenance and profile resets are separately tested.

## Verification

- TypeScript: passed again on 21 September.
- Engine suite: **465 passed**; the final 22 focused Prashna/guidance/export tests also passed. Engine and Ask suites were rerun successfully on 21 September.
- Ask suite: **47 passed**, including the intent corpus.
- Focused React Native screen suites: **10 passed**, including context-aware export and person-switch resets.
- Data suite: **108 passed, 1 inherited failure**. Launch graph budget is 7,000,000 bytes. Baseline already has 7,131,688 bytes across 644 modules; this branch has 7,131,753 across the same 644 modules (+65 bytes from route typing). No new guidance module is in that static graph. The unrelated budget has not been raised or hidden.
- iOS production JavaScript export: passed again on 21 September. This is bundle verification, not a new native release build.
- Native verification: **full clean-state smoke passed on 21 September** on the isolated iPhone 17 / iOS 26.4 simulator, using an existing Vedansh 1.4.8 (63) native debug shell with JavaScript served from this checkout. It covers onboarding, birth profile creation, Prashna entry, question selection, checklist interaction, evidence expansion, purpose switching and the Muhurat handoff button. Prior runs exposed two stale landing selectors, which were corrected. This is not a newly compiled native binary. [Execution log](native-smoke.log), [guidance](screenshots/prashna-guidance.png), [checklist](screenshots/prashna-actions.png), [evidence](screenshots/prashna-evidence.png).
- Android, physical devices, VoiceOver behaviour and full-app regression were not run. The interpretation source review remains required before release.

## Reproduce

From `mobile/`:

```sh
npx tsx scripts/compare-prashna.mts
# Optional external evaluation: requires OPENAI_API_KEY; reuses saved responses.
python3 scripts/compare-prashna-gpt.py --run-gpt
python3 scripts/render-prashna-comparison.py
```

The generator loads the old composer from the baseline commit into a uniquely named temporary sibling module, then removes it. It does not alter the checked-in runtime. Delete an individual recorded GPT response only if deliberately repeating that API call. New model runs can vary; preserve prompts and model identity when comparing results.

# Kundali current-phase pilot — 21 September 2026

**PR refresh, 22 September 2026:** rebased onto current main (`f81a4ceb`). See [the submission checks](pr-submission-2026-09-22.md) for current results and [the copy cleanup](copy-cleanup.md) for removed customer text. The earlier launch-budget failure below is historical; the current data suite passes.

Career and business now read natal graha, the running Mahadasha/Antardasha and current Jupiter/Saturn transits together. This is the first review milestone of the approved plan. It replaces the generic checklist for these two topics; the other seven topics retain their previous implementation.

Open [the interactive comparison](comparison.html). Select a person, question, date and English/Hindi. The left panel is the previous natal-theme reading; the right is the new dated phase. Real GPT responses and native app screenshots follow. The page is a review tool, not the app UI.

## What changed

- A shared deterministic phase model drives Prashna, purpose-level Ask and selected-question export.
- Main reading: current phase → why → direction → next period change → expandable Jyotish basis. Technical facts stay available for review/export.
- True house lordship is distinguished from occupancy. Gochar basis retains separate Moon and Lagna references. Fast Ask computation keeps current transits while skipping future ingress scans.
- Current dates refresh on focus, foreground, India midnight and the exact next dasha boundary. Next Antardasha lookup crosses a Mahadasha boundary.
- Rahu/Ketu's occupied house establishes topic only. Their polarity is not guessed from a generic difficult-house rule without the missing dispositor/association analysis.

The [computation and source register](../../roadmap/conventions/prashna-phase-v1.md) distinguishes sourced traditional inputs from the editorial composition policy. Source status remains `verified:false`. There is no runtime AI call, numeric luck score or claimed probability.

## Comparison method and findings

[engine.json](engine.json) contains six public/synthetic profiles × five instants × two questions = **60 readings**. The dates are 21 September 2026, one second before/after the next Antardasha edge, and daily anchors bracketing the next Jupiter ingress. Engine outputs use the existing Lahiri, whole-sign, Vimshottari and 06:00 IST transit convention. Node timings are not a device benchmark.

Six fresh, completed API responses from **gpt-5.5-2026-04-23** independently read two instants each. They received natal facts and both dates' dasha/transit facts, without the engine answer. Exact prompts, model IDs, response IDs and usage are recorded in `gpt-*.json`; [gpt-input.json](gpt-input.json) records the inputs. Only public/synthetic fixtures were sent, with `store:false`. No saved private birth profiles were used. These are 12 dated interpretations inside six responses, not 60 independent GPT runs.

| Person | Main comparison | What the comparison exposed |
|---|---|---|
| Public sample A | Job change; Saturn–Saturn → Saturn–Mercury | Period details change but both engine headlines remain mixed. GPT supplies a broader career narrative and does not fully derive vedha. |
| Public sample B | Partnership; Mars–Saturn → Mars–Mercury | Engine changes from effort to mixed as the activated area changes. GPT emphasises negotiation and review, with broader associations than the pilot. |
| Aarav (synthetic) | Job change; Jupiter–Rahu → Saturn–Saturn | The previous reading stayed fixed; the new model changes from mixed to limited. GPT offers a contract/consolidation narrative using Saturn's seventh-house role. This exposes the pilot's narrow direct-house coverage. |
| Meera (synthetic) | Partnership; Venus–Jupiter → Venus–Saturn | Named period reasoning changes. GPT includes natal Mars–Saturn conjunction pressure; our pilot does not yet evaluate that association. |
| Kabir (synthetic) | Job change; Sun–Venus → Moon–Moon | **GPT factual error:** it calls the tenth house Aquarius and its lord Saturn; the supplied Gemini-Lagna chart has Pisces/Jupiter there. The engine's basis matches the chart. |
| Isha (synthetic) | Partnership; Rahu–Venus → Rahu–Sun | Engine becomes limited when direct topic activation disappears. GPT discusses vedha but includes the Sun as a Saturn blocker despite the Sun/Saturn exception; Mercury still supplies an obstruction. |

The GPT comparison also challenged our initial generic Rahu-in-sixth difficulty label. We removed that unsupported blanket polarity; we did not adopt GPT's favourable label as ground truth. Several GPT responses say vedha information is missing despite receiving all current transit houses. This is a review of reasoning quality and factual consistency, not a vote or predictive-accuracy evaluation.

**Content verdict: stronger temporal grounding, still too repetitive for full rollout.** Across these 60 cases: 40 mixed, 15 limited, four effort, one supportive. There are only four distinct main direction texts; the named reasons and period details vary more. This is a small fixture set, not a population distribution. Changing dates is necessary but not sufficient to make a reading useful. Broader natal associations/dispositors and functional relationships, topic-specific explanations of conflicting signals, and more differentiated directions need review before extending to all nine purposes. A limited calculation does not instruct a person to wait years until the next dasha.

## Other-platform evidence

The two public AstroSage reports provide the public birth inputs and natal communication references: [sample A](https://cdn.astrosage.com/pdf/ca_report_pro_en.pdf), [sample B](https://www.astrosage.com/pdf/as-career-report-en.pdf). They describe career tendencies/options. Neither answers our chosen question at the same current/future instants, so they cannot validate this timing model. No AstroTalk consultation was obtained or fabricated.

## Verification

| Check | Result |
|---|---|
| TypeScript | Pass |
| Entire engine suite | 474/474 pass |
| Ask suite | 47/47 pass |
| Focused Prashna/report/refresh Jest | 12/12 pass |
| Final focused engine rerun after limited-copy/purity change | 20/20 pass |
| 60-reading artifact audit | As-of, signal references, natal lord/occupancy facts, source status each profile's period transition, and changed Jupiter houses across the ingress pass; see [verification.json](verification.json) |
| External response cache check | All six stored requests exactly match current facts, model and instructions |
| Launch import budget | **Fails:** 7,131,753 bytes / 644 modules against 7,000,000; unchanged from pre-pilot worktree. Prior HEAD baseline was already 7,131,688. No threshold changed. |
| Git whitespace | `git diff --check` pass |

These checks validate calculation/integration contracts, not Jyotish truth or full release readiness. Full app regression, Android, physical-device performance and VoiceOver reading order have not been certified here. The clean-state Maestro flow was updated but not rerun from onboarding; native focused flows reused isolated synthetic QA profiles.

## Native UX review

Current worktree JavaScript ran in the existing iOS debug shell (`com.prashantsharma.vedansh`, 1.4.8 build 63), using isolated QA simulators on iOS 26.4. No OTA/release was published. Standard iPhone 17 is 402 points wide; compact iPhone SE is 375 points wide. Native captures were inspected, not inferred from Jest.

1. **Question selection — healthy at standard size.** Filled radio, active border and wrapped labels clearly identify the selected question. Compact capture: [Hindi question + current phase](screenshots/hi-375/screenshots/01-current-phase.png).
2. **Current phase — layout healthy; content needs deeper differentiation.** English and Hindi headings, named periods and dates wrap inside their cards: [English](screenshots/en-final/screenshots/01-current-phase.png), [Hindi](screenshots/hi-375/screenshots/01-current-phase.png).
3. **Why and direction — readable, too repetitive in some readings.** No observed horizontal body clipping in the checked 402- and 375-point English/Hindi captures. The [compact English set](screenshots/en-375/screenshots/01-current-phase.png) also completed after the final code changes. Separate graha explanations can repeat the same topic wording: [Hindi reasons](screenshots/hi-375/screenshots/02-why.png), [Hindi switch direction](screenshots/hi-402/screenshots/03-guidance.png). The first compact direction capture was invalidated by a development Fast Refresh resetting the question to general; it is not evidence of the selected switch answer.
4. **Next period — healthy layout and honest date meaning.** Both language cards distinguish a computed period change from an assured result: [English](screenshots/en-final/screenshots/04-next-change.png), [Hindi](screenshots/hi-375/screenshots/04-next-change.png).
5. **Expandable basis — healthy standard-size wrapping.** Long period labels and Hindi chips wrap inside the card: [English](screenshots/en-final/screenshots/05-basis.png), [Hindi](screenshots/hi-375/screenshots/05-basis.png). Advanced prose is intentionally denser. Screenshots cannot establish screen-reader order or complete accessibility compliance.

A screenshot that starts midway through a card reflects the current scroll viewport, not text truncated inside the card. Earlier `en-402` captures predate the node/next-period copy correction and are retained only as iteration evidence; `en-final` is the accepted English set. The 375-point Hindi flow also completed at iOS `accessibility-large`: [body](screenshots/hi-375-large-final/screenshots/01-current-phase.png), [wrapped handoff button](screenshots/hi-375-large-final/screenshots/03-guidance.png), [basis](screenshots/hi-375-large-final/screenshots/05-basis.png). Body text and actions reflow without observed horizontal clipping. Long cards require scrolling; these are viewport captures, not complete-card captures. The initial script failed because it tried to tap an offscreen question; adding an explicit scroll completed the same flow. The simulator text size was restored afterward. Advanced chips remain much smaller than body text at this setting, so their readability deserves a dedicated accessibility follow-up.

6. **Business and export handoff — navigation healthy.** [Business direction](screenshots/business-en/screenshots/02-business-direction.png) reaches the full report and [warned share preview](screenshots/business-en/screenshots/04-warned-share.png). The warning explicitly names birth details and selected question/guidance; full-text sharing is available. No OS share destination was selected and nothing was transmitted. The first report capture caught a navigation transition and is rejected as layout evidence. A follow-up initially used the visible caption rather than the accessible label for Cancel; its retry targets `Cancel sharing` and passed. The [settled report](screenshots/business-en/screenshots/05-report-settled.png) was then inspected and accepted.

## Reproduce

From `mobile/`: `npx tsx scripts/compare-prashna-phase.mts`. From repository root: `python3 mobile/scripts/render-prashna-phase-comparison.py`. The explicit external evaluator is `python3 mobile/scripts/compare-prashna-gpt.py --phase --run-gpt`; it reuses matching records and refuses stale ones. Fresh records make paid API calls and require `OPENAI_API_KEY`.

Native flows and test logs are under this evaluation directory. Launch Metro on port 8084 for the saved focused native flows. They assume the isolated Aarav fixture and the noted language/font preference; they do not create or change real user profiles.

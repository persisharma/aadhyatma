# Question-specific current-phase answers — 25 September 2026

The job-switch answer pattern now covers every question in six adult Prashna topics: career, business, study, money, marriage, and travel. The answer card states the selected question and a qualified recommendation. The next card separates chart, running dasha and current transit signals in favour from reasons to pause, with the actual house or period reference for each. A specific action follows. The existing next-Antardasha preview and expandable technical basis remain available. The same selected answer is used by Prashna, explicit-question Ask, and the report text handoff.

Health, mental health and children/fertility remain outside the current-phase decision. They now lead with a direct statement of what a chart cannot assess or time, followed by the existing bounded guidance. Minor age gates are unchanged.

## Synthetic person and date comparison

The table reports the tone for six selected questions, calculated at 06:30 UTC on each date. Names and birth details are synthetic fixtures from `mobile/scripts/compare-prashna-phase.mts`. Each cell is an actual `buildPrashnaReading(..., { gocharScanDays: 0 })` result, not a proposed answer. `M` = mixed support and challenge, `E` = extra effort, `L` = no direct timing link in the checked rules.

| Person | Date | Job switch | Start business | Exam prep | Money | Marriage | Travel |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Aarav | 2026-09-25 | M | L | M | M | M | E |
| Aarav | 2028-01-17 | L | M | L | L | M | L |
| Meera | 2026-09-25 | M | M | M | M | M | M |
| Meera | 2028-01-17 | M | M | M | L | M | M |
| Isha | 2026-09-25 | M | M | M | M | M | L |
| Isha | 2028-01-17 | L | L | M | M | M | M |

For example, Aarav's 2026 job-switch answer is “Search now; hold off on resigning,” while his 2028 answer says job-switch timing is unclear. In 2026, business-start timing is unclear for him, but the 2028 answer is “Run a small pilot; defer a large investment.” These distinctions come from the question's house priority, natal chart, running maha/antar and that day's Jupiter/Saturn gochar. The practical steps require real offers, customers, practice results, finances, consent, or travel arrangements before a consequential decision.

The sample is deliberately small and heavily mixed: 26 of 36 cells are mixed, nine limited, one effort, and none supportive. It verifies differences across questions and dates, **not** predictive accuracy or useful separation for a wider population. The simplified rules and source review remain incomplete (`PHASE_SOURCE.verified=false`); see the [convention register](../../roadmap/conventions/prashna-phase-v1.md). The earlier [GPT and public-report comparison](../prashna-phase-2026-09-21/README.md) used different selected questions and dates, so it is a reasoning check rather than a matched benchmark for this expansion.

## Native reading check

The dedicated iPhone 17 iOS 26.4 QA simulator `913FA15C-3750-4E34-97BA-A39A33410600` ran the [English](flows/all-topics-en.yaml) and [Hindi](flows/all-topics-hi.yaml) flows for exam prep, money, marriage and travel. The synthetic Aarav profile was the only selected profile. Screenshots: [English study](screenshots/en/01-study-exam.png), [money](screenshots/en/02-money.png), [marriage](screenshots/en/03-marriage.png), [travel](screenshots/en/04-travel.png); [Hindi study](screenshots/hi/01-study-exam.png), [money](screenshots/hi/02-money.png), [marriage](screenshots/hi/03-marriage.png), [travel](screenshots/hi/04-travel.png). The job-switch [English and Hindi captures](../prashna-job-decision-2026-09-24/README.md) were refreshed after this change, and both flows passed again. Text wrapped within cards and controls remained aligned; no horizontal clipping was observed. The study screenshots are scrolled to the evidence card, so they do not show the hero.

Focused engine, Ask, screen and text-handoff tests and TypeScript typecheck passed. The Ask corpus returned 222/223 hits with zero wrong answers; the one unrelated Navratri bhog query still abstains. Native review covers these four example topics on one iOS device and two languages; it is not a full device-size, Android, or outcome-validation sweep.

---
title: Rating and social follow prompts
type: subsystem
sources: [mobile/src/data/ratingPrompt.ts, mobile/src/data/engagementPrompts.ts, mobile/src/contexts/RatingPromptContext.tsx, mobile/src/components/RatingPromptSheet.tsx, design.md, RULEBOOK.md]
last_verified_date: 2026-11-07
confidence: high
status: current
---

## Summary

Rating and social following share `RatingPromptProvider`, the lightweight `ratingAsk` action bridge and one modal. Two launches OR two active days OR a completed share/save/practice action earn the first rating prompt. Dismissals use two days OR next completed action; low stars without a store handoff retain 30 days.

After a successful store URL dispatch, automatic rating ends and the next completed action earns social following. Store return alone does not open social. Instagram and configured Facebook each have a link and an explicit Already following confirmation. Page opening does not prove following. All configured confirmations end that campaign. Legacy handoffs advance to social; legacy declines stay suppressed.

## Working rules

- Keep the same delay, launch-selection ownership, brand/Explore/share visibility and foreground guards; recheck on timer completion.
- Persist only in the existing rating record, serialize writes and await hydration. Stop pending timers/listeners on unmount. A failed URL must not advance review state.
- Use the four authored languages and script fonts. Modal content scrolls for compact/enlarged system text; never truncate labels or disable scaling.
- `engagementPrompts.ts` is the owner configuration. Supply the exact verified Facebook URL before enabling that row. HTTPS app/browser fallback requires no native scheme queries.
- To re-ask social, change `socialCampaignId` and deliver the updated bundle. To restart review eligibility, change `reviewCampaignId`; social confirmations survive. Change both to restart both stages. Each stored campaign migrates once, without clearing any unrelated app data. These are bundle controls, not an instant remote dashboard.
- Manual More rating remains rating. No automatic posting/following, native dependency, release or version change is introduced.

## Verification

Pure campaign/gate tests, provider/action integration and four-language M/L component coverage live beside the source. `social-follow-smoke.yaml` walks a real store handoff → new save → social dismissal → next save → confirmations → cold restart. YAML parsing and mocked layout tests do not establish installed iOS/Android appearance, actual page handoff or ANR safety; retain pending native/device evidence in the PR.

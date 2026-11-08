---
title: प्रथा और मान्यता — Sanatan Parichay customs
type: subsystem
sources: [mobile/src/data/pratha/index.ts, mobile/src/data/pratha/presentation.ts, mobile/src/screens/PrathaScreen.tsx, mobile/src/screens/PrathaReaderScreen.tsx, mobile/src/components/PrathaCards.tsx, mobile/src/screens/SanatanParichayScreen.tsx]
last_verified_date: 2026-11-08
confidence: high
status: current
---

## Summary

PRD-46 is the customs collection inside Sanatan Parichay. All 208 bilingual
records/305 stories and their provenance remain: 19 verified entries are visible,
189 drafts are hidden. This integration does not re-verify the remaining content.

## Details

Home → Sanatan → Customs & traditions opens Pratha. Sanatan search includes
verified customs in the four displayed scripts. The Tulasi introduction and its
closing reader page link to K6 instead of duplicating its stories. Saved-only
Sanatan filters do not include unsaved customs. Existing learning storage is intact.

Home and Panchang register Pratha/PrathaReader lazily; Vrat uses the latter stack.
No More row/route or separate Home Discover card. Back remains local. Observance
Detail has up to three Why questions between story and instructions; Panchang
has a lunar-month card only with three matching verified entries.

The hub defaults to all questions year-round. Explicit month-card entry selects
that month. Only populated categories/qualifying month chips appear. Rows use
ListingCardFrame and complete, growing script-aware text.

`prathaPages` is the shared reader/speech/share projection: practice, complete
stories (with concise folk/regional context), meaning, optional bodh and footer.
Research tier/canon/URLs remain internal under RULEBOOK §11.16. Real Gita/Valmiki,
katha, vidhi and temple hand-offs remain. The reader uses settled paging rather
than frame-by-frame state updates and wrapping playback controls.

Registry axes, stable IDs, source verification gates and chapter anchors are
unchanged. RULEBOOK §34 owns the customs contract; §32 remains Sanatan.

## Dependencies

[[subsystems/sanatan-parichay]], [[readers]], [[panchang]], [[share]], [[pitru-shiksha]].

## Gotchas

The ten-verified-Kartik pilot gate is independent of today's month. A sparse month
can have individually readable entries while its month card stays absent. Draft
IDs never expose prose or share controls. The old HTML prototype is historical.
Native visual/playback/share/ANR evidence remains separate from Jest/YAML parsing;
see docs/reviews/2026-11-08-pratha-sanatan-adaptation.md.

---
title: Puja Vidhi
type: subsystem
sources: [mobile/src/data/vidhi/types.ts, mobile/src/data/vidhi/index.ts, mobile/src/data/vidhi/checklistStore.ts, mobile/src/screens/VidhiCatalogScreen.tsx, mobile/src/screens/VidhiDetailScreen.tsx, mobile/src/screens/VidhiConductScreen.tsx, mobile/src/screens/__tests__/VidhiScreens.test.tsx, mobile/src/data/__tests__/vidhiContent.test.ts, docs/roadmap/prds/19-puja-vidhi.md, design.md]
last_verified_date: 2026-08-13
confidence: high
status: current
---

## Summary

Puja Vidhi provides offline, festival-linked household puja guidance. Phase 1 ships Shri
Satyanarayan Puja with a day-before samagri checklist and a festival-day conduct reader. The
feature deliberately reuses the app's established interaction language: Today's Practice for
preparation and the Daily Bhakti/readers card + horizontal pager for conduct.

## Details

**Data and state.** `data/vidhi/` registers `VidhiEntry` records containing bilingual titles,
festival/deity links, duration, samagri, phased steps, optional transcribed mantras and shipped-text
references. Source, citation URL and convention fields are retained for content review but never
render. `checklistStore.ts` persists checked samagri by vidhi + festival date and conduct progress
by vidhi + civil day under `@vedansh/vidhi-checklist`.

**Entry surfaces.** `VidhiCatalogScreen` is the always-available catalog. Festival observances with
a `vidhiId` expose the `॥ पूजा विधि` action and route to `VidhiDetailScreen`. The catalog and detail
screens publish titles, step count, duration and content capabilities, but no source-verification
or tradition attribution.

**Preparation.** The `तैयारी` segment uses a Today's Practice-style summary accordion: completed
count, remaining count, progress track and rotating caret above the samagri ledger. Ledger rows use
the routine 28 px check circle, bilingual item/meta copy, quantity and optional chips. Checked state
is occurrence-scoped; the list can be shared as plain text.

**Conduct.** `VidhiConductScreen` is a horizontal, `pagingEnabled` FlatList with one Daily
Bhakti-style reading card per step. Cards contain a phase pill, step number, title, instruction,
the shared reader ornament, and either an inline Devanagari + IAST mantra section or a hand-off to
an already-shipped katha/section reader. The read-aloud control is mounted once at screen level.
Left/right swipe is the only page-turn interaction: there are no previous/next buttons and no
swipe-helper text. Reader dots sit at the bottom, with the current dot stretched; the terminal
completion page has no dots and shows a quiet static ॐ seal.

## Dependencies

- [[readers]] — horizontal paging, bottom dots, reading typography, shared header and read-aloud.
- [[routine]] — summary accordion, progress treatment and checklist-row language.
- [[panchang]] — festival observance entry and `vidhiId` lookup.

## Gotchas

- Provenance is mandatory in data and tests but private in UI. Do not pass `source`, `sourceUrl`,
  `conventionLineHi` or `conventionLineEn` into renderable conduct-page objects.
- The FlatList data includes a completion sentinel after the final step. Clamp initial indices
  against `pages.length`, not `steps.length`, or a direct completion route opens the last step and
  incorrectly leaves the dots visible.
- Completion clears saved conduct progress. Leaving on a step persists that step for the current
  civil day; samagri completion is separately keyed by festival occurrence.
- Shipped kathas and sections are linked by reference and never copied into vidhi data.

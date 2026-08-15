---
title: Puja Vidhi
type: subsystem
sources: [mobile/src/data/vidhi/types.ts, mobile/src/data/vidhi/index.ts, mobile/src/data/vidhi/satyanarayan-puja.ts, mobile/src/data/vidhi/diwali-lakshmi-ganesh-puja.ts, mobile/src/data/vidhi/ganesh-chaturthi-sthapana.ts, mobile/src/data/vidhi/navratri-ghatasthapana.ts, mobile/src/data/vidhi/karwa-chauth-puja.ts, mobile/src/data/vidhi/maha-shivaratri-puja.ts, mobile/src/data/vidhi/checklistStore.ts, mobile/src/screens/VidhiCatalogScreen.tsx, mobile/src/screens/VidhiDetailScreen.tsx, mobile/src/screens/VidhiConductScreen.tsx, mobile/src/screens/ObservanceDetailScreen.tsx, mobile/src/screens/HomeScreen.tsx, mobile/src/screens/SearchScreen.tsx, mobile/src/data/searchIndex.ts, mobile/src/data/routine/types.ts, mobile/src/data/routine/units.ts, mobile/src/components/AddToRoutineSheet.tsx, mobile/src/navigation/entryRoutes.ts, mobile/src/navigation/types.ts, mobile/src/navigation/HomeStackNavigator.tsx, mobile/src/navigation/PanchangStackNavigator.tsx, mobile/src/navigation/__tests__/vidhiBackNavigation.test.ts, mobile/src/screens/__tests__/VidhiScreens.test.tsx, mobile/src/data/__tests__/vidhiContent.test.ts, docs/roadmap/prds/19-puja-vidhi.md, design.md]
last_verified_date: 2026-08-15
confidence: high
status: current
---

## Summary

Puja Vidhi provides offline, festival-linked household puja guidance. The v1 registry ships six
complete guided procedures: Shri Satyanarayan, Diwali Lakshmi-Ganesha, Ganesh Chaturthi Sthapana,
Navratri Ghatasthapana, Karwa Chauth, and Maha Shivaratri — 96 steps and 12 transcribed mantras
total after the Phase 2B pass (Aug 2026). The feature deliberately
reuses the app's established interaction language: Today's Practice for preparation and the Daily
Bhakti/readers card + horizontal pager for conduct. Phase 2B shipped every deferred surface:
search rows, the Observance Detail "How to observe" card, the Home DISCOVER spotlight,
keep-awake in conduct mode, and Add-to-Routine for recurring vidhis.

## Details

**Data and state.** `data/vidhi/` registers `VidhiEntry` records containing bilingual titles,
festival/deity links, duration, samagri, phased steps, optional transcribed mantras and shipped-text
references. Source, citation URL and convention fields are retained for content review but never
render. `checklistStore.ts` persists checked samagri by vidhi + festival date and conduct progress
by vidhi + civil day under `@vedansh/vidhi-checklist`.

**Stacks.** The three vidhi routes are registered on **both** the Home stack and the Panchang stack,
declared once in the shared `VidhiStackParamList` that each stack's param list intersects
(`navigation/types.ts`), with the screens typed against that shared list. Every door pushes in place:
Home's DISCOVER card, search rows and routine items on the Home stack; the day-panel pill, the
Vrat & Parv tile and Observance Detail on the Panchang stack. Before Aug 2026 the Home-side doors
did a cross-tab `navigate('PanchangTab', panchangTabTarget(…))`, so back from the catalog popped to
the Panchang calendar — a tab the user never chose, whose default mode has no vidhi door.

**Entry surfaces.** `VidhiCatalogScreen` is the always-available catalog. Festival observances with
a `vidhiId` expose the `॥ पूजा विधि` action and route to `VidhiDetailScreen`. The catalog and detail
screens publish titles, step count, duration and content capabilities, but no source-verification
or tradition attribution. The six hooks are Satyanarayan/Purnima, Diwali, Ganesh Chaturthi,
Navratri Begins, Karwa Chauth, and Maha Shivaratri. Phase 2B doors: each vidhi contributes one
**search section row** (`searchIndex.buildSectionEntries` appends them; sourceId = vidhi id; no
verse rows; `SearchScreen.openSection` opens `VidhiDetail` on the Home stack); the
**Observance Detail** screen renders a "पूजा विधि · How to observe" card for rules whose
`vidhiId` resolves (carrying the next occurrence's `dateMs`); and Home's DISCOVER carousel
carries a पूजा विधि spotlight opening the catalog.

**Routine integration (Phase 2B).** `RoutineItemKind` gains `'vidhi'` — see [[routine]] for the
manual-mark-only completion semantics. The detail header offers `AddToRoutineButton` only when a
`festivalIds` rule has `recurrence: 'monthly'`.

**Preparation.** The `तैयारी` segment uses a Today's Practice-style summary accordion: completed
count, remaining count, progress track and rotating caret above the samagri ledger. Ledger rows use
the routine 28 px check circle, bilingual item/meta copy, quantity and optional chips. Checked state
is occurrence-scoped; the list can be shared as plain text.

**Conduct.** `VidhiConductScreen` is a horizontal, `pagingEnabled` FlatList with one Daily
Bhakti-style reading card per step. The screen holds `useKeepAwake()` (`expo-keep-awake`,
added Phase 2B) for the whole session and announces it for screen readers once on entry. Cards contain a phase pill, step number, title, instruction,
the shared reader ornament, and either an inline Devanagari + IAST mantra section or a hand-off to
an already-shipped katha/section reader. The read-aloud control is mounted once at screen level.
Left/right swipe is the only page-turn interaction: there are no previous/next buttons and no
swipe-helper text. Reader dots sit at the bottom, with the current dot stretched; the terminal
completion page has no dots, does not repeat already-completed katha/aarti actions, and shows only
the quiet static ॐ seal with the completed-step count.

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
- Shipped kathas and sections are linked by reference and never copied into vidhi data. The
  Phase 2B liturgy hand-offs follow this: Ganesha vandana → `ganesh-stotram`, Devi stuti →
  `durga-stotram`, deepa shloka → `sandhya-deepam`. Hand-off captions are category-aware
  (कथा / आरती / पाठ) — a stotram/sanskar ref must not say "आरती".
- The one Phase 2B inline mantra addition is the Shivaratri Panchakshara (`ॐ नमः शिवाय`) —
  transcribable because the identical rendering already ships verified three times in-repo
  (japam.json, shiv-chalisa.json, shiva-strotam ch. 1). Longer per-deity upachara formulae for
  the five non-Satyanarayan vidhis stay omitted: composing them by analogy violates §11.3.
- Canonical-edition review state is honest per entry: a pending Gita Press/Dharmasindhu check stays
  in private source metadata, while unverified variable liturgy remains instruction-only.
  Clearing it (and authoring the Phase 3 shraddha vidhi) requires an authoring environment with
  content egress — archive.org/DrikPanchang were unreachable on 2026-08-12 and again on
  2026-08-14; each entry's `canonicalEditionStatus` records the dated attempts.
- Vidhi search rows change `searchIndex` section count to `library.length + VIDHI_ENTRIES.length`
  — `searchIndex.test.ts` pins this; a new vidhi automatically gains a row, no index code change.
- The dual-stack registration makes "which stack am I on?" a runtime question for the conduct
  screen's shipped-text hand-off: the readers live only on the Home stack. Route it through
  `navigateToHomeStackTarget` (`navigation/entryRoutes.ts`), which checks
  `getState().routeNames` and pushes in place or falls back to `HomeTab`. A hardcoded
  `navigate('HomeTab', …)` rebuilds the stack and loses the puja the user was mid-way through.
- A new vidhi route must be added to `VidhiStackParamList` **and** both navigators. The shared type
  makes `tsc` catch a missing param declaration but not a missing `Stack.Screen` — that is what
  `navigation/__tests__/vidhiBackNavigation.test.ts` pins.

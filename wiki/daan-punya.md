---
title: Daan Punya
type: subsystem
sources: [mobile/src/data/daan/, mobile/src/contexts/DaanLedgerContext.tsx, mobile/src/screens/DaanPunyaScreen.tsx, mobile/src/screens/DaanJourneyScreen.tsx, mobile/src/screens/DaanLedgerScreen.tsx, mobile/src/screens/DaanEntryScreen.tsx, mobile/src/screens/DaanDirectoryScreen.tsx, mobile/src/screens/DaanDirectoryDetailScreen.tsx, mobile/src/screens/DaanKathaScreen.tsx, mobile/src/screens/ObservanceDetailScreen.tsx, mobile/src/navigation/types.ts, docs/roadmap/prds/26-daan-punya.md, RULEBOOK.md, design.md]
last_verified_date: 2026-09-05
confidence: high
status: current
---

## Summary

दान-पुण्य (PRD-26) is the giving layer: an **educate-first** surface (verse spine
RV 10.117.6 / TU 1.11.3 / Gita 17.20 / Anuśāsana-parva + five teaching-kathas),
a **private on-device ledger** (tithi-stamped, gupt-daan first-class, no totals
ever), and a **verified giving directory** whose external hand-off is the
*terminal* act of a guided journey — never a button on the home. Design spec:
design.md §72; content contract: RULEBOOK §27; product doc:
`docs/roadmap/prds/26-daan-punya.md` (+ `docs/daan-punya-prototype.html` for the design/content review, and
`docs/daan-punya-shipping.html` — an operable walkthrough of the shipped scope whose
content is generated from the registries, so it cannot drift from the code).

## Shape

- **Data** — `mobile/src/data/daan/`: `causes.ts` (the nine-प्रयोजन cause axis,
  each carrying its **mahatva** + optional paired citation/source, plus the
  honest text-intent purpose bridge), `principles.ts` (verse/teaching rows),
  `occasions.ts` (~17 day rows keyed to real solver rule ids), `vaar.ts`
  (7-row weekly table, shared with PRD-21), `kathas.ts` (Karna, Rantideva,
  Shibi, Bali–Vamana, Sudama — full bilingual retellings), `directory.ts`
  (9 verified orgs: Akshaya Patra, Annamrita, TTD Annaprasadam, Goonj,
  Belur Math, e-RaktKosh, HelpAge India, CRY, Blue Cross of India), `ledger.ts` (pure core: validation, gupt
  sanitizer, tithi stamp, CSV), `index.ts` (verified-only accessors +
  `getDaanOccasionForRule`).
- **State** — `DaanLedgerContext` (AsyncStorage `@vedansh/daan-ledger:v1`,
  versioned payload, PitruSmaran hydration pattern).
- **Screens** — DaanPunya (educate home, More-only), DaanJourney (5-step
  stepper), DaanLedger + DaanEntry, DaanDirectory + DaanDirectoryDetail
  (interstitial → `Linking.openURL`), DaanKatha. All but DaanPunya registered
  on More AND Panchang stacks (`DaanStackParamList` in navigation/types.ts).
- **Doors** — More hub साधना row (`more-daan-punya`); Observance Detail's
  **last** section (`observance-daan-door`, renders only when
  `getDaanOccasionForRule(ruleId)` matches).

## Working Rules

- **§2.7 IA contract is load-bearing**: the home has zero give affordances;
  the directory is reachable ONLY from the journey's last step; record always
  precedes the hand-off. `DaanScreens.test.tsx` pins it — do not add doors.
- **Exact rule ids beat suffix families** in occasion matching
  (`shattila-ekadashi` > `-ekadashi`; `makar-sankranti` > `-sankranti`).
  Uncovered days render nothing — never a placeholder.
- **Gupt guarantee is two-sided**: write-side `sanitizeLedgerEntry` strips
  note/amount/occasion; read-side `isDaanLedgerEntry` rejects unsanitized
  gupt rows. The CSV export keeps gupt rows bare.
- **No totalling helper may be added** to `ledger.ts` (RULEBOOK §27.3).
- **Two axes**: ledger `DaanCategory` = the dravya given; `DaanCause` = whom it
  serves, and the द्वार's only grouping. Cause chips derive from the rows
  present (never an empty shelf); occasions carry `causes` and the journey's
  terminal door pre-filters the द्वार to them.
- **Purpose bridge is विद्या→knowledge and आरोग्य→health ONLY** — never
  wealth/prosperity (fruit-promise). The `PurposeList` door opens the educate
  home, never the directory; a source-shape test pins it.
- **Explain the daan, don't profile the org (§27.14)**: the mahatva lives on
  the CAUSE and renders above the places in both grouping states. A cause whose
  mahatva makes a textual claim carries `citeHi`/`citeEn` + `source`; one
  written as plain tradition prose carries neither — all three fields travel
  together or none do (pinned by test).
- Directory rows are THIN: name, ONE `about` line, ONE `officialUrl` (own
  domain, https, no UPI). **No** registration/80G text, account numbers, or
  scale figures — `types.ts` is grepped by test for the banned field names.
  `verifiedOn`/`source` are editorial only: never rendered, and `verifiedOn`
  > 18 months drops the row to draft via `isOrgRowStale`.

## Gotchas

- **Launch-graph budget**: `data/daan/index.ts` loads principles/occasions/
  kathas/directory through `require()` thunks (valmiki/pincodes pattern) —
  DaanPunyaScreen is imported eagerly by the More stack, so a static
  re-export puts the whole corpus on cold start (`launchGraph.test.ts`
  caught this at the 2026-09-03 merge). Keep new registries behind thunks.

- `vidhiBackNavigation.test.ts` pins the source shape of
  `navigation/types.ts` — intersecting a new param list into
  `MoreStackParamList` needs that regex loosened (done for
  `DaanStackParamList`, 2026-09-01).
- Screen tests mock `@/panchang/usePanchang` (the observance resolver runs
  through InteractionManager + the observance store — slow/undeterministic
  under Jest otherwise).
- Occasion `kathaId`s are katha REGISTRY ids (`festivals.ts` `katha({id})`)
  and must resolve through `getKathaContent` — pinned by the referential-
  integrity test.
- The release that first carries the directory must be a STORE release
  (PRD-26 §6.1 review-visibility gate) even though the code is OTA-safe JS.

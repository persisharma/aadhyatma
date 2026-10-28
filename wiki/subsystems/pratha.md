---
title: प्रथा और मान्यता ("ऐसा क्यों?")
type: subsystem
sources: [mobile/src/data/pratha/types.ts, mobile/src/data/pratha/registry.ts, mobile/src/data/pratha/index.ts, mobile/src/data/pratha/masa.ts, mobile/src/data/pratha/__tests__/prathaContent.test.ts, mobile/src/data/__tests__/launchGraph.test.ts, mobile/jest.config.js, docs/roadmap/prds/46-pratha-manyata.md, docs/pratha-manyata-prototype.html, RULEBOOK.md]
last_verified_date: 2026-10-28
confidence: high
status: current
---

## Summary

PRD-46 answers "ऐसा क्यों करते हैं?" for famous customs: what is done, the story or regional stories behind it, what it means, and an always-rendered source tier. Phase 0 is built. The registry `mobile/src/data/pratha/` holds all 208 PRD Appendix A rows (304 stories) in Hindi and English. Every row is `status: 'draft'`, so nothing renders yet. No screen reads the registry; Phase 1 adds the hub, reader, Observance Detail card and Panchang masa card (clickable prototype: `docs/pratha-manyata-prototype.html`). Contract: RULEBOOK §32.

## Details

- **Shape** (`types.ts`): `PrathaEntry` {id = catalogue id (K1, MG6, PN2 …), axis, kind `pratha|manyata|bodh`, phase 1–4, question/practice/bhav/bodh Hi+En, kathas[], anchors, status, source}. Each `PrathaKatha` has a `tier` (`shastra|purana|lok|itihas`), optional region, title, body paragraphs, canon line Hi+En, and an optional `ref` into a bundled reader.
- **Axes → files:** `masa` (99 rows; festival customs live here, keyed by month + `ruleIds`), `vaar`, `nitya`, `pujaNiyam`, `prakriti`, `sanskar`, `tirth`, `bodh`. `registry.ts` joins them and holds pure selectors (`selectById/ByAxis/ForRule/ForMasa/ForVaar`, `verifiedOnly`).
- **Accessors** (`index.ts`): `getAllPratha`, `getPratha`, `getPrathaByAxis`, `getPrathaForRule`, `getPrathaForMasa(lunarMonth, isAdhik)`, `getPrathaForVaar(weekday)`, `hasPratha()` (the one door predicate). All are verified-only, behind a `require('./registry')` thunk.
- **Anchors:** `masa` uses the engine numbering (Chaitra = 1 … Kartik = 8 … Phalgun = 12) or `adhikMasa`. `vaar` is the JS weekday (Sunday = 0). `ruleIds`, `kathaIds`, `bhogIds`, `vidhiIds`, `daanOccasionIds`, `theerthIds`, `libraryIds` and `prathaIds` are each checked against their real registry by test; `pitru: true` hands off to [[pitru-shiksha]].
- **Drafts** carry `source.verificationNote` = `2026-10-28: DRAFT — NOT VERIFIED … To open: <every canon line>` and `source.confidence` (the catalogue's Certain/Likely/Guessing tag).

## Dependencies

[[panchang]] (rules, katha library, masa numbering), [[pitru-shiksha]] (pattern parent; owns Pitru Paksha customs), [[bhog-naivedya]] (the reasonless `doNotOffer` rows that pratha explains), [[daan-punya]], [[puja-vidhi]], [[ask]] (Phase 3 `pratha.why`).

## Gotchas

- **Every row is an unverified, app-authored retelling.** Rows were drafted from the PRD catalogue without opening any source (outbound access is blocked by policy). Verify one row at a time: open two sources per canon line, correct the copy, write a dated note without "DRAFT", flip `status`. A web-search summary is not an opened source.
- **The axis files were generated once** from the prototype's JSON (2026-10-28). They are now canonical; edit them by hand and do not regenerate.
- **`ruleIds` on festival rows were derived** from the row's katha link: the observances whose `kathaId` is that katha, skipping month-wide mahatmyas and kathas shared by more than three rules. A custom tied to a mahatmya (e.g. K1 Kartik deepdaan) therefore has no `ruleIds` and surfaces through `masa` instead.
- **Bundled Valmiki sarga 6.107 (Aditya Hridaya) is a defective corpus row.** It has collapsed spacing, and its meanings are shifted by one verse. W8 is meaning-only, and the test forbids any `ref` into 6.107.
- **Gita refs may cite a range:** PN15/BD9 point at 17.8 with the canon "17.7–10"; the test accepts a range containing the verse.
- **The stance guard covers only the row's own voice** (`practice`, `bhav`, `bodh`), not katha bodies, where a curse is narrative. "mustard oil" passes because the guard matches `\bmust\b`.
- **Jest `testMatch`** gained `src/data/pratha/__tests__/**`. Do not add this suite to `test:data`.

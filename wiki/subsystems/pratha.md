---
title: प्रथा और मान्यता ("ऐसा क्यों?")
type: subsystem
sources: [mobile/src/data/pratha/types.ts, mobile/src/data/pratha/registry.ts, mobile/src/data/pratha/index.ts, mobile/src/data/pratha/masa.ts, mobile/src/data/pratha/__tests__/prathaContent.test.ts, mobile/src/data/__tests__/launchGraph.test.ts, mobile/jest.config.js, docs/roadmap/prds/46-pratha-manyata.md, docs/pratha-manyata-prototype.html, RULEBOOK.md]
last_verified_date: 2026-10-28
confidence: high
status: current
---

## Summary

PRD-46 answers "ऐसा क्यों करते हैं?" for famous customs: what is done, the story or regional stories behind it, what it means, and an always-rendered source tier. The registry `mobile/src/data/pratha/` holds 208 rows / 305 stories in Hindi and English: 19 verified, 189 hidden drafts. Phase 1 implements the hub, paged reader, Observance Detail question card and Panchang month card. The two qualifying months are Kartik (13) and Margashirsha (3); Paush, Magh and Phalgun each have one verified entry and no month card. The monthly source-review backlog is not complete. Native smoke execution remains pending. Contract: RULEBOOK §32.

## Details

- **Shape** (`types.ts`): `PrathaEntry` {id = catalogue id (K1, MG6, PN2 …), axis, kind `pratha|manyata|bodh`, phase 1–4, question/practice/bhav/bodh Hi+En, kathas[], anchors, status, source}. Each `PrathaKatha` has a `tier` (`shastra|purana|lok|itihas|kavya|agama`), optional region, title, body paragraphs, canon line Hi+En, and an optional `ref` into a bundled reader.
- **Axes → files:** `masa` (99 rows; festival customs live here, keyed by month + `ruleIds`), `vaar`, `nitya`, `pujaNiyam`, `prakriti`, `sanskar`, `tirth`, `bodh`. `registry.ts` joins them and holds pure selectors (`selectById/ByAxis/ForRule/ForMasa/ForVaar`, `verifiedOnly`).
- **Accessors** (`index.ts`): `getAllPratha`, `getPratha`, `getPrathaByAxis`, `getPrathaForRule`, `getPrathaForMasa(lunarMonth, isAdhik)`, `getPrathaForVaar(weekday)`, `hasPratha()` (ten verified Kartik rows), `hasPrathaForMasa()` (pilot open and at least three matching rows). All are verified-only, behind a `require('./registry')` thunk.
- **Anchors:** `masa` uses the engine numbering (Chaitra = 1 … Kartik = 8 … Phalgun = 12) or `adhikMasa`. `vaar` is the JS weekday (Sunday = 0). `ruleIds`, `kathaIds`, `bhogIds`, `vidhiIds`, `daanOccasionIds`, `theerthIds`, `libraryIds` and `prathaIds` are each checked against their real registry by test; `pitru: true` hands off to [[pitru-shiksha]].
- **Story provenance:** each verified katha has two actually opened, independent published `referenceUrls`; the row includes their union. `verification.ts` rejects missing story evidence and pending canon locators. Publication independence remains an editorial judgment. See `docs/content-parity/pratha-verification-2026-10-28.md` for semantic/source changes and remaining gaps.
- **Drafts** carry `source.verificationNote` = `2026-10-28: DRAFT — NOT VERIFIED … To open: <every canon line>` and `source.confidence` (the catalogue's Certain/Likely/Guessing tag).

## Phase 1 surfaces

`PrathaScreen` has eight tabs, thirteen month chips and cross-tab verified search. The current month comes from the shared Panchang selection hook. `PrathaReaderScreen` reuses the paged katha shell, speech/auto-slide and existing prose sharing; `presentation.ts` builds practice/story/bhav/bodh/link pages without scripture text. Each story renders tier + canon. The closing page contains the family-tradition footer. Hand-offs use the local-route helper with Home fallback.

The hub and reader are mounted lazily on Home, More and Panchang to preserve Back. Home DISCOVER and More expose the hub only after the pilot gate. `PrathaCards` provides up to three observance questions between Story and How to observe, and a month card below the sky header. Existing anchor registries remain the owners of longer kathas, liturgy and temples.

Tests: `PrathaExperience`, `prathaBackNavigation`, `prathaContent`, and the reader table in `readerReadAloud`. `mobile/.maestro/pratha-smoke.yaml` is season-gated and not yet device-run; no build/release/OTA was performed.

## Dependencies

[[panchang]] (rules, katha library, masa numbering), [[pitru-shiksha]] (pattern parent; owns Pitru Paksha customs), [[bhog-naivedya]] (the reasonless `doNotOffer` rows that pratha explains), [[daan-punya]], [[puja-vidhi]], [[ask]] (Phase 3 `pratha.why`).

## Gotchas

- **Original drafts were app-authored without sources.** External publications are now accessible. Owner approved folk verification and separate kavya/agama tiers; this does not verify a row automatically. Verify one row at a time: open two sources per canon line, correct the copy, write a dated note without "DRAFT", flip `status`. A web-search summary is not an opened source.
- **The axis files were generated once** from the prototype's JSON (2026-10-28). They are now canonical; edit them by hand and do not regenerate.
- **`ruleIds` on festival rows were derived** from the row's katha link: the observances whose `kathaId` is that katha, skipping month-wide mahatmyas and kathas shared by more than three rules. A custom tied to a mahatmya (e.g. K1 Kartik deepdaan) therefore has no `ruleIds` and surfaces through `masa` instead.
- **Bundled Valmiki sarga 6.107 (Aditya Hridaya) is a defective corpus row.** It has collapsed spacing, and its meanings are shifted by one verse. W8 is meaning-only, and the test forbids any `ref` into 6.107.
- **Gita refs may cite a range:** PN15/BD9 point at 17.8 with the canon "17.7–10"; the test accepts a range containing the verse.
- **The stance guard covers only the row's own voice** (`practice`, `bhav`, `bodh`), not katha bodies, where a curse is narrative. "mustard oil" passes because the guard matches `\bmust\b`.
- **Jest `testMatch`** gained `src/data/pratha/__tests__/**`. Do not add this suite to `test:data`.

## Related pages

[[pitru-shiksha]], [[readers]], [[panchang]].

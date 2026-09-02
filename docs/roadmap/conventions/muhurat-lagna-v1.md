# Muhurat lagna, hora & disha-shool convention — Vedansh v1 (DRAFT)

**Convention id:** `vedansh-muhurat-lagna-v1`  
**Status:** **DRAFT — NOT signed off.** Authored 2026-08-18 in an environment with **no content egress**: no external source could be retrieved or dated, so **no table in this document is sourced yet**. Everything below is either (a) a mechanism decision the code implements now, or (b) a **candidate row** awaiting the §10 two-source review. `EventRule.lagna` tables ship **EMPTY** (grading inert) until this document carries two dated concordant sources per occasion; `DISHA_SHOOL_BY_VARA` ships populated but `verified:false`. Release exposure is blocked on the review (RULEBOOK §14/§17), same as the masa tables.  
**Scope:** PRD-16 Phase 3 — per-occasion lagna preferences, the hora layer's role, and यात्रा's दिशा शूल.

This document is part of the calculation contract. A table or rule change requires a new convention id and fixture review; it must not silently change old results.

## Variant choices (decided now — these are mechanism, not sourcing)

1. **A barred lagna DEMOTES, never excludes** (PRD-16/P3 §14 Q2). A three-factor segment in a barred lagna renders मध्यम; a day is never excluded on lagna alone. Muhurta Chintamani readings differ; v1 picks demotion because the lagna tables are the least-attested layer and exclusion would compound their uncertainty into empty result lists. Pinned by `eventMuhuratPhase3.test.ts`.
2. **A preferred lagna is a tie-break and an evidence word**, never a tier promotion: श्रेष्ठ still requires nakshatra+tithi+vara. Among equal-tier segments the preferred-lagna segment leads.
3. **The 8th-from-lagna occupancy rule is OUT of v1** (PRD-16/P3 §4.4 recommendation): it needs per-minute planetary positions and belongs to no phase yet.
4. **Hora is evidence and tie-break only.** The hora line renders in "यह समय क्यों?" marked साक्ष्य. Segment ordering runs **tier → preferred lagna → window priority (Amrit → Abhijit → Shubh → rest, unchanged since Phase 1) → benefic hora (Guru/Shukra/Budh first) → time**: hora breaks only full ties — it never moves a window past a higher-priority equal-tier one, and never changes a tier, so this table cannot flip a §10-reviewed verdict.
5. **दिशा शूल applies to the four cardinal directions only in v1.** Intercardinal (विदिशा) attributions vary widely between published tables; a chosen intercardinal direction is never excluded in v1. Recorded as a variant choice to revisit at review, together with Chandra-vasa (out of v1, §14 Q4).
6. **Minimum usable segment: 24 minutes (~1 ghatika).** A split part shorter than this is dropped, never clipped — the kaal/bhadra doctrine extended to splits.

## Hora (wired, classical arithmetic)

First day-hora = weekday lord; successive horas follow the descending-speed sequence Sun → Venus → Mercury → Moon → Saturn → Jupiter → Mars; 12 unequal day-hours (sunrise→sunset) + 12 night-hours (sunset→next sunrise). The structural check — the 25th hora is the next weekday's lord — is pinned in `hora.engine.test.ts`. Benefic tie-break set: Guru, Shukra, Budh. *Sources to be dated at review; the rule is uncontested across published hora tables, but v1 still records it here because the benefic set and the tie-break role are Vedansh choices.*

## दिशा शूल (wired, DRAFT — `verified:false`)

| Vara | Barred direction |
|---|---|
| रविवार (Sun) | पश्चिम West |
| सोमवार (Mon) | पूर्व East |
| मंगलवार (Tue) | उत्तर North |
| बुधवार (Wed) | उत्तर North |
| गुरुवार (Thu) | दक्षिण South |
| शुक्रवार (Fri) | पश्चिम West |
| शनिवार (Sat) | पूर्व East |

Wired as `DISHA_SHOOL_BY_VARA` (eventMuhurat.ts). The chosen direction's shool days are excluded with the reason naming the direction on-surface. **Two dated sources required before sign-off**; the rows follow the common published tables but were transcribed from memory of the tradition, not from a retrievable page — treat as unverified.

## Lagna preference — CANDIDATE rows (NOT wired; code tables are empty)

Rashi indices are 0-based (0 = मेष … 11 = मीन). Classical groups: **चर/movable** 0·3·6·9, **स्थिर/fixed** 1·4·7·10, **द्विस्वभाव/dual** 2·5·8·11.

| Occasion | Candidate preferred | Candidate barred | Basis to verify at review |
|---|---|---|---|
| गृह प्रवेश | स्थिर (1, 4, 7, 10) | चर (0, 3, 6, 9) | Sthira-for-Griha-Pravesh is widely attested (PRD names it the strong case) |
| भूमि पूजन | स्थिर (1, 4, 7, 10) | — | Often stated to share Griha Pravesh's preference |
| सम्पत्ति क्रय | स्थिर (1, 4, 7, 10) | — | Fixed-asset permanence reading |
| विद्यारम्भ | द्विस्वभाव (2, 5, 8, 11) | — | PRD's illustrative row; thinner sourcing |
| उपनयन | द्विस्वभाव (2, 5, 8, 11) | — | Thin; may land as "no preference" |
| यात्रा | चर (0, 3, 6, 9) | स्थिर (1, 4, 7, 10) | Movable-for-travel reading; verify |
| वाहन क्रय · नामकरण · व्यापार आरम्भ · मुंडन · अन्नप्राशन · कर्णवेध · स्वर्ण क्रय | — (no candidate) | — | Sourcing too thin to propose; a legitimate outcome is a permanent "no lagna preference" row (the factor stays inert for that occasion — PRD-16/P3 §14 Q1) |

**Review procedure:** for each occasion, find ≥2 authoritative concordant sources (edition/page or stable URL + retrieval date), record recension variance, then (a) fill the row here with citations, (b) copy it into `EVENT_RULES[occasion].lagna`, (c) extend `eventMuhuratPhase3.test.ts` to pin the shipped rows row-for-row against this document, and (d) flip nothing to `verified:true` without a named reviewer.

## Fixture policy

Lagna span boundaries are validated against the committed Swiss Ephemeris corpus (150 charts — independent SIDM_LAHIRI lagna longitudes) in `lagnaSweep.test.ts`; a **published per-city daily lagna table** (DrikPanchang prints one) is additionally owed at review, per the standing rule that goldens are never engine output. Hora: the structural weekday-lord property is pinned; a published hora table row set is owed at review.

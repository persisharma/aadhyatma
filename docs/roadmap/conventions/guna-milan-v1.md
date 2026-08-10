# Guna Milan convention — Vedansh Ashtakoota v1

**Convention id:** `vedansh-ashtakoota-v1`  
**Pinned:** 2026-08-10  
**Scope:** North-Indian, Moon-based Ashtakoota; fixed Lahiri sidereal Moon from the existing Vedansh Kundali engine.

This document is part of the calculation contract. A table or rule change requires a new convention id and fixture review; it must not silently change old results.

## Sources and variant choices

- DrikPanchang, [Kundali Match tutorial](https://www.drikpanchang.com/tutorials/jyotisha/kundali-match/kundali-match.html?lang=en), retrieved 2026-08-10: eight kootas, maxima, result bands, and Bhakoot/Nadi outcome modifiers.
- DrikPanchang, [Varna Kuta](https://www.drikpanchang.com/tutorials/jyotisha/kundali-match/ashta-kuta/varna-kuta.html?lang=en), retrieved 2026-08-10: rashi groups and groom-to-bride direction.
- DrikPanchang, [Vashya Kuta](https://www.drikpanchang.com/tutorials/jyotisha/kundali-match/ashta-kuta/vashya-kuta.html?lang=en), retrieved 2026-08-10: five groups and exact 15-degree Sagittarius/Capricorn splits.
- B. V. Raman, *Muhurtha (Electional Astrology)*, re-edited public edition, Chapter XI “Marriage,” PDF pages 34–42: [public scan](https://www.panchanga.lv/wp-content/uploads/2020/06/Muhurta_Raman.pdf), retrieved 2026-08-10. Page 34 documents Raman's own Tara/Dina counting (v1 instead uses the modern DrikPanchang/Prokerala Ashtakoota Tara — see "Direction and scoring"); pages 35–38 pin Gana/Yoni classification and the full Yoni matrix; page 39 pins rashi-lord friendship and Bhakoot cancellation; pages 41–42 pin Nadi groups and maximum.

Where published schools differ, v1 makes one explicit choice: the North-Indian 0/0.5/1/2 Vashya matrix, bidirectional Tara halves, full 14×14 Yoni matrix, seven-lord Graha-Maitri matrix, and directional Gana matrix checked into `gunaMilanConvention.ts`. The complete row scores are independently checked against Prokerala's published [sample Guna Milan report](https://api.prokerala.com/reports/sample/guna-milan-en.pdf), retrieved 2026-08-10 (Mini/Jose, pages 2, 6, and 12).

The Gana grid `[[6,6,0],[5,6,0],[1,0,6]]` (groom row, bride column) follows the standard North-Indian software convention: a Rakshasa groom scores 1 with a Deva bride and 0 with a Manushya bride. That 0 diverges from Raman's prose, which calls a Rakshasa-man / Manusha-girl match "passable"; v1 deliberately aligns with the DrikPanchang/Prokerala software grid here, and this cell is explicitly flagged for domain sign-off.

## Direction and scoring

- `groom` and `bride` are calculation roles, not assumptions about the device owner.
- Varna awards 1 when groom rank is at least bride rank.
- Vashya uses bride as row and groom as column. Gana uses groom as row and bride as column.
- Tara counts inclusively in both directions. Each favorable direction contributes 1.5; remainders 3, 5, and 7 modulo 9 are unfavorable. This is the modern Ashtakoota Tara used by DrikPanchang and Prokerala, chosen deliberately over Raman's older Dina Kuta (which treats remainders 1, 3, 5, and 7 as unfavorable and uses no half scores).
- Yoni uses B. V. Raman's complete directional matrix with bride as row and groom as column; it must not be symmetrized (for example Horse-row/Deer-column is 3 while Deer-row/Horse-column is 1). Graha Maitri uses the complete seven-lord friendship matrix (bride's lord as row, groom's lord as column); its values follow mutual planetary friendship and are therefore symmetric, so the row/column orientation does not change the score.
- Bhakoot awards 0 for 2/12, 5/9, or 6/8 rashi relationships and 7 otherwise.
- Nadi awards 0 for the same Nadi and 8 otherwise.

The base score is always the arithmetic sum of the eight displayed scores. Cancellation flags never rewrite that number silently.

## Cancellation interpretation

V1 reports only this auditable cancellation:

- Bhakoot: the rashi lords are the same or their Graha-Maitri score is 5.
A cancellation changes the explanatory flag, not the base koota score. This preserves the published 36-point calculation and prevents a cancellation convention from being hidden inside the dial. V1 deliberately claims no Nadi cancellation: published schools disagree on rashi/nakshatra/pada exceptions. No pada-only, lineage, gotra, Mangal, full-chart, or practitioner-discretion cancellation is claimed.

## Bands

The base bands are inclusive: 31–36 excellent, 21–30 very good, 17–20 middling, and 0–16 below the reference threshold. The engine exposes `baseBand` and a separate displayed `band`. Following DrikPanchang, an uncancelled unfavorable Bhakoot uses 26–29 very good, 21–25 middling, and 0–20 below-reference bands; an unfavorable Nadi displays below-reference even at 28. The interface never treats either band as a decision.

## Independent fixture policy

`gunaMilan.golden.test.ts` contains expected row scores transcribed from independently published compatibility reports, including the Mini/Jose 20/36 report and an independent 19.5/36 Chitra/Uttara-Ashadha report. They are not captured from Vedansh output. The suite also pins every supported Bhakoot cancellation branch. Boundary tests call the longitude-level public API immediately below, at, and above every 3°20′ pada boundary, every 30° rashi boundary, and the 15° Vashya splits. Astronomy-engine agreement remains covered separately by the existing Swiss Ephemeris Kundali corpus.

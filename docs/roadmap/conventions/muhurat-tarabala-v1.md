# Muhurat Tarabala / Chandrabala convention — Vedansh v1 (DRAFT)

**Convention id:** `vedansh-muhurat-tarabala-v1`  
**Status:** **DRAFT — NOT signed off.** Authored 2026-08-18 in an environment with **no content egress**: the counting convention and class rows below are pinned as the calculation contract the code implements (PRD-16/P3+P4 §8.2 specifies them), but **no external source could be retrieved or dated**, so the two-source §10 review is entirely outstanding. Release exposure of the personalised strip is blocked on it (RULEBOOK §14/§17 — a gate exactly like the masa tables).  
**Scope:** PRD-16 Phase 4 — the personalised Tarabala/Chandrabala strip computed from the saved Kundali profile.

This document is part of the calculation contract. A table or rule change requires a new convention id and fixture review; it must not silently change old results. `taraChandraBala.test.ts` pins the full 27×27 tara matrix and 12×12 chandra matrix **row-for-row against this document**.

## Counting convention (wired)

- **Tarabala:** count **inclusively from the janma nakshatra to the day's nakshatra** in the 27-cycle, then reduce through the 9-fold tara cycle: `tara = ((count − 1) mod 9) + 1`.
- **Chandrabala:** the day Moon's rashi counted **inclusively from the janma rashi** (1…12).
- **Janma values** derive at runtime from the saved profile's birth instant via the shipped `getSiderealPlanetLongitude('moon', birthUtc)` (the exact primitive `gunaMilan` uses), floor-divided by 13°20′ / 30°. Nothing derived is persisted.
- **Evaluation instant:** the best window's nakshatra (`angaAtWindow ?? sunriseAnga` — kshaya-aware for free) and the day Moon's rashi at the best window's start, so the strip can never contradict the window the card recommends.

## The nine taras (DRAFT classes)

| Tara | Name | Class |
|---|---|---|
| 1 | जन्म Janma | **contested** — schools split: some bar it outright, some admit it for specific activities. v1 shows a "views differ" word; the review decides the final word (open question §14.3). |
| 2 | सम्पत् Sampat | favourable |
| 3 | विपत् Vipat | unfavourable |
| 4 | क्षेम Kshema | favourable |
| 5 | प्रत्यरि Pratyari | unfavourable |
| 6 | साधक Sadhaka | favourable |
| 7 | वध Vadha | unfavourable |
| 8 | मित्र Mitra | favourable |
| 9 | परम मित्र Parama Mitra | favourable |

## Chandrabala positions (DRAFT classes)

- **Favourable:** 1 · 3 · 6 · 7 · 10 · 11
- **Unfavourable:** 4 · 8 · 12 — the **8th (चंद्राष्टम) is the strongest bar** the strip can word.
- **Contested-middling:** 2 · 5 · 9

## Divergence from the Guna Milan Tara koota — deliberate, guarded by test

`gunaMilanConvention.ts` ships a *Tara koota* for Ashtakoota matching: **bidirectional** counting with **half-scores** (each favourable direction contributes 1.5; remainders 3/5/7 mod 9 unfavourable), per the modern DrikPanchang/Prokerala Ashtakoota (see `guna-milan-v1.md`). Muhurat Tarabala is **one-directional (janma → day), has nine named classes, and treats the जन्म tara as contested** — the koota has no contested notion and scores that direction favourably. **Never reuse the koota matrix for muhurat Tarabala.** `taraChandraBala.test.ts` asserts one concrete case where the two conventions disagree (the जन्म tara).

## Annotation contract (§8.3 — wired, test-pinned)

The strip **annotates, never re-grades**: no tier change, no exclusion, no reordering, no empty-state change; the general verdict stays identical across users and across the share card, the reminder scheduler, the ★ chip and the month overlay. चंद्राष्टम renders the strongest warm-avoid **word** — the card still does not move. Privacy: computed on device from the profile the app already stores, never re-asked, never persisted into results, **never on the share card or in any notification** (absence test-pinned). An opt-in "prefer my good days" sort is an open question for the review (§14.6), not v1.

## Review procedure

For each of the two tables: ≥2 authoritative concordant sources (edition/page or stable URL + retrieval date), recension variance recorded (especially the जन्म-tara schools and the chandra 2/5/9 middling reading), a named reviewer, then update the Status line above. The engine matrices must not change without a new convention id.

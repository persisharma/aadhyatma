# PRD-16 — Guna Milan (अष्टकूट मिलान) — 36-Guna Compatibility

| | |
|---|---|
| **Status** | Draft for review — prototype attached |
| **T-shirt size** | S–M (compute is pure lookup tables over the existing kundali engine; UI is one input screen + one result screen + a share card) |
| **Prototype** | [`docs/guna-milan-prototype.html`](../../guna-milan-prototype.html) — entry card, two-person input, 36-guna result, expanded koota, dosha state, share card, every interaction annotated |
| **Feasibility** | ✅ Confirmed — `getSiderealPlanetLongitude('chandra', date)` (`mobile/src/panchang/kundali.ts`) yields birth nakshatra (`⌊λ / 13°20′⌋`) and rashi (`⌊λ / 30°⌋`) for any birth moment; the eight koota scores are fixed lookup tables over those indices. **No new dependency, no native change — OTA-shippable.** |

> **Design intent (validated in the prototype):** third card on the existing **Jyotish landing** (Panchang tab → ज्योतिष segment), beside Kundali and Rashifal. Result = score dial + verdict chip + eight expandable koota rows that always **show their working** (each person's nakshatra basis + the koota's traditional meaning). Dosha handling uses the warm terracotta `avoid` tone with the परिहार (cancellation) check always computed and stated — **never red, never fear, never a remedy upsell.**

---

**Bundle-only:** both charts are computed on-device from birth date/time/place via the existing sidereal engine; koota scoring is pure arithmetic. Inputs persist only in AsyncStorage (`@vedansh/guna-milan`). No account, no network, nothing leaves the phone — and the UI says so at both entry and input.

## 1. Problem

Kundali matching is one of the highest-intent searches in this entire category — every family checks it during marriage conversations, and today that intent lands on ad-heavy astrology portals that demand phone numbers, upsell "remedies," and paywall the result. Vedansh already ships the hard part (a DrikPanchang-validated sidereal engine with per-user birth charts, #215/#217) but captures none of this audience. Guna Milan is the rare feature that is simultaneously a **new-audience acquisition door** (family members who don't yet use the app), a **wedding-season share moment**, and a two-week build on existing code.

## 2. Goal

Answer "इन दोनों का मिलान कितना है?" in one screen — traditional Ashtakoota, computed honestly, explained educationally, shared beautifully. Success = Guna Milan usage among Jyotish-segment visitors ≥ 25% (local counter), and share-card renders per match ≥ 15%.

## 3. Where it lands in the app (surfaces)

Validated in the prototype; four surfaces:

### 3.1 Entry — third card on the Jyotish landing
`PanchangScreen`'s ज्योतिष segment (`JyotishLanding`) gains an **अष्टकूट मिलान** card under Kundali and Rashifal, with the standard NEW badge. Tap → new root-stack route `GunaMilan` (same pattern as the `Kundali` / `Rashifal` routes in `navigation/types.ts`).

### 3.2 Input — two birth-detail cards (वर · वधू)
- Reuses the Kundali form controls verbatim: 48 pt `TextField variant="form"`, the date/time pickers, and `LocationPickerModal` (city + Rajasthan-tehsil list). Hand-rolling any of these is a RULEBOOK §3 hard reject.
- **"मेरी कुंडली से भरें"** chip on Person 1 — one tap copies the user's saved Kundali birth details (the dominant use case).
- **Unknown birth time** is a first-class state: "ज्ञात नहीं" defaults to 12:00 noon with a serif note explaining the ~13°/day moon-motion caveat; matching degrades gracefully because Ashtakoota is nakshatra-granular.
- Names are optional and used only for display/share.

### 3.3 Result — dial, verdict, eight koota rows
- **Score dial** (saffron-gold conic fill) + verdict chip on fixed bands: 33–36 अति उत्तम · 25–32 उत्तम · 18–24 मध्यम · <18 न्यून (softened language — never "reject").
- **Eight rows** — वर्ण/1 · वश्य/2 · तारा/3 · योनि/4 · ग्रह मैत्री/5 · गण/6 · भकूट/7 · नाड़ी/8 — each with a point chip and mini progress bar; **tap expands in place** (one open at a time) to show both persons' nakshatra/rashi basis for that koota plus a two-line traditional meaning. Educational, never oracular.
- **Dosha banner** (Nadi/Bhakoot) in the terracotta `avoid` tone, always paired with its computed **परिहार** check (e.g. nakshatra-charana difference for Nadi). A zero-scoring koota shows a terracotta point chip; the bar never disappears.
- A standing serif **disclaimer** anchors the screen: "मार्गदर्शन हेतु, निर्णय हेतु नहीं" — consult your family purohit for the decision.

### 3.4 Share — the branded artifact
साझा renders a portrait card (score, verdict, all 8 kootas, `ॐ वेदांश़ · <city>` footer) via the **existing Jyotish share pipeline** (`JyotishShareCard` / `react-native-view-shot` → `expo-sharing`). Names appear only if typed; **birth details never appear on the card.** The wedding-season family forward is this feature's organic-growth moment.

## 4. What it computes (all from existing code)

| Output | Source |
|---|---|
| Birth nakshatra + charana, rashi (both persons) | `getSiderealPlanetLongitude('chandra', birthMoment)`; nakshatra = `⌊λ / 13°20′⌋`, charana = `⌊λ / 3°20′⌋ mod 4`, rashi = `⌊λ / 30°⌋` |
| वर्ण (1) · वश्य (2) · योनि (4) · गण (6) · नाड़ी (8) | Fixed per-nakshatra/per-rashi classification tables (new, pure data) |
| तारा (3) | Count from each nakshatra to the other mod 9, per the standard table |
| ग्रह मैत्री (5) | Rashi-lord friendship matrix (lords already enumerated in `kundali.ts` graha data) |
| भकूट (7) | Relative rashi positions (2/12, 5/9, 6/8 patterns) |
| Doshas + परिहार | Nadi: same-nadi ⇒ dosha, cancelled by charana/rashi conditions; Bhakoot: 6/8 · 2/12 · 5/9, cancelled by Graha-Maitri conditions — all stated inline |

Scoring convention pinned to **DrikPanchang** (matching the panchang engine's existing fixture discipline), gated by a `tsx --test` suite in `mobile/src/panchang/__tests__/gunaMilan.test.ts` with a fixture corpus of known matches — the same pattern as `kundali.swiss-corpus.test.ts`.

## 5. Sensitivity & tone (product stance, locked)

This feature touches real family decisions. The stance, enforced in copy review:
1. **Guidance, never verdict** — the disclaimer is permanent, verdicts use soft language, and a low score is "below par," never "incompatible/rejected."
2. **Always show the working** — every number is explainable by expanding its row; we never present an unexplained oracle.
3. **No fear, no upsell** — doshas always ship with their traditional परिहार computed and stated; there are no "remedies," no pandit-consultation funnels, no monetization hooks. This is precisely the incumbents' pattern we differentiate against.
4. **Privacy is a feature** — birth details of a third party (the prospective match) never leave the device and never appear on the share card.

## 6. What it does NOT do (non-goals)

- **No Mangal-dosha / full-chart matching in v1** (computable from existing graha positions — explicit Phase 2 candidate, kept out to hold v1 at S–M).
- **No marriage-date muhurat planner** (PRD-14 non-goal stands).
- **No saved-match history in v1** — only the last inputs persist for re-entry; a named-matches list is Phase 2.
- **No predictions, remedies, or gemstone/pooja recommendations — ever** (stance §5.3).
- **No south-Indian (10-porutham) system in v1.**

## 7. Phasing

1. **Phase 1** — `gunaMilan.ts` pure module + fixture tests; entry card; input screen (with saved-Kundali autofill); result screen with expandable rows + dosha/परिहार; share card. Ships the whole feature, **OTA-shippable**.
2. **Phase 2 (optional)** — saved matches list; Mangal-dosha panel; per-koota deep-dive content.

## 8. Why it fits the moat

The incumbents monetize anxiety; Vedansh computes the same traditional result on-device, explains it, and asks for nothing. It reuses the app's most technically defensible asset (the validated sidereal engine) and its most viral mechanism (branded share cards) — and it is the only feature in the backlog that acquires an entirely new user segment for a two-week, OTA-shippable build.

## 9. Design compliance (design.md is authoritative)

- **Colour** — only `parchment*`, `ink*`, `saffron*`, `gold`, `divider` tokens; dosha/zero states use the PRD-14 terracotta `avoid` tone (added to `colors.ts` before use, per design.md §13). **Never green/red**; the dial's fill is the saffron-gold gradient.
- **Type** — Noto Serif Devanagari for all Devanagari (koota names, meanings, disclaimer); Cormorant Garamond italic for Latin secondary lines; Inter only for tiny uppercase field labels (§3). No fontSize below the 10 pt floor (§3.0).
- **Components** — `ReaderHeader variant="index"` for the top bar; `TextField variant="form"` + `LocationPickerModal` for all inputs; the share card follows the §39 ShareCard spec. No hand-rolled duplicates (RULEBOOK §3).
- **Iconography** — no emoji (§5); `॥`/`ॐ` ornaments and `‹`/`›` chevrons only.
- **Accessibility** — dosha/verdict states never colour-only: every state carries a text label; expandable rows are 44 pt+ touch targets (§12).
- **Bilingual, Hindi-led** — Devanagari primary, Latin/serif secondary (§1); koota meanings authored in Hindi first.
- **Motion** — row expand/collapse uses the standard layout-animation curve (§11); no celebratory confetti on high scores (tone stance §5).

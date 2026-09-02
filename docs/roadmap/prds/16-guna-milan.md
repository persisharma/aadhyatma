# PRD-16 — Guna Milan (अष्टकूट मिलान) — 36-Guna Compatibility

| | |
|---|---|
| **Status** | Implemented candidate — convention and fixture sign-off required before merge |
| **T-shirt size** | M — the arithmetic is pure, but convention tables, directional roles, uncertain birth times, privacy, and boundary validation make this more than a small UI feature |
| **Prototype** | [`docs/guna-milan-prototype.html`](../../guna-milan-prototype.html) — entry, two-person input, exact and uncertain results, expanded koota, dosha state, and privacy-safe sharing |
| **Feasibility** | Implemented without a new native dependency and OTA-capable. The pure engine reuses `getSiderealPlanetLongitude('moon', date)`; [`guna-milan-v1.md`](../conventions/guna-milan-v1.md) pins the convention, sources, and external golden-fixture policy pending final domain sign-off. |

> **Product stance:** a traditional calculation with visible working, not a verdict. The experience is calm, private, and explicit about uncertainty. No red alarm treatment, fear copy, remedy upsell, or hidden noon assumption.

## 1. Problem and goal

People seeking a traditional marriage compatibility calculation often encounter lead forms, opaque scores, and anxiety-driven upsells. Vedansh can offer a private, inspectable alternative using its existing sidereal engine.

The v1 goal is narrow: calculate the pinned Ashtakoota convention for two people, explain every component, express birth-time uncertainty honestly, and generate an optional privacy-safe share image.

Success is measured locally and only with user-visible diagnostics:

- number of Guna Milan calculations started and completed;
- share-card previews generated and system share sheets opened.

Do not describe a share as completed: the OS does not reliably report the downstream outcome. Do not publish aggregate adoption claims unless a separately reviewed telemetry plan is introduced.

## 2. Placement and navigation

`PanchangScreen` → ज्योतिष (`JyotishLanding`) gains an **अष्टकूट मिलान** card below Kundali and Rashifal, with the standard versioned NEW badge.

Tap pushes `GunaMilan` inside the existing **Panchang stack**. Add it to `PanchangStackParamList`; do not add a duplicate root-stack route. Back behavior, deep-link fallback, and screen tracking follow the existing Panchang/Jyotish screens.

## 3. Input experience

### 3.1 Directional roles without assuming the user

The selected scoring convention is directional, so the inputs remain **वर · Groom** and **वधू · Bride**. Each card offers **“मेरे विवरण यहाँ”** when saved Kundali details exist; never assume the device owner is the groom. The result and share card preserve these roles even when names are omitted.

Names are optional display-only values. Date and time are calculation inputs.

### 3.2 Reuse through controlled form primitives

Use a reusable, controlled `BirthDetailsForm` primitive derived from the Kundali flow. It accepts `value`, `onChange`, validation, disabled state, role-specific saved-profile copy, and a context-specific persistence policy.

Do **not** reuse `LocationPickerModal` directly: its current behavior mutates the global Panchang location. Guna Milan must not change Panchang preferences while entering another person's details.

V1 uses fixed India/IST civil-time semantics and only needs Moon longitude, so birthplace is not requested. Saved Kundali autofill copies the applicable name/date/time only. If Phase 2 adds Mangal-dosha or full-chart matching, location becomes a separately designed and validated input.

### 3.3 Unknown birth time is an interval, not noon

“ज्ञात नहीं” never substitutes 12:00 noon and never persists a fabricated time.

For an unknown time, evaluate Moon longitude across the entire local civil day, including every nakshatra, charana, rashi, and degree-sensitive Vashya boundary that falls within `00:00–23:59:59` IST. When both times are unknown, evaluate the Cartesian product of each person's possible classifications:

- if all possible times yield the same score, koota breakdown, and convention flags, show the exact result with an “all times checked” note;
- if any result changes, show the minimum–maximum score and the affected kootas/nakshatras;
- do not show one verdict band or share an exact score until an exact time is provided.

The Moon can cross a nakshatra during a civil day, so “effect is minimal” is not acceptable product copy.

### 3.4 Privacy and persistence

Inputs are session-only by default. Offer an explicit unchecked **“Remember match details”** toggle with the consequence **“Prefill this form next time.”** If enabled, store a versioned record under a dedicated key, with a visible clear action. Never restore a previous match implicitly when the toggle was off.

The architecture remains private and network-independent, but customer copy does not advertise the
implementation. It must not mention on-device/offline operation, internet/account requirements,
storage mechanisms, convention/schema versions, or similar technical status (RULEBOOK §3).

## 4. Pinned calculation contract

### 4.1 Inputs derived from the existing engine

For each exact birth moment:

```ts
const longitude = getSiderealPlanetLongitude('moon', birthMoment);
const nakshatraIndex = Math.floor(longitude / (360 / 27));
const charanaIndex = Math.floor(longitude / (360 / 108)) % 4;
const rashiIndex = Math.floor(longitude / 30);
```

Normalize longitude to `[0, 360)` before classification. Civil date/time is interpreted as India/IST in v1; timezone handling must not depend on the device timezone.

### 4.2 Convention document is part of the feature

The checked-in [`guna-milan-v1.md`](../conventions/guna-milan-v1.md) convention document and fixture source note pin:

- the authoritative DrikPanchang edition/pages and retrieval date;
- all 27 nakshatra, 108 charana, and 12 rashi classifications;
- वर→वधू direction for directional calculations such as Varna and Tara;
- every half-point/fractional score;
- the full rashi-lord and friendship tables (these are new pure data; they are not currently exported by `kundali.ts`);
- Vashya's degree-sensitive classification, including the Sagittarius and Capricorn 15° splits;
- Bhakoot/Nadi flags and every supported cancellation rule, including precedence;
- score-band labels and exact inclusive boundaries.

Base bands follow the pinned DrikPanchang convention: **31–36 excellent, 21–30 very good, 17–20 middling, 0–16 inauspicious**. The engine also exposes the separately interpreted display band required by DrikPanchang's unfavorable-Bhakoot and unfavorable-Nadi modifiers. UI copy softens the last band to **“पारम्परिक अनुकूल सीमा से कम · below the reference threshold”** and keeps the standing guidance disclaimer. If the fixture source and product labels diverge, the convention document wins and this PRD/prototype must be updated before shipping.

### 4.3 Eight outputs

| Koota | Max | Required basis |
|---|---:|---|
| वर्ण · Varna | 1 | Directional rashi-based hierarchy from वर to वधू |
| वश्य · Vashya | 2 | Degree-sensitive Moon classification and pinned pair matrix |
| तारा · Tara | 3 | Both directional nakshatra counts, modulo-9 classes, and fractional combination rule |
| योनि · Yoni | 4 | Pinned nakshatra animal/sex classifications and complete pair matrix |
| ग्रह मैत्री · Graha Maitri | 5 | Rashi lords and pinned natural-friendship matrix |
| गण · Gana | 6 | Pinned nakshatra gana pair matrix |
| भकूट · Bhakoot | 7 | Directional rashi distance and pinned cancellation precedence |
| नाड़ी · Nadi | 8 | Pinned nakshatra nadi rule and cancellation precedence |

The displayed total is the exact sum, including halves. Formatting and band comparisons must share one numeric source so decimal scores have no gaps or rounding disagreements.

## 5. Result experience

- An exact result shows a 36-point dial, pinned band label, optional names, roles, and eight expandable koota rows.
- An uncertain result shows a score range and the kootas that vary. It has no single dial fill or exact-share action.
- Each row shows its score, maximum, visual bar, inputs used for that rule, and a short Hindi-first explanation. Only one row is open at a time.
- Nadi/Bhakoot findings use `avoidTint` with `avoidDeep` text/border, never raw `avoid` text on a tint. A zero remains understandable without color.
- A dosha/cancellation banner states what rule fired, whether a supported cancellation applies, and what remained in the final score. Never claim a cancellation without a pinned and tested rule.
- The standing disclaimer reads: **“यह पारम्परिक अष्टकूट गणना है — मार्गदर्शन हेतु, निर्णय हेतु नहीं।”**

The production dial uses the existing `react-native-svg` stack. The HTML prototype's CSS conic gradient is illustrative only.

## 6. Share experience

Share opens a preview first. The portrait card may contain:

- optional names and their वर/वधू roles;
- exact total, band label, and eight component scores;
- standing guidance disclaimer;
- the brand footer `ॐ वेदांश़`.

It never contains birth date, time, location, a saved-profile identifier, or hidden metadata containing those values. Because birthplace is irrelevant in v1, the footer never appends a city. The share action is unavailable for a time-uncertain range; the user may instead share a neutral “exact time needed” educational card in a later phase.

Render with the existing `react-native-view-shot` → `expo-sharing` path. Track only preview generation and share-sheet opening locally.

## 7. Non-goals

- Mangal-dosha or full-chart compatibility;
- wedding-date muhurat;
- saved-match history or cloud sync;
- predictions, remedies, gemstones, paid consultations, or lead capture;
- South-Indian 10-porutham matching;
- claiming scientific validation or replacing personal/family judgment.

## 8. Architecture and delivery

| Layer | Responsibility |
|---|---|
| `gunaMilanConvention.ts` | Immutable, versioned classifications, matrices, bands, cancellations, and source metadata |
| `gunaMilan.ts` | Pure exact-time calculation, uncertain-day enumeration, score aggregation, and explainable rule outputs |
| Controlled birth-form primitives | Context-free date/time/name editing without mutating Panchang preferences |
| Screen state | Session-default input, optional versioned persistence, validation, expansion state, and clear action |
| Share model | Explicit allow-list of privacy-safe display fields; never serialize the input object |

No new native dependency is expected, so Phase 1 can ship by OTA after the normal runtime and channel checks.

## 9. Verification gates

Implementation is not complete until all of these pass:

1. **Convention review:** a domain reviewer signs off the pinned source note, direction, tables, fractions, bands, and cancellations.
2. **Golden corpus:** independently sourced known matches cover every score matrix and cancellation branch; expected results are not generated by the implementation under test.
3. **Boundary corpus:** test immediately below/at/above every nakshatra, charana, rashi, and Vashya 15° boundary. Existing astronomy tolerance must be considered when selecting fixture moments.
4. **Properties:** every component stays within `[0, max]`; totals equal component sums and stay within `[0, 36]`; role swaps are explicitly tested as symmetric or directional according to the pinned rule.
5. **Uncertain time:** stable-day exact result, boundary-crossing range, multiple changing kootas, IST day edges, and no fabricated/persisted noon.
6. **Privacy:** session-default behavior, opt-in storage, clear/migration behavior, safe share allow-list, no birth details or city in rendered/embedded share output.
7. **UI/accessibility:** 44 pt controls; expanded/collapsed semantics and labels; screen-reader score/range summaries; dynamic type; hi/en/gu/kn; high-contrast text tokens; no color-only states.
8. **Integration:** navigation/back/deep-link fallback, saved-Kundali copy on either role, no Panchang location mutation, share preview/cancel, typecheck, focused Jest/tsx suites, Maestro flow, and representative iOS/Android screenshots.

## 10. Design requirements

- Use existing `parchment*`, `ink*`, `saffron*`, `gold`, `divider`, `avoid`, `avoidTint`, and `avoidDeep` tokens. No raw red/green semantic colors.
- Use `ReaderHeader variant="index"`; back and row targets are at least 44 pt. Expandable rows expose button role, accessible name, and expanded state.
- Noto Serif Devanagari for Hindi-led content, Cormorant Garamond italic for Latin secondary text, and Inter for compact labels. No native font below the 10 pt floor.
- Copy and accessibility labels ship in Hindi, English, Gujarati, and Kannada.
- The primary **मिलान करें** action remains reachable above the keyboard or in a keyboard-safe sticky footer.
- Row expansion uses the standard layout animation; respect reduced-motion settings.

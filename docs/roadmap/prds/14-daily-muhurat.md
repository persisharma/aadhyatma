# PRD-14 — Daily Muhurat (चौघड़िया · राहु काल · शुभ मुहूर्त)

| | |
|---|---|
| **Status** | Approved — prototype-validated; surfaces locked |
| **T-shirt size** | S–M (compute is pure; UI is one card + one detail screen + a share card) |
| **TRD** | [`docs/roadmap/trds/14-daily-muhurat.trd.md`](../trds/14-daily-muhurat.trd.md) |
| **Prototypes** | [screen-after](../../panchang-screen-after-prototype.html) (A card in place) · [shareable](../../panchang-shareable-prototype.html) (C detail + share card) · [3 options](../../panchang-today-variants-prototype.html) |
| **Feasibility** | ✅ Confirmed — `PanchangData` already exposes `sunrise`/`sunset` (location-aware, DrikPanchang-validated). No new deps/backend. |

> **Locked design decisions (do not drift):** surface = **Glance card "A"** on Panchang→Calendar + **Full detail "C"** (reverent framed) on View-all + a **shareable branded card** reusing the verse ShareCard pipeline. Naming pinned to **DrikPanchang**. Palette = **warm auspicious/avoid** (gold-saffron for śubh, muted terracotta for avoid — never green/red). All visuals per **`design.md`** (see §9).

---

**Bundle-only:** every timing is computed on-device from the existing astronomy engine (`computePanchangForDate`). Pure arithmetic on sunrise/sunset + fixed weekday tables — no network, no new dependency, OTA-shippable JS.

## 1. Problem

The Panchang tab today answers *"what tithi / nakshatra / festival is it?"* — but the single most-checked question in the whole category is **"is now a good time, and what time should I avoid?"** Every Indian calendar app leads with **Choghadiya** and **Rahu Kaal**; it's the highest-frequency daily-return behavior in the space (people check it *before* starting travel, a puja, a new task). Vedansh computes the exact inputs (sunrise/sunset) already, but surfaces none of it.

## 2. Goal

Surface today's **auspicious/inauspicious timings** — Choghadiya (day + night), Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurat — with a clear **"right now"** read, on the tab users already open daily. Success = Panchang shifts from a festival-lookup into a **daily utility people check before acting**, lifting D7/D30 return.

## 3. Where it lands in the app (surfaces — locked)

Three surfaces, all on the existing **Panchang tab → Calendar view** (no new tab). Visuals validated in the prototypes above.

### 3.1 "Today's Timings" glance card (Variant A) — the daily answer
A card docked **directly below the Tithi/Nakshatra anga grid** on the Calendar view (`PanchangScreen`, right after the two-tier anga grid), above the upcoming-observances list. It answers *"is now good?"* at a glance:
- The **current Choghadiya** period + quality (शुभ/लाभ/अमृत/चर = auspicious; रोग/काल/उद्वेग = avoid) with a live "till 12:37 PM".
- **Rahu Kaal** (avoid tone) and **Abhijit Muhurat** (auspicious) as two tiles.
- A **"सभी मुहूर्त व चौघड़िया ›"** row → the detail screen.

It reads the **selected** calendar day, so tapping any date shows that day's card. Uses `cardActive*` gradient + `elevation.raised` per design.md §4/§8.

### 3.2 Muhurat detail — the full reverent readout (Variant C)
The View-all target: a **reverent, gold-`॥`-framed almanac card** (design.md §5 ornament), grouped **पंचांग → सूर्य → शुभ मुहूर्त·चौघड़िया → विशेष**, in **legible dark `ink`** with the śubh tint signalling quality behind the text (never graying it). Contents:
- **Day Choghadiya** ×8 (sunrise→sunset), current one flagged **अभी**.
- **Night Choghadiya** ×8 (sunset→next sunrise).
- **त्याज्य काल** — Rahu, Gulika, Yamaganda.
- **विशेष** — Abhijit, Pradosh.
- Sunrise/sunset header + the Panchak note + "समय <city> के अनुसार".

### 3.3 Shareable card — the forward-able artifact
A **साझा · Share** action on the detail screen renders the C card off-screen as a **branded portrait image** (an `ॐ वेदांश़ · <city>` footer) and hands it to the OS share sheet. This **reuses the existing verse ShareCard pipeline** (`react-native-view-shot` → `expo-sharing`; PRD-05 / `ShareCard.tsx` / `shareVerse.tsx`) — no new mechanism. The panchang forward is the category's most viral daily artifact; every share is organic, on-brand reach.

## 4. What it computes (all from existing data)

| Output | Formula |
|---|---|
| Day Choghadiya ×8 | split `sunset − sunrise` into 8 equal parts; sequence starts by weekday |
| Night Choghadiya ×8 | split `nextSunrise − sunset` into 8 (one extra `computePanchangForDate(date+1)`) |
| Rahu / Gulika / Yamaganda | the k-th daytime eighth, k from a fixed Sun–Sat table |
| Abhijit Muhurat | ~48 min centred on solar noon = midpoint(sunrise, sunset) |
| "Now" highlight | compare `Date.now()` against each computed window |

Naming/sequence pinned to the **DrikPanchang** convention, with a fixture test mirroring the existing `panchangVsDrikpanchang.e2e.test.ts`.

## 5. Non-goals
- **No astrology / kundli / personalized muhurat.** Choghadiya & kaal are location+date functions, not birth-chart functions. This stays a calendar utility, not an astrology upsell (that's the incumbents' clutter we avoid).
- **No "muhurat for event X" planner** (marriage/griha-pravesh muhurats) — a separate, heavier feature.
- **No notifications in v1** (a "Rahu Kaal starting" alert is a possible Phase 2, reusing the scheduler).

## 6. Phasing
1. **Phase 1** — `muhurat.ts` compute module (+ tsx tests + DrikPanchang fixture), the "Today's Timings" card, and the `MuhuratDetail` screen. Ships the whole feature.
2. **Phase 2 (optional)** — a "Rahu Kaal soon / auspicious window now" local notification; a home-tab glance. — **DROPPED (product decision, 2026-08-18); PRD-14 is complete at Phase 1.** Detail PRD kept for the record: [14-daily-muhurat-notifications-phase2.md](./14-daily-muhurat-notifications-phase2.md)

## 7. Why it fits the moat
100% on-device, deterministic, ad-free. The incumbents bury choghadiya under astrology upsells and banner ads; Vedansh surfaces it clean and calm — the same differentiation that carries the rest of the app.

## 8. Decisions (locked — do not drift)
1. **Naming/sequence** → **DrikPanchang** convention, gated by a fixture test.
2. **Placement** → glance card **below the anga grid** on the Calendar view (not a new segment/tab).
3. **Palette** → **warm auspicious/avoid** within the parchment system — gold-saffron tint for śubh, muted terracotta for avoid. **No green/red.** (No `success`/green token exists in `colors.ts`; if the terracotta `avoid` is adopted it must be **added to `colors.ts` first**, per design.md §13.)
4. **Full view** → the reverent **Variant C** framed card (legible dark ink), not a plain list.
5. **Sharing** → reuse the verse ShareCard pipeline; branded footer.

## 9. Design compliance (design.md is authoritative)

Every visual choice follows `design.md`; this feature adds **no** new visual language beyond one warm `avoid` token:
- **Colour** — only `parchment*`, `ink`/`ink-soft`/`ink-muted` (the deepened AAA/AA values, §2), `saffron`/`saffron-deep`/`gold`, `divider`, `card*` gradients. Pull from `colors.ts`; never hard-code a hex (§13). The `avoid` terracotta is the sole proposed addition → add to `colors.ts` + document here before use.
- **Type** — Noto Serif Devanagari for all Devanagari; Cormorant Garamond for Latin labels/times; Inter only for tiny uppercase chrome (§3). No hard-coded font sizes on any reading content.
- **Iconography** — **no emoji** (§5). Use `॥`/`ॐ` glyphs, the `‹`/`›` chevrons, and the existing star. Share uses a glyph, not 📤.
- **Layout/elevation** — card radius **18**, padding **18**, section gap **20**; `elevation.card` for the detail rows, `elevation.raised` for the glance card (§4).
- **Accessibility** — auspicious/avoid never conveyed by colour alone; each carries a text label (शुभ / avoid) and the "now" state a text chip (§12).
- **Bilingual, Hindi-led** — Devanagari primary, Latin/times secondary (§1, §3).

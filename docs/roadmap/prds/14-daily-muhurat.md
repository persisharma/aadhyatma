# PRD-14 — Daily Muhurat (चौघड़िया · राहु काल · शुभ मुहूर्त)

| | |
|---|---|
| **Status** | Draft — prototype for visualization |
| **T-shirt size** | S–M (compute is pure; UI is one card + one detail screen) |
| **Prototype** | [`docs/muhurat-prototype.html`](../../muhurat-prototype.html) |
| **Feasibility** | ✅ Confirmed — `PanchangData` already exposes `sunrise`/`sunset` (location-aware, DrikPanchang-validated). No new deps/backend. |

---

**Bundle-only:** every timing is computed on-device from the existing astronomy engine (`computePanchangForDate`). Pure arithmetic on sunrise/sunset + fixed weekday tables — no network, no new dependency, OTA-shippable JS.

## 1. Problem

The Panchang tab today answers *"what tithi / nakshatra / festival is it?"* — but the single most-checked question in the whole category is **"is now a good time, and what time should I avoid?"** Every Indian calendar app leads with **Choghadiya** and **Rahu Kaal**; it's the highest-frequency daily-return behavior in the space (people check it *before* starting travel, a puja, a new task). Vedansh computes the exact inputs (sunrise/sunset) already, but surfaces none of it.

## 2. Goal

Surface today's **auspicious/inauspicious timings** — Choghadiya (day + night), Rahu Kaal, Gulika Kaal, Yamaganda, and Abhijit Muhurat — with a clear **"right now"** read, on the tab users already open daily. Success = Panchang shifts from a festival-lookup into a **daily utility people check before acting**, lifting D7/D30 return.

## 3. Where it lands in the app (surfaces)

Two surfaces, both on the existing **Panchang tab → Calendar view** (no new tab):

### 3.1 "Today's Timings" card — the daily glance
A card docked **directly below the Tithi/Nakshatra anga grid** on the Calendar view (`PanchangScreen`, right after the two-tier anga grid at line ~452). It shows the **now-relevant** state at a glance:
- The **current Choghadiya** period + its quality (शुभ / लाभ / अमृत = good; रोग / काल / उद्वेग = avoid), with a live "ends in 42 min".
- **Rahu Kaal today** (start–end) with an "avoid" tone, and whether it's active now.
- **Abhijit Muhurat** (the day's most auspicious window) with its time.
- A **"View all timings ›"** row → the detail screen.

Because it reads the *selected* day in the calendar, tapping any date shows that day's card (not just today).

### 3.2 Muhurat detail screen — the full table
A new `MuhuratDetail` screen in the Panchang stack, reached from the card:
- **Day Choghadiya** — 8 periods (sunrise→sunset), each labelled + colour-coded good/neutral/avoid, the current one highlighted.
- **Night Choghadiya** — 8 periods (sunset→next sunrise).
- **Kaal windows** — Rahu Kaal, Gulika Kaal, Yamaganda (the three inauspicious daytime bands).
- **Abhijit Muhurat** — the noon auspicious window.
- A sunrise/sunset header for context.

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
2. **Phase 2 (optional)** — a "Rahu Kaal soon / auspicious window now" local notification; a home-tab glance.

## 7. Why it fits the moat
100% on-device, deterministic, ad-free. The incumbents bury choghadiya under astrology upsells and banner ads; Vedansh surfaces it clean and calm — the same differentiation that carries the rest of the app.

## 8. Open questions
1. **Choghadiya naming convention** — pin to DrikPanchang (recommended) vs. a regional variant.
2. **Card placement** — below the anga grid (recommended) vs. its own segment in the Calendar/Vrat toggle.
3. **Colour language** — reuse the festival marker palette, or a dedicated good/neutral/avoid triad within the parchment system.

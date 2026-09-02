# TRD-16/P2 — Event Muhurat Finder, Phase 2 (शुद्धि depth) — Technical Design

| | |
|---|---|
| **Companion PRD** | [PRD-16 §5 Phase 2](../prds/16-event-muhurat-finder.md) |
| **Phase 1 as shipped** | design.md §60, RULEBOOK §17, `wiki/subsystems/panchang.md` |
| **Status** | **BUILT (Aug 2026)** — with one refinement over this design: grading is **per window**, finer than the single-instant window-time reading measured in §1.1 (see the note under the flips table) |
| **T-shirt** | **Code M** (one new engine solver; everything else is arithmetic over primitives that already ship) · **Content L** (six new rule tables + three convention decisions) |
| **Prototype** | [`docs/muhurat-phase2-prototype.html`](../../muhurat-phase2-prototype.html) — all dates/times real engine output |
| **Feasibility** | ⚠️ Mixed, and the split is the whole point of this document. Window-time anga is nearly free (`tithi.endTime`/`nakshatra.endTime` already solved). Bhadra-as-a-window needs **one new bisection in `engine.ts`** — `karana.endTime` is hardcoded `null` today. |

> **Non-negotiables (carried from PRD-16 §3/§6 and RULEBOOK §17):** no score, no luck percentage — two tiers and reasons only; no Vivah; no backend, no live feed, no new native dependency; warm palette, no green/red, no emoji, tokens from `colors.ts`; Devanagari-first copy through `contentByLang`; every rule table clears §10 before a store build exposes it; no private panchang cache — everything reads `panchangDayStore`. This TRD introduces nothing outside those choices.

---

## 0. Scope

Phase 1 grades a day from its **sunrise** anga and a flat dosha stack. Phase 2 makes the grade *time-aware and season-aware*: evaluate the angas **at the candidate window**, solve **Bhadra as an interval** instead of a whole-day flag, give each occasion **real masa rules**, and add the **six Phase-2 occasions**.

Out of scope: lagna sweeping and Hora (Phase 3), Tarabala/Chandrabala (Phase 4), Vivah (permanently, PRD §3).

---

## 1. Ground truth (verified in source, Aug 2026)

| Fact | Source | Consequence |
|---|---|---|
| `tithi.endTime` and `nakshatra.endTime` are **solved** (bisected forward from sunrise) | `engine.ts:473-486` | Window-time anga for tithi/nakshatra costs **zero new astronomy** — compare the window start against `endTime` and step the index. |
| `yoga.endTime` and `karana.endTime` are **hardcoded `null`** | `engine.ts:487-499` | Bhadra-as-a-window is the **only** item in Phase 2 that needs new engine work. Yoga end times are not needed (Vyatipata/Vaidhriti stay day-level). |
| A karana is **half a tithi** — boundaries every 6° of Sun–Moon elongation, vs the tithi's 12° | classical definition; matches `KARANA_NAMES` cycling twice per tithi | The new solver is a parameterised twin of `bisectTithiEnd`, not a new algorithm. |
| Bhadra = Vishti karana, currently `p.karana.index === 6` at sunrise → whole day excluded | `eventMuhurat.ts` `dayDoshas` | 49 of 365 days carry it; up to 35 days per occasion are excluded by **bhadra alone**. |
| `auspiciousWindows(m)` already returns discrete, sorted windows | `eventMuhurat.ts` | Bhadra becomes a **filter over that list**, not a new window model. |
| The dosha stack is computed once per day and reused across occasions | `dayDoshas` + `evaluateDay` | Window-time evaluation must not re-solve panchang; it re-derives indices from data already in `DayInputs`. |
| `isChaturmasDay` reads the sunrise anga, purnimant-normalised, kshaya-safe | `eventMuhurat.ts` | Masa shuddhi extends this, it does not replace it. |
| `panchangDayStore` is keyed by (location, calendar system, civil date) and persisted | `panchangDayStore.ts`, `panchangDayCache.ts` | Any change to `DayInputs` **must** bump `PANCHANG_DAY_CACHE_VERSION` (RULEBOOK §17.6). |
| Derived caches are dropped on every build change (OTA or store release) | `derivedCacheReset.ts`, `buildFingerprint.ts` (#265) | The "first launch after upgrade re-solves" cost is now the **baseline for every release**, so Phase 2's bump adds nothing on top of it. |
| `panchangDayPrewarm` keeps the persisted window `PREWARM_DAYS` (7) ahead of today | `panchangDayPrewarm.ts` (#265) | Phase 2's extra bisection is paid by the prewarm too — off the render path, chunked. And per RULEBOOK §17.6, any new daily surface must read **inside** that window, never sit on its edge. |
| Abujh days lift only the seasonal doshas today | `evaluateDay(..., { abujh })` | Phase 2 must resolve the remaining half — see §4.5. |

### 1.1 Measured impact (Ujjain, 365 days from 14 Aug 2026, shipped engine)

| Measure | Value |
|---|---|
| Vishti at sunrise | **49 days (13.4%)** |
| Days excluded by **bhadra alone**, per occasion | 20–35 |
| Yield gain if bhadra becomes a window | **+26% (Namkaran) … +45% (Griha Pravesh)** |
| Anga at the best window ≠ sunrise anga | **120 days (32.9%)** |
| Verdicts that **flip** under window-time evaluation | **115 / 2190 day×occasion pairs (5.3%)** — 11–25 per occasion per year |

**Flips go both ways**, which is why this is a correctness change and not a yield tactic:

```
Wed Aug 19 2026  Vahan  shreshtha → madhyam   (Swati → Vishakha by 12:04 PM)
Wed Aug 26 2026  Vahan  madhyam  → excluded  (Trayodashi → Chaturdashi)
Thu Aug 27 2026  Vahan  excluded → shreshtha (Chaturdashi → Purnima)
```

> **As built:** the measurement above replaced the whole day's anga with the anga at ONE instant
> (the best window). The shipped implementation grades **each window separately**, which is finer
> and changes two of the three rows: 26 Aug is *offered* via its 6:07 AM window (genuinely on
> Trayodashi; every Chaturdashi window is dropped), and 19 Aug stays *shreshtha* via its 6:04 AM
> Swati window while all the Vishakha windows demote to madhyam per-window. 27 Aug flips exactly
> as published. `eventMuhuratPhase2.test.ts` pins all three as built.

### 1.2 Blast radius — what Bhadra touches OUTSIDE the finder

`karana.endTime` is a field on `PanchangData`, not on anything finder-local, and **two shipped
renderers already print `endTime` when it is non-null**:

```ts
// MuhuratCardBody.tsx:24 — elementLine
return e.endTime ? `${name} · ${formatEndInstant(e.endTime, referenceDay, lang)}` : name;
```

So solving it changes these surfaces with **no code change in them at all**:

| Surface | Effect | Verdict |
|---|---|---|
| **Panchang tab anga grid** (`PanchangScreen` → `PanchangTile`, karana tile) | Karana gains "… तक 8:16 AM" | **Wanted.** Tithi and Nakshatra already show end times; Yoga and Karana showing none reads as missing data. |
| **Daily Muhurat detail card** (`MuhuratCardBody` `variant="full"`) | Karana row gains its end instant | **Wanted**, same reason. |
| Muhurat **share** card (`variant="share"`) | **None** — Yoga/Karana rows are gated behind `variant === 'full'` | Shared images are byte-identical. |
| Home **widgets** (`widgets/planPayload.ts`) | **None** — the payload carries no karana | Untouched. |
| **Choghadiya / Rahu Kaal / Abhijit** (`computeMuhuratDay`) | **None** — its only inputs are `sunrise`, `sunset`, `nextSunrise`, `weekday`. Bhadra is a karana and is not an input. | Not one minute moves. |
| Existing tests | **None** — no suite asserts `karana.endTime === null`. | Verified. |

**Consequence for this TRD:** Phase 2 is not a finder-only change. The engine field is shared, so the
Panchang tab and the daily Muhurat card change too — which is a **design.md sync and a screenshot
check**, not just a finder review. Yoga stays `null` (Vyatipata/Vaidhriti remain day-level flags), so
that row is unchanged.

**Open product decision this surfaces (see §10.6):** once the Bhadra interval exists, should the
*daily* Muhurat card list it as an avoid window beside Rahu Kaal? It is nearly free and users would
expect the two to sit together — but it widens the shipped daily surface beyond the finder, so it is
a product call rather than a consequence.

---

## 2. Architecture

Phase 2 adds one engine primitive and one evaluation stage. Nothing else moves.

```
computePanchangForDate(day)                    ← unchanged, + karana.endTime  [NEW solver]
        │
        ▼
DayInputs { p, asta }               ← panchangDayStore (unchanged shape + one field)
        │
        ├── auspiciousWindows(m)               ← unchanged
        │        │
        │        └── minus bhadraInterval(p)   [NEW — §4.2]
        │
        └── evaluateDay(rule, p, m, asta, { abujh, at: windowStart })
                 │
                 ├── angaAt(p, t)              [NEW, pure arithmetic — §4.1]
                 ├── masaShuddhi(rule, p)      [NEW, table lookup — §4.3]
                 └── dayDoshas(...)            ← unchanged apart from bhadra
```

**Ordering problem, and its resolution.** Window-time evaluation needs a window; window selection needs a verdict. Phase 2 breaks the cycle by evaluating in two passes:

1. **Day pass** — season/day doshas (masa, asta, rikta, amavasya, panchak, vyatipata, vaidhriti) on the sunrise anga. These do not vary within a day, so a day that fails here is excluded outright and never reaches pass 2.
2. **Window pass** — for each surviving window (bhadra already removed), grade nakshatra/tithi/vara **at that window's start**. The day's tier is the **best window's** tier; each window carries its own tier for the detail screen.

This keeps the cost at one panchang solve per day — unchanged — and makes "which window" and "how good" the same question, which is what a muhurat list actually publishes.

---

## 3. Data model

```ts
// engine.ts — the one new astronomy output.
karana: { index, nameHi, nameEn, endTime: Date | null }   // endTime now SOLVED

// eventMuhurat.ts
export type MasaRule = {
  /** Purnimant month indices (1 = Chaitra … 12 = Phalguna) the occasion prefers. */
  preferred: readonly number[];
  /** Months barred outright, beyond the Chaturmas/adhik bars. */
  barred: readonly number[];
};

export type EventRule = {
  /* …Phase 1 fields… */
  masa: MasaRule;                       // NEW
};

export type MuhuratWindow = {
  /* …Phase 1 fields… */
  tier: MuhuratTier;                    // NEW — per-window, not just per-day
  factors: { nakshatra: boolean; tithi: boolean; vara: boolean };  // NEW
  /** The angas prevailing during THIS window, when they differ from sunrise. */
  angaAtWindow: { nakshatraIndex: number; tithiIndex: number } | null;  // NEW
};

export type DayVerdict = {
  /* …Phase 1 fields… */
  /** Sunrise anga, retained: the almanac reading the Panchang tab shows. */
  sunriseAnga: { nakshatraIndex: number; tithiIndex: number };  // NEW
  /** Bhadra as an interval, when present, for the struck-through UI row. */
  bhadra: { start: Date; end: Date } | null;                    // NEW
};
```

> **RULE:** adding `karana.endTime` and `masa` changes `DayInputs`' effective shape, so
> **`PANCHANG_DAY_CACHE_VERSION` must be bumped in the same PR** (RULEBOOK §17.6).
>
> Since #265 there is also a **build-change reset** (`derivedCacheReset` + `buildFingerprint`,
> RULEBOOK §17.11): the derived caches are dropped whenever the running build moves — an OTA or a
> store release — so a stale-cache bug cannot outlive the release that fixes it. That is a
> **backstop for a forgotten bump, not a replacement for one**: it only fires when the build moves,
> so within a release the version number is still the only thing that invalidates anything. Ship
> Phase 2 with the bump; the reset is what saves you if it is missed.

---

## 4. Core algorithms

### 4.1 Window-time anga — *free, and the highest-value item*

```ts
/** The anga index prevailing at instant `t`, given the sunrise anga + its end. */
export function angaAt(index: number, endTime: Date | null, t: Date, mod: number): number {
  return endTime && t >= endTime ? (index + 1) % mod : index;
}
```

Pure, no astronomy, no I/O. `evaluateDay` gains an optional `at?: Date`; when absent it behaves exactly as Phase 1, so every existing caller and test is unaffected until it opts in.

**Correctness note.** A window can straddle the changeover. v1 grades on the anga at the window's **start**, matching how published lists label a muhurat. A window whose anga changes mid-way is flagged in the detail screen but not split — splitting is Phase 3's lagna work.

**Kshaya interaction.** On a kshaya day the *next* anga is not `index + 1` — an index is skipped. `PanchangData.kshayaTithi`/`kshayaNakshatra` already carry the skipped anga and its end, so `angaAt` must consult them before stepping. **This is the single most likely place for Phase 2 to introduce a silent error**, and it gets its own test.

### 4.2 Bhadra as a window — *the only new astronomy*

```ts
// engine.ts — mirrors bisectTithiEnd; karana boundaries are 6°, tithi's are 12°.
function bisectKarana̱End(fromInstant: Date, karanaIndex: number, tz?: string): Date
```

Then, pure:

```ts
export function bhadraInterval(p: PanchangData): { start: Date; end: Date } | null;
/** Windows with any bhadra overlap removed. Not clipped — dropped. */
export function windowsOutsideBhadra(windows, bhadra): MuhuratWindow[];
```

Bhadra is **dropped, not clipped**, matching how Phase 1 removes kaal slots: a partly-inauspicious window is not offered as a shorter good one.

Real behaviour, Ujjain (bhadra end computed by the proposed solver):

| Day | Bhadra | Outcome |
|---|---|---|
| **20 Aug 2026** | 6:04 – 8:16 AM | Abhijit 12:04 PM and three more windows survive → day becomes usable. **Today the whole day is thrown away.** |
| **3 Sep 2026** | 6:09 AM – 3:28 PM | Only Shubh 5:08 PM survives — the solver must *not* blanket-allow. |
| 26 Sep 2026 | 6:16 – 10:47 AM | Loses Shubh, keeps Amrit/Abhijit/Char. |

A day whose bhadra covers every window stays excluded, and the empty-state reason still names बद्रा.

### 4.3 Masa shuddhi — *table work, plus three decisions*

`masaShuddhi(rule, p)` is a lookup against the **purnimant-normalised** month (the same normalisation `isChaturmasDay` already does, so the user's amanta setting cannot move it). Three convention decisions must be made **before** the tables are authored, because each changes real output:

1. **Chaturmas reading.** Shipped code uses tithi-span (Devshayani → Dev Uthani). Published lists appear to resume at **Kartik Shukla post-Diwali** — PRD §9.1's third reading, and the one §9.1 itself recommends. Measured cost of the current choice: **11 and 14 Nov 2026 are excluded for Griha Pravesh while published lists include them**, ~2 weeks a year.
2. **Dev Uthani boundary off-by-one.** The festival engine places Dev Uthani on **20 Nov 2026**; `isChaturmasDay` lifts the bar on **21 Nov**. The day that ends the season currently sits inside it. Compounded by the 2026 Ekadashi being **kshaya** (PRD §9.2).
3. **Asta orb.** Phase 1 ships flat 10°/11°. The 8° retrograde-Shukra variant changes 30 Oct 2026 (9.71° — barred at 10°, clear at 8°).

### 4.4 The six Phase-2 occasions

मुंडन · अन्नप्राशन · कर्णवेध · उपनयन · सम्पत्ति क्रय · स्वर्ण क्रय.

Pure content — no new engine work; each is an `EventRule` with the Phase-2 `masa` field. Two carry extra structure: **Annaprashan** is age-window constrained (6–8 months, like Namkaran's 11th/12th-day mode) and **Upanayana** is Chaturmas-barred and stricter than Griha Pravesh. All ship `verified: false` until §10.

### 4.5 Closing the abujh contradiction

Phase 1 made abujh days lift the **seasonal** bars only. That left **33 of 54 abujh×occasion pairs excluded** — some on per-day doshas (Akshaya Navami on a rikta tithi), some on **factor match alone** (Dhanteras excluded for all six occasions because Chitra/Trayodashi are not in any preference list). Since PRD §4.2 says these days need *no* panchang shuddhi, and nakshatra/tithi/vara matching **is** panchang shuddhi, the factor gate is the remaining contradiction. Phase 2 must pick one and state it (RULEBOOK §17.8).

---

## 5. Accuracy & validation

- `eventMuhurat.drikfixture.test.ts` — **still owed from Phase 1**. Phase 2 must not ship without it, because window-time evaluation is precisely the change that makes us agree or disagree with published lists on early-changeover days. Golden rows must come from published lists; never from our own output (standing gotcha).
- The three §4.3 decisions each get a pinned boundary test, as `isChaturmasDay` already has.
- Bhadra intervals cross-checked against a published Bhadra table (start **and** end).

---

## 6. Surfaces

Full walkthrough in the prototype. Four changes, all additive to shipped screens:

1. **Occasion picker** — 6 → 12 rows needs grouping. Three `sectionLabel` groups (भवन · संस्कार · क्रय व आरम्भ) above the existing `ListCard` rows; no new card grammar.
2. **Day detail — Bhadra row.** Bhadra renders as a struck-through interval in the windows list, exactly as Rahu Kaal already does (design.md §60: *"Rahu Kaal struck through in place so the user sees it was considered"*). Zero new vocabulary.
3. **Day detail — dual anga.** "यह तिथि क्यों?" shows the anga **at the window** as the verdict line, with the sunrise anga as a quiet secondary (`उदय: स्वाति`) when they differ. This is the one place Phase 2 could confuse a user who cross-checks the Panchang tab, so the almanac reading stays visible.
4. **Results — per-window tiers.** A day whose morning is barred but afternoon is श्रेष्ठ shows the afternoon window and its tier; the card grammar is unchanged.

---

## 7. Performance

No additional panchang solves. One extra bisection per day (~the cost of the existing tithi bisection), inside the same `computeDayInputs` call, so the 92-day sweep gains roughly one tithi-solve's worth of work per day and every cached/persisted day is unaffected. `angaAt` and the masa lookup are integer arithmetic.

**The upgrade cost is no longer Phase 2's to carry.** Before #265 a cache-version bump meant the first launch after upgrade re-solved, and that was the one real cost of shipping Phase 2. The build-change reset now clears the derived caches on *every* OTA and store release, so a full re-solve on first launch is the baseline for any release at all — Phase 2's bump adds nothing measurable on top. The bisection cost lands in the same places the existing solve does: the finder sweep, and `panchangDayPrewarm`'s rolling 7-day warm.

---

## 8. Testing

| Suite | Pins |
|---|---|
| `eventMuhurat.engine.test.ts` (extend) | `angaAt` incl. **kshaya** stepping; per-window tiers; masa lookups; the three §4.3 boundary decisions |
| `bhadraWindow.test.ts` (new) | Solver against published Bhadra start/end; the 20 Aug / 3 Sep 2026 cases; a whole-day bhadra stays excluded |
| `eventMuhurat.drikfixture.test.ts` (new — Phase 1 debt) | Golden dates from published lists across all twelve occasions |
| `abujhCoverage.test.ts` (extend) | Whichever §4.5 reading is chosen |
| `dayCacheParity.e2e.test.ts` | Unchanged — but the version bump must be asserted |
| `.maestro/muhurat-phase2-smoke.yaml` | Grouped picker → a bhadra day → struck-through row → an afternoon window |

---

## 9. Rollout

Independently shippable, in this order — each is useful alone:

1. **Window-time anga** (free, highest correctness value, 115 flips/yr)
2. **Bhadra as a window** (largest yield gain, +26–45%)
3. **Masa shuddhi + the three decisions** (needs the §10 review to land)
4. **Six new occasions** (pure content)
5. **Abujh factor gate** (one-line change once §4.5 is decided)

Steps 1–2 are code-only and could ship before the content review; steps 3–5 are gated on it.

---

## 10. Open technical questions

1. Does `angaAt` step correctly across a **kshaya** boundary in every case, or does the skipped anga need its own interval list? (Highest-risk item.)
2. Should a window that **straddles** an anga changeover be split, downgraded, or graded at its start? v1 says graded at start.
3. Does Bhadra's **punchha/mukha** (tail/face) refinement matter, or is the plain interval enough for v1?
4. Do the six new occasions share Griha Pravesh's asta bar? PRD §9.4 leaves this open for vehicle purchase already.
5. Does per-window tiering change the **share card**, which currently names one best window?
6. Should the **daily** Muhurat card show Bhadra beside Rahu Kaal once the interval exists (§1.2)? Nearly free; widens a shipped surface.

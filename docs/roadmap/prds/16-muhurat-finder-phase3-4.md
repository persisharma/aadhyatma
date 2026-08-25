# PRD-16/P3+P4 — Event Muhurat Finder: Phase 3 (लग्न-grade windows) & Phase 4 (personalised Tarabala / Chandrabala)

| | |
|---|---|
| **Status** | **BUILT (Aug 2026)** — both phases, shipped Phase 3 first then Phase 4, per §11. As-built deltas: lagna preference tables ship **EMPTY** (not populated-DRAFT) with candidate rows in `conventions/muhurat-lagna-v1.md`, because the authoring environment had no content egress; the hora tie-break sits AFTER the Phase-1 window priority (tier → lagna → priority → hora — "tie-break" read literally, §4.5); `MuhuratWindow.lagnaRashiIndex`/`horaRuler` are nullable for the legacy no-spans path; §0's drikfixture goldens landed (published Nov-2026 Griha Pravesh rows, Chaturmas divergence asserted as such) and late-onset Vishti landed (`PanchangData.lateVishti`, re-pinning 27 Aug 2026). Release exposure still gates on the §10 review of every DRAFT table (§0.1). |
| **Parent** | [PRD-16 §5 Phase 3 / Phase 4](./16-event-muhurat-finder.md) — the ONLY remaining unbuilt phases. Phase 5 (Vivah, deva pratishtha, multi-party) stays **deferred by explicit parent decision** and is not scoped here. |
| **Phase 2 as built** | [TRD-16/P2](../trds/16-event-muhurat-finder-phase2.trd.md), design.md §60, `wiki/subsystems/panchang.md` |
| **Prototype** | [`docs/muhurat-lagna-personalised-prototype.html`](../../muhurat-lagna-personalised-prototype.html) — all astrological values in it are **ILLUSTRATIVE**, not engine output |
| **T-shirt** | Phase 3: code M · content M (lagna-preference + hora + disha-shool tables). Phase 4: code S · content S (one convention doc). The two ship **independently, Phase 3 first**. |
| **Owner** | TBA |

**Bundle-only constraint (inherited):** pure on-device computation over primitives already in the binary. No backend, no feed, no new native dependency, no score/luck-percentage, no Vivah — ever (parent §3).

---

## 0. Prerequisites — carried release-gate debts (NOT scope)

Three debts carried from Phases 1–2 are **prerequisites this PRD lists but does not scope or re-plan**. They gate any store build that exposes Phase 3/4, and none of the work below substitutes for them:

1. **§10 content review of the rule tables** (RULEBOOK §14/§17): all 12 occasion tables + the masa tables are still DRAFT (`source.verified:false`, pinned by test). Phase 3 *adds* tables (lagna preferences, hora, disha shool) to that same review queue; it does not clear it.
2. **`eventMuhurat.drikfixture.test.ts`** — the committed published-list goldens owed since Phase 1 (TRD-16/P2 §5). Phase 3's minute-grade windows make this *more* urgent, not less: precise windows are exactly what published lists print.
3. **Late-onset Vishti** — a Vishti karana that *starts* during daylight (sunrise karana is not Vishti) is still invisible; only sunrise-Vishti is solved (documented residual, wiki panchang gotchas). A finder that quotes windows to the minute while missing an afternoon Bhadra is a sharper embarrassment than one quoting ~96-minute blocks, so this lands **before or with** Phase 3.

## 1. Goals

- **Phase 3:** replace "the best ~96-minute choghadiya block" with **a muhurat window graded to the minute** — the lagna prevailing over each window becomes a grading factor, windows split at lagna (and anga) boundaries instead of being flagged, Hora joins the evidence, and यात्रा ships with दिशा शूल (completing parent §4.3).
- **Phase 4:** a saved Kundali makes every candidate day answer **"अच्छा — पर मेरे लिए?"** — a quiet Tarabala/Chandrabala strip, fully private, computed from the profile the app already stores. No competitor offers this offline without a consultation funnel (parent §5/P4).

## 2. Non-goals

- **No Phase 5 items**: no Vivah, no deva pratishtha, no multi-party muhurat (parent §3/§5 — explicit deferral, revisit only on a product decision).
- **No tier vocabulary changes**: still exactly श्रेष्ठ / मध्यम / excluded. Lagna and hora refine *which minutes*, never add a third tier or a score.
- **Personalisation never re-grades**: Tarabala/Chandrabala **annotate**; they never change a day's tier, exclude a day, or reorder results (see §8.3).
- **No new persistence of birth data**: Phase 4 reads the shipped profile; it stores nothing derived from it.
- **No navamsa/divisional-chart refinement of the muhurat lagna**; no Chandra-vasa or per-remedy Yatra lore beyond दिशा शूल.

---

# PART A — PHASE 3: लग्न-grade windows

## 3. Ground truth (verified in source, Aug 2026)

| Fact | Source | Consequence |
|---|---|---|
| **`computeLagna` already exists and is verified** — pure, `KundaliInput {date, latitude, longitude, timezone:'Asia/Kolkata'}` → sidereal ascendant longitude; 360×1° ecliptic–horizon scan + 48-step bisection per root; max 0.012° vs Swiss Ephemeris over 150 charts | `mobile/src/panchang/kundali.ts:365`, `kundali.swiss-corpus.test.ts` (`LAGNA_TOLERANCE_DEGREES = 0.012`) | Phase 3 is a **sweep over a shipped, corpus-verified primitive**, not new astronomy. The parent PRD's `computeLagna()` reference is real. |
| Its samples are **closed-form trig** (sidereal time + obliquity), no ephemeris calls | `kundali.ts` `eclipticHorizonSample` | A lagna evaluation is far cheaper than one tithi-bisection step (which calls astronomy-engine Moon positions). The sweep budget in §6 is credible. |
| Hora does not exist anywhere in `mobile/src` | grep (Aug 2026) | New pure arithmetic, same shape as choghadiya (`muhurat.ts` precedent). Parent §4.1 marks it "❌ new" and §5/P3 places it in Phase 3 **explicitly** ("Adds the Hora layer") — not ambiguous; it is in scope. |
| Every window already carries `tier` / `factors` / `angaAtWindow` | `eventMuhurat.ts:97` (`MuhuratWindow`) | Lagna slots into the existing per-window grading; no new window model. |
| A window straddling an anga changeover is **graded at its start, flagged, not split** — "splitting is Phase 3's lagna work" | TRD-16/P2 §4.1 note + §10.2; design.md §60 known limits | Phase 3 owes the split for **both** boundary kinds — lagna and anga. |
| `angaAt` is kshaya-aware (main → skipped anga → the *skipped* anga's successor) | `eventMuhurat.ts:427` | Split segments re-grade through the same kshaya-safe path; no new kshaya logic. |
| Per-day inputs live in `DayInputs { p, asta }`, computed in `computeDayInputs`, persisted per (location, calendar system, civil date) | `panchangDayStore.ts:140`, `panchangDayCache.ts` | Adding lagna output changes `DayInputs`' effective shape → **`PANCHANG_DAY_CACHE_VERSION` 2 → 3 in the same PR** (RULEBOOK §17.6; currently 2 at `panchangDaySerde.ts:18`). |
| Build-change reset drops derived caches on every OTA/store release | `derivedCacheReset.ts` + `buildFingerprint.ts` (RULEBOOK §17.11) | The bump's upgrade cost is already the baseline of any release; the reset is the backstop for a forgotten bump, **not** a replacement for it. |
| `panchangDayPrewarm` keeps the persisted window `PREWARM_DAYS` = 7 ahead; new daily surfaces must read **inside** that window | `panchangDayPrewarm.ts`, RULEBOOK §17.6 | The sweep cost is paid off the render path; nothing new may sit on the window's edge. |
| Finder scans `FINDER_WINDOW_DAYS` = 92 (260 when empty), chunked | `muhuratFinderScan.ts:30-32` | Perf budget is per-day cost × 92/260, behind `InteractionManager`. |

## 4. Engine design

### 4.1 `panchang/lagnaSweep.ts` (new, pure, RN-free)

```ts
export type LagnaSpan = { rashiIndex: number; start: Date; end: Date };
/** The 12–13 lagna spans covering [sunrise, nextSunrise). Pure; caller supplies all dates. */
export function lagnaSpansForDay(sunrise: Date, nextSunrise: Date, lat: number, lon: number): LagnaSpan[];
export function lagnaAt(spans: LagnaSpan[], t: Date): number;
```

Implementation: evaluate the ascendant at both edges, then **bisect each 30° crossing in time** (the ascendant's rashi is monotonic mod 12 across a day). Same purity contract as `muhurat.ts`/`kundali.ts` — no `Date.now()`, no React; source-purity test extended.

### 4.2 Where the spans live — in `DayInputs`, behind a measurement gate

`DayInputs` gains `lagnas: LagnaSpan[]`, computed inside `computeDayInputs` beside `asta`. One store, every surface shares the solve, prewarm pays it off the render path — and **no private cache** (standing gotcha). Cost gate: §6. Fallback if measurement fails the budget: solve lagna lazily in the finder's window pass and do **not** persist it (no version bump then) — but the default is in-store, because `verdictForDate` (`muhuratFinderScan.ts:97`) is the one shared grade-a-day path used by the day detail, the reminder scheduler, the ★ chip and the inventory, and all of them need the same spans.

### 4.3 Grading and splitting

The Phase-2 two-pass shape is unchanged; the **window pass** gets two refinements:

1. **Split first, grade second.** Each surviving raw window (kaal slots and bhadra already removed) is split at every lagna boundary **and** every anga (tithi/nakshatra) changeover inside it. Each segment is then graded exactly as Phase 2 grades a window — anga via kshaya-aware `angaAt` at the segment start — **plus** the lagna factor from the span it sits in. This resolves TRD-16/P2 §4.1's deferral and §10.2 in one move: nothing is "graded at start and flagged" any more; the segment *is* the window.
2. **Minimum usable length**: a split segment shorter than **24 minutes** (~1 ghatika) is dropped, not offered — the same "dropped, never clipped" doctrine as kaal and bhadra. This also answers the boundary-within-minutes-of-start edge case (§13).

**Lagna as a factor, not a fourth chip.** `factors` gains `lagna: boolean` (preferred-lagna match). Tier rule: श्रेष्ठ requires nakshatra+tithi+vara as today **and** a non-barred lagna; a *preferred* lagna is what distinguishes the best segment among equals and is stated in the evidence. A **barred** lagna (per-occasion) demotes the segment to मध्यम; it never excludes a day by itself. Exact promotion table is part of the convention doc below and pinned by test.

### 4.4 Lagna preference tables — a CONTENT deliverable

Per-occasion benefic/barred lagna lists (e.g. sthira lagnas for गृह प्रवेश, dvisvabhava for विद्यारम्भ — *illustrative until sourced*) are **religious content clearing the same bar as the masa tables**: ≥2 authoritative concordant sources per occasion, recension/variance noted, provenance stored beside the data, `verified:false` DRAFT until §10 (RULEBOOK §14/§17). A pinned convention doc mirrors the `docs/roadmap/conventions/` pattern (`guna-milan-v1.md` / `namkaran-namakshar-v1.md`): **`docs/roadmap/conventions/muhurat-lagna-v1.md`** with a convention id, retrieval-dated sources, and the explicit variant choices (does a barred lagna demote or exclude; is the 8th-from-lagna occupancy rule in or out of v1 — recommendation: out, it needs planetary positions per minute and belongs to no phase yet).

### 4.5 Hora — in Phase 3, per the parent (verified, not ambiguous)

Parent §5/P3: *"Adds the Hora layer (§4.1)"*; TRD-16/P2 §0 deferred it here. Ship it: `horaForDay(sunrise, sunset, nextSunrise, weekday)` — 12 unequal day-hours + 12 night-hours, rulers in the classical weekday sequence — pure arithmetic in the `muhurat.ts` mould. **Role: evidence and tie-break only.** The hora line renders in "यह समय क्यों?" and orders equal-tier segments (Guru/Shukra/Budh hora first); it never changes a tier. That keeps hora out of the tier contract, so its (small) table still goes through the convention doc but cannot flip a §10-reviewed verdict.

### 4.6 यात्रा + दिशा शूल (completes parent §4.3's Phase-3 row)

The 13th occasion. दिशा शूल is a vara-keyed barred-direction table (content, same two-source DRAFT treatment, rows in `muhurat-lagna-v1.md` or a sibling `yatra-disha-v1.md`). UX: the यात्रा row alone shows an 8-direction chip row (दिशा) before scanning; the chosen direction's shool days are excluded **with the reason naming the direction**. No destination geocoding, no Chandra-vasa in v1 (open question §14).

## 5. Data model & cache versioning

```ts
// panchangDayStore.ts
export type DayInputs = { p: PanchangData; asta: AstaFlags; lagnas: LagnaSpan[] };  // NEW field

// eventMuhurat.ts
export type EventRule = { /* … */ lagna: { preferred: readonly number[]; barred: readonly number[] } };  // NEW, DRAFT
export type MuhuratWindow = {
  /* … */
  factors: { nakshatra: boolean; tithi: boolean; vara: boolean; lagna: boolean };  // lagna NEW
  lagnaRashiIndex: number;                    // NEW — the span this segment sits in
  horaRuler: Graha;                           // NEW — evidence only
  splitFrom: 'choghadiya' | 'abhijit' | null; // NEW — non-null when this segment is a split part
};
```

- **`PANCHANG_DAY_CACHE_VERSION` 2 → 3 in the same PR** as the `DayInputs` change (RULEBOOK §17.6). The build-change reset (§17.11) backstops a forgotten bump only when the build moves — within a release the version is still the only invalidator, so the bump ships, full stop.
- Serde: `LagnaSpan.start/end` are `Date`s — `panchangDaySerde` already tags Dates generically; `dayCacheParity.e2e.test.ts` extends to assert fresh == cached == serialize→revive for the new field.
- Hora is **not** persisted — it is pure arithmetic over sunrise/sunset already in `p`, recomputed like `MuhuratDay`.

## 6. Performance — bisection count per day

Per day: ~12–13 lagna boundary crossings × ~22 time-bisection steps (1-minute precision over a ≤2.5 h bracket) ≈ **~280 ascendant evaluations/day**. Under the current `computeLagna` each evaluation runs a 360-step coarse scan (~460 trig samples) — wasteful for a sweep, so `lagnaSweep` uses a lean `ascendantAt(t)` that seeds the longitude search from the previous root (the ascendant moves <2° between bisection probes), cutting each evaluation to a handful of samples. Everything is closed-form trig; **no astronomy-engine ephemeris calls at all**, versus the existing per-day solve whose tithi/nakshatra/karana bisections each make dozens of them.

**Budget (gate, measured before merge):** `computeDayInputs` may grow by ≤ 25% wall time on Hermes. Costs land where the existing solve lands — the chunked finder sweep (`CHUNK_DAYS` = 7 yields) and the 7-day prewarm, both off the render path; a cached/persisted day is untouched. First-launch-after-upgrade re-solve is already every release's baseline (#265). If the budget fails, fall back to §4.2's lazy variant.

## 7. Phase 3 UX (prototype phones a–b)

- **Result cards** (`ListCard`, unchanged grammar): the best-window line gains a **lagna chip** — `शुभ 8:05 – 9:31 AM · वृश्चिक लग्न`. A split is visible as two window lines with a quiet `लग्न सीमा पर विभाजित` note. **Every card stays identical** (no hero card, design.md §60).
- **Day detail — "यह समय क्यों?"**: the evidence block under the answer becomes an explicit per-factor row list for the selected window — नक्षत्र / तिथि / वार rows as shipped, plus **लग्न** (span + अनुकूल/सामान्य word) and **होरा** (ruler, `evidence only` framing). Verdict words, never colour alone (§12); Devanagari-first via `contentByLang`.
- **Windows list**: split segments render as sibling rows; the struck-through bhadra/kaal treatment is unchanged. Sub-24-min dropped segments simply do not render (no vocabulary for them).
- Follow/remind, share, month overlay: **no change** — a follow keys a civil day and windows are never persisted (RULEBOOK §17.7); the share card gains the lagna line of the best window only (no personal data — it has none to gain).

---

# PART B — PHASE 4: personalised Tarabala / Chandrabala

## 8. Design

### 8.1 Source of truth — the saved Kundali profile, never re-asked

The profile ships today: `useKundali.ts` owns `{ name?, date, time, cityId }` under **`@vedansh:kundali-birth-profile:v1`** (strict IST parsing; birth city ≠ Panchang city). It is **excluded from the derived-cache sweep by name** (`derivedCacheReset.ts` non-cache allowlist — birth details are not engine-recomputable), so it survives every OTA/reset. Phase 4:

- derives **janma nakshatra + janma rashi** at runtime from the profile's birth instant via the shipped `getSiderealPlanetLongitude('moon', birthUtc)` (`kundali.ts`, the exact primitive `gunaMilan.ts:289` already uses), floor-divided by 13°20′ / 30° as `gunaMilan`'s `moonPosition` does;
- **persists nothing new** — one per-session memo keyed on the profile record; removing the profile removes the strip the same frame;
- **never asks for birth details anywhere in the finder**. No profile → the strip simply does not render. No modal, no badge, no per-card CTA (§8.4 decides how quiet "quiet" is).

### 8.2 `panchang/taraChandraBala.ts` (new, pure, RN-free)

```ts
export type Tara = 1|2|3|4|5|6|7|8|9;             // Janma … Parama-Mitra
export type TaraClass = 'favourable' | 'unfavourable' | 'contested';
export function tarabala(janmaNakshatraIndex: number, dayNakshatraIndex: number): { tara: Tara; cls: TaraClass };
export function chandrabala(janmaRashiIndex: number, dayMoonRashiIndex: number): { position: 1|…|12; cls: TaraClass };
```

**Tarabala counting convention (pinned, content-gated):** count **inclusively from janma nakshatra to the day's nakshatra** in the 27-cycle, then reduce through the **9-fold tara cycle** (`tara = ((count − 1) mod 9) + 1`): 1 जन्म · 2 सम्पत् · 3 विपत् · 4 क्षेम · 5 प्रत्यरि · 6 साधक · 7 वध · 8 मित्र · 9 परम मित्र. Draft classes — विपत् (3), प्रत्यरि (5), वध (7) unfavourable; जन्म (1) **contested** (schools split; some bar it outright, some admit it for specific activities); the rest favourable. **Chandrabala:** the day Moon's rashi counted inclusively from janma rashi; 1·3·6·7·10·11 favourable, **4·8·12 unfavourable (8th = चंद्राष्टम, the strongest bar)**, 2·5·9 contested-middling. **Every row above is DRAFT until pinned row-for-row in `docs/roadmap/conventions/muhurat-tarabala-v1.md`** (two dated sources, variant choices named) — a release gate exactly like the masa tables. One trap named now: `gunaMilanConvention.ts` already ships a *Tara koota* (bidirectional, half-scores, per B.V. Raman/DrikPanchang Ashtakoota) — **related arithmetic, different convention; never reuse its matrix for muhurat Tarabala.** The convention doc must state the divergence.

Evaluation instant: the **best window's nakshatra** (`angaAtWindow ?? sunriseAnga` — kshaya-aware for free), and the day Moon rashi from the same window instant, so the strip can never contradict the window the card recommends.

### 8.3 Annotates, never re-grades

The strip changes **no tier, no ordering, no exclusion, no empty-state**. Rationale: (a) the general verdict must stay identical across users and across the share card, the reminder scheduler, the ★ chip and the month overlay — all of which ride `verdictForDate` and know nothing of a profile; (b) a low-yield finder (parent §9.6) must not get scarcer by stealth; (c) "generally auspicious vs auspicious *for you*" (parent §5/P4) is precisely a two-layer statement. चंद्राष्टम renders the strongest warm-avoid **word** the strip can show — it still does not move the card. Whether §10 review wants an opt-in "prefer my good days" sort is an open question (§14), not v1.

### 8.4 UX (prototype phones c–d)

- **Day cards (results list):** one quiet personal row under the best-window line — `आपके लिए · साधक तारा · चन्द्र 7वाँ — अनुकूल` (tint + word, never colour alone). Present only with a saved profile.
- **Day detail:** the same strip as a full-width row between the answer block and the evidence, with a one-line plain-Hindi/English explainer and the जन्म नक्षत्र it was computed from (so the user can audit it against their Kundali screen).
- **No-profile state:** strip absent. **Decision:** a single italic footer line on the **results list only** — `कुंडली सहेजने पर हर दिन आपके तारा/चन्द्र बल के साथ दिखेगा` — sits with the existing disclaimer footer, styled as the disclaimer is, tappable to the shipped Kundali screen. Not on day cards, not on the day detail, never a badge or sheet. Even this is arguably naggy; the prototype annotates the alternative (nothing at all, discovery via release notes) for the design review to strike either way.
- **Reminders:** notification copy stays generic — a day-of notice never carries tara/chandra words (it lands on a lock screen).

### 8.5 Privacy stance

All on-device (the app has no backend to leak to — parent constraint). The strip is **private by construction**: `MuhuratFinderShareCard` "carries no personal data by construction" (`MuhuratFinderShareCard.tsx:26`) and **stays that way** — no tara/chandra line, no janma anything, on the share card, ever; extend the share-card test to pin the absence (the same boundary discipline as `JyotishShareCard`'s Rashifal card and `GunaMilanShareCard`'s allow-list). No new analytics counters may key on profile-derived values; the local counters count strip *renders*, nothing about their content.

---

# COMMON

## 9. Cache-version strategy (both phases)

| Change | `PANCHANG_DAY_CACHE_VERSION` | Why |
|---|---|---|
| Phase 3 — `DayInputs.lagnas` | **2 → 3, same PR** | Shape change to persisted per-day inputs (RULEBOOK §17.6). Build-change reset (§17.11) remains the backstop, never the mechanism. |
| Phase 3 — hora | no bump | Not persisted; pure arithmetic over `p` at read time. |
| Phase 4 — Tarabala/Chandrabala | **no bump** | Nothing in `DayInputs` changes; bala is arithmetic over the day's (already-persisted) anga + the profile. The profile key itself is outside the derived-cache universe. |

## 10. Test plan (engine via `tsx --test`; goldens NEVER self-generated — standing gotcha)

| Suite | Pins |
|---|---|
| `lagnaSweep.test.ts` (new) | Span boundaries against a **published daily lagna table** (DrikPanchang prints one per city/day) for ≥3 cities × ≥4 dates incl. a solstice; spans tile [sunrise, nextSunrise) exactly; monotonic rashi order; agreement of `lagnaAt(spans, birthInstant)` with `computeLagna`'s rashi for the 150-chart Swiss corpus instants. |
| `hora.engine.test.ts` (new) | Ruler sequence per weekday against a published hora table; 12+12 unequal hours tile day and night. |
| `eventMuhuratPhase3.test.ts` (new) | Split-at-lagna and split-at-anga (kshaya day included); sub-24-min drop; barred-lagna demotion; tier unchanged when lagna tables are empty (back-compat); दिशा शूल exclusion names the direction. |
| `taraChandraBala.test.ts` (new) | The full 27×27 tara matrix and 12×12 chandra matrix **row-for-row against `muhurat-tarabala-v1.md`**; चंद्राष्टम; the जन्म-contested flag; divergence-from-Guna-Milan-Tara guard (one case where the two conventions disagree, asserted to disagree). |
| `eventMuhurat.drikfixture.test.ts` (**prerequisite**, §0) | Extended with lagna-precise window rows once it exists; golden rows from published lists only. |
| `dayCacheParity.e2e.test.ts` (extend) | fresh == cached == serialize→revive including `lagnas`; version-bump asserted. |
| Source-purity tests (extend) | `lagnaSweep.ts`, `taraChandraBala.ts` import no RN/`Date.now()`/astronomy beyond the declared primitives. |
| Jest | Strip renders only with a profile; removal clears it; share card asserts **absence** of personal rows; reminder copy carries no bala words. |
| Maestro | `muhurat-phase3-smoke.yaml` (results → split window → detail evidence incl. lagna+hora rows); `muhurat-phase4-smoke.yaml` (no-profile absence → save profile → strip present → share has no personal line). |

## 11. Rollout — independently shippable, Phase 3 first

1. `lagnaSweep` + `DayInputs.lagnas` + version bump (code-only; tables empty = behaviour unchanged, pinned by test).
2. Split-and-grade window pass + UI (code-only; lagna factor inert until tables land).
3. Hora evidence line (code-only).
4. Lagna preference tables + `muhurat-lagna-v1.md` → **gated on §10 review**.
5. यात्रा + दिशा शूल (content + one chip row) → gated on §10 review.
6. Phase 4 engine + strip + `muhurat-tarabala-v1.md` → gated on §10 review of that doc; ships without touching 1–5.

## 12. Metrics (local counters, bundle-only)

Finder sessions viewing a split-window detail ≥ 15%; strip render rate among profiled users (denominator: results views) — target n/a, informational; Kundali saves attributed to the results-footer link ≥ 2% of no-profile finder sessions (tests whether §8.4's footnote earns its one line); fixture suites 100% green.

## 13. Edge cases

- **Kshaya days**: splitting inserts the skipped anga's segment; `angaAt`'s kshaya path already orders main → skipped → successor. Test-pinned (the single most likely silent error, as Phase 2 found).
- **No saved Kundali**: strip absent everywhere; zero chrome besides the one results-footer line (§8.4). Corrupt profile = guest state (shipped `useKundali` behaviour), never a rendered guess.
- **Window shorter than a lagna** (the common case — every window is): graded by the one span containing it; no split occurs; `lagnaRashiIndex` still set.
- **Lagna boundary within minutes of window start**: the split's leading segment falls under 24 min and is dropped; the window effectively *starts* at the boundary. No hysteresis needed — the rule is length, not distance.
- **Lagna boundary vs bhadra/kaal edge coincidence**: splits run over windows *after* kaal/bhadra removal, so a boundary landing inside a removed interval is unreachable by construction.
- **Polar-latitude guard**: `lagnaSpansForDay` inherits the curated-city assumption; if `sunset ≤ sunrise` the day is already null upstream (shipped guard).
- **Profile edited mid-session**: the memo keys on the profile record; an edit recomputes on next read — no stale janma values.

## 14. Open questions

1. **Which lagna school per occasion?** Sthira-for-गृह-प्रवेश is widely attested; several occasions have thinner sourcing. May force per-occasion "no lagna preference" rows (legitimate — the factor is then inert for that occasion). Content review decides.
2. **Does a barred lagna demote or exclude?** v1 proposes demote (§4.3); Muhurta Chintamani readings differ. Convention doc decides before tables are authored.
3. **जन्म tara**: barred, allowed, or occasion-dependent? Pinned as *contested* in v1 copy; review decides the word shown.
4. **Chandra-vasa for यात्रा** (Moon's direction) — attested companion to दिशा शूल; out of v1, revisit with the review.
5. **Abhijit on Wednesday** (parent §9.5) — still open; Phase 3's minute windows make the engine's always-emit choice more visible.
6. **Opt-in personal sort** (§8.3) — only if §10 review wants it; default stays annotate-only.
7. **Share card lagna line** — proposed in (§7); if review finds it clutters the 4:5 card, it drops without engine change.

## 15. Definition of done

**Phase 3:** `lagnaSweep.ts` + `hora` pure and corpus/published-table verified; split-and-grade window pass with min-length rule; version bump 3 shipped with parity tests; lagna/hora/disha tables DRAFT-committed with `muhurat-lagna-v1.md`; picker gains यात्रा (13 occasions, group क्रय व आरम्भ unchanged — यात्रा joins it or gets its own row per design review); results/detail UI per §7; Maestro smoke; design.md §60 + RULEBOOK §17 synced in the same PR (design-doc-sync rule). **Release exposure additionally gated on §0's three prerequisites.**

**Phase 4:** `taraChandraBala.ts` pure with the full-matrix test against `muhurat-tarabala-v1.md`; strip on results cards + day detail, absent without a profile; share-card absence pinned; no new persistence; Maestro smoke; docs synced. **Release exposure gated on the tarabala convention review (and §0's debts, which gate the feature as a whole).**

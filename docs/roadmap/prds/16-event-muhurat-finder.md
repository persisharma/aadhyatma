# PRD-16 — शुभ मुहूर्त खोज (Event Muhurat Finder) & the Muhurat Grade Engine

| | |
|---|---|
| **Status** | Phase 1 BUILT (engine + 4 screens + both entries + tests + e2e, Aug 2026) — §10 content review of the rule tables is the release gate (RULEBOOK §14); share card + month-view overlay shipped Aug 2026; **follow/remind + Today-strip chip + FOR TODAY abujh card shipped Aug 2026** (see §6.7, design.md §60, RULEBOOK §17.7; prototype: [`docs/muhurat-follow-remind-prototype.html`](../../muhurat-follow-remind-prototype.html)). **Phase 2 shuddhi depth BUILT (Aug 2026)** — window-time anga (per-window, kshaya-aware), Bhadra as a solved interval, masa mechanism (tables DRAFT), six new occasions, grouped picker; see TRD-16/P2. Remaining: §10 content review (now 12 occasions + masa tables), drikfixture goldens, late-onset Vishti |
| **Target release** | TBD (phased; Phase 1 is small) |
| **T-shirt size** | Code S–M per phase · **content L** (rule tables are the real cost) |
| **Owner** | TBA |
| **Origin** | Competitive gap vs. DrikPanchang / Hindu-calendar utilities — their highest-traffic surface is the one our Panchang tab cannot answer |
| **Prototype** | [`docs/muhurat-finder-prototype.html`](../../muhurat-finder-prototype.html) — all dates/times in it are real v1.4.5 engine output |
| **Prior art in repo** | PRD-14 / TRD-14 (Daily Muhurat), PRD-C (Kundali & Rashifal) |

**Bundle-only constraint:** every phase is pure on-device computation over primitives the app already ships. No backend, no live panchang feed, no astrologer marketplace. The finder must work in airplane mode, because that is the whole point of it.

---

## 1. Problem

The Panchang tab answers *"what is today?"*. Users arrive with a different question: **"which day should I do this on?"**

That is a *query*, not an almanac. It is also the single highest-traffic surface the Hindu-calendar incumbents own — "Griha Pravesh muhurat 2026", "vehicle purchase muhurat", "namkaran muhurat" are the pages that pull their traffic. We ship every input required to answer it and expose none of them in that shape.

Today a user who wants to buy a car this month must open the Panchang tab, step through candidate dates one at a time, read tithi/nakshatra/vara off the anga grid, and know the classical rules themselves. Nobody does this. They go to DrikPanchang, or they ask a purohit, or they guess.

**Why it is not a trivial filter.** A 240-day run of the shipped engines with a naive rule table produced **five confidently "recommended" Griha Pravesh dates that a purohit would reject outright** — because the draft lacked a Chaturmas gate. Adding it produced zero results in the same 90-day window, which external sources confirm is the correct answer. The season boundary that unlocks the feature (Dev Uthani Ekadashi 2026) is itself a **kshaya tithi** that touches no sunrise and resolves only through the kshaya fallback already in `festivalEngine`. Getting this right is a content problem wearing a code problem's clothes.

## 2. Goal

Turn the shipped panchang/muhurat/jyotish primitives into a **muhurat grade engine**: given an occasion and a date range, return ranked days with the auspicious windows inside each, and — crucially — **say why** each day passed or failed.

Success looks like:

- A user picks **वाहन क्रय**, a 90-day window, and gets ranked days with a best window on each, one tap to a reminder.
- A user picks **गृह प्रवेश** in Chaturmas and is told *there is no muhurat, why, and when the season opens* — instead of an empty list or a wrong list.
- A user with a saved Kundali sees which of those days are good **for them** (Tarabala/Chandrabala), which no offline app offers.
- Every verdict is legible: three factors and a cleared-dosha list, never a score out of 100.

## 3. Non-goals

- **No Vivah muhurat.** Marriage requires both partners' charts and guna milan, and is the highest-stakes decision a user could take from an app. Permanently out of v1 scope; the disclaimer says so on every screen.
- **No astrologer chat, no consultation booking, no paid muhurat report.** That is AstroTalk's model; ours is a quiet offline utility.
- **No score, no luck percentage, no "auspiciousness index".** Carried directly from the Rashifal constraint (`wiki/subsystems/panchang.md` gotchas): no deterministic predictions, no luck-scores. Tiers + reasons only.
- **No live panchang feed or remote rule updates.** Rule tables are bundled JSON, versioned with the app, same as texts.
- **Not a replacement for a purohit.** The product framing is "shortlist the days, then confirm with your family purohit."
- **No deva pratishtha / temple ritual muhurat.** Requires a scholar, not a table.

## 4. The muhurat taxonomy — what exists and what we compute

### 4.1 नित्य — daily recurring windows · **SHIPPED (PRD-14)**

| Window | Status | Computed from |
|---|---|---|
| Choghadiya, 8 day + 8 night | ✅ | equal eighths of day/night + weekday wheel |
| Rahu · Gulika · Yamaganda Kaal | ✅ | fixed weekday-indexed eighths of daytime |
| Abhijit Muhurat | ✅ | 8th of 15 equal day-muhurtas |
| Brahma Muhurta | ✅ (in `PanchangData`) | pre-sunrise window |
| **Hora** (planetary hour) | ❌ new | sunrise/sunset + weekday — pure arithmetic, same shape as choghadiya |

### 4.2 अबूझ मुहूर्त — self-evidently auspicious days · **computable today, zero rule risk**

Days that need **no** panchang shuddhi at all — doctrinally auspicious in their entirety. This is the cheapest, safest slice in the whole PRD: the app's festival engine already computes every one of them, and there are no per-event rule tables to verify.

Akshaya Tritiya · Basant Panchami · Vijayadashami (Dussehra) · Gudi Padwa / Ugadi · Dhanteras · Dev Uthani Ekadashi · Bhadli Navami · Guru Pushya & Ravi Pushya yoga days · Kartik Purnima.

### 4.3 कार्य / संस्कार मुहूर्त — chart-independent occasions

The finder's core. Each needs a verified rule table (nakshatra / tithi / vara / masa preferences + dosha exclusions).

| Occasion | Phase | Notes |
|---|---|---|
| गृह प्रवेश · Griha Pravesh | 1 | the flagship query; Chaturmas + asta sensitive |
| भूमि पूजन / शिलान्यास · Bhumi Pujan | 1 | same masa constraints as Griha Pravesh |
| वाहन क्रय · Vehicle purchase | 1 | high volume, looser rules |
| नामकरण · Namkaran | 1 | time-bound to 11th/12th day after birth — needs a *within-window* mode |
| विद्यारम्भ · Vidyarambh | 1 | Budh/Guru/Shukra varas |
| व्यापार आरम्भ · Vyapar Arambh | 1 | |
| मुंडन / चूड़ाकर्ण · Mundan | 2 | |
| अन्नप्राशन · Annaprashan | 2 | age-window constrained |
| कर्णवेध · Karnavedha | 2 | |
| उपनयन / जनेऊ · Upanayana | 2 | stricter; Chaturmas-barred |
| सम्पत्ति क्रय · Property purchase | 2 | |
| स्वर्ण क्रय · Gold purchase | 2 | overlaps Abujh days heavily |
| यात्रा · Travel | 3 | adds **दिशा शूल** (direction-dependent) — needs a destination input |
| विवाह · Vivah | — | **excluded**, see §3 |

### 4.4 शुद्धि / दोष layers — the grade engine

Every occasion is graded through the same stack. This is where correctness lives.

| Layer | Rule | Input | Status |
|---|---|---|---|
| तिथि शुद्धि | Rikta (4/9/14), Amavasya | `PanchangData.tithi` | ✅ available |
| नक्षत्र शुद्धि | per-occasion list; **पंचक** (Dhanishta 2nd half → Revati) | `.nakshatra` | ✅ |
| वार शुद्धि | per-occasion favourable/barred weekdays | `.vara` | ✅ |
| योग शुद्धि | Vyatipata, Vaidhriti (+ optionally Parigha/Shula/Ganda) | `.yoga` | ✅ |
| करण शुद्धि | **भद्रा** (Vishti karana) | `.karana` | ⚠️ sunrise-only; needs a window solver |
| मास शुद्धि | Adhik maas, Chaturmas, per-occasion preferred/barred months | `.lunarMonth`, festival engine | ⚠️ crude today |
| ग्रह शुद्धि | **शुक्र / गुरु अस्त** (Tara asta) | `getSiderealPlanetLongitude()` | ❌ new, but free |
| काल शुद्धि | exclude Rahu/Gulika/Yamaganda from the window | `MuhuratDay` | ✅ |
| लग्न शुद्धि | the muhurat lagna itself | `computeLagna()` swept over the day | ❌ Phase 3 |
| तारा / चन्द्र बल | Tarabala (janma nakshatra), Chandrabala (janma rashi) | saved Kundali profile | ❌ Phase 4 |

## 5. Iterative computation plan

Each phase is independently shippable and each leans only on primitives already in the binary.

### Phase 1 — Abujh calendar + the day-grade engine *(code S, content M)*

- **`panchang/abujhMuhurat.ts`** — derives the Abujh day list from the shipped festival engine. **No new rule tables**, so it ships ahead of any content review. This is the honest "value on day one" slice.
- **`panchang/eventMuhurat.ts`** — pure module, same contract as `muhurat.ts` (caller supplies every date; no `Date.now()`, no astronomy):
  ```ts
  evaluateDay(rule: EventRule, p: PanchangData, m: MuhuratDay): DayVerdict
  findMuhurats(rule, days: Array<{ p: PanchangData; m: MuhuratDay }>): DayVerdict[]
  ```
- Six occasions from §4.3. Tiers: **श्रेष्ठ** (all three factors) / **मध्यम** (two) / excluded (any dosha).
- Window = auspicious choghadiya minus kaal slots, plus Abhijit. Kaal and day-choghadiya are both exact eighths of daytime, so exclusion is *dropping a slot*, not clipping an interval.
- **Empty-with-reason** is a Phase-1 requirement, not a polish item — it is the single most differentiating behaviour in the feature.

### Phase 2 — Shuddhi depth *(code M, content L)* — **[TRD-16/P2](../trds/16-event-muhurat-finder-phase2.trd.md)**, prototype [`docs/muhurat-phase2-prototype.html`](../../muhurat-phase2-prototype.html)

Measured against the shipped engine (Ujjain, 365 days from 14 Aug 2026), the four items below are **not** comparable in cost. Window-time anga is free (`tithi.endTime`/`nakshatra.endTime` are already solved) and flips **115 verdicts a year**; Bhadra-as-a-window is the only item needing new astronomy (`karana.endTime` is hardcoded `null`) and adds **+26–45% qualifying days**; masa shuddhi and the six new occasions are content. See the TRD for the ordering and the three convention decisions that gate the tables.


- **Masa shuddhi properly**: per-occasion preferred/barred lunar months, with the Chaturmas convention **named explicitly** (three attested readings exist; see §9).
- **Shukra/Guru asta**: one elongation test over `getSiderealPlanetLongitude()`. Verified against the 2026 run — Jupiter combust 15 Jul–13 Aug 2026, Venus combust 18–30 Oct 2026 (retrograde, inferior conjunction 24 Oct). Orb must be stated (10° flat vs 8° retrograde Venus, 11° Jupiter) because it changes real answers.
- **Bhadra as a window**, not a sunrise flag — solve karana boundaries like tithi end-times already are.
- **Window-time anga evaluation.** Validation against a published list showed exact agreement on three of six days and divergence on exactly the two where the nakshatra turns over within hours of sunrise. The engine reports the *sunrise* anga (udaya-vyapini, correct for the almanac); muhurat lists report the anga prevailing *during the window*. **The finder must evaluate at the candidate window** or it will disagree with every published list on early-changeover days.

### Phase 3 — Lagna-grade windows *(code M)*

Replace ~96-minute choghadiya blocks with a precise muhurat window: sweep `computeLagna()` across the day, score lagna/hora quality, and return windows to the minute. Adds the Hora layer (§4.1) and enables यात्रा with दिशा शूल.

### Phase 4 — Personalised muhurat *(code S — the differentiator)*

PRD-C already ships a saved birth profile with the Moon's nakshatra and rashi. **Tarabala** (the 9-tara cycle from janma nakshatra to the day's nakshatra) and **Chandrabala** (Moon's rashi relative to janma rashi) are pure arithmetic over two integers each.

That yields **"generally auspicious" vs "auspicious for you"** — personalised, offline, no account, no astrologer. No competitor in this space offers personalised muhurat without a consultation funnel. Cheap in code, large in differentiation, and it makes the shipped Kundali profile earn its keep beyond a reference chart.

### Phase 5 — Deferred

Vivah (see §3), deva pratishtha, multi-party muhurat. Revisit only on an explicit product decision.

## 6. UX

Full walkthrough in [`docs/muhurat-finder-prototype.html`](../../muhurat-finder-prototype.html). Structure:

1. **Muhurat hub** — Panchang tab's Muhurat surface gains two rows below today's nitya windows: **आज के शुभ समय** (shipped) → **शुभ मुहूर्त खोज** (the finder) → **अबूझ मुहूर्त** (Phase-1 Abujh calendar).
2. **Occasion picker** — six cards + one window chip. No form, no birth chart (chart-independent by design in Phase 1).
3. **Ranked results** — day cards with three factor chips, tier pill, and the best window. Two tiers only.
4. **Empty-with-reason** — the trust surface. Reason, season-opening date, and the first dates after.
5. **Day detail** — factors, cleared-dosha list, and the day's windows with **Rahu Kaal struck through in place** so the user sees it was considered.
6. **Personalised strip** (Phase 4) — a Tarabala/Chandrabala row on each day card when a Kundali is saved.
7. **Reminder + share** — reuses the shipped local-notification scheduler and the muhurat share card. No new mechanism.

### 6.7 Follow & remind — SHIPPED (Aug 2026)

Follow is offered on the **day detail only** (every result card stays identical, design.md §60) and never on an excluded day. The `VratReminderPref` model is imported, not re-declared, and `VratReminderSheet` is extended rather than forked — but the vrat **store** does not transfer, because a vrat follow is a recurring rule while a muhurat follow is one dated civil day. That difference produces the four rules now in RULEBOOK §17.7: prune-on-load, never persist a window, excluded days fire nothing, and the day-of notice is clamped to `windowStart − 30 min` (the 17 Aug 2026 Vahan window opens 6:07 AM, so the shipped 07:00 default would have arrived after it).

**One deviation from the plan.** The empty-with-reason CTA follows the **first qualifying date** rather than the season boundary. A 21 Nov Dev Uthani notice is not actionable when the first real Griha Pravesh muhurat is 25 Nov, and it would have inherited the §9.2 kshaya ambiguity. This keeps one follow kind instead of two.

Still out of scope: following an **occasion** as a standing interest ("tell me when a श्रेष्ठ day appears"), which needs a background re-scan. Phase-2 candidate.

Entry points: Panchang → Muhurat (primary), Home's **कुंडली/व्रत** grid neighbourhood (a **मुहूर्त** tile), and a contextual link from `MuhuratDetailScreen`.

### 6.1 Inherited state — the finder owns none of this

Every item below already ships. The finder **reads** it and must never keep a private copy:

| Capability | Shipped as | Consequence for the finder |
|---|---|---|
| Location | `PanchangLocationContext` + `LocationPickerModal` — 54 bundled cities, GPS snapped to nearest, `gpsStatus` idle/locating/denied/error | Every window is sunrise-derived; changing the city changes every time on every screen |
| Calendar system | purnimant (default) / amanta, persisted | **A correctness dependency.** Masa shuddhi asks which lunar month a date is in, and the two systems disagree across the whole krishna paksha — rule tables must declare which they assume |
| Reading language | hi · en · gu · kn (gu/kn transliterated at runtime) | Inherited free *only if* every string is authored Devanagari + English and goes through `contentByLang` |
| Reading size | `FontScaleContext` M/L, set at onboarding | A muhurat row is name + tag + time range; at L the range must not wrap (`tabular-nums` + `nowrap`) |
| Reminders | `VratFollowContext` — `advanceDays 0\|1\|2\|3`, `dayOf`, `dayOfTime`; default 1 day + 07:00 | Reuse the vrat **follow-and-remind** pattern verbatim. **No quiet hours** — removed in #70 |
| Panchang mode selector | पंचांग · व्रत-पर्व · ज्योतिष, fixed first control | Must not move when entering the finder |
| Observance markers | star / dot / halfmoon on the month grid | Abujh days and muhurat hits mark the existing grid — no second calendar vocabulary |

**Found while auditing this:** `LocationPickerModal` renders its "use my location" affordance as a 📍 emoji, while `design.md` specifies a drawn teardrop pin for the location chip ("no emoji per §5"). A live §5 exception worth closing separately from this PRD.

**Design constraints** (per `design.md` §33/§51 and the PRD-14 non-negotiables): warm auspicious/avoid palette, no green/red, no emoji, tokens from `colors.ts`, Devanagari-first labels with English subtitles, disclaimer visible on every muhurat surface.

## 7. Content track — the real cost

The rule tables are **religious content** and clear the same bar as every text in the app (RULEBOOK §10): **≥2 authoritative concordant sources per occasion**, recension/variance noted, provenance stored beside the data.

- Per-occasion nakshatra / tithi / vara / masa lists — sourced, not drafted.
- Convention declaration: the Panchang subsystem already follows **DrikPanchang**; the finder must say so and follow it consistently.
- Regional variance (North/South, sampradaya) named where it exists.
- **Validation harness**: `eventMuhurat.drikfixture.test.ts` — committed golden dates from published muhurat lists, asserted against the finder. Mirrors `muhurat.drikfixture.test.ts`. Per the standing gotcha, never "fix" a failure by copying app output or widening a tolerance.

## 8. Metrics

| Metric | Target | Measured (bundle-only) |
|---|---|---|
| Finder sessions / WAU | ≥ 12% | local counter |
| Reminder-set rate per finder session | ≥ 20% | local counter |
| Empty-result sessions ending in a reminder for a later date | ≥ 30% | local counter — proves empty-with-reason works |
| Share rate per day-detail view | ≥ 8% | local counter |
| Fixture suite | 100% green | CI |

## 9. Risks & open questions

1. **Chaturmas has three attested readings** — tithi-span (Devshayani→Dev Uthani), month-based (Ashadha–Ashwin only), and published practice (resumes Kartik Shukla post-Diwali). They give different answers for late Oct / mid Nov. **v1 must pick one, name it, and be consistent.** Recommendation: follow published DrikPanchang practice, since that is what users will cross-check against.
2. **Kshaya/vriddhi boundary dates are contested downstream.** Dev Uthani 2026 is listed as both 20 and 21 Nov because the Ekadashi touches no sunrise. Where a season boundary is kshaya, surface the ambiguity rather than asserting one date.
3. **Asta orb convention** changes real answers (30 Oct 2026 sits at 9.71° — barred at 10°, clear at 8°). Must be declared. Strictly, Tara asta is heliacal set/rise (latitude- and visibility-dependent), not a fixed orb — a later refinement.
4. **Does asta gate lesser occasions?** The cited Muhurta Chintamani / Dharmasindhu rule names Griha Pravesh. Whether vehicle purchase is gated is an open content question.
5. **Abhijit on Wednesday** — several traditions void it; the engine always emits it. Undecided.
6. **Low yield is honest but needs framing.** Over 240 days: Griha Pravesh 10 recommended, Vidyarambh 19, Namkaran 42. Scarcity is the product, but the UI must not read as broken.
7. **Liability tone.** A wrong muhurat is felt as a real harm by a devout user. Every surface stays advisory and points to a purohit for confirmation.

## 10. Definition of done (Phase 1)

- `abujhMuhurat.ts` + `eventMuhurat.ts` pure, `tsx`-testable, no `Date.now()`/astronomy imports (mirrors the `muhurat.ts` purity contract, guarded by a source-purity test).
- Six occasions with §10-verified rule tables and stored provenance.
- Finder + results + empty-with-reason + day detail screens; reminder and share wired to existing mechanisms.
- `eventMuhurat.drikfixture.test.ts` green against committed golden dates.
- Maestro flow: Panchang → Muhurat → finder → occasion → results → day detail → reminder; plus the empty-with-reason path (RULEBOOK §0, §9).
- `design.md` + RULEBOOK synced in the same PR (design-doc-sync rule); new RULEBOOK section for the muhurat rule-table contract.

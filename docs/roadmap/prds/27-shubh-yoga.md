# PRD-27 — शुभ योग · the additive half of the muhurat engine

| | |
|---|---|
| **Status** | Build — v1 scoped; tables DRAFT pending `conventions/shubh-yoga-v1.md` §10 review (release-gating) |
| **T-shirt size** | S (pure tables over primitives `PanchangData` already carries; three annotation surfaces; no cache change) |
| **Origin** | [Q4 round-2 candidates §2/PRD-27](../2026-Q4-candidates-round-2.md) |
| **Prototype** | [`shubh-yoga-prototype.html`](../../shubh-yoga-prototype.html) — 6 frames including the **rejected** re-rank alternative |
| **Convention** | [`conventions/shubh-yoga-v1.md`](../conventions/shubh-yoga-v1.md) (`vedansh-shubh-yoga-v1`) · RULEBOOK **§24** |
| **Feasibility** | ✅ Confirmed — nakshatra/vāra/tithi + the Lahiri Sun longitude are all shipped primitives. OTA, no new dependency. |

> **Locked design decisions (do not drift):** **Annotate-only in v1** — a yoga never re-ranks, re-tiers, excludes, or offsets anything (§5). **Every window renders through `formatEndInstant`** — never the printed-panchang 26:12 style (§6). **The योग naming collision is solved by relabelling, not hoping** (§4). No day-quality score, no percentage, no "luckiest day" — present or absent, window stated, doshas and yogas coexist un-netted.

**Bundle-only:** pure tables evaluated on-device against the shared `panchangDayStore` solves. No network, no new dependency, no `DayInputs` change (⇒ **no `PANCHANG_DAY_CACHE_VERSION` bump**), OTA-shippable JS.

## 1. Problem

`eventMuhurat.ts` defines twelve `DoshaKey`s and zero yogas, and reads the 27 nitya yogas only to extract the two inauspicious ones (`yoga.index === 16 → vyatipata`, `=== 26 → vaidhriti`). The engine is structurally subtractive: it can say what is *wrong* with a day and has no vocabulary for what is specially *right* about one. Households time purchases and beginnings to exactly that vocabulary — सर्वार्थ सिद्धि, अमृत सिद्धि, रवि योग, and the द्विपुष्कर/त्रिपुष्कर pair — and every published panchang prints it daily.

## 2. Goal

Name the day's shubh yogas, with their windows, in the same quiet register the dosha vocabulary already uses — so "is today specially suited?" gets an answer without the app ever grading, scoring, or netting a day.

## 3. What ships

- **`panchang/shubhYoga.ts`** — pure (kundali-style boundary, source-purity test). `computeShubhYogas(p, nextSunrise)` evaluates the five v1 yogas over anga segments of [sunrise, next sunrise), kshaya-aware via the shipped `angaAt`, Sun nakshatra via the shipped `getSiderealPlanetLongitude`. Tables live in code and are pinned row-for-row against the convention doc; `SHUBH_YOGA_SOURCE.verified` is the literal `false` until §10 clears (test-pinned, release-gating).
- **Panchang day card** (§33): a **शुभ योग card** directly under the anga grid — chip(s) + window line. Absent entirely when no yoga forms (zero chrome; present-or-absent is the whole vocabulary).
- **Daily Muhurat** (§33 Muhurat Detail / `MuhuratCardBody`, `variant="full"`): a **शुभ योग** row per present yoga inside the पंचांग group, `elementLine`-shaped (end-only when the window starts at sunrise; start–end when it onsets mid-day).
- **Event Muhurat Finder** (§60): a yoga **chip row** on result cards (annotation between the tier line and the best-window line; chronological/tier ordering untouched) and a chips-plus-window block on the day detail's answer card. Excluded days on the day detail also gain **dosha chips** naming the present doshas — the same shared chip component, its other tone.
- **`components/MuhuratChip.tsx`** — the one shared chip: `tone: 'yoga' | 'dosha'` (goldChipBg/saffronDeep vs avoidChipBg/avoidDeep), word + tint per §12. Yoga chips and dosha chips are the same component so the two vocabularies stay visually paired and neither can drift into a scoring treatment.
- **`docs/roadmap/conventions/shubh-yoga-v1.md`** + **RULEBOOK §24** — the rule-table contract, following §17's shape.

## 4. The naming collision — decided here

The day card already shows a field named **योग** — one of the 27 **nitya** yogas (a Sun+Moon longitude sum) — and one of those is literally named **सिद्धि**. A chip reading "सर्वार्थ सिद्धि योग" directly beneath a field reading "योग: सिद्धि" is two unrelated systems with near-identical names on one card. Decision:

1. **The nitya-yoga field is relabelled नित्य योग / Nitya Yoga** everywhere it renders (the anga tile on the Panchang day card; the Daily Muhurat card's पंचांग row). Value and end-instant behaviour unchanged.
2. **A shubh yoga never renders bare**: always under a **शुभ योग** group label, always its full name ending **… योग**. It is never a value of the नित्य योग field, and the नित्य योग value is never a chip.
3. Pinned as a hard rule in RULEBOOK §24 and the convention doc, so a future surface cannot reintroduce the ambiguity.

## 5. Annotate-only — the one real decision, closed

May a yoga offset a dosha or raise a day in the finder's ranking? Tradition says yes for certain pairs (अमृत सिद्धि is widely printed as neutralising minor doshas). **v1 says no**: an offset retroactively changes every ranking the shipped finder has produced, under users who acted on them. Mechanically enforced, not just stated — `eventMuhurat.ts` does not import `shubhYoga.ts` (source-guard test), `verdictForDate` and every rider (share card, reminder scheduler, ★ chip, month overlay, abujh list) know nothing of yogas, and the annotation is computed screen-side from the same store. Reopening the offset is a product decision requiring a new convention id (the prototype's frame 5 shows the rejected alternative deliberately).

## 6. Time formatting — hard rule

These yogas run nakshatra-to-nakshatra and routinely end after midnight. Every window end renders through the shipped **`formatEndInstant`** (`panchang/muhuratFormat.ts`): 12-hour clock plus a short-date suffix when the end lands on a different civil day ("2:12 AM, 15 अक्टू"). The printed-panchang extended-hour style (26:12) is used **nowhere** in this app and must not be introduced by this feature. A window that starts mid-day (nakshatra onset after sunrise) always shows its start; only sunrise-start windows may render end-only (the anga-tile convention).

## 7. Stance guards

- No day-quality score, no percentage, no "luckiest day this month", no ranking between yogas (display order is a fixed traditional-prominence order, documented, never a number).
- Doshas and yogas **coexist** on one day and the app never nets them into a verdict — the day detail can show a भद्रा exclusion and an अमृत सिद्धि chip together, both true.
- Round 1 §3 rejected standalone panchak warnings as fear copy; this is the on-brand additive inverse, **not** licence to start scoring days (round 2 §3.3 rejected the day-score explicitly).
- The "doubles/triples" meaning of the पुष्कर pair is transcribed as traditional framing only; the app never turns it into advice to spend or invest.

## 8. Non-goals (v1)

- Guru/Ravi Pushya in this table — they already ship as computed abujh days; one concept, one home (overlap with the Sunday सर्वार्थ सिद्धि row is real and stated).
- Home Today strip / widget / notification surfaces; the finder share card (open question §9).
- Activity-specific exceptions (शनि+रोहिणी travel, गुरु+पुष्य vivaha) — recorded in the convention doc for review, not modelled.
- Sun-nakshatra boundary cuts inside a segment (evaluated at segment start; recorded variant).
- Offset/re-rank, any yoga-based filter or sort in the finder.

## 9. Open questions (carry to §10 review)

1. The सर्वार्थ सिद्धि Sunday (Ashwini vs Ashlesha) and Thursday/Friday short-row recensions; the त्रिपुष्कर U./P. Phalguni discord (convention doc records both).
2. Whether the finder share card gains the yoga line (general panchang data, like the lagna line) — off in v1.
3. Guru/Ravi Pushya joining this table as chips *in addition to* abujh (they are the same weekday×nakshatra shape).
4. Home Today strip chip once usage shows the day-card line earns its place.

## 10. Tests & gates

- `shubhYoga.test.ts` (tsx, `test:engine`, runs TZ=Asia/Kolkata): tables row-for-row vs the convention doc; ASY⊆SSY invariant; Ravi inclusive-count arithmetic incl. the 27-wrap; पुष्कर triple-factor gate; segment mechanics (kshaya day, mid-day onset, merge, next-sunrise bound); purity source guard; the **eventMuhurat-must-not-import-shubhYoga** guard; `SHUBH_YOGA_SOURCE.verified === false` pin; a full-year sweep asserting every window ⊆ [sunrise, nextSunrise) and non-empty only on table matches.
- Jest: `MuhuratChip`/`ShubhYogaCard` render tests (absent-when-empty; the next-day `formatEndInstant` suffix; both tones).
- Maestro `.maestro/shubh-yoga-smoke.yaml`: the stable surfaces (नित्य योग relabel on the day card and Daily Muhurat card; finder journey renders) — a specific yoga chip is date-dependent and is pinned by unit tests instead, the same reasoning as the date-dependent vidhi pill (§62).
- `npm run test` and `npm run lint` at 0 errors; design.md §33/§60 + new §69 and RULEBOOK §24 land in the same PR (design-doc-sync).

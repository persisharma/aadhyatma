# PRD-43 — Kundali reading: synthesis, precision and age-awareness (विवेचन · संश्लेषण)

| | |
|---|---|
| **Status** | Proposed. Follows PRD-20 Phase 6 (`kundaliReport.ts`, `KundaliReportScreen`, `kundaliHandoff.ts`). |
| **T-shirt size** | M — one new pure engine module, one rewrite of `kundaliReport.ts`'s composition layer, no new dependency, no new screen. |
| **Blocked on** | §2 (the §14.3 decision). Everything in Wave A ships without it; Waves B–C do not. |
| **Feasibility** | Every input already exists in `KundaliChart` + `computeSadeSati`. Nothing new is calculated from the ephemeris. |

> **Product stance unchanged:** offline, deterministic, tradition-framed. This PRD adds *synthesis of placements the engine already has* — it does not add astrology data, AI, or network. The question it answers is whether "synthesis" is allowed to describe a person, which is a §14.3 decision, not an engineering one.

## 1. Problem

A reviewer read a full 2013-born child's report export (`buildKundaliHandoffText`) and rated it: calculation/data ~8/10, wording ~7/10, **interpretation depth 4–5/10**. Ten specific defects were raised. All ten reproduce in the current code. They fall into three very different classes, and conflating them is the main risk in this work:

| Class | Defects | Nature |
|---|---|---|
| **A — Correctness/precision bugs** | ordinal grammar, dasha dates vs floored ages, Mahadasha-at-birth ambiguity, Sade Sati with no "as of" date, disclaimer repeated per life-area | Objectively wrong or noisy. No policy question. |
| **B — Missing composition** | no executive summary, current Maha·Antar pair not interpreted, combinations (conjunctions/yogas) never read together, sections not age-aware | Needs new composition, but stays structural. Mostly inside §14.3. |
| **C — "Real personalised reading"** | education strengths, temperament, creativity, suitable interests, likely challenges, strengths to nurture, parent guidance | **Currently banned by RULEBOOK §14.3** and enforced by a test. Requires an explicit product/content decision. |

## 2. The blocking decision (read this before scoping anything)

RULEBOOK §14.3 says Kundali copy "must not turn generic positions into fixed personality diagnoses or guaranteed life events." `kundaliReport.engine.test.ts` enforces the vocabulary side of it, and every authored string in `kundaliReport.ts` is deliberately written as *"tradition links this sign with …"* rather than *"this child is …"*.

So the reviewer's 4–5/10 is **not a defect — it is the designed ceiling.** Raising it requires choosing one of:

- **Option 1 — Hold the line (recommended default).** Ship Waves A and B. Interpretation stays "what tradition associates with this combination", never "what this person is like". The report gets materially better without any policy change.
- **Option 2 — Add a named, bounded tier: *traditional indications*.** Amend §14.3 to permit **combination-level** traditional associations phrased as tendencies with an explicit hedge, in a small allow-listed set of domains (learning style, temperament, interests). Still no life events, no health/career verdicts, no fear copy. The banned-vocabulary scan is extended, not removed.
- **Option 3 — Free-form personalised reading.** Rejected. It is the AstroTalk product PRD-20 explicitly declined to build, and it is unenforceable by a static test.

**This PRD assumes Option 1 for Wave A/B and specifies Option 2 as Wave C, gated.** Nothing in Wave C is built until §14.3 is rewritten in the same PR series that enables it.

## 3. Not in scope

- Any AI/network path (§14.3 ban untouched; the user-mediated handoff stays the only bridge).
- New ephemeris data, divisional charts (D-9 etc.), Kaal Sarp (excluded by PRD-20 §4 decision), enabling Mangal Dosha (separate gate).
- Making the report predictive in any form.

## 4. Wave A — precision and noise (no policy dependency)

### 4.1 Ordinals
`kundaliReport.ts` composes `${house}th bhava`, producing **"1th bhava", "2th bhava", "3th bhava"** in both the life-area paragraphs and the facts. `components/JyotishGuidanceRows.tsx` already has a correct `ordinal()` helper — it was never shared.

- Promote `ordinal()` to a shared pure helper (`panchang/ordinal.ts` or an export from `kundali.ts`) and use it in `kundaliReport.ts`, `kundaliHandoff.ts` and `JyotishGuidanceRows.tsx`. One implementation, three callers.
- Hindi has the same smell in a different form: `${house} भाव` renders "1 भाव". Use the ordinal words — प्रथम/द्वितीय/तृतीय … द्वादश — for bhava references in prose. Keep bare digits in fact *labels* where they act as a table key.
- Test: assert no `\d+th bhava` where the digit ends in 1/2/3 (and none of "11th/12th/13th" false-positived), across the all-twelve-lagna sweep that already exists.

### 4.2 Dasha: dates first, age second, balance named
`computeVimshottariDasha` back-dates the first Mahadasha to before birth (`kundali.ts:500`) — that is correct Vimshottari (balance at birth), but the report renders it as if it were a life period: `Age ${Math.max(0, …)}–${Math.floor(…)}` yields **"Age 0–15"** for a Saturn window that actually runs 1 Sep 2010 → 4 Jul 2029, i.e. it began ~2.8 years before the child was born and ends when she is 15 y 11 m.

Replace the timeline line format with:

```
4 Jul 2029 → 4 Jul 2036 · Mercury Mahadasha (ages 15–22)
— running at birth: Saturn Mahadasha, 1 Sep 2010 → 4 Jul 2029
  (balance at birth 16 y 2 m of the full 19 y) — current
```

Rules:
- **Dates are primary, age is the parenthetical.** Never age alone.
- The period containing the birth instant is labelled **"Mahadasha active at birth"** / **"जन्म के समय चल रही महादशा"**, and carries `balanceAtBirth` = `end − birthDate`, plus the lord's full length. It must never read as though it started at birth.
- Ages come from real elapsed time, and the boundary age is rendered as `15 y 11 m`, not floored to `15`, wherever the reader could read it as an age band.
- New model fields (additive, `reportVersion` → 2): per-period `startLabel`, `endLabel`, `ageStartLabel`, `ageEndLabel`, `activeAtBirth`, `balanceAtBirthLabel`.

### 4.3 Sade Sati "as of"
`computeSadeSati` already returns `nextTransitionAt`; `kundaliReport.ts` discards it. A saved or exported report therefore claims "second phase" forever.

- Stamp every transit-derived statement with the report's own date: **"as of 14 September 2026"** / **"१४ सितम्बर २०२६ की स्थिति"**. `model.generatedDateKey` exists — surface it as a formatted label in the observations section, not just as a key.
- Where `nextTransitionAt` is known, add "next phase boundary: <date>". Where it is beyond the scan window, say the scan window ended — never imply permanence.
- Same stamp goes into the handoff text header, so a pasted export is self-dating.

### 4.4 One disclaimer, not seven
`lifeAreaSection()` appends *"This is a structural view of the houses — life decisions remain a matter of your own judgement."* to **every** life area (6×), while `KundaliReportScreen` already renders `model.disclaimerHi/En` **twice** (top and bottom, lines 262 & 287) and `buildKundaliHandoffText` prints it again at the end. That is up to nine disclaimers in one document, which is what makes the report read as machine-generated.

- Delete the per-life-area line entirely. Keep exactly one footer disclaimer per surface + the section-level framing line that already lives in `vimshottari` and `observations` (those two are about *time* and *transits*, where the hedge carries real information).
- Test: assert the exact disclaimer sentence appears **at most once** in a serialized model.

### 4.5 Ordinal/date parity in the handoff
`kundaliHandoff.ts` is the artefact the reviewer actually read. Every Wave A fix must be visible in it: ordinals, dated dasha table with balance-at-birth, the "as of" stamp, single disclaimer.

## 5. Wave B — composition (structural, inside §14.3)

### 5.1 `kundaliYoga.ts` — a combinations engine (new pure module)
The report reads each placement alone. The reviewer's list — Saturn in Libra Lagna, Saturn + Rahu in the 1st, Sun + Mercury in the 11th, Mars in the 10th, Jupiter in the 9th, Moon in the 6th, Venus in the 12th — is exactly the set a human reader would combine first.

New module, same purity contract as `gochar.ts` (explicit chart in, typed data out; source-purity test):

```ts
export type KundaliCombination = {
  id: string;                       // 'conj-saturn-rahu-1', 'budhaditya', 'lagna-lord-in-lagna'
  kind: 'conjunction' | 'lord-placement' | 'classical-yoga' | 'dignity';
  grahas: readonly Graha[];
  house: number | null;
  rashiIndex: number | null;
  weight: number;                   // deterministic rank, not a score shown to users
  titleHi / titleEn: string;
  bodyHi / bodyEn: string;          // structural association copy
};
export function computeCombinations(chart: KundaliChart): readonly KundaliCombination[];
```

Detectors for v1 (all classical, all deterministic):
1. **Conjunctions** — 2+ grahas sharing a house, named with the house theme.
2. **Lagna lord's own placement** — including lord-in-Lagna and lord in kendra/trikona/dusthana.
3. **Dignity** — own sign, exaltation, debilitation, plus retrograde, for each graha (tables already implied by `RASHI_LORD`).
4. **A small allow-listed yoga set**: Budhaditya (Sun+Mercury), Gajakesari (Jupiter in kendra from Moon), Chandra-Mangal, kendra-trikona lord association (raja-yoga family), 2nd/11th lord association (dhana family). **Each yoga's definition is a §10-class table**: two independent published sources recorded per entry, `verified:false` until then, and unverified entries do not render — same contract `EVENT_RULES` carries (RULEBOOK §17.1).
5. **Never**: Kaal Sarp, Mangal (its own gate), or any yoga whose common presentation is fear-based.

Ranking and cap: emit at most **6** combinations, ranked by `weight` (Lagna-involving > kendra/trikona > conjunction size > other), deterministically tie-broken by graha order. A report that lists twenty "yogas" is the same noise problem in a new costume.

New section `combinations`, placed after `moon` and before the life areas.

### 5.2 Current period gets its own reading
`getCurrentDasha` returns `{maha, antar}` and the report spends one *fact* on it. Saturn Mahadasha · Rahu Antardasha deserves a paragraph.

Compose it rather than authoring 81 pairs:
- `DASHA_LORD_THEME_*` for the Maha lord (exists, in `dashaReading.ts`).
- The Antar lord's theme, phrased as a sub-period modifier.
- The **relationship between the two lords** from the classical naisargika maitri table (friend / neutral / enemy) → one hedged structural sentence about how tradition reads the pair.
- **Where the Antar lord sits natally**, by house theme — this is what makes it about *this* chart.
- Dates + elapsed/remaining for both levels (the screen already does this correctly per the wiki gotcha; the report and handoff do not).

The maitri table is a new §10-class table: sourced, pinned, tested row-for-row, like `taraChandraBala`'s classes.

### 5.3 "Your Kundali in 60 seconds"
New leading section `snapshot`, 5–7 lines, each one sentence, composed **only** from what later sections say — never a new claim:

1. Lagna + Lagna-lord placement in plain words.
2. Moon sign + nakshatra in plain words.
3. The single highest-weight combination.
4. The current Mahadasha·Antardasha with its end date.
5. The strongest house emphasis (most-occupied house / stelliums).
6. The current transit observation with its "as of" date.
7. (Age-aware) the one line the reader most needs — see §5.4.

Implementation note: it is a **projection** of the compiled sections, so it cannot drift. Test: every snapshot line's subject must be traceable to a section id (assert by construction — each line carries `sourceSectionId`).

This adds a section id, which breaks the pinned `expectedOrder` array in `kundaliReport.engine.test.ts`. Update the test deliberately; do not weaken it to "contains".

### 5.4 Age-aware framing
The chart is a 13-year-old's, read by a parent, and the report offers **"Career and work"** and **"Relationships"** (7th bhava, adult partnership). That is the sharpest product miss on the list.

- Derive `ageYears` from `chart.input.date` and the report's `now` (already passed in). Band it: `child` (<13), `adolescent` (13–17), `adult` (18+).
- **Keep section `id`s stable** — `career`, `relationships` — so the serialized model, handoff, share and the order test stay compatible. Change only `titleHi/En`, the house set, and the copy register:

| id | adult (today) | adolescent / child |
|---|---|---|
| `career` | कर्म और कार्यक्षेत्र · Career and work (10) | सीख, प्रतिभा और आगे की दिशा · Learning, talents & future direction (10, 5, 4) |
| `relationships` | संबंध · Relationships (7) | मित्रता, सहकार्य और सामाजिक स्वभाव · Friends, teamwork & social nature (7, 3, 11) |
| `wealth` | संसाधन और लाभ · Resources and gains (2, 11) | (unchanged id; copy register softened) |

- **Sade Sati on a minor's chart** must be worded for a parent reading it, not an adult reading their own — this is the one place fear copy could reach a family. The existing phase copy is already calm; add a band-aware framing line and hold the banned-vocabulary scan over it.
- `birthProfiles.ts` has no notion of the subject's age today. Age is **derived at report time, never stored** — no new persisted field, no new privacy surface.

## 6. Wave C — "traditional indications" (gated on §2 Option 2)

Only if §14.3 is amended. Adds, per combination and per age band, an *indications* block in an allow-listed domain set: **learning style, temperament, interests, what to encourage, what needs patience**. Hard rules if it ships:

- Phrased as traditional association + explicit hedge, never as assessment: "tradition associates this combination with …, which families often read as a cue to …" — never "she is …".
- **No** health, no medical, no financial, no exam-outcome, no marriage-timing, no "likely challenges" phrased as prediction. "Challenges" become "where tradition counsels patience".
- Banned-vocabulary scan extended with the second-person-diagnostic patterns (`you are`, `she is`, `he is`, `आप हैं`, `वह है`) inside indication strings.
- The parent-guidance register is explicitly non-directive: suggestions to *observe and encourage*, never instructions about schooling or discipline.

## 7. Model and versioning

- `reportVersion: 1 → 2`. Additive fields only; `KundaliReportScreen` and `kundaliHandoff` read the new shape. The serde round-trip test and the plain-JSON contract (§14.4) are unchanged obligations.
- The `snapshot` and `combinations` sections change `expectedOrder` to:
  `['snapshot','summary','lagna','moon','combinations','career','relationships','wealth','wellbeing','learning','dharma','observations','vimshottari']`.
- `buildKundaliHandoffText` renders both new sections in document order; its JSON tail stays the parse-back-equal model.

## 8. Verification (per RULEBOOK §14.4)

Required on every PR in this series:
- `npm run typecheck`
- `npm run test:engine` — extended with: ordinal grammar sweep; single-disclaimer assertion; dasha dates/balance-at-birth (a fixture chart whose first Mahadasha starts years before birth — the 2013 case); `generatedDateKey` stamp present on every transit statement; `computeCombinations` purity + determinism + ≤6 cap + deterministic ranking under tie; yoga-table `verified` gate; maitri table row-for-row vs its convention doc; snapshot-line traceability; all-twelve-lagna order sweep with the new ids; existing banned-vocabulary scan still green over all new copy.
- Targeted Jest: `KundaliReportExperience.test.tsx` (new sections render, age-band titles, one disclaimer), `KundaliExperience.test.tsx`.
- e2e: `.maestro/kundali-report-smoke.yaml` extended with the snapshot section and a dasha row asserting a **date**, plus `kundali-smoke.yaml` kept green. If Maestro is not run on device, say so explicitly before merge.
- Docs: `design.md` report sections + `RULEBOOK.md` §14.3/§14.4 updated in the same series (`.claude/rules/design-doc-sync.md`).

## 9. Sequencing

| Wave | Contents | Depends on |
|---|---|---|
| **A** | §4.1–4.5 — ordinals, dasha dates + balance-at-birth, "as of" stamp, disclaimer dedupe, handoff parity | nothing |
| **B1** | §5.2 current-period reading + maitri table | A |
| **B2** | §5.1 `kundaliYoga.ts` + `combinations` section | A |
| **B3** | §5.3 snapshot + §5.4 age-awareness | B1, B2 |
| **C** | §6 indications | §2 Option 2 decision + §14.3 rewrite |

Wave A is the one that changes the reviewer's "wording 7/10" and most of the "machine-generated" feel, and it carries no policy risk. Wave B is where 4–5/10 interpretation moves without touching the safety contract. Wave C is a product decision, not a backlog item.

## 10. Open questions

1. §2: Option 1 or Option 2? Everything in Wave C hangs on it.
2. Yoga allow-list — which five, and who signs off the two published sources per entry (same gate as `EVENT_RULES`)?
3. Age bands: is 13–17 one band or two (13–15 / 16–17)?
4. Does the **child-subject** case need its own consent framing on the report screen, given a parent is reading a minor's chart? Not on the reviewer's list; raised here because it is the larger content question behind §5.4.

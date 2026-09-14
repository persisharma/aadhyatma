# PRD-43 — Kundali reading: synthesis, precision and age-awareness (विवेचन · संश्लेषण)

| | |
|---|---|
| **Status** | Proposed. Follows PRD-20 Phase 6 (`kundaliReport.ts`, `KundaliReportScreen`, `kundaliHandoff.ts`). |
| **T-shirt size** | M — one new pure engine module, one rewrite of `kundaliReport.ts`'s composition layer, no new dependency, no new screen. |
| **Blocked on** | Nothing. The §14.3 decision was taken on 14 Sep 2026 — **Option 3 (remove), with hard bans retained**. RULEBOOK §14.3 is rewritten; §14.3.6 pins the AI/network boundary separately. |
| **Feasibility** | Every input already exists in `KundaliChart` + `computeSadeSati`. Nothing new is calculated from the ephemeris. |

> **Product stance unchanged:** offline, deterministic, tradition-framed. This PRD adds *synthesis of placements the engine already has* — it does not add astrology data, AI, or network. The question it answers is whether "synthesis" is allowed to describe a person, which is a §14.3 decision, not an engineering one.

## 1. Problem

A reviewer read a full 2013-born child's report export (`buildKundaliHandoffText`) and rated it: calculation/data ~8/10, wording ~7/10, **interpretation depth 4–5/10**. Ten specific defects were raised. All ten reproduce in the current code. They fall into three very different classes, and conflating them is the main risk in this work:

| Class | Defects | Nature |
|---|---|---|
| **A — Correctness/precision bugs** | ordinal grammar, dasha dates vs floored ages, Mahadasha-at-birth ambiguity, Sade Sati with no "as of" date, disclaimer repeated per life-area | Objectively wrong or noisy. No policy question. |
| **B — Missing composition** | no executive summary, current Maha·Antar pair not interpreted, combinations (conjunctions/yogas) never read together, sections not age-aware | Needs new composition, but stays structural. Mostly inside §14.3. |
| **C — "Real personalised reading"** | education strengths, temperament, creativity, suitable interests, likely challenges, strengths to nurture, parent guidance | **Currently banned by RULEBOOK §14.3** and enforced by a test. Requires an explicit product/content decision. |

## 2. The interpretation decision — TAKEN

RULEBOOK §14.3 previously said Kundali copy *"must not turn generic positions into fixed personality diagnoses or guaranteed life events."* That single sentence was the entire reason the reviewer's interpretation score was 4–5/10.

**Decision (14 Sep 2026, product):** remove it. Vedansh reads a chart the way an astrologer does — placement → combination → indication → practical direction — for a **stated purpose**.

What replaced it is not a weaker rule but a harder one. §14.3 is now seven numbered clauses; the load-bearing three are:

1. **Derivation is mandatory.** Every interpretive statement carries a `basis` — the bhavas, lords, grahas, yoga, dasha lords and gochar it came from — and the surface renders that chain. An empty `basis` is a **build failure**. The guard moved from *"did we avoid forbidden words"* (12 regexes, trivially evaded) to *"can every sentence name its evidence"* (structural, unevadable).
3. **Strength is counted, not asserted.** प्रबल / मध्यम / क्षीण from the number of **independent** agreeing factors. One factor can never render प्रबल. Contradictions are shown, never resolved in the flattering direction.
5. **Hard bans survive**: longevity/death, medical/psychiatric/legal/financial directives, health prognosis, fear copy, dosha-as-curse, remedy commerce, luck scores, and every purpose gated by the subject's derived age.

And §14.3.6 now pins determinism and the **AI/network ban on its own clause**, because §14.4 previously said that ban held *"until §14.3 is explicitly rewritten"* — rewriting §14.3 would silently have unpinned it. That cross-reference now points at §14.3.6 and nowhere else.

**This makes Wave C unblocked and adds a new Wave D (प्रश्न), which is now the centrepiece of the work.**

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

## 6. Wave C — indications (unblocked)

Per combination and per age band, an `indications` block in the domains: **learning style, temperament, interests, what to encourage, where tradition counsels patience, suitable direction**. Each indication is a typed record, never a hand-written paragraph:

```ts
export type Indication = {
  id: string;
  domain: 'learning' | 'temperament' | 'interests' | 'work' | 'resources' | 'relations' | 'constitution';
  strength: 'prabal' | 'madhyam' | 'ksheen';   // counted, never asserted
  supportingFactorIds: readonly string[];       // ≥ 3 independent → prabal
  opposingFactorIds: readonly string[];         // non-empty → the copy must name the tension
  basis: readonly BasisNode[];                  // REQUIRED, non-empty — empty fails the build
  ageBand: 'child' | 'adolescent' | 'adult';
  titleHi / titleEn / bodyHi / bodyEn: string;  // composed from phrase tables, not authored
};
export type BasisNode =
  | { kind: 'bhava'; house: number }
  | { kind: 'lord'; graha: Graha; ofHouse: number; inHouse: number }
  | { kind: 'graha'; graha: Graha; house: number; dignity?: Dignity }
  | { kind: 'yoga'; yogaId: string }
  | { kind: 'dasha'; level: 'maha' | 'antar'; lord: Graha; startKey: string; endKey: string }
  | { kind: 'gochar'; graha: Graha; fromMoonHouse: number; asOfDateKey: string };
```

`BasisNode` is the whole safety model in one type. It is what the आधार chain renders, what the test asserts is non-empty, and what makes the reading auditable by a user who distrusts the sentence.

## 6a. Wave D — प्रश्न: purpose-driven readings (NEW, the centrepiece)

**Prototype: [`docs/kundali-prashna-prototype.html`](../../kundali-prashna-prototype.html)** — clickable, two personas × five worked purposes, in the shipped manuscript palette.

People do not consult an astrologer for a report. They arrive with a purpose: *my daughter's studies*, *should I start this venture*, *should I change jobs*. Wave D is that surface.

### 6a.1 Nine purposes, typed like `EVENT_RULES`

`prashnaPurposes.ts` — one record per purpose, carrying its bhavas, natural karakas, relevant dasha/gochar rules, and `minAge`:

| id | पुरुषार्थ | Bhavas | Karakas | minAge |
|---|---|---|---|---|
| `vidya` | विद्या — study, exams | 4 · 5 · 9 | Jupiter, Mercury | 0 |
| `vyapar` | व्यापार — business, new venture | 7 · 10 · 11 · 3 | Mercury, Jupiter, Mars | 18 |
| `naukri` | नौकरी — job, service | 6 · 10 · 11 | Saturn, Sun | 18 |
| `dhan` | धन — money, property | 2 · 4 · 11 | Jupiter, Venus, Mars | 18 |
| `vivah` | विवाह — marriage | 7 · 2 · 11 | Venus, Jupiter | 21 |
| `santan` | संतान — children | 5 · 9 | Jupiter | 21 |
| `swasthya` | स्वास्थ्य — constitution & routine | 1 · 6 · 8 | Sun, Moon | 0 · no prognosis, ever |
| `yatra` | यात्रा — travel, abroad | 3 · 9 · 12 | Rahu, Moon | 0 |
| `man` | मन — peace of mind, focus | 4 · 1 · 12 | Moon | 0 |

Adding a tenth purpose is a **data edit**, not an engine change — and carries the same §10 two-source verification gate `EVENT_RULES` carries. A gated purpose renders **dimmed with its reason visible**, never hidden.

### 6a.2 The answer, in six fixed blocks

**सार** (one-sentence answer + strength pill) → **आधार** (the basis chains) → **बल / बाधा** (two columns; both fill when factors contradict) → **काल** (dated supportive windows from `vimshottari` + `computeUpcomingIngresses`) → **दिशा** (what to actually do) → **उपाय** (allow-listed practice). One disclaimer at the foot.

### 6a.3 Five deterministic passes (`prashna.ts`, pure, source-purity tested)

1. **Gather** — the purpose's bhavas, their signs, lords, lord placements, occupants; karaka placements and dignity. ~12–20 typed facts.
2. **Weigh** — each fact becomes a signed `Factor` with its `basis` attached **at creation**. Kendra/trikona and own-sign/exaltation support; 6/8/12 and debilitation resist; retrograde qualifies.
3. **Time** — do the running Maha/Antar lords own or occupy the purpose's bhavas? What is transiting them now? When does the next relevant antardasha start? → the काल windows.
4. **Resolve** — net the factors into a strength; ≥3 independent supports and no strong resistance → प्रबल; mixed → मध्यम **and the सार must name the tension**.
5. **Speak** — compose from phrase tables keyed (factor kind × strength × age band). Nothing authored per chart.

### 6a.4 It plugs into surfaces that already exist

- **Jyotish landing (§51c)**: प्रश्न is a **full-width lead card above** the 2×2 door grid, not a fifth tile. The grid answers *"what does my chart say"*; प्रश्न answers *"what should I do"*. One insert; the one-fold constraint holds.
- **जिज्ञासा / Ask Vedansh (§71)**: one new intent `prashna.purpose` with a required `purpose` slot, so *"क्या मुझे व्यापार शुरू करना चाहिए"* resolves in the existing grammar and deep-links to the answer. No new search surface.
- **Muhurat Finder (PRD-16)**: दिशा for `vyapar` / `yatra` / `vivah` links out to the shipped finder for *when to begin* — the two features complete each other instead of overlapping.
- **Practice library**: उपाय stays inside the shipped 3-id allow-list.

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
- **Waves C/D additionally**: `basis`-completeness over every emitted `Indication` (empty = fail); strength arithmetic (one factor never yields प्रबल); the full age-gate matrix (every purpose × every band); absolute-claim scan; fatality/longevity scan (आयु, `lifespan`, `death`, मृत्यु); medical/financial-directive scan; commerce scan (`gemstone`, रत्न, `consult an astrologer`); `prashna.ts` source purity; determinism across two builds of the same (chart, purpose, now); `prashna.purpose` intent resolution + abstention; and a `swasthya` no-prognosis assertion.
- e2e: new `.maestro/prashna-smoke.yaml` — landing lead card → purpose picker → gated purpose shows its reason → विद्या answer renders all six blocks with a non-empty आधार chain.
- Docs: `design.md` (new §72 — the प्रश्न surface, six blocks, आधार chain spec) + `RULEBOOK.md` §14.3/§14.3.6/§14.4 updated in the same series (`.claude/rules/design-doc-sync.md`).

## 9. Sequencing

| Wave | Contents | Depends on |
|---|---|---|
| **A** | §4.1–4.5 — ordinals, dasha dates + balance-at-birth, "as of" stamp, disclaimer dedupe, handoff parity | nothing |
| **B1** | §5.2 current-period reading + maitri table | A |
| **B2** | §5.1 `kundaliYoga.ts` + `combinations` section | A |
| **B3** | §5.3 snapshot + §5.4 age-awareness | B1, B2 |
| **C** | §6 indications (`Indication` + `BasisNode`) | B2 · §14.3 rewrite — **done** |
| **D** | §6a प्रश्न — nine purposes, six-block answer, landing lead card, `prashna.purpose` intent | C |

Wave A is the one that changes the reviewer's "wording 7/10" and most of the "machine-generated" feel, and it carries no policy risk. Wave B is where 4–5/10 interpretation moves without touching the safety contract. Wave C is now unblocked. **Wave D is the actual product** — A through C exist to make it trustworthy.

## 10. Open questions

1. ~~§2: which interpretation option?~~ **Settled — removed, with §14.3's hard bans retained.**
2. Yoga allow-list — which five, and who signs off the two published sources per entry (same gate as `EVENT_RULES`)?
3. Age bands: is 13–17 one band or two (13–15 / 16–17)?
4. Does the **child-subject** case need its own consent framing, given a parent now reads purpose-driven indications about a minor? §14.3.5 closes the five adult purposes and fixes the register, but does not ask for consent.
5. `swasthya` is the one purpose where the removed rule did real safety work. Ship it in Wave D, or hold it to a later wave with its own content review?
6. The §10 two-source gate applies to the nine purpose records (bhava/karaka sets). Who signs those off, and does Wave D ship `verified:false` behind a flag as `EVENT_RULES` does?

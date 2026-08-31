# PRD-25 — जिज्ञासा · Ask Vedansh

> *The app computes far more than it can be asked. One line of input turns twenty-four PRDs of buried intelligence into something a household can actually reach — and makes every future feature discoverable on the day it ships.*

| | |
|---|---|
| **Status** | Proposed — Q4 2026 flagship (Oct–Dec 2026, 13 weeks) |
| **Origin** | Planning session 2026-08-30, against `main` @ `b38e363`, app 1.4.6 |
| **Design** | `design.md` **§67** (new — authored with Phase 1); extends §50 (Intent-Driven Discovery) and §48 (Home Today Strip) |
| **Contract** | `RULEBOOK.md` **§23** (new — intent registration becomes part of the add-a-feature contract) |
| **Release** | **OTA-shippable through Phase 3** — pure JS, no new native dependency, no new asset family. Phase 4 (voice) is the only store-release item. |
| **T-shirt** | L — four phases, one of which ships nothing user-visible on purpose |
| **Bet** | #1 for the quarter. Companion build: **PRD-20 सङ्कल्प** (see §10). |

---

## 1. The problem — depth without a door

Vedansh is now twenty-four PRDs deep. `navigation/types.ts` declares ~90 routes across 5 tabs: 69 library entries, 21 deities, a sidereal Jyotish engine, a 162-rule festival solver, a Choghadiya/Rahu-Kaal engine, an event-muhurat finder, seven guided vidhis, ten verified bhog profiles, a 73-temple Theerth map, Namkaran, Guna Milan, Pitru Smaran, Vastu Disha, Sadhana Programs, widgets and seven-plus local notification families.

**All of that is reachable only by knowing it exists.** There is exactly one place in the app where a user expresses intent in their own words — the search box — and it answers from the *text corpus alone*. `searchIndex.ts:163` pins the union:

```ts
export type SearchEntry = SearchSectionEntry | SearchDeityEntry | SearchVerseEntry;
```

Sections, deities, verses. No panchang, no muhurat, no observance, no vrat, no bhog, no vidhi, no vastu, no kundali, no temple, no routine, no sadhana. So today the box answers *"कर्मण्येवाधिकारस्ते"* perfectly and cannot answer **"कल एकादशी है क्या"**, **"राहु काल कब है"**, **"गणेश जी को क्या चढ़ाएँ"**, **"गृह प्रवेश का मुहूर्त"**, **"मंदिर किस दिशा में"**, or **"शनिवार को क्या करें"** — every one of which the binary can compute or has verified content for, offline, right now.

§50 already recognised the need and solved a slice of it by hand: **Browse by Purpose** is fourteen curated intents, and all fourteen point at *texts*. It is the hand-built, content-only version of what this PRD generalises.

### 1.1 Why this is structural, not cosmetic

The asymmetry compounds in the wrong direction. Each new PRD adds a screen behind the More hub or a mode inside the Panchang tab. So the *cost* of discovering feature N+1 rises with N, while its *probability* of being discovered falls. At 24 PRDs the marginal user almost certainly touches Home, a reader, and the Today strip, and never learns that the muhurat finder, the bhog registry, or the disha chakra exist. **We are now building faster than we are being found.**

Two secondary consequences:

- **Content parity work is under-rewarded.** Every hour spent sourcing verified bhog, upvas and vidhi content lands behind three taps in a tab most users open for the tithi.
- **Retention is carried by the two surfaces that push** (notifications, widgets), not by the twenty-two that wait.

### 1.2 Honest evidence caveat

The bundle-only constraint means **there is no analytics** and therefore no usage proof that the computed half is under-found. The argument above is structural, not measured. This PRD does not paper over that — it ships the on-device instrument that would have told us (§7.2), and it is designed so that the *first* phase is measurable locally before the expensive phases run.

---

## 2. The bet

**A household types or speaks a question in Hindi, English or Hinglish, and gets an answer — computed, sourced, showing its working — with the one action that acts on it.**

Not a search result. An answer card: *"कल — गुरुवार, 12 दिसम्बर — शुक्ल एकादशी, मोक्षदा एकादशी। पारण 13 दिसम्बर 06:52–09:14।"* with **व्रत विधि · क्या खाएँ · याद दिलाएँ** underneath.

**Why this is an unlock and not a feature:**

1. **It converts navigation-bound depth into query-bound depth.** Twenty-four PRDs of work stop depending on the user having explored a tab.
2. **Every future PRD gets discovery for free.** Registering an intent becomes part of the shipping contract (RULEBOOK §23). Feature N+1 is askable on day one instead of waiting for a Home tile it will never get.
3. **The same resolver drives the proactive half.** A briefing, a widget, and a notification are all just standing questions asked on the user's behalf (Phase 2). Build the answer engine once, get the push surfaces as a projection of it.
4. **It is the last cheap distribution mechanism a bundle-only app has.** No backend, no store-listing rewrite, no content acquisition — the value is already in the binary and merely unaddressable.

---

## 3. Product principles — the stance guards

1. **A grammar, not a model** (mechanism and a runnable spike in **§13**). Bundled, deterministic, offline. No LLM, no network call, no telemetry, no inference. The same question returns the same answer forever, and every intent is unit-testable like `muhurat.ts` is today.
2. **Never invent.** Below the confidence threshold the resolver falls back to *did-you-mean* chips plus today's content search — unchanged. In this domain a confidently wrong answer (a wrong tithi, a wrong parana time, a wrong naivedya) costs more than no answer. **Answer-or-abstain is a hard rule, pinned by a test.**
3. **Always show the working.** Every computed answer exposes its trail — the §51 "no opaque verdict" rule generalised to the whole app. Every content-backed answer carries provenance and inherits the `status: 'draft' | 'verified'` gate that `upvasContent` and `bhogContent` already enforce: **a draft entry is never answerable.**
4. **Not a chatbot, not an oracle.** No open conversation, no philosophical Q&A ("what is karma" is a *content search*, and stays one), no personal prediction, no divinatory framing ("will I get the job"), no luck score, no dosha alarm, no remedy upsell. §50's *"never creates an astrological prescription engine"* and §51's prohibitions carry over verbatim and get pinned.
5. **An answer ends in an act.** Not a wall of prose — one primary action, drawn from surfaces that already exist.
6. **The library search does not regress.** जिज्ञासा sits *above* today's results in the same box; a query that is not a question behaves exactly as it does in 1.4.6.

---

## 4. Architecture

Four pure modules under `mobile/src/ask/`, no React, no I/O — so they run under `tsx --test` like the panchang engine (and are therefore **excluded from Jest**, per the two-runner gotcha).

### 4.1 The intent registry — `src/ask/intents/`

Each capability registers itself:

```ts
export type AskIntent = {
  id: string;                       // 'observance.next', 'bhog.deity', 'muhurat.event'
  family: AskFamily;                // for the breadth metric (§7)
  triggers: readonly Trigger[];     // lexeme patterns, hi + en + hinglish
  slots: readonly SlotSpec[];       // { name: 'deity', type: 'deity', required: true }
  resolve(ctx: AskContext, slots: ResolvedSlots): AskAnswer | null;
};
```

`resolve` calls the **existing** engine — `usePanchang`'s pure core, `muhurat.ts`, `festivalEngine.ts`, `eventMuhurat.ts`, `upvasContent`, `bhogContent`, `data/vidhi`, `data/vastu`, `kundali.ts`, `theerth/temples.ts`. **This PRD writes no new domain logic.** Returning `null` is legal and means abstain.

### 4.2 The answer contract

```ts
type AskAnswer = {
  headline: Localized;            // one line, the answer itself
  lines: AnswerLine[];            // label · value rows (तिथि · शुक्ल एकादशी)
  working?: WorkingRow[];         // the computation trail, collapsed by default
  provenance?: SourceRef;         // content-backed answers only; verified-only
  actions: AskAction[];           // ≤ 3, first is primary
  confidence: 'exact' | 'likely'; // 'ambiguous' never reaches a card
};
```

`AskAction` deep-links through the existing `entryRoutes.ts` / `navigateToEntryStart()` machinery — no new navigation surface.

### 4.3 The lexicon — generated, never hand-maintained

`scripts/build-ask-lexicon.mjs` (Node ESM, the `scripts/*.mjs` pattern) emits `src/ask/lexicon.generated.ts` from the code's own registries: deities (21), library entries (69), festival rules (162), the vrat catalog, `EVENT_RULES` occasions, vidhi ids (7), bhog profiles (10), temples (73), purposes (14), plus the closed vocabularies — 12 rashi, 27 nakshatra, 9 graha, 8 dik (reusing `DISHA_LABELS` from `eventMuhurat.ts`, per PRD-24's one-vocabulary rule), tithi, vaar, maas.

Each id carries surface forms in **hi (Devanagari) · en · Hinglish**. Hinglish is machine-derived through the transliteration layer the gu/kn reading languages already use, plus a curated alias file (`aliases.ts`, hand-owned) for what no transliterator produces: *bajrangbali · hanumanji · shukravar · friday · ekadasi · gruh pravesh · rahukal*.

**Anti-drift gate:** `askLexicon.coverage.test.ts` fails if any registry gains an entry with no lexicon coverage — the discipline `backgrounds.coverage.jest.test.ts` already enforces for artwork. A new deity or festival cannot ship unaskable.

### 4.4 The resolver — `src/ask/resolve.ts`

`normalize` (today's `searchNormalize.ts` — it already folds IAST → ASCII — plus Devanagari folding) → tokenize → longest-match entity tagging off the lexicon → intent scoring (trigger hit + slot fit + context prior) → threshold. Above it, one answer card. Below it, chips and the existing content results. Deterministic; no ranking model.

### 4.5 Context — `AskContext`

Today's date/time, the Panchang location, the saved birth profile (only if one exists), the active routine/sadhana, the reading language. This is what makes **"कल"**, **"मेरा राशिफल"**, **"मेरी दशा"** and **"मेरा संकल्प कितना हुआ"** resolvable — and what must degrade to a correct guest answer when there is no profile, never to a prompt wall.

---

## 5. The v1 intent slate

Sixteen families, ~40 question shapes. Every one calls an engine that already ships.

| Family | Asked as | Resolves via |
|---|---|---|
| `panchang.day` | आज कौन सी तिथि है · what's today's nakshatra | panchang engine |
| `observance.next` | एकादशी कब है · next purnima · kal vrat hai kya | `festivalEngine` · `vratCatalog` |
| `muhurat.now` | राहु काल · abhi shubh hai kya · choghadiya | `muhurat.ts` |
| `muhurat.event` | गृह प्रवेश का मुहूर्त · mundan muhurat december | `eventMuhurat` → finder, prefilled |
| `vrat.how` | एकादशी व्रत कैसे करें · parana kab | `upvasContent` · `upvasParana` |
| `bhog.offer` | गणेश जी को क्या चढ़ाएँ · shiv ji ka bhog | `bhogContent` (verified only) |
| `bhog.avoid` | क्या नहीं चढ़ाना चाहिए | `bhogContent` निषेध |
| `vrat.food` | व्रत में क्या खाएँ | `bhogContentExtended` |
| `vidhi.how` | सत्यनारायण पूजा विधि · karwa chauth kaise | `data/vidhi` → conduct mode |
| `katha.find` | एकादशी की कथा | katha library |
| `text.find` | हनुमान चालीसा · कर्मण्येवाधिकारस्ते | today's `searchIndex` (unchanged) |
| `japam.mantra` | शनि मंत्र कितनी बार | `data/japam` → counter, pre-set |
| `kundali.self` | मेरी कौन सी दशा चल रही है | `kundali.ts` + saved profile |
| `rashifal.day` | आज का राशिफल | `RashifalScreen`'s pure core |
| `vastu.direction` | मंदिर किस दिशा में · sone ki disha | `data/vastu` |
| `theerth.find` | ज्योतिर्लिंग कितने हैं · pass ka mandir | `theerth/temples` |
| `pitru.tithi` | पिताजी की तिथि कब है | `pitruSmaran` (private, on-device) |
| `sadhana.progress` | मेरा संकल्प कितना हुआ | `SadhanaContext` |

**Deliberately not answerable in v1:** anything predictive or personal-advisory, anything backed by a `draft` entry, and "what is X" philosophy — the last routes to content search by design.

---

## 6. Phasing — 13 weeks

### Phase 0 · weeks 1–2 — the substrate (ships nothing)
Resolver core, `AskAnswer` contract, generated lexicon, coverage test, and the **golden corpus**: 300 real questions in hi / en / Hinglish with expected intent + slots, authored before the resolver, committed as the merge gate. No UI. Deliberately invisible: the whole feature's credibility is set here.

### Phase 1 · weeks 3–6 — जिज्ञासा, the answer-first box (OTA)
The existing Search box gains an answer card above the existing results. Did-you-mean chips below the threshold. Recents become recent *questions*. A Home entry point whose placeholder rotates through **real answerable questions** — which doubles as the feature-discovery surface for the whole app. **Ship gate: ≥85% top-1 on the golden corpus, 0 wrong-answer failures.**

### Phase 2 · weeks 7–9 — आज का विधान, the standing questions (OTA)
The same resolver, asked on the user's behalf: *what is today · what does today ask of me · what is running in my chart · what is due in my sankalp*. Lands as the Today strip's **detail view** (§48) — not a sixth tab, not a second Today cluster; §50's own fold-budget scar is a design constraint here. Plus one widget variant and one notification family, inside the shared iOS pending budget.

### Phase 3 · weeks 10–12 — answers that act (OTA)
The action layer: start the japam pre-set to its saṅkhyā · add to routine · set a japam alarm · prefill the muhurat finder · open conduct mode · push samagri into the vidhi checklist. Plus **ask-from-context** — a question affordance inside Panchang, Vidhi and Kundali, seeded with that surface's entities.

### Phase 4 · stretch, likely next quarter — voice
Native STT is a **new native module and therefore a store release** (which per the repo gotcha drags `APP_TOUR_VERSION` and a `whatsNew` entry). Voice is what makes this feature usable by the household member with wet hands and reading glasses on the other side of the kitchen — it is the real endgame, and it is deliberately *not* on the quarter's critical path. Sequence it behind whatever store release PRD-24 already requires.

---

## 7. Metrics — measured bundle-only

### 7.1 Targets
| Metric | How | Q4 target |
|---|---|---|
| Answered-rate, corpus | golden corpus, in CI | ≥ 85% top-1, **0** wrong answers |
| Answered-rate, in-field | local counter: cards shown ÷ asks | ≥ 70% |
| Action-take rate | local counter | ≥ 35% of answer cards |
| **Breadth** — distinct intent families reached per user per 30 days | local counter | ≥ 4 |
| D30 return | existing launch-date ring buffer | +4 pts vs. pre-ship cohort |

**Breadth is the real KPI.** It is the direct measure of the problem in §1 — whether the computed half of the app is being reached at all.

### 7.2 The instrument that replaces analytics
An **on-device unanswered-question log**: a capped ring buffer of questions that fell below threshold, stored locally, **never auto-sent**, visible in the in-app diagnostics screen, and shareable by the user through the OS share sheet exactly like the crash log (PRD-06) and the discrepancy report. Each release's grammar improves from what real households actually asked. This is the feedback loop a server would have given us, taken on the app's own privacy terms.

---

## 8. Non-goals

- No LLM, no on-device model, no network, no server, no accounts. (Restating, because this is the feature most likely to attract the suggestion.)
- No free-form conversation, no follow-up turns, no "chat history".
- No prediction, no divination, no advice on personal matters, no health/legal/financial questions — all abstain with a graceful redirect.
- No new content. If an answer needs content the binary does not ship verified, the intent abstains.
- No replacement of Browse-by-Purpose (§50) or the library search. Both survive unchanged.
- No answer to a `draft` entry, ever.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| **Hinglish/vernacular NLU is genuinely hard** and a grammar will miss forms a model would catch | Bounded slate (16 families, not open domain); entities are closed sets straight from code; golden corpus as a merge gate; abstain-over-guess; the unanswered log turns every miss into next release's pattern |
| **Users read a question box as a chatbot** and ask "should I marry him" | Placeholder copy shows real answerable questions; a scoped-refusal answer with a warm redirect, pinned by a test; framed as जिज्ञासा (the desire to know), never as a पंडित who advises |
| **A wrong parana time or tithi does real harm** to someone's observance | Answer-or-abstain; verified-only gate; "show the working" on every computed answer; the corpus asserts values against the engines, not against transcribed expectations |
| **Cold-start regression** — a lexicon over 162 festivals + 73 temples + 69 texts loaded at launch | Lazy, exactly like `getSearchIndex()`; a launch-time budget test; Phase 1 ships behind the same first-frame gate as fonts |
| **Bundle growth** | Lexicon is generated text; budget **< 250 KB**, asserted |
| **Scope drift into a sixth tab** | Phase 2 is explicitly a *detail view* of §48, and the §50 fold-budget history is cited in the design section |
| **Phase 0 looks like two weeks with nothing to show** | Named as such in this PRD, with the corpus as its visible artefact; do not let it be compressed |

---

## 10. How this sits against PRD-20 / 21 / 22

The Q4 candidates doc (`2026-Q4-candidates.md`) proposed five household-practice features; PRD-23 and PRD-24 shipped in August. Of the remainder:

- **PRD-20 सङ्कल्प — build it, as this quarter's companion.** It is small, OTA, computational, and it is the single best *act* an answer can end in ("आज का सङ्कल्प" from any answer card). It also settles the birth-profile schema change (gotra) once, which the candidates doc flags as the avoidable cross-cutting mistake. Flagship + companion is the quarter's shape.
- **PRD-21 नवग्रह उपाय — defer to Q1 2027.** Its 9-row table would make `graha.day` first-class; without it that intent still answers honestly with the vaar deity and the shipped stotram, which is what the app says today.
- **PRD-22 हवन — defer.** Phases B/C are content-egress-gated; Phase A's āhuti mechanic is real but it deepens a surface a minority reaches, which is precisely the ordering this PRD argues against for now.
- **PRD-23 / 24 need no work at all** — they become askable the day their intents are registered. That is the compounding effect, demonstrated on features already paid for.

**The ordering argument in one line:** with 24 PRDs shipped and no analytics, the marginal value of PRD-25 (making all 24 reachable) exceeds the marginal value of PRD-25-as-more-content — and every quarter we defer it, the backlog of unfound work grows.

---

## 11. Acceptance and release gates

Inherits `RULEBOOK.md` §0/§0.1 in full:

1. **Unit + Maestro e2e with every change.** New e2e flows: ask-answer-happy-path, ask-abstain-fallback, ask-action-deeplink (per phase).
2. **`design.md` §67 authored in the same PR series as Phase 1**, and §48 updated when Phase 2 changes the Today strip; §50 gains a pointer explaining how purposes and intents relate.
3. **`RULEBOOK.md` §23** — the intent-registration contract: *a new user-facing capability ships with at least one registered intent, its lexicon coverage, and its golden-corpus questions.* This is the clause that makes the unlock permanent rather than a one-quarter cleanup.
4. `npm run lint` at **0 errors**; `src/ask` tests run under `tsx --test`, never Jest.
5. No cold-start regression; bundle delta < 250 KB.
6. Phase 1 does not ship unless the corpus gate is met (§6).

---

## 12. Open decisions

1. **One box or two?** Recommend: the **same** search box, answer-first — a second box splits intent and doubles the empty state. Needs a design call before Phase 1.
2. **Home entry placement.** The Today cluster's fold budget is already contested (§50's compact-strip rewrite). Where the ask affordance goes without pushing CATEGORIES below the fold is a design decision, not an implementation detail.
3. **Alias ownership.** Who curates `aliases.ts`, and does it grow from the unanswered log per release or per report? Recommend: per release, from the log, as a named checklist item.
4. **Does the briefing replace `TodayRecommendationsRow`?** Recommend: extend, do not replace — the row's festival-attribution contract is already pinned by `festiveReminders.test.ts`.
5. **Voice this quarter or next?** Depends entirely on whether PRD-24's pending store release can carry the STT dependency. If it can, Phase 4 becomes cheap; if not, it is Q1.
6. **Abstain copy.** What the app says when it will not answer is the single most brand-defining string in the feature. Needs the same care as the disclaimer copy in `data/help/content.ts`.

---

## 13. Appendix — how this works without an LLM

The objection this feature attracts first is *"natural language needs a model."* It does not, because
**this is not open-domain language understanding.** Three properties collapse the problem:

1. **The answer space is closed and already enumerated in code.** 21 deities, 13 `EVENT_RULES`
   occasions, 162 observance rules, 8 dik, 7 vidhis, 12 rashi, 27 nakshatra, 9 graha, 73 temples,
   69 texts. The system never has to *understand* a question — only to decide which of ~16 engines
   to call and with which id. That is classification over a fixed set, not generation.
2. **The engines already produce the answer.** No summarising, no synthesis, no prose. The resolver
   picks `bhogContent.forDeity('ganesha')`; the card is rendered from the typed result. Everything a
   model would be needed for — composing the sentence — is a formatting layer over shipped data.
3. **Abstention is free.** A model must answer; a grammar may decline. The hard rule in §3.2 turns
   the recall problem into a UX problem: a miss falls back to the search box the user already has.

### 13.1 The pipeline

```
"गणेश जी को क्या चढ़ाएँ"  /  "ganpati ko kya chadhaye"
      │
      ├─ fold()      Devanagari + IAST + Latin → one ASCII key
      ├─ tag         longest-match against the generated lexicon → deity=ganesha
      ├─ score       trigger lexeme hit + slot fit + context prior
      └─ resolve     bhogContent.forDeity('ganesha') → AskAnswer, or abstain
```

The only genuinely hard part is `fold()`, and it is script mechanics, not semantics:

- **Inherent vowel.** Devanagari is an abugida — a bare consonant carries an unwritten *a*. Skip it
  and मंदिर folds to `mndir`, which never meets the Latin `mandir`.
- **Schwa deletion.** Hindi drops the *word-final* inherent vowel; Sanskrit keeps it. मंदिर = `mandir`,
  but दिशा = `disha` (that final ā is written, not inherent). Both halves of the lexicon must land on
  one key or the Devanagari and Hinglish inputs never match each other.
- **Spelling noise.** `aa/ee/oo` collapse, doubled letters, `w→v`, `z→j`, and stem-tolerant head
  matching (`ganesh` ≡ `ganesha` ≡ `श्री गणेश`) absorb most of the Hinglish long tail.

`searchNormalize.ts` already does the IAST half; the transliteration layer behind the gu/kn reading
languages already does the abugida half. **Neither is new work — this composes two shipped modules.**

### 13.2 It runs today

[`docs/ask-resolver-prototype.mjs`](../../ask-resolver-prototype.mjs) is a ~150-line spike (`node
docs/ask-resolver-prototype.mjs`) that generates a 478-form lexicon from the real registries in
`data/deities.ts`, `panchang/eventMuhurat.ts` and `panchang/festivals.ts`, adds 8 hand aliases, and
resolves 8 intent families. On a 23-question set spanning Devanagari, Hinglish and English it
resolves **19**, and **3 of the 4 misses are the intended abstains** (`kya mujhe naukri milegi`,
`what is karma`, `mera bhavishya kya hai`). The one true miss — *"sone ki disha konsi honi chahiye"* —
is a missing `bedroom` alias, which is precisely what §7.2's unanswered log is for.

This is a spike, not an implementation: no context, no answer rendering, no confidence calibration,
23 questions instead of 300. It exists to settle the feasibility question before Phase 0 is funded.

### 13.3 What the spike exposed — a real design requirement

*"एकादशी कब है"* resolved to `dev-uthani-ekadashi`, because longest-match picked a specific named
instance when the user meant **the next Ekadashi of any name**. The lexicon therefore needs a
**class-vs-instance distinction**: recurring observance families (ekadashi, pradosh, purnima,
amavasya, sankashti, shivaratri) are classes that resolve to *next occurrence of the class*, and a
qualifier (`nirjala`, `mokshada`) narrows to the instance. Without it the app confidently answers a
different Ekadashi's date — the exact failure mode §3.2 exists to prevent. **This is now Phase 0's
first task**, and it is the kind of defect a golden corpus catches and a demo never would.

### 13.4 Where a model would help, and why it still is not worth it

A model would widen recall on phrasings the grammar has not seen, and handle code-mixed
sentences with clause structure. The costs: a network round trip or a large on-device model in an
offline-first bundle-only app; non-determinism in a domain where a wrong tithi is a real harm;
unauditable answers against the app's show-the-working stance; a per-query cost with no revenue
model behind it; and privacy exposure on questions like *"पिताजी की तिथि कब है"*. The grammar's
recall gap is measurable and closes release over release from the on-device log. **The trade is not
close, and it may never be — but if it ever is, the intent registry is exactly the interface a model
would target: it would replace `resolve()` and keep every engine, contract and guard intact.**

# PRD-46 — प्रथा और मान्यता · "ऐसा क्यों करते हैं?"

| | |
|---|---|
| **Status** | **Verification continuation (2026-10-28):** registry `mobile/src/data/pratha/` holds all 208 Appendix A rows. The first 13 Kartik entries are verified against opened publications; all others remain draft until separately reviewed. Story-level provenance, the ten-row pilot gate and regression tests are in place. Phase 1 surfaces are next. |
| **T-shirt size** | Code: **M** (one registry, one hub, one reader, five contextual hooks — all existing patterns). Content: **XL** — 204 rows × (author + two-source verification). Content, not code, sets the schedule. |
| **Parent / siblings** | Pattern parent: [PRD-44 पितृ पक्ष परिचय](./44-pitru-paksha-shiksha.md) (verified-only education registry, RULEBOOK §28). Siblings it must link to, never duplicate: the katha library (`panchang/kathaContent/`), [PRD-23 bhog](./23-bhog-naivedya-vrat-food.md), [PRD-19 vidhi](./19-puja-vidhi.md), [PRD-26 daan](./26-daan-punya.md), Theerth (`data/theerth/`), [PRD-41 जिज्ञासा](./41-jijnasa-ask-vedansh.md), [PRD-42 regional lens](./42-regional-parv.md). |
| **Research input** | [`docs/content-parity/manyata-kathas.md`](../../content-parity/manyata-kathas.md) — ~200 rows of beliefs + stories with source tags. This PRD narrows that to **customs people actually perform or avoid**, and adds what it lacks (Kartik itself, weekdays, household, sanskar, nature). |
| **Prototype** | [`docs/pratha-manyata-prototype.html`](../../pratha-manyata-prototype.html) — clickable. Covers every §6 surface: masa card + empty state, hub (8 tabs), reader (प्रथा → कथा pages → भाव/बोध → आगे), six-katha Diwali, बोध, Observance "यह क्यों?", आज क्यों?, bhog क्यों?, search, Ask (+ omen abstain), share card, opt-in month notice. Sample copy only — unverified. |
| **Feasibility** | ✅ Pure TS + bundled text — OTA-shippable after approval (RULEBOOK §0.3). No engine change: every date comes from rules the Panchang already solves; the current masa comes from `PanchangData.lunarMonth` (`panchang/engine.ts:987`). |

> **Design intent.** The app tells a family *when* Kartik starts, *what* to offer on Dhanteras and *how* to do a Tulsi puja. It never answers the question every child asks while the diya is being lit: **"ऐसा क्यों करते हैं?"** This PRD adds that answer for every famous custom: the custom, the story or stories behind it, what it means, and an honest label for where the story comes from (scripture, a Purana, folk tradition or history). It is surfaced on the day, in the month and inside the observance where the question comes up.

---

## 0. The honest content gate (read first)

1. **Phase 0 was authored without opened sources.** Its session could not reach wisdomlib.org or sacred-texts.com. In the continuation on 2026-10-28, external source pages were opened successfully. RULEBOOK §11.1 still requires two independent publications per story; access alone never verifies a row. The reviewer records the pages actually read and the adjudication, or leaves the row draft with the specific missing evidence. An inaccessible second source is never replaced by a search snippet or model memory.
2. **The bundled corpus is the strongest rung, but it is thin for this topic.** The Gita and Valmiki are bundled. Only 19 verses of Ramcharitmanas Bal Kand are bundled. **No Purana is bundled**, and most customs trace to Puranas. Anchors verified in-repo today:
   - Gita 1.15, 3.13, 4.24, 8.24, 9.26, 10.21, 10.25, 10.26, 10.28, 10.31, 10.35 and 17.7–10.
   - Valmiki 1.18.8 (Rama's birth, Chaitra Shukla Navami).
   - Valmiki Bala 38–44 (भगीरथ — already anchors a Pitru katha).
   - **Not usable:** Valmiki 6.107 (आदित्यहृदय). The bundled sarga has collapsed word spacing and Hindi meanings shifted by one verse (6.107.2 repeats 6.107.1's meaning). It is a defective corpus row under RULEBOOK §28.4, so W8 is meaning-only until the corpus is repaired.
3. **A finding that shapes the copy:** the bundled Valmiki Yuddha Kanda sargas 120–131 (the return to Ayodhya) contain **no lamp festival**; the only दीप is servants carrying oil lamps at 6.131.47. "Diwali lamps for Rama's return" must therefore render as **लोक-परम्परा**, not as Valmiki. The research manifest already suspected this (`[Likely] later`). It is now confirmed against the shipped text.
4. **Folk does not mean unshippable; it means labelled.** Most famous customs (Karva Chauth's sieve, Ahoi, Diwali gambling, Basoda) have no scriptural source. If this layer shipped only scripture it would miss most of what people ask about. If it shipped folk stories as scripture it would repeat the misattribution that RULEBOOK §11 was written to stop. §4 resolves this: a folk row is verifiable as **"this is what is practised and what is told"**, and its canon line says so.

## 1. Problem

- Households practise dozens of customs every month: Kartik deepdaan, Yama's lamp facing south, Tulsi at dusk, no moon on Ganesh Chaturthi, first roti for the cow, oil for Shani on Saturday. Almost nobody can say why.
- The answers people find elsewhere fall into three groups: fear copy ("पाप लगेगा"), invented attributions ("as the Skanda Purana says…" with no chapter), or nothing.
- Vedansh already holds fragments of the answer:
  - 13 katha-library entries explain a practice's origin, but have no verification gate.
  - Bhog has 3 "do not offer" rows that give **no reason**.
  - Daan has 20 occasions, each with a `why`.
  - Theerth has 60 temples with `parampara` sections.
- None of these is reachable from the question "क्यों?". A rule can hold only **one** `kathaId` (`panchang/types.ts:251`), so an observance cannot point at both its vrat katha and the story behind each of its customs.

## 2. Goal and non-goals

**Goal.** For every famous Hindu custom or belief, the app answers four things in under a minute of reading:
1. **What** is done.
2. **Why** — the story, or several stories side by side when regions differ.
3. **What it means** (भाव).
4. **Where that story comes from**, labelled honestly.

The answer appears where the question comes up: the observance, the month, the day, Ask, and search.

**Non-goals.**
- **No prescription.** This is not vidhi. Steps stay in PRD-19, food in PRD-23.
- **No remedies (upay)**, no omens, no fear.
- **No ruling between regions or families.** The family's practice is always right for that family.
- **No new liturgy.** Mantras are pointed at, never typed (§11.3).
- **No kids' edition in v1.** Kids-stories has its own contract (§29).

## 3. What counts as a row (inclusion test)

A row qualifies only if **all three** hold:
1. **It is practised or believed widely enough to be asked about.** That means at least one of: a pan-Indian custom; a custom tied to an observance the engine already solves; or a regional custom with a clear home region (labelled with it).
2. **It has a reason that is told.** That can be a story, an explanation in a text, or a dated historical origin. A bare omen with no story fails this test (see Appendix B).
3. **It can be explained without endorsing harm.** Customs that restrict people by caste, gender or bodily state are out of v1 (Appendix B lists them). They need a separate editorial decision, not a content sprint.

Kinds:
- `pratha` — a practice: something done or avoided.
- `manyata` — a belief: something held true, e.g. "death in Kashi gives moksha".
- `bodh` — a gentle correction where the popular story and the text differ, e.g. "Lakshman rekha is in Ramcharitmanas, not in Valmiki".

## 4. Provenance tiers (rendered — the core of the design)

Every katha on a row carries exactly one tier. The tier renders as a small label above the canon line. It is never hidden.

| Tier | Label | Meaning | Verification bar |
|---|---|---|---|
| `shastra` | **शास्त्र** | Veda, Upanishad, Itihasa, Gita, Smriti or Grihya-sutra; chapter.verse named | ≥2 refs. A bundled `ref` is required when the text is bundled (RULEBOOK §28.2 — quote only what resolves) |
| `purana` | **पुराण** | A named Purana or Mahatmya; khanda/adhyaya named | ≥2 refs naming the same adhyaya. A row that names a Purana without a chapter stays draft |
| `lok` | **लोक-परम्परा** | Folk telling; no text claimed | ≥2 sources that **describe the custom and the story told about it**. The canon line says लोक-परम्परा (+ region). It must never name a text |
| `itihas` | **इतिहास** | A dated historical origin (Tilak's public Ganesh Utsav, 1893; Khalsa, 1699; Mysore Dasara under the Wodeyars, 1610) | ≥2 refs, one of which is non-devotional |
| `kavya` | **काव्य** | Named literary work, sarga/verse; not presented as scripture or folk | Two independent opened publications of the cited passage |
| `agama` | **आगम** | Named Agama, section/verse | Two independent opened publications of the cited passage |

- **Several kathas per row.** Diwali has six (Rama's return, Lakshmi, Bali Pratipada, Kali Puja, Mahavira, Bandi Chhor). The row shows them side by side with region labels. It never ranks one above another. A `region` field can later let the PRD-42 lens put the user's region first; it never hides the others.
- **The tier is a fact about the source, not a judgement of the custom.** Copy never says "only folk". It says *लोक में यह कथा कही जाती है*.

## 5. Data model — `mobile/src/data/pratha/` (the §28 pattern)

```ts
type PrathaTier = 'shastra' | 'purana' | 'lok' | 'itihas' | 'kavya' | 'agama';
type PrathaAxis = 'masa' | 'parv' | 'vaar' | 'nitya' | 'puja-niyam' | 'prakriti' | 'sanskar' | 'tirth';

type PrathaKatha = {
  id: string;
  tier: PrathaTier;
  regionHi?: string; regionEn?: string;          // 'बंगाल', 'Mithila' …
  titleHi: string; titleEn: string;
  bodyHi: string[]; bodyEn: string[];            // retelling, 2–5 paragraphs
  canonHi: string; canonEn: string;              // 'पद्म पुराण, उत्तर खण्ड — कार्तिक माहात्म्य' | 'लोक-परम्परा (मिथिला)'
  ref?: { kind: 'gita' | 'valmiki'; chapter: number; verseIndex: number }; // bundled only
};

type PrathaEntry = {
  id: string;                                    // 'kartik-deepdaan'
  kind: 'pratha' | 'manyata' | 'bodh';
  axis: PrathaAxis;
  questionHi: string; questionEn: string;        // 'कार्तिक में दीपदान क्यों?' — the title IS the question
  practiceHi: string; practiceEn: string;        // what is done, descriptive, 1–2 lines
  kathas: PrathaKatha[];                         // ≥1
  bhavHi: string; bhavEn: string;                // the meaning
  bodhHi?: string; bodhEn?: string;              // popular-vs-text note, when one exists
  anchors: {
    ruleIds?: string[];                          // festivals.ts rule ids → Observance Detail
    masa?: number[];                             // lunarMonth.index → Panchang month card
    vaar?: number[];                             // 0–6
    deityIds?: string[]; theerthIds?: string[];
    kathaIds?: string[];                         // EXISTING katha-library entries (reuse, don't re-tell)
    bhogIds?: string[]; vidhiIds?: string[]; daanOccasionIds?: string[]; pitruIds?: string[];
  };
  status: 'draft' | 'verified';
  source: { referenceUrls: string[]; verificationNote: string; retrievedOn?: string };
};
```

- **Files (built):** `types.ts` (canonical shape — it adds `phase`, `source.confidence`, and the anchors `adhikMasa`, `libraryIds`, `prathaIds`, `pitru`; `masa` uses the engine's Chaitra = 1 … Phalgun = 12); one content file per axis — `masa.ts` (festival customs live here, keyed by month and `ruleIds`; there is no separate `parv.ts`), `vaar.ts`, `nitya.ts`, `pujaNiyam.ts`, `prakriti.ts`, `sanskar.ts`, `tirth.ts`, `bodh.ts`; `registry.ts` (joins the axes, holds the pure selectors); `index.ts` (verified-only accessors behind a `require()` thunk). `ruleIds` were derived from each row's katha link where that katha opens three or fewer observances (month-wide mahatmyas excluded).
- **Accessors in `index.ts`** expose verified rows only, loaded through `require()` thunks:
  - `getPratha(id)`
  - `getPrathaForRule(ruleId)`
  - `getPrathaForMasa(index)`
  - `getPrathaForVaar(d)`
  - `getPrathaByAxis(axis)`
  - `hasPratha()` — the one door predicate. All-draft means no door anywhere.
- **Types only re-export statically.** `launchGraph.test.ts` gains the `data/pratha/` content files in `FORBIDDEN`.
- **Reuse rule.** When the katha library already tells the story (e.g. `dhanteras-legends` for Yama's lamp, `ganesha-chaturthi-vrat-katha` for the moon), the pratha row gives the short answer and links that katha via `anchors.kathaIds`. It does not re-tell it.

## 6. Surfaces

| # | Surface | What | Where it plugs in | Phase |
|---|---|---|---|---|
| 6.1 | **Hub "ऐसा क्यों?"** `PrathaScreen` | Questions-first list. Default tab **इस मास** (current masa); then पर्व · वार · घर-आँगन · पूजा-नियम · प्रकृति · संस्कार · तीर्थ. Rows are questions, not topics. | New route on the Home stack (+ More, PRD-19 multi-stack pattern). Home DISCOVER spotlight key `pratha` | 1 |
| 6.2 | **Reader** `PrathaReader {prathaId}` | Pages: प्रथा → कथा (one page per katha, tier label + canon) → भाव → बोध (if any) → hand-offs (katha library, Gita/Valmiki verse, vidhi, bhog, Theerth). Share = the existing prose story card. | The Vrat Katha reader shell (pitru-shiksha "a long text reads in the reader shell" rule); a row in `readerReadAloud.test.tsx` | 1 |
| 6.3 | **Observance Detail — "यह क्यों?" card** | Up to 3 linked questions → reader. Renders only when `getPrathaForRule(rule.id)` returns verified rows. | `ObservanceDetailScreen.tsx`, between Story/Katha (:316) and How to observe (:341) | 1 |
| 6.4 | **Panchang — "इस मास की प्रथाएँ"** | The app's **first masa-level surface**: one card under the sky line naming the month and its 2–3 headline customs → hub on the इस मास tab. | `PanchangScreen.tsx` near the sky line (:242–255, :620); masa from `PanchangData.lunarMonth` | 1 |
| 6.5 | **FOR TODAY row — "आज क्यों?"** | On a day with a verified pratha for today's observance, one chip. Respects the row's existing cap and priority. | `TodayRecommendationsRow.tsx` (the daan-card precedent, :70–72) | 2 |
| 6.6 | **Bhog / vidhi "क्यों?" links** | The 3 reasonless `doNotOffer` rows (`bhogContent.ts:135,178`, `bhogContentExtended.ts:736`) gain a link to their pratha row (Ganesha/Tulsi, Shiva/Ketaki). | bhog panel + `bhog.avoid` Ask answer | 2 |
| 6.7 | **Search** | One section row per verified entry: `section:pratha:<id>`; matches question + practice + region. | `searchIndex.buildSectionEntries` (:296–300); count pinned in `searchIndex.test.ts` | 2 |
| 6.8 | **जिज्ञासा** | New intent `pratha.why` ("कार्तिक में दीया क्यों जलाते हैं", "why no Tulsi for Ganesha"). A new `pratha` entity in the lexicon. It answers with the short answer + tier + "पूरी कथा पढ़ें". Answers never come from a draft. | `ask/intents/index.ts` INTENTS order; corpus cases in `ask/__tests__/corpus.ts`; RULEBOOK §25 | 3 |
| 6.9 | **Theerth** | Temple `parampara` sections stay where they are. A `tirth` row links its temple via `theerthIds`, never copies its text. | `data/theerth/details/*` | 4 |
| 6.10 | **Season notification (optional)** | "इस मास क्यों?" once at masa start. Off by default; arms last under the iOS pending budget. Take it only if 6.4 shows use. | notifications planner | 5 |

## 7. Stance and copy rules (stance-guard test pins them)

- **Explain, never prescribe.**
  - Inherit the Pitru banned list: `must`, `you should`, `अवश्य करें`, `आपको … करना चाहिए`, `अशुभ`, `inauspicious`, `dosha`, `दोष`, `श्राप`/`curse` *as a threat to the reader*.
  - Add: `पाप लगेगा`, `अनिष्ट`, `दुर्भाग्य`, `bad luck`, `never do`, `गलती से भी`.
  - A curse **inside a story** is narrative and allowed (Chandra's curse is the story). The guard runs on `practice*`, `bhav*` and `bodh*` fields, not on katha bodies.
- **Family practice is always right.** Every reader ends with the PRD-44 footer pattern: *"यह परिचय है, विधान नहीं — परिवार की परम्परा सर्वोपरि है।"*
- **Corrections are gentle and specific.** Example: *"लोक में यह कथा प्रचलित है; वाल्मीकि रामायण के अयोध्या-आगमन प्रसंग में दीपोत्सव का वर्णन नहीं मिलता।"* Never "this is a myth" or "this is wrong".
- **Science is not used as a trump card.** Rationalisations such as "copper purifies water" or "the peepal gives oxygen at night" render only as a separately labelled note when sourced. They never replace the tradition's own reason.
- **Animal welfare facts may be stated plainly** (Nag Panchami: snakes do not drink milk). They are stated without moralising.

## 8. Phasing and rollout

| Phase | Scope | Rows | Gate |
|---|---|---|---|
| **0** (S) — **built** | Registry + types + accessors + stance guard + RULEBOOK §32 (tiers, folk-verification rule). All 208 rows imported as bilingual drafts. No UI. | 0 visible | Tests green |
| **1** (M) | **Kartik pilot**: hub, reader, Observance Detail card, Panchang masa card. Appendix A §A.1 authored (26 rows). | 26 | ≥10 verified Kartik rows before the hub door shows |
| **2** | Festival customs for the other 11 months, shipped **ahead of each season** in calendar order: Margashirsha → Paush → Magh (Makar Sankranti) → Phalgun (Holi) → … Also FOR TODAY chip, bhog links, search. | ~70 | Per-month: the hub's masa tab for a month opens only with ≥3 verified rows for it |
| **3** | Year-round axes: वार, घर-आँगन, पूजा-नियम, प्रकृति + `bodh` corrections. Ask intent. | ~80 | — |
| **4** | संस्कार, तीर्थ (linked to Theerth) | ~28 | Sensitive-topic decision (Appendix B) first |
| **5** | Optional masa notification | — | Product decision + 6.4 usage |

**Timing, honestly.**
- Kartik 2026 (purnimant) runs **26 Oct → 24 Nov** per the engine. Diwali is 8 Nov, Dev Uthani is 20 Nov, Kartik Purnima is 24 Nov.
- Phase 0+1 code is about a week. Verifying 10+ Kartik rows needs a networked reviewer, then build approval (RULEBOOK §0.3).
- **Best case: the pilot catches Dev Uthani → Dev Deepawali (20–24 Nov).**
- **Realistic case: it ships during Margashirsha as a year-round layer, and Kartik 2027 is its first full season.** Do not ship Kartik rows unverified to make the date. That trade is exactly what RULEBOOK §11 forbids.

**Success** (local per-device counters only — no analytics, per the roadmap constraint): reader opens from each surface (6.3 / 6.4 / 6.8), hand-offs taken into the katha library and verse readers, and shares.

## 9. Tests (all ship with the phase that adds the code — RULEBOOK §0)

- `src/data/pratha/__tests__/prathaContent.test.ts` (Jest):
  - Bilingual parity.
  - ≥1 katha per row; every katha has a tier.
  - `lok` canon lines contain `लोक-परम्परा` and name no text.
  - `purana` canon lines name an adhyaya/khanda.
  - Every `ref` resolves to the bundled verse its cite names (the pitru test's resolver).
  - Verified ⇒ ≥2 refs (≥1 https) + dated note; drafts' notes start with `DRAFT — NOT VERIFIED`.
  - Every `anchors.ruleIds` / `kathaIds` / `bhogIds` / `theerthIds` id exists.
  - Devanagari well-formedness.
  - The stance guard (§7).
- **Screens:**
  - Verified rows render and draft rows are absent, on the hub, the reader, the Observance card and the masa card. The check is non-vacuous: the registry holds drafts on purpose.
  - A draft `prathaId` falls back to the hub.
  - Masa card absent when the month has no verified row.
- **Other suites:** the `launchGraph.test.ts` FORBIDDEN entry; the reader row in `readerReadAloud.test.tsx`; `searchIndex.test.ts` count; Ask corpus cases.
- **e2e:** `.maestro/pratha-smoke.yaml` — Panchang masa card → hub → reader → back; Observance Detail "यह क्यों?" for a rule with a verified row. Season-gated like `pitru-paksha-smoke`.

## 10. Docs compliance

- **Phase 0:** RULEBOOK **§32** — the pratha contract: tiers, the folk-verification rule, reuse-don't-retell, the stance list.
- **Phase 1:** design.md **§86**, covering hub, reader, the "यह क्यों?" card, the masa card and tier labels (tokens: Pitru register for the tier label, `goldTint` भाव panel).
- **Phase 1:** design.md §62 (Observance Detail slot order) updated.
- **Phase 1:** wiki `subsystems/pratha.md` via the `llm-wiki` skill.
- **Phase 1:** roadmap README entry.

## 11. Open questions (product decisions)

**Owner decisions, 2026-10-28:** folk verification approved; hub name **“ऐसा क्यों?”**; separate **`kavya` and `agama`** tiers approved. This does not waive source verification, approve a single-source exception, or settle the remaining regional/art/sensitive-custom choices. Existing mixed draft stories stay draft until split and collated.

1. **Name.** "ऐसा क्यों?" (question-first; recommended — it is what people type) vs "प्रथा और मान्यता" vs "परम्परा परिचय".
2. **Who verifies, and how fast?** Agents cannot open sources (§0.1). Choose a networked reviewer, or the maintainer-attested exception per row (§11.1). This decision sets the whole schedule.
3. **Approve the folk-verification rule** (§4 `lok`): "two sources describe the custom and the story told about it". Without it, Phase 1 shrinks to about 8 Kartik rows.
4. **Sensitive customs** (Appendix B.2): exclude permanently, or a separate editorial track with its own review?
5. **Regional order:** show all variants equally (v1), or let the PRD-42 lens put the user's region first once it ships?
6. **Adhik maas:** show the base month's customs, or a Purushottam-maas set of its own (A.2 lists 2 rows)?
7. **Art:** reuse observance portraits (zero cost) or commission reader illustrations per row (expensive; §11.8 rules apply)?
8. **Small fix seen during research:** the `kartik-purnima` rule does not link `kartika-mahatmya` (`festivals.ts:449`). This could be fixed independently.


## 12. Handover — what the next session does

Phase 0 was built in a session that could not open any source (§0.1). The next session should have open web access. That changes **who can verify, not the bar**: every rule below still holds, whatever model or tool does the work.

### 12.1 Rules that do not change
- **Two opened sources per story** (RULEBOOK §11.1, §32.2). A search-results summary, a model's memory, or the existing draft text is not a source. Cite only pages actually read (§11.2). If one source is reachable and the second is not, the row stays draft, or the maintainer records an explicit attestation (§11.1 exception).
- **No generated scripture** (§11.3). Rows quote no verse text; surfaces render verses from the bundled corpus through `ref`. Never type Sanskrit into a row.
- **Stance** (§32.3) and **tier honesty** (§32.1). A folk story never gains a text name because a website claims one. A Purana story names the adhyaya the reviewer actually opened.
- **No build, release or OTA without explicit approval** (RULEBOOK §0.3).
- **Every change ships with tests** (§0). `prathaContent.test.ts` must stay green. Phase 1 adds screen tests and a Maestro flow.

### 12.2 Verify rows (content, Phase 1 gate)
Work in `mobile/src/data/pratha/<axis>.ts`. The files are canonical: hand-edit them and never regenerate. For each row:
1. Open two sources for **each** katha's canon line. The draft note's "To open:" lists them.
2. Correct the Hindi and English to what the sources say. Make the canon line exact (adhyaya/verse); drop details the sources do not support; split or merge stories if the sources disagree. Keep `bodyHi`/`bodyEn` paragraph counts equal.
3. Set `source.referenceUrls` to the pages read (≥2, ≥1 `https://`; bundled corpus as `repo:`). Replace `verificationNote` with `YYYY-MM-DD: <what was opened and what changed>`, without "DRAFT".
4. Flip `status: 'verified'`. Run `npx jest --config jest.config.js src/data/pratha`.

**Order.**
1. Kartik first: K1, K6 and K10 (the masa-card headline rows), then at least 10 Kartik rows, which is the Phase 1 hub gate.
2. Then by upcoming season: Margashirsha (from 25 Nov 2026), Paush, Magh (Makar Sankranti, 14 Jan 2027), Phalgun (Holi).
3. The year-round axes last.

### 12.3 Known open points from drafting (check these first)
| Row | Point |
|---|---|
| K6, PR3, N6 | Which text gives Vrinda's curse and the Shaligram/Tulsi-vivah promise: Shiva Purana (Rudra Samhita, Yuddha Khanda) vs Padma Purana. The drafts split them; confirm. |
| K16 | Covers Gujarati/Marwari chopda pujan only. Bengal's haal khata is Poila Baishakh and could be its own Chaitra/Vaishakh row. |
| K21 | Karna's daily Surya worship is Mahabharata; waist-deep arghya, Draupadi and Sita at Munger are folk. Keep the split. |
| C6 | Valmiki 1.18.8 gives Chaitra Navami; Punarvasu is in the next verse; noon is tradition. |
| C7 | Hanuman Jayanti's two dates: which tradition calls Kartik the birth. |
| J3 | Bada Mangal origin: the begum and the vow are left unnamed until a source is read. |
| B2 | Whether Bhagavata 10.56–57 itself links the Syamantaka story to the Chaturthi moon, or only later tellings do. |
| AS1 | Devi Mahatmya does not state "nine nights"; the nine-day form is the observance. |
| AS5, PR6 | **Tier gap:** Raghuvamsha is kavya, so it fits none of the four tiers. Decide whether to add a `kavya` tier or keep it as lok with "कथा का मूल: रघुवंश". |
| N19 | **Tier gap:** Agama texts are not in the `shastra` list. Same decision. |
| F1 | The hunter's name in the Shiva Purana Shivaratri story. |
| PR9 | Valmiki places Sita under a shimshapa tree inside the Ashoka grove. A `bodh` note may fit. |
| T1 | Whether the Neela Devi hair story is in the Venkatachala Mahatmya (the draft has it as lok). |
| SN2 | Manusmriti 2.30's naming-day count is read differently by commentators. |
| SN13 | "राम नाम सत्य है" has no agreed origin; it may be a drop candidate. |
| W8 | Bundled Valmiki sarga 6.107 is defective. Repairing the corpus (spacing + the meaning offset) would let the Aditya Hridaya be quoted. That is a separate corpus PR. |
| W9, N24, N25 | Rows with no story (omen-like). Drop candidates under Appendix B.1. |
| PN8, PN13, PN17 | Their catalogue links were generic ("bhog", "vidhi") and were dropped. Link the specific bhog/vidhi ids. |
| AD1 | 33 malpua: the meaning of 33 and the recipient vary; left open. |

### 12.4 Build Phase 1 (code)
In the order of §6, each with its tests and the same-PR docs (§10):
1. `PrathaReader {prathaId}` on the Vrat Katha reader shell (one row in `readerReadAloud.test.tsx`).
2. Hub `PrathaScreen` on the Home and More stacks (route registration in both; `vidhiBackNavigation`-style stack tests).
3. Observance Detail "यह क्यों?" card between Story (`ObservanceDetailScreen.tsx:316`) and How to observe (`:341`), via `getPrathaForRule`.
4. Panchang masa card under the sky line (`PanchangScreen.tsx:242–255`), via `getPrathaForMasa(lunarMonth.index, lunarMonth.isAdhik)`; absent below 3 verified rows.
5. design.md §86 + §62; a wiki update; `.maestro/pratha-smoke.yaml` (season-gated like `pitru-paksha-smoke`).

The clickable prototype (`docs/pratha-manyata-prototype.html`) is the visual reference. Its copy is the pre-correction draft, so the registry is the source of truth for text.

### 12.5 Decisions only the product owner makes
The owner approved §11 items 1 and 3 and separate `kavya`/`agama` tiers on 2026-10-28. Folk stories can now be verified as folk against two independent opened publications. Remaining choices in §11 stay open; none changes the source threshold. See `docs/content-parity/pratha-verification-2026-10-28.md` for the continuation’s source adjudications.

---

## Appendix A — The catalogue: famous customs and the story behind each

**How to read this appendix**
- **Confidence tags** follow the manifest's research scale. They are this author's attribution confidence, not verification:
  - `[Certain]` — a nameable primary text.
  - `[Likely]` — Puranic or regional-text roots, with loose popular attribution.
  - `[Guessing]` — folk only.
- **★** marks an anchor already resolved in the bundled corpus.
- **(M)** marks a row whose story is already researched in the manifest.
- **Reuse** names an existing app entry the row links rather than re-tells.

### A.1 कार्तिक — Kartik (Phase 1 pilot · 26 rows)

| ID | Custom / belief | The story or reason | Source | Reuse |
|---|---|---|---|---|
| K1 | **कार्तिक दीपदान** — a lamp every evening of the month at the temple, Tulsi, door, river | Kartik Mahatmya calls lamp-giving the month's chief merit. Two folk exempla: a mouse that nudged a temple wick, or a gambler who lit a Shiva-temple lamp by chance, reborn as King Bali — *even an unknowing lamp counts* | Mahatmya [Likely] Padma, Uttara Khanda / Skanda, Vaishnava Khanda; exempla [Guessing], Bali variant [Likely] Skanda, Kedara Khanda — adhyaya to open | `kartika-mahatmya` |
| K2 | **कार्तिक व्रत pays back** — why women keep the whole month | Satyabhama asks Krishna why she is so blessed. In her past life as Gunavati she kept Kartik's bath, lamp and Tulsi seva for life | [Likely] Padma, Uttara Khanda (Kartik Mahatmya, Krishna–Satyabhama frame) | — |
| K3 | **आकाशदीप** — a lamp hoisted on a tall bamboo pole all month | To light the way for the pitrs, and as an offering to Damodara visible from the sky. Kashi's Panchganga hazara-deep | [Likely] Kartik Mahatmya; Kashi custom [Likely] | `pitru` lessons (link) |
| K4 | **दामोदर दीप / दामोदराष्टक** — waving a lamp while singing Damodarashtakam | Yashoda tied the child Krishna with a rope (*dāma*) round the belly (*udara*); the twin arjuna trees freed | Binding [Certain] Bhagavata 10.9–10; hymn [Likely] Padma (Satyavrata Muni) | — |
| K5 | **कार्तिक स्नान** — pre-dawn bath, ideally in a river | Kartik is Vishnu's month; the dawn bath is its first vow | [Likely] Padma / Skanda Mahatmyas | `kartik-purnima` |
| K6 | **तुलसी सेवा और तुलसी विवाह** | Vrinda, wife of Jalandhara, whose fidelity shielded him; Vishnu's deception; her curse made him Shaligram; she became Tulsi, wed to him each Kartik (M) | Jalandhara–Vrinda [Certain] Shiva Purana, Rudra Samhita, Yuddha Khanda; Tulsi-vivah [Likely] Padma | `kartika-mahatmya`, `tulasi-vivah` |
| K7 | **करवा चौथ** — the karva, the sieve, the moon | Veeravati's brothers showed her a false moon through a sieve to end her fast; her husband fell ill; her year of penance restored him (M) | [Guessing] folk vrat-katha | `karwa-chauth-vrat-katha` |
| K8 | **अहोई अष्टमी** — drawing Ahoi and the *sei* (porcupine) cubs; arghya to stars | A woman digging soil killed a cub unknowingly and atoned (M) | [Guessing] folk | `ahoi-ashtami-vrat-katha` |
| K9 | **धनतेरस पर बर्तन/धातु ख़रीदना** | Dhanvantari rose from the churning holding the amrit kalash — a new vessel welcomes him. Gold-buying is a later commercial extension | Dhanvantari [Likely] Bhagavata 8.8; vessel custom [Guessing]; gold [itihas — modern] | `dhanteras-legends` |
| K10 | **यम दीपदान** — a four-wick lamp facing south at dusk on Trayodashi | King Hima's son was fated to die of snakebite on his 4th wedding night; his bride's heaped jewels and lamps dazzled Yama-as-serpent until dawn (M) | Yama-dipa [Likely] Skanda; Hima story [Guessing] | `dhanteras-legends` |
| K11 | **नरक चतुर्दशी अभ्यंग स्नान / रूप चौदस** — oil bath before sunrise | Krishna (with Satyabhama) slew Narakasura and freed 16,100 women; the bath washes off the battle — and the "naraka" | Slaying [Certain] Bhagavata 10.59; bath [Likely] | `narak-chaturdashi-katha` |
| K12 | **चौदह दीये / चौदह शाक** (Bengal, Bhoot Chaturdashi) | 14 lamps and 14 greens for 14 generations of ancestors | [Likely] Bengali tradition | — |
| K13 | **दीवाली के दीप** | Six kathas, by region: Rama's return (north); Lakshmi's emergence from the churning; Bali Pratipada (MH/KA); Kali Puja (Bengal); Mahavira's nirvana (Jain); Bandi Chhor (Sikh) (M) | Return [Certain] Valmiki but **lamps not in Valmiki** — bundled Yuddha 120–131 checked; lamps [lok]; Jain/Sikh [itihas] | `diwali-legends` |
| K14 | **द्वार खुले रखना, रंगोली, लक्ष्मी के पदचिह्न** | Lakshmi walks the earth on Kartik amavasya and enters the lit, clean, open home | [Guessing] folk | `diwali-legends` |
| K15 | **दीवाली पर द्यूत** | Shiva and Parvati played dice on this night; Parvati blessed those who play with prosperity | [Guessing] folk (some cite Skanda — unopened) | — |
| K16 | **चोपड़ा / बही-खाता पूजन** — new account books (Gujarat, Marwari; Bengal's *haal khata* is on Poila Baishakh, not Diwali) | The trading year starts at Diwali; Lakshmi and Ganesha are installed in the new ledger | [itihas] mercantile practice | — |
| K17 | **गोवर्धन पूजा / अन्नकूट**; a Govardhan of cow-dung | Krishna turned Vraj from Indra-yajna to the hill that fed them, then held it up for seven days (M) | [Certain] Bhagavata 10.24–25; cow-dung form [lok] | `govardhan-puja-katha` |
| K18 | **छप्पन भोग** | Krishna went seven days without eating while holding the hill: 7 days × 8 meals = 56 | [Guessing] Pushti-marg telling | `govardhan-puja-katha` |
| K19 | **भाई दूज तिलक; यमुना स्नान** | Yama visited his sister Yamuna (Yami) after long years; her welcome won the boon that brothers who visit sisters today are spared (M) | [Likely] | `bhai-dooj-katha` |
| K20 | **चित्रगुप्त पूजा / क़लम-दवात पूजा** (Kayastha) | Chitragupta, Yama's record-keeper, is honoured on Yama Dwitiya; pens rest for a day | [Likely] Padma / Bhavishya | `chitragupta-puja` |
| K21 | **छठ — डूबते और उगते सूर्य को अर्घ्य, जल में खड़े होकर** | Surya worship; Karna's daily waist-deep arghya; Draupadi's and Sita's (Munger) Chhath | Surya worship [Certain] Vedic; Karna's devotion [Certain] Mahabharata; Chhath tellings [Guessing] | `chhath-puja-katha` |
| K22 | **गोपाष्टमी** — cows bathed, decorated, worshipped | The day Krishna graduated from tending calves to cows | [Likely] | `gopashtami` |
| K23 | **आँवला नवमी** — eating under the amla tree | Lakshmi wished to worship Vishnu and Shiva together; the amla holds both (tulsi + bel qualities) | [Guessing/Likely] | `akshaya-navami-katha` |
| K24 | **देव उठनी — गन्ने का मण्डप, "उठो देव" थाली-वादन; विवाह फिर आरम्भ** | Vishnu wakes from four months' yoganidra; the suspension of weddings ends | Yoganidra [Likely] Puranic; customs [lok] | `kartika-mahatmya`, `dev-uthani-ekadashi-katha` |
| K25 | **भीष्म पंचक** — the last five days of Kartik | Bhishma taught dharma from the bed of arrows; the five days honour that teaching | Teaching [Certain] Shanti / Anushasana Parva; vrat [Likely] Padma | — |
| K26 | **देव दीपावली (काशी) / त्रिपुरारी पूर्णिमा / कार्तिगै दीपम्** | Shiva destroyed Tripura with one arrow; the gods lit lamps in Kashi. Tamil: Shiva as the endless column of fire at Arunachala (M) | Tripura [Certain] Karna Parva / Shiva Purana; Kashi lamps [Likely]; Arunachala [Likely] | `kartik-purnima`, `karthigai-deepam` |

Also Kartik, as regional rows: **सामा-चकेवा** (Mithila — Krishna's daughter Sama, turned into a bird by a curse, freed by her brother Samba) [Likely]/[lok] → `sama-chakeva`; **बोइत बन्दाण** (Odisha — paper boats for the sailors of old who left for Bali and Java at Kartik Purnima) [itihas]; **पुष्कर स्नान** (Brahma's yajna) [Likely] Padma.

### A.2 The other eleven months (Phase 2 · 69 rows)

**चैत्र (Chaitra)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| C1 | **गुड़ी / नववर्ष, नीम-गुड़; उगादि पचड़ी (छह स्वाद)** | Brahma began creation on Chaitra Shukla Pratipada; the gudi is a victory flag (Rama, or Shalivahana); bitter + sweet = the year's mix | Creation [Likely] Brahma Purana; Shalivahana era [itihas] | — |
| C2 | **घटस्थापना, जौ बोना (जवारे)** | The kalash holds the Devi; sprouting barley is the first harvest and a reading of the year | [Likely]/[lok] | `navratri-start-katha` |
| C3 | **कन्या पूजन** | The Devi worshipped as young girls, by age (Kumari to Subhadra) | [Likely] Devi Bhagavata 3.26–27 | — |
| C4 | **बसोड़ा / शीतला अष्टमी — ठण्डा खाना, चूल्हा न जलाना** | Sheetala is the cooling goddess of pox and fever; no fire is lit for her (M) | [Guessing] folk | `sheetala-saptami-vrat-katha` |
| C5 | **गणगौर** — clay Isar-Gauri, unmarried and married women | Gauri returns to her parents' home and is sent back to Shiva (M) | [Guessing] Rajasthani folk | `gangaur-vrat-katha` |
| C6 | **राम नवमी — मध्याह्न जन्मोत्सव** | Rama was born on Chaitra Navami (1.18.8), Punarvasu nakshatra (the next verse). The noon hour is tradition; Valmiki does not state it | Birth date [Certain] **Valmiki 1.18.8 ★**; noon [lok] | `rama-navami-vrat-katha` |
| C7 | **हनुमान जयंती — दो तिथियाँ** (Chaitra Purnima / Kartik Chaturdashi) | Two traditions: birth vs. the day of Sita's blessing | [Likely] | `hanuman-jayanti`, `hanuman-jayanti-kartik` |
| C8 | **बैसाखी / विषु कणि / बोहाग बिहू** | Solar new year and harvest; Vishu *kani* — the year's first sight should be auspicious; Khalsa 1699 | [Likely]; Khalsa [itihas] | — |

**वैशाख (Vaishakh)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| V1 | **अक्षय तृतीया — जल का घड़ा दान, सोना, नए काम का आरम्भ** | *Akshaya* = undiminishing: Draupadi's akshaya patra, Parashurama's birth, Treta's start, Sudama's visit; gold is a later reading (M) | Patra [Certain] Vana Parva; date-links [Likely]/[Guessing] | `akshaya-tritiya-vrat-katha`, daan occasion |
| V2 | **वैशाख स्नान और प्याऊ** | The month of Madhava; water to the thirsty in peak heat | [Likely] Padma, Vaishakh Mahatmya | daan |
| V3 | **नृसिंह जयंती — सन्ध्या-पूजा** | Narasimha appeared at dusk, on the threshold — neither day nor night (M) | [Certain] Bhagavata 7.8 | `narasimha-jayanti-vrat-katha` |
| V4 | **वट सावित्री — बरगद पर कच्चा सूत 108 बार** | Savitri followed Yama and won Satyavan back; the banyan is where he lay (M) | Story [Certain] Vana Parva; banyan [Likely] | `vat-savitri-vrat-katha` |
| V5 | **गंगा सप्तमी** | Ganga, released from Jahnu's ear (Jahnavi) | Jahnu [Certain] Valmiki Bala Kanda (bundled; ref to resolve); **Gita 10.31 ★** | `ganga-saptami-vrat-katha` |

**ज्येष्ठ (Jyeshtha)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| J1 | **गंगा दशहरा — दस पाप, दस वस्तुएँ** | Ganga's descent through Bhagirath; ten kinds of sin of body, speech, mind | Descent [Certain] Valmiki Bala 38–44 ★; ten-sin list [Likely] | `ganga-dussehra-katha` |
| J2 | **निर्जला एकादशी — जल-घट दान** | Bhima couldn't fast 24 times; Vyasa gave him one waterless fast equal to all (M) | [Likely] Padma / Brahmavaivarta | `nirjala-ekadashi-katha` |
| J3 | **बड़ा मंगल** (Lucknow) — Jyeshtha Tuesdays, bhandaras | Rama–Hanuman first meeting on a Jyeshtha Tuesday; the Aliganj temple vow of a Nawabi-era begum | [Guessing] + [itihas] local | — |
| J4 | **स्नान पूर्णिमा और अनसर** (Puri) — Jagannath falls "ill" for 15 days | After 108 pots of bathing the deities are kept apart and given herbal remedies | [Likely] Skanda, Utkala Khanda + temple practice | Theerth `jagannath-puri` |
| J5 | **रज पर्व** (Odisha) / **अम्बुबाची** (Kamakhya) — no ploughing | The earth (or the Devi) menstruates; she rests (M) | [Likely] regional | Theerth `kamakhya` |

**आषाढ़ (Ashadh)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| A1 | **रथ यात्रा; राजा का झाड़ू (छेरा पहँरा)** | The siblings visit aunt Gundicha; the Gajapati king sweeps the chariot — before God, king = servant | Visit [Likely] Skanda; sweeping [itihas] practice | Theerth `jagannath-puri` |
| A2 | **चातुर्मास — विवाह नहीं, साधु एक स्थान पर** | Vishnu sleeps, keeping his promise to Bali (M); monks stop wandering in the rains (*varsha-vasa*) | Vishnu–Bali [Likely]; varsha-vasa [Certain] shared ascetic practice | `devshayani-ekadashi-katha` |
| A3 | **चातुर्मास भोजन-नियम** — no greens in Shravan, curd in Bhadrapad, milk in Ashwin, certain dals in Kartik | The four months each give up one food | [Likely] Skanda — chapter to open; regional variance large | bhog |
| A4 | **गुरु पूर्णिमा** | Vyasa's birth; the day disciples honour the teacher | [Likely] | `guru-purnima-katha` |
| A5 | **आषाढ़ी वारी (पंढरपुर)** — the walk to Vitthal | Pundalik, serving his parents, threw a brick for Krishna to wait on; Vitthal still stands on it (M) | [Likely] Varkari tradition | — (Pandharpur not yet in Theerth) |

**श्रावण (Shravan)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| S1 | **शिव पर जल / दुग्ध अभिषेक** | Shiva drank the halahal; water cools the burn (M) | Neelkantha [Certain] Bhagavata 8.7; cooling reading [Likely] | `shravana-mahatmya` |
| S2 | **कांवड़ यात्रा** | Parashurama, or Ravana, or Shravan Kumar as first kanwariya | [Guessing]; Shravan Kumar himself [Certain] Valmiki Ayodhya (bundled, ref to resolve) | — |
| S3 | **सावन सोमवार; सोलह सोमवार** | Parvati's tapas for Shiva in Shravan; Chandra healed on a Monday (M) | [Likely] | `shravana-mahatmya` |
| S4 | **हरियाली तीज — झूला, हरी चूड़ियाँ, मेहँदी** | Shiva–Parvati reunion after 108 births of tapas | [Likely]/[lok] | `hariyali-teej` |
| S5 | **नाग पंचमी — नाग को दूध** | Astika stopped Janamejaya's snake sacrifice (M). Welfare fact: snakes don't drink milk — offered to an image | [Certain] Adi Parva | `nag-panchami-vrat-katha` |
| S6 | **रक्षा बन्धन — "येन बद्धो बली राजा"** | Indrani tied a raksha on Indra before battle; Lakshmi on Bali; Draupadi's torn cloth (M) | Indrani [Likely] Bhavishya; others [Guessing] | `raksha-bandhan-legends` |
| S7 | **श्रावणी / उपाकर्म / आवणि अवित्तम् — नया जनेऊ** | The annual renewal of Vedic study | [Certain] Grihya-sutras | `avani-avittam` |

**भाद्रपद (Bhadrapad)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| B1 | **जन्माष्टमी — अर्धरात्रि, झूला, दही-हाण्डी** | Midnight birth in Kansa's prison; the butter-thief | Birth [Certain] Bhagavata 10.3; dahi-handi [lok] MH | `janmashtami-katha` |
| B2 | **गणेश चतुर्थी पर चाँद न देखना** | Chandra mocked Ganesha; Krishna saw the moon and was blamed over the Syamantaka gem (M) | Syamantaka [Certain] Bhagavata 10.56–57; curse [Likely] | `ganesha-chaturthi-vrat-katha` (already tells it) |
| B3 | **गणेश को मोदक; दस दिन; विसर्जन** | Modak = the sweet of bliss (Anusuya's / Parvati's tellings); public utsav and visarjan | Modak [Guessing]; public form [itihas] Tilak 1893 | — |
| B4 | **हल षष्ठी / ललही छठ** — no ploughed grain | Balarama, the plough-bearer's birthday | [Likely] | `hal-shashthi` |
| B5 | **बहुला चौथ / बछ बारस — गाय-बछड़ा पूजन, चाकू से कटा न खाना** | Bahula the cow kept her word to return to a lion | [Likely]/[lok] | `bahula-chaturthi`, `bachh-baras-vrat-katha` |
| B6 | **हरतालिका तीज** | Parvati's friends hid her (*harita–alika*) so she could do tapas for Shiva (M) | [Likely] | `hartalika-teej-katha` |
| B7 | **अनन्त चतुर्दशी — 14 गाँठ का धागा** | Kaundinya threw away Sushila's Anant thread and lost everything until he atoned (M) | [Likely] Bhavishya | `anant-chaturdashi-vrat-katha` |
| B8 | **ओणम् — पूक्कलम्** | Mahabali's annual visit to his people (M) | Vamana [Certain] Bhagavata 8; visit [Likely] | — |
| B9 | **विश्वकर्मा पूजा — औज़ारों की पूजा** | Vishwakarma, the divine architect; work-tools rest | [Likely] | `vishwakarma-puja` |
| — | Pitru Paksha customs (crows, til, water) | **Owned by PRD-44** — link, never duplicate | — | `data/pitru` |

**आश्विन (Ashwin)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| AS1 | **नवरात्रि — अखण्ड ज्योति, नौ दिन** | Durga's nine-night battle with Mahishasura (M) | [Certain] Devi Mahatmya | `navratri-start-katha` |
| AS2 | **गरबा — दीप के चारों ओर** | *Garbha-deep*: the lamp in a pierced pot = life in the womb; dancing in a circle round it | [Likely] Gujarati tradition | — |
| AS3 | **दुर्गा पूजा — पुण्य माटी, सिन्दूर खेला** | Soil from a courtesan's door (M); Uma's farewell before returning to Kailash | [Likely] Bengali tradition | — |
| AS4 | **दशहरा — रावण दहन, रामलीला** | Rama's victory. The Ramlila is old; effigy-burning at scale is 20th-century | Victory [Certain]; Ramlila [itihas]; date [Likely] | `dussehra-katha` |
| AS5 | **शमी पूजन, शस्त्र पूजा; आपटा पत्ते "सोना"** | Pandavas' weapons hidden in the shami; Raghu's gold rain for Kautsa (M) | [Certain] Virata Parva; Raghuvamsha | `dussehra-katha` |
| AS6 | **दशहरे पर नीलकण्ठ दर्शन** | The blue-throated bird = Shiva Neelkantha; seeing it brings victory | [Guessing] | — |
| AS7 | **मैसूर / कुल्लू / बस्तर दशहरा** | Chamundeshwari's slaying of Mahishasura (Mysore, Wodeyar 1610); Raghunath's procession (Kullu); 75-day Bastar Dussehra for Danteshwari | [itihas] + [Likely] | — |
| AS8 | **शरद पूर्णिमा — चाँदनी में खीर** | The moon at sixteen *kalas* rains amrit; Krishna's Maharaas; Lakshmi asks *"को जागर्ति?"* (M) | Raas [Certain] Bhagavata 10.29–33; kheer [lok]; Kojagari [Likely] | `sharad-purnima-vrat-katha`, `kojagara-puja-katha` |

**मार्गशीर्ष (Margashirsha)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| M1 | **"मासानां मार्गशीर्षोऽहम्"** — why this month is held highest | Krishna names himself Margashirsha among months | [Certain] **Gita 10.35 ★** | GitaReader |
| M2 | **गीता जयंती** (Mokshada Ekadashi) | The day the Gita was spoken | Date [Likely] | `gita-jayanti-katha` |
| M3 | **विवाह पंचमी — मिथिला में इस दिन बेटी का विवाह नहीं** | Rama–Sita's wedding day; Mithila won't wed daughters today, remembering Sita's sorrows | Wedding [Certain]; date [Likely]; abstention [Guessing] | `vivah-panchami-katha` |
| M4 | **काल भैरव अष्टमी — श्वान को भोजन** | Bhairava's birth; the dog is his vahana (M Kashi kotwal) | [Certain] Shiva Purana | `kaal-bhairav-jayanti` |
| M5 | **मार्गशीर्ष गुरुवार** (Maharashtra Lakshmi vrat) | Folk vrat-katha | [Guessing] | — |

**पौष (Paush)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| P1 | **खरमास — विवाह नहीं** (Sun in Dhanu/Meena) | Surya's horses rest; donkeys (*khar*) pull the chariot, so it slows | [Guessing] folk; the jyotish basis [Likely] | muhurat engine |
| P2 | **लोहड़ी — अलाव, रेवड़ी** | Dulla Bhatti rescued girls from being sold (M) | [Guessing] Punjabi folk-history | — |

**माघ (Magh)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| MG1 | **मकर संक्रांति — तिल-गुड़, खिचड़ी दान, गंगासागर स्नान** | Bhishma waited for Uttarayana; Surya visits his son Shani (whose sign Makar is) — til reconciles them | Uttarayana [Certain] Bhishma Parva + **Gita 8.24 ★**; Shani [Guessing] | daan: `makar-sankranti` |
| MG2 | **पतंग उड़ाना** | Sky-facing day; "Rama flew a kite" is often claimed for Ramcharitmanas — **not in the bundled Bal Kand excerpt; unverified** | [Guessing] → `bodh` candidate | — |
| MG3 | **पोंगल — उफनता दूध-चावल; मट्टु पोंगल** | The pot boils over = abundance; cattle honoured (Nandi's curse) (M) | [lok] Tamil | — |
| MG4 | **माघ मेला / कल्पवास (प्रयाग)** | A month of austerity at the confluence | [Likely] Padma / Matsya | — (Prayag not yet in Theerth) |
| MG5 | **मौनी अमावस्या — मौन** | Silence as the bath of speech | [Likely] | `mauni-amavasya-katha` |
| MG6 | **वसन्त पंचमी — पीले वस्त्र, अक्षरारम्भ** | Saraswati's day; spring's yellow mustard; Krishna: "among seasons I am spring" | **Gita 10.35 ★** (*ऋतूनां कुसुमाकरः*); Saraswati [Likely] | `vasant-panchami-katha` |
| MG7 | **रथ सप्तमी — सिर पर आक के पत्ते रखकर स्नान** | Surya's chariot turns north | [Likely] | `ratha-saptami` |
| MG8 | **भीष्म अष्टमी — सब भीष्म को तर्पण देते हैं** | Bhishma died childless; everyone offers him water as a son would | [Likely] | `bhishma-ashtami` |
| MG9 | **षट्तिला एकादशी — तिल के छह प्रयोग** | Bath, rub, homa, water, food, gift — all with til | [Likely] Padma | `shattila-ekadashi-katha` |

**फाल्गुन (Phalgun)**
| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| F1 | **महाशिवरात्रि — जागरण, बेलपत्र** | The hunter (Lubdhaka) awake in a bilva tree dropped leaves on a linga; he spared a deer who kept her word (M) | [Certain] Shiva Purana | `maha-shivaratri-vrat-katha` |
| F2 | **होलिका दहन — नई फ़सल की बालियाँ भूनना** | Prahlad survived; Holika burned (M). *Holaka* = roasted grain | Prahlad [Certain] Bhagavata 7; Holika [Likely]; grain [Likely] | `holi-legends` |
| F3 | **रंग खेलना; लट्ठमार होली** | Krishna, dark, asked why Radha was fair; Yashoda: colour her too. Barsana's women chase Nandgaon's men | [lok] Braj | `holi-legends` |
| F4 | **होलाष्टक — आठ दिन शुभ कार्य नहीं** | Prahlad's eight days of torment / Kamadeva burned | [Guessing] | — |
| F5 | **कामदहनम्** (south) | Shiva burned Kama; Rati's grief; Kama revived formless (M) | [Certain] Shiva Purana / Kumarasambhava | — |
| F6 | **आमलकी एकादशी — आँवले की पूजा** | The amla born from Vishnu's tear / Brahma's | [Likely] | `amalaki-ekadashi-katha` |

**अधिक मास** (open question 6): **पुरुषोत्तम मास** — the month no deity would own; Vishnu took it as his own [Likely] Padma; **33 मालपुए दान** [lok].

### A.3 वार — Weekdays (Phase 3 · 9 rows)

| ID | Custom | Story / reason | Source |
|---|---|---|---|
| W1 | **सोमवार — शिव, व्रत** | Chandra (Soma), wasting under Daksha's curse, was healed by Shiva at Prabhas (M) | [Certain] Shiva / Skanda Purana |
| W2 | **मंगलवार — हनुमान; मंगल ग्रह** | Mangal (Bhauma) is the son of Bhumi; Hanuman's day is folk | [Likely]/[Guessing] |
| W3 | **बुधवार — गणेश, दूर्वा, हरा** | Budha = green; Ganesha as Buddhi-pati | [Guessing] |
| W4 | **गुरुवार — पीला, केले का पेड़; बाल/कपड़े न धोना** | The Brihaspativar vrat-katha of the queen who wished wealth away | [Guessing] folk vrat-katha |
| W5 | **शुक्रवार — सन्तोषी माँ, खट्टा नहीं** | Popularised by the 1975 film *Jai Santoshi Maa* (M) | [itihas] |
| W6 | **शनिवार — तेल, पीपल पर दीया, काला तिल** | Pippalada and Shani; Hanuman freed Shani from Ravana and Shani spared his devotees (M) | Pippalada [Likely] Shiva Purana, Shatarudra Samhita; Hanuman [Guessing] |
| W7 | **शनि देव की आँखों में न देखना / सामने से नहीं, बगल से दर्शन** | Shani's gaze — the cause of Ganesha's lost head (M) | [Likely] Brahmavaivarta, Ganapati Khanda |
| W8 | **रविवार — सूर्य को अर्घ्य; नमक नहीं (रविवार व्रत)** | Rama recited the Aditya Hridaya to Surya before the last battle | [Certain] Valmiki 6.107 — **bundled sarga defective, meaning-only**; no-salt [Guessing] |
| W9 | **मंगल / गुरु / शनि को बाल-नाखून न काटना** | Folk (M §7) — no story; renders as a short lok note or is dropped | [Guessing] |

### A.4 घर-आँगन — Daily household customs (Phase 3 · 25 rows)

| ID | Custom | Story / reason | Source |
|---|---|---|---|
| N1 | **ब्राह्म मुहूर्त में उठना** | *ब्राह्मे मुहूर्ते बुध्येत* | [Certain] Manusmriti 4.92 |
| N2 | **कर-दर्शन "कराग्रे वसते लक्ष्मी"** | Seeing the hands first: work is where Lakshmi lives | [Likely] verse of unclear origin |
| N3 | **भूमि-वन्दन "समुद्रवसने देवि" — पैर रखने से पहले** | Apology to the earth for stepping on her | [Likely] |
| N4 | **सूर्य को अर्घ्य (ताँबे के लोटे से)** | At sandhya the Mandeha rakshasas attack the sun; the water offered becomes thunderbolts | [Certain] Taittiriya Aranyaka 2.2; **Gita 10.21 ★** |
| N5 | **सन्ध्या दीप "शुभं करोति कल्याणम्"** | Lamp at dusk; Brahma, Vishnu, Shiva in the flame | [Likely]; sanskar `sandhya-deepam` (reuse) |
| N6 | **तुलसी को जल, शाम को दीया** | Tulsi as Vrinda (K6) | [Likely]; sanskar `tulsi-puja` |
| N7 | **पहली रोटी गाय की, आख़िरी कुत्ते की; चींटियों को आटा** | The five daily yajnas — *bhuta-yajna* feeds all creatures | [Certain] Shatapatha Brahmana 11.5.6.1; Manusmriti 3.70, 3.92; Gita 10.28 ★ (Kamadhenu) |
| N8 | **भोजन से पहले भोग; "ब्रह्मार्पणम्"** | Who eats after offering is freed from sin; offering is Brahman | [Certain] **Gita 3.13 ★, 4.24 ★**; sanskar `bhojan-mantra` |
| N9 | **थोड़ा-सा भी चढ़ाओ, स्वीकार है** | *पत्रं पुष्पं फलं तोयम्* | [Certain] **Gita 9.26 ★** |
| N10 | **अतिथि देवो भव** | — | [Certain] Taittiriya Upanishad 1.11.2; Rantideva (M) |
| N11 | **चरण स्पर्श** | Greeting elders increases life, learning, fame, strength | [Certain] Manusmriti 2.121 |
| N12 | **दीया मुँह से फूँककर न बुझाना** | *नाग्निं मुखेनोपधमेत्* — Agni is a deva; breath is not offered to it | [Certain] Manusmriti 4.53 |
| N13 | **दाहिने हाथ से देना-खाना; प्रदक्षिणा दाहिनी ओर** | *Dakshina* = right; the deity is kept to the right | [Certain] Grihya-sutra usage |
| N14 | **जूते बाहर, पैर धोकर घर में** | Threshold purity | [Likely] |
| N15 | **दरवाज़े पर रंगोली, तोरण, स्वस्तिक, शुभ-लाभ** | Welcome to Lakshmi; Shubh and Labh as Ganesha's sons | [Guessing]/[lok] |
| N16 | **कलावा / मौली बाँधना** | The raksha-sutra; the Bali verse (S6) | [Likely] |
| N17 | **तिलक** | Sampradaya marks; the seat of the third eye | [Likely] |
| N18 | **शंख बजाना (सन्ध्या, आरती)** | Panchajanya; Lakshmi's sibling from the churning | Panchajanya [Certain] **Gita 1.15 ★**; sibling [Likely] |
| N19 | **घण्टी बजाकर मन्दिर में प्रवेश** | Announcing oneself; dispelling the unwanted | [Likely] Agama |
| N20 | **कपूर आरती** | Camphor leaves no residue — ego burned whole | [Guessing]/[lok] |
| N21 | **किसी शुभ काम का "श्री गणेश"; पत्र के ऊपर "श्री"** | Ganesha as first-worshipped (the race around the parents) (M) | [Likely] Shiva Purana |
| N22 | **सिर उत्तर की ओर करके न सोना** | Vishnu Purana prefers east or south. The Ganesha-head folk tie is not Puranic (M §7) | [Likely] Vishnu Purana 3.11 (to open); folk tie [Guessing] → `bodh` |
| N23 | **सूर्यास्त के बाद झाड़ू नहीं** | Lakshmi arrives at dusk (M §7) | [Guessing] |
| N24 | **दही-चीनी खाकर निकलना** (exam, journey) | Auspicious departure | [lok] — no story; candidate for drop |
| N25 | **नमक हाथ में न देना** | (M §7) | [Guessing] — no story → Appendix B |

### A.5 पूजा-नियम — What is (not) offered, and why (Phase 3 · 19 rows)

| ID | Custom | Story / reason | Source | Reuse |
|---|---|---|---|---|
| PN1 | **शिव को केतकी नहीं** | Ketaki bore false witness for Brahma at the column of fire (M) | [Certain] Shiva Purana | bhog `maha-shivaratri-bhog` "why" |
| PN2 | **गणेश को तुलसी नहीं** (except Chaturthi) | Tulsi proposed to a meditating Ganesha; mutual curses (M) | [Likely] Brahmavaivarta | bhog `ganesha-bhog` "why" |
| PN3 | **शिव पूजा में शंख, तुलसी, हल्दी नहीं** | Shankhachuda's bones = the conch; Tulsi was his wife (M); turmeric folk | [Likely]/[Guessing] | — |
| PN4 | **शिव को बेलपत्र, धतूरा, आक, भाँग** | Bel: the hunter (F1). The rest: Shiva accepts what others shun (halahal) | Bel [Certain]; others [lok] | — |
| PN5 | **शिवलिंग की आधी परिक्रमा** | Don't cross the abhishek channel — Pushpadanta (M) | [Guessing] | — |
| PN6 | **शिवलिंग पर चढ़ा प्रसाद न खाना** (with exceptions) | It is Chandeshvara's share; jyotirlinga prasad is exempt | [Likely] | — |
| PN7 | **गणेश को 21 दूर्वा, मोदक; पहले पूजा** | Durva cooled Ganesha after he swallowed Analasura (M) | [Likely] Ganesha / Mudgala Purana | — |
| PN8 | **विष्णु-कृष्ण के भोग में तुलसी अनिवार्य** | Vishnu accepts naivedya only with Tulsi | [Likely] Padma | bhog |
| PN9 | **हनुमान को सिन्दूर, चोला** | Sita's sindoor for Rama's long life — so Hanuman covered himself (M) | [Guessing]; not in Valmiki → `bodh` | — |
| PN10 | **शनि को तेल** | Hanuman eased Shani's wounds with oil (M) | [Guessing] | — |
| PN11 | **देवी को लाल पुष्प, शृंगार; लक्ष्मी को कमल** | Lakshmi rose seated on a lotus from the churning | Lotus [Certain] Bhagavata 8.8; red [lok] | — |
| PN12 | **अक्षत टूटे न हों** | *A-kshata* = unbroken (M) | [Certain] etymology | — |
| PN13 | **पंचामृत / चरणामृत** | Five gifts of the cow + honey and sugar; the deity's bath shared | [Likely] | vidhi |
| PN14 | **एकादशी को चावल नहीं** | Sin resides in grain on Ekadashi (M) | [Likely] Padma | `ekadashi-vrat-katha` |
| PN15 | **प्याज़-लहसुन नहीं (सात्त्विक)** | Gita classes foods by guna; the Rahu-amrit-drops story is folk (M) | Principle [Certain] **Gita 17.7–10 ★** (onion not named); Rahu [Guessing] → `bodh` |
| PN16 | **नारियल फोड़ना** | Shriphal — the whole self offered; the Vishwamitra-Trishanku tree story | [Guessing] | — |
| PN17 | **कलश — "कलशस्य मुखे विष्णुः"** | The pot holds all devas and waters; the amrit kalash | [Likely] puja-paddhati | vidhi |
| PN18 | **प्रसाद ठुकराना नहीं, नीचे न गिराना** | Prasad is the deity's grace | [Likely] | — |
| PN19 | **"33 करोड़ देवता"** | *Koti* = type: 33 devas (8 Vasus, 11 Rudras, 12 Adityas, Indra, Prajapati) | [Certain] Brihadaranyaka 3.9.1–2 → `bodh` | — |

### A.6 प्रकृति — Trees, animals, rivers (Phase 3 · 16 rows)

| ID | Custom | Story / reason | Source |
|---|---|---|---|
| PR1 | **पीपल पूजा; पीपल न काटना** | "Among trees I am the Ashvattha" | [Certain] **Gita 10.26 ★**; Shani-day lamp (W6) |
| PR2 | **वट/बरगद** | Savitri (V4); the Akshayavat survives pralaya; Dakshinamurti under the banyan | [Certain]/[Likely] |
| PR3 | **तुलसी** | K6, N6 | — |
| PR4 | **आँवला** | K23, F6 | — |
| PR5 | **बेल** | F1, PN4 | — |
| PR6 | **शमी** | AS5 | — |
| PR7 | **केले के पेड़ की पूजा (गुरुवार)** | W4 | [Guessing] |
| PR8 | **नीम (शीतला, उगादि)** | C1, C4 | [Likely] |
| PR9 | **अशोक — अशोकाष्टमी** | Sita in the Ashoka grove | [Certain] Valmiki Sundara Kanda |
| PR10 | **गाय — गोपूजा, गोपाष्टमी** | Kamadhenu; "among cows I am Kamadhuk" | [Certain] **Gita 10.28 ★** |
| PR11 | **कौआ (श्राद्ध)** | Owned by PRD-44 (panchabali) — link | — |
| PR12 | **कुत्ता — भैरव का वाहन** | Bhairava (M4); Yudhishthira's dog (M) | [Certain] Mahaprasthanika Parva |
| PR13 | **नाग** | S5 | — |
| PR14 | **गंगाजल घर में रखना** | "Among rivers I am the Jahnavi"; Bhagirath (J1) | [Certain] **Gita 10.31 ★**, Valmiki Bala ★ |
| PR15 | **नर्मदा का हर कंकर शंकर; नर्मदा परिक्रमा** | Narmada's boon that her stones would be Shiva (M) | [Likely] Reva Khanda |
| PR16 | **नदी में सिक्का डालना** | A gift to the river; the copper rationale is unsourced | [Guessing] |

### A.7 संस्कार — Life-cycle customs (Phase 4 · 16 rows; Appendix B.2 decision first)

| ID | Custom | Story / reason | Source |
|---|---|---|---|
| SN1 | **छठी (षष्ठी पूजा)** | Shashthi Devi protects newborns | [Likely] Brahmavaivarta |
| SN2 | **नामकरण 11वें/12वें दिन** | The end of birth-impurity | [Certain] Grihya-sutras; Manusmriti 2.30 |
| SN3 | **अन्नप्राशन, मुण्डन (चूड़ाकर्म), कर्णवेध** | Samskaras of the first years | [Certain] Grihya-sutras |
| SN4 | **विद्यारम्भ / अक्षर-अभ्यास** (Vijayadashami, Vasant Panchami) | Saraswati's days | [Likely] |
| SN5 | **यज्ञोपवीत (जनेऊ)** | Upanayana — the second birth | [Certain] |
| SN6 | **हल्दी** | Purification and glow before the wedding | [lok] |
| SN7 | **कन्यादान** | The gift a father makes with water | [Certain] Grihya / Manusmriti (brahma-vivaha) |
| SN8 | **सप्तपदी / सात फेरे** | Seven steps make the friendship | [Certain] Rigveda 10.85; Ashvalayana Grihya 1.7 |
| SN9 | **सिन्दूर-दान** | Rama put sindoor on Sita | [Certain] Ramcharitmanas Bal Kand (dohas ~325 — **not in the bundled 19-verse excerpt**; ref to open) |
| SN10 | **मंगलसूत्र** | Regional, relatively late | [Likely] |
| SN11 | **गृहप्रवेश में वधू का चावल का कलश गिराना** | Lakshmi enters with plenty | [Guessing] |
| SN12 | **अरुन्धती / ध्रुव दर्शन** | The newly-weds are shown the constant star and the constant wife | [Certain] Grihya-sutras |
| SN13 | **"राम नाम सत्य है"** | — | [itihas]/[lok] |
| SN14 | **दाह, कपाल-क्रिया, घड़ा फोड़ना** | Release of the life-breath; ending the bond | [Likely] Garuda Purana (bundled readings — check) |
| SN15 | **तेरह दिन, गरुड़ पुराण पाठ** | The preta's journey and the first year's rites | [Likely] Garuda Purana (app has `garud-puran` readings) |
| SN16 | **सूतक** (birth/death) | Periods of ritual withdrawal | [Certain] Manusmriti 5 — **durations vary; describe, never prescribe** |

### A.8 तीर्थ — Pilgrimage customs (Phase 4 · 12 rows; link Theerth, never copy)

| ID | Custom | Story / reason | Source |
|---|---|---|---|
| T1 | **तिरुपति में केश-दान** | Neela Devi's hair; Venkateswara's loan from Kubera (M) — Theerth `tirupati-balaji` | [Likely] Venkatachala Mahatmya |
| T2 | **काशी में मृत्यु = मोक्ष** | Shiva whispers the Taraka mantra (M) | [Certain] Kashi Khanda |
| T3 | **गया में पिण्डदान** | Gayasura's body became the tirtha — Theerth `vishnupad-gaya` | [Likely] Vayu Purana, Gaya Mahatmya |
| T4 | **कुम्भ — चार स्थान** | Amrit drops (M) | [Likely] |
| T5 | **वैष्णो देवी के बाद भैरव मन्दिर** | (M) | [Guessing] |
| T6 | **सबरीमला 41-दिन व्रत, काले वस्त्र** | Ayyappa's brahmacharya (M) | [Likely] |
| T7 | **गोवर्धन / गिरनार / अरुणाचल परिक्रमा** | The hill is the deity | [Likely] |
| T8 | **चार धाम का क्रम (दक्षिणावर्त)** | Pradakshina at the scale of the land | [Likely] |
| T9 | **जगन्नाथ महाप्रसाद — सब एक पंक्ति में** | Before Jagannath no one is apart | [Likely] |
| T10 | **गंगा आरती (हरिद्वार / काशी)** | Recent in its present form | [itihas] |
| T11 | **केदारनाथ — बैल की पीठ** | The Pandavas and Shiva-as-bull (M) | [Likely] |
| T12 | **"जब तक बुलावा न आए"** (Vaishno Devi, Kedar) | The deity calls the pilgrim | [lok] |

### A.9 बोध — Gentle corrections (Phase 3 · 12 rows)

| ID | Popular belief | What the text says | Source |
|---|---|---|---|
| BD1 | Ayodhya lit lamps → Diwali (as Valmiki) | Return is Valmiki; the lamp festival is not in its return sargas | ★ bundled Yuddha 120–131 checked |
| BD2 | "Never water Tulsi" | The folk rule is Sunday/Ekadashi/after dusk; the app's bhog review rejected even the Ekadashi plucking claim (M) | [Guessing] |
| BD3 | Shiva gave Lanka to Ravana | Valmiki: Ravana seized it from Kubera (M) | [Certain] Uttara Kanda |
| BD4 | Lakshman rekha is in the Ramayana | Not in Valmiki; Ramcharitmanas Lanka Kand has Mandodari's line *रामानुज लघु रेख खचाई* | [Certain] RCM (not bundled) |
| BD5 | Hanuman's sindoor | Not in Valmiki (PN9) | — |
| BD6 | Shabari tasted the berries | Valmiki has Shabari's hospitality, not the tasting (M) | [Certain] Aranya Kanda |
| BD7 | The squirrel at Ram Setu | Not in Valmiki (M) | — |
| BD8 | 33 crore gods | 33 *types* (PN19) | [Certain] Brihadaranyaka 3.9 |
| BD9 | Onion/garlic are "from Rahu's blood" | The Gita's food teaching is about guna, not this tale (PN15) | ★ Gita 17.7–10 |
| BD10 | Raksha Bandhan = Draupadi–Krishna in the Mahabharata | Not in the critical text (S6) | — |
| BD11 | "गणानां त्वा गणपतिम्" is a Ganesha hymn | Rigveda 2.23.1 addresses Brihaspati; it was later applied to Ganesha | [Certain] Rigveda |
| BD12 | Kite-flying is in Ramcharitmanas | Unverified (MG2) | — |

## Appendix B — Deliberately out of scope

**B.1 Omens and totkas — no story, and showing them lends them the app's authority:** black cat crossing; sneezing before leaving; itchy palms; lemon-chilli; nazar removal; crow-cawing means guests; broken mirror; salt hand-to-hand; owl at night. If asked through Ask, the answer is a polite non-answer that names no remedy.

**B.2 Sensitive customs — need a separate editorial decision (open question 4):** menstruation restrictions (kitchen, temple, Rishi Panchami's framing); widow restrictions; caste-linked rules (who may cook, touch or enter); sutak durations by caste; dowry-linked wedding customs; animal sacrifice (bali); sati in any form. Where an in-scope row touches one (Rishi Panchami, Ambubachi, sutak), it **describes** the observance and stops.

**B.3 Owned elsewhere — link only:** Pitru Paksha customs (PRD-44); step-by-step rites (PRD-19 vidhi); what to cook (PRD-23 bhog); what to give (PRD-26 daan); temple parampara text (Theerth); vastu directions (PRD-24); muhurat and kharmas dates (the muhurat engine).

## Appendix C — What already exists and how this layer reuses it

| Existing | What it holds | Gate | How pratha uses it |
|---|---|---|---|
| Katha library `panchang/kathaContent/` (90 entries) | 13 entries already tell a custom's origin: `kartika-mahatmya`, `dhanteras-legends`, `narak-chaturdashi-katha`, `diwali-legends`, `ganesha-chaturthi-vrat-katha` (the moon), `mauni-amavasya-katha`, `govardhan-puja-katha`, `bhai-dooj-katha`, `raksha-bandhan-legends`, `sheetala-saptami-vrat-katha`, `holi-legends`, `vat-savitri-vrat-katha`, `nag-panchami-vrat-katha` | **None** — "app-authored, source-informed retelling" | Link via `anchors.kathaIds`; never re-tell. The pratha row adds the tier label the library lacks |
| Bhog `doNotOffer` (3 rows) | Ganesha/Tulsi ×2, Shiva/Ketaki | verified-only | Supplies the missing "why" (PN1, PN2) |
| Daan occasions (20) | `why` per occasion (Makar Sankranti til, Akshaya Tritiya pot) | verified-only | Link (V1, MG1); never duplicate |
| Pitru registry | crows, water, panchabali, Karna (draft) | verified-only | Owns Pitru Paksha; pratha links |
| Sanskar JSON | `tulsi-puja`, `sandhya-deepam`, `gau-seva`, `bhojan-mantra` explain reasons in meanings | `source.baseText` only | Hand-off targets for N5–N8 |
| Theerth details | 60 temples with `parampara` sections | `sources[]` | `tirth` rows link via `theerthIds` |
| Festival `shortDescription*` | What is done on ~12 observances; rarely why | sourceUrl only | Unchanged; the "यह क्यों?" card sits below it |
| `manyata-kathas.md` | ~200 researched beliefs + stories | research only | Source for all (M) rows; its boons, divine objects and dharma stories (§4–§6, §8) are **not** customs and stay out of this layer |

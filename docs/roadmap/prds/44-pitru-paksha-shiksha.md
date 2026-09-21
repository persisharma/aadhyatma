# PRD-44 — पितृ पक्ष परिचय · Pitru Paksha as an Education Layer

| | |
|---|---|
| **Status** | Proposed — **Phase 1 prototype built on this branch** (registry + परिचय screen + katha reader + overview door; content gated verified-only, drafts invisible). Phases 2–3 unbuilt. |
| **T-shirt size** | Phase 1: S–M (built). Phase 2: M (content verification dominates; season surfaces + search + Ask intents are wiring). Phase 3: S (day-panel lesson + opt-in daily notification). |
| **Parent** | [PRD-17 पितृ स्मरण](./17-pitru-smaran.md) (the reminder + ledger) · [PRD-19 Phase 3](./19-shraddha-vidhi-phase3.md) (the vidhi). This PRD is the third leg: **जानें · स्मरण · विधि**. Neither parent gains a new phase; this is its own PRD. |
| **Prototype** | [`docs/pitru-paksha-shiksha-prototype.html`](../../pitru-paksha-shiksha-prototype.html) — the redesigned overview, the परिचय scroll, a tithi row, the katha reader, the season Home card, the reminder tap; every interaction annotated. In-app: `More → पितृ स्मरण → पितृ पक्ष banner → "पितृ पक्ष क्या है, क्यों है"`. |
| **Feasibility** | ✅ Pure JS/TS + bundled text — **OTA-shippable**. No new engine path: every date on the education surfaces is already solved by PRD-17. Scripture is deep-linked into the bundled Gita and Valmiki readers, never re-typed. |

> **Design intent.** Today Pitru Paksha in Vedansh is a **reminder** (two public 18:00 season notices), a **calendar** (the sixteen-row fortnight table), and a **door** (the narrow tila-tarpana guide). A family that opens it learns *when*; it never learns *what this fortnight is, why it is kept, whose day is which, or what the texts actually say*. This PRD adds that education — in Pitru Smaran's muted register, non-prescriptive, source-gated — and makes it the **first** thing the fortnight offers, with the reminder and the vidhi unchanged beneath it.

---

## 0. The honest content gate (read first)

**Outbound access was retested on 2026-09-19 and is blocked by policy, not by a transient fault.** The agent proxy reports healthy; every external source domain returns `CONNECT tunnel failed, response 403` (drikpanchang.com, kamakoti.org, wisdomlib.org, valmikiramayan.net, archive.org, sacred-texts.com, wikipedia.org, holy-bhagavad-gita.org). `WebFetch` reports `EGRESS_BLOCKED` for the same hosts. Web *search* works and did surface concordant candidate pages, but a search summary is not an opened source and this repo does not certify from one — so search results are recorded in the draft rows' notes as leads for the reviewer, never as verification. Therefore:

- **The verification ladder (RULEBOOK §28.4), preferred in this order.** (1) **Bundled corpus** — a statement the shipped Gita / Valmiki JSON itself carries; strongest, because the reviewer opens the file. The corpus counts as one reference and its own published source line as the second. (2) **The shipped engine** — what `panchang/pitruSmaran.ts` actually solves. (3) **The dossier** — facts recorded as opened on 2026-08-19 in [`shraddha-tarpan-source-dossier.md`](../conventions/shraddha-tarpan-source-dossier.md). Rung 1 is what made this round's expansion possible: the bundled Valmiki Ramayana is 27 MB of exactly this material, and a corpus sweep for पितृ · श्राद्ध · तर्पण · पिण्ड · जलाञ्जलि found three complete, canonical, in-repo-checkable pitru episodes plus four new verses.
- **Draft rows** (invisible on every surface) carry `DRAFT — NOT VERIFIED` in their note and name exactly what to open: the **fourteen per-tithi assignments** (all authored, §3.2), the three-debts / pancha-mahayajna teaching (Taittiriya Samhita 6.3.10.5, Manusmriti 3.70), the Mahalaya name lesson, the गोत्र glossary row, the **Karna folk katha** (whose rendered canon line must keep naming its provenance as लोक-परम्परा), and the "who may perform" answer — drafted *deliberately*, because even a deferral on that question needs its adhikara chapter opened before it renders.
- **A corpus defect is not a source.** The Yuddha-Kanda *maraṇāntāni vairāṇi* verse (enmity ends with death — Vibhishana performing Ravana's rites) was a strong candidate and was **dropped**: the bundled row at 6.114.100 has collapsed spacing, a corrupt akshara, and a Hindi meaning offset from its shloka. Likewise a run of rows at 2.103.26+ carries meanings belonging to the preceding verses. Both are upstream corpus defects; content must not be anchored to them.
- Flipping a status lights the surface up with **zero code change** (the §19/§26/§27 pattern). Phase 2 is mostly this.

## 1. Problem

The fortnight is the one time of year almost every Hindu household performs pitru-karma, and the one time it asks questions: *why sixteen days? why does the printed calendar say a different day? is tarpana at home a real shraddha? we don't know dada-ji's tithi — what now? why do we read Gita 15?* The app answers none of them. It computes the day with rare precision (PRD-17) and then hands the family a checklist (PRD-19 P3). The **understanding** — the layer that turns a notification into an observance — is missing. Incumbents fill that gap with fear copy ("pitru dosha"), pandit-booking interstitials and shraddha packages. Vedansh's stance (§51, RULEBOOK §27.9) forbids all three, which is exactly why an honest, cited परिचय is a moat.

## 2. Goal

Let a family **understand** Pitru Paksha before it acts: what the fortnight is, why it is kept, whose day is which, what the Gita and Ramayana actually say, and what the common questions' honest answers are — then hand them, in that order, to the three things the app already does: the fortnight table, the tila-tarpana guide, and the private ledger. Success (per-device local counters only, Q3 stance): परिचय opens during the season, reader hand-offs taken (Gita 1.42 / 9.25 / 2.20, Valmiki 2.102), and door-taps from परिचय into the overview / vidhi / ledger.

## 3. Where it lands (surfaces)

### 3.1 The overview becomes the fortnight's home (built) — `PitruPakshaOverviewScreen`
Between the date hero and the sixteen rows, one quiet `parchmentSoft` card: **॥ पितृ पक्ष क्या है, क्यों है** · "परिचय · तिथियाँ · शास्त्र-वचन · कथाएँ" → `PitruPakshaShiksha`. It renders **only** when `hasPitruShiksha()` is true (≥1 verified concept lesson) — never a teaser. The reminder tap (`pitru-paksha-reminder` → overview) therefore lands on education first, calendar second, vidhi third, with no deep-link change.

### 3.2 परिचय — the education screen (built) — `PitruPakshaShikshaScreen`
One reverent scroll in reading order, `ReaderHeader variant="index"` over the Home gradient, Pitru Smaran's register (§63 tone — muted gold/ink, `saffron` only as interactive affordance):
1. **परिचय** — concept lessons as cards: title + first paragraph, **और पढ़ें ›** unfolds in place (a परिचय is read, not navigated). **9 authored, 7 verified**: क्या है · श्राद्ध और तर्पण · **जल ही क्यों** (the oldest form of the offering, from Bala 41 + Aranya 68 + Ayodhya 102) · **किसके लिए** (remembrance does not ask for blood, from the Jatayu rite) · दिन का कौन-सा समय · किस दिन किसका · हर परिवार की अपनी रीति. Draft: पितृ-ऋण, महालय.
2. **पक्ष की तिथियाँ** — one §33.6-style row per fortnight day (gold marker · name · note). **All 16 days are authored** — purnima, 1–14, amavasya — and a coverage test pins that none is missing, because a skipped day leaves the reader unable to tell "no tradition here" from "the app forgot". Verified today: पूर्णिमा श्राद्ध and सर्वपितृ अमावस्या (the two the engine itself decides); the fourteen tithi-to-who assignments are draft, and an italic footer says the traditional notes follow their source review.
3. **शास्त्र-वचन** — the verse spine: short quoted line(s) (Devanagari / IAST by language) · gold cite · meaning · **गीता में पढ़ें ›** / **रामायण में पढ़ें ›**. **8 authored, 7 verified**: Gita 1.42 (pinda-udaka lapsing), **9.16 (स्वधा — "I am the offering to the manes")**, 9.25, **10.29 (पितॄणामर्यमा — among the pitrs I am Aryaman)**, 2.20; Valmiki 2.102.27 (Rama's jalanjali) and **1.41.19 (Garuda: not ordinary water — the Ganga)**. A row **not** reachable in a bundled reader is never quoted (Manu 3.70 is draft and unquoted by rule).
4. **कथाएँ** — door rows → `PitruKatha`. **4 authored, 3 verified**, each retold verse-by-verse from the bundled corpus and anchored by a `ref` the reviewer can open: **चित्रकूट में श्रीराम का पितृ-कर्म** (Ayodhya 102), **भगीरथ और साठ हजार** (Bala 38–44 — three generations on the single question of water), **जटायु का अन्तिम संस्कार** (Aranya 67–68 — the rite for one who was neither kin nor human). Draft: the Karna folk katha.
5. **प्रश्नोत्तर** — Q/A cards. **9 authored, 8 verified**: tithi unknown · why the printed calendar differs · is home tarpana complete shraddha · two ancestors one tithi · **we lack the materials** (Rama's forest pinda) · **why water at all** · **can new work be undertaken these days** (a deliberate non-verdict) · **where the guide is**. Draft: who may perform.
6. **शब्द** — glossary card, **12 authored, 11 verified**: पितर · तर्पण · **जलाञ्जलि** · पिण्ड · **तिल** · **दर्भ · कुश** · **अर्यमा** · **स्वधा** · कुतप काल · **अपराह्न** · अनुकल्प. Draft: गोत्र.
7. **अब** — the three doors, reached LAST: **इस वर्ष की तिथियाँ** → overview · **॥ पितृ तिल-तर्पण स्मरण** → `VidhiDetail` (undated; gated on the vidhi resolving) · **॥ पितृ स्मरण** → ledger. Footer: *"यह परिचय है, विधान नहीं — परिवार की परम्परा सर्वोपरि है।"*

### 3.3 Katha reader (built) — `PitruKathaScreen`
The `DaanKathaScreen` pattern: subtitle, paragraphs 14/25, the **शिक्षा** panel (`goldTint`, gold uppercase label, `saffronDeep` teaching), rendered canon line, and — when the katha is drawn from a bundled text — **मूल श्लोक रामायण में पढ़ें ›** → `ValmikiRamayanReader {chapter: 2, initialIndex}`. A draft id renders the header only.

### 3.4 Season surfaces (Phase 2 — unbuilt)
- **Home DISCOVER** — during the 30 days before and the fortnight itself, the existing Pitru Smaran spotlight's caption becomes the परिचय invitation ("पितृ पक्ष क्या है, क्यों है — जानें") → `MoreTab/PitruPakshaShiksha`. Outside the season the card is unchanged. No second card.
- **Panchang day chip** (`PitruPakshaDayChip`) — the public season chip keeps opening the overview (now education-first). On **सर्वपितृ अमावस्या** the existing vidhi chip stays; no third chip.
- **Observance Detail** — `darsha-amavasya` during the fortnight, and any Pitru Paksha rule, gains a **"पितृ पक्ष — परिचय"** card in the §62 "How to observe" slot (renders only when `hasPitruShiksha()`).
- **Search** — each verified lesson and katha contributes one section row (`searchIndex.buildSectionEntries`, sourceId = `pitru:<id>`), opening `PitruPakshaShiksha` on the Home stack — which requires registering the two routes on the **Home** stack too (the PRD-19 multi-stack pattern; `vidhiBackNavigation.test.ts` extends).
- **जिज्ञासा (Ask)** — intents `pitru.kya-hai`, `pitru.tithi-agyat`, `pitru.tarpan-vs-shraddha`, `pitru.calendar-antar` answer from `getPitruLessons()` / `getPitruPrashna()` and act with "परिचय खोलें" (RULEBOOK §25 registration).

### 3.5 Notifications (Phase 3 — unbuilt; explicit product decision)
- **No change to the two public season fires** (18:00 eve of Purnima, eve of Sarvapitri). Their tap already lands on the overview, which is now education-first. Copy gains nothing.
- **Optional daily lesson — `pitru-paksha-lesson` — OFF by default.** A per-day 07:30 notice during the fortnight: "आज <tithi> श्राद्ध · <one-line lesson>" → `PitruPakshaShiksha`. At most **16 slots**, only when the user turns it on in Reminder Settings, and only when the day's tithi lesson is verified. **iOS pending budget:** the families are already over-subscribed against 64 in the worst case (notifications wiki gotcha); this family must arm **last** and yield first (cap = min(16, remaining budget)). Recommendation: ship 3.4 first, measure परिचय opens, and take Phase 3 only if the season surfaces show demand.

## 4. Data model (built) — `mobile/src/data/pitru/`

| File | Shape |
|---|---|
| `types.ts` | `PitruLessonEntry {kind: 'parichay'∣'tithi'∣'shabd', fortnightDay?, titleHi/En, bodyHi/En[], status, source}` · `PitruPrincipleEntry {verseLines?, iastLines?, cite, meaning, ref?: {kind:'gita'∣'valmiki', chapter, verseIndex}}` · `PitruKathaEntry {sections, teaching, canon, ref?}` · `PitruPrashnaEntry {question, answer}` · `PitruSource {referenceUrls (https:// or repo:), verificationNote (dated)}` |
| `lessons.ts` | 9 concept (7 verified) · **16 tithi — the whole fortnight** (2 verified) · 12 glossary (11 verified) |
| `principles.ts` | Gita 1.42 · 9.16 · 9.25 · 10.29 · 2.20 · Valmiki 2.102.27 · 1.41.19 (all verified, each `ref` resolving to the exact bundled verse) · Manu 3.70 (draft, unquoted) |
| `kathas.ts` | `rama-jalanjali` (Ayodhya 102) · `bhagirath-sagar` (Bala 38–44) · `jatayu-antim-sanskar` (Aranya 67–68) — all verified against the bundled corpus · `karna-mahalaya` (draft folk katha) |
| `prashna.ts` | 9 authored, 8 verified |
| `index.ts` | verified-only accessors behind `require()` thunks (launch-graph rule) · `hasPitruShiksha()` — the one door predicate |

**Invariants (pinned by `pitruShikshaContent.test.ts`, 17 cases):** unique ids; **the fortnight is covered end to end** (purnima, 1–14, amavasya each have a row); **a verified katha is always anchored by a `ref` into a bundled reader plus a `repo:` reference**; bilingual parity; verified ⇒ ≥2 refs incl. ≥1 https + dated note; draft ⇒ note says `DRAFT — NOT VERIFIED`; `fortnightDay` present iff `kind==='tithi'`, one row per day; quoted verse ⇒ IAST + a `ref`; no `ref` ⇒ no quote; every `ref` resolves to the bundled verse whose number/reference the cite line names; katha refs fall inside the sargas the canon line names; Devanagari well-formed; **stance guard** — no `must` / `you should` / `inauspicious` / `dosha` / `curse` / `streak` / `score`, no `आपको … करना चाहिए` / `अशुभ` / `पितृ दोष` / `श्राप` / `अवश्य करें` anywhere in rendered copy; the folk katha's canon line names its provenance.

## 5. Content plan — what "education" means here

| Bucket | Content | Source path | Phase |
|---|---|---|---|
| **A. What** | window; purnimant/amanta naming; Mahalaya; tithi-calendar-not-date; Sarvapitri fallback | dossier + engine | ✅ 1 |
| **B. Why** | three debts (TS 6.3.10.5); pancha-mahayajna (Manu 3.70); Gita 1.42 / 9.16 / 9.25 / 10.29 as the tradition's own statements | Gita ✅ bundled; Manu/TS ⏳ open & record | 1 (Gita) · 2 (rest) |
| **C. Whose day** | the mapping rule; purnima rule; kshaya two-name row; **all 16 per-tithi rows authored** (incl. Bharani by nakshatra, Kunwara Panchami, Matri/Avidhava Navami, Indira Ekadashi, Sannyasi Dwadashi, Ghata Chaturdashi, Pratipada for the maternal side) | engine ✅; the 14 assignments ⏳ Drik per-tithi pages + Nirnaya/Dharma Sindhu | 1 (rule + authoring) · 2 (flip) |
| **D. When in the day** | Kutapa · Rohina · Aparahna; why calendars differ | dossier ✅ | ✅ 1 |
| **E. What the rite is** | tarpana ≠ shraddha; anukalpa; agnaukarana/pinda/bhojana are integral; branch variation | dossier ✅ | ✅ 1 |
| **F. Kathas** | Rama at Mandakini (2.102) ✅; **Bhagiratha and the sixty thousand (Bala 38–44) ✅**; **Jatayu's rites (Aranya 67–68) ✅**; Bharata's 12th-day shraddha (2.77.1) — candidate; Karna folk katha ⏳ (label as लोक-परम्परा); Ravana's rites — **dropped**, corpus defect at 6.114.100 | bundled ✅; Karna ⏳ | 1 · 2 |
| **G. Glossary** | पितर · तर्पण · जलाञ्जलि · पिण्ड · तिल · दर्भ/कुश · अर्यमा · स्वधा · कुतप · अपराह्न · अनुकल्प ✅; गोत्र ⏳; sapindikarana, panchabali — candidates | dossier + bundled corpus ✅ | 1 · 2 |
| **H. FAQ** | 8 verified ✅ (materials-we-lack, why-water, where-the-guide-is added). The "can new work be undertaken" question is now **answered as an explicit non-verdict** rather than omitted — people ask it, and silence cedes the ground to fear copy; the row states only that the opened sources are procedural and defers to family practice. "Who may perform" stays draft by choice | dossier + corpus ✅ | 1 |

**Stance (locked).** The layer explains; it never prescribes ("आपको करना चाहिए" is banned copy), never asserts obligation, never names a dosha or a remedy, and never claims the app's guide is complete shraddha. Where the family's practice and the text differ, the copy says the family is right.

## 6. Navigation & privacy

- Two new routes in `MoreStackParamList`: `PitruPakshaShiksha: undefined` · `PitruKatha: {kathaId}`, registered on `MoreStackNavigator` after the overview so **Back retraces** overview → परिचय → katha. Gita hand-offs push the More stack's local `GitaReader`; the Valmiki hand-off crosses to `HomeTab/ValmikiRamayanReader` (not mounted on More — Phase 2 may mount it locally the way PRD-19 P3 mounted `GitaReader`).
- **No private data enters the education layer.** Routes carry `{kathaId}` only; the vidhi door passes `{vidhiId}` undated; no entry id, relation or name, no reminder payload change. The layer reads nothing from `PitruSmaranContext`.

## 7. Tests (built)

| Layer | Suite | Pins |
|---|---|---|
| Registry (Jest, `src/data/pitru/__tests__/`, added to `jest.config.js testMatch`) | `pitruShikshaContent.test.ts` | §4 invariants incl. reader-ref resolution against the bundled JSON and the stance guard |
| Screens (Jest) | `PitruPakshaShikshaScreen.test.tsx` | verified sections render, every draft absent (non-vacuous), lesson unfold, Gita → local `GitaReader {chapter:1, initialIndex:41}`, Valmiki → `HomeTab/ValmikiRamayanReader {2, 3715}`, katha + three doors navigate, English copy/IAST; katha reader verified vs draft id |
| Overview (Jest) | `PitruSmaranScreens.test.tsx` +2 | door opens `PitruPakshaShiksha`; `hasPitruShiksha() === false` ⇒ no door, no teaser |
| Gates | `launchGraph` (thunks) · `devanagariWellFormed` · `userFacingImplementationCopy` · `vidhiBackNavigation` · typecheck · lint 0 errors | all green 2026-09-19 |
| e2e (Phase 2) | extend `.maestro/pitru-smaran.yaml`: banner → overview → परिचय door → Gita 1.42 hand-off → back retraces | device evidence is a release gate (RULEBOOK §8) |

## 8. Rollout

1. **Phase 1 (this branch):** registry + screens + door, verified subset live, drafts dark. OTA-safe. One release of NEW on the overview door is *not* taken — grief is not a growth surface (PRD-19 P3 §11.1 stance).
2. **Phase 2:** open sources, flip drafts; season DISCOVER caption; Observance Detail card; search rows + Home-stack registration; Ask intents; Maestro extension.
3. **Phase 3 (decision):** opt-in daily lesson notification under the shared iOS budget.

## 9. Open questions

1. Which second source clears the per-tithi assignments — Nirnaya Sindhu or Dharma Sindhu's own tithi table? (Drik's shraddha-days page is one.)
2. Does the Karna folk katha ship at all? It is the story people *know*, and it is not in the critical text. Recommendation: yes, with the provenance line, because pretending it doesn't exist teaches less than saying what it is.
3. Should `ValmikiRamayanReader` be mounted on the More stack so the katha hand-off's Back returns to the katha (as `GitaReader` is)?
4. Phase 3 go/no-go after Phase 2 counters.

## 10. Design & doc compliance

design.md **§63.5** updated (the door) and new **§74** added; **RULEBOOK §28** added (the education-layer contract); wiki `subsystems/pitru-shiksha.md` + index + log. Tokens/components as shipped: §63 register, `ReaderHeader`, §33.6 rows, `goldTint` doors, ॥/ॐ glyphs, no emoji, 44 pt targets, English a11y labels for Maestro.

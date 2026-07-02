# PRD-12 — "Understand" (समझ) — Offline Scripture-Meaning Companion

| | |
|---|---|
| **Status** | Draft — R&D bet (feasibility spike gates the build) |
| **Target release** | TBD (after a feasibility spike) |
| **T-shirt size** | L → XL (net-new capability; R&D risk) |
| **Owner** | TBA |
| **Bet** | #2 (bold) — highest ceiling, highest risk |

---

**Local-first constraint (the hard part):** the viral moment in this category was cloud "Gita-GPT" chatbots. We **cannot** ship a cloud LLM without breaking the offline / no-account / no-server moat. This PRD is therefore deliberately scoped to **on-device thematic retrieval over content we already ship**, not a generative chatbot. The bet is that *"show me what the Gita says about fear"* — answered by surfacing the right verses and their existing meanings — delivers most of the value of a scripture assistant while staying 100% offline.

---

## 1. Problem

The app holds ~3,500+ verses with bilingual meaning text, reachable today only by (a) drilling into a section or (b) keyword search (PRD-03, `searchIndex.ts`). Both answer *"take me to a verse I can already name."* Neither answers the question a devotee actually arrives with:

> *"What does the Gita say about fear / anger / letting go of results / grief?"*

That is a **thematic / conceptual** query, and it is the single most requested thing in this space — the "Gita GPT" apps went viral precisely because they answered it. Our keyword index cannot: searching *"fear"* matches the literal token, not the verses *about* fear (अभयं, विगतभीः, मा शुचः …). The corpus already contains the answers; we have no way to retrieve them by meaning.

## 2. Goal

Turn the dormant meaning-text of the corpus into a **thematic guidance** surface, fully on-device:

- A user asks (types or picks a theme) *"fear"* and gets a **ranked set of verses** whose *meaning* is about fear, each with its existing translation and a one-tap jump into the reader.
- Curated **theme entries** ("Overcoming fear," "Doing your duty without attachment," "Dealing with grief," "Anger & its cost") give a browsable, no-typing path in for the majority who won't type a query.
- Zero network, zero account — the differentiator no online chatbot can match: *it works on a train with no signal, and it never sends your spiritual questions to a server.*

## 3. Non-goals

- **No generative text.** We do not synthesize new commentary or "answers in Krishna's voice." We **retrieve and rank existing verses + their existing meanings**. This sidesteps hallucination, doctrinal-accuracy risk, and the model-hosting problem entirely.
- **No cloud LLM, no API calls, no telemetry of queries.** If it can't run on-device, it's out of scope for this PRD (revisit only if the moat stance changes — a separate strategic decision).
- **No new translations/commentary content.** We use the meaning fields already bundled. Enriching commentary is a content project, not this.
- **Not a chatbot UI.** No conversational back-and-forth in v1; it is *ask → ranked verses.* (Conversational framing is a possible later layer once retrieval quality is proven.)

## 4. Two feasible technical approaches (the spike decides)

The whole PRD is gated on a **feasibility spike** — the honest unknown is how well semantic retrieval runs inside Expo/React Native without a native ML runtime. Two candidate approaches, cheapest first:

### Approach A — Curated theme → verse map (no ML) — *ships regardless*
A bundled, hand-authored `themes.json`: ~30–50 themes, each mapping to a ranked list of verse ids drawn from across the corpus, plus expanded synonym/keyword sets (fear → भय, डर, अभय, चिंता, anxiety, dread…) folded through the existing `searchNormalize` pipeline. This is **pure data + the existing index** — no ML, no risk — and it already delivers the *browse-by-theme* experience and a decent chunk of the *type-a-word* experience. **This is the guaranteed-shippable core.**

### Approach B — On-device semantic embeddings — *the spike*
Pre-compute an embedding per verse-meaning **at build time** (offline, in the content pipeline — `scripts/*.mjs`), bundle the vectors as a compact quantized asset, and at query time embed the query and rank by cosine similarity. The open question is the **query-time encoder on-device**: options to evaluate in the spike —
- a tiny bundled sentence-embedding model via `onnxruntime-react-native` / `react-native-executorch`, vs.
- a lexical-expansion fallback (Approach A's synonym map) when no encoder is viable.

The spike answers: bundle-size cost of the vectors + model, cold-start/latency on a mid-tier device, and retrieval quality vs. Approach A alone. **If B is infeasible, A still ships and delivers real value.**

## 5. Surfaces

- **Entry.** A **"समझ / Understand"** affordance — most naturally an alternate mode on the existing **Search** screen (a "Search" / "Explore themes" segment), reusing the search UI shell rather than a new tab.
- **Theme browse.** A grid of curated theme cards (Approach A) — the no-typing path.
- **Query.** Type a word/phrase → ranked verse cards (source label, verse label, the bundled meaning snippet, deity), each tapping through via `entryRoutes.ts` into the reader at that verse.
- **Result card** reuses the existing search-result / share-card verse styling for visual consistency.

## 6. Phasing

1. **Phase 0 — Feasibility spike (timeboxed, no ship).** Stand up Approach B on a device, measure bundle/latency/quality against Approach A on a fixed set of ~20 theme queries. Written go/no-go. *This must happen before committing to the build.*
2. **Phase 1 — Approach A ships.** `themes.json` + theme-browse + query-via-expanded-keywords over the existing index. Delivers the browsable thematic surface with zero ML risk.
3. **Phase 2 — Approach B (only if the spike is green).** Bundle vectors + on-device encoder; blend semantic ranking with the lexical path; keep A as the fallback when the encoder is cold or absent.

## 7. Reuse map

| Need | Existing asset |
|---|---|
| Normalization / folding / ranking | `src/data/searchNormalize.ts` (`MatchRank`, IAST fold) |
| Verse corpus + meanings | `src/data/searchIndex.ts` (`buildVerseEntries`) — already walks every section |
| Verse addressing → reader | `src/navigation/entryRoutes.ts` |
| Build-time embedding job (Approach B) | `scripts/*.mjs` content pipeline (offline, not a runtime step) |
| Result card styling | existing `SearchScreen` result rows / `ShareCard` |

## 8. Why it won't ruin the product

- **It deepens the core job (reading & understanding scripture), it does not bolt on a new one.** No commerce, no social, no account — it makes the *text itself* answer questions.
- **Privacy is a feature, not a compromise.** Because it's on-device, spiritual questions never leave the phone — a genuine, marketable contrast to cloud "Gita-GPT" apps. The offline moat becomes the selling point of the most modern feature.
- **Staged risk.** Approach A ships value with zero ML risk; Approach B is quarantined behind a go/no-go spike, so the product never bets the release on unproven on-device ML.

## 9. Decisions & open questions

**Decided:**
- Retrieval, not generation — no LLM, no hallucination surface (§3).
- On-device only; a cloud model is out of scope unless the moat stance is deliberately revisited.
- Approach A is the guaranteed core; Approach B is spike-gated.

**Open:**
1. **Spike outcome** — is on-device semantic embedding feasible within the bundle/latency budget? (Blocks Phase 2 only.)
2. **Theme catalog size & authorship** — who curates the ~30–50 themes and their verse mappings? Content-owner call.
3. **Entry placement** — a mode on the Search screen vs. its own surface. Default: a segment on Search.

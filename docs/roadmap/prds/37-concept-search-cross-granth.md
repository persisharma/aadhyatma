# PRD-37 — Cross-Granth Concept Search (Semantic)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.7.0 (concept mode in Search) → v1.7.1 (concept tags surface) |
| **Window** | Weeks 14–20 of Q2 2027 |
| **T-shirt size** | M (~5 dev-weeks) |
| **Owner** | TBA |
| **Depends on** | PRD-03 (existing keyword search) |

**Bundle-only constraint preserved.** Embeddings are pre-computed at build time and shipped as a quantized binary blob in the app bundle. On-device cosine-similarity is trivial. No backend call.

---

## 1. Problem

PRD-03 shipped keyword search over our corpus. It works well for "कर्मण्येवाधिकारस्ते" (find a specific verse you remember). It fails for the *more common* user need: searching a **concept** — "what does scripture say about anger?", "moksha", "krodha," "patience," "duty," "fear."

Today, a user typing "anger" gets only verses literally containing the word "anger" (or "क्रोध" in Devanagari mode) — missing all the conceptually-relevant verses across Gita ch.2 (sthitaprajna), ch.16 (asuric qualities), Sundarkand (Hanuman's controlled rage), etc. The cross-granth signal is exactly what we have that competitors don't.

The fix: semantic embeddings over our normalized corpus, ranked across sections. No backend — the corpus is small enough to ship the index in the app.

## 2. Goal

Add a "Concept" mode to the Search screen that returns relevance-ranked verses *across granths* for natural-language queries. Measured by:

- ≥ 40% of search sessions use Concept mode within 4 weeks of launch.
- ≥ 70% recall on a 50-query gold set vs. expert-curated answers.
- ≥ 60% top-1 result tap-through.
- Cross-section results (a single query hitting ≥ 3 different `sectionId`s in top-10): ≥ 60% of queries.

## 3. Non-goals

- **Free-form Q&A.** That's PRD-32 Gurudev. Concept search returns *verses*; Gurudev returns *answers*.
- **Server-side search.** Out by constraint. Embedding inference at query-time runs on-device.
- **Multi-language semantic search across non-corpus languages** (Telugu / Tamil queries). v2.
- **Filtering by deity / category / chapter inside concept mode** in v1. Keyword mode keeps filters; concept mode is global. Add filters in v1.7.2 if data justifies.
- **Re-indexing on user data** (user-added notes etc.). Out of scope.

## 4. User stories

> As a seeker exploring "moksha," I want a single search to surface relevant Gita verses, Sundarkand chaupais, and stotram lines, ranked by relevance, with a one-line preview of each.

> As a Hindi speaker, I want to search "क्रोध" and get top results across granths, not just literal-string hits.

> As a parent answering my child's question about "why we should be patient," I want a verse list I can read together — across multiple sources.

> As a power user, I want to switch between "Concept" and "Keyword" modes with one tap, so I can still do verse-string lookups when I remember the exact phrase.

> As a deep reader, I want the top results to *not* all be from the same Gita chapter — diverse sourcing matters.

## 5. Scope

### In scope — v1.7.0 (concept mode)

1. **Search mode toggle.** Top of `SearchScreen`, two pills: "Shabd / Keyword" (existing PRD-03) and "Vichaar / Concept" (new). Default toggle: Concept once a query is detected as natural-language-ish (more than 1 word and not present verbatim in the corpus).

2. **Concept query pipeline.**
   - Query is embedded on-device using a small quantized model.
   - Embedding compared (cosine sim) against pre-computed bundled corpus embeddings.
   - Top-30 retrieved → diversity-reranked (MMR) so the top-10 surfaces ≥ 3 different sections when possible.
   - Result row shows verse-preview + section + a "why this matched" snippet.

3. **On-device embedding model.**
   - Model: `multilingual-e5-small` or similar bilingual model. Quantized to int8.
   - Size: ~25 MB.
   - Loaded once on first concept-search; ~150ms inference per query on a mid-range device.
   - Runs via Apple `Core ML` (iOS) and `ONNX Runtime Mobile` (Android).

4. **Bundled corpus embeddings.**
   - Pre-computed at build time for every verse (in both `meaningHi` and `meaningEn` text — concatenated for higher recall).
   - ~3,500 verses × 384-dim float16 = ~2.7 MB. Acceptable.
   - Format: `mobile/assets/embeddings/corpus.bin` + `corpus.index.json` (verse-ID lookup).

5. **MMR (maximal marginal relevance) re-ranking.**
   - λ = 0.7 (relevance-weighted with light diversity push).
   - Implemented in TypeScript on top of the cosine-similarity scores.

6. **Result rendering.**
   - Re-uses the existing PRD-03 result row.
   - Adds a section badge ("Gītā · 2.47") and a tinted "concept match" pill if score is above the threshold.
   - Tap navigates via `entryRoutes.ts` `buildProgressTarget`.

7. **Empty / low-score handling.**
   - If top-1 score < 0.35, show "Aapko Gurudev se pucchna chahiye? / Want to ask Gurudev?" with a CTA to PRD-32. Cross-feature handoff.

### In scope — v1.7.1 (concept tags surface)

8. **Tag chips on result rows.** Every verse already has `tags: string[]` from PRD-32's content workstream. Show top 2 tags inline. Tap a tag → re-query with that concept.

9. **"Related concepts" footer** on result page: 3–5 related concept chips ("krodha" query → "patience," "ahankara," "sthitaprajna" chips), powered by tag co-occurrence in result set.

### Out of scope

- Concept search inside PRD-32 Gurudev's UI (Gurudev produces answers, not result lists).
- Real-time embeddings of user-typed text via a remote model.
- Cross-language query expansion (Hindi query → also match English verses). v1 indexes the bilingual concatenation so a Hindi query *does* hit English-meaning verses to some degree; explicit cross-lingual query expansion is v2.

## 6. UX notes

- Mode toggle: subtle saffron underline on active mode. Auto-detection on query type — but user can override.
- Result row preview shows ~70 chars of the matched verse meaning, lang-matched.
- Score visualization: a soft saffron dot whose opacity reflects score (≥0.7 full, ≥0.5 medium, ≥0.35 light). Never a percentage number — feels gamified.
- "Why this matched" snippet shows the highest-similarity phrase in the verse's meaning, underlined.
- Empty state: deity-art illustration with copy "Koi prasang nahi mila. Gurudev se pucchein? / No verses matched. Ask Gurudev?"
- First-time concept search shows a one-time tooltip explaining "concept" vs. "keyword."

## 7. Technical sketch

- **Build pipeline.**
  - `scripts/build-corpus-embeddings.ts` runs the embedding model over every verse's `meaningHi + ' ' + meaningEn` and emits `mobile/assets/embeddings/corpus.bin`.
  - Runs in CI on every release; embedding model version pinned in `mobile/src/data/embeddings/version.ts`.
  - CI check: every `LibraryEntry` has corresponding embeddings (parallel to PRD-03's coverage check).

- **Runtime.**
  - `mobile/src/data/embeddings/conceptSearch.ts` exposes `searchByConcept(query: string): Promise<ConceptResult[]>`.
  - First call lazy-loads the model + the corpus blob; ~250ms cold-start.
  - Subsequent calls: ~150ms per query.

- **Mobile platforms.**
  - iOS: Core ML model conversion at build time via `coremltools`.
  - Android: ONNX model + `onnxruntime-react-native`.
  - Same float16 embeddings work on both.

- **Tests.**
  - `mobile/src/data/embeddings/__tests__/conceptSearch.test.ts` — gold-set 50 queries, asserts top-1 expected verse appears in top-5 for ≥ 90% of queries.
  - `mobile/src/data/embeddings/__tests__/corpus.coverage.test.ts` — every active `LibraryEntry` has embeddings.
  - `mobile/src/data/embeddings/__tests__/mmr.test.ts` — diversity push: at least 3 distinct sections in top-10 for representative concept queries.
  - `mobile/src/screens/__tests__/SearchScreen.concept.test.tsx` — toggle works, result row renders, navigation works.

## 8. Bundle-size budget

| Asset | Size |
|---|---|
| Embedding model (int8 quantized) | ~25 MB |
| Corpus embeddings (3,500 × 384 × 2 bytes) | ~2.7 MB |
| Embedding lookup index | ~80 KB |
| **Total** | **~28 MB** |

This is non-trivial — half of the Q3 2026 +60 MB binary budget in a single feature. Justification: this is *the* defensible feature in the segment. Mitigation: ship as a **lazy-downloaded asset** on first concept-search ONLY IF the App Store binary inflates past 250 MB total; otherwise bundle. Decision before v1.7.0 release.

## 9. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Concept mode usage (queries) | Local counter | ≥ 40% of search sessions |
| Top-1 tap-through rate | Local | ≥ 60% |
| Cross-section result rate | Local | ≥ 60% (top-10 has ≥ 3 sections) |
| Gold-set recall | CI test | ≥ 70% |
| "Ask Gurudev" handoff rate (low-score query) | Local | ≥ 25% |
| Query latency P95 | Local | ≤ 250ms |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Embedding model size impacts install conversion | Lazy-download path documented; decision pre-launch. |
| Model accuracy on devotional / Sanskrit-flavored English meanings | Gold set graded by content lead + scholar; consider domain fine-tuning if recall < 70%. |
| Concept mode confuses keyword users | Mode toggle with clear pill labels; first-time tooltip; auto-detect on query type. |
| Cosine sim on quantized embeddings drops accuracy materially | float16 storage + int8 inference; eval gates pre-ship; fallback to float32 if accuracy regression > 5 pp. |
| Battery / CPU spike during embedding | Inference budget ≤ 200ms / query; throttle if user types fast (debounce 350ms). |
| Devanagari handling in tokenizer | Multilingual e5 tokenizer covers Devanagari well; tested on the gold set. |

## 11. Definition of done

- Concept mode live in Search; toggle works; both languages.
- Gold-set 50 queries pass with ≥ 70% recall and ≥ 60% cross-section diversity.
- Latency P95 ≤ 250ms on a mid-tier device (Pixel 6a / iPhone SE 3rd gen).
- Bundle-size impact reviewed: shipped bundled OR lazy-download path implemented.
- Handoff to Gurudev (PRD-32) works on low-score queries.
- All tests green; RULEBOOK §8 search-coverage assertion still passes.

## 12. Open questions

1. Bundle vs. lazy-download the embedding model? Decision pre-release based on App Store binary size at the time.
2. Should concept search include `commentary[]` text (longer-form, more nuanced) in the embedding? Recommend yes for v1.7.1 — adds richness but doubles embedding compute. Test on gold set.
3. Cross-lingual query expansion (Hindi query → also match an English-tagged verse explicitly): bundle today's hi+en concat may already cover; A/B with explicit expansion in v2.
4. Should we surface a small "Concept clouds" exploration UI (tap a concept to browse all verses)? Defer to v2; ride on the concept-tag chips first.
5. Re-rank with a server-side LLM for high-stakes queries? Out of scope for v1 (defeats the on-device promise); revisit if recall plateaus.

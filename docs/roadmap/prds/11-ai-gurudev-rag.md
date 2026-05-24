# PRD-11 — AI Gurudev (Scripture-Grounded Q&A via RAG)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.7.0 (beta, English only) → v1.7.1 (Hindi) → v1.7.2 (cross-text reasoning) |
| **Window** | Weeks 8–22 of Q1 2027 (spans into Q2) |
| **T-shirt size** | XL (~12 dev-weeks; needs backend + ML eval workstream) |
| **Owner** | TBA |
| **Depends on** | Backend platform (this PRD introduces it); auth (PRD-13 ships profile) |

**Constraint break:** this is the **first feature to require a runtime backend.** Bundle-only no longer holds end-to-end — corpus retrieval + LLM inference run server-side. See §7 for the architecture.

---

## 1. Problem

Users today have to leave Vedansh to ask any question about what they just read. "What does the Gita say about anger?" → Google → spam SEO. "Why does Hanuman tear his chest open?" → Quora → unreliable. The result is the *single highest-intent moment* (a user asking a sincere question about a verse) leaks to channels we don't control, with content quality we can't vouch for.

We have the asset to win this category outright: a structured per-verse corpus with `meaningHi`, `meaningEn`, and `commentary[]` across 18+ sections. Nobody else has this, indexed and queryable. A retrieval-augmented chat experience that *only* answers from our corpus — with verse citations linking back into the reader — would be the strongest defensible feature in the segment.

## 2. Goal

Ship an in-app "Pucho Gurudev" / "Ask Gurudev" surface where users type or speak a question, and Claude answers grounded in our corpus, citing specific verses and linking to them. Measured by:

- ≥ 35% of WAU open the Gurudev tab at least once per week (within 6 weeks of launch).
- ≥ 60% of Gurudev answers are tapped on a citation (proves the answer drove cross-section navigation).
- ≥ 70% thumbs-up rate on answer quality (in-app rating).
- ≤ 1% answers flagged as "off-corpus" / hallucinated by reviewer audit.
- Cost ≤ $0.01 / answer at projected volume.

## 3. Non-goals

- **Free-form ChatGPT.** Gurudev refuses non-scriptural questions ("What's the weather?") with a soft redirect.
- **Theological prescription** ("Should I do X ritual?"). The answer surfaces what scripture says; it does not give personal directives.
- **Astrology / kundli / muhurat.** Out by strategy (see 2027-feature-bets §6).
- **Multimodal in v1** (image of a temple, video). Text + voice only.
- **Multi-turn long memory in v1.** Conversation is one turn (question → grounded answer). v1.7.x may add 3-turn follow-ups; multi-session memory is deferred.
- **Custom personas** ("answer like Adi Shankara" vs. "like Prabhupada"). One canonical voice in v1.

## 4. User stories

> As a daily reader confused by what I just read, I want to ask "What does this verse mean in modern life?" and get an answer that cites the verse + one or two related verses.

> As a seeker who has heard "karma yoga" but never understood it, I want to ask the concept and have the app point me to Gita chapters 2, 3, and 5 with brief summaries and tap-to-read.

> As a Hindi speaker, I want to ask in Hindi and get the answer in Hindi.

> As a privacy-conscious user, I want to see exactly what verses were retrieved and used; no black-box answer.

> As a user worried about hallucination, I want a clear signal when the answer is "outside the corpus" and the app should refuse instead of guessing.

## 5. Scope

### In scope — v1.7.0 (beta, English)

1. **"Ask Gurudev" tab.** New bottom-tab item (or top-right home icon — A/B testable; see §6). Chat surface with a single text input, send button, voice input button.
2. **Retrieval pipeline.**
   - Corpus chunking: each verse is a chunk with metadata `(sectionId, chapterId, verseIndex, lang)`. ~3,500 chunks total.
   - Embedding: pre-computed at build time using `text-embedding-3-small` (or open-source `bge-small`). Stored in a vector index (Pinecone / pgvector). ~5 MB index.
   - Query embedding generated server-side; top-k = 8 retrieved.
3. **Grounded generation.**
   - Claude Haiku 4.5 with prompt caching on a system prompt that includes our corpus retrieval rules and refusal policy.
   - Retrieved chunks are formatted with citation tokens `[GITA-2.47]`, `[SUNDARKAND-5.3]` etc.
   - Output uses inline citation tokens; the client parses them and renders citation chips.
4. **Citation chips.** Tap → navigates into the reader at that verse. Re-uses `entryRoutes.ts` `buildProgressTarget`.
5. **Refusal policy.** If retrieval top-k similarity score < threshold OR the LLM responds with the "off-corpus" sentinel, the UI shows a polite redirect: "Yeh shastra mein nahi mila. Krupya alag prashn poochhein." / "I couldn't find this in the scriptures we carry. Try rephrasing."
6. **Rating row.** Thumbs up / down, plus optional one-tap "why?" reasons ("off-topic," "wrong verse," "wrong meaning"). Sent to our backend for eval.
7. **Disclaimer (always visible at the bottom).** "AI Gurudev quotes from our scriptural corpus. Not a substitute for a guru. Consult a learned teacher for personal guidance."
8. **Rate limit.** 20 questions / day for free users; primes the donation rail in PRD-19 without paywall framing in v1.7.0 itself.

### In scope — v1.7.1 (Hindi)

9. Hindi-language input + output. Retrieval uses bilingual embeddings; output language matches input language. Bilingual corpus already exists (`meaningHi`).

### In scope — v1.7.2 (cross-text reasoning)

10. Concept queries explicitly span multiple granths. The retrieval scores favor *diversity of section* when the question is concept-shaped ("what is dharma" should hit Gita + Sundarkand + a stotram, not 8 Gita verses).

### Out of scope

- Image / video understanding.
- Voice persona / TTS for the answer (PRD-17 covers TTS).
- Memory across sessions.
- Free-tier-paid-tier split. Donation rail (PRD-19) is the monetization layer; Gurudev itself stays free with rate limit.

## 6. UX notes

- Entry surface: top-right of Home (icon = lamp / diya); A/B test against a bottom-tab "Gurudev." Start with the icon (less invasive).
- Input box: placeholder rotates through example questions ("Why is anger harmful?" / "What does 'sthitaprajna' mean?" / "Hanuman ne Lanka kaise jalai?").
- Voice input via PRD-17's pipeline; release Hindi voice input together with v1.7.1.
- Answer rendering:
  - Top: concise answer (≤ 3 paragraphs).
  - Middle: citation chips (1–4) — tap-through to reader.
  - Bottom: rating row + disclaimer.
- Loading state: a gentle "Mananam kar rahe hain… / Reflecting…" animation. Devotional in tone, not "AI thinking."
- Errors: never expose stack traces or model names. Network failure → "Kuch der baad puchhein."
- Empty corpus retrieval → refusal policy text, never a hallucinated answer.
- Theme: same parchment / saffron palette; no chat-bubble UI cliché — answer is a verse-card-like panel.

## 7. Technical architecture

**This is where we introduce the backend.** Tight, narrow, one service.

```
[mobile app]
   │ HTTPS / JSON
   ▼
[Vedansh API @ api.vedansh.app]
   │   POST /v1/gurudev/ask
   │       { question, lang, anonId?, profileId? }
   │
   ├── 1. Embed question (Anthropic / OpenAI embed endpoint)
   ├── 2. Vector lookup (Pinecone / pgvector, top-k=8)
   ├── 3. Build prompt with retrieved chunks + system rules
   ├── 4. Call Claude Haiku 4.5 (claude-haiku-4-5-20251001)
   │      - Prompt caching enabled on system prefix + corpus chunks
   │      - Streaming response back to client (SSE)
   ├── 5. Parse citations, attach metadata
   ├── 6. Log (question, retrievals, output, rating-later) for eval
   ▼
[response stream]
   { answer_chunks: [...], citations: [{sectionId, verseId}, ...] }
```

**Hosting.** Indian-region cloud (data residency). Single managed service (Render / Railway / AWS Mumbai) — no Kubernetes for v1.

**Auth.** PRD-13 ships profile + anon device tokens. Gurudev uses the device token for rate limiting; no login required to ask.

**Vector store.** `pgvector` in our managed Postgres (cheapest path; ~3,500 chunks is trivial). Pinecone if scale grows.

**Prompt caching.** Corpus retrievals are formatted as a single cached block per request; only the question varies. Cache hit rate target: ≥ 90% on the system prefix.

**Model choice.** `claude-haiku-4-5-20251001` for cost; `claude-sonnet-4-6` for v1.7.2 concept reasoning if Haiku quality plateaus.

**Eval workstream.** A 200-question golden set covering: literal verse lookup, concept queries, off-corpus refusals, Hindi queries, ambiguous queries. Run weekly; regression-gate model / prompt changes.

**Observability.** Every answer logs `(question_hash, retrieval_ids, model, latency, cost, rating)`. PII (raw question) only logged when the user opts in to "help improve Gurudev" (off by default).

**Mobile client.**
- New module `mobile/src/features/gurudev/`:
  - `GurudevScreen.tsx` — chat surface.
  - `useGurudevAsk.ts` — TanStack Query hook calling the API with SSE.
  - `CitationChip.tsx` — renders a verse citation, routes via `entryRoutes.ts`.
  - `gurudevApi.ts` — fetch wrapper with retry + rate-limit-aware backoff.
- New tests:
  - `mobile/src/features/gurudev/__tests__/CitationChip.test.tsx` — renders citation; tap navigates correctly.
  - `mobile/src/features/gurudev/__tests__/useGurudevAsk.test.ts` — streaming response assembly.
  - `mobile/src/features/gurudev/__tests__/GurudevScreen.test.tsx` — empty state, loading, error, success rendering.

## 8. Safety & accuracy

- **Refusal sentinel.** The system prompt instructs Claude to emit `[NO_CORPUS_MATCH]` when nothing relevant is retrieved or when the question is non-scriptural. Client detects the sentinel and renders the refusal copy instead of the model's prose.
- **Citation validation.** Server post-processes the output: every `[SECTION-VERSE]` citation must match a retrieved chunk. Citations to non-retrieved verses are stripped + flagged for review.
- **Prompt injection defense.** User input is wrapped in `<user_question>` tags in the system prompt; explicit instruction to ignore embedded instructions in user input.
- **Theological liability.** Disclaimer always visible. Output prefixed with "Shastra kehte hain… / The scriptures say…" rather than "You should…"
- **Red-team set.** 50 prompt-injection / jailbreak / non-scriptural-but-tricky questions in the eval set, refreshed monthly.

## 9. Content track

- Corpus QA pass: confirm every section's `meaningHi/meaningEn/commentary` is well-formed for retrieval. RULEBOOK already enforces shape; one-time cleanup of stray HTML / mojibake.
- "Concept tags" augmentation (Q2): add `tags: ['anger', 'karma', 'dharma', ...]` to each verse to improve concept-query retrieval beyond pure embedding similarity. Owned by content lead.

## 10. Cost & rate-limit model

| Lever | Value |
|---|---|
| Avg input tokens / query (after caching) | ~800 |
| Avg cached tokens (system + retrieved) | ~6,000 |
| Avg output tokens | ~350 |
| Model | claude-haiku-4-5-20251001 |
| Est. cost / query | ~$0.005 |
| Free rate limit | 20 / day / device |
| Burst limit | 5 / minute |

At 250k MAU × 4 questions / week avg, monthly cost is ~$20k. Donation rail (PRD-19) is the offset; if conversion hits its target (~$60k MRR), Gurudev is net-positive. If not, model swap to a smaller open-source model is the fallback.

## 11. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Gurudev WAU / total WAU | Backend log | ≥ 35% |
| Citation tap-through rate | Mobile event | ≥ 60% |
| Thumbs-up rate | Backend log | ≥ 70% |
| Refusal-when-appropriate rate | Eval set | ≥ 95% |
| Hallucination rate (audited sample) | Manual audit | ≤ 1% |
| P95 latency (first token) | Backend log | ≤ 1.2s |
| P95 latency (full answer) | Backend log | ≤ 4s |

## 12. Risks

| Risk | Mitigation |
|---|---|
| Hallucinated theology causes community backlash | Refusal-first policy; citation validation; eval gates; conservative disclaimer; community advisory board signed off before launch. |
| Cost runs away | Hard rate limit; prompt caching mandatory; model swap path documented. |
| User asks personal / mental-health questions | Detection prompt + redirect to professional resources; no engagement; logged for review. |
| Hindi quality lags English | Stage rollout (v1.7.1); separate Hindi eval set; native-speaker reviewers. |
| Corpus retrieval misses ("I know the verse exists but Gurudev says it doesn't") | Concept-tag augmentation (Q2); periodic recall audit; allow user to flag with one tap. |
| Prompt injection from in-corpus content (a verse contains a sentence that *looks* like an instruction) | Use Claude's tool-use to wall off corpus content; we've vetted the corpus; low risk. |
| Backend downtime breaks the feature for everyone | Cache last 5 answers per device locally for offline view; graceful degradation message. |

## 13. Definition of done

- v1.7.0: English Gurudev live, behind a feature flag, 5% rollout. Eval set passing with target margins.
- Refusal policy demonstrably triggers on the red-team set (recorded video for QA).
- Citation links validated end-to-end: backend → SSE → client → reader page.
- Rate-limit + auth + observability dashboards green.
- Privacy & data-handling page added to the app; opt-in for analytics.
- v1.7.1: Hindi parity, separate eval set ≥ 70% thumbs-up.
- v1.7.2: cross-text concept queries shipped; 200-question concept eval set ≥ 75% thumbs-up.

## 14. Open questions

1. Anthropic API vs. Bedrock vs. Azure for the Mumbai-region inference path? (Latency + data-residency tradeoff.)
2. Tab vs. icon vs. bottom-sheet for the Gurudev surface? Plan: A/B in v1.7.0.
3. Should we offer a "scholarly mode" toggle (longer answers, more citations) vs. default "simple mode"? Defer to v1.7.2 if user research justifies.
4. Voice answer (TTS reads the response) — defer to PRD-17 integration.
5. Do we partner with a real scholar / matha for the community advisory board? Owner: founder.

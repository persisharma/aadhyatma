# Vedansh — 2027 Strategic Feature Bets

**Plan window:** Q1 2027 – Q4 2027 (4 quarters)
**Authored:** 24 May 2026
**Owner:** Product (PM)
**Current shipped version (assumed at planning):** 1.5.x (audio shipped via Q3 2026 PRD-02; search shipped via PRD-03; notifications shipped via PRD-01).

This document is the strategic parent for the next-generation roadmap that comes *after* the Q3 2026 plan. It frames the 10 feature bets that move Vedansh from "best devotional reader" to "the spiritual companion." Each bet has a dedicated PRD under `docs/roadmap/prds/31-*.md` through `40-*.md`.

> **Renumbering note (Sep 2026):** These PRDs were originally drafted as PRD-10 … PRD-19. Since
> authoring, main assigned 10–19 to other shipped/in-flight PRDs, reserved 20–29 for the Q4 2026
> candidate slates, and retired 30 — so this set was renumbered to **PRD-31 … PRD-40**. Some bets
> now partially overlap work that shipped or was specced after authoring; reconcile before picking
> one up: PRD-33 (panchang/festival anchoring) vs the shipped daily-muhurat work
> ([PRD-14](./prds/14-daily-muhurat.md)), PRD-34 (sankalp + streaks) vs the shipped daily routine
> ([PRD-07](./prds/07-daily-routine-sadhana.md)), and PRD-38 (read-aloud) vs
> [PRD-13 audio follow-along](./prds/13-audio-follow-along.md).

---

## 1. Market frame

Vedansh's current product is a literary-grade bilingual reader: Gita, Sundarkand, Ramcharitmanas, 4 chalisas, 5 stotrams, 7 aartis, japam. Strong on text fidelity (IAST vs. Awadhi distinction, deity + category cross-browse, deterministic verse art, RULEBOOK governance). Weak on *everything that happens when the user is not reading.*

| Competitor | Where they outscore us today |
|---|---|
| **Sri Mandir** (~50M MAU) | Virtual puja, live aarti streams from real temples, panchang, prasad delivery, donations, rashifal. The full "temple in your pocket" daily-utility loop. |
| **AstroSage / AstroTalk** (~10M MAU) | Kundli, daily rashifal, paid astrologer chat. |
| **ISKCON Bhakti Vedabase** (niche but authoritative) | Deep Prabhupada commentary on Gita / Bhagavatam, taxonomy of concepts. |
| **Sattva / Insight Timer** (global meditation) | Audio depth, streaks, teacher courses, satsang community. |
| **Drik Panchang / Hindu Calendar** (utility) | Accurate tithi / muhurat / festival data. |
| **Bhakti Sangeet apps** (Gaana / JioSaavn devotional) | Vast audio catalog, playback. |

**Our defensible moat — what only we have:**
1. A *structured, bilingual, per-verse* corpus with `meaningHi`, `meaningEn`, and `commentary[]` across granths. Sri Mandir doesn't have this; Vedabase has it for Gita but not for Sundarkand/Ramcharitmanas with the same uniform shape; bhakti music apps don't have it at all.
2. A design-system discipline (RULEBOOK + design.md) that lets us ship new sections without quality drift.
3. A pre-existing engagement substrate: bookmarks, reading progress, streaks (Sadhak Profile), japa counter.

The 10 bets below are designed to compound on (1) — every feature uses our corpus as the unique ingredient, so a competitor would have to rebuild our data layer to copy us.

---

## 2. The 10 bets, at a glance

| # | PRD | Bet | Moat | Risk | Constraint break |
|---|---|---|---|---|---|
| 1 | 10 | **Karaoke verse-sync audio** | Pairs our verse corpus with line-level audio sync — nobody else has both | Audio licensing, segment-drift QA | None — extends bundle-only |
| 2 | 11 | **AI Gurudev (RAG over our corpus)** | Defensible — needs our structured commentary | Hallucination, theological liability | **Breaks bundle-only** — needs backend |
| 3 | 12 | **Panchang + festival-anchored content** | Routes panchang directly into our reader (Sri Mandir doesn't) | Ephemeris accuracy, regional variants | None — bundled JSON |
| 4 | 13 | **Sankalp + streak system** | Cultural framing (pledge vs. gamification) | Notification fatigue | None |
| 5 | 14 | **Personalized verse (mood-aware)** | AI-grounded selection from our corpus | Trivialization risk on a sacred text | **Breaks bundle-only** — needs backend |
| 6 | 15 | **Family / group japa circles** | First-mover on social devotion | Privacy / abuse / moderation | **Breaks bundle-only** — needs backend |
| 7 | 16 | **Cross-granth concept search** | Semantic search over our normalized corpus | On-device embedding model size | None — on-device |
| 8 | 17 | **Read-aloud / voice input** | Accessibility moat, elderly + driving audience | TTS Devanagari quality | None — OS TTS |
| 9 | 18 | **Live darshan + scripture cross-link** | Sri Mandir does darshan, we add the textual depth | Temple partnerships, stream reliability | **Breaks bundle-only** — needs streaming |
| 10 | 19 | **Dakshina / donation rail** | Monetization without compromising the reading experience | UPI / payment compliance, trust | **Breaks bundle-only** — needs backend |

**6 of 10 features (#1, #3, #4, #7, #8, partially #2) can ship under the existing bundle-only constraint.** The other 4 require a backend. See §4 below for the staged backend introduction.

---

## 3. Sequencing & theme per quarter

### Q1 2027 — *"Make the app feel alive without leaving bundle-only"*

| PRD | Feature | Why first |
|---|---|---|
| 10 | Karaoke verse-sync audio | Extends shipped audio (PRD-02); pure value-add, low risk |
| 12 | Panchang + festival anchoring | Daily-open trigger; closes the gap with Sri Mandir's #1 hook |
| 13 | Sankalp + streak system | Retention compounding; reuses notification scaffold from PRD-01 |

**Outcome:** D7 retention +15 pp, daily-open rate +3×, no backend introduced.

### Q2 2027 — *"AI moat + scholarly depth"*

| PRD | Feature | Why now |
|---|---|---|
| 11 | AI Gurudev (RAG) | Requires backend — Q2 is when we commit. Strong defensible bet. |
| 14 | Personalized verse (mood-aware) | Builds on (11) infra; lightweight reuse |
| 16 | Cross-granth concept search | On-device but needs embeddings pipeline; aligns with AI workstream |
| 17 | Read-aloud + voice input | Accessibility + driving audience; pure OS-API plumbing |

**Outcome:** First defensible AI feature in the segment. Backend introduced behind one API surface.

### Q3 2027 — *"Social devotion"*

| PRD | Feature | Why now |
|---|---|---|
| 15 | Family / group japa circles | Needs the backend stood up in Q2 to extend; high virality potential |

**Outcome:** Word-of-mouth growth engine; install referrals from WhatsApp.

### Q4 2027 — *"Reach + monetization"*

| PRD | Feature | Why last |
|---|---|---|
| 18 | Live darshan + scripture cross-link | Needs partnerships (long lead time); ships when streams are signed |
| 19 | Dakshina / donation rail | Needs trust (built across Q1–Q3); compliance work in parallel from Q2 |

**Outcome:** First revenue surface; monetization without compromising the reading core.

---

## 4. Backend introduction (the central architecture decision)

Q3 2026's "bundle-only" was the right constraint when the product was a reader. Five of the ten bets require a backend, so 2027 introduces one — **deliberately, narrowly, and behind clean boundaries**:

- **Stage 1 (Q1 2027, PRDs 10/12/13):** No backend. Bundle-only continues.
- **Stage 2 (Q2 2027, PRD-32):** Introduce a **single, narrow backend service** for AI Gurudev only — a retrieval-augmented chat endpoint. Everything else still bundle-only. Cost: ~$0.005/query at projected volume (Claude Haiku 4.5 with prompt caching on the corpus prefix).
- **Stage 3 (Q3 2027, PRD-36):** Extend the same backend to group state (japa circles). No additional infra family; same auth, same DB.
- **Stage 4 (Q4 2027, PRDs 18/19):** Streaming partners (third-party CDN) and payment partner (Razorpay/UPI). Both behind their respective vendors' SDKs; no significant new infra of our own.

**Auth & identity:** account creation becomes optional in Q1 2027 (a profile name + email for streak portability and family circle membership). Anonymous-by-default remains the path for the reading-only user. PRD-34 (sankalp) introduces this.

**Data residency:** all user-identifying data (account, japa circles, donation history) is stored in India (compliance + latency). The corpus retrieval index is geo-replicated.

---

## 5. Success metrics (year-end 2027 targets)

| Metric | Today (May 2026) | EoY 2027 target | Driving PRDs |
|---|---|---|---|
| D7 return rate | ~22% | 55% | 10, 12, 13, 14 |
| D30 return rate | ~9% | 32% | 13, 15 |
| Daily notification open rate | n/a (no notifs) | 28% | 12, 13, 14 |
| Average session length | ~4 min | 11 min | 10, 11, 17 |
| Verse-page completion / session | ~60% | 78% | 10, 17 |
| Cross-section navigation per session | ~1.2 | 2.8 | 11, 16 |
| Monthly active users | 18k (assumed) | 250k | 13, 15, 18 |
| Paid donation conversion | 0% | 4% of MAU | 19 |
| AI Gurudev session % of total sessions | 0% | 35% | 11 |

---

## 6. What we are explicitly *not* doing

- **Astrology / kundli / rashifal.** Crowded market, dilutes the scriptural focus, no defensible angle. Refer users to AstroSage. Do not become AstroTalk.
- **Generic meditation timer / Calm clone.** Insight Timer owns this; we'd be a worse version of them with a Hindu skin.
- **General-purpose Hindu social network.** Group japa circles (#15) is *scoped* social — shared accumulation toward a sankalp. We are not building Facebook for devotees.
- **E-commerce beyond dakshina.** No prasad delivery, no idol shop. Sri Mandir owns the logistics; we own the text.
- **Multi-language expansion (Telugu / Tamil / Marathi) in 2027.** Deferred — the AI Gurudev infra is a prerequisite (auto-translation grounded in source verses); attempting earlier will produce low-quality bilingual content that violates RULEBOOK.

---

## 7. Cross-cutting workstreams (start Q1, run all year)

1. **Backend platform** (begins Q1, lands Q2). Auth, profile storage, AI Gurudev endpoint. Owner: backend lead (hire by Dec 2026 if not in place).
2. **Content / licensing** (continuous). Audio commissioning, panchang data vendor selection, temple partnership outreach.
3. **Compliance & legal** (Q1 onwards). UPI / payments licensure, donation handling under Indian law, content moderation policy for circles, data residency.
4. **Testing infrastructure** (Q1). The audio karaoke segments and AI Gurudev outputs need contract tests beyond what `<Pascal>ReaderScreen.test.tsx` covers today.

---

## 8. PRD index

- [PRD-31 — Karaoke verse-sync audio](./prds/31-karaoke-verse-sync-audio.md)
- [PRD-32 — AI Gurudev (RAG)](./prds/32-ai-gurudev-rag.md)
- [PRD-33 — Panchang + festival anchoring](./prds/33-panchang-festival-anchoring.md)
- [PRD-34 — Sankalp + streak system](./prds/34-sankalp-streak-system.md)
- [PRD-35 — Personalized verse (mood-aware)](./prds/35-personalized-verse-mood-aware.md)
- [PRD-36 — Family / group japa circles](./prds/36-family-japa-circles.md)
- [PRD-37 — Cross-granth concept search](./prds/37-concept-search-cross-granth.md)
- [PRD-38 — Read-aloud + voice input](./prds/38-read-aloud-voice-input.md)
- [PRD-39 — Live darshan + scripture cross-link](./prds/39-live-darshan-cross-link.md)
- [PRD-40 — Dakshina / donation rail](./prds/40-dakshina-donation-rail.md)

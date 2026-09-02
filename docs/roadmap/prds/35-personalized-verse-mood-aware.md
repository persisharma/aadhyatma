# PRD-35 — Personalized Verse (Mood / Intent-Aware Daily Bhakti)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.7.0 (alongside Gurudev) |
| **Window** | Weeks 18–22 of Q2 2027 |
| **T-shirt size** | S (~3 dev-weeks; reuses Gurudev backend) |
| **Owner** | TBA |
| **Depends on** | PRD-32 (AI Gurudev backend), PRD-34 (profile) |

**Constraint break:** runs on the AI Gurudev backend from PRD-32. No new infrastructure introduced; this PRD piggybacks the existing endpoint.

---

## 1. Problem

Daily Bhakti tab currently shows a random verse from `versePool.ts`. It's pleasant but disconnected from anything the user is actually feeling that day. Co-Star, Insight Timer, and even fortune-cookie apps prove that a single context input ("how are you feeling?") converts a generic surface into a personal one — and lifts daily-open intent dramatically.

We have a uniquely strong asset for this: an entire scriptural corpus that *speaks to* every human emotion — Gita on anger, Sundarkand on courage, Vishnu Sahasranama on faith, Hanuman Chalisa on protection. A random pull misses the connection a curated pull would make.

Sri Mandir has a "thought of the day" but it's pre-written, not contextual. AstroSage's rashifal is contextual to your zodiac, not your day. Nobody pulls *the right verse for your current emotional state from a structured corpus*.

## 2. Goal

Replace the Daily Bhakti tab's random verse with a personalized verse picked from our corpus based on a one-tap mood selection or short free-text intent. Measured by:

- ≥ 70% of users complete the daily mood check-in within their first session per day.
- ≥ 45% tap-through to read the full chapter context for the surfaced verse (vs. ~12% on the existing random verse).
- Daily Bhakti session length: +60%.
- D30 retention lift on users who use the mood check-in regularly: +12pp.
- ≥ 75% "this resonated" thumbs-up rate.

## 3. Non-goals

- **Diagnostic / mental-health framing.** We are not a therapy app. Severe distress signals route to professional resources, not verses.
- **Free-form therapeutic chat.** Gurudev (PRD-32) handles questions; this surface delivers a single verse and explanation.
- **Mood graph / journaling.** Tempting but scope-creep. The check-in is a fresh signal each day, not a longitudinal tracker.
- **Mood-driven notifications** in v1. The surface is in-app only; notifications stay deterministic (PRD-01, PRD-33, PRD-34).
- **Sharing the mood entry** itself (privacy).

## 4. User stories

> As a user feeling anxious before a job interview, I want one verse that speaks to anxiety, plus a one-line explanation of how it applies.

> As a user feeling grateful, I want a verse that names that feeling and grounds it — not a generic "be grateful" platitude.

> As a Hindi speaker, I want the mood prompts in Hindi and the verse with Hindi meaning surfaced first.

> As a user who used the feature yesterday, I don't want the *same* verse pulled again today even if I tap the same mood — variation matters.

> As a privacy-conscious user, I don't want my mood text leaving the device unless I explicitly opt in.

## 5. Scope

### In scope — v1.7.0

1. **Mood check-in surface.** Replaces the current Daily Bhakti random-verse top section.
   - **Quick mode** (default): 8 emoji-free mood chips, lang-matched:
     - शांत · Calm
     - व्यथित · Anxious
     - कृतज्ञ · Grateful
     - क्रोधित · Angry
     - उदास · Sad
     - उत्साहित · Energized
     - भ्रमित · Confused
     - साहसी · Courageous
   - **Detailed mode** (tap "Aur batayein / Tell more"): single-line text input — "Aaj mann mein kya hai? / What's on your mind today?"

2. **Verse selection (server-side via Gurudev backend).**
   - Endpoint: `POST /v1/personalized-verse`
   - Request: `{ mood: 'calm' | 'anxious' | ... | string, lang: 'hi' | 'en', recentVerseIds: string[], profileId? }`
   - Backend:
     1. Map mood → concept tags (e.g. "anxious" → `['fear', 'attachment', 'control']`).
     2. Retrieve verses tagged with those concepts; filter out `recentVerseIds`.
     3. Re-rank with LLM for the *single best* fit; produce a 2-line explanation.
     4. Return `{ verseRef: { sectionId, verseId }, explanationHi, explanationEn }`.
   - Free-text mode: embed the user input, retrieve, same flow.

3. **Verse render.**
   - The chosen verse + its `meaningHi/meaningEn` rendered as a verse card (re-uses reader chrome).
   - Below: "Aaj ka prasang / Today's relevance" — the 2-line AI explanation, lang-matched, prefixed with "Shastra kehte hain… / The scriptures say…"
   - Tap-through: "Aur padhein → / Read more →" goes to the full reader at that verse.
   - Rate row: thumbs-up / thumbs-down (feeds eval).

4. **Privacy & opt-in.**
   - Quick-mode (chips) sends only the chip ID — no PII.
   - Detailed-mode text: explicit consent toggle "Help improve Gurudev by sharing this prompt?" off by default. If off, the text is embedded **client-side** (small on-device model) and only the embedding goes to server.
   - On-device embedding: Apple's `NaturalLanguage` framework or a small CoreML model (~10 MB). Android: `MediaPipe TextEmbedder`.

5. **Variation guard.** Last 14 days of `verseRef`s stored locally; sent in `recentVerseIds` to backend; backend excludes them from candidates.

6. **Fallback.** When backend is unreachable, falls back to a *bundled* mood→verse map (8 chips × ~12 verses each = ~96 verse refs) so the feature works offline at degraded quality.

### Out of scope

- Mood journaling / history view.
- Mood-based playlists of audio recitations (v2).
- Mood-driven push notifications.
- Free-text in a non-supported language (Tamil / Telugu) — v2.

## 6. UX notes

- Mood chips: large, tappable, scrollable horizontal row. Calm visual; no emoji. Saffron underline on selection.
- The verse card is *the* hero of Daily Bhakti once chosen.
- No re-prompt after a mood selection on the same day; the verse stays on the tab for the day. A small "Naya prasang / New verse" link below the verse lets the user request another pull (rate-limited to 5/day).
- Free-text input shows the consent toggle inline — never a separate sheet.
- Severe distress detection: if the free-text contains markers ("I want to die", "self-harm", etc., across HI/EN), the verse is suppressed and a single-screen "Help is available" panel routes to iCall / Vandrevala helpline (India) + 988 (US). Logged for review (no text content sent).
- Tone: introspective, not motivational. No "you've got this!" — the scripture does the work.

## 7. Technical sketch

- **Mood → concept-tag table.** Hand-curated by content lead + scholar.
  ```ts
  export const moodConceptTags = {
    anxious: ['fear', 'attachment', 'control', 'surrender'],
    angry:   ['krodha', 'patience', 'sthitaprajna'],
    grateful:['gratitude', 'devotion', 'humility'],
    // …
  };
  ```
- **Verse concept tagging.** Q2 content workstream (already noted in PRD-32 §9): every verse gets `tags: string[]`. ~3,500 verses; ~6 weeks for one content lead + reviewer.
- **Backend endpoint.** Re-uses the Gurudev pipeline: same retrieval, smaller output budget (2-line explanation, not multi-paragraph). Same prompt-caching prefix.
- **Mobile client.**
  - New `mobile/src/features/dailybhakti/MoodCheckIn.tsx`.
  - New `usePersonalizedVerse.ts` hook (TanStack Query).
  - Local fallback table at `mobile/src/data/personalized-verse-fallback.ts`.
  - Last-14-days verse-ref ring buffer in `AsyncStorage`.
- **Tests:**
  - `mobile/src/features/dailybhakti/__tests__/MoodCheckIn.test.tsx` — chip + free-text flow.
  - `mobile/src/features/dailybhakti/__tests__/usePersonalizedVerse.test.ts` — fallback when backend down; recent-exclusion logic.
  - `mobile/src/features/dailybhakti/__tests__/distressDetection.test.ts` — distress markers route to help screen, not verse.
  - Backend eval: 200 mood prompts (50 per language × 4 emotional clusters), thumbs-up target ≥ 75%.

## 8. Cost model

- Re-uses Gurudev infra; smaller output budget (~150 tokens) → ~$0.003 / personalized verse.
- 1 personalized verse / user / day × 250k MAU × 30 days = $22.5k / month at full uptake. Within the Gurudev cost envelope (PRD-32 already absorbs).
- Fallback table makes the feature degrade gracefully if cost runaway forces a temporary backend pause.

## 9. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Mood check-in completion rate | Local + backend | ≥ 70% / DAU |
| Personalized verse tap-through to full reader | Local | ≥ 45% |
| Thumbs-up rate on AI explanation | Backend | ≥ 75% |
| Repeat-verse-in-14d rate (variation guard health) | Backend audit | ≤ 1% |
| Distress-detection precision | Eval set | ≥ 90% (false positives surface help; acceptable) |
| Distress-detection recall on test phrases | Eval set | 100% |
| D30 retention lift (mood-checkin vs. not) | Cohort analysis | +12pp |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Trivializing scripture by mood-vending | Conservative tone, scholar review of mood→concept table; thumbs-down audit feeds prompt iteration. |
| Privacy leakage on free-text input | Default off; on-device embedding path when off; explicit consent UI. |
| Distress detection false negatives | Conservative regex + LLM classifier; bias toward help screen when uncertain. |
| Same verse pulled repeatedly | Variation guard (14d ring) + diversity constraint on backend re-rank. |
| Backend outage breaks Daily Bhakti | Bundled fallback table; graceful degradation. |
| Mood-chip taxonomy disagreement (8 isn't enough / too many) | A/B test 8 vs. 6 vs. 10; iterate post-launch. |
| Bias in concept-tag mapping (Western emotional taxonomy vs. Hindu *rasa* / *bhava*) | Scholar-led tagging; allow Hindi mood inputs that may not map 1:1 to Western moods. |

## 11. Definition of done

- Mood check-in is the new Daily Bhakti default; old random verse retired.
- All 8 chips × 2 languages produce contextually-appropriate verses on the eval set with ≥ 75% thumbs-up.
- Free-text mode works in both languages with on-device embedding default.
- Distress detection routes correctly; help-screen content reviewed by a mental-health professional.
- Fallback table tested with backend unreachable.
- Variation guard: across 14 consecutive days, no verse repeated for the same user.
- TestFlight 14-day soak: at least 200 thumbs-up votes; trend ≥ 75% positive.

## 12. Open questions

1. Should we surface *why* the verse was chosen ("Because you said 'anxious'") inline, or keep it implicit? Recommend explicit — builds trust in the AI selection.
2. Should mood be sticky for the day or re-promptable on every Daily Bhakti open? Recommend sticky with a "naya prasang" override.
3. Do we offer a "no mood today / surprise me" chip? Recommend yes — preserves the random-verse fallback for users who don't want to check in.
4. Do we log mood for personal viewing (mini-journal) later? Defer to v2; collect demand.
5. Should the verse-of-the-day notification (PRD-01) become mood-aware? Defer to v1.7.1 if data justifies; needs morning mood check-in workflow.

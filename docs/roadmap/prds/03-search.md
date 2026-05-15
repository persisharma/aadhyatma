# PRD-03 — Global Library Search

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.6.0 |
| **Window** | Weeks 32–34 (3 Aug – 21 Aug 2026) |
| **T-shirt size** | M (~3 dev-weeks) |
| **Owner** | TBA |

---

## 1. Problem

The library has 20+ sections and ~3 500 verses. Today the only way to reach a verse is: Home → category tile → list → reader → swipe N times. A user who recalls *"कर्मण्येवाधिकारस्ते"* cannot get to BG 2.47 without knowing it's chapter 2. The Sadhak Profile tracks reads and the catalog keeps growing; without search, the back-catalog is invisible.

There is also a strategic angle: search queries are the cheapest, most honest read-out of what users actually want. They'll inform Q4 content prioritization.

## 2. Goal

Ship a single search screen that searches verse text (Devanagari + romanization + meaning, both languages), section titles, deity names, and chapter labels. Sub-200 ms perceived latency. Measured by:

- ≥ 35% of WAU run at least one search per week.
- ≥ 60% of searches result in a tap-through to a reader.
- < 200 ms p95 latency from keystroke to first result render.
- < 500 KB additional bundle for the index.

## 3. Non-goals

- Cloud search (everything is on-device).
- Fuzzy / phonetic Sanskrit matching beyond ASCII-folded normalization. (E.g., "krishna" matches "kṛṣṇa" because both fold to `krsna`, but "krsn" with no vowel is not a v1 query.)
- Search history or saved searches (Q4 if used).
- Voice search.
- Search inside commentary text (only verse + meaning) — commentary is huge and adds noise. Add later if requested.

## 4. User stories

> As a Bhagavad Gītā learner, I want to type "karmany" and immediately see BG 2.47.

> As a Shiva devotee, I want to type "Shiva" and see all Shiva-tagged content (Shiv Chalisa, Shiva Stotram, Om Jai Shiv Omkara, Maha Mrityunjay japam) ranked sensibly.

> As a search-skeptic, I want results to be obviously relevant within the first 3 rows — otherwise I'll just go back to drilling down.

## 5. Scope

### In scope (v1.6.0)

1. **Search entry point.** A search icon in the Home header (top right) and a corresponding row in the More tab. Pressing it pushes the `SearchScreen`.
2. **Search screen UI.** Single input at top, parchment styling, instant-results below. Results grouped by type:
   - **Sections** (entire library entries)
   - **Verses** (with section + chapter context + 1-line snippet)
   - **Deities** (the 6 deity pages)
3. **Indexed fields.**
   - `nameHi`, `nameEn`, `sub` from every `LibraryEntry`.
   - Deity names from `deities.ts`.
   - Per-verse `lines.join(' ')`, `meaningHi`, `meaningEn`, and (where present) `transliteration` / `linesEn`.
   - Chapter titles (`titleHi`, `titleEn`).
4. **Query normalization.** Devanagari diacritic-fold; ASCII case-fold; IAST diacritic strip (`kṛṣṇa` → `krsna`, `bhagavad-gītā` → `bhagavad-gita`); whitespace collapse.
5. **Ranking.** Exact match in section title > exact match in verse line > prefix match in any field > substring match. Tie-break by section popularity (use `UserActivityContext.perSource` as a soft prior — boost what this user already reads).
6. **Result tap.** Routes via `entryRoutes.ts` → `navigateToProgress` with the resolved `(sourceId, verseIndex)`. Never invents a parallel route.
7. **Empty state.** If query is `""`, show 6 "Popular this week" rows pulled from `UserActivityContext` if available, else from a hand-curated list.
8. **Recent searches.** Last 6 queries cached locally (no PII). Tap to re-run.

### Out of scope

- Fuzzy / typo-tolerant search beyond normalization. Worth revisiting only if data shows users mistyping.
- Search analytics dashboard (the events land in PRD-06's pipeline; PM reads them ad-hoc in Q3).
- Search by `verseCount` / category filters in the input. The grouping in §5.2 covers the common case.

## 6. UX notes

- Input placeholder: `Search verses, sections, mantras…` / `श्लोक, पाठ, मंत्र खोजें…` (swap on language toggle).
- Result row shows: bold matched span, surrounding context, section + verse label on the right.
- When the user opens a result and comes back, the input + result list are preserved (typical iOS expectation).
- Keyboard auto-dismisses on scroll.
- Hindi keyboard is fine; Devanagari ↔ Latin input both work because of normalization.

## 7. Technical sketch

- Build a single in-memory index at module load: `mobile/src/data/searchIndex.ts`.
  - Iterates `library` + every section's verse data + `deities` + chapter manifests.
  - Output: `Array<{ id: string; type: 'section' | 'verse' | 'deity'; fields: string[]; sourceId: string; verseIndex?: number; chapterIndex?: number }>`.
- Normalize each field once at index time; store the normalized version alongside the original for ranking.
- Search is a linear scan with early exit at 50 hits — at 3 500 verses + 25 entries, this is < 50 ms even on a low-end device.
- Memoize per query (LRU 20).
- Result component reuses `LibraryCard` styling for the "Sections" group and a new lightweight `VerseResultRow` for verses.
- Telemetry: log query length, result count, tap-through index — no query text leaves the device (privacy hygiene; matches the no-account stance).

## 8. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| WAU search rate | Local event | ≥ 35% |
| Search → tap rate | Local event | ≥ 60% |
| p95 keystroke→render latency | Sentry performance | < 200 ms |
| Zero-result rate | Local event | < 15% (signals indexing gap if higher) |
| Index build time at app start | Sentry timing | < 80 ms p95 |

## 9. Risks

| Risk | Mitigation |
|---|---|
| Index inflates app cold-start | Build lazily on first search-screen open (most users won't search every cold start). |
| Bad ranking on rare queries makes search feel broken | Manual QA pass on a 50-query test list before ship. |
| Romanization style mismatch (PR-31 lessons) | Normalization strips both IAST and Hunterian. Test both `krishna` and `kṛṣṇa` resolve identically. |

## 10. Definition of done

- Search screen reachable from Home and More.
- Query "karmany" returns BG 2.47 as top result.
- Query "हनुमान" returns Hanuman Chalisa + Hanuman Ashtak + Hanuman Aarti + Sankat Mochan grouped under Sections.
- Devanagari and Latin queries return symmetric results.
- All result taps land on the correct verse (per RULEBOOK §4.12 — both listing entries reach the reader).
- Tests in `mobile/src/data/__tests__/searchIndex.test.ts`: covers normalization, ranking ties, and pop-prior.
- Sentry timing shows < 200 ms p95.

## 11. Open questions

1. Should the search input default to Devanagari keyboard or system default? Lean: system default; let the user choose.
2. Do we want "Did you mean…" suggestions on zero results? Adds complexity; defer to v1.6.1 if zero-result rate > 20%.
3. Should commentary be included in v2? Pull data once we see the zero-result query log.

# PRD-08 — Vrat & Festival Library

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.9.0 |
| **Window** | Q4 2026, weeks 44–48 (~5 dev-weeks) |
| **T-shirt size** | L |
| **Owner** | TBA |

---

**Bundle-only constraint:** all vrat-kathas, vidhi (procedure), and metadata are bundled JSON. Stories are text — they compress well (~5 KB per katha). The whole catalog at v1 fits comfortably under +500 KB. No network, no commissioned-recording playback, no cloud fetch.

**Depends on PRD-07.** This PRD reuses the panchang engine for date resolution and the festival-rule schema for catalog organization. Without PRD-07, vrat dates would be hard-coded for one year. With it, the catalog is correct for any year automatically.

**Regional baseline locked.** v1 covers the **North Indian Hindi-belt** vrat calendar. Maharashtra-specific (Ganesh-centric), Bengali (Durga Puja extended), and South Indian (Tamil/Telugu lunar variants) follow in Q5 if data justifies. See §3.

---

## 1. Problem

Vedansh today has zero content for **vrat days** — the time-anchored ritual fasts that structure a Hindu woman's calendar year. Karwa Chauth, Hartalika Teej, Vat Savitri, Mahashivratri, Sankashti Chaturthi, every Ekadashi — each comes with:

1. A **katha** (story) traditionally read aloud during or after the fast.
2. A **vidhi** (procedure) — what to eat, what to avoid, when to break the fast.
3. An associated **deity worship** that maps cleanly onto our existing chalisa/aarti catalog.

Today, a user observing Karwa Chauth has to find the katha on YouTube, a fasting how-to on a Hindi blog, and the Ganesh aarti in Vedansh — three apps, three browser tabs. The moment of high religious intent — a fast morning — sees Vedansh deliver only ~⅓ of what the user wants.

PRD-07 fixes the "is today a vrat day?" question. **PRD-08 fixes "what do I do on that day?"**

## 2. Goal

Ship a vrat library — parallel to the existing chalisa/aarti library — with ~50 vrats covering the major Hindi-belt calendar. Each entry has the katha, vidhi, and tap-through to associated chalisas/aartis. Reachable from three surfaces:

- **PRD-07 Calendar** — tap a marked vrat day → opens the vrat reader.
- **Home tab category tile** — new "व्रत · Vrats" category alongside Granth / Stotram / Chalisa / Japam / Aarti.
- **Direct browse** — by month, by deity, or alphabetical.

Measured by:

- ≥ 35% of WAU open at least one vrat-katha per month.
- On the day of any of the top-10 vrats (Karwa Chauth, Mahashivratri, Janmashtami, etc.), ≥ 50% of WAU active that day open the matching katha.
- Vrat-katha completion rate (read to end of story) ≥ 60%.
- Bundle growth ≤ +500 KB.
- Zero katha-text errors flagged in user feedback during the 30 days post-ship of any top-10 vrat.

## 3. Non-goals

- **Regional variants beyond Hindi-belt.** Maharashtra's distinct Ganesh-Utsav structure, Bengali Durga Puja's 5-day extended observance, Tamil/Telugu lunar variations (Tamil month system, Onam, Pongal) all deferred to Q5. Documented in Settings: "Vrats follow the North Indian Hindi-belt calendar."
- **Personalization.** No "your saved vrats" list, no "this vrat is for women only" filtering, no caste/gotra customization. Same content for everyone.
- **Audio narration of kathas.** Same rationale as PRD-02: bundled audio is too heavy. If we revisit network, vrat-katha audio is the second priority after chalisa recitation.
- **Fasting-time procedural notifications.** "Break your fast at moonrise — 8:42 PM tonight" is tempting but adds a whole notification scheduling layer scoped specifically to vrat events. Q5 if data shows it's needed.
- **Astrological vrat matching.** ("Based on your birth chart, observe Pradosh Vrat on Mondays.") Out of scope, always — distinct domain from devotional content.
- **User-contributed kathas.** No upload, no edit, no community submission. Editorial control stays with us.
- **Vrat udyapan ceremonies.** The concluding ritual (typically year 5, 11, or 16 of observing) is too procedural and varies too much by family tradition. Skip.

## 4. User stories

> As a woman observing Karwa Chauth, I want to open Vedansh on the morning of the fast, see "Karwa Chauth — आज" on the Today strip, tap it, and land on the full katha + vidhi without leaving the app.

> As someone curious about Hartalika Teej for the first time, I want a single-screen explanation of what the fast is, why it's observed, and the story behind it — so I can decide whether to keep it this year.

> As an Ekadashi observer, I want to know which Ekadashi this is (each of the 24 has its own name and katha — Putrada, Mokshada, Devshayani, etc.) and read the specific katha for today, not a generic one.

> As a Hanuman devotee on Tuesday Sankashti Chaturthi, I want the vrat-katha reader to also link to the Sankat Mochan Hanumanashtak — so I can recite it as part of my observance.

> As a researcher, I want to scroll past the katha and see source attribution — which purana the story is drawn from — so I can trust it.

## 5. Scope

### In scope (v1.9.0)

1. **Vrat catalog.** ~50 entries split as:
   - 30 major annual vrats (Karwa Chauth, Hartalika Teej, Vat Savitri, Mahashivratri, Janmashtami, Ram Navami, Hanuman Jayanti, Holi, Diwali / Lakshmi Puja, Govardhan Puja, Bhai Dooj, Chhath, Akshaya Tritiya, Guru Purnima, Raksha Bandhan, Ganesh Chaturthi, Navratri × 9 days as a group, Dussehra, Buddha Purnima, Tulsi Vivah, Dev Uthani Ekadashi, etc.)
   - 24 Ekadashis (one per paksha per lunar month) — each with its own name and distinct katha (Putrada, Mokshada, Devshayani, Padma, Vijaya, Aamalaki, Papmochani, Kamada, Varuthini, Mohini, Apara, Nirjala, Yogini, Devshayani, Kamika, Putrada, Aja, Parsva, Indira, Papankusha, Rama, Devuthani, Utpanna, Mokshada, Saphala, Putrada, Shattila, Jaya, Vijaya, Aamalaki, Papmochani, Kamada). De-dup names — there are 24 unique annual + 1 Adhik-Maas pair.
   - **All ekadashis ship a katha in v1; we do not ship "generic ekadashi" placeholder content.** Real differentiation is the entire point.
2. **Per-vrat data shape.**
   ```ts
   type Vrat = {
     id: string;                            // 'karwa-chauth'
     nameHi: string;                        // 'करवा चौथ'
     nameEn: string;                        // 'Karwa Chauth'
     /** Lunar date rule — same shape as PRD-07 festival rules. */
     dateRule: {
       lunarMonth: 1..12;                   // Amanta system
       paksha: 'shukla' | 'krishna';
       tithi: number;                       // 1..15
     };
     deity: Deity;                          // 'shiva' | 'krishna' | etc.
     region: 'north' | 'pan-indian';        // v1 only ships these two; others deferred
     katha: {
       sourceHi: string;                    // e.g. 'स्कंद पुराण'
       sourceEn: string;                    // 'Skanda Purana'
       paragraphsHi: string[];              // 5–15 paragraphs
       paragraphsEn: string[];
     };
     vidhi: {
       fastTypeHi: string;                  // 'निर्जला उपवास'
       fastTypeEn: string;                  // 'Nirjala Vrat (no water)'
       proceduralStepsHi: string[];         // ordered list, 5–10 steps
       proceduralStepsEn: string[];
       breakFastTriggerHi: string;          // 'चंद्रोदय के बाद' or 'सूर्यास्त के बाद'
       breakFastTriggerEn: string;          // 'After moonrise' or 'At sunset'
     };
     linkedSections: string[];              // ['hanuman-chalisa', 'sankat-mochan'] — section ids in `library`
     marker: 'star' | 'dot';                // for the Calendar from PRD-07
   };
   ```
3. **Vrat reader screen.** A new screen shape — long-form story, not paginated verse:
   - Top: vrat name + date (this year) + fast-type pill ("निर्जला · No water")
   - Section 1: **कथा / Katha** — paragraph-by-paragraph story
   - Section 2: **विधि / Vidhi** — ordered procedural list
   - Section 3: **समापन / Closing** — when and how to break the fast
   - Section 4: **पाठ / Related Reading** — linked chalisa/aarti tiles
   - Source attribution at the bottom (e.g. "Source: Skanda Purana · स्कंद पुराण")
   - Language toggle reuses existing `useGitaLanguage` hook
   - Bookmark + share buttons reuse the existing reader pattern
4. **Catalog organization surfaces.**
   - New **व्रत / Vrats** category tile on Home → `VratListScreen`
   - `VratListScreen` shows vrats in two organizing modes (toggle at top):
     - **By month** (Chaitra → Phalgun) — sectioned list with the lunar month header
     - **By deity** — reuses the existing deity-tag pattern from `library`
   - "Upcoming" section pinned at top showing the next 3 vrats by Gregorian date (resolved via PRD-07 panchang engine)
5. **PRD-07 Calendar integration.** Calendar markers from PRD-07 tap → opens the matching vrat reader. The "linked-content tap-through" promise in PRD-07 §5.5 lands here.
6. **Sadhak Profile integration.** A user who opens a vrat katha on its actual date gets a small "व्रत observed today" entry in their activity log — same surface that already tracks reads and japa rounds. Stretch goal, not blocking.
7. **Search integration.** The vrat catalog plugs into PRD-03's search index automatically — vrat names + katha first paragraphs become searchable. Per RULEBOOK §8, the per-shape branch in `searchIndex.ts` is ~15 lines.

### Out of scope

- All items in §3.
- Audio narration.
- User notes / annotations on kathas.
- "Share vrat katha as image" via PRD-05's share card — out of v1 because vrat kathas are paragraphs, not verses; the share-card layout doesn't fit. Q5 if requested.
- A separate "vrats observed this year" milestone tracker beyond the existing Sadhak Profile.

## 6. UX notes

### Vrat reader screen

```
┌────────────────────────────────────────┐
│ ‹  करवा चौथ · Karwa Chauth           ♥ ↗│
│ ─────────────────────────────────────  │
│ कार्तिक कृष्ण चतुर्थी · 18 Oct 2026     │
│ ┌──────────────────┐                   │
│ │ निर्जला · No water │                   │
│ └──────────────────┘                   │
│                                        │
│ ━━━ कथा / KATHA ━━━                   │
│                                        │
│ प्राचीन काल में देवकी नाम की एक       │
│ युवती थी जो अपने पति के दीर्घायु के    │
│ लिए... [10–15 paragraphs]              │
│                                        │
│ ━━━ विधि / VIDHI ━━━                  │
│                                        │
│ 1. प्रातः स्नान करके संकल्प लें         │
│ 2. दिनभर निर्जला उपवास रखें             │
│ 3. संध्या को सोलह श्रृंगार करें          │
│   ⋮                                    │
│                                        │
│ ━━━ समापन / CLOSING ━━━              │
│                                        │
│ चंद्रोदय (8:42 PM IST · Delhi) पर       │
│ चंद्र दर्शन के बाद उपवास तोड़ें         │
│                                        │
│ ━━━ पाठ / RELATED ━━━                │
│                                        │
│ [Shiv Chalisa]  [Ganesh Aarti]         │
│                                        │
│ ─ ॥ ─                                  │
│ Source: स्कंद पुराण · Skanda Purana    │
└────────────────────────────────────────┘
```

- Parchment-soft background per the existing reader pattern.
- Section headers (कथा, विधि, समापन, पाठ) use the same `sectionLabel` typography role as Home's "CATEGORIES" label.
- Katha paragraphs use `typography.meaning` — same as chalisa meaning paragraphs.
- Vidhi steps use a numbered list with `typography.meaning` body.
- Related chalisa/aarti tiles use the existing `LibraryCard` component.
- Source attribution at the bottom in italic Cormorant, muted ink — visible but not prominent.

### Vrat list screen

```
┌────────────────────────────────────────┐
│ ‹  व्रत · Vrats                          │
│ ─────────────────────────────────────  │
│ [ By Month ] [ By Deity ]              │
│                                        │
│ ━━━ UPCOMING ━━━                       │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ करवा चौथ              18 Oct 2026  │ │
│ │ Karwa Chauth · 5 days              │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ अहोई अष्टमी           23 Oct 2026  │ │
│ │ Ahoi Ashtami · 10 days             │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ━━━ कार्तिक · KARTIK ━━━              │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ करवा चौथ                            │ │
│ │ कृष्ण चतुर्थी                       │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ अहोई अष्टमी                          │ │
│ │ कृष्ण अष्टमी                        │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ रमा एकादशी                           │ │
│ │ कृष्ण एकादशी                         │ │
│ └────────────────────────────────────┘ │
│   ⋮                                    │
└────────────────────────────────────────┘
```

- Sticky header for each lunar month section in "By Month" mode.
- "By Deity" mode groups by `deity` field — Shiva vrats together, Krishna vrats together, etc.
- Upcoming section always at top; computed from PRD-07's panchang engine for the next 90 days.

### Home tile addition

The Home grid grows by one tile:

```
[ ग्रन्थ ]  [ स्तोत्रम् ]
[ चालीसा ]  [ जप ]
[ आरती  ]  [ देवता ]
[ व्रत  ]              ← new
```

`categories.ts` gets a `vrat` entry. `texts.ts` adds a new `ContentCategory` value. RULEBOOK §1 already allows this shape — no rulebook change required.

## 7. Technical sketch

### Data layer

```
mobile/src/data/vrats/
├── index.ts                  # Loader + invariant checks
├── vrats.json                # All 50+ entries inline
└── __tests__/
    └── vrats.test.ts          # Per-vrat shape + lunar-date validation
```

Single JSON keeps things simple. At ~5 KB per katha × 50 entries = ~250 KB JSON. Pre-gzip in the binary. Loaded once at app boot, cached in module memory.

### Reader screen

New `mobile/src/screens/VratReaderScreen.tsx`. Long-form scroll, no horizontal pagination. Reuses:

- `BackgroundLayer` (same parchment-overlay treatment as verse readers)
- `LanguageToggle` (Hi/En switching)
- `BookmarkButton` (book-level bookmark — bookmarks the vrat itself, not a verse inside it)
- `ShareButton` (PRD-05 share card — needs a layout variant; out of scope for v1, can ship without)
- `useGitaLanguage` hook
- Existing typography tokens

### Catalog screen

New `mobile/src/screens/VratListScreen.tsx`. Uses sectioned `FlatList` for "By Month" mode, regular `FlatList` for "By Deity" mode. "Upcoming" computed via PRD-07's `festivalEngine.resolveDates(year)` adapted for vrats — actually, since vrat dates use the same rule shape as festival rules, we extend the existing engine rather than write a parallel one. ~30 lines of code.

### Routing

`mobile/src/navigation/entryRoutes.ts` gets a new `vratIds` set + a routing branch:

```ts
if (vratIds.has(sourceId)) {
  nav.navigate('VratReader', { vratId: sourceId });
  return true;
}
```

Both `navigateToEntryStart` and the search-result tap-through automatically route correctly. PRD-07's calendar tap-through uses this path too.

### Library entry

Each vrat also gets a `LibraryEntry` in `texts.ts` with `category: 'vrat'`. This makes vrats appear in:
- The new vrat category tile on Home (PRD-07 derivation)
- The deity-page lists (via existing `deities` field)
- The search index (via the standard `LibraryEntry` indexing path in PRD-03)
- The wishlist (via existing bookmark routing)

No new ContentCategory enum value beyond `'vrat'`.

### Search integration

Per PRD-03 RULEBOOK §8, vrats use a novel content shape (paragraphs, not verses). A new branch in `searchIndex.ts:buildVerseEntries()`:

```ts
if (entry.category === 'vrat') {
  pushVratKatha(verses, entry);
  continue;
}
```

The pushVratKatha function indexes the first 3 paragraphs of the katha (enough for substring matching without bloating the index). Estimated +60 KB to the index.

### Tests

- `mobile/src/data/vrats/__tests__/vrats.test.ts` — every vrat has a non-empty katha (≥3 paragraphs Hi+En), non-empty vidhi (≥3 steps), valid lunar date rule, valid deity.
- `mobile/src/data/__tests__/searchIndex.test.ts` extended — every vrat produces a verse-index entry per RULEBOOK §8's coverage assertion.
- `mobile/src/screens/__tests__/VratReaderScreen.test.tsx` — RULEBOOK §4.10 smoke test for the new reader shape.

### Bundle budget

- Vrat JSON (50 entries × ~5 KB avg): ~250 KB
- New screens + components: ~25 KB
- Search index growth: ~60 KB
- Calendar engine extension: ~5 KB

Total: ~340 KB. Under the 500 KB ceiling.

## 8. Content & editorial track (runs in parallel)

This is the dominant cost of PRD-08. Engineering is ~2 weeks; **content is ~3 weeks of editorial work** running parallel.

### Sourcing strategy

| Source | Used for | Why |
|---|---|---|
| **Skanda Purana** | Karwa Chauth, Mahashivratri, Akshaya Tritiya, several Ekadashis | Primary source for most vrat-kathas; well-attested |
| **Bhavishya Purana** | Karwa Chauth (alternate), Hartalika Teej (alternate) | Some vrats have multiple primary sources; pick one and cite |
| **Padma Purana** | All 24 Ekadashis | Padma Purana is the canonical source for Ekadashi mahatmya |
| **Garuda Purana** | Vat Savitri, Tulsi Vivah | Standard scholarly attribution |
| **Modern devotional digests** (verified) | Filling gaps where Puranic sources are obscure | Cross-check with Gita Press / authoritative publishers |

**Each katha must cite its source.** Visible in the reader. Editorial sign-off requires a Sanskrit-literate reviewer; non-negotiable.

### Translation

Hindi kathas are typically available in Devanagari already. English translations require either:
- Commissioned translator with religious-text experience (~1 week per 10 kathas)
- Vetted modern English retellings from Gita Press / similar (faster, but each needs licensing check)

Recommend commissioned for v1 — quality + licensing clean.

### Native-speaker review

Every Hindi katha gets a native-speaker sanity check for grammatical/idiomatic issues. Every English translation gets a religious-literacy check (a katha that reads as a "story" loses the devotional register).

### Editorial DoD

- Source citation visible at the bottom of every katha reader.
- No translation gaps — every Hi paragraph has an En counterpart.
- Sensitive content (e.g. stories with gender-asymmetric framings — Karwa Chauth's pati-vrata theme) reviewed for present-day phrasing without erasing the traditional structure. Editorial judgment, not censorship.

## 9. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| WAU open ≥ 1 vrat-katha/month | Local diagnostics ledger | ≥ 35% |
| Top-10 vrat day open-rate | Local counter triggered by vrat tap on its own date | ≥ 50% of active WAU on that day |
| Katha completion rate (read-to-end) | Scroll-depth event | ≥ 60% |
| Vrat list → vrat reader conversion | Local counter | ≥ 40% of list opens |
| Calendar → vrat reader (PRD-07 integration) | Local counter | ≥ 30% of festival/vrat marker taps |
| Bundle delta | CI bundle-size check | ≤ +500 KB |
| Content errors (user reports / quarter) | Help-modal email feedback | ≤ 3 |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Content editorial cost balloons past 3 weeks | Lock the v1 scope at 30 major + 24 Ekadashis up front. Don't add "while we're at it." Regional variants explicitly Q5. |
| Translation quality varies by translator | Single translator owns the full pass. Style sheet documented. Native-speaker review on every katha. |
| Sourcing dispute (e.g. multiple Puranas tell the same story differently) | Pick the most-cited version. Cite the source. Editorial decisions documented in a content style guide. |
| Sensitive content (gender framings in some kathas) draws complaints | Frame the katha as **the tradition's story**, not as an instruction. Editorial language adjusts subtle phrasing without rewriting; if a katha is genuinely uncomfortable, ship the more inclusive variant where one exists. Document the calls. |
| User in Maharashtra opens "Karwa Chauth" and expects Maharashtrian variant | Settings disclosure: "Vrats follow the North Indian Hindi-belt calendar." Q5 adds regional layers. |
| PRD-07 panchang engine fails to resolve a vrat date | Vrat reader gracefully falls back to "Date not available — see your local panchang." Unit tested. |
| Adhik Maas Ekadashis (one extra month every ~3 years) double the Ekadashi count that year | Engine handles it (per PRD-07 §9). UI shows both regular and Adhik-Maas Ekadashis on the calendar for that month. |
| Bundle size pushes past 500 KB | Compress paragraphs (~60% gzip ratio for Devanagari prose). Stage rollout: 30 major vrats in v1.9.0, 24 Ekadashis in v1.9.1 if needed. |

## 11. Definition of done

- 50+ vrats shipped with full Hi + En katha + vidhi + source attribution.
- Every vrat reachable from: Home → व्रत tile, PRD-07 Calendar → tap, PRD-03 Search → query.
- Sadhak Profile registers a vrat-katha read on the vrat's actual date.
- Linked sections (chalisa/aarti tiles in the "Related Reading" section) tap-through correctly.
- All new tests pass — vrat data invariants, reader smoke test, search-index coverage.
- TypeScript clean, lint at baseline.
- Bundle size delta under 500 KB.
- Editorial sign-off recorded: Sanskrit-literate reviewer confirms katha sources are correctly attributed; native-speaker review confirms Hindi + English passes idiom check.
- App Store review note explains the vrat catalog as bundled educational content.

## 12. Open questions

1. **Naming of the Vrats category.** Hindi `व्रत` is unambiguous; English "Vrats" works for the diaspora audience but may need "Fasts" or "Observances" for non-Hindi speakers. Recommend "Vrats" — it's the term users already use, even in English contexts.
2. **Ekadashi presentation.** Each Ekadashi has its own name (Putrada, Mokshada, etc.). Should the list group all 24 under "Ekadashi" with sub-entries, or show all 24 as top-level entries? Recommend top-level (each Ekadashi is genuinely different content) but under a shared visual treatment.
3. **Wishlist behavior.** Should bookmarking a vrat work the same as bookmarking a verse? Recommend yes — the vrat is the unit, not a paragraph within it.
4. **Share card support.** Vrats don't fit PRD-05's verse-shaped share card. Defer share for v1 — vrat reader has bookmark only, no share button. Reconsider in v1.10.
5. **Daily-verse pool inclusion.** Should vrat-katha opening lines join the daily-verse rotation? Recommend no — too long, too procedural for a daily nudge. Keep daily verse focused on chalisa/granth/stotram verses.
6. **Notification on vrat day.** Should we add a "Karwa Chauth is tomorrow — read the katha tonight" notification? **Cross-PRD decision** — feels like PRD-01 festival reminders reborn. Recommend defer; if vrat metrics show high engagement, add as a v1.9.1 follow-up.

## 13. Sequencing within Q4

| Week | Engineering | Editorial |
|---|---|---|
| 44 | Data shape + JSON skeleton + loader + invariant tests | Content audit: identify all 50 vrats; assign sources; lock content style guide |
| 45 | VratReaderScreen + routing + Home tile | Write/translate first 15 major vrats |
| 46 | VratListScreen + by-month/by-deity modes + Upcoming section | Next 15 major vrats; start 24 Ekadashis |
| 47 | PRD-07 Calendar integration; Search-index branch; Sadhak Profile hook | Finish all 24 Ekadashis; native-speaker review pass |
| 48 | QA, bundle audit, App Store submission | Final editorial pass; source-citation audit |

The 5-week window is engineering-bounded — editorial overlap into week 49 is acceptable if content readiness is the bottleneck.

PRD-09 (Temple stories) begins in week 49 if PRD-08 is on track; slips to Q5 if vrat editorial extends.

---

**Bottom line:** PRD-08 makes Vedansh the answer to "what should I do on this vrat day?" — not just "is today a vrat?" (PRD-07's job). The engineering is moderate; the editorial is the real lift, and it determines the ship date. Lock content scope upfront, ship vrat-by-vrat if needed, never compromise on katha quality or source attribution.

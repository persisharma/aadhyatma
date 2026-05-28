# PRD-07 — Temple Tour (Tirth Darshan)

| | |
|---|---|
| **Status** | Proposed — rulebook + design.md extension required before scaffold |
| **Target release** | TBD |
| **T-shirt size** | L (rulebook + design.md amendments, new screen archetype, new content pipeline, sourced content per temple) |
| **Owner** | TBA |

---

## 0. Why this PRD exists

`/add-section` was invoked with a request for a "temple tour" section. The skill's only known shape is a verse-based recitation reader (`lines[] + meaningHi + meaningEn`), which is the wrong tool for a temple guide. Per `RULEBOOK.md` failure modes ("feature outside RULEBOOK.md → stop and ask"), this PRD captures what the rulebook + design.md need to grow before any scaffold runs.

**Nothing in this document has been implemented yet.** Treat it as a proposal for review.

---

## 1. Problem

Aadhyatma today is a recitation/meditation app — every section is a verse reader. Users have asked for a way to learn about India's famous temples: their presiding deity, spiritual significance, and origin story (often a Sthala Purāṇa narrative). This content is prose-shaped, not verse-shaped, and forcing it into the verse reader (fake `lines[]`, fabricated "meaning" pairs) would:

- Violate RULEBOOK §3 (*Type safety on verse pages*) — `VersePage` expects `verse.lines[]` and a 1:1 meaning.
- Violate RULEBOOK §10.3 (*No AI-generated liturgical text*) — origin stories must come from published authoritative sources.
- Confuse the reader UX (horizontal swipe-per-verse) when the natural unit is "scroll the temple's narrative top to bottom".

A "tirth darshan" / temple guide is a fundamentally new **content archetype** for the app.

## 2. Goal

Ship a new section type — *kshetra guide* — where the unit of content is a **temple**, not a verse. The user opens the section, sees a list of temples (grouped by region or by traditional grouping like Jyotirlingas / Char Dham / Shakti Peethas), taps one, and reads a vertically-scrolling parchment-styled detail screen with the temple's significance and origin story.

v1 success: one curated tour (e.g. *Dvādaśa Jyotirlinga* — the 12 Jyotirlingas) shipped end-to-end with sourced, verified content per temple, reachable from Home → Categories → a new `kshetra` tile.

## 3. Non-goals

- Maps / geo / "near me" — out of v1. Coordinates may be stored in data for future use but no map UI ships.
- Photographs of real temples — design.md §1 mandates faded hand-drawn sketches. Each temple's background art has to be commissioned/sourced in the same treatment.
- Booking, darshan timings, live aartis — out of scope.
- User-generated content / reviews — never in scope.
- Audio narration — defer to PRD-02 (Verse Audio) infrastructure when it lands.
- Comprehensive temple database — v1 ships **one curated tour** (12 Jyotirlingas), not every temple in India.

## 4. New content archetype: Kshetra Guide

### 4.1 Section-level shape (the "tour")

```ts
type KshetraGuide = {
  id: string;                    // e.g. "dvadasha-jyotirlinga"
  nameHi: string;                // "द्वादश ज्योतिर्लिङ्ग"
  nameEn: string;                // "Twelve Jyotirlingas"
  introHi: string;               // 2-4 paragraphs of context
  introEn: string;
  grouping: 'sequence' | 'region'; // ordering convention
  temples: KshetraEntry[];
  source: { baseText: string; retrievedOn: string };  // per RULEBOOK §10.2
};
```

### 4.2 Per-temple shape

```ts
type KshetraEntry = {
  id: string;                    // e.g. "somnath", "kashi-vishwanath"
  nameHi: string;                // "सोमनाथ"
  nameEn: string;                // "Somnath"
  locationHi: string;            // "वेरावल, गुजरात"
  locationEn: string;            // "Veraval, Gujarat"
  deity: Deity;                  // existing Deity union — must match invocation
  deityFormHi?: string;          // optional named form, e.g. "सोमेश्वर"
  deityFormEn?: string;
  significanceHi: string[];      // 1-3 prose paragraphs — why this kshetra
  significanceEn: string[];
  originStoryHi: string[];       // 2-5 prose paragraphs — sthala purana
  originStoryEn: string[];
  background: string;            // image key from mobile/assets/<id>/index.ts
  sources: Array<{ url: string; title: string; retrievedOn: string }>; // ≥ 2 per §10.1
};
```

**Why no `verses[]`:** the unit of consumption is the temple, not a line. Prose paragraphs are an array of strings so the renderer can space them; there is no per-line meaning pair.

**Why `deity` is required and reuses the existing union:** a kshetra guide MUST surface under the relevant deity's listing on Home (RULEBOOK §3, *Categories & Deities*). Tagging Kashi Vishwanath with `shiva` is mandatory, not optional.

### 4.3 Category

Add a new category to RULEBOOK §1 row 6:

```
category: 'granth' | 'stotram' | 'chalisa' | 'japam' | 'aarti' | 'bhajan' | 'veda' | 'kshetra'
```

The Home grid (design.md §18 step 4) currently has 6 tiles. With `kshetra` added, the grid grows to 7 tiles — design.md §18 needs an explicit note that the grid wraps to 4×2 (with one empty slot) at 7 entries, or that `kshetra` ships as a "coming soon" tile until v1 lands, **whichever the design lead picks**. This is a design.md amendment, not an autonomous scaffold call.

## 5. New screen archetype: Kshetra reader

### 5.1 Why the existing readers don't fit

- `GitaReaderScreen` / `SundarkandReaderScreen` are horizontal swipe-paginated verse readers. They render one `<Pascal>VersePage` per page. Temple narratives are continuous prose, not paginated atoms.
- `ChalisaReaderScreen` is also a verse pager.
- `JapamCounterScreen` is a counter UI.

None fit. We need a third reader shell.

### 5.2 Proposed shell: `KshetraReaderScreen`

Single vertical-scroll screen per temple:

1. Status bar.
2. Top bar — back button (returns to KshetraIndexScreen), title swaps on language toggle: `सोमनाथ` (hi) / `Somnath` (en). RULEBOOK §3 (*Top-bar title rule*) — swap, never stack.
3. Background image (faded sketch per design.md §6), parchment overlay on top.
4. Hero block: temple name (Devanagari title type), location subtitle, deity badge.
5. Ornament divider (`॥`).
6. **Significance** section — label `महिमा · Significance` (Cormorant 13 600 italic, saffron-deep — same treatment as `अर्थ · Meaning`). Body: prose paragraphs in the active language. 14 px paragraph gap.
7. Ornament divider.
8. **Origin Story** section — label `उद्भव कथा · Origin Story`. Same prose treatment.
9. Source footnote — small Cormorant italic line listing the sources from `KshetraEntry.sources`.
10. Bottom bar — language toggle (always visible, per RULEBOOK §3).

**No verse pill, no per-line meaning, no transliteration.** The romanization rules in design.md §3.1 do NOT apply because there are no verses to romanize; prose paragraphs in `significanceHi` / `significanceEn` are independent translations, not transliterations of the same source line.

### 5.3 Index screen: `KshetraIndexScreen`

Mirrors `GitaChaptersIndexScreen` in structure, but each card is a temple, not a chapter:

- Card layout: `[ thumb (Devanagari glyph of deity, e.g. "ॐ") ]  [ tag (`तीर्थ N` / `KSHETRA N`) · temple name (lang-swapped) · location ]  [ › ]`
- Tap → `KshetraReaderScreen` for that temple.

This is enough of a new shape that copying `GitaChaptersIndexScreen` and renaming is acceptable, but the per-card data shape is `KshetraEntry`, not a chapter manifest.

### 5.4 New `*VersePage` template — explicitly NOT required

This archetype does not produce a `<Pascal>VersePage.tsx`. RULEBOOK §2 row 4 currently mandates one — that rule needs amending to "row 4 applies only to verse-based archetypes". Kshetra sections add a `<Pascal>TempleDetail.tsx` component instead, consumed by `KshetraReaderScreen`.

## 6. Required RULEBOOK.md amendments

The following sections need explicit edits before `/add-section` can scaffold a kshetra guide. Each is small but each is a hard prerequisite — without them, the integration would silently violate existing invariants.

| RULEBOOK § | Amendment |
|---|---|
| §1 row 6 | Add `'kshetra'` to the category union. |
| §1 row 7 | (no change — deities still required and tagged the same way) |
| §1 rows 10–14 | Add a note: "for `category === 'kshetra'`, replace rows 10–14 with the `KshetraEntry` shape in PRD-07 §4.2 (`significanceHi/En`, `originStoryHi/En`, no `lines[]`)." |
| §2 row 4 | Restrict to "verse-based archetypes only". Add a new row for kshetra: `mobile/src/components/<Pascal>TempleDetail.tsx`. |
| §2 row 5 | Add a kshetra-specific template choice — `KshetraReaderScreen.tsx` instead of `GitaReaderScreen` / `SundarkandReaderScreen`. |
| §3 *Type safety on verse pages* | Add a parallel clause for `TempleDetail`: same no-cast rule, no `as any` on the `temple` prop. |
| §4 step 6 | Add: "For kshetra: toggle flips `significanceHi/En` and `originStoryHi/En`." |
| §8 | Add Path C: kshetra sections index by `nameHi/En + locationHi/En + significanceHi/En + originStoryHi/En` per temple. New branch in `buildVerseEntries()` — or rename it to `buildSearchEntries()` since it no longer just handles verses. |
| §10.1, §10.2, §10.3 | Already applies. Each temple's `originStoryHi/En` must cite ≥ 2 authoritative sources (Gita Press, temple trust publications, ASI, Sthala Purāṇa editions). No LLM-generated origin stories. |
| §10.4 | Already applies — `deity` field must match the temple's actual presiding deity. |
| §10.8 | Already applies — each temple needs its own background image; do not reuse another temple's. |

## 7. Required `design.md` amendments

| design.md § | Amendment |
|---|---|
| §1 | No change — parchment-first philosophy fits temples. |
| §3 | Add `Significance label` and `Origin Story label` rows to the type scale (mirror the `Meaning label` spec). |
| §3.1 | Add a sentence: "this section does not apply to kshetra prose; significance/origin paragraphs in `*En` fields are independent English prose, not transliteration." |
| §6 | Amend background rotation rule: "verse-based sections rotate deterministically across a pool; **kshetra sections pin one background per temple** — the temple's identity is the image, not interchangeable." |
| §9 / §15 | Add reference to the new §26 (Kshetra Reader) and §27 (Kshetra Index) sections below. |
| §13 | Add a third sub-block "Kshetra guide (region-grouped or sequence-grouped prose-per-entry)" with the build steps for the new archetype. |
| §18 step 4 | Note category grid wraps to 4×2 once `kshetra` lands (or ship `kshetra` as `coming` until layout is finalized — design lead decides). |
| §10 | Add a `KshetraEntry` content model block alongside `Chalisa` and `Gita`. |
| New §26 | Kshetra Reader (vertical-scroll prose, hero, significance, origin story, sources). Spec out the same way §9 specs the verse reader. |
| New §27 | Kshetra Index (temple-list screen). Spec out the same way §15 specs the chapters index. |

## 8. Content sourcing plan (v1: 12 Jyotirlingas)

Per RULEBOOK §10.1 / §10.3, the origin story prose for each of the 12 Jyotirlingas must come from published authoritative sources — not LLM generation. The shortlist:

1. **Somnath** (Veraval, Gujarat)
2. **Mallikarjuna** (Srisailam, Andhra Pradesh)
3. **Mahakaleshwar** (Ujjain, Madhya Pradesh)
4. **Omkareshwar** (Khandwa, Madhya Pradesh)
5. **Kedarnath** (Rudraprayag, Uttarakhand)
6. **Bhimashankar** (Pune, Maharashtra)
7. **Kashi Vishwanath** (Varanasi, Uttar Pradesh)
8. **Trimbakeshwar** (Nashik, Maharashtra)
9. **Vaidyanath** (Deoghar, Jharkhand)
10. **Nageshwar** (Dwarka, Gujarat)
11. **Rameshwaram** (Tamil Nadu)
12. **Grishneshwar** (Aurangabad, Maharashtra)

**Sources to verify against (each temple needs ≥ 2 of these, per RULEBOOK §10.1):**

- Shiva Purāṇa (Gita Press Gorakhpur edition) — primary source for origin stories.
- *Bharat ke Jyotirlinga* (Gita Press) — secondary source.
- Respective temple trust websites (e.g. somnath.org, shrikedarnathji.com).
- ASI listings for the heritage / architectural history.
- sanskritdocuments.org for any Sanskrit invocation snippets.

A content sourcing sprint (separate from this PRD) needs to land all 12 temples' verified prose before scaffolding flips the section to `active`. Until then it ships as `status: 'coming'`.

## 9. Phased delivery

**Phase 1 — Contract.** Land the RULEBOOK.md + design.md amendments in §6 and §7 of this PRD as a documentation-only PR. No code. Reviewed and approved by design lead before Phase 2.

**Phase 2 — Skill extension.** Extend `/add-section` to recognize `category === 'kshetra'` and scaffold from the new template set (KshetraReaderScreen, KshetraIndexScreen, TempleDetail component, KshetraEntry data shape). Skill PR ships with the three templates added to the repo as `Kshetra*` references for future kshetra guides.

**Phase 3 — Content + section #1 (Dvādaśa Jyotirlinga).** Source and verify the 12 temples' content per §8. Add `dvadasha-jyotirlinga` LibraryEntry (`status: 'coming'` initially), assets (12 sketches), data file. Flip to `status: 'active'` only after RULEBOOK §10 audit passes.

**Phase 4 — Additional tours (out of scope for v1).** Char Dham, Shakti Peethas, Divya Desam, etc. Each is its own LibraryEntry under `kshetra`, follows the same data shape.

## 10. Open questions for the design lead

1. **Tile slot.** Does `kshetra` ship as the 7th category tile (grid becomes 4×2 with one empty), or piggyback under an existing tile, or wait until a different category fills the 8th slot for a clean 2×4?
2. **Index grouping.** For Jyotirlinga tour: numeric 1-12 order, or geographic clustering (North/South/West/East)? Both have precedent in published Shiva Purana editions.
3. **Hero image rule.** One temple-specific sketch per entry (proposed), or one "Shiva motif" sketch covering all 12 Jyotirlingas (cheaper to source, less distinctive)?
4. **Pilgrimage progress.** Should the section track "darshan progress" the same way `UserActivityContext` tracks read verses (visited 7 of 12 temples)? Out of v1 unless trivial.
5. **Romanization on temple names.** `Kashi Vishwanath` vs `Kāśī Viśvanātha` — pick one per design.md §3.1's "common Sanskrit terms keep conventional spelling outside verse lines" carve-out. Recommend the popular spelling.

## 11. What NOT to do until this PRD is signed off

- Do **not** add a `library` entry for any temple tour yet.
- Do **not** scaffold `KshetraReaderScreen` or related files.
- Do **not** generate origin-story prose with an LLM — RULEBOOK §10.3 is a hard gate.
- Do **not** repurpose another deity's background image (RULEBOOK §10.8).
- Do **not** treat a temple as a single "verse" in the existing verse shape to ship faster — RULEBOOK §3 (*Type safety on verse pages*) will reject it in review.

---

**Next step:** review §6 and §7 amendments above. If approved, the follow-up PR amends `RULEBOOK.md` + `design.md` (no code). Phase 2 (skill + templates) only starts after Phase 1 ships.

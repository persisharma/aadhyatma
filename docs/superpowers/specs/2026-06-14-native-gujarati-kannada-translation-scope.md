# Native Gujarati & Kannada Translation — Scope

**Date:** 2026-06-14 · **Status:** scoping (no content authored) · **Branch:** add-gujarati-kannada-language-support

## Why this exists

The gu/kn reading languages today render by **transliteration** (Devanagari → Gujarati/Kannada
script). That is correct for the **verse/mantra text** (it is the same Sanskrit/Awadhi re-spelled,
exactly how regional editions print it) but it is **not a real translation for the prose
meanings/commentary** — those come out as Hindi wording in the regional script: acceptable-ish for
Gujarati (Hindi is widely understood), largely unintelligible for Kannada (Dravidian — Hindi
grammar words don't land). This doc scopes producing **genuine native translations of the prose
fields** so meanings read as real Gujarati / Kannada.

## In scope vs out of scope

| | Field(s) | Action |
|---|---|---|
| **Out** (already correct) | verse text (`lines`/`sanskrit`), titles (`titleHi`/`nameHi`), labels/pills (`labelHi`), panchang Sanskrit terms | Keep transliteration — it is the right rendering. **Do NOT translate.** |
| **Out** (separate track) | 183 UI-chrome strings (`pick()` calls) | Already hand-authored; need a native *review*, not translation. See `2026-06-13-gujarati-kannada-ui-strings-review.md`. |
| **In** | `meaningHi`, `commentaryHi`, plus `vidhiHi`/`subtitleHi`/`summaryHi`/`shortDescriptionHi` | Author native `…Gu` / `…Kn` translations. |

## Volume (measured 2026-06-14, Hindi-source words, per language → ×2 for gu+kn)

| Field | strings | words / language |
|---|---|---|
| `meaningHi` (verse meanings) | 1,580 | **52,887** |
| other prose (`vidhi`/`subtitle`/`summary`/`shortDescription`) | 54 | 2,757 |
| `commentaryHi` (extended notes — ~99% Gita) | 1,261 | **317,317** |
| **Total** | 2,895 | **372,961** (×2 = **745,922**) |

Per-section totals (words/language): gita 339,790 · sundarkand 12,619 · vishnu-sahasranama 4,297 ·
sanskar 3,468 · aarti 2,164 · durga-stotram 1,814 · ganesh-stotram 1,532 · shiva-strotam 1,346 ·
chalisas ~700 each · others < 600 each.

**Key fact:** commentary is **85% of the volume** and almost entirely Bhagavad Gītā's per-verse
scholarly notes. Excluding commentary, the whole rest of the app is **~56k words/language** —
an order of magnitude smaller and very tractable.

## Recommended phasing

- **Phase 1 — meanings + short prose (~56k words/lang, ~112k total).** Every section's verse
  meaning + vidhi/subtitle/summary. This is what users actually read on each verse page. Tractable,
  high-impact. Ship section-by-section.
- **Phase 2 — Gita commentary (~317k words/lang, ~634k total), optional/deferred.** The long
  extended commentary. Lower traffic (it's collapsible scholarly notes; even English commentary
  has only ~20% coverage today). Defer, or do MT-only with lighter review, or leave transliterated.

## Schema + code change (additive, incremental — no big-bang)

1. Add **optional** fields to the verse/data types: `meaningGu?`, `meaningKn?`,
   `commentaryGu?`, `commentaryKn?` (and `vidhiGu?`/`…Kn?` etc. for sanskar). Optional = existing
   JSON stays valid; sections fill in over time.
2. `mobile/src/utils/localize.ts` — `meaningByLang`/`commentaryByLang` **prefer the native field
   when present, else fall back to today's transliterated Hindi**:
   ```ts
   meaningByLang(lang, { meaningHi, meaningEn, meaningGu, meaningKn }) →
     gu: meaningGu ?? transliterate(meaningHi,'gu')
     kn: meaningKn ?? transliterate(meaningHi,'kn')
   ```
   This is the single seam already designed for this; call sites don't change.
3. No font/UI/navigation changes — purely data + the one helper.
4. Per-section rollout: a section is "natively translated" the day its `…Gu`/`…Kn` fields land;
   until then it gracefully shows the transliterated Hindi. Mixed states are fine.

## Sourcing (RULEBOOK §10-compliant)

RULEBOOK §10.3 forbids AI-*generating* the **prayer text** — but **meanings/commentary are
editorial** and may be produced editorially (clearly labelled) **as long as they're reviewed**.
Verse text is untouched (transliteration), so §10.3 is not at risk. Options, cheapest→richest:

1. **Existing authoritative regional editions** — Gita Press publishes Gujarati & Kannada Gita /
   Sundarkand / chalisa editions; prefer transcribing verified published translations (best
   fidelity, §10.1 two-source verification applies). Cite `source.baseText` per §10.2.
2. **Bhashini / ULCA MT (bhashini.gov.in, Govt. of India, free) Hindi→gu/kn + native post-edit.**
   Fast and low-cost for Phase 1; every string gets a native-speaker review pass before `active`.
3. **Professional translators** for the spiritual register where MT is weak.

A hybrid is realistic: published editions where they exist (Gita, Sundarkand, popular chalisas),
Bhashini+review for the rest.

## Effort / cost estimate (ranges, Indian-market rates; validate with vendors)

- Phase 1 (~112k words both langs): professional ≈ ₹2–3.5L (~$2.5–4k); Bhashini MT + native
  post-edit ≈ ₹0.6–1.2L (~$0.7–1.5k) since MT is free and only review is paid.
- Phase 2 commentary (~634k words): professional ≈ ₹12–22L; MT + light review ≈ ₹3–6L. Recommend
  deferring or MT-only.
- Plus a fixed ~1–2 day eng task for the schema + helper change + an ingestion script/test.

## Verification & QA

- §10.10 verse-count/parity, §10.12 transliteration gate (unaffected — verse text unchanged).
- New: a coverage test (how many sections have native `…Gu`/`…Kn`); a "no Devanagari residue in
  native gu/kn fields" lint; native-reviewer sign-off recorded in `source` before flipping a
  section to use native fields.
- Extend `contentCorrectness.test.ts` to assert native fields (when present) are non-empty and
  in-script.

## Risks

- **Spiritual-register MT quality** — raw MT mistranslates devotional nuance; native review is
  mandatory, not optional.
- **Volume creep from commentary** — keep Phase 2 explicitly separate so Phase 1 ships.
- **Bundle size** — adding gu+kn meaning/commentary roughly triples those fields' bytes; verse
  text isn't duplicated (still transliterated), so the bundle grows by ~the prose size, not 3× the
  whole corpus. Measure before/after; consider lazy-loading commentary if needed.

## Recommendation

Do **Phase 1 only** first (meanings + short prose, ~56k words/lang) via published editions +
Bhashini-with-review, shipped section-by-section behind the existing `meaningByLang` seam. Leave
commentary transliterated (Phase 2 deferred). This makes the meanings genuinely native for the
content users actually read, at a fraction of the full cost, with zero risk to the (already
correct) verse text.

# Native Gujarati & Kannada — content manifest (what to bring)

**Date:** 2026-06-23 · You supply verified native translations; I structure, verse-align, and wire them in via the `meaningGu`/`meaningKn` seam (per-section, graceful fallback to transliteration, each with a `source` citation).

## Scope (as decided)

- **Verse / mantra text** — already native (Devanagari re-scripted to gu/kn). **Not needed.**
- **Verse meaning (अर्थ)** — ✅ **this is the core ask.** Native Gujarati + Kannada for each verse meaning.
- **Commentary** — excluded for now.

## The core: verse meanings — **1,661 strings per language** (×2 = ~3,322; ≈53k words/lang)

| Section | meanings | | Section | meanings |
|---|--:|---|---|--:|
| Bhagavad Gītā | 703 | | Shiva Stotram | 25 |
| Sundarkand | 356 | | Bajrang Baan | 23 |
| Vishnu Sahasranama | 81 | | Ramcharitmanas | 21 |
| Aarti (7 aartis) | 72 | | Krishna Stotram | 14 |
| Sanskar (8 items) | 48 | | Ram Stuti | 11 |
| Hanuman Chalisa | 45 | | Hanuman Ashtak | 11 |
| Shiv Chalisa | 45 | | Saraswati Stotram | 9 |
| Ganesh Chalisa | 45 | | Japam mantras | 6 |
| Durga Chalisa | 43 | | **— smaller stotrams above —** | |
| Durga Stotram | 35 | | | |
| Ganesh Stotram | 30 | | **TOTAL** | **~1,661** |

**Bhagavad Gītā (703) is ~45% of the count and the largest by words** (~21k of ~53k). Everything *except* the Gita is ~960 strings — small and high-traffic; good to do first.

## Suggested priority (small + high-traffic first; Gita last)

1. **Phase 1 — the 4 chalisas + 7 aartis + Hanuman Ashtak / Bajrang Baan / Ram Stuti** (~290 strings). Daily-use, short, highest visibility.
2. **Phase 2 — the stotrams + Vishnu Sahasranama + Sanskar + Japam** (~258).
3. **Phase 3 — Sundarkand + Ramcharitmanas** (~377).
4. **Phase 4 — Bhagavad Gītā** (703) — biggest; do once the pipeline is proven.

## Optional add-ons (you decide — not "commentary")

| Bucket | strings | note |
|---|--:|---|
| Vrat catalog short descriptions (`shortDescription`) | 12 | one-line each |
| Theerth temple `significance` + `originStory` | 49 + 49 | pilgrimage prose |
| Sanskar/section `subtitle` / `summary` / `vidhi` | 26 / 23 / 20 | short prose |
| **Vrat & Festival kathas** (82 stories) | 440 section titles + 358 paragraph-blocks (~63k words) | full stories; large — treat as its own phase if wanted |

## Delivery format (so ingestion is mechanical)

For each section, **one sheet/CSV/JSON keyed by the verse id the app already uses**, e.g.:

```csv
id,hi,gu,kn,source
2.47,"<existing Hindi meaning — I prefill this as reference>","<Gujarati meaning>","<Kannada meaning>","<edition + page/citation>"
```

- `id` = Gita → `chapter.verse` (`1.1`…`18.78`); other sections → the verse index within that section (I prefill these — don't renumber).
- `hi` = the current Hindi meaning, **prefilled by me** so your translator works from it and alignment is guaranteed.
- `gu`, `kn` = the native translations you bring.
- `source` = where it came from (edition, page) — stored for provenance.

**Easiest workflow:** I generate these sheets **already filled with `id` + `hi`** (one per section). Your translator fills only `gu` + `kn`. You send them back; I validate every `id` matches, then write `meaningGu`/`meaningKn` + `source` into the data. Any row left blank simply keeps today's transliteration — so partial deliveries are fine and ship per-section.

## What I do on receipt
1. Validate every `id` resolves to a real verse (report any mismatch/missing).
2. Write `meaningGu`/`meaningKn` (+ `meaningSource`) into the section data.
3. `meaningByLang` prefers the native field, else transliterates — no UI/verse changes.
4. Run typecheck + tests; the section is "native" the moment its rows land.

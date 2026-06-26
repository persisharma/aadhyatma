# Native gu/kn verse-meaning scale-out — progress tracker

**Goal (2026-06-25):** apply the Hanuman Chalisa model — Claude+Codex fusion → per-verse score →
verify vs authoritative published Gujarati/Kannada sources → correct material divergences — to
**every section's verse `meaning`** (gu + kn). Verse text is already native (runtime transliteration);
**Gita commentary is excluded**; scope is the `meaning` field only.

**Per-section pipeline:** Codex-primary draft + self-review → score → fetch 2–3 published
gu/kn per-verse meaning sources → compare → correct only material divergences (keep live) → write
`meaningGu`/`meaningKn` into the section JSON only when the source gate passes. Provenance in
`mobile/.translations/<section>.fusion.json`; per-section confidence appended here. The artifact
shape remains compatible with a later Claude/native-scholar review pass.

**Copyright:** sources used for comparison only — no source text copied into app data.

## Status

| Section | meanings | plumbing | fusion+score | source-verified | committed |
|---|--:|:--:|:--:|:--:|:--:|
| Hanuman Chalisa | 43 | ✅ | ✅ | ✅ 40 ok / 3 corrected | ⏳ |
| Shiv Chalisa | 43 | ✅ | ✅ gu 0.94 / kn 0.92 | ✅ 43/43, 0 corr | ⏳ |
| Ganesh Chalisa | 43 | ✅ | ✅ gu 0.94 / kn 0.92 | ✅ 43/43, 0 corr | ⏳ |
| Durga Chalisa | 41 | ✅ | ✅ gu 0.95 / kn 0.93 | ✅ 41/41, 0 corr | ⏳ |
| Aartis (7) | 70 | ✅ | ✅ gu 0.93 / kn 0.91 | ✅ 70/70, 0 corr | ⏳ |

**Phase 0 plumbing: ✅ complete for ALL sections (2026-06-25)** — optional `meaningGu?`/`meaningKn?` on every verse type; native-override threaded through all 6 shared verse-page components; `tsc` 0 errors, full suite green. Every section now renders native meaning the moment its JSON gets the fields.
**Integrity guard: ✅ added 2026-06-26** — `mobile/src/data/__tests__/contentCorrectness.test.ts` now pins completed native sections to non-empty `meaningGu`/`meaningKn` rows plus matching `.fusion.json` provenance with at least 2 Gujarati and 2 Kannada verification sources. Incomplete sections are deliberately excluded so they continue to use transliteration fallback.

**Batch 1 source-gate sweep (2026-06-26): 🚫 no new native fields shipped yet.** Bajrang Baan, Hanuman Ashtak, Ram Stuti, and the small stotram family have scattered Gujarati/Kannada hits, but the sweep did not establish two credible native per-verse meaning sources in both languages for a whole section. Lyrics-only/script-rendered pages and videos were not counted as enough. Examples: Bajrang Baan has Vaidika Vignanam gu/kn script pages (`https://vignanam.org/gujarati/hanuman-bajrang-baan.html`, `https://vignanam.org/kannada/hanuman-bajrang-baan.html`) and Stotra Nidhi Kannada script (`https://stotranidhi.com/kn/bajrang-baan-in-kannada/`), but these are verse text, not native meaning. Hanuman Ashtak has one strong Gujarati meaning lead (`https://www.sanatanjagruti.org/bhakti/sankat-mochan-hanuman-astak`) and Kannada script leads (`https://vignanam.org/kannada/sankata-mochana-hanuman-ashtakam.html`), but not two native meaning sources per language. Ram Stuti has Gujarati meaning leads (`https://www.sanatanjagruti.org/bhakti/ram-chandra-kripalu`, `https://ramstuti.in/ram-stuti-in-gujarati/`) but weak Kannada meaning coverage. Shiva Tandav has the strongest lead set (`https://gu.wikisource.org/wiki/શિવતાંડવ_સ્તોત્ર`, `https://www.sivohm.com/2018/11/shiv-tandav-stotra-in-gujarati-with.html`, `https://archive.org/details/shiva-tandava-stuti-with-meaning`, `https://isha.sadhguru.org/mahashivratri/kn/shiva/shiv-tandav-stotram-lyrics/`), but still needs a section-specific verification pass before any JSON fields are written.
| Shiva Stotram | 23 | | | | |
| Ganesh Stotram | 28 | | | | |
| Durga Stotram | 33 | | | | |
| Krishna Stotram | 12 | | | | |
| Saraswati Stotram | 7 | | | | |
| Vishnu Sahasranama | 79 | | | | |
| Bajrang Baan | 20 | | | | |
| Hanuman Ashtak | 9 | | | | |
| Ram Stuti | 9 | | | | |
| Sanskar (8) | 44 | | | | |
| Sundarkand | 354 | | | | |
| Ramcharitmanas | 19 | | | | |
| Gita (18 ch — meaning only) | 701 | | | | |
| Japam | ~6 | | | | |

Execution order: Phase 0 plumbing → chalisas → aartis → stotram family → sanskar → Sundarkand/Ramcharitmanas → Gita → Japam.

# Ishvar Vaani aarti and mantra title audit

Audited 2026-10-13 against the offline Ishvar Vaani 1.0.8 SQLite snapshot at `/Users/prashant/Documents/Codex/competitor-audit-2026-10-12/ishvarvaani.sqlite` and this checkout's mobile content registry. These are database inventory findings, not simulator-observed screens. Competitor text and audio are not acquisition sources. All 18 aarti and 36 mantra `audio_url` values in that snapshot are empty, which does not establish rights to any app or store recording.

## Decision rules

- Match by **composition and opening line**, not title alone. A text already available in a reading, stotra or audio section is marked covered or partial; it is not added again merely to match a competitor category.
- Add to the reader only after a complete, internally consistent edition is checked against two independent publications, with original Hindi and English meanings and source metadata. A title candidate is not a text approval.
- Do not bundle or reuse competitor audio. A new silent reading/japa needs no audio license; any future recording needs documented ownership or a license allowing in-app distribution.
- The repo's [earlier aarti source manifest](../../content-parity/chalisa-aarti-existing-deities.md) identifies candidates, not publish-ready content.

## Aarti titles (18)

| Ishvar title | Vedansh decision | Basis / next action |
| --- | --- | --- |
| Jay Ganesh Deva | Covered | `jai-ganesh-deva` |
| Aarti Kije Hanuman Lala Ki | Covered | `hanuman-aarti` |
| Jai Ambe Gauri | Covered | `jai-ambe-gauri` |
| Ambe Tu Hai Jagdambe Kali | Gap | Distinct Kali composition. Collate full edition and meanings; do not relabel Jai Ambe Gauri. |
| Om Jai Lakshmi Mata | Covered | `om-jai-lakshmi-mata` |
| Aarti Kunjbihari Ki | Covered | `aarti-kunj-bihari` |
| Om Jai Shiv Omkara | Covered | `om-jai-shiv-omkara` |
| Om Jai Jagdish Hare | Covered | `om-jai-jagdish` |
| Jai Jai Shri Shanidev | Gap | Shani aarti has independent source candidates in the earlier manifest; full line collation remains. |
| Om Jai Yaksha Kuber Hare | Hold | Kubera text edition/attribution and rights need to be established. |
| Jai Santoshi Mata | Gap, hold for variant choice | [Drik Panchang](https://www.drikpanchang.com/lyrics/aarti/santoshi-mata/santoshi-mata-aarti.html?lang=hi) and [Sri Mandir](https://www.srimandir.com/hi/articles/aarti/sri-santoshi-mata-aarti) differ in multiple full lines. Select one complete edition before meaning work. |
| Om Jai Gange Mata | **Added locally** | `om-jai-gange-mata`: [Drik Panchang](https://www.drikpanchang.com/lyrics/aarti/ganga-mata/ganga-mata-aarti.html?lang=hi) refrain plus four stanzas, checked against [Aaj Tak](https://www.aajtak.in/religion/aarti/shri-ganga-aarti-2450477). The latter has `श्री जय` instead of `मैया जय`, a different stanza-3 first line, `एक ही बार जो तेरी / शरणागति आता`, and `दास वही` in the closing stanza. Kept one Drik edition intact. Original per-stanza meanings. No audio. |
| Jai Saraswati Mata | Covered | `saraswati-aarti` |
| Jai Ahoi Mata | Gap | Need complete independent edition pair, meaning and deity/catalog decision. |
| Jai Vaishno Mata | Gap | Earlier manifest has a Vaishno aarti candidate; verify its opening against this exact title before adding. |
| Om Jai Ekadashi Mata | Gap | Need complete independent edition pair and deity/catalog decision. |
| Jai Jai Tulsi Mata | Gap | Earlier manifest has a Tulsi aarti candidate; verify the exact refrain and stanza set. |
| Shri Shakambhari Amba Ji Ki Aarti | Gap | Need complete independent edition pair, attribution and deity/catalog decision. |

Current result: 8 covered, 1 added locally, 9 unresolved titles (some held for edition/rights rather than assumed publishable). Vedansh also has Gayatri and Khatu Shyam aartis absent from this competitor list.

## Mantra titles (36)

The competitor groups japa, shlokas, stotras, kavach and even a non-text mnemonic under “mantras.” “Covered” below can mean another Vedansh section; it does not promise a japa-counter button.

| # | Ishvar title | Decision / evidence |
| --- | --- | --- |
| 1 | Mahamrityunjaya Mantra | Covered as Shiva reading (Rigveda 7.59.12) and audio track. Corrected the reading's unrelated Shiva Tandava source links and unsupported benefit/story preface. Japa-counter access is a UX opportunity, not missing content. |
| 2 | Ganesha Mool Mantra | Covered within Ganapati Atharvashirsha (`ganesh-stotram`) and a separately titled audio track; japa-counter access is partial. |
| 3 | Durga Kavacham | Covered as `durga-kavach`; not a short japa item. |
| 4 | Krishnaya Vasudevaya Mantra | Audio track exists. Text-reading coverage needs an exact-line check; do not duplicate yet. |
| 5 | Ya Devi Sarvabhuteshu | Covered as `durga-stotram` chapter 1; not a short japa item. |
| 6 | Shiv Aahvaan Mantra | Needs source and full text/meaning review; do not assume japa suitability. |
| 7 | Hare Krishna Mahamantra | Covered in japa. |
| 8 | Omkaraya Namaha Mantra | Source review needed; competitor payload is a verse, not just a name mantra. |
| 9 | Ganesha Atharvashirsha | Covered in `ganesh-stotram`; not a short japa item. |
| 10 | Madhurashtakam | Covered in `madhurashtakam`; not a short japa item. |
| 11 | Kala Bhairava Ashtakam | Reading gap outside japa scope; needs deity and full-source review. |
| 12 | Ganesha Pancharatnam | Reading gap outside japa scope; needs full-source review. |
| 13 | Shiva Tandava Stotram | Covered in Shiva readings; not a short japa item. |
| 14 | Ramashtakam | Reading candidate outside japa scope; verify exact composition. |
| 15 | Budha Mantra | Short japa gap; needs two-source check and original meanings. |
| 16 | Saraswati Mantra | **Added locally** as `saraswati-moola-mantra`; exact `ॐ ऐं सरस्वत्यै नमः` in [Drik Panchang](https://www.drikpanchang.com/vedic-mantra/goddesses/saraswati/mantra/saraswati-moola-mantra.html?lang=en) and [Sri Matham Puja Sangraha, p. 76](https://www.srimatham.com/uploads/5/5/4/9/5549439/puja_sangraha.pdf). Original Hindi/English gloss; silent counter; no new audio. |
| 17 | Saraswati Vidyarambha Mantra | Covered as `vidyarambha-prarthana`; not a new japa text. |
| 18 | Maha Saraswati Mantra | Short japa candidate; verify distinct text and two sources. |
| 19 | Gayatri Mantra | Covered in japa. |
| 20 | Saraswati Vidya Dana Mantra | Hold until exact Sanskrit and attribution verified. |
| 21 | Krishnaya Namah Mantra | Short japa candidate; source/meaning check needed. |
| 22 | Ganapati Bappa Morya Mantra | Multi-line chant differs from Ganesh Mool; provenance/rights review needed. |
| 23 | Hanumati Jaya Mantra | Hold for exact text and provenance. |
| 24 | Kubera Ashta Lakshmi Mantra | Hold for exact text and provenance. |
| 25 | Sri Lakshminarayana Mantra | Hold: payload begins an unrelated guru/lineage verse; title alone is not sufficient identity. |
| 26 | Ganapati Vighnavinasha Mantra | Short japa candidate; source/meaning check needed. |
| 27 | Shani Mantra | Competitor payload is the `नीलांजनसमाभासं` pranama verse already in `navagraha-stotram`; do not add duplicate text. |
| 28 | Guru Mantra | Short verse candidate; inspect exact edition and existing generic guru content. |
| 29 | Navagraha Bija Sankshipta Mantra | Exclude pending credible source: payload is only `असमबगशशरकन`, not an intelligible mantra. |
| 30 | Shri Ramaduta Hanuman Mantra | Covered as `मनोजवं मारुततुल्यवेगं` within `rama-raksha-stotra`; not missing text. |
| 31 | Rudraya Namah Mantra | Short japa candidate; source/meaning check needed. |
| 32 | Aditya (Surya) Mantra | Covered as `जपाकुसुमसङ्काशं` in `navagraha-stotram`; no duplicate. |
| 33 | Parameshwari Devi Mantra | Hold for exact text and provenance. |
| 34 | Panchamukhi Hanuman Kavacham | Long kavach candidate, outside japa scope; full text/source review needed. |
| 35 | Shiva Bhakti Stotra | Stotra candidate, outside japa scope; provenance/attribution review needed. |
| 36 | Om Gajakarṇakāya Namaḥ | Short japa candidate; two-source and meaning review needed. |

## Release gate and next batch

The two additions are local code and source records, not a store/OTA release. Before release, editorial review should confirm each selected aarti edition and both meaning languages in context; native reader review at Standard and Large text sizes should check line wrapping and counter use. A new audio recording requires a rights record and repetition calibration before attaching it to automated bead counting. The next likely aarti candidates are Shani and Tulsi; the next short-japa candidates are Budha and Krishna Naam, only after the same source checks.

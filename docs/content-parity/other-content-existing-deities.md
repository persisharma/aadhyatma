# Other devotional content parity — existing deities only

Research snapshot: **2026-07-31**

## Direct answer

The broader opportunity is much larger than Chalisa and Aarti. The
[VastuCart Stotra catalog](https://stotra.vastucart.in/stotra) currently
advertises 930 records. **826 records use a deity label that can initially map
to one of Aadhyatma's 21 existing deity ids.**

After separating the 58 Aarti/Chalisa records already covered by
[`chalisa-aarti-existing-deities.md`](./chalisa-aarti-existing-deities.md),
the raw benchmark contains **768 other-form records**.

This is not a claim that Aadhyatma is missing 768 valid prayers:

- 51 are high-confidence matches to content now in the app.
- 3 are partial matches: the app has a narrower selection or excerpt.
- 9 have a title-level match but need edition or composition comparison.
- 705 are unreviewed catalog candidates.

Therefore **717 is an upper bound, not a verified content-gap count**.
Aliases, duplicate compositions, excerpts, questionable provenance, and
incorrect competitor deity labels must still be removed.

The complete title-level snapshot is in
[`vastucart-existing-deities-catalog.csv`](./vastucart-existing-deities-catalog.csv).
It contains only catalog metadata and competitor URLs. It does not copy the
competitor's prayer text, transliteration, meanings, or editorial prose.

## Raw benchmark by form

The form is inferred from the title and slug, so `other` and borderline rows
need human classification.

| Form | Records |
|---|---:|
| Stotram / stava / related hymn | 253 |
| Ashtakam | 70 |
| Other or unresolved form | 69 |
| Kavacham | 52 |
| Mantra / Gayatri / bija | 44 |
| Stuti / vandana | 40 |
| Namavali and shorter name hymns | 38 |
| Sahasranama | 35 |
| Gita / philosophical selections | 32 |
| Vrat or festival katha | 29 |
| Suktam / Rudram / Chamakam | 28 |
| Hridayam | 24 |
| Pancharatnam | 20 |
| Dhyanam | 14 |
| Upanishad selections | 9 |
| Puja / vidhi / archana | 8 |
| Dandakam | 3 |
| **Total excluding Aarti and Chalisa** | **768** |

## Raw benchmark by existing deity id

These are competitor metadata counts before semantic cleanup.

| Aadhyatma deity id | Competitor label | All forms | Chalisa/Aarti handled separately | Other-form benchmark |
|---|---|---:|---:|---:|
| `vishnu` | `vishnu` | 143 | 10 | 133 |
| `shiva` | `shiva` | 111 | 2 | 109 |
| `krishna` | `krishna` | 91 | 8 | 83 |
| `durga` | `durga` | 84 | 8 | 76 |
| `navagraha` | `navagraha` | 38 | 0 | 38 |
| `parvati` | `parvati` | 37 | 3 | 34 |
| `lakshmi` | `lakshmi` | 36 | 2 | 34 |
| `hanuman` | `hanuman` | 33 | 3 | 30 |
| `surya` | `surya` | 31 | 1 | 30 |
| `ganesha` | `ganesha` | 31 | 2 | 29 |
| `rama` | `rama` | 31 | 2 | 29 |
| `dattatreya` | `dattatreya` | 24 | 2 | 22 |
| `kali` | `kali` | 23 | 2 | 21 |
| `narasimha` | `narasimha` | 21 | 2 | 19 |
| `saraswati` | `saraswati` | 20 | 2 | 18 |
| `kartikeya` | `kartikeya` | 18 | 1 | 17 |
| `shani` | `shani` | 15 | 2 | 13 |
| `kubera` | `kubera` | 11 | 1 | 10 |
| `ganga` | `ganga` | 10 | 2 | 8 |
| `gayatri` → `savitr` | `gayatri` | 9 | 2 | 7 |
| `radha` | `radha` | 9 | 1 | 8 |
| **Total** |  | **826** | **58** | **768** |

`Om Jai Jagdish Hare` is counted as an Aarti even though its title and slug do
not contain the word “Aarti”.

## Balanced first acquisition wave

This wave deliberately chooses one high-value candidate for every existing
deity id. It adds no deity or deity hub. The order is a content-research order,
not a claim of devotional importance.

| Existing deity id | Candidate | Competitor slug | Why first |
|---|---|---|---|
| `rama` | Rama Ashtakam | `rama-ashtakam` | Short classical form; existing Ashtakam reader can be reused. |
| `krishna` | Damodarashtakam | `damodarashtakam` | Widely recited, stable eight-verse identity. |
| `vishnu` | Complete Vishnu Sahasranama | `vishnu-sahasranama` | Closes the app's explicit excerpt-only gap. |
| `shiva` | Rudrashtakam | `rudrashtakam` | **Integrated 2026-07-31** — complete 8-verse hymn plus phalashruti, collated independently from Ramcharitmanas sources. |
| `hanuman` | Hanuman Bahuk | `hanuman-bahuk` | Major Tulsidas work not represented by current Hanuman texts. |
| `durga` | Argala Stotram | `argala-stotram` | Canonical Durga Saptashati companion text. |
| `ganesha` | Ganesha Pancharatnam | `ganesha-pancharatnam` | Classical short hymn with a clear textual identity. |
| `savitr` | Gayatri Kavacham | `gayatri-kavacham` | Extends the current Gayatri mantra/chalisa/aarti set without a new deity. |
| `saraswati` | Saraswati Kavacham | `saraswati-kavacham` | Fills the protective-prayer form for an existing deity. |
| `lakshmi` | Shri Suktam | `shri-suktam` | Foundational Lakshmi hymn; requires careful recension review. |
| `surya` | Aditya Hridayam | `aditya-hridayam` | Major Ramayana hymn and a clear corpus gap. |
| `radha` | Radha Kripa Kataksha Stotram | `radha-kripa-kataksha-stotram` | Better-defined identity than adding another generic Radha Stuti. |
| `kartikeya` | Subrahmanya Bhujangam | `subrahmanya-bhujangam` | Classical, source-rich Kartikeya hymn. |
| `kubera` | Kubera Kavacham | `kubera-kavacham` | Adds a distinct form rather than another generic Kubera Stotram. |
| `ganga` | Ganga Stotram | `ganga-stotram` | Direct Ganga hymn; do not substitute the mislabelled Narmada entries. |
| `parvati` | Annapurna Stotram | `annapurna-stotram` | Established Parvati/Annapurna form with a clear opening identity. |
| `narasimha` | Lakshmi Narasimha Karavalamba Stotram | `lakshmi-narasimha-karavalamba-stotram` | Canonical hymn distinct from the existing Narasimha Ashtakam. |
| `dattatreya` | Dattatreya Stotram | `dattatreya-stotram` | More stable starting point than the recent Chalisa candidate. |
| `shani` | Shani Dasharatha Stotram | `shani-dashrath-stotram` | Traditional attributed form; compare with the site's second Dasharatha variant. |
| `kali` | Kali Kavacham | `kali-kavacham` | Clear form gap; keep separate from Mahakali and Mahavidya variants. |
| `navagraha` | Navagraha Kavacham | `navagraha-kavacham` | Covers the current umbrella deity without creating nine new deity records. |

Before transcription, every row above still needs two independent text sources,
an opening-line identity anchor, edition notes, and a copyright/provenance
decision. Rudrashtakam has passed this gate and is no longer pending.

## Completed acquisitions

### Rudrashtakam — Shiva / Ashtakam

- Added under the existing `shiva` deity and `ashtakam` category; no taxonomy
  expansion.
- Complete 8-verse hymn plus the concluding phalashruti (9 reader pages).
- Devanagari was collated against the Gita Press Ramcharitmanas reading,
  Sanskrit Documents, and DrikPanchang. The competitor supplied only the
  taxonomy lead.
- Added line-matched IAST and original editorial Hindi/English meanings.
- Registered in category, deity detail, search, progress/resume, bookmarks,
  sharing, routine, purpose discovery, new-content highlighting, and the Shiva
  background mapping.
- Passed data/search/route checks, shared-reader tests, transliteration residue
  checks, typecheck, and full first-to-last reader flows on iOS and Android.

## Next acquisition waves

### Wave 2 — canonical companion texts

- Shiva: Shiva Mahimna Stotram, Shiva Panchakshara Stotram, Bilvashtakam,
  Dakshinamurthy Stotram, Ardhanareeshwara Stotram.
- Vishnu/Krishna: Narayana Kavacham, Mukunda Mala, Dashavatara Stotram,
  Govindashtakam, Gopala Sahasranama.
- Hanuman/Rama: Anjaneya Dandakam, Hanuman Kavacham, Hanumat Pancharatnam,
  Rama Pancharatnam, Nama Ramayanam.
- Devi: Siddha Kunjika Stotram, Devi Aparadha Kshamapana Stotram,
  Kanakadhara Stotram, Lalita Sahasranama.
- Other existing deities: Dattatreya Vajra Kavacham, Skanda Sashti Kavacham,
  Shani Vajrapanjara Kavacham, Ganga Sahasranama, Radha Sahasranama.

### Wave 3 — name collections

Ashtottara Shatanamavali and Sahasranama texts should be added only after the
shorter hymn pipeline is stable. They are large, version-sensitive, and need a
reader/counting model that does not pretend a site's “verse” count equals the
number of names.

### Separate product track — katha and ritual content

The raw benchmark includes 29 kathas and 8 puja/vidhi/archana records. These
belong in the existing Panchang/Katha or Sanskar experience, not in a Stotram
reader. They need festival/date linkage, prose-source review, and a separate
product decision before transcription.

### Separate product track — mantra catalogs

The competitor also exposes a dedicated 55-item mantra hub: 9 planetary,
12 rashi, 27 nakshatra, and 7 weekday records. Only the planetary collection can
cleanly map to Aadhyatma's existing `navagraha`, `surya`, and `shani` taxonomy.
Rashi and nakshatra mantras are astrology content, not deity-content parity, and
should not be silently imported into the devotional library.

## Semantic exclusions and corrections

Competitor deity metadata is not authoritative. At minimum:

- Exclude Vishwakarma Aarti and Chalisa even though the competitor associates
  them with Vishnu; Vishwakarma is not an existing Aadhyatma deity.
- Exclude Narmada Ashtakam and Narmada Stotram even though they are labelled
  `ganga`; Narmada is a distinct devotional identity.
- Hold Ashwini Kumara Stotram even though it is labelled `surya`; it invokes
  distinct Vedic deities.
- Hold Ashta Dikpalaka Stotram even though it is labelled `vishnu`; it invokes
  multiple directional deities outside the current taxonomy.
- Treat Mahavidya, Navadurga, Annapurna, Santoshi, Sheetala, and temple-form
  entries as forms or traditions under an existing umbrella only after an
  editorial mapping decision. Do not create new deity ids as a side effect.
- Do not equate a shared English title with identical content. `Devi Suktam`,
  `Datta/Dattatreya Ashtakam`, `Ganga Ashtakam`, `Radha Ashtakam`, and generic
  Stuti/Stotram titles require opening-line and edition comparison.

## Acquisition gate

For every candidate promoted out of the raw CSV:

1. Confirm that the invoked deity or tradition genuinely maps to an existing
   Aadhyatma deity id.
2. Locate two independent, reputable base-text sources. The competitor remains
   taxonomy-only.
3. Record title aliases, opening line, attributed author/scripture, language,
   recension, and substantive variants.
4. Transcribe one complete edition and collate every line against the second.
5. Add pronunciation-checked romanization and original Hindi/English meanings.
6. Reuse the closest existing reader registry; add a new content-form primitive
   only when the structure genuinely differs.
7. Run duplicate, line-count, transliteration, source-metadata, reader, search,
   progress, and Maestro checks before setting the item active.

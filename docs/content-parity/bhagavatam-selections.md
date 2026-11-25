# Śrīmad Bhāgavatam selections

Home → Granth → Śrīmad Bhāgavatam opens six selected readings in the existing Bhagavad Gita chapter index and verse reader. The listing states the selection scope. Sanskrit verses include independent romanization, Hindi and English meanings and original Vedansh context notes. The shared reader uses Vedansh’s established Gujarati and Kannada script treatment and its existing Granth artwork, size controls and playback.

| Reading | Included verses | Text and context comparison |
| --- | --- | --- |
| Yaśodā and Dāmodara | 10.9.15, 18, 19 | [Sanskrit, Canto 10](https://sanskritdocuments.org/doc_purana/bhagpur-10a.html) · [Chapter](https://vedabase.io/en/library/sb/10/9/) |
| Shelter at Govardhan | 10.25.19, 20, 28 | [Sanskrit, Canto 10](https://sanskritdocuments.org/doc_purana/bhagpur-10a.html) · [Chapter](https://vedabase.io/en/library/sb/10/25/) |
| Sudāmā’s Gift | 10.81.3, 5, 9 | [Sanskrit, Canto 10](https://sanskritdocuments.org/doc_purana/bhagpur-10b.html) · [Chapter](https://vedabase.io/en/library/sb/10/81/) |
| Nārada’s Guidance to Dhruva | 4.8.54–56 | [Sanskrit, Canto 4](https://sanskritdocuments.org/doc_purana/bhagpur-04.html) · [Chapter](https://vedabase.io/en/library/sb/4/8/) |
| Prahlāda and Narasiṁha | 7.8.15, 17, 29 | [Sanskrit, Canto 7](https://sanskritdocuments.org/doc_purana/bhagpur-07.html) · [Chapter](https://vedabase.io/en/library/sb/7/8/) |
| Gajendra’s Prayer | 8.3.2, 4, 32 | [Sanskrit, Canto 8](https://sanskritdocuments.org/doc_purana/bhagpur-08.html) · [Chapter](https://vedabase.io/en/library/sb/8/3/) |

References follow the listed chapter numbering. Match Sanskrit incipits when comparing 7.8 to the differently numbered GRETIL witness. The mantra preceding 4.8.54 appears with the verse it introduces. [GRETIL witness](https://gretil.sub.uni-goettingen.de/gretil/corpustei/transformations/html/sa_bhAgavatapurANa.htm) · [Classical print edition catalogue](https://vedicpi.org/bhagavata-pura%E1%B9%87a/)

The app stores positions by stable reading and page index. Append new readings and pages so bookmarks, routines and progress continue to resolve. Search, share and the Gita-style jump sheet display the source canto, chapter and verse. Each reading loads its own payload on demand.

Native iOS and Android checks remain pending. The Granth Maestro flow covers entry and jumping to a selected verse. Device acceptance needs all scripts and sizes, compact layout, navigation and progress, artwork, sharing, read-aloud and offline reading.

## PR #712 main integration — 21 November 2026

Merged main `6f97ae4c3d5916552421eade72f628bd49ee7503` into the existing draft branch. The only textual conflict was adjacent imports in `backgrounds.ts`; both Bhāgavatam and Bhajan artwork resolvers are retained. The six readings, 18 verses and original source/page IDs are unchanged. Home's featured Gita tile retains main's chapter-list route. Added regressions for search `10.81.5` → reading 3, index 1, and the Sudāmā picker allowing 3/5/9 while rejecting 4.

Executed: TypeScript; 42 focused Jest assertions; 31 focused data/navigation assertions; all three reader shards; widgets, engine, data and Ask gates. Granth YAML parsing and agent-instruction verification pass. The suite exposed existing feature acceptance gaps: Bhāgavatam JSON lacks the root provenance structure required by `contentCorrectness`, `texts.ts` imports the Bhāgavatam corpus entry point rather than generated counts, and Daily Bhakti lacks a Bhāgavatam devotional-share artwork mapping. Main also has an app-tour version mismatch (1.5.6 versus app version 1.5.8). These are reported failures, not waived checks; no canonical text, release version or test gate was changed during conflict resolution.

Native iOS/Android Maestro, all four languages at Standard/Large, compact/enlarged-system-text layouts, lifecycle/offline persistence, actual playback/share exports and Android responsiveness/ANR evidence remain pending. No native runtime is available in this checkout. Keep the PR draft. No merge, readiness change, deployment or release is authorized by this conflict task.

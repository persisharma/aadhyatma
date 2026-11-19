# G3 / G4 decisions

## G3: Sai Baba content — research decision, no new deity in this PR

The existing data model calls devotional subjects `Deity`; Sai Baba is a saint/guru tradition and should not silently be assigned that classification. No demand analytics, user requests specific to Sai content, or approved art corpus were supplied. Consequently this PR does not add a new deity or a token single-item hub. This is a product decision under the requested research scope, not a claim that Sai devotion is outside Vedansh forever.

Primary sources identified: Shree Saibaba Sansthan Trust's [Sai Satcharita catalog](https://sai.org.in/en/sai-satcharita) and [publication list](https://sai.org.in/en/publication-list). Search-indexed official pages identify Marathi Satcharita and multiple language publications, including aarti books. Full-page reread returned HTTP 403 on 2026-11-17. Their availability does not grant reuse of modern translations, musical recordings or artwork; no such content was copied.

Reconsider when demand evidence and an editorial owner support a coherent saint/guru collection. A future implementation needs verified original-text provenance for each composition, original meanings or an applicable translation licence, accurate saint/guru metadata, commissioned/reusable icon and reader art, catalog/search/route support and four-language reader QA. Aarti, Satcharita chapters and Chalisa cannot be treated as one interchangeable source. No outreach or licensing promise has been made.

## G4: Marathi — feasible, not a fifth-script switch

Marathi shares Devanagari, but Hindi meanings remain Hindi. `contentByLang` currently uses explicit native values when present and otherwise re-scripts Hindi for Gujarati/Kannada; copying that fallback to Marathi would mislabel untranslated prose. Keep canonical Sanskrit verses separate from Marathi explanatory text.

The reproducible inventory in `marathi-audit.json` counts code files containing both current additional-language tags and JSON meaning-field occurrences. These are breadth indicators, not unique translation segments, word counts, person-days or a cost estimate. Generated copies and repeated field names can overcount. A quote requires deduplicated source strings, translator review rates and an agreed first corpus.

Implementation sequence:
1. Inventory and deduplicate UI, metadata, reader meanings, katha/vidhi prose, empty states, accessibility labels, sharing, notifications, calendar terminology and widget strings. Assign stable string keys and completeness tracking; freeze a reviewed terminology glossary.
2. Introduce `mr` in the language type, persistence/migration, language toggle, typography and content helpers. Require native Marathi for exposed UI and meanings; use an explicit unavailable state or clearly labelled Hindi fallback instead of pretending translation exists.
3. Translate a bounded, named corpus with a Marathi editor, including inflection and devotional terms. Reuse canonical Sanskrit only where appropriate. A Marathi aarti is a distinct composition, not an automatic translation of its Hindi counterpart.
4. Verify Standard/Large/system text, search normalization, share-card layout, TTS voice availability and unsupported-voice fallback, offline boot, saved language, widgets and both platforms. Check title wrapping and Devanagari conjuncts; shared script does not guarantee identical layout.

Decision: do not enable `mr` or promise whole-library support in this content PR. The research deliverable is complete; implementation is a separately sized localization project. No release/version change is made here.

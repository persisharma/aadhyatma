# G1 — complete Vishnu Sahasranama main hymn

Reviewed 2026-11-17. The old main chapter stopped at verse30 and labelled its contents as names1–287; that old name-count was itself inconsistent with traditional compound segmentation. It now contains the complete canonical thousand-name sequence, verses1–107, and the traditional protection stanza numbered108 in some recitation editions. This is **not** a claim that every possible invocation, nyasa or closing supplement has been included.

## Publications actually consulted

- SanskritDocuments, [complete Sanskrit recitation text](https://sanskritdocuments.org/doc_vishhnu/vsahasranew.html): read main verses1–107, protection108, invocation, seven dhyana stanzas and closing sections. Primary ancient-text witness for additions.
- Drik Panchang, [complete Sanskrit 1000-name hymn](https://www.drikpanchang.com/deities-namavali/gods/lord-vishnu/stotram/vishnu-sahasranama-stotram.html): collated all107 main stanzas, including the exact final Sarvapraharanayudha endpoint. This edition ends at107 without Vanamali.
- Divine Life Society / Swami Krishnananda, [stanzas37–72](https://www.swami-krishnananda.org/vishnu/vishnu_2.html), [stanzas73–108](https://www.swami-krishnananda.org/vishnu/vishnu_3.html), [dhyana](https://www.swami-krishnananda.org/vishnu/vishnu_dhyanam.html), [invocation](https://www.swami-krishnananda.org/vishnu/vishnu_invo.html), [phalashruti](https://www.swami-krishnananda.org/vishnu/vishnu_phala.html): third Sanskrit witness for disputed spelling, final name count and protection108; complete dhyana read, and closing sequence reviewed. Its contemporary English explanations/transliterations are **not** the app text. New app explanations were composed independently, in grouped verse-level prose.
- [Gita Press scan candidate](https://archive.org/details/Wxxw_shri-vishnu-sahasranam-with-shankaracharya-bhashya-gita-press-gorakhpur): catalogue and OCR inspected, but poor OCR was not promoted to a verified verse witness. No claim of page-by-page scan verification. Uploader CC0 does not license modern Hindi translation/commentary; none was reused.

The ancient Sanskrit is public-domain devotional material. No site layout, modern English/Hindi translation, commentary or downloaded formatted edition is packaged. SanskritDocuments' notice about redistribution of its formatted files is not treated as permission to copy those files. The app data is a separate transcription with new meanings and independently generated/checkable romanization.

## Edition and collation decisions

- Main1–30: existing Sanskrit, IDs and array positions are unchanged. Final audit found and corrected romanization defects in4/5/6/14, a meaning error in11, and misleading numerical name-prefixes throughout1–30 (details below). No existing repeat count was repurposed.
- Main31–107: added in canonical order, with per-verse Hindi and English explanations covering the named qualities/forms. Compound-name segmentation differs by commentary; the app does not invent a new running1000-name segmentation. The full107-verse Sanskrit sequence is the completeness boundary.
- Main108: Vanamali protection prayer, independently attested in SanskritDocuments and Divine Life Society. Its meaning and introduction explicitly state that it is outside the1000-name count. Optional unnumbered repeated refrains `सर्वप्रहरणायुध ॐ नम इति` and `श्रीवासुदेवोऽभिरक्षतु ॐ नम इति` are not separate units.
- v43: retain `विरजो`, shared by the main Sanskrit witnesses; do not substitute the parenthetical `विरतो` variant.
- v54: retain `विनयो जयः`, not `विनियोज्यः`. SanskritDocuments identifies the latter as a commentary-specific alternative; the chosen reading is shared with Drik and the Divine Life Society Sanskrit.
- v57/v81/v85: ordinary Unicode `शृङ्ग` without SanskritDocuments' embedded zero-width joiner; no lexical change.
- v61: `दिवस्पृक्`, shared Sanskrit reading, rather than the parenthetical `दिविस्पृक्`.
- v62: **do not reproduce Drik's truncated `भिक्` / `पायणम्`**. `भिषक्` and `परायणम्` are supported by both SanskritDocuments and Divine Life Society. Meanings correspond to physician and final refuge.
- v66: `विजितात्माऽविधेयात्मा` is retained as in the Sanskrit witnesses. The Divine Life Society page's romanization/commentary also presents `vidheyatma`; that is not silently substituted for the selected Sanskrit `avidheyatma`.
- v88: the witnesses' sandhied `न्यग्रोधोऽदुम्बरोऽश्वत्थः` is retained; prose identifies the fig trees without attempting a novel textual emendation.
- v108 and new dhyana use no chant-repeat suffix, retaining the complete metrical stanzas.
- New dhyana8 is the source's seventh dhyana stanza, `छायायां पारिजातस्य...रुक्मिणीसत्यभामाभ्यां...`. App numbering differs because existing unit3 is the Vasudeva salutation. No old item moved. SanskritDocuments' grammatically consistent `अम्बुदश्यामम्` is selected over the Divine Life Society page's typographical `अम्बुदश्यामाम्` (its romanization agrees with the selected form).

## Other chapters and honest scope

- Chapter1 retains its22 existing units. Its heading now says **selected invocation**, and the page0 no longer asserts that omission invalidates a recitation. It contains SanskritDocuments invocation1–21 plus the optional `नमः समस्तभूतानाम्` stanza. The witness's final invocation22 `विष्णुं जिष्णुं...` and ritual nyasa/sankalpa are not included; this is a declared selection, not a full ritual manual.
- Chapter2 now has the full seven dhyana stanzas of the consulted recension plus the existing Vasudeva salutation; page0+8 units=9. The missing final Krishna/Rukmini/Satyabhama meditation is restored. Existing1–7 stay untouched. Page0 removes unsupported promises and the earlier misleading assertion that the milk-ocean is an abode “before Vaikuntha.”
- Chapter4 preserves the existing16 units and saved positions, but is explicitly titled **Selected Phalashruti and Closing Prayers**. Its sequence is witness phala1–8,10–11,23–28. It does **not** contain witness9 (`दुर्गाण्यतितरत्याशु`),12–22 (`इमं स्तवमधीयानः` through `विश्वेश्वरमजं देवं`),29–33 (Sanjaya/Gita and dedication prayers), or optional later appendices. It does not claim continuous complete closing recitation. Page0 explains this distinction and removes the now-obsolete names1–287 claim.
- These ancillary selections do not omit any of the main thousand names. Completing every alternative ritual appendix is outside the chosen edition boundary and is not represented as done.

## Compatibility and validation

Files changed only in this corpus and this report. Chapters1/2/3/4 have counts23/9/109/17, including page0, total158. Main31–108 are appended with IDs `vs-3-31`…`vs-3-108`; dhyana adds `vs-2-8`. Every pre-existing ID stays at the same chapter-relative index. No migration is needed for chapter/verse bookmarks; consumers storing an undocumented *global flattened offset* must migrate against the preserved IDs before relying on changed chapter lengths. Lazy loader design in index.ts remains unchanged.

New romanization is derived from the actual selected Sanskrit using repository reader conventions: ch/chh/śh/kṣh/ṛi, long vowels, retroflexes, anusvara/visarga, explicit avagraha. Sanskrit schwas are preserved. No audio or Vedic svara claim. Text source comparison, JSON structure, contiguous indices, unique IDs, Sanskrit/romanization row parity and residue checks performed. Native rendering, navigation, bookmark persistence and integrated search tests belong to the parent integration pass; this report does not claim they ran.

## Final audit corrections to retained verses

The Sanskrit of existing main1–30 was compared against both complete main witnesses; no Sanskrit change was needed. The existing meaning lists had assigned separate running numbers to compounds treated as one name in traditional1000-name enumerations (e.g. Nidhir-avyaya, Sthavira-dhruva, Mangalam-param). All numerical name-prefixes in Hindi and English1–30 are removed, retaining the definitions without claiming a new segmentation. The main hymn remains complete107 verses; its completeness is not inferred from the old erroneous287 label. Third-witness Sanskrit/segmentation comparison: https://www.swami-krishnananda.org/vishnu/vishnu_1.html .

- v4 romanization missing vowel: `bhūtādirndhir` → `bhūtādirnidhir`, following निधि.
- v5 andv14: Cyrillic `о` replaced with Latin `o`; no pronunciation change.
- v6: `manustvāṣhṭā` → `manustvaṣhṭā`, following त्वष्टा (short a).
- v11 Sarvayogavinihsrita: removed the misleading “manifested through all yogas” / “सभी योगों से प्रकट”; uses freedom from attachments/bonds, reflecting विनिःसृत rather than emergence through yoga.

These are authorised source-verified corrections; the earlier checkpoint of byte-identical existing non-intro values no longer applies to those fields. IDs, Sanskrit and array positions remain unchanged. Native checks remain pending parent integration.

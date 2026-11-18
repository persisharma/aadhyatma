# C2 / C3 / C5 source and editorial decisions

Verified 17 November 2026. These are data additions only; registry, search, reader,
visual and native verification are owned by the integrating session. No audio,
new deity identity, artwork, modern translation or publisher page layout is copied.

## C2 Shri Suktam — 16 units

- Read the complete 15-rik core and its concluding `यः शुचिः` verse at
  [Drik Panchang](https://www.drikpanchang.com/lyrics/stotram/maha-lakshmi/shree-suktam-with-lakshmi-suktam.html?lang=hi)
  and [Green Message](https://greenmesg.org/stotras/lakshmi/sri_suktam.php).
- Declared edition: **15 rks plus one recitation/fruit conclusion**, not an implied
  complete edition of all the later Lakshmi hymns appended on those pages.
- The closing verse itself calls the hymn fifteen-rik. Both sources agree on
  units 1–16 apart from spacing and the recitational `ईश्वरींग्` in Green Message
  versus `ईश्वरीं` in Drik at 9. Preserve Drik's plain orthography.
- No Vedic accents are encoded. This is an unaccented reading edition, not a
  teaching source for svara. The unnumbered Harih Om frame is not counted.
- New Hindi/English editorial explanations preserve the ancient household
  vocabulary without endorsing guarantees of wealth or medical benefit.

## C3 Kanakadhara Stotram — 22 units

- The [Kanakadhara Mahalakshmi Temple index](https://www.kanakadhara.org/kanakadharastotram/)
  links its [Devanagari image](https://www.kanakadhara.org/wp-content/uploads/2020/06/KanakadharaStotram-Devnagari.jpg).
  Downloaded that image solely for local source review and visually read all
  three columns, units 1–22. The image itself is not included in app assets.
- This is the plan's requested **21 hymn verses plus phalashruti**. Its order
  differs from common web texts: Aamilita 3, Baahvantare 4, Kaalaambuda 5,
  Praaptam 6, Vishvaamare 7, Ishta 8, Dadyaat 9. Preserve that order throughout.
- Compared all units with [Sanskrit Documents](https://sanskritdocuments.org/doc_devii/kanaka.html),
  [Drik Panchang](https://www.drikpanchang.com/lyrics/stotram/maha-lakshmi/kanakadhara-stotram.html?lang=en)
  and [Green Message](https://greenmesg.org/stotras/lakshmi/kanakadhara_stotram.php).
  Sanskrit Documents prints an 18-unit core and appended extras; Green Message
  has 18; Drik includes the three additional namo'stu verses but omits Devi
  Praseeda, counting 21 **including** phalashruti. The temple preserves Devi
  Praseeda as 21 and phalashruti as 22. No unverified extra is invented to meet
  an assumed genre count.
- One explicitly recorded majority correction: the temple image repeats
  `श्रुत्यै` in unit 11 line 3. `शक्त्यै` is supported by all three comparison
  publications and fits the parallel Shruti/Rati/Shakti/Pushti invocations.
  That correction is disclosed in source.notes rather than hidden.
- Temple readings retained: `खलु यत्प्रभावान्` (6), `सुन्दरीति` (10),
  `जन्मभूत्यै` (12), `मान्ये` (16), `धवलतमांशुक` (18), `अमूभिर्` (22).
  Spacing, display-row splits, dandas and discretionary line-break hyphens are
  normalized; no verse-order or modern commentary is imported from elsewhere.
- Sanskrit Documents' notice restricts reuse of its formatted electronic
  files. It was consulted as a comparison witness; no file, formatting,
  translation, typesetting or modern apparatus was copied into the app.
  The underlying ancient hymn is separately transcribed from the temple
  witness, with original prose meanings and reader romanization.

## C5 Kalabhairav Ashtakam — 9 units

- Read all eight stanzas and phalashruti at
  [Sanskrit Documents](https://sanskritdocuments.org/doc_shiva/kaalabhairava.html)
  and [Green Message](https://greenmesg.org/stotras/shiva/kalabhairava_ashtakam.php).
- Selected the traditional Shankara recension, with `स्थितं` in 4,
  `शेषपाश` in 5, `मोक्षदं` in 6 and `नरा ध्रुवम्` in the phalashruti.
  Green Message differs in verse 6 (`मोक्षणं`); that is recorded, not silently
  combined. Orthographic anusvara/explicit nasal variations are preserved in
  the selected text.
- [Drik Panchang](https://www.drikpanchang.com/lyrics/ashtakam/gods/lord-bhairava/kala-bhairava-ashtakam.html?lang=en)
  now identifies its text as Shivarahasya: the order and several whole lines
  differ. It confirms a distinct traditional recension, not a replacement
  line bank for the Shankara text.
- Kalabhairava is explicitly the addressed deity; the catalogue association
  uses existing `shiva` for this form, without introducing a Bhairav id or
  borrowing an unrelated deity asset. The user-facing title remains clear.
- Sanskrit Documents references Complete Works volume 18 page 89; that print
  scan was not inspected, so it is not listed as a consulted authority.

## Verification boundaries

All 47 display units have source text, one-to-one romanization rows and original
Hindi/English editorial meanings. Sanskrit romanization was checked against the
Devanagari with the repository's IAST/Hunterian conventions (ch, chh, śh, kṣh,
ṛi), no encoder residue, no Devanagari/dandas in linesEn. Schema and line counts
were checked locally. These checks are not native/device, layout, runtime,
pronunciation-teacher or independent scholarly acceptance. The integrating PR
must report its own routing, registry, test and visual evidence.

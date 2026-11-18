# Durga Saptashati chapters 8–13 — source and editorial record

Reviewed 18 November 2026 for PR #702. This worker adds only the six chapter payloads and this report; the parent owns chapters 2–7, collections, routing, tests, counts and native verification.

## Complete numbered boundaries

| Chapter | Subject | Numbered units | Speaker units | Half-verses | Full metrical units |
|---|---|---:|---:|---:|---:|
|8|Raktabija's defeat|63|1|1|61|
|9|Nishumbha's defeat|41|2|0|39|
|10|Shumbha's defeat|32|4|1|27|
|11|Narayani hymn and promised manifestations|55|4|1|50|
|12|Traditional fruits of recitation and the goddess's continuing power|41|2|2|37|
|13|Boons to Suratha and the merchant|29|6|11|12|
|Total|Six complete numbered chapters|261|19|16|226|

Counts are traditional numbered units, not a claim of 261 full metrical shlokas. Speaker announcements remain separate; sentences continuing over successive numbered units are not merged. Chapter 13 concludes the Savarni Manu narrative opened in chapter 1. IDs are `durga-saptashati-chapter-N-M`, where N is chapter and M is the traditional unit number. No existing IDs were reassigned.

Unnumbered dhyana, opening/closing Om or bija framing, ritual preliminaries and prose colophons are outside these numbered payloads. This is a chapter-text delivery, not a complete ritual-procedure manual. Audio is excluded.

## Actual witnesses read and compared

Primary numbered Sanskrit:

- [Drik chapter 8](https://www.drikpanchang.com/lyrics/durga-saptashati/chapters/eighth-chapter/durga-saptashati-eighth-chapter.html)
- [Drik chapter 9](https://www.drikpanchang.com/lyrics/durga-saptashati/chapters/ninth-chapter/durga-saptashati-ninth-chapter.html)
- [Drik chapter 10](https://www.drikpanchang.com/lyrics/durga-saptashati/chapters/tenth-chapter/durga-saptashati-tenth-chapter.html)
- [Drik chapter 11](https://www.drikpanchang.com/lyrics/durga-saptashati/chapters/eleventh-chapter/durga-saptashati-eleventh-chapter.html)
- [Drik chapter 12](https://www.drikpanchang.com/lyrics/durga-saptashati/chapters/twelfth-chapter/durga-saptashati-twelfth-chapter.html)
- [Drik chapter 13](https://www.drikpanchang.com/lyrics/durga-saptashati/chapters/thirteenth-chapter/durga-saptashati-thirteenth-chapter.html)

Second complete publication: [Baba Rampuri's Sanskrit Durga Saptashati](https://rampuri.com/durga-saptashati-text/), chapters 8–13, including their numbered speaker units. Different publishers are verified; independent manuscript lineages are not asserted.

Direct Python requests to Drik returned HTTP 403. The web tool returned complete numbered Sanskrit for all six chapters; these results were saved temporarily and parsed by unit number. Rampuri's complete HTML was fetched by the parent and its chapter extractions were available in the shared workspace. All 261 Drik units were compared programmatically to Rampuri after removing whitespace, dandas and invisible joiners, then all differing units were inspected. The Sanskrit of every unit was read while writing its original meanings. This is actual complete-unit comparison, not merely matching the opening, ending or count.

Only the underlying ancient Sanskrit is included. No modern meanings, Roman transcription, page design, copyrighted commentary or recordings were copied. Website copyright notices are not construed as grants to reuse modern materials, nor as evidence that the ancient composition was newly authored. Hindi/English meanings are original editorial explanations.

## Edition decisions

Drik is the declared base. With two witnesses disagreeing, there is no majority; we retain the declared edition and document alternatives, rather than synthesising an undeclared recension. Two orthographic corrections use Rampuri: **11.27 `पापेभ्यो नः`** instead of Drik `पापेभ्योऽनः`; **13.8 `संशितव्रतम्`** instead of Drik `शंसितव्रतम्`. Romanization and meanings follow those corrected readings.

All non-whitespace differences observed are recorded below. D = Drik, R = Rampuri. Unless explicitly marked corrected, D is retained.

| Unit | D reading | R reading / decision |
|---|---|---|
|8.9|तन्नादमम्बिका|तान्नादानम्बिका|
|8.15|ब्रह्माणी साभिधीयते|ब्रह्माणीत्यभिधीयते|
|8.22|प्रीत्याऽऽह|प्रीत्याह; avagraha presentation|
|8.31|लीलयाऽऽध्मात|लीलयाध्मात; avagraha presentation|
|8.41|तत्प्रमाणस्तदासुरः|तत्प्रमाणो महासुरः|
|8.60|असिभिर्ऋष्टिभिः|असिभिरृष्टिभिः|
|9.15|आविध्याथ; देव्या त्रिशूलेन|आविद्याथ; देव्यास् त्रिशूलेन|
|9.17|संक्रुद्धः|सङ्क्रुद्धः; nasal orthography|
|9.31|तानि चक्राणि|देवी चक्राणि|
|9.32|दैत्यसेनासमावृतः|दैत्यसैन्यसमावृतः|
|9.37|चखादोग्रं दंष्ट्रा…|चखादोग्रदंष्ट्रा…; different compounding|
|10.3|बलावलेपाद्दुष्टे; यातिमानिनी|बलावलेपदुष्टे; चातिमानिनी|
|10.11|तथास्त्रैश्चैव दारुणैः|तथा चास्त्रैः सुदारुणैः|
|10.16|अभ्यधावत्तदा|अभ्यधावत तां|
|10.17|Two lines, through चर्म चार्ककरामलम्|R adds third line `अश्वांश्च पातयामास रथं सारथिना सह`; excluded from the declared D edition, not silently lost|
|10.24|उत्पात्य|उत्पाट्य|
|10.25|वेगितः|वेगवान्|
|11.7|स्वर्गमुक्तिप्रदायिनी|भुक्तिमुक्तिप्रदायिनी; meaning explicitly follows heaven/liberation|
|11.10|सर्वमङ्गलमङ्गल्ये|सर्वमङ्गलमाङ्गल्ये|
|11.22|महाऽविद्ये|महामाये; meaning explicitly includes great veiling ignorance, not a repeated translation of महाविद्ये|
|11.25|सर्वभीतिभ्यः|सर्वभूतेभ्यः; meaning follows fears|
|11.27|पापेभ्योऽनः|**Corrected to R पापेभ्यो नः**|
|11.30|बहुधाऽऽत्ममूर्तिं|बहुधात्ममूर्तिं; avagraha presentation|
|11.43|वैप्रचित्तांस्तु|वैप्रचित्तांश्च|
|11.46|संस्तुता|संस्मृता; meaning follows praised|
|11.53|कृत्वाऽसङ्ख्येय|कृत्वासङ्ख्येय; avagraha presentation|
|11.55|अरिसंक्षयम्|अरिसङ्क्षयम्; nasal orthography|
|12.2|नाशयिष्यामि|शमयिष्यामि|
|12.6|शत्रुतो|शत्रुभ्यो|
|12.7|हि तत्|महत्|
|12.10|चरितम्|माहात्म्यम्|
|12.11|जानताऽजानता; प्रतीच्छिष्यामि|जानताजानता; प्रतीक्षिष्यामि; D meaning is acceptance|
|12.13|धनधान्यसुतान्वितः|धनधान्यसमन्वितः; D includes children|
|12.15|संक्षयं|सङ्क्षयं; nasal orthography|
|12.22|सकृत्सुचरिते; तथाऽऽरोग्यं|सकृदुच्चरिते; तथारोग्यं|
|12.25|प्रयच्छन्ति|प्रयच्छन्तु|
|12.33|पश्यतामेव देवानां|पश्यतां सर्वदेवानां|
|12.35|जगद्विध्वंसिनि|जगद्विध्वंसके|
|12.38|महाकाल्या महाकाले|महादेव्या महाकाली; meaning follows Mahakali at the great dissolution|
|12.40|तथाऽलक्ष्मीः|तथालक्ष्मीः; avagraha presentation|
|12.41|धूपगन्धादिभिः|गन्धधूपादिभिः|
|13.8|शंसितव्रतम्|**Corrected to R संशितव्रतम्**, firm vows|
|13.9|नदीपुलिनसंस्थितः|नदीपुलिनमास्थितः|
|13.11|यताहारौ|यतात्मानौ; D meaning retains restrained food intake|
|13.23|सावर्णिको नाम मनुः|सावर्णिको मनुर्नाम; word order|

Drik's editorial mid-word hyphens in 11.4, 11.31 and 11.34 were removed by joining the adjacent wrapped lines; no letters were inserted or deleted. Thus these units have three display lines instead of four, while retaining the complete verse. Footnote asterisks, verse-number suffixes and optional outer Om markers were removed. Dandas mark textual line endings; Roman lines contain no dandas or verse numbers. Double avagrahas appearing in the selected text are retained, not silently collapsed into a different reading.

## Meaning and pronunciation review

Every unit has its own original Hindi and English explanation. Short speaker announcements and narrative half-verses remain appropriately short. Continuing sentences are signalled where necessary rather than assigning later events to an earlier verse. Chapter 8 explains each named divine power and the blood-born multiplication; chapter 9 distinguishes the two brothers' falls and Nishumbha's final defeat; chapter 10 retains the goddess's withdrawal of her manifestations into herself; chapter 11 preserves individual invocations and the future manifestations; chapter 12 reports traditional promised fruits as devotional statements, not clinical or physical-safety guarantees; chapter 13 distinguishes Suratha's worldly boon from the merchant's request for freedom from I/mine attachment.

13.12 records the narrative blood offering without presenting it as an instruction for present-day self-injury. No modern spiritual or medical guarantee is added. The requested full ancient text is not censored or replaced by generic prose.

Sanskrit Roman fields use the existing IAST plus Hunterian convention (`ch`, `chh`, `śh`, `kṣh`, `ṛi`), retaining long vowels, anusvara, visarga, retroflex consonants and avagraha. Conversion was checked against the Sanskrit letter sequence, including `मातॄः` in 8.50, `ऋष्टि` in 8.60, the special clusters in 11.13, and the long metres with joined wraps. This is a textual pronunciation aid; specialist oral-recitation review and native TTS pronunciation are not claimed.

## Validation

PASS: JSON parsing, expected counts (63/41/32/55/41/29), contiguous traditional numbers, unique stable IDs, nonempty unit-specific meanings, Sanskrit/Roman line parity, no Devanagari or Cyrillic residue in Roman fields, no raw ITRANS capitals/number markers/dandas/pipes. Full source comparison includes all 261 units.

PASS: `node --import tsx --test src/data/__tests__/devanagariWellFormed.test.ts` completed successfully: no new Devanagari cluster defects. The existing baseline remains 33 instances across six unrelated files. The direct tsx CLI could not create an IPC socket in this environment; the node import runner executed the same test successfully.

Native reader, all four language displays, standard/large font layouts, offline loading, collection progress and integration tests remain parent responsibilities. No screenshots or native verification were produced by this worker. No shared registries, screens, tests or chapters 1–7 were modified, and no commit/push/PR was created separately.

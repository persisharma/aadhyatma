# Deity introductions and Navagraha

Research date: 2 November 2026. Coverage is an identity and reference foundation, not twenty-one complete biographies.

## Existing Vedansh content audit

Checked the PR branch versions of `mobile/src/data/deities.ts`, `mobile/src/data/deityEssays.ts` and `mobile/src/panchang/grahaReference.ts`.

- The deity registry contains **21 IDs**.
- **Eight** have short essays: hanuman, rama, krishna, shiva, durga, ganesha, vishnu and saraswati.
- The essay provenance is a generic curated-overview statement, without claim-by-claim passages. Existing presence is not religious verification.
- The other registry entries are identities/metadata, not thirteen additional researched essays.
- The existing graha reference is the generic education surface; personal chart interpretation is separate. Research here does not change either.

## Deity identity and article seeds

The short Hindi/English descriptions below are original research drafts. “Essay” reports code presence only. Exact biography, birth narratives and theological rank remain source-specific.

| Existing ID | Hindi / English identity seed | Checked research and limits |
| --- | --- | --- |
| rama | राम: रामायण के प्रमुख नायक। Rama: central figure of the Ramayana. | Essay. Valmiki 1.1 introduces Rama through Narada's answer about qualities; [VR-RAMA](sources.md#vr-rama). |
| krishna | कृष्ण: गीता के उपदेशक और भागवत की कथाओं के प्रमुख उपास्य। Krishna: teacher in the Gita and a central divine figure in the Bhagavata. | Essay. [BG47-MUKUND](sources.md#bg47-mukund), [SB13-BBT](sources.md#sb13-bbt); avatar/substratum language differs by school. |
| vishnu | विष्णु: अनेक वैष्णव परम्पराओं के प्रमुख उपास्य। Vishnu: central to Vaishnava worship. | Essay. [HA-DENOMINATIONS](sources.md#ha-denominations), [MET-RECOGNIZING](sources.md#met-recognizing). Shankha, chakra, gada and padma are identification aids, not mandatory in every image. |
| shiva | शिव: नटराज, लिंग और अन्य स्वरूपों में पूजित। Shiva: worshipped through many forms, including Nataraja and linga. | Essay. [MET-NATARAJA](sources.md#met-nataraja), [HA-SYMBOLS](sources.md#ha-symbols). “Destroyer” alone is an inadequate introduction. |
| hanuman | हनुमान: रामकथा में सेवा, साहस और भक्ति से जुड़े प्रमुख पात्र। Hanuman: a major figure of service and courage in Rama's story. | Essay. [VR-HANUMAN](sources.md#vr-hanuman), Sundara 5.1, checks the ocean journey; no invented childhood curse or boon. |
| durga | दुर्गा: महिषासुरमर्दिनी सहित अनेक रूपों में पूजित देवी। Durga: worshipped in forms including Mahishasuramardini. | Essay. [MET-DURGA](sources.md#met-durga), [DEVI-KAVACHA](sources.md#devi-kavacha). Buffalo demon story, Navdurga list and Bengal family tableau need separate contexts. |
| ganesha | गणेश: गजमुख और विशिष्ट आयुधों से पहचाने जाने वाले उपास्य। Ganesha: recognized through his elephant head and characteristic attributes. | Essay. [MET-GANESHA](sources.md#met-ganesha), [GANAPATI-ATHARVA](sources.md#ganapati-atharva). Do not invent why the tusk broke from an object description. |
| savitr | वर्तमान नाम माँ गायत्री है; पहचान की समीक्षा आवश्यक। Currently labelled Maa Gayatri; identity review is needed. | No essay. [RV36210](sources.md#rv36210) invokes Savitr. A Vedic deity, Gayatri metre/mantra and personified Goddess Gayatri require distinct explanations. Do not automatically rename a saved ID. |
| saraswati | सरस्वती: विद्या और संगीत से जुड़ी देवी। Saraswati: associated with learning and music. | Essay. [MET-SARASVATI](sources.md#met-sarasvati) documents vina, manuscript, lotus and swan in a specific modern Bengal image. |
| lakshmi | लक्ष्मी: श्री और मंगल-समृद्धि से जुड़ी देवी। Lakshmi: associated with Shri and auspicious prosperity. | No essay. [HOH-LAKSHMI](sources.md#hoh-lakshmi), [SHRI-SUKTA](sources.md#shri-sukta). Prosperity is broader than a promise of money. |
| surya | सूर्य: वैदिक, प्रतिमा और नवग्रह संदर्भों में परिचित देवता। Surya: encountered in Vedic, iconographic and Navagraha contexts. | No essay. [AGNI51](sources.md#agni51), [NAVAGRAHA](sources.md#navagraha). Keep deity imagery distinct from a physical model of the Sun. |
| radha | राधा: राधा-कृष्ण भक्ति की प्रमुख उपास्य। Radha: central to Radha-Krishna devotion. | No essay. [RADHA-BBT](sources.md#radha-bbt) identifies Her in the commentary to 10.30.28; the verse itself does not explicitly contain the name Radha. This is a Gaudiya interpretation, not a hidden quotation to present as literal wording. |
| kartikeya | कार्तिकेय या स्कन्द: अनेक क्षेत्रों में पूजित देवता। Karttikeya or Skanda: worshipped in several regional traditions. | No essay. [MET-KARTTIKEYA](sources.md#met-karttikeya), [MET-SOMASKANDA](sources.md#met-somaskanda). Murugan is a related living Tamil devotional identity; do not universalize sibling birth order. |
| kubera | कुबेर: उत्तर दिशा के दिक्पाल के रूप में परिचित। Kubera: known as the northern directional guardian. | No essay. [KAMIKA](sources.md#kamika), [AGNI51](sources.md#agni51). See differing mounts in the Dikpal dossier. |
| ganga | गंगा: पवित्र नदी और देवी, दोनों संदर्भों में परिचित। Ganga: sacred river and personified goddess. | No essay. [NM-GANGA](sources.md#nm-ganga), [VR-GANGA](sources.md#vr-ganga). River geography and descent narrative are different article layers. |
| parvati | पार्वती: शिव के साथ और स्वतंत्र देवी-स्वरूप में पूजित। Parvati: worshipped independently and with Shiva. | No essay. [MET-PARVATI](sources.md#met-parvati), [MET-SOMASKANDA](sources.md#met-somaskanda), [HA-SHAKTI](sources.md#ha-shakti). Avoid one family table overriding every theology. |
| narasimha | नरसिंह: प्रह्लाद-कथा से जुड़ा विष्णु का नर-सिंह स्वरूप। Narasimha: Vishnu's man-lion form in the Prahlada narrative. | No essay. [SB78-BBT](sources.md#sb78-bbt), [SB13-BBT](sources.md#sb13-bbt). Distinguish narrative synopsis from later ritual iconography. |
| dattatreya | दत्तात्रेय: दत्त परम्पराओं के प्रमुख उपास्य। Dattatreya: central to Datta traditions. | No essay. [SB4133-BBT](sources.md#sb4133-bbt) describes Datta in a Vishnu-related context. That passage alone does not establish the later three-headed composite depiction or every Datta lineage. |
| shani | शनि: नवग्रह परम्परा के एक देवता। Shani: one of the Navagraha. | No essay. [NAVAGRAHA](sources.md#navagraha), verse 7. Do not import fear, illness or social stereotypes from old ritual teaching materials. |
| kali | काली: देवी-माहात्म्य में चण्ड-मुण्ड प्रसंग से जुड़ा उग्र स्वरूप। Kali: a fierce form in the Chanda-Munda episode of Devi Mahatmya. | No essay. [DM-KALI-PARGITER](sources.md#dm-kali-pargiter), [DM-KALI-AURO](sources.md#dm-kali-auro). That passage gives Chamunda naming; Kalaratri's Navdurga entry is a different reference. |
| navagraha | नवग्रह: नौ ग्रह-देवताओं का समूह। Navagraha: a collection of nine graha deities. | Collection identity, not a tenth planet or a new single deity. Reuse existing reference with reviewed provenance. |

## Navagraha reference roster

Reference: [NAVAGRAHA](sources.md#navagraha), nine stotra verses. This is a traditional devotional roster. Poetry in the stotra is not an astronomical claim.

| Hindi | English / common graha identity | Stotra locator |
| --- | --- | --- |
| सूर्य | Surya / Sun | 1 |
| चन्द्र | Chandra / Moon | 2 |
| मंगल | Mangala / Mars | 3 |
| बुध | Budha / Mercury | 4 |
| बृहस्पति or गुरु | Brihaspati / Jupiter | 5 |
| शुक्र | Shukra / Venus | 6 |
| शनि | Shani / Saturn | 7 |
| राहु | Rahu / ascending lunar node in astronomical usage | 8 |
| केतु | Ketu / descending lunar node in astronomical usage | 9 |

NASA explains the two orbital nodes as intersections of the Moon's orbit with the ecliptic, with northward and southward crossings. They are points, rather than two additional physical planets. [NASA-NODES](sources.md#nasa-nodes). Their devotional identities and traditional interpretations belong to a separate explanatory layer.

**Hindi draft:** नवग्रह का परिचय पढ़ते समय ग्रह-देवता, आकाशीय पिंड और ज्योतिषीय व्याख्या का भेद रखें। राहु और केतु का खगोलीय परिचय चन्द्र-कक्षा के दो पात-बिन्दुओं से जुड़ा है।

**English draft:** Distinguish graha deities, astronomical bodies and astrological interpretation. Rahu and Ketu correspond in astronomical usage to the Moon's two orbital nodes.

## Groups to add as introductions

- **Panchayatana:** Sringeri's Shiva Panchayatana book description identifies Shiva, Vishnu, Devi, Surya and Ganapati. It is evidence for that worship arrangement; the full ritual book was not read. [SRINGERI-PANCHAYATANA](sources.md#sringeri-panchayatana).
- **Trimurti:** Brahma, Vishnu and Shiva as a familiar triad. Explain roles through the selected source rather than dividing all Hindu theology into three exclusive departments. [MET-EDUCATORS](sources.md#met-educators).
- **Tridevi:** Saraswati, Lakshmi and Parvati may be introduced through a named convention. The checked Shakti account discusses those divine partners, but a standalone Tridevi history needs another dedicated source. [HA-SHAKTI](sources.md#ha-shakti).

## Story research boundaries

Available checked seeds: Rama's introduction (1.1), Hanuman's crossing (5.1), Ganga's descent (1.43), Narasimha (Bhagavata 7.8), Kali and Chamunda (Devi Mahatmya 7). A story seed is not a completed retelling. Before a story is authored, read its setup, action and resolution in the chosen edition, then independently collate the whole arc. Do not join Valmiki, Tulsidas, Purana and oral episodes without labels.

## Remaining profile work

Radha's wider textual history, Gayatri's personification, Datta lineages, complete Parvati narratives and each regional form require deeper profile-specific dossiers. This pack makes those limits visible while providing an identity foundation for every existing registry item.

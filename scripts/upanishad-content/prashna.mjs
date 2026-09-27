/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Praśna — Atharvaveda (Pippalāda śākhā). Six praśnas (questions) of
 * 16 · 13 · 12 · 11 · 7 · 8 = 67 mantras, cited praśna.mantra. Prose text; the
 * traditional mantra divisions of Śaṅkara's commentary are followed.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'prashna',
  muktika: 4,
  vedaHi: 'अथर्ववेद',
  vedaEn: 'Atharvaveda',
  source: {
    baseText:
      'Atharvaveda (Pippalāda) recension with Śāṅkara-bhāṣya, as printed in Gita Press "ईशादि नौ उपनिषद्"; Devanagari written out from the printed text.',
    canonicalEdition: 'Gita Press Gorakhpur, ईशादि नौ उपनिषद् (शांकरभाष्यार्थ सहित), code 66',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/prashna.html',
      'https://www.wisdomlib.org/hinduism/book/prashna-upanishad-shankara-bhashya',
      'https://archive.org/details/IshadiNauUpanishadGitaPress',
    ],
    notes:
      'Six praśnas of 16 · 13 · 12 · 11 · 7 · 8 mantras (Śaṅkara\'s numbering) plus the Atharvavedic śānti-pāṭha (भद्रं कर्णेभिः) as page 1. Long prose mantras are split at sentence boundaries into lines. Devanagari was authored from memory of the printed text with no network source available at build time — a line-by-line check against the Gita Press scan is still owed.',
    retrievedOn: '2026-09-26',
  },
  shanti: M(
    [
      'ॐ भद्रं कर्णेभिः शृणुयाम देवाः भद्रं पश्येमाक्षभिर्यजत्राः।',
      'स्थिरैरङ्गैस्तुष्टुवांसस्तनूभिर्व्यशेम देवहितं यदायुः।',
      'स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः।',
      'स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    'हे देवों! हम कानों से शुभ सुनें; हे यज्ञार्ह देवों! हम नेत्रों से शुभ देखें। स्थिर अंगों और शरीरों से आपकी स्तुति करते हुए हम देवों के हित की आयु प्राप्त करें। महान यशस्वी इन्द्र हमारा कल्याण करें; सर्वज्ञ पूषा हमारा कल्याण करें; अरिष्टनेमि तार्क्ष्य (गरुड़) हमारा कल्याण करें; बृहस्पति हमारा कल्याण करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'O gods, may we hear what is auspicious with our ears; O you worthy of worship, may we see what is auspicious with our eyes. Praising you with steady limbs and bodies, may we live the full span the gods have allotted. May Indra of great renown bless us; may all-knowing Pūṣan bless us; may Tārkṣya (Garuḍa) of unhindered course bless us; may Bṛhaspati grant us well-being. Om, peace, peace, peace.'
  ),
  khandas: [
    // ── Praśna 1 — Where do creatures come from? ─────────────────────────
    [
      M(
        [
          'ॐ सुकेशा च भारद्वाजः शैब्यश्च सत्यकामः सौर्यायणी च गार्ग्यः कौसल्यश्चाश्वलायनो भार्गवो वैदर्भिः कबन्धी कात्यायनस्ते हैते ब्रह्मपरा ब्रह्मनिष्ठाः परं ब्रह्मान्वेषमाणा',
          'एष ह वै तत्सर्वं वक्ष्यतीति ते ह समित्पाणयो भगवन्तं पिप्पलादमुपसन्नाः॥',
        ],
        'भारद्वाज-पुत्र सुकेशा, शिबि-पुत्र सत्यकाम, सूर्य के वंशज गार्ग्य सौर्यायणी, अश्वल-पुत्र कौसल्य, विदर्भ-देशीय भार्गव और कात्य-वंशी कबन्धी — ये सब ब्रह्मपरायण, ब्रह्मनिष्ठ, परब्रह्म की खोज करने वाले थे। "ये (आचार्य) हमें वह सब बता देंगे" — ऐसा सोचकर वे हाथ में समिधा लेकर भगवान् पिप्पलाद के पास गये।',
        'Sukeśā son of Bharadvāja, Satyakāma son of Śibi, Gārgya the grandson of Sūrya, Kausalya son of Aśvala, Bhārgava of Vidarbha and Kabandhī of the Kātya line — devoted to Brahman, established in Brahman, seeking the supreme Brahman — thought, "He will tell us all of it," and came, fuel in hand, to the venerable Pippalāda.'
      ),
      M(
        [
          'तान्ह स ऋषिरुवाच भूय एव तपसा ब्रह्मचर्येण श्रद्धया संवत्सरं संवत्स्यथ यथाकामं प्रश्नान्पृच्छत यदि विज्ञास्यामः सर्वं ह वो वक्ष्याम इति॥',
        ],
        'उन्हें उस ऋषि ने कहा — "तुम और एक वर्ष तप, ब्रह्मचर्य और श्रद्धा के साथ यहाँ निवास करो। फिर जो चाहो प्रश्न पूछो। यदि हम जानते होंगे तो तुम्हें सब कुछ बता देंगे।"',
        'The sage said to them: "Dwell here one more year in austerity, chastity and faith. Then ask what questions you wish. If we know, we shall tell you everything."'
      ),
      M(
        ['अथ कबन्धी कात्यायन उपेत्य पप्रच्छ।', 'भगवन्कुतो ह वा इमाः प्रजाः प्रजायन्त इति॥'],
        'तब कात्यायन कबन्धी ने पास जाकर पूछा — "भगवन्! यह प्रजा किससे उत्पन्न होती है?"',
        'Then Kabandhī Kātyāyana approached and asked: "Sir, from what are these creatures born?"'
      ),
      M(
        [
          'तस्मै स होवाच प्रजाकामो वै प्रजापतिः स तपोऽतप्यत स तपस्तप्त्वा स मिथुनमुत्पादयते।',
          'रयिं च प्राणं चेत्येतौ मे बहुधा प्रजाः करिष्यत इति॥',
        ],
        'उन्हें ऋषि ने कहा — प्रजा की इच्छा वाले प्रजापति ने तप किया। तप करके उन्होंने एक जोड़ा उत्पन्न किया — रयि (अन्न/जड़ तत्त्व) और प्राण — यह सोचकर कि "ये दोनों मेरे लिए अनेक प्रकार की प्रजा उत्पन्न करेंगे।"',
        'He replied: Prajāpati, desiring offspring, performed austerity. Having done so he produced a pair — Rayi (matter, food) and Prāṇa (life) — thinking, "These two will make creatures for me in many ways."'
      ),
      M(
        [
          'आदित्यो ह वै प्राणो रयिरेव चन्द्रमा रयिर्वा एतत्सर्वं यन्मूर्तं चामूर्तं च तस्मान्मूर्तिरेव रयिः॥',
        ],
        'सूर्य ही प्राण है और चन्द्रमा ही रयि है। जो कुछ मूर्त और अमूर्त है, वह सब रयि ही है; इसलिए मूर्ति (आकार) ही रयि है।',
        'The sun indeed is Prāṇa; the moon is Rayi. All this, whatever has form and whatever is formless, is Rayi; therefore form itself is Rayi.'
      ),
      M(
        [
          'अथादित्य उदयन्यत्प्राचीं दिशं प्रविशति तेन प्राच्यान्प्राणान्रश्मिषु सन्निधत्ते।',
          'यद्दक्षिणां यत्प्रतीचीं यदुदीचीं यदधो यदूर्ध्वं यदन्तरा दिशो यत्सर्वं प्रकाशयति तेन सर्वान्प्राणान्रश्मिषु सन्निधत्ते॥',
        ],
        'सूर्य उदय होकर जब पूर्व दिशा में प्रवेश करता है, तब पूर्व के प्राणों को अपनी किरणों में धारण करता है। जब दक्षिण, पश्चिम, उत्तर, नीचे, ऊपर और मध्य की दिशाओं को — सबको — प्रकाशित करता है, तब सब प्राणों को अपनी किरणों में धारण करता है।',
        'When the rising sun enters the eastern quarter, it holds the eastern life-breaths in its rays. When it lights up the south, the west, the north, below, above and the intermediate directions — everything — it holds all life-breaths in its rays.'
      ),
      M(
        ['स एष वैश्वानरो विश्वरूपः प्राणोऽग्निरुदयते।', 'तदेतदृचाभ्युक्तम्॥'],
        'वह यह वैश्वानर, विश्वरूप, प्राण-स्वरूप अग्नि उदित होता है। यही ऋचा में कहा गया है —',
        'This is the Vaiśvānara fire, of universal form, life itself, that rises. This is declared by the Ṛk verse:'
      ),
      M(
        [
          'विश्वरूपं हरिणं जातवेदसं परायणं ज्योतिरेकं तपन्तम्।',
          'सहस्ररश्मिः शतधा वर्तमानः प्राणः प्रजानामुदयत्येष सूर्यः॥',
        ],
        'जो विश्वरूप, किरणों वाला, सर्वज्ञ, सबका आश्रय, एकमात्र ज्योति और तपने वाला है; सहस्र किरणों वाला, सैकड़ों रूपों में वर्तमान, प्रजाओं का प्राण — यह सूर्य उदित होता है।',
        'Of universal form, radiant, all-knowing, the final resort, the one light that burns; thousand-rayed, existing in a hundred forms, the life of all creatures — this sun rises.'
      ),
      M(
        [
          'संवत्सरो वै प्रजापतिस्तस्यायने दक्षिणं चोत्तरं च।',
          'तद्ये ह वै तदिष्टापूर्ते कृतमित्युपासते ते चान्द्रमसमेव लोकमभिजयन्ते।',
          'त एव पुनरावर्तन्ते तस्मादेत ऋषयः प्रजाकामा दक्षिणं प्रतिपद्यन्ते।',
          'एष ह वै रयिर्यः पितृयाणः॥',
        ],
        'संवत्सर (वर्ष) ही प्रजापति है; उसके दो अयन हैं — दक्षिण और उत्तर। जो इष्ट (यज्ञ) और पूर्त (कूप, बाग आदि) को ही कर्तव्य मानकर उपासना करते हैं, वे चन्द्रलोक को ही जीतते हैं और फिर लौट आते हैं। इसलिए प्रजा की कामना वाले ये ऋषि दक्षिण मार्ग को प्राप्त होते हैं। यह जो पितृयाण है, वही रयि है।',
        'The year is Prajāpati; it has two paths, the southern and the northern. Those who worship through sacrifice and public works alone, thinking "this is what is to be done," win only the lunar world and return again. Therefore these sages who desire offspring take the southern path. This path of the fathers is Rayi.'
      ),
      M(
        [
          'अथोत्तरेण तपसा ब्रह्मचर्येण श्रद्धया विद्ययात्मानमन्विष्यादित्यमभिजयन्ते।',
          'एतद्वै प्राणानामायतनमेतदमृतमभयमेतत्परायणमेतस्मान्न पुनरावर्तन्त इत्येष निरोधः।',
          'तदेष श्लोकः॥',
        ],
        'और उत्तर मार्ग से, तप, ब्रह्मचर्य, श्रद्धा और विद्या द्वारा आत्मा की खोज करके वे सूर्यलोक को जीतते हैं। यही प्राणों का आश्रय है, यही अमृत और अभय है, यही परम गति है; इससे वे फिर नहीं लौटते — यह (अज्ञानियों के लिए) रुकावट है। इस विषय में यह श्लोक है —',
        'But by the northern path, seeking the Self through austerity, chastity, faith and knowledge, they win the sun. This is the abode of the life-breaths, this is immortal and fearless, this is the highest goal; from it they do not return. This is the barrier (for the ignorant). On this there is the verse:'
      ),
      M(
        [
          'पञ्चपादं पितरं द्वादशाकृतिं दिव आहुः परे अर्धे पुरीषिणम्।',
          'अथेमे अन्य उ परे विचक्षणं सप्तचक्रे षडर आहुरर्पितमिति॥',
        ],
        'पाँच पैरों (ऋतुओं) वाले, बारह आकृतियों (महीनों) वाले, जल देने वाले पिता (सूर्य) को (कुछ लोग) द्युलोक के परार्ध में स्थित कहते हैं। और दूसरे लोग कहते हैं कि वह सर्वदर्शी सात चक्रों और छह अरों वाले (रथ/काल) में स्थापित है।',
        'Some call him the father of five feet (the seasons) and twelve forms (the months), the giver of rain dwelling in the upper half of heaven. Others say the all-seeing one is set in a wheel of seven spokes and six arms (time).'
      ),
      M(
        [
          'मासो वै प्रजापतिस्तस्य कृष्णपक्ष एव रयिः शुक्लः प्राणस्तस्मादेत ऋषयः शुक्ल इष्टं कुर्वन्तीतर इतरस्मिन्॥',
        ],
        'मास ही प्रजापति है; उसका कृष्ण पक्ष रयि है और शुक्ल पक्ष प्राण है। इसलिए ये (प्राण को जानने वाले) ऋषि शुक्ल पक्ष में यज्ञ करते हैं, और दूसरे (अज्ञानी) दूसरे (कृष्ण) पक्ष में।',
        'The month is Prajāpati; its dark fortnight is Rayi, its bright fortnight is Prāṇa. Therefore these sages perform sacrifice in the bright fortnight; others in the other.'
      ),
      M(
        [
          'अहोरात्रो वै प्रजापतिस्तस्याहरेव प्राणो रात्रिरेव रयिः।',
          'प्राणं वा एते प्रस्कन्दन्ति ये दिवा रत्या संयुज्यन्ते ब्रह्मचर्यमेव तद्यद्रात्रौ रत्या संयुज्यन्ते॥',
        ],
        'दिन-रात ही प्रजापति है; उसका दिन प्राण है और रात्रि रयि है। जो दिन में रति करते हैं वे प्राण को ही क्षीण करते हैं; रात में (ऋतुकाल में) रति करना ब्रह्मचर्य ही है।',
        'Day and night are Prajāpati; the day is Prāṇa, the night is Rayi. Those who unite in love by day waste their life-breath; to unite by night (in season) is itself chastity.'
      ),
      M(
        ['अन्नं वै प्रजापतिस्ततो ह वै तद्रेतस्तस्मादिमाः प्रजाः प्रजायन्त इति॥'],
        'अन्न ही प्रजापति है; उससे ही वह रेतस् (वीर्य) बनता है, और उससे यह प्रजा उत्पन्न होती है।',
        'Food is Prajāpati; from it comes the seed, and from that these creatures are born.'
      ),
      M(
        [
          'तद्ये ह वै तत्प्रजापतिव्रतं चरन्ति ते मिथुनमुत्पादयन्ते।',
          'तेषामेवैष ब्रह्मलोको येषां तपो ब्रह्मचर्यं येषु सत्यं प्रतिष्ठितम्॥',
        ],
        'जो उस प्रजापति-व्रत का पालन करते हैं, वे (पुत्र-पुत्री रूप) जोड़ा उत्पन्न करते हैं। किन्तु यह ब्रह्मलोक उन्हीं का है जिनमें तप, ब्रह्मचर्य और सत्य प्रतिष्ठित हैं।',
        'Those who keep this vow of Prajāpati produce a pair (of children). But that world of Brahman belongs only to those in whom austerity, chastity and truth are established.'
      ),
      M(
        ['तेषामसौ विरजो ब्रह्मलोको न येषु जिह्ममनृतं न माया चेति॥'],
        'वह निर्मल ब्रह्मलोक उन्हीं का है जिनमें कुटिलता नहीं, असत्य नहीं और माया (कपट) नहीं है।',
        'That stainless world of Brahman is theirs in whom there is no crookedness, no falsehood and no deceit.'
      ),
    ],
    // ── Praśna 2 — Which powers support the body, and which is chief? ────
    [
      M(
        [
          'अथ हैनं भार्गवो वैदर्भिः पप्रच्छ।',
          'भगवन्कत्येव देवाः प्रजां विधारयन्ते कतर एतत्प्रकाशयन्ते कः पुनरेषां वरिष्ठ इति॥',
        ],
        'फिर विदर्भ-देशीय भार्गव ने उनसे पूछा — "भगवन्! कितने देव (शक्तियाँ) प्रजा (शरीर) को धारण करते हैं? उनमें कौन इसे प्रकाशित करते हैं? और इनमें श्रेष्ठ कौन है?"',
        'Then Bhārgava of Vidarbha asked him: "Sir, how many powers support a creature? Which of them illumine it? And which is the chief among them?"'
      ),
      M(
        [
          'तस्मै स होवाचाकाशो ह वा एष देवो वायुरग्निरापः पृथिवी वाङ्मनश्चक्षुः श्रोत्रं च।',
          'ते प्रकाश्याभिवदन्ति वयमेतद्बाणमवष्टभ्य विधारयामः॥',
        ],
        'उन्हें ऋषि ने कहा — आकाश ही यह देव है, तथा वायु, अग्नि, जल, पृथ्वी, वाणी, मन, नेत्र और श्रोत्र। वे (अपनी शक्ति) प्रकट करके बोले — "हम ही इस शरीर को सहारा देकर धारण करते हैं।"',
        'He replied: Space is such a power, and air, fire, water, earth, speech, mind, eye and ear. Displaying their powers they boasted, "It is we who hold this body up and support it."'
      ),
      M(
        [
          'तान्वरिष्ठः प्राण उवाच।',
          'मा मोहमापद्यथाहमेवैतत्पञ्चधात्मानं प्रविभज्यैतद्बाणमवष्टभ्य विधारयामीति तेऽश्रद्दधाना बभूवुः॥',
        ],
        'उनसे श्रेष्ठ प्राण ने कहा — "मोह में न पड़ो। मैं ही अपने को पाँच भागों में विभक्त कर इस शरीर को सहारा देकर धारण करता हूँ।" किन्तु उन्होंने विश्वास नहीं किया।',
        'The chief, Prāṇa, said to them: "Do not be deluded. It is I who, dividing myself fivefold, hold up and support this body." But they did not believe him.'
      ),
      M(
        [
          'सोऽभिमानादूर्ध्वमुत्क्रामत इव तस्मिन्नुत्क्रामत्यथेतरे सर्व एवोत्क्रामन्ते तस्मिंश्च प्रतिष्ठमाने सर्व एव प्रातिष्ठन्ते।',
          'तद्यथा मक्षिका मधुकरराजानमुत्क्रामन्तं सर्वा एवोत्क्रामन्ते तस्मिंश्च प्रतिष्ठमाने सर्वा एव प्रातिष्ठन्त एवं वाङ्मनश्चक्षुः श्रोत्रं च ते प्रीताः प्राणं स्तुन्वन्ति॥',
        ],
        'तब वह अभिमान से ऊपर की ओर निकलने जैसा हुआ। उसके निकलते ही अन्य सब निकल पड़े और उसके ठहरने पर सब ठहर गये। जैसे मधुमक्खियाँ अपने राजा के निकलने पर सब निकल पड़ती हैं और उसके बैठने पर सब बैठ जाती हैं — वैसे ही वाणी, मन, नेत्र और श्रोत्र (ने किया)। तब वे प्रसन्न होकर प्राण की स्तुति करने लगे।',
        'In pride he seemed to rise up and depart; as he rose, all the others rose with him, and as he settled, all settled again. As bees all fly out when their king flies out and all settle when he settles, so did speech, mind, eye and ear. Satisfied, they praised Prāṇa.'
      ),
      M(
        [
          'एषोऽग्निस्तपत्येष सूर्य एष पर्जन्यो मघवानेष वायुः।',
          'एष पृथिवी रयिर्देवः सदसच्चामृतं च यत्॥',
        ],
        'यही प्राण अग्नि रूप से तपता है, यही सूर्य है, यही पर्जन्य (मेघ) है, यही इन्द्र है, यही वायु है, यही पृथ्वी है, यही रयि है, यही देव है — जो सत् और असत् है और जो अमृत है।',
        'It is he who burns as fire, he who is the sun, the rain-cloud, Indra, the wind; he is the earth, matter, the god — what is and what is not, and what is immortal.'
      ),
      M(
        [
          'अरा इव रथनाभौ प्राणे सर्वं प्रतिष्ठितम्।',
          'ऋचो यजूंषि सामानि यज्ञः क्षत्रं ब्रह्म च॥',
        ],
        'जैसे रथ के पहिये की नाभि में अरे स्थित रहते हैं, वैसे ही प्राण में सब कुछ प्रतिष्ठित है — ऋचाएँ, यजुष्, साम, यज्ञ, क्षत्रिय और ब्राह्मण।',
        'As spokes in the hub of a wheel, everything is fixed in Prāṇa — the Ṛk, Yajus and Sāma verses, sacrifice, the warrior and the priest.'
      ),
      M(
        [
          'प्रजापतिश्चरसि गर्भे त्वमेव प्रतिजायसे।',
          'तुभ्यं प्राण प्रजास्त्विमा बलिं हरन्ति यः प्राणैः प्रतितिष्ठसि॥',
        ],
        'हे प्राण! तू ही प्रजापति रूप से गर्भ में विचरता है और तू ही (पुत्र रूप से) जन्म लेता है। हे प्राण! जो तू प्राणों (इन्द्रियों) के साथ (शरीर में) स्थित है, उस तुझे यह प्रजा भेंट अर्पित करती है।',
        'As Prajāpati you move in the womb; it is you who are born again as the child. O Prāṇa, to you who dwell in the body with the senses, these creatures bring their offering.'
      ),
      M(
        [
          'देवानामसि वह्नितमः पितृणां प्रथमा स्वधा।',
          'ऋषीणां चरितं सत्यमथर्वाङ्गिरसामसि॥',
        ],
        'तू देवों तक (हवि) पहुँचाने वाला श्रेष्ठ वाहक है; पितरों की प्रथम स्वधा (भेंट) है; अथर्वा और अङ्गिरा ऋषियों का सत्य आचरण (प्राणविद्या) तू ही है।',
        'You are the best bearer of offerings to the gods, the first oblation to the fathers; you are the true practice of the sages, of Atharvan and the Aṅgiras.'
      ),
      M(
        [
          'इन्द्रस्त्वं प्राण तेजसा रुद्रोऽसि परिरक्षिता।',
          'त्वमन्तरिक्षे चरसि सूर्यस्त्वं ज्योतिषां पतिः॥',
        ],
        'हे प्राण! तू तेज से इन्द्र है, (संहारक रूप से) रुद्र है, और (पालक रूप से) रक्षक है। तू अन्तरिक्ष में विचरता है; तू ही सूर्य है, ज्योतियों का स्वामी।',
        'O Prāṇa, by your might you are Indra; you are Rudra, and the protector. You move in the mid-region; you are the sun, lord of lights.'
      ),
      M(
        [
          'यदा त्वमभिवर्षस्यथेमाः प्राण ते प्रजाः।',
          'आनन्दरूपास्तिष्ठन्ति कामायान्नं भविष्यतीति॥',
        ],
        'हे प्राण! जब तू (मेघ रूप से) वर्षा करता है, तब तेरी यह प्रजा "इच्छानुसार अन्न होगा" — यह सोचकर आनन्दित रहती है।',
        'When you send down rain, O Prāṇa, these creatures of yours stand rejoicing, thinking, "There will be food as much as we desire."'
      ),
      M(
        [
          'व्रात्यस्त्वं प्राणैकर्षिरत्ता विश्वस्य सत्पतिः।',
          'वयमाद्यस्य दातारः पिता त्वं मातरिश्व नः॥',
        ],
        'हे प्राण! तू (स्वभाव से शुद्ध) व्रात्य है, एकर्षि नामक अग्नि है, विश्व का भोक्ता और सच्चा स्वामी है। हम तुझे भोग्य (हवि) देने वाले हैं; हे मातरिश्वा (वायु)! तू हमारा पिता है।',
        'You are the unconsecrated one (pure by nature), O Prāṇa, the fire Ekarṣi, the eater and true lord of all. We are the givers of what you eat; you, O Mātariśvan, are our father.'
      ),
      M(
        [
          'या ते तनूर्वाचि प्रतिष्ठिता या श्रोत्रे या च चक्षुषि।',
          'या च मनसि सन्तता शिवां तां कुरु मोत्क्रमीः॥',
        ],
        'तेरा जो रूप वाणी में स्थित है, जो श्रोत्र में, जो नेत्र में और जो मन में व्याप्त है — उसे शान्त (कल्याणकारी) कर; (शरीर से) मत निकल।',
        'That form of yours which dwells in speech, in the ear, in the eye, and which pervades the mind — make it benign; do not depart.'
      ),
      M(
        [
          'प्राणस्येदं वशे सर्वं त्रिदिवे यत्प्रतिष्ठितम्।',
          'मातेव पुत्रान्रक्षस्व श्रीश्च प्रज्ञां च विधेहि न इति॥',
        ],
        'यह सब जो तीनों लोकों में स्थित है, प्राण के वश में है। माता जैसे पुत्रों की रक्षा करती है वैसे हमारी रक्षा कर; हमें श्री (समृद्धि) और प्रज्ञा प्रदान कर।',
        'All this, whatever is established in the three worlds, is under Prāṇa\'s sway. Protect us as a mother her sons; grant us prosperity and wisdom.'
      ),
    ],
    // ── Praśna 3 — The origin and distribution of Prāṇa ───────────────────
    [
      M(
        [
          'अथ हैनं कौसल्यश्चाश्वलायनः पप्रच्छ।',
          'भगवन्कुत एष प्राणो जायते कथमायात्यस्मिञ्शरीर आत्मानं वा प्रविभज्य कथं प्रातिष्ठते केनोत्क्रमते कथं बाह्यमभिधत्ते कथमध्यात्ममिति॥',
        ],
        'फिर अश्वल-पुत्र कौसल्य ने उनसे पूछा — "भगवन्! यह प्राण कहाँ से उत्पन्न होता है? इस शरीर में कैसे आता है? अपने को विभक्त करके कैसे स्थित होता है? किस कारण से निकलता है? बाहर (के जगत्) को कैसे धारण करता है और भीतर (शरीर) को कैसे?"',
        'Then Kausalya son of Aśvala asked him: "Sir, from where is this Prāṇa born? How does it enter this body? How does it abide after dividing itself? By what does it depart? How does it hold the outer world, and how the inner?"'
      ),
      M(
        [
          'तस्मै स होवाचातिप्रश्नान्पृच्छसि ब्रह्मिष्ठोऽसीति तस्मात्तेऽहं ब्रवीमि॥',
        ],
        'उन्हें ऋषि ने कहा — "तू कठिन प्रश्न पूछता है। तू ब्रह्मनिष्ठ है, इसलिए मैं तुझे बताता हूँ।"',
        'He replied: "You ask very difficult questions. But you are devoted to Brahman, so I shall tell you."'
      ),
      M(
        [
          'आत्मन एष प्राणो जायते।',
          'यथैषा पुरुषे छायैतस्मिन्नेतदाततं मनोकृतेनायात्यस्मिञ्शरीरे॥',
        ],
        'यह प्राण आत्मा से उत्पन्न होता है। जैसे पुरुष के साथ उसकी छाया रहती है, वैसे यह प्राण आत्मा में व्याप्त है, और मन के संकल्प (कर्म) के कारण इस शरीर में आता है।',
        'This Prāṇa is born of the Self. As a shadow is cast by a person, so is Prāṇa spread over the Self; and by the act of the mind it comes into this body.'
      ),
      M(
        [
          'यथा सम्राडेवाधिकृतान्विनियुङ्क्ते।',
          'एतान्ग्रामानेतान्ग्रामानधितिष्ठस्वेत्येवमेवैष प्राण इतरान्प्राणान्पृथक्पृथगेव सन्निधत्ते॥',
        ],
        'जैसे सम्राट् अधिकारियों को नियुक्त करता है — "तू इन गाँवों पर, तू इन गाँवों पर शासन कर" — वैसे ही यह प्राण अन्य प्राणों को अलग-अलग स्थानों पर नियुक्त करता है।',
        'As an emperor commands his officers, "You govern these villages, you those," so does this Prāṇa station the other breaths, each in its own place.'
      ),
      M(
        [
          'पायूपस्थेऽपानं चक्षुःश्रोत्रे मुखनासिकाभ्यां प्राणः स्वयं प्रातिष्ठते मध्ये तु समानः।',
          'एष ह्येतद्धुतमन्नं समं नयति तस्मादेताः सप्तार्चिषो भवन्ति॥',
        ],
        'गुदा और उपस्थ में अपान को (नियुक्त करता है)। नेत्र, श्रोत्र, मुख और नासिका में प्राण स्वयं स्थित होता है। मध्य में समान है; यही खाये हुए अन्न को समान रूप से (सब अंगों में) पहुँचाता है। उससे ये सात ज्वालाएँ (दो नेत्र, दो कान, दो नासिका, मुख) प्रकट होती हैं।',
        'In the organs of excretion and generation he places Apāna. In the eye, ear, mouth and nostrils Prāṇa himself abides. In the middle is Samāna, which distributes the food that is offered evenly; from it arise the seven flames (the two eyes, two ears, two nostrils and mouth).'
      ),
      M(
        [
          'हृदि ह्येष आत्मा।',
          'अत्रैतदेकशतं नाडीनां तासां शतं शतमेकैकस्या द्वासप्ततिर्द्वासप्ततिः प्रतिशाखानाडीसहस्राणि भवन्त्यासु व्यानश्चरति॥',
        ],
        'यह आत्मा हृदय में है। यहाँ एक सौ एक नाड़ियाँ हैं; उनमें प्रत्येक की सौ-सौ शाखाएँ हैं, और प्रत्येक शाखा की बहत्तर-बहत्तर हजार प्रतिशाखा नाड़ियाँ हैं। इनमें व्यान विचरता है।',
        'This Self dwells in the heart. Here are a hundred and one channels; each has a hundred branches, and each branch seventy-two thousand sub-branches. In these moves Vyāna.'
      ),
      M(
        [
          'अथैकयोर्ध्व उदानः पुण्येन पुण्यं लोकं नयति पापेन पापमुभाभ्यामेव मनुष्यलोकम्॥',
        ],
        'और एक (सुषुम्ना) नाड़ी से ऊपर जाने वाला उदान, पुण्य से पुण्यलोक को, पाप से पापलोक को और दोनों से मनुष्यलोक को ले जाता है।',
        'Rising through one channel (the suṣumṇā), Udāna leads by merit to a world of merit, by sin to a world of sin, and by both to the world of men.'
      ),
      M(
        [
          'आदित्यो ह वै बाह्यः प्राण उदयत्येष ह्येनं चाक्षुषं प्राणमनुगृह्णानः।',
          'पृथिव्यां या देवता सैषा पुरुषस्यापानमवष्टभ्यान्तरा यदाकाशः स समानो वायुर्व्यानः॥',
        ],
        'सूर्य ही बाह्य प्राण है; वह उदित होकर इस नेत्र-स्थित प्राण पर अनुग्रह करता है। पृथ्वी में जो देवता है, वह पुरुष के अपान को थामे रहती है। इन दोनों के बीच जो आकाश है, वह समान है; और वायु व्यान है।',
        'The sun is the outer Prāṇa; it rises favouring the Prāṇa in the eye. The deity in the earth supports a person\'s Apāna. The space between them is Samāna; the wind is Vyāna.'
      ),
      M(
        [
          'तेजो ह वा उदानस्तस्मादुपशान्ततेजाः।',
          'पुनर्भवमिन्द्रियैर्मनसि सम्पद्यमानैः॥',
        ],
        'तेज ही उदान है। इसलिए जिसका तेज शान्त हो गया है, वह मन में लीन होती हुई इन्द्रियों के साथ पुनर्जन्म को प्राप्त होता है।',
        'Fire is Udāna. Therefore one whose bodily heat has subsided goes to rebirth, together with the senses merged in the mind.'
      ),
      M(
        [
          'यच्चित्तस्तेनैष प्राणमायाति।',
          'प्राणस्तेजसा युक्तः सहात्मना यथासङ्कल्पितं लोकं नयति॥',
        ],
        '(मरण काल में) जिसका जैसा संकल्प होता है, उसी के साथ वह प्राण में आता है। तब तेज से युक्त प्राण, जीवात्मा के साथ, संकल्प के अनुसार लोक में ले जाता है।',
        'With whatever thought one has at death, with that one comes to Prāṇa. Prāṇa, joined with fire and with the Self, leads one to the world one has imagined.'
      ),
      M(
        [
          'य एवं विद्वान्प्राणं वेद न हास्य प्रजा हीयतेऽमृतो भवति।',
          'तदेष श्लोकः॥',
        ],
        'जो विद्वान् इस प्रकार प्राण को जानता है, उसकी सन्तति का क्षय नहीं होता; वह अमर हो जाता है। इस विषय में यह श्लोक है —',
        'The wise one who knows Prāṇa thus — his line does not fail; he becomes immortal. On this there is the verse:'
      ),
      M(
        [
          'उत्पत्तिमायतिं स्थानं विभुत्वं चैव पञ्चधा।',
          'अध्यात्मं चैव प्राणस्य विज्ञायामृतमश्नुते विज्ञायामृतमश्नुत इति॥',
        ],
        'प्राण की उत्पत्ति, आगमन, स्थान, पाँच प्रकार का विभुत्व और शरीर में स्थिति — इन्हें जानकर मनुष्य अमृत को प्राप्त करता है, अमृत को प्राप्त करता है।',
        'Knowing the origin of Prāṇa, its coming, its abode, its fivefold sovereignty and its presence within the body, one attains immortality — one attains immortality.'
      ),
    ],
    // ── Praśna 4 — Sleep, dream and the one in whom all rests ─────────────
    [
      M(
        [
          'अथ हैनं सौर्यायणी गार्ग्यः पप्रच्छ।',
          'भगवन्नेतस्मिन्पुरुषे कानि स्वपन्ति कान्यस्मिञ्जाग्रति कतर एष देवः स्वप्नान्पश्यति कस्यैतत्सुखं भवति कस्मिन्नु सर्वे सम्प्रतिष्ठिता भवन्तीति॥',
        ],
        'फिर गार्ग्य सौर्यायणी ने उनसे पूछा — "भगवन्! इस पुरुष में कौन सोते हैं? कौन जागते रहते हैं? कौन देव स्वप्न देखता है? यह सुख किसे होता है? और किसमें सब प्रतिष्ठित हो जाते हैं?"',
        'Then Gārgya Sauryāyaṇī asked him: "Sir, in this person, what sleeps? What keeps awake? Which power sees the dreams? Whose is this happiness? And in whom do all come to rest?"'
      ),
      M(
        [
          'तस्मै स होवाच।',
          'यथा गार्ग्य मरीचयोऽर्कस्यास्तं गच्छतः सर्वा एतस्मिंस्तेजोमण्डल एकीभवन्ति ताः पुनः पुनरुदयतः प्रचरन्त्येवं ह वै तत्सर्वं परे देवे मनस्येकीभवति।',
          'तेन तर्ह्येष पुरुषो न शृणोति न पश्यति न जिघ्रति न रसयते न स्पृशते नाभिवदते नादत्ते नानन्दयते न विसृजते नेयायते स्वपितीत्याचक्षते॥',
        ],
        'उन्हें ऋषि ने कहा — हे गार्ग्य! जैसे अस्त होते सूर्य की सब किरणें उसके तेजोमण्डल में एक हो जाती हैं और उदय होने पर फिर फैल जाती हैं, वैसे ही वह सब (इन्द्रियाँ) श्रेष्ठ देव मन में एक हो जाती हैं। इसलिए तब यह पुरुष न सुनता है, न देखता है, न सूँघता है, न चखता है, न स्पर्श करता है, न बोलता है, न लेता है, न रमण करता है, न त्याग करता है, न चलता है — "सो रहा है" ऐसा कहते हैं।',
        'He replied: Gārgya, as the rays of the setting sun all gather into its orb of light and spread out again when it rises, so all the senses become one in the higher power, the mind. Then the person does not hear, see, smell, taste, touch, speak, grasp, enjoy, excrete or move — "he sleeps," they say.'
      ),
      M(
        [
          'प्राणाग्नय एवैतस्मिन्पुरे जाग्रति।',
          'गार्हपत्यो ह वा एषोऽपानो व्यानोऽन्वाहार्यपचनो यद्गार्हपत्यात्प्रणीयते प्रणयनादाहवनीयः प्राणः॥',
        ],
        'इस (शरीर-) नगर में प्राण-रूप अग्नियाँ ही जागती हैं। यह अपान गार्हपत्य अग्नि है, व्यान अन्वाहार्यपचन (दक्षिणाग्नि) है; और गार्हपत्य से जो निकाला जाता है, वह निकाले जाने के कारण आहवनीय है — वही प्राण है।',
        'Only the fires of Prāṇa keep awake in this city of the body. Apāna is the gārhapatya fire, Vyāna the dakṣiṇa fire; and Prāṇa is the āhavanīya, since it is carried forth from the gārhapatya.'
      ),
      M(
        [
          'यदुच्छ्वासनिःश्वासावेतावाहुती समं नयतीति स समानः।',
          'मनो ह वाव यजमानः।',
          'इष्टफलमेवोदानः स एनं यजमानमहरहर्ब्रह्म गमयति॥',
        ],
        'जो श्वास और प्रश्वास — इन दो आहुतियों को समान रूप से ले जाता है, वह समान है। मन ही यजमान है। उदान ही यज्ञ का फल है; वह इस यजमान (मन) को प्रतिदिन (सुषुप्ति में) ब्रह्म के पास ले जाता है।',
        'Samāna is he who carries the two oblations, the in-breath and out-breath, evenly. The mind is the sacrificer. Udāna is the fruit of the sacrifice; day after day he leads this sacrificer to Brahman.'
      ),
      M(
        [
          'अत्रैष देवः स्वप्ने महिमानमनुभवति।',
          'यद्दृष्टं दृष्टमनुपश्यति श्रुतं श्रुतमेवार्थमनुशृणोति देशदिगन्तरैश्च प्रत्यनुभूतं पुनः पुनः प्रत्यनुभवति दृष्टं चादृष्टं च श्रुतं चाश्रुतं चानुभूतं चाननुभूतं च सच्चासच्च सर्वं पश्यति सर्वः पश्यति॥',
        ],
        'यहाँ (स्वप्न में) यह देव (मन) अपनी महिमा का अनुभव करता है। देखे हुए को फिर देखता है, सुने हुए को फिर सुनता है, देश-दिशाओं में अनुभव किये हुए को फिर-फिर अनुभव करता है। देखा-अनदेखा, सुना-अनसुना, अनुभूत-अननुभूत, सत् और असत् — सब देखता है; (स्वयं) सब बनकर देखता है।',
        'Here in dream this power, the mind, experiences its own greatness. What was seen it sees again, what was heard it hears again; what was experienced in other places and directions it experiences again and again. Seen and unseen, heard and unheard, experienced and not experienced, real and unreal — it sees all; being all, it sees.'
      ),
      M(
        [
          'स यदा तेजसाऽभिभूतो भवति।',
          'अत्रैष देवः स्वप्नान्न पश्यत्यथ तदैतस्मिञ्शरीर एतत्सुखं भवति॥',
        ],
        'जब वह (मन) तेज (पित्त आदि) से अभिभूत हो जाता है, तब यह देव स्वप्न नहीं देखता। तब इस शरीर में यह (सुषुप्ति का) सुख होता है।',
        'When the mind is overpowered by the body\'s fire, then this power sees no dreams; then arises in this body that happiness (of deep sleep).'
      ),
      M(
        [
          'स यथा सोम्य वयांसि वासोवृक्षं सम्प्रतिष्ठन्ते।',
          'एवं ह वै तत्सर्वं पर आत्मनि सम्प्रतिष्ठते॥',
        ],
        'हे सोम्य! जैसे पक्षी अपने बसेरे के वृक्ष पर आ बैठते हैं, वैसे ही वह सब परमात्मा में प्रतिष्ठित हो जाता है —',
        'As birds, dear one, come to rest on the tree where they nest, so does all this come to rest in the supreme Self —'
      ),
      M(
        [
          'पृथिवी च पृथिवीमात्रा चापश्चापोमात्रा च तेजश्च तेजोमात्रा च वायुश्च वायुमात्रा चाकाशश्चाकाशमात्रा च चक्षुश्च द्रष्टव्यं च श्रोत्रं च श्रोतव्यं च घ्राणं च घ्रातव्यं च रसश्च रसयितव्यं च त्वक्च स्पर्शयितव्यं च वाक्च वक्तव्यं च हस्तौ चादातव्यं चोपस्थश्चानन्दयितव्यं च पायुश्च विसर्जयितव्यं च पादौ च गन्तव्यं च मनश्च मन्तव्यं च बुद्धिश्च बोद्धव्यं चाहङ्कारश्चाहङ्कर्तव्यं च चित्तं च चेतयितव्यं च तेजश्च विद्योतयितव्यं च प्राणश्च विधारयितव्यं च॥',
        ],
        'पृथ्वी और पृथ्वी की तन्मात्रा, जल और जल की तन्मात्रा, तेज और तेज की तन्मात्रा, वायु और वायु की तन्मात्रा, आकाश और आकाश की तन्मात्रा; नेत्र और दृश्य, श्रोत्र और श्रव्य, घ्राण और गन्ध, रसना और रस, त्वचा और स्पर्श, वाणी और वक्तव्य, हाथ और ग्राह्य, उपस्थ और आनन्द, गुदा और विसर्ज्य, पैर और गम्य; मन और मन्तव्य, बुद्धि और बोध्य, अहंकार और अहंकार्य, चित्त और चेतनीय, तेज और प्रकाश्य, प्राण और धारणीय — (यह सब परमात्मा में प्रतिष्ठित होता है)।',
        'Earth and its subtle essence, water and its essence, fire and its essence, air and its essence, space and its essence; the eye and what is seen, the ear and what is heard, the nose and what is smelt, taste and what is tasted, skin and what is touched, speech and what is spoken, hands and what is grasped, the organ of generation and its delight, the organ of excretion and what is excreted, feet and where one goes; the mind and what is thought, intellect and what is understood, ego and what is owned, consciousness and what is known, light and what is illumined, Prāṇa and what is sustained — all this rests in the supreme Self.'
      ),
      M(
        [
          'एष हि द्रष्टा स्प्रष्टा श्रोता घ्राता रसयिता मन्ता बोद्धा कर्ता विज्ञानात्मा पुरुषः।',
          'स परेऽक्षर आत्मनि सम्प्रतिष्ठते॥',
        ],
        'यही (जीव) द्रष्टा, स्प्रष्टा, श्रोता, घ्राता, रसयिता, मन्ता, बोद्धा, कर्ता और विज्ञानात्मा पुरुष है। वह पर अक्षर आत्मा में प्रतिष्ठित हो जाता है।',
        'This is the seer, toucher, hearer, smeller, taster, thinker, knower, doer — the person who is the knowing self. He comes to rest in the supreme, imperishable Self.'
      ),
      M(
        [
          'परमेवाक्षरं प्रतिपद्यते स यो ह वै तदच्छायमशरीरमलोहितं शुभ्रमक्षरं वेदयते यस्तु सोम्य।',
          'स सर्वज्ञः सर्वो भवति।',
          'तदेष श्लोकः॥',
        ],
        'हे सोम्य! जो उस छायारहित, शरीररहित, रंगरहित, शुभ्र अक्षर को जानता है, वह परम अक्षर को ही प्राप्त होता है। वह सर्वज्ञ और सर्वरूप हो जाता है। इस विषय में यह श्लोक है —',
        'Dear one, whoever knows that shadowless, bodiless, colourless, pure Imperishable attains the supreme Imperishable itself. He becomes all-knowing, becomes all. On this there is the verse:'
      ),
      M(
        [
          'विज्ञानात्मा सह देवैश्च सर्वैः प्राणा भूतानि सम्प्रतिष्ठन्ति यत्र।',
          'तदक्षरं वेदयते यस्तु सोम्य स सर्वज्ञः सर्वमेवाविवेशेति॥',
        ],
        'जिसमें विज्ञानात्मा, समस्त देवों (इन्द्रियों), प्राणों और भूतों के साथ प्रतिष्ठित हो जाता है — हे सोम्य! जो उस अक्षर को जानता है, वह सर्वज्ञ होकर सब में प्रविष्ट हो जाता है।',
        'He in whom the knowing self, with all the powers, the breaths and the elements, comes to rest — dear one, whoever knows that Imperishable becomes all-knowing and enters into all.'
      ),
    ],
    // ── Praśna 5 — Meditation on Om ───────────────────────────────────────
    [
      M(
        [
          'अथ हैनं शैब्यः सत्यकामः पप्रच्छ।',
          'स यो ह वै तद्भगवन्मनुष्येषु प्रायणान्तमोङ्कारमभिध्यायीत।',
          'कतमं वाव स तेन लोकं जयतीति॥',
        ],
        'फिर शिबि-पुत्र सत्यकाम ने उनसे पूछा — "भगवन्! मनुष्यों में जो मृत्यु तक ओंकार का ध्यान करता है, वह उससे कौन-सा लोक जीतता है?"',
        'Then Satyakāma son of Śibi asked him: "Sir, among men, one who meditates on Om until death — which world does he win by it?"'
      ),
      M(
        [
          'तस्मै स होवाच।',
          'एतद्वै सत्यकाम परं चापरं च ब्रह्म यदोङ्कारः।',
          'तस्माद्विद्वानेतेनैवायतनेनैकतरमन्वेति॥',
        ],
        'उन्हें ऋषि ने कहा — हे सत्यकाम! जो ओंकार है, वही पर और अपर ब्रह्म है। इसलिए विद्वान् इसी आश्रय से दोनों में से एक को प्राप्त करता है।',
        'He replied: Satyakāma, this Om is both the higher and the lower Brahman. Therefore the wise, by this very support, reaches one or the other.'
      ),
      M(
        [
          'स यद्येकमात्रमभिध्यायीत स तेनैव संवेदितस्तूर्णमेव जगत्यामभिसम्पद्यते।',
          'तमृचो मनुष्यलोकमुपनयन्ते स तत्र तपसा ब्रह्मचर्येण श्रद्धया सम्पन्नो महिमानमनुभवति॥',
        ],
        'यदि वह एक मात्रा (अ) का ध्यान करता है, तो उससे ही प्रबुद्ध होकर शीघ्र ही पृथ्वी पर (मनुष्य-जन्म को) प्राप्त होता है। ऋचाएँ उसे मनुष्यलोक में ले जाती हैं; वहाँ वह तप, ब्रह्मचर्य और श्रद्धा से युक्त होकर महिमा का अनुभव करता है।',
        'If he meditates on one letter (a), enlightened by that alone he quickly attains birth on earth. The Ṛk verses lead him to the world of men; there, endowed with austerity, chastity and faith, he experiences greatness.'
      ),
      M(
        [
          'अथ यदि द्विमात्रेण मनसि सम्पद्यते सोऽन्तरिक्षं यजुर्भिरुन्नीयते सोमलोकम्।',
          'स सोमलोके विभूतिमनुभूय पुनरावर्तते॥',
        ],
        'और यदि दो मात्राओं (अ, उ) से मन में (ध्यान) सिद्ध करता है, तो यजुर्मन्त्र उसे अन्तरिक्ष में सोमलोक तक ले जाते हैं। वह सोमलोक में विभूति का अनुभव करके फिर लौट आता है।',
        'If he attains union in mind through two letters (a, u), the Yajus verses lift him to the mid-region, to the world of the moon. Having enjoyed splendour there, he returns again.'
      ),
      M(
        [
          'यः पुनरेतं त्रिमात्रेणोमित्येतेनैवाक्षरेण परं पुरुषमभिध्यायीत स तेजसि सूर्ये सम्पन्नः।',
          'यथा पादोदरस्त्वचा विनिर्मुच्यत एवं ह वै स पाप्मना विनिर्मुक्तः स सामभिरुन्नीयते ब्रह्मलोकं स एतस्माज्जीवघनात्परात्परं पुरिशयं पुरुषमीक्षते।',
          'तदेतौ श्लोकौ भवतः॥',
        ],
        'किन्तु जो तीन मात्राओं वाले इस "ओम्" अक्षर से परम पुरुष का ध्यान करता है, वह तेजोमय सूर्य में सम्पन्न होता है। जैसे साँप केंचुली से मुक्त हो जाता है, वैसे वह पाप से मुक्त हो जाता है। साम-मन्त्र उसे ब्रह्मलोक में ले जाते हैं। वह इस जीव-समूह (हिरण्यगर्भ) से भी पर, शरीर में शयन करने वाले परम पुरुष को देखता है। इस विषय में ये दो श्लोक हैं —',
        'But he who meditates on the supreme Person with the three-lettered syllable Om is united with the sun\'s light. As a snake is freed of its slough, so is he freed from sin. The Sāma verses lift him to the world of Brahman; from that mass of life (Hiraṇyagarbha) he beholds the Person higher than the highest, dwelling in the body. On this there are two verses:'
      ),
      M(
        [
          'तिस्रो मात्रा मृत्युमत्यः प्रयुक्ता अन्योन्यसक्ता अनविप्रयुक्ताः।',
          'क्रियासु बाह्याभ्यन्तरमध्यमासु सम्यक्प्रयुक्तासु न कम्पते ज्ञः॥',
        ],
        'तीन मात्राएँ (अलग-अलग) मृत्यु के अधीन हैं; किन्तु परस्पर संयुक्त और अविच्छिन्न रूप से प्रयुक्त होने पर, बाह्य (जाग्रत्), आभ्यन्तर (सुषुप्ति) और मध्यम (स्वप्न) क्रियाओं में सम्यक् प्रयुक्त होने पर, ज्ञानी विचलित नहीं होता।',
        'The three letters, used separately, are subject to death; but joined to one another and not disjoined, rightly applied in the outer, inner and middle states (waking, deep sleep and dream), the knower does not waver.'
      ),
      M(
        [
          'ऋग्भिरेतं यजुर्भिरन्तरिक्षं सामभिर्यत्तत्कवयो वेदयन्ते।',
          'तमोङ्कारेणैवायतनेनान्वेति विद्वान्यत्तच्छान्तमजरममृतमभयं परं चेति॥',
        ],
        'ऋचाओं से इस (मनुष्य) लोक को, यजुष् से अन्तरिक्ष को और साम से उसे (ब्रह्मलोक को) जिसे ज्ञानी जानते हैं (प्राप्त करता है)। विद्वान् ओंकार के ही आश्रय से उसे प्राप्त होता है, जो शान्त, अजर, अमृत, अभय और पर है।',
        'By the Ṛk verses one reaches this world, by the Yajus the mid-region, by the Sāma that which the seers know. By Om alone as his support the wise reaches That which is tranquil, ageless, immortal, fearless and supreme.'
      ),
    ],
    // ── Praśna 6 — The Person of sixteen parts ────────────────────────────
    [
      M(
        [
          'अथ हैनं सुकेशा भारद्वाजः पप्रच्छ।',
          'भगवन्हिरण्यनाभः कौसल्यो राजपुत्रो मामुपेत्यैतं प्रश्नमपृच्छत।',
          'षोडशकलं भारद्वाज पुरुषं वेत्थ।',
          'तमहं कुमारमब्रुवं नाहमिमं वेद यद्यहमिममवेदिषं कथं ते नावक्ष्यमिति समूलो वा एष परिशुष्यति योऽनृतमभिवदति तस्मान्नार्हाम्यनृतं वक्तुम्।',
          'स तूष्णीं रथमारुह्य प्रवव्राज।',
          'तं त्वा पृच्छामि क्वासौ पुरुष इति॥',
        ],
        'फिर भारद्वाज-पुत्र सुकेशा ने उनसे पूछा — "भगवन्! कोसल-देश के राजपुत्र हिरण्यनाभ ने मेरे पास आकर यह प्रश्न किया — \'भारद्वाज! क्या तू सोलह कलाओं वाले पुरुष को जानता है?\' मैंने उस कुमार से कहा — \'मैं इसे नहीं जानता। यदि जानता होता तो तुझे क्यों न बताता? जो असत्य बोलता है, वह जड़ से सूख जाता है; इसलिए मैं असत्य नहीं कह सकता।\' वह चुपचाप रथ पर चढ़कर चला गया। वही मैं आपसे पूछता हूँ — वह पुरुष कहाँ है?"',
        'Then Sukeśā son of Bharadvāja asked him: "Sir, Hiraṇyanābha, a prince of Kosala, came to me and asked, \'Bhāradvāja, do you know the Person of sixteen parts?\' I told the youth, \'I do not know him. If I knew, why would I not tell you? One who speaks falsely withers to the root; so I cannot speak untruth.\' He mounted his chariot in silence and went away. Now I ask you: where is that Person?"'
      ),
      M(
        [
          'तस्मै स होवाच।',
          'इहैवान्तःशरीरे सोम्य स पुरुषो यस्मिन्नेताः षोडश कलाः प्रभवन्तीति॥',
        ],
        'उन्हें ऋषि ने कहा — हे सोम्य! यहीं, इस शरीर के भीतर वह पुरुष है, जिसमें ये सोलह कलाएँ उत्पन्न होती हैं।',
        'He replied: Here, dear one, within this very body is that Person in whom these sixteen parts arise.'
      ),
      M(
        [
          'स ईक्षाञ्चक्रे।',
          'कस्मिन्नहमुत्क्रान्त उत्क्रान्तो भविष्यामि कस्मिन्वा प्रतिष्ठिते प्रतिष्ठास्यामीति॥',
        ],
        'उसने विचार किया — "किसके निकल जाने पर मैं निकला हुआ हो जाऊँगा? और किसके ठहरने पर मैं ठहरा रहूँगा?"',
        'He reflected: "With whose departure shall I have departed? With whose staying shall I stay?"'
      ),
      M(
        [
          'स प्राणमसृजत प्राणाच्छ्रद्धां खं वायुर्ज्योतिरापः पृथिवीन्द्रियं मनः।',
          'अन्नमन्नाद्वीर्यं तपो मन्त्राः कर्म लोका लोकेषु च नाम च॥',
        ],
        'उसने प्राण को रचा; प्राण से श्रद्धा, आकाश, वायु, तेज, जल, पृथ्वी, इन्द्रिय, मन और अन्न; अन्न से वीर्य, तप, मन्त्र, कर्म, लोक और लोकों में नाम।',
        'He created Prāṇa; from Prāṇa faith, space, air, fire, water, earth, the senses, mind and food; from food strength, austerity, the mantras, action, the worlds, and in the worlds, name.'
      ),
      M(
        [
          'स यथेमा नद्यः स्यन्दमानाः समुद्रायणाः समुद्रं प्राप्यास्तं गच्छन्ति भिद्येते तासां नामरूपे समुद्र इत्येवं प्रोच्यते।',
          'एवमेवास्य परिद्रष्टुरिमाः षोडश कलाः पुरुषायणाः पुरुषं प्राप्यास्तं गच्छन्ति भिद्येते चासां नामरूपे पुरुष इत्येवं प्रोच्यते स एषोऽकलोऽमृतो भवति।',
          'तदेष श्लोकः॥',
        ],
        'जैसे समुद्र की ओर बहती ये नदियाँ समुद्र में पहुँचकर अस्त हो जाती हैं, उनके नाम-रूप नष्ट हो जाते हैं और "समुद्र" ही कहा जाता है — वैसे ही इस सर्वद्रष्टा की ये सोलह कलाएँ, पुरुष की ओर जाती हुई, पुरुष को पाकर अस्त हो जाती हैं; उनके नाम-रूप नष्ट हो जाते हैं और "पुरुष" ही कहा जाता है। वह कलारहित और अमर हो जाता है। इस विषय में यह श्लोक है —',
        'As these rivers flowing toward the sea reach the sea and vanish, their names and forms dissolve, and one speaks only of "the sea" — so these sixteen parts of the all-seeing one, tending toward the Person, reach the Person and vanish; their names and forms dissolve, and one speaks only of "the Person." He becomes partless and immortal. On this there is the verse:'
      ),
      M(
        [
          'अरा इव रथनाभौ कला यस्मिन्प्रतिष्ठिताः।',
          'तं वेद्यं पुरुषं वेद यथा मा वो मृत्युः परिव्यथा इति॥',
        ],
        'रथ के पहिये की नाभि में अरों की तरह जिसमें (सोलह) कलाएँ प्रतिष्ठित हैं, उस जानने योग्य पुरुष को जानो, जिससे मृत्यु तुम्हें पीड़ित न करे।',
        'Know that Person who is to be known, in whom the parts are fixed like spokes in the hub of a wheel — so that death may not afflict you.'
      ),
      M(
        [
          'तान्होवाचैतावदेवाहमेतत्परं ब्रह्म वेद।',
          'नातः परमस्तीति॥',
        ],
        'उन (सब शिष्यों) से ऋषि ने कहा — "मैं इस परब्रह्म को इतना ही जानता हूँ। इससे परे कुछ नहीं है।"',
        'He said to them: "Thus far do I know this supreme Brahman. There is nothing beyond it."'
      ),
      M(
        [
          'ते तमर्चयन्तस्त्वं हि नः पिता योऽस्माकमविद्यायाः परं पारं तारयसीति।',
          'नमः परमऋषिभ्यो नमः परमऋषिभ्यः॥',
        ],
        'उन्होंने उनकी पूजा करते हुए कहा — "आप ही हमारे पिता हैं, जो हमें अविद्या के परले पार ले जाते हैं।" परम ऋषियों को नमस्कार, परम ऋषियों को नमस्कार।',
        'Worshipping him they said: "You indeed are our father, who carries us across to the far shore beyond ignorance." Salutation to the supreme sages; salutation to the supreme sages.'
      ),
    ],
  ],
};

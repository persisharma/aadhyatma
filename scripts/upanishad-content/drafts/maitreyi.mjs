/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Maitreyī — Sāmaveda, Saṃnyāsa group. Three adhyāyas, cited adhyāya.mantra:
 * (1) King Bṛhadratha's renunciation and Śākāyanya's verses on the mind as
 * saṃsāra and the Lord in the heart-lotus; (2) Maitreya on Kailāsa and
 * Mahādeva's teaching — the body as temple, the true bath, purity, alms,
 * twilight worship and renunciation; (3) the "I am" verses of self-realisation.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'maitreyi',
  muktika: 29,
  vedaHi: 'सामवेद',
  vedaEn: 'Samaveda',
  source: {
    baseText:
      'Maitreyī Upaniṣad (Sāmaveda) in three adhyāyas, as printed in the Adyar Library "Saṃnyāsa Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Saṃnyāsa Upaniṣads (ed. F. Otto Schrader, 1912); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/maitreyi.html',
      'https://www.wisdomlib.org/hinduism/book/maitreya-upanishad',
      'https://archive.org/details/SamnyasaUpanishads',
    ],
    notes:
      'Three adhyāyas of 17 · 30 · 25 = 72 mantras, cited adhyāya.mantra. Adhyāya 1: three prose paragraphs (Bṛhadratha’s renunciation; his lament over the body; Śākāyanya’s reply) followed by fourteen verses, several shared with the Maitrāyaṇī (6.34) — चित्तमेव हि संसारः and the rest. Adhyāya 2: Maitreya’s question on Kailāsa, then Mahādeva’s verses (देहो देवालयः प्रोक्तः …, the four स्पृष्ट्वा स्नानं विधीयते verses, true śauca, bhikṣā, the two twilights, saṃnyāsa, and the closing verses on inner worship). Adhyāya 3: the अहमस्मि परश्चास्मि … self-realisation verses and the phalaśruti. The Sāmavedic śānti-pāṭha (आप्यायन्तु ममाङ्गानि) is page 1; the commentator’s invocatory verse printed before it is not included. Known variants: 1.5 ह्यात्मापत्त्या निवर्तते (the Maitrāyaṇī reads यं प्राप्य न निवर्तते), 1.7 सत्यकामिनः / सत्यगामिनः, 2.4 भैक्षम् / भैक्ष्यम्, 3.23 सन्मात्रान्नास्म्यहम्. The printed mantra numbering in adhyāya 1 (whether the prose is counted as three or four paragraphs) and in adhyāya 2 differs between prints, so the counts here should be confirmed against the scan. The network policy blocks the Sanskrit source hosts, so the Devanagari was authored from memory of the printed text — a line-by-line scan check against the printed edition is still owed, and it should START with the passages flagged as least certain: the prose of 1.2 and 1.3 (the Maitreyī’s condensed form of the Maitrāyaṇī 1.2–2.1 narrative), the third line of 2.4, the order of 2.12–2.17, a possibly omitted verse in adhyāya 2 on the mendicant’s mādhūkara alms (after 2.22), and the wording of 3.5, 3.16, 3.17, 3.23 and the closing 3.25.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    [
      'ॐ आप्यायन्तु ममाङ्गानि वाक्प्राणश्चक्षुः श्रोत्रमथो बलमिन्द्रियाणि च सर्वाणि।',
      'सर्वं ब्रह्मौपनिषदं माहं ब्रह्म निराकुर्यां मा मा ब्रह्म निराकरोदनिराकरणमस्त्वनिराकरणं मेऽस्तु।',
      'तदात्मनि निरते य उपनिषत्सु धर्मास्ते मयि सन्तु ते मयि सन्तु॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    'मेरे अंग, वाणी, प्राण, नेत्र, श्रोत्र, बल और समस्त इन्द्रियाँ पुष्ट हों। यह सब उपनिषद्-प्रतिपादित ब्रह्म ही है। मैं ब्रह्म का निराकरण न करूँ, न ब्रह्म मेरा निराकरण करे। निराकरण न हो; मेरा निराकरण न हो। आत्मा में निरत मुझमें उपनिषदों में कहे हुए धर्म स्थित हों, वे मुझमें स्थित हों। ॐ शान्तिः शान्तिः शान्तिः।',
    'May my limbs, speech, breath, eye, ear, strength and all my senses grow strong. All this is the Brahman of the Upaniṣads. May I never deny Brahman, nor Brahman deny me. Let there be no denial — no denial of me. May the virtues the Upaniṣads speak of abide in me, devoted to the Self; may they abide in me. Om, peace, peace, peace.'
  ),
  khandas: [
    // ── Adhyāya 1 — Bṛhadratha and Śākāyanya ──────────────────────────────
    [
      M(
        [
          'बृहद्रथो वै नाम राजा राज्ये ज्येष्ठं पुत्रं निधापयित्वेदमशाश्वतं मन्यमानः शारीरं वैराग्यमुपेतोऽरण्यं निर्जगाम।',
          'स तत्र परमं तप आस्थायादित्यमीक्षमाण ऊर्ध्वबाहुस्तिष्ठति।',
          'अन्ते सहस्राहस्य मुनिरन्तिकमाजगामाग्निरिवाधूमकस्तेजसा निर्दहन्निवात्मविद्भगवाञ्छाकायन्यः।',
          'उत्तिष्ठोत्तिष्ठ वरं वृणीष्वेति राजानमब्रवीत्।',
          'स तस्मै नमस्कृत्योवाच भगवन्नाहमात्मवित्त्वं तत्त्वविच्छुश्रुमो वयं स त्वं नो ब्रूहीति।',
          'एतद्वृत्तं पुरस्तादशक्यं मा पृच्छ प्रश्नमैक्ष्वाकान्यान्कामान्वृणीष्वेति।',
          'शाकायन्यस्य चरणावभिमृश्यमानो राजेमां गाथां जगाद॥',
        ],
        'बृहद्रथ नाम के एक राजा थे। वे अपने ज्येष्ठ पुत्र को राज्य पर प्रतिष्ठित करके, इस शरीर को अनित्य मानते हुए, वैराग्य को प्राप्त होकर वन को चले गए। वहाँ वे परम तप का आश्रय लेकर, सूर्य की ओर देखते हुए, भुजाएँ ऊपर उठाए खड़े रहते थे। एक सहस्र दिन बीतने पर धूमरहित अग्नि के समान, मानो अपने तेज से जलाते हुए, आत्मज्ञानी भगवान् शाकायन्य मुनि उनके पास आए और राजा से बोले — "उठो, उठो, वर माँगो।" राजा ने उन्हें नमस्कार करके कहा — "भगवन्! मैं आत्मज्ञानी नहीं हूँ; आप तत्त्वज्ञानी हैं, ऐसा हमने सुना है; अतः आप हमें (आत्मतत्त्व) बताइए।" (मुनि ने कहा —) "यह विषय पहले से ही कठिन माना गया है; हे इक्ष्वाकुवंशी! यह प्रश्न मत पूछो, अन्य कामनाएँ माँग लो।" तब शाकायन्य के चरणों का स्पर्श करते हुए राजा ने यह गाथा कही।',
        'There was a king named Bṛhadratha. Having established his eldest son on the throne, and regarding this body as impermanent, he attained dispassion and went forth into the forest. There, taking up the highest austerity, he stood with arms raised, gazing at the sun. At the end of a thousand days there came near him the sage, the blessed Śākāyanya, knower of the Self, like a fire without smoke, as though burning with his splendour. He said to the king: “Arise, arise, and choose a boon.” The king bowed to him and said: “Revered sir, I am not a knower of the Self. You are a knower of the truth, so we have heard; therefore tell it to us.” “This matter was found hard from of old. Do not ask this question, descendant of Ikṣvāku; choose other desires.” Touching Śākāyanya’s feet, the king spoke this verse:'
      ),
      M(
        [
          'अयं देहो मैथुनादेवोद्भूतः संविदपेतो निरय एव।',
          'मूत्रद्वारेण निष्क्रान्तोऽस्थिभिश्चितो मांसेनानुलिप्तश्चर्मणावबद्धो विण्मूत्रवातपित्तकफमज्जामेदोवसाभिरन्यैश्च मलैर्बहुभिः परिपूर्णः।',
          'एतादृशे शरीरे वर्तमानस्य भगवंस्त्वं नो गतिरिति॥',
        ],
        '"यह देह मैथुन से ही उत्पन्न हुआ है, चेतना से रहित है, (मानो) नरक ही है। यह मूत्र-मार्ग से निकला है, हड्डियों से चिना हुआ, मांस से लिपा हुआ और चमड़े से बँधा हुआ है; यह विष्ठा, मूत्र, वात, पित्त, कफ, मज्जा, मेद, वसा तथा अन्य बहुत-से मलों से भरा हुआ है। भगवन्! ऐसे शरीर में रहने वाले मेरे लिए आप ही गति (शरण) हैं।"',
        '“This body has arisen from sexual union alone; it is devoid of awareness; it is a very hell. It came forth by the urinary passage; it is built up with bones, plastered with flesh, bound with skin, and filled with faeces, urine, wind, bile, phlegm, marrow, fat, grease and many other impurities. For one dwelling in such a body, revered sir, you are our refuge.”'
      ),
      M(
        [
          'अथ भगवाञ्छाकायन्यः सुप्रीतोऽब्रवीद्राजानं महाराज बृहद्रथेक्ष्वाकुवंशध्वजशीर्षात्मज्ञः कृतकृत्यस्त्वं मरुन्नाम्नो विश्रुतोऽसीति॥',
        ],
        'तब भगवान् शाकायन्य ने अत्यन्त प्रसन्न होकर राजा से कहा — "महाराज बृहद्रथ! इक्ष्वाकुवंश की ध्वजा के शिखररूप! तुम शीघ्र ही आत्मज्ञ और कृतकृत्य होगे; तुम \'मरुत्\' नाम से विख्यात हो।"',
        'Then the blessed Śākāyanya, well pleased, said to the king: “Great King Bṛhadratha, banner-crest of the Ikṣvāku line, you will soon know the Self and have done all that is to be done; you are renowned by the name Marut.”'
      ),
      M(
        ['शब्दस्पर्शमया येऽर्था अनर्था इव ते स्थिताः।', 'येषां सक्तस्तु भूतात्मा न स्मरेच्च परं पदम्॥'],
        'शब्द, स्पर्श आदि से बने हुए जो विषय हैं, वे अनर्थ के समान ही स्थित हैं; उनमें आसक्त हुआ भूतात्मा परम पद का स्मरण नहीं करता।',
        'The objects made of sound, touch and the rest stand as though they were mere misfortunes; the elemental self attached to them does not remember the supreme state.'
      ),
      M(
        ['तपसा प्राप्यते सत्त्वं सत्त्वात्सम्प्राप्यते मनः।', 'मनसा प्राप्यते ह्यात्मा ह्यात्मापत्त्या निवर्तते॥'],
        'तप से सत्त्व (शुद्धि) प्राप्त होता है, सत्त्व से (एकाग्र) मन प्राप्त होता है, मन से आत्मा प्राप्त होता है; और आत्मा की प्राप्ति से (जीव संसार से) निवृत्त हो जाता है।',
        'By austerity purity is gained; from purity the mind is gained; by the mind the Self is attained; and by attaining the Self one turns back (from saṃsāra).'
      ),
      M(
        ['यथा निरिन्धनो वह्निः स्वयोनावुपशाम्यति।', 'तथा वृत्तिक्षयाच्चित्तं स्वयोनावुपशाम्यति॥'],
        'जैसे ईंधन-रहित अग्नि अपने कारण में शान्त हो जाती है, वैसे ही वृत्तियों के क्षय से चित्त अपने कारण में शान्त हो जाता है।',
        'As a fire without fuel dies down into its own source, so the mind, when its modifications are spent, dies down into its own source.'
      ),
      M(
        ['स्वयोनावुपशान्तस्य मनसः सत्यकामिनः।', 'इन्द्रियार्थविमूढस्यानृताः कर्मवशानुगाः॥'],
        'जो मन अपने कारण में शान्त हो गया है और सत्य की कामना करता है, उसके लिए — इन्द्रियों के विषयों से मोहित होने पर (जो प्रतीत होते थे) — कर्म के वश चलने वाले (भोग) असत्य हो जाते हैं।',
        'For the mind that has come to rest in its own source and longs for the real, the things that follow the sway of karma — which deluded it through the objects of the senses — are seen to be unreal.'
      ),
      M(
        ['चित्तमेव हि संसारस्तत्प्रयत्नेन शोधयेत्।', 'यच्चित्तस्तन्मयो भवति गुह्यमेतत्सनातनम्॥'],
        'चित्त ही संसार है; अतः उसे प्रयत्नपूर्वक शुद्ध करना चाहिए। जैसा चित्त होता है, मनुष्य वैसा ही हो जाता है — यह सनातन रहस्य है।',
        'The mind alone is saṃsāra; therefore one should purify it with effort. What one’s mind is, that one becomes — this is the eternal secret.'
      ),
      M(
        ['चित्तस्य हि प्रसादेन हन्ति कर्म शुभाशुभम्।', 'प्रसन्नात्मात्मनि स्थित्वा सुखमव्ययमश्नुते॥'],
        'चित्त की प्रसन्नता (निर्मलता) से मनुष्य शुभ और अशुभ कर्मों को नष्ट कर देता है; प्रसन्नचित्त होकर आत्मा में स्थित रहने वाला अविनाशी सुख को प्राप्त करता है।',
        'By the serenity of the mind one destroys deeds both good and bad; serene of soul, abiding in the Self, one enjoys imperishable happiness.'
      ),
      M(
        ['समासक्तं यदा चित्तं जन्तोर्विषयगोचरे।', 'यद्येवं ब्रह्मणि स्यात्तत्को न मुच्येत बन्धनात्॥'],
        'प्राणी का चित्त जितना विषयों के क्षेत्र में आसक्त रहता है, यदि उतना ही ब्रह्म में लगा रहे, तो कौन बन्धन से मुक्त न हो जाए?',
        'If a creature’s mind were as attached to Brahman as it is to the realm of sense-objects, who would not be freed from bondage?'
      ),
      M(
        ['हृत्पुण्डरीकमध्ये तु भावयेत्परमेश्वरम्।', 'साक्षिणं बुद्धिवृत्तस्य परमप्रेमगोचरम्॥'],
        'हृदय-कमल के मध्य में परमेश्वर का ध्यान करना चाहिए — जो बुद्धि की वृत्तियों का साक्षी है और परम प्रेम का विषय है।',
        'In the midst of the heart-lotus one should contemplate the Supreme Lord — the witness of the workings of the intellect, the object of supreme love.'
      ),
      M(
        ['अगोचरं मनोवाचामवधूतादिसम्प्लवम्।', 'सत्तामात्रप्रकाशैकप्रकाशं भावनातिगम्॥'],
        'जो मन और वाणी का विषय नहीं है, जिसने आदि (उत्पत्ति) और प्रलय को झाड़ दिया है, जो केवल सत्तामात्र प्रकाश से ही प्रकाशित है और भावना (कल्पना) से परे है।',
        'Beyond the reach of mind and speech, having shaken off origin and dissolution; the one light that is the light of pure being; transcending all imagining.'
      ),
      M(
        [
          'अहेयमनुपादेयमसामान्यविशेषणम्।',
          'ध्रुवं स्तिमितगम्भीरं न तेजो न तमस्ततम्।',
          'निर्विकल्पं निराभासं निर्वाणमयसंविदम्॥',
        ],
        'जो न त्यागने योग्य है, न ग्रहण करने योग्य; जो सामान्य और विशेष से रहित है; जो ध्रुव, निश्चल और गम्भीर है; जो न तेज है, न अन्धकार, (फिर भी सर्वत्र) व्याप्त है; जो निर्विकल्प, आभास-रहित और निर्वाणमय चेतना है।',
        'Not to be rejected, not to be grasped, without generic or specific marks; steadfast, still and deep; neither light nor darkness, yet all-pervading; free of distinctions, free of appearance, awareness that is pure extinction (nirvāṇa).'
      ),
      M(
        [
          'नित्यः शुद्धो बुद्धमुक्तस्वभावः सत्यः सूक्ष्मः सम्विभुश्चाद्वितीयः।',
          'आनन्दाब्धिर्यः परः सोऽहमस्मि प्रत्यग्धातुर्नात्र संशीतिरस्ति॥',
        ],
        'जो नित्य, शुद्ध, बुद्ध और मुक्त-स्वभाव है; सत्य, सूक्ष्म, सर्वव्यापक और अद्वितीय है; जो आनन्द का सागर और परम है — वही मैं हूँ, अन्तरात्मा-स्वरूप; इसमें कोई संशय नहीं है।',
        'Eternal, pure, by nature awake and free, true, subtle, all-pervading and without a second, the ocean of bliss, the Supreme — that am I, the inmost essence; of this there is no doubt.'
      ),
      M(
        [
          'आनन्दमन्तर्निजमाश्रयं तमाशापिशाचीमवमानयन्तम्।',
          'आलोकयन्तं जगदिन्द्रजालमापत्कथं मां प्रविशेदसङ्गम्॥',
        ],
        'जो अपने भीतर के आनन्द का आश्रय लिए हुए है, जो आशारूपी पिशाचिनी का तिरस्कार करता है और जगत् को इन्द्रजाल के समान देखता है — ऐसे असंग मुझमें विपत्ति कैसे प्रवेश कर सकती है?',
        'Resting in the bliss within, my very own, spurning the demoness of craving, beholding the world as a conjurer’s illusion — how can misfortune enter me, the unattached?'
      ),
      M(
        [
          'वर्णाश्रमाचारयुता विमूढाः कर्मानुसारेण फलं लभन्ते।',
          'वर्णादिधर्मं हि परित्यजन्तः स्वानन्दतृप्ताः पुरुषा भवन्ति॥',
        ],
        'वर्ण और आश्रम के आचार में बँधे हुए मूढ़ जन कर्म के अनुसार फल पाते हैं; किन्तु वर्ण आदि के धर्म का परित्याग करने वाले पुरुष अपने (आत्म-)आनन्द से तृप्त हो जाते हैं।',
        'The deluded, bound to the conduct of caste and stage of life, reap fruit according to their deeds; but those who give up the dharma of caste and the rest become men satisfied in the bliss of the Self.'
      ),
      M(
        [
          'वर्णाश्रमं सावयवं स्वरूपमाद्यन्तयुक्तं ह्यतिकृच्छ्रमात्रम्।',
          'पुत्रादिदेहेष्वभिमानशून्यं भूत्वा वसेत्सौख्यतमे ह्यनन्ते॥',
        ],
        'वर्ण और आश्रम अवयवों वाले (देह से जुड़े) रूप हैं, आदि और अन्त से युक्त हैं और केवल अत्यन्त कष्टरूप हैं। अतः पुत्र आदि तथा देहों में अभिमान से रहित होकर परम सुखमय अनन्त (आत्मा) में निवास करे।',
        'Caste and stage of life belong to a form made of parts, having beginning and end, nothing but great hardship. Becoming free of the sense of “mine” in sons and bodies, one should dwell in the infinite, the most blissful.'
      ),
    ],
    // ── Adhyāya 2 — Maitreya on Kailāsa; Mahādeva’s teaching ─────────────
    [
      M(
        [
          'अथ भगवान्मैत्रेयः कैलासं जगाम तं गत्वोवाच भो भगवन्परमतत्त्वरहस्यमनुब्रूहीति।',
          'स होवाच महादेवः॥',
        ],
        'तब भगवान् मैत्रेय कैलास गए और वहाँ पहुँचकर बोले — "हे भगवन्! मुझे परम तत्त्व का रहस्य बताइए।" तब महादेव ने कहा —',
        'Then the blessed Maitreya went to Kailāsa, and having gone there he said: “O Lord, teach me the secret of the supreme truth.” Mahādeva said:'
      ),
      M(
        ['देहो देवालयः प्रोक्तः स जीवः केवलः शिवः।', 'त्यजेदज्ञाननिर्माल्यं सोऽहंभावेन पूजयेत्॥'],
        'देह को देवालय (मन्दिर) कहा गया है और उसमें रहने वाला जीव केवल (शुद्ध) शिव है। अज्ञानरूपी निर्माल्य (बासी पूजा-सामग्री) का त्याग करे और "वह मैं हूँ" (सोऽहम्) इस भाव से पूजा करे।',
        'The body is called the temple, and the jīva within it is Śiva alone. One should cast away ignorance like faded offerings, and worship with the thought “He am I”.'
      ),
      M(
        ['अभेददर्शनं ज्ञानं ध्यानं निर्विषयं मनः।', 'स्नानं मनोमलत्यागः शौचमिन्द्रियनिग्रहः॥'],
        'अभेद का दर्शन ही ज्ञान है, विषयों से रहित मन ही ध्यान है, मन के मल का त्याग ही स्नान है और इन्द्रियों का निग्रह ही शौच (पवित्रता) है।',
        'Seeing non-difference is knowledge; a mind free of objects is meditation; casting off the mind’s impurity is bathing; restraint of the senses is purity.'
      ),
      M(
        [
          'ब्रह्मामृतं पिबेद्भैक्षमाचरेद्देहरक्षणे।',
          'वसेदेकान्तिको भूत्वा चैकान्ते द्वैतवर्जिते।',
          'इत्येवमाचरेद्धीमान्स एवं मुक्तिमाप्नुयात्॥',
        ],
        'ब्रह्मरूपी अमृत का पान करे; केवल देह की रक्षा के लिए भिक्षा करे; एकान्तप्रेमी होकर द्वैत से रहित एकान्त में निवास करे। बुद्धिमान् इस प्रकार आचरण करे — ऐसा करने वाला मुक्ति को प्राप्त करता है।',
        'Let him drink the nectar of Brahman; let him beg alms only to sustain the body; let him dwell alone, in a solitude free of duality. The wise one who lives thus attains liberation.'
      ),
      M(
        ['जातं मृतमिदं देहं मातापितृमलात्मकम्।', 'सुखदुःखालयामेध्यं स्पृष्ट्वा स्नानं विधीयते॥'],
        'यह देह जन्म लेता और मरता है, माता-पिता के मल से बना है, सुख-दुःख का घर और अपवित्र है — इसका स्पर्श होने पर (ज्ञानरूपी) स्नान का विधान है।',
        'This body is born and dies; it is made of the impurities of mother and father; it is the abode of pleasure and pain, and unclean — having touched it, one is enjoined to bathe.'
      ),
      M(
        ['धातुबद्धं महारोगं पापमन्दिरमध्रुवम्।', 'विकाराकारविस्तीर्णं स्पृष्ट्वा स्नानं विधीयते॥'],
        'यह (देह) धातुओं से बँधा, महान् रोगरूप, पाप का मन्दिर और अस्थिर है, विकारों के आकार में फैला हुआ है — इसका स्पर्श होने पर स्नान का विधान है।',
        'Bound together by the bodily elements, a great disease, a temple of sin, unstable, spread out in the shapes of change — having touched it, one is enjoined to bathe.'
      ),
      M(
        ['नवद्वारमलस्रावं सदाकाले स्वभावजम्।', 'दुर्गन्धं दुर्मलोपेतं स्पृष्ट्वा स्नानं विधीयते॥'],
        'इसके नौ द्वारों से स्वभाव से ही सदा मल बहता रहता है; यह दुर्गन्धयुक्त और घृणित मल से भरा है — इसका स्पर्श होने पर स्नान का विधान है।',
        'From its nine gates filth flows at all times by its very nature; it is foul-smelling and full of loathsome filth — having touched it, one is enjoined to bathe.'
      ),
      M(
        ['मातृसूतकसम्बन्धं सूतके सह जायते।', 'मृतसूतकजं देहं स्पृष्ट्वा स्नानं विधीयते॥'],
        'यह माता के सूतक (जन्म-अशौच) से सम्बद्ध है, सूतक के साथ ही जन्म लेता है और मृत्यु के सूतक से भी युक्त होता है — ऐसे देह का स्पर्श होने पर स्नान का विधान है।',
        'It is bound up with the mother’s impurity of childbirth, it is born together with that impurity, and it ends in the impurity of death — having touched such a body, one is enjoined to bathe.'
      ),
      M(
        ['अहंममेति विण्मूत्रलेपगन्धादिमोचनम्।', 'शुद्धशौचमिति प्रोक्तं मृज्जलाभ्यां तु लौकिकम्॥'],
        '"मैं" और "मेरा" — इस (अभिमान) रूपी विष्ठा-मूत्र के लेप और गन्ध आदि को छुड़ाना ही शुद्ध शौच कहा गया है; मिट्टी और जल से किया जाने वाला शौच तो लौकिक है।',
        'Washing away the smear and stench of the filth called “I” and “mine” is declared true purity; purification with earth and water is merely worldly.'
      ),
      M(
        ['चित्तशुद्धिकरं शौचं वासनात्रयनाशनम्।', 'ज्ञानवैराग्यमृत्तोयैः क्षालनाच्छौचमुच्यते॥'],
        'जो शौच चित्त को शुद्ध करता है और (लोक, शास्त्र और देह की) तीनों वासनाओं का नाश करता है, ज्ञान और वैराग्यरूपी मिट्टी और जल से धोने के कारण उसे (सच्चा) शौच कहा जाता है।',
        'The purity that cleanses the mind and destroys the three kinds of latent craving is called purity because one is washed with the earth and water of knowledge and dispassion.'
      ),
      M(
        ['अद्वैतभावनाभैक्षमभक्ष्यं द्वैतभावनम्।', 'गुरुशास्त्रोक्तभावेन भिक्षोर्भैक्षं विधीयते॥'],
        'अद्वैत की भावना ही (सच्ची) भिक्षा है; द्वैत की भावना अभक्ष्य (न खाने योग्य) है। गुरु और शास्त्र द्वारा बताए गए भाव से भिक्षु के लिए भिक्षा का विधान है।',
        'The contemplation of non-duality is the true alms; the contemplation of duality is forbidden food. For the mendicant, alms are enjoined in the spirit taught by the guru and the scriptures.'
      ),
      M(
        ['विद्वान्स्वदेशमुत्सृज्य संन्यासानन्तरं स्वतः।', 'कारागारविनिर्मुक्तचोरवद्दूरतो वसेत्॥'],
        'संन्यास लेने के बाद विद्वान् स्वयं अपने देश को छोड़कर, कारागार से छूटे हुए चोर के समान, (परिचितों से) दूर जाकर रहे।',
        'After renunciation, the wise one should of his own accord leave his homeland and live far away, like a thief released from prison.'
      ),
      M(
        ['अहंकारसुतं वित्तभ्रातरं मोहमन्दिरम्।', 'आशापत्नीं त्यजेद्यावत्तावन्मुक्तो न संशयः॥'],
        'जब (मनुष्य) अहंकाररूपी पुत्र, धनरूपी भाई, मोहरूपी घर और आशारूपी पत्नी का त्याग कर देता है, तभी वह मुक्त है — इसमें संशय नहीं।',
        'When one gives up the son that is ego, the brother that is wealth, the house that is delusion and the wife that is craving, one is free — there is no doubt.'
      ),
      M(
        ['मृता मोहमयी माता जातो बोधमयः सुतः।', 'सूतकद्वयसम्प्राप्तौ कथं संध्यामुपास्महे॥'],
        'मोहरूपी माता मर गई और ज्ञानरूपी पुत्र का जन्म हुआ; इस प्रकार (मरण और जन्म के) दोनों सूतक लग जाने पर हम संध्या-उपासना कैसे करें?',
        'Delusion, my mother, has died; awakening, my son, is born. With both these impurities upon me, how shall I perform the twilight worship?'
      ),
      M(
        ['हृदाकाशे चिदादित्यः सदा भासति भासति।', 'नास्तमेति न चोदेति कथं संध्यामुपास्महे॥'],
        'हृदय-आकाश में चैतन्यरूपी सूर्य सदा प्रकाशित रहता है, प्रकाशित रहता है; वह न अस्त होता है, न उदय होता है — (फिर) हम संध्या-उपासना कैसे करें?',
        'In the space of the heart the sun of consciousness ever shines, ever shines; it neither sets nor rises — how then shall I perform the twilight worship?'
      ),
      M(
        ['एकमेवाद्वितीयं यद्गुरोर्वाक्येन निश्चितम्।', 'एतदेकान्तमित्युक्तं न मठो न वनान्तरम्॥'],
        'गुरु के वचन से जो "एक ही, अद्वितीय" (तत्त्व) निश्चित हुआ है, उसी को एकान्त कहा गया है; मठ या वन का भीतरी भाग एकान्त नहीं है।',
        'That which is ascertained through the guru’s word as “one only, without a second” — that is called solitude; not a monastery, not the depths of a forest.'
      ),
      M(
        ['असंशयवतां मुक्तिः संशयाविष्टचेतसाम्।', 'न मुक्तिर्जन्मजन्मान्ते तस्माद्विश्वासमाप्नुयात्॥'],
        'संशयरहित लोगों की मुक्ति होती है; जिनका चित्त संशय से ग्रस्त है, उनकी अनेक जन्मों के बाद भी मुक्ति नहीं होती। इसलिए (गुरु और शास्त्र में) विश्वास प्राप्त करना चाहिए।',
        'Liberation belongs to those free of doubt; for those whose minds are possessed by doubt there is no liberation even after birth upon birth. Therefore one should gain firm faith.'
      ),
      M(
        ['कर्मत्यागान्न संन्यासो न प्रैषोच्चारणेन तु।', 'संधौ जीवात्मनोरैक्यं संन्यासः परिकीर्तितः॥'],
        'कर्मों के त्याग मात्र से संन्यास नहीं होता, न प्रैष-मन्त्र के उच्चारण से; जीव और परमात्मा की एकता (के ज्ञान) को ही संन्यास कहा गया है।',
        'Renunciation is not the mere giving up of rites, nor the uttering of the praiṣa formula; the union of the jīva and the Self is what is proclaimed as renunciation.'
      ),
      M(
        ['वमनाहारवद्यस्य भाति सर्वेषणादिषु।', 'तस्याधिकारः संन्यासे त्यक्तदेहाभिमानिनः॥'],
        'जिसे सभी एषणाओं (पुत्र, धन और लोक की कामनाओं) आदि में वमन किए हुए भोजन के समान (घृणा) प्रतीत होती है, देहाभिमान को त्याग चुके उसी पुरुष का संन्यास में अधिकार है।',
        'He to whom all cravings and the like appear as food that has been vomited, who has abandoned identification with the body — he alone is fit for renunciation.'
      ),
      M(
        ['यदा मनसि वैराग्यं जातं सर्वेषु वस्तुषु।', 'तदैव संन्यसेद्विद्वानन्यथा पतितो भवेत्॥'],
        'जब मन में सभी वस्तुओं के प्रति वैराग्य उत्पन्न हो जाए, तभी विद्वान् संन्यास ले; अन्यथा वह पतित हो जाता है।',
        'When dispassion towards all things has arisen in the mind, then alone should the wise one renounce; otherwise he becomes fallen.'
      ),
      M(
        ['द्रव्यार्थमन्नवस्त्रार्थं यः प्रतिष्ठार्थमेव वा।', 'संन्यसेदुभयभ्रष्टः स मुक्तिं नाप्तुमर्हति॥'],
        'जो धन के लिए, अन्न और वस्त्र के लिए, अथवा प्रतिष्ठा के लिए ही संन्यास लेता है, वह दोनों (लोकों) से भ्रष्ट हो जाता है और मुक्ति पाने योग्य नहीं होता।',
        'He who renounces for the sake of wealth, for food and clothing, or merely for reputation, falls from both (worlds) and is not fit to attain liberation.'
      ),
      M(
        ['उत्तमा तत्त्वचिन्तैव मध्यमं शास्त्रचिन्तनम्।', 'अधमा मन्त्रचिन्ता च तीर्थभ्रान्त्यधमाधमा॥'],
        'तत्त्व का चिन्तन ही उत्तम है, शास्त्र का चिन्तन मध्यम है, मन्त्र का चिन्तन अधम है और तीर्थों में भटकना अधम से भी अधम है।',
        'Contemplation of the Real is the highest; reflection on scripture is middling; dwelling on mantras is low; and wandering among pilgrim places is the lowest of the low.'
      ),
      M(
        ['अनुभूतिं विना मूढो वृथा ब्रह्मणि मोदते।', 'प्रतिबिम्बितशाखाग्रफलास्वादनमोदवत्॥'],
        'अनुभूति के बिना मूढ़ व्यक्ति ब्रह्म में व्यर्थ ही आनन्द मानता है — जैसे (जल में) प्रतिबिम्बित शाखा के अग्रभाग पर लगे फल के स्वाद का आनन्द।',
        'Without direct experience the deluded man rejoices in Brahman in vain — like the joy of tasting a fruit on the tip of a branch reflected (in water).'
      ),
      M(
        ['धनवृद्धा वयोवृद्धा विद्यावृद्धास्तथैव च।', 'ते सर्वे ज्ञानवृद्धस्य किंकराः शिष्यकिंकराः॥'],
        'धन में बड़े, आयु में बड़े और विद्या में बड़े — वे सभी ज्ञान में बड़े (पुरुष) के सेवक हैं, उसके शिष्यों के भी सेवक हैं।',
        'Those great in wealth, great in years, and likewise great in learning — all of them are servants of one great in wisdom, servants even of his disciples.'
      ),
      M(
        [
          'यन्मायया मोहितचेतसो मामात्मानमापूर्णमलब्धवन्तः।',
          'परं विदग्धोदरपूरणाय भ्रमन्ति काका इव सूरयोऽपि॥',
        ],
        'जिसकी माया से मोहित चित्त वाले लोग मुझ परिपूर्ण आत्मा को न पाकर, विद्वान् होते हुए भी, केवल अपना जलता हुआ पेट भरने के लिए कौओं की भाँति भटकते रहते हैं।',
        'Their minds deluded by (my) māyā, not having found Me, the all-full Self, even the learned wander about like crows, only to fill their burning bellies.'
      ),
      M(
        [
          'पाषाणलोहमणिमृण्मयविग्रहेषु पूजा पुनर्जननभोगकरी मुमुक्षोः।',
          'तस्माद्यतिः स्वहृदयार्चनमेव कुर्याद्बाह्यार्चनं परिहरेदपुनर्भवाय॥',
        ],
        'पत्थर, लोहे, मणि और मिट्टी की मूर्तियों में की गई पूजा मुमुक्षु के लिए पुनर्जन्म और भोग देने वाली होती है। इसलिए संन्यासी अपने हृदय में ही (आत्मा की) अर्चना करे और पुनर्जन्म से छूटने के लिए बाहरी पूजा का परित्याग करे।',
        'For one seeking liberation, worship of images of stone, metal, gem or clay yields rebirth and enjoyment. Therefore the ascetic should worship only in his own heart, and give up outer worship so as not to be born again.'
      ),
      M(
        ['अन्तः पूर्णो बहिः पूर्णः पूर्णकुम्भ इवार्णवे।', 'अन्तः शून्यो बहिः शून्यः शून्यकुम्भ इवाम्बरे॥'],
        '(ज्ञानी) समुद्र में रखे भरे घड़े के समान भीतर से भी पूर्ण है और बाहर से भी पूर्ण; आकाश में रखे खाली घड़े के समान भीतर से भी शून्य है और बाहर से भी शून्य।',
        'Full within and full without, like a full pot in the ocean; empty within and empty without, like an empty pot in the sky.'
      ),
      M(
        ['मा भव ग्राह्यभावात्मा ग्राहकात्मा च मा भव।', 'भावनामखिलां त्यक्त्वा यच्छिष्टं तन्मयो भव॥'],
        'न ग्रहण किए जाने वाले (विषय) के भाव वाले बनो, न ग्रहण करने वाले (ज्ञाता) के भाव वाले बनो; सारी भावना को त्यागकर जो शेष रहता है, उसी में तन्मय हो जाओ।',
        'Be not the self that is the object grasped, nor the self that is the grasper; abandoning all imagining, become one with what remains.'
      ),
      M(
        ['द्रष्टृदर्शनदृश्यानि त्यक्त्वा वासनया सह।', 'दर्शनप्रथमाभासमात्मानं केवलं भज॥'],
        'द्रष्टा, दर्शन और दृश्य — इन तीनों को वासना सहित त्यागकर, दर्शन के प्रथम आभासरूप केवल आत्मा का भजन (अनुभव) करो।',
        'Casting off seer, seeing and seen together with their latent impressions, worship the Self alone, the first glimmer of all seeing.'
      ),
      M(
        ['संशान्तसर्वसंकल्पा या शिलावदवस्थितिः।', 'जाग्रन्निद्राविनिर्मुक्ता सा स्वरूपस्थितिः परा॥'],
        'जिसमें सारे संकल्प पूर्णतः शान्त हो गए हैं, जो शिला के समान (निश्चल) अवस्थिति है और जाग्रत् तथा निद्रा से मुक्त है — वही परम स्वरूप-स्थिति है।',
        'That state in which all intentions are wholly stilled, a steadiness like that of a rock, free from both waking and sleep — that is the supreme abiding in one’s own nature.'
      ),
    ],
    // ── Adhyāya 3 — the “I am” verses ─────────────────────────────────────
    [
      M(
        ['अहमस्मि परश्चास्मि ब्रह्मास्मि प्रभवोऽस्म्यहम्।', 'सर्वलोकगुरुश्चास्मि सर्वलोकेऽस्मि सोऽस्म्यहम्॥'],
        'मैं हूँ, मैं ही पर (परमात्मा) हूँ, मैं ब्रह्म हूँ, मैं ही (सबका) उद्गम हूँ। मैं समस्त लोकों का गुरु हूँ, मैं सब लोकों में हूँ — वह (ब्रह्म) मैं हूँ।',
        'I am; I am the Supreme; I am Brahman; I am the source. I am the teacher of all worlds; I am in all worlds; that am I.'
      ),
      M(
        ['अहमेवास्मि सिद्धोऽस्मि शुद्धोऽस्मि परमोऽस्म्यहम्।', 'अहमस्मि सदा सोऽस्मि नित्योऽस्मि विमलोऽस्म्यहम्॥'],
        'मैं ही हूँ, मैं सिद्ध हूँ, मैं शुद्ध हूँ, मैं परम हूँ। मैं सदा हूँ, वह मैं हूँ, मैं नित्य हूँ, मैं निर्मल हूँ।',
        'I alone am; I am perfect; I am pure; I am the highest. I ever am; that am I; I am eternal; I am stainless.'
      ),
      M(
        ['विज्ञानोऽस्मि विशेषोऽस्मि सोमोऽस्मि सकलोऽस्म्यहम्।', 'शुभोऽस्मि शोकहीनोऽस्मि चैतन्योऽस्मि समोऽस्म्यहम्॥'],
        'मैं विज्ञान हूँ, मैं विशेष हूँ, मैं सोम हूँ, मैं सकल (पूर्ण) हूँ। मैं शुभ हूँ, मैं शोकरहित हूँ, मैं चैतन्य हूँ, मैं सम हूँ।',
        'I am knowledge; I am the distinguished; I am Soma; I am the whole. I am auspicious; I am without sorrow; I am consciousness; I am the same in all.'
      ),
      M(
        ['मानावमानहीनोऽस्मि निर्गुणोऽस्मि शिवोऽस्म्यहम्।', 'द्वैताद्वैतविहीनोऽस्मि द्वन्द्वहीनोऽस्मि सोऽस्म्यहम्॥'],
        'मैं मान और अपमान से रहित हूँ, मैं निर्गुण हूँ, मैं शिव हूँ। मैं द्वैत और अद्वैत से रहित हूँ, मैं द्वन्द्वों से रहित हूँ — वह मैं हूँ।',
        'I am free of honour and dishonour; I am without qualities; I am Śiva. I am beyond duality and non-duality; I am free of the pairs of opposites; that am I.'
      ),
      M(
        ['भावाभावविहीनोऽस्मि भासाहीनोऽस्मि भास्म्यहम्।', 'शून्याशून्यप्रभावोऽस्मि शोभनाशोभनोऽस्म्यहम्॥'],
        'मैं भाव और अभाव से रहित हूँ, मैं (किसी अन्य के) प्रकाश से रहित हूँ, मैं स्वयं प्रकाश हूँ। मैं शून्य और अशून्य का प्रभव (उद्गम) हूँ, मैं शोभन और अशोभन (दोनों से परे) हूँ।',
        'I am beyond being and non-being; I am without borrowed light; I am light itself. I am the source of the void and the non-void; I am the beautiful and the not-beautiful.'
      ),
      M(
        ['तुल्यातुल्यविहीनोऽस्मि नित्यः शुद्धः सदाशिवः।', 'सर्वासर्वविहीनोऽस्मि सात्त्विकोऽस्मि सदास्म्यहम्॥'],
        'मैं तुल्य और अतुल्य (की तुलना) से रहित हूँ, मैं नित्य, शुद्ध और सदाशिव हूँ। मैं सर्व और असर्व से रहित हूँ, मैं सात्त्विक हूँ, मैं सदा (सत्-स्वरूप) हूँ।',
        'I am beyond the equal and the unequal; eternal, pure, ever Śiva. I am beyond all and not-all; I am of the nature of purity; I ever am.'
      ),
      M(
        ['एकसंख्याविहीनोऽस्मि द्विसंख्यावानहं न च।', 'सदसद्भेदहीनोऽस्मि संकल्परहितोऽस्म्यहम्॥'],
        'मैं "एक" संख्या से भी रहित हूँ और "दो" संख्या वाला भी नहीं हूँ। मैं सत् और असत् के भेद से रहित हूँ, मैं संकल्प से रहित हूँ।',
        'I am without the number one, nor do I have the number two. I am free of the distinction of real and unreal; I am without intention.'
      ),
      M(
        ['नानात्मभेदहीनोऽस्मि ह्यखण्डानन्दविग्रहः।', 'नाहमस्मि न चान्योऽस्मि देहादिरहितोऽस्म्यहम्॥'],
        'मैं अनेक आत्माओं के भेद से रहित हूँ, अखण्ड आनन्द ही मेरा स्वरूप है। मैं "मैं" (अहंकार) नहीं हूँ, न कोई अन्य हूँ; मैं देह आदि से रहित हूँ।',
        'I am free of the difference of many selves; my form is undivided bliss. I am not “I”, nor am I another; I am without body and the rest.'
      ),
      M(
        ['आश्रयाश्रयहीनोऽस्मि आधाररहितोऽस्म्यहम्।', 'बन्धमोक्षादिहीनोऽस्मि शुद्धब्रह्मास्मि सोऽस्म्यहम्॥'],
        'मैं आश्रय और आश्रित से रहित हूँ, मैं आधार से रहित हूँ। मैं बन्धन और मोक्ष आदि से रहित हूँ, मैं शुद्ध ब्रह्म हूँ — वह मैं हूँ।',
        'I am beyond support and supported; I am without any ground. I am free of bondage, liberation and the like; I am pure Brahman; that am I.'
      ),
      M(
        ['चित्तादिसर्वहीनोऽस्मि परमोऽस्मि परात्परः।', 'सदा विचाररूपोऽस्मि निर्विचारोऽस्मि सोऽस्म्यहम्॥'],
        'मैं चित्त आदि सबसे रहित हूँ, मैं परम हूँ, पर से भी पर हूँ। मैं सदा विचार-स्वरूप हूँ, (फिर भी) विचार से रहित हूँ — वह मैं हूँ।',
        'I am free of mind and all the rest; I am the highest, beyond the beyond. I am ever of the nature of inquiry, yet beyond all inquiry; that am I.'
      ),
      M(
        ['अकारोकाररूपोऽस्मि मकारोऽस्मि सनातनः।', 'ध्यातृध्यानविहीनोऽस्मि ध्येयहीनोऽस्मि सोऽस्म्यहम्॥'],
        'मैं अकार और उकार-रूप हूँ, मैं सनातन मकार हूँ। मैं ध्याता और ध्यान से रहित हूँ, मैं ध्येय से रहित हूँ — वह मैं हूँ।',
        'I am the form of A and U; I am the eternal M. I am without meditator and meditation; I am without an object of meditation; that am I.'
      ),
      M(
        ['सर्वपूर्णस्वरूपोऽस्मि सच्चिदानन्दलक्षणः।', 'सर्वतीर्थस्वरूपोऽस्मि परमात्मास्म्यहं शिवः॥'],
        'मैं सर्वत्र पूर्ण स्वरूप वाला हूँ, सत्-चित्-आनन्द मेरा लक्षण है। मैं समस्त तीर्थों का स्वरूप हूँ, मैं परमात्मा शिव हूँ।',
        'I am of a nature full in every way, marked by being, consciousness and bliss. I am the essence of all holy places; I am the Supreme Self, Śiva.'
      ),
      M(
        ['लक्ष्यालक्ष्यविहीनोऽस्मि लयहीनरसोऽस्म्यहम्।', 'मातृमानविहीनोऽस्मि मेयहीनः शिवोऽस्म्यहम्॥'],
        'मैं लक्ष्य और अलक्ष्य से रहित हूँ, मैं लय-रहित रस (आनन्द) हूँ। मैं प्रमाता और प्रमाण से रहित हूँ, प्रमेय से रहित शिव हूँ।',
        'I am beyond the marked and the unmarked; I am the essence that knows no dissolution. I am without knower and means of knowing; I am Śiva, without anything to be known.'
      ),
      M(
        ['न जगत्सर्वद्रष्टास्मि नेत्रादिरहितोऽस्म्यहम्।', 'प्रवृद्धोऽस्मि प्रबुद्धोऽस्मि प्रसन्नोऽस्मि परोऽस्म्यहम्॥'],
        'मैं जगत् नहीं हूँ, मैं सबका द्रष्टा हूँ, मैं नेत्र आदि से रहित हूँ। मैं प्रवृद्ध हूँ, मैं प्रबुद्ध हूँ, मैं प्रसन्न हूँ, मैं पर (परमात्मा) हूँ।',
        'I am not the world; I am the seer of all; I am without eyes and the other senses. I am grown full; I am fully awake; I am serene; I am the Supreme.'
      ),
      M(
        ['सर्वेन्द्रियविहीनोऽस्मि सर्वकर्मकृदप्यहम्।', 'सर्ववेदान्ततृप्तोऽस्मि सर्वदा सुलभोऽस्म्यहम्॥'],
        'मैं सब इन्द्रियों से रहित हूँ, फिर भी सब कर्मों का कर्ता हूँ। मैं समस्त वेदान्त से तृप्त हूँ, मैं सदा सुलभ हूँ।',
        'I am without any of the senses, yet I am the doer of all deeds. I am satisfied by all the Vedānta; I am ever easy to reach.'
      ),
      M(
        ['मुदितामुदिताख्योऽस्मि सर्वमौनफलोऽस्म्यहम्।', 'नित्यचिन्मात्ररूपोऽस्मि सदा सच्चिन्मयोऽस्म्यहम्॥'],
        'मैं "मुदित" और "अमुदित" (दोनों) नामों वाला हूँ, मैं समस्त मौन का फल हूँ। मैं नित्य चिन्मात्र-स्वरूप हूँ, मैं सदा सत्-चित्-मय हूँ।',
        'I am called both the joyful and the joyless; I am the fruit of all silence. I am of the form of eternal pure consciousness; I am ever made of being and consciousness.'
      ),
      M(
        ['यत्किंचिदपि हीनोऽस्मि स्वल्पमप्यति नास्म्यहम्।', 'हृदयग्रन्थिहीनोऽस्मि हृदयाम्भोजमध्यगः॥'],
        'मैं जो कुछ भी है उससे रहित हूँ, मैं थोड़ा-सा भी (परिच्छिन्न) नहीं हूँ। मैं हृदय की ग्रन्थि से रहित हूँ और हृदय-कमल के मध्य में स्थित हूँ।',
        'I am without anything whatever; I am not even the least thing. I am free of the knot of the heart, and I dwell in the midst of the heart-lotus.'
      ),
      M(
        ['षड्विकारविहीनोऽस्मि षट्कोशरहितोऽस्म्यहम्।', 'अरिषड्वर्गमुक्तोऽस्मि अन्तरादन्तरोऽस्म्यहम्॥'],
        'मैं (जन्म, अस्तित्व, वृद्धि, परिवर्तन, क्षय और नाश — इन) छह विकारों से रहित हूँ, मैं छह कोशों से रहित हूँ। मैं (काम, क्रोध आदि) छह शत्रुओं के समूह से मुक्त हूँ, मैं भीतर से भी भीतर हूँ।',
        'I am free of the six modifications; I am without the six sheaths. I am released from the group of six enemies; I am the innermost of the inner.'
      ),
      M(
        ['देशकालविमुक्तोऽस्मि दिगम्बरसुखोऽस्म्यहम्।', 'नास्ति नास्ति विमुक्तोऽस्मि नकाररहितोऽस्म्यहम्॥'],
        'मैं देश और काल से मुक्त हूँ, मैं दिशाओं को ही वस्त्र मानने (दिगम्बर होने) का सुख हूँ। मैं "नहीं है, नहीं है" (के निषेध) से भी मुक्त हूँ, मैं "न"-कार (निषेध) से रहित हूँ।',
        'I am free of place and time; I am the joy of being clad in the quarters of space. I am free even of “it is not, it is not”; I am beyond all negation.'
      ),
      M(
        ['अखण्डाकाशरूपोऽस्मि ह्यखण्डाकारमस्म्यहम्।', 'प्रपञ्चमुक्तचित्तोऽस्मि प्रपञ्चरहितोऽस्म्यहम्॥'],
        'मैं अखण्ड आकाश-रूप हूँ, मैं अखण्ड आकार वाला हूँ। मेरा चित्त प्रपञ्च से मुक्त है, मैं प्रपञ्च से रहित हूँ।',
        'I am of the form of undivided space; I am of undivided form. My mind is free of the manifold world; I am without the manifold world.'
      ),
      M(
        ['सर्वप्रकाशरूपोऽस्मि चिन्मात्रज्योतिरस्म्यहम्।', 'कालत्रयविमुक्तोऽस्मि कामादिरहितोऽस्म्यहम्॥'],
        'मैं सबको प्रकाशित करने वाले प्रकाश का स्वरूप हूँ, मैं चिन्मात्र ज्योति हूँ। मैं तीनों कालों से मुक्त हूँ, मैं काम आदि से रहित हूँ।',
        'I am of the form of the light that illumines all; I am the light of pure consciousness. I am free of the three times; I am without desire and the rest.'
      ),
      M(
        ['कायिकादिविमुक्तोऽस्मि निर्गुणः केवलोऽस्म्यहम्।', 'मुक्तिहीनोऽस्मि मुक्तोऽस्मि मोक्षहीनोऽस्म्यहं सदा॥'],
        'मैं शारीरिक आदि (कर्मों और दोषों) से मुक्त हूँ, मैं निर्गुण और केवल (एकमात्र) हूँ। मैं मुक्ति से रहित हूँ, (फिर भी) मुक्त हूँ; मैं सदा मोक्ष से भी रहित हूँ।',
        'I am free of the bodily and the rest; I am without qualities, alone. I am without liberation, yet I am free; I am ever beyond release.'
      ),
      M(
        ['सत्यासत्यादिहीनोऽस्मि सन्मात्रान्नास्म्यहं सदा।', 'गन्तव्यदेशहीनोऽस्मि गमनादिविवर्जितः॥'],
        'मैं सत्य और असत्य आदि से रहित हूँ, मैं सदा सन्मात्र से भिन्न नहीं हूँ। मेरे लिए कोई जाने योग्य स्थान नहीं है, मैं गमन आदि से रहित हूँ।',
        'I am beyond truth and untruth and the like; I am never other than pure being. There is no place for me to go; I am free of going and the rest.'
      ),
      M(
        ['सर्वदा समरूपोऽस्मि शान्तोऽस्मि पुरुषोत्तमः।', 'एवं स्वानुभवो यस्य सोऽहमस्मि न संशयः॥'],
        'मैं सदा सम-रूप हूँ, मैं शान्त हूँ, मैं पुरुषोत्तम हूँ। जिसे अपना ऐसा अनुभव है, वह मैं ही हूँ — इसमें संशय नहीं।',
        'I am ever the same; I am peace; I am the Supreme Person. He who has such experience of himself — he is I; there is no doubt.'
      ),
      M(
        ['यः शृणोति सकृद्वापि स ब्रह्मैव भवति स्वयम्।', 'इत्युपनिषत्॥'],
        'जो (इसे) एक बार भी सुनता है, वह स्वयं ब्रह्म ही हो जाता है। — ऐसी यह उपनिषद् है।',
        'He who hears this even once becomes Brahman himself. Thus the Upaniṣad.'
      ),
    ],
  ],
};

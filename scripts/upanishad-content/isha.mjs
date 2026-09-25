/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 */
export default {
  slug: 'isha',
  muktika: 1,
  vedaHi: 'शुक्ल यजुर्वेद',
  vedaEn: 'Shukla Yajurveda',
  source: {
    baseText:
      'Śukla Yajurveda (Vājasaneyi Saṁhitā 40) recension with Śāṅkara-bhāṣya, as printed in Gita Press "ईशादि नौ उपनिषद्"; Devanagari cross-checked against sanskritdocuments.org.',
    canonicalEdition: 'Gita Press Gorakhpur, ईशादि नौ उपनिषद् (शांकरभाष्यार्थ सहित), code 66',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/isha.html',
      'https://www.wisdomlib.org/hinduism/book/isha-upanishad-shankara-bhashya',
      'https://archive.org/details/IshadiNauUpanishadGitaPress',
      'https://sanskritdocuments.org/doc_upanishhat/',
    ],
    notes:
      '18 mantras plus the Yajurvedic śānti-pāṭha (पूर्णमदः) as page 1. Vedic anunāsika ligatures (ꣳ) are written with the standard anusvāra so every cluster renders on both platforms. Meanings follow Śaṅkara; verse 8 keeps the traditional reading पर्यगात्.',
    retrievedOn: '2026-09-25',
  },
  shanti: {
    lines: [
      'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।',
      'पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    meaningHi:
      'वह (परब्रह्म) पूर्ण है, यह (जगत्) भी पूर्ण है; पूर्ण से ही पूर्ण प्रकट होता है। पूर्ण का पूर्णत्व लेकर भी पूर्ण ही शेष रह जाता है। ॐ — त्रिविध तापों की शान्ति हो।',
    meaningEn:
      'That (the supreme Brahman) is whole; this (the world) is whole too. From the whole the whole comes forth. Taking the whole from the whole, the whole alone remains. Om, peace, peace, peace.',
  },
  mantras: [
    {
      lines: ['ॐ ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्।', 'तेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥'],
      meaningHi:
        'इस जगत् में जो कुछ भी चल-अचल है, वह सब ईश्वर से आच्छादित है — उसी में बसा हुआ है। इसलिए त्याग-भाव से (उसे ईश्वर का जानकर) ही भोग करो; किसी के धन का लोभ न करो।',
      meaningEn:
        'All this, whatever moves in this moving world, is pervaded by the Lord — it dwells in Him. Enjoy it, therefore, through renunciation, knowing it to be His; do not covet anyone\'s wealth.',
    },
    {
      lines: ['कुर्वन्नेवेह कर्माणि जिजीविषेच्छतं समाः।', 'एवं त्वयि नान्यथेतोऽस्ति न कर्म लिप्यते नरे॥'],
      meaningHi:
        'यहाँ (शास्त्रविहित) कर्म करते हुए ही सौ वर्ष जीने की इच्छा करो। तुम जैसे मनुष्य के लिए इससे भिन्न कोई मार्ग नहीं है, जिससे कर्म का बन्धन न लगे।',
      meaningEn:
        'Performing your appointed works here, aspire to live a hundred years. For a person like you there is no other way by which action does not cling to you.',
    },
    {
      lines: ['असुर्या नाम ते लोका अन्धेन तमसावृताः।', 'ताँस्ते प्रेत्याभिगच्छन्ति ये के चात्महनो जनाः॥'],
      meaningHi:
        'वे लोक आसुरी हैं — घोर अन्धकार से ढके हुए। जो कोई भी आत्मा की हत्या करने वाले (आत्मज्ञान से विमुख) लोग हैं, वे मरकर उन्हीं लोकों में जाते हैं।',
      meaningEn:
        'Demonic indeed are those worlds, shrouded in blinding darkness. To them go, after death, all those who slay the Self — who turn away from knowing it.',
    },
    {
      lines: ['अनेजदेकं मनसो जवीयो नैनद्देवा आप्नुवन्पूर्वमर्षत्।', 'तद्धावतोऽन्यानत्येति तिष्ठत्तस्मिन्नपो मातरिश्वा दधाति॥'],
      meaningHi:
        'वह (आत्मा) अचल है, एक है, मन से भी अधिक वेगवान है; इन्द्रियाँ (देव) उसे नहीं पा सकतीं, क्योंकि वह उनसे पहले ही पहुँचा हुआ है। स्थिर रहते हुए भी वह दौड़ने वालों को पीछे छोड़ देता है। उसी में रहकर वायु (मातरिश्वा) समस्त कर्मों (जलों) को धारण करता है।',
      meaningEn:
        'Unmoving, one, swifter than the mind — the senses cannot reach it, for it has gone before them. Standing still, it outruns all who run. Resting in it, the wind (Mātariśvā) upholds all activity.',
    },
    {
      lines: ['तदेजति तन्नैजति तद्दूरे तद्वन्तिके।', 'तदन्तरस्य सर्वस्य तदु सर्वस्यास्य बाह्यतः॥'],
      meaningHi:
        'वह चलता है और नहीं भी चलता; वह दूर है और अत्यन्त निकट भी। वह इस सबके भीतर है और इस सबके बाहर भी।',
      meaningEn:
        'It moves and it moves not; it is far and it is near. It is within all this, and it is outside all this.',
    },
    {
      lines: ['यस्तु सर्वाणि भूतान्यात्मन्येवानुपश्यति।', 'सर्वभूतेषु चात्मानं ततो न विजुगुप्सते॥'],
      meaningHi:
        'जो समस्त प्राणियों को आत्मा में ही देखता है और समस्त प्राणियों में आत्मा को देखता है, वह फिर किसी से घृणा नहीं करता।',
      meaningEn:
        'One who sees all beings in the Self alone, and the Self in all beings, no longer recoils from anything.',
    },
    {
      lines: ['यस्मिन्सर्वाणि भूतान्यात्मैवाभूद्विजानतः।', 'तत्र को मोहः कः शोक एकत्वमनुपश्यतः॥'],
      meaningHi:
        'जिस ज्ञानी के लिए समस्त प्राणी आत्मा ही हो गए हैं, उस एकत्व को देखने वाले के लिए फिर मोह कहाँ और शोक कहाँ?',
      meaningEn:
        'For the knower to whom all beings have become the Self itself — for one who sees that oneness — where is delusion, where is grief?',
    },
    {
      lines: ['स पर्यगाच्छुक्रमकायमव्रणमस्नाविरं शुद्धमपापविद्धम्।', 'कविर्मनीषी परिभूः स्वयम्भूर्याथातथ्यतोऽर्थान् व्यदधाच्छाश्वतीभ्यः समाभ्यः॥'],
      meaningHi:
        'वह (आत्मा) सर्वव्यापी है, ज्योतिर्मय है, शरीररहित, क्षतरहित, स्नायुरहित, शुद्ध और पाप से अछूता है। वह कवि (सर्वद्रष्टा), मनीषी, सर्वोपरि और स्वयम्भू है; उसने अनन्त कालों के लिए यथायोग्य रूप से समस्त पदार्थों की रचना की है।',
      meaningEn:
        'He pervades all — radiant, bodiless, without wound or sinew, pure, untouched by evil. The seer, the thinker, the all-transcending, the self-existent — He has ordained all things exactly as they should be, for endless ages.',
    },
    {
      lines: ['अन्धं तमः प्रविशन्ति येऽविद्यामुपासते।', 'ततो भूय इव ते तमो य उ विद्यायां रताः॥'],
      meaningHi:
        'जो केवल अविद्या (कर्मकाण्ड) की उपासना करते हैं, वे घोर अन्धकार में प्रवेश करते हैं; और जो केवल विद्या (देवता-ज्ञान) में ही रमे हैं, वे उससे भी अधिक अन्धकार में जाते हैं।',
      meaningEn:
        'Into blinding darkness enter those who worship ignorance (ritual alone); into darkness greater still, as it were, those who delight in knowledge (of the gods) alone.',
    },
    {
      lines: ['अन्यदेवाहुर्विद्ययाऽन्यदाहुरविद्यया।', 'इति शुश्रुम धीराणां ये नस्तद्विचचक्षिरे॥'],
      meaningHi:
        'विद्या से एक भिन्न फल मिलता है और अविद्या से दूसरा — ऐसा हमने उन धीर पुरुषों से सुना है जिन्होंने हमें इसका उपदेश किया।',
      meaningEn:
        'Different, they say, is the fruit of knowledge; different, they say, that of ignorance. Thus have we heard from the wise who explained it to us.',
    },
    {
      lines: ['विद्यां चाविद्यां च यस्तद्वेदोभयं सह।', 'अविद्यया मृत्युं तीर्त्वा विद्ययाऽमृतमश्नुते॥'],
      meaningHi:
        'जो विद्या और अविद्या दोनों को साथ-साथ जानता है, वह अविद्या (कर्म) से मृत्यु को पार कर विद्या से अमृतत्व प्राप्त करता है।',
      meaningEn:
        'One who knows both knowledge and ignorance together crosses death through ignorance (action) and attains immortality through knowledge.',
    },
    {
      lines: ['अन्धं तमः प्रविशन्ति येऽसम्भूतिमुपासते।', 'ततो भूय इव ते तमो य उ सम्भूत्यां रताः॥'],
      meaningHi:
        'जो असम्भूति (अव्यक्त प्रकृति) की उपासना करते हैं, वे घोर अन्धकार में प्रवेश करते हैं; और जो सम्भूति (कार्यब्रह्म, हिरण्यगर्भ) में ही रमे हैं, वे उससे भी अधिक अन्धकार में जाते हैं।',
      meaningEn:
        'Into blinding darkness enter those who worship the unmanifest (asambhūti); into darkness greater still, as it were, those who delight in the manifest (sambhūti) alone.',
    },
    {
      lines: ['अन्यदेवाहुः सम्भवादन्यदाहुरसम्भवात्।', 'इति शुश्रुम धीराणां ये नस्तद्विचचक्षिरे॥'],
      meaningHi:
        'सम्भूति की उपासना से एक फल मिलता है और असम्भूति की उपासना से दूसरा — ऐसा हमने उन धीर पुरुषों से सुना है जिन्होंने हमें इसका उपदेश किया।',
      meaningEn:
        'Different, they say, is what comes from the manifest; different, they say, what comes from the unmanifest. Thus have we heard from the wise who explained it to us.',
    },
    {
      lines: ['सम्भूतिं च विनाशं च यस्तद्वेदोभयं सह।', 'विनाशेन मृत्युं तीर्त्वा सम्भूत्याऽमृतमश्नुते॥'],
      meaningHi:
        'जो सम्भूति और विनाश (कार्यब्रह्म) दोनों को साथ-साथ जानता है, वह विनाश की उपासना से मृत्यु को पार कर सम्भूति (प्रकृतिलय) से अमृतत्व को प्राप्त करता है।',
      meaningEn:
        'One who knows both the manifest and the perishable together crosses death through the perishable and attains immortality through the manifest.',
    },
    {
      lines: ['हिरण्मयेन पात्रेण सत्यस्यापिहितं मुखम्।', 'तत्त्वं पूषन्नपावृणु सत्यधर्माय दृष्टये॥'],
      meaningHi:
        'सत्य (आदित्यमण्डलस्थ ब्रह्म) का मुख सुवर्णमय पात्र से ढका हुआ है। हे पूषन् (जगत्पोषक सूर्य)! सत्यधर्म का पालन करने वाले मुझे उसके दर्शन के लिए उस आवरण को हटा दो।',
      meaningEn:
        'The face of Truth is covered with a golden disc. O Pūṣan, nourisher of the world, remove it, that I who hold to truth may behold it.',
    },
    {
      lines: ['पूषन्नेकर्षे यम सूर्य प्राजापत्य व्यूह रश्मीन् समूह तेजः।', 'यत्ते रूपं कल्याणतमं तत्ते पश्यामि योऽसावसौ पुरुषः सोऽहमस्मि॥'],
      meaningHi:
        'हे पूषन्! हे एकाकी विचरने वाले ऋषि! हे यम (नियामक)! हे सूर्य! हे प्रजापति के पुत्र! अपनी किरणें समेट लो, अपना तेज संकुचित करो। तुम्हारा जो परम कल्याणमय रूप है, उसे मैं देखता हूँ। जो वह (आदित्यमण्डल में स्थित) पुरुष है, वह मैं ही हूँ।',
      meaningEn:
        'O Pūṣan, lone traveller, controller, Sun, child of Prajāpati — draw in your rays, gather up your light. That most auspicious form of yours I behold. The Person who is there, in the sun — that am I.',
    },
    {
      lines: ['वायुरनिलममृतमथेदं भस्मान्तं शरीरम्।', 'ॐ क्रतो स्मर कृतं स्मर क्रतो स्मर कृतं स्मर॥'],
      meaningHi:
        '(अब मेरा) प्राण सर्वव्यापी अमृत वायु में मिल जाए, और यह शरीर भस्म हो जाए। ॐ! हे संकल्परूप मन! स्मरण करो; किए हुए को स्मरण करो। हे मन! स्मरण करो; किए हुए को स्मरण करो।',
      meaningEn:
        'May this breath now merge into the immortal all-pervading air, and this body end in ashes. Om. O mind, remember; remember what has been done. O mind, remember; remember what has been done.',
    },
    {
      lines: ['अग्ने नय सुपथा राये अस्मान् विश्वानि देव वयुनानि विद्वान्।', 'युयोध्यस्मज्जुहुराणमेनो भूयिष्ठां ते नमउक्तिं विधेम॥'],
      meaningHi:
        'हे अग्ने! हे देव! हमारे समस्त कर्मों को जानने वाले तुम हमें (कर्मफल-भोग के लिए) सुन्दर मार्ग से ले चलो। हमसे कुटिल पाप को दूर करो। हम तुम्हें बार-बार नमस्कार-वचन अर्पित करते हैं।',
      meaningEn:
        'O Agni, O god who knows all our deeds, lead us by the good path to our reward. Remove from us the crooked sin. To you we offer our fullest words of homage, again and again.',
    },
  ],
};

#!/usr/bin/env node
/**
 * Builds mobile/src/data/upanishad/{chapter-01..03.json, chapters-manifest.json}
 * from the authored content below. One chapter per Upanishad — Īśāvāsya, Kena,
 * Māṇḍūkya — each opened by its traditional śānti-pāṭha.
 *
 * Text: Gita Press "ईशादि नौ उपनिषद्" (Śāṅkara-bhāṣya recension), checked against
 * the sanskritdocuments.org Devanagari and the Advaita Ashrama editions. Meanings
 * are a plain-prose rendering that follows Śaṅkara's reading.
 *
 * Run manually (not a build step):  node scripts/build-upanishad.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'mobile', 'src', 'data', 'upanishad');

const DEV_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const dev = (s) => String(s).replace(/\d/g, (d) => DEV_DIGITS[Number(d)]);

const RETRIEVED = '2026-09-25';
const COMMON_REFS = [
  'https://archive.org/details/IshadiNauUpanishadGitaPress',
  'https://sanskritdocuments.org/doc_upanishhat/',
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. ईशावास्योपनिषद् — Śukla Yajurveda (Vājasaneyi Saṁhitā, adhyāya 40)
// ─────────────────────────────────────────────────────────────────────────────
const ISHA = {
  chapter: 1,
  slug: 'isha',
  titleHi: 'ईशावास्योपनिषद्',
  titleEn: 'Isha Upanishad',
  vedaHi: 'शुक्ल यजुर्वेद',
  vedaEn: 'Shukla Yajurveda',
  source: {
    baseText:
      'Śukla Yajurveda (Vājasaneyi Saṁhitā 40) recension with Śāṅkara-bhāṣya, as printed in Gita Press "ईशादि नौ उपनिषद्"; Devanagari cross-checked against sanskritdocuments.org.',
    canonicalEdition: 'Gita Press Gorakhpur, ईशादि नौ उपनिषद् (शांकरभाष्यार्थ सहित), code 66',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/isha.html',
      'https://www.wisdomlib.org/hinduism/book/isha-upanishad-shankara-bhashya',
      ...COMMON_REFS,
    ],
    notes:
      '18 mantras plus the Yajurvedic śānti-pāṭha (पूर्णमदः) as page 1. Vedic anunāsika ligatures (ꣳ) are written with the standard anusvāra so every cluster renders on both platforms. Meanings follow Śaṅkara; verse 8 keeps the traditional reading पर्यगात्.',
    retrievedOn: RETRIEVED,
  },
  shanti: {
    lines: [
      'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।',
      'पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    linesEn: [
      'oṁ pūrṇamadaḥ pūrṇamidaṁ pūrṇātpūrṇamudachyate',
      'pūrṇasya pūrṇamādāya pūrṇamevāvaśiṣyate',
      'oṁ śāntiḥ śāntiḥ śāntiḥ',
    ],
    meaningHi:
      'वह (परब्रह्म) पूर्ण है, यह (जगत्) भी पूर्ण है; पूर्ण से ही पूर्ण प्रकट होता है। पूर्ण का पूर्णत्व लेकर भी पूर्ण ही शेष रह जाता है। ॐ — त्रिविध तापों की शान्ति हो।',
    meaningEn:
      'That (the supreme Brahman) is whole; this (the world) is whole too. From the whole the whole comes forth. Taking the whole from the whole, the whole alone remains. Om, peace, peace, peace.',
  },
  mantras: [
    {
      lines: ['ॐ ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्।', 'तेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम्॥'],
      linesEn: ['oṁ īśā vāsyamidaṁ sarvaṁ yatkiñcha jagatyāṁ jagat', 'tena tyaktena bhuñjīthā mā gṛdhaḥ kasyasviddhanam'],
      meaningHi:
        'इस जगत् में जो कुछ भी चल-अचल है, वह सब ईश्वर से आच्छादित है — उसी में बसा हुआ है। इसलिए त्याग-भाव से (उसे ईश्वर का जानकर) ही भोग करो; किसी के धन का लोभ न करो।',
      meaningEn:
        'All this, whatever moves in this moving world, is pervaded by the Lord — it dwells in Him. Enjoy it, therefore, through renunciation, knowing it to be His; do not covet anyone\'s wealth.',
    },
    {
      lines: ['कुर्वन्नेवेह कर्माणि जिजीविषेच्छतं समाः।', 'एवं त्वयि नान्यथेतोऽस्ति न कर्म लिप्यते नरे॥'],
      linesEn: ['kurvanneveha karmāṇi jijīviṣechchhataṁ samāḥ', 'evaṁ tvayi nānyatheto\'sti na karma lipyate nare'],
      meaningHi:
        'यहाँ (शास्त्रविहित) कर्म करते हुए ही सौ वर्ष जीने की इच्छा करो। तुम जैसे मनुष्य के लिए इससे भिन्न कोई मार्ग नहीं है, जिससे कर्म का बन्धन न लगे।',
      meaningEn:
        'Performing your appointed works here, aspire to live a hundred years. For a person like you there is no other way by which action does not cling to you.',
    },
    {
      lines: ['असुर्या नाम ते लोका अन्धेन तमसावृताः।', 'ताँस्ते प्रेत्याभिगच्छन्ति ये के चात्महनो जनाः॥'],
      linesEn: ['asuryā nāma te lokā andhena tamasāvṛtāḥ', 'tāṁste pretyābhigachchhanti ye ke chātmahano janāḥ'],
      meaningHi:
        'वे लोक आसुरी हैं — घोर अन्धकार से ढके हुए। जो कोई भी आत्मा की हत्या करने वाले (आत्मज्ञान से विमुख) लोग हैं, वे मरकर उन्हीं लोकों में जाते हैं।',
      meaningEn:
        'Demonic indeed are those worlds, shrouded in blinding darkness. To them go, after death, all those who slay the Self — who turn away from knowing it.',
    },
    {
      lines: ['अनेजदेकं मनसो जवीयो नैनद्देवा आप्नुवन्पूर्वमर्षत्।', 'तद्धावतोऽन्यानत्येति तिष्ठत्तस्मिन्नपो मातरिश्वा दधाति॥'],
      linesEn: ['anejadekaṁ manaso javīyo nainaddevā āpnuvanpūrvamarṣat', 'taddhāvato\'nyānatyeti tiṣṭhattasminnapo mātariśvā dadhāti'],
      meaningHi:
        'वह (आत्मा) अचल है, एक है, मन से भी अधिक वेगवान है; इन्द्रियाँ (देव) उसे नहीं पा सकतीं, क्योंकि वह उनसे पहले ही पहुँचा हुआ है। स्थिर रहते हुए भी वह दौड़ने वालों को पीछे छोड़ देता है। उसी में रहकर वायु (मातरिश्वा) समस्त कर्मों (जलों) को धारण करता है।',
      meaningEn:
        'Unmoving, one, swifter than the mind — the senses cannot reach it, for it has gone before them. Standing still, it outruns all who run. Resting in it, the wind (Mātariśvā) upholds all activity.',
    },
    {
      lines: ['तदेजति तन्नैजति तद्दूरे तद्वन्तिके।', 'तदन्तरस्य सर्वस्य तदु सर्वस्यास्य बाह्यतः॥'],
      linesEn: ['tadejati tannaijati taddūre tadvantike', 'tadantarasya sarvasya tadu sarvasyāsya bāhyataḥ'],
      meaningHi:
        'वह चलता है और नहीं भी चलता; वह दूर है और अत्यन्त निकट भी। वह इस सबके भीतर है और इस सबके बाहर भी।',
      meaningEn:
        'It moves and it moves not; it is far and it is near. It is within all this, and it is outside all this.',
    },
    {
      lines: ['यस्तु सर्वाणि भूतान्यात्मन्येवानुपश्यति।', 'सर्वभूतेषु चात्मानं ततो न विजुगुप्सते॥'],
      linesEn: ['yastu sarvāṇi bhūtānyātmanyevānupaśyati', 'sarvabhūteṣu chātmānaṁ tato na vijugupsate'],
      meaningHi:
        'जो समस्त प्राणियों को आत्मा में ही देखता है और समस्त प्राणियों में आत्मा को देखता है, वह फिर किसी से घृणा नहीं करता।',
      meaningEn:
        'One who sees all beings in the Self alone, and the Self in all beings, no longer recoils from anything.',
    },
    {
      lines: ['यस्मिन्सर्वाणि भूतान्यात्मैवाभूद्विजानतः।', 'तत्र को मोहः कः शोक एकत्वमनुपश्यतः॥'],
      linesEn: ['yasminsarvāṇi bhūtānyātmaivābhūdvijānataḥ', 'tatra ko mohaḥ kaḥ śoka ekatvamanupaśyataḥ'],
      meaningHi:
        'जिस ज्ञानी के लिए समस्त प्राणी आत्मा ही हो गए हैं, उस एकत्व को देखने वाले के लिए फिर मोह कहाँ और शोक कहाँ?',
      meaningEn:
        'For the knower to whom all beings have become the Self itself — for one who sees that oneness — where is delusion, where is grief?',
    },
    {
      lines: ['स पर्यगाच्छुक्रमकायमव्रणमस्नाविरं शुद्धमपापविद्धम्।', 'कविर्मनीषी परिभूः स्वयम्भूर्याथातथ्यतोऽर्थान् व्यदधाच्छाश्वतीभ्यः समाभ्यः॥'],
      linesEn: ['sa paryagāchchhukramakāyamavraṇamasnāviraṁ śuddhamapāpaviddham', 'kavirmanīṣī paribhūḥ svayambhūryāthātathyato\'rthān vyadadhāchchhāśvatībhyaḥ samābhyaḥ'],
      meaningHi:
        'वह (आत्मा) सर्वव्यापी है, ज्योतिर्मय है, शरीररहित, क्षतरहित, स्नायुरहित, शुद्ध और पाप से अछूता है। वह कवि (सर्वद्रष्टा), मनीषी, सर्वोपरि और स्वयम्भू है; उसने अनन्त कालों के लिए यथायोग्य रूप से समस्त पदार्थों की रचना की है।',
      meaningEn:
        'He pervades all — radiant, bodiless, without wound or sinew, pure, untouched by evil. The seer, the thinker, the all-transcending, the self-existent — He has ordained all things exactly as they should be, for endless ages.',
    },
    {
      lines: ['अन्धं तमः प्रविशन्ति येऽविद्यामुपासते।', 'ततो भूय इव ते तमो य उ विद्यायां रताः॥'],
      linesEn: ['andhaṁ tamaḥ praviśanti ye\'vidyāmupāsate', 'tato bhūya iva te tamo ya u vidyāyāṁ ratāḥ'],
      meaningHi:
        'जो केवल अविद्या (कर्मकाण्ड) की उपासना करते हैं, वे घोर अन्धकार में प्रवेश करते हैं; और जो केवल विद्या (देवता-ज्ञान) में ही रमे हैं, वे उससे भी अधिक अन्धकार में जाते हैं।',
      meaningEn:
        'Into blinding darkness enter those who worship ignorance (ritual alone); into darkness greater still, as it were, those who delight in knowledge (of the gods) alone.',
    },
    {
      lines: ['अन्यदेवाहुर्विद्ययाऽन्यदाहुरविद्यया।', 'इति शुश्रुम धीराणां ये नस्तद्विचचक्षिरे॥'],
      linesEn: ['anyadevāhurvidyayā\'nyadāhuravidyayā', 'iti śuśruma dhīrāṇāṁ ye nastadvichachakṣire'],
      meaningHi:
        'विद्या से एक भिन्न फल मिलता है और अविद्या से दूसरा — ऐसा हमने उन धीर पुरुषों से सुना है जिन्होंने हमें इसका उपदेश किया।',
      meaningEn:
        'Different, they say, is the fruit of knowledge; different, they say, that of ignorance. Thus have we heard from the wise who explained it to us.',
    },
    {
      lines: ['विद्यां चाविद्यां च यस्तद्वेदोभयं सह।', 'अविद्यया मृत्युं तीर्त्वा विद्ययाऽमृतमश्नुते॥'],
      linesEn: ['vidyāṁ chāvidyāṁ cha yastadvedobhayaṁ saha', 'avidyayā mṛtyuṁ tīrtvā vidyayā\'mṛtamaśnute'],
      meaningHi:
        'जो विद्या और अविद्या दोनों को साथ-साथ जानता है, वह अविद्या (कर्म) से मृत्यु को पार कर विद्या से अमृतत्व प्राप्त करता है।',
      meaningEn:
        'One who knows both knowledge and ignorance together crosses death through ignorance (action) and attains immortality through knowledge.',
    },
    {
      lines: ['अन्धं तमः प्रविशन्ति येऽसम्भूतिमुपासते।', 'ततो भूय इव ते तमो य उ सम्भूत्यां रताः॥'],
      linesEn: ['andhaṁ tamaḥ praviśanti ye\'sambhūtimupāsate', 'tato bhūya iva te tamo ya u sambhūtyāṁ ratāḥ'],
      meaningHi:
        'जो असम्भूति (अव्यक्त प्रकृति) की उपासना करते हैं, वे घोर अन्धकार में प्रवेश करते हैं; और जो सम्भूति (कार्यब्रह्म, हिरण्यगर्भ) में ही रमे हैं, वे उससे भी अधिक अन्धकार में जाते हैं।',
      meaningEn:
        'Into blinding darkness enter those who worship the unmanifest (asambhūti); into darkness greater still, as it were, those who delight in the manifest (sambhūti) alone.',
    },
    {
      lines: ['अन्यदेवाहुः सम्भवादन्यदाहुरसम्भवात्।', 'इति शुश्रुम धीराणां ये नस्तद्विचचक्षिरे॥'],
      linesEn: ['anyadevāhuḥ sambhavādanyadāhurasambhavāt', 'iti śuśruma dhīrāṇāṁ ye nastadvichachakṣire'],
      meaningHi:
        'सम्भूति की उपासना से एक फल मिलता है और असम्भूति की उपासना से दूसरा — ऐसा हमने उन धीर पुरुषों से सुना है जिन्होंने हमें इसका उपदेश किया।',
      meaningEn:
        'Different, they say, is what comes from the manifest; different, they say, what comes from the unmanifest. Thus have we heard from the wise who explained it to us.',
    },
    {
      lines: ['सम्भूतिं च विनाशं च यस्तद्वेदोभयं सह।', 'विनाशेन मृत्युं तीर्त्वा सम्भूत्याऽमृतमश्नुते॥'],
      linesEn: ['sambhūtiṁ cha vināśaṁ cha yastadvedobhayaṁ saha', 'vināśena mṛtyuṁ tīrtvā sambhūtyā\'mṛtamaśnute'],
      meaningHi:
        'जो सम्भूति और विनाश (कार्यब्रह्म) दोनों को साथ-साथ जानता है, वह विनाश की उपासना से मृत्यु को पार कर सम्भूति (प्रकृतिलय) से अमृतत्व को प्राप्त करता है।',
      meaningEn:
        'One who knows both the manifest and the perishable together crosses death through the perishable and attains immortality through the manifest.',
    },
    {
      lines: ['हिरण्मयेन पात्रेण सत्यस्यापिहितं मुखम्।', 'तत्त्वं पूषन्नपावृणु सत्यधर्माय दृष्टये॥'],
      linesEn: ['hiraṇmayena pātreṇa satyasyāpihitaṁ mukham', 'tattvaṁ pūṣannapāvṛṇu satyadharmāya dṛṣṭaye'],
      meaningHi:
        'सत्य (आदित्यमण्डलस्थ ब्रह्म) का मुख सुवर्णमय पात्र से ढका हुआ है। हे पूषन् (जगत्पोषक सूर्य)! सत्यधर्म का पालन करने वाले मुझे उसके दर्शन के लिए उस आवरण को हटा दो।',
      meaningEn:
        'The face of Truth is covered with a golden disc. O Pūṣan, nourisher of the world, remove it, that I who hold to truth may behold it.',
    },
    {
      lines: ['पूषन्नेकर्षे यम सूर्य प्राजापत्य व्यूह रश्मीन् समूह तेजः।', 'यत्ते रूपं कल्याणतमं तत्ते पश्यामि योऽसावसौ पुरुषः सोऽहमस्मि॥'],
      linesEn: ['pūṣannekarṣe yama sūrya prājāpatya vyūha raśmīn samūha tejaḥ', 'yatte rūpaṁ kalyāṇatamaṁ tatte paśyāmi yo\'sāvasau puruṣaḥ so\'hamasmi'],
      meaningHi:
        'हे पूषन्! हे एकाकी विचरने वाले ऋषि! हे यम (नियामक)! हे सूर्य! हे प्रजापति के पुत्र! अपनी किरणें समेट लो, अपना तेज संकुचित करो। तुम्हारा जो परम कल्याणमय रूप है, उसे मैं देखता हूँ। जो वह (आदित्यमण्डल में स्थित) पुरुष है, वह मैं ही हूँ।',
      meaningEn:
        'O Pūṣan, lone traveller, controller, Sun, child of Prajāpati — draw in your rays, gather up your light. That most auspicious form of yours I behold. The Person who is there, in the sun — that am I.',
    },
    {
      lines: ['वायुरनिलममृतमथेदं भस्मान्तं शरीरम्।', 'ॐ क्रतो स्मर कृतं स्मर क्रतो स्मर कृतं स्मर॥'],
      linesEn: ['vāyuranilamamṛtamathedaṁ bhasmāntaṁ śarīram', 'oṁ krato smara kṛtaṁ smara krato smara kṛtaṁ smara'],
      meaningHi:
        '(अब मेरा) प्राण सर्वव्यापी अमृत वायु में मिल जाए, और यह शरीर भस्म हो जाए। ॐ! हे संकल्परूप मन! स्मरण करो; किए हुए को स्मरण करो। हे मन! स्मरण करो; किए हुए को स्मरण करो।',
      meaningEn:
        'May this breath now merge into the immortal all-pervading air, and this body end in ashes. Om. O mind, remember; remember what has been done. O mind, remember; remember what has been done.',
    },
    {
      lines: ['अग्ने नय सुपथा राये अस्मान् विश्वानि देव वयुनानि विद्वान्।', 'युयोध्यस्मज्जुहुराणमेनो भूयिष्ठां ते नमउक्तिं विधेम॥'],
      linesEn: ['agne naya supathā rāye asmān viśvāni deva vayunāni vidvān', 'yuyodhyasmajjuhurāṇameno bhūyiṣṭhāṁ te namauktiṁ vidhema'],
      meaningHi:
        'हे अग्ने! हे देव! हमारे समस्त कर्मों को जानने वाले तुम हमें (कर्मफल-भोग के लिए) सुन्दर मार्ग से ले चलो। हमसे कुटिल पाप को दूर करो। हम तुम्हें बार-बार नमस्कार-वचन अर्पित करते हैं।',
      meaningEn:
        'O Agni, O god who knows all our deeds, lead us by the good path to our reward. Remove from us the crooked sin. To you we offer our fullest words of homage, again and again.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. केनोपनिषद् — Sāmaveda (Talavakāra Brāhmaṇa), 4 khaṇḍas
// ─────────────────────────────────────────────────────────────────────────────
const KENA = {
  chapter: 2,
  slug: 'kena',
  titleHi: 'केनोपनिषद्',
  titleEn: 'Kena Upanishad',
  vedaHi: 'सामवेद',
  vedaEn: 'Samaveda',
  source: {
    baseText:
      'Sāmaveda (Talavakāra / Jaiminīya Upaniṣad-Brāhmaṇa) recension with Śāṅkara-bhāṣya, as printed in Gita Press "ईशादि नौ उपनिषद्"; Devanagari cross-checked against sanskritdocuments.org.',
    canonicalEdition: 'Gita Press Gorakhpur, ईशादि नौ उपनिषद् (शांकरभाष्यार्थ सहित), code 66',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/kena.html',
      'https://www.wisdomlib.org/hinduism/book/kena-upanishad-shankara-bhashya',
      ...COMMON_REFS,
    ],
    notes:
      'Four khaṇḍas of 9 · 5 · 12 · 9 mantras (Śaṅkara\'s numbering; khaṇḍas 3–4 are prose) plus the Sāmavedic śānti-pāṭha (आप्यायन्तु ममाङ्गानि) as page 1. Citations are khaṇḍa.mantra. The Vedic pluta marks (३) of 4.4 are omitted so the line renders cleanly.',
    retrievedOn: RETRIEVED,
  },
  shanti: {
    lines: [
      'ॐ आप्यायन्तु ममाङ्गानि वाक्प्राणश्चक्षुः श्रोत्रमथो बलमिन्द्रियाणि च सर्वाणि।',
      'सर्वं ब्रह्मौपनिषदं माहं ब्रह्म निराकुर्यां मा मा ब्रह्म निराकरोदनिराकरणमस्त्वनिराकरणं मेऽस्तु।',
      'तदात्मनि निरते य उपनिषत्सु धर्मास्ते मयि सन्तु ते मयि सन्तु॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    linesEn: [
      'oṁ āpyāyantu mamāṅgāni vākprāṇaśchakṣuḥ śrotramatho balamindriyāṇi cha sarvāṇi',
      'sarvaṁ brahmaupaniṣadaṁ māhaṁ brahma nirākuryāṁ mā mā brahma nirākarodanirākaraṇamastvanirākaraṇaṁ me\'stu',
      'tadātmani nirate ya upaniṣatsu dharmāste mayi santu te mayi santu',
      'oṁ śāntiḥ śāntiḥ śāntiḥ',
    ],
    meaningHi:
      'मेरे अंग, वाणी, प्राण, नेत्र, श्रोत्र, बल और समस्त इन्द्रियाँ पुष्ट हों। यह सब उपनिषद्-प्रतिपादित ब्रह्म ही है। मैं ब्रह्म का निराकरण न करूँ, न ब्रह्म मेरा निराकरण करे। निराकरण न हो; मेरा निराकरण न हो। आत्मा में निरत मुझमें उपनिषदों में कहे हुए धर्म स्थित हों, वे मुझमें स्थित हों। ॐ शान्तिः शान्तिः शान्तिः।',
    meaningEn:
      'May my limbs, speech, breath, eye, ear, strength and all my senses grow strong. All this is the Brahman of the Upaniṣads. May I never deny Brahman, nor Brahman deny me. Let there be no denial — no denial of me. May the virtues the Upaniṣads speak of abide in me, devoted to the Self; may they abide in me. Om, peace, peace, peace.',
  },
  khandas: [
    [
      {
        lines: ['ॐ केनेषितं पतति प्रेषितं मनः केन प्राणः प्रथमः प्रैति युक्तः।', 'केनेषितां वाचमिमां वदन्ति चक्षुः श्रोत्रं क उ देवो युनक्ति॥'],
        linesEn: ['oṁ keneṣitaṁ patati preṣitaṁ manaḥ kena prāṇaḥ prathamaḥ praiti yuktaḥ', 'keneṣitāṁ vāchamimāṁ vadanti chakṣuḥ śrotraṁ ka u devo yunakti'],
        meaningHi:
          '(शिष्य ने पूछा —) किसकी इच्छा से प्रेरित होकर मन अपने विषयों पर जाता है? किससे नियुक्त होकर प्रथम प्राण चलता है? किसकी प्रेरणा से लोग यह वाणी बोलते हैं? कौन देव नेत्र और श्रोत्र को उनके कार्य में लगाता है?',
        meaningEn:
          '(The disciple asks:) Willed by whom does the mind fly to its objects? Directed by whom does the first breath move? Willed by whom do people utter this speech? Which god yokes the eye and the ear to their work?',
      },
      {
        lines: ['श्रोत्रस्य श्रोत्रं मनसो मनो यद्वाचो ह वाचं स उ प्राणस्य प्राणः।', 'चक्षुषश्चक्षुरतिमुच्य धीराः प्रेत्यास्माल्लोकादमृता भवन्ति॥'],
        linesEn: ['śrotrasya śrotraṁ manaso mano yadvācho ha vāchaṁ sa u prāṇasya prāṇaḥ', 'chakṣuṣaśchakṣuratimuchya dhīrāḥ pretyāsmāllokādamṛtā bhavanti'],
        meaningHi:
          '(गुरु ने कहा —) वह श्रोत्र का श्रोत्र, मन का मन, वाणी की वाणी, प्राण का प्राण और नेत्र का नेत्र है। धीर पुरुष (इन्द्रियों में आत्मबुद्धि को) त्यागकर इस लोक से जाकर अमर हो जाते हैं।',
        meaningEn:
          '(The teacher replies:) It is the ear of the ear, the mind of the mind, the speech of speech, the breath of the breath, the eye of the eye. The wise, letting go of identification with the senses, depart this world and become immortal.',
      },
      {
        lines: ['न तत्र चक्षुर्गच्छति न वाग्गच्छति नो मनः।', 'न विद्मो न विजानीमो यथैतदनुशिष्यात्॥'],
        linesEn: ['na tatra chakṣurgachchhati na vāggachchhati no manaḥ', 'na vidmo na vijānīmo yathaitadanuśiṣyāt'],
        meaningHi:
          'वहाँ नेत्र नहीं पहुँचता, वाणी नहीं पहुँचती, मन भी नहीं। हम नहीं जानते, नहीं समझ पाते कि उसका उपदेश कैसे किया जाए।',
        meaningEn:
          'There the eye does not go, nor speech, nor the mind. We do not know, we do not understand, how one could teach it.',
      },
      {
        lines: ['अन्यदेव तद्विदितादथो अविदितादधि।', 'इति शुश्रुम पूर्वेषां ये नस्तद्व्याचचक्षिरे॥'],
        linesEn: ['anyadeva tadviditādatho aviditādadhi', 'iti śuśruma pūrveṣāṁ ye nastadvyāchachakṣire'],
        meaningHi:
          'वह ज्ञात से भिन्न है और अज्ञात से भी परे है — ऐसा हमने उन पूर्वाचार्यों से सुना है जिन्होंने हमें उसकी व्याख्या की।',
        meaningEn:
          'It is other than the known, and beyond the unknown as well. Thus have we heard from the ancients who explained it to us.',
      },
      {
        lines: ['यद्वाचानभ्युदितं येन वागभ्युद्यते।', 'तदेव ब्रह्म त्वं विद्धि नेदं यदिदमुपासते॥'],
        linesEn: ['yadvāchānabhyuditaṁ yena vāgabhyudyate', 'tadeva brahma tvaṁ viddhi nedaṁ yadidamupāsate'],
        meaningHi:
          'जो वाणी से प्रकाशित नहीं होता, बल्कि जिससे वाणी प्रकाशित होती है — उसे ही तुम ब्रह्म जानो; यह नहीं जिसकी लोग (सीमित रूप में) उपासना करते हैं।',
        meaningEn:
          'That which speech cannot express, but by which speech is expressed — know that alone to be Brahman, not this which people worship here.',
      },
      {
        lines: ['यन्मनसा न मनुते येनाहुर्मनो मतम्।', 'तदेव ब्रह्म त्वं विद्धि नेदं यदिदमुपासते॥'],
        linesEn: ['yanmanasā na manute yenāhurmano matam', 'tadeva brahma tvaṁ viddhi nedaṁ yadidamupāsate'],
        meaningHi:
          'जिसे मन से नहीं सोचा जा सकता, बल्कि जिससे — ऐसा ज्ञानी कहते हैं — मन स्वयं जाना जाता है, उसे ही तुम ब्रह्म जानो; यह नहीं जिसकी लोग उपासना करते हैं।',
        meaningEn:
          'That which the mind cannot think, but by which, the wise say, the mind itself is known — know that alone to be Brahman, not this which people worship here.',
      },
      {
        lines: ['यच्चक्षुषा न पश्यति येन चक्षूंषि पश्यति।', 'तदेव ब्रह्म त्वं विद्धि नेदं यदिदमुपासते॥'],
        linesEn: ['yachchakṣuṣā na paśyati yena chakṣūṁṣi paśyati', 'tadeva brahma tvaṁ viddhi nedaṁ yadidamupāsate'],
        meaningHi:
          'जिसे नेत्र से नहीं देखा जा सकता, बल्कि जिससे नेत्रों (की वृत्तियों) को देखा जाता है — उसे ही तुम ब्रह्म जानो; यह नहीं जिसकी लोग उपासना करते हैं।',
        meaningEn:
          'That which the eye cannot see, but by which the eyes themselves are seen — know that alone to be Brahman, not this which people worship here.',
      },
      {
        lines: ['यच्छ्रोत्रेण न शृणोति येन श्रोत्रमिदं श्रुतम्।', 'तदेव ब्रह्म त्वं विद्धि नेदं यदिदमुपासते॥'],
        linesEn: ['yachchhrotreṇa na śṛṇoti yena śrotramidaṁ śrutam', 'tadeva brahma tvaṁ viddhi nedaṁ yadidamupāsate'],
        meaningHi:
          'जिसे श्रोत्र से नहीं सुना जा सकता, बल्कि जिससे यह श्रोत्र सुना (जाना) जाता है — उसे ही तुम ब्रह्म जानो; यह नहीं जिसकी लोग उपासना करते हैं।',
        meaningEn:
          'That which the ear cannot hear, but by which this ear is heard (known) — know that alone to be Brahman, not this which people worship here.',
      },
      {
        lines: ['यत्प्राणेन न प्राणिति येन प्राणः प्रणीयते।', 'तदेव ब्रह्म त्वं विद्धि नेदं यदिदमुपासते॥'],
        linesEn: ['yatprāṇena na prāṇiti yena prāṇaḥ praṇīyate', 'tadeva brahma tvaṁ viddhi nedaṁ yadidamupāsate'],
        meaningHi:
          'जो प्राण से जीवित नहीं होता, बल्कि जिससे प्राण संचालित होता है — उसे ही तुम ब्रह्म जानो; यह नहीं जिसकी लोग उपासना करते हैं।',
        meaningEn:
          'That which does not breathe by the breath, but by which the breath is led — know that alone to be Brahman, not this which people worship here.',
      },
    ],
    [
      {
        lines: ['यदि मन्यसे सुवेदेति दभ्रमेवापि नूनं त्वं वेत्थ ब्रह्मणो रूपम्।', 'यदस्य त्वं यदस्य देवेष्वथ नु मीमांस्यमेव ते मन्ये विदितम्॥'],
        linesEn: ['yadi manyase suvedeti dabhramevāpi nūnaṁ tvaṁ vettha brahmaṇo rūpam', 'yadasya tvaṁ yadasya deveṣvatha nu mīmāṁsyameva te manye viditam'],
        meaningHi:
          '(गुरु —) यदि तुम मानते हो कि "मैं ब्रह्म को भली-भाँति जानता हूँ", तो निश्चय ही तुम ब्रह्म के स्वरूप को बहुत थोड़ा जानते हो — उसका जो रूप तुममें है और जो देवताओं में है। इसलिए (मैं समझता हूँ) तुम्हें अभी और विचार करना है। (शिष्य —) मैं समझता हूँ कि मैंने जान लिया।',
        meaningEn:
          '(Teacher:) If you think "I know Brahman well", you surely know only a little of its form — what is in you and what is among the gods. So it still calls for your inquiry. (Disciple:) I think I do know it.',
      },
      {
        lines: ['नाहं मन्ये सुवेदेति नो न वेदेति वेद च।', 'यो नस्तद्वेद तद्वेद नो न वेदेति वेद च॥'],
        linesEn: ['nāhaṁ manye suvedeti no na vedeti veda cha', 'yo nastadveda tadveda no na vedeti veda cha'],
        meaningHi:
          'न तो मैं मानता हूँ कि "मैं भली-भाँति जानता हूँ", और न यह कि "मैं नहीं जानता" — मैं जानता भी हूँ। हममें से जो इस वचन को — "न यह कि नहीं जानता, जानता भी हूँ" — समझता है, वही उसे जानता है।',
        meaningEn:
          'I do not think "I know it well", nor do I think "I do not know it" — and yet I know. Whoever among us understands the saying "not that I do not know; I know and I know not" — he knows it.',
      },
      {
        lines: ['यस्यामतं तस्य मतं मतं यस्य न वेद सः।', 'अविज्ञातं विजानतां विज्ञातमविजानताम्॥'],
        linesEn: ['yasyāmataṁ tasya mataṁ mataṁ yasya na veda saḥ', 'avijñātaṁ vijānatāṁ vijñātamavijānatām'],
        meaningHi:
          'जिसके लिए वह (ब्रह्म) "जाना हुआ नहीं" है, उसके लिए वह जाना हुआ है; जो उसे "जाना हुआ" मानता है, वह उसे नहीं जानता। जानने वालों के लिए वह अविज्ञात है, न जानने वालों के लिए विज्ञात।',
        meaningEn:
          'It is known to one for whom it is not known; one who thinks it known does not know it. It is unknown to those who know, and known to those who do not know.',
      },
      {
        lines: ['प्रतिबोधविदितं मतममृतत्वं हि विन्दते।', 'आत्मना विन्दते वीर्यं विद्यया विन्दतेऽमृतम्॥'],
        linesEn: ['pratibodhaviditaṁ matamamṛtatvaṁ hi vindate', 'ātmanā vindate vīryaṁ vidyayā vindate\'mṛtam'],
        meaningHi:
          'जब वह प्रत्येक बोध (वृत्ति) के साक्षी रूप में जाना जाता है, तब वह ठीक जाना गया माना जाता है; ऐसा जानने वाला अमृतत्व पाता है। आत्मा से (आत्मज्ञान से) बल मिलता है और विद्या से अमृतत्व।',
        meaningEn:
          'When it is known as the witness in every state of awareness, then it is truly known, and one attains immortality. Through the Self one gains strength; through knowledge, immortality.',
      },
      {
        lines: ['इह चेदवेदीदथ सत्यमस्ति न चेदिहावेदीन्महती विनष्टिः।', 'भूतेषु भूतेषु विचित्य धीराः प्रेत्यास्माल्लोकादमृता भवन्ति॥'],
        linesEn: ['iha chedavedīdatha satyamasti na chedihāvedīnmahatī vinaṣṭiḥ', 'bhūteṣu bhūteṣu vichitya dhīrāḥ pretyāsmāllokādamṛtā bhavanti'],
        meaningHi:
          'यदि यहाँ (इसी जीवन में) उसे जान लिया, तो जीवन सफल है; यदि यहाँ न जाना, तो महान विनाश है। धीर पुरुष प्राणी-प्राणी में उस एक आत्मा को पहचानकर इस लोक से जाकर अमर हो जाते हैं।',
        meaningEn:
          'If one knows it here, there is truth (fulfilment); if one does not know it here, great is the loss. The wise, discerning the one Self in every being, depart this world and become immortal.',
      },
    ],
    [
      {
        lines: ['ब्रह्म ह देवेभ्यो विजिग्ये तस्य ह ब्रह्मणो विजये देवा अमहीयन्त।', 'त ऐक्षन्तास्माकमेवायं विजयोऽस्माकमेवायं महिमेति॥'],
        linesEn: ['brahma ha devebhyo vijigye tasya ha brahmaṇo vijaye devā amahīyanta', 'ta aikṣantāsmākamevāyaṁ vijayo\'smākamevāyaṁ mahimeti'],
        meaningHi:
          'ब्रह्म ने देवताओं के लिए (असुरों पर) विजय पाई। उस ब्रह्म की विजय से देवता गौरवान्वित हुए और सोचने लगे — "यह विजय हमारी ही है, यह महिमा हमारी ही है।"',
        meaningEn:
          'Brahman won a victory for the gods. In that victory of Brahman the gods grew proud and thought: "This victory is ours alone; this glory is ours alone."',
      },
      {
        lines: ['तद्धैषां विजज्ञौ तेभ्यो ह प्रादुर्बभूव।', 'तन्न व्यजानत किमिदं यक्षमिति॥'],
        linesEn: ['taddhaiṣāṁ vijajñau tebhyo ha prādurbabhūva', 'tanna vyajānata kimidaṁ yakṣamiti'],
        meaningHi:
          'ब्रह्म ने उनके इस अभिमान को जान लिया और उनके सामने (यक्ष रूप में) प्रकट हुआ। वे उसे न समझ सके — "यह यक्ष (पूज्य महान सत्ता) क्या है?"',
        meaningEn:
          'Brahman knew their conceit and appeared before them. They did not recognise it: "What is this great Spirit (yakṣa)?"',
      },
      {
        lines: ['तेऽग्निमब्रुवन् जातवेद एतद्विजानीहि किमेतद्यक्षमिति तथेति॥'],
        linesEn: ['te\'gnimabruvan jātaveda etadvijānīhi kimetadyakṣamiti tatheti'],
        meaningHi: 'उन्होंने अग्नि से कहा — "हे जातवेदा! जानो, यह यक्ष क्या है।" अग्नि ने कहा — "ठीक है।"',
        meaningEn: 'They said to Agni: "O Jātavedas, find out what this Spirit is." "So be it," he said.',
      },
      {
        lines: ['तदभ्यद्रवत्तमभ्यवदत्कोऽसीति।', 'अग्निर्वा अहमस्मीत्यब्रवीज्जातवेदा वा अहमस्मीति॥'],
        linesEn: ['tadabhyadravattamabhyavadatko\'sīti', 'agnirvā ahamasmītyabravījjātavedā vā ahamasmīti'],
        meaningHi: 'अग्नि उसकी ओर दौड़ा। उस (यक्ष) ने पूछा — "तू कौन है?" अग्नि ने कहा — "मैं अग्नि हूँ, मैं जातवेदा हूँ।"',
        meaningEn: 'Agni rushed towards it. It asked him: "Who are you?" He said: "I am Agni; I am Jātavedas."',
      },
      {
        lines: ['तस्मिंस्त्वयि किं वीर्यमिति।', 'अपीदं सर्वं दहेयं यदिदं पृथिव्यामिति॥'],
        linesEn: ['tasmiṁstvayi kiṁ vīryamiti', 'apīdaṁ sarvaṁ daheyaṁ yadidaṁ pṛthivyāmiti'],
        meaningHi: '"ऐसे तुझमें क्या सामर्थ्य है?" "इस पृथ्वी पर जो कुछ है, वह सब मैं जला सकता हूँ।"',
        meaningEn: '"What power is there in such as you?" "I can burn all this, whatever there is on the earth."',
      },
      {
        lines: ['तस्मै तृणं निदधावेतद्दहेति।', 'तदुपप्रेयाय सर्वजवेन तन्न शशाक दग्धुम्।', 'स तत एव निववृते नैतदशकं विज्ञातुं यदेतद्यक्षमिति॥'],
        linesEn: ['tasmai tṛṇaṁ nidadhāvetaddaheti', 'tadupapreyāya sarvajavena tanna śaśāka dagdhum', 'sa tata eva nivavṛte naitadaśakaṁ vijñātuṁ yadetadyakṣamiti'],
        meaningHi:
          'उस (यक्ष) ने उसके सामने एक तिनका रखकर कहा — "इसे जला।" अग्नि पूरे वेग से उस पर झपटा, पर उसे जला न सका। वह वहाँ से लौट आया — "मैं यह न जान सका कि यह यक्ष क्या है।"',
        meaningEn:
          'It placed a blade of grass before him: "Burn this." He rushed at it with all his might but could not burn it. He turned back from there: "I could not find out what this Spirit is."',
      },
      {
        lines: ['अथ वायुमब्रुवन् वायवेतद्विजानीहि किमेतद्यक्षमिति तथेति॥'],
        linesEn: ['atha vāyumabruvan vāyavetadvijānīhi kimetadyakṣamiti tatheti'],
        meaningHi: 'तब उन्होंने वायु से कहा — "हे वायु! जानो, यह यक्ष क्या है।" वायु ने कहा — "ठीक है।"',
        meaningEn: 'Then they said to Vāyu: "O Vāyu, find out what this Spirit is." "So be it," he said.',
      },
      {
        lines: ['तदभ्यद्रवत्तमभ्यवदत्कोऽसीति।', 'वायुर्वा अहमस्मीत्यब्रवीन्मातरिश्वा वा अहमस्मीति॥'],
        linesEn: ['tadabhyadravattamabhyavadatko\'sīti', 'vāyurvā ahamasmītyabravīnmātariśvā vā ahamasmīti'],
        meaningHi: 'वायु उसकी ओर दौड़ा। उस (यक्ष) ने पूछा — "तू कौन है?" वायु ने कहा — "मैं वायु हूँ, मैं मातरिश्वा हूँ।"',
        meaningEn: 'Vāyu rushed towards it. It asked him: "Who are you?" He said: "I am Vāyu; I am Mātariśvā."',
      },
      {
        lines: ['तस्मिंस्त्वयि किं वीर्यमिति।', 'अपीदं सर्वमाददीय यदिदं पृथिव्यामिति॥'],
        linesEn: ['tasmiṁstvayi kiṁ vīryamiti', 'apīdaṁ sarvamādadīya yadidaṁ pṛthivyāmiti'],
        meaningHi: '"ऐसे तुझमें क्या सामर्थ्य है?" "इस पृथ्वी पर जो कुछ है, वह सब मैं उड़ा (उठा) सकता हूँ।"',
        meaningEn: '"What power is there in such as you?" "I can carry off all this, whatever there is on the earth."',
      },
      {
        lines: ['तस्मै तृणं निदधावेतदादत्स्वेति।', 'तदुपप्रेयाय सर्वजवेन तन्न शशाकादातुम्।', 'स तत एव निववृते नैतदशकं विज्ञातुं यदेतद्यक्षमिति॥'],
        linesEn: ['tasmai tṛṇaṁ nidadhāvetadādatsveti', 'tadupapreyāya sarvajavena tanna śaśākādātum', 'sa tata eva nivavṛte naitadaśakaṁ vijñātuṁ yadetadyakṣamiti'],
        meaningHi:
          'उस (यक्ष) ने उसके सामने एक तिनका रखकर कहा — "इसे उठा।" वायु पूरे वेग से उस पर झपटा, पर उसे उठा न सका। वह वहाँ से लौट आया — "मैं यह न जान सका कि यह यक्ष क्या है।"',
        meaningEn:
          'It placed a blade of grass before him: "Take this up." He rushed at it with all his might but could not lift it. He turned back from there: "I could not find out what this Spirit is."',
      },
      {
        lines: ['अथेन्द्रमब्रुवन्मघवन्नेतद्विजानीहि किमेतद्यक्षमिति तथेति।', 'तदभ्यद्रवत्तस्मात्तिरोदधे॥'],
        linesEn: ['athendramabruvanmaghavannetadvijānīhi kimetadyakṣamiti tatheti', 'tadabhyadravattasmāttirodadhe'],
        meaningHi:
          'तब उन्होंने इन्द्र से कहा — "हे मघवन्! जानो, यह यक्ष क्या है।" इन्द्र ने कहा — "ठीक है।" वह उसकी ओर दौड़ा, पर वह (यक्ष) उससे अन्तर्धान हो गया।',
        meaningEn:
          'Then they said to Indra: "O Maghavan, find out what this Spirit is." "So be it," he said. He rushed towards it, but it vanished from before him.',
      },
      {
        lines: ['स तस्मिन्नेवाकाशे स्त्रियमाजगाम बहुशोभमानामुमां हैमवतीम्।', 'ताँहोवाच किमेतद्यक्षमिति॥'],
        linesEn: ['sa tasminnevākāśe striyamājagāma bahuśobhamānāmumāṁ haimavatīm', 'tāṁhovācha kimetadyakṣamiti'],
        meaningHi:
          'उसी आकाश में इन्द्र एक अत्यन्त शोभामयी स्त्री — हिमवान की पुत्री उमा — के पास पहुँचा और उनसे पूछा — "यह यक्ष क्या है?"',
        meaningEn:
          'In that same space he came upon a woman of great beauty — Umā, daughter of Himavat — and asked her: "What is this Spirit?"',
      },
    ],
    [
      {
        lines: ['सा ब्रह्मेति होवाच ब्रह्मणो वा एतद्विजये महीयध्वमिति।', 'ततो हैव विदाञ्चकार ब्रह्मेति॥'],
        linesEn: ['sā brahmeti hovācha brahmaṇo vā etadvijaye mahīyadhvamiti', 'tato haiva vidāñchakāra brahmeti'],
        meaningHi:
          'उन्होंने कहा — "यह ब्रह्म है। ब्रह्म की ही इस विजय में तुम गौरव मान रहे हो।" तभी इन्द्र ने जाना कि वह ब्रह्म है।',
        meaningEn:
          'She said: "It is Brahman. In Brahman\'s victory you are glorying." From that alone Indra knew that it was Brahman.',
      },
      {
        lines: ['तस्माद्वा एते देवा अतितरामिवान्यान्देवान्यदग्निर्वायुरिन्द्रः।', 'ते ह्येनन्नेदिष्ठं पस्पर्शुस्ते ह्येनत्प्रथमो विदाञ्चकार ब्रह्मेति॥'],
        linesEn: ['tasmādvā ete devā atitarāmivānyāndevānyadagnirvāyurindraḥ', 'te hyenannediṣṭhaṁ pasparśuste hyenatprathamo vidāñchakāra brahmeti'],
        meaningHi:
          'इसलिए ये देवता — अग्नि, वायु और इन्द्र — अन्य देवताओं से श्रेष्ठ हैं, क्योंकि उन्होंने उस (ब्रह्म) का सबसे निकट से स्पर्श किया और उन्होंने ही सबसे पहले जाना कि वह ब्रह्म है।',
        meaningEn:
          'Therefore these gods — Agni, Vāyu and Indra — surpass the other gods, for they touched it most closely and were the first to know it as Brahman.',
      },
      {
        lines: ['तस्माद्वा इन्द्रोऽतितरामिवान्यान्देवान्।', 'स ह्येनन्नेदिष्ठं पस्पर्श स ह्येनत्प्रथमो विदाञ्चकार ब्रह्मेति॥'],
        linesEn: ['tasmādvā indro\'titarāmivānyāndevān', 'sa hyenannediṣṭhaṁ pasparśa sa hyenatprathamo vidāñchakāra brahmeti'],
        meaningHi:
          'और इसलिए इन्द्र अन्य देवताओं से (और भी) श्रेष्ठ है, क्योंकि उसने उसका सबसे निकट से स्पर्श किया और उसने ही सबसे पहले जाना कि वह ब्रह्म है।',
        meaningEn:
          'And therefore Indra surpasses the other gods, for he touched it most closely and was the first to know it as Brahman.',
      },
      {
        lines: ['तस्यैष आदेशो यदेतद्विद्युतो व्यद्युतदा इतीन् न्यमीमिषदा इत्यधिदैवतम्॥'],
        linesEn: ['tasyaiṣa ādeśo yadetadvidyuto vyadyutadā itīn nyamīmiṣadā ityadhidaivatam'],
        meaningHi:
          'उस (ब्रह्म) का यह उपदेश (दृष्टान्त) है — जैसे बिजली क्षण भर में चमक जाती है, जैसे आँख का पलक झपक जाता है — यह अधिदैवत (देव-सम्बन्धी) उपदेश है।',
        meaningEn:
          'This is its illustration: it is like the flash of lightning, like the blink of an eye — this is the teaching with reference to the gods (adhidaivata).',
      },
      {
        lines: ['अथाध्यात्मं यदेतद्गच्छतीव च मनोऽनेन चैतदुपस्मरत्यभीक्ष्णं सङ्कल्पः॥'],
        linesEn: ['athādhyātmaṁ yadetadgachchhatīva cha mano\'nena chaitadupasmaratyabhīkṣṇaṁ saṅkalpaḥ'],
        meaningHi:
          'अब अध्यात्म (आत्म-सम्बन्धी) उपदेश — मन जैसे उस ब्रह्म की ओर जाता-सा है; इसी (मन) से साधक उसका बार-बार स्मरण करता है, और यह संकल्प (उसमें निरन्तर लगा रहता) है।',
        meaningEn:
          'Now the teaching with reference to the self (adhyātma): the mind seems to move towards it; by the mind one remembers it constantly, and this is the mind\'s resolve.',
      },
      {
        lines: ['तद्ध तद्वनं नाम तद्वनमित्युपासितव्यम्।', 'स य एतदेवं वेदाभि हैनं सर्वाणि भूतानि संवाञ्छन्ति॥'],
        linesEn: ['taddha tadvanaṁ nāma tadvanamityupāsitavyam', 'sa ya etadevaṁ vedābhi hainaṁ sarvāṇi bhūtāni saṁvāñchhanti'],
        meaningHi:
          'वह ब्रह्म "तद्वन" (सबका वन्दनीय, सबका प्रिय) नाम से जाना जाता है; "तद्वन" रूप में ही उसकी उपासना करनी चाहिए। जो इसे इस प्रकार जानता है, उसे समस्त प्राणी चाहते हैं।',
        meaningEn:
          'It is called Tadvana — "the adorable, the beloved of all" — and as Tadvana it should be meditated upon. All beings long for one who knows it thus.',
      },
      {
        lines: ['उपनिषदं भो ब्रूहीत्युक्ता त उपनिषद्।', 'ब्राह्मीं वाव त उपनिषदमब्रूमेति॥'],
        linesEn: ['upaniṣadaṁ bho brūhītyuktā ta upaniṣad', 'brāhmīṁ vāva ta upaniṣadamabrūmeti'],
        meaningHi:
          '(शिष्य —) "भगवन्! मुझे उपनिषद् (रहस्य विद्या) कहिए।" (गुरु —) "तुम्हें उपनिषद् कह दी गई; हमने तुम्हें ब्रह्म-सम्बन्धी उपनिषद् ही कही है।"',
        meaningEn:
          '(Disciple:) "Sir, teach me the Upaniṣad (the secret knowledge)." (Teacher:) "The Upaniṣad has been told to you; we have told you the Upaniṣad concerning Brahman."',
      },
      {
        lines: ['तस्यै तपो दमः कर्मेति प्रतिष्ठा वेदाः सर्वाङ्गानि सत्यमायतनम्॥'],
        linesEn: ['tasyai tapo damaḥ karmeti pratiṣṭhā vedāḥ sarvāṅgāni satyamāyatanam'],
        meaningHi:
          'उस (उपनिषद्-विद्या) की प्रतिष्ठा (आधार) तप, दम (इन्द्रिय-संयम) और कर्म हैं; वेद उसके सर्व अंग हैं; और सत्य उसका आश्रय है।',
        meaningEn:
          'Austerity, self-restraint and (ritual) work are its foundation; the Vedas are all its limbs; truth is its abode.',
      },
      {
        lines: ['यो वा एतामेवं वेदापहत्य पाप्मानम्।', 'अनन्ते स्वर्गे लोके ज्येये प्रतितिष्ठति प्रतितिष्ठति॥'],
        linesEn: ['yo vā etāmevaṁ vedāpahatya pāpmānam', 'anante svarge loke jyeye pratitiṣṭhati pratitiṣṭhati'],
        meaningHi:
          'जो इस (विद्या) को इस प्रकार जानता है, वह पाप को नष्ट कर अनन्त, सर्वश्रेष्ठ स्वर्गलोक (ब्रह्म) में प्रतिष्ठित हो जाता है — प्रतिष्ठित हो जाता है।',
        meaningEn:
          'Whoever knows this thus, having shaken off evil, is firmly established in the infinite, supreme heavenly world — established indeed.',
      },
    ],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. माण्डूक्योपनिषद् — Atharvaveda, 12 mantras
// ─────────────────────────────────────────────────────────────────────────────
const MANDUKYA = {
  chapter: 3,
  slug: 'mandukya',
  titleHi: 'माण्डूक्योपनिषद्',
  titleEn: 'Mandukya Upanishad',
  vedaHi: 'अथर्ववेद',
  vedaEn: 'Atharvaveda',
  source: {
    baseText:
      'Atharvaveda recension of the twelve mantras (without Gauḍapāda\'s kārikās) with Śāṅkara-bhāṣya, as printed in Gita Press "ईशादि नौ उपनिषद्"; Devanagari cross-checked against sanskritdocuments.org.',
    canonicalEdition: 'Gita Press Gorakhpur, ईशादि नौ उपनिषद् (शांकरभाष्यार्थ सहित), code 66',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/mandukya.html',
      'https://www.wisdomlib.org/hinduism/book/mandukya-upanishad-gaudapa-karika-and-shankara-bhashya',
      ...COMMON_REFS,
    ],
    notes:
      '12 mantras plus the Atharvavedic śānti-pāṭha (भद्रं कर्णेभिः) as page 1. Gauḍapāda\'s kārikās are not part of the mūla text and are not included. Vedic anunāsika ligatures are written with the standard anusvāra.',
    retrievedOn: RETRIEVED,
  },
  shanti: {
    lines: [
      'ॐ भद्रं कर्णेभिः शृणुयाम देवाः भद्रं पश्येमाक्षभिर्यजत्राः।',
      'स्थिरैरङ्गैस्तुष्टुवांसस्तनूभिर्व्यशेम देवहितं यदायुः।',
      'स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः।',
      'स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    linesEn: [
      'oṁ bhadraṁ karṇebhiḥ śṛṇuyāma devāḥ bhadraṁ paśyemākṣabhiryajatrāḥ',
      'sthirairaṅgaistuṣṭuvāṁsastanūbhirvyaśema devahitaṁ yadāyuḥ',
      'svasti na indro vṛddhaśravāḥ svasti naḥ pūṣā viśvavedāḥ',
      'svasti nastārkṣyo ariṣṭanemiḥ svasti no bṛhaspatirdadhātu',
      'oṁ śāntiḥ śāntiḥ śāntiḥ',
    ],
    meaningHi:
      'हे देवों! हम कानों से शुभ सुनें; हे यज्ञार्ह देवों! हम नेत्रों से शुभ देखें। स्थिर अंगों और शरीरों से आपकी स्तुति करते हुए हम देवों के हित की आयु प्राप्त करें। महान यशस्वी इन्द्र हमारा कल्याण करें; सर्वज्ञ पूषा हमारा कल्याण करें; अरिष्टनेमि तार्क्ष्य (गरुड़) हमारा कल्याण करें; बृहस्पति हमारा कल्याण करें। ॐ शान्तिः शान्तिः शान्तिः।',
    meaningEn:
      'O gods, may we hear what is auspicious with our ears; O you worthy of worship, may we see what is auspicious with our eyes. Praising you with steady limbs and bodies, may we live the full span the gods have allotted. May Indra of great renown bless us; may all-knowing Pūṣan bless us; may Tārkṣya (Garuḍa) of unhindered course bless us; may Bṛhaspati grant us well-being. Om, peace, peace, peace.',
  },
  mantras: [
    {
      lines: ['ॐ ओमित्येतदक्षरमिदं सर्वं तस्योपव्याख्यानं भूतं भवद्भविष्यदिति सर्वमोङ्कार एव।', 'यच्चान्यत्त्रिकालातीतं तदप्योङ्कार एव॥'],
      linesEn: ['oṁ omityetadakṣaramidaṁ sarvaṁ tasyopavyākhyānaṁ bhūtaṁ bhavadbhaviṣyaditi sarvamoṅkāra eva', 'yachchānyattrikālātītaṁ tadapyoṅkāra eva'],
      meaningHi:
        'ॐ — यह अक्षर ही यह सब कुछ है। इसकी स्पष्ट व्याख्या यह है — जो भूत, वर्तमान और भविष्य है, वह सब ओंकार ही है; और जो कुछ तीनों कालों से परे है, वह भी ओंकार ही है।',
      meaningEn:
        'Om — this syllable is all this. Its clear explanation: whatever is past, present and future is all Oṁkāra alone; and whatever else lies beyond the three times is Oṁkāra too.',
    },
    {
      lines: ['सर्वं ह्येतद्ब्रह्मायमात्मा ब्रह्म सोऽयमात्मा चतुष्पात्॥'],
      linesEn: ['sarvaṁ hyetadbrahmāyamātmā brahma so\'yamātmā chatuṣpāt'],
      meaningHi: 'यह सब निश्चय ही ब्रह्म है। यह आत्मा ब्रह्म है। वह यह आत्मा चार पादों (अवस्थाओं) वाला है।',
      meaningEn: 'All this is indeed Brahman. This Self is Brahman. This same Self has four quarters (pādas).',
    },
    {
      lines: ['जागरितस्थानो बहिष्प्रज्ञः सप्ताङ्ग एकोनविंशतिमुखः स्थूलभुग्वैश्वानरः प्रथमः पादः॥'],
      linesEn: ['jāgaritasthāno bahiṣprajñaḥ saptāṅga ekonaviṁśatimukhaḥ sthūlabhugvaiśvānaraḥ prathamaḥ pādaḥ'],
      meaningHi:
        'जागृत अवस्था में रहने वाला, बाहर की ओर प्रज्ञा वाला, सात अंगों और उन्नीस मुखों (पाँच ज्ञानेन्द्रियाँ, पाँच कर्मेन्द्रियाँ, पाँच प्राण, मन, बुद्धि, अहंकार, चित्त) वाला, स्थूल विषयों का भोग करने वाला वैश्वानर पहला पाद है।',
      meaningEn:
        'The first quarter is Vaiśvānara: its field is the waking state, its awareness turned outward, having seven limbs and nineteen mouths (the five senses, five organs of action, five vital airs, mind, intellect, ego and memory), the enjoyer of gross objects.',
    },
    {
      lines: ['स्वप्नस्थानोऽन्तःप्रज्ञः सप्ताङ्ग एकोनविंशतिमुखः प्रविविक्तभुक्तैजसो द्वितीयः पादः॥'],
      linesEn: ['svapnasthāno\'ntaḥprajñaḥ saptāṅga ekonaviṁśatimukhaḥ praviviktabhuktaijaso dvitīyaḥ pādaḥ'],
      meaningHi:
        'स्वप्न अवस्था में रहने वाला, भीतर की ओर प्रज्ञा वाला, सात अंगों और उन्नीस मुखों वाला, सूक्ष्म (मानसिक) विषयों का भोग करने वाला तैजस दूसरा पाद है।',
      meaningEn:
        'The second quarter is Taijasa: its field is the dream state, its awareness turned inward, having seven limbs and nineteen mouths, the enjoyer of subtle (mental) objects.',
    },
    {
      lines: ['यत्र सुप्तो न कञ्चन कामं कामयते न कञ्चन स्वप्नं पश्यति तत्सुषुप्तम्।', 'सुषुप्तस्थान एकीभूतः प्रज्ञानघन एवानन्दमयो ह्यानन्दभुक् चेतोमुखः प्राज्ञस्तृतीयः पादः॥'],
      linesEn: ['yatra supto na kañchana kāmaṁ kāmayate na kañchana svapnaṁ paśyati tatsuṣuptam', 'suṣuptasthāna ekībhūtaḥ prajñānaghana evānandamayo hyānandabhuk chetomukhaḥ prājñastṛtīyaḥ pādaḥ'],
      meaningHi:
        'जहाँ सोया हुआ पुरुष न किसी कामना की इच्छा करता है और न कोई स्वप्न देखता है, वह सुषुप्ति है। सुषुप्ति अवस्था में रहने वाला, एकीभूत, प्रज्ञान का घन (ठोस पिण्ड) मात्र, आनन्दमय, आनन्द का भोग करने वाला, चेतना (जागृत-स्वप्न) का द्वार प्राज्ञ तीसरा पाद है।',
      meaningEn:
        'Where the sleeper desires no desire and sees no dream — that is deep sleep. The third quarter is Prājña: its field is deep sleep, unified, a mass of pure awareness, full of bliss, the enjoyer of bliss, the doorway to the other two states of consciousness.',
    },
    {
      lines: ['एष सर्वेश्वर एष सर्वज्ञ एषोऽन्तर्याम्येष योनिः सर्वस्य प्रभवाप्ययौ हि भूतानाम्॥'],
      linesEn: ['eṣa sarveśvara eṣa sarvajña eṣo\'ntaryāmyeṣa yoniḥ sarvasya prabhavāpyayau hi bhūtānām'],
      meaningHi:
        'यही सबका ईश्वर है, यही सर्वज्ञ है, यही अन्तर्यामी है, यही सबका उद्गम-स्थान है; क्योंकि यही समस्त प्राणियों की उत्पत्ति और लय (का स्थान) है।',
      meaningEn:
        'This is the Lord of all; this is the knower of all; this is the inner controller; this is the source of all — for this is the origin and the dissolution of all beings.',
    },
    {
      lines: ['नान्तःप्रज्ञं न बहिष्प्रज्ञं नोभयतःप्रज्ञं न प्रज्ञानघनं न प्रज्ञं नाप्रज्ञम्।', 'अदृष्टमव्यवहार्यमग्राह्यमलक्षणमचिन्त्यमव्यपदेश्यमेकात्मप्रत्ययसारं प्रपञ्चोपशमं शान्तं शिवमद्वैतं चतुर्थं मन्यन्ते स आत्मा स विज्ञेयः॥'],
      linesEn: ['nāntaḥprajñaṁ na bahiṣprajñaṁ nobhayataḥprajñaṁ na prajñānaghanaṁ na prajñaṁ nāprajñam', 'adṛṣṭamavyavahāryamagrāhyamalakṣaṇamachintyamavyapadeśyamekātmapratyayasāraṁ prapañchopaśamaṁ śāntaṁ śivamadvaitaṁ chaturthaṁ manyante sa ātmā sa vijñeyaḥ'],
      meaningHi:
        'जो न भीतर की ओर प्रज्ञा वाला है, न बाहर की ओर, न दोनों ओर; न प्रज्ञान-घन है, न प्रज्ञ है, न अप्रज्ञ; जो अदृष्ट, अव्यवहार्य, अग्राह्य, लक्षणरहित, अचिन्त्य, अनिर्देश्य है; जिसका सार एक आत्मा की प्रतीति है; जो प्रपंच का उपशम, शान्त, शिव और अद्वैत है — उसे ज्ञानी चौथा (तुरीय) मानते हैं। वही आत्मा है; वही जानने योग्य है।',
      meaningEn:
        'Not aware inwardly, not aware outwardly, not aware both ways; not a mass of awareness, not aware, not unaware; unseen, beyond dealing, ungraspable, without mark, unthinkable, indescribable; its essence the certainty of the one Self; the cessation of all phenomena, tranquil, auspicious, non-dual — this the wise consider the fourth (Turīya). That is the Self; that is to be known.',
    },
    {
      lines: ['सोऽयमात्माध्यक्षरमोङ्कारोऽधिमात्रं पादा मात्रा मात्राश्च पादा अकार उकारो मकार इति॥'],
      linesEn: ['so\'yamātmādhyakṣaramoṅkāro\'dhimātraṁ pādā mātrā mātrāścha pādā akāra ukāro makāra iti'],
      meaningHi:
        'वही यह आत्मा अक्षर-दृष्टि से ओंकार है। मात्राओं की दृष्टि से (आत्मा के) पाद ही मात्राएँ हैं और मात्राएँ ही पाद हैं — अकार, उकार और मकार।',
      meaningEn:
        'This same Self, regarded as the syllable, is Oṁkāra. Regarded by its measures, the quarters are the measures and the measures are the quarters — the letters a, u and m.',
    },
    {
      lines: ['जागरितस्थानो वैश्वानरोऽकारः प्रथमा मात्राऽऽप्तेरादिमत्त्वाद्वा।', 'आप्नोति ह वै सर्वान्कामानादिश्च भवति य एवं वेद॥'],
      linesEn: ['jāgaritasthāno vaiśvānaro\'kāraḥ prathamā mātrā\'\'pterādimattvādvā', 'āpnoti ha vai sarvānkāmānādiścha bhavati ya evaṁ veda'],
      meaningHi:
        'जागृत अवस्था वाला वैश्वानर पहली मात्रा अकार है — व्यापकता (आप्ति) के कारण अथवा आदि (प्रथम) होने के कारण। जो इसे इस प्रकार जानता है, वह समस्त कामनाओं को प्राप्त करता है और (सबमें) प्रथम होता है।',
      meaningEn:
        'Vaiśvānara, whose field is the waking state, is the first measure, a — because of pervasiveness (āpti) or because of being first (ādi). One who knows this obtains all desires and becomes first.',
    },
    {
      lines: ['स्वप्नस्थानस्तैजस उकारो द्वितीया मात्रोत्कर्षादुभयत्वाद्वा।', 'उत्कर्षति ह वै ज्ञानसन्ततिं समानश्च भवति नास्याब्रह्मवित्कुले भवति य एवं वेद॥'],
      linesEn: ['svapnasthānastaijasa ukāro dvitīyā mātrotkarṣādubhayatvādvā', 'utkarṣati ha vai jñānasantatiṁ samānaścha bhavati nāsyābrahmavitkule bhavati ya evaṁ veda'],
      meaningHi:
        'स्वप्न अवस्था वाला तैजस दूसरी मात्रा उकार है — उत्कर्ष (श्रेष्ठता) के कारण अथवा उभयत्व (दोनों के बीच होने) के कारण। जो इसे इस प्रकार जानता है, वह ज्ञान की परम्परा को बढ़ाता है, सबके प्रति समान होता है, और उसके कुल में कोई ब्रह्म को न जानने वाला नहीं होता।',
      meaningEn:
        'Taijasa, whose field is the dream state, is the second measure, u — because of superiority (utkarṣa) or because of being in between (ubhayatva). One who knows this exalts the stream of knowledge, becomes equal to all, and none ignorant of Brahman is born in his family.',
    },
    {
      lines: ['सुषुप्तस्थानः प्राज्ञो मकारस्तृतीया मात्रा मितेरपीतेर्वा।', 'मिनोति ह वा इदं सर्वमपीतिश्च भवति य एवं वेद॥'],
      linesEn: ['suṣuptasthānaḥ prājño makārastṛtīyā mātrā miterapītervā', 'minoti ha vā idaṁ sarvamapītiścha bhavati ya evaṁ veda'],
      meaningHi:
        'सुषुप्ति अवस्था वाला प्राज्ञ तीसरी मात्रा मकार है — माप (मिति) के कारण अथवा लय (अपीति) के कारण। जो इसे इस प्रकार जानता है, वह इस सबको माप लेता (यथार्थ जान लेता) है और (सबका) लय-स्थान हो जाता है।',
      meaningEn:
        'Prājña, whose field is deep sleep, is the third measure, m — because of measuring (miti) or because of absorption (apīti). One who knows this measures (knows the truth of) all this and becomes the place of its absorption.',
    },
    {
      lines: ['अमात्रश्चतुर्थोऽव्यवहार्यः प्रपञ्चोपशमः शिवोऽद्वैत एवमोङ्कार आत्मैव।', 'संविशत्यात्मनाऽऽत्मानं य एवं वेद॥'],
      linesEn: ['amātraśchaturtho\'vyavahāryaḥ prapañchopaśamaḥ śivo\'dvaita evamoṅkāra ātmaiva', 'saṁviśatyātmanā\'\'tmānaṁ ya evaṁ veda'],
      meaningHi:
        'मात्रारहित चौथा (तुरीय) अव्यवहार्य, प्रपंच का उपशम, शिव और अद्वैत है। इस प्रकार ओंकार आत्मा ही है। जो इसे इस प्रकार जानता है, वह आत्मा से ही आत्मा में प्रवेश कर जाता है।',
      meaningEn:
        'The fourth is without measure — beyond dealing, the cessation of all phenomena, auspicious, non-dual. Thus Oṁkāra is the Self itself. One who knows this enters the Self by the Self.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Build
// ─────────────────────────────────────────────────────────────────────────────
function verse(ch, slug, numInSection, reference, labelHi, labelEn, body, section) {
  return {
    id: `${slug}-${reference.replace(/\./g, '-')}`,
    upanishad: ch,
    section,
    stanza: ch,
    numInSection,
    reference,
    labelHi,
    labelEn,
    lines: body.lines,
    linesEn: body.linesEn,
    meaningHi: body.meaningHi,
    meaningEn: body.meaningEn,
  };
}

function buildFlat(u) {
  const verses = [];
  verses.push(verse(u.chapter, u.slug, 1, 'shanti', 'शान्ति मन्त्र', 'Shanti Mantra', u.shanti, 'shanti'));
  u.mantras.forEach((m, i) => {
    const n = i + 1;
    verses.push(
      verse(u.chapter, u.slug, verses.length + 1, String(n), `मन्त्र · ${dev(n)}`, `Mantra · ${n}`, m, 'mantra')
    );
  });
  return verses;
}

function buildKhandas(u) {
  const verses = [];
  verses.push(verse(u.chapter, u.slug, 1, 'shanti', 'शान्ति मन्त्र', 'Shanti Mantra', u.shanti, 'shanti'));
  u.khandas.forEach((khanda, ki) => {
    khanda.forEach((m, mi) => {
      const ref = `${ki + 1}.${mi + 1}`;
      verses.push(
        verse(u.chapter, u.slug, verses.length + 1, ref, `मन्त्र · ${dev(ref)}`, `Mantra · ${ref}`, m, 'mantra')
      );
    });
  });
  return verses;
}

const chapters = [
  { u: ISHA, verses: buildFlat(ISHA), mantraCount: ISHA.mantras.length },
  { u: KENA, verses: buildKhandas(KENA), mantraCount: KENA.khandas.reduce((s, k) => s + k.length, 0) },
  { u: MANDUKYA, verses: buildFlat(MANDUKYA), mantraCount: MANDUKYA.mantras.length },
];

mkdirSync(OUT, { recursive: true });
const manifest = [];
for (const { u, verses, mantraCount } of chapters) {
  const summary = {
    chapter: u.chapter,
    titleHi: u.titleHi,
    titleEn: u.titleEn,
    vedaHi: u.vedaHi,
    vedaEn: u.vedaEn,
    mantraCount,
    verseCount: verses.length,
  };
  manifest.push(summary);
  const payload = { ...summary, source: u.source, verses };
  writeFileSync(join(OUT, `chapter-0${u.chapter}.json`), JSON.stringify(payload, null, 2) + '\n');
}
writeFileSync(join(OUT, 'chapters-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(manifest.map((m) => `${m.titleEn}: ${m.mantraCount} mantras, ${m.verseCount} pages`).join('\n'));

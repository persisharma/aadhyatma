import type { VidhiEntry } from './types';

/**
 * श्री सत्यनारायण पूजा — the Phase-1 vidhi (PRD-19).
 *
 * Mantra texts are TRANSCRIBED, never composed (RULEBOOK §11.3): every
 * `mantra.devanagari` below was cross-checked verbatim against DrikPanchang's
 * Satyanarayana Puja Vidhi (shodashopachara) pages — the repo's pinned
 * convention source — and at least one independent published karmakand
 * reference (see `source.referenceUrls` and each mantra's `sourceUrl`).
 * The sankalp step is deliberately instruction-only: its exact liturgical
 * wording could not be verbatim-verified, so no approximation ships (§11.3).
 * The katha and aarti steps reference shipped texts by id — never re-typed
 * (§11.11). `source`/`sourceUrl` fields are for content review only and are
 * never rendered in the app UI.
 */

const DP_VIDHI_EN =
  'https://www.drikpanchang.com/hindu-gods/trimurti/lord-vishnu/puja-vidhi/satyanarayan-puja-vidhi.html';
const DP_VIDHI_HI =
  'https://www.drikpanchang.com/hindu-gods/trimurti/lord-vishnu/puja-vidhi/satyanarayan-puja-vidhi.html?lang=hi';

export const satyanarayanPuja: VidhiEntry = {
  id: 'satyanarayan-puja',
  titleHi: 'श्री सत्यनारायण पूजा',
  titleEn: 'Shri Satyanarayan Puja',
  festivalIds: ['shree-satyanarayan-vrat', 'purnima-vrat'],
  deities: ['vishnu'],
  conventionLineHi: 'दृक्पंचांग पद्धति अनुसार',
  conventionLineEn: 'As per the DrikPanchang method',
  durationHintMin: 60,
  samagri: [
    { itemHi: 'चौकी व पीला/लाल वस्त्र', itemEn: 'Chowki & yellow/red cloth', qty: '1' },
    { itemHi: 'श्री सत्यनारायण प्रतिमा या चित्र', itemEn: 'Murti or picture of Shri Satyanarayan', qty: '1' },
    { itemHi: 'कलश व आम के पत्ते', itemEn: 'Kalash & mango leaves', qty: '1' },
    { itemHi: 'नारियल (श्रीफल)', itemEn: 'Coconut (shriphala)', qty: '1' },
    { itemHi: 'रोली · कुमकुम · हल्दी', itemEn: 'Roli · kumkum · turmeric' },
    { itemHi: 'अक्षत (साबुत चावल)', itemEn: 'Akshat (unbroken rice)' },
    { itemHi: 'कलावा (मौली)', itemEn: 'Kalawa (mauli thread)' },
    { itemHi: 'यज्ञोपवीत (जनेऊ)', itemEn: 'Yajnopavita (sacred thread)' },
    { itemHi: 'अंगवस्त्र (पीत वस्त्र)', itemEn: 'Angavastram (yellow cloth for the deity)' },
    { itemHi: 'चन्दन', itemEn: 'Sandalwood paste' },
    { itemHi: 'पुष्प व माला', itemEn: 'Flowers & garland' },
    { itemHi: 'तुलसी दल', itemEn: 'Tulsi leaves' },
    { itemHi: 'धूप / अगरबत्ती', itemEn: 'Dhoop / incense sticks' },
    { itemHi: 'दीपक · घी · बाती', itemEn: 'Diya · ghee · wicks' },
    { itemHi: 'कपूर', itemEn: 'Camphor' },
    {
      itemHi: 'पंचामृत (दूध, दही, घी, शहद, शक्कर)',
      itemEn: 'Panchamrit (milk, curd, ghee, honey, sugar)',
    },
    { itemHi: 'पंजीरी / सूजी का प्रसाद', itemEn: 'Panjiri / semolina prasad' },
    { itemHi: 'ऋतुफल व केले', itemEn: 'Seasonal fruits & bananas' },
    { itemHi: 'पान · सुपारी', itemEn: 'Paan · betel nut', optional: true },
    { itemHi: 'केले के खंभे (मंडप हेतु)', itemEn: 'Banana stems (for the mandap)', optional: true },
    { itemHi: 'दक्षिणा', itemEn: 'Dakshina', optional: true },
  ],
  steps: [
    // ── आरम्भ · Preparation ────────────────────────────────────────────────
    {
      id: 'sthapana',
      phase: 'prep',
      titleHi: 'स्थान शुद्धि व स्थापना',
      titleEn: 'Purify the space & install the deity',
      instructionHi:
        'पूजा स्थान स्वच्छ कर चौकी पर पीला या लाल वस्त्र बिछाएँ और श्री सत्यनारायण भगवान की प्रतिमा या चित्र स्थापित करें। स्वच्छ, शान्त स्थान से पूजा में एकाग्रता आती है।',
      instructionEn:
        'Clean the puja space, spread a yellow or red cloth on the chowki, and install the murti or picture of Shri Satyanarayan. A clean, calm spot settles the mind for worship.',
    },
    {
      id: 'kalash-deep',
      phase: 'prep',
      titleHi: 'कलश स्थापना व दीप प्रज्वलन',
      titleEn: 'Set the kalash & light the lamp',
      instructionHi:
        'जल भरे कलश पर आम के पत्ते और नारियल रखकर चौकी के पास स्थापित करें, फिर घी का दीपक जलाएँ। कलश मंगल का और दीप पूजा का साक्षी है।',
      instructionEn:
        'Place a water-filled kalash topped with mango leaves and a coconut beside the chowki, then light a ghee lamp. The kalash marks auspiciousness; the lamp stands witness to the vrat.',
    },
    {
      id: 'sankalp',
      phase: 'prep',
      titleHi: 'संकल्प',
      titleEn: 'Sankalp (vow)',
      instructionHi:
        'दाहिने हाथ में जल, अक्षत और पुष्प लेकर अपना नाम, गोत्र, आज की तिथि और मनोकामना बोलते हुए श्री सत्यनारायण व्रत-पूजा का संकल्प लें, फिर जल भूमि पर छोड़ दें। संकल्प से पूजा का उद्देश्य निश्चित होता है।',
      instructionEn:
        'Take water, akshat and a flower in your right palm; speak your name, gotra, today’s tithi and your wish, vowing to perform the Satyanarayan vrat-puja, then release the water. The sankalp fixes the purpose of the puja.',
    },
    // ── मुख्य पूजा · Main worship ──────────────────────────────────────────
    {
      id: 'dhyana',
      phase: 'main',
      titleHi: 'ध्यान',
      titleEn: 'Dhyana (meditation)',
      instructionHi:
        'नेत्र बन्द कर श्री सत्यनारायण भगवान का ध्यान करें और ध्यान-मन्त्र बोलें। ध्यान से मन पूजा में स्थिर होता है।',
      instructionEn:
        'Close your eyes, meditate on Lord Satyanarayan, and recite the dhyana mantra. Dhyana steadies the mind before the offerings begin.',
      mantra: {
        devanagari:
          'ध्यायेत् सत्यं गुणातीतं गुणत्रयसमन्वितम्।\nलोकनाथं त्रिलोकेशं कौस्तुभाभरणं हरिम्॥\nनीलवर्णं पीतवस्त्रं श्रीवत्सपदभूषितम्।\nगोविन्दं गोकुलानन्दं ब्रह्माद्यैरपि पूजितम्॥',
        iast: 'dhyāyet satyaṁ guṇātītaṁ guṇatraya-samanvitam\nlokanāthaṁ trilokeśaṁ kaustubhābharaṇaṁ harim\nnīlavarṇaṁ pītavastraṁ śrīvatsapadabhūṣitam\ngovindaṁ gokulānandaṁ brahmādyairapi pūjitam',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'avahana',
      phase: 'main',
      titleHi: 'आवाहन',
      titleEn: 'Avahana (invocation)',
      instructionHi:
        'हाथ में अक्षत-पुष्प लेकर आवाहन-मन्त्र बोलते हुए भगवान का आवाहन करें और अक्षत-पुष्प प्रतिमा के सम्मुख अर्पित करें। आवाहन से भगवान पूजा में आमंत्रित होते हैं।',
      instructionEn:
        'With akshat and flowers in your joined palms, recite the avahan mantra inviting the Lord, and place them before the murti. Avahana welcomes the deity into the worship.',
      mantra: {
        devanagari: 'दामोदर समागच्छ लक्ष्म्या सह जगत्पते।\nइमां मया कृतां पूजां गृहाण सुरसत्तम॥',
        iast: 'dāmodara samāgaccha lakṣmyā saha jagatpate\nimāṁ mayā kṛtāṁ pūjāṁ gṛhāṇa surasattama',
        sourceUrl: DP_VIDHI_EN,
      },
    },
    {
      id: 'asana',
      phase: 'main',
      titleHi: 'आसन',
      titleEn: 'Asana (offering a seat)',
      instructionHi:
        'पाँच पुष्प अंजलि में लेकर मन्त्र बोलते हुए प्रतिमा के सम्मुख छोड़ें — यह भगवान को आसन अर्पित करना है।',
      instructionEn:
        'Take five flowers in anjali and release them before the murti while reciting the mantra — this offers the Lord a seat.',
      mantra: {
        devanagari: 'ॐ श्रीसत्यनारायणाय नमः। आसनं समर्पयामि॥',
        iast: 'oṁ śrīsatyanārāyaṇāya namaḥ\nāsanaṁ samarpayāmi',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'snana',
      phase: 'main',
      titleHi: 'स्नान',
      titleEn: 'Snana (bathing)',
      instructionHi:
        'भगवान को पहले जल से, फिर पंचामृत से और अन्त में पुनः शुद्ध जल से स्नान कराएँ। स्नान शुद्धि और सेवा का उपचार है।',
      instructionEn:
        'Bathe the deity first with water, then with panchamrit, and finally with pure water again. Snana is the offering of purification and service.',
      mantra: {
        devanagari: 'ॐ श्रीसत्यनारायणाय नमः। स्नानं समर्पयामि॥',
        iast: 'oṁ śrīsatyanārāyaṇāya namaḥ\nsnānaṁ samarpayāmi',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'vastra-yajnopavit',
      phase: 'main',
      titleHi: 'वस्त्र व यज्ञोपवीत',
      titleEn: 'Vastra & yajnopavita',
      instructionHi:
        'भगवान को अंगवस्त्र (या कलावा) और यज्ञोपवीत अर्पित करें। वस्त्र सम्मान का उपचार है।',
      instructionEn:
        'Offer the angavastram (or kalawa) and the sacred thread to the deity. Clothing is the offering of honour.',
      mantra: {
        devanagari:
          'ॐ श्रीसत्यनारायणाय नमः। वस्त्रं समर्पयामि॥\nॐ श्रीसत्यनारायणाय नमः। यज्ञोपवीतं समर्पयामि॥',
        iast: 'oṁ śrīsatyanārāyaṇāya namaḥ, vastraṁ samarpayāmi\noṁ śrīsatyanārāyaṇāya namaḥ, yajñopavītaṁ samarpayāmi',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'gandha',
      phase: 'main',
      titleHi: 'गन्ध-अक्षत',
      titleEn: 'Gandha & akshat',
      instructionHi:
        'चन्दन/रोली से भगवान को तिलक करें और अक्षत अर्पित करें। गन्ध सुगन्ध और आदर का उपचार है।',
      instructionEn:
        'Apply a chandan/roli tilak to the deity and offer akshat. Gandha is the offering of fragrance and reverence.',
      mantra: {
        devanagari: 'ॐ श्रीसत्यनारायणाय नमः। गन्धं समर्पयामि॥',
        iast: 'oṁ śrīsatyanārāyaṇāya namaḥ\ngandhaṁ samarpayāmi',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'pushpa',
      phase: 'main',
      titleHi: 'पुष्प',
      titleEn: 'Pushpa (flowers)',
      instructionHi: 'भगवान को पुष्प और माला अर्पित करें। पुष्प भक्ति की कोमलता का प्रतीक हैं।',
      instructionEn:
        'Offer flowers and the garland to the deity. Flowers stand for the tenderness of devotion.',
      mantra: {
        devanagari: 'ॐ श्रीसत्यनारायणाय नमः। पुष्पं समर्पयामि॥',
        iast: 'oṁ śrīsatyanārāyaṇāya namaḥ\npuṣpaṁ samarpayāmi',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'dhoop',
      phase: 'main',
      titleHi: 'धूप',
      titleEn: 'Dhoop (incense)',
      instructionHi: 'धूप/अगरबत्ती जलाकर भगवान को धूप अर्पित करें (दिखाएँ)।',
      instructionEn: 'Light the dhoop/incense and offer its fragrance to the deity.',
      mantra: {
        devanagari: 'ॐ श्रीसत्यनारायणाय नमः। धूपम् आघ्रापयामि॥',
        iast: 'oṁ śrīsatyanārāyaṇāya namaḥ\ndhūpam āghrāpayāmi',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'deep',
      phase: 'main',
      titleHi: 'दीप',
      titleEn: 'Deep (lamp)',
      instructionHi: 'घी का दीपक भगवान के सम्मुख दिखाएँ। दीप ज्ञान के प्रकाश का प्रतीक है।',
      instructionEn:
        'Show the lit ghee lamp before the deity. The lamp stands for the light of knowledge.',
      mantra: {
        devanagari: 'ॐ श्रीसत्यनारायणाय नमः। दीपं दर्शयामि॥',
        iast: 'oṁ śrīsatyanārāyaṇāya namaḥ\ndīpaṁ darśayāmi',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'naivedya',
      phase: 'main',
      titleHi: 'नैवेद्य',
      titleEn: 'Naivedya (food offering)',
      instructionHi:
        'पंजीरी/सूजी का प्रसाद, ऋतुफल, केले और पंचामृत तुलसी दल सहित भगवान को अर्पित करें। नैवेद्य कृतज्ञता का उपचार है।',
      instructionEn:
        'Offer the panjiri/semolina prasad, seasonal fruits, bananas and panchamrit with tulsi leaves to the deity. Naivedya is the offering of gratitude.',
      mantra: {
        devanagari: 'ॐ श्रीसत्यनारायणाय नमः। नैवेद्यं निवेदयामि॥',
        iast: 'oṁ śrīsatyanārāyaṇāya namaḥ\nnaivedyaṁ nivedayāmi',
        sourceUrl: DP_VIDHI_HI,
      },
    },
    {
      id: 'katha',
      phase: 'main',
      titleHi: 'श्री सत्यनारायण व्रत कथा',
      titleEn: 'Satyanarayan vrat katha',
      instructionHi:
        'परिवार सहित श्री सत्यनारायण व्रत कथा के पाँचों अध्याय पढ़ें या सुनें। कथा-श्रवण ही इस व्रत का हृदय है।',
      instructionEn:
        'Read or listen to all five chapters of the Satyanarayan vrat katha with the family. Hearing the katha is the heart of this vrat.',
      ref: { kind: 'katha', id: 'satyanarayana-vrat-katha' },
    },
    // ── समापन · Closing ────────────────────────────────────────────────────
    {
      id: 'aarti',
      phase: 'closing',
      titleHi: 'आरती',
      titleEn: 'Aarti',
      instructionHi:
        'कपूर या घी के दीप से भगवान की आरती करें और परिवार सहित ॐ जय जगदीश हरे गाएँ।',
      instructionEn:
        'Offer aarti with lit camphor or a ghee lamp and sing Om Jai Jagdish Hare with the family.',
      ref: { kind: 'section', id: 'om-jai-jagdish' },
    },
    {
      id: 'kshama-prasad',
      phase: 'closing',
      titleHi: 'क्षमा-प्रार्थना व प्रसाद',
      titleEn: 'Kshama-prarthana & prasad',
      instructionHi:
        'परिक्रमा कर क्षमा-प्रार्थना बोलें, फिर सभी को पंजीरी-पंचामृत का प्रसाद बाँटें। त्रुटियों के लिए क्षमा माँगकर पूजा पूर्ण होती है।',
      instructionEn:
        'Circumambulate, recite the kshama-prarthana, then distribute the panjiri and panchamrit prasad to everyone. Asking forgiveness for lapses completes the puja.',
      mantra: {
        devanagari: 'मन्त्रहीनं क्रियाहीनं भक्तिहीनं जनार्दन।\nयत्पूजितं मया देव परिपूर्णं तदस्तु मे॥',
        iast: 'mantrahīnaṁ kriyāhīnaṁ bhaktihīnaṁ janārdana\nyatpūjitaṁ mayā deva paripūrṇaṁ tadastu me',
        sourceUrl: 'https://blog.shlokmantra.com/kshama-prarthana/',
      },
    },
  ],
  source: {
    canonicalEdition:
      'Gita Press (Gorakhpur) — Satyanarayan Vrat Katha / Nitya Karma Puja Prakash (Satyanarayan puja-vidhi chapters)',
    canonicalEditionUrls: [
      'https://archive.org/search?query=nitya+karma+puja+prakash+gita+press',
    ],
    canonicalEditionStatus:
      'PENDING — the Gita Press scans on archive.org could not be opened from the authoring environment (network egress to archive.org blocked, 2026-08-12). To clear: open the Nitya Karma Puja Prakash / Satyanarayan Vrat Katha scan, check every mantra below character-by-character, then replace this status with a dated verified note (the Valmiki Ramayana source block is the worked example).',
    referenceUrls: [
      'https://www.drikpanchang.com/hindu-gods/trimurti/lord-vishnu/puja-vidhi/satyanarayan-puja-vidhi.html',
      'https://www.drikpanchang.com/hindu-gods/trimurti/lord-vishnu/puja-vidhi/satyanarayan-puja-vidhi.html?lang=hi',
      'https://www.drikpanchang.com/vrat-katha/satyanarayana/pujan-vidhi/satyanarayana-vrat-pujan-vidhi.html',
      'https://www.drikpanchang.com/vrat-katha/satyanarayana/pujan-samagri/satyanarayan-vrat-pujan-samagri.html',
      'https://ptvaishnavi.blogspot.com/2020/05/satya-narayan-puja-vidhi.html',
      'https://www.smartpuja.com/blog/satyanarayan-puja-mantra/',
      'https://blog.shlokmantra.com/kshama-prarthana/',
    ],
    retrievedOn: '2026-08-12',
    notes:
      'Every mantra was cross-checked verbatim against DrikPanchang’s Satyanarayana Puja Vidhi (shodashopachara) pages and at least one independent published karmakand reference each, via search-indexed page excerpts on 2026-08-12 (direct page fetches were blocked in the authoring environment — hence the pending canonical-edition check above). The step sequence and samagri follow DrikPanchang’s published vidhi/samagri pages. The sankalp step is instruction-only because its exact liturgical wording was not verbatim-verifiable (RULEBOOK §11.3 — never approximate). Step instructions are authored fresh (RULEBOOK §9). The katha and aarti steps reference shipped texts by id (satyanarayana-vrat-katha, om-jai-jagdish) — no liturgical text is duplicated (§11.11).',
  },
};

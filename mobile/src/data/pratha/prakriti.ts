/**
 * प्रथा और मान्यता — प्रकृति — trees, animals and rivers (Appendix A.6).
 *
 * GENERATED DRAFTS (PRD-46 Phase 0, 2026-10-28). Every row is an app-authored
 * retelling that no reviewer has checked against an opened source, so every
 * row is `status: 'draft'` and renders nowhere. To verify a row: open two
 * sources for each katha's canon line, correct the copy, replace the draft
 * note with a dated adjudication, and flip `status` (RULEBOOK §32). Once a
 * row is edited by hand this file is canonical — do not regenerate it.
 */
import type { PrathaEntry } from './types';

export const PRATHA_PRAKRITI_ENTRIES: readonly PrathaEntry[] = [
  {
    id: 'PR1',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'पीपल की पूजा क्यों करते हैं, और उसे काटते क्यों नहीं?',
    questionEn: 'Why do we worship the peepal, and why is it not cut down?',
    practiceHi: 'पीपल को जल चढ़ाया जाता है, उसकी परिक्रमा की जाती है और शनिवार को उसके नीचे दीया जलाया जाता है। पीपल का पेड़ काटने से लोग बचते हैं।',
    practiceEn: 'Water is offered to the peepal, people walk around it, and on Saturdays a lamp is lit beneath it. People avoid cutting down a peepal tree.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'वृक्षों में मैं अश्वत्थ',
        titleEn: 'Among trees, I am the ashvattha',
        bodyHi: [
          'विभूति-योग में कृष्ण अपनी विभूतियाँ गिनाते हुए कहते हैं कि सब वृक्षों में वे अश्वत्थ, यानी पीपल हैं। इसी से पीपल को ईश्वर की उपस्थिति मानकर पूजा जाता है।',
        ],
        bodyEn: [
          'In the Vibhuti Yoga, as he lists his divine glories, Krishna says that among all trees he is the ashvattha, that is, the peepal. This is why the peepal is worshipped as a presence of God.',
        ],
        canonHi: 'भगवद्गीता 10.26',
        canonEn: 'Bhagavad Gita 10.26',
        ref: {
          kind: 'gita',
          chapter: 10,
          verseIndex: 25,
        },
      },
      {
        tier: 'purana',
        titleHi: 'पिप्पलाद और शनि',
        titleEn: 'Pippalada and Shani',
        bodyHi: [
          'पीपल के फल खाकर पलने के कारण ऋषि पिप्पलाद का यह नाम पड़ा, और उनकी कथा में शनि से उनका सामना होता है। शनिवार को पीपल के नीचे दीया जलाने की प्रथा इसी प्रसंग से जोड़ी जाती है।',
        ],
        bodyEn: [
          'The sage Pippalada got his name because he grew up eating the fruit of the peepal, and in his story he comes face to face with Shani. The custom of lighting a lamp under the peepal on Saturdays is linked with this episode.',
        ],
        canonHi: 'शिव पुराण, शतरुद्र संहिता (अध्याय समीक्षाधीन)',
        canonEn: 'Shiva Purana, Shatarudra Samhita (adhyaya under review)',
      },
    ],
    bhavHi: 'एक वृक्ष में ईश्वर की विभूति देखना पूरे प्रकृति-जगत में दिव्यता देखने का ही एक रूप है।',
    bhavEn: 'Seeing God\'s glory in one tree is a way of seeing the divine in the whole of nature.',
    anchors: {
      prathaIds: [
        'W6',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [
        'repo:mobile/src/data/gita/chapter-10.json',
      ],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhagavad Gita 10.26 | Shiva Purana, Shatarudra Samhita (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR2',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'बरगद (वट) की पूजा क्यों होती है?',
    questionEn: 'Why is the banyan (vat) worshipped?',
    practiceHi: 'वट सावित्री जैसे व्रतों में बरगद की पूजा होती है — जल चढ़ाकर और तने पर कच्चा सूत लपेटते हुए परिक्रमा करके।',
    practiceEn: 'During fasts such as Vat Savitri, the banyan is worshipped. Water is offered, and people walk around it while winding raw cotton thread around its trunk.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'सावित्री और सत्यवान',
        titleEn: 'Savitri and Satyavan',
        bodyHi: [
          'सावित्री ने यमराज के पीछे-पीछे चलते हुए अपनी बुद्धि और निष्ठा से पति सत्यवान के प्राण लौटा लिए। मान्यता है कि सत्यवान ने वट वृक्ष के नीचे ही प्राण छोड़े थे, इसलिए इस व्रत में बरगद पूजा जाता है।',
        ],
        bodyEn: [
          'Walking behind Yama, Savitri won back the life of her husband Satyavan through her wisdom and devotion. It is believed that Satyavan breathed his last under a banyan tree, which is why the banyan is worshipped in this fast.',
        ],
        canonHi: 'महाभारत, वन पर्व',
        canonEn: 'Mahabharata, Vana Parva',
      },
      {
        tier: 'lok',
        titleHi: 'अक्षयवट',
        titleEn: 'Akshayavat',
        bodyHi: [
          'मान्यता है कि प्रलय में जब सब कुछ जल में डूब जाता है, तब भी अक्षयवट बना रहता है। इसी से बरगद को अक्षय और स्थिर जीवन का प्रतीक माना जाता है।',
        ],
        bodyEn: [
          'It is believed that at pralaya, the dissolution of the world, when everything sinks beneath the waters, the Akshayavat still remains. This is why the banyan is seen as a symbol of undying, steady life.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'वट के नीचे दक्षिणामूर्ति',
        titleEn: 'Dakshinamurti under the banyan',
        bodyHi: [
          'शिव का गुरु-रूप दक्षिणामूर्ति वटवृक्ष के नीचे बैठकर ऋषियों को मौन से ज्ञान देता है। इसलिए बरगद को गुरु और ज्ञान से भी जोड़ा जाता है।',
        ],
        bodyEn: [
          'Dakshinamurti, Shiva in the form of the guru, sits beneath a banyan tree and imparts knowledge to the rishis through silence. So the banyan is also linked with the guru and with knowledge.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'बरगद लम्बी आयु, स्थिरता और ज्ञान — तीनों का प्रतीक बनकर कई कथाओं में आता है।',
    bhavEn: 'The banyan appears in many stories as a symbol of three things: long life, steadiness and knowledge.',
    anchors: {
      prathaIds: [
        'V4',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Mahabharata, Vana Parva | Folk tradition | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR3',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'तुलसी की पूजा क्यों होती है?',
    questionEn: 'Why is Tulsi worshipped?',
    practiceHi: 'घरों में तुलसी को रोज़ जल चढ़ाया जाता है और शाम को उसके पास दीया जलाया जाता है; कार्तिक में तुलसी-विवाह होता है।',
    practiceEn: 'In homes, water is offered to Tulsi every day and a lamp is lit beside it in the evening. In Kartik, the Tulsi Vivah is held.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'वृन्दा की निष्ठा',
        titleEn: 'Vrinda\'s faithfulness',
        bodyHi: [
          'असुर जालन्धर अपनी पत्नी वृन्दा के पतिव्रत के बल से अजेय था। विष्णु ने छल से वह व्रत भंग किया, तब जालन्धर मारा गया, और वृन्दा ने विष्णु को शाप दिया।',
        ],
        bodyEn: [
          'The asura Jalandhara was invincible through the power of his wife Vrinda\'s faithfulness. Vishnu broke that vow through deceit. Jalandhara was then killed, and Vrinda cursed Vishnu.',
        ],
        canonHi: 'शिव पुराण, रुद्र संहिता, युद्ध खण्ड (अध्याय समीक्षाधीन)',
        canonEn: 'Shiva Purana, Rudra Samhita, Yuddha Khanda (adhyaya under review)',
      },
      {
        tier: 'purana',
        titleHi: 'तुलसी-विवाह',
        titleEn: 'Tulsi Vivah',
        bodyHi: [
          'परम्परा में वृन्दा तुलसी के रूप में पूजी जाती हैं और विष्णु शालिग्राम के रूप में। हर कार्तिक में तुलसी और शालिग्राम का विवाह इसी कथा की स्मृति में होता है।',
        ],
        bodyEn: [
          'In tradition, Vrinda is worshipped as Tulsi and Vishnu as the Shaligram. Every Kartik, the marriage of Tulsi and the Shaligram is held in memory of this story.',
        ],
        canonHi: 'पद्म पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Padma Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'तुलसी में निष्ठा की कथा बसती है — इसीलिए वह आँगन का पौधा भी है और पूजा का अंग भी।',
    bhavEn: 'Tulsi carries a story of faithfulness. That is why she is both the plant in the courtyard and a part of worship.',
    anchors: {
      prathaIds: [
        'K6',
        'N6',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Shiva Purana, Rudra Samhita, Yuddha Khanda (adhyaya under review) | Padma Purana (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR4',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'आँवले के पेड़ की पूजा क्यों होती है?',
    questionEn: 'Why is the amla tree worshipped?',
    practiceHi: 'कार्तिक की आँवला नवमी और फाल्गुन की आमलकी एकादशी पर आँवले के पेड़ की पूजा होती है; आँवला नवमी पर कई जगह उसके नीचे बैठकर भोजन किया जाता है।',
    practiceEn: 'The amla tree is worshipped on Amla Navami in Kartik and on Amalaki Ekadashi in Phalgun. On Amla Navami, in many places, people sit beneath it to eat a meal.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'लक्ष्मी की एक साथ पूजा',
        titleEn: 'Lakshmi\'s joint worship',
        bodyHi: [
          'लोक-कथा के अनुसार लक्ष्मी विष्णु और शिव की एक साथ पूजा करना चाहती थीं। तुलसी विष्णु को प्रिय है और बेल शिव को, और आँवले में दोनों के गुण माने गए — इसलिए उन्होंने आँवले के पेड़ की पूजा की और उसी के नीचे भोजन कराया।',
        ],
        bodyEn: [
          'According to a folk tale, Lakshmi wished to worship Vishnu and Shiva together. Tulsi is dear to Vishnu and bel to Shiva, and the amla was held to have the qualities of both. So she worshipped the amla tree and served a meal beneath it.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'आँवले का जन्म',
        titleEn: 'The birth of the amla',
        bodyHi: [
          'आमलकी एकादशी की कथाओं में आँवले का वृक्ष कहीं विष्णु के और कहीं ब्रह्मा के आँसू से उत्पन्न बताया जाता है। इसी से आँवले को विष्णु का प्रिय वृक्ष माना जाता है।',
        ],
        bodyEn: [
          'In the stories of Amalaki Ekadashi, the amla tree is said in some versions to have sprung from a tear of Vishnu, and in others from a tear of Brahma. This is why the amla is considered a tree dear to Vishnu.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'एक ही वृक्ष में विष्णु और शिव दोनों का भाव देखना — भेद के बीच एकता की दृष्टि।',
    bhavEn: 'Seeing both Vishnu and Shiva in a single tree: a vision of unity amid difference.',
    anchors: {
      prathaIds: [
        'K23',
        'F6',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'PR5',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'बेल के पेड़ और बेलपत्र को पवित्र क्यों मानते हैं?',
    questionEn: 'Why are the bel tree and bel leaves considered sacred?',
    practiceHi: 'शिव-पूजा में बेलपत्र, प्रायः तीन पत्तियों वाला, चढ़ाया जाता है, और बेल के पेड़ को शिव का प्रिय माना जाता है।',
    practiceEn: 'In Shiva worship, a bel leaf, usually one with three leaflets, is offered, and the bel tree is considered dear to Shiva.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'शिकारी की अनजानी पूजा',
        titleEn: 'The hunter\'s unknowing worship',
        bodyHi: [
          'शिवरात्रि की रात एक शिकारी बेल के पेड़ पर जागता रहा, और उसके तोड़े बेलपत्र अनजाने में नीचे शिवलिंग पर गिरते रहे। इस अनजानी पूजा से भी शिव प्रसन्न हुए।',
        ],
        bodyEn: [
          'On the night of Shivaratri, a hunter stayed awake in a bel tree, and the bel leaves he plucked kept falling, without his knowing it, onto a Shivalinga below. Shiva was pleased even by this unknowing worship.',
        ],
        canonHi: 'शिव पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Shiva Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'बेल की कथा बताती है कि सहज, अनजाना अर्पण भी शिव तक पहुँचता है।',
    bhavEn: 'The story of the bel shows that even a simple, unknowing offering reaches Shiva.',
    anchors: {
      prathaIds: [
        'F1',
        'PN4',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Shiva Purana (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR6',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'दशहरे पर शमी की पूजा क्यों होती है?',
    questionEn: 'Why is the shami tree worshipped on Dussehra?',
    practiceHi: 'दशहरे पर शमी वृक्ष की पूजा होती है, और कई परम्पराओं में इसी दिन शस्त्र-पूजा भी की जाती है।',
    practiceEn: 'On Dussehra, the shami tree is worshipped, and in many traditions weapons are also worshipped on this day.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'शमी में छिपे अस्त्र',
        titleEn: 'Weapons hidden in the shami',
        bodyHi: [
          'अज्ञातवास से पहले पाण्डवों ने अपने अस्त्र-शस्त्र एक शमी वृक्ष पर छिपा दिए थे। अज्ञातवास के अन्त में अर्जुन ने वहीं से गाण्डीव उतारा।',
          'दशहरे पर शमी-पूजन और शस्त्र-पूजा को इसी प्रसंग से जोड़ा जाता है।',
        ],
        bodyEn: [
          'Before their year in hiding, the Pandavas hid their weapons in a shami tree. At the end of that year in hiding, Arjuna took the Gandiva down from that same tree.',
          'The shami puja and the worship of weapons on Dussehra are linked with this episode.',
        ],
        canonHi: 'महाभारत, विराट पर्व',
        canonEn: 'Mahabharata, Virata Parva',
      },
    ],
    bhavHi: 'जो वृक्ष कठिन समय में धरोहर का रक्षक बना, उसके प्रति कृतज्ञता शमी-पूजन में दिखती है।',
    bhavEn: 'The shami puja shows gratitude toward a tree that kept something precious safe in hard times.',
    anchors: {
      prathaIds: [
        'AS5',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Mahabharata, Virata Parva. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR7',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'गुरुवार को केले के पेड़ की पूजा क्यों होती है?',
    questionEn: 'Why is the banana tree worshipped on Thursdays?',
    practiceHi: 'गुरुवार को कई घरों में केले के पेड़ की पूजा होती है — जल और पीली वस्तुएँ चढ़ाकर।',
    practiceEn: 'On Thursdays, in many homes, the banana tree is worshipped with offerings of water and yellow items.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'बृहस्पतिवार की व्रत-कथा',
        titleEn: 'The Thursday fast story',
        bodyHi: [
          'गुरुवार की लोक व्रत-कथा में एक रानी धन से ऊबकर उसके चले जाने की कामना करती है, और बाद में बृहस्पति का व्रत करके घर की सुख-समृद्धि लौटाती है। इस व्रत के साथ पीला रंग और केले के पेड़ की पूजा जुड़ी है, क्योंकि लोक में केले को विष्णु और बृहस्पति से जोड़ा जाता है।',
        ],
        bodyEn: [
          'In the folk fast story for Thursday, a queen grows weary of wealth and wishes it gone. Later, by keeping the fast of Brihaspati, she brings happiness and prosperity back to her home. The colour yellow and the worship of the banana tree are tied to this fast, because among the people the banana is linked with Vishnu and Brihaspati.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'कथा में सम्पन्नता का आना-जाना मन के भाव से जुड़ा है — जो मिला है, उसके प्रति कृतज्ञता का भाव।',
    bhavEn: 'In the story, the coming and going of prosperity is tied to the state of the mind. It speaks of gratitude for what one has received.',
    anchors: {
      prathaIds: [
        'W4',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'PR8',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'नीम को पूजनीय क्यों माना जाता है?',
    questionEn: 'Why is neem held in reverence?',
    practiceHi: 'नववर्ष (गुड़ी पड़वा, उगादि) पर नीम की कोंपलें गुड़ के साथ खाई जाती हैं, और शीतला माता की पूजा में नीम का विशेष स्थान है।',
    practiceEn: 'At the New Year (Gudi Padwa, Ugadi), tender neem shoots are eaten with jaggery, and neem has a special place in the worship of Sheetala Mata.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'दक्षिण और पश्चिम भारत',
        regionEn: 'South and West India',
        titleHi: 'नववर्ष का नीम-गुड़',
        titleEn: 'Neem and jaggery at the New Year',
        bodyHi: [
          'चैत्र शुक्ल प्रतिपदा के नववर्ष पर नीम और गुड़ साथ खाए जाते हैं, और उगादि पचड़ी में छह स्वाद मिलाए जाते हैं। कड़वा और मीठा साथ लेना आने वाले वर्ष के सुख-दुःख को एक साथ स्वीकारने का संकेत माना जाता है।',
        ],
        bodyEn: [
          'At the New Year on Chaitra Shukla Pratipada, neem and jaggery are eaten together, and six tastes are mixed in Ugadi pachadi. Taking the bitter and the sweet together is seen as a sign of accepting the joys and sorrows of the coming year as one.',
        ],
        canonHi: 'लोक-परम्परा (दक्षिण और पश्चिम भारत)',
        canonEn: 'Folk tradition (South and West India)',
      },
      {
        tier: 'lok',
        titleHi: 'शीतला माता और नीम',
        titleEn: 'Sheetala Mata and neem',
        bodyHi: [
          'शीतला ठण्डक देने वाली देवी हैं, जिन्हें चेचक और ज्वर से जोड़ा जाता है। लोक में नीम को उनसे जोड़ा जाता है, और बसोड़ा के दिन उनके लिए चूल्हा नहीं जलता — ठण्डा भोजन ही चढ़ता है।',
        ],
        bodyEn: [
          'Sheetala is a goddess who brings coolness, and she is associated with smallpox and fever. Among the people, neem is linked with her, and on the day of Basoda no stove is lit for her. Only cold food is offered.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'नीम कड़वा है पर शीतल — परम्परा उसे जीवन के कड़वे-मीठे से भी जोड़ती है और ताप के बाद की ठण्डक से भी।',
    bhavEn: 'Neem is bitter, yet cooling. Tradition links it with life\'s bitter and sweet, and with the coolness that follows heat.',
    anchors: {
      prathaIds: [
        'C1',
        'C4',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (South and West India) | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'PR9',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'अशोक वृक्ष की पूजा क्यों होती है?',
    questionEn: 'Why is the ashoka tree worshipped?',
    practiceHi: 'चैत्र शुक्ल अष्टमी (अशोकाष्टमी) पर कई क्षेत्रों में अशोक वृक्ष की पूजा होती है। \'अशोक\' का अर्थ है शोक से रहित।',
    practiceEn: 'On Chaitra Shukla Ashtami (Ashokashtami), the ashoka tree is worshipped in many regions. \'Ashoka\' means free of sorrow.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'अशोक-वाटिका में सीता',
        titleEn: 'Sita in the Ashoka grove',
        bodyHi: [
          'रावण ने सीता को लंका की अशोक-वाटिका में रखा, जहाँ वे राम की प्रतीक्षा करती रहीं। वहीं हनुमान ने उन्हें खोज निकाला और राम की अँगूठी देकर उनका सन्देश सुनाया।',
        ],
        bodyEn: [
          'Ravana kept Sita in the Ashoka grove in Lanka, where she waited for Rama. It was there that Hanuman found her, gave her Rama\'s ring and told her his message.',
        ],
        canonHi: 'वाल्मीकि रामायण, सुन्दरकाण्ड',
        canonEn: 'Valmiki Ramayana, Sundara Kanda',
      },
    ],
    bhavHi: 'जिस वाटिका में सीता ने सबसे कठिन प्रतीक्षा की, उसका नाम ही शोक से मुक्ति की आशा कहता है।',
    bhavEn: 'The grove where Sita endured her hardest wait carries, in its very name, the hope of release from sorrow.',
    anchors: {},
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Valmiki Ramayana, Sundara Kanda. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR10',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'गाय की पूजा क्यों होती है?',
    questionEn: 'Why is the cow worshipped?',
    practiceHi: 'गोपाष्टमी पर गायों को नहलाकर, सजाकर पूजा जाता है, और कई घरों में पहली रोटी गाय के लिए निकाली जाती है।',
    practiceEn: 'On Gopashtami, cows are bathed, decorated and worshipped, and in many homes the first roti is set aside for the cow.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'गायों में मैं कामधेनु',
        titleEn: 'Among cows, I am Kamadhenu',
        bodyHi: [
          'विभूति-योग में कृष्ण कहते हैं कि गायों में वे कामधुक्, यानी कामधेनु हैं — वह गाय जो हर इच्छा पूरी करती है। इसी से गाय को दिव्य और पोषण देने वाली माना जाता है।',
        ],
        bodyEn: [
          'In the Vibhuti Yoga, Krishna says that among cows he is Kamadhuk, that is, Kamadhenu, the cow who fulfils every wish. This is why the cow is seen as divine and as a giver of nourishment.',
        ],
        canonHi: 'भगवद्गीता 10.28',
        canonEn: 'Bhagavad Gita 10.28',
        ref: {
          kind: 'gita',
          chapter: 10,
          verseIndex: 27,
        },
      },
      {
        tier: 'lok',
        titleHi: 'गोपाष्टमी',
        titleEn: 'Gopashtami',
        bodyHi: [
          'लोक-मान्यता है कि गोपाष्टमी के दिन बालक कृष्ण ने बछड़े चराने से आगे बढ़कर पहली बार गायें चराना आरम्भ किया। इसी की स्मृति में इस दिन गायों की पूजा होती है।',
        ],
        bodyEn: [
          'It is popularly believed that on the day of Gopashtami, the child Krishna moved on from tending calves and began tending cows for the first time. Cows are worshipped on this day in memory of that.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'गाय को माँ की तरह पोषण देने वाली मानकर उसका आदर करना — कृतज्ञता का भाव।',
    bhavEn: 'Honouring the cow as one who nourishes like a mother: a feeling of gratitude.',
    anchors: {},
    status: 'draft',
    source: {
      referenceUrls: [
        'repo:mobile/src/data/gita/chapter-10.json',
      ],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhagavad Gita 10.28 | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR11',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'श्राद्ध में कौए को भोजन क्यों देते हैं?',
    questionEn: 'Why is food given to crows during Shraddha?',
    practiceHi: 'श्राद्ध के भोजन का एक भाग कौए के लिए निकाला जाता है।',
    practiceEn: 'A portion of the Shraddha meal is set aside for crows.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'पितरों तक भोजन',
        titleEn: 'Food for the ancestors',
        bodyHi: [
          'श्राद्ध की पंचबलि में एक भाग कौए का होता है, और लोक में कौए को पितरों तक भोजन पहुँचाने वाला माना जाता है। इसकी पूरी कथा और विधि पितृ-पक्ष खण्ड में है।',
        ],
        bodyEn: [
          'In the panchabali of Shraddha, one portion belongs to the crow, and among the people the crow is regarded as the one who carries food to the ancestors. The full story and ritual are in the Pitru Paksha section.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'पितरों के नाम का एक भाग किसी जीव तक पहुँचाना — स्मृति और कृतज्ञता का भाव।',
    bhavEn: 'Bringing a portion in the ancestors\' name to a living creature: a feeling of remembrance and gratitude.',
    anchors: {
      pitru: true,
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'PR12',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'कुत्ते को भोजन क्यों कराते हैं, और उसे भैरव से क्यों जोड़ते हैं?',
    questionEn: 'Why are dogs fed, and why are they linked with Bhairava?',
    practiceHi: 'कई घरों और भैरव-मन्दिरों में कुत्तों को भोजन कराया जाता है; काल भैरव अष्टमी पर यह विशेष रूप से होता है।',
    practiceEn: 'In many homes and Bhairava temples, dogs are fed. This is done especially on Kala Bhairava Ashtami.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'भैरव का वाहन',
        titleEn: 'Bhairava\'s mount',
        bodyHi: [
          'भैरव शिव के उग्र रूप के रूप में प्रकट हुए, और श्वान उनका वाहन है। काशी में भैरव को नगर का कोतवाल माना जाता है।',
        ],
        bodyEn: [
          'Bhairava appeared as a fierce form of Shiva, and the dog is his mount. In Kashi, Bhairava is regarded as the kotwal, the guardian of the city.',
        ],
        canonHi: 'शिव पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Shiva Purana (adhyaya under review)',
      },
      {
        tier: 'shastra',
        titleHi: 'युधिष्ठिर का श्वान',
        titleEn: 'Yudhishthira\'s dog',
        bodyHi: [
          'स्वर्ग की अन्तिम यात्रा में एक कुत्ता युधिष्ठिर के साथ अन्त तक चलता रहा। इन्द्र ने उसे छोड़कर रथ पर चढ़ने को कहा, पर युधिष्ठिर ने अपने आश्रित को छोड़ने से मना कर दिया।',
          'तब वह कुत्ता धर्म के रूप में प्रकट हुआ।',
        ],
        bodyEn: [
          'On the final journey to heaven, a dog walked with Yudhishthira to the very end. Indra told him to leave it behind and climb into the chariot, but Yudhishthira refused to abandon one who depended on him.',
          'Then the dog revealed itself as Dharma.',
        ],
        canonHi: 'महाभारत, महाप्रस्थानिक पर्व',
        canonEn: 'Mahabharata, Mahaprasthanika Parva',
      },
    ],
    bhavHi: 'जो साथ निभाए, उसे न छोड़ना — कुत्ते के प्रति आदर में यही निष्ठा याद की जाती है।',
    bhavEn: 'Not abandoning one who stands by you: this is the loyalty remembered in respect for the dog.',
    anchors: {
      prathaIds: [
        'M4',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Shiva Purana (adhyaya under review) | Mahabharata, Mahaprasthanika Parva. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR13',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'नाग पंचमी पर नाग की पूजा क्यों होती है?',
    questionEn: 'Why are snakes worshipped on Nag Panchami?',
    practiceHi: 'नाग पंचमी पर नाग देवता की प्रतिमा या चित्र की पूजा होती है और दूध चढ़ाया जाता है। साँप स्वभाव से दूध नहीं पीते, इसलिए दूध प्रतिमा या चित्र को ही चढ़ाया जाता है।',
    practiceEn: 'On Nag Panchami, an image or picture of the Nag Devata is worshipped and milk is offered. Snakes do not naturally drink milk, so the milk is offered to the image or picture itself.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'आस्तीक और सर्प-सत्र',
        titleEn: 'Astika and the snake sacrifice',
        bodyHi: [
          'राजा जनमेजय ने अपने पिता परीक्षित की तक्षक के डसने से हुई मृत्यु के बाद सर्प-सत्र किया, जिसमें नाग अग्नि में गिरने लगे। ऋषि-कुमार आस्तीक ने राजा से वर माँगकर वह यज्ञ रुकवाया और नागों की रक्षा की।',
        ],
        bodyEn: [
          'After his father Parikshit died from Takshaka\'s bite, King Janamejaya held a snake sacrifice in which snakes began falling into the fire. The young sage Astika asked the king for a boon, had the sacrifice stopped, and saved the snakes.',
        ],
        canonHi: 'महाभारत, आदि पर्व',
        canonEn: 'Mahabharata, Adi Parva',
      },
    ],
    bhavHi: 'नाग-पूजा उस जीव के प्रति आदर है जिससे मनुष्य प्रायः डरता है — भय की जगह सह-अस्तित्व का भाव।',
    bhavEn: 'Snake worship is respect for a creature people often fear. It puts a sense of living together in place of fear.',
    anchors: {
      prathaIds: [
        'S5',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Mahabharata, Adi Parva. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR14',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'घर में गंगाजल क्यों रखते हैं?',
    questionEn: 'Why do we keep Ganga water at home?',
    practiceHi: 'घरों में गंगाजल किसी पात्र में सँभालकर रखा जाता है, और पूजा व शुद्धि के अवसरों पर उसका उपयोग होता है।',
    practiceEn: 'In homes, Ganga water is kept carefully in a vessel and used for puja and on occasions of purification.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'धाराओं में मैं जाह्नवी',
        titleEn: 'Among streams, I am the Jahnavi',
        bodyHi: [
          'विभूति-योग में कृष्ण कहते हैं कि बहने वाली धाराओं में वे जाह्नवी, यानी गंगा हैं। इसी से गंगा का थोड़ा-सा जल भी पवित्र माना जाता है।',
        ],
        bodyEn: [
          'In the Vibhuti Yoga, Krishna says that among flowing streams he is the Jahnavi, that is, the Ganga. This is why even a little Ganga water is considered sacred.',
        ],
        canonHi: 'भगवद्गीता 10.31',
        canonEn: 'Bhagavad Gita 10.31',
        ref: {
          kind: 'gita',
          chapter: 10,
          verseIndex: 30,
        },
      },
      {
        tier: 'shastra',
        titleHi: 'भगीरथ और गंगावतरण',
        titleEn: 'Bhagiratha and the descent of the Ganga',
        bodyHi: [
          'राजा भगीरथ ने कठोर तप करके गंगा को स्वर्ग से धरती पर उतारा, ताकि उनके पूर्वज, सगर के पुत्र, मुक्ति पा सकें। शिव ने गंगा का वेग अपनी जटाओं में थामा।',
          'राह में ऋषि जह्नु ने गंगा को पी लिया और फिर छोड़ा, इसलिए वे जाह्नवी कहलाईं।',
        ],
        bodyEn: [
          'Through hard austerities, King Bhagiratha brought the Ganga down from heaven to earth so that his ancestors, the sons of Sagara, could attain liberation. Shiva held back the force of the Ganga in his matted locks.',
          'On the way, the sage Jahnu drank up the Ganga and then released her, which is why she came to be called Jahnavi.',
        ],
        canonHi: 'वाल्मीकि रामायण, बालकाण्ड 38–44',
        canonEn: 'Valmiki Ramayana, Bala Kanda 38–44',
      },
    ],
    bhavHi: 'घर में रखा थोड़ा-सा गंगाजल पूरी गंगा की स्मृति को घर तक ले आता है।',
    bhavEn: 'A little Ganga water kept at home brings the memory of the whole Ganga into the house.',
    anchors: {
      prathaIds: [
        'J1',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [
        'repo:mobile/src/data/gita/chapter-10.json',
      ],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhagavad Gita 10.31 | Valmiki Ramayana, Bala Kanda 38–44. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'PR15',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'नर्मदा के हर कंकर को शंकर क्यों कहते हैं?',
    questionEn: 'Why is every pebble of the Narmada called Shankar?',
    practiceHi: 'नर्मदा से निकले पत्थर बाणलिंग के रूप में शिव मानकर पूजे जाते हैं। कई श्रद्धालु पैदल नर्मदा की परिक्रमा करते हैं, जिसमें नदी को पार नहीं किया जाता।',
    practiceEn: 'Stones from the Narmada are worshipped as Shiva, in the form of banalingas. Many devotees walk the circuit of the Narmada on foot, and on this circuit the river is not crossed.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'नर्मदा का वर',
        titleEn: 'The Narmada\'s boon',
        bodyHi: [
          'कथा के अनुसार नर्मदा को यह वर मिला कि उनके जल के पत्थर शिव-रूप में पूजे जाएँगे। इसी से कहावत बनी — नर्मदा का हर कंकर शंकर।',
        ],
        bodyEn: [
          'According to the story, the Narmada received the boon that the stones in her waters would be worshipped as forms of Shiva. From this came the saying: every pebble of the Narmada is Shankar.',
        ],
        canonHi: 'स्कन्द पुराण, रेवा खण्ड (अध्याय समीक्षाधीन)',
        canonEn: 'Skanda Purana, Reva Khanda (adhyaya under review)',
      },
    ],
    bhavHi: 'जिस नदी का हर पत्थर शिव माना जाए, उसकी परिक्रमा पूरी नदी को एक तीर्थ मानने का भाव है।',
    bhavEn: 'Circling a river where every stone is seen as Shiva expresses the feeling that the whole river is one place of pilgrimage.',
    anchors: {},
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Skanda Purana, Reva Khanda (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'PR16',
    axis: 'prakriti',
    kind: 'pratha',
    phase: 3,
    questionHi: 'नदी में सिक्का क्यों डालते हैं?',
    questionEn: 'Why do people drop a coin into a river?',
    practiceHi: 'नदी पार करते समय या उसमें स्नान के बाद कई लोग नदी में सिक्का डालते हैं।',
    practiceEn: 'Many people drop a coin into a river when crossing it or after bathing in it.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'नदी को भेंट',
        titleEn: 'A gift to the river',
        bodyHi: [
          'लोक में नदी को माँ और देवी माना जाता है, और उसके पास जाकर कुछ भेंट देने की प्रथा है। सिक्का डालना उसी भेंट का एक सरल रूप है।',
        ],
        bodyEn: [
          'Among the people, a river is seen as a mother and a goddess, and there is a custom of offering something when one goes to her. Dropping a coin is a simple form of that offering.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'नदी से जो जीवन मिलता है, उसके बदले एक छोटी-सी भेंट — कृतज्ञता का भाव।',
    bhavEn: 'A small gift in return for the life a river gives: a feeling of gratitude.',
    anchors: {},
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
];

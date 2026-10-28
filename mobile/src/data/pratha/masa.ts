/**
 * प्रथा और मान्यता — मास — month and festival customs, Chaitra to Phalgun plus Adhik Maas (Appendix A.1–A.2).
 *
 * Hand-maintained content, initially drafted in PRD-46 Phase 0. Draft rows
 * remain invisible. Verified rows record the publications actually opened,
 * with two references for each story. To verify a row: open two
 * sources for each katha's canon line, correct the copy, replace the draft
 * note with a dated adjudication, and flip `status` (RULEBOOK §32). Once a
 * row is edited by hand this file is canonical — do not regenerate it.
 */
import type { PrathaEntry } from './types';

export const PRATHA_MASA_ENTRIES: readonly PrathaEntry[] = [
  {
    id: 'K1',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'कार्तिक में दीपदान क्यों?',
    questionEn: 'Why do we offer lamps in Kartik?',
    practiceHi: 'कार्तिक भर संध्या को मंदिर, तुलसी, घर के द्वार और नदी-तट पर दीया रखा जाता है — एक दिन नहीं, पूरे महीने।',
    practiceEn: 'All through Kartik, at dusk, lamps are placed at temples, beside the Tulsi, at the doors of homes and on riverbanks — not for one day, but for the whole month.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'दीपों का मास',
        titleEn: 'The month of lamps',
        bodyHi: [
          'स्कन्द पुराण के कार्तिक माहात्म्य में दीपदान दामोदर को प्रसन्न करने वाला अर्पण है। इसमें अपना दीया जलाने के साथ दूसरों के दीये में तेल, बाती या सहायता देने का भी महत्त्व बताया गया है।',
        ],
        bodyEn: [
          'The Skanda Purana describes the Kartik lamp as an offering that delights Damodara. It values not only lighting a lamp but also supplying oil, a wick or help for another person’s lamp.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 7.17–21, 35–39',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 7.17–21, 35–39',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371648.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०७'],
      },
      {
        tier: 'purana',
        titleHi: 'चूहा और दीये की बाती',
        titleEn: 'The mouse and the lamp wick',
        bodyHi: [
          'इसी अध्याय में इन्दुमती के घर एक चुहिया का छोटा प्रसंग है। दूसरे का दीया उज्ज्वल करने से उसे मुक्ति मिलने की बात कही गई है। मूल प्रसंग उसके दीये तक पहुँचने का ढंग नहीं बताता।',
        ],
        bodyEn: [
          'The same chapter briefly tells of a female mouse in Indumati’s house attaining liberation by brightening another’s lamp. This passage does not describe how she reached the lamp.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 7.40–42',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 7.40–42',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371648.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०७'],
      },
      {
        tier: 'purana',
        titleHi: 'जुआरी का दीया',
        titleEn: 'The gambler\'s lamp',
        bodyHi: [
          'हरिकर जुए में पिता का धन हार चुका था। तीर्थयात्रियों के साथ अयोध्या पहुँचा तो कार्तिक में हरि के सामने दीया जलाया। कथा उसके अन्त में मुक्ति पाने की बात कहती है; यहाँ राजा बलि के रूप में जन्म का वर्णन नहीं है।',
        ],
        bodyEn: [
          'Harikara had lost his father’s wealth gambling. Travelling with pilgrims, he reached Ayodhya and lit a lamp before Hari in Kartik. The story ends with his liberation; it does not describe a rebirth as King Bali.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 7.22–28',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 7.22–28',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371648.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०७'],
      },
    ],
    bhavHi: 'छोटा-सा दीया भी अँधेरा घटाता है, और जो दीया महीने भर नियम से जले, वह साधना बन जाता है।',
    bhavEn: 'Even a small lamp lessens the dark. A lamp kept burning faithfully for a whole month becomes a spiritual practice.',
    anchors: {
      masa: [8],
      kathaIds: [
        'kartika-mahatmya',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371648.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०७'],
      verificationNote: '2026-10-28: Read Tagare’s published translation on Wisdomlib and the separately published Sanskrit transcription on Wikisource, Skanda 2.4.7. All three stories collated against both. Mouse: changed lok to purana, corrected temple to Indumati’s house and cut invented wick mechanics. Gambler: replaced the unsupported Kedara/Bali attribution with the opened Harikara/Hari passage, 7.22–28. No verse text copied.',
      confidence: 'Likely',
    },
  },
  {
    id: 'K2',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'पूरे कार्तिक मास का व्रत क्यों रखा जाता है?',
    questionEn: 'Why do people keep a vow for the whole month of Kartik?',
    practiceHi: 'कई स्त्रियाँ पूरे कार्तिक मास का नियम रखती हैं — भोर का स्नान, संध्या का दीपदान और तुलसी-सेवा, महीने भर।',
    practiceEn: 'Many women keep an observance for the whole month of Kartik — the dawn bath, the evening lamp offering and care of the Tulsi, all month long.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'सत्यभामा और गुणवती',
        titleEn: 'Satyabhama and Gunavati',
        bodyHi: [
          'कार्तिक माहात्म्य की कथा में श्रीकृष्ण सत्यभामा को उनके पिछले जन्म का वृत्तान्त बताते हैं।',
          'श्रीकृष्ण बताते हैं कि पिछले जन्म में वे गुणवती थीं, जिन्होंने जीवन भर कार्तिक का स्नान, दीपदान और तुलसी-सेवा निभाई। वही नियम इस जन्म में फल बनकर लौटा।',
        ],
        bodyEn: [
          'In a story from the Kartik Mahatmya, Krishna tells Satyabhama about her previous life.',
          'Krishna tells her that in her previous life she was Gunavati, who kept the Kartik bath, the lamp offering and care of the Tulsi all her life. That same discipline returned as its fruit in this life.',
        ],
        canonHi: 'पद्म पुराण, उत्तर खण्ड 89.9–27',
        canonEn: 'Padma Purana, Uttara Khanda 89.9–27',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-padma-purana/d/doc365667.html', 'https://sa.wikisource.org/wiki/पद्मपुराणम्/खण्डः_६_(उत्तरखण्डः)/अध्यायः_०८९'],
      },
    ],
    bhavHi: 'कथा में फल किसी एक बड़े कर्म का नहीं, जीवन भर निभाए गए छोटे नियम का है।',
    bhavEn: 'In the story, the reward comes not from one great deed but from a small discipline kept for a lifetime.',
    anchors: {
      masa: [8],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-padma-purana/d/doc365667.html', 'https://sa.wikisource.org/wiki/पद्मपुराणम्/खण्डः_६_(उत्तरखण्डः)/अध्यायः_०८९'],
      verificationNote: '2026-10-28: Read Deshpande’s translation and the independently published Wikisource Sanskrit, Uttara 89.9–27. Gunavati’s lifelong Kartik/Ekadashi observances, Tulsi grove, lamps and rebirth as Satyabhama agree; exact chapter replaces the pending attribution. Question framing is introductory context; no verse is quoted.',
      confidence: 'Likely',
    },
  },
  {
    id: 'K3',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'आकाशदीप ऊँचे बाँस पर क्यों?',
    questionEn: 'Why is the akashdeep hung high on a bamboo pole?',
    practiceHi: 'कार्तिक भर ऊँचे बाँस के सिरे पर दीया टाँगा जाता है, जो दूर से और ऊपर से दिखाई दे।',
    practiceEn: 'All through Kartik, a lamp is hung from the top of a tall bamboo pole, so that it can be seen from afar and from above.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'आकाश से दिखता दीया',
        titleEn: 'A lamp seen from the sky',
        bodyHi: [
          'कार्तिक माहात्म्य की परम्परा में मास भर ऊँचे स्थान पर टँगे दीये को आकाशदीप कहा गया है।',
          'यह दामोदर — विष्णु — को ऐसा अर्पण माना जाता है जो आकाश से भी दिखे, और साथ ही पितरों के मार्ग का उजाला।',
        ],
        bodyEn: [
          'In the Kartik Mahatmya tradition, a lamp hung in a high place for the whole month is called the akashdeep, the sky lamp.',
          'It is regarded as an offering to Damodara — Vishnu — that can be seen even from the sky, and also as a light on the path of the ancestors.',
        ],
        canonHi: 'कार्तिक माहात्म्य (अध्याय समीक्षाधीन)',
        canonEn: 'Kartik Mahatmya (adhyaya under review)',
      },
      {
        tier: 'lok',
        regionHi: 'काशी',
        regionEn: 'Kashi',
        titleHi: 'घाटों के आकाशदीप',
        titleEn: 'Sky lamps of the ghats',
        bodyHi: [
          'काशी में कार्तिक भर गंगा-घाटों पर ऊँचे बाँसों पर आकाशदीप जलते हैं, जिन्हें पितरों के स्मरण से जोड़ा जाता है। पंचगंगा घाट का हज़ारा दीप-स्तम्भ भी इसी मास दीयों से सजता है।',
        ],
        bodyEn: [
          'In Kashi, all through Kartik, sky lamps burn on tall bamboo poles along the Ganga ghats, and they are linked to the remembrance of ancestors. The Hazara lamp tower at Panchganga Ghat is also decked with lamps in this month.',
        ],
        canonHi: 'लोक-परम्परा (काशी)',
        canonEn: 'Folk tradition (Kashi)',
      },
    ],
    bhavHi: 'ऊँचा दीया दो ओर देखता है — ऊपर देवता की ओर और पीछे पूर्वजों की ओर।',
    bhavEn: 'A high lamp looks two ways — up towards the deity and back towards the ancestors.',
    anchors: {
      masa: [8],
      pitru: true,
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Kartik Mahatmya (adhyaya under review) | Folk tradition (Kashi). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'K4',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'कार्तिक में दामोदराष्टक गाते हुए दीया क्यों दिखाते हैं?',
    questionEn: 'Why do we offer a lamp while singing the Damodarashtakam in Kartik?',
    practiceHi: 'कार्तिक भर संध्या को बाल-कृष्ण (दामोदर) के सामने दीया घुमाते हुए दामोदराष्टक गाया जाता है।',
    practiceEn: 'All through Kartik, at dusk, the Damodarashtakam is sung while a lamp is waved before the child Krishna (Damodara).',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'रस्सी से बँधे कृष्ण',
        titleEn: 'Krishna bound with a rope',
        bodyHi: [
          'यशोदा ने नटखट बाल-कृष्ण को ओखल से बाँधना चाहा, पर हर रस्सी दो अंगुल छोटी पड़ जाती थी। माँ का श्रम देखकर कृष्ण स्वयं बँध गए — उदर पर बँधी रस्सी (दाम) से ही वे दामोदर कहलाए।',
          'ओखल घसीटते हुए वे दो अर्जुन वृक्षों के बीच से निकले; वृक्ष गिर पड़े और उनमें शाप से बँधे कुबेर के दो पुत्र मुक्त हो गए।',
        ],
        bodyEn: [
          'Yashoda wanted to tie the mischievous child Krishna to a mortar, but every rope fell two finger-widths short. Seeing his mother\'s effort, Krishna let himself be bound. It was from the rope (dama) tied around his belly that he came to be called Damodara.',
          'Dragging the mortar, he passed between two arjuna trees. The trees fell, and two sons of Kubera, held in them by a curse, were set free.',
        ],
        canonHi: 'श्रीमद्भागवत, स्कन्ध 10, अध्याय 9–10',
        canonEn: 'Shrimad Bhagavata, Skandha 10, Adhyaya 9–10',
      },
      {
        tier: 'purana',
        titleHi: 'दामोदराष्टक',
        titleEn: 'The Damodarashtakam',
        bodyHi: [
          'जिस स्तुति में यह लीला गाई जाती है, वह दामोदराष्टक है। परम्परा इसे पद्म पुराण में सत्यव्रत मुनि की कही स्तुति मानती है, और कार्तिक में संध्या-दीप के साथ इसका गान होता है।',
        ],
        bodyEn: [
          'The hymn in which this episode is sung is the Damodarashtakam. Tradition holds it to be a hymn spoken by the sage Satyavrata in the Padma Purana, and in Kartik it is sung with the evening lamp.',
        ],
        canonHi: 'पद्म पुराण — सत्यव्रत मुनि की स्तुति (अध्याय समीक्षाधीन)',
        canonEn: 'Padma Purana — hymn of the sage Satyavrata (adhyaya under review)',
      },
    ],
    bhavHi: 'जिसे कोई बाँध न सका, वह माँ के प्रेम से बँध गया — भक्ति का यही बन्धन कार्तिक के दीये में याद किया जाता है।',
    bhavEn: 'The one no one could bind was bound by a mother\'s love. It is this bond of devotion that the Kartik lamp remembers.',
    anchors: {
      masa: [8],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Shrimad Bhagavata, Skandha 10, Adhyaya 9–10 | Padma Purana — hymn of the sage Satyavrata (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'K5',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'कार्तिक में भोर का स्नान क्यों?',
    questionEn: 'Why do we bathe at dawn in Kartik?',
    practiceHi: 'कार्तिक भर सूर्योदय से पहले स्नान किया जाता है — सम्भव हो तो नदी, सरोवर या तीर्थ में।',
    practiceEn: 'All through Kartik, people bathe before sunrise — in a river, a lake or a pilgrimage site, where possible.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'विष्णु का मास',
        titleEn: 'Vishnu\'s month',
        bodyHi: [
          'स्कन्द पुराण के कार्तिक-स्नान प्रसंग में भोर का स्नान दामोदर को अर्पित मासिक व्रत का भाग है। आरम्भ में सूर्योदय से पहले जलाशय जाने का वर्णन आता है। यह किसी एक पर्व का नहीं, मास भर के नियम का प्रसंग है।',
        ],
        bodyEn: [
          'In the Skanda Purana’s Kartik bathing passage, the dawn bath belongs to a month-long vow offered to Damodara. It opens with going to a body of water before sunrise. The setting is a monthly observance, rather than a single festival.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 4.1–8',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 4.1–8',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371645.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०४'],
      },
    ],
    bhavHi: 'भोर का स्नान दिन के पहले क्षण को संकल्प से जोड़ता है, और महीने भर का नियम उसी से आरम्भ होता है।',
    bhavEn: 'The dawn bath ties the first moment of the day to a resolve, and the month-long discipline begins with it.',
    anchors: {
      masa: [8],
      ruleIds: [
        'kartik-purnima',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371645.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०४'],
      verificationNote: '2026-10-28: Opened Tagare’s translation and Wikisource Sanskrit for Skanda 2.4.4.1–8. Replaced the vague dual-Purana attribution with the exact dawn-bath passage; cut the unsupported sequence of later observances. Descriptive summary only, no procedural formula or verse text.',
      confidence: 'Likely',
    },
  },
  {
    id: 'K6',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'कार्तिक में तुलसी-सेवा और तुलसी विवाह क्यों?',
    questionEn: 'Why do we tend the Tulsi and celebrate Tulsi Vivah in Kartik?',
    practiceHi: 'कार्तिक में तुलसी-सेवा और तुलसी का विष्णु या शालिग्राम के साथ विवाह मनाया जाता है। विवाह की तिथि और रूप परम्पराओं में अलग-अलग हैं।',
    practiceEn: 'In Kartik, people tend the Tulsi and celebrate her marriage to Vishnu or the Shaligram. The date and form of the celebration vary between traditions.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'वृन्दा और जालन्धर',
        titleEn: 'Vrinda and Jalandhara',
        bodyHi: [
          'शिव पुराण की इस कथा में विष्णु ने जालन्धर का रूप धरकर वृन्दा को छला। पहचान खुलने पर वृन्दा ने उन्हें पत्नी के अपहरण और वियोग का शाप दिया। यहाँ शिला बनने का शाप नहीं है।',
          'अगले प्रसंग में देवियों के दिए बीज वृन्दा की चिता के स्थान पर बोए गए। उनसे तुलसी और अन्य पौधे निकले; तुलसी और आँवले को कार्तिक में विष्णु का प्रिय बताया गया है।',
        ],
        bodyEn: [
          'In this Shiva Purana telling, Vishnu deceived Vrinda in Jalandhara’s form. When she recognised him, she cursed him to suffer his wife’s abduction and their separation. This is not the curse of becoming a stone.',
          'In a later passage, seeds supplied by the goddesses were sown where Vrinda’s funeral pyre had stood. Tulsi and other plants grew there; Tulsi and amla are described as dear to Vishnu in Kartik.',
        ],
        canonHi: 'शिव पुराण, रुद्र संहिता, युद्ध खण्ड 23.36–46; 26.41–54',
        canonEn: 'Shiva Purana, Rudra Samhita, Yuddha Khanda 23.36–46; 26.41–54',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226164.html', 'https://sa.wikisource.org/wiki/शिवपुराणम्/संहिता_२_(रुद्रसंहिता)/खण्डः_५_(युद्धखण्डः)/अध्यायः_२३', 'https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226167.html', 'https://sa.wikisource.org/wiki/शिवपुराणम्/संहिता_२_(रुद्रसंहिता)/खण्डः_५_(युद्धखण्डः)/अध्यायः_२६'],
      },
      {
        tier: 'purana',
        titleHi: 'तुलसी और शालिग्राम',
        titleEn: 'Tulsi and the Shaligram',
        bodyHi: [
          'शिव पुराण में तुलसी और शंखचूड़ की कथा अलग है। शंखचूड़ का रूप धरकर विष्णु ने तुलसी को छला; तुलसी ने उन्हें शिला बनने का शाप दिया।',
          'शिव ने तुलसी को हरि के समीप रहने, पौधे और गण्डकी नदी के रूप में प्रतिष्ठित होने का वर दिया। विष्णु का शालिग्राम-रूप इसी कथा में आता है।',
        ],
        bodyEn: [
          'The Shiva Purana separately tells of Tulsi and Shankhachuda. Vishnu deceived Tulsi in Shankhachuda’s form; she cursed him to become a stone.',
          'Shiva granted her a place beside Hari, as the Tulsi plant and the Gandaki river. Vishnu’s Shaligram form belongs to this telling.',
        ],
        canonHi: 'शिव पुराण, रुद्र संहिता, युद्ध खण्ड 41.2–5, 29–52',
        canonEn: 'Shiva Purana, Rudra Samhita, Yuddha Khanda 41.2–5, 29–52',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226182.html', 'https://sa.wikisource.org/wiki/शिवपुराणम्/संहिता_२_(रुद्रसंहिता)/खण्डः_५_(युद्धखण्डः)/अध्यायः_४१'],
      },
      {
        tier: 'purana',
        titleHi: 'विवाह का उत्सव',
        titleEn: 'The marriage celebration',
        bodyHi: ['स्कन्द पुराण का कार्तिक माहात्म्य तुलसी और विष्णु के विवाह का उत्सव वर्णित करता है। यह प्रसंग वृन्दा की राख में पार्वती के बीज से उगी तुलसी को भी याद करता है। इसलिए कथा के अलग रूपों को एक ही घटना में नहीं मिलाया गया है।'],
        bodyEn: ['The Skanda Purana describes a Kartik celebration of Tulsi’s marriage to Vishnu. It also recalls the plant growing from Parvati’s seed in Vrinda’s ashes. These different tellings are kept distinct here.'],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 31.4–10, 20–25',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 31.4–10, 20–25',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371673.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_३१'],
      },
    ],
    bhavHi: 'तुलसी-सेवा और विवाह में पौधे को हरि के प्रिय रूप में अपनाया जाता है। इसके पीछे वृन्दा और तुलसी की अलग कथाएँ हैं।',
    bhavEn: 'Tending the Tulsi and celebrating her marriage welcome the plant as dear to Hari. The distinct stories of Vrinda and Tulsi stand behind this devotion.',
    anchors: {
      masa: [8],
      kathaIds: [
        'kartika-mahatmya',
      ],
      ruleIds: [
        'tulasi-vivah',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226164.html', 'https://sa.wikisource.org/wiki/शिवपुराणम्/संहिता_२_(रुद्रसंहिता)/खण्डः_५_(युद्धखण्डः)/अध्यायः_२३', 'https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226167.html', 'https://sa.wikisource.org/wiki/शिवपुराणम्/संहिता_२_(रुद्रसंहिता)/खण्डः_५_(युद्धखण्डः)/अध्यायः_२६', 'https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc226182.html', 'https://sa.wikisource.org/wiki/शिवपुराणम्/संहिता_२_(रुद्रसंहिता)/खण्डः_५_(युद्धखण्डः)/अध्यायः_४१', 'https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371673.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_३१'],
      verificationNote: '2026-10-28: Read Shastri’s Shiva Purana translation and Wikisource Sanskrit for Yuddha 23, 26 and 41; read Tagare and Wikisource for Skanda 2.4.31. Corrected conflation: Vrinda/Jalandhara curses separation, whereas Tulsi/Shankhachuda curses stone; the latter was wrongly attributed to Padma. Added the independently collated marriage passage; removed the unsupported exclusive worship claim. All retained stories checked in both publications. No scripture copied.',
      confidence: 'Certain',
    },
  },
  {
    id: 'K7',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'करवा चौथ पर छलनी से चाँद क्यों देखते हैं?',
    questionEn: 'Why do we look at the moon through a sieve on Karwa Chauth?',
    practiceHi: 'करवा चौथ पर विवाहित स्त्रियाँ दिन भर व्रत रखती हैं, प्रायः निर्जल। रात में करवे से चन्द्रमा को अर्घ्य देकर छलनी की ओट से चाँद और फिर पति का मुख देखा जाता है।',
    practiceEn: 'On Karwa Chauth, married women fast all day, often without water. At night they offer arghya to the moon from the karwa pitcher, then look through a sieve at the moon and then at their husband\'s face.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'उत्तर भारत',
        regionEn: 'North India',
        titleHi: 'वीरावती',
        titleEn: 'Veeravati',
        bodyHi: [
          'सात भाइयों की लाड़ली बहन वीरावती करवा चौथ के व्रत में भूख-प्यास से व्याकुल हो गई। भाइयों ने छलनी की ओट में दीया रखकर उसे झूठा चाँद दिखा दिया, और उसने व्रत खोल दिया।',
          'उसी समय उसके पति पर संकट आ पड़ा। वीरावती ने वर्ष भर तप किया और अगले करवा चौथ का व्रत पूरा किया, तब उसका पति फिर स्वस्थ हुआ।',
        ],
        bodyEn: [
          'Veeravati, the beloved sister of seven brothers, grew faint with hunger and thirst during the Karwa Chauth fast. Her brothers placed a lamp behind a sieve to show her a false moon, and she broke her fast.',
          'At that very moment, trouble fell upon her husband. Veeravati did penance for a whole year and completed the next Karwa Chauth fast, and then her husband was well again.',
        ],
        canonHi: 'लोक-परम्परा (उत्तर भारत)',
        canonEn: 'Folk tradition (North India)',
      },
    ],
    bhavHi: 'जिस धैर्य को छल से छोटा किया जाए, उसका फल अधूरा रहता है — छलनी सच्चे चाँद की प्रतीक्षा की याद है।',
    bhavEn: 'Patience cut short by deceit bears incomplete fruit. The sieve is a reminder of waiting for the true moon.',
    anchors: {
      masa: [8],
      kathaIds: [
        'karwa-chauth-vrat-katha',
      ],
      ruleIds: [
        'karwa-chauth',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (North India). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'K8',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'अहोई अष्टमी पर सेई और उसके बच्चों का चित्र क्यों बनाते हैं?',
    questionEn: 'Why do we draw a porcupine and her young on Ahoi Ashtami?',
    practiceHi: 'कार्तिक कृष्ण अष्टमी को माताएँ संतान के लिए दिन भर व्रत रखती हैं और दीवार पर अहोई माता के साथ सेई (साही) और उसके बच्चों का चित्र बनाकर पूजा करती हैं। संध्या को तारों को अर्घ्य देकर व्रत खोला जाता है।',
    practiceEn: 'On Kartik Krishna Ashtami, mothers fast all day for their children. They draw Ahoi Mata on the wall along with a sei, or porcupine, and her young, and worship the picture. At dusk the fast is broken by offering arghya to the stars.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'उत्तर भारत',
        regionEn: 'North India',
        titleHi: 'मिट्टी खोदती स्त्री',
        titleEn: 'The woman digging earth',
        bodyHi: [
          'कथा है कि दीवाली से पहले घर लीपने के लिए मिट्टी खोदते हुए एक स्त्री के हाथों अनजाने में सेई का एक बच्चा मर गया। इसके बाद उसकी अपनी संतान पर संकट आया।',
          'पश्चात्ताप में उसने अहोई माता और सेई के बच्चों का चित्र बनाकर व्रत और पूजा की, और उसकी संतान का कल्याण हुआ।',
        ],
        bodyEn: [
          'The story goes that before Diwali, while digging earth to plaster her house, a woman unknowingly killed a porcupine\'s young one. After this, trouble came upon her own children.',
          'In remorse, she drew a picture of Ahoi Mata and the porcupine\'s young and kept the fast and the worship, and all was well with her children.',
        ],
        canonHi: 'लोक-परम्परा (उत्तर भारत)',
        canonEn: 'Folk tradition (North India)',
      },
    ],
    bhavHi: 'अनजाने में हुई हानि भी मन पर रहती है, और उसका उत्तर पश्चात्ताप और करुणा है।',
    bhavEn: 'Harm done unknowingly still stays on the mind, and the answer to it is remorse and compassion.',
    anchors: {
      masa: [8],
      kathaIds: [
        'ahoi-ashtami-vrat-katha',
      ],
      ruleIds: [
        'ahoi-ashtami',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (North India). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'K9',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'धनतेरस पर नया बर्तन क्यों ख़रीदते हैं?',
    questionEn: 'Why do we buy a new vessel on Dhanteras?',
    practiceHi: 'धनतेरस (कार्तिक कृष्ण त्रयोदशी) पर नया बर्तन या धातु की कोई वस्तु घर लाई जाती है; आजकल सोना-चाँदी ख़रीदने का चलन भी है।',
    practiceEn: 'On Dhanteras (Kartik Krishna Trayodashi), a new vessel or some metal item is brought home; these days buying gold and silver is also common.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'धन्वन्तरि का कलश',
        titleEn: 'Dhanvantari\'s pot',
        bodyHi: [
          'समुद्र-मंथन से देवताओं के वैद्य धन्वन्तरि अमृत से भरा कलश लेकर प्रकट हुए। परम्परा में कार्तिक कृष्ण त्रयोदशी उनके प्राकट्य का दिन मानी जाती है, इसलिए इसे धन्वन्तरि त्रयोदशी भी कहते हैं।',
        ],
        bodyEn: [
          'From the churning of the ocean, Dhanvantari, the physician of the gods, appeared holding a pot full of amrit. Tradition holds Kartik Krishna Trayodashi to be the day he appeared, so it is also called Dhanvantari Trayodashi.',
        ],
        canonHi: 'श्रीमद्भागवत, स्कन्ध 8, अध्याय 8',
        canonEn: 'Shrimad Bhagavata, Skandha 8, Adhyaya 8',
      },
      {
        tier: 'lok',
        titleHi: 'नया पात्र',
        titleEn: 'The new vessel',
        bodyHi: [
          'लोक में इस दिन घर आया नया पात्र उसी अमृत-कलश का स्मरण माना जाता है। नया बर्तन धन्वन्तरि के स्वागत का प्रतीक है।',
        ],
        bodyEn: [
          'In folk belief, a new vessel brought home on this day is taken as a remembrance of that pot of amrit. The new utensil is a sign of welcome for Dhanvantari.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'itihas',
        titleHi: 'सोने-चाँदी का चलन',
        titleEn: 'The custom of gold and silver',
        bodyHi: [
          'धनतेरस पर सोना-चाँदी ख़रीदने का चलन बाद का है। यह त्योहार के व्यावसायिक विस्तार के साथ फैला।',
        ],
        bodyEn: [
          'Buying gold and silver on Dhanteras is a later custom. It spread with the commercial growth of the festival.',
        ],
        canonHi: 'इतिहास · आधुनिक व्यावसायिक विस्तार',
        canonEn: 'History · modern commercial expansion',
      },
    ],
    bhavHi: 'इस पर्व के “धन” का पहला अर्थ आरोग्य है — धन्वन्तरि वैद्य हैं।',
    bhavEn: 'In this festival, the first meaning of “dhan” — wealth — is health. Dhanvantari is a physician.',
    anchors: {
      masa: [8],
      kathaIds: [
        'dhanteras-legends',
      ],
      ruleIds: [
        'dhanteras',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Shrimad Bhagavata, Skandha 8, Adhyaya 8 | Folk tradition | History · modern commercial expansion. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'K10',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'धनतेरस पर यम का दीया दक्षिण की ओर क्यों?',
    questionEn: 'Why does Yama\'s lamp face south on Dhanteras?',
    practiceHi: 'धनतेरस की संध्या घर के बाहर यम के नाम दीया रखा जाता है। प्रचलित रीति में वह दक्षिण की ओर रहता है; दीये का रूप घरों में बदलता है।',
    practiceEn: 'On Dhanteras evening, a lamp for Yama is placed outside the home. In the customary practice it faces south; the form of the lamp varies between homes.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'राजा हिम का पुत्र',
        titleEn: 'The son of King Hima',
        bodyHi: [
          'कथा है कि राजा हिम के पुत्र के भाग्य में विवाह की चौथी रात सर्प-दंश से मृत्यु लिखी थी। उस रात उसकी पत्नी ने द्वार पर गहनों और सिक्कों का ढेर लगाया, चारों ओर दीये जलाए और पति को कथाएँ-गीत सुनाकर जगाए रखा।',
          'सर्प बनकर आए यम उस चमक से चौंधिया गए और ढेर पर बैठे-बैठे रात बीत गई। भोर होते ही वे लौट गए।',
        ],
        bodyEn: [
          'The story goes that King Hima\'s son was fated to die of a snakebite on the fourth night of his marriage. That night his wife heaped jewellery and coins at the door, lit lamps all around and kept her husband awake with stories and songs.',
          'Yama, who came as a snake, was dazzled by the glitter, and the night passed as he sat on the heap. At dawn he went back.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
        referenceUrls: ['https://www.mpanchang.com/festivals/yama-deepam/', 'https://www.ndtv.com/offbeat/dhanteras-2024-why-is-dhanteras-celebrated-know-history-and-significance-6862181'],
      },
      {
        tier: 'purana',
        titleHi: 'त्रयोदशी का यम-दीप',
        titleEn: 'Yama\'s lamp on Trayodashi',
        bodyHi: [
          'स्कन्द पुराण में त्रयोदशी की संध्या घर के द्वार पर यम के लिए दीपदान आता है। अध्याय हेमनक के पुत्र के बचने का छोटा उल्लेख करता है; पत्नी, आभूषण और सर्प वाला पूरा प्रसंग यहाँ नहीं है।',
          'अंग्रेज़ी अनुवाद यम-दीप को दक्षिणमुखी बताता है। संस्कृत श्लोक 20–26 में दिशा का शब्द नहीं है, इसलिए दिशा को रीति की व्याख्या के रूप में रखा गया है।',
        ],
        bodyEn: [
          'The Skanda Purana describes a lamp for Yama at the doorway on Trayodashi evening. It briefly mentions Hemanaka’s son being saved; it does not give the full wife, jewellery and serpent episode here.',
          'The English translation explains the Yama lamp as facing south. Sanskrit verses 20–26 do not explicitly name a direction, so the direction is presented as a customary explanation.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 9.20–26 · दक्षिणमुखी: अनुवाद की व्याख्या',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 9.20–26 · south-facing: translation’s explanation',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371650.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०९'],
      },
    ],
    bhavHi: 'यह दीया भय का नहीं, स्मरण का है — कि जीवन की रक्षा सजगता और प्रेम से होती है।',
    bhavEn: 'This lamp is not about fear but remembrance — that life is protected by watchfulness and love.',
    anchors: {
      masa: [8],
      kathaIds: [
        'dhanteras-legends',
      ],
      ruleIds: [
        'dhanteras',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.mpanchang.com/festivals/yama-deepam/', 'https://www.ndtv.com/offbeat/dhanteras-2024-why-is-dhanteras-celebrated-know-history-and-significance-6862181', 'https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371650.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०९'],
      verificationNote: '2026-10-28: Read mPanchang’s published telling and Ritu Singh’s NDTV article (2024-10-24) for the folk narrative; checked the rite in Tagare and Wikisource, Skanda 2.4.9.20–26. Kept the folk telling separate from the brief Hemanaka passage. South-facing is a translator gloss, not explicit in the opened Sanskrit verses. Cut the unsupported fixed four-wick count. Months differ by amanta/purnimanta convention.',
      confidence: 'Guessing',
    },
  },
  {
    id: 'K11',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'नरक चतुर्दशी पर सूर्योदय से पहले तेल लगाकर स्नान क्यों?',
    questionEn: 'Why do we take an oil bath before sunrise on Narak Chaturdashi?',
    practiceHi: 'नरक चतुर्दशी को सूर्योदय से पहले तेल और उबटन लगाकर स्नान किया जाता है; कई जगह यह दिन रूप चौदस कहलाता है।',
    practiceEn: 'On Narak Chaturdashi, people bathe before sunrise after applying oil and ubtan paste; in many places this day is called Roop Chaudas.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'नरकासुर-वध',
        titleEn: 'The slaying of Narakasura',
        bodyHi: [
          'असुर नरकासुर ने देवताओं और राजाओं को त्रस्त कर रखा था और हज़ारों राजकन्याओं को बन्दी बनाया था। श्रीकृष्ण सत्यभामा के साथ गरुड़ पर उसकी नगरी पहुँचे, नरकासुर का वध किया और सब बन्दिनियों को मुक्त किया।',
        ],
        bodyEn: [
          'The demon Narakasura had tormented gods and kings and held thousands of princesses captive. Krishna rode Garuda to his city with Satyabhama, killed Narakasura and freed all the captive women.',
        ],
        canonHi: 'श्रीमद्भागवत, स्कन्ध 10, अध्याय 59',
        canonEn: 'Shrimad Bhagavata, Skandha 10, Adhyaya 59',
        referenceUrls: ['https://vedabase.io/en/library/sb/10/59/', 'https://sa.wikisource.org/wiki/श्रीमद्भागवतपुराणम्/स्कन्धः_१०/उत्तरार्धः/अध्यायः_५९'],
      },
      {
        tier: 'purana',
        titleHi: 'चतुर्दशी का अभ्यंग',
        titleEn: 'The Chaturdashi oil bath',
        bodyHi: [
          'स्कन्द पुराण में दीपोत्सव के पास आने वाली कृष्ण चतुर्दशी के भोर में तेल लगाकर स्नान का प्रसंग है। तेल में लक्ष्मी और जल में गंगा की उपस्थिति का भाव बताया गया है। भागवत का नरकासुर-वध प्रसंग कृष्ण के युद्ध के बाद तेल-स्नान का वर्णन नहीं करता।',
        ],
        bodyEn: [
          'The Skanda Purana describes an oil bath at dawn on the dark Chaturdashi near the festival of lamps, associating the oil with Lakshmi and the water with Ganga. The Bhagavata’s Narakasura episode does not describe Krishna taking an oil bath after the battle.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 9.27–32',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 9.27–32',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371650.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०९'],
      },
    ],
    bhavHi: 'बाहर का मैल धोने वाला स्नान भीतर के अँधेरे को धोने का भी प्रतीक बन गया है।',
    bhavEn: 'The bath that washes away outer dirt has also become a symbol of washing away the darkness within.',
    anchors: {
      masa: [8],
      kathaIds: [
        'narak-chaturdashi-katha',
      ],
      ruleIds: [
        'narak-chaturdashi',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://vedabase.io/en/library/sb/10/59/', 'https://sa.wikisource.org/wiki/श्रीमद्भागवतपुराणम्/स्कन्धः_१०/उत्तरार्धः/अध्यायः_५९', 'https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371650.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_०९'],
      verificationNote: '2026-10-28: Read BBT/Vedabase and Wikisource, Bhagavata 10.59, and Tagare/Wikisource Skanda 2.4.9.27–32. Replaced the unsupported post-battle bath story with the collated Chaturdashi bathing passage. Its dark fortnight is Ashvina (amanta); the app uses Kartik (purnimanta). No verse copied.',
      confidence: 'Certain',
    },
  },
  {
    id: 'K12',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'भूत चतुर्दशी पर चौदह दीये और चौदह शाक क्यों?',
    questionEn: 'Why do we light fourteen lamps and eat fourteen greens on Bhoot Chaturdashi?',
    practiceHi: 'बंगाल में काली पूजा से पहले की चतुर्दशी — भूत चतुर्दशी — को घर में चौदह दीये जलाए जाते हैं और चौदह प्रकार के शाक खाए जाते हैं।',
    practiceEn: 'In Bengal, on the Chaturdashi before Kali Puja — Bhoot Chaturdashi — fourteen lamps are lit at home and fourteen kinds of leafy greens are eaten.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'बंगाल',
        regionEn: 'Bengal',
        titleHi: 'चौदह पीढ़ियाँ',
        titleEn: 'Fourteen generations',
        bodyHi: [
          'बंगाली परम्परा में यह रात पूर्वजों के स्मरण की है। चौदह दीये और चौदह शाक पूर्वजों की चौदह पीढ़ियों के नाम माने जाते हैं।',
        ],
        bodyEn: [
          'In Bengali tradition, this night is for remembering the ancestors. The fourteen lamps and fourteen greens are held to stand for fourteen generations of ancestors.',
        ],
        canonHi: 'लोक-परम्परा (बंगाल)',
        canonEn: 'Folk tradition (Bengal)',
      },
    ],
    bhavHi: 'दीपावली के उजाले से ठीक पहले की रात घर अपनी पीढ़ियों को याद करता है।',
    bhavEn: 'On the night just before the light of Diwali, the home remembers its generations.',
    anchors: {
      masa: [8],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Bengal). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'K13',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'दीवाली पर दीये क्यों जलाते हैं?',
    questionEn: 'Why do we light lamps on Diwali?',
    practiceHi: 'कार्तिक अमावस्या की रात घर, आँगन, छत और द्वार दीयों से सजाए जाते हैं। रात की पूजा और उससे जुड़ी कथा क्षेत्र के अनुसार बदलती है — परम्पराएँ भिन्न हैं।',
    practiceEn: 'On the Amavasya night of Kartik, homes, courtyards, rooftops and doorways are decorated with lamps. The night\'s worship and the story tied to it change from region to region — traditions differ.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'उत्तर भारत',
        regionEn: 'North India',
        titleHi: 'श्रीराम का अयोध्या आगमन',
        titleEn: 'Rama\'s return to Ayodhya',
        bodyHi: [
          'चौदह वर्ष के वनवास और लंका-विजय के बाद श्रीराम सीता और लक्ष्मण के साथ अयोध्या लौटे। लोक-कथा कहती है कि उस अमावस्या की रात अयोध्यावासियों ने घर-घर दीये जलाकर उनका स्वागत किया।',
        ],
        bodyEn: [
          'After fourteen years of exile and the victory over Lanka, Rama returned to Ayodhya with Sita and Lakshmana. The folk tale says that on that Amavasya night the people of Ayodhya welcomed him by lighting lamps in every home.',
        ],
        canonHi: 'लोक-परम्परा (उत्तर भारत) · कथा का मूल: वाल्मीकि रामायण, युद्ध काण्ड',
        canonEn: 'Folk tradition (North India) · Source of the story: Valmiki Ramayana, Yuddha Kanda',
      },
      {
        tier: 'lok',
        regionHi: 'देश भर',
        regionEn: 'Across the country',
        titleHi: 'लक्ष्मी का प्राकट्य',
        titleEn: 'The appearance of Lakshmi',
        bodyHi: [
          'समुद्र-मंथन से लक्ष्मी प्रकट हुईं और उन्होंने विष्णु का वरण किया। लोक में कार्तिक अमावस्या की रात उनके स्वागत की रात मानी जाती है, इसलिए दीयों के बीच लक्ष्मी-पूजन होता है।',
        ],
        bodyEn: [
          'Lakshmi emerged from the churning of the ocean and chose Vishnu as her husband. In folk belief, the Amavasya night of Kartik is the night to welcome her, so Lakshmi Puja is performed amid the lamps.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        regionHi: 'महाराष्ट्र · कर्नाटक',
        regionEn: 'Maharashtra · Karnataka',
        titleHi: 'बलि प्रतिपदा',
        titleEn: 'Bali Pratipada',
        bodyHi: [
          'वामन ने राजा बलि से तीन पग भूमि माँगी और उन्हीं पगों में सब कुछ नाप लिया; बलि पाताल गए, पर उनकी दानशीलता से प्रसन्न होकर वामन ने उन्हें वर भी दिया।',
          'महाराष्ट्र और कर्नाटक में दीवाली के अगले दिन, बलि प्रतिपदा पर, बलि का स्मरण और स्वागत होता है।',
        ],
        bodyEn: [
          'Vamana asked King Bali for three steps of land and measured out everything in those steps. Bali went down to Patala, the netherworld, but Vamana, pleased with his generosity, also granted him a boon.',
          'In Maharashtra and Karnataka, on the day after Diwali, Bali Pratipada, Bali is remembered and welcomed.',
        ],
        canonHi: 'लोक-परम्परा (महाराष्ट्र · कर्नाटक)',
        canonEn: 'Folk tradition (Maharashtra · Karnataka)',
      },
      {
        tier: 'lok',
        regionHi: 'बंगाल',
        regionEn: 'Bengal',
        titleHi: 'काली पूजा',
        titleEn: 'Kali Puja',
        bodyHi: [
          'बंगाल में कार्तिक अमावस्या माँ काली की रात है। रात में काली-पूजा होती है और घर-आँगन दीयों से जगमगाते हैं।',
        ],
        bodyEn: [
          'In Bengal, the Amavasya of Kartik is the night of Maa Kali. Kali Puja is held at night, and homes and courtyards glow with lamps.',
        ],
        canonHi: 'लोक-परम्परा (बंगाल)',
        canonEn: 'Folk tradition (Bengal)',
      },
      {
        tier: 'itihas',
        regionHi: 'जैन परम्परा',
        regionEn: 'Jain tradition',
        titleHi: 'महावीर का निर्वाण',
        titleEn: 'Mahavira\'s nirvana',
        bodyHi: [
          'जैन परम्परा के अनुसार इसी अमावस्या को भगवान महावीर ने पावापुरी में निर्वाण पाया। ज्ञान का दीप बुझा जानकर उपस्थित जनों ने दीप जलाकर उस प्रकाश का स्मरण किया।',
        ],
        bodyEn: [
          'According to Jain tradition, Lord Mahavira attained nirvana at Pawapuri on this same Amavasya. Knowing that the lamp of knowledge had gone out, those present lit lamps to remember that light.',
        ],
        canonHi: 'इतिहास · जैन परम्परा',
        canonEn: 'History · Jain tradition',
      },
      {
        tier: 'itihas',
        regionHi: 'सिख परम्परा',
        regionEn: 'Sikh tradition',
        titleHi: 'बन्दी छोड़ दिवस',
        titleEn: 'Bandi Chhor Divas',
        bodyHi: [
          'सिख परम्परा में गुरु हरगोबिन्द जी ग्वालियर के किले की कैद से मुक्त हुए और अपने साथ बन्दी राजाओं को भी छुड़ा लाए। उनके अमृतसर पहुँचने पर हरमंदिर साहिब दीपों से सजाया गया, और यह दिन बन्दी छोड़ दिवस कहलाया।',
        ],
        bodyEn: [
          'In Sikh tradition, Guru Hargobind ji was freed from imprisonment in Gwalior Fort and brought the imprisoned kings out with him. When he reached Amritsar, the Harmandir Sahib was decorated with lamps, and the day came to be called Bandi Chhor Divas.',
        ],
        canonHi: 'इतिहास · सिख परम्परा',
        canonEn: 'History · Sikh tradition',
      },
    ],
    bhavHi: 'एक रात, अनेक कथाएँ — हर कथा में अँधेरे से उजाले की ओर लौटना है।',
    bhavEn: 'One night, many stories — in each one, a return from darkness to light.',
    bodhHi: 'लोक में अयोध्या के दीपों की कथा सबसे प्रचलित है। ऐप में उपलब्ध वाल्मीकि रामायण के अयोध्या-आगमन प्रसंग (युद्ध काण्ड, सर्ग 120–131) में दीपोत्सव का वर्णन नहीं मिलता, इसलिए यह कथा यहाँ लोक-परम्परा के रूप में दी गई है।',
    bodhEn: 'Among folk stories, the tale of Ayodhya\'s lamps is the best known. The account of Rama\'s arrival in Ayodhya in the Valmiki Ramayana available in the app (Yuddha Kanda, sargas 120–131) does not describe a festival of lamps, so this story is given here as folk tradition.',
    anchors: {
      masa: [8],
      kathaIds: [
        'diwali-legends',
      ],
      ruleIds: [
        'diwali',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (North India) · Source of the story: Valmiki Ramayana, Yuddha Kanda | Folk tradition | Folk tradition (Maharashtra · Karnataka) | Folk tradition (Bengal) | History · Jain tradition | History · Sikh tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'K14',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'दीवाली पर द्वार खुले क्यों रखते हैं और लक्ष्मी के पदचिह्न क्यों बनाते हैं?',
    questionEn: 'Why do we keep the doors open on Diwali and draw Lakshmi\'s footprints?',
    practiceHi: 'दीवाली से पहले घर की सफ़ाई होती है, रंगोली बनती है और द्वार से भीतर की ओर लक्ष्मी के पदचिह्न बनाए जाते हैं। पूजा की रात द्वार खुले रखे जाते हैं।',
    practiceEn: 'Before Diwali the house is cleaned, rangoli is made, and Lakshmi\'s footprints are drawn leading from the door inward. On the night of the puja, the doors are kept open.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'अमावस्या की रात लक्ष्मी',
        titleEn: 'Lakshmi on the Amavasya night',
        bodyHi: [
          'लोक-विश्वास है कि कार्तिक अमावस्या की रात लक्ष्मी पृथ्वी पर विचरती हैं। जो घर स्वच्छ, दीयों से उजला और खुले द्वार वाला हो, उसमें वे प्रवेश करती हैं — पदचिह्न उसी आगमन का निमन्त्रण हैं।',
        ],
        bodyEn: [
          'Folk belief holds that on the Amavasya night of Kartik, Lakshmi wanders the earth. She enters a home that is clean, bright with lamps and open at the door — the footprints are an invitation to that arrival.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'स्वच्छ, उजला और खुला घर स्वागत का भाव है — अतिथि देवता हो या मनुष्य।',
    bhavEn: 'A clean, bright, open home is a gesture of welcome — whether the guest is a god or a person.',
    anchors: {
      masa: [8],
      kathaIds: [
        'diwali-legends',
      ],
      ruleIds: [
        'diwali',
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
    id: 'K15',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'दीवाली की रात पासे या ताश खेलने की प्रथा क्यों?',
    questionEn: 'Why is there a custom of playing dice or cards on Diwali night?',
    practiceHi: 'कई घरों में दीवाली की रात परिवार में ताश या पासे का खेल होता है।',
    practiceEn: 'In many homes, the family plays cards or dice on Diwali night.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'शिव-पार्वती के पासे',
        titleEn: 'Shiva and Parvati\'s dice',
        bodyHi: [
          'स्कन्द पुराण कार्तिक शुक्ल प्रतिपदा के प्रसंग में शिव-पार्वती का पासों का खेल सुनाता है। पार्वती जीतती हैं और शिव हारते हैं। यहाँ रात अमावस्या की नहीं, प्रतिपदा की है।',
          'ग्रन्थ में पहले खेल की जीत को वर्ष के सुख से जोड़ने वाला विश्वास है; इसे पार्वती के दिए वर के रूप में नहीं कहा गया। यह कथा प्रथा का परिचय है, खेलने का निर्देश नहीं।',
        ],
        bodyEn: [
          'In its Kartik Shukla Pratipada passage, the Skanda Purana tells of Shiva and Parvati playing dice. Parvati wins and Shiva loses. The setting is Pratipada, rather than the Amavasya night.',
          'The text links winning the first game with happiness during the year; it does not describe this as a boon spoken by Parvati. This explains a custom without directing anyone to play.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 10.2, 19–22',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 10.2, 19–22',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371651.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_१०'],
      },
    ],
    bhavHi: 'कथा में खेल का केन्द्र दाँव नहीं, शिव-पार्वती का साथ और त्योहार का उल्लास है।',
    bhavEn: 'In the story, the heart of the game is not the wager but Shiva and Parvati\'s togetherness and the joy of the festival.',
    anchors: {
      masa: [8],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371651.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_१०'],
      verificationNote: '2026-10-28: Read Tagare and Wikisource Sanskrit, Skanda 2.4.10.2,19–22. Changed lok to purana with exact citation; corrected Amavasya to Pratipada in the source account and removed the invented speech granting Parvati’s boon. Kept modern card-playing as a customary practice, not a scriptural prescription.',
      confidence: 'Likely',
    },
  },
  {
    id: 'K16',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'दीवाली पर नई बही (चोपड़ा) की पूजा क्यों?',
    questionEn: 'Why is a new ledger (chopda) worshipped on Diwali?',
    practiceHi: 'गुजराती और मारवाड़ी व्यापारी परिवारों में दीवाली पर नई बही पर स्वस्तिक और “शुभ-लाभ” लिखकर लक्ष्मी-गणेश के साथ उसकी पूजा होती है।',
    practiceEn: 'In Gujarati and Marwari trading families, a swastika and “Shubh-Labh” are written in a new ledger on Diwali, and it is worshipped along with Lakshmi and Ganesha.',
    kathas: [
      {
        tier: 'itihas',
        regionHi: 'गुजरात · मारवाड़ी समाज',
        regionEn: 'Gujarat · Marwari community',
        titleHi: 'व्यापार का नया वर्ष',
        titleEn: 'The new year of business',
        bodyHi: [
          'व्यापारी समाज में लेन-देन का वर्ष दीवाली से बदलता है; गुजरात में दीवाली के अगले दिन से नया विक्रम संवत आरम्भ होता है।',
          'इसलिए नई बही में पहले लक्ष्मी और गणेश स्थापित किए जाते हैं, फिर नए वर्ष का हिसाब लिखा जाता है।',
        ],
        bodyEn: [
          'Among trading communities, the business year turns at Diwali; in Gujarat, the new Vikram Samvat year begins on the day after Diwali.',
          'So Lakshmi and Ganesha are first installed in the new ledger, and then the accounts of the new year are written.',
        ],
        canonHi: 'इतिहास · व्यापारी समाज की परम्परा',
        canonEn: 'History · tradition of trading communities',
      },
    ],
    bhavHi: 'हिसाब का नया आरम्भ भी शुभ संकल्प और स्मरण के साथ किया जाता है।',
    bhavEn: 'Even a fresh start to the accounts is made with a good resolve and with remembrance.',
    anchors: {
      masa: [8],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: History · tradition of trading communities. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'K17',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'गोवर्धन पूजा और अन्नकूट क्यों?',
    questionEn: 'Why do we celebrate Govardhan Puja and Annakut?',
    practiceHi: 'दीवाली के अगले दिन गोबर से गोवर्धन पर्वत का रूप बनाकर पूजा और परिक्रमा होती है, और अनेक व्यंजनों का अन्नकूट अर्पित किया जाता है।',
    practiceEn: 'On the day after Diwali, a form of Mount Govardhan is shaped from cow dung, then worshipped and walked around, and an annakut of many dishes is offered.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'गोवर्धन-धारण',
        titleEn: 'Lifting Govardhan',
        bodyHi: [
          'व्रज में इन्द्र के लिए यज्ञ की तैयारी थी। बालक कृष्ण ने व्रजवासियों से कहा कि उनका पालन गोवर्धन पर्वत, वन और गायें करते हैं, और वह पूजा पर्वत को अर्पित हुई।',
          'क्रुद्ध इन्द्र ने मूसलाधार वर्षा भेजी, तो कृष्ण ने गोवर्धन को उठा लिया और सात दिन तक पूरा व्रज उसकी छाया में सुरक्षित रहा।',
        ],
        bodyEn: [
          'In Vraj, preparations were under way for a sacrifice to Indra. The boy Krishna told the people of Vraj that they were sustained by Mount Govardhan, the forests and the cows, and that worship was offered to the mountain instead.',
          'The angry Indra sent torrential rain, so Krishna lifted Govardhan, and for seven days all of Vraj stayed safe in its shelter.',
        ],
        canonHi: 'श्रीमद्भागवत, स्कन्ध 10, अध्याय 24–25',
        canonEn: 'Shrimad Bhagavata, Skandha 10, Adhyaya 24–25',
        referenceUrls: ['https://vedabase.io/en/library/sb/10/24/', 'https://sa.wikisource.org/wiki/श्रीमद्भागवतपुराणम्/स्कन्धः_१०/पूर्वार्धः/अध्यायः_२४', 'https://vedabase.io/en/library/sb/10/25/', 'https://sa.wikisource.org/wiki/श्रीमद्भागवतपुराणम्/स्कन्धः_१०/पूर्वार्धः/अध्यायः_२५'],
      },
      {
        tier: 'purana',
        titleHi: 'गोबर का गोवर्धन',
        titleEn: 'A Govardhan of cow dung',
        bodyHi: [
          'स्कन्द पुराण के कार्तिक प्रतिपदा प्रसंग में आँगन में गोबर की मूर्ति बनाने का उल्लेख है। आगे गोवर्धन और सजी हुई गायों के पूजन का वर्णन आता है। घर में बना छोटा गोवर्धन उसी पर्वत और गो-धन का स्मरण है।',
        ],
        bodyEn: [
          'The Skanda Purana’s Kartik Pratipada passage mentions a cow-dung image in the courtyard, followed by worship of Govardhan and decorated cows. The small household Govardhan recalls the mountain and the cattle it sheltered.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 10.14–15, 22–24',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 10.14–15, 22–24',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371651.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_१०'],
      },
    ],
    bhavHi: 'पूजा उन्हीं की ओर मुड़ती है जो जीवन देते हैं — धरती, पर्वत और गायें।',
    bhavEn: 'Worship turns towards those who give life — the earth, the mountain and the cows.',
    anchors: {
      masa: [8],
      kathaIds: [
        'govardhan-puja-katha',
      ],
      ruleIds: [
        'govardhan-puja',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://vedabase.io/en/library/sb/10/24/', 'https://sa.wikisource.org/wiki/श्रीमद्भागवतपुराणम्/स्कन्धः_१०/पूर्वार्धः/अध्यायः_२४', 'https://vedabase.io/en/library/sb/10/25/', 'https://sa.wikisource.org/wiki/श्रीमद्भागवतपुराणम्/स्कन्धः_१०/पूर्वार्धः/अध्यायः_२५', 'https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371651.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_१०'],
      verificationNote: '2026-10-28: Read BBT/Vedabase and Wikisource for Bhagavata 10.24 and 10.25; read Tagare/Wikisource Skanda 2.4.10.14–15,22–24. Both parts of the first story checked in both publications. Cow-dung image moved from lok to its opened purana passage. Symbolic meaning is editorial, not a quotation.',
      confidence: 'Certain',
    },
  },
  {
    id: 'K18',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'भगवान को छप्पन भोग क्यों?',
    questionEn: 'Why do we offer God the chhappan bhog of fifty-six dishes?',
    practiceHi: 'अन्नकूट और विशेष उत्सवों पर ठाकुरजी को छप्पन प्रकार के व्यंजन अर्पित किए जाते हैं।',
    practiceEn: 'At Annakut and on special festivals, fifty-six kinds of dishes are offered to Thakurji.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'पुष्टिमार्ग',
        regionEn: 'Pushtimarg',
        titleHi: 'सात दिन, आठ भोग',
        titleEn: 'Seven days, eight meals',
        bodyHi: [
          'पुष्टिमार्गीय परम्परा में कहा जाता है कि बालक कृष्ण दिन में आठ बार भोजन करते थे। गोवर्धन उठाए रहने के सात दिन उन्होंने कुछ नहीं खाया।',
          'वर्षा थमने पर व्रजवासियों और यशोदा ने सात दिनों के आठों भोग एक साथ बनाए — सात गुणा आठ, छप्पन।',
        ],
        bodyEn: [
          'In the Pushtimarg tradition it is said that the child Krishna ate eight times a day. For the seven days he held up Govardhan, he ate nothing.',
          'When the rain stopped, the people of Vraj and Yashoda made all eight meals for the seven days at once — seven times eight, fifty-six.',
        ],
        canonHi: 'लोक-परम्परा (पुष्टिमार्ग)',
        canonEn: 'Folk tradition (Pushtimarg)',
      },
    ],
    bhavHi: 'छप्पन भोग गिनती नहीं, उस प्रेम का हिसाब है जो सात दिन की भूख की भरपाई करना चाहता है।',
    bhavEn: 'The fifty-six dishes are not a count but a measure of the love that wishes to make up for seven days of hunger.',
    anchors: {
      masa: [8],
      kathaIds: [
        'govardhan-puja-katha',
      ],
      ruleIds: [
        'govardhan-puja',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Pushtimarg). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'K19',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'भाई दूज पर तिलक और यमुना-स्नान क्यों?',
    questionEn: 'Why do we apply tilak and bathe in the Yamuna on Bhai Dooj?',
    practiceHi: 'कार्तिक शुक्ल द्वितीया को बहनें भाई को तिलक लगाकर भोजन कराती हैं; कई जगह, विशेषकर मथुरा में, भाई-बहन साथ यमुना-स्नान करते हैं।',
    practiceEn: 'On Kartik Shukla Dwitiya, sisters apply tilak to their brothers and feed them; in many places, especially Mathura, brothers and sisters bathe in the Yamuna together.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'यम और यमुना',
        titleEn: 'Yama and Yamuna',
        bodyHi: [
          'स्कन्द पुराण में यमुना अपने व्यस्त भाई यम को बार-बार भोजन के लिए बुलाती हैं। कार्तिक शुक्ल द्वितीया को वे आते हैं और बहन उनका स्नान, वस्त्र, आभूषण और भोजन से सत्कार करती हैं।',
          'यमुना हर वर्ष उनके आने और इस दिन बहन के हाथ का भोजन पाने वाले भाइयों के सुख का वर माँगती हैं। उत्तर में यम यमुना-स्नान और बहन के घर भोजन की महिमा बताते हैं। तिलक आज के स्वागत की रीति है; इस प्रसंग में उसका अलग वर्णन नहीं है।',
        ],
        bodyEn: [
          'In the Skanda Purana, Yamuna repeatedly invites her busy brother Yama for a meal. He comes on Kartik Shukla Dwitiya; she welcomes him with a bath, clothes, ornaments and food.',
          'She asks that he visit every year and that brothers who eat from their sisters’ hands that day be happy. Yama praises bathing in the Yamuna and dining at a sister’s home. Tilak is part of the customary welcome today; this passage does not separately describe it.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 11.41–53',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 11.41–53',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371652.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_११'],
      },
    ],
    bhavHi: 'भाई-बहन का स्नेह इतना बड़ा माना गया कि मृत्यु के देवता भी उसके आगे वर देने वाले बन गए।',
    bhavEn: 'The love between brother and sister was seen as so great that even the god of death became a giver of boons before it.',
    anchors: {
      masa: [8],
      kathaIds: [
        'bhai-dooj-katha',
      ],
      ruleIds: [
        'bhai-dooj',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371652.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_११', 'https://www.drikpanchang.com/festivals/bhai-dooj/info/bhai-dooj.html?lang=en'],
      verificationNote: '2026-10-28: Read Tagare and Wikisource Sanskrit for Skanda 2.4.11.41–53; independently opened Drik Panchang’s Bhai Dooj account for present-day tilak and bathing practice. Changed the story from lok to purana. Removed unquantified years of delay and distinguished modern tilak from the source’s welcome, clothes and meal. No immunity is promised in the app’s own voice.',
      confidence: 'Likely',
    },
  },
  {
    id: 'K20',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'यम द्वितीया पर चित्रगुप्त और क़लम-दवात की पूजा क्यों?',
    questionEn: 'Why do people worship Chitragupta and the pen and inkpot on Yama Dwitiya?',
    practiceHi: 'यम द्वितीया को कायस्थ परिवार चित्रगुप्त की पूजा करते हैं; क़लम, दवात और बही पूजी जाती है और उस दिन लिखने का काम विश्राम पाता है।',
    practiceEn: 'On Yama Dwitiya, Kayastha families worship Chitragupta; the pen, the inkpot and the ledger are worshipped, and writing work rests for the day.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'यम के लेखाकार',
        titleEn: 'Yama\'s record-keeper',
        bodyHi: [
          'चित्रगुप्त यमराज के लेखाकार हैं, जो हर जीव के कर्मों का लेखा रखते हैं। यम द्वितीया को यम के साथ उनका भी पूजन होता है, और कायस्थ समाज उन्हें अपना आदि-पुरुष मानता है।',
        ],
        bodyEn: [
          'Chitragupta is Yamaraj\'s record-keeper, who keeps the account of every being\'s deeds. On Yama Dwitiya he is worshipped along with Yama, and the Kayastha community regards him as its first ancestor.',
        ],
        canonHi: 'पद्म पुराण / भविष्य पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Padma Purana / Bhavishya Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'जिस क़लम से जीवन का हिसाब चलता है, उसे एक दिन विश्राम देकर उसके देवता का स्मरण किया जाता है।',
    bhavEn: 'The pen that keeps the account of life is given a day of rest, and its deity is remembered.',
    anchors: {
      masa: [8],
      ruleIds: [
        'chitragupta-puja',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Padma Purana / Bhavishya Purana (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'K21',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'छठ में जल में खड़े होकर डूबते और उगते सूर्य को अर्घ्य क्यों?',
    questionEn: 'Why do we stand in water during Chhath to offer arghya to the setting and the rising sun?',
    practiceHi: 'छठ में व्रती नदी या तालाब के जल में खड़े होकर पहले अस्त होते सूर्य को और अगली भोर उगते सूर्य को अर्घ्य देते हैं।',
    practiceEn: 'During Chhath, those keeping the fast stand in the water of a river or pond and offer arghya first to the setting sun and, at the next dawn, to the rising sun.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'वैदिक सूर्य-उपासना',
        titleEn: 'Vedic sun worship',
        bodyHi: [
          'वेदों में सूर्य प्रकाश और जीवन के देवता के रूप में स्तुत हैं। उदय और अस्त के समय सूर्य की उपासना की परम्परा बहुत पुरानी है।',
        ],
        bodyEn: [
          'In the Vedas, the sun is praised as the god of light and life. The tradition of worshipping the sun at its rising and setting is very old.',
        ],
        canonHi: 'वेद — सूर्य-उपासना (मन्त्र-स्थान समीक्षाधीन)',
        canonEn: 'Vedas — sun worship (mantra locations under review)',
      },
      {
        tier: 'shastra',
        titleHi: 'कर्ण की सूर्य-भक्ति',
        titleEn: 'Karna\'s devotion to the sun',
        bodyHi: [
          'महाभारत में कर्ण सूर्य-पुत्र हैं और सूर्य के अनन्य उपासक। वे नित्य सूर्य की उपासना करते थे, और उस समय आए याचक को कभी खाली हाथ नहीं लौटाते थे।',
        ],
        bodyEn: [
          'In the Mahabharata, Karna is the son of the sun god and a devoted worshipper of the sun. He worshipped the sun every day, and never sent away empty-handed anyone who came to ask of him at that time.',
        ],
        canonHi: 'महाभारत (पर्व समीक्षाधीन)',
        canonEn: 'Mahabharata (parva under review)',
      },
      {
        tier: 'lok',
        regionHi: 'बिहार · पूर्वी उत्तर प्रदेश',
        regionEn: 'Bihar · eastern Uttar Pradesh',
        titleHi: 'छठ की कथाएँ',
        titleEn: 'The stories of Chhath',
        bodyHi: [
          'लोक में छठ की कई कथाएँ कही जाती हैं। एक में कर्ण कमर तक जल में खड़े होकर सूर्य को अर्घ्य देते हैं; दूसरी में द्रौपदी पाण्डवों के संकट में यह व्रत रखती हैं।',
          'मुंगेर की परम्परा कहती है कि सीता ने वहाँ छठ का व्रत किया था।',
        ],
        bodyEn: [
          'Folk tradition tells several stories of Chhath. In one, Karna stands waist-deep in water to offer arghya to the sun; in another, Draupadi keeps this fast when the Pandavas are in trouble.',
          'The tradition of Munger says that Sita kept the Chhath fast there.',
        ],
        canonHi: 'लोक-परम्परा (बिहार · पूर्वी उत्तर प्रदेश)',
        canonEn: 'Folk tradition (Bihar · eastern Uttar Pradesh)',
      },
    ],
    bhavHi: 'डूबते सूर्य को भी अर्घ्य देना कृतज्ञता है — जो दिन भर देता रहा, उसे विदा में भी प्रणाम।',
    bhavEn: 'Offering arghya even to the setting sun is gratitude — a farewell bow to the one who gave all day.',
    anchors: {
      masa: [8],
      kathaIds: [
        'chhath-puja-katha',
      ],
      ruleIds: [
        'chaiti-chhath',
        'chhath-puja',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Vedas — sun worship (mantra locations under review) | Mahabharata (parva under review) | Folk tradition (Bihar · eastern Uttar Pradesh). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'K22',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'गोपाष्टमी पर गायों की पूजा क्यों?',
    questionEn: 'Why do we worship cows on Gopashtami?',
    practiceHi: 'कार्तिक शुक्ल अष्टमी को गायों और बछड़ों को नहलाकर सजाया जाता है, उनकी पूजा होती है और उन्हें भोजन कराया जाता है।',
    practiceEn: 'On Kartik Shukla Ashtami, cows and calves are bathed and decorated, worshipped and fed.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'बछड़ों से गायों तक',
        titleEn: 'From calves to cows',
        bodyHi: [
          'कहा जाता है कि बचपन में कृष्ण केवल बछड़े चराते थे। कार्तिक शुक्ल अष्टमी को पहली बार उन्हें गायें चराने भेजा गया, और यही दिन गोपाष्टमी के रूप में मनाया जाता है।',
        ],
        bodyEn: [
          'It is said that as a child Krishna herded only the calves. On Kartik Shukla Ashtami he was sent to herd the cows for the first time, and this day is celebrated as Gopashtami.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
        referenceUrls: ['https://www.iskconpune.com/gopashtami/', 'https://www.jkp.org.in/gopashtami-when-god-became-a-cowherd/'],
      },
    ],
    bhavHi: 'जिस गाय से घर का पोषण होता है, उसके प्रति कृतज्ञता का यह दिन है।',
    bhavEn: 'This is a day of gratitude towards the cow that nourishes the household.',
    anchors: {
      masa: [8],
      ruleIds: [
        'gopashtami',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.iskconpune.com/gopashtami/', 'https://www.jkp.org.in/gopashtami-when-god-became-a-cowherd/'],
      verificationNote: '2026-10-28: Read ISKCON Pune’s Gopashtami account and Jagadguru Kripalu Parishat’s independently authored 2025-10-31 account. Both describe the custom and Krishna beginning cow-herding. Verified as a traditional telling, not as historical dating. The Pune page quotes a Purana but its chapter was not collated, so no scriptural claim is added to the lok canon.',
      confidence: 'Likely',
    },
  },
  {
    id: 'K23',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'आँवला नवमी पर आँवले के पेड़ के नीचे भोजन क्यों?',
    questionEn: 'Why do we eat beneath the amla tree on Amla Navami?',
    practiceHi: 'कार्तिक शुक्ल नवमी (आँवला या अक्षय नवमी) को आँवले के पेड़ की पूजा होती है, और कई परिवार उसके नीचे भोजन बनाकर खाते हैं।',
    practiceEn: 'On Kartik Shukla Navami (Amla or Akshaya Navami), the amla tree is worshipped, and many families cook and eat beneath it.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'एक वृक्ष, दो देव',
        titleEn: 'One tree, two gods',
        bodyHi: [
          'कथा है कि लक्ष्मी एक साथ विष्णु और शिव की पूजा करना चाहती थीं। तुलसी विष्णु को प्रिय है और बेल शिव को; आँवले में दोनों के गुण माने गए, इसलिए उन्होंने आँवले के वृक्ष में दोनों का वास माना।',
          'लक्ष्मी ने आँवले की पूजा की और उसके नीचे भोजन बनाकर विष्णु और शिव को खिलाया। तभी से इस दिन आँवले के नीचे भोजन की रीति कही जाती है।',
        ],
        bodyEn: [
          'The story goes that Lakshmi wished to worship Vishnu and Shiva together. Tulsi is dear to Vishnu and bel to Shiva; the amla was held to have the qualities of both, so she took the amla tree to be the dwelling of both.',
          'Lakshmi worshipped the amla, cooked a meal beneath it and fed Vishnu and Shiva. From then on, it is said, comes the custom of eating under the amla on this day.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
        referenceUrls: ['https://www.bhaktibharat.com/en/festival/amla-navami', 'https://www.timesnowhindi.com/spirituality/amla-navami-2024-katha-in-hindi-amla-navami-ki-kahani-katha-and-story-akshaya-navami-ki-katha-article-115131198/amp'],
      },
    ],
    bhavHi: 'एक वृक्ष में दो देवताओं का वास देखना भेद मिटाने का भाव है।',
    bhavEn: 'Seeing two gods dwelling in one tree is a way of letting difference fall away.',
    anchors: {
      masa: [8],
      kathaIds: [
        'akshaya-navami-katha',
      ],
      ruleIds: [
        'akshaya-navami',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.bhaktibharat.com/en/festival/amla-navami', 'https://www.timesnowhindi.com/spirituality/amla-navami-2024-katha-in-hindi-amla-navami-ki-kahani-katha-and-story-akshaya-navami-ki-katha-article-115131198/amp'],
      verificationNote: '2026-10-28: Read BhaktiBharat’s published vrat telling and Lavina Sharma’s independently authored Times Now Navbharat account (2024-11-10). Both describe Lakshmi, the Tulsi/bel symbolism, the two gods and the meal beneath the tree. Verified only as a folk telling. The opened Hindu Scriptures page gives a different origin and is not counted as corroboration for this story.',
      confidence: 'Guessing',
    },
  },
  {
    id: 'K24',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'देव उठनी पर गन्ने का मण्डप और थाली बजाकर देव क्यों जगाते हैं?',
    questionEn: 'On Dev Uthani, why do we build a sugarcane canopy and wake the god by beating plates?',
    practiceHi: 'देव उठनी एकादशी को आँगन में गन्नों का मण्डप सजाकर विष्णु की पूजा होती है और थाली बजाकर “उठो देव” गाते हुए देव जगाए जाते हैं। इसके बाद विवाह-मुहूर्त फिर आरम्भ होते हैं।',
    practiceEn: 'On Dev Uthani Ekadashi, a canopy of sugarcane is set up in the courtyard for the worship of Vishnu, and the god is woken by beating a plate and singing “Utho Dev” (“Rise, god”). After this, wedding dates open up again.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'चार मास की योगनिद्रा',
        titleEn: 'Four months of yogic sleep',
        bodyHi: [
          'पुराण-परम्परा के अनुसार आषाढ़ शुक्ल एकादशी (देवशयनी) से विष्णु चार मास की योगनिद्रा में रहते हैं। कार्तिक शुक्ल एकादशी को वे जागते हैं, इसलिए यह दिन प्रबोधिनी या देव उठनी एकादशी कहलाता है।',
        ],
        bodyEn: [
          'According to Purana tradition, from Ashadha Shukla Ekadashi (Devshayani) Vishnu remains in yogic sleep for four months. He wakes on Kartik Shukla Ekadashi, so this day is called Prabodhini or Dev Uthani Ekadashi.',
        ],
        canonHi: 'पुराण-परम्परा (ग्रन्थ और अध्याय समीक्षाधीन)',
        canonEn: 'Purana tradition (text and adhyaya under review)',
      },
      {
        tier: 'lok',
        regionHi: 'उत्तर भारत',
        regionEn: 'North India',
        titleHi: 'उठो देव',
        titleEn: 'Utho Dev',
        bodyHi: [
          'जब देव सोए हों, तब विवाह जैसे बड़े संस्कार टाले जाते हैं, और उनके जागने पर ये फिर आरम्भ होते हैं। गन्ने का मण्डप, थाली का नाद और लोक-गीत उसी जागरण का स्वागत हैं।',
        ],
        bodyEn: [
          'While the gods sleep, major rites such as weddings are put off, and they begin again once the gods wake. The sugarcane canopy, the sound of the plate and the folk songs all welcome that awakening.',
        ],
        canonHi: 'लोक-परम्परा (उत्तर भारत)',
        canonEn: 'Folk tradition (North India)',
      },
    ],
    bhavHi: 'चार मास की प्रतीक्षा के बाद देवता का जागना घर में नए आरम्भों का संकेत बन जाता है।',
    bhavEn: 'After four months of waiting, the god\'s awakening becomes a sign of new beginnings in the home.',
    anchors: {
      masa: [8],
      kathaIds: [
        'kartika-mahatmya',
        'dev-uthani-ekadashi-katha',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Purana tradition (text and adhyaya under review) | Folk tradition (North India). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'K25',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'कार्तिक के अन्तिम पाँच दिन भीष्म पंचक क्यों?',
    questionEn: 'Why are the last five days of Kartik kept as Bhishma Panchak?',
    practiceHi: 'कार्तिक शुक्ल एकादशी से पूर्णिमा तक के पाँच दिन कई लोग भीष्म पंचक का व्रत रखते हैं; आहार और नियम परिवार की परम्परा के अनुसार भिन्न होते हैं।',
    practiceEn: 'For the five days from Kartik Shukla Ekadashi to Purnima, many people keep the Bhishma Panchak fast; food and observances vary by family tradition.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'शर-शय्या पर धर्म-उपदेश',
        titleEn: 'Teachings from the bed of arrows',
        bodyHi: [
          'स्कन्द पुराण के इस प्रसंग में बाणों की शय्या पर लेटे भीष्म ने राजधर्म, मोक्षधर्म और दानधर्म सुनाए। पाण्डवों और कृष्ण ने उनके उपदेश सुने।',
        ],
        bodyEn: [
          'In this Skanda Purana passage, Bhishma teaches royal duties, liberation and giving while lying on a bed of arrows. The Pandavas and Krishna listen to him.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 32.2–3',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 32.2–3',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371674.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_३२'],
      },
      {
        tier: 'purana',
        titleHi: 'भीष्म के नाम पाँच दिन',
        titleEn: 'Five days in Bhishma\'s name',
        bodyHi: [
          'इसी कथा में भीष्म के जल माँगने पर अर्जुन बाण से गंगा-जल लाते हैं। प्रसन्न कृष्ण एकादशी से पूर्णिमा तक भीष्म के स्मरण में अर्घ्य देने की बात कहते हैं। पाँच दिनों का व्रत इसी प्रसंग से भीष्म पंचक कहलाता है।',
        ],
        bodyEn: [
          'In the same story, Arjuna brings Ganga water with an arrow when Bhishma asks for water. Krishna speaks of honouring Bhishma from Ekadashi to Purnima. This passage connects the five-day vow with the name Bhishma Panchak.',
        ],
        canonHi: 'स्कन्द पुराण, वैष्णव खण्ड, कार्तिकमास माहात्म्य 32.1, 4–8',
        canonEn: 'Skanda Purana, Vaishnava Khanda, Karttikamasa Mahatmya 32.1, 4–8',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371674.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_३२'],
      },
    ],
    bhavHi: 'जीवन के अन्त में भी जो ज्ञान बाँटा गया, उसे वर्ष के एक मास के अन्त में याद किया जाता है।',
    bhavEn: 'Knowledge shared even at the end of a life is remembered at the end of one month of the year.',
    anchors: {
      masa: [8],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-skanda-purana/d/doc371674.html', 'https://sa.wikisource.org/wiki/स्कन्दपुराणम्/खण्डः_२_(वैष्णवखण्डः)/कार्तिकमासमाहात्म्यम्/अध्यायः_३२'],
      verificationNote: '2026-10-28: Both stories checked against Tagare and Wikisource, Skanda 2.4.32.1–8. Replaced broad Mahabharata and pending Padma attributions with this opened Purana account. Added the water/Arjuna explanation and corrected the teaching list to rajadharma, mokshadharma and danadharma. This is the Purana’s explanation, not a dated assertion about the epic chronology.',
      confidence: 'Certain',
    },
  },
  {
    id: 'K26',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'कार्तिक पूर्णिमा पर देव दीपावली और कार्तिगै दीपम् क्यों?',
    questionEn: 'Why do we celebrate Dev Deepavali and Karthigai Deepam on Kartik Purnima?',
    practiceHi: 'कार्तिक पूर्णिमा की संध्या काशी के गंगा-घाट दीयों से सजते हैं — देव दीपावली। तमिल परम्परा में कार्तिगै दीपम् पर घर दीयों से सजते हैं और तिरुवण्णामलै की पहाड़ी पर महादीप जलाया जाता है।',
    practiceEn: 'On the evening of Kartik Purnima, the Ganga ghats of Kashi are decked with lamps — Dev Deepavali. In Tamil tradition, homes are decorated with lamps on Karthigai Deepam, and a great lamp is lit on the hill at Tiruvannamalai.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'त्रिपुर-संहार',
        titleEn: 'The destruction of Tripura',
        bodyHi: [
          'तीन असुरों के तीन अजेय नगर थे — त्रिपुर — जो केवल तब एक ही बाण से नष्ट हो सकते थे, जब तीनों एक सीध में आएँ। देवताओं ने शिव के लिए दिव्य रथ सजाया, और सही क्षण पर शिव ने एक ही बाण से तीनों पुर भस्म कर दिए।',
          'परम्परा में यह विजय कार्तिक पूर्णिमा से जोड़ी जाती है, इसलिए यह त्रिपुरारी पूर्णिमा कहलाती है।',
        ],
        bodyEn: [
          'Three demons had three invincible cities — Tripura — which could be destroyed with a single arrow only when all three came into one line. The gods prepared a divine chariot for Shiva, and at the right moment Shiva burned all three cities to ash with a single arrow.',
          'Tradition links this victory to Kartik Purnima, which is why it is called Tripurari Purnima.',
        ],
        canonHi: 'महाभारत, कर्ण पर्व · शिव पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Mahabharata, Karna Parva · Shiva Purana (adhyaya under review)',
      },
      {
        tier: 'lok',
        regionHi: 'काशी',
        regionEn: 'Kashi',
        titleHi: 'देवताओं की दीपावली',
        titleEn: 'The Deepavali of the gods',
        bodyHi: [
          'कहा जाता है कि त्रिपुर-विजय के उत्सव में देवताओं ने काशी में दीप जलाए। इसीलिए कार्तिक पूर्णिमा की संध्या काशी के घाटों पर जलते दीयों को देवताओं की दीपावली कहा जाता है।',
        ],
        bodyEn: [
          'It is said that the gods lit lamps in Kashi to celebrate the victory over Tripura. That is why the lamps burning on the ghats of Kashi on the evening of Kartik Purnima are called the Deepavali of the gods.',
        ],
        canonHi: 'लोक-परम्परा (काशी)',
        canonEn: 'Folk tradition (Kashi)',
      },
      {
        tier: 'lok',
        regionHi: 'तमिलनाडु',
        regionEn: 'Tamil Nadu',
        titleHi: 'अरुणाचल की ज्योति',
        titleEn: 'The light of Arunachala',
        bodyHi: [
          'तमिल परम्परा में कथा है कि ब्रह्मा और विष्णु में श्रेष्ठता का विवाद हुआ, तब शिव उनके बीच अग्नि के अनन्त स्तम्भ के रूप में प्रकट हुए। हंस बनकर ब्रह्मा ऊपर और वराह बनकर विष्णु नीचे गए, पर कोई उसका छोर न पा सका।',
          'तिरुवण्णामलै की अरुणाचल पहाड़ी उसी ज्योति का रूप मानी जाती है, और कार्तिगै दीपम् पर उसके शिखर पर महादीप जलाया जाता है।',
        ],
        bodyEn: [
          'In Tamil tradition, the story goes that when Brahma and Vishnu argued over who was greater, Shiva appeared between them as an endless pillar of fire. Brahma, as a swan, went up and Vishnu, as a boar, went down, but neither could find its end.',
          'The Arunachala hill at Tiruvannamalai is held to be a form of that light, and on Karthigai Deepam the great lamp is lit on its summit.',
        ],
        canonHi: 'लोक-परम्परा (तमिलनाडु)',
        canonEn: 'Folk tradition (Tamil Nadu)',
      },
    ],
    bhavHi: 'दोनों कथाओं में प्रकाश विजय और अनन्तता का चिह्न है, इसलिए यह पूर्णिमा दीपों की पूर्णिमा बन गई।',
    bhavEn: 'In both stories light is a sign of victory and of the infinite, and so this full moon became the full moon of lamps.',
    anchors: {
      masa: [8],
      ruleIds: [
        'kartik-purnima',
        'karthigai-deepam',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Mahabharata, Karna Parva · Shiva Purana (adhyaya under review) | Folk tradition (Kashi) | Folk tradition (Tamil Nadu). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'K27',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'मिथिला में सामा-चकेवा क्यों मनाया जाता है?',
    questionEn: 'Why is Sama-Chakeva celebrated in Mithila?',
    practiceHi: 'मिथिला में कार्तिक के शुक्ल पक्ष में बहनें मिट्टी की सामा, चकेवा और पक्षियों की मूर्तियाँ बनाकर संध्या को गीत गाती हैं। पूर्णिमा को इन मूर्तियों को विदा किया जाता है।',
    practiceEn: 'In Mithila, during the bright half of Kartik, sisters make clay figures of Sama, Chakeva and birds, and sing songs in the evening. On Purnima these figures are given a farewell.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'मिथिला',
        regionEn: 'Mithila',
        titleHi: 'सामा और साम्ब',
        titleEn: 'Sama and Samba',
        bodyHi: [
          'कथा है कि श्रीकृष्ण की पुत्री सामा पर एक चुगलखोर ने झूठा आरोप लगाया, और शाप से वह पक्षी बन गई। उसके भाई साम्ब के प्रयत्न से सामा को फिर अपना रूप मिला।',
          'उसी स्मरण में बहनें सामा-चकेवा की मूर्तियाँ बनाती हैं और चुगला की मूर्ति का उपहास करती हैं।',
        ],
        bodyEn: [
          'The story goes that a slanderer made a false charge against Sama, Krishna\'s daughter, and through a curse she became a bird. Through the efforts of her brother Samba, Sama regained her own form.',
          'In memory of this, sisters make figures of Sama and Chakeva and make fun of a figure of Chugla.',
        ],
        canonHi: 'लोक-परम्परा (मिथिला)',
        canonEn: 'Folk tradition (Mithila)',
      },
    ],
    bhavHi: 'झूठी बात रिश्ते तोड़ती है, और भाई-बहन का स्नेह उन्हें फिर जोड़ देता है।',
    bhavEn: 'False words break relationships, and the love between brother and sister joins them again.',
    anchors: {
      masa: [8],
      ruleIds: [
        'sama-chakeva',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Mithila). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'K28',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'कार्तिक पूर्णिमा पर ओडिशा में छोटी नावें क्यों तैराते हैं?',
    questionEn: 'Why do people in Odisha float little boats on Kartik Purnima?',
    practiceHi: 'ओडिशा में कार्तिक पूर्णिमा की भोर कागज़ या केले के छिलके से बनी छोटी नावों में दीया रखकर नदी, तालाब या समुद्र में तैराया जाता है — बोइत बन्दाण।',
    practiceEn: 'In Odisha, at dawn on Kartik Purnima, little boats made of paper or banana bark, each holding a lamp, are set afloat on rivers, ponds or the sea — Boita Bandana.',
    kathas: [
      {
        tier: 'itihas',
        regionHi: 'ओडिशा',
        regionEn: 'Odisha',
        titleHi: 'कलिंग के साधब',
        titleEn: 'The sadhabas of Kalinga',
        bodyHi: [
          'प्राचीन कलिंग के व्यापारी — साधब — बड़ी नावों (बोइत) में बाली और जावा तक व्यापार करने जाते थे, और उनकी यात्राएँ कार्तिक पूर्णिमा से जुड़ी थीं।',
          'छोटी नावें तैराना उन्हीं समुद्र-यात्राओं और यात्रियों के सकुशल लौटने की कामना का स्मरण है।',
        ],
        bodyEn: [
          'The merchants of ancient Kalinga — the sadhabas — sailed in large boats (boitas) to trade as far as Bali and Java, and their voyages were linked to Kartik Purnima.',
          'Floating the little boats recalls those sea voyages and the hope that the travellers return safely.',
        ],
        canonHi: 'इतिहास · प्राचीन ओड़िया नाविकों की बाली-जावा यात्राएँ',
        canonEn: 'History · Bali–Java voyages of ancient Odia sailors',
      },
    ],
    bhavHi: 'छोटी-सी नाव में दूर गए अपनों की याद और उनके लौट आने की कामना तैरती है।',
    bhavEn: 'In a tiny boat float the memory of loved ones who went far away and the wish for their return.',
    anchors: {
      masa: [8],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: History · Bali–Java voyages of ancient Odia sailors. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'K29',
    axis: 'masa',
    kind: 'pratha',
    phase: 1,
    questionHi: 'कार्तिक पूर्णिमा पर पुष्कर में स्नान क्यों?',
    questionEn: 'Why do people bathe at Pushkar on Kartik Purnima?',
    practiceHi: 'कार्तिक के अन्तिम दिनों में, विशेषकर पूर्णिमा को, राजस्थान के पुष्कर सरोवर में स्नान के लिए श्रद्धालु बड़ी संख्या में आते हैं।',
    practiceEn: 'In the last days of Kartik, especially on Purnima, devotees come in large numbers to bathe in the Pushkar lake in Rajasthan.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'ब्रह्मा का यज्ञ',
        titleEn: 'Brahma\'s sacrifice',
        bodyHi: [
          'पद्म पुराण में ब्रह्मा के गिराए कमल से पुष्कर तीर्थ के नाम और पवित्र स्थान का सम्बन्ध बताया गया है। यहाँ देवताओं के साथ यज्ञ का प्रसंग भी आता है।',
          'एक अलग अध्याय कार्तिक पूर्णिमा पर पुष्कर-स्नान का महत्त्व बताता है। इसलिए कमल, तीर्थ और पूर्णिमा-स्नान को जोड़ा गया है; यज्ञ की वही तिथि होना इस विवरण से नहीं कहा गया है।',
        ],
        bodyEn: [
          'The Padma Purana connects the sacred place and the name Pushkar with the lotus Brahma dropped. It also describes a sacrifice there with the gods.',
          'A separate chapter praises bathing at Pushkar on Kartik Purnima. These passages connect the lotus, the sacred place and the full-moon bath; they are not presented here as dating that sacrifice to the same day.',
        ],
        canonHi: 'पद्म पुराण, सृष्टि खण्ड 15.99–102, 126–133; 32.67–71',
        canonEn: 'Padma Purana, Srishti Khanda 15.99–102, 126–133; 32.67–71',
        referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-padma-purana/d/doc364135.html', 'https://sa.wikisource.org/wiki/पद्मपुराणम्/खण्डः_१_(सृष्टिखण्डम्)/अध्यायः_१५', 'https://www.wisdomlib.org/hinduism/book/the-padma-purana/d/doc364154.html', 'https://sa.wikisource.org/wiki/पद्मपुराणम्/खण्डः_१_(सृष्टिखण्डम्)/अध्यायः_३२'],
      },
    ],
    bhavHi: 'पुष्कर का स्नान ब्रह्मा से जुड़े तीर्थ और शुद्धि की भावना का स्मरण है।',
    bhavEn: 'The Pushkar bath remembers a sacred place associated with Brahma and the idea of purification.',
    anchors: {
      masa: [8],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.wisdomlib.org/hinduism/book/the-padma-purana/d/doc364135.html', 'https://sa.wikisource.org/wiki/पद्मपुराणम्/खण्डः_१_(सृष्टिखण्डम्)/अध्यायः_१५', 'https://www.wisdomlib.org/hinduism/book/the-padma-purana/d/doc364154.html', 'https://sa.wikisource.org/wiki/पद्मपुराणम्/खण्डः_१_(सृष्टिखण्डम्)/अध्यायः_३२'],
      verificationNote: '2026-10-28: Read Deshpande and Wikisource Sanskrit for Srishti 15.99–102,126–133 and 32.67–71. Corrected the lotus claim to naming/establishing the tirtha; removed unsupported plural lakes and the assertion dating Brahma’s sacrifice to Kartik Purnima. The full-moon bath has its own exact chapter. Both portions checked in both publications.',
      confidence: 'Likely',
    },
  },
  {
    id: 'C1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'नववर्ष पर गुड़ी क्यों फहराते हैं और नीम-गुड़ क्यों खाते हैं?',
    questionEn: 'Why do we raise a gudi at the new year, and why do we eat neem with jaggery?',
    practiceHi: 'चैत्र शुक्ल प्रतिपदा को नया वर्ष मनाया जाता है — महाराष्ट्र में घर के बाहर बाँस पर वस्त्र और उलटा कलश बाँधकर गुड़ी फहराई जाती है, और कई जगह नीम की पत्तियाँ गुड़ के साथ खाई जाती हैं। आन्ध्र प्रदेश और तेलंगाना में उगादि पर छह स्वादों वाली पचड़ी बनती है।',
    practiceEn: 'The new year is celebrated on Chaitra Shukla Pratipada. In Maharashtra, a gudi is raised outside the home by tying a cloth and an upturned kalash to a bamboo pole, and in many places neem leaves are eaten with jaggery. In Andhra Pradesh and Telangana, a pachadi with six tastes is made for Ugadi.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'सृष्टि का पहला दिन',
        titleEn: 'The first day of creation',
        bodyHi: [
          'मान्यता है कि ब्रह्मा ने चैत्र शुक्ल प्रतिपदा को सृष्टि की रचना आरम्भ की। इसीलिए यह तिथि नए संवत्सर का पहला दिन मानी जाती है।',
        ],
        bodyEn: [
          'It is believed that Brahma began the creation of the world on Chaitra Shukla Pratipada. That is why this tithi is regarded as the first day of a new samvatsara, or year.',
        ],
        canonHi: 'ब्रह्म पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Brahma Purana (adhyaya under review)',
      },
      {
        tier: 'lok',
        regionHi: 'महाराष्ट्र',
        regionEn: 'Maharashtra',
        titleHi: 'गुड़ी — विजय की ध्वजा',
        titleEn: 'The gudi, a flag of victory',
        bodyHi: [
          'महाराष्ट्र में गुड़ी को विजय और मंगल की ध्वजा माना जाता है। एक लोक-कथा इसे रावण पर विजय के बाद राम के अयोध्या लौटने की स्मृति से जोड़ती है।',
        ],
        bodyEn: [
          'In Maharashtra, the gudi is seen as a flag of victory and good fortune. One folk tale links it to the memory of Rama returning to Ayodhya after his victory over Ravana.',
        ],
        canonHi: 'लोक-परम्परा (महाराष्ट्र)',
        canonEn: 'Folk tradition (Maharashtra)',
      },
      {
        tier: 'itihas',
        regionHi: 'महाराष्ट्र',
        regionEn: 'Maharashtra',
        titleHi: 'शालिवाहन शक',
        titleEn: 'The Shalivahana Shaka era',
        bodyHi: [
          'एक परम्परा गुड़ी को राजा शालिवाहन की विजय-ध्वजा मानती है। महाराष्ट्र और दक्षिण भारत के पारम्परिक पंचांगों में चलने वाले शालिवाहन शक संवत् का नया वर्ष भी इसी दिन से आरम्भ होता है।',
        ],
        bodyEn: [
          'One tradition sees the gudi as the victory flag of King Shalivahana. The new year of the Shalivahana Shaka era, which runs in the traditional panchangs of Maharashtra and South India, also begins on this day.',
        ],
        canonHi: 'इतिहास · शालिवाहन शक संवत्',
        canonEn: 'History · Shalivahana Shaka Samvat',
      },
    ],
    bhavHi: 'नीम की कड़वाहट और गुड़ की मिठास साथ चखना इस भाव को रखता है कि नया वर्ष मीठे-कड़वे दोनों अनुभव लाएगा, और दोनों को समभाव से अपनाने की सीख इसी स्वाद में है।',
    bhavEn: 'Tasting the bitterness of neem and the sweetness of jaggery together holds the thought that the new year will bring both sweet and bitter experiences. The lesson of accepting both with an even mind lies in this very taste.',
    anchors: {
      masa: [1],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Brahma Purana (adhyaya under review) | Folk tradition (Maharashtra) | History · Shalivahana Shaka Samvat. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'C2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'नवरात्र में कलश के साथ जौ क्यों बोते हैं?',
    questionEn: 'Why do we sow barley alongside the kalash during Navratri?',
    practiceHi: 'चैत्र नवरात्र के पहले दिन घटस्थापना होती है — मिट्टी में जौ बोकर उसके साथ जल-भरा कलश स्थापित किया जाता है। नौ दिनों में उगे जवारे पर्व के अन्त में विसर्जित किए जाते हैं।',
    practiceEn: 'Ghatasthapana takes place on the first day of Chaitra Navratri. Barley is sown in soil, and a water-filled kalash is installed beside it. The javare, the shoots that grow over the nine days, are immersed at the end of the festival.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'कलश में देवी, जौ में नया अन्न',
        titleEn: 'The goddess in the kalash, new grain in the barley',
        bodyHi: [
          'घटस्थापना में जल-भरे कलश को देवी का आसन माना जाता है, और उसी में देवी का आवाहन किया जाता है। उसके साथ बोया गया जौ नई फ़सल का पहला अंश माना जाता है।',
          'कई घरों में जवारे कितने घने और हरे उगे, इससे आने वाले वर्ष का अनुमान लगाने की रीति भी है।',
        ],
        bodyEn: [
          'In ghatasthapana, the water-filled kalash is regarded as the seat of the goddess, and the goddess is invoked into it. The barley sown beside it is regarded as the first share of the new harvest.',
          'In many homes there is also a custom of reading the coming year from how thick and green the javare have grown.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'कलश और जवारे को साथ रखकर नवरात्र देवी की शक्ति को धरती की उर्वरता और नए अन्न के स्वागत से जोड़ता है।',
    bhavEn: 'By keeping the kalash and the javare together, Navratri links the power of the goddess with the fertility of the earth and the welcome of new grain.',
    anchors: {
      masa: [1],
      kathaIds: [
        'navratri-start-katha',
      ],
      ruleIds: [
        'navratri-start',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'C3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'नवरात्र में कन्या पूजन क्यों करते हैं?',
    questionEn: 'Why do we honour young girls with kanya pujan during Navratri?',
    practiceHi: 'नवरात्र की अष्टमी या नवमी को छोटी कन्याओं को घर बुलाकर उनके पैर धोए जाते हैं, उन्हें भोजन कराया जाता है और उपहार दिए जाते हैं; दिन कुल-परम्परा के अनुसार भिन्न होता है।',
    practiceEn: 'On the Ashtami or Navami of Navratri, young girls are invited home. Their feet are washed, they are given a meal and they receive gifts. The day varies according to family tradition.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'कन्या में देवी',
        titleEn: 'The goddess in the girl',
        bodyHi: [
          'देवी भागवत में नवरात्र-पूजा के प्रसंग में छोटी कन्याओं को देवी का रूप मानकर पूजने का वर्णन है। वहाँ आयु के अनुसार कन्याओं के अलग-अलग नाम बताए गए हैं — कुमारी से लेकर सुभद्रा तक।',
        ],
        bodyEn: [
          'The Devi Bhagavata, in its account of Navratri worship, describes honouring young girls as forms of the goddess. It gives the girls different names according to their age, from Kumari to Subhadra.',
        ],
        canonHi: 'देवी भागवत पुराण 3.26–27',
        canonEn: 'Devi Bhagavata Purana 3.26–27',
      },
    ],
    bhavHi: 'कन्या पूजन इस भाव को रखता है कि जिस शक्ति की नौ दिन उपासना होती है, वह हर बालिका में भी निवास करती है।',
    bhavEn: 'Kanya pujan holds the thought that the shakti worshipped for nine days also dwells in every girl.',
    anchors: {
      masa: [1],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Devi Bhagavata Purana 3.26–27. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'C4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'शीतला अष्टमी पर बासी खाना क्यों खाते हैं?',
    questionEn: 'Why do we eat day-old food on Sheetala Ashtami?',
    practiceHi: 'शीतला अष्टमी (कहीं सप्तमी) को, जिसे बसोड़ा भी कहते हैं, घरों में चूल्हा नहीं जलाया जाता; एक दिन पहले बना ठण्डा भोजन देवी को चढ़ाकर वही खाया जाता है।',
    practiceEn: 'On Sheetala Ashtami (Saptami in some places), also called Basoda, the stove is not lit at home. Cold food cooked the day before is offered to the goddess, and that same food is eaten.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'उत्तर भारत',
        regionEn: 'North India',
        titleHi: 'शीतल स्वभाव वाली देवी',
        titleEn: 'The goddess of a cool nature',
        bodyHi: [
          'शीतला को ठण्डक देने वाली देवी माना जाता है, जिनसे चेचक और ताप जैसे रोगों से रक्षा की प्रार्थना की जाती है। उनके दिन आग जलाना उनके शीतल स्वभाव के विपरीत माना जाता है, इसलिए भोग भी ठण्डा ही चढ़ता है।',
        ],
        bodyEn: [
          'Sheetala is regarded as a goddess who brings coolness, and people pray to her for protection from illnesses like smallpox and fever. Lighting a fire on her day is considered contrary to her cool nature, so the bhog offered to her is also cold.',
        ],
        canonHi: 'लोक-परम्परा (उत्तर भारत)',
        canonEn: 'Folk tradition (North India)',
      },
    ],
    bhavHi: 'ठण्डा भोग देवी के शीतल स्वरूप के प्रति आदर है — एक दिन के लिए रसोई की आग भी विश्राम करती है।',
    bhavEn: 'The cold bhog is a mark of respect for the cool form of the goddess. For one day, even the kitchen fire rests.',
    anchors: {
      masa: [1],
      kathaIds: [
        'sheetala-saptami-vrat-katha',
      ],
      ruleIds: [
        'shitala-saptami',
        'shitala-ashtami',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (North India). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'C5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'गणगौर पर ईसर-गौर की पूजा क्यों होती है?',
    questionEn: 'Why are Isar and Gaur worshipped at Gangaur?',
    practiceHi: 'होली के अगले दिन से चैत्र शुक्ल तृतीया तक विवाहित और अविवाहित स्त्रियाँ मिट्टी से बने ईसर और गौर (शिव और पार्वती) की पूजा करती हैं; अन्तिम दिन गौर की विदाई होती है।',
    practiceEn: 'From the day after Holi until Chaitra Shukla Tritiya, married and unmarried women worship clay figures of Isar and Gaur (Shiva and Parvati). On the last day, Gaur is given a farewell.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'राजस्थान',
        regionEn: 'Rajasthan',
        titleHi: 'गौर का पीहर आना',
        titleEn: 'Gaur comes home to her parents',
        bodyHi: [
          'लोक-कथा के अनुसार इन दिनों गौरी अपने पीहर आती हैं, जहाँ सखियाँ और परिवार उनका सत्कार करते हैं। पर्व के अन्त में उन्हें ईसर (शिव) के साथ ससुराल विदा किया जाता है।',
          'अविवाहित स्त्रियाँ मनचाहे वर की और विवाहित स्त्रियाँ सौभाग्य की कामना से यह पूजा करती हैं।',
        ],
        bodyEn: [
          'According to a folk tale, Gauri comes to her parents\' home during these days, where her friends and family welcome her. At the end of the festival, she is sent off to her in-laws\' home with Isar (Shiva).',
          'Unmarried women perform this puja wishing for the husband of their choice, and married women wishing for marital good fortune.',
        ],
        canonHi: 'लोक-परम्परा (राजस्थान)',
        canonEn: 'Folk tradition (Rajasthan)',
      },
    ],
    bhavHi: 'गणगौर बेटी के पीहर आने और ससुराल लौटने की भावना को देवी-पूजा का उत्सव बना देता है।',
    bhavEn: 'Gangaur turns the feeling of a daughter coming home to her parents and going back to her in-laws into a festival of worship of the goddess.',
    anchors: {
      masa: [1],
      kathaIds: [
        'gangaur-vrat-katha',
      ],
      ruleIds: [
        'gangaur',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Rajasthan). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'C6',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'राम नवमी पर जन्मोत्सव दोपहर में क्यों मनाते हैं?',
    questionEn: 'Why do we celebrate Rama\'s birth around midday on Ram Navami?',
    practiceHi: 'चैत्र शुक्ल नवमी को मन्दिरों और घरों में राम का जन्मोत्सव मनाया जाता है; परम्परा जन्म का समय मध्याह्न मानती है, इसलिए मुख्य पूजा दोपहर में होती है।',
    practiceEn: 'On Chaitra Shukla Navami, Rama\'s birth is celebrated in temples and homes. Tradition holds that he was born at midday, so the main puja takes place around midday.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'चैत्र की नवमी, पुनर्वसु नक्षत्र',
        titleEn: 'The Navami of Chaitra, Punarvasu nakshatra',
        bodyHi: [
          'वाल्मीकि रामायण के बालकाण्ड में बताया गया है कि यज्ञ पूरा होने के बाद छह ऋतुएँ बीतीं, और बारहवें महीने में, चैत्र मास की नवमी तिथि को कौसल्या ने राम को जन्म दिया। उसी प्रसंग में जन्म के समय पुनर्वसु नक्षत्र होने का भी उल्लेख है।',
        ],
        bodyEn: [
          'The Bala Kanda of the Valmiki Ramayana says that after the yajna was completed, six seasons passed, and in the twelfth month, on the Navami tithi of the month of Chaitra, Kausalya gave birth to Rama. The same passage also mentions that the Punarvasu nakshatra was in place at the time of his birth.',
        ],
        canonHi: 'वाल्मीकि रामायण 1.18.8',
        canonEn: 'Valmiki Ramayana 1.18.8',
        ref: {
          kind: 'valmiki',
          chapter: 1,
          verseIndex: 611,
        },
      },
    ],
    bhavHi: 'राम नवमी उस क्षण का स्मरण है जब धर्म के आदर्श माने गए राम ने मनुष्य रूप में जन्म लिया।',
    bhavEn: 'Ram Navami recalls the moment when Rama, regarded as the ideal of dharma, was born in human form.',
    anchors: {
      masa: [1],
      kathaIds: [
        'rama-navami-vrat-katha',
      ],
      ruleIds: [
        'ram-navami',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [
        'repo:mobile/src/data/valmiki-ramayan/chapter-01.json',
      ],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Valmiki Ramayana 1.18.8. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'C7',
    axis: 'masa',
    kind: 'manyata',
    phase: 2,
    questionHi: 'हनुमान जयंती साल में दो बार क्यों मनाते हैं?',
    questionEn: 'Why do we celebrate Hanuman Jayanti twice a year?',
    practiceHi: 'हनुमान जयंती चैत्र पूर्णिमा को मनाई जाती है, और कई स्थानों पर कार्तिक कृष्ण चतुर्दशी — दीवाली से पहले की चतुर्दशी — को भी।',
    practiceEn: 'Hanuman Jayanti is celebrated on Chaitra Purnima, and in many places also on Kartik Krishna Chaturdashi, the Chaturdashi just before Diwali.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'चैत्र पूर्णिमा — जन्म का दिन',
        titleEn: 'Chaitra Purnima — the day of his birth',
        bodyHi: [
          'एक व्यापक मान्यता के अनुसार हनुमान का जन्म चैत्र पूर्णिमा को हुआ। इसलिए इस दिन मन्दिरों में जन्मोत्सव, पाठ और भण्डारे होते हैं।',
        ],
        bodyEn: [
          'According to a widely held belief, Hanuman was born on Chaitra Purnima. So on this day, temples hold birth celebrations, recitations and bhandaras.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'कार्तिक चतुर्दशी — सीता का आशीर्वाद',
        titleEn: 'Kartik Chaturdashi — Sita\'s blessing',
        bodyHi: [
          'एक दूसरी मान्यता कार्तिक कृष्ण चतुर्दशी को वह दिन बताती है जब हनुमान की भक्ति से प्रसन्न होकर सीता ने उन्हें आशीर्वाद दिया। कुछ परम्पराएँ इसी तिथि को हनुमान का जन्म-दिवस भी मानती हैं।',
        ],
        bodyEn: [
          'Another belief holds that Kartik Krishna Chaturdashi is the day Sita, pleased with Hanuman\'s devotion, blessed him. Some traditions also regard this tithi as Hanuman\'s birthday.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'दो तिथियाँ यह दिखाती हैं कि एक ही भक्ति अलग-अलग क्षेत्रों में अपनी-अपनी स्मृति के साथ जीवित है — परम्पराएँ भिन्न हैं, और दोनों अपने स्थान पर मान्य हैं।',
    bhavEn: 'The two dates show that one and the same devotion lives on in different regions, each with its own memory. Traditions differ, and both are accepted in their own place.',
    anchors: {
      masa: [1],
      ruleIds: [
        'hanuman-jayanti',
        'hanuman-jayanti-kartik',
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
    id: 'C8',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'बैसाखी, विषु और बोहाग बिहू पर नया साल क्यों मनाते हैं?',
    questionEn: 'Why do we celebrate the new year at Baisakhi, Vishu and Bohag Bihu?',
    practiceHi: 'सूर्य के मेष राशि में प्रवेश के समय पंजाब में बैसाखी, केरल में विषु और असम में बोहाग बिहू नए वर्ष और फ़सल के उत्सव के रूप में मनाए जाते हैं। विषु की भोर में सबसे पहले सजाए गए \'कणि\' के दर्शन किए जाते हैं।',
    practiceEn: 'When the sun enters Mesha (Aries), Baisakhi in Punjab, Vishu in Kerala and Bohag Bihu in Assam are celebrated as festivals of the new year and the harvest. At dawn on Vishu, the first thing people see is the decorated \'kani\'.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'सौर नववर्ष और पकी फ़सल',
        titleEn: 'The solar new year and the ripe harvest',
        bodyHi: [
          'कई क्षेत्रों के सौर पंचांग में मेष संक्रान्ति से नया वर्ष आरम्भ होता है, इसलिए वहाँ यही दिन नववर्ष है। पंजाब में इसी समय गेहूँ की फ़सल पककर तैयार होती है, और किसान उसके लिए आभार का उत्सव मनाते हैं।',
        ],
        bodyEn: [
          'In the solar calendars of many regions, the new year begins with Mesha Sankranti, so there this day is the new year. In Punjab, the wheat crop ripens around this time, and farmers celebrate a festival of thanks for it.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        regionHi: 'केरल',
        regionEn: 'Kerala',
        titleHi: 'विषु कणि — वर्ष का पहला दर्शन',
        titleEn: 'Vishu kani — the first sight of the year',
        bodyHi: [
          'विषु से पहली रात दीपक, अन्न, फल-फूल और कृष्ण की छवि सजाकर \'कणि\' तैयार किया जाता है। भोर में आँखें खोलते ही पहली दृष्टि उसी पर पड़े, ऐसी व्यवस्था रहती है, क्योंकि मान्यता है कि वर्ष का पहला दर्शन पूरे वर्ष का स्वर गढ़ता है।',
        ],
        bodyEn: [
          'On the night before Vishu, the \'kani\' is prepared by arranging a lamp, grain, fruit, flowers and an image of Krishna. It is set up so that the first sight on opening one\'s eyes at dawn falls on it, because it is believed that the first sight of the year sets the tone for the whole year.',
        ],
        canonHi: 'लोक-परम्परा (केरल)',
        canonEn: 'Folk tradition (Kerala)',
      },
      {
        tier: 'itihas',
        regionHi: 'पंजाब',
        regionEn: 'Punjab',
        titleHi: 'खालसा की स्थापना',
        titleEn: 'The founding of the Khalsa',
        bodyHi: [
          '1699 की बैसाखी पर गुरु गोबिन्द सिंह ने आनन्दपुर साहिब में खालसा पंथ की स्थापना की। तब से सिख परम्परा में बैसाखी खालसा के स्थापना-दिवस के रूप में भी मनाई जाती है।',
        ],
        bodyEn: [
          'On Baisakhi in 1699, Guru Gobind Singh founded the Khalsa Panth at Anandpur Sahib. Since then, the Sikh tradition has also celebrated Baisakhi as the founding day of the Khalsa.',
        ],
        canonHi: 'इतिहास · खालसा की स्थापना, 1699',
        canonEn: 'History · Founding of the Khalsa, 1699',
      },
    ],
    bhavHi: 'नए सौर वर्ष का यह दिन पकी फ़सल के प्रति कृतज्ञता, वर्ष के पहले शुभ दर्शन और सामूहिक संकल्प की स्मृति को एक साथ जोड़ देता है।',
    bhavEn: 'This day of the new solar year brings together gratitude for the ripe harvest, the first auspicious sight of the year and the memory of a shared resolve.',
    anchors: {
      masa: [1],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | Folk tradition (Kerala) | History · Founding of the Khalsa, 1699. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'V1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'अक्षय तृतीया पर दान और नए काम का आरम्भ क्यों?',
    questionEn: 'Why do we give in charity and begin new things on Akshaya Tritiya?',
    practiceHi: 'वैशाख शुक्ल तृतीया को जल-भरे घड़े और अन्न का दान किया जाता है, और कई लोग नए काम, गृह-प्रवेश या ख़रीदारी का आरम्भ इसी दिन करते हैं।',
    practiceEn: 'On Vaishakh Shukla Tritiya, people give water-filled pots and grain in charity. Many also choose this day to begin new work, move into a new home or make purchases.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'द्रौपदी का अक्षय पात्र',
        titleEn: 'Draupadi\'s akshaya vessel',
        bodyHi: [
          'वनवास के आरम्भ में युधिष्ठिर ने सूर्य की उपासना की, और सूर्य ने उन्हें एक ऐसा पात्र दिया जिसका अन्न द्रौपदी के भोजन कर लेने तक कभी समाप्त नहीं होता था। लोक में \'अक्षय\' — कभी न घटने वाले — इस पात्र की कथा को इसी तिथि से जोड़ा जाता है।',
        ],
        bodyEn: [
          'At the start of the exile in the forest, Yudhishthira worshipped the sun, and the sun gave him a vessel whose food never ran out until Draupadi had eaten. Folk tradition links the story of this \'akshaya\' vessel — one that never diminishes — to this tithi.',
        ],
        canonHi: 'लोक-परम्परा · कथा का मूल: महाभारत, वन पर्व',
        canonEn: 'Folk tradition · Source of the story: Mahabharata, Vana Parva',
      },
      {
        tier: 'lok',
        titleHi: 'और भी \'अक्षय\' स्मृतियाँ',
        titleEn: 'More \'akshaya\' memories',
        bodyHi: [
          'लोक-परम्परा इसी तिथि को परशुराम के जन्म और त्रेता युग के आरम्भ से भी जोड़ती है। एक कथा के अनुसार सुदामा चावल की छोटी-सी पोटली लेकर कृष्ण से मिलने गए, और लौटे तो उनका घर समृद्ध हो चुका था।',
        ],
        bodyEn: [
          'Folk tradition also links this tithi to the birth of Parashurama and the beginning of the Treta Yuga. According to one story, Sudama went to meet Krishna carrying a small bundle of rice, and by the time he returned, his home had become prosperous.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: '\'अक्षय\' का अर्थ है जो कभी न घटे — यह तिथि इस भाव को रखती है कि बाँटा हुआ और सद्भाव से आरम्भ किया हुआ कभी व्यर्थ नहीं जाता।',
    bhavEn: '\'Akshaya\' means that which does not diminish. This tithi holds the thought that what is shared, and what is begun in goodwill, never goes to waste.',
    bodhHi: 'सोना ख़रीदने का चलन इस पर्व की बाद की व्याख्या है; इससे जुड़ी पुरानी कथाओं के केन्द्र में दान और \'न घटने\' का भाव है।',
    bodhEn: 'The custom of buying gold is a later interpretation of this festival. The older stories connected with it centre on giving and on the idea of \'not diminishing\'.',
    anchors: {
      masa: [2],
      kathaIds: [
        'akshaya-tritiya-vrat-katha',
      ],
      ruleIds: [
        'akshaya-tritiya',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition · Source of the story: Mahabharata, Vana Parva | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'V2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'वैशाख में भोर का स्नान और प्याऊ क्यों?',
    questionEn: 'Why do we bathe at dawn and set up water stalls in Vaishakh?',
    practiceHi: 'वैशाख मास में कई लोग सूर्योदय से पहले स्नान करते हैं, और राहों पर प्याऊ लगाकर या जल-भरे घड़े रखकर राहगीरों को पानी पिलाया जाता है।',
    practiceEn: 'In the month of Vaishakh, many people bathe before sunrise. Passers-by are given water from water stalls (pyau) set up along the roads, or from water-filled pots placed there.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'माधव का मास',
        titleEn: 'The month of Madhava',
        bodyHi: [
          'वैशाख माहात्म्य वैशाख को माधव (विष्णु) का प्रिय मास बताता है और इस मास में भोर के स्नान की बड़ी महिमा कहता है। तपती गर्मी के इस मास में प्यासे को जल पिलाना, प्याऊ लगाना और जल-पात्र का दान विशेष पुण्य का कार्य माना गया है।',
        ],
        bodyEn: [
          'The Vaishakh Mahatmya calls Vaishakh the month dear to Madhava (Vishnu) and speaks highly of bathing at dawn in this month. In this month of scorching heat, giving water to the thirsty, setting up water stalls and giving water vessels in charity are regarded as especially meritorious acts.',
        ],
        canonHi: 'पद्म पुराण, वैशाख माहात्म्य (अध्याय समीक्षाधीन)',
        canonEn: 'Padma Purana, Vaishakh Mahatmya (adhyaya under review)',
      },
    ],
    bhavHi: 'वैशाख का स्नान अपने भीतर शीतलता लाने का, और प्याऊ उसी शीतलता को प्यासे राहगीर तक पहुँचाने का भाव रखता है।',
    bhavEn: 'The Vaishakh bath carries the idea of bringing coolness within oneself, and the water stall the idea of carrying that same coolness to the thirsty traveller.',
    anchors: {
      masa: [2],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Padma Purana, Vaishakh Mahatmya (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'V3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'नृसिंह जयंती पर पूजा सन्ध्या के समय क्यों होती है?',
    questionEn: 'Why is the Narasimha Jayanti puja held at dusk?',
    practiceHi: 'वैशाख शुक्ल चतुर्दशी को कई लोग दिन भर व्रत रखते हैं और सन्ध्या के समय भगवान नृसिंह की पूजा करते हैं।',
    practiceEn: 'On Vaishakh Shukla Chaturdashi, many people fast through the day and worship Lord Narasimha at dusk.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'न दिन, न रात',
        titleEn: 'Neither day nor night',
        bodyHi: [
          'हिरण्यकशिपु को वर मिला था कि उसकी मृत्यु न दिन में हो, न रात में; न घर के भीतर, न बाहर; न मनुष्य से, न पशु से। अपने भक्त प्रह्लाद की रक्षा के लिए विष्णु खम्भे से नृसिंह — आधे मनुष्य, आधे सिंह — के रूप में प्रकट हुए।',
          'उन्होंने सन्ध्या के समय, सभा-भवन की देहरी पर, हिरण्यकशिपु को अपनी जाँघों पर रखकर उसका अन्त किया — इस तरह वर की हर शर्त बनी रही।',
        ],
        bodyEn: [
          'Hiranyakashipu had been granted a boon that his death would come neither by day nor by night; neither inside a house nor outside; neither from a human nor from an animal. To protect his devotee Prahlada, Vishnu emerged from a pillar as Narasimha — half man, half lion.',
          'He ended Hiranyakashipu at dusk, on the threshold of the assembly hall, holding him on his thighs. In this way, every condition of the boon held true.',
        ],
        canonHi: 'श्रीमद्भागवत पुराण 7.8',
        canonEn: 'Shrimad Bhagavata Purana 7.8',
      },
    ],
    bhavHi: 'नृसिंह की कथा यह भाव रखती है कि भक्त की रक्षा के लिए ईश्वर दो सीमाओं के बीच का मार्ग भी खोज लेते हैं, और सन्ध्या की पूजा उसी सन्धि-क्षण की स्मृति है।',
    bhavEn: 'The story of Narasimha holds the thought that, to protect a devotee, God finds a path even in the space between two limits. The dusk puja recalls that very moment of transition.',
    anchors: {
      masa: [2],
      kathaIds: [
        'narasimha-jayanti-vrat-katha',
      ],
      ruleIds: [
        'narasimha-jayanti',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Shrimad Bhagavata Purana 7.8. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'V4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'वट सावित्री पर बरगद पर कच्चा सूत क्यों लपेटते हैं?',
    questionEn: 'Why do we wind raw thread around the banyan on Vat Savitri?',
    practiceHi: 'वट सावित्री व्रत में विवाहित स्त्रियाँ बरगद की पूजा करती हैं और उसकी परिक्रमा करते हुए तने पर कच्चा सूत लपेटती हैं — फेरों की संख्या प्रायः 108 बताई जाती है, पर रीतियाँ भिन्न हैं। व्रत की तिथि क्षेत्र के अनुसार अमावस्या या पूर्णिमा होती है।',
    practiceEn: 'During the Vat Savitri vrat, married women worship the banyan tree and wind raw cotton thread around its trunk as they walk around it. The number of rounds is often said to be 108, but customs vary. The vrat falls on Amavasya or Purnima, depending on the region.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'सावित्री और सत्यवान',
        titleEn: 'Savitri and Satyavan',
        bodyHi: [
          'राजकुमारी सावित्री ने यह जानते हुए भी सत्यवान से विवाह किया कि उसकी आयु केवल एक वर्ष शेष है। नियत दिन वह उसके साथ वन गई; जब यम सत्यवान के प्राण लेकर चले, तो सावित्री उनके पीछे-पीछे चलती रही।',
          'उसकी निष्ठा और विवेक भरी बातों से प्रसन्न होकर यम ने उसे वर दिए, और अन्त में सत्यवान के प्राण लौटा दिए।',
        ],
        bodyEn: [
          'Princess Savitri married Satyavan even though she knew he had only one year left to live. On the appointed day she went with him into the forest. When Yama set off with Satyavan\'s life, Savitri kept following behind him.',
          'Pleased by her devotion and her wise words, Yama granted her boons, and in the end he gave Satyavan\'s life back.',
        ],
        canonHi: 'महाभारत, वन पर्व',
        canonEn: 'Mahabharata, Vana Parva',
      },
      {
        tier: 'lok',
        titleHi: 'वट के नीचे',
        titleEn: 'Beneath the banyan',
        bodyHi: [
          'लोक में कहा जाता है कि वन में सत्यवान ने बरगद के नीचे ही सावित्री की गोद में सिर रखकर प्राण छोड़े थे, और वहीं वे फिर जीवित हुए। इसलिए इस व्रत में वट-वृक्ष की पूजा होती है।',
        ],
        bodyEn: [
          'It is said in folk tradition that in the forest, Satyavan breathed his last beneath a banyan tree with his head in Savitri\'s lap, and that it was there he came back to life. That is why the banyan is worshipped in this vrat.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'लम्बी आयु वाला वट और उस पर लिपटा सूत सावित्री जैसे अडिग संकल्प और जीवन भर के साथ की कामना का प्रतीक है।',
    bhavEn: 'The long-lived banyan and the thread wound around it are a symbol of a resolve as steadfast as Savitri\'s, and of the wish for a lifetime together.',
    anchors: {
      masa: [2],
      kathaIds: [
        'vat-savitri-vrat-katha',
      ],
      ruleIds: [
        'vat-savitri-vrat',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Mahabharata, Vana Parva | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'V5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'गंगा सप्तमी क्यों मनाते हैं, और गंगा \'जाह्नवी\' क्यों कहलाती हैं?',
    questionEn: 'Why do we celebrate Ganga Saptami, and why is the Ganga called \'Jahnavi\'?',
    practiceHi: 'वैशाख शुक्ल सप्तमी को गंगा-पूजन और गंगा-स्नान होता है; लोक में इसे जह्नु ऋषि से मुक्त होकर गंगा के फिर से बहने का दिन माना जाता है।',
    practiceEn: 'On Vaishakh Shukla Saptami, the Ganga is worshipped and people bathe in the river. Folk tradition regards it as the day the Ganga, released by the sage Jahnu, began to flow again.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'जह्नु ऋषि और जाह्नवी',
        titleEn: 'The sage Jahnu and Jahnavi',
        bodyHi: [
          'भगीरथ के पीछे बहती गंगा ने राह में जह्नु ऋषि की यज्ञ-भूमि को डुबो दिया, तो ऋषि ने क्रोध में उसका सारा जल पी लिया। देवताओं और ऋषियों की विनती पर जह्नु ने गंगा को अपने कानों से फिर बहा दिया, और तब से गंगा उनकी पुत्री \'जाह्नवी\' कहलाईं।',
        ],
        bodyEn: [
          'As the Ganga flowed behind Bhagiratha, she flooded the sacrificial ground of the sage Jahnu on the way, and in anger the sage drank up all her water. At the plea of the gods and sages, Jahnu let the Ganga flow again from his ears, and from then on she was called \'Jahnavi\', his daughter.',
        ],
        canonHi: 'वाल्मीकि रामायण, बाल काण्ड (समीक्षाधीन)',
        canonEn: 'Valmiki Ramayana, Bala Kanda (under review)',
      },
      {
        tier: 'shastra',
        titleHi: 'गीता में जाह्नवी',
        titleEn: 'Jahnavi in the Gita',
        bodyHi: [
          'भगवद्गीता के दसवें अध्याय में कृष्ण अपनी विभूतियाँ गिनाते हुए कहते हैं कि बहती धाराओं में वे जाह्नवी हैं। गंगा का यह नाम जह्नु ऋषि की उसी कथा की याद दिलाता है।',
        ],
        bodyEn: [
          'In the tenth chapter of the Bhagavad Gita, as Krishna lists his divine glories, he says that among flowing streams he is the Jahnavi. This name of the Ganga recalls that same story of the sage Jahnu.',
        ],
        canonHi: 'भगवद्गीता 10.31',
        canonEn: 'Bhagavad Gita 10.31',
        ref: {
          kind: 'gita',
          chapter: 10,
          verseIndex: 30,
        },
      },
    ],
    bhavHi: 'गंगा सप्तमी उस नदी के प्रति कृतज्ञता है जो रुककर भी फिर बही, और जिसे गीता ने धाराओं में ईश्वर की विभूति कहा।',
    bhavEn: 'Ganga Saptami is gratitude to the river that flowed again even after being stopped, and that the Gita called a divine glory among streams.',
    anchors: {
      masa: [2],
      kathaIds: [
        'ganga-saptami-vrat-katha',
      ],
      ruleIds: [
        'ganga-saptami',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [
        'repo:mobile/src/data/gita/chapter-10.json',
      ],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Valmiki Ramayana, Bala Kanda (under review) | Bhagavad Gita 10.31. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'J1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'गंगा दशहरा पर दस-दस वस्तुएँ क्यों चढ़ाते हैं?',
    questionEn: 'Why do we offer ten of each item on Ganga Dussehra?',
    practiceHi: 'ज्येष्ठ शुक्ल दशमी को गंगा-स्नान और गंगा-पूजन होता है; कई जगह पूजा और दान की हर वस्तु दस की संख्या में रखी जाती है।',
    practiceEn: 'On Jyeshtha Shukla Dashami, people bathe in the Ganga and worship her. In many places, every item for the puja and for charity is kept in tens.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'भगीरथ और गंगा का अवतरण',
        titleEn: 'Bhagiratha and the descent of the Ganga',
        bodyHi: [
          'राजा सगर के साठ हज़ार पुत्र कपिल मुनि के क्रोध से भस्म हो गए थे, और उनके उद्धार का उपाय स्वर्ग की गंगा का धरती पर आना ही था। पीढ़ियों बाद भगीरथ के तप से गंगा उतरीं; शिव ने उनका प्रचण्ड वेग अपनी जटाओं में थामा, और भगीरथ उन्हें पुरखों की भस्म तक ले गए।',
        ],
        bodyEn: [
          'King Sagara\'s sixty thousand sons had been burned to ashes by the anger of the sage Kapila, and the only way to free them was for the heavenly Ganga to come down to earth. Generations later, through Bhagiratha\'s penance, the Ganga descended. Shiva held her fierce force in his matted hair, and Bhagiratha led her to the ashes of his ancestors.',
        ],
        canonHi: 'वाल्मीकि रामायण, बाल काण्ड 38–44',
        canonEn: 'Valmiki Ramayana, Bala Kanda 38–44',
      },
      {
        tier: 'lok',
        titleHi: 'दस पापों का हरण',
        titleEn: 'Removing ten sins',
        bodyHi: [
          '\'दशहरा\' का अर्थ दस (पापों) को हरने वाला बताया जाता है। परम्परा में ये दस पाप शरीर के तीन, वाणी के चार और मन के तीन माने जाते हैं, और पूजा में दस-दस वस्तुएँ रखने की रीति भी इसी \'दस\' से जुड़ी मानी जाती है।',
        ],
        bodyEn: [
          '\'Dussehra\' is said to mean \'that which removes ten (sins)\'. Tradition counts these ten sins as three of the body, four of speech and three of the mind, and the custom of keeping ten of each item in the puja is also thought to be linked to this \'ten\'.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'गंगा का उतरना पुरखों के उद्धार की कथा है, और दशहरा उसे शरीर, वाणी और मन — तीनों की शुद्धि के भाव से जोड़ता है।',
    bhavEn: 'The descent of the Ganga is a story of freeing the ancestors, and Dussehra links it with the idea of purifying all three — body, speech and mind.',
    anchors: {
      masa: [3],
      kathaIds: [
        'ganga-dussehra-katha',
      ],
      ruleIds: [
        'ganga-dussehra',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Valmiki Ramayana, Bala Kanda 38–44 | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'J2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'निर्जला एकादशी पर पानी भी क्यों नहीं पीते?',
    questionEn: 'Why don\'t we drink even water on Nirjala Ekadashi?',
    practiceHi: 'ज्येष्ठ शुक्ल एकादशी को कई लोग जल भी ग्रहण किए बिना उपवास करते हैं, और जल-भरे घड़े का दान किया जाता है।',
    practiceEn: 'On Jyeshtha Shukla Ekadashi, many people fast without taking even water, and water-filled pots are given in charity.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'भीम की एक एकादशी',
        titleEn: 'Bhima\'s one Ekadashi',
        bodyHi: [
          'भीम भूख सह नहीं पाते थे, इसलिए वर्ष की चौबीसों एकादशियों का व्रत उनसे नहीं हो पाता था। उन्होंने व्यास से उपाय पूछा, तो व्यास ने बताया कि ज्येष्ठ शुक्ल एकादशी को बिना जल का एक व्रत सब एकादशियों के बराबर फल देता है। इसी से इसे भीमसेनी एकादशी भी कहते हैं।',
        ],
        bodyEn: [
          'Bhima could not bear hunger, so he was unable to keep the fast on all twenty-four Ekadashis of the year. He asked Vyasa for a way, and Vyasa told him that a single fast without water on Jyeshtha Shukla Ekadashi brings the same merit as all the Ekadashis. This is why it is also called Bhimseni Ekadashi.',
        ],
        canonHi: 'पद्म पुराण / ब्रह्मवैवर्त पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Padma Purana / Brahmavaivarta Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'भीम की कथा यह भाव रखती है कि व्रत का मूल अपने सामर्थ्य के अनुसार सच्चा संकल्प है, और भीषण गर्मी में जल-दान उसी संयम का दूसरा पहलू है।',
    bhavEn: 'Bhima\'s story holds the thought that the root of a vrat is a sincere resolve made within one\'s own capacity, and that giving water in the fierce heat is the other side of that same restraint.',
    anchors: {
      masa: [3],
      kathaIds: [
        'nirjala-ekadashi-katha',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Padma Purana / Brahmavaivarta Purana (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'J3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'लखनऊ में ज्येष्ठ के मंगलवार \'बड़ा मंगल\' क्यों कहलाते हैं?',
    questionEn: 'Why are the Tuesdays of Jyeshtha called \'Bada Mangal\' in Lucknow?',
    practiceHi: 'लखनऊ और आसपास ज्येष्ठ मास के हर मंगलवार को बड़ा मंगल मनाया जाता है — हनुमान मन्दिरों में पूजा होती है और शहर भर में भण्डारे लगते हैं।',
    practiceEn: 'In and around Lucknow, every Tuesday of the month of Jyeshtha is celebrated as Bada Mangal. Hanuman temples hold puja, and bhandaras are set up across the city.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'लखनऊ',
        regionEn: 'Lucknow',
        titleHi: 'राम और हनुमान की पहली भेंट',
        titleEn: 'The first meeting of Rama and Hanuman',
        bodyHi: [
          'लोक में कहा जाता है कि राम और हनुमान की पहली भेंट ज्येष्ठ मास के एक मंगलवार को हुई थी। इसलिए इस मास के मंगलवार हनुमान की विशेष पूजा के दिन माने जाते हैं।',
        ],
        bodyEn: [
          'It is said in folk tradition that Rama and Hanuman first met on a Tuesday in the month of Jyeshtha. That is why the Tuesdays of this month are regarded as days for special worship of Hanuman.',
        ],
        canonHi: 'लोक-परम्परा (लखनऊ)',
        canonEn: 'Folk tradition (Lucknow)',
      },
      {
        tier: 'itihas',
        regionHi: 'लखनऊ',
        regionEn: 'Lucknow',
        titleHi: 'अलीगंज की मन्नत',
        titleEn: 'The vow at Aliganj',
        bodyHi: [
          'स्थानीय इतिहास के अनुसार नवाबी दौर की एक बेगम ने मन्नत पूरी होने पर अलीगंज में हनुमान मन्दिर बनवाया। ज्येष्ठ के मंगलवारों पर वहाँ लगने वाले मेले और भण्डारे की परम्परा उसी समय से जोड़ी जाती है।',
        ],
        bodyEn: [
          'According to local history, a begum of the Nawabi era built a Hanuman temple at Aliganj after her wish was fulfilled. The tradition of the fair and bhandaras held there on the Tuesdays of Jyeshtha is traced back to that time.',
        ],
        canonHi: 'इतिहास · अलीगंज हनुमान मन्दिर, नवाबी काल',
        canonEn: 'History · Aliganj Hanuman Temple, Nawabi period',
      },
    ],
    bhavHi: 'बड़ा मंगल भक्ति को सेवा में बदल देता है — तपती गर्मी में राह चलते हर व्यक्ति को भोजन और जल मिलता है।',
    bhavEn: 'Bada Mangal turns devotion into service. In the scorching heat, everyone passing by is given food and water.',
    anchors: {
      masa: [3],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Lucknow) | History · Aliganj Hanuman Temple, Nawabi period. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'J4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'स्नान पूर्णिमा के बाद जगन्नाथ के दर्शन पन्द्रह दिन क्यों बन्द रहते हैं?',
    questionEn: 'Why is Jagannath\'s darshan closed for fifteen days after Snana Purnima?',
    practiceHi: 'ज्येष्ठ पूर्णिमा को पुरी में जगन्नाथ, बलभद्र और सुभद्रा का सबके सामने स्नान होता है; इसके बाद लगभग पन्द्रह दिन देवताओं के सामान्य दर्शन नहीं होते।',
    practiceEn: 'On Jyeshtha Purnima in Puri, Jagannath, Balabhadra and Subhadra are bathed in full public view. After this, for about fifteen days, the usual darshan of the deities does not take place.',
    kathas: [
      {
        tier: 'purana',
        regionHi: 'पुरी, ओडिशा',
        regionEn: 'Puri, Odisha',
        titleHi: 'देव-स्नान का उत्सव',
        titleEn: 'The festival of the deities\' bath',
        bodyHi: [
          'पुराण-परम्परा में पुरी के वार्षिक उत्सवों में ज्येष्ठ पूर्णिमा के स्नान-उत्सव का वर्णन है। इस दिन देवताओं को गर्भगृह से बाहर स्नान-मण्डप पर लाकर स्नान कराया जाता है, जहाँ भक्त उनके दर्शन करते हैं।',
        ],
        bodyEn: [
          'Puranic tradition describes the Jyeshtha Purnima bathing festival among the yearly festivals of Puri. On this day the deities are brought out of the sanctum to the bathing platform and bathed there, and devotees have their darshan.',
        ],
        canonHi: 'स्कन्द पुराण, उत्कल खण्ड (अध्याय समीक्षाधीन)',
        canonEn: 'Skanda Purana, Utkala Khanda (adhyaya under review)',
      },
      {
        tier: 'lok',
        regionHi: 'पुरी, ओडिशा',
        regionEn: 'Puri, Odisha',
        titleHi: 'अनसर — देवता का विश्राम',
        titleEn: 'Anasara — the deity\'s rest',
        bodyHi: [
          'मन्दिर-परम्परा में 108 घड़ों के जल से स्नान के बाद देवता अस्वस्थ माने जाते हैं। लगभग पन्द्रह दिन वे अनसर-गृह में अलग रखे जाते हैं, जहाँ सेवक उन्हें जड़ी-बूटियों का उपचार देते हैं। स्वस्थ होकर वे नव-यौवन रूप में दर्शन देते हैं, और फिर रथ यात्रा होती है।',
        ],
        bodyEn: [
          'In temple tradition, after being bathed with water from 108 pots, the deities are regarded as unwell. For about fifteen days they are kept apart in the anasara chamber, where the servitors treat them with herbal remedies. Once recovered, they give darshan in a youthful, renewed form, and then the Rath Yatra takes place.',
        ],
        canonHi: 'लोक-परम्परा (पुरी)',
        canonEn: 'Folk tradition (Puri)',
      },
    ],
    bhavHi: 'देवता को अस्वस्थ होते और सँभलते देखना ईश्वर को परिवार के सदस्य की तरह मानने का भाव है, जिसकी सेवा उसी अपनेपन से होती है।',
    bhavEn: 'Watching the deity fall ill and recover reflects the feeling of treating God as a member of the family, served with that same sense of closeness.',
    anchors: {
      masa: [3],
      theerthIds: [
        'jagannath-puri',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Skanda Purana, Utkala Khanda (adhyaya under review) | Folk tradition (Puri). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'J5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'रज पर्व और अम्बुबाची के दिनों में खेत क्यों नहीं जोते जाते?',
    questionEn: 'Why are fields not ploughed during Raja Parba and Ambubachi?',
    practiceHi: 'ओडिशा के रज पर्व और असम में कामाख्या के अम्बुबाची के दिनों में खेत जोतने जैसे धरती से जुड़े काम रोक दिए जाते हैं।',
    practiceEn: 'During Raja Parba in Odisha and Ambubachi at Kamakhya in Assam, work tied to the earth, such as ploughing fields, is put on hold.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'ओडिशा',
        regionEn: 'Odisha',
        titleHi: 'रज पर्व — धरती का विश्राम',
        titleEn: 'Raja Parba — the earth\'s rest',
        bodyHi: [
          'ओडिशा में मिथुन संक्रान्ति के आसपास तीन दिन रज पर्व मनाया जाता है। मान्यता है कि इन दिनों धरती माता रजस्वला होती हैं और विश्राम करती हैं, इसलिए खेती का काम रोक दिया जाता है। ये दिन झूलों, नए वस्त्रों और पकवानों के साथ उत्सव की तरह मनाए जाते हैं।',
        ],
        bodyEn: [
          'In Odisha, Raja Parba is celebrated for three days around Mithuna Sankranti. It is believed that during these days Mother Earth menstruates and rests, so farm work is paused. These days are celebrated like a festival, with swings, new clothes and special dishes.',
        ],
        canonHi: 'लोक-परम्परा (ओडिशा)',
        canonEn: 'Folk tradition (Odisha)',
      },
      {
        tier: 'lok',
        regionHi: 'असम',
        regionEn: 'Assam',
        titleHi: 'अम्बुबाची — कामाख्या',
        titleEn: 'Ambubachi — Kamakhya',
        bodyHi: [
          'कामाख्या में मान्यता है कि वर्ष में एक बार इन दिनों देवी रजस्वला होती हैं। इस अवधि में मन्दिर के कपाट तीन दिन बन्द रहते हैं और चौथे दिन खुलते हैं; असम के कई हिस्सों में इन दिनों खेती का काम भी रोका जाता है।',
        ],
        bodyEn: [
          'At Kamakhya it is believed that once a year, during these days, the goddess menstruates. During this period the temple doors stay closed for three days and open on the fourth. In many parts of Assam, farm work is also paused during these days.',
        ],
        canonHi: 'लोक-परम्परा (असम)',
        canonEn: 'Folk tradition (Assam)',
      },
    ],
    bhavHi: 'इन परम्पराओं में धरती और देवी को सृजन करने वाली माँ के रूप में देखा जाता है, जिसके विश्राम का भी सम्मान होता है।',
    bhavEn: 'In these traditions, the earth and the goddess are seen as a mother who creates, and her rest is also honoured.',
    anchors: {
      masa: [3],
      theerthIds: [
        'kamakhya',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Odisha) | Folk tradition (Assam). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'A1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'रथ यात्रा क्यों निकलती है, और राजा रथ पर झाड़ू क्यों लगाते हैं?',
    questionEn: 'Why is the Rath Yatra taken out, and why does the king sweep the chariots?',
    practiceHi: 'आषाढ़ शुक्ल द्वितीया को पुरी में जगन्नाथ, बलभद्र और सुभद्रा तीन रथों पर गुण्डिचा मन्दिर तक ले जाए जाते हैं; रथ चलने से पहले गजपति राजा रथों पर झाड़ू लगाते हैं।',
    practiceEn: 'On Ashadh Shukla Dwitiya in Puri, Jagannath, Balabhadra and Subhadra are taken on three chariots to the Gundicha temple. Before the chariots move, the Gajapati king sweeps them.',
    kathas: [
      {
        tier: 'purana',
        regionHi: 'पुरी, ओडिशा',
        regionEn: 'Puri, Odisha',
        titleHi: 'गुण्डिचा के घर',
        titleEn: 'To Gundicha\'s house',
        bodyHi: [
          'रथ यात्रा में तीनों भाई-बहन मुख्य मन्दिर से गुण्डिचा मन्दिर जाते हैं, जिसे लोक में उनकी मौसी का घर कहा जाता है। कुछ दिन वहाँ रहकर वे बाहुड़ा यात्रा में अपने मन्दिर लौटते हैं।',
        ],
        bodyEn: [
          'In the Rath Yatra, the three siblings travel from the main temple to the Gundicha temple, which folk tradition calls their maternal aunt\'s home. After staying there for a few days, they return to their own temple in the Bahuda Yatra.',
        ],
        canonHi: 'स्कन्द पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Skanda Purana (adhyaya under review)',
      },
      {
        tier: 'itihas',
        regionHi: 'पुरी, ओडिशा',
        regionEn: 'Puri, Odisha',
        titleHi: 'छेरा पहँरा — राजा का झाड़ू',
        titleEn: 'Chhera Pahanra — the king\'s broom',
        bodyHi: [
          'पुरी के गजपति राजा स्वयं को जगन्नाथ का पहला सेवक मानते हैं। रथ चलने से पहले वे सोने की मूठ वाली झाड़ू से तीनों रथों को बुहारते हैं और चन्दन-जल छिड़कते हैं — इसे छेरा पहँरा कहते हैं।',
        ],
        bodyEn: [
          'The Gajapati king of Puri regards himself as the first servant of Jagannath. Before the chariots move, he sweeps all three chariots with a gold-handled broom and sprinkles sandalwood water. This is called Chhera Pahanra.',
        ],
        canonHi: 'इतिहास · गजपति राजाओं की मन्दिर-सेवा (छेरा पहँरा)',
        canonEn: 'History · Temple service of the Gajapati kings (Chhera Pahanra)',
      },
    ],
    bhavHi: 'राजा का झाड़ू लगाना यह भाव रखता है कि ईश्वर के सामने हर पद सेवा ही है, और रथ यात्रा में देवता स्वयं लोगों के बीच आते हैं।',
    bhavEn: 'The king sweeping the chariots holds the thought that before God every rank is simply service, and in the Rath Yatra the deities themselves come out among the people.',
    anchors: {
      masa: [4],
      theerthIds: [
        'jagannath-puri',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Skanda Purana (adhyaya under review) | History · Temple service of the Gajapati kings (Chhera Pahanra). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'A2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'चातुर्मास में विवाह क्यों नहीं होते, और साधु एक ही स्थान पर क्यों रुकते हैं?',
    questionEn: 'Why are weddings not held during Chaturmas, and why do sadhus stay in one place?',
    practiceHi: 'देवशयनी एकादशी (आषाढ़ शुक्ल एकादशी) से देव उठनी एकादशी तक के लगभग चार महीनों में विवाह जैसे संस्कार प्रायः नहीं होते, और कई साधु-सन्त एक ही स्थान पर ठहरकर साधना करते हैं।',
    practiceEn: 'For about four months, from Devshayani Ekadashi (Ashadh Shukla Ekadashi) to Dev Uthani Ekadashi, rites such as weddings are usually not held, and many sadhus and saints stay in one place for their spiritual practice.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'विष्णु की योगनिद्रा और बलि को दिया वचन',
        titleEn: 'Vishnu\'s yoga-nidra and his promise to Bali',
        bodyHi: [
          'मान्यता है कि देवशयनी एकादशी से विष्णु चार महीने योगनिद्रा में रहते हैं, इसलिए इन दिनों विवाह जैसे शुभ आरम्भ टाले जाते हैं। एक कथा के अनुसार वामन रूप में बलि से तीनों लोक लेने के बाद विष्णु उसकी भक्ति से प्रसन्न हुए और उसके साथ रहने का वचन दिया; ये चार महीने उसी वचन से जोड़े जाते हैं।',
        ],
        bodyEn: [
          'It is believed that from Devshayani Ekadashi, Vishnu remains in yoga-nidra for four months, so auspicious beginnings such as weddings are put off during these days. According to one story, after taking the three worlds from Bali in his Vamana form, Vishnu was pleased by Bali\'s devotion and promised to stay with him. These four months are linked to that promise.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'वर्षावास',
        titleEn: 'Varshavas',
        bodyHi: [
          'वर्षा के महीनों में रास्ते कठिन हो जाते हैं और धरती पर अनगिनत छोटे जीव पनपते हैं। इसलिए घूमने वाले साधु-संन्यासी इन दिनों एक ही स्थान पर ठहरते हैं — यह रीति हिन्दू संन्यासियों के साथ जैन और बौद्ध परम्पराओं में भी मिलती है।',
        ],
        bodyEn: [
          'In the months of rain, roads become difficult and countless small creatures thrive on the ground. So wandering sadhus and renunciates stay in one place during these days. This custom is found among Hindu renunciates and also in the Jain and Buddhist traditions.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'चातुर्मास ठहरने और भीतर मुड़ने का समय है, जब देवता विश्राम करते हैं, यात्री रुकते हैं और साधना को जगह मिलती है।',
    bhavEn: 'Chaturmas is a time to stay put and turn inward, when the gods rest, travellers pause and spiritual practice finds room.',
    anchors: {
      masa: [4],
      kathaIds: [
        'devshayani-ekadashi-katha',
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
    id: 'A3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'चातुर्मास में साग, दही और दूध क्यों छोड़ते हैं?',
    questionEn: 'Why do we give up greens, curd and milk during Chaturmas?',
    practiceHi: 'चातुर्मास में कई परिवार हर महीने एक भोज्य वस्तु छोड़ते हैं — श्रावण में साग, भाद्रपद में दही, आश्विन में दूध और कार्तिक में कुछ दालें; क्षेत्र और परिवार के अनुसार परम्पराएँ भिन्न हैं।',
    practiceEn: 'During Chaturmas, many families give up one food each month: greens in Shravan, curd in Bhadrapad, milk in Ashwin and some lentils in Kartik. Traditions differ by region and family.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'हर मास एक त्याग',
        titleEn: 'One thing given up each month',
        bodyHi: [
          'पुराण-परम्परा में चातुर्मास के चार महीनों के लिए एक-एक भोज्य वस्तु छोड़ने का क्रम बताया जाता है — श्रावण में हरी पत्तेदार सब्ज़ियाँ, भाद्रपद में दही, आश्विन में दूध और कार्तिक में कुछ दालें। यह त्याग विष्णु की योगनिद्रा के इन महीनों में संयम के व्रत का अंग माना जाता है।',
        ],
        bodyEn: [
          'Puranic tradition describes an order for giving up one food in each of the four months of Chaturmas: green leafy vegetables in Shravan, curd in Bhadrapad, milk in Ashwin and some lentils in Kartik. This giving up is regarded as part of a vow of restraint during these months of Vishnu\'s yoga-nidra.',
        ],
        canonHi: 'स्कन्द पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Skanda Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'हर महीने एक वस्तु छोड़ना संयम को छोटे और निभाने योग्य कदमों में बाँट देता है।',
    bhavEn: 'Giving up one thing each month breaks restraint into small steps that are possible to keep.',
    anchors: {
      masa: [4],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Skanda Purana (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'A4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'गुरु पूर्णिमा आषाढ़ की पूर्णिमा को ही क्यों मनाते हैं?',
    questionEn: 'Why is Guru Purnima celebrated on the Purnima of Ashadh?',
    practiceHi: 'आषाढ़ पूर्णिमा को शिष्य अपने गुरु, शिक्षक या आध्यात्मिक मार्गदर्शक का पूजन और सम्मान करते हैं; कई स्थानों पर इस दिन व्यास-पूजा होती है।',
    practiceEn: 'On Ashadh Purnima, disciples worship and honour their guru, teacher or spiritual guide. In many places, Vyasa Puja is held on this day.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'व्यास पूर्णिमा',
        titleEn: 'Vyasa Purnima',
        bodyHi: [
          'आषाढ़ पूर्णिमा को महर्षि वेदव्यास का जन्म-दिवस माना जाता है, जिन्हें वेदों के विभाजन और महाभारत की रचना का श्रेय दिया जाता है। इसीलिए इसे व्यास पूर्णिमा भी कहते हैं, और इस दिन शिष्य गुरु-परम्परा के प्रति कृतज्ञता प्रकट करते हैं।',
        ],
        bodyEn: [
          'Ashadh Purnima is regarded as the birthday of the sage Veda Vyasa, who is credited with dividing the Vedas and composing the Mahabharata. That is why it is also called Vyasa Purnima, and on this day disciples express their gratitude to the line of gurus.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'गुरु पूर्णिमा ज्ञान की उस परम्परा के प्रति कृतज्ञता है जो व्यास से लेकर हर सिखाने वाले तक चली आती है।',
    bhavEn: 'Guru Purnima is gratitude for the tradition of knowledge that runs from Vyasa to everyone who teaches.',
    anchors: {
      masa: [4],
      kathaIds: [
        'guru-purnima-katha',
      ],
      ruleIds: [
        'guru-purnima',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'A5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'आषाढ़ी एकादशी पर वारकरी पैदल पंढरपुर क्यों जाते हैं?',
    questionEn: 'Why do the Warkaris walk to Pandharpur for Ashadhi Ekadashi?',
    practiceHi: 'आषाढ़ी एकादशी से पहले वारकरी महाराष्ट्र के अनेक स्थानों से कई दिन पैदल चलकर पंढरपुर पहुँचते हैं; साथ में सन्तों की पालकियाँ और भजन चलते हैं।',
    practiceEn: 'Before Ashadhi Ekadashi, Warkaris walk for many days from many places in Maharashtra to reach Pandharpur. The palanquins of the saints and the singing of bhajans go along with them.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'महाराष्ट्र',
        regionEn: 'Maharashtra',
        titleHi: 'पुण्डलीक की ईंट',
        titleEn: 'Pundalik\'s brick',
        bodyHi: [
          'पुण्डलीक अपने माता-पिता की सेवा में लगे थे, तभी कृष्ण उनसे मिलने आए। सेवा अधूरी न छोड़ते हुए पुण्डलीक ने एक ईंट उनकी ओर सरका दी, कि वे उस पर खड़े होकर प्रतीक्षा करें।',
          'कृष्ण कमर पर हाथ रखे उसी ईंट पर खड़े हो गए, और पंढरपुर में विट्ठल आज भी उसी रूप में दर्शन देते हैं।',
        ],
        bodyEn: [
          'Pundalik was busy serving his parents when Krishna came to meet him. Not wanting to leave his service unfinished, Pundalik pushed a brick towards him so that he could stand on it and wait.',
          'Krishna stood on that very brick with his hands on his hips, and in Pandharpur, Vitthal still gives darshan in that same form.',
        ],
        canonHi: 'लोक-परम्परा (महाराष्ट्र)',
        canonEn: 'Folk tradition (Maharashtra)',
      },
    ],
    bhavHi: 'पुण्डलीक की कथा यह भाव रखती है कि माता-पिता की सेवा भी भक्ति है, और भगवान भी भक्त के लिए प्रतीक्षा करते हैं।',
    bhavEn: 'Pundalik\'s story holds the thought that serving one\'s parents is also devotion, and that God, too, waits for his devotee.',
    anchors: {
      masa: [4],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Maharashtra). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'S1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'सावन में शिवलिंग पर जल और दूध क्यों चढ़ाते हैं?',
    questionEn: 'Why do we offer water and milk on the Shivalinga in Sawan?',
    practiceHi: 'श्रावण मास में, विशेषकर सोमवार को, शिवलिंग पर जल और दूध से अभिषेक किया जाता है।',
    practiceEn: 'In the month of Shravan, especially on Mondays, the Shivalinga is given an abhishek, a ritual bath of water and milk.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'नीलकण्ठ — हलाहल का पान',
        titleEn: 'Neelkanth — drinking the halahal',
        bodyHi: [
          'समुद्र-मन्थन में सबसे पहले हलाहल विष निकला, जिसकी ज्वाला से सारे लोक व्याकुल हो उठे। सबकी रक्षा के लिए शिव ने वह विष पी लिया। विष उनके कण्ठ में ठहर गया और कण्ठ नीला पड़ गया — इसी से वे नीलकण्ठ कहलाए।',
        ],
        bodyEn: [
          'When the ocean was churned, the first thing to rise from it was the halahal poison, and its fiery heat threw all the worlds into distress. To protect everyone, Shiva drank the poison. It stayed in his throat and his throat turned blue. This is why he is called Neelkanth, the blue-throated one.',
        ],
        canonHi: 'श्रीमद्भागवत पुराण 8.7',
        canonEn: 'Bhagavata Purana 8.7',
      },
      {
        tier: 'lok',
        titleHi: 'जल से शीतलता',
        titleEn: 'Cooling with water',
        bodyHi: [
          'लोक में यह भाव प्रचलित है कि शिव के कण्ठ में ठहरे विष की तपन को जल और दूध शीतल करते हैं। इसी भाव से शिवलिंग पर जल और दूध की धारा चढ़ाई जाती है।',
        ],
        bodyEn: [
          'A popular folk belief holds that water and milk cool the burning of the poison held in Shiva\'s throat. It is in this spirit that streams of water and milk are poured over the Shivalinga.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'संसार के लिए विष तक धारण कर लेने वाले शिव के प्रति कृतज्ञता और शीतलता का अर्पण ही अभिषेक का भाव है।',
    bhavEn: 'The abhishek is an offering of gratitude and coolness to Shiva, who took even poison upon himself for the sake of the world.',
    anchors: {
      masa: [5],
      kathaIds: [
        'shravana-mahatmya',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhagavata Purana 8.7 | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'S2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'सावन में कांवड़ यात्रा क्यों करते हैं?',
    questionEn: 'Why do people make the Kanwar Yatra in Sawan?',
    practiceHi: 'श्रावण में श्रद्धालु कांवड़ में गंगाजल भरकर पैदल यात्रा करते हैं और उसे शिवलिंग पर चढ़ाते हैं।',
    practiceEn: 'In Shravan, devotees fill a kanwar with Ganga water, make the journey on foot and offer the water on the Shivalinga.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'परशुराम की कांवड़',
        titleEn: 'Parashurama\'s kanwar',
        bodyHi: [
          'लोक में एक कथा परशुराम को पहला कांवड़िया मानती है। कहा जाता है कि वे कांवड़ में गंगाजल भरकर लाए और उससे शिव का अभिषेक किया।',
        ],
        bodyEn: [
          'One folk story regards Parashurama as the first kanwariya. It is said that he brought Ganga water in a kanwar and used it to perform Shiva\'s abhishek.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'रावण की कांवड़',
        titleEn: 'Ravana\'s kanwar',
        bodyHi: [
          'एक अन्य लोक-कथा में शिव-भक्त रावण को पहला कांवड़िया बताया जाता है। कहा जाता है कि विषपान के बाद शिव की तपन शान्त करने के लिए वह कांवड़ में गंगाजल लाया।',
        ],
        bodyEn: [
          'Another folk story names Ravana, a devotee of Shiva, as the first kanwariya. It is said that after Shiva drank the poison, Ravana brought Ganga water in a kanwar to ease the burning heat Shiva felt.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'श्रवण कुमार की कांवड़',
        titleEn: 'Shravan Kumar\'s kanwar',
        bodyHi: [
          'लोक में श्रवण कुमार की कथा प्रसिद्ध है, जो अपने अन्धे माता-पिता को कांवड़ में बिठाकर कन्धे पर तीर्थयात्रा कराने ले गए। कुछ लोग इसी को कांवड़ यात्रा का पहला रूप मानते हैं।',
        ],
        bodyEn: [
          'The folk story of Shravan Kumar is well known. He seated his blind parents in a kanwar and carried them on his shoulders on a pilgrimage. Some people see this as the earliest form of the Kanwar Yatra.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'shastra',
        titleHi: 'दशरथ और जल भरता मुनि-कुमार',
        titleEn: 'Dasharatha and the young sage drawing water',
        bodyHi: [
          'वाल्मीकि रामायण में दशरथ याद करते हैं कि युवावस्था में रात के समय सरयू तट पर उन्होंने घड़ा भरने की ध्वनि को हाथी की आवाज़ समझकर बाण चला दिया। वह एक मुनि-कुमार था, जो अपने अन्धे माता-पिता के लिए जल लेने आया था। लोक-परम्परा इसी बालक को श्रवण कुमार के नाम से जानती है।',
        ],
        bodyEn: [
          'In the Valmiki Ramayana, Dasharatha recalls how, as a young man, one night on the banks of the Sarayu, he mistook the sound of a pot being filled for the sound of an elephant and shot an arrow. It was a sage\'s young son, who had come to fetch water for his blind parents. Folk tradition knows this boy by the name Shravan Kumar.',
        ],
        canonHi: 'वाल्मीकि रामायण, अयोध्या काण्ड (समीक्षाधीन)',
        canonEn: 'Valmiki Ramayana, Ayodhya Kanda (under review)',
      },
    ],
    bhavHi: 'कन्धे पर उठाकर पैदल लाया गया जल श्रम और संकल्प से भरा अर्पण बन जाता है।',
    bhavEn: 'Water lifted onto the shoulder and carried on foot becomes an offering full of effort and resolve.',
    anchors: {
      masa: [5],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | Folk tradition | Folk tradition | Valmiki Ramayana, Ayodhya Kanda (under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'S3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'सावन के सोमवार का व्रत क्यों रखते हैं?',
    questionEn: 'Why do people fast on the Mondays of Sawan?',
    practiceHi: 'सावन के हर सोमवार को शिव-पूजा और व्रत रखा जाता है। कुछ लोग लगातार सोलह सोमवार का व्रत भी करते हैं।',
    practiceEn: 'On every Monday of Sawan, people worship Shiva and keep a fast. Some also keep the fast for sixteen Mondays in a row.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'पार्वती का श्रावण-तप',
        titleEn: 'Parvati\'s austerities in Shravan',
        bodyHi: [
          'लोक में कहा जाता है कि पार्वती ने शिव को पति रूप में पाने के लिए श्रावण मास में कठोर तप किया और शिव प्रसन्न हुए। इसी से श्रावण शिव का प्रिय मास माना जाता है, और कई स्त्रियाँ इसी भाव से सावन के सोमवार का व्रत रखती हैं।',
        ],
        bodyEn: [
          'It is said in folk tradition that Parvati performed severe austerities in the month of Shravan to win Shiva as her husband, and Shiva was pleased. This is why Shravan is considered Shiva\'s favourite month, and many women keep the Sawan Monday fast in the same spirit.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'चन्द्रमा और सोमवार',
        titleEn: 'The moon and Monday',
        bodyHi: [
          'एक कथा के अनुसार दक्ष के शाप से चन्द्रमा का तेज क्षीण होने लगा। चन्द्रमा ने शिव की आराधना की, और शिव ने उन्हें फिर से बढ़ने का वर देकर अपने मस्तक पर धारण किया। चन्द्रमा का एक नाम सोम है, और सोम का दिन सोमवार इसी से शिव का दिन माना जाता है।',
        ],
        bodyEn: [
          'According to one story, the moon\'s radiance began to wane because of Daksha\'s curse. The moon worshipped Shiva, and Shiva granted him the boon of growing again and placed him on his own head. One of the moon\'s names is Soma, and for this reason Somvar, Monday, the day of Soma, is regarded as Shiva\'s day.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'सोमवार का व्रत धैर्य और निरन्तर साधना का भाव है, वैसा ही जैसा पार्वती के तप में दिखता है।',
    bhavEn: 'The Monday fast expresses patience and steady spiritual practice, much like what is seen in Parvati\'s austerities.',
    anchors: {
      masa: [5],
      kathaIds: [
        'shravana-mahatmya',
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
    id: 'S4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'हरियाली तीज पर झूला, हरी चूड़ियाँ और मेहँदी क्यों?',
    questionEn: 'Why swings, green bangles and mehendi on Hariyali Teej?',
    practiceHi: 'श्रावण शुक्ल तृतीया को स्त्रियाँ हरे वस्त्र और हरी चूड़ियाँ पहनती हैं, मेहँदी लगाती हैं, झूला झूलती हैं और शिव-पार्वती की पूजा करती हैं।',
    practiceEn: 'On Shravan Shukla Tritiya, women wear green clothes and green bangles, apply mehendi, ride swings and worship Shiva and Parvati.',
    kathas: [
      {
        tier: 'lok',
        titleHi: '108 जन्मों का तप',
        titleEn: 'Austerities across 108 births',
        bodyHi: [
          'लोक-कथा के अनुसार पार्वती ने शिव को पाने के लिए 108 जन्मों तक तप किया। श्रावण शुक्ल तृतीया को शिव ने उन्हें पत्नी रूप में स्वीकार किया, इसलिए यह दिन शिव-पार्वती के पुनर्मिलन के रूप में मनाया जाता है।',
        ],
        bodyEn: [
          'According to a folk story, Parvati performed austerities for 108 births to win Shiva. On Shravan Shukla Tritiya, Shiva accepted her as his wife, so the day is celebrated as the reunion of Shiva and Parvati.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'वर्षा की हरियाली और शिव-पार्वती के मिलन का उल्लास इस पर्व के झूलों और हरे रंग में दिखता है।',
    bhavEn: 'The greenery of the rains and the joy of Shiva and Parvati\'s union show in the swings and the green colour of this festival.',
    anchors: {
      masa: [5],
      ruleIds: [
        'hariyali-teej',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'S5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'नाग पंचमी पर नाग को दूध क्यों चढ़ाते हैं?',
    questionEn: 'Why do people offer milk to snakes on Nag Panchami?',
    practiceHi: 'नाग पंचमी पर नाग देवता की पूजा होती है और नाग की प्रतिमा या चित्र को दूध अर्पित किया जाता है। साँप दूध नहीं पीते — यह अर्पण प्रतीक रूप में होता है।',
    practiceEn: 'On Nag Panchami the serpent deity is worshipped, and milk is offered to an image or picture of a snake. Snakes do not drink milk; the offering is symbolic.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'आस्तीक और सर्प-सत्र',
        titleEn: 'Astika and the snake sacrifice',
        bodyHi: [
          'अर्जुन के पौत्र राजा परीक्षित की मृत्यु तक्षक नाग के डसने से हुई। उनके पुत्र जनमेजय ने बदले में सर्प-सत्र आरम्भ किया, जिसमें मंत्रों के बल से नाग अग्नि में गिरने लगे। नागराज वासुकि की बहन के पुत्र, ऋषि-कुमार आस्तीक ने राजा से वर माँगकर यह सत्र रुकवाया और नागों की रक्षा की।',
        ],
        bodyEn: [
          'King Parikshit, Arjuna\'s grandson, died from the bite of the serpent Takshaka. In revenge, his son Janamejaya began a snake sacrifice, in which the power of mantras made serpents fall into the fire. Astika, a young sage and the son of the sister of the serpent king Vasuki, asked the king for a boon, had the sacrifice stopped and saved the serpents.',
        ],
        canonHi: 'महाभारत, आदि पर्व',
        canonEn: 'Mahabharata, Adi Parva',
      },
    ],
    bhavHi: 'नागों के प्रति आदर और उनकी रक्षा का स्मरण इस पर्व का भाव है, जैसा आस्तीक ने सर्प-सत्र रुकवाकर किया।',
    bhavEn: 'The spirit of the festival is respect for snakes and the memory of protecting them, as Astika did when he had the snake sacrifice stopped.',
    anchors: {
      masa: [5],
      kathaIds: [
        'nag-panchami-vrat-katha',
      ],
      ruleIds: [
        'nag-panchami',
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
    id: 'S6',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'रक्षा बन्धन पर राखी क्यों बाँधते हैं?',
    questionEn: 'Why do we tie a rakhi on Raksha Bandhan?',
    practiceHi: 'श्रावण पूर्णिमा को बहनें भाइयों की कलाई पर राखी बाँधती हैं। बाँधते समय पढ़े जाने वाले पारम्परिक रक्षा-मंत्र में उस रक्षा-सूत्र का स्मरण है, जिससे दानवराज बलि बाँधे गए थे।',
    practiceEn: 'On Shravan Purnima, sisters tie a rakhi on their brothers\' wrists. The traditional protection mantra recited while tying it recalls the protective thread with which Bali, the king of the demons, was bound.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'इन्द्राणी का रक्षा-सूत्र',
        titleEn: 'Indrani\'s protective thread',
        bodyHi: [
          'देवताओं और दानवों के युद्ध में जब इन्द्र पराजित होने लगे, तब इन्द्राणी ने श्रावण पूर्णिमा को उनकी कलाई पर रक्षा-सूत्र बाँधा। उस रक्षा के बल पर इन्द्र को विजय मिली।',
        ],
        bodyEn: [
          'In the war between the gods and the demons, when Indra was close to defeat, Indrani tied a protective thread on his wrist on Shravan Purnima. Through the strength of that protection, Indra won.',
        ],
        canonHi: 'भविष्य पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Bhavishya Purana (adhyaya under review)',
      },
      {
        tier: 'lok',
        titleHi: 'लक्ष्मी और बलि',
        titleEn: 'Lakshmi and Bali',
        bodyHi: [
          'वामन को दिए वचन के कारण विष्णु बलि के लोक में उनके रक्षक बनकर रहने लगे। लक्ष्मी ने बलि को राखी बाँधकर भाई बनाया, और उपहार पूछे जाने पर अपने पति को लौटाने का वर माँगा। बलि ने विष्णु को वैकुण्ठ लौटने दिया।',
        ],
        bodyEn: [
          'Because of the promise given to Vamana, Vishnu began living in Bali\'s realm as his guardian. Lakshmi tied a rakhi on Bali and made him her brother, and when asked what gift she wanted, she asked for her husband to be returned. Bali let Vishnu go back to Vaikuntha.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'द्रौपदी का आँचल',
        titleEn: 'The edge of Draupadi\'s sari',
        bodyHi: [
          'लोक-कथा में एक बार कृष्ण की उँगली कटकर रक्त बहने लगा, तो द्रौपदी ने अपनी साड़ी का किनारा फाड़कर बाँध दिया। कृष्ण ने इस स्नेह के बदले उसकी रक्षा का वचन दिया, जिसे चीर-हरण के समय निभाया।',
        ],
        bodyEn: [
          'In a folk story, Krishna once cut his finger and it began to bleed, so Draupadi tore off the edge of her sari and tied it around the wound. In return for this affection, Krishna promised to protect her, a promise he kept when she was being disrobed.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'राखी स्नेह से बाँधा गया वचन है, जिसमें बाँधने वाला शुभकामना देता है और बँधवाने वाला रक्षा का भरोसा।',
    bhavEn: 'A rakhi is a promise tied with affection, in which the one who ties it offers good wishes and the one who wears it offers the assurance of protection.',
    anchors: {
      masa: [5],
      kathaIds: [
        'raksha-bandhan-legends',
      ],
      ruleIds: [
        'raksha-bandhan',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhavishya Purana (adhyaya under review) | Folk tradition | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'S7',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'श्रावणी (उपाकर्म) पर नया जनेऊ क्यों पहनते हैं?',
    questionEn: 'Why do people put on a new sacred thread at Shravani (Upakarma)?',
    practiceHi: 'श्रावण पूर्णिमा के आसपास उपाकर्म होता है, जिसमें जनेऊ धारण करने वाले पुराना यज्ञोपवीत बदलकर नया पहनते हैं। तिथि वेद-शाखा के अनुसार भिन्न होती है; तमिल परम्परा में इसे आवणि अवित्तम् कहते हैं।',
    practiceEn: 'Upakarma is observed around Shravan Purnima, when those who wear the janeu, the sacred thread, replace their old yajnopavita with a new one. The date varies with the Vedic branch; in the Tamil tradition it is called Avani Avittam.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'उपाकर्म — अध्ययन का नया सत्र',
        titleEn: 'Upakarma — a new term of study',
        bodyHi: [
          'गृह्यसूत्रों में उपाकर्म का विधान मिलता है — श्रावण मास में वेद-अध्ययन का वार्षिक सत्र इसी कर्म से आरम्भ होता था। समय के साथ यह हर वर्ष अध्ययन का संकल्प दोहराने और नया यज्ञोपवीत धारण करने का अवसर बन गया।',
        ],
        bodyEn: [
          'The rite of Upakarma is laid down in the Grihya Sutras. The yearly term of Vedic study in the month of Shravan used to begin with this rite. Over time it became an occasion each year to renew the resolve to study and to put on a new yajnopavita.',
        ],
        canonHi: 'गृह्यसूत्र',
        canonEn: 'Grihya Sutras',
      },
    ],
    bhavHi: 'हर वर्ष अध्ययन को नए सिरे से आरम्भ करना ज्ञान की परम्परा को जीवित रखने का भाव है।',
    bhavEn: 'Beginning study afresh every year expresses keeping the tradition of knowledge alive.',
    anchors: {
      masa: [5],
      ruleIds: [
        'avani-avittam',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Grihya Sutras. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'B1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'जन्माष्टमी पर आधी रात का उत्सव, झूला और दही-हाण्डी क्यों?',
    questionEn: 'Why the midnight celebration, the swing and the dahi handi on Janmashtami?',
    practiceHi: 'जन्माष्टमी पर व्रत रखकर आधी रात को कृष्ण-जन्म मनाया जाता है और बाल-गोपाल को झूले में झुलाया जाता है। महाराष्ट्र में ऊँचाई पर टँगी दही-हाण्डी फोड़ी जाती है।',
    practiceEn: 'On Janmashtami people keep a fast and celebrate Krishna\'s birth at midnight, and the infant Krishna, Bal Gopal, is rocked in a swing. In Maharashtra, a pot of curd, the dahi handi, hung up high is broken open.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'कारागार में आधी रात का जन्म',
        titleEn: 'A midnight birth in the prison',
        bodyHi: [
          'कंस के कारागार में देवकी और वसुदेव की आठवीं सन्तान के रूप में कृष्ण का जन्म आधी रात को हुआ। उसी रात वसुदेव शिशु को यमुना पार गोकुल ले गए और नन्द-यशोदा के घर छोड़ आए।',
        ],
        bodyEn: [
          'Krishna was born at midnight in Kansa\'s prison, as the eighth child of Devaki and Vasudeva. That same night Vasudeva carried the baby across the Yamuna to Gokul and left him in the home of Nanda and Yashoda.',
        ],
        canonHi: 'श्रीमद्भागवत पुराण 10.3',
        canonEn: 'Bhagavata Purana 10.3',
      },
      {
        tier: 'lok',
        regionHi: 'महाराष्ट्र',
        regionEn: 'Maharashtra',
        titleHi: 'माखन-चोर और दही-हाण्डी',
        titleEn: 'The butter thief and the dahi handi',
        bodyHi: [
          'बाल-कृष्ण अपने सखाओं के साथ ऊँचे छींकों पर टँगे मटकों से माखन और दही चुराते थे। इसी लीला की याद में महाराष्ट्र में गोविन्दा-टोलियाँ एक-दूसरे के कन्धों पर चढ़कर मानव-पिरामिड बनाती हैं और ऊँची टँगी हाण्डी फोड़ती हैं।',
        ],
        bodyEn: [
          'The child Krishna and his friends used to steal butter and curd from pots hung in high slings. In memory of this leela, Govinda teams in Maharashtra climb onto one another\'s shoulders to form human pyramids and break a pot hung high above.',
        ],
        canonHi: 'लोक-परम्परा (महाराष्ट्र)',
        canonEn: 'Folk tradition (Maharashtra)',
      },
    ],
    bhavHi: 'अँधेरी रात और बन्दीगृह में ईश्वर का जन्म संकट के बीच आशा के प्रकट होने का भाव देता है।',
    bhavEn: 'God being born on a dark night, in a prison, conveys hope appearing in the midst of hardship.',
    anchors: {
      masa: [6],
      kathaIds: [
        'janmashtami-katha',
      ],
      ruleIds: [
        'janmashtami',
        'janmashtami-vaishnava',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhagavata Purana 10.3 | Folk tradition (Maharashtra). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'B2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'गणेश चतुर्थी पर चाँद क्यों नहीं देखते?',
    questionEn: 'Why do people not look at the moon on Ganesh Chaturthi?',
    practiceHi: 'भाद्रपद शुक्ल चतुर्थी, यानी गणेश चतुर्थी की रात चन्द्रमा का दर्शन न करने की परम्परा है।',
    practiceEn: 'There is a tradition of not looking at the moon on the night of Bhadrapada Shukla Chaturthi, that is, Ganesh Chaturthi.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'चन्द्रमा का उपहास',
        titleEn: 'The moon\'s mockery',
        bodyHi: [
          'लोक-कथा के अनुसार चन्द्रमा ने गणेश के रूप का उपहास किया, तो गणेश ने शाप दिया कि भाद्रपद शुक्ल चतुर्थी को चन्द्रमा देखने वाले पर झूठा कलंक लगेगा। कहा जाता है कि कृष्ण ने इसी तिथि को चाँद देख लिया था, और उसके बाद उन पर स्यमन्तक मणि की चोरी का आरोप लगा।',
        ],
        bodyEn: [
          'According to a folk story, when the moon mocked Ganesha\'s appearance, Ganesha cursed that anyone who saw the moon on Bhadrapada Shukla Chaturthi would be falsely accused. It is said that Krishna saw the moon on this very date, and after that he was accused of stealing the Syamantaka jewel.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'purana',
        titleHi: 'स्यमन्तक मणि का आरोप',
        titleEn: 'The accusation over the Syamantaka jewel',
        bodyHi: [
          'सत्राजित की स्यमन्तक मणि पहनकर उसका भाई प्रसेन वन गया और लौटा नहीं, तो द्वारका में लोगों ने कृष्ण पर मणि चुराने का सन्देह किया। कृष्ण ने खोज करके मणि जाम्बवान से प्राप्त की और सत्राजित को लौटाकर झूठा आरोप मिटाया।',
        ],
        bodyEn: [
          'Satrajit\'s brother Prasena put on Satrajit\'s Syamantaka jewel, went into the forest and did not return, and people in Dwarka suspected Krishna of stealing the jewel. Krishna searched for it, obtained the jewel from Jambavan, returned it to Satrajit and cleared the false charge.',
        ],
        canonHi: 'श्रीमद्भागवत पुराण 10.56–57',
        canonEn: 'Bhagavata Purana 10.56–57',
      },
    ],
    bhavHi: 'कथा का भाव है कि उपहास दुख देता है, और झूठा आरोप भी धैर्य से सत्य सामने आने पर मिट जाता है।',
    bhavEn: 'The story conveys that mockery causes hurt, and that even a false accusation is cleared when, with patience, the truth comes to light.',
    anchors: {
      masa: [6],
      kathaIds: [
        'ganesha-chaturthi-vrat-katha',
      ],
      ruleIds: [
        'ganesh-chaturthi',
        'vinayaka-chaturthi-vrat',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | Bhagavata Purana 10.56–57. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'B3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'गणेश को मोदक क्यों, और दस दिन बाद विसर्जन क्यों?',
    questionEn: 'Why modaks for Ganesha, and why the immersion after ten days?',
    practiceHi: 'गणेश चतुर्थी पर गणेश को मोदक का भोग लगाया जाता है। कई स्थानों पर प्रतिमा दस दिन रखकर अनन्त चतुर्दशी को जल में विसर्जित की जाती है, जबकि कई परिवार डेढ़, पाँच या सात दिन में विसर्जन करते हैं।',
    practiceEn: 'On Ganesh Chaturthi, modaks are offered to Ganesha as bhog. In many places the idol is kept for ten days and immersed in water on Anant Chaturdashi, while many families immerse it after one and a half, five or seven days.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'मोदक — आनन्द का मिष्ठान्न',
        titleEn: 'Modak — the sweet of joy',
        bodyHi: [
          '\'मोदक\' का अर्थ \'मोद\' यानी आनन्द देने वाला बताया जाता है। एक लोक-कथा में शिव, पार्वती और गणेश अनसूया के यहाँ अतिथि बने; भूखे गणेश बहुत कुछ खाकर भी तृप्त नहीं हुए, पर अनसूया के दिए एक मोदक से उनकी भूख शान्त हो गई। एक अन्य कथा मोदक को पार्वती के हाथ से गणेश को मिले प्रिय मिष्ठान्न के रूप में याद करती है।',
        ],
        bodyEn: [
          'The word \'modak\' is said to mean that which gives \'moda\', or joy. In one folk story, Shiva, Parvati and Ganesha were guests at Anasuya\'s home. The hungry Ganesha ate a great deal and was still not satisfied, but a single modak from Anasuya calmed his hunger. Another story remembers the modak as the beloved sweet Ganesha received from Parvati\'s own hands.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'itihas',
        titleHi: 'तिलक और सार्वजनिक गणेशोत्सव',
        titleEn: 'Tilak and the public Ganeshotsav',
        bodyHi: [
          'गणेश चतुर्थी पहले मुख्यतः घरों में मनाई जाती थी। 1893 में लोकमान्य तिलक ने इसे सार्वजनिक उत्सव के रूप में बढ़ावा दिया, ताकि लोग एक साथ जुड़ सकें। इसके बाद सार्वजनिक पण्डाल और सामूहिक विसर्जन की परम्परा व्यापक रूप से फैली।',
        ],
        bodyEn: [
          'Ganesh Chaturthi used to be celebrated mainly in homes. In 1893, Lokmanya Tilak promoted it as a public festival so that people could come together. After that, the tradition of public pandals and community immersions spread widely.',
        ],
        canonHi: 'इतिहास · सार्वजनिक गणेशोत्सव, लोकमान्य तिलक, 1893',
        canonEn: 'History · Public Ganeshotsav, Lokmanya Tilak, 1893',
      },
    ],
    bhavHi: 'मोदक का आनन्द और विसर्जन की विदाई मिलकर अतिथि की तरह आए देवता के स्वागत और विदा का भाव रचते हैं।',
    bhavEn: 'The joy of the modak and the farewell of the immersion together express welcoming a deity who has come like a guest, and then seeing him off.',
    anchors: {
      masa: [6],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | History · Public Ganeshotsav, Lokmanya Tilak, 1893. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'B4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'हल षष्ठी पर हल से जुता अन्न क्यों नहीं खाते?',
    questionEn: 'Why do people not eat grain from ploughed fields on Hal Shashthi?',
    practiceHi: 'भाद्रपद कृष्ण षष्ठी को माताएँ सन्तान के लिए व्रत रखती हैं और इस दिन हल से जुते खेत का अन्न नहीं खातीं; बिना जुताई के उगा अन्न लिया जाता है।',
    practiceEn: 'On Bhadrapada Krishna Shashthi, mothers keep a fast for their children and do not eat grain from fields tilled with a plough that day; grain that grew without tilling is eaten instead.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'हलधर बलराम का दिन',
        titleEn: 'The day of Balarama the plough-bearer',
        bodyHi: [
          'बलराम कृष्ण के बड़े भाई हैं और हल उनका आयुध है, इसीलिए वे हलधर कहलाते हैं। लोक-परम्परा भाद्रपद कृष्ण षष्ठी को उनका जन्मदिन मानती है। हलधर के दिन हल से जुते खेत का अन्न न खाकर उनके आयुध का सम्मान किया जाता है।',
        ],
        bodyEn: [
          'Balarama is Krishna\'s elder brother, and the plough is his weapon, which is why he is called Haldhar, the plough-bearer. Folk tradition regards Bhadrapada Krishna Shashthi as his birthday. On Haldhar\'s day, people honour his weapon by not eating grain from fields tilled with a plough.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'हलधर के दिन हल को विश्राम देना खेती और धरती के श्रम के प्रति आदर का भाव है।',
    bhavEn: 'Giving the plough a rest on Haldhar\'s day expresses respect for farming and for the labour of the earth.',
    anchors: {
      masa: [6],
      ruleIds: [
        'hal-shashthi',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'B5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'बहुला चौथ और बछ बारस पर गाय-बछड़े की पूजा क्यों?',
    questionEn: 'Why are cows and calves worshipped on Bahula Chauth and Bachh Baras?',
    practiceHi: 'भाद्रपद कृष्ण पक्ष में बहुला चौथ और बछ बारस पर गाय और बछड़े की पूजा होती है। कई घरों में इन दिनों चाकू से कटी चीज़ें नहीं खाई जातीं; नियम परिवारों में भिन्न हैं।',
    practiceEn: 'In the dark half of Bhadrapada, cows and calves are worshipped on Bahula Chauth and Bachh Baras. In many homes, food cut with a knife is not eaten on these days; the customs vary from family to family.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'बहुला गाय का वचन',
        titleEn: 'The promise of Bahula the cow',
        bodyHi: [
          'लोक-कथा में बहुला नाम की गाय चरते हुए वन में एक सिंह के सामने पड़ गई। उसने सिंह से विनती की कि वह घर जाकर अपने बछड़े को दूध पिला दे, फिर लौट आएगी। वचन के अनुसार वह लौटी, और उसकी सत्यनिष्ठा देखकर सिंह ने उसे छोड़ दिया।',
        ],
        bodyEn: [
          'In a folk story, a cow named Bahula, while grazing, came face to face with a lion in the forest. She begged the lion to let her go home and feed her calf, promising to come back afterwards. She returned as she had promised, and seeing her truthfulness, the lion let her go.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'बहुला का लौटना वचन की दृढ़ता का, और गाय-बछड़े की पूजा माँ और सन्तान के बन्धन के आदर का भाव है।',
    bhavEn: 'Bahula\'s return honours the firmness of a promise, and the worship of cow and calf honours the bond between mother and child.',
    anchors: {
      masa: [6],
      ruleIds: [
        'bahula-chaturthi',
        'bachh-baras',
      ],
      kathaIds: [
        'bachh-baras-vrat-katha',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'B6',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'हरतालिका तीज का व्रत क्यों रखते हैं, और इसका यह नाम क्यों?',
    questionEn: 'Why do women keep the Hartalika Teej fast, and why is it called that?',
    practiceHi: 'भाद्रपद शुक्ल तृतीया को स्त्रियाँ प्रायः निर्जल व्रत रखकर शिव-पार्वती की पूजा करती हैं और रात में जागरण करती हैं।',
    practiceEn: 'On Bhadrapada Shukla Tritiya, women often keep a fast without water, worship Shiva and Parvati and keep a vigil through the night.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'सखियों ने पार्वती को हर लिया',
        titleEn: 'Her friends carried Parvati away',
        bodyHi: [
          'लोक-कथा के अनुसार हिमवान पार्वती का विवाह विष्णु से करना चाहते थे, जबकि पार्वती शिव को ही पति रूप में चाहती थीं। उनकी सखियाँ उन्हें घर से हरकर वन में ले गईं, जहाँ पार्वती ने कठोर तप किया और शिव ने उन्हें स्वीकार किया। इसी से व्रत का नाम पड़ा — \'हरित\' यानी हरी गई और \'आलिका\' यानी सखी।',
        ],
        bodyEn: [
          'According to a folk story, Himavan wanted to marry Parvati to Vishnu, while Parvati wanted only Shiva as her husband. Her friends carried her away from home into the forest, where Parvati performed severe austerities and Shiva accepted her. This gave the fast its name: \'harit\', meaning carried away, and \'aalika\', meaning female friend.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'अपने संकल्प के लिए दृढ़ तप और साथ खड़ी सखियों का स्नेह, दोनों इस व्रत के भाव में हैं।',
    bhavEn: 'Firm austerity for one\'s own resolve and the affection of friends who stand alongside are both part of the spirit of this fast.',
    anchors: {
      masa: [6],
      kathaIds: [
        'hartalika-teej-katha',
      ],
      ruleIds: [
        'hartalika-teej',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'B7',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'अनन्त चतुर्दशी पर चौदह गाँठ का धागा क्यों बाँधते हैं?',
    questionEn: 'Why do people tie a fourteen-knot thread on Anant Chaturdashi?',
    practiceHi: 'भाद्रपद शुक्ल चतुर्दशी को विष्णु के अनन्त रूप की पूजा होती है और चौदह गाँठों वाला अनन्त-सूत्र बाँह पर बाँधा जाता है।',
    practiceEn: 'On Bhadrapada Shukla Chaturdashi, Vishnu is worshipped in his Anant form, and the Anant sutra, a thread with fourteen knots, is tied on the arm.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'कौण्डिन्य और सुशीला का अनन्त-सूत्र',
        titleEn: 'Kaundinya, Sushila and the Anant thread',
        bodyHi: [
          'सुशीला ने अनन्त भगवान का व्रत करके चौदह गाँठों वाला सूत्र बाँधा। उसके पति कौण्डिन्य ने उसे साधारण धागा समझकर उतार फेंका, और इसके बाद उनका सब कुछ नष्ट हो गया। पश्चाताप में वे अनन्त को खोजते भटके; अन्त में भगवान ने दर्शन देकर उन्हें क्षमा किया और उनका वैभव लौटा।',
        ],
        bodyEn: [
          'Sushila kept the fast of Lord Anant and tied on a thread with fourteen knots. Her husband Kaundinya took it for an ordinary thread and threw it away, and after that everything he had was ruined. In remorse he wandered in search of Anant. In the end the Lord appeared to him and forgave him, and his prosperity returned.',
        ],
        canonHi: 'भविष्य पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Bhavishya Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'अहंकार से खोया हुआ विनम्र पश्चाताप से फिर मिल सकता है, यही कथा का भाव है।',
    bhavEn: 'What is lost through pride can be found again through humble repentance; that is the spirit of the story.',
    anchors: {
      masa: [6],
      kathaIds: [
        'anant-chaturdashi-vrat-katha',
      ],
      ruleIds: [
        'anant-chaturdashi',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhavishya Purana (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'B8',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'ओणम् पर फूलों का पूक्कलम् क्यों बनाते हैं?',
    questionEn: 'Why do people make a flower pookalam at Onam?',
    practiceHi: 'ओणम् के दिनों में केरल में घर के आँगन में रंग-बिरंगे फूलों से पूक्कलम् सजाया जाता है, जो दिन-ब-दिन बड़ा होता जाता है।',
    practiceEn: 'During the days of Onam in Kerala, a pookalam of colourful flowers is laid out in the courtyard of the home, and it grows larger day by day.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'वामन और बलि',
        titleEn: 'Vamana and Bali',
        bodyHi: [
          'दानवराज बलि ने अपने पराक्रम से तीनों लोकों पर अधिकार कर लिया था। विष्णु वामन रूप में उनके यज्ञ में पहुँचे और तीन पग भूमि माँगी; दो पगों में उन्होंने सारा लोक नाप लिया। तीसरे पग के लिए बलि ने अपना सिर आगे कर दिया, और विष्णु ने उन्हें सुतल लोक का राज्य दिया।',
        ],
        bodyEn: [
          'Bali, the king of the demons, had taken control of all three worlds through his might. Vishnu came to his sacrifice in the form of Vamana and asked for three paces of land. In two paces he measured out the entire world. For the third pace, Bali offered his own head, and Vishnu gave him the kingdom of Sutala.',
        ],
        canonHi: 'श्रीमद्भागवत पुराण, स्कन्ध 8 (अध्याय समीक्षाधीन)',
        canonEn: 'Bhagavata Purana, Skandha 8 (adhyaya under review)',
      },
      {
        tier: 'lok',
        regionHi: 'केरल',
        regionEn: 'Kerala',
        titleHi: 'महाबलि का आगमन',
        titleEn: 'The coming of Mahabali',
        bodyHi: [
          'केरल में मान्यता है कि महाबलि का राज्य समृद्ध और न्यायपूर्ण था, जहाँ सब समान थे। पाताल जाते समय उन्हें वर्ष में एक बार अपनी प्रजा से मिलने आने का वर मिला। ओणम् पर उनके स्वागत में घर-आँगन में फूलों का पूक्कलम् सजाया जाता है।',
        ],
        bodyEn: [
          'In Kerala it is believed that Mahabali\'s kingdom was prosperous and just, a place where all were equal. As he went down to Patala, he was granted a boon to come back once a year to meet his people. At Onam, a pookalam of flowers is laid out in homes and courtyards to welcome him.',
        ],
        canonHi: 'लोक-परम्परा (केरल)',
        canonEn: 'Folk tradition (Kerala)',
      },
    ],
    bhavHi: 'न्यायप्रिय राजा की प्रतीक्षा में घर सजाना समृद्धि और समता की स्मृति का उत्सव है।',
    bhavEn: 'Decorating the home while waiting for a just king is a celebration that remembers prosperity and equality.',
    anchors: {
      masa: [6],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhagavata Purana, Skandha 8 (adhyaya under review) | Folk tradition (Kerala). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'B9',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'विश्वकर्मा पूजा पर औज़ारों की पूजा क्यों?',
    questionEn: 'Why are tools worshipped on Vishwakarma Puja?',
    practiceHi: 'कन्या संक्रान्ति के दिन, विशेषकर पूर्वी भारत में, कारीगर, शिल्पी और कारख़ानों के कर्मी अपने औज़ारों और मशीनों की पूजा करते हैं; उस दिन प्रायः उनसे काम नहीं लिया जाता।',
    practiceEn: 'On the day of Kanya Sankranti, especially in eastern India, artisans, craftspeople and factory workers worship their tools and machines, and usually do not work with them that day.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'देव-शिल्पी विश्वकर्मा',
        titleEn: 'Vishwakarma, craftsman of the gods',
        bodyHi: [
          'विश्वकर्मा देवताओं के शिल्पी माने जाते हैं, जिन्होंने देवताओं के भवन, नगर और अस्त्र गढ़े। इसलिए उनके दिन हर तरह के कारीगर उन्हें अपना आराध्य मानकर पूजते हैं, और काम के औज़ार एक दिन विश्राम करते हैं।',
        ],
        bodyEn: [
          'Vishwakarma is regarded as the craftsman of the gods, who built their palaces, cities and weapons. So on his day, craftspeople of every kind worship him as their own deity, and the tools of their work rest for a day.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'औज़ार को पूजना उस श्रम और कौशल का आदर है जिससे जीविका चलती है।',
    bhavEn: 'Worshipping a tool honours the labour and skill that provide a livelihood.',
    anchors: {
      masa: [6],
      ruleIds: [
        'vishwakarma-puja',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'AS1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'नवरात्रि में नौ दिन अखण्ड ज्योति क्यों जलाते हैं?',
    questionEn: 'Why do people keep an akhand jyoti burning for the nine days of Navratri?',
    practiceHi: 'आश्विन शुक्ल प्रतिपदा से नौ दिन देवी की आराधना होती है; कई घरों में इन दिनों अखण्ड ज्योति, यानी लगातार जलता दीप, रखा जाता है।',
    practiceEn: 'From Ashwin Shukla Pratipada the Goddess is worshipped for nine days, and in many homes an akhand jyoti, a lamp that burns without a break, is kept through these days.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'महिषासुर-मर्दिनी',
        titleEn: 'Mahishasura Mardini',
        bodyHi: [
          'महिषासुर ने देवताओं को पराजित कर स्वर्ग छीन लिया। देवताओं के सम्मिलित तेज से देवी प्रकट हुईं, और सबने उन्हें अपने-अपने आयुध दिए। देवी ने युद्ध में महिषासुर और उसकी सेना का संहार किया; नवरात्रि में इसी विजय का स्मरण कर देवी की आराधना होती है।',
        ],
        bodyEn: [
          'Mahishasura defeated the gods and seized heaven from them. The Goddess emerged from the combined radiance of the gods, and each of them gave her their own weapons. In battle the Goddess destroyed Mahishasura and his army; during Navratri, the Goddess is worshipped in remembrance of this victory.',
        ],
        canonHi: 'देवी माहात्म्य (अध्याय समीक्षाधीन)',
        canonEn: 'Devi Mahatmya (adhyaya under review)',
      },
    ],
    bhavHi: 'नौ दिन बिना बुझे जलती ज्योति उस शक्ति का स्मरण है जो अन्धकार पर विजय पाती है।',
    bhavEn: 'A flame that burns for nine days without going out recalls the power that triumphs over darkness.',
    anchors: {
      masa: [7],
      kathaIds: [
        'navratri-start-katha',
      ],
      ruleIds: [
        'navratri-start',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Devi Mahatmya (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'AS2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'गरबा दीप के चारों ओर घेरे में क्यों खेलते हैं?',
    questionEn: 'Why is garba danced in a circle around a lamp?',
    practiceHi: 'गुजरात में नवरात्रि की रातों में छेदों वाले मिट्टी के घड़े में दीप जलाकर बीच में रखा जाता है और उसके चारों ओर घेरे में गरबा नृत्य होता है।',
    practiceEn: 'In Gujarat, on the nights of Navratri, a lamp is lit inside a clay pot with holes and placed in the centre, and people dance the garba in a circle around it.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'गुजरात',
        regionEn: 'Gujarat',
        titleHi: 'गर्भ-दीप',
        titleEn: 'The garbh-deep',
        bodyHi: [
          'गरबा शब्द \'गर्भ-दीप\' से जुड़ा माना जाता है — छेदों वाले मिट्टी के घड़े के भीतर जलता दीप, जैसे गर्भ में पलता जीवन। नवरात्रि में इसी दीप-घट को बीच में रखकर लोग गोल घेरे में नाचते हैं और देवी की स्तुति गाते हैं।',
        ],
        bodyEn: [
          'The word garba is thought to be linked to \'garbh-deep\', a lamp burning inside a clay pot with holes, like life growing in the womb. At Navratri, people place this lamp-pot in the centre, dance in a circle around it and sing the praises of the Goddess.',
        ],
        canonHi: 'लोक-परम्परा (गुजरात)',
        canonEn: 'Folk tradition (Gujarat)',
      },
    ],
    bhavHi: 'घेरे के बीच जलता दीप देवी को जीवन देने वाली शक्ति के रूप में देखने का भाव है।',
    bhavEn: 'The lamp burning at the centre of the circle expresses seeing the Goddess as the power that gives life.',
    anchors: {
      masa: [7],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Gujarat). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'AS3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'दुर्गा पूजा में पुण्य माटी और सिन्दूर खेला क्यों?',
    questionEn: 'Why punya mati and sindoor khela at Durga Puja?',
    practiceHi: 'बंगाल की दुर्गा पूजा में प्रतिमा की माटी में \'पुण्य माटी\' मिलाई जाती है, और विजयादशमी को विवाहित स्त्रियाँ सिन्दूर खेला करती हैं।',
    practiceEn: 'In Bengal\'s Durga Puja, \'punya mati\' is mixed into the clay of the idol, and on Vijayadashami married women play sindoor khela.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'बंगाल',
        regionEn: 'Bengal',
        titleHi: 'पुण्य माटी',
        titleEn: 'Punya mati',
        bodyHi: [
          'बंगाल में दुर्गा-प्रतिमा गढ़ने की माटी में गणिकाओं के द्वार से ली गई माटी भी मिलाई जाती है, जिसे \'पुण्य माटी\' कहा जाता है। लोक में इसकी एक व्याख्या यह है कि उस द्वार पर जाने वाले अपना पुण्य वहीं छोड़ जाते हैं; दूसरी यह कि देवी समाज के हर द्वार की हैं।',
        ],
        bodyEn: [
          'In Bengal, the clay used to shape the Durga idol also includes earth taken from the doorsteps of courtesans, which is called \'punya mati\'. One folk explanation is that those who visit that doorstep leave their merit behind there; another is that the Goddess belongs to every doorstep in society.',
        ],
        canonHi: 'लोक-परम्परा (बंगाल)',
        canonEn: 'Folk tradition (Bengal)',
      },
      {
        tier: 'lok',
        regionHi: 'बंगाल',
        regionEn: 'Bengal',
        titleHi: 'उमा की विदाई',
        titleEn: 'Uma\'s farewell',
        bodyHi: [
          'बंगाल में दुर्गा को उमा — हिमालय की बेटी — के रूप में देखा जाता है, जो हर वर्ष शरद में कुछ दिनों के लिए अपने मायके आती हैं। विजयादशमी को कैलास लौटने से पहले विवाहित स्त्रियाँ उन्हें सिन्दूर और मिठाई अर्पित कर विदा करती हैं, फिर एक-दूसरे को सिन्दूर लगाती हैं — यही सिन्दूर खेला है।',
        ],
        bodyEn: [
          'In Bengal, Durga is seen as Uma, the daughter of the Himalaya, who comes to her parents\' home every year in autumn for a few days. On Vijayadashami, before she returns to Kailash, married women offer her sindoor and sweets and bid her farewell, then smear sindoor on one another. This is sindoor khela.',
        ],
        canonHi: 'लोक-परम्परा (बंगाल)',
        canonEn: 'Folk tradition (Bengal)',
      },
    ],
    bhavHi: 'देवी को घर की बेटी मानकर स्वागत और विदा करना, और हर द्वार की माटी से उनका रूप गढ़ना, दोनों में देवी की निकटता का भाव है।',
    bhavEn: 'Welcoming and bidding farewell to the Goddess as a daughter of the house, and shaping her form from the earth of every doorstep, both express the closeness of the Goddess.',
    anchors: {
      masa: [7],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Bengal) | Folk tradition (Bengal). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'AS4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'दशहरे पर रावण दहन और रामलीला क्यों?',
    questionEn: 'Why do people burn Ravana and stage the Ramlila at Dussehra?',
    practiceHi: 'दशहरे पर कई स्थानों पर रामलीला का समापन होता है और रावण के पुतले का दहन किया जाता है।',
    practiceEn: 'At Dussehra, in many places the Ramlila comes to an end and an effigy of Ravana is burned.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'विजयादशमी — राम की विजय का दिन',
        titleEn: 'Vijayadashami — the day of Rama\'s victory',
        bodyHi: [
          'परम्परा में माना जाता है कि राम ने आश्विन शुक्ल दशमी को रावण पर विजय पाई थी। इसी विजय के स्मरण में यह दिन विजयादशमी कहलाता है।',
        ],
        bodyEn: [
          'Tradition holds that Rama won his victory over Ravana on Ashwin Shukla Dashami. In memory of that victory, this day is called Vijayadashami.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'itihas',
        titleHi: 'रामलीला और पुतला-दहन',
        titleEn: 'Ramlila and the burning of effigies',
        bodyHi: [
          'राम-कथा का मंचन, रामलीला, उत्तर भारत की पुरानी परम्परा है। रावण के विशाल पुतले बड़े पैमाने पर जलाने का चलन 20वीं सदी में फैला।',
        ],
        bodyEn: [
          'Ramlila, the staging of the Rama story, is an old tradition of north India. The practice of burning huge effigies of Ravana on a large scale spread in the 20th century.',
        ],
        canonHi: 'इतिहास · रामलीला पुरानी परम्परा; बड़े पैमाने पर पुतला-दहन 20वीं सदी',
        canonEn: 'History · Ramlila an old tradition; large-scale effigy burning 20th century',
      },
    ],
    bhavHi: 'रावण-दहन बुराई पर अच्छाई की विजय का सामूहिक, दृश्य स्मरण है।',
    bhavEn: 'Burning Ravana is a shared, visible reminder of the victory of good over evil.',
    anchors: {
      masa: [7],
      kathaIds: [
        'dussehra-katha',
      ],
      ruleIds: [
        'dussehra',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | History · Ramlila an old tradition; large-scale effigy burning 20th century. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'AS5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'दशहरे पर शमी पूजन, शस्त्र पूजा और आपटे के पत्ते \'सोना\' क्यों?',
    questionEn: 'Why worship the shami tree and weapons at Dussehra, and why call apta leaves \'gold\'?',
    practiceHi: 'दशहरे पर शमी वृक्ष और शस्त्रों तथा औज़ारों की पूजा होती है। महाराष्ट्र में आपटे के पत्ते \'सोना\' कहकर एक-दूसरे को दिए जाते हैं।',
    practiceEn: 'At Dussehra, the shami tree, weapons and tools are worshipped. In Maharashtra, people give one another apta leaves, calling them \'gold\'.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'शमी में छिपे पाण्डवों के शस्त्र',
        titleEn: 'The Pandavas\' weapons hidden in the shami tree',
        bodyHi: [
          'अज्ञातवास से पहले पाण्डवों ने अपने अस्त्र-शस्त्र एक शमी वृक्ष पर छिपा दिए। अज्ञातवास के अन्त में अर्जुन ने वहीं से गाण्डीव उतारा और विराट की गायें छुड़ाने के युद्ध में कौरवों को परास्त किया। दशहरे का शमी-पूजन और शस्त्र-पूजन इसी कथा से जोड़ा जाता है।',
        ],
        bodyEn: [
          'Before their period of living in disguise, the Pandavas hid their weapons in a shami tree. At the end of that period, Arjuna took down the Gandiva from that very tree and defeated the Kauravas in the battle to free Virata\'s cows. The worship of the shami and of weapons at Dussehra is linked to this story.',
        ],
        canonHi: 'महाभारत, विराट पर्व',
        canonEn: 'Mahabharata, Virata Parva',
      },
      {
        tier: 'lok',
        regionHi: 'महाराष्ट्र',
        regionEn: 'Maharashtra',
        titleHi: 'रघु, कौत्स और सोने की वर्षा',
        titleEn: 'Raghu, Kautsa and the rain of gold',
        bodyHi: [
          'राजा रघु अपना सारा धन दान कर चुके थे, तभी ऋषि-शिष्य कौत्स गुरु-दक्षिणा के लिए धन माँगने आए। रघु ने कुबेर पर चढ़ाई की तैयारी की, और रात में ही उनके कोष में सोने की वर्षा हो गई। महाराष्ट्र की लोक-परम्परा में यह सोना आपटे और शमी के वृक्षों पर बरसा माना जाता है, इसलिए दशहरे पर आपटे के पत्ते \'सोना\' कहकर बाँटे जाते हैं।',
        ],
        bodyEn: [
          'King Raghu had already given away all his wealth when Kautsa, a sage\'s disciple, came to ask him for wealth for his guru\'s fee. Raghu prepared to march against Kubera, and that very night gold rained down into his treasury. In the folk tradition of Maharashtra, this gold is believed to have rained onto apta and shami trees, which is why apta leaves are shared as \'gold\' at Dussehra.',
        ],
        canonHi: 'लोक-परम्परा (महाराष्ट्र) · कथा का मूल: रघुवंश',
        canonEn: 'Folk tradition (Maharashtra) · Source of the story: Raghuvamsha',
      },
    ],
    bhavHi: 'छिपे शस्त्र और बरसा सोना, दोनों कथाएँ धैर्य और उदारता के बाद मिलने वाली विजय और समृद्धि का भाव देती हैं।',
    bhavEn: 'The hidden weapons and the rain of gold both convey the victory and prosperity that come after patience and generosity.',
    anchors: {
      masa: [7],
      kathaIds: [
        'dussehra-katha',
      ],
      ruleIds: [
        'dussehra',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Mahabharata, Virata Parva | Folk tradition (Maharashtra) · Source of the story: Raghuvamsha. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'AS6',
    axis: 'masa',
    kind: 'manyata',
    phase: 2,
    questionHi: 'दशहरे पर नीलकण्ठ पक्षी का दर्शन क्यों?',
    questionEn: 'Why do people hope to see a neelkanth bird on Dussehra?',
    practiceHi: 'दशहरे के दिन नीलकण्ठ पक्षी को देखना कई क्षेत्रों में शुभ माना जाता है, और लोग उसके दर्शन की प्रतीक्षा करते हैं।',
    practiceEn: 'In many regions, seeing a neelkanth bird on Dussehra is considered auspicious, and people wait for a sight of it.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'नीलकण्ठ पक्षी और शिव',
        titleEn: 'The neelkanth bird and Shiva',
        bodyHi: [
          'लोक में नीलकण्ठ पक्षी को उसके नाम और नीले पंखों के कारण शिव के नीलकण्ठ रूप से जोड़ा जाता है — वही शिव, जिन्होंने विष पीकर संसार की रक्षा की। इसलिए विजय के पर्व दशहरे पर इसका दर्शन विजय और मंगल का संकेत माना जाता है।',
        ],
        bodyEn: [
          'In folk belief, the neelkanth bird is linked to Shiva\'s Neelkanth form because of its name and its blue feathers — the same Shiva who drank poison to protect the world. So on Dussehra, the festival of victory, seeing it is taken as a sign of victory and good fortune.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'उड़ते पक्षी में शिव के रूप को देखना प्रकृति में देवत्व खोजने का लोक-भाव है।',
    bhavEn: 'Seeing a form of Shiva in a bird in flight is a folk way of finding the divine in nature.',
    anchors: {
      masa: [7],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'AS7',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'मैसूर, कुल्लू और बस्तर का दशहरा अलग क्यों है?',
    questionEn: 'Why is Dussehra different in Mysore, Kullu and Bastar?',
    practiceHi: 'कुछ क्षेत्रों में दशहरा अपने विशिष्ट रूप में मनाया जाता है — मैसूर में चामुण्डेश्वरी की शोभायात्रा, कुल्लू में रघुनाथ जी की रथयात्रा और बस्तर में लगभग 75 दिन का दन्तेश्वरी उत्सव।',
    practiceEn: 'In some regions Dussehra is celebrated in its own distinct way: the procession of Chamundeshwari in Mysore, the chariot procession of Raghunath ji in Kullu, and the Danteshwari festival of about 75 days in Bastar.',
    kathas: [
      {
        tier: 'itihas',
        regionHi: 'मैसूर (कर्नाटक)',
        regionEn: 'Mysore (Karnataka)',
        titleHi: 'मैसूर दसरा — चामुण्डेश्वरी की विजय',
        titleEn: 'Mysore Dasara — Chamundeshwari\'s victory',
        bodyHi: [
          'मैसूर में दशहरा देवी चामुण्डेश्वरी की महिषासुर पर विजय के उत्सव के रूप में मनाया जाता है; नगर का नाम भी महिषासुर से जुड़ा माना जाता है। वोडेयार राजवंश ने 1610 में इसे राजकीय उत्सव के रूप में आरम्भ किया, और विजयादशमी को हाथी पर देवी की शोभायात्रा निकलती है।',
        ],
        bodyEn: [
          'In Mysore, Dussehra is celebrated as the festival of the goddess Chamundeshwari\'s victory over Mahishasura; the city\'s name is also believed to be linked to Mahishasura. The Wodeyar dynasty began it as a royal festival in 1610, and on Vijayadashami the goddess is taken out in procession on an elephant.',
        ],
        canonHi: 'इतिहास · मैसूर दशहरा, वोडेयार राजवंश, 1610',
        canonEn: 'History · Mysore Dussehra, Wodeyar dynasty, 1610',
      },
      {
        tier: 'lok',
        regionHi: 'कुल्लू (हिमाचल प्रदेश)',
        regionEn: 'Kullu (Himachal Pradesh)',
        titleHi: 'कुल्लू दशहरा — रघुनाथ जी की यात्रा',
        titleEn: 'Kullu Dussehra — Raghunath ji\'s procession',
        bodyHi: [
          'कुल्लू में दशहरा विजयादशमी से आरम्भ होकर कई दिन चलता है। रघुनाथ जी (राम) की रथयात्रा इसका केन्द्र है, जिसमें घाटी के अनेक गाँवों से स्थानीय देवता पालकियों में आकर सम्मिलित होते हैं।',
        ],
        bodyEn: [
          'In Kullu, Dussehra begins on Vijayadashami and goes on for several days. At its heart is the chariot procession of Raghunath ji (Rama), joined by local deities who arrive in palanquins from many villages of the valley.',
        ],
        canonHi: 'लोक-परम्परा (कुल्लू)',
        canonEn: 'Folk tradition (Kullu)',
      },
      {
        tier: 'lok',
        regionHi: 'बस्तर (छत्तीसगढ़)',
        regionEn: 'Bastar (Chhattisgarh)',
        titleHi: 'बस्तर दशहरा — दन्तेश्वरी',
        titleEn: 'Bastar Dussehra — Danteshwari',
        bodyHi: [
          'बस्तर का दशहरा लगभग 75 दिन चलता है और इसकी आराध्या देवी दन्तेश्वरी हैं; इसका केन्द्र राम-रावण कथा नहीं है। विशाल लकड़ी के रथ की परिक्रमा और अंचल के आदिवासी समुदायों की भागीदारी इसकी पहचान है।',
        ],
        bodyEn: [
          'Dussehra in Bastar lasts about 75 days, and its presiding goddess is Danteshwari; the story of Rama and Ravana is not at its centre. It is known for the circling of a huge wooden chariot and the participation of the region\'s Adivasi communities.',
        ],
        canonHi: 'लोक-परम्परा (बस्तर)',
        canonEn: 'Folk tradition (Bastar)',
      },
    ],
    bhavHi: 'एक ही पर्व हर क्षेत्र में अपने देवता और अपने इतिहास के साथ अलग रूप लेता है।',
    bhavEn: 'The same festival takes a different form in each region, with its own deity and its own history.',
    anchors: {
      masa: [7],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: History · Mysore Dussehra, Wodeyar dynasty, 1610 | Folk tradition (Kullu) | Folk tradition (Bastar). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'AS8',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'शरद पूर्णिमा पर खीर चाँदनी में क्यों रखते हैं?',
    questionEn: 'Why do people leave kheer out in the moonlight on Sharad Purnima?',
    practiceHi: 'आश्विन पूर्णिमा, यानी शरद पूर्णिमा की रात खीर बनाकर चाँदनी में रखी जाती है और बाद में प्रसाद के रूप में ली जाती है। कई क्षेत्रों में इस रात लक्ष्मी-पूजा और जागरण होता है।',
    practiceEn: 'On Ashwin Purnima, that is, Sharad Purnima, kheer is made and left out in the moonlight at night, and later taken as prasad. In many regions there is Lakshmi puja and a night vigil on this night.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'सोलह कलाओं का चन्द्रमा',
        titleEn: 'The moon of sixteen kalas',
        bodyHi: [
          'मान्यता है कि शरद पूर्णिमा को चन्द्रमा अपनी सोलह कलाओं से पूर्ण होता है और उसकी चाँदनी में अमृत बरसता है। इसलिए खीर बनाकर रात भर चाँदनी में रखी जाती है और फिर प्रसाद के रूप में ग्रहण की जाती है।',
        ],
        bodyEn: [
          'It is believed that on Sharad Purnima the moon is complete with all sixteen of its kalas, and that nectar rains down in its light. So kheer is made and left in the moonlight all night, then taken as prasad.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'purana',
        titleHi: 'कृष्ण का महारास',
        titleEn: 'Krishna\'s Maharaas',
        bodyHi: [
          'शरद ऋतु की चाँदनी रात में कृष्ण ने वृन्दावन में बाँसुरी बजाई, और उसे सुनकर गोपियाँ घर-बार छोड़कर चली आईं। यमुना तट पर कृष्ण ने उनके साथ महारास किया।',
        ],
        bodyEn: [
          'On a moonlit night in autumn, Krishna played his flute in Vrindavan, and hearing it the gopis left their homes and came to him. On the banks of the Yamuna, Krishna danced the Maharaas with them.',
        ],
        canonHi: 'श्रीमद्भागवत पुराण 10.29–33',
        canonEn: 'Bhagavata Purana 10.29–33',
      },
      {
        tier: 'lok',
        titleHi: 'कोजागरी — कौन जाग रहा है?',
        titleEn: 'Kojagari — who is awake?',
        bodyHi: [
          'लोक-मान्यता है कि इस रात लक्ष्मी पृथ्वी पर घूमकर पूछती हैं — कौन जाग रहा है? जो जागकर उनका स्मरण करता है, उसके घर वे आती हैं। इसी से इसे कोजागरी पूर्णिमा कहते हैं और कई घरों में रात भर जागरण होता है।',
        ],
        bodyEn: [
          'Folk belief holds that on this night Lakshmi roams the earth and asks, \'Who is awake?\' She comes to the home of whoever stays awake and remembers her. This is why it is called Kojagari Purnima, and many homes keep vigil all night.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'पूर्ण चन्द्रमा की शीतल चाँदनी को प्रसाद में उतार लेना प्रकृति की पूर्णता को घर तक लाने का भाव है।',
    bhavEn: 'Drawing the cool light of the full moon into the prasad expresses bringing nature\'s fullness home.',
    anchors: {
      masa: [7],
      kathaIds: [
        'sharad-purnima-vrat-katha',
        'kojagara-puja-katha',
      ],
      ruleIds: [
        'sharad-purnima',
        'kojagara-puja',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | Bhagavata Purana 10.29–33 | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'M1',
    axis: 'masa',
    kind: 'manyata',
    phase: 2,
    questionHi: 'मार्गशीर्ष को सब महीनों में श्रेष्ठ क्यों माना जाता है?',
    questionEn: 'Why is Margashirsha considered the best of all months?',
    practiceHi: 'मार्गशीर्ष, जिसे अगहन भी कहते हैं, को परम्परा में सब महीनों में श्रेष्ठ माना जाता है।',
    practiceEn: 'Margashirsha, also called Aghan, is regarded in tradition as the best of all months.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'महीनों में मार्गशीर्ष',
        titleEn: 'Margashirsha among the months',
        bodyHi: [
          'गीता के दसवें अध्याय में श्रीकृष्ण अर्जुन को अपनी विभूतियाँ बताते हैं — हर वर्ग में जो सबसे उत्तम है, उसमें वे स्वयं प्रकट हैं।',
          'इसी क्रम में वे कहते हैं कि महीनों में मैं मार्गशीर्ष हूँ और ऋतुओं में वसन्त। भगवान के इसी कथन के कारण परम्परा इस मास को विशेष मानती है।',
        ],
        bodyEn: [
          'In the tenth chapter of the Gita, Krishna tells Arjuna of his divine glories: in every kind of thing, he himself is present in whatever is finest.',
          'In the same passage he says that among months he is Margashirsha, and among seasons he is spring. Because of these words of the Lord, tradition holds this month to be special.',
        ],
        canonHi: 'श्रीमद्भगवद्गीता 10.35',
        canonEn: 'Bhagavad Gita 10.35',
        referenceUrls: ['https://www.holy-bhagavad-gita.org/chapter/10/verse/35/', 'https://vedabase.io/en/library/bg/10/35/'],
        ref: {
          kind: 'gita',
          chapter: 10,
          verseIndex: 34,
        },
      },
    ],
    bhavHi: 'जो हर वर्ग में सबसे उत्तम है, उसमें ईश्वर की झलक देखना — मार्गशीर्ष का मान इसी दृष्टि से जुड़ा है।',
    bhavEn: 'Seeing a glimpse of God in whatever is finest in every kind of thing — the honour given to Margashirsha comes from this way of seeing.',
    anchors: {
      masa: [9],
    },
    status: 'verified',
    source: {
      referenceUrls: [
        'repo:mobile/src/data/gita/chapter-10.json',
        'https://www.holy-bhagavad-gita.org/chapter/10/verse/35/',
        'https://vedabase.io/en/library/bg/10/35/',
      ],
      verificationNote: '2026-10-28: Opened Mukundananda’s Holy Bhagavad Gita and Prabhupada/BBT’s Vedabase, each at 10.35; collated the existing bundled verse at index 34. Month/season identifications agree. IIT Kanpur’s verse page was inaccessible and is not counted. Existing ref retained; no verse text entered into the row.',
      confidence: 'Certain',
    },
  },
  {
    id: 'M2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'गीता जयंती मोक्षदा एकादशी को ही क्यों मनाई जाती है?',
    questionEn: 'Why is Gita Jayanti celebrated on Mokshada Ekadashi in particular?',
    practiceHi: 'मार्गशीर्ष शुक्ल एकादशी, जिसे मोक्षदा एकादशी कहते हैं, गीता जयंती के रूप में मनाई जाती है। इस दिन कई जगह गीता का पाठ होता है।',
    practiceEn: 'Margashirsha Shukla Ekadashi, known as Mokshada Ekadashi, is celebrated as Gita Jayanti. On this day the Gita is recited in many places.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'जिस दिन गीता कही गई',
        titleEn: 'The day the Gita was spoken',
        bodyHi: [
          'कुरुक्षेत्र के युद्ध-क्षेत्र में, युद्ध आरम्भ होने से ठीक पहले, श्रीकृष्ण ने दुविधा में पड़े अर्जुन को गीता का उपदेश दिया।',
          'परम्परा में माना जाता है कि यह उपदेश मार्गशीर्ष शुक्ल एकादशी को दिया गया था, इसलिए यही तिथि गीता की जयंती मानी जाती है।',
        ],
        bodyEn: [
          'On the battlefield of Kurukshetra, just before the war began, Krishna gave the teaching of the Gita to Arjuna, who was caught in doubt.',
          'Tradition holds that this teaching was given on Margashirsha Shukla Ekadashi, so this date is regarded as the Gita\'s jayanti, or birthday.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
        referenceUrls: ['https://www.drikpanchang.com/festivals/gita-jayanti/gita-jayanti-date-time.html?geoname-id=1273294', 'https://www.iskconbangalore.org/gita-jayanti/'],
      },
    ],
    bhavHi: 'गीता को एक तिथि से जोड़कर याद करना हर वर्ष उसके उपदेश को फिर से पढ़ने का अवसर बन जाता है।',
    bhavEn: 'Remembering the Gita by linking it to a date turns every year into a chance to read its teaching again.',
    anchors: {
      masa: [9],
      kathaIds: [
        'gita-jayanti-katha',
      ],
      ruleIds: [
        'gita-jayanti',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.drikpanchang.com/festivals/gita-jayanti/gita-jayanti-date-time.html?geoname-id=1273294', 'https://www.iskconbangalore.org/gita-jayanti/'],
      verificationNote: '2026-10-28: Read Drik Panchang’s Gita Jayanti/Mokshada listing and ISKCON Bangalore’s Gita Jayanti observance and advent account. They independently describe the anniversary/teaching tradition and keep the same date. This verifies a festival tradition, not a historically established battle date. ISKCON Dwarka returned 406/timeout and is not cited.',
      confidence: 'Likely',
    },
  },
  {
    id: 'M3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'विवाह पंचमी पर मिथिला में बेटी का विवाह क्यों नहीं करते?',
    questionEn: 'Why don\'t families in Mithila marry off a daughter on Vivah Panchami?',
    practiceHi: 'मार्गशीर्ष शुक्ल पंचमी को राम-सीता का विवाहोत्सव मनाया जाता है। मिथिला में कई परिवार इस दिन अपनी बेटी का विवाह नहीं करते।',
    practiceEn: 'Margashirsha Shukla Panchami is celebrated as the wedding festival of Rama and Sita. In Mithila, many families do not hold their daughter\'s wedding on this day.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'राम-सीता विवाह की तिथि',
        titleEn: 'The date of Rama and Sita\'s wedding',
        bodyHi: [
          'विवाह पंचमी राम-सीता के विवाह का वार्षिक उत्सव है। मिथिला में वैदेही-विवाह के गीत और आयोजन इस स्मृति को सँजोते हैं।',
          'परम्परा में मार्गशीर्ष शुक्ल पंचमी को इसी विवाह की तिथि माना जाता है, और अयोध्या व जनकपुर में इस दिन विवाहोत्सव धूमधाम से मनाया जाता है।',
        ],
        bodyEn: [
          'Vivah Panchami is the annual celebration of Rama and Sita’s wedding. Vaidehi-vivah songs and gatherings in Mithila preserve this remembrance.',
          'Tradition regards Margashirsha Shukla Panchami as the date of this wedding, and on this day the wedding festival is celebrated with great joy in Ayodhya and Janakpur.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
        referenceUrls: ['https://www.drikpanchang.com/festivals/vivah-panchami/vivah-panchami-date-time.html', 'https://indiaich-sna.in/sites/default/files/2023-11/Final%20Report_3.pdf', 'https://ndtv.in/faith/vivah-panchami-2025-par-shadi-kyo-nahin-karte-hai-is-vivah-panchami-good-for-marriage-9628167'],
      },
      {
        tier: 'lok',
        regionHi: 'मिथिला',
        regionEn: 'Mithila',
        titleHi: 'सीता के दुःख की स्मृति',
        titleEn: 'Remembering Sita\'s sorrows',
        bodyHi: [
          'मिथिला सीता का मायका है। लोक में कहा जाता है कि विवाह के बाद सीता के जीवन में वनवास, हरण और वियोग जैसे अनेक दुःख आए।',
          'उन्हीं दुःखों की स्मृति में कई मैथिल परिवार इस तिथि पर अपनी बेटी को विदा नहीं करते।',
        ],
        bodyEn: [
          'Mithila is the home Sita was born into. Folk tradition says that after her wedding, many sorrows came into Sita\'s life, such as exile, abduction and separation.',
          'In memory of those sorrows, many Maithil families do not send a daughter off in marriage on this date.',
        ],
        canonHi: 'लोक-परम्परा (मिथिला)',
        canonEn: 'Folk tradition (Mithila)',
        referenceUrls: ['https://indiaich-sna.in/sites/default/files/2023-11/Final%20Report_3.pdf', 'https://ndtv.in/faith/vivah-panchami-2025-par-shadi-kyo-nahin-karte-hai-is-vivah-panchami-good-for-marriage-9628167'],
      },
    ],
    bhavHi: 'उत्सव के दिन भी सीता के कष्टों को याद रखना दिखाता है कि लोक-स्मृति में आनन्द और करुणा साथ-साथ चलते हैं।',
    bhavEn: 'Remembering Sita\'s hardships even on a day of celebration shows that in folk memory, joy and compassion walk side by side.',
    anchors: {
      masa: [9],
      kathaIds: [
        'vivah-panchami-katha',
      ],
      ruleIds: [
        'vivah-panchami',
      ],
    },
    status: 'verified',
    source: {
      referenceUrls: ['https://www.drikpanchang.com/festivals/vivah-panchami/vivah-panchami-date-time.html', 'https://indiaich-sna.in/sites/default/files/2023-11/Final%20Report_3.pdf', 'https://ndtv.in/faith/vivah-panchami-2025-par-shadi-kyo-nahin-karte-hai-is-vivah-panchami-good-for-marriage-9628167'],
      verificationNote: '2026-10-28: Opened Drik’s wedding-festival account; Vibha Rani’s Sangeet Natak Akademi fieldwork report, printed p7 (PDF p6), quoting Taranand Viyogi; and Madhukar Mishra’s NDTV report interviewing Rajnath Jha. Two separately reported local informants describe the avoidance tradition. Cut the unrelated bow detail; kept date and wedding as commemorative tradition, not a dated epic fact. Describes some families only and gives no marriage verdict.',
      confidence: 'Likely',
    },
  },
  {
    id: 'M4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'काल भैरव अष्टमी पर कुत्तों को भोजन क्यों कराते हैं?',
    questionEn: 'Why do people feed dogs on Kaal Bhairav Ashtami?',
    practiceHi: 'काल भैरव अष्टमी को भैरव की पूजा होती है, और कई लोग इस दिन कुत्तों को भोजन कराते हैं।',
    practiceEn: 'Bhairava is worshipped on Kaal Bhairav Ashtami, and many people feed dogs on this day.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'भैरव का प्राकट्य',
        titleEn: 'The appearance of Bhairava',
        bodyHi: [
          'शिव पुराण की कथा के अनुसार ब्रह्मा के अहंकार को शान्त करने के लिए शिव से भैरव प्रकट हुए, और उन्होंने ब्रह्मा का पाँचवाँ सिर काट दिया।',
          'परम्परा में इसी प्राकट्य के दिन को काल भैरव अष्टमी कहा जाता है। काशी में भैरव को नगर का कोतवाल माना जाता है, और श्वान (कुत्ता) उनका वाहन है — इसलिए इस दिन कुत्तों को भोजन कराना भैरव की सेवा माना जाता है।',
        ],
        bodyEn: [
          'According to the story in the Shiva Purana, Bhairava emerged from Shiva to subdue Brahma\'s pride, and he cut off Brahma\'s fifth head.',
          'Tradition calls the day of this appearance Kaal Bhairav Ashtami. In Kashi, Bhairava is regarded as the city\'s kotwal, its chief guardian, and the dog is his mount — so feeding dogs on this day is seen as service to Bhairava.',
        ],
        canonHi: 'शिव पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Shiva Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'भैरव की पूजा में उनके वाहन तक सेवा पहुँचाना, देवता के साथ उनसे जुड़े हर जीव को आदर देने का भाव है।',
    bhavEn: 'Carrying service in Bhairava\'s worship all the way to his mount expresses respect for the deity and for every creature linked to him.',
    anchors: {
      masa: [9],
      ruleIds: [
        'kaal-bhairav-jayanti',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. Opened Shastri/Wisdomlib and Wikisource Sanskrit, Shiva Purana Shatarudra 8, for Bhairava’s origin and Kashi guardianship. Those passages do not establish the draft’s dog-feeding/date explanation. To open: two independent published accounts of that custom and its explanation; split the Purana origin from the customary dog/vehicle story before verification. No source-access outage is claimed.',
      confidence: 'Certain',
    },
  },
  {
    id: 'M5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'मार्गशीर्ष के गुरुवार को महालक्ष्मी व्रत क्यों रखते हैं?',
    questionEn: 'Why do people keep the Mahalakshmi fast on Thursdays in Margashirsha?',
    practiceHi: 'महाराष्ट्र में मार्गशीर्ष मास के हर गुरुवार को महालक्ष्मी की पूजा और व्रत होता है, और व्रत-कथा पढ़ी जाती है।',
    practiceEn: 'In Maharashtra, on every Thursday of the month of Margashirsha, Mahalakshmi is worshipped, a fast is kept, and the vrat katha, the story of the fast, is read.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'महाराष्ट्र',
        regionEn: 'Maharashtra',
        titleHi: 'मार्गशीर्ष गुरुवार की व्रत-कथा',
        titleEn: 'The vrat katha of Margashirsha Thursdays',
        bodyHi: [
          'यह व्रत महाराष्ट्र की लोक-परम्परा से आता है; मार्गशीर्ष के गुरुवारों को घर-घर महालक्ष्मी की व्रत-कथा पढ़ी जाती है।',
          'कथा की पोथियों के पाठ अलग-अलग मिलते हैं, पर सबका भाव यही है कि श्रद्धा से की गई पूजा पर लक्ष्मी प्रसन्न होती हैं।',
        ],
        bodyEn: [
          'This fast comes from the folk tradition of Maharashtra. On the Thursdays of Margashirsha, the Mahalakshmi vrat katha is read in home after home.',
          'The texts of the katha booklets vary, but the spirit of them all is the same: Lakshmi is pleased by worship offered with devotion.',
        ],
        canonHi: 'लोक-परम्परा (महाराष्ट्र)',
        canonEn: 'Folk tradition (Maharashtra)',
      },
    ],
    bhavHi: 'महीने भर हर गुरुवार दोहराया गया व्रत घर में श्रद्धा का एक नियमित क्रम बनाता है।',
    bhavEn: 'A fast repeated every Thursday through the month creates a steady rhythm of devotion in the home.',
    anchors: {
      masa: [9],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. This is still a generic description, not a collated vrat narrative. To open: a named published Margashirsha Thursday katha booklet and an independent publication of its telling/custom. The draft’s assertion about all booklet versions has not been established. Calendar search leads alone cannot verify it.',
      confidence: 'Guessing',
    },
  },
  {
    id: 'P1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'खरमास में विवाह क्यों नहीं होते?',
    questionEn: 'Why aren\'t weddings held during Kharmas?',
    practiceHi: 'सूर्य जब धनु या मीन राशि में रहते हैं, उस लगभग एक महीने को खरमास कहते हैं। ज्योतिष-परम्परा में इस अवधि में विवाह जैसे मांगलिक कार्यों के मुहूर्त प्रायः नहीं निकाले जाते।',
    practiceEn: 'The roughly one-month period when the sun is in the sign of Dhanu or Meena is called Kharmas. In the astrological tradition, auspicious dates for ceremonies such as weddings are generally not fixed during this period.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'सूर्य के घोड़े और खर',
        titleEn: 'The sun\'s horses and the donkeys',
        bodyHi: [
          'लोक-कथा के अनुसार सूर्य सात घोड़ों वाले रथ पर बिना रुके चलते हैं, क्योंकि उनके रुकने से संसार की गति थम जाए।',
          'एक बार घोड़े थककर प्यासे हो गए, तो सूर्य ने उन्हें विश्राम के लिए खोल दिया और रथ में खर (गधे) जोत दिए। खरों के कारण रथ धीमा चला, और यह धीमा महीना \'खरमास\' कहलाया।',
        ],
        bodyEn: [
          'According to a folk tale, the sun travels without stopping in a chariot drawn by seven horses, because if he stopped, the world would come to a standstill.',
          'Once the horses grew tired and thirsty, so the sun unyoked them to rest and harnessed khar, or donkeys, to the chariot instead. Because of the donkeys the chariot moved slowly, and this slow month came to be called \'Kharmas\'.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'लोक-कथा इस महीने को सूर्य के धीमे चलने का समय बताती है, और परम्परा इस ठहराव में बड़े नए आरम्भ आगे के लिए रख देती है।',
    bhavEn: 'Folk story describes this month as a time when the sun moves slowly, and in this pause tradition sets big new beginnings aside for later.',
    anchors: {
      masa: [10],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. Opened BhaktiBharat Kharmas page: it describes Dhanu/Meena and wedding avoidance but does not contain the horses-and-donkeys episode. A search snippet is not evidence. Two independently published tellings of that episode remain uncollated.',
      confidence: 'Guessing',
    },
  },
  {
    id: 'P2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'लोहड़ी पर अलाव के चारों ओर दुल्ला भट्टी के गीत क्यों गाते हैं?',
    questionEn: 'Why do people sing songs of Dulla Bhatti around the bonfire on Lohri?',
    practiceHi: 'लोहड़ी की रात अलाव जलाया जाता है; लोग उसके चारों ओर गीत गाते हैं और रेवड़ी, मूँगफली व तिल अग्नि में डालकर आपस में बाँटते हैं।',
    practiceEn: 'On the night of Lohri a bonfire is lit. People sing songs around it, offer rewri, peanuts and sesame to the fire, and share them with one another.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'पंजाब',
        regionEn: 'Punjab',
        titleHi: 'दुल्ला भट्टी',
        titleEn: 'Dulla Bhatti',
        bodyHi: [
          'पंजाब की लोक-स्मृति में दुल्ला भट्टी सुन्दरी और मुन्दरी नाम की लड़कियों के रक्षक हैं। लोक-कथा में वे उन्हें मुग़ल दरबार के लिए ले जाए जाने से बचाते हैं और पिता की तरह उनके विवाह करवाते हैं।',
          'लोहड़ी पर गाए जाने वाले गीत \'सुन्दर मुन्दरिये\' में उन्हीं का नाम आता है, और अलाव के चारों ओर यह गीत गाकर उन्हें याद किया जाता है।',
        ],
        bodyEn: [
          'In Punjab\'s folk memory, Dulla Bhatti protects the girls Sundri and Mundri. In the folk telling, he saves them from being taken to the Mughal court and arranges their weddings as a father would.',
          'His name appears in \'Sunder Mundriye\', the song sung on Lohri, and he is remembered by singing this song around the bonfire.',
        ],
        canonHi: 'लोक-परम्परा (पंजाब)',
        canonEn: 'Folk tradition (Punjab)',
        referenceUrls: [
          'https://centreforcontemporaryfolklore.org/2024/09/10/dulla-bhattis-lohri-punjab/',
          'https://scroll.in/article/864736/null',
        ],
      },
    ],
    bhavHi: 'अलाव के चारों ओर गाया गीत एक लोक-नायक के साहस और करुणा को हर वर्ष फिर से जीवित कर देता है।',
    bhavEn: 'The song sung around the bonfire brings a folk hero\'s courage and compassion to life again every year.',
    anchors: {
      masa: [10],
    },
    status: 'verified',
    source: {
      referenceUrls: [
        'https://centreforcontemporaryfolklore.org/2024/09/10/dulla-bhattis-lohri-punjab/',
        'https://scroll.in/article/864736/null',
      ],
      verificationNote: '2026-10-28: Verified as Punjab folk memory against Ashmeen Bains, Centre for Contemporary Folklore (2024-09-10), and Haroon Khalid, Scroll (2018-01-12), both opened and read. Named Sundri and Mundri and their weddings; removed unsupported sale detail. This verifies a transmitted story, not the historicity of its rescue episode.',
      confidence: 'Guessing',
    },
  },
  {
    id: 'MG1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'मकर संक्रांति पर तिल-गुड़, खिचड़ी दान और स्नान क्यों?',
    questionEn: 'Why sesame and jaggery, gifts of khichdi and a holy bath on Makar Sankranti?',
    practiceHi: 'मकर संक्रांति पर तिल-गुड़ खाया और बाँटा जाता है, खिचड़ी का दान होता है, और गंगासागर जैसे तीर्थों पर स्नान किया जाता है।',
    practiceEn: 'On Makar Sankranti, sesame and jaggery are eaten and shared, khichdi is given in charity, and people bathe at pilgrimage places such as Gangasagar.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'भीष्म और उत्तरायण',
        titleEn: 'Bhishma and Uttarayana',
        bodyHi: [
          'भीष्म को इच्छा-मृत्यु का वरदान प्राप्त था। बाणों से घायल होकर शरशय्या पर पड़े भीष्म ने देह-त्याग के लिए सूर्य के उत्तरायण होने तक प्रतीक्षा की।',
          'गीता में भी उत्तरायण के छह महीनों को प्रकाश के मार्ग से जोड़ा गया है। मकर संक्रांति से सूर्य की उत्तरायण यात्रा आरम्भ मानी जाती है, इसलिए यह दिन स्नान-दान का पुण्य-काल कहलाता है।',
        ],
        bodyEn: [
          'Bhishma had been granted the boon of choosing the moment of his own death. Wounded by arrows and lying on a bed of arrows, he waited to leave his body until the sun began its northward course, Uttarayana.',
          'The Gita, too, links the six months of Uttarayana with the path of light. The sun\'s northward journey is held to begin at Makar Sankranti, so this day is called a time of merit for bathing and giving.',
        ],
        canonHi: 'महाभारत, भीष्म पर्व · श्रीमद्भगवद्गीता 8.24',
        canonEn: 'Mahabharata, Bhishma Parva · Bhagavad Gita 8.24',
        ref: {
          kind: 'gita',
          chapter: 8,
          verseIndex: 23,
        },
      },
      {
        tier: 'lok',
        titleHi: 'सूर्य और शनि का मेल',
        titleEn: 'The Sun and Shani reconciled',
        bodyHi: [
          'लोक में कहा जाता है कि मकर राशि शनि की राशि है, इसलिए इस दिन सूर्य अपने पुत्र शनि के घर जाते हैं।',
          'पिता-पुत्र के बीच पुरानी अनबन की कथा कही जाती है, और तिल को उनके मेल का माध्यम बताया जाता है। तिल-गुड़ बाँटने की परम्परा को लोग इसी मेल से जोड़ते हैं।',
        ],
        bodyEn: [
          'Folk tradition says that Makar is the sign of Shani, so on this day the Sun visits the home of his son Shani.',
          'A story is told of an old rift between father and son, and sesame is said to be what brought them together. People link the custom of sharing sesame and jaggery to this reconciliation.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'सूर्य का उत्तर की ओर मुड़ना प्रकाश की ओर बढ़ने का संकेत माना जाता है, और तिल-गुड़ उस दिन रिश्तों में मिठास का प्रतीक बनता है।',
    bhavEn: 'The sun\'s turn to the north is seen as a sign of moving towards light, and on that day sesame and jaggery become a symbol of sweetness in relationships.',
    anchors: {
      masa: [11],
      ruleIds: [
        'makar-sankranti',
      ],
      daanOccasionIds: [
        'makar-sankranti',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [
        'repo:mobile/src/data/gita/chapter-08.json',
      ],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Mahabharata, Bhishma Parva · Bhagavad Gita 8.24 | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'MG2',
    axis: 'masa',
    kind: 'bodh',
    phase: 2,
    questionHi: 'मकर संक्रांति पर पतंग क्यों उड़ाते हैं?',
    questionEn: 'Why do people fly kites on Makar Sankranti?',
    practiceHi: 'मकर संक्रांति पर कई प्रदेशों में, विशेषकर गुजरात और राजस्थान में, दिन भर छतों से पतंग उड़ाई जाती है।',
    practiceEn: 'On Makar Sankranti, in many regions and especially in Gujarat and Rajasthan, kites are flown from rooftops all day.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'आकाश की ओर मुख',
        titleEn: 'Facing the sky',
        bodyHi: [
          'मकर संक्रांति सूर्य के उत्तरायण होने का पर्व है, और यह दिन आकाश व सूर्य की ओर मुख करके मनाया जाता है।',
          'लोक में पतंग उड़ाने को इसी उल्लास से जोड़ा जाता है — खुले आकाश में, धूप में, सबके साथ।',
        ],
        bodyEn: [
          'Makar Sankranti is the festival of the sun\'s turn to Uttarayana, its northward course, and the day is celebrated facing the sky and the sun.',
          'Folk tradition links kite flying to this same joy — in the open sky, in the sunshine, together with everyone.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'श्रीराम की पतंग',
        titleEn: 'Rama\'s kite',
        bodyHi: [
          'लोक में यह कथा भी कही जाती है कि बालक राम ने पतंग उड़ाई थी।',
          'यह प्रसंग लोक-कहानियों में प्रचलित है और पतंग के उत्सव को रामकथा से जोड़ता है।',
        ],
        bodyEn: [
          'Folk tradition also tells a story that Rama flew a kite as a boy.',
          'This episode is popular in folk tales, and it links the kite festival to the story of Rama.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'पतंग उड़ाना सूर्य के उत्तरायण होने के उत्सव को खुले आकाश के आनन्द और मेल-जोल का रूप देता है।',
    bhavEn: 'Kite flying turns the festival of the sun\'s northward turn into joy under the open sky and a time of togetherness.',
    bodhHi: 'राम के पतंग उड़ाने का प्रसंग अक्सर एक प्रसिद्ध रामकथा-ग्रन्थ का बताया जाता है, पर उसका मूल पाठ अभी सत्यापित नहीं हो सका है; इसलिए यहाँ इसे लोक-कथा के रूप में रखा गया है।',
    bodhEn: 'The episode of Rama flying a kite is often attributed to a well-known text of the Rama story, but its original passage has not yet been verified, so it is kept here as a folk story.',
    anchors: {
      masa: [11],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'MG3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'पोंगल पर दूध-चावल को उफनने क्यों देते हैं?',
    questionEn: 'Why do people let the milk and rice boil over at Pongal?',
    practiceHi: 'तमिलनाडु में पोंगल पर नई फ़सल के चावल को दूध और गुड़ के साथ पकाकर उफनने दिया जाता है और सूर्य को अर्पित किया जाता है। अगले दिन, मट्टु पोंगल पर, गाय-बैलों को नहलाकर और सजाकर उनकी पूजा होती है।',
    practiceEn: 'In Tamil Nadu at Pongal, rice from the new harvest is cooked with milk and jaggery, allowed to boil over, and offered to the sun. The next day, on Mattu Pongal, cows and bullocks are bathed, decorated and worshipped.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'तमिलनाडु',
        regionEn: 'Tamil Nadu',
        titleHi: 'उफनता पोंगल',
        titleEn: 'The overflowing Pongal',
        bodyHi: [
          '\'पोंगल\' का अर्थ ही है उफनना। नए बर्तन में पकता दूध-चावल जब उफनकर बाहर गिरता है, तो लोग \'पोंगलो पोंगल\' पुकारकर उसका स्वागत करते हैं।',
          'उफान को घर में समृद्धि के उमड़ने का संकेत माना जाता है।',
        ],
        bodyEn: [
          '\'Pongal\' itself means to boil over. When the milk and rice cooking in a new pot boil over and spill out, people welcome it with the call \'Pongalo Pongal\'.',
          'The overflow is seen as a sign of prosperity welling up in the home.',
        ],
        canonHi: 'लोक-परम्परा (तमिलनाडु)',
        canonEn: 'Folk tradition (Tamil Nadu)',
      },
      {
        tier: 'lok',
        regionHi: 'तमिलनाडु',
        regionEn: 'Tamil Nadu',
        titleHi: 'नन्दी और मट्टु पोंगल',
        titleEn: 'Nandi and Mattu Pongal',
        bodyHi: [
          'लोक-कथा के अनुसार शिव ने नन्दी को पृथ्वी पर यह सन्देश देकर भेजा कि मनुष्य रोज़ तेल लगाकर स्नान करें और महीने में एक बार भोजन करें।',
          'नन्दी ने उलटा कह दिया — रोज़ भोजन और महीने में एक बार स्नान। तब शिव ने शाप दिया कि नन्दी पृथ्वी पर रहकर हल खींचेंगे, ताकि मनुष्यों के लिए अधिक अन्न उग सके; मट्टु पोंगल पर बैलों का सम्मान इसी कथा से जोड़ा जाता है।',
        ],
        bodyEn: [
          'According to a folk tale, Shiva sent Nandi to earth with a message: people were to bathe with oil every day and eat once a month.',
          'Nandi said it the wrong way round — eat every day and bathe once a month. Then Shiva cursed Nandi to live on earth and pull the plough, so that more grain could grow for people. The honouring of bullocks on Mattu Pongal is linked to this story.',
        ],
        canonHi: 'लोक-परम्परा (तमिलनाडु)',
        canonEn: 'Folk tradition (Tamil Nadu)',
      },
    ],
    bhavHi: 'उफनता पात्र और सजे हुए बैल — दोनों उस अन्न के प्रति कृतज्ञता हैं जो धरती, सूर्य और पशुओं के श्रम से मिलता है।',
    bhavEn: 'The overflowing pot and the decorated bullocks both express gratitude for the food that comes from the earth, the sun and the labour of animals.',
    anchors: {
      masa: [11],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Tamil Nadu) | Folk tradition (Tamil Nadu). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'MG4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'माघ में प्रयाग के संगम पर कल्पवास क्यों करते हैं?',
    questionEn: 'Why do people observe kalpavas at the Sangam in Prayag during Magh?',
    practiceHi: 'माघ मास में प्रयागराज के संगम-तट पर माघ मेला लगता है। कल्पवासी पूरा महीना वहीं रहकर संयम, स्नान और भजन में बिताते हैं।',
    practiceEn: 'In the month of Magh, the Magh Mela is held on the banks of the Sangam at Prayagraj. Kalpavasis stay there for the whole month, spending it in restraint, bathing and devotional singing.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'संगम पर एक मास',
        titleEn: 'A month at the Sangam',
        bodyHi: [
          'पुराणों में माघ मास में प्रयाग के संगम पर स्नान और निवास की विशेष महिमा बताई गई है।',
          'इसी परम्परा में कल्पवासी पौष पूर्णिमा से माघ पूर्णिमा तक गंगा-यमुना के संगम के तट पर रहते हैं — दिन में एक बार सादा भोजन, प्रतिदिन संगम-स्नान, और जप-सत्संग।',
        ],
        bodyEn: [
          'The Puranas describe the special glory of bathing and staying at the Sangam in Prayag during the month of Magh.',
          'In this tradition, kalpavasis live on the banks of the confluence of the Ganga and Yamuna from Paush Purnima to Magh Purnima — eating one simple meal a day, bathing at the Sangam daily, and spending time in japa and satsang.',
        ],
        canonHi: 'पद्म पुराण / मत्स्य पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Padma Purana / Matsya Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'घर-गृहस्थी से एक महीने हटकर संगम-तट पर सादा जीवन जीना, संयम को ही तीर्थ-यात्रा बना देता है।',
    bhavEn: 'Stepping away from household life for a month to live simply on the banks of the Sangam turns restraint itself into a pilgrimage.',
    anchors: {
      masa: [11],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Padma Purana / Matsya Purana (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'MG5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'मौनी अमावस्या पर मौन क्यों रखते हैं?',
    questionEn: 'Why do people keep silent on Mauni Amavasya?',
    practiceHi: 'माघ की अमावस्या को मौनी अमावस्या कहते हैं। इस दिन कई लोग स्नान-दान करते हैं और कुछ समय या पूरे दिन मौन रहते हैं।',
    practiceEn: 'The Amavasya of Magh is called Mauni Amavasya. On this day many people bathe and give in charity, and stay silent for a while or for the whole day.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'वाणी का स्नान',
        titleEn: 'A bath for speech',
        bodyHi: [
          'परम्परा में मौन को वाणी का स्नान कहा गया है — जैसे जल शरीर को धोता है, वैसे ही मौन बोलने को विश्राम देकर मन को शान्त करता है।',
          'माघ के स्नान-पर्वों में यह दिन विशेष माना जाता है, और प्रयाग के माघ मेले में इस दिन सबसे बड़ा स्नान होता है।',
        ],
        bodyEn: [
          'Tradition calls silence a bath for speech — just as water washes the body, silence gives speech a rest and calms the mind.',
          'Among the bathing festivals of Magh this day is considered special, and the biggest bath of the Magh Mela in Prayag takes place on it.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'मौन बाहर की बातचीत को कुछ समय रोककर भीतर की ओर देखने का अवसर देता है।',
    bhavEn: 'Silence pauses outward conversation for a while and offers a chance to look within.',
    anchors: {
      masa: [11],
      kathaIds: [
        'mauni-amavasya-katha',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'MG6',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'वसन्त पंचमी पर पीले वस्त्र और अक्षरारम्भ क्यों?',
    questionEn: 'Why yellow clothes and a child\'s first letters on Vasant Panchami?',
    practiceHi: 'वसन्त पंचमी पर सरस्वती की पूजा होती है, लोग पीले वस्त्र पहनते हैं, और कई घरों में छोटे बच्चों को पहली बार अक्षर लिखवाए जाते हैं।',
    practiceEn: 'On Vasant Panchami, Saraswati is worshipped, people wear yellow clothes, and in many homes young children write their first letters.',
    kathas: [
      {
        tier: 'shastra',
        titleHi: 'ऋतुओं में वसन्त',
        titleEn: 'Spring among the seasons',
        bodyHi: [
          'गीता के दसवें अध्याय में श्रीकृष्ण अपनी विभूतियाँ बताते हुए कहते हैं कि ऋतुओं में मैं फूलों से भरी ऋतु, वसन्त, हूँ।',
          'वसन्त पंचमी इसी ऋतु के आगमन का पर्व माना जाता है।',
        ],
        bodyEn: [
          'In the tenth chapter of the Gita, describing his divine glories, Krishna says that among seasons he is the season full of flowers, spring.',
          'Vasant Panchami is regarded as the festival of this season\'s arrival.',
        ],
        canonHi: 'श्रीमद्भगवद्गीता 10.35',
        canonEn: 'Bhagavad Gita 10.35',
        ref: {
          kind: 'gita',
          chapter: 10,
          verseIndex: 34,
        },
      },
      {
        tier: 'lok',
        titleHi: 'सरस्वती का दिन',
        titleEn: 'Saraswati\'s day',
        bodyHi: [
          'यह दिन विद्या और वाणी की देवी सरस्वती का माना जाता है, इसलिए इस दिन उनकी पूजा होती है और बच्चों के अक्षरारम्भ की परम्परा है।',
          'इस समय खेतों में सरसों के पीले फूल खिले होते हैं; उसी रंग में लोग पीले वस्त्र पहनते और पीले व्यंजन बनाते हैं।',
        ],
        bodyEn: [
          'This day is regarded as belonging to Saraswati, goddess of learning and speech, so she is worshipped on it, and there is a tradition of children beginning their letters.',
          'At this time the yellow flowers of mustard are in bloom in the fields; in that same colour, people wear yellow clothes and cook yellow dishes.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'ऋतु के खिलने और विद्या के आरम्भ को एक दिन में जोड़ना, नई शुरुआत को प्रकृति के उल्लास से मिला देता है।',
    bhavEn: 'Joining the blossoming of the season and the start of learning in one day blends a new beginning with the joy of nature.',
    anchors: {
      masa: [11],
      kathaIds: [
        'vasant-panchami-katha',
      ],
      ruleIds: [
        'vasant-panchami',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [
        'repo:mobile/src/data/gita/chapter-10.json',
      ],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhagavad Gita 10.35 | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'MG7',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'रथ सप्तमी पर सिर पर आक के पत्ते रखकर स्नान क्यों?',
    questionEn: 'Why do people bathe with aak leaves on their heads on Ratha Saptami?',
    practiceHi: 'माघ शुक्ल सप्तमी, यानी रथ सप्तमी, को सूर्योदय के समय सिर पर आक के पत्ते रखकर स्नान किया जाता है और सूर्य को अर्घ्य दिया जाता है।',
    practiceEn: 'On Magh Shukla Saptami, or Ratha Saptami, people bathe at sunrise with aak leaves placed on the head and offer arghya to the sun.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'सूर्य का रथ उत्तर की ओर',
        titleEn: 'The sun\'s chariot turns north',
        bodyHi: [
          'परम्परा में माना जाता है कि इस दिन सूर्य अपने सात घोड़ों वाले रथ को उत्तर दिशा की ओर मोड़ते हैं, इसलिए इसे रथ सप्तमी कहा जाता है; कई जगह इसे सूर्य-जयन्ती भी कहते हैं।',
          'आक को संस्कृत में \'अर्क\' कहते हैं, और अर्क सूर्य का भी एक नाम है; सूर्य के इस पर्व से इन पत्तों को इसी नाते जोड़ा जाता है।',
        ],
        bodyEn: [
          'Tradition holds that on this day the sun turns his seven-horsed chariot towards the north, which is why it is called Ratha Saptami; in many places it is also called Surya Jayanti.',
          'Aak is called \'arka\' in Sanskrit, and Arka is also a name of the sun. It is through this connection that these leaves are linked to the sun\'s festival.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'सूर्य के उत्तर की ओर मुड़ने का स्वागत, सूर्य के नाम वाले पत्तों के साथ स्नान करके किया जाता है।',
    bhavEn: 'The sun\'s turn towards the north is welcomed with a bath taken with leaves that carry the sun\'s name.',
    anchors: {
      masa: [11],
      ruleIds: [
        'ratha-saptami',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'MG8',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'भीष्म अष्टमी पर सब लोग भीष्म को तर्पण क्यों देते हैं?',
    questionEn: 'Why does everyone offer tarpan to Bhishma on Bhishma Ashtami?',
    practiceHi: 'माघ शुक्ल अष्टमी (भीष्म अष्टमी) को कई लोग भीष्म पितामह के नाम से जल-तर्पण करते हैं, भले ही वे उनके वंश के न हों।',
    practiceEn: 'On Magh Shukla Ashtami (Bhishma Ashtami), many people offer water as tarpan in the name of Bhishma Pitamah, even though they are not of his line.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'निःसन्तान भीष्म का तर्पण',
        titleEn: 'Tarpan for the childless Bhishma',
        bodyHi: [
          'भीष्म ने पिता शान्तनु के लिए आजीवन विवाह न करने की प्रतिज्ञा ली थी, इसलिए उनकी कोई सन्तान नहीं हुई।',
          'परम्परा में माना जाता है कि उत्तरायण आने के बाद माघ शुक्ल अष्टमी को उन्होंने देह त्यागी। पितरों को जल देना सामान्यतः सन्तान का कर्म है; भीष्म की सन्तान नहीं थी, इसलिए इस दिन सब लोग पुत्र की तरह उन्हें जल अर्पित करते हैं।',
        ],
        bodyEn: [
          'For the sake of his father Shantanu, Bhishma took a vow not to marry for his whole life, so he had no children.',
          'Tradition holds that he left his body on Magh Shukla Ashtami, after Uttarayana had begun. Offering water to the ancestors is usually the duty of their children; Bhishma had no children, so on this day everyone offers him water as a son would.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'जिसने कुल के लिए अपना घर-संसार छोड़ दिया, उसे पूरा समाज अपनी सन्तान बनकर याद करता है।',
    bhavEn: 'The one who gave up a home and family of his own for the sake of his clan is remembered by the whole community, standing in as his children.',
    anchors: {
      masa: [11],
      ruleIds: [
        'bhishma-ashtami',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'MG9',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'षट्तिला एकादशी पर तिल का छह तरह से उपयोग क्यों?',
    questionEn: 'Why is sesame used in six ways on Shattila Ekadashi?',
    practiceHi: 'षट्तिला एकादशी पर तिल का छह तरह से उपयोग होता है — स्नान, उबटन, हवन, तर्पण, भोजन और दान में।',
    practiceEn: 'On Shattila Ekadashi, sesame is used in six ways — in bathing, in ubtan body paste, in havan, in tarpan, in food and in charity.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'तिल के छह प्रयोग',
        titleEn: 'Six uses of sesame',
        bodyHi: [
          'पद्म पुराण में षट्तिला एकादशी के प्रसंग में तिल के छह प्रयोग बताए गए हैं — तिल मिले जल से स्नान, तिल का उबटन, तिल से हवन, तिल मिले जल का अर्पण, तिल का भोजन और तिल का दान।',
          '\'षट्तिला\' नाम इन्हीं छह प्रयोगों से बना है, और इस एकादशी की कथा में दान का महत्त्व विशेष रूप से कहा गया है।',
        ],
        bodyEn: [
          'In the account of Shattila Ekadashi, the Padma Purana describes six uses of sesame — bathing in water mixed with sesame, a sesame ubtan, a havan with sesame, an offering of water mixed with sesame, eating sesame, and giving sesame in charity.',
          'The name \'Shattila\' comes from these six uses, and the story of this Ekadashi speaks especially of the importance of giving.',
        ],
        canonHi: 'पद्म पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Padma Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'एक ही वस्तु को स्नान से दान तक हर कर्म में शामिल करना, पूरे दिन को एक व्रत-भाव में पिरो देता है।',
    bhavEn: 'Bringing one thing into every act, from the bath to the giving, threads the whole day into a single spirit of observance.',
    anchors: {
      masa: [11],
      kathaIds: [
        'shattila-ekadashi-katha',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Padma Purana (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'F1',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'महाशिवरात्रि पर जागरण और बेलपत्र क्यों?',
    questionEn: 'Why the night vigil and bel leaves on Mahashivratri?',
    practiceHi: 'महाशिवरात्रि पर रात भर जागरण होता है और शिवलिंग पर बेलपत्र चढ़ाए जाते हैं।',
    practiceEn: 'On Mahashivratri, people keep a vigil all night and offer bel leaves on the Shivalinga.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'शिकारी और बेल का पेड़',
        titleEn: 'The hunter and the bel tree',
        bodyHi: [
          'एक शिकारी शिकार की प्रतीक्षा में रात भर बेल के पेड़ पर बैठा रहा। जागते रहने के लिए वह पत्ते तोड़-तोड़कर नीचे गिराता रहा; नीचे एक शिवलिंग था, और अनजाने में उस पर बेलपत्र चढ़ते रहे — वह रात शिवरात्रि थी।',
          'रात में आई एक हिरनी ने लौट आने का वचन दिया और सच में लौट आई। उसकी सच्चाई देखकर शिकारी का मन बदल गया, उसने उसे छोड़ दिया, और कथा के अनुसार अनजाने के इस जागरण और अर्पण से उस पर शिव की कृपा हुई।',
        ],
        bodyEn: [
          'A hunter sat all night in a bel tree, waiting for prey. To stay awake he kept plucking leaves and dropping them below. Beneath the tree was a Shivalinga, and without knowing it he kept offering bel leaves on it — that night was Shivaratri.',
          'A doe who came by in the night promised to come back, and she truly did return. Seeing her truthfulness, the hunter\'s heart changed and he let her go. According to the story, this unknowing vigil and offering brought him Shiva\'s grace.',
        ],
        canonHi: 'शिव पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Shiva Purana (adhyaya under review)',
      },
    ],
    bhavHi: 'कथा का भाव है कि अनजाने में किया गया जागरण और अर्पण भी शिव तक पहुँचता है, और करुणा मन को बदल देती है।',
    bhavEn: 'The spirit of the story is that even a vigil kept and an offering made unknowingly reach Shiva, and that compassion changes the heart.',
    anchors: {
      masa: [12],
      kathaIds: [
        'maha-shivaratri-vrat-katha',
      ],
      ruleIds: [
        'maha-shivaratri',
        'masik-shivaratri',
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
    id: 'F2',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'होलिका दहन में नई फ़सल की बालियाँ क्यों भूनते हैं?',
    questionEn: 'Why are ears of the new harvest roasted in the Holika Dahan fire?',
    practiceHi: 'फाल्गुन पूर्णिमा की रात होलिका जलाई जाती है, और उसकी आग में गेहूँ-जौ की नई बालियाँ भूनी जाती हैं।',
    practiceEn: 'On the night of Phalgun Purnima, Holika is burned, and new ears of wheat and barley are roasted in its fire.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'प्रह्लाद की रक्षा',
        titleEn: 'Prahlada protected',
        bodyHi: [
          'हिरण्यकशिपु ने अपने विष्णु-भक्त पुत्र प्रह्लाद को मारने के अनेक उपाय किए, पर हर बार प्रह्लाद बचे रहे।',
          'अन्त में विष्णु ने नृसिंह रूप में प्रकट होकर हिरण्यकशिपु का अन्त किया।',
        ],
        bodyEn: [
          'Hiranyakashipu tried many ways to kill his son Prahlada, a devotee of Vishnu, but each time Prahlada survived.',
          'In the end Vishnu appeared in the form of Narasimha and put an end to Hiranyakashipu.',
        ],
        canonHi: 'श्रीमद्भागवत, स्कन्ध 7',
        canonEn: 'Bhagavata Purana, Skandha 7',
      },
      {
        tier: 'lok',
        titleHi: 'होलिका का दहन',
        titleEn: 'The burning of Holika',
        bodyHi: [
          'लोक में प्रचलित कथा के अनुसार हिरण्यकशिपु की बहन होलिका को आग में न जलने का वरदान था। वह प्रह्लाद को गोद में लेकर अग्नि में बैठी; प्रह्लाद बच गए और होलिका जल गई।',
          'इसी की स्मृति में फाल्गुन पूर्णिमा की रात होलिका जलाई जाती है।',
        ],
        bodyEn: [
          'According to a popular folk story, Hiranyakashipu\'s sister Holika had a boon that fire could not burn her. She sat in the fire with Prahlada in her lap; Prahlada was saved and Holika burned.',
          'In memory of this, Holika is burned on the night of Phalgun Purnima.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'होलक — भुना हुआ नया अन्न',
        titleEn: 'Holak — roasted new grain',
        bodyHi: [
          'फाल्गुन में गेहूँ, जौ और चने की नई फ़सल पकने लगती है, और होलिका की आग में नई बालियाँ भूनकर प्रसाद की तरह बाँटी जाती हैं।',
          'आग में भुने अधपके अन्न को \'होलक\' या \'होला\' कहा जाता है, और कई लोग पर्व के नाम को इसी से जोड़ते हैं।',
        ],
        bodyEn: [
          'In Phalgun the new crop of wheat, barley and chickpeas begins to ripen, and new ears are roasted in the Holika fire and shared like prasad.',
          'Half-ripe grain roasted in the fire is called \'holak\' or \'hola\', and many people connect the festival\'s name to this word.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'अग्नि में बुराई के जलने और नए अन्न के पकने — दोनों का उत्सव एक ही रात में मनाया जाता है।',
    bhavEn: 'The burning of evil in the fire and the cooking of new grain — both are celebrated on a single night.',
    anchors: {
      masa: [12],
      kathaIds: [
        'holi-legends',
      ],
      ruleIds: [
        'holi',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Bhagavata Purana, Skandha 7 | Folk tradition | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'F3',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'होली पर रंग क्यों खेलते हैं, और बरसाना में लट्ठमार होली क्यों?',
    questionEn: 'Why do people play with colours on Holi, and why is there Lathmar Holi in Barsana?',
    practiceHi: 'होली पर एक-दूसरे को रंग और गुलाल लगाया जाता है। ब्रज के बरसाना में लट्ठमार होली खेली जाती है, जिसमें स्त्रियाँ लाठियों से पुरुषों को खदेड़ती हैं।',
    practiceEn: 'On Holi, people put colour and gulal on one another. In Barsana in Braj, Lathmar Holi is played, in which women chase men away with sticks.',
    kathas: [
      {
        tier: 'lok',
        regionHi: 'ब्रज',
        regionEn: 'Braj',
        titleHi: 'साँवले कृष्ण, गोरी राधा',
        titleEn: 'Dark Krishna, fair Radha',
        bodyHi: [
          'ब्रज की लोक-कथा में बालक कृष्ण माँ यशोदा से पूछते हैं कि वे साँवले क्यों हैं और राधा गोरी क्यों।',
          'यशोदा हँसकर कहती हैं कि जिस रंग में चाहो, राधा को भी रंग दो। रंग खेलने की परम्परा इसी प्रेम-भरी शरारत से जोड़ी जाती है।',
        ],
        bodyEn: [
          'In a Braj folk tale, the young Krishna asks his mother Yashoda why he is dark and Radha is fair.',
          'Yashoda laughs and tells him to colour Radha in whatever colour he likes. The custom of playing with colours is linked to this loving mischief.',
        ],
        canonHi: 'लोक-परम्परा (ब्रज)',
        canonEn: 'Folk tradition (Braj)',
      },
      {
        tier: 'lok',
        regionHi: 'ब्रज',
        regionEn: 'Braj',
        titleHi: 'बरसाना और नन्दगाँव',
        titleEn: 'Barsana and Nandgaon',
        bodyHi: [
          'बरसाना राधा का गाँव और नन्दगाँव कृष्ण का गाँव माना जाता है।',
          'लट्ठमार होली में नन्दगाँव के पुरुष बरसाना आते हैं और वहाँ की स्त्रियाँ लाठियों से उन्हें खदेड़ती हैं, जबकि पुरुष ढालों से बचाव करते हैं। इसे कृष्ण और उनके सखाओं की राधा व सखियों के साथ होली-लीला की स्मृति माना जाता है।',
        ],
        bodyEn: [
          'Barsana is regarded as Radha\'s village and Nandgaon as Krishna\'s.',
          'In Lathmar Holi, men from Nandgaon come to Barsana and the women there chase them off with sticks, while the men protect themselves with shields. It is seen as a memory of the Holi play of Krishna and his friends with Radha and her friends.',
        ],
        canonHi: 'लोक-परम्परा (ब्रज)',
        canonEn: 'Folk tradition (Braj)',
      },
    ],
    bhavHi: 'रंग में सबके एक-से हो जाने की यह परम्परा कृष्ण और राधा के प्रेम-भरे खेल की स्मृति है।',
    bhavEn: 'This custom of everyone becoming alike in colour is a memory of the loving play of Krishna and Radha.',
    anchors: {
      masa: [12],
      kathaIds: [
        'holi-legends',
      ],
      ruleIds: [
        'holi',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition (Braj) | Folk tradition (Braj). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'F4',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'होलाष्टक में शुभ काम क्यों नहीं करते?',
    questionEn: 'Why aren\'t auspicious ceremonies held during Holashtak?',
    practiceHi: 'होली से पहले के आठ दिन — फाल्गुन शुक्ल अष्टमी से पूर्णिमा तक — होलाष्टक कहलाते हैं; कई क्षेत्रों में इन दिनों विवाह, गृह-प्रवेश जैसे मांगलिक कार्य प्रायः नहीं किए जाते। परम्पराएँ भिन्न हैं।',
    practiceEn: 'The eight days before Holi — from Phalgun Shukla Ashtami to Purnima — are called Holashtak. In many regions, auspicious ceremonies such as weddings and housewarmings are generally not held during these days. Traditions vary.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'प्रह्लाद के आठ दिन',
        titleEn: 'Prahlada\'s eight days',
        bodyHi: [
          'लोक में कहा जाता है कि होलिका दहन से पहले के आठ दिनों में हिरण्यकशिपु ने प्रह्लाद को तरह-तरह के कष्ट दिए।',
          'इन दिनों को उसी कष्ट की स्मृति से जोड़ा जाता है।',
        ],
        bodyEn: [
          'Folk tradition says that in the eight days before Holika Dahan, Hiranyakashipu made Prahlada suffer in many ways.',
          'These days are linked to the memory of that suffering.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
      {
        tier: 'lok',
        titleHi: 'कामदेव का भस्म होना',
        titleEn: 'Kamadeva turned to ashes',
        bodyHi: [
          'एक दूसरी लोक-मान्यता इन दिनों को उस प्रसंग से जोड़ती है जब शिव की तपस्या भंग करने पर कामदेव उनके तीसरे नेत्र की अग्नि में भस्म हुए।',
          'इन दिनों को उसी शोक की स्मृति माना जाता है।',
        ],
        bodyEn: [
          'Another folk belief links these days to the episode in which Kamadeva, for disturbing Shiva\'s penance, was burned to ashes in the fire of Shiva\'s third eye.',
          'These days are regarded as a memory of that grief.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'उत्सव से पहले कुछ दिन ठहरकर कष्ट और त्याग की कथाएँ याद करना, आने वाले आनन्द को गहराई देता है।',
    bhavEn: 'Pausing for a few days before the festival to remember stories of suffering and sacrifice gives depth to the joy that follows.',
    anchors: {
      masa: [12],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Guessing',
    },
  },
  {
    id: 'F5',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'दक्षिण भारत में होली पर कामदहनम् क्यों मनाते हैं?',
    questionEn: 'Why is Kamadahanam observed at Holi in South India?',
    practiceHi: 'दक्षिण भारत के कुछ भागों में होली के समय कामदहनम् मनाया जाता है — कामदेव का प्रतीक बनाकर उसे अग्नि में जलाया जाता है।',
    practiceEn: 'In some parts of South India, Kamadahanam is observed around Holi — a symbolic figure of Kamadeva is made and burned in a fire.',
    kathas: [
      {
        tier: 'purana',
        regionHi: 'दक्षिण भारत',
        regionEn: 'South India',
        titleHi: 'काम का दहन और रति का शोक',
        titleEn: 'The burning of Kama and Rati\'s grief',
        bodyHi: [
          'तारकासुर के वध के लिए शिव-पार्वती के पुत्र का जन्म आवश्यक था, पर शिव गहरी तपस्या में थे। देवताओं के कहने पर कामदेव ने उनकी तपस्या भंग करने के लिए बाण चलाया, और शिव के तीसरे नेत्र की अग्नि ने उन्हें भस्म कर दिया।',
          'कामदेव की पत्नी रति के शोक से द्रवित होकर शिव ने आश्वासन दिया कि काम जीवित रहेगा, पर बिना शरीर के — इसीलिए वह \'अनंग\' कहलाता है।',
        ],
        bodyEn: [
          'For Tarakasura to be slain, a son of Shiva and Parvati had to be born, but Shiva was deep in penance. At the gods\' request, Kamadeva shot an arrow to break his penance, and the fire of Shiva\'s third eye burned him to ashes.',
          'Moved by the grief of Kamadeva\'s wife Rati, Shiva assured her that Kama would live on, but without a body — which is why he is called \'Ananga\'.',
        ],
        canonHi: 'शिव पुराण · कालिदास-कृत कुमारसम्भव (अध्याय समीक्षाधीन)',
        canonEn: 'Shiva Purana · Kalidasa\'s Kumarasambhava (adhyaya under review)',
      },
    ],
    bhavHi: 'कथा तप और प्रेम दोनों को सम्मान देती है — शिव की तपस्या भी अटल रही और रति का प्रेम भी व्यर्थ नहीं गया।',
    bhavEn: 'The story honours both penance and love — Shiva\'s penance held firm, and Rati\'s love was not in vain either.',
    anchors: {
      masa: [12],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Shiva Purana · Kalidasa\'s Kumarasambhava (adhyaya under review). Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Certain',
    },
  },
  {
    id: 'F6',
    axis: 'masa',
    kind: 'pratha',
    phase: 2,
    questionHi: 'आमलकी एकादशी पर आँवले की पूजा क्यों?',
    questionEn: 'Why do people worship the amla tree on Amalaki Ekadashi?',
    practiceHi: 'फाल्गुन शुक्ल एकादशी, यानी आमलकी एकादशी, को व्रत रखा जाता है और आँवले के वृक्ष की पूजा होती है।',
    practiceEn: 'On Phalgun Shukla Ekadashi, or Amalaki Ekadashi, a fast is kept and the amla tree is worshipped.',
    kathas: [
      {
        tier: 'lok',
        titleHi: 'आँसू से जन्मा वृक्ष',
        titleEn: 'The tree born of a tear',
        bodyHi: [
          'लोक-कथाओं में आँवले के वृक्ष का जन्म एक दिव्य आँसू से बताया जाता है — कुछ कथाओं में वह आँसू ब्रह्मा का है, कुछ में विष्णु का।',
          'इसीलिए आँवले को विष्णु का प्रिय वृक्ष मानकर इस एकादशी पर उसकी पूजा की जाती है।',
        ],
        bodyEn: [
          'Folk tales say the amla tree was born from a divine tear — in some tellings the tear is Brahma\'s, in others Vishnu\'s.',
          'That is why the amla is regarded as Vishnu\'s beloved tree and is worshipped on this Ekadashi.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'एक वृक्ष को दिव्य आँसू से जन्मा मानना, प्रकृति में ईश्वर का स्नेह देखने की दृष्टि है।',
    bhavEn: 'Seeing a tree as born from a divine tear is a way of seeing God\'s love in nature.',
    anchors: {
      masa: [12],
      kathaIds: [
        'amalaki-ekadashi-katha',
      ],
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
  {
    id: 'AD1',
    axis: 'masa',
    kind: 'manyata',
    phase: 2,
    questionHi: 'अधिक मास को पुरुषोत्तम मास क्यों कहते हैं?',
    questionEn: 'Why is Adhik Maas called Purushottam Maas?',
    practiceHi: 'चान्द्र वर्ष में हर दो-तीन वर्ष पर जुड़ने वाला अतिरिक्त मास अधिक मास कहलाता है, जिसे पुरुषोत्तम मास भी कहते हैं। इसमें भक्ति, कथा-श्रवण और दान पर विशेष ध्यान रहता है, और कई जगह 33 मालपुओं का दान किया जाता है।',
    practiceEn: 'The extra month added to the lunar year every two or three years is called Adhik Maas, also known as Purushottam Maas. During it there is a special focus on devotion, listening to sacred stories and giving, and in many places 33 malpuas are given in charity.',
    kathas: [
      {
        tier: 'purana',
        titleHi: 'जिस मास को किसी ने नहीं अपनाया',
        titleEn: 'The month no one would take in',
        bodyHi: [
          'चान्द्र और सौर वर्ष का अन्तर पाटने के लिए जुड़ने वाले इस अतिरिक्त मास का कोई स्वामी देवता नहीं था, और इसे \'मलमास\' कहकर उपेक्षित किया जाता था।',
          'कथा के अनुसार दुखी होकर यह मास विष्णु की शरण में गया। विष्णु ने इसे अपना लिया और अपना ही नाम \'पुरुषोत्तम\' दे दिया, तब से यह पुरुषोत्तम मास कहलाता है।',
        ],
        bodyEn: [
          'This extra month, added to bridge the gap between the lunar and solar years, had no presiding deity, and it was neglected and called \'Malmas\'.',
          'According to the story, the month, in sorrow, went to Vishnu for refuge. Vishnu took it in and gave it his own name, \'Purushottam\', and since then it has been called Purushottam Maas.',
        ],
        canonHi: 'पद्म पुराण (अध्याय समीक्षाधीन)',
        canonEn: 'Padma Purana (adhyaya under review)',
      },
      {
        tier: 'lok',
        titleHi: '33 मालपुए',
        titleEn: '33 malpuas',
        bodyHi: [
          'लोक-परम्परा में अधिक मास के दौरान 33 मालपुओं का दान करने की प्रथा है।',
          '33 की संख्या का अर्थ और दान किसे दिया जाए — इस पर अलग-अलग क्षेत्रों और परिवारों की रीतियाँ भिन्न हैं।',
        ],
        bodyEn: [
          'In folk tradition there is a custom of giving 33 malpuas in charity during Adhik Maas.',
          'What the number 33 means, and to whom the gift is given — on these, customs differ across regions and families.',
        ],
        canonHi: 'लोक-परम्परा',
        canonEn: 'Folk tradition',
      },
    ],
    bhavHi: 'जिस मास को कोई अपनाना नहीं चाहता था, उसे स्वयं भगवान ने अपनाया — उपेक्षित को अपनाने की करुणा ही इस मास का भाव है।',
    bhavEn: 'The month no one wanted to take in was taken in by God himself — compassion that embraces the neglected is the spirit of this month.',
    anchors: {
      adhikMasa: true,
    },
    status: 'draft',
    source: {
      referenceUrls: [],
      verificationNote: '2026-10-28: DRAFT — NOT VERIFIED. PRD-46 Phase 0 retelling (Hindi authored, English translated); no source was opened. To open: Padma Purana (adhyaya under review) | Folk tradition. Leads: none recorded — outbound access is blocked by policy (PRD-46 §0).',
      confidence: 'Likely',
    },
  },
];

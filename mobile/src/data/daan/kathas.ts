/**
 * The five teaching-kathas (PRD-26 §10.2 Bucket B) — the stories the giving
 * layer is built on, each carrying one bhaav: Karna (giving what costs you),
 * Rantideva (the apex anna-daan), Shibi (seva as daan), Bali–Vamana (daan and
 * ego), Sudama (bhaav over amount). Rendered by DaanKathaScreen. The shipped
 * katha library (Akshaya Tritiya, Amavasya, …) is cross-linked from
 * occasions.ts, never duplicated here.
 * ⚠ `source` blocks are review-only provenance — never rendered; `canon*` is
 * the rendered source line.
 */
import type { DaanKathaEntry } from './types';

export const DAAN_KATHA_ENTRIES: readonly DaanKathaEntry[] = [
  {
    id: 'karna',
    titleHi: 'दानवीर कर्ण',
    titleEn: 'Karna the Daanveer',
    subtitleHi: 'कवच-कुण्डल का दान',
    subtitleEn: 'The gift of the kavach and kundal',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'कर्ण जन्म से ही दिव्य कवच और कुण्डल धारण किए हुए था — सूर्यदेव का दिया वह रक्षा-आवरण, जो उसकी देह के साथ ही जुड़ा था। जब तक वे उसके अंग पर थे, युद्ध में उसे कोई पराजित नहीं कर सकता था। और कर्ण का एक व्रत सारा आर्यावर्त जानता था — मध्याह्न में सूर्य को अर्घ्य देते समय उसके द्वार से कोई याचक खाली नहीं लौटता।',
          'महाभारत-युद्ध निकट आया तो अर्जुन की चिंता में देवराज इन्द्र ने वही वेला चुनी। वृद्ध ब्राह्मण का रूप धरकर वे अर्घ्य की घड़ी में कर्ण के सम्मुख आ खड़े हुए। रात को स्वप्न में सूर्यदेव अपने पुत्र को चेता चुके थे — "कल इन्द्र स्वयं तेरा कवच-कुण्डल माँगने आएँगे। मत देना; उन्हीं में तेरे प्राण हैं।" कर्ण ने हाथ जोड़कर उत्तर दिया था — "हे देव, मेरे द्वार से माँगकर कोई खाली लौट जाए, यह मेरे लिए मृत्यु से बड़ी हार होगी।"',
          'ब्राह्मण ने कवच-कुण्डल माँगे। कर्ण मुस्कुराया — उसने याचक को पहचान लिया था। फिर भी वह एक क्षण नहीं रुका: शस्त्र लेकर उसने अपनी देह से जुड़ा कवच काटा, कुण्डल उतारे, और रक्त से भीगे वे दान इन्द्र के हाथों में रख दिए। देवराज स्तब्ध रह गए — जिसे छलने आए थे, उसके सामने स्वयं छोटे पड़ गए। उन्होंने कर्ण को अमोघ शक्ति दी, और संसार ने उसे एक नया नाम दिया — दानवीर।',
        ],
        paragraphsEn: [
          'Karna was born wearing a divine kavach and kundal — armour and earrings given by Surya, grown into his very body. While they were on him, no one could defeat him in battle. And all of Aryavarta knew Karna’s one vow: at midday, as he offered arghya to the sun, no seeker left his door empty-handed.',
          'As the great war drew near, Indra — anxious for Arjuna — chose exactly that hour. In the form of an old brahmin he stood before Karna at the moment of arghya. The night before, Surya had warned his son in a dream: “Tomorrow Indra himself will come asking for your kavach and kundal. Do not give them; your life lives in them.” Karna had answered with folded hands: “O Deva, that someone should ask at my door and return empty — for me that would be a defeat greater than death.”',
          'The brahmin asked for the kavach and kundal. Karna smiled — he had recognised the seeker. Yet he did not pause for a moment: taking up a blade, he cut the armour from his own body, removed the earrings, and placed those blood-wet gifts in Indra’s hands. The king of the devas stood stunned — smaller, before the man he had come to deceive. He granted Karna the unfailing Shakti, and the world gave him a new name — Daanveer.',
        ],
      },
    ],
    teachingHi:
      'दान वह है जो अपने में से दिया जाए — बचे हुए में से नहीं। कर्ण ने वह दिया जो उसकी रक्षा था; इसीलिए कठिन दान और गुप्त दान की हर चर्चा उसी के नाम से खुलती है।',
    teachingEn:
      'True giving costs the giver — Karna gave the very armour of his life, knowing exactly what it would cost.',
    canonHi: 'महाभारत · वन (आरण्यक) पर्व — कुण्डलाहरण उपाख्यान',
    canonEn: 'Mahābhārata · Vana (Āraṇyaka) Parva — the Kuṇḍalāharaṇa episode',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://sacred-texts.com/hin/m03/index.htm',
        'https://www.wisdomlib.org/hinduism/book/mahabharata-english/',
      ],
      verificationNote:
        '2026-09-01: retelling checked against the Ganguli translation’s Kundala-harana parva (Vana) — the dream-warning by Surya, the arghya-hour asking, the cutting of the body-grown armour, and the Shakti in return are all canonical; no invented episodes.',
    },
  },
  {
    id: 'rantideva',
    titleHi: 'राजा रन्तिदेव',
    titleEn: 'King Rantideva',
    subtitleHi: 'अंतिम जल का दान',
    subtitleEn: 'The gift of the last water',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'सङ्कृति के पुत्र राजा रन्तिदेव की कीर्ति दोनों लोकों में गाई जाती है। जो भी सम्पदा आती, वे बाँट देते — भाग्य पर भरोसा रखकर, अपने लिए कुछ भी संचित किए बिना। ऐसा करते-करते एक समय ऐसा आया कि परिवार सहित अड़तालीस दिन भूखे-प्यासे बीत गए। उनचासवें प्रातः उन्हें घी, खीर, हलवा और जल प्राप्त हुआ — काँपती देह, पर स्थिर मन से वे परिवार सहित पारण करने बैठे।',
          'तभी द्वार पर एक ब्राह्मण अतिथि आ खड़ा हुआ। रन्तिदेव ने श्रद्धा से भोजन का भाग उसे दिया। वह गया तो एक शूद्र आया — उसे भी उतने ही आदर से भाग मिला। फिर कुत्तों समेत एक व्यक्ति आया — "मैं और मेरे कुत्ते भूखे हैं।" राजा ने बचा हुआ भोजन उन्हें अर्पित कर प्रणाम किया। अब केवल जल शेष था — बस एक प्राणी की प्यास भर।',
          'तभी थका हुआ एक चाण्डाल आया — "प्यासा हूँ।" उसकी दीन वाणी सुनकर रन्तिदेव का हृदय पिघल गया, और वे अमृत-से शब्द निकले जो भागवत की अमर पंक्तियाँ बन गए — "मैं ईश्वर से आठों सिद्धियों वाली परम गति नहीं चाहता, मोक्ष भी नहीं; मैं समस्त प्राणियों के भीतर रहकर उनका दुःख सहूँ, ताकि वे दुःखमुक्त हो जाएँ।" और अंतिम जल चाण्डाल को दे दिया।',
          'उसी क्षण माया हटी — वे अतिथि ब्रह्मा, विष्णु, महेश की रची परीक्षा थे। रन्तिदेव ने तब भी कुछ नहीं माँगा। जो भी उस दृश्य को स्मरण करता है, उसके लिए अन्न-जल का दान सदा के लिए बड़ा हो जाता है।',
        ],
        paragraphsEn: [
          'The fame of King Rantideva, son of Sankriti, is sung in both worlds. Whatever wealth came to him he gave away — trusting providence, keeping nothing for himself. So it went until he and his family had passed forty-eight days without food or water. On the forty-ninth morning he received ghee, kheer, halwa and water — and with a trembling body but a steady mind, he sat down with his family to break the fast.',
          'Just then a brahmin guest appeared at the door. Rantideva gave him a share of the food with reverence. When he left, a shudra came — and received his share with the same respect. Then came a man with his dogs: “I and my dogs are hungry.” The king offered them all that remained and bowed. Now only water was left — enough for one being’s thirst.',
          'Then came an exhausted chandala — “I am thirsty.” At that helpless voice Rantideva’s heart melted, and there rose the nectar-like words that became the Bhāgavata’s immortal lines: “I do not desire from the Lord the highest state with its eight siddhis, nor even freedom from rebirth; let me dwell within all beings and bear their sorrow, so that they may be free of it.” And he gave the last water to the chandala.',
          'That instant the maya lifted — the guests were a trial fashioned by the gods. Even then Rantideva asked for nothing. For anyone who remembers that scene, the gift of food and water is made great forever.',
        ],
      },
    ],
    teachingHi:
      'अन्न-जल का दान देह से नहीं, करुणा से निकलता है — अड़तालीस दिन के भूखे का दिया एक पात्र जल, भरे भण्डार के सौ दानों से बड़ा है।',
    teachingEn:
      'The apex of anna-daan: the last water, given first — compassion outweighing hunger itself.',
    canonHi: 'श्रीमद्भागवत · स्कन्ध ९, अध्याय २१',
    canonEn: 'Śrīmad Bhāgavata · Canto 9, Chapter 21',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://vedabase.io/en/library/sb/9/21/',
        'https://www.wisdomlib.org/hinduism/book/the-bhagavata-purana/',
      ],
      verificationNote:
        '2026-09-01: retelling checked against SB 9.21.2–18 — the 48 days, the sequence of guests (brahmin, shudra, the man with dogs, the chandala), the "na kamaye ’ham" verse sense, and the deva-maya reveal are canonical.',
    },
  },
  {
    id: 'shibi',
    titleHi: 'राजा शिबि',
    titleEn: 'King Shibi',
    subtitleHi: 'शरणागत की रक्षा',
    subtitleEn: 'Protecting the one who seeks refuge',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'उशीनर के राजा शिबि यज्ञ में बैठे थे कि एक घायल कपोत काँपता हुआ उनकी गोद में आ गिरा — "राजन्, शरण!" पीछे-पीछे बाज आया और बोला — "यह मेरा आहार है। धर्म के राजा होकर तुम मेरा भोजन कैसे रोक सकते हो? मैं भूखा रहा तो मेरा वध तुम्हारे ही माथे होगा।"',
          'शिबि धर्म-संकट में पड़े — शरणागत की रक्षा भी धर्म, भूखे का आहार भी धर्म। उन्होंने मार्ग निकाला: "कपोत के भार के बराबर मांस मैं अपनी देह से काटकर दूँगा।" तराजू आया। एक पलड़े पर कपोत, दूसरे पर राजा अपनी देह का मांस काट-काटकर रखते गए — पर कपोत का पलड़ा झुका ही रहा। अंत में शिबि स्वयं पूरे तराजू पर चढ़ गए — "मेरा सम्पूर्ण शरीर ही ले लो।"',
          'उसी क्षण कपोत और बाज अपने वास्तविक रूप में प्रकट हुए — अग्नि और इन्द्र, जो धर्म की परीक्षा लेने आए थे। उन्होंने राजा की देह पुनः पूर्ण की और वर दिया कि शिबि की कीर्ति जब तक सूर्य-चन्द्र हैं, तब तक रहेगी।',
        ],
        paragraphsEn: [
          'King Shibi of Ushinara sat at his yajna when a wounded dove fell trembling into his lap — “Rajan, refuge!” Behind it came a hawk: “That is my food. You, a king of dharma — how can you withhold my meal? If I starve, my death is on your head.”',
          'Shibi stood between two dharmas — protecting the surrendered, and feeding the hungry. He found the way through: “Flesh from my own body, equal to the dove’s weight.” The scales came. On one pan the dove; on the other the king laid piece after piece of his own flesh — yet the dove’s pan stayed lower. At last Shibi climbed onto the scale himself: “Take the whole body.”',
          'That instant dove and hawk stood revealed — Agni and Indra, come to test dharma. They made the king’s body whole and granted that Shibi’s fame would last as long as the sun and the moon.',
        ],
      },
    ],
    teachingHi:
      'दान केवल द्रव्य का नहीं होता — जिसने शरण माँगी, उसकी रक्षा में लगाया गया श्रम, साहस और अभय भी दान है। इसीलिए इस खाते में "श्रम/सेवा" द्रव्य के बराबर की श्रेणी है।',
    teachingEn:
      'Protection of the one who seeks refuge is daan of the body and courage — seva ranks beside money, never below it.',
    canonHi: 'महाभारत · वन पर्व — शिबि उपाख्यान',
    canonEn: 'Mahābhārata · Vana Parva — the Shibi episode',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://sacred-texts.com/hin/m03/index.htm',
        'https://www.wisdomlib.org/hinduism/book/mahabharata-english/',
      ],
      verificationNote:
        '2026-09-01: retelling checked against the Ganguli Vana-parva Shibi episode — the dove’s refuge, the hawk’s dharma-claim, the flesh-for-weight scale and the Agni/Indra reveal are canonical.',
    },
  },
  {
    id: 'bali-vamana',
    titleHi: 'बलि–वामन',
    titleEn: 'Bali and Vamana',
    subtitleHi: 'तीन पग भूमि',
    subtitleEn: 'Three steps of land',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'दैत्यराज बलि ने सौ अश्वमेध पूरे किए थे और उसका नियम था — यज्ञ-वेला में जो जो माँगे, वह मिलेगा। तब वामन रूप में स्वयं विष्णु ब्रह्मचारी बटुक बनकर पधारे और माँगा — केवल तीन पग भूमि। गुरु शुक्राचार्य ने पहचान लिया और रोका — "यह स्वयं नारायण हैं; तीन पग में तेरा सर्वस्व चला जाएगा।"',
          'बलि का उत्तर दान की मर्यादा बन गया — "यदि ये स्वयं नारायण हैं, तो मेरा वचन और भी अटल हुआ। देने का वचन देकर पीछे हटना दान का अपमान है — सर्वस्व जाए तो जाए।" और उसने संकल्प का जल छोड़ दिया।',
          'वामन बढ़े — एक पग में पृथ्वी, दूसरे में स्वर्ग। "तीसरा पग कहाँ रखूँ, राजन्?" बलि ने मुस्कुराकर अपना मस्तक झुका दिया — "यह शेष है, प्रभु।" उस झुके मस्तक पर पग रखते ही भगवान ने बलि को सुतल लोक दिया और स्वयं उसके द्वारपाल बन गए। कार्तिक शुक्ल प्रतिपदा — गोवर्धन पूजा का दिन — बलि-प्रतिपदा भी है, उसी दानी के स्मरण का दिन।',
        ],
        paragraphsEn: [
          'The daitya king Bali had completed a hundred ashvamedhas, and his rule was simple — at the hour of yajna, whoever asks, receives. Then Vishnu himself came as Vamana, a young brahmachari, and asked for just three steps of land. Guru Shukracharya recognised him and warned: “This is Narayana himself; in three steps your everything will go.”',
          'Bali’s answer became the dignity of giving itself: “If this is Narayana himself, my word is more unbreakable still. To promise a gift and step back is an insult to daan — let everything go if it must.” And he poured the water of sankalpa.',
          'Vamana grew — one step measured the earth, the second the heavens. “Where shall I set the third, Rajan?” Bali smiled and bowed his head: “This remains, Lord.” The moment the foot touched that bowed head, the Lord gave Bali the realm of Sutala and became the keeper of his gate. Kartika shukla pratipada — the day of Govardhan Puja — is also Bali Pratipada, the remembrance of that giver.',
        ],
      },
    ],
    teachingHi:
      'दान में अहंकार गल जाए तो देने वाला स्वयं भगवान का प्रिय हो जाता है — दिया हुआ घटता नहीं, देने वाला बड़ा हो जाता है।',
    teachingEn:
      'When ego dissolves in the gift, the giver becomes dear to the Lord himself — what is given never diminishes the giver.',
    canonHi: 'श्रीमद्भागवत · स्कन्ध ८, अध्याय १९–२३',
    canonEn: 'Śrīmad Bhāgavata · Canto 8, Chapters 19–23',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://vedabase.io/en/library/sb/8/19/',
        'https://www.wisdomlib.org/hinduism/book/the-bhagavata-purana/',
      ],
      verificationNote:
        '2026-09-01: retelling checked against SB 8.19–23 — the three-steps ask, Shukracharya’s warning, Bali’s refusal to retract, the two strides, the offered head, Sutala and the Lord as doorkeeper are canonical; the Bali-Pratipada calendar tie matches the shipped solver (govardhan-puja on Kartika shukla pratipada).',
    },
  },
  {
    id: 'sudama',
    titleHi: 'सुदामा का पोहा',
    titleEn: 'Sudama’s poha',
    subtitleHi: 'भाव ही मापदण्ड',
    subtitleEn: 'Bhaav is the only measure',
    sections: [
      {
        id: 'katha',
        paragraphsHi: [
          'द्वारकाधीश के बालसखा सुदामा घोर निर्धन थे — घर में बच्चों के लिए अन्न तक नहीं। पत्नी ने कहा — "आपके मित्र तो साक्षात् श्रीकृष्ण हैं; एक बार जाइए तो।" सुदामा संकोच से भरे चले, और पड़ोस से माँगकर बाँधी गई पोटली में ले गए — चार मुट्ठी चिउड़ा।',
          'द्वारका में कृष्ण ने सखा को देखते ही दौड़कर हृदय से लगाया, स्वयं चरण धोए, अपने आसन पर बिठाया। फिर पूछा — "भाभी ने मेरे लिए कुछ भेजा होगा?" सुदामा लज्जा से पोटली छिपाते रहे। कृष्ण ने छीनकर खोली और एक मुट्ठी चिउड़ा ऐसे प्रेम से खाया मानो छप्पन भोग हो। दूसरी मुट्ठी उठाई तो रुक्मिणी ने हाथ थाम लिया — "स्वामी, एक ही मुट्ठी में सब कुछ दिया जा चुका।"',
          'सुदामा कुछ माँग नहीं सके, कृष्ण ने कुछ कहा नहीं। लौटे तो झोंपड़ी की जगह महल खड़ा था। सुदामा समझ गए — जो प्रेम से दिया जाता है, उसका लेखा देने वाले के पास नहीं, पाने वाले के हृदय में रहता है।',
        ],
        paragraphsEn: [
          'Sudama, boyhood friend of the Lord of Dwarka, was desperately poor — not even grain at home for the children. His wife said, “Your friend is Sri Krishna himself; go to him once.” Sudama went, full of hesitation, carrying a little bundle tied from what a neighbour could spare — four fistfuls of flattened rice.',
          'In Dwarka, Krishna saw his friend and ran to embrace him, washed his feet with his own hands, seated him on his own seat. Then he asked, “Surely bhabhi sent something for me?” Sudama, ashamed, kept hiding the bundle. Krishna snatched it open and ate one fistful of the poha with such love, as if it were a feast of fifty-six dishes. As he lifted the second, Rukmini held his hand — “Swami, in one fistful everything has already been given.”',
          'Sudama could not bring himself to ask; Krishna said nothing. When he returned, a palace stood where his hut had been. Sudama understood — what is given with love is accounted not by the giver, but in the heart of the receiver.',
        ],
      },
    ],
    teachingHi:
      'भाव ही मापदण्ड है — मुट्ठी भर पोहा भी प्रेम से दिया जाए तो पूर्ण है। इसीलिए इस खाते में कोई योग नहीं, कोई राशि-गणना नहीं, कोई तुलना नहीं।',
    teachingEn:
      'Bhaav is the only measure — a fistful of poha, given with love, is complete. This is why the ledger keeps no totals.',
    canonHi: 'श्रीमद्भागवत · स्कन्ध १०, अध्याय ८०–८१',
    canonEn: 'Śrīmad Bhāgavata · Canto 10, Chapters 80–81',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://vedabase.io/en/library/sb/10/80/',
        'https://www.wisdomlib.org/hinduism/book/the-bhagavata-purana/',
      ],
      verificationNote:
        '2026-09-01: retelling checked against SB 10.80–81 — the borrowed poha, the welcome and foot-washing, the one fistful eaten and Rukmini staying the second, and the unasked-for palace are canonical.',
    },
  },
];

export function getDaanKathas(): readonly DaanKathaEntry[] {
  return DAAN_KATHA_ENTRIES.filter((entry) => entry.status === 'verified');
}

export function getDaanKatha(id: string): DaanKathaEntry | null {
  return getDaanKathas().find((entry) => entry.id === id) ?? null;
}

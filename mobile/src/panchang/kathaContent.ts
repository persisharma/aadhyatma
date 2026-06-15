import type { KathaContentEntry, KathaContentSection } from './types';

type SectionDraft = {
  id: string;
  titleHi: string;
  titleEn: string;
  bodyHi: string[];
  bodyEn: string[];
};

type FullKathaDraft = {
  id: string;
  titleHi: string;
  titleEn: string;
  sourceUrls?: string[];
  sections: SectionDraft[];
};

type SummaryKathaDraft = {
  id: string;
  titleHi: string;
  titleEn: string;
  themeHi: string;
  themeEn: string;
  practiceHi: string;
  practiceEn: string;
};

const sourceNoteHi = 'यह ऐप-लिखित, स्रोत-सूचित पुनर्कथन है; बाहरी स्रोत का मूल पाठ कॉपी नहीं किया गया है।';
const sourceNoteEn = 'This is an app-authored, source-informed retelling; external source story text is not copied.';

function section(draft: SectionDraft): KathaContentSection {
  return {
    id: draft.id,
    titleHi: draft.titleHi,
    titleEn: draft.titleEn,
    bodyHi: draft.bodyHi,
    bodyEn: draft.bodyEn,
  };
}

function fullContent(draft: FullKathaDraft): KathaContentEntry {
  return {
    id: draft.id,
    titleHi: draft.titleHi,
    titleEn: draft.titleEn,
    contentStatus: 'original-content-ready',
    languageAvailability: 'bilingual',
    sourceUrls: draft.sourceUrls,
    sourceNoteHi,
    sourceNoteEn,
    sections: draft.sections.map(section),
  };
}

function summaryContent(draft: SummaryKathaDraft): KathaContentEntry {
  return fullContent({
    id: draft.id,
    titleHi: draft.titleHi,
    titleEn: draft.titleEn,
    sections: [
      {
        id: 'katha',
        titleHi: 'कथा सार',
        titleEn: 'Story Summary',
        bodyHi: [draft.themeHi],
        bodyEn: [draft.themeEn],
      },
      {
        id: 'mahatva',
        titleHi: 'व्रत महत्त्व',
        titleEn: 'Observance Meaning',
        bodyHi: [draft.practiceHi],
        bodyEn: [draft.practiceEn],
      },
    ],
  });
}

export const KATHA_CONTENT: readonly KathaContentEntry[] = [
  fullContent({
    id: 'skanda-sashti-katha',
    titleHi: 'स्कंद षष्ठी कथा',
    titleEn: 'Skanda Sashti Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'surapadman-boon',
        titleHi: 'वरदान के बल पर सूरपद्मन का अत्याचार',
        titleEn: 'Surapadman\'s terror, won on the strength of a boon',
        bodyHi: [
          'त्रिलोक के एक छोर पर, समुद्र के बीचों-बीच बसे वीरमहेन्द्र नगर में सूरपद्मन नामक असुर ने वर्षों तक घोर तपस्या की। भूख-प्यास और ऋतुओं की मार सहते हुए उसने अपने शरीर को सुखा डाला, और अंततः भगवान शिव प्रकट हुए। ‘मांग, जो चाहे,’ शिव ने कहा। असुर ने हाथ जोड़कर वर मांगा कि न कोई देव, न दानव, न मनुष्य उसका वध कर सके — केवल शिव के अपने अंश से जन्मा कोई बालक ही, यदि चाहे तो, उसका अंत करे; और तब तक तीनों लोक उसके अधीन रहें। शिव ‘तथास्तु’ कहकर अंतर्धान हो गए, और सूरपद्मन ने इसी वरदान को अपनी अमरता समझ लिया।',
          'वर पाते ही असुर का अहंकार आकाश छूने लगा। उसने अपने भाइयों तारकासुर और सिंहमुख के साथ मिलकर देवलोक पर चढ़ाई कर दी। इन्द्र का सिंहासन छीन लिया गया, देवता बंदी बना लिए गए, यज्ञ की अग्नियाँ बुझा दी गईं और ऋषियों के आश्रम उजाड़ दिए गए। तारकासुर के आतंक से तो धरती भी काँप उठी; जहाँ-जहाँ धर्म की ध्वजा फहराती थी, वहाँ-वहाँ असुरों के डंके बजने लगे। देवता मुख छिपाकर वनों और गुफाओं में भटकने लगे, और उनके मन में बस एक ही प्रश्न गूँजता रहा — इस अन्याय का अंत कौन करेगा।',
          'हारे हुए देवता ब्रह्मा जी की शरण में पहुँचे। ब्रह्मा ने उनकी व्यथा सुनकर वरदान का रहस्य खोला — ‘सूरपद्मन और तारकासुर का वध केवल शिव के तेज से उत्पन्न कोई वीर ही कर सकता है। तुम्हारी मुक्ति उसी शिशु-सेनापति के जन्म में छिपी है।’ देवताओं की आँखों में आशा की एक किरण जागी, और वे यह जानने के लिए व्याकुल हो उठे कि वह दिव्य बालक कैसे, कहाँ और कब इस संसार में आएगा।',
        ],
        bodyEn: [
          'At the far edge of the three worlds, in the island-city of Veeramahendra set in the midst of the ocean, an asura named Surapadman performed a fierce penance for many years. Enduring hunger, thirst, and the lash of every season, he dried his body to a husk, until at last Lord Shiva appeared before him. ‘Ask,’ said Shiva, ‘whatever you desire.’ With folded hands the asura begged that no god, demon, or man might ever slay him — only a child born of Shiva\'s own essence could, if it so chose, bring his end; and until then the three worlds would lie beneath his feet. Shiva said ‘so be it’ and vanished, and Surapadman took this boon to be his immortality.',
          'The moment the boon was his, the asura\'s pride rose to touch the sky. Together with his brothers Tarakasura and Simhamukha he stormed the realm of the devas. Indra\'s throne was seized, the gods were taken captive, the fires of sacrifice were smothered, and the hermitages of the sages were laid waste. Tarakasura\'s terror made the very earth tremble; wherever the banner of dharma had once flown, now the war-drums of the asuras thundered. The devas wandered hiding their faces in forests and caves, and one question alone echoed in their hearts — who would put an end to this injustice?',
          'The defeated gods took refuge with Brahma. Hearing their grief, Brahma unveiled the secret of the boon: ‘Only a hero born of Shiva\'s own radiance can slay Surapadman and Tarakasura. Your deliverance lies hidden in the birth of that infant commander.’ A single ray of hope kindled in the eyes of the devas, and they grew desperate to learn how, where, and when that divine child would come into the world.',
        ],
      },
      {
        id: 'fiery-seed',
        titleHi: 'शिव का अग्नि-तेज और छह चिंगारियाँ',
        titleEn: 'Shiva\'s fiery seed and the six sparks',
        bodyHi: [
          'कैलास पर शिव गहन समाधि में लीन थे, और पार्वती उनके समीप बैठी प्रतीक्षा कर रही थीं। देवताओं ने सोचा कि यदि शिव और पार्वती का तेज एक हो जाए तो उसी से वह वीर जन्मेगा जो असुरों का संहार करेगा। पर शिव की समाधि भंग करना सरल न था। बहुत प्रार्थना के पश्चात जब उनका तीसरा नेत्र खुला, तो उसमें से छह दिव्य अग्नि-चिंगारियाँ फूट पड़ीं — इतनी प्रचंड कि उन्हें कोई धारण न कर सका।',
          'अग्निदेव और वायुदेव ने उन छह तेज-कणों को सावधानी से उठाया और पवित्र गंगा को सौंप दिया। गंगा भी उस ताप को सह न सकीं और उन्होंने उन चिंगारियों को सरकंडों से भरे शरवण नामक सरोवर के तट पर रख दिया, जहाँ शीतल जल और कोमल कांस उनके आश्रय बने। वहाँ वे छह तेज-कण छह तेजस्वी शिशुओं के रूप में प्रकट हुए, और सम्पूर्ण शरवण-वन एक साथ छह सूर्यों के समान दमक उठा।',
          'उसी समय आकाश में कृत्तिका नक्षत्र की छह माताएँ — कृत्तिकाएँ — विचरण कर रही थीं। उन तेजस्वी शिशुओं को देखकर उनका हृदय वात्सल्य से भर आया, और छहों ने एक-एक शिशु को गोद में लेकर अपना दूध पिलाया। तभी उन छहों शिशुओं को एक साथ अपनी बाँहों में भर लेने के लिए शिशु ने अपना रूप एक कर लिया — छह मुख, बारह नेत्र और बारह भुजाओं वाला एक ही अद्भुत बालक। कृत्तिकाओं के पालन के कारण वह ‘कार्तिकेय’ कहलाया, शरवण में जन्म के कारण ‘शरवणभव’, और छह मुखों के कारण ‘षण्मुख’। पार्वती ने उसे अपनी गोद में उठाकर ‘स्कंद’ नाम दिया, और कैलास हर्ष से गूँज उठा।',
        ],
        bodyEn: [
          'On Kailasa, Shiva was absorbed in deep meditation, and Parvati sat beside him, waiting. The devas reasoned that if the radiance of Shiva and Parvati could be joined, from it would be born the hero who would destroy the asuras. But to break Shiva\'s trance was no easy thing. After much prayer, when his third eye opened, from it burst six divine sparks of fire — so fierce that none could hold them.',
          'Agni, the fire-god, and Vayu, the wind-god, carefully bore those six points of light and gave them to the sacred Ganga. Even Ganga could not endure their heat, and she laid the sparks upon the bank of a reed-filled pool called Sharavana, where cool water and soft rushes became their cradle. There the six points of light appeared as six radiant infants, and the whole reed-forest blazed at once like six rising suns.',
          'At that very hour, the six mothers of the Krittika constellation — the Krittikas — were moving across the sky. Seeing those luminous infants, their hearts overflowed with motherly love, and each of the six took an infant into her lap and nursed it at her breast. Then, to gather all six children at once into a single embrace, the child drew his forms into one — a single wondrous boy with six faces, twelve eyes, and twelve arms. Because the Krittikas reared him he was called ‘Kartikeya’; because of his birth in Sharavana, ‘Sharavanabhava’; and because of his six faces, ‘Shanmukha.’ Parvati lifted him into her lap and named him ‘Skanda,’ and Kailasa rang with joy.',
        ],
      },
      {
        id: 'commander-of-devas',
        titleHi: 'देवसेनापति का अभिषेक',
        titleEn: 'The anointing of the commander of the gods',
        bodyHi: [
          'बालक स्कंद पल-पल में बढ़ता गया, और उसके मुखमंडल का तेज देखकर देवताओं को ब्रह्मा का वचन स्मरण हो आया। वे सब इन्द्र के साथ कैलास पहुँचे और शिव-पार्वती के समक्ष नतमस्तक होकर बोले, ‘हे प्रभु! इसी वीर के जन्म की हम युगों से प्रतीक्षा कर रहे थे। असुरों के अत्याचार से त्रिलोक त्राहि-त्राहि कर रहा है। इस तेजस्वी पुत्र को हमारी सेना का सेनापति बनाइए।’',
          'शिव और पार्वती ने प्रसन्न होकर अनुमति दी। देवताओं ने पवित्र नदियों के जल से, ऋषियों के मंत्रोच्चार के बीच, स्कंद का देवसेनापति-पद पर अभिषेक किया। इन्द्र ने अपनी पुत्री देवसेना का हाथ उन्हें सौंपा, इसीलिए वे ‘देवसेनापति’ और ‘कुमार’ कहलाए। विश्वकर्मा ने उनके लिए तेज से जगमगाता एक वज्र-शक्ति नामक भाला गढ़ा, जो कभी निशाना न चूकता था।',
          'उस दिव्य वेल — शक्ति-शूल — को हाथ में धारण कर जब स्कंद देवताओं की विशाल सेना के आगे खड़े हुए, तो उनका मयूर-समान तेज देखकर देवताओं के मुरझाए मुख खिल उठे। मोर उनका वाहन बना और मुर्गा उनके ध्वज पर आकर बैठा। बंदी देवताओं की शृंखलाएँ टूटने का समय निकट आ चुका था, और स्कंद ने प्रतिज्ञा की कि वे असुरों के नगर तक स्वयं जाकर अधर्म का अंत करेंगे।',
        ],
        bodyEn: [
          'The boy Skanda grew with every passing moment, and seeing the splendour of his face the devas remembered Brahma\'s words. With Indra at their head they came to Kailasa, bowed before Shiva and Parvati, and said, ‘O Lord! It is for the birth of this very hero that we have waited through the ages. The three worlds cry out under the tyranny of the asuras. Make this radiant son the commander of our army.’',
          'Pleased, Shiva and Parvati gave their consent. With the waters of the sacred rivers and amid the chanting of the sages, the devas anointed Skanda to the rank of commander of the gods. Indra gave him the hand of his daughter Devasena, and so he came to be called ‘Devasenapati’ and ‘Kumara.’ Vishwakarma forged for him a blazing spear named the Vajra-Shakti, a lance that never missed its mark.',
          'When Skanda stood before the vast army of the gods, that divine vel — the Shakti-spear — in his hand, the withered faces of the devas bloomed at the sight of his peacock-bright glory. A peacock became his mount, and a rooster came to perch upon his banner. The hour was drawing near for the chains of the captive gods to be broken, and Skanda vowed that he himself would march to the city of the asuras and make an end of unrighteousness.',
        ],
      },
      {
        id: 'soorasamharam',
        titleHi: 'षष्ठी का छह-दिवसीय संग्राम और सूरसंहार',
        titleEn: 'The six-day war of Sashti and the slaying of Soora',
        bodyHi: [
          'देवसेना के अगुआ बनकर स्कंद समुद्र पार वीरमहेन्द्र नगर की ओर बढ़े। सूरपद्मन ने अपने सहस्रों असुर-योद्धा, अपने पुत्र बाणुकोप और भाई सिंहमुख तथा तारकासुर को रणभूमि में उतार दिया। संग्राम छह दिनों तक चला — आकाश बाणों से ढक गया, समुद्र की लहरें रक्तरंजित हो उठीं, और प्रत्येक दिन स्कंद के वेल ने एक-एक महावीर असुर को धराशायी किया। पहले सिंहमुख गिरा, फिर तारकासुर, और एक-एक कर असुरों के दुर्ग ढहते चले गए।',
          'अंतिम दिन — षष्ठी तिथि — स्वयं सूरपद्मन रणभूमि में उतरा। उसने माया का सहारा लिया; कभी पर्वत बना, कभी सागर, कभी प्रचंड आँधी। पर स्कंद का तेज अडिग रहा। जब असुर ने एक विशाल आम्रवृक्ष का रूप धरकर छिपना चाहा, तो स्कंद ने अपना दिव्य वेल चलाया और वृक्ष को ठीक बीच से चीर डाला। चिरते ही सूरपद्मन का अहंकार टूटा और उसके भीतर का भक्त जाग उठा — उसने स्कंद को अपना स्वामी मानकर शरण माँगी।',
          'स्कंद ने उस पर करुणा बरसाई। उन्होंने सूरपद्मन के दो रूप कर दिए — एक मयूर, जो उनका वाहन बनकर उन्हें सदा साथ रहने का सौभाग्य पाता, और एक मुर्गा, जो उनके ध्वज पर बैठकर उनकी विजय की घोषणा करता। इस प्रकार जो असुर अहंकार में डूबकर शत्रु बना था, वही शरणागत होकर भगवान का चिर-सेवक बन गया। षष्ठी के इसी दिन हुए इस संहार को ‘सूरसंहारम्’ कहा जाता है।',
        ],
        bodyEn: [
          'Leading the army of the gods, Skanda advanced across the ocean toward the city of Veeramahendra. Surapadman sent his thousands of asura warriors, his son Banukopa, and his brothers Simhamukha and Tarakasura onto the battlefield. The war raged for six days — the sky was darkened with arrows, the waves of the ocean turned crimson, and each day Skanda\'s vel laid low one mighty asura after another. First Simhamukha fell, then Tarakasura, and one by one the strongholds of the asuras crumbled.',
          'On the final day — the sixth lunar day, Sashti — Surapadman himself came down to the field. He took to sorcery; now becoming a mountain, now an ocean, now a furious storm. But Skanda\'s radiance stood unshaken. When the asura tried to hide by taking the form of a great mango tree, Skanda hurled his divine vel and split the tree clean down the middle. The instant it was cleaved, Surapadman\'s pride broke and the devotee within him awoke — he accepted Skanda as his master and begged for refuge.',
          'Skanda poured his compassion upon him. He made of Surapadman two forms — one a peacock, which became his mount and won the fortune of being ever at his side, and one a rooster, which sat upon his banner to proclaim his victory. Thus the asura who had become an enemy, drowned in pride, became the Lord\'s eternal servant once he surrendered. This destruction wrought on the day of Sashti is remembered as the ‘Soorasamharam.’',
        ],
      },
      {
        id: 'sashti-vow',
        titleHi: 'षष्ठी व्रत और कुमार का आशीर्वाद',
        titleEn: 'The vow of Sashti and the blessing of Kumara',
        bodyHi: [
          'विजय के पश्चात स्कंद बंदी देवताओं को मुक्त कराकर देवलोक लौटे। इन्द्र को उसका सिंहासन फिर मिला, यज्ञ की अग्नियाँ पुनः प्रज्वलित हुईं, और ऋषियों के आश्रम मंत्रों से गूँज उठे। देवता और मनुष्य दोनों ने उस तिथि को स्मरण में रखा जिस दिन छह दिनों के संयम और प्रार्थना के बाद अधर्म का नाश हुआ था।',
          'तभी से शुक्ल पक्ष की षष्ठी को स्कंद षष्ठी का व्रत प्रचलित हुआ। भक्त छह दिनों तक उपवास और संयम रखते हैं, मुरुगन का स्मरण करते हैं, और षष्ठी के दिन कार्तिकेय का पूजन कर पारण करते हैं। कहा जाता है कि जो श्रद्धा से यह व्रत करता है, उसके भीतर के क्रोध, अहंकार और भय रूपी असुर उसी प्रकार पराजित होते हैं, जैसे स्कंद के वेल से सूरपद्मन।',
          'जो माता-पिता संतान की कामना से यह व्रत करते हैं, उन्हें तेजस्वी और दीर्घायु संतान का सुख मिलता है; रोगी निरोग होते हैं और शत्रुओं के भय से रक्षा होती है। षण्मुख कुमार, जो मोर पर सवार होकर हाथ में वेल धारण किए हुए हैं, अपने भक्तों पर वैसी ही करुणा बरसाते हैं जैसी उन्होंने शरणागत सूरपद्मन पर बरसाई थी — और इसी आशीर्वाद के स्मरण में स्कंद षष्ठी की कथा युग-युग तक सुनी और कही जाती रही।',
        ],
        bodyEn: [
          'After his victory, Skanda freed the captive gods and returned to the realm of the devas. Indra received his throne once more, the fires of sacrifice were rekindled, and the hermitages of the sages echoed again with mantras. Both gods and mortals held in memory the day on which, after six days of restraint and prayer, unrighteousness had been undone.',
          'From that time the vow of Skanda Sashti, observed on the sixth lunar day of the bright fortnight, came into practice. Devotees keep fast and discipline for six days, remembering Murugan, and on the day of Sashti they worship Kartikeya and break their fast. It is said that for one who observes this vow with faith, the asuras of anger, pride, and fear within are vanquished just as Surapadman was by Skanda\'s vel.',
          'Parents who keep this vow longing for children are blessed with radiant and long-lived offspring; the sick are made well, and the fearful are shielded from their enemies. Shanmukha Kumara, mounted upon his peacock with the vel in his hand, pours upon his devotees the same compassion he poured upon the surrendered Surapadman — and in remembrance of that very blessing the story of Skanda Sashti has been heard and told from age to age.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'masik-krishna-janmashtami-katha',
    titleHi: 'मासिक कृष्ण जन्माष्टमी कथा',
    titleEn: 'Masik Krishna Janmashtami Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'monthly-remembrance',
        titleHi: 'हर मास लौटती वह अष्टमी',
        titleEn: 'The Ashtami that returns each month',
        bodyHi: [
          'हर मास जब कृष्ण पक्ष की अष्टमी की रात उतरती है, तो व्रती दीपक की मंद लौ के सामने बैठकर उसी आधी रात को फिर से जी उठता है, जब मथुरा के कारागार में हथकड़ियों के बीच भगवान ने जन्म लिया था। यह कोई एक बार की स्मृति नहीं, यह तो प्रति मास लौटने वाला निमंत्रण है — मानो हर महीने स्वयं प्रभु फिर से पृथ्वी पर उतर आते हों, और भक्त उन्हें अपने हृदय के गोकुल में पुकारता हो।',
          'उस रात वसुदेव नवजात शिशु को टोकरी में रखकर उमड़ती यमुना पार ले गए थे, और गोकुल में नंद-यशोदा के आँगन में रख आए थे। पर व्रती जानता है कि कथा यहीं समाप्त नहीं होती; असली लीला तो अब आरंभ होती है — उस नन्हे बालक के रूप में, जो माखन की मटकियों के बीच, गायों की धूल में, और माँ की गोद में अपनी दिव्यता क्षण-क्षण प्रकट करता जाता है।',
          'इसी कारण मासिक कृष्ण जन्माष्टमी का व्रती मथुरा के बंदीगृह से आगे बढ़कर गोकुल और वृन्दावन के उन आँगनों में प्रवेश करता है, जहाँ शिशु कृष्ण की बाल-लीलाएँ बार-बार यह स्मरण कराती हैं कि जो गोद में खेल रहा है, वही समस्त ब्रह्मांड का आधार है।',
        ],
        bodyEn: [
          'Each month, when the Ashtami of the dark fortnight settles into night, the observer sits before the soft flame of a lamp and relives that same midnight when, amid chains in a Mathura prison, the Lord took birth. This is no one-time memory but an invitation that returns every month — as though the Lord descends to earth again and again, and the devotee calls Him into the Gokul of the heart.',
          'On that night Vasudeva carried the newborn in a basket across the swollen Yamuna and laid Him in the courtyard of Nanda and Yashoda in Gokul. Yet the observer knows the tale does not end there; the true play begins now — in the form of that small child who, among the pots of butter, in the dust raised by cows, and in His mother’s lap, reveals His divinity moment by moment.',
          'For this reason the keeper of the monthly Krishna Janmashtami moves past the prison of Mathura and steps into those courtyards of Gokul and Vrindavan where the infant Krishna’s childhood plays remind us again and again that the One playing in a mother’s lap is the very support of the whole universe.',
        ],
      },
      {
        id: 'putana-slain',
        titleHi: 'पूतना के विष में छिपी मुक्ति',
        titleEn: 'Liberation hidden within Putana’s poison',
        bodyHi: [
          'कंस ने जब सुना कि उसका काल गोकुल में पल रहा है, तो उसने राक्षसी पूतना को भेजा, जिसने अपने स्तनों पर हलाहल विष लगा रखा था। मनोहर स्त्री का रूप धरकर वह नंद के घर पहुँची और यशोदा का विश्वास जीतकर शिशु कृष्ण को गोद में उठा लिया, यह सोचकर कि स्तनपान कराते ही बालक का प्राणांत हो जाएगा।',
          'किन्तु जिसकी गोद में सारे लोक टिके हैं, वह भला उस छल को न पहचानता? कृष्ण ने उसके स्तन से दूध के साथ-साथ उसके प्राण भी खींच लिए। पूतना चीख उठी, उसका मायावी रूप गिर पड़ा और वह विशाल राक्षसी देह में परिवर्तित होकर भूमि पर ढह गई, पर उसका वध करते हुए भी प्रभु ने उसे माता का भाव देने के कारण मुक्ति प्रदान कर दी।',
          'व्रती इस लीला पर ठहरकर समझता है कि भगवान के पास जो भी आता है — चाहे छल के साथ ही क्यों न आए — वह कोरा लौटता नहीं; और जो विष लेकर आई थी, वही उस स्पर्श से तर गई। यही करुणा हर मास उस नन्हे रूप का स्मरण करने वाले को भीतर तक छू जाती है।',
        ],
        bodyEn: [
          'When Kamsa heard that his death was being nurtured in Gokul, he sent the demoness Putana, who had smeared deadly poison upon her breasts. Taking the form of a lovely woman, she came to Nanda’s house, won Yashoda’s trust, and lifted the infant Krishna into her lap, thinking the child would perish the moment He suckled.',
          'But would the One in whose lap all the worlds rest fail to know that deceit? Krishna drew out, along with the milk, the very life from her breast. Putana shrieked, her illusory form fell away, and she crashed to the ground in her vast demonic body — yet even while slaying her, the Lord granted her liberation, for she had come, however falsely, in the guise of a mother.',
          'Pausing over this play, the observer understands that whoever comes to the Lord — even if they come with cunning — never returns empty; and she who arrived bearing poison was herself ferried across by that touch. This very compassion reaches deep into the one who recalls that little form each month.',
        ],
      },
      {
        id: 'cart-and-twins',
        titleHi: 'शकटासुर और उलटी हुई गाड़ी',
        titleEn: 'Shakatasura and the overturned cart',
        bodyHi: [
          'कुछ ही समय बीता था कि एक दिन यशोदा ने शिशु कृष्ण को एक बड़ी छकड़ा-गाड़ी की छाया में पालने में सुला दिया और स्वयं उत्सव की तैयारी में लग गईं। कंस का भेजा एक और असुर, शकटासुर, उसी गाड़ी में प्रवेश कर बैठा था, इस घात में कि वह उसे बालक पर गिराकर कुचल देगा।',
          'जागते ही भूख से व्याकुल नन्हे कृष्ण ने रोते हुए अपने कोमल चरण ऊपर उठाकर गाड़ी को एक हलकी-सी ठोकर मारी। उस छोटे-से पाँव के स्पर्श से लदी हुई भारी गाड़ी उलट कर चूर-चूर हो गई, उसके पहिए और बर्तन दूर जा गिरे, और भीतर बैठा असुर वहीं नष्ट हो गया।',
          'गोप-गोपियाँ दौड़कर आए और चकित रह गए कि इतनी भारी गाड़ी आप ही कैसे पलट गई; केवल वहाँ खेल रहे बालकों ने कहा कि इसे तो नन्हे कान्हा ने पैर मारकर गिराया है। व्रती इस दृश्य को मन में बसाकर अनुभव करता है कि जिस चरण को माँ दुलारती है, वही चरण संसार के समस्त संकटों को पलट देने में समर्थ है।',
        ],
        bodyEn: [
          'Only a little time had passed when, one day, Yashoda laid the infant Krishna to sleep in a cradle beneath the shade of a great bullock cart and turned to the preparations of a festival. Another demon dispatched by Kamsa, Shakatasura, had entered and lurked within that very cart, scheming to topple it upon the child and crush Him.',
          'Waking and restless with hunger, the little Krishna cried and raised His tender feet, giving the cart the faintest kick. At the touch of that small foot, the heavily laden cart overturned and shattered to pieces, its wheels and vessels flung far apart, and the demon hidden within was destroyed on the spot.',
          'The cowherd men and women came running and stood amazed that so heavy a cart could overturn of itself; only the children playing there said that little Kanha had knocked it down with His foot. Holding this scene in the heart, the observer feels that the very feet a mother caresses are able to overturn every calamity of the world.',
        ],
      },
      {
        id: 'universe-in-the-mouth',
        titleHi: 'खुले मुख में दिखा समूचा ब्रह्मांड',
        titleEn: 'The whole universe seen in an open mouth',
        bodyHi: [
          'एक दिन कृष्ण घुटनों के बल आँगन में खेल रहे थे कि बलराम सहित खेलते बालकों ने यशोदा से शिकायत की कि कान्हा ने मिट्टी खा ली है। माँ ने व्याकुल होकर डाँटते हुए कहा — मुख खोलो, दिखाओ क्या खाया है। बालक ने भोलेपन से अपना नन्हा मुख खोल दिया।',
          'उस खुले मुख में यशोदा ने जो देखा, उससे उनकी साँस रुक गई — सम्पूर्ण आकाश, पर्वत, द्वीप, समुद्र, चन्द्र-सूर्य और सारे तारे, समस्त चराचर ब्रह्मांड, और उसी के बीच गोकुल और स्वयं अपने को भी उन्होंने उस शिशु के मुख के भीतर देखा। एक क्षण को वे समझ गईं कि यह कोई साधारण बालक नहीं, स्वयं परब्रह्म उनकी गोद में लीला कर रहा है।',
          'किन्तु प्रभु ने तत्क्षण अपनी योगमाया फैला दी और यशोदा का वह बोध मातृ-स्नेह में घुल गया; उन्हें फिर अपना प्यारा लाला ही दिखाई देने लगा और वे उसे छाती से लगाकर पुचकारने लगीं। व्रती इस लीला को स्मरण करते हुए नतमस्तक होता है कि जिसमें सम्पूर्ण सृष्टि समाई है, वही प्रेमवश माँ की गोद में बँधकर रहना स्वीकार करता है।',
        ],
        bodyEn: [
          'One day Krishna was crawling about the courtyard on His knees when the playing children, along with Balarama, complained to Yashoda that Kanha had eaten mud. Alarmed and scolding Him, the mother said, ‘Open your mouth, show me what you have eaten.’ Innocently the child opened His little mouth.',
          'What Yashoda saw within that open mouth stopped her breath — the entire sky, the mountains, islands and oceans, the moon, the sun and all the stars, the whole moving and unmoving universe, and within it Gokul itself and even her own self, she beheld inside that infant’s mouth. For a single moment she understood that this was no ordinary child but the Supreme Absolute playing in her lap.',
          'Yet at once the Lord spread His Yogamaya, and Yashoda’s realization dissolved into a mother’s affection; she saw only her beloved darling once more and drew Him to her breast, soothing Him. Recalling this play, the observer bows low that the One who contains all creation consents, out of love, to be bound within a mother’s lap.',
        ],
      },
      {
        id: 'butter-thief',
        titleHi: 'माखनचोर की मीठी चोरी और व्रत का फल',
        titleEn: 'The sweet thefts of the butter-thief and the fruit of the vow',
        bodyHi: [
          'ज्यों-ज्यों कृष्ण बड़े होते गए, गोकुल के घर-घर में उनकी माखन-चोरी की मीठी शिकायतें गूँजने लगीं। ऊँचे टँगे छींके तक पहुँचने के लिए वे ग्वालबालों की मटकियाँ जोड़कर सीढ़ी बना लेते, माखन-दही लूटकर आपस में बाँटते, और थोड़ा बंदरों को भी खिला देते। पकड़े जाने पर वे ऐसा निर्दोष मुख बनाते कि रोष से आई गोपियाँ हँसकर पिघल जातीं।',
          'एक दिन रूठकर यशोदा ने उन्हें ओखली से बाँध दिया, पर वही रस्सी सदा दो अंगुल छोटी पड़ती रही — मानो जिसे कोई बंधन बाँध नहीं सकता, वह केवल भक्त के प्रेम से ही बँधता हो। इसी से उनका एक नाम ’दामोदर’ पड़ा, और गोकुल की हर माता ने अनुभव किया कि उनकी चोरी वस्तुतः हृदय की चोरी थी — वे माखन नहीं, भक्तों का मन चुरा ले जाते थे।',
          'इन्हीं बाल-लीलाओं का स्मरण करते हुए मासिक कृष्ण जन्माष्टमी का व्रती दिनभर उपवास और हरि-नाम में रहकर आधी रात को प्रभु के प्राकट्य की आरती करता है। कहते हैं कि जो श्रद्धा से यह व्रत हर मास धारण करता है, उसके घर से बाधाएँ वैसे ही दूर हट जाती हैं जैसे पूतना और शकटासुर हटे थे, संतान पर प्रभु की छाया बनी रहती है, और मन में वही शीतल आनंद उतर आता है जो माखन-चोर के नटखट मुख को निहारकर गोकुल के हृदय में उतरा करता था।',
        ],
        bodyEn: [
          'As Krishna grew, sweet complaints of His butter-thieving echoed through every home in Gokul. To reach the hanging pots slung high above, He would stack the cowherd boys into a ladder, plunder the butter and curd to share among them, and even feed a little to the monkeys. Caught in the act, He would put on so guiltless a face that the gopis, who had come in anger, melted into laughter.',
          'One day, vexed, Yashoda bound Him to a grinding mortar, yet the rope fell ever two fingers short — as though the One whom no bond can bind is bound only by a devotee’s love. From this He earned one of His names, ‘Damodara,’ and every mother of Gokul felt that His thieving was truly a theft of the heart — He stole not butter but the minds of His devotees.',
          'Recalling these very childhood plays, the keeper of the monthly Krishna Janmashtami spends the day in fasting and the chanting of Hari’s name, and at midnight performs the arati of the Lord’s appearance. It is said that whoever holds this vow each month with faith finds obstacles withdrawing from the home just as Putana and Shakatasura withdrew, the Lord’s shade resting upon one’s children, and that same cool bliss descending into the mind which once entered the heart of Gokul at the sight of the mischievous face of the butter-thief.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'masik-kalashtami-katha',
    titleHi: 'मासिक कालाष्टमी कथा',
    titleEn: 'Masik Kalashtami Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'trideva-vivad',
        titleHi: 'त्रिदेवों का श्रेष्ठता-विवाद',
        titleEn: 'The dispute of the three lords over supremacy',
        bodyHi: [
          'सृष्टि के आदि में, जब काल अभी अपनी पहली करवट ले रहा था, ब्रह्मा और विष्णु एक दिन आमने-सामने आ खड़े हुए और दोनों के बीच यह प्रश्न उठ खड़ा हुआ कि इस समस्त जगत में सर्वश्रेष्ठ कौन है। ब्रह्मा ने अपनी छाती ठोककर कहा, \'मैं ही समस्त लोकों का रचयिता हूँ, मुझसे ही यह सृष्टि उपजी है, अतः सबका स्वामी मैं ही हूँ।\' विष्णु ने मृदु स्वर में उत्तर दिया कि पालनकर्ता वही हैं, जिनके बिना रची हुई सृष्टि एक पल भी न ठहरे।',
          'दोनों का यह वाद-विवाद बढ़ते-बढ़ते ऐसा प्रचंड हो उठा कि देवता भी सहम गए। तभी उन दोनों के मध्य एक अनंत ज्योति का स्तंभ प्रकट हुआ, जो न आदि रखता था और न अंत—ऊपर आकाश को बेधता और नीचे पाताल में डूबता हुआ वह तेजःपुंज जगमगा उठा। आकाशवाणी हुई कि जो इस स्तंभ का छोर खोज लाएगा, वही श्रेष्ठ माना जाएगा।',
          'विष्णु वराह रूप धारण कर पाताल की ओर उतर गए और ब्रह्मा हंस का रूप धरकर ऊपर आकाश की ओर उड़ चले, ताकि उस ज्योतिर्लिंग का अंत-छोर ढूँढ़ सकें। युगों तक खोजने पर भी न विष्णु को नीचे का अंत मिला, न ब्रह्मा को ऊपर का सिरा। थककर विष्णु लौट आए और सिर झुकाकर बोले कि इस स्तंभ का कोई छोर उन्हें नहीं मिला।',
        ],
        bodyEn: [
          'In the very dawn of creation, when time itself was only beginning to stir, Brahma and Vishnu once stood face to face, and between them rose the question of who, in all this universe, was the greatest. Striking his own breast, Brahma declared, \'I am the maker of all the worlds, this creation has sprung from me, and so it is I who am the lord of all.\' Vishnu answered in a gentle voice that it was the preserver alone, without whom no created world could stand even for a moment.',
          'This contention swelled between them until it grew so fierce that even the gods were dismayed. Then, in the very midst of the two, there appeared an endless pillar of light that had neither beginning nor end—piercing the heavens above and plunging into the netherworlds below, the shaft of radiance blazed forth. A voice from the sky declared that whoever could find the limit of this pillar would be deemed the greater.',
          'Vishnu took the form of a boar and descended toward the netherworld, while Brahma assumed the form of a swan and flew upward toward the sky, each seeking the far end of that pillar of light. Though they searched for ages, neither did Vishnu find the lower end nor Brahma the upper tip. Wearied, Vishnu returned and, bowing his head, said that he had not found any limit to the pillar.',
        ],
      },
      {
        id: 'brahma-ka-ahankar',
        titleHi: 'ब्रह्मा का अहंकार और पाँचवाँ मुख',
        titleEn: 'Brahma\'s arrogance and the fifth head',
        bodyHi: [
          'किंतु ब्रह्मा सत्य कहने को सिद्ध न थे। ऊपर उड़ते-उड़ते उन्हें मार्ग में एक केतकी का पुष्प मिला, जो उस ज्योतिर्लिंग से न जाने कब से नीचे गिरता आ रहा था। ब्रह्मा ने उस पुष्प को साक्षी बनाने का छल रचा और लौटकर गर्व से घोषणा की, \'मैंने इस स्तंभ का ऊपरी छोर पा लिया है, और यह केतकी पुष्प इसका प्रमाण है।\'',
          'अपने इस मिथ्या विजय के मद में ब्रह्मा के मुख से अहंकार ही अहंकार झलकने लगा। उनके पाँच मुख थे, और उनमें से पाँचवाँ मुख, जो सबसे ऊपर था, उस घमंड में ऐसा उद्धत हो उठा कि उसने स्वयं उस दिव्य ज्योति की, उस परम तत्त्व की भी अवहेलना और उपहास करना आरंभ कर दिया। उस मुख के शब्द कठोर, गर्वीले और अनादरपूर्ण थे।',
          'उसी ज्योतिर्लिंग के भीतर से साक्षात महादेव प्रकट हुए। उन्होंने देखा कि सृष्टिकर्ता असत्य का सहारा ले रहे हैं और उनका पाँचवाँ मुख परम सत्य का तिरस्कार कर रहा है। झूठी साक्षी देने के कारण उन्होंने केतकी पुष्प को शाप दिया कि अब वह पूजा में कभी न चढ़ेगा, और ब्रह्मा के असत्य व अहंकार पर महादेव का ललाट क्रोध से तप उठा।',
        ],
        bodyEn: [
          'But Brahma was not resolved to speak the truth. As he flew upward, he found along the way a ketaki flower that had been drifting down from that pillar of light since none knew when. Brahma devised the deceit of making the flower his witness, and returning, he proudly proclaimed, \'I have reached the upper end of this pillar, and this ketaki flower is the proof of it.\'',
          'Intoxicated by this false victory, nothing but arrogance shone forth from Brahma\'s faces. He had five heads, and of these the fifth, which rose highest of all, grew so insolent in that pride that it began to scorn and mock even the divine light itself, that supreme reality. The words of that head were harsh, haughty, and full of disrespect.',
          'From within that very pillar of light, Mahadeva himself appeared. He saw that the creator was leaning upon falsehood and that his fifth head was deriding the supreme truth. For bearing false witness, he cursed the ketaki flower never again to be offered in worship, and at Brahma\'s untruth and pride the brow of Mahadeva grew hot with wrath.',
        ],
      },
      {
        id: 'bhairav-ka-pragatya',
        titleHi: 'काल भैरव का प्राकट्य और पाँचवें मुख का छेदन',
        titleEn: 'The rising of Kala Bhairava and the severing of the fifth head',
        bodyHi: [
          'महादेव के उस प्रचंड क्रोध से एक भयंकर तेज प्रकट हुआ—श्याम वर्ण की एक उग्र मूर्ति, जिसके नेत्र अंगारों समान दहक रहे थे, गले में नागों का हार और हाथों में दंड शोभायमान था। यह काल का भी काल था, इसी से उसे काल भैरव कहा गया; उसकी एक ही दृष्टि से दिशाएँ काँप उठीं और देवता नतमस्तक हो गए।',
          'शिव की आज्ञा पाकर वह उग्र भैरव ब्रह्मा की ओर बढ़ा। उसने अपने तीक्ष्ण नख से ब्रह्मा के उसी पाँचवें मुख को, जिसने अहंकार में सत्य का उपहास किया था, एक ही क्षण में काट गिराया। उस मुख के कटते ही ब्रह्मा का गर्व चूर-चूर हो गया, और वे काँपते हुए महादेव के चरणों में गिर पड़े।',
          'कटा हुआ वह कपाल भैरव के हाथ में आ टिका। ब्रह्मा सृष्टिकर्ता थे, अतः उनके शीश का छेदन एक घोर पाप—ब्रह्महत्या—बन गया। भैरव यद्यपि शिव के अंश थे और दंड न्यायपूर्ण था, फिर भी सृष्टि के नियम के अनुसार वह कपाल उनके हाथ से चिपक गया, और ब्रह्महत्या का भार उनके साथ चल पड़ा।',
        ],
        bodyEn: [
          'From that terrible wrath of Mahadeva there burst forth a fearsome radiance—a fierce, dark-hued form whose eyes blazed like live coals, a garland of serpents about his neck and a staff gleaming in his hands. He was the death even of Death, and for this he was called Kala Bhairava; at a single glance from him the quarters trembled and the gods bowed their heads.',
          'Receiving the command of Shiva, that fierce Bhairava advanced upon Brahma. With his sharp nail he struck off, in a single instant, that very fifth head of Brahma which had mocked the truth in its arrogance. The moment that head fell, Brahma\'s pride was shattered to dust, and trembling he fell at the feet of Mahadeva.',
          'The severed skull came to rest in Bhairava\'s hand. Brahma was the creator, and so the cutting of his head became a grievous sin—the slaying of a Brahmin, Brahmahatya. Though Bhairava was a portion of Shiva himself and the punishment was just, yet by the law of creation that skull clung fast to his hand, and the burden of Brahmahatya set out to walk with him.',
        ],
      },
      {
        id: 'bhikshatana-aur-kapalamochan',
        titleHi: 'भिक्षाटन और काशी में कपालमोचन',
        titleEn: 'The wandering as Bhikshatana and release at Kashi',
        bodyHi: [
          'अपने हाथ से चिपके उस कपाल को लिए भैरव दिगंबर वेश में लोक-लोकांतर में भटकने लगे। वही भिक्षाटन रूप कहलाए—एक तपस्वी, जो उस कपाल को ही भिक्षापात्र बनाकर द्वार-द्वार भिक्षा माँगते थे, पर जो कुछ उसमें पड़ता वह सब उस अतल कपाल में लुप्त हो जाता और कभी भरता न था। वर्षों तक यह कठोर प्रायश्चित चलता रहा, फिर भी ब्रह्महत्या का कलंक उनका पीछा न छोड़ता।',
          'अनेक तीर्थों को लाँघते हुए अंततः भैरव काशी की पवित्र भूमि में जा पहुँचे, उस नगरी में जो स्वयं शिव को अत्यंत प्रिय है। ज्यों ही उन्होंने उस क्षेत्र में चरण रखे, हाथ से चिपका वह कपाल स्वयं ही छूटकर भूमि पर गिर पड़ा। जिस स्थान पर वह गिरा, वह \'कपालमोचन\' तीर्थ के नाम से प्रसिद्ध हुआ, क्योंकि वहीं भैरव कपाल और कलंक दोनों से मुक्त हुए।',
          'उस क्षण ब्रह्महत्या का घोर पाप भैरव से सदा के लिए विलीन हो गया, और उनका मुख प्रशांत तेज से दीप्त हो उठा। काशी की उस भूमि ने वह भार हर लिया जिसे युगों की भटकन न हर पाई थी; और तभी से यह जाना गया कि सच्चा पश्चात्ताप और पवित्र क्षेत्र की शरण बड़े से बड़े पाप को भी धो डालते हैं।',
        ],
        bodyEn: [
          'Bearing that skull clinging to his hand, Bhairava wandered through world after world in the garb of a naked ascetic. This very form became known as Bhikshatana—a mendicant who made that skull itself his begging bowl and asked for alms door to door, yet whatever fell into it vanished into that bottomless skull and never filled it. For years this harsh penance continued, and still the stain of Brahmahatya would not leave him.',
          'Crossing many holy places, Bhairava at last reached the sacred ground of Kashi, that city most beloved of Shiva himself. The moment he set foot in that domain, the skull that had clung to his hand of its own accord broke free and fell to the earth. The place where it fell became renowned as the sacred ford of \'Kapalamochana,\' for it was there that Bhairava was freed from both the skull and the stain.',
          'In that instant the grievous sin of Brahmahatya dissolved from Bhairava forever, and his face shone with a calm radiance. The ground of Kashi bore away the burden that ages of wandering had been unable to lift; and from that time it was known that true repentance and refuge in a holy place wash clean even the very greatest of sins.',
        ],
      },
      {
        id: 'kashi-ke-kotwal',
        titleHi: 'काशी के कोतवाल और कालाष्टमी का व्रत',
        titleEn: 'The guardian of Kashi and the vow of Kalashtami',
        bodyHi: [
          'जिस काशी ने भैरव को इतना बड़ा वरदान दिया, उसी नगरी का रक्षण भार महादेव ने उन्हें सौंप दिया। तभी से काल भैरव \'काशी के कोतवाल\' कहलाए—वे ही उस पुण्यभूमि के द्वारपाल और दंडनायक हैं, और कहा जाता है कि काशी में निवास या तीर्थ करने वाले को पहले भैरव की अनुमति और कृपा प्राप्त करनी होती है।',
          'इसी कारण प्रत्येक मास के कृष्ण पक्ष की अष्टमी तिथि को काल भैरव की आराधना का पावन दिन—कालाष्टमी—माना गया। उस रात्रि भक्त उपवास रखते हैं, जागरण करते हैं, भैरव के नाम का स्मरण और दीपदान करते हैं, और उनके वाहन श्वान को भोजन कराकर सेवा का भाव प्रकट करते हैं।',
          'जो श्रद्धालु इस व्रत को निष्ठा से धारण करता है, उसके भय, रोग, शत्रुबाधा और संचित पाप काल भैरव की कृपा से उसी प्रकार दूर हो जाते हैं जैसे काशी की भूमि ने स्वयं भैरव का कपाल हर लिया था। मृत्यु और काल का जो स्वामी है, वही अपने भक्त को अकाल भय से उबारता और निर्भयता का वरदान देता है—यही कालाष्टमी के व्रत का अक्षय फल है।',
        ],
        bodyEn: [
          'The very Kashi that had granted Bhairava so great a boon—Mahadeva entrusted to him the charge of guarding that city. From that time Kala Bhairava came to be called the \'Kotwal of Kashi,\' the gatekeeper and lord of justice of that holy ground, and it is said that one who would dwell in Kashi or make pilgrimage there must first obtain the leave and grace of Bhairava.',
          'For this reason the eighth lunar day of the dark fortnight of every month came to be held as the sacred day for the worship of Kala Bhairava—Kalashtami. On that night devotees keep the fast, hold a vigil, remember the name of Bhairava and offer lamps, and feed his mount, the dog, expressing their spirit of service.',
          'Whoever takes up this vow with faith finds that his fears, his ailments, the troubles of enemies, and his gathered sins are carried away by the grace of Kala Bhairava, just as the soil of Kashi itself bore away the skull from Bhairava\'s hand. He who is the master of death and time lifts his devotee out of untimely fear and grants the boon of fearlessness—and this is the inexhaustible fruit of the vow of Kalashtami.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'masik-durgashtami-katha',
    titleHi: 'मासिक दुर्गाष्टमी कथा',
    titleEn: 'Masik Durgashtami Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'demon-durgama-rises',
        titleHi: 'दुर्गम दैत्य का अभ्युदय',
        titleEn: 'The rise of the demon Durgama',
        bodyHi: [
          'बहुत पुरातन काल की बात है, रुरु नामक दैत्य के कुल में दुर्गम नाम का एक असुर उत्पन्न हुआ। बचपन से ही उसका मन देवताओं के प्रति द्वेष से भरा रहता था, और जैसे-जैसे वह बड़ा होता गया, उसके भीतर तीनों लोकों को अपने वश में करने की लालसा गहराती चली गई। उसने मन में ठान लिया कि वह उस मूल को ही सुखा देगा जिससे देवताओं का सारा बल पनपता है।',
          'इसी संकल्प को लेकर दुर्गम हिमालय की एक एकांत कंदरा में चला गया और वहाँ उसने पितामह ब्रह्मा को प्रसन्न करने के लिए घोर तप आरंभ किया। वर्षों तक अन्न-जल त्यागकर, अपने प्राणों को एक ही ध्येय में बाँधकर वह अविचल बैठा रहा। उसकी तपस्या की प्रचंड ज्वाला से लोक तपने लगे, और अंततः सृष्टि के रचयिता ब्रह्मा उसके सम्मुख प्रकट हुए।',
          '‘तेरी तपस्या से मैं प्रसन्न हूँ,’ ब्रह्मा बोले, ‘माँग, क्या वर चाहता है?’ दुर्गम ने हाथ जोड़कर कहा, ‘हे पितामह, समस्त वेद मुझे प्रदान कर दीजिए। चारों वेद, उनके मंत्र और उनका समस्त ज्ञान मेरे अधिकार में आ जाए, और मेरे सिवा किसी के पास उनका बल न रहे।’ ब्रह्मा ‘एवमस्तु’ कहकर अंतर्धान हो गए, और उसी क्षण चारों वेद ब्राह्मणों के कंठ और स्मृति से लुप्त होकर दुर्गम के पास चले गए।',
        ],
        bodyEn: [
          'In a very ancient age, in the lineage of a demon named Ruru, there was born an asura called Durgama. From his childhood his mind was filled with hatred for the gods, and as he grew, the longing to bring all three worlds under his sway deepened steadily within him. He resolved in his heart that he would dry up the very root from which all the strength of the gods drew its nourishment.',
          'With this resolve, Durgama went away to a lonely cave in the Himalaya, and there he began a severe penance to please the grandsire Brahma. For years he gave up food and water, bound his life-breath to a single aim, and sat unmoving. The fierce flame of his austerity began to scorch the worlds, and at last Brahma, the creator, appeared before him.',
          '‘I am pleased with your penance,’ Brahma said. ‘Ask — what boon do you desire?’ Folding his hands, Durgama replied, ‘O grandsire, grant me all the Vedas. Let the four Vedas, their mantras and all their knowledge pass into my keeping, and let none but me hold their power.’ Saying ‘So be it,’ Brahma vanished, and in that very moment the four Vedas slipped away from the lips and memory of the brahmins and went over to Durgama.',
        ],
      },
      {
        id: 'the-world-withers',
        titleHi: 'वेदों का लोप और सूखती हुई धरती',
        titleEn: 'The Vedas are lost and the earth withers',
        bodyHi: [
          'वेदों के लुप्त होते ही पृथ्वी पर अनर्थ का तांडव छा गया। ब्राह्मण संध्या, हवन और मंत्रों को भूल बैठे; यज्ञ की अग्नि बुझ गई और देवताओं तक आहुति पहुँचनी बंद हो गई। जिन यज्ञों के बल पर मेघ जल बरसाते थे, वे ही ठप पड़ गए, और आकाश से वर्षा की एक बूँद भी गिरनी बंद हो गई।',
          'धीरे-धीरे सौ वर्ष बीत गए और एक बूँद भी जल न बरसा। नदियाँ सूख गईं, सरोवर धूल बन गए, और हरी-भरी धरती फटकर सूखी मिट्टी का विस्तार रह गई। अन्न का एक दाना भी न उपजा। भूख और प्यास से व्याकुल प्राणी तड़प-तड़पकर मरने लगे, और चारों ओर हाहाकार मच गया। देवताओं का बल भी हीन पड़ता गया, क्योंकि उनकी शक्ति का आधार वही वेद और वही यज्ञ थे।',
          'हताश और भयभीत ब्राह्मणगण और शेष बचे प्राणी एक स्वर में पुकार उठे। उन्हें स्मरण हो आया कि सृष्टि की सारी रक्षा जिस आदिशक्ति के हाथ में है, संकट की इस घड़ी में वही जगज्जननी ही उनका उद्धार कर सकती हैं। वे हिमालय की ओर मुख कर, करुण हृदय से, उस माँ की आराधना में लीन हो गए जो सबकी पालनहार है।',
        ],
        bodyEn: [
          'The moment the Vedas vanished, a storm of ruin spread over the earth. The brahmins forgot their twilight prayers, their fire-offerings and their mantras; the flame of sacrifice died out, and oblations ceased to reach the gods. The very sacrifices whose power once made the clouds pour down their rain fell silent, and not a single drop fell any longer from the sky.',
          'Slowly a hundred years passed, and not a drop of water rained down. The rivers dried up, the lakes turned to dust, and the once-green earth split open into a waste of parched soil. Not a single grain of corn would grow. Tormented by hunger and thirst, living creatures writhed and perished, and on every side rose a great cry of anguish. Even the strength of the gods grew faint, for the foundation of their power had been those very Vedas and those very sacrifices.',
          'In despair and dread the brahmins and the creatures that yet survived cried out with one voice. They remembered that the protection of all creation rests in the hands of the primordial Power, and that in this hour of calamity it was that Mother of the worlds alone who could deliver them. Turning towards the Himalaya, with grieving hearts, they sank into worship of that Mother who is the nourisher of all.',
        ],
      },
      {
        id: 'the-mother-appears',
        titleHi: 'करुणामयी माँ का प्राकट्य',
        titleEn: 'The compassionate Mother appears',
        bodyHi: [
          'उनकी अविरल प्रार्थना सुनकर देवी का करुणामय हृदय द्रवित हो उठा। तभी एक अपूर्व दिव्य ज्योति प्रकट हुई, और उस तेज में से असंख्य नेत्रों वाली एक मंगलमयी देवी का स्वरूप साकार हुआ। उनके नेत्रों से अनवरत अश्रुधारा बह रही थी, क्योंकि अपने भूखे-प्यासे संतानों की पीड़ा देखकर माँ का अंतःकरण भर आया था। इसी कारण वे ‘शताक्षी’ कहलाईं — सौ नेत्रों वाली देवी।',
          'अपने व्याकुल भक्तों की दशा देखकर देवी ने अपने ही शरीर से समस्त जीवन-रस प्रकट कर दिया। उनके स्वरूप से नाना प्रकार के शाक, फल, मूल, कंद और अन्न उत्पन्न होने लगे, जिनसे प्राणियों की क्षुधा शांत हुई। अपने ही अंगों से शाक उपजाकर सृष्टि का पालन करने के कारण वे ‘शाकंभरी’ नाम से प्रसिद्ध हुईं। उनकी कृपा से सूखी धरती फिर हरियाली से भर उठी।',
          '‘अब डरो मत, मेरे पुत्रों,’ माँ ने स्नेह से कहा, ‘तुम्हारी रक्षा का भार मुझ पर है।’ अपने नेत्रों से उन्होंने जल की अविरल धारा बहाई, और सूखी हुई नदियाँ और सरोवर पुनः जल से भर गए। किंतु जिस दुष्ट दुर्गम ने वेदों का हरण कर यह विपत्ति लाई थी, उसका अंत किए बिना यह संकट सदा के लिए टल नहीं सकता था।',
        ],
        bodyEn: [
          'Hearing their unceasing prayer, the compassionate heart of the Goddess melted. Then a wondrous divine light appeared, and out of that radiance took shape the form of an auspicious Goddess with countless eyes. From her eyes flowed an endless stream of tears, for the heart of the Mother had overflowed at the sight of the suffering of her hungry, thirsting children. For this reason she came to be called ‘Shatakshi’ — the Goddess of a hundred eyes.',
          'Beholding the plight of her anguished devotees, the Goddess brought forth from her own body all the sap of life. From her form there sprang up vegetables and fruits, roots and tubers and grain of many kinds, with which the hunger of all creatures was stilled. Because she nourished creation by growing greens out of her own limbs, she became renowned by the name ‘Shakambhari.’ By her grace the parched earth was clothed once more in green.',
          '‘Fear no more, my children,’ the Mother said tenderly, ‘the burden of your protection rests upon me.’ From her eyes she let flow an unbroken stream of water, and the dried-up rivers and lakes were filled with water again. Yet so long as the wicked Durgama, who had stolen the Vedas and brought down this calamity, was not destroyed, the danger could never be turned away for good.',
        ],
      },
      {
        id: 'the-great-battle',
        titleHi: 'दुर्गम के साथ देवी का संग्राम',
        titleEn: 'The Goddess does battle with Durgama',
        bodyHi: [
          'जब दुर्गम को ज्ञात हुआ कि देवी ने धरती पर जल और अन्न लौटा दिया है, तो वह क्रोध से भर उठा और अपनी विशाल असुर सेना लेकर देवी पर चढ़ आया। उसकी सेना का कोलाहल सुनकर देवी ने अपने चारों ओर एक दिव्य प्रकाश का घेरा रच दिया, और उस तेज से अनेक शक्तियाँ प्रकट होकर असुरों से जूझने लगीं।',
          'देवी ने अपने धनुष पर बाण चढ़ाए और उनकी प्रत्यंचा की टंकार से दिशाएँ काँप उठीं। उनके बाणों और शूल से असुरों की सेना तृण की भाँति कटने लगी; जो भी सम्मुख आया, वह माँ की प्रचंड शक्ति के आगे ढेर हो गया। दस दिनों तक यह घोर संग्राम चलता रहा, और अंततः दुर्गम स्वयं अपने रथ पर सवार होकर देवी के सम्मुख आ खड़ा हुआ।',
          'अहंकार में भरा दुर्गम जैसे ही देवी पर अस्त्रों की वर्षा करने लगा, माँ ने एक ही प्रचंड बाण से उसके रथ, ध्वज और धनुष को छिन्न-भिन्न कर दिया। फिर अपने तीक्ष्ण शूल से उन्होंने उस दैत्य के वक्ष को बेध डाला, और वह महाबली असुर धरती पर गिरकर सदा के लिए शांत हो गया। जिस दुर्गम का संहार कर देवी ने सृष्टि को उबारा, उसी के नाम से वे ‘दुर्गा’ कहलाईं।',
        ],
        bodyEn: [
          'When Durgama learned that the Goddess had restored water and grain to the earth, he was filled with rage and marched against her with his vast army of asuras. Hearing the tumult of his host, the Goddess raised about herself a ring of divine light, and out of that radiance many Shaktis appeared and grappled with the demons.',
          'The Goddess set arrows to her bow, and at the twang of her bowstring the quarters of the sky trembled. Before her arrows and her spear the army of asuras was mown down like blades of grass; whoever came before her was laid low by the fierce power of the Mother. For ten days this terrible struggle raged on, and at last Durgama himself, mounted upon his chariot, came and stood before the Goddess.',
          'The moment the arrogant Durgama began to rain weapons upon the Goddess, the Mother with a single mighty arrow shattered his chariot, his banner and his bow. Then with her keen spear she pierced through the demon’s breast, and that mighty asura fell to the earth and was stilled forever. By slaying that Durgama and so rescuing creation, the Goddess herself came to be called ‘Durga.’',
        ],
      },
      {
        id: 'vedas-restored',
        titleHi: 'वेदों की वापसी और लोक का कल्याण',
        titleEn: 'The Vedas are restored and the world is blessed',
        bodyHi: [
          'दुर्गम के वध के साथ ही चारों वेद उसके बंधन से मुक्त होकर देवी के चरणों में लौट आए। माँ ने उन्हें फिर से ब्राह्मणों और ऋषियों को सौंप दिया, और देखते ही देखते मंत्र, यज्ञ और संध्या-वंदन का पावन क्रम पुनः लोक में स्थापित हो गया। यज्ञ की बुझी हुई अग्नि फिर से प्रज्वलित हो उठी और देवताओं तक आहुतियाँ पहुँचने लगीं।',
          'देवताओं और ऋषियों ने हर्षित होकर देवी की स्तुति की और उनके अनेक मंगलमय नामों का गान किया — दुर्गा, शाकंभरी, शताक्षी और दुर्गतिनाशिनी। माँ ने आशीर्वाद देते हुए कहा, ‘जो भी श्रद्धा से मेरा स्मरण करेगा और भक्तिपूर्वक मेरा पूजन करेगा, मैं उसके जीवन के समस्त दुर्गम संकटों को इसी प्रकार दूर कर दूँगी।’ इतना कहकर देवी अपने दिव्य धाम को लौट गईं।',
          'तभी से प्रत्येक मास के शुक्ल पक्ष की अष्टमी तिथि उस आदिशक्ति की आराधना के लिए विशेष रूप से पवित्र मानी गई, और यही तिथि ‘मासिक दुर्गाष्टमी’ कहलाई — माँ दुर्गा के उस स्वरूप के स्मरण का दिन जिसने वेदों की रक्षा कर धरती को फिर से जीवन दिया।',
        ],
        bodyEn: [
          'With the slaying of Durgama, the four Vedas were freed from his captivity and returned to the feet of the Goddess. The Mother gave them back once more to the brahmins and the sages, and in no time the sacred order of mantra, sacrifice and twilight worship was re-established in the world. The extinguished flame of sacrifice blazed up again, and oblations once more reached the gods.',
          'The gods and the sages, rejoicing, sang the praises of the Goddess and chanted her many auspicious names — Durga, Shakambhari, Shatakshi, and Durgatinashini, the remover of misfortune. Bestowing her blessing, the Mother said, ‘Whoever remembers me with faith and worships me with devotion, for that one I shall in this same way drive away every impassable danger of life.’ Having spoken thus, the Goddess returned to her divine abode.',
          'Ever since then, the eighth lunar day, the Ashtami of the bright fortnight of every month, has been held especially sacred for the worship of that primordial Power, and this very day came to be called ‘Masik Durgashtami’ — the day of remembering that form of Maa Durga who guarded the Vedas and gave life back to the earth.',
        ],
      },
      {
        id: 'devotee-delivered',
        titleHi: 'भक्त की रक्षा और व्रत का फल',
        titleEn: 'A devotee is delivered and the fruit of the vow',
        bodyHi: [
          'उसी नगरी में सुमति नाम का एक निर्धन किंतु श्रद्धालु व्यापारी रहता था, जिस पर एक के बाद एक विपत्तियाँ टूट पड़ी थीं। व्यापार में हानि, कर्ज का बोझ और रोग से घिरकर वह चारों ओर से निराश हो चुका था। एक संत ने उसे समझाया, ‘हर मास की शुक्ल अष्टमी को माँ दुर्गा का व्रत और पूजन करो; जिसने दुर्गम जैसे महादैत्य का संहार किया, वह तुम्हारे संकटों को भी दूर कर देंगी।’',
          'सुमति ने श्रद्धापूर्वक प्रत्येक मासिक दुर्गाष्टमी का व्रत आरंभ किया। उस दिन वह उपवास रखता, माँ की प्रतिमा का लाल पुष्पों से शृंगार करता, दीप जलाकर दुर्गा सप्तशती के मंत्रों का पाठ करता, और कुमारी कन्याओं को भोजन कराता। माँ के चरणों में बैठकर वह अपने मन के समस्त भय और शोक समर्पित कर देता।',
          'कुछ ही मासों में सुमति का जीवन बदलने लगा — उसका व्यापार फिर से फलने-फूलने लगा, कर्ज चुक गया, रोग जाता रहा, और उसके घर में सुख-शांति का निवास हो गया। कहा जाता है कि जो भी भक्त श्रद्धा और संयम से प्रत्येक मास की दुर्गाष्टमी का व्रत रखकर माँ दुर्गा का पूजन करता है, उसके जीवन के दुर्गम-से-दुर्गम संकट माँ की कृपा से उसी प्रकार दूर हो जाते हैं, और उसका जीवन अन्न, आरोग्य, साहस और शांति से दीप की भाँति प्रकाशमान हो उठता है।',
        ],
        bodyEn: [
          'In that same city there lived a poor but devout merchant named Sumati, upon whom one misfortune after another had fallen. Hemmed in by losses in trade, the weight of debt, and illness, he had grown disheartened on every side. A holy man counselled him, ‘On the bright Ashtami of every month keep the vow and worship of Maa Durga; she who slew so great a demon as Durgama will drive away your troubles as well.’',
          'With faith, Sumati began to keep the vow of every Masik Durgashtami. On that day he would fast, adorn the image of the Mother with red flowers, light a lamp and recite the verses of the Durga Saptashati, and feed young maidens. Seated at the feet of the Mother, he would surrender to her all the fear and grief of his heart.',
          'In only a few months, Sumati’s life began to change — his trade flourished once more, his debt was cleared, his illness departed, and peace and contentment came to dwell in his home. It is said that for any devotee who keeps the vow of Durgashtami every month with faith and self-restraint and worships Maa Durga, the most impassable troubles of life are driven away by the grace of the Mother just so, and his life shines like a steady lamp with food, health, courage and peace.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'dattatreya-jayanti-katha',
    titleHi: 'दत्तात्रेय जयंती कथा',
    titleEn: 'Dattatreya Jayanti Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'atri-anasuya-ashram',
        titleHi: 'अत्रि और अनसूया का तप',
        titleEn: 'The penance of Atri and Anasuya',
        bodyHi: [
          'सतयुग की बात है। चित्रकूट के निकट घने वनों में महर्षि अत्रि का आश्रम था। वहाँ पंछियों का कलरव था, शीतल जलधाराएँ बहती थीं, और हवन की सुगंध दिन-रात फैली रहती थी। महर्षि अत्रि ब्रह्मा के मानस-पुत्रों में से एक थे और उनकी पत्नी थीं अनसूया, जो कर्दम ऋषि और देवहूति की कन्या थीं। दोनों ने वर्षों तक कठोर तप किया था, और उस तप की आभा से समूचा वन तेजोमय हो उठा था।',
          'अनसूया का अर्थ ही था ‘जिसमें असूया अर्थात् ईर्ष्या लेशमात्र भी न हो।’ वे संसार की सबसे पवित्र पतिव्रता मानी जाती थीं। वे प्रतिदिन सूर्योदय से पूर्व उठतीं, पति की सेवा करतीं, अतिथियों का सत्कार करतीं और किसी प्राणी के प्रति मन में कटुता न रखतीं। उनके सतीत्व का तेज ऐसा था कि कहा जाता है कि उनकी एक दृष्टि से तपती धूप शीतल छाया बन जाती और सूखी नदियाँ जल से भर जातीं।',
          'उनके पातिव्रत्य की चर्चा भूलोक से उठकर स्वर्गलोक तक पहुँच गई। देवता और ऋषि कहने लगे कि अनसूया जैसी सती तीनों लोकों में दूसरी नहीं। यह कीर्ति इतनी बढ़ी कि एक दिन उसकी गूँज त्रिदेव की पत्नियों — सरस्वती, लक्ष्मी और पार्वती — के कानों तक भी जा पहुँची, और तीनों के मन में एक सूक्ष्म-सी हलचल जाग उठी।',
        ],
        bodyEn: [
          'It was the age of Satya Yuga. In the dense forests near Chitrakuta stood the hermitage of the great sage Atri. Birdsong filled its groves, cool streams ran through it, and the fragrance of the sacred fire drifted there day and night. Atri was one of the mind-born sons of Brahma, and his wife was Anasuya, the daughter of the sage Kardama and Devahuti. Together they had practised severe penance for years, and the radiance of that penance made the whole forest glow.',
          'The very name Anasuya meant ‘one in whom there is not the slightest trace of asuya — of envy.’ She was held to be the most chaste and pure of wives in all the world. Each day she rose before sunrise, served her husband, welcomed every guest with warmth, and kept no bitterness in her heart toward any living being. So great was the power of her faithfulness that, it was said, a single glance of hers could turn the scorching sun into cool shade and fill dried rivers with water.',
          'The fame of her devotion rose from the earth and reached even the worlds of the gods. Devas and sages began to say that there was no chaste woman like Anasuya in all the three worlds. This praise grew so loud that one day its echo reached the ears of the consorts of the three great gods — Saraswati, Lakshmi and Parvati — and a subtle restlessness stirred in the hearts of all three.',
        ],
      },
      {
        id: 'narada-and-the-consorts',
        titleHi: 'नारद की वीणा और देवियों की चिंता',
        titleEn: 'Narada\'s vina and the worry of the goddesses',
        bodyHi: [
          'इन्हीं दिनों देवर्षि नारद अपनी वीणा बजाते हुए स्वर्गलोक में भ्रमण कर रहे थे। ‘नारायण-नारायण’ का गान करते हुए वे एक-एक करके तीनों देवियों के पास पहुँचे और बड़े विनम्र स्वर में अनसूया के सतीत्व का गुणगान करने लगे। ‘हे देवियो,’ उन्होंने कहा, ‘मैंने तीनों लोक देख डाले, पर अनसूया जैसी पतिव्रता कहीं नहीं पाई। उसके चरणों की धूलि के आगे तो आप तीनों का पातिव्रत्य भी फीका जान पड़ता है।’',
          'नारद की मधुर वाणी में छिपा संकेत देवियों के मन को बेध गया। सरस्वती, लक्ष्मी और पार्वती के हृदय में पहली बार एक प्रश्न उठा — क्या सचमुच कोई मर्त्य स्त्री हमसे भी श्रेष्ठ पतिव्रता हो सकती है? उन्होंने अपने-अपने स्वामी — ब्रह्मा, विष्णु और महेश — के पास जाकर हठ किया कि अनसूया के पातिव्रत्य की परीक्षा अवश्य ली जाए, ताकि सत्य प्रकट हो सके।',
          'देवियों के आग्रह को त्रिदेव टाल न सके। ब्रह्मा, विष्णु और शिव — तीनों ने मुस्कुराते हुए वह कार्य स्वीकार किया। उन्होंने सोचा कि अनसूया की निष्ठा की एक लीला रच दी जाए, जिससे संसार भी जान ले कि सच्चे पातिव्रत्य की शक्ति कितनी अपार होती है। और इस प्रकार तीनों देव साधु-वेश धारण कर पृथ्वी की ओर चल पड़े।',
        ],
        bodyEn: [
          'In those very days the celestial sage Narada was wandering through the heavens, playing upon his vina. Singing ‘Narayana, Narayana,’ he came one by one to each of the three goddesses and, in a most humble voice, began to praise the chastity of Anasuya. ‘O goddesses,’ he said, ‘I have searched all three worlds, yet nowhere have I found a faithful wife like Anasuya. Beside the dust of her feet, even the devotion of you three seems to grow pale.’',
          'The hint hidden in Narada\'s sweet words pierced the minds of the goddesses. For the first time a question rose in the hearts of Saraswati, Lakshmi and Parvati — could a mortal woman truly be a greater pativrata than we? Each went to her own lord — Brahma, Vishnu and Mahesha — and insisted that the faithfulness of Anasuya must be tested, so that the truth could be revealed.',
          'The three great gods could not turn aside the urging of their consorts. Brahma, Vishnu and Shiva — all three accepted the task with a smile. They thought to weave a single divine play around Anasuya\'s devotion, so that the world too might learn how boundless the power of true faithfulness can be. And so the three gods took on the guise of wandering ascetics and set out toward the earth.',
        ],
      },
      {
        id: 'the-test-of-the-meal',
        titleHi: 'अतिथियों की अनोखी माँग',
        titleEn: 'The strange demand of the guests',
        bodyHi: [
          'एक दोपहर, जब महर्षि अत्रि वन में स्नान और संध्या के लिए गए हुए थे, तीन तेजस्वी संन्यासी आश्रम के द्वार पर आ खड़े हुए और भिक्षा माँगने लगे। अनसूया ने उन्हें श्रद्धापूर्वक प्रणाम किया, आसन दिया और कहा, ‘हे अतिथिदेव, आप मेरे पूज्य हैं। बैठिए, अभी भोजन प्रस्तुत करती हूँ।’ अतिथि साक्षात् नारायण माने जाते हैं — यही भाव उनके मन में था।',
          'किन्तु तीनों संन्यासियों ने एक विचित्र शर्त रख दी। उन्होंने कहा, ‘हे देवी, हमने व्रत लिया है कि भोजन तभी ग्रहण करेंगे जब परोसने वाली स्त्री बिना किसी वस्त्र के, निर्वस्त्र होकर हमें भोजन कराए। यदि तुम ऐसा न कर सको तो हम भूखे ही लौट जाएँगे।’ यह सुनकर अनसूया एक क्षण के लिए स्तब्ध रह गईं, क्योंकि माँग धर्म और लज्जा दोनों की कसौटी थी।',
          'पर अनसूया विचलित न हुईं। उन्होंने मन-ही-मन सोचा — ‘यदि मेरा पातिव्रत्य सच्चा है, यदि मेरे मन में कभी कोई विकार नहीं आया, तो यह तेज मेरी रक्षा करेगा। अतिथि को भूखा लौटाना सबसे बड़ा अधर्म है।’ उन्होंने अपने पति के चरणों का स्मरण किया और दृढ़ निश्चय कर लिया कि वे अपने सतीत्व के बल से ही इस संकट को मंगल में बदल देंगी।',
        ],
        bodyEn: [
          'One afternoon, while the sage Atri had gone into the forest for his bath and evening prayers, three radiant ascetics came and stood at the hermitage gate, asking for alms. Anasuya bowed to them with reverence, offered them seats, and said, ‘O honoured guests, you are worthy of my worship. Be seated; I shall bring food at once.’ A guest is regarded as Narayana himself — this was the feeling in her heart.',
          'But the three ascetics laid down a strange condition. They said, ‘O lady, we have taken a vow to accept food only if the woman who serves us does so without any garment, serving us unclothed. If you cannot do this, we shall return hungry as we came.’ Hearing this, Anasuya was struck silent for a moment, for the demand was a test of both dharma and modesty at once.',
          'Yet Anasuya was not shaken. Within her heart she thought, ‘If my faithfulness is true, if no impure thought has ever risen in my mind, then that power will protect me. To send a guest away hungry is the gravest of wrongs.’ She remembered the feet of her husband and resolved firmly that, by the strength of her chastity alone, she would turn this peril into a blessing.',
        ],
      },
      {
        id: 'three-infants',
        titleHi: 'जल का छींटा और तीन शिशु',
        titleEn: 'A sprinkle of water and three infants',
        bodyHi: [
          'अनसूया भीतर गईं और उन्होंने अपने पति के चरण-कमलों के स्पर्श से पवित्र हुआ जल एक पात्र में भरा। फिर मन में संकल्प लेकर बोलीं — ‘यदि मैं तन-मन-वचन से सच्ची पतिव्रता हूँ, तो ये तीनों अतिथि मेरे लिए नवजात शिशुओं के समान हो जाएँ।’ इतना कहकर उन्होंने वह पवित्र जल तीनों संन्यासियों पर छिड़क दिया।',
          'जल का स्पर्श होते ही एक अद्भुत लीला घटी। ब्रह्मा, विष्णु और महेश — तीनों देव छोटे-छोटे रोते हुए शिशुओं में बदल गए। उनका सारा तेज, सारी प्रभुता उस मातृ-वात्सल्य के सामने पिघल गई। अनसूया के हृदय में तत्क्षण माँ का अपार स्नेह उमड़ पड़ा। उन्होंने तीनों शिशुओं को गोद में उठाया, झूले में सुलाया और निर्द्वंद्व होकर उन्हें अपना दूध पिलाया, जैसे कोई माता अपने ही बालकों का पालन करती है।',
          'जब महर्षि अत्रि वन से लौटे तो उन्होंने योगदृष्टि से सारा रहस्य जान लिया। अनसूया ने उन्हें सब वृत्तान्त कह सुनाया। अत्रि मुस्कुराए और बोले, ‘धन्य है तुम्हारा पातिव्रत्य, जिसने त्रिदेव को शिशु बना दिया।’ उन्होंने स्नेह से तीनों शिशुओं को देखा, और आश्रम का वह झूला तीन लोकों के स्वामियों की किलकारियों से गूँज उठा।',
        ],
        bodyEn: [
          'Anasuya went within and filled a vessel with water sanctified by the touch of her husband\'s lotus feet. Then, taking a vow in her heart, she said, ‘If in body, mind and speech I am a true and faithful wife, may these three guests become for me as newborn infants.’ Saying this, she sprinkled that holy water upon the three ascetics.',
          'The moment the water touched them, a wondrous play unfolded. Brahma, Vishnu and Mahesha — all three gods were transformed into small, crying infants. All their splendour, all their lordship melted away before that motherly tenderness. At once a boundless maternal love welled up in Anasuya\'s heart. She gathered the three infants into her lap, laid them in a cradle, and without the least hesitation nursed them at her breast, as any mother nourishes her own children.',
          'When the sage Atri returned from the forest, he perceived the whole secret through his inner vision. Anasuya told him all that had passed. Atri smiled and said, ‘Blessed is your faithfulness, which has turned the three great gods into infants.’ He gazed lovingly upon the three babes, and the cradle of that hermitage rang out with the gurgling laughter of the lords of the three worlds.',
        ],
      },
      {
        id: 'birth-of-dattatreya',
        titleHi: 'दत्तात्रेय का अवतरण',
        titleEn: 'The descent of Dattatreya',
        bodyHi: [
          'उधर स्वर्ग में जब बहुत समय तक त्रिदेव लौटकर न आए, तो सरस्वती, लक्ष्मी और पार्वती व्याकुल हो उठीं। नारद ने उन्हें सारी लीला सुनाई कि किस प्रकार उनके स्वामी अनसूया के सतीत्व से शिशु बन गए हैं। अब तीनों देवियाँ अपने अहंकार पर लज्जित हुईं और दौड़ी हुई अत्रि के आश्रम पहुँचीं। उन्होंने अनसूया के चरण पकड़कर क्षमा माँगी और प्रार्थना की कि उनके स्वामियों को पूर्व रूप में लौटा दें।',
          'अनसूया का हृदय करुणा से भर गया। उन्होंने हाथ जोड़कर त्रिदेव की स्तुति की और प्रार्थना की कि वे अपने वास्तविक स्वरूप में प्रकट हों। उनकी पवित्र वाणी सुनते ही तीनों शिशु एक हो गए और ब्रह्मा, विष्णु तथा महेश अपने दिव्य रूप में प्रकट हो उठे। प्रसन्न होकर उन्होंने कहा, ‘हे सती अनसूया, तुम्हारी निष्ठा अतुलनीय है। माँगो, जो वर चाहो।’',
          'अनसूया ने नतमस्तक होकर कहा — ‘हे देवो, यदि आप प्रसन्न हैं तो मेरी एक ही कामना है कि आप तीनों मेरे पुत्र रूप में जन्म लें।’ त्रिदेव ‘तथास्तु’ कहकर अन्तर्धान हो गए। समय आने पर मार्गशीर्ष मास की पूर्णिमा को अनसूया के गर्भ से एक तेजस्वी बालक का जन्म हुआ, जिसमें तीनों देवों का अंश समाहित था। उसका नाम पड़ा दत्तात्रेय — ‘दत्त’ अर्थात् जो दिया गया, और ‘आत्रेय’ अर्थात् अत्रि का पुत्र; क्योंकि स्वयं त्रिदेव ने अपने को इस माता-पिता को सौंप दिया था।',
          'जो भक्त इस मार्गशीर्ष पूर्णिमा को श्रद्धापूर्वक व्रत रखता है, दत्तात्रेय का स्मरण करता है और सच्चे आचरण से जीवन बिताता है, उसके मन की मलिनता धुल जाती है, घर में सुख-शान्ति का वास होता है और भगवान दत्तात्रेय की कृपा से उसे गुरु-तत्त्व का बोध प्राप्त होता है। इसी पुण्य तिथि की स्मृति में आज भी दत्तात्रेय जयंती मनाई जाती है, और सती अनसूया के अडिग पातिव्रत्य की यह कथा युग-युग तक श्रद्धालुओं के हृदय को पवित्र करती रहती है।',
        ],
        bodyEn: [
          'In the heavens, when the three gods did not return for a long while, Saraswati, Lakshmi and Parvati grew anxious. Narada told them the whole play — how their lords had been turned into infants by the chastity of Anasuya. Now the three goddesses felt shame for their pride and hurried to the hermitage of Atri. Clasping Anasuya\'s feet, they begged forgiveness and prayed that she restore their husbands to their former forms.',
          'Anasuya\'s heart filled with compassion. With folded hands she praised the three gods and prayed that they appear in their true forms. The moment her pure words were spoken, the three infants became one, and Brahma, Vishnu and Mahesha stood revealed in their divine splendour. Pleased, they said, ‘O chaste Anasuya, your devotion is beyond compare. Ask of us any boon you wish.’',
          'Bowing her head, Anasuya said, ‘O gods, if you are pleased with me, I have but one desire — that you three take birth as my son.’ Saying ‘So be it,’ the three gods vanished. When the time came, on the full-moon day of the month of Margashirsha, a radiant child was born from the womb of Anasuya, holding within him the essence of all three gods. He was named Dattatreya — ‘Datta,’ meaning the one who was given, and ‘Atreya,’ meaning the son of Atri; for the three great gods had given themselves over to this mother and father.',
          'Whoever keeps this Margashirsha Purnima as a vow with reverence, remembers Dattatreya, and lives a life of true conduct, finds the impurity of the mind washed away, sees peace and contentment dwell in the home, and through the grace of Lord Dattatreya attains the knowledge of the guru-principle. In memory of this holy day, Dattatreya Jayanti is celebrated even now, and this tale of the unshakable faithfulness of the chaste Anasuya goes on purifying the hearts of the devoted, age after age.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'amavasya-vrat-katha',
    titleHi: 'अमावस्या व्रत कथा',
    titleEn: 'Amavasya Vrat Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'brahmin-family-and-the-omen',
        titleHi: 'निर्धन ब्राह्मण और कन्या के भाग्य की चेतावनी',
        titleEn: 'The poor Brahmin and the warning over the daughter\'s fate',
        bodyHi: [
          'किसी समय एक छोटे-से गाँव में एक निर्धन ब्राह्मण अपनी पत्नी और सात पुत्रों के साथ रहता था। घर में धन का अभाव था, पर श्रद्धा और सदाचार की कोई कमी न थी। प्रत्येक प्रातः ब्राह्मण गंगा-स्नान कर पीपल के वृक्ष की परिक्रमा करता, और अमावस्या के दिन अपने पितरों को जल देकर उनका स्मरण करता। उसकी एक सुशील कन्या भी थी, जो धर्म और सेवा के संस्कारों में पली थी।',
          'जब कन्या विवाह योग्य हुई, तब माता-पिता ने एक तपस्वी पंडित को बुलाकर उसका भविष्य पूछा। पंडित ने कन्या की हस्तरेखा और जन्म-कुंडली देखकर कुछ क्षण मौन रहे, फिर गंभीर स्वर में बोले, ‘‘यह कन्या गुणवती और भाग्यशालिनी तो है, किंतु इसके ललाट पर एक दुर्योग लिखा है। विवाह होते ही इसका वैधव्य निश्चित है; इसका पति अल्पायु है।’’',
          'यह सुनते ही माता का हृदय फट पड़ा और पिता की आँखें भर आईं। उन्होंने विनती की, ‘‘हे विद्वन्, कोई उपाय अवश्य होगा। आप ही मार्ग बताइए, जिससे हमारी पुत्री का सुहाग सदा अक्षय रहे।’’ पंडित ने कुछ देर ध्यान किया और फिर एक मार्ग सुझाया, जो कठिन था पर असंभव नहीं।',
        ],
        bodyEn: [
          'Once, in a small village, there lived a poor Brahmin together with his wife and seven sons. There was no wealth in the house, yet there was no want of faith or right conduct. Every morning the Brahmin bathed in the Ganga, circled the peepal tree, and on the day of the new moon he offered water to his ancestors and remembered them. He had also a gentle daughter, raised in the disciplines of dharma and of service.',
          'When the daughter came of age to be married, her parents called a learned, austere pandit and asked him about her future. The pandit studied the lines of her hand and the chart of her birth, was silent for a few moments, and then said in a grave voice, ‘‘This girl is virtuous and fortunate, yet upon her brow a hard fate is written. The moment she is wed, her widowhood is certain; her husband is destined to a short life.’’',
          'Hearing this, the mother\'s heart broke and the father\'s eyes filled with tears. They pleaded, ‘‘O wise one, surely there must be some remedy. Show us the way by which our daughter\'s married fortune may remain forever unbroken.’’ The pandit meditated a while, and then suggested a path that was hard, yet not impossible.',
        ],
      },
      {
        id: 'the-sage-counsel',
        titleHi: 'ऋषि का परामर्श और धोबिन सोना का नाम',
        titleEn: 'The sage counsel and the name of Sona the washerwoman',
        bodyHi: [
          'पंडित ने कहा, ‘‘समुद्र पार सिंहल देश में एक धोबिन रहती है, जिसका नाम सोना है। वह ऐसी पतिव्रता और सदाचारिणी है कि उसके पुण्य के तेज से तीनों लोक प्रकाशित हैं। यदि तुम्हारी पुत्री उस सोना धोबिन की सेवा करे और वह प्रसन्न होकर अपने हाथों से इसकी माँग में सिंदूर भर दे, तो इसका सौभाग्य अक्षय हो जाएगा और इसका दुर्योग टल जाएगा।’’',
          'पर वह सोना धोबिन तो समुद्र के उस पार रहती थी, और उसके पास पहुँचने का कोई सहज मार्ग न था। यह सुनकर कन्या का छोटा भाई आगे आया और बोला, ‘‘माँ, मैं अपनी बहन के सुहाग की रक्षा के लिए समुद्र पार जाऊँगा और सोना धोबिन को यहाँ ले आऊँगा, चाहे कितना भी कष्ट क्यों न उठाना पड़े।’’ बहन-भाई का यह स्नेह देखकर सबकी आँखें छलक उठीं।',
          'इधर पंडित के परामर्श से कन्या का विवाह एक सुशील ब्राह्मण-युवक से कर दिया गया, और भाई सोना धोबिन की खोज में निकल पड़ा। जिस दिन भाई समुद्र-तट पर पहुँचा, उसने वहाँ एक विशाल पीपल का वृक्ष देखा। थककर वह उसी की छाया में बैठ गया और मन ही मन भगवान से अपनी बहन के सौभाग्य की रक्षा की प्रार्थना करने लगा।',
        ],
        bodyEn: [
          'The pandit said, ‘‘Across the sea, in the land of Sinhala, there lives a washerwoman whose name is Sona. So devoted a wife and so righteous a woman is she that by the radiance of her merit the three worlds are lit. If your daughter serves this Sona the washerwoman, and Sona, well pleased, fills the parting of her hair with vermilion by her own hand, then her good fortune shall become inexhaustible and the evil destiny shall pass away.’’',
          'But this Sona the washerwoman dwelt beyond the sea, and there was no easy road by which to reach her. Hearing this, the youngest brother of the girl stepped forward and said, ‘‘Mother, to guard my sister\'s married fortune I shall cross the sea and bring Sona the washerwoman here, however much hardship I must bear.’’ Seeing such love between sister and brother, the eyes of all overflowed.',
          'Meanwhile, upon the pandit\'s counsel, the daughter was married to a gentle young Brahmin, and the brother set out in search of Sona the washerwoman. On the day the brother reached the shore of the sea, he saw there a vast peepal tree. Wearied, he sat down in its shade and silently began to pray to God for the protection of his sister\'s good fortune.',
        ],
      },
      {
        id: 'service-of-the-washerwoman',
        titleHi: 'धोबिन की गुप्त सेवा और प्रसन्नता',
        titleEn: 'The secret service of the washerwoman and her delight',
        bodyHi: [
          'उसी पीपल पर एक गिद्ध-दंपति का घोंसला था। प्रतिदिन वह गिद्ध-जोड़ा सोना धोबिन के घर के पास से उड़कर आता था। भाई ने उन पक्षियों की बातें सुनीं और जान लिया कि वे प्रातः ही सिंहल देश को लौटेंगे। वह चुपचाप उन गिद्धों के पंखों के बीच छिपकर बैठ गया, और इस प्रकार समुद्र पार कर सोना धोबिन के नगर पहुँच गया।',
          'सोना धोबिन के घर एक विचित्र बात होने लगी। प्रतिदिन प्रातः, सोना के जागने से पहले ही, उसके घर का सारा काम पूरा मिलता—आँगन लीपा हुआ, बर्तन माँजे हुए, चूल्हा जलाने को तैयार। सोना अचंभित थी कि यह सब कौन करता है। एक रात उसने जागकर देखा तो पाया कि एक ब्राह्मण-कन्या के रूप वाली देवी-सी आकृति श्रद्धापूर्वक उसकी सेवा कर रही है। वस्तुतः वह कन्या प्रतिदिन अपने व्रत और संकल्प के बल से वहाँ पहुँचकर सेवा करती और लौट जाती थी।',
          'सोना ने स्नेह से उसका हाथ पकड़कर पूछा, ‘‘बेटी, तू कौन है और मेरी इतनी सेवा क्यों करती है?’’ कन्या ने हाथ जोड़कर अपनी सारी व्यथा कह सुनाई—पंडित की भविष्यवाणी, अपने अल्पायु पति की चिंता और सोना के पुण्य की महिमा। सुनकर सोना का हृदय करुणा और वात्सल्य से भर गया।',
        ],
        bodyEn: [
          'Upon that same peepal there was the nest of a pair of vultures. Each day this pair of birds flew in from near the house of Sona the washerwoman. The brother overheard the speech of those birds and learned that at dawn they would return to the land of Sinhala. Quietly he hid himself among the feathers of those vultures, and thus, crossing the sea, he reached the city of Sona the washerwoman.',
          'In the house of Sona the washerwoman a strange thing began to happen. Every morning, even before Sona awoke, all the work of her house was found completed — the courtyard freshly plastered, the vessels scoured clean, the hearth made ready to be lit. Sona was amazed as to who could be doing all this. One night she kept awake and saw that a figure like a goddess, in the form of a Brahmin girl, was reverently serving her. In truth that girl, by the power of her vow and her resolve, reached there each day, did the service, and returned.',
          'Sona took her hand affectionately and asked, ‘‘Daughter, who are you, and why do you serve me so?’’ Folding her hands, the girl poured out all her sorrow — the pandit\'s prophecy, her anxiety for her short-lived husband, and the glory of Sona\'s merit. Hearing it, Sona\'s heart filled with compassion and tender love.',
        ],
      },
      {
        id: 'saubhagya-restored',
        titleHi: 'सौभाग्य का दान और पति का पुनर्जीवन',
        titleEn: 'The gift of married fortune and the husband\'s return to life',
        bodyHi: [
          'सोना धोबिन का व्रत ऐसा अटल था कि वह बिना अपने पति को भोजन कराए स्वयं अन्न-जल ग्रहण नहीं करती थी। इसी पतिव्रता-धर्म के तेज से उसके पुण्य का ऐसा बल था कि यदि वह संकल्प कर ले तो मृत्यु भी लौट जाए। सोना ने उस कन्या के मस्तक पर हाथ रखकर कहा, ‘‘बेटी, तेरी सेवा और श्रद्धा से मैं प्रसन्न हूँ। मैं अपने तप का समस्त पुण्य तुझे अर्पित करती हूँ—तेरा सुहाग अक्षय रहे।’’',
          'उसी समय कन्या के घर एक भयानक घटना घट चुकी थी—उसका पति अकस्मात् काल के वश होकर प्राणहीन हो गया था। पर जैसे ही सोना ने अपने हाथों से कन्या की माँग में सिंदूर भरा और अपना सौभाग्य-पुण्य उसे दान किया, सुदूर उस ब्राह्मण-युवक के शरीर में पुनः प्राण लौट आए। वह ऐसे उठ बैठा मानो गहरी निद्रा से जागा हो, और सारे घर में हर्ष की लहर दौड़ गई।',
          'सोना ने कन्या को सीख दी, ‘‘बेटी, अमावस्या के पावन दिन पीपल के वृक्ष की एक सौ आठ बार परिक्रमा करना और हर परिक्रमा पर एक सूत का धागा लपेटते हुए मंगल-कामना करना। पीपल में स्वयं भगवान का वास है और अमावस्या पितरों के स्मरण की तिथि है। इस व्रत से तेरा सुहाग सदा सुरक्षित रहेगा।’’ कन्या ने श्रद्धापूर्वक यह संकल्प ग्रहण किया।',
        ],
        bodyEn: [
          'So unwavering was the vow of Sona the washerwoman that she would not take food or water herself without first feeding her husband. By the radiance of this faithful-wife\'s dharma, the power of her merit was such that, were she to make a resolve, even death would turn back. Sona laid her hand upon the girl\'s head and said, ‘‘Daughter, your service and your devotion have pleased me. I offer you all the merit of my austerity — may your married fortune be inexhaustible.’’',
          'At that very moment a dreadful thing had come to pass in the girl\'s home — her husband had suddenly fallen into the grip of death and become lifeless. But the instant Sona filled the parting of the girl\'s hair with vermilion by her own hand and bestowed upon her the merit of her good fortune, in that distant place the life-breath returned into the body of the young Brahmin. He sat up as though waking from deep sleep, and a wave of joy ran through the whole house.',
          'Sona gave the girl her teaching: ‘‘Daughter, on the holy day of the new moon, circle the peepal tree one hundred and eight times, and at each circling wind a thread of cotton about it, making an auspicious wish. In the peepal God himself abides, and the new moon is the day for the remembrance of the ancestors. By this vow your married fortune shall remain forever guarded.’’ Reverently the girl took up this resolve.',
        ],
      },
      {
        id: 'amavasya-peepal-and-pitru',
        titleHi: 'अमावस्या का व्रत, पीपल पूजन और पितृ स्मरण',
        titleEn: 'The Amavasya vow, peepal worship and remembrance of the ancestors',
        bodyHi: [
          'अपने भाई के साथ कन्या हर्ष से अपने नगर लौटी और सोना धोबिन की कही हुई विधि से अमावस्या व्रत का पालन करने लगी। प्रत्येक अमावस्या को वह प्रातः स्नान कर पीपल के मूल में जल चढ़ाती, दीप जलाती, और एक सौ आठ बार परिक्रमा करते हुए श्रद्धा के सूत का धागा वृक्ष के चारों ओर लपेटती। उसका लौटा हुआ पति दीर्घायु और सुखी हुआ, और दोनों का दांपत्य प्रेम और धर्म से भर उठा।',
          'उसी दिन वह अपने पितरों को भी न भूलती। अमावस्या की वेला में वह तिल और जल से तर्पण कर अपने पूर्वजों का स्मरण करती और निर्धनों को अन्न-वस्त्र का दान देती। जैसे पीपल की छाया पथिक को विश्राम देती है, वैसे ही उसके इस व्रत की छाया में उसके कुल के पितर तृप्त होकर आशीर्वाद बरसाते।',
          'तभी से यह प्रथा चली कि अमावस्या के दिन, विशेषकर सोमवती अमावस्या को, सुहागिनें पीपल की एक सौ आठ परिक्रमा कर उसमें सूत लपेटती हैं और अपने सुहाग की रक्षा माँगती हैं। कहते हैं, जो स्त्री इस कथा को श्रद्धा से सुनती और अमावस्या का यह व्रत धारण करती है, उसका सौभाग्य सोना धोबिन के पुण्य-सा अक्षय रहता है, उसके पितर प्रसन्न होते हैं, और उसके घर में सुख, सौभाग्य तथा कल्याण सदा निवास करते हैं।',
        ],
        bodyEn: [
          'With her brother, the girl returned joyfully to her own city and began to keep the Amavasya vow in the manner that Sona the washerwoman had told her. On every new-moon day she bathed at dawn, offered water at the root of the peepal, lit a lamp, and as she circled the tree one hundred and eight times she wound a thread of devotion about it. Her husband, restored to life, grew long-lived and content, and the married life of the two filled with love and with dharma.',
          'On that same day she did not forget her ancestors either. In the hour of the new moon she offered libations of sesame and water in remembrance of her forebears, and gave gifts of food and clothing to the poor. As the shade of the peepal grants rest to a wayfarer, so in the shade of this vow of hers the ancestors of her line were satisfied and showered down their blessings.',
          'From that time the custom arose that on the day of the new moon, and especially on Somvati Amavasya, married women circle the peepal one hundred and eight times, wind cotton thread about it, and ask for the protection of their married fortune. It is said that the woman who listens to this tale with faith and keeps this vow of the new moon finds her good fortune as inexhaustible as the merit of Sona the washerwoman; her ancestors are well pleased, and in her home happiness, good fortune, and welfare forever abide.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'vivah-panchami-katha',
    titleHi: 'विवाह पंचमी कथा',
    titleEn: 'Vivah Panchami Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'furrow-and-the-child',
        titleHi: 'हल की रेखा में मिली कन्या',
        titleEn: 'The child found in the furrow',
        bodyHi: [
          'मिथिला की भूमि वर्षों से सूखी पड़ी थी, और राजा जनक चिंतित थे। ऋषियों ने उन्हें परामर्श दिया कि वे स्वयं अपने हाथों से यज्ञभूमि को हल से जोतें, तभी मेघ बरसेंगे और धरती फिर से हरी होगी। सोने का हल लेकर राजा जनक ने अपने राज्य की मिट्टी में पहली रेखा खींची।',
          'हल की नोक जैसे ही एक स्थान पर पहुंची, धरती से एक मधुर ध्वनि उठी और मिट्टी स्वयं हट गई। वहां एक स्वर्णमयी मंजूषा में लेटी हुई एक नन्ही कन्या दिखाई दी, जिसका मुख प्रातःकाल के सूर्य-सा दीप्त था। राजा जनक का हृदय वात्सल्य से भर उठा, मानो उन्हें वर्षों की प्रतीक्षा का फल मिल गया हो।',
          'राजा जनक की रानी सुनयना ने उस कन्या को गोद में उठाया और छाती से लगा लिया। चूंकि वह भूमि की रेखा अर्थात् ‘सीता’ से प्रकट हुई थी, इसलिए उसका नाम सीता रखा गया। जनक उसे ‘जानकी’ कहकर पुकारते और मिथिला की होने के कारण वह ‘मैथिली’ कहलाई। वह साक्षात् भूमि की पुत्री थी और राजमहल की प्रिय राजकुमारी बन गई।',
        ],
        bodyEn: [
          'The land of Mithila had lain dry for years, and King Janaka was troubled. The sages counselled him to plough the sacrificial ground with his own hands, for only then would the clouds gather, the rains fall, and the earth turn green once more. Taking a golden plough, King Janaka drew the first furrow through the soil of his kingdom.',
          'The moment the tip of the plough reached a certain spot, a sweet sound rose from the ground and the earth parted of its own accord. There, lying within a golden casket, was a tiny infant girl whose face shone like the morning sun. King Janaka heart filled with tenderness, as though the fruit of years of waiting had been placed before him.',
          'Queen Sunayana, the wife of King Janaka, lifted the child into her arms and held her to her breast. Because she had appeared from the furrow line of the earth, which is called ‘Sita,’ she was given the name Sita. Janaka called her ‘Janaki,’ and being of Mithila she came to be known as ‘Maithili.’ She was the very daughter of the earth, and she became the beloved princess of the royal house.',
        ],
      },
      {
        id: 'shiva-dhanush-and-the-vow',
        titleHi: 'शिव-धनुष और स्वयंवर का प्रण',
        titleEn: 'The bow of Shiva and the vow of the swayamvara',
        bodyHi: [
          'जनक के राजकुल में एक अत्यंत विशाल और तेजोमय धनुष पूजा जाता था। यह वही पिनाक था जिसे स्वयं भगवान शिव ने जनक के पूर्वजों को सौंपा था। इतना भारी था वह धनुष कि सहस्रों वीर मिलकर भी उसे हिला तक नहीं पाते थे, और मिथिला के राजमहल में वह श्रद्धा से प्रतिष्ठित था।',
          'एक दिन बालिका सीता ने खेल-खेल में उस धनुष-मंजूषा को एक हाथ से उठाकर सहज ही दूसरी ओर रख दिया, जिससे वह स्थान स्वच्छ हो सके। यह देखकर राजा जनक विस्मित रह गए। उन्होंने जान लिया कि यह कोई साधारण कन्या नहीं; इसका वर भी कोई असाधारण पुरुष ही हो सकता है, जो इस शिव-धनुष को धारण करने का सामर्थ्य रखता हो।',
          'जब सीता विवाह योग्य हुईं, तब राजा जनक ने प्रण किया, ‘‘जो वीर इस पिनाक धनुष को उठाकर उसकी प्रत्यंचा चढ़ा देगा, मैं अपनी पुत्री जानकी का विवाह उसी के साथ करूंगा।’’ यह घोषणा सुनकर पृथ्वी भर के अनेक राजा और राजकुमार मिथिला में स्वयंवर के लिए एकत्र हुए।',
        ],
        bodyEn: [
          'In the royal house of Janaka, a bow of vast size and blazing power was worshipped. It was the very Pinaka that Lord Shiva himself had entrusted to the ancestors of Janaka. So heavy was that bow that thousands of warriors together could not so much as stir it, and it stood enshrined with reverence in the palace of Mithila.',
          'One day, in the course of her play, the little girl Sita lifted the casket holding the bow with one hand and set it aside with ease, so that the place might be swept clean. Seeing this, King Janaka was astonished. He understood that this was no ordinary child, and that her husband too must be some extraordinary man, one with the strength to wield this bow of Shiva.',
          'When Sita came of age to be married, King Janaka made a vow: ‘‘Whichever hero lifts this Pinaka bow and strings its cord, to him alone shall I give my daughter Janaki in marriage.’’ Hearing this proclamation, many kings and princes from across the earth gathered in Mithila for the swayamvara.',
        ],
      },
      {
        id: 'rama-arrives-in-mithila',
        titleHi: 'मिथिला में राम का आगमन',
        titleEn: 'Rama arrives in Mithila',
        bodyHi: [
          'उन्हीं दिनों अयोध्या के राजकुमार श्रीराम और उनके अनुज लक्ष्मण, महर्षि विश्वामित्र के साथ यज्ञ की रक्षा करते हुए मिथिला की ओर आ निकले। नगर के मार्गों पर जब उन दोनों भाइयों के दर्शन हुए, तो मिथिलावासियों के नेत्र उन पर से हटते ही न थे; श्रीराम का श्याम-सुंदर रूप सबके हृदय में बस गया।',
          'पुष्पवाटिका में पूजा के लिए जाती हुई सीता की दृष्टि अनायास ही श्रीराम पर पड़ी, और दोनों के मन एक-दूसरे की ओर खिंच गए। सीता ने मन ही मन माता गौरी से प्रार्थना की कि यही नीलमेघ-समान राजकुमार उनके जीवनसाथी बनें। माता गौरी ने प्रसन्न होकर उन्हें मनोवांछित वर का आशीर्वाद दिया।',
          'अगले दिन स्वयंवर की सभा सजी। देश-देश के बलशाली राजा बारी-बारी से उस शिव-धनुष को उठाने आगे आए, किंतु कोई उसे तनिक भी न हिला सका। कई तो उसके भार के नीचे लज्जित होकर लौट गए। सारी सभा में निराशा छा गई, और राजा जनक का मन व्याकुल हो उठा कि कहीं उनका प्रण अधूरा न रह जाए।',
        ],
        bodyEn: [
          'In those very days, Prince Rama of Ayodhya and his younger brother Lakshmana, guarding a sacrifice in the company of the great sage Vishvamitra, came near to Mithila. When the two brothers were seen upon the streets of the city, the eyes of the people of Mithila could not turn away from them; the dark and beautiful form of Rama settled into every heart.',
          'As Sita was going to the flower garden for her worship, her gaze fell upon Rama unawares, and the hearts of the two were drawn toward each other. In the silence of her mind Sita prayed to Mother Gauri that this prince, dark as a rain cloud, might become the companion of her life. Mother Gauri, well pleased, blessed her that she would obtain the husband her heart desired.',
          'The next day the assembly of the swayamvara was arrayed. Mighty kings from land after land came forward in turn to lift the bow of Shiva, yet not one could stir it in the least. Many turned back, shamed beneath its weight. Disappointment spread through the whole gathering, and the heart of King Janaka grew anxious lest his vow remain unfulfilled.',
        ],
      },
      {
        id: 'breaking-of-the-bow',
        titleHi: 'शिव-धनुष का टूटना',
        titleEn: 'The breaking of the bow',
        bodyHi: [
          'जब कोई वीर उस धनुष को न उठा सका, तब राजा जनक ने व्यथित होकर कहा कि क्या यह पृथ्वी वीरों से सूनी हो गई है। यह सुनकर लक्ष्मण को क्रोध आया, किंतु महर्षि विश्वामित्र ने स्नेह से श्रीराम की ओर देखकर कहा, ‘‘हे राम, उठो और इस धनुष को देखो।’’ गुरु की आज्ञा शिरोधार्य कर श्रीराम शांत भाव से उठे।',
          'श्रीराम ने धनुष को प्रणाम किया, फिर उसे एक हाथ से सहज ही उठा लिया। सारी सभा अवाक् रह गई। जैसे ही उन्होंने उस पर प्रत्यंचा चढ़ाने के लिए उसे झुकाया, वह विशाल पिनाक धनुष बीच से ‘कड़’ की भीषण ध्वनि के साथ टूट गया। वह गर्जना तीनों लोकों में गूंज उठी, और देवताओं ने आकाश से पुष्प बरसाए।',
          'धनुष टूटते ही सीता का मुख आनंद से खिल उठा। वे मंगल माला लेकर श्रीराम के समीप आईं और श्रद्धा से उनके कंठ में वरमाला पहना दी। राजा जनक का प्रण पूर्ण हुआ और उनका हृदय हर्ष से भर गया। उन्होंने तत्काल अयोध्या के महाराज दशरथ को संदेश भेजा कि वे अपने पुत्रों के विवाह के लिए मिथिला पधारें।',
        ],
        bodyEn: [
          'When no hero could lift the bow, King Janaka said in his grief that perhaps the earth had been emptied of brave men. Hearing this, Lakshmana grew angry, but the great sage Vishvamitra looked with affection toward Rama and said, ‘‘O Rama, rise and behold this bow.’’ Bowing to the command of his guru, Rama rose calmly to his feet.',
          'Rama bowed to the bow, then lifted it with a single hand as though it were nothing. The whole assembly was struck silent. The instant he bent it to draw the string upon it, that vast Pinaka bow snapped through the middle with a fearful crack. The thunder of it echoed through the three worlds, and the gods rained down flowers from the sky.',
          'As the bow broke, Sita face blossomed with joy. Carrying the auspicious garland, she came near to Rama and reverently placed the bridal wreath about his neck. The vow of King Janaka was fulfilled, and his heart was filled with delight. At once he sent word to Maharaja Dasharatha of Ayodhya, asking him to come to Mithila for the marriage of his sons.',
        ],
      },
      {
        id: 'wedding-at-janakpur',
        titleHi: 'जनकपुर में विवाह और पंचमी का पुण्य',
        titleEn: 'The wedding at Janakpur and the merit of Panchami',
        bodyHi: [
          'महाराज दशरथ अपने परिवार, गुरु वसिष्ठ और बारात के साथ बड़े उल्लास से जनकपुर पहुंचे। मिथिला नगरी तोरणों, दीपों और मंगल-कलशों से सजाई गई। मार्गशीर्ष मास के शुक्ल पक्ष की पंचमी तिथि को, शुभ मुहूर्त में, वेदमंत्रों की ध्वनि के बीच श्रीराम और सीता का विवाह संपन्न हुआ।',
          'उसी मंगल वेला में चारों भाइयों के विवाह एक साथ हुए—श्रीराम के साथ सीता, लक्ष्मण के साथ उर्मिला, तथा भरत और शत्रुघ्न के साथ माण्डवी और श्रुतकीर्ति। राजा जनक ने अपनी पुत्रियों को आशीर्वाद और दान देकर विदा किया, और दोनों कुलों में अपार आनंद की वर्षा हुई।',
          'इसी पावन तिथि की स्मृति में प्रतिवर्ष मार्गशीर्ष शुक्ल पंचमी को विवाह पंचमी का पर्व मनाया जाता है, और भक्त सीता-राम के विवाह का उत्सव श्रद्धा से रचते हैं। कहते हैं कि जो दंपति इस दिन सीता-राम की पूजा करते और इस मंगल-कथा का श्रवण करते हैं, उनका दांपत्य जीवन प्रेम, धर्म और स्थिरता से भर जाता है। जैसे सीता और राम का बंधन मर्यादा और भक्ति का आदर्श बना, वैसे ही इस व्रत को धारण करने वाले के घर में सुख, सौभाग्य और कल्याण सदा निवास करते हैं।',
        ],
        bodyEn: [
          'Maharaja Dasharatha, with his family, his guru Vasishtha, and the wedding party, reached Janakpur in great joy. The city of Mithila was adorned with festive arches, lamps, and auspicious pots. On the fifth day of the bright half of the month of Margashirsha, at the blessed hour and amid the sound of Vedic chants, the marriage of Rama and Sita was solemnised.',
          'In that same auspicious moment the four brothers were wed together, Sita with Rama, Urmila with Lakshmana, and Mandavi and Shrutakirti with Bharata and Shatrughna. King Janaka sent his daughters away with blessings and gifts, and a boundless joy rained over both houses.',
          'In memory of this holy day, the festival of Vivah Panchami is kept every year on the fifth bright day of Margashirsha, and devotees lovingly celebrate the wedding of Sita and Rama. It is said that the couple who worship Sita and Rama on this day and listen to this auspicious tale find their married life filled with love, dharma, and steadiness. As the bond of Sita and Rama became the ideal of honour and devotion, so too in the home of one who keeps this vow do happiness, good fortune, and welfare forever abide.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'navratri-start-katha',
    titleHi: 'नवरात्रि प्रारंभ कथा',
    titleEn: 'Navratri Begins Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'mahishasura-rises',
        titleHi: 'महिषासुर का अभ्युदय',
        titleEn: 'The rise of Mahishasura',
        bodyHi: [
          'बहुत पहले की बात है, असुरों के राजा रंभ की तपस्या से एक ऐसा पुत्र उत्पन्न हुआ जो आधा भैंसे और आधा दानव के रूप में जन्मा। महिष अर्थात भैंसे का यह स्वरूप पाकर वह ‘महिषासुर’ कहलाया। वह जन्म से ही प्रचंड बलशाली था, और जैसे-जैसे बड़ा होता गया, उसके मन में तीनों लोकों पर अधिकार पाने की लालसा गहराती चली गई।',
          'अपनी इच्छा पूरी करने के लिए महिषासुर वन में चला गया और वहाँ उसने ब्रह्मा जी को प्रसन्न करने के लिए कठोर तप आरंभ किया। वर्षों तक उसने अन्न-जल त्यागकर, एक पाँव पर खड़े होकर, अपने भीतर की समस्त शक्ति को एक ही संकल्प में बाँध लिया। उसकी तपस्या की प्रचंड अग्नि से व्याकुल होकर अंततः सृष्टि के रचयिता ब्रह्मा उसके सम्मुख प्रकट हुए।',
          '‘तेरी तपस्या से मैं प्रसन्न हूँ,’ ब्रह्मा बोले, ‘माँग, क्या वर चाहता है?’ महिषासुर ने हाथ जोड़कर कहा, ‘हे प्रभु, मुझे अमरता दीजिए, ऐसा वर दीजिए कि मेरी मृत्यु कभी न हो।’ ब्रह्मा ने मंद स्वर में उत्तर दिया, ‘जो जन्मा है, उसकी मृत्यु निश्चित है; अमरता का वर देना सृष्टि के नियम के विरुद्ध है। तू कोई और वर माँग ले।’',
        ],
        bodyEn: [
          'Long, long ago, from the penance of Rambha, the king of the asuras, was born a son who came into the world half buffalo and half demon. Having taken the form of a mahisha, a buffalo, he came to be called Mahishasura. He was tremendously strong from birth, and as he grew, the longing to seize dominion over all three worlds deepened steadily within his heart.',
          'To win what he desired, Mahishasura went away into the forest and there began a severe penance to please Lord Brahma. For years he gave up food and water, stood upon a single foot, and bound all the strength within him to one single resolve. Tormented at last by the fierce fire of his austerity, Brahma, the creator of the worlds, appeared before him.',
          '‘I am pleased with your penance,’ Brahma said. ‘Ask — what boon do you desire?’ Folding his hands, Mahishasura replied, ‘O Lord, grant me immortality; give me such a boon that my death may never come.’ Brahma answered in a gentle voice, ‘Whatever is born must surely die; to grant the boon of deathlessness is against the very law of creation. Ask for some other boon instead.’',
        ],
      },
      {
        id: 'the-boon-and-conquest',
        titleHi: 'वरदान और तीनों लोकों पर विजय',
        titleEn: 'The boon and the conquest of the three worlds',
        bodyHi: [
          'महिषासुर कुछ क्षण सोचता रहा। फिर उसके मन में एक धूर्ततापूर्ण विचार कौंधा, और उसने कहा, ‘तो हे विधाता, मुझे यह वर दीजिए कि किसी देवता, किसी दानव या किसी पुरुष के हाथों मेरी मृत्यु न हो। केवल कोई स्त्री ही मेरा वध कर सके।’ अपने अहंकार में वह यह सोच रहा था कि भला कोई कोमल नारी उस जैसे महाबली का संहार कैसे करेगी।',
          'ब्रह्मा ‘एवमस्तु’ कहकर अंतर्धान हो गए। उस वर से दर्प में भरकर महिषासुर ने स्वयं को अजेय मान लिया। उसने असुरों की विशाल सेना एकत्र की और स्वर्ग पर आक्रमण कर दिया। देवराज इंद्र और समस्त देवगण उससे युद्ध करते रहे, पर उसके अपार बल के आगे एक-एक करके पराजित होते गए।',
          'महिषासुर ने इंद्र को सिंहासन से उतार दिया, सूर्य, वायु, अग्नि और यम के अधिकार छीन लिए, और स्वयं तीनों लोकों का स्वामी बन बैठा। पराजित देवता अपना वैभव खोकर, मनुष्यों की भाँति पृथ्वी पर भटकने लगे। अंत में निराश होकर वे सहायता की आशा में ब्रह्मा, विष्णु और शिव के समीप पहुँचे।',
        ],
        bodyEn: [
          'Mahishasura pondered for a few moments. Then a cunning thought flashed in his mind, and he said, ‘Then, O maker of worlds, grant me this boon — that my death may not come at the hands of any god, any demon, or any man. Let only a woman be able to slay me.’ In his arrogance he was thinking that no gentle woman could ever destroy a mighty one such as himself.',
          'Saying ‘So be it,’ Brahma vanished. Swollen with pride at that boon, Mahishasura believed himself to be invincible. He gathered a vast army of asuras and launched an assault upon the heavens. Indra, the king of the gods, and all the host of devas fought against him, but before his immense strength they were defeated one by one.',
          'Mahishasura cast Indra down from his throne, wrested away the offices of the Sun, the Wind, Fire and Yama, and seated himself as the master of all three worlds. The vanquished gods, stripped of their splendour, began to wander upon the earth like ordinary men. At last, in despair, they went in hope of help to Brahma, Vishnu and Shiva.',
        ],
      },
      {
        id: 'radiance-of-the-gods',
        titleHi: 'देवताओं के तेज से देवी का प्राकट्य',
        titleEn: 'The Goddess born of the radiance of the gods',
        bodyHi: [
          'देवताओं की करुण पुकार सुनकर विष्णु और शिव अत्यंत क्रोधित हुए। उनके भीतर का तेज दहक उठा और उनके मुख से एक प्रचंड ज्योति प्रकट हुई। उसी क्षण ब्रह्मा, इंद्र तथा अन्य समस्त देवताओं के शरीर से भी तेजपुंज निकलकर उस ज्योति में मिलने लगा। सहस्र सूर्यों के समान दीप्तिमान वह संयुक्त तेज एक ही स्थान पर सिमटता गया।',
          'उस दिव्य तेज से धीरे-धीरे एक अनुपम नारी का स्वरूप साकार हुआ — अठारह भुजाओं वाली, अपूर्व कांति से दमकती, मुख पर मंद स्मित किंतु नेत्रों में अदम्य पराक्रम लिए। शिव के तेज से उसका मुख बना, यम के तेज से केश, विष्णु के तेज से भुजाएँ, और चंद्रमा के तेज से उसके वक्षस्थल का सौंदर्य। इस प्रकार समस्त देवताओं की शक्ति एक होकर महाशक्ति दुर्गा के रूप में प्रकट हुई।',
          'देवी का यह स्वरूप देखकर देवताओं का हृदय हर्ष से भर उठा। उन्होंने अपने-अपने दिव्य अस्त्र उन्हें भेंट किए — शिव ने त्रिशूल, विष्णु ने चक्र, वरुण ने शंख, अग्नि ने शक्ति, वायु ने धनुष-बाण, और इंद्र ने वज्र। हिमालय ने उन्हें सवारी के लिए एक विशाल सिंह अर्पित किया। समस्त आयुधों से सुसज्जित होकर देवी का अट्टहास तीनों लोकों में गूँज उठा।',
        ],
        bodyEn: [
          'Hearing the piteous cry of the gods, Vishnu and Shiva were filled with great anger. The radiance within them blazed up, and from their faces a fierce light burst forth. In that very moment, a stream of brilliance issued also from the bodies of Brahma, Indra and all the other gods, and began to merge into that light. Dazzling like a thousand suns, the combined radiance gathered together into one single place.',
          'Out of that divine radiance, the form of a peerless woman slowly took shape — eighteen-armed, glowing with an extraordinary lustre, a gentle smile upon her face yet an unconquerable valour in her eyes. From Shiva’s radiance her face was formed, from Yama’s her hair, from Vishnu’s her many arms, and from the radiance of the Moon the beauty of her breast. Thus did the power of all the gods become one and appear in the form of the great Shakti, Durga.',
          'Seeing this form of the Goddess, the hearts of the gods filled with joy. Each offered her his own divine weapon — Shiva gave the trident, Vishnu the discus, Varuna the conch, Agni a flaming spear, Vayu the bow and arrows, and Indra the thunderbolt. Himalaya offered her a mighty lion to ride upon. Adorned with every weapon, the Goddess gave a great roar of laughter that echoed through all three worlds.',
        ],
      },
      {
        id: 'nine-nights-of-battle',
        titleHi: 'नौ रातों और नौ दिनों का संग्राम',
        titleEn: 'Nine nights and nine days of battle',
        bodyHi: [
          'देवी दुर्गा का वह सिंहनाद सुनकर महिषासुर चौंक उठा। उसने अपने दूतों और फिर अपने महावीर सेनापतियों — चिक्षुर, चामर, उदग्र, महाहनु आदि — को सेना सहित देवी से युद्ध करने भेजा। किंतु देवी ने अपने अस्त्रों से एक-एक कर उन सबका संहार कर डाला; उनके सिंह ने भी असुरों को अपने पंजों से चीर दिया।',
          'अपनी सेना का नाश होते देख महिषासुर स्वयं युद्धभूमि में उतरा। वह बार-बार अपना रूप बदलता — कभी विकराल भैंसा बनकर सींगों से पर्वत उछालता, कभी सिंह, कभी हाथी, तो कभी सहस्र भुजाओं वाला योद्धा बन जाता। नौ रातों और नौ दिनों तक यह घोर संग्राम चलता रहा; उसकी माया के आगे एक क्षण को सृष्टि भी काँप उठती, पर देवी अविचल खड़ी रहीं।',
          'हर बार जब असुर कोई नया रूप धरकर देवी को छलना चाहता, देवी अपने किसी नवीन स्वरूप में प्रकट होकर उसका सामना करतीं। नौ रातों के इस युद्ध में उनके नौ रूप क्रमशः प्रकट हुए, और यही नौ रातें आगे चलकर ‘नवरात्रि’ कहलाईं — माँ की शक्ति के नौ रूपों के पूजन की पावन रातें।',
        ],
        bodyEn: [
          'Hearing that lion’s roar of Devi Durga, Mahishasura was startled. He sent first his messengers and then his mighty generals — Chikshura, Chamara, Udagra, Mahahanu and others — with their armies to do battle with the Goddess. But with her weapons the Goddess slew them all one by one; her lion too tore the asuras apart with its claws.',
          'Seeing his army destroyed, Mahishasura himself came down onto the field of battle. Again and again he changed his form — now becoming a fearsome buffalo, tossing mountains with his horns; now a lion, now an elephant, now a warrior with a thousand arms. For nine nights and nine days this terrible struggle raged on; before his illusions the very creation trembled for a moment, yet the Goddess stood unmoved.',
          'Each time the demon took on a new form to deceive her, the Goddess appeared in one of her own new forms to confront him. Through this battle of nine nights, her nine forms manifested one after another, and these very nine nights came afterwards to be called ‘Navratri’ — the sacred nights for the worship of the nine forms of the Mother’s power.',
        ],
      },
      {
        id: 'slaying-on-the-tenth',
        titleHi: 'दसवें दिन महिषासुर का वध',
        titleEn: 'The slaying of Mahishasura on the tenth day',
        bodyHi: [
          'जैसे ही दसवाँ दिन आया, देवी ने अपनी समस्त शक्ति समेट ली। जिस क्षण महिषासुर पुनः अपने मूल भैंसे के रूप में उन पर झपटा, देवी ने तत्क्षण उछलकर अपने चरण उसके मस्तक पर रख दिए और उसे भूमि पर दबा दिया। अपने त्रिशूल से उन्होंने उसके कंठ को बेध डाला।',
          'त्रिशूल की चोट से जब असुर भैंसे के रूप से बाहर निकलने लगा, तभी देवी ने अपने तीक्ष्ण खड्ग से उसका मस्तक धड़ से अलग कर दिया। जिस अहंकारी दानव ने स्वयं को अजेय माना था, वह एक नारी की शक्ति के सम्मुख ढेर हो गया। उसी क्षण से देवी ‘महिषासुरमर्दिनी’ कहलाईं — महिषासुर का संहार करने वाली देवी।',
          'अधर्म के नाश और धर्म की विजय का वह दिन ‘विजयादशमी’ कहलाया। देवताओं ने पुष्पवर्षा की, स्वर्ग को अपना खोया हुआ राज्य पुनः मिल गया, और तीनों लोकों में आनंद की लहर दौड़ गई। नौ रातों की साधना के बाद दसवें दिन की वह विजय सदा के लिए बुराई पर भलाई के विजय का प्रतीक बन गई।',
        ],
        bodyEn: [
          'As soon as the tenth day arrived, the Goddess gathered up all her power. The instant Mahishasura sprang at her once more in his original buffalo form, the Goddess at once leapt up, set her feet upon his head and pressed him down to the ground. With her trident she pierced through his throat.',
          'When, struck by the trident, the demon began to emerge out of the buffalo shape, the Goddess with her keen sword struck his head from his body. The arrogant demon who had believed himself invincible was laid low before the power of a woman. From that very moment the Goddess came to be called ‘Mahishasuramardini’ — the Goddess who slew Mahishasura.',
          'That day of the destruction of unrighteousness and the triumph of dharma came to be called ‘Vijayadashami.’ The gods rained down flowers, the heavens regained their lost kingdom, and a wave of joy ran through all three worlds. After nine nights of devotion, that victory upon the tenth day became forever the emblem of the triumph of good over evil.',
        ],
      },
      {
        id: 'the-nine-forms',
        titleHi: 'नवरात्रि और देवी के नौ रूप',
        titleEn: 'Navratri and the nine forms of the Goddess',
        bodyHi: [
          'तभी से प्रत्येक वर्ष आश्विन मास के शुक्ल पक्ष में वह पावन पर्व मनाया जाता है, जब घर-घर में नौ रातों तक माँ की शक्ति का पूजन होता है। प्रथम रात्रि को शैलपुत्री, द्वितीया को ब्रह्मचारिणी, तृतीया को चंद्रघंटा, चतुर्थी को कूष्मांडा, पंचमी को स्कंदमाता, षष्ठी को कात्यायनी, सप्तमी को कालरात्रि, अष्टमी को महागौरी और नवमी को सिद्धिदात्री के रूप में देवी की आराधना की जाती है।',
          'भक्तजन इन नौ दिनों में उपवास रखते हैं, कलश की स्थापना करते हैं और दीप जलाकर माँ की स्तुति करते हैं। कुछ श्रद्धालु अखंड ज्योति प्रज्वलित कर नौ रातों तक उसकी रक्षा करते हैं, तो कोई जौ बोकर हरियाली के रूप में देवी के मांगलिक आशीर्वाद का स्वागत करता है। प्रत्येक रात्रि का अपना रंग, अपना भोग और अपना भाव होता है।',
          'कहा जाता है कि जो श्रद्धा और संयम से नवरात्रि का व्रत रखकर माँ दुर्गा की उपासना करता है, उसके भीतर के भय, आलस्य और अहंकाररूपी असुर उसी प्रकार पराजित हो जाते हैं जैसे महिषासुर हुआ था। माँ की कृपा से साधक को शक्ति, बुद्धि, समृद्धि और निर्भयता का वरदान मिलता है, और उसका जीवन धर्म के मार्ग पर दीप की भाँति प्रकाशमान हो उठता है।',
        ],
        bodyEn: [
          'Ever since then, every year in the bright fortnight of the month of Ashwin, that sacred festival is celebrated, when in home after home the power of the Mother is worshipped for nine nights. On the first night she is adored as Shailaputri, on the second as Brahmacharini, on the third as Chandraghanta, on the fourth as Kushmanda, on the fifth as Skandamata, on the sixth as Katyayani, on the seventh as Kalaratri, on the eighth as Mahagauri, and on the ninth as Siddhidatri.',
          'During these nine days, devotees keep fasts, install the sacred kalasha, and light lamps to sing the praises of the Mother. Some keep an unbroken flame burning and guard it through all nine nights, while others sow barley and welcome, in its fresh green shoots, the auspicious blessing of the Goddess. Each night has its own colour, its own offering, and its own mood.',
          'It is said that whoever keeps the Navratri vow with devotion and self-restraint and worships Maa Durga finds the demons of fear, sloth and pride within himself defeated, just as Mahishasura was. By the grace of the Mother the seeker is granted strength, wisdom, prosperity and fearlessness, and his life shines upon the path of dharma like a steady lamp.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'gita-jayanti-katha',
    titleHi: 'गीता जयंती कथा',
    titleEn: 'Gita Jayanti Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'kurukshetra-arrayed',
        titleHi: 'कुरुक्षेत्र की रणभूमि और दो सेनाएँ',
        titleEn: 'The field of Kurukshetra and the two armies',
        bodyHi: [
          'मार्गशीर्ष मास की उस शुक्ल एकादशी की भोर में कुरुक्षेत्र की विशाल समभूमि शंखों की गर्जना से थर्रा उठी। एक ओर धृतराष्ट्र के पुत्रों की कौरव सेना अपने अनगिनत रथों, हाथियों और ध्वजाओं के साथ खड़ी थी, और दूसरी ओर पाण्डवों की सेना धर्म के संकल्प से अटल होकर डटी हुई थी। दोनों दलों के बीच केवल एक संकरी पट्टी भर का अंतर था, और वायु में युद्ध की आहट तैर रही थी।',
          'उसी क्षण अर्जुन का दिव्य रथ, जिस पर हनुमान अंकित ध्वजा फहरा रही थी और जिसकी रास स्वयं भगवान श्रीकृष्ण ने थाम रखी थी, सेनाओं के मध्य में आगे बढ़ा। अर्जुन ने अपने सारथि माधव से कहा, ‘हे अच्युत, मेरे रथ को दोनों सेनाओं के ठीक बीच में ले चलिए, ताकि मैं देख सकूँ कि इस घोर संग्राम में किन-किन वीरों से मुझे जूझना है।’',
          'श्रीकृष्ण ने रथ को आगे बढ़ाकर ठीक भीष्म, द्रोण और समस्त राजाओं के सम्मुख खड़ा कर दिया और बोले, ‘हे पार्थ, इन एकत्र हुए कुरुवंशियों को देख।’ अर्जुन ने दृष्टि घुमाई तो उसने दोनों ओर अपने ही पितामह, गुरु, मामा, भाई, पुत्र, पौत्र और प्रिय मित्रों को शस्त्र उठाए खड़ा पाया।',
        ],
        bodyEn: [
          'At the dawn of that bright eleventh day of the month of Margashirsha, the vast level field of Kurukshetra trembled with the roar of conch shells. On one side stood the Kaurava army of the sons of Dhritarashtra, with its countless chariots, elephants, and banners, and on the other the army of the Pandavas, unshaken in its resolve for dharma. Between the two hosts lay only a narrow strip of ground, and the breath of war drifted upon the air.',
          'In that very moment the divine chariot of Arjuna, upon which flew the banner marked with Hanuman and whose reins were held by Lord Krishna himself, moved forward into the midst of the armies. Arjuna said to his charioteer Madhava, ‘O Achyuta, draw my chariot to the very centre between the two hosts, so that I may behold the warriors with whom I must contend in this terrible battle.’',
          'Krishna drew the chariot ahead and brought it to a halt directly before Bhishma, Drona, and all the assembled kings, and said, ‘O Partha, behold these gathered sons of Kuru.’ When Arjuna turned his gaze, he saw on both sides his own grandsires, teachers, uncles, brothers, sons, grandsons, and dear friends standing with weapons raised.',
        ],
      },
      {
        id: 'arjuna-vishada',
        titleHi: 'अर्जुन का विषाद और धनुष का गिरना',
        titleEn: 'Arjuna\'s despondency and the falling of the bow',
        bodyHi: [
          'अपने ही स्वजनों को रणभूमि में आमने-सामने देखकर अर्जुन का हृदय करुणा और शोक से भर उठा। उसके अंग शिथिल पड़ गए, मुख सूख गया, शरीर काँपने लगा और रोम-रोम सिहर उठा। उसका प्रसिद्ध गाण्डीव धनुष हाथ से फिसलकर गिरने लगा और वह खड़े रहने तक की शक्ति न पा सका।',
          'व्याकुल होकर अर्जुन ने कहा, ‘हे केशव, अपने ही बन्धुओं को मारकर मैं किस सुख की कामना करूँ? मुझे न विजय चाहिए, न राज्य, न भोग। जिन गुरुजनों और प्रियजनों के लिए यह सब वांछनीय था, वही तो प्राण और धन छोड़कर मेरे सम्मुख युद्ध में खड़े हैं। ऐसा रक्तरंजित राज्य पाकर मैं क्या करूँगा?’',
          'यह कहकर शोक से उद्विग्न अर्जुन अपने बाण और धनुष को त्यागकर रथ के पिछले भाग में बैठ गया। उसका मन कर्तव्य और मोह के बीच में फँसकर दिशाहीन हो गया, और उसने हाथ जोड़कर श्रीकृष्ण से प्रार्थना की, ‘मैं आपका शिष्य हूँ और आपकी शरण में आया हूँ; मुझे वही उपदेश दीजिए जो निश्चय ही मेरे कल्याण का हो।’',
        ],
        bodyEn: [
          'Beholding his own kinsmen arrayed face to face on the battlefield, Arjuna\'s heart was overwhelmed with compassion and grief. His limbs grew slack, his mouth went dry, his body trembled, and every hair stood on end. His famed bow, the Gandiva, began to slip from his hand, and he could not even find the strength to stand.',
          'In his distress Arjuna said, ‘O Keshava, what happiness can I desire by slaying my own kindred? I wish neither for victory, nor kingdom, nor pleasures. The very teachers and loved ones for whose sake all this was worth having are the ones standing before me in battle, casting away their lives and wealth. What shall I do with a kingdom won in such bloodshed?’',
          'Having spoken thus, Arjuna, shaken by sorrow, cast aside his arrows and bow and sank down upon the seat of the chariot. His mind, caught between duty and delusion, lost all direction, and with folded hands he prayed to Krishna, ‘I am your disciple and have taken refuge in you; instruct me in that which is surely for my highest good.’',
        ],
      },
      {
        id: 'imperishable-soul-and-karma',
        titleHi: 'अविनाशी आत्मा और निष्काम कर्म का उपदेश',
        titleEn: 'The imperishable soul and the teaching of selfless action',
        bodyHi: [
          'अर्जुन के शोक को देखकर श्रीकृष्ण मन्द मुस्कुराए और बोले, ‘हे अर्जुन, तू उनके लिए शोक करता है जिनके लिए शोक करना उचित नहीं। जो आत्मा देह में निवास करती है, वह न कभी जन्म लेती है, न मरती है; शस्त्र उसे काट नहीं सकते, अग्नि उसे जला नहीं सकती, जल उसे भिगो नहीं सकता और वायु उसे सुखा नहीं सकती। जैसे मनुष्य पुराने वस्त्र त्यागकर नए धारण करता है, वैसे ही आत्मा जीर्ण देह छोड़कर नई देह में प्रवेश करती है।’',
          '‘इसलिए हे पार्थ, तू अपने स्वधर्म को पहचान। तू क्षत्रिय है, और धर्म की रक्षा के लिए युद्ध करना ही तेरा कर्तव्य है। पर कर्म करते हुए तू फल की आसक्ति त्याग दे। कर्म करने में ही तेरा अधिकार है, उसके फलों में कभी नहीं। न तू फल का हेतु बन, और न ही कर्म छोड़ने में तेरी प्रीति हो—यही निष्काम कर्मयोग है, जो मनुष्य को बंधन से मुक्त करता है।’',
          'श्रीकृष्ण ने आगे कहा, ‘जो मनुष्य सुख-दुःख, लाभ-हानि और जय-पराजय को समान भाव से देखता हुआ अपना कर्तव्य करता है, वह पाप से लिप्त नहीं होता। स्थिर बुद्धि से, मन को मुझमें स्थिर करके, फल की कामना छोड़कर युद्ध कर—तब यह संग्राम तेरे लिए बंधन नहीं, मुक्ति का मार्ग बन जाएगा।’',
        ],
        bodyEn: [
          'Seeing Arjuna\'s grief, Krishna smiled gently and said, ‘O Arjuna, you grieve for those who are not worthy of grief. The soul that dwells within the body is never born and never dies; weapons cannot cut it, fire cannot burn it, water cannot wet it, and wind cannot dry it. As a person casts off worn-out garments and puts on new ones, so the soul lays aside the worn-out body and enters a new one.’',
          '‘Therefore, O Partha, recognise your own dharma. You are a kshatriya, and to fight in defence of righteousness is your very duty. But while performing action, abandon all attachment to its fruit. Your right is to action alone, never to its fruits. Be neither the cause of the fruit, nor attached to inaction—this is the yoga of selfless action, which frees a person from bondage.’',
          'Krishna continued, ‘The one who performs his duty regarding pleasure and pain, gain and loss, victory and defeat as the same, is not tainted by sin. With steady understanding, fixing your mind upon me and renouncing desire for the fruit, fight—then this battle will become for you not a bondage but a path to liberation.’',
        ],
      },
      {
        id: 'bhakti-and-refuge',
        titleHi: 'भक्ति और शरणागति का मर्म',
        titleEn: 'The heart of devotion and surrender',
        bodyHi: [
          'ज्ञान और कर्म का रहस्य खोलने के पश्चात् श्रीकृष्ण ने भक्ति का मधुर मार्ग प्रकट किया। उन्होंने कहा, ‘हे अर्जुन, जो भक्त अनन्य भाव से मेरा स्मरण करता है, अपना सारा कर्म मुझे अर्पित कर देता है, और प्रेमपूर्वक मेरी शरण में आता है, उसका योग-क्षेम मैं स्वयं वहन करता हूँ। जो जन्म-मरण के सागर में डूब रहे होते हैं, उन्हें मैं शीघ्र ही उद्धार देता हूँ।’',
          '‘पत्र, पुष्प, फल अथवा जल—जो कुछ भी कोई भक्त प्रेम और श्रद्धा से मुझे अर्पित करता है, उस शुद्ध हृदय की भेंट को मैं प्रसन्नता से स्वीकार करता हूँ। न जाति, न धन, न विद्या मुझे प्रिय है; मुझे केवल भक्त का निश्छल प्रेम प्रिय है। जो मुझमें मन लगाता है, वह मुझे ही प्राप्त होता है।’',
          'अन्त में करुणामय भगवान ने सबसे गोपनीय वचन कहा, ‘हे अर्जुन, समस्त धर्मों को छोड़कर तू केवल मेरी शरण में आ जा। मैं तुझे समस्त पापों से मुक्त कर दूँगा; तू शोक मत कर।’ इन वचनों ने अर्जुन के अंतःकरण में आशा और स्थिरता का संचार कर दिया।',
        ],
        bodyEn: [
          'Having unveiled the mystery of knowledge and action, Krishna revealed the sweet path of devotion. He said, ‘O Arjuna, the devotee who remembers me with single-minded love, who offers all his deeds to me, and who comes to me in loving refuge—his welfare and protection I myself bear. Those who are sinking in the ocean of birth and death, I swiftly lift up and deliver.’',
          '‘A leaf, a flower, a fruit, or water—whatever a devotee offers me with love and faith, that gift from a pure heart I accept with gladness. Neither birth, nor wealth, nor learning is dear to me; dear to me is only the sincere love of the devotee. The one who fixes his mind upon me attains me alone.’',
          'At last the compassionate Lord spoke the most secret of all words: ‘O Arjuna, abandoning all duties, take refuge in me alone. I shall free you from all sins; do not grieve.’ These words sent through Arjuna\'s inmost being a current of hope and steadiness.',
        ],
      },
      {
        id: 'vishvarupa-and-observance',
        titleHi: 'विश्वरूप दर्शन और गीता जयंती का व्रत',
        titleEn: 'The vision of the universal form and the observance of Gita Jayanti',
        bodyHi: [
          'अर्जुन की प्रार्थना पर भगवान श्रीकृष्ण ने उसे दिव्य दृष्टि प्रदान की और अपना विराट विश्वरूप प्रकट किया। उस अनंत रूप में अर्जुन ने असंख्य मुख, असंख्य नेत्र, सहस्रों सूर्यों के समान तेज, और समस्त लोकों, देवताओं तथा प्राणियों को एक ही देह में समाया हुआ देखा। उस महान दर्शन से रोमांचित और भयविह्वल होकर अर्जुन ने हाथ जोड़कर प्रणाम किया।',
          'उस अलौकिक रूप को देखकर अर्जुन का सारा मोह और संशय छिन्न हो गया। उसने कृतज्ञ होकर कहा, ‘हे अच्युत, आपकी कृपा से मेरा मोह नष्ट हो गया है और मुझे अपनी स्मृति प्राप्त हो गई है। अब मैं संशयरहित होकर खड़ा हूँ और आपके वचन का पालन करूँगा।’ फिर उसने अपना गाण्डीव उठाया और धर्मयुद्ध के लिए तत्पर हो गया।',
          'मार्गशीर्ष शुक्ल एकादशी का वही पावन दिन था जब साक्षात् भगवान के मुख से यह अमृतमय श्रीमद्भगवद्गीता प्रकट हुई थी, इसीलिए वह तिथि ‘गीता जयंती’ के रूप में पूजी जाती है। कहा जाता है कि जो श्रद्धालु इस दिन उपवास रखकर गीता का पाठ, श्रवण और मनन करता है, उसके हृदय का मोह वैसे ही दूर होता है जैसे अर्जुन का हुआ था। उसके पाप क्षीण होते हैं, बुद्धि निर्मल होती है, और अन्त में वह भगवान के उसी दिव्य धाम को प्राप्त करता है—यही गीता जयंती के व्रत का अक्षय फल है, जो आज भी हर साधक के अंतःकरण में प्रकाश भरता है।',
        ],
        bodyEn: [
          'At Arjuna\'s prayer, Lord Krishna granted him divine sight and revealed his vast universal form. In that boundless form Arjuna beheld countless faces, countless eyes, a radiance like that of a thousand suns, and all the worlds, gods, and beings contained within a single body. Thrilled and overcome with awe at that great vision, Arjuna folded his hands and bowed low.',
          'Beholding that supernatural form, all of Arjuna\'s delusion and doubt were torn away. Filled with gratitude, he said, ‘O Achyuta, by your grace my delusion is destroyed and my memory has returned to me. Now I stand free of doubt, and I shall act according to your word.’ Then he lifted up his Gandiva and stood ready for the righteous war.',
          'It was that very holy day, the bright eleventh of Margashirsha, when from the lips of the Lord himself this nectar-like Shrimad Bhagavad Gita came forth, and so that day is honoured as ‘Gita Jayanti.’ It is said that the devotee who keeps a fast on this day and reads, hears, and reflects upon the Gita finds the delusion of the heart dissolved just as Arjuna\'s was. His sins wear away, his understanding grows pure, and at the last he attains that same divine abode of the Lord—this is the imperishable fruit of the Gita Jayanti observance, which to this day fills the inner being of every seeker with light.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'ganga-dussehra-katha',
    titleHi: 'गंगा दशहरा कथा',
    titleEn: 'Ganga Dussehra Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'sagara-sons-ashes',
        titleHi: 'सगर के साठ हज़ार पुत्रों की राख',
        titleEn: 'The ashes of Sagara\'s sixty thousand sons',
        bodyHi: [
          'अयोध्या के सूर्यवंशी सम्राट सगर ने एक बार अश्वमेध यज्ञ का संकल्प लिया। यज्ञ का घोड़ा पृथ्वी पर स्वच्छंद घूमने के लिए छोड़ा गया, और सगर के साठ हज़ार पुत्र उसकी रक्षा करते हुए पीछे-पीछे चले। देवराज इंद्र को आशंका हुई कि यह यज्ञ पूर्ण हुआ तो सगर उनसे भी बड़े हो जाएँगे, इसलिए उन्होंने छिपकर वह घोड़ा चुरा लिया और पाताल में तपस्या कर रहे कपिल मुनि के आश्रम के पास बाँध दिया।',
          'घोड़े को खोजते-खोजते सगर के पुत्र समस्त पृथ्वी खोद डालने पर उतर आए और अंत में पाताल पहुँचे। वहाँ ध्यानमग्न कपिल मुनि के निकट बँधा घोड़ा देखकर उन्होंने मुनि को ही चोर समझ लिया और कठोर वचन कहते हुए उन पर टूट पड़े। ध्यान भंग होने पर मुनि की आँखें क्रोध से खुलीं, और उनके तेज की एक ही दृष्टि से वे साठ हज़ार राजकुमार वहीं भस्म होकर राख के ढेर बन गए।',
          'बहुत समय बीतने पर सगर के पौत्र अंशुमान घोड़े की खोज में उसी मार्ग से पाताल पहुँचे। कपिल मुनि ने प्रसन्न होकर घोड़ा तो लौटा दिया, पर बताया कि जब तक स्वर्ग की गंगा इस धरती पर उतरकर इन भस्म हुए पुरखों की राख को स्पर्श न करेंगी, तब तक उनकी मुक्ति संभव नहीं। अंशुमान और उनके पुत्र दिलीप जीवनभर यही तप करते रहे, पर गंगा को उतार न सके।',
        ],
        bodyEn: [
          'Sagara, the Suryavanshi emperor of Ayodhya, once resolved to perform the Ashvamedha sacrifice. The sacrificial horse was loosed to roam the earth freely, and Sagara’s sixty thousand sons followed behind to guard it. Indra, king of the gods, grew afraid that if this rite were completed Sagara would rise above even him, so he secretly stole the horse and tethered it beside the hermitage of the sage Kapila, who sat deep in penance in the netherworld.',
          'Searching everywhere, Sagara’s sons dug up the whole earth and at last descended into the netherworld. Seeing the horse tied near the meditating Kapila, they mistook the sage for the thief and fell upon him with harsh words. His meditation broken, the sage opened his eyes in anger, and by a single glance of his accumulated fire all sixty thousand princes were burned to ash where they stood, becoming mere heaps of cinders.',
          'After a long age, Sagara’s grandson Anshuman followed the same path into the netherworld in search of the horse. Pleased with him, Kapila returned the horse but warned that until the Ganga of heaven came down upon the earth and touched the ashes of these burned forefathers, their liberation was impossible. Anshuman and his son Dilipa performed this penance all their lives, yet neither could bring the Ganga down.',
        ],
      },
      {
        id: 'bhagiratha-penance',
        titleHi: 'भगीरथ की कठोर तपस्या',
        titleEn: 'The unyielding penance of Bhagiratha',
        bodyHi: [
          'दिलीप के पुत्र राजा भगीरथ ने अपने पुरखों की यह अधूरी कामना अपने हृदय में धारण कर ली। राजपाट का भार मंत्रियों को सौंपकर वे हिमालय की कन्दराओं में चले गए और वहाँ अन्न-जल त्यागकर, पंचाग्नि के बीच खड़े होकर, अपने अंगूठे के बल पर वर्षों तक घोर तप करते रहे। उनके मन में एक ही प्रार्थना थी—‘देवी गंगा धरती पर उतरें और मेरे पूर्वजों की राख को पवित्र करें।’',
          'भगीरथ की अटल साधना से प्रसन्न होकर ब्रह्मा जी प्रकट हुए और बोले कि गंगा अवश्य पृथ्वी पर आएँगी। किंतु उन्होंने चेतावनी भी दी—स्वर्ग से गिरती गंगा का प्रचंड वेग इतना भयंकर होगा कि धरती उसे सह नहीं पाएगी और टुकड़े-टुकड़े हो जाएगी। उस अपार धारा को थामने की शक्ति केवल भगवान शिव में है; अतः पहले उन्हें प्रसन्न करो।',
          'भगीरथ ने फिर शिव की आराधना आरंभ कर दी। केवल एक पैर पर खड़े होकर, उपवास और मौन के साथ उन्होंने महादेव का स्मरण किया। उनकी भक्ति से द्रवित होकर भोलेनाथ प्रकट हुए और वचन दिया कि वे स्वर्ग से उतरती गंगा को अपने सिर पर धारण कर लेंगे, ताकि उनका वेग सध जाए और धरती सुरक्षित रहे।',
        ],
        bodyEn: [
          'King Bhagiratha, the son of Dilipa, took this unfulfilled longing of his ancestors into his own heart. Handing the burden of the kingdom to his ministers, he withdrew into the caverns of the Himalaya, and there, forsaking food and water, standing amid the five fires and balanced on his great toe, he performed fierce penance for years. In his mind there was a single prayer: ‘May Devi Ganga descend to the earth and sanctify the ashes of my forefathers.’',
          'Pleased by Bhagiratha’s unshakeable austerity, Brahma appeared and declared that Ganga would indeed come to the earth. But he gave a warning as well: the force of Ganga falling from heaven would be so terrible that the earth could not endure it and would be shattered to pieces. Only Lord Shiva had the power to hold that boundless torrent; therefore he must first win Shiva’s favour.',
          'Bhagiratha then began to worship Shiva. Standing on a single foot, keeping fast and silence, he held the great god in his thoughts. Moved by his devotion, Bholenath appeared and gave his word that he would receive the descending Ganga upon his own head, so that her force might be tamed and the earth kept safe.',
        ],
      },
      {
        id: 'shiva-matted-locks',
        titleHi: 'शिव की जटाओं में गंगा का अवतरण',
        titleEn: 'Ganga\'s descent into Shiva\'s matted locks',
        bodyHi: [
          'गंगा को अपने वैभव पर गर्व था। उन्होंने सोचा—‘मैं इतने प्रबल वेग से गिरूँगी कि शिव को भी अपने साथ बहाकर पाताल में ले जाऊँगी।’ इसी अहंकार के साथ वे आकाश से एक विशाल, गर्जना करती धारा बनकर नीचे झपटीं। पर शिव ने उनके मन की बात भाँप ली और हँसते हुए अपनी जटाएँ फैला दीं।',
          'गंगा की समूची धारा शिव की घनी, अनंत जटाओं के विशाल जाल में आकर लुप्त हो गई। जितना वे बहतीं, उतनी ही जटाओं में भटकती रहीं; कहीं कोई मार्ग न मिला। वर्षों तक वे उन्हीं उलझी लटों में घूमती रहीं और उनका सारा घमंड चूर हो गया। तब उन्होंने विनम्र होकर महादेव से बाहर निकलने का मार्ग माँगा।',
          'भगीरथ ने पुनः शिव से प्रार्थना की कि वे गंगा को मुक्त करें। दयालु शिव ने अपनी एक जटा खोल दी, और उससे गंगा की एक शांत, संयमित धारा बहकर हिमालय की भूमि पर उतर आई। अब वह प्रलयंकारी वेग नहीं, बल्कि करुणा से भरी, कल-कल बहती पावन नदी थी, जो धरती को सींचने के लिए तैयार थी।',
        ],
        bodyEn: [
          'Ganga was proud of her own majesty. She thought, ‘I shall fall with such overpowering force that I will sweep even Shiva away and carry him down into the netherworld.’ With this arrogance she rushed down from the sky as a vast, thundering torrent. But Shiva read the thought in her mind, and smiling, he spread out his matted locks.',
          'The entire flood of Ganga vanished into the immense web of Shiva’s dense, endless locks. The more she flowed, the more she wandered through those tangled strands; nowhere could she find a way out. For years she circled within those knotted coils until all her pride was ground away. Then, grown humble, she begged the great god to show her the path out.',
          'Bhagiratha once more prayed to Shiva to release her. The compassionate Shiva loosened a single lock, and from it a calm, restrained stream of Ganga flowed down onto the soil of the Himalaya. No longer a destroying force, she was now a sacred river full of mercy, murmuring as she ran, ready to nourish the earth.',
        ],
      },
      {
        id: 'ganga-follows-to-sea',
        titleHi: 'भगीरथ के पीछे सागर तक',
        titleEn: 'Following Bhagiratha to the sea',
        bodyHi: [
          'अब भगीरथ अपने दिव्य रथ पर सवार होकर आगे-आगे चले, और गंगा उनके पीछे-पीछे बहती हुई पर्वतों, वनों और घाटियों को पार करने लगीं। जहाँ-जहाँ भगीरथ का रथ गया, वहाँ-वहाँ गंगा का जल भी पहुँचा, और सूखी धरती हरी-भरी हो उठी, अनेक तीर्थ पवित्र हो गए।',
          'मार्ग में गंगा का प्रवाह जह्नु ऋषि की यज्ञभूमि से होकर निकला और उनकी सारी सामग्री बहा ले गया। क्रुद्ध मुनि ने आचमन में ही समूची गंगा को पी लिया। भगीरथ फिर रुक गए और हाथ जोड़कर प्रार्थना की। प्रसन्न होकर ऋषि ने गंगा को अपने कान से बाहर निकाल दिया—इसीलिए वे ‘जाह्नवी’ कहलाईं—और धारा फिर भगीरथ के पीछे चल पड़ी।',
          'अंत में गंगा पाताल पहुँचीं और वहाँ पड़ी सगर के साठ हज़ार पुत्रों की राख को अपने पवित्र जल से स्पर्श किया। उसी क्षण वे सब पाप-मुक्त होकर दिव्य रूप में स्वर्ग सिधार गए। पुरखों की यह तृप्ति देखकर भगीरथ का जन्मों पुराना संकल्प पूरा हुआ, और उन्हीं के नाम पर गंगा ‘भागीरथी’ कहलाईं।',
        ],
        bodyEn: [
          'Now Bhagiratha rode ahead on his divine chariot, and Ganga, flowing behind him, began to cross mountains, forests, and valleys. Wherever Bhagiratha’s chariot went, there too the waters of Ganga arrived, and the parched land grew green and fertile, while many holy fords were made sacred along the way.',
          'On the way her current passed through the sacrificial grounds of the sage Jahnu and washed away all his materials. The angered sage drank the whole of Ganga in a single sip of water. Bhagiratha halted again and prayed with folded hands. Pleased, the sage released Ganga from his ear, and for this she was called ‘Jahnavi’; then the stream set off once more behind Bhagiratha.',
          'At last Ganga reached the netherworld and touched with her sacred waters the ashes of Sagara’s sixty thousand sons that lay there. In that very moment all of them, freed of their sins, rose in radiant form to heaven. Seeing his ancestors thus contented, Bhagiratha’s vow, carried across many lifetimes, was fulfilled; and after his name Ganga came to be called ‘Bhagirathi’.',
        ],
      },
      {
        id: 'jyeshtha-dashami-descent',
        titleHi: 'ज्येष्ठ शुक्ल दशमी का पुण्य',
        titleEn: 'The merit of Jyeshtha Shukla Dashami',
        bodyHi: [
          'जिस तिथि पर गंगा स्वर्ग से उतरकर इस मृत्युलोक में प्रकट हुईं, वह ज्येष्ठ मास के शुक्ल पक्ष की दशमी थी। तभी से यह दिन ‘गंगा दशहरा’ कहलाता है। इस दिन भक्तगण भोर से ही गंगा के घाटों पर एकत्र होकर ‘हर-हर गंगे’ का जयघोष करते हैं और श्रद्धा से डुबकी लगाते हैं।',
          'कहते हैं कि इस पावन तिथि पर जो श्रद्धालु गंगा या किसी पवित्र नदी में स्नान करता है, उसके मन, वाणी और शरीर से जुड़े दस प्रकार के पाप धुल जाते हैं—इसी से इसका नाम ‘दशहरा’ पड़ा। दान, जप और दीपदान का इस दिन अनंत फल माना जाता है।',
          'जिनके पास गंगातट तक जाने का साधन नहीं, वे घर पर ही जल में थोड़ी गंगाजल मिलाकर स्नान करते हैं और देवी गंगा का स्मरण करते हुए भगीरथ के अथक संकल्प को याद करते हैं। श्रद्धा से इस कथा का श्रवण करने वाले के कुल की अनेक पीढ़ियाँ तृप्त होती हैं, उसके रोग-शोक मिटते हैं, और गंगा माँ की कृपा से जीवन निर्मल एवं मंगलमय हो जाता है।',
        ],
        bodyEn: [
          'The day on which Ganga descended from heaven and appeared in this mortal world was the tenth lunar day of the bright fortnight of the month of Jyeshtha. From that time this day has been called ‘Ganga Dussehra.’ On it devotees gather at Ganga’s bathing steps from before dawn, raise the cry of ‘Har-Har Gange,’ and immerse themselves with reverence.',
          'It is said that whoever bathes in the Ganga or any holy river on this sacred day is cleansed of ten kinds of sin attached to mind, speech, and body, and from this its name ‘Dussehra,’ the remover of ten, is drawn. Charity, the chanting of holy names, and the offering of lamps are believed to bear boundless fruit on this day.',
          'Those who have no means to reach the banks of Ganga bathe at home with a little Ganga water mixed into their own, and remembering Devi Ganga they call to mind the tireless resolve of Bhagiratha. For one who hears this story with faith, many generations of the family are contented, sickness and sorrow fall away, and by the grace of Mother Ganga life becomes pure and full of blessing.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'chhath-puja-katha',
    titleHi: 'छठ पूजा कथा',
    titleEn: 'Chhath Puja Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'rajya-ki-haar',
        titleHi: 'हस्तिनापुर खोने के बाद वन में पांडव',
        titleEn: 'The Pandavas in the forest after losing their kingdom',
        bodyHi: [
          'द्यूत की उस अभागी रात के बाद, जब छल भरे पासों ने हस्तिनापुर का राज्य पांडवों के हाथ से छीन लिया, तो पाँचों भाई अपनी पत्नी द्रौपदी के साथ वन की ओर निकल पड़े। राजमहल के रेशमी वस्त्र अब वल्कल बन गए थे, और सोने के थाल की जगह कंद-मूल थे। काम्यक वन की छाया में बैठी द्रौपदी का मन भीतर ही भीतर रोता था—न इसलिए कि उसे सुख छिन गया, बल्कि इसलिए कि धर्म पर चलने वाले उसके स्वामी आज दर-दर भटक रहे थे।',
          'एक संध्या, जब आकाश में डूबता सूर्य अपनी अंतिम लाल किरणें वन की पगडंडियों पर बिखेर रहा था, द्रौपदी ने कुलगुरु महर्षि धौम्य के चरणों में सिर झुकाया और पूछी, ‘हे गुरुदेव! ऐसा कौन-सा व्रत है जिसके आचरण से बिछड़ा राज्य फिर लौट आए, और मेरे पतियों का दुःख दूर हो?’ धौम्य की आँखों में करुणा झलकी, और उन्होंने धीरे से कहा कि एक ऐसा तप है जो सूर्यदेव और उनकी कृपामयी बहन छठी मैया को समर्पित है।',
          'महर्षि बोले, ‘पुत्री, जो जगत को प्रकाश और प्राण देते हैं, वही सूर्यनारायण हैं। उनकी आराधना से रोग मिटते हैं, संतान सुखी होती है, और खोया वैभव लौट आता है। कार्तिक मास के शुक्ल पक्ष में, छठ का यह व्रत श्रद्धा और संयम से करो—फिर देखना, धर्म तुम्हारा साथ कैसे देता है।’ धौम्य के वचन सुनकर द्रौपदी के थके मन में एक नई आशा की किरण जाग उठी।',
        ],
        bodyEn: [
          'After that ill-fated night of dice, when loaded throws snatched the kingdom of Hastinapura from the Pandavas\' hands, the five brothers set out for the forest with their queen, Draupadi. The silken robes of the palace had become bark garments now, and roots and tubers replaced golden platters. Seated in the shade of the Kamyaka forest, Draupadi wept within—not because comfort had been lost, but because her husbands, who walked the path of dharma, were now wandering from place to place.',
          'One evening, as the setting sun scattered its last red rays across the forest trails, Draupadi bowed at the feet of the family preceptor, the great sage Dhaumya, and asked, ‘O revered teacher! Which vow, if observed, can return the lost kingdom and lift the sorrow of my husbands?’ Compassion shone in Dhaumya\'s eyes, and he gently said that there was one austerity dedicated to Surya Deva and his merciful sister, Chhathi Maiya.',
          'The sage spoke, ‘Daughter, the one who gives light and life to the world is Suryanarayana himself. By worshipping him, illnesses dissolve, children prosper, and lost glory returns. In the bright fortnight of the month of Kartika, observe this vow of Chhath with faith and restraint—then see how dharma stands beside you.’ Hearing Dhaumya\'s words, a fresh ray of hope awoke in Draupadi\'s weary heart.',
        ],
      },
      {
        id: 'draupadi-ka-arghya',
        titleHi: 'द्रौपदी का व्रत और नदी तट पर अर्घ्य',
        titleEn: 'Draupadi\'s vow and the arghya at the riverbank',
        bodyHi: [
          'गुरु की आज्ञा शिरोधार्य कर द्रौपदी ने कठोर संयम का संकल्प लिया। नहाय-खाय के दिन उसने पवित्र होकर सात्त्विक भोजन ग्रहण किया; खरना की संध्या को गुड़ और दूध की खीर का प्रसाद बनाकर उसे ग्रहण किया, और फिर छत्तीस घंटे का निर्जल उपवास आरंभ हुआ—न जल, न अन्न, केवल सूर्य पर टिका हुआ मन।',
          'षष्ठी की संध्या को द्रौपदी और पांचों पांडव नदी के तट पर पहुँचे। कमर तक शीतल जल में खड़े होकर, बाँस की टोकरी में ठेकुआ, फल और गन्ना सजाकर, उसने पश्चिम की ओर ढलते सूर्य को अर्घ्य अर्पित किया। डूबते सूर्य को अर्घ्य देना मानो उसने कहा—जो अस्त होता है वही फिर उदित भी होता है, और जो आज पराजित हैं, वे फिर विजयी होंगे।',
          'अगले प्रातः, अरुणोदय से पहले ही वे फिर जल में जा खड़े हुए। पूर्व दिशा में जब उषा की लालिमा फूटी और सूर्यदेव अपने रथ पर उदित हुए, तब द्रौपदी ने उगते सूर्य को अर्घ्य देकर व्रत पूर्ण किया। छठी मैया उसकी अटूट श्रद्धा से प्रसन्न हुईं, और उसी क्षण से पांडवों के दिन फिरने लगे—वन का कष्ट घटा, और कालांतर में उन्होंने अपना खोया हुआ राज्य पुनः प्राप्त कर लिया।',
        ],
        bodyEn: [
          'Taking her teacher\'s command upon her head, Draupadi resolved upon a stern discipline. On the day of Nahay-Khay she bathed pure and ate simple, sattvic food; on the evening of Kharna she prepared and partook of the prasada of kheer made with jaggery and milk, and then began the thirty-six-hour waterless fast—no water, no grain, only a mind fixed upon the sun.',
          'On the evening of Shashthi, Draupadi and the five Pandavas reached the bank of the river. Standing waist-deep in the cool water, with a bamboo basket arranged with thekua, fruit, and sugarcane, she offered arghya to the sun as it sank toward the west. To offer arghya to the setting sun was as if she said—that which sets also rises again, and those who are defeated today shall be victorious once more.',
          'The next morning, before the first blush of dawn, they stood in the water again. When the redness of Usha broke in the east and Surya Deva rose upon his chariot, Draupadi completed her vow by offering arghya to the rising sun. Chhathi Maiya was pleased by her unbroken faith, and from that very moment the fortunes of the Pandavas began to turn—the hardship of the forest eased, and in time they regained their lost kingdom.',
        ],
      },
      {
        id: 'priyavrat-malini',
        titleHi: 'निःसंतान राजा प्रियव्रत और रानी मालिनी',
        titleEn: 'The childless king Priyavrat and queen Malini',
        bodyHi: [
          'बहुत पुरातन काल की बात है। प्रियव्रत नाम के एक धर्मनिष्ठ राजा थे, और उनकी पत्नी थीं सुशीला रानी मालिनी। राज्य में धन-धान्य की कोई कमी न थी, पर राजमहल की एक ही पीड़ा थी—उनकी कोई संतान न थी। वंश के सूने आँगन को देख राजा-रानी का हृदय भीतर ही भीतर मुरझाया रहता था।',
          'महर्षि कश्यप के परामर्श से राजा ने पुत्र-प्राप्ति के लिए यज्ञ कराया। यज्ञ के प्रसाद से रानी मालिनी गर्भवती हुईं, पर समय पूरा होने पर जो पुत्र जन्मा, वह मृत था। शोक से व्याकुल राजा उस मृत शिशु को लेकर श्मशान पहुँचे और उसे गोद में रखकर अपने प्राण त्यागने को तत्पर हो गए। उनका विलाप सुनकर सारा वन सिहर उठा।',
          'उसी क्षण आकाश से एक दिव्य विमान उतरा, जिसमें ब्रह्मा की मानस-पुत्री, सृष्टि की षष्ठांश-अधिष्ठात्री देवी षष्ठी विराजमान थीं—वही जिन्हें लोग प्रेम से छठी मैया कहते हैं। उनके मुख पर ममता की आभा थी और हाथ में जीवन देने वाली शक्ति।',
        ],
        bodyEn: [
          'It was a matter of very ancient times. There lived a righteous king named Priyavrat, and his wife was the gentle queen Malini. The kingdom lacked nothing in wealth or grain, yet the palace carried a single grief—they had no child. Seeing the empty courtyard of their lineage, the hearts of the king and queen withered quietly within.',
          'On the counsel of the great sage Kashyapa, the king performed a sacrifice for the gift of a son. By the blessing of that sacrifice queen Malini conceived, but when her term was complete, the son who was born came lifeless into the world. Maddened with grief, the king carried the dead infant to the cremation ground, and laying it in his lap, made ready to give up his own life. Hearing his lament, the whole forest shuddered.',
          'In that very moment a divine craft descended from the sky, bearing the mind-born daughter of Brahma, the goddess Shashthi who presides over the sixth part of creation—she whom people lovingly call Chhathi Maiya. Upon her face was the radiance of a mother\'s love, and in her hand the power that gives life.',
        ],
      },
      {
        id: 'shashthi-ka-vardan',
        titleHi: 'छठी मैया का वरदान और व्रत का प्रचलन',
        titleEn: 'Chhathi Maiya\'s boon and the spread of the vow',
        bodyHi: [
          'देवी षष्ठी ने राजा प्रियव्रत से उनके शोक का कारण पूछा, और फिर अपना परिचय देते हुए बोलीं, ‘मैं ही समस्त शिशुओं की रक्षिका हूँ और निःसंतानों को संतान का वरदान देने वाली हूँ।’ इतना कहकर उन्होंने उस मृत बालक पर अपना करुणामय हाथ फेरा, और देखते ही देखते शिशु में प्राण लौट आए—वह किलकारी मारने लगा।',
          'राजा का शोक हर्ष में बदल गया। उन्होंने हाथ जोड़कर देवी की स्तुति की और पूछा कि उनकी आराधना किस विधि से की जाए। देवी ने कहा, ‘कार्तिक शुक्ल षष्ठी को जो स्त्री-पुरुष श्रद्धा और शुद्धता से मेरा तथा भगवान सूर्य का व्रत करेंगे, निर्जल रहकर नदी-तट पर अस्त और उदित होते सूर्य को अर्घ्य देंगे, उन्हें संतान, आरोग्य और सौभाग्य की प्राप्ति होगी।’',
          'राजा प्रियव्रत ने राज्य भर में यह व्रत प्रचलित किया, और तभी से कार्तिक मास में छठ का यह महापर्व पीढ़ी-दर-पीढ़ी चला आ रहा है। तब से आज तक, जब कार्तिक की छठ आती है, तो श्रद्धालु जन घाटों पर एकत्र होते हैं—डूबते सूर्य को सांध्य-अर्घ्य और उगते सूर्य को प्रातः-अर्घ्य अर्पित करते, ठेकुआ और गन्ने का प्रसाद चढ़ाते, और मन ही मन छठी मैया से अपने बच्चों के दीर्घ जीवन और घर की समृद्धि का वरदान माँगते हैं। जो भी सच्ची श्रद्धा से यह व्रत करता है, सूर्यदेव और छठी मैया की कृपा से उसका जीवन प्रकाश से भर उठता है।',
        ],
        bodyEn: [
          'The goddess Shashthi asked king Priyavrat the cause of his grief, and then, revealing her identity, she said, ‘I am the protectress of all children and the one who grants offspring to the childless.’ Saying this, she passed her compassionate hand over the lifeless child, and in an instant life returned to the infant—it began to coo and stir.',
          'The king\'s grief turned to joy. With folded hands he praised the goddess and asked by what rite she should be worshipped. The goddess said, ‘Those men and women who, on the sixth day of the bright fortnight of Kartika, observe the vow of myself and Lord Surya with faith and purity—keeping a waterless fast and offering arghya at the riverbank to the setting and the rising sun—shall be granted children, health, and good fortune.’',
          'King Priyavrat spread this vow throughout his realm, and from that time the great festival of Chhath in the month of Kartika has continued from generation to generation. From then until today, when the Chhath of Kartika arrives, devotees gather at the river ghats—offering the evening arghya to the setting sun and the dawn arghya to the rising sun, presenting the prasada of thekua and sugarcane, and silently begging Chhathi Maiya for the long life of their children and the prosperity of their homes. Whoever observes this vow with true faith finds, by the grace of Surya Deva and Chhathi Maiya, that life fills with light.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'akshaya-navami-katha',
    titleHi: 'अक्षय नवमी कथा',
    titleEn: 'Akshaya Navami Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'amalaka-shade',
        titleHi: 'आँवले के पेड़ की छाँव',
        titleEn: 'Under the shade of the amalaka tree',
        bodyHi: [
          'कार्तिक मास के शुक्ल पक्ष की नवमी का सूरज जब काशी की एक छोटी बस्ती पर चढ़ा, तो आँगन के कोने में लगे आँवले के पेड़ की पत्तियाँ ओस से चमक रही थीं। उसी पेड़ के नीचे बैठी थी एक वृद्ध ब्राह्मणी, जिसका नाम था सुमना। पति वर्षों पहले गोलोक सिधार चुके थे, संतान कोई नहीं थी, और घर में जो थोड़ा-बहुत अन्न रहता वह भी पड़ोसियों की दया से आता था। फिर भी उसके चेहरे पर एक अटल शांति थी।',
          'बचपन में उसने अपनी माता से एक बात सुनी थी, जो मन में दीपक की तरह जलती रहती थी — ‘कार्तिक की शुक्ल नवमी को जो आँवले के वृक्ष को सींचता, उसकी पूजा करता और उसी की छाया में बैठकर भोजन कराता है, उसका किया हुआ हर पुण्य अक्षय हो जाता है। उस दिन वृक्ष की जड़ में स्वयं श्रीहरि का वास होता है।’ सुमना के पास देने को बहुत कुछ नहीं था, पर इस एक तिथि को वह कभी खाली नहीं जाने देती थी।',
          'भोर होते ही उसने पेड़ की जड़ में जल चढ़ाया, हल्दी और अक्षत से उसका पूजन किया, और घी का एक छोटा दीपक तने के पास रख दिया। फिर उसने अपने भंडार के अंतिम मुट्ठी भर चावल को पकाया, उसमें घर के पीछे उगी कुछ सब्ज़ियाँ मिलाईं, और सब कुछ केले के पत्ते पर सजाकर आँवले की शीतल छाया में रख दिया — इस आशा से कि कोई अतिथि, कोई भूखा, कोई साधु आकर इसे ग्रहण करे।',
        ],
        bodyEn: [
          'When the sun of the ninth bright day of Kartika month climbed over a small quarter of Kashi, the leaves of the amalaka tree in the corner of one courtyard glittered with dew. Beneath that very tree sat an aged Brahmin woman named Sumana. Her husband had departed for Goloka years ago, she had no children, and the little grain her house held came only through the kindness of neighbours. Even so, an unshakable calm rested upon her face.',
          'In her childhood she had heard one saying from her mother that burned in her heart like a lamp — ‘Whoever, on the bright ninth of Kartika, waters the amalaka tree, worships it, and serves a meal in its shade, finds that every merit they earn becomes inexhaustible; on that day Shrihari himself dwells at the root of the tree.’ Sumana had little to give, but this one day she never let pass empty-handed.',
          'At first light she poured water at the tree’s root, worshipped it with turmeric and unbroken rice, and set a small lamp of ghee beside the trunk. Then she cooked the last handful of rice from her store, mixed in a few vegetables grown behind the house, arranged it all on a banana leaf, and placed it in the cool shade of the amalaka — hoping that some guest, some hungry one, some wandering ascetic might come and accept it.',
        ],
      },
      {
        id: 'the-unknown-guest',
        titleHi: 'अनजान अतिथि और कभी न घटने वाला अन्न',
        titleEn: 'The unknown guest and the food that never lessened',
        bodyHi: [
          'दोपहर ढलने को थी कि एक थका हुआ यात्री, फटे वस्त्रों में, उस गली से गुज़रा। भूख से उसके पाँव डगमगा रहे थे। सुमना ने उसे पुकारकर आँवले की छाया में बिठाया, चरण धुलाए, और वही केले के पत्ते वाला भोजन उसके आगे रख दिया। यात्री ने भरपेट खाया, तृप्त होकर आशीर्वाद दिया और चला गया।',
          'सुमना ने जब पत्ते की ओर देखा, तो उसकी आँखें विस्मय से भर गईं — अन्न उतना ही था जितना उसने रखा था, मानो किसी ने उसमें से कुछ लिया ही न हो। उसी दिन एक संन्यासी आया, फिर एक विधवा अपने दो बालकों के साथ, फिर पड़ोस का एक अनाथ ग्वाला। एक-एक करके सब ने उसी पत्ते से खाया, और हर बार भोजन घटने के बजाय जस का तस बना रहा।',
          'गाँव में बात फैल गई। लोग दौड़े आए और आँवले के पेड़ के नीचे बैठकर भोजन करने लगे — कोई धनी, कोई निर्धन, सब एक ही छाया में, एक ही पंक्ति में। सुमना का छोटा-सा भंडार उस सारी बस्ती का पेट भरता रहा, और शाम तक भी पत्ते पर अन्न शेष था। तब वृद्धा समझ गई कि उसकी माता की बात अक्षरशः सत्य थी — कार्तिक नवमी को आँवले के नीचे दिया गया दान सचमुच अक्षय हो जाता है।',
        ],
        bodyEn: [
          'The afternoon was waning when a weary traveller in torn clothes passed through the lane, his feet faltering from hunger. Sumana called him over, seated him in the amalaka’s shade, washed his feet, and set that same banana-leaf meal before him. The traveller ate his fill, blessed her with a satisfied heart, and went on his way.',
          'When Sumana looked at the leaf, her eyes filled with wonder — the food was exactly as much as she had laid out, as if no one had taken anything from it at all. That same day a sannyasi arrived, then a widow with her two small children, then an orphaned cowherd boy from the neighbourhood. One by one they all ate from that single leaf, and each time, instead of dwindling, the food remained just as it was.',
          'Word spread through the village. People came running and sat down to eat beneath the amalaka tree — some rich, some poor, all in one shade, all in one row. Sumana’s tiny store kept filling the bellies of the whole quarter, and even by evening food still remained upon the leaf. Then the old woman understood that her mother’s words had been true to the letter — a gift given beneath the amalaka on the Kartika ninth truly becomes inexhaustible.',
        ],
      },
      {
        id: 'king-who-tested',
        titleHi: 'राजा की परीक्षा और श्रीहरि का वास',
        titleEn: 'The king who tested it and the dwelling of Shrihari',
        bodyHi: [
          'जब यह वृत्तांत राजधानी तक पहुँचा, तो वहाँ का राजा, जो धन में किसी से कम न था पर मन से बेचैन रहता था, उसने सोचा कि वह स्वयं इस तिथि का प्रभाव देखेगा। अगली अक्षय नवमी पर उसने नगर के बाहर एक विशाल आँवले के उपवन में पूजा का आयोजन किया, और घोषणा करवाई कि उस दिन वृक्षों की छाया में जो भी आएगा, वह राजकोष से भोजन पाएगा।',
          'राजा ने पहले इसे केवल अपनी कीर्ति का साधन समझा था, पर जब उसने स्वयं हाथों से सींचे हुए वृक्ष के नीचे बैठकर ब्राह्मणों, अनाथों और भूखों को भोजन कराया, तो उसके भीतर का अहंकार धीरे-धीरे पिघल गया। उसने अनुभव किया कि आँवले के पत्ते की महक में, उसकी शीतल छाया में, कोई अदृश्य उपस्थिति है जो हर ग्रास को पवित्र कर देती है।',
          'उस रात राजा को स्वप्न में श्रीहरि के दर्शन हुए। नारायण ने कहा — ‘हे राजन, आँवला मुझे अति प्रिय है, क्योंकि इसी वृक्ष में मेरा और ब्रह्मा का अंश साथ-साथ वास करता है। कार्तिक की इस नवमी को जो श्रद्धा से आँवले का पूजन कर उसकी छाया में दान और भोजन कराता है, उसका पुण्य कभी क्षय नहीं होता।’ राजा जाग उठा और उसने समझ लिया कि सच्ची समृद्धि कोष में नहीं, बाँटने में बसती है।',
        ],
        bodyEn: [
          'When this account reached the capital, the king there — second to none in wealth, yet restless in mind — resolved to witness the power of this day for himself. On the next Akshaya Navami he arranged worship in a vast grove of amalaka trees outside the city, and had it proclaimed that whoever came into the shade of those trees that day would be fed from the royal treasury.',
          'At first the king had thought of it merely as an instrument of his own fame, but when he sat with his own hands beneath a tree he had watered and served food to Brahmins, orphans, and the hungry, the pride within him slowly melted away. He felt that in the fragrance of the amalaka leaves, in their cool shade, there was an unseen presence that made every morsel sacred.',
          'That night the king beheld Shrihari in a dream. Narayana spoke — ‘O king, the amalaka is most dear to me, for in this very tree a portion of myself and of Brahma dwells together. Whoever, on this ninth of Kartika, worships the amalaka with faith and serves charity and food in its shade, finds that their merit is never destroyed.’ The king awoke and understood that true prosperity dwells not in the treasury, but in the giving.',
        ],
      },
      {
        id: 'satya-yuga-dawn',
        titleHi: 'सत्ययुग का प्रभात और अक्षय का संकल्प',
        titleEn: 'The dawn of Satya Yuga and the resolve of the inexhaustible',
        bodyHi: [
          'विद्वान कहते हैं कि यही वह पावन तिथि है जिससे सत्ययुग का आरंभ माना जाता है — वह युग जिसमें धर्म अपने चारों चरणों पर अडिग खड़ा था और मनुष्य का मन निर्मल था। इसीलिए इस दिन किया गया कोई भी शुभ कर्म युग के आरंभ जैसा शुद्ध और अक्षय फल देने वाला माना गया, मानो सृष्टि का पहला पुण्य उसमें फिर से जीवित हो उठता हो।',
          'इसी कारण भक्त इस नवमी को प्रातः स्नान कर आँवले के वृक्ष की पूजा करते हैं, उसकी जड़ में जल और दूध अर्पित करते हैं, और उसी छाया में परिवार सहित बैठकर भोजन करते हैं। कोई आँवले का फल दान करता है, कोई उसके नीचे ब्राह्मणों और निर्धनों को भोजन कराता है, और श्रीहरि व माता लक्ष्मी का स्मरण करता है, जिनका वास उस वृक्ष में माना जाता है।',
          'सुमना और उस राजा की भाँति, जो भी इस अक्षय नवमी को श्रद्धा और निःस्वार्थ भाव से आँवले की छाया में दान और भोजन कराता है, उसका धन, उसका धर्म और उसका पुण्य कभी घटता नहीं — वृक्ष की उस शीतल छाया की तरह जो हर आने वाले को बिना भेद के अपनी गोद में समेट लेती है, और देती ही चली जाती है।',
        ],
        bodyEn: [
          'The learned say that this is the very sacred day from which the Satya Yuga is held to have begun — the age in which dharma stood firm upon all four of its feet and the mind of humankind was unsullied. For this reason any auspicious act performed on this day is held to yield a fruit as pure and as inexhaustible as the dawn of an age, as though the first merit of creation comes alive within it once more.',
          'And so on this ninth the devout bathe at dawn and worship the amalaka tree, offer water and milk at its root, and sit down with their families to eat in its very shade. Some give amalaka fruit in charity, some feed Brahmins and the poor beneath it, and all remember Shrihari and Mother Lakshmi, who are believed to dwell within that tree.',
          'Like Sumana and that king, whoever on this Akshaya Navami serves charity and food in the amalaka’s shade with faith and a selfless heart finds that their wealth, their dharma, and their merit never diminish — like the cool shade of that tree which gathers every comer into its lap without distinction, and goes on giving and giving still.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'vasant-panchami-katha',
    titleHi: 'वसंत पंचमी कथा',
    titleEn: 'Vasant Panchami Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'silent-creation',
        titleHi: 'मौन सृष्टि का दुःख',
        titleEn: 'The sorrow of a silent creation',
        bodyHi: [
          'सृष्टि के आदि में ब्रह्मा जी ने अपने संकल्प से लोक, पर्वत, नदियाँ और असंख्य जीव रचे। पृथ्वी पर वृक्ष खड़े थे, समुद्र भरे थे और आकाश में सूर्य-चंद्र अपने मार्ग पर चलते थे; फिर भी जब उन्होंने अपनी रचना की ओर दृष्टि घुमाई, तो उनका मन एक अनोखी उदासी से भर उठा।',
          'चारों ओर एक भारी सन्नाटा पसरा था। न कहीं किसी की वाणी थी, न कोई गीत, न हँसी, न किसी मन का भाव दूसरे तक पहुँचाने का कोई साधन। जीव चलते-फिरते अवश्य थे, पर मूक थे, मानो कोई सुंदर चित्र रंगों से भरा हो किंतु उसमें प्राण न फूँका गया हो। यह नीरवता देखकर स्वयं रचयिता का हृदय अधूरेपन से व्याकुल हो गया।',
        ],
        bodyEn: [
          'At the dawn of creation, Brahma shaped the worlds, the mountains, the rivers and countless living beings out of his own will. Trees stood upon the earth, the oceans were brimming, and in the sky the sun and the moon moved along their appointed paths; yet when he turned his gaze upon all that he had made, his heart filled with a strange sadness.',
          'A heavy stillness lay over everything. There was no voice anywhere, no song, no laughter, and no way for the feeling of one heart to reach another. The creatures walked and stirred, but they were mute, as though a beautiful picture had been filled with colour and never breathed into life. Seeing this silence, the very heart of the creator grew restless with a sense of incompleteness.',
        ],
      },
      {
        id: 'vishnu-counsel',
        titleHi: 'विष्णु का परामर्श',
        titleEn: 'The counsel of Vishnu',
        bodyHi: [
          'अपने मन की इस वेदना के साथ ब्रह्मा जी क्षीरसागर में शयन करने वाले भगवान विष्णु के समीप पहुँचे और हाथ जोड़कर बोले, ‘मैंने सब कुछ रच दिया, फिर भी मेरी सृष्टि गूँगी और रसहीन है। इसमें न ज्ञान का प्रकाश है, न वाणी की मधुरता। मैं क्या करूँ कि यह जगत सजीव हो उठे?’',
          'करुणामय विष्णु मुस्कराए और बोले, ‘हे विधाता, तुम्हारी रचना अधूरी इसलिए नहीं कि उसमें रूप का अभाव है, बल्कि इसलिए कि अभी उसमें वाणी, ज्ञान और संगीत का संचार नहीं हुआ। एक ऐसी शक्ति का आवाहन करो जो हर मुख को स्वर दे, हर बुद्धि को विवेक दे और हर हृदय को सुर से भर दे। उसी के स्पर्श से तुम्हारी सृष्टि सार्थक होगी।’',
        ],
        bodyEn: [
          'Carrying this ache in his heart, Brahma went to Lord Vishnu, who reclines upon the ocean of milk, and folding his hands he said, ‘I have fashioned everything, yet my creation remains mute and without savour. It holds neither the light of knowledge nor the sweetness of speech. What must I do so that this world may come alive?’',
          'The compassionate Vishnu smiled and replied, ‘O maker of worlds, your creation is incomplete not because it lacks form, but because the flow of speech, of wisdom and of music has not yet entered it. Call forth a power who will give a voice to every mouth, discernment to every mind, and melody to every heart. By her touch alone will your creation find its meaning.’',
        ],
      },
      {
        id: 'saraswati-appears',
        titleHi: 'देवी सरस्वती का प्राकट्य',
        titleEn: 'The appearance of Devi Saraswati',
        bodyHi: [
          'विष्णु के वचनों से ब्रह्मा जी का मुख प्रसन्नता से दीप्त हो उठा। उन्होंने ध्यान में लीन होकर अपने कमंडलु से पवित्र जल छिड़का, और उसी क्षण एक अद्भुत तेजपुंज प्रकट हुआ। उस ज्योति में से श्वेत वस्त्र धारण किए एक देवी प्रकट हुईं — शुभ्र कमल पर विराजमान, चार भुजाओं वाली, एक हाथ में वीणा, दूसरे में पुस्तक और तीसरे में स्फटिक की माला लिए।',
          'ब्रह्मा जी ने आदरपूर्वक उनसे प्रार्थना की कि वे इस मूक जगत को स्वर प्रदान करें। देवी ने मंद स्मित के साथ अपनी वीणा के तारों को छेड़ा। ज्यों ही पहला नाद उठा, चारों दिशाओं में एक मधुर कंपन दौड़ गया; वही दिव्य स्वर वाणी, संगीत और सुर का मूल बन गया। तब से वे ‘वाग्देवी’ कहलाईं — वाणी, विद्या और कला की अधिष्ठात्री, माँ सरस्वती।',
        ],
        bodyEn: [
          'At Vishnu’s words, Brahma’s face shone with joy. Sinking into deep meditation, he sprinkled the sacred water from his kamandalu, and in that very instant a wondrous radiance appeared. Out of that light emerged a goddess robed in white — seated upon a spotless lotus, four-armed, holding a veena in one hand, a book in another, and a crystal rosary in the third.',
          'With reverence Brahma prayed that she would grant a voice to this voiceless world. The goddess, with a gentle smile, drew her fingers across the strings of her veena. The moment the first note rose, a sweet trembling ran through all the directions; that very divine sound became the source of speech, of music and of melody. From then on she was called Vagdevi — the presiding mother of voice, learning and the arts, Maa Saraswati.',
        ],
      },
      {
        id: 'voice-to-the-world',
        titleHi: 'जगत को वाणी का वरदान',
        titleEn: 'The gift of voice to the world',
        bodyHi: [
          'वीणा का वह नाद जैसे-जैसे फैलता गया, समस्त सृष्टि जाग उठी। नदियाँ कल-कल बहकर गीत गाने लगीं, पवन वृक्षों के पत्तों में सरसराहट भरने लगा, पक्षी कूजने लगे और मनुष्यों के कंठ से पहली बार शब्द फूटे। मूक प्राणियों को वाणी मिली, और जो भाव अब तक मन में बंद थे, वे स्वर बनकर बहने लगे।',
          'देवी सरस्वती की कृपा से ही ज्ञान, अक्षर, छंद, राग और समस्त विद्याएँ जगत में प्रकट हुईं। उनके हाथ की पुस्तक शास्त्रों का, वीणा संगीत का, माला साधना का और श्वेत वस्त्र निर्मल बुद्धि का प्रतीक बना। ब्रह्मा जी की सृष्टि, जो अब तक एक नीरव चित्र थी, उनकी ही कृपा से सजीव, सुरमय और सार्थक हो उठी।',
        ],
        bodyEn: [
          'As that note of the veena spread further and further, the whole of creation awoke. The rivers began to sing as they flowed murmuring along, the wind set the leaves of the trees rustling, the birds began to call, and from the throats of human beings words burst forth for the first time. The mute creatures received speech, and the feelings that had until then been locked within their hearts now flowed out as sound.',
          'It was by the grace of Devi Saraswati that knowledge, letters, metre, melody and all the branches of learning appeared in the world. The book in her hand became the emblem of the scriptures, her veena of music, her rosary of disciplined practice, and her white robe of a pure and untroubled mind. Brahma’s creation, which until then had been a silent picture, was through her grace made living, full of melody, and meaningful.',
        ],
      },
      {
        id: 'vasant-panchami-day',
        titleHi: 'वसंत पंचमी का पावन दिन',
        titleEn: 'The sacred day of Vasant Panchami',
        bodyHi: [
          'जिस तिथि को देवी सरस्वती प्रकट हुई थीं, वह माघ शुक्ल पंचमी थी — ठीक वही दिन जब प्रकृति शीत की जड़ता त्यागकर वसंत का स्वागत करती है। खेत पीले सरसों के फूलों से लहलहा उठते हैं, कोयल कूकने लगती है और हर ओर नवजीवन का उल्लास छा जाता है। इसी कारण यह दिन ‘वसंत पंचमी’ कहलाया और माँ सरस्वती के प्राकट्य-पर्व के रूप में पूजा जाने लगा।',
          'आज भी इस दिन घर, विद्यालय और मंदिर सरस्वती की प्रतिमा से सज उठते हैं। पीले वस्त्र पहनकर भक्त उन्हें पीले पुष्प, पुस्तकें और वीणा अर्पित करते हैं; छोटे बालक इसी शुभ दिन पहली बार अक्षर लिखना आरंभ करते हैं। कहा जाता है कि जो श्रद्धा से वाग्देवी का पूजन करता है, उसकी बुद्धि निर्मल होती है, वाणी में मधुरता आती है और विद्या तथा कला में उसे सिद्धि प्राप्त होती है। इस प्रकार मौन से उपजी वह दिव्य वीणा-ध्वनि आज भी हर साधक के हृदय में ज्ञान का दीप जलाती रहती है।',
        ],
        bodyEn: [
          'The day on which Devi Saraswati appeared was the fifth bright day of the month of Magha — the very day when nature casts off the dullness of winter and welcomes the spring. The fields ripple with golden mustard blossoms, the cuckoo begins to sing, and a joy of new life spreads in every direction. For this reason the day came to be called Vasant Panchami and is honoured as the festival of Maa Saraswati’s appearance.',
          'Even today, on this day homes, schools and temples are adorned with the image of Saraswati. Clad in yellow, devotees offer her yellow flowers, books and the veena; little children write their first letters upon this auspicious day. It is said that whoever worships Vagdevi with devotion gains a clear mind, sweetness in speech, and mastery in learning and the arts. So the divine note of that veena, born out of silence, still kindles the lamp of knowledge in the heart of every seeker.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'janmashtami-katha',
    titleHi: 'जन्माष्टमी कथा',
    titleEn: 'Janmashtami Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'kamsa-tyranny',
        titleHi: 'मथुरा पर कंस का अत्याचार',
        titleEn: 'Kamsa’s tyranny over Mathura',
        bodyHi: [
          'यमुना के तट पर बसी मथुरा कभी यदुवंश की सुख-समृद्धि से भरी नगरी थी, पर अब उसके राजमहल में भय की छाया मँडराती थी। उग्रसेन को उसके अपने ही पुत्र कंस ने बंदी बनाकर सिंहासन हड़प लिया था। कंस बलवान था, क्रूर था, और अपने अहंकार में डूबा हुआ था; उसके राज्य में संत-महात्मा सहमे रहते और प्रजा हर रात किसी अनहोनी की प्रतीक्षा में आँखें मूँदती।',
          'कंस को अपनी बहन देवकी से अत्यंत स्नेह था। जब देवकी का विवाह यादव वसुदेव से हुआ, तो कंस स्वयं उल्लास में भरकर उनका रथ हाँकने लगा। फूलों से सजे उस रथ पर बैठे नवदंपती को नगरवासी आशीर्वाद दे रहे थे, और एक क्षण के लिए मथुरा का भय भूलकर हर्ष में डूब गई थी।',
          'किंतु जिस क्षण कंस सबसे प्रसन्न था, उसी क्षण आकाश से एक गंभीर वाणी गूँज उठी। उस अदृश्य आकाशवाणी ने जो कहा, उसने रथ की डोर थामे कंस के हाथ काँपते छोड़ दिए।',
        ],
        bodyEn: [
          'Mathura, settled on the banks of the Yamuna, had once been a city brimming with the prosperity of the Yadava clan, but now a shadow of fear hung over its royal halls. King Ugrasena had been thrown into prison by his own son Kamsa, who had seized the throne. Kamsa was mighty, he was cruel, and he was drowned in his own arrogance; in his kingdom the saints and sages shrank back in dread, and every night the people closed their eyes awaiting some calamity.',
          'Kamsa held a deep affection for his sister Devaki. When Devaki was married to the Yadava noble Vasudeva, Kamsa himself, brimming with joy, took up the reins of their chariot to drive it. The newlyweds sat upon that flower-decked chariot as the townsfolk showered blessings upon them, and for a single moment Mathura forgot its fear and sank into delight.',
          'Yet at the very instant Kamsa was happiest, a grave voice resounded from the sky. What that unseen heavenly proclamation declared made the reins tremble in the hands of Kamsa who held them.',
        ],
      },
      {
        id: 'prophecy-and-prison',
        titleHi: 'आकाशवाणी और बंदीगृह',
        titleEn: 'The prophecy and the prison',
        bodyHi: [
          '‘हे कंस,’ आकाशवाणी बोली, ‘जिस बहन को तू इतने प्रेम से ले जा रहा है, उसी का आठवाँ पुत्र तेरा काल बनेगा और तेरे हाथों तेरा वध होगा।’ इतना सुनते ही कंस का स्नेह क्रोध में बदल गया। उसने तलवार खींच ली और देवकी के बाल पकड़कर उसे मार डालने को उद्यत हो गया।',
          'वसुदेव ने हाथ जोड़कर कंस को रोका और कहा, ‘हे राजन, स्त्री का वध तुम्हारी कीर्ति पर कलंक होगा। तुझे भय देवकी से नहीं, उसकी संतान से है। मैं वचन देता हूँ — इसके गर्भ से जो भी शिशु जन्मेगा, उसे मैं स्वयं तेरे हाथों में सौंप दूँगा।’ वसुदेव के सत्यवचन पर विश्वास कर कंस ने उस क्षण तो तलवार रोक ली।',
          'किंतु कंस का संदेह कभी शांत न हुआ। उसने देवकी और वसुदेव दोनों को लोहे की बेड़ियों में जकड़कर कारागार में डाल दिया। एक-एक करके देवकी के छह शिशु जन्मे, और निष्ठुर कंस ने हर एक को मार डाला। प्रजा सिसकती रही, और बंदीगृह की दीवारों के भीतर एक माँ का हृदय बार-बार टूटता रहा।',
        ],
        bodyEn: [
          '‘O Kamsa,’ the heavenly voice declared, ‘this very sister whom you carry away with such love—her eighth son shall become your death, and by his hand you shall be slain.’ The moment he heard this, Kamsa’s affection turned to rage. He drew his sword, seized Devaki by her hair, and made ready to kill her then and there.',
          'Folding his hands, Vasudeva stopped Kamsa and said, ‘O king, the killing of a woman would be a stain upon your fame. Your danger is not from Devaki but from her children. I give you my word—whatever child is born of her womb, I myself shall place into your hands.’ Trusting in Vasudeva’s truthful vow, Kamsa stayed his sword for that moment.',
          'But Kamsa’s suspicion was never stilled. He bound both Devaki and Vasudeva in iron chains and cast them into prison. One after another, six infants were born to Devaki, and the merciless Kamsa slew each of them. The people wept on, and within the walls of that dungeon a mother’s heart broke again and again.',
        ],
      },
      {
        id: 'midnight-birth',
        titleHi: 'अर्धरात्रि में श्रीकृष्ण का अवतरण',
        titleEn: 'The midnight descent of Shri Krishna',
        bodyHi: [
          'समय बीतता गया और भाद्रपद मास के कृष्ण पक्ष की अष्टमी आ पहुँची। रोहिणी नक्षत्र आकाश में उदित था और घनघोर बादल वर्षा कर रहे थे। उसी अर्धरात्रि में, कारागार की उस अंधेरी कोठरी में, देवकी के गर्भ से स्वयं भगवान विष्णु ने आठवें पुत्र के रूप में अवतार लिया।',
          'जिस क्षण शिशु प्रकट हुआ, कोठरी एक दिव्य प्रकाश से भर उठी। उस तेज में देवकी और वसुदेव ने शंख, चक्र, गदा और पद्म धारण किए चतुर्भुज नारायण के दर्शन किए। दोनों ने हाथ जोड़कर उस अद्भुत बालक को प्रणाम किया, और भगवान ने उन्हें अपने पूर्वजन्मों की स्मृति कराकर अपना संकल्प बताया।',
          '‘मुझे शीघ्र गोकुल में नंद के घर पहुँचा दो,’ बालरूप नारायण ने वसुदेव से कहा, ‘वहाँ यशोदा ने अभी-अभी एक कन्या को जन्म दिया है। उस कन्या को यहाँ ले आओ।’ इतना कहते ही चमत्कार हुआ — वसुदेव की बेड़ियाँ अपने आप खुल गईं, कारागार के पहरेदार गहरी नींद में डूब गए, और लोहे के विशाल द्वार स्वयं खुलते चले गए।',
        ],
        bodyEn: [
          'Time passed on, and the eighth night—the Ashtami of the dark fortnight of the month of Bhadrapada—arrived. The Rohini constellation had risen in the sky, and thick clouds were pouring down rain. In that very midnight, within that dark cell of the prison, Lord Vishnu himself descended as the eighth son from the womb of Devaki.',
          'The instant the child appeared, the cell filled with a divine radiance. Within that glow Devaki and Vasudeva beheld the four-armed Narayana, bearing the conch, the discus, the mace, and the lotus. Folding their hands, the two bowed to that wondrous child, and the Lord, awakening in them the memory of their former births, revealed his purpose.',
          '‘Carry me at once to Gokul, to the house of Nanda,’ the infant Narayana said to Vasudeva, ‘for there Yashoda has just this moment given birth to a daughter. Bring that girl here.’ No sooner had he spoken than a marvel unfolded—Vasudeva’s chains fell open of their own accord, the prison guards sank into deep slumber, and the great iron gates swung open by themselves.',
        ],
      },
      {
        id: 'crossing-yamuna',
        titleHi: 'उफनती यमुना पार गोकुल की यात्रा',
        titleEn: 'Crossing the flooded Yamuna to Gokul',
        bodyHi: [
          'वसुदेव ने नवजात शिशु को एक टोकरी में रखा और उसे सिर पर उठाकर वर्षा की उस काली रात में बाहर निकल पड़े। मूसलाधार बारिश से बचाने के लिए शेषनाग ने अपने सहस्र फणों का छत्र बालक के ऊपर तान दिया, और वसुदेव बिना रुके आगे बढ़ते रहे।',
          'मार्ग में यमुना नदी उफान पर थी, उसकी लहरें गरजकर ऊपर उठ रही थीं। वसुदेव ठिठके, पर ज्यों ही उन्होंने जल में पाँव रखा, नदी ने शिशु के चरण-स्पर्श की अभिलाषा से अपना जल घटा दिया और मार्ग दे दिया। वसुदेव सकुशल दूसरे तट पर गोकुल पहुँच गए।',
          'नंद के घर में सब योगमाया की निद्रा में सो रहे थे। वसुदेव ने चुपचाप अपने पुत्र को सोई हुई यशोदा के पास लिटा दिया और उनकी नवजात कन्या को गोद में उठा लिया। फिर वे उसी पथ से लौट पड़े, और यमुना ने फिर उन्हें मार्ग दिया।',
        ],
        bodyEn: [
          'Vasudeva placed the newborn in a basket, lifted it upon his head, and set out into that black, rain-lashed night. To shield the child from the torrential downpour, the serpent Sheshanaga spread the canopy of his thousand hoods above the infant, and Vasudeva pressed forward without pause.',
          'On the way the river Yamuna was in flood, her waves rising and roaring high. Vasudeva hesitated, but the moment he set foot in the water, the river—longing to touch the feet of the child—lowered her waters and gave him passage. Vasudeva crossed safely to the far bank and reached Gokul.',
          'In Nanda’s house all lay sleeping under the slumber of Yogamaya. Quietly Vasudeva laid his son beside the sleeping Yashoda and lifted her newborn daughter into his arms. Then he turned back along the same path, and once more the Yamuna parted to give him way.',
        ],
      },
      {
        id: 'yogamaya-and-kamsa',
        titleHi: 'योगमाया की चेतावनी और कंस की विफलता',
        titleEn: 'Yogamaya’s warning and Kamsa’s failure',
        bodyHi: [
          'वसुदेव कारागार लौटे ही थे कि बेड़ियाँ फिर ज्यों की त्यों जुड़ गईं और द्वार बंद हो गए। नवजात कन्या के रुदन से पहरेदार जाग पड़े और दौड़कर कंस को समाचार दिया कि देवकी का आठवाँ संतान जन्म ले चुका है।',
          'कंस भागता हुआ बंदीगृह आया और देवकी की गोद से उस कन्या को छीनकर शिला पर पटकने को उठाया। पर वह कन्या साधारण न थी — वह योगमाया थी। कंस के हाथ से छूटते ही वह आकाश में अष्टभुजा देवी के रूप में प्रकट हो गई और गरजकर बोली, ‘रे मूर्ख! तेरा वध करने वाला तो जन्म ले चुका है और सुरक्षित स्थान पर पल रहा है। मुझे मारने से तेरा कुछ भला न होगा।’ इतना कहकर वह अंतर्धान हो गई।',
          'कंस के लाख प्रयत्न उसके भाग्य को न मोड़ सके; नियति की वही वाणी सत्य निकली, और समय आने पर वही बालक कृष्ण उसके अंत का कारण बना। तभी से भाद्रपद कृष्ण अष्टमी की उस पावन अर्धरात्रि को भक्तजन उपवास रखते, झूले सजाते और ‘नंद के आनंद भयो, जय कन्हैया लाल की’ के जयघोष से जागरण करते हैं। जो श्रद्धा से यह जन्माष्टमी व्रत रखता और कृष्ण-जन्म की यह कथा सुनता है, उसके पाप कट जाते हैं, घर में सुख-संतान और समृद्धि का वास होता है, और उस पर सदा भगवान श्रीकृष्ण की कृपा बनी रहती है।',
        ],
        bodyEn: [
          'No sooner had Vasudeva returned to the prison than the chains rejoined exactly as before and the gates closed shut. The cry of the newborn girl woke the guards, who ran to bring Kamsa the news that Devaki’s eighth child had been born.',
          'Kamsa came running to the dungeon, snatched the girl from Devaki’s lap, and raised her to dash her upon a rock. But that girl was no ordinary child—she was Yogamaya. The instant she slipped from Kamsa’s hands, she rose into the sky in the form of the eight-armed Goddess and thundered, ‘O fool! The one destined to slay you is already born and is being raised in a safe place. Killing me will do you no good.’ With these words she vanished.',
          'Kamsa’s countless efforts could not turn aside his fate; the words of destiny proved true, and in time that very boy Krishna became the cause of his end. Ever since, on that holy midnight of the eighth day of the dark fortnight of Bhadrapada, devotees keep a fast, adorn cradles, and stay awake through the night with cries of ‘Nanda’s joy has arrived—victory to dear Kanhaiya!’ Whoever keeps this Janmashtami vow with faith and hears this tale of Krishna’s birth has their sins washed away, sees happiness, children, and prosperity dwell in their home, and remains forever under the grace of Lord Shri Krishna.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'guru-purnima-katha',
    titleHi: 'गुरु पूर्णिमा कथा',
    titleEn: 'Guru Purnima Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'yamuna-tat-par-janm',
        titleHi: 'यमुना तट पर व्यास का जन्म',
        titleEn: 'The Birth of Vyasa on the Yamuna’s Bank',
        bodyHi: [
          'यमुना के नीले जल पर सांध्य धुंध तैर रही थी, और एक छोटी-सी नौका धीरे-धीरे एक द्वीप की ओर बढ़ रही थी। उस नौका को खेने वाली थीं धीवरकन्या सत्यवती, और उनके साथ बैठे थे महातपस्वी पराशर ऋषि, जो वसिष्ठ के पौत्र और शक्ति मुनि के पुत्र थे। ऋषि की दृष्टि उस तेजस्विनी कन्या पर पड़ी और उन्होंने उसके भीतर एक ऐसे महापुरुष की माता होने का योग देखा, जो आने वाले युगों तक धर्म का दीप जलाए रखेगा।',
          'उसी एकांत द्वीप पर, मुनि के तप और संकल्प से सत्यवती को एक अलौकिक पुत्र की प्राप्ति हुई। शिशु का वर्ण श्याम था, इसलिए वह ‘कृष्ण’ कहलाया, और यमुना के उसी द्वीप (द्वैपायन) में जन्म लेने के कारण उसका नाम ‘कृष्ण द्वैपायन’ पड़ा। जन्म लेते ही वह बालक तपस्वी रूप धारण कर उठ खड़ा हुआ और माता-पिता को प्रणाम करके बोला, ‘जब-जब आप मुझे स्मरण करेंगी, मैं उसी क्षण उपस्थित हो जाऊँगा।’',
          'ऐसा कहकर वह तेजोमय बालक तपस्या के लिए वन की ओर चल पड़ा। आगे चलकर यही बालक वेदों के विशाल ज्ञान-राशि का संपादन करने के कारण ‘वेद व्यास’ के नाम से तीनों लोकों में विख्यात हुआ, और समस्त गुरु-परंपरा का आदि स्रोत बनकर पूजित हुआ।',
        ],
        bodyEn: [
          'Evening mist drifted over the blue waters of the Yamuna, and a small boat moved slowly toward an island. The one who plied the oars was Satyavati, daughter of a fisherman, and seated beside her was the great ascetic Parashara, grandson of Vasishtha and son of the sage Shakti. The sage’s gaze fell upon that radiant maiden, and within her he saw the destiny of becoming mother to such a great soul as would keep the lamp of dharma burning through the ages to come.',
          'Upon that lonely island, by the austerity and resolve of the sage, Satyavati was granted an extraordinary son. The infant was dark of complexion, and so he was called ‘Krishna,’ and because he was born upon that island (dvaipa) in the Yamuna, he received the name ‘Krishna Dvaipayana.’ No sooner was he born than the boy rose up in the form of an ascetic, bowed to his parents, and said, ‘Whenever you remember me, in that very moment I shall appear before you.’',
          'Saying this, that luminous boy set out toward the forest for penance. In time this same boy, because he edited and arranged the vast treasury of Vedic knowledge, became renowned throughout the three worlds by the name ‘Veda Vyasa,’ and was worshipped as the original fountainhead of the whole tradition of gurus.',
        ],
      },
      {
        id: 'ek-ved-ke-char-bhag',
        titleHi: 'एक वेद के चार विभाग',
        titleEn: 'The One Veda Divided into Four',
        bodyHi: [
          'वेद व्यास ने अपने दिव्य ज्ञान-नेत्रों से देखा कि आने वाले कलियुग में मनुष्य की आयु क्षीण, बुद्धि मंद और स्मरण-शक्ति दुर्बल हो जाएगी। तब तक वेद एक ही अखंड राशि के रूप में था—इतना विशाल कि कोई साधारण मनुष्य उसे कंठस्थ करके धारण नहीं कर सकता था। मुनि के हृदय में करुणा उमड़ी कि यह अमूल्य ज्ञान कहीं लुप्त न हो जाए।',
          'इसी कल्याण-भावना से उन्होंने उस एक वेद को चार भागों में विभक्त किया—ऋग्वेद, यजुर्वेद, सामवेद और अथर्ववेद। फिर उन्होंने अपने चार प्रमुख शिष्यों को यह भार सौंपा: पैल को ऋग्वेद, वैशम्पायन को यजुर्वेद, जैमिनि को सामवेद, और सुमन्तु को अथर्ववेद। एक से चार होकर वेद सुगम हो गए, और गुरु से शिष्य तक प्रवाहित होने वाली ज्ञान की धारा अविच्छिन्न बनी रही।',
          'यहीं नहीं रुके वेद व्यास। उन्होंने अठारह महापुराणों की रचना की, ब्रह्मसूत्रों का गुम्फन किया, और लाखों श्लोकों वाले ‘महाभारत’ महाकाव्य को रचा, जिसके भीतर उन्होंने श्रीमद्भगवद्गीता का अमृत भर दिया। कहा जाता है कि उस विशाल ग्रंथ को लिपिबद्ध करने के लिए स्वयं गणपति लेखक बने और व्यास उसे अविराम बोलते चले गए।',
        ],
        bodyEn: [
          'With his divine eyes of wisdom, Veda Vyasa foresaw that in the coming age of Kali, the lifespan of human beings would shrink, their intellect grow dull, and their power of memory weaken. Until then the Veda existed as a single undivided mass—so immense that no ordinary person could commit it to memory and hold it whole. Compassion welled up in the sage’s heart, lest this priceless knowledge be lost.',
          'Out of this very wish for the welfare of all, he divided that one Veda into four parts—the Rigveda, the Yajurveda, the Samaveda, and the Atharvaveda. Then he entrusted this charge to his four chief disciples: the Rigveda to Paila, the Yajurveda to Vaishampayana, the Samaveda to Jaimini, and the Atharvaveda to Sumantu. Made one into four, the Vedas became approachable, and the stream of knowledge flowing from teacher to disciple remained unbroken.',
          'Nor did Veda Vyasa stop there. He composed the eighteen great Puranas, wove together the Brahma Sutras, and shaped the epic ‘Mahabharata’ of countless verses, within which he poured the nectar of the Shrimad Bhagavad Gita. It is said that to set down that vast work in writing, Ganapati himself became the scribe, while Vyasa spoke it forth without pause.',
        ],
      },
      {
        id: 'vyasa-purnima-ka-mahima',
        titleHi: 'व्यास पूर्णिमा का माहात्म्य',
        titleEn: 'The Glory of Vyasa Purnima',
        bodyHi: [
          'आषाढ़ मास की पूर्णिमा के दिन, जब आकाश में चंद्रमा अपनी सम्पूर्ण कलाओं से दीप्त होता है, वही तिथि वेद व्यास के आविर्भाव की तिथि मानी गई। शिष्यों ने अनुभव किया कि जैसे पूर्ण चंद्र अंधकार को हर लेता है, वैसे ही गुरु का ज्ञान अंतःकरण के अज्ञान-तम को मिटा देता है। इसी कारण इस पूर्णिमा को ‘व्यास पूर्णिमा’ और ‘गुरु पूर्णिमा’ कहकर पूजने की परंपरा चल पड़ी।',
          'उस पावन दिन सनातन परंपरा के संत, साधु और गृहस्थ अपने-अपने गुरुओं के चरणों में जाकर श्रद्धा से सिर झुकाते हैं। वे गुरु के आसन का पूजन करते, उन्हें पुष्प, फल और वस्त्र अर्पित करते, और ‘गुरुर्ब्रह्मा गुरुर्विष्णुः’ के मंगल स्वरों से वातावरण भर देते हैं। जिसके पास गुरु प्रत्यक्ष न हों, वे वेद व्यास को आदि गुरु मानकर उनका स्मरण करते हैं।',
          'पूरे वर्ष भर भ्रमण करते रहने वाले संन्यासी इसी दिन से चातुर्मास का व्रत आरंभ कर एक स्थान पर रुककर शास्त्रों का चिंतन और शिष्यों को उपदेश करते हैं। इस प्रकार गुरु पूर्णिमा केवल एक तिथि नहीं, बल्कि गुरु-शिष्य के उस पवित्र बंधन का उत्सव बन गई, जिसके सहारे ज्ञान पीढ़ी-दर-पीढ़ी जीवित रहता है।',
        ],
        bodyEn: [
          'On the full-moon day of the month of Ashadha, when the moon shines in the sky with all its phases complete, that very date came to be honoured as the day of Veda Vyasa’s appearance. Disciples felt that just as the full moon dispels the darkness, so too the knowledge of the guru wipes away the gloom of ignorance from the inner being. For this reason the tradition arose of revering this full moon as ‘Vyasa Purnima’ and ‘Guru Purnima.’',
          'On that sacred day, the saints, ascetics, and householders of the eternal tradition go to the feet of their own gurus and bow their heads in reverence. They worship the seat of the guru, offer flowers, fruit, and cloth, and fill the air with the auspicious notes of ‘Gurur Brahma, Gurur Vishnu.’ Those who have no living guru before them remember Veda Vyasa, holding him as the first of all gurus.',
          'The renunciants who wander through all the seasons of the year begin from this day the vow of Chaturmasa, halting in one place to contemplate the scriptures and instruct their disciples. Thus Guru Purnima became not a mere date, but a festival of that holy bond between guru and disciple, upon which knowledge stays alive from one generation to the next.',
        ],
      },
      {
        id: 'aaruni-ki-bhakti',
        titleHi: 'आरुणि की गुरुभक्ति',
        titleEn: 'The Devotion of Aaruni',
        bodyHi: [
          'गुरु-शिष्य की महिमा कितनी गहन है, इसका उदाहरण आचार्य धौम्य के आश्रम में देखने को मिला। उनके शिष्यों में आरुणि नाम का एक सरल और श्रद्धालु बालक था। एक रात्रि घनघोर वर्षा हुई, और गुरु को चिंता हुई कि खेत के मेड़ की कोई दरार से कहीं सारा जल बह न जाए, जिससे फसल नष्ट हो जाए। उन्होंने आरुणि को उस टूटे बंध को सँभालने भेजा।',
          'आरुणि अंधेरे और मूसलधार वर्षा में खेत पर पहुँचा, पर मेड़ की दरार इतनी चौड़ी थी कि मिट्टी डालते ही बह जाती। बहुत प्रयत्न के बाद भी जब जल न रुका, तो उस भक्त शिष्य ने अपने ही शरीर को उस दरार पर लिटा दिया, ताकि गुरु का खेत सुरक्षित रहे। सारी रात वह कीचड़ और ठंडे जल में पड़ा बंध की रक्षा करता रहा, बिना एक क्षण भी अपनी पीड़ा का विचार किए।',
          'प्रातः जब आरुणि लौटकर न आया, तो आचार्य धौम्य स्वयं शिष्यों के साथ खेत पर गए और पुकारा। तब कीचड़ में लेटा हुआ आरुणि उठ खड़ा हुआ और गुरु के चरणों में गिर पड़ा। उसकी निष्ठा देखकर गुरु का हृदय द्रवित हो उठा; उन्होंने उसे हृदय से लगाकर आशीर्वाद दिया कि बिना पढ़े ही समस्त वेद और शास्त्र उसके अंतःकरण में स्वतः प्रकाशित हो जाएँ। तभी से वह ‘उद्दालक आरुणि’ के नाम से महान ऋषि के रूप में प्रसिद्ध हुआ।',
        ],
        bodyEn: [
          'How profound is the glory of guru and disciple was once seen in the hermitage of the teacher Dhaumya. Among his pupils was a simple and devoted boy named Aaruni. One night there was a fierce downpour, and the guru grew anxious that through some breach in the bank of the field all the water might drain away and the crop be ruined. He sent Aaruni to mend that broken embankment.',
          'Aaruni reached the field in the darkness and the lashing rain, but the breach in the bank was so wide that the moment he packed earth into it, the earth was washed away. When, despite great effort, the water would not be stopped, that devoted disciple laid his own body down across the breach, so that his guru’s field might be kept safe. All night long he lay in the mud and the cold water, guarding the bank, without giving a single moment’s thought to his own suffering.',
          'In the morning, when Aaruni had not returned, the teacher Dhaumya himself went to the field with his pupils and called out to him. Then Aaruni, lying in the mud, rose up and fell at the guru’s feet. Seeing his steadfastness, the teacher’s heart melted; embracing him close, he blessed him that, without ever having studied, all the Vedas and scriptures should shine forth of themselves within his inner being. From that time onward he became famed as the great sage ‘Uddalaka Aaruni.’',
        ],
      },
      {
        id: 'guru-charanon-ka-prakash',
        titleHi: 'गुरु चरणों का प्रकाश',
        titleEn: 'The Light at the Guru’s Feet',
        bodyHi: [
          'इसी भाव को हृदय में धारण कर भक्तजन गुरु पूर्णिमा के दिन प्रातः स्नान कर शुद्ध आसन पर बैठते हैं, अपने गुरु अथवा आदि गुरु वेद व्यास का ध्यान करते हैं, और ‘व्यासाय विष्णुरूपाय’ का स्मरण करके उनकी पूजा करते हैं। जो उपवास रखकर इस तिथि को व्यतीत करते हैं, वे दिन भर मौन और मनन में डूबे रहते हैं और संध्या को गुरु-स्तुति के पश्चात ही फलाहार ग्रहण करते हैं।',
          'ऐसा कहा जाता है कि जो मनुष्य इस पूर्ण चंद्र की रात्रि में सच्ची श्रद्धा से गुरु का पूजन करता है, उसके अंतःकरण का अंधकार उसी प्रकार छँट जाता है जैसे चंद्रमा के उदय से रात्रि का तम। उसकी बुद्धि निर्मल होती है, विद्या स्थिर होती है, और जीवन में सन्मार्ग की ज्योति स्वयं प्रकट हो उठती है—क्योंकि जहाँ गुरु के चरणों में सिर झुकता है, वहीं ज्ञान का अक्षय दीप जलता रहता है।',
        ],
        bodyEn: [
          'Holding this very spirit in the heart, devotees on the day of Guru Purnima bathe at dawn, sit upon a clean seat, meditate upon their guru or upon the first guru Veda Vyasa, and worship him with the remembrance of ‘Vyasaya Vishnurupaya.’ Those who keep a fast through this day remain immersed in silence and reflection, and only in the evening, after the praise of the guru, do they take their light meal of fruit.',
          'It is said that whoever, on the night of this full moon, worships the guru with true faith finds the darkness of his inner being lifted away, just as the rising moon lifts the gloom of night. His intellect becomes clear, his learning grows steady, and the light of the right path appears of itself within his life—for wherever the head bows at the guru’s feet, there the inexhaustible lamp of knowledge stays alight.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'govardhan-puja-katha',
    titleHi: 'गोवर्धन पूजा कथा',
    titleEn: 'Govardhan Puja Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'vraj-ki-taiyari',
        titleHi: 'इंद्र-यज्ञ की तैयारी और कृष्ण का प्रश्न',
        titleEn: 'Preparations for Indra\'s Yajna and Krishna\'s Question',
        bodyHi: [
          'शरद ऋतु बीत रही थी और व्रज के घर-घर में एक विशेष चहल-पहल थी। नंद बाबा के आँगन में गोप-गोपियाँ घी, दूध, दही और अन्न के ढेर सजा रहे थे, क्योंकि प्रति वर्ष की भाँति इस बार भी देवराज इंद्र की पूजा का महायज्ञ होने वाला था। बालक कृष्ण ने यह सारा आयोजन देखकर अपने पिता नंद के पास जाकर मधुर स्वर में पूछा, ‘हे पिताजी, यह इतनी सामग्री किस उत्सव के लिए एकत्र की जा रही है? यह यज्ञ किसके निमित्त है और इससे हमें क्या फल मिलता है?’',
          'नंद बाबा ने स्नेह से पुत्र के मस्तक पर हाथ फेरते हुए कहा, ‘वत्स, मेघों के स्वामी देवराज इंद्र ही वर्षा करते हैं। उन्हीं के जल से हमारे खेत हरे होते हैं, घास उगती है और हमारी गायें पुष्ट होती हैं। इसी कृतज्ञता में हम प्रतिवर्ष इंद्र का यज्ञ करते हैं, ताकि वे प्रसन्न रहें और समय पर वर्षा करते रहें।’',
          'कृष्ण मुस्कुराए और बोले, ‘पिताजी, वर्षा तो प्रकृति के नियम से होती है, और जो सचमुच हमारा भरण-पोषण करता है, वह तो यह गोवर्धन पर्वत है। इसी की हरी-भरी ढलानों पर हमारी गायें चरती हैं, इसी की औषधियाँ और वृक्ष हमें फल-फूल देते हैं, इसी के झरनों से हमारा जीवन चलता है। हम तो वनवासी गोप हैं; हमारा धर्म है कि हम अपनी गायों और इस गोवर्धन की पूजा करें, जो प्रत्यक्ष हमारा पालन करते हैं।’',
        ],
        bodyEn: [
          'The autumn season was drawing to its close, and an unusual stir filled every home in Vraj. In the courtyard of Nanda Baba, the cowherd men and women were arranging heaps of ghee, milk, curd, and grain, for, as every year, a great yajna in honour of Indra, king of the gods, was about to be held. The boy Krishna, watching all these preparations, went to his father Nanda and asked in a sweet voice, ‘O father, for what festival is all this abundance being gathered? In whose honour is this sacrifice, and what is the reward we gain from it?’',
          'Nanda Baba, lovingly running his hand over his son\'s head, replied, ‘Dear child, it is Indra, lord of the clouds and king of the gods, who sends the rains. By his waters our fields grow green, the grass springs up, and our cows grow strong. In gratitude for this we perform the yajna of Indra every year, so that he may remain pleased and continue to send rain in season.’',
          'Krishna smiled and said, ‘Father, the rains fall by the law of nature, and the one who truly sustains us is this Govardhan hill. Upon its green slopes our cows graze, its herbs and trees give us fruit and flower, and from its springs our life flows on. We are forest-dwelling cowherds; it is our dharma to worship our cows and this Govardhan, who nourish us before our very eyes.’',
        ],
      },
      {
        id: 'govardhan-puja',
        titleHi: 'गोवर्धन और गौओं का पूजन',
        titleEn: 'The Worship of Govardhan and the Cows',
        bodyHi: [
          'बालक के इन विवेकपूर्ण वचनों ने व्रजवासियों के हृदय को छू लिया। नंद बाबा और वृद्ध गोपों ने आपस में विचार किया और अंततः सहमत हो गए कि इस वर्ष वे इंद्र के स्थान पर गोवर्धन पर्वत और अपनी गौओं की पूजा करेंगे। समस्त व्रज में यह संदेश फैल गया, और सब ने हर्ष से अपनी सामग्री गोवर्धन की ओर मोड़ दी।',
          'नियत दिन गोप-गोपियाँ अपने सुंदर वस्त्र और आभूषण धारण कर, अन्न के पर्वत-समान ढेर, छप्पन प्रकार के व्यंजन, खीर, हलवा और अनेक मिष्ठान्न लेकर गोवर्धन के पास आ पहुँचे। उन्होंने पर्वत को चंदन, पुष्प और दीपों से सजाया, गायों के सींगों पर रंग चढ़ाए और बछड़ों को फूलों की मालाएँ पहनाईं। ढोल-मँजीरे बजने लगे और सारा वातावरण भक्ति-संगीत से गूँज उठा।',
          'तब कृष्ण ने अपनी लीला से एक विशाल दिव्य रूप धारण किया और गोवर्धन पर्वत पर स्वयं प्रकट होकर ‘मैं ही गिरिराज हूँ’ कहते हुए सारा अन्न-भोग स्वीकार किया, जबकि दूसरे रूप में वे व्रजवासियों के साथ खड़े होकर पर्वत की परिक्रमा करते रहे। यह अन्नकूट का प्रथम भोग था; गोवर्धन ने मानो प्रत्यक्ष होकर सब का अन्न ग्रहण किया, और व्रजवासियों के मन श्रद्धा और आनंद से भर उठे।',
        ],
        bodyEn: [
          'These wise words of the boy touched the hearts of the people of Vraj. Nanda Baba and the elder cowherds took counsel among themselves and at last agreed that this year, in place of Indra, they would worship the Govardhan hill and their own cows. The message spread through all of Vraj, and joyfully everyone turned their offerings toward Govardhan.',
          'On the appointed day the cowherd men and women, clad in their finest garments and ornaments, came to Govardhan bearing mountain-like heaps of grain, fifty-six kinds of delicacies, kheer, halwa, and many sweets. They adorned the hill with sandal paste, flowers, and lamps, painted the horns of their cows with colour, and hung garlands of flowers upon the calves. Drums and cymbals began to sound, and the whole air rang with the music of devotion.',
          'Then Krishna, through his divine play, assumed a vast resplendent form and, manifesting upon the Govardhan hill itself, declared, ‘I am Giriraj,’ and accepted all the offerings of food, while in another form he stood among the people of Vraj and circled the hill in reverence with them. This was the first feast of Annakut; it was as though Govardhan had become present before them and partaken of everyone\'s food, and the hearts of the Vraj folk overflowed with faith and delight.',
        ],
      },
      {
        id: 'indra-ka-prakop',
        titleHi: 'इंद्र का क्रोध और प्रलयंकारी वर्षा',
        titleEn: 'Indra\'s Wrath and the Devastating Rain',
        bodyHi: [
          'जब देवराज इंद्र को ज्ञात हुआ कि इस वर्ष व्रज में उनका यज्ञ नहीं हुआ और एक ग्वालबाल के कहने पर एक पर्वत और गौओं की पूजा कर दी गई, तो उनका अहंकार आहत हो उठा। क्रोध से भरकर उन्होंने अपने प्रलयकारी सांवर्तक मेघों को आदेश दिया, ‘जाओ और उस गर्वीले व्रज को जल में डुबो दो, ताकि वे जान सकें कि देवों के राजा का अपमान करने का परिणाम क्या होता है।’',
          'क्षण भर में आकाश काले मेघों से ढक गया। बिजली कड़कने लगी, भयंकर गर्जना से धरती काँप उठी, और मूसलाधार वर्षा टूट पड़ी—मानो आकाश ही फट पड़ा हो। दिन और रात का भेद मिट गया; जल की धाराएँ नदियों की तरह बहने लगीं और व्रज की गलियाँ, घर और खेत डूबने लगे।',
          'भयभीत गोप-गोपियाँ अपने बालकों, गायों और बछड़ों को लेकर कृष्ण के पास दौड़े आए और विलाप करने लगे, ‘हे कन्हैया! यह कैसा प्रलय आ पड़ा है? हमारी गायें ठिठुर रही हैं, बछड़े काँप रहे हैं, और हमारे पास छिपने को कोई स्थान नहीं। तुम्हीं ने हमें गोवर्धन की शरण लेने को कहा था; अब तुम्हीं हमारी रक्षा करो।’',
        ],
        bodyEn: [
          'When Indra, king of the gods, learned that this year his yajna had not been held in Vraj, and that at the word of a mere cowherd boy a hill and the cows had been worshipped instead, his pride was wounded. Filled with fury, he commanded his world-ending Samvartaka clouds, ‘Go and drown that proud Vraj in water, so that they may learn what comes of insulting the king of the gods.’',
          'In an instant the sky was shrouded in black clouds. Lightning cracked, the earth trembled with terrible thunder, and a torrential rain broke loose, as though the very heavens had split apart. The difference between day and night was erased; streams of water flowed like rivers, and the lanes, houses, and fields of Vraj began to drown.',
          'Terrified, the cowherd men and women ran to Krishna with their children, cows, and calves, and cried out in lament, ‘O Kanhaiya! What deluge has fallen upon us? Our cows are shivering, the calves are trembling, and we have no place to take shelter. It was you who told us to take refuge in Govardhan; now it is you who must protect us.’',
        ],
      },
      {
        id: 'girdhari-ka-utthaan',
        titleHi: 'कृष्ण द्वारा गोवर्धन को उठाना',
        titleEn: 'Krishna Lifts the Govardhan Hill',
        bodyHi: [
          'व्रजवासियों की पुकार सुनकर बालक कृष्ण तनिक भी विचलित न हुए। मंद मुस्कान के साथ वे गोवर्धन पर्वत के निकट गए और लीलापूर्वक अपने बाएँ हाथ की कनिष्ठा अँगुली पर उस विशाल पर्वत को ऐसे उठा लिया, जैसे कोई बालक छाते को उठा लेता हो। पर्वत आकाश में एक विराट छत्र की भाँति स्थिर हो गया।',
          '‘आओ, सब अपनी गायों और सामग्री सहित इस पर्वत के नीचे आ जाओ,’ कृष्ण ने सस्नेह कहा। समस्त व्रज—गोप, गोपियाँ, बालक, वृद्ध, गौएँ और बछड़े—गोवर्धन की उस विशाल छाया के नीचे सुरक्षित आ बैठे। बाहर प्रलय की वर्षा गरजती रही, परंतु भीतर एक बूँद भी न टपकी।',
          'पूरे सात दिन और सात रात तक कन्हैया अपनी उसी कोमल अँगुली पर गोवर्धन को थामे, अविचल खड़े रहे। न उन्हें भूख-प्यास व्यापी, न थकान। व्रजवासी मंत्रमुग्ध होकर अपने नन्हे गिरधारी की ओर निहारते रहे, और उनके हृदय में यह विश्वास दृढ़ हो गया कि जिसकी शरण में वे हैं, वह कोई साधारण बालक नहीं, अपितु स्वयं भगवान है।',
        ],
        bodyEn: [
          'Hearing the cry of the people of Vraj, the boy Krishna was not in the least disturbed. With a gentle smile he went up to the Govardhan hill and, in playful ease, lifted that vast mountain upon the little finger of his left hand, as a child might raise an umbrella. The hill held steady in the sky like a colossal canopy.',
          '‘Come, all of you, take shelter beneath this hill with your cows and your goods,’ Krishna said tenderly. The whole of Vraj—cowherds, women, children, the aged, the cows and the calves—came and sat safely beneath that vast shadow of Govardhan. Outside, the deluge raged and thundered, yet within, not a single drop fell.',
          'For seven full days and seven nights Kanhaiya held Govardhan upon that same delicate finger, standing unmoved. Neither hunger nor thirst touched him, nor weariness. The people of Vraj gazed spellbound at their little Girdhari, and the conviction grew firm within their hearts that the one in whose refuge they sat was no ordinary boy, but the Lord himself.',
        ],
      },
      {
        id: 'indra-ka-maan-bhang-aur-annakut',
        titleHi: 'इंद्र का मान-भंग और अन्नकूट की परंपरा',
        titleEn: 'Indra\'s Humbling and the Tradition of Annakut',
        bodyHi: [
          'सात दिनों तक अपनी समस्त शक्ति लगाकर भी जब इंद्र व्रज का कुछ बिगाड़ न सके, तो उनका अहंकार चूर-चूर हो गया। उन्होंने अपनी दिव्य दृष्टि से जाना कि जिस बालक को वे साधारण ग्वाला समझ रहे थे, वह तो स्वयं सृष्टि के पालनहार भगवान विष्णु ही धराधाम पर अवतरित हुए हैं। लज्जा और पश्चाताप से भरकर उन्होंने तुरंत वर्षा रोक दी।',
          'मेघ छँट गए और सूर्य की कोमल किरणें फिर से व्रज पर बिखर गईं। कृष्ण ने गोवर्धन को धीरे से उसके स्थान पर रख दिया, और सब व्रजवासी हर्ष से जयघोष करते हुए बाहर निकल आए। तभी देवराज इंद्र अपने ऐरावत हाथी पर सवार होकर वहाँ उतरे और कृष्ण के चरणों में नतमस्तक होकर बोले, ‘हे प्रभु, अपने ऐश्वर्य के मद में मैंने आपको पहचाना नहीं और अपराध कर बैठा। मुझे क्षमा कर दीजिए।’ कामधेनु ने आकर अपने दूध से उनका अभिषेक किया, और देवों ने पुष्प-वर्षा की।',
          'कृष्ण ने करुणा से इंद्र को क्षमा कर दिया और सिखाया कि अहंकार ही सबसे बड़ा शत्रु है, तथा जो प्रकृति, गौ और भूमि का पोषण करता है, उसी की कृतज्ञतापूर्वक पूजा करनी चाहिए। उसी दिन से कार्तिक शुक्ल प्रतिपदा को व्रजमंडल और समस्त भारतवर्ष में गोवर्धन पूजा का यह उत्सव मनाया जाने लगा। भक्तजन गोबर से गोवर्धन की प्रतिमा बनाकर उसका पूजन करते हैं, गौओं को सजाते हैं, और छप्पन भोग का अन्नकूट सजाकर भगवान को अर्पित करते हैं। ऐसा कहा जाता है कि जो श्रद्धा से इस पर्व को मनाता है, उसके घर में अन्न-धन की कभी कमी नहीं रहती, उसके दुख-संकट दूर होते हैं, और गिरधारी की कृपा से उसका जीवन सुख-समृद्धि से भर जाता है।',
        ],
        bodyEn: [
          'When, even after pouring forth all his power for seven days, Indra could do no harm to Vraj, his pride was shattered to pieces. With his divine sight he perceived that the boy he had taken for an ordinary cowherd was none other than Lord Vishnu himself, the sustainer of creation, descended upon the earth. Filled with shame and remorse, he at once stayed the rain.',
          'The clouds parted, and the soft rays of the sun spread once more over Vraj. Krishna gently set Govardhan back in its place, and all the people of Vraj came out raising shouts of joy. Then Indra, king of the gods, descended upon his elephant Airavata, bowed his head at Krishna\'s feet, and said, ‘O Lord, drunk on the pride of my sovereignty I failed to recognise you and committed an offence. Forgive me.’ The wish-fulfilling cow Kamadhenu came and bathed him with her milk, and the gods rained down flowers.',
          'Krishna compassionately forgave Indra and taught that pride is the greatest enemy, and that one should worship with gratitude that which nourishes us—nature, the cow, and the earth. From that very day, on the first day of the bright fortnight of Kartik, this festival of Govardhan Puja came to be celebrated throughout the land of Vraj and all of Bharat. Devotees fashion an image of Govardhan from cow-dung and worship it, adorn their cows, and arrange the Annakut of fifty-six offerings to present to the Lord. It is said that whoever celebrates this festival with faith never wants for grain or wealth in their home, their sorrows and troubles are driven away, and by the grace of Girdhari their life is filled with joy and prosperity.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'dussehra-katha',
    titleHi: 'दशहरा कथा',
    titleEn: 'Dussehra Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'abduction-of-sita',
        titleHi: 'पंचवटी से सीता का हरण',
        titleEn: 'Sita is carried away from Panchavati',
        bodyHi: [
          'दण्डक वन में पंचवटी की कुटिया के सामने एक स्वर्णमृग कूद-कूदकर घूम रहा था। उसका रोम-रोम सोने-सा दमक रहा था और खुरों पर मणियां जड़ी प्रतीत होती थीं। सीता उसे देखकर मोहित हो उठीं और श्रीराम से बोलीं, ‘हे आर्यपुत्र, यह मृग मुझे अति प्रिय है। इसे जीवित पकड़ लाइए, यह हमारी कुटिया की शोभा बढ़ाएगा।’ राम जानते थे कि वन में ऐसा मृग अनहोना है, फिर भी प्रिया की इच्छा पूरी करने वे धनुष उठाकर उसके पीछे चल पड़े, और लक्ष्मण को सीता की रक्षा का भार सौंप गए।',
          'वह मृग वस्तुतः मारीच नामक राक्षस था, जिसे रावण ने छल रचने भेजा था। बहुत दूर ले जाकर जब राम के बाण से वह बिंधा, तो मरते समय उसने राम के ही स्वर में पुकारा, ‘हा लक्ष्मण! हा सीता!’ वह करुण पुकार सुनकर सीता का हृदय कांप उठा। उन्होंने लक्ष्मण को विवश कर दिया कि वे राम की सहायता को दौड़ें। लक्ष्मण ने कुटिया के चारों ओर एक रेखा खींची और प्रार्थना की कि सीता उसे न लांघें।',
          'उसी क्षण रावण संन्यासी का वेश धरकर भिक्षा मांगता हुआ कुटिया पर आया। सीता ने श्रद्धा से रेखा के भीतर से अन्न देना चाहा, पर कपटी संन्यासी ने हठ किया कि भिक्षा हाथ में लेकर बाहर आकर दी जाए। ज्यों ही सीता ने रेखा पार की, रावण अपने भयंकर रूप में प्रकट हुआ और उन्हें बलपूर्वक अपने पुष्पक विमान में बैठाकर आकाश-मार्ग से लंका की ओर उड़ चला। गीधराज जटायु ने मार्ग में उसे रोका और घोर युद्ध किया, पर रावण ने उसके पंख काट दिए, और वह घायल पक्षी राम को संदेश देने के लिए प्राण रोके धरती पर पड़ा रहा।',
        ],
        bodyEn: [
          'In the Dandaka forest, before the hermitage at Panchavati, a golden deer went leaping and circling. Every hair of its body shimmered like gold, and gems seemed set upon its hooves. Sita was enchanted at the sight and said to Shri Rama, ‘O noble one, this deer delights me beyond measure. Catch it alive and bring it to me; it will grace our little hermitage.’ Rama knew that such a creature in the wild was unnatural, yet to fulfil his beloved wish he took up his bow and went after it, leaving Lakshmana to guard Sita.',
          'That deer was in truth a demon named Maricha, sent by Ravana to weave a trap. Drawn far away, when Rama arrow at last pierced him, in dying he cried out in Rama own voice, ‘Alas Lakshmana! Alas Sita!’ Hearing that piteous call, Sita heart trembled. She pressed Lakshmana until he ran to help his brother. Before he went, Lakshmana drew a line around the hermitage and prayed that Sita would not step beyond it.',
          'In that very moment Ravana came to the hermitage disguised as a mendicant, begging for alms. Sita, in reverence, wished to offer grain from within the line, but the deceitful ascetic insisted that the alms be placed in his hand outside. The instant Sita crossed the line, Ravana revealed his terrible form, seized her by force, set her upon his Pushpaka chariot, and flew through the sky toward Lanka. The vulture king Jatayu barred his path and fought a fierce battle, but Ravana cut away his wings, and the wounded bird lay upon the earth, holding back his life to give Rama the news.',
        ],
      },
      {
        id: 'alliance-with-vanaras',
        titleHi: 'वानरों से मित्रता और लंका की खोज',
        titleEn: 'Friendship with the vanaras and the search for Lanka',
        bodyHi: [
          'सीता को न पाकर राम और लक्ष्मण वन-वन भटकते, विलाप करते आगे बढ़े। मार्ग में मरणासन्न जटायु ने रावण द्वारा सीता-हरण की बात बताई और राम की गोद में प्राण त्याग दिए। राम ने उस गीध का अंतिम संस्कार पुत्र के समान किया। आगे ऋष्यमूक पर्वत पर उनकी भेंट वानर हनुमान से हुई, जो उन्हें सुग्रीव के पास ले गए। राम और सुग्रीव ने अग्नि को साक्षी मानकर मित्रता की प्रतिज्ञा की — राम सुग्रीव को उसका छीना हुआ राज्य लौटाएंगे और सुग्रीव सीता की खोज में राम की सहायता करेंगे।',
          'राम ने बाली का वध कर किष्किंधा का राज्य सुग्रीव को सौंपा। तब सुग्रीव ने चारों दिशाओं में वानरों के दल भेजे। दक्षिण दिशा में गए दल को जटायु के भाई संपाति से ज्ञात हुआ कि सीता सौ योजन दूर समुद्र के पार लंका में अशोक वाटिका में बंदिनी हैं। यह सुनकर सभी वानर समुद्र की विशालता देख ठिठक गए, पर जाम्बवान ने हनुमान को उनके भूले हुए बल का स्मरण कराया।',
          'हनुमान पर्वत के समान विशाल रूप धारण कर समुद्र लांघ गए। लंका में प्रवेश कर उन्होंने अशोक वाटिका में शोकमग्न सीता को खोज निकाला, राम की मुद्रिका उन्हें सौंपी और सांत्वना दी। लौटते समय उन्होंने रावण की स्वर्णनगरी को आग के हवाले कर अपनी शक्ति का परिचय दिया और राम को सीता का कुशल-समाचार तथा चूड़ामणि लाकर दी। अब राम का हृदय आश्वस्त हुआ कि सीता जीवित हैं और उन्हें लाने का समय आ गया है।',
        ],
        bodyEn: [
          'Unable to find Sita, Rama and Lakshmana wandered from grove to grove, lamenting as they searched. On the way the dying Jatayu told them of Sita abduction by Ravana and gave up his life in Rama lap. Rama performed the vulture last rites as for a son. Farther on, at Rishyamukha hill, they met the vanara Hanuman, who led them to Sugriva. With fire as their witness, Rama and Sugriva swore a vow of friendship — Rama would win back Sugriva stolen kingdom, and Sugriva would aid Rama in the search for Sita.',
          'Rama slew Bali and gave the kingdom of Kishkindha to Sugriva. Then Sugriva sent bands of vanaras to the four directions. The band that went south learned from Sampati, brother of Jatayu, that Sita was held captive a hundred yojanas away, across the sea, in the Ashoka grove of Lanka. Hearing this, all the vanaras halted before the vastness of the ocean, but Jambavan reminded Hanuman of the strength he had forgotten.',
          'Hanuman took a form vast as a mountain and leaped across the sea. Entering Lanka, he found grief-stricken Sita in the Ashoka grove, gave her Rama signet ring, and consoled her. Returning, he set Ravana golden city ablaze to show his power, and brought back to Rama the news of Sita welfare along with her crest-jewel. Now Rama heart was assured that Sita lived, and that the time had come to bring her home.',
        ],
      },
      {
        id: 'bridge-and-war',
        titleHi: 'सेतुबंध और लंका का महायुद्ध',
        titleEn: 'The bridge and the great war at Lanka',
        bodyHi: [
          'राम वानर-भालू की विशाल सेना के साथ समुद्र-तट पर पहुंचे। उन्होंने तीन दिन समुद्र से मार्ग मांगा, पर वह न माना। तब क्रोधित राम ने धनुष उठाया, और भयभीत समुद्र-देव प्रकट होकर बोले कि नल और नील के हाथों रचे सेतु को वे थाम लेंगे। वानरों ने राम का नाम लिखकर पत्थर तैराए, और सौ योजन लंबा सेतु बनकर तैयार हो गया, जिस पर चढ़कर सारी सेना लंका में उतर गई। उधर रावण के धर्मात्मा भाई विभीषण ने अधर्म का साथ छोड़कर राम की शरण ली, और राम ने उसे अभय देकर लंका का भावी राजा घोषित किया।',
          'घोर युद्ध छिड़ गया। राक्षसों और वानरों में दिन-रात संग्राम होता रहा। रावण का महाबली पुत्र इंद्रजीत मेघनाद माया से युद्ध करता और नागपाश तथा शक्ति-बाण से राम-लक्ष्मण को मूर्च्छित कर देता। जब लक्ष्मण शक्ति-बाण से गिरे और प्राण संकट में पड़े, तब हनुमान संजीवनी बूटी के लिए हिमालय उड़ चले और पूरा द्रोणगिरि पर्वत उठा लाए, जिससे लक्ष्मण और मूर्च्छित वानर पुनः जी उठे। अंततः लक्ष्मण ने मेघनाद का वध कर राक्षस-सेना की कमर तोड़ दी।',
          'क्रमशः कुम्भकर्ण जैसे महाकाय योद्धा और रावण के अनेक पुत्र युद्ध में मारे गए। पर रावण अब भी अपने वरदानों और दस मस्तकों के बल पर अजेय-सा खड़ा था। उसके मस्तक काटे जाते तो तत्काल नए उग आते, और कोई बाण उसका अंत न कर पाता। युद्ध लंबा खिंचता देख राम ने उस शक्ति का स्मरण किया जो समस्त विजय की मूल है — आदिशक्ति भगवती दुर्गा।',
        ],
        bodyEn: [
          'Rama reached the seashore with his vast army of vanaras and bears. For three days he begged the ocean for a passage, but it would not yield. Then, in anger, Rama lifted his bow, and the terrified ocean god appeared and said he would hold firm a bridge built by the hands of Nala and Nila. The vanaras floated stones inscribed with Rama name, and a bridge a hundred yojanas long was made ready, upon which the whole army crossed into Lanka. Meanwhile Ravana righteous brother Vibhishana abandoned the path of adharma and took refuge with Rama, who granted him safety and declared him the future king of Lanka.',
          'A terrible war broke out. Day and night the battle raged between the demons and the vanaras. Ravana mighty son Indrajit, Meghanada, fought by illusion and struck Rama and Lakshmana senseless with serpent nooses and his shakti weapon. When Lakshmana fell to the shakti dart and his life hung in danger, Hanuman flew to the Himalaya for the Sanjivani herb and carried back the whole Dronagiri mountain, by which Lakshmana and the swooning vanaras rose to life again. At last Lakshmana slew Meghanada and broke the back of the demon army.',
          'One by one, giant warriors like Kumbhakarna and many of Ravana sons fell in battle. Yet Ravana still stood seemingly unconquerable on the strength of his boons and his ten heads. When his heads were cut, new ones at once sprang up, and no arrow could bring about his end. Seeing the war stretch on, Rama called to mind that Power which is the root of all victory — the primordial Shakti, Bhagavati Durga.',
        ],
      },
      {
        id: 'worship-of-aparajita',
        titleHi: 'अपराजिता शक्ति की आराधना',
        titleEn: 'The worship of Aparajita, the unconquerable Shakti',
        bodyHi: [
          'कहा जाता है कि विजय की कामना से राम ने रणभूमि के निकट देवी की आराधना का संकल्प लिया। आश्विन शुक्ल पक्ष में नौ दिनों तक उन्होंने नवदुर्गा का व्रत और पूजन किया, मन-वचन-कर्म से उस शक्ति को नमन किया जिसने सृष्टि के आदि में महिषासुर जैसे दुर्धर्ष दैत्य का संहार किया था। देवताओं की विनती पर प्रकट हुई उस महामाया ने अठारह भुजाओं में दिव्य अस्त्र धारण कर, सिंह पर सवार होकर, पूरे नौ दिन-रात के संग्राम के बाद दशमी को महिषासुर का वध किया था — इसीलिए वह ‘अपराजिता’ अर्थात् जो कभी पराजित न हो, कहलाईं।',
          'राम की निष्ठा से प्रसन्न होकर भगवती ने उन्हें विजय का आशीर्वाद दिया। दशमी के प्रभात में राम ने ‘अपराजिता’ देवी की पूजा कर, शमी वृक्ष और अपने शस्त्रों को नमन कर, युद्ध के लिए प्रस्थान किया। उनके भीतर अब केवल बाहुबल नहीं, उस आदिशक्ति का बल भी था, जिसके सम्मुख कोई अधर्म टिक नहीं सकता।',
          'यही कारण है कि शक्ति के नौ रूपों की नवरात्रि के तुरंत बाद आने वाली दशमी ‘विजयादशमी’ कहलाती है — वह तिथि जिस पर शक्ति ने महिषासुर पर और राम ने रावण पर विजय पाई। साधक इस दिन शस्त्र, वाहन, बही-खाते और विद्या के उपकरणों का पूजन करते हैं और शमी-पत्र बांटकर परस्पर विजय और मंगल की कामना करते हैं।',
        ],
        bodyEn: [
          'It is said that, longing for victory, Rama resolved to worship the Goddess near the battlefield. Through nine days of the bright fortnight of Ashvina he kept the vow and worship of the Nine Durgas, bowing in thought, word, and deed to that Power which at the dawn of creation had destroyed an indomitable demon, Mahishasura. Appearing at the prayer of the gods, that great Maya had borne divine weapons in her eighteen arms, ridden upon a lion, and after a full nine days and nights of battle had slain Mahishasura on the tenth day — and so she was called ‘Aparajita,’ the one who is never defeated.',
          'Pleased by Rama devotion, Bhagavati gave him the blessing of victory. At the dawn of the tenth day Rama worshipped the Goddess Aparajita, bowed to the shami tree and to his own weapons, and set out for war. Within him now lay not the strength of arms alone, but the strength of that primordial Shakti before whom no adharma can stand.',
          'This is why the tenth day, falling just after the Navaratri of the nine forms of Shakti, is called ‘Vijayadashami’ — the day on which Shakti triumphed over Mahishasura and Rama triumphed over Ravana. On this day seekers worship their weapons, their vehicles, their ledgers, and the tools of learning, and share shami leaves with one another, wishing each other victory and well-being.',
        ],
      },
      {
        id: 'fall-of-ravana',
        titleHi: 'रावण का अंत और धर्म की विजय',
        titleEn: 'The fall of Ravana and the triumph of dharma',
        bodyHi: [
          'विभीषण ने राम को रावण का गुप्त रहस्य बताया — रावण का जीवन उसके मस्तकों में नहीं, बल्कि उसकी नाभि में रखे अमृत-कुंड में बसता है। यह जानकर राम ने अगस्त्य मुनि के दिए ‘आदित्य हृदय’ स्तोत्र से सूर्य का स्मरण किया, धैर्य धारण किया, और ब्रह्मा के दिए दिव्य अस्त्र को अभिमंत्रित कर अपने धनुष पर चढ़ाया।',
          'वह तेजोमय बाण आकाश को चीरता हुआ रावण की नाभि में जा लगा और वहां छिपे अमृत को सोख गया। दशानन रावण, जिसके बल से देवता तक कांपते थे, मस्तकों समेत धराशायी हो गया। उसके गिरते ही लंका में हाहाकार और स्वर्ग में देव-दुंदुभियों का घोष एक साथ गूंज उठा; देवताओं ने राम पर पुष्प-वर्षा की। आश्विन शुक्ल दशमी का वह दिन अधर्म पर धर्म, अहंकार पर विनय और अंधकार पर प्रकाश की विजय का दिन बन गया।',
          'राम ने सीता को मुक्त कराया, विभीषण को लंका के सिंहासन पर बैठाया, और चौदह वर्ष का वनवास पूर्ण होने पर पुष्पक विमान से अयोध्या लौटे, जहां दीपों से उनका स्वागत हुआ। तभी से प्रति वर्ष विजयादशमी को रावण, कुम्भकर्ण और मेघनाद के विशाल पुतले जलाकर यह स्मरण किया जाता है कि अहंकार और अधर्म कितने भी प्रबल क्यों न हों, सत्य और धर्म के सम्मुख उन्हें अंततः भस्म होना ही है। जो श्रद्धालु इस पर्व पर शक्ति और श्रीराम का पूजन कर अपने भीतर के दस दोषों — काम, क्रोध, लोभ, मोह, मद, मात्सर्य आदि — को त्यागने का संकल्प लेते हैं, उनके जीवन में विजय, यश और मंगल की वर्षा होती है।',
        ],
        bodyEn: [
          'Vibhishana told Rama the secret of Ravana — that his life lay not in his heads but in a pool of nectar held within his navel. Knowing this, Rama remembered the Sun through the ‘Aditya Hridaya’ hymn given by the sage Agastya, steadied his heart, and laid upon his bow a divine weapon given by Brahma, consecrated with mantras.',
          'That radiant arrow tore through the sky, struck Ravana navel, and drank away the nectar hidden there. The ten-headed Ravana, at whose strength even the gods had trembled, fell to the ground with all his heads. As he fell, a cry of grief rose through Lanka and the drums of the gods sounded in heaven at once; the devas rained flowers upon Rama. That day of the tenth of the bright fortnight of Ashvina became the day of dharma triumph over adharma, of humility over arrogance, and of light over darkness.',
          'Rama set Sita free, placed Vibhishana upon the throne of Lanka, and, his fourteen years of exile complete, returned to Ayodhya upon the Pushpaka chariot, where he was welcomed with rows of lamps. From that time, every year on Vijayadashami, great effigies of Ravana, Kumbhakarna, and Meghanada are burned, recalling that however mighty arrogance and adharma may grow, before truth and dharma they must in the end be reduced to ash. Those devotees who, on this festival, worship Shakti and Shri Rama and resolve to cast off the ten faults within — desire, anger, greed, delusion, pride, envy, and the rest — find victory, honour, and well-being rain down upon their lives.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'bhai-dooj-katha',
    titleHi: 'भाई दूज कथा',
    titleEn: 'Bhai Dooj Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/vrat-katha.html'],
    sections: [
      {
        id: 'surya-children',
        titleHi: 'सूर्य की संतान — यम और यमी',
        titleEn: 'The children of Surya — Yama and Yami',
        bodyHi: [
          'बहुत पुराने युग की बात है। सूर्यदेव और उनकी पत्नी संज्ञा के दो संतानें थीं — एक पुत्र यम और एक पुत्री यमुना, जिन्हें यमी भी कहा जाता था। दोनों जुड़वाँ भाई-बहन एक साथ बड़े हुए थे और उनके बीच का स्नेह असीम था। यमुना अपने भाई से अत्यंत प्रेम करती थी, और जब भी वह उसे देखती, उसका मुख प्रसन्नता से खिल उठता।',
          'समय बीतता गया और दोनों का जीवन अलग-अलग दिशाओं में मुड़ गया। यम पर सृष्टि का एक गुरुतर भार आ पड़ा — उन्हें मृत्यु के देवता, यमराज के पद पर बैठाया गया, और प्राणियों के कर्मों के अनुसार न्याय करना उनका कर्तव्य बन गया। यमुना धरती पर एक पवित्र नदी के रूप में प्रवाहित हुई, जिसके तट पर असंख्य लोग शांति पाने आते थे।',
          'अपने कठोर कर्तव्य में डूबे यमराज को बहन से मिलने का अवसर ही न मिलता। दिन, मास और वर्ष बीतते गए, पर वे यमुना के पास नहीं जा पाए। उधर यमुना अपने भाई की प्रतीक्षा में व्याकुल रहती। बार-बार वह संदेश भेजती — ‘भैया, एक बार मेरे घर पधारो, मैं तुम्हें भोजन कराना चाहती हूँ।’ किंतु यमराज का आसन उन्हें कहीं जाने न देता।',
        ],
        bodyEn: [
          'In an age long past, the Sun-god Surya and his wife Sanjna had two children — a son named Yama and a daughter named Yamuna, who was also called Yami. The twins grew up side by side, and the affection between them knew no bounds. Yamuna loved her brother dearly, and whenever she set eyes upon him her face would bloom with joy.',
          'As the years passed, the lives of the two turned in different directions. A grave burden of creation fell upon Yama — he was seated upon the throne of Yamaraja, the lord of death, and it became his duty to render judgement over beings according to their deeds. Yamuna flowed upon the earth as a sacred river, to whose banks countless people came in search of peace.',
          'Immersed in his stern duty, Yamaraja could find no occasion to visit his sister. Days, months and years rolled by, yet he was never able to go to Yamuna. She, for her part, remained restless in waiting for her brother. Again and again she sent word — ‘Dear brother, come to my home just once; I long to feed you with my own hands.’ But Yamaraja’s seat of office would not let him leave.',
        ],
      },
      {
        id: 'longing-invitation',
        titleHi: 'बहन का बुलावा और भाई का आना',
        titleEn: 'A sister\'s call and a brother\'s coming',
        bodyHi: [
          'कार्तिक मास के शुक्ल पक्ष की द्वितीया तिथि आई। उस दिन यमुना का हृदय फिर भाई की याद से भर उठा। उसने एक बार और स्नेहभरा निमंत्रण भेजा — ‘भैया, इतने बरस बीत गए, तुमने मेरे घर पैर तक नहीं रखा। आज तो अवश्य आओ, मेरी इस विनती को ठुकराना मत।’ इस बार बहन के प्रेम ने यमराज के मन को छू लिया।',
          'यमराज ने सोचा कि वे तो स्वयं मृत्यु के स्वामी हैं, जिनसे सारा संसार भयभीत रहता है; पर उनकी अपनी बहन उन्हें इतने प्रेम से बुला रही है। उन्होंने अपने दूतों और गणों को विदा किया और यमुना के घर की ओर चल पड़े। मार्ग में जो भी प्राणी बंधन और दण्ड में पड़े थे, उस शुभ अवसर पर यमराज ने उन्हें मुक्त कर दिया, और चारों ओर हर्ष की लहर दौड़ गई।',
          'जब यमुना ने सुना कि उसका भाई सचमुच चला आ रहा है, तो उसकी प्रसन्नता का कोई पार न रहा। उसने अपना घर सजाया, द्वार पर बंदनवार बाँधे, और भाँति-भाँति के पकवान बनाने में जुट गई। उसका मन यही गा रहा था कि आज वर्षों की प्रतीक्षा का फल मिलने वाला है।',
        ],
        bodyEn: [
          'On Dwitiya in the bright fortnight of the month of Kartika, Yamuna’s heart once more filled with longing for her brother. She sent one more loving invitation — ‘Brother, so many years have gone by, and you have not so much as set foot in my home. Today you must surely come; do not turn away this plea of mine.’ This time a sister’s love touched the heart of Yamaraja.',
          'Yamaraja reflected that he was himself the master of death, whom the whole world dreaded; and yet his own sister was calling him with such tenderness. He dismissed his messengers and attendants and set out toward Yamuna’s home. Along the way, on that auspicious occasion, he released the beings who lay bound in fetters and punishment, and a wave of gladness ran through all directions.',
          'When Yamuna heard that her brother was truly on his way, there was no limit to her delight. She adorned her house, hung festive garlands at the door, and busied herself preparing dishes of every kind. Her heart kept singing that the fruit of years of waiting was about to be hers at last.',
        ],
      },
      {
        id: 'welcome-and-feast',
        titleHi: 'तिलक, आरती और प्रेम का भोज',
        titleEn: 'The tilak, the aarti, and the feast of love',
        bodyHi: [
          'जैसे ही यमराज द्वार पर पहुँचे, यमुना दौड़ती हुई आगे आई और भाई का अभिनंदन किया। उसने प्रेमपूर्वक उनके चरण धुलाए, उन्हें ऊँचे आसन पर बैठाया, और हाथ में आरती की थाली लेकर उनकी आरती उतारी। फिर उसने चंदन और रोली से अपने भाई के मस्तक पर मंगल-तिलक लगाया और उनकी दीर्घायु तथा कल्याण की कामना की।',
          'इसके बाद यमुना ने अपने हाथों से बनाए छप्पन प्रकार के व्यंजन भाई के सामने परोसे। मिठाइयाँ, फल और स्वादिष्ट पकवान देखकर यमराज का हृदय गद्गद हो उठा। बहन के इस निश्छल प्रेम और सत्कार से वे इतने प्रसन्न हुए कि उन्हें ऐसा अनुभव हुआ मानो उन्होंने आज तक ऐसा स्नेह कभी न पाया हो।',
          'भोजन के बाद संतुष्ट होकर यमराज ने यमुना से कहा — ‘बहन, तुम्हारे इस प्रेम ने मुझे विभोर कर दिया है। तुम जो चाहो, वर माँग लो।’ यमुना ने हाथ जोड़कर विनम्रता से उत्तर दिया कि उसे धन या वैभव नहीं चाहिए; उसकी तो बस एक ही अभिलाषा है।',
        ],
        bodyEn: [
          'The moment Yamaraja reached the doorway, Yamuna came running forward to welcome her brother. With love she washed his feet, seated him upon a high seat, and taking a tray of lamps in her hands she performed his aarti. Then with sandal paste and vermilion she applied an auspicious tilak upon her brother’s forehead, praying for his long life and wellbeing.',
          'After this, Yamuna served before her brother fifty-six kinds of delicacies prepared with her own hands. Seeing the sweets, the fruits and the savoury dishes, Yamaraja’s heart overflowed with feeling. He was so pleased by this guileless love and hospitality of his sister that it seemed to him as though never until that day had he received such affection.',
          'When the meal was over and he was content, Yamaraja said to Yamuna — ‘Sister, this love of yours has overwhelmed me. Ask of me whatever you wish, and take it as a boon.’ Folding her hands, Yamuna answered humbly that she did not desire wealth or splendour; she had only a single wish.',
        ],
      },
      {
        id: 'yamas-boon',
        titleHi: 'यमराज का वरदान',
        titleEn: 'The boon of Yamaraja',
        bodyHi: [
          'यमुना ने कहा — ‘भैया, मेरी कामना केवल इतनी है कि आप प्रति वर्ष इसी कार्तिक शुक्ल द्वितीया के दिन मेरे घर भोजन करने आते रहें। और जो कोई बहन आज के दिन अपने भाई का इसी प्रकार आदर-सत्कार करे, उसके भाई को आपका भय कभी न सताए।’ बहन की यह निःस्वार्थ प्रार्थना सुनकर यमराज और भी प्रसन्न हो गए।',
          'यमराज ने ‘तथास्तु’ कहकर वर दिया — ‘ऐसा ही हो, बहन। आज से जो भाई इस द्वितीया के दिन अपनी बहन के घर जाकर उसके हाथ का तिलक ग्रहण करेगा, उसका सत्कार पाएगा, और इस दिन यमुना के पवित्र जल में स्नान करेगा, उसे अकाल मृत्यु का भय नहीं रहेगा। मेरे दण्ड और यातना से वह सदा सुरक्षित रहेगा।’',
          'यह कहकर यमराज ने बहन को बहुमूल्य वस्त्र और आभूषण भेंट किए और हर्षित होकर अपने धाम लौट गए। यमुना भी भाई के स्नेह और इस अनुपम वरदान को पाकर धन्य हो गई। उसी दिन से यह तिथि भाई-बहन के अटूट प्रेम का पर्व बन गई।',
        ],
        bodyEn: [
          'Yamuna said — ‘Brother, my only wish is this: that every year on this very second day of the bright fortnight of Kartika you keep coming to dine at my home. And whichever sister honours and serves her brother in this same way on this day, may her brother never be troubled by fear of you.’ Hearing this selfless prayer of his sister, Yamaraja was pleased all the more.',
          'Saying ‘So be it,’ Yamaraja granted the boon — ‘Let it be thus, sister. From this day, any brother who on this second lunar day goes to his sister’s home and receives the tilak from her hand, who accepts her welcome, and who on this day bathes in the sacred waters of the Yamuna, shall have no fear of untimely death. He shall forever be safe from my rod of punishment and my torments.’',
          'Having spoken thus, Yamaraja presented his sister with precious garments and ornaments, and returned joyfully to his own abode. Yamuna too was blessed, having received her brother’s affection and this matchless boon. From that very day this lunar date became a festival of the unbreakable love between brother and sister.',
        ],
      },
      {
        id: 'yama-dwitiya-observance',
        titleHi: 'यम द्वितीया का पर्व आज भी',
        titleEn: 'The festival of Yama Dwitiya, even today',
        bodyHi: [
          'तभी से कार्तिक शुक्ल द्वितीया ‘यम द्वितीया’ अथवा ‘भाई दूज’ के नाम से मनाई जाने लगी। इस दिन बहनें अपने भाइयों को घर बुलाती हैं, उन्हें आसन पर बैठाकर माथे पर तिलक लगाती हैं, आरती उतारती हैं और मनपसंद भोजन कराती हैं; और भाई बदले में बहन को स्नेहपूर्वक भेंट देते हैं तथा उसकी रक्षा का संकल्प दोहराते हैं।',
          'कहते हैं कि जो भाई इस दिन अपनी बहन के यहाँ जाकर उसका सत्कार ग्रहण करता है और यमुना में स्नान करता है, उसे यमराज के उसी वरदान के अनुसार अकाल मृत्यु का भय नहीं रहता, और उसका जीवन यम के अनुग्रह से सुरक्षित रहता है। यमुना और यम के उसी मिलन की स्मृति प्रत्येक भाई-बहन के स्नेह में आज भी जीवित है, और यही इस पावन पर्व का सच्चा वरदान है।',
        ],
        bodyEn: [
          'From then on, Dwitiya in the bright fortnight of Kartika came to be celebrated under the names ‘Yama Dwitiya’ and ‘Bhai Dooj.’ On this day sisters invite their brothers home, seat them upon a place of honour, apply the tilak upon their foreheads, perform their aarti and feed them their favourite dishes; and the brothers, in return, lovingly give gifts to their sisters and renew their vow to protect them.',
          'It is said that the brother who on this day goes to his sister, accepts her hospitality and bathes in the Yamuna is freed, by that very boon of Yamaraja, from the fear of untimely death, and his life remains guarded by the grace of Yama. The memory of that meeting of Yamuna and Yama lives on even today in the affection of every brother and sister, and this is the true blessing of this sacred festival.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'vijaya-ekadashi-katha',
    titleHi: 'विजया एकादशी व्रत कथा',
    titleEn: 'Vijaya Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/vijaya-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'samudra-tat-par-ruki-sena',
        titleHi: 'समुद्र तट पर रुकी वानर सेना',
        titleEn: 'The Vanara Army Halts at the Ocean\'s Edge',
        bodyHi: [
          'दक्षिण दिशा की ओर बढ़ती हुई श्रीराम की विशाल वानर सेना अंततः महासागर के तट पर आ पहुँची। सामने अनंत जलराशि गरजती हुई फैली थी, और उसके पार लंका की सोने की प्राचीरें धुंधली-सी झलक रही थीं। सीता को रावण की कैद से छुड़ाने का संकल्प हृदय में लिए श्रीराम उस फेनिल लहरों के विस्तार को देखते रह गए।',
          'लक्ष्मण, सुग्रीव, हनुमान और अंगद सहित समस्त वानर वीर तट पर एकत्र हो गए, किंतु इस अथाह समुद्र को लाँघने का कोई उपाय किसी को न सूझा। न कोई नौका थी, न सेतु, और भीतर ही भीतर सब के मन में चिंता की रेखाएँ गहराने लगीं।',
          'श्रीराम ने व्याकुल होकर अपने भाई लक्ष्मण से कहा, ‘हे सौमित्र, यह सागर अगाध और भयंकर है। इसे पार किए बिना न लंका तक पहुँचा जा सकता है, न ही धर्म की रक्षा हो सकती है। कोई ऐसा मार्ग बताओ जिससे यह सेना सकुशल उस पार उतर सके।’',
        ],
        bodyEn: [
          'Marching southward, the vast vanara army of Shri Rama at last reached the shore of the great ocean. Before them an endless expanse of water roared and stretched away, and far across it the golden ramparts of Lanka shimmered faintly. With the resolve to free Sita from Ravana\'s captivity held firm in his heart, Shri Rama stood gazing upon that foaming sweep of waves.',
          'Lakshmana, Sugriva, Hanuman, Angada, and all the vanara heroes gathered upon the shore, yet none could think of a way to cross this fathomless sea. There was no boat, no bridge, and within every heart the lines of anxiety began to deepen.',
          'Troubled, Shri Rama said to his brother Lakshmana, ‘O son of Sumitra, this ocean is unfathomable and terrible. Without crossing it we can neither reach Lanka nor uphold dharma. Tell me of some path by which this army may step safely to the farther shore.’',
        ],
      },
      {
        id: 'vakadalbhya-rishi-ka-aashram',
        titleHi: 'वकदाल्भ्य ऋषि का आश्रम',
        titleEn: 'The Hermitage of Sage Vakadalbhya',
        bodyHi: [
          'लक्ष्मण ने श्रद्धा से सिर झुकाकर कहा, ‘हे प्रभु, आप तो स्वयं समस्त देवताओं के भी आराध्य हैं, फिर भी मर्यादा का पालन करते हुए आप मार्ग पूछते हैं। यहाँ से थोड़ी ही दूरी पर महातपस्वी वकदाल्भ्य ऋषि का आश्रम है। वे त्रिकालदर्शी हैं और निश्चय ही इस संकट का उपाय जानते होंगे। उनके पास चलकर हम इस समस्या का समाधान पूछें।’',
          'श्रीराम को यह परामर्श उचित लगा। वे अपने अनुजों के साथ उस पावन आश्रम की ओर चल पड़े, जहाँ ऋषि वकदाल्भ्य अपनी कुटिया में तपस्या में लीन बैठे थे। उनके मुखमंडल पर तप का तेज और नेत्रों में करुणा का सागर झलक रहा था।',
          'मर्यादा पुरुषोत्तम श्रीराम ने ऋषि के चरणों में प्रणाम किया और हाथ जोड़कर अपनी विवशता कह सुनाई, ‘हे मुनिश्रेष्ठ, सीताहरण करने वाले रावण को दंड देने हेतु मैं अपनी सेना सहित यहाँ आया हूँ, परंतु यह विशाल सागर हमारा मार्ग रोके खड़ा है। कृपा करके कोई ऐसा उपाय बताइए जिससे हमारी विजय सुनिश्चित हो।’',
        ],
        bodyEn: [
          'Bowing his head in reverence, Lakshmana said, ‘O Lord, you are yourself the one worshipped even by all the gods, and yet, upholding propriety, you ask for the way. Not far from here lies the hermitage of the great ascetic sage Vakadalbhya. He sees across the three times, and surely he knows the remedy for this distress. Let us go to him and ask the solution to this difficulty.’',
          'The counsel seemed fitting to Shri Rama. Together with his younger brothers he set out toward that holy hermitage, where the sage Vakadalbhya sat absorbed in penance within his hut. Upon his face glowed the radiance of austerity, and in his eyes shone an ocean of compassion.',
          'Shri Rama, the most virtuous of men, bowed at the sage\'s feet and, with folded hands, told him of his helplessness: ‘O best of sages, I have come here with my army to punish Ravana, who abducted Sita, but this vast ocean stands blocking our path. Be gracious and tell me of some means by which our victory may be assured.’',
        ],
      },
      {
        id: 'vijaya-ekadashi-vrat-ka-vidhan',
        titleHi: 'विजया एकादशी व्रत का विधान',
        titleEn: 'The Ordinance of the Vijaya Ekadashi Vow',
        bodyHi: [
          'वकदाल्भ्य ऋषि ने प्रसन्न होकर कहा, ‘हे रघुकुलनंदन, यद्यपि आप स्वयं साक्षात नारायण हैं, तथापि लोक के हित और मर्यादा की रक्षा हेतु आपने यह प्रश्न किया है। सुनिए—फाल्गुन मास के कृष्ण पक्ष की एकादशी ‘विजया’ नाम से विख्यात है। जो इस व्रत को पूर्ण श्रद्धा से करता है, उसे संग्राम में निश्चित विजय प्राप्त होती है, चाहे शत्रु कितना ही दुर्जेय क्यों न हो।’',
          'तत्पश्चात ऋषि ने व्रत की विधि बताई, ‘दशमी के दिन शुद्ध जल से भरे कलश की स्थापना करें, उस पर भगवान नारायण की स्वर्ण प्रतिमा विराजित करें। एकादशी को उपवास रखकर धूप, दीप, चंदन, पुष्प और नैवेद्य से विधिवत पूजन करें, और रात्रि भर जागरण करते हुए हरि का नाम स्मरण करें। द्वादशी को विधिपूर्वक पारण करके ही व्रत का समापन हो।’',
          'श्रीराम ने सिर झुकाकर ऋषि के वचन हृदय में धारण कर लिए। उन्होंने अपने समस्त सेनापतियों और वानर वीरों के साथ मिलकर इस पवित्र व्रत के पालन का संकल्प लिया, ताकि सागर लाँघने और रावण पर विजय का मार्ग प्रशस्त हो।',
        ],
        bodyEn: [
          'Well pleased, the sage Vakadalbhya said, ‘O delight of the Raghu line, though you are yourself Narayana made manifest, still, for the welfare of the world and the upholding of propriety you have asked this question. Listen—the eleventh day of the dark fortnight of the month of Phalguna is renowned by the name ‘Vijaya.’ Whoever observes this vow with full faith obtains certain victory in battle, however invincible the enemy may be.’',
          'Then the sage described the manner of the vow: ‘On the tenth day install a pot filled with pure water, and upon it seat a golden image of Lord Narayana. Keeping the fast on the eleventh day, worship him duly with incense, lamps, sandal paste, flowers, and offerings of food, and through the whole night keep vigil, remembering the name of Hari. Only after breaking the fast properly on the twelfth day should the vow be concluded.’',
          'Shri Rama bowed his head and held the sage\'s words within his heart. Together with all his commanders and vanara heroes he took the resolve to observe this holy vow, so that the way might open for crossing the ocean and gaining victory over Ravana.',
        ],
      },
      {
        id: 'sena-ka-sagar-paar-aur-vijay',
        titleHi: 'सेना का सागर पार और विजय',
        titleEn: 'The Army Crosses the Sea and Wins Victory',
        bodyHi: [
          'ऋषि के निर्देशानुसार श्रीराम ने अपनी समस्त सेना के साथ फाल्गुन कृष्ण एकादशी का व्रत पूर्ण निष्ठा से किया। दशमी को कलश-स्थापन और प्रतिमा-पूजन हुआ, एकादशी को सब ने उपवास रखकर दिन-रात नारायण का स्मरण किया, और द्वादशी को विधिपूर्वक पारण किया गया। सम्पूर्ण शिविर भक्ति और संकल्प की पवित्र ऊर्जा से भर उठा।',
          'व्रत के प्रभाव से वरुणदेव प्रसन्न हुए और मार्ग सुगम हो गया। नल और नील जैसे शिल्पी वानरों ने पाषाणों का सेतु रचना आरंभ किया, और जो शिलाएँ जल में डूब जातीं, वे श्रीराम के नाम के बल से तैरने लगीं। देखते ही देखते सागर पर एक अद्भुत सेतु बन गया, जिस पर चढ़कर असंख्य वानर वीर हर्षनाद करते हुए लंका की ओर बढ़ चले।',
          'उस पार पहुँचकर श्रीराम की सेना ने रावण की अजेय मानी जाने वाली शक्ति को परास्त कर दिया। धर्म की पताका फहराई, सीता मुक्त हुईं, और अधर्म का अंत हुआ।',
          'तब से ‘विजया’ एकादशी इसी सत्य की साक्षी बनी हुई है—जो मनुष्य श्रद्धा और संयम से इस व्रत का पालन करता है, उसके जीवन के समस्त संग्राम, चाहे वे बाहरी शत्रुओं के हों या भीतर के विकारों के, विजय में बदल जाते हैं; उसके पाप नष्ट होते हैं और अंत में वह वैकुंठ धाम को प्राप्त करता है।',
        ],
        bodyEn: [
          'Following the sage\'s instructions, Shri Rama, together with his entire army, observed the Vijaya Ekadashi of the dark fortnight of Phalguna with complete devotion. On the tenth day the pot was installed and the image worshipped; on the eleventh all kept the fast and remembered Narayana through day and night; and on the twelfth the fast was broken according to rule. The whole encampment was filled with the holy energy of devotion and resolve.',
          'By the power of the vow, the ocean-lord Varuna was pleased and the path was made easy. The artisan vanaras Nala and Nila began to raise a bridge of stones, and the rocks that would have sunk in the water floated by the strength of Shri Rama\'s name. Before their very eyes a wondrous bridge spanned the sea, and upon it countless vanara heroes pressed forward toward Lanka with shouts of joy.',
          'Reaching the farther shore, the army of Shri Rama overcame the power of Ravana that had been thought invincible. The banner of dharma was raised high, Sita was set free, and unrighteousness met its end.',
          'Ever since, the Vijaya Ekadashi has stood as a witness to this very truth—whoever observes this vow with faith and self-restraint finds that all the battles of life, whether against outer foes or the disorders within, are turned into victory; the sins are destroyed, and in the end the abode of Vaikuntha is attained.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'shattila-ekadashi-katha',
    titleHi: 'षटतिला एकादशी व्रत कथा',
    titleEn: 'Shattila Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/shattila-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'dalbhya-ka-prashna',
        titleHi: 'दाल्भ्य ऋषि की जिज्ञासा',
        titleEn: 'The Sage Dalbhya\'s Question',
        bodyHi: [
          'नैमिषारण्य के निर्जन तपोवन में महर्षि पुलस्त्य अपने कुश के आसन पर विराजमान थे, और उनके सम्मुख हाथ जोड़े दाल्भ्य ऋषि बैठे हुए थे। संध्या की स्वर्णिम किरणें वृक्षों के बीच से छन-छनकर भूमि पर उतर रही थीं, और चारों ओर एक पवित्र मौन छाया हुआ था।',
          'दाल्भ्य ने विनम्र स्वर में पूछा, ‘हे भगवन्, इस मृत्युलोक में जीव अनेक पाप करता है—कोई अनजाने में, कोई लोभवश। फिर भी ऐसा कौन-सा सरल व्रत है, जिसके आचरण मात्र से मनुष्य के समस्त पाप धुल जाएँ और वह वैकुंठ का अधिकारी बने?’',
          'पुलस्त्य मुनि मुस्कुराए और बोले, ‘हे साधो, माघ मास के कृष्ण पक्ष में आने वाली एकादशी ‘षटतिला एकादशी’ कहलाती है। यह व्रत भगवान विष्णु को अत्यंत प्रिय है और दरिद्रता तथा पाप—दोनों का नाश करता है। इसी से जुड़ी एक प्राचीन कथा है, जिसे ध्यान से सुनो।’',
        ],
        bodyEn: [
          'In the secluded penance-grove of Naimisharanya, the great sage Pulastya was seated upon his mat of kusha grass, and before him, with folded hands, sat the sage Dalbhya. The golden rays of evening filtered down through the trees onto the earth, and all around lay a sacred stillness.',
          'In a humble voice Dalbhya asked, ‘O revered one, in this mortal world a soul commits many sins—some unknowingly, some out of greed. Even so, which is that simple vow by whose mere observance all of a person’s sins are washed away, and he becomes worthy of Vaikuntha?’',
          'The sage Pulastya smiled and said, ‘O virtuous one, the Ekadashi that falls in the dark fortnight of the month of Magha is called Shattila Ekadashi. This vow is exceedingly dear to Lord Vishnu, and it destroys both poverty and sin. There is an ancient tale connected with it; listen with attention.’',
        ],
      },
      {
        id: 'kanjus-brahmani',
        titleHi: 'धर्मनिष्ठ किंतु कृपण ब्राह्मणी',
        titleEn: 'The Pious but Miserly Brahmin Woman',
        bodyHi: [
          'किसी समय पृथ्वी पर एक ब्राह्मणी रहती थी, जो भगवान विष्णु की परम भक्त थी। वह नित्य प्रातः स्नान करती, व्रत-उपवास का कठोर पालन करती और घंटों तक हरि का ध्यान करती रहती। उसकी पूजा में न कोई त्रुटि थी, न उसके तप में कोई कमी।',
          'किंतु उस भक्ति-भरे हृदय में एक गहरा दोष छिपा था—वह अत्यंत कृपण थी। उसका धन-धान्य भरपूर था, उसके भंडार अन्न से भरे रहते थे, पर वह किसी भूखे को एक मुट्ठी अन्न तक न देती थी। द्वार पर आए याचक को वह रूखे शब्दों से लौटा देती।',
          'उसने अपनी देह तो उपवासों से तपा डाली, पर अन्न-दान का पुण्य उसने कभी अर्जित न किया। न ब्राह्मण भोजन कराती, न दीन-दुखियों पर दया करती; उसके हाथ से कभी कोई दान निकला ही नहीं।',
          'उसकी इस अद्भुत स्थिति को देखकर भगवान विष्णु ने सोचा—‘इस स्त्री ने उपवास और भक्ति से अपना शरीर तो मेरे योग्य बना लिया है, किंतु बिना दान के इसका लोक सूना ही रहेगा। मुझे स्वयं इसे यह रहस्य समझाना होगा।’',
        ],
        bodyEn: [
          'Once upon a time there lived on earth a Brahmin woman who was a supreme devotee of Lord Vishnu. Each morning she bathed, kept her fasts and vows with great severity, and meditated upon Hari for hours together. There was no flaw in her worship, nor any want in her penance.',
          'Yet within that devotion-filled heart lay one deep fault—she was exceedingly miserly. Her wealth and grain were abundant, her storerooms brimmed with food, yet she would not give so much as a single handful of grain to one who was hungry. The beggar who came to her door she turned away with harsh words.',
          'She had scorched her body with fasts, but the merit of giving food she had never earned. She fed no Brahmins, showed no mercy to the poor and suffering; from her hand no charity had ever passed.',
          'Seeing her strange condition, Lord Vishnu reflected, ‘This woman has made her body fit for me through fasting and devotion, but without charity her world will remain empty. I must myself make her understand this secret.’',
        ],
      },
      {
        id: 'vishnu-bhikshuk-veshe',
        titleHi: 'भिक्षुक रूप में श्रीहरि की परीक्षा',
        titleEn: 'Shri Hari\'s Test in the Guise of a Mendicant',
        bodyHi: [
          'एक दिन भगवान विष्णु ने एक दुर्बल, चीवरधारी भिक्षुक का रूप धारण किया। हाथ में भिक्षापात्र लिए, क्षीण स्वर में याचना करते हुए वे उस ब्राह्मणी के द्वार पर जा खड़े हुए और बोले, ‘हे देवि, इस भूखे साधु को कुछ भिक्षा दे दो।’',
          'ब्राह्मणी ने उस तेजस्वी भिक्षुक को बार-बार देखा। उसके भीतर का लोभ जागा, पर अतिथि को खाली हाथ लौटाना भी उसे उचित न लगा। बहुत सोच-विचार के बाद उसने अन्न के स्थान पर एक मिट्टी का ढेला उठाकर भिक्षापात्र में डाल दिया।',
          'भिक्षुक मंद-मंद मुस्कुराए और बिना एक शब्द कहे वहाँ से लौट गए, मानो वे जानते हों कि इस मिट्टी के पीछे कौन-सा भविष्य छिपा है। ब्राह्मणी ने समझा कि उसने चतुराई से अतिथि को टाल दिया।',
          'समय बीतता गया। वृद्धावस्था आई और एक दिन उस ब्राह्मणी का देहांत हो गया। आजीवन की उग्र भक्ति और कठोर व्रतों के बल पर उसे वैकुंठ धाम में स्थान तो मिल गया, और देवदूत उसे श्रीहरि के लोक में ले गए।',
        ],
        bodyEn: [
          'One day Lord Vishnu assumed the form of a frail, robe-clad mendicant. Holding a begging bowl in his hand and pleading in a faint voice, he came and stood at the Brahmin woman’s door and said, ‘O lady, give some alms to this hungry ascetic.’',
          'The Brahmin woman gazed again and again at that radiant mendicant. The greed within her stirred, yet to send a guest away empty-handed did not seem proper to her either. After much deliberation, in place of food she picked up a lump of clay and dropped it into the begging bowl.',
          'The mendicant smiled gently and, without speaking a word, turned and departed, as though he knew what future lay hidden behind that clay. The Brahmin woman supposed that she had cleverly put off her guest.',
          'Time passed on. Old age came, and one day the Brahmin woman departed from her body. On the strength of her lifelong fierce devotion and severe vows she was indeed granted a place in the abode of Vaikuntha, and the messengers of the gods carried her to the world of Shri Hari.',
        ],
      },
      {
        id: 'suni-kutiya-ka-rahasya',
        titleHi: 'सूनी कुटिया का रहस्य',
        titleEn: 'The Mystery of the Empty Hut',
        bodyHi: [
          'वैकुंठ में पहुँचकर ब्राह्मणी को एक सुंदर कुटिया प्रदान की गई, पर जब उसने भीतर पाँव रखा तो स्तब्ध रह गई। वह कुटी बिल्कुल खाली थी—न वहाँ अन्न था, न जल, न कोई संपत्ति; केवल चार दीवारें उसके सूनेपन का उपहास कर रही थीं।',
          'व्याकुल होकर वह भगवान विष्णु के समक्ष गई और बोली, ‘हे प्रभो, मैंने जीवन भर आपका व्रत किया, आपकी भक्ति की; फिर मेरा यह दिव्य धाम इतना रिक्त क्यों है? मेरे पुण्य का फल कहाँ गया?’',
          'श्रीहरि स्नेहपूर्वक बोले, ‘हे देवि, तुम्हारी भक्ति में लेशमात्र भी संदेह नहीं, किंतु तुमने अपने जीवन में कभी अन्न-दान नहीं किया। जो हाथ कभी देता नहीं, उसका भंडार परलोक में भी भरा नहीं रहता। तुमने तो याचक बनकर आए मुझको भी मिट्टी का ढेला ही दिया था।’',
          '‘अब इसका एक उपाय है,’ भगवान बोले। ‘जब देवांगनाएँ तुमसे मिलने आएँ, तो उन्हें भीतर न आने देना जब तक वे षटतिला एकादशी के व्रत और उसकी विधि का रहस्य तुम्हें न बता दें। उसी व्रत से तुम्हारा यह सूना धाम सब वैभव से भर उठेगा।’',
        ],
        bodyEn: [
          'On reaching Vaikuntha the Brahmin woman was given a beautiful hut, but when she set foot inside she was struck dumb. The dwelling was utterly empty—there was no food there, no water, no possession of any kind; only four bare walls mocked its desolation.',
          'Distressed, she went before Lord Vishnu and said, ‘O Lord, all my life I kept your vow and adored you in devotion; then why is this celestial abode of mine so empty? Where has the fruit of my merit gone?’',
          'Shri Hari spoke with affection, ‘O lady, of your devotion there is not the slightest doubt, yet never in your life did you give the gift of food. The hand that never gives finds its storehouse unfilled even in the world beyond. When I came to you as a beggar, even to me you gave only a lump of clay.’',
          '‘Now there is one remedy for this,’ the Lord said. ‘When the celestial maidens come to meet you, do not let them enter until they have revealed to you the vow of Shattila Ekadashi and the manner of its observance. By that very vow this empty abode of yours shall fill with every splendour.’',
        ],
      },
      {
        id: 'chhah-prakar-ke-til',
        titleHi: 'छह प्रकार के तिल और भरा हुआ धाम',
        titleEn: 'The Six Uses of Sesame and the Abode Made Full',
        bodyHi: [
          'कुछ समय पश्चात देवलोक की अप्सराएँ उस ब्राह्मणी के द्वार पर आईं। उसने भगवान के वचन स्मरण कर द्वार रोक लिया और बोली, ‘जब तक तुम मुझे षटतिला एकादशी के व्रत की पूरी विधि न बताओगी, मैं तुम्हें भीतर न आने दूँगी।’ तब देवांगनाओं में से एक ने वह पवित्र रहस्य खोला।',
          '‘हे ब्राह्मणी,’ वह बोली, ‘माघ कृष्ण एकादशी को व्रत रखकर भगवान विष्णु का पूजन करो और तिल का छह प्रकार से उपयोग करो—तिल के जल से स्नान करो, तिल का उबटन लगाओ, तिल मिले जल से तर्पण करो, तिल की आहुति से हवन करो, तिल का भोजन ग्रहण करो, और तिल का दान करो। इसी कारण इस एकादशी का नाम ‘षटतिला’ है।’',
          'ब्राह्मणी ने पूर्ण श्रद्धा से वैसा ही किया। उसने तिल और अन्न से भरे पात्र ब्राह्मणों तथा याचकों को दान किए, और जो कृपणता उसके हृदय में जीवन भर बैठी थी, वह व्रत के पुण्य-जल में बह गई। दान करते-करते उसका मन निर्मल और उदार हो उठा।',
          'षटतिला एकादशी के प्रभाव से उसका सूना वैकुंठ-धाम धन, धान्य, रत्न और दिव्य भोगों से परिपूर्ण हो गया; जो कुटी कभी रिक्त थी, वह अब सौभाग्य से जगमगा उठी। इसी कारण कहा जाता है कि जो मनुष्य श्रद्धा से तिल का दान कर इस व्रत को करता है, उसकी दरिद्रता और पाप दोनों मिट जाते हैं, और अंत में उसे विष्णु का अक्षय धाम प्राप्त होता है।',
        ],
        bodyEn: [
          'Some time afterward the apsaras of the heavenly world came to the Brahmin woman’s door. Remembering the Lord’s words, she barred the way and said, ‘Until you tell me the entire method of the Shattila Ekadashi vow, I shall not let you enter.’ Then one of the celestial maidens unfolded that sacred secret.',
          '‘O Brahmin woman,’ she said, ‘keep the fast on the Magha Krishna Ekadashi and worship Lord Vishnu, and make use of sesame in six ways—bathe with sesame water, anoint yourself with a paste of sesame, offer libations of water mixed with sesame, perform the fire-oblation with sesame, take a meal of sesame, and give sesame in charity. For this reason this Ekadashi bears the name Shattila, the six-sesame vow.’',
          'The Brahmin woman did exactly so with complete faith. She gave away vessels filled with sesame and grain to Brahmins and to beggars, and the miserliness that had sat in her heart all her life flowed away in the merit-bearing waters of the vow. As she gave and gave, her mind grew pure and generous.',
          'By the power of Shattila Ekadashi her empty abode in Vaikuntha became filled to overflowing with wealth, grain, jewels, and divine enjoyments; the hut that had once stood bare now shone with good fortune. For this reason it is said that whoever observes this vow and gives sesame in charity with faith has both poverty and sin wiped away, and attains in the end the imperishable abode of Vishnu.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'saphala-ekadashi-katha',
    titleHi: 'सफला एकादशी व्रत कथा',
    titleEn: 'Saphala Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/saphala-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'champavati-ka-rajkumar',
        titleHi: 'चम्पावती का बिगड़ा राजकुमार',
        titleEn: 'The Wayward Prince of Champavati',
        bodyHi: [
          'चम्पावती नगरी पर राजा महिष्मत का राज्य था। उनके चार पुत्रों में सबसे बड़ा लुम्पक नाम से जाना जाता था। वह जन्म से ही दुष्ट, क्रूर और निर्लज्ज था; देवताओं की निंदा करता, ब्राह्मणों का अपमान करता और साधु-संतों को देखकर मुँह फेर लेता था।',
          'लुम्पक राजकोष का धन चुराकर दिन-रात पाप-कर्मों में उड़ा देता। मदिरा, जुआ और बुरी संगत में डूबा वह प्रजा को सताता और पिता की आज्ञा को तिनके के समान ठुकरा देता। उसके अनाचार की कथाएँ नगर-नगर फैल गईं और राजमहल की कीर्ति पर कालिख पुतने लगी।',
          'राजा महिष्मत बहुत दिनों तक सहते रहे, पर जब पुत्र का दुराचार सीमा लाँघ गया, तो उन्होंने भारी मन से उसे राज्य से निकाल देने का निश्चय किया। पिता का स्नेह और राजा का धर्म — दोनों के बीच फँसकर भी उन्होंने धर्म को ही चुना।',
        ],
        bodyEn: [
          'In the kingdom of Champavati there once reigned a king named Mahishmata, and of his four sons the eldest was known as Lumpaka. From birth he was cruel and shameless; he mocked the gods, insulted Brahmins, and turned his face away whenever a holy man came near.',
          'Lumpaka stole gold from the royal treasury and squandered it night and day on sin. Lost to wine, gambling, and wicked company, he tormented the people and brushed aside his father\'s commands as though they were dry straw. Tales of his misdeeds spread from town to town, and a stain began to settle upon the honour of the palace.',
          'For a long while King Mahishmata bore it in silence, but when his son\'s wickedness crossed every limit, he resolved with a heavy heart to banish him from the kingdom. Caught between a father\'s love and a king\'s duty, he chose duty.',
        ],
      },
      {
        id: 'van-ka-vriksh',
        titleHi: 'वन का पुराना पीपल',
        titleEn: 'The Old Peepal in the Forest',
        bodyHi: [
          'राज्य से निकाला गया लुम्पक घने वन में जा पहुँचा। वहाँ उसने चोरी और लूट को ही अपना जीवन बना लिया; दिन में छिपा रहता और रात में नगर में घुसकर लोगों का धन हर लेता। पकड़ा भी जाता तो स्वयं को राजपुत्र बताकर छूट जाता और फिर वही पाप दोहराता।',
          'उस वन के बीच एक अति प्राचीन पीपल का वृक्ष खड़ा था, जिसे लोग देवताओं का निवास मानकर पूजते थे। उसी वृक्ष के नीचे लुम्पक ने अपना ठिकाना बना लिया और वहीं कंद-मूल और पशुओं का माँस खाकर अपने दिन बिताने लगा।',
          'इस प्रकार पाप में डूबा वह दुष्ट न जानता था कि जिस वृक्ष की छाया में वह रहता है, वही एक दिन उसके उद्धार का द्वार बन जाएगा। समय का चक्र उसे अनजाने ही पुण्य की ओर खींच रहा था।',
        ],
        bodyEn: [
          'Driven from the kingdom, Lumpaka wandered into a dense forest. There he made theft and plunder his very livelihood; he hid by day and crept into the town by night to seize the wealth of others. Even when caught, he would name himself a king\'s son, slip free, and return at once to the same sins.',
          'In the heart of that forest stood an ancient peepal tree, which the people revered as the dwelling place of the gods. Beneath that very tree Lumpaka made his lair, passing his days on roots, wild tubers, and the flesh of the animals he killed.',
          'Sunk so deeply in sin, the wretch did not know that the tree in whose shade he sheltered would one day become the doorway to his rescue. Unseen, the wheel of time was drawing him toward merit.',
        ],
      },
      {
        id: 'anjaane-mein-vrat',
        titleHi: 'अनजाने में सफला एकादशी',
        titleEn: 'Saphala Ekadashi Kept Unknowingly',
        bodyHi: [
          'पौष मास के कृष्ण पक्ष की एकादशी से एक रात पूर्व कड़ाके की ठंड पड़ी। फटे वस्त्रों में काँपता लुम्पक न आग जला सका, न भोजन जुटा सका। शीत की मार से वह अधमरा-सा होकर वृक्ष के नीचे गिर पड़ा और रात भर मूर्च्छित-सा पड़ा रहा।',
          'दशमी की रात बीती और सफला एकादशी का सूर्य चढ़ा, पर लुम्पक के अंग जड़ हो चुके थे; वह उठ ही न सका। दोपहर ढले जब कुछ चेत आया, तो लड़खड़ाता हुआ वह वन में फल बीनने निकला। संध्या होते-होते वह कुछ फल लेकर पीपल के पास लौटा।',
          'थककर उसने वे फल वृक्ष की जड़ों के पास रख दिए और टूटे स्वर में बोला — \'इन फलों से भगवान नारायण प्रसन्न हों।\' भूख और शीत के कारण उस रात उसकी आँख तक न लगी; वह अनजाने ही जागरण करता रहा।',
          'इस प्रकार जिस दुष्ट ने कभी व्रत का नाम तक न लिया था, उसने उपवास, फल का अर्पण और रात्रि-जागरण — सफला एकादशी के तीनों अंग अनचाहे ही पूरे कर डाले। श्रीहरि की दृष्टि उस अबोध पुण्य पर जा टिकी।',
        ],
        bodyEn: [
          'One night before the Ekadashi of the dark fortnight of the month of Pausha, a bitter cold descended. Shivering in torn rags, Lumpaka could neither kindle a fire nor find any food. Struck down by the chill, he collapsed half-dead beneath the tree and lay there senseless through the night.',
          'The night of the tenth passed and the sun of Saphala Ekadashi rose, but Lumpaka\'s limbs had grown numb and he could not rise at all. When some sense returned to him past midday, he staggered out into the forest to gather fruit, and as evening drew near he returned to the peepal with a few in his hands.',
          'Worn out, he laid those fruits among the roots of the tree and said in a broken voice, ‘May Lord Narayana be pleased with these fruits.’ Hunger and cold kept sleep from his eyes that night, and so, all unknowing, he stayed awake in vigil.',
          'Thus the wretch who had never so much as spoken the name of a vow now completed, without intending it, all three limbs of Saphala Ekadashi — the fast, the offering of fruit, and the night-long wakefulness. The gaze of Shri Hari came to rest upon that innocent merit.',
        ],
      },
      {
        id: 'hari-ki-kripa',
        titleHi: 'श्रीहरि की कृपा और हृदय-परिवर्तन',
        titleEn: 'The Grace of Shri Hari and a Changed Heart',
        bodyHi: [
          'उस एक व्रत के अनजाने पुण्य से लुम्पक के असंख्य पापों का बोझ हलका होने लगा। भगवान नारायण की अहैतुकी कृपा उस पर बरसी और उसके मलिन अंतःकरण में पहली बार पश्चात्ताप की किरण फूटी।',
          'जैसे-जैसे दिन बीते, उसका मन हिंसा और लालच से हटकर भक्ति की ओर मुड़ने लगा। चोरी छूट गई, क्रूरता गल गई और वही दुष्ट अब वृक्ष के नीचे बैठकर श्रीविष्णु का स्मरण करने लगा। उसका रूप तेजोमय और वाणी मधुर हो उठी।',
          'वर्ष भर वह उसी वन में रहकर सच्चे मन से हरि का भजन करता रहा। उसका हृदय इतना निर्मल हो गया कि वन के पशु भी उसके पास निडर बैठने लगे; जो कभी आतंक था, वही अब करुणा की मूर्ति बन गया।',
        ],
        bodyEn: [
          'By the unknowing merit of that single vow, the burden of Lumpaka\'s countless sins began to lighten. The causeless grace of Lord Narayana poured upon him, and in his soiled heart, for the very first time, a ray of repentance broke forth.',
          'As the days went by, his mind turned away from violence and greed and bent toward devotion. The thieving fell away, the cruelty melted, and that same wretch now sat beneath the tree remembering Shri Vishnu. His face grew radiant and his speech grew gentle.',
          'For a full year he remained in that forest, singing the praises of Hari with a true heart. His being became so pure that even the beasts of the forest sat near him without fear; he who had once been a terror was now an image of compassion.',
        ],
      },
      {
        id: 'rajya-ki-prapti',
        titleHi: 'राज्य की प्राप्ति और व्रत का फल',
        titleEn: 'The Kingdom Regained and the Fruit of the Vow',
        bodyHi: [
          'ठीक एक वर्ष बाद, फिर सफला एकादशी का पावन दिन आया, और लुम्पक ने इस बार पूरे विधि-विधान, श्रद्धा और जागरण के साथ व्रत किया। उसकी भक्ति देख भगवान विष्णु अत्यंत प्रसन्न हुए और उसके भीतर का सारा अंधकार सदा के लिए मिट गया।',
          'उन्हीं दिनों राजा महिष्मत अब वृद्ध हो चले थे और योग्य उत्तराधिकारी की खोज में थे। उन्होंने सुना कि उनका बड़ा पुत्र अब परम धर्मात्मा और हरिभक्त बन चुका है। हर्ष से भरकर राजा ने मंत्रियों को भेजकर उसे ससम्मान महल में बुलवाया।',
          'पिता और पुत्र का मिलन आँसुओं से भीगा। महिष्मत ने प्रसन्न होकर राज्य का भार लुम्पक को सौंप दिया और स्वयं वन को प्रस्थान कर तपस्या में लीन हो गए। लुम्पक ने भी विरक्त होकर अपने पुत्र को सिंहासन दे दिया और शेष जीवन प्रभु-भजन में बिताया।',
          'जिसने जीवन भर पाप ही किया था, उसे एक सफला एकादशी के व्रत ने राज्य, यश और अंत में श्रीविष्णु का परमधाम दिला दिया। तभी से कहा जाता है कि जो श्रद्धा से यह व्रत करता है, उसके सब कार्य सफल होते हैं — और इसी से इस एकादशी का नाम \'सफला\' पड़ा।',
        ],
        bodyEn: [
          'Exactly one year later the holy day of Saphala Ekadashi came round again, and this time Lumpaka kept the vow with full rite, faith, and wakefulness. Beholding his devotion, Lord Vishnu was greatly pleased, and all the darkness within him was wiped away forever.',
          'In those very days King Mahishmata had grown old and was searching for a worthy heir. He heard that his eldest son had become a most righteous man and a devotee of Hari. Filled with joy, the king sent his ministers to summon him to the palace with honour.',
          'The meeting of father and son was bathed in tears. Mahishmata gladly placed the burden of the kingdom upon Lumpaka and himself departed for the forest, absorbed in penance. In time Lumpaka too grew detached, gave the throne to his own son, and spent the rest of his life in remembrance of the Lord.',
          'He who had done nothing but sin his whole life was granted, by a single Saphala Ekadashi vow, a kingdom, glory, and at the last the supreme abode of Shri Vishnu. From that day it has been said that whoever keeps this vow with faith finds all their tasks fulfilled — and it is for this that this Ekadashi bears the name ‘Saphala,’ the fruitful one.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'papmochani-ekadashi-katha',
    titleHi: 'पापमोचनी एकादशी व्रत कथा',
    titleEn: 'Papmochani Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/papmochani-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'chaitraratha-van-mein-tapasya',
        titleHi: 'चैत्ररथ वन में मेधावी की तपस्या',
        titleEn: 'Medhavi\'s Penance in the Chaitraratha Forest',
        bodyHi: [
          'कुबेर के रमणीय चैत्ररथ वन में, जहाँ सदा वसंत खिला रहता था और मंद सुगंधित पवन डालियों को सहलाता रहता था, गंधर्व और किन्नर मधुर गान करते और अप्सराएँ निर्भय होकर विहार करती थीं। उसी वन के एक एकांत कोने में, एक विशाल वृक्ष की छाया में, च्यवन ऋषि के पुत्र मेधावी मुनि गहन तप में लीन बैठे थे।',
          'मेधावी का तेज ऐसा था कि उनके निकट आते ही मन स्वतः शांत हो जाता। दिन-रात उनकी आँखें मुँदी रहतीं, उनका मन भगवान शिव के चरणों में स्थिर रहता, और उनके कंठ से धीमे-धीमे रुद्र-मंत्रों का जप झरता रहता। ऋतुएँ बदलतीं, पुष्प खिलते और झड़ते, पर वह युवा तपस्वी अपने आसन से तनिक भी विचलित न होता।',
          'उनके इस अखंड तप के तेज से देवलोक तक प्रकाशित हो उठा, और स्वर्ग के अधिपति इंद्र का सिंहासन भी मानो उस ज्योति के सम्मुख म्लान पड़ने लगा। इंद्र को आशंका हुई कि कहीं यह युवा मुनि अपने तप से कोई अद्भुत पद न माँग बैठे, और उन्होंने उस साधना को भंग करने का उपाय सोचा।',
        ],
        bodyEn: [
          'In Kubera’s enchanting Chaitraratha forest, where an eternal spring always bloomed and a soft, fragrant breeze forever caressed the branches, gandharvas and kinnaras sang sweet songs and apsaras wandered without fear. In one secluded corner of that forest, beneath the shade of a great tree, Medhavi, the son of the sage Chyavana, sat absorbed in deep austerity.',
          'Such was Medhavi’s radiance that, merely on drawing near him, the mind grew quiet of its own accord. Day and night his eyes remained closed, his mind fixed at the feet of Lord Shiva, and from his throat the soft, ceaseless murmur of the Rudra mantras flowed. Seasons turned, blossoms opened and fell, yet the young ascetic did not stir in the least from his seat.',
          'By the brilliance of this unbroken penance even the realm of the gods grew bright, and the throne of Indra, lord of the heavens, seemed to dim before that light. Indra feared that this young sage might, through his austerity, ask for some extraordinary station, and so he devised a means to break that practice.',
        ],
      },
      {
        id: 'manjughosha-ka-charan',
        titleHi: 'मंजुघोषा का मोहक नृत्य',
        titleEn: 'Manjughosha\'s Enchanting Dance',
        bodyHi: [
          'इंद्र ने अपनी सभा की सबसे सुंदर अप्सरा मंजुघोषा को बुलाकर आज्ञा दी कि वह चैत्ररथ वन में जाकर मेधावी मुनि का तप भंग करे। मंजुघोषा के रूप पर तो स्वयं देवता मुग्ध हो जाते थे; उसका स्वर वीणा से भी मधुर था और उसकी चाल में मानो पूरा वसंत लहराता था।',
          'वह वन में मुनि के आश्रम से कुछ ही दूरी पर पहुँची और अपनी मधुर वीणा के तारों को छेड़कर ऐसा सुरीला गान करने लगी कि सारा वन मानो ठहर-सा गया। कोयल चुप हो गई, भौंरे रुक गए, और पवन भी उसके स्वर को सुनने को मंद पड़ गया। फिर वह झूम-झूमकर ऐसा मनोहर नृत्य करने लगी कि उसके पैरों की झंकार वन के एकांत में गूँज उठी।',
          'दिनों तक मंजुघोषा अपने हाव-भाव और कोमल कटाक्षों से मुनि के निकट विहार करती रही। उसने पुष्पों की सुगंध बिखेरी, मधुर स्वर लहराए और अपने सौंदर्य का सारा जादू उँडेल दिया। साधना में लीन मेधावी पर पहले तो इसका कोई प्रभाव न पड़ा, किंतु कामदेव भी मंजुघोषा की सहायता को आ पहुँचे, और धीरे-धीरे मुनि के मन में एक अनजानी तरंग उठने लगी।',
        ],
        bodyEn: [
          'Indra summoned Manjughosha, the most beautiful apsara of his court, and commanded her to go into the Chaitraratha forest and break the penance of the sage Medhavi. Even the gods themselves were captivated by Manjughosha’s beauty; her voice was sweeter than the vina, and in her every step the whole of spring seemed to sway.',
          'She came to the forest, a little way from the sage’s hermitage, and plucking the strings of her sweet vina began to sing so melodiously that the entire forest seemed to grow still. The cuckoo fell silent, the bees paused, and even the wind softened to listen to her notes. Then, swaying gently, she began so charming a dance that the chime of her anklets rang through the solitude of the woods.',
          'For days Manjughosha lingered near the sage with her graceful gestures and tender sidelong glances. She scattered the fragrance of flowers, let her sweet voice ripple, and poured out all the magic of her beauty. At first it had no effect upon Medhavi, lost in his practice; but Kamadeva too came to Manjughosha’s aid, and slowly an unfamiliar stirring began to rise within the sage’s heart.',
        ],
      },
      {
        id: 'tap-ka-naash-aur-shrap',
        titleHi: 'तप का नाश और मुनि का शाप',
        titleEn: 'The Lost Penance and the Sage\'s Curse',
        bodyHi: [
          'अंततः वर्षों की कठोर साधना उस मोहजाल के सम्मुख डगमगा उठी। मेधावी की आँखें खुल गईं, और उन्होंने अपना तप, अपना संयम, अपना ध्यान—सब कुछ भुलाकर मंजुघोषा का हाथ थाम लिया। दोनों उस सुंदर वन में रमण करने लगे, और मुनि को समय का तनिक भी भान न रहा।',
          'कई वर्ष इसी प्रकार बीत गए, मानो वे कुछ ही दिन हों। एक दिन मंजुघोषा ने मुनि से देवलोक लौट जाने की अनुमति माँगी। उसी क्षण मेधावी की चेतना लौटी; उन्होंने जब अपनी ओर देखा तो स्तब्ध रह गए—जिस तप को उन्होंने जीवन भर संचित किया था, वह क्षणिक भोग में बह चुका था। पश्चात्ताप और क्रोध से उनका हृदय जल उठा।',
          'अपने पतन का कारण उस अप्सरा को मानकर क्रोध में भरे मुनि ने शाप दे दिया, ‘अरी मायाविनी! तूने अपने छल से मेरी इतने काल की तपस्या नष्ट कर दी। जा, तू पिशाचिनी हो जा, और इसी कुरूप, भयानक रूप में सदा भटकती रह!’ शाप सुनते ही मंजुघोषा का दिव्य, मनोहर शरीर विकृत होकर एक घोर पिशाचिनी में बदल गया।',
          'अपने इस भीषण रूप को देखकर मंजुघोषा थर्रा उठी और मुनि के चरणों में गिरकर विलाप करने लगी, ‘हे करुणामय मुनि! इस अपराध में अकेली मेरी नहीं, इंद्र की आज्ञा थी और कामदेव का बल था। मुझ पर दया कीजिए और इस घोर शाप से उद्धार का कोई मार्ग बताइए।’',
        ],
        bodyEn: [
          'At last the harsh austerity of years faltered before that web of enchantment. Medhavi’s eyes opened, and forgetting his penance, his restraint, his meditation—all of it—he took Manjughosha’s hand. The two began to dwell in delight in that lovely forest, and the sage lost all awareness of time.',
          'Many years passed in this manner as though they were but a few days. One day Manjughosha asked the sage’s leave to return to the realm of the gods. In that very instant Medhavi’s awareness returned; when he looked upon himself he was stunned—the penance he had gathered through a whole lifetime had drained away in fleeting indulgence. His heart burned with remorse and with rage.',
          'Holding the apsara to be the cause of his fall, the sage, filled with anger, pronounced a curse: ‘O deceiver! With your trickery you have destroyed the austerity of all this long time. Go, become a pishachini, and wander forever in this hideous, dreadful form!’ As the curse was uttered, Manjughosha’s divine and lovely body was disfigured and turned into a fearsome she-demon.',
          'Seeing this terrible shape of hers, Manjughosha shuddered, and falling at the sage’s feet she lamented: ‘O compassionate sage! In this offence the fault is not mine alone; there was the command of Indra and the strength of Kamadeva. Have mercy upon me, and show me some path to deliverance from this grievous curse.’',
        ],
      },
      {
        id: 'chyavana-ka-upadesh',
        titleHi: 'च्यवन ऋषि का उपदेश',
        titleEn: 'The Counsel of Sage Chyavana',
        bodyHi: [
          'मुनि का क्रोध मंजुघोषा के करुण क्रंदन से शांत होने लगा, किंतु उनका अपना मन भी अशांत था; उन्हें ज्ञात न था कि अपने नष्ट हुए तप को वे किस प्रकार पुनः अर्जित करेंगे। लज्जित और व्याकुल मेधावी अपने पिता, परम तपस्वी च्यवन ऋषि के आश्रम की ओर लौट पड़े।',
          'पिता के चरणों में सिर रखकर मेधावी ने अपनी सारी व्यथा कह सुनाई—किस प्रकार मोह में पड़कर उन्होंने अपना तप गँवाया, और किस प्रकार क्रोध में आकर अप्सरा को पिशाचिनी होने का शाप दे बैठे। च्यवन ऋषि ने स्नेह से पुत्र को समझाया कि क्रोध और काम दोनों ही साधक के सबसे बड़े शत्रु हैं।',
          'फिर उन्होंने कहा, ‘हे पुत्र, शोक मत करो। चैत्र मास के कृष्ण पक्ष में पापमोचनी नाम की एक परम पवित्र एकादशी आती है, जो नाम के अनुरूप समस्त पापों का नाश करने वाली है। तुम पूर्ण श्रद्धा और विधि से इस एकादशी का व्रत करो; इसके प्रभाव से तुम्हारा खोया हुआ तप पुनः लौट आएगा और तुम्हारा यह पाप भी धुल जाएगा।’',
          'पिता का यही उपदेश मेधावी ने उस पिशाचिनी बनी मंजुघोषा तक भी पहुँचाया, और उससे कहा कि वह भी इसी पापमोचनी एकादशी का व्रत श्रद्धा से करे, तभी उसका शाप कटेगा और वह अपने पूर्व दिव्य रूप को पुनः प्राप्त करेगी।',
        ],
        bodyEn: [
          'The sage’s anger began to subside at Manjughosha’s piteous weeping, yet his own mind too was troubled; he did not know how he might earn again the penance he had lost. Ashamed and distraught, Medhavi turned back toward the hermitage of his father, the supreme ascetic, the sage Chyavana.',
          'Laying his head at his father’s feet, Medhavi poured out all his grief—how, falling into infatuation, he had squandered his austerity, and how, in his anger, he had cursed the apsara to become a she-demon. Sage Chyavana lovingly counselled his son that anger and desire are alike the greatest enemies of a seeker.',
          'Then he said, ‘O son, do not grieve. In the dark fortnight of the month of Chaitra there comes a most sacred ekadashi named Papmochani, which, as its name declares, is the destroyer of all sins. Observe this ekadashi with full faith and according to the rite; by its power your lost penance will return to you, and this fault of yours too will be washed away.’',
          'This very counsel of his father, Medhavi carried also to Manjughosha, now turned into a she-demon, and he told her that she too should keep this same Papmochani Ekadashi with faith—only then would her curse be cut away and she regain her former divine form.',
        ],
      },
      {
        id: 'vrat-aur-mukti',
        titleHi: 'व्रत का पालन और दोनों की मुक्ति',
        titleEn: 'The Vow Observed and the Release of Both',
        bodyHi: [
          'च्यवन ऋषि के वचनों को शिरोधार्य कर मेधावी ने चैत्र कृष्ण पक्ष की पापमोचनी एकादशी का व्रत पूर्ण नियम से धारण किया। उन्होंने स्नान कर शुद्ध हृदय से भगवान विष्णु का पूजन किया, दिनभर उपवास रखा, और रात्रि भर जागकर हरि-नाम का स्मरण करते रहे। उनके मन में अब न मोह था, न क्रोध, केवल पश्चात्ताप से भीगी हुई एक सच्ची पुकार थी।',
          'व्रत के दिव्य प्रभाव से मेधावी का वह सारा तप, जो भोग में बह गया था, पुनः उनके भीतर लौट आया, और उनका हृदय पाप के भार से मुक्त होकर पहले से भी अधिक निर्मल हो उठा। उन्होंने जान लिया कि साधक की सबसे बड़ी शक्ति इंद्रियों पर संयम और मन की स्थिरता में ही है।',
          'उधर पिशाचिनी बनी मंजुघोषा ने भी पूर्ण श्रद्धा से उसी पापमोचनी एकादशी का व्रत किया। व्रत के पुण्य से उसका वह घोर, कुरूप शरीर झड़ गया, और वह पुनः अपने उज्ज्वल, मनोहर अप्सरा रूप में प्रकट हो उठी। शाप से मुक्त होकर, हलके हृदय से, वह मुनि को प्रणाम कर देवलोक की ओर लौट गई।',
          '‘पापमोचनी’ अर्थात् पापों को हर लेने वाली—यह एकादशी जो भी मनुष्य श्रद्धा और संयम से इसका व्रत करता है, उसके ब्रह्महत्या जैसे घोर पाप तक नष्ट हो जाते हैं, उसका मन निर्मल होता है, और अंत में उसे विष्णु के परम धाम की प्राप्ति होती है। मेधावी और मंजुघोषा की यह गाथा आज भी इसी सत्य की साक्षी बनकर भक्तों को संयम और भगवद्-शरण की ओर बुलाती है।',
        ],
        bodyEn: [
          'Taking the words of sage Chyavana upon his head, Medhavi undertook the Papmochani Ekadashi of the dark fortnight of Chaitra according to the full rule. Bathing and worshipping Lord Vishnu with a pure heart, he fasted the whole day and stayed awake through the night remembering the name of Hari. In his mind there was now no infatuation, no anger, only a single true cry soaked in repentance.',
          'By the divine power of the vow, all that penance of Medhavi’s which had drained away in indulgence returned once more within him, and his heart, freed of the burden of sin, grew purer than before. He understood that the greatest strength of a seeker lies in restraint over the senses and in the steadiness of the mind.',
          'There too Manjughosha, turned into a she-demon, observed that same Papmochani Ekadashi with complete faith. By the merit of the vow her fearsome, hideous body fell away, and she appeared once more in her radiant, lovely apsara form. Freed of the curse, with a lightened heart, she bowed to the sage and returned toward the realm of the gods.',
          '‘Papmochani’ means the remover of sins—this ekadashi, for whoever observes it with faith and restraint, destroys even grievous sins such as the slaying of a brahmin, makes the mind pure, and in the end grants the supreme abode of Vishnu. The tale of Medhavi and Manjughosha stands to this day as a witness to this very truth, calling the devout toward restraint and the shelter of the Lord.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'jaya-ekadashi-katha',
    titleHi: 'जया एकादशी व्रत कथा',
    titleEn: 'Jaya Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/jaya-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'yudhishthira-puchhta-hai',
        titleHi: 'युधिष्ठिर का प्रश्न और श्रीकृष्ण का उत्तर',
        titleEn: 'Yudhishthira Asks and Krishna Answers',
        bodyHi: [
          'धर्मराज युधिष्ठिर ने हाथ जोड़कर भगवान श्रीकृष्ण से विनय की, ‘हे जनार्दन, माघ मास के शुक्ल पक्ष में आने वाली एकादशी का क्या नाम है, और उसका व्रत करने से जीव को कौन सा फल मिलता है? कृपा करके मुझे यह रहस्य बतलाइए।’',
          'भगवान श्रीकृष्ण मंद-मंद मुस्कुराते हुए बोले, ‘हे राजन्, माघ शुक्ल पक्ष की इस पवित्र एकादशी का नाम जया एकादशी है। ‘जया’ अर्थात् विजय देने वाली—यह व्रत भूत, प्रेत और पिशाच की योनि से मुक्ति दिलाने वाला तथा समस्त पापों का नाश करने वाला है।’',
          '‘जो मनुष्य श्रद्धा और भक्ति के साथ इस व्रत को धारण करता है, वह कभी प्रेत या पिशाच योनि को प्राप्त नहीं होता। इसकी महिमा इतनी प्रबल है कि इसके स्मरण मात्र से ही जीव के भयंकर शाप तक कट जाते हैं। इसके विषय में एक अति प्राचीन कथा है, जिसे ध्यान देकर सुनो।’',
          '‘बहुत पहले की बात है, जब देवराज इंद्र अमरावती के नंदन वन में देवताओं और गंधर्वों से घिरे हुए अपने स्वर्णिम सिंहासन पर विराजमान थे। दिव्य गंधर्व अपने मधुर गान से सभा को मोहित कर रहे थे, और अप्सराएँ अपनी लय-ताल में नृत्य कर रही थीं।’',
        ],
        bodyEn: [
          'Dharmaraja Yudhishthira folded his hands and entreated Lord Krishna, ‘O Janardana, what is the name of the Ekadashi that falls in the bright fortnight of the month of Magha, and what fruit does a soul obtain by observing its fast? Be gracious enough to reveal this secret to me.’',
          'Lord Krishna, smiling gently, replied, ‘O King, this sacred Ekadashi of the bright fortnight of Magha is named Jaya Ekadashi. ‘Jaya’ means the giver of victory—this vow grants release from the wombs of ghost, spectre, and pishacha, and destroys every kind of sin.’',
          '‘Whoever holds this fast with faith and devotion never falls into the form of a spectre or a fiend. Its glory is so potent that even dreadful curses are severed by its remembrance alone. There is a most ancient tale concerning it; listen to it with attention.’',
          '‘Long, long ago, the king of the gods, Indra, was seated upon his golden throne in the Nandana grove of Amaravati, surrounded by gods and gandharvas. The celestial gandharvas were enchanting the assembly with their sweet song, and the apsaras were dancing in measured rhythm.’',
        ],
      },
      {
        id: 'malyavan-aur-pushpavati',
        titleHi: 'माल्यवान और पुष्पवती का अनुराग',
        titleEn: 'The Love of Malyavan and Pushpavati',
        bodyHi: [
          'उस दिव्य सभा के गायकों में माल्यवान नामक एक गंधर्व सबसे यशस्वी था। उसका कंठ ऐसा था कि जब वह गाता तो देवता भी मंत्रमुग्ध होकर निश्चल हो जाते, और स्वयं इंद्र भी उसकी कला पर सिर हिलाकर प्रसन्न होते थे।',
          'उसी सभा में पुष्पवती नामक एक अति सुंदर अप्सरा भी थी, जिसका नृत्य देवलोक में अनुपम माना जाता था। माल्यवान के स्वर और पुष्पवती के लय—दोनों मानो एक ही प्राण के दो छोर थे; एक की वाणी जहाँ उठती, वहीं दूसरी के चरण थिरकने लगते।',
          'किंतु इस कला-संगम के बीच दोनों के हृदयों में एक-दूसरे के प्रति प्रबल अनुराग जाग उठा। पुष्पवती माल्यवान के मधुर स्वर पर मोहित थी, और माल्यवान उसके मनोहर रूप और भाव-भंगिमा पर। उनके मन परस्पर ऐसे बँध गए कि सभा का धर्म और मर्यादा उन्हें विस्मृत होने लगी।',
          'एक दिन इंद्र की सभा में संगीत की वही दिव्य प्रस्तुति चल रही थी। माल्यवान को गान करना था और पुष्पवती को नृत्य, परंतु दोनों एक-दूसरे के प्रेम में ऐसे डूबे कि न माल्यवान का स्वर शुद्ध रहा, न पुष्पवती की ताल। वासना में बँधा उनका मन सुर और लय दोनों से भटक गया।',
        ],
        bodyEn: [
          'Among the singers of that celestial assembly, a gandharva named Malyavan was the most renowned. His voice was such that when he sang the very gods grew still and spellbound, and Indra himself would nod in delight at his art.',
          'In that same court was an exceedingly beautiful apsara named Pushpavati, whose dance was held to be without equal in the world of the gods. The voice of Malyavan and the rhythm of Pushpavati were like two ends of a single life-breath; wherever the one’s song arose, there the other’s feet began to move.',
          'Yet amid this meeting of arts, a powerful longing for one another awoke in both their hearts. Pushpavati was enchanted by Malyavan’s sweet voice, and Malyavan by her lovely form and graceful gestures. Their minds became so entwined that the propriety and decorum of the assembly began to slip from their memory.',
          'One day the same divine performance of music was unfolding in Indra’s court. Malyavan was to sing and Pushpavati to dance, but the two were so drowned in love for each other that neither did Malyavan’s voice stay true, nor Pushpavati’s rhythm. Bound by desire, their minds wandered from both melody and measure.',
        ],
      },
      {
        id: 'indra-ka-shrap',
        titleHi: 'इंद्र का क्रोध और पिशाच रूप का शाप',
        titleEn: 'Indra’s Wrath and the Curse of the Pishacha Form',
        bodyHi: [
          'देवराज इंद्र भगवान विष्णु की स्तुति में लीन होकर वह गान सुन रहे थे, परंतु जब उन्होंने देखा कि गायन बिखर गया है और नृत्य भी डगमगा गया है, तो वे समझ गए कि माल्यवान और पुष्पवती परस्पर प्रेम में मग्न होकर सभा की मर्यादा भूल बैठे हैं।',
          'इंद्र का मुख क्रोध से तमतमा उठा। उन्होंने गरजकर कहा, ‘अरे मूढ़ो! तुमने मेरी सभा में, भगवान विष्णु की स्तुति के समय, अपनी काम-वासना में डूबकर इस दिव्य संगीत का अपमान किया है। जाओ, तुम दोनों अपने सुंदर दिव्य रूप को त्यागकर पृथ्वी पर भयानक पिशाच बन जाओ!’',
          'शाप के उच्चारित होते ही माल्यवान और पुष्पवती के सुकोमल दिव्य शरीर विकृत हो उठे। उनके मनोहर रूप कुरूप, विशाल और भयावह पिशाच देहों में बदल गए, और वे स्वर्ग के सुख से गिरकर हिमालय की बर्फीली, सुनसान घाटियों में आ पड़े।',
          'उस पिशाच योनि में उनका जीवन घोर पीड़ा से भर गया। न ठीक से अन्न मिलता, न जल; दिन कड़ी धूप में और रातें हाड़ कँपा देने वाली ठंड में बीततीं। जिन कंठों से कभी अमृत-सा संगीत झरता था, वे अब केवल भूख और संताप की चीत्कार करते थे, और बीते सुख को स्मरण कर दोनों अनवरत रुदन करते।',
        ],
        bodyEn: [
          'Indra, the king of the gods, had been listening to that song absorbed in the praise of Lord Vishnu; but when he saw that the singing had scattered and the dance too had faltered, he understood that Malyavan and Pushpavati, lost in love for one another, had forgotten the decorum of the assembly.',
          'Indra’s face flushed crimson with anger. He thundered, ‘O foolish ones! In my court, at the very hour of Lord Vishnu’s praise, drowned in your lust you have dishonoured this divine music. Go—let the two of you cast off your beautiful celestial forms and become dreadful pishachas upon the earth!’',
          'No sooner were the words of the curse spoken than the tender, divine bodies of Malyavan and Pushpavati were disfigured. Their lovely forms turned into ugly, vast, and terrifying fiendish frames, and falling from the joys of heaven they came to rest in the snowbound, desolate valleys of the Himalaya.',
          'In that fiendish birth their life filled with grievous suffering. Neither food nor water came to them properly; their days passed under a harsh sun and their nights in a bone-shaking cold. The throats from which nectar-like music had once flowed now only shrieked with hunger and torment, and remembering their lost joy the two wept without ceasing.',
        ],
      },
      {
        id: 'anjana-vrat-ka-palan',
        titleHi: 'अनजाने में जया एकादशी का व्रत',
        titleEn: 'The Vow of Jaya Ekadashi Kept Unknowing',
        bodyHi: [
          'इसी प्रकार पिशाच रूप में तड़पते हुए माघ शुक्ल पक्ष की एकादशी का दिन आ पहुँचा। उस दिन पीड़ा और पश्चाताप से भरकर दोनों ने अपने कुकर्मों पर गहरा खेद किया। दुःख से व्याकुल होकर उन्होंने दिनभर अन्न का एक दाना भी ग्रहण नहीं किया।',
          'हिमालय की भयंकर शीत में ठिठुरते हुए वे एक पीपल वृक्ष के नीचे बैठ रहे और सारी रात निद्रा उनके पास न आई। ठंड और संताप ने उन्हें जागृत रखा, और अनजाने ही वे दोनों रात्रि-जागरण करते रहे—न कुछ खाया, न जल पिया, न पल भर सोए।',
          'उन्हें इसका तनिक भी ज्ञान न था कि यह दिन जया एकादशी का पवित्र पर्व है, और जो कुछ वे विवशता में कर रहे थे, वही तो इस व्रत का मर्म था—उपवास, जागरण और अपने पापों पर सच्चा पश्चाताप। उनकी अनजानी पीड़ा ही उनकी अनजानी साधना बन गई।',
          'रात्रि के अंतिम प्रहर में, जब उनका हृदय अपने अपराध की ग्लानि से पूर्णतः झुक चुका था, तब अकस्मात ही जया एकादशी के दिव्य प्रभाव ने उन दोनों के चारों ओर पुण्य का प्रकाश भर दिया, और भोर होते-होते उनका भयंकर पिशाचत्व क्षीण होने लगा।',
        ],
        bodyEn: [
          'Suffering thus in their fiendish form, the day of the Ekadashi of Magha’s bright fortnight arrived. On that day, filled with pain and remorse, the two grieved deeply over their evil deeds. Tormented by sorrow, they did not take a single grain of food the whole day long.',
          'Shivering in the fearful cold of the Himalaya, they sat down beneath a peepal tree, and through the whole night no sleep came to them. The cold and the torment kept them awake, and unknowingly the two of them passed the night in vigil—eating nothing, drinking no water, sleeping not a moment.',
          'They had not the least awareness that this day was the holy festival of Jaya Ekadashi, and that whatever they were doing in their helplessness was the very essence of this vow—fasting, vigil, and true repentance for their sins. Their unknowing pain had become their unknowing devotion.',
          'In the last watch of the night, when their hearts had bowed completely under the shame of their wrongdoing, suddenly the divine power of Jaya Ekadashi filled both of them all around with a light of merit, and as dawn drew near their dreadful fiendishness began to wane.',
        ],
      },
      {
        id: 'mukti-aur-vrat-ka-phal',
        titleHi: 'शाप से मुक्ति और व्रत का फल',
        titleEn: 'Release from the Curse and the Fruit of the Vow',
        bodyHi: [
          'उस अनजाने व्रत और रात्रि-जागरण के पुण्य से माल्यवान और पुष्पवती का घोर शाप उसी क्षण टूट गया। उनकी कुरूप पिशाच देह झड़ गई और वे पुनः अपने उज्ज्वल, मनोहर दिव्य रूप में प्रकट हुए। दोनों के नेत्रों से कृतज्ञता के अश्रु बह निकले।',
          'अपने पूर्व रूप को पाकर वे आकाश-मार्ग से पुनः स्वर्गलोक पहुँचे और देवराज इंद्र के समक्ष नतमस्तक होकर खड़े हो गए। उनका तेज और कांति देखकर इंद्र विस्मित रह गए और पूछा कि किस पुण्य के बल पर उन्होंने इतने भयंकर शाप से मुक्ति पा ली।',
          'जब इंद्र को ज्ञात हुआ कि अनजाने ही माघ शुक्ल की जया एकादशी का उपवास और जागरण कर लेने से उनका उद्धार हुआ है, तो वे अत्यंत प्रसन्न हुए। उन्होंने कहा, ‘जिस एकादशी ने तुम्हें पिशाच योनि से उबार लिया, वह भगवान विष्णु को परम प्रिय है। अब तुम पवित्र होकर पुनः इस देवलोक में निवास करो।’',
          'श्रीकृष्ण बोले, ‘हे युधिष्ठिर, देखो—जिसे अनजाने में करने पर भी ऐसा विजय-फल मिलता है, उसे श्रद्धा और भक्ति से करने वाला तो निश्चय ही समस्त पापों से मुक्त होकर वैकुंठ को प्राप्त करता है। जो जया एकादशी का व्रत करता है, वह भूत-प्रेत-पिशाच की योनि से सदा के लिए बच जाता है और सहस्र अश्वमेध यज्ञों के समान पुण्य पाता है।’ यह सुनकर धर्मराज का हृदय श्रद्धा से भर गया, और माल्यवान-पुष्पवती की यह गाथा आज भी इस सत्य की साक्षी है।',
        ],
        bodyEn: [
          'By the merit of that unknowing fast and night-long vigil, the grievous curse of Malyavan and Pushpavati broke in that very instant. Their ugly fiendish bodies fell away and they appeared once more in their radiant, captivating divine forms. Tears of gratitude flowed from the eyes of both.',
          'Having regained their former shape, they returned by the path of the sky to the world of the gods and stood with bowed heads before Indra, king of the gods. Beholding their splendour and lustre, Indra was astonished, and asked by the power of what merit they had won release from so terrible a curse.',
          'When Indra learned that they had been delivered by unknowingly keeping the fast and vigil of Jaya Ekadashi in the bright fortnight of Magha, he was greatly pleased. He said, ‘The Ekadashi that has lifted you out of the fiendish womb is most dear to Lord Vishnu. Now, made pure, dwell once again in this world of the gods.’',
          'Krishna said, ‘O Yudhishthira, behold—if even when performed unknowingly it yields such a fruit of victory, then surely the one who observes it with faith and devotion is freed from every sin and attains Vaikuntha. Whoever keeps the vow of Jaya Ekadashi is spared forever from the wombs of ghost, spectre, and fiend, and gains merit equal to a thousand Ashvamedha sacrifices.’ Hearing this, the heart of Dharmaraja filled with reverence, and the tale of Malyavan and Pushpavati stands to this day as a witness to this truth.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'dev-uthani-ekadashi-katha',
    titleHi: 'देव उठनी एकादशी व्रत कथा',
    titleEn: 'Dev Uthani Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/dev-uthani-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'yudhishthira-asks',
        titleHi: 'युधिष्ठिर का प्रश्न और शयन का स्मरण',
        titleEn: 'Yudhishthira asks, and the long sleep is recalled',
        bodyHi: [
          'द्वापर के अन्तिम वर्षों में एक शान्त प्रभात में धर्मराज युधिष्ठिर हाथ जोड़कर भगवान श्रीकृष्ण के समीप बैठे और बोले, ‘हे मधुसूदन! कार्तिक मास के शुक्ल पक्ष में जो एकादशी आती है, उसका क्या नाम है, उसका माहात्म्य क्या है, और लोग उसे इतनी श्रद्धा से ‘देव उठनी’ कहकर क्यों मनाते हैं? कृपया मुझे विस्तार से सुनाइए।’',
          'श्रीकृष्ण मन्द-मन्द मुस्कुराए और बोले, ‘हे राजन्! इस तिथि को प्रबोधिनी अथवा देवोत्थान एकादशी कहते हैं, और यह कथा उतनी ही पुरानी है जितनी सृष्टि का चक्र। आषाढ़ शुक्ल एकादशी को मैं क्षीरसागर में शेषनाग की शय्या पर योगनिद्रा में चला जाता हूँ, और पूरे चार मास — चातुर्मास भर — उसी निद्रा में रहता हूँ। उन्हीं चार मासों के अन्त में, कार्तिक शुक्ल की इस एकादशी को मैं जागता हूँ; इसीलिए इस दिन को देवों के उठने का दिन कहा जाता है।’',
          '‘जब तक मैं शयन में रहता हूँ,’ श्रीकृष्ण ने कहा, ‘तब तक संसार में विवाह, यज्ञोपवीत, गृहप्रवेश और मांगलिक कार्य रोक दिए जाते हैं, क्योंकि सृष्टि का स्वामी विश्राम में होता है। पृथ्वी प्रतीक्षा करती है, ऋषि-मुनि ध्यान में रहते हैं, और भक्तजन उस घड़ी की बाट जोहते हैं जब मैं नेत्र खोलूँगा और शुभ कर्मों का द्वार फिर से खुल जाएगा।’',
        ],
        bodyEn: [
          'In the closing years of the Dvapara age, on a still morning, Dharmaraja Yudhishthira folded his hands beside Lord Krishna and said, ‘O Madhusudana, the Ekadashi that falls in the bright fortnight of the month of Kartik — what is its name, what is its greatness, and why do people keep it with such reverence, calling it the day the gods arise? Pray tell me in full.’',
          'Krishna smiled gently and said, ‘O king, this day is called Prabodhini, or Devotthana Ekadashi, and its story is as old as the turning of creation itself. On the bright eleventh of Ashadha I lie down upon the bed of Shesha in the Ocean of Milk and enter my Yoga Nidra, and through four whole months — all of Chaturmas — I remain in that sleep. At the close of those four months, on this very Ekadashi of bright Kartik, I awaken; and so this day is named the rising of the gods.’',
          '‘For as long as I rest in sleep,’ Krishna continued, ‘weddings, sacred-thread rites, house-warmings, and all auspicious undertakings are set aside in the world, for the master of creation is at rest. The earth waits, the sages remain absorbed in meditation, and the devout watch for the hour when I shall open my eyes and the doorway of auspicious works will open once more.’',
        ],
      },
      {
        id: 'gods-rouse-hari',
        titleHi: 'देवताओं और ऋषियों का जागरण-स्तवन',
        titleEn: 'The gods and sages sing the awakening',
        bodyHi: [
          'चार मास बीतते ही समस्त देवता, ब्रह्मा और शिव को आगे करके, क्षीरसागर के तट पर एकत्र हुए। वहाँ नीले जल की लहरों पर शेषनाग की शय्या डोल रही थी और उस पर भगवान विष्णु शान्त मुद्रा में सोए हुए थे। देवताओं ने मधुर वाद्य बजाए, ऋषियों ने वेद-मन्त्रों का घोष किया, और सबने मिलकर हाथ जोड़कर पुकारा — ‘उत्तिष्ठ गोविन्द! उत्तिष्ठ गरुड़ध्वज! उत्तिष्ठ कमलाकान्त! त्रैलोक्य मंगलं कुरु!’',
          '‘हे प्रभु!’ उन्होंने विनती की, ‘आपकी निद्रा से सृष्टि के सब शुभ कार्य रुक गए हैं। मेघ बरस चुके, धान पक गया, तुलसी फूल उठी, और पृथ्वी आपके जागरण के लिए सज गई है। अब नेत्र खोलिए और संसार को फिर से मंगलमय कीजिए।’ उनके इस प्रेमपूर्ण स्तवन से भगवान की योगनिद्रा भंग हुई और उन्होंने धीरे से अपने कमल-समान नेत्र खोल दिए।',
          'विष्णु के जागते ही मानो सम्पूर्ण ब्रह्माण्ड में उल्लास की लहर दौड़ गई। देवताओं ने पुष्प बरसाए, शंख-घण्टे गूँज उठे, और तुलसी का विवाह शालिग्राम स्वरूप भगवान से सम्पन्न करने की तैयारी होने लगी। इसी दिन से विवाह और सब मांगलिक कार्यों का द्वार फिर खुल गया, और भक्तजन दीप जलाकर, गन्ने का मण्डप सजाकर अपने जागे हुए प्रभु का स्वागत करने लगे।',
        ],
        bodyEn: [
          'As the four months ended, all the gods, with Brahma and Shiva at their head, gathered upon the shore of the Ocean of Milk. There, upon the blue swelling waves, the couch of Shesha rocked gently, and upon it Lord Vishnu lay in serene repose. The gods sounded sweet instruments, the sages chanted the Vedic mantras, and together, with folded hands, they called out — ‘Rise, Govinda! Rise, you whose banner bears Garuda! Rise, beloved of Kamala! Bring auspiciousness to the three worlds!’',
          '‘O Lord,’ they pleaded, ‘with your sleep all the blessed works of creation have come to a halt. The clouds have poured, the rice has ripened, the Tulsi has flowered, and the earth has adorned herself for your awakening. Now open your eyes and make the world auspicious once more.’ Moved by this loving hymn, the Lord stirred from his Yoga Nidra and slowly opened his lotus-like eyes.',
          'The instant Vishnu awoke, a wave of joy seemed to race through the whole of creation. The gods rained down flowers, conches and bells rang out, and preparations began to celebrate the wedding of Tulsi to the Lord in his Shaligrama form. From this very day the door to weddings and all auspicious undertakings opened again, and devotees lit lamps, raised canopies of sugarcane, and welcomed their awakened Lord.',
        ],
      },
      {
        id: 'merchant-and-the-vow',
        titleHi: 'व्यापारी की पत्नी और व्रत का संकल्प',
        titleEn: 'A merchant wife and the resolve of the vow',
        bodyHi: [
          'श्रीकृष्ण ने कथा को आगे बढ़ाते हुए कहा — ‘हे युधिष्ठिर! एक नगर में एक धनी व्यापारी रहता था, जो धन तो खूब कमाता था पर धर्म की ओर उसकी रुचि कम थी। उसकी पत्नी इसके विपरीत परम विष्णुभक्त थी; वह प्रत्येक एकादशी का व्रत श्रद्धा से रखती, गरीबों को अन्न देती और हरि का नाम जपती रहती।’',
          '‘एक बार देव उठनी एकादशी निकट आई। पत्नी ने पति से कहा, ‘स्वामी! आज के दिन तो स्वयं भगवान योगनिद्रा से जागते हैं; इस एकादशी का व्रत समस्त पापों को हर लेता है। आप भी अन्न त्यागकर हरि का स्मरण कीजिए।’ व्यापारी हँसा और बोला, ‘भूखा रहकर पुण्य कैसा? पेट भरने से ही जीवन चलता है।’ फिर भी पत्नी के बार-बार आग्रह से उसने अनमने मन से उस दिन भोजन नहीं किया।’',
          '‘उसी एक व्रत का ऐसा प्रभाव पड़ा कि व्यापारी का कठोर मन धीरे-धीरे पिघलने लगा। उसने देखा कि उपवास से न उसका शरीर दुर्बल हुआ, न उसका व्यापार घटा; उल्टे उसके भीतर एक अपूर्व शान्ति उतर आई। जो मनुष्य कभी मन्दिर का द्वार नहीं देखता था, वह अब प्रतिदिन तुलसी को जल चढ़ाने लगा और सन्ध्या को हरि-नाम सुनने बैठ जाता।’',
        ],
        bodyEn: [
          'Carrying the story onward, Krishna said, ‘O Yudhishthira, in a certain city there lived a wealthy merchant who earned riches in plenty but had little inclination toward dharma. His wife, by contrast, was a great devotee of Vishnu; she kept the vow of every Ekadashi with faith, gave food to the poor, and ever repeated the name of Hari.’',
          '‘Once, Dev Uthani Ekadashi drew near. The wife said to her husband, ‘My lord, on this very day the Lord himself awakens from his Yoga Nidra; the vow of this Ekadashi carries away all sins. You too set aside food and remember Hari.’ The merchant laughed and said, ‘What merit lies in going hungry? Life runs on a filled stomach.’ Yet, at his wife’s repeated urging, he reluctantly took no food that day.’',
          '‘So great was the effect of that single vow that the merchant’s hard heart slowly began to soften. He saw that the fast had neither weakened his body nor diminished his trade; instead an unfamiliar peace had settled within him. The man who had never once looked toward a temple door now offered water to the Tulsi each day and, at dusk, would sit to hear the name of Hari.’',
        ],
      },
      {
        id: 'liberation-and-fruit',
        titleHi: 'मुक्ति का द्वार और व्रत का फल',
        titleEn: 'The door of liberation and the fruit of the vow',
        bodyHi: [
          '‘वर्षों तक उस दम्पति ने श्रद्धा से देव उठनी एकादशी का व्रत किया,’ श्रीकृष्ण ने कहा। ‘जो व्यापारी कभी केवल धन को ही सब कुछ मानता था, वह अन्त समय में हरि का नाम लेते-लेते इतना निर्मल हो गया कि उसके सब पाप उस एक तिथि के पुण्य-प्रभाव से धुल गए। देह त्यागते ही उसे और उसकी पतिव्रता पत्नी को विष्णुदूत आए और दोनों को दिव्य विमान में बिठाकर मेरे परम धाम वैकुण्ठ ले गए।’',
          '‘हे राजन्!’ श्रीकृष्ण ने स्नेह से कहा, ‘यही इस प्रबोधिनी एकादशी का रहस्य है। जिस दिन मैं चार मास की योगनिद्रा से जागता हूँ, उस दिन का किया हुआ व्रत, तुलसी-पूजन और हरि-स्मरण सहस्र अश्वमेध यज्ञों से भी अधिक फल देता है। जो मनुष्य इस दिन अन्न त्यागकर, दीप जलाकर, श्रद्धा से मेरा जागरण करता है, उसके अनेक जन्मों के पाप उसी क्षण भस्म हो जाते हैं।’',
          '‘ऐसा भक्त इस लोक में सुख, यश और समृद्धि भोगता है और अन्त में जन्म-मरण के बन्धन से मुक्त होकर मेरे उस धाम को प्राप्त होता है, जहाँ से लौटना नहीं होता — यही देव उठनी एकादशी का अक्षय फल है।’ श्रीकृष्ण के मुख से यह पावन कथा सुनकर युधिष्ठिर का हृदय परम सन्तोष और भक्ति से भर उठा, और उन्होंने उसी क्षण इस व्रत को आजीवन धारण करने का संकल्प कर लिया।',
        ],
        bodyEn: [
          '‘For many years that couple kept the vow of Dev Uthani Ekadashi with faith,’ said Krishna. ‘The merchant who had once held wealth to be everything became, at the last, so pure from repeating the name of Hari that all his sins were washed away by the merit of that single day. The very moment he left his body, the messengers of Vishnu came for him and for his devoted wife, and seating them both in a celestial chariot, bore them to my supreme abode of Vaikuntha.’',
          '‘O king,’ Krishna said tenderly, ‘this is the secret of Prabodhini Ekadashi. The vow kept on the day I awaken from four months of Yoga Nidra — the worship of Tulsi and the remembrance of Hari — bears fruit greater than a thousand Ashvamedha sacrifices. For the one who, on this day, gives up food, lights a lamp, and with faith rouses me from my sleep, the sins of many lifetimes are reduced to ash in that very instant.’',
          '‘Such a devotee enjoys happiness, fame, and prosperity in this world, and at the end is freed from the bondage of birth and death and attains that abode of mine from which there is no return — this is the imperishable fruit of Dev Uthani Ekadashi.’ Hearing this sacred story from the lips of Krishna, Yudhishthira’s heart filled with deep contentment and devotion, and in that very moment he resolved to hold this vow for the whole of his life.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'amalaki-ekadashi-katha',
    titleHi: 'आमलकी एकादशी व्रत कथा',
    titleEn: 'Amalaki Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/amalaki-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'amalaka-vriksha-ka-janma',
        titleHi: 'आमलक वृक्ष का दिव्य जन्म',
        titleEn: 'The Divine Birth of the Amalaka Tree',
        bodyHi: [
          'सृष्टि के आरंभ में, जब चारों ओर केवल जल ही जल फैला था और कहीं कोई आधार न था, ब्रह्मा जी कमल पर विराजमान होकर भगवान विष्णु का ध्यान करने लगे। उनकी भक्ति इतनी गहन थी कि उनके नेत्रों से आनंद के अश्रु झरने लगे, और वे अश्रु-बिंदु जल पर गिरकर बिखर गए।',
          'उन्हीं प्रेम-भरे अश्रुओं से एक तेजस्वी वृक्ष प्रकट हुआ, जिसकी डालियाँ छाया-सी कोमल और फल अमृत-से शीतल थे। इसी वृक्ष को आमलक अर्थात् आँवले का वृक्ष कहा गया। ब्रह्मा जी ने देखा कि यह वृक्ष किसी और का नहीं, स्वयं श्रीहरि का अत्यंत प्रिय है।',
          'भगवान विष्णु तब उसी वृक्ष के समीप प्रकट हुए और बोले, ‘यह आमलक मुझे प्राणों के समान प्रिय है। जो इसकी छाया में बैठकर मेरी आराधना करेगा, उसके समस्त पाप भस्म हो जाएँगे और उसे वैकुंठ का मार्ग सुलभ होगा।’ तभी से देवताओं ने इस वृक्ष को पूज्य मानकर इसकी सेवा आरंभ कर दी।',
          'फाल्गुन शुक्ल पक्ष की एकादशी इसी वृक्ष की महिमा से जुड़ गई और आमलकी एकादशी के नाम से प्रसिद्ध हुई। कहा गया कि इस तिथि पर जो भक्त आमलक वृक्ष के मूल में भगवान विष्णु का पूजन करता है, उसे सहस्र गोदान के समान पुण्य प्राप्त होता है।',
        ],
        bodyEn: [
          'At the dawn of creation, when nothing but water spread in every direction and there was no resting place anywhere, Lord Brahma sat upon his lotus and began to meditate upon Lord Vishnu. So profound was his devotion that tears of bliss flowed from his eyes, and those tear-drops fell upon the waters and scattered.',
          'From those very tears of love sprang up a radiant tree, its branches soft as shade and its fruit cool as nectar. This tree came to be called the amalaka, the tree of the amla. Brahma beheld it and knew that this tree belonged to none other than Shri Hari himself, who held it most dear.',
          'Lord Vishnu then appeared beside that tree and said, ‘This amalaka is dear to me as my own life. Whoever sits beneath its shade and worships me, the whole of his sins shall be burnt away, and the path to Vaikuntha shall lie open before him.’ From that time the gods revered the tree as worthy of worship and began to tend it.',
          'The Ekadashi of the bright fortnight of Phalguna became joined to the glory of this tree and grew famous as Amalaki Ekadashi. It was said that on this day, whoever worships Lord Vishnu at the root of the amalaka tree gains merit equal to the gift of a thousand cows.',
        ],
      },
      {
        id: 'raja-chitrasena-ki-bhakti',
        titleHi: 'राजा चित्रसेन की भक्ति',
        titleEn: 'The Devotion of King Chitrasena',
        bodyHi: [
          'वैदिश नामक एक समृद्ध नगर में चित्रसेन नाम का धर्मात्मा राजा राज्य करता था। वह वैष्णव था, सत्य का पालक था, और प्रजा को अपनी संतान के समान मानता था। उसके राज्य में न कोई भूखा सोता था, न कोई अधर्म का आश्रय लेता था; सर्वत्र भगवान विष्णु का नाम गूँजता रहता था।',
          'राजा और उसकी समस्त प्रजा आमलकी एकादशी के व्रत को अत्यंत श्रद्धा से करते थे। उस पवित्र तिथि पर सारा नगर एक विशाल आमलक वृक्ष के नीचे एकत्र होता, उसकी जड़ में कलश स्थापित करता, और भगवान विष्णु की मूर्ति को वहीं विराजमान कर पूजन करता।',
          'उस दिन दीपों की पंक्तियाँ वृक्ष के चारों ओर जगमगाती थीं, शंख और घंटों के स्वर दिशाओं में गूँजते थे, और भक्तजन रात्रि भर जागकर हरि-कीर्तन में लीन रहते थे। वृद्ध और बालक, धनी और निर्धन—सब बिना भेद के उसी वृक्ष की छाया में बैठकर श्रीहरि का स्मरण करते।',
          'एक वर्ष, उसी आमलकी एकादशी की रात्रि को, जब समस्त नगरवासी जागरण में मग्न थे, एक घटना घटी जिसने इस व्रत की अपार महिमा को संसार के सामने प्रकट कर दिया।',
        ],
        bodyEn: [
          'In a prosperous city named Vaidisha there ruled a righteous king called Chitrasena. He was a Vaishnava, a keeper of truth, and he looked upon his subjects as his own children. In his kingdom none went to sleep hungry, none took refuge in wrongdoing; everywhere the name of Lord Vishnu resounded.',
          'The king and all his people kept the vow of Amalaki Ekadashi with the deepest faith. On that holy day the whole city would gather beneath a great amalaka tree, set a sacred pot at its root, and there install an image of Lord Vishnu to be worshipped.',
          'On that day rows of lamps glimmered all around the tree, the notes of conch and bell echoed through every quarter, and the devotees kept vigil through the night, absorbed in the singing of Hari’s glories. The aged and the young, the wealthy and the poor—all without distinction sat in the shade of that tree and remembered Shri Hari.',
          'One year, on the night of that very Amalaki Ekadashi, while all the people of the city were immersed in their vigil, an event took place that revealed to the world the boundless glory of this vow.',
        ],
      },
      {
        id: 'chor-vyadha-ka-aagaman',
        titleHi: 'चोर व्याध का आगमन',
        titleEn: 'The Arrival of the Thieving Hunter',
        bodyHi: [
          'उसी रात्रि एक नीच और क्रूर व्याध, जो चोरी, हिंसा और पाप में डूबा हुआ था, भोजन की खोज में वैदिश नगर की ओर आ निकला। वह जीवन भर निर्दोष प्राणियों का वध करता और परधन हरण करता आया था; उसके हृदय में न दया थी, न धर्म का लेश।',
          'जब वह नगर के निकट पहुँचा तो उसने देखा कि आमलक वृक्ष के चारों ओर असंख्य दीप जल रहे हैं और भीड़ एकत्र है। चोरी के भय से सावधान होकर वह छिपने के लिए उसी वृक्ष की घनी डालियों के पीछे जा बैठा, और रात्रि भर वहीं चुपचाप दुबका रहा।',
          'अनजाने ही वह सारी रात उसी पवित्र आमलक वृक्ष के मूल के पास बना रहा, जहाँ भगवान विष्णु का पूजन चल रहा था। भूख और थकान से उसकी आँखें न लगीं, और इस प्रकार बिना किसी संकल्प के ही उसका अखंड जागरण हो गया।',
          'उसके कानों में रात्रि भर हरि-नाम के स्वर पड़ते रहे, उसकी दृष्टि बार-बार उन दीपों और श्रीहरि की प्रतिमा पर पड़ती रही, और उसकी देह उसी पुण्य-वृक्ष की छाया में डूबी रही। यद्यपि उसका मन पाप से भरा था, उसका शरीर और उसकी निद्राहीन रात्रि अनजाने ही व्रत के अनुष्ठान में सम्मिलित हो गई।',
        ],
        bodyEn: [
          'On that same night a low and cruel hunter, steeped in theft, violence, and sin, came wandering toward the city of Vaidisha in search of food. All his life he had slain innocent creatures and seized the wealth of others; in his heart there was no mercy, not a trace of dharma.',
          'When he drew near the city he saw countless lamps burning all around the amalaka tree and a crowd gathered there. Wary lest he be caught at his thieving, he went and crouched behind the dense branches of that very tree, and through the whole night he stayed hidden there in silence.',
          'Unknowingly he remained all night close to the root of that holy amalaka tree, where the worship of Lord Vishnu was going on. Hunger and weariness kept sleep from his eyes, and thus, without any resolve of his own, he passed the entire night in unbroken vigil.',
          'All night the sounds of Hari’s name fell upon his ears, his gaze returned again and again to those lamps and the image of Shri Hari, and his body remained steeped in the shade of that meritorious tree. Though his mind was filled with sin, his body and his sleepless night had unknowingly joined in the observance of the vow.',
        ],
      },
      {
        id: 'papon-ka-naash',
        titleHi: 'पापों का नाश और मृत्यु',
        titleEn: 'The Destruction of Sins and Death',
        bodyHi: [
          'प्रातःकाल होते ही नगरवासी अपने-अपने घर लौट गए, और वह व्याध भी वन की ओर चल पड़ा। उसने उस रात्रि का कोई महत्व न समझा, किंतु आमलक वृक्ष के नीचे किए गए अनजाने जागरण और श्रीहरि के सान्निध्य ने भीतर ही भीतर उसके जन्म-जन्मांतर के पापों को जलाकर भस्म कर डाला।',
          'समय बीतता गया और एक दिन उस व्याध की मृत्यु का क्षण आ पहुँचा। जिसने जीवन भर केवल पाप किए थे, उसके लिए नरक के द्वार खुले प्रतीत होते थे; किंतु आमलकी एकादशी के उस एक जागरण का पुण्य उसके आगे ढाल बनकर खड़ा हो गया।',
          'मृत्यु के पश्चात उसे यातना के लोक में नहीं ले जाया गया। उस एक पवित्र रात्रि के प्रभाव से उसके समस्त पाप पहले ही धुल चुके थे, और श्रीहरि की कृपा ने उसके अगले जन्म का मार्ग उज्ज्वल कर दिया।',
          'इसी पुण्य के बल पर वह अगले जन्म में विदुरथ नामक राजा के घर तेजस्वी पुत्र के रूप में जन्मा, जिसका नाम वसुरथ रखा गया। पूर्वजन्म का चोर व्याध अब एक धर्मनिष्ठ राजकुमार बनकर संसार में आया।',
        ],
        bodyEn: [
          'As dawn broke, the people of the city returned to their homes, and the hunter too set off toward the forest. He understood nothing of the worth of that night, yet the vigil he had unknowingly kept beneath the amalaka tree, and the nearness of Shri Hari, had silently burnt to ashes the sins of his many lifetimes.',
          'Time passed, and one day the moment of the hunter’s death drew near. For one who had done nothing but sin all his life, the gates of hell seemed to lie open; but the merit of that single vigil of Amalaki Ekadashi rose up before him like a shield.',
          'After his death he was not led to the worlds of torment. By the power of that one holy night his every sin had already been washed away, and the grace of Shri Hari brightened the path of his next birth.',
          'By the strength of this merit he was born in his next life as a radiant son in the house of a king named Viduratha, and was given the name Vasuratha. The thieving hunter of his former life now came into the world as a prince devoted to dharma.',
        ],
      },
      {
        id: 'vasuratha-ka-rajya-aur-phala',
        titleHi: 'वसुरथ का राज्य और व्रत का फल',
        titleEn: 'Vasuratha’s Reign and the Fruit of the Vow',
        bodyHi: [
          'वसुरथ बड़ा होकर एक प्रतापी और न्यायप्रिय राजा बना। वह प्रजा का पालन पुत्रवत करता, दीन-दुखियों की रक्षा करता, और भगवान विष्णु की अनन्य भक्ति में रत रहता। उसके राज्य में धर्म की ध्वजा सदा फहराती रही।',
          'एक बार आखेट के समय वह वन में मार्ग भटक गया और थककर एक वृक्ष के नीचे सो गया। उसी समय कुछ क्रूर म्लेच्छ डाकू उसे अकेला और निद्रित देखकर शस्त्र लेकर उस पर टूट पड़े, और उसका वध करने को उद्यत हुए।',
          'किंतु जैसे ही उन्होंने प्रहार करना चाहा, उनके शस्त्र निष्फल होकर गिर पड़े। तभी सोते हुए राजा की देह से एक दिव्य तेजस्वी शक्ति प्रकट हुई, जिसने पलक झपकते ही उन समस्त डाकुओं का संहार कर दिया। जागने पर राजा ने अपने चारों ओर शत्रुओं को मरा हुआ पाया और आश्चर्य से सोचने लगा कि किसने उसकी रक्षा की।',
          'तभी आकाशवाणी हुई, ‘हे राजन, तुम्हारी रक्षा करने वाला और कोई नहीं, स्वयं भगवान विष्णु हैं। पूर्वजन्म में तुमने अनजाने ही आमलकी एकादशी का जागरण किया था, और उसी व्रत के पुण्य ने आज तुम्हारे प्राणों की रक्षा की।’ यह सुनकर वसुरथ का हृदय भक्ति से भर उठा।',
          'तब से राजा वसुरथ ने जीवन भर पूर्ण श्रद्धा से आमलकी एकादशी का व्रत किया और अपनी प्रजा को भी इसका माहात्म्य सुनाया। जिसने एक अनजाने जागरण मात्र से चोर को राजा बना दिया, वही आमलकी एकादशी आज भी श्रद्धा से व्रत रखने वालों के पाप हरती है, उनकी रक्षा करती है, और उन्हें अंत में श्रीहरि के परम धाम तक पहुँचाती है।',
        ],
        bodyEn: [
          'Vasuratha grew up to become a mighty and justice-loving king. He cared for his people as a father for his children, protected the poor and the suffering, and remained absorbed in steadfast devotion to Lord Vishnu. In his kingdom the banner of dharma flew forever high.',
          'Once, while hunting, he lost his way in the forest and, weary, lay down to sleep beneath a tree. At that moment some cruel mlechchha bandits, seeing him alone and asleep, fell upon him with their weapons and made ready to slay him.',
          'But the instant they tried to strike, their weapons turned useless and dropped from their hands. Just then a divine, radiant power arose from the body of the sleeping king and, in the blink of an eye, destroyed all those bandits. When the king awoke he found his enemies dead all around him and wondered in amazement who it was that had saved him.',
          'Then a voice spoke from the sky: ‘O king, the one who has protected you is none other than Lord Vishnu himself. In a former life you unknowingly kept the vigil of Amalaki Ekadashi, and it is the merit of that very vow that has guarded your life today.’ Hearing this, Vasuratha’s heart was filled with devotion.',
          'From that time King Vasuratha kept the vow of Amalaki Ekadashi all his life with complete faith and proclaimed its glory to his people as well. That same Amalaki Ekadashi, which turned a thief into a king through a single unknowing vigil, still today removes the sins of those who keep the vow with faith, protects them, and leads them at last to the supreme abode of Shri Hari.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'rama-ekadashi-katha',
    titleHi: 'रमा एकादशी व्रत कथा',
    titleEn: 'Rama Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/rama-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'muchukunda-and-chandrabhaga',
        titleHi: 'राजा मुचुकुन्द और चन्द्रभागा',
        titleEn: 'King Muchukunda and Chandrabhaga',
        bodyHi: [
          'पुराने समय में मुचुकुन्द नाम के एक प्रतापी राजा राज्य करते थे, जिनकी मित्रता स्वयं देवराज इन्द्र, यम, वरुण और कुबेर जैसे लोकपालों से थी। वे सत्यवादी, विष्णुभक्त और धर्म पर अटल रहने वाले शासक थे, और उनके राज्य में किसी ने कभी एकादशी के पवित्र नियम का उल्लंघन नहीं किया। राजा ने अपनी प्रजा को आदेश दे रखा था कि उनके राज्य में सब लोग, स्त्री और पुरुष, एकादशी का व्रत श्रद्धापूर्वक रखें।',
          'उसी राजा की एक पुत्री थी, जिसका नाम चन्द्रभागा था — वही नाम जो आगे चलकर एक पवित्र नदी को मिला। वह बचपन से ही पिता के समान विष्णु में अनुरक्त थी और एकादशी के व्रत को प्राणों से अधिक प्रिय मानती थी। जब वह विवाह योग्य हुई, तो राजा ने उसका विवाह राजा चन्द्रसेन के पुत्र शोभन के साथ कर दिया।',
          'शोभन गुणवान, सुन्दर और सद्वृत्ति वाला राजकुमार था, परन्तु उसका शरीर अत्यन्त दुर्बल था। थोड़ी-सी भूख भी वह सह नहीं पाता था, और एक दिन का उपवास भी उसके लिए कठिन परीक्षा बन जाता था। विवाह के बाद जब वह कुछ समय अपने श्वशुर मुचुकुन्द के नगर में रहने आया, तब उसके मन में एक भारी चिन्ता बैठ गई।',
        ],
        bodyEn: [
          'In ancient times there reigned a mighty king named Muchukunda, who counted among his friends the very guardians of the worlds — Indra the lord of the gods, along with Yama, Varuna and Kubera. He was truthful, a devotee of Vishnu, and unshakeable in dharma, and in his realm no one ever broke the sacred discipline of Ekadashi. The king had decreed that throughout his kingdom all his people, women and men alike, should keep the Ekadashi fast with devotion.',
          'That king had a daughter named Chandrabhaga — the very name that a holy river would later bear. From childhood she was, like her father, devoted to Vishnu, and she held the vow of Ekadashi dearer than her own life. When she came of age, the king gave her in marriage to Shobhana, the son of King Chandrasena.',
          'Shobhana was a virtuous, handsome prince of gentle nature, yet his body was exceedingly frail. He could not endure even a little hunger, and a single day\'s fasting became a severe trial for him. After the wedding, when he came to stay for a time in the city of his father-in-law Muchukunda, a heavy worry settled into his heart.',
        ],
      },
      {
        id: 'the-coming-of-rama-ekadashi',
        titleHi: 'रमा एकादशी का आगमन',
        titleEn: 'The Coming of Rama Ekadashi',
        bodyHi: [
          'कार्तिक मास के कृष्ण पक्ष में जब रमा एकादशी निकट आई, तो सारे नगर में घोषणा करा दी गई कि इस दिन कोई भी अन्न ग्रहण न करे। यह सुनकर शोभन का हृदय काँप उठा, क्योंकि वह जानता था कि एक दिन की भूख भी उसके दुर्बल शरीर के लिए असह्य है। वह चन्द्रभागा के पास गया और बोला, ‘प्रिये, अब मैं क्या करूँ? यदि मैं भोजन करता हूँ तो तुम्हारे पिता की मर्यादा टूटेगी, और यदि उपवास करता हूँ तो मेरे प्राण ही संकट में पड़ जाएँगे। मुझे ऐसा उपाय बताओ जिससे दोनों की रक्षा हो।’',
          'चन्द्रभागा ने स्नेह और दृढ़ता से उत्तर दिया, ‘हे स्वामी! मेरे पिता के राज्य में तो हाथी, घोड़े और पशु तक इस दिन अन्न नहीं खाते — फिर मनुष्य कैसे खाए? यदि आपको अपने श्वशुर के घर में बैठकर भोजन करना ही है, तो उससे अच्छा है कि आप अपने नगर लौट जाएँ। निर्णय आपके हाथ में है, परन्तु इस पवित्र व्रत को त्यागना उचित नहीं।’',
          'पत्नी के वचन सुनकर शोभन ने मन में संकल्प कर लिया कि चाहे जो हो, वह रमा एकादशी का व्रत अवश्य रखेगा। उसने कहा, ‘तुम ठीक कहती हो। मैं उपवास करूँगा और जो विधाता के मन में होगा, वही होगा।’ इस प्रकार उस दुर्बल राजकुमार ने भगवान विष्णु का स्मरण करते हुए दृढ़ता से व्रत आरम्भ कर दिया।',
        ],
        bodyEn: [
          'When Rama Ekadashi, falling in the dark fortnight of the month of Kartika, drew near, a proclamation went out through the whole city that on this day no one was to partake of any grain. Hearing this, Shobhana\'s heart trembled, for he knew that even one day\'s hunger was unbearable for his weak frame. He went to Chandrabhaga and said, ‘Beloved, what am I to do now? If I eat, the honour of your father will be broken; and if I fast, my very life will be in peril. Show me some path by which both may be preserved.’',
          'With affection and firmness Chandrabhaga answered, ‘O my lord, in my father\'s realm even the elephants, the horses and the beasts take no grain on this day — how then shall a man eat? If you must sit in your father-in-law\'s house and take food, it would be better that you return to your own city. The choice is yours, yet it is not right to abandon this sacred vow.’',
          'Hearing his wife\'s words, Shobhana resolved within himself that, come what may, he would surely keep the vow of Rama Ekadashi. He said, ‘You speak truly. I shall fast, and whatever lies in the will of the Creator, that alone shall come to pass.’ And so, remembering Lord Vishnu, that frail prince began the vow with firm resolve.',
        ],
      },
      {
        id: 'the-fast-and-the-passing',
        titleHi: 'व्रत और शोभन का देहान्त',
        titleEn: 'The Fast and Shobhana\'s Passing',
        bodyHi: [
          'सूर्य के उदय होने से लेकर अस्त होने तक, और फिर रात्रि के जागरण में भी, शोभन ने अन्न और जल का स्पर्श नहीं किया। उसने भगवान विष्णु का नाम जपते हुए सम्पूर्ण दिन और रात बिताई, परन्तु उसका कोमल शरीर इस कठोर तप को सहन न कर सका। ज्यों-ज्यों रात गहराती गई, उसकी देह क्षीण होती गई।',
          'द्वादशी का सूर्य उदय हुआ, पर शोभन उसे देखने के लिए जीवित न रहा। व्रत के पारण से पहले ही, भगवान का स्मरण करते-करते उसके प्राण देह छोड़ गए। चन्द्रभागा शोक में डूब गई, परन्तु उसने धैर्य नहीं खोया — उसने अपने पति का विधिपूर्वक दाह-संस्कार किया और पिता के घर ही रहकर अपने एकादशी व्रत के नियम पर अटल रही।',
          'किन्तु जिस व्रत ने उसके दुर्बल शरीर से प्राण ले लिए थे, उसी रमा एकादशी के अक्षय पुण्य ने शोभन के लिए एक अद्भुत द्वार खोल दिया। उस एक दिन के निष्ठापूर्ण उपवास का फल इतना महान था कि मृत्यु उसके लिए अन्त नहीं, बल्कि एक दिव्य आरम्भ बन गई।',
        ],
        bodyEn: [
          'From the rising of the sun to its setting, and through the vigil of the night as well, Shobhana touched neither food nor water. He passed the whole day and night chanting the name of Lord Vishnu, yet his tender body could not endure so harsh an austerity. As the night deepened, his frame grew ever weaker.',
          'The sun of Dvadashi rose, but Shobhana did not live to see it. Even before the breaking of the fast, while still remembering the Lord, the life left his body. Chandrabhaga sank into grief, yet she did not lose her composure — she performed her husband\'s last rites according to custom and, remaining in her father\'s house, held unshaken to her own discipline of the Ekadashi vow.',
          'But the very fast that had drawn the life from his frail body — that same Rama Ekadashi, by its imperishable merit, opened a wondrous door for Shobhana. So great was the fruit of that one day of faithful fasting that death became for him not an ending, but a divine beginning.',
        ],
      },
      {
        id: 'the-city-on-mount-mandara',
        titleHi: 'मन्दराचल पर दिव्य नगरी',
        titleEn: 'The City on Mount Mandara',
        bodyHi: [
          'रमा एकादशी के पुण्य-प्रभाव से शोभन को मन्दराचल पर्वत के शिखर पर एक अलौकिक नगरी प्राप्त हुई। वह नगरी सोने और रत्नों से जगमगाती थी, उसके स्तम्भ मणि-माणिक्य के थे, और उसमें कल्पवृक्षों की छाया तथा अप्सराओं का संगीत भरा था। शोभन वहाँ एक देव-राजकुमार के समान सिंहासन पर विराजमान था, और देवता भी उसके वैभव को देखकर चकित रह जाते थे।',
          'कुछ समय बाद मुचुकुन्द के नगर का सोमशर्मा नाम का एक ब्राह्मण तीर्थयात्रा करता हुआ मन्दराचल के मार्ग से जा रहा था। वहाँ उसने उस तेजोमय नगरी और उसके स्वामी को देखा, और पहचान लिया कि यह तो राजा मुचुकुन्द का जामाता शोभन है, जिसका देहान्त हो चुका था। आश्चर्य में पड़कर वह शोभन के पास पहुँचा।',
          'शोभन ने ब्राह्मण को आदर से बिठाया और कहा, ‘हे विप्र! यह सम्पूर्ण वैभव मुझे रमा एकादशी के उस एक व्रत के फल से मिला है, जिसे मैंने श्रद्धा से रखा था। परन्तु एक दुःख है — मैंने वह व्रत बिना दृढ़ श्रद्धा के, केवल विवशता में रखा था, इसलिए यह नगरी अस्थिर है और किसी भी क्षण विलीन हो सकती है। कृपया मेरी पत्नी चन्द्रभागा को यह सब कह सुनाइए।’',
        ],
        bodyEn: [
          'By the meritorious power of Rama Ekadashi, Shobhana obtained an unearthly city upon the summit of Mount Mandara. That city glittered with gold and jewels, its pillars were of gems and rubies, and it was filled with the shade of wish-granting trees and the music of celestial nymphs. There Shobhana sat enthroned like a prince among the gods, and even the deities marvelled to behold his splendour.',
          'Some time afterward, a brahmin named Somasharma from Muchukunda\'s city, while journeying to the holy places, happened to pass by the path of Mount Mandara. There he beheld that luminous city and its lord, and recognised that this was none other than Shobhana, the son-in-law of King Muchukunda, who had died. Filled with wonder, he approached him.',
          'Shobhana seated the brahmin with honour and said, ‘O brahmin, all this splendour has come to me from the fruit of that single vow of Rama Ekadashi which I kept with faith. Yet one sorrow remains — I observed that vow without firm devotion, only out of constraint, and so this city is unstable and may dissolve at any moment. I beg you, recount all of this to my wife Chandrabhaga.’',
        ],
      },
      {
        id: 'chandrabhaga-makes-it-enduring',
        titleHi: 'चन्द्रभागा से नगरी का स्थायित्व',
        titleEn: 'Chandrabhaga Makes the City Enduring',
        bodyHi: [
          'तीर्थयात्रा से लौटकर सोमशर्मा ने मुचुकुन्द के नगर में जाकर चन्द्रभागा को सारा वृत्तान्त कह सुनाया — मन्दराचल की दिव्य नगरी, उसका डगमगाता वैभव, और शोभन की वह विनती। यह सुनकर चन्द्रभागा का मुख प्रसन्नता और प्रेम से खिल उठा। उसने कहा, ‘हे विप्र! जो आपने कहा वह मुझे स्वप्न नहीं, सत्य प्रतीत होता है। मुझे शीघ्र अपने पति के पास ले चलिए, मैं उस नगरी को अक्षय बना दूँगी।’',
          'ब्राह्मण उसे मन्दराचल की तलहटी में स्थित वामदेव ऋषि के आश्रम तक ले गया। ऋषि के मन्त्र-जल के स्पर्श और चन्द्रभागा के आजन्म एकादशी-व्रत के पुण्य-प्रभाव से उसका शरीर दिव्य हो गया, और वह सहज ही पर्वत-शिखर पर पहुँच गई। शोभन ने अपनी प्रिया को आते देखा तो हर्ष से उसका स्वागत किया और अपने अर्ध-सिंहासन पर बिठाया।',
          'तब चन्द्रभागा ने प्रेम से कहा, ‘स्वामी! आठ वर्ष की आयु से लेकर आज तक मैंने जो एकादशी-व्रत किए हैं, उन सबका पुण्य मैं आपको अर्पित करती हूँ। इस पुण्य के बल से यह नगरी सदा अचल और अक्षय रहे।’ उसके इतना कहते ही वह डगमगाती नगरी अटल हो गई, और दोनों दम्पति दिव्य भोगों का उपभोग करते हुए दीर्घकाल तक वहाँ आनन्द से रहे।',
          'इसीलिए कहा जाता है कि कार्तिक कृष्ण पक्ष की यह रमा एकादशी समस्त पापों को हर लेने वाली और मनोवांछित फल देने वाली है। जो भक्त श्रद्धापूर्वक इसका व्रत करता है, उसके पाप चिन्तामणि के समान दूर हो जाते हैं, उसे इस लोक में सुख और अन्त में भगवान विष्णु का परम धाम प्राप्त होता है — यही इस व्रत का अक्षय फल है।',
        ],
        bodyEn: [
          'Returning from his pilgrimage, Somasharma went into Muchukunda\'s city and recounted the whole tale to Chandrabhaga — the divine city upon Mount Mandara, its trembling splendour, and Shobhana\'s plea. Hearing this, Chandrabhaga\'s face blossomed with joy and love. She said, ‘O brahmin, what you have told me seems not a dream but the truth. Take me swiftly to my husband, and I shall make that city imperishable.’',
          'The brahmin led her to the hermitage of the sage Vamadeva at the foot of Mount Mandara. By the touch of the sage\'s consecrated water and by the meritorious power of Chandrabhaga\'s lifelong Ekadashi vows, her body became divine, and she rose easily to the mountain\'s summit. When Shobhana saw his beloved approaching, he welcomed her with delight and seated her upon half of his own throne.',
          'Then Chandrabhaga said lovingly, ‘My lord, all the merit of the Ekadashi vows that I have kept from the age of eight until this very day, I offer to you. By the strength of this merit, may this city remain forever steadfast and imperishable.’ The moment she spoke these words, that swaying city became fixed and firm, and the couple, enjoying divine delights, dwelt there together in bliss for a long age.',
          'For this reason it is said that this Rama Ekadashi of the dark fortnight of Kartika carries away all sins and grants the heart\'s desired fruit. The devotee who keeps its vow with faith finds his sins fall away like a wish-fulfilling gem driving off want; he gains happiness in this world and, in the end, the supreme abode of Lord Vishnu — and this is the imperishable fruit of the vow.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'parivartini-ekadashi-katha',
    titleHi: 'परिवर्तिनी एकादशी व्रत कथा',
    titleEn: 'Parivartini Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/parivartini-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'yudhishthiras-question',
        titleHi: 'युधिष्ठिर का प्रश्न',
        titleEn: 'Yudhishthira\'s Question',
        bodyHi: [
          'द्वापर युग की एक सन्ध्या में, धर्मराज युधिष्ठिर भगवान श्रीकृष्ण के समीप हाथ जोड़कर बैठे थे और उनके मुख की ओर श्रद्धा से निहार रहे थे। ‘हे जनार्दन!’ उन्होंने विनम्र स्वर में पूछा, ‘भाद्रपद मास के शुक्ल पक्ष में जो एकादशी आती है, उसका क्या नाम है, उसका विधान क्या है, और उसके व्रत से कौन-सा फल मिलता है? कृपा करके मुझे विस्तार से सुनाइए।’',
          'श्रीकृष्ण मन्द-मन्द मुस्कुराए और बोले, ‘हे राजन्! जो प्रश्न तुमने पूछा है, वही प्रश्न एक बार स्वयं ब्रह्मा जी ने देवर्षि नारद से सुना था। यह एकादशी अत्यन्त पुण्यदायिनी है, और इसी दिन चातुर्मास की योगनिद्रा में शयन करते हुए मैं अपनी करवट बदलता हूँ — इसी कारण इसे परिवर्तिनी एकादशी कहते हैं। इसे जयन्ती और वामन एकादशी के नाम से भी जाना जाता है।’',
          '‘इस व्रत के पुण्य से मनुष्य के समस्त पाप नष्ट हो जाते हैं और अन्त में वह वैकुण्ठ धाम को प्राप्त होता है। इसकी महिमा समझाने के लिए मैं तुम्हें वही पावन कथा सुनाता हूँ, जो वामन अवतार और दानवराज बलि से सम्बन्धित है। ध्यान से सुनो।’',
        ],
        bodyEn: [
          'On an evening of the Dvapara age, the righteous king Yudhishthira sat beside Lord Shri Krishna with folded hands, gazing reverently upon his face. ‘O Janardana!’ he asked in a humble voice, ‘What is the name of the Ekadashi that falls in the bright fortnight of the month of Bhadrapada, what is its observance, and what fruit is gained by its vow? Be gracious and tell me in full.’',
          'Shri Krishna smiled gently and said, ‘O king! The very question you ask was once put by Brahma himself to the divine sage Narada. This Ekadashi is supremely meritorious, and on this day, while I sleep in the yogic slumber of Chaturmasa, I turn from one side to the other — and for this reason it is called Parivartini, the Turning One. It is also known as Jayanti and as Vamana Ekadashi.’',
          '‘By the merit of this vow all the sins of a person are destroyed, and in the end he attains the abode of Vaikuntha. To make its glory clear to you, I shall tell you that very sacred tale, which concerns the Vamana incarnation and Bali, the king of the demons. Listen with care.’',
        ],
      },
      {
        id: 'king-bali-conquers-the-worlds',
        titleHi: 'दानवराज बलि का त्रिलोक-विजय',
        titleEn: 'King Bali Conquers the Three Worlds',
        bodyHi: [
          'श्रीकृष्ण ने कथा आरम्भ करते हुए कहा — प्राचीन काल में बलि नाम का एक दानवराज हुआ, जो प्रह्लाद का पौत्र था। वह असुर-कुल में जन्मा अवश्य था, पर परम दानी, सत्यनिष्ठ और मेरा अनन्य भक्त था। उसने अनेक यज्ञ किए, ब्राह्मणों को मुक्त हस्त से दान दिया, और अपने तप तथा पराक्रम से ऐसी शक्ति अर्जित कर ली कि उसके सामने कोई टिक न सका।',
          'अपने बाहुबल और बढ़ते अहंकार के बल पर बलि ने स्वर्ग पर चढ़ाई कर दी। उसने देवराज इन्द्र को परास्त कर दिया और तीनों लोकों — स्वर्ग, पृथ्वी और पाताल — पर अपना अधिकार जमा लिया। पराजित देवता अपना वैभव खोकर इधर-उधर भटकने लगे और अन्त में वे अपने स्वामी की शरण में पहुँचे।',
          'देवताओं ने हाथ जोड़कर मुझसे प्रार्थना की, ‘हे प्रभो! बलि ने हमारा सर्वस्व छीन लिया है और हम अपने ही धाम से बहिष्कृत हो गए हैं। आप ही हमारे रक्षक हैं — कृपा करके इस संकट से हमारा उद्धार कीजिए।’ देवताओं की दीन पुकार सुनकर मैंने उनकी रक्षा करने का निश्चय किया।',
        ],
        bodyEn: [
          'Shri Krishna began the tale, saying — In ancient times there was a demon-king named Bali, the grandson of Prahlada. Though born indeed into the line of the asuras, he was supremely charitable, steadfast in truth, and a devotee wholly devoted to me. He performed many sacrifices, gave alms to the brahmins with an open hand, and through his austerity and valour acquired such power that none could stand against him.',
          'On the strength of his mighty arms and his swelling pride, Bali launched an assault upon heaven. He vanquished Indra, the king of the gods, and seized dominion over all three worlds — heaven, earth, and the netherworld. The defeated gods, stripped of their splendour, wandered here and there, and at last came to take refuge with their lord.',
          'Folding their hands, the gods prayed to me, ‘O Lord! Bali has snatched away all that was ours, and we have been cast out of our own realm. You alone are our protector — be gracious and deliver us from this calamity.’ Hearing the gods\' piteous cry, I resolved to protect them.',
        ],
      },
      {
        id: 'the-dwarf-comes-to-the-sacrifice',
        titleHi: 'वामन रूप में यज्ञशाला में आगमन',
        titleEn: 'The Dwarf Comes to the Sacrifice',
        bodyHi: [
          'देवताओं की रक्षा के लिए मैंने वामन का रूप धारण किया — एक छोटे, ब्रह्मचारी बटु का रूप, जिसके हाथ में दण्ड और कमण्डल था और मुख पर अपूर्व तेज। उन्हीं दिनों दानवराज बलि नर्मदा के तट पर एक महान अश्वमेध यज्ञ कर रहा था, और उसने घोषणा कर रखी थी कि जो भी याचक आएगा, वह उसे खाली हाथ न लौटाएगा।',
          'वामन रूप धारी मैं धीरे-धीरे चलता हुआ उस यज्ञशाला में जा पहुँचा। मेरे छोटे-से रूप में छिपे दिव्य तेज को देखकर बलि अपने सिंहासन से उठा, उसने आदरपूर्वक मेरे चरण पखारे और हाथ जोड़कर कहा, ‘हे ब्राह्मण-कुमार! आपका आगमन मेरे लिए परम सौभाग्य है। आप जो माँगेंगे, वही मैं आपको दूँगा — चाहे वह स्वर्ण हो, गाएँ हों, गाँव हों या समस्त पृथ्वी।’',
          'बलि के गुरु शुक्राचार्य ने अपने दिव्य ज्ञान से पहचान लिया कि यह बटु साधारण नहीं, स्वयं विष्णु हैं। उन्होंने बलि को सचेत किया, ‘हे राजन्! यह कोई याचक नहीं, ये साक्षात् भगवान हैं जो तुझसे सब कुछ छीनने आए हैं। इन्हें वचन मत दे।’ परन्तु दानवीर बलि ने हाथ जोड़कर कहा, ‘गुरुदेव! यदि स्वयं भगवान मेरे द्वार पर याचक बनकर आए हैं, तो इससे बड़ा सौभाग्य मेरे लिए और क्या होगा? वचन देकर पीछे हटना मेरे कुल की रीति नहीं।’',
        ],
        bodyEn: [
          'To protect the gods, I took on the form of Vamana — the form of a small celibate boy, a staff and water-pot in his hands and an unearthly radiance upon his face. In those very days King Bali was performing a great horse-sacrifice on the bank of the Narmada, and he had proclaimed that no supplicant who came to him would be turned away empty-handed.',
          'In my dwarf form I walked slowly up to that sacrificial hall. Beholding the divine splendour hidden within my tiny shape, Bali rose from his throne, reverently washed my feet, and said with folded hands, ‘O young brahmin! Your coming is the highest fortune for me. Whatever you ask, that I shall give you — be it gold, or cattle, or villages, or the whole earth.’',
          'Bali\'s preceptor Shukracharya, with his divine sight, recognized that this boy was no ordinary one but Vishnu himself. He warned Bali, ‘O king! This is no supplicant — this is the Lord in person, who has come to take everything from you. Do not give him your word.’ But the generous Bali said with folded hands, ‘Master! If the Lord himself has come to my door as a beggar, what greater fortune could there be for me? To give my word and then draw back is not the way of my house.’',
        ],
      },
      {
        id: 'the-three-strides',
        titleHi: 'तीन पग भूमि का दान',
        titleEn: 'The Gift of Three Strides',
        bodyHi: [
          'तब मैंने मुस्कुराते हुए कहा, ‘हे राजन्! मुझे न स्वर्ण चाहिए, न गाँव, न राज्य। मैं तो केवल अपने पैरों से नापी हुई तीन पग भूमि चाहता हूँ — इतनी ही मेरे लिए पर्याप्त है।’ बलि को यह माँग बहुत छोटी लगी, और उसने हँसकर संकल्प का जल मेरे हाथ पर छोड़ दिया, ‘जैसी आपकी इच्छा, बटुक! तीन पग भूमि आपकी हुई।’',
          'जैसे ही संकल्प पूर्ण हुआ, मेरा वह छोटा-सा वामन रूप विराट हो उठा। एक पग में मैंने सम्पूर्ण पृथ्वी को नाप लिया, दूसरे पग में समस्त स्वर्गलोक और अन्तरिक्ष को ढक लिया — और अब तीसरे पग के लिए कहीं स्थान शेष न रहा। मेरा त्रिविक्रम रूप देखकर सम्पूर्ण ब्रह्माण्ड स्तब्ध रह गया।',
          'मैंने पूछा, ‘हे बलि! दो पगों में ही तेरा सब कुछ नप गया। अब मेरा तीसरा पग कहाँ रखूँ?’ धर्मनिष्ठ बलि ने तनिक भी विचलित हुए बिना, श्रद्धा से सिर झुकाकर कहा, ‘हे प्रभो! जब दोनों लोक आपने ले लिए, तब तीसरा पग रखने को इससे उत्तम कोई स्थान नहीं — आप अपना यह पग मेरे मस्तक पर रखिए।’ बलि की अपूर्व भक्ति और सत्यनिष्ठा देखकर मैं अत्यन्त प्रसन्न हुआ।',
        ],
        bodyEn: [
          'Then, smiling, I said, ‘O king! I wish for no gold, no village, no kingdom. I ask only for three strides of land measured by my own feet — that alone is enough for me.’ The request seemed very small to Bali, and laughing, he poured the water of the vow over my hand, saying, ‘As you wish, little one! Three strides of land are yours.’',
          'The moment the vow was sealed, that tiny dwarf form of mine swelled into the colossal. With one stride I measured the entire earth, with the second I covered all the heavens and the sky — and now no place remained for the third stride. Seeing my form as Trivikrama, the strider of three worlds, the whole universe stood astonished.',
          'I asked, ‘O Bali! In two strides alone everything of yours has been measured. Where now shall I set my third stride?’ Without the slightest wavering, the righteous Bali bowed his head in reverence and said, ‘O Lord! When you have taken both worlds, there is no place better for your third stride than this — set this foot upon my head.’ Seeing Bali\'s matchless devotion and steadfast truth, I was greatly pleased.',
        ],
      },
      {
        id: 'the-lord-turns-in-sleep',
        titleHi: 'पाताल में निवास और करवट का बदलना',
        titleEn: 'The Lord\'s Dwelling in Patala and the Turning in Sleep',
        bodyHi: [
          'मैंने अपना तीसरा पग बलि के मस्तक पर रखकर उसे पाताल लोक में स्थापित कर दिया। फिर भी उसकी दानशीलता और भक्ति से प्रसन्न होकर मैंने उसे पाताल का स्वामी बना दिया और वचन दिया, ‘हे बलि! तेरी भक्ति से बँधकर मैं स्वयं तेरे द्वार पर तेरा रक्षक बनकर निवास करूँगा।’ इस प्रकार देवताओं को उनका स्वर्ग पुनः प्राप्त हो गया और तीनों लोकों में पुनः धर्म की स्थापना हुई।',
          'श्रीकृष्ण ने आगे कहा — ‘हे युधिष्ठिर! चातुर्मास के इन्हीं चार मासों में मैं क्षीरसागर में शेषशय्या पर योगनिद्रा में शयन करता हूँ। भाद्रपद शुक्ल एकादशी के दिन शयन करते-करते मैं अपनी एक करवट से दूसरी करवट बदलता हूँ — इसी परिवर्तन के कारण इस तिथि का नाम परिवर्तिनी एकादशी पड़ा है।’',
          '‘जो भक्त इस दिन निराहार रहकर, श्रद्धापूर्वक मेरे वामन स्वरूप की पूजा करता है, रात्रि में जागरण कर मेरे नाम का स्मरण करता है, और द्वादशी को ब्राह्मणों को भोजन एवं दान देकर व्रत का पारण करता है, उसके सहस्रों जन्मों के पाप क्षीण हो जाते हैं।’',
          '‘ऐसा भक्त इस लोक में सुख, यश और समृद्धि भोगकर अन्त में मेरे परम धाम वैकुण्ठ को प्राप्त होता है। हे राजन्! जैसे राजा बलि ने अपनी अटल भक्ति और सत्य से मुझे प्रसन्न किया, वैसे ही जो इस परिवर्तिनी एकादशी का व्रत करता है, उस पर मेरी कृपा सदैव बनी रहती है — यही इस व्रत का अक्षय फल है।’ श्रीकृष्ण के मुख से यह पावन कथा सुनकर युधिष्ठिर का हृदय परम सन्तोष से भर गया।',
        ],
        bodyEn: [
          'Setting my third stride upon Bali\'s head, I established him in the netherworld, Patala. Yet, pleased by his charity and devotion, I made him the lord of Patala and gave him my word, ‘O Bali! Bound by your devotion, I myself shall dwell at your door as your guardian.’ Thus the gods regained their heaven, and righteousness was once more established throughout the three worlds.',
          'Shri Krishna continued — ‘O Yudhishthira! During these four months of Chaturmasa I sleep in yogic slumber upon the serpent-couch in the Ocean of Milk. On the day of the bright Ekadashi of Bhadrapada, as I sleep, I turn from one side to the other — and on account of this very turning this day has been given the name Parivartini Ekadashi.’',
          '‘The devotee who on this day remains without food, worships my Vamana form with devotion, keeps vigil through the night remembering my name, and on Dvadashi breaks the fast after feeding and giving gifts to the brahmins — the sins of his thousands of births are diminished.’',
          '‘Such a devotee, having enjoyed happiness, fame, and prosperity in this world, attains in the end my supreme abode of Vaikuntha. O king! Just as King Bali pleased me by his unshakable devotion and truth, so too upon whoever observes this Parivartini Ekadashi my grace ever rests — this is the imperishable fruit of the vow.’ Hearing this sacred tale from the mouth of Shri Krishna, the heart of Yudhishthira was filled with the deepest contentment.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'papankusha-ekadashi-katha',
    titleHi: 'पापांकुशा एकादशी व्रत कथा',
    titleEn: 'Papankusha Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/papankusha-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'krodhana-the-hunter-of-the-vindhyas',
        titleHi: 'विन्ध्य का क्रूर बहेलिया क्रोधन',
        titleEn: 'Krodhana, the Cruel Hunter of the Vindhyas',
        bodyHi: [
          'विन्ध्याचल की घनी अँधेरी घाटियों में, जहाँ दिन में भी सूरज की किरणें पत्तों के बीच से छनकर बमुश्किल पहुँचती थीं, क्रोधन नाम का एक बहेलिया रहता था। नाम के अनुरूप ही उसका स्वभाव था — क्रोध, हिंसा और निर्दयता उसके रोम-रोम में बसी थी। प्रातः होते ही वह धनुष-बाण उठाता और वन के मूक प्राणियों के पीछे निकल पड़ता।',
          'हिरन, पक्षी, खरगोश — जो भी उसकी दृष्टि में आता, वह उसका वध कर डालता। न उसे किसी प्राणी की पीड़ा का बोध था, न मारने से पहले कोई संकोच। इतना ही नहीं, वह राहगीरों को लूटता, झूठ बोलता, मदिरा पीता और परस्त्री तथा पराये धन पर बुरी दृष्टि रखता। पाप मानो उसके जीवन का एकमात्र व्यवसाय बन गया था।',
          'इसी निष्ठुरता और दुराचार में उसका सारा यौवन बीत गया। न उसने कभी किसी देवता को नमन किया, न किसी तीर्थ का जल छुआ, न किसी साधु के चरणों में बैठा। उसके पाप पर्वत के समान ऊँचे होते चले गए, और काल चुपचाप उसके द्वार की ओर बढ़ता रहा।',
        ],
        bodyEn: [
          'In the dense, shadowy valleys of the Vindhya range — where even by day the rays of the sun could scarcely reach, straining through the leaves — there lived a hunter named Krodhana. His nature matched his name: anger, violence and cruelty dwelt in his very being. At first light he would take up his bow and arrows and set out after the silent creatures of the forest.',
          'Deer, birds, hares — whatever came within his sight, he would slay. He felt neither the pain of any living thing nor the slightest hesitation before he struck. More than this, he robbed travellers, spoke falsehoods, drank liquor, and cast a wicked eye upon the wives and the wealth of others. Sin had become, as it were, the sole occupation of his life.',
          'In this very ruthlessness and wrongdoing his whole youth passed away. He never bowed to a single deity, never touched the water of any holy place, never sat at the feet of any sage. His sins rose high as a mountain, and Death, all the while, drew silently toward his door.',
        ],
      },
      {
        id: 'the-shadow-of-yama',
        titleHi: 'यमदूतों की छाया और भय',
        titleEn: 'The Shadow of Yama\'s Messengers',
        bodyHi: [
          'वर्ष बीतते गए और क्रोधन का शरीर जर्जर हो चला। एक दिन, जब उसकी साँसें उखड़ने को थीं, उसे आभास हुआ कि उसके चारों ओर भयानक आकृतियाँ मँडरा रही हैं। ये यमराज के दूत थे — लाल नेत्रों वाले, हाथों में पाश और दण्ड लिए, उसके पापों का लेखा लेकर उसे लेने आए थे।',
          'उन्हें देखकर वह कठोर बहेलिया, जो जीवन भर किसी से नहीं डरा था, थर-थर काँप उठा। ‘अरे, अब तो मेरे जीवन का एक-एक पाप मेरे सामने आकर खड़ा हो गया है,’ उसने मन ही मन सोचा, ‘इन भयंकर दूतों के हाथों मुझे कैसी-कैसी यातनाएँ भोगनी पड़ेंगी! क्या मेरे उद्धार का कोई मार्ग शेष नहीं रहा?’',
          'मृत्यु के उस क्षण में, पहली बार उसके भीतर पश्चात्ताप की एक चिनगारी जागी। प्राण-रक्षा की व्याकुलता में, काँपते हुए चरणों से वह उठा और उसी वन में स्थित एक तपोवन की ओर दौड़ पड़ा, जहाँ महर्षि अंगिरा का पवित्र आश्रम था।',
        ],
        bodyEn: [
          'The years rolled by and Krodhana\'s body grew frail and worn. One day, as his breath was about to fail, he sensed that terrible figures were hovering all around him. These were the messengers of Yama — red-eyed, bearing nooses and rods in their hands, come to take him away with the full reckoning of his sins.',
          'Seeing them, that hardened hunter, who had feared no one his whole life, began to tremble from head to foot. ‘Alas, now every single sin of my life has risen up and stands before me,’ he thought within himself. ‘What torments shall I have to suffer at the hands of these dreadful messengers! Is there no path of deliverance left for me at all?’',
          'In that moment of death, for the very first time a spark of repentance kindled within him. Frantic to save his life, he rose on trembling feet and ran toward a grove of penance set within that same forest, where stood the holy hermitage of the great sage Angira.',
        ],
      },
      {
        id: 'at-the-feet-of-angira',
        titleHi: 'महर्षि अंगिरा के चरणों में',
        titleEn: 'At the Feet of the Sage Angira',
        bodyHi: [
          'आश्रम के द्वार पर पहुँचकर क्रोधन महर्षि अंगिरा के चरणों में गिर पड़ा। उसकी आँखों से आँसू बह निकले और कण्ठ रुँध गया। ‘हे दयानिधि मुनिवर!’ उसने गिड़गिड़ाते हुए कहा, ‘मैंने जीवन भर केवल पाप ही किए हैं — असंख्य निरीह प्राणियों का वध किया, चोरी की, झूठ बोला, और किसी का भला कभी न सोचा।’',
          '‘अब यमराज के दूत मुझे लेने आ खड़े हुए हैं और मेरा हृदय भय से फटा जा रहा है। मेरे पाप इतने हैं कि गिने नहीं जा सकते। हे करुणामय! क्या कोई ऐसा उपाय है जिससे मेरे ये अनगिनत पाप क्षण भर में नष्ट हो जाएँ और मैं इस घोर यातना से बच जाऊँ? मुझ शरणागत की रक्षा कीजिए।’',
          'उस पापी के मुख पर सच्चे पश्चात्ताप और शरणागति के भाव देखकर दयालु मुनि का हृदय द्रवित हो उठा। वे क्षण भर मौन रहे, फिर स्नेहपूर्वक बोले, ‘हे बहेलिया, तेरे भीतर अब भी प्रायश्चित का भाव शेष है — यही तेरे उद्धार का बीज है। शोक मत कर; मैं तुझे वह व्रत बताता हूँ जो बड़े-बड़े पापों के पर्वत को भी भस्म कर देता है।’',
        ],
        bodyEn: [
          'Reaching the gate of the hermitage, Krodhana fell at the feet of the great sage Angira. Tears streamed from his eyes and his throat choked with sobs. ‘O ocean of compassion, great sage!’ he pleaded. ‘All my life I have done nothing but sin — I have slain countless helpless creatures, I have stolen, I have lied, and I have never once thought of another\'s good.’',
          '‘Now the messengers of Yama have come and stand ready to take me away, and my heart is bursting with terror. My sins are so many they cannot be counted. O compassionate one! Is there any means by which these countless sins of mine might be destroyed in an instant, so that I may escape this dreadful torment? Protect me, for I have taken refuge with you.’',
          'Beholding upon that sinner\'s face the marks of true repentance and surrender, the merciful sage\'s heart melted. For a moment he remained silent, and then spoke with affection. ‘O hunter, even now a feeling of atonement remains within you — this is the very seed of your deliverance. Do not grieve; I shall tell you of a vow that burns to ashes even a mountain of the greatest sins.’',
        ],
      },
      {
        id: 'the-vow-that-conquers-sin',
        titleHi: 'पापांकुशा एकादशी का विधान',
        titleEn: 'The Vow That Conquers Sin',
        bodyHi: [
          'महर्षि अंगिरा ने कहा, ‘आश्विन मास के शुक्ल पक्ष में जो एकादशी आती है, वह भगवान विष्णु को अत्यन्त प्रिय है। यही पापांकुशा एकादशी कहलाती है — जैसे अंकुश हाथी को वश में कर लेता है, वैसे ही यह व्रत पापों को वश में करके नष्ट कर देता है। श्रद्धा और पवित्रता के साथ इसका पालन कर।’',
          '‘इस दिन प्रातः स्नान करके शुद्ध हृदय से भगवान विष्णु का पूजन कर, उनके नाम का स्मरण कर, और दिन-रात निराहार रहकर जागरण कर। द्वादशी को ब्राह्मणों को भोजन एवं यथाशक्ति दान देकर व्रत का पारण कर। जो मनुष्य इस व्रत को करता है, उसके सहस्रों जन्मों के पाप विष्णु की कृपा से तत्काल विलीन हो जाते हैं।’',
          '‘इस एकादशी का व्रत करने वाला न केवल स्वयं तरता है, बल्कि अपने माता-पिता और पूर्वजों को भी ऊँची गति प्रदान करता है। यमराज के दूत ऐसे भक्त के पास फटक भी नहीं सकते, और अन्त में उसे भगवान विष्णु का परम धाम प्राप्त होता है। हे क्रोधन, तू अपने शेष जीवन-काल में यही व्रत कर।’',
        ],
        bodyEn: [
          'The great sage Angira said, ‘The Ekadashi that falls in the bright fortnight of the month of Ashwin is exceedingly dear to Lord Vishnu. It is called Papankusha Ekadashi — just as the goad subdues an elephant, so this vow subdues sins and destroys them. Observe it with faith and purity.’',
          '‘On this day bathe at dawn, worship Lord Vishnu with a pure heart, remember his holy name, and keep vigil through day and night without taking food. On the Dvadashi break the fast after feeding the brahmins and giving alms according to your means. For the one who keeps this vow, the sins of a thousand births dissolve at once by the grace of Vishnu.’',
          '‘The one who observes this Ekadashi not only crosses over himself, but also bestows a high destiny upon his mother, his father and his forefathers. The messengers of Yama dare not even approach such a devotee, and in the end he attains the supreme abode of Lord Vishnu. O Krodhana, keep this very vow for the remainder of your days.’',
        ],
      },
      {
        id: 'deliverance-from-yamas-bonds',
        titleHi: 'पापों का नाश और मुक्ति',
        titleEn: 'Deliverance from Yama\'s Bonds',
        bodyHi: [
          'मुनि के वचन क्रोधन के मर्म को छू गए। उसने उसी क्षण संकल्प लिया और पूरे विश्वास के साथ पापांकुशा एकादशी का व्रत किया — आँसुओं से भीगे नेत्रों से भगवान विष्णु का स्मरण करते हुए, अपने सारे दुष्कर्मों का पश्चात्ताप करते हुए, निराहार रहकर रात्रि भर जागरण किया।',
          'व्रत के पुण्य-प्रभाव से एक अद्भुत बात हुई — जो यमदूत पाश लेकर खड़े थे, वे अपना मुँह नहीं उठा सके। पापों का वह पर्वत, जो क्षण भर पहले अटल लगता था, विष्णु के नाम के तेज से भस्म होकर बिखर गया। हाथी को रोकने वाले अंकुश की भाँति इस व्रत ने उसके समस्त पापों को रोककर निर्मूल कर दिया।',
          'अन्त-समय में क्रोधन का मलिन हृदय निर्मल हो उठा। यमदूत लज्जित होकर लौट गए, और उनके स्थान पर भगवान विष्णु के पार्षद दिव्य विमान लेकर उसे लिवाने आए। जो जीवन भर हिंसा में डूबा रहा था, वह बहेलिया भी इस एक व्रत के प्रभाव से उत्तम गति को प्राप्त हुआ।',
          'तभी से कहा जाता है कि जो भी श्रद्धालु आश्विन शुक्ल की इस पापांकुशा एकादशी का व्रत भक्तिपूर्वक करता है, उसके अगणित पाप अंकुश से वश में हुए मतवाले हाथी की भाँति शान्त होकर नष्ट हो जाते हैं; यमलोक की यातना उससे दूर रहती है, और भगवान विष्णु की कृपा से अन्त में उसे परम धाम की प्राप्ति होती है — यही इस व्रत का अक्षय फल कहा गया है।',
        ],
        bodyEn: [
          'The sage\'s words pierced Krodhana to the core. In that very moment he made the resolve and, with complete faith, observed the Papankusha Ekadashi — remembering Lord Vishnu with eyes wet with tears, repenting of all his evil deeds, and keeping vigil through the whole night without food.',
          'By the meritorious power of the vow, a wondrous thing came to pass — the messengers of Yama who had stood ready with their nooses could not so much as lift their faces. That mountain of sins, which a moment before had seemed immovable, was burned to ashes and scattered by the radiance of Vishnu\'s name. Like the goad that halts the elephant, this vow halted his every sin and tore it up by the root.',
          'At the final hour, Krodhana\'s defiled heart became pure and clear. The messengers of Yama withdrew in shame, and in their place the attendants of Lord Vishnu came in a divine chariot to bear him away. Even that hunter, who had spent his whole life sunk in violence, attained the highest destiny through the power of this single vow.',
          'From that time on it is said that whoever observes this Papankusha Ekadashi of the bright fortnight of Ashwin with devotion finds his countless sins grow still and perish — like a maddened elephant subdued by the goad; the torment of Yama\'s realm stays far from him, and in the end, by the grace of Lord Vishnu, he attains the supreme abode — this is declared to be the imperishable fruit of the vow.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'mokshada-ekadashi-katha',
    titleHi: 'मोक्षदा एकादशी व्रत कथा',
    titleEn: 'Mokshada Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/mokshada-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'king-of-champaka',
        titleHi: 'चम्पक नगरी का राजा वैखानस',
        titleEn: 'Vaikhanasa, the King of Champaka',
        bodyHi: [
          'गोकुल जैसी सुन्दर चम्पक नगरी में राजा वैखानस राज्य करते थे। वे धर्म को जानने वाले, सत्यवादी और प्रजा के प्रति वैसे ही वत्सल थे जैसे पिता अपने पुत्रों के प्रति होता है। उनके राज्य में चारों वर्ण अपने-अपने धर्म का पालन करते, वेदों की ध्वनि से नगर गूँजता रहता, और कहीं किसी को भय या अभाव न था।',
          'उसी नगरी में अनेक विद्वान ब्राह्मण निवास करते थे, जो वेद-वेदान्त के पारगामी थे और राजा को नित्य सत्संग और सलाह देते रहते थे। वैखानस उनका आदर करते और स्वयं को प्रजा का सेवक मानकर शासन चलाते थे। ऐसा प्रतीत होता था मानो उस राज्य पर सुख की कोई कमी ही न हो।',
        ],
        bodyEn: [
          'In the beautiful city of Champaka, fair as Gokula, there ruled a king named Vaikhanasa. He was a knower of dharma, truthful in speech, and as tender toward his subjects as a father is toward his own sons. In his realm the four orders each followed their own duty, the chanting of the Vedas resounded through the city, and nowhere did anyone know fear or want.',
          'In that same city dwelt many learned brahmins, masters of the Vedas and the Vedanta, who gave the king holy company and counsel each day. Vaikhanasa honoured them and ruled while regarding himself as the servant of his people. It seemed as though that kingdom suffered no lack of happiness at all.',
        ],
      },
      {
        id: 'the-dream-of-the-father',
        titleHi: 'स्वप्न में पिता की पीड़ा',
        titleEn: 'The Father\'s Anguish in a Dream',
        bodyHi: [
          'एक रात्रि, जब राजा अपने शयनकक्ष में सोए हुए थे, उन्होंने एक भयानक स्वप्न देखा। उन्होंने अपने स्वर्गीय पिता को नरक की यातना में पड़ा देखा — तप्त, क्षीण और दीन। पिता ने हाथ जोड़कर पुकारा, ‘हे पुत्र! मैं अपने पूर्वकर्मों के फल से इस नरक में कष्ट भोग रहा हूँ। यदि तुझमें मेरे प्रति कुछ भी स्नेह है, तो मुझे इस यातना से छुड़ा। तू ही मेरा उद्धार कर सकता है।’',
          'स्वप्न टूटा तो राजा का सारा शरीर पसीने से भीग गया और हृदय काँप उठा। प्रातःकाल होते ही उनकी आँखों से नींद उड़ गई और मन से सुख-शान्ति। ‘धन-वैभव, राज्य और यह सिंहासन सब व्यर्थ है,’ वे सोचने लगे, ‘जब मेरे ही पिता घोर नरक में तड़प रहे हैं। पुत्र होकर भी मैं उनकी रक्षा न कर सका, तो ऐसा जीवन किस काम का?’',
          'उस स्वप्न का स्मरण उन्हें भीतर ही भीतर खाए जा रहा था। न राजसभा में मन लगता, न भोजन में रुचि रहती। अन्ततः उन्होंने निश्चय किया कि वे विद्वान ब्राह्मणों के पास जाकर इस स्वप्न का रहस्य पूछेंगे और पिता के उद्धार का उपाय जानेंगे।',
        ],
        bodyEn: [
          'One night, while the king lay asleep in his chamber, he beheld a terrible dream. He saw his departed father fallen into the torments of hell — scorched, wasted and wretched. Folding his hands, the father cried out, ‘O my son! By the fruit of my former deeds I suffer in this hell. If you bear any love at all toward me, deliver me from this torment. You alone can be my redemption.’',
          'When the dream broke, the king\'s whole body was drenched in sweat and his heart trembled. As morning came, sleep fled from his eyes and peace from his mind. ‘Wealth, splendour, kingdom and this throne are all worthless,’ he began to think, ‘when my own father writhes in dreadful hell. If, even as his son, I could not protect him, of what use is such a life?’',
          'The memory of that dream gnawed at him from within. He found no pleasure in the royal court nor any taste for food. At last he resolved to go to the learned brahmins, to ask the meaning of the dream and to learn the means of his father\'s deliverance.',
        ],
      },
      {
        id: 'counsel-of-sage-parvata',
        titleHi: 'पर्वत मुनि की मन्त्रणा',
        titleEn: 'The Counsel of the Sage Parvata',
        bodyHi: [
          'राजा वैखानस ब्राह्मणों की सभा में पहुँचे और हाथ जोड़कर अपना स्वप्न कह सुनाया। ‘हे विप्रवरो!’ उन्होंने कहा, ‘मैंने अपने पिता को नरक में पड़ा देखा है। वे मुझसे उद्धार की भीख माँगते हैं। मुझे कोई ऐसा उपाय बताइए जिससे मेरे पिता इस यातना से मुक्त हो जाएँ। यदि आवश्यक हो तो मैं अपना समस्त पुण्य भी अर्पित करने को तैयार हूँ।’',
          'उस सभा में पर्वत नामक एक त्रिकालदर्शी मुनि उपस्थित थे, जो भूत, वर्तमान और भविष्य के ज्ञाता थे। उन्होंने क्षण भर अपने दिव्य ज्ञान से राजा के पिता के पूर्वजन्म को देखा और फिर बोले, ‘हे राजन्! तुम्हारे पिता ने पूर्व में एक ऐसा कर्म किया था जिसके कारण वे आज नरक में दण्ड भोग रहे हैं। परन्तु तुम शोक मत करो, क्योंकि उनके उद्धार का एक श्रेष्ठ उपाय है।’',
          '‘मार्गशीर्ष मास के शुक्ल पक्ष की एकादशी,’ मुनि ने कहा, ‘मोक्षदा एकादशी कहलाती है, क्योंकि वह मोक्ष देने वाली है। तुम इस तिथि का व्रत श्रद्धा और विधि से करो, और उससे उपजे समस्त पुण्य को अपने पिता के निमित्त संकल्प करके अर्पित कर दो। उस पुण्य के प्रभाव से तुम्हारे पिता निश्चय ही नरक से मुक्त होकर उत्तम गति को प्राप्त करेंगे।’',
        ],
        bodyEn: [
          'King Vaikhanasa came before the assembly of brahmins and, folding his hands, recounted his dream. ‘O best among the wise!’ he said. ‘I have seen my father fallen into hell. He begs me for deliverance. Tell me some means by which my father may be freed from this torment. If it be needed, I am ready to offer up even all my merit.’',
          'In that assembly was present a sage named Parvata, a seer of the three times, knower of past, present and future. For a moment he gazed with his divine sight into the past birth of the king\'s father, and then he spoke. ‘O king! Your father once committed a deed for which he now undergoes punishment in hell. But do not grieve, for there exists an excellent means of his deliverance.’',
          '‘The Ekadashi of the bright fortnight of the month of Margashirsha,’ said the sage, ‘is called Mokshada Ekadashi, for it bestows liberation. Observe the vow of this day with devotion and according to the rites, and all the merit that arises from it offer up, by solemn resolve, for the sake of your father. By the power of that merit your father shall surely be freed from hell and attain the highest course.’',
        ],
      },
      {
        id: 'the-vow-and-the-gita',
        titleHi: 'व्रत, जागरण और गीता का स्मरण',
        titleEn: 'The Vow, the Vigil, and the Remembrance of the Gita',
        bodyHi: [
          'मुनि के वचन सुनकर राजा का मुख आशा से खिल उठा। वे नगर लौटे और मार्गशीर्ष शुक्ल एकादशी की प्रतीक्षा करने लगे। उस तिथि के आने पर राजा वैखानस ने रानी, पुत्रों और समस्त परिजनों सहित प्रातःकाल स्नान कर शुद्ध वस्त्र धारण किए और भगवान विष्णु की भक्तिपूर्वक पूजा की।',
          'दिनभर उन्होंने अन्न-जल त्यागकर उपवास रखा, भगवान के नाम का जप किया और रात्रि में जागरण करते हुए हरि-कीर्तन में लीन रहे। यह वही पवित्र तिथि थी जिस दिन कुरुक्षेत्र के रणक्षेत्र में भगवान श्रीकृष्ण ने मोहग्रस्त अर्जुन को श्रीमद्भगवद्गीता का अमर उपदेश दिया था — इसीलिए यह दिन गीता जयन्ती के रूप में भी पूजनीय है।',
          'द्वादशी के दिन राजा ने ब्राह्मणों को भोजन कराया, यथाशक्ति दान दिया और फिर व्रत का पारण किया। पारण के पश्चात् उन्होंने मुनि के कथनानुसार अपने इस व्रत से अर्जित समस्त पुण्य हाथ में जल लेकर संकल्पपूर्वक अपने पिता के उद्धार के निमित्त अर्पित कर दिया।',
        ],
        bodyEn: [
          'Hearing the sage\'s words, the king\'s face blossomed with hope. He returned to his city and waited for the bright Ekadashi of Margashirsha. When that day arrived, King Vaikhanasa, together with the queen, his sons and all his household, bathed in the early morning, put on clean garments, and worshipped Lord Vishnu with devotion.',
          'Through the whole day he kept the fast, forsaking food and water, chanted the names of the Lord, and through the night, keeping vigil, remained absorbed in the singing of Hari\'s praises. This was the very same sacred day on which, on the battlefield of Kurukshetra, Lord Krishna had given the deluded Arjuna the immortal teaching of the Bhagavad Gita — and for this reason the day is revered also as Gita Jayanti.',
          'On the day of Dvadashi the king fed the brahmins, gave alms to the best of his power, and then broke his fast. After breaking it, just as the sage had said, he took water into his hand and, with a solemn resolve, offered up all the merit earned by this vow for the sake of his father\'s deliverance.',
        ],
      },
      {
        id: 'the-ancestor-liberated',
        titleHi: 'पिता का उद्धार और व्रत का फल',
        titleEn: 'The Ancestor Liberated and the Fruit of the Vow',
        bodyHi: [
          'ज्यों ही राजा ने अपना पुण्य अर्पित किया, आकाश से पुष्पों की वर्षा होने लगी और दिव्य वाद्य बज उठे। उसी क्षण राजा के पिता नरक के बन्धन से मुक्त होकर दिव्य रूप धारण कर ऊपर उठे। उन्होंने पुत्र को आशीर्वाद देते हुए कहा, ‘हे पुत्र! तेरे इस व्रत के पुण्य से मैं नरक की यातना से छूटकर अब स्वर्गलोक को जा रहा हूँ। तू धन्य है, और धन्य है तेरा यह मोक्षदा एकादशी का व्रत।’',
          'इतना कहकर पिता स्वर्ग की ओर प्रस्थान कर गए, और राजा वैखानस का हृदय अपार सन्तोष और आनन्द से भर गया। जिस शोक ने उनका सुख छीन लिया था, वह अब हर्ष में बदल चुका था, क्योंकि उन्होंने पुत्र होने का सबसे बड़ा धर्म निभा दिया था।',
          'तब से जो भी श्रद्धालु मार्गशीर्ष शुक्ल की इस मोक्षदा एकादशी का व्रत भक्तिपूर्वक करता है, उसके समस्त पाप नष्ट होते हैं, उसके पितर तृप्त होकर सद्गति पाते हैं, और स्वयं वह भी अन्त में मोक्ष को प्राप्त होता है — चिन्तामणि के समान सब कामनाएँ पूर्ण करने वाला यही इस व्रत का परम फल कहा गया है।',
        ],
        bodyEn: [
          'The moment the king offered up his merit, a rain of flowers fell from the sky and divine instruments sounded. In that very instant the king\'s father, freed from the bonds of hell, rose upward in a radiant form. Blessing his son, he said, ‘O my son! By the merit of this vow of yours I am released from the torments of hell and now go to the realm of heaven. Blessed are you, and blessed is this vow of Mokshada Ekadashi.’',
          'Saying this, the father set forth toward heaven, and the heart of King Vaikhanasa was filled with boundless contentment and joy. The sorrow that had stolen his happiness had now turned to delight, for he had fulfilled the highest duty of being a son.',
          'From that time on, whoever observes this Mokshada Ekadashi of the bright fortnight of Margashirsha with devotion has all his sins destroyed; his ancestors, made content, attain a good course; and he himself in the end attains liberation — fulfilling every desire like the wish-granting jewel, this is declared to be the supreme fruit of the vow.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'indira-ekadashi-katha',
    titleHi: 'इन्दिरा एकादशी व्रत कथा',
    titleEn: 'Indira Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/indira-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'king-indrasena-of-mahishmati',
        titleHi: 'महिष्मती के राजा इन्द्रसेन',
        titleEn: 'King Indrasena of Mahishmati',
        bodyHi: [
          'सतयुग की बात है। महिष्मती नामक सुन्दर नगरी में इन्द्रसेन नाम के एक धर्मात्मा राजा राज्य करते थे। उनका कोष धन-धान्य से भरा था, उनके पास हाथी-घोड़े और सेना थी, पुत्र-पौत्रों से उनका कुल सम्पन्न था, और प्रजा उन्हें पिता के समान मानती थी। फिर भी राजा का मन सांसारिक भोगों में नहीं उलझा था — वे प्रतिदिन भगवान विष्णु की आराधना करते और ‘गोविन्द-गोविन्द’ का स्मरण करते हुए अपना समय बिताते थे।',
          'एक दिन राजा अपने राजमहल की सभा में बैठे थे कि आकाश-मार्ग से देवर्षि नारद वीणा बजाते और हरि का गुणगान करते हुए वहाँ उतर आए। मुनि को आते देख राजा सिंहासन से उठ खड़े हुए, उन्हें श्रेष्ठ आसन पर बिठाया, अर्घ्य और पाद्य से उनका पूजन किया और हाथ जोड़कर पूछा, ‘हे देवर्षि! आपका यहाँ पधारना मेरे लिए परम सौभाग्य है। कहिए, किस कारण आपका शुभागमन हुआ?’',
        ],
        bodyEn: [
          'In the age of Satya, in a fair city named Mahishmati, there reigned a righteous king called Indrasena. His treasury overflowed with wealth and grain, he commanded elephants, horses and armies, his line was blessed with sons and grandsons, and his people loved him as a father. Yet the king\'s heart was not tangled in worldly pleasures — each day he worshipped Lord Vishnu and passed his hours remembering the name ‘Govinda, Govinda.’',
          'One day, as the king sat in the assembly of his palace, the divine sage Narada descended through the path of the sky, playing his vina and singing the praises of Hari. Seeing the sage approach, the king rose from his throne, seated him upon a place of honour, worshipped him with offerings of water for his feet and hands, and with folded palms asked, ‘O divine sage! Your coming here is the highest good fortune for me. Tell me, for what reason has your auspicious visit come about?’',
        ],
      },
      {
        id: 'naradas-tidings-from-yamas-realm',
        titleHi: 'नारद का यमलोक का संदेश',
        titleEn: 'Narada\'s Tidings from Yama\'s Realm',
        bodyHi: [
          'नारद मुस्कुराकर बोले, ‘हे राजन्! मेरी बात बड़ी अद्भुत है, सुनो। ब्रह्मलोक से चलकर मैं यमलोक होता हुआ यहाँ आया हूँ। वहाँ मैंने धर्मराज यम को सिंहासन पर विराजमान देखा और उनके पास ही तुम्हारे पिता को भी बैठे पाया। वे धर्मात्मा होते हुए भी पूर्वजन्म के किसी व्रत-भंग के दोष से इस समय यमलोक में रहकर कष्ट भोग रहे हैं।’',
          '‘उन्होंने मुझे पहचानकर बड़े स्नेह से एक संदेश दिया है, और कहा है कि मैं उसे तुम तक पहुँचा दूँ।’ यह सुनते ही राजा इन्द्रसेन का हृदय काँप उठा। हाथ जोड़कर, आँखों में आँसू भरकर उन्होंने कहा, ‘हे मुनिवर! मेरे पिता ने क्या कहा है, शीघ्र बताइए। अपने पिता को संकट में जानकर मैं एक क्षण भी चैन से नहीं बैठ सकता।’',
          'नारद ने कहा, ‘तुम्हारे पिता ने कहलवाया है — हे पुत्र! आश्विन मास के कृष्ण पक्ष में जो इन्दिरा एकादशी आती है, उसका व्रत तुम मेरे निमित्त श्रद्धापूर्वक करो। उस व्रत के पुण्य के प्रभाव से मैं इस यमलोक के कष्ट से मुक्त होकर स्वर्ग को प्राप्त कर सकूँगा। यही मेरी अन्तिम अभिलाषा है।’',
        ],
        bodyEn: [
          'Narada smiled and said, ‘O king! My news is most wondrous, so listen. Setting out from the realm of Brahma, I came here by way of the realm of Yama. There I saw Dharmaraja Yama seated upon his throne, and beside him I found your own father seated too. Though he was a righteous man, on account of some breaking of a vow in a former life, he now dwells in Yama\'s realm and suffers there.’',
          '‘Recognising me, he gave me a message with great affection, and asked that I carry it to you.’ The moment he heard this, the heart of King Indrasena trembled. With folded hands and eyes filling with tears, he said, ‘O great sage! Quickly, tell me what my father has said. Knowing my father to be in distress, I cannot sit in peace for even a single moment.’',
          'Narada said, ‘Your father has sent word — O son! In the dark fortnight of the month of Ashwina there comes the Ekadashi called Indira. Observe its vow with devotion on my behalf. By the power of that vow\'s merit, I shall be freed from the torment of this realm of Yama and may attain heaven. This is my final longing.’',
        ],
      },
      {
        id: 'the-king-asks-the-rite',
        titleHi: 'राजा ने व्रत की विधि पूछी',
        titleEn: 'The King Asks for the Manner of the Vow',
        bodyHi: [
          'पिता का संदेश सुनकर राजा इन्द्रसेन का शोक और भी गहरा हो गया, परन्तु साथ ही उनके मन में एक दृढ़ संकल्प जाग उठा। उन्होंने नारद के चरणों में मस्तक नवाकर कहा, ‘हे दयालु मुनि! आपने मुझ पर बड़ी कृपा की जो यह संदेश यहाँ तक पहुँचाया। अब आप ही मुझे इस इन्दिरा एकादशी के व्रत की पूरी विधि बताइए, जिससे मैं उसमें कोई त्रुटि न करूँ और मेरे पिता का उद्धार हो जाए।’',
          'नारद ने स्नेहपूर्वक कहा, ‘सुनो राजन्! आश्विन कृष्ण पक्ष की दशमी के दिन प्रातः स्नान करके, श्रद्धा और संयम के साथ तुम पितरों का श्राद्ध और तर्पण करना। उस दिन एक बार भोजन करके मन, वचन और कर्म से शुद्ध रहना, और किसी भी प्रकार के विकार को पास न आने देना।’',
          '‘फिर एकादशी के दिन प्रातः उठकर, संकल्प लेकर पूरे दिन निराहार रहना। भगवान विष्णु की प्रतिमा के समक्ष धूप, दीप, गन्ध, पुष्प और नैवेद्य से विधिपूर्वक पूजा करना, श्राद्ध में ब्राह्मणों को भोजन कराना, गायों को ग्रास देना, और सामर्थ्य के अनुसार दान देना। रात्रि में हरि का कीर्तन करते हुए जागरण करना। द्वादशी के दिन ब्राह्मणों को भोजन कराकर तब स्वयं पारण करना। ऐसा करने से तुम्हारे पिता निश्चय ही उद्धार पाएँगे।’',
        ],
        bodyEn: [
          'Hearing his father\'s message, King Indrasena\'s grief deepened further, yet at the same time a firm resolve awoke within him. Bowing his head at Narada\'s feet, he said, ‘O merciful sage! You have shown me great kindness in carrying this message all the way here. Now tell me yourself the full manner of this Indira Ekadashi vow, so that I may make no error in it and my father may be delivered.’',
          'Narada said with affection, ‘Listen, O king! On the tenth day of the dark fortnight of Ashwina, bathe in the morning, and with devotion and self-restraint perform the shraddha and tarpana for your ancestors. On that day take food only once, remain pure in thought, word and deed, and let no manner of impurity come near you.’',
          '‘Then, rising at dawn on the day of Ekadashi, make your resolve and remain without food through the whole day. Before the image of Lord Vishnu, worship him duly with incense, lamp, fragrance, flowers and offerings of food; in the shraddha, feed brahmins, give a morsel to the cows, and offer charity according to your means. Through the night keep vigil, singing the praises of Hari. On the day of Dvadashi, feed the brahmins first, and only then break your own fast. Doing thus, your father shall surely find deliverance.’',
        ],
      },
      {
        id: 'indrasena-observes-the-vow',
        titleHi: 'इन्द्रसेन का व्रत-पालन',
        titleEn: 'Indrasena Observes the Vow',
        bodyHi: [
          'इतना कहकर देवर्षि नारद अन्तर्धान हो गए और अपने लोक को लौट गए। राजा इन्द्रसेन ने मुनि के बताए वचनों को अपने हृदय में धारण कर लिया और निश्चय किया कि वे पूरी निष्ठा से यह व्रत करेंगे। उन्होंने अपने पुत्रों, बन्धुओं, सेवकों और रनिवास की स्त्रियों — सबको बुलाकर सारी बात कह सुनाई, और सबने मिलकर इस व्रत में सम्मिलित होने का संकल्प लिया।',
          'आश्विन कृष्ण पक्ष की दशमी आने पर राजा ने प्रातः स्नान कर पितरों का श्राद्ध और तर्पण किया, एक समय भोजन किया और संयम से रहे। एकादशी के दिन उन्होंने भगवान विष्णु के समक्ष व्रत का संकल्प लिया, दिनभर निर्जल-निराहार रहकर भक्तिपूर्वक पूजा की, धूप-दीप अर्पित किए, ब्राह्मणों को भोजन कराया, गौओं को ग्रास दिया और श्रद्धा से दान बाँटा।',
          'उस रात्रि महिष्मती का सारा राजमहल हरि के नाम से गूँज उठा। दीपों की पंक्तियों के बीच राजा, रानी और प्रजा एक साथ बैठकर भगवान का कीर्तन करते रहे और सारी रात जागरण किया। द्वादशी के दिन प्रातः ब्राह्मणों को भोजन तथा दक्षिणा देकर, उनका आशीर्वाद लेकर राजा ने अन्त में स्वयं पारण किया। उनके मन में एक ही भावना थी — ‘हे प्रभो! इस व्रत का सम्पूर्ण फल मेरे पिता को प्राप्त हो।’',
        ],
        bodyEn: [
          'Having said this, the divine sage Narada vanished and returned to his own realm. King Indrasena held the words the sage had spoken close in his heart and resolved that he would keep this vow with complete devotion. He summoned his sons, his kinsmen, his servants and the women of his household — all of them — and told them the whole matter, and together they all resolved to join in this vow.',
          'When the tenth day of the dark fortnight of Ashwina arrived, the king bathed at dawn and performed the shraddha and tarpana for his ancestors, ate but once, and lived in restraint. On the day of Ekadashi he made his resolve before Lord Vishnu, remained the whole day without water or food, worshipped with devotion, offered incense and lamps, fed the brahmins, gave a morsel to the cows and distributed charity with faith.',
          'That night the whole palace of Mahishmati rang with the name of Hari. Amid rows of lamps the king, the queen and the people sat together singing the Lord\'s praises and kept vigil through the entire night. On the morning of Dvadashi, after feeding the brahmins and giving them gifts and receiving their blessing, the king at last broke his own fast. One feeling alone filled his mind — ‘O Lord! Let the entire fruit of this vow reach my father.’',
        ],
      },
      {
        id: 'the-father-attains-heaven',
        titleHi: 'पिता को स्वर्ग की प्राप्ति',
        titleEn: 'The Father Attains Heaven',
        bodyHi: [
          'व्रत के पुण्य का प्रभाव तत्काल प्रकट हुआ। उसी समय आकाश में दिव्य पुष्पों की वर्षा होने लगी, और राजा इन्द्रसेन के पिता गरुड़ पर आरूढ़ होकर, दिव्य वस्त्र और आभूषणों से सुशोभित होते हुए दिखाई दिए। यमलोक के सारे कष्ट उनसे दूर हट गए थे और उनका मुख प्रसन्नता से दमक रहा था।',
          'अपने पुत्र के व्रत-पुण्य के बल पर वे स्वर्गलोक की ओर जाते हुए बोले, ‘हे पुत्र! तेरा कल्याण हो। तेरी इस भक्ति और निष्ठा से मैं यमलोक के बन्धन से मुक्त होकर अब उत्तम लोक को जा रहा हूँ। तूने पुत्र का धर्म सच्चे अर्थों में निभाया।’ यह कहकर वे भगवान विष्णु के धाम को सिधार गए, और राजा का हृदय कृतज्ञता और आनन्द से भर उठा।',
          'तब से कहा जाता है कि जो भी मनुष्य आश्विन कृष्ण पक्ष की इस इन्दिरा एकादशी का व्रत श्रद्धा और विधिपूर्वक करता है, उसके पितर सद्गति को प्राप्त होते हैं, उसके अपने पाप क्षीण होते हैं, और इस लोक में सुख-समृद्धि भोगकर अन्त में वह स्वयं भी भगवान विष्णु के परमधाम को प्राप्त करता है — यही इस व्रत का अक्षय फल कहा गया है।',
        ],
        bodyEn: [
          'The power of the vow\'s merit revealed itself at once. In that very moment a shower of divine flowers began to fall from the sky, and the father of King Indrasena appeared, mounted upon Garuda, adorned with celestial garments and ornaments. All the torments of Yama\'s realm had fallen away from him, and his face glowed with joy.',
          'Borne toward the realm of the gods upon the strength of his son\'s meritorious vow, he said, ‘O son! May it be well with you. By this devotion and faith of yours, I am freed from the bondage of Yama\'s realm and now go to the highest world. You have fulfilled the duty of a son in its truest sense.’ Saying this, he departed for the abode of Lord Vishnu, and the king\'s heart brimmed with gratitude and joy.',
          'From that time it is said that whoever observes this Indira Ekadashi of the dark fortnight of Ashwina with devotion and in the proper manner, his ancestors attain a blessed destiny, his own sins are diminished, and after enjoying happiness and prosperity in this world he too attains in the end the supreme abode of Lord Vishnu — this is declared to be the imperishable fruit of the vow.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'aja-ekadashi-katha',
    titleHi: 'अजा एकादशी व्रत कथा',
    titleEn: 'Aja Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/aja-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'the-fallen-king',
        titleHi: 'सत्यवादी राजा हरिश्चन्द्र का पतन',
        titleEn: 'The Fall of the Truthful King Harishchandra',
        bodyHi: [
          'सूर्यवंश में हरिश्चन्द्र नाम के एक चक्रवर्ती राजा हुए, जिनके सत्य की कीर्ति तीनों लोकों में फैली हुई थी। कहा जाता था कि चाहे प्राण चले जाएँ, पर हरिश्चन्द्र के मुख से कभी असत्य नहीं निकलता। उनके राज्य में न कोई दुःखी था, न कोई भूखा, और प्रजा उन्हें पिता के समान मानती थी।',
          'एक बार एक प्रतिज्ञा की रक्षा के लिए राजा को अपना सम्पूर्ण राज्य, कोष और वैभव विश्वामित्र मुनि को दान में दे देना पड़ा। दान देने के पश्चात भी जब दक्षिणा की माँग शेष रह गई, तो उसे चुकाने के लिए सत्य के उस पुजारी ने वह कर डाला जो किसी राजा ने न किया होगा — उसने स्वयं को, अपनी पत्नी शैव्या को और अपने नन्हे पुत्र रोहिताश्व को बेच डाला।',
          'रानी और राजकुमार एक ब्राह्मण के यहाँ दास बने, और राजा हरिश्चन्द्र काशी में एक चाण्डाल के हाथ बिक गए। जो कभी स्वर्णमय सिंहासन पर विराजते थे, वे अब श्मशान-घाट पर मुर्दों के दाह का कर वसूलने वाले सेवक बन गए। फिर भी सत्य से उनका मुख नहीं फिरा।',
        ],
        bodyEn: [
          'In the solar dynasty there reigned a sovereign emperor named Harishchandra, whose fame for truthfulness had spread through all the three worlds. It was said that though his very life should depart, never would a falsehood pass from Harishchandra’s lips. In his realm none was sorrowful and none went hungry, and his subjects regarded him as a father.',
          'Once, to safeguard a pledge, the king was obliged to give away his entire kingdom, his treasury and all his splendour as a gift to the sage Vishvamitra. Even after that gift, when a further offering remained to be paid, this devotee of truth did what no king before him would have done — he sold himself, his wife Shaivya and his little son Rohitashva to settle the debt.',
          'The queen and the young prince became servants in the house of a brahmin, while King Harishchandra was sold in Kashi to a keeper of the cremation grounds. He who had once sat upon a golden throne now became a servant collecting the tax for burning the dead upon the funeral ghat. And yet his face never turned away from the truth.',
        ],
      },
      {
        id: 'servitude-at-the-burning-ground',
        titleHi: 'श्मशान में राजा का दुःख',
        titleEn: 'The King\'s Sorrow at the Cremation Ground',
        bodyHi: [
          'चाण्डाल की सेवा में रहते हुए राजा हरिश्चन्द्र के बारह-बारह वर्ष बीत गए। दिन-रात वे श्मशान के द्वार पर खड़े रहते, मुर्दों के साथ आने वालों से कफ़न और दाह का कर माँगते, और मन ही मन अपने भाग्य पर सोचते रहते।',
          '‘हाय! किस पाप का यह फल मैं भोग रहा हूँ?’ राजा विलाप करते, ‘कहाँ वह राज्य, कहाँ वह रानी, कहाँ मेरा प्यारा पुत्र — और कहाँ यह जलती चिताओं की राख से भरा घाट! क्या मैं सचमुच वही हरिश्चन्द्र हूँ, अथवा यह कोई भयानक स्वप्न है?’ इस चिन्ता में उनका शरीर सूख गया था और नेत्रों से आँसू बहते रहते थे।',
          'फिर भी, इतनी विपत्ति में पड़कर भी, राजा ने न तो अपना धर्म छोड़ा और न ही सत्य का मार्ग। वे अपने स्वामी की सेवा निष्ठापूर्वक करते रहे और प्रभु की इच्छा को नतमस्तक होकर स्वीकार करते रहे, इस आशा में कि कभी तो यह अन्धकार की रात बीतेगी।',
        ],
        bodyEn: [
          'While serving the keeper of the cremation grounds, twelve long years passed over King Harishchandra. Day and night he stood at the gateway of the burning ground, demanding from those who came with their dead the tax for the shroud and the fire, and brooding within himself upon his fate.',
          '‘Alas! For what sin am I suffering this fruit?’ the king would lament. ‘Where is that kingdom, where that queen, where my beloved son — and where this ghat heaped with the ash of blazing pyres! Am I truly that same Harishchandra, or is this some dreadful dream?’ With such grief his body had withered, and tears flowed ceaselessly from his eyes.',
          'And yet, fallen into such calamity, the king abandoned neither his duty nor the path of truth. He served his master faithfully and, bowing his head, accepted the will of the Lord, hoping that this night of darkness would one day pass.',
        ],
      },
      {
        id: 'the-sage-gautama-arrives',
        titleHi: 'गौतम ऋषि का आगमन और उपदेश',
        titleEn: 'The Arrival and Counsel of Sage Gautama',
        bodyHi: [
          'एक दिन, जब राजा अपनी दशा पर अत्यन्त दुःखी होकर बैठे थे, उसी मार्ग से महर्षि गौतम वहाँ आ पहुँचे। राजा ने उन तेजस्वी मुनि को देखा तो उनके चरणों में गिर पड़े और हाथ जोड़कर अपनी सारी विपत्ति का वृत्तान्त कह सुनाया।',
          'राजा की करुण कथा सुनकर गौतम मुनि का हृदय द्रवित हो उठा। उन्होंने कहा, ‘हे राजन्, सौभाग्य से इस समय भाद्रपद मास के कृष्ण पक्ष की एकादशी निकट है, जिसे अजा एकादशी कहते हैं। यह व्रत समस्त पापों का नाश करने वाला और परम पुण्यदायी है।’',
          '‘तुम श्रद्धा और नियम के साथ इस अजा एकादशी का व्रत करो,’ मुनि ने आगे कहा, ‘दिनभर उपवास रखकर भगवान विष्णु का पूजन और रात्रि-जागरण करो। इस व्रत के प्रभाव से तुम्हारे सब पाप भस्म हो जाएँगे और तुम्हारी समस्त विपत्तियाँ दूर हो जाएँगी।’ इतना कहकर ऋषि गौतम राजा को आशीर्वाद देकर अन्तर्धान हो गए।',
        ],
        bodyEn: [
          'One day, while the king sat utterly grief-stricken over his condition, along that very road came the great sage Gautama. When the king beheld that radiant sage, he fell at his feet and, with folded hands, recounted to him the whole tale of his misfortune.',
          'Hearing the king’s piteous story, the heart of the sage Gautama melted with compassion. He said, ‘O king, by good fortune the Ekadashi of the dark fortnight of the month of Bhadrapada is now at hand, which is called Aja Ekadashi. This vow destroys all sins and bestows the highest merit.’',
          '‘Observe this Aja Ekadashi with faith and discipline,’ the sage continued. ‘Keep a fast throughout the day, worship Lord Vishnu and keep vigil through the night. By the power of this vow all your sins shall be burned to ashes, and every one of your calamities shall be dispelled.’ Having spoken thus, the sage Gautama blessed the king and vanished from sight.',
        ],
      },
      {
        id: 'the-vow-observed',
        titleHi: 'राजा का व्रत-पालन',
        titleEn: 'The King Observes the Vow',
        bodyHi: [
          'ऋषि के वचनों ने राजा के बुझते हृदय में आशा का दीपक जला दिया। जब अजा एकादशी का दिन आया, तो हरिश्चन्द्र ने श्मशान के समस्त कर्तव्य निभाते हुए भी पूर्ण नियम से उपवास का संकल्प लिया।',
          'उन्होंने स्नान कर शुद्ध भाव से भगवान विष्णु का स्मरण किया, दिनभर अन्न-जल त्यागकर प्रभु के नाम का जप करते रहे, और रात्रि में निद्रा त्यागकर जागरण किया। दीन और निर्धन होकर भी उनके पास जो श्रद्धा थी, वही उनका सबसे बड़ा अर्घ्य बन गई।',
          'इस प्रकार राजा ने मन, वचन और कर्म से अजा एकादशी का व्रत सम्पन्न किया। उनके अटल सत्य और इस पवित्र व्रत के संयुक्त पुण्य ने ऊपर देवलोक तक हलचल मचा दी, और जो दुःख वर्षों से उनका पीछा कर रहा था, उसका अन्त निकट आ गया।',
        ],
        bodyEn: [
          'The sage’s words kindled a lamp of hope in the king’s flickering heart. When the day of Aja Ekadashi arrived, Harishchandra, even while carrying out all his duties at the cremation ground, took the resolve to fast with complete discipline.',
          'He bathed, and with a pure heart remembered Lord Vishnu; abandoning food and water throughout the day, he kept repeating the name of the Lord, and in the night he gave up sleep and kept vigil. Though poor and wretched, the faith he held became his greatest offering.',
          'Thus did the king complete the vow of Aja Ekadashi in thought, word and deed. The combined merit of his unshakeable truth and this sacred vow stirred even the realm of the gods above, and the end drew near of the sorrow that had pursued him for years.',
        ],
      },
      {
        id: 'the-restoration',
        titleHi: 'राज्य, परिवार और पुण्यलोक की प्राप्ति',
        titleEn: 'The Restoration of Kingdom, Family and the Holy Realm',
        bodyHi: [
          'व्रत के पूर्ण होते ही आकाश में देव-दुन्दुभियाँ बज उठीं और पुष्पों की वर्षा होने लगी। देवता स्वयं उपस्थित हुए, और राजा ने देखा कि उसका पुत्र रोहिताश्व, जो सर्पदंश से मृत हो चुका था, फिर से जीवित होकर उसके सम्मुख खड़ा है।',
          'उसी क्षण रानी शैव्या भी अपने पूर्व रूप और गौरव में लौट आईं, और जिस ब्राह्मण तथा चाण्डाल के रूप में स्वयं देवता और धर्म राजा की परीक्षा ले रहे थे, उन्होंने प्रकट होकर हरिश्चन्द्र की सत्यनिष्ठा की प्रशंसा की। अजा एकादशी के पुण्य-प्रताप से राजा का खोया हुआ राज्य, उसका कोष और उसका सारा वैभव उसे फिर से प्राप्त हो गया।',
          'अन्त में हरिश्चन्द्र अपने परिवार और प्रजा सहित दीर्घकाल तक धर्मपूर्वक राज्य कर, अपने सम्पूर्ण कुल के साथ उत्तम पुण्यलोक को सिधारे। तभी से कहा जाता है कि जो भी मनुष्य श्रद्धा और भक्ति से भाद्रपद कृष्ण पक्ष की इस अजा एकादशी का व्रत करता है, उसके समस्त पाप नष्ट हो जाते हैं, उसकी विपत्तियाँ दूर होती हैं, और भगवान विष्णु की कृपा से वह इस लोक में सुख तथा अन्त में मोक्ष को प्राप्त करता है।',
        ],
        bodyEn: [
          'The very moment the vow was completed, the celestial kettledrums sounded in the sky and a rain of flowers began to fall. The gods themselves appeared, and the king saw that his son Rohitashva, who had died of a snakebite, now stood living once more before him.',
          'In that same instant Queen Shaivya too returned to her former form and dignity; and the beings who, in the guise of the brahmin and the keeper of the cremation grounds, were the gods and Dharma themselves testing the king, revealed their true selves and praised Harishchandra’s devotion to truth. By the meritorious power of Aja Ekadashi, the king regained his lost kingdom, his treasury and all his splendour.',
          'In the end Harishchandra, together with his family and his subjects, ruled righteously for a long age and then departed, with all his lineage, to the highest holy realm. From that time it is said that whoever observes this Aja Ekadashi of the dark fortnight of Bhadrapada with faith and devotion has all his sins destroyed and his calamities dispelled, and by the grace of Lord Vishnu attains happiness in this world and, in the end, liberation.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'putrada-ekadashi-katha',
    titleHi: 'पुत्रदा एकादशी व्रत कथा',
    titleEn: 'Putrada Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/putrada-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'the-childless-king',
        titleHi: 'महिष्मती का राजा महीजित',
        titleEn: 'Mahijit, the King of Mahishmati',
        bodyHi: [
          'महिष्मती नगरी के राजा महीजित अपने राजमहल के झरोखे पर बैठे थे, और बाहर प्रजा के बालक हँसते-खेलते दौड़ रहे थे। उनका राज्य धन-धान्य से भरा था, उनकी कीर्ति दूर-दूर तक फैली थी, परन्तु उनके अपने आँगन में कोई बालक की किलकारी नहीं गूँजती थी। पुत्रहीनता का यह काँटा उनके हृदय में दिन-रात चुभता रहता था।',
          '‘मेरे पास सब कुछ है,’ राजा मन ही मन सोचते, ‘पर जिस वंश को आगे ले जाने वाला कोई नहीं, उस राज्य और उस ऐश्वर्य का क्या मोल? मेरे पीछे इस सिंहासन पर कौन बैठेगा, और मेरे पितरों को जल कौन देगा?’ इस चिन्ता ने उनके मुख की कान्ति हर ली थी और रात्रि की नींद छीन ली थी।',
        ],
        bodyEn: [
          'King Mahijit of the city of Mahishmati sat at the window of his palace while, outside, the children of his subjects ran about laughing and playing. His kingdom overflowed with wealth and grain, his fame had spread far and wide, yet within his own courtyard no child\'s joyful cry ever echoed. This thorn of childlessness pricked his heart day and night.',
          '‘I possess everything,’ the king would think within himself, ‘but of what worth are this kingdom and this splendour when there is none to carry the line forward? After me, who shall sit upon this throne, and who shall offer water to my ancestors?’ This worry had drained the lustre from his face and stolen the sleep from his nights.',
        ],
      },
      {
        id: 'counsel-of-the-sages',
        titleHi: 'मंत्रियों और ऋषियों की मन्त्रणा',
        titleEn: 'The Counsel of Ministers and Sages',
        bodyHi: [
          'एक दिन राजा ने अपने मन्त्रियों और प्रजा के प्रमुखों को बुलाकर अपनी पीड़ा खोलकर रख दी। ‘मैंने कोई अधर्म नहीं किया,’ उन्होंने कहा, ‘न्याय से प्रजा का पालन किया, यज्ञ किए, दान दिए — फिर भी मुझे पुत्र-सुख क्यों नहीं मिला? आप सब मिलकर इसका उपाय खोजिए।’',
          'मन्त्री और सज्जन इस विषय में सोच-विचार करते हुए वन की ओर निकल पड़े, जहाँ अनेक तपस्वी मुनि तपस्या में लीन रहते थे। वृक्षों की छाया में, सरोवरों के तट पर वे एक आश्रम से दूसरे आश्रम भटकते रहे, इस आशा में कि कोई महात्मा उनके राजा के दुःख का निवारण बता दे।',
          'घूमते-घूमते वे एक ऐसे स्थान पर पहुँचे जहाँ दीर्घायु मुनि लोमश ध्यान में बैठे थे। कहा जाता था कि एक कल्प बीतने पर उनके शरीर का एक रोम झड़ता है, और वे त्रिकालदर्शी हैं — भूत, वर्तमान और भविष्य उनकी दृष्टि से छिपा नहीं। उन ऋषि को देखकर सबके हृदय में आशा की किरण जागी और वे श्रद्धा से उनके चरणों में नत हो गए।',
        ],
        bodyEn: [
          'One day the king summoned his ministers and the leading men of his people and laid his anguish bare before them. ‘I have committed no wrong,’ he said. ‘I have ruled my subjects with justice, performed sacrifices, given alms — and yet why has the happiness of a son been denied me? Together, find me a remedy.’',
          'Pondering this matter, the ministers and good men set out toward the forest, where many ascetic sages dwelt absorbed in penance. Beneath the shade of trees and along the banks of pools they wandered from one hermitage to the next, hoping that some great soul might reveal a cure for their king\'s sorrow.',
          'Wandering thus, they came to a place where the long-lived sage Lomasha sat in meditation. It was said that with the passing of one age a single hair fell from his body, and that he saw across the three times — past, present and future lay open before his sight. Beholding that sage, a ray of hope rose in every heart, and they bowed reverently at his feet.',
        ],
      },
      {
        id: 'the-sages-revelation',
        titleHi: 'लोमश ऋषि का प्रकटन',
        titleEn: 'The Sage Lomasha\'s Revelation',
        bodyHi: [
          'लोमश ऋषि ने आगन्तुकों का स्वागत किया और उनके आने का कारण पूछा। मन्त्रियों ने हाथ जोड़कर कहा, ‘हे महर्षि! हमारे राजा महीजित धर्मात्मा और प्रजावत्सल हैं, फिर भी निःसन्तान हैं। उनका यह शोक हम सबका शोक है। कृपा करके बताइए कि उन्हें पुत्र-रत्न किस उपाय से प्राप्त होगा।’',
          'ऋषि ने क्षण भर अपने दिव्य ज्ञान से राजा के पूर्वजन्मों को देखा और फिर बोले, ‘सुनो। तुम्हारा राजा पूर्वजन्म में एक निर्धन वैश्य था। एक बार ज्येष्ठ मास की निर्जल द्वादशी के दिन, जब दो दिन तक जल भी न मिला था, वह एक सरोवर पर जल पीने पहुँचा। ठीक उसी समय एक प्यासी गाय अपने बछड़े को जन्म देकर जल पीने आई।’',
          '‘उस तृषित प्राणी को परे हटाकर वैश्य स्वयं जल पी गया — और जान-अनजान में यही उसका पाप बन गया। उसी पाप के फल से इस जन्म में, राजा होकर भी, वह सन्तान-सुख से वंचित है। परन्तु शोक मत करो, क्योंकि इस पाप का प्रायश्चित और उसका निवारण दोनों हैं।’',
        ],
        bodyEn: [
          'The sage Lomasha welcomed the visitors and asked the reason for their coming. Folding their hands, the ministers said, ‘O great sage! Our king Mahijit is righteous and devoted to his people, yet he is without offspring. His sorrow is the sorrow of us all. Be gracious and tell us by what means he may obtain the jewel of a son.’',
          'For a moment the sage gazed with his divine sight into the king\'s former births, and then he spoke. ‘Listen. In a past life your king was a poor merchant. Once, on the waterless Dvadashi of the month of Jyeshtha, when he had found no water even for two days, he came to a pool to drink. At that very moment a thirsty cow, having just given birth to her calf, came to drink as well.’',
          '‘Pushing that parched creature aside, the merchant drank the water himself — and, knowingly or not, this became his sin. By the fruit of that very sin, in this birth, though he is a king, he is deprived of the joy of children. Yet do not grieve, for both the atonement for this sin and its remedy exist.’',
        ],
      },
      {
        id: 'the-vow-and-the-fast',
        titleHi: 'व्रत का विधान और संकल्प',
        titleEn: 'The Prescribed Vow and the Resolve',
        bodyHi: [
          'मुनि ने आगे कहा, ‘तुम सब और तुम्हारे राजा-रानी पौष मास के शुक्ल पक्ष की एकादशी का व्रत श्रद्धापूर्वक करें। इसी को पुत्रदा एकादशी कहते हैं, क्योंकि यह सन्तान प्रदान करने वाली है। इस व्रत के पुण्य से पूर्वजन्म का पाप नष्ट होगा और राजा के घर में पुत्र का जन्म होगा।’',
          'ऋषि के वचन सुनकर मन्त्रियों के मुख प्रसन्नता से खिल उठे। वे महिष्मती लौटे और राजा को सब वृत्तान्त कह सुनाया। राजा महीजित ने उसी क्षण निश्चय किया कि वे यह व्रत अवश्य करेंगे, और रानी सहित सम्पूर्ण प्रजा को भी इसमें सम्मिलित करेंगे।',
          'पौष शुक्ल एकादशी आने पर राजा और रानी ने स्नान कर शुद्ध वस्त्र धारण किए, भगवान विष्णु की भक्तिपूर्वक पूजा की, दिनभर निराहार रहकर उनके नाम का स्मरण किया और रात्रि में जागरण किया। उनके साथ नगर के स्त्री-पुरुष भी इसी नियम का पालन करते रहे। द्वादशी के दिन ब्राह्मणों को भोजन और दान देकर सबने व्रत का पारण किया।',
        ],
        bodyEn: [
          'The sage continued, ‘Let all of you, together with your king and queen, observe with devotion the Ekadashi of the bright fortnight of the month of Pausha. This is called Putrada Ekadashi, for it bestows children. By the merit of this vow the sin of the past birth shall be destroyed, and a son shall be born in the king\'s house.’',
          'Hearing the sage\'s words, the faces of the ministers blossomed with joy. They returned to Mahishmati and recounted the whole matter to the king. King Mahijit resolved in that very instant that he would surely keep this vow, and that he would draw the queen and all his people into it as well.',
          'When the bright Ekadashi of Pausha arrived, the king and queen bathed and put on clean garments, worshipped Lord Vishnu with devotion, remained without food through the day while remembering his name, and kept vigil through the night. Alongside them, the men and women of the city upheld the same discipline. On the day of Dvadashi, after feeding and giving gifts to the brahmins, all of them broke their fast.',
        ],
      },
      {
        id: 'the-blessing-of-a-son',
        titleHi: 'पुत्र-रत्न की प्राप्ति',
        titleEn: 'The Blessing of a Son',
        bodyHi: [
          'व्रत के पुण्य-प्रभाव से कुछ ही समय में रानी ने गर्भ धारण किया, और यथासमय एक तेजस्वी पुत्र को जन्म दिया। महिष्मती में मानो आनन्द की लहर दौड़ गई — बाजे बजे, दान बँटे, और जिस आँगन में वर्षों से सूनापन था, वहाँ अब बालक की किलकारियाँ गूँजने लगीं।',
          'वही बालक बड़ा होकर प्रतापी, धर्मनिष्ठ और प्रजा का प्रिय राजकुमार बना, जिसने आगे चलकर अपने पिता के यश को और भी ऊँचा किया। राजा महीजित का शोक हर्ष में बदल गया, और उनका वंश निरन्तर आगे बढ़ता रहा।',
          'तब से जो भी श्रद्धालु पौष शुक्ल की इस पुत्रदा एकादशी का व्रत भक्तिपूर्वक करता है, भगवान विष्णु की कृपा से उसे योग्य सन्तान का सुख प्राप्त होता है, उसके पाप क्षीण होते हैं, और अन्त में वह उत्तम लोक को पाता है — यही इस व्रत का अक्षय फल कहा गया है।',
        ],
        bodyEn: [
          'By the meritorious power of the vow, within a short while the queen conceived, and in due time gave birth to a radiant son. A wave of joy seemed to sweep through Mahishmati — instruments sounded, gifts were distributed, and in the courtyard that had lain silent for years, the joyful cries of a child now rang out.',
          'That very boy grew into a mighty, righteous prince beloved of the people, who in time raised his father\'s renown higher still. King Mahijit\'s sorrow turned to delight, and his line continued on, ever advancing.',
          'From that time on, whoever observes this Putrada Ekadashi of the bright fortnight of Pausha with devotion obtains, by the grace of Lord Vishnu, the joy of worthy offspring; his sins are diminished, and in the end he attains the highest realm — this is declared to be the imperishable fruit of the vow.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'nirjala-ekadashi-katha',
    titleHi: 'निर्जला एकादशी व्रत कथा',
    titleEn: 'Nirjala Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/nirjala-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'bhima-ki-vyatha',
        titleHi: 'भीम की व्यथा',
        titleEn: 'The Sorrow of Bhima',
        bodyHi: [
          '"माता, मैं क्या करूँ? आप एकादशी का व्रत रखती हैं, बड़े भाई युधिष्ठिर रखते हैं, अर्जुन, नकुल और सहदेव रखते हैं, यहाँ तक कि द्रौपदी भी निराहार रहकर भगवान विष्णु की आराधना करती हैं — किन्तु मैं ही एक हूँ जो भूख सहन नहीं कर पाता।" भीम ने सिर झुकाकर यह कहा तो उसकी आँखें भर आईं।',
          'पाण्डवों में सबसे बलशाली भीम के उदर में वृकोदर की अग्नि जलती थी। वह भोजन से अत्यन्त प्रेम करता था और एक प्रहर भी बिना खाए नहीं रह पाता था। जब-जब घर के सब जन एकादशी पर अन्न-जल त्यागकर हरि का स्मरण करते, भीम अकेला बैठा रहता और लज्जा से उसका मुख म्लान हो जाता।',
          '"मुझे भगवान विष्णु की कृपा से वंचित नहीं रहना। मुझे भी वह पुण्य चाहिए जो आप सब अर्जित करते हैं। परन्तु मैं भूख के आगे विवश हो जाता हूँ — मेरा यह पेट मुझे धर्म से दूर खींच ले जाता है।" भीम बार-बार यही सोचकर भीतर ही भीतर दुखी रहता।',
          'कुन्ती ने पुत्र की पीड़ा देखी, युधिष्ठिर ने समझाया, पर भीम की क्षुधा किसी उपदेश से शान्त न हुई। अन्ततः उसने निश्चय किया कि वह अपने पितामह, महर्षि व्यास के पास जाएगा और अपनी इस असमर्थता को उनके चरणों में रखकर कोई मार्ग पूछेगा।',
        ],
        bodyEn: [
          '"Mother, what am I to do? You keep the Ekadashi fast, my elder brother Yudhishthira keeps it, Arjuna, Nakula and Sahadeva keep it, even Draupadi stays without food and worships Lord Vishnu — yet I alone cannot bear hunger." As Bhima said this with his head bowed, his eyes filled with tears.',
          'In the belly of Bhima, the mightiest of the Pandavas, burned the fire named Vrikodara. He loved food beyond measure and could not pass even a single watch of the day without eating. Whenever the household renounced food and water on Ekadashi to remember Hari, Bhima sat apart, and his face dimmed with shame.',
          '"I do not wish to be deprived of Lord Vishnu’s grace. I too want the merit that all of you earn. But before hunger I become helpless — this stomach of mine drags me away from dharma." Thinking this again and again, Bhima grieved within himself.',
          'Kunti saw her son’s anguish, Yudhishthira counselled him, but Bhima’s hunger was not stilled by any sermon. At last he resolved that he would go to his grandfather, the great sage Vyasa, lay this incapacity at his feet, and ask for some path forward.',
        ],
      },
      {
        id: 'vyasa-se-prashna',
        titleHi: 'व्यास से प्रश्न',
        titleEn: 'The Question to Vyasa',
        bodyHi: [
          '"पितामह, मैं आपके समक्ष सत्य कहता हूँ," भीम ने हाथ जोड़कर कहा, "मेरे सब बन्धु प्रत्येक मास की दोनों एकादशियों का व्रत करते हैं, किन्तु मैं एक दिन भी अन्न छोड़ नहीं सकता। मेरी जठराग्नि मुझे चैन नहीं लेने देती।"',
          '"दान मैं दे सकता हूँ, पूजा मैं कर सकता हूँ, भगवान का ध्यान भी धर सकता हूँ — पर उपवास, हे मुनिवर, मुझसे नहीं होता। तो क्या मैं विष्णु के उस पुण्य से सदा वंचित ही रहूँगा जो व्रत से मिलता है? कोई ऐसा उपाय बताइए जिससे मुझे भी वही फल प्राप्त हो।"',
          'व्यास मुस्कुराए और बोले, "पुत्र भीम, वर्ष में चौबीस एकादशियाँ आती हैं, और जो उन्हें यथाविधि करता है वह नारायण का प्रिय हो जाता है। तुम जैसे क्षुधातुर के लिए भी शास्त्र ने एक मार्ग रखा है — एक ही व्रत, जो इन सब का फल देता है।"',
          'भीम की आँखों में आशा की ज्योति जगी। "वह कौन-सा व्रत है पितामह? आप आज्ञा दें, मैं उसे अवश्य करूँगा, चाहे वह कितना ही कठिन क्यों न हो।" व्यास ने उसकी ओर स्नेह से देखा और निर्जला एकादशी का रहस्य कहना आरम्भ किया।',
        ],
        bodyEn: [
          '"Grandfather, I speak the truth before you," said Bhima, folding his hands. "All my kinsmen observe both Ekadashis of every month, but I cannot give up food for even a single day. The fire in my belly grants me no peace."',
          '"I can give in charity, I can perform worship, I can hold the Lord in meditation — but fasting, O sage, is beyond me. Must I then remain forever deprived of that merit of Vishnu which the fast bestows? Tell me some means by which I too may gain the same fruit."',
          'Vyasa smiled and said, "Son Bhima, twenty-four Ekadashis come in a year, and whoever observes them according to rule becomes dear to Narayana. Yet even for one tormented by hunger like you, the scriptures have kept a path — a single vow that yields the fruit of them all."',
          'A light of hope kindled in Bhima’s eyes. "Which vow is it, grandfather? Give the command, and I shall surely keep it, however hard it may be." Vyasa looked upon him with affection and began to tell the secret of the Nirjala Ekadashi.',
        ],
      },
      {
        id: 'nirjala-vrat-ka-vidhan',
        titleHi: 'निर्जला व्रत का विधान',
        titleEn: 'The Rule of the Waterless Vow',
        bodyHi: [
          '"सुनो भीम," व्यास ने कहा, "ज्येष्ठ मास के शुक्ल पक्ष की जो एकादशी आती है, वह निर्जला एकादशी कहलाती है। इस दिन साधक न अन्न ग्रहण करता है, न जल — एक सूर्योदय से दूसरे सूर्योदय तक पूर्ण निराहार और निर्जल रहकर भगवान विष्णु की आराधना करता है।"',
          '"यही इसकी विशेषता है। जो मनुष्य इस एक व्रत को श्रद्धा और संयम से कर लेता है, उसे वर्ष भर की चौबीसों एकादशियों का संयुक्त पुण्य प्राप्त हो जाता है। ज्येष्ठ की प्रचण्ड धूप में बिना जल के रहना सरल नहीं — किन्तु इसी तप में इसका अपार फल छिपा है।"',
          '"द्वादशी के प्रातः स्नान करके ब्राह्मणों और निर्धनों को जल से भरे घट, वस्त्र और अन्न का दान देना चाहिए। फिर पारण करके व्रत पूर्ण होता है। जो इस विधि का पालन करता है, उसके सब पाप नष्ट हो जाते हैं और नारायण उसकी रक्षा करते हैं।"',
          'भीम ने यह सुनकर एक क्षण को साँस रोक ली। निराहार रहना ही उसके लिए असह्य था, और यहाँ तो जल भी त्यागना था। फिर भी पितामह के वचनों का बल और विष्णु-कृपा की लालसा उसके हृदय में जाग उठी, और उसने मन ही मन यह कठोर व्रत स्वीकार कर लिया।',
        ],
        bodyEn: [
          '"Listen, Bhima," said Vyasa, "the Ekadashi that falls in the bright fortnight of the month of Jyeshtha is called the Nirjala Ekadashi. On this day the devotee takes neither food nor water — from one sunrise to the next he remains wholly without food and without water, and worships Lord Vishnu."',
          '"This is its distinction. The one who keeps this single vow with faith and self-restraint obtains the combined merit of all twenty-four Ekadashis of the entire year. To remain without water under the fierce sun of Jyeshtha is no easy thing — but in this very austerity lies its boundless fruit."',
          '"On the Dwadashi, after bathing at dawn, one should give to brahmins and the poor pots filled with water, garments and food. Then, breaking the fast, the vow is completed. Whoever follows this rule has all his sins destroyed, and Narayana protects him."',
          'Hearing this, Bhima held his breath for a moment. To go without food was already unbearable for him, and here even water was to be renounced. Yet the strength of his grandfather’s words and the longing for Vishnu’s grace awoke in his heart, and within himself he accepted this severe vow.',
        ],
      },
      {
        id: 'bhima-ka-tap',
        titleHi: 'भीम का तप',
        titleEn: 'The Austerity of Bhima',
        bodyHi: [
          'ज्येष्ठ शुक्ल एकादशी का सूर्य उदित हुआ और भीम ने संकल्प लिया — न अन्न, न जल। दिन चढ़ने के साथ सूर्य की किरणें तीखी होती गईं, और वृकोदर की अग्नि भीतर धधकने लगी। भीम का कण्ठ सूखने लगा, पर उसने जल को छुआ तक नहीं।',
          'मध्याह्न आते-आते भूख और प्यास ने उस महाबली को घेर लिया। उसका विशाल शरीर काँपने लगा, मुख पीला पड़ गया, और एक बार तो वह मूर्च्छित-सा होकर पृथ्वी पर झुक गया। तब भी उसके मन में एक ही दृढ़ता थी — "मैं पितामह के वचन को व्यर्थ नहीं जाने दूँगा।"',
          'सारा दिन और सारी रात भीम ने भगवान विष्णु का स्मरण करते हुए बिता दी। तृषा से व्याकुल होकर भी उसने न अन्न माँगा, न जल; उसने अपने भीतर की उस प्रचण्ड अग्नि को संयम से बाँध लिया। पाण्डवों ने अपने इस भाई को इतने धैर्य में देखा तो विस्मित रह गए।',
          'अगले सूर्योदय तक भीम अपने व्रत पर अडिग रहा। जैसे ही द्वादशी का प्रकाश फैला, उसने विधिपूर्वक स्नान कर दान किया और पारण से व्रत पूर्ण किया। इसी कठिन तप के कारण यह एकादशी भीमसेनी एकादशी और पाण्डव एकादशी भी कहलाई।',
        ],
        bodyEn: [
          'The sun of the bright Jyeshtha Ekadashi rose, and Bhima took his vow — neither food nor water. As the day climbed, the rays of the sun grew sharp, and the fire of Vrikodara began to blaze within. Bhima’s throat went dry, yet he did not so much as touch water.',
          'By midday, hunger and thirst had laid siege to that mighty hero. His vast body began to tremble, his face turned pale, and once he sank toward the earth as though about to faint. Even then a single firmness held his mind — "I will not let my grandfather’s words go in vain."',
          'All through the day and all through the night, Bhima passed the time remembering Lord Vishnu. Though tormented by thirst, he asked for neither food nor water; he bound that raging fire within him with self-restraint. When the Pandavas saw their brother in such forbearance, they were filled with wonder.',
          'Until the next sunrise Bhima stood unshaken in his vow. As soon as the light of Dwadashi spread, he bathed according to rule, gave gifts in charity, and completed the fast with the breaking-meal. Because of this hard austerity, this Ekadashi came also to be called the Bhimaseni Ekadashi and the Pandava Ekadashi.',
        ],
      },
      {
        id: 'phala-aur-mahima',
        titleHi: 'फल और महिमा',
        titleEn: 'The Fruit and the Glory',
        bodyHi: [
          'व्रत पूर्ण होते ही भगवान विष्णु भीम पर प्रसन्न हुए। उस एक निर्जल एकादशी के तप से उसे वर्ष भर की चौबीसों एकादशियों का संयुक्त पुण्य प्राप्त हो गया — वही फल जिसके लिए वह वर्षों से तरसता था, एक ही दिन की दृढ़ता से उसकी झोली में आ गिरा।',
          '"धन्य है तुम्हारा संकल्प, पुत्र," व्यास ने कहा, "तुमने भूख और प्यास को जीतकर वह श्रेष्ठ फल पाया है जिसे पाने के लिए तपस्वी जीवन भर एकादशियाँ करते हैं। आज से यह व्रत समस्त एकादशियों में सबसे बड़ा कहा जाएगा।"',
          'जो भी मनुष्य श्रद्धा से इस निर्जला एकादशी को धारण करता है, उसके समस्त पाप भस्म हो जाते हैं, उसे चौबीसों एकादशियों का अक्षय पुण्य मिलता है, और अन्त में वह विष्णुलोक को प्राप्त कर जन्म-मरण के बन्धन से मुक्त हो जाता है।',
          'इसी कारण इसे पाण्डव एकादशी और भीमसेनी एकादशी कहकर सदा स्मरण किया जाता है — वह एकादशी जिसने महाबली भीम को भी हरि की पूर्ण कृपा का पात्र बनाया, और जो आज भी अपने व्रतियों पर नारायण की रक्षा और मोक्ष की वही वर्षा करती है। बोलो, भगवान विष्णु की जय।',
        ],
        bodyEn: [
          'The moment the vow was completed, Lord Vishnu was pleased with Bhima. By the austerity of that one waterless Ekadashi he gained the combined merit of all twenty-four Ekadashis of the year — the very fruit he had longed for over so many years fell into his lap through the firmness of a single day.',
          '"Blessed is your resolve, son," said Vyasa. "By conquering hunger and thirst you have won that supreme fruit which ascetics seek through a lifetime of Ekadashis. From this day this vow shall be called the greatest of all Ekadashis."',
          'Whichever person observes this Nirjala Ekadashi with faith has all his sins burned away, receives the inexhaustible merit of all twenty-four Ekadashis, and at the last attains the abode of Vishnu, freed from the bondage of birth and death.',
          'For this reason it is forever remembered as the Pandava Ekadashi and the Bhimaseni Ekadashi — the Ekadashi that made even the mighty Bhima a vessel of Hari’s complete grace, and which to this day showers upon its observers that same protection of Narayana and the gift of liberation. Say it: glory to Lord Vishnu.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'yogini-ekadashi-katha',
    titleHi: 'योगिनी एकादशी व्रत कथा',
    titleEn: 'Yogini Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/yogini-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'alakapuri-ka-hemamali',
        titleHi: 'अलकापुरी का यक्ष हेममाली',
        titleEn: 'Hemamali, the Yaksha of Alakapuri',
        bodyHi: [
          '"हेममाली, सूर्य अभी मानसरोवर की लहरों पर सोने-सा बिखरने ही वाला है — पुष्प तोड़ने में विलम्ब न करना; भगवान शिव की पूजा का प्रहर बीत न जाए," ऐसा कहकर धनपति कुबेर प्रतिदिन अपने सेवक को विदा करते थे, और हेममाली सिर झुकाकर मानसरोवर की ओर चल पड़ता।',
          'अलकापुरी कुबेर की वही दिव्य नगरी थी जहाँ रत्नों की प्राचीरें झिलमिलाती थीं और जहाँ का प्रत्येक प्रभात मंगल-गान से भरा रहता था। उसी नगरी में हेममाली नामक यक्ष निवास करता था, जिसका एकमात्र कर्तव्य था — प्रतिदिन मानसरोवर से ताज़े, निर्मल पुष्प लाकर कुबेर को सौंपना, ताकि वे उनसे भगवान शिव की आराधना कर सकें।',
          'हेममाली अपने स्वामी का अत्यन्त प्रिय और विश्वासपात्र सेवक था, क्योंकि उसकी श्रद्धा में कभी कोई कमी न दिखती थी। पर उस यक्ष के हृदय में एक और प्रेम बसता था — अपनी अनुपम सुन्दरी पत्नी विशालाक्षी के प्रति, जिसे स्वरूपवती भी कहा जाता था; उसका रूप, उसका स्नेह हेममाली के प्राणों में रचा-बसा था।',
        ],
        bodyEn: [
          '"Hemamali, the sun is about to scatter itself like gold upon the waters of Manasarovar — do not delay in gathering the flowers; let not the hour of Lord Shiva worship slip away," thus would Kubera, the lord of wealth, dismiss his servant each day, and Hemamali, bowing his head, would set out toward the Manasarovar lake.',
          'Alakapuri was that very divine city of Kubera, where ramparts of jewels shimmered and where every dawn was filled with auspicious song. In that city dwelt a yaksha named Hemamali, whose sole duty was to bring fresh, pure flowers from the Manasarovar lake each day and present them to Kubera, that he might worship Lord Shiva with them.',
          'Hemamali was a most beloved and trusted servant of his master, for no lack ever seemed to appear in his devotion. Yet in the heart of that yaksha there dwelt another love as well — toward his peerless and beautiful wife Vishalakshi, also called Swarupavati; her beauty and her tenderness were woven into the very life of Hemamali.',
        ],
      },
      {
        id: 'prem-mein-vilamb',
        titleHi: 'प्रेम में डूबा विलम्ब',
        titleEn: 'The Delay Born of Love',
        bodyHi: [
          'एक प्रभात, जब हेममाली मानसरोवर से पुष्प लेकर लौटा, तो उसके चरण अनायास ही अपने भवन की ओर मुड़ गए। वहाँ विशालाक्षी उसकी प्रतीक्षा में बैठी थी, और उसके मुख की मुस्कान देखकर यक्ष का मन पूजा का प्रहर, स्वामी का आदेश — सब कुछ विस्मृत कर बैठा।',
          'प्रेम के उस मधुर बंधन में बँधा हेममाली समय का बोध ही खो बैठा। प्रहर पर प्रहर बीतते गए, सूर्य आकाश में ऊँचा चढ़ आया, और जिस वेला में कुबेर शिव-पूजा के लिए पुष्पों की बाट जोह रहे थे, वह वेला कब की निकल चुकी थी।',
          'उधर कुबेर अपने आराध्य की पूजा के लिए आसन पर बैठे थे, किन्तु पुष्प न आए तो आए ही नहीं। प्रतीक्षा करते-करते उनका मुख विवर्ण हो उठा, और मन में क्षोभ की ज्वाला सुलगने लगी कि उनका विश्वासपात्र सेवक आज ऐसा प्रमाद कैसे कर बैठा।',
          'अन्ततः जब बहुत विलम्ब से, लज्जित और भयभीत हेममाली पुष्प लेकर सभा में उपस्थित हुआ, तो पूजा का पवित्र प्रहर बीत चुका था। कुबेर ने तीक्ष्ण दृष्टि से उसकी ओर देखा और कठोर स्वर में पूछा कि किस कारण आज इतना अक्षम्य विलम्ब हुआ।',
        ],
        bodyEn: [
          'One morning, when Hemamali returned with the flowers from Manasarovar, his feet of their own accord turned toward his own dwelling. There Vishalakshi sat awaiting him, and seeing the smile upon her face, the mind of the yaksha forgot all else — the hour of worship, the command of his master, everything.',
          'Bound in that sweet bond of love, Hemamali lost all sense of time. Watch after watch slipped past, the sun climbed high into the sky, and the hour in which Kubera awaited the flowers for the worship of Shiva had long since gone by.',
          'Meanwhile Kubera sat upon his seat to worship his chosen deity, but the flowers did not come — they simply did not come. As he waited and waited his face grew pale, and a flame of vexation began to smoulder in his mind that his trusted servant should commit such negligence on this day.',
          'At last, when after very great delay the ashamed and frightened Hemamali appeared in the assembly bearing the flowers, the sacred hour of worship had already passed. Kubera looked at him with a piercing gaze and demanded in a harsh voice the reason for so unforgivable a delay that day.',
        ],
      },
      {
        id: 'kuber-ka-shrap',
        titleHi: 'कुबेर का शाप और पतन',
        titleEn: 'The Curse of Kubera and the Fall',
        bodyHi: [
          'हेममाली कँपते हुए सत्य बोल उठा — कि वह अपनी प्रिया विशालाक्षी के प्रेम में ऐसा खो गया कि समय का स्मरण ही न रहा। यह सुनते ही कुबेर का संयम टूट गया और उनके नेत्र क्रोध से धधक उठे।',
          'कुपित होकर कुबेर गरज उठे, "अरे प्रमादी! जिस वेला मेरे आराध्य शिव की पूजा होनी थी, उस वेला तू भोग-विलास में डूबा रहा। जा! तेरा यह सुन्दर रूप नष्ट हो — तुझे श्वेत कुष्ठ का रोग ग्रसे, और जिस पत्नी के प्रेम में तूने अपना धर्म भुलाया, उसी से तू सदा के लिए वियुक्त हो जाए।"',
          'शाप के साथ ही कुबेर ने आदेश दिया कि वह स्वर्ग की इस दिव्य अलकापुरी से नीचे, मर्त्यलोक में गिरा दिया जाए। पलक झपकते ही हेममाली का तेजस्वी यक्ष-शरीर श्वेत कुष्ठ से भर उठा, उसका दिव्य रूप कुरूप हो गया, और वह पृथ्वी पर आ गिरा।',
          'अपनी प्रिया से बिछुड़ा, रोग से जर्जर हेममाली अब पृथ्वी पर दीन-हीन भटकने लगा। भूख, प्यास और पीड़ा उसकी संगिनी बन गईं; किन्तु एक अद्भुत बात यह रही कि भगवान शिव की पूर्वकृत आराधना के प्रताप से उसकी स्मृति लुप्त न हुई — वह अपने पूर्व जीवन और अपने पतन का एक-एक क्षण स्मरण करता रहा, और यही स्मृति उसके लिए वेदना भी थी और आशा का दीप भी।',
        ],
        bodyEn: [
          'Trembling, Hemamali spoke the truth — that he had become so lost in love for his beloved Vishalakshi that all remembrance of time had fled. Hearing this, Kubera composure broke, and his eyes blazed with rage.',
          'Enraged, Kubera thundered, "O negligent one! In the very hour when the worship of my Lord Shiva was to be offered, you lay drowned in pleasure and indulgence. Go! Let this beautiful form of yours be destroyed — let white leprosy seize you, and let you be parted forever from that very wife in whose love you forgot your duty."',
          'Along with the curse Kubera commanded that he be cast down from this divine Alakapuri of heaven into the mortal world below. In the blink of an eye the radiant yaksha body of Hemamali was filled with white leprosy, his divine form turned hideous, and he fell down upon the earth.',
          'Parted from his beloved and worn out by disease, Hemamali now wandered the earth wretched and forlorn. Hunger, thirst, and pain became his companions; yet a wondrous thing remained — by the power of his past worship of Lord Shiva his memory was not lost. He remembered every moment of his former life and of his fall, and this very memory was for him both an anguish and a lamp of hope.',
        ],
      },
      {
        id: 'markandeya-ka-ashram',
        titleHi: 'मार्कण्डेय मुनि का आश्रम',
        titleEn: 'The Ashram of Sage Markandeya',
        bodyHi: [
          'भटकते-भटकते हेममाली के चरण उसे हिमालय के शीतल शिखरों की ओर ले गए। वहाँ की देवदार-वनों से घिरी एकान्त घाटियों में उसे एक पवित्र आश्रम दिखाई दिया — वह आश्रम चिरंजीवी महर्षि मार्कण्डेय का था, जिनके तप का तेज समस्त वातावरण में व्याप्त था।',
          'रोग से विकृत, थका-हारा हेममाली काँपते हुए मुनि के समक्ष जा गिरा। करुणामय मार्कण्डेय ने अपनी दिव्य दृष्टि से उसकी सम्पूर्ण व्यथा को तत्क्षण जान लिया — उसका यक्ष-जन्म, उसका प्रमाद, कुबेर का शाप और उसका यह दारुण पतन।',
          'मुनि ने स्नेहपूर्वक पूछा, "हे दुखी जीव, तू कौन है और किस पाप के फलस्वरूप इस दशा को प्राप्त हुआ?" हेममाली ने हाथ जोड़कर अपनी सारी कथा निवेदित कर दी और रोते हुए प्रार्थना की कि कोई ऐसा उपाय बताएँ जिससे उसका यह घोर कष्ट मिटे।',
          'महर्षि मार्कण्डेय बोले, "तूने सत्य कहा है और छल नहीं किया, इसी से तेरा उद्धार सम्भव है। तू आषाढ़ मास के कृष्ण पक्ष की योगिनी एकादशी का व्रत पूर्ण श्रद्धा और विधि-विधान से कर। इस परम पुनीत व्रत के प्रभाव से तेरा कुष्ठ नष्ट होगा और तेरा खोया हुआ रूप तुझे पुनः प्राप्त होगा।"',
        ],
        bodyEn: [
          'Wandering on and on, the feet of Hemamali led him toward the cool peaks of the Himalayas. There, in the secluded valleys ringed by forests of deodar, he beheld a sacred ashram — the ashram of the immortal great sage Markandeya, whose ascetic radiance pervaded the whole region.',
          'Disfigured by disease and utterly spent, Hemamali fell trembling before the sage. The compassionate Markandeya, with his divine insight, at once perceived the whole of his torment — his birth as a yaksha, his negligence, the curse of Kubera, and this grievous fall.',
          'The sage asked with affection, "O sorrowful being, who are you, and through what sin have you come to this state?" Folding his hands, Hemamali laid bare his entire tale and, weeping, prayed that the sage might tell him some means by which this terrible suffering of his could be ended.',
          'The great sage Markandeya said, "You have spoken the truth and practised no deceit, and for this very reason your deliverance is possible. Observe the Yogini Ekadashi, the Ekadashi of the dark fortnight of the month of Ashadha, with full faith and proper rites. By the power of this most sanctifying vow your leprosy shall be destroyed, and the form you have lost shall be restored to you again."',
        ],
      },
      {
        id: 'vrat-aur-punarmilan',
        titleHi: 'व्रत-पालन और पुनर्मिलन',
        titleEn: 'Observance of the Vow and the Reunion',
        bodyHi: [
          'मुनि के वचनों को हेममाली ने मस्तक पर धारण किया। उसने पूरी निष्ठा से योगिनी एकादशी का व्रत किया — उस दिन उसने अन्न का त्याग किया, इन्द्रियों को संयत रखा, और एकाग्र मन से भगवान विष्णु तथा शिव का स्मरण-भजन करते हुए रात्रि-जागरण किया।',
          'जैसे ही व्रत की पूर्णाहुति हुई, एक दिव्य चमत्कार प्रकट हुआ। हेममाली की देह से श्वेत कुष्ठ का कलंक धुल गया, उसका शरीर पुनः निर्मल और कान्तिमान हो उठा, और उसका वही पूर्व दिव्य यक्ष-रूप, अपने समस्त तेज और सौन्दर्य के साथ, उसे लौटा दिया गया।',
          'रोग-मुक्त और तेज से देदीप्यमान हेममाली पुनः अलकापुरी लौट सका। वहाँ उसकी प्रिया विशालाक्षी उसकी प्रतीक्षा में थी; जिस पत्नी से वह सदा के लिए बिछुड़ चुका माना गया था, उसी से व्रत के प्रताप ने उसका पुनर्मिलन करा दिया, और दोनों फिर से सुख और प्रेम के साथ रहने लगे।',
          'इसी कारण कहा जाता है कि योगिनी एकादशी का व्रत महापातकों और भयंकर रोगों को नष्ट कर देता है। जो भक्त इसे श्रद्धा और संयम से करता है, उसके समस्त पाप धुल जाते हैं, खोया हुआ सौभाग्य लौट आता है, और अन्त में वह मुक्ति को प्राप्त करता है। यह व्रत अठ्ठासी हज़ार ब्राह्मणों के भोजन कराने के समान पुण्य देने वाला और मनुष्य को सब प्रकार के कष्टों से तारने वाला माना गया है।',
        ],
        bodyEn: [
          'Hemamali bore the words of the sage upon his head. With complete devotion he kept the Yogini Ekadashi vow — on that day he renounced all food, held his senses in restraint, and with a one-pointed mind kept the night vigil, remembering and singing of Lord Vishnu and Lord Shiva.',
          'No sooner was the vow brought to its completion than a divine wonder appeared. The stain of white leprosy was washed from the body of Hemamali, his frame became pure and radiant once more, and that same former divine yaksha form, with all its splendour and beauty, was restored to him.',
          'Freed of disease and shining with radiance, Hemamali was able to return once again to Alakapuri. There his beloved Vishalakshi was awaiting him; the very wife from whom he had been deemed parted forever, the power of the vow brought him back into reunion with her, and the two dwelt once more in happiness and love.',
          'For this reason it is said that the vow of Yogini Ekadashi destroys grave sins and terrible diseases. The devotee who keeps it with faith and restraint has all his sins washed away, his lost fortune returned to him, and in the end attains liberation. This vow is held to bestow merit equal to feeding eighty-eight thousand Brahmins and to carry a person across every kind of suffering.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'devshayani-ekadashi-katha',
    titleHi: 'देवशयनी एकादशी व्रत कथा',
    titleEn: 'Devshayani Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/devshayani-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'narada-poochhe-brahma-se',
        titleHi: 'नारद का प्रश्न और ब्रह्मा का उत्तर',
        titleEn: 'Narada Asks and Brahma Answers',
        bodyHi: [
          'देवर्षि नारद ने अपनी वीणा थामे ब्रह्मलोक में पधारकर पितामह ब्रह्मा के चरणों में प्रणाम किया और हाथ जोड़कर पूछा, हे सृष्टिकर्ता, आषाढ़ मास के शुक्ल पक्ष में आने वाली उस एकादशी का क्या नाम है, जिसका माहात्म्य देवता और मनुष्य समान रूप से गाते हैं। कृपया उसका व्रत और उसका फल मुझे विस्तार से बतलाइए।',
          'ब्रह्मा मुस्कुराकर बोले, हे नारद, यह बड़ी ही पवित्र तिथि है। इसी दिन भगवान विष्णु क्षीरसागर में शेषनाग की शय्या पर अपनी योगनिद्रा में लीन हो जाते हैं, और चार मास तक विश्राम करते हैं। इसी कारण इसे देवशयनी एकादशी कहते हैं; कोई इसे हरिशयनी कहता है तो कोई पद्मा एकादशी।',
          'पितामह ने कहा, हे मुनिश्रेष्ठ, इसी तिथि से चातुर्मास का आरंभ होता है, जब साधक संयम, तप और भक्ति का व्रत धारण करते हैं। भगवान केशव की यह योगनिद्रा देव-उठनी एकादशी तक चलती है, जब वे पुनः जाग उठते हैं।',
          'इस व्रत की महिमा समझाने के लिए, हे नारद, मैं तुम्हें एक प्राचीन कथा सुनाता हूँ, जिसे सुनकर मनुष्य का संशय मिट जाता है और उसके हृदय में श्रद्धा का अंकुर फूट पड़ता है। ध्यान देकर सुनो।',
        ],
        bodyEn: [
          'The divine sage Narada, holding his veena, came to the realm of Brahma, bowed at the feet of the grandsire, and folding his hands asked, O Creator, what is the name of that Ekadashi which falls in the bright fortnight of the month of Ashadha, whose glory both gods and mortals alike sing? Please describe to me its vow and its fruit in full.',
          'Brahma smiled and said, O Narada, this is a most sacred day. On this very day Lord Vishnu lies down upon the bed of the serpent Shesha in the ocean of milk and is absorbed in his yoga-sleep, resting there for four months. For this reason it is called Devshayani Ekadashi; some call it Hari-shayani and others Padma Ekadashi.',
          'The grandsire continued, O best of sages, from this very day begins Chaturmas, the four months in which seekers take up the vow of restraint, austerity, and devotion. This yoga-sleep of Lord Keshava continues until Dev-uthani Ekadashi, when he wakes once more.',
          'To make the greatness of this vow clear, O Narada, I shall tell you an ancient tale, hearing which a person doubt is dispelled and the seed of faith sprouts within the heart. Listen with attention.',
        ],
      },
      {
        id: 'mandhata-ka-rajya-aur-akal',
        titleHi: 'राजा मान्धाता का राज्य और भयंकर अकाल',
        titleEn: 'King Mandhatas Realm and the Terrible Drought',
        bodyHi: [
          'सूर्यवंश में मान्धाता नामक एक धर्मनिष्ठ राजा हुआ, जो सत्य का पालन करने वाला और अपनी प्रजा के सुख में ही अपना सुख मानने वाला था। उसके राज्य में चोर, रोग और दुर्भिक्ष का नाम तक न था; प्रजा ऐसे पलती थी मानो वे राजा के अपने ही पुत्र हों।',
          'किंतु कालचक्र की कोई गति विचित्र होती है। एक दिन, प्रजा के किसी अपराध के बिना ही, उस समृद्ध राज्य पर एक भयंकर अकाल टूट पड़ा। आकाश से एक बूँद वर्षा न हुई, और यह सूखा एक नहीं, दो नहीं, पूरे तीन वर्ष तक बना रहा।',
          'खेत सूखकर फट गए, अन्न के भंडार रीत गए, और नदियाँ-तालाब धूल में बदल गए। अन्न के अभाव में यज्ञ रुक गए, हवन की अग्नि बुझ गई, और देवताओं को आहुति देने वाले हाथ खाली रह गए।',
          'भूख से व्याकुल प्रजा राजा के द्वार पर आकर रोने लगी। हे राजन, हमें इस संकट से बचाइए, अन्न के बिना हमारे बालक मर रहे हैं। प्रजा की यह करुण पुकार सुनकर धर्मात्मा मान्धाता का हृदय शोक से भर उठा।',
        ],
        bodyEn: [
          'In the Surya dynasty there arose a righteous king named Mandhata, a keeper of truth who counted his own happiness only in the happiness of his people. In his realm there was not even a name for thieves, disease, or famine; the people were nurtured as though they were the king own sons.',
          'But the turning of the wheel of time is sometimes strange. One day, through no fault of the people at all, a terrible drought fell upon that prosperous kingdom. Not a single drop of rain came down from the sky, and this drought lasted not one year, not two, but three full years.',
          'The fields dried and cracked open, the granaries emptied, and the rivers and ponds turned to dust. For want of grain the yajnas ceased, the fire of the oblations died out, and the hands that offered libations to the gods were left empty.',
          'The people, tormented by hunger, came to the king door and began to weep. O King, save us from this calamity; without grain our children are dying. Hearing this piteous cry of his people, the heart of the righteous Mandhata filled with grief.',
        ],
      },
      {
        id: 'angiras-rishi-ka-upadesh',
        titleHi: 'अंगिरा ऋषि के आश्रम में',
        titleEn: 'At the Ashram of Sage Angiras',
        bodyHi: [
          'राजा सोच में पड़ गया कि मैंने तो कभी अधर्म नहीं किया, फिर मेरी निर्दोष प्रजा पर यह विपत्ति क्यों आई। उपाय की खोज में वह अपने कुछ मंत्रियों को साथ लेकर राजपाट छोड़कर घने वन की ओर चल पड़ा।',
          'वन में भटकते-भटकते वह तेजस्वी मुनि अंगिरा के पवित्र आश्रम तक जा पहुँचा। राजा ने ऋषि के चरणों में सिर रखकर अपनी सारी व्यथा कह सुनाई और विनती की, हे महर्षि, मेरे राज्य पर यह अकाल किस कारण आया है, और इससे मुक्ति का क्या उपाय है।',
          'ऋषि अंगिरा ने ध्यान लगाकर कहा, हे राजन, तुम्हारे राज्य में धर्म का एक सूक्ष्म भंग हुआ है, और उसी कारण यह वर्षा रुक गई है। किंतु शोक मत करो, इसका एक परम कल्याणकारी उपाय है।',
          'मुनि बोले, तुम अपनी समस्त प्रजा सहित आषाढ़ मास के शुक्ल पक्ष की देवशयनी एकादशी का व्रत पूर्ण श्रद्धा और विधि से करो। यही वह तिथि है जब भगवान विष्णु शयन करते हैं; उनकी कृपा से तुम्हारा यह संकट अवश्य दूर होगा और मेघ पुनः बरसेंगे।',
        ],
        bodyEn: [
          'The king fell to wondering, I have never committed any unrighteousness, then why has this calamity come upon my innocent people. In search of a remedy he left behind his kingdom and, taking some of his ministers with him, set out toward the dense forest.',
          'Wandering on through the forest, he came at last to the sacred hermitage of the radiant sage Angiras. The king laid his head at the sage feet, poured out all his grief, and pleaded, O great sage, by what cause has this drought come upon my realm, and what is the remedy for release from it.',
          'Sage Angiras, settling into meditation, said, O King, a subtle breach of dharma has occurred within your realm, and for that very reason the rain has been held back. But do not grieve, for there is a supremely blessed remedy for this.',
          'The sage said, together with all your people, observe the Devshayani Ekadashi of the bright fortnight of the month of Ashadha with full faith and proper rite. This is the very day on which Lord Vishnu lies down to sleep; by his grace this calamity of yours will surely be lifted and the clouds will rain once more.',
        ],
      },
      {
        id: 'vrat-varsha-aur-phala',
        titleHi: 'व्रत, वर्षा और चातुर्मास का आरंभ',
        titleEn: 'The Vow, the Rains, and the Start of Chaturmas',
        bodyHi: [
          'मुनि के वचन सुनकर राजा मान्धाता के हृदय में आशा की किरण फूट पड़ी। वह अपने नगर लौटा और सारी प्रजा को एकत्र करके बोला, हे प्रजाजनो, अब हम सब मिलकर देवशयनी एकादशी का व्रत करेंगे और भगवान विष्णु की शरण में जाएँगे।',
          'आषाढ़ शुक्ल एकादशी के पवित्र दिन राजा और प्रजा ने नियमपूर्वक उपवास रखा, स्नान कर शुद्ध हृदय से भगवान केशव का पूजन किया, और रात्रि भर जागरण में हरि के नाम का स्मरण करते रहे। सबका मन एक ही भाव में लीन था।',
          'इस सामूहिक श्रद्धा और भक्ति से भगवान विष्णु प्रसन्न हो उठे। उनकी कृपा से आकाश में मेघ घिर आए और मूसलाधार वर्षा होने लगी। तीन वर्ष से प्यासी धरती जल पाकर तृप्त हो गई और चारों ओर हरियाली लहलहा उठी।',
          'खेत फिर से अन्न से भर गए, भंडार धन-धान्य से सम्पन्न हुए, यज्ञ की अग्नि पुनः प्रज्वलित हुई, और प्रजा के मुख पर खोई हुई हँसी लौट आई। राजा मान्धाता का राज्य पहले से भी अधिक समृद्ध और सुखी हो उठा।',
          'इसी देवशयनी एकादशी से, हे नारद, चातुर्मास के वे चार पवित्र मास आरंभ होते हैं, जिनमें भगवान विष्णु शेषशय्या पर योगनिद्रा में रहते हैं, और साधक संयम का व्रत धारण करते हैं, यह क्रम देव-उठनी एकादशी तक चलता है, जब प्रभु पुनः जाग उठते हैं।',
          'जो मनुष्य श्रद्धा और भक्ति से इस एकादशी का व्रत करता है तथा इस कथा को सुनता या पढ़ता है, उसके समस्त पाप नष्ट हो जाते हैं, उसकी विपत्तियाँ दूर होती हैं, उसके जीवन में वर्षा-समान शीतल समृद्धि बरसती है, और अंत में उसे भगवान विष्णु की अनंत कृपा प्राप्त होती है।',
        ],
        bodyEn: [
          'Hearing the sage words, a ray of hope broke across the heart of King Mandhata. He returned to his city and, gathering all his people together, said, O my people, now all of us together shall observe the Devshayani Ekadashi and take refuge in Lord Vishnu.',
          'On the holy day of the bright eleventh of Ashadha, the king and the people kept the fast according to the rules, bathed and worshipped Lord Keshava with a pure heart, and through the whole night kept vigil, remembering the name of Hari. The mind of every one of them was absorbed in a single feeling.',
          'By this collective faith and devotion Lord Vishnu was filled with delight. By his grace the clouds gathered in the sky and a torrential rain began to fall. The earth, thirsting for three years, was satisfied when it received the water, and on every side green shoots sprang up and swayed.',
          'The fields filled once more with grain, the granaries grew rich with wealth and corn, the fire of the yajnas was kindled again, and the lost laughter returned to the faces of the people. The kingdom of King Mandhata became more prosperous and joyful than ever before.',
          'From this very Devshayani Ekadashi, O Narada, begin those four sacred months of Chaturmas, in which Lord Vishnu remains in yoga-sleep upon the bed of Shesha and seekers take up the vow of restraint, a course that continues until Dev-uthani Ekadashi, when the Lord wakes once more.',
          'The person who observes this Ekadashi with faith and devotion and who hears or reads this tale has all his sins destroyed, his calamities lifted, a cool prosperity like the rains poured down upon his life, and in the end the boundless grace of Lord Vishnu bestowed upon him.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'kamika-ekadashi-katha',
    titleHi: 'कामिका एकादशी व्रत कथा',
    titleEn: 'Kamika Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/kamika-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'krishna-ki-vani',
        titleHi: 'श्रीकृष्ण की वाणी',
        titleEn: 'The Words of Krishna',
        bodyHi: [
          'हे जनार्दन, श्रावण मास के कृष्ण पक्ष में आने वाली एकादशी का क्या नाम है, और उसका व्रत करने से जीव को कौन सा फल प्राप्त होता है, धर्मराज युधिष्ठिर ने हाथ जोड़कर पूछा, यह कृपा करके मुझे विस्तार से बताइए।',
          'भगवान श्रीकृष्ण मुस्कुराकर बोले, हे राजन, इस परम पवित्र एकादशी का नाम कामिका एकादशी है। प्राचीन काल में यही माहात्म्य ब्रह्मा जी ने देवर्षि नारद को सुनाया था, और आज वही गुप्त रहस्य मैं तुम्हें कहता हूँ, ध्यान देकर सुनो।',
          'जो मनुष्य श्रद्धा और भक्ति के साथ इस व्रत को धारण करता है, उसके भीतर बसे हुए घोर से घोर पाप भी जलकर भस्म हो जाते हैं। यह एकादशी भगवान विष्णु को अति प्रिय है, और इसका एक प्रभाव तुलसी की पूजा में छिपा है।',
          'श्रीकृष्ण ने कहा, हे युधिष्ठिर, भगवान श्रीधर सोने और रत्नों के ढेर से उतने प्रसन्न नहीं होते, जितने वे श्रद्धा से अर्पित एक छोटे से तुलसीदल से प्रसन्न होते हैं। इसी सत्य को समझाने के लिए एक प्राचीन कथा है, जिसे सुनकर मनुष्य भयमुक्त हो जाता है।',
        ],
        bodyEn: [
          'O Janardana, what is the name of the Ekadashi that falls in the dark fortnight of the month of Shravana, and what fruit does a soul obtain by observing its fast? So asked Dharmaraja Yudhishthira with folded hands, please be kind enough to tell me in full.',
          'Lord Krishna smiled and said, O King, this most sacred Ekadashi is named Kamika Ekadashi. In ancient times this very glory was told by Brahma to the divine sage Narada, and today I reveal that same hidden secret to you, listen with attention.',
          'Whoever holds this vow with faith and devotion has even the gravest of sins dwelling within him burned to ashes. This Ekadashi is exceedingly dear to Lord Vishnu, and one of its powers lies hidden in the worship offered with Tulsi.',
          'Krishna said, O Yudhishthira, Lord Sridhara is not so pleased by heaps of gold and jewels as he is pleased by a single small leaf of Tulsi offered with devotion. To explain this very truth there is an ancient tale which, once heard, makes a person free of fear.',
        ],
      },
      {
        id: 'kshatriya-ka-paap',
        titleHi: 'क्षत्रिय का पाप',
        titleEn: 'The Sin of the Kshatriya',
        bodyHi: [
          'किसी गाँव में एक अभिमानी और उग्र स्वभाव वाला क्षत्रिय भूस्वामी रहता था, श्रीकृष्ण ने कहा। बल और सम्पत्ति के मद में वह सदा क्रोध से भरा रहता, और छोटी सी बात पर भी आपे से बाहर हो जाता था।',
          'एक दिन किसी विषय को लेकर उसका एक ब्राह्मण से कठोर विवाद छिड़ गया। क्रोध की ज्वाला में अंधा होकर वह ब्राह्मण से भिड़ पड़ा, और उस हाथापाई में वह ब्राह्मण मारा गया।',
          'जब उसका क्रोध शांत हुआ तो उसे अपने किए का भान हुआ, और ब्रह्महत्या के उस घोर पाप का भार उसके हृदय पर पर्वत के समान आ गिरा। उसकी आत्मा भीतर ही भीतर काँपने लगी।',
          'पश्चात्ताप से व्याकुल होकर उसने मृत ब्राह्मण की अंत्येष्टि और श्राद्ध-कर्म करना चाहा, किन्तु गाँव के अन्य ब्राह्मणों ने उसके पाप के कारण न उसे स्वीकार किया, न उसका दिया हुआ अन्न या दान ही ग्रहण किया।',
          'सब उससे दूर हटने लगे, मानो वह कोई अछूत हो। न कोई उसके साथ बैठता, न कोई उससे बात करता; ब्रह्महत्या के कलंक ने उसे समाज से बहिष्कृत कर दिया, और वह अपने ही गाँव में अकेला और तिरस्कृत खड़ा रह गया।',
          'दिन-रात ग्लानि की आग उसे भीतर से जलाती रही। वह सोचता, मैंने जो किया है, क्या उसका कोई प्रायश्चित है? क्या इतना भयानक पाप कभी धुल भी सकता है? इसी पीड़ा में डूबा हुआ वह एक उपाय की खोज में निकल पड़ा।',
        ],
        bodyEn: [
          'In a certain village there dwelt a proud and hot-tempered Kshatriya landlord, said Krishna. Intoxicated by his strength and wealth, he was forever filled with anger, and over even the smallest matter he would lose all control of himself.',
          'One day, over some dispute, a bitter quarrel broke out between him and a Brahmin. Blinded by the flame of his rage he grappled with the Brahmin, and in that struggle the Brahmin was killed.',
          'When his anger cooled he became aware of what he had done, and the weight of that terrible sin of brahmahatya, the slaying of a Brahmin, fell upon his heart like a mountain. His soul began to tremble within him.',
          'Distraught with remorse, he wished to perform the funeral rites and the shraddha offerings for the slain Brahmin, yet the other Brahmins of the village, because of his sin, neither accepted him nor would they receive the food or charity he offered.',
          'All began to draw away from him as though he were an untouchable. None would sit with him, none would speak with him; the stain of brahmahatya had cast him out of society, and he stood alone and scorned in his own village.',
          'Day and night the fire of guilt burned him from within. He thought, is there any atonement for what I have done? Can so terrible a sin ever be washed away? Drowned in this anguish, he set out in search of some remedy.',
        ],
      },
      {
        id: 'muni-ka-upadesh',
        titleHi: 'मुनि का उपदेश',
        titleEn: 'The Sage Counsel',
        bodyHi: [
          'भटकते-भटकते वह एक करुणामय मुनि के आश्रम में जा पहुँचा। उनके चरणों में सिर रखकर उसने अपना सारा पाप और सारी व्यथा कह सुनाई और गिड़गिड़ाकर पूछा, हे मुनिवर, इतने घोर पाप को धोने का क्या कोई मार्ग है?',
          'मुनि ने उसकी ओर करुणा से देखा और कहा, हे पुत्र, निराश मत हो। श्रावण मास के कृष्ण पक्ष की कामिका एकादशी समीप है। तू पूर्ण श्रद्धा और निष्ठा से इस व्रत का पालन कर, तो यह तेरे ब्रह्महत्या जैसे पाप को भी नष्ट कर देगी।',
          'मुनि बोले, इस दिन तू भगवान श्रीधर अर्थात गदाधर विष्णु का पूजन कर, और उन्हें श्रद्धा से तुलसीदल अर्पित कर। स्मरण रख, भगवान को सोने और मणि-माणिक्य के ढेर से इतनी प्रसन्नता नहीं होती, जितनी भक्ति से चढ़ाए गए एक तुलसीपत्र से होती है।',
          'उन्होंने कहा, इस एकादशी को तू उपवास रखकर, इंद्रियों को संयमित कर, और रात्रि भर जागरण करते हुए हरि के नाम और गुणों का स्मरण करते हुए बिता। दीप जलाकर भगवान के सम्मुख बैठ, और अपने हृदय का सारा पश्चात्ताप उनके चरणों में अर्पित कर दे।',
          'मुनि के वचन सुनकर उस पापी के सूखे हृदय में आशा की एक किरण फूट पड़ी। उसने हाथ जोड़कर संकल्प किया कि वह इस व्रत को अपने प्राण लगाकर, पूर्ण विश्वास के साथ करेगा, और किसी भी नियम में तनिक भी प्रमाद नहीं होने देगा।',
          'मुनि को बारंबार प्रणाम करके वह लौट आया, और उसका मन अब पहली बार पश्चात्ताप के बोझ के नीचे भी एक शांत भरोसे से भर उठा कि भगवान विष्णु की शरण उसके इस असह्य कलंक को अवश्य हर लेगी।',
        ],
        bodyEn: [
          'Wandering on, he came at last to the hermitage of a compassionate sage. Laying his head at the sage feet, he poured out all his sin and all his grief, and pleaded, O great sage, is there any path by which so terrible a sin may be washed away?',
          'The sage looked upon him with compassion and said, O son, do not despair. The Kamika Ekadashi of the dark fortnight of the month of Shravana draws near. If you observe this vow with complete faith and devotion, it will destroy even a sin such as your brahmahatya.',
          'The sage said, on this day worship Lord Sridhara, that is Gadadhara Vishnu, and offer him leaves of Tulsi with devotion. Remember, the Lord is not so pleased by heaps of gold and gems as he is pleased by a single leaf of Tulsi offered with devotion.',
          'He said, keep the fast on this Ekadashi, restrain your senses, and pass the whole night in vigil, remembering the name and the qualities of Hari. Light a lamp and sit before the Lord, and lay all the remorse of your heart at his feet.',
          'Hearing the sage words, a single ray of hope broke into the parched heart of that sinner. With folded hands he resolved that he would keep this vow with his very life, with complete faith, and that he would not allow the slightest negligence in any of its rules.',
          'Bowing again and again to the sage, he returned, and his mind, for the first time even beneath the burden of remorse, was filled with a quiet trust that the shelter of Lord Vishnu would surely take away this unbearable stain.',
        ],
      },
      {
        id: 'tulsi-aur-mukti',
        titleHi: 'तुलसी और मुक्ति',
        titleEn: 'Tulsi and Liberation',
        bodyHi: [
          'कामिका एकादशी के पवित्र दिन उस क्षत्रिय ने नियमपूर्वक व्रत धारण किया। प्रातः स्नान कर, शुद्ध हृदय से उसने भगवान श्रीधर का पूजन किया, और उनके चरणों में कोमल तुलसीदल अर्पित किए। दिनभर उसने अन्न-जल का त्याग कर पूर्ण उपवास रखा।',
          'सायंकाल उसने भगवान के सम्मुख दीप जलाया और रात्रि भर जागरण किया। उसके नेत्रों से पश्चात्ताप के अश्रु बहते रहे, और वह बारंबार पुकारता रहा, हे श्रीधर, हे गदाधर, मैं महापापी आपकी शरण में हूँ, आप ही मेरे इस कलंक को धो सकते हैं।',
          'उसका मन न भूख की ओर गया, न थकान की ओर; वह तो केवल हरि के नाम और उस एक तुलसीदल की भक्ति में लीन रहा, जिसे उसने अपने काँपते हाथों से प्रेमपूर्वक भगवान को अर्पित किया था।',
          'उसी रात्रि, जब वह थककर क्षण भर को निद्रा में डूबा, तो स्वप्न में स्वयं भगवान विष्णु प्रकट हुए। उनका मुख करुणा से दीप्त था, और उन्होंने स्नेह से कहा, हे भक्त, तेरी श्रद्धा से मैं प्रसन्न हूँ; तेरा ब्रह्महत्या का पाप अब धुल गया, तू निष्पाप हो गया।',
          'भगवान के वचन सुनते ही उसके हृदय का वह पर्वत समान भार सहसा उतर गया। उसकी आत्मा निर्मल हो उठी, और जो कलंक उसे जीवित ही नरक की भाँति जला रहा था, वह कामिका एकादशी के प्रभाव से सदा के लिए मिट गया।',
          'अंत में वह क्षत्रिय अपने शेष जीवन को भगवान की भक्ति में बिताकर एक उच्च गति को प्राप्त हुआ। श्रीकृष्ण ने कहा, हे युधिष्ठिर, यही कामिका एकादशी का माहात्म्य है, जो ब्रह्महत्या जैसे घोरतम पापों को भी हर लेती है।',
          'जो मनुष्य श्रद्धा से इस व्रत का पालन करता है और तुलसी से भगवान का पूजन करता है, वह विष्णु को परम प्रिय हो जाता है, उसके समस्त पाप नष्ट हो जाते हैं, और अंत में वह मुक्ति को प्राप्त कर भगवान के परमधाम को जाता है। यही इस पवित्र कथा का सार और सत्य है।',
        ],
        bodyEn: [
          'On the holy day of Kamika Ekadashi, that Kshatriya undertook the vow according to the rules. Bathing at dawn, with a pure heart he worshipped Lord Sridhara and offered tender leaves of Tulsi at his feet. Through the whole day he renounced food and water and kept a complete fast.',
          'In the evening he lit a lamp before the Lord and kept vigil through the whole night. Tears of remorse flowed from his eyes, and again and again he cried out, O Sridhara, O Gadadhara, I, a great sinner, am in your shelter; you alone can wash away this stain of mine.',
          'His mind turned neither toward hunger nor toward weariness; it remained absorbed only in the name of Hari and in the devotion of that single Tulsi leaf which he had offered to the Lord with lovingly trembling hands.',
          'That very night, when worn out he sank for a moment into sleep, Lord Vishnu himself appeared in his dream. His face was radiant with compassion, and he said with affection, O devotee, I am pleased with your faith; your sin of brahmahatya is now washed away, you have become free of sin.',
          'The moment he heard the Lord words, that mountain-like weight upon his heart was suddenly lifted. His soul grew pure, and the stain that had been burning him alive like a living hell was, by the power of Kamika Ekadashi, erased forever.',
          'In the end that Kshatriya passed the remainder of his life in devotion to the Lord and attained a high state. Krishna said, O Yudhishthira, this is the glory of Kamika Ekadashi, which removes even the gravest of sins, such as brahmahatya.',
          'Whoever observes this vow with faith and worships the Lord with Tulsi becomes most dear to Vishnu; all his sins are destroyed, and in the end he attains liberation and goes to the supreme abode of the Lord. This is the essence and the truth of this sacred tale.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'kamada-ekadashi-katha',
    titleHi: 'कामदा एकादशी व्रत कथा',
    titleEn: 'Kamada Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/kamada-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'ratnapura-ka-gandharva',
        titleHi: 'रत्नपुर का गंधर्व ललित',
        titleEn: 'Lalit, the Gandharva of Ratnapura',
        bodyHi: [
          'रत्नपुर नगर की सुनहरी प्राचीरों के भीतर राजा पुंडरीक का राज्य फैला था, और उसी नगर में ललित नामक एक गंधर्व अपनी प्रिया ललिता के साथ निवास करता था। दोनों का स्नेह ऐसा था कि एक के बिना दूसरे की साँस अधूरी जान पड़ती थी; प्रातः की पहली किरण से लेकर रात्रि के अंतिम तारे तक उनका मन एक-दूसरे में ही रमा रहता।',
          'ललित राजा पुंडरीक की सभा का सबसे यशस्वी गायक था। जब उसका स्वर मंडप में गूँजता तो दरबारी मंत्रमुग्ध हो जाते, और स्वयं राजा भी सिर हिलाकर उसकी कला को सराहते। संगीत उसके लिए केवल आजीविका न था, वह उसकी आत्मा की वाणी थी।',
          'किंतु उस सुख-संपन्न जीवन में भी ललित का हृदय सदा ललिता के सान्निध्य की ओर खिंचा रहता। जहाँ कहीं वह गाता, उसकी प्रिया का स्मरण भीतर ही भीतर तरंगित होता रहता, मानो दोनों के प्राण एक ही ताल पर स्पंदित होते हों।',
        ],
        bodyEn: [
          'Within the golden ramparts of the city of Ratnapura spread the kingdom of King Pundarika, and in that same city dwelt a gandharva named Lalit together with his beloved wife, Lalita. Their affection was such that one seemed unable to breathe fully without the other; from the first ray of dawn to the last star of night their minds rested only in one another.',
          'Lalit was the most celebrated singer in the court of King Pundarika. When his voice rose through the assembly hall, the courtiers were spellbound, and the king himself nodded in praise of his art. Music was for him no mere livelihood; it was the very speech of his soul.',
          'Yet even amid that life of comfort and renown, Lalit’s heart was forever drawn toward the nearness of Lalita. Wherever he sang, the memory of his beloved would ripple silently within him, as though the breath of the two were pulsing to one and the same rhythm.',
        ],
      },
      {
        id: 'shrap-aur-rakshas',
        titleHi: 'राजा का शाप और राक्षस रूप',
        titleEn: 'The King’s Curse and the Demon Form',
        bodyHi: [
          'एक दिन राजसभा में ललित गान प्रस्तुत कर रहा था कि उसका मन अकस्मात अपनी प्रिया ललिता की ओर भटक गया। प्रिया के स्मरण में वह ऐसा खो गया कि उसका स्वर डगमगा उठा और ताल भी बिखर गया; जो संगीत सदा निर्दोष बहता था, वही उस क्षण लड़खड़ा गया।',
          'उसी सभा में नागराज कर्कोटक उपस्थित था। उसने राजा पुंडरीक से कहा, "हे राजन्, यह गायक आपके सम्मुख गाते हुए भी अपनी पत्नी के विचारों में डूबा हुआ है; इसका मन आपकी सभा में नहीं है।" यह सुनकर राजा का मुख क्रोध से तमतमा उठा।',
          'कुपित राजा ने तत्काल शाप दे दिया, "जब तेरा मन मनुष्य की भाँति वासना में ही भटकता है, तो तू अपना दिव्य गंधर्व रूप त्याग दे और भयानक मांसभक्षी राक्षस बन जा!" शाप के उच्चारित होते ही ललित का सुंदर शरीर विकृत हो उठा; उसकी देह विशाल, कुरूप और भयावह पिशाच में बदल गई।',
          'उसी क्षण से ललित घोर वनों में भटकने लगा। उसका कंठ जो कभी मधुर राग बिखेरता था, अब केवल भूख और पीड़ा की चीत्कार करता था। दिन-रात वह उस राक्षसी देह के भार और संताप में जलता रहा, और अपने पूर्व जीवन का स्मरण कर अनवरत रुदन करता।',
        ],
        bodyEn: [
          'One day, as Lalit was presenting his song in the royal assembly, his mind suddenly wandered toward his beloved Lalita. So lost did he become in the remembrance of her that his voice faltered and his rhythm scattered; the music that had always flowed flawlessly stumbled in that very moment.',
          'In that same assembly was present Karkotaka, the king of serpents. He said to King Pundarika, "O king, even while singing before you, this minstrel is drowned in thoughts of his wife; his mind is not in your court." Hearing this, the king’s face flushed with anger.',
          'The enraged king at once pronounced a curse: "Since your mind wanders in mortal craving even here, cast off your divine gandharva form and become a fearsome, flesh-eating demon!" No sooner were the words spoken than Lalit’s beautiful body was disfigured; his frame turned into a vast, hideous, and terrifying pishacha.',
          'From that moment Lalit roamed the dense forests. His throat, which had once scattered sweet melodies, now only shrieked with hunger and pain. Day and night he burned beneath the weight and anguish of that demonic body, and weeping endlessly, he remembered the life that had been taken from him.',
        ],
      },
      {
        id: 'lalita-ki-khoj',
        titleHi: 'ललिता की खोज और शृंगी ऋषि का उपदेश',
        titleEn: 'Lalita’s Search and Sage Shringi’s Counsel',
        bodyHi: [
          'अपने प्रियतम की यह दुर्दशा देखकर ललिता का हृदय फट पड़ा, किंतु उसने धैर्य न छोड़ा। वह उसी विकराल राक्षस के पीछे-पीछे वनों में चलती रही, काँटों और कंकड़ों की चिंता किए बिना, इस आशा से कि कहीं तो उसके पति की मुक्ति का कोई उपाय मिलेगा।',
          'भटकते-भटकते वह विंध्य पर्वत पर पहुँची, जहाँ तपस्वी शृंगी ऋषि का पवित्र आश्रम था। ललिता ने ऋषि के चरणों में सिर रखकर अपनी सारी व्यथा कह सुनाई और विनती की, "हे करुणामय मुनि, मेरे स्वामी को इस भयानक शाप से छुड़ाने का कोई मार्ग बतलाइए।"',
          'दयालु ऋषि उसके अटल प्रेम और श्रद्धा से द्रवित हो उठे। उन्होंने कहा, "हे साध्वी, चैत्र शुक्ल पक्ष की कामदा एकादशी समीप है। तू पूर्ण श्रद्धा से इस व्रत का पालन कर, और इसके समस्त पुण्य-फल को अपने पति को अर्पित कर दे। यह एकादशी पाप और शाप दोनों का नाश करने वाली है।"',
          'मुनि के वचन सुनकर ललिता के मुख पर आशा की किरण फूट पड़ी। उसने हाथ जोड़कर संकल्प किया कि वह इस व्रत को पूर्ण निष्ठा से करेगी, और उसका एक-एक पुण्य अपने प्राणाधार ललित के उद्धार के लिए ही समर्पित होगा।',
        ],
        bodyEn: [
          'Seeing this plight of her beloved, Lalita’s heart broke, yet she did not abandon her courage. She followed the dreadful demon through the forests, heedless of thorns and stones, in the hope that somewhere she would find a remedy for her husband’s release.',
          'Wandering on, she reached the Vindhya mountain, where stood the sacred hermitage of the ascetic sage Shringi. Lalita laid her head at the sage’s feet, poured out all her grief, and pleaded, "O compassionate sage, show me some path to free my husband from this terrible curse."',
          'The kind sage was moved by her steadfast love and faith. He said, "O virtuous woman, the Kamada Ekadashi of the bright fortnight of Chaitra draws near. Observe this vow with complete faith, and offer all its merit to your husband. This ekadashi destroys both sins and curses."',
          'Hearing the sage’s words, a ray of hope broke across Lalita’s face. With folded hands she resolved that she would keep this vow with utter devotion, and that each particle of its merit would be dedicated solely to the deliverance of Lalit, the very breath of her life.',
        ],
      },
      {
        id: 'vrat-aur-mukti',
        titleHi: 'व्रत का पालन और ललित की मुक्ति',
        titleEn: 'The Vow Observed and Lalit’s Release',
        bodyHi: [
          'कामदा एकादशी के पवित्र दिन ललिता ने नियमपूर्वक व्रत धारण किया। उसने स्नान कर शुद्ध हृदय से भगवान विष्णु का पूजन किया, दिनभर उपवास रखा और रात्रि जागरण में हरि-नाम का स्मरण करती रही। उसके मन में न भूख की चिंता थी, न देह की थकान, केवल अपने पति के कल्याण की एक ही पुकार थी।',
          'भगवान विष्णु के सम्मुख खड़ी होकर ललिता ने हाथ जोड़े और कहा, "हे प्रभु, इस व्रत से जो भी पुण्य मैंने अर्जित किया है, वह सब मैं अपने स्वामी ललित को अर्पित करती हूँ। उसका शाप मिट जाए और वह पुनः अपने दिव्य रूप को प्राप्त करे।" उसके वचन प्रेम और श्रद्धा से भीगे हुए थे।',
          'कामदा एकादशी के प्रभाव से ललित का भीषण शाप उसी क्षण टूट गया। उसकी राक्षसी देह झड़ गई, और वह पुनः अपने उज्ज्वल, मनोहर गंधर्व रूप में प्रकट हुआ। दोनों के नेत्रों से आनंद के अश्रु बह निकले, और बिछड़े हुए दंपति फिर से एक हो गए।',
          'व्रत के दिव्य फल से वे दोनों उस सांसारिक पीड़ा से ऊपर उठकर श्रेष्ठ लोकों को प्राप्त हुए। "कामदा" अर्थात् समस्त मनोकामनाओं को पूर्ण करने वाली—यह एकादशी जो श्रद्धा से इसका पालन करता है, उसके पाप ही नहीं, घोर शाप तक हर लेती है, और मनवांछित फल प्रदान करती है। ललित और ललिता की यह गाथा आज भी इसी सत्य की साक्षी है।',
        ],
        bodyEn: [
          'On the holy day of Kamada Ekadashi, Lalita undertook the vow according to the prescribed rules. Bathing and worshipping Lord Vishnu with a pure heart, she fasted the whole day and kept the night vigil remembering the name of Hari. In her mind there was no concern for hunger, no weariness of the body, only the single cry for her husband’s welfare.',
          'Standing before Lord Vishnu, Lalita folded her hands and said, "O Lord, whatever merit I have gained through this vow, all of it I offer to my husband Lalit. May his curse be erased and may he regain his divine form once more." Her words were soaked in love and faith.',
          'By the power of Kamada Ekadashi, Lalit’s grievous curse broke in that very instant. His demonic body fell away, and he appeared again in his radiant, captivating gandharva form. Tears of joy flowed from the eyes of both, and the long-separated couple were reunited once more.',
          'Through the divine fruit of the vow, the two rose above that worldly suffering and attained the higher worlds. "Kamada" means the fulfiller of every desire—this ekadashi, for whoever observes it with faith, removes not only sins but even the most terrible of curses, and grants the cherished fruit of the heart. The tale of Lalit and Lalita stands to this day as a witness to this very truth.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'varuthini-ekadashi-katha',
    titleHi: 'वरूथिनी एकादशी व्रत कथा',
    titleEn: 'Varuthini Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/varuthini-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'krishna-instructs-yudhishthira',
        titleHi: 'श्रीकृष्ण का उपदेश',
        titleEn: 'Krishna Instructs Yudhishthira',
        bodyHi: [
          'धर्मराज युधिष्ठिर ने हाथ जोड़कर भगवान श्रीकृष्ण से पूछा, हे जनार्दन, वैशाख मास के कृष्ण पक्ष में आने वाली एकादशी का क्या नाम है, और उसका व्रत करने से जीव को कौन सा फल प्राप्त होता है, यह कृपा करके मुझे बताइए।',
          'भगवान श्रीकृष्ण मुस्कुराए और बोले, हे राजन, इस पवित्र एकादशी का नाम वरूथिनी एकादशी है। वरूथ का अर्थ है कवच, और यह व्रत मनुष्य के चारों ओर पुण्य का कवच बाँध देता है, जो इस लोक में और परलोक में उसकी रक्षा करता है।',
          'जो मनुष्य श्रद्धा और भक्ति के साथ इस व्रत को धारण करता है, उसके समस्त पाप धुल जाते हैं, उसका दुर्भाग्य समाप्त हो जाता है, और उसे अपार सौभाग्य की प्राप्ति होती है। इस व्रत का माहात्म्य अति प्राचीन है, और इसकी एक कथा भी है, जिसे सुनकर मनुष्य भयमुक्त हो जाता है।',
          'श्रीकृष्ण ने कहा, हे युधिष्ठिर, ध्यान देकर सुनो। बहुत प्राचीन काल में नर्मदा नदी के तट पर एक महान राजा रहता था, जिसका नाम मान्धाता था। वह तप में लीन रहने वाला, सत्य का पालन करने वाला और भगवान विष्णु का अनन्य भक्त था।',
        ],
        bodyEn: [
          'Dharmaraja Yudhishthira folded his hands and asked Lord Krishna, O Janardana, what is the name of the Ekadashi that falls in the dark fortnight of the month of Vaishakha, and what fruit does a soul obtain by observing its fast? Please be kind enough to tell me.',
          'Lord Krishna smiled and said, O King, this sacred Ekadashi is named Varuthini Ekadashi. The word varutha means armour, and this vow fastens a protective armour of merit around a person, guarding him in this world and in the world beyond.',
          'Whoever holds this fast with faith and devotion has all his sins washed away, his misfortune brought to an end, and boundless good fortune bestowed upon him. The glory of this vow is very ancient, and there is a tale attached to it which, once heard, makes a person free of fear.',
          'Krishna continued, O Yudhishthira, listen with attention. In a very ancient age, on the bank of the river Narmada, there dwelt a great king whose name was Mandhata. He was absorbed in penance, a keeper of truth, and a single-minded devotee of Lord Vishnu.',
        ],
      },
      {
        id: 'penance-on-the-narmada',
        titleHi: 'नर्मदा तट पर तपस्या',
        titleEn: 'Penance on the Narmada',
        bodyHi: [
          'राजा मान्धाता को अपने राजसी वैभव से अधिक प्रेम तपस्या से था। एक बार वह अपना राजपाट छोड़कर वन में चला गया और नर्मदा के एकांत तट पर एक वृक्ष के नीचे आसन लगाकर गहन तप में बैठ गया।',
          'दिन बीते, ऋतुएँ बदलीं, परन्तु राजा अपने आसन से नहीं हिला। उसकी आँखें मुँदी हुई थीं, मन भगवान जनार्दन के चरणों में स्थिर था, और श्वास मानो रुक सी गई थी। उसकी तपस्या इतनी प्रबल थी कि वन के पशु-पक्षी भी उसके निकट निर्भय होकर विचरने लगे।',
          'उस घोर तप में राजा को न भूख की चिंता थी, न प्यास की, न शरीर की। वह तो केवल यही चाहता था कि उसका मन तनिक भी विचलित न हो, और भगवान विष्णु के ध्यान में उसका एक-एक क्षण लीन रहे।',
          'किन्तु जैसा कि सच्चे तपस्वियों के जीवन में होता है, उसकी इस अटल साधना की परीक्षा का समय निकट आ पहुँचा, और एक अप्रत्याशित संकट उस शांत वन में चला आया।',
        ],
        bodyEn: [
          'King Mandhata loved penance more than his royal splendour. Once he left behind his kingdom and went away into the forest, where he spread his seat beneath a tree on a lonely bank of the Narmada and sat down in deep austerity.',
          'Days passed and the seasons changed, yet the king did not stir from his seat. His eyes were closed, his mind fixed at the feet of Lord Janardana, and his breath seemed almost to have stilled. So powerful was his penance that even the beasts and birds of the forest began to wander near him without fear.',
          'In that severe austerity the king had no thought of hunger, none of thirst, none of the body. He desired only this, that his mind should not waver in the slightest, and that each and every moment of his should remain absorbed in the meditation of Lord Vishnu.',
          'But as it happens in the lives of true ascetics, the time drew near for his unshakable practice to be tested, and an unexpected calamity made its way into that quiet forest.',
        ],
      },
      {
        id: 'the-bear-attacks',
        titleHi: 'भालू का आक्रमण',
        titleEn: 'The Bear Attacks',
        bodyHi: [
          'एक दिन, जब राजा मान्धाता उसी प्रकार समाधि में लीन था, वन की झाड़ियों से एक विशाल और हिंसक भालू निकल आया। वह सूँघता हुआ राजा के समीप पहुँचा और निर्भय तपस्वी को देखकर उस पर टूट पड़ा।',
          'भालू ने राजा के पैर को अपने दाँतों में पकड़ लिया और उसे कुतरते हुए धीरे-धीरे घसीटने लगा। तीव्र पीड़ा उठी, रक्त बहने लगा, किन्तु राजा ने अपनी आँखें नहीं खोलीं और न ही अपना ध्यान भंग किया।',
          'राजा ने सोचा, यदि मैं अब क्रोध या भय से अपनी समाधि तोड़ दूँ, तो मेरी इतने काल की तपस्या व्यर्थ हो जाएगी। इसलिए उसने अपने शरीर की पीड़ा को सहते हुए भी अपने आराध्य का स्मरण नहीं छोड़ा।',
          'अंत में, असह्य वेदना में भी मन को स्थिर रखते हुए राजा ने भीतर ही भीतर भगवान विष्णु को पुकारा, हे जनार्दन, हे शरणागत के रक्षक, मैं आपकी शरण में हूँ, आप ही मेरी रक्षा कीजिए।',
        ],
        bodyEn: [
          'One day, while King Mandhata was thus absorbed in deep meditation, a huge and ferocious bear emerged from the thickets of the forest. Sniffing its way, it came close to the king, and seeing the fearless ascetic, it fell upon him.',
          'The bear seized the kings foot in its teeth and, gnawing at it, began to drag him slowly away. A sharp pain arose, blood began to flow, yet the king neither opened his eyes nor broke his concentration.',
          'The king thought, if I now break my meditation out of anger or fear, the penance of all this long time will be rendered fruitless. And so, even while enduring the agony of his body, he did not abandon the remembrance of his beloved Lord.',
          'At last, holding his mind steady even in unbearable anguish, the king called out inwardly to Lord Vishnu, O Janardana, O protector of those who take refuge, I am in your shelter, you alone must save me.',
        ],
      },
      {
        id: 'vishnu-grants-refuge',
        titleHi: 'विष्णु की शरण',
        titleEn: 'Vishnu Grants Refuge',
        bodyHi: [
          'भक्त की करुण पुकार सुनकर भगवान विष्णु तत्क्षण वहाँ प्रकट हुए। उनके हाथ में सुदर्शन चक्र चमक रहा था। एक ही क्षण में उन्होंने उस हिंसक भालू का वध कर दिया और राजा को उसके पंजों से मुक्त किया।',
          'किन्तु तब तक भालू राजा का एक पैर खा चुका था, और राजा का सुन्दर शरीर खंडित हो गया था। राजा भगवान के चरणों में गिरकर अपनी पीड़ा और अपनी अधूरी देह को देखकर व्याकुल हो उठा।',
          'भगवान विष्णु ने स्नेहपूर्वक राजा को सान्त्वना देते हुए कहा, हे राजन, शोक मत करो। तुम मथुरा पुरी को जाओ, वहाँ मेरे विग्रह की श्रद्धा से पूजा करो, और वैशाख कृष्ण पक्ष की वरूथिनी एकादशी का व्रत पूर्ण विधि से करो।',
          'भगवान बोले, उसी व्रत के प्रभाव से तुम्हारा यह कटा हुआ अंग पुनः पूर्ण हो जाएगा, तुम्हारा सौन्दर्य लौट आएगा, और तुम्हारे समस्त पाप नष्ट हो जाएँगे। यह सुनकर राजा का मुख आशा से खिल उठा और वह भगवान को प्रणाम करके मथुरा की ओर चल पड़ा।',
        ],
        bodyEn: [
          'Hearing the piteous cry of his devotee, Lord Vishnu appeared there in an instant. In his hand the Sudarshana chakra was blazing. In a single moment he slew the ferocious bear and freed the king from its claws.',
          'But by then the bear had already devoured one of the kings feet, and the kings beautiful body had been left maimed. Falling at the Lords feet, the king grew distraught at the sight of his pain and his incomplete body.',
          'Lord Vishnu, consoling the king with affection, said, O King, do not grieve. Go to the city of Mathura, worship my deity there with faith, and observe the Varuthini Ekadashi of the dark fortnight of Vaishakha with full rite.',
          'The Lord said, by the power of that very vow this severed limb of yours will be made whole again, your beauty will return, and all your sins will be destroyed. Hearing this, the kings face blossomed with hope, and bowing to the Lord he set out toward Mathura.',
        ],
      },
      {
        id: 'restoration-and-phala',
        titleHi: 'पुनरुद्धार और फल',
        titleEn: 'Restoration and the Fruit of the Vow',
        bodyHi: [
          'मथुरा पहुँचकर राजा मान्धाता ने भगवान के श्रीविग्रह के सम्मुख पूर्ण श्रद्धा और एकाग्रता से वरूथिनी एकादशी का व्रत किया। उसने उपवास रखा, रात्रि में जागरण किया, और निरंतर जनार्दन के नाम का स्मरण करता रहा।',
          'व्रत के पुण्य-प्रभाव से वह चमत्कार घटित हुआ जिसका वचन स्वयं भगवान ने दिया था। राजा का कटा हुआ पैर पुनः पूर्ण हो गया, उसकी देह पहले से भी अधिक तेजस्वी और सुन्दर हो उठी, और उसका मन सब प्रकार के पापों से मुक्त हो गया।',
          'इस प्रकार वरूथिनी एकादशी ने राजा के लिए सचमुच एक कवच का कार्य किया, जिसने उसकी रक्षा भी की और उसका उद्धार भी। अंत में राजा मान्धाता ने दीर्घकाल तक धर्मपूर्वक राज्य किया और अपने जीवन के अंत में उत्तम गति को प्राप्त हुआ।',
          'श्रीकृष्ण ने कहा, हे युधिष्ठिर, इसी से जान लो कि यह व्रत महान दानों के समान फल देने वाला है। जो मनुष्य जनार्दन में भक्ति रखकर वरूथिनी एकादशी का व्रत करता है, उसे इस लोक और परलोक में निर्भय रक्षा प्राप्त होती है, मानो उसने पुण्य का कवच धारण कर लिया हो।',
          'जो श्रद्धालु इस कथा को सुनता या पढ़ता है, और जो श्रद्धा से इस व्रत को धारण करता है, उसके पाप दूर होते हैं, उसका दुर्भाग्य मिटता है, उसे अखंड सौभाग्य और रक्षा का वरदान मिलता है, और अंत में वह वैकुण्ठ धाम को प्राप्त करता है।',
        ],
        bodyEn: [
          'Arriving in Mathura, King Mandhata observed the Varuthini Ekadashi before the sacred image of the Lord with full faith and concentration. He kept the fast, stayed awake through the night in vigil, and ceaselessly remembered the name of Janardana.',
          'By the merit and power of the vow, that very miracle came to pass which the Lord himself had promised. The kings severed foot became whole once more, his body grew more radiant and beautiful than before, and his mind was freed of every kind of sin.',
          'In this way the Varuthini Ekadashi truly acted as an armour for the king, one that both protected him and delivered him. In the end King Mandhata ruled righteously for a long age and, at the close of his life, attained the highest state.',
          'Krishna said, O Yudhishthira, know from this that this vow bestows fruit equal to that of great gifts. Whoever observes the Varuthini Ekadashi keeping devotion in Janardana receives fearless protection in this world and the next, as though he had clothed himself in an armour of merit.',
          'The faithful one who hears or reads this tale, and who holds this vow with devotion, has his sins removed, his misfortune erased, the boon of unbroken good fortune and protection granted to him, and in the end attains the abode of Vaikuntha.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'mohini-ekadashi-katha',
    titleHi: 'मोहिनी एकादशी व्रत कथा',
    titleEn: 'Mohini Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/mohini-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'bhadravati-merchant',
        titleHi: 'भद्रावती का धनी व्यापारी',
        titleEn: 'The wealthy merchant of Bhadravati',
        bodyHi: [
          'सरस्वती नदी के तट पर भद्रावती नाम की एक सुंदर नगरी बसी थी, जहां धर्म और सच्चाई का राज था। उसी नगरी में धनपाल नाम का एक धनवान व्यापारी रहता था। वह उदार हृदय का था, भगवान विष्णु का परम भक्त था, और दान-पुण्य में सदा आगे रहता था। नगर के निर्धन और पीड़ित लोग उसके द्वार से कभी खाली हाथ नहीं लौटते थे।',
          'धनपाल के पांच पुत्र थे, और उन सबमें सबसे छोटा धृष्टबुद्धि नाम का पुत्र था। चार पुत्र पिता के समान धर्म के मार्ग पर चलते थे, परंतु धृष्टबुद्धि का स्वभाव बिलकुल विपरीत था। बचपन से ही वह उद्दंड, हठी और कुसंगति में रहने वाला था।',
          'जैसे-जैसे वह बड़ा होता गया, उसके दुर्गुण और गहरे होते गए। वह जुए में, मद्यपान में और बुरे लोगों की संगति में डूबता चला गया। पिता की कमाई हुई संपत्ति उसके लिए केवल भोग और बर्बादी का साधन बन गई।',
        ],
        bodyEn: [
          'On the bank of the Saraswati river stood the beautiful city of Bhadravati, where dharma and truth held sway. In that city lived a wealthy merchant named Dhanapala. He was generous of heart, a devoted worshipper of Lord Vishnu, and ever foremost in charity and good works. The poor and the suffering of the city never returned empty-handed from his door.',
          'Dhanapala had five sons, and the youngest among them was named Dhrishtabuddhi. Four of the sons walked the path of dharma like their father, but Dhrishtabuddhi was entirely the opposite in nature. From childhood he had been insolent, stubborn, and drawn to bad company.',
          'As he grew, his vices only deepened. He sank into gambling, into drink, and into the company of wicked men. The wealth his father had so carefully earned became for him nothing but a means of indulgence and ruin.',
        ],
      },
      {
        id: 'cast-out',
        titleHi: 'घर से निष्कासन और दुर्दशा',
        titleEn: 'Cast out and fallen into misery',
        bodyHi: [
          'धृष्टबुद्धि के कुकर्म दिन-प्रतिदिन बढ़ते गए। उसने कुलटा स्त्रियों की संगति की, धन को बुरे कामों में उड़ाया और परिवार का सम्मान धूल में मिला दिया। जब उसके पाप असहनीय हो गए, तब पिता और भाइयों ने भारी मन से उसे घर से निकाल दिया।',
          'सब कुछ छिन जाने पर धृष्टबुद्धि निराश्रित होकर इधर-उधर भटकने लगा। भूख और प्यास से व्याकुल वह दर-दर भटकता रहा, पर अब उसे कोई सहारा देने वाला न था। अपने ही दुर्व्यवहार के कारण वह सबकी दृष्टि में गिर चुका था।',
          'पेट की आग बुझाने के लिए वह चोरी करने लगा। पकड़े जाने पर उसे अपमान और दंड भी सहना पड़ा। धीरे-धीरे वह गहन दुख और पश्चात्ताप के सागर में डूब गया, परंतु अपने पापों से निकलने का मार्ग उसे सूझ नहीं रहा था।',
        ],
        bodyEn: [
          'Day by day Dhrishtabuddhi sank further into wrongdoing. He kept the company of fallen women, squandered the wealth on base deeds, and dragged the honor of his family into the dust. When his sins grew unbearable, his father and brothers, with heavy hearts, cast him out of the home.',
          'Stripped of everything, Dhrishtabuddhi wandered here and there with no shelter. Tormented by hunger and thirst, he roamed from door to door, but now there was no one to give him support. Through his own misconduct he had fallen low in the eyes of all.',
          'To quiet the fire in his belly he turned to theft. When caught, he had to endure insult and punishment as well. Little by little he sank into an ocean of deep sorrow and remorse, yet he could see no path by which to escape his own sins.',
        ],
      },
      {
        id: 'kaundinya-ashram',
        titleHi: 'महर्षि कौण्डिन्य के आश्रम में',
        titleEn: 'At the ashram of sage Kaundinya',
        bodyHi: [
          'भटकते-भटकते एक दिन धृष्टबुद्धि गंगा के तट पर बसे महर्षि कौण्डिन्य के शांत आश्रम में जा पहुंचा। वहां की पवित्र वायु और तपस्वियों की प्रशांत उपस्थिति में उसके भीतर एक अनोखी विनम्रता जागने लगी।',
          'उसी समय स्नान करके लौटते हुए ऋषि के भीगे वस्त्रों से कुछ जल की बूंदें धृष्टबुद्धि पर जा गिरीं। उन पवित्र बूंदों के स्पर्श मात्र से उसके बहुत-से पाप हलके पड़ गए और उसका मन कुछ निर्मल हुआ। तब उसने हाथ जोड़कर ऋषि के चरणों में सिर झुका दिया।',
          '"हे करुणामय मुनिवर," उसने गिड़गिड़ाते हुए कहा, "मैंने जीवन भर केवल पाप ही किए हैं। मैंने अपने कुल को कलंकित किया और अपने पिता का अपमान किया। अब मुझे कोई ऐसा सरल उपाय बताइए जिससे बिना अधिक कष्ट के मेरे जन्मों के पाप धुल जाएं।"',
          'महर्षि कौण्डिन्य ने उस पर दयादृष्टि डाली। उन्होंने उसके भीतर जागे पश्चात्ताप को पहचान लिया और उसे उद्धार का मार्ग दिखाने का निश्चय किया।',
        ],
        bodyEn: [
          'Wandering on, Dhrishtabuddhi one day arrived at the peaceful ashram of sage Kaundinya, set upon the bank of the Ganga. In its sacred air, amid the serene presence of the ascetics, a strange humility began to stir within him.',
          'At that very moment, as the sage returned from his bath, a few drops of water fell upon Dhrishtabuddhi from his wet garments. At the mere touch of those holy drops, many of his sins grew lighter and his mind became somewhat purified. Then he folded his hands and bowed his head at the feet of the sage.',
          '"O compassionate sage," he pleaded, "all my life I have done nothing but sin. I have stained my lineage and dishonored my own father. Now show me some simple means by which the sins of my many lives may be washed away without great hardship."',
          'Sage Kaundinya cast upon him a gaze of mercy. He recognized the remorse that had awakened within the man and resolved to show him the path of deliverance.',
        ],
      },
      {
        id: 'mohini-vow',
        titleHi: 'मोहिनी एकादशी का व्रत',
        titleEn: 'The vow of Mohini Ekadashi',
        bodyHi: [
          'महर्षि कौण्डिन्य बोले, "हे पुत्र, सुनो। वैशाख मास के शुक्ल पक्ष में आने वाली एकादशी मोहिनी एकादशी कहलाती है। यह वही एकादशी है जो भगवान विष्णु के उस मोहिनी रूप के नाम पर पड़ी, जिसे धारण कर उन्होंने दैत्यों को मोहित किया और अमृत की रक्षा की थी।"',
          '"इस व्रत की महिमा अपार है। यदि तुम पूर्ण श्रद्धा और संयम से इसका पालन करोगे, उपवास रखोगे, भगवान विष्णु का स्मरण करोगे और कथा सुनोगे, तो जैसे मोहिनी रूप ने दैत्यों के छल को परास्त किया, वैसे ही यह व्रत तुम्हारे भीतर के मोह और पाप का नाश कर देगा।"',
          'धृष्टबुद्धि ने श्रद्धापूर्वक ऋषि का उपदेश ग्रहण किया। उसने विधिपूर्वक मोहिनी एकादशी का व्रत किया, समस्त इंद्रियों को संयमित रखा, भगवान विष्णु के चरणों में अपना मन लगाया और रात्रि में जागरण कर भजन-कीर्तन किया।',
          'उस व्रत के प्रभाव से उसके अनेक जन्मों के पाप भस्म हो गए। उसका हृदय निर्मल हो उठा और भीतर का मोह छंट गया। शेष जीवन उसने धर्म और भक्ति में बिताया, और अंत समय में अपने पापमय स्वभाव को त्यागकर वह दिव्य रूप धारण कर भगवान विष्णु के परम धाम को प्राप्त हुआ।',
          'इसीलिए कहा जाता है कि मोहिनी एकादशी का व्रत आत्मा को बांधने वाले मोह और पाप दोनों को हर लेता है। जो भक्त इसे श्रद्धा से करता है, उसके सारे पाप नष्ट हो जाते हैं, मन का भ्रम मिटता है, और अंत में उसे मुक्ति तथा विष्णु के धाम की प्राप्ति होती है।',
        ],
        bodyEn: [
          'Sage Kaundinya said, "O son, listen. The Ekadashi that falls in the bright fortnight of the month of Vaishakha is called Mohini Ekadashi. It is the very Ekadashi named for that enchanting Mohini form which Lord Vishnu assumed, by which he beguiled the demons and protected the nectar of immortality."',
          '"The glory of this vow is boundless. If you observe it with full faith and restraint, keeping the fast, remembering Lord Vishnu, and listening to its katha, then just as the Mohini form overcame the deceit of the demons, so too will this vow destroy the delusion and the sin that dwell within you."',
          'Dhrishtabuddhi received the teaching of the sage with reverence. He observed the Mohini Ekadashi vow according to the rite, held all his senses in restraint, fixed his mind upon the feet of Lord Vishnu, and kept vigil through the night with hymns and devotional singing.',
          'By the power of that vow, the sins of his many lives were burned to ashes. His heart grew pure and the delusion within him fell away. He passed the rest of his life in dharma and devotion, and at his final hour, casting off his sinful nature, he took on a divine form and attained the supreme abode of Lord Vishnu.',
          'For this reason it is said that the vow of Mohini Ekadashi removes both the delusion and the sin that bind the soul. The devotee who observes it with faith has all his sins destroyed, the confusion of the mind dispelled, and in the end attains liberation and the abode of Vishnu.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'apara-ekadashi-katha',
    titleHi: 'अपरा एकादशी व्रत कथा',
    titleEn: 'Apara Ekadashi Katha',
    sourceUrls: ['https://www.drikpanchang.com/vrat-katha/ekadashi/apara-ekadashi-vrat-katha.html'],
    sections: [
      {
        id: 'do-bhai',
        titleHi: 'महीध्वज और वज्रध्वज',
        titleEn: 'Mahidhwaja and Vajradhwaja',
        bodyHi: [
          'बहुत समय पहले एक समृद्ध राज्य में महीध्वज नामक राजा शासन करते थे। वे धर्म के मार्ग पर चलने वाले, न्यायप्रिय और सत्यवादी राजा थे। उनकी प्रजा उन्हें पिता के समान मानती थी, क्योंकि वे निर्धन और असहाय की रक्षा अपने प्राणों की तरह करते थे। उनके दरबार में कभी अन्याय को आश्रय नहीं मिला, और इसी कारण दूर-दूर तक उनकी कीर्ति फैली हुई थी।',
          'राजा महीध्वज का एक छोटा भाई था, जिसका नाम वज्रध्वज था। बड़े भाई के यश और प्रेम के बीच भी उसके हृदय में ईर्ष्या की आग धधकती रहती थी। वह क्रूर स्वभाव का था और मन ही मन यह सहन नहीं कर पाता था कि प्रजा उसके बड़े भाई को इतना सम्मान देती है, जबकि उसका अपना नाम कोई आदर से नहीं लेता।',
          'वज्रध्वज का यह द्वेष दिन-प्रतिदिन बढ़ता गया। बड़े भाई के प्रति उसके मन में जो विष भरता गया, वह अंततः एक भयानक पाप का रूप लेने को तैयार हो गया। जैसे सूखी लकड़ी में चिंगारी पड़ते ही आग भड़क उठती है, वैसे ही ईर्ष्या ने उसके विवेक को जला डाला।',
        ],
        bodyEn: [
          'Long ago, in a prosperous kingdom, there ruled a king named Mahidhwaja. He walked the path of dharma, loved justice, and never strayed from truth. His subjects regarded him as a father, for he guarded the poor and the helpless as though he were guarding his own life. Injustice never found shelter in his court, and because of this his fame spread far and wide.',
          'King Mahidhwaja had a younger brother named Vajradhwaja. Even amid the fame and love that surrounded the elder brother, a fire of jealousy smouldered in the younger one heart. He was cruel by nature and could not bear, even in the secret chambers of his mind, that the people honoured his elder brother so deeply while no one spoke his own name with respect.',
          'This resentment in Vajradhwaja grew with each passing day. The poison that filled his heart against his elder brother slowly ripened into the seed of a dreadful sin. Just as a single spark sets dry wood ablaze, so jealousy burned away whatever wisdom he once possessed.',
        ],
      },
      {
        id: 'peepal-ki-chhaya',
        titleHi: 'पीपल के नीचे छिपा पाप',
        titleEn: 'The sin hidden beneath the peepal',
        bodyHi: [
          'एक रात्रि, जब समूचा राज्य निद्रा में डूबा हुआ था, वज्रध्वज ने अपने हृदय की कलुषता को कर्म में बदल दिया। उसने अवसर पाकर अपने बड़े भाई महीध्वज की हत्या कर दी। ईर्ष्या से अंधे उस क्रूर भाई ने अपने ही रक्त-संबंधी का वध किया और तनिक भी न काँपा।',
          'पाप को छिपाने के लिए वह राजा के शव को गुप्त रूप से एक घने वन में ले गया। वहाँ एक विशाल पीपल का वृक्ष खड़ा था। वज्रध्वज ने उसी पीपल के नीचे अपने भाई के शरीर को गाड़ दिया, यह सोचकर कि अब इस रहस्य को कोई कभी नहीं जान पाएगा।',
          'किंतु जो मृत्यु अकाल में और हिंसा से आई हो, वह सहज गति नहीं पाती। महीध्वज की आत्मा को न मुक्ति मिली, न शांति। अतृप्त और व्याकुल वह आत्मा एक भयंकर प्रेत बनकर उसी पीपल वृक्ष पर निवास करने लगी, जिसके नीचे उसका शरीर दबा हुआ था।',
          'अब उस मार्ग से जो भी पथिक गुजरता, यह प्रेत उसे भयभीत करता और सताता। उसकी पीड़ा इतनी गहरी थी कि वह सुख पाने के स्थान पर औरों को भी कष्ट देने लगा। दिन हो या रात, वह वन का वह भाग आतंक का स्थान बन गया।',
        ],
        bodyEn: [
          'One night, when the entire kingdom lay sunk in sleep, Vajradhwaja turned the foulness of his heart into deed. Seizing his chance, he murdered his elder brother Mahidhwaja. Blinded by envy, the cruel man slew his own kinsman and did not tremble in the least.',
          'To conceal the sin, he carried the king body in secret into a dense forest. There stood a great peepal tree. Beneath that very peepal Vajradhwaja buried his brother body, certain that no one would ever learn the secret.',
          'But a death that comes untimely and through violence does not find an easy passage onward. Mahidhwaja soul received neither liberation nor peace. Restless and tormented, that spirit became a fearsome ghost, a preta, and took up its dwelling in the very peepal tree under which its body lay buried.',
          'Now whoever passed along that road, this ghost would frighten and torment. Its own anguish ran so deep that, instead of finding any ease, it inflicted suffering on others as well. By day and by night, that part of the forest became a place of terror.',
        ],
      },
      {
        id: 'dhaumya-ki-karuna',
        titleHi: 'धौम्य ऋषि की करुणा',
        titleEn: 'The compassion of sage Dhaumya',
        bodyHi: [
          'एक दिन उसी वन के मार्ग से धौम्य नामक एक तपस्वी ऋषि निकले। वे तप और ज्ञान से सम्पन्न थे, और उनका हृदय करुणा से भरा हुआ था। जैसे ही वे उस पीपल वृक्ष के निकट पहुँचे, अपने अंतर्ज्ञान से उन्होंने वहाँ बसे प्रेत के दुःख और उसके पीछे छिपे सत्य को जान लिया।',
          'ऋषि ने न तो भय खाया और न ही उस पीड़ित आत्मा से घृणा की। उन्होंने अपने तपोबल से प्रेत को वृक्ष से नीचे बुलाया और कोमल वाणी में पूछा, "हे आत्मा, किस पाप और किस अकाल मृत्यु ने तुझे यह भयंकर योनि दी है? अपना दुःख मुझे कह।" प्रेत ने अपनी पूरी व्यथा ऋषि के सामने प्रकट कर दी।',
          'महीध्वज की दशा सुनकर धौम्य का करुणामय हृदय द्रवित हो उठा। उन्होंने उस तड़पती आत्मा को सांत्वना दी और कहा, "धैर्य रख। तेरे उद्धार का उपाय है। ज्येष्ठ मास के कृष्ण पक्ष की अपरा एकादशी का व्रत असीम और अपार पुण्य देता है। उसी पुण्य से तेरी मुक्ति होगी।"',
          'दयालु ऋषि ने केवल उपदेश ही नहीं दिया, अपितु स्वयं ही उस अपरा एकादशी का व्रत विधिपूर्वक धारण किया। व्रत, जागरण और भगवान विष्णु के स्मरण से अर्जित उस सम्पूर्ण अपार पुण्य को उन्होंने अपने लिए न रखकर महीध्वज की आत्मा की मुक्ति के लिए संकल्प सहित अर्पित कर दिया।',
        ],
        bodyEn: [
          'One day, along that very forest road, there came an ascetic sage named Dhaumya. He was rich in austerity and wisdom, and his heart was full of compassion. As soon as he drew near the peepal tree, through his inner sight he perceived the suffering of the ghost dwelling there and the truth hidden behind it.',
          'The sage neither felt afraid nor felt revulsion toward the tormented spirit. By the power of his austerity he called the ghost down from the tree and asked in a gentle voice, "O spirit, what sin and what untimely death have cast you into this terrible form? Tell me your sorrow." The ghost laid its whole anguish before the sage.',
          'Hearing the plight of Mahidhwaja, the compassionate heart of Dhaumya melted. He consoled that writhing soul and said, "Be patient. There is a means for your deliverance. The vow of Apara Ekadashi, on the Krishna Paksha of the month of Jyeshtha, grants limitless and boundless merit. By that very merit you shall be freed."',
          'The merciful sage did not merely give counsel. He himself observed that Apara Ekadashi vow according to its rites. The entire boundless merit earned through fasting, vigil, and remembrance of Lord Vishnu he did not keep for himself; with solemn resolve he dedicated it all to the liberation of Mahidhwaja soul.',
        ],
      },
      {
        id: 'mukti-aur-phala',
        titleHi: 'मुक्ति और व्रत का फल',
        titleEn: 'Liberation and the fruit of the vow',
        bodyHi: [
          'अपरा एकादशी के अपार पुण्य का प्रभाव तत्काल प्रकट हुआ। जिस प्रेत-योनि में महीध्वज की आत्मा वर्षों से बंधी हुई थी, वह बंधन टूट गया। उसका भयंकर प्रेत रूप विलीन हो गया और उसने एक दिव्य, तेजोमय शरीर धारण कर लिया।',
          'दिव्य रूप में स्थित होकर राजा महीध्वज ने हाथ जोड़कर धौम्य ऋषि को प्रणाम किया और कहा, "हे करुणामय ऋषि, आपने अपने पुण्य का दान देकर मुझे इस घोर यातना से उबार लिया। आपका यह उपकार अपार है।" फिर एक देव-विमान आकाश से उतरा और राजा उस पर आरूढ़ होकर स्वर्गलोक की ओर प्रस्थान कर गए।',
          'धौम्य ऋषि उस दृश्य को देखकर भगवान विष्णु की महिमा और अपरा एकादशी के माहात्म्य पर मन ही मन नतमस्तक हो गए। उन्होंने अनुभव किया कि एक ही व्रत का पुण्य दूसरे को अर्पित किया जाए, तो वह अकाल मृत्यु से ग्रस्त आत्मा को भी ऊँचे लोक तक पहुँचा सकता है।',
          'यही अपरा एकादशी का अपार फल है। यह व्रत मिथ्या आरोप, झूठी गवाही और ब्रह्म-हत्या जैसे घोर पापों को भी धो डालता है। जो श्रद्धा और संयम के साथ इस एकादशी को धारण करता है, उसे इस लोक में यश और अंत में मुक्ति प्राप्त होती है, क्योंकि अपरा एकादशी का पुण्य सचमुच असीम और अपार है।',
        ],
        bodyEn: [
          'The effect of the boundless merit of Apara Ekadashi appeared at once. The bondage of the ghostly form in which Mahidhwaja soul had been bound for years was broken. His fearsome preta shape dissolved, and he assumed a divine, radiant body.',
          'Standing in that divine form, King Mahidhwaja folded his hands, bowed to sage Dhaumya, and said, "O compassionate sage, by the gift of your merit you have lifted me out of this terrible torment. Your kindness toward me is beyond measure." Then a celestial chariot descended from the sky, and the king, mounting it, set forth toward the heavenly realm.',
          'Watching that sight, sage Dhaumya bowed within his heart before the glory of Lord Vishnu and the greatness of Apara Ekadashi. He understood that when the merit of a single vow is offered to another, it can carry even a soul seized by untimely death up to the highest worlds.',
          'Such is the boundless fruit of Apara Ekadashi. This vow washes away even grave sins such as false accusation, false witness, and the slaughter of a Brahmin. Whoever keeps this Ekadashi with faith and restraint gains fame in this world and liberation at the last, for the merit of Apara Ekadashi is truly limitless and without end.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'satyanarayana-vrat-katha',
    titleHi: 'श्री सत्यनारायण व्रत कथा',
    titleEn: 'Shri Satyanarayana Vrat Katha',
    sourceUrls: [
      'https://www.drikpanchang.com/vrat-katha/satyanarayana/chapters/pratham-adhyay/satyanarayana-katha-pratham-adhyay.html',
      'https://www.drikpanchang.com/vrat-katha/satyanarayana/chapters/dwitiya-adhyay/satyanarayana-katha-dwitiya-adhyay.html',
      'https://www.drikpanchang.com/vrat-katha/satyanarayana/chapters/tritiya-adhyay/satyanarayana-katha-tritiya-adhyay.html',
      'https://www.drikpanchang.com/vrat-katha/satyanarayana/chapters/chaturth-adhyay/satyanarayana-katha-chaturth-adhyay.html',
      'https://www.drikpanchang.com/vrat-katha/satyanarayana/chapters/pancham-adhyay/satyanarayana-katha-pancham-adhyay.html',
    ],
    sections: [
      {
        id: 'adhyay-1',
        titleHi: 'प्रथम अध्याय: ऋषियों का प्रश्न और व्रत की विधि',
        titleEn: 'Chapter 1: The sages ask and the vow is revealed',
        bodyHi: [
          'नैमिषारण्य के पवित्र वातावरण में शौनकादि ऋषि सूत जी से पूछते हैं कि कलियुग में साधारण मनुष्यों के लिए कौन सा ऐसा सरल साधन है जिससे उन्हें भक्ति, पुण्य और दुःखों से निवृत्ति मिले। वे जानते हैं कि हर व्यक्ति वेदों का गहन अध्ययन नहीं कर सकता, पर हर मन में ईश्वर के समीप जाने की इच्छा रहती है।',
          'सूत जी उत्तर देते हैं कि यह प्रश्न देवर्षि नारद ने भी भगवान विष्णु से किया था। नारद ने पृथ्वी पर लोगों को रोग, अभाव, असत्य, मानसिक क्लेश और परिवार की उलझनों से व्याकुल देखा। वे वैकुंठ गए और भगवान से पूछा कि कम साधन, कम समय और सरल श्रद्धा से कौन सा व्रत मनुष्य को कल्याण दे सकता है।',
          'भगवान विष्णु ने श्री सत्यनारायण व्रत का उपदेश दिया। उन्होंने बताया कि भक्त संध्या के समय, परिवार और बंधु-बांधवों के साथ, भगवान सत्यनारायण की पूजा करे। केले, दूध, घी, गुड़ या शक्कर, गेहूं का आटा, फल और नैवेद्य जैसी उपलब्ध वस्तुओं से श्रद्धा रखकर अर्पण किया जाए।',
          'व्रत में कथा-श्रवण, ब्राह्मणों और अतिथियों का सत्कार, प्रसाद-वितरण, भोजन और रात्रि में भगवान का स्मरण बताया गया। कथा का आरंभ ही यह स्पष्ट करता है कि सत्यनारायण पूजा वैभव की नहीं, सत्य, संकल्प और साझा प्रसाद की पूजा है। कलियुग के लिए इसका महत्व इसलिए है कि यह कठिन तपस्या के बजाय गृहस्थ जीवन में सत्य को प्रतिष्ठित करता है।',
        ],
        bodyEn: [
          'In the sacred setting of Naimisharanya, the sages led by Shaunaka ask Suta ji which simple discipline can help ordinary people in Kali Yuga receive devotion, merit, and relief from suffering. They know that not everyone can study the Vedas deeply, yet every heart seeks a way to come closer to the Divine.',
          'Suta ji explains that Devarshi Narada once asked Lord Vishnu the same question. Narada had seen people on earth disturbed by illness, poverty, untruth, mental pain, and family troubles. He went to Vaikuntha and asked the Lord for a vow that could be practiced with limited means, limited time, and sincere faith.',
          'Lord Vishnu revealed the vow of Shri Satyanarayana. The devotee should worship in the evening with family and relatives, offering what is available with devotion: banana, milk, ghee, jaggery or sugar, wheat flour, fruit, and naivedya. The value is not in luxury but in honest intention.',
          'The vow includes listening to the katha, honoring Brahmins and guests, distributing prasada, sharing food, and spending the night in remembrance of the Lord. The first chapter makes the heart of the practice clear: Satyanarayana worship is a household discipline of truth, promise, and shared grace, especially suited to Kali Yuga.',
        ],
      },
      {
        id: 'adhyay-2',
        titleHi: 'द्वितीय अध्याय: गरीब ब्राह्मण और लकड़हारे का कल्याण',
        titleEn: 'Chapter 2: The poor Brahmin and the woodcutter prosper',
        bodyHi: [
          'दूसरे अध्याय में काशी के एक निर्धन ब्राह्मण का प्रसंग आता है। वह भिक्षा से जीवन चलाता था और प्रतिदिन चिंता में डूबा रहता था। भगवान सत्यनारायण वृद्ध ब्राह्मण का रूप धारण कर उसके सामने आए और उसे विधिपूर्वक व्रत करने की प्रेरणा दी।',
          'ब्राह्मण ने निश्चय किया कि वह यह व्रत अवश्य करेगा। अगले दिन वह भिक्षा मांगने निकला तो उसे सामान्य से अधिक धन मिला। उसने उसी धन से पूजा की सामग्री ली, परिवार और बंधुओं को बुलाया, विधिपूर्वक भगवान सत्यनारायण की पूजा की और कथा सुनकर प्रसाद बांटा।',
          'व्रत के प्रभाव से उसके घर में अन्न, धन और संतोष बढ़ा। वह मास-दर-मास इस व्रत को करने लगा। कथा यह नहीं कहती कि धन अपने आप आकाश से गिरता है; वह बताती है कि श्रद्धा, संकल्प और सत्य जीवन को व्यवस्थित करते हैं और अभाव में भी आशा का द्वार खोलते हैं।',
          'इसी ब्राह्मण के घर एक वृद्ध लकड़हारा आया। उसने पूजा देखकर पूछा कि यह किस देवता का व्रत है और क्या फल देता है। ब्राह्मण ने उसे सत्यनारायण व्रत बताया। लकड़हारे ने संकल्प किया कि उस दिन लकड़ी बेचकर जो धन मिलेगा, उसी से वह पूजा करेगा। उसे चार गुना मूल्य मिला, उसने सामग्री खरीदी, परिवार सहित व्रत किया और अंत में धन-धान्य तथा वैकुंठगति का फल पाया।',
        ],
        bodyEn: [
          'The second chapter tells of a poor Brahmin in Kashi who lived on alms and carried constant anxiety. Lord Satyanarayana appeared before him in the form of an elderly Brahmin and encouraged him to perform the vow properly.',
          'The Brahmin resolved to do it. The next day, when he went out for alms, he received more than usual. With that money he bought the worship materials, gathered his family and relatives, performed the puja, listened to the katha, and distributed prasada.',
          'Through the vow, food, means, and contentment increased in his home. He began to observe the vrata every month. The story does not reduce the fruit to magical wealth; it teaches that faith, resolve, and truthful living bring order to life and open the door of hope even amid poverty.',
          'A woodcutter later came to the Brahmin home, saw the worship, and asked which deity was being honored and what fruit the vow gives. The Brahmin explained Satyanarayana Vrat. The woodcutter resolved to use that day earnings for the worship. He received four times the usual price for his wood, bought the materials, worshipped with his family, and eventually received prosperity and the path to Vaikuntha.',
        ],
      },
      {
        id: 'adhyay-3',
        titleHi: 'तृतीय अध्याय: उल्कामुख राजा और साधु वैश्य का वचन',
        titleEn: 'Chapter 3: King Ulkamukha and the merchant vow',
        bodyHi: [
          'तीसरे अध्याय में राजा उल्कामुख का वर्णन आता है। वे सत्यवक्ता, जितेन्द्रिय और दानी राजा थे। एक दिन वे अपनी पत्नी के साथ भद्रशीला नदी के तट पर पुत्र-प्राप्ति और लोकमंगल के लिए श्री सत्यनारायण व्रत कर रहे थे।',
          'उसी समय साधु नामक एक वैश्य अपनी नाव और व्यापारिक धन के साथ वहां आया। उसने राजा से पूछा कि यह कौन सा व्रत है। राजा ने उसे विधि बताई। वैश्य ने भी संकल्प किया कि यदि उसे संतान मिलेगी तो वह यह व्रत करेगा। भगवान की कृपा से उसके घर कन्या हुई, जिसका नाम कलावती रखा गया।',
          'समय बीतता गया। पत्नी लीलावती ने बार-बार पति को संकल्प याद दिलाया, पर वैश्य ने बेटी के विवाह के बाद व्रत करने की बात कहकर टाल दिया। विवाह के बाद भी वह अपने जामाता के साथ व्यापार के लिए समुद्र यात्रा पर चला गया और व्रत फिर अधूरा रह गया।',
          'भगवान सत्यनारायण की लीला से दोनों व्यापारियों पर संकट आया। एक राजा ने संदेहवश उन्हें बंदी बना लिया और उनका धन भी रुक गया। घर पर लीलावती और कलावती निर्धनता, भूख और चिंता से दुखी हुईं। कलावती ने एक ब्राह्मण के घर सत्यनारायण पूजा देखी, कथा सुनी, प्रसाद लिया और घर आकर माता को बताया। तब लीलावती ने भूल स्वीकारकर व्रत किया और भगवान से पति तथा जामाता की मुक्ति मांगी।',
        ],
        bodyEn: [
          'The third chapter introduces King Ulkamukha, a truthful, self-controlled, and charitable ruler. One day, he and his wife were performing Shri Satyanarayana Vrat on the bank of the Bhadrasheela river, praying for a child and for the welfare of the people.',
          'At that time, a merchant named Sadhu arrived with his boat and trading wealth. He asked the king about the vow. The king explained the method. The merchant resolved that if he received a child, he too would perform the vrata. By the Lord grace, a daughter was born to his household and was named Kalavati.',
          'Time passed. His wife Leelavati repeatedly reminded him of his promise, but the merchant postponed the vow, saying he would perform it after the daughter marriage. Even after the marriage, he left for overseas trade with his son-in-law, and the vow remained unfulfilled.',
          'Through the Lord lila, misfortune came upon the two traders. A king suspected them, imprisoned them, and seized their wealth. At home, Leelavati and Kalavati suffered poverty, hunger, and worry. Kalavati saw Satyanarayana worship in a Brahmin home, heard the katha, received prasada, and told her mother. Leelavati then accepted the lapse, performed the vow, and prayed for the return of her husband and son-in-law.',
        ],
      },
      {
        id: 'adhyay-4',
        titleHi: 'चतुर्थ अध्याय: नाव, दण्डी स्वामी और प्रसाद की भूल',
        titleEn: 'Chapter 4: The boat, the ascetic, and the forgotten prasada',
        bodyHi: [
          'चौथे अध्याय में राजा को स्वप्न में भगवान का आदेश मिलता है कि बंदी वैश्य निर्दोष हैं। उन्हें मुक्त किया जाए और उनका धन लौटा दिया जाए। राजा भय और श्रद्धा से जागता है, उन्हें सम्मान देकर छोड़ता है और वैश्य का व्यापार फिर से चलता है।',
          'नगर लौटते समय भगवान सत्यनारायण दण्डी स्वामी के रूप में साधु वैश्य की परीक्षा लेते हैं। वे पूछते हैं कि नाव में क्या है। वैश्य अहंकार और असावधानी से कह देता है कि नाव में धन नहीं, केवल पत्ते हैं। जब वह लौटकर देखता है, तो धन सचमुच पत्तों के समान निरर्थक हो गया है।',
          'वैश्य को अपनी भूल समझ आती है। वह विनयपूर्वक भगवान की स्तुति करता है, क्षमा मांगता है और सत्य का आश्रय लेता है। भगवान प्रसन्न होते हैं, उसका धन पुनः प्रकट होता है और वह पूजा का संकल्प करके नगर की ओर आगे बढ़ता है।',
          'घर पर लीलावती और कलावती पूजा कर रही होती हैं। पति और जामाता के आने का समाचार सुनकर कलावती प्रसाद ग्रहण किए बिना ही मिलने दौड़ पड़ती है। उसी क्षण जामाता सहित नाव डूबने जैसी विपत्ति आती है। जब उसे बताया जाता है कि प्रसाद छोड़ा गया है, वह लौटकर श्रद्धा से प्रसाद ग्रहण करती है। तब संकट शांत होता है और परिवार पूर्ण होता है।',
        ],
        bodyEn: [
          'In the fourth chapter, the king receives a dream command from the Lord: the imprisoned merchants are innocent, and their wealth must be returned. The king wakes with fear and reverence, releases them with honor, and the merchant trade is restored.',
          'On the way home, Lord Satyanarayana appears as a staff-bearing ascetic and tests Sadhu the merchant. He asks what is in the boat. Out of arrogance and carelessness, the merchant says that there is no wealth, only leaves. When he returns to the boat, the wealth has become as useless as leaves.',
          'The merchant understands his mistake. He praises the Lord with humility, asks forgiveness, and returns to truth. The Lord is pleased, the wealth reappears, and the merchant continues toward home with a renewed promise to worship.',
          'At home, Leelavati and Kalavati are performing the puja. When news arrives that the husband and son-in-law are near, Kalavati runs to meet them without taking prasada. At once, danger comes upon the boat and her husband. When she is told that prasada was left behind, she returns, receives it with devotion, and the crisis settles. The family is reunited.',
        ],
      },
      {
        id: 'adhyay-5',
        titleHi: 'पंचम अध्याय: तुंगध्वज राजा और प्रसाद का सम्मान',
        titleEn: 'Chapter 5: King Tungadhwaja and honoring prasada',
        bodyHi: [
          'पांचवें अध्याय में तुंगध्वज नामक राजा का प्रसंग आता है। वह अपनी प्रजा की चिंता करने वाला राजा था, पर एक दिन वन में शिकार के बाद उसने ग्वालों को श्रद्धा से सत्यनारायण पूजा करते देखा। राज-अभिमान के कारण वह न पूजा में गया, न प्रणाम किया।',
          'ग्वालों ने आदर से उसे प्रसाद अर्पित किया, पर उसने प्रसाद स्वीकार नहीं किया और नगर लौट गया। इसके बाद उसके राज्य, धन, पुत्र और परिवार पर विपत्ति आई। राजा ने समझा कि उसने भगवान सत्यदेव के प्रसाद और भक्तों की श्रद्धा का अपमान किया है।',
          'वह वापस ग्वालों के पास गया, विनम्रता से पूजा की, प्रसाद ग्रहण किया और भगवान सत्यनारायण से क्षमा मांगी। कृपा से उसका राज्य, परिवार और सुख फिर पूर्ववत हुआ। यह अध्याय बताता है कि प्रसाद केवल भोजन नहीं, ईश्वर-कृपा को स्वीकार करने का संस्कार है।',
          'अंत में सूत जी व्रत का फल बताते हैं। निर्धन को साधन, बंधन में पड़े को मुक्ति, निःसंतान को संतान और भयभीत को धैर्य प्राप्त होता है। कथा पूर्व पात्रों के अगले जन्मों का भी स्मरण कराती है: शतानंद ब्राह्मण सुदामा के रूप में, उल्कामुख दशरथ के रूप में, साधु वैश्य मोरध्वज के रूप में, तुंगध्वज मनु के रूप में और लकड़हारा निषादराज गुह के रूप में भगवान की सेवा से ऊंचे लोकों को प्राप्त होते हैं।',
        ],
        bodyEn: [
          'The fifth chapter tells of King Tungadhwaja. He cared for his subjects, but one day after hunting in the forest he saw cowherds worshipping Satyanarayana with devotion. Because of royal pride, he neither joined the worship nor bowed to the Lord.',
          'The cowherds respectfully offered him prasada, but he refused it and returned to the city. Afterward, misfortune touched his kingdom, wealth, children, and household. The king understood that he had insulted the prasada of Lord Satyadeva and the faith of the devotees.',
          'He returned to the cowherds, worshipped with humility, received the prasada, and asked Lord Satyanarayana for forgiveness. By grace, his kingdom, family, and happiness were restored. This chapter teaches that prasada is not mere food; it is the discipline of receiving divine grace with reverence.',
          'Suta ji then describes the fruit of the vow. The poor receive means, the bound become free, the childless receive children, and the fearful receive courage. The chapter also remembers the later births of earlier figures: Shatananda the Brahmin as Sudama, Ulkamukha as Dasharatha, Sadhu the merchant as Mordhwaja, Tungadhwaja as Manu, and the woodcutter as Nishada king Guha, all elevated through service to the Lord.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'ekadashi-vrat-katha',
    titleHi: 'एकादशी व्रत कथा',
    titleEn: 'Ekadashi Vrat Katha',
    sections: [
      {
        id: 'vishnu-discipline',
        titleHi: 'विष्णु-स्मरण का दिन',
        titleEn: 'A day for remembering Vishnu',
        bodyHi: [
          'एकादशी कथाओं का केंद्र भगवान विष्णु का स्मरण, इंद्रिय संयम और मन की शुद्धि है। चंद्र पक्ष की ग्यारहवीं तिथि पर अन्न, आलस्य और अनियंत्रित इच्छा से दूरी रखकर भक्त अपने भीतर की चंचलता को देखता है।',
          'कथा परंपरा में अलग-अलग मास की एकादशियां अलग फल और प्रसंग रखती हैं, पर मूल भाव एक ही है। मनुष्य जब नाम-स्मरण, जप, दान और उपवास से अपने जीवन को हल्का करता है, तब वह विष्णु के संरक्षण को अधिक स्पष्ट अनुभव करता है।',
        ],
        bodyEn: [
          'Ekadashi stories center on remembrance of Lord Vishnu, restraint of the senses, and purification of attention. On the eleventh lunar day, the devotee steps back from heavy food, laziness, and uncontrolled desire in order to observe the restlessness within.',
          'Different monthly Ekadashis carry different legends and promised fruits, but the underlying movement is the same. Through nama-smarana, japa, charity, and fasting, a person makes life lighter and becomes more receptive to the protecting presence of Vishnu.',
        ],
      },
      {
        id: 'king-devotee',
        titleHi: 'भक्त राजा का भाव',
        titleEn: 'The devotion of a righteous king',
        bodyHi: [
          'कई एकादशी कथाओं में राजा, गृहस्थ या पाप से दुखी व्यक्ति विष्णु भक्ति का आश्रय लेता है। वह केवल वर पाने के लिए उपवास नहीं करता, बल्कि अपने आचरण को बदलने का संकल्प करता है। कथा में यही परिवर्तन वास्तविक पुण्य बनता है।',
          'जब भक्त रात्रि जागरण, कथा-श्रवण और नाम-जप करता है, तब उसके भीतर छिपा भय कम होता है। वह समझता है कि व्रत शरीर को दंड देना नहीं है; यह मन को सही दिशा देने का अभ्यास है ताकि कर्म में दया, सत्य और नियंत्रण आए।',
        ],
        bodyEn: [
          'Many Ekadashi narratives describe a king, householder, or troubled person taking refuge in Vishnu bhakti. The devotee does not fast merely to obtain a boon; he or she resolves to change conduct. In the story tradition, that inner change becomes the real merit.',
          'When the devotee keeps vigil, listens to sacred narration, and chants the name of Vishnu, hidden fear begins to settle. The fast is not punishment of the body; it is a discipline that redirects the mind so that action can carry truth, compassion, and restraint.',
        ],
      },
      {
        id: 'dwadashi-completion',
        titleHi: 'द्वादशी पर पूर्णता',
        titleEn: 'Completion on Dwadashi',
        bodyHi: [
          'एकादशी का व्रत द्वादशी पारण से पूरा होता है। कथा इस बात पर जोर देती है कि संकल्प का आरंभ जितना महत्वपूर्ण है, उसका सही समापन भी उतना ही आवश्यक है। समय पर पारण, विनम्र भोजन और दान व्रत को संतुलित बनाते हैं।',
          'यदि उपवास से अहंकार बढ़े तो साधना अधूरी रह जाती है। इसलिए एकादशी कथा भक्त को सावधान करती है कि वह अपनी तपस्या का प्रदर्शन न करे। भगवान विष्णु को प्रिय वह संयम है जिसमें करुणा बनी रहे और परिवार तथा अतिथि का आदर न टूटे।',
        ],
        bodyEn: [
          'The Ekadashi vow is completed through Dwadashi parana. The stories emphasize that beginning a vow matters, but completing it correctly matters just as much. Timely parana, modest food, and charity keep the discipline balanced.',
          'If fasting produces pride, the practice remains incomplete. The katha therefore cautions the devotee not to display austerity. Vishnu is pleased by restraint that still preserves compassion, hospitality, and respect for family responsibilities.',
        ],
      },
      {
        id: 'shared-message',
        titleHi: 'सभी एकादशियों का संदेश',
        titleEn: 'The shared message of Ekadashi',
        bodyHi: [
          'कामदा, मोहिनी, निर्जला, देवशयनी, पापांकुशा और मोक्षदा जैसी एकादशियां अपने-अपने प्रसंगों में दोष से मुक्ति, रक्षा, जागरण और मोक्ष की प्रेरणा देती हैं। भक्त महीने भर की भागदौड़ के बीच एक दिन आत्मनिरीक्षण के लिए निकालता है।',
          'इसलिए ऐप में सामान्य एकादशी कथा को मूल मार्गदर्शक कथा की तरह रखा गया है। जब किसी खास मास की कथा उपलब्ध हो, वह इस मूल भावना को और विस्तार देती है; लेकिन हर एकादशी का हृदय विष्णु-स्मरण, संयम और करुणामय जीवन है।',
        ],
        bodyEn: [
          'Kamada, Mohini, Nirjala, Devshayani, Papankusha, Mokshada, and other Ekadashis inspire release from harmful tendencies, divine protection, wakefulness, and liberation through their own episodes. The devotee sets aside one day amid monthly busyness for honest self-examination.',
          'For that reason, the app treats the general Ekadashi katha as the guiding narrative. When a specific monthly story is available, it expands the same core idea; every Ekadashi still points back to remembrance of Vishnu, disciplined living, and compassionate action.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'utpanna-ekadashi-katha',
    titleHi: 'उत्पन्ना एकादशी कथा',
    titleEn: 'Utpanna Ekadashi Katha',
    sections: [
      {
        id: 'mura-threat',
        titleHi: 'मुर दैत्य का उत्पात',
        titleEn: 'The threat of Mura',
        bodyHi: [
          'पुराण-परंपरा में उत्पन्ना एकादशी को एकादशी शक्ति के प्रकट होने से जोड़ा जाता है। मुर नामक दैत्य ने देवताओं और धर्ममार्ग पर चलने वालों को भयभीत कर दिया। देवताओं ने भगवान विष्णु की शरण ली, क्योंकि साधारण बल से उसका अहंकार शांत नहीं हो रहा था।',
          'भगवान विष्णु ने दैत्य से युद्ध किया। युद्ध लंबा चला और भगवान विश्राम के लिए एक गुफा में गए। मुर ने सोते हुए विष्णु पर आक्रमण करने की सोची। कथा यहां दिखाती है कि अधर्म अवसर देखकर भी मर्यादा नहीं समझता।',
        ],
        bodyEn: [
          'In the Puranic tradition, Utpanna Ekadashi is linked with the manifestation of the power called Ekadashi. A demon named Mura frightened the devas and those who followed dharma. The devas took refuge in Lord Vishnu because ordinary strength could not quiet his arrogance.',
          'Vishnu fought the demon for a long time and then rested in a cave. Mura planned to attack while the Lord appeared to be asleep. The story presents adharma as a force that looks for weakness but does not understand restraint or sacred boundaries.',
        ],
      },
      {
        id: 'ekadashi-devi',
        titleHi: 'एकादशी देवी का प्राकट्य',
        titleEn: 'The manifestation of Ekadashi Devi',
        bodyHi: [
          'उसी समय भगवान की तेजस्विनी शक्ति एक दिव्य कन्या के रूप में प्रकट हुई। उसने मुर को रोककर उसका नाश किया। जब भगवान विष्णु जागे, उन्होंने उस शक्ति को वर देने की इच्छा जताई और पूछा कि वह कौन है।',
          'देवी ने कहा कि वह भगवान की ही रक्षा-शक्ति है। विष्णु ने उसे एकादशी नाम दिया और वर दिया कि जो भक्त इस तिथि पर श्रद्धा से उपवास, स्मरण और संयम करेंगे, वे पाप-वृत्ति से दूर होकर उनके समीप आएंगे।',
        ],
        bodyEn: [
          'At that moment the radiant power of the Lord manifested as a divine maiden. She stopped Mura and destroyed him. When Vishnu awakened, he wished to grant her a boon and asked who she was.',
          'The goddess explained that she was the protecting energy of the Lord himself. Vishnu named her Ekadashi and blessed the tithi, declaring that devotees who observe it with fasting, remembrance, and restraint would move away from sinful tendencies and come nearer to him.',
        ],
      },
      {
        id: 'origin-vow',
        titleHi: 'व्रत की शुरुआत',
        titleEn: 'The beginning of the vow',
        bodyHi: [
          'उत्पन्ना एकादशी इसलिए एकादशी व्रत की आरंभिक कथा मानी जाती है। इसमें उपवास को केवल भोजन-त्याग नहीं, बल्कि भीतर के मुर - हिंसा, आलस्य, छल और अनियंत्रित इच्छा - से युद्ध कहा गया है।',
          'भक्त जब इस दिन जागरण, जप और कथा करता है, तो वह अपने भीतर की रक्षा-शक्ति को जगाता है। कथा का आशय यह नहीं कि भय बाहर ही है; कई बार सबसे कठिन संघर्ष अपनी आदतों और दुर्बलताओं से होता है।',
        ],
        bodyEn: [
          'Utpanna Ekadashi is therefore treated as an origin story for the Ekadashi observance. Fasting is not presented as mere avoidance of food; it is a battle against the inner Mura: violence, laziness, deceit, and uncontrolled desire.',
          'When a devotee keeps vigil, chants, and listens to the katha on this day, the protecting strength within is awakened. The story does not place danger only outside us; often the hardest struggle is with our own habits and weaknesses.',
        ],
      },
      {
        id: 'observance-message',
        titleHi: 'साधना का संदेश',
        titleEn: 'The discipline it teaches',
        bodyHi: [
          'मार्गशीर्ष कृष्ण एकादशी पर यह कथा भक्त को याद दिलाती है कि विष्णु भक्ति सजगता मांगती है। सोता हुआ विवेक दैत्य-वृत्ति को अवसर देता है, पर जागती हुई श्रद्धा उसे रोक सकती है।',
          'इसलिए उत्पन्ना एकादशी में व्रत, कथा, दान और द्वादशी पारण को संतुलित रूप से किया जाता है। भक्त भगवान से केवल बाहरी संकट हटाने की प्रार्थना नहीं करता; वह अपने भीतर धर्म की रक्षा करने वाली शक्ति भी मांगता है।',
        ],
        bodyEn: [
          'On Margashirsha Krishna Ekadashi, this katha reminds the devotee that Vishnu bhakti requires alertness. Sleeping discernment gives destructive impulses an opening, while awakened devotion can stop them.',
          'The observance is therefore practiced through fasting, katha, charity, and proper Dwadashi parana. The devotee does not pray only for outer danger to be removed; he or she also asks for the inner strength that protects dharma.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'dwadashi-vrat-katha',
    titleHi: 'द्वादशी व्रत कथा',
    titleEn: 'Dwadashi Vrat Katha',
    sections: [
      {
        id: 'ambarisha-vow',
        titleHi: 'राजा अम्बरीष का नियम',
        titleEn: 'King Ambarisha keeps his vow',
        bodyHi: [
          'द्वादशी कथा में राजा अम्बरीष का प्रसंग प्रमुख माना जाता है। वे भगवान विष्णु के भक्त थे और एकादशी उपवास के बाद द्वादशी पर नियत समय में पारण को धर्म का भाग मानते थे। उनके लिए व्रत केवल त्याग नहीं, समय, मर्यादा और विनम्रता का पालन था।',
          'एक बार महर्षि दुर्वासा अतिथि बनकर आए। राजा ने उनका आदर किया और पारण से पहले भोजन के लिए आमंत्रित किया। ऋषि स्नान के लिए गए, पर लौटने में देर हुई। द्वादशी का समय निकलने लगा और राजा धर्म-संकट में पड़ गए।',
        ],
        bodyEn: [
          'The Dwadashi story is often told through the episode of King Ambarisha. He was devoted to Lord Vishnu and treated the timely completion of the Ekadashi fast on Dwadashi as part of dharma. For him, the vow was not only abstinence; it was discipline, timing, and humility.',
          'Once Sage Durvasa arrived as a guest. The king honored him and invited him to eat before the parana. The sage went to bathe, but his return was delayed. The Dwadashi time began to pass, and the king faced a difficult conflict between honoring a guest and completing the vow correctly.',
        ],
      },
      {
        id: 'water-parana',
        titleHi: 'जल से पारण',
        titleEn: 'Parana with water',
        bodyHi: [
          'विद्वानों से पूछकर अम्बरीष ने केवल जल ग्रहण किया, ताकि व्रत भी न टूटे और अतिथि से पहले भोजन भी न हो। जब दुर्वासा लौटे तो उन्हें लगा कि राजा ने उनका अपमान किया है। क्रोध में उन्होंने राजा को शाप देने का प्रयास किया।',
          'भगवान विष्णु का सुदर्शन चक्र भक्त की रक्षा के लिए प्रकट हुआ। दुर्वासा लोकों में भागे, पर कहीं शांति नहीं मिली। अंत में उन्हें समझ आया कि विष्णु भक्त का अपमान भगवान स्वयं सहन नहीं करते।',
        ],
        bodyEn: [
          'After consulting the learned, Ambarisha sipped only water, so that the vow would be ritually completed while he still did not eat before his guest. When Durvasa returned, he felt insulted and tried to curse the king in anger.',
          'The Sudarshana Chakra of Lord Vishnu appeared to protect the devotee. Durvasa fled through different realms but found no shelter. At last he understood that the Lord does not ignore the humiliation of a sincere devotee.',
        ],
      },
      {
        id: 'forgiveness',
        titleHi: 'क्षमा और अतिथि-सत्कार',
        titleEn: 'Forgiveness and hospitality',
        bodyHi: [
          'दुर्वासा राजा के पास लौटे और क्षमा मांगी। अम्बरीष ने कोई घमंड नहीं दिखाया। उन्होंने ऋषि को सम्मान दिया, भोजन कराया और स्वयं बाद में प्रसाद ग्रहण किया। कथा में भक्त की सबसे बड़ी शक्ति उसका संयम और क्षमा है।',
          'यह प्रसंग द्वादशी का गहरा अर्थ बताता है। व्रत का समापन विधि से करना आवश्यक है, लेकिन विधि को अहंकार या कठोरता का कारण नहीं बनाना चाहिए। अम्बरीष ने नियम और विनम्रता दोनों को साथ रखा।',
        ],
        bodyEn: [
          'Durvasa returned to the king and asked forgiveness. Ambarisha showed no pride. He honored the sage, served him food, and only later accepted prasada himself. The story presents restraint and forgiveness as the true strength of a devotee.',
          'This episode explains the deeper meaning of Dwadashi. A vow should be completed according to rule, but rule should not become an excuse for pride or harshness. Ambarisha held discipline and humility together.',
        ],
      },
      {
        id: 'completion-message',
        titleHi: 'संकल्प का सही समापन',
        titleEn: 'Completing the resolve correctly',
        bodyHi: [
          'द्वादशी व्रत कथा उपयोगकर्ता को बताती है कि एकादशी के बाद पारण कोई छोटा विवरण नहीं है। यह संकल्प को पूर्ण करने, शरीर को संतुलित लौटाने और भोजन को प्रसाद मानकर ग्रहण करने का क्षण है।',
          'समय पर पारण, दान, अतिथि-सत्कार और विष्णु-स्मरण द्वादशी का भाव बनाते हैं। कथा सिखाती है कि धर्म तब सुंदर होता है जब नियम के साथ करुणा और आचरण के साथ विनम्रता बनी रहे।',
        ],
        bodyEn: [
          'The Dwadashi katha teaches that parana after Ekadashi is not a minor detail. It is the moment of completing the resolve, returning the body to balance, and receiving food as prasada rather than indulgence.',
          'Timely parana, charity, hospitality, and remembrance of Vishnu form the spirit of Dwadashi. The story teaches that dharma becomes beautiful when rule is joined with compassion and conduct is joined with humility.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'sankashti-chaturthi-vrat-katha',
    titleHi: 'संकष्टी चतुर्थी व्रत कथा',
    titleEn: 'Sankashti Chaturthi Vrat Katha',
    sourceUrls: [
      'https://www.drikpanchang.com/vrat-katha/sankashti/sankashti-chaturthi-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/sankashti/bhalachandra/bhalachandra-sankashti-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/sankashti/vikata/vikata-sankashti-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/sankashti/ganadhipa/ganadhipa-sankashti-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/sankashti/lambodara/lambodara-sankashti-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/sankashti/heramba/heramba-sankashti-vrat-katha.html',
    ],
    sections: [
      {
        id: 'monthly-cycle',
        titleHi: 'मासिक संकष्टी कथा-संग्रह का आरंभ',
        titleEn: 'Opening the monthly Sankashti story cycle',
        bodyHi: [
          'संकष्टी चतुर्थी एक अकेली कथा तक सीमित नहीं है। परंपरा में माता पार्वती भगवान गणेश से अलग-अलग महीनों की कृष्ण पक्ष चतुर्थी के नाम, विधि, भोग और कथा पूछती हैं। गणेश जी बताते हैं कि प्रत्येक मास में उनका एक रूप स्मरण किया जाता है और संकट के स्वरूप के अनुसार कथा भी अलग रंग लेती है।',
          'इस व्रत का सामान्य भाव है दिनभर संयम, गणेश पूजन, कथा-श्रवण, चंद्र-दर्शन के बाद अर्घ्य और फिर प्रसाद। चतुर्थी का चंद्र मन की चंचलता को याद दिलाता है, और गणेश पूजा उस मन को विवेक, धैर्य और सही आरंभ में स्थिर करती है। इसलिए संकष्टी का अर्थ केवल दुःख से मुक्ति नहीं, संकट को समझने की बुद्धि भी है।',
          'ऐप में यह प्रविष्टि कथा-संग्रह के रूप में रखी गई है, क्योंकि स्रोतों में संकष्टी के अनेक मासिक प्रसंग मिलते हैं। नीचे दिए गए प्रसंग भालचन्द्र, विकट, गणाधिप, लम्बोदर और हेरम्ब रूपों से जुड़े हैं। ये सभी मिलकर बताते हैं कि गणेश-कृपा परिवार, राज्य, संतति, यात्रा, पुनर्मिलन और आत्म-परिवर्तन तक फैली हुई है।',
        ],
        bodyEn: [
          'Sankashti Chaturthi is not held by one single story alone. In the traditional cycle, Mother Parvati asks Lord Ganesha about the names, procedure, offerings, and stories connected with Krishna Paksha Chaturthi in different lunar months. Ganesha explains that each month remembers a distinct form and each story addresses a different kind of trouble.',
          'The common rhythm of the vow is restraint through the day, Ganesha worship, listening to the katha, moon sighting followed by arghya, and then receiving prasada. The Chaturthi moon reminds the devotee of the restless mind, while Ganesha worship brings that mind toward discernment, steadiness, and a right beginning. Sankashti therefore means not only relief from distress, but wisdom in the middle of distress.',
          'This app entry is shaped as a story collection because the source tradition preserves multiple monthly Sankashti episodes. The episodes below draw from Bhalachandra, Vikata, Ganadhipa, Lambodara, and Heramba forms. Together they show Ganesha grace moving through family conflict, lost kingdoms, children, journeys, reunion, and inner transformation.',
        ],
      },
      {
        id: 'bhalachandra',
        titleHi: 'भालचन्द्र संकष्टी: धर्मपाल की बहू और राजकुमार',
        titleEn: 'Bhalachandra Sankashti: Dharampala daughter-in-law and the prince',
        bodyHi: [
          'भालचन्द्र संकष्टी में गणेश जी माता पार्वती को चैत्र कृष्ण चतुर्थी का विधान बताते हैं। कथा राजा मयूरध्वज से जुड़ती है, जिनके राज्य में धर्मपाल नामक मंत्री को शासन का भार मिला। धर्मपाल के परिवार में सबसे छोटी बहू गणेश-भक्त थी और चतुर्थी के दिन भालचन्द्र गणेश का व्रत विधिपूर्वक करती थी।',
          'सास ने उसकी पूजा को तांत्रिक संदेह से देखा और पुत्र को भी उसके विरुद्ध भड़काया। बहू ने शांत भाव से कहा कि यह पूजा परिवार की रक्षा और मंगल के लिए है, पर अपमान और रोक-टोक के बीच भी उसने व्रत अधूरा नहीं छोड़ा। उसने गणेश जी से प्रार्थना की कि जिनका मन भ्रमित है, उनमें भी आपकी महिमा का विश्वास जागे।',
          'गणेश जी ने लीला की। राजा का राजकुमार अदृश्य हुआ और उसके वस्त्र-आभूषण धर्मपाल के भवन में मिले। राजा ने मंत्री को दंड की चेतावनी दी। तब बहू ने कहा कि गणेश का अपमान हुआ है; राजा और नगरवासी श्रद्धा से संकष्टी व्रत करें। व्रत पूर्ण होते ही राजकुमार सुरक्षित मिल गया, और परिवार ने समझा कि भक्त की पूजा छिपी नहीं रहती - वह संकट में सबकी रक्षा बनती है।',
        ],
        bodyEn: [
          'In the Bhalachandra Sankashti story, Ganesha explains to Parvati the observance of Chaitra Krishna Chaturthi. The narrative moves to King Mayurdhwaj and his minister Dharampala. In Dharampala household, the youngest daughter-in-law is devoted to Ganesha and observes the Bhalachandra vow with full attention.',
          'Her mother-in-law misunderstands the worship and suspects it to be harmful ritual. She turns her son against his wife. The young woman quietly explains that the vow is for family protection and welfare, yet even under insult and pressure she does not abandon the worship. She prays that Ganesha reveal his greatness to those whose minds are confused.',
          'Ganesha creates a lesson. The king prince disappears, and his clothes and ornaments are found in Dharampala house. The king threatens punishment if the child is not found. The daughter-in-law then says that Ganesha has been dishonored and that the king and people should observe Sankashti with devotion. When the vow is completed, the prince returns safely. The family learns that the worship of a sincere devotee becomes protection for everyone in crisis.',
        ],
      },
      {
        id: 'vikata',
        titleHi: 'विकट संकष्टी: सुशीला और चंचला',
        titleEn: 'Vikata Sankashti: Sushila and Chanchala',
        bodyHi: [
          'विकट संकष्टी की कथा में राजा रन्तिदेव के राज्य में धर्मकेतु नामक ब्राह्मण रहता था। उसकी दो पत्नियाँ थीं - सुशीला और चंचला। सुशीला व्रत-पूजन में लगी रहती थी और चंचला भोग में, इसलिए घर में तुलना और कटु वचन का वातावरण बन गया।',
          'सुशीला को पुत्री हुई और चंचला को पुत्र। चंचला ने सुशीला का उपहास किया कि इतने व्रत करके भी उसे केवल कमजोर बेटी मिली। अपमान से दुखी सुशीला ने गणेश जी की शरण ली। गणेश जी प्रसन्न हुए, पुत्र का वर दिया और कृपा से उसकी पुत्री के मुख से मणि-मोती गिरने लगे। बाद में सुशीला को पुत्र भी हुआ, पर धर्मकेतु की मृत्यु के बाद चंचला धन लेकर अलग हो गई।',
          'ईर्ष्या में चंचला ने एक दिन सुशीला की बेटी को कुएँ में धकेल दिया, पर गणेश जी की कृपा से बालिका सुरक्षित लौट आई। यह देखकर चंचला का मन बदल गया। उसने अपराध स्वीकार किया, सुशीला से क्षमा माँगी और स्वयं भी गणेश व्रत करने लगी। कथा का फल केवल धन या संतान नहीं है; वह शत्रुता को पश्चाताप और परिवार को फिर से सौहार्द में बदलता है।',
        ],
        bodyEn: [
          'The Vikata Sankashti story takes place in the kingdom of King Rantideva, where a Brahmin named Dharmaketu lives with two wives, Sushila and Chanchala. Sushila is devoted to vows and worship, while Chanchala lives without such discipline. Their difference slowly becomes a source of comparison and harsh words in the household.',
          'Sushila gives birth to a daughter, while Chanchala gives birth to a son. Chanchala mocks Sushila, saying that all her fasts have only brought her a fragile daughter. Hurt by this insult, Sushila turns to Ganesha with full devotion. Ganesha blesses her with a learned son, and by his grace jewels begin to fall from the mouth of her daughter. Later Sushila also has a son, but after Dharmaketu dies, Chanchala takes the family wealth and leaves.',
          'In jealousy, Chanchala pushes Sushila daughter into a well, but Ganesha protects the child and she returns unharmed. Seeing this, Chanchala conscience awakens. She confesses, asks Sushila for forgiveness, and begins observing the Ganesha vow herself. The fruit of the katha is not only wealth or children; it is the transformation of rivalry into repentance and family harmony.',
        ],
      },
      {
        id: 'ganadhipa',
        titleHi: 'गणाधिप संकष्टी: दशरथ, श्रवण और हनुमान का समुद्र-लांघन',
        titleEn: 'Ganadhipa Sankashti: Dasharatha, Shravana, and Hanuman crossing the sea',
        bodyHi: [
          'गणाधिप संकष्टी में कथा त्रेता युग की ओर जाती है। राजा दशरथ शिकार में शब्दभेदी बाण चलाते हैं और भूल से श्रवण कुमार को मार देते हैं, जो अपने अंधे माता-पिता को तीर्थयात्रा करा रहा था। श्रवण के माता-पिता पुत्र-वियोग में दशरथ को भी पुत्र-वियोग से मृत्यु का शाप देते हैं।',
          'इसी कर्म-श्रृंखला से आगे राम जन्म, वनवास और सीता-हरण का प्रसंग आता है। वन में राम और लक्ष्मण सुग्रीव से मिलते हैं, वानर-सेना सीता की खोज करती है और जटायु के भाई सम्पाती से पता चलता है कि सीता समुद्र पार लंका में हैं। पर समुद्र इतना विशाल है कि सबके मन में प्रश्न उठता है - इसे कौन पार करेगा।',
          'सम्पाती हनुमान से कहते हैं कि संकट-नाशन गणेश चतुर्थी का व्रत करो; इस व्रत की शक्ति से मार्ग खुलेगा। हनुमान गणेश स्मरण और व्रत से बल-संकल्प प्राप्त करते हैं और समुद्र लाँघते हैं। कथा में संकष्टी केवल व्यक्तिगत संकट नहीं हटाती, वह धर्मकार्य की असंभव लगती दूरी को भी पार कराने वाली बुद्धि और साहस देती है।',
        ],
        bodyEn: [
          'The Ganadhipa Sankashti story moves into Treta Yuga. King Dasharatha, while hunting, shoots by sound and mistakenly kills Shravana Kumara, who was carrying his blind parents on pilgrimage. Grieving for their son, Shravana parents curse Dasharatha that he too will die from separation from his son.',
          'From that chain of karma come the birth of Rama, the exile, and the abduction of Sita. In the forest, Rama and Lakshmana meet Sugriva, the vanara search begins, and Sampati, the brother of Jatayu, reveals that Sita is across the ocean in Lanka. The question before everyone is whether such a vast ocean can be crossed.',
          'Sampati tells Hanuman to observe the Sankata Nashana Ganesha Chaturthi vow, through which the path will open. With remembrance of Ganesha and firm resolve, Hanuman receives the courage to cross the ocean. The story shows Sankashti not merely as relief from private trouble, but as the wisdom and strength needed to cross an impossible distance in the work of dharma.',
        ],
      },
      {
        id: 'lambodara',
        titleHi: 'लम्बोदर संकष्टी: ऋषि शर्मा की विधवा और अग्निकुण्ड',
        titleEn: 'Lambodara Sankashti: Rishi Sharma widow and the kiln',
        bodyHi: [
          'लम्बोदर संकष्टी कथा सत्यवादी राजा हरिश्चंद्र के राज्य में घटती है। वहाँ ऋषि शर्मा नामक ब्राह्मण के निधन के बाद उसकी पत्नी छोटे पुत्र को भिक्षा से पालती थी। वह माघ कृष्ण चतुर्थी पर गोबर से गणेश मूर्ति बनाकर पूजा करती, तिल के लड्डू अर्पित करती और संकटनाशक व्रत श्रद्धा से निभाती थी।',
          'एक दिन बालक खेलते-खेलते बाहर गया। एक कुम्हार अपने कच्चे घड़ों को पकाने में असफल हो रहा था और किसी तांत्रिक की गलत सलाह से उसने बालक को भट्ठी में डाल दिया। माँ ने घर लौटकर पुत्र को न पाया तो रातभर गणेश जी से करुण प्रार्थना करती रही। भोर में कुम्हार ने भट्ठी खोली तो वहाँ आग के स्थान पर जल था और बालक खेलता हुआ सुरक्षित बैठा था।',
          'कुम्हार भयभीत होकर राजा हरिश्चंद्र के पास गया और अपराध स्वीकार किया। राजा ने बालक की माँ से पूछा कि यह रक्षा किस तप या विद्या से हुई। ब्राह्मणी ने कहा कि उसके पास कोई विशेष शक्ति नहीं; वह केवल संकष्टी गणेश व्रत करती है। राजा ने उसे धन्य कहा और प्रजा को भी यह व्रत करने की आज्ञा दी। कथा में गणेश-कृपा असहाय माँ की पुकार को अग्नि से भी बलवान बना देती है।',
        ],
        bodyEn: [
          'The Lambodara Sankashti story is set in the kingdom of truthful King Harishchandra. After the death of a Brahmin named Rishi Sharma, his widow raises their young son through alms. On Magha Krishna Chaturthi, she makes a Ganesha image from cow dung, offers sesame laddus, and observes the Sankata Nashaka vow with devotion.',
          'One day the child goes out to play. A potter, unable to fire his clay pots successfully, follows harmful advice from a ritualist and places the boy inside the kiln. When the mother cannot find her son, she spends the night praying to Ganesha with a broken heart. At dawn, the potter opens the kiln and finds water where fire should have been, with the child sitting safely and playing.',
          'Terrified, the potter goes to King Harishchandra and confesses. The king asks the mother what austerity or power protected the child. The Brahmani says she possesses no special knowledge; she simply observes the Sankashti Ganesha vow. The king honors her and instructs the people to observe the vow as well. In this katha, Ganesha grace makes the helpless prayer of a mother stronger than fire.',
        ],
      },
      {
        id: 'heramba',
        titleHi: 'हेरम्ब संकष्टी: नल-दमयंती का पुनर्मिलन',
        titleEn: 'Heramba Sankashti: Nala and Damayanti are reunited',
        bodyHi: [
          'हेरम्ब संकष्टी कथा राजा नल और रानी दमयंती के दुःख से जुड़ी है। नल को राज्य, धन, पशु, कोष और सम्मान से वंचित होना पड़ा। विपत्ति इतनी बढ़ी कि वह वन में भटकने लगे, दमयंती उनसे बिछुड़ गई और परिवार के लोग अलग-अलग कष्ट सहने लगे।',
          'दमयंती वन में महर्षि शरभंग से मिली और पूछा कि पति से पुनर्मिलन, राज्य की प्राप्ति और सौभाग्य का जागरण कैसे होगा। ऋषि ने भाद्रपद कृष्ण चतुर्थी पर हेरम्ब गणपति की पूजा और संकटनाशिनी चतुर्थी व्रत का निर्देश दिया। उन्होंने आश्वासन दिया कि श्रद्धा से व्रत करने पर बिछड़ा परिवार और खोया राज्य फिर प्राप्त होगा।',
          'दमयंती ने व्रत आरंभ किया और गणेश जी की पूजा मास-दर-मास विधिपूर्वक की। तीन महीनों में उसे पति और पुत्र से पुनर्मिलन मिला और राज्य-समृद्धि लौट आई। यह कथा बताती है कि संकष्टी केवल तत्काल संकट के लिए नहीं; जब जीवन कई दिशाओं में टूट गया हो, तब भी नियमित श्रद्धा बिखरे हुए सूत्रों को फिर जोड़ सकती है।',
        ],
        bodyEn: [
          'The Heramba Sankashti story is connected with the sorrow of King Nala and Queen Damayanti. Nala loses kingdom, wealth, animals, treasury, and honor. The calamity grows so severe that he wanders in the forest, Damayanti is separated from him, and the family suffers in different places.',
          'Damayanti meets Maharshi Sharabhanga in the forest and asks how she can reunite with her husband, regain the kingdom, and awaken good fortune again. The sage instructs her to worship Heramba Ganapati on Bhadrapada Krishna Chaturthi and observe the Sankatnashini Chaturthi vow. He assures her that sincere observance can bring back the separated family and lost prosperity.',
          'Damayanti begins the vow and worships Ganesha month after month with discipline. Within three months she is reunited with her husband and son, and the kingdom returns. This katha teaches that Sankashti is not only for a sudden difficulty; when life has broken in many directions, steady devotion can gather the scattered threads again.',
        ],
      },
    ],
  }),
  summaryContent({
    id: 'sakat-chauth-vrat-katha',
    titleHi: 'सकट चौथ व्रत कथा',
    titleEn: 'Sakat Chauth Vrat Katha',
    themeHi: 'सकट चौथ कथा मातृ-भाव, संतान-कल्याण और गणेश कृपा से जुड़ी है। कथा-परंपरा में संकट में पड़े परिवार की रक्षा और व्रत की श्रद्धा से प्राप्त मंगल का भाव प्रमुख रहता है।',
    themeEn: 'Sakat Chauth is associated with maternal devotion, welfare of children, and Ganesha grace. The narrative tradition highlights protection of the family and auspicious results born from sincere observance.',
    practiceHi: 'यह व्रत विशेषकर संतान-सुख और रक्षा की भावना से किया जाता है। कथा को क्षेत्रीय भेदों के साथ रखना उचित है, इसलिए ऐप में इसे संक्षिप्त और सावधान रूप में रखा गया है।',
    practiceEn: 'The vrat is often observed for children wellbeing and protection. Since regional variants differ, the app keeps this as a concise and conservative retelling.',
  }),
  fullContent({
    id: 'ganesha-chaturthi-vrat-katha',
    titleHi: 'गणेश चतुर्थी व्रत कथा',
    titleEn: 'Ganesha Chaturthi Vrat Katha',
    sourceUrls: [
      'https://www.drikpanchang.com/vrat-katha/ganesha-chaturthi/ganesha-chaturthi-katha-collection.html',
      'https://www.drikpanchang.com/vrat-katha/ganesha-chaturthi/ganesha-chaturthi-vrat-katha.html',
    ],
    sections: [
      {
        id: 'vow-and-question',
        titleHi: 'व्रत का प्रश्न और कृष्ण पर लगा कलंक',
        titleEn: 'The vow is asked about and Krishna faces blame',
        bodyHi: [
          'गणेश चतुर्थी की इस कथा में भगवान शिव सनत्कुमार को बताते हैं कि भाद्रपद शुक्ल चतुर्थी का व्रत अत्यंत मंगलकारी है। गणेश जी इस दिन विशेष रूप से प्रसन्न होते हैं और श्रद्धा से किया गया व्रत वन, संकट, विवाद और अपमान जैसे कठिन प्रसंगों में भी भक्त को स्थिरता देता है।',
          'सनत्कुमार पूछते हैं कि यह व्रत पृथ्वी पर पहले किसने किया और इसकी महिमा कैसे प्रकट हुई। शिव जी उत्तर देते हैं कि स्वयं श्रीकृष्ण ने झूठे चोरी के आरोप से मुक्त होने के लिए देवर्षि नारद के निर्देश पर यह व्रत किया था। कथा का केंद्र यही है कि गणेश पूजा केवल विघ्न हटाने की नहीं, असत्य कलंक से रक्षा की साधना भी है।',
          'द्वारका में यह प्रसंग तब आरंभ हुआ जब यदुवंशी सत्राजित को सूर्यदेव से स्यमन्तक मणि प्राप्त हुई। मणि तेजस्वी थी और उससे प्रतिदिन स्वर्ण की प्राप्ति होती थी, पर उसे पवित्र अवस्था में धारण करने की मर्यादा बताई गई थी। इसी रत्न से मोह, संदेह और आरोपों की श्रृंखला शुरू हुई।',
        ],
        bodyEn: [
          'In this Ganesha Chaturthi katha, Lord Shiva tells Sanatkumara that the vow observed on Bhadrapada Shukla Chaturthi is deeply auspicious. Ganesha is especially pleased on this day, and the vow helps a devotee remain steady in danger, dispute, social pressure, and public humiliation.',
          'Sanatkumara asks who first observed this vrat on earth and how its greatness became known. Shiva replies that Lord Krishna himself performed it when he was burdened by a false accusation of theft, following the guidance of Devarshi Narada. The story therefore treats Ganesha worship not only as removal of obstacles, but also as protection from unjust blame.',
          'The episode begins in Dwaraka when Satrajit of the Yadava clan receives the Syamantaka jewel from Surya Deva. The jewel shines with solar brilliance and is said to yield gold every day, but it must be worn with purity and discipline. Around this jewel, attachment, suspicion, and accusation begin to gather.',
        ],
      },
      {
        id: 'satrajit-and-syamantaka',
        titleHi: 'सत्राजित, प्रसेनजित और स्यमन्तक मणि',
        titleEn: 'Satrajit, Prasenajit, and the Syamantaka jewel',
        bodyHi: [
          'सत्राजित जब मणि पहनकर द्वारका में आया तो लोग उसे सूर्यदेव समझ बैठे। श्रीकृष्ण ने रत्न के तेज को देखा, पर उसे लेने की इच्छा नहीं रखी। सत्राजित के मन में फिर भी शंका उठी कि कहीं कृष्ण इसे मांग न लें, इसलिए उसने मणि अपने भाई प्रसेनजित को दे दी।',
          'प्रसेनजित एक दिन मणि धारण करके शिकार पर गया। पवित्रता की मर्यादा भंग होने से वह वन में सिंह का शिकार बना और सिंह मणि लेकर चला गया। जाम्बवान ने सिंह को मारकर वह रत्न अपनी पुत्री जाम्बवती के पास रख दिया, जहाँ वह बालक के खिलौने की तरह चमकने लगा।',
          'दूसरी ओर श्रीकृष्ण अकेले द्वारका लौटे तो लोगों ने अनुमान लगा लिया कि प्रसेनजित की मृत्यु और मणि का लोप कृष्ण के कारण हुआ है। बिना प्रमाण बोले गए शब्द समाज में आग की तरह फैल गए। कथा यहाँ दिखाती है कि झूठा कलंक तब जन्म लेता है जब लोभ और अधूरी जानकारी साथ मिल जाते हैं।',
        ],
        bodyEn: [
          'When Satrajit enters Dwaraka wearing the jewel, people mistake him for Surya Deva himself. Krishna sees its brilliance but does not try to possess it. Still, suspicion grows in Satrajit heart, so he gives the jewel to his brother Prasenajit instead.',
          'Prasenajit goes hunting while wearing the jewel. Because the discipline connected with the gem is not maintained, he is killed by a lion in the forest, and the lion carries the jewel away. Jambavan kills the lion and places the jewel with his daughter Jambavati, where it shines near a child like a plaything.',
          'Meanwhile Krishna returns to Dwaraka without Prasenajit. People quickly assume that Krishna has killed him and taken the gem. Words spoken without proof spread through the city. The katha shows how false blame can arise when greed, fear, and incomplete knowledge meet.',
        ],
      },
      {
        id: 'krishna-clears-blame',
        titleHi: 'जाम्बवान की गुफा और आरोप का समाधान',
        titleEn: 'Jambavan cave and the clearing of blame',
        bodyHi: [
          'अपना नाम निर्मल करने के लिए श्रीकृष्ण कुछ विश्वासपात्रों को साथ लेकर वन में गए। पहले प्रसेनजित का शरीर मिला, फिर सिंह के पदचिह्न और फिर जाम्बवान की गुफा का मार्ग मिला। कृष्ण साथियों को बाहर छोड़कर अंधेरी गुफा में भीतर गए और वहाँ स्यमन्तक मणि को देखा।',
          'जाम्बवान लौटे तो कृष्ण से घोर युद्ध हुआ। लंबे युद्ध के बाद जाम्बवान ने पहचान लिया कि सामने वही परमात्मा हैं जिन्होंने त्रेता में राम रूप लेकर लंका-विजय की थी। उनका अहंकार शांत हुआ और उन्होंने मणि के साथ अपनी पुत्री जाम्बवती का विवाह भी कृष्ण से कर दिया।',
          'कृष्ण द्वारका लौटे, सभा में पूरा वृत्तांत सुनाया और रत्न सत्राजित को लौटा दिया। सत्राजित लज्जित हुआ और प्रायश्चित्त रूप में अपनी पुत्री सत्यभामा का विवाह कृष्ण से किया। पहली बार कलंक मिटा, पर कथा अभी बताती है कि जब मूल लोभ जीवित रहे तो दोष फिर लौट सकता है।',
        ],
        bodyEn: [
          'To clear his name, Krishna enters the forest with trusted companions. They find Prasenajit body, then the tracks of the lion, and finally the path to Jambavan cave. Krishna leaves his companions outside, enters the dark cave, and finds the Syamantaka jewel there.',
          'When Jambavan returns, a fierce battle begins. After many days, Jambavan recognizes that Krishna is the same supreme Lord who had appeared as Rama in Treta Yuga. His pride settles, and he offers both the jewel and his daughter Jambavati to Krishna.',
          'Krishna returns to Dwaraka, narrates the whole event in the royal assembly, and gives the gem back to Satrajit. Satrajit is ashamed and offers his daughter Satyabhama in marriage to Krishna as atonement. The first accusation is cleared, but the story shows that when greed remains, blame can return.',
        ],
      },
      {
        id: 'second-accusation',
        titleHi: 'शतधन्वा, अक्रूर और दूसरा आरोप',
        titleEn: 'Shatadhanva, Akrura, and a second accusation',
        bodyHi: [
          'समय बीता तो शतधन्वा और कुछ यदुवंशी स्यमन्तक मणि के लोभ में पड़े। कृष्ण के द्वारका से बाहर रहने पर शतधन्वा ने सत्राजित की हत्या कर दी और रत्न लेकर भागा। भयभीत होकर उसने मणि अक्रूर को सौंप दी और स्वयं बचने के लिए दक्षिण दिशा की ओर निकल पड़ा।',
          'कृष्ण और बलराम ने उसका पीछा किया। शतधन्वा मारा गया, पर उसके पास मणि नहीं मिली। बलराम के मन में भी शंका उठी और वे अलग चले गए। द्वारका में फिर कुचर्चा फैलने लगी कि कृष्ण ने मणि के कारण अपने भाई को भी दूर कर दिया।',
          'अक्रूर तीर्थों में गया और मणि से प्राप्त धन का दान करता रहा, जिससे जहाँ वह गया वहाँ अभाव शांत हुआ। कृष्ण सब जानते हुए भी मनुष्य लीला में चिंता अनुभव करते हैं। जब नारद आए, तब कृष्ण ने पूछा कि बार-बार यह झूठा कलंक उनके साथ क्यों जुड़ रहा है।',
        ],
        bodyEn: [
          'In time, Shatadhanva and other Yadavas begin to desire the Syamantaka jewel. When Krishna is away from Dwaraka, Shatadhanva kills Satrajit and escapes with the gem. Frightened, he secretly gives the jewel to Akrura and flees southward.',
          'Krishna and Balarama pursue him. Shatadhanva is killed, but the gem is not found on him. Balarama becomes upset and leaves, and Dwaraka again fills with rumors that Krishna has caused separation from his own brother because of the jewel.',
          'Akrura travels on pilgrimages and uses the wealth connected with the gem in acts of charity, bringing relief wherever he goes. Krishna knows the deeper truth, yet in his human role he feels the pain of repeated public suspicion. When Narada arrives, Krishna asks why false blame keeps returning to him.',
        ],
      },
      {
        id: 'moon-curse-origin',
        titleHi: 'चंद्रमा के उपहास से शाप की उत्पत्ति',
        titleEn: 'The moon mockery and the origin of the curse',
        bodyHi: [
          'नारद ने बताया कि भाद्रपद शुक्ल चतुर्थी के दिन चंद्र दर्शन के कारण यह कलंक उत्पन्न हुआ। कृष्ण ने पूछा कि चंद्र दर्शन तो सामान्यतः शुभ माना जाता है, फिर इस दिन ऐसा दोष क्यों है। तब नारद ने गणेश जी और चंद्रमा का प्रसंग सुनाया।',
          'ब्रह्मा ने गणेश जी की स्तुति कर सृष्टि-कार्य में विघ्न न आने का वर मांगा। गणेश जी वर देकर चंद्रलोक पहुँचे। चंद्रमा अपने रूप, शीतलता और सौंदर्य के गर्व में था; उसने गणेश जी के बड़े उदर, गजमुख, सवारी और रूप पर हँसी की।',
          'गणेश जी ने उस उपहास को केवल निजी अपमान नहीं माना, बल्कि अहंकार का दोष समझा। उन्होंने शाप दिया कि इस चतुर्थी पर जो चंद्रमा को देखेगा, वह समाज में झूठे आरोप और कलंक का भार उठाएगा। इसी से चंद्रमा का तेज मलिन हुआ और देवताओं में चिंता फैल गई।',
        ],
        bodyEn: [
          'Narada explains that the repeated stigma came from seeing the moon on Bhadrapada Shukla Chaturthi. Krishna asks why moon sighting, which is often considered auspicious, should create fault on this day. Narada then narrates the episode of Ganesha and Chandra.',
          'Brahma praises Ganesha and asks that the work of creation proceed without obstruction. After granting the boon, Ganesha reaches Chandra Loka. The moon, proud of beauty and radiance, laughs at Ganesha form, his round belly, elephant face, and mouse vehicle.',
          'Ganesha treats the mockery as a sign of arrogance rather than a small insult. He declares that whoever sees the moon on this Chaturthi will bear false accusation in society. Chandra radiance becomes disturbed, and the devas grow anxious about the effect of the curse.',
        ],
      },
      {
        id: 'chandra-seeks-forgiveness',
        titleHi: 'चंद्रमा की प्रार्थना और शाप का सीमित होना',
        titleEn: 'Chandra prays and the curse is limited',
        bodyHi: [
          'देवताओं ने ब्रह्मा से उपाय पूछा। ब्रह्मा ने कहा कि गणेश का शाप कोई देवता मिटा नहीं सकता; गणेश जी की शरण ही उपाय है। उन्होंने कृष्ण पक्ष चतुर्थी पर गणेश पूजा, लड्डू-भोग, प्रसाद, ब्राह्मण-भोजन और सामर्थ्य अनुसार दान का विधान बताया।',
          'चंद्रमा ने विधिपूर्वक गणेश व्रत किया और विनय से क्षमा माँगी। गणेश जी प्रसन्न हुए, पर उन्होंने शाप को पूरी तरह वापस नहीं लिया। उन्होंने उसका प्रभाव सीमित किया कि भाद्रपद शुक्ल चतुर्थी का चंद्र दर्शन कलंक का कारण रहेगा, किंतु श्रद्धा, द्वितीया चंद्र दर्शन, कथा-श्रवण और गणेश पूजा से दोष का निवारण होगा।',
          'यह प्रसंग व्रत का भीतरी अर्थ खोलता है। चंद्रमा मन और प्रतिष्ठा का प्रतीक है; अहंकार से वही मन दूसरों का उपहास करता है और फिर कलंक से डरता है। गणेश जी की शरण मन को विनम्र करती है, इसलिए कथा में उपहास का उत्तर प्रतिशोध नहीं, सुधरी हुई मर्यादा बनता है।',
        ],
        bodyEn: [
          'The devas ask Brahma for a remedy. Brahma says that no deity can simply cancel the word of Ganesha; refuge in Ganesha is the only way. He describes worship on Krishna Chaturthi with laddus, prasada, feeding of Brahmins, and charity according to capacity.',
          'Chandra performs the worship with humility and asks forgiveness. Ganesha is pleased, yet he does not erase the curse entirely. He limits it: seeing the moon on Bhadrapada Shukla Chaturthi remains a cause of stigma, but devotion, Dwitiya moon sighting, listening to the katha, and Ganesha worship provide relief.',
          'This episode reveals the inner meaning of the vow. The moon represents mind and reputation; when ruled by pride, that mind mocks others and then fears disgrace. Taking refuge in Ganesha teaches humility, so the answer to mockery becomes corrected discipline rather than mere revenge.',
        ],
      },
      {
        id: 'krishna-observes-vow',
        titleHi: 'कृष्ण का व्रत और कथा का फल',
        titleEn: 'Krishna observes the vow and the story finds its fruit',
        bodyHi: [
          'नारद ने कृष्ण से कहा कि वे भी गणेश चतुर्थी व्रत करें और स्यमन्तक मणि तथा चंद्रमा की कथा का स्मरण रखें। कृष्ण ने विधिपूर्वक व्रत किया, गणेश जी की पूजा की और झूठे आरोपों से मुक्ति पाई। अक्रूर द्वारा मणि सामने आने पर समाज की शंका भी शांत हुई।',
          'इसलिए गणेश चतुर्थी कथा में दो कथाएं एक सूत्र में बंधती हैं। स्यमन्तक मणि की कथा बताती है कि लोभ और संदेह से कलंक फैलता है; चंद्रमा की कथा बताती है कि सौंदर्य और प्रतिष्ठा का अभिमान भी वही कलंक बुला सकता है। गणेश जी दोनों में विवेक और विनय का मार्ग देते हैं।',
          'भक्त इस कथा को सुनकर गणेश जी से प्रार्थना करता है कि जीवन के आरंभ शुभ हों, मन से उपहास और जल्दबाजी दूर हो, और यदि भूल से दोष लगे तो सत्य, विनम्रता और पूजा से उसका निवारण हो। यही कारण है कि इस व्रत में कथा, चंद्र-दर्शन की सावधानी और गणेश-प्रसाद को साथ रखा जाता है।',
        ],
        bodyEn: [
          'Narada advises Krishna to observe the Ganesha Chaturthi vow and remember the stories of the Syamantaka jewel and the moon. Krishna performs the vrat, worships Ganesha, and is freed from false accusation. When the truth about the jewel becomes public, social suspicion also settles.',
          'The katha therefore joins two stories into one teaching. The Syamantaka episode shows how greed and suspicion create slander; the moon episode shows how pride in beauty and reputation can also invite stigma. Ganesha gives the path of discernment and humility in both situations.',
          'A devotee listening to this katha prays that beginnings may be auspicious, that mockery and haste may leave the mind, and that any fault born from ignorance may be corrected through truth, humility, and worship. This is why the vrat holds together katha, caution around moon sighting, and the receiving of Ganesha prasada.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'pradosha-vrat-katha',
    titleHi: 'प्रदोष व्रत कथा',
    titleEn: 'Pradosha Vrat Katha',
    sourceUrls: [
      'https://www.drikpanchang.com/vrat-katha/pradosha/pradosha-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/pradosha/ravi-pradosha/ravi-pradosha-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/pradosha/soma-pradosha/soma-pradosha-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/pradosha/bhauma-pradosha/bhauma-pradosha-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/pradosha/budha-pradosha/budha-pradosha-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/pradosha/brihaspati-pradosha/brihaspati-pradosha-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/pradosha/shukra-pradosha/shukra-pradosha-vrat-katha.html',
      'https://www.drikpanchang.com/vrat-katha/pradosha/shani-pradosha/shani-pradosha-vrat-katha.html',
    ],
    sections: [
      {
        id: 'ravi',
        titleHi: 'रवि प्रदोष: निर्धन ब्राह्मण-पुत्र की रक्षा',
        titleEn: 'Ravi Pradosha: the poor Brahmin son is protected',
        bodyHi: [
          'रवि प्रदोष की कथा ऋषियों के प्रश्न से आरंभ होती है। कलियुग में जब मनुष्य अधर्म, अभाव और भ्रम में फँसेंगे, तब कौन सा सरल शिव-व्रत उन्हें स्थिर कर सकता है - यह पूछने पर सूत जी प्रदोष का विधान बताते हैं। स्नान, शिव-ध्यान, बिल्वपत्र, दीप, जप, संयम और प्रदोषकाल की पूजा को वे लोक-कल्याण का मार्ग कहते हैं।',
          'इसी प्रसंग में एक निर्धन ब्राह्मण परिवार की कथा आती है। ब्राह्मण की पत्नी श्रद्धा से प्रदोष व्रत करती थी। उनका पुत्र गंगा-स्नान को निकला तो पहले डाकुओं ने उसे रोक लिया, फिर उसकी निर्धनता देखकर छोड़ दिया। आगे वह थककर वृक्ष के नीचे सोया तो सैनिकों ने उसे चोर समझकर पकड़ लिया और राजा ने बिना पूरी जाँच के उसे कारागार में डाल दिया।',
          'उस रात माँ प्रदोष व्रत में शिव से पुत्र की कुशलता मांग रही थी। राजा को स्वप्न में चेतावनी मिली कि बालक निर्दोष है; यदि उसे मुक्त न किया गया तो राज्य का वैभव नष्ट होगा। सुबह राजा ने सत्य सुना, बालक को छोड़ा, उसके माता-पिता को बुलाया और परिवार के जीवन-यापन के लिए ग्राम दान किए। कथा में प्रदोष पूजा अन्याय से बची हुई सत्य-वाणी बनकर प्रकट होती है।',
        ],
        bodyEn: [
          'The Ravi Pradosha katha begins with the sages asking how people in Kali Yuga can approach Shiva when they are surrounded by confusion, decline, and suffering. Suta describes the vow: bathing, remembering Shiva, offering bilva leaves, lighting the lamp, chanting, restraint, and worship during the Pradosha twilight.',
          'The story then turns to a poor Brahmin family. The wife observes Pradosha with devotion. Their son leaves for a bath in the Ganga; robbers stop him on the road, but release him after seeing that he carries only simple food. Later, while he rests under a tree, royal soldiers mistake him for a thief and the king imprisons him without full inquiry.',
          'That night, as the mother prays for her son during the vow, the king receives a dream warning that the boy is innocent and that injustice will harm the kingdom. In the morning, the truth is heard, the boy is released, and the king supports the family with land. In this story, Pradosha worship becomes the quiet force by which truth is protected from careless judgment.',
        ],
      },
      {
        id: 'soma',
        titleHi: 'सोम प्रदोष: विधवा ब्राह्मणी और विदर्भ का राजकुमार',
        titleEn: 'Soma Pradosha: the widow and the prince of Vidarbha',
        bodyHi: [
          'सोम प्रदोष में सूत जी बताते हैं कि शिव-पार्वती का स्मरण ऋण, ग्रह-दशा, दुःख और असहायता में पड़े भक्त को धैर्य देता है। एक नगर में ब्राह्मणी विधवा अपने पुत्र के साथ भिक्षा से जीवन चलाती थी। उसका कोई सहारा नहीं था, पर वह प्रदोष व्रत नहीं छोड़ती थी।',
          'एक दिन भिक्षा से लौटते समय उसे मार्ग में एक दयनीय बालक मिला। वह विदर्भ का राजकुमार था, जिसके पिता का राज्य शत्रुओं ने छीन लिया था। ब्राह्मणी ने उसे अपने घर ले जाकर अपने पुत्र की तरह पाला। बालक बड़ा हुआ तो गन्धर्व कन्या अंशुमति से उसका परिचय हुआ और उसके माता-पिता को स्वप्न में शिव का आदेश मिला कि वे कन्या का विवाह उसी राजकुमार से करें।',
          'ब्राह्मणी को ऋषियों से प्रदोष व्रत करते रहने की आज्ञा मिली थी। उसी व्रत के प्रभाव से राजकुमार को गन्धर्व-सेना का सहयोग मिला, उसने अपने शत्रुओं को पराजित किया और पिता का राज्य पुनः पाया। राजकुमार ने ब्राह्मण-पुत्र को मंत्री बनाया। कथा यह दिखाती है कि शिव-भक्ति अभाव में भी आश्रय देती है और अनाथ-सा पड़ा भाग्य फिर उठ सकता है।',
        ],
        bodyEn: [
          'In the Soma Pradosha katha, Suta explains that remembrance of Shiva and Parvati gives courage to those burdened by debt, planetary trouble, grief, and helplessness. A Brahmin widow lives by begging with her young son. She has no worldly support, yet she continues the Pradosha vow.',
          'One day, while returning from alms, she finds a distressed boy on the road. He is the prince of Vidarbha, whose father has lost the kingdom to enemies. The widow brings him home and raises him like her own child. Later, the prince meets a Gandharva maiden named Anshumati, and her parents receive a dream command from Shiva to arrange the marriage.',
          'The widow has been instructed by sages to keep observing Pradosha. Through the merit of that vow, the prince receives help from the Gandharva army, defeats his enemies, and regains his father kingdom. He makes the Brahmin boy his minister. The story shows how Shiva devotion can turn poverty into shelter and restore a life that seemed abandoned by fortune.',
        ],
      },
      {
        id: 'bhauma',
        titleHi: 'भौम प्रदोष: वृद्धा की परीक्षा',
        titleEn: 'Bhauma Pradosha: the old devotee is tested',
        bodyHi: [
          'भौम प्रदोष कथा मंगलवार से जुड़ी है, इसलिए इसमें रोग, पीड़ा, वचन और हनुमान-भक्ति का विशेष भाव आता है। एक वृद्धा रहती थी जिसका पुत्र मंगलिया था। वह प्रत्येक मंगलवार श्रद्धा से व्रत करती, हनुमान जी को भोग लगाती और उस दिन घर लीपने या मिट्टी खोदने से बचती थी।',
          'हनुमान जी ने उसकी भक्ति की परीक्षा लेने के लिए साधु का रूप धारण किया। पहले उन्होंने भूमि लीपने को कहा; वृद्धा ने विनम्रता से बताया कि वह यह काम मंगलवार को नहीं करेगी, पर अन्य सेवा करेगी। साधु ने फिर कठिन वचन माँगा - पुत्र को लाकर उसकी पीठ पर अग्नि प्रकट कर भोजन पकाने की बात कही। वृद्धा रोई, पर दिए वचन से पीछे नहीं हटी।',
          'जब भोजन तैयार हुआ तो साधु ने कहा कि मंगलिया को बुलाओ। वृद्धा का हृदय काँप गया, पर पुकारते ही बालक हँसता हुआ आ गया। साधु ने हनुमान रूप प्रकट किया और बताया कि भक्त का वचन और श्रद्धा सुरक्षित हैं। भौम प्रदोष का अर्थ यहाँ क्रूर परीक्षा नहीं, अटल भक्ति में छिपी दिव्य रक्षा है।',
        ],
        bodyEn: [
          'The Bhauma Pradosha story is connected with Tuesday, so it carries themes of illness, pain, vow, and Hanuman devotion. An old woman lives with her son Mangalia. Every Tuesday she observes the fast, offers bhoga to Hanuman, and avoids plastering the floor or digging earth on that day.',
          'Hanuman comes in the form of a wandering sadhu to test her devotion. He first asks her to plaster the ground; she respectfully says she cannot do that on Tuesday but will serve in any other way. Then the sadhu asks for a severe promise: bring her son, lay him down, and let food be cooked over fire on his back. The mother is shaken, yet she does not break the word she has given.',
          'When the food is ready, the sadhu asks her to call Mangalia. Her heart trembles, but the boy comes running unharmed. The sadhu reveals himself as Hanuman and blesses her. Bhauma Pradosha here is not about cruelty; it is about the hidden protection that surrounds unwavering devotion and truthful promise.',
        ],
      },
      {
        id: 'budha',
        titleHi: 'बुध प्रदोष: हठी दामाद और शिव से क्षमा',
        titleEn: 'Budha Pradosha: the stubborn son-in-law asks Shiva for forgiveness',
        bodyHi: [
          'बुध प्रदोष कथा में एक नवविवाहित पुरुष अपनी पत्नी को गौने के बाद घर लाने ससुराल पहुँचा। दिन बुधवार था। सास-ससुर और रिश्तेदारों ने समझाया कि आज विदाई न कराओ, पर वह हठ पर अड़ा रहा और पत्नी को लेकर बैलगाड़ी से चल पड़ा।',
          'मार्ग में पत्नी को प्यास लगी। पति जल लेने गया और लौटकर देखा कि उसके समान दिखने वाला एक दूसरा पुरुष पत्नी को जल दे रहा है। दोनों में विवाद हुआ, भीड़ और सैनिक आए, पर पत्नी भी नहीं पहचान सकी कि असली पति कौन है। तब उस पुरुष ने भीतर से स्वीकार किया कि उसने सभी की सलाह को अहंकार में ठुकराया था।',
          'उसने भगवान शिव से प्रार्थना की कि वे पत्नी और उसकी लाज की रक्षा करें; वह आगे ऐसा हठ नहीं करेगा। प्रार्थना के साथ ही दूसरा पुरुष अदृश्य हो गया और दंपति सुरक्षित घर लौटे। इस कथा में बुध प्रदोष विवेक का व्रत है - संबंध में केवल अधिकार नहीं, समय, सलाह और विनम्रता भी चाहिए।',
        ],
        bodyEn: [
          'The Budha Pradosha katha tells of a newly married man who goes to bring his wife home after the gauna ceremony. The day is Wednesday. His in-laws and relatives advise him not to take her that day, but he dismisses them and insists on leaving.',
          'On the road, his wife becomes thirsty. He goes to fetch water, but when he returns he sees another man, identical in appearance, giving water to her. A dispute begins, people gather, soldiers arrive, and even the wife cannot identify which one is her husband. The man finally realizes that his own pride has brought the crisis.',
          'He prays to Lord Shiva to protect his wife and his honor, promising not to repeat such stubborn disregard. At once, the duplicate disappears and the couple reaches home safely. Budha Pradosha becomes a vow of discernment: relationships require not only desire and authority, but also right timing, advice, and humility.',
        ],
      },
      {
        id: 'brihaspati',
        titleHi: 'बृहस्पति प्रदोष: वृत्रासुर और देवताओं की शरण',
        titleEn: 'Brihaspati Pradosha: Vritrasura and the refuge of the devas',
        bodyHi: [
          'बृहस्पति प्रदोष कथा देवताओं और वृत्रासुर के युद्ध से आरंभ होती है। देवताओं ने दैत्यों की सेना को दबाया तो वृत्रासुर क्रोधित होकर भयानक रूप में सामने आया। इन्द्र और देवगण उसकी मायाशक्ति से भयभीत हुए और देवगुरु बृहस्पति की शरण में गए।',
          'बृहस्पति ने बताया कि वृत्रासुर केवल बलवान दैत्य नहीं है; उसके पीछे पूर्वजन्म और तप का प्रसंग है। वह चित्ररथ नामक राजा था जिसने कैलास में शिव-पार्वती को देखकर अज्ञान से उपहास किया। पार्वती के शाप से वह असुर योनि में गिरा और बाद में वृत्रासुर रूप में प्रकट हुआ।',
          'देवगुरु ने देवताओं को बृहस्पति प्रदोष व्रत का आश्रय लेने को कहा। शिव-स्मरण, संयम और गुरु-वाणी से उनका भय कम हुआ और वे धर्म-पक्ष पर स्थिर हुए। कथा सिखाती है कि केवल शस्त्र नहीं, गुरु से मिली दृष्टि और शिव की कृपा भी दैत्याकार संकट को जीतने में सहायक होती है।',
        ],
        bodyEn: [
          'The Brihaspati Pradosha katha begins with a battle between the devas and Vritrasura. When the army of the demons is struck down, Vritrasura rises in a terrifying form. Indra and the devas become afraid of his power and seek the help of Devaguru Brihaspati.',
          'Brihaspati explains that Vritrasura is not merely a strong demon; his story carries the weight of a previous birth. He had once been King Chitraratha, who saw Shiva and Parvati at Kailasa and mocked what he did not understand. Through the curse of Parvati, he fell into an asura birth and later appeared as Vritrasura.',
          'The guru advises the devas to take refuge in the Brihaspati Pradosha vow. Through remembrance of Shiva, restraint, and the guidance of the teacher, their fear settles and they stand again on the side of dharma. The story teaches that great crises are not overcome by force alone; wisdom and Shiva grace are equally necessary.',
        ],
      },
      {
        id: 'shukra',
        titleHi: 'शुक्र प्रदोष: शुक्रास्त में की गई भूल',
        titleEn: 'Shukra Pradosha: the mistake made during Shukra Asta',
        bodyHi: [
          'शुक्र प्रदोष कथा तीन मित्रों से आरंभ होती है - एक राजकुमार, एक ब्राह्मण-पुत्र और एक धनिक का पुत्र। चर्चा में गृहस्थ जीवन की बात आई तो धनिक-पुत्र ने तुरंत पत्नी को विदा कराकर लाने का निश्चय किया। माता-पिता ने समझाया कि शुक्रास्त में बहू-बेटी की विदाई शुभ नहीं मानी जाती, पर उसने बात न मानी।',
          'ससुराल में भी सबने प्रतीक्षा करने को कहा, फिर भी वह पत्नी को लेकर लौट पड़ा। मार्ग में बैलगाड़ी का पहिया टूटा, बैल घायल हुआ, पत्नी को चोट लगी, डाकुओं ने धन लूट लिया और घर पहुँचते ही उसे सर्प ने काट लिया। वैद्य ने मृत्यु का भय बताया। तब ब्राह्मण-पुत्र ने कहा कि भूल का कारण समझो, पत्नी को आदर से वापस भेजो और शुक्र प्रदोष व्रत का संकल्प लो।',
          'जब पुत्र-वधू को उसके मायके पहुँचाया गया और व्रत का आश्रय लिया गया, तब स्थिति सुधरने लगी। शिव-कृपा से प्राण बचे और दंपति ने सुखपूर्वक जीवन बिताया। कथा का मर्म यह है कि शुभ संबंध भी अनुचित समय और अहंकारी जल्दी से कष्ट में बदल सकते हैं; प्रदोष व्रत व्यक्ति को मर्यादा में लौटाता है।',
        ],
        bodyEn: [
          'The Shukra Pradosha katha begins with three friends: a prince, a Brahmin son, and the son of a wealthy man. During a conversation on married life, the wealthy son decides to bring his wife home immediately. His parents warn him that bringing a bride during Shukra Asta is not considered auspicious, but he ignores them.',
          'His in-laws also ask him to wait, yet he leaves with his wife. On the journey the cart wheel breaks, a bull is injured, his wife is hurt, robbers steal their wealth, and when he reaches home a snake bites him. Physicians fear for his life. The Brahmin friend then explains the mistake: send the wife respectfully back to her parental home and take the vow of Shukra Pradosha.',
          'Once the couple returns to the bride family home and the vow is taken, the danger begins to fade. Through Shiva grace, his life is saved and the couple lives peacefully. The story teaches that even a good relationship can suffer when haste ignores sacred timing; Pradosha brings the person back to discipline and respect.',
        ],
      },
      {
        id: 'shani',
        titleHi: 'शनि प्रदोष: धर्मगुप्त और अंशुमति',
        titleEn: 'Shani Pradosha: Dharmagupta and Anshumati',
        bodyHi: [
          'शनि प्रदोष कथा में एक निर्धन ब्राह्मण अपनी पत्नी और दो पुत्रों सहित रहता था। पत्नी कष्टों से व्याकुल होकर शाण्डिल्य ऋषि के पास गई। उसने बताया कि ज्येष्ठ पुत्र धर्मगुप्त राजवंश से है और कनिष्ठ पुत्र शुचिव्रत है, पर जीवन दरिद्रता से घिरा है। ऋषि ने प्रदोष व्रत का मार्ग बताया।',
          'परिवार ने व्रत का संकल्प लिया। एक दिन शुचिव्रत को स्नान के मार्ग में स्वर्ण-कलश मिला। माता ने धर्मगुप्त को आधा लेने को कहा, पर उसने शिव-पार्वती का स्मरण कर कहा कि जो धन मेरे भाग्य में होगा, वह प्रभु देंगे; यह धन भाई का है। यह संतोष ही आगे उसकी रक्षा का कारण बना।',
          'बाद में धर्मगुप्त गन्धर्व-कन्या अंशुमति से मिला। गन्धर्वराज ने कहा कि शिव ने स्वप्न में आदेश दिया है कि वह इस निष्कासित राजकुमार को राज्य दिलाने में सहायता करे और अपनी कन्या का विवाह उससे करे। विवाह हुआ, सहायता मिली और धर्मगुप्त ने अपना राज्य पुनः पाया। शनि प्रदोष धैर्य, न्याय और विलंबित फल की कथा बनता है।',
        ],
        bodyEn: [
          'The Shani Pradosha katha tells of a poor Brahmin household with a wife and two sons. Distressed by poverty, the wife goes to Rishi Shandilya. She explains that the elder son, Dharmagupta, is of royal birth, and the younger son is Shuchivrata, but their life is surrounded by hardship. The sage advises the Pradosha vow.',
          'The family takes the vow. One day Shuchivrata finds a golden pot on the way to bathe. The mother asks Dharmagupta to accept half of it, but he remembers Shiva and Parvati and says that whatever is truly his will come from the Lord; this wealth belongs to his brother. That contentment becomes the ground for later grace.',
          'Later Dharmagupta meets the Gandharva maiden Anshumati. Her father says that Shiva has instructed him in a dream to help this exiled prince regain his kingdom and to give his daughter in marriage to him. The marriage takes place, help arrives, and Dharmagupta regains his throne. Shani Pradosha becomes a story of patience, justice, and fruit that ripens after endurance.',
        ],
      },
      {
        id: 'pradosha-message',
        titleHi: 'प्रदोष का संयुक्त संदेश',
        titleEn: 'The shared message of Pradosha',
        bodyHi: [
          'इन सातों कथाओं में प्रसंग अलग हैं, पर केंद्र एक है - त्रयोदशी की संध्या में शिव के सामने अपने दोष, भय, हठ, अभाव और अन्याय को रखना। कहीं पुत्र बचता है, कहीं राज्य लौटता है, कहीं हठ टूटता है, कहीं गुरु-वाणी से देवताओं को साहस मिलता है।',
          'प्रदोष काल दिन और रात के बीच की सीमा है; इसलिए यह व्रत भी मनुष्य को कर्म और विश्राम, प्रयास और समर्पण, नियम और करुणा के बीच संतुलन सिखाता है। कथा सुनने वाला भक्त शिव-पार्वती से प्रार्थना करता है कि संध्या का छोटा दीप भीतर के अंधकार को पहचानने और उसे शांत करने की बुद्धि दे।',
        ],
        bodyEn: [
          'Across the seven stories, the situations differ but the center is the same: during the Trayodashi twilight, the devotee places fault, fear, stubbornness, poverty, injustice, and confusion before Shiva. A son is protected, a kingdom is restored, pride is broken, and the devas regain courage through the word of the guru.',
          'Pradosha is the threshold between day and night, so the vow teaches balance between action and rest, effort and surrender, rule and compassion. The devotee listening to the katha prays to Shiva and Parvati that the small twilight lamp may reveal the inner darkness and give the wisdom to quiet it.',
        ],
      },
    ],
  }),
  summaryContent({
    id: 'weekday-vrat-katha',
    titleHi: 'वार व्रत कथा',
    titleEn: 'Weekday Vrat Katha',
    themeHi: 'वार व्रत कथाएं सप्ताह के दिन, ग्रह और देवता-उपासना को जोड़ती हैं। इन कथाओं का भाव है कि नियमित दिनचर्या में भी श्रद्धा, दान, संयम और स्मरण के छोटे अभ्यास जोड़े जा सकते हैं।',
    themeEn: 'Weekday vrat stories connect the days of the week with planetary and deity worship. Their shared idea is that daily rhythm can include simple disciplines of devotion, charity, restraint, and remembrance.',
    practiceHi: 'सोमवार, मंगलवार, गुरुवार आदि व्रतों में स्थानीय परंपराएं भिन्न हो सकती हैं। ऐप इसे सामान्य कथा-समूह के रूप में रखता है और आगे प्रत्येक वार के लिए अलग सामग्री जोड़ी जा सकती है।',
    practiceEn: 'Practices for Monday, Tuesday, Thursday, and other weekday fasts vary by region. The app keeps this as a general katha group that can later expand into per-weekday content.',
  }),
  fullContent({
    id: 'karwa-chauth-vrat-katha',
    titleHi: 'करवा चौथ व्रत कथा',
    titleEn: 'Karwa Chauth Vrat Katha',
    sourceUrls: ['https://www.drikpanchang.com/festivals/karwa-chauth/legends/karwa-chauth-legends.html'],
    sections: [
      {
        id: 'vedsharma-family',
        titleHi: 'वेदशर्मा का घर और वीरवती',
        titleEn: 'Vedsharma household and Veeravati',
        bodyHi: [
          'करवा चौथ की प्रचलित कथा इन्द्रप्रस्थपुर के ब्राह्मण वेदशर्मा के घर से शुरू होती है। वेदशर्मा और उनकी पत्नी लीलावती के सात पुत्र थे और एक पुत्री थी, वीरवती। अकेली बहन होने के कारण वीरवती माता-पिता और भाइयों की अत्यंत प्रिय थी।',
          'समय आने पर वीरवती का विवाह योग्य ब्राह्मण युवक से हुआ। विवाह के बाद जब वह मायके आई, तब करवा चौथ का व्रत आया। उसने अपनी भाभियों के साथ पति की दीर्घायु और मंगल के लिए निर्जला व्रत रखने का संकल्प किया।',
          'दिन बढ़ता गया और वीरवती का शरीर कमजोर होने लगा। भूख-प्यास से वह अचेत होकर गिर पड़ी। भाइयों ने बहन की दशा देखी। वे जानते थे कि वह चंद्र दर्शन और अर्घ्य से पहले अन्न-जल नहीं लेगी, पर उनका स्नेह धैर्य में नहीं बदल पाया।',
        ],
        bodyEn: [
          'The common Karwa Chauth legend begins in the household of a Brahmin named Vedsharma in Indraprasthapur. Vedsharma and his wife Leelavati had seven sons and one daughter, Veeravati. As the only sister, Veeravati was deeply loved by her parents and brothers.',
          'When she came of age, Veeravati was married to a suitable Brahmin youth. After marriage, while she was staying at her parents home, Karwa Chauth arrived. Along with her sisters-in-law, she resolved to keep the nirjala fast for the long life and wellbeing of her husband.',
          'As the day passed, Veeravati body weakened. Overcome by hunger and thirst, she fainted and fell. Her brothers saw her suffering. They knew she would not eat or drink before seeing the moon and offering arghya, but their affection failed to become patience.',
        ],
      },
      {
        id: 'false-moon',
        titleHi: 'छल का चंद्रमा',
        titleEn: 'The false moon',
        bodyHi: [
          'भाइयों ने बहन का व्रत तुड़वाने के लिए योजना बनाई। एक भाई दूर वट वृक्ष पर चढ़ गया और छलनी के पीछे दीपक रख दिया। बाकी भाइयों ने वीरवती को संभाला और कहा कि चंद्रमा निकल आया है, अब वह छत पर जाकर दर्शन कर सकती है।',
          'वीरवती ने दूर से छलनी और दीपक का प्रकाश देखा। उसे लगा कि वृक्षों के झुरमुट से चंद्रमा दिखाई दे रहा है। उसने उस प्रकाश को चंद्र मानकर अर्घ्य दिया और व्रत खोल लिया। उसी क्षण व्रत की विधि असत्य से टूट गई।',
          'कथा यहां बहुत सूक्ष्म शिक्षा देती है। भाइयों का मन क्रूर नहीं था; वे बहन से प्रेम करते थे। फिर भी अधैर्य और असत्य ने उनके प्रेम को अशुभ बना दिया। व्रत में भावना आवश्यक है, पर विधि और सत्य भी उतने ही आवश्यक हैं।',
        ],
        bodyEn: [
          'The brothers made a plan to make their sister break the fast. One brother climbed a distant vat tree and placed a lamp behind a sieve. The others helped Veeravati regain consciousness and told her that the moon had risen and she could go to the roof for sighting.',
          'Veeravati saw the distant light through the sieve and believed the moon was rising behind the trees. She offered arghya to that light and broke the fast. At that moment the discipline of the vow was broken by untruth.',
          'The katha gives a subtle teaching here. The brothers were not cruel; they loved their sister. Yet impatience and falsehood turned their affection into an inauspicious act. Devotion requires feeling, but it also requires method and truth.',
        ],
      },
      {
        id: 'omens-and-loss',
        titleHi: 'अशुभ संकेत और इन्द्राणी की शिक्षा',
        titleEn: 'Omens and the teaching of Indrani',
        bodyHi: [
          'वीरवती ने भोजन आरंभ किया तो अशुभ संकेत मिले। पहले ग्रास में बाल निकला, दूसरे ग्रास पर छींक आई और तीसरे ग्रास के समय ससुराल से बुलावा आ गया। वह पति के घर पहुंची तो उसे पति मृतवत दिखाई दिया।',
          'वीरवती विलाप करने लगी और अपने व्रत में हुई भूल को याद कर पश्चात्ताप करने लगी। उसकी करुण पुकार सुनकर इन्द्राणी, इन्द्र देव की पत्नी, उसे समझाने आईं। उन्होंने बताया कि चंद्रमा को अर्घ्य दिए बिना व्रत खोलने से यह संकट आया है।',
          'इन्द्राणी ने वीरवती को निराश नहीं किया। उन्होंने उसे उपाय बताया कि वह हर मास की चौथ और करवा चौथ को पूर्ण विधि से व्रत करे। सच्चा पश्चात्ताप केवल रोना नहीं है; वह सही विधि में लौटने का धैर्यपूर्ण संकल्प है।',
        ],
        bodyEn: [
          'When Veeravati began to eat, troubling omens appeared. In the first bite she found a hair, at the second she sneezed, and at the third a summons came from her in-laws. When she reached her husband home, she found him lifeless.',
          'Veeravati cried bitterly and remembered that some mistake must have occurred in the fast. Hearing her grief, Indrani, the wife of Indra, came to console and instruct her. She explained that breaking the fast without offering arghya to the true moon had brought this crisis.',
          'Indrani did not leave Veeravati in despair. She told her to observe the Chauth fast every month, including Karwa Chauth, with complete method and faith. True repentance is not only weeping; it is the patient resolve to return to the right discipline.',
        ],
      },
      {
        id: 'year-of-vows',
        titleHi: 'बारह चतुर्थियों का धैर्य',
        titleEn: 'The patience of monthly Chauth vows',
        bodyHi: [
          'वीरवती ने इन्द्राणी की बात स्वीकार की। उसने मासिक चौथों का व्रत श्रद्धा से रखा, हर बार धैर्यपूर्वक चंद्र दर्शन की प्रतीक्षा की, अर्घ्य दिया और विधिपूर्वक व्रत खोला। उसके भीतर अधैर्य के स्थान पर अनुशासन जागा।',
          'करवा, दीप, कथा, श्रृंगार, गौरी स्मरण और चंद्र अर्घ्य ने उसके व्रत को फिर पूर्ण बनाया। वह केवल पति को वापस पाने की इच्छा से नहीं, अपनी भूल को ठीक करने की विनम्रता से साधना करती रही।',
          'संचित पुण्य और अटूट विश्वास से अंततः वीरवती को पति पुनः प्राप्त हुआ। कथा में सौभाग्य का अर्थ केवल बाहरी चिह्न नहीं है; वह सत्य, प्रतीक्षा, प्रार्थना और विधि की रक्षा से जन्मा हुआ गृहस्थ मंगल है।',
        ],
        bodyEn: [
          'Veeravati accepted Indrani guidance. She observed the monthly Chauth fasts with devotion, waited patiently each time for true moon sighting, offered arghya, and completed the vow properly. Discipline awakened where impatience had once ruled.',
          'The karwa vessel, lamp, katha, adornment, remembrance of Gauri, and moon offering made her observance whole again. She practiced not only because she wanted her husband back, but also because she humbly wanted to correct her mistake.',
          'Through accumulated merit and unwavering faith, Veeravati finally received her husband back. In the story, auspicious married life is not only an outer sign; it is household wellbeing born from truth, waiting, prayer, and respect for sacred method.',
        ],
      },
      {
        id: 'karwa-chauth-observance',
        titleHi: 'करवा चौथ का संदेश',
        titleEn: 'The message of Karwa Chauth',
        bodyHi: [
          'करवा चौथ व्रत में सूर्योदय से चंद्र दर्शन तक संयम, चौथ माता या गौरी पूजन, कथा-श्रवण, करवा, दीप और अर्घ्य का महत्व है। कथा का उद्देश्य किसी एक क्षेत्रीय रूप को अंतिम घोषित करना नहीं, बल्कि व्रत की नैतिक रीढ़ समझाना है।',
          'वीरवती की कथा बताती है कि प्रेम को सत्य की आवश्यकता होती है। केवल स्नेह पर्याप्त नहीं, यदि वह असत्य का सहारा ले। परिवार की रक्षा धैर्य, स्पष्टता और वचन की मर्यादा से होती है।',
          'इसलिए यह व्रत पति-पत्नी के मंगल के साथ-साथ परिवार के भीतर ईमानदार स्नेह का व्रत भी है। चंद्रमा को अर्घ्य देते समय भक्त अपने मन को भी शांत करता है और प्रार्थना करता है कि संबंधों में प्रेम हो, पर वह प्रेम सत्य से जुड़ा रहे।',
        ],
        bodyEn: [
          'Karwa Chauth includes restraint from sunrise to moon sighting, worship of Chauth Mata or Gauri, listening to the katha, the karwa vessel, lamp, and arghya. The purpose of the story is not to declare one regional version final, but to explain the moral spine of the vow.',
          'Veeravati story teaches that love needs truth. Affection alone is not enough if it takes support from falsehood. The protection of a family comes through patience, clarity, and respect for promises.',
          'The vow is therefore for marital wellbeing and also for honest affection within the family. When the devotee offers arghya to the moon, the mind is also calmed, and the prayer is that relationships may be filled with love joined to truth.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'ahoi-ashtami-vrat-katha',
    titleHi: 'अहोई अष्टमी व्रत कथा',
    titleEn: 'Ahoi Ashtami Vrat Katha',
    sourceUrls: ['https://www.drikpanchang.com/festivals/ahoi-ashtami/legends/ahoi-ashtami-vrat-katha.html'],
    sections: [
      {
        id: 'mother-and-seven-sons',
        titleHi: 'माता और सात पुत्र',
        titleEn: 'The mother and her seven sons',
        bodyHi: [
          'अहोई अष्टमी की कथा एक ऐसी स्त्री से शुरू होती है जो गांव में रहती थी और सात पुत्रों की माता थी। वह श्रद्धावान, गृहकार्य में निपुण और परिवार के प्रति समर्पित थी। दीपावली निकट थी, इसलिए उसने घर की मरम्मत और सजावट के लिए मिट्टी लाने का निश्चय किया।',
          'गांव के पास घना वन था। स्त्री मिट्टी खोदने के लिए वहां गई। उसके मन में घर को स्वच्छ और सुंदर बनाने की इच्छा थी, पर वह मिट्टी के भीतर छिपे छोटे जीवों का ध्यान नहीं रख पाई।',
          'खुदाई करते समय उसके फावड़े से अनजाने में सेई या साही के बच्चों को चोट लगी और वे मर गए। स्त्री को तुरंत दुःख हुआ। उसने यह जानबूझकर नहीं किया था, फिर भी निर्दोष जीवों की मृत्यु ने उसके मन पर अपराध-बोध बैठा दिया।',
        ],
        bodyEn: [
          'The Ahoi Ashtami katha begins with a woman who lived in a village and was the mother of seven sons. She was devoted, skilled in household work, and dedicated to her family. As Diwali approached, she decided to collect earth to repair and decorate her home.',
          'There was a dense forest near the village. The woman went there to dig soil. Her intention was to make the home clean and beautiful, but she did not notice the small living beings hidden in the earth.',
          'While digging, her spade accidentally injured and killed the young of a small wild creature, often described as a hoglet or hedgehog cub. She had not acted deliberately, yet grief and guilt entered her heart because innocent lives had been lost.',
        ],
      },
      {
        id: 'sons-disappear',
        titleHi: 'सात पुत्रों का संकट',
        titleEn: 'The loss of the seven sons',
        bodyHi: [
          'उस घटना के बाद समय बीता। एक वर्ष के भीतर स्त्री के सातों पुत्र एक-एक करके लापता हो गए और गांव वालों ने उन्हें मृत मान लिया। किसी ने कहा कि वन्य पशुओं ने उन्हें मार दिया होगा, किसी ने इसे दुर्भाग्य कहा।',
          'माता का हृदय टूट गया। वह बार-बार वन की उस घटना को याद करती। उसे लगता कि जिस प्रकार उसके हाथ से उन छोटे बच्चों की मृत्यु हुई, उसी प्रकार अब उसके अपने बच्चों पर संकट आया है।',
          'दुःख से व्याकुल होकर उसने गांव की वृद्ध स्त्रियों से अपनी बात कही। उसने पूरी घटना स्वीकार की और पूछा कि इस पाप या भूल से कैसे निवृत्ति मिले। कथा यहां स्वीकारोक्ति को महत्वपूर्ण बनाती है; उसने अपनी पीड़ा छिपाई नहीं।',
        ],
        bodyEn: [
          'After that incident, time passed. Within a year, all seven of the woman sons disappeared one by one, and the villagers assumed they were dead. Some said wild animals from the forest must have killed them; others called it misfortune.',
          'The mother heart was shattered. Again and again she remembered the accident in the forest. She felt that just as small children had died through her hand, danger had now come upon her own children.',
          'Overwhelmed by sorrow, she spoke to the elderly women of the village. She confessed the entire incident and asked how she could be freed from the fault. The story gives importance to honest admission; she did not hide her pain or her mistake.',
        ],
      },
      {
        id: 'old-woman-guidance',
        titleHi: 'वृद्धा की सलाह',
        titleEn: 'The elder woman guidance',
        bodyHi: [
          'एक वृद्धा ने उसे समझाया कि वह अहोई भगवती की शरण ले। अहोई माता को संतान की रक्षा करने वाली, सभी जीवों की संतति पर कृपा रखने वाली देवी माना गया। वृद्धा ने कहा कि वह सेई के बच्चे का मुख बनाकर माता की पूजा करे।',
          'स्त्री को अष्टमी का व्रत रखने, अहोई माता की पूजा करने और अपने अपराध के लिए ईमानदारी से क्षमा मांगने को कहा गया। यह पूजा केवल संतान पाने की मांग नहीं थी; यह उस जीव-हानि के लिए प्रायश्चित्त भी था जो अनजाने में हुई थी।',
          'वृद्धा की बात सुनकर स्त्री के भीतर आशा जागी। उसने समझा कि मातृत्व केवल अपने बच्चों तक सीमित नहीं है। यदि वह अपने पुत्रों के लिए रोती है, तो उसे उन छोटे जीवों के लिए भी करुणा रखनी होगी जिनकी मृत्यु से यह कथा शुरू हुई।',
        ],
        bodyEn: [
          'An elder woman advised her to take refuge in Ahoi Bhagawati. Ahoi Mata is remembered as a protector of offspring and as a goddess who shows compassion toward the young of all living beings. The elder told her to draw the face of the small creature and worship the Mother.',
          'The woman was instructed to observe the fast on Ashtami, perform Ahoi Mata Puja, and honestly ask forgiveness for her act. This worship was not only a demand for children; it was also atonement for the harm unknowingly caused to life.',
          'Hearing this guidance, hope arose within her. She understood that motherhood does not stop with one own children. If she grieved for her sons, she also had to feel compassion for the small lives whose death began the story.',
        ],
      },
      {
        id: 'ashtami-vow',
        titleHi: 'अष्टमी का व्रत और माता का दर्शन',
        titleEn: 'The Ashtami vow and the Mother grace',
        bodyHi: [
          'कार्तिक कृष्ण अष्टमी आने पर स्त्री ने अहोई माता का चित्र बनाया। उसने व्रत रखा, पूजा की, कथा सुनी और पूरी सच्चाई से अपनी भूल पर पश्चात्ताप किया। उसके मन में भय था, पर उससे अधिक विनम्रता थी।',
          'अहोई माता उसकी श्रद्धा और ईमानदार पश्चात्ताप से प्रसन्न हुईं। देवी ने प्रकट होकर उसे पुत्रों की दीर्घायु और पुनः प्राप्ति का वर दिया। माता का आशीर्वाद दंड का अंत नहीं, संवेदनशील जीवन की शुरुआत भी था।',
          'कुछ समय बाद उसके सातों पुत्र जीवित लौट आए। घर में शोक के स्थान पर आनंद छा गया। गांव में यह विश्वास स्थापित हुआ कि कार्तिक कृष्ण अष्टमी पर अहोई माता की पूजा संतान-रक्षा और परिवार के मंगल के लिए की जानी चाहिए।',
        ],
        bodyEn: [
          'When Kartika Krishna Ashtami arrived, the woman drew the image of Ahoi Mata. She observed the fast, performed the puja, listened to the katha, and repented for her mistake with complete honesty. There was fear in her heart, but there was even more humility.',
          'Ahoi Mata was pleased by her devotion and sincere repentance. The Goddess appeared and granted the boon of long life and restoration for her sons. The Mother blessing was not only the end of punishment; it was also the beginning of a more sensitive way of living.',
          'Soon all seven sons returned alive. Joy replaced grief in the home. The village came to honor the belief that on Kartika Krishna Ashtami, Ahoi Mata should be worshipped for the protection of children and the auspiciousness of the family.',
        ],
      },
      {
        id: 'ahoi-observance-message',
        titleHi: 'अहोई अष्टमी का संदेश',
        titleEn: 'The message of Ahoi Ashtami',
        bodyHi: [
          'अहोई अष्टमी व्रत में माताएं संतान के कल्याण के लिए व्रत रखती हैं, अहोई माता का चित्र या प्रतीक पूजती हैं और संध्या समय तारे देखकर पूजा पूर्ण करती हैं। कुछ स्थानों पर चंद्र दर्शन की परंपरा भी जुड़ती है।',
          'कथा का गहरा भाव यह है कि संतान-रक्षा केवल अपने घर की रक्षा नहीं है। यह सभी जीवों के बच्चों के प्रति दया, सावधानी और उत्तरदायित्व का स्मरण है। मिट्टी खोदते समय हुई छोटी असावधानी कथा में बड़ा नैतिक बोध बन जाती है।',
          'अहोई माता की पूजा भक्त को सिखाती है कि भूल हो जाए तो उसे स्वीकार कर सुधार और प्रार्थना की ओर लौटना चाहिए। मातृ-स्नेह तब पूर्ण होता है जब वह करुणा, सजगता और जीवन के सम्मान से जुड़ता है।',
        ],
        bodyEn: [
          'In Ahoi Ashtami Vrat, mothers fast for the wellbeing of their children, worship the image or symbol of Ahoi Mata, and complete the worship in the evening after sighting the stars. In some places, moon sighting is also part of the observance.',
          'The deeper meaning of the katha is that protecting children is not limited to one own household. It includes compassion, care, and responsibility toward the young of all living beings. A small carelessness while digging earth becomes a major moral awakening in the story.',
          'Ahoi Mata worship teaches that when a mistake happens, one should accept it and return toward correction and prayer. Maternal love becomes complete when joined with compassion, alertness, and respect for life. The restored sons are therefore not only a happy ending; they are a reminder that grace asks the family to live more carefully afterward.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'diwali-legends',
    titleHi: 'दीपावली कथा',
    titleEn: 'Diwali Legends',
    sections: [
      {
        id: 'rama-return',
        titleHi: 'श्री राम की अयोध्या वापसी',
        titleEn: 'Rama returns to Ayodhya',
        bodyHi: [
          'दीपावली की सबसे प्रिय कथा श्री राम, सीता और लक्ष्मण के चौदह वर्ष के वनवास के बाद अयोध्या लौटने की है। रावण-वध के बाद जब धर्म की विजय हुई, तब अयोध्यावासियों ने दीप जलाकर अपने प्रिय राम का स्वागत किया।',
          'दीप केवल उत्सव का साधन नहीं था। वह घर-घर की कृतज्ञता, प्रतीक्षा और धर्म की वापसी का प्रतीक था। अंधकार से भरे वर्षों के बाद नगर ने प्रकाश से कहा कि मर्यादा और न्याय फिर से जीवन में प्रवेश कर रहे हैं।',
        ],
        bodyEn: [
          'One of the most beloved Diwali legends is the return of Shri Rama, Sita, and Lakshmana to Ayodhya after fourteen years of exile. After Ravana defeat and the victory of dharma, the people of Ayodhya welcomed Rama by lighting lamps.',
          'The lamp was not merely decoration. It symbolized gratitude, long waiting, and the return of righteous order. After years marked by darkness, the city used light to say that restraint, justice, and beloved leadership were entering life again.',
        ],
      },
      {
        id: 'lakshmi-worship',
        titleHi: 'लक्ष्मी पूजन और स्वच्छता',
        titleEn: 'Lakshmi worship and cleanliness',
        bodyHi: [
          'दीपावली की दूसरी धारा मां लक्ष्मी के पूजन से जुड़ी है। घर साफ किए जाते हैं, दीप सजते हैं और परिवार समृद्धि को धर्मपूर्वक ग्रहण करने की प्रार्थना करता है। लक्ष्मी केवल धन नहीं, शुद्धता, श्रम, सदाचार और सौभाग्य का संकेत हैं।',
          'गणेश जी का पूजन साथ में इसलिए होता है कि धन विवेक से जुड़ा रहे। बिना बुद्धि के समृद्धि चिंता बन सकती है, पर गणेश और लक्ष्मी का संयुक्त स्मरण धन को सेवा, संतुलन और शुभ उपयोग की दिशा देता है।',
        ],
        bodyEn: [
          'Another stream of Diwali is the worship of Maa Lakshmi. Homes are cleaned, lamps are arranged, and families pray to receive prosperity in a dharmic way. Lakshmi is not only money; she signifies purity, effort, good conduct, and auspicious abundance.',
          'Ganesha is worshipped along with Lakshmi so that wealth remains joined with wisdom. Prosperity without discernment can become anxiety, while the combined remembrance of Ganesha and Lakshmi directs resources toward service, balance, and auspicious use.',
        ],
      },
      {
        id: 'other-legends',
        titleHi: 'क्षेत्रीय कथाओं का प्रकाश',
        titleEn: 'The light of regional legends',
        bodyHi: [
          'कई क्षेत्रों में दीपावली श्री कृष्ण द्वारा नरकासुर-वध, वामन और बलि, या व्यापारिक नववर्ष से भी जुड़ी है। कथाएं अलग-अलग हैं, पर सभी में अंधकार, अहंकार, अन्याय या जड़ता पर प्रकाश की विजय का भाव है।',
          'इसीलिए दीपावली बहु-स्तरीय पर्व है। घर का दीप, मंदिर की आरती, बाजार का नया लेखा और परिवार का मिलन - सब मिलकर बताते हैं कि जीवन को फिर से स्वच्छ, उज्ज्वल और उदार बनाना है।',
        ],
        bodyEn: [
          'In many regions, Diwali is also linked with Krishna defeat of Narakasura, Vamana and Bali, or the beginning of a mercantile new year. The stories differ, but each carries the triumph of light over darkness, arrogance, injustice, or stagnation.',
          'This is why Diwali is a layered festival. The lamp at home, the arati in the temple, the new account book, and the family gathering all point to renewing life with cleanliness, brightness, and generosity.',
        ],
      },
      {
        id: 'diwali-message',
        titleHi: 'दीप का संदेश',
        titleEn: 'The message of the lamp',
        bodyHi: [
          'दीपावली कथा का सार है कि प्रकाश बाहर भी जलाना है और भीतर भी। घर की सफाई के साथ मन की ईर्ष्या, कठोरता और भ्रम को भी हटाना है। तभी लक्ष्मी का स्वागत केवल विधि नहीं, जीवन का संस्कार बनता है।',
          'दीप जलाते समय भक्त धर्म की वापसी, समृद्धि का सही उपयोग और परिवार में मधुरता की कामना करता है। कथा उसे याद दिलाती है कि छोटा दीप भी अंधकार को चुनौती देता है।',
        ],
        bodyEn: [
          'The essence of Diwali is to light lamps outside and within. Along with cleaning the home, one must remove jealousy, harshness, and confusion from the mind. Only then does welcoming Lakshmi become not merely a ritual but a refinement of life.',
          'When the devotee lights a lamp, he or she prays for the return of dharma, the right use of prosperity, and sweetness in the family. The story reminds us that even a small flame challenges darkness.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'dhanteras-legends',
    titleHi: 'धनतेरस कथा',
    titleEn: 'Dhanteras Legends',
    sections: [
      {
        id: 'dhanvantari',
        titleHi: 'समुद्र मंथन और धन्वंतरि',
        titleEn: 'Dhanvantari from the ocean',
        bodyHi: [
          'धनतेरस की कथा समुद्र मंथन से जुड़ती है। देव और असुर अमृत की खोज में क्षीरसागर का मंथन करते हैं। अनेक रत्नों के बाद भगवान धन्वंतरि अमृत कलश लेकर प्रकट होते हैं। वे आयुर्वेद, आरोग्य और जीवन-रक्षा के देव रूप में स्मरण किए जाते हैं।',
          'इसलिए धनतेरस पर धन का पहला अर्थ स्वास्थ्य माना जाता है। सोना, पात्र या नया सामान खरीदना शुभ माना जाता है, पर कथा याद दिलाती है कि शरीर, आयु और संतुलित जीवन सबसे बड़ा धन है।',
        ],
        bodyEn: [
          'Dhanteras is connected with the churning of the cosmic ocean. The devas and asuras churn the Kshira Sagara in search of amrita. After many treasures appear, Lord Dhanvantari manifests holding the pot of nectar and is remembered as the divine source of Ayurveda, health, and preservation of life.',
          'For this reason, the first meaning of wealth on Dhanteras is wellbeing. Buying gold, vessels, or new items is considered auspicious, but the story reminds the devotee that health, longevity, and balanced living are the deepest forms of prosperity.',
        ],
      },
      {
        id: 'yamadeep',
        titleHi: 'यमदीप की कथा',
        titleEn: 'The Yamadeep legend',
        bodyHi: [
          'धनतेरस से जुड़ी एक लोककथा में एक राजकुमार के अल्पायु होने का संकेत था। उसकी पत्नी ने नियत रात दीप, आभूषण और जागरण से घर को प्रकाशित रखा। कथा में यमदूत उस प्रकाश, जागरण और सौभाग्य की शक्ति से भीतर प्रवेश नहीं कर पाए।',
          'इस कथा से दक्षिण दिशा में दीपदान या यमदीप की परंपरा जुड़ती है। दीप मृत्यु के भय को चुनौती देने वाला अहंकार नहीं है; वह जीवन के प्रति कृतज्ञता, सावधानी और आयु की रक्षा की विनम्र प्रार्थना है।',
        ],
        bodyEn: [
          'A folk legend associated with Dhanteras tells of a prince whose life was predicted to be short. On the destined night, his wife kept the house bright with lamps, ornaments, and wakefulness. In the story, the messengers of Yama could not enter through that field of light, alertness, and auspicious devotion.',
          'This legend is connected with the practice of lighting Yamadeep, often toward the south. The lamp is not arrogant denial of death; it is gratitude for life, carefulness, and a humble prayer for protection of lifespan.',
        ],
      },
      {
        id: 'right-wealth',
        titleHi: 'धन का धर्म',
        titleEn: 'The dharma of wealth',
        bodyHi: [
          'धनतेरस पर परिवार घर साफ करता है, दीप जलाता है और धन्वंतरि का स्मरण करता है। व्यापारिक और गृहस्थ दोनों जीवन में यह दिन नए आरंभ का संकेत देता है। पर कथा धन को धर्म से अलग नहीं होने देती।',
          'यदि धन स्वास्थ्य, सेवा, दान और संतुलित उपयोग से जुड़ा हो तो वह लक्ष्मी का रूप बनता है। यदि धन लोभ, भय और प्रदर्शन से जुड़ जाए तो वही बोझ बन जाता है।',
        ],
        bodyEn: [
          'On Dhanteras, families clean the home, light lamps, and remember Dhanvantari. In both business and household life, the day signals auspicious renewal. Yet the story does not allow wealth to be separated from dharma.',
          'When wealth is joined with health, service, charity, and measured use, it becomes a form of Lakshmi. When it is joined with greed, fear, and display, the same wealth becomes a burden.',
        ],
      },
      {
        id: 'dhanteras-message',
        titleHi: 'आरोग्य ही समृद्धि',
        titleEn: 'Wellbeing as prosperity',
        bodyHi: [
          'धनतेरस कथा भक्त को यह समझाती है कि समृद्धि की शुरुआत शरीर, आयु, शुद्धता और जागरूकता से होती है। धन्वंतरि का कलश केवल अमृत नहीं, स्वास्थ्य-संरक्षण की जिम्मेदारी भी है।',
          'इस दिन दीप जलाकर, औषधि और आरोग्य का स्मरण करके, और धन को शुभ उपयोग में लगाने का संकल्प लेकर भक्त आने वाली दीपावली को भीतर से तैयार करता है।',
        ],
        bodyEn: [
          'The Dhanteras katha teaches that prosperity begins with health, lifespan, purity, and alert living. Dhanvantari pot is not only nectar; it also represents the responsibility to protect wellbeing.',
          'By lighting lamps, remembering medicine and health, and resolving to use wealth auspiciously, the devotee prepares inwardly for the coming festival of Diwali.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'sharad-purnima-vrat-katha',
    titleHi: 'शरद पूर्णिमा व्रत कथा',
    titleEn: 'Sharad Purnima Vrat Katha',
    sections: [
      {
        id: 'cool-moon',
        titleHi: 'शरद की पूर्ण चांदनी',
        titleEn: 'The full moon of Sharad',
        bodyHi: [
          'शरद पूर्णिमा की रात वर्षा ऋतु के बाद निर्मल आकाश और पूर्ण चंद्रमा का उत्सव है। परंपरा में माना जाता है कि इस रात चंद्रमा की किरणें विशेष शीतलता और अमृत-भाव लेकर आती हैं।',
          'भक्त खीर या नैवेद्य चांदनी में रखकर ईश्वर को अर्पित करते हैं। यह कर्म प्रकृति की शुद्धता, चंद्रमा की शीतलता और मन की कृतज्ञता को एक साथ जोड़ता है।',
        ],
        bodyEn: [
          'Sharad Purnima celebrates the clear sky and full moon after the rains. Tradition holds that the moonlight on this night carries special coolness and a nectar-like quality.',
          'Devotees place kheer or offerings in the moonlight and offer them to the Divine. The act joins the purity of nature, the soothing light of the moon, and the gratitude of the mind.',
        ],
      },
      {
        id: 'kojagari',
        titleHi: 'को जागर्ति',
        titleEn: 'Who is awake',
        bodyHi: [
          'इस रात कोजागरी का भाव भी आता है - कौन जाग रहा है। मां लक्ष्मी सजग, स्वच्छ और श्रद्धावान घरों में कृपा करती हैं, ऐसा माना जाता है। यहां जागरण केवल नींद न लेना नहीं, बल्कि मन की चेतना को जगाए रखना है।',
          'परिवार दीप, भजन, कथा और शांत संगति से रात्रि बिताता है। कथा का उद्देश्य लोभ से धन मांगना नहीं, बल्कि ऐसा जीवन मांगना है जिसमें स्वच्छता, सतर्कता और संतुलित समृद्धि हो।',
        ],
        bodyEn: [
          'The night also carries the Kojagari question: who is awake? It is believed that Maa Lakshmi blesses homes that are clean, alert, and devotional. Wakefulness here is not merely avoiding sleep; it means keeping the inner awareness alive.',
          'Families spend the night with lamps, bhajan, katha, and quiet togetherness. The purpose is not greedy demand for wealth, but prayer for a life marked by cleanliness, alertness, and balanced prosperity.',
        ],
      },
      {
        id: 'rasa-memory',
        titleHi: 'रास और भक्ति',
        titleEn: 'Rasa and devotion',
        bodyHi: [
          'कई वैष्णव परंपराओं में शरद पूर्णिमा को श्री कृष्ण की महारास लीला से भी जोड़ा जाता है। चंद्रमा की उजली रात में गोपियों की भक्ति और कृष्ण का प्रेम दिव्य आनंद का प्रतीक बनता है।',
          'यह कथा बताती है कि शुद्ध प्रेम में स्वार्थ कम होता है और समर्पण बढ़ता है। चंद्रमा की शीतलता की तरह भक्ति मन की गर्मी, जलन और बेचैनी को शांत करती है।',
        ],
        bodyEn: [
          'In many Vaishnava traditions, Sharad Purnima is also connected with the Maha Rasa of Shri Krishna. In the bright moonlit night, the devotion of the gopis and the love of Krishna symbolize divine joy.',
          'This memory teaches that pure love reduces selfishness and deepens surrender. Like the coolness of the moon, devotion settles the heat, jealousy, and restlessness of the mind.',
        ],
      },
      {
        id: 'sharad-message',
        titleHi: 'शीतल मन की साधना',
        titleEn: 'A practice of cooling the mind',
        bodyHi: [
          'शरद पूर्णिमा व्रत कथा भक्त को शीतलता, जागरण और कृतज्ञता सिखाती है। चंद्र दर्शन के साथ मन को भी देखना है - वह शांत है या इच्छा और चिंता से भरा है।',
          'रात्रि-जागरण, खीर, दीप और लक्ष्मी-स्मरण मिलकर कहते हैं कि समृद्धि का एक रूप शांत मन भी है। जब मन ठंडा और सजग हो, तब धर्मपूर्वक आनंद ग्रहण किया जा सकता है।',
        ],
        bodyEn: [
          'The Sharad Purnima katha teaches coolness, wakefulness, and gratitude. Along with seeing the moon, the devotee is invited to observe the mind: is it calm, or filled with desire and anxiety?',
          'Night vigil, kheer, lamps, and remembrance of Lakshmi together say that a peaceful mind is also a form of prosperity. When the mind is cool and alert, joy can be received in a dharmic way.',
        ],
      },
    ],
  }),
  summaryContent({
    id: 'kojagara-puja-katha',
    titleHi: 'कोजागरा पूजा कथा',
    titleEn: 'Kojagara Puja Katha',
    themeHi: 'कोजागरा पूजा कथा में रात्रि-जागरण और लक्ष्मी स्मरण का भाव आता है। "कौन जाग रहा है" के प्रश्न के माध्यम से कथा सजगता, स्वच्छता और भक्तिपूर्ण गृहस्थ जीवन पर बल देती है।',
    themeEn: 'Kojagara Puja katha emphasizes night vigil and remembrance of Lakshmi. Through the idea of who is awake, it highlights alertness, cleanliness, and devotional household life.',
    practiceHi: 'शरद पूर्णिमा की रात पूजा, दीप और जागरण किया जाता है। कथा बताती है कि लक्ष्मी कृपा केवल धन नहीं, बल्कि सजग और सुसंस्कृत जीवन का प्रतीक है।',
    practiceEn: 'On Sharad Purnima night, devotees observe worship, lamps, and vigil. The katha explains Lakshmi grace as more than wealth: it is the refinement of an alert and disciplined life.',
  }),
  fullContent({
    id: 'holi-legends',
    titleHi: 'होली कथा',
    titleEn: 'Holi Legends',
    sections: [
      {
        id: 'prahlada-devotion',
        titleHi: 'प्रह्लाद की भक्ति',
        titleEn: 'Prahlada devotion',
        bodyHi: [
          'होली कथा भक्त प्रह्लाद से शुरू होती है। उसके पिता हिरण्यकशिपु ने तप से बल पाया और स्वयं को सर्वोच्च मानने लगा। उसने राज्य में अपने नाम की पूजा चाही, पर बालक प्रह्लाद हर समय नारायण का स्मरण करता रहा।',
          'पिता ने समझाया, डराया और दंड दिया, पर प्रह्लाद ने ईश्वर-स्मरण नहीं छोड़ा। कथा में बालक की भक्ति सत्ता के अहंकार से बड़ी दिखाई गई है। धर्म कभी-कभी सबसे निर्बल दिखने वाले के भीतर भी अडिग रहता है।',
        ],
        bodyEn: [
          'The Holi legend begins with the devotee Prahlada. His father Hiranyakashipu gained power through austerity and began to see himself as supreme. He wanted the kingdom to worship him, but young Prahlada constantly remembered Narayana.',
          'The father persuaded, threatened, and punished him, yet Prahlada did not abandon remembrance of God. The story presents the devotion of a child as stronger than the arrogance of power. Dharma can stand firm even inside the one who appears most vulnerable.',
        ],
      },
      {
        id: 'holika-fire',
        titleHi: 'होलिका की अग्नि',
        titleEn: 'Holika in the fire',
        bodyHi: [
          'हिरण्यकशिपु की बहन होलिका को अग्नि से रक्षा का वरदान था। वह प्रह्लाद को गोद में लेकर अग्नि में बैठी, ताकि बालक नष्ट हो जाए। पर वरदान अधर्म के लिए उपयोग हो तो वह टिकता नहीं।',
          'प्रह्लाद नारायण नाम में स्थिर रहा। अग्नि में होलिका जल गई और भक्त सुरक्षित रहा। इस घटना से होलिका-दहन की परंपरा जुड़ती है, जिसमें अहंकार, हिंसा और छल को जलाने का प्रतीक देखा जाता है।',
        ],
        bodyEn: [
          'Hiranyakashipu sister Holika had a boon connected with protection from fire. She sat in the flames holding Prahlada, intending that the child be destroyed. But a boon used for adharma cannot remain protective.',
          'Prahlada remained absorbed in the name of Narayana. Holika was burned, while the devotee was safe. Holika Dahan remembers this event as the symbolic burning of arrogance, violence, and deceit.',
        ],
      },
      {
        id: 'narsimha-promise',
        titleHi: 'नरसिंह का आश्वासन',
        titleEn: 'The assurance of Narasimha',
        bodyHi: [
          'हिरण्यकशिपु ने पूछा कि तुम्हारा भगवान कहां है। प्रह्लाद ने कहा कि वे हर जगह हैं। खंभे पर प्रहार हुआ और भगवान नरसिंह प्रकट हुए। उन्होंने अधर्म का अंत किया और भक्त की बात सत्य सिद्ध की।',
          'होली के प्रसंग में यह स्मरण महत्वपूर्ण है कि भगवान केवल मंदिर में सीमित नहीं हैं। जब सत्य पर आघात होता है, दिव्य शक्ति अप्रत्याशित रूप से प्रकट हो सकती है।',
        ],
        bodyEn: [
          'Hiranyakashipu asked where Prahlada God was. Prahlada answered that the Lord is everywhere. The pillar was struck, and Narasimha manifested. He ended the tyranny and proved the truth of the devotee words.',
          'In the Holi cycle, this remembrance matters because God is not confined to a temple. When truth is attacked, divine power can appear in a form no one expected.',
        ],
      },
      {
        id: 'colors-message',
        titleHi: 'रंगों का संदेश',
        titleEn: 'The message of colors',
        bodyHi: [
          'होलिका-दहन के बाद रंगों का उत्सव आता है। अग्नि अहंकार और क्रूरता को जलाने का प्रतीक है, और रंग प्रेम, मेल-मिलाप और जीवन की नई ऊर्जा का प्रतीक हैं।',
          'होली कथा भक्त को सिखाती है कि भक्ति भय से बड़ी है और सत्य अंत में प्रकट होता है। रंग तभी सुंदर हैं जब मन में द्वेष कम हो और संबंधों में क्षमा का स्थान बने।',
        ],
        bodyEn: [
          'After Holika Dahan comes the festival of colors. The fire symbolizes the burning of arrogance and cruelty, while colors symbolize affection, reconciliation, and renewed energy in life.',
          'The Holi legend teaches that devotion is stronger than fear and truth eventually reveals itself. Colors are beautiful when resentment is reduced and relationships make room for forgiveness.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'raksha-bandhan-legends',
    titleHi: 'रक्षा बंधन कथा',
    titleEn: 'Raksha Bandhan Legends',
    sections: [
      {
        id: 'indrani-raksha',
        titleHi: 'इंद्राणी का रक्षा सूत्र',
        titleEn: 'Indrani ties the protective thread',
        bodyHi: [
          'रक्षा बंधन की एक प्राचीन कथा देवासुर युद्ध से जुड़ी है। जब इंद्र युद्ध में चिंतित हुए, इंद्राणी ने मंत्र और प्रार्थना से रक्षा सूत्र तैयार किया। वह सूत्र इंद्र की कलाई पर बांधा गया और उन्हें साहस मिला।',
          'यह कथा बताती है कि रक्षा सूत्र केवल भाई-बहन के संबंध तक सीमित नहीं था। उसका मूल भाव शुभ संकल्प, प्रार्थना और धर्म की रक्षा के लिए शक्ति जाग्रत करना था।',
        ],
        bodyEn: [
          'One ancient Raksha Bandhan legend is connected with the battle between devas and asuras. When Indra was anxious before battle, Indrani prepared a protective thread with mantra and prayer. It was tied on his wrist, and courage returned to him.',
          'This story shows that the protective thread was not limited only to the brother-sister relationship. Its core meaning was auspicious resolve, prayer, and awakening strength for the protection of dharma.',
        ],
      },
      {
        id: 'krishna-draupadi',
        titleHi: 'कृष्ण और द्रौपदी',
        titleEn: 'Krishna and Draupadi',
        bodyHi: [
          'एक प्रिय लोकप्रसंग में श्री कृष्ण की उंगली कटती है और द्रौपदी अपने वस्त्र का टुकड़ा बांधकर रक्त रोकती हैं। कृष्ण उस स्नेह को स्मरण रखते हैं और संकट के समय द्रौपदी की लाज की रक्षा करते हैं।',
          'कथा का अर्थ लेन-देन नहीं है। यह बताती है कि सच्चे संबंध छोटे दयाभाव को भी गहराई से संभालते हैं। रक्षा का वचन केवल बलवान से दुर्बल की ओर नहीं, परस्पर सम्मान की दिशा में चलता है।',
        ],
        bodyEn: [
          'A beloved popular episode tells of Shri Krishna cutting his finger and Draupadi tearing a piece of her garment to stop the bleeding. Krishna remembers that affection and protects Draupadi dignity in her hour of crisis.',
          'The meaning is not a transaction. The story shows that true relationships preserve even small acts of care. The vow of protection does not flow only from the strong to the weak; it moves through mutual respect.',
        ],
      },
      {
        id: 'sibling-bond',
        titleHi: 'भाई-बहन का संकल्प',
        titleEn: 'The sibling vow',
        bodyHi: [
          'समय के साथ रक्षा बंधन भाई-बहन के पर्व के रूप में विशेष रूप से मनाया जाने लगा। बहन राखी बांधती है, तिलक करती है और मंगल की प्रार्थना करती है। भाई रक्षा, सम्मान और सहयोग का वचन देता है।',
          'कथा इस संबंध को अधिकार से अधिक जिम्मेदारी बनाती है। राखी का धागा कहता है कि परिवार में सुरक्षा केवल शारीरिक नहीं, भावनात्मक और नैतिक भी होनी चाहिए।',
        ],
        bodyEn: [
          'Over time, Raksha Bandhan became especially celebrated as a festival of brothers and sisters. The sister ties rakhi, applies tilak, and prays for wellbeing. The brother promises protection, respect, and support.',
          'The legends make the relationship less about entitlement and more about responsibility. The thread says that safety in a family should be physical, emotional, and ethical.',
        ],
      },
      {
        id: 'raksha-message',
        titleHi: 'रक्षा का व्यापक अर्थ',
        titleEn: 'The wider meaning of protection',
        bodyHi: [
          'रक्षा बंधन कथा भक्त को याद दिलाती है कि रक्षा का अर्थ नियंत्रण नहीं, सम्मान है। जिस संबंध में भरोसा, मर्यादा और सहायता हो, वही सच में रक्षा सूत्र का मान रखता है।',
          'इस पर्व पर बांधा गया धागा धर्म, परिवार और समाज में परस्पर उत्तरदायित्व का संकेत है। रक्षा तब पूर्ण होती है जब हम अपने वचन, भाषा और आचरण से भी किसी को सुरक्षित महसूस कराएं।',
        ],
        bodyEn: [
          'Raksha Bandhan legends remind the devotee that protection does not mean control; it means respect. A relationship honors the thread when it carries trust, boundaries, and help.',
          'The thread tied on this day symbolizes mutual responsibility in dharma, family, and society. Protection becomes complete when our promises, speech, and conduct also help others feel safe.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'hartalika-teej-katha',
    titleHi: 'हरतालिका तीज कथा',
    titleEn: 'Hartalika Teej Katha',
    sections: [
      {
        id: 'parvati-resolve',
        titleHi: 'पार्वती का संकल्प',
        titleEn: 'Parvati resolve',
        bodyHi: [
          'हरतालिका तीज कथा माता पार्वती के दृढ़ संकल्प से जुड़ी है। वे भगवान शिव को पति रूप में पाने के लिए तप करती हैं। उनके पिता हिमवान उनकी शादी कहीं और करना चाहते हैं, पर पार्वती का मन शिव में स्थिर रहता है।',
          'जब सखी को यह चिंता हुई कि पार्वती का संकल्प टूट जाएगा, वह उन्हें वन में ले गई। इसी से हरित या हर ली गई आलिका, अर्थात सखी द्वारा सुरक्षित स्थान ले जाने का भाव कथा में आता है।',
        ],
        bodyEn: [
          'Hartalika Teej is connected with the firm resolve of Mother Parvati. She performs tapas to receive Lord Shiva as her husband. Her father Himavan considers another marriage arrangement, but Parvati heart remains fixed on Shiva.',
          'When her friend fears that Parvati resolve may be broken, she takes her into the forest. This gives the story its Hartalika mood: the friend leading Parvati away to a protected place where her vow can continue.',
        ],
      },
      {
        id: 'forest-tapas',
        titleHi: 'वन में तप',
        titleEn: 'Austerity in the forest',
        bodyHi: [
          'वन में पार्वती मिट्टी या रेत से शिवलिंग बनाकर पूजा करती हैं। वे जल, पत्ते, मंत्र और मौन से अपना संकल्प रखती हैं। साधन कम हैं, पर निष्ठा पूर्ण है।',
          'कथा में पार्वती का तप केवल विवाह की इच्छा नहीं, आत्म-निष्ठा का उदाहरण है। वे भय, दबाव और सुविधा से ऊपर उठकर अपने सत्य को बचाती हैं।',
        ],
        bodyEn: [
          'In the forest, Parvati forms a Shiva linga from earth or sand and worships. With water, leaves, mantra, and silence, she preserves her vow. Her resources are simple, but her dedication is complete.',
          'Parvati tapas in the story is not merely desire for marriage; it is an example of fidelity to the self. She rises above fear, pressure, and comfort in order to protect her truth.',
        ],
      },
      {
        id: 'shiva-accepts',
        titleHi: 'शिव का स्वीकार',
        titleEn: 'Shiva accepts the devotion',
        bodyHi: [
          'माता पार्वती की तपस्या से शिव प्रसन्न होते हैं। वे उनके सामने प्रकट होकर वर देते हैं कि वे ही उनके पति होंगे। बाद में शिव-पार्वती विवाह दिव्य मिलन का रूप लेता है।',
          'कथा स्त्रियों के सौभाग्य व्रत के रूप में कही जाती है, पर उसका गहरा अर्थ हर साधक के लिए है। जो संकल्प शुद्ध हो और धैर्य से निभाया जाए, वह अंततः फल देता है।',
        ],
        bodyEn: [
          'Shiva is pleased by Parvati austerity and appears before her. He grants the boon that he himself will become her husband. Later, the marriage of Shiva and Parvati becomes the symbol of divine union.',
          'The story is observed as a vow for marital auspiciousness, yet its deeper meaning belongs to every seeker. A pure resolve held with patience eventually bears fruit.',
        ],
      },
      {
        id: 'teej-message',
        titleHi: 'तीज का संदेश',
        titleEn: 'The message of Teej',
        bodyHi: [
          'हरतालिका तीज पर व्रत, कथा, शिव-पार्वती पूजन और सौभाग्य की प्रार्थना की जाती है। कथा में सखी की भूमिका भी महत्वपूर्ण है, क्योंकि सही संगति साधक के संकल्प की रक्षा करती है।',
          'यह व्रत भक्त को बताता है कि प्रेम में धैर्य, आत्म-सम्मान और सत्यनिष्ठा चाहिए। पार्वती का तप संबंध को केवल सामाजिक व्यवस्था नहीं रहने देता; वह उसे आध्यात्मिक संकल्प बना देता है।',
        ],
        bodyEn: [
          'On Hartalika Teej, devotees observe fasting, listen to the katha, worship Shiva-Parvati, and pray for auspicious married life. The role of the friend is also important, because right companionship protects the resolve of the seeker.',
          'The vow teaches that love requires patience, self-respect, and fidelity to truth. Parvati tapas prevents the relationship from being merely social arrangement; it makes it a spiritual resolve.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'maha-shivaratri-vrat-katha',
    titleHi: 'महा शिवरात्रि व्रत कथा',
    titleEn: 'Maha Shivaratri Vrat Katha',
    sections: [
      {
        id: 'endless-linga',
        titleHi: 'अनंत ज्योतिर्लिंग',
        titleEn: 'The endless pillar of light',
        bodyHi: [
          'महा शिवरात्रि की एक कथा में ब्रह्मा और विष्णु के बीच श्रेष्ठता का विवाद उठता है। उसी समय एक अनंत ज्योतिर्लिंग प्रकट होता है, जिसका आदि और अंत कोई नहीं देख पाता।',
          'विष्णु नीचे की ओर और ब्रह्मा ऊपर की ओर खोजते हैं। अंतहीन प्रकाश उन्हें बताता है कि शिव तत्त्व अहंकार की सीमा से परे है। जो उसे मापना चाहता है, वह अपनी सीमित बुद्धि को ही देखता है।',
        ],
        bodyEn: [
          'One Maha Shivaratri legend tells of a dispute between Brahma and Vishnu over greatness. At that moment an endless pillar of light, the jyotirlinga, appears. No beginning or end can be found.',
          'Vishnu searches downward and Brahma upward. The endless radiance reveals that Shiva tattva is beyond the reach of ego. Whoever tries to measure it only discovers the limits of the measuring mind.',
        ],
      },
      {
        id: 'hunter-vigil',
        titleHi: 'व्याध का अनजाना जागरण',
        titleEn: 'The hunter unknowing vigil',
        bodyHi: [
          'एक और प्रिय कथा में एक व्याध रात्रि में वन में फंस जाता है। भय से वह बिल्व वृक्ष पर चढ़कर जागता रहता है। नीचे शिवलिंग होता है और उसके हाथ से गिरते बिल्वपत्र तथा जल अनजाने में शिव पूजन बन जाते हैं।',
          'रातभर जागरण, भूख और शिवलिंग पर गिरती अर्पण-सामग्री से उसका कठोर मन बदलता है। सुबह वह हिंसा छोड़ने की ओर प्रेरित होता है और शिव कृपा पाता है।',
        ],
        bodyEn: [
          'Another beloved story tells of a hunter trapped in the forest at night. Out of fear he climbs a bilva tree and remains awake. A Shiva linga is below, and the bilva leaves and water falling from his hands unknowingly become worship.',
          'Through the night vigil, hunger, and offerings falling upon the linga, his hardened heart changes. By morning he is moved away from violence and receives Shiva grace.',
        ],
      },
      {
        id: 'shiva-parvati',
        titleHi: 'शिव-पार्वती का मंगल',
        titleEn: 'The auspicious union of Shiva and Parvati',
        bodyHi: [
          'कई परंपराओं में महा शिवरात्रि शिव-पार्वती विवाह से भी जुड़ी है। पार्वती का तप और शिव की करुणा मिलकर संसार को संतुलन देते हैं। शिव का वैराग्य और शक्ति का स्नेह गृहस्थ और योग दोनों को पवित्र करते हैं।',
          'इस रात भक्त शिवलिंग अभिषेक, बिल्वपत्र, रुद्र जप और जागरण करते हैं। विवाह और योग, दोनों कथाएं एक ही बात कहती हैं - शिव चेतना से जुड़ने पर जीवन का विष भी साधना में बदल सकता है।',
        ],
        bodyEn: [
          'In many traditions, Maha Shivaratri is also connected with the marriage of Shiva and Parvati. Parvati tapas and Shiva compassion bring balance to the world. Shiva renunciation and Shakti affection sanctify both household life and yogic life.',
          'On this night devotees perform abhisheka, offer bilva leaves, chant Rudra mantras, and keep vigil. The marriage and yogic legends point to the same teaching: when life is joined with Shiva consciousness, even poison can become a path of practice.',
        ],
      },
      {
        id: 'shivaratri-message',
        titleHi: 'जागरण का रहस्य',
        titleEn: 'The secret of wakefulness',
        bodyHi: [
          'महा शिवरात्रि व्रत कथा भक्त को बाहर की रात से भीतर के अंधकार तक ले जाती है। जागरण का अर्थ केवल जागते रहना नहीं, अपनी वासनाओं, भय और अहंकार को पहचानना भी है।',
          'शिव करुणामय हैं; वे अनजाने अर्पण को भी स्वीकार कर लेते हैं यदि मन बदलने को तैयार हो। इसलिए इस व्रत में उपवास, अभिषेक और कथा आत्म-शुद्धि की एक ही साधना बन जाते हैं।',
        ],
        bodyEn: [
          'The Maha Shivaratri katha leads the devotee from the outer night into the inner darkness. Wakefulness means more than staying awake; it means recognizing desire, fear, and ego within oneself.',
          'Shiva is compassionate; he accepts even an unknowing offering when the heart is ready to change. Thus fasting, abhisheka, and katha become one discipline of inner purification.',
        ],
      },
    ],
  }),
  summaryContent({
    id: 'gangaur-vrat-katha',
    titleHi: 'गणगौर व्रत कथा',
    titleEn: 'Gangaur Vrat Katha',
    themeHi: 'गणगौर कथा शिव-पार्वती, सौभाग्य और वसंत-ऋतु की मंगल भावना से जुड़ी है। इसमें गौरी पूजन के माध्यम से गृहस्थ जीवन की समृद्धि और दाम्पत्य मंगल का भाव आता है।',
    themeEn: 'Gangaur katha is associated with Shiva-Parvati, marital auspiciousness, and the renewal of spring. Through worship of Gauri, it expresses prosperity and harmony in household life.',
    practiceHi: 'यह क्षेत्रीय रूप से विशेषकर राजस्थान और आस-पास की परंपराओं में प्रचलित है। ऐप में इसे क्षेत्रीय/उन्नत सामग्री के रूप में रखा गया है।',
    practiceEn: 'This observance is especially prominent in Rajasthan and related regional traditions. The app keeps it as regional/advanced content.',
  }),
  fullContent({
    id: 'rama-navami-vrat-katha',
    titleHi: 'राम नवमी व्रत कथा',
    titleEn: 'Rama Navami Vrat Katha',
    sections: [
      {
        id: 'dasharatha-yajna',
        titleHi: 'दशरथ की प्रार्थना',
        titleEn: 'Dasharatha prayer',
        bodyHi: [
          'अयोध्या के राजा दशरथ धर्मात्मा थे, पर संतान न होने से चिंतित रहते थे। ऋषियों के मार्गदर्शन में पुत्रकामेष्टि यज्ञ हुआ। देव कृपा से प्रसादरूप पायस मिला और रानियों ने उसे श्रद्धा से ग्रहण किया।',
          'समय आने पर चैत्र शुक्ल नवमी को भगवान राम का जन्म हुआ। भरत, लक्ष्मण और शत्रुघ्न भी प्रकट हुए। अयोध्या में मंगल छा गया क्योंकि धर्म, करुणा और मर्यादा ने मनुष्य रूप लिया।',
        ],
        bodyEn: [
          'King Dasharatha of Ayodhya was righteous, yet he was troubled because he had no children. Under the guidance of sages, the Putrakameshti yajna was performed. By divine grace, sacred payasa was received and the queens accepted it with reverence.',
          'In time, on Chaitra Shukla Navami, Lord Rama was born. Bharata, Lakshmana, and Shatrughna also appeared. Auspiciousness filled Ayodhya because dharma, compassion, and restraint had taken human form.',
        ],
      },
      {
        id: 'rama-ideal',
        titleHi: 'मर्यादा का जन्म',
        titleEn: 'The birth of maryada',
        bodyHi: [
          'राम जन्म केवल राजकुमार का जन्म नहीं है। कथा में भगवान विष्णु धरती पर अवतार लेकर अधर्म के भार को हल्का करने आते हैं। वे जीवन भर वचन, न्याय, सेवा और करुणा का आदर्श बनते हैं।',
          'बालक राम के जन्मोत्सव में नगर सजता है, दान होता है और भजन गूंजते हैं। यह उत्सव बताता है कि घर में सद्गुण जन्म लें तो वही सबसे बड़ा मंगल है।',
        ],
        bodyEn: [
          'The birth of Rama is not merely the birth of a prince. In the story, Lord Vishnu incarnates on earth to lighten the burden of adharma. Throughout his life Rama becomes the ideal of promise, justice, service, and compassion.',
          'At the celebration of the child Rama, the city is decorated, charity is given, and songs are sung. The festival teaches that when noble qualities are born in a home, that is the greatest auspiciousness.',
        ],
      },
      {
        id: 'navami-worship',
        titleHi: 'नवमी का पूजन',
        titleEn: 'Worship on Navami',
        bodyHi: [
          'राम नवमी पर भक्त राम जन्म का स्मरण करते हैं, पाठ, भजन, व्रत और दान करते हैं। कुछ स्थानों पर मध्याह्न जन्म आरती विशेष रूप से होती है, क्योंकि नवमी का जन्मकाल रामावतार की स्मृति है।',
          'भक्त राम नाम जपते हुए अपने जीवन में मर्यादा लाने का संकल्प करता है। राम का स्मरण केवल विजय की कथा नहीं, बल्कि वाणी, संबंध और निर्णय में धर्म रखने का अभ्यास है।',
        ],
        bodyEn: [
          'On Rama Navami, devotees remember Rama birth through recitation, bhajan, fasting, and charity. In many places the midday birth arati is especially important, recalling the sacred moment of the avatara.',
          'While chanting Rama nama, the devotee resolves to bring maryada into life. Remembrance of Rama is not only a victory story; it is a practice of keeping dharma in speech, relationships, and decisions.',
        ],
      },
      {
        id: 'rama-message',
        titleHi: 'राम कथा का संदेश',
        titleEn: 'The message of Rama birth',
        bodyHi: [
          'राम नवमी व्रत कथा कहती है कि धर्म का जन्म पहले हृदय में होता है, फिर कर्म में दिखाई देता है। दशरथ की प्रार्थना, यज्ञ का प्रसाद और राम का अवतार सब श्रद्धा और उत्तरदायित्व से जुड़े हैं।',
          'इस दिन भक्त भगवान से शक्ति मांगता है कि वह सुख में विनम्र, कठिनाई में धैर्यवान और संबंधों में सत्य रहे। यही राम जन्म को अपने जीवन में उतारना है।',
        ],
        bodyEn: [
          'The Rama Navami katha says that dharma is born first in the heart and then becomes visible in action. Dasharatha prayer, the yajna prasada, and Rama avatara are all joined with faith and responsibility.',
          'On this day the devotee asks for the strength to be humble in happiness, patient in difficulty, and truthful in relationships. That is how the birth of Rama is brought into one own life.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'sita-navami-vrat-katha',
    titleHi: 'सीता नवमी व्रत कथा',
    titleEn: 'Sita Navami Vrat Katha',
    sections: [
      {
        id: 'janaka-field',
        titleHi: 'जनक के हल की रेखा',
        titleEn: 'The furrow of Janaka plough',
        bodyHi: [
          'सीता नवमी कथा मिथिला के राजा जनक से जुड़ी है। एक यज्ञभूमि की तैयारी में वे स्वयं हल चला रहे थे। हल की रेखा से एक दिव्य कन्या प्रकट हुई। जनक ने उसे ईश्वर की देन मानकर पुत्री रूप में अपनाया।',
          'कन्या का नाम सीता रखा गया, क्योंकि वह सीता, अर्थात हल की रेखा, से मिली थीं। कथा धरती, मातृत्व और दिव्य कृपा को एक साथ जोड़ती है। सीता का जन्म प्रकृति की पवित्रता का स्मरण कराता है।',
        ],
        bodyEn: [
          'The Sita Navami story is connected with King Janaka of Mithila. While preparing the sacrificial ground, he himself was ploughing the field. From the furrow appeared a divine girl. Janaka accepted her as a gift of God and raised her as his daughter.',
          'She was named Sita because she was found in the sita, the furrow made by the plough. The story joins earth, motherhood, and divine grace. Sita birth reminds devotees of the sacredness of nature.',
        ],
      },
      {
        id: 'sita-qualities',
        titleHi: 'सीता का तेज',
        titleEn: 'The radiance of Sita',
        bodyHi: [
          'बाल्यकाल से सीता में करुणा, धैर्य और अद्भुत शक्ति दिखाई देती है। वे कोमल भी हैं और दृढ़ भी। बाद में राम के साथ उनका जीवन त्याग, मर्यादा और आत्मगौरव का आदर्श बनता है।',
          'सीता नवमी केवल जन्मोत्सव नहीं, स्त्री-शक्ति और धरती की सहनशीलता का सम्मान है। कथा भक्त को सिखाती है कि धैर्य कमजोरी नहीं, भीतर की अटल शक्ति हो सकता है।',
        ],
        bodyEn: [
          'From childhood, Sita shows compassion, patience, and extraordinary strength. She is gentle and firm at the same time. Later, her life with Rama becomes an ideal of sacrifice, restraint, and self-respect.',
          'Sita Navami is not only a birth celebration; it honors feminine strength and the endurance of the earth. The katha teaches that patience is not weakness; it can be deep inner power.',
        ],
      },
      {
        id: 'sita-ram',
        titleHi: 'सीता-राम स्मरण',
        titleEn: 'Remembering Sita-Rama',
        bodyHi: [
          'इस दिन भक्त सीता-राम का पूजन करते हैं, कथा सुनते हैं और परिवार में करुणा तथा मर्यादा की प्रार्थना करते हैं। सीता के बिना राम कथा अधूरी है, क्योंकि धर्म करुणा के बिना कठोर हो सकता है।',
          'सीता स्मरण मनुष्य को संबंधों में सम्मान, भाषा में कोमलता और कठिन समय में आत्मबल देता है। वे धरती से प्रकट हुईं, इसलिए उनका जीवन पोषण और सहनशीलता की शिक्षा देता है।',
        ],
        bodyEn: [
          'On this day devotees worship Sita-Rama, listen to the katha, and pray for compassion and restraint in the family. The Rama story is incomplete without Sita, because dharma without compassion can become harsh.',
          'Remembering Sita gives respect in relationships, gentleness in speech, and inner strength in difficult times. Because she appeared from the earth, her life teaches nourishment and endurance.',
        ],
      },
      {
        id: 'sita-message',
        titleHi: 'धरती और करुणा का संदेश',
        titleEn: 'The message of earth and compassion',
        bodyHi: [
          'सीता नवमी व्रत कथा भक्त को प्रकृति के प्रति आदर और स्त्री-शक्ति के प्रति श्रद्धा सिखाती है। जनक ने दिव्य कन्या को पाया, पर उसे अधिकार नहीं, आशीर्वाद समझा।',
          'इस कथा का भाव है कि जीवन में पवित्रता, धैर्य और करुणा को जगह दें। सीता की तरह शक्ति को कोमलता से और कोमलता को आत्मसम्मान से जोड़ना ही व्रत का सुंदर संदेश है।',
        ],
        bodyEn: [
          'The Sita Navami katha teaches reverence for nature and respect for feminine strength. Janaka found the divine child but treated her not as possession, but as blessing.',
          'The story asks the devotee to make room for purity, patience, and compassion. To join strength with gentleness and gentleness with self-respect, as Sita does, is the beautiful message of the vow.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'hanuman-jayanti-vrat-katha',
    titleHi: 'हनुमान जयंती व्रत कथा',
    titleEn: 'Hanuman Jayanti Vrat Katha',
    sections: [
      {
        id: 'anjana-boon',
        titleHi: 'अंजना की तपस्या',
        titleEn: 'Anjana austerity',
        bodyHi: [
          'हनुमान जयंती कथा माता अंजना और केसरी से जुड़ी है। अंजना ने पुत्र प्राप्ति के लिए तप किया। वायु देव की कृपा और शिव अंश की महिमा से एक तेजस्वी बालक प्रकट हुआ, जिसे आगे चलकर हनुमान कहा गया।',
          'बालक में अद्भुत बल, गति और उत्साह था। सूर्य को फल समझकर पकड़ने की कथा उसकी बाल-लीला और असाधारण ऊर्जा को दिखाती है। देवताओं ने उसे अनेक वरदान दिए, पर साथ ही उसकी शक्ति को सही समय पर जागने का संस्कार मिला।',
        ],
        bodyEn: [
          'The Hanuman Jayanti story is connected with Mother Anjana and Kesari. Anjana performed austerity for a child. Through the grace of Vayu and the glory of Shiva amsha, a radiant child appeared, later known as Hanuman.',
          'The child possessed extraordinary strength, speed, and enthusiasm. The story of his attempt to grasp the sun as a fruit shows his childhood play and immense energy. The devas blessed him with many boons, while his power was also shaped to awaken at the right time.',
        ],
      },
      {
        id: 'student-of-surya',
        titleHi: 'सूर्य से शिक्षा',
        titleEn: 'Learning from Surya',
        bodyHi: [
          'हनुमान ने सूर्य देव को गुरु मानकर ज्ञान प्राप्त किया। गति में चल रहे सूर्य के साथ चलते हुए पढ़ना उनके परिश्रम और एकाग्रता का प्रतीक है। बल के साथ विद्या जुड़ती है तो सेवा का मार्ग खुलता है।',
          'कथा में हनुमान केवल पराक्रमी नहीं, विनम्र विद्यार्थी भी हैं। वे सीखते हैं, स्मरण रखते हैं और अपनी क्षमता को प्रभु कार्य के लिए तैयार करते हैं।',
        ],
        bodyEn: [
          'Hanuman accepted Surya Deva as his guru and received knowledge. Learning while moving with the sun symbolizes effort and concentration. When strength is joined with learning, the path of service opens.',
          'In the story, Hanuman is not only mighty; he is also a humble student. He learns, remembers, and prepares his abilities for the work of the Lord.',
        ],
      },
      {
        id: 'rama-service',
        titleHi: 'राम सेवा का जीवन',
        titleEn: 'A life of service to Rama',
        bodyHi: [
          'राम कथा में हनुमान की महिमा पूर्ण रूप से प्रकट होती है। वे सीता की खोज करते हैं, समुद्र लांघते हैं, लंका में प्रभु का संदेश देते हैं और संजीवनी लाकर लक्ष्मण की रक्षा करते हैं।',
          'उनकी हर शक्ति भक्ति से नियंत्रित है। वे विजय का श्रेय स्वयं नहीं लेते। उनका आदर्श है - बुद्धि, बल और विद्या सब राम कार्य में अर्पित हों।',
        ],
        bodyEn: [
          'Hanuman glory becomes fully visible in the Rama story. He searches for Sita, crosses the ocean, carries the message of Rama into Lanka, and brings Sanjivani to protect Lakshmana.',
          'Every power in him is governed by devotion. He does not claim victory for himself. His ideal is that intelligence, strength, and learning should all be offered to the work of Rama.',
        ],
      },
      {
        id: 'hanuman-message',
        titleHi: 'भक्ति में बल',
        titleEn: 'Strength through devotion',
        bodyHi: [
          'हनुमान जयंती पर भक्त व्रत, पाठ, चालीसा, सुंदरकांड और सेवा का संकल्प करते हैं। कथा बताती है कि बल तभी मंगलकारी है जब वह विनम्रता, गुरु-भक्ति और ईश्वर-सेवा से जुड़ा हो।',
          'हनुमान का स्मरण भय हटाता है क्योंकि वह मन को कहता है कि अपनी शक्ति को पहचानो, पर उसे अहंकार में नहीं, सेवा में लगाओ। यही हनुमान जयंती का मूल संदेश है।',
        ],
        bodyEn: [
          'On Hanuman Jayanti, devotees observe fasting, recitation, Chalisa, Sundarkand, and acts of service. The katha teaches that strength becomes auspicious only when joined with humility, reverence for the guru, and service to God.',
          'Remembering Hanuman removes fear because it tells the mind to recognize its strength, yet use it not for pride but for service. This is the central message of Hanuman Jayanti.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'akshaya-tritiya-vrat-katha',
    titleHi: 'अक्षय तृतीया व्रत कथा',
    titleEn: 'Akshaya Tritiya Vrat Katha',
    sections: [
      {
        id: 'inexhaustible-merit',
        titleHi: 'अक्षय पुण्य की तिथि',
        titleEn: 'The day of inexhaustible merit',
        bodyHi: [
          'अक्षय तृतीया को ऐसा दिन माना गया है जब शुभ कर्म का फल अक्षय, अर्थात क्षय न होने वाला, कहा जाता है। कथा-परंपरा में दान, जप, स्नान, अन्नदान और विष्णु-लक्ष्मी स्मरण को विशेष महत्व दिया गया है।',
          'इस दिन की कथाएं बताती हैं कि थोड़ा सा सत्कर्म भी यदि निष्काम भाव से किया जाए तो उसका संस्कार लंबे समय तक जीवन को दिशा देता है। अक्षयता धन के ढेर में नहीं, सत्कर्म की निरंतरता में है।',
        ],
        bodyEn: [
          'Akshaya Tritiya is regarded as a day when the fruit of auspicious action becomes akshaya, inexhaustible. The story tradition gives special importance to charity, japa, sacred bathing, food donation, and remembrance of Vishnu and Lakshmi.',
          'The legends of this day teach that even a small good act, when done without selfishness, can leave a lasting impression that guides life. Inexhaustibility is not in piles of wealth; it is in the continuity of righteous action.',
        ],
      },
      {
        id: 'poor-household',
        titleHi: 'गरीब गृहस्थ का दान',
        titleEn: 'The charity of a poor household',
        bodyHi: [
          'एक कथा में निर्धन गृहस्थ अक्षय तृतीया पर जल, अन्न और श्रद्धा से दान करता है। उसके पास देने को बहुत नहीं होता, पर वह अतिथि और जरूरतमंद को खाली नहीं लौटाता।',
          'समय के साथ उसके जीवन में स्थिरता आती है। कथा का आशय यह नहीं कि दान व्यापार है; यह बताती है कि करुणा से दिया गया अन्न मनुष्य के भीतर अभाव का भय कम करता है और लक्ष्मी को धर्म से जोड़ता है।',
        ],
        bodyEn: [
          'One story tells of a poor householder who gives water, food, and sincere charity on Akshaya Tritiya. He does not have much to offer, yet he does not send a guest or needy person away empty-handed.',
          'Over time, stability comes into his life. The meaning is not that charity is a transaction; it shows that food given with compassion reduces the fear of scarcity within and joins Lakshmi with dharma.',
        ],
      },
      {
        id: 'sacred-beginnings',
        titleHi: 'पवित्र आरंभ',
        titleEn: 'Sacred beginnings',
        bodyHi: [
          'अक्षय तृतीया कई पवित्र स्मृतियों से जुड़ी है - भगवान परशुराम जयंती, गंगा अवतरण की परंपरा, अन्न और जल दान, तथा शुभ आरंभ। इस कारण लोग नए काम, अध्ययन और दान का संकल्प लेते हैं।',
          'कथा भक्त को सावधान करती है कि नया आरंभ केवल बाहरी खरीदारी न रह जाए। यदि आरंभ सत्य, परिश्रम और सेवा से जुड़ा हो, तभी वह अक्षय पुण्य बनता है।',
        ],
        bodyEn: [
          'Akshaya Tritiya is connected with several sacred memories: Parashurama Jayanti, traditions of Ganga descent, gifts of food and water, and auspicious beginnings. People therefore begin new work, study, and charity on this day.',
          'The katha cautions the devotee not to reduce a new beginning to external purchase alone. When the beginning is joined with truth, effort, and service, it becomes inexhaustible merit.',
        ],
      },
      {
        id: 'akshaya-message',
        titleHi: 'कभी न घटने वाला धर्म',
        titleEn: 'Dharma that does not diminish',
        bodyHi: [
          'अक्षय तृतीया व्रत कथा का संदेश है कि जो धन बांटने से, जो ज्ञान सीखने से, और जो भक्ति करने से बढ़े, वही अक्षय है। लोभ से पकड़ा हुआ धन घटता है, पर धर्म से लगाया धन मंगल बनता है।',
          'इस दिन भक्त जल, अन्न, वस्त्र, जप और पूजा से जीवन में उदारता का बीज बोता है। वह भगवान से प्रार्थना करता है कि उसके कर्म का शुभ संस्कार कभी कम न हो।',
        ],
        bodyEn: [
          'The message of Akshaya Tritiya is that wealth which grows by sharing, knowledge which grows by learning, and devotion which grows by practice are truly inexhaustible. Wealth clutched by greed diminishes, but wealth used in dharma becomes auspicious.',
          'On this day the devotee plants a seed of generosity through water, food, clothing, japa, and worship. He or she prays that the noble impression of good action may never diminish.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'vat-savitri-vrat-katha',
    titleHi: 'वट सावित्री व्रत कथा',
    titleEn: 'Vat Savitri Vrat Katha',
    sections: [
      {
        id: 'savitri-chooses',
        titleHi: 'सावित्री का चयन',
        titleEn: 'Savitri chooses Satyavan',
        bodyHi: [
          'वट सावित्री कथा राजा अश्वपति की पुत्री सावित्री से जुड़ी है। सावित्री तेजस्विनी और धैर्यवान थीं। उन्होंने वनवासी, सत्यप्रिय और धर्मात्मा सत्यवान को पति रूप में चुना, भले ही ऋषियों ने बताया कि उसकी आयु अल्प है।',
          'सावित्री ने भय के कारण अपने सत्य से मुंह नहीं मोड़ा। उन्होंने विवाह किया और ससुराल में सेवा, विनम्रता और दृढ़ता से जीवन बिताया। कथा की शुरुआत ही उनके संकल्प की गहराई दिखाती है।',
        ],
        bodyEn: [
          'The Vat Savitri story centers on Savitri, daughter of King Ashwapati. She was radiant, patient, and wise. She chose Satyavan, a truthful and righteous forest-dweller, as her husband, even though sages revealed that his lifespan was short.',
          'Savitri did not turn away from her truth out of fear. She married Satyavan and lived with service, humility, and firmness in her new home. The beginning of the story already shows the depth of her resolve.',
        ],
      },
      {
        id: 'under-banyan',
        titleHi: 'वट वृक्ष के नीचे',
        titleEn: 'Under the banyan tree',
        bodyHi: [
          'नियत दिन सावित्री उपवास और जागरूकता के साथ सत्यवान के साथ वन गईं। लकड़ी काटते समय सत्यवान को पीड़ा हुई और उन्होंने सावित्री की गोद में सिर रखा। यमराज उसके प्राण लेकर चल पड़े।',
          'सावित्री ने यमराज का पीछा किया। वे रोती हुई असहाय नहीं चलीं; वे धर्म, विनम्रता और तर्क के साथ चलती रहीं। यमराज ने उन्हें लौटने को कहा, पर उनकी वाणी में पतिव्रता का तेज और बुद्धि थी।',
        ],
        bodyEn: [
          'On the destined day, Savitri went to the forest with Satyavan while fasting and remaining alert. As he cut wood, Satyavan felt pain and placed his head in her lap. Yama came and carried away his life force.',
          'Savitri followed Yama. She did not walk as helpless grief alone; she walked with dharma, humility, and reason. Yama asked her to return, but her words carried the radiance and intelligence of steadfast devotion.',
        ],
      },
      {
        id: 'boons',
        titleHi: 'यमराज से वरदान',
        titleEn: 'Boons from Yama',
        bodyHi: [
          'यमराज सावित्री की धर्मयुक्त वाणी से प्रसन्न हुए और वरदान देने लगे। सावित्री ने पहले ससुर के नेत्र और राज्य, फिर पिता के वंश का मंगल मांगा। अंत में उन्होंने सत्यवान से संतान का वर मांगा।',
          'यमराज ने वचन दिया और समझ गए कि सत्यवान के बिना यह वर पूर्ण नहीं हो सकता। उन्होंने सत्यवान के प्राण लौटा दिए। सावित्री अपने पति को जीवित लेकर लौटीं और परिवार में सुख आया।',
        ],
        bodyEn: [
          'Yama was pleased by Savitri dharmic speech and began granting boons. She first asked for her father-in-law sight and kingdom, then for the wellbeing of her father lineage. Finally she asked for children through Satyavan.',
          'Yama granted the boon and realized that it could not be fulfilled without Satyavan life. He returned Satyavan life force. Savitri came back with her husband alive, and joy returned to the family.',
        ],
      },
      {
        id: 'vat-message',
        titleHi: 'वट सावित्री का संदेश',
        titleEn: 'The message of Vat Savitri',
        bodyHi: [
          'वट वृक्ष दीर्घायु, स्थिरता और छाया का प्रतीक है। वट सावित्री व्रत में स्त्रियां वट की परिक्रमा, पूजन और कथा से दाम्पत्य मंगल तथा परिवार की रक्षा की प्रार्थना करती हैं।',
          'कथा का गहरा संदेश यह है कि प्रेम में बुद्धि, धैर्य और धर्मयुक्त वाणी का बल होना चाहिए। सावित्री ने मृत्यु से युद्ध क्रोध से नहीं, सत्य और संयम से किया।',
        ],
        bodyEn: [
          'The banyan tree symbolizes long life, stability, and shelter. In Vat Savitri Vrat, women worship and circumambulate the banyan and listen to the katha, praying for marital auspiciousness and family protection.',
          'The deeper message is that love should carry intelligence, patience, and dharmic speech. Savitri did not confront death with anger; she did so with truth and restraint.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'mangala-gauri-vrat-katha',
    titleHi: 'मंगला गौरी व्रत कथा',
    titleEn: 'Mangala Gauri Vrat Katha',
    sections: [
      {
        id: 'merchant-son',
        titleHi: 'अल्पायु पुत्र की चिंता',
        titleEn: 'Concern for a short-lived son',
        bodyHi: [
          'मंगला गौरी व्रत कथा में एक गृहस्थ दंपति संतान के लिए प्रार्थना करते हैं। उन्हें पुत्र मिलता है, पर यह संकेत भी मिलता है कि उसका जीवन संकट से घिर सकता है। माता-पिता चिंता में रहते हैं।',
          'समय आने पर पुत्र का विवाह एक ऐसी कन्या से होता है जो मां गौरी में गहरी श्रद्धा रखती है। श्रावण के मंगलवारों में वह मंगला गौरी व्रत करती है और पति की रक्षा तथा गृहस्थ मंगल की प्रार्थना करती है।',
        ],
        bodyEn: [
          'In the Mangala Gauri Vrat story, a householder couple prays for a child. They receive a son, but also hear that his life may be surrounded by danger. The parents live with concern.',
          'In time, the son marries a young woman deeply devoted to Maa Gauri. On the Tuesdays of Shravana she observes the Mangala Gauri vow, praying for her husband protection and the auspiciousness of household life.',
        ],
      },
      {
        id: 'serpent-danger',
        titleHi: 'सर्प का संकट',
        titleEn: 'The danger of the serpent',
        bodyHi: [
          'एक रात पति के जीवन पर सर्प का संकट आता है। व्रतवती स्त्री जागरूक रहती है, मां गौरी का स्मरण करती है और बुद्धि से परिस्थिति संभालती है। कुछ कथाओं में सर्प बर्तन या कलश में बंद हो जाता है और संकट टल जाता है।',
          'सुबह परिवार देखता है कि श्रद्धा, जागरण और गौरी कृपा से बड़ा अनिष्ट टल गया। कथा स्त्री की भक्ति को निष्क्रिय नहीं दिखाती; वह सजग, साहसी और बुद्धिमती भी है।',
        ],
        bodyEn: [
          'One night a serpent threatens the husband life. The fasting wife remains alert, remembers Maa Gauri, and handles the situation with intelligence. In some tellings the serpent is trapped in a vessel or pot, and the danger passes.',
          'By morning the family sees that a grave misfortune has been avoided through devotion, wakefulness, and Gauri grace. The story does not present the woman devotion as passive; she is alert, courageous, and wise.',
        ],
      },
      {
        id: 'gauri-blessing',
        titleHi: 'गौरी का आशीर्वाद',
        titleEn: 'The blessing of Gauri',
        bodyHi: [
          'मां मंगला गौरी की कृपा से पति की आयु और परिवार का सौभाग्य सुरक्षित होता है। व्रत में दीप, फूल, कथा, सुहाग सामग्री और मंगल गीतों का भाव इसी कृपा को आमंत्रित करता है।',
          'श्रावण का महीना शिव-पार्वती स्मरण का समय है। मंगला गौरी व्रत उस स्मरण को गृहस्थ जीवन की रक्षा, प्रेम और समृद्धि से जोड़ता है।',
        ],
        bodyEn: [
          'By the grace of Maa Mangala Gauri, the husband lifespan and the family auspiciousness are protected. Lamps, flowers, katha, symbols of married life, and auspicious songs invite that blessing.',
          'The month of Shravana is a time for remembering Shiva and Parvati. Mangala Gauri Vrat connects that remembrance with protection, affection, and prosperity in household life.',
        ],
      },
      {
        id: 'mangala-message',
        titleHi: 'मंगल की साधना',
        titleEn: 'A practice of auspiciousness',
        bodyHi: [
          'मंगला गौरी कथा भक्त को बताती है कि सौभाग्य केवल बाहरी चिह्नों में नहीं, जागरूक प्रेम, संयम और पूजा में है। व्रत में स्त्री अपने परिवार के लिए प्रार्थना करती है, पर साथ ही अपने धैर्य और बुद्धि को भी जगाती है।',
          'इस कथा का संदेश है कि संकट को केवल भय से नहीं, श्रद्धा और विवेक से संभालना चाहिए। गौरी स्मरण गृहस्थ जीवन को सौम्यता और शक्ति दोनों देता है।',
        ],
        bodyEn: [
          'The Mangala Gauri katha teaches that auspicious married life is not only in external symbols; it is in alert love, restraint, and worship. Through the vow, a woman prays for her family while awakening her own patience and wisdom.',
          'The message is that danger should not be met only with fear, but with devotion and discernment. Remembrance of Gauri gives household life both gentleness and strength.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'nag-panchami-vrat-katha',
    titleHi: 'नाग पंचमी व्रत कथा',
    titleEn: 'Nag Panchami Vrat Katha',
    sections: [
      {
        id: 'plough-and-the-nest',
        titleHi: 'हल और नाग का बिल',
        titleEn: 'The plough and the serpent nest',
        bodyHi: [
          'श्रावण की भोर थी। एक किसान अपने खेत में हल चला रहा था, मिट्टी पलट रहा था ताकि वर्षा का जल भूमि में बैठ जाए। उसके तीन पुत्र और तीनों की पत्नियां घर में काम संभालती थीं। सबसे छोटी बहू का नाम सुशीला था, जो स्वभाव से कोमल और श्रद्धालु थी।',
          'हल की नोक खेत के एक कोने में बने नाग के बिल से टकरा गई। उसी क्षण बिल में सोए नागिन के तीन नवजात बच्चे हल की धार से कट गए और वहीं प्राण त्याग बैठे। किसान को इसका भान तक न हुआ; वह काम पूरा कर घर लौट गया।',
          'संध्या समय नागिन भोजन लेकर बिल पर लौटी। बिल उजड़ा पड़ा था और उसके बच्चे रक्त में सने निर्जीव थे। शोक से उसका हृदय फट उठा और वह फुफकार उठी, "जिसने मेरे बच्चों को मारा, उसका वंश मैं इसी रात समाप्त कर दूंगी।"',
        ],
        bodyEn: [
          'It was a Shravana dawn. A farmer was driving his plough across his field, turning the soil so the rain might soak into the earth. His three sons and their three wives kept the work of the house. The youngest daughter-in-law was named Sushila, gentle of nature and devout of heart.',
          'The tip of the plough struck a serpent burrow in one corner of the field. In that very instant the three newborn young of a serpent mother, asleep within, were cut by the blade and gave up their lives there. The farmer did not even notice; he finished his work and returned home.',
          'At dusk the Nagini returned to the burrow carrying food. The nest lay broken, and her young lay lifeless, smeared with blood. Her heart split with grief, and she hissed aloud, "Whoever has slain my children, this very night I shall end his entire line."',
        ],
      },
      {
        id: 'revenge-in-the-night',
        titleHi: 'रात का प्रतिशोध',
        titleEn: 'Revenge in the night',
        bodyHi: [
          'गहरी रात में नागिन किसान के घर की ओर बढ़ी। एक-एक कक्ष में जाकर उसने किसान, उसकी पत्नी और बड़े दो पुत्रों तथा उनकी पत्नियों को अपने विष से डस लिया। घर शोक और मृत्यु के सन्नाटे में डूब गया।',
          'अब केवल सबसे छोटा पुत्र और सुशीला शेष थे। नागिन उनके कक्ष की ओर बढ़ी, पर वहां का दृश्य देख ठिठक गई। उस रात नाग पंचमी का पर्व था, और सुशीला ने एक मिट्टी के पात्र में दूध भरकर, हल्दी और फूल सजाकर नाग देवता के पूजन की तैयारी कर रखी थी।',
          'सुशीला जाग रही थी। जब उसने द्वार पर नागिन को देखा, तो वह भयभीत होकर भागी नहीं। उसने हाथ जोड़कर श्रद्धा से दूध का पात्र उसके सामने रखा और कोमल स्वर में कहा, "हे नागदेवी, आज पंचमी का शुभ दिन है। यह दूध स्वीकार कीजिए। मेरे घर में जो भूल हुई हो, उसे क्षमा कीजिए।"',
        ],
        bodyEn: [
          'In the deep of night the Nagini moved toward the farmer house. Going from room to room, she struck the farmer, his wife, and the two elder sons with their wives, with her venom. The house sank into the silence of grief and death.',
          'Now only the youngest son and Sushila remained. The Nagini advanced toward their chamber, but at the sight within she paused. That night was the festival of Nag Panchami, and Sushila had prepared for the worship of the serpent deity, filling an earthen vessel with milk and arranging turmeric and flowers.',
          'Sushila was awake. When she saw the serpent at her door, she did not flee in terror. She joined her palms in reverence, set the vessel of milk before the Nagini, and said in a gentle voice, "O Naga Devi, today is the blessed day of Panchami. Accept this milk. Whatever fault has been committed in my house, I beg you to forgive it."',
        ],
      },
      {
        id: 'forgiveness-and-boon',
        titleHi: 'क्षमा और वरदान',
        titleEn: 'Forgiveness and the boon',
        bodyHi: [
          'सुशीला की निश्छल भक्ति और विनम्र वाणी से नागिन का क्रोध शांत होने लगा। उसने दूध ग्रहण किया और बोली, "बेटी, तेरी श्रद्धा सच्ची है। तूने मुझे पूज्य माना, इसलिए मैं प्रसन्न हूं। मांग, जो तेरा मन चाहे।"',
          'सुशीला ने आंखों में आंसू भरकर कहा, "हे माता, मुझे अपने लिए कुछ नहीं चाहिए। मेरे घर के जो प्राणी आपके क्रोध से मारे गए हैं, उन्हें पुनः जीवन दे दीजिए। मेरी यही एकमात्र विनती है।" नागिन उसकी निःस्वार्थ करुणा से अभिभूत हो गई।',
          'नागिन ने अपने विष को सोख लिया और अमृत-तुल्य दृष्टि से सारे घर पर कृपा बरसाई। किसान, उसकी पत्नी, दोनों पुत्र और उनकी पत्नियां मानो गहरी निद्रा से जाग उठे, जीवित और स्वस्थ। नागिन ने आशीर्वाद दिया, "इस कुल को सर्पभय कभी नहीं सताएगा। तेरे घर में संतान, धन और कल्याण सदा बना रहेगा।"',
        ],
        bodyEn: [
          'At Sushila pure devotion and humble words, the Nagini wrath began to cool. She accepted the milk and said, "Daughter, your reverence is true. You have honoured me as worthy of worship, and so I am pleased. Ask whatever your heart desires."',
          'With tears filling her eyes, Sushila said, "O Mother, I want nothing for myself. The members of my household who were slain by your anger, give them back their lives. This is my one and only plea." The Nagini was overcome by her selfless compassion.',
          'The Nagini drew back her venom and poured her grace, like nectar, over the whole house. The farmer, his wife, the two sons, and their wives rose as if from deep sleep, alive and whole. The Nagini blessed them, "Fear of serpents shall never trouble this family. In your home, children, wealth, and welfare shall always abide."',
        ],
      },
      {
        id: 'the-vow-endures',
        titleHi: 'व्रत की परंपरा',
        titleEn: 'The vow that endures',
        bodyHi: [
          'प्रातःकाल सारा परिवार सुशीला के चरणों में नतमस्तक हो गया। जिसने उन्हें मृत्यु से लौटाया, वह उनकी अपनी छोटी बहू की श्रद्धा थी। उस दिन से उस घर में और फिर समस्त गांव में नाग पंचमी का व्रत और नाग देवता का पूजन परम भक्ति से होने लगा।',
          'तब से प्रत्येक श्रावण शुक्ल पंचमी को घर-घर में नाग देवता को दूध, लावा, दूर्वा और फूल अर्पित किए जाते हैं। इस दिन भूमि न खोदने और किसी सर्प को हानि न पहुंचाने का भाव रखा जाता है, जैसे सुशीला ने भय को श्रद्धा में बदला था।',
          'कहते हैं कि जो भक्त इस दिन सुशीला की भांति श्रद्धा और करुणा से नाग देवता का पूजन करता है, उसके कुल से सर्प का भय सदा के लिए दूर हो जाता है। उसके घर में संतान सुरक्षित रहती है, धन-धान्य बढ़ता है और कल्याण की वर्षा होती है।',
        ],
        bodyEn: [
          'In the morning the whole family bowed at Sushila feet. The one who had brought them back from death was the devotion of their own youngest daughter-in-law. From that day, in that home and then across the whole village, the vow of Nag Panchami and the worship of the serpent deity were observed with deep devotion.',
          'Since then, on every fifth bright day of Shravana, milk, parched grain, durva grass, and flowers are offered to the serpent deities in every household. On this day people keep the resolve not to dig the earth and not to harm any serpent, just as Sushila turned fear into reverence.',
          'It is said that the devotee who worships the serpent deities on this day with reverence and compassion, as Sushila did, has the fear of serpents removed from the family forever. In such a home the children remain protected, grain and wealth increase, and welfare rains down.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'varalakshmi-vrat-katha',
    titleHi: 'वरलक्ष्मी व्रत कथा',
    titleEn: 'Varalakshmi Vrat Katha',
    sections: [
      {
        id: 'charumati-dream',
        titleHi: 'चारुमती को स्वप्न',
        titleEn: 'Charumati receives a dream',
        bodyHi: [
          'वरलक्ष्मी व्रत कथा में चारुमती नाम की सदाचारी स्त्री का वर्णन है। वह परिवार की सेवा, सत्य और विनम्रता से जीवन बिताती थी। एक रात मां लक्ष्मी ने स्वप्न में प्रकट होकर उसे वरलक्ष्मी व्रत करने को कहा।',
          'देवी ने बताया कि श्रावण के शुभ शुक्रवार को श्रद्धा से पूजन करने पर परिवार में मंगल, आरोग्य, धान्य और सद्भाव बढ़ेगा। चारुमती ने स्वप्न को लोभ नहीं, आशीर्वाद और जिम्मेदारी की तरह ग्रहण किया।',
        ],
        bodyEn: [
          'The Varalakshmi Vrat story describes a virtuous woman named Charumati. She lived with service to her family, truthfulness, and humility. One night Maa Lakshmi appeared in her dream and instructed her to observe the Varalakshmi vow.',
          'The Goddess explained that worship on the auspicious Friday of Shravana would increase wellbeing, grain, harmony, and prosperity in the household. Charumati received the dream not as greed, but as blessing and responsibility.',
        ],
      },
      {
        id: 'women-gather',
        titleHi: 'साथ मिलकर पूजन',
        titleEn: 'Women gather for worship',
        bodyHi: [
          'चारुमती ने पड़ोस की स्त्रियों को बुलाया। सबने कलश, धागा, फूल, नैवेद्य और लक्ष्मी नाम से पूजन किया। पूजा में सामूहिक श्रद्धा थी; किसी ने अपने सुख के लिए, किसी ने परिवार के स्वास्थ्य के लिए, और किसी ने मन की शांति के लिए प्रार्थना की।',
          'कथा में वरलक्ष्मी केवल व्यक्तिगत संपत्ति की देवी नहीं, साझा मंगल की देवी हैं। स्त्रियां एक-दूसरे को व्रत विधि बताती हैं और प्रसाद बांटती हैं।',
        ],
        bodyEn: [
          'Charumati invited the women of the neighborhood. Together they worshipped with kalasha, sacred thread, flowers, offerings, and the names of Lakshmi. The worship carried shared devotion: some prayed for happiness, some for family health, and some for peace of mind.',
          'In the story, Varalakshmi is not only the giver of private wealth; she is the Goddess of shared auspiciousness. The women teach one another the method of the vow and distribute prasada.',
        ],
      },
      {
        id: 'lakshmi-blessing',
        titleHi: 'लक्ष्मी का वरदान',
        titleEn: 'The blessing of Lakshmi',
        bodyHi: [
          'पूजा के बाद घरों में प्रसन्नता और समृद्धि आती है। पर कथा यह भी बताती है कि लक्ष्मी वहीं स्थिर होती हैं जहां स्वच्छता, सदाचार, दान और विनम्रता बनी रहे। केवल आभूषण से लक्ष्मी नहीं रुकतीं।',
          'चारुमती का जीवन पहले से ही धर्मपूर्ण था, इसलिए व्रत ने उसके सद्गुणों को फलित किया। कथा में पूजन और आचरण दोनों एक दूसरे को पूर्ण करते हैं।',
        ],
        bodyEn: [
          'After the worship, joy and prosperity come into the homes. Yet the story also teaches that Lakshmi remains where cleanliness, good conduct, charity, and humility are preserved. Ornament alone does not hold Lakshmi.',
          'Charumati life was already dharmic, so the vow gave fruit to her virtues. In the katha, worship and conduct complete one another.',
        ],
      },
      {
        id: 'varalakshmi-message',
        titleHi: 'वर देने वाली लक्ष्मी',
        titleEn: 'Lakshmi who grants worthy boons',
        bodyHi: [
          'वरलक्ष्मी व्रत में भक्त धन, धान्य, आयु, संतान, सौभाग्य और शांति की प्रार्थना करता है। कथा उसे याद दिलाती है कि वर वही स्थायी है जो धर्म से जुड़ा हो।',
          'इस व्रत का संदेश है कि गृहस्थ जीवन में समृद्धि और सदाचार साथ चलें। लक्ष्मी की कृपा पाने के लिए हाथ पूजा में जुड़ें और कर्म सेवा में लगें।',
        ],
        bodyEn: [
          'In Varalakshmi Vrat, devotees pray for wealth, grain, longevity, children, auspiciousness, and peace. The katha reminds them that a boon becomes lasting only when joined with dharma.',
          'The message of the vow is that prosperity and good conduct should move together in household life. To receive Lakshmi grace, the hands should join in worship and act in service.',
        ],
      },
    ],
  }),
  summaryContent({
    id: 'jayaparvati-vrat-katha',
    titleHi: 'जयापार्वती व्रत कथा',
    titleEn: 'Jayaparvati Vrat Katha',
    themeHi: 'जयापार्वती व्रत कथा पार्वती उपासना, सौभाग्य और दृढ़ संकल्प से जुड़ी है। क्षेत्रीय परंपराओं में यह व्रत विशेषकर गुजरात और पश्चिम भारत में श्रद्धा से किया जाता है।',
    themeEn: 'Jayaparvati Vrat Katha is linked with worship of Parvati, auspiciousness, and firm resolve. Regional traditions especially in Gujarat and western India observe it with devotion.',
    practiceHi: 'ऐप में इसे क्षेत्रीय/उन्नत सामग्री माना गया है। आगे विस्तृत क्षेत्रीय संस्करण जोड़ने तक इसे सावधान संक्षिप्त कथा के रूप में रखा गया है।',
    practiceEn: 'The app treats this as regional/advanced content. Until a detailed regional version is added, it remains a careful concise retelling.',
  }),
  fullContent({
    id: 'mahalakshmi-vrat-katha',
    titleHi: 'महालक्ष्मी व्रत कथा',
    titleEn: 'Mahalakshmi Vrat Katha',
    sections: [
      {
        id: 'humble-woman',
        titleHi: 'साधारण स्त्री की श्रद्धा',
        titleEn: 'The devotion of a humble woman',
        bodyHi: [
          'महालक्ष्मी व्रत कथा में एक साधारण स्त्री या गृहस्थ परिवार का वर्णन आता है जो अभाव से दुखी है, पर धर्म नहीं छोड़ता। वह स्वच्छता, दान और देवी स्मरण से जीवन संभालता है।',
          'एक दिन उसे महालक्ष्मी व्रत की विधि बताई जाती है। कहा जाता है कि श्रद्धा से सोलह दिन या नियत अवधि तक पूजा, दीप, कथा और संयम करने से घर में लक्ष्मी का मंगल भाव आता है।',
        ],
        bodyEn: [
          'A Mahalakshmi Vrat story describes a humble woman or household troubled by scarcity but unwilling to abandon dharma. The family preserves life through cleanliness, charity, and remembrance of the Goddess.',
          'One day the method of Mahalakshmi Vrat is explained to her. She is told that worship, lamps, katha, and restraint performed with devotion for the prescribed period invite the auspicious presence of Lakshmi into the home.',
        ],
      },
      {
        id: 'testing-conduct',
        titleHi: 'आचरण की परीक्षा',
        titleEn: 'The test of conduct',
        bodyHi: [
          'कथा में देवी कभी अतिथि, वृद्धा या साधारण स्त्री के रूप में आती हैं और देखती हैं कि घर में विनम्रता है या नहीं। जहां अपमान, अस्वच्छता और लोभ होता है, वहां लक्ष्मी टिकती नहीं।',
          'भक्त परिवार अतिथि का आदर करता है, भोजन बांटता है और पूजा को दिखावा नहीं बनाता। देवी प्रसन्न होकर अभाव को धीरे-धीरे समृद्धि में बदलती हैं।',
        ],
        bodyEn: [
          'In the story, the Goddess may appear as a guest, elderly woman, or ordinary visitor to see whether humility lives in the house. Where there is insult, impurity, and greed, Lakshmi does not remain.',
          'The devoted household honors the guest, shares food, and does not turn worship into display. The Goddess is pleased and gradually transforms scarcity into prosperity.',
        ],
      },
      {
        id: 'steady-prosperity',
        titleHi: 'स्थिर समृद्धि',
        titleEn: 'Stable prosperity',
        bodyHi: [
          'महालक्ष्मी की कृपा से घर में अन्न, वस्त्र और सम्मान बढ़ता है, पर कथा बताती है कि इस समृद्धि को धर्म से संभालना होगा। दान, संयम और स्वच्छता छोड़ी जाए तो लक्ष्मी फिर चल देती हैं।',
          'व्रत का फल केवल अचानक धन नहीं, बल्कि गृहस्थ जीवन की व्यवस्था है। ऋण घटते हैं, भोजन साझा होता है और मन में भय कम होता है।',
        ],
        bodyEn: [
          'By the grace of Mahalakshmi, food, clothing, and dignity increase in the home, but the story teaches that prosperity must be preserved through dharma. If charity, restraint, and cleanliness are abandoned, Lakshmi moves away again.',
          'The fruit of the vow is not only sudden wealth; it is order in household life. Debts reduce, food is shared, and fear in the mind lessens.',
        ],
      },
      {
        id: 'mahalakshmi-message',
        titleHi: 'लक्ष्मी का स्थायी निवास',
        titleEn: 'Where Lakshmi remains',
        bodyHi: [
          'महालक्ष्मी व्रत कथा भक्त को सिखाती है कि लक्ष्मी को बुलाना सरल है, पर उनका सम्मान बनाए रखना साधना है। स्वच्छ घर, विनम्र भाषा, श्रम, दान और संतोष उनके आसन हैं।',
          'इस व्रत में देवी से प्रार्थना होती है कि धन धर्म से आए, धर्म से खर्च हो और सबके मंगल में लगे। यही महालक्ष्मी का स्थायी आशीर्वाद है।',
        ],
        bodyEn: [
          'The Mahalakshmi Vrat katha teaches that inviting Lakshmi may be simple, but honoring her presence is a discipline. A clean home, humble speech, effort, charity, and contentment are her seat.',
          'In this vow the devotee prays that wealth may come through dharma, be spent through dharma, and serve the wellbeing of all. That is the lasting blessing of Mahalakshmi.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'rishi-panchami-vrat-katha',
    titleHi: 'ऋषि पंचमी व्रत कथा',
    titleEn: 'Rishi Panchami Vrat Katha',
    sections: [
      {
        id: 'family-suffering',
        titleHi: 'परिवार की उलझन',
        titleEn: 'A family in distress',
        bodyHi: [
          'ऋषि पंचमी कथा में एक परिवार अनजाने दोषों और अशांत जीवन से दुखी है। वे कारण समझ नहीं पाते। ऋषि या ज्ञानी बताते हैं कि जीवन में शारीरिक, मानसिक और सामाजिक शुद्धता की अवहेलना भी संस्कारों को प्रभावित करती है।',
          'पुरानी कथाओं में रजस्वला धर्म, स्वच्छता और नियमों की चर्चा आती है। आधुनिक पाठक के लिए इसका संवेदनशील अर्थ यह है कि शरीर की गरिमा, विश्राम, स्वच्छता और मर्यादा को सम्मान देना भी धर्म का भाग है।',
        ],
        bodyEn: [
          'In the Rishi Panchami story, a family suffers from unrest and the effects of unrecognized faults. They cannot understand the cause. A sage or learned guide explains that neglect of physical, mental, and social purity can affect the impressions of life.',
          'Older tellings discuss menstrual rules, cleanliness, and discipline. For a modern reader, the sensitive meaning is that honoring the dignity of the body, rest, cleanliness, and boundaries is also part of dharma.',
        ],
      },
      {
        id: 'rishi-guidance',
        titleHi: 'ऋषियों का मार्ग',
        titleEn: 'Guidance of the sages',
        bodyHi: [
          'ज्ञानी व्यक्ति परिवार को ऋषि पंचमी व्रत करने को कहते हैं। सप्तऋषियों का स्मरण, स्नान, पूजा, कथा और संयम से वे अपने अनजाने दोषों के लिए क्षमा मांगते हैं।',
          'कथा में दोष स्वीकारना आत्म-निंदा नहीं है। यह जीवन को अधिक सजग, स्वच्छ और सम्मानपूर्ण बनाने का संकल्प है। ऋषि परंपरा ज्ञान और अनुशासन की दिशा देती है।',
        ],
        bodyEn: [
          'The learned guide asks the family to observe Rishi Panchami. Through remembrance of the Saptarishis, bathing, worship, katha, and restraint, they ask forgiveness for faults committed knowingly or unknowingly.',
          'Acknowledging fault in the story is not self-hatred. It is a resolve to make life more aware, clean, and respectful. The rishi tradition gives direction through knowledge and discipline.',
        ],
      },
      {
        id: 'atonement',
        titleHi: 'प्रायश्चित्त और शुद्धि',
        titleEn: 'Atonement and purification',
        bodyHi: [
          'व्रत के बाद परिवार में शांति आती है। वे नियमों को कठोर भय नहीं, बल्कि स्वास्थ्य, विश्राम और पारस्परिक सम्मान के साधन की तरह समझते हैं।',
          'ऋषि पंचमी का प्रायश्चित्त अतीत में अटकना नहीं है। यह गलती से सीखकर जीवन में मर्यादा और स्वच्छता जोड़ने की प्रक्रिया है।',
        ],
        bodyEn: [
          'After the observance, peace returns to the family. They understand discipline not as harsh fear, but as a means of health, rest, and mutual respect.',
          'The atonement of Rishi Panchami is not being trapped in the past. It is the process of learning from mistakes and adding dignity, cleanliness, and restraint to life.',
        ],
      },
      {
        id: 'rishi-message',
        titleHi: 'ऋषि स्मरण का संदेश',
        titleEn: 'The message of remembering the sages',
        bodyHi: [
          'ऋषि पंचमी व्रत कथा सप्तऋषि, गुरु परंपरा और ज्ञान के प्रति कृतज्ञता सिखाती है। मनुष्य स्वयं सब नियम नहीं बना सकता; उसे अनुभवी मार्गदर्शन और विनम्रता चाहिए।',
          'इस कथा का सार है कि शरीर का सम्मान, घर की स्वच्छता, संबंधों की मर्यादा और ज्ञान की विनम्रता साथ रहें। यही ऋषि स्मरण का व्यावहारिक धर्म है।',
        ],
        bodyEn: [
          'The Rishi Panchami katha teaches gratitude toward the Saptarishis, the guru tradition, and sacred knowledge. Human beings cannot invent all discipline for themselves; they need experienced guidance and humility.',
          'The essence of the story is to keep respect for the body, cleanliness of the home, boundaries in relationships, and humility before knowledge together. This is the practical dharma of remembering the sages.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'anant-chaturdashi-vrat-katha',
    titleHi: 'अनंत चतुर्दशी व्रत कथा',
    titleEn: 'Anant Chaturdashi Vrat Katha',
    sections: [
      {
        id: 'sushila-learns',
        titleHi: 'सुशीला को अनंत व्रत',
        titleEn: 'Sushila learns the Ananta vow',
        bodyHi: [
          'अनंत चतुर्दशी कथा सुशीला और कौंडिन्य से जुड़ी है। सुशीला ने मार्ग में स्त्रियों को अनंत भगवान का व्रत करते देखा। उन्होंने चौदह गांठों वाला सूत्र, पूजा और कथा के बारे में पूछा।',
          'स्त्रियों ने बताया कि अनंत भगवान विष्णु का अनंत रूप हैं और यह व्रत स्थिरता, रक्षा और धर्मपूर्ण समृद्धि का प्रतीक है। सुशीला ने श्रद्धा से व्रत किया और अनंत सूत्र बांधा।',
        ],
        bodyEn: [
          'The Anant Chaturdashi story is connected with Sushila and Kaundinya. On the way, Sushila saw women observing the vow of Lord Ananta. She asked about the thread with fourteen knots, the worship, and the katha.',
          'The women explained that Lord Ananta is the endless form of Vishnu and that the vow symbolizes stability, protection, and dharmic prosperity. Sushila observed the vow with faith and tied the Ananta thread.',
        ],
      },
      {
        id: 'kaundinya-pride',
        titleHi: 'कौंडिन्य का अहंकार',
        titleEn: 'Kaundinya pride',
        bodyHi: [
          'व्रत के बाद सुशीला और कौंडिन्य के जीवन में समृद्धि आई। पर कौंडिन्य ने अनंत सूत्र को केवल धागा समझकर उसका अपमान किया। उसने उसे उतारकर फेंक दिया।',
          'धीरे-धीरे संपत्ति, शांति और सम्मान घटने लगे। कौंडिन्य ने समझा कि उसने श्रद्धा का अपमान किया है। वह अनंत भगवान की खोज में निकल पड़ा।',
        ],
        bodyEn: [
          'After the vow, prosperity entered the life of Sushila and Kaundinya. But Kaundinya dismissed the Ananta thread as a mere string and insulted it. He removed and threw it away.',
          'Gradually wealth, peace, and honor declined. Kaundinya realized that he had insulted faith. He set out in search of Lord Ananta.',
        ],
      },
      {
        id: 'search-ananta',
        titleHi: 'अनंत की खोज',
        titleEn: 'The search for Ananta',
        bodyHi: [
          'कौंडिन्य वन, पर्वत और मार्गों में अनेक प्रतीकात्मक दृश्य देखता है। हर दृश्य उसे अपने दोष, लोभ या अज्ञान का बोध कराता है। अंत में अनंत भगवान प्रकट होकर उसे व्रत का महत्व समझाते हैं।',
          'कौंडिन्य पश्चाताप करता है और फिर से श्रद्धा से व्रत करने का संकल्प लेता है। कथा में खोई समृद्धि वापस आती है, पर उससे भी अधिक महत्वपूर्ण विनम्रता लौटती है।',
        ],
        bodyEn: [
          'Kaundinya travels through forests, mountains, and roads, seeing many symbolic scenes. Each one reveals some fault, greed, or ignorance within him. At last Lord Ananta appears and explains the significance of the vow.',
          'Kaundinya repents and resolves to observe the vow again with reverence. In the story, lost prosperity returns, but even more importantly, humility returns.',
        ],
      },
      {
        id: 'ananta-message',
        titleHi: 'अनंत का संदेश',
        titleEn: 'The message of Ananta',
        bodyHi: [
          'चौदह गांठों वाला अनंत सूत्र समय, धैर्य और ईश्वर की अनंत रक्षा का प्रतीक है। व्रत भक्त को बताता है कि समृद्धि का सम्मान करो और उसके पीछे की कृपा को मत भूलो।',
          'अनंत चतुर्दशी कथा का सार है कि धागा छोटा हो सकता है, पर उसमें बांधा गया संकल्प गहरा होता है। श्रद्धा का अपमान मन को दरिद्र करता है; विनम्रता उसे फिर से समृद्ध करती है।',
        ],
        bodyEn: [
          'The Ananta thread with fourteen knots symbolizes time, patience, and the endless protection of the Divine. The vow teaches the devotee to honor prosperity and not forget the grace behind it.',
          'The essence of Anant Chaturdashi is that the thread may be small, but the resolve tied into it is deep. Disrespect for faith impoverishes the mind; humility makes it prosperous again.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'jivitputrika-vrat-katha',
    titleHi: 'जीवित्पुत्रिका व्रत कथा',
    titleEn: 'Jivitputrika Vrat Katha',
    sections: [
      {
        id: 'jimutavahana',
        titleHi: 'जीमूतवाहन का त्याग',
        titleEn: 'The sacrifice of Jimutavahana',
        bodyHi: [
          'जीवित्पुत्रिका व्रत कथा में जीमूतवाहन नामक करुणामय राजकुमार का प्रसंग आता है। उसने राज्य और सुख से अधिक दया को महत्व दिया। वन में उसे नागों के दुख का समाचार मिला, जिन्हें गरुड़ के भय से अपने प्रियजनों को बलि देना पड़ता था।',
          'एक नाग माता अपने पुत्र शंखचूड़ के लिए विलाप कर रही थी। जीमूतवाहन का हृदय द्रवित हुआ। उसने निश्चय किया कि वह उस पुत्र के स्थान पर स्वयं को अर्पित करेगा।',
        ],
        bodyEn: [
          'The Jivitputrika Vrat story includes the compassionate prince Jimutavahana. He valued mercy more than kingdom and comfort. In the forest he learned of the sorrow of the nagas, who lived under the fear of Garuda and had to surrender their loved ones.',
          'A naga mother was grieving for her son Shankhachuda. Jimutavahana heart melted. He resolved to offer himself in place of the son.',
        ],
      },
      {
        id: 'garuda-test',
        titleHi: 'गरुड़ के सामने',
        titleEn: 'Before Garuda',
        bodyHi: [
          'जीमूतवाहन बलि स्थल पर लेट गया। गरुड़ आए और उसे नाग समझकर उठा ले गए। वे उसके शरीर को घायल करने लगे, पर राजकुमार शांत रहा। उसने अपने प्राणों से दूसरे के पुत्र को बचाने का संकल्प नहीं छोड़ा।',
          'जब गरुड़ को सत्य पता चला, वे करुणा से भर गए। उन्होंने जीमूतवाहन का त्याग देखा और नागों पर दया की। कथा में करुणा शत्रुता को भी बदल देती है।',
        ],
        bodyEn: [
          'Jimutavahana lay down at the place of offering. Garuda arrived and carried him away, thinking he was a naga. As Garuda wounded him, the prince remained calm and did not abandon his resolve to save another mother son.',
          'When Garuda learned the truth, he was filled with compassion. He saw Jimutavahana sacrifice and showed mercy toward the nagas. In the story, compassion transforms even enmity.',
        ],
      },
      {
        id: 'life-restored',
        titleHi: 'जीवन की रक्षा',
        titleEn: 'Life is protected',
        bodyHi: [
          'जीमूतवाहन का त्याग देखकर दिव्य कृपा प्रकट होती है। उसका जीवन बचता है और नागवंश को भय से राहत मिलती है। इसलिए जीवित्पुत्रिका व्रत में संतान की दीर्घायु और रक्षा की प्रार्थना की जाती है।',
          'कथा माताओं के व्रत को केवल अपने बच्चे तक सीमित नहीं रखती। वह बताती है कि दूसरे के बच्चे के लिए भी करुणा रखना ही जीवन की रक्षा का सच्चा धर्म है।',
        ],
        bodyEn: [
          'Seeing Jimutavahana sacrifice, divine grace appears. His life is preserved and the naga lineage receives relief from fear. For this reason, Jivitputrika Vrat includes prayer for the long life and protection of children.',
          'The katha does not confine a mother vow only to her own child. It teaches that compassion for another child is also part of the true dharma of protecting life.',
        ],
      },
      {
        id: 'jivitputrika-message',
        titleHi: 'संतान रक्षा का भाव',
        titleEn: 'The spirit of protecting children',
        bodyHi: [
          'जीवित्पुत्रिका व्रत में माताएं कठोर उपवास और कथा से संतान कल्याण की प्रार्थना करती हैं। जीमूतवाहन की कथा व्रत को व्यापक करुणा से जोड़ती है।',
          'इस कथा का संदेश है कि जीवन की रक्षा केवल अपने घर की सीमा में नहीं रुकती। त्याग, दया और साहस से ही समाज में बच्चों के लिए सुरक्षित संसार बनता है।',
        ],
        bodyEn: [
          'In Jivitputrika Vrat, mothers observe a demanding fast and listen to the katha while praying for the wellbeing of their children. The story of Jimutavahana connects the vow with wider compassion.',
          'The message is that protection of life does not stop at the boundary of one home. Through sacrifice, mercy, and courage, society becomes safer for children.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'durva-ashtami-vrat-katha',
    titleHi: 'दूर्वा अष्टमी व्रत कथा',
    titleEn: 'Durva Ashtami Vrat Katha',
    sections: [
      {
        id: 'sacred-grass',
        titleHi: 'दूर्वा की पवित्रता',
        titleEn: 'The sacredness of durva',
        bodyHi: [
          'दूर्वा अष्टमी कथा दूर्वा घास की पवित्रता और दीर्घायु भाव से जुड़ी है। दूर्वा छोटी, हरी और बार-बार उगने वाली होती है। इसलिए उसे जीवन की निरंतरता, शीतलता और विनम्र शक्ति का प्रतीक माना गया है।',
          'श्री गणेश को दूर्वा अर्पित की जाती है। कथा-परंपरा बताती है कि साधारण दिखने वाली वस्तु भी यदि श्रद्धा से अर्पित हो, तो देव पूजन में अत्यंत प्रिय बन सकती है।',
        ],
        bodyEn: [
          'The Durva Ashtami story is connected with the sacredness of durva grass and the wish for continuity of life. Durva is small, green, and able to grow again and again. It therefore symbolizes endurance, coolness, and humble strength.',
          'Durva is offered to Shri Ganesha. The story tradition teaches that even something that appears simple can become deeply beloved in worship when offered with devotion.',
        ],
      },
      {
        id: 'cooling-ganesha',
        titleHi: 'गणेश जी को शीतल अर्पण',
        titleEn: 'A cooling offering to Ganesha',
        bodyHi: [
          'एक कथा में गणेश जी की तीव्र शक्ति को शीतल करने के लिए दूर्वा अर्पित की जाती है। दूर्वा का हर तिनका विनम्रता से झुकता है, पर जल्दी सूखता नहीं। भक्त उससे धैर्य और पुनरुत्थान सीखता है।',
          'दूर्वा अष्टमी पर पूजा, व्रत और कथा से परिवार दीर्घायु, संतान मंगल और घर की हरियाली की प्रार्थना करता है। यह हरियाली बाहरी भी है और मन की भी।',
        ],
        bodyEn: [
          'One traditional idea says that durva is offered to cool the intense energy of Ganesha. Each blade bends humbly, yet does not wither easily. The devotee learns patience and renewal from it.',
          'On Durva Ashtami, families worship, observe the vow, and listen to the katha while praying for longevity, children wellbeing, and greenness in the home. That greenness is both outer and inner.',
        ],
      },
      {
        id: 'humble-offering',
        titleHi: 'साधारण अर्पण का महत्व',
        titleEn: 'The value of a simple offering',
        bodyHi: [
          'कथा बताती है कि पूजा में मूल्य वस्तु के दाम से नहीं, भाव से बनता है। दूर्वा सस्ती और सर्वसुलभ है, पर गणेश जी को प्रिय है क्योंकि वह शीतल, सात्त्विक और जीवन से भरी है।',
          'भक्त जब दूर्वा चढ़ाता है, तो वह अपने भीतर की कठोरता को भी नरम करने की प्रार्थना करता है। वह चाहता है कि जीवन बार-बार गिरकर भी फिर से उठे।',
        ],
        bodyEn: [
          'The katha teaches that the worth of an offering is not set by its price, but by its feeling. Durva is simple and widely available, yet dear to Ganesha because it is cooling, sattvic, and full of life.',
          'When the devotee offers durva, he or she also prays for inner hardness to soften. The prayer is that life may rise again even after repeated falls.',
        ],
      },
      {
        id: 'durva-message',
        titleHi: 'हरियाली का संदेश',
        titleEn: 'The message of greenness',
        bodyHi: [
          'दूर्वा अष्टमी व्रत कथा भक्त को विनम्रता, दीर्घायु और प्रकृति से जुड़ाव सिखाती है। छोटी घास भी देवता तक पहुंचती है, तो छोटा सत्कर्म भी जीवन में महत्व रखता है।',
          'इस दिन गणेश स्मरण और दूर्वा अर्पण से भक्त बाधाओं में शीतल बुद्धि मांगता है। वह प्रार्थना करता है कि उसका परिवार, मन और कर्म दूर्वा की तरह हरा, धैर्यवान और पुनर्जीवित रहे।',
        ],
        bodyEn: [
          'The Durva Ashtami katha teaches humility, longevity, and connection with nature. If a small blade of grass can reach the deity, then a small good action also matters in life.',
          'Through remembrance of Ganesha and offering of durva, the devotee asks for cool intelligence amid obstacles. The prayer is that family, mind, and action may remain green, patient, and renewed like durva.',
        ],
      },
    ],
  }),
  summaryContent({
    id: 'ashoka-ashtami-vrat-katha',
    titleHi: 'अशोक अष्टमी व्रत कथा',
    titleEn: 'Ashoka Ashtami Vrat Katha',
    themeHi: 'अशोक अष्टमी कथा अशोक वृक्ष, देवी उपासना और शोक-निवारण के भाव से जुड़ी है। क्षेत्रीय परंपराओं में यह व्रत अलग-अलग रूपों में मिलता है।',
    themeEn: 'Ashoka Ashtami is associated with the Ashoka tree, Goddess worship, and the removal of sorrow. Regional traditions preserve different forms of the observance.',
    practiceHi: 'ऐप में इसे क्षेत्रीय/उन्नत सामग्री माना गया है। विस्तृत क्षेत्रीय स्रोतों की समीक्षा के बाद इसे पूर्ण कथा रूप में बढ़ाया जा सकता है।',
    practiceEn: 'The app treats this as regional/advanced content. It can be expanded into a full story after reviewing detailed regional sources.',
  }),
  fullContent({
    id: 'parashurama-jayanti-vrat-katha',
    titleHi: 'परशुराम जयंती व्रत कथा',
    titleEn: 'Parashurama Jayanti Vrat Katha',
    sections: [
      {
        id: 'birth',
        titleHi: 'जमदग्नि और रेणुका के पुत्र',
        titleEn: 'Son of Jamadagni and Renuka',
        bodyHi: [
          'परशुराम जयंती कथा ऋषि जमदग्नि और माता रेणुका के पुत्र राम से जुड़ी है, जिन्हें परशु धारण करने के कारण परशुराम कहा गया। वे भगवान विष्णु के अवतार माने जाते हैं।',
          'उनका जीवन ब्रह्मतेज और क्षात्रबल के संगम को दिखाता है। वे ऋषि-पुत्र हैं, पर अन्याय के सामने निष्क्रिय नहीं रहते। कथा धर्म की रक्षा में संयमित शक्ति का अर्थ समझाती है।',
        ],
        bodyEn: [
          'Parashurama Jayanti tells of Rama, son of Sage Jamadagni and Mother Renuka, who came to be known as Parashurama because he bore the axe. He is revered as an avatara of Lord Vishnu.',
          'His life shows the meeting of brahminical radiance and warrior strength. He is the son of a sage, yet he does not remain passive before injustice. The story explains disciplined power in defense of dharma.',
        ],
      },
      {
        id: 'kartavirya',
        titleHi: 'कार्तवीर्य का अहंकार',
        titleEn: 'The arrogance of Kartavirya',
        bodyHi: [
          'कथा में कार्तवीर्य अर्जुन नामक शक्तिशाली राजा अहंकार से भर जाता है। कामधेनु और ऋषि आश्रम से जुड़े प्रसंग में वह मर्यादा तोड़ता है। जमदग्नि पर अत्याचार परशुराम के जीवन को निर्णायक मोड़ देता है।',
          'परशुराम का क्रोध व्यक्तिगत बदले से अधिक अधर्म के विरुद्ध प्रतिक्रिया बनता है। फिर भी कथा पाठक को सावधान करती है कि शक्ति धर्म से बंधी रहे, अन्यथा वही शक्ति कठोरता बन सकती है।',
        ],
        bodyEn: [
          'The story describes the powerful king Kartavirya Arjuna becoming filled with arrogance. In episodes involving Kamadhenu and the sage hermitage, he violates sacred boundaries. Violence against Jamadagni becomes a turning point in Parashurama life.',
          'Parashurama anger becomes a response to adharma more than private revenge. Yet the story also cautions that power must remain bound to dharma, or the same power can become harshness.',
        ],
      },
      {
        id: 'teacher-warrior',
        titleHi: 'शस्त्र और शास्त्र',
        titleEn: 'Weapon and wisdom',
        bodyHi: [
          'परशुराम शस्त्रविद्या के आचार्य भी माने जाते हैं। अनेक महायोद्धाओं से उनका संबंध आता है। उनके हाथ का परशु केवल युद्ध का प्रतीक नहीं, अनुशासन और अन्याय काटने का संकेत है।',
          'कथा में वे तपस्वी भी हैं और योद्धा भी। यह द्वंद्व बताता है कि ज्ञान और शक्ति अलग न हों। बिना ज्ञान के शक्ति अंधी है और बिना साहस के ज्ञान असहाय हो सकता है।',
        ],
        bodyEn: [
          'Parashurama is also remembered as a master of martial knowledge, connected with many great warriors. The axe in his hand is not merely a symbol of battle; it signifies discipline and the cutting away of injustice.',
          'In the story he is both ascetic and warrior. This pairing teaches that knowledge and strength should not be separated. Power without wisdom is blind, and wisdom without courage may become helpless.',
        ],
      },
      {
        id: 'parashurama-message',
        titleHi: 'धर्मयुक्त शक्ति',
        titleEn: 'Strength governed by dharma',
        bodyHi: [
          'परशुराम जयंती पर भक्त विष्णु अवतार के इस तेजस्वी रूप को स्मरण करता है। व्रत और कथा से वह अन्याय के विरुद्ध साहस, पर साथ ही क्रोध पर संयम मांगता है।',
          'कथा का संदेश है कि शक्ति तभी पवित्र है जब वह अहंकार के लिए नहीं, धर्म की रक्षा के लिए उठे। परशुराम स्मरण हमें अपने भीतर के क्रोध को तप, सेवा और न्याय में बदलना सिखाता है।',
        ],
        bodyEn: [
          'On Parashurama Jayanti, devotees remember this fiery form of Vishnu avatara. Through the vow and katha, they ask for courage against injustice, but also restraint over anger.',
          'The message is that strength is sacred only when it rises not for ego, but for the protection of dharma. Remembering Parashurama teaches us to transform anger into austerity, service, and justice.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'narasimha-jayanti-vrat-katha',
    titleHi: 'नरसिंह जयंती व्रत कथा',
    titleEn: 'Narasimha Jayanti Vrat Katha',
    sections: [
      {
        id: 'hiranyakashipu-boon',
        titleHi: 'हिरण्यकशिपु का वरदान',
        titleEn: 'Hiranyakashipu boon',
        bodyHi: [
          'नरसिंह जयंती कथा हिरण्यकशिपु के अहंकार से शुरू होती है। उसने तप कर वरदान पाया कि उसे न मनुष्य मारे, न पशु; न दिन में, न रात में; न भीतर, न बाहर; न अस्त्र से, न शस्त्र से।',
          'वरदान से उसका विवेक नहीं बढ़ा, अहंकार बढ़ गया। उसने स्वयं को ईश्वर से ऊपर मानना शुरू किया और अपने पुत्र प्रह्लाद तक को नारायण भक्ति से रोकना चाहा।',
        ],
        bodyEn: [
          'The Narasimha Jayanti story begins with the arrogance of Hiranyakashipu. Through austerity he obtained boons that he would not be killed by human or beast, by day or night, indoors or outdoors, by weapon or tool.',
          'The boon did not increase his wisdom; it increased his pride. He began to see himself as greater than God and tried to stop even his son Prahlada from devotion to Narayana.',
        ],
      },
      {
        id: 'prahlada',
        titleHi: 'प्रह्लाद की अटूट भक्ति',
        titleEn: 'Prahlada unwavering devotion',
        bodyHi: [
          'प्रह्लाद बालक था, पर उसका मन भगवान विष्णु में अडिग था। उसे दंड दिए गए, भय दिखाया गया, पर वह नारायण नाम से नहीं हटता। उसकी भक्ति किसी बाहरी सुविधा पर निर्भर नहीं थी।',
          'हिरण्यकशिपु ने पूछा कि तुम्हारा भगवान कहां है। प्रह्लाद ने कहा कि वे हर जगह हैं। राजा ने खंभे पर प्रहार किया, मानो भक्त की बात को झूठा सिद्ध करना चाहता हो।',
        ],
        bodyEn: [
          'Prahlada was a child, yet his mind remained steady in Lord Vishnu. He was punished and threatened, but he did not move away from the name of Narayana. His devotion did not depend on outer comfort.',
          'Hiranyakashipu asked where his God was. Prahlada answered that the Lord is everywhere. The king struck a pillar, as if trying to prove the devotee words false.',
        ],
      },
      {
        id: 'narasimha-appears',
        titleHi: 'नरसिंह का प्राकट्य',
        titleEn: 'Narasimha appears',
        bodyHi: [
          'खंभे से भगवान नरसिंह प्रकट हुए - न पूर्ण मनुष्य, न पूर्ण पशु। संध्या समय, देहरी पर, अपनी जंघा पर रखकर उन्होंने हिरण्यकशिपु का अंत किया। वरदान की हर शर्त धर्म की बुद्धि से पार हुई।',
          'नरसिंह का रूप क्रोध नहीं, भक्त-रक्षा की तीव्र करुणा है। अधर्म जब तर्कों और वरदानों के पीछे छिपता है, तब भगवान अप्रत्याशित रूप में प्रकट होते हैं।',
        ],
        bodyEn: [
          'From the pillar appeared Lord Narasimha, neither fully human nor fully animal. At twilight, on the threshold, placing Hiranyakashipu on his lap, he ended the tyrant. Every condition of the boon was surpassed by divine wisdom.',
          'The form of Narasimha is not ordinary anger; it is fierce compassion for the protection of the devotee. When adharma hides behind clever conditions and boons, the Lord appears in an unexpected form.',
        ],
      },
      {
        id: 'narasimha-message',
        titleHi: 'भक्त की रक्षा',
        titleEn: 'Protection of the devotee',
        bodyHi: [
          'नरसिंह जयंती पर भक्त व्रत, पूजा और कथा से भय के बीच विश्वास मांगता है। प्रह्लाद सिखाता है कि भक्ति उम्र, सत्ता या परिस्थिति से नहीं, हृदय की स्थिरता से मापी जाती है।',
          'कथा का संदेश है कि ईश्वर सर्वत्र हैं और सत्य को अंततः संरक्षण मिलता है। अहंकार चाहे कितनी शर्तें बना ले, धर्म की रक्षा के लिए दिव्य मार्ग खुलता है।',
        ],
        bodyEn: [
          'On Narasimha Jayanti, devotees observe fasting, worship, and katha while asking for faith amid fear. Prahlada teaches that devotion is measured not by age, power, or circumstance, but by steadiness of heart.',
          'The message is that God is everywhere and truth ultimately receives protection. However many conditions arrogance creates, a divine path opens for the defense of dharma.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'ganga-saptami-vrat-katha',
    titleHi: 'गंगा सप्तमी व्रत कथा',
    titleEn: 'Ganga Saptami Vrat Katha',
    sections: [
      {
        id: 'ganga-descent',
        titleHi: 'गंगा का अवतरण',
        titleEn: 'The descent of Ganga',
        bodyHi: [
          'गंगा सप्तमी कथा गंगा के पृथ्वी पर प्रकट होने और उनके पवित्र प्रवाह से जुड़ी है। भगीरथ की तपस्या से गंगा स्वर्ग से उतरीं और शिव ने उन्हें अपनी जटाओं में धारण कर उनकी धारा को संभाला।',
          'गंगा केवल नदी नहीं, पवित्रता, करुणा और पूर्वजों के उद्धार की धारा हैं। उनका प्रवाह बताता है कि कृपा ऊपर से आती है, पर उसे संभालने के लिए शिव जैसी स्थिरता चाहिए।',
        ],
        bodyEn: [
          'The Ganga Saptami story is connected with the manifestation of Ganga on earth and her sacred flow. Through Bhagiratha austerity, Ganga descended from heaven, and Shiva held her in his matted locks to steady her force.',
          'Ganga is not only a river; she is a stream of purity, compassion, and ancestral redemption. Her flow teaches that grace descends from above, but it needs the steadiness of Shiva to be received safely.',
        ],
      },
      {
        id: 'jahnu',
        titleHi: 'जाह्नु ऋषि का प्रसंग',
        titleEn: 'The episode of Sage Jahnu',
        bodyHi: [
          'गंगा की तीव्र धारा मार्ग में ऋषि जाह्नु के आश्रम से होकर बहती है। क्रोधित होकर ऋषि उन्हें पी जाते हैं। देवताओं और भगीरथ की प्रार्थना पर वे गंगा को पुनः प्रकट करते हैं। इसलिए गंगा को जाह्नवी भी कहा जाता है।',
          'यह प्रसंग सिखाता है कि पवित्र शक्ति भी मर्यादा के साथ बहे। गंगा का पुनः प्रकट होना केवल जल का लौटना नहीं, संतुलित और नियंत्रित करुणा का संकेत है।',
        ],
        bodyEn: [
          'The powerful current of Ganga flows through the hermitage of Sage Jahnu. In anger, the sage drinks her up. At the prayer of the devas and Bhagiratha, he releases her again, and she is therefore also called Jahnavi.',
          'This episode teaches that even sacred power should flow with restraint. The reappearance of Ganga is not merely the return of water; it symbolizes compassion made balanced and disciplined.',
        ],
      },
      {
        id: 'purifying-water',
        titleHi: 'पावन जल',
        titleEn: 'Purifying water',
        bodyHi: [
          'गंगा सप्तमी पर स्नान, अर्घ्य, दान और गंगा स्तुति की जाती है। जो गंगा तट पर न हों, वे भी जल को पवित्र मानकर मां गंगा का स्मरण करते हैं।',
          'कथा जल के प्रति कृतज्ञता जगाती है। जल जीवन देता है, शरीर शुद्ध करता है और मन को विनम्र बनाता है। गंगा स्मरण पर्यावरणीय जिम्मेदारी भी सिखाता है।',
        ],
        bodyEn: [
          'On Ganga Saptami, devotees bathe, offer arghya, give charity, and praise Maa Ganga. Those who are not on her banks also remember her through sacred water.',
          'The katha awakens gratitude toward water. Water gives life, cleanses the body, and humbles the mind. Remembrance of Ganga also teaches environmental responsibility.',
        ],
      },
      {
        id: 'ganga-message',
        titleHi: 'प्रवाह का संदेश',
        titleEn: 'The message of the sacred flow',
        bodyHi: [
          'गंगा सप्तमी कथा भक्त को बताती है कि कृपा बहती है, रुकती नहीं। पर उस प्रवाह को शुद्ध रखने के लिए तप, मर्यादा और संरक्षण चाहिए।',
          'मां गंगा का स्मरण केवल पाप-क्षालन की प्रार्थना नहीं, बल्कि जीवन को निर्मल बनाने का संकल्प है। जिस जल से हम पवित्रता मांगते हैं, उसकी रक्षा करना भी हमारा धर्म है।',
        ],
        bodyEn: [
          'The Ganga Saptami katha teaches that grace flows; it does not remain stagnant. Yet to keep that flow pure, austerity, boundaries, and protection are needed.',
          'Remembering Maa Ganga is not only a prayer for cleansing sin; it is a resolve to make life clear and pure. The water from which we ask purification must also be protected by us.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'buddha-purnima-vrat-katha',
    titleHi: 'बुद्ध पूर्णिमा व्रत कथा',
    titleEn: 'Buddha Purnima Vrat Katha',
    sections: [
      {
        id: 'birth',
        titleHi: 'लुम्बिनी में जन्म',
        titleEn: 'Birth in Lumbini',
        bodyHi: [
          'बुद्ध पूर्णिमा भगवान बुद्ध के जन्म, ज्ञान और महापरिनिर्वाण की स्मृति से जुड़ी है। शाक्य कुल में सिद्धार्थ का जन्म लुम्बिनी में हुआ। राजमहल में सुख था, पर उनके भीतर जीवन के गहरे प्रश्न शांत नहीं हुए।',
          'बालक सिद्धार्थ करुणामय और चिंतनशील थे। आगे चलकर उन्होंने रोग, बुढ़ापा, मृत्यु और संन्यासी को देखा। इन दृश्यों ने उन्हें बताया कि संसार का सुख अस्थायी है और दुख का समाधान खोजना आवश्यक है।',
        ],
        bodyEn: [
          'Buddha Purnima is connected with the birth, enlightenment, and Mahaparinirvana of Lord Buddha. Siddhartha was born in the Shakya lineage at Lumbini. The palace offered comfort, but the deeper questions of life did not leave him.',
          'The young Siddhartha was compassionate and reflective. Later he saw sickness, old age, death, and a renunciant. These sights showed him that worldly comfort is temporary and that the end of suffering must be sought.',
        ],
      },
      {
        id: 'renunciation',
        titleHi: 'सत्य की खोज',
        titleEn: 'The search for truth',
        bodyHi: [
          'सिद्धार्थ ने राजवैभव छोड़ा और तप, अध्ययन तथा ध्यान का मार्ग अपनाया। अत्यधिक कठोरता से भी सत्य नहीं मिला, तब उन्होंने मध्यम मार्ग को पहचाना - न भोग में डूबना, न शरीर को तोड़ देना।',
          'बोधगया में पीपल वृक्ष के नीचे उन्होंने अडिग ध्यान किया। प्रलोभन और भय शांत हुए और पूर्णिमा की रात उन्हें बोध प्राप्त हुआ। वे बुद्ध, अर्थात जागृत, कहलाए।',
        ],
        bodyEn: [
          'Siddhartha left royal comfort and followed the path of austerity, study, and meditation. Extreme harshness did not reveal truth either, so he recognized the middle path: neither sinking into indulgence nor destroying the body.',
          'Under the Bodhi tree at Bodh Gaya, he meditated with unwavering resolve. Temptation and fear settled, and on the full moon night he attained awakening. He became the Buddha, the awakened one.',
        ],
      },
      {
        id: 'teaching',
        titleHi: 'करुणा और मध्यम मार्ग',
        titleEn: 'Compassion and the middle path',
        bodyHi: [
          'बुद्ध ने दुख, उसके कारण, उसके निरोध और मार्ग की शिक्षा दी। उन्होंने करुणा, सजगता, अहिंसा और सम्यक आचरण पर बल दिया। उनकी वाणी ने राजा, गृहस्थ, भिक्षु और साधारण जन सबको मार्ग दिया।',
          'बुद्ध पूर्णिमा पर दीप, दान, ध्यान और करुणा के कर्म किए जाते हैं। कथा भक्त को भीतर जागने की प्रेरणा देती है - दुख को देखकर उससे भागना नहीं, उसे समझना और मुक्त होना है।',
        ],
        bodyEn: [
          'The Buddha taught suffering, its cause, its cessation, and the path. He emphasized compassion, mindfulness, non-harming, and right conduct. His teaching guided kings, householders, monks, and ordinary people alike.',
          'On Buddha Purnima, devotees light lamps, give charity, meditate, and perform acts of compassion. The story inspires inner awakening: one should not flee from suffering, but understand it and become free.',
        ],
      },
      {
        id: 'buddha-message',
        titleHi: 'जागरण का पर्व',
        titleEn: 'A festival of awakening',
        bodyHi: [
          'बुद्ध पूर्णिमा व्रत कथा का संदेश है कि जागरण चमत्कार से नहीं, सजगता और करुणा से आता है। मन की तृष्णा शांत हो तो संसार को अधिक स्पष्ट देखा जा सकता है।',
          'इस दिन भक्त अपने आचरण को सरल, अहिंसक और दयालु बनाने का संकल्प करता है। बुद्ध स्मरण हमें बताता है कि प्रकाश भीतर की जागी हुई दृष्टि है।',
        ],
        bodyEn: [
          'The Buddha Purnima katha teaches that awakening comes not through spectacle, but through awareness and compassion. When craving settles, the world can be seen more clearly.',
          'On this day the devotee resolves to make conduct simpler, non-harming, and kind. Remembering the Buddha tells us that light is the awakened vision within.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'narada-jayanti-vrat-katha',
    titleHi: 'नारद जयंती व्रत कथा',
    titleEn: 'Narada Jayanti Vrat Katha',
    sections: [
      {
        id: 'humble-beginning',
        titleHi: 'भक्ति का बीज',
        titleEn: 'The seed of devotion',
        bodyHi: [
          'नारद जयंती कथा देवर्षि नारद की भक्ति और ज्ञान से जुड़ी है। पुराणों में उनका पूर्वजन्म एक विनम्र बालक के रूप में बताया जाता है, जिसने साधुओं की सेवा की और उनके सत्संग से नारायण नाम का बीज पाया।',
          'बालक ने वैभव नहीं मांगा। वह सेवा, श्रवण और स्मरण से भीतर बदलता गया। साधुओं के चले जाने पर भी नाम-स्मरण उसके हृदय में गूंजता रहा।',
        ],
        bodyEn: [
          'Narada Jayanti is connected with the devotion and wisdom of Devarshi Narada. In Puranic memory, a previous birth describes him as a humble child who served sages and received the seed of Narayana name through their satsanga.',
          'The child did not ask for luxury. Through service, listening, and remembrance, he changed inwardly. Even after the sages departed, the divine name continued to resound in his heart.',
        ],
      },
      {
        id: 'vision',
        titleHi: 'नारायण का दर्शन',
        titleEn: 'A vision of Narayana',
        bodyHi: [
          'एकांत में ध्यान करते हुए उसे भगवान का क्षणिक दर्शन मिला। फिर वह दर्शन ओझल हो गया, पर भगवान की वाणी ने उसे बताया कि यह विरह भी साधना को गहरा करेगा।',
          'उसने जीवन नाम-स्मरण में बिताया। मृत्यु के बाद वह देवर्षि नारद रूप में प्रकट हुआ, वीणा और नारायण नाम के साथ लोकों में घूमने लगा।',
        ],
        bodyEn: [
          'While meditating in solitude, he received a brief vision of the Lord. The vision then disappeared, but the divine voice told him that even this longing would deepen his practice.',
          'He spent his life in remembrance of the name. After death, he manifested as Devarshi Narada, moving through the worlds with his veena and the name of Narayana.',
        ],
      },
      {
        id: 'messenger',
        titleHi: 'देवर्षि का कार्य',
        titleEn: 'The work of the divine sage',
        bodyHi: [
          'नारद देवताओं, ऋषियों, राजाओं और भक्तों के बीच संदेश ले जाते हैं। कभी वे प्रश्न उठाते हैं, कभी भ्रम तोड़ते हैं और कभी भक्ति की दिशा खोलते हैं। उनकी भूमिका केवल समाचार देने की नहीं, चेतना जगाने की है।',
          'वे भक्ति को संगीत, कथा और संवाद से फैलाते हैं। उनके हाथ की वीणा और मुख का नारायण नाम बताते हैं कि ज्ञान यदि आनंद से जुड़ा हो तो वह लोगों तक सहज पहुंचता है।',
        ],
        bodyEn: [
          'Narada carries messages among devas, sages, kings, and devotees. Sometimes he raises questions, sometimes he breaks confusion, and sometimes he opens the path of devotion. His role is not only to deliver information, but to awaken consciousness.',
          'He spreads bhakti through music, story, and dialogue. The veena in his hand and Narayana name on his lips show that knowledge reaches people easily when joined with joy.',
        ],
      },
      {
        id: 'narada-message',
        titleHi: 'नाम और सत्संग का संदेश',
        titleEn: 'The message of name and satsanga',
        bodyHi: [
          'नारद जयंती पर भक्त भक्ति, संगीत, जप और गुरु-स्मरण का अभ्यास करते हैं। कथा बताती है कि छोटा सत्संग भी जीवन की दिशा बदल सकता है।',
          'देवर्षि नारद हमें सिखाते हैं कि ज्ञान को चलायमान रखना चाहिए। जो सीखा है उसे अहंकार से नहीं, प्रेम और नाम-स्मरण से संसार में बांटना चाहिए।',
        ],
        bodyEn: [
          'On Narada Jayanti, devotees practice bhakti, music, japa, and remembrance of the guru tradition. The katha teaches that even a small satsanga can change the direction of life.',
          'Devarshi Narada teaches that knowledge should remain alive and moving. What one has learned should be shared in the world not with pride, but with love and remembrance of the divine name.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'shravana-mahatmya',
    titleHi: 'श्रावण माहात्म्य',
    titleEn: 'Shravana Mahatmya',
    sections: [
      {
        id: 'month-of-shiva',
        titleHi: 'शिव का प्रिय मास',
        titleEn: 'The month dear to Shiva',
        bodyHi: [
          'श्रावण मास वर्षा, हरियाली और शिव-स्मरण का महीना माना जाता है। समुद्र मंथन में निकले विष को शिव ने लोक-रक्षा के लिए धारण किया, इसलिए भक्त जल, दूध और बिल्व से उन्हें शीतलता अर्पित करते हैं।',
          'बारिश की ध्वनि, नदी का प्रवाह और हरी धरती भक्त को याद दिलाते हैं कि जीवन शिव की करुणा से संतुलित है। श्रावण में साधक अपने भीतर के विष - क्रोध, ईर्ष्या और कटुता - को पहचानता है।',
        ],
        bodyEn: [
          'Shravana is regarded as a month of rain, greenness, and remembrance of Shiva. When poison emerged from the cosmic ocean, Shiva held it for the protection of the worlds, so devotees offer water, milk, and bilva to cool and honor him.',
          'The sound of rain, flowing rivers, and green earth remind the devotee that life is balanced by Shiva compassion. In Shravana, the seeker recognizes inner poison: anger, jealousy, and bitterness.',
        ],
      },
      {
        id: 'sawan-somwar',
        titleHi: 'सावन सोमवार',
        titleEn: 'Sawan Mondays',
        bodyHi: [
          'श्रावण के सोमवारों में शिव व्रत, अभिषेक, जप और कथा का विशेष महत्व है। भक्त प्रातः स्नान कर शिवलिंग पर जल चढ़ाता है और सरल आहार, संयम तथा नाम-स्मरण रखता है।',
          'यह व्रत इच्छा-पूर्ति से आगे बढ़कर मन को शांत करने की साधना है। सोमवार चंद्र से जुड़ा है और शिव के मस्तक पर चंद्र मन की शीतलता का प्रतीक बनता है।',
        ],
        bodyEn: [
          'The Mondays of Shravana carry special importance for Shiva fasting, abhisheka, japa, and katha. Devotees bathe in the morning, offer water to the Shiva linga, and keep simple food, restraint, and remembrance of the name.',
          'The vow moves beyond wish fulfillment into a practice of calming the mind. Monday is connected with the moon, and the moon on Shiva head symbolizes coolness of consciousness.',
        ],
      },
      {
        id: 'mangala-gauri',
        titleHi: 'मंगला गौरी का भाव',
        titleEn: 'The mood of Mangala Gauri',
        bodyHi: [
          'श्रावण में मंगलवारों पर मंगला गौरी व्रत भी किया जाता है। शिव के साथ गौरी का स्मरण गृहस्थ जीवन की रक्षा, सौभाग्य और परिवार के मंगल को जोड़ता है।',
          'इस प्रकार श्रावण केवल विरक्ति का महीना नहीं, संतुलित गृहस्थ धर्म का भी महीना है। शिव की शांति और गौरी की ममता मिलकर जीवन को पूर्ण बनाती हैं।',
        ],
        bodyEn: [
          'On Tuesdays in Shravana, Mangala Gauri Vrat is also observed. Remembering Gauri along with Shiva connects household protection, marital auspiciousness, and family wellbeing.',
          'In this way Shravana is not only a month of renunciation; it is also a month of balanced household dharma. Shiva peace and Gauri affection make life whole.',
        ],
      },
      {
        id: 'shravana-message',
        titleHi: 'हरियाली और शुद्धि',
        titleEn: 'Greenness and purification',
        bodyHi: [
          'श्रावण माहात्म्य भक्त को जल, हरियाली, संयम और करुणा का महत्व सिखाता है। शिव को जल चढ़ाते हुए वह अपने भीतर की तपन शांत करने की प्रार्थना करता है।',
          'इस महीने का संदेश है कि विष को बाहर फेंककर दूसरों को जलाना नहीं, शिव की तरह उसे जागरूकता में रोकना और साधना से रूपांतरित करना है।',
        ],
        bodyEn: [
          'The Shravana Mahatmya teaches the value of water, greenness, restraint, and compassion. While offering water to Shiva, the devotee prays for the heat within to cool.',
          'The message of the month is not to throw poison outward and burn others, but to hold it in awareness like Shiva and transform it through practice.',
        ],
      },
    ],
  }),
  fullContent({
    id: 'kartika-mahatmya',
    titleHi: 'कार्तिक माहात्म्य',
    titleEn: 'Kartika Mahatmya',
    sections: [
      {
        id: 'lamp-month',
        titleHi: 'दीपदान का मास',
        titleEn: 'The month of lamps',
        bodyHi: [
          'कार्तिक मास को दीप, स्नान, दान और विष्णु-स्मरण का पवित्र महीना माना जाता है। वर्षा के बाद आकाश साफ होता है और भक्त प्रातः स्नान, दीपदान और नाम-जप से जीवन को उज्ज्वल करता है।',
          'इस महीने में दीपदान केवल रोशनी करना नहीं, भीतर की अज्ञानता और आलस्य को चुनौती देना है। छोटा दीप भी कहता है कि साधना नियमित हो तो अंधकार कम होने लगता है।',
        ],
        bodyEn: [
          'Kartika is regarded as a sacred month of lamps, bathing, charity, and remembrance of Vishnu. After the rains, the sky clears, and devotees brighten life through morning bathing, lamp offering, and nama-japa.',
          'Lighting a lamp in this month is not merely illumination; it challenges inner ignorance and laziness. Even a small lamp says that when practice is regular, darkness begins to lessen.',
        ],
      },
      {
        id: 'dev-uthani',
        titleHi: 'देव उठनी एकादशी',
        titleEn: 'Dev Uthani Ekadashi',
        bodyHi: [
          'कार्तिक शुक्ल एकादशी को देव उठनी या प्रबोधिनी एकादशी कहा जाता है। चातुर्मास के बाद भगवान विष्णु के जागरण का भाव मनाया जाता है और शुभ कार्यों का आरंभ फिर से माना जाता है।',
          'कथा का अर्थ है कि जीवन में भी एक समय ऐसा आता है जब सुप्त धर्म को जगाना पड़ता है। आलस्य के लंबे मौसम के बाद भक्त फिर से संकल्प, सेवा और भक्ति में उठ खड़ा होता है।',
        ],
        bodyEn: [
          'Kartika Shukla Ekadashi is known as Dev Uthani or Prabodhini Ekadashi. After Chaturmas, the awakening of Lord Vishnu is celebrated, and auspicious activities are considered to begin again.',
          'The meaning is that in life too there comes a time when sleeping dharma must be awakened. After a long season of inertia, the devotee rises again into resolve, service, and devotion.',
        ],
      },
      {
        id: 'tulasi-vivah',
        titleHi: 'तुलसी विवाह',
        titleEn: 'Tulasi Vivah',
        bodyHi: [
          'कार्तिक में तुलसी विवाह का उत्सव भी आता है, जिसमें तुलसी माता और भगवान विष्णु या शालिग्राम का विवाह कराया जाता है। यह भक्ति, पवित्रता और गृहस्थ मंगल का सुंदर प्रतीक है।',
          'तुलसी घर के आंगन में भक्ति की जीवित उपस्थिति मानी जाती है। उनका विवाह बताता है कि साधारण गृहस्थ जीवन भी पवित्र हो सकता है यदि उसमें श्रद्धा, स्वच्छता और सेवा हो।',
        ],
        bodyEn: [
          'Kartika also includes Tulasi Vivah, the ceremonial wedding of Tulasi Mata with Lord Vishnu or Shaligrama. It is a beautiful symbol of devotion, purity, and household auspiciousness.',
          'Tulasi is treated as a living presence of devotion in the courtyard. Her wedding teaches that ordinary household life can become sacred when it contains faith, cleanliness, and service.',
        ],
      },
      {
        id: 'kartika-message',
        titleHi: 'प्रकाश और जागरण',
        titleEn: 'Light and awakening',
        bodyHi: [
          'कार्तिक माहात्म्य भक्त को नियमित साधना, दीपदान, दान, तुलसी सेवा और विष्णु स्मरण के माध्यम से जीवन को उज्ज्वल करने का मार्ग देता है।',
          'इस महीने का संदेश है कि प्रकाश को प्रतिदिन जलाना पड़ता है। एक दिन का उत्साह पर्याप्त नहीं; छोटे, स्थिर, पवित्र कर्म ही मन में स्थायी कार्तिक बनाते हैं।',
        ],
        bodyEn: [
          'Kartika Mahatmya gives the devotee a way to brighten life through regular practice, lamp offering, charity, service to Tulasi, and remembrance of Vishnu.',
          'The message of the month is that light must be lit daily. One day of enthusiasm is not enough; small, steady, sacred actions create a lasting Kartika within the mind.',
        ],
      },
    ],
  }),
];

export const KATHA_CONTENT_BY_ID: ReadonlyMap<string, KathaContentEntry> = new Map(
  KATHA_CONTENT.map((item) => [item.id, item] as const)
);

export function getKathaContent(id: string): KathaContentEntry | null {
  return KATHA_CONTENT_BY_ID.get(id) ?? null;
}

(function assertKathaContentInvariants() {
  const seen = new Set<string>();
  for (const item of KATHA_CONTENT) {
    if (seen.has(item.id)) {
      throw new Error(`kathaContent: duplicate id '${item.id}'`);
    }
    seen.add(item.id);
    if (!item.titleHi.trim() || !item.titleEn.trim()) {
      throw new Error(`kathaContent: ${item.id} has empty title`);
    }
    if (item.contentStatus !== 'original-content-ready') {
      throw new Error(`kathaContent: ${item.id} must be original-content-ready`);
    }
    if (item.languageAvailability !== 'bilingual') {
      throw new Error(`kathaContent: ${item.id} must be bilingual`);
    }
    if (!item.sections.length) {
      throw new Error(`kathaContent: ${item.id} has no sections`);
    }
    for (const part of item.sections) {
      if (!part.id.trim() || !part.titleHi.trim() || !part.titleEn.trim()) {
        throw new Error(`kathaContent: ${item.id}/${part.id} has empty section metadata`);
      }
      if (!part.bodyHi.length || !part.bodyEn.length) {
        throw new Error(`kathaContent: ${item.id}/${part.id} has empty body`);
      }
      if (!part.bodyHi.every((line) => line.trim()) || !part.bodyEn.every((line) => line.trim())) {
        throw new Error(`kathaContent: ${item.id}/${part.id} has blank body paragraph`);
      }
    }
  }
})();

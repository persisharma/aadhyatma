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

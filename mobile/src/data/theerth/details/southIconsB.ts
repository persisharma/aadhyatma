import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Southern temple icons B.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: udupi-krishna bhadrachalam manakula-vinayagar
 */
export const details: Record<string, TempleDetail> = {
  padmanabhaswamy: {
    significanceHi:
      'तिरुवनंतपुरम के पूर्वी क़िले में स्थित श्री पद्मनाभस्वामी मंदिर विष्णु के अनन्तशयन स्वरूप का प्रमुख धाम है, जहाँ भगवान शेषनाग की शय्या पर योगनिद्रा में विराजते हैं। वर्तमान विग्रह और गर्भगृह का स्वरूप मलयालम वर्ष 908 यानी पैंकुनि मास, विक्रम संवत् 1790 (सन् 1733) के शिलालेख से जुड़ा है, और जनवरी 1750 (विक्रम संवत् 1806) में महाराजा मार्तण्ड वर्मा ने पूरा त्रावणकोर राज्य भगवान के चरणों में समर्पित कर दिया — तभी से राजवंश स्वयं को पद्मनाभ दास कहता आया है। नगर का नाम भी अनन्त के इसी पवित्र निवास से बना है।',
    significanceEn:
      'Sree Padmanabhaswamy Temple, inside the East Fort of Thiruvananthapuram, is the great shrine of Vishnu in his Anantashayana form, reclining in yoga-nidra on the coils of Ananta Shesha. An inscription beside the front mandapam dates the making of the present image to the third day of Painkuni in Malayalam year 908, Vikram Samvat 1790 (1733 CE), and in January 1750 (Vikram Samvat 1806) Maharaja Marthanda Varma surrendered the whole kingdom of Travancore at the deity’s feet — from that day the royal house has called itself Padmanabha Dasa. The city itself takes its name from this abode of Ananta.',
    originStoryHi:
      'स्थल-परम्परा कहती है कि अनन्तनकाडु वन में तपस्यारत मुनि के सामने विष्णु एक चंचल बालक के रूप में प्रकट हुए और मुनि को दौड़ाते-दौड़ाते एक विशाल इलुप्प वृक्ष में समा गए। वृक्ष गिरकर अनन्त पद्मनाभ के विराट स्वरूप में बदल गया — मस्तक तिरुवल्लम की ओर, नाभि तिरुवनंतपुरम में और चरण त्रिप्पादपुरम की ओर। मुनि की प्रार्थना पर भगवान ने अपना स्वरूप छोटा किया, और उसी भूमि पर आज का मंदिर खड़ा है।',
    originStoryEn:
      'By tradition a sage absorbed in penance in the forest of Ananthankadu was visited by Vishnu in the guise of a wilful child, who led him on a long chase and then merged into a huge iluppa tree. The tree is said to have fallen and taken the colossal form of Ananta Padmanabha — head towards Thiruvallam, navel at Thiruvananthapuram and lotus-feet towards Thrippadapuram. At the sage’s plea the Lord drew his form down to a size a devotee could behold, and the temple stands on that very ground.',
    sources: [
      { label: 'Sree Padmanabhaswamy Temple Trust', url: 'https://spstt.org/' },
      {
        label: 'Kerala Tourism - Sree Padmanabhaswamy Temple',
        url: 'https://www.keralatourism.org/destination/padmanabha-swamy-temple-thiruvananthapuram/13/',
      },
      {
        label: 'Incredible India (Ministry of Tourism) - Sree Padmanabhaswamy Temple',
        url: 'https://www.incredibleindia.gov.in/en/kerala/thiruvananthapuram/sree-padmanabhaswamy-temple',
      },
      { label: 'Padmanabhaswamy Temple - Reference', url: 'https://en.wikipedia.org/wiki/Padmanabhaswamy_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'परम्परा के अनुसार अनन्तनकाडु के वन में दिवाकर मुनि (कुछ पाठों में विल्वमंगलम स्वामियार) तपस्या कर रहे थे, तभी विष्णु एक शरारती बालक के रूप में आए और पूजा-सामग्री अपवित्र कर दी। क्रुद्ध मुनि ने उन्हें डाँटा तो बालक भागकर इलुप्प वृक्ष में विलीन हो गया; वृक्ष गिरा और अनन्त पद्मनाभ का इतना विशाल स्वरूप प्रकट हुआ कि एक दृष्टि में समा ही न सके। कथा में मुनि ने उसी दरिद्र वन-कन्या से माँगकर नारियल के खोल में चावल की कंजी और नमकीन आम अर्पित किए — वही उप्पु-मांगा और कंजी का नैवेद्य आज भी निवेदित होती परम्परा बताई जाती है। ऐतिहासिक रूप से मंदिर पर चेर-कालीन और बाद के शासकों का आश्रय रहा; सात मंज़िला गोपुरम की नींव सन् 1566 में रखी गई। अठारहवीं सदी में त्रावणकोर के महाराजा मार्तण्ड वर्मा ने मंदिर का बड़ा जीर्णोद्धार कराया — एक ही शिला से गढ़ा ओट्टक्कल मंडपम सन् 1731 में स्थापित हुआ, और सामने के मंडपम के दक्षिण में लगा शिलालेख विग्रह-निर्माण को मलयालम वर्ष 908 के पैंकुनि मास की तीसरी तिथि, विक्रम संवत् 1790 (सन् 1733) से जोड़ता है। जनवरी 1750 (विक्रम संवत् 1806) में उन्होंने त्रिप्पदिदानम् कर पूरा राज्य पद्मनाभस्वामी को अर्पित किया और स्वयं को उनका दास घोषित किया; तभी से मंदिर की सेवा-व्यवस्था त्रावणकोर राजपरिवार से जुड़ी है।',
        bodyEn:
          'Tradition tells of Divakara Muni — named Vilvamangalam Swamiyar in other tellings — at penance in the forest of Ananthankadu, where Vishnu came to him as a naughty child and defiled his worship. Scolded, the child ran and merged into an iluppa tree, which fell and revealed Ananta Padmanabha in a form so vast that no single glance could hold it. In the same story the sage, having nothing else, begged rice kanji and salted mango from a poor forest woman and offered them in a coconut shell — an offering of uppu-manga and kanji that is said to be made in the Lord’s worship to this day. Historically the shrine drew patronage from Chera-era and later rulers; the foundation of its seven-tiered gopuram was laid in 1566 CE. The great rebuilding came under Maharaja Marthanda Varma of Travancore in the eighteenth century: the Ottakkal Mandapam, cut from one slab of stone, was hauled into place in 1731 CE, and an inscription on the south of the front mandapam records the making of the image on the third day of Painkuni, Malayalam year 908 — Vikram Samvat 1790 (1733 CE). In January 1750 (Vikram Samvat 1806) the same king performed the Thrippadidanam, making over the entire kingdom to Padmanabhaswamy and taking the title of his servant; the temple’s service has been bound to the Travancore royal house ever since.',
      },
      {
        id: 'svarup',
        titleHi: 'पद्मनाभस्वामी का स्वरूप',
        titleEn: 'The Form of Padmanabhaswamy',
        bodyHi:
          'गर्भगृह में भगवान अनन्तशयन मुद्रा में हैं — शेषनाग की कुंडलियों पर दाहिनी करवट लेटे, फणों की छाया में योगनिद्रा-मग्न। लगभग अठारह फुट लम्बा यह विग्रह बारह हज़ार आठ शालग्राम शिलाओं से बना कहा जाता है और इतना विशाल है कि एक द्वार से पूरा दिखता ही नहीं; इसीलिए गर्भगृह में तीन द्वार हैं। पहले द्वार से भगवान का मस्तक और वक्ष के दर्शन होते हैं, दूसरे से मध्यभाग और भुजाएँ, और तीसरे से चरण-कमल — भक्त तीनों द्वारों पर क्रम से खड़े होकर एक ही स्वरूप को तीन दृष्टियों में समेटता है। गर्भगृह के सामने ओट्टक्कल मंडपम है, जो एक ही विशाल शिला से काटकर बनाया गया चौकोर मंच है; परिसर के पूर्वी द्वार के बाहर पद्म तीर्थम सरोवर है और ऊपर पांड्य शैली का लगभग सौ फुट ऊँचा सात-मंज़िला गोपुरम खड़ा है।',
        bodyEn:
          'In the sanctum the Lord lies in Anantashayana — on his right side upon the coils of Ananta Shesha, deep in yoga-nidra beneath the serpent’s hoods. The image, about eighteen feet long and said to be built of 12,008 saligrama shilas, is too vast to be taken in through one opening, so the sanctum is pierced by three doors: the first shows the head and chest, the second the middle of the body and the arms, and the third the lotus-feet. A devotee moves from door to door, gathering one form in three sights — a darshan found nowhere else in quite this shape. Before the sanctum stands the Ottakkal Mandapam, a square platform cut from a single slab of stone, while outside the eastern gate lies the Padma Theertham tank and above it the roughly hundred-foot, seven-tiered gopuram in Pandyan style.',
      },
      {
        id: 'parampara',
        titleHi: 'पद्मनाभ दास परम्परा',
        titleEn: 'The Padmanabha Dasa Tradition',
        bodyHi:
          'पद्मनाभस्वामी की सबसे विशिष्ट परम्परा राजा का दास-भाव है। जनवरी 1750 (विक्रम संवत् 1806) के त्रिप्पदिदानम् के बाद त्रावणकोर के हर शासक ने अपने नाम के आगे “पद्मनाभ दास” जोड़ा और यह माना कि वह राज्य का स्वामी नहीं, भगवान की ओर से सेवक मात्र है — राजकीय निर्णय भी भगवान के नाम पर लिए जाते रहे। मंदिर में प्रवेश की परम्परा आज भी पारम्परिक है: पुरुष धोती (मुण्डु) पहनकर और स्त्रियाँ साड़ी या सेट-मुण्डु में ही दर्शन करती हैं; सिले हुए वस्त्र गर्भगृह-परिसर में नहीं पहने जाते। दर्शन दिन में कई निश्चित पहरों में खुलता है — तड़के लगभग सवा तीन बजे से दोपहर तक और फिर सायं पाँच बजे के बाद — बीच में पूजा-काल के लिए पट बंद रहते हैं। कथा से जुड़ी कंजी और उप्पु-मांगा का सादा नैवेद्य इस वैभवशाली मंदिर की विनम्र स्मृति बना हुआ है।',
        bodyEn:
          'The signature tradition here is a king’s servitude. After the Thrippadidanam of January 1750 (Vikram Samvat 1806), every Travancore ruler prefixed his name with “Padmanabha Dasa” and governed not as owner of the land but as the deity’s steward, issuing orders in the Lord’s name. Entry keeps its old discipline: men come in a mundu, women in a sari or set-mundu, and stitched garments are set aside before the sanctum. Darshan opens in fixed watches rather than continuously — from a little after three in the morning through midday, and again from about five in the evening — with the doors closed between them for the day’s poojas. And beside all this grandeur survives the humblest offering of the founding story: plain rice kanji with salted mango, remembered from the sage who had nothing richer to give.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष में दो बड़े उत्सव होते हैं — अल्पशी उत्सवम् (अक्टूबर–नवम्बर) और पैंकुनि उत्सवम् (मार्च–अप्रैल); दोनों दस-दस दिन चलते हैं और आरात् शोभायात्रा के साथ पूर्ण होते हैं, जिसमें उत्सव-मूर्तियाँ शंखुमुखम् समुद्रतट तक ले जाकर अवभृथ-स्नान कराया जाता है। पैंकुनि मास का वही समय स्थापना-शिलालेख की तिथि से भी जुड़ता है। छह वर्षों में एक बार मुरजपम् होता है — वेद-पाठ और निरन्तर जप का अनुष्ठान — और उसी क्रम में लक्षदीपम्, जब मंदिर और परिसर एक लाख दीपों से जगमगाते हैं; यह मंदिर का सबसे दुर्लभ और सबसे भव्य दृश्य माना जाता है। इनके अतिरिक्त वैष्णव पंचांग के एकादशी, अष्टमी रोहिणी और विषु जैसे पर्वों पर भी विशेष दर्शन-भीड़ रहती है।',
        bodyEn:
          'Two ten-day festivals anchor the year: Alpashy Utsavam in October–November and Painkuni Utsavam in March–April, each closing with the Aarat procession that carries the festival images to Shankumugham beach for the ceremonial sea-bath. Painkuni also falls in the month the founding inscription names. Once every six years the temple holds the Murajapam, a long cycle of Vedic recitation and continuous chanting, and in the same cycle the Lakshadeepam, when the temple and its precinct are lit with a lakh of oil lamps — the rarest and most spectacular sight the shrine offers. Beyond these, Ekadashi, Ashtami Rohini and Vishu draw their own heavy crowds to the three doors.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर तिरुवनंतपुरम के पूर्वी क़िले (ईस्ट फ़ोर्ट) में नगर के बीचोंबीच है। तिरुवनंतपुरम सेंट्रल (थम्पानूर) रेलवे स्टेशन लगभग 1 किमी दूर है और तिरुवनंतपुरम अंतरराष्ट्रीय हवाई अड्डा लगभग 6 किमी — दोनों दूरियाँ अनुमानित हैं। पास ही पद्म तीर्थम सरोवर, पुत्तन मालिका (कुथिरा मालिका) राजमहल और पुराने क़िले की गलियाँ हैं। लगभग 2 किमी की दूरी पर आट्टुकाल भगवती मंदिर है, जिसका पोंगाल पर्व स्त्रियों के विशाल समागम के लिए प्रसिद्ध है; अधिकतर यात्री इन दोनों को एक ही दिन में जोड़ लेते हैं। कन्याकुमारी, शुचीन्द्रम और पद्मनाभपुरम महल दक्षिण की ओर एक ही यात्रा-मार्ग में आते हैं।',
        bodyEn:
          'The temple sits in the middle of Thiruvananthapuram, inside the old East Fort. Thiruvananthapuram Central, also called Thampanoor, is roughly 1 km away and Trivandrum International Airport roughly 6 km — both distances approximate. Around it lie the Padma Theertham tank, the Puthen Malika (Kuthira Malika) palace and the lanes of the fort. About 2 km off stands the Attukal Bhagavathy temple, famous for the Pongala at which women gather in enormous numbers; most visitors pair the two in a single day. Further south, Kanyakumari, Suchindram and the Padmanabhapuram palace fall along one continuous pilgrim road.',
      },
    ],
  },
};

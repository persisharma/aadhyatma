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
 * Temples still to author in this chunk: bhadrachalam manakula-vinayagar
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
  'udupi-krishna': {
    significanceHi:
      'उडुपी का श्रीकृष्ण मठ द्वैत वेदान्त के प्रवर्तक श्री मध्वाचार्य द्वारा तेरहवीं शताब्दी में स्थापित वैष्णव परम्परा का केन्द्र है, जहाँ बालकृष्ण मंथन-दंड और रस्सी लिए मुद्दु कृष्ण रूप में पूजे जाते हैं। यहाँ की सबसे अनोखी परम्परा यह है कि मुख्य दर्शन गर्भगृह के सामने से नहीं, बल्कि चाँदी जड़ी नौ छिद्रों वाली कनकन-किंडी खिड़की से होता है। सन् 1522 (विक्रम संवत् 1579) में सोदे मठ के श्री वादिराज तीर्थ ने पर्याय की अवधि दो मास से बढ़ाकर दो वर्ष की, और तभी से अष्ट मठों के स्वामी बारी-बारी से कृष्ण की सेवा सँभालते हैं।',
    significanceEn:
      'The Sri Krishna Matha at Udupi is the heart of the Dvaita Vaishnava tradition founded by Sri Madhvacharya in the thirteenth century, where Bala Krishna is worshipped as Muddu Krishna holding a churning rod and a rope. Its most distinctive practice is that the principal darshan is taken not from the sanctum front but through the Kanakana Kindi, a silver-plated window of nine openings. In 1522 CE (Vikram Samvat 1579) Sri Vadiraja Teertha of the Sode Matha lengthened the Paryaya term from two months to two full years, and since then the seers of the Ashta Mathas have taken the Lord’s service in turn.',
    originStoryHi:
      'परम्परा कहती है कि द्वारका से लौटते एक जहाज़ में गोपीचन्दन मिट्टी का बड़ा पिंड केवल भार-संतुलन के लिए रखा था; मध्वाचार्य के कहने पर वह किनारे उतारा गया और टूटने पर उसमें से बालकृष्ण का विग्रह प्रकट हुआ। तीस शिष्य मिलकर भी उसे उठा न सके, पर आचार्य ने उसे शिशु की भाँति गोद में उठा लिया और उडुपी में प्रतिष्ठित किया। बाद में भक्त कनकदास की अनन्य भक्ति से प्रसन्न होकर कृष्ण पश्चिमाभिमुख हो गए — यही कनकन-किंडी की कथा है।',
    originStoryEn:
      'Tradition holds that a ship returning from Dwaraka carried a great lump of gopichandana clay as mere ballast; at Madhvacharya’s asking it was set down on the shore, and when it cracked open the image of Bala Krishna stood revealed inside. Thirty disciples together could not lift it, yet the Acharya raised it like a child in his arms and enshrined it at Udupi. Later, moved by the single-minded devotion of Kanakadasa, Krishna is said to have turned to face west — and that is the story the Kanakana Kindi keeps.',
    sources: [
      {
        label: 'Karnataka Tourism - Udupi Sri Krishna Temple',
        url: 'https://karnatakatourism.org/tour-item/udupi-sri-krishna-temple/',
      },
      { label: 'Karnataka Tourism - Udupi Paryaya Festival', url: 'https://karnatakatourism.org/en/events/udupi-paryaya-festival' },
      { label: 'Udupi Sri Krishna Matha - Reference', url: 'https://en.wikipedia.org/wiki/Udupi_Sri_Krishna_Matha' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'श्री मध्वाचार्य (तेरहवीं शताब्दी) द्वैत वेदान्त के प्रवर्तक थे और उडुपी के निकट ही जन्मे। परम्परा के अनुसार समुद्र-तट पर उन्होंने संकट में घिरे एक जहाज़ की रक्षा की; कृतज्ञ नाविक से उन्होंने पुरस्कार में केवल वह गोपीचन्दन का पिंड माँगा जो जहाज़ में भार-संतुलन के लिए रखा था। किनारे उतारते ही वह फटा और भीतर से बालकृष्ण का विग्रह निकला — कहा जाता है कि तीस शिष्य मिलकर भी उसे हिला न सके, पर आचार्य ने उसे गोद में उठा लिया और उडुपी लाकर स्थापित किया। मूल प्रतिष्ठा की तिथि और वार किसी अभिलेख में दर्ज नहीं मिलते; परम्परा उसे तेरहवीं सदी में ही रखती है। आचार्य ने कृष्ण की नित्य सेवा के लिए आठ शिष्यों को दीक्षित किया, जिनसे पलिमारु, अदमारु, कृष्णापुर, पुत्तिगे, शिरूर, सोदे, कणियूरु और पेजावर — अष्ट मठों की परम्परा चली। आरम्भ में सेवा का क्रम दो-दो मास का था; सन् 1522 (विक्रम संवत् 1579) में सोदे मठ के श्री वादिराज तीर्थ ने उसे दो वर्ष का कर दिया, ताकि स्वामी पूजा, मठ-व्यवस्था और देशाटन तीनों को समय दे सकें। यही व्यवस्था आज भी अटूट चली आ रही है।',
        bodyEn:
          'Sri Madhvacharya, founder of the Dvaita school of Vedanta, was born near Udupi in the thirteenth century. By tradition he saved a ship in distress off that coast and asked its grateful captain for nothing but the lump of gopichandana clay the vessel carried as ballast. Set down on the shore, the lump split and the image of Bala Krishna emerged from within — thirty disciples, the story goes, could not shift it, yet the Acharya lifted it in his arms and carried it to Udupi to enshrine. No record preserves the tithi or weekday of that first consecration; tradition simply places it in the thirteenth century. The Acharya initiated eight disciples for Krishna’s daily service, and from them descend the Ashta Mathas — Palimaru, Adamaru, Krishnapura, Puttige, Shirur, Sode, Kaniyuru and Pejavara. At first each seer served two months at a time; in 1522 CE (Vikram Samvat 1579) Sri Vadiraja Teertha of the Sode Matha extended the turn to two full years so that a seer would have time for worship, for the running of his matha, and for travel to teach. That arrangement has held unbroken since.',
      },
      {
        id: 'svarup',
        titleHi: 'श्रीकृष्ण का स्वरूप',
        titleEn: 'The Form of Sri Krishna',
        bodyHi:
          'उडुपी के कृष्ण बालरूप में हैं — दाहिने हाथ में मंथन-दंड और बाएँ में मथनी की रस्सी; भक्त उन्हें मुद्दु कृष्ण अर्थात् प्यारा कृष्ण कहते हैं। मंथन-दंड का भाव यह बताया जाता है कि भगवान जीव को मथकर उसमें से भक्ति रूपी नवनीत निकालते हैं। विग्रह शालग्राम शिला का है और, परम्परा के अनुसार, कनकदास की भक्ति के बाद से पश्चिम की ओर मुख किए हुए है — जबकि मध्वाचार्य ने उसे मूलतः पूर्वाभिमुख स्थापित किया था। दर्शन गर्भगृह के सामने से नहीं, उस चाँदी जड़ी खिड़की से होता है जिसमें नौ छिद्र हैं; इसे कनकन-किंडी और नवग्रह-किंडी दोनों नामों से जाना जाता है। कथा कहती है कि भूकम्प से दीवार में पड़ी दरार से कनकदास को दर्शन हुए, और वादिराज स्वामी ने उसे बंद करने के बजाय चौड़ा कर खिड़की बना दिया। मठ-परिसर में मध्व सरोवर, भोजनशाला और गोशाला भी हैं।',
        bodyEn:
          'Udupi’s Krishna is the child Krishna: a churning rod in his right hand, the churning rope in his left, worshipped as Muddu Krishna, the endearing one. The rod is read as the Lord churning the soul until the butter of bhakti rises from it. The image is of saligrama stone and, by tradition, has faced west ever since Kanakadasa’s devotion moved it, though Madhvacharya first installed it facing east. Darshan is taken not from before the sanctum but through a silver-plated window pierced with nine openings, known both as the Kanakana Kindi and the Navagraha Kindi. The story says an earthquake cracked the wall and let Kanakadasa see the Lord, and that Vadiraja Swami, rather than sealing the crack, widened it into a window. Within the precinct stand the Madhva Sarovara tank, the dining hall and the goshala.',
      },
      {
        id: 'parampara',
        titleHi: 'कनकन-किंडी और पर्याय परम्परा',
        titleEn: 'Kanakana Kindi and the Paryaya',
        bodyHi:
          'उडुपी की दो परम्पराएँ इसे शेष वैष्णव धामों से अलग करती हैं। पहली कनकन-किंडी है — हर भक्त, चाहे वह किसी भी पृष्ठभूमि का हो, उसी नौ-छिद्र वाली खिड़की से कृष्ण को देखता है; यह कथा ही समानता का पाठ मानी जाती है। दूसरी पर्याय है: प्रत्येक सम वर्ष में मकर संक्रांति के चौथे दिन, 18 जनवरी को, अष्ट मठों में से अगले स्वामी को कृष्ण की सेवा सौंपी जाती है और वे दो वर्ष तक नित्य पूजा, अन्नदान और मठ-व्यवस्था सँभालते हैं। पर्याय-स्वामी प्रातः मध्व सरोवर में स्नान कर पूजा आरम्भ करते हैं। दोपहर का प्रसाद यहाँ अन्न-ब्रह्म कहलाता है और परिसर की भोजनशाला में प्रतिदिन सहस्रों भक्तों को निःशुल्क परोसा जाता है — उडुपी के भोजन की ख्याति इसी सेवा से निकली है। दर्शन प्रातः लगभग पाँच बजे से पूर्वाह्न तक और फिर सायं से रात तक खुला रहता है।',
        bodyEn:
          'Two customs set Udupi apart. The first is the Kanakana Kindi: every devotee, whatever their background, sees Krishna through that same nine-holed window, and the story behind it is told as a lesson in equality. The second is the Paryaya. On the fourth day after Makara Sankranti — 18 January — in every even year, the service of Krishna passes to the next of the Ashta Matha seers, who then carries the daily worship, the feeding of pilgrims and the management of the shrine for two years. The Paryaya seer begins by bathing in the Madhva Sarovara before the morning worship. The midday prasadam is called Anna Brahma and is served free in the temple’s dining hall to thousands each day; the fame of Udupi cooking grew out of this kitchen. Darshan runs from about five in the morning through the forenoon, and again from evening into the night.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा आयोजन प्रत्येक सम वर्ष का पर्याय महोत्सव है, जब 18 जनवरी को नगर शोभायात्रा, वेद-घोष और भारी जनसमूह से भर जाता है। श्रावण कृष्ण अष्टमी को श्रीकृष्ण जन्माष्टमी मनाई जाती है, जिसके लिए मठ में लाखों लड्डू और चकली तैयार होते हैं; अगले दिन विट्ठल पिंडी होती है — कृष्ण की बाल-लीलाओं का उत्सव और रथोत्सव, जिसमें रथ रथबीदी में खींचा जाता है। माघ शुक्ल नवमी को मध्व नवमी मनाई जाती है, जिस दिन परम्परा के अनुसार मध्वाचार्य अंतर्धान हुए थे। इनके अतिरिक्त मकर संक्रांति, रथ सप्तमी, नवरात्रि महोत्सव, विजयादशमी, दीपावली और गीता जयंती मठ के वार्षिक पंचांग में प्रमुख हैं।',
        bodyEn:
          'The year’s greatest event is the Paryaya Mahotsava of each even year, when 18 January fills the town with processions, Vedic chanting and enormous crowds. Krishna Janmashtami falls on Shravana Krishna Ashtami, for which the matha prepares laddus and chaklis by the lakh; the next day brings Vittala Pindi, a celebration of Krishna’s childhood pranks together with the Rathotsava, when the chariot is drawn along the Rathabeedhi. Madhva Navami, on Magha Shukla Navami, marks the day tradition holds the Acharya withdrew from the world. Makara Sankranti, Ratha Saptami, the Navaratri Mahotsava, Vijayadashami, Deepavali and Gita Jayanti round out the matha’s calendar.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मठ कर्नाटक के उडुपी ज़िले में नगर के मध्य रथबीदी (कार स्ट्रीट) पर है, जो कोंकण तट के राष्ट्रीय राजमार्ग से जुड़ा है। उडुपी रेलवे स्टेशन लगभग 3–4 किमी दूर है और मंगलूरु अंतरराष्ट्रीय हवाई अड्डा लगभग 59 किमी — दोनों दूरियाँ अनुमानित हैं। परम्परा है कि कृष्ण-दर्शन से पहले निकट के अनन्तेश्वर और चन्द्रमौलीश्वर मंदिरों में शीश नवाया जाए; ये दोनों प्राचीन शिव-मंदिर मठ से कुछ ही क़दम पर हैं। रथबीदी की परिक्रमा, मध्व सरोवर और भोजनशाला यात्रा का स्वाभाविक क्रम बनाते हैं, और अष्ट मठों के अपने-अपने भवन भी इसी गली में हैं। तटवर्ती यात्री प्रायः उडुपी को मंगलूरु और कोल्लूर की ओर के मंदिरों के साथ एक ही मार्ग में जोड़ते हैं।',
        bodyEn:
          'The matha stands at the centre of Udupi town in Karnataka, on the Rathabeedhi or Car Street, off the coastal national highway. Udupi railway station is roughly 3–4 km away and Mangaluru International Airport roughly 59 km — both distances approximate. Custom asks pilgrims to bow first at the neighbouring Anantheshwara and Chandramouleshwara temples, two ancient Shiva shrines only steps from the matha, before going to Krishna. A circuit of the Rathabeedhi, the Madhva Sarovara and the dining hall makes the natural order of a visit, and the eight mathas keep their own houses along the same street. Coastal pilgrims commonly join Udupi with the shrines towards Mangaluru and Kollur in one journey.',
      },
    ],
  },
};

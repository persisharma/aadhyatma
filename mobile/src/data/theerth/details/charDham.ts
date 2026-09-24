import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Char Dham and Chota Char Dham.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: dwarkadhish jagannath-puri yamunotri gangotri
 */
export const details: Record<string, TempleDetail> = {
  badrinath: {
    significanceHi: 'चमोली ज़िले में अलकनन्दा के तट पर, नर और नारायण पर्वतों के बीच बसा बद्रीनाथ चार धाम की उत्तर दिशा का धाम है और छोटा चार धाम की चौथी कड़ी भी। परम्परा कहती है कि आदि शंकराचार्य ने आठवीं शताब्दी ईस्वी (लगभग विक्रम संवत् की नवीं शताब्दी) में अलकनन्दा के नारद कुंड से बदरीनारायण की शालिग्राम प्रतिमा निकालकर तप्त कुंड के पास प्रतिष्ठित की; तभी से यहाँ केरल के नम्बूदरी रावल पूजा करते हैं। मंदिर वर्ष में लगभग छह मास ही खुलता है, और शीतकाल में भगवान की पूजा जोशीमठ के नरसिंह मंदिर में चलती है।',
    significanceEn: 'Badrinath, on the bank of the Alaknanda in Chamoli district between the Nar and Narayan peaks, is the northern seat of the Char Dham and the closing shrine of the Chota Char Dham. By tradition Adi Shankaracharya recovered the Shaligram image of Badrinarayan from the Narad Kund pool in the Alaknanda in the eighth century CE (about the ninth century of the Vikram Samvat era) and enshrined it near the Tapt Kund hot spring; since then the temple has been served by Namboodiri Rawals from Kerala. The shrine stays open for roughly six months a year, and through the winter the Lord is worshipped at the Narsingh temple in Joshimath.',
    originStoryHi: 'पुराण-कथा के अनुसार विष्णु ने इसी हिमालयी क्षेत्र में नर-नारायण रूप में तप किया, और हिमपात से उनकी रक्षा के लिए लक्ष्मी बदरी (बेर) का वृक्ष बनकर उन पर छा गईं; इसी से क्षेत्र बदरिकाश्रम और भगवान बदरीनाथ कहलाए। परम्परा कहती है कि कालान्तर में मूर्ति अलकनन्दा के कुंड में चली गई थी और आदि शंकराचार्य ने उसे पुनः निकालकर प्रतिष्ठित किया। उन्होंने पूजा-पद्धति की एकरूपता के लिए अपने ही प्रदेश केरल से नम्बूदरी ब्राह्मण को रावल नियुक्त किया, और यह परम्परा आज तक चल रही है।',
    originStoryEn: 'The Puranic account says Vishnu performed austerity in this Himalayan valley in his Nara-Narayana form, and that Lakshmi took the shape of a badri (jujube) tree to shelter him from the falling snow — from which the region is called Badrikashram and the Lord Badrinath. Tradition holds that the image later lay in a pool of the Alaknanda until Adi Shankaracharya recovered it and re-enshrined it. To keep the mode of worship uniform he appointed a Namboodiri Brahmin from his own Kerala as the temple’s Rawal, a line unbroken to this day.',
    sources: [
      { label: 'Shri Badarinath Kedarnath Temple Committee — Shri Badrinath', url: 'https://badrinath-kedarnath.gov.in/AboutUs/shri-badrinath.aspx' },
      { label: 'Uttarakhand Tourism — Badrinath', url: 'https://uttarakhandtourism.gov.in/destination/badrinath' },
      { label: 'Badrinath Temple — Reference', url: 'https://en.wikipedia.org/wiki/Badrinath_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'बदरिकाश्रम का उल्लेख पुराणों में अत्यंत प्राचीन तीर्थ के रूप में मिलता है, पर आज जिस रूप में धाम पूजित है उसका आरम्भ परम्परा आदि शंकराचार्य से जोड़ती है। कहा जाता है कि आठवीं शताब्दी ईस्वी (लगभग विक्रम संवत् की नवीं शताब्दी) में वे यहाँ पहुँचे और अलकनन्दा के नारद कुंड से बदरीनारायण की काले शालिग्राम-शिला की प्रतिमा निकालकर तप्त कुंड के पास एक गुफा में प्रतिष्ठित की; बाद में वह वर्तमान गर्भगृह में लाई गई। प्रतिष्ठा की कोई तिथि-वार अभिलेख में दर्ज नहीं है, इसलिए धाम का स्थापना-दिवस तिथि से नहीं, कपाट-उद्घाटन से मनाया जाता है। शंकराचार्य ने पूजा-विधि की एकरूपता के लिए केरल के नम्बूदरी ब्राह्मण को मुख्य पुजारी — रावल — नियुक्त किया; रावल बालब्रह्मचारी होते हैं और आज भी केरल से ही चुने जाते हैं। हिमस्खलन और भूकम्पों से मंदिर बार-बार क्षतिग्रस्त हुआ और गढ़वाल के राजाओं तथा बाद में इन्दौर की देवी अहिल्याबाई होल्कर सहित अनेक राजाश्रयों ने इसका जीर्णोद्धार कराया; चमकीले रंगों वाला वर्तमान अग्रभाग इन्हीं उत्तरकालीन मरम्मतों का रूप है। सन् 1939 के एक अधिनियम से बनी श्री बदरीनाथ-केदारनाथ मंदिर समिति आज दोनों धामों का प्रबन्ध देखती है।',
        bodyEn: 'Badrikashram is named in the Puranas as an ancient tirtha, but the shrine as it is worshipped today is traced by tradition to Adi Shankaracharya. He is said to have reached the valley in the eighth century CE (about the ninth century of the Vikram Samvat era), lifted the black Shaligram image of Badrinarayan from the Narad Kund pool in the Alaknanda and enshrined it in a cave beside the Tapt Kund hot spring, from where it was later moved into the present sanctum. No tithi or weekday of that consecration is recorded, so the Dham keeps no calendar sthapana day — its year turns instead on the opening of the doors. Shankaracharya appointed a Namboodiri Brahmin from Kerala as the chief priest, the Rawal, to hold the ritual to a single pattern; the Rawal is a celibate and is still chosen from Kerala. Avalanches and earthquakes damaged the building repeatedly, and the Garhwal rulers and later patrons — among them Devi Ahilyabai Holkar of Indore — rebuilt and repaired it; the brightly painted façade seen today comes from these later restorations. Since an Act of 1939 the Shri Badarinath Kedarnath Temple Committee has administered both shrines.',
      },
      {
        id: 'svarup',
        titleHi: 'बदरीनारायण का स्वरूप',
        titleEn: 'The Form of Badrinarayan',
        bodyHi: 'गर्भगृह में बदरीनारायण की काले शालिग्राम-पाषाण की लगभग एक मीटर ऊँची चतुर्भुज प्रतिमा पद्मासन में विराजमान है — दो हाथ शंख और चक्र उठाए हुए और शेष दो गोद में योगमुद्रा में। ध्यानमग्न यह मुद्रा विष्णु के अन्य मंदिरों से इसे अलग करती है, जहाँ वे प्रायः खड़े या शयन-रूप में पूजित हैं। प्रतिमा के ऊपर सोने का छत्र है और गर्भगृह की छत भी स्वर्ण-पत्र से मढ़ी है; साथ में कुबेर, नारद, उद्धव तथा नर और नारायण की मूर्तियाँ स्थापित हैं। मंदिर लगभग पन्द्रह मीटर ऊँचा है, शिखर पर छोटा स्वर्ण-मंडित कलश है, और चौड़ी सीढ़ियाँ चढ़कर मेहराबदार सिंहद्वार से प्रवेश होता है। नीचे अलकनन्दा के किनारे तप्त कुंड का गरम जल-स्रोत है, जिसका जल वर्ष भर उष्ण रहता है।',
        bodyEn: 'The sanctum holds a four-armed image of Badrinarayan about a metre tall, carved from black Shaligram stone and seated in padmasana — two hands raised with conch and discus, the other two resting in the lap in yoga-mudra. That meditative seat sets it apart from most Vishnu shrines, where the Lord stands or reclines. A golden canopy hangs over the image and the sanctum roof is sheeted in gold; alongside stand figures of Kubera, Narada, Uddhava and the twin sages Nara and Narayana. The temple rises to roughly fifteen metres under a small gilded cupola, and a broad flight of steps leads up to the arched main gate, the Singhdwar. Below it, on the Alaknanda bank, lies the Tapt Kund, a hot spring whose water stays warm the year round.',
      },
      {
        id: 'parampara',
        titleHi: 'तप्त कुंड स्नान और नारायण-सेवा',
        titleEn: 'The Tapt Kund Bath and Narayan Seva',
        bodyHi: 'बद्रीनाथ की सबसे पहचानी परम्परा यह है कि दर्शन और पूजा से पूर्व तप्त कुंड के उष्ण जल में स्नान किया जाता है — हिमालय की कड़ी ठंड में यह गरम स्रोत यात्रा का पहला संस्कार बन जाता है। दिन की सेवा प्रातः लगभग साढ़े चार बजे महाभिषेक और अभिषेक पूजा से आरम्भ होती है, फिर वेदपाठ, गीता-पाठ और भागवत-पाठ चलते हैं, दोपहर में कुछ समय कपाट बन्द रहते हैं, और सन्ध्या को गीत-गोविन्द, स्वर्ण आरती तथा रात्रि में शयन आरती के साथ दिन पूर्ण होता है। यहाँ की विशेषता यह भी है कि अभिषेक और श्रृंगार भक्तों के सामने ही सम्पन्न होते हैं। भोग-प्रसाद में तुलसी-दल, चना, मिश्री और सूखे मेवे प्रमुख हैं, और बदरी-तुलसी की माला यहाँ की पहचान-प्रसाद मानी जाती है। पूजा का समस्त क्रम रावल के हाथों होता है, जो प्रतिमा का स्पर्श करने वाले एकमात्र पुजारी हैं।',
        bodyEn: 'Badrinath’s most distinctive custom is the bath taken in the hot water of the Tapt Kund before darshan and before any puja — in that Himalayan cold the spring becomes the pilgrim’s first rite. The day of service begins around half past four in the morning with the Maha Abhishek and Abhishek puja, followed by Ved Path, Geeta Path and Bhagwat Path; the doors close for a break in the afternoon, and the evening brings Geet Govind, the Swarna Aarti and finally the Shayan Aarti at night. Unusually, the abhishek and the dressing of the image are performed in full view of the assembled devotees. The offerings centre on tulsi leaves, gram, misri sugar and dry fruit, and a garland of Badri tulsi is the prasad pilgrims carry home. The whole sequence is in the hands of the Rawal, the only priest who may touch the image.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'बद्रीनाथ का वर्ष कपाट खुलने और बन्द होने के दो बड़े अवसरों पर घूमता है। कपाट-उद्घाटन की तिथि बसन्त पंचमी को नरेन्द्रनगर स्थित टिहरी नरेश के दरबार में निश्चित की जाती है और प्रायः अप्रैल-अंत या मई-आरम्भ में, अक्षय तृतीया के आसपास पड़ती है; उस दिन अखंड ज्योति के दर्शन के लिए विशेष भीड़ होती है। कपाट-बन्दी की तिथि विजयादशमी को घोषित होती है और भाई दूज के आसपास आती है; उस दिन माता लक्ष्मी को गर्भगृह में विराजमान कर उद्धव और कुबेर की उत्सव-मूर्तियाँ शीतकालीन गद्दीस्थल जोशीमठ ले जाई जाती हैं, जहाँ नरसिंह मंदिर में छह मास पूजा चलती है। भाद्रपद में वामन द्वादशी के आसपास माणा गाँव में माता मूर्ति का मेला लगता है, जब भगवान की डोली नर-नारायण की माता के मंदिर तक जाती है। जून में आठ दिन का बदरी-केदार उत्सव होता है, जिसमें देश भर के कलाकार भजन और लोक-प्रस्तुतियाँ देते हैं।',
        bodyEn: 'The Badrinath year turns on two great moments — the opening and the closing of the doors. The opening date is fixed on Basant Panchami at the Tehri royal court in Narendranagar and usually falls in late April or early May, near Akshaya Tritiya; on that morning crowds gather for darshan of the akhand jyoti, the lamp that has burned through the shut months. The closing date is declared on Vijayadashami and comes around Bhai Dooj: Goddess Lakshmi is seated in the sanctum, and the festival images of Uddhava and Kubera travel down to the winter seat at Joshimath, where worship continues for six months at the Narsingh temple. In Bhadrapada, around Vaman Dwadashi, the Mata Murti ka Mela is held at Mana village, when the Lord’s palanquin is carried to the shrine of the mother of Nara and Narayana. June brings the eight-day Badri-Kedar Utsav, with musicians and folk performers from across the country.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'बद्रीनाथ उत्तराखंड के चमोली ज़िले में, ऋषिकेश–देवप्रयाग–रुद्रप्रयाग–कर्णप्रयाग–जोशीमठ मार्ग के अन्तिम छोर पर है। जोशीमठ से दूरी लगभग 44–46 किमी, ऋषिकेश से लगभग 290–300 किमी और हरिद्वार से लगभग 315–320 किमी है (सभी अनुमानित, सड़क-मार्ग से)। निकटतम रेलवे स्टेशन ऋषिकेश और हरिद्वार हैं; निकटतम हवाई अड्डा देहरादून का जॉली ग्रांट है, जहाँ से सड़क-मार्ग लगभग 300 किमी है। छोटा चार धाम की परम्परागत क्रम में यात्री यमुनोत्री और गंगोत्री के बाद केदारनाथ होते हुए अन्त में बद्रीनाथ पहुँचते हैं। धाम से लगभग 3 किमी आगे माणा गाँव है, जहाँ व्यास गुफा, गणेश गुफा, सरस्वती के उद्गम पर भीम पुल और आगे वसुधारा जलप्रपात का पैदल मार्ग है। पास ही तप्त कुंड, नारद कुंड, ब्रह्म कपाल — जहाँ पितरों का पिंडदान किया जाता है — और चरणपादुका शिला दर्शनीय हैं; जोशीमठ में नरसिंह मंदिर शीतकालीन गद्दीस्थल के रूप में यात्रा का अंग माना जाता है।',
        bodyEn: 'Badrinath lies in Chamoli district of Uttarakhand at the far end of the Rishikesh–Devprayag–Rudraprayag–Karnaprayag–Joshimath road. Joshimath is roughly 44–46 km away, Rishikesh about 290–300 km and Haridwar about 315–320 km, all approximate road distances. The nearest railheads are Rishikesh and Haridwar; the nearest airport is Jolly Grant at Dehradun, some 300 km by road. In the customary order of the Chota Char Dham, pilgrims come here last, after Yamunotri, Gangotri and Kedarnath. About 3 km beyond the shrine is Mana village, with the Vyas and Ganesh caves, Bhim Pul over the source stream of the Saraswati, and the walking route on to the Vasudhara falls. Close to the temple stand the Tapt Kund and Narad Kund, the rock of Brahma Kapal where offerings are made for the ancestors, and the Charanpaduka stone; at Joshimath the Narsingh temple, the winter seat, is counted part of the same yatra.',
      },
    ],
  },
};

import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Maha Shakti Peethas A.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: shrinkhala chamundeshwari jogulamba
 */
export const details: Record<string, TempleDetail> = {
  kamakshi: {
    significanceHi:
      'कांचीपुरम की कामाक्षी अम्मन अष्टादश महाशक्ति पीठों में गिनी जाती है और दक्षिण भारत में श्रीविद्या-उपासना का प्रमुख केन्द्र है। मंदिर की नींव छठी–आठवीं शताब्दी ईस्वी के पल्लव काल की मानी जाती है, जिस पर चोल और विजयनगर शासकों ने आगे की शताब्दियों में मंडप, प्राकार और गोपुर जोड़े; नवीनतम जीर्णोद्धार-महाकुम्भाभिषेक 9 फ़रवरी 2017 (विक्रम संवत् 2073) को सम्पन्न हुआ। परम्परा के अनुसार आदि शंकराचार्य ने गर्भगृह में श्रीचक्र प्रतिष्ठित किया, और आज भी हर अर्चना पहले श्रीचक्र को अर्पित होकर फिर देवी तक पहुँचती है — यही इस पीठ की सबसे विशिष्ट पहचान है।',
    significanceEn:
      'Kamakshi Amman at Kanchipuram is counted among the eighteen Maha Shakti Peethas and is the foremost seat of Srividya worship in the south. The shrine goes back to the Pallava centuries (6th–8th century CE), with halls, enclosures and gateway towers added by Chola and Vijayanagara rulers in the centuries that followed; its most recent restoration kumbhabhishekam was performed on 9 February 2017 (Vikram Samvat 2073). By tradition Adi Shankaracharya installed the Sri Chakra in the sanctum, and to this day every archana is offered first to the Sri Chakra and only then to the goddess — the mark that sets this peeth apart.',
    originStoryHi:
      'स्थल-परम्परा कहती है कि देवी पार्वती कांची आईं और कम्पा नदी के तट पर एक आम्र वृक्ष के नीचे बालू का शिवलिंग बनाकर तपस्या में बैठ गईं। शिव की कृपा से उन्हें वह तेजस्वी नेत्रों वाला सौम्य स्वरूप मिला जिससे वे "कामाक्षी" (का = ब्रह्मा-रूप, मा = विष्णु-रूप, अक्षी = नेत्र — अथवा "प्रेम-दृष्टि वाली") कहलाईं, और शिव यहीं एकाम्रनाथ रूप में प्रतिष्ठित हुए। शक्ति-पीठ परम्परा में सती के नाभि-भाग का अंश इसी भूमि पर गिरा माना जाता है, इसीलिए कांची को अष्टादश पीठों में स्थान मिला।',
    originStoryEn:
      'The sthala tradition tells that Devi Parvati came to Kanchi, shaped a lingam out of river sand beneath a single mango tree on the bank of the Kampa, and sat in penance before it. Shiva’s grace restored her in the gentle, radiant-eyed form by which she is known as Kamakshi, and Shiva himself stayed on here as Ekambaranatha, lord of the one mango tree. The Shakti Peeth tradition holds that a part of Sati’s navel fell on this ground, which is why Kanchi is numbered among the eighteen peethas.',
    sources: [
      { label: 'Sri Kamakshi Ambal Devasthanam (temple trust)', url: 'https://kanchikamakshi.org/' },
      {
        label: 'Incredible India (Ministry of Tourism) — Kamatchi Amman Temple, Kanchipuram',
        url: 'https://www.incredibleindia.gov.in/en/tamil-nadu/kanchipuram/kamatchi-amman-temple',
      },
      {
        label: 'Kancheepuram District Administration — Tourism / How to Reach',
        url: 'https://kancheepuram.nic.in/tourism/how-to-reach/',
      },
      { label: 'Kamakshi Amman Temple — Reference', url: 'https://en.wikipedia.org/wiki/Kamakshi_Amman_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'कांची के इस पीठ की मूल प्रतिष्ठा की तिथि, वार और प्रतिष्ठाकर्ता का नाम किसी अभिलेख में दर्ज नहीं है — जो दर्ज है वह निर्माण की परतें हैं। वर्तमान मंदिर का आधार पल्लव काल (छठी–आठवीं शताब्दी ईस्वी) का माना जाता है, जब कांची पल्लवों की राजधानी थी; बाद की शताब्दियों में चोल और फिर विजयनगर शासकों ने मंडप, प्राकार, तीर्थ-कुंड और गोपुर जोड़कर इसे आज का विस्तार दिया। परम्परा के अनुसार आदि शंकराचार्य ने यहाँ देवी के उग्र तेज को शान्त कर उन्हें सौम्य "शान्त-स्वरूपिणी" रूप में स्थापित किया और गर्भगृह में श्रीचक्र प्रतिष्ठित किया; इसी कथा से कांची कामकोटि पीठ की स्थापना जुड़ी बताई जाती है। मंदिर का प्रबंधन आज श्री कामाक्षी अम्बाल देवस्थानम् के अधीन है, जिसके वंशानुगत धर्मकर्ता कांची कामकोटि पीठ के जगद्गुरु शंकराचार्य हैं, और पूजा-पद्धति "सौभाग्य चिन्तामणि" के विधान से चलती है। बीसवीं–इक्कीसवीं सदी के दो कुम्भाभिषेक अभिलिखित हैं — एक सन् 1995 में और दूसरा जीर्णोद्धार के बाद 9 फ़रवरी 2017 (विक्रम संवत् 2073) को, जिसमें अष्टबन्धन महाकुम्भाभिषेक सम्पन्न हुआ।',
        bodyEn:
          'No inscription records a tithi, a weekday or a named consecrator for this peeth’s first installation — what the record holds instead is the building history. The present temple rests on Pallava foundations of the sixth to eighth centuries CE, when Kanchi was the Pallava capital; Chola and later Vijayanagara rulers added the halls, enclosure walls, tank and gateway towers that give it its present spread. By tradition Adi Shankaracharya calmed the goddess’s fierce energy, settled her here in her serene form and installed the Sri Chakra before her in the sanctum, and the founding of the Kanchi Kamakoti Peetham is told as part of the same story. The temple is administered today by the Sri Kamakshi Ambal Devasthanam, whose hereditary trustee is the Jagadguru Shankaracharya of the Kanchi Kamakoti Peetham, and its worship follows the Saubhagya Chintamani order. Two modern consecrations are on record — one in 1995, and the ashtabandhana mahakumbhabhishekam of 9 February 2017 (Vikram Samvat 2073) that followed a full restoration of the shrine.',
      },
      {
        id: 'svarup',
        titleHi: 'कामाक्षी का स्वरूप',
        titleEn: 'The Form of Kamakshi',
        bodyHi:
          'कामाक्षी यहाँ खड़ी नहीं, पद्मासन में बैठी हैं — दक्षिण के शक्ति-मंदिरों में यह असामान्य है और इसे उनके तप-रत, शान्त स्वरूप से जोड़ा जाता है। चतुर्भुजा देवी के ऊपरी दो हाथों में पाश और अंकुश हैं, नीचे के दो हाथों में इक्षु-धनुष और पुष्प-बाण; पास ही शुक (तोता) दर्शाया जाता है। गर्भगृह "गायत्री मंडपम्" कहलाता है — कामाक्षी रहस्य के अनुसार इसकी चार दीवारें चार वेदों की और चौबीस स्तम्भ गायत्री मन्त्र के चौबीस अक्षरों के प्रतीक हैं। मूर्ति के सम्मुख वह श्रीचक्र है जिसे परम्परा आदि शंकराचार्य द्वारा प्रतिष्ठित मानती है, और उपासक यहाँ तीन रूपों — श्री कामाक्षी, श्रीचक्र और बिलहस्त — का एक साथ दर्शन मानते हैं। परिसर में आदि शंकराचार्य का अलग मंदिर है, और देवी के चरणों के पास का स्वर्ण-मंडित स्तम्भ संतान-कामना से स्पर्श किया जाता है।',
        bodyEn:
          'Kamakshi is seated in padmasana rather than standing — unusual among southern goddess shrines, and read as the posture of her penance and her stilled, gracious form. Four-armed, she holds the noose and the goad in her upper hands and a sugarcane bow with flower arrows in the lower, with a parrot shown at her side. The sanctum is called the Gayatri Mandapam: by the Kamakshi Rahasya its four walls stand for the four Vedas and its twenty-four pillars for the twenty-four syllables of the Gayatri mantra. Before the image stands the Sri Chakra that tradition assigns to Adi Shankaracharya, so that worshippers speak of darshan in three forms at once — Sri Kamakshi, the Sri Chakra and the Bilahasta. A separate shrine to Adi Shankaracharya stands within the complex, and the silver-clad pillar near the goddess is touched by those who pray for children.',
      },
      {
        id: 'parampara',
        titleHi: 'श्रीचक्र अर्चना और कुंकुम प्रसाद',
        titleEn: 'Srichakra Archana and the Kumkum Prasad',
        bodyHi:
          'कांची की सबसे विशिष्ट परम्परा यह है कि कोई भी अर्चना सीधे देवी को नहीं, पहले श्रीचक्र को अर्पित होती है — उसके बाद ही मूल विग्रह की पूजा होती है। कुंकुम अर्चना और सहस्रनाम अर्चना यहाँ की सबसे माँगी जाने वाली सेवाएँ हैं; अर्चना का कुंकुम प्रसाद-रूप में मिलता है और भक्त उसे यहीं ललाट पर धारण करते हैं, जो इस क्षेत्र की अपनी रीत मानी जाती है। पूर्णिमा की रात नवावरण पूजा होती है, जिसमें श्रीचक्र के नौ आवरणों का क्रमशः पूजन किया जाता है और स्थान सीमित रहता है। शुक्रवार, पूर्णिमा, अमावस्या और तमिल मास के प्रथम दिन देवी की स्वर्ण-रथ शोभायात्रा निकलती है, जो सप्ताह का सबसे भीड़भरा दर्शन होता है। अभिषेक प्रातः, मध्याह्न और सायं तीनों काल होता है; मंदिर प्रातः के दर्शन के बाद दोपहर में बंद होकर सायं पुनः खुलता है और रात्रि आरती से दिन पूरा होता है।',
        bodyEn:
          'The signature usage at Kanchi is that no archana goes straight to the goddess: every offering is made first to the Sri Chakra, and only afterwards to the image itself. Kumkum archana and Sahasranama archana are the most sought sevas here, and the kumkum returned as prasad is applied on the forehead by devotees on the spot — a custom particular to this shrine. On full-moon nights the Navavarana puja is performed, worshipping the nine enclosures of the Sri Chakra in order, with places limited. On Fridays, full-moon and new-moon days and the first day of each Tamil month the goddess is taken out in procession on the golden chariot, the busiest darshan of the week. Abhishekam is performed morning, midday and evening; the temple opens early, closes through the afternoon, reopens in the late afternoon and ends the day with the night aarti.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा उत्सव मासी मास (फाल्गुन–चैत्र, फ़रवरी–मार्च) का ब्रह्मोत्सव है, जो कई दिन चलता है और जिसका शिखर रथोत्सव (तेर) तथा तेप्पोत्सव (तैरता दीप-उत्सव) होते हैं। शारदीय नवरात्रि (आश्विन शुक्ल प्रतिपदा से नवमी) में नौ रात्रि विशेष अलंकार और कोलु सजते हैं, और आडि (आषाढ़–श्रावण) तथा ऐप्पसि (कार्तिक) मास के पूरम नक्षत्र पर देवी के विशेष उत्सव होते हैं। वैशाख शुक्ल पंचमी को शंकर जयंती यहाँ पीठ-परम्परा के कारण विशेष रूप से मनाई जाती है, और वैकासि (ज्येष्ठ) मास में वसन्तोत्सव होता है। नवीनतम महाकुम्भाभिषेक-दिवस 9 फ़रवरी 2017 (विक्रम संवत् 2073) की वर्षगाँठ भी मंदिर में स्मरण की जाती है, और हर शुक्रवार की स्वर्ण-रथ यात्रा वर्षभर का साप्ताहिक उत्सव बनी रहती है।',
        bodyEn:
          'The year’s great festival is the Brahmotsavam of the Tamil month of Masi (February–March), running several days and peaking in the ther, the temple-car procession, and the theppam or float festival. Sharad Navaratri (Ashwin Shukla Pratipada to Navami) brings nine nights of special alankara and kolu displays, while the Pooram star in the months of Aadi (July–August) and Aippasi (October–November) carries its own festivals for the goddess. Shankara Jayanti on Vaisakh Shukla Panchami is kept with particular care because of the peetham’s lineage, and Vasanta Utsavam falls in Vaikasi (May–June). The anniversary of the mahakumbhabhishekam of 9 February 2017 (Vikram Samvat 2073) is also marked at the temple, and the Friday golden-chariot procession serves as the weekly festival through the year.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर कांचीपुरम ज़िले के "बड़ा कांचीपुरम" भाग में है, जो चेन्नई–बेंगलूरु राजमार्ग से लगभग 15 किमी भीतर पड़ता है। चेन्नई से दूरी लगभग 70–75 किमी है; निकटतम हवाई अड्डा चेन्नई है, जो लगभग 65–75 किमी दूर पड़ता है, और कांचीपुरम रेलवे स्टेशन व बस स्टैंड दोनों मंदिर से लगभग 1–3 किमी पर हैं। अधिकांश यात्री कामाक्षी के दर्शन को उसी दिन एकाम्बरेश्वर (शिव), वरदराज पेरुमाल (विष्णु) और कुमारकोट्टम (मुरुगन) के साथ जोड़ते हैं — यही कांची की पारम्परिक चतुर्दर्शन-यात्रा है। मंदिर से लगभग 1 किमी पर कांची कामकोटि पीठ का मठ है, जहाँ आचार्यों के अधिष्ठान हैं। कांची का शक्ति-यात्रा क्रम प्रायः तिरुवण्णामलै और तिरुपति के साथ भी बाँधा जाता है; सभी दूरियाँ अनुमानित हैं।',
        bodyEn:
          'The temple stands in Big Kanchipuram, in Kanchipuram district, roughly 15 km off the Chennai–Bengaluru highway corridor. Chennai is about 70–75 km away; the nearest airport is Chennai, approximately 65–75 km distant, while Kanchipuram railway station and the bus stand are both around 1–3 km from the shrine. Most pilgrims pair Kamakshi’s darshan in the same day with Ekambareswarar (Shiva), Varadaraja Perumal (Vishnu) and Kumarakottam (Murugan) — the traditional four-temple round of Kanchi. About 1 km away is the math of the Kanchi Kamakoti Peetham, where the adhishthanams of its acharyas are visited. Kanchi is also commonly strung together with Tiruvannamalai and Tirupati on a longer southern circuit; all distances are approximate.',
      },
    ],
  },
};

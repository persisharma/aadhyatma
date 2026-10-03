import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Maha Shakti Peethas C.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * All four temples in this chunk are authored.
 */
export const details: Record<string, TempleDetail> = {
  puruhutika: {
    significanceHi:
      'पिठापुरम का पुरुहूतिका देवी मंदिर अष्टादश महाशक्ति पीठों में गिना जाता है और कुक्कुटेश्वर स्वामी मंदिर परिसर के ईशान कोण में स्वतंत्र गर्भगृह में विराजित है। देवी की प्रतिष्ठा की तिथि, वार या संवत् किसी उपलब्ध अभिलेख में दर्ज नहीं है, पर पिठापुरम का नाम समुद्रगुप्त के प्रयाग स्तम्भ-लेख (लगभग सन् 350 ई., विक्रम संवत् लगभग 407) में आता है, जिससे यह क्षेत्र कम से कम चौथी शती से तीर्थ रहा है। देवी-दर्शन के साथ पादगया सरोवर में स्नान और पितरों के निमित्त तर्पण की परम्परा इस स्थान को शक्ति-उपासना और पितृ-कर्म दोनों का केन्द्र बनाती है।',
    significanceEn:
      'The Puruhutika Devi shrine at Pithapuram is counted among the eighteen Maha Shakti Peethas and holds its own sanctum in the north-east corner of the Kukkuteswara Swamy temple complex. No surviving inscription gives the samvat, tithi or weekday of her consecration, but Pithapuram itself is named in Samudragupta’s Prayaga pillar inscription (about 350 CE, roughly Vikram Samvat 407), so the site has been a tirtha since at least the fourth century. Pilgrims pair darshan of the goddess with a bath in the Pada Gaya Sarovaram and rites for their departed elders, which makes this one of the few places where Shakta worship and pitru-karma are kept side by side.',
    originStoryHi:
      'परम्परा के अनुसार दक्ष-यज्ञ के पश्चात सती के देह का एक अंश यहाँ गिरा और यह भूमि “पुरुहूतिकापुरम” कहलाई, जो कालान्तर में पीठिकापुरम और फिर पिठापुरम हुई। एक दूसरी लोक-मान्यता कहती है कि त्रिमूर्ति ने गयासुर का दमन किया तब उसके चरण इसी स्थान पर पड़े, इसीलिए यह नगर पादगया क्षेत्र कहलाता है। शिव यहाँ कुक्कुट-आकृति से जुड़े लिङ्ग में कुक्कुटेश्वर नाम से पूजित हैं और उनकी शक्ति उसी परिसर में पुरुहूतिका देवी के रूप में।',
    originStoryEn:
      'By tradition a part of Sati’s body fell here after the Daksha yagna, and the ground came to be called Puruhutikapuram, later Pithikapuram and then Pithapuram. A second local account holds that when the Trimurti subdued Gayasura his feet came to rest at this spot, which is why the town is revered as Pada Gaya Kshetra — the foot-Gaya, reckoned with Gaya itself among the Tri-Gaya sites. Shiva is worshipped here as Kukkuteswara in a linga identified with the form of a cock, and his Shakti stands in the same enclosure as Puruhutika Devi.',
    sources: [
      {
        label: 'East Godavari District Administration - Sri Kukkuteshwara Swamy Temple',
        url: 'https://eastgodavari.ap.gov.in/lord-kukkuteshwara-swamy-temple/',
      },
      {
        label: 'Utsav, Ministry of Tourism - Shri Puruhutika Devi Ammavari Navaratri Utsavalu, Padagaya',
        url: 'https://utsav.gov.in/view-event/shri-puruhutika-devi-ammavari-navaratri-ustavalu-padagaya-pitapuram-kakinada-district-1',
      },
      {
        label: 'Kukkuteswara Temple - Reference',
        url: 'https://en.wikipedia.org/wiki/Kukkuteswara_Temple',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'पुरुहूतिका देवी की प्रतिष्ठा किस संवत्, तिथि या वार में हुई — यह किसी उपलब्ध अभिलेख या मंदिर-दस्तावेज़ में दर्ज नहीं मिलता; अष्टादश पीठों में उनका स्थान देवी भागवत और तंत्र-चूड़ामणि जैसी परम्परागत सूचियों से आता है, किसी प्रतिष्ठा-पत्र से नहीं। जो प्रमाणित है वह नगर की प्राचीनता है: पिठापुरम का उल्लेख समुद्रगुप्त के प्रयाग प्रशस्ति स्तम्भ-लेख (लगभग सन् 350 ई., विक्रम संवत् लगभग 407) में है, और श्रीनाथ ने अपने “भीमेश्वर पुराणमु” (लगभग सन् 1400–1500, विक्रम संवत् 1457–1557) में इस नगर का वर्णन किया है। आज खड़ा कुक्कुटेश्वर मंदिर द्रविड़ शैली का है और उसकी बनावट पर विष्णुकुंडिन तथा चालुक्य कालीन निर्माण-परम्परा का प्रभाव बताया जाता है; देवी का गर्भगृह इसी परिसर के ईशान कोण में बना है। किसी संस्थापक राजा अथवा सेवा करती आ रही वंश-परम्परा का नाम देवी के मंदिर के लिए उपलब्ध स्रोतों में दर्ज नहीं है।',
        bodyEn:
          'No available inscription or temple record gives the samvat, tithi or weekday on which Puruhutika Devi was consecrated; her place among the eighteen Peethas descends from the listing traditions of the Devi Bhagavata and the Tantra Chudamani rather than from a foundation deed. What is documented is the antiquity of the town. Pithapuram is named in Samudragupta’s Prayaga pillar inscription (about 350 CE, roughly Vikram Samvat 407), and Srinatha describes the city in his Bhimeswara Puranamu (about 1400–1500 CE, Vikram Samvat 1457–1557). The Kukkuteswara temple standing today is Dravidian in plan, and its fabric is said to carry the building traditions of the Vishnukundin and Chalukya periods; the goddess occupies her own sanctum in the north-east of that enclosure. Neither a founding patron nor a serving family line is recorded for her shrine in the sources available.',
      },
      {
        id: 'svarup',
        titleHi: 'पुरुहूतिका देवी का स्वरूप',
        titleEn: 'The Form of Puruhutika Devi',
        bodyHi:
          'गर्भगृह में देवी की प्रतिमा ग्रेनाइट की है — खड़ी मुद्रा में, किरीट और आभूषणों से अलंकृत तथा रेशमी वस्त्रों में सजी। उनके चार हाथ हैं: नीचे दाहिने हाथ में बीज-पात्र, ऊपर दाहिने में परशु, ऊपर बाएँ में कमल और नीचे बाएँ में मधु-पात्र; बीज और परशु का यह संयोग उन्हें भूमि की उर्वरता तथा संहार-शक्ति दोनों की अधिष्ठात्री के रूप में दिखाता है। देवी का गर्भगृह अलग होते हुए भी कुक्कुटेश्वर परिसर का ही अंग है, इसलिए एक ही प्रदक्षिणा में शिव और शक्ति दोनों के दर्शन हो जाते हैं। परिसर के मुख्य लिङ्ग को कुक्कुट अर्थात मुर्गे की आकृति से जोड़ा जाता है, जिससे शिव का नाम कुक्कुटेश्वर पड़ा, और उनकी सहचरी के रूप में राजराजेश्वरी देवी भी यहीं पूजित हैं।',
        bodyEn:
          'The goddess stands in her sanctum as a granite image, crowned with a kirita, clothed in silks and heavy with ornament. She carries four arms — a vessel of seed in the lower right hand, a parashu or axe in the upper right, a lotus in the upper left and a madhu-patra in the lower left — so that the power to make the earth bear and the power to cut down are held in the same pair of hands. Because her sanctum sits inside the Kukkuteswara enclosure rather than in a compound of its own, a single circumambulation carries the pilgrim past both Shiva and his Shakti. The presiding linga of the complex is identified with the form of a cock, from which Shiva takes the name Kukkuteswara, and Rajarajeswari Devi is worshipped here as his consort.',
      },
      {
        id: 'parampara',
        titleHi: 'पादगया तर्पण और कुंकुम-अर्चना',
        titleEn: 'Pada Gaya Tarpana and Kumkuma Archana',
        bodyHi:
          'पिठापुरम की सबसे विशिष्ट परम्परा पादगया तर्पण है — परिसर में प्रवेश करते ही पादगया सरोवर मिलता है, जहाँ यात्री स्नान कर अपने पितरों के निमित्त तर्पण और पिंडदान करते हैं; गया को शिर और पिठापुरम को चरण मानकर इनकी गणना त्रिगया क्षेत्रों में की जाती है। देवी के समक्ष कुंकुम-अर्चना तथा साड़ी और चूड़ियों का अर्पण सौभाग्य की कामना से किया जाता है, जो दक्षिण भारत के शक्ति-पीठों की सामान्य रीति है। मंदिर प्रातः लगभग साढ़े पाँच बजे खुलता है, दोपहर में लगभग एक से साढ़े चार बजे तक बंद रहता है और रात लगभग नौ बजे तक दर्शन होते हैं। कुक्कुटेश्वर स्वामी को प्रतिदिन स्नान, अभिषेक, पुष्पालंकार, धूप-दीप और महानैवेद्य अर्पित होते हैं; किसी एक वार को विशेष भीड़-दिवस के रूप में मंदिर-स्रोतों में अलग से दर्ज नहीं किया गया।',
        bodyEn:
          'Pithapuram’s signature observance is the Pada Gaya tarpana. A tank called the Pada Gaya Sarovaram lies just inside the enclosure, and pilgrims bathe there before offering tarpana and pinda for their departed elders — Gaya standing for the head and this place for the feet, the two reckoned together among the Tri-Gaya kshetras. Before the goddess, kumkuma archana and the offering of a saree and bangles are the customary prayer for household wellbeing, as at other southern Shakti shrines. The sanctum opens at about 5.30 in the morning, closes through the early afternoon from roughly 1.00 to 4.30, and gives darshan until about 9.00 at night, while Kukkuteswara Swamy receives snana, abhisheka, floral alankara, dhupa-dipa and maha-naivedya each day. Temple sources single out no peak weekday here — the crowd swells in Navaratri rather than on any one day of the week.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा आयोजन आश्विज (आश्विन) मास का शारदीय नवरात्र है, जो पादगया में “दसरा उत्सवालु” के नाम से मनाया जाता है — अंकुरार्पण और कलश-स्थापना से आरम्भ होकर नौ दिन देवी के भिन्न-भिन्न अलंकार होते हैं, शतचंडी याग सम्पन्न होता है और राजराजेश्वरी अम्मावारि की तेप्पोत्सव अर्थात नौका-यात्रा निकाली जाती है। भारत सरकार के पर्यटन मंत्रालय के उत्सव-पोर्टल पर यह नवरात्र पिठापुरम के प्रमुख आयोजनों में सूचीबद्ध है। माघ मास की महाशिवरात्रि कुक्कुटेश्वर स्वामी का बड़ा पर्व है, जब परिसर रात्रि-जागरण और अभिषेक से भरा रहता है। प्रतिष्ठा-तिथि दर्ज न होने के कारण यहाँ कोई वार्षिक स्थापना-दिवस नहीं मनाया जाता, और देवी तक किसी नियमित पदयात्रा-परम्परा का उल्लेख भी उपलब्ध स्रोतों में नहीं मिलता।',
        bodyEn:
          'The year turns on Sharada Navaratri in the month of Ashwija (September–October), kept at Pada Gaya as the Dasara Utsavalu: it opens with ankurarpana and the setting of the kalasha, carries a different alankara for the goddess on each of the nine days, includes a Shatachandi Yaga, and closes with the float festival of Rajarajeswari Ammavari. The Union Ministry of Tourism’s Utsav portal lists this Navaratri among Pithapuram’s principal events. Mahashivaratri in the month of Magha (February–March) is the great night of Kukkuteswara Swamy, when the enclosure fills for abhisheka and jagarana. Because no consecration date survives, the shrine keeps no annual sthapana day, and the available sources record no established padyatra walked to the goddess.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'पिठापुरम आंध्र प्रदेश के काकिनाडा ज़िले में है — काकिनाडा नगर से लगभग 15–16 किमी, सामरलकोट से लगभग 12 किमी और कठिपूड़ी जंक्शन से लगभग 19 किमी। पिठापुरम रेलवे स्टेशन मंदिर से लगभग ढाई किमी दूर है और हावड़ा–चेन्नई मार्ग पर पड़ता है; निकटतम हवाई अड्डा राजमहेंद्रवरम लगभग 55–75 किमी दूर है और विजयवाड़ा का अंतर्राष्ट्रीय हवाई अड्डा लगभग 140 किमी। अधिकांश यात्री देवी के दर्शन के साथ लगभग 30 किमी दूर अन्नवरम के श्री वीर वेंकट सत्यनारायण स्वामी मंदिर को एक ही यात्रा में जोड़ते हैं। परिसर के भीतर पादगया सरोवर और कुक्कुटेश्वर स्वामी का मुख्य गर्भगृह दर्शनीय हैं, और नगर में ही श्रीपाद श्रीवल्लभ महासंस्थान है, जिसे दत्तात्रेय-परम्परा में श्रीपाद श्रीवल्लभ का जन्म-स्थान माना जाता है।',
        bodyEn:
          'Pithapuram lies in Kakinada district of Andhra Pradesh, roughly 15–16 km from Kakinada town, about 12 km from Samarlakota and about 19 km from Kathipudi Junction. Pithapuram railway station, on the Howrah–Chennai line, is approximately 2.5 km from the temple; the nearest airport is Rajahmundry at roughly 55–75 km, with Vijayawada’s international airport about 140 km away. Most pilgrims pair the goddess with the Sri Veera Venkata Satyanarayana Swamy temple at Annavaram, about 30 km off. Inside the enclosure the Pada Gaya Sarovaram and the Kukkuteswara sanctum are the other two halts, and in the town itself stands the Sripada Srivallabha Mahasamsthanam, held in the Dattatreya tradition to mark the birthplace of Sripada Srivallabha.',
      },
    ],
  },
  biraja: {
    significanceHi:
      'जाजपुर की बिरजा (गिरिजा) देवी अष्टादश महाशक्ति पीठों में गिनी जाती हैं और उन्हीं के नाम से यह पूरा अंचल “बिरजा क्षेत्र” अथवा “बिरजा पीठ” कहलाता है। वर्तमान मंदिर ग्यारहवीं शताब्दी ईस्वी (लगभग विक्रम संवत् 1057–1157) का बताया जाता है, यद्यपि कुछ विवरण इसे तेरहवीं शताब्दी (विक्रम संवत् 1257–1357) में रखते हैं; प्रतिष्ठा की तिथि और वार कहीं दर्ज नहीं हैं। देवी की द्विभुजा महिषमर्दिनी प्रतिमा और परिसर के भीतर स्थित नाभि गया — जहाँ पितरों के निमित्त पिंडदान होता है — इस पीठ की दो सबसे बड़ी पहचान हैं।',
    significanceEn:
      'Biraja, also called Girija, of Jajpur is counted among the eighteen Maha Shakti Peethas, and the whole tract around her takes its name from her — Biraja Kshetra, or Biraja Pitha. The temple standing today is generally placed in the eleventh century CE (roughly Vikram Samvat 1057–1157), though some accounts put it in the thirteenth (Vikram Samvat 1257–1357); no record gives the tithi or weekday of its consecration. Two things set this Peetha apart: a two-armed Mahishamardini image found nowhere else, and the Nabhi Gaya inside the same enclosure, where pinda is offered for the departed.',
    originStoryHi:
      'तंत्र-चूड़ामणि की शक्ति-पीठ सूची के अनुसार सती की नाभि यहाँ गिरी, और इसी से यह भूमि विरजा क्षेत्र कहलाई। परम्परा यह भी कहती है कि विष्णु ने गयासुर का दमन किया तब उसका शिर गया में, नाभि जाजपुर में और चरण पिठापुरम में पड़े — ये तीनों श्राद्ध-कर्म के क्षेत्र माने जाते हैं। महाभारत के वन पर्व में “विरजा तीर्थ” का उल्लेख वैदिक यज्ञों के पवित्र स्थल के रूप में आता है, इसलिए यह स्थान शक्ति-पीठ बनने से पहले भी तीर्थ रहा।',
    originStoryEn:
      'In the Shakti Peeth listing of the Tantra Chudamani, Sati’s navel fell at this spot, and from that the land came to be called Viraja Kshetra. Tradition adds that when Vishnu subdued Gayasura his head came to rest at Gaya, his navel at Jajpur and his feet at Pithapuram, which is why all three are kept as places for the rites of the ancestors. The Vana Parva of the Mahabharata names a Virajah-tirtha as a sacred ground for Vedic sacrifice, so the site was a tirtha before it was reckoned a Peetha.',
    sources: [
      {
        label: 'Jajpur District Administration, Government of Odisha - Biraja Khetra',
        url: 'https://jajpur.odisha.gov.in/tourism/tourist-places/biraja-khetra',
      },
      {
        label: 'Odisha Tourism - Biraja Temple',
        url: 'https://odishatourism.gov.in/content/tourism/en/discover/attractions/temples-monuments/biraja-temple.html',
      },
      {
        label: 'Biraja Temple - Reference',
        url: 'https://en.wikipedia.org/wiki/Biraja_Temple',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'बिरजा देवी की प्रतिष्ठा किस तिथि, वार अथवा संवत् में हुई, यह किसी उपलब्ध अभिलेख में दर्ज नहीं है — पीठ की गणना तंत्र-चूड़ामणि और देवी भागवत जैसी परम्परागत सूचियों से आती है। स्थान की प्राचीनता प्रमाणित है: महाभारत के वन पर्व में विरजा तीर्थ का नाम आता है, और दसवीं शती में सोमवंशी शासक ययाति केसरी ने वैतरणी के तट पर अपनी राजधानी बसाकर उसे अभिनव ययातिनगर नाम दिया — जाजपुर नाम इसी से बना। वर्तमान मंदिर के निर्माण को अधिकांश विवरण ग्यारहवीं शताब्दी ईस्वी (लगभग विक्रम संवत् 1057–1157) में सोमवंशी काल के अंतर्गत रखते हैं, जबकि कुछ स्रोत इसे तेरहवीं शताब्दी (विक्रम संवत् 1257–1357) का बताते हैं; दोनों मत प्रचलित हैं। मंदिर कलिंग शैली का है और उसमें विमान, जगमोहन तथा नाटमंदिर — तीनों अंग क्रम से बने हैं।',
        bodyEn:
          'No surviving record names the samvat, tithi or weekday on which Biraja was consecrated; her rank among the Peethas comes from the listing traditions of the Tantra Chudamani and the Devi Bhagavata. The antiquity of the ground, though, is documented. The Vana Parva of the Mahabharata names Virajah-tirtha, and in the tenth century the Somavamshi ruler Yayati Keshari settled his capital on the bank of the Vaitarani and called it Abhinava Yayatinagara — the name Jajpur descends from it. Most accounts place the present temple in the eleventh century CE (roughly Vikram Samvat 1057–1157) under that same dynasty, while some put it in the thirteenth (Vikram Samvat 1257–1357); both readings are current and neither can be set aside. The building follows the Kalinga school, carrying vimana, jagamohana and natamandira in sequence.',
      },
      {
        id: 'svarup',
        titleHi: 'बिरजा देवी का स्वरूप',
        titleEn: 'The Form of Biraja Devi',
        bodyHi:
          'बिरजा देवी महिषमर्दिनी रूप में विराजित हैं, पर उनकी प्रतिमा द्विभुजा है — देश में महिषासुरमर्दिनी की केवल दो भुजाओं वाली यही प्रतिमा मानी जाती है, जबकि अन्यत्र देवी अष्टभुजा या दशभुजा दिखती हैं। एक हाथ से वे महिषासुर के वक्ष में शूल भोंक रही हैं और दूसरे से उसकी पूँछ खींच रही हैं; उनका एक चरण सिंह पर और दूसरा महिषासुर के वक्ष पर टिका है, तथा महिषासुर यहाँ भैंसे के रूप में ही दिखाया गया है। देवी के मुकुट पर गणेश, अर्धचन्द्र और एक लिङ्ग अंकित हैं — शक्ति, शिव और गणपति एक ही किरीट में। यही संयम-भरा, दो हाथों वाला स्वरूप बिरजा को शेष सभी महिषमर्दिनी प्रतिमाओं से अलग करता है।',
        bodyEn:
          'Biraja is enshrined as Mahishamardini, but with two arms only — hers is held to be the country’s single dwibhuja image of the buffalo-slayer, where the goddess elsewhere is shown with eight arms or ten. With one hand she drives her spear into Mahishasura’s chest and with the other she pulls his tail; one foot rests on her lion and the other on the demon’s chest, and Mahishasura himself is carved plainly as a water buffalo. Her crown carries three marks together — Ganesha, the crescent moon and a linga — so that Shakti, Shiva and Ganapati stand in one headpiece. It is this restraint, a victory shown with two hands rather than ten, that sets Biraja apart from every other Mahishamardini.',
      },
      {
        id: 'parampara',
        titleHi: 'नाभि गया का पिंडदान',
        titleEn: 'The Pinda Offering at Nabhi Gaya',
        bodyHi:
          'मंदिर की सबसे विशिष्ट परम्परा नाभि गया का पिंडदान है — मुख्य द्वार से भीतर आते ही नाभि गया पड़ता है और उसके बाद देवी का गर्भगृह, इसलिए दर्शन से पहले ही पितरों का स्मरण हो जाता है। दिन भर यहाँ पिंड अर्पित कर नाभि-कूप में डाले जाते हैं; शिरो गया (गया), नाभि गया (जाजपुर) और पाद गया (पिठापुरम) — इन तीनों में श्राद्ध-कर्म करने की परम्परा है, और बहुत से परिवार तीनों को एक ही संकल्प में जोड़ते हैं। देवी के दर्शन प्रातः साढ़े पाँच से दोपहर डेढ़ बजे तक और फिर अपराह्न तीन से रात नौ बजे तक होते हैं। नवरात्र के अतिरिक्त प्रथमाष्टमी, पणा संक्रान्ति, रज पर्व, श्रावण और नवान्न भी यहाँ विशेष रूप से मनाए जाते हैं, जिनमें देवी को नए अन्न और ऋतु-फल अर्पित होते हैं।',
        bodyEn:
          'The observance that marks this temple is the pinda offering at Nabhi Gaya. Walking in from the main gate, a pilgrim reaches Nabhi Gaya before the goddess’s sanctum, so the ancestors are remembered before darshan is taken. Through the day pindas are offered and lowered into the Nabhi well; Shiro Gaya at Gaya, Nabhi Gaya here and Pada Gaya at Pithapuram together carry the shraddha rites, and many families resolve to complete all three. The goddess gives darshan from about 5.30 in the morning until 1.30 in the afternoon, and again from 3.00 until about 9.00 at night. Besides Navaratri, the temple keeps Prathamastami, Pana Sankranti, Raja Parva, Shravana and Navanna, when the new grain and the season’s fruit are set before her.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'बिरजा पीठ की शारदीय दुर्गा पूजा सोलह दिन चलती है और इसी से इसे षोडश दिनात्मक पूजा कहा जाता है — यह महालय से पहले कृष्ण पक्ष अष्टमी की रात्रि से आरम्भ होकर आश्विन शुक्ल नवमी को पूर्ण होती है, अर्थात् जहाँ अन्यत्र नौ रातें होती हैं वहाँ यहाँ पूरा पखवाड़ा और कुछ दिन और। उत्सव की रथयात्रा “सिंहध्वज” कहलाती है और उसके ध्वज पर सिंह अंकित रहता है, जो देवी के वाहन का चिह्न है। वर्ष के अन्य बड़े अवसर प्रथमाष्टमी, पणा संक्रान्ति, रज पर्व, श्रावण, नक्षत्र और नवान्न हैं, जिनमें जाजपुर नगर और आसपास के गाँवों से भारी संख्या में श्रद्धालु आते हैं। मंदिर की प्रतिष्ठा-तिथि दर्ज न होने से यहाँ कोई वार्षिक स्थापना-दिवस नहीं मनाया जाता, और किसी नियमित पदयात्रा-परम्परा का उल्लेख भी उपलब्ध स्रोतों में नहीं है।',
        bodyEn:
          'Durga Puja at Biraja Pitha runs for sixteen days, which is why it is called the Shodasha Dinatmaka Puja — it opens on the night of Krishna Paksha Ashtami before Mahalaya and closes on Ashwin Shukla Navami, so that where other shrines keep nine nights this one keeps a fortnight and more. The festival chariot is named Simhadhwaja and its flag bears a lion, the goddess’s own mount. The other great days of the year are Prathamastami, Pana Sankranti, Raja Parva, Shravana, Nakshatra and Navanna, which draw crowds from Jajpur town and the villages around it. Because no consecration date is recorded, the temple keeps no annual sthapana day, and the available sources describe no regular padyatra walked to the goddess.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर ओडिशा के जाजपुर ज़िले के जाजपुर नगर में वैतरणी नदी के तट पर है — भुवनेश्वर से लगभग 125 किमी उत्तर और कटक से लगभग 75 किमी। निकटतम रेलवे स्टेशन जाजपुर–क्योंझर रोड है, जो मंदिर से लगभग 32 किमी दूर पड़ता है और वहाँ से सड़क-मार्ग में लगभग एक घंटे से अधिक लगता है; कटक और भुवनेश्वर से नियमित बस-सेवा है, और निकटतम हवाई अड्डा भुवनेश्वर का बीजू पटनायक हवाई अड्डा है। नगर में ही वैतरणी के दक्षिण तट पर सप्तमातृका मंदिर और उससे लगा दशाश्वमेध घाट है, तथा पास ही बुढ़ा गणेश का मंदिर — तीर्थयात्री प्रायः स्नान, पिंडदान और देवी-दर्शन को एक ही दिन में जोड़ लेते हैं। यात्रा के लिए नवम्बर से फरवरी तक का समय सबसे अनुकूल माना जाता है, जब ओडिशा का मौसम ठंडा रहता है।',
        bodyEn:
          'The temple stands in Jajpur town, in Jajpur district of Odisha, on the bank of the Vaitarani — roughly 125 km north of Bhubaneswar and about 75 km from Cuttack. The nearest railhead is Jajpur–Keonjhar Road, approximately 32 km away, from where the road into town takes upwards of an hour; buses run regularly from Cuttack and Bhubaneswar, and the nearest airport is Biju Patnaik at Bhubaneswar. In the town itself, the Saptamatruka shrine sits on the south bank of the Vaitarani with the Dashaswamedha Ghat beside it and the Budha Ganesha temple close by, so pilgrims commonly fold the river bath, the pinda offering and darshan of the goddess into one day. November to February is reckoned the best season for the journey, when Odisha is at its coolest.',
      },
    ],
  },
  manikyamba: {
    significanceHi:
      'द्राक्षारामम की माणिक्यांबा देवी अष्टादश महाशक्ति पीठों में गिनी जाती हैं और भीमेश्वर स्वामी मंदिर के भीतरी प्राकार में विराजित हैं। जिस मंदिर-परिसर में वे बैठी हैं वह पूर्वी चालुक्य नरेश भीम द्वारा नवीं–दसवीं शताब्दी ईस्वी (लगभग विक्रम संवत् 913–1113) में बनवाया माना जाता है; देवी की प्रतिष्ठा की अपनी कोई तिथि या वार दर्ज नहीं है। यहाँ शिव और शक्ति को समान मान दिया जाता है — एक ही प्राकार में पंचारामों में से एक भीमेश्वर का लिङ्ग और अष्टादश पीठों में से एक देवी का गर्भगृह, दोनों के दर्शन एक साथ होते हैं।',
    significanceEn:
      'Manikyamba of Draksharama is counted among the eighteen Maha Shakti Peethas and is enshrined inside the inner prakara of the Bhimeswara Swamy temple. The complex she sits in is held to have been raised by the Eastern Chalukya king Bhima in the ninth and tenth centuries CE (roughly Vikram Samvat 913–1113); no separate date or weekday is recorded for her own consecration. Shiva and Shakti are given equal standing here — one enclosure holds both a Pancharama linga and a Peetha sanctum, and a pilgrim takes darshan of the two in a single visit.',
    originStoryHi:
      'शक्ति-पीठ परम्परा के अनुसार दक्ष-यज्ञ के पश्चात सती का वाम कपोल यहाँ गिरा और देवी माणिक्यांबा के नाम से पूजित हुईं। स्थान की दूसरी कथा आत्मलिङ्ग से जुड़ी है — मान्यता है कि यहाँ गिरे आत्मलिङ्ग के अंश को पवित्र करने के लिए सप्तर्षियों ने गोदावरी से यहाँ आने की प्रार्थना की। कहा जाता है कि सप्तर्षियों ने गोदावरी को सात धाराओं में बाँटा, जिनमें से भारद्वाज, विश्वामित्र और जमदग्नि की धाराएँ अन्तर्वाहिनी होकर भूमि के नीचे बहीं और आगे चलकर पुनः मिल गईं।',
    originStoryEn:
      'The Shakti Peeth tradition holds that Sati’s left cheek fell at this place after the Daksha yagna, and that the goddess has been worshipped here as Manikyamba ever since. A second account ties the site to the atma-linga: by tradition the Saptarishis asked the Godavari to come to Draksharama so that the fragment of the linga fallen here could be purified. The sages are said to have parted the river into seven streams, of which those of Bharadwaja, Vishwamitra and Jamadagni ran underground as antarvahinis before joining the others again.',
    sources: [
      {
        label: 'East Godavari District Administration - Lord Bhimeswara Swami Temple, Draksharama',
        url: 'https://eastgodavari.ap.gov.in/temples/lord-bhimeswara-swami-temple-draksharama/',
      },
      {
        label: 'APSRTC, Government of Andhra Pradesh - Famous Places: Draksharamam',
        url: 'https://www.apsrtc.ap.gov.in/fp_draksharamam.php',
      },
      {
        label: 'Daksharamam - Reference',
        url: 'https://en.wikipedia.org/wiki/Daksharamam',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'माणिक्यांबा देवी की प्रतिष्ठा का संवत्, तिथि अथवा वार किसी उपलब्ध अभिलेख में दर्ज नहीं मिलता; अष्टादश पीठों में उनका स्थान देवी भागवत और तंत्र-चूड़ामणि जैसी परम्परागत सूचियों से आता है। जिस भीमेश्वर मंदिर के भीतर वे विराजी हैं, उसका निर्माण पूर्वी चालुक्य नरेश भीम ने नवीं–दसवीं शताब्दी ईस्वी (लगभग विक्रम संवत् 913–1113) में कराया माना जाता है, और सन् 982 (विक्रम संवत् 1039) के एक शिलालेख में मंदिर का उल्लेख मिलता है — अर्थात् दसवीं शती के अंत तक यह स्थापित हो चुका था। परिसर में लगभग 381 शिलालेख हैं, जो भिन्न-भिन्न राजवंशों और दानदाताओं के हैं, और यह मंदिर भारतीय पुरातत्व सर्वेक्षण द्वारा संरक्षित स्मारक है। पत्थर से बना यह मंदिर चालुक्य और चोल शैली के मेल में खड़ा है; देवी का गर्भगृह इसी के भीतरी प्राकार में बना है, अलग मंदिर के रूप में नहीं।',
        bodyEn:
          'No available inscription or record gives the samvat, tithi or weekday on which Manikyamba was consecrated; her place among the eighteen Peethas descends from listing traditions such as the Devi Bhagavata and the Tantra Chudamani. The Bhimeswara temple that holds her is attributed to the Eastern Chalukya king Bhima in the ninth and tenth centuries CE (roughly Vikram Samvat 913–1113), and an inscription of 982 CE (Vikram Samvat 1039) already names the temple, so it stood before the tenth century closed. About 381 inscriptions survive in the complex, left by successive dynasties and donors, and the temple is a monument protected by the Archaeological Survey of India. Built in stone, it joins Chalukya and Chola manners of building; the goddess has her sanctum within its inner prakara rather than a shrine of her own outside it.',
      },
      {
        id: 'svarup',
        titleHi: 'माणिक्यांबा देवी का स्वरूप',
        titleEn: 'The Form of Manikyamba Devi',
        bodyHi:
          'देवी माणिक्यांबा आसन-मुद्रा में विराजित हैं और उनके हाथ में आत्मलिङ्ग है — खड़ी महिषमर्दिनी प्रतिमाओं से भिन्न यह बैठा हुआ, शान्त स्वरूप इस पीठ की पहचान है। उनकी दृष्टि सदा बाईं ओर रहती है, जिसे उपासक वाम-मार्ग की उपासना का चिह्न मानते हैं, और प्रतिमा के नीचे श्रीचक्र स्थापित है। परिसर के मुख्य देव भीमेश्वर स्वामी का लिङ्ग स्फटिक का बताया जाता है और लगभग 2.6 मीटर (लगभग नौ फुट) ऊँचा है; मंदिर दो मंज़िला है, इसलिए लिङ्ग के दर्शन दो तलों में फैले रहते हैं और ऊपरी तल तक दो सीढ़ी-मार्ग जाते हैं। भीतरी प्राकार का मंडप 108 स्तम्भों पर टिका है और प्रत्येक स्तम्भ पर सिंह-मुख उकेरा गया है, जबकि बाहरी प्राकार के चारों प्रवेश-द्वारों पर गोपुरम बने हैं।',
        bodyEn:
          'Manikyamba is seated, holding the atma-linga in her hand — a still, seated form rather than the standing buffalo-slayer of most Peethas, and it is the mark of this shrine. Her gaze is set always to the left, which worshippers read as the sign of Vama-marga observance, and a Srichakra is fixed below her image. The presiding Bhimeswara linga in the same enclosure is described as crystal, standing about 2.6 metres, close to nine feet; because the temple is built in two storeys, the darshan of the linga is spread across both floors, with two flights of stairs climbing to the upper level. The mandapa of the inner prakara rests on 108 pillars, each carved with a lion’s face, and the outer prakara opens through four gateways, every one of them crowned with a gopuram.',
      },
      {
        id: 'parampara',
        titleHi: 'श्रीचक्र अर्चना और आत्मलिङ्ग उपासना',
        titleEn: 'Srichakra Archana and the Atma-linga',
        bodyHi:
          'माणिक्यांबा की उपासना का केन्द्र उनके आसन के नीचे स्थापित श्रीचक्र है — कुंकुम-अर्चना और ललिता-नाम के पाठ इसी श्रीचक्र के समक्ष होते हैं, और देवी की वाम-दृष्टि को उपासक वाम-मार्ग की परम्परा से जोड़ते हैं। यहाँ की दूसरी विशेषता यह है कि शिव और शक्ति को समान आदर मिलता है: यात्री पहले भीमेश्वर स्वामी का अभिषेक-दर्शन करते हैं और फिर उसी भीतरी प्राकार में देवी के समक्ष अर्चना कराते हैं, दोनों एक ही प्रदक्षिणा में। मंदिर के पास सप्त गोदावरी कुंड है, जहाँ परम्परा के अनुसार सप्तर्षियों द्वारा बाँटी गई धाराएँ पुनः मिलती हैं, और यात्री दर्शन से पूर्व वहाँ स्नान करते हैं। किसी एक वार को यहाँ विशेष भीड़-दिवस के रूप में उपलब्ध स्रोतों में अलग से दर्ज नहीं किया गया; सबसे बड़ी भीड़ नवरात्र और शिवरात्रि पर रहती है।',
        bodyEn:
          'The heart of Manikyamba’s worship is the Srichakra set beneath her seat — kumkuma archana and the recitation of the goddess’s names are made before that yantra, and her leftward gaze is taken by worshippers as a mark of the Vama-marga tradition. The other thing that shapes practice here is the parity of Shiva and Shakti: pilgrims first attend the abhisheka of Bhimeswara Swamy and then have archana performed before the goddess in the same inner prakara, both within one circumambulation. Near the temple lies the Sapta Godavari Kundam, where by tradition the seven streams parted by the sages come together again, and pilgrims bathe there before taking darshan. The available sources name no particular weekday as the busiest — the crowds gather for Navaratri and for Shivaratri instead.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा उत्सव शारदीय नवरात्र है, जो आश्वयुज (आश्विन) शुक्ल प्रतिपदा से दशमी तक दस दिन चलता है और प्रत्येक दिन देवी को भिन्न अलंकार में सजाया जाता है। माघ मास की महाशिवरात्रि भीमेश्वर स्वामी का बड़ा पर्व है, जब पंचारामों की यात्रा करने वाले श्रद्धालु द्राक्षारामम में भी रुकते हैं और रात्रि-जागरण तथा अभिषेक होता है। दोनों अवसरों पर परिसर के दोनों गर्भगृह — शिव का और देवी का — एक साथ सजते हैं, जो यहाँ की समान-मान्यता की परम्परा का प्रत्यक्ष रूप है। प्रतिष्ठा-तिथि दर्ज न होने के कारण कोई वार्षिक स्थापना-दिवस नहीं मनाया जाता, और देवी तक किसी नियमित पदयात्रा-परम्परा का उल्लेख भी उपलब्ध स्रोतों में नहीं मिलता।',
        bodyEn:
          'The largest festival of the year is Sharada Navaratri, kept for ten days from Ashwayuja Shukla Pratipada to Dashami, with the goddess dressed in a different alankara on each day. Mahashivaratri in the month of Magha is the great night of Bhimeswara Swamy, when pilgrims making the round of the Pancharamas break their journey here for abhisheka and jagarana. On both occasions the two sanctums of the enclosure, Shiva’s and the goddess’s, are decorated together, which is the plainest expression of the parity this place is known for. Because no consecration date is recorded, the temple keeps no annual sthapana day, and the available sources describe no established padyatra to the goddess.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'द्राक्षारामम आंध्र प्रदेश के काकिनाडा ज़िले में है — काकिनाडा से लगभग 28 किमी, अमलापुरम से लगभग 25 किमी और राजमहेंद्रवरम से लगभग 50 किमी। द्राक्षारामम रेलवे स्टेशन मंदिर से लगभग 2 किमी दूर है; काकिनाडा और राजमहेंद्रवरम से नियमित बस तथा टैक्सी चलती हैं, और निकटतम हवाई अड्डा राजमहेंद्रवरम लगभग 53 किमी दूर है। यह मंदिर पंचाराम क्षेत्रों में से एक है, इसलिए यात्री इसे शेष चार — अमरावती का अमरेश्वर (अमराराम), भीमवरम का सोमेश्वर (सोमाराम), पालकोल्लु का क्षीर रामलिंगेश्वर (क्षीराराम) और सामरलकोट का कुमार भीमेश्वर (कुमाराराम) — के साथ एक ही यात्रा में जोड़ते हैं। परिसर के पास सप्त गोदावरी कुंड स्नान के लिए है, और लगभग 45–50 किमी दूर पिठापुरम की पुरुहूतिका देवी भी अष्टादश पीठों में हैं, जिन्हें कई यात्री इसी मार्ग में सम्मिलित कर लेते हैं।',
        bodyEn:
          'Draksharama lies in Kakinada district of Andhra Pradesh, about 28 km from Kakinada, roughly 25 km from Amalapuram and around 50 km from Rajahmundry. Draksharamam railway station is approximately 2 km from the temple; buses and taxis run regularly from Kakinada and Rajahmundry, and the nearest airport is Rajahmundry, some 53 km away. Because this is one of the Pancharama Kshetras, pilgrims commonly take it with the other four — Amareswara at Amaravati (Amararama), Someswara at Bhimavaram (Somarama), Ksheera Ramalingeswara at Palakollu (Ksheerarama) and Kumara Bhimeswara at Samalkot (Kumararama). The Sapta Godavari Kundam beside the temple serves for the bath, and Puruhutika Devi at Pithapuram, another of the eighteen Peethas, stands about 45–50 km off, which many travellers fold into the same route.',
      },
    ],
  },
  madhaveswari: {
    significanceHi:
      'प्रयागराज के अलोपीबाग़ में स्थित माधवेश्वरी — लोक में अलोपी देवी — त्रिवेणी संगम के निकट का वह शक्ति-तीर्थ है जहाँ किसी प्रतिमा की नहीं, एक काष्ठ-डोली की उपासना होती है। मंदिर की प्रतिष्ठा की तिथि, वार अथवा संवत् किसी उपलब्ध अभिलेख में दर्ज नहीं है; देवी की गणना अष्टादश महाशक्ति पीठों में “प्रयाग की माधवेश्वरी” के रूप में होती है, और कई सूचियाँ इन्हें इक्यावन शक्ति पीठों में भी गिनती हैं। संगम-स्नान के बाद प्रयाग-यात्रा का समापन परम्परागत रूप से इसी देवी के दर्शन से माना जाता है।',
    significanceEn:
      'Madhaveswari — known locally as Alopi Devi — stands in the Alopibagh quarter of Prayagraj, near the Triveni Sangam, and is the rare Shakti shrine where no image is worshipped but a wooden doli instead. No available record gives the samvat, tithi or weekday of its consecration; the goddess is counted in the eighteen Maha Shakti Peethas as the Madhaveswari of Prayaga, and several listings place her among the fifty-one Peethas as well. By the older sequence of the Prayag pilgrimage, a bath at the Sangam is completed by darshan of this goddess, so hers is the shrine the journey ends at.',
    originStoryHi:
      'परम्परा के अनुसार दक्ष-यज्ञ के पश्चात सती के देह का अंतिम अंश यहाँ आकर अलोप हो गया — दिखाई देना बंद हो गया — और इसी से देवी “अलोपी” कहलाईं। चूँकि यहाँ कोई अंग शेष नहीं रहा, इसलिए गर्भगृह में कोई प्रतिमा या चिह्न स्थापित नहीं किया गया; उसके स्थान पर एक कुंड के ऊपर लटकी काष्ठ-डोली ही देवी की उपस्थिति मानी गई। लोक-विश्वास कहता है कि जो अदृश्य है वही यहाँ पूज्य है, और भक्त उसी डोली की परिक्रमा कर अपनी प्रार्थना रखते हैं।',
    originStoryEn:
      'By tradition the last remaining part of Sati came to this spot after the Daksha yagna and simply vanished — alop — from which the goddess takes the name Alopi. Because nothing was left behind, no image and no carved mark were ever set in the sanctum; in their place a wooden doli hung above a small kund is taken to be the goddess’s presence. The faith of the place is that what cannot be seen is exactly what is worshipped here, and devotees circle that swing to lay their prayers before it.',
    sources: [
      {
        label: 'Uttar Pradesh Tourism - Alopi Devi, Prayagraj',
        url: 'https://uptourism.gov.in/en/article/alopi-devi-prayagraj',
      },
      {
        label: 'District Prayagraj, Government of Uttar Pradesh - Places of Interest',
        url: 'https://prayagraj.nic.in/places-of-interest/',
      },
      {
        label: 'Alopi Devi Mandir - Reference',
        url: 'https://en.wikipedia.org/wiki/Alopi_Devi_Mandir',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'अलोपी देवी मंदिर की प्रतिष्ठा किस संवत्, तिथि या वार में हुई और किसने कराई — यह किसी उपलब्ध अभिलेख, शिलालेख या मंदिर-दस्तावेज़ में दर्ज नहीं मिलता; उत्तर प्रदेश पर्यटन और प्रयागराज ज़िला प्रशासन दोनों इसे प्राचीन बताते हैं, पर कोई तिथि नहीं देते। इसका कारण स्वयं कथा में है: जहाँ अन्य पीठों की स्थापना सती के किसी अंग के गिरने से जुड़ी है, वहाँ यहाँ की मान्यता अंग के अलोप हो जाने की है, इसलिए न कोई अंग-चिह्न प्रतिष्ठित हुआ और न प्राण-प्रतिष्ठा का कोई दिन स्मरण में रहा। देवी का नाम माधवेश्वरी प्रयाग की माधव-परम्परा से जुड़ता है, जिसमें द्वादश माधव और वेणी माधव नगर के प्रमुख विष्णु-स्थान माने जाते हैं। किसी संस्थापक परिवार अथवा सेवा करती आ रही वंश-परम्परा का नाम भी उपलब्ध स्रोतों में दर्ज नहीं है।',
        bodyEn:
          'No available inscription, record or temple document names the samvat, tithi or weekday of the shrine’s consecration, nor who performed it; Uttar Pradesh Tourism and the Prayagraj district administration both call the temple ancient without fixing a date. The reason lies in the legend itself: where other Peethas are founded on a part of Sati having fallen, this one rests on a part having vanished, so no relic was ever installed and no day of pran-pratishtha stayed in memory. The name Madhaveswari ties the goddess to the Madhava tradition of Prayag, in which the twelve Madhavas and Veni Madhav are reckoned the city’s principal Vishnu seats. Neither a founding patron nor a serving family line is recorded for the shrine in the sources available.',
      },
      {
        id: 'svarup',
        titleHi: 'माधवेश्वरी देवी का स्वरूप',
        titleEn: 'The Form of Madhaveswari Devi',
        bodyHi:
          'गर्भगृह में न कोई मूर्ति है, न कोई तराशा हुआ चिह्न — केन्द्र में एक छोटा कुंड है और उसके ऊपर लकड़ी की डोली, अर्थात् पालकी, वस्त्र से ढकी और फूलों से सजी हुई लटकी रहती है। भक्त उसी डोली की परिक्रमा करते हैं और कुंड के जल को देवी के स्पर्श का स्थान मानते हैं; यही अभाव इस पीठ का स्वरूप है। भारत के शेष शक्ति पीठों में कहीं न कहीं देवी का रूप, अंग-चिह्न अथवा यंत्र प्रतिष्ठित मिलता है, जबकि यहाँ उपासना निराकार के निकट जाकर ठहरती है। डोली पर चढ़ाई गई चुनरी, चूड़ियाँ और सिन्दूर ही वह दृश्य सज्जा हैं जिनसे देवी का शृंगार होता है।',
        bodyEn:
          'The sanctum holds no murti and no carved mark. At its centre is a small stepped kund, and above the water hangs a wooden doli — a palanquin or cradle — draped in cloth and dressed with flowers. Devotees circumambulate that swing and treat the water of the kund as the place the goddess touched; the absence is itself the form here. Every other Shakti Peetha enshrines something — an image, a relic mark, a yantra — while at Alopibagh the worship stops just short of form altogether. What ornament the goddess has is what is offered onto the doli: chunri cloth, bangles and sindoor laid over the swing.',
      },
      {
        id: 'parampara',
        titleHi: 'काष्ठ-डोली की उपासना',
        titleEn: 'Worship of the Wooden Doli',
        bodyHi:
          'यहाँ की सबसे विशिष्ट परम्परा डोली की परिक्रमा और उस पर चुनरी चढ़ाना है — स्त्री-भक्त प्रायः चूड़ियाँ, सिन्दूर और चुनरी अर्पित करती हैं, और मनोकामना पूर्ण होने पर पुनः आकर नई चुनरी चढ़ाती हैं। नारियल, फूल-माला और प्रसाद अलोपीबाग़ की गलियों की दुकानों से लेकर चढ़ाए जाते हैं, जो मेले के दिनों में देर रात तक खुली रहती हैं। मंदिर सामान्यतः प्रातः लगभग पाँच बजे से रात नौ बजे तक खुला रहता है, और नवरात्र तथा माघ मेला-कुम्भ के दिनों में यह समय बढ़ा दिया जाता है। प्रयाग-यात्रा का शास्त्रीय क्रम संगम-स्नान, फिर वेणी माधव, फिर अक्षयवट और अंत में अलोपी देवी का बताया गया है, इसलिए बहुत से यात्री स्नान के बाद ही यहाँ पहुँचते हैं।',
        bodyEn:
          'The observance that defines this temple is the circling of the doli and the offering of a chunri onto it — women devotees commonly bring bangles, sindoor and the cloth, and return with a fresh chunri when a wish has been granted. Coconuts, garlands and prasad are bought from the lanes of Alopibagh, whose stalls stay open late through the mela weeks. The shrine is generally open from about five in the morning until nine at night, with those hours extended through Navratri and the Magh Mela and Kumbh season. The classical order of the Prayag pilgrimage runs from the bath at the Sangam to Veni Madhav, then the Akshayavat, and last to Alopi Devi, so a great many pilgrims arrive here still wet from the confluence.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा उत्सव शारदीय नवरात्र है, जब नौ दिन तक अलोपीबाग़ की गलियाँ श्रद्धालुओं से भरी रहती हैं; नवमी के दिन विशेष हवन और कुमारी पूजा होती है, जिसमें कन्याओं को देवी-स्वरूप मानकर भोजन कराया जाता है — नगर के घर-घर में यही कंजक-परम्परा निभाई जाती है। दूसरा बड़ा काल माघ मेला है, जो प्रतिवर्ष माघ मास में संगम-तट पर लगता है, और उसके साथ अर्ध कुम्भ तथा कुम्भ के वर्ष, जब प्रयागराज में स्नानार्थियों की भीड़ उमड़ती है और यह मंदिर उनके परिक्रमा-मार्ग का नियमित पड़ाव बन जाता है। चैत्र नवरात्र में भी दर्शन-क्रम चलता है, यद्यपि भीड़ शारदीय नवरात्र जितनी नहीं होती। मंदिर की स्थापना-तिथि दर्ज न होने से यहाँ कोई वार्षिक प्रतिष्ठा-दिवस नहीं मनाया जाता।',
        bodyEn:
          'The great festival of the year is Sharada Navratri, when the lanes of Alopibagh stay crowded for nine days; on Navami a special havan is held with kumari puja, in which young girls are honoured as the goddess and fed — the Kanjak custom kept in households across the city on the same day. The other season is the Magh Mela, held each year on the Sangam bank through the month of Magha, and with it the Ardh Kumbh and Kumbh years, when Prayagraj fills with bathers and this shrine becomes a fixed halt on their round of temples. Chaitra Navratri is observed too, though without the crowds of the autumn nine nights. Since no consecration date is recorded, the temple keeps no annual sthapana day.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर प्रयागराज ज़िले के अलोपीबाग़ मोहल्ले में है — प्रयागराज जंक्शन रेलवे स्टेशन से लगभग 6 किमी और त्रिवेणी संगम से लगभग 5 किमी। स्टेशन तथा सिविल लाइंस से ऑटो-रिक्शा और नगर-बसें मिलती हैं, और संगम क्षेत्र से यहाँ तक ऑटो से लगभग 15–20 मिनट लगते हैं; नगर का अपना हवाई अड्डा भी है। एक ही यात्रा में यहाँ के साथ दारागंज का वेणी माधव मंदिर, किले के भीतर पातालपुरी परिसर का अक्षयवट, संगम के निकट लेटे हनुमान (बड़े हनुमान) और दारागंज का ही नागवासुकि मंदिर जोड़े जाते हैं। दक्षिण के शक्ति-तीर्थों से भिन्न यहाँ कोई पर्वत-चढ़ाई या पदयात्रा-परम्परा नहीं है — संगम तक पहुँचना ही यात्रा है, और देवी का दर्शन उस स्नान का समापन। माघ और कुम्भ के दिनों में अलोपीबाग़ की गलियाँ पूरी रात खुली रहती हैं।',
        bodyEn:
          'The temple stands in the Alopibagh locality of Prayagraj district, roughly 6 km from Prayagraj Junction railway station and about 5 km from the Triveni Sangam. Auto-rickshaws and city buses run from the station and from Civil Lines, and the ride from the Sangam area takes some fifteen to twenty minutes; the city has its own airport as well. Pilgrims commonly take this shrine together with the Veni Madhav temple at Daraganj, the Akshayavat within the Patalpuri complex inside the fort, the reclining Lete Hanuman near the Sangam, and the Nagvasuki temple, also at Daraganj. Unlike the hill shrines of the south there is no climb and no padyatra tradition here — reaching the confluence is the journey, and darshan of the goddess is how that bath is closed. Through Magh and the Kumbh the lanes of Alopibagh stay awake all night.',
      },
    ],
  },
};

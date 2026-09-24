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
 * Temples still to author in this chunk: manikyamba madhaveswari
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
};

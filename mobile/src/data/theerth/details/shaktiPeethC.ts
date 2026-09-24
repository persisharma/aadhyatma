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
 * Temples still to author in this chunk: biraja manikyamba madhaveswari
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
};

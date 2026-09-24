import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Southern temple icons A.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: meenakshi konark-sun brihadeeswarar
 */
export const details: Record<string, TempleDetail> = {
  'tirupati-balaji': {
    significanceHi:
      'शेषाचलम् की सात पहाड़ियों पर बसे तिरुमला के श्री वेंकटेश्वर को परम्परा में कलियुग का प्रत्यक्ष देव कहा जाता है, और यह धाम आज विश्व के सबसे अधिक दर्शनार्थियों वाले तीर्थों में गिना जाता है। मंदिर की किसी एक प्रतिष्ठा-तिथि का अभिलेख नहीं मिलता — सबसे प्राचीन प्रमाण पल्लव रानी सामवै का सन् 966 (विक्रम संवत् 1023) का शिलालेख है, जिसमें भोग श्रीनिवास की चाँदी की प्रतिमा, आभूषण और ब्रह्मोत्सव हेतु भूमि-दान दर्ज है; ग्यारहवीं शताब्दी में रामानुजाचार्य ने यहाँ की सेवा-व्यवस्था को व्यवस्थित रूप दिया और सन् 1932 से तिरुमला तिरुपति देवस्थानम् (टीटीडी) इसका प्रबंध करता है।',
    significanceEn:
      'Sri Venkateswara of Tirumala, enshrined on the seven hills of the Seshachalam range, is revered in tradition as the visible Lord of the Kali Yuga, and the shrine today counts among the most visited pilgrimages in the world. No single consecration date survives for the temple — the oldest documentary evidence is the inscription of the Pallava queen Samavai dated 966 CE (Vikram Samvat 1023), recording her gift of a silver Bhoga Srinivasa image, ornaments and land endowments for the Brahmotsavam; Ramanujacharya is credited with formalising the temple rites in the eleventh century CE, and since 1932 the shrine has been administered by the Tirumala Tirupati Devasthanams (TTD).',
    originStoryHi:
      'वेंकटाचल माहात्म्य की कथा में विष्णु लक्ष्मी को खोजते हुए पृथ्वी पर आए और तिरुमला की पहाड़ी पर एक वल्मीक (दीमक की बाँबी) में निवास करने लगे। श्रीनिवास रूप में उन्होंने नारायणवनम् के राजा आकाशराज की पुत्री पद्मावती से विवाह किया, जिसके लिए उन्होंने कुबेर से ऋण लिया। परम्परा कहती है कि उसी ऋण को चुकाने के लिए वे कलियुग के अंत तक सप्तगिरि पर विराजमान रहेंगे — इसीलिए भक्त आज भी हुंडी में अर्पण करते हैं।',
    originStoryEn:
      'The Venkatachala Mahatmya tells that Vishnu came to earth in search of Lakshmi and took up residence in an anthill on the Tirumala hill. As Srinivasa he married Padmavati, daughter of King Akasharaja of Narayanavanam, borrowing from Kubera, the lord of wealth, to meet the cost of the wedding. By tradition it is to repay that debt that he remains on the Seven Hills until the end of the Kali Yuga — which is why devotees still make their offering into the temple hundi.',
    sources: [
      { label: 'Tirumala Tirupati Devasthanams — Temple Legend', url: 'https://www.tirumala.org/TempleLegend.aspx' },
      { label: 'TTD News — Brahmotsavams, a nine-day celestial spectacle', url: 'https://news.tirumala.org/brahmotsavams-a-nine-day-celestial-visual-spectacle/' },
      { label: 'Tirupati District, Government of Andhra Pradesh — Sri Vari Temple, Tirumala', url: 'https://tirupati.ap.gov.in/tourist-place/sri-vari-temple-tirumala/' },
      { label: 'Venkateswara Temple, Tirumala — Reference', url: 'https://en.wikipedia.org/wiki/Venkateswara_Temple,_Tirumala' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'तिरुमला के मूल विग्रह की कोई प्रतिष्ठा-तिथि अभिलेखों में दर्ज नहीं है; परम्परा उसे स्वयम्भू — स्वयं प्रकट — मानती है, और स्थल-कथा में पहला मंदिर तमिल राजा तोंडमान ने उस वल्मीक के ऊपर बनवाया जहाँ श्रीनिवास निवास कर रहे थे। ऐतिहासिक रूप से सबसे पुराना प्रमाण पल्लव रानी सामवै (श्री पेरुन्देवी) का सन् 966 (विक्रम संवत् 1023) का शिलालेख है, जो प्रथम प्राकार की उत्तरी भित्ति पर उत्कीर्ण है: उसमें भोग श्रीनिवास की लगभग एक फुट ऊँची चाँदी की प्रतिमा, आभूषण और उत्सवों के लिए भूमि-दान का उल्लेख है, और उसी लेख से सिद्ध होता है कि दसवीं शताब्दी में भी यहाँ ब्रह्मोत्सव होते थे। ग्यारहवीं शताब्दी में रामानुजाचार्य ने मंदिर की सेवा-परम्परा को व्यवस्थित किया, और आगे चोल, पाण्ड्य तथा विजयनगर शासकों ने विस्तार कराया। सन् 1517 (विक्रम संवत् 1574) में विजयनगर सम्राट कृष्णदेवराय ने स्वर्ण और रत्न भेंट किए, जिनसे आनन्द निलयम् विमान पर स्वर्ण-मढ़ाई हुई। सन् 1932 (विक्रम संवत् 1989) में तिरुमला तिरुपति देवस्थानम् का गठन हुआ, जो आज मंदिर का प्रबंध और सेवाएँ संचालित करता है।',
        bodyEn:
          'No inscription records a consecration date for the principal image at Tirumala; tradition holds it to be svayambhu, self-manifested, and the sthala-katha says the first shrine was raised by the Tamil king Tondaman over the anthill in which Srinivasa had settled. The earliest historical evidence is the inscription of the Pallava queen Samavai (Sri Perundevi) dated 966 CE (Vikram Samvat 1023), cut into the northern wall of the first prakaram: it records her gift of a silver image of Bhoga Srinivasa about a foot high, ornaments, and land endowments for the festivals, and it proves that the Brahmotsavam was already observed here in the tenth century. In the eleventh century Ramanujacharya is credited with formalising the temple’s ritual order, and Chola, Pandya and Vijayanagara rulers enlarged the complex in turn. In 1517 CE (Vikram Samvat 1574) the Vijayanagara emperor Krishnadevaraya gifted gold and jewels with which the Ananda Nilayam vimana was gilded. The Tirumala Tirupati Devasthanams was constituted in 1932 CE (Vikram Samvat 1989) and has administered the shrine and its sevas since.',
      },
      {
        id: 'svarup',
        titleHi: 'वेंकटेश्वर का स्वरूप',
        titleEn: 'The Form of Venkateswara',
        bodyHi:
          'गर्भगृह में मूल विग्रह ध्रुव बेर कहलाता है — अचल प्रतिमा, जो कभी स्थान नहीं छोड़ती; उत्सवों में मलयप्प स्वामी की उत्सव-मूर्ति बाहर निकलती है। श्यामवर्ण पाषाण की यह खड़ी (स्थानक) प्रतिमा चरण से मुकुट तक लगभग आठ फुट ऊँची है और लगभग डेढ़ फुट ऊँची पीठिका पर विराजित है। चार भुजाओं में ऊपरी दाहिने हाथ में सुदर्शन चक्र, ऊपरी बाएँ में पाञ्चजन्य शंख, निचला दाहिना हाथ वरद मुद्रा में और निचला बायाँ कटि पर टिका (कट्यवलम्बित) है। खुले वक्ष पर श्रीवत्स के पास व्यूह लक्ष्मी की बैठी हुई आकृति उकेरी है और तीन स्वर्ण-तारों का यज्ञोपवीत बाएँ कंधे से दाहिनी कटि तक जाता है; शीश पर रत्नजड़ित हीरे का मुकुट सबसे बड़ा आभूषण है। गर्भगृह के ऊपर स्वर्ण-मढ़ा आनन्द निलय दिव्य विमान उठता है, जिसकी सुनहरी चमक दूर से ही तिरुमला की पहचान है।',
        bodyEn:
          'The image in the sanctum is called the Dhruva Bera, the immovable one that never leaves its place; for processions the temple brings out the utsava-murti, Malayappa Swami. Carved in dark stone, the standing (sthanaka) figure rises about eight feet from foot to crown on a pedestal of roughly eighteen inches. Of its four arms, the upper right holds the Sudarshana chakra and the upper left the Panchajanya conch, while the lower right is raised in varada, the gesture of granting, and the lower left rests at the waist in katyavalambita. On the bare chest, beside the Srivatsa mark, is carved the seated figure of Vyuha Lakshmi, and a yajnopavita of three gold wires runs from the left shoulder to the right waist; the diamond crown, set with a great stone, is the largest of the ornaments. Above the sanctum rises the gilded Ananda Nilaya Divya Vimana, whose golden sheen is the sight by which Tirumala is known from far off.',
      },
      {
        id: 'parampara',
        titleHi: 'लड्डू प्रसादम् और मुंडन',
        titleEn: 'Laddu Prasadam and the Tonsure',
        bodyHi:
          'तिरुमला की सबसे पहचानी परम्परा श्रीवारि लड्डू है, जो मंदिर की पवित्र रसोई "पोटु" में बनता है; अभिलेखों में इसका आरम्भ सन् 1715 (विक्रम संवत् 1772) से माना जाता है और सन् 2009 में इसे भौगोलिक उपदर्शन (जीआई) टैग मिला। सैकड़ों पाचक प्रतिदिन इसे बनाते हैं और दर्शन के बाद हर भक्त को यही प्रसाद मिलता है। दूसरी बड़ी परम्परा मुंडन है — भक्त कल्याणकट्ट में अपने केश अर्पित करते हैं, जिसे अहंकार के त्याग और मनौती-पूर्ति का प्रतीक माना जाता है; यह विशेषकर उन परिवारों में निभाया जाता है जिनकी कोई कामना पूरी हुई हो। दिन की सेवा-क्रम प्रातः लगभग तीन बजे सुप्रभात सेवा से आरम्भ होकर तोमाल सेवा और अर्चना से बढ़ता है, सायं सहस्र दीपालंकरण सेवा होती है, और रात्रि में एकान्त सेवा (पवळिम्पु) के साथ पट बंद होते हैं। मंगलवार-बुधवार को कुछ सेवाओं के कारण दर्शन-समय छोटा रहता है, जबकि शनिवार को भीड़ सबसे अधिक रहती है।',
        bodyEn:
          'Tirumala’s best-known tradition is the Srivari laddu, made in the temple’s consecrated kitchen, the Potu; accounts date its introduction to 1715 CE (Vikram Samvat 1772), and in 2009 it received a Geographical Indication tag. Several hundred cooks, the pachakas, turn it out daily, and it is the prasadam every pilgrim carries away after darshan. The other great custom is the tonsure: devotees offer their hair at the Kalyanakatta, an act read as the surrender of vanity and, for many families, the completion of a vow. The day’s sevas open at about three in the morning with the Suprabhata Seva, move through Thomala Seva and archana, gather again in the evening for the Sahasra Deepalankarana Seva, and close at night with the Ekanta Seva, the laying of the Lord to rest. Darshan hours are shorter on Tuesdays and Wednesdays, when particular sevas occupy the sanctum, while Saturdays draw the heaviest crowds.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा उत्सव श्रीवारि ब्रह्मोत्सवम् है — नौ दिनों का महोत्सव, जो आश्विन मास में सूर्य के कन्या राशि में रहते मनाया जाता है और नवरात्रि के साथ चलता है। पहले दिन चित्रा नक्षत्र में ध्वजारोहण से आरम्भ होकर प्रतिदिन मलयप्प स्वामी विभिन्न वाहनों पर नगर-भ्रमण करते हैं; पाँचवें दिन की संध्या का गरुड़ सेवा सबसे बड़ा आकर्षण है, जिसमें लाखों श्रद्धालु उमड़ते हैं। उत्तराषाढ़ा नक्षत्र में रथोत्सव होता है और श्रवण नक्षत्र में — जिसे वेंकटेश्वर का जन्म-नक्षत्र माना जाता है — चक्रस्नान के साथ उत्सव पूर्ण होता है, फिर ध्वजावरोहण होता है। सामवै के सन् 966 के शिलालेख में पुरट्टासि और मार्गळि मासों के ब्रह्मोत्सवों का उल्लेख है, अर्थात् यह परम्परा एक सहस्राब्दी से अधिक पुरानी है।',
        bodyEn:
          'The year’s great festival is the Srivari Brahmotsavam, nine days kept in the month of Ashwayuja while the sun stands in Kanya, running alongside Navaratri. It opens with the Dhwajarohanam, the raising of the Garuda flag, under the star Chitta, and on each day Malayappa Swami is carried in procession on a different vahana; the Garuda Seva on the fifth evening is the largest draw, bringing lakhs of devotees to the hill in a single night. The Rathotsavam, the chariot procession, falls under Uttarashada, and the festival closes under Shravana — held to be Venkateswara’s birth star — with the Chakrasnanam, the bathing of the Sudarshana chakra in the temple tank, followed by the lowering of the flag. Samavai’s inscription of 966 CE already names Brahmotsavams in the months of Purattasi and Margazhi, which makes this a tradition of more than a thousand years.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'तिरुमला आंध्र प्रदेश के तिरुपति ज़िले में शेषाचलम् पहाड़ियों पर है; तिरुपति नगर से घाट मार्ग लगभग 19–21 किमी का है और उसमें इक्कीस तीखे मोड़ आते हैं। पैदल चढ़ने वाले भक्त अलीपिरि से सीढ़ियों का मार्ग लेते हैं, जो परम्परागत रूप से मनौती की यात्रा मानी जाती है। निकटतम रेलवे स्टेशन तिरुपति है, जो नगर के भीतर ही है; तिरुपति अन्तर्राष्ट्रीय हवाई अड्डा रेणिगुंटा में है, तिरुपति नगर से लगभग 15 किमी और तिरुमला से लगभग 28–32 किमी दूर। यात्रा तब पूर्ण मानी जाती है जब वेंकटेश्वर के दर्शन के बाद तिरुचानूर में श्री पद्मावती अम्मवारि के दर्शन किए जाएँ; तिरुपति नगर में श्री गोविन्दराजस्वामी मंदिर और विवाह-स्थली नारायणवनम् का कल्याण वेंकटेश्वर मंदिर भी प्रायः इसी यात्रा में जोड़े जाते हैं।',
        bodyEn:
          'Tirumala lies in Tirupati district of Andhra Pradesh, on the Seshachalam hills above the town of Tirupati; the ghat road up from the town runs roughly 19–21 km through twenty-one hairpin bends. Pilgrims who climb on foot take the stepped path from Alipiri, a walk traditionally undertaken in fulfilment of a vow. The nearest railhead is Tirupati station in the town itself; Tirupati International Airport is at Renigunta, about 15 km from Tirupati town and some 28–32 km from Tirumala. The yatra is held complete only when darshan of Venkateswara is followed by that of Sri Padmavati Ammavari at Tiruchanur, and most pilgrims also take in the Sri Govindarajaswami temple in Tirupati town and the Kalyana Venkateswara temple at Narayanavanam, remembered as the site of the divine wedding.',
      },
    ],
  },
};

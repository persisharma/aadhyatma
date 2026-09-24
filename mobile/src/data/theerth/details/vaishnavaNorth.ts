import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Northern Vaishnava shrines.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: vishnupad-gaya lakshmi-narayan
 */
export const details: Record<string, TempleDetail> = {
  'banke-bihari': {
    significanceHi:
      'वृंदावन का श्री बांके बिहारी मंदिर ब्रज की माधुर्य-भक्ति का सबसे व्यस्त धाम है, जहाँ ठाकुरजी की सेवा एक बालक की भाँति की जाती है। परम्परा के अनुसार यह विग्रह स्वामी हरिदास जी को निधिवन में प्राप्त हुआ और विक्रम संवत् 1921 (सन् 1864) में वर्तमान मंदिर बनने तक वहीं पूजित रहा। हर कुछ क्षण में गिरने वाला परदा, मंगला आरती का अभाव और वर्ष में एक ही दिन होने वाले चरण-दर्शन इस मंदिर की पहचान हैं।',
    significanceEn:
      'Shri Banke Bihari Mandir is the busiest shrine of Vrindavan’s madhurya bhakti, where the Thakur is served as a living child rather than as a distant king. By tradition the image came to Swami Haridas at Nidhivan and was worshipped there until the present temple was completed in Vikram Samvat 1921 (1864 CE). Its signatures are the curtain that falls every minute or two, the absence of a mangala aarti, and the single day each year on which the feet are uncovered.',
    originStoryHi:
      'परम्परा के अनुसार निधिवन में स्वामी हरिदास जी के संगीत से प्रसन्न होकर श्यामा-श्याम प्रत्यक्ष प्रकट हुए; भक्तों को उनका तेज असह्य लगा तो हरिदास जी की प्रार्थना पर दोनों एक त्रिभंग विग्रह में समा गए। स्वामी जी ने उसे कुंज बिहारी नाम से पूजा, और यही विग्रह आगे चलकर बांके बिहारी कहलाया। निधिवन में सेवा बढ़ती भीड़ के लिए छोटी पड़ने लगी तो स्वामी हरिदास जी की शिष्य-परम्परा के गोस्वामियों ने पास ही वर्तमान मंदिर बनाकर ठाकुरजी को वहाँ विराजमान किया।',
    originStoryEn:
      'Tradition holds that Shyama and Shyam appeared in person before Swami Haridas at Nidhivan, drawn by his singing, and that their radiance was more than the gathered devotees could bear. At Haridas Ji’s prayer the divine pair merged into a single tribhanga image, which he served under the name Kunj Bihari — the enjoyer of the groves — and which came to be called Banke Bihari. As pilgrim crowds outgrew the grove, the Goswamis descended from Haridas Ji’s disciples raised the present temple close by and installed the Thakur there.',
    sources: [
      {
        label: 'Shri Banke Bihari Mandir — Mandir History',
        url: 'https://www.bihariji.org/public/MandirHistory.aspx',
      },
      {
        label: 'District Mathura, Government of Uttar Pradesh — Shri Banke Bihari',
        url: 'https://mathura.nic.in/tourist-place/shri-banke-bihari/',
      },
      {
        label: 'Banke Bihari Temple — Reference',
        url: 'https://en.wikipedia.org/wiki/Banke_Bihari_Temple',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'स्वामी हरिदास जी सोलहवीं शताब्दी के ध्रुपद-गायक और वैष्णव संत थे, जिनका भजन-स्थल वृंदावन का निधिवन था; उनकी समाधि आज भी उसी वन में है। लोक-मान्यता है कि उनके संगीत से प्रसन्न होकर राधा-कृष्ण वहाँ प्रकट हुए और एक ही त्रिभंग विग्रह में समा गए — यही कुंज बिहारी, आगे बांके बिहारी। विग्रह की सेवा लम्बे समय तक निधिवन में ही हुई; उन्नीसवीं शताब्दी में जब दर्शनार्थियों की संख्या उस छोटे स्थल के लिए अधिक हो गई, तो स्वामी हरिदास जी की शिष्य-परम्परा के गोस्वामी परिवारों ने निधिवन से कुछ ही दूरी पर वर्तमान मंदिर बनवाया और विक्रम संवत् 1921 (सन् 1864) में ठाकुरजी को वहाँ विराजमान किया। मंदिर राजस्थानी शैली में बना है — मेहराबदार द्वार, ऊँचा प्रांगण और खुला सभामंडप। प्रतिष्ठा की तिथि और वार किसी आधिकारिक अभिलेख में दर्ज नहीं मिलते। आज भी मंदिर की सेवा-पूजा उन्हीं गोस्वामी परिवारों के वंशज करते हैं, जो अपनी परम्परा स्वामी हरिदास जी के शिष्यों से जोड़ते हैं।',
        bodyEn:
          'Swami Haridas was a sixteenth-century dhrupad singer and Vaishnava saint whose place of bhajan was Nidhivan in Vrindavan, where his samadhi still stands. Local tradition holds that Radha and Krishna appeared there, pleased by his music, and merged into the single tribhanga image he served as Kunj Bihari — later Banke Bihari. The image was worshipped in the grove itself for generations. By the nineteenth century the numbers coming for darshan had outgrown that small site, so the Goswami families descended from Haridas Ji’s disciples built the present temple a short walk away and installed the Thakur there in Vikram Samvat 1921 (1864 CE). The building follows a Rajasthani idiom — arched gateways, a raised court and an open assembly hall. No consecration tithi or weekday is recorded in any official account. Sewa at the temple is still carried out by the descendants of those Goswami families, who trace their line to Haridas Ji’s own disciples.',
      },
      {
        id: 'svarup',
        titleHi: 'बिहारीजी का स्वरूप',
        titleEn: 'The Form of Bihariji',
        bodyHi:
          'बांके बिहारी का विग्रह त्रिभंग मुद्रा में है — तीन स्थानों से बंकिम, इसी से "बांके" नाम पड़ा — और उसे राधा तथा कृष्ण के संयुक्त स्वरूप के रूप में पूजा जाता है। ठाकुरजी की सेवा बालक-भाव से होती है, इसलिए विग्रह को ऋतु के अनुसार वस्त्र, मुकुट और आभूषण धारण कराए जाते हैं और गर्भगृह में शीशे तथा चाँदी की सज्जा रहती है। बिहारीजी के चरण सामान्यतः वस्त्र से ढके रहते हैं और वर्ष में केवल अक्षय तृतीया को खुलते हैं; बाँसुरी भी वे केवल शरद पूर्णिमा पर धारण करते हैं, उस दिन विशेष मुकुट के साथ। गर्भगृह के आगे कोई स्थायी खुला दर्शन नहीं — परदा ही यहाँ का स्थायी उपकरण है।',
        bodyEn:
          'The Banke Bihari image stands in tribhanga, bent at three points — the bend that gives the name Banke — and is worshipped as the united form of Radha and Krishna. Because the Thakur is served in the mood of a child, he is dressed in seasonal garments, crowns and ornaments, and the sanctum is finished in silver work and mirrored inlay. His feet are ordinarily kept covered by cloth and are uncovered only on Akshaya Tritiya; the flute likewise appears in his hands only on Sharad Purnima, when he is crowned with a special mukut. There is no long, uninterrupted view of the sanctum here: the curtain is as much a part of the darshan as the image itself.',
      },
      {
        id: 'parampara',
        titleHi: 'झाँकी दर्शन और परदा',
        titleEn: 'Jhanki Darshan and the Curtain',
        bodyHi:
          'बांके बिहारी की सबसे विशिष्ट परम्परा झाँकी दर्शन है — सेवायत हर एक-दो मिनट में गर्भगृह का परदा गिराकर फिर खोलते हैं, जिससे दर्शन क्षण-क्षण की झलकों में होता है। मान्यता है कि बिहारीजी के नेत्रों का सौन्दर्य देर तक देखने पर भक्त उसमें खो जाता है, इसलिए यह परदा भक्त की रक्षा के लिए है। दूसरी विशेषता यह है कि यहाँ प्रतिदिन मंगला आरती नहीं होती — ठाकुरजी को बालक मानकर उन्हें भोर में जगाना उचित नहीं समझा जाता; वर्ष में केवल जन्माष्टमी की रात्रि को मंगला आरती होती है। दर्शन ग्रीष्म और शीत ऋतु के अनुसार दो पालियों में — प्रातः और सायं — खुलते हैं, और भोग-आरती के समय पट बंद रहते हैं।',
        bodyEn:
          'The temple’s defining custom is jhanki darshan: the sevayats let the sanctum curtain fall and lift it again every minute or two, so that the Thakur is seen in a series of brief glimpses rather than in one long gaze. The reason given is protective — the beauty of Bihariji’s eyes is held to overwhelm a devotee who looks too long. The second distinguishing custom is the absence of a daily mangala aarti: because the Thakur is served as a child, waking him at dawn is thought improper, and the lamps are waved at first light on one night of the year alone, Janmashtami. Darshan opens in a morning and an evening session whose hours shift between the summer and winter schedules, and the doors close while bhog is offered.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा उत्सव भाद्रपद कृष्ण अष्टमी की जन्माष्टमी है, जब मंदिर रातभर खुला रहता है और वर्ष की एकमात्र मंगला आरती होती है। वैशाख शुक्ल तृतीया (अक्षय तृतीया) पर चरण-दर्शन होते हैं और भक्त वर्षभर इसी दिन की प्रतीक्षा करते हैं। श्रावण शुक्ल तृतीया की हरियाली तीज पर ठाकुरजी हरे वस्त्रों में सोने-चाँदी के हिंडोले पर विराजते हैं और गर्भगृह से बाहर प्रांगण में झूलते हैं; श्रावण का पूरा झूलन-काल इसी रंग में बीतता है। आश्विन पूर्णिमा (शरद पूर्णिमा) पर बाँसुरी-धारी स्वरूप के दर्शन होते हैं, भाद्रपद शुक्ल अष्टमी को राधाष्टमी मनाई जाती है, और फाल्गुन में होली तथा धुलंडी पर ब्रज की रंग-परम्परा मंदिर प्रांगण तक आती है।',
        bodyEn:
          'The year’s greatest observance is Janmashtami on Bhadrapada Krishna Ashtami, when the temple stays open through the night and the one mangala aarti of the year is performed. On Akshaya Tritiya, Vaishakha Shukla Tritiya, the cloth is lifted from the Thakur’s feet — the single day of charan darshan that devotees wait all year for. Hariyali Teej on Shravan Shukla Tritiya brings him out of the sanctum in green robes to a gold and silver swing set up in the courtyard, and the swinging continues through the Jhulan season of Shravan. Sharad Purnima, the full moon of Ashwin, is the one day he holds the flute; Radhashtami falls on Bhadrapada Shukla Ashtami; and at Holi and Dhulandi in Phalguna the colour play of Braj reaches into the temple court itself.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर उत्तर प्रदेश के मथुरा ज़िले में वृंदावन की सँकरी गलियों के बीच है, जहाँ अंतिम दूरी प्रायः पैदल ही तय होती है। निकटतम रेलवे स्टेशन मथुरा जंक्शन है, जो लगभग 12–14 किमी दूर है; वृंदावन का अपना छोटा स्टेशन भी है। निकटतम हवाई अड्डे आगरा (लगभग 70 किमी) और दिल्ली (लगभग 150 किमी) हैं, और दिल्ली–आगरा राजमार्ग से मथुरा होते हुए वृंदावन पहुँचा जाता है। पास ही राधा रमण मंदिर लगभग 300 मीटर और निधिवन कुछ ही क़दम आगे है — बिहारीजी के प्राकट्य-स्थल के कारण अधिकांश यात्री दोनों को एक ही दर्शन-क्रम में जोड़ते हैं। राधावल्लभ, गोविंद देव और राधा दामोदर मंदिर भी इसी परिक्रमा में आते हैं, और व्यापक ब्रज चौरासी कोस यात्रा में वृंदावन एक प्रमुख पड़ाव है।',
        bodyEn:
          'The temple sits deep in the lanes of Vrindavan, in Mathura district of Uttar Pradesh, and the last stretch is usually covered on foot. Mathura Junction, roughly 12–14 km away, is the main railhead, with a smaller station at Vrindavan itself. The nearest airports are Agra, about 70 km off, and Delhi, about 150 km, with the approach running from the Delhi–Agra highway through Mathura. Radha Raman temple stands about 300 m away and Nidhivan a short walk beyond it, and because Nidhivan is where Bihariji is said to have appeared, most pilgrims take the two in one sequence. Radha Vallabh, Govind Dev and Radha Damodar fall on the same round, and Vrindavan is a principal halt on the wider Braj Chaurasi Kos yatra.',
      },
    ],
  },
  srinathji: {
    significanceHi:
      'नाथद्वारा का श्रीनाथजी पुष्टिमार्ग का प्रधान पीठ है, जहाँ ठाकुरजी की सेवा मंदिर की नहीं, हवेली की रीति से — एक घर के बालक की भाँति — होती है। गिरिराज गोवर्धन उठाए सात वर्ष के कृष्ण का यह स्वरूप विक्रम संवत् 1728 (सन् 1672) में सिंहाड़ गाँव में प्रतिष्ठित हुआ और वही बस्ती आगे नाथद्वारा कहलाई। दिन की आठ झाँकियाँ, ऋतु के अनुसार बदलता श्रृंगार और पीछवाई-चित्रण इस धाम की पहचान हैं।',
    significanceEn:
      'Srinathji at Nathdwara is the principal seat of the Pushtimarg, where the Thakur is served not as a temple deity but in the manner of a haveli — as the child of a household. This form of Krishna at seven, holding up Govardhan, was installed in Vikram Samvat 1728 (1672 CE) at the village of Sinhad, and the settlement around it became Nathdwara. Eight darshan windows through the day, a shringar that changes with the season, and the pichhwai paintings behind the image are what mark this shrine.',
    originStoryHi:
      'परम्परा के अनुसार श्रीनाथजी का स्वरूप ब्रज में गोवर्धन पर्वत से स्वयं प्रकट हुआ और वल्लभाचार्य के पुत्र श्री विट्ठलनाथ जी ने उसे श्रीनाथजी नाम देकर सेवा-पद्धति स्थापित की। सत्रहवीं शताब्दी में संकट की आशंका से गोस्वामी परिवार विग्रह को ब्रज से निकालकर आगरा, किशनगढ़ और मारवाड़ होते हुए मेवाड़ लाया, जहाँ महाराणा राजसिंह ने आश्रय दिया। बनास तट के सिंहाड़ गाँव के पास रथ आगे न बढ़ा; इसे संकेत मानकर वहीं सेवा स्थापित हुई और वह स्थान नाथद्वारा — "नाथ का द्वार" — हो गया।',
    originStoryEn:
      'By tradition the swarup of Srinathji revealed itself from Govardhan Hill in Braj, and Shri Vitthalnath Ji, son of Vallabhacharya, gave it the name Srinathji and settled the pattern of its service. In the seventeenth century, fearing for its safety, the Goswami family carried the image out of Braj through Agra, Kishangarh and Marwar into Mewar, where Maharana Raj Singh offered protection. Near the village of Sinhad on the Banas the cart would go no further; taking that as the deity’s own choice, the household settled there, and the place became Nathdwara, the gateway of the Nath.',
    sources: [
      {
        label: 'Shrinathji Temple, Nathdwara — Official',
        url: 'https://www.nathdwaratemple.org/',
      },
      {
        label: 'Rajasthan Tourism — Rajsamand',
        url: 'https://www.tourism.rajasthan.gov.in/rajsamand.html',
      },
      {
        label: 'Shrinathji Temple — Reference',
        url: 'https://en.wikipedia.org/wiki/Shrinathji_Temple',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'पुष्टिमार्ग की स्थापना श्री वल्लभाचार्य ने की और उनके पुत्र श्री विट्ठलनाथ जी ने गोवर्धन के इस स्वरूप को श्रीनाथजी नाम देकर जतीपुरा में सेवा-क्रम बाँधा। सत्रहवीं शताब्दी के उत्तरार्ध में गोस्वामी परिवार ने विग्रह को ब्रज से हटाने का निर्णय लिया; यात्रा लगभग सन् 1669 में आरम्भ हुई, आगरा में कई महीने विश्राम हुआ, और फिर किशनगढ़-मारवाड़ होते हुए रथ मेवाड़ पहुँचा। मेवाड़ के महाराणा राजसिंह ने रक्षा का वचन दिया, इसी आश्वासन पर विग्रह मेवाड़ की सीमा में लाया गया। बनास नदी के निकट सिंहाड़ गाँव में रथ के पहिये धँस गए और आगे न बढ़े; परम्परा इसे ठाकुरजी की इच्छा मानती है। वहीं विक्रम संवत् 1728 (सन् 1672) में सेवा स्थापित हुई — तिथि और वार का कोई प्रामाणिक अभिलेख नहीं मिलता, यद्यपि कुछ वृत्तांत मार्च 1672 का उल्लेख करते हैं। मंदिर गोस्वामी दामोदरदास जी ने बनवाया, जिन्हें दाऊजी महाराज कहा जाता है; उनके सहयोगी श्री हरिरायजी थे। आज भी सेवा-अधिकार वल्लभाचार्य के वंशजों के पास है, जिनके मुख्य प्रतिनिधि तिलकायत कहलाते हैं।',
        bodyEn:
          'The Pushtimarg was founded by Shri Vallabhacharya, and it was his son Shri Vitthalnath Ji who named the Govardhan swarup Srinathji and fixed the order of its service at Jatipura. In the later seventeenth century the Goswami household decided to move the image out of Braj; the journey began around 1669 CE, paused for several months at Agra, and then went on through Kishangarh and Marwar into Mewar. Maharana Raj Singh of Mewar pledged protection, and on that pledge the image crossed into his territory. At the village of Sinhad near the Banas the cart wheels sank and would not move, which tradition reads as the Thakur choosing his own ground. Service was established there in Vikram Samvat 1728 (1672 CE); no consecration tithi or weekday survives in an authoritative record, though some accounts place the installation in March 1672. The building was raised by Goswami Damodardas, known as Dauji Maharaj, assisted by Shri Hariraiji. The right of service still rests with the descendants of Vallabhacharya, whose senior representative carries the title Tilkayat.',
      },
      {
        id: 'svarup',
        titleHi: 'श्रीनाथजी का स्वरूप',
        titleEn: 'The Form of Srinathji',
        bodyHi:
          'श्रीनाथजी की प्रतिमा काले पाषाण के एक ही खंड से उभरी हुई है — बाईं भुजा ऊपर उठी हुई, मानो गोवर्धन थामे हों, और दाहिना हाथ मुट्ठी बाँधे कमर पर टिका है। अधर के नीचे एक बड़ा हीरा जड़ा है, और शिला पर गाय, सिंह, सर्प, मोर और शुक के अंकन तथा समीप तीन ऋषि-आकृतियाँ उकेरी हैं। भाव सात वर्ष के बालक का है, इसलिए पूरा विधान बालक-सेवा का है। यह भवन शिखरबद्ध मंदिर नहीं, हवेली है — रसोई, भंडार, गौशाला और आँगन सहित एक गृहस्थ-व्यवस्था, जिसमें ठाकुरजी गृह-स्वामी हैं। विग्रह के पीछे लगी पीछवाई ऋतु और उत्सव के साथ बदलती है; नाथद्वारा की यही चित्र-परम्परा देश भर में प्रसिद्ध हुई।',
        bodyEn:
          'The image is worked in relief out of a single block of dark stone: the left arm lifted as if bearing Govardhan, the right hand closed in a fist at the waist. A large diamond is set below the lip, and the slab carries carved cows, a lion, a serpent, peacocks and a parrot, with three sage figures placed near it. The mood is that of a boy of seven, and the whole order of worship follows from that. The building is not a spired temple but a haveli — a household with kitchen, stores, cow-byre and courtyards, in which the Thakur is the master of the house. Behind the image hangs a pichhwai cloth that is changed with the season and the festival; this is the painting tradition for which Nathdwara became known across India.',
      },
      {
        id: 'parampara',
        titleHi: 'अष्ट झाँकी और ऋतु-श्रृंगार',
        titleEn: 'The Eight Jhankis and Seasonal Shringar',
        bodyHi:
          'दिन भर में आठ झाँकियाँ होती हैं — मंगला, श्रृंगार, ग्वाल, राजभोग, उत्थापन, भोग, संध्या आरती और शयन। हर झाँकी थोड़ी देर की रहती है, क्योंकि मान्यता है कि बालक-स्वरूप ठाकुरजी को देर तक खड़ा रहना थका देता है; पट खुलते और बंद होते रहते हैं। मंगला में शंख-ध्वनि से जगाया जाता है, श्रृंगार में वस्त्र-आभूषण धारण होते हैं, ग्वाल में दूध, खीर और रबड़ी का भोग लगता है, और राजभोग दिन का सबसे विस्तृत दर्शन है। समय ऋतु के साथ बदलता है — ग्रीष्म में ठाकुरजी देर से जगाए जाते हैं, शीत में जल्दी शयन कराकर भोर में उठाया जाता है और अंगीठी तथा रजाई का प्रबंध होता है। श्रृंगार, भोग और पीछवाई — तीनों ऋतु और उत्सव के अनुसार बदलते हैं, यही पुष्टिमार्गीय सेवा का मर्म है।',
        bodyEn:
          'The day is divided into eight jhankis — Mangala, Shringar, Gwal, Rajbhog, Utthapan, Bhog, Sandhya Aarti and Shayan. Each is short, because a child is not made to stand for long; the doors open and close again through the day. At Mangala he is woken with conch sound, at Shringar dressed and ornamented, at Gwal offered milk, kheer and rabdi, and Rajbhog is the fullest darshan of the day. The hours shift with the season: in summer he is woken later, in winter put to bed early and roused at first light, with a brazier and quilt arranged against the cold. Garments, food and the pichhwai behind him all change with the season and the festival — that correspondence is the heart of Pushtimarg seva.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा उत्सव अन्नकूट है, जो कार्तिक शुक्ल प्रतिपदा को दीपावली के अगले दिन गोवर्धन पूजा के रूप में मनाया जाता है; इस दिन ठाकुरजी को छप्पन भोग सहित अन्न का पर्वत अर्पित किया जाता है और नाथद्वारा में लाखों दर्शनार्थी आते हैं। भाद्रपद कृष्ण अष्टमी की जन्माष्टमी और उसके अगले दिन नंदमहोत्सव हवेली की सबसे उल्लासपूर्ण रात्रि होते हैं। फाल्गुन में डोल-होली का लम्बा उत्सव चलता है, जिसमें गुलाल और रंग-सज्जा के साथ विशेष श्रृंगार होते हैं, और दीपावली पर हवेली दीपों से सजती है। शरद पूर्णिमा, वसंत पंचमी और झूलन जैसे ऋतु-पर्व भी अपनी-अपनी झाँकियों के साथ मनाए जाते हैं।',
        bodyEn:
          'The greatest observance of the year is Annakut, kept on Kartik Shukla Pratipada, the day after Diwali, as Govardhan Puja: a mountain of grain with the chhappan bhog of fifty-six items is raised before the Thakur, and Nathdwara fills with lakhs of pilgrims. Janmashtami on Bhadrapada Krishna Ashtami and the Nandmahotsav that follows it are the most exuberant nights in the haveli. Phalguna brings a long season of Dol and Holi, with gulal and special shringar for each day, and at Diwali the haveli is lit end to end. Seasonal festivals such as Sharad Purnima, Vasant Panchami and the Jhulan swings are each marked with their own jhankis.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'नाथद्वारा राजस्थान के राजसमंद ज़िले में अरावली की पहाड़ियों के बीच बनास नदी के किनारे बसा है, उदयपुर से लगभग 48 किमी उत्तर-पूर्व। निकटतम बड़े रेलवे स्टेशन मावली जंक्शन (लगभग 30 किमी) और उदयपुर सिटी (लगभग 50 किमी) हैं; निकटतम हवाई अड्डा उदयपुर का महाराणा प्रताप हवाई अड्डा है। सड़क मार्ग से उदयपुर–अजमेर मार्ग पर यह नगर पड़ता है, इसलिए अधिकांश यात्री इसे उदयपुर-यात्रा के साथ जोड़ते हैं। पास ही एकलिंगजी का शिव मंदिर लगभग 27 किमी दूर है, और राजसमंद झील के किनारे कांकरोली का द्वारकाधीश मंदिर — जो पुष्टिमार्ग की ही एक अन्य पीठ है — प्रायः इसी यात्रा में जोड़ा जाता है। हल्दीघाटी का ऐतिहासिक स्थल भी निकट पड़ता है।',
        bodyEn:
          'Nathdwara stands in Rajsamand district of Rajasthan, among the Aravalli hills on the bank of the Banas, roughly 48 km north-east of Udaipur. The main railheads are Mavli Junction, about 30 km off, and Udaipur City, about 50 km; the nearest airport is Maharana Pratap Airport at Udaipur. The town lies on the Udaipur–Ajmer road, so most visitors take it together with Udaipur. The Shiva temple of Eklingji is about 27 km away, and the Dwarkadhish temple at Kankroli on the shore of Rajsamand lake — another seat of the same Pushtimarg tradition — is commonly paired with this darshan. The historic field of Haldighati also lies within easy reach.',
      },
    ],
  },
};

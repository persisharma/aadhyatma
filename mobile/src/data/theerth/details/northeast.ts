import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — North-eastern shrines.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: kirateshwar
 */
export const details: Record<string, TempleDetail> = {
  'govindajee-imphal': {
    significanceHi:
      'इम्फाल पूर्वी ज़िले में पुराने राजमहल से सटा श्री गोविंदजी मंदिर मणिपुर का सबसे बड़ा वैष्णव मंदिर है, जहाँ राधा के साथ गोविंदजी (कृष्ण) राजवंश के इष्टदेव रूप में पूजे जाते हैं। वर्तमान मंदिर महाराजा नर सिंह ने 16 जनवरी 1846 (विक्रम संवत् 1902) को आरम्भ कराया; सन् 1868 (विक्रम संवत् 1925) के भूकम्प में क्षति के बाद महाराजा चन्द्रकीर्ति के शासनकाल में इसे उसी रूप में पुनर्निर्मित कर 26 अप्रैल 1876 (विक्रम संवत् 1933) को पुनः प्रतिष्ठित किया गया। मणिपुरी रासलीला और नट-संकीर्तन की परम्परा का केन्द्र होने के कारण यह मंदिर राज्य की भक्ति और नृत्य-संस्कृति दोनों का मूल है।',
    significanceEn:
      'Standing beside the old royal palace in Imphal East district, Shree Govindajee is the largest Vaishnava temple in Manipur, where Govindajee (Krishna) with Radha is worshipped as the deity of the Meitei royal house. The present temple was raised by Maharaja Nara Singh from 16 January 1846 (Vikram Samvat 1902); after the earthquake of 1868 (Vikram Samvat 1925) damaged it, it was rebuilt to the same design in the reign of Maharaja Chandrakirti and reconsecrated on 26 April 1876 (Vikram Samvat 1933). As the home of the Manipuri Ras Lila and of Nata Sankirtana, the temple anchors both the devotional and the dance traditions of the state.',
    originStoryHi:
      'परम्परा के अनुसार अठारहवीं शताब्दी में महाराजा भाग्यचन्द्र (जय सिंह) को स्वप्न में कृष्ण का आदेश मिला कि काइना पहाड़ी के एक कटहल वृक्ष से उनकी प्रतिमा गढ़ी जाए। उसी वृक्ष से सात विग्रह बनाए गए, जो मणिपुर और निकटवर्ती असम के अलग-अलग मंदिरों में प्रतिष्ठित हुए; गोविंदजी की प्रतिमा का निर्माण सन् 1776 में आरम्भ होकर नवम्बर 1779 (विक्रम संवत् 1836) की पूर्णिमा को महाराजा के महल-मंदिर में प्रतिष्ठित हुआ। कालान्तर में राजधानी के साथ यह सेवा इम्फाल आई, जहाँ महाराजा नर सिंह ने महल से लगा वर्तमान मंदिर बनवाया।',
    originStoryEn:
      'By tradition, in the eighteenth century Maharaja Bhagyachandra (Jai Singh) was instructed in a dream to have Krishna’s image carved from a jackfruit tree on Kaina hill. Seven images are said to have been cut from that one tree and enshrined in different temples across Manipur and neighbouring Assam; the carving of Govindajee was begun in 1776 and the image was consecrated on a full-moon day in November 1779 (Vikram Samvat 1836) in the shrine within the king’s own palace. As the capital moved, the worship travelled with it to Imphal, where Maharaja Nara Singh built the present temple against the palace wall.',
    sources: [
      {
        label: 'Imphal East District, Government of Manipur — Shree Shree Govindajee Temple',
        url: 'https://imphaleast.nic.in/tourist-place/shree-shree-govindajee-temple/',
      },
      {
        label: 'Manipur Tourism — Culture and Heritage',
        url: 'https://manipurtourism.gov.in/culture-and-heritage/',
      },
      {
        label: 'Incredible India (Ministry of Tourism) — Shree Shree Govindajee Temple, Imphal',
        url: 'https://www.incredibleindia.gov.in/en/manipur/imphal/shree-shree-govindajee-temple',
      },
      {
        label: 'Sankirtana, ritual singing, drumming and dancing of Manipur — UNESCO ICH',
        url: 'https://ich.unesco.org/en/RL/sankirtana-ritual-singing-drumming-and-dancing-of-manipur-00843',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'कथा भाग्यचन्द्र (जय सिंह) से आरम्भ होती है, जिन्होंने अठारहवीं शताब्दी में गौड़ीय वैष्णव परम्परा को राज्य में प्रतिष्ठा दी। परम्परा कहती है कि स्वप्नादेश पाकर उन्होंने काइना पहाड़ी के कटहल वृक्ष से विग्रह गढ़वाए — सन् 1776 में काम आरम्भ हुआ और नवम्बर 1779 (विक्रम संवत् 1836) की पूर्णिमा को गोविंदजी महल-मंदिर में विराजे। उसी अवसर पर महाराजा ने पहली रासलीला प्रस्तुत करवाई, जिससे मणिपुरी रास-नृत्य की परम्परा जन्मी। राजधानी बदलने के साथ गोविंदजी की सेवा भी स्थानान्तरित होती रही; इम्फाल में महाराजा नर सिंह ने राजमहल से सटा वर्तमान मंदिर 16 जनवरी 1846 (विक्रम संवत् 1902) को आरम्भ कराया और गोविंदजी को अपने कुल-देव रूप में प्रतिष्ठित किया। सन् 1868 (विक्रम संवत् 1925) के भीषण भूकम्प ने मंदिर और उसके विग्रह-गृह को भारी क्षति पहुँचाई। महाराजा चन्द्रकीर्ति (शासनकाल 1859–1886) के समय इसे मूल रूपरेखा में ही पुनर्निर्मित किया गया और 26 अप्रैल 1876 (विक्रम संवत् 1933) को पुनः प्रतिष्ठा हुई — यही तिथि आज के मंदिर की स्थापना-तिथि मानी जाती है। मंदिर की सेवा-व्यवस्था राजवंश से जुड़ी रही और आज भी मणिपुर के वैष्णव ब्राह्मण तथा मंदिर बोर्ड मिलकर नित्य पूजा संचालित करते हैं।',
        bodyEn:
          'The story begins with Bhagyachandra (Jai Singh), the eighteenth-century Meitei king under whom Gaudiya Vaishnavism took root as the faith of the court. Tradition holds that, following a dream, he had images carved from a jackfruit tree on Kaina hill: the work began in 1776 and Govindajee was enshrined in the palace temple on a full-moon day in November 1779 (Vikram Samvat 1836). At that consecration the king is said to have staged the first Ras Lila, and from it the Manipuri Ras dance tradition descends. As the capital shifted, the service of Govindajee moved with it; at Imphal, Maharaja Nara Singh began the present temple against the palace wall on 16 January 1846 (Vikram Samvat 1902) and installed Govindajee as the deity of his house. The great earthquake of 1868 (Vikram Samvat 1925) badly damaged the structure and its image-chambers. In the reign of Maharaja Chandrakirti (1859–1886) the temple was rebuilt to its original design and reconsecrated on 26 April 1876 (Vikram Samvat 1933) — the date kept as the founding of the temple that stands today. Its administration has stayed tied to the royal household, and the daily worship is carried on by Manipur’s Vaishnava Brahmin families together with the temple board.',
      },
      {
        id: 'svarup',
        titleHi: 'गोविंदजी का स्वरूप',
        titleEn: 'The Form of Govindajee',
        bodyHi:
          'गर्भगृह के मध्य कक्ष में गोविंदजी राधा के साथ विराजित हैं, और परम्परा के अनुसार यह युगल-विग्रह काइना के कटहल-काष्ठ से गढ़ा गया है — यही इसे उत्तर भारत के धातु या पाषाण विग्रहों से अलग करता है। गर्भगृह के दोनों ओर दो और कक्ष हैं: एक में बलभद्र और कृष्ण, दूसरे में जगन्नाथ, सुभद्रा और बलभद्र प्रतिष्ठित हैं — इसी से मंदिर की रथयात्रा परम्परा जुड़ती है। बाहरी बनावट सादी है: सोने की परत चढ़े दो गुम्बद, पत्थर जड़ा विस्तृत प्रांगण और उसके सामने ऊँचा उठा हुआ मण्डप, जिसमें सैकड़ों भक्त संकीर्तन के लिए बैठते हैं। यह मण्डप ही मंदिर का हृदय है — यहीं पुङ (ढोल), करताल और मोइबुङ (शंख) की ध्वनि पर नट-संकीर्तन और रासलीला होती है।',
        bodyEn:
          'In the central chamber of the sanctum Govindajee stands with Radha, and by tradition this pair was carved from the jackfruit wood of Kaina — which sets it apart from the metal and stone images of the north Indian shrines. Two further chambers flank it: Balabhadra with Krishna in one, and Jagannath, Subhadra and Balabhadra in the other, the group from which the temple’s own chariot festival follows. The exterior is deliberately plain — two gold-plated domes, a wide paved court, and before it a high raised mandapa where hundreds of devotees can sit for sankirtana. That hall is the working heart of the temple: it is where the pung drum, the kartal cymbals and the moibung conch sound for Nata Sankirtana and for the Ras Lila.',
      },
      {
        id: 'parampara',
        titleHi: 'रासलीला और नट-संकीर्तन',
        titleEn: 'Ras Lila and Nata Sankirtana',
        bodyHi:
          'गोविंदजी मंदिर की सबसे विशिष्ट परम्परा नृत्य और संकीर्तन के रूप में भक्ति है। मण्डप में गायक-वादकों का दल पुङ, करताल और मोइबुङ के साथ राधा-कृष्ण की लीलाओं का गान करता है; इसी नट-संकीर्तन को यूनेस्को ने दिसम्बर 2013 में मानवता की अमूर्त सांस्कृतिक धरोहर की प्रतिनिधि सूची में दर्ज किया। रासलीला यहाँ मनोरंजन नहीं, अनुष्ठान है — नर्तकियाँ व्रत और शुद्धि के बाद ही मण्डप में प्रवेश करती हैं, और प्रस्तुति रातभर चलती है। दैनिक क्रम में प्रातःकालीन आरती से दर्शन आरम्भ होकर दोपहर में विश्राम के लिए पट बंद होते हैं और सायंकाल फिर खुलते हैं; उत्सवों पर भक्तों को खेचड़ी (खिचड़ी) प्रसाद रूप में बाँटी जाती है। मंदिर परिसर में दिनभर मणिपुरी वैष्णव परिवार सामूहिक संकीर्तन के लिए आते-जाते रहते हैं।',
        bodyEn:
          'What most distinguishes Govindajee is that its devotion is performed — sung, drummed and danced. In the mandapa a company of singers and players carries the līlās of Radha and Krishna on the pung drum, kartal cymbals and moibung conch; this Nata Sankirtana was inscribed by UNESCO on the Representative List of the Intangible Cultural Heritage of Humanity in December 2013. The Ras Lila here is liturgy rather than performance: the dancers observe fast and purification before entering the hall, and a full cycle runs through the night. Through the ordinary day darshan opens with the morning aarti, the doors close for the deity’s midday rest and open again in the evening; on festival days khechri, a consecrated rice-and-lentil dish, is given out as prasad. Manipuri Vaishnava families come and go from the precinct all day for their own congregational sankirtana.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा उत्सव काङ अर्थात् रथयात्रा है, जो आषाढ़ (जून–जुलाई) में दस दिन चलता है; रथ गोविंदजी मंदिर से निकलकर कंगला के पश्चिमी द्वार सनाथोङ तक जाता है और वहाँ से लौटता है, और हज़ारों भक्त रस्सी खींचने के लिए उमड़ते हैं। कार्तिक पूर्णिमा पर महारास होता है, जो मणिपुरी रास का सबसे भव्य रूप माना जाता है। फाल्गुन पूर्णिमा से आरम्भ होने वाले यासाङ (होली) उत्सव के दूसरे दिन स्थानीय संकीर्तन-दल मंदिर के मण्डप में गायन करते हैं, और इसी ऋतु में बसन्त रास प्रस्तुत होता है। भाद्रपद कृष्ण अष्टमी को जन्माष्टमी पर मध्यरात्रि की आरती और भजन के साथ कृष्ण-जन्म मनाया जाता है। 26 अप्रैल की पुनःप्रतिष्ठा-तिथि भी मंदिर में स्मरण की जाती है।',
        bodyEn:
          'The year’s largest observance is Kang, the Manipuri chariot festival, kept over ten days in Ashadha (June–July): the car leaves the Govindajee temple for Sanathong, the western gate of Kangla, and returns, with thousands taking a turn at the ropes. On Kartik Purnima the temple holds the Maha Ras, regarded as the fullest form of the Manipuri Ras. During Yaosang, the Manipuri Holi that opens on Phalguna Purnima, sankirtana bands perform in the temple mandapa on the second day, and the spring Basant Ras belongs to the same season. Janmashtami on Bhadrapada Krishna Ashtami is kept with midnight aarti and bhajan for Krishna’s birth. The temple also marks 26 April, the day of its reconsecration.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर इम्फाल पूर्वी ज़िले में नगर के मध्य, पुराने राजमहल (सना कोनुङ) परिसर से सटा है, इसलिए इम्फाल के किसी भी भाग से सड़क मार्ग से कुछ ही मिनटों में पहुँचा जा सकता है। निकटतम हवाई अड्डा बीर टिकेन्द्रजीत अन्तर्राष्ट्रीय हवाई अड्डा है, जो नगर-केन्द्र से लगभग 8 किमी दूर है; निकटतम रेलवे स्टेशन मणिपुर में जिरीबाम है, जबकि अधिकांश यात्री नागालैण्ड के दीमापुर रेलहेड (लगभग 215 किमी) से सड़क मार्ग से आते हैं। दर्शन के साथ प्रायः कंगला दुर्ग देखा जाता है, जो मंदिर के ठीक सामने है। विग्रह की उत्पत्ति-स्थली काइना पहाड़ी इम्फाल से लगभग 20–30 किमी दूर है — स्रोतों में दूरी भिन्न मिलती है — और वहाँ का पवित्र कटहल-स्थल गोविंदजी यात्रा को पूर्ण करने वाला माना जाता है।',
        bodyEn:
          'The temple sits in the middle of Imphal in Imphal East district, sharing a wall with the old royal palace compound (Sana Konung), so it is a short drive from anywhere in the city. The nearest airport is Bir Tikendrajit International Airport, roughly 8 km from the city centre; the nearest railway station within Manipur is Jiribam, though most pilgrims still come by road from the railhead at Dimapur in Nagaland, approximately 215 km away. Kangla Fort, directly opposite, is usually seen in the same visit. Kaina hill, where the image is said to have originated, lies about 20–30 km from Imphal — sources differ on the distance — and its sacred jackfruit site is counted as the completion of a Govindajee yatra.',
      },
    ],
  },
  'parashuram-kund': {
    significanceHi:
      'अरुणाचल प्रदेश के लोहित ज़िले में लोहित नदी के तट पर स्थित परशुराम कुंड उत्तर-पूर्व भारत का सबसे बड़ा स्नान-तीर्थ है, जहाँ विष्णु के छठे अवतार परशुराम की स्मृति में पुण्य-स्नान किया जाता है। कालिका पुराण इस कुंड में स्नान को मुक्तिदायक कहता है, और मकर संक्रांति (14–15 जनवरी) पर यहाँ लगने वाला मेला, जो सन् 1972 (विक्रम संवत् 2029) से नियमित रूप से आयोजित होता आ रहा है, देश-विदेश से हज़ारों तीर्थयात्रियों को खींचता है। यहाँ कोई प्राचीन प्रतिष्ठित मंदिर नहीं, बल्कि नदी में बना प्राकृतिक कुंड ही तीर्थ है — इसीलिए इसे उत्तर-पूर्व का कुम्भ कहा जाता है।',
    significanceEn:
      'On the bank of the Lohit river in Lohit district of Arunachal Pradesh, Parashuram Kund is the greatest bathing tirtha of north-east India, where pilgrims take the ritual dip in memory of Parashurama, the sixth avatara of Vishnu. The Kalika Purana holds that a bath in this kund brings release, and the mela on Makar Sankranti (14–15 January), held regularly since 1972 (Vikram Samvat 2029), draws thousands of pilgrims from across India and from Nepal. There is no ancient consecrated temple here — the tirtha is the natural pool in the river itself, which is why it is called the Kumbh of the North-East.',
    originStoryHi:
      'परम्परा के अनुसार परशुराम ने अपने पिता जमदग्नि की आज्ञा पर माता रेणुका का वध किया, और उस मातृहत्या के चिह्न-स्वरूप फरसा उनके हाथ से चिपक गया। शास्त्र-कथा कहती है कि प्रायश्चित की खोज में वे लोहित नदी के ब्रह्मकुंड पहुँचे और वहाँ स्नान करते ही फरसा हाथ से छूट गया। कृतज्ञ होकर उन्होंने उसी फरसे से तट काटकर जल के लिए मार्ग बनाया, जिससे बना कुंड आगे की पीढ़ियों के लिए परशुराम कुंड कहलाया।',
    originStoryEn:
      'By tradition Parashurama killed his mother Renuka at the command of his father, the sage Jamadagni, and the axe he used clung to his hand as the mark of that matricide. The Puranic account says that, seeking expiation, he reached the Brahmakund on the Lohit, and the axe fell away the moment he bathed there. In gratitude he cut the bank open with that same axe to make a passage for the water, and the pool it formed has been known ever since as Parashuram Kund.',
    sources: [
      {
        label: 'Parshuram Kund — Government of Arunachal Pradesh (official site)',
        url: 'https://parshuramkund.arunachal.gov.in/website/parshuram-kund-mela/',
      },
      {
        label: 'District Lohit, Government of Arunachal Pradesh — Parshuram Kund',
        url: 'https://lohit.nic.in/tourist-place/parshuram-kund/',
      },
      {
        label: 'Arunachal Tourism — Parasuram Kund',
        url: 'https://arunachaltourism.com/parasuram-kund/',
      },
      {
        label: 'Parshuram Kund — Reference',
        url: 'https://en.wikipedia.org/wiki/Parshuram_Kund',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'परशुराम कुंड की कोई प्राण-प्रतिष्ठा तिथि दर्ज नहीं है — यह मानव-प्रतिष्ठित मंदिर नहीं, नदी में बना स्वयंभू तीर्थ है, जिसका उल्लेख कालिका पुराण, श्रीमद्भागवत और महाभारत की ब्रह्मकुंड-कथाओं से जोड़ा जाता है। परम्परा कहती है कि अठारहवीं शताब्दी में एक सन्यासी ने चौखम की ओर से आकर इस विस्मृत स्थल को फिर से खोजा और यात्रियों के लिए पुनः प्रतिष्ठित किया; लोककथा में गाँववालों ने पहले उन्हें ठग समझकर निकाल दिया था, और बाद में क्षमा माँगकर फल-फूल अर्पित किए। उस सन्यासी द्वारा चिह्नित कुंड 15 अगस्त 1950 (विक्रम संवत् 2007) के असम भूकम्प तक बना रहा; उस प्रलयंकारी भूकम्प ने नदी की धारा बदल दी और मूल कुंड जल में समा गया। इसके बाद नदी-तल में विशाल शिलाएँ एक वृत्ताकार रचना में जम गईं और पुराने कुंड के स्थान पर एक नया कुंड बन गया — आज का स्नान-स्थल यही है, और स्थानीय मान्यता इसे परशुराम की कृपा मानती है। मूल कुंड के ऊपर से अब तेज़ धारा बहती है। सन् 1972 (विक्रम संवत् 2029) से मकर संक्रांति का मेला नियमित रूप से आयोजित होने लगा, और तब से अरुणाचल प्रदेश सरकार, ज़िला प्रशासन तथा सेवा-समितियाँ मिलकर तीर्थ की व्यवस्था सँभालती हैं; हाल के वर्षों में केन्द्रीय तीर्थ-विकास योजना के अन्तर्गत घाट तक पक्की सीढ़ियाँ, स्वागत-कक्ष, यात्री-निवास और साधुओं के लिए आवास बनाए गए हैं।',
        bodyEn:
          'Parashuram Kund records no date of consecration — it is not a shrine that anyone installed, but a self-made tirtha in the river, linked by tradition to the Brahmakund passages of the Kalika Purana, the Srimad Bhagavata and the Mahabharata. Tradition holds that in the eighteenth century a sadhu who came by way of Chowkham rediscovered the forgotten site and re-established it for pilgrims; the local story tells that the villagers first drove him out as a fraud and later returned with fruit and flowers to ask his pardon. The kund he marked survived until the Assam earthquake of 15 August 1950 (Vikram Samvat 2007), which shifted the river and buried the old pool under the current. Afterwards great boulders settled into a ring in the riverbed and formed a fresh kund in place of the old — this is the pool pilgrims bathe in today, and local belief reads its appearance as Parashurama’s own grace. A strong current now runs over the original site. The Makar Sankranti mela has been held regularly since 1972 (Vikram Samvat 2029), managed since then by the Government of Arunachal Pradesh, the district administration and the seva samitis together; in recent years a central pilgrimage-development scheme has added concrete steps down to the ghat, a reception hall, and lodging for pilgrims and for sadhus.',
      },
      {
        id: 'svarup',
        titleHi: 'परशुराम का स्वरूप',
        titleEn: 'The Form of Parashurama',
        bodyHi:
          'यहाँ का मुख्य दर्शन कोई गर्भगृह-प्रतिष्ठित विग्रह नहीं, बल्कि कुंड स्वयं है — लोहित की धारा के बीच विशाल शिलाओं से बना वृत्ताकार जल-कुंड, जिसके चारों ओर मिश्मी पहाड़ियों की ढलानें उतरती हैं। तट पर एक छोटा मंदिर है जिसमें विष्णु और उनके अवतार परशुराम की प्रतिमाएँ स्थापित हैं; परशुराम यहाँ अपने चिरपरिचित रूप में — फरसा धारण किए तपस्वी ब्राह्मण-योद्धा — पूजे जाते हैं। मंदिर परिसर के पीछे रेणुका-वध और फरसे के छूटने की कथा को दर्शाती मूर्तियाँ लगी हैं, जिनसे यात्री कथा का क्रम समझते हैं। घाट तक उतरने के लिए पक्की सीढ़ियाँ बनी हैं, क्योंकि नदी का प्रवाह तेज़ रहता है और स्नान प्रायः रस्सियों और सुरक्षा-व्यवस्था के बीच होता है।',
        bodyEn:
          'What pilgrims come to see here is not an image in a sanctum but the kund itself — a ring of water held by huge boulders in the middle of the Lohit, with the Mishmi slopes falling to the river on every side. On the bank stands a small temple housing images of Vishnu and of his avatara Parashurama, who is worshipped in his familiar form: the ascetic brahmana-warrior with the axe. Behind the temple precinct a set of sculpted figures narrates the killing of Renuka and the loosening of the axe, so that visitors can follow the story in sequence. Concrete steps carry devotees down to the ghat, since the river runs fast and the bathing is done within ropes and a posted watch.',
      },
      {
        id: 'parampara',
        titleHi: 'पुण्य-स्नान और सेवा',
        titleEn: 'The Sacred Bath and Seva',
        bodyHi:
          'परशुराम कुंड की एकमात्र और सबसे बड़ी परम्परा स्नान है। कालिका पुराण के अनुसार इस कुंड में एक डुबकी ही पाप-क्षालन और मुक्ति के लिए पर्याप्त मानी गई है, इसलिए यात्री यहाँ पूजा-अर्चना से पहले जल में उतरते हैं; शीत ऋतु में लोहित का जल अत्यन्त ठंडा रहता है, और यही कठिनाई स्नान को तप का रूप देती है। स्नान के बाद तट के मंदिर में विष्णु और परशुराम के दर्शन कर यात्री दीप और पुष्प अर्पित करते हैं। मेले के दिनों की दूसरी बड़ी परम्परा सेवा है — असम के तिनसुकिया तथा आसपास की परशुराम सेवा समिति, मानव उत्थान सेवा समिति और अन्य स्वयंसेवी संस्थाएँ यात्रियों के लिए निःशुल्क भोजन और ठहरने की व्यवस्था करती हैं, और साधु-सन्तों के लिए अलग शिविर लगते हैं। भीड़ का चरम मकर संक्रांति के दो दिन रहता है, शेष जनवरी भर यात्रा चलती रहती है।',
        bodyEn:
          'The one great practice at Parashuram Kund is the bath. The Kalika Purana holds that a single dip here suffices to wash away sin and win release, so pilgrims enter the water before they do anything else; in winter the Lohit runs bitterly cold, and that hardship is itself understood as the austerity of the tirtha. Coming out, they take darshan of Vishnu and Parashurama in the riverside temple and offer lamps and flowers. The other tradition of the mela days is seva — the Parshuram Sewa Samity, the Manav Utthan Seva Samity of Tinsukia in neighbouring Assam and other voluntary bodies run free kitchens and shelter for the pilgrims, with separate camps for the sadhus. The crush peaks over the two days of Makar Sankranti, while the pilgrimage itself continues through January.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का एकमात्र किन्तु विशाल आयोजन परशुराम कुंड मेला है, जो मकर संक्रांति — पौष मास में सूर्य के मकर राशि में प्रवेश, प्रायः 14–15 जनवरी — पर चरम पर पहुँचता है। मेला जनवरी के प्रथम सप्ताह से 31 जनवरी तक तैलुंग/तेलू शाती क्षेत्र में लगता है और सन् 1972 (विक्रम संवत् 2029) से नियमित रूप से आयोजित होता आ रहा है। इन दिनों भारत के विभिन्न राज्यों तथा नेपाल से तीर्थयात्री, साधु और नागा सन्यासी पहुँचते हैं; असम और अरुणाचल प्रदेश के परिवहन विभाग तिनसुकिया, नामसाई, वाक्रो और तेजू से विशेष बसें चलाते हैं। मेला-स्थल पर भजन-कीर्तन, प्रवचन और निःशुल्क अन्नक्षेत्र चलते हैं, तथा प्रशासन स्वास्थ्य शिविर और नदी-सुरक्षा दल तैनात करता है। वर्ष के शेष महीनों में कुंड शान्त रहता है और इक्के-दुक्के यात्री ही पहुँचते हैं।',
        bodyEn:
          'The year holds one observance, and it is vast: the Parshuram Kund Mela, which peaks on Makar Sankranti — the sun’s entry into Capricorn in the month of Pausha, usually 14–15 January. The fair runs at the Tailung / Telu Shati grounds from the first week of January to the 31st, and has been held regularly since 1972 (Vikram Samvat 2029). Pilgrims, sadhus and naga ascetics arrive from across India and from Nepal, and the transport departments of both Assam and Arunachal Pradesh put on extra buses from Tinsukia, Namsai, Wakro and Tezu. Bhajan and discourse fill the mela grounds alongside the free kitchens, while the administration posts medical camps and a river-safety watch. For the rest of the year the kund is quiet, visited only in ones and twos.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'कुंड लोहित ज़िले में मिश्मी पठार की तलहटी पर है। ज़िला मुख्यालय तेजू से सड़क मार्ग की दूरी तोहांगम और वाक्रो होते हुए लगभग 48 किमी बताई जाती है, जबकि कुछ विवरण तेजू से उत्तर लगभग 21 किमी की सीधी दूरी देते हैं — यात्रा-योजना के लिए तेजू से लगभग आधे दिन का मार्ग मानना उचित है। निकटतम हवाई अड्डा तेजू है, जो लगभग 50 किमी दूर है पर जहाँ सीमित उड़ानें आती हैं; अधिकांश यात्री असम के डिब्रूगढ़ हवाई अड्डे (सड़क मार्ग से लगभग 200 किमी, पाँच–छह घंटे) से आते हैं। निकटतम बड़ा रेलहेड तिनसुकिया है, जहाँ से सड़क मार्ग लगभग 150 किमी और चार घंटे का है, और मार्ग तिनसुकिया–नामसाई–वाक्रो–तेजू होकर जाता है। मार्ग में लोहित घाटी के दृश्य और तट के मेला-मैदान दर्शनीय हैं; अधिकांश तीर्थयात्री असम से आते हुए यह यात्रा जोड़ते हैं।',
        bodyEn:
          'The kund lies in Lohit district at the foot of the Mishmi plateau. The road distance from the district headquarters at Tezu is generally given as about 48 km by way of Tohangam and Wakro, though some accounts give roughly 21 km as the straight-line distance north of Tezu — for planning, treat it as a half-day run from Tezu. The nearest airport is Tezu, about 50 km away, but flights there are few; most pilgrims fly instead into Dibrugarh in Assam and drive roughly 200 km, five to six hours. The nearest major railhead is Tinsukia, approximately 150 km and four hours by road, the route running Tinsukia–Namsai–Wakro–Tezu. The drive gives long views of the Lohit valley, and the mela grounds along the bank are worth walking; most pilgrims fold the journey into a trip through upper Assam.',
      },
    ],
  },
  'nartiang-durga': {
    significanceHi:
      'मेघालय के पश्चिम जयन्तिया पहाड़ ज़िले में नारतियांग का दुर्गा मंदिर 51 शक्ति पीठों में गिना जाता है, जहाँ देवी जयन्ती या जयन्तेश्वरी (मा जयन्ती) और भैरव कामदीश्वर रूप में पूजित हैं। मंदिर की आयु लगभग 600 वर्ष मानी जाती है — कुछ विवरण इसे पाँच सौ वर्ष से अधिक बताते हैं — और इसकी प्रतिष्ठा की कोई तिथि अभिलेखों में दर्ज नहीं; परम्परा इसे जयन्तिया नरेश जसो मानिक से जोड़ती है, जिन्होंने नारतियांग को अपनी ग्रीष्मकालीन राजधानी बनाया। शक्ति-साधना की यह पीठ खासी-जयन्तिया समाज की अपनी पुरोहित-परम्परा के साथ चलती है, जो इसे उत्तर भारत के शाक्त मंदिरों से अलग पहचान देती है।',
    significanceEn:
      'In West Jaintia Hills district of Meghalaya, the Durga temple at Nartiang is counted among the 51 Shakta pithas, where the Devi is worshipped as Jayanti or Jainteswari — Ma Jainti — with Kamadishwar as her Bhairava. The shrine is commonly held to be about 600 years old, though some accounts say over five hundred, and no date of consecration survives in record; tradition ties its founding to the Jaintia king Jaso Manik, who made Nartiang his summer capital. This seat of Shakta worship runs on a priestly line of its own, drawn from the Khasi-Jaintia country, which sets it apart from the Shakta temples of the north Indian plains.',
    originStoryHi:
      'शक्ति-पीठ कथा के अनुसार सती के देह-खण्डों में उनकी बाईं जंघा नारतियांग में गिरी, और तभी से यह स्थान देवी की पीठ माना गया। स्थानीय परम्परा कहती है कि जयन्तिया नरेश मानिक को एक रात स्वप्न में देवी ने दर्शन देकर इस भूमि का महत्त्व बताया और यहाँ अपना मंदिर बनाने का आदेश दिया। राजा ने नारतियांग को ग्रीष्मकालीन राजधानी बनाकर मंदिर स्थापित किया और सेवा के लिए जयन्तियापुर से पुरोहित बुलाए, जिनके वंशज आज भी पूजा करते हैं।',
    originStoryEn:
      'In the Shakti Peetha account, the left thigh of Sati is said to have fallen at Nartiang, and the place has been held a seat of the Devi ever since. Local tradition holds that the goddess appeared one night in a dream to the Jaintia king Manik, told him what the site was, and asked that a temple be raised for her there. The king made Nartiang his summer capital, built the shrine, and brought priests from Jaintiapur to serve it — their descendants perform the worship to this day.',
    sources: [
      {
        label: 'Incredible India (Ministry of Tourism) — The monoliths and old tales of Nartiang',
        url: 'https://www.incredibleindia.gov.in/en/meghalaya/shillong/the-monoliths-and-old-tales-of',
      },
      {
        label: 'Meghalaya Tourism — Nartiang Monoliths, Jaintia Hills',
        url: 'https://www.meghalayatourism.in/destinations/nartiang-monoliths/',
      },
      {
        label: 'West Jaintia Hills District, Government of Meghalaya — Nartiang',
        url: 'https://westjaintiahills.gov.in/tourist-place/nartiang-monoliths/',
      },
      {
        label: 'Nartiang Durga Temple — Reference',
        url: 'https://en.wikipedia.org/wiki/Nartiang_Durga_Temple',
      },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'नारतियांग दुर्गा मंदिर की प्राण-प्रतिष्ठा की तिथि, तिथि-वार या प्रतिष्ठाकर्ता का नाम किसी अभिलेख में सुरक्षित नहीं है; जो स्मृति बची है वह जयन्तिया राजवंश की है। लगभग छह सौ वर्ष पूर्व नरेश मानिक ने नारतियांग को जयन्तिया राज्य की ग्रीष्मकालीन राजधानी बनाया, और परम्परा कहती है कि देवी ने उन्हें स्वप्न में इस स्थान का महत्त्व बताकर मंदिर बनाने को कहा। पूजा के लिए राजा ने जयन्तियापुर से पुरोहित बुलाए; लोककथा के अनुसार जब कोई ब्राह्मण यहाँ की बलि-परम्परा के कारण पुरोहिताई को तैयार नहीं हुआ, तब राजा जसो मानिक एक मराठा क्षत्रिय को ले आए — इसी कारण नारतियांग के पुजारी ब्राह्मण नहीं हैं, और वे स्वयं को उन्हीं मूल पुरोहितों का सीधा वंशज मानते हैं। मंदिर की मूल रचना खासी घर जैसी थी — बीच में एक लकड़ी का खम्भा और ऊपर फूस की छत; बाद में फूस के स्थान पर टीन की चादर लगी। सन् 1987 (विक्रम संवत् 2044) में चेरापूँजी के रामकृष्ण मिशन ने स्थानीय परम्परा और आस्था की रक्षा के उद्देश्य से मंदिर का जीर्णोद्धार और पुनर्निर्माण कराया, जिससे वर्तमान ढाँचा बना। पास में ही जयन्तिया राजाओं के खड़े और सपाट महापाषाण (मोनोलिथ) हैं, जो सन् 1500 से 1835 (विक्रम संवत् 1557 से 1892) के बीच स्थापित माने जाते हैं और उसी राजधानी की गवाही देते हैं।',
        bodyEn:
          'No record preserves a consecration date, tithi or consecrator for the Nartiang Durga temple; what survives is the memory of the Jaintia royal house. About six hundred years ago King Manik made Nartiang the summer capital of the Jaintia kingdom, and tradition says the Devi told him in a dream what the place was and asked for a temple. For the worship the king sent to Jaintiapur for priests; the local account holds that when no Brahmin would take up a priesthood bound to blood offering, King Jaso Manik brought a Maratha Kshatriya instead — which is why the priests of Nartiang are not Brahmins, and why they hold themselves the direct descendants of that first line. The original building was shaped like a Khasi house, a thatched roof over a single central wooden post; the thatch was later replaced with corrugated tin sheet. In 1987 (Vikram Samvat 2044) the Ramakrishna Mission of Cherrapunjee repaired and rebuilt the temple to preserve the tradition and faith of the local people, and that work gave the shrine its present form. Near it stand the Jaintia kings’ menhirs and dolmens, raised between 1500 and 1835 CE (Vikram Samvat 1557 to 1892), the surviving witness to the old capital.',
      },
      {
        id: 'svarup',
        titleHi: 'जयन्ती दुर्गा का स्वरूप',
        titleEn: 'The Form of Jayanti Durga',
        bodyHi:
          'यहाँ देवी का नाम ही स्थान से बना है — जयन्ती, जयन्तेश्वरी या मा जयन्ती — और उनके भैरव कामदीश्वर कहलाते हैं; शक्ति-पीठ सूची में यही युग्म नारतियांग की पहचान है। मंदिर का रूप उत्तर भारत के शिखर-युक्त शाक्त मंदिरों जैसा नहीं, बल्कि पहाड़ी घर जैसा साधारण है — भीतर केन्द्रीय काष्ठ-स्तम्भ के चारों ओर गर्भगृह, ऊपर ढलवाँ छत। गर्भगृह से लगा हुआ बलि-गर्भ है, वह पीठिका जहाँ बलि दी जाती थी, और उससे एक ढालू सुरंग नीचे बहती म्यन्तदु नदी तक जाती थी; यह सुरंग आज भी मंदिर की सबसे चर्चित रचना है। थोड़ी ही दूर पैदल-मार्ग पर शिव मंदिर है, जिसके भीतर जयन्तिया काल की पुरानी तोपों के अवशेष रखे दिखते हैं।',
        bodyEn:
          'Here the goddess takes her name from the place itself — Jayanti, Jainteswari, Ma Jainti — and her Bhairava is Kamadishwar; it is this pair that names Nartiang in the Shakti Peetha lists. The building looks nothing like the spired Shakta temples of the plains: it is as plain as a hill house, the sanctum set round a central wooden post under a pitched roof. Adjoining the sanctum is the Boli Garbha, the pier at which offerings were made, and from it a steep tunnel ran down to the Myntdu river below — still the feature visitors most often come to see. A short walk away stands the Shiva temple, where the remains of old Jaintia-period cannon are kept inside.',
      },
      {
        id: 'parampara',
        titleHi: 'जयन्तिया पुरोहित-परम्परा',
        titleEn: 'The Jaintia Priestly Lineage',
        bodyHi:
          'नारतियांग की सबसे विशिष्ट बात उसकी पुरोहित-परम्परा है: पूजा करने वाले परिवार जयन्तियापुर से आए मूल पुरोहितों के वंशज हैं और ब्राह्मण नहीं — पीढ़ी-दर-पीढ़ी यही परिवार देवी की सेवा सँभालते आए हैं, और स्थानीय खासी-जयन्तिया रीति तथा शाक्त विधि यहाँ साथ-साथ चलती है। ऐतिहासिक रूप से इस पीठ पर नरबलि की प्रथा रही, जिसे बीसवीं सदी के आरम्भ में ब्रिटिश प्रशासन ने प्रतिबन्धित कर दिया; वह प्रथा अब नहीं है। वर्तमान में पूजा में बकरे और बत्तख की बलि दी जाती है, और दुर्गा पूजा के दिनों में देवी का पूजन एक सजाए हुए केले के पौधे के रूप में होता है — यही विग्रह चार दिन की पूजा के अन्त में म्यन्तदु नदी में विसर्जित किया जाता है। यह मिश्रित विधि — प्रतीक-पूजन, स्थानीय पुरोहित और पहाड़ी भूगोल — इस पीठ की अपनी पहचान है।',
        bodyEn:
          'What most marks Nartiang is who serves it: the officiating families descend from the priests first brought from Jaintiapur and are not Brahmins, and the same households have kept the Devi’s worship through the generations, with Khasi-Jaintia usage and Shakta rite running side by side. Historically the peeth received human sacrifice, a practice the British administration banned in the early twentieth century; it is not performed any more. The offerings made today are goats and ducks, and through the Durga Puja days the goddess is worshipped in the form of a dressed banana plant — the same figure that is taken to the Myntdu river and immersed at the close of the fourth day. That blend of symbolic worship, a local priesthood and hill geography is the peeth’s own signature.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का प्रमुख उत्सव आश्विन शुक्ल पक्ष में मनाई जाने वाली दुर्गा पूजा है, जब चार दिन तक नारतियांग में विशेष विधान चलता है और जयन्तिया पहाड़ों के साथ-साथ शिलांग, जोवाई और असम से भी श्रद्धालु पहुँचते हैं। इन्हीं दिनों सजे हुए केले के पौधे को देवी-स्वरूप मानकर पूजा जाता है और चौथे दिन के अन्त में उसका म्यन्तदु नदी में विसर्जन होता है — यही यहाँ की दशमी है। नवरात्र के शेष दिनों में भी दर्शन और पाठ चलते हैं, और बलि-अर्पण दुर्गा पूजा के विधान का भाग रहता है। वर्ष के अन्य दिनों में मंदिर शान्त रहता है; स्थानीय परिवार संकट-निवारण और मनोकामना के लिए किसी भी समय देवी के दर्शन को आते हैं।',
        bodyEn:
          'The temple’s great observance is Durga Puja in the bright fortnight of Ashwin, when four days of rite are kept at Nartiang and devotees come in from across the Jaintia Hills and from Shillong, Jowai and Assam. In those days the dressed banana plant is worshipped as the goddess herself, and at the close of the fourth day it is carried down for immersion in the Myntdu — that is Dashami here. Darshan and recitation continue through the remaining nights of Navaratri, and the offering of animals belongs to the Durga Puja rite. For the rest of the year the shrine is quiet; local families come whenever they wish, to ask the Devi for relief or for a wish granted.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'नारतियांग पश्चिम जयन्तिया पहाड़ ज़िले में है — जोवाई से लगभग 24 किमी (लगभग चालीस मिनट), शिलांग से लगभग 65 किमी और गुवाहाटी से लगभग 160 किमी सड़क मार्ग पर। निकटतम बड़ा रेलवे स्टेशन गुवाहाटी है, लगभग 160 किमी दूर, और अधिकांश यात्री वहीं से टैक्सी या मेघालय परिवहन की बस लेकर आते हैं; नज़दीकी हवाई अड्डा शिलांग का है, पर उड़ानों की अधिक सुविधा गुवाहाटी से मिलती है। मंदिर से लगभग तीन किमी पर नारतियांग का महापाषाण-उद्यान है, जहाँ जयन्तिया राजाओं के खड़े मेनहिर और सपाट डॉल्मेन एक साथ खड़े हैं — यही यात्रा का दूसरा पड़ाव माना जाता है। पास ही पैदल दूरी पर शिव मंदिर है, और नीचे म्यन्तदु नदी बहती है, जिससे मंदिर की सुरंग और विसर्जन-परम्परा जुड़ी है।',
        bodyEn:
          'Nartiang lies in West Jaintia Hills district — roughly 24 km from Jowai, about forty minutes by road, some 65 km from Shillong and about 160 km from Guwahati. The nearest major railhead is Guwahati, approximately 160 km away, and most visitors come on from there by taxi or by Meghalaya Transport bus; the nearest airport is at Shillong, though flight connections are far better at Guwahati. About three kilometres from the temple is the Nartiang monolith park, where the Jaintia kings’ upright menhirs and flat dolmens stand together — usually the second halt of the same trip. The Shiva temple is a short walk away, and below runs the Myntdu, the river to which both the temple’s tunnel and its immersion rite belong.',
      },
    ],
  },
};

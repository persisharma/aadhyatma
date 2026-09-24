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
 * Temples still to author in this chunk: parashuram-kund nartiang-durga kirateshwar
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
};

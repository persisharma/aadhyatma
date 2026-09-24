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
 * Temples still to author in this chunk: chamundeshwari jogulamba
 */
export const details: Record<string, TempleDetail> = {
  shrinkhala: {
    significanceHi:
      'हुगली ज़िले के पांडुआ की श्रृंखला देवी अष्टादश महाशक्ति पीठों में गिनी जाती है — आदि शंकराचार्य को परम्परा द्वारा आरोपित अष्टादश शक्तिपीठ स्तोत्र में उन्हें "प्रद्युम्ने श्रृंखला देवी" कहकर स्मरण किया गया है। हुगली ज़िला प्रशासन का पर्यटन विवरण भी पांडुआ की श्रृंखला देवी को अठारह पीठों में गिनता है। यहाँ का मूल मंदिर मध्यकाल में नष्ट हो गया और आज स्थल पर भारतीय पुरातत्व सर्वेक्षण द्वारा सन् 1927 (विक्रम संवत् 1984) से संरक्षित मीनार और बाईस दरवाज़ा मस्जिद के खंडहर खड़े हैं; देवी की प्रतिष्ठा-तिथि, वार अथवा प्रतिष्ठाकर्ता का कोई अभिलेख उपलब्ध नहीं है। श्रृंखला — बंधन की कड़ी — के नाम से देवी बंधन काटने वाली माता के रूप में स्मरण की जाती हैं।',
    significanceEn:
      'Shrinkhala Devi of Pandua in Hooghly district is counted among the eighteen Maha Shakti Peethas — the Ashtadasha Shakti Peetha Stotram, traditionally ascribed to Adi Shankaracharya, invokes her as “Pradyumne Shrinkhala Devi”. The Hooghly district administration’s own tourism listing likewise names the Shrinkala Devi shrine at Pandua among the eighteen peethas. The original temple did not survive the medieval centuries; what stands on the site today is the minar and the ruined Bais Darwaza Masjid, both protected by the Archaeological Survey of India since 1927 (Vikram Samvat 1984). No tithi, weekday or consecrator is recorded for the goddess’s installation, and her name — shrinkhala, the chain — is read as the bond she both holds and breaks.',
    originStoryHi:
      'शक्ति-पीठ परम्परा के अनुसार सती के देह-त्याग के बाद जब शिव उनका शरीर लिए घूमते रहे और विष्णु ने सुदर्शन से उसे खंडित किया, तब सती के उदर (श्रृंखला-भाग) का अंश इसी भूमि पर गिरा। इसी से यह स्थान प्रद्युम्न क्षेत्र कहलाया और देवी यहाँ श्रृंखला रूप में पूजित हुईं। लोक-परम्परा मंदिर की स्थापना का श्रेय ऋष्यशृंग ऋषि को देती है, जिन्हें देवी का परम उपासक बताया जाता है; इस कथा की पुष्टि किसी अभिलेख से नहीं होती।',
    originStoryEn:
      'The Shakti Peeth tradition holds that after Sati gave up her body and Shiva wandered with it, Vishnu’s Sudarshana divided her form, and the part of her stomach — her shrinkhala, her girdle — fell on this ground. The place came to be called Pradyumna kshetra, and the goddess was worshipped here in her Shrinkhala form. Local tradition credits the first shrine to the sage Rishyasringa, described as her great devotee; no inscription confirms that account.',
    sources: [
      {
        label: 'Hooghly District Administration, Government of West Bengal — Places of Interest',
        url: 'https://hooghly.nic.in/places-of-interest/',
      },
      { label: 'Archaeological Survey of India, Kolkata Circle — Monuments', url: 'https://www.asikolkata.in/monuments.aspx' },
      { label: 'Shakta Pithas — Reference', url: 'https://en.wikipedia.org/wiki/Shakta_pithas' },
      { label: 'Pandua, Hooghly — Reference', url: 'https://en.wikipedia.org/wiki/Pandua,_Hooghly' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'पांडुआ के इस पीठ की स्थापना का कोई तिथि-वार, प्रतिष्ठाकर्ता अथवा निर्माण-अभिलेख उपलब्ध नहीं है — यह उन गिने-चुने महापीठों में है जिनकी कथा स्तोत्र-परम्परा में तो सुरक्षित रही, पर जिनका मूल मंदिर शेष नहीं बचा। परम्परा पहला शिवालय-सदृश मंदिर ऋषि ऋष्यशृंग से जोड़ती है, जिन्हें देवी का उपासक कहा गया है, किन्तु इसे कोई शिलालेख प्रमाणित नहीं करता। जो प्रमाणित है वह स्थल का मध्यकालीन इतिहास है: यहाँ बाईस दरवाज़ा (बड़ी) मस्जिद के खंडहर हैं, जिन्हें लगभग सन् 1300 (विक्रम संवत् लगभग 1357) का माना जाता है, और उसके साथ पाँच मंज़िला मीनार, जिसे सन् 1340 (विक्रम संवत् लगभग 1397) में बनवाया गया बताया जाता है। मीनार मूलतः लगभग 40 मीटर ऊँची थी और सन् 1886 (विक्रम संवत् 1943) के भूकंप के बाद घटकर लगभग 38 मीटर रह गई; ढहे हिस्से का जीर्णोद्धार पुरातत्व सर्वेक्षण ने किया। मस्जिद की तिहरी दालान-पंक्ति की छत के तिरसठ छोटे गुंबद पुराने पाषाण-स्तम्भों पर टिके हैं, जो पूर्ववर्ती मंदिर-स्थापत्य के माने जाते हैं — स्थल पर देवी के काल का यही दृश्य अवशेष बचा है। मीनार और मस्जिद दोनों सन् 1927 (विक्रम संवत् 1984) से केन्द्रीय संरक्षित स्मारक हैं।',
        bodyEn:
          'Nothing survives that would give this peeth a founding date, a weekday, a consecrator or a building record — it is among the few Maha Shakti Peethas whose story is preserved in the stotra tradition while the shrine itself is gone. Tradition assigns the first temple to the sage Rishyasringa, called her devotee, but no inscription supports it. What is documented is the site’s medieval history: the ruins of the Bais Darwaza or Bari Masjid, dated to about 1300 CE (Vikram Samvat 1357), and beside them a five-storeyed minar said to have been raised in 1340 CE (Vikram Samvat 1397). The minar stood roughly 40 metres tall and was reduced to about 38 metres by the earthquake of 1886 (Vikram Samvat 1943), after which the Archaeological Survey restored the fallen portion. The mosque’s three aisles carry sixty-three small domes on older stone pillars of temple workmanship — the one visible remnant on site of the goddess’s own era. Both minar and mosque have been centrally protected monuments since 1927 (Vikram Samvat 1984).',
      },
      {
        id: 'svarup',
        titleHi: 'श्रृंखला देवी का स्वरूप',
        titleEn: 'The Form of Shrinkhala Devi',
        bodyHi:
          'पांडुआ में देवी की कोई प्राचीन प्रतिमा, गर्भगृह अथवा सिंहासन आज शेष नहीं है, इसलिए यहाँ का स्वरूप-वर्णन मूर्ति का नहीं, नाम और स्तोत्र का है — और इसे वैसा ही रखना ईमानदारी है, गढ़ना नहीं। "श्रृंखला" का अर्थ है कड़ी, साँकल अथवा कटिबंध; उपासक देवी को उस शक्ति के रूप में स्मरण करते हैं जो जीव को बाँधने वाली श्रृंखला भी है और उसे काटकर मुक्त करने वाली भी। अष्टादश शक्तिपीठ स्तोत्र में उनका स्मरण "प्रद्युम्ने श्रृंखला देवी" पद से होता है, और शाक्त गणना में यह पीठ सती के उदर-भाग से जोड़ा जाता है। स्थल पर पूजा का कोई स्थायी विग्रह न होने से भक्त प्रायः निराकार भाव से, स्तोत्र-पाठ और संकल्प द्वारा ही देवी का आवाहन करते हैं; हाल के वर्षों में कुछ भक्त-मंडलियों ने श्रृंखला माता के नए विग्रह पर पूजा आरम्भ की है।',
        bodyEn:
          'No ancient image, sanctum or throne of the goddess survives at Pandua, so what can honestly be described here is her name and the verse that carries it, not a murti. Shrinkhala means a chain, a link, a girdle: worshippers hold her to be at once the chain that binds a soul to the world and the power that strikes it off. The Ashtadasha Shakti Peetha Stotram names her in the line “Pradyumne Shrinkhala Devi”, and in the Shakta reckoning this peeth is tied to the stomach-part of Sati. With no fixed image on the site, devotees invoke her largely without form — by recitation and sankalpa rather than before a sanctum — though in recent years devotee groups have begun regular puja to a newly made image of Shrinkhala Mata.',
      },
      {
        id: 'parampara',
        titleHi: 'स्तोत्र-पाठ और पीठ-स्मरण',
        titleEn: 'Recitation and the Remembrance of the Peeth',
        bodyHi:
          'जहाँ अन्य पीठों की परम्परा भोग, अर्चना और आरती के क्रम से बनती है, वहाँ पांडुआ की परम्परा वाणी से बनी है: अष्टादश शक्तिपीठ स्तोत्र का पाठ ही यहाँ की मुख्य उपासना है, और अठारह पीठों की यात्रा करने वाले साधक मीनार-परिसर की भूमि पर प्रणाम कर, संकल्प और स्तोत्र-पाठ से अपना पीठ-दर्शन पूरा मानते हैं। यहाँ न कोई मंदिर-न्यास है, न नियत आरती-समय, न निर्धारित भोग — इसलिए किसी प्रसाद या मनौती-रीत को इस स्थल की अधिकृत परम्परा कहकर गिनाना उचित नहीं होगा। बंगाल की सामान्य शाक्त रीत के अनुसार भक्त लाल पुष्प, जपा (अड़हुल), सिंदूर और नारियल अर्पित करने का भाव रखते हैं, और अमावस्या तथा नवरात्रि की रात्रि को स्मरण का विशेष समय मानते हैं। हाल के वर्षों में भक्त-मंडलियों द्वारा आरम्भ की गई नियमित पूजा इसी लुप्त परम्परा को पुनः जोड़ने का प्रयास है।',
        bodyEn:
          'Where other peethas build their custom around bhog, archana and a fixed round of aartis, the usage at Pandua is carried in speech: recitation of the Ashtadasha Shakti Peetha Stotram is the main worship here, and pilgrims walking the eighteen-peeth circuit count their darshan complete by bowing on the ground of the minar precinct and making their sankalpa and recitation there. There is no temple trust, no appointed aarti hour and no prescribed bhog, so it would be wrong to set down any prasad or vow-custom as this site’s authorised tradition. Following the general Shakta usage of Bengal, devotees bring red flowers, hibiscus, sindoor and a coconut in spirit, and keep new-moon nights and the nights of Navaratri as the times of remembrance. The regular puja begun by devotee groups in recent years is an attempt to knot that broken thread back together.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'इस पीठ का कोई प्रकाशित उत्सव-पंचांग नहीं है, क्योंकि यहाँ कोई सेवारत मंदिर-न्यास नहीं — यह उन बातों में है जिन पर स्रोत मौन हैं, और उसे मौन ही कहना चाहिए। बंगाल की शाक्त परम्परा के भीतर श्रृंखला देवी का स्मरण शारदीय नवरात्रि और दुर्गा पूजा (आश्विन शुक्ल प्रतिपदा से दशमी) तथा माघ-फाल्गुन की अमावस्या-रात्रियों में किया जाता है, जब पीठ-यात्री यहाँ पहुँचते हैं। तीर्थ-विवरणों में माघ मास के आसपास मीनार-परिसर की भूमि पर लगने वाले एक लम्बे स्थानीय मेले का उल्लेख मिलता है, जिसमें आसपास के गाँवों की बड़ी भीड़ जुटती है; इसकी तिथियाँ किसी शासकीय पंचांग में दर्ज नहीं हैं, इसलिए इसे विवरण-आधारित ही मानें। कौमुदी-पूर्णिमा और कालीपूजा की रात्रि को भी कुछ मंडलियाँ यहाँ स्तोत्र-पाठ रखती हैं।',
        bodyEn:
          'This peeth publishes no festival calendar, because no trust serves it — one of the places where the sources are silent, and the silence is worth stating plainly. Within the Shakta year of Bengal, Shrinkhala Devi is remembered at Sharad Navaratri and Durga Puja (Ashwin Shukla Pratipada to Dashami) and on the new-moon nights of Magha and Phalguna, when peeth pilgrims come through. Pilgrimage accounts describe a long local fair held around the month of Magha on the ground beside the minar, drawing crowds from the villages around; its dates appear in no government calendar, so treat it as an account rather than a fixture. Some groups also keep recitation here on Kaumudi Purnima and on the night of Kali Puja.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'पांडुआ पश्चिम बंगाल के हुगली ज़िले की चुँचुड़ा (चिनसुराह) उपसंभाग में पड़ता है और हावड़ा–बर्धमान मुख्य रेल-मार्ग पर अपना स्टेशन (पुंडूआ) रखता है — हावड़ा से लगभग 61 किमी। स्थल स्टेशन से थोड़ी दूरी पर है और मीनार दूर से ही दिख जाती है, इसलिए कोलकाता से एक दिन में आना-जाना सहज है; निकटतम हवाई अड्डा कोलकाता है, जो सड़क-मार्ग से लगभग 60–70 किमी पड़ता है। सभी दूरियाँ अनुमानित हैं। पीठ-यात्री प्रायः इसे उसी ज़िले के तारकेश्वर (शिव) और बाँसबेड़िया के हंसेश्वरी मंदिर के साथ जोड़ते हैं, और कोलकाता की ओर लौटते हुए कालीघाट तथा दक्षिणेश्वर के दर्शन करते हैं। बंगाल के दूसरे महापीठ — तारापीठ और कालीघाट — इसी यात्रा-क्रम में बँधते हैं, और त्रिवेणी का संगम-स्थल भी पास ही मार्ग में पड़ता है।',
        bodyEn:
          'Pandua lies in the Chinsurah subdivision of Hooghly district, West Bengal, and has its own station, Pundooah, on the Howrah–Bardhaman main line, roughly 61 km from Howrah. The site sits a short way from the station with the minar visible from a distance, which makes it an easy day trip from Kolkata; the nearest airport is Kolkata, about 60–70 km away by road. All distances are approximate. Peeth pilgrims usually pair it with Tarakeswar (Shiva) and the Hanseswari temple at Bansberia in the same district, and take in Kalighat and Dakshineswar on the way back towards Kolkata. Bengal’s other great goddess seats — Tarapith and Kalighat — fall naturally into the same circuit, and the river confluence at Tribeni lies close to the road.',
      },
    ],
  },
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

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
 * Temples still to author in this chunk: konark-sun brihadeeswarar
 */
export const details: Record<string, TempleDetail> = {
  meenakshi: {
    significanceHi:
      'वैगै नदी के तट पर बसे मदुरै का मीनाक्षी सुन्दरेश्वर मंदिर उन थोड़े से धामों में है जहाँ देवी स्वयं नगर की अधिष्ठात्री रानी मानी जाती हैं और उनका शिव-स्वरूप सुन्दरेश्वर उनके साथ पूजित होते हैं। सातवीं शताब्दी के तेवारम् भजनों में इस मंदिर का उल्लेख मिलता है, किन्तु किसी प्रतिष्ठा-तिथि का अभिलेख नहीं है; सन् 1310 (विक्रम संवत् 1367) की लूट के बाद वर्तमान विशाल परिसर मदुरै के प्रथम नायक शासक विश्वनाथ नायक (सन् 1559–1600) ने पुनः खड़ा किया और तिरुमलै नायक (सन् 1623–1655) ने उसका विस्तार किया।',
    significanceEn:
      'The Meenakshi Sundareswarar temple at Madurai, on the banks of the Vaigai, is one of the few great shrines where the goddess herself is held to be the sovereign of the city and her consort Sundareswarar is worshipped beside her. The temple is named in the seventh-century Tevaram hymns, yet no consecration date is recorded for it; after the sack of 1310 CE (Vikram Samvat 1367) the present vast complex was rebuilt by Viswanatha Nayak, the first Nayak ruler of Madurai (1559–1600 CE), and greatly enlarged under Tirumalai Nayak (1623–1655 CE).',
    originStoryHi:
      'स्थल-कथा में पाण्ड्य राजा मलयध्वज और रानी काञ्चनमाला को यज्ञ की अग्नि से एक कन्या प्राप्त हुई, जिसका नाम मीनाक्षी रखा गया और जिसने बड़ी होकर मदुरै का शासन सँभाला। परम्परा कहती है कि दिग्विजय पर निकली मीनाक्षी कैलास पहुँचीं, जहाँ शिव के सम्मुख आते ही उन्होंने उन्हें अपना वर पहचाना। शिव सुन्दरेश्वर रूप में मदुरै आए और दोनों का विवाह हुआ — वही दिव्य विवाह आज भी चैत्तिरै उत्सव में दोहराया जाता है।',
    originStoryEn:
      'The sthala-katha tells that the Pandya king Malayadhwaja and his queen Kanchanamalai received a daughter from the fire of their yajna, who was named Meenakshi and who grew up to rule Madurai. By tradition, Meenakshi set out on a campaign of conquest and reached Kailasa, where at the sight of Shiva she recognised him as the husband foretold for her. Shiva came to Madurai as Sundareswarar and the two were wed — the divine wedding that the Chithirai festival re-enacts to this day.',
    sources: [
      { label: 'Arulmigu Meenakshi Sundaraswarar Temple, Madurai — Tamil Nadu HR&CE', url: 'https://maduraimeenakshi.hrce.tn.gov.in/' },
      { label: 'Tamil Nadu Tourism — Alagar Kovil, Madurai', url: 'https://www.tamilnadutourism.tn.gov.in/destinations/alagar-kovil-madurai' },
      { label: 'Incredible India (Ministry of Tourism) — Meenakshi Amman Temple, Madurai', url: 'https://www.incredibleindia.gov.in/en/tamil-nadu/madurai/meenakshi-amman-temple' },
      { label: 'Meenakshi Temple — Reference', url: 'https://en.wikipedia.org/wiki/Meenakshi_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'मदुरै के इस धाम की कोई प्रतिष्ठा-तिथि अभिलेखों में दर्ज नहीं है; सातवीं शताब्दी के संत तिरुज्ञानसम्बन्धर के तेवारम् भजनों में मंदिर का उल्लेख मिलता है, जिससे यह सिद्ध होता है कि वह तब भी जीवित तीर्थ था। परिसर का सबसे पुराना गोपुर सुन्दरेश्वर के गर्भगृह का है, जिसे कुलशेखर पाण्ड्य ने बनवाया, और चित्र गोपुर मारवर्मन् सुन्दर पाण्ड्य द्वितीय की देन है। सन् 1310 (विक्रम संवत् 1367) में दिल्ली सल्तनत के सेनापति मलिक काफ़ूर के दक्षिण अभियान में मंदिर लूटा और ध्वस्त हुआ, और लगभग ढाई शताब्दी तक वह खंडित पड़ा रहा। पुनर्निर्माण मदुरै के प्रथम नायक शासक विश्वनाथ नायक (सन् 1559–1600, विक्रम संवत् 1616–1657) ने अपने प्रधानमंत्री अरियनाथ मुदलियार के साथ शिल्प-शास्त्र के अनुसार कराया, और नगर की गलियाँ भी उसी वास्तु-विन्यास में फिर से बसाई गईं। सन् 1569 (विक्रम संवत् 1626) में आयिरक्काल मण्डपम — सहस्र-स्तम्भ मण्डप, जिसमें वास्तव में 985 स्तम्भ हैं — बना। तिरुमलै नायक (सन् 1623–1655, विक्रम संवत् 1680–1712) के काल में अनेक मण्डप जुड़े और परिसर ने आज का विस्तार पाया। सन् 1959 में जन-सहयोग से जीर्णोद्धार आरम्भ हुआ, जो सन् 1995 में पूर्ण हुआ; आज मंदिर तमिलनाडु हिन्दू धार्मिक एवं धर्मादाय बंदोबस्ती विभाग के प्रबंध में है।',
        bodyEn:
          'No inscription gives a consecration date for the Madurai shrine; the temple is named in the Tevaram hymns of the seventh-century saint Tirugnana Sambandar, which shows it was already a living pilgrimage then. The oldest gopuram in the complex is the one over the Sundareswarar sanctum, built by Kulasekara Pandya, while the Chitra gopuram was raised by Maravarman Sundara Pandyan II. In 1310 CE (Vikram Samvat 1367) the temple was plundered and broken in the southern campaign of Malik Kafur, a commander of the Delhi Sultanate, and lay ruined for some two and a half centuries. The rebuilding was carried out by Viswanatha Nayak, first Nayak ruler of Madurai (1559–1600 CE, Vikram Samvat 1616–1657), with his minister Ariyanatha Mudaliar, following the shilpa shastra, and the streets of the city were laid out afresh on the same plan. The Ayirakkal Mandapam, the thousand-pillar hall that in fact carries 985 pillars, was built in 1569 CE (Vikram Samvat 1626). Under Tirumalai Nayak (1623–1655 CE, Vikram Samvat 1680–1712) many further halls were added and the complex reached the extent seen today. A restoration begun by public subscription in 1959 was completed in 1995, and the temple is now administered by the Tamil Nadu Hindu Religious and Charitable Endowments Department.',
      },
      {
        id: 'svarup',
        titleHi: 'मीनाक्षी का स्वरूप',
        titleEn: 'The Form of Meenakshi',
        bodyHi:
          'मीनाक्षी की प्रतिमा गहरे हरे पाषाण की है और खड़ी मुद्रा में, एक घुटना हल्का मुड़ा हुआ; हाथ में कमल है, जिस पर हरा तोता बैठा है — यही उनका सबसे पहचाना चिह्न है। परिसर में दो पृथक् गर्भगृह हैं: एक मीनाक्षी का और दूसरा सुन्दरेश्वर का, जहाँ शिव शिवलिंग रूप में पूजित होते हैं। परम्परा के अनुसार मीनाक्षी तीन स्तनों के साथ जन्मी थीं और वर से भेंट होते ही तीसरा स्तन लुप्त हो गया — यही कथा उनके नाम और उनके विवाह की स्मृति का आधार मानी जाती है। परिसर में चौदह गोपुर हैं — चार बाहरी और दस भीतरी — जिनमें दक्षिणी गोपुर सबसे ऊँचा है, नौ तलों में लगभग 52 मीटर। भीतर पोट्रामरै कुलम् — स्वर्ण-कमल सरोवर — है, जिसकी सीढ़ियों पर बैठकर भक्त और तीर्थयात्री दोनों गोपुरों का प्रतिबिम्ब देखते हैं।',
        bodyEn:
          'Meenakshi is carved in dark green stone and stands with one knee slightly bent, holding a lotus on which a green parrot sits — the mark by which her image is known at once. The complex holds two separate sanctums, one for Meenakshi and one for Sundareswarar, where Shiva is worshipped in the form of a lingam. Tradition holds that Meenakshi was born with three breasts and that the third vanished at the moment she met the husband destined for her, a story read as the origin of both her name and the memory of her wedding. Fourteen gopurams rise over the precinct — four outer and ten inner — of which the southern tower is the tallest, some 52 metres across nine tiers. Within lies the Potramarai Kulam, the Golden Lotus Tank, on whose steps devotees and pilgrims alike sit to watch the towers reflected in the water.',
      },
      {
        id: 'parampara',
        titleHi: 'पळ्ळियरै पूजा और नित्य सेवा',
        titleEn: 'The Palliyarai and the Daily Rite',
        bodyHi:
          'मदुरै की सबसे विशिष्ट परम्परा पळ्ळियरै पूजा है — दिन की अंतिम सेवा, जिसमें रात्रि लगभग नौ बजे सुन्दरेश्वर की स्वर्ण उत्सव-मूर्ति पालकी में बैठाकर, वाद्य और स्तोत्र-पाठ के साथ, गलियारों से होते हुए मीनाक्षी के शयन-कक्ष तक ले जाई जाती है; लगभग आधे घंटे की यह सेवा दिव्य दम्पति के पुनर्मिलन का प्रतीक है और इसी के बाद मंदिर के पट बंद होते हैं। परम्परा कहती है कि यह क्रम शताब्दियों से अटूट चला आ रहा है, और अनेक भक्त दिन में केवल इसी दर्शन के लिए आते हैं। प्रातः से रात्रि तक नित्य पूजाएँ चलती हैं और मीनाक्षी तथा सुन्दरेश्वर — दोनों गर्भगृहों में समानान्तर सेवा होती है। शुक्रवार देवी का वार माना जाता है, जब मीनाक्षी का विशेष अलंकार होता है और भीड़ सबसे अधिक रहती है।',
        bodyEn:
          'Madurai’s most distinctive custom is the Palliyarai Pooja, the last rite of the day: at about nine at night the golden processional image of Sundareswarar is placed on a palanquin and carried through the corridors, to music and chanting, into Meenakshi’s bedchamber. The rite takes roughly half an hour, stands for the nightly reunion of the divine couple, and only after it do the temple doors close. Tradition holds that the sequence has run unbroken for centuries, and many devotees come at that hour for this darshan alone. Worship runs from dawn to night, with the two sanctums — Meenakshi’s and Sundareswarar’s — served in parallel through the day. Friday is kept as the goddess’s day, when Meenakshi receives a special adornment and the crowds are heaviest.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा उत्सव चैत्तिरै तिरुविऴा है, जो तमिल मास चैत्तिरै (अप्रैल–मई) में लगभग दो सप्ताह चलता है और मदुरै को मेले में बदल देता है। आठवें दिन मीनाक्षी पट्टाभिषेकम् — देवी का राज्याभिषेक — होता है, नवें दिन दिग्विजय, और दसवें दिन तिरुक्कल्याणम्, अर्थात् मीनाक्षी और सुन्दरेश्वर का दिव्य विवाह, जिसे देखने लाखों लोग आते हैं। इसके तुरन्त बाद उत्सव का दूसरा चरण आता है: ग्यारहवें-बारहवें दिन अऴगर् कोविल से कल्लऴगर् स्वर्ण अश्व पर मदुरै की ओर चलते हैं और वैगै नदी में उतरते हैं — बहन के विवाह में पहुँचने की कथा, जो शैव और वैष्णव दोनों धाराओं को एक ही उत्सव में जोड़ देती है। मंदिर में वर्ष भर अन्य उत्सव भी होते हैं, पर चैत्तिरै ही मदुरै की पहचान है।',
        bodyEn:
          'The year turns on the Chithirai Thiruvizha, kept for about a fortnight in the Tamil month of Chithirai (April–May), which turns the whole of Madurai into a fair. The eighth day brings the Meenakshi Pattabhishekam, the coronation of the goddess; the ninth her Dig Vijaya, the conquest of the quarters; and the tenth the Thirukalyanam, the divine wedding of Meenakshi and Sundareswarar, watched by lakhs of people. The festival’s second leg follows at once: on the eleventh or twelfth day Kallazhagar rides out from Azhagar Kovil on a golden horse towards Madurai and steps down into the Vaigai — the story of a brother arriving for his sister’s wedding, which binds the Shaiva and Vaishnava streams into a single celebration. Other festivals fill the temple calendar through the year, but it is Chithirai by which Madurai is known.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर तमिलनाडु के मदुरै ज़िले में, वैगै नदी के तट पर बसे पुराने नगर के ठीक बीच में है, और नगर की गलियाँ मंदिर के चारों ओर संकेन्द्रित वर्गों में बसी हैं। मदुरै जंक्शन रेलवे स्टेशन लगभग 2 किमी दूर है और मदुरै हवाई अड्डा लगभग 11 किमी; दोनों से मंदिर तक सीधी सड़क है। यात्रा में प्रायः तिरुप्परंकुन्द्रम् का मुरुगन मंदिर जोड़ा जाता है, जो नगर से लगभग 7–8 किमी दूर है, और मदुरै से लगभग 21 किमी उत्तर-पूर्व में अऴगर् कोविल, जहाँ से चैत्तिरै उत्सव में कल्लऴगर् वैगै की ओर चलते हैं। अनेक तीर्थयात्री मदुरै के बाद रामेश्वरम् की ओर बढ़ते हैं, और यह दक्षिण की सबसे प्रचलित यात्रा-कड़ियों में है।',
        bodyEn:
          'The temple stands at the very centre of the old city of Madurai, in Madurai district of Tamil Nadu, on the banks of the Vaigai, with the city’s streets laid out in concentric squares around it. Madurai Junction railway station is about 2 km away and Madurai airport about 11 km, both with a straight road to the temple. Pilgrims commonly add the Murugan temple at Thiruparankundram, roughly 7–8 km from the city, and Azhagar Kovil, about 21 km to the north-east, from where Kallazhagar rides down to the Vaigai during Chithirai. Many carry the journey on from Madurai to Rameshwaram, one of the best-travelled links in the southern circuit.',
      },
    ],
  },
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

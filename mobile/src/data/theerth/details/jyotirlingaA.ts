import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Jyotirlingas A.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: mahakaleshwar omkareshwar
 */
export const details: Record<string, TempleDetail> = {
  somnath: {
    significanceHi: 'गिर सोमनाथ ज़िले के प्रभास पाटन में अरब सागर के तट पर खड़ा सोमनाथ द्वादश ज्योतिर्लिङ्गों में आदि ज्योतिर्लिङ्ग माना जाता है। वर्तमान मंदिर की प्राण-प्रतिष्ठा वैशाख शुक्ल पंचमी, विक्रम संवत् 2008 (11 मई 1951) को भारत के प्रथम राष्ट्रपति डॉ. राजेन्द्र प्रसाद के हाथों हुई थी। बार-बार ध्वस्त होकर बार-बार उठ खड़े होने की इसकी कथा ही इसे शिव-भक्ति और पुनर्निर्माण-संकल्प का सबसे बड़ा प्रतीक बनाती है।',
    significanceEn: 'Standing on the Arabian Sea shore at Prabhas Patan in Gir Somnath district, Somnath is revered as the Adi Jyotirlinga, first of the twelve. The present temple was consecrated on Vaishakh Shukla Panchami, Vikram Samvat 2008 (11 May 1951), by Dr. Rajendra Prasad, India’s first President. Its record of being razed and raised again and again is exactly what makes it the great emblem of Shiva devotion and of the resolve to rebuild.',
    originStoryHi: 'शिव पुराण की कथा के अनुसार चन्द्रमा ने दक्ष प्रजापति की सत्ताईस कन्याओं से विवाह किया पर स्नेह केवल रोहिणी पर रखा, जिससे रुष्ट होकर दक्ष ने उन्हें क्षीण होते जाने का श्राप दिया। परम्परा कहती है कि सोमराज चन्द्र प्रभास क्षेत्र आए, सरस्वती में स्नान कर शिव की आराधना की और शिव ने प्रसन्न होकर उनका तेज लौटाया — इसी से चन्द्रमा घटते-बढ़ते रहते हैं। कृतज्ञ सोम ने यहीं शिव का मंदिर बनवाया और वह लिङ्ग सोमनाथ कहलाया।',
    originStoryEn: 'The Shiva Purana relates that Chandra — Somraj, the moon — married the twenty-seven daughters of Daksha Prajapati but loved only Rohini, and Daksha cursed him to wane away. By tradition Chandra came to Prabhas Kshetra, bathed in the Saraswati and worshipped Shiva, who restored his light on the condition that he would wax and wane by turns — which is why the moon does so still. In gratitude Soma raised a shrine to Shiva on that shore, and the linga there has been called Somnath ever since.',
    sources: [
      { label: 'Shree Somnath Trust', url: 'https://somnath.org/' },
      { label: 'Gujarat Tourism - Somnath Temple', url: 'https://gujarattourism.com/saurashtra/gir-somnath/somnath-temple.html' },
      { label: 'District Gir Somnath - History', url: 'https://girsomnath.nic.in/about-district/history/' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'परम्परा के अनुसार प्रभास तट पर पहला मंदिर स्वयं सोम ने स्वर्ण का बनवाया, त्रेता में रावण ने रजत का और द्वापर में श्रीकृष्ण ने काष्ठ का; ऐतिहासिक काल में सोलंकी नरेश भीमदेव प्रथम और बाद में कुमारपाल ने इसे बारहवीं शताब्दी में पत्थर से पुनः खड़ा किया। बार-बार के आक्रमणों और विध्वंस के बाद इन्दौर की महारानी अहिल्याबाई होल्कर ने विक्रम संवत् 1840 (सन् 1783) में खंडहरों के पास एक नया मंदिर बनवाया ताकि पूजा कभी न रुके — वही आज "अहिल्याबाई मंदिर" या पुराना सोमनाथ कहलाता है। स्वतंत्रता के तुरन्त बाद, नवम्बर 1947 में जूनागढ़ के भारत में विलय के समय सरदार वल्लभभाई पटेल, के. एम. मुंशी और एन. वी. गाडगिल के साथ इन्हीं खंडहरों पर खड़े होकर संकल्प लिया कि मंदिर जन-सहयोग से पुनः बनेगा, सरकारी कोष से नहीं। नया मंदिर गुजरात के सोमपुरा सलाट शिल्पियों ने गढ़ा और प्राण-प्रतिष्ठा वैशाख शुक्ल पंचमी, विक्रम संवत् 2008 (11 मई 1951) को डॉ. राजेन्द्र प्रसाद ने की, जिसमें 108 तीर्थों तथा सातों सागरों के जल से अभिषेक हुआ। आज मंदिर की व्यवस्था श्री सोमनाथ ट्रस्ट के हाथ में है।',
        bodyEn: 'By tradition the first shrine on the Prabhas shore was raised in gold by Soma himself, in silver by Ravana in the Treta age and in wood by Krishna in the Dvapara; in historical time the Solanki kings Bhima I and later Kumarapala rebuilt it in stone during the twelfth century. After repeated raids and demolitions, Ahilyabai Holkar, the Maratha queen of Indore, built a fresh temple beside the ruins in Vikram Samvat 1840 (1783 CE) so that worship would never lapse — it is still known as the Ahilyabai temple, or Old Somnath. Soon after Independence, during Junagadh’s accession in November 1947, Sardar Vallabhbhai Patel stood at those ruins with K. M. Munshi and N. V. Gadgil and resolved that the temple would rise again on public donation rather than state funds. The new temple was cut by the Sompura Salat master masons of Gujarat, and its pran-pratishtha was performed on Vaishakh Shukla Panchami, Vikram Samvat 2008 (11 May 1951) by Dr. Rajendra Prasad, who consecrated the linga with water gathered from 108 tirthas and the seven seas. The shrine is administered today by the Shree Somnath Trust.',
      },
      {
        id: 'svarup',
        titleHi: 'सोमनाथ महादेव का स्वरूप',
        titleEn: 'The Form of Somnath Mahadev',
        bodyHi: 'गर्भगृह में सोमनाथ महादेव स्वयं लिङ्ग-रूप में विराजते हैं; सामने सभामंडप और नृत्यमंडप की तीन-खंडी योजना है, जिसे शिल्पशास्त्र में "कैलास महामेरु प्रासाद" कहा जाता है। मंदिर चालुक्य या मारू-गुर्जर शैली में बलुआ पत्थर से बना है — तराशे हुए स्तम्भ, उत्कीर्ण तोरण, चाँदी जड़े द्वार और मंडप के सम्मुख विशाल नन्दी। लगभग 150 फुट ऊँचे शिखर पर लगभग दस टन का कलश और उस पर ध्वजदंड है, जिसकी ध्वजा दिन में कई बार बदली जाती है। समुद्र की ओर की सुरक्षा-दीवार पर बाणस्तम्भ खड़ा है, जिसके विषय में कहा जाता है कि यहाँ से सीधी दक्षिण रेखा में अंटार्कटिका तक कोई भूमि नहीं पड़ती।',
        bodyEn: 'In the sanctum Somnath Mahadev is worshipped in his linga form, fronted by a three-part plan of garbhagriha, sabhamandap and nrityamandap that the shilpa texts name the Kailash Mahameru Prasad. The temple is cut in sandstone in the Chaulukya or Maru-Gurjara manner — turned pillars, carved toranas, silver-clad doors and a large Nandi facing the hall. Its shikhara rises roughly 150 feet to a kalash of about ten tonnes, above which a flagstaff carries a dhwaja that is changed several times each day. On the sea wall stands the Banastambha, the arrow pillar, of which it is said that no land lies on a straight line south from here until Antarctica.',
      },
      {
        id: 'parampara',
        titleHi: 'रुद्राभिषेक और सोमवार सेवा',
        titleEn: 'Rudrabhishek and Monday Seva',
        bodyHi: 'सोमनाथ की मुख्य सेवा रुद्राभिषेक है — जल, दूध, दही, घृत, मधु और गंगाजल से लिङ्ग का अभिषेक, जो ट्रस्ट की व्यवस्था में प्रातः और अपराह्न दोनों कालों में यजमान-सहित सम्पन्न होता है; बेलपत्र, धतूरा और श्वेत पुष्प यहाँ का प्रिय अर्पण माने जाते हैं। दर्शन प्रातः लगभग छह बजे से रात्रि दस बजे तक चलते हैं और दिन में तीन आरतियाँ होती हैं — प्रातः सात, मध्याह्न बारह और सायं सात बजे; सायंकालीन आरती सबसे अधिक भीड़ खींचती है। सोमवार, और विशेषकर श्रावण के सोमवार, यहाँ सबसे व्यस्त दिन रहते हैं, जब भक्त जल लेकर लम्बी पंक्तियों में लिङ्ग-अभिषेक के लिए आते हैं। सायं आरती के बाद मंदिर परिसर में ध्वनि-प्रकाश कार्यक्रम "जय सोमनाथ" चलता है, जिसमें मंदिर के ध्वंस और पुनर्निर्माण की गाथा सुनाई जाती है।',
        bodyEn: 'Somnath’s central seva is the Rudrabhishek — the linga bathed in water, milk, curd, ghee, honey and Ganga water, offered under the Trust’s arrangement in both a morning and an afternoon slot with the sponsoring devotee present; bel leaves, dhatura and white flowers are the offerings favoured here. Darshan runs from about six in the morning to ten at night, with three aartis a day at roughly 7 a.m., noon and 7 p.m., the evening one drawing the densest crowd. Mondays, and above all the Mondays of Shravan, are the busiest days, when devotees queue far beyond the mandap carrying water for the abhishek. After the evening aarti the precinct hosts the sound-and-light programme Jay Somnath, which recounts the shrine’s destructions and rebuildings.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'वर्ष का सबसे बड़ा पर्व महाशिवरात्रि — फाल्गुन कृष्ण चतुर्दशी — है, जब रात्रि भर चार प्रहर की पूजा चलती है और मंदिर दर्शनार्थियों के लिए विस्तारित समय तक खुला रहता है। श्रावण मास पूरा उत्सव-काल रहता है; प्रत्येक सोमवार विशेष श्रृंगार और अभिषेक होते हैं। कार्तिक पूर्णिमा पर त्रिवेणी संगम के निकट गोलोकधाम क्षेत्र में पाँच दिन का पारम्परिक मेला लगता है, जो सन् 1955 से निरन्तर भरता आ रहा है; इन दिनों मंदिर रात ग्यारह बजे तक खुला रहता है। ट्रस्ट गोलोकधाम उत्सव भी आयोजित करता है, और वैशाख शुक्ल पंचमी (11 मई) को प्राण-प्रतिष्ठा दिवस मनाया जाता है।',
        bodyEn: 'The year’s greatest observance is Mahashivratri on Phalgun Krishna Chaturdashi, when the four watches of the night are kept with successive pujas and the temple stays open on extended hours. The whole month of Shravan is festive, each Monday bringing a special shringar and abhishek. On Kartik Purnima a five-day fair is held near Golokdham by the Triveni Sangam, kept without a break since 1955, and through those days the temple remains open until about eleven at night. The Trust also holds the Golokdham Utsav, and Vaishakh Shukla Panchami — marked on 11 May — is observed as the temple’s Pran-Pratishtha day.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'मंदिर गुजरात के गिर सोमनाथ ज़िले में प्रभास पाटन में है — वेरावल जंक्शन से लगभग 7 किमी और सोमनाथ टर्मिनस रेलवे स्टेशन से लगभग 2.5 किमी। निकटतम हवाई अड्डे केशोद (लगभग 57 किमी) और दीव (लगभग 85 किमी) हैं; जूनागढ़ यहाँ से लगभग 82 किमी उत्तर पड़ता है। परिसर के पास ही तीन तीर्थ हैं जिन्हें यात्री एक ही दिन में जोड़ लेते हैं — भालका तीर्थ, जहाँ की मान्यता है कि श्रीकृष्ण को व्याध का बाण लगा; हिरण, कपिला और सरस्वती का त्रिवेणी संगम; और संगम के पास लगभग 2 किमी दूर गीता मंदिर। मुख्य मंदिर से थोड़ी दूर अहिल्याबाई का पुराना सोमनाथ मंदिर भी दर्शनीय है। अधिकांश तीर्थयात्री सोमनाथ को द्वारका के साथ एक ही सौराष्ट्र-यात्रा में बाँधते हैं।',
        bodyEn: 'The temple stands at Prabhas Patan in Gir Somnath district of Gujarat — roughly 7 km from Veraval Junction and about 2.5 km from Somnath Terminus railway station. The nearest airports are Keshod (approximately 57 km) and Diu (approximately 85 km), while Junagadh lies about 82 km to the north. Three tirthas close by are usually taken in the same day: Bhalka Tirth, held by tradition to be where a hunter’s arrow struck Krishna; the Triveni Sangam where the Hiran, Kapila and Saraswati meet; and the Gita Mandir about 2 km away beside that confluence. A short walk from the main shrine stands Ahilyabai’s Old Somnath temple, still visited. Most pilgrims pair Somnath with Dwarka in a single Saurashtra yatra.',
      },
    ],
  },
  mallikarjuna: {
    significanceHi: 'नल्लमला पहाड़ियों पर कृष्णा नदी के तट पर बसा श्रीशैलम एकमात्र ऐसा क्षेत्र है जो द्वादश ज्योतिर्लिङ्गों और अष्टादश महाशक्ति पीठों — दोनों में गिना जाता है; यहाँ शिव मल्लिकार्जुन रूप में और देवी भ्रमराम्बा रूप में एक ही परिसर में पूजित हैं। वर्तमान गर्भगृह की मूर्तियाँ विजयनगर नरेश हरिहर राय द्वितीय के जीर्णोद्धार में विक्रम संवत् 1461 (सन् 1404) में प्रतिष्ठित हुईं, जबकि पर्वत का उल्लेख दूसरी शताब्दी के सातवाहन-कालीन नासिक प्रशस्ति तक जाता है। यहीं आदि शंकराचार्य ने शिवानन्द लहरी की रचना की मानी जाती है।',
    significanceEn: 'Set on the Nallamala hills above the Krishna river, Srisailam is the one kshetra counted both among the twelve Jyotirlingas and among the eighteen Maha Shakti Peethas, with Shiva as Mallikarjuna and the Devi as Bhramaramba served within a single enclosure. The images now in the sanctum were enshrined in the restoration of the Vijayanagara king Harihara Raya II in Vikram Samvat 1461 (1404 CE), while the hill itself is named as early as the second-century Satavahana inscription known as the Nasik Prashasti. Adi Shankara is held to have composed the Shivananda Lahari here.',
    originStoryHi: 'शिव पुराण की कथा के अनुसार कार्तिकेय रूठकर कैलास छोड़ क्रौंच पर्वत पर जा बसे, और पुत्र-वियोग में व्याकुल शिव-पार्वती उन्हें मनाने वहीं पहुँचे। परम्परा कहती है कि शिव ने अर्जुन और पार्वती ने मल्लिका का रूप लिया, और दोनों उसी पर्वत पर मल्लिकार्जुन नाम से भक्तों के लिए ठहर गए। एक अन्य लोककथा में चन्द्रावती नामक राजकुमारी ने यहाँ मल्लिका-पुष्पों से शिव की अर्चना की, और जिस स्थान पर कपिला गाय का दूध स्वयं बहता था वहाँ खोदने पर स्वयम्भू लिङ्ग प्रकट हुआ।',
    originStoryEn: 'The Shiva Purana tells that Kartikeya left Kailash in anger and settled on Mount Krauncha, and that Shiva and Parvati, grieving for their son, followed him there. By tradition Shiva took the form of Arjuna and Parvati that of Mallika, the jasmine, and the two remained on the hill for devotees as Mallikarjuna. A second local tradition tells of the princess Chandravati, who worshipped Shiva here with jasmine garlands and, digging where a Kapila cow let her milk flow of its own accord, uncovered a self-manifest linga.',
    sources: [
      { label: 'Srisaila Devasthanam', url: 'https://www.srisailadevasthanam.org/' },
      { label: 'Sri Bhramaramba Mallikarjuna Swamy Vari Devasthanam - History', url: 'https://tms.ap.gov.in/SSLBMS/cnt/History' },
      { label: 'Mallikarjuna Temple, Srisailam - Reference', url: 'https://en.wikipedia.org/wiki/Mallikarjuna_Temple,_Srisailam' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'श्रीशैल पर्वत का उल्लेख दूसरी शताब्दी की सातवाहन-कालीन नासिक प्रशस्ति में मिलता है, इसलिए यहाँ की उपासना-परम्परा को अत्यन्त प्राचीन माना जाता है। लोककथा इसे राजकुमारी चन्द्रावती से जोड़ती है, जिसने मल्लिका-पुष्पों से अर्चना की और जहाँ कपिला गाय का दूध स्वयं भूमि में समाता था वहाँ खोदने पर स्वयम्भू लिङ्ग पाया — उसी लिङ्ग पर आगे चलकर मंदिर उठा। मध्यकाल में रेड्डि नरेश इस क्षेत्र के बड़े सेवक रहे; उनके काल में वीरशिरो मंडपम् बना और कृष्णा नदी तक उतरने वाली पाताल गंगा की सीढ़ियाँ बनीं। विजयनगर साम्राज्य के हरिहर राय द्वितीय ने विक्रम संवत् 1461 (सन् 1404) में बड़ा जीर्णोद्धार कराया — इसी में मल्लिकार्जुन स्वामी और भ्रमराम्बा देवी की वर्तमान मूर्तियाँ प्रतिष्ठित हुईं, मुखमंडपम् बना और दक्षिण दिशा में गोपुरम् खड़ा हुआ। परम्परा के अनुसार आदि शंकराचार्य ने यहीं ठहरकर शिवानन्द लहरी रची, और वीरशैव संत अक्कमहादेवी की साधना-भूमि श्रीशैल के कदली वन को माना जाता है। आज मंदिर की व्यवस्था श्री भ्रमराम्बा मल्लिकार्जुन स्वामी वारि देवस्थानम् के अधीन है।',
        bodyEn: 'The hill of Srisailam is named in the second-century Satavahana record known as the Nasik Prashasti, which makes the worship here among the oldest attested in the Deccan. Local tradition ties its beginning to the princess Chandravati, who worshipped with jasmine and, digging at the spot where a Kapila cow let her milk sink into the earth, found a self-manifest linga over which the shrine later rose. In medieval times the Reddi rulers were among its greatest patrons; the Veera Siro Mandapam and the long flight of steps down to the Patala Ganga on the Krishna belong to their patronage. The Vijayanagara king Harihara Raya II carried out the great restoration of Vikram Samvat 1461 (1404 CE), in which the present images of Mallikarjuna Swamy and Bhramaramba Devi were enshrined, the Mukha Mandapam built and a gopuram raised on the southern side. By tradition Adi Shankara stayed here and composed the Shivananda Lahari, and the Kadali forest of Srisailam is remembered as the ground where the Veerashaiva saint Akka Mahadevi completed her sadhana. The shrine is administered today by the Sri Bhramaramba Mallikarjuna Swamy Vari Devasthanam.',
      },
      {
        id: 'svarup',
        titleHi: 'मल्लिकार्जुन का स्वरूप',
        titleEn: 'The Form of Mallikarjuna',
        bodyHi: 'गर्भगृह में मल्लिकार्जुन स्वामी स्वयम्भू लिङ्ग-रूप में विराजते हैं — आकार में अपेक्षाकृत छोटा, किन्तु ज्योतिर्लिङ्ग-परम्परा में अत्यन्त प्रभावशाली माना जाने वाला। उनके निकट ही स्वतंत्र गर्भगृह में देवी भ्रमराम्बा विराजती हैं, जिन्हें सती के ग्रीवा-अंग का शक्ति पीठ माना जाता है; शिव और शक्ति का यह साथ-साथ विग्रह ही श्रीशैल की विशेषता है। सम्पूर्ण परिसर विशाल पाषाण-प्राकार से घिरा है — लगभग 183 मीटर लम्बा, 152 मीटर चौड़ा और लगभग साढ़े आठ मीटर ऊँचा — जिसकी बाहरी दीवारों पर पुराण-कथाओं के उत्कीर्ण पट्ट पंक्तिबद्ध चलते हैं और चारों दिशाओं में गोपुर-द्वार हैं। गर्भगृह के आगे विजयनगर-कालीन मुखमंडपम् है, जिसके स्तम्भों पर बारीक शिल्प उकेरा गया है।',
        bodyEn: 'In the sanctum Mallikarjuna Swamy stands as a swayambhu linga — modest in size, yet counted among the most potent of the Jyotirlingas. Beside him, in her own sanctum, sits Bhramaramba Devi, honoured as the Shakti Peetha where the neck of Sati is said to have fallen; this joint presence of Shiva and Shakti in one enclosure is what sets Srisailam apart. The whole complex is ringed by a massive stone prakara roughly 183 metres by 152 metres and about eight and a half metres high, its outer faces carrying bands of relief panels from the Puranas, with gopura gateways at the four cardinal points. Before the sanctum stands the Vijayanagara-period Mukha Mandapam, its pillars worked in fine relief.',
      },
      {
        id: 'parampara',
        titleHi: 'स्पर्श दर्शन और बिल्वार्चन',
        titleEn: 'Sparsha Darshan and Bilva Archana',
        bodyHi: 'श्रीशैल की सबसे विशिष्ट परम्परा स्पर्श दर्शन है — नियत समय में भक्त स्वयं गर्भगृह में जाकर स्वयम्भू लिङ्ग का स्पर्श कर अभिषेक कर सकते हैं, जो अधिकांश ज्योतिर्लिङ्गों में सुलभ नहीं। अर्चना में बिल्वपत्र प्रमुख है; महाशिवरात्रि पर लक्ष बिल्वार्चन और पंचामृत अभिषेक होते हैं, और रुद्राभिषेक तथा होम देवस्थानम् की नियमित सेवाओं में गिने जाते हैं। दर्शन-क्रम प्रातःकालीन महामंगल आरती से आरम्भ होकर रात्रि की शयन सेवा पर समाप्त होता है, और मल्लिकार्जुन के बाद भ्रमराम्बा देवी के दर्शन से ही यात्रा पूर्ण मानी जाती है। सोमवार और कार्तिक मास के दिन यहाँ सर्वाधिक भीड़ के रहते हैं, जब दीप-अर्पण की परम्परा विशेष रूप से निभाई जाती है।',
        bodyEn: 'Srisailam’s most distinctive custom is the sparsha darshan: at appointed hours devotees may enter the sanctum and touch the swayambhu linga to perform the abhishek themselves, a liberty granted at few other Jyotirlingas. Bel leaves lead the archana here; Mahashivratri brings the Laksha Bilvarchana and the panchamruta abhishekam, while rudrabhishekam and homams run through the Devasthanam’s regular seva list. The day opens with the early-morning maha mangala aarti and closes with the night shayana seva, and the yatra is held complete only when darshan of Bhramaramba Devi follows that of Mallikarjuna. Mondays and the whole of Karthika masam draw the heaviest crowds, when the offering of lamps is kept with particular care.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'वर्ष का सबसे बड़ा उत्सव महाशिवरात्रि ब्रह्मोत्सवम् है, जो फाल्गुन कृष्ण चतुर्दशी के आसपास कई दिनों तक चलता है; रात्रि भर जागरण, रथोत्सव और लक्ष बिल्वार्चन इसके प्रमुख अंग हैं। चैत्र शुक्ल प्रतिपदा को उगादि — तेलुगु नववर्ष — पर विशेष पूजा और पंचांग-श्रवण होता है। आश्विन शुक्ल पक्ष में नवरात्रि उत्सवम् देवी भ्रमराम्बा के निमित्त मनाया जाता है, जिसमें नौ दिन देवी के अलग-अलग अलंकार होते हैं। कार्तिक मास पूरा दीपोत्सव-काल रहता है — प्रतिदिन दीपार्पण, पंचामृत अभिषेक और सायंकालीन विशेष पूजाएँ; इन्हीं दिनों कृष्णा-तट की पाताल गंगा पर स्नान करने वालों की संख्या सबसे अधिक रहती है।',
        bodyEn: 'The year’s greatest celebration is the Mahashivratri Brahmotsavam around Phalgun Krishna Chaturdashi, spread over several days of night-long vigil, chariot procession and the Laksha Bilvarchana. Ugadi, the Telugu new year on Chaitra Shukla Pratipada, is kept with special pujas and the reading of the year’s almanac. In the bright fortnight of Ashwin the Navaratri Utsavams honour Bhramaramba Devi, the goddess given a different alankaram on each of the nine days. The whole of Karthika masam is a season of lamps — daily deepam offerings, panchamruta abhishekam and special evening worship — and it is then that bathers are thickest at the Patala Ganga on the Krishna below.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'श्रीशैलम आंध्र प्रदेश के नंद्याल ज़िले में नल्लमला वन के भीतर पहाड़ी पर है — कुरनूल से लगभग 180 किमी, नंद्याल से लगभग 160 किमी, मार्कापुर से लगभग 80 किमी और हैदराबाद से लगभग 230 किमी। यहाँ अपना रेलवे स्टेशन नहीं है; निकटतम रेलहेड मार्कापुर रोड लगभग 85 किमी दूर है और कुरनूल तथा नंद्याल भी प्रयोग होते हैं। निकटतम बड़ा हवाई अड्डा हैदराबाद है, लगभग 200–220 किमी। मार्ग नल्लमला के संरक्षित वन से होकर जाता है, इसलिए रात्रि में आवागमन प्रायः बंद रहता है — यात्रा दिन में ही नियोजित करें। परिसर के पास साक्षी गणपति मंदिर है, जहाँ की मान्यता है कि गणपति प्रत्येक यात्री के दर्शन की साक्षी रखते हैं; नीचे कृष्णा-तट पर पाताल गंगा स्नान-घाट, और आसपास हटकेश्वरम्, शिखरेश्वरम् तथा अक्कमहादेवी गुफाएँ दर्शनीय हैं। शैव-शाक्त दोनों परम्पराओं के यात्री इसे भ्रमराम्बा शक्ति पीठ के साथ एक ही यात्रा में पूर्ण करते हैं।',
        bodyEn: 'Srisailam sits on a hill inside the Nallamala forest in Nandyal district of Andhra Pradesh — roughly 180 km from Kurnool, about 160 km from Nandyal, some 80 km from Markapur and around 230 km from Hyderabad. The town has no railway station of its own; the nearest railhead is Markapur Road, approximately 85 km away, with Kurnool and Nandyal also used. The nearest major airport is Hyderabad, approximately 200–220 km out. The approach runs through protected Nallamala forest, where night movement is generally closed, so the journey is best planned by daylight. Close to the temple stands the Sakshi Ganapati shrine, where Ganapati is believed to keep the record of every pilgrim’s visit; below, on the Krishna, lies the Patala Ganga bathing ghat, and Hatakeswaram, Shikareswaram and the Akka Mahadevi caves lie within a short drive. Pilgrims of both the Shaiva and Shakta traditions complete the visit by pairing the Jyotirlinga with the Bhramaramba Shakti Peetha in one yatra.',
      },
    ],
  },
};

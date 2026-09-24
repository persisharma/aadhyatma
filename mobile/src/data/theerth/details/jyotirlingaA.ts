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
 * Temples still to author in this chunk: mallikarjuna mahakaleshwar omkareshwar
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
};

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
 * All four temples in this chunk carry the full §12.6 reading.
 */
export const details: Record<string, TempleDetail> = {
  brihadeeswarar: {
    significanceHi:
      'तंजावुर का बृहदीश्वर मंदिर — शिलालेखों में राजराजेश्वरम् — चोल स्थापत्य की चरम कृति है और यूनेस्को की “ग्रेट लिविंग चोल टेम्पल्स” विश्व धरोहर का मुख्य अंग। इसके शिलालेख स्वयं प्रतिष्ठा-वर्ष दर्ज करते हैं: चोल सम्राट राजराज प्रथम ने इसे सन् 1003 से 1010 (विक्रम संवत् 1060–1067) के बीच बनवाया और सन् 1010 में विमान के शिखर पर स्वर्ण-कलश अर्पित किया। एक सहस्राब्दी बाद भी यहाँ नित्य शिव-पूजा चलती है, इसीलिए इसे “जीवित” चोल मंदिर कहा जाता है।',
    significanceEn:
      'The Brihadisvara temple at Thanjavur — Rajarajeswaram in its own inscriptions — is the summit of Chola architecture and the principal member of the UNESCO World Heritage site known as the Great Living Chola Temples. Its inscriptions themselves record the year of consecration: the Chola emperor Rajaraja I raised it between 1003 and 1010 CE (Vikram Samvat 1060–1067) and in 1010 presented the gold finial set at the top of the vimana. Daily Shaiva worship has continued here for a thousand years since, which is what makes it a living Chola temple rather than a ruin.',
    originStoryHi:
      'यह मंदिर किसी स्वप्न या प्रकट-कथा से नहीं, एक सम्राट के संकल्प से खड़ा हुआ: राजराज प्रथम ने अपने साम्राज्य की राजधानी तंजावुर में शिव को वह मंदिर अर्पित किया जो उस काल में भारत का सबसे ऊँचा था। मंदिर का नाम राजराजेश्वरम् रखा गया और उसकी दीवारों पर स्वयं राजा के आदेश से दान, सेवाएँ और व्यवस्थाएँ विस्तार से उत्कीर्ण कराई गईं। परम्परा में चोल गुरु करुवूर देवर को राजा का मार्गदर्शक बताया जाता है, और गर्भगृह के परिक्रमा-पथ के भित्ति-चित्रों में राजा उन्हीं के साथ अंकित हैं।',
    originStoryEn:
      'This temple began not in a dream or a discovered image but in a sovereign resolve: Rajaraja I gave Shiva, in his imperial capital of Thanjavur, what was then the tallest temple in India. He named it Rajarajeswaram and had its walls engraved, at his own command, with a detailed record of its endowments, its services and its establishment. Tradition names the Chola preceptor Karuvur Devar as the king’s guide, and the frescoes in the passage around the sanctum show the two of them together.',
    sources: [
      { label: 'Archaeological Survey of India — Great Living Chola Temples', url: 'https://asi.nic.in/pages/WorldHeritageCholaTemples' },
      { label: 'Tamil Nadu Tourism — Brihadeeswara Temple, Thanjavur', url: 'https://www.tamilnadutourism.tn.gov.in/destinations/brihadeeswara-temple' },
      { label: 'UNESCO World Heritage Centre — Great Living Chola Temples', url: 'https://whc.unesco.org/en/list/250/' },
      { label: 'Utsav (Ministry of Tourism) — Sadhaya Vizha, Brihadeeswarar Temple', url: 'https://utsav.gov.in/view-event/sadhaya-vizha-brihadeeswarar-temple-1' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'दक्षिण भारत के अधिकांश प्राचीन मंदिरों के विपरीत तंजावुर के इस मंदिर की स्थापना अनुमान का विषय नहीं है — उसकी तिथि मंदिर की अपनी दीवारों पर लिखी है। चोल सम्राट राजराज प्रथम ने इसका निर्माण लगभग सन् 1003 से 1010 (विक्रम संवत् 1060–1067) के बीच कराया, और शिलालेख सन् 1010 (विक्रम संवत् 1067) में प्रतिष्ठा दर्ज करते हैं, जब राजा ने विमान के शीर्ष पर स्थापित होने वाला स्वर्ण-कलश भेंट किया; प्रतिष्ठा की तिथि-वार या प्रतिष्ठाकर्ता आचार्य का नाम अभिलेखों में नहीं मिलता। मंदिर का मूल नाम राजराजेश्वरम् था, अर्थात् “राजराज के ईश्वर का धाम”। राजा ने अपने आदेश से — अभिलेखों के अनुसार महल के पूर्व की ओर स्थित राजकीय स्नान-गृह में बैठकर — दान, भूमि, सेवाएँ और मंदिर की समस्त व्यवस्था विस्तार से उत्कीर्ण कराई, जिससे यह ग्यारहवीं शताब्दी के चोल प्रशासन का सबसे विस्तृत अभिलेखीय स्रोत बन गया। यह मंदिर गंगैकोण्ड चोलपुरम् के बृहदीश्वर और दारासुरम् के ऐरावतेश्वर मंदिरों के साथ यूनेस्को की “ग्रेट लिविंग चोल टेम्पल्स” विश्व धरोहर में सम्मिलित है और भारतीय पुरातत्त्व सर्वेक्षण द्वारा संरक्षित है, यद्यपि यहाँ पूजा अखंड चलती रही है।',
        bodyEn:
          'Unlike most ancient shrines of the south, the founding of the Thanjavur temple is not a matter of inference — its date is written on its own walls. The Chola emperor Rajaraja I had it built between about 1003 and 1010 CE (Vikram Samvat 1060–1067), and the inscriptions record the consecration in 1010 CE (Vikram Samvat 1067), when the king presented the gold finial to be set at the summit of the vimana; no tithi, weekday or consecrating acharya is named in the record. Its original name was Rajarajeswaram, the abode of Rajaraja’s Lord. At the king’s own command — the inscriptions say he dictated them seated in the royal bathing hall east of his palace — the gifts, lands, services and whole establishment of the temple were engraved in detail, which has made these walls the fullest epigraphic source for eleventh-century Chola administration. Together with the Brihadisvara temple at Gangaikonda Cholapuram and the Airavatesvara temple at Darasuram, it forms the UNESCO World Heritage site of the Great Living Chola Temples, and it is protected by the Archaeological Survey of India while worship has continued here without a break.',
      },
      {
        id: 'svarup',
        titleHi: 'बृहदीश्वर का स्वरूप',
        titleEn: 'The Form of Brihadeeswarar',
        bodyHi:
          'गर्भगृह में शिव बृहत् लिंग के रूप में विराजित हैं — लगभग 3.7 मीटर (बारह फुट) ऊँचा लिंग, जिसके आकार से ही मंदिर को “बृहदीश्वर” और लोक-भाषा में “पेरिय कोविल”, अर्थात् बड़ा मंदिर, कहा जाता है। उसके ऊपर लगभग 66 मीटर (216 फुट) ऊँचा विमान उठता है, जो तेरह क्रमशः छोटी होती मंज़िलों में शिखर तक जाता है; शीर्ष का कुम्भ एक ही पाषाण से गढ़ा है और उसका भार लगभग अस्सी टन आँका जाता है। पूरा ढाँचा ग्रेनाइट के सहस्रों टन पत्थरों से बना है, जिन्हें बिना गारे के जोड़ा गया है। गर्भगृह के सामने एकाश्म नंदी बैठे हैं — एक ही चट्टान से गढ़े, लगभग पच्चीस टन भारी; उनके माप के विवरण स्रोतों में थोड़े भिन्न हैं, प्रायः लगभग 3.7 मीटर ऊँचा और लगभग 6 मीटर लम्बा बताया जाता है। गर्भगृह के चारों ओर के सँकरे परिक्रमा-पथ में लगभग एक हज़ार वर्ष पुराने चोल भित्ति-चित्र सुरक्षित हैं, जिनमें त्रिपुरान्तक रूप में शिव, गुरु करुवूर देवर के साथ राजराज प्रथम, और नृत्यरत अप्सराएँ अंकित हैं।',
        bodyEn:
          'In the sanctum Shiva stands as a great linga, some 3.7 metres — about twelve feet — high, and it is from that scale that the temple takes the name Brihadeeswarar and, in everyday Tamil, Periya Koil, the big temple. Over it rises the vimana, about 66 metres or 216 feet tall, climbing in thirteen diminishing storeys; the cupola at its summit is carved from a single stone and is reckoned to weigh around eighty tonnes. The whole structure is built of thousands of tonnes of granite, the blocks set without mortar. Facing the sanctum sits a monolithic Nandi, cut from one rock and weighing some twenty-five tonnes; sources differ a little on its measurements, most giving it as roughly 3.7 metres high and about 6 metres long. In the narrow circumambulatory passage around the sanctum survive Chola frescoes close to a thousand years old, showing Shiva as Tripurantaka, Rajaraja I beside his guru Karuvur Devar, and dancers of the heavens.',
      },
      {
        id: 'parampara',
        titleHi: 'बृहत् लिंग की नित्य पूजा',
        titleEn: 'The Daily Worship of the Great Linga',
        bodyHi:
          'तंजावुर का मंदिर संग्रहालय नहीं है — एक सहस्राब्दी बाद भी यहाँ शैव विधि से नित्य पूजा होती है, और इसी कारण यूनेस्को की सूची में इसे “जीवित” चोल मंदिर कहा गया है। प्रतिदिन बृहत् लिंग का अभिषेक होता है और उसके विशाल आकार के कारण अभिषेक तथा अलंकार की व्यवस्था गर्भगृह के ऊपरी तल से भी की जाती है; भक्त नंदी के पीछे से, उसी सीध में, दर्शन करते हैं जिस सीध में नंदी सहस्र वर्षों से शिव की ओर देख रहे हैं। परिक्रमा-पथ में चलते हुए भक्त उन्हीं भित्ति-चित्रों के बीच से निकलते हैं जो राजराज के काल में चित्रित हुए थे, और बाहरी प्राकार की दीवारों पर उत्कीर्ण दान-लेख आज भी पढ़े जा सकते हैं। महाशिवरात्रि यहाँ का सबसे बड़ा व्रत-पर्व है, जब रात्रि-जागरण और प्रहर-वार अभिषेक होते हैं; सोमवार और प्रदोष-काल में भी विशेष भीड़ रहती है। स्मारक-संरक्षण और नित्य पूजा साथ-साथ चलते हैं — यही इस मंदिर की अपनी परम्परा है।',
        bodyEn:
          'Thanjavur is not a museum: a thousand years on, Shaiva worship is still offered here daily, and it is precisely this that earns it the word living in the UNESCO listing. The great linga is bathed each day, and because of its size the abhisheka and adornment are managed in part from the level above the sanctum floor; devotees take darshan from behind the Nandi, along the same line down which the bull has looked toward Shiva for a millennium. Walking the circumambulatory passage, they pass between the very frescoes painted in Rajaraja’s reign, and the endowment records cut into the outer walls can still be read where they were engraved. Maha Shivaratri is the greatest observance of the year, kept with a night-long vigil and abhisheka at each watch of the night; Mondays and the Pradosha hours also draw larger crowds. Conservation of the monument and daily worship run side by side — that balance is itself the temple’s tradition.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'मंदिर का विशिष्ट वार्षिक उत्सव सदय विऴा है, जो चोल सम्राट राजराज प्रथम की जयंती के रूप में तमिल मास ऐप्पसि (लगभग अक्टूबर के मध्य से नवम्बर के मध्य तक) में सदयम् नक्षत्र पर मनाया जाता है। उस दिन मंदिर के बाहर स्थित राजराज चोल की प्रतिमा को रेशमी वस्त्र पहनाए जाते हैं, और भीतर पेरुन्दीप वऴिपाडु — दीप-आरती — तथा स्वामी पुरप्पाडु, अर्थात् उत्सव-मूर्ति की शोभायात्रा, होती है; यह संभवतः भारत का एकमात्र मंदिर-उत्सव है जो अपने निर्माता की स्मृति में मनाया जाता है। शैव पंचांग का सबसे बड़ा पर्व महाशिवरात्रि है, जब रात भर जागरण और चार प्रहरों के अभिषेक होते हैं। सन् 2010 में मंदिर की प्रतिष्ठा के एक सहस्र वर्ष पूर्ण होने पर विशेष समारोह हुए थे, क्योंकि प्रतिष्ठा-वर्ष 1010 अभिलेखों में दर्ज है — ऐसी सहस्राब्दी-गणना बहुत कम मंदिरों के लिए सम्भव है।',
        bodyEn:
          'The temple’s own distinctive festival is the Sadaya Vizha, kept as the birth anniversary of Rajaraja Chola I in the Tamil month of Aippasi (roughly mid-October to mid-November) under the star Sadayam. On that day the statue of Rajaraja outside the temple is robed in silk, and within there is the perun-theepa vazhipaadu, the waving of great lamps, followed by the swami purappadu, the procession of the festival image; it is likely the only temple festival in India kept in memory of the king who built it. In the Shaiva calendar the greatest observance is Maha Shivaratri, with a vigil through the night and an abhisheka at each of the four watches. In 2010 the temple marked a thousand years since its consecration with special celebrations, which was possible precisely because the year 1010 is fixed in its own inscriptions — a millennium very few shrines can count with certainty.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर तमिलनाडु के तंजावुर ज़िले में, कावेरी डेल्टा के बीच बसे तंजावुर नगर के भीतर ही है। तंजावुर जंक्शन रेलवे स्टेशन लगभग 2 किमी दूर है और निकटतम हवाई अड्डा तिरुचिरापल्ली अन्तर्राष्ट्रीय हवाई अड्डा है, जो लगभग 60 किमी दूर पड़ता है; चेन्नई, मदुरै और तिरुचिरापल्ली से सीधी सड़क-सेवा है। यात्रा में प्रायः शेष दो “ग्रेट लिविंग चोल” मंदिर जोड़े जाते हैं — कुम्भकोणम् के निकट दारासुरम् का ऐरावतेश्वर मंदिर और जयनकोण्डम् के पास गंगैकोण्ड चोलपुरम् का बृहदीश्वर मंदिर, जिसे राजराज के पुत्र राजेन्द्र प्रथम ने बनवाया था। नगर में ही तंजावुर महल, सरस्वती महल पुस्तकालय और राजराज चोल संग्रहालय हैं, और कुम्भकोणम् तथा कावेरी-तट के अनेक शिव-स्थल इसी परिक्रमा में आते हैं।',
        bodyEn:
          'The temple stands within the town of Thanjavur itself, in Thanjavur district of Tamil Nadu, in the heart of the Kaveri delta. Thanjavur Junction railway station is about 2 km away, and the nearest airport is Tiruchirappalli International, roughly 60 km off, with direct road connections from Chennai, Madurai and Tiruchirappalli. Most pilgrims add the other two Great Living Chola temples — the Airavatesvara temple at Darasuram near Kumbakonam, and the Brihadisvara temple at Gangaikonda Cholapuram near Jayankondam, built by Rajaraja’s son Rajendra I. In the town itself are the Thanjavur palace, the Saraswathi Mahal Library and the Rajaraja Chola museum, and the Shiva shrines of Kumbakonam and the Kaveri bank fall naturally into the same circuit.',
      },
    ],
  },
  'konark-sun': {
    significanceHi:
      'पुरी ज़िले के समुद्र-तट के निकट बना कोणार्क का सूर्य मंदिर सूर्यदेव के विशाल पाषाण-रथ के रूप में रचा गया है और भारतीय स्थापत्य की सर्वोच्च कृतियों में गिना जाता है। पूर्वी गंग वंश के नरसिंहदेव प्रथम (शासनकाल सन् 1238–1264) ने इसे लगभग सन् 1250 (विक्रम संवत् 1307) में बनवाया; सन् 1984 से यह यूनेस्को विश्व धरोहर स्थल है और भारतीय पुरातत्त्व सर्वेक्षण द्वारा संरक्षित है। यहाँ अब नित्य पूजा नहीं होती — यह जीवित मंदिर नहीं, संरक्षित स्मारक है — किन्तु माघ सप्तमी का चन्द्रभागा स्नान आज भी लाखों श्रद्धालुओं को खींचता है।',
    significanceEn:
      'The Sun Temple at Konark, near the coast in Puri district, was conceived as a colossal stone chariot for Surya and counts among the highest achievements of Indian architecture. Narasimhadeva I of the Eastern Ganga dynasty (r. 1238–1264 CE) raised it around 1250 CE (Vikram Samvat 1307); since 1984 it has been a UNESCO World Heritage Site, maintained by the Archaeological Survey of India. Regular worship no longer continues here — it is a protected monument rather than a living shrine — yet the Magha Saptami bath at Chandrabhaga still draws pilgrims in their lakhs.',
    originStoryHi:
      'कथा के अनुसार नरसिंहदेव प्रथम ने अपनी विजयों के उपरान्त सूर्यदेव को वह रथ भेंट करने का संकल्प लिया जिस पर वे आकाश में चलते हैं, और कोणार्क की बालू-भूमि पर बारह जोड़ी पहियों वाला पाषाण-रथ खड़ा किया गया। लोक-मान्यता में इस कार्य में बारह सौ से अधिक शिल्पी बारह वर्षों तक लगे रहे। समुद्र से लौटते नाविकों को इसका काला शिखर दूर से दिखता था, इसीलिए वे इसे “ब्लैक पगोडा” कहते थे।',
    originStoryEn:
      'Accounts say that Narasimhadeva I, after his victories, vowed to give Surya the chariot on which he crosses the sky, and on the sandy ground at Konark a stone chariot on twelve pairs of wheels was raised. Tradition holds that more than twelve hundred artisans worked on it for some twelve years. Sailors returning from the sea could see its dark tower from far out, and it is from them that the monument took its old European name, the Black Pagoda.',
    sources: [
      { label: 'Archaeological Survey of India — Sun Temple, Konarak (1984), Odisha', url: 'https://asi.nic.in/pages/WorldHeritageKonarak' },
      { label: 'Odisha Tourism — Konark Dance Festival', url: 'https://odishatourism.gov.in/content/tourism/en/discover/about-odisha/events-of-odisha/Konark-Dance-Festival.html' },
      { label: 'UNESCO World Heritage Centre — Sun Temple, Konârak', url: 'https://whc.unesco.org/en/list/246/' },
      { label: 'Konark Sun Temple — Reference', url: 'https://en.wikipedia.org/wiki/Konark_Sun_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'कोणार्क का सूर्य मंदिर पूर्वी गंग वंश के राजा नरसिंहदेव प्रथम (शासनकाल सन् 1238–1264, विक्रम संवत् 1295–1321) ने लगभग सन् 1250 (विक्रम संवत् 1307) में बनवाया; किसी प्रतिष्ठा-तिथि, तिथि-वार या प्रतिष्ठाकर्ता आचार्य का अभिलेख उपलब्ध नहीं है। परम्परागत वृत्तान्तों में बारह सौ से अधिक शिल्पी लगभग बारह वर्ष तक इस पर लगे रहे। मुख्य देउल का विशाल शिखर काल के साथ गिर गया — अठारहवीं शताब्दी तक वह ढह चुका था — और आज केवल जगमोहन, नट-मन्दिर तथा रथ की पीठिका खड़ी है। सन् 1627 (विक्रम संवत् 1684) में खुर्दा के राजा गर्भगृह की सूर्य-प्रतिमा कोणार्क से हटाकर पुरी के जगन्नाथ मंदिर ले गए, और उसी के साथ यहाँ की नित्य पूजा समाप्त हो गई। सन् 1903 (विक्रम संवत् 1960) में बंगाल के उपराज्यपाल जे. ए. बोर्डिलन के आदेश पर जगमोहन की दीवारें भीतर की ओर झुकने से रोकने के लिए पूरा कक्ष बालू से भर दिया गया और द्वार पत्थरों से चुन दिए गए; तब से वह कक्ष बंद है। सन् 1984 (विक्रम संवत् 2041) में यह यूनेस्को विश्व धरोहर सूची में आया और भारतीय पुरातत्त्व सर्वेक्षण इसका संरक्षण करता है।',
        bodyEn:
          'The Sun Temple at Konark was built around 1250 CE (Vikram Samvat 1307) by Narasimhadeva I of the Eastern Ganga dynasty (r. 1238–1264 CE, Vikram Samvat 1295–1321); no consecration date, tithi or consecrating acharya is on record. Traditional accounts hold that upwards of twelve hundred artisans laboured on it for about twelve years. The great tower over the main deul fell in time — it was already down by the eighteenth century — and what stands today is the jagamohana, the Nata Mandira and the plinth of the chariot. In 1627 CE (Vikram Samvat 1684) the Raja of Khurda removed the Sun image from the sanctum to the Jagannath temple at Puri, and with it the daily worship at Konark came to an end. In 1903 CE (Vikram Samvat 1960), on the orders of J. A. Bourdillon, Lieutenant-Governor of Bengal, the jagamohana was packed solid with sand to stop its walls buckling inward and its doorways were sealed with stone; the hall has stayed closed since. The monument entered the UNESCO World Heritage list in 1984 CE (Vikram Samvat 2041) and is maintained by the Archaeological Survey of India.',
      },
      {
        id: 'svarup',
        titleHi: 'सूर्य का स्वरूप',
        titleEn: 'The Form of Surya',
        bodyHi:
          'पूरा मंदिर सूर्य के रथ के रूप में गढ़ा गया है: पीठिका पर चौबीस विशाल पहिए — बारह जोड़ियाँ — उकेरे हैं, और आगे पाषाण के अश्व रथ खींचते दिखते हैं; उनकी संख्या को लेकर वृत्तान्त भिन्न हैं, अधिकांश सात बताते हैं जबकि कुछ छह। पहियों की तीलियों की छाया से समय पढ़ा जा सकता था — वे धूप-घड़ी की तरह रचे गए हैं। देउल के दक्षिण, पश्चिम और उत्तर के निकले हुए आलों में हरे क्लोराइट पाषाण की तीन सूर्य-प्रतिमाएँ हैं, जो उदय, मध्याह्न और अस्त के सूर्य को दर्शाती हैं: उगते सूर्य का मुख प्रसन्न, मध्याह्न का गम्भीर और अस्त होते सूर्य का मुरझाया हुआ। जगमोहन का प्रवेश-द्वार भी हरे क्लोराइट का है और उसमें आठ द्वार-पट्टियाँ हैं, हर एक पर अलग अलंकरण। लगभग सौ फुट ऊँचा जगमोहन तीन क्रमशः घटती छतों में उठता है, जिनकी छज्जों पर वाद्य बजाते संगीतकारों की मूर्तियाँ बैठी हैं; पूर्व में नट-मन्दिर, अर्थात् नृत्य-मण्डप, अलग खड़ा है। गर्भगृह अब रिक्त है — वहाँ कोई विग्रह नहीं है।',
        bodyEn:
          'The whole temple is cut as Surya’s chariot: twenty-four great wheels, twelve pairs, are carved along the plinth, and stone horses in front draw it forward; accounts differ on their number, most giving seven and some six. The spokes were laid out so that their shadows read the hour — the wheels work as sundials. In the projecting niches on the south, west and north faces of the deul stand three Surya images in green chlorite, showing the rising, midday and setting sun: the rising face smiling, the midday one grave, the setting one spent. The jagamohana’s doorway is also of green chlorite, built of eight architraves each with its own motif. About a hundred feet high, the hall rises in three receding tiers whose terraces carry figures of musicians with their instruments; to the east the Nata Mandira, the dance hall, stands apart. The sanctum itself is empty today — no image remains in it.',
      },
      {
        id: 'parampara',
        titleHi: 'चन्द्रभागा स्नान और मौन गर्भगृह',
        titleEn: 'The Chandrabhaga Bath and the Silent Sanctum',
        bodyHi:
          'कोणार्क की परम्परा दूसरे तीर्थों से भिन्न है, क्योंकि यहाँ नित्य पूजा, आरती-क्रम या भोग-प्रसाद की व्यवस्था नहीं है — सन् 1627 में सूर्य-प्रतिमा पुरी ले जाए जाने के बाद यह जीवित मंदिर नहीं रहा, और आज यह भारतीय पुरातत्त्व सर्वेक्षण का संरक्षित स्मारक है जहाँ दर्शनार्थी टिकट लेकर प्रवेश करते हैं। जो परम्परा जीवित रही, वह मंदिर के भीतर नहीं, उसके पास के चन्द्रभागा तट पर है: माघ शुक्ल सप्तमी को भक्त सूर्योदय से पूर्व चन्द्रभागा में स्नान करते हैं और उगते सूर्य को अर्घ्य देते हैं — ओडिशा में इसे माघ सप्तमी कहा जाता है और यह रोग-निवारण तथा नेत्र-ज्योति की कामना से जुड़ी है। दूसरी जीवित परम्परा नृत्य की है: जिन संगीतकारों और नर्तकियों को यहाँ पाषाण में उकेरा गया, उन्हीं की स्मृति में हर वर्ष मंदिर के सामने शास्त्रीय नृत्य का महोत्सव होता है।',
        bodyEn:
          'Konark’s traditions are unlike those of other tirthas, because no daily puja, aarti cycle or bhog is offered here — after the Sun image was taken to Puri in 1627 it ceased to be a living temple, and it is today a protected monument of the Archaeological Survey of India that visitors enter on a ticket. What survived is a tradition kept not inside the temple but on the Chandrabhaga shore beside it: on Magha Shukla Saptami devotees bathe in the Chandrabhaga before sunrise and offer arghya to the rising sun — the day Odisha calls Magha Saptami, kept with prayers for healing and for clear sight. The second living tradition is dance: in memory of the musicians and dancers carved into this stone, a festival of classical dance is held each year before the temple.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा जमावड़ा चन्द्रभागा मेला है, जो माघ शुक्ल सप्तमी को — प्रायः फरवरी में — कोणार्क के निकट चन्द्रभागा तट पर लगता है; इसे माघ सप्तमी मेला भी कहते हैं और ओडिशा में रथ यात्रा के बाद इसे सबसे बड़ा मेला माना जाता है। श्रद्धालु रात्रि से ही पहुँचते हैं, ब्रह्म-मुहूर्त में स्नान करते हैं और सूर्योदय पर अर्घ्य देकर मंदिर-परिसर की परिक्रमा करते हैं। दिसम्बर में — प्रायः पहली से पाँचवीं तारीख तक — मंदिर की पृष्ठभूमि में कोणार्क नृत्य महोत्सव होता है, जिसे सन् 1986 से ओडिशा पर्यटन और ओडिसी शोध केन्द्र मिलकर आयोजित करते हैं; उन्हीं दिनों चन्द्रभागा तट पर अन्तर्राष्ट्रीय रेत-कला महोत्सव भी चलता है। मंदिर की कोई स्थापना-वर्षगाँठ नहीं मनाई जाती, क्योंकि प्रतिष्ठा-तिथि अभिलिखित नहीं है।',
        bodyEn:
          'The year’s great gathering is the Chandrabhaga Mela, held on Magha Shukla Saptami — usually in February — on the Chandrabhaga shore beside Konark; also called the Magha Saptami Mela, it is reckoned the largest fair in Odisha after the Rath Yatra. Pilgrims arrive through the night, bathe in the small hours and offer arghya at sunrise before walking round the temple precinct. In December, commonly from the first to the fifth, the Konark Dance Festival is staged against the monument, organised since 1986 by Odisha Tourism together with the Odissi Research Centre; the International Sand Art Festival runs on Chandrabhaga beach over the same days. No founding anniversary is observed, since no consecration date was ever recorded.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'कोणार्क ओडिशा के पुरी ज़िले में, बंगाल की खाड़ी के तट से थोड़ा भीतर बसा है। पुरी लगभग 35 किमी दूर है और दोनों के बीच का समुद्र-किनारे वाला मरीन ड्राइव मार्ग स्वयं यात्रा का आकर्षण है; भुवनेश्वर लगभग 65 किमी दूर है। निकटतम बड़ा रेलवे स्टेशन पुरी है और निकटतम हवाई अड्डा भुवनेश्वर का बीजू पटनायक अन्तर्राष्ट्रीय हवाई अड्डा। अधिकांश यात्री भुवनेश्वर, कोणार्क और पुरी को एक ही यात्रा में जोड़ते हैं — इसे ओडिशा का “स्वर्ण त्रिकोण” कहा जाता है — और जगन्नाथ पुरी के दर्शन के साथ ही कोणार्क देखते हैं। मंदिर से थोड़ी दूर चन्द्रभागा तट है, जहाँ माघ सप्तमी का स्नान होता है, और परिसर के पास पुरातत्त्व सर्वेक्षण का संग्रहालय है, जिसमें मंदिर से मिली मूर्तियाँ रखी हैं।',
        bodyEn:
          'Konark lies in Puri district of Odisha, a little inland from the Bay of Bengal. Puri is about 35 km away along the coastal Marine Drive, a road that is itself part of the pleasure of the journey, and Bhubaneswar is roughly 65 km off. The nearest major railhead is Puri and the nearest airport is Biju Patnaik International Airport at Bhubaneswar. Most travellers take Bhubaneswar, Konark and Puri together — Odisha’s so-called Golden Triangle — and see Konark in the same journey as the darshan of Jagannath at Puri. A short way from the temple is the Chandrabhaga shore where the Magha Saptami bath is kept, and beside the precinct stands the Archaeological Survey’s museum, which holds sculptures recovered from the monument.',
      },
    ],
  },
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

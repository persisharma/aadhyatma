import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Maha Shakti Peethas D.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: vishalakshi danteshwari tripura-sundari
 */
export const details: Record<string, TempleDetail> = {
  'mangala-gauri': {
    significanceHi:
      'गया की मंगला गौरी अष्टादश महाशक्ति पीठों में गिनी जाती हैं और देवी को यहाँ पोषण देने वाली “सर्वमंगला” शक्ति के रूप में पूजा जाता है। पहाड़ी पर खड़ा वर्तमान मंदिर पंद्रहवीं शताब्दी का माना जाता है — एक विवरण इसे विक्रम संवत् 1516 (सन् 1459) में बना बताता है। पद्म, वायु, अग्नि और देवी भागवत पुराणों में इस स्थान का स्मरण है, और पिंडदान के लिए गया आने वाले परिवार विष्णुपद के बाद यहाँ चढ़कर देवी के दर्शन करते हैं।',
    significanceEn:
      'Mangala Gauri of Gaya is counted among the eighteen Maha Shakti Peethas, and the goddess is worshipped here as Sarvamangala, the Shakti who nourishes. The present hill temple is held to be a fifteenth-century structure — one account dates it to Vikram Samvat 1516 (1459 CE). The site is remembered in the Padma, Vayu, Agni and Devi Bhagavata Puranas, and families who come to Gaya for pind-daan climb here for the goddess’s darshan after Vishnupad.',
    originStoryHi:
      'परम्परा के अनुसार दक्ष-यज्ञ के बाद शिव सती के शरीर को लेकर भटकते रहे और विष्णु के चक्र से कटे अंग जहाँ-जहाँ गिरे वहाँ शक्ति पीठ बने। गया की इस पहाड़ी पर सती के वक्ष का अंश गिरा माना जाता है, इसीलिए देवी यहाँ स्तन्य और पोषण की शक्ति मंगला गौरी कहलाईं। भस्मकूट कही जाने वाली इसी पहाड़ी की चोटी पर पूर्वाभिमुख मंदिर खड़ा है, जहाँ देवी पिंडी रूप में विराजती हैं।',
    originStoryEn:
      'By tradition, after Daksha’s sacrifice Shiva wandered bearing Sati’s body, and wherever a severed limb fell a Shakti Peeth arose. On this hill at Gaya the breast of Sati is held to have fallen, and so the goddess here is Mangala Gauri, the Shakti of milk and nourishment. The east-facing shrine stands on the crest of that hill, called Bhasmakoot, where the goddess is worshipped in pindi form rather than as a carved image.',
    sources: [
      { label: 'Bihar Tourism - Mangala Gauri, Gaya', url: 'https://tourism.bihar.gov.in/en/destinations/gaya/mangala-gauri' },
      { label: 'Incredible India - Mangla Gauri Temple, Gaya', url: 'https://www.incredibleindia.gov.in/en/bihar/gaya/mangla-gauri-temple' },
      { label: 'Mangla Gauri Temple - Reference', url: 'https://en.wikipedia.org/wiki/Mangla_Gauri_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'मंगला गौरी का स्थान गया के सबसे पुराने तीर्थों में गिना जाता है — पद्म, वायु, अग्नि और देवी भागवत पुराणों में इसका उल्लेख मिलता है, इसलिए यहाँ देवी-उपासना मंदिर की वर्तमान इमारत से कहीं पुरानी है। परम्परा के अनुसार दक्ष-यज्ञ के विध्वंस के बाद सती के वक्ष का अंश इसी भस्मकूट पहाड़ी पर गिरा, और तभी से यह स्थान अष्टादश महाशक्ति पीठों में गिना जाने लगा। जो पूर्वाभिमुख मंदिर आज खड़ा है उसे विवरण सामान्यतः पंद्रहवीं शताब्दी का बताते हैं, और एक विवरण इसे विक्रम संवत् 1516 (सन् 1459) का कहता है; स्थापना की तिथि, वार और प्रतिष्ठा करने वाले आचार्य का नाम किसी उपलब्ध अभिलेख में दर्ज नहीं है। गया की विशेषता यह है कि यह मुख्यतः वैष्णव पिंडदान-क्षेत्र है, फिर भी नगर के शिखरों पर देवी और शिव के प्राचीन स्थान बने रहे — मंगला गौरी उनमें सबसे ऊँचा और सबसे व्यस्त है। मंदिर की देखरेख आज स्थानीय पुजारी-परिवार और न्यास करते हैं, और बिहार सरकार का पर्यटन विभाग इसे गया के प्रमुख धार्मिक स्थलों में सूचीबद्ध करता है।',
        bodyEn:
          'Mangala Gauri is among the oldest sacred sites of Gaya — the Padma, Vayu, Agni and Devi Bhagavata Puranas all name it, so worship of the goddess here long predates the building that now stands. By tradition, after the destruction of Daksha’s sacrifice the breast of Sati fell on this hill, called Bhasmakoot, and from then the place was counted among the eighteen Maha Shakti Peethas. The east-facing temple visible today is generally described as a fifteenth-century structure, with one account giving Vikram Samvat 1516 (1459 CE); no available record preserves the consecration tithi, the weekday, or the name of the acharya who performed it. What marks Gaya out is that it is above all a Vaishnava pind-daan kshetra, yet ancient Devi and Shiva seats survive on its hilltops — and Mangala Gauri is the highest and busiest of them. The shrine is looked after today by local priestly families and its trust, and the Bihar government’s tourism department lists it among Gaya’s principal religious sites.',
      },
      {
        id: 'svarup',
        titleHi: 'मंगला गौरी का स्वरूप',
        titleEn: 'The Form of Mangala Gauri',
        bodyHi:
          'गर्भगृह में देवी की कोई मानव-आकृति प्रतिमा नहीं है — दो गोल उभरे पाषाण-रूप पूजे जाते हैं, जो सती के वक्ष के प्रतीक माने जाते हैं; इसी पिंडी पर देवी का मुख अंकित है और उसे ही श्रृंगार, चुनरी और पुष्प अर्पित होते हैं। पोषण का यह स्वरूप ही मंगला गौरी को अन्य पीठों से अलग करता है। मंदिर पत्थर का बना छोटा, सघन और पूर्वाभिमुख है, और गर्भगृह के आसपास प्राचीन उत्कीर्ण शिलाफलक लगे हैं। परिसर में परमेश्वर शिव के दो छोटे मंदिर तथा महिषासुरमर्दिनी, दुर्गा और दक्षिण काली की मूर्तियाँ हैं; गणेश और हनुमान के स्थान भी यहीं हैं, इसलिए एक ही चोटी पर देवी, शिव और उनके परिवार के दर्शन पूरे हो जाते हैं।',
        bodyEn:
          'The sanctum holds no human-formed image of the goddess — worship is offered to two rounded stone swellings understood as the breasts of Sati, and it is on this pindi that the Devi’s face is marked and her shringar, chunari and flowers are laid. That form, the form of nourishment, is what sets Mangala Gauri apart from the other peethas. The shrine itself is small, compact, stone-built and faces east, with old carved relief panels set around the sanctum. Within the precinct stand two smaller shrines of Parmeshwar Shiva and images of Mahishasura Mardini, Durga and Dakshina Kali; Ganesha and Hanuman have their places here as well, so a single hilltop completes the darshan of the goddess, of Shiva, and of their household.',
      },
      {
        id: 'parampara',
        titleHi: 'मंगला गौरी व्रत और पिंडदान-दर्शन',
        titleEn: 'The Mangala Gauri Vrat and the Pind-daan Darshan',
        bodyHi:
          'यहाँ की सबसे पहचानी परम्परा मंगला गौरी व्रत है — श्रावण मास के प्रत्येक मंगलवार को स्त्रियाँ पति और परिवार के कल्याण की कामना से यह व्रत रखती हैं, देवी को सोलह शृंगार की वस्तुएँ, लाल चुनरी, सिंदूर और पुष्प अर्पित करती हैं; इसीलिए श्रावण के मंगलवार वर्ष के सबसे व्यस्त दिन होते हैं। दूसरी परम्परा गया की अपनी है: जो परिवार पितरों के लिए विष्णुपद या फल्गु के घाटों पर पिंडदान करते हैं, वे कर्म पूरा कर पहाड़ी चढ़कर मंगला गौरी के दर्शन से यात्रा का समापन करते हैं। पहाड़ी तक लगभग दो सौ सीढ़ियाँ चढ़नी पड़ती हैं, और दर्शन प्रातः की आरती से आरम्भ होकर संध्या आरती तक चलते हैं। मंगलवार के अतिरिक्त शुक्रवार और नवरात्र के दिनों में भी विशेष भीड़ रहती है।',
        bodyEn:
          'The custom most closely tied to this hill is the Mangala Gauri Vrat — on every Tuesday of the month of Shravan women keep the fast for the wellbeing of husband and household, offering the goddess the sixteen articles of shringar, a red chunari, sindoor and flowers; those Tuesdays are the busiest days of the temple’s year. A second custom belongs to Gaya itself: families who have performed pind-daan for their ancestors at Vishnupad or on the Phalgu ghats climb the hill afterwards and close the rite with Mangala Gauri’s darshan. The ascent is roughly two hundred steps, and darshan runs from the morning aarti through to the evening aarti. Beyond Tuesdays, Fridays and the Navratri days also draw dense crowds.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष के दो बड़े अवसर चैत्र नवरात्र (चैत्र शुक्ल प्रतिपदा से नवमी) और शारदीय नवरात्र (आश्विन शुक्ल प्रतिपदा से नवमी) हैं, जब पहाड़ी पर दिन-रात दर्शनार्थियों की कतार रहती है और अष्टमी-नवमी को हवन तथा कन्या-पूजन होते हैं। श्रावण मास के मंगलवार व्रत-दिवस की तरह मनाए जाते हैं और उन दिनों मंदिर के नीचे छोटा बाज़ार लग जाता है। आश्विन कृष्ण पक्ष यानी पितृ पक्ष के पंद्रह दिन गया का सबसे बड़ा तीर्थ-काल है; देश भर से आए परिवार पिंडदान के बाद यहाँ चढ़ते हैं, इसलिए यह शक्ति-पीठ होते हुए भी पितृ पक्ष में सबसे अधिक भरा रहता है। नवरात्रों में रात्रि-जागरण और भजन-संध्याएँ भी होती हैं।',
        bodyEn:
          'Two seasons dominate the year: Chaitra Navratri (Chaitra Shukla Pratipada to Navami) and Sharad Navratri (Ashwin Shukla Pratipada to Navami), when the queue up the hill runs day and night and the Ashtami and Navami days bring havan and kanya-pujan. The Tuesdays of Shravan are kept as vrat days, and a small bazaar sets up below the temple for them. The fifteen days of Pitru Paksha, the dark fortnight of Ashwin, are Gaya’s greatest pilgrim season; families arriving from across the country climb here once their pind-daan is done, so this Shakti Peeth is at its fullest during a fortnight given to the ancestors. Night-long jagrans and bhajan evenings fill the Navratri weeks as well.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'मंदिर गया ज़िले में नगर के दक्षिणी छोर की मंगलागौरी पहाड़ी पर है; ऊपर तक सड़क जाती है और सीढ़ियों का मार्ग भी है। गया जंक्शन लगभग 4–5 किमी दूर निकटतम रेलवे स्टेशन है और गया हवाई अड्डा लगभग 8–9 किमी; पटना सड़क मार्ग से लगभग 100 किमी है। नगर के भीतर ही विष्णुपद मंदिर और फल्गु के घाट हैं, जिनके साथ अधिकांश यात्री इसी दिन दर्शन जोड़ते हैं। गया की पहाड़ियों पर बने तीर्थ — ब्रह्मयोनि, रामशिला और शृंग-स्थान — मिलकर नगर का शिखर-परिक्रमा पथ बनाते हैं, और बौद्ध गया की महाबोधि पास ही है, इसलिए कई यात्री एक ही प्रवास में दोनों परम्पराओं के स्थान देख लेते हैं। सभी दूरियाँ अनुमानित हैं।',
        bodyEn:
          'The temple sits on Mangalagauri hill at the southern edge of Gaya city, in Gaya district, reached either by a motorable road to the top or by the flight of steps. Gaya Junction, the nearest railhead, is about 4–5 km away and Gaya airport about 8–9 km; Patna is roughly 100 km by road. Vishnupad temple and the Phalgu ghats lie within the same city, and most pilgrims pair them with this darshan on the same day. Gaya’s other hilltop shrines — Brahmayoni, Rama Shila and Shringa Sthan — together form the city’s circuit of peaks, and the Mahabodhi complex at Bodh Gaya is close enough that many visitors take in both traditions on one trip. All distances are approximate.',
      },
    ],
  },
};

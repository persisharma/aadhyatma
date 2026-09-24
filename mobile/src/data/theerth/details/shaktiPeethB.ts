import type { TempleDetail, TheerthSource } from '../temples';

const source = (label: string, url: string): TheerthSource => ({ label, url });

/**
 * Extended §12.6 readings — Maha Shakti Peethas B.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: mahalakshmi-kolhapur ekaveerika-mahur harsiddhi-ujjain
 */
export const details: Record<string, TempleDetail> = {
  bhramaramba: {
    significanceHi: 'नल्लमला पर्वत-श्रेणी के श्रीशैलम शिखर पर विराजित भ्रमरांबा देवी अष्टादश महाशक्ति पीठों में गिनी जाती हैं और देवी भागवत, स्कंद पुराण तथा आदि शंकराचार्य के अष्टादश शक्ति पीठ स्तोत्र में नामांकित हैं। श्रीशैलम की सबसे बड़ी विशेषता यह है कि यहाँ एक ही परिसर में मल्लिकार्जुन ज्योतिर्लिंग और भ्रमरांबा शक्ति पीठ — शैव और शाक्त उपासना की दो महान धाराएँ — साथ-साथ विराजित हैं। मंदिर-स्थल के शिलालेखी प्रमाण सातवाहन काल तक जाते हैं, जबकि परिसर के उपलब्ध शिला-अभिलेख चौदहवीं शताब्दी से आगे का इतिहास बताते हैं।',
    significanceEn: 'Bhramaramba Devi, enthroned on the Srisailam hill in the Nallamala range, is counted among the eighteen Maha Shakti Peethas and is named in the Devi Bhagavata, the Skanda Purana and Adi Shankaracharya’s Ashtadasha Shakti Peetha Stotram. Srisailam’s rarest distinction is that a single walled precinct holds both the Mallikarjuna Jyotirlinga and the Bhramaramba Shakti Peetha — the Shaiva and Shakta streams of worship side by side. Epigraphic evidence for the site reaches back to the Satavahana period, while the temple’s own surviving lithic records date from the fourteenth century CE onward.',
    originStoryHi: 'शक्ति-पीठ परम्परा के अनुसार दक्ष-यज्ञ के बाद सती के शरीर के अंग जहाँ-जहाँ गिरे वहाँ पीठ बने, और श्रीशैलम में देवी की ग्रीवा गिरी मानी जाती है। देवी का नाम भ्रमरांबा — “भ्रमरों की माता” — उस कथा से जुड़ा है जिसमें देवी ने भ्रमरी रूप धारण कर षट्पद भ्रमरों की सेना छोड़ी और अरुणासुर का संहार किया, जो मनुष्य या पशु के हाथों अवध्य था। इसी विजय के बाद देवी इस शिखर पर मल्लिकार्जुन के साथ नित्य-निवास करने लगीं।',
    originStoryEn: 'By the Shakti Peeth tradition, seats of the goddess arose wherever the limbs of Sati fell after the Daksha sacrifice, and at Srisailam it is her neck that is held to have descended. Her name Bhramaramba — “mother of the bees” — comes from the account in which the goddess took the form of Bhramari and loosed an army of six-legged bees to destroy the demon Arunasura, who could not be killed by man or beast. After that victory, tradition says, she took up permanent residence on this hill alongside Mallikarjuna.',
    sources: [
      source('Srisaila Devasthanam — Bhramaramba Devi', 'https://www.srisailadevasthanam.org/en-in/about/the-temple/bhramaramba-devi'),
      source('Utsav, Ministry of Tourism — Srisailam Maha Sivaratri Brahmotsavalu', 'https://utsav.gov.in/view-event/srisailam-maha-sivaratri-bramhostavalu'),
      source('Nandyal District Administration — Places of Interest', 'https://nandyal.ap.gov.in/places-of-interest/'),
      source('Mallikarjuna Temple, Srisailam — Reference', 'https://en.wikipedia.org/wiki/Mallikarjuna_Temple,_Srisailam'),
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi: 'श्रीशैलम की किसी एक प्रतिष्ठा-तिथि का अभिलेख नहीं मिलता — यह उन तीर्थों में है जिनका इतिहास तिथि से नहीं, शिलालेखों की शृंखला से पढ़ा जाता है। स्थल का उल्लेख सातवाहन और इक्ष्वाकु कालीन अभिलेखों तक जाता है, जबकि परिसर में सुरक्षित शिला-लेख चौदहवीं शताब्दी से पुराने नहीं हैं। परम्परा के अनुसार देवी ने भ्रमरी रूप में अरुणासुर-वध के पश्चात् इसी शिखर को अपना निवास चुना, और यहीं आदि शंकराचार्य ने शिवानन्दलहरी तथा भ्रमरांबा अष्टक की रचना की मानी जाती है। जो निर्माण-इतिहास अभिलेखों से सिद्ध है वह मध्यकाल का है: काकतीयों के बाद रेड्डि राजाओं के काल में मंदिर का बड़ा विस्तार हुआ — अनवेम रेड्डि (सन् 1364–1386, विक्रम संवत् 1421–1443) ने वीरशिरोमंडप बनवाया और प्रोलय वेम रेड्डि ने कृष्णा नदी से मंदिर तक सोपान-मार्ग तथा जीर्णोद्धार करवाया। आगे विजयनगर के हरिहर राय द्वितीय को सन् 1405 (विक्रम संवत् 1462) का मुख-मंडप श्रेय दिया जाता है, जबकि सम्राट कृष्णदेवराय की सन् 1516 (विक्रम संवत् 1573) की श्रीशैलम-यात्रा से जुड़े मंडप-निर्माण का उल्लेख भी मिलता है; कौन-सा मंडप किसका है, इस पर स्रोत एकमत नहीं हैं। आज मंदिर की व्यवस्था श्रीशैल देवस्थानम् देखता है।',
        bodyEn: 'No single consecration date survives for Srisailam — it belongs to that class of tirthas whose history is read not from a tithi but from a chain of inscriptions. The site is referred to in Satavahana and Ikshvaku epigraphs, while the lithic records preserved within the precinct itself go back no further than the fourteenth century CE. By tradition the goddess chose this peak as her seat after slaying Arunasura in her Bhramari form, and it was here that Adi Shankaracharya is held to have composed the Sivanandalahari and the Bhramaramba Ashtakam. What the inscriptions do establish is medieval building work: after the Kakatiyas, the Reddi kings greatly enlarged the complex — Anavema Reddi (1364–1386 CE, Vikram Samvat 1421–1443) raised the Virasiromandapam, and Prolaya Vema Reddi commissioned repairs along with a flight of steps from the Krishna up to the temple. Harihara Raya II of Vijayanagara is credited with a mukha-mandapa dated 1405 CE (Vikram Samvat 1462), while emperor Krishnadevaraya’s visit of 1516 CE (Vikram Samvat 1573) is likewise linked to mandapa work here; sources do not agree on which hall belongs to which patron. The shrine today is administered by the Srisaila Devasthanam.',
      },
      {
        id: 'svarup',
        titleHi: 'भ्रमरांबा देवी का स्वरूप',
        titleEn: 'The Form of Bhramaramba Devi',
        bodyHi: 'भ्रमरांबा देवी का विग्रह अष्टभुजा है और उन्हें रेशमी साड़ी तथा आभूषणों से श्रृंगारित किया जाता है; उपासना-परम्परा में वे ब्राह्मी शक्ति-स्वरूपा मानी जाती हैं। गर्भगृह के सम्मुख श्रीयंत्र स्थापित है, जिसकी अर्चना देवी-उपासना का केन्द्र है — यही कारण है कि यहाँ श्री-विद्या की धारा विशेष रूप से जीवित रही। देवी का मंदिर मल्लिकार्जुन के विशाल प्राकार के भीतर, उसी परिसर के पश्चिमी भाग में है; प्राकार लगभग 183 × 152 मीटर का और लगभग साढ़े आठ मीटर ऊँचा है, और उसकी बाहरी दीवारों पर पौराणिक कथाओं के सैकड़ों उत्कीर्ण पट्ट हैं जो दक्षिण-भारतीय शिल्प का उत्कृष्ट उदाहरण माने जाते हैं। भ्रमर-रूप की स्मृति में देवी के नाम और अर्चना दोनों में भ्रमर का प्रतीक बार-बार आता है।',
        bodyEn: 'Bhramaramba is enshrined as an eight-armed image, robed in silk and ornament, and is worshipped in the tradition as a form of Brahmani Shakti. A Sri Yantra stands before her sanctum, and its archana is the heart of her worship here — one reason the Sri Vidya stream has stayed unusually alive at this hill. Her shrine sits inside the great prakara of the Mallikarjuna complex, in its western part; that enclosure measures roughly 183 by 152 metres and stands about eight and a half metres high, its outer faces carrying hundreds of carved panels of Puranic narrative that are reckoned among the finer sculptural programmes of the Deccan. The memory of the bee-form returns constantly in her name and in her worship, where the bhramara is a recurring emblem.',
      },
      {
        id: 'parampara',
        titleHi: 'कुंकुमार्चना और शक्ति-उपासना',
        titleEn: 'Kumkumarchana and Shakti Worship',
        bodyHi: 'भ्रमरांबा देवी की सबसे प्रचलित सेवा कुंकुमार्चना है — देवी के नामों का उच्चारण करते हुए कुंकुम अर्पित करना, जिसे भक्त मनोकामना और कुल-कल्याण के लिए संकल्पपूर्वक करवाते हैं; यही कुंकुम प्रसाद-रूप में घर ले जाया जाता है। शक्ति-उपासना की विशेष सेवाओं में चंडी होम प्रमुख है, और श्री-विद्या परम्परा के अनुरूप श्रीचक्र-अर्चना भी होती है। देवी और मल्लिकार्जुन — दोनों के दर्शन एक ही यात्रा में करने की परम्परा है, इसलिए यात्री प्रायः ज्योतिर्लिंग के अभिषेक के बाद देवी की अर्चना करवाते हैं। देवस्थानम् की व्यवस्था में प्रातः लगभग छह बजे से रात्रि तक दर्शन चलते हैं, और नवरात्रि, शुक्रवार तथा पूर्णिमा पर भीड़ सबसे अधिक रहती है।',
        bodyEn: 'The signature seva at Bhramaramba’s shrine is the Kumkumarchana — the offering of vermilion while the goddess’s names are recited, sponsored by devotees for a wish or for the welfare of a family, with the kumkum then carried home as prasad. Among the fuller Shakta rites, the Chandi Homam is the most sought after, and the Sri Chakra is worshipped here in keeping with the Sri Vidya lineage. Custom holds that Devi and Mallikarjuna are to be seen in one journey, so pilgrims commonly have the goddess’s archana performed after the Jyotirlinga’s abhishekam. Under the Devasthanam’s arrangements darshan runs from about six in the morning until night, and the heaviest crowds gather during Navaratri and on Fridays and full-moon days.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi: 'वर्ष का सबसे बड़ा उत्सव महाशिवरात्रि ब्रह्मोत्सव है, जो माघ मास (फरवरी–मार्च) में ग्यारह दिन चलता है और जिसमें देवी तथा स्वामी दोनों के उत्सव साथ चलते हैं। इसका आरम्भ अंकुरार्पण और ध्वजारोहण से होता है, जब नन्दी-अंकित श्वेत ध्वज-पट ध्वजस्तंभ पर चढ़ाया जाता है; पगलंकरण की अनोखी रीति में देवांग (बुनकर) समुदाय का एक व्यक्ति विमान-शिखर से आरम्भ कर मुख-मंडप के नन्दी तक लम्बा नया श्वेत वस्त्र — “पग” — बाँधता है। उत्सव के मध्य भ्रमरांबा-मल्लिकार्जुन का कल्याणोत्सव, वाहन-सेवाएँ, रथोत्सव और अंत में ध्वजावरोहण होता है। आश्विन मास की प्रथम तिथि से देवी नवरात्रि नौ दिन मनाई जाती है, और पौष मास में मकर संक्रांति पर कुंभोत्सव होता है, जिसमें मल्लिकार्जुन को अन्नाभिषेक होता है और चेंचू जनजाति के लोग भ्रमरांबा देवी के समक्ष अपना पारम्परिक नृत्य करते हैं।',
        bodyEn: 'The year’s great festival is the Mahashivaratri Brahmotsavam, kept over eleven days in the month of Magha (February–March), in which the observances for the goddess and for the lord run together. It opens with Ankurarpana and Dhwajarohana, when a white flag bearing the image of Nandi is hoisted on the flagstaff; in the singular rite of Pagalankarana a man of the Devanga weaver community ties a long new white cloth, the paga, from the crown of the vimana down to the Nandi of the front hall. Midway through come the Kalyanotsavam of Bhramaramba and Mallikarjuna, the vahana sevas and the Rathotsavam, and the festival closes with Dhwajavarohana. Devi Navaratri runs nine days from the first tithi of Ashwin, and Kumbhotsavam falls at Makara Sankramana in the month of Pausha, when Annabhishekam is offered to Mallikarjuna and the Chenchu tribal community dances before Bhramaramba Devi.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi: 'श्रीशैलम आंध्र प्रदेश के नंद्याल ज़िले में, कृष्णा नदी के ऊपर नल्लमला की पहाड़ियों पर बसा है — नंद्याल से लगभग 160 किमी, कर्नूल से लगभग 180 किमी और हैदराबाद से लगभग 230 किमी। निकटतम रेलवे स्टेशन मार्कापुर रोड है, जो लगभग 83 किमी दूर है; निकटतम हवाई अड्डे कर्नूल (लगभग 180 किमी) और हैदराबाद (लगभग 215 किमी) हैं। पहुँच-मार्ग नल्लमला के संरक्षित वन से होकर जाता है, इसलिए रात लगभग नौ बजे से भोर छह बजे तक वाहन-आवागमन बंद रहता है — यात्रा दिन में ही करनी चाहिए। श्रीशैलम की सबसे बड़ी विशेषता यही है कि द्वादश ज्योतिर्लिंगों में गिने जाने वाले मल्लिकार्जुन और अष्टादश महाशक्ति पीठों में गिनी जाने वाली भ्रमरांबा एक ही प्राकार में हैं — ज्योतिर्लिंग और शक्ति पीठ का यह संयोग बहुत कम तीर्थों में मिलता है, इसलिए यात्री दोनों दर्शन एक साथ करते हैं। पहाड़ पर चढ़ने से पहले साक्षी गणपति के दर्शन की रीति है; परिसर के आसपास पाताल गंगा (कृष्णा तट तक उतरते सोपान), शिखर पर शिखरेश्वर मंदिर और पाताल गंगा से नौका द्वारा लगभग 18 किमी दूर अक्कमहादेवी गुफाएँ दर्शनीय हैं।',
        bodyEn: 'Srisailam stands in Nandyal district of Andhra Pradesh, on the Nallamala hills above the Krishna — roughly 160 km from Nandyal, 180 km from Kurnool and 230 km from Hyderabad. The nearest railhead is Markapur Road, about 83 km away; the nearest airports are Kurnool (about 180 km) and Hyderabad (about 215 km). The approach runs through the protected Nallamala forest, so vehicle movement is closed from about nine at night until six in the morning — the journey has to be made in daylight. Srisailam’s singular claim is that Mallikarjuna, one of the twelve Jyotirlingas, and Bhramaramba, one of the eighteen Maha Shakti Peethas, share one walled precinct; that pairing of Jyotirlinga and Shakti Peetha is found at very few tirthas, and pilgrims accordingly take both darshans together. Custom asks for a halt at Sakshi Ganapati before the climb; around the hill lie Paataala Ganga with its descent of steps to the Krishna, the Sikhareshwara temple at the highest point, and the Akkamahadevi caves about 18 km away, reached by boat from Paataala Ganga.',
      },
    ],
  },
};

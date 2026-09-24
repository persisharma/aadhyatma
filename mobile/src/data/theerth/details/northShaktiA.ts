import type { TempleDetail } from '../temples';

/**
 * Extended §12.6 readings — Northern Shakti shrines A.
 *
 * One chunk file per enrichment session (RULEBOOK §12.6, "one temple at a
 * time"): each file is owned by exactly one authoring pass so parallel waves
 * never collide in the same module. Entries here REPLACE the legacy two-line
 * detail carried inline in `temples.ts` — supply the whole `TempleDetail`
 * (expanded significance + origin story, `sources` ≥ 2, and the five fixed
 * sections in order: sthapana, svarup, parampara, mela, yatra).
 *
 * Temples still to author in this chunk: vaishno-devi kalighat naina-devi
 */
export const details: Record<string, TempleDetail> = {
  kamakhya: {
    significanceHi:
      'गुवाहाटी की नीलाचल पहाड़ी पर स्थित कामाख्या देवालय शाक्त और तांत्रिक उपासना का सबसे प्रतिष्ठित पीठ माना जाता है। यहाँ गर्भगृह में कोई प्रतिमा नहीं है — भूमि से नीचे उतरती गुफा में शिला की एक योनि-आकार दरार है, जिसे एक भूमिगत स्रोत निरन्तर जल से भरे रखता है। वर्तमान मंदिर सन् 1565 (विक्रम संवत् 1622) में कोच नरेश नरनारायण के काल में पुनर्निर्मित हुआ, और आषाढ़ की अम्बुबाची इसे वर्ष का सबसे बड़ा शाक्त समागम बनाती है।',
    significanceEn:
      'The Kamakhya Devalaya on Nilachal Hill in Guwahati is held to be the foremost seat of Shakta and Tantric worship. Its sanctum holds no image: in a cave below ground level lies a yoni-shaped cleft in the living rock, kept permanently filled by an underground spring. The temple standing today was rebuilt in 1565 CE (Vikram Samvat 1622) under the Koch king Nara Narayan, and the Ambubachi observance in Ashadha makes it the year’s largest Shakta gathering.',
    originStoryHi:
      'शक्ति-पीठ कथा के अनुसार दक्ष-यज्ञ के बाद शिव सती का शरीर लिए भटकते रहे और विष्णु के चक्र से कटे अंग पृथ्वी पर गिरे; नीलाचल पर सती की योनि गिरी और यह स्थान कामरूप-कामाख्या कहलाया। परम्परा यह भी कहती है कि नरकासुर ने देवी से विवाह की इच्छा की, और देवी ने शर्त रखी कि वह एक ही रात में पहाड़ी की तलहटी से मंदिर तक सीढ़ियाँ बना दे। भोर होने का भ्रम देने के लिए मुर्गे को बुलवाया गया और अधूरी सीढ़ी वहीं छूट गई — वही मेखेला-उज्ज्वा सोपान आज भी पहाड़ी पर दिखता है।',
    originStoryEn:
      'By the Shakti Peeth tradition, Shiva wandered with Sati’s body after the Daksha yajna and her severed limbs fell across the earth; her yoni is said to have fallen on Nilachal, and the land came to be called Kamarupa-Kamakhya. Tradition also tells of Narakasura, who sought the goddess in marriage and was set the condition that he raise a stairway from the foot of the hill to the shrine in a single night. A cock was made to crow to feign daybreak, and he abandoned the work half-built — the unfinished flight still traced on the hillside.',
    sources: [
      { label: 'Maa Kamakhya Devalaya (temple authority)', url: 'https://www.maakamakhya.org/' },
      { label: 'Assam Tourism - Kamakhya Temple', url: 'https://assamtourism.gov.in/Kamakhya-Temple1.php' },
      { label: 'Kamakhya Temple - Reference', url: 'https://en.wikipedia.org/wiki/Kamakhya_Temple' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'नीलाचल की यह उपासना बहुत प्राचीन है — दसवीं–ग्यारहवीं शताब्दी के कालिका पुराण में कामाख्या, कामरूप और इस पीठ का विस्तृत वर्णन मिलता है, और स्थल पर ग्यारहवीं–बारहवीं सदी के पत्थर के मंदिर के अवशेष मिले हैं। मध्यकाल में यह देवालय ध्वस्त हो गया था; परम्परा कहती है कि कोच वंश के संस्थापक विश्वसिंह (लगभग सन् 1515–1540) ने शिकार के दौरान इस स्थान को फिर खोजा और यहाँ पूजा पुनः आरम्भ कराई। उनके पुत्र नरनारायण के काल में सन् 1565 (विक्रम संवत् 1622) में मंदिर का पुनर्निर्माण हुआ, जिसकी देखरेख उनके भाई और सेनापति चिलाराय ने की — यह इस लम्बे इतिहास की एकमात्र निश्चित तिथि वाली निर्माण-घटना है। पुराने मंदिर के तराशे पत्थर नई दीवारों में लगाए गए, पर पत्थर से शिखर उठाने के प्रयास बार-बार विफल रहे; तब कारीगर मेघमुकदम ने ईंटों का वह अर्धगोल गुम्बद खड़ा किया जो आज भी मंदिर का मुकुट है। पत्थर का आधार और ईंट का गुम्बद — इस मिश्रित शैली को नीलाचल शैली कहा जाता है, और असम के अनेक देवालय इसी रूप में बने।',
        bodyEn:
          'Worship on Nilachal is very old: the Kalika Purana, of about the tenth to eleventh century, describes Kamakhya, Kamarupa and this peeth at length, and the site has yielded the remains of a stone temple of the eleventh to twelfth century. The shrine fell into ruin in the medieval period. Tradition holds that Vishwa Singha, founder of the Koch dynasty (reigning roughly 1515 to 1540 CE), rediscovered the place while hunting and had worship restored there. Under his son Nara Narayan the temple was rebuilt in 1565 CE (Vikram Samvat 1622), the work supervised by his brother, the general Chilarai — the one firmly dated construction in the site’s long history. Dressed stone from the older temple was set into the new walls, but repeated attempts to raise a tower in stone failed; the artisan Meghamukdam then built the hemispherical brick dome that crowns the temple to this day. Stone below, brick above: this hybrid is known as the Nilachal style, and many later Assamese shrines follow it.',
      },
      {
        id: 'svarup',
        titleHi: 'कामाख्या का स्वरूप',
        titleEn: 'The Form of Kamakhya',
        bodyHi:
          'कामाख्या का गर्भगृह किसी प्रतिमा का नहीं, योनि-पीठ का है। भक्त अँधेरे में पत्थर की सीढ़ियाँ उतरकर भूमि-तल से नीचे बनी गुफा में पहुँचते हैं, जहाँ दोनों ओर से ढलती शिला बीच में मिलकर लगभग दस इंच गहरी योनि-आकार दरार बनाती है। इस दरार को एक भूमिगत सोता निरन्तर जल से भरे रखता है; उपासक इसी शिला-रूप में आदिशक्ति की सृजन-शक्ति का दर्शन करते हैं और जल को चरणामृत की भाँति ग्रहण करते हैं। दरार पर प्रायः लाल वस्त्र और पुष्प चढ़े रहते हैं और दीपक की हल्की रोशनी में ही दर्शन होता है। मुख्य देवालय के साथ पहाड़ी पर दस महाविद्याओं — काली, तारा, त्रिपुर सुन्दरी, भुवनेश्वरी, भैरवी, छिन्नमस्ता, धूमावती, बगलामुखी, मातंगी और कमलात्मिका — के अलग-अलग मंदिर हैं, और उत्तर की ओर सौभाग्य कुण्ड है, जिसे देवी का क्रीड़ा-सरोवर माना जाता है।',
        bodyEn:
          'Kamakhya’s sanctum enshrines not an image but a yoni peeth. Pilgrims descend a flight of stone steps in near darkness to a cave below ground level, where sheets of rock slope in from either side and meet in a yoni-shaped hollow some ten inches deep. An underground spring keeps that hollow constantly filled with water; worshippers see in this rock form the creative power of the Mother, and receive the water as one receives charanamrit. The cleft is usually draped with red cloth and flowers, and darshan is taken by lamplight alone. Around the main shrine the hill carries separate temples of the ten Mahavidyas — Kali, Tara, Tripura Sundari, Bhuvaneshwari, Bhairavi, Chhinnamasta, Dhumavati, Bagalamukhi, Matangi and Kamalatmika — and on the northern side lies Saubhagya Kunda, regarded as the goddess’s own bathing tank.',
      },
      {
        id: 'parampara',
        titleHi: 'योनि-पीठ की उपासना और शाक्त परम्परा',
        titleEn: 'Yoni Peeth Worship and the Shakta Tradition',
        bodyHi:
          'कामाख्या की उपासना शाक्त और तांत्रिक धारा की है — यहाँ देवी को मातृत्व, ऋतु और सृजन की शक्ति के रूप में पूजा जाता है, और यही इस पीठ को शेष देवी-मंदिरों से अलग करता है। दर्शन के लिए भक्त सीढ़ियाँ उतरकर योनि-शिला को स्पर्श करते हैं, जल-प्रसाद लेते हैं और लाल वस्त्र, सिन्दूर, पुष्प तथा नारियल अर्पित करते हैं; लाल रंग यहाँ शक्ति का प्रधान रंग है। अम्बुबाची के बाद बाँटा जाने वाला लाल-रंजित अम्बुबाची वस्त्र सबसे प्रतिष्ठित प्रसाद माना जाता है और भक्त उसे वर्ष भर सँभालकर रखते हैं। पहाड़ी के दस महाविद्या मंदिरों की परिक्रमा उपासना का अंग है, और परम्परा के अनुसार कन्याएँ सौभाग्य कुण्ड पर जाकर शिवलिंग को स्नान कराती और पुष्प अर्पित करती हैं। यहाँ की साधना-परम्परा में साधक और गृहस्थ भक्त दोनों आते हैं, और मंदिर वर्ष भर प्रतिदिन खुला रहता है — केवल अम्बुबाची के तीन दिन इसका अपवाद हैं।',
        bodyEn:
          'Worship at Kamakhya belongs to the Shakta and Tantric stream: the goddess is honoured here as the power of motherhood, of the monthly cycle and of creation itself, and that is what sets this peeth apart from other Devi shrines. For darshan devotees descend to touch the rock, take the spring water as prasad, and offer red cloth, sindoor, flowers and coconuts — red being the ruling colour of the hill. The red-dyed Ambubachi cloth distributed after the June observance is the most prized prasad of all, and families keep it through the year. Circling the ten Mahavidya shrines on the hill is part of the pilgrimage, and by custom unmarried girls go down to Saubhagya Kunda to bathe the Shivalinga there and offer flowers. Both initiated sadhakas and ordinary householder devotees come here, and the temple is open daily through the year — the three days of Ambubachi being its one exception.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष का सबसे बड़ा आयोजन अम्बुबाची मेला है, जो वर्षा-ऋतु में आषाढ़ (जून) के दिनों में पड़ता है। मान्यता है कि इन तीन दिनों में देवी रजस्वला रहती हैं; मंदिर के द्वार बन्द हो जाते हैं, कोई पूजा, स्नान या भोग नहीं होता, और आसपास के क्षेत्र में हल चलाना तथा मांगलिक कार्य रोक दिए जाते हैं। चौथे दिन शुद्धि के बाद कपाट खुलते हैं और लाखों श्रद्धालु, साधु तथा तांत्रिक साधक दर्शन के लिए उमड़ते हैं — यही समागम कामाख्या को पूर्वोत्तर का सबसे बड़ा धार्मिक मेला बनाता है। श्रावण संक्रान्ति से तीन दिन नाटमंदिर में मनसा पूजा होती है, जिसके साथ देवधनी नृत्य चलता है — गैर-ब्राह्मण नर्तक देवता के आवेश में तीन दिन तक नृत्य करते हैं। आश्विन में यहाँ दुर्गा पूजा पूरे पक्ष चलती है, कृष्ण नवमी से शुक्ल नवमी तक, इसीलिए इसे पखुवा पूजा कहते हैं और यह बिना प्रतिमा के सम्पन्न होती है। पौष शुक्ल द्वितीया–तृतीया को पोहन बिया में कामेश्वर और कामेश्वरी का प्रतीकात्मक विवाह होता है।',
        bodyEn:
          'The year turns on the Ambubachi Mela, which falls in Ashadha (June) with the coming of the monsoon. The goddess is held to be in her menstrual course for those three days: the doors close, no puja, bathing or food offering is made, and across the surrounding country ploughing and auspicious work are set aside. On the fourth day, after the purification, the shrine reopens and lakhs of devotees, sadhus and tantric practitioners pour up the hill — the gathering that makes Kamakhya the largest religious fair in the Northeast. From Shravana Sankranti, Manasa Puja is kept for three days in the Natmandir, accompanied by the Deodhani dance, in which non-Brahmin dancers, believed to carry the deity’s presence, dance in trance for three days. Durga Puja here runs a full fortnight of Ashwin, from Krishna Navami to Shukla Navami — hence its name Pakhua Puja — and is performed without an idol. On the second and third days of the bright half of Pausha, Pohan Biya celebrates the symbolic marriage of Kameshwara and Kameshwari.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'कामाख्या देवालय कामरूप महानगर ज़िले में, गुवाहाटी के पश्चिमी भाग की नीलाचल पहाड़ी पर है; पहाड़ी तक सड़क ऊपर तक जाती है और पैदल सोपान-मार्ग भी उपलब्ध है। निकटतम रेलवे स्टेशन कामाख्या जंक्शन है, जो लगभग 7 किमी दूर पड़ता है, और गुवाहाटी स्टेशन लगभग 8 किमी; लोकप्रिय गोपीनाथ बरदोलोई अन्तर्राष्ट्रीय हवाई अड्डा लगभग 20 किमी दूर है (सभी दूरियाँ अनुमानित)। अधिकांश तीर्थयात्री कामाख्या के साथ ब्रह्मपुत्र के बीच मयूर द्वीप पर स्थित उमानन्द शिव मंदिर और गुवाहाटी के नवग्रह मंदिर के दर्शन एक ही यात्रा में जोड़ते हैं। पहाड़ी पर ही दस महाविद्याओं के मंदिर, भुवनेश्वरी मंदिर और सौभाग्य कुण्ड हैं, जिनकी परिक्रमा यात्रा को पूर्ण मानी जाती है। अम्बुबाची के दिनों में भीड़ असाधारण रहती है, इसलिए यात्रा की योजना पहले से बनाना उचित माना जाता है।',
        bodyEn:
          'The Kamakhya Devalaya stands on Nilachal Hill in the western part of Guwahati, in Kamrup Metropolitan district; a motor road climbs to the temple and a stepped footpath runs up the hill as well. The nearest railhead is Kamakhya Junction, roughly 7 km away, with Guwahati station about 8 km; Lokpriya Gopinath Bordoloi International Airport is some 20 km distant (all distances approximate). Most pilgrims pair Kamakhya in one journey with the Umananda Shiva temple on Peacock Island in the Brahmaputra and with Guwahati’s Navagraha temple. The hill itself carries the ten Mahavidya shrines, the Bhuvaneshwari temple and Saubhagya Kunda, and walking that round is counted as completing the yatra. Crowds during Ambubachi are extraordinary, so travel in those days is best planned well ahead.',
      },
    ],
  },
};

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
 * Temples still to author in this chunk: kalighat naina-devi
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
  'vaishno-devi': {
    significanceHi:
      'रियासी ज़िले की त्रिकूट पहाड़ी पर लगभग 5,200 फुट की ऊँचाई पर बनी पवित्र गुफा उत्तर भारत की सबसे व्यस्त देवी-यात्रा का गंतव्य है। यहाँ देवी किसी गढ़ी हुई प्रतिमा में नहीं, शिला की तीन प्राकृतिक पिण्डियों में विराजती हैं, जिन्हें महाकाली, महालक्ष्मी और महासरस्वती का स्वरूप माना जाता है। गुफा-तीर्थ की कोई अभिलिखित प्रतिष्ठा-तिथि नहीं है; प्रलेखित तिथि प्रबन्ध की है — 30 अगस्त 1986 (विक्रम संवत् 2043) को श्री माता वैष्णो देवी श्राइन बोर्ड बना, जिसे जम्मू-कश्मीर श्री माता वैष्णो देवी श्राइन अधिनियम, 1988 ने विधिक रूप दिया।',
    significanceEn:
      'The holy cave on Trikuta hill in Reasi district, at about 5,200 feet, is the goal of North India’s busiest Devi pilgrimage. The goddess is worshipped here not as a sculpted image but as three natural rock pindis, held to be the forms of Mahakali, Mahalakshmi and Mahasaraswati. No consecration date is recorded for the cave itself; the documented date belongs to its administration — on 30 August 1986 (Vikram Samvat 2043) the Shri Mata Vaishno Devi Shrine Board was constituted, given statutory form by the Jammu & Kashmir Shri Mata Vaishno Devi Shrine Act, 1988.',
    originStoryHi:
      'परम्परा के अनुसार कटरा के पास हंसाली गाँव के निर्धन किन्तु श्रद्धालु पंडित श्रीधर के सामने देवी एक कन्या के रूप में प्रकट हुईं और उनसे गाँव भर का भण्डारा कराने को कहा; अन्न थोड़ा था, फिर भी सब तृप्त होकर लौटे। उसी भण्डारे में गुरु गोरक्षनाथ के शिष्य तांत्रिक भैरोंनाथ पहुँचे और माँस-मदिरा की माँग करने लगे; कन्या के इनकार पर वे उनके पीछे चल पड़े और कन्या त्रिकूट की ओर निकल गईं। कथा कहती है कि अर्धक्वाँरी की गर्भ-जोड़ गुफा में नौ मास साधना के बाद देवी ने गुफा के मुख पर भैरोंनाथ का वध किया और उन्हें क्षमा तथा मोक्ष देते हुए वचन दिया कि उनके दर्शन के बिना यात्रा पूर्ण नहीं मानी जाएगी।',
    originStoryEn:
      'By tradition the goddess appeared as a young girl before Pandit Shridhar, a poor but devout Brahmin of Hansali village near Katra, and asked him to hold a bhandara for the whole village; though his grain was little, everyone who came ate their fill. To that feast came Bhairon Nath, a tantric disciple of Guru Gorakshanath, demanding meat and liquor; when the girl refused he pursued her, and she withdrew into the Trikuta hills. The story tells that after nine months of meditation in the womb-like cave at Ardhkuwari she met him at the mouth of the holy cave and struck him down, then granted him pardon and liberation with the promise that no yatra would count as complete until his shrine too had been visited.',
    sources: [
      { label: 'Shri Mata Vaishno Devi Shrine Board', url: 'https://www.maavaishnodevi.org/' },
      { label: 'Shri Mata Vaishno Devi Shrine Board - Discovery of the Holy Cave', url: 'https://www.maavaishnodevi.org/blog/discovery' },
      { label: 'Shri Mata Vaishno Devi Shrine Board - Reference', url: 'https://en.wikipedia.org/wiki/Shri_Mata_Vaishno_Devi_Shrine_Board' },
    ],
    sections: [
      {
        id: 'sthapana',
        titleHi: 'मंदिर स्थापना कथा',
        titleEn: 'Sthapana Katha',
        bodyHi:
          'वैष्णो देवी का तीर्थ किसी बनाए गए मंदिर से नहीं, त्रिकूट की एक प्राकृतिक गुफा से आरम्भ होता है — इसीलिए इसकी कोई प्रतिष्ठा-तिथि दर्ज नहीं है। परम्परा गुफा के प्राकट्य का श्रेय पंडित श्रीधर को देती है, जो कटरा से लगभग डेढ़ किलोमीटर दूर हंसाली गाँव में रहते थे; भण्डारे और भैरोंनाथ के प्रसंग के बाद वे देवी की खोज में त्रिकूट चढ़े और उन्हें लगभग अट्ठानवे फुट लम्बी वह गुफा मिली जिसमें तीन पिण्डियाँ विराजमान थीं। कहा जाता है कि पूजा की परम्परा उन्हीं से चली और उनके वंशजों ने पीढ़ियों तक गुफा की सेवा की। बाद की शताब्दियों में जम्मू के डोगरा शासकों और स्थानीय बारदारी ने यात्रा-मार्ग, धर्मशालाएँ और चढ़ाई की व्यवस्था सँभाली। आधुनिक प्रबन्ध की तिथि निश्चित है: 30 अगस्त 1986 (विक्रम संवत् 2043) को तत्कालीन राज्यपाल के निर्देश पर श्री माता वैष्णो देवी श्राइन बोर्ड गठित हुआ और जम्मू-कश्मीर श्री माता वैष्णो देवी श्राइन अधिनियम, 1988 ने उसे विधिक आधार देकर उसी तिथि से प्रभावी माना। तब से यात्रा-पर्ची, मार्ग, चिकित्सा और दर्शन-व्यवस्था बोर्ड के हाथ में है।',
        bodyEn:
          'Vaishno Devi begins not with a built temple but with a natural cave in the Trikuta range, which is why no consecration date exists for it. Tradition credits its discovery to Pandit Shridhar of Hansali, a village a little over a mile from present-day Katra; after the bhandara and the episode with Bhairon Nath he climbed Trikuta in search of the girl and found the cave, some ninety-eight feet long, with the three pindis within. Worship is said to have begun with him, and his descendants served the shrine for generations. Over later centuries the Dogra rulers of Jammu and the local baradari maintained the track, the rest houses and the arrangements for the climb. The modern institutional date is exact: on 30 August 1986 (Vikram Samvat 2043) the Shri Mata Vaishno Devi Shrine Board was constituted at the then Governor’s initiative, and the Jammu & Kashmir Shri Mata Vaishno Devi Shrine Act, 1988 gave it statutory footing with effect from that same date. Yatra registration, the track, medical posts and darshan have been in the Board’s charge since.',
      },
      {
        id: 'svarup',
        titleHi: 'वैष्णो देवी का स्वरूप',
        titleEn: 'The Form of Vaishno Devi',
        bodyHi:
          'भवन के गर्भगृह में कोई गढ़ी हुई मूर्ति नहीं है। शिला में स्वयं उभरी तीन पिण्डियाँ ही दर्शन का केन्द्र हैं, जिन्हें क्रमशः महाकाली, महासरस्वती और महालक्ष्मी की शक्तियों का रूप माना जाता है — तीनों एक ही आधार-शिला से जुड़ी हैं, इसलिए उपासक उन्हें एक ही आदिशक्ति के तीन भाव कहते हैं। पिण्डियों को स्वर्ण-छत्र के नीचे चाँदी के आवरण और चुनरी से सजाया जाता है, और दर्शन पंक्तिबद्ध होकर गुफा से गुज़रते हुए कुछ क्षणों का ही होता है। भवन तक पहुँचने से पहले गुफा के आगे पवित्र चरण-गंगा की धारा बहती है, जिसमें यात्री हाथ-पैर धोकर प्रवेश करते हैं। प्राचीन गुफा-मार्ग अत्यन्त सँकरा है और वर्ष में केवल कम भीड़ के दिनों में खोला जाता है; अधिकांश समय भीड़ दो नए मार्गों से भीतर जाती और बाहर निकलती है।',
        bodyEn:
          'The sanctum at the Bhawan holds no carved image. Darshan centres on three pindis risen from the rock itself, taken to be the powers of Mahakali, Mahasaraswati and Mahalakshmi — joined at a single base, so devotees speak of them as three moods of one Shakti. The pindis are dressed with silver casing and a chunri beneath a golden canopy, and darshan is a matter of moments as the queue passes through the cave. Below the cave mouth runs the stream of Charan Ganga, where pilgrims wash hands and feet before entering. The ancient cave passage is very narrow and is opened only on the year’s quieter days; for most of the year the crowds enter and leave by two newer passages cut for the purpose.',
      },
      {
        id: 'parampara',
        titleHi: 'पैदल यात्रा और अटका आरती',
        titleEn: 'The Walking Yatra and the Atka Aarti',
        bodyHi:
          'वैष्णो देवी की सबसे बड़ी परम्परा यात्रा स्वयं है। कटरा से यात्रा-पर्ची लेकर भक्त बाणगंगा से चढ़ाई आरम्भ करते हैं और “जय माता दी” के जयकारों के साथ मार्ग चढ़ते हैं — यही पुकार पूरे मार्ग का स्वर है। रास्ते में बाणगंगा में स्नान, चरण-पादुका पर शीश नवाना और अर्धक्वाँरी की गर्भ-जोड़ गुफा से निकलना यात्रा के पारम्परिक पड़ाव हैं। भवन पर प्रातः और सायं दोनों समय आरती होती है, जो लगभग 6:20 बजे आरम्भ होकर दो घंटे तक चलती है; इस अवधि में गुफा सामान्य दर्शन के लिए बन्द रहती है। अटका आरती इसी आरती में सम्मिलित होने की विशेष व्यवस्था है, जिसके लिए बोर्ड पहले से बुकिंग लेता है और आरती के उपरान्त दर्शन कराता है। प्रसाद बोर्ड के अधिकृत केन्द्रों से ही लिया जाता है, और परम्परा के अनुसार यात्रा तब पूर्ण मानी जाती है जब भवन के बाद ऊपर भैरोंनाथ के मंदिर के दर्शन भी कर लिए जाएँ।',
        bodyEn:
          'The great tradition here is the walk itself. Pilgrims take their yatra slip at Katra, begin the climb at Banganga and go up calling “Jai Mata Di”, the sound that carries the whole track. Bathing at Banganga, bowing at Charan Paduka where the goddess’s footprints are marked on a rock slab, and passing through the womb-like cave at Ardhkuwari are the customary halts of the ascent. At the Bhawan the aarti is performed morning and evening, beginning around 6:20 and running some two hours, during which the cave closes to ordinary darshan. The Atka Aarti is the arrangement by which a devotee may attend that aarti itself, booked in advance through the Shrine Board, with darshan following at its close. Prasad is taken only from the Board’s own counters, and by tradition the yatra is complete only when, after the Bhawan, the pilgrim also climbs to the shrine of Bhairon Nath above.',
      },
      {
        id: 'mela',
        titleHi: 'मेले और उत्सव',
        titleEn: 'Melas and Festivals',
        bodyHi:
          'वर्ष के दो शिखर चैत्र और आश्विन के नवरात्र हैं, जब नौ दिनों तक भवन, अर्धक्वाँरी, भैरों मंदिर और पूरा यात्रा-मार्ग फूलों, दीपों और तोरणों से सजाया जाता है। इन दिनों लाखों श्रद्धालु कटरा पहुँचते हैं; श्राइन बोर्ड सुरक्षा, चिकित्सा और पंक्ति-प्रबन्ध की विशेष व्यवस्था करता है और भवन पर नवरात्र महोत्सव के अन्तर्गत महायज्ञ, भजन-संध्या तथा सांस्कृतिक कार्यक्रम होते हैं। नवरात्र की अष्टमी और नवमी पर भीड़ सबसे अधिक रहती है और दर्शन की प्रतीक्षा कई घंटों तक पहुँच जाती है। शेष वर्ष भी यात्रा चलती रहती है — गर्मियों की छुट्टियों और शीत-ऋतु के हिमपात के दिनों में विशेष चहल-पहल रहती है — और रात्रि-भर चढ़ाई करते जयकारा लगाते जत्थे मार्ग पर सामान्य दृश्य हैं।',
        bodyEn:
          'The year peaks twice, at the Navratris of Chaitra and Ashwin, when for nine days the Bhawan, Ardhkuwari, the Bhairon shrine and the whole track are dressed with flowers, lights and festive arches. Lakhs of pilgrims reach Katra in those days; the Shrine Board puts extra security, medical posts and queue management in place, and the Navratri Mahotsav at the Bhawan brings a mahayagya, evening bhajan gatherings and cultural programmes. Ashtami and Navami draw the heaviest crowds of all, and the wait for darshan can run to several hours. The yatra continues through the rest of the year as well — summer holidays and the snow-lit winter weeks are both busy — and groups climbing through the night with their calls to the Mother are an ordinary sight on the path.',
      },
      {
        id: 'yatra',
        titleHi: 'यात्रा और आसपास',
        titleEn: 'Journey and Around',
        bodyHi:
          'यात्रा का आधार-नगर कटरा है, जो रियासी ज़िले में पड़ता है; भवन तक की चढ़ाई कटरा से लगभग 12–13 किमी है (दूरी अनुमानित)। कटरा से लगभग 2–3 किमी पर बाणगंगा, उससे लगभग डेढ़ किमी आगे लगभग 3,380 फुट पर चरण-पादुका, और कटरा से लगभग 6 किमी पर अर्धक्वाँरी पड़ता है; आगे साँझीछत होते हुए भवन आता है और भैरोंनाथ का मंदिर भवन से और ऊपर है, जहाँ पैदल मार्ग के साथ रोपवे की सुविधा भी है। चढ़ाई के लिए पैदल मार्ग, घोड़ा-पालकी और हेलिकॉप्टर सेवा तीनों उपलब्ध हैं। निकटतम रेलवे स्टेशन श्री माता वैष्णो देवी कटरा है, जो नगर में ही है; निकटतम हवाई अड्डा जम्मू है, कटरा से लगभग 45–50 किमी (अनुमानित)। अनेक तीर्थयात्री इसी यात्रा में जम्मू के रघुनाथ मंदिर के दर्शन भी जोड़ते हैं।',
        bodyEn:
          'The base town is Katra, in Reasi district, and the climb to the Bhawan is roughly 12–13 km from there (distance approximate). Banganga lies about 2–3 km above Katra, Charan Paduka some 1.5 km further at about 3,380 feet, and Ardhkuwari around 6 km from Katra; beyond it the track runs by Sanjichhat to the Bhawan, with the Bhairon Nath shrine higher still, reached on foot or by the ropeway. Pilgrims go up on foot, by pony and palanquin, or by the helicopter service. The nearest railhead is Shri Mata Vaishno Devi Katra station in the town itself; the nearest airport is Jammu, roughly 45–50 km away (approximate). Many pilgrims add darshan at the Raghunath temple in Jammu to the same journey.',
      },
    ],
  },
};

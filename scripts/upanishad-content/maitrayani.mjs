/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Maitrāyaṇī (Maitri, Maitrāyaṇīya) — Sāmaveda in the Muktikā list, Sāmānya
 * group. Seven prapāṭhakas of numbered prose sections, cited
 * prapāṭhaka.section: King Bṛhadratha's renunciation and Śākāyanya's teaching,
 * the bhūtātman and the pure Self, the three guṇas, Kutsāyana's hymn, and the
 * long sixth prapāṭhaka on Om, the sun, time, food and the six-limbed yoga.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'maitrayani',
  muktika: 24,
  vedaHi: 'सामवेद',
  vedaEn: 'Samaveda',
  source: {
    baseText:
      'Maitrāyaṇī (Maitri) Upaniṣad in seven prapāṭhakas, as printed in the Ānandāśrama Sanskrit Series (with Rāmatīrtha\'s Dīpikā) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Ānandāśrama Sanskrit Series, Maitryupaniṣad (Rāmatīrtha-dīpikā sahita); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/maitrayani.html',
      'https://www.wisdomlib.org/hinduism/book/maitri-upanishad',
      'https://archive.org/details/UpanishadAnk',
    ],
    notes: '73 sections in seven prapāṭhakas of 4 · 7 · 5 · 6 · 2 · 38 · 11, cited prapāṭhaka.section (the Ānandāśrama numbering), plus the Sāmavedic śānti-pāṭha (आप्यायन्तु ममाङ्गानि) as page 1. Long prose sections are split at sentence boundaries into lines; the verses embedded in the prose (and the concluding ślokas of 6.20–6.38 and 7.11) are kept inside their section. Pluta digits are omitted and a few sandhi joins that would put an avagraha after an anusvāra are written open (2.5 वर्तते अंशेन). Readings and section boundaries vary between prints in 2.1–2.3, 6.29/6.30 and 7.8. The network policy blocks the Sanskrit source hosts, so the Devanagari was authored from memory of the printed text — a line-by-line scan check against the printed edition is still owed, and it should START with the passages flagged as least certain: the middle of 7.10 (the asuras taking the body for the Self), the prose opening of 7.11 (तत्प्राणे तापनवत्तेजसि स्थितम् …), the 6.14 calendar passage, the name-list of 6.7, the Sāṅkhya passage of 6.10, the repeated वह्नेश्च यद्वत् verse (6.26 and 6.31), and the closing verses of 6.21, 6.23, 6.35 and 6.36.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    [
      'ॐ आप्यायन्तु ममाङ्गानि वाक्प्राणश्चक्षुः श्रोत्रमथो बलमिन्द्रियाणि च सर्वाणि।',
      'सर्वं ब्रह्मौपनिषदं माहं ब्रह्म निराकुर्यां मा मा ब्रह्म निराकरोदनिराकरणमस्त्वनिराकरणं मेऽस्तु।',
      'तदात्मनि निरते य उपनिषत्सु धर्मास्ते मयि सन्तु ते मयि सन्तु॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    'मेरे अंग, वाणी, प्राण, नेत्र, श्रोत्र, बल और समस्त इन्द्रियाँ पुष्ट हों। यह सब उपनिषद्-प्रतिपादित ब्रह्म ही है। मैं ब्रह्म का निराकरण न करूँ, न ब्रह्म मेरा निराकरण करे। निराकरण न हो; मेरा निराकरण न हो। आत्मा में निरत मुझमें उपनिषदों में कहे हुए धर्म स्थित हों, वे मुझमें स्थित हों। ॐ शान्तिः शान्तिः शान्तिः।',
    'May my limbs, speech, breath, eye, ear, strength and all my senses grow strong. All this is the Brahman of the Upaniṣads. May I never deny Brahman, nor Brahman deny me. Let there be no denial — no denial of me. May the virtues the Upaniṣads speak of abide in me, devoted to the Self; may they abide in me. Om, peace, peace, peace.'
  ),
  khandas: [
    // ── Prapāṭhaka 1 ──
    [
      M(
        [
          'ब्रह्मयज्ञो ह वा एष यत्पूर्वेषां चयनम्।',
          'तस्माद्यजमानश्चेतव्यानेतानग्नीनात्मानमभिध्यायेत्।',
          'सम्पूर्णो ह वा एष यज्ञोऽविकलश्च सम्पद्यते।',
          'कोऽसावभिध्येयः स प्राणाख्यस्तस्योपाख्यानम्॥',
        ],
        'पूर्वजों द्वारा किया जाने वाला जो (अग्नि-)चयन है, वह निश्चय ही ब्रह्मयज्ञ है। इसलिए यजमान इन चयन किए जाने योग्य अग्नियों का (चयन करके) आत्मा का ध्यान करे। ऐसा करने से यह यज्ञ निश्चय ही सम्पूर्ण और अविकल (त्रुटिरहित) हो जाता है। वह ध्यान करने योग्य कौन है? वह प्राण नाम वाला है; उसका उपाख्यान (आगे कहा जाता है)।',
        'The building of the fire-altars performed by the ancients is, in truth, a sacrifice to Brahman. Therefore the sacrificer, having built these fires, should meditate on the Self. Thus indeed the sacrifice becomes complete and without flaw. Who is he that is to be meditated upon? He is the one called Prāṇa; here follows his story.'
      ),
      M(
        [
          'बृहद्रथो वै नाम राजा राज्ये ज्येष्ठं पुत्रं निधापयित्वेदमशाश्वतं मन्यमानः शारीरं वैराग्यमुपेतोऽरण्यं निर्जगाम।',
          'स तत्र परमं तप आस्थायादित्यमीक्षमाण ऊर्ध्वबाहुस्तिष्ठति।',
          'अन्ते सहस्राहस्य मुनिरन्तिकमाजगामाग्निरिवाधूमकस्तेजसा निर्दहन्निवात्मविद्भगवाञ्छाकायन्यः।',
          'उत्तिष्ठोत्तिष्ठ वरं वृणीष्वेति राजानमब्रवीत्।',
          'स तस्मै नमस्कृत्योवाच भगवन्नाहमात्मवित्त्वं तत्त्वविच्छुश्रुमो वयं स त्वं नो ब्रूहीति।',
          'एतद्वृत्तं पुरस्तादशक्यं मा पृच्छ प्रश्नमैक्ष्वाकान्यान्कामान्वृणीष्वेति।',
          'शाकायन्यस्य चरणावभिमृश्यमानो राजेमां गाथां जगाद॥',
        ],
        'बृहद्रथ नाम के एक राजा थे। वे अपने ज्येष्ठ पुत्र को राज्य पर प्रतिष्ठित करके, इस शरीर को अनित्य मानते हुए, वैराग्य को प्राप्त होकर वन को चले गए। वहाँ वे परम तप का आश्रय लेकर, सूर्य की ओर देखते हुए, भुजाएँ ऊपर उठाए खड़े रहते थे। एक सहस्र दिन बीतने पर धूमरहित अग्नि के समान, अपने तेज से मानो दग्ध करते हुए, आत्मवेत्ता भगवान् शाकायन्य मुनि उनके समीप आए और राजा से बोले — "उठो, उठो, वर माँगो।" राजा ने उन्हें नमस्कार करके कहा — "भगवन्! मैं आत्मवेत्ता नहीं हूँ; आप तत्त्ववेत्ता हैं, ऐसा हमने सुना है; अतः आप हमें (आत्मतत्त्व) बताइए।" (मुनि ने कहा —) "यह विषय पहले से ही (कहने में) कठिन रहा है; हे इक्ष्वाकुवंशी! यह प्रश्न मत पूछो, दूसरी कामनाएँ माँग लो।" तब शाकायन्य के चरणों का स्पर्श करते हुए राजा ने यह गाथा कही —',
        'There was a king named Bṛhadratha. Having established his eldest son on the throne, and regarding this body as impermanent, he attained dispassion and went forth into the forest. There, taking up the highest austerity, he stood with arms raised, gazing at the sun. At the end of a thousand days there came near him the sage, the blessed Śākāyanya, knower of the Self, like a fire without smoke, as though burning with his splendour. He said to the king: “Arise, arise, and choose a boon.” The king bowed to him and said: “Revered sir, I am not a knower of the Self. You are a knower of the truth, so we have heard; therefore tell it to us.” “This matter was found hard from of old; do not ask this question, O descendant of Ikṣvāku; choose other desires.” Touching Śākāyanya’s feet, the king spoke this verse:'
      ),
      M(
        [
          'भगवन्नस्थिचर्मस्नायुमज्जामांसशुक्रशोणितश्लेष्माश्रुदूषिकाविण्मूत्रवातपित्तकफसंघाते दुर्गन्धे निःसारेऽस्मिञ्छरीरे किं कामोपभोगैः।',
          'कामक्रोधलोभमोहभयविषादेर्ष्येष्टवियोगानिष्टसम्प्रयोगक्षुत्पिपासाजरामृत्युरोगशोकाद्यैरभिहतेऽस्मिञ्छरीरे किं कामोपभोगैः॥',
        ],
        'भगवन्! हड्डी, चमड़ी, नस, मज्जा, मांस, वीर्य, रक्त, श्लेष्मा, आँसू, आँख का मैल, विष्ठा, मूत्र, वात, पित्त और कफ के संघातरूप, दुर्गन्धयुक्त और साररहित इस शरीर में कामनाओं के भोग से क्या (प्रयोजन)? काम, क्रोध, लोभ, मोह, भय, विषाद, ईर्ष्या, प्रिय का वियोग, अप्रिय का संयोग, भूख, प्यास, बुढ़ापा, मृत्यु, रोग, शोक आदि से पीड़ित इस शरीर में कामनाओं के भोग से क्या (प्रयोजन)?',
        'Revered sir, in this ill-smelling, pithless body, a mere mass of bone, skin, sinew, marrow, flesh, semen, blood, mucus, tears, rheum, faeces, urine, wind, bile and phlegm, what is the use of enjoying desires? In this body, beset by desire, anger, greed, delusion, fear, despondency, envy, separation from the dear, union with the undesired, hunger, thirst, old age, death, disease, grief and the rest, what is the use of enjoying desires?'
      ),
      M(
        [
          'सर्वं चेदं क्षयिष्णु पश्यामो यथेमे दंशमशकादयस्तृणवनस्पतयोद्भूतप्रध्वंसिनः।',
          'अथ किमेतैर्वा परेऽन्ये महाधनुर्धराश्चक्रवर्तिनः केचित्सुद्युम्नभूरिद्युम्नेन्द्रद्युम्नकुवलयाश्वयौवनाश्ववध्र्यश्वाश्वपतिशशबिन्दुहरिश्चन्द्राम्बरीषननक्तुसर्यातिययात्यनरण्योक्षसेनादयः।',
          'अथ मरुत्तभरतप्रभृतयो राजानो मिषतो बन्धुवर्गस्य महतीं श्रियं त्यक्त्वास्माल्लोकादमुं लोकं प्रयान्ति।',
          'अथ किमेतैर्वा परेऽन्ये गन्धर्वासुरयक्षराक्षसभूतगणपिशाचोरगग्रहादीनां निरोधनं पश्यामः।',
          'अथ किमेतैर्वान्यानां शोषणं महार्णवानां शिखरिणां प्रपतनं ध्रुवस्य प्रचलनं व्रश्चनं वातरज्जूनां निमज्जनं पृथिव्याः स्थानादपसरणं सुराणाम्।',
          'सोऽहमित्येतद्विधेऽस्मिन्संसारे किं कामोपभोगैर्यैरेवाश्रितस्यासकृदिहावर्तनं दृश्यत इत्युद्धर्तुमर्हसि।',
          'अन्धोदपानस्थो भेक इवाहमस्मिन्संसारे भगवंस्त्वं नो गतिस्त्वं नो गतिः॥',
        ],
        'हम देखते हैं कि यह सब कुछ क्षयशील है, जैसे ये डाँस, मच्छर आदि और तृण तथा वनस्पतियाँ उत्पन्न होकर नष्ट हो जाती हैं। इनकी तो बात ही क्या, दूसरे बड़े-बड़े धनुर्धर चक्रवर्ती — सुद्युम्न, भूरिद्युम्न, इन्द्रद्युम्न, कुवलयाश्व, यौवनाश्व, वध्र्यश्व, अश्वपति, शशबिन्दु, हरिश्चन्द्र, अम्बरीष, ननक्तु, शर्याति, ययाति, अनरण्य, उक्षसेन आदि — तथा मरुत्त, भरत आदि राजा भी अपने बन्धुवर्ग के देखते-देखते महान् वैभव को त्यागकर इस लोक से उस लोक को चले गए। इनकी भी क्या बात, हम दूसरे गन्धर्व, असुर, यक्ष, राक्षस, भूतगण, पिशाच, सर्प, ग्रह आदि का भी विनाश देखते हैं। और क्या, दूसरों में भी महासागरों का सूखना, पर्वत-शिखरों का गिरना, ध्रुव का विचलित होना, वायु-रज्जुओं का कटना, पृथ्वी का डूबना और देवताओं का अपने स्थान से च्युत होना (देखा जाता है)। ऐसे इस संसार में कामनाओं के भोग से क्या (लाभ), जिनका आश्रय लेने वाले का बारम्बार यहाँ (संसार में) लौटना देखा जाता है? अतः आप मेरा उद्धार करने योग्य हैं। अन्धे कुएँ में पड़े मेंढक के समान मैं इस संसार में (पड़ा) हूँ। भगवन्! आप ही हमारी गति हैं, आप ही हमारी गति हैं।',
        'We see that all this is perishable, as these gadflies, mosquitoes and the like, and the grasses and trees, spring up and perish. But what of these? There are others greater — mighty archers, world-rulers, such as Sudyumna, Bhūridyumna, Indradyumna, Kuvalayāśva, Yauvanāśva, Vadhryaśva, Aśvapati, Śaśabindu, Hariścandra, Ambarīṣa, Nanaktu, Saryāti, Yayāti, Anaraṇya, Ukṣasena and the rest, and kings such as Marutta and Bharata — who, while their kinsmen looked on, gave up great glory and passed from this world to that. But what of these? We see the destruction of others still greater — gandharvas, asuras, yakṣas, rākṣasas, hosts of spirits, piśācas, serpents, planets and the like. And what of these? Among other things there is the drying up of great oceans, the falling of mountain peaks, the moving of the pole-star, the cutting of the wind-cords, the sinking of the earth, the fall of the gods from their stations. In such a world as this, what is the use of enjoying desires, when he who has fed on them is seen to return here again and again? Please deliver me. In this world I am like a frog in a waterless well. Revered sir, you are our refuge; you are our refuge.'
      ),
    ],
    // ── Prapāṭhaka 2 ──
    [
      M(
        [
          'अथ भगवाञ्छाकायन्यः सुप्रीतोऽब्रवीद्राजानं महाराज बृहद्रथेक्ष्वाकुवंशध्वजशीर्षात्मज्ञः कृतकृत्यस्त्वं मरुन्नाम्नो विश्रुतोऽसीति।',
          'अयं खलु वाव त आत्मेति।',
          'कतमो भगवन्निति।',
          'तं होवाचेति॥',
        ],
        'तब भगवान् शाकायन्य ने अत्यन्त प्रसन्न होकर राजा से कहा — "महाराज बृहद्रथ! इक्ष्वाकुवंश की ध्वजा के शिखररूप! तुम शीघ्र ही आत्मज्ञ और कृतकृत्य होगे; तुम \'मरुत्\' नाम से विख्यात हो। यह निश्चय ही तुम्हारा आत्मा है।" (राजा ने पूछा —) "भगवन्! वह कौन-सा है?" तब उन्होंने उससे कहा —',
        'Then the blessed Śākāyanya, well pleased, said to the king: “Great King Bṛhadratha, banner-crest of the Ikṣvāku line, you will soon know the Self and have done all that is to be done; you are renowned by the name Marut. This, truly, is your Self.” “Which, revered sir?” Then he said to him:'
      ),
      M(
        [
          'अथ य एषोऽनुच्छ्वासनेनोर्ध्वमुत्क्रान्तो व्यथमानोऽव्यथमानस्तमः प्रणुदत्येष आत्मेत्याह भगवान्।',
          'अथ य एष सम्प्रसादोऽस्माच्छरीरात्समुत्थाय परं ज्योतिरुपसम्पद्य स्वेन रूपेणाभिनिष्पद्यत एष आत्मेति होवाच।',
          'एतदमृतमभयमेतद्ब्रह्मेति॥',
        ],
        'भगवान् ने कहा — "जो यह (प्राण) श्वास के रुकने पर (भी) ऊपर की ओर उत्क्रमण करता है, (शरीर के) व्यथित होने पर भी स्वयं व्यथित न होता हुआ अन्धकार को दूर करता है, यही आत्मा है।" (फिर) उन्होंने कहा — "जो यह सम्प्रसाद (सुषुप्ति में प्रसन्न हुआ जीव) इस शरीर से ऊपर उठकर, परम ज्योति को प्राप्त होकर अपने स्वरूप से अभिव्यक्त होता है, यही आत्मा है। यह अमृत है, अभय है, यही ब्रह्म है।"',
        'The blessed one said: “He who, without the in-breath, rises upward, and, though the body suffers, himself unsuffering, dispels the darkness — he is the Self.” And he said: “He who is this serene being, who, rising up from this body and reaching the highest light, appears in his own form — he is the Self. This is the immortal, the fearless; this is Brahman.”'
      ),
      M(
        [
          'अथ खल्वियं ब्रह्मविद्या सर्वोपनिषद्विद्या वा राजन्नस्माकं भगवता मैत्रिणाख्याता।',
          'अहं ते कथयिष्यामीति।',
          'अथापहतपाप्मानस्तिग्मतेजस ऊर्ध्वरेतसो वालखिल्या इति श्रूयन्ते।',
          'अथैते प्रजापतिमब्रुवन्भगवञ्छकटमिवाचेतनमिदं शरीरं कस्यैष खल्वीदृशो महिमातीन्द्रियभूतस्य येनैतद्विधमिदं चेतनवत्प्रतिष्ठापितं प्रचोदयिता वास्य को भगवन्नेतदस्माकं ब्रूहीति।',
          'तान्होवाचेति॥',
        ],
        '"राजन्! यह ब्रह्मविद्या — अथवा समस्त उपनिषदों की विद्या — हमें भगवान् मैत्रि ने बताई थी; वही मैं तुमसे कहूँगा।" सुना जाता है कि पापरहित, प्रखर तेजवाले, ऊर्ध्वरेता (नैष्ठिक ब्रह्मचारी) वालखिल्य (ऋषि) थे। उन्होंने प्रजापति से कहा — "भगवन्! यह शरीर छकड़े के समान अचेतन है। इन्द्रियों से अतीत वह कौन है, जिसकी ऐसी महिमा है कि उसके द्वारा यह इस प्रकार का (शरीर) चेतन के समान प्रतिष्ठित किया गया है? अथवा इसका प्रेरक कौन है? भगवन्! यह हमें बताइए।" तब प्रजापति ने उनसे कहा —',
        '“This knowledge of Brahman, O King — the knowledge of all the Upaniṣads — was told to us by the blessed Maitri; I shall tell it to you.” It is heard that there were the Vālakhilyas, free from evil, of keen splendour, of upward-flowing seed. They said to Prajāpati: “Revered sir, this body is unconscious, like a cart. Whose, then, is this greatness, of what being beyond the senses, by whom this body of such a kind is set up as if conscious? Or who is its mover? Revered sir, tell us this.” He said to them:'
      ),
      M(
        [
          'यो ह खलु वावोपरिस्थः श्रूयते गुणेष्विवोर्ध्वरेतसः स वा एष शुद्धः पूतः शून्यः शान्तोऽप्राणो निरात्मानन्तोऽक्षय्यः स्थिरः शाश्वतोऽजः स्वतन्त्रः स्वे महिम्नि तिष्ठति।',
          'अनेनेदं शरीरं चेतनवत्प्रतिष्ठापितं प्रचोदयिता चैषोऽप्यस्येति।',
          'ते होचुर्भगवन्कथमनेनेदृशेनानिच्छेनैतद्विधमिदं चेतनवत्प्रतिष्ठापितं प्रचोदयिता चैषोऽप्यस्य कथमिति।',
          'तान्होवाच॥',
        ],
        '"हे ऊर्ध्वरेताओ! जो गुणों में रहता हुआ भी उनसे ऊपर स्थित सुना जाता है, वह यह शुद्ध, पवित्र, शून्य (उपाधिरहित), शान्त, प्राणरहित, अहंकाररहित, अनन्त, अक्षय, स्थिर, शाश्वत, अजन्मा और स्वतन्त्र है; वह अपनी ही महिमा में स्थित है। उसी के द्वारा यह शरीर चेतन के समान प्रतिष्ठित किया गया है और वही इसका प्रेरक भी है।" उन्होंने कहा — "भगवन्! ऐसे इच्छारहित के द्वारा यह इस प्रकार का (शरीर) चेतन के समान कैसे प्रतिष्ठित किया गया है, और वह इसका प्रेरक कैसे है?" तब उन्होंने उनसे कहा —',
        '“He who is heard of as standing above, as it were, even while among the qualities, O you of upward-flowing seed — he is pure, cleansed, empty, tranquil, breathless, selfless, endless, undecaying, steadfast, eternal, unborn, independent; he abides in his own greatness. By him this body is set up as if conscious; he is also its mover.” They said: “Revered sir, how is this body of such a kind set up as if conscious by one like this, who is without desire, and how is he its mover?” He said to them:'
      ),
      M(
        [
          'स वा एष सूक्ष्मोऽग्राह्योऽदृश्यः पुरुषसंज्ञको बुद्धिपूर्वमिहैवावर्तते अंशेन सुप्तस्यैव बुद्धिपूर्वं निबोधयति।',
          'अथ यो ह खलु वावैतस्यांशोऽयं यश्चेतामात्रः प्रतिपुरुषः क्षेत्रज्ञः सङ्कल्पाध्यवसायाभिमानलिङ्गः प्रजापतिर्विश्वाख्यः।',
          'तेन चेतनेनेदं शरीरं चेतनवत्प्रतिष्ठापितं प्रचोदयिता चैषोऽप्यस्येति।',
          'ते होचुर्भगवन्यदीदृशस्यांशेन वर्तनं कथमिति।',
          'तान्होवाच॥',
        ],
        '"वह यह सूक्ष्म, अग्राह्य, अदृश्य, \'पुरुष\' नाम वाला (परमात्मा) अपने अंश से बुद्धिपूर्वक यहीं (शरीर में) विद्यमान है, जैसे सोये हुए को बुद्धिपूर्वक जगा दिया जाता है। उसका जो यह अंश है — जो चेतनामात्र है, प्रत्येक शरीर में स्थित है, क्षेत्रज्ञ है, संकल्प, निश्चय और अभिमान जिसके चिह्न हैं, वह \'विश्व\' नाम वाला प्रजापति है — उसी चेतन के द्वारा यह शरीर चेतन के समान प्रतिष्ठित किया गया है और वही इसका प्रेरक भी है।" उन्होंने कहा — "भगवन्! यदि ऐसे (निरंश) का अंश से वर्तन है तो वह कैसे?" तब उन्होंने उनसे कहा —',
        '“He, the subtle, the ungraspable, the invisible, called the Person, by a portion of himself is present here with intelligence, as one awakens a sleeper with intelligence. And that portion of him which is mere consciousness, present in each person, the knower of the field, whose marks are conception, determination and self-conceit, is Prajāpati named Viśva. By him, the conscious one, this body is set up as if conscious; he is also its mover.” They said: “Revered sir, if one such as this exists by a portion, how is that?” He said to them:'
      ),
      M(
        [
          'प्रजापतिर्वा एषोऽग्रेऽतिष्ठत्स नारमतैकः स आत्मानमभिध्यायद्बह्वीः प्रजा असृजत्।',
          'ता अश्मेवाप्रबुद्धा अप्राणाः स्थाणुरिव तिष्ठमाना अपश्यत्स नारमत।',
          'सोऽमन्यतैतासां प्रतिबोधनायाभ्यन्तरं प्रविशानीति।',
          'स वायुमिवात्मानं कृत्वाभ्यन्तरं प्राविशत्स एको नाशकत्स पञ्चधात्मानं प्रविभज्योच्यते यः प्राणोऽपानः समान उदानो व्यान इति।',
          'अथ योऽयमूर्ध्वमुत्क्रामत्येष वाव स प्राणः।',
          'अथ योऽयमवाञ्चं सङ्क्रामत्येष वाव सोऽपानः।',
          'अथ योऽयं स्थविष्ठमन्नधातुमपाने स्थापयत्यणिष्ठं चाङ्गेऽङ्गे समं नयत्येष वाव स समानः।',
          'अथ योऽयं पीताशितमुद्गिरति निगिरतीति चैष वाव स उदानः।',
          'अथ येनैताः शिरा अनुव्याप्ता एष वाव स व्यानः।',
          'अथोपांशुरन्तर्याममभिभवत्यन्तर्याम उपांशुमेतयोरन्तराले चौष्ण्यं प्रासुवत्।',
          'यदौष्ण्यं स पुरुषोऽथ यः पुरुषः सोऽग्निर्वैश्वानरः।',
          'अन्यत्राप्युक्तमयमग्निर्वैश्वानरो योऽयमन्तः पुरुषे येनेदमन्नं पच्यते यदिदमद्यते।',
          'तस्यैष घोषो भवति यमेतत्कर्णावपिधाय शृणोति स यदोत्क्रमिष्यन्भवति नैनं घोषं शृणोति।',
          'स वा एष पञ्चधात्मानं प्रविभज्य निहितो गुहायां मनोमयः प्राणशरीरो भारूपः सत्यसङ्कल्प आकाशात्मेति।',
          'स वा एषोऽस्माद्धृदन्तरादकृतार्थोऽमन्यतार्थानश्नानीति।',
          'अतः खानीमानि भित्त्वोदितः पञ्चभी रश्मिभिर्विषयानत्ति।',
          'इति बुद्धीन्द्रियाणि यानीमान्येतान्यस्य रश्मयः कर्मेन्द्रियाण्यस्य हया रथः शरीरं मनो नियन्ता प्रकृतिमयोऽस्य प्रतोदः।',
          'एतेन खल्वीरितं परिभ्रमतीदं शरीरं चक्रमिव मृत्पचेन।',
          'तदिदं शरीरं चेतनवत्प्रतिष्ठापितं प्रचोदयिता चैषोऽप्यस्येति॥',
        ],
        '"आरम्भ में यह प्रजापति अकेला ही था। अकेले उसका मन नहीं लगा। उसने अपने आत्मा का ध्यान करके बहुत-सी प्रजाओं की सृष्टि की। उसने उन्हें पत्थर के समान अबोध, प्राणरहित, ठूँठ की भाँति स्थित देखा; तब भी उसका मन नहीं लगा। उसने सोचा — \'इन्हें जगाने के लिए मैं इनके भीतर प्रवेश करूँ।\' वह अपने को वायु के समान बनाकर भीतर प्रविष्ट हुआ। अकेला होकर वह (कार्य करने में) समर्थ नहीं हुआ; तब उसने अपने को पाँच भागों में विभक्त किया, जो प्राण, अपान, समान, उदान और व्यान कहे जाते हैं। जो यह ऊपर की ओर जाता है, वही प्राण है। जो यह नीचे की ओर जाता है, वही अपान है। जो अन्न के अत्यन्त स्थूल अंश को अपान में स्थापित करता है और अत्यन्त सूक्ष्म अंश को अंग-अंग में समान रूप से पहुँचाता है, वही समान है। जो पिये और खाये हुए को ऊपर उगलता और नीचे निगलता है, वही उदान है। जिससे ये नाड़ियाँ व्याप्त हैं, वही व्यान है। फिर उपांशु (प्राण) अन्तर्याम (अपान) को दबाता है और अन्तर्याम उपांशु को; इन दोनों के बीच में (प्रजापति ने) उष्णता उत्पन्न की। जो उष्णता है, वही पुरुष है; और जो पुरुष है, वही वैश्वानर अग्नि है। अन्यत्र भी कहा है — यह वैश्वानर अग्नि वह है जो पुरुष के भीतर है, जिससे यह अन्न, जो खाया जाता है, पचता है। उसी का यह घोष है, जिसे मनुष्य कानों को बन्द करके सुनता है; जब वह (शरीर से) निकलने वाला होता है, तब इस घोष को नहीं सुनता। वह यह (प्रजापति) अपने को पाँच भागों में बाँटकर हृदयगुहा में स्थित है — मनोमय, प्राणशरीर, प्रकाशस्वरूप, सत्यसंकल्प और आकाश के समान आत्मा वाला। वह यह हृदय के भीतर से अपने को अकृतार्थ मानकर सोचने लगा — \'मैं विषयों का भोग करूँ।\' इसलिए इन इन्द्रिय-छिद्रों को भेदकर बाहर निकला हुआ वह पाँच रश्मियों (लगामों) से विषयों को भोगता है। ये जो ज्ञानेन्द्रियाँ हैं, वे इसकी रश्मियाँ हैं; कर्मेन्द्रियाँ इसके घोड़े हैं; शरीर रथ है; मन सारथि है; प्रकृतिमय (स्वभाव) इसका चाबुक है। इसी के द्वारा प्रेरित होकर यह शरीर घूमता है, जैसे कुम्हार के द्वारा (घुमाया हुआ) चाक। इस प्रकार यह शरीर चेतन के समान प्रतिष्ठित किया गया है और वही इसका प्रेरक भी है।"',
        '“In the beginning Prajāpati stood alone. Being alone he had no delight. Meditating on himself, he brought forth many creatures. He saw them standing like stone, unawakened, lifeless, like a post, and he had no delight. He thought: ‘Let me enter within them to awaken them.’ Making himself like the wind, he entered within. Being one, he could not; so he divided himself fivefold, and is called prāṇa, apāna, samāna, udāna and vyāna. That which rises upward is prāṇa. That which moves downward is apāna. That which places the grossest element of food in the apāna and carries the subtlest evenly to every limb is samāna. That which brings up and swallows down what is drunk and eaten is udāna. That by which these veins are pervaded is vyāna. Then the upāṃśu overpowers the antaryāma, and the antaryāma the upāṃśu, and between them he brought forth heat. That heat is the Person, and that Person is Agni Vaiśvānara. It is said elsewhere: This is the fire Vaiśvānara which is within man, by which the food that is eaten is cooked. Its sound is what one hears on closing the ears; when one is about to depart, one does not hear this sound. He, having divided himself fivefold, is hidden in the cave of the heart — made of mind, having breath for body, of the form of light, of true resolve, whose self is space. He, from within the heart, feeling his purpose unfulfilled, thought: ‘Let me enjoy objects.’ So, bursting open these openings, he goes forth and enjoys objects with five reins. The organs of knowledge are his reins; the organs of action are his horses; the body is the chariot; the mind is the driver; his whip is made of nature. Driven by him this body whirls about like a wheel driven by the potter. Thus this body is set up as if conscious, and he is also its mover.”'
      ),
      M(
        [
          'स वा एष आत्मेत्यदो वशं नीत इव सितासितैः कर्मफलैरभिभूयमान इव प्रतिशरीरेषु चरति।',
          'अव्यक्तत्वात्सौक्ष्म्याददृश्यत्वादग्राह्यत्वान्निर्ममत्वाच्चानवस्थोऽकर्ता कर्तेवावस्थितः।',
          'स वा एष शुद्धः स्थिरोऽचलश्चालेप्योऽव्यग्रो निःस्पृहः प्रेक्षकवदवस्थितः स्वस्थश्च।',
          'ऋतभुग्गुणमयेन पटेनात्मानमन्तर्धायावस्थित इत्यवस्थित इति॥',
        ],
        '"वह यह आत्मा — जिसे \'वह\' कहा गया है — मानो वश में किया हुआ, मानो शुभ-अशुभ कर्मफलों से अभिभूत होता हुआ प्रत्येक शरीर में विचरता है। अव्यक्त, सूक्ष्म, अदृश्य, अग्राह्य और ममतारहित होने के कारण वह अवस्थारहित और अकर्ता होकर भी कर्ता के समान स्थित है। वह यह शुद्ध, स्थिर, अचल, निर्लेप, अव्याकुल, निःस्पृह, द्रष्टा के समान स्थित और अपने स्वरूप में स्थित है। वह ऋत (कर्मफल) का भोक्ता-सा बनकर गुणमय पट से अपने को ढककर स्थित है — ऐसा स्थित है।"',
        '“This Self, who is called ‘that’, as though brought under control, as though overpowered by the bright and dark fruits of action, wanders through body after body. Because he is unmanifest, subtle, invisible, ungraspable and free of ‘mine’, he is without fixed state, and though not a doer he stands as though a doer. He is pure, steady, unmoving, unstained, unperturbed, free from longing, abiding like a spectator, resting in himself. As enjoyer of the right, he stands veiling himself with a cloth woven of the qualities — so he stands.”'
      ),
    ],
    // ── Prapāṭhaka 3 ──
    [
      M(
        [
          'ते होचुर्भगवन्यद्येवमस्यात्मनो महिमानं सूचयसीत्यन्यो वा परः कोऽयमात्माख्यो यः सितासितैः कर्मफलैरभिभूयमानः सदसद्योनिमापद्यत इत्यवाचीं वोर्ध्वां वा गतिं द्वन्द्वैरभिभूयमानः परिभ्रमतीति।',
          'कतम एष इति।',
          'तान्होवाच॥',
        ],
        'उन्होंने कहा — "भगवन्! यदि आप इस प्रकार इस आत्मा की महिमा बताते हैं, तो वह दूसरा कौन है, जिसे आत्मा कहा जाता है, जो शुभ-अशुभ कर्मफलों से अभिभूत होकर अच्छी-बुरी योनियों को प्राप्त होता है और द्वन्द्वों से अभिभूत होकर नीची या ऊँची गति में भटकता रहता है? वह कौन-सा है?" तब उन्होंने उनसे कहा —',
        'They said: “Revered sir, if you thus point out the greatness of this Self, who then is that other, also called self, who, overpowered by the bright and dark fruits of action, enters a good or evil womb, and, overpowered by the pairs of opposites, wanders on a downward or an upward course? Which is he?” He said to them:'
      ),
      M(
        [
          'अस्ति खल्वन्योऽपरो भूतात्माख्यो योऽयं सितासितैः कर्मफलैरभिभूयमानः सदसद्योनिमापद्यत इत्यवाचीं वोर्ध्वां वा गतिं द्वन्द्वैरभिभूयमानः परिभ्रमतीत्यस्योपव्याख्यानम्।',
          'पञ्च तन्मात्राणि भूतशब्देनोच्यन्ते पञ्च महाभूतानि भूतशब्देनोच्यन्ते।',
          'अथ तेषां यः समुदायः शरीरमित्युक्तम्।',
          'अथ यो ह खलु वाव शरीरमित्युक्तं स भूतात्मेत्युक्तम्।',
          'अथामृतोऽस्यात्मा बिन्दुरिव पुष्कर इति।',
          'स वा एषोऽभिभूतः प्राकृतैर्गुणैरित्यतोऽभिभूतत्वात्सम्मूढत्वं प्रयाति।',
          'सम्मूढत्वादात्मस्थं प्रभुं भगवन्तं कारयितारं नापश्यद्गुणौघैश्चोह्यमानः कलुषीकृतश्चास्थिरश्चञ्चलो लोलुपः सम्भ्रमः सस्पृहो व्यग्रश्चाभिमानित्वं प्रयात इति।',
          'अहं सो ममेदमित्येवं मन्यमानो निबध्नात्यात्मनात्मानं जालेनेव खचरः कर्मफलैरभिभूयमानः परिभ्रमतीति॥',
        ],
        '"निश्चय ही एक दूसरा, भिन्न (आत्मा) है, जो भूतात्मा कहलाता है — जो शुभ-अशुभ कर्मफलों से अभिभूत होकर अच्छी-बुरी योनियों को प्राप्त होता है और द्वन्द्वों से अभिभूत होकर नीची या ऊँची गति में भटकता है। इसकी व्याख्या यह है — पाँच तन्मात्राएँ \'भूत\' शब्द से कही जाती हैं, पाँच महाभूत भी \'भूत\' शब्द से कहे जाते हैं। इनका जो समुदाय है, वह \'शरीर\' कहा गया है। और जो \'शरीर\' कहा गया है, वह \'भूतात्मा\' कहा गया है। किन्तु इसका अमृत आत्मा (उससे वैसे ही अलिप्त है) जैसे कमल-पत्र पर जल की बूँद। वह यह (भूतात्मा) प्रकृति के गुणों से अभिभूत है; इस अभिभूत होने के कारण वह मोह को प्राप्त होता है। मोह के कारण वह अपने भीतर स्थित प्रभु, भगवान्, (सब कुछ) करवाने वाले को नहीं देखता; गुणों के प्रवाह में बहता हुआ, कलुषित, अस्थिर, चंचल, लोलुप, व्याकुल, स्पृहायुक्त और व्यग्र होकर अभिमान को प्राप्त हो जाता है। \'मैं यह हूँ, यह मेरा है\' — ऐसा मानता हुआ वह अपने-आप से अपने को ऐसे बाँध लेता है जैसे जाल से पक्षी, और कर्मफलों से अभिभूत होकर भटकता रहता है।"',
        '“There is indeed another, different one, called the elemental self (bhūtātman), who, overpowered by the bright and dark fruits of action, enters a good or evil womb and, overpowered by the pairs of opposites, wanders on a downward or an upward course. This is its explanation. The five subtle elements are called by the word ‘element’; the five gross elements are also called by the word ‘element’. Their aggregate is called the body. And that which is called the body is called the elemental self. But its immortal Self is like a drop of water on a lotus leaf. This elemental self is overpowered by the qualities of nature; being overpowered, it falls into confusion. Through confusion it does not see the Lord, the blessed one, the causer of action, who abides within itself. Borne along and defiled by the streams of the qualities, unsteady, fickle, greedy, bewildered, full of longing and distracted, it falls into self-conceit. Thinking ‘I am he, this is mine’, it binds itself by itself as a bird by a net, and, overpowered by the fruits of action, it wanders about.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तं यः कर्ता सोऽयं वै भूतात्मा करणैः कारयितान्तःपुरुषः।',
          'अथ यथाग्निनायस्पिण्डो वाभिभूतः कर्तृभिर्हन्यमानो नानात्वमुपैत्येवं वाव खल्वसौ भूतात्मान्तःपुरुषेणाभिभूतो गुणैर्हन्यमानो नानात्वमुपैति।',
          'अथ यत्त्रिगुणं चतुरशीतिलक्षयोनिपरिणतं भूतत्रिगणमेतद्वै नानात्वस्य रूपम्।',
          'तानि ह वा इमानि गुणानि पुरुषेणेरितानि चक्रमिव चक्रिणेति।',
          'अथ यथायस्पिण्डे हन्यमाने नाग्निरभिभूयत्येवं नाभिभूयत्यसौ पुरुषोऽभिभूयत्ययं भूतात्मोपसंश्लिष्टत्वादिति॥',
        ],
        '"अन्यत्र भी कहा है — जो कर्ता है, वही यह भूतात्मा है; और (इन्द्रियरूप) करणों द्वारा करवाने वाला अन्तःपुरुष है। जैसे अग्नि से व्याप्त लोहे का पिण्ड कारीगरों द्वारा पीटा जाकर अनेक रूपों को प्राप्त होता है, वैसे ही यह भूतात्मा अन्तःपुरुष से व्याप्त होकर गुणों द्वारा पीटा जाता हुआ अनेकता को प्राप्त होता है। तीन गुणों वाला, चौरासी लाख योनियों में परिणत जो भूतों का त्रिविध समूह है, वही अनेकता का रूप है। ये गुण पुरुष द्वारा वैसे ही प्रेरित होते हैं जैसे चक्र चलाने वाले के द्वारा चक्र। और जैसे लोहे के पिण्ड के पीटे जाने पर अग्नि अभिभूत नहीं होती, वैसे ही वह पुरुष अभिभूत नहीं होता; (उससे) संयुक्त होने के कारण यह भूतात्मा ही अभिभूत होता है।"',
        '“It is said elsewhere: He who is the doer is this elemental self; the one who causes action through the instruments is the inner Person. As a lump of iron pervaded by fire, being hammered by smiths, takes on many forms, so this elemental self, pervaded by the inner Person and hammered by the qualities, takes on manifoldness. The threefold host of elements, having the three qualities and transformed into eighty-four hundred thousand kinds of womb, is the form of manifoldness. These qualities are set in motion by the Person as a wheel by the wheelwright. And as, when the lump of iron is hammered, the fire is not overcome, so that Person is not overcome; it is this elemental self that is overcome, because of its close union.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तं शरीरमिदं मैथुनादेवोद्भूतं संविदपेतं निरय एव।',
          'मूत्रद्वारेण निष्क्रान्तमस्थिभिश्चितं मांसेनानुलिप्तं चर्मणावबद्धं विण्मूत्रपित्तकफमज्जामेदोवसाभिरन्यैश्च मलैर्बहुभिः परिपूर्णं कोश इव वसुनेति॥',
        ],
        '"अन्यत्र भी कहा है — यह शरीर मैथुन से ही उत्पन्न हुआ है, चेतना से रहित है, (मानो) नरक ही है। यह मूत्र-मार्ग से निकला है, हड्डियों से चिना हुआ, मांस से लिपा हुआ, चमड़े से बँधा हुआ है; और विष्ठा, मूत्र, पित्त, कफ, मज्जा, मेद, वसा तथा अन्य बहुत-से मलों से वैसे ही भरा हुआ है जैसे धन से कोष।"',
        '“It is said elsewhere: This body has arisen from sexual union alone; it is devoid of awareness; it is a very hell. It came forth by the urinary passage; it is built up with bones, plastered with flesh, bound with skin, and filled with faeces, urine, bile, phlegm, marrow, fat, grease and many other impurities, as a treasury is filled with wealth.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तं सम्मोहो भयं विषादो निद्रा तन्द्री व्रणो जरा शोकः क्षुत्पिपासा कार्पण्यं क्रोधो नास्तिक्यमज्ञानं मात्सर्यं वैकारुण्यं मूढत्वं निर्व्रीडत्वं निकृतत्वमुद्धतत्वमसमत्वमिति तामसान्वितः।',
          'तृष्णा स्नेहो रागो लोभो हिंसा रतिर्दृष्टिर्व्यापृतत्वमीर्ष्या काममस्थिरत्वं चञ्चलत्वं जिहीर्षार्थोपार्जनं मित्रानुग्रहणं परिग्रहावलम्बोऽनिष्टेष्विन्द्रियार्थेषु द्विष्टिरिष्टेष्वभिष्वङ्ग इति राजसान्वितः।',
          'एतैः परिपूर्ण एतैरभिभूत इत्ययं भूतात्मा तस्मान्नानारूपाण्याप्नोतीत्याप्नोतीति॥',
        ],
        '"अन्यत्र भी कहा है — मोह, भय, विषाद, निद्रा, तन्द्रा, व्रण (घाव), बुढ़ापा, शोक, भूख, प्यास, दीनता, क्रोध, नास्तिकता, अज्ञान, मत्सर, निर्दयता, मूढ़ता, निर्लज्जता, कुटिलता, उद्दण्डता और विषमता — ये तमोगुण से युक्त (लक्षण) हैं। तृष्णा, स्नेह, राग, लोभ, हिंसा, रति, (विषयों पर) दृष्टि, व्यस्तता, ईर्ष्या, कामना, अस्थिरता, चंचलता, (दूसरों का) हरने की इच्छा, धनोपार्जन, मित्रों पर कृपा, परिग्रह का आश्रय, अप्रिय इन्द्रिय-विषयों से द्वेष और प्रिय विषयों में आसक्ति — ये रजोगुण से युक्त (लक्षण) हैं। इनसे परिपूर्ण और इनसे अभिभूत होने के कारण यह भूतात्मा अनेक रूपों को प्राप्त होता है — अनेक रूपों को प्राप्त होता है।"',
        '“It is said elsewhere: Confusion, fear, despondency, sleep, sloth, wounds, old age, grief, hunger, thirst, wretchedness, anger, unbelief, ignorance, jealousy, cruelty, stupidity, shamelessness, deceit, arrogance and unevenness — these are bound up with tamas. Craving, affection, passion, greed, violence, lust, eager looking, busyness, envy, desire, unsteadiness, fickleness, the wish to seize, the getting of wealth, favouring of friends, dependence on possessions, aversion to unpleasant objects of sense and clinging to pleasant ones — these are bound up with rajas. Filled with these and overpowered by these, this elemental self therefore takes on many forms — takes on many forms.”'
      ),
    ],
    // ── Prapāṭhaka 4 ──
    [
      M(
        [
          'ते ह खलु वावोर्ध्वरेतसोऽतिविस्मिता अभिसमेत्योचुर्भगवन्नमस्ते त्वं शाधि त्वमस्माकं गतिरन्या न विद्यत इति।',
          'अस्य कोऽतिविधिर्भूतात्मनो येनेदं हित्वात्मन्येव सायुज्यमुपैतीति।',
          'तान्होवाच॥',
        ],
        'तब वे ऊर्ध्वरेता (वालखिल्य) अत्यन्त विस्मित होकर एकत्र हुए और बोले — "भगवन्! आपको नमस्कार है। आप (हमें) उपदेश दीजिए; आप ही हमारी गति हैं, दूसरी कोई (गति) नहीं है। इस भूतात्मा के लिए कौन-सा उपाय है, जिससे यह इस (शरीर) को छोड़कर आत्मा में ही सायुज्य (एकता) को प्राप्त हो जाए?" तब उन्होंने उनसे कहा —',
        'Then those of upward-flowing seed, greatly astonished, came together and said: “Revered sir, salutation to you! Instruct us; you are our refuge, there is no other. What is the remedy for this elemental self, by which, leaving this behind, it attains union with the Self alone?” He said to them:'
      ),
      M(
        [
          'अथान्यत्राप्युक्तं महानदीषूर्मय इवानिवर्तकमस्य यत्पुराकृतं समुद्रवेलेव दुर्निवार्यमस्य मृत्योरागमनम्।',
          'सदसत्फलमयैर्हि पाशैः पङ्गुरिव बद्धं बन्धनस्थस्येवास्वातन्त्र्यं यमविषयस्थस्येव बहुभयावस्थं मदिरोन्मत्त इव प्रमादमदिरोन्मत्तं ग्राहगृहीत इव भ्राम्यमाणं महोरगदष्ट इव विषयदष्टं महान्धकार इव रागान्धमिन्द्रजालमिव मायामयं स्वप्नमिव मिथ्यादर्शनं कदलीगर्भ इवासारं नट इव क्षणवेषं चित्रभित्तिरिव मिथ्यामनोरममित्यथोक्तम्।',
          'शब्दस्पर्शादयो ह्यर्था अनर्था इव ते स्थिताः।',
          'येष्वासक्तस्तु भूतात्मा न स्मरेत्परमं पदम्॥',
        ],
        '"अन्यत्र भी कहा है — बड़ी नदियों की लहरों के समान इसका पूर्वकृत (कर्म) लौटाया नहीं जा सकता; समुद्र के ज्वार के समान इसकी मृत्यु का आगमन रोका नहीं जा सकता। शुभ-अशुभ फलरूप पाशों से यह पंगु के समान बँधा है; कारागार में पड़े हुए के समान इसकी परतन्त्रता है; यमलोक में स्थित के समान यह बहुत भयों में पड़ा है; मदिरा से उन्मत्त के समान यह प्रमादरूप मदिरा से उन्मत्त है; ग्राह से पकड़े हुए के समान यह चक्कर खा रहा है; महासर्प से डँसे हुए के समान यह विषयों से डँसा हुआ है; घोर अन्धकार के समान यह राग से अन्धा है; इन्द्रजाल के समान मायामय है; स्वप्न के समान मिथ्या दिखने वाला है; केले के गर्भ के समान साररहित है; नट के समान क्षण-क्षण में वेष बदलने वाला है; चित्रित दीवार के समान मिथ्या ही मनोरम है। इसलिए कहा गया है — शब्द, स्पर्श आदि जो विषय हैं, वे अनर्थ के समान स्थित हैं; उनमें आसक्त हुआ भूतात्मा परम पद का स्मरण नहीं करता।"',
        '“It is said elsewhere: Like the waves of great rivers, what it has done before cannot be turned back; like the tide of the ocean, the approach of its death cannot be warded off. Bound like a cripple by the fetters made of the fruits of good and evil; without freedom like one in prison; beset by many fears like one in the realm of Yama; intoxicated with the wine of heedlessness like one drunk with wine; whirled about like one seized by a crocodile; bitten by the objects of sense as by a great serpent; blinded by passion as by great darkness; illusory like a magic show; false in appearance like a dream; pithless like the inside of a plantain; changing its dress every moment like an actor; falsely charming like a painted wall — so it is. Therefore it is said: The objects of sound, touch and the rest stand as if they were mere harms; the elemental self, attached to them, does not remember the highest state.”'
      ),
      M(
        [
          'अयं वाव खल्वस्य प्रतिविधिर्भूतात्मनो यद्वेदविद्याधिगमः स्वधर्मस्यानुचरणं स्वाश्रमेष्वेवानुक्रमणम्।',
          'स्वधर्म एव सर्वं धत्ते स्तम्भशाखेवेतराणि।',
          'अनेनोर्ध्वभाग्भवत्यन्यथाधः पततीत्येष स्वधर्मोऽभिहितो यो वेदेषु।',
          'न स्वधर्मातिक्रमेणाश्रमी भवत्याश्रमेष्वेवावस्थितस्तपस्वी चेत्युच्यते।',
          'एतदप्युक्तं नातपस्कस्यात्मज्ञानेऽधिगमः कर्मशुद्धिर्वेति।',
          'एवं ह्याह — तपसा प्राप्यते सत्त्वं सत्त्वात्सम्प्राप्यते मनः।',
          'मनसा प्राप्यते त्वात्मा यं प्राप्य न निवर्तत इति॥',
        ],
        '"इस भूतात्मा का प्रतिकार (उपाय) निश्चय ही यही है — वेदविद्या को प्राप्त करना, अपने धर्म का आचरण करना और अपने-अपने आश्रमों में ही क्रम से चलना। स्वधर्म ही सबको धारण करता है, जैसे खम्भे की शाखाएँ दूसरों को (धारण करती हैं)। इससे मनुष्य ऊर्ध्वगति का भागी होता है, अन्यथा नीचे गिरता है — यह वह स्वधर्म है जो वेदों में कहा गया है। स्वधर्म का उल्लंघन करके कोई आश्रमी नहीं होता; आश्रमों में ही स्थित रहने वाला तपस्वी कहलाता है। यह भी कहा गया है — तपस्यारहित को आत्मज्ञान की प्राप्ति नहीं होती, न कर्मों की शुद्धि ही होती है। क्योंकि ऐसा कहा है — तप से सत्त्व (शुद्धि) प्राप्त होता है, सत्त्व से मन प्राप्त होता है, और मन से आत्मा प्राप्त होता है, जिसे पाकर (मनुष्य) फिर नहीं लौटता।"',
        '“This truly is the remedy for the elemental self: the attainment of Vedic knowledge, the following of one’s own dharma, and proceeding in due order in one’s own stage of life. One’s own dharma upholds all, as the branches of a pillar uphold the rest. By it one goes upward; otherwise one falls downward. This is the dharma declared in the Vedas. One does not become a member of a stage of life by transgressing one’s own dharma; he who abides in the stages of life is called an ascetic. This too is said: For one without austerity there is no attainment of Self-knowledge, nor purification of works. For thus it is said: By austerity goodness is obtained; from goodness the mind is gained; by the mind the Self is reached, having reached whom one does not return.”'
      ),
      M(
        [
          'अत्रेदमाह — अस्ति ब्रह्मेति ब्रह्मविद्याविदब्रवीद्ब्रह्मद्वारमिदमित्येवैतदाह यस्तपसापहतपाप्मा।',
          'ॐ ब्रह्मणो महिमेत्येवैतदाह यः सुयुक्तोऽजस्रं चिन्तयति।',
          'तस्माद्विद्यया तपसा चिन्तया चोपलभ्यते ब्रह्म।',
          'स ब्रह्मणः पर एता भवत्यधिदैवत्वं देवेभ्यश्चेत्यक्षय्यमपरिमितमनामयं सुखमश्नुते य एवं विद्वाननेन त्रिकेण ब्रह्मोपास्ते।',
          'अथ यैः परिपूर्णोऽभिभूतोऽयं रथितश्चैव तैर्विमुक्तस्त्वात्मन्येव सायुज्यमुपैतीति॥',
        ],
        '"इस विषय में यह कहा गया है — \'ब्रह्म है\' — ऐसा ब्रह्मविद्या के ज्ञाता ने कहा; \'यह ब्रह्म का द्वार है\' — ऐसा वह कहता है जिसने तप से अपने पापों को नष्ट कर दिया है; \'ॐ ब्रह्म की महिमा है\' — ऐसा वह कहता है जो भली-भाँति योगयुक्त होकर निरन्तर (ब्रह्म का) चिन्तन करता है। इसलिए विद्या, तप और चिन्तन से ब्रह्म की उपलब्धि होती है। जो ऐसा जानने वाला इन तीनों के द्वारा ब्रह्म की उपासना करता है, वह ब्रह्म से भी परे (के स्वरूप) को प्राप्त होता है, देवताओं से भी बढ़कर अधिदैवत्व को प्राप्त होता है, और अक्षय, अपरिमित, निरामय सुख का भोग करता है। तब जिन (विषयों) से यह (भूतात्मा) परिपूर्ण, अभिभूत और (रथ में बँधे हुए के समान) रथित था, उनसे मुक्त होकर यह आत्मा में ही सायुज्य को प्राप्त हो जाता है।"',
        '“On this it is said: ‘Brahman exists’ — so said the knower of the knowledge of Brahman. ‘This is the door to Brahman’ — so says he who by austerity has struck away his evil. ‘Om is the greatness of Brahman’ — so says he who, well yoked, meditates on it unceasingly. Therefore Brahman is attained by knowledge, by austerity and by meditation. He who, knowing thus, worships Brahman by this triad goes beyond even Brahman, and to supreme divinity above the gods; he enjoys happiness undecaying, immeasurable, free from ill. Then, freed from those things by which this self was filled, overpowered and driven as in a chariot, he attains union with the Self alone.”'
      ),
      M(
        [
          'ते होचुर्भगवन्नग्निर्वायुरादित्यः कालो यः प्राणोऽन्नं ब्रह्मा रुद्रो विष्णुरित्येकेऽन्यमभिध्यायन्त्येकेऽन्यम्।',
          'श्रेयः कतमो यः सोऽस्माकं ब्रूहीति।',
          'तान्होवाच॥',
        ],
        'उन्होंने कहा — "भगवन्! अग्नि, वायु, आदित्य, काल, जो प्राण है वह, अन्न, ब्रह्मा, रुद्र, विष्णु — इनमें से कुछ लोग किसी एक का ध्यान करते हैं और कुछ किसी दूसरे का। इनमें जो श्रेष्ठ है, वह कौन-सा है — यह हमें बताइए।" तब उन्होंने उनसे कहा —',
        'They said: “Revered sir, Agni, Vāyu, Āditya, Time, that which is breath, food, Brahmā, Rudra, Viṣṇu — some meditate on one, some on another. Tell us which of them is best.” He said to them:'
      ),
      M(
        [
          'ब्रह्मणो वावैता अग्र्यास्तनवः परस्यामृतस्याशरीरस्य।',
          'तस्यैव लोके प्रतिमोदतीह यो यस्यानुषक्त इत्येवं ह्याह।',
          'ब्रह्म खल्विदं वाव सर्वम्।',
          'या वास्या अग्र्यास्तनवस्ता अभिध्यायेदर्चयेन्निह्नुयाच्चातः।',
          'ताभिः सहैवोपर्युपरि लोकेषु चरत्यथ कृत्स्नक्षय एकत्वमेति पुरुषस्य पुरुषस्य॥',
        ],
        '"ये (सब) उस परम, अमृत, अशरीरी ब्रह्म के ही प्रधान शरीर (रूप) हैं। यहाँ जो जिसमें अनुरक्त होता है, वह उसी के लोक में आनन्द पाता है — ऐसा (शास्त्र) कहता है। निश्चय ही यह सब ब्रह्म ही है। इसके जो ये प्रधान शरीर हैं, उनका ध्यान करे, उनकी अर्चना करे और फिर (उन्हें ब्रह्म में) लीन कर दे। उन (रूपों) के साथ ही वह ऊपर-ऊपर के लोकों में विचरता है; फिर सबका प्रलय होने पर वह पुरुष की — परम पुरुष की — एकता को प्राप्त हो जाता है।"',
        '“These are the foremost forms of the supreme, immortal, bodiless Brahman. Whoever here is devoted to any one of them rejoices in that one’s world — so it is said. For all this, truly, is Brahman. One should meditate on these foremost forms of it, worship them, and then let them go. With them one moves through higher and higher worlds; and when the whole is dissolved, one attains the oneness of the Person — of the Person.”'
      ),
    ],
    // ── Prapāṭhaka 5 ──
    [
      M(
        [
          'अथ यथेयं कौत्सायनिस्तुतिः।',
          'त्वं ब्रह्मा त्वं च वै विष्णुस्त्वं रुद्रस्त्वं प्रजापतिः। त्वमग्निर्वरुणो वायुस्त्वमिन्द्रस्त्वं निशाकरः॥',
          'त्वं मनुस्त्वं यमश्च त्वं पृथिवी त्वमथाच्युतः। स्वार्थे स्वाभाविकेऽर्थे च बहुधा तिष्ठसे दिवि॥',
          'विश्वेश्वर नमस्तुभ्यं विश्वात्मा विश्वकर्मकृत्। विश्वभुग्विश्वमायस्त्वं विश्वक्रीडारतिः प्रभुः॥',
          'नमः शान्तात्मने तुभ्यं नमो गुह्यतमाय च। अचिन्त्यायाप्रमेयाय अनादिनिधनाय च॥',
        ],
        'अब यह कौत्सायन की स्तुति है — तुम ही ब्रह्मा हो, तुम ही विष्णु हो, तुम ही रुद्र हो और तुम ही प्रजापति हो; तुम ही अग्नि, वरुण, वायु हो, तुम ही इन्द्र हो और तुम ही चन्द्रमा हो। तुम ही मनु हो, तुम ही यम हो, तुम ही पृथ्वी हो और तुम ही अच्युत (अविनाशी) हो। अपने प्रयोजन के लिए और स्वाभाविक प्रयोजन के लिए तुम द्युलोक में अनेक रूपों में स्थित हो। हे विश्वेश्वर! तुम्हें नमस्कार है; तुम विश्व के आत्मा हो, विश्व के समस्त कर्मों के कर्ता हो; तुम विश्व के भोक्ता हो, विश्वरूपी माया वाले हो, विश्व की क्रीड़ा में रमण करने वाले प्रभु हो। शान्तस्वरूप तुम्हें नमस्कार है, परम गुह्य तुम्हें नमस्कार है; अचिन्त्य, अप्रमेय और आदि-अन्त-रहित तुम्हें नमस्कार है।',
        'Now this is the hymn of Kutsāyana: Thou art Brahmā, thou art Viṣṇu, thou art Rudra, thou art Prajāpati; thou art Agni, Varuṇa, Vāyu; thou art Indra, thou art the moon. Thou art Manu, thou art Yama, thou art the earth, thou art the imperishable Acyuta. For thine own sake and for the sake of nature thou abidest in many forms in the heavens. Lord of the universe, salutation to thee — soul of all, doer of all works, enjoyer of all, thou whose magic power is the universe, the Lord who delights in the play of the world. Salutation to thee whose self is peace, salutation to the most hidden one, to the unthinkable, the immeasurable, to him who has neither beginning nor end.'
      ),
      M(
        [
          'तमो वा इदमग्र आसीदेकं तत्परे स्यात्तत्परेणेरितं विषमत्वं प्रयात्येतद्रूपं वै रजः।',
          'तद्रजः खल्वीरितं विषमत्वं प्रयात्येतद्वै सत्त्वस्य रूपं तत्सत्त्वमेवेरितं रसः सम्प्रास्रवत्।',
          'सोंऽशोऽयं यश्चेतामात्रः प्रतिपुरुषं क्षेत्रज्ञः सङ्कल्पाध्यवसायाभिमानलिङ्गः प्रजापतिर्विश्वेत्यस्य प्रागुक्ता एतास्तनवः।',
          'अथ यो ह खलु वावास्य तामसोंऽशोऽसौ स ब्रह्मचारिणो योऽयं रुद्रः।',
          'अथ यो ह खलु वावास्य राजसोंऽशोऽसौ स ब्रह्मचारिणो योऽयं ब्रह्मा।',
          'अथ यो ह खलु वावास्य सात्त्विकोंऽशोऽसौ स ब्रह्मचारिणो योऽयं विष्णुः।',
          'स वा एष एकस्त्रिधाभूतोऽष्टधैकादशधा द्वादशधापरिमितधा चोद्भूत उद्भूतत्वाद्भूतं भूतेषु चरति प्रविष्टः स भूतानामधिपतिर्बभूवेत्यसावात्मान्तर्बहिश्चान्तर्बहिश्च॥',
        ],
        'आरम्भ में यह (जगत्) एकमात्र तम ही था। वह परम (तत्त्व) में स्थित था; परम के द्वारा प्रेरित होकर वह विषमता को प्राप्त हुआ — यही रजस् का रूप है। वह रजस् भी प्रेरित होकर विषमता को प्राप्त हुआ — यही सत्त्व का रूप है। वह सत्त्व प्रेरित होने पर रस (सार) रूप में प्रवाहित हुआ। वही यह अंश है जो प्रत्येक पुरुष में चेतनामात्र क्षेत्रज्ञ है, जिसके लक्षण संकल्प, निश्चय और अभिमान हैं; वही प्रजापति ‘विश्व’ है, जिसके ये शरीर (रूप) पहले कहे जा चुके हैं। हे ब्रह्मचारियो! इसका जो तामस अंश है, वही यह रुद्र है। इसका जो राजस अंश है, वही यह ब्रह्मा है। इसका जो सात्त्विक अंश है, वही यह विष्णु है। वही यह एक तीन रूपों वाला हुआ, फिर आठ, ग्यारह, बारह और अपरिमित रूपों में प्रकट हुआ। प्रकट होने के कारण वह भूत (उत्पन्न) है, भूतों में प्रविष्ट होकर विचरता है और भूतों का अधिपति हुआ। वही यह आत्मा भीतर और बाहर है — भीतर और बाहर।',
        'In the beginning this world was darkness (tamas) alone. That rested in the Supreme; impelled by the Supreme it passed into unevenness — that form is rajas. That rajas, impelled, passed into unevenness — that is the form of sattva. That sattva, impelled, flowed forth as essence. That is the portion which, as mere intelligence in each person, is the knower of the field, marked by conception, determination and self-conceit — Prajāpati, the All, whose forms have been declared before. Now that portion of him which belongs to tamas, O students of sacred knowledge, is Rudra. That portion of him which belongs to rajas, O students, is Brahmā. That portion of him which belongs to sattva, O students, is Viṣṇu. Verily, that One became threefold; he unfolded eightfold, elevenfold, twelvefold, into infinite parts. Because he has come forth he is a being, he moves among beings having entered them, he became the overlord of beings. He is the Self within and without — yes, within and without.'
      ),
    ],
    // ── Prapāṭhaka 6 ──
    [
      M(
        [
          'द्विधा वा एष आत्मानं बिभर्ति यश्चायं प्राणो यश्चासावादित्यः।',
          'अथ द्वौ वा एतावस्य पन्थानावन्तर्बहिश्चाहोरात्रेणैतौ व्यावर्तेते।',
          'असौ वा आदित्यो बहिरात्मान्तरात्मा प्राणः।',
          'अतो बहिरात्मीयया गत्यान्तरात्मनोऽनुमीयते गतिरित्येवं ह्याह।',
          'अथ यः कश्चिद्विद्वानपहतपाप्माक्षाध्यक्षोऽवदातमनास्तन्निष्ठ आवृत्तचक्षुः सोऽन्तरात्मीयया गत्या बहिरात्मनोऽनुमीयते गतिरित्येवं ह्याह।',
          'अथ य एषोऽन्तरादित्ये हिरण्मयः पुरुषो यः पश्यतीमां हिरण्यवस्थात्स एषोऽन्तरे हृत्पुष्कर एवाश्रितोऽन्नमत्ति॥',
        ],
        'यह आत्मा अपने को दो प्रकार से धारण करता है — एक यह जो प्राण है और दूसरा वह जो आदित्य है। इसके ये दो मार्ग हैं — भीतरी और बाहरी; ये दोनों दिन और रात के द्वारा लौटते रहते हैं। वह आदित्य ही बाह्य आत्मा है और प्राण अन्तरात्मा है। इसलिए बाह्य आत्मा की गति से अन्तरात्मा की गति का अनुमान किया जाता है — ऐसा कहा गया है। और जो कोई विद्वान्, पापरहित, इन्द्रियों का अध्यक्ष, शुद्ध मन वाला, उसी (ब्रह्म) में निष्ठ और अन्तर्मुख दृष्टि वाला है, उसकी अन्तरात्मा की गति से बाह्य आत्मा की गति का अनुमान किया जाता है — ऐसा कहा गया है। जो यह आदित्य के भीतर सुवर्णमय पुरुष है, जो अपने सुवर्णमय स्थान से इस पृथ्वी को देखता है, वही यह हृदय-कमल के भीतर आश्रित होकर अन्न खाता है।',
        'This Self bears itself in two ways: as he who is breath and as he who is yonder sun. He has these two paths, inward and outward; both turn back with day and night. Yonder sun is the outer self; the inner self is breath. Hence the course of the inner self is inferred from the course of the outer self — so it is said. And whoever is wise, free from evil, overseer of the senses, pure of mind, grounded in That, with gaze turned inward — from the course of his inner self the course of the outer self is inferred — so it is said. Now the golden person within the sun, who looks down upon this earth from his golden seat, is the same who, dwelling in the lotus of the heart, eats food.'
      ),
      M(
        [
          'अथ य एषोऽन्तरे हृत्पुष्कर एवाश्रितोऽन्नमत्ति स एषोऽग्निर्दिवि श्रितः सौरः कालाख्योऽदृश्यः सर्वभूतान्यन्नमत्तीति।',
          'कः पुष्करः किंमयो वेति।',
          'इदं वाव तत्पुष्करं योऽयमाकाशोऽस्येमाश्चतस्रो दिशश्चतस्र उपदिशो दलसंस्थाः।',
          'इमौ प्राणादित्यावर्वाञ्चौ वर्तेते।',
          'उपासीतैतावोमित्येतदक्षरेण व्याहृतिभिः सावित्र्या चेति॥',
        ],
        'और जो यह हृदय-कमल में आश्रित होकर अन्न खाता है, वही यह द्युलोक में स्थित सौर अग्नि है, जो ‘काल’ नाम वाला, अदृश्य है और समस्त भूतों को अन्न के रूप में खाता है। वह कमल क्या है और किससे बना है? यह जो आकाश है, वही वह कमल है; ये चार दिशाएँ और चार उपदिशाएँ उसके दल हैं। ये प्राण और आदित्य एक-दूसरे के निकट होकर चलते हैं। इन दोनों की उपासना ‘ॐ’ इस अक्षर से, व्याहृतियों से और सावित्री (गायत्री) से करनी चाहिए।',
        'And he who, dwelling in the lotus of the heart, eats food is the solar fire set in the sky, called Time, invisible, who eats all beings as his food. What is the lotus, and of what is it made? That lotus is this space; the four quarters and the four intermediate quarters are its petals. These two, breath and the sun, move close to one another. One should worship them with the syllable Om, with the Vyāhṛtis and with the Sāvitrī.'
      ),
      M(
        [
          'द्वे वाव ब्रह्मणो रूपे मूर्तं चामूर्तं च।',
          'अथ यन्मूर्तं तदसत्यं यदमूर्तं तत्सत्यं तद्ब्रह्म तज्ज्योतिर्यज्ज्योतिः स आदित्यः।',
          'स वा एष ओमित्येतदात्माभवत्स त्रेधात्मानं व्यकुरुत।',
          'ओमिति तिस्रो मात्रा एताभिः सर्वमिदमोतं प्रोतं चैवास्मिन्निति।',
          'एवं ह्याहैतद्वा आदित्य ओमित्येवं ध्यायन्नात्मानं युञ्जीतेति॥',
        ],
        'ब्रह्म के दो ही रूप हैं — मूर्त और अमूर्त। जो मूर्त है वह असत्य है, और जो अमूर्त है वह सत्य है, वही ब्रह्म है, वही ज्योति है; और जो ज्योति है वही आदित्य है। वह यह (आदित्य) ‘ॐ’ इस अक्षर का आत्मा हुआ। उसने अपने को तीन प्रकार से विभक्त किया। ‘ॐ’ में तीन मात्राएँ हैं; इन्हीं के द्वारा यह सब इसमें ओत-प्रोत है। ऐसा कहा गया है — ‘यह आदित्य ही ॐ है’, इस प्रकार ध्यान करते हुए आत्मा को (उसमें) युक्त करे।',
        'There are, verily, two forms of Brahman: the formed and the formless. What is formed is unreal; what is formless is real — that is Brahman, that is light, and what is light is the sun. Verily, this became the self of Om. He divided himself threefold: Om has three measures, and by these the whole world is woven warp and woof in him. For so it is said: meditating ‘The sun is Om’, one should join oneself to it.'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्।',
          'अथ खलु य उद्गीथः स प्रणवो यः प्रणवः स उद्गीथ इत्यसावादित्य उद्गीथ एष प्रणव इत्येवं ह्याह।',
          'उद्गीथं प्रणवाख्यं प्रणेतारं भारूपं विगतनिद्रं विजरं विमृत्युं त्रिपदं त्र्यक्षरं पुनः पञ्चधा ज्ञेयं निहितं गुहायामित्येवं ह्याह।',
          'ऊर्ध्वमूलं त्रिपाद्ब्रह्म शाखा आकाशवाय्वग्न्युदकभूम्यादय एकोऽश्वत्थनामैतद्ब्रह्मैतस्यैतत्तेजो यदसावादित्य ओमित्येतदक्षरस्य चैतत्।',
          'तस्मादोमित्यनेनैतदुपासीताजस्रमित्येकोऽस्य सम्बोधयितेत्येवं ह्याह।',
          'एतदेवाक्षरं पुण्यमेतदेवाक्षरं परम्। एतदेवाक्षरं ज्ञात्वा यो यदिच्छति तस्य तत्॥',
        ],
        'अन्यत्र भी कहा गया है — जो उद्गीथ है वही प्रणव है, और जो प्रणव है वही उद्गीथ है; वह आदित्य उद्गीथ है और यह (प्राण) प्रणव है — ऐसा कहा गया है। उद्गीथ, जिसका नाम प्रणव है, जो सबका प्रेरक है, प्रकाशस्वरूप है, निद्रारहित, जरारहित, मृत्युरहित है, तीन पदों वाला, तीन अक्षरों वाला है, फिर पाँच प्रकार से जानने योग्य है और गुहा (हृदय) में निहित है — ऐसा कहा गया है। तीन पादों वाला ब्रह्म ऊपर की ओर मूल वाला है; आकाश, वायु, अग्नि, जल, पृथ्वी आदि उसकी शाखाएँ हैं; यह ‘अश्वत्थ’ नाम वाला एक (वृक्ष) ब्रह्म है। उसका तेज यह है जो वह आदित्य है, और वही ‘ॐ’ इस अक्षर का भी (तेज) है। इसलिए ‘ॐ’ इसके द्वारा इसकी निरन्तर उपासना करनी चाहिए; यही एक इसका जगाने वाला है — ऐसा कहा गया है। यही अक्षर पवित्र है, यही अक्षर परम है; इसी अक्षर को जानकर जो जो चाहता है, उसे वह प्राप्त होता है।',
        'It has also been said elsewhere: what is the Udgītha is the Praṇava, and what is the Praṇava is the Udgītha; yonder sun is the Udgītha, this is the Praṇava — so it is said. The Udgītha, called Praṇava, the leader, of the form of light, sleepless, ageless, deathless, three-footed, three-syllabled, to be known also as fivefold, hidden in the cave — so it is said. The three-footed Brahman has its root above; its branches are space, wind, fire, water, earth and the rest; this is the one called the Aśvattha, this is Brahman. Its splendour is yonder sun, and it is the splendour of the syllable Om as well. Therefore one should worship it unceasingly with Om; it alone is its awakener — so it is said. This syllable alone is holy, this syllable alone is supreme; knowing this very syllable, whatever one desires is his.'
      ),
      M(
        [
          'अथान्यत्राप्युक्तं स्वनवत्येषास्य तनूर्या ओमिति।',
          'स्त्रीपुंनपुंसकेति लिङ्गवत्येषाथाग्निर्वायुरादित्य इति भास्वत्येषाथ ब्रह्मा रुद्रो विष्णुरित्यधिपतिवत्येषा।',
          'अथ गार्हपत्यो दक्षिणाग्निराहवनीय इति मुखवत्येषाथ ऋग्यजुःसामेति विज्ञानवत्येषा।',
          'भूर्भुवः स्वरिति लोकवत्येषाथ भूतं भव्यं भविष्यदिति कालवत्येषा।',
          'अथ प्राणोऽग्निः सूर्य इति प्रतापवत्येषाथान्नमापश्चन्द्रमा इत्याप्यायनवत्येषा।',
          'अथ बुद्धिर्मनोऽहङ्कार इति चेतनवत्येषाथ प्राणोऽपानो व्यान इति प्राणवत्येषेति।',
          'अत ओमित्युक्तेनैताः प्रस्तुता अर्चिता अर्पिता भवन्तीति।',
          'एवं ह्याहैतद्वै सत्यकाम परं चापरं च ब्रह्म यदोमित्येतदक्षरमिति॥',
        ],
        'अन्यत्र भी कहा गया है — इस (आत्मा) का शब्दवान् शरीर यह है जो ‘ॐ’ है। स्त्री, पुरुष, नपुंसक — यह इसका लिंगवान् शरीर है; अग्नि, वायु, आदित्य — यह प्रकाशवान् शरीर है; ब्रह्मा, रुद्र, विष्णु — यह अधिपतिवान् शरीर है। गार्हपत्य, दक्षिणाग्नि, आहवनीय — यह मुखवान् शरीर है; ऋक्, यजुः, साम — यह विज्ञानवान् शरीर है। भूः, भुवः, स्वः — यह लोकवान् शरीर है; भूत, वर्तमान और भविष्य — यह कालवान् शरीर है। प्राण, अग्नि, सूर्य — यह प्रतापवान् शरीर है; अन्न, जल, चन्द्रमा — यह पोषणवान् शरीर है। बुद्धि, मन, अहंकार — यह चेतनावान् शरीर है; प्राण, अपान, व्यान — यह प्राणवान् शरीर है। इसलिए ‘ॐ’ के उच्चारण से ये सब स्तुत, पूजित और समर्पित हो जाते हैं। ऐसा कहा गया है — हे सत्यकाम! यह जो ‘ॐ’ अक्षर है, वही पर और अपर ब्रह्म है।',
        'It has also been said elsewhere: this is its sound-form, namely Om. Feminine, masculine, neuter — this is its gender-form; fire, wind, sun — this is its light-form; Brahmā, Rudra, Viṣṇu — this is its lordship-form. The Gārhapatya, the Dakṣiṇa fire and the Āhavanīya — this is its mouth-form; Ṛk, Yajus, Sāman — this is its knowledge-form. Bhūr, Bhuvas, Svar — this is its world-form; past, present, future — this is its time-form. Breath, fire, sun — this is its heat-form; food, water, moon — this is its nourishment-form. Intellect, mind, ego — this is its consciousness-form; prāṇa, apāna, vyāna — this is its breath-form. Therefore, by uttering Om all these are praised, worshipped and offered up. For so it is said: this, O Satyakāma, is both the higher and the lower Brahman — the syllable Om.'
      ),
      M(
        [
          'अथाव्याहृतं वा इदमासीत्।',
          'स सत्यं प्रजापतिस्तपस्तप्त्वानुव्याहरद्भूर्भुवः स्वरिति।',
          'एषैवास्य प्रजापतेः स्थविष्ठा तनूर्या लोकवतीति।',
          'स्वरित्यस्याः शिरो नाभिर्भुवो भूः पादा आदित्यश्चक्षुः।',
          'चक्षुरायत्ता हि पुरुषस्य महती मात्रा चक्षुषा ह्ययं मात्राश्चरति।',
          'सत्यं वै चक्षुरक्षिण्यवस्थितो हि पुरुषः सर्वार्थेषु चरतीति।',
          'एतस्माद्भूर्भुवः स्वरित्युपासीतानेन हि प्रजापतिर्विश्वात्मा विश्वचक्षुरिवोपासितो भवतीत्येवं ह्याह।',
          'एषा वै प्रजापतेर्विश्वभृत्तनूरेतस्यामिदं सर्वमन्तर्हितमस्मिंश्च सर्वस्मिन्नेषान्तर्हितेति तस्मादेषोपासीत॥',
        ],
        'पहले यह (जगत्) अव्याहृत (नामरहित, अव्यक्त) था। उस सत्यस्वरूप प्रजापति ने तप करके ‘भूः, भुवः, स्वः’ — ऐसा उच्चारण किया। यही इस प्रजापति का सबसे स्थूल शरीर है, जो लोकवान् है। ‘स्वः’ इसका सिर है, ‘भुवः’ नाभि है, ‘भूः’ पैर हैं और आदित्य नेत्र है। पुरुष की महान् मात्रा (विषय-ग्रहण) नेत्र के अधीन है, क्योंकि नेत्र के द्वारा ही यह मात्राओं में विचरता है। नेत्र ही सत्य है, क्योंकि नेत्र में स्थित पुरुष ही सब विषयों में विचरता है। इसलिए ‘भूः, भुवः, स्वः’ — इस प्रकार उपासना करे; इससे विश्वात्मा प्रजापति, मानो विश्व का नेत्र, उपासित हो जाता है — ऐसा कहा गया है। यही प्रजापति का विश्व को धारण करने वाला शरीर है; इसमें यह सब छिपा है और इस सबमें यह छिपा है; इसलिए इसकी उपासना करनी चाहिए।',
        'In the beginning this world was unuttered. Prajāpati, the Real, having performed austerity, uttered ‘Bhūr, Bhuvas, Svar’. This is the grossest form of Prajāpati, the world-form. Svar is its head, Bhuvas its navel, Bhūr its feet, the sun its eye. For upon the eye depends the great measure of a person, since by the eye he moves among the measures. The eye is truth, for the person abiding in the eye moves among all objects. Therefore one should worship with ‘Bhūr, Bhuvas, Svar’, for thereby Prajāpati, the soul of all, the eye of all, is as it were worshipped — so it is said. This is the all-sustaining form of Prajāpati: in it this whole world is hidden, and in this whole world it is hidden; therefore one should worship it.'
      ),
      M(
        [
          'तत्सवितुर्वरेण्यमित्यसौ वा आदित्यः सविता स वा एवं प्रवरणीय आत्मकामेनेत्याहुर्ब्रह्मवादिनः।',
          'अथ भर्गो देवस्य धीमहीति सविता वै देवस्ततो योऽस्य भर्गाख्यस्तं चिन्तयामीत्याहुर्ब्रह्मवादिनः।',
          'अथ धियो यो नः प्रचोदयादिति बुद्धयो वै धियस्ता योऽस्माकं प्रचोदयादित्याहुर्ब्रह्मवादिनः।',
          'अथ भर्ग इति यो ह वा अमुष्मिन्नादित्ये निहितस्तारकोऽक्षिणि वैष भर्गाख्यो भाभिर्गतिरस्य हीति भर्गः।',
          'भर्जयतीति वैष भर्ग इति रुद्रो ब्रह्मवादिनः।',
          'अथ भ इति भासयतीमाँल्लोकान्र इति रञ्जयतीमानि भूतानि ग इति गच्छन्त्यस्मिन्नागच्छन्त्यस्मादिमाः प्रजास्तस्माद्भरगत्वाद्भर्गः।',
          'शश्वत्सूयमानात्सूर्यः सवनात्सविता आदानादादित्यः पवनात्पावनोऽथापोऽप्यायनादित्येवं ह्याह।',
          'खल्वात्मन आत्मा नेतामृताख्यश्चेता मन्ता गन्ता स्रष्टानन्दयिता कर्ता वक्ता रसयिता घ्राता द्रष्टा श्रोता स्पृशति च विभुर्विग्रहे सन्निविष्ट इत्येवं ह्याह।',
          'अथ यत्र द्वैतीभूतं विज्ञानं तत्र हि शृणोति पश्यति जिघ्रति रसयति चैव स्पर्शयति सर्वमात्मा जानीतेति।',
          'यत्राद्वैतीभूतं विज्ञानं कार्यकारणकर्मनिर्मुक्तं निर्वचनमनौपम्यं निरुपाख्यं किं तदवाच्यम्॥',
        ],
        '‘तत्सवितुर्वरेण्यम्’ — वह आदित्य ही सविता है; आत्मा की कामना करने वाले को उसी का इस प्रकार वरण करना चाहिए — ऐसा ब्रह्मवादी कहते हैं। ‘भर्गो देवस्य धीमहि’ — सविता ही देव है; उसका जो ‘भर्ग’ नामक (तेज) है, उसका मैं चिन्तन करता हूँ — ऐसा ब्रह्मवादी कहते हैं। ‘धियो यो नः प्रचोदयात्’ — बुद्धियाँ ही ‘धी’ हैं; जो उन्हें हमारे लिए प्रेरित करे — ऐसा ब्रह्मवादी कहते हैं। ‘भर्ग’ वह है जो उस आदित्य में निहित है, अथवा जो नेत्र में तारा (पुतली) है; यही ‘भर्ग’ नाम वाला है, क्योंकि प्रकाश (भा) द्वारा इसकी गति है, इसलिए यह भर्ग है। अथवा यह भून डालता (भर्जयति) है, इसलिए भर्ग है — यह रुद्र है, ऐसा ब्रह्मवादी कहते हैं। ‘भ’ — यह इन लोकों को प्रकाशित करता है; ‘र’ — इन भूतों को रंजित (प्रसन्न) करता है; ‘ग’ — ये प्रजाएँ इसी में जाती हैं और इसी से आती हैं; इस ‘भ-र-ग’ होने के कारण यह भर्ग है। निरन्तर सवन (प्रसव) होने से सूर्य, प्रेरणा से सविता, ग्रहण करने से आदित्य, पवित्र करने से पावन, और पोषण करने से आप (जल) कहलाता है — ऐसा कहा गया है। निश्चय ही यह आत्मा का आत्मा, नेता, अमृत नाम वाला, चेतन, मनन करने वाला, जाने वाला, सृष्टि करने वाला, आनन्द देने वाला, कर्ता, वक्ता, रस लेने वाला, सूँघने वाला, द्रष्टा, श्रोता और स्पर्श करने वाला है; वह व्यापक होकर शरीर में प्रविष्ट है — ऐसा कहा गया है। जहाँ ज्ञान द्वैतभाव को प्राप्त है, वहीं आत्मा सुनता, देखता, सूँघता, चखता, स्पर्श करता और सब कुछ जानता है। जहाँ ज्ञान अद्वैतभाव को प्राप्त है — कार्य, कारण और कर्म से मुक्त, वचन से परे, उपमारहित, अवर्णनीय — वह क्या है? वह अवाच्य है।',
        '‘Tat savitur vareṇyam’: yonder sun is Savitṛ; him should one who desires the Self choose in this way — so say the expounders of Brahman. ‘Bhargo devasya dhīmahi’: Savitṛ is the god; on that in him which is called Bharga I meditate — so say the expounders of Brahman. ‘Dhiyo yo naḥ pracodayāt’: the dhīs are our understandings; may he impel them for us — so say the expounders of Brahman. Now Bharga is he who is set in yonder sun, or who is the pupil in the eye; he is called Bharga because his course is by rays of light (bhā). Or he is Bharga because he parches (bharjayati) — this is Rudra, say the expounders of Brahman. Or: bha, because he illumines these worlds; ra, because he delights these beings; ga, because these creatures go into him and come forth from him — being bha-ra-ga, he is Bharga. He is Sūrya because of constant pressing forth, Savitṛ because of impelling, Āditya because of taking up, Pāvana because of purifying, and the waters because of nourishing — so it is said. Verily, the self of the Self is the leader, called the immortal, the thinker, perceiver, goer, creator, gladdener, doer, speaker, taster, smeller, seer, hearer, and he touches; the all-pervading one has entered the body — so it is said. Where knowledge has become dual, there indeed the Self hears, sees, smells, tastes, touches and knows all. Where knowledge is non-dual, free from effect, cause and action, beyond speech, beyond comparison, indescribable — what is that? It cannot be spoken.'
      ),
      M(
        [
          'एष हि खल्वात्मेशानः शम्भुर्भवो रुद्रः प्रजापतिर्विश्वसृग्घिरण्यगर्भः सत्यं प्राणो हंसः शास्ता विष्णुर्नारायणोऽर्कः सविता धाता विधाता सम्राडिन्द्र इन्दुरिति।',
          'य एष तपत्यग्निरिवाग्निना पिहितः सहस्राक्षेण हिरण्मयेनाण्डेन।',
          'एष वा जिज्ञासितव्योऽन्वेष्टव्यः।',
          'सर्वभूतेभ्योऽभयं दत्त्वारण्यं गत्वाथ बहिः कृत्वेन्द्रियार्थान्स्वाच्छरीरादुपलभेतैनमिति।',
          'विश्वरूपं हरिणं जातवेदसं परायणं ज्योतिरेकं तपन्तम्। सहस्ररश्मिः शतधा वर्तमानः प्राणः प्रजानामुदयत्येष सूर्यः॥',
        ],
        'यही आत्मा ईशान, शम्भु, भव, रुद्र, प्रजापति, विश्वस्रष्टा, हिरण्यगर्भ, सत्य, प्राण, हंस, शास्ता, विष्णु, नारायण, अर्क, सविता, धाता, विधाता, सम्राट्, इन्द्र और इन्दु (चन्द्रमा) है। यही वह है जो अग्नि से ढकी अग्नि की भाँति सहस्र नेत्रों वाले सुवर्णमय अण्ड से आवृत होकर तपता है। इसी को जानने की इच्छा करनी चाहिए, इसी का अन्वेषण करना चाहिए। सब भूतों को अभय देकर, वन में जाकर, इन्द्रियों के विषयों को बाहर करके अपने शरीर में ही इसे प्राप्त करे। (यह वही है) जो विश्वरूप, हरिण (स्वर्णिम), जातवेदा, परम आश्रय, एक ज्योति और तपने वाला है; सहस्र रश्मियों वाला, सैकड़ों रूपों में वर्तमान, प्रजाओं का प्राण — यह सूर्य उदित होता है।',
        'This Self, verily, is Īśāna, Śambhu, Bhava, Rudra, Prajāpati, the creator of all, Hiraṇyagarbha, the Real, Breath, the Swan, the Ruler, Viṣṇu, Nārāyaṇa, Arka, Savitṛ, Dhātṛ, Vidhātṛ, the Sovereign, Indra, Indu. He it is who glows like fire covered by fire, enclosed by the thousand-eyed golden egg. He is to be sought to be known, he is to be searched for. Having given freedom from fear to all beings, having gone to the forest, having set aside the objects of sense, one should find him within one’s own body. He who has every form, golden, the knower of all beings, the final goal, the one light, the glowing — thousand-rayed, abiding in a hundred ways, the life of creatures — there rises the sun.'
      ),
      M(
        [
          'तस्माद्वा एष उभयात्मैवंविदात्मन्येव ध्यायत्यात्मन्येव यजतीति।',
          'ध्यानं प्रयोगस्थं मनो विद्वद्भिष्टुतम्।',
          'मनःपूतिमुच्छिष्टोपहतमित्यनेन तत्पावयेत्।',
          'मन्त्रं पठति — उच्छिष्टोच्छिष्टोपहितं यच्च पापेन दत्तं मृतसूतकाद्वा वसोः पवित्रमग्निः सवितुश्च रश्मयः पुनन्त्वन्नं मम दुष्कृतं च यदन्यत्।',
          'अद्भिः पुरस्तात्परिदधाति।',
          'प्राणाय स्वाहापानाय स्वाहा व्यानाय स्वाहा समानाय स्वाहोदानाय स्वाहेति पञ्चभिरभिजुहोति।',
          'अथावशिष्टं यतवागश्नात्यतोऽद्भिर्भूय एवोपरिष्टात्परिदधाति।',
          'आचान्तो भूत्वात्मेज्यानः प्राणोऽग्निर्विश्वोऽसीति च द्वाभ्यामात्मानमभिध्यायेत्।',
          'प्राणोऽग्निः परमात्मा वै पञ्चवायुः समाश्रितः। स प्रीतः प्रीणातु विश्वं विश्वभुक्॥',
          'विश्वोऽसि वैश्वानरोऽसि विश्वं त्वया धार्यते जायमानम्। विशन्तु त्वामाहुतयश्च सर्वाः प्रजास्तत्र यत्र विश्वामृतोऽसि॥',
          'एवं न विधिना खल्वनेनात्तान्नत्वं पुनरुपैति॥',
        ],
        'इसलिए यह (आत्मा) उभयरूप है; इस प्रकार जानने वाला आत्मा में ही ध्यान करता है और आत्मा में ही यजन करता है। (साधना के) प्रयोग में स्थित मन का ध्यान विद्वानों द्वारा प्रशंसित है। जूठन आदि से दूषित मन के मल को इस (मन्त्र) से पवित्र करे। वह यह मन्त्र पढ़ता है — ‘जो जूठन से या जूठन के संसर्ग से दूषित है, जो पापी द्वारा दिया गया है, या जो मृतक-सूतक से प्राप्त है — वसु का पवित्र करने वाला अग्नि और सविता की रश्मियाँ मेरे उस अन्न को और जो अन्य दुष्कृत है उसे पवित्र करें।’ (भोजन से) पहले जल से (अन्न का) परिषेचन करता है। ‘प्राणाय स्वाहा, अपानाय स्वाहा, व्यानाय स्वाहा, समानाय स्वाहा, उदानाय स्वाहा’ — इन पाँच (मन्त्रों) से आहुति देता है। फिर शेष अन्न को वाणी का संयम रखकर खाता है; इसके बाद फिर जल से ऊपर से परिषेचन करता है। आचमन करके, आत्मा का यजन करने वाला ‘प्राणोऽग्निः’ और ‘विश्वोऽसि’ — इन दो (मन्त्रों) से आत्मा का ध्यान करे — ‘प्राण ही अग्नि है, परमात्मा है, जो पाँच वायुओं के रूप में आश्रित है; वह विश्व का भोक्ता प्रसन्न होकर विश्व को प्रसन्न करे। तुम विश्व हो, तुम वैश्वानर हो, उत्पन्न होता हुआ यह विश्व तुम्हारे द्वारा धारण किया जाता है; सब आहुतियाँ तुममें प्रवेश करें; प्रजाएँ वहाँ हैं जहाँ तुम सबके अमृत हो।’ इस विधि से भोजन करने वाला फिर अन्न बनने (जन्म-मरण) को प्राप्त नहीं होता।',
        'Therefore this Self is twofold; he who knows thus meditates in the Self alone and sacrifices in the Self alone. Meditation, the mind fixed in practice, is praised by the wise. One should purify the defilement of the mind, tainted by leavings, with this: he recites the verse — ‘What is left over or tainted by leavings, what has been given by a sinner, or what comes from one impure through a death — may the purifying fire of Vasu and the rays of Savitṛ cleanse that food of mine and whatever other evil there is.’ First he surrounds the food with water. With the five — ‘To prāṇa svāhā, to apāna svāhā, to vyāna svāhā, to samāna svāhā, to udāna svāhā’ — he offers oblations. Then, restraining speech, he eats what remains, and afterwards surrounds it again with water from above. Having rinsed his mouth, the one who sacrifices to the Self should meditate on the Self with the two verses ‘Prāṇo ’gniḥ’ and ‘Viśvo ’si’: ‘As breath and fire, the Supreme Self abides as the five winds; may he, pleased, please all — he who enjoys all. Thou art all, thou art Vaiśvānara; by thee is upheld all that is born; may all oblations enter thee; creatures live where thou art, the immortal one of all.’ He who eats by this rule does not again become food.'
      ),
      M(
        [
          'अथापरं वेदितव्यमुत्तरो विकारोऽस्यात्मयज्ञस्य यथान्नमन्नादश्चेत्यस्योपव्याख्यानम्।',
          'पुरुषश्चेता प्रधानान्तःस्थः स एव भोक्ता प्राकृतमन्नं भुङ्क्त इति।',
          'तस्यायं भूतात्मा ह्यन्नमस्य कर्ता प्रधानः।',
          'तस्मात्त्रिगुणं भोज्यं भोक्ता पुरुषोऽन्तःस्थः।',
          'अत्र दृष्टं नाम प्रत्ययम्।',
          'यस्माद्बीजसम्भवा हि पशवस्तस्माद्बीजं भोज्यमनेनैव प्रधानस्य भोज्यत्वं व्याख्यातम्।',
          'तस्माद्भोक्ता पुरुषो भोज्या प्रकृतिस्तत्स्थो भुङ्क्त इति।',
          'प्राकृतमन्नं त्रिगुणभेदपरिणामत्वान्महदाद्यं विशेषान्तं लिङ्गम्।',
          'अनेनैव चतुर्दशविधस्य मार्गस्य व्याख्या कृता भवति।',
          'सुखदुःखमोहसंज्ञं ह्यन्नभूतमिदं जगत्।',
          'न हि बीजस्य स्वादुपरिग्रहोऽस्तीति यावन्न प्रसूतिः।',
          'तस्याप्येवं तिसृष्ववस्थास्वन्नत्वं भवति कौमारं यौवनं जरा परिणामत्वात्तदन्नत्वम्।',
          'एवं प्रधानस्य व्यक्ततां गतस्योपलब्धिर्भवति।',
          'तत्र बुद्ध्यादीनि स्वादूनि भवन्त्यध्यवसायसङ्कल्पाभिमाना इति।',
          'अथेन्द्रियार्थान्पञ्च स्वादूनि भवन्ति।',
          'एवं सर्वाणीन्द्रियकर्माणि प्राणकर्माणि।',
          'एवं व्यक्तमन्नमव्यक्तमन्नम्।',
          'अस्य निर्गुणो भोक्ता भोक्तृत्वाच्चैतन्यं प्रसिद्धं तस्य।',
          'यथाग्निर्वै देवानामन्नादः सोमोऽन्नम्।',
          'अग्निनैवान्नमत्तीत्येवंवित्।',
          'सोमसंज्ञोऽयं भूतात्माग्निसंज्ञोऽप्यव्यक्तमुखा इति वचनात्पुरुषो ह्यव्यक्तमुखेन त्रिगुणं भुङ्क्त इति।',
          'यो हैवं वेद संन्यासी योगी चात्मयाजी चेति।',
          'अथ यद्वन्न कश्चिच्छून्यागारे कामिन्यः प्रविष्टाः स्पृशतीन्द्रियार्थांस्तद्वद्यो न स्पृशति प्रविष्टान्संन्यासी योगी चात्मयाजी चेति॥',
        ],
        'अब आगे और जानने योग्य है — इस आत्मयज्ञ का उत्तर विकार, अर्थात् ‘अन्न और अन्न का भोक्ता’ — इसकी व्याख्या। चेतन पुरुष प्रधान (प्रकृति) के भीतर स्थित है; वही भोक्ता है, जो प्रकृति से उत्पन्न अन्न को भोगता है। उसका यह भूतात्मा ही अन्न है, जिसका कर्ता प्रधान है। इसलिए तीन गुणों वाला (जगत्) भोज्य है और भीतर स्थित पुरुष भोक्ता है। इसमें प्रत्यक्ष दृष्टान्त यह है — क्योंकि पशु (प्राणी) बीज से उत्पन्न होते हैं, इसलिए बीज भोज्य है; इसी से प्रधान का भोज्य होना व्याख्यात हुआ। इसलिए पुरुष भोक्ता है और प्रकृति भोज्या है; उसमें स्थित होकर (पुरुष) भोगता है। प्रकृति से उत्पन्न अन्न तीन गुणों के भेद का परिणाम होने से महत् से लेकर विशेष-पर्यन्त लिंग (सूक्ष्म शरीर) है। इसी से चौदह प्रकार के मार्ग की व्याख्या हो जाती है। सुख, दुःख और मोह नाम वाला यह जगत् अन्नरूप ही है। जब तक बीज अंकुरित नहीं होता, तब तक उसके स्वाद का ग्रहण नहीं होता। इसी प्रकार उसका भी तीन अवस्थाओं — बाल्य, यौवन और जरा — में अन्नत्व होता है; परिणामी होने के कारण वह अन्न है। इस प्रकार व्यक्त भाव को प्राप्त प्रधान की उपलब्धि होती है। उसमें बुद्धि आदि — निश्चय, संकल्प और अभिमान — स्वाद (भोग्य) होते हैं। फिर इन्द्रियों के पाँच विषय स्वाद होते हैं। इसी प्रकार इन्द्रियों के सब कर्म और प्राणों के कर्म (भोग्य) हैं। इस प्रकार व्यक्त भी अन्न है और अव्यक्त भी अन्न है। इसका भोक्ता निर्गुण है; भोक्ता होने से उसका चैतन्य सिद्ध है। जैसे अग्नि देवताओं में अन्न खाने वाला है और सोम अन्न है। इस प्रकार जानने वाला अग्नि के द्वारा ही अन्न खाता है। यह भूतात्मा सोम नाम वाला है और अव्यक्त मुख वाला (पुरुष) अग्नि नाम वाला है — इस वचन से पुरुष अव्यक्त मुख से त्रिगुण (जगत्) को भोगता है। जो ऐसा जानता है, वह संन्यासी है, योगी है और आत्मयाजी है। जैसे कोई सूने घर में प्रविष्ट कामिनियों का स्पर्श नहीं करता, वैसे ही जो (भीतर) प्रविष्ट इन्द्रिय-विषयों का स्पर्श नहीं करता, वह संन्यासी, योगी और आत्मयाजी है।',
        'Now further this is to be known — the higher transformation of this sacrifice to the Self, namely the explanation of food and the eater of food. The conscious person dwells within primordial nature (pradhāna); he is the enjoyer, who enjoys the food produced by nature. His food is this elemental self, whose maker is pradhāna. Therefore what has the three guṇas is to be enjoyed, and the enjoyer is the person dwelling within. Here the evidence is what is seen: since animals spring from seed, seed is what is enjoyed; by this the enjoyability of pradhāna is explained. Therefore the person is the enjoyer, nature is the enjoyed; abiding in it he enjoys. The food produced by nature, being the transformation of the distinctions of the three guṇas, is the subtle body, from the Great one down to the particulars. By this the fourteenfold path is explained. This world, called pleasure, pain and delusion, has become food. For there is no apprehension of the taste of a seed as long as it has not sprung forth. So too its being food lies in its three states — childhood, youth and old age; being subject to change, it is food. Thus the perception of pradhāna, when it has become manifest, takes place. There intellect and the rest — determination, conception, self-conceit — become tastes. Then the five objects of the senses become tastes. So too all the actions of the senses and the actions of the breaths. Thus the manifest is food and the unmanifest is food. Its enjoyer is without guṇas; from his being the enjoyer, his consciousness is established. As Agni among the gods is the eater of food, and Soma is the food — he who knows thus eats food by Agni itself. This elemental self is called Soma; he whose mouth is the unmanifest is called Agni — as the saying goes, the person enjoys the three guṇas with the unmanifest as his mouth. He who knows this is a renouncer, a yogin and a sacrificer to the Self. Just as no one touches the women of desire who have entered an empty house, so he who does not touch the objects of sense that enter him is a renouncer, a yogin and a sacrificer to the Self.'
      ),
      M(
        [
          'परं वा एतदात्मनो रूपं यदन्नमन्नमयो ह्ययं प्राणः।',
          'अथ न यद्यश्नात्यमन्ताश्रोतास्पर्शिताद्रष्टावक्ताघ्रातारसयिता भवति प्राणांश्चोत्सृजतीत्येवं ह्याह।',
          'अथ यदि खल्वश्नाति प्राणसमृद्धो भूत्वा मन्ता भवति श्रोता भवति स्पर्शिता भवति वक्ता भवति रसयिता भवति घ्राता भवति द्रष्टा भवतीत्येवं ह्याह।',
          'अन्नाद्वै प्रजाः प्रजायन्ते याः काश्चित्पृथिवीश्रिताः। अतोऽन्नेनैव जीवन्त्यथैतदपियन्त्यन्ततः॥',
        ],
        'यह जो अन्न है, वह आत्मा का परम रूप है, क्योंकि यह प्राण अन्नमय है। यदि (मनुष्य) भोजन न करे तो वह मनन न करने वाला, न सुनने वाला, न स्पर्श करने वाला, न देखने वाला, न बोलने वाला, न सूँघने वाला और न रस लेने वाला हो जाता है और प्राणों को छोड़ देता है — ऐसा कहा गया है। और यदि वह भोजन करता है तो प्राण से समृद्ध होकर मनन करने वाला, सुनने वाला, स्पर्श करने वाला, बोलने वाला, रस लेने वाला, सूँघने वाला और देखने वाला होता है — ऐसा कहा गया है। पृथ्वी पर आश्रित जो कोई भी प्रजाएँ हैं, वे अन्न से ही उत्पन्न होती हैं; फिर अन्न से ही जीवित रहती हैं और अन्त में इसी में लीन हो जाती हैं।',
        'Food, verily, is the highest form of the Self, for this breath consists of food. If one does not eat, he becomes a non-thinker, a non-hearer, a non-toucher, a non-seer, a non-speaker, a non-smeller, a non-taster, and he lets go his breaths — so it is said. But if he eats, then, filled with breath, he becomes a thinker, a hearer, a toucher, a speaker, a taster, a smeller, a seer — so it is said. From food, verily, are creatures born, whatever creatures dwell upon the earth; by food alone they live, and into it they pass at the end.'
      ),
      M(
        [
          'अथान्यत्राप्युक्तं सर्वाणि ह वा इमानि भूतान्यहरहः प्रपतन्त्यन्नमभिप्रजिघृक्षमाणानि।',
          'सूर्यो रश्मिभिराददात्यन्नं तेनासौ तपति।',
          'अन्नेनाभिषिक्ताः पचन्तीमे प्राणा अग्निर्वा अन्नेनोज्ज्वलति।',
          'अन्नकामेनेदं प्रकल्पितं ब्रह्मणा।',
          'अतोऽन्नमात्मेत्युपासीतेत्येवं ह्याह।',
          'अन्नाद्भूतानि जायन्ते जातान्यन्नेन वर्धन्ते। अद्यतेऽत्ति च भूतानि तस्मादन्नं तदुच्यते॥',
        ],
        'अन्यत्र भी कहा गया है — ये सब प्राणी अन्न को ग्रहण करने की इच्छा से प्रतिदिन (उसकी ओर) दौड़ते हैं। सूर्य अपनी रश्मियों से अन्न (रस) को ग्रहण करता है, उसी से वह तपता है। अन्न से सींचे हुए ये प्राण (अन्न को) पचाते हैं; अग्नि भी अन्न से ही प्रज्वलित होता है। अन्न की कामना वाले ब्रह्मा ने इस (जगत्) की रचना की। इसलिए ‘अन्न आत्मा है’ — ऐसी उपासना करनी चाहिए — ऐसा कहा गया है। अन्न से प्राणी उत्पन्न होते हैं, उत्पन्न होकर अन्न से बढ़ते हैं; वह प्राणियों द्वारा खाया जाता है और प्राणियों को खाता है, इसलिए वह ‘अन्न’ कहलाता है।',
        'It has also been said elsewhere: all these beings run forth day after day, eager to seize food. The sun takes up food with its rays, and by that it glows. Sprinkled with food, these breaths digest; fire, verily, blazes up with food. Brahmā, desiring food, fashioned this world. Therefore one should worship food as the Self — so it is said. From food beings are born; born, they grow by food; it is eaten and it eats beings — therefore it is called food (anna).'
      ),
      M(
        [
          'अथान्यत्राप्युक्तं विश्वभृद्वै नामैषा तनूर्भगवतो विष्णोर्यदिदमन्नम्।',
          'प्राणो वा अन्नस्य रसो मनः प्राणस्य विज्ञानं मनस आनन्दं विज्ञानस्य।',
          'अन्नवान्प्राणवान्मनस्वान्विज्ञानवानानन्दवांश्च भवति यो हैवं वेद।',
          'यावन्तीह वै भूतान्यन्नमदन्ति तावत्स्वन्तःस्थोऽन्नमत्ति यो हैवं वेद।',
          'अन्नमेव विजरमन्नं संवननं स्मृतम्। अन्नं पशूनां प्राणोऽन्नं ज्येष्ठमन्नं भिषक्स्मृतम्॥',
        ],
        'अन्यत्र भी कहा गया है — यह जो अन्न है, वह भगवान् विष्णु का ‘विश्वभृत्’ (विश्व का पोषण करने वाला) नामक शरीर है। प्राण अन्न का रस है, मन प्राण का, विज्ञान मन का और आनन्द विज्ञान का (रस) है। जो ऐसा जानता है, वह अन्नवान्, प्राणवान्, मनस्वी, विज्ञानवान् और आनन्दवान् होता है। यहाँ जितने प्राणी अन्न खाते हैं, उन सबके भीतर स्थित होकर वह अन्न खाता है, जो ऐसा जानता है। अन्न ही अजर है, अन्न ही संवनन (प्रेम से जोड़ने वाला) कहा गया है; अन्न पशुओं (प्राणियों) का प्राण है, अन्न ज्येष्ठ है, अन्न को ही औषध कहा गया है।',
        'It has also been said elsewhere: this food is the form of the blessed Viṣṇu called the All-sustainer. Breath is the essence of food, mind of breath, understanding of mind, bliss of understanding. He who knows this comes to possess food, breath, mind, understanding and bliss. As many beings as eat food here, within them all he abides and eats food, he who knows this. Food alone is ageless, food is held to be the bond of love; food is the life of creatures, food is the eldest, food is known as the healer.'
      ),
      M(
        [
          'अथान्यत्राप्युक्तमन्नं वा अस्य सर्वस्य योनिः कालश्चान्नस्य सूर्यो योनिः कालस्य।',
          'तस्यैतद्रूपं यन्निमेषादिकालात्सम्भृतं द्वादशात्मकं वत्सरम्।',
          'एतस्याग्नेयमर्धमर्धं वारुणम्।',
          'मघाद्यं श्रविष्ठार्धमाग्नेयं क्रमेणोत्क्रमेण सार्पाद्यं श्रविष्ठार्धान्तं सौम्यम्।',
          'तत्रैकैकमात्मनो नवांशकं सचारकविधम्।',
          'सौक्ष्म्यत्वादेतत्प्रमाणमनेनैव प्रमीयते हि कालः।',
          'न विना प्रमाणेन प्रमेयस्योपलब्धिः।',
          'प्रमेयोऽपि प्रमाणतां पृथक्त्वादुपैत्यात्मसम्बोधनार्थमित्येवं ह्याह।',
          'यः कालं ब्रह्मेत्युपासीत कालस्तस्यातिदूरमपसरतीत्येवं ह्याह।',
          'कालात्स्रवन्ति भूतानि कालाद्वृद्धिं प्रयान्ति च। काले चास्तं नियच्छन्ति कालो मूर्तिरमूर्तिमान्॥',
        ],
        'अन्यत्र भी कहा गया है — अन्न इस सबका उत्पत्ति-स्थान है, काल अन्न का और सूर्य काल का उत्पत्ति-स्थान है। उस (काल) का यह रूप है — निमेष आदि काल से बना हुआ बारह (मासों) वाला संवत्सर। इसका आधा भाग आग्नेय है और आधा वारुण। मघा से लेकर श्रविष्ठा के आधे भाग तक क्रम से आग्नेय है, और उत्क्रम से आश्लेषा (सार्प) से लेकर श्रविष्ठा के आधे भाग तक सौम्य है। उनमें से प्रत्येक (मास) आत्मा का नवांश है, जो (सूर्य के) संचार के अनुसार है। सूक्ष्म होने के कारण यही प्रमाण है; इसी से काल मापा जाता है। प्रमाण के बिना प्रमेय की उपलब्धि नहीं होती। प्रमेय भी पृथक् होने के कारण आत्मा का बोध कराने के लिए प्रमाण बन जाता है — ऐसा कहा गया है। जो ‘काल ब्रह्म है’ — ऐसी उपासना करता है, काल उससे बहुत दूर हट जाता है — ऐसा कहा गया है। काल से प्राणी उत्पन्न होते हैं, काल से ही वृद्धि को प्राप्त होते हैं और काल में ही अस्त हो जाते हैं; काल मूर्त भी है और अमूर्त भी।',
        'It has also been said elsewhere: food is the source of all this, time is the source of food, and the sun is the source of time. Its form is the year, made up of moments and other units of time, consisting of twelve months. Half of it belongs to Agni, half to Varuṇa. From Maghā to the middle of Śraviṣṭhā, in the forward course, belongs to Agni; in the reverse course, from Āśleṣā to the middle of Śraviṣṭhā, belongs to Soma. There each month of the Self is a ninth part, according to the sun’s course. Because of its subtlety this is the measure, for by this alone time is measured. Without a measure there is no grasping of what is to be measured. But what is to be measured, by its separateness, itself becomes a measure, for the sake of making the Self known — so it is said. He who worships time as Brahman — from him time withdraws far away — so it is said. From time beings flow forth, from time they come to growth, and in time they go to their setting; time is formed and formless.'
      ),
      M(
        [
          'द्वे वाव ब्रह्मणो रूपे कालश्चाकालश्च।',
          'अथ यः प्रागादित्यात्सोऽकालोऽकलोऽथ य आद्यादित्यात्स कालः सकलः।',
          'सकलस्य वा एतद्रूपं यत्संवत्सरः।',
          'संवत्सरात्खल्वेवेमाः प्रजाः प्रजायन्ते संवत्सरेणेह वै जाता विवर्धन्ते संवत्सरे प्रत्यस्तं यन्ति।',
          'तस्मात्संवत्सरो वै प्रजापतिः कालोऽन्नं ब्रह्मनीडमात्मा चेत्येवं ह्याह।',
          'कालः पचति भूतानि सर्वाण्येव महात्मनि। यस्मिंस्तु पच्यते कालो यस्तं वेद स वेदवित्॥',
        ],
        'ब्रह्म के दो ही रूप हैं — काल और अकाल। जो आदित्य से पहले है, वह अकाल है, कलाओं (अवयवों) से रहित है; और जो आदित्य से आरम्भ होता है, वह काल है, कलाओं वाला है। कलाओं वाले (काल) का यह रूप है जो संवत्सर है। संवत्सर से ही ये प्रजाएँ उत्पन्न होती हैं, उत्पन्न होकर संवत्सर से ही बढ़ती हैं और संवत्सर में ही अस्त हो जाती हैं। इसलिए संवत्सर ही प्रजापति है, काल है, अन्न है, ब्रह्म का नीड़ (घर) है और आत्मा है — ऐसा कहा गया है। काल सब भूतों को महान् आत्मा में पकाता है; और जिसमें काल पकता है, उसे जो जानता है, वही वेदवेत्ता है।',
        'There are, verily, two forms of Brahman: time and the timeless. That which is before the sun is the timeless, without parts; that which begins with the sun is time, having parts. The form of that which has parts is the year. From the year, verily, these creatures are born; born, they grow here by the year; in the year they go to their setting. Therefore the year is Prajāpati, is time, is food, is the nest of Brahman, and is the Self — so it is said. Time cooks all beings in the great Self; he who knows that in which time itself is cooked, he is the knower of the Veda.'
      ),
      M(
        [
          'विग्रहवानेष कालः सिन्धुराजः प्रजानाम्।',
          'एष तत्स्थः सविताख्यो यस्मादेवेमे चन्द्रर्क्षग्रहसंवत्सरादयः सूयन्ते।',
          'अथैभ्यः सर्वमिदमत्र वा यत्किञ्चिच्छुभाशुभं दृश्यतेह लोके तदेतेभ्यः।',
          'तस्मादादित्यात्मा ब्रह्म।',
          'अथ कालसंज्ञमादित्यमुपासीतादित्यो ब्रह्मेत्येकेऽथैवं ह्याह।',
          'होता भोक्ता हविर्मन्त्रो यज्ञो विष्णुः प्रजापतिः। सर्वः कश्चित्प्रभुः साक्षी योऽमुष्मिन्भाति मण्डले॥',
        ],
        'यह शरीरधारी (मूर्त) काल प्रजाओं का महासागर (सिन्धुराज) है। इसी में स्थित ‘सविता’ नामक वह (सूर्य) है, जिससे ये चन्द्रमा, नक्षत्र, ग्रह, संवत्सर आदि उत्पन्न होते हैं। और इन्हीं से यह सब है; इस लोक में जो कुछ भी शुभ या अशुभ दिखाई देता है, वह इन्हीं से है। इसलिए ब्रह्म आदित्यस्वरूप है। ‘काल’ नाम वाले आदित्य की उपासना करे — कुछ लोग कहते हैं कि आदित्य ब्रह्म है। और ऐसा कहा गया है — जो उस (सूर्य-)मण्डल में प्रकाशित होता है, वही होता, भोक्ता, हवि, मन्त्र, यज्ञ, विष्णु, प्रजापति है; वही सब कुछ है, वही कोई प्रभु और साक्षी है।',
        'This time, which has a body, is the ocean-king of creatures. Abiding in it is he who is called Savitṛ, from whom are born these — moon, stars, planets, year and the rest. From these comes all this world, and whatever good or evil is seen here in this world comes from them. Therefore Brahman has the sun as its self. One should worship the sun under the name of time; some say the sun is Brahman. And so it is said: the sacrificer, the enjoyer, the oblation, the mantra, the sacrifice, Viṣṇu, Prajāpati — he is all, some lord, the witness, who shines in yonder orb.'
      ),
      M(
        [
          'ब्रह्म ह वा इदमग्र आसीदेकोऽनन्तः प्रागनन्तो दक्षिणतोऽनन्तः प्रतीच्यनन्त उदीच्यनन्त ऊर्ध्वं चावाङ्च सर्वतोऽनन्तः।',
          'न ह्यस्य प्राच्यादिदिशः कल्पन्तेऽथ तिर्यग्वाङ्चोर्ध्वं वा।',
          'अनूह्य एष परमात्मापरिमितोऽजोऽतर्क्योऽचिन्त्य एष आकाशात्मा।',
          'एवैष कृत्स्नक्षय एको जागर्ति।',
          'इतस्माच्चाकाशादेष खल्विदं चेतामात्रं बोधयति।',
          'अनेनैव चेदं ध्यायतेऽस्मिंश्च प्रत्यस्तं याति।',
          'अस्यैतद्भास्वरं रूपं यदमुष्मिन्नादित्ये तपत्यग्नौ चाधूमके यज्ज्योतिश्चित्रतरमुदरस्थोऽथ वा यः पचत्यन्नम्।',
          'इत्येवं ह्याह — यश्चैषोऽग्नौ यश्चायं हृदये यश्चासावादित्ये स एष एक इति।',
          'एकस्य हैकत्वमेति य एवं वेद॥',
        ],
        'आरम्भ में यह (सब) एक अनन्त ब्रह्म ही था — पूर्व में अनन्त, दक्षिण में अनन्त, पश्चिम में अनन्त, उत्तर में अनन्त, ऊपर और नीचे अनन्त, सब ओर अनन्त। उसके लिए पूर्व आदि दिशाओं की कल्पना नहीं होती, न तिरछे, न नीचे, न ऊपर की। यह परमात्मा ऊहा से परे, अपरिमित, अजन्मा, तर्क से अगम्य, अचिन्त्य और आकाशस्वरूप है। सबके क्षय (प्रलय) होने पर यही एक जागता रहता है। इसी आकाश से यह इस चेतनामात्र (जगत्) को जगाता है। इसी के द्वारा यह (जगत्) ध्यान (चिन्तन) किया जाता है और इसी में लीन हो जाता है। इसका प्रकाशमय रूप वह है जो उस आदित्य में तपता है, जो धूमरहित अग्नि में विचित्र ज्योति है, अथवा जो उदर में स्थित होकर अन्न पचाता है। ऐसा कहा गया है — जो यह अग्नि में है, जो यह हृदय में है और जो वह आदित्य में है, वह यह एक ही है। जो ऐसा जानता है, वह उस एक के एकत्व को प्राप्त होता है।',
        'In the beginning, verily, this world was Brahman, the one infinite: infinite to the east, infinite to the south, infinite to the west, infinite to the north, above and below, infinite in every direction. For him the eastern and other quarters do not exist, nor across, nor below, nor above. This Supreme Self is not to be conjectured, unlimited, unborn, beyond reasoning, unthinkable, whose self is space. At the dissolution of all, he alone remains awake. From that space he awakens this world, which is mere thought. By him alone is it thought, and into him it passes away. His is that shining form which glows in yonder sun, the brighter light in smokeless fire, or that which, dwelling in the belly, digests food. For so it is said: he who is in the fire, he who is here in the heart, and he who is yonder in the sun — he is one. He who knows this attains the oneness of the One.'
      ),
      M(
        [
          'तथा तत्प्रयोगकल्पः।',
          'प्राणायामः प्रत्याहारो ध्यानं धारणा तर्कः समाधिः षडङ्ग इत्युच्यते योगः।',
          'अनेन यदा पश्यन्पश्यति रुक्मवर्णं कर्तारमीशं पुरुषं ब्रह्मयोनिम्।',
          'तदा विद्वान्पुण्यपापे विहाय परेऽव्यये सर्वमेकीकरोति।',
          'एवं ह्याह — यथा पर्वतमादीप्तं नाश्रयन्ति मृगद्विजाः। तद्वद्ब्रह्मविदो दोषा नाश्रयन्ति कदाचन॥',
        ],
        'उस (एकत्व) को प्राप्त करने के प्रयोग की विधि यह है — प्राणायाम, प्रत्याहार, ध्यान, धारणा, तर्क और समाधि — यह छः अंगों वाला योग कहलाता है। इसके द्वारा जब द्रष्टा सुवर्ण के समान वर्ण वाले, कर्ता, ईश्वर, पुरुष, ब्रह्मयोनि को देखता है, तब वह विद्वान् पुण्य और पाप को त्याग कर सबको उस परम अव्यय में एक कर देता है। ऐसा कहा गया है — जैसे जलते हुए पर्वत का आश्रय मृग और पक्षी नहीं लेते, वैसे ही ब्रह्मवेत्ता का आश्रय दोष कभी नहीं लेते।',
        'The rule for effecting this is as follows: restraint of breath, withdrawal of the senses, meditation, concentration, contemplative inquiry and absorption — this is called the sixfold yoga. When by this the seer sees the golden-hued maker, the Lord, the Person, the source of Brahman, then the wise one, shaking off good and evil, makes everything one in the supreme Imperishable. For so it is said: as deer and birds do not resort to a burning mountain, so evils never resort to the knowers of Brahman.'
      ),
      M(
        [
          'अथान्यत्राप्युक्तं यदा वै बहिर्विद्वान्मनो नियम्येन्द्रियार्थांश्च प्राणो निवेशयित्वा निःसङ्कल्पस्ततस्तिष्ठेत्।',
          'अप्राणादिह यस्मात्सम्भूतः प्राणसंज्ञको जीवस्तस्मात्प्राणो वै तुर्याख्ये धारयेत्प्राणमित्येवं ह्याह।',
          'अचित्तं चित्तमध्यस्थमचिन्त्यं गुह्यमुत्तमम्। तत्र चित्तं निधायेत तच्च लिङ्गं निराश्रयम्॥',
        ],
        'अन्यत्र भी कहा गया है — जब विद्वान् बाहर (के विषयों) से मन को रोककर और इन्द्रियों के विषयों को प्राण में स्थापित करके संकल्परहित हो जाए, तब (उसी अवस्था में) स्थित रहे। क्योंकि ‘प्राण’ नाम वाला जीव यहाँ अप्राण (प्राणातीत तत्त्व) से उत्पन्न हुआ है, इसलिए प्राण को ही ‘तुर्य’ नामक (अवस्था) में धारण करे — ऐसा कहा गया है। जो चित्तरहित होते हुए भी चित्त के मध्य में स्थित है, अचिन्त्य है, गुह्य और उत्तम है, उसमें चित्त को स्थापित करे; तब यह लिंग (सूक्ष्म शरीर) भी निराश्रय हो जाता है।',
        'It has also been said elsewhere: when the knower has restrained his mind from the outer world, and the breath has settled the objects of sense within, let him then remain free of intentions. Since the living being called breath has arisen here from what is not breath, therefore let the breath hold the breath in the state called the fourth — so it is said. That which is not mind yet stands in the midst of the mind, unthinkable, hidden, supreme — there let one fix the mind; then this subtle body too is left without support.'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। अतः परास्य धारणा।',
          'तालुरसनाग्रनिपीडनाद्वाङ्मनःप्राणनिरोधनाद्ब्रह्म तर्केण पश्यति।',
          'यदात्मनात्मानमणोरणीयांसं द्योतमानं मनःक्षयात्पश्यति तदात्मनात्मानं दृष्ट्वा निरात्मा भवति।',
          'निरात्मकत्वादसंख्योऽयोनिश्चिन्त्यो मोक्षलक्षणमित्येतत्परं रहस्यमिति॥',
        ],
        'अन्यत्र भी कहा गया है — इसके आगे इसकी (योग की) धारणा है। तालु से जिह्वा के अग्रभाग को दबाकर, वाणी, मन और प्राण का निरोध करके साधक तर्क (ऊहापोहयुक्त विवेक) के द्वारा ब्रह्म को देखता है। जब वह मन के क्षय हो जाने पर अपने द्वारा अणु से भी अणुतर, प्रकाशमान आत्मा को देखता है, तब अपने द्वारा आत्मा को देखकर वह निरात्मा (व्यक्तिगत अहंभाव से रहित) हो जाता है। निरात्मक होने के कारण वह असंख्य (गणना से परे), अयोनि (जन्म-कारण से रहित) और चिन्तनीय माना जाता है — यही मोक्ष का लक्षण है; यही परम रहस्य है।',
        'It has also been said elsewhere: beyond this is its fixed concentration (dhāraṇā). By pressing the tip of the tongue against the palate, by restraining speech, mind and breath, one sees Brahman through discernment (tarka). When, through the dissolution of the mind, one sees by oneself the Self, subtler than the subtle and shining, then, having seen the Self by the self, one becomes selfless. Being selfless, one is to be regarded as beyond number, without origin — this is the mark of liberation. This is the supreme secret.'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। ऊर्ध्वगा नाडी सुषुम्णाख्या प्राणसंचारिणी ताल्वन्तर्विच्छिन्ना।',
          'तया प्राणोङ्कारमनोयुक्तयोर्ध्वमुत्क्रमेत्।',
          'ताल्वग्रे जिह्वाग्रं परिवर्त्य चेन्द्रियाण्यसंयोज्य महिमा महिमानं निरीक्षेत।',
          'ततो निरात्मकत्वमेति। निरात्मकत्वान्न सुखदुःखभाग्भवति केवलत्वं लभत इति। एवं ह्याह —',
          'परः पूर्वं प्रतिष्ठाप्य निगृहीतानिलं ततः। तीर्त्वा पारमपारेण पश्चाद्युञ्जीत मूर्धनि॥',
        ],
        'अन्यत्र भी कहा गया है — ऊपर की ओर जाने वाली सुषुम्णा नाम की नाड़ी है, जो प्राण का संचार करने वाली है और तालु के भीतर विभक्त (प्रविष्ट) है। प्राण, ओंकार और मन से युक्त उस नाड़ी के द्वारा साधक ऊपर की ओर उत्क्रमण करे। तालु के अग्रभाग पर जिह्वा के अग्रभाग को मोड़कर और इन्द्रियों को (विषयों से) न जोड़कर, वह (आत्म-) महिमा से महिमा (परब्रह्म) का दर्शन करे। तब वह निरात्मकता को प्राप्त होता है। निरात्मक होने से वह सुख-दुःख का भागी नहीं होता; वह कैवल्य को प्राप्त करता है। ऐसा ही कहा है — ‘पहले (प्राण को) भली-भाँति स्थापित करके, फिर वायु का निग्रह करके, अपार (संसार) को पार करके, तत्पश्चात् मूर्धा में (परम तत्त्व से) युक्त हो।’',
        'It has also been said elsewhere: there is an upward-going channel called Suṣumnā, the conveyor of breath, which pierces the palate. Through it, joined with breath, the syllable Om and the mind, one should go upward. Turning the tip of the tongue back against the palate and binding the senses no longer to their objects, one should, as greatness, behold greatness. Thereupon one attains selflessness. Being selfless, one no longer partakes of pleasure and pain; one attains aloneness (kaivalya). For thus has it been said: “Having first fixed it firmly, then restraining the breath, having crossed over the boundless to the farther shore, let him afterwards unite himself in the head.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। द्वे वाव ब्रह्मणी अभिध्येये शब्दश्चाशब्दश्च। अथ शब्देनैवाशब्दमाविष्क्रियते।',
          'अथ तत्रोमिति शब्देनोर्ध्वमुत्क्रान्तः शब्दे निधनमेत्यशब्दे।',
          'अथाहैषा गतिरेतदमृतमेतत्सायुज्यत्वं निर्वृतत्वं तथा चेति।',
          'अथ यथोर्णनाभिस्तन्तुनोर्ध्वमुत्क्रान्तोऽवकाशं लभतीत्येवं वाव खल्वसावभिध्यातोमित्यनेनोर्ध्वमुत्क्रान्तः स्वातन्त्र्यं लभते।',
          'अन्यथा परे शब्दवादिनः श्रवणाङ्गुष्ठयोगेनान्तर्हृदयाकाशशब्दमाकर्णयन्ति।',
          'सप्तविधेयं तस्योपमा — यथा नद्यः किङ्किणी कांस्यं चक्रं भेकवाकं वृष्टिर्निवाते वदतीति।',
          'तं पृथग्लक्षणमतीत्य परेऽशब्देऽव्यक्ते ब्रह्मण्यस्तं गताः।',
          'तत्र तेऽपृथग्धर्मिणोऽपृथग्विवेक्या यथा सम्पन्ना मधुत्वं नानारसा इति। एवं ह्याह —',
          'द्वे ब्रह्मणी वेदितव्ये शब्दब्रह्म परं च यत्। शब्दब्रह्मणि निष्णातः परं ब्रह्माधिगच्छति॥',
        ],
        'अन्यत्र भी कहा गया है — ध्यान करने योग्य ब्रह्म के दो रूप हैं — शब्द और अशब्द। शब्द के द्वारा ही अशब्द प्रकट होता है। वहाँ ‘ॐ’ इस शब्द के द्वारा ऊपर उत्क्रमण करने वाला शब्द का अन्त होने पर अशब्द में लीन हो जाता है। (ऋषि) कहते हैं — यही गति है, यही अमृत है, यही सायुज्य है और यही परम शान्ति (निर्वृति) है। जैसे मकड़ी तन्तु के सहारे ऊपर चढ़कर खुला आकाश पा लेती है, वैसे ही ध्यान करने वाला ‘ॐ’ के द्वारा ऊपर उत्क्रमण करके स्वतन्त्रता पाता है। इससे भिन्न, दूसरे शब्दवादी (नादोपासक) कानों को अँगूठों से बन्द करके हृदयाकाश के भीतर के शब्द को सुनते हैं। उसकी सात प्रकार की उपमा है — जैसे नदियों का कलकल, किंकिणी (घुँघरू), काँसे का पात्र, चक्र, मेंढकों की टर्र, वर्षा की ध्वनि, और निर्वात स्थान में बोलने की ध्वनि। उस पृथक्-पृथक् लक्षणों वाले (शब्द) को लाँघकर वे परम, अशब्द, अव्यक्त ब्रह्म में अस्त (लीन) हो जाते हैं। वहाँ वे पृथक् धर्मों से रहित और पृथक् विवेक से रहित हो जाते हैं, जैसे नाना रसों वाले (पुष्प-रस) मधु बनकर एक हो जाते हैं। ऐसा ही कहा है — ‘दो ब्रह्म जानने योग्य हैं — शब्दब्रह्म और जो पर (ब्रह्म) है। शब्दब्रह्म में निष्णात पुरुष परब्रह्म को प्राप्त कर लेता है।’',
        'It has also been said elsewhere: there are two Brahmans to be meditated upon — sound and the soundless. The soundless is revealed only by sound. There, going upward by the sound Om, one comes to an end in the soundless when sound ends. And it is said: this is the goal, this is immortality, this is union, and this is peace. As a spider climbing up by its thread reaches open space, so the meditator, climbing upward by Om, attains independence. Others, who teach sound, close their ears with their thumbs and listen to the sound in the space within the heart. It is likened to seven things: rivers, a small bell, a bronze vessel, a wheel, the croaking of frogs, rain, and one speaking in a windless place. Passing beyond this sound of distinct marks, they become merged in the supreme, soundless, unmanifest Brahman. There they are without separate qualities and without separate distinction, as the various juices become one in honey. For thus has it been said: “Two Brahmans are to be known: the Brahman that is sound and that which is supreme. One who is well versed in the Brahman that is sound attains the supreme Brahman.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। यः शब्दस्तदोमित्येतदक्षरम्।',
          'यदस्याग्रं तच्छान्तमशब्दमभयमशोकमानन्दं तृप्तं स्थिरमचलममृतमच्युतं ध्रुवं विष्णुसंज्ञितम्।',
          'सर्वापरत्वाय तदेतावुपासीतेति। एवं ह्याह —',
          'योऽसौ परापरो देव ओङ्कारो नाम नामतः। निःशब्दः शून्यभूतस्तु मूर्ध्नि स्थाने ततोऽभ्यसेत्॥',
        ],
        'अन्यत्र भी कहा गया है — जो शब्द है, वह ‘ॐ’ यह अक्षर है। इसका जो अग्रभाग (परम शिखर) है, वह शान्त, अशब्द, अभय, अशोक, आनन्दमय, तृप्त, स्थिर, अचल, अमृत, अच्युत, ध्रुव और ‘विष्णु’ नाम वाला है। सबसे परे (सर्वोत्कृष्ट) पद की प्राप्ति के लिये इन दोनों (शब्द और अशब्द) की उपासना करे। ऐसा ही कहा है — ‘जो वह पर और अपर देव नाम से ‘ओंकार’ कहलाता है, वह निःशब्द और शून्यवत् होकर मूर्धा-स्थान में है; अतः (वहाँ) उसका अभ्यास करे।’',
        'It has also been said elsewhere: that which is sound is the syllable Om. Its summit is tranquil, soundless, fearless, sorrowless, blissful, satisfied, firm, unmoving, immortal, imperishable, constant, and bears the name of Viṣṇu. For the sake of reaching what is higher than all, one should meditate on these two. For thus has it been said: “The god who is both higher and lower, known by name as Om, soundless and void, is in the head: there one should practise on him.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। धनुः शरीरमोमित्येतच्छरः शिखास्य मनः।',
          'तमोलक्षणं भित्त्वा तमोऽतमाविष्टमागच्छति।',
          'अथाविष्टं भित्त्वालातचक्रमिव स्फुरन्तमादित्यवर्णमूर्जस्वन्तं ब्रह्म तमसः परमपश्यद्यदमुष्मिन्नादित्ये सोमेऽग्नौ विद्युति च विभाति।',
          'अथ खल्वेनं दृष्ट्वामृतत्वं गच्छतीति। एवं ह्याह —',
          'ध्यानमन्तः परे तत्त्वे लक्ष्येषु च निधीयते। अतोऽविशेषविज्ञानं विशेषमुपगच्छति॥',
          'मानसे च विलीने तु यत्सुखं चात्मसाक्षिकम्। तद्ब्रह्म चामृतं शुक्रं सा गतिर्लोक एव सः॥',
        ],
        'अन्यत्र भी कहा गया है — शरीर धनुष है, ‘ॐ’ बाण है, मन उसकी नोक है। तमोरूप लक्ष्य को भेदकर वह उस (स्थिति) में पहुँचता है जो तम से आवृत नहीं है। फिर उस आवरण को भी भेदकर उसने अलातचक्र (घुमाई जाती मशाल के चक्र) के समान स्फुरित होते, सूर्य के वर्ण वाले, ओजस्वी, तम से परे ब्रह्म को देखा, जो उस आदित्य में, चन्द्रमा में, अग्नि में और विद्युत् में प्रकाशित होता है। उसे देखकर मनुष्य अमृतत्व को प्राप्त होता है। ऐसा ही कहा है — ‘ध्यान भीतर परम तत्त्व में और लक्ष्यों में स्थापित किया जाता है; इससे निर्विशेष विज्ञान (भी) विशेषता (स्पष्ट अनुभव) को प्राप्त होता है। मन के विलीन हो जाने पर जो आत्मसाक्षिक (आत्मा ही जिसका साक्षी है ऐसा) सुख होता है, वही ब्रह्म है, वही अमृत है, वही शुक्र (दीप्तिमान्) है; वही गति है और वही लोक है।’',
        'It has also been said elsewhere: the body is the bow, Om is the arrow, the mind is its point. Piercing the target that is darkness, one reaches that which is not enveloped in darkness. Then, piercing that envelope, he saw Brahman, flashing like a whirling firebrand, sun-coloured, full of vigour, beyond darkness — that which shines in yonder sun, in the moon, in fire and in lightning. Having seen him, one goes to immortality. For thus has it been said: “Meditation is directed inwardly on the supreme reality and on the objects; thus undifferentiated knowledge becomes differentiated. When the mind is dissolved, the bliss that has the Self alone as its witness — that is Brahman, the immortal, the bright; that is the goal, that indeed is the world.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। निगृहीतेन्द्रियः सुप्त इव सुविशुद्धधीरिन्द्रियबिलेऽसुप्त इव स्वप्न इव यः पश्यति।',
          'प्रणवाख्यं प्रणेतारं भारूपं विगतनिद्रं विजरं विमृत्युं विशोकं च सोऽपि प्रणवाख्यः प्रणेता भारूपो विगतनिद्रो विजरो विमृत्युर्विशोको भवतीति। एवं ह्याह —',
          'एवं प्राणमथोङ्कारं यस्मात्सर्वमनेकधा। युनक्ति युञ्जते वापि तस्माद्योग इति स्मृतः॥',
          'एकत्वं प्राणमनसोरिन्द्रियाणां तथैव च। सर्वभावपरित्यागो योग इत्यभिधीयते॥',
        ],
        'अन्यत्र भी कहा गया है — जो इन्द्रियों का निग्रह करके, मानो सोया हुआ पर अत्यन्त शुद्ध बुद्धि वाला, इन्द्रियों के विवर (शरीर) में मानो जागता हुआ, मानो स्वप्न में, प्रणव नाम वाले, (सबके) प्रेरक, प्रकाशरूप, निद्रारहित, जरारहित, मृत्युरहित और शोकरहित (परमात्मा) को देखता है, वह भी प्रणव नाम वाला, प्रेरक, प्रकाशरूप, निद्रारहित, जरारहित, मृत्युरहित और शोकरहित हो जाता है। ऐसा ही कहा है — ‘क्योंकि इस प्रकार वह प्राण, ओंकार और इस अनेक रूपों वाले सबको जोड़ता है, अथवा ये (उससे) जुड़ते हैं, इसलिये यह ‘योग’ कहलाता है। प्राण, मन और इन्द्रियों की एकता तथा सब भावों का परित्याग — यही योग कहा जाता है।’',
        'It has also been said elsewhere: he who, with senses restrained, as if asleep yet with a perfectly pure understanding, as if awake within the cavity of the senses, as if in a dream, beholds the one called Praṇava, the leader, of the form of light, free from sleep, old age, death and sorrow — he too becomes the one called Praṇava, the leader, of the form of light, free from sleep, old age, death and sorrow. For thus has it been said: “Because in this way he joins the breath, Om and this manifold universe, or they are joined, therefore it is called yoga. The oneness of breath and mind, and likewise of the senses, and the relinquishing of all conditions of existence — this is called yoga.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। यथा वा अप्सु जालिको जालेन जलचरानुद्धृत्योदरेऽग्नौ जुहोत्येवं वाव खल्वेतान्प्राणानोमित्यनेनोद्धृत्यानामयेऽग्नौ जुहोति।',
          'अतस्तप्तोर्वीव सोऽयम्।',
          'अथ यथा तप्तसर्पिस्तृणकाष्ठसंस्पर्शेनोज्ज्वलतीत्येवं वाव खल्वसावप्राणाख्यः प्राणसंस्पर्शेनोज्ज्वलति।',
          'अथ यदुज्ज्वलत्येतद्ब्रह्मणो रूपं चैतद्विष्णोः परमं पदं चैतद्रुद्रस्य रुद्रत्वमेतत्।',
          'तदपरिमितधा चात्मानं विभज्य पूरयतीमाँल्लोकान्। एवं ह्याह —',
          'वह्नेश्च यद्वत्खलु विस्फुलिङ्गाः सूर्यान्मयूखाश्च तथैव तस्य। प्राणादयो वै पुनरेव तस्मादभ्युच्चरन्तीह यथाक्रमेण॥',
        ],
        'अन्यत्र भी कहा गया है — जैसे मछुआ जाल से जल में रहने वाले जीवों को निकालकर उदर की अग्नि में होम करता (खा जाता) है, वैसे ही (योगी) इन प्राणों को ‘ॐ’ के द्वारा निकालकर निरामय (दोषरहित) अग्नि में होम करता है। अतः वह तपी हुई (धधकती) भूमि के समान (दीप्त) है। जैसे तपा हुआ घी तिनके या काष्ठ के स्पर्श से प्रज्वलित हो उठता है, वैसे ही वह ‘अप्राण’ नामक (परमात्मा) प्राण के स्पर्श से प्रज्वलित होता है। जो प्रज्वलित होता है, वही ब्रह्म का रूप है, वही विष्णु का परम पद है, वही रुद्र का रुद्रत्व है। वह अपने को अपरिमित प्रकार से विभक्त करके इन लोकों को परिपूर्ण करता है। ऐसा ही कहा है — ‘जैसे अग्नि से चिनगारियाँ और सूर्य से किरणें निकलती हैं, वैसे ही उस (आत्मा) से प्राण आदि यहाँ क्रम से बार-बार निकलते हैं।’',
        'It has also been said elsewhere: as a fisherman, drawing out water creatures with a net, offers them in the fire of his stomach, so indeed one draws out these breaths by Om and offers them in the fire that is free from ill. Hence he is like a heated ground. And as heated butter blazes up at the touch of grass or wood, so indeed this one called the Breathless blazes up at the touch of the breaths. That which blazes up is the form of Brahman, the highest step of Viṣṇu, the Rudra-hood of Rudra. Dividing himself in countless ways, he fills these worlds. For thus has it been said: “As sparks from a fire and rays from the sun, so from him the breaths and the rest come forth here again and again in due order.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। ब्रह्मणो वावैतत्तेजः परस्यामृतस्याशरीरस्य यच्छरीरस्यौष्ण्यम्। अस्यैतद्घृतम्।',
          'अथाविः सन्नभसि निहितं वा एतदेकाग्रेणैवमन्तर्हृदयाकाशं विनुदन्ति यत्तस्य ज्योतिरिव सम्पद्यत इति।',
          'अतस्तद्भावमचिरेणैति भूमावयःपिण्डं निहितं यथाचिरेणैति भूमित्वम्।',
          'मृद्वदयःपिण्डं यथाग्न्ययस्कारादयो नाभिभवन्ति प्रणश्यति चित्तं तथाश्रयेण सहेति। एवं ह्याह —',
          'हृद्याकाशमयं कोशमानन्दं परमालयम्। स्वं योगश्च ततोऽस्माकं तेजश्चैवाग्निसूर्ययोः॥',
        ],
        'अन्यत्र भी कहा गया है — शरीर की जो उष्णता है, वह परम, अमृत, अशरीरी ब्रह्म का ही तेज है; यह (शरीर) उसका घृत (ईंधन) है। यह (तेज) प्रकट होकर भी आकाश (हृदयाकाश) में निहित है; एकाग्रता के द्वारा (योगी) हृदयाकाश को इस प्रकार हटा (खोल) देते हैं कि उसकी ज्योति-सी प्रकट हो जाती है। तब वह शीघ्र ही उसके भाव (ब्रह्मभाव) को प्राप्त हो जाता है, जैसे भूमि में गाड़ा हुआ लोहे का पिण्ड शीघ्र ही भूमि (मिट्टी) बन जाता है। जैसे मिट्टी-सा बन गये लोहे के पिण्ड पर अग्नि, लुहार आदि का प्रभाव नहीं पड़ता, वैसे ही चित्त अपने आश्रय (संस्कारों) के सहित नष्ट हो जाता है। ऐसा ही कहा है — ‘हृदयाकाशमय कोश आनन्दरूप परम आलय है; वही हमारा स्व (स्वरूप) है, वही योग है, और वही अग्नि और सूर्य का तेज है।’',
        'It has also been said elsewhere: the warmth of the body is the radiance of the supreme, immortal, bodiless Brahman, and this body is its ghee. Though manifest, it is hidden in the ether; by one-pointedness they so open up the space within the heart that its light, as it were, appears. Then one quickly attains its nature, as a lump of iron buried in the earth quickly becomes earth. As fire, smiths and the like no longer overpower a lump of iron become like clay, so the mind perishes together with its support. For thus has it been said: “The sheath made of the space of the heart is bliss, the supreme abode; it is our own self, it is yoga, and it is the radiance of fire and sun.”'
      ),
      M(
        [
          'अथान्यत्राप्युक्तम्। भूतेन्द्रियार्थानतिक्रम्य ततः प्रव्रज्याज्यं धृतिदण्डं धनुर्गृहीत्वानभिमानमयेन चैवेषुणा तं ब्रह्मद्वारपालं विनिहत्य।',
          'आद्यं सम्मोहमौलिस्तृष्णेर्ष्याकुण्डली तन्द्रीराघवेत्रोऽभिमानाध्यक्षः क्रोधज्यं प्रलोभदण्डं धनुर्गृहीत्वेच्छामयेन चैवेषुणेमानि वै प्राणिनो हन्ति।',
          'तं हत्वोङ्कारप्लवेनान्तर्हृदयाकाशस्य पारं तीर्त्वाविर्भूतेऽन्तराकाशे शनकैरवट इवावटकृद्धातुकामः सम्प्रविशत्येवं ब्रह्मशालां विशेत्।',
          'ततश्चतुर्जालं ब्रह्मकोशं प्रणुदेद्गुर्वागमेनेति।',
          'अतः शुद्धः पूतः शून्यः शान्तोऽप्राणो निरात्मानन्तोऽक्षय्यः स्थिरः शाश्वतोऽजः स्वतन्त्रश्च स्वे महिम्नि तिष्ठति।',
          'अतः स्वे महिम्नि तिष्ठमानं दृष्ट्वावृत्तचक्रमिव सञ्चारचक्रमालोकयतीति। एवं ह्याह —',
          'षड्भिर्मासैस्तु युक्तस्य नित्यमुक्तस्य देहिनः। अनन्तः परमो गुह्यः सम्यग्योगः प्रवर्तते॥',
          'रजस्तमोभ्यां विद्धस्य सुसमिद्धस्य देहिनः। पुत्रदारकुटुम्बेषु सक्तस्य न कदाचन॥',
        ],
        'अन्यत्र भी कहा गया है — भूतों, इन्द्रियों और विषयों का अतिक्रमण करके, फिर संन्यासरूपी प्रत्यंचा और धैर्यरूपी दण्ड वाले धनुष को लेकर, अभिमान-रहितता रूपी बाण से उस ब्रह्मद्वार के द्वारपाल को मारे — जो पहला (बाधक) है, जिसका मुकुट मोह है, कुण्डल तृष्णा और ईर्ष्या हैं, तन्द्रा, मद्य और पाप (रूप) जिसके सहचर हैं, जो अभिमान का अधिपति है और क्रोधरूपी प्रत्यंचा तथा लोभरूपी दण्ड वाले धनुष को लेकर इच्छारूपी बाण से इन प्राणियों को मारता है। उसे मारकर ओंकाररूपी नौका से हृदयाकाश के पार जाकर, भीतर का आकाश प्रकट होने पर, जैसे धातु का इच्छुक खनिक धीरे-धीरे गड्ढे में प्रवेश करता है, वैसे ही (साधक) ब्रह्मशाला में प्रवेश करे। फिर गुरु के उपदेश से चार आवरणों वाले ब्रह्मकोश को दूर हटाये। तब वह शुद्ध, पवित्र, शून्य, शान्त, अप्राण, निरात्मा, अनन्त, अक्षय, स्थिर, शाश्वत, अजन्मा और स्वतन्त्र होकर अपनी महिमा में स्थित होता है। अपनी महिमा में स्थित (आत्मा) को देखकर वह संसार-चक्र को घूमते हुए पहिये के समान देखता है। ऐसा ही कहा है — ‘छह मास तक (योग में) युक्त और सदा (विषयों से) मुक्त देहधारी के लिये अनन्त, परम, गुह्य और सम्यक् योग प्रवृत्त होता है। (किन्तु) रज और तम से बिंधे हुए, (वासनाओं से) प्रज्वलित, पुत्र, स्त्री और कुटुम्ब में आसक्त देहधारी के लिये कभी नहीं।’',
        'It has also been said elsewhere: having passed beyond the elements, the senses and their objects, then taking up the bow whose string is renunciation and whose stave is steadfastness, with the arrow made of freedom from self-conceit one should strike down that first warden of the door of Brahman — he whose crown is delusion, whose earrings are craving and envy, whose companions are sloth, intoxication and sin, the lord of self-conceit, who, taking up the bow whose string is anger and whose stave is greed, slays these creatures with the arrow of desire. Having slain him, crossing by the raft of Om to the other shore of the space within the heart, when the inner space is revealed, one should enter the hall of Brahman slowly, as a miner seeking ore enters a pit. Then, by the teaching of the teacher, one should thrust aside the fourfold sheath of Brahman. Thereafter, pure, cleansed, void, tranquil, breathless, selfless, endless, undecaying, firm, eternal, unborn and independent, he abides in his own greatness. Having seen him abiding in his own greatness, he looks upon the wheel of transmigration as upon a rolling wheel. For thus has it been said: “For the embodied one who has been yoked for six months and is ever free, the infinite, supreme, secret, perfect yoga comes forth. But never for the embodied one pierced by passion and darkness, inflamed, attached to son, wife and family.”'
      ),
      M(
        [
          'इत्युक्त्वान्तर्हृदयः शाकायन्यस्तस्मै नमस्कृत्वानया ब्रह्मविद्यया राजन्ब्रह्मणः पन्थानमारूढाः पुत्राः प्रजापतेरिति।',
          'सन्तोषं द्वन्द्वतितिक्षां शान्तत्वं योगाभ्यासादवाप्नोतीति।',
          'एतद्गुह्यतमं नापुत्राय नाशिष्याय नाशान्ताय कीर्तयेदिति।',
          'अनन्यभक्ताय सर्वगुणसम्पन्नाय दद्यात्॥',
        ],
        'ऐसा कहकर, अन्तर्मुख हृदय वाले शाकायन्य ने उस (राजा) को नमस्कार करके कहा — ‘राजन्! इसी ब्रह्मविद्या के द्वारा प्रजापति के पुत्र (वालखिल्य आदि) ब्रह्म के मार्ग पर आरूढ़ हुए।’ योग के अभ्यास से मनुष्य सन्तोष, द्वन्द्वों की सहनशीलता और शान्ति को प्राप्त करता है। यह अत्यन्त गुह्य (विद्या) पुत्र न हो, शिष्य न हो या शान्त न हो — ऐसे व्यक्ति को न बताये। जो अनन्य भक्त हो और सब गुणों से सम्पन्न हो, उसे ही दे।',
        'Having said this, Śākāyanya, whose heart was turned within, bowed to him and said: “By this knowledge of Brahman, O King, the sons of Prajāpati ascended the path of Brahman.” By the practice of yoga one gains contentment, endurance of the pairs of opposites, and tranquillity. This most secret teaching should not be told to one who is not a son, not a pupil, not of tranquil mind. It should be given to one devoted to nothing else and endowed with every virtue.'
      ),
      M(
        [
          'ॐ शुचौ देशे शुचिः सत्त्वस्थः सदधीयानः सद्वादी सद्ध्यायी सद्याजी स्यात्।',
          'इत्यतः सद्ब्रह्मणि सत्याभिलाषिणि निर्वृत्तोऽन्यस्तत्फलच्छिन्नपाशो निराशः परेष्वात्मवद्विगतभयो निष्कामोऽक्षय्यमपरिमितं सुखमाक्रम्य तिष्ठति।',
          'परमं वै शेवधेरिव परस्योद्धरणं यन्निष्कामत्वम्।',
          'स हि सर्वकाममयः पुरुषोऽध्यवसायसङ्कल्पाभिमानलिङ्गो बद्धः। अतस्तद्विपरीतो मुक्तः।',
          'अत्रैक आहुर्गुणः प्रकृतिभेदवशादध्यवसायात्मबन्धमुपागतोऽध्यवसायस्य दोषक्षयाद्विमोक्ष इति।',
          'मनसा ह्येव पश्यति मनसा शृणोति। कामः सङ्कल्पो विचिकित्सा श्रद्धाश्रद्धा धृतिरधृतिर्ह्रीर्धीर्भीरित्येतत्सर्वं मन एव।',
          'गुणौघैरुह्यमानः कलुषीकृतश्चास्थिरश्चञ्चलो लुप्यमानः सस्पृहो व्यग्रश्चाभिमानित्वं प्रयात इति।',
          'अहं सो ममेदमित्येवं मन्यमानो निबध्नात्यात्मनात्मानं जालेनेव खचरः।',
          'अतः पुरुषोऽध्यवसायसङ्कल्पाभिमानलिङ्गो बद्धः। अतस्तद्विपरीतो मुक्तः।',
          'तस्मान्निरध्यवसायो निःसङ्कल्पो निरभिमानस्तिष्ठेत्। एतन्मोक्षलक्षणम्।',
          'एषात्र ब्रह्मपदवी। एषोऽत्र द्वारविवरः। अनेनास्य तमसः पारं गमिष्यति। अत्र हि सर्वे कामाः समाहिता इति। अत्रोदाहरन्ति —',
          'यदा पञ्चावतिष्ठन्ते ज्ञानानि मनसा सह। बुद्धिश्च न विचेष्टते तामाहुः परमां गतिम्॥',
          'एतदुक्त्वान्तर्हृदयः शाकायन्यस्तस्मै नमस्कृत्वा यथावदुपचारी कृतकृत्यो मरुदुत्तरायणं गतः।',
          'न ह्यत्र कुवर्त्मनास्ति गतिः। एष ब्रह्मपथः। सौरं द्वारं भित्त्वोर्ध्वेन विनिर्गताः। अत्रोदाहरन्ति —',
          'अनन्ता रश्मयस्तस्य दीपवद्यः स्थितो हृदि। सितासिताः कद्रुनीलाः कपिला मृदुलोहिताः॥',
          'ऊर्ध्वमेकः स्थितस्तेषां यो भित्त्वा सूर्यमण्डलम्। ब्रह्मलोकमतिक्रम्य तेन यान्ति परां गतिम्॥',
          'यदस्यान्यद्रश्मिशतमूर्ध्वमेव व्यवस्थितम्। तेन देवनिकायानां स्वधामानि प्रपद्यते॥',
          'ये नैकरूपाश्चाधस्ताद्रश्मयोऽस्य मृदुप्रभाः। इह कर्मोपभोगाय तैः संसरति सोऽवशः॥',
          'तस्मात्सर्गस्वर्गापवर्गहेतुर्भगवानसावादित्य इति॥',
        ],
        'ॐ। पवित्र स्थान में, पवित्र होकर, सत्त्वगुण में स्थित रहकर, सत्य का अध्ययन करने वाला, सत्य बोलने वाला, सत्य का ध्यान करने वाला और सत्य का यजन करने वाला बने। इस प्रकार वह सत्यस्वरूप, सत्य की अभिलाषा करने वाले ब्रह्म में शान्त होकर, अन्य (रूप) होकर, कर्मफलों के पाश को काटकर, आशारहित, दूसरों में अपने समान (भाव रखने वाला), भयरहित और निष्काम होकर अक्षय, अपरिमित सुख को प्राप्त करके स्थित रहता है। जैसे (किसी) परम निधि को निकाल लेना, वैसे ही निष्कामता परम उपलब्धि है। क्योंकि सब कामनाओं से भरा हुआ पुरुष, निश्चय, संकल्प और अभिमान रूपी चिह्नों वाला होने से बद्ध है; अतः उससे विपरीत (पुरुष) मुक्त है। यहाँ कुछ लोग कहते हैं — गुण ही प्रकृति के भेद के कारण निश्चय (अध्यवसाय) के द्वारा आत्मबन्धन को प्राप्त होता है, और निश्चय के दोषों का क्षय होने पर मोक्ष होता है। मन से ही (मनुष्य) देखता है, मन से ही सुनता है। काम, संकल्प, संशय, श्रद्धा, अश्रद्धा, धृति, अधृति, लज्जा, बुद्धि और भय — यह सब मन ही है। गुणों के प्रवाह में बहता हुआ, कलुषित, अस्थिर, चंचल, विचलित, लालसायुक्त और व्यग्र होकर वह अभिमान को प्राप्त होता है। ‘मैं वह हूँ, यह मेरा है’ — ऐसा मानता हुआ वह अपने से अपने को बाँध लेता है, जैसे पक्षी जाल से (बँध जाता है)। अतः निश्चय, संकल्प और अभिमान रूपी चिह्नों वाला पुरुष बद्ध है; उससे विपरीत मुक्त है। इसलिये निश्चय-रहित, संकल्प-रहित और अभिमान-रहित होकर स्थित रहे। यही मोक्ष का लक्षण है। यही यहाँ ब्रह्म की पदवी (मार्ग) है, यही यहाँ द्वार का छिद्र है; इसी से वह इस अन्धकार के पार जायगा; क्योंकि यहीं सब कामनाएँ समाहित (पूर्ण) हैं। इस विषय में यह (श्लोक) उद्धृत करते हैं — ‘जब मन के सहित पाँचों ज्ञानेन्द्रियाँ स्थिर हो जाती हैं और बुद्धि भी चेष्टा नहीं करती, उसे परम गति कहते हैं।’ यह कहकर अन्तर्मुख शाकायन्य को नमस्कार करके, उनकी यथोचित सेवा करके, कृतकृत्य होकर (राजा) बृहद्रथ उत्तरायण-मार्ग से चले गये। क्योंकि यहाँ कुमार्ग से गति नहीं है; यही ब्रह्मपथ है; (ज्ञानी) सूर्य के द्वार को भेदकर ऊपर की ओर निकल जाते हैं। इस विषय में ये (श्लोक) कहते हैं — ‘जो हृदय में दीपक के समान स्थित है, उसकी अनन्त किरणें हैं — श्वेत, कृष्ण, भूरी, नीली, कपिल और हल्की लाल। उनमें से एक (किरण) ऊपर की ओर स्थित है, जो सूर्यमण्डल को भेदकर ब्रह्मलोक को लाँघ जाती है; उसके द्वारा (ज्ञानी) परम गति को जाते हैं। इसकी जो अन्य सौ किरणें ऊपर की ओर ही स्थित हैं, उनके द्वारा (जीव) देवसमूहों के अपने-अपने धामों को प्राप्त होता है। इसकी जो नीचे की ओर अनेक रूपों वाली मन्द प्रभा वाली किरणें हैं, उनके द्वारा वह विवश होकर कर्मफल भोगने के लिये यहाँ संसार में भटकता है।’ इसलिये वह भगवान् आदित्य ही सृष्टि, स्वर्ग और मोक्ष का हेतु है।',
        'Om. In a pure place, being pure, abiding in goodness (sattva), let one study the Real, speak the Real, meditate on the Real, sacrifice to the Real. Thus, in the Real, in Brahman that longs for the Real, he becomes at rest and other; his fetters, the fruits of action, cut off; without expectation, regarding others as himself, fearless, desireless, he attains imperishable, immeasurable bliss and abides in it. Desirelessness is the supreme gain, like the taking out of a supreme treasure. For the person made of all desires, marked by determination, intention and self-conceit, is bound; the opposite of this is free. Here some say: it is a quality (guṇa) that, through the differentiation of nature, comes into bondage to the self through determination, and liberation comes from the destruction of the faults of determination. For it is with the mind that one sees, with the mind that one hears. Desire, intention, doubt, faith, lack of faith, steadfastness, lack of steadfastness, shame, understanding, fear — all this is mind alone. Carried along and defiled by the streams of the qualities, unsteady, fickle, confused, full of longing, distracted, one comes to self-conceit. Thinking “I am he, this is mine,” he binds himself by himself, as a bird with a net. Therefore the person marked by determination, intention and self-conceit is bound; the opposite of this is free. Therefore one should stand free from determination, free from intention, free from self-conceit. This is the mark of liberation. This is the pathway to Brahman here; this is the opening of the door here; by this he will go to the farther shore of this darkness, for here all desires are fulfilled. On this they quote: “When the five organs of knowledge stand still together with the mind, and the intellect does not stir, that they call the highest course.” Having said this, Śākāyanya, whose heart was turned within, was bowed to by him; and the King, having served him duly and having done what was to be done, went by the northern path, for there is no going here by a wrong way. This is the path to Brahman. Bursting through the door of the sun, they have gone out upward. On this they quote: “Endless are the rays of him who dwells like a lamp in the heart — white and black, tawny and blue, brown and pale red. One of them stands upward; piercing the orb of the sun and passing beyond the world of Brahman, by it they go to the highest course. The other hundred rays of his that stand upward — by them one reaches the dwellings of the hosts of gods. The many-formed, faintly shining rays below — by them one wanders here helplessly to experience the fruit of action.” Therefore that blessed sun is the cause of creation, of heaven and of liberation.'
      ),
      M(
        [
          'किमात्मकानि वा एतानीन्द्रियाणि प्रचरन्त्युद्गन्ता वैतेषामिह को नियन्ता वेत्याह।',
          'प्रत्याहात्मात्मकानीत्यात्मा ह्येषामुद्गन्ता नियन्ता वा।',
          'अप्सरसो भानवीयाश्च मरीचयो नाम। अथ पञ्चभी रश्मिभिर्विषयानत्ति।',
          'कतम आत्मेति। योऽयं शुद्धः पूतः शून्यः शान्तादिलक्षणोक्तः स्वकैर्लिङ्गैरुपगृह्यः।',
          'तस्यैतल्लिङ्गमलिङ्गस्याग्नेर्यदौष्ण्यमाविष्टं चापां यः शिवतमो रस इत्येके।',
          'अथ वाक्छ्रोत्रं चक्षुर्मनः प्राण इत्येके। अथ बुद्धिर्धृतिः स्मृतिः प्रज्ञानमित्येके।',
          'अथ ते वा एतस्यैवं यथैवेह बीजस्याङ्कुरा वाथ धूमार्चिर्विस्फुलिङ्गा इवाग्नेश्चेति। अत्रोदाहरन्ति —',
          'वह्नेश्च यद्वत्खलु विस्फुलिङ्गाः सूर्यान्मयूखाश्च तथैव तस्य। प्राणादयो वै पुनरेव तस्मादभ्युच्चरन्तीह यथाक्रमेण॥',
        ],
        '(प्रश्न) — ये इन्द्रियाँ किस स्वरूप वाली होकर विचरती हैं, इनको बाहर निकालने वाला कौन है, अथवा यहाँ इनका नियन्ता कौन है? (उत्तर) — वह कहता है: ये आत्मस्वरूप हैं; आत्मा ही इनको बाहर निकालने वाला अथवा नियन्ता है। (इन्द्रियाँ) अप्सराएँ हैं और (आत्मा की) किरणें ‘मरीचि’ कहलाती हैं; वह पाँच किरणों के द्वारा विषयों का भोग करता है। (प्रश्न) — वह आत्मा कौन-सा है? (उत्तर) — जो यह शुद्ध, पवित्र, शून्य, शान्त आदि लक्षणों से कहा गया है और अपने चिह्नों से ग्रहण किया जाता है। कुछ कहते हैं — उस अलिंग (चिह्नरहित) का यह चिह्न है — जैसे अग्नि में प्रविष्ट उष्णता, और जल का जो अत्यन्त कल्याणकारी रस है। कुछ कहते हैं — वाणी, श्रोत्र, चक्षु, मन और प्राण (उसके चिह्न हैं)। कुछ कहते हैं — बुद्धि, धृति, स्मृति और प्रज्ञान। वस्तुतः ये सब इसी के वैसे ही हैं जैसे यहाँ बीज के अंकुर, अथवा अग्नि के धुआँ, ज्वाला और चिनगारियाँ। इस विषय में उद्धृत करते हैं — ‘जैसे अग्नि से चिनगारियाँ और सूर्य से किरणें, वैसे ही उस (आत्मा) से प्राण आदि यहाँ क्रम से पुनः-पुनः निकलते हैं।’',
        'Of what nature are these senses that go forth, and who here sends them out or restrains them? He answers: they are of the nature of the Self, for the Self sends them out and restrains them. The senses are the Apsarases and the rays of the sun are called Marīci; with five rays he enjoys the objects. Which is the Self? He who is described by the marks “pure, cleansed, void, tranquil” and so on, and is to be apprehended by his own marks. Some say that the mark of him who has no mark is like the heat that pervades fire and the most auspicious essence of the waters. Others say it is speech, hearing, sight, mind and breath. Others say it is understanding, steadfastness, memory and knowledge. But these are to him as sprouts are to a seed here, or as smoke, flame and sparks are to fire. On this they quote: “As sparks from a fire and rays from the sun, so from him the breaths and the rest come forth here again and again in due order.”'
      ),
      M(
        [
          'तस्माद्वा एतस्मिन्नात्मनि सर्वे प्राणाः सर्वे लोकाः सर्वे वेदाः सर्वे देवाः सर्वाणि च भूतान्युच्चरन्ति। तस्योपनिषत्सत्यस्य सत्यमिति।',
          'अथ यथार्द्रैधाग्नेरभ्याहितस्य पृथग्धूमा निश्चरन्त्येवं वा एतस्य महतो भूतस्य निःश्वसितमेतद्यदृग्वेदो यजुर्वेदः सामवेदोऽथर्वाङ्गिरस इतिहासः पुराणं विद्या उपनिषदः श्लोकाः सूत्राण्यनुव्याख्यानानि व्याख्यानान्यस्यैवैतानि विश्वा भूतानि॥',
        ],
        'इसलिये इसी आत्मा में (से) सब प्राण, सब लोक, सब वेद, सब देवता और सब भूत प्रकट होते हैं। उसकी उपनिषद् (रहस्य-नाम) है — ‘सत्य का सत्य’। जैसे गीले ईंधन से प्रज्वलित अग्नि से अलग-अलग धुएँ निकलते हैं, वैसे ही इस महान् भूत (परमात्मा) का यह निःश्वास है — जो ऋग्वेद, यजुर्वेद, सामवेद, अथर्वाङ्गिरस, इतिहास, पुराण, विद्याएँ, उपनिषद्, श्लोक, सूत्र, अनुव्याख्यान और व्याख्यान हैं। ये सारे भूत इसी के हैं।',
        'Therefore from this very Self come forth all breaths, all worlds, all Vedas, all gods and all beings. Its secret name is “the Real of the real.” As from a fire laid with damp fuel clouds of smoke issue forth separately, so indeed from this great Being has been breathed forth what is the Ṛgveda, the Yajurveda, the Sāmaveda, the Atharvāṅgirasa, history, ancient lore, the sciences, the Upaniṣads, verses, aphorisms, explanations and commentaries. All these beings are his alone.'
      ),
      M(
        [
          'पञ्चेष्टको वा एषोऽग्निः संवत्सरः। तस्येमा इष्टका यो वसन्तो ग्रीष्मो वर्षाः शरद्धेमन्तः।',
          'स शिरःपक्षसीपृष्ठपुच्छवानेषोऽग्निः पुरुषविदः। सेयं पृथिवी प्रजापतेः प्रथमा चितिः।',
          'करैर्यजमानमन्तरिक्षमुत्क्षिप्त्वा वायवे प्रायच्छत्। प्राणो वै वायुः। प्राणोऽग्निः।',
          'तस्येमा इष्टका यः प्राणो व्यानोऽपानः समान उदानः। स शिरःपक्षसीपृष्ठपुच्छवानेषोऽग्निः पुरुषविदः।',
          'तदिदमन्तरिक्षं प्रजापतेर्द्वितीया चितिः। करैर्यजमानं दिवमुत्क्षिप्त्वेन्द्राय प्रायच्छत्। असौ वा आदित्य इन्द्रः। सैषोऽग्निः।',
          'तस्येमा इष्टका यदृग्यजुःसामाथर्वाङ्गिरसा इतिहासः पुराणम्। स शिरःपक्षसीपुच्छपृष्ठवानेषोऽग्निः पुरुषविदः।',
          'सैषा द्यौः प्रजापतेस्तृतीया चितिः। करैर्यजमानस्यात्मविदेऽवदानं करोति।',
          'अथात्मविदुत्क्षिप्य ब्रह्मणे प्रायच्छत्। तत्रानन्दी मोदी भवति॥',
        ],
        'यह पाँच ईंटों वाली अग्नि (वेदी) संवत्सर है। उसकी ये ईंटें हैं — वसन्त, ग्रीष्म, वर्षा, शरद् और हेमन्त। यह अग्नि सिर, दो पंख, पीठ और पूँछ वाली है; यह पुरुषवेत्ता (के लिये) है। यह पृथिवी प्रजापति की पहली चिति (परत) है। उसने (अपने) हाथों से यजमान को अन्तरिक्ष में उछालकर वायु को सौंप दिया। प्राण ही वायु है; प्राण अग्नि है। उसकी ये ईंटें हैं — प्राण, व्यान, अपान, समान और उदान। यह अग्नि सिर, पंख, पीठ और पूँछ वाली है; यह पुरुषवेत्ता (के लिये) है। यह अन्तरिक्ष प्रजापति की दूसरी चिति है। उसने हाथों से यजमान को द्युलोक में उछालकर इन्द्र को सौंप दिया। वह आदित्य ही इन्द्र है; वही यह अग्नि है। उसकी ये ईंटें हैं — ऋक्, यजुः, साम, अथर्वाङ्गिरस, इतिहास और पुराण। यह अग्नि सिर, पंख, पूँछ और पीठ वाली है; यह पुरुषवेत्ता (के लिये) है। यह द्युलोक प्रजापति की तीसरी चिति है। (वह) अपने हाथों से यजमान को आत्मवेत्ता के लिये भेंट (अवदान) करता है। फिर आत्मवेत्ता उसे ऊपर उठाकर ब्रह्म को सौंप देता है। वहाँ वह आनन्दमय और प्रमुदित हो जाता है।',
        'This fire-altar of five bricks is the year. Its bricks are these: spring, summer, the rains, autumn and winter. This fire has a head, two wings, a back and a tail; it is for the knower of the Person. This earth is the first layer of Prajāpati. With its hands it tossed the sacrificer up into the mid-region and gave him to the wind. The breath is the wind; the breath is fire. Its bricks are these: the in-breath, the diffused breath, the out-breath, the middle breath and the up-breath. This fire has a head, wings, a back and a tail; it is for the knower of the Person. This mid-region is the second layer of Prajāpati. With its hands it tossed the sacrificer up into the sky and gave him to Indra. Yonder sun is Indra; he is this fire. Its bricks are these: the Ṛc, Yajus, Sāman, Atharvāṅgirasa, history and ancient lore. This fire has a head, wings, a tail and a back; it is for the knower of the Person. This sky is the third layer of Prajāpati. With its hands it makes an offering of the sacrificer to the knower of the Self. Then the knower of the Self, lifting him up, gives him to Brahman. There he becomes blissful and joyful.'
      ),
      M(
        [
          'पृथिवी गार्हपत्योऽन्तरिक्षं दक्षिणाग्निर्द्यौराहवनीयः। तत एव पवमानपावकशुचय आविष्कृतमेतेनास्य यज्ञम्।',
          'यतः पवमानपावकशुचिसङ्घातो हि जाठरः। तस्मादग्निर्यष्टव्यश्चेतव्यः स्तोतव्योऽभिध्यातव्यः।',
          'यजमानो हविर्गृहीत्वा देवताभिध्यानमिच्छति —',
          'हिरण्यवर्णः शकुनो हृद्यादित्ये प्रतिष्ठितः। मद्गुर्हंसस्तेजोवृषः सोऽस्मिन्नग्नौ यजामहे॥',
          'इति चापि मन्त्रार्थं विचिन्वति। तत्सवितुर्वरेण्यं भर्गोऽस्याभिध्येयं यो बुद्ध्यन्तस्थो ध्यायीह मनःशान्तिपदमनुसरत्यात्मन्येव धत्ते। अत्रेमे श्लोका भवन्ति —',
          'यथा निरिन्धनो वह्निः स्वयोनावुपशाम्यति। तथा वृत्तिक्षयाच्चित्तं स्वयोनावुपशाम्यति॥',
          'स्वयोनावुपशान्तस्य मनसः सत्यकामिनः। इन्द्रियार्थविमूढस्यानृताः कर्मवशानुगाः॥',
          'चित्तमेव हि संसारस्तत्प्रयत्नेन शोधयेत्। यच्चित्तस्तन्मयो भवति गुह्यमेतत्सनातनम्॥',
          'चित्तस्य हि प्रसादेन हन्ति कर्म शुभाशुभम्। प्रसन्नात्मात्मनि स्थित्वा सुखमव्ययमश्नुते॥',
          'समासक्तं यदा चित्तं जन्तोर्विषयगोचरे। यद्येवं ब्रह्मणि स्यात्तत्को न मुच्येत बन्धनात्॥',
          'मनो हि द्विविधं प्रोक्तं शुद्धं चाशुद्धमेव च। अशुद्धं कामसम्पर्काच्छुद्धं कामविवर्जितम्॥',
          'लयविक्षेपरहितं मनः कृत्वा सुनिश्चलम्। यदा यात्यमनीभावं तदा तत्परमं पदम्॥',
          'तावदेव निरोद्धव्यं हृदि यावत्क्षयं गतम्। एतज्ज्ञानं च मोक्षं च शेषान्ये ग्रन्थविस्तराः॥',
          'समाधिनिर्धौतमलस्य चेतसो निवेशितस्यात्मनि यत्सुखं भवेत्। न शक्यते वर्णयितुं गिरा तदा स्वयं तदन्तःकरणेन गृह्यते॥',
          'अपामापोऽग्निरग्नौ वा व्योम्नि व्योम न लक्षयेत्। एवमन्तर्गतं यस्य मनः स तु विमुच्यते॥',
          'मन एव मनुष्याणां कारणं बन्धमोक्षयोः। बन्धाय विषयासक्तं मुक्त्यै निर्विषयं स्मृतम्॥',
          'इति। अतोऽनग्निहोत्र्यनग्निचिदज्ञानोऽनभिध्यायिनां ब्रह्मणः पदव्योमानुस्मरणं विरुद्धम्। तस्मादग्निर्यष्टव्यश्चेतव्यः स्तोतव्योऽभिध्यातव्यः॥',
        ],
        'पृथिवी गार्हपत्य अग्नि है, अन्तरिक्ष दक्षिणाग्नि है और द्युलोक आहवनीय है। उन्हीं से पवमान, पावक और शुचि (अग्नि) प्रकट हुए; इनके द्वारा इसका यज्ञ प्रकट किया गया है। क्योंकि जठराग्नि पवमान, पावक और शुचि का संघात (सम्मिलित रूप) है, इसलिये अग्नि का यजन करना चाहिये, उसका चयन करना चाहिये, उसकी स्तुति करनी चाहिये और उसका ध्यान करना चाहिये। यजमान हवि लेकर देवता के ध्यान की इच्छा करता है — ‘सुवर्ण के वर्ण वाला पक्षी, जो हृदय में और आदित्य में प्रतिष्ठित है, जो मद्गु (जलपक्षी), हंस और तेजस्वी वृषभ है — उसका हम इस अग्नि में यजन करते हैं।’ इस प्रकार वह मन्त्र के अर्थ का भी विचार करता है। सविता का वह वरणीय भर्ग (तेज) ध्यान करने योग्य है — जो बुद्धि के भीतर स्थित होकर ध्यान करने वाला यहाँ मन की शान्ति के पद का अनुसरण करता है, वह (उसे) आत्मा में ही धारण करता है। इस विषय में ये श्लोक हैं — ‘जैसे ईंधन-रहित अग्नि अपने कारण में शान्त हो जाती है, वैसे ही वृत्तियों के क्षय से चित्त अपने कारण में शान्त हो जाता है। अपने कारण में शान्त हुए, सत्य की कामना वाले मन के लिये — जो इन्द्रियों के विषयों से मोहित रहता था — कर्मों के वश में चलने वाले (विषय) असत्य हो जाते हैं। चित्त ही संसार है; अतः प्रयत्नपूर्वक उसे शुद्ध करे। जिसका जैसा चित्त होता है, वह वैसा ही हो जाता है — यह सनातन रहस्य है। चित्त की प्रसन्नता (निर्मलता) से (मनुष्य) शुभ-अशुभ कर्मों को नष्ट कर देता है; प्रसन्नचित्त पुरुष आत्मा में स्थित होकर अक्षय सुख भोगता है। प्राणी का चित्त जैसे विषयों में आसक्त रहता है, यदि वैसे ही ब्रह्म में (आसक्त) हो जाय तो कौन बन्धन से न छूटे? मन दो प्रकार का कहा गया है — शुद्ध और अशुद्ध। काम के सम्पर्क से अशुद्ध और काम से रहित होने पर शुद्ध। लय (निद्रा) और विक्षेप से रहित मन को अत्यन्त निश्चल करके जब (साधक) अमनीभाव (मन के अभाव) को प्राप्त होता है, तब वह परम पद है। मन को हृदय में तभी तक रोकना चाहिये जब तक वह क्षय को प्राप्त न हो जाय; यही ज्ञान है और यही मोक्ष है; शेष सब ग्रन्थ-विस्तार है। समाधि से जिसके मल धुल गये हैं और जो आत्मा में निविष्ट है, ऐसे चित्त को जो सुख होता है, वह वाणी से वर्णन नहीं किया जा सकता; तब वह स्वयं अन्तःकरण के द्वारा ही ग्रहण किया जाता है। जैसे जल में जल, अग्नि में अग्नि और आकाश में आकाश (अलग) लक्षित नहीं होता, वैसे ही जिसका मन अन्तर्लीन हो गया है, वह मुक्त हो जाता है। मन ही मनुष्यों के बन्धन और मोक्ष का कारण है; विषयों में आसक्त मन बन्धन के लिये और विषयों से रहित मन मुक्ति के लिये माना गया है।’ अतः जो अग्निहोत्र नहीं करते, अग्नि-चयन नहीं करते, ज्ञान से रहित हैं और ध्यान नहीं करते, उनके लिये ब्रह्म के पद-रूप आकाश का स्मरण विरुद्ध (असम्भव) है। इसलिये अग्नि का यजन, चयन, स्तवन और ध्यान करना चाहिये।',
        'The earth is the householder’s fire, the mid-region the southern fire, the sky the offering fire. From them come forth the Purifying, the Purifier and the Bright; by these his sacrifice is made manifest. Since the fire of digestion is a compound of the Purifying, the Purifier and the Bright, therefore the fire is to be worshipped, built, praised and meditated upon. The sacrificer, taking the oblation, wishes for meditation on the deity: “The golden-hued bird, established in the heart and in the sun, the diver-bird, the swan, the bull of radiance — him we worship in this fire.” Thus too he ponders the meaning of the mantra. That adorable radiance of Savitṛ is to be meditated upon: he who, dwelling within the intellect, meditates here, follows the state of the mind’s peace and places it in the Self alone. On this there are these verses: “As fire without fuel becomes quiet in its own source, so through the ending of its movements the mind becomes quiet in its own source. For the mind that has become quiet in its own source and longs for the Real, once deluded by the objects of sense, the things that follow the sway of action become untrue. The mind alone is transmigration; let one cleanse it with effort. What one’s mind is, that one becomes — this is the eternal secret. By the serenity of the mind one destroys actions good and bad; serene, abiding in the Self, one enjoys undying bliss. If the mind of a creature were as attached to Brahman as it is to the realm of the senses, who would not be freed from bondage? The mind is said to be of two kinds, pure and impure: impure from contact with desire, pure when free from desire. Having made the mind free from sloth and distraction and perfectly still, when one reaches the state of no-mind, that is the highest state. The mind should be restrained in the heart until it comes to an end; this is knowledge and this is liberation; all the rest is mere extension of books. The bliss of a mind whose impurities are washed away by concentration and which has entered the Self cannot be described in words; it is then grasped by the inner organ itself. As water in water, fire in fire, or space in space cannot be distinguished, so he whose mind has gone within is released. The mind alone is the cause of bondage and liberation for men: attached to objects it is for bondage, free from objects it is for liberation.” Therefore for those who do not offer the fire-offering, do not build the fire-altar, are without knowledge and do not meditate, the remembrance of the heavenly abode of Brahman is precluded. Therefore the fire is to be worshipped, built, praised and meditated upon.'
      ),
      M(
        [
          'नमोऽग्नये पृथिवीक्षिते लोकस्मृते लोकमस्मै यजमानाय धेहि।',
          'नमो वायवेऽन्तरिक्षक्षिते लोकस्मृते लोकमस्मै यजमानाय धेहि।',
          'नम आदित्याय दिविक्षिते लोकस्मृते लोकमस्मै यजमानाय धेहि।',
          'नमो ब्रह्मणे सर्वक्षिते सर्वस्मृते सर्वमस्मै यजमानाय धेहि।',
          'हिरण्मयेन पात्रेण सत्यस्यापिहितं मुखम्। तत्त्वं पूषन्नपावृणु सत्यधर्माय विष्णवे॥',
          'योऽसावादित्ये पुरुषः सोऽसावहम्। एष ह वै सत्यधर्मो यदादित्यस्यादित्यत्वम्। तच्छुक्लं पुरुषमलिङ्गम्।',
          'नभसोऽन्तर्गतस्य तेजसोंऽशमात्रमेतद्यदादित्यस्य मध्य इवेत्यक्षिण्यग्नौ च। एतद्ब्रह्मैतदमृतमेतद्भर्गः।',
          'एतत्सत्यधर्मो नभसोऽन्तर्गतस्य तेजसोंऽशमात्रमेतद्यदादित्यस्य मध्येऽमृतं यस्य हि सोमः प्राणा वाप्यङ्कुराः। एतद्ब्रह्मैतदमृतमेतद्भर्गः।',
          'एतत्सत्यधर्मो नभसोऽन्तर्गतस्य तेजसोंऽशमात्रमेतद्यदादित्यस्य मध्ये यजुर्दीप्यति। ओमापो ज्योती रसोऽमृतं ब्रह्म भूर्भुवः स्वरोम्।',
          'अष्टपादं शुचिं हंसं त्रिसूत्रमणुमव्ययम्। द्विधर्मोऽन्धं तैजसेन्धं सर्वं पश्यन्न पश्यति॥',
          'नभसोऽन्तर्गतस्य तेजसोंऽशमात्रमेतद्यदादित्यस्य मध्य उदित्वा मयूखे भवत एतत्सवितुः सत्यधर्म एतद्यजुरेतत्तप एतदग्निरेतद्वायुरेतत्प्राण एतदाप एतच्चन्द्रमा एतच्छुक्रमेतदमृतमेतद्ब्रह्मविषयमेतद्भानुरर्णवः।',
          'तस्मिन्नेव यजमानाः सैन्धव इव विलीयन्ते। एषा वै ब्रह्मैकता। अत्र हि सर्वे कामाः समाहिता इति। अत्रोदाहरन्ति —',
          'अंशुधारय इवाणुवातेरितः संस्फुरत्यसावन्तर्गः सुराणाम्। यो हैवंवित्स सवित्स द्वैतवित्स चैकधामेतः स्यात्तदात्मकश्च॥',
        ],
        'पृथिवी में निवास करने वाले, लोक का स्मरण रखने वाले अग्नि को नमस्कार है; इस यजमान को लोक प्रदान करो। अन्तरिक्ष में निवास करने वाले, लोक का स्मरण रखने वाले वायु को नमस्कार है; इस यजमान को लोक प्रदान करो। द्युलोक में निवास करने वाले, लोक का स्मरण रखने वाले आदित्य को नमस्कार है; इस यजमान को लोक प्रदान करो। सबमें निवास करने वाले, सबका स्मरण रखने वाले ब्रह्म को नमस्कार है; इस यजमान को सब कुछ प्रदान करो। ‘सत्य का मुख सुवर्णमय पात्र से ढका हुआ है; हे पूषन्! सत्यधर्मा विष्णु (मेरे) लिये तुम उसे हटा दो।’ जो वह आदित्य में पुरुष है, वह मैं ही हूँ। यही सत्यधर्म है जो आदित्य का आदित्यत्व है। वह शुक्ल (शुद्ध), पुरुष और लिंग-रहित है। आकाश के भीतर स्थित तेज का यह अंशमात्र है जो मानो आदित्य के मध्य में, नेत्र में और अग्नि में है। यही ब्रह्म है, यही अमृत है, यही भर्ग है। यही सत्यधर्म है — आकाश के भीतर स्थित तेज का यह अंशमात्र है जो आदित्य के मध्य में अमृत है, जिसके अंकुर सोम और प्राण हैं। यही ब्रह्म है, यही अमृत है, यही भर्ग है। यही सत्यधर्म है — आकाश के भीतर स्थित तेज का यह अंशमात्र है जो आदित्य के मध्य में यजुः के रूप में दीप्त होता है। ॐ — जल, ज्योति, रस, अमृत, ब्रह्म, भूः, भुवः, स्वः — ॐ। ‘आठ पैरों वाले, पवित्र, हंसरूप, तीन सूत्रों वाले, अणु और अविनाशी, दो धर्मों (पुण्य-पाप) से अन्धे (लोगों) के लिये (छिपे हुए), तेज से प्रदीप्त (उस आत्मा) को देखने वाला सबको देखता है (अथवा, देखकर भी मूढ़ उसे नहीं देखता)।’ आकाश के भीतर स्थित तेज का यह अंशमात्र है जो आदित्य के मध्य में उदित होकर दो किरणों के रूप में होता है — यही सविता का सत्यधर्म है, यही यजुः है, यही तप है, यही अग्नि है, यही वायु है, यही प्राण है, यही जल है, यही चन्द्रमा है, यही शुक्र है, यही अमृत है, यही ब्रह्म का विषय (धाम) है, यही प्रकाश का समुद्र है। उसी में यजमान नमक की डली के समान विलीन हो जाते हैं। यही ब्रह्म के साथ एकता है; क्योंकि इसी में सब कामनाएँ समाहित हैं। इस विषय में उद्धृत करते हैं — ‘जैसे सूक्ष्म वायु से प्रेरित दीपशिखा (काँपती) है, वैसे ही वह देवताओं के भीतर स्थित (आत्मा) स्फुरित होता है। जो ऐसा जानता है, वह (सच्चा) ज्ञानी है, वह द्वैत को जानने वाला है; वह एक धाम (ब्रह्म) को प्राप्त होगा और तदात्मक हो जायगा।’',
        'Homage to Agni who dwells on earth and remembers the world: grant a world to this sacrificer. Homage to Vāyu who dwells in the mid-region and remembers the world: grant a world to this sacrificer. Homage to Āditya who dwells in the sky and remembers the world: grant a world to this sacrificer. Homage to Brahman who dwells in all and remembers all: grant all to this sacrificer. “The face of the Real is covered with a golden vessel; uncover it, O Pūṣan, for Viṣṇu whose law is truth.” The Person who is in the sun — I am he. This indeed is the law of truth: the sun-hood of the sun. That is the bright, the Person, the markless. It is but a portion of the radiance within the ether which is, as it were, in the middle of the sun, in the eye and in fire. This is Brahman, this is the immortal, this is the radiance (bharga). This is the law of truth: it is but a portion of the radiance within the ether which is the immortal in the middle of the sun, of which Soma and the breaths are the sprouts. This is Brahman, this is the immortal, this is the radiance. This is the law of truth: it is but a portion of the radiance within the ether which shines as the Yajus in the middle of the sun. Om: water, light, essence, the immortal, Brahman, earth, mid-region, heaven — Om. “Eight-footed, pure, the swan, triple-threaded, subtle, imperishable, hidden to those blind through the twofold law, blazing with radiance — he who sees him sees all.” It is but a portion of the radiance within the ether which, rising in the middle of the sun, becomes two rays. This is the law of truth of Savitṛ; this is the Yajus, this is austerity, this is fire, this is wind, this is breath, this is the waters, this is the moon, this is the bright, this is the immortal, this is the realm of Brahman, this is the ocean of light. In it the sacrificers dissolve like a lump of salt. This indeed is oneness with Brahman, for here all desires are fulfilled. On this they quote: “Like a lamp-flame stirred by a gentle breeze, he who dwells within the gods flickers forth. He who knows thus is a knower, a knower of duality; he goes to the one abode and becomes of its nature.”'
      ),
      M(
        [
          'द्वे वाव खल्वेते ब्रह्मज्योतिषो रूपके शान्तमेकं समृद्धं चैकम्।',
          'अथ यच्छान्तं तस्याधारं खं यत्समृद्धमिदमस्यान्नम्।',
          'तस्मान्मन्त्रौषधाज्यामिषपुरोडाशस्थालीपाकादिभिर्यष्टव्यमन्तर्वेद्यामास्ये चावशिष्टैरन्नपानैश्चास्यमाहवनीयमिति मत्वा तेजसः समृद्ध्यै पुण्यलोकविजित्यर्थायामृतत्वाय च। अत्रोदाहरन्ति —',
          'अग्निहोत्रं जुहुयात्स्वर्गकामो यमराज्यमग्निष्टोमेनाभिजयति सोमराज्यमुक्थेन सूर्यराज्यं षोडशिना स्वाराज्यमतिरात्रेण प्राजापत्यमासहस्रसंवत्सरान्तक्रतुनेति।',
          'वर्त्याधारस्नेहयोगाद्यथा दीपस्य संस्थितिः। अन्तर्याण्डोपयोगादिमौ स्थितावात्मशुची तथा॥',
        ],
        'ब्रह्मज्योति के ये दो रूप हैं — एक शान्त और एक समृद्ध। जो शान्त है, उसका आधार आकाश है; जो समृद्ध है, उसका अन्न यह (जगत्) है। इसलिये तेज की समृद्धि के लिये, पुण्यलोकों की विजय के लिये और अमृतत्व के लिये मन्त्र, ओषधि, घृत, आमिष, पुरोडाश, स्थालीपाक आदि से वेदी के भीतर यजन करना चाहिये, और मुख को आहवनीय अग्नि मानकर बचे हुए अन्न-पान से मुख में (आहुति देनी चाहिये)। इस विषय में उद्धृत करते हैं — ‘स्वर्ग की कामना वाला अग्निहोत्र करे। अग्निष्टोम से वह यमराज्य को जीतता है, उक्थ्य से सोमराज्य को, षोडशी से सूर्यराज्य को, अतिरात्र से स्वराज्य को और सहस्र संवत्सर तक चलने वाले क्रतु से प्राजापत्य (लोक) को।’ ‘जैसे बत्ती, आधार (पात्र) और तेल के योग से दीपक की स्थिति होती है, वैसे ही भीतर (शरीर) और ब्रह्माण्ड के उपयोग से ये दोनों — आत्मा और शुचि (सूर्य) — स्थित हैं।’',
        'These are the two forms of the light of Brahman: one tranquil and one abundant. That which is tranquil has space as its support; that which is abundant has this world as its food. Therefore one should sacrifice within the altar with mantras, herbs, ghee, flesh, sacrificial cakes, cooked rice and the like, and, regarding the mouth as the offering fire, into the mouth with the food and drink that remain, for the increase of radiance, for the winning of pure worlds and for immortality. On this they quote: “Let one who desires heaven offer the fire-offering. By the Agniṣṭoma one wins the realm of Yama; by the Uktha the realm of Soma; by the Ṣoḍaśin the realm of the sun; by the Atirātra self-rule; by the rite lasting a thousand years the world of Prajāpati.” “As a lamp endures through the union of wick, vessel and oil, so these two — the Self and the Bright One — endure through the use of the inner body and the cosmic egg.”'
      ),
      M(
        [
          'तस्मादोमित्यनेनैतदुपासीतापरिमितं तेजः। तत्त्रेधाभिहितमग्नावादित्ये प्राणे।',
          'अथैषा नाड्यन्नबह्वेतदग्नौ हुतमादित्यं गमयति। अतो यो रसोऽस्रवत्स उद्गीथं वर्षति।',
          'तेनेमे प्राणाः प्राणेभ्यः प्रजा इति। एवं ह्याह —',
          'यदग्नौ हूयते हविस्तदादित्यं गमयति। तत्सूर्यो रश्मिभिर्वर्षति। तेनान्नं भवति। अन्नाद्भूतानामुत्पत्तिरिति। एवं ह्याह —',
          'अग्नौ प्रास्ताहुतिः सम्यगादित्यमुपतिष्ठते। आदित्याज्जायते वृष्टिर्वृष्टेरन्नं ततः प्रजाः॥',
        ],
        'इसलिये ‘ॐ’ इस (अक्षर) के द्वारा इस अपरिमित तेज की उपासना करे। वह तीन प्रकार से कहा गया है — अग्नि में, आदित्य में और प्राण में। यह नाड़ी अन्न की बहुलता वाली है; यह अग्नि में होमी गयी (आहुति) को आदित्य तक पहुँचाती है। उससे जो रस बहता है, वह उद्गीथ (के रूप में) बरसता है। उससे ये प्राण (उत्पन्न होते हैं) और प्राणों से प्रजा। ऐसा ही कहा है — ‘जो हवि अग्नि में होमी जाती है, उसे वह आदित्य तक पहुँचाती है; उसे सूर्य किरणों से बरसाता है; उससे अन्न होता है; अन्न से प्राणियों की उत्पत्ति होती है।’ ऐसा ही कहा है — ‘अग्नि में विधिपूर्वक डाली हुई आहुति आदित्य को प्राप्त होती है; आदित्य से वर्षा होती है, वर्षा से अन्न और अन्न से प्रजा।’',
        'Therefore one should meditate on this immeasurable radiance with Om. It is declared to be threefold: in fire, in the sun and in the breath. This channel is abundant in food; it carries what is offered in the fire to the sun. The juice that flows from it rains down as the Udgītha. By it these breaths exist, and from the breaths creatures. For thus has it been said: “The oblation offered in the fire it carries to the sun; the sun rains it down with its rays; thereby food comes to be; from food is the birth of beings.” For thus has it been said: “The oblation duly cast into the fire reaches the sun; from the sun comes rain, from rain food, and from that creatures.”'
      ),
      M(
        [
          'अग्निहोत्रं जुह्वानो लोभजालं भिनत्ति। अतः सम्मोहं छित्त्वा न क्रोधं स्तुन्वानः कामभिध्यायमानस्ततश्चतुर्जालं ब्रह्मकोशं भिन्दन्नतः परमाकाशम्।',
          'अत्र हि सौरसौम्याग्नेयसात्त्विकानि मण्डलानि भित्त्वा ततः शुद्धः सत्त्वान्तरस्थमचलममृतमच्युतं ध्रुवं विष्णुसंज्ञितं सर्वापरं धाम सत्यकामसर्वज्ञत्वसंयुक्तं स्वतन्त्रं चैतन्यं स्वे महिम्नि तिष्ठमानं पश्यति। अत्रोदाहरन्ति —',
          'रविमध्ये स्थितः सोमः सोममध्ये हुताशनः। तेजोमध्ये स्थितं सत्त्वं सत्त्वमध्ये स्थितोऽच्युतः॥',
          'शरीरप्रादेशाङ्गुष्ठमात्रमणोरप्यण्व्यं ध्यात्वातः परमतां गच्छति। अत्र हि सर्वे कामाः समाहिता इति। अत्रोदाहरन्ति —',
          'अङ्गुष्ठप्रादेशशरीरमात्रं प्रदीपप्रतापवद्द्वित्रिधा हि। तद्ब्रह्माभिष्टूयमानं महो देवो भुवनान्याविवेश॥',
          'ॐ नमो ब्रह्मणे नमः॥',
        ],
        'अग्निहोत्र करने वाला लोभ के जाल को तोड़ देता है। फिर मोह को काटकर, क्रोध की प्रशंसा न करता हुआ, (केवल आत्म-) काम का ध्यान करता हुआ, चार जालों वाले ब्रह्मकोश को भेदकर, वह उसके पश्चात् परम आकाश को (प्राप्त होता है)। यहीं सूर्य, चन्द्र, अग्नि और सत्त्व के मण्डलों को भेदकर, तब शुद्ध होकर वह सत्त्व के भीतर स्थित, अचल, अमृत, अच्युत, ध्रुव, विष्णु नाम वाले, सबसे परे धाम को — जो सत्यकामत्व और सर्वज्ञता से युक्त, स्वतन्त्र चैतन्य है और अपनी महिमा में स्थित है — देखता है। इस विषय में उद्धृत करते हैं — ‘सूर्य के मध्य में सोम स्थित है, सोम के मध्य में अग्नि; तेज के मध्य में सत्त्व स्थित है और सत्त्व के मध्य में अच्युत स्थित है।’ शरीर में प्रादेश (बित्ता) या अँगूठे के परिमाण वाले, अणु से भी अणुतर (आत्मा) का ध्यान करके (साधक) परमता (परम भाव) को प्राप्त होता है; क्योंकि इसी में सब कामनाएँ समाहित हैं। इस विषय में उद्धृत करते हैं — ‘अँगूठे या प्रादेश के बराबर शरीर वाला, दीपक के प्रकाश के समान दो-तीन प्रकार से (प्रकाशित) वह ब्रह्म, स्तुति किया जाता हुआ महान् देव, सब भुवनों में प्रविष्ट हुआ है।’ ॐ। ब्रह्म को नमस्कार है, नमस्कार है।',
        'He who offers the fire-offering breaks through the net of greed. Then, cutting through delusion, not praising anger, meditating on desire, he breaks through the fourfold sheath of Brahman and reaches thereafter the supreme space. For here, breaking through the orbs of the sun, the moon, fire and goodness, then purified, he beholds the one who abides within goodness — unmoving, immortal, imperishable, constant, bearing the name of Viṣṇu, the abode higher than all, endowed with true desire and omniscience, independent consciousness abiding in its own greatness. On this they quote: “In the midst of the sun stands the moon; in the midst of the moon, fire; in the midst of radiance stands goodness; in the midst of goodness stands the Imperishable.” Having meditated on him who is the measure of a span or a thumb in the body, subtler than the subtle, one attains the supreme state, for here all desires are fulfilled. On this they quote: “Of the measure of a thumb or a span in the body, shining twofold or threefold like the brightness of a lamp — that Brahman, the great god being praised, has entered into all the worlds.” Om. Homage to Brahman, homage.'
      ),
    ],
    // ── Prapāṭhaka 7 ──
    [
      M(
        [
          'अग्निर्गायत्रं त्रिवृद्रथन्तरं वसन्तः प्राणो नक्षत्राणि वसवः पुरस्तादुद्यन्ति तपन्ति वर्षन्ति स्तुवन्ति पुनर्विशन्त्यन्तर्विवरेणेक्षन्ति।',
          'अचिन्त्योऽमूर्तो गभीरो गुप्तोऽनवद्यो घनो गहनो निर्गुणः शुद्धो भास्वरो गुणभुग्भयोऽनिर्वृत्तिर्योगीश्वरः सर्वज्ञो मघोऽप्रमेयोऽनाद्यन्तः श्रीमानजो धीमाननिर्देश्यः सर्वसृक्सर्वस्यात्मा सर्वभुक्सर्वस्येशानः सर्वस्यान्तरान्तरः॥',
        ],
        'अग्नि, गायत्री छन्द, त्रिवृत् स्तोम, रथन्तर साम, वसन्त ऋतु, प्राण, नक्षत्र और वसुगण — ये पूर्व दिशा में उदित होते हैं, तपते हैं, बरसते हैं, स्तुति करते हैं, फिर (उसी में) प्रवेश करते हैं और भीतर के विवर से (उसे) देखते हैं। वह (आत्मा) अचिन्त्य, अमूर्त, गम्भीर, गुप्त, निर्दोष, घन (ठोस), गहन, निर्गुण, शुद्ध, प्रकाशमान, गुणों का भोक्ता, भयंकर, अनिर्वृत्ति (कभी निवृत्त न होने वाला), योगीश्वर, सर्वज्ञ, मघ (दाता), अप्रमेय, आदि-अन्त-रहित, श्रीमान्, अजन्मा, बुद्धिमान्, अनिर्देश्य, सबका स्रष्टा, सबका आत्मा, सबका भोक्ता, सबका ईश्वर और सबके भीतर का भी भीतरी है।',
        'Agni, the Gāyatrī metre, the ninefold chant, the Rathantara sāman, spring, the in-breath, the constellations and the Vasus rise in the east; they give heat, they give rain, they praise, they enter again, and they look out through the opening within. He is unthinkable, formless, deep, hidden, blameless, compact, unfathomable, without qualities, pure, shining, the enjoyer of the qualities, awesome, never ceasing, the lord of yogis, all-knowing, bountiful, immeasurable, without beginning or end, glorious, unborn, wise, indescribable, the creator of all, the Self of all, the enjoyer of all, the ruler of all, the innermost of the inner of all.'
      ),
      M(
        [
          'इन्द्रस्त्रिष्टुप्पञ्चदशो बृहद्ग्रीष्मो व्यानः सोमो रुद्रा दक्षिणत उद्यन्ति तपन्ति वर्षन्ति स्तुवन्ति पुनर्विशन्त्यन्तर्विवरेणेक्षन्ति।',
          'अनाद्यन्तोऽपरिमितोऽपरिच्छिन्नोऽपरप्रयोज्यः स्वतन्त्रोऽलिङ्गोऽमूर्तोऽनन्तशक्तिर्धाता भास्करः॥',
        ],
        'इन्द्र, त्रिष्टुप् छन्द, पञ्चदश स्तोम, बृहत् साम, ग्रीष्म ऋतु, व्यान, सोम और रुद्रगण — ये दक्षिण दिशा में उदित होते हैं, तपते हैं, बरसते हैं, स्तुति करते हैं, फिर प्रवेश करते हैं और भीतर के विवर से देखते हैं। वह (आत्मा) आदि-अन्त-रहित, अपरिमित, अपरिच्छिन्न (सीमारहित), दूसरे के द्वारा प्रेरित न होने वाला, स्वतन्त्र, चिह्नरहित, अमूर्त, अनन्त शक्ति वाला, धाता (धारण करने वाला) और प्रकाशक है।',
        'Indra, the Triṣṭubh metre, the fifteenfold chant, the Bṛhat sāman, summer, the diffused breath, Soma and the Rudras rise in the south; they give heat, they give rain, they praise, they enter again, and they look out through the opening within. He is without beginning or end, immeasurable, unbounded, not moved by another, independent, markless, formless, of infinite power, the upholder, the maker of light.'
      ),
      M(
        [
          'मरुतो जगती सप्तदशो वैरूपं वर्षा अपानः शुक्र आदित्याः पश्चादुद्यन्ति तपन्ति वर्षन्ति स्तुवन्ति पुनर्विशन्त्यन्तर्विवरेणेक्षन्ति।',
          'तच्छान्तमशब्दमभयमशोकमानन्दं तृप्तं स्थिरमचलममृतमच्युतं ध्रुवं विष्णुसंज्ञितं सर्वापरं धाम॥',
        ],
        'मरुद्गण, जगती छन्द, सप्तदश स्तोम, वैरूप साम, वर्षा ऋतु, अपान, शुक्र (ग्रह) और आदित्यगण — ये पश्चिम दिशा में उदित होते हैं, तपते हैं, बरसते हैं, स्तुति करते हैं, फिर प्रवेश करते हैं और भीतर के विवर से देखते हैं। वह शान्त, अशब्द, अभय, अशोक, आनन्दमय, तृप्त, स्थिर, अचल, अमृत, अच्युत, ध्रुव, विष्णु नाम वाला, सबसे परे धाम है।',
        'The Maruts, the Jagatī metre, the seventeenfold chant, the Vairūpa sāman, the rains, the out-breath, Śukra and the Ādityas rise in the west; they give heat, they give rain, they praise, they enter again, and they look out through the opening within. That is tranquil, soundless, fearless, sorrowless, blissful, satisfied, firm, unmoving, immortal, imperishable, constant, bearing the name of Viṣṇu, the abode higher than all.'
      ),
      M(
        [
          'विश्वेदेवा अनुष्टुबेकविंशो वैराजः शरत्समानो वरुणः साध्या उत्तरत उद्यन्ति तपन्ति वर्षन्ति स्तुवन्ति पुनर्विशन्त्यन्तर्विवरेणेक्षन्ति।',
          'अन्तःशुद्धः पूतः शून्यः शान्तोऽप्राणो निरात्मानन्तः॥',
        ],
        'विश्वेदेव, अनुष्टुप् छन्द, एकविंश स्तोम, वैराज साम, शरद् ऋतु, समान, वरुण और साध्यगण — ये उत्तर दिशा में उदित होते हैं, तपते हैं, बरसते हैं, स्तुति करते हैं, फिर प्रवेश करते हैं और भीतर के विवर से देखते हैं। वह भीतर से शुद्ध, पवित्र, शून्य, शान्त, प्राणरहित, निरात्मा और अनन्त है।',
        'The All-gods, the Anuṣṭubh metre, the twenty-onefold chant, the Vairāja sāman, autumn, the middle breath, Varuṇa and the Sādhyas rise in the north; they give heat, they give rain, they praise, they enter again, and they look out through the opening within. He is pure within, cleansed, void, tranquil, breathless, selfless, endless.'
      ),
      M(
        [
          'मित्रावरुणौ पङ्क्तिस्त्रिणवत्रयस्त्रिंशौ शाक्वररैवते हेमन्तशिशिरावुदानोऽङ्गिरसश्चन्द्रमा ऊर्ध्वा उद्यन्ति तपन्ति वर्षन्ति स्तुवन्ति पुनर्विशन्त्यन्तर्विवरेणेक्षन्ति।',
          'प्रणवाख्यं प्रणेतारं भारूपं विगतनिद्रं विजरं विमृत्युं विशोकम्॥',
        ],
        'मित्र और वरुण, पंक्ति छन्द, त्रिणव और त्रयस्त्रिंश स्तोम, शाक्वर और रैवत साम, हेमन्त और शिशिर ऋतुएँ, उदान, अंगिरस और चन्द्रमा — ये ऊपर की दिशा में उदित होते हैं, तपते हैं, बरसते हैं, स्तुति करते हैं, फिर प्रवेश करते हैं और भीतर के विवर से (उसे) देखते हैं — जो प्रणव नाम वाला, प्रेरक, प्रकाशरूप, निद्रारहित, जरारहित, मृत्युरहित और शोकरहित है।',
        'Mitra and Varuṇa, the Paṅkti metre, the twenty-sevenfold and thirty-threefold chants, the Śākvara and Raivata sāmans, winter and the cool season, the up-breath, the Aṅgirases and the moon rise above; they give heat, they give rain, they praise, they enter again, and they look out through the opening within upon him who is called Praṇava, the leader, of the form of light, free from sleep, old age, death and sorrow.'
      ),
      M(
        [
          'शनिराहुकेतूरगरक्षोयक्षनरविहगशरभेभादयोऽधस्तादुद्यन्ति तपन्ति वर्षन्ति स्तुवन्ति पुनर्विशन्त्यन्तर्विवरेणेक्षन्ति।',
          'यः प्राज्ञो विधरणः सर्वान्तरोऽक्षरः शुद्धः पूतो भान्तः क्षान्तः शान्तः॥',
        ],
        'शनि, राहु, केतु, सर्प, राक्षस, यक्ष, मनुष्य, पक्षी, शरभ, हाथी आदि — ये नीचे की दिशा में उदित होते हैं, तपते हैं, बरसते हैं, स्तुति करते हैं, फिर प्रवेश करते हैं और भीतर के विवर से (उसे) देखते हैं — जो प्राज्ञ, (सबको) धारण करने वाला, सबके भीतर रहने वाला, अक्षर, शुद्ध, पवित्र, प्रकाशमान, क्षमाशील और शान्त है।',
        'Saturn, Rāhu, Ketu, serpents, demons, Yakṣas, men, birds, Śarabhas, elephants and the rest rise below; they give heat, they give rain, they praise, they enter again, and they look out through the opening within upon him who is wise, the upholder, the innermost of all, imperishable, pure, cleansed, shining, forbearing, tranquil.'
      ),
      M(
        [
          'एष हि खल्वात्मान्तर्हृदयेऽणीयानिद्धोऽग्निरिव विश्वरूपः। अस्यैवान्नमिदं सर्वमस्मिन्नोता इमाः प्रजाः।',
          'एष आत्मापहतपाप्मा विजरो विमृत्युर्विशोकोऽविचिकित्सोऽविपाशः सत्यसङ्कल्पः सत्यकामः।',
          'एष परमेश्वर एष भूताधिपतिरेष भूतपाल एष सेतुर्विधरणः।',
          'एष हि खल्वात्मेशानः शम्भुर्भवो रुद्रः प्रजापतिर्विश्वसृग्घिरण्यगर्भः सत्यं प्राणो हंसः शास्ता विष्णुर्नारायणोऽर्कः सविता धाता विधाता सम्राडिन्द्र इन्दुरिति।',
          'य एष तपत्यग्निरिवाग्निना पिहितः सहस्राक्षेण हिरण्मयेनाण्डेन। एष वा जिज्ञासितव्योऽन्वेष्टव्यः।',
          'सर्वभूतेभ्योऽभयं दत्त्वारण्यं गत्वाथ बहिः कृत्वेन्द्रियार्थान्स्वाच्छरीरादुपलभेतैनमिति।',
          'विश्वरूपं हरिणं जातवेदसं परायणं ज्योतिरेकं तपन्तम्। सहस्ररश्मिः शतधा वर्तमानः प्राणः प्रजानामुदयत्येष सूर्यः॥',
        ],
        'यही आत्मा हृदय के भीतर है — अत्यन्त सूक्ष्म, प्रज्वलित अग्नि के समान, विश्वरूप। यह सब इसी का अन्न है; इसी में ये सारी प्रजाएँ ओत-प्रोत हैं। यह आत्मा पापरहित, जरारहित, मृत्युरहित, शोकरहित, संशयरहित, बन्धनरहित, सत्यसंकल्प और सत्यकाम है। यह परमेश्वर है, यह भूतों का अधिपति है, यह भूतों का पालक है, यह (लोकों को) धारण करने वाला सेतु है। यही आत्मा ईशान, शम्भु, भव, रुद्र, प्रजापति, विश्वस्रष्टा, हिरण्यगर्भ, सत्य, प्राण, हंस, शास्ता, विष्णु, नारायण, अर्क, सविता, धाता, विधाता, सम्राट्, इन्द्र और इन्दु (चन्द्र) है। वही यह है जो अग्नि के समान तपता है, (और) सहस्र नेत्रों वाले सुवर्णमय अण्ड से — जैसे अग्नि से अग्नि — ढका हुआ है। इसी की जिज्ञासा करनी चाहिये, इसी को खोजना चाहिये। सब प्राणियों को अभय देकर, वन में जाकर, फिर इन्द्रियों के विषयों को बाहर करके अपने शरीर से ही इसे प्राप्त करे। ‘विश्वरूप, हरिण (स्वर्णिम), जातवेदा, परम आश्रय, एकमात्र ज्योति, तपने वाले (उसे जानो)। सहस्र किरणों वाला, सैकड़ों प्रकार से विद्यमान, प्रजाओं का प्राण — यह सूर्य उदित होता है।’',
        'This indeed is the Self within the heart, subtler than the subtle, kindled like a fire, of every form. All this is his food; in him these creatures are woven. This Self is free from evil, free from old age, death and sorrow, free from doubt, free from fetters, of true resolve, of true desire. He is the supreme Lord, the sovereign of beings, the protector of beings, the bridge that holds things apart. This Self indeed is Īśāna, Śambhu, Bhava, Rudra, Prajāpati, the creator of all, Hiraṇyagarbha, truth, breath, the swan, the ruler, Viṣṇu, Nārāyaṇa, Arka, Savitṛ, the upholder, the disposer, the sovereign, Indra, Indu. He it is who glows like fire, covered as fire by fire by the thousand-eyed golden egg. He is to be sought to be known, he is to be searched out. Having given freedom from fear to all beings, having gone to the forest, then having put the objects of sense outside, one should find him from within one’s own body. “The one of every form, golden, all-knowing, the final goal, the one light that gives heat; with a thousand rays, existing in a hundred ways, the life of creatures — this sun rises.”'
      ),
      M(
        [
          'अथ पुनरात्मनो ज्ञानोपसर्गा राजन्। मोहजालस्यैष वै योनिर्यदस्वर्ग्यैः सह स्वर्ग्यस्य वासः। आरामे पुरस्तादुक्तेऽप्यधस्तात्क्षुपे संसज्जन्ते।',
          'अथ ये चान्ये ह नित्यप्रमुदिता नित्यप्रवासिता नित्ययाचनका नित्यं शिल्पोपजीविनः।',
          'ये चान्ये ह पुरयाचका अयाज्ययाजकाः शूद्रशिष्याः शूद्राश्च शास्त्रविद्वांसः।',
          'ये चान्ये ह चाटजटनटभटप्रव्रजितरङ्गावतारिणो राजकर्मणि पतितादयः।',
          'ये चान्ये ह यक्षराक्षसभूतगणपिशाचोरगग्रहादीनामर्थं पुरस्कृत्य शमयाम इत्येवं ब्रुवाणाः।',
          'ये चान्ये ह वृथा कषायकुण्डलिनः कापालिनः।',
          'ये चान्ये ह वृथा तर्कदृष्टान्तकुहकेन्द्रजालैर्वैदिकेषु परिस्थातुमिच्छन्ति तैः सह न संवसेत्।',
          'प्रकाशभूता वै ते तस्करा अस्वर्ग्या इति। एवं ह्याह —',
          'नैरात्म्यवादकुहकैर्मिथ्यादृष्टान्तहेतुभिः। भ्राम्यँल्लोको न जानाति वेदविद्यान्तरं तु यत्॥',
        ],
        'हे राजन्! अब फिर आत्मज्ञान के उपसर्ग (विघ्न) बताये जाते हैं। मोह-जाल का यही कारण है कि स्वर्ग के योग्य (पुरुष) का स्वर्ग के अयोग्य लोगों के साथ निवास हो। (स्वर्गरूपी) उद्यान सामने बताये जाने पर भी वे नीचे की झाड़ी में उलझ जाते हैं। और जो दूसरे लोग सदा आमोद-प्रमोद में रहने वाले, सदा परदेश में रहने वाले, सदा माँगने वाले और सदा शिल्प से जीविका चलाने वाले हैं; जो दूसरे नगर में भिक्षा माँगने वाले, यज्ञ के अनधिकारियों का यज्ञ कराने वाले, शूद्रों के शिष्य, और शास्त्रज्ञ बने हुए शूद्र हैं; जो दूसरे धूर्त, जटाधारी, नट, भाड़े के सैनिक, (दम्भी) संन्यासी, रंगमंच पर उतरने वाले, राजसेवा से पतित आदि हैं; जो दूसरे यक्ष, राक्षस, भूतगण, पिशाच, सर्प, ग्रह आदि के निमित्त (धन) लेकर ‘हम शान्त कर देंगे’ ऐसा कहते हैं; जो दूसरे व्यर्थ ही गेरुआ वस्त्र और कुण्डल धारण करने वाले और कपाल धारण करने वाले हैं; और जो दूसरे व्यर्थ के तर्क, दृष्टान्त, छल और इन्द्रजाल के द्वारा वैदिकों के बीच प्रतिष्ठित होना चाहते हैं — उनके साथ न रहे। वे प्रकट चोर हैं और स्वर्ग के योग्य नहीं हैं। ऐसा ही कहा है — ‘अनात्मवाद के छल, मिथ्या दृष्टान्तों और हेतुओं से भ्रमित होता हुआ संसार यह नहीं जानता कि वेदविद्या और (अन्य) विद्या में क्या अन्तर है।’',
        'Now, O King, once more, the hindrances to the knowledge of the Self. This is the source of the net of delusion: that one fit for heaven dwells with those unfit for heaven. Though the garden is spoken of before them, they cling to the low shrub. And there are others who are always merry, always abroad, always begging, always living by handicraft; others who beg in towns, who sacrifice for those unfit to sacrifice, who are pupils of Śūdras, and Śūdras who are learned in the scriptures; others who are rogues, wearers of matted hair, dancers, mercenaries, wandering mendicants, actors, those fallen from the king’s service and the like; others who, for payment, say “We shall appease the Yakṣas, Rākṣasas, ghosts, goblins, demons, serpents, planets and the like”; others who falsely wear the red robe and earrings, and carry skulls; and others who wish to stand among the followers of the Veda by the jugglery of false arguments, examples and deceptive tricks — with these one should not dwell. They are plainly thieves and unfit for heaven. For thus has it been said: “Bewildered by the deceits of the doctrine of no-self, by false examples and reasons, the world does not know the difference between the knowledge of the Veda and other knowledge.”'
      ),
      M(
        [
          'बृहस्पतिर्वै शुक्रो भूत्वेन्द्रस्याभयायासुरेभ्यः क्षयायेमामविद्यामसृजत्।',
          'तया शिवमशिवमित्युद्दिशन्त्यशिवं शिवमिति। वेदादिशास्त्रहिंसकधर्माभिध्यानमस्त्विति वदन्ति।',
          'अतो नैनामभ्यसेत्। वितथैषा वन्ध्येवैषा रतिमात्रफलास्या वृत्तच्युतस्येव नारम्भणीयेति। एवं ह्याह —',
          'दूरमेते विपरीते विषूची अविद्या या च विद्येति ज्ञाता। विद्याभीप्सिनं नचिकेतसं मन्ये न त्वा कामा बहवो लोलुपन्ते॥',
          'विद्यां चाविद्यां च यस्तद्वेदोभयं सह। अविद्यया मृत्युं तीर्त्वा विद्ययामृतमश्नुते॥',
          'अविद्यायामन्तरे वेष्ट्यमानाः स्वयं धीराः पण्डितंमन्यमानाः। दन्द्रम्यमाणाः परियन्ति मूढा अन्धेनैव नीयमाना यथान्धाः॥',
        ],
        'बृहस्पति ने शुक्र बनकर इन्द्र के अभय के लिये और असुरों के क्षय के लिये इस अविद्या की रचना की। उसके द्वारा (लोग) शुभ को अशुभ और अशुभ को शुभ बताते हैं। वे कहते हैं कि वेद आदि शास्त्रों का विनाश करने वाले धर्म का ध्यान होना चाहिये। अतः इस (अविद्या) का अभ्यास न करे। यह मिथ्या है, यह वन्ध्या (स्त्री) के समान (निष्फल) है; इसका फल केवल क्षणिक रति (सुख) है; सदाचार से च्युत पुरुष (के आचरण) के समान इसका आरम्भ नहीं करना चाहिये। ऐसा ही कहा है — ‘जो अविद्या और जो विद्या के नाम से जानी जाती हैं, ये दोनों अत्यन्त विपरीत और भिन्न दिशाओं में जाने वाली हैं। मैं नचिकेता को विद्या का अभिलाषी मानता हूँ; तुम्हें बहुत-सी कामनाएँ लुभा नहीं सकीं।’ ‘जो विद्या और अविद्या — दोनों को साथ-साथ जानता है, वह अविद्या से मृत्यु को पार करके विद्या से अमृत का भोग करता है।’ ‘अविद्या के भीतर घिरे हुए, अपने को धीर और पण्डित मानने वाले मूढ़ लोग टेढ़े-मेढ़े मार्गों में भटकते हुए वैसे ही चक्कर काटते हैं जैसे अन्धे के द्वारा ले जाये जाते हुए अन्धे।’',
        'Bṛhaspati, having become Śukra, created this ignorance for the safety of Indra and the destruction of the demons. By it they declare the auspicious to be inauspicious and the inauspicious auspicious. They say, “Let there be meditation on a law that destroys the Veda and the other scriptures.” Therefore one should not study it. It is false; it is like a barren woman; its only fruit is momentary pleasure; like the conduct of one fallen from right conduct, it is not to be undertaken. For thus has it been said: “Widely apart and leading in opposite directions are these two, ignorance and what is known as knowledge. I deem Naciketas a seeker of knowledge; the many desires did not tempt you.” “He who knows both knowledge and ignorance together crosses death by ignorance and attains immortality by knowledge.” “Dwelling in the midst of ignorance, wise in their own esteem, thinking themselves learned, the deluded go round and round, staggering to and fro, like the blind led by one who is himself blind.”'
      ),
      M(
        [
          'देवासुरा ह वा आत्मानमन्वेष्टुकामा ब्रह्मणोऽन्तिकं प्रतिजग्मुः।',
          'तस्मै नमस्कृत्वोचुर्भगवन्वयमात्मानमन्वेष्टुकामाः स त्वं नो ब्रूहीति।',
          'ततश्चिरं ध्यात्वामन्यतान्यतात्मानो वै तेऽसुरा इति। ततोऽन्यतरमेतेषामात्मानमुक्तवान्।',
          'तत्रामी पुष्टशरीरा देहमेवात्मानं मत्वा परितुष्टा अगच्छन्। तस्मात्ते नष्टात्मानो जीवन्ति।',
          'अतो यदिदं वेदेषूक्तं तत्सत्यम्। वेदेषु यदुक्तं तदुपजीवन्ति पण्डिताः।',
          'तस्माद्ब्राह्मणो नावैदिकमधीयीत। अयमर्थः स्यादिति॥',
        ],
        'देवता और असुर आत्मा की खोज करने की इच्छा से ब्रह्मा के पास गये। उन्हें नमस्कार करके बोले — ‘भगवन्! हम आत्मा की खोज करना चाहते हैं; आप हमें (उसका) उपदेश दीजिये।’ तब (ब्रह्मा ने) देर तक ध्यान करके विचार किया — ‘ये असुर (आत्मा से) अन्य (शरीर) को आत्मा समझने वाले हैं।’ तब उन्होंने उन्हें (आत्मा से) भिन्न वस्तु को ही आत्मा बता दिया। तब वे (असुर) पुष्ट शरीर वाले होकर, देह को ही आत्मा मानकर सन्तुष्ट होकर चले गये। इसलिये वे आत्मा को खोकर (नष्टात्मा होकर) जीते हैं। अतः वेदों में जो कहा गया है, वही सत्य है; वेदों में जो कहा गया है, उसी के आश्रय से विद्वान् जीवन बिताते हैं। इसलिये ब्राह्मण अवैदिक (शास्त्र) का अध्ययन न करे — यही (इसका) अभिप्राय है।',
        'The gods and the demons, desiring to seek out the Self, went to Brahmā. Bowing to him, they said: “Blessed one, we wish to seek out the Self; tell it to us.” Then, having meditated for a long time, he thought: “These demons take something other than the Self to be the Self.” So he told them something different as their Self. Thereupon those demons, well-nourished in body, taking the body itself to be the Self, went away content. Therefore they live having lost the Self. Hence what is declared in the Vedas is the truth; on what is declared in the Vedas the wise depend for their life. Therefore a Brahmin should not study what is not of the Veda. This is the meaning.'
      ),
      M(
        [
          'एतद्वाव परस्याकाशस्यान्तर्हृदयाकाशस्य रूपं यत्परं तेजः। तदेतत्त्रेधाभिहितमग्नौ यदादित्ये यत्प्राणे।',
          'एतद्वाव परस्याकाशस्यान्तर्हृदयाकाशस्य रूपं यदोमित्येतदक्षरम्।',
          'अनेन वावैतदुद्बुध्यत्युदीयत उच्छ्वसिति। शश्वदजस्रं ब्रह्मधीयालम्बनं वा।',
          'तत्प्राणे तापनवत्तेजसि स्थितं यथोर्ध्वं धूमः शाखाभिर्नभसि विस्तीर्यते। यथोदके लवणं यथा घृत औष्ण्यं यथा ध्यातुर्विस्तृतिरिति। अत्रोदाहरन्ति —',
          'चक्षुष्यः पुरुषो योऽयं दक्षिणेऽक्षिणि स्थितः। इन्द्रोऽयं तस्य पत्नीयं सव्ये चाक्षिणि संस्थिता॥',
          'समागमस्तयोरेव हृदयान्तर्गते सुषौ। तेजस्तल्लोहितस्यात्र पिण्ड एवोभयोस्तयोः॥',
          'हृदयादायता तावच्चक्षुष्यस्मिन्प्रतिष्ठिता। सारणी सा तयोर्नाडी द्वयोरेका द्विधा सती॥',
          'मनः कायाग्निमाहन्ति स प्रेरयति मारुतम्। मारुतस्तूरसि चरन्मन्द्रं जनयति स्वरम्॥',
          'अणुर्हृदि द्व्यणुः कण्ठे जिह्वाग्रे त्र्यणुकं विदुः। विनिःसृतं मातृकां तं विदुरक्षरवेदिनः॥',
          'न पश्यो मृत्युं पश्यति न रोगं नोत दुःखताम्। सर्वं हि पश्यः पश्यति सर्वमाप्नोति सर्वशः॥',
          'चक्षुष्यः स्वप्नचारी च सुषुप्तः परश्च यः। भेदाश्चैते चत्वारस्तेषां तुर्यं महत्तरम्॥',
          'त्रिष्वेकपाच्चरेद्ब्रह्म त्रिपाच्चरति चोत्तरे। सत्यानृतोपभोगार्थो द्वैतीभावो महात्मनः। द्वैतीभावो महात्मन इति॥',
        ],
        'परम आकाश का, जो हृदयाकाश के भीतर है, यही रूप है जो परम तेज है। वह तीन प्रकार से कहा गया है — जो अग्नि में है, जो आदित्य में है और जो प्राण में है। परम आकाश का, जो हृदयाकाश के भीतर है, यही रूप है जो ‘ॐ’ यह अक्षर है। इसी के द्वारा वह (तेज) जागता है, ऊपर उठता है और श्वास लेता (फैलता) है; यह ब्रह्म के ध्यान का सदा निरन्तर आलम्बन है। वह प्राण में तपाने वाले तेज में स्थित है, जैसे ऊपर उठता हुआ धुआँ शाखाओं के रूप में आकाश में फैल जाता है; जैसे जल में नमक, जैसे घृत में उष्णता, जैसे ध्यान करने वाले के (चित्त का) विस्तार। इस विषय में उद्धृत करते हैं — ‘नेत्र में रहने वाला यह जो पुरुष दाहिनी आँख में स्थित है, यह इन्द्र है; और इसकी पत्नी बायीं आँख में स्थित है। उन दोनों का समागम हृदय के भीतर के छिद्र में होता है; वहाँ रक्त का पिण्ड ही उन दोनों का तेज है। हृदय से फैली हुई एक नाड़ी इस नेत्र तक प्रतिष्ठित है; वही उन दोनों की सारणी (मार्ग) है — एक होते हुए भी दो प्रकार की। मन शरीर की अग्नि को आहत करता है, वह (अग्नि) वायु को प्रेरित करती है, और वायु छाती में विचरता हुआ मन्द्र (गम्भीर) स्वर उत्पन्न करता है। (वह ध्वनि) हृदय में अणु, कण्ठ में द्व्यणु और जिह्वा के अग्रभाग पर त्र्यणुक होती है — ऐसा जानते हैं; बाहर निकलने पर अक्षरवेत्ता उसे मातृका (वर्णमाला) जानते हैं। देखने वाला (ज्ञानी) न मृत्यु को देखता है, न रोग को, न दुःख को; देखने वाला सब कुछ देखता है और सब प्रकार से सबको प्राप्त कर लेता है। नेत्र में रहने वाला (जाग्रत्), स्वप्न में विचरने वाला, सुषुप्त और जो उससे परे है — ये चार भेद हैं; इनमें चौथा (तुरीय) सबसे महान् है। तीनों में ब्रह्म एक पाद से विचरता है और अन्तिम (तुरीय) में तीन पादों से। सत्य और असत्य के उपभोग के लिये महात्मा (परमात्मा) का द्वैतभाव है — महात्मा का द्वैतभाव है।’',
        'This indeed is the form of the supreme space that is within the space of the heart: the supreme radiance. It is declared to be threefold — that which is in fire, that which is in the sun, that which is in the breath. This indeed is the form of the supreme space that is within the space of the heart: the syllable Om. By it that radiance awakens, rises up and breathes forth; it is the perpetual, unceasing support for meditation on Brahman. It abides in the breath, in the heat-giving radiance, as smoke rising upward spreads out in branches in the sky; as salt in water, as heat in ghee, as the expansion of one who meditates. On this they quote: “The Person in the eye, who dwells in the right eye, is Indra; his wife dwells in the left eye. Their union takes place in the cavity within the heart; the ball of red blood there is the radiance of them both. A channel extends from the heart and is fixed in this eye; that is their path — one channel, yet twofold. The mind strikes the fire of the body; that sets the wind in motion; the wind, moving in the chest, produces a deep sound. It is known as one atom in the heart, two atoms in the throat, three at the tip of the tongue; when it has come forth, the knowers of syllables know it as the mother of letters. The seer does not see death, nor disease, nor sorrow; the seer sees all and attains all in every way. He who is in the eye, he who moves in dream, he who is in deep sleep and he who is beyond — these are the four divisions; of them the fourth is the greatest. In the three Brahman moves with one foot; in the last it moves with three. For the experience of the true and the false, the great Self has become twofold — the great Self has become twofold.”'
      ),
    ],
  ],
};

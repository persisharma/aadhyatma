/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Nirālamba — Śukla Yajurveda, Sāmānya-Vedānta group. A single prose
 * catechism: after the invocation to Śiva as the guru, some forty questions
 * are asked at once (what is Brahman, Īśvara, the jīva, prakṛti … bondage,
 * liberation … the renunciate?) and then answered one by one, ending with the
 * saṃnyāsin who has realised "I am Brahman" and the fruit of study. Flat
 * mantras, one per answer (32 in all).
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'niralamba',
  muktika: 34,
  vedaHi: 'शुक्ल यजुर्वेद',
  vedaEn: 'Shukla Yajurveda',
  source: {
    baseText:
      'Śukla Yajurveda Nirālamba Upaniṣad as printed in the Adyar Library "Sāmānya Vedānta Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the sanskritdocuments.org transcription; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Sāmānya Vedānta Upaniṣads (ed. A. Mahadeva Sastri, 1921); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/niralamba.html',
      'https://www.wisdomlib.org/hinduism/book/niralamba-upanishad',
      'https://archive.org/details/SamanyaVedantaUpanishads',
    ],
    notes:
      '32 mantras, undivided, one per unit of the catechism: 1–3 the three opening ślokas (नमः शिवाय गुरवे…, निरालम्बं समाश्रित्य…, एषामज्ञानजन्तूनां…); 4 the full list of questions (किं ब्रह्म। क ईश्वरः। … कः संन्यासी।); 5–9 Brahman, Īśvara, jīva, prakṛti, paramātman; 10 the single answer covering Brahmā, Viṣṇu, Rudra, Indra, Śamana, Sūrya, Candra, gods, asuras, piśācas, humans, women, animals, the unmoving and the varṇas (“all this is Brahman”); 11–31 caste, action, non-action, knowledge, ignorance, happiness, sorrow, heaven, hell, bondage, liberation, the one to be worshipped, disciple, the wise, the deluded, the demonic, austerity, the highest state, what is to be grasped, what is not, and the saṃnyāsin; 32 the phala. The printed text is continuous prose after the three ślokas; the division into 32 here is by answer and is this edition’s own. The Śukla-Yajurvedic śānti-pāṭha (पूर्णमदः) is page 1. Reading variants: the fifth deity is कः शमनः / स शमनः here (some prints read यमः); some prints omit स रुद्रः in the answer of mantra 10, and some attach ब्रह्मेति to the start of mantra 5 rather than the end of the question list. Least-certain passages (to be checked first): the long compound of the Brahman definition (mantra 5), the jīva answer (7), the ajñāna answer (15), the order of the eleven bandha clauses (20), the āsura-tapas answer (26) and the śiṣya answer (23). Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।', 'पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (परब्रह्म) पूर्ण है, यह (जगत्) भी पूर्ण है; पूर्ण से ही पूर्ण प्रकट होता है। पूर्ण में से पूर्ण को निकाल लेने पर भी पूर्ण ही शेष रहता है। ॐ शान्तिः शान्तिः शान्तिः।',
    'That is full; this is full. From the full, the full arises. Taking the full from the full, the full alone remains. Om, peace, peace, peace.'
  ),
  mantras: [
    // 1 — Invocation to Śiva as the guru
    M(
      ['ॐ नमः शिवाय गुरवे सच्चिदानन्दमूर्तये।', 'निष्प्रपञ्चाय शान्ताय निरालम्बाय तेजसे॥'],
      'सत्-चित्-आनन्द की मूर्ति, प्रपञ्च से रहित, शान्त, निरालम्ब (किसी आधार पर न टिके हुए) तेजःस्वरूप गुरु शिव को नमस्कार है।',
      'Salutation to Śiva, the guru, the embodiment of being, consciousness and bliss — to Him who is beyond the manifold world, peaceful, without support, pure radiance.'
    ),
    // 2 — The one who rests on the supportless
    M(
      ['निरालम्बं समाश्रित्य सालम्बं विजहाति यः।', 'स संन्यासी च योगी च कैवल्यं पदमश्नुते॥'],
      'जो निरालम्ब (आधार-रहित ब्रह्म) का आश्रय लेकर सालम्ब (आधार वाले, दृश्य जगत्) को छोड़ देता है, वही संन्यासी है, वही योगी है; वह कैवल्य-पद को प्राप्त करता है।',
      'He who takes refuge in the supportless and abandons all that rests on support — he is the renunciate, he is the yogin; he attains the state of aloneness (kaivalya).'
    ),
    // 3 — Purpose of the teaching
    M(
      ['एषामज्ञानजन्तूनां समस्तारिष्टशान्तये।', 'यद्यद्बोद्धव्यमखिलं तदाशङ्क्य ब्रवीम्यहम्॥'],
      'इन अज्ञानी प्राणियों के समस्त अनिष्टों की शान्ति के लिए, जो-जो कुछ जानने योग्य है, वह सब प्रश्न के रूप में उठाकर मैं कहता हूँ।',
      'For the removal of every ill of these creatures sunk in ignorance, I shall state, raising each as a question, all that is to be known.'
    ),
    // 4 — The questions
    M(
      [
        'किं ब्रह्म। क ईश्वरः। को जीवः। का प्रकृतिः। कः परमात्मा।',
        'को ब्रह्मा। को विष्णुः। को रुद्रः। क इन्द्रः। कः शमनः। कः सूर्यः। कश्चन्द्रः।',
        'के सुराः। के असुराः। के पिशाचाः। के मनुष्याः। काः स्त्रियः। के पश्वादयः। किं स्थावरम्। के ब्राह्मणादयः।',
        'का जातिः। किं कर्म। किमकर्म। किं ज्ञानम्। किमज्ञानम्। किं सुखम्। किं दुःखम्।',
        'कः स्वर्गः। को नरकः। को बन्धः। को मोक्षः। क उपास्यः। कः शिष्यः। को विद्वान्। को मूढः।',
        'किमासुरम्। किं तपः। किं परमं पदम्। किं ग्राह्यम्। किमग्राह्यम्। कः संन्यासी।',
        'इत्याशङ्क्याह ब्रह्मेति॥',
      ],
      'ब्रह्म क्या है? ईश्वर कौन है? जीव कौन है? प्रकृति क्या है? परमात्मा कौन है? ब्रह्मा कौन है? विष्णु कौन है? रुद्र कौन है? इन्द्र कौन है? शमन (यम) कौन है? सूर्य कौन है? चन्द्रमा कौन है? देवता कौन हैं? असुर कौन हैं? पिशाच कौन हैं? मनुष्य कौन हैं? स्त्रियाँ कौन हैं? पशु आदि कौन हैं? स्थावर क्या है? ब्राह्मण आदि कौन हैं? जाति क्या है? कर्म क्या है? अकर्म क्या है? ज्ञान क्या है? अज्ञान क्या है? सुख क्या है? दुःख क्या है? स्वर्ग क्या है? नरक क्या है? बन्धन क्या है? मोक्ष क्या है? उपास्य कौन है? शिष्य कौन है? विद्वान् कौन है? मूढ़ कौन है? आसुर क्या है? तप क्या है? परम पद क्या है? ग्राह्य क्या है? अग्राह्य क्या है? संन्यासी कौन है? — ऐसे प्रश्न उठाकर (उत्तर) कहते हैं, पहले "ब्रह्म" के विषय में।',
      'What is Brahman? Who is Īśvara? Who is the jīva? What is prakṛti? Who is the supreme Self? Who is Brahmā? Who is Viṣṇu? Who is Rudra? Who is Indra? Who is Śamana (Yama)? Who is the Sun? Who is the Moon? Who are the gods? Who are the asuras? Who are the piśācas? Who are human beings? Who are women? Who are the animals and the rest? What is the unmoving? Who are the brāhmaṇas and the rest? What is caste? What is action? What is non-action? What is knowledge? What is ignorance? What is happiness? What is sorrow? What is heaven? What is hell? What is bondage? What is liberation? Who is to be worshipped? Who is the disciple? Who is the wise? Who is the deluded? What is demonic? What is austerity? What is the highest state? What is to be grasped? What is not to be grasped? Who is the renunciate? Having raised these questions, he answers, beginning with Brahman.'
    ),
    // 5 — Brahman
    M(
      [
        'स होवाच।',
        'महदहंकारपृथिव्यप्तेजोवाय्वाकाशत्वेन बृहद्रूपेणाण्डकोशेन कर्मज्ञानार्थरूपतया भासमानमद्वितीयमखिलोपाधिविनिर्मुक्तं तत्सकलशक्त्युपबृंहितमनाद्यनन्तं शुद्धं शिवं शान्तं निर्गुणमित्यादिवाच्यमनिर्वाच्यं चैतन्यं ब्रह्म॥',
      ],
      'उन्होंने कहा — जो महत्, अहंकार, पृथ्वी, जल, तेज, वायु और आकाश के रूप में, विशाल ब्रह्माण्ड-कोश के रूप में, कर्म, ज्ञान और (उनके) विषयों के रूप में भासित होता है; जो अद्वितीय है, सब उपाधियों से सर्वथा मुक्त है, समस्त शक्तियों से सम्पन्न है, अनादि और अनन्त है; जिसे शुद्ध, शिव, शान्त, निर्गुण आदि शब्दों से कहा जाता है और फिर भी जो अनिर्वचनीय है — वह चैतन्य ही ब्रह्म है।',
      'He said: That which shines forth as the Mahat, the ego, earth, water, fire, air and space, as the vast shell of the cosmic egg, as action, knowledge and their objects; which is without a second, wholly free of every limiting adjunct, endowed with all powers, without beginning or end; which is spoken of as pure, auspicious, peaceful, beyond qualities and so on, and yet is beyond all speech — that consciousness is Brahman.'
    ),
    // 6 — Īśvara
    M(
      [
        'ईश्वर इति च।',
        'ब्रह्मैव स्वशक्तिं प्रकृत्यभिधेयामाश्रित्य लोकान्सृष्ट्वा प्रविश्यान्तर्यामित्वेन ब्रह्मादीनां बुद्धीन्द्रियनियन्तृत्वादीश्वरः॥',
      ],
      'और ईश्वर — ब्रह्म ही अपनी "प्रकृति" नाम वाली शक्ति का आश्रय लेकर लोकों की सृष्टि करके, उनमें अन्तर्यामी रूप से प्रवेश करके ब्रह्मा आदि की बुद्धि और इन्द्रियों का नियन्ता होने के कारण ईश्वर कहलाता है।',
      'And Īśvara: Brahman itself, resting on its own power called prakṛti, creates the worlds, enters them as the inner controller, and — because it governs the intellect and senses of Brahmā and all others — is called Īśvara, the Lord.'
    ),
    // 7 — The jīva
    M(
      [
        'जीव इति च।',
        'ब्रह्मविष्ण्वीशानेन्द्रादीनां नामरूपद्वारा स्थूलोऽहमिति मिथ्याध्यासवशाज्जीवः।',
        'सोऽहमेकोऽपि देहारम्भकभेदवशाद्बहुजीवः॥',
      ],
      'और जीव — ब्रह्मा, विष्णु, ईशान, इन्द्र आदि के नाम और रूप के द्वारा "मैं स्थूल (शरीर) हूँ" — इस मिथ्या अध्यास (झूठे आरोप) के कारण (वही ब्रह्म) जीव है। वह "मैं" एक होते हुए भी शरीरों को आरम्भ करने वाले (कर्मों) के भेद के कारण अनेक जीवों के रूप में प्रतीत होता है।',
      'And the jīva: through the names and forms of Brahmā, Viṣṇu, Īśāna, Indra and the rest, under the false superimposition "I am this gross body", (that same Brahman) is the jīva. Though this "I" is one, it appears as many jīvas because of the differences in what brings each body into being.'
    ),
    // 8 — Prakṛti
    M(
      [
        'प्रकृतिरिति च।',
        'ब्रह्मणः सकाशान्नानाविचित्रजगन्निर्माणसामर्थ्यबुद्धिरूपा ब्रह्मशक्तिरेव प्रकृतिः॥',
      ],
      'और प्रकृति — ब्रह्म से ही उत्पन्न, नाना प्रकार के विचित्र जगत् के निर्माण की सामर्थ्य रखने वाली, बुद्धि-रूपा ब्रह्म की शक्ति ही प्रकृति है।',
      'And prakṛti: the power of Brahman itself — arising from Brahman, in the form of the intelligence able to fashion this manifold and wondrous world — is prakṛti.'
    ),
    // 9 — The supreme Self
    M(
      ['परमात्मेति च।', 'देहादेः परतरत्वाद्ब्रह्मैव परमात्मा॥'],
      'और परमात्मा — शरीर आदि से परे होने के कारण ब्रह्म ही परमात्मा है।',
      'And the supreme Self: because it lies beyond the body and all the rest, Brahman itself is the supreme Self (paramātman).'
    ),
    // 10 — The gods and all beings
    M(
      [
        'स ब्रह्मा स विष्णुः स रुद्रः स इन्द्रः स शमनः स सूर्यः स चन्द्रस्ते सुरास्ते असुरास्ते पिशाचास्ते मनुष्यास्ताः स्त्रियस्ते पश्वादयस्तत्स्थावरं ते ब्राह्मणादयः।',
        'सर्वं खल्विदं ब्रह्म नेह नानास्ति किंचन॥',
      ],
      'वही ब्रह्मा है, वही विष्णु है, वही रुद्र है, वही इन्द्र है, वही शमन (यम) है, वही सूर्य है, वही चन्द्रमा है; वे ही देवता हैं, वे ही असुर हैं, वे ही पिशाच हैं, वे ही मनुष्य हैं, वे ही स्त्रियाँ हैं, वे ही पशु आदि हैं, वही स्थावर है, वे ही ब्राह्मण आदि हैं। यह सब कुछ निश्चय ही ब्रह्म है; यहाँ नाना (भिन्न) कुछ भी नहीं है।',
      'He is Brahmā, he is Viṣṇu, he is Rudra, he is Indra, he is Śamana (Yama), he is the Sun, he is the Moon; they are the gods, they are the asuras, they are the piśācas, they are human beings, they are women, they are the animals and the rest, that is the unmoving, they are the brāhmaṇas and the rest. All this is indeed Brahman; there is no diversity here whatsoever.'
    ),
    // 11 — Caste
    M(
      ['जातिरिति च।', 'न चर्मणो न रक्तस्य न मांसस्य न चास्थिनः।', 'न जातिरात्मनो जातिर्व्यवहारप्रकल्पिता॥'],
      'और जाति — जाति न चमड़े की है, न रक्त की, न मांस की और न हड्डी की; आत्मा की कोई जाति नहीं है। जाति तो (केवल लोक-) व्यवहार के लिए कल्पित है।',
      'And caste: caste belongs neither to skin, nor to blood, nor to flesh, nor to bone. The Self has no caste; caste is an invention for worldly dealings.'
    ),
    // 12 — Action
    M(
      ['कर्मेति च।', 'क्रियमाणेन्द्रियैः कर्माण्यहं करोमीत्यध्यात्मनिष्ठतया कृतं कर्मैव कर्म॥'],
      'और कर्म — इन्द्रियों द्वारा किए जाते हुए कर्मों को "मैं करता हूँ" — ऐसा (मानकर भी) आत्मा में निष्ठा रखते हुए किया गया कर्म ही (वास्तविक) कर्म है।',
      'And action: action done while the senses act, with the thought "I do these actions" yet with one\'s steadfastness fixed on the inner Self — that alone is action.'
    ),
    // 13 — Non-action
    M(
      [
        'अकर्मेति च।',
        'कर्तृत्वभोक्तृत्वाद्यहंकारतया बन्धरूपं जन्मादिकारणं नित्यनैमित्तिकयागव्रततपोदानादिषु फलाभिसंधानं यत्तदकर्म॥',
      ],
      'और अकर्म — कर्ता और भोक्ता होने आदि के अहंकार के कारण जो बन्धन-रूप है, जन्म आदि का कारण है — नित्य और नैमित्तिक यज्ञ, व्रत, तप, दान आदि में जो फल की आकांक्षा है, वह अकर्म है।',
      'And non-action: that which, through the egoism of being doer and enjoyer, takes the form of bondage and is the cause of birth and the rest — the craving for fruit in daily and occasional sacrifices, vows, austerities, gifts and the like — that is non-action (akarma).'
    ),
    // 14 — Knowledge
    M(
      [
        'ज्ञानमिति च।',
        'देहेन्द्रियनिग्रहसद्गुरूपासनश्रवणमनननिदिध्यासनैर्यद्यद्दृग्दृश्यस्वरूपं सर्वान्तरस्थं सर्वसमं घटपटादिपदार्थमिवाविकारं विकारेषु चैतन्यं विना किंचिन्नास्तीति साक्षात्कारानुभवो ज्ञानम्॥',
      ],
      'और ज्ञान — शरीर और इन्द्रियों के निग्रह, सद्गुरु की उपासना, श्रवण, मनन और निदिध्यासन के द्वारा यह साक्षात् अनुभव होना कि जो कुछ द्रष्टा और दृश्य के रूप में है, जो सबके भीतर स्थित है, सबमें सम है, घड़ा-कपड़ा आदि पदार्थों की भाँति (उनमें) अविकारी है — उस चैतन्य के बिना विकारों (रूपान्तरों) में कुछ भी नहीं है — यही ज्ञान है।',
      'And knowledge: through restraint of body and senses, service of the true guru, hearing, reflection and deep contemplation, the direct experience that the nature of all seer and seen — dwelling within all, the same in all, changeless in things like pot and cloth — is consciousness, and that apart from consciousness nothing exists in the modifications: that is knowledge.'
    ),
    // 15 — Ignorance
    M(
      [
        'अज्ञानमिति च।',
        'रज्जौ सर्पभ्रान्तिरिवाद्वितीये सर्वानुस्यूते सर्वमये ब्रह्मणि देवतिर्यङ्नरस्थावरस्त्रीपुरुषवर्णाश्रमबन्धमोक्षोपाधिनानात्मभेदकल्पितं ज्ञानमज्ञानम्॥',
      ],
      'और अज्ञान — जैसे रस्सी में साँप का भ्रम होता है, वैसे ही अद्वितीय, सबमें अनुस्यूत (पिरोए हुए), सर्वमय ब्रह्म में देवता, पशु-पक्षी, मनुष्य, स्थावर, स्त्री, पुरुष, वर्ण, आश्रम, बन्धन, मोक्ष आदि उपाधियों के कारण अनेक आत्माओं के भेद की कल्पना करने वाला ज्ञान ही अज्ञान है।',
      'And ignorance: like the mistaking of a rope for a snake, the cognition that imagines a multitude of distinct selves in Brahman — which is without a second, threaded through all and made of all — on the strength of adjuncts such as god, beast, human, the unmoving, woman, man, caste, stage of life, bondage and liberation: that cognition is ignorance.'
    ),
    // 16 — Happiness
    M(
      ['सुखमिति च।', 'सच्चिदानन्दस्वरूपं ज्ञात्वानन्दरूपा या स्थितिः सैव सुखम्॥'],
      'और सुख — सत्-चित्-आनन्द स्वरूप को जानकर जो आनन्दमयी स्थिति होती है, वही सुख है।',
      'And happiness: the state of bliss that follows knowing one\'s nature as being, consciousness and bliss — that alone is happiness.'
    ),
    // 17 — Sorrow
    M(
      ['दुःखमिति च।', 'अनात्मरूपो विषयसंकल्प एव दुःखम्॥'],
      'और दुःख — अनात्म-रूप विषयों का संकल्प (चिन्तन) ही दुःख है।',
      'And sorrow: the thinking of objects, which are not the Self — that alone is sorrow.'
    ),
    // 18 — Heaven
    M(
      ['स्वर्ग इति च।', 'सत्संसर्गः स्वर्गः॥'],
      'और स्वर्ग — सत् (ब्रह्म तथा सत्पुरुषों) का संग ही स्वर्ग है।',
      'And heaven: association with the Real (and with the good) is heaven.'
    ),
    // 19 — Hell
    M(
      ['नरक इति च।', 'असत्संसारविषयजनसंसर्ग एव नरकः॥'],
      'और नरक — असत् संसार के विषयों और (विषयी) लोगों का संग ही नरक है।',
      'And hell: association with the objects of the unreal world and with worldly people — that alone is hell.'
    ),
    // 20 — Bondage
    M(
      [
        'बन्ध इति च।',
        'अनाद्यविद्यावासनया जातोऽहमित्यादिसंकल्पो बन्धः।',
        'पितृमातृसहोदरदारापत्यगृहारामक्षेत्रममतासंसारावरणसंकल्पो बन्धः।',
        'कर्तृत्वाद्यहंकारसंकल्पो बन्धः।',
        'अणिमाद्यष्टैश्वर्याशासिद्धसंकल्पो बन्धः।',
        'देवमनुष्याद्युपासनाकामसंकल्पो बन्धः।',
        'यमाद्यष्टाङ्गयोगसंकल्पो बन्धः।',
        'वर्णाश्रमधर्मकर्मसंकल्पो बन्धः।',
        'आज्ञाभयसंशयात्मगुणसंकल्पो बन्धः।',
        'यागव्रततपोदानविधिविधानज्ञानसंभवो बन्धः।',
        'केवलमोक्षापेक्षासंकल्पो बन्धः।',
        'संकल्पमात्रसंभवो बन्धः॥',
      ],
      'और बन्धन — अनादि अविद्या की वासना से "मैं जन्मा हूँ" इत्यादि संकल्प बन्धन है। पिता, माता, सगे भाई, पत्नी, सन्तान, घर, बगीचा, खेत — इनकी ममता से संसार को ढँक लेने वाला संकल्प बन्धन है। कर्तापन आदि के अहंकार का संकल्प बन्धन है। अणिमा आदि आठ ऐश्वर्यों (सिद्धियों) की आशा का संकल्प बन्धन है। देवता, मनुष्य आदि की उपासना की कामना का संकल्प बन्धन है। यम आदि अष्टाङ्ग योग का संकल्प बन्धन है। वर्ण और आश्रम के धर्म-कर्म का संकल्प बन्धन है। आज्ञा, भय, संशय — इन आत्मा पर आरोपित गुणों का संकल्प बन्धन है। यज्ञ, व्रत, तप, दान की विधि और विधान के ज्ञान से उत्पन्न (संकल्प) बन्धन है। केवल मोक्ष की अपेक्षा का संकल्प भी बन्धन है। संकल्प मात्र से उत्पन्न होने वाला (सब कुछ) बन्धन है।',
      'And bondage: the thought "I was born" and the like, arising from the latent impressions of beginningless ignorance, is bondage. The thought that veils the world with "mine" — father, mother, brother, wife, children, house, garden, field — is bondage. The thought of egoism as doer and so on is bondage. The thought of hoping for the eight powers beginning with aṇimā is bondage. The thought of desiring to worship gods, men and the like is bondage. The thought of the eight-limbed yoga beginning with yama is bondage. The thought of the duties and rites of caste and stage of life is bondage. The thought of command, fear and doubt as qualities of the Self is bondage. What arises from knowing the rules and injunctions of sacrifice, vow, austerity and gift is bondage. Even the thought of longing for liberation alone is bondage. Whatever arises from mere thought (saṅkalpa) is bondage.'
    ),
    // 21 — Liberation
    M(
      ['मोक्ष इति च।', 'नित्यानित्यवस्तुविचारादनित्यसंसारसुखदुःखविषयसमस्तक्षेत्रममताबन्धक्षयो मोक्षः॥'],
      'और मोक्ष — नित्य और अनित्य वस्तु के विवेक द्वारा अनित्य संसार के सुख-दुःख, विषय और समस्त क्षेत्र (शरीर आदि) में ममता रूपी बन्धन का नाश ही मोक्ष है।',
      'And liberation: through discrimination between the eternal and the transient, the destruction of the bondage of "mine" towards the pleasures and pains of the transient world, its objects and every field (body and possession) — that is liberation.'
    ),
    // 22 — The one to be worshipped
    M(
      ['उपास्य इति च।', 'सर्वशरीरस्थचैतन्यब्रह्मप्रापको गुरुरुपास्यः॥'],
      'और उपास्य — सब शरीरों में स्थित चैतन्य-रूप ब्रह्म की प्राप्ति कराने वाला गुरु ही उपास्य है।',
      'And the one to be worshipped: the guru, who leads one to Brahman, the consciousness dwelling in all bodies, is the one to be worshipped.'
    ),
    // 23 — The disciple
    M(
      ['शिष्य इति च।', 'विद्याध्वस्तप्रपञ्चावगाहितज्ञानावशिष्टं ब्रह्मैव शिष्यः॥'],
      'और शिष्य — विद्या (आत्मज्ञान) से प्रपञ्च के नष्ट हो जाने पर, ज्ञान में निमग्न होकर जो शेष रहता है, वह ब्रह्म ही शिष्य है।',
      'And the disciple: when the world of plurality has been destroyed by knowledge, the Brahman that remains, immersed in knowledge — that alone is the disciple.'
    ),
    // 24 — The wise
    M(
      ['विद्वानिति च।', 'सर्वान्तरस्थस्वसंविद्रूपविद्विद्वान्॥'],
      'और विद्वान् — जो सबके भीतर स्थित अपने चैतन्य-स्वरूप को जानता है, वह विद्वान् है।',
      'And the wise: he who knows his own nature as the consciousness dwelling within all — he is the wise.'
    ),
    // 25 — The deluded
    M(
      ['मूढ इति च।', 'कर्तृत्वाद्यहंकारभावारूढो मूढः॥'],
      'और मूढ़ — जो कर्तापन आदि के अहंकार-भाव पर आरूढ़ है, वह मूढ़ है।',
      'And the deluded: he who is mounted on the ego-sense of being the doer and the like — he is the deluded.'
    ),
    // 26 — The demonic
    M(
      [
        'आसुरमिति च।',
        'ब्रह्मविष्ण्वीशानेन्द्रादीनामैश्वर्यकामनया निरशनजपाग्निहोत्रादिष्वन्तरात्मानं संतापयति चात्युग्ररागद्वेषविहिंसादम्भाद्यपेक्षितं तप आसुरम्॥',
      ],
      'और आसुर — ब्रह्मा, विष्णु, ईशान, इन्द्र आदि के ऐश्वर्य की कामना से उपवास, जप, अग्निहोत्र आदि के द्वारा जो अपने अन्तरात्मा को सन्तप्त करता है, और जो अत्यन्त उग्र राग, द्वेष, हिंसा, दम्भ आदि से युक्त है — वह तप आसुर है।',
      'And the demonic: austerity that torments the inner self through fasting, repetition of mantras, the fire-offering and the like out of desire for the lordship of Brahmā, Viṣṇu, Īśāna, Indra and the rest, and that is bound up with fierce passion, hatred, violence, hypocrisy and the like — that austerity is demonic.'
    ),
    // 27 — Austerity
    M(
      ['तप इति च।', 'ब्रह्म सत्यं जगन्मिथ्येत्यपरोक्षज्ञानाग्निना ब्रह्माद्यैश्वर्याशासिद्धसंकल्पबीजसंतापं तपः॥'],
      'और तप — "ब्रह्म सत्य है, जगत् मिथ्या है" — इस अपरोक्ष ज्ञान की अग्नि से ब्रह्मा आदि के ऐश्वर्य की आशा से उत्पन्न संकल्पों के बीज को जला डालना ही तप है।',
      'And austerity: burning up, in the fire of the direct knowledge "Brahman is real, the world is illusory", the seed of the thoughts born of hoping for the lordship of Brahmā and the rest — that is austerity.'
    ),
    // 28 — The highest state
    M(
      ['परमं पदमिति च।', 'प्राणेन्द्रियाद्यन्तःकरणगुणादेः परतरं सच्चिदानन्दमयं नित्यमुक्तब्रह्मस्थानं परमं पदम्॥'],
      'और परम पद — प्राण, इन्द्रियाँ, अन्तःकरण, गुण आदि से परे, सत्-चित्-आनन्दमय, नित्य-मुक्त ब्रह्म का स्थान ही परम पद है।',
      'And the highest state: the abode of Brahman — beyond the vital breath, the senses, the inner instrument, the qualities and the rest; made of being, consciousness and bliss; eternally free — that is the highest state.'
    ),
    // 29 — What is to be grasped
    M(
      ['ग्राह्यमिति च।', 'देशकालवस्तुपरिच्छेदराहित्यचिन्मात्रस्वरूपं ग्राह्यम्॥'],
      'और ग्राह्य — देश, काल और वस्तु की सीमा से रहित केवल चैतन्य-स्वरूप ही ग्रहण करने योग्य है।',
      'And what is to be grasped: pure consciousness alone, free of every limit of place, time and thing — that is to be grasped.'
    ),
    // 30 — What is not to be grasped
    M(
      ['अग्राह्यमिति च।', 'स्वस्वरूपव्यतिरिक्तमायामयबुद्धीन्द्रियगोचरजगत्सत्यत्वचिन्तनमग्राह्यम्॥'],
      'और अग्राह्य — अपने स्वरूप से भिन्न, मायामय, बुद्धि और इन्द्रियों के विषय बनने वाले जगत् को सत्य मानकर उसका चिन्तन करना अग्राह्य (त्याज्य) है।',
      'And what is not to be grasped: thinking of the world — which is other than one\'s own nature, made of māyā, and the field of intellect and senses — as real: that is not to be grasped.'
    ),
    // 31 — The renunciate
    M(
      [
        'संन्यासीति च।',
        'सर्वधर्मान्परित्यज्य निर्ममो निरहंकारो भूत्वा ब्रह्मेष्टं शरणमुपगम्य तत्त्वमसि अहं ब्रह्मास्मि सर्वं खल्विदं ब्रह्म नेह नानास्ति किंचनेत्यादिमहावाक्यार्थानुभवज्ञानाद्ब्रह्मैवाहमस्मीति निश्चित्य निर्विकल्पसमाधिना स्वतन्त्रो यतिश्चरति स संन्यासी स मुक्तः स पूज्यः स योगी स परमहंसः सोऽवधूतः स ब्राह्मण इति॥',
      ],
      'और संन्यासी — सब धर्मों को त्यागकर, ममता और अहंकार से रहित होकर, अभीष्ट ब्रह्म की शरण में जाकर, "तत्त्वमसि (वह तू है)", "अहं ब्रह्मास्मि (मैं ब्रह्म हूँ)", "सर्वं खल्विदं ब्रह्म (यह सब ब्रह्म ही है)", "नेह नानास्ति किंचन (यहाँ नाना कुछ भी नहीं है)" इत्यादि महावाक्यों के अर्थ के अनुभव-ज्ञान से "मैं ब्रह्म ही हूँ" — ऐसा निश्चय करके, जो यति निर्विकल्प समाधि के द्वारा स्वतन्त्र होकर विचरता है, वही संन्यासी है, वही मुक्त है, वही पूज्य है, वही योगी है, वही परमहंस है, वही अवधूत है, वही ब्राह्मण है।',
      'And the renunciate: the ascetic who, giving up all dharmas, free of "mine" and of ego, takes refuge in Brahman, the one desired; who, through the experienced knowledge of the meaning of the great sayings — "That thou art", "I am Brahman", "All this is indeed Brahman", "There is no diversity here whatsoever" and the like — is certain "I am Brahman alone"; and who moves about free through nirvikalpa samādhi — he is the renunciate, he is the liberated, he is worthy of worship, he is the yogin, he is the paramahaṃsa, he is the avadhūta, he is the brāhmaṇa.'
    ),
    // 32 — Phala
    M(
      [
        'इदं निरालम्बोपनिषदं योऽधीते गुर्वनुग्रहतः सोऽग्निपूतो भवति स वायुपूतो भवति।',
        'न स पुनरावर्तते न स पुनरावर्तते पुनर्नाभिजायते पुनर्नाभिजायत इत्युपनिषत्॥',
      ],
      'जो गुरु की कृपा से इस निरालम्ब उपनिषद् का अध्ययन करता है, वह अग्नि से पवित्र हो जाता है, वह वायु से पवित्र हो जाता है। वह फिर (संसार में) नहीं लौटता, वह फिर नहीं लौटता; वह फिर जन्म नहीं लेता, फिर जन्म नहीं लेता। — यह उपनिषद् है।',
      'He who studies this Nirālamba Upaniṣad by the grace of the guru is purified by fire, is purified by air. He does not return, he does not return; he is not born again, he is not born again. Thus the Upaniṣad.'
    ),
  ],
};

/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Atharvaśikhā — Atharvaveda, Śaiva group. Three numbered prose passages, cited 1–3.
 * Pippalāda, Aṅgiras and Sanatkumāra ask Atharvan what is to be meditated on; he
 * answers with Om, its four mātrās and their names, and Śiva/Īśāna as the one
 * object of meditation.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'atharvashikha',
  muktika: 23,
  vedaHi: 'अथर्ववेद',
  vedaEn: 'Atharvaveda',
  source: {
    baseText:
      'Atharvaveda text as printed in the Adyar Library "Śaiva Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Śaiva Upaniṣads (ed. A. Mahadeva Sastri, 1925); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/atharvashikha.html',
      'https://www.wisdomlib.org/hinduism/book/atharvashikha-upanishad',
      'https://archive.org/details/SaivaUpanishads',
    ],
    notes:
      'Undivided text in three numbered prose passages (1: the question and the four mātrās of Om; 2: the names tāra, viṣṇu, brahmā, prakāśa, vidyut, mahādeva; 3: the states of consciousness, dhyāna/dhyātṛ/dhyeya, Śiva as the one to be meditated on, and the closing phala) — 3 mantras, each split into lines at sentence boundaries, plus the Atharvavedic śānti-pāṭha (भद्रं कर्णेभिः) as page 1. Some printings label the three passages as khaṇḍas; the Adyar text sets them as one continuous upaniṣad. Reading variants: मात्रा deities of passage 1 read "रुद्र आदित्याः" / "रुद्रा आदित्याः"; "विद्युमती" / "विद्युन्मती"; in passage 3 "क्रतुशतस्यापि चतुःसप्तत्या" is variously transmitted, and the closing "यामधीत्य द्विजो…" phala is absent from some manuscripts. Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    [
      'ॐ भद्रं कर्णेभिः शृणुयाम देवाः भद्रं पश्येमाक्षभिर्यजत्राः।',
      'स्थिरैरङ्गैस्तुष्टुवांसस्तनूभिर्व्यशेम देवहितं यदायुः।',
      'स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः।',
      'स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    'हे देवों! हम कानों से शुभ सुनें; हे यज्ञार्ह देवों! हम नेत्रों से शुभ देखें। स्थिर अंगों और शरीरों से आपकी स्तुति करते हुए हम देवों के हित की आयु प्राप्त करें। महान यशस्वी इन्द्र हमारा कल्याण करें; सर्वज्ञ पूषा हमारा कल्याण करें; अरिष्टनेमि तार्क्ष्य (गरुड़) हमारा कल्याण करें; बृहस्पति हमारा कल्याण करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'O gods, may we hear what is auspicious with our ears; O you worthy of worship, may we see what is auspicious with our eyes. Praising you with steady limbs and bodies, may we live the full span the gods have allotted. May Indra of great renown bless us; may all-knowing Pūṣan bless us; may Tārkṣya (Garuḍa) of unhindered course bless us; may Bṛhaspati grant us well-being. Om, peace, peace, peace.'
  ),
  mantras: [
    // ── 1 — The question; Om and its four mātrās ─────────────────────────
    M(
      [
        'ॐ अथ हैनं पिप्पलादोऽङ्गिराः सनत्कुमारश्चाथर्वाणं भगवन्तं पप्रच्छुः।',
        'किमादौ प्रयुक्तं ध्यानं ध्यायितव्यं किं तद्ध्यानं को वा ध्याता कश्च ध्येयः।',
        'स एभ्योऽथर्वा प्रत्युवाच।',
        'ओमित्येतदक्षरमादौ प्रयुक्तं ध्यानं ध्यायितव्यमित्येतदक्षरं परं ब्रह्म।',
        'अस्य पादाश्चत्वारो वेदाश्चतुष्पादिदमक्षरं परं ब्रह्म।',
        'पूर्वास्य मात्रा पृथिव्यकारः स ऋग्भिरृग्वेदो ब्रह्मा वसवो गायत्री गार्हपत्यः।',
        'द्वितीयान्तरिक्षं स उकारः स यजुर्भिर्यजुर्वेदो विष्णू रुद्रास्त्रिष्टुब्दक्षिणाग्निः।',
        'तृतीया द्यौः स मकारः स सामभिः सामवेदो रुद्र आदित्या जगत्याहवनीयः।',
        'यावसानेऽस्य चतुर्थ्यर्धमात्रा सा सोमलोक ओङ्कारः साथर्वणैर्मन्त्रैरथर्ववेदः संवर्तकोऽग्निर्मरुतो विराडेकर्षिर्भास्वती स्मृता।',
        'प्रथमा रक्तपीता महद्ब्रह्मदैवत्या।',
        'द्वितीया विद्युमती कृष्णा विष्णुदैवत्या।',
        'तृतीया शुभाशुभा शुक्ला रुद्रदैवत्या।',
        'यावसानेऽस्य चतुर्थ्यर्धमात्रा सा विद्युमती सर्ववर्णा पुरुषदैवत्या।',
        'स एष ह्योङ्कारश्चतुरक्षरश्चतुष्पादश्चतुःशिराश्चतुर्थमात्रः स्थूलमेतद्ध्रस्वदीर्घप्लुतमिति।',
        'ॐ ॐ ॐ इति त्रिरुक्त्वा चतुर्थः शान्त आत्मा।',
        'प्लुतप्रयोगेण समस्तमिति।',
        'सकृदुच्चारितमात्रः स एष ऊर्ध्वमुन्नमयतीत्योङ्कारः।',
        'प्राणान्सर्वान्प्रलीयत इति प्रलयः।',
        'प्राणान्सर्वान्परमात्मनि प्रणामयतीत्येतस्मात्प्रणवः।',
        'चतुर्धावस्थित इति सर्वदेववेदयोनिः सर्ववाच्यवाचकप्रणवात्मकम्॥',
      ],
      'ॐ। फिर पिप्पलाद, अङ्गिरा और सनत्कुमार ने भगवान् अथर्वा से पूछा — "सबसे पहले किस ध्यान का प्रयोग करके ध्यान करना चाहिए? वह ध्यान क्या है? ध्याता कौन है? और ध्येय कौन है?" अथर्वा ने उन्हें उत्तर दिया — "ॐ — यह अक्षर ही सबसे पहले प्रयुक्त ध्यान है, इसी का ध्यान करना चाहिए; यह अक्षर परब्रह्म है। इसके चार पाद हैं — चार वेद; यह चतुष्पाद अक्षर परब्रह्म है। इसकी पहली मात्रा पृथ्वी है, वह अकार है; वह ऋचाओं के साथ ऋग्वेद है, (उसके) ब्रह्मा, वसुगण, गायत्री (छन्द) और गार्हपत्य (अग्नि) हैं। दूसरी (मात्रा) अन्तरिक्ष है, वह उकार है; वह यजुओं के साथ यजुर्वेद है, (उसके) विष्णु, रुद्रगण, त्रिष्टुप् और दक्षिणाग्नि हैं। तीसरी (मात्रा) द्युलोक है, वह मकार है; वह सामों के साथ सामवेद है, (उसके) रुद्र, आदित्यगण, जगती और आहवनीय हैं। इसके अन्त में जो चौथी अर्धमात्रा है, वह सोमलोक है, (वही) ओंकार है; वह अथर्वण मन्त्रों के साथ अथर्ववेद है, (उसके) संवर्तक अग्नि, मरुद्गण, विराट् और एकर्षि हैं; वह भास्वती (प्रकाशमयी) कही गयी है। पहली (मात्रा) लाल-पीली है, उसके देवता महान् ब्रह्मा हैं; दूसरी विद्युत्-युक्त, काली है, उसके देवता विष्णु हैं; तीसरी शुभ-अशुभ (को धारण करने वाली), श्वेत है, उसके देवता रुद्र हैं; इसके अन्त में जो चौथी अर्धमात्रा है, वह विद्युत्-युक्त, सब वर्णों वाली है, उसके देवता पुरुष हैं। यह ओंकार चार अक्षरों वाला, चार पादों वाला, चार सिरों वाला और चार मात्राओं वाला है; यह स्थूल (रूप) ह्रस्व, दीर्घ और प्लुत है। ॐ ॐ ॐ — इस प्रकार तीन बार उच्चारण करके, चौथा शान्त आत्मा है। प्लुत प्रयोग से (यह) समस्त (पूर्ण) होता है। एक बार उच्चारण करते ही यह (साधक को) ऊपर उठा देता है, इसलिए ओंकार है। (इसमें) सब प्राण लीन हो जाते हैं, इसलिए प्रलय है। यह सब प्राणों को परमात्मा में प्रणत कर देता है, इसलिए प्रणव है। यह चार प्रकार से स्थित है, इसलिए सब देवों और वेदों का उद्गम है; समस्त वाच्य और वाचक (अर्थ और शब्द) प्रणव-रूप ही हैं।"',
      'Om. Then Pippalāda, Aṅgiras and Sanatkumāra asked the venerable Atharvan: "What meditation is to be employed first and meditated upon? What is that meditation? Who is the meditator? And who is the one meditated upon?" Atharvan answered them: "Om — this syllable is the meditation to be employed first and meditated upon; this syllable is the supreme Brahman. Its feet are four — the four Vedas; this four-footed syllable is the supreme Brahman. Its first mātrā is the earth; it is the letter A; with the Ṛks it is the Ṛgveda — Brahmā, the Vasus, the Gāyatrī metre and the Gārhapatya fire. The second is the mid-space; it is the letter U; with the Yajus it is the Yajurveda — Viṣṇu, the Rudras, the Triṣṭubh and the Dakṣiṇa fire. The third is heaven; it is the letter M; with the Sāmans it is the Sāmaveda — Rudra, the Ādityas, the Jagatī and the Āhavanīya fire. The fourth, the half-mātrā at its end, is the world of Soma, (the very) Oṃkāra; with the Atharvan mantras it is the Atharvaveda — the Saṃvartaka fire, the Maruts, the Virāj and the sole Seer; it is declared to be radiant. The first is red-yellow, with great Brahmā as its deity; the second is lightning-like and dark, with Viṣṇu as its deity; the third, bearing the auspicious and inauspicious, is white, with Rudra as its deity; the fourth, the half-mātrā at its end, is lightning-like and of all colours, with the Person as its deity. This Oṃkāra has four syllables, four feet, four heads and four mātrās; in its gross form it is short, long and prolated. Having uttered Om Om Om three times, the fourth is the tranquil Self. By the prolated utterance it is complete. As soon as it is uttered once, it lifts (the seeker) upward — hence Oṃkāra. All the breaths are dissolved (in it) — hence pralaya. It makes all the breaths bow into the supreme Self — hence Praṇava. It abides fourfold — hence it is the source of all the gods and Vedas; all that is denoted and all that denotes is of the nature of the praṇava."'
    ),
    // ── 2 — The names: tāra, viṣṇu, brahmā, prakāśa, vidyut, mahādeva ─────
    M(
      [
        'देवाश्चेति सन्धत्तां सर्वेभ्यो दुःखभयेभ्यः सन्तारयतीति तारणात्तारः।',
        'सर्वे देवाः संविशन्तीति विष्णुः।',
        'सर्वाणि बृंहयतीति ब्रह्मा।',
        'सर्वेभ्योऽन्तस्थानेभ्यो ध्येयेभ्यः प्रदीपवत्प्रकाशयतीति प्रकाशः।',
        'प्रकाशेभ्यः सदोमित्यन्तःशरीरे विद्युद्वद्द्योतयति मुहुर्मुहुरिति विद्युद्वत्प्रत्यवभासयति।',
        'दिशो भित्त्वा सर्वाँल्लोकान्व्याप्नोति व्याप्नोतीति व्यापनाद्व्यापी महादेवः॥',
      ],
      '"(सब) देवता भी (इसी से) जुड़ें" — (यह) सब दुःखों और भयों से भली-भाँति तार देता है, इसलिए तारने के कारण तार है। सब देवता (इसमें) प्रवेश करते हैं, इसलिए विष्णु है। सबको बढ़ाता है, इसलिए ब्रह्मा है। सब भीतर के स्थानों और ध्येयों को दीपक की भाँति प्रकाशित करता है, इसलिए प्रकाश है। (उन) प्रकाशों से भी (बढ़कर) सदा "ॐ" (रूप से) शरीर के भीतर बिजली की भाँति बार-बार चमकता है, इसलिए विद्युत् के समान प्रतिभासित होता है। दिशाओं को भेदकर सब लोकों को व्याप्त करता है — व्याप्त करता है; व्यापने के कारण (यह) व्यापी महादेव है।',
      '"Let the gods too be joined (to it)": it carries one fully across all sorrows and fears — because it carries across, it is Tāra. All the gods enter into it — hence it is Viṣṇu. It expands all things — hence it is Brahmā. Like a lamp it illumines all the inner seats and all objects of meditation — hence it is Prakāśa, the Light. Beyond those lights, as "Om" it ever flashes within the body again and again like lightning — hence it shines forth like lightning (Vidyut). Piercing the quarters, it pervades all the worlds — it pervades; because it pervades, it is the all-pervading Mahādeva.'
    ),
    // ── 3 — The states; meditation, meditator, meditated; Śiva alone ───────
    M(
      [
        'पूर्वास्य मात्रा जागर्ति जागरितं द्वितीया स्वप्नं तृतीया सुषुप्तिश्चतुर्थी तुरीयम्।',
        'मात्रा मात्राः प्रतिमात्रागताः सम्यक्समस्तानपि पादाञ्जयतीति स्वयम्प्रकाशः स्वयं ब्रह्म भवतीत्येष सिद्धिकर एतस्माद्ध्यानादौ प्रयुज्यते।',
        'सर्वकरणोपसंहारत्वाद्धार्यधारणाद्ब्रह्म तुरीयम्।',
        'सर्वकरणानि मनसि सम्प्रतिष्ठाप्य ध्यानं विष्णुः।',
        'प्राणं मनसि सह करणैः सम्प्रतिष्ठाप्य ध्याता रुद्रः।',
        'प्राणं मनसि सह करणैर्नादान्ते परमात्मनि सम्प्रतिष्ठाप्य ध्यायीतेशानं प्रध्यायितव्यम्।',
        'सर्वमिदं ब्रह्मविष्णुरुद्रेन्द्रास्ते सम्प्रसूयन्ते सर्वाणि चेन्द्रियाणि सह भूतैः।',
        'न कारणं कारणानां ध्याता कारणं तु ध्येयः सर्वैश्वर्यसम्पन्नः सर्वेश्वरः शम्भुराकाशमध्ये।',
        'ध्रुवं स्तब्ध्वाधिकं क्षणमेकं क्रतुशतस्यापि चतुःसप्तत्या यत्फलं तदवाप्नोति कृत्स्नमोङ्कारगतिं च।',
        'सर्वध्यानयोगज्ञानानां यत्फलमोङ्कारो वेद पर ईशो वा शिव एको ध्येयः शिवङ्करः सर्वमन्यत्परित्यज्य।',
        'समाप्ताथर्वशिखा यामधीत्य द्विजो गर्भवासविमुक्तो विमुक्तो भवति।',
        'यामधीत्य द्विजो गर्भवासविमुक्तो विमुक्तो भवतीत्यों सत्यमित्युपनिषत्॥',
      ],
      'इसकी पहली मात्रा जाग्रत् है — जागरण (की अवस्था); दूसरी स्वप्न; तीसरी सुषुप्ति; और चौथी तुरीय। प्रत्येक मात्रा में (अपनी-अपनी) मात्राएँ प्रविष्ट हैं; (यह) भलीभाँति सब पादों को भी जीत लेता है, इसलिए स्वयंप्रकाश है; (इसका साधक) स्वयं ब्रह्म हो जाता है — यह सिद्धि देने वाला है, इसीलिए ध्यान के आरम्भ में इसका प्रयोग किया जाता है। सब इन्द्रियों के उपसंहार (-स्थान) होने से और धारण करने योग्य (सब) को धारण करने से, ब्रह्म तुरीय है। सब इन्द्रियों को मन में भलीभाँति स्थापित करके (जो होता है, वह) ध्यान विष्णु है। इन्द्रियों सहित प्राण को मन में भलीभाँति स्थापित करके (ध्यान करने वाला) ध्याता रुद्र है। इन्द्रियों सहित प्राण को मन में, (और उसे) नाद के अन्त में परमात्मा में भलीभाँति स्थापित करके ईशान का ध्यान करे — (वही) प्रधान रूप से ध्यान करने योग्य है। यह सब, और वे ब्रह्मा, विष्णु, रुद्र और इन्द्र (उसी से) उत्पन्न होते हैं, और भूतों सहित सब इन्द्रियाँ भी। ध्याता कारणों का कारण नहीं है; कारण तो ध्येय ही है — सब ऐश्वर्यों से सम्पन्न, सबका ईश्वर, शम्भु, (हृदय-) आकाश के मध्य में (स्थित)। (उसमें मन को) स्थिर करके एक क्षण भी अधिक (ठहरने से) सौ यज्ञों के चौहत्तर (गुने) का जो फल है, उसे और ओंकार की सम्पूर्ण गति को (साधक) प्राप्त करता है। सब ध्यान, योग और ज्ञान का जो फल है, (वह) ओंकार है — (इसे) जानो; पर ईश अथवा कल्याणकारी शिव ही एक ध्येय हैं; और सब छोड़कर (उन्हीं का ध्यान करे)। अथर्वशिखा समाप्त हुई — जिसका अध्ययन करके द्विज गर्भवास से मुक्त होकर मुक्त हो जाता है; जिसका अध्ययन करके द्विज गर्भवास से मुक्त होकर मुक्त हो जाता है। ॐ सत्य है — यह उपनिषद् है।',
      'Its first mātrā is waking — the waking state; the second is dream; the third is deep sleep; the fourth is turīya. Each mātrā contains the mātrās within it; it fully conquers all the feet as well — hence it is self-luminous; (its seeker) himself becomes Brahman. This is the giver of accomplishment; therefore it is employed at the beginning of meditation. Because all the senses are withdrawn into it, and because it upholds all that is to be upheld, Brahman is the Fourth. Establishing all the senses firmly in the mind — that meditation is Viṣṇu. Establishing the breath with the senses firmly in the mind — the meditator is Rudra. Establishing the breath with the senses in the mind, and (that) in the supreme Self at the end of the resonance (nāda), let one meditate on Īśāna: he is the one to be meditated upon above all. All this, and Brahmā, Viṣṇu, Rudra and Indra, are born (of him), and all the senses together with the elements. The meditator is not the cause of causes; the cause is the one meditated upon — endowed with all sovereignty, lord of all, Śambhu, in the midst of the space (of the heart). Holding (the mind) steady (on him) for a single moment more, one obtains the fruit of seventy-four times a hundred sacrifices, and the entire goal of Oṃkāra. The fruit of all meditation, yoga and knowledge is Oṃkāra — know this; the supreme Lord, the auspicious Śiva, is the one alone to be meditated upon, the maker of good, all else being abandoned. Here ends the Atharvaśikhā, by studying which a twice-born is freed from dwelling in the womb and is liberated — by studying which a twice-born is freed from dwelling in the womb and is liberated. Om, it is truth — thus the Upaniṣad.'
    ),
  ],
};

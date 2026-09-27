/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Jābāla — Śukla Yajurveda, Saṃnyāsa group. Six prose khaṇḍas, one mantra
 * each, cited khaṇḍa.1. Bṛhaspati, Atri, the brahmacārins and Janaka question
 * Yājñavalkya on Avimukta, the Śatarudrīya, the āśramas and renunciation; the
 * text closes with the paramahaṃsas.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'jabala',
  muktika: 13,
  vedaHi: 'शुक्ल यजुर्वेद',
  vedaEn: 'Shukla Yajurveda',
  source: {
    baseText:
      'Śukla Yajurveda recension as printed in the Adyar Library "Saṃnyāsa Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Saṃnyāsa Upaniṣads (ed. F. Otto Schrader, 1912); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/jAbAla.html',
      'https://www.wisdomlib.org/hinduism/book/jabala-upanishad',
      'https://archive.org/details/SamnyasaUpanishads',
    ],
    notes:
      'Six khaṇḍas of 1 · 1 · 1 · 1 · 1 · 1 = 6 mantras: each khaṇḍa is a single numbered prose paragraph in the printed text, kept whole here and split into lines at sentence boundaries (1 Avimukta; 2 Atri on Avimukta, Varaṇā and Nāsī; 3 the Śatarudrīya; 4 Janaka on the āśramas and the rite of renunciation; 5 Atri on the sacred thread and the modes of leaving the body; 6 the paramahaṃsas). The Yajurvedic śānti-pāṭha (पूर्णमदः) is page 1. Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।', 'पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (परब्रह्म) पूर्ण है, यह (जगत्) भी पूर्ण है; पूर्ण से ही पूर्ण प्रकट होता है। पूर्ण में से पूर्ण को निकाल लेने पर भी पूर्ण ही शेष रहता है। ॐ शान्तिः शान्तिः शान्तिः।',
    'That is full; this is full. From the full, the full arises. Taking the full from the full, the full alone remains. Om, peace, peace, peace.'
  ),
  khandas: [
    // ── Khaṇḍa 1 — Avimukta ────────────────────────────────────────────────
    [
      M(
        [
          'ॐ बृहस्पतिरुवाच याज्ञवल्क्यं यदनु कुरुक्षेत्रं देवानां देवयजनं सर्वेषां भूतानां ब्रह्मसदनम्।',
          'अविमुक्तं वै कुरुक्षेत्रं देवानां देवयजनं सर्वेषां भूतानां ब्रह्मसदनम्।',
          'तस्माद्यत्र क्वचन गच्छति तदेव मन्येत तदविमुक्तमेव।',
          'इदं वै कुरुक्षेत्रं देवानां देवयजनं सर्वेषां भूतानां ब्रह्मसदनम्।',
          'अत्र हि जन्तोः प्राणेषूत्क्रममाणेषु रुद्रस्तारकं ब्रह्म व्याचष्टे येनासावमृतीभूत्वा मोक्षीभवति।',
          'तस्मादविमुक्तमेव निषेवेत अविमुक्तं न विमुञ्चेत्।',
          'एवमेवैतद्याज्ञवल्क्य॥',
        ],
        'बृहस्पति ने याज्ञवल्क्य से कहा (पूछा) — "जो कुरुक्षेत्र देवताओं की यज्ञभूमि और सब प्राणियों का ब्रह्म-सदन कहा जाता है, (वह क्या है?)" (याज्ञवल्क्य बोले —) "अविमुक्त ही कुरुक्षेत्र है — देवताओं की यज्ञभूमि और सब प्राणियों का ब्रह्म-सदन। इसलिए (साधक) जहाँ कहीं भी जाए, उसी को वह माने कि यही अविमुक्त है। यही कुरुक्षेत्र है — देवताओं की यज्ञभूमि, सब प्राणियों का ब्रह्म-सदन। यहीं प्राणी के प्राण निकलते समय रुद्र तारक ब्रह्म (मन्त्र) का उपदेश करते हैं, जिससे वह अमृत होकर मुक्त हो जाता है। इसलिए अविमुक्त का ही सेवन करे, अविमुक्त को कभी न छोड़े।" (बृहस्पति बोले —) "याज्ञवल्क्य! यह ऐसा ही है।"',
        'Bṛhaspati said to Yājñavalkya: "What is that Kurukṣetra which is the gods\' place of sacrifice and the abode of Brahman for all beings?" (Yājñavalkya:) "Avimukta, the unforsaken, is Kurukṣetra — the gods\' place of sacrifice, the abode of Brahman for all beings. Therefore wherever one goes, one should regard that very place as Avimukta. This indeed is Kurukṣetra, the gods\' place of sacrifice, the abode of Brahman for all beings. For here, when a creature\'s life-breaths are departing, Rudra imparts the Brahman that ferries across (tāraka), by which he becomes immortal and is liberated. Therefore one should dwell in Avimukta alone and never forsake Avimukta." (Bṛhaspati:) "So it is, Yājñavalkya."'
      ),
    ],
    // ── Khaṇḍa 2 — Atri: Avimukta between Varaṇā and Nāsī ──────────────────
    [
      M(
        [
          'अथ हैनमत्रिः पप्रच्छ याज्ञवल्क्यं य एषोऽनन्तोऽव्यक्त आत्मा तं कथमहं विजानीयामिति।',
          'स होवाच याज्ञवल्क्यः सोऽविमुक्त उपास्यो य एषोऽनन्तोऽव्यक्त आत्मा सोऽविमुक्ते प्रतिष्ठित इति।',
          'सोऽविमुक्तः कस्मिन्प्रतिष्ठित इति।',
          'वरणायां नास्यां च मध्ये प्रतिष्ठित इति।',
          'का वै वरणा का च नासीति।',
          'सर्वानिन्द्रियकृतान्दोषान्वारयतीति तेन वरणा भवति।',
          'सर्वानिन्द्रियकृतान्पापान्नाशयतीति तेन नासी भवतीति।',
          'कतमच्चास्य स्थानं भवतीति।',
          'भ्रुवोर्घ्राणस्य च यः सन्धिः स एष द्युलोकस्य परस्य च सन्धिर्भवतीति।',
          'एतद्वै सन्धिं सन्ध्यां ब्रह्मविद उपासत इति।',
          'सोऽविमुक्त उपास्य इति।',
          'सोऽविमुक्तं ज्ञानमाचष्टे यो वैतदेवं वेदेति॥',
        ],
        'फिर अत्रि ने याज्ञवल्क्य से पूछा — "यह जो अनन्त, अव्यक्त आत्मा है, उसे मैं कैसे जानूँ?" याज्ञवल्क्य ने कहा — "वह अविमुक्त उपासना करने योग्य है; यह जो अनन्त, अव्यक्त आत्मा है, वह अविमुक्त में प्रतिष्ठित है।" "वह अविमुक्त किसमें प्रतिष्ठित है?" "वरणा और नासी के मध्य में प्रतिष्ठित है।" "वरणा क्या है और नासी क्या है?" "जो इन्द्रियों द्वारा किये गये सब दोषों का निवारण करती है, इसलिए वह वरणा है; जो इन्द्रियों द्वारा किये गये सब पापों का नाश करती है, इसलिए वह नासी है।" "और इसका स्थान कौन-सा है?" "भौंहों और नासिका का जो सन्धि-स्थल है, वही द्युलोक और परलोक का सन्धि-स्थल है। इसी सन्धि की ब्रह्मवेत्ता सन्ध्या के रूप में उपासना करते हैं। वह अविमुक्त उपासना करने योग्य है। जो इसे इस प्रकार जानता है, वह अविमुक्त ज्ञान का उपदेश करता है।"',
        'Then Atri asked Yājñavalkya: "This infinite, unmanifest Self — how may I know it?" Yājñavalkya said: "Avimukta is to be worshipped; this infinite, unmanifest Self is established in Avimukta." "In what is that Avimukta established?" "It is established between the Varaṇā and the Nāsī." "What is the Varaṇā, and what the Nāsī?" "Because it wards off (vārayati) all the faults committed by the senses, it is the Varaṇā; because it destroys (nāśayati) all the sins committed by the senses, it is the Nāsī." "And which is its seat?" "The junction of the brows and the nose — that is the junction of the heavenly world and the world beyond. It is this junction that the knowers of Brahman worship as the sandhyā. That Avimukta is to be worshipped. One who knows this thus imparts the knowledge of Avimukta."'
      ),
    ],
    // ── Khaṇḍa 3 — the Śatarudrīya ─────────────────────────────────────────
    [
      M(
        [
          'अथ हैनं ब्रह्मचारिण ऊचुः किं जप्येनामृतत्वं ब्रूहीति।',
          'स होवाच याज्ञवल्क्यः शतरुद्रियेणेति।',
          'एतान्येव ह वा अमृतस्य नामानि।',
          'एतैर्ह वा अमृतो भवतीति एवमेवैतद्याज्ञवल्क्यः॥',
        ],
        'फिर ब्रह्मचारियों ने उनसे कहा — "किसके जप से अमृतत्व (प्राप्त होता है), यह बताइये।" याज्ञवल्क्य ने कहा — "शतरुद्रिय से। ये (शतरुद्रिय के नाम) ही अमृत के नाम हैं; इन्हीं से मनुष्य अमृत हो जाता है।" याज्ञवल्क्य ने ऐसा ही कहा।',
        'Then the students of the Veda said to him: "Tell us, by the repetition of what does one gain immortality?" Yājñavalkya said: "By the Śatarudrīya. These indeed are the names of the Immortal; by these one becomes immortal." Thus indeed spoke Yājñavalkya.'
      ),
    ],
    // ── Khaṇḍa 4 — Janaka: the āśramas and the rite of renunciation ────────
    [
      M(
        [
          'अथ हैनं जनको वैदेहो याज्ञवल्क्यमुपसमेत्योवाच भगवन्संन्यासमनुब्रूहीति।',
          'स होवाच याज्ञवल्क्यः ब्रह्मचर्यं समाप्य गृही भवेत्।',
          'गृही भूत्वा वनी भवेत्।',
          'वनी भूत्वा प्रव्रजेत्।',
          'यदि वेतरथा ब्रह्मचर्यादेव प्रव्रजेद्गृहाद्वा वनाद्वा।',
          'अथ पुनरव्रती वा व्रती वा स्नातको वास्नातको वा उत्सन्नाग्निरनग्निको वा यदहरेव विरजेत्तदहरेव प्रव्रजेत्।',
          'तद्धैके प्राजापत्यामेवेष्टिं कुर्वन्ति।',
          'तदु तथा न कुर्यादाग्नेयीमेव कुर्यात्।',
          'अग्निर्हि प्राणः प्राणमेवैतया करोति।',
          'त्रैधातवीयामेव कुर्यात्।',
          'एतयैव त्रयो धातवो यदुत सत्त्वं रजस्तम इति।',
          'अयं ते योनिरृत्वियो यतो जातो अरोचथाः।',
          'तं जानन्नग्न आरोहाथा नो वर्धया रयिमित्यनेन मन्त्रेणाग्निमाजिघ्रेत्।',
          'एष ह वा अग्नेर्योनिर्यः प्राणः प्राणं गच्छ स्वाहेत्येवमेवैतदाह।',
          'ग्रामादग्निमाहृत्य पूर्ववदग्निमाघ्रापयेत्।',
          'यद्यग्निं न विन्देदप्सु जुहुयात्।',
          'आपो वै सर्वा देवताः।',
          'सर्वाभ्यो देवताभ्यो जुहोमि स्वाहेति हुत्वोद्धृत्य प्राश्नीयात्साज्यं हविरनामयम्।',
          'मोक्षमन्त्रस्त्रय्येवं विन्देत्।',
          'तद्ब्रह्म तदुपासितव्यम्।',
          'एवमेवैतद्भगवन्निति वै याज्ञवल्क्य॥',
        ],
        'फिर विदेहराज जनक ने याज्ञवल्क्य के पास जाकर कहा — "भगवन्! मुझे संन्यास का उपदेश दीजिये।" याज्ञवल्क्य ने कहा — "ब्रह्मचर्य पूरा करके गृहस्थ बने; गृहस्थ होकर वानप्रस्थ बने; वानप्रस्थ होकर संन्यास ले। अथवा अन्य प्रकार से — ब्रह्मचर्य से ही, या गृहस्थ से, या वानप्रस्थ से संन्यास ले ले। और फिर, कोई व्रती हो या अव्रती, स्नातक हो या अस्नातक, जिसकी अग्नि बुझ गयी हो या जो अग्नि रखता ही न हो — जिस दिन वैराग्य हो, उसी दिन संन्यास ले ले। कुछ लोग (इस अवसर पर) प्राजापत्य इष्टि ही करते हैं; पर ऐसा न करे, आग्नेयी इष्टि ही करे, क्योंकि अग्नि ही प्राण है — इस (इष्टि) से वह प्राण को ही (पुष्ट) करता है। (अथवा) त्रैधातवीया इष्टि ही करे, क्योंकि इसी से तीनों धातु — सत्त्व, रज और तम — (सम्बद्ध) हैं। \'हे अग्ने! यह तुम्हारा ऋतु-अनुकूल उद्गम-स्थान है, जिससे उत्पन्न होकर तुम प्रकाशित हुए; उसे जानते हुए (उसमें) आरूढ़ हो जाओ और हमारा धन बढ़ाओ\' — इस मन्त्र से अग्नि को सूँघे (अपने भीतर ग्रहण करे)। जो प्राण है, वही अग्नि का उद्गम-स्थान है — \'प्राण में जाओ, स्वाहा\' — यही इसका आशय है। गाँव से अग्नि लाकर पहले की तरह उसे सूँघे। यदि अग्नि न मिले तो जल में आहुति दे, क्योंकि जल ही सब देवता है। \'सब देवताओं के लिए आहुति देता हूँ, स्वाहा\' — यों आहुति देकर, (शेष) निकालकर उस घृतयुक्त, रोगनाशक हवि का प्राशन करे। मोक्ष का मन्त्र यह त्रयी (वेद) ही है — ऐसा जाने। वह ब्रह्म है, उसी की उपासना करनी चाहिये।" (जनक बोले —) "भगवन्! यह ऐसा ही है, याज्ञवल्क्य!"',
        'Then Janaka of Videha approached Yājñavalkya and said: "Revered sir, teach me renunciation." Yājñavalkya said: "Having completed studentship, one should become a householder; having been a householder, one should become a forest-dweller; having been a forest-dweller, one should renounce. Or otherwise, one may renounce straight from studentship, or from the household, or from the forest. And again — whether one has kept the vows or not, whether one has completed one\'s studies or not, whether one\'s fires have gone out or one never kept a fire — on the very day one becomes dispassionate, on that very day one should renounce. Some perform the Prājāpatya offering at this point; one should not do so, but should perform the Āgneyī (offering to Fire), for Fire is the life-breath, and by it one strengthens the life-breath itself. One should perform the Traidhātavīyā, for by it are the three elements — sattva, rajas and tamas — (honoured). With the mantra \'This is your timely source, O Agni, born from which you shone forth; knowing it, ascend into it and increase our wealth\', one should inhale the fire. The source of fire is the life-breath; \'Go into the breath, svāhā\' — this is what it means. Bringing fire from the village, one should inhale it as before. If one cannot find fire, one should offer into water, for water is all the gods. Offering with \'I offer to all the gods, svāhā\', one should take up and eat the oblation mixed with ghee, which is wholesome. The three Vedas are the mantra of liberation — so one should know. That is Brahman; That is to be worshipped." (Janaka:) "So it is, revered Yājñavalkya."'
      ),
    ],
    // ── Khaṇḍa 5 — Atri: the thread, and the modes of leaving the body ─────
    [
      M(
        [
          'अथ हैनमत्रिः पप्रच्छ याज्ञवल्क्यं पृच्छामि त्वा याज्ञवल्क्य अयज्ञोपवीती कथं ब्राह्मण इति।',
          'स होवाच याज्ञवल्क्यः इदमेवास्य तद्यज्ञोपवीतं य आत्मा।',
          'अपः प्राश्याचम्यायं विधिः परिव्राजकानाम्।',
          'वीराध्वाने वा अनाशके वा अपां प्रवेशे वा अग्निप्रवेशे वा महाप्रस्थाने वा।',
          'अथ परिव्राड्विवर्णवासा मुण्डोऽपरिग्रहः शुचिरद्रोही भैक्षमाणो ब्रह्मभूयाय भवति।',
          'यद्यातुरः स्यान्मनसा वाचा संन्यसेत्।',
          'एष पन्था ब्रह्मणा हानुवित्तस्तेनैति संन्यासी ब्रह्मविदित्येवमेवैष भगवन्याज्ञवल्क्य॥',
        ],
        'फिर अत्रि ने याज्ञवल्क्य से पूछा — "याज्ञवल्क्य! मैं आपसे पूछता हूँ — यज्ञोपवीत न धारण करने वाला ब्राह्मण कैसे है?" याज्ञवल्क्य ने कहा — "यह जो आत्मा है, वही उसका यज्ञोपवीत है। जल का प्राशन और आचमन करना — यही परिव्राजकों की विधि है। (देह-त्याग) वीरों के मार्ग (युद्ध) में, अनशन से, जल-प्रवेश से, अग्नि-प्रवेश से या महाप्रस्थान से (हो)। परिव्राजक गेरुए (विवर्ण) वस्त्र धारण करने वाला, मुण्डित, अपरिग्रही, पवित्र, किसी से द्रोह न करने वाला और भिक्षा पर जीने वाला होकर ब्रह्मभाव के योग्य होता है। यदि (कोई) रोगी (आसन्न-मृत्यु) हो तो मन और वाणी से ही संन्यास ले ले। यह मार्ग ब्रह्मा ने खोजा है; इसी से ब्रह्मवेत्ता संन्यासी (ब्रह्म को) प्राप्त होता है।" (अत्रि बोले —) "भगवन् याज्ञवल्क्य! यह ऐसा ही है।"',
        'Then Atri asked Yājñavalkya: "I ask you, Yājñavalkya — how is one without the sacred thread a brāhmaṇa?" Yājñavalkya said: "The Self — that alone is his sacred thread. Sipping water and rinsing the mouth: this is the rule for wandering ascetics. (The body may be laid down) on the heroes\' path, or by fasting, or by entering water, or by entering fire, or by the great departure. Then the wandering ascetic — in discoloured cloth, shaven-headed, possessionless, pure, harming none, living on alms — becomes fit to become Brahman. If one is sick (near death), one may renounce by mind and word alone. This path was found by Brahmā; by it goes the renunciant who knows Brahman." (Atri:) "So it is, revered Yājñavalkya."'
      ),
    ],
    // ── Khaṇḍa 6 — the paramahaṃsas ────────────────────────────────────────
    [
      M(
        [
          'तत्र परमहंसा नाम संवर्तकारुणिश्वेतकेतुदुर्वासऋभुनिदाघजडभरतदत्तात्रेयरैवतकप्रभृतयोऽव्यक्तलिङ्गा अव्यक्ताचारा अनुन्मत्ता उन्मत्तवदाचरन्तः।',
          'त्रिदण्डं कमण्डलुं शिक्यं पात्रं जलपवित्रं शिखां यज्ञोपवीतं च इत्येतत्सर्वं भूः स्वाहेत्यप्सु परित्यज्यात्मानमन्विच्छेत्।',
          'यथाजातरूपधरा निर्ग्रन्था निष्परिग्रहास्तत्तद्ब्रह्ममार्गे सम्यक्सम्पन्नाः शुद्धमानसाः प्राणसन्धारणार्थं यथोक्तकाले विमुक्तो भैक्षमाचरन्नुदरपात्रेण लाभालाभयोः समौ भूत्वा।',
          'शून्यागारदेवगृहतृणकूटवल्मीकवृक्षमूलकुलालशालाग्निहोत्रगृहनदीपुलिनगिरिकुहरकन्दरकोटरनिर्झरस्थण्डिलेषु तेष्वनिकेतवास्यप्रयत्नो निर्ममः शुक्लध्यानपरायणोऽध्यात्मनिष्ठोऽशुभकर्मनिर्मूलनपरः संन्यासेन देहत्यागं करोति स परमहंसो नामेति॥',
        ],
        'उन (संन्यासियों) में संवर्तक, आरुणि, श्वेतकेतु, दुर्वासा, ऋभु, निदाघ, जडभरत, दत्तात्रेय, रैवतक आदि परमहंस कहलाते हैं — जिनके (आश्रम के) चिह्न प्रकट नहीं, जिनका आचरण प्रकट नहीं, जो उन्मत्त न होते हुए भी उन्मत्त की भाँति आचरण करते हैं। त्रिदण्ड, कमण्डलु, छींका, पात्र, जल छानने का वस्त्र, शिखा और यज्ञोपवीत — इन सबको \'भूः स्वाहा\' कहकर जल में त्यागकर आत्मा की खोज करे। जैसे जन्मे थे वैसे ही रूप को धारण करने वाले (दिगम्बर), ग्रन्थि-रहित, परिग्रह-रहित, ब्रह्म-मार्ग में भली-भाँति प्रतिष्ठित, शुद्ध मन वाले — वे प्राण-धारण के लिए शास्त्रोक्त समय पर, मुक्त भाव से, उदर को ही पात्र बनाकर भिक्षा करते हुए, लाभ और हानि में सम रहकर; सूने घर, देव-मन्दिर, घास की झोंपड़ी, बाँबी, वृक्ष की जड़, कुम्हार की शाला, अग्निहोत्र-गृह, नदी का तट, पर्वत की गुफा, कन्दरा, कोटर, झरना या खुली भूमि — इनमें बिना घर के रहते हुए, प्रयत्न-रहित, ममता-रहित, शुक्ल (शुद्ध) ध्यान में लीन, अध्यात्म में निष्ठ, अशुभ कर्मों को निर्मूल करने में तत्पर होकर जो संन्यास के द्वारा देह-त्याग करता है, वही परमहंस कहलाता है।',
        'Among them are those called paramahaṃsas — Saṃvartaka, Āruṇi, Śvetaketu, Durvāsas, Ṛbhu, Nidāgha, Jaḍabharata, Dattātreya, Raivataka and others — whose marks are unseen, whose conduct is unseen, who, though not mad, behave as if mad. Casting into the water, with "bhūḥ svāhā", the triple staff, the water-pot, the sling, the bowl, the water-strainer, the tuft and the sacred thread — all of it — one should seek the Self. Bearing the form in which they were born, free of bonds, free of possessions, well established in the path of Brahman, pure in mind; begging at the prescribed time, free, only to sustain life, with the belly as their bowl, even-minded in gain and loss; dwelling homeless in an empty house, a temple, a grass hut, an ant-hill, the foot of a tree, a potter\'s shed, a fire-sanctuary, a river bank, a mountain cave, a hollow, a tree-hollow, beside a waterfall or on bare ground — without effort, without "mine", intent on pure meditation, grounded in the Self, bent on uprooting all unwholesome karma — the one who gives up the body through renunciation: he is called a paramahaṃsa.'
      ),
    ],
  ],
};

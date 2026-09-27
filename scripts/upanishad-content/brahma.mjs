/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Brahma — Kṛṣṇa Yajurveda, Saṃnyāsa group. 23 mantras: three prose sections
 * (Śaunaka's question to Pippalāda on prāṇa and the states; the four seats of
 * the Person; the one Brahman beyond all distinctions) and twenty verses on
 * the inner sacred thread and tuft of knowledge and on the one hidden God.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'brahma',
  muktika: 11,
  vedaHi: 'कृष्ण यजुर्वेद',
  vedaEn: 'Krishna Yajurveda',
  source: {
    baseText:
      'Kṛṣṇa Yajurveda recension as printed in the Adyar Library "Saṃnyāsa Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Saṃnyāsa Upaniṣads (ed. F. Otto Schrader, 1912); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/brahma.html',
      'https://www.wisdomlib.org/hinduism/book/brahma-upanishad',
      'https://archive.org/details/SamnyasaUpanishads',
    ],
    notes:
      '23 mantras: 1 the Śaunaka–Pippalāda prose on prāṇa and the states; 2 the four seats and four quarters of the Person (अथास्य पुरुषस्य चत्वारि स्थानानि); 3 the one Brahman beyond all distinctions; 4–15 the verses on the heart, the yajñopavīta and the śikhā of knowledge; 16–23 the closing verses from एको देवः सर्वभूतेषु गूढः (several shared with the Śvetāśvatara). The Yajurvedic śānti-pāṭha (सह नाववतु) is page 1. The tail of mantra 1 (कपालाष्टकं … वेदालयः) and the readings of 15 and 17 vary between prints and are the least certain. Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition (including the mantra division) is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै।', 'तेजस्वि नावधीतमस्तु मा विद्विषावहै॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (ब्रह्म) हम दोनों (गुरु-शिष्य) की साथ-साथ रक्षा करे, हम दोनों का साथ-साथ पालन करे; हम दोनों साथ-साथ सामर्थ्य प्राप्त करें। हमारा पढ़ा हुआ तेजस्वी हो; हम परस्पर द्वेष न करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'May That protect us both together; may That nourish us both together; may we work together with vigour. May what we study be luminous; may we never hate one another. Om, peace, peace, peace.'
  ),
  mantras: [
    M(
      [
        'ॐ शौनको ह वै महाशालोऽङ्गिरसं भगवन्तं पिप्पलादमपृच्छत्।',
        'दिव्ये ब्रह्मपुरे सम्प्रतिष्ठिता भवन्ति कथं सृजन्ति।',
        'कस्यैष महिमा बभूव।',
        'यो ह्येष महिमा बभूव क एषः।',
        'तस्मै स होवाच।',
        'एतद्ब्रह्मविद्यां वरिष्ठां प्रब्रवीमि।',
        'प्राण एष आत्मा।',
        'आत्मनो महिमा बभूव देवानामायुः।',
        'स देवानां निधनमनिधनम्।',
        'दिव्ये ब्रह्मपुरे विरजं निष्कलं शुभ्रमक्षरं यद्ब्रह्म विभाति स नियच्छति मधुकरराजानं माक्षिकवत्।',
        'यथा माक्षिकैकेन तन्तुना जालं विक्षिपति तेनापकर्षति तथैवैष प्राणो यदा याति संसृष्टमाकृष्य।',
        'प्राणदेवतास्ताः सर्वा नाड्यः।',
        'सुषुप्ते श्येनाकाशवत्।',
        'यथा श्येनः खमाश्रित्य याति स्वमालयमेवं सुषुप्तं ब्रूते।',
        'यथैवैष देवदत्तो यष्ट्यापि ताड्यमानो न यत्येवमिष्टापूर्तैः शुभाशुभैर्न लिप्यते।',
        'यथा कुमारो निष्काम आनन्दमुपयाति तथैवैष देवदत्तः स्वप्न आनन्दमभियाति।',
        'वेद एव परं ज्योतिः।',
        'ज्योतिष्कामो ज्योतिरानन्दयते।',
        'भूयस्तेनैव स्वप्नाय गच्छति जलूकावत्।',
        'यथा जलूकाग्रमग्रं नयत्यात्मानं नयति परं सन्धयति यत्परं नापरं त्यजति स जाग्रदभिधीयते।',
        'यथैवैष कपालाष्टकं संनयति तस्मिन्नेव स्तन इव लम्बते वेदालयः॥',
      ],
      'महाशाल (महान् गृहस्थ) शौनक ने अङ्गिरा-गोत्रीय भगवान् पिप्पलाद से पूछा — "(ये इन्द्रियाँ और देवता) दिव्य ब्रह्मपुर (शरीर) में कैसे प्रतिष्ठित हैं और कैसे (जगत् को) रचते हैं? यह महिमा किसकी है? जो यह महिमा हुई, वह कौन है?" उन्होंने उससे कहा — "मैं यह श्रेष्ठ ब्रह्मविद्या कहता हूँ। यह प्राण ही आत्मा है; यह आत्मा की ही महिमा है; (यही) देवताओं (इन्द्रियों) की आयु है। वह देवताओं का लय-स्थान है, (फिर भी स्वयं) अविनाशी है। दिव्य ब्रह्मपुर में जो निर्मल, कला-रहित, शुभ्र, अक्षर ब्रह्म प्रकाशित है, वह (प्राण और इन्द्रियों को) वैसे ही नियन्त्रित करता है जैसे मधुमक्खियों को उनकी रानी। जैसे मकड़ी एक ही तन्तु से जाल फैलाती है और उसी से समेट लेती है, वैसे ही यह प्राण जब जाता है तो फैलाये हुए (जगत्) को समेटकर जाता है। सारी नाड़ियाँ प्राण की देवियाँ (वाहिकाएँ) हैं। सुषुप्ति आकाश में बाज़ के समान है — जैसे बाज़ आकाश का आश्रय लेकर अपने घोंसले में लौट जाता है, वैसे ही सुषुप्ति को कहा गया है। जैसे (सुषुप्त) देवदत्त छड़ी से पीटे जाने पर भी नहीं हिलता, वैसे ही (उस अवस्था में) वह इष्ट-पूर्त (यज्ञ-दान आदि) के शुभ-अशुभ फलों से लिप्त नहीं होता। जैसे निष्काम बालक आनन्द पाता है, वैसे ही यह देवदत्त स्वप्न (शयन) में आनन्द पाता है। वेद (ज्ञान) ही परम ज्योति है; ज्योति की कामना करने वाला ज्योति से आनन्दित होता है। फिर वह उसी (मार्ग) से जोंक की भाँति स्वप्न में जाता है — जैसे जोंक अपने अग्र-भाग को आगे रखकर अपने को आगे ले जाती है, अगले (स्थान) को पकड़ लेती है और पिछले को छोड़ देती है (वैसे ही वह एक अवस्था से दूसरी में जाता है); (इसी प्रकार पिछली को छोड़कर अगली अवस्था को पकड़ने वाला) वह जाग्रत् कहलाता है। जैसे वह आठ कपालों (पुरोडाश के आठ पात्रों) को एक साथ धारण करता है, वैसे ही उस (हृदय) में वेदों का आलय (आत्मा) स्तन के समान लटका हुआ है।"',
      'Śaunaka, the great householder, asked the venerable Pippalāda of the Aṅgiras line: "How are (the senses and their gods) established in the divine city of Brahman (the body), and how do they create? Whose is this greatness? He who has become this greatness — who is he?" To him he said: "I shall declare this highest knowledge of Brahman. This prāṇa is the Self; it is the greatness of the Self, the life of the gods (the senses). It is the dissolution of the gods, yet itself undissolved. The stainless, partless, radiant, imperishable Brahman that shines in the divine city of Brahman governs (breath and senses) as the queen governs the bees. As the spider spreads its web by a single thread and draws it back by the same, so this prāṇa, when it departs, draws back what it has put forth. All the channels (nāḍīs) are the goddesses of prāṇa. Deep sleep is like the hawk in the sky: as the hawk, resting on the sky, returns to its own nest, so is deep sleep described. As this Devadatta (asleep) does not stir even when struck with a stick, so (in that state) he is untouched by the good and bad fruits of sacrifice and charity. As a child without desire attains bliss, so this Devadatta attains bliss in sleep. The Veda alone is the supreme light; one who desires the light rejoices in the light. Again, by that same (path) he goes into dream like a leech: as a leech leads itself forward tip by tip, takes hold of the next and lets go of the last, so he who grasps the next (state) and does not keep the last is said to be awake. As he holds together the eight potsherds (of the sacrificial cake), so within it the abode of the Vedas (the Self) hangs like a breast."'
    ),
    M(
      [
        'अथास्य पुरुषस्य चत्वारि स्थानानि भवन्ति नाभिर्हृदयं कण्ठं मूर्धा च।',
        'तत्र चतुष्पादं ब्रह्म विभाति।',
        'जागरितं स्वप्नं सुषुप्तं तुरीयमिति।',
        'जागरिते ब्रह्मा स्वप्ने विष्णुः सुषुप्तौ रुद्रस्तुरीयमक्षरम्।',
        'स आदित्यो विष्णुश्चेश्वरश्च स्वयममनस्कमश्रोत्रमपाणिपादं ज्योतिर्विदितम्॥',
      ],
      'इस पुरुष के चार स्थान हैं — नाभि, हृदय, कण्ठ और मूर्धा। वहाँ चार पादों वाला ब्रह्म प्रकाशित होता है — जाग्रत्, स्वप्न, सुषुप्ति और तुरीय। जाग्रत् में ब्रह्मा, स्वप्न में विष्णु, सुषुप्ति में रुद्र और तुरीय में अक्षर (परब्रह्म) है। वही आदित्य है, वही विष्णु और ईश्वर है; वह स्वयं मन-रहित, कान-रहित, हाथ-पैर-रहित, ज्योति-स्वरूप जाना गया है।',
      'Now this Person has four seats — the navel, the heart, the throat and the crown of the head. There shines Brahman with four quarters: waking, dream, deep sleep and the fourth. In waking is Brahmā, in dream Viṣṇu, in deep sleep Rudra, and the fourth is the Imperishable. He is the Sun, he is Viṣṇu and the Lord; he himself is known as light — without mind, without ear, without hands and feet.'
    ),
    M(
      [
        'यत्र लोका न लोका देवा न देवा वेदा न वेदा यज्ञा न यज्ञा माता न माता पिता न पिता स्नुषा न स्नुषा चाण्डालो न चाण्डालः पौल्कसो न पौल्कसः श्रमणो न श्रमणः पशवो न पशवस्तापसो न तापस इत्येकमेव परं ब्रह्म विभाति निर्वाणम्।',
        'न तत्र देवा ऋषयः पितर ईशते प्रतिबुद्धः सर्वविदिति॥',
      ],
      'जहाँ लोक, लोक नहीं; देवता, देवता नहीं; वेद, वेद नहीं; यज्ञ, यज्ञ नहीं; माता, माता नहीं; पिता, पिता नहीं; पुत्रवधू, पुत्रवधू नहीं; चाण्डाल, चाण्डाल नहीं; पौल्कस, पौल्कस नहीं; श्रमण, श्रमण नहीं; पशु, पशु नहीं; तपस्वी, तपस्वी नहीं — वहाँ एक ही निर्वाण-रूप परब्रह्म प्रकाशित होता है। वहाँ देवता, ऋषि और पितर शासन नहीं करते; (वहाँ स्थित पुरुष) जाग्रत् (प्रबुद्ध) और सर्वज्ञ है।',
      'Where worlds are no worlds, gods no gods, Vedas no Vedas, sacrifices no sacrifices, mother no mother, father no father, daughter-in-law no daughter-in-law, the caṇḍāla no caṇḍāla, the paulkasa no paulkasa, the monk no monk, beasts no beasts, the ascetic no ascetic — there the one supreme Brahman alone shines, as nirvāṇa. There gods, sages and ancestors hold no sway; (the one abiding there) is awakened and all-knowing.'
    ),
    M(
      [
        'हृदिस्था देवताः सर्वा हृदि प्राणाः प्रतिष्ठिताः।',
        'हृदि प्राणश्च ज्योतिश्च त्रिवृत्सूत्रं च तद्विदुः।',
        'हृदि चैतन्ये तिष्ठति॥',
      ],
      'सब देवता हृदय में स्थित हैं, प्राण हृदय में प्रतिष्ठित हैं। हृदय में प्राण और ज्योति हैं; (ज्ञानी) उसी को त्रिवृत् (तीन लड़ों वाला) सूत्र जानते हैं। वह हृदय में, चैतन्य में स्थित है।',
      'All the gods dwell in the heart; in the heart the life-breaths are established. In the heart are prāṇa and light; the wise know that as the threefold thread. It abides in the heart, in consciousness.'
    ),
    M(
      [
        'यज्ञोपवीतं परमं पवित्रं प्रजापतेर्यत्सहजं पुरस्तात्।',
        'आयुष्यमग्र्यं प्रतिमुञ्च शुभ्रं यज्ञोपवीतं बलमस्तु तेजः॥',
      ],
      'यज्ञोपवीत परम पवित्र है, जो आदि में प्रजापति के साथ ही उत्पन्न हुआ था। आयु देने वाले, श्रेष्ठ, शुभ्र यज्ञोपवीत को धारण करो; यह बल और तेज हो।',
      'The sacred thread is supremely pure; it was born of old together with Prajāpati. Put on the bright, foremost thread that gives long life; may it be strength and splendour.'
    ),
    M(
      ['सशिखं वपनं कृत्वा बहिःसूत्रं त्यजेद्बुधः।', 'यदक्षरं परं ब्रह्म तत्सूत्रमिति धारयेत्॥'],
      'ज्ञानी शिखा-सहित मुण्डन कराकर बाहरी सूत्र को त्याग दे; जो अक्षर परब्रह्म है, उसी को सूत्र मानकर धारण करे।',
      'Having shaved the head together with the tuft, the wise should give up the outer thread; he should wear as his thread the imperishable, supreme Brahman.'
    ),
    M(
      ['सूचनात्सूत्रमित्याहुः सूत्रं नाम परं पदम्।', 'तत्सूत्रं विदितं येन स विप्रो वेदपारगः॥'],
      '(परम तत्त्व को) सूचित करने के कारण इसे सूत्र कहते हैं; सूत्र ही परम पद है। जिसने उस सूत्र को जान लिया, वही विप्र वेदों का पारगामी है।',
      'It is called sūtra because it points out (sūcana); the sūtra is the supreme state. He who has known that sūtra is the true brāhmaṇa, one who has crossed to the far shore of the Vedas.'
    ),
    M(
      ['येन सर्वमिदं प्रोतं सूत्रे मणिगणा इव।', 'तत्सूत्रं धारयेद्योगी योगवित्तत्त्वदर्शिवान्॥'],
      'जिसमें यह सब वैसे ही पिरोया हुआ है जैसे धागे में मणियाँ, उस सूत्र को योगवेत्ता, तत्त्वदर्शी योगी धारण करे।',
      'That in which all this is strung like gems upon a thread — that thread the yogin should wear, knowing yoga and seeing the truth.'
    ),
    M(
      [
        'बहिःसूत्रं त्यजेद्विद्वान्योगमुत्तममास्थितः।',
        'ब्रह्मभावमिदं सूत्रं धारयेद्यः स चेतनः।',
        'धारणात्तस्य सूत्रस्य नोच्छिष्टो नाशुचिर्भवेत्॥',
      ],
      'उत्तम योग में स्थित विद्वान् बाहरी सूत्र का त्याग करे। जो ब्रह्मभाव-रूप इस सूत्र को धारण करता है, वही चेतन (ज्ञानी) है। उस सूत्र को धारण करने से वह न उच्छिष्ट (अशुद्ध) होता है, न अपवित्र।',
      'The wise man established in the highest yoga should give up the outer thread. He who wears this thread that is the state of Brahman is the truly conscious one. By wearing that thread he is never defiled, never impure.'
    ),
    M(
      ['सूत्रमन्तर्गतं येषां ज्ञानयज्ञोपवीतिनाम्।', 'ते वै सूत्रविदो लोके ते च यज्ञोपवीतिनः॥'],
      'जिन ज्ञान-रूपी यज्ञोपवीत धारण करने वालों का सूत्र भीतर है, वे ही लोक में सूत्र के ज्ञाता हैं और वे ही (सच्चे) यज्ञोपवीतधारी हैं।',
      'Those whose thread is within, who wear the sacred thread of knowledge — they alone in the world know the thread, and they alone truly wear it.'
    ),
    M(
      ['ज्ञानशिखिनो ज्ञाननिष्ठा ज्ञानयज्ञोपवीतिनः।', 'ज्ञानमेव परं तेषां पवित्रं ज्ञानमुच्यते॥'],
      'ज्ञान ही जिनकी शिखा है, जो ज्ञान में निष्ठ हैं, ज्ञान ही जिनका यज्ञोपवीत है — उनके लिए ज्ञान ही परम है; ज्ञान ही पवित्र कहा जाता है।',
      'Those whose tuft is knowledge, who are grounded in knowledge, whose sacred thread is knowledge — for them knowledge alone is supreme; knowledge is called the purifier.'
    ),
    M(
      ['अग्नेरिव शिखा नान्या यस्य ज्ञानमयी शिखा।', 'स शिखीत्युच्यते विद्वानितरे केशधारिणः॥'],
      'अग्नि की शिखा (लौ) के समान जिसकी ज्ञानमयी शिखा है, अन्य नहीं — वही विद्वान् शिखाधारी कहलाता है; दूसरे तो केवल बाल धारण करने वाले हैं।',
      'He whose tuft is made of knowledge, like the flame of fire, and none other — that wise man is called the one with the tuft; the others merely wear hair.'
    ),
    M(
      ['कर्मण्यधिकृता ये तु वैदिके ब्राह्मणादयः।', 'तैः सन्धार्यमिदं सूत्रं क्रियाङ्गं तद्धि वै स्मृतम्॥'],
      'किन्तु जो ब्राह्मण आदि वैदिक कर्म के अधिकारी हैं, उन्हें यह (बाहरी) सूत्र धारण करना चाहिये, क्योंकि यह कर्म का अंग माना गया है।',
      'But the brāhmaṇas and others who are entitled to Vedic ritual should wear this (outer) thread, for it is held to be a limb of the rite.'
    ),
    M(
      ['शिखा ज्ञानमयी यस्य उपवीतं च तन्मयम्।', 'ब्राह्मण्यं सकलं तस्य इति ब्रह्मविदो विदुः॥'],
      'जिसकी शिखा ज्ञानमयी है और यज्ञोपवीत भी ज्ञानमय है, उसी का ब्राह्मणत्व पूर्ण है — ऐसा ब्रह्मवेत्ता जानते हैं।',
      'He whose tuft is made of knowledge, and whose thread is made of the same — his brāhmaṇahood is complete; so the knowers of Brahman know.'
    ),
    M(
      ['इदं यज्ञोपवीतं तु परमं यत्परायणम्।', 'स विद्वान्यज्ञोपवीती स्यात्स यज्ञस्तं यज्विनं विदुः॥'],
      'यह (ज्ञान-रूप) यज्ञोपवीत ही परम है, जो परम आश्रय है। (इसे धारण करने वाला) विद्वान् ही यज्ञोपवीतधारी है; वही यज्ञ है, उसी को यज्ञकर्ता जानते हैं।',
      'This sacred thread (of knowledge) is supreme, the highest refuge. The wise man (who wears it) is the true wearer of the thread; he is the sacrifice, and him they know as the sacrificer.'
    ),
    M(
      [
        'एको देवः सर्वभूतेषु गूढः सर्वव्यापी सर्वभूतान्तरात्मा।',
        'कर्माध्यक्षः सर्वभूताधिवासः साक्षी चेता केवलो निर्गुणश्च॥',
      ],
      'एक ही देव सब प्राणियों में छिपा हुआ है — सर्वव्यापी, सब प्राणियों का अन्तरात्मा, कर्मों का अध्यक्ष, सब प्राणियों में बसने वाला, साक्षी, चेतन, केवल (अद्वितीय) और निर्गुण।',
      'The one God, hidden in all beings, all-pervading, the inner Self of all beings, overseer of all deeds, dwelling in all beings, the witness, pure consciousness, alone and beyond qualities.'
    ),
    M(
      [
        'एको मनीषी निष्क्रियाणां बहूनामेकं बीजं बहुधा यः करोति।',
        'तमात्मस्थं येऽनुपश्यन्ति धीरास्तेषां शान्तिः शाश्वती नेतरेषाम्॥',
      ],
      'जो एक ही मनीषी (सर्वज्ञ) अनेक निष्क्रिय (जीवों) के एक ही बीज को अनेक रूपों में करता है, उसे जो धीर पुरुष अपने भीतर स्थित देखते हैं, उन्हीं को शाश्वत शान्ति मिलती है, दूसरों को नहीं।',
      'The one wise Being who makes the single seed of the many actionless ones manifold — the steadfast who see him abiding in themselves, theirs is eternal peace, not others\'.'
    ),
    M(
      ['आत्मानमरणिं कृत्वा प्रणवं चोत्तरारणिम्।', 'ध्याननिर्मथनाभ्यासाद्देवं पश्येन्निगूढवत्॥'],
      'अपने को (नीचे की) अरणि और प्रणव को ऊपर की अरणि बनाकर, ध्यान-रूपी मन्थन के अभ्यास से छिपे हुए (अग्नि) के समान (हृदय में छिपे) देव का दर्शन करे।',
      'Making oneself the lower fire-stick and the praṇava the upper, by the practice of the churning of meditation one should see the God as one sees the hidden (fire).'
    ),
    M(
      ['तिलेषु तैलं दधनीव सर्पिरापः स्रोतःस्वरणीषु चाग्निः।', 'एवमात्मात्मनि गृह्यतेऽसौ सत्येनैनं तपसा योऽनुपश्यति॥'],
      'जैसे तिलों में तेल, दही में घी, स्रोतों में जल और अरणियों में अग्नि (छिपे रहते हैं), वैसे ही वह आत्मा अपने भीतर (बुद्धि में) उसी के द्वारा ग्रहण किया जाता है जो सत्य और तप से उसे निरन्तर देखता है।',
      'As oil in sesame seeds, butter in curd, water in hidden springs and fire in the fire-sticks, so is this Self grasped within oneself by one who beholds it through truth and austerity.'
    ),
    M(
      ['ऊर्णनाभिर्यथा तन्तून्सृजते संहरत्यपि।', 'जाग्रत्स्वप्ने तथा जीवो गच्छत्यागच्छते पुनः॥'],
      'जैसे मकड़ी तन्तुओं को रचती है और समेट भी लेती है, वैसे ही जीव जाग्रत् और स्वप्न में बार-बार जाता और आता है।',
      'As the spider puts forth its threads and draws them in again, so the individual self goes out into waking and dream and comes back again.'
    ),
    M(
      ['नेत्रस्थं जागरितं विद्यात्कण्ठे स्वप्नं समाविशेत्।', 'सुषुप्तं हृदयस्थं तु तुरीयं मूर्ध्नि संस्थितम्॥'],
      'जाग्रत् को नेत्रों में स्थित जाने, स्वप्न कण्ठ में प्रवेश करता है, सुषुप्ति हृदय में स्थित है और तुरीय मूर्धा में स्थित है।',
      'Know waking as seated in the eyes; dream enters the throat; deep sleep abides in the heart; and the fourth is established in the crown of the head.'
    ),
    M(
      ['यतो वाचो निवर्तन्ते अप्राप्य मनसा सह।', 'आनन्दमेतज्जीवस्य यज्ज्ञात्वा मुच्यते बुधः॥'],
      'जहाँ से मन सहित वाणी उसे न पाकर लौट आती है — वह जीव का आनन्द (स्वरूप) है, जिसे जानकर ज्ञानी मुक्त हो जाता है।',
      'That from which words turn back, together with the mind, failing to reach it — that is the bliss of the individual self; knowing it, the wise are freed.'
    ),
    M(
      ['सर्वव्यापिनमात्मानं क्षीरे सर्पिरिवार्पितम्।', 'आत्मविद्यातपोमूलं तद्ब्रह्मोपनिषत्परं तद्ब्रह्मोपनिषत्परमिति॥'],
      'दूध में घी के समान (सबमें) व्याप्त सर्वव्यापी आत्मा को (जाने), जो आत्मविद्या और तप का मूल है — वही उपनिषद् में वर्णित परम ब्रह्म है, वही उपनिषद् में वर्णित परम ब्रह्म है।',
      'The all-pervading Self, present in everything like butter in milk, rooted in self-knowledge and austerity — that is the supreme Brahman taught by the Upaniṣad; that is the supreme Brahman taught by the Upaniṣad.'
    ),
  ],
};

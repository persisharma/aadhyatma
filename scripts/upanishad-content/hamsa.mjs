/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Haṃsa — Śukla Yajurveda, Yoga group. Eleven mantras: three dialogue verses
 * (Gautama asks, Sanatkumāra answers with what Śiva told Pārvatī), then prose
 * on the haṃsa-vidyā, the ajapā mantra, the eight-petalled heart lotus and
 * the ten nādas.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'hamsa',
  muktika: 15,
  vedaHi: 'शुक्ल यजुर्वेद',
  vedaEn: 'Shukla Yajurveda',
  source: {
    baseText:
      'Śukla Yajurveda recension as printed in the Adyar Library "Yoga Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Yoga Upaniṣads (ed. A. Mahadeva Sastri, 1920); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/hamsa.html',
      'https://www.wisdomlib.org/hinduism/book/hamsa-upanishad',
      'https://archive.org/details/YogaUpanishads',
    ],
    notes:
      '11 mantras: 1–3 the Gautama–Sanatkumāra verses; 4 the haṃsa/paramahaṃsa teaching and the ascent through the cakras; 5 the ṛṣi-chandas-devatā-nyāsa of the ajapā mantra and the meditation on the haṃsa in the heart lotus; 6 the eight petals and the four states; 7 the ajapā-upasaṃhāra and the ten nādas; 8–10 the fruits of the nādas (verse); 11 the dissolution of mind and the closing. The Yajurvedic śānti-pāṭha (पूर्णमदः) is page 1. The obscure clause पश्यत्यनागारश्च शिष्टोभयपार्श्वे भवतः found in some prints of mantra 5 is left out. Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition (including the mantra division) is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।', 'पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (परब्रह्म) पूर्ण है, यह (जगत्) भी पूर्ण है; पूर्ण से ही पूर्ण प्रकट होता है। पूर्ण में से पूर्ण को निकाल लेने पर भी पूर्ण ही शेष रहता है। ॐ शान्तिः शान्तिः शान्तिः।',
    'That is full; this is full. From the full, the full arises. Taking the full from the full, the full alone remains. Om, peace, peace, peace.'
  ),
  mantras: [
    M(
      ['गौतम उवाच।', 'भगवन्सर्वधर्मज्ञ सर्वशास्त्रविशारद।', 'ब्रह्मविद्याप्रबोधो हि केनोपायेन जायते॥'],
      'गौतम ने कहा — "हे भगवन्! आप सब धर्मों के ज्ञाता और सब शास्त्रों में निपुण हैं। (बताइये कि) ब्रह्मविद्या का बोध किस उपाय से होता है?"',
      'Gautama said: "Revered one, knower of every dharma, master of every scripture — by what means does the awakening of the knowledge of Brahman arise?"'
    ),
    M(
      ['सनत्कुमार उवाच।', 'विचार्य सर्ववेदेषु मतं ज्ञात्वा पिनाकिनः।', 'पार्वत्या कथितं तत्त्वं शृणु गौतम तन्मम॥'],
      'सनत्कुमार ने कहा — "हे गौतम! सब वेदों में विचार करके और पिनाकधारी (शिव) के मत को जानकर (मैं कहता हूँ)। (शिव ने) पार्वती से जो तत्त्व कहा था, उसे मुझसे सुनो।"',
      'Sanatkumāra said: "Having searched through all the Vedas and learnt the view of the Bearer of the Pināka (Śiva), hear from me, Gautama, the truth he told Pārvatī."'
    ),
    M(
      ['अनाख्येयमिदं गुह्यं योगिने कोशसंनिभम्।', 'हंसस्याकृतिविस्तारं भुक्तिमुक्तिफलप्रदम्॥'],
      'यह रहस्य (सर्वसाधारण से) कहने योग्य नहीं है; योगी के लिए यह खज़ाने के समान है — हंस के स्वरूप का यह विस्तार भोग और मोक्ष दोनों का फल देने वाला है।',
      'This secret is not to be told (to all); for the yogin it is like a treasure — this unfolding of the form of the Haṃsa, which yields both enjoyment and liberation.'
    ),
    M(
      [
        'अथ हंसपरमहंसनिर्णयं व्याख्यास्यामः।',
        'ब्रह्मचारिणे शान्ताय दान्ताय गुरुभक्ताय।',
        'हंसहंसेति सदा ध्यायन्।',
        'सर्वेषु देहेषु व्याप्य वर्तते।',
        'यथा ह्यग्निः काष्ठेषु तिलेषु तैलमिव तं विदित्वा मृत्युमत्येति।',
        'गुदमवष्टभ्याधाराद्वायुमुत्थाप्य स्वाधिष्ठानं त्रिः प्रदक्षिणीकृत्य मणिपूरकं च गत्वा अनाहतमतिक्रम्य विशुद्धौ प्राणान्निरुध्याज्ञामनुध्यायन्ब्रह्मरन्ध्रं ध्यायन्त्रिमात्रोऽहमित्येवं सर्वदा पश्यत्यनाकारश्च भवति।',
        'एषोऽसौ परमहंसो भानुकोटिप्रतीकाशो येनेदं सर्वं व्याप्तम्॥',
      ],
      'अब हम हंस और परमहंस का निर्णय (विवेचन) कहेंगे। (यह) ब्रह्मचारी, शान्त, जितेन्द्रिय और गुरुभक्त (शिष्य) को (देना चाहिये)। "हंस, हंस" — यों सदा ध्यान करता हुआ (साधक जाने कि वह हंस) सब देहों में व्याप्त होकर स्थित है — जैसे अग्नि काष्ठ में और तेल तिलों में; उसे जानकर वह मृत्यु को पार कर जाता है। गुदा को दबाकर (संकुचित करके) मूलाधार से वायु को उठाकर, स्वाधिष्ठान की तीन बार प्रदक्षिणा करके, मणिपूर में जाकर, अनाहत को लाँघकर, विशुद्ध (चक्र) में प्राणों को रोककर, आज्ञा (चक्र) का ध्यान करते हुए, ब्रह्मरन्ध्र का ध्यान करते हुए "मैं त्रिमात्र (ॐ) हूँ" — ऐसा सदा देखता है और निराकार हो जाता है। यही वह परमहंस है, जो करोड़ों सूर्यों के समान प्रकाशमान है और जिससे यह सब व्याप्त है।',
      'Now we shall set out the discernment of the haṃsa and the paramahaṃsa. (It is to be given) to a student who is celibate, calm, self-controlled and devoted to the teacher. Meditating always on "haṃsa, haṃsa", (one knows that) it abides pervading all bodies, as fire in wood and oil in sesame; knowing it, one passes beyond death. Contracting the anus, raising the breath from the mūlādhāra, circling the svādhiṣṭhāna three times, going to the maṇipūra, passing beyond the anāhata, restraining the breaths in the viśuddha, meditating on the ājñā and on the brahmarandhra, one always sees "I am the three-measured (Om)" — and becomes formless. This is that paramahaṃsa, radiant as ten million suns, by whom all this is pervaded.'
    ),
    M(
      [
        'अथो हंस ऋषिः।',
        'अव्यक्ता गायत्री छन्दः।',
        'परमहंसो देवता।',
        'हमिति बीजम्।',
        'स इति शक्तिः।',
        'सोऽहमिति कीलकम्।',
        'षट्संख्यया अहोरात्रयोरेकविंशतिसहस्राणि षट्शतान्यधिकानि भवन्ति।',
        'सूर्याय सोमाय निरञ्जनाय निराभासाय तनु सूक्ष्मं प्रचोदयादिति अग्नीषोमाभ्यां वौषट् हृदयाद्यङ्गन्यासकरन्यासौ भवतः।',
        'एवं कृत्वा हृदयेऽष्टदले हंसात्मानं ध्यायेत्।',
        'अग्नीषोमौ पक्षावोङ्कारः शिरो बिन्दुस्तु नेत्रं मुखं रुद्रो रुद्राणी चरणौ बाहू कालश्चाग्निश्चोभे पार्श्वे भवतः।',
        'एषोऽसौ परमहंसो भानुकोटिप्रतीकाशो येनेदं व्याप्तम्॥',
      ],
      'अब (इस अजपा मन्त्र का) ऋषि हंस है, छन्द अव्यक्त गायत्री है, देवता परमहंस है, "हं" बीज है, "स" शक्ति है, "सोऽहम्" कीलक है। (छह चक्रों की) छह संख्या के अनुसार दिन-रात में (यह श्वास-जप) इक्कीस हज़ार छह सौ होता है। "सूर्य के लिए, सोम के लिए, निरञ्जन के लिए, निराभास के लिए — (वह) सूक्ष्म (बुद्धि) को प्रेरित करे; अग्नि और सोम के लिए वौषट्" — (इन मन्त्रों से) हृदय आदि अंगन्यास और करन्यास होते हैं। ऐसा करके हृदय के अष्टदल कमल में हंस-रूप आत्मा का ध्यान करे। अग्नि और सोम उसके दो पंख हैं, ओंकार सिर है, बिन्दु नेत्र है, रुद्र मुख है, रुद्राणी चरण हैं, और काल तथा अग्नि उसकी दोनों भुजाएँ और दोनों पार्श्व हैं। यही वह परमहंस है, जो करोड़ों सूर्यों के समान प्रकाशमान है और जिससे यह (सब) व्याप्त है।',
      'Now: of this (ajapā mantra) the seer is Haṃsa, the metre the unmanifest Gāyatrī, the deity Paramahaṃsa; "haṃ" is the seed, "sa" the power, "so\'ham" the pin. Counted by sixes (through the six centres), in a day and night (the breaths) number twenty-one thousand six hundred. With "To the Sun, to the Moon, to the Stainless, to the Unreflected — may the subtle be impelled; to Agni and Soma, vauṣaṭ", the placings on the heart and other limbs and on the hands are made. Having done so, one should meditate on the Self as the haṃsa in the eight-petalled lotus of the heart. Agni and Soma are its wings, Oṃkāra its head, the bindu its eye, Rudra its mouth, Rudrāṇī its feet; Time and Fire are its two arms and its two sides. This is that paramahaṃsa, radiant as ten million suns, by whom this is pervaded.'
    ),
    M(
      [
        'तस्याष्टधा वृत्तिर्भवति।',
        'पूर्वदले पुण्ये मतिः।',
        'आग्नेये निद्रालस्यादयो भवन्ति।',
        'याम्ये क्रौर्ये मतिः।',
        'नैरृते पापे मनीषा।',
        'वारुण्यां क्रीडा।',
        'वायव्ये गमनादौ बुद्धिः।',
        'सौम्ये रतिप्रीतिः।',
        'ईशाने द्रव्यादानम्।',
        'मध्ये वैराग्यम्।',
        'केसरे जाग्रदवस्था।',
        'कर्णिकायां स्वप्नम्।',
        'लिङ्गे सुषुप्तिः।',
        'पद्मत्यागे तुरीयम्॥',
      ],
      'उस (हंस) की वृत्ति आठ प्रकार की होती है। (जब वह) पूर्व दल में (होता है तब) पुण्य में बुद्धि होती है; आग्नेय (दक्षिण-पूर्व) दल में निद्रा, आलस्य आदि होते हैं; याम्य (दक्षिण) में क्रूरता में बुद्धि होती है; नैर्ऋत्य (दक्षिण-पश्चिम) में पाप में मन जाता है; वारुण (पश्चिम) में क्रीड़ा (की इच्छा); वायव्य (उत्तर-पश्चिम) में चलने-फिरने आदि में बुद्धि; सौम्य (उत्तर) में रति और प्रीति; ईशान (उत्तर-पूर्व) में द्रव्य-ग्रहण (की इच्छा); मध्य में वैराग्य होता है। केसर में जाग्रत् अवस्था, कर्णिका में स्वप्न, लिङ्ग (बीज-कोष) में सुषुप्ति, और कमल को छोड़ देने पर तुरीय (अवस्था) होती है।',
      'Its movement is eightfold. In the eastern petal the mind turns to merit; in the south-eastern arise sleep, sloth and the like; in the southern the mind turns to cruelty; in the south-western the thought turns to sin; in the western, to play; in the north-western, the mind turns to going about; in the northern, to love and pleasure; in the north-eastern, to acquiring wealth; in the centre, dispassion. In the filaments is the waking state; in the pericarp, dream; in the seed-vessel, deep sleep; on leaving the lotus, the fourth (turīya).'
    ),
    M(
      [
        'यदा हंसो नादे लीनो भवति तत्तुरीयातीतम्।',
        'उन्मननमजपोपसंहारमित्यभिधीयते।',
        'एवं सर्वं हंसवशात्तस्मान्मनो हंसो विचार्यते।',
        'स एव जपकोट्या नादमनुभवति।',
        'एवं सर्वं हंसवशान्नादो दशविधो जायते।',
        'चिणीति प्रथमः।',
        'चिञ्चिणीति द्वितीयः।',
        'घण्टानादस्तृतीयः।',
        'शङ्खनादश्चतुर्थः।',
        'पञ्चमस्तन्त्रीनादः।',
        'षष्ठस्तालनादः।',
        'सप्तमो वेणुनादः।',
        'अष्टमो मृदङ्गनादः।',
        'नवमो भेरीनादः।',
        'दशमो मेघनादः।',
        'नवमं परित्यज्य दशममेवाभ्यसेत्॥',
      ],
      'जब हंस नाद में लीन हो जाता है, तब वह तुरीयातीत (अवस्था) है; उसे उन्मनी (मन से परे की अवस्था) और अजपा का उपसंहार कहा जाता है। इस प्रकार सब कुछ हंस के अधीन है; इसलिए मन को ही हंस समझा जाता है। वही (साधक) करोड़ों जप के द्वारा नाद का अनुभव करता है। इस प्रकार सब (कुछ) हंस के वश से होने के कारण नाद दस प्रकार का प्रकट होता है — पहला "चिणी", दूसरा "चिञ्चिणी", तीसरा घण्टा का नाद, चौथा शंख का नाद, पाँचवाँ तन्त्री (वीणा) का नाद, छठा ताल (करताल) का नाद, सातवाँ बाँसुरी का नाद, आठवाँ मृदंग का नाद, नौवाँ भेरी (नगाड़े) का नाद और दसवाँ मेघ-गर्जन का नाद। नौवें को छोड़कर दसवें का ही अभ्यास करे।',
      'When the haṃsa is dissolved in the nāda, that is beyond the fourth; it is called the state beyond mind (unmanī) and the withdrawal of the ajapā. Thus, since all this is under the sway of the haṃsa, the mind itself is considered the haṃsa. Through ten million repetitions one experiences the nāda. Thus, all being under the sway of the haṃsa, the nāda arises in ten kinds: the first "ciṇī", the second "ciñciṇī", the third the sound of a bell, the fourth of a conch, the fifth of a stringed instrument, the sixth of cymbals, the seventh of a flute, the eighth of a mṛdaṅga, the ninth of a kettledrum, the tenth of thunder. Leaving aside the ninth, one should practise the tenth alone.'
    ),
    M(
      ['प्रथमे चिञ्चिणीगात्रं द्वितीये गात्रभञ्जनम्।', 'तृतीये खेदनं याति चतुर्थे कम्पते शिरः॥'],
      'पहले (नाद) में शरीर में झनझनाहट होती है, दूसरे में शरीर टूटता-सा (अंग ढीले) लगता है, तीसरे में (शरीर) पसीने से भीग जाता है, चौथे में सिर काँपने लगता है।',
      'With the first, the body tingles; with the second, the limbs seem to break; with the third, one breaks into sweat; with the fourth, the head trembles.'
    ),
    M(
      ['पञ्चमे स्रवते तालु षष्ठेऽमृतनिषेवणम्।', 'सप्तमे गूढविज्ञानं परा वाचा तथाष्टमे॥'],
      'पाँचवें में तालु से (रस) स्रवित होता है, छठे में अमृत का पान होता है, सातवें में गूढ़ (रहस्यमय) ज्ञान होता है, और आठवें में परा वाणी (प्राप्त होती है)।',
      'With the fifth, the palate flows; with the sixth, one partakes of nectar; with the seventh comes hidden knowledge; and with the eighth, the supreme speech (parā vāk).'
    ),
    M(
      ['अदृश्यं नवमे देहं दिव्यं चक्षुस्तथामलम्।', 'दशमं परमं ब्रह्म भवेद्ब्रह्मात्मसंनिधौ॥'],
      'नौवें में शरीर अदृश्य हो जाता है और निर्मल दिव्य दृष्टि (प्राप्त होती है)। दसवें में ब्रह्म और आत्मा की एकता (सन्निधि) में वह परम ब्रह्म ही हो जाता है।',
      'With the ninth, the body becomes invisible and the divine eye becomes clear; with the tenth, in the presence of Brahman as the Self, one becomes the supreme Brahman.'
    ),
    M(
      [
        'तस्मिन्मनो विलीयते मनसि सङ्कल्पविकल्पे दग्धे पुण्यपापे सदाशिवः शक्त्यात्मा सर्वत्रावस्थितः स्वयंज्योतिः शुद्धो बुद्धो नित्यो निरञ्जनः शान्तः प्रकाशत इति।',
        'वेदप्रवचनं भवतीत्युपनिषत्॥',
      ],
      'उस (परम ब्रह्म) में मन विलीन हो जाता है। मन में (उठने वाले) संकल्प-विकल्प तथा पुण्य और पाप के दग्ध हो जाने पर, शक्ति-स्वरूप, सर्वत्र स्थित, स्वयंप्रकाश, शुद्ध, बुद्ध, नित्य, निरञ्जन, शान्त सदाशिव प्रकाशित होते हैं। यही वेद का उपदेश है — यह उपनिषद् है।',
      'In That the mind dissolves. When, in the mind, intention and doubt, and merit and sin, are burnt away, Sadāśiva shines forth — one with Śakti, present everywhere, self-luminous, pure, awake, eternal, stainless, at peace. This is the teaching of the Veda — thus the Upaniṣad.'
    ),
  ],
};

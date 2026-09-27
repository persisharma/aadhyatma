/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Paramahaṃsa — Śukla Yajurveda, Saṃnyāsa group. Four prose sections, one
 * mantra each (4 in all), cited section.1. Nārada asks Bhagavān about the path
 * of the paramahaṃsa yogins; the answer covers their renunciation, their inner
 * sign and thread, the staff of knowledge, the ban on gold, and the closing
 * realisation "I am Brahman".
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'paramahamsa',
  muktika: 19,
  vedaHi: 'शुक्ल यजुर्वेद',
  vedaEn: 'Shukla Yajurveda',
  source: {
    baseText:
      'Śukla Yajurveda recension as printed in the Adyar Library "Saṃnyāsa Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Saṃnyāsa Upaniṣads (ed. F. Otto Schrader, 1912); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/paramahamsa.html',
      'https://www.wisdomlib.org/hinduism/book/paramahamsa-upanishad',
      'https://archive.org/details/SamnyasaUpanishads',
    ],
    notes:
      'Four sections of 1 · 1 · 1 · 1 = 4 mantras: each section is a single numbered paragraph in the printed text, kept whole here and split into lines at sentence boundaries (1 Nārada’s question and the paramahaṃsa’s renunciation; 2 his conduct beyond the pairs of opposites, and Brahman as his true tuft, thread and sandhyā; 3 the verses on the staff of knowledge versus the wooden staff; 4 his freedom from rites and possessions, the prohibition on gold, and the closing “I am Brahman”). The Yajurvedic śānti-pāṭha (पूर्णमदः) is page 1. Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।', 'पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (परब्रह्म) पूर्ण है, यह (जगत्) भी पूर्ण है; पूर्ण से ही पूर्ण प्रकट होता है। पूर्ण में से पूर्ण को निकाल लेने पर भी पूर्ण ही शेष रहता है। ॐ शान्तिः शान्तिः शान्तिः।',
    'That is full; this is full. From the full, the full arises. Taking the full from the full, the full alone remains. Om, peace, peace, peace.'
  ),
  khandas: [
    // ── Section 1 — Nārada’s question; the paramahaṃsa’s renunciation ─────
    [
      M(
        [
          'अथ योगिनां परमहंसानां कोऽयं मार्गस्तेषां का स्थितिरिति नारदो भगवन्तमुपगत्योवाच।',
          'तं भगवानाह।',
          'योऽयं परमहंसमार्गो लोके दुर्लभतरो न तु बाहुल्यो यद्येको भवति स एव नित्यपूतस्थः स एव वेदपुरुष इति विदुषो मन्यन्ते।',
          'महापुरुषो यच्चित्तं तत्सर्वदा मय्येवावतिष्ठते तस्मादहं च तस्मिन्नेवावस्थीयते।',
          'असौ स्वपुत्रमित्रकलत्रबन्ध्वादीञ्छिखायज्ञोपवीते स्वाध्यायं च सर्वकर्माणि संन्यस्यायं ब्रह्माण्डं च हित्वा कौपीनं दण्डमाच्छादनं च स्वशरीरोपभोगार्थाय च लोकस्योपकारार्थाय च परिग्रहेत्।',
          'तच्च न मुख्योऽस्ति।',
          'कोऽयं मुख्य इति चेदयं मुख्यः॥',
        ],
        'नारद भगवान् (ब्रह्मा) के पास जाकर बोले — "योगी परमहंसों का यह मार्ग क्या है और उनकी स्थिति कैसी होती है?" भगवान् ने उनसे कहा — "यह जो परमहंस-मार्ग है, वह संसार में अत्यन्त दुर्लभ है, बहुतों को प्राप्त नहीं होता; यदि कोई एक भी (ऐसा) होता है, तो वही नित्य पवित्रता में स्थित है, वही वेदपुरुष है — ऐसा विद्वान् मानते हैं। वह महापुरुष है, जिसका चित्त सदा मुझमें ही स्थित रहता है; इसलिए मैं भी उसी में स्थित रहता हूँ। वह अपने पुत्र, मित्र, पत्नी, बन्धु आदि को, शिखा और यज्ञोपवीत को, स्वाध्याय को और सब कर्मों को त्यागकर तथा इस ब्रह्माण्ड (के सब भोगों) को भी छोड़कर, केवल अपने शरीर के निर्वाह के लिए और लोक के उपकार के लिए कौपीन, दण्ड और ओढ़ने का वस्त्र ग्रहण करे। किन्तु वह (भी) मुख्य (अवस्था) नहीं है। यदि पूछो कि मुख्य क्या है, तो यह मुख्य है —"',
        'Nārada approached the Lord (Brahmā) and said: "What is this path of the yogins who are paramahaṃsas, and what is their state?" The Lord said to him: "This path of the paramahaṃsa is very hard to find in the world; it is not for the many. If even one such exists, he alone abides in everlasting purity; he alone is the Person of the Veda — so the wise hold. He is a great soul whose mind rests in Me always, and therefore I too abide in him. Renouncing his sons, friends, wife, kinsmen and the rest, the tuft and the sacred thread, Vedic study and all rites, and giving up this whole universe as well, he may accept a loincloth, a staff and a covering — only to sustain his body and for the good of the world. Yet even that is not the principal (state). If you ask what the principal is, this is the principal:"'
      ),
    ],
    // ── Section 2 — Beyond the opposites; Brahman as tuft, thread, sandhyā ─
    [
      M(
        [
          'न दण्डं न शिखं न यज्ञोपवीतं न चाच्छादनं चरति परमहंसः।',
          'न शीतं न चोष्णं न सुखं न दुःखं न मानावमाने च षडूर्मिवर्ज्यम्।',
          'निन्दागर्वमत्सरदम्भदर्पेच्छाद्वेषसुखदुःखकामक्रोधलोभमोहहर्षासूयाहंकारादींश्च हित्वा स्ववपुः कुणपमिव दृश्यते यतस्तद्वपुरपध्वस्तम्।',
          'संशयविपरीतमिथ्याज्ञानानां यो हेतुस्तेन नित्यनिवृत्तस्तन्नित्यबोधस्तत्स्वयमेवावस्थितिः।',
          'तं शान्तमचलमद्वयानन्दचिद्घन एवाहमस्मि।',
          'तदेव मम परमं धाम तदेव शिखा च तदेवोपवीतं च।',
          'परमात्मात्मनोरेकत्वज्ञानेन तयोर्भेद एव विभग्नः सा संध्या॥',
        ],
        'परमहंस न दण्ड धारण करता है, न शिखा, न यज्ञोपवीत, न ओढ़ने का वस्त्र। उसके लिए न सर्दी है न गर्मी, न सुख न दुःख, न मान न अपमान — वह (भूख-प्यास, शोक-मोह, जरा-मृत्यु — इन) छः ऊर्मियों से रहित है। निन्दा, गर्व, मत्सर, दम्भ, दर्प, इच्छा, द्वेष, सुख, दुःख, काम, क्रोध, लोभ, मोह, हर्ष, असूया, अहंकार आदि को त्यागकर वह अपने शरीर को शव के समान देखता है, क्योंकि वह शरीर (उसके लिए) नष्ट हो चुका है। संशय, विपरीत-ज्ञान और मिथ्या-ज्ञान का जो कारण (अज्ञान) है, उससे वह सदा के लिए निवृत्त है; वह नित्य बोध-स्वरूप है, वह स्वयं अपने में ही स्थित है। (वह अनुभव करता है —) "वह शान्त, अचल, अद्वय, आनन्दमय चैतन्यघन (ब्रह्म) मैं ही हूँ। वही मेरा परम धाम है, वही (मेरी) शिखा है और वही (मेरा) यज्ञोपवीत है।" परमात्मा और आत्मा की एकता के ज्ञान से उन दोनों का भेद ही टूट जाता है — यही (उसकी) सन्ध्या है।',
        'The paramahaṃsa carries no staff, wears no tuft, no sacred thread, no covering. For him there is neither cold nor heat, neither pleasure nor pain, neither honour nor dishonour; he is free of the six waves (hunger and thirst, grief and delusion, old age and death). Having given up censure, pride, envy, hypocrisy, arrogance, desire, hatred, pleasure, pain, lust, anger, greed, delusion, elation, jealousy, egoism and the like, he sees his own body as a corpse, for that body has (for him) been destroyed. He is forever free of that which causes doubt, error and false knowledge; he is ever-awake knowing, abiding in himself alone. (He knows:) "I am That — peaceful, unmoving, non-dual, a mass of bliss and consciousness. That alone is my highest abode; That alone is my tuft, and That alone my sacred thread." By the knowledge of the oneness of the supreme Self and the self, the very distinction between them is shattered — that is his sandhyā (twilight worship).'
      ),
    ],
    // ── Section 3 — The staff of knowledge ────────────────────────────────
    [
      M(
        [
          'सर्वान्कामान्परित्यज्य अद्वैते परमे स्थितिः।',
          'ज्ञानदण्डो धृतो येन एकदण्डी स उच्यते।',
          'काष्ठदण्डो धृतो येन सर्वाशी ज्ञानवर्जितः।',
          'स याति नरकान्घोरान्महारौरवसंज्ञितान्।',
          'इदमन्तरं ज्ञात्वा स परमहंसः॥',
        ],
        'सब कामनाओं को त्यागकर परम अद्वैत (तत्त्व) में स्थित रहना — (यही उसकी स्थिति है)। जिसने ज्ञान-रूपी दण्ड धारण किया है, वही एकदण्डी (संन्यासी) कहलाता है। जिसने (केवल) लकड़ी का दण्ड धारण किया है, जो सब कुछ खाने वाला और ज्ञान से रहित है, वह महारौरव नामक घोर नरकों में जाता है। इस अन्तर को जानकर (जो रहता है) वही परमहंस है।',
        'Abandoning all desires, he abides in the supreme non-dual. He who bears the staff of knowledge is called the true ekadaṇḍin (single-staffed renunciant). He who bears only a staff of wood, eats everything and is devoid of knowledge, goes to the dreadful hells called Mahāraurava. Knowing this difference, he is the paramahaṃsa.'
      ),
    ],
    // ── Section 4 — Beyond rites and gold; the closing ────────────────────
    [
      M(
        [
          'आशाम्बरो न नमस्कारो न स्वाहाकारो न स्वधाकारो न निन्दा न स्तुतिर्यादृच्छिको भवेद्भिक्षुः।',
          'नावाहनं न विसर्जनं न मन्त्रं न ध्यानं नोपासनं च।',
          'न लक्ष्यं नालक्ष्यं न पृथङ् नापृथगहं न त्वं न सर्वं चानिकेतस्थितिरेव स भिक्षुः सौवर्णादीनां नैव परिग्रहेत्।',
          'न लोकं नावलोकनं च।',
          'आबाधकः क इति चेद्बाधकोऽस्त्येव।',
          'यस्माद्भिक्षुर्हिरण्यं रसेन दृष्टं चेत्स ब्रह्महा भवेत्।',
          'यस्माद्भिक्षुर्हिरण्यं रसेन स्पृष्टं चेत्स पौल्कसो भवेत्।',
          'यस्माद्भिक्षुर्हिरण्यं रसेन ग्राह्यं चेत्स आत्महा भवेत्।',
          'तस्माद्भिक्षुर्हिरण्यं रसेन न दृष्टं च न स्पृष्टं च न ग्राह्यं च।',
          'सर्वे कामा मनोगता व्यावर्तन्ते।',
          'दुःखे नोद्विग्नः सुखे निःस्पृहस्त्यागो रागे सर्वत्र शुभाशुभयोरनभिस्नेहो न द्वेष्टि न मोदं च।',
          'सर्वेषामिन्द्रियाणां गतिरुपरमते य आत्मन्येवावस्थीयते।',
          'यत्पूर्णानन्दैकबोधस्तद्ब्रह्माहमस्मीति कृतकृत्यो भवति कृतकृत्यो भवति॥',
        ],
        'दिशाएँ ही उसका वस्त्र हैं; उसके लिए न नमस्कार है, न स्वाहाकार, न स्वधाकार, न निन्दा, न स्तुति — भिक्षु जो कुछ अपने-आप मिल जाए उसी पर रहने वाला हो। (उसके लिए) न आवाहन है, न विसर्जन, न मन्त्र, न ध्यान, न उपासना। न लक्ष्य है न अलक्ष्य, न पृथक् न अपृथक्, न "मैं" न "तुम", न "सब" — बिना किसी घर के रहना ही (उसकी स्थिति) है; वह भिक्षु सोने आदि का कदापि संग्रह न करे। न (इस) लोक (की चिन्ता), न (उसका) अवलोकन। यदि पूछो कि (सोना रखने में) बाधा क्या है, तो बाधा निश्चय ही है। क्योंकि यदि भिक्षु लालसा से सोने को देखे, तो वह ब्रह्महत्यारा हो जाता है; यदि लालसा से उसे छुए, तो वह पौल्कस (चाण्डाल) हो जाता है; यदि लालसा से उसे ग्रहण करे, तो वह आत्मघाती हो जाता है। इसलिए भिक्षु लालसा से सोने को न देखे, न छुए और न ग्रहण करे। (ऐसा करने पर) मन में स्थित सब कामनाएँ लौट जाती हैं। वह दुःख में उद्विग्न नहीं होता, सुख में निःस्पृह रहता है, राग का त्याग करता है, सर्वत्र शुभ और अशुभ में आसक्ति-रहित रहता है; न वह द्वेष करता है, न हर्षित होता है। जो आत्मा में ही स्थित रहता है, उसकी सब इन्द्रियों की गति शान्त हो जाती है। "जो पूर्ण आनन्द-स्वरूप एकमात्र बोध है, वह ब्रह्म मैं हूँ" — ऐसा जानकर वह कृतकृत्य हो जाता है, कृतकृत्य हो जाता है।',
        'The quarters are his clothing. For him there is no bowing, no svāhā, no svadhā, no blame and no praise; the mendicant lives on whatever comes of itself. For him there is no invoking and no dismissing (of deities), no mantra, no meditation, no worship. There is nothing to aim at and nothing not to aim at, nothing separate and nothing not separate, no "I", no "you", no "all" — his only state is to be homeless. Such a mendicant must never take gold or anything of the kind. He has no concern for the world, nor for looking at it. If you ask what harm there is (in gold), harm there certainly is. For if a mendicant looks on gold with longing, he becomes the slayer of a brāhmaṇa; if he touches it with longing, he becomes a paulkasa (outcaste); if he takes it with longing, he becomes a slayer of the Self. Therefore the mendicant must neither look on gold with longing, nor touch it, nor take it. Then all desires lodged in the mind turn back. He is not shaken by sorrow, not hungry for pleasure; he gives up attachment and everywhere is unattached to good and ill; he neither hates nor rejoices. The movement of all the senses comes to rest in him who abides in the Self alone. Knowing "I am that Brahman which is the one awareness of perfect bliss", he has done all that was to be done — he has done all that was to be done.'
      ),
    ],
  ],
};

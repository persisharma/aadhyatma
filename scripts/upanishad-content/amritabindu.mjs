/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Amṛtabindu (also called Brahmabindu) — Kṛṣṇa Yajurveda, Yoga group in this
 * catalogue. Twenty-two verses, undivided: the mind as the sole cause of
 * bondage and liberation, the stilling of the mind in the heart, Brahman
 * beyond thought, the one Self in the three states (the moon in many waters,
 * the space in the pot), sound-Brahman and the supreme Brahman, and the
 * churning out of knowledge like butter from milk; closing with “I am That,
 * Vāsudeva”. Total 22 mantras.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'amritabindu',
  muktika: 20,
  vedaHi: 'कृष्ण यजुर्वेद',
  vedaEn: 'Krishna Yajurveda',
  source: {
    baseText:
      'Kṛṣṇa Yajurveda Amṛtabindu (Brahmabindu) Upaniṣad in 22 verses, as printed in the Ānandāśrama and Gita Press one-hundred-eight Upaniṣad collections; Devanagari written out from the printed text.',
    canonicalEdition: 'Ānandāśrama Sanskrit Series, Upaniṣadāṃ Samuccayaḥ; Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/amritabindu.html',
      'https://www.wisdomlib.org/hinduism/book/amritabindu-upanishad',
      'https://archive.org/details/UpanishadAnk',
    ],
    notes:
      '22 verses, undivided: 1–5 the pure and impure mind, bondage and liberation, and the stilling of the mind in the heart; 6–10 Brahman beyond the thinkable and unthinkable, the use of the syllable, and the highest truth (no dissolution, no origination); 11–15 the one Self in the three states and in all beings (moon in water, space in a pot); 16–18 sound-Brahman and the supreme Brahman, and the discarding of books once knowledge is gained; 19–22 knowledge one like milk, churned out like butter, and the closing identification with Vāsudeva. The Kṛṣṇa-Yajurvedic śānti-pāṭha (सह नाववतु) is page 1. Readings vary between prints in verses 5 (second half), 14 and 15 (शब्दमायावृतो यावत्तावत्तिष्ठति पुष्करे is followed here; some prints read नैव तमसा याति पुष्करे). Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै।', 'तेजस्वि नावधीतमस्तु मा विद्विषावहै॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (ब्रह्म) हम दोनों (गुरु-शिष्य) की साथ-साथ रक्षा करे, हम दोनों का साथ-साथ पालन करे; हम दोनों साथ-साथ सामर्थ्य प्राप्त करें। हमारा पढ़ा हुआ तेजस्वी हो; हम परस्पर द्वेष न करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'May That protect us both together; may That nourish us both together; may we work together with vigour. May what we study be luminous; may we never hate one another. Om, peace, peace, peace.'
  ),
  mantras: [
    M(
      ['मनो हि द्विविधं प्रोक्तं शुद्धं चाशुद्धमेव च।', 'अशुद्धं कामसंकल्पं शुद्धं कामविवर्जितम्॥'],
      'मन दो प्रकार का कहा गया है — शुद्ध और अशुद्ध। कामना के संकल्पों से युक्त मन अशुद्ध है, और कामना से रहित मन शुद्ध है।',
      'The mind is said to be of two kinds, pure and impure. The impure is full of desire and intention; the pure is free of desire.'
    ),
    M(
      ['मन एव मनुष्याणां कारणं बन्धमोक्षयोः।', 'बन्धाय विषयासक्तं मुक्त्यै निर्विषयं स्मृतम्॥'],
      'मनुष्यों के बन्धन और मोक्ष का कारण मन ही है। विषयों में आसक्त मन बन्धन के लिए है, और विषयों से रहित मन मुक्ति के लिए माना गया है।',
      'The mind alone is the cause of bondage and liberation for human beings. Attached to sense-objects it leads to bondage; free of objects it is held to lead to liberation.'
    ),
    M(
      ['यतो निर्विषयस्यास्य मनसो मुक्तिरिष्यते।', 'अतो निर्विषयं नित्यं मनः कार्यं मुमुक्षुणा॥'],
      'क्योंकि विषयों से रहित इस मन की ही मुक्ति मानी जाती है, इसलिए मोक्ष चाहने वाले को अपने मन को सदा विषयों से रहित रखना चाहिए।',
      'Since liberation belongs to the mind that is free of objects, the seeker of liberation should keep the mind ever free of objects.'
    ),
    M(
      ['निरस्तविषयासङ्गं संनिरुद्धं मनो हृदि।', 'यदा यात्युन्मनीभावं तदा तत्परमं पदम्॥'],
      'जब विषयों का संग छोड़कर हृदय में भली-भाँति निरुद्ध किया हुआ मन उन्मनी-भाव (मन से परे की अवस्था) को प्राप्त होता है, तब वही परम पद है।',
      'When the mind, its clinging to objects cast off and wholly restrained in the heart, reaches the state beyond mind (unmanī), that is the supreme state.'
    ),
    M(
      ['तावदेव निरोद्धव्यं यावद्धृदि गतं क्षयम्।', 'एतज्ज्ञानं च मोक्षं च शेषोऽन्यो ग्रन्थविस्तरः॥'],
      'मन को तब तक रोकना चाहिए जब तक वह हृदय में क्षय (लय) को प्राप्त न हो जाए। यही ज्ञान है और यही मोक्ष है; शेष सब तो ग्रन्थों का विस्तार मात्र है।',
      'The mind should be restrained only until it is dissolved in the heart. This is knowledge and this is liberation; all the rest is mere elaboration of books.'
    ),
    M(
      ['नैव चिन्त्यं न चाचिन्त्यं न चिन्त्यं चिन्त्यमेव च।', 'पक्षपातविनिर्मुक्तं ब्रह्म सम्पद्यते तदा॥'],
      'वह न चिन्तन करने योग्य है, न अचिन्त्य है; वह चिन्त्य न होते हुए भी चिन्त्य ही है। जब (साधक) सब पक्षपात (द्वन्द्वों के आग्रह) से मुक्त हो जाता है, तब वह ब्रह्म को प्राप्त होता है।',
      'It is neither to be thought of nor unthinkable; not thinkable, yet thinkable too. Freed from all partiality [between such opposites], one then attains Brahman.'
    ),
    M(
      ['स्वरेण संधयेद्योगमस्वरं भावयेत्परम्।', 'अस्वरेण हि भावेन भावो नाभाव इष्यते॥'],
      'स्वर (ओंकार के उच्चारण) के द्वारा योग का आरम्भ करे, और फिर स्वर से रहित परम (तत्त्व) की भावना करे। स्वर-रहित भावना से ही (परम) सत्ता अभाव नहीं, भाव (सत्य) के रूप में अनुभूत होती है।',
      'Let one join in yoga by means of the sound [of Om], then contemplate the supreme beyond sound. For through contemplation beyond sound, what is realised is being, not non-being.'
    ),
    M(
      ['तदेव निष्कलं ब्रह्म निर्विकल्पं निरञ्जनम्।', 'तद्ब्रह्माहमिति ज्ञात्वा ब्रह्म सम्पद्यते ध्रुवम्॥'],
      'वही अंशरहित, विकल्परहित और निर्मल ब्रह्म है। "वह ब्रह्म मैं हूँ" — ऐसा जानकर (साधक) निश्चय ही ब्रह्म को प्राप्त हो जाता है।',
      'That alone is Brahman, partless, free of all mental constructs, stainless. Knowing “I am that Brahman”, one surely becomes Brahman.'
    ),
    M(
      ['निर्विकल्पमनन्तं च हेतुदृष्टान्तवर्जितम्।', 'अप्रमेयमनादिं च यज्ज्ञात्वा मुच्यते बुधः॥'],
      'जो विकल्परहित, अनन्त, हेतु और दृष्टान्त से परे, अप्रमेय और अनादि है — उसे जानकर ज्ञानी मुक्त हो जाता है।',
      'Free of constructs, infinite, beyond reason and example, immeasurable and beginningless — knowing That, the wise one is liberated.'
    ),
    M(
      ['न निरोधो न चोत्पत्तिर्न बद्धो न च साधकः।', 'न मुमुक्षुर्न वै मुक्त इत्येषा परमार्थता॥'],
      'न प्रलय है, न उत्पत्ति; न कोई बद्ध है, न साधक; न कोई मुमुक्षु है, न मुक्त — यही परमार्थ (परम सत्य) है।',
      'There is no dissolution and no origination, none bound and none striving, none seeking liberation and none liberated — this is the highest truth.'
    ),
    M(
      ['एक एवात्मा मन्तव्यो जाग्रत्स्वप्नसुषुप्तिषु।', 'स्थानत्रयव्यतीतस्य पुनर्जन्म न विद्यते॥'],
      'जाग्रत्, स्वप्न और सुषुप्ति — इन तीनों में एक ही आत्मा को जानना चाहिए। जो इन तीनों अवस्थाओं से परे हो गया है, उसका फिर जन्म नहीं होता।',
      'One Self alone is to be understood in waking, dream and deep sleep. For one who has passed beyond these three states there is no rebirth.'
    ),
    M(
      ['एक एव हि भूतात्मा भूते भूते व्यवस्थितः।', 'एकधा बहुधा चैव दृश्यते जलचन्द्रवत्॥'],
      'एक ही भूतात्मा प्रत्येक प्राणी में स्थित है। जल में (प्रतिबिम्बित) चन्द्रमा की भाँति वह एक रूप में भी और अनेक रूपों में भी दिखाई देता है।',
      'The one Self of beings dwells in each and every being. Like the moon reflected in water, it is seen as one and as many.'
    ),
    M(
      ['घटसंवृतमाकाशं नीयमाने घटे यथा।', 'घटो नीयेत नाकाशं तद्वज्जीवो नभोपमः॥'],
      'जैसे घड़े से घिरा हुआ आकाश — घड़े को ले जाने पर घड़ा ही ले जाया जाता है, आकाश नहीं — वैसे ही आकाश के समान जीव (आत्मा) भी (देह के साथ) नहीं जाता।',
      'When a pot is carried away, the pot is moved, not the space enclosed in it; just so the embodied self, like space, [does not move with the body].'
    ),
    M(
      ['घटवद्विविधाकारं भिद्यमानं पुनः पुनः।', 'तद्भग्ने न च जानाति स जानाति च नित्यशः॥'],
      'घड़े की भाँति विविध आकार (देह) बार-बार टूटते रहते हैं; उनके टूट जाने पर (अज्ञानी) इसे नहीं जानता, पर वह (आत्मा) सदा जानता रहता है।',
      'Forms of many kinds, like pots, are broken again and again; when they break [the ignorant] does not know it, yet He [the Self] knows eternally.'
    ),
    M(
      ['शब्दमायावृतो यावत्तावत्तिष्ठति पुष्करे।', 'भिन्ने तमसि चैकत्वमेक एवानुपश्यति॥'],
      'जब तक (जीव) शब्द-रूपी माया से ढका रहता है, तब तक वह (हृदय-)कमल (रूपी आकाश) में (पृथक् होकर) रहता है। अज्ञान-रूपी अन्धकार के छिन्न होने पर वह एक होकर केवल एकत्व को ही देखता है।',
      'As long as one is veiled by the māyā of sound, one abides [as separate] in the lotus [of the heart]. When the darkness is pierced, being one, one beholds oneness alone.'
    ),
    M(
      ['शब्दाक्षरं परं ब्रह्म तस्मिन्क्षीणे यदक्षरम्।', 'तद्विद्वानक्षरं ध्यायेद्यदीच्छेच्छान्तिमात्मनः॥'],
      'शब्द-रूप अक्षर (ओंकार) परब्रह्म है; उसके क्षीण (शान्त) होने पर जो अक्षर (अविनाशी) शेष रहता है — अपनी शान्ति चाहने वाला विद्वान् उसी अक्षर का ध्यान करे।',
      'The syllable of sound [Om] is the supreme Brahman; when it fades, what remains is the imperishable. The wise one who seeks peace for himself should meditate on that imperishable.'
    ),
    M(
      ['द्वे विद्ये वेदितव्ये तु शब्दब्रह्म परं च यत्।', 'शब्दब्रह्मणि निष्णातः परं ब्रह्माधिगच्छति॥'],
      'दो विद्याएँ जाननी चाहिए — शब्दब्रह्म और जो परब्रह्म है। शब्दब्रह्म में निष्णात (पारंगत) पुरुष परब्रह्म को प्राप्त कर लेता है।',
      'Two knowledges are to be known: Brahman as sound [the Veda] and that which is supreme. One well versed in the Brahman of sound attains the supreme Brahman.'
    ),
    M(
      ['ग्रन्थमभ्यस्य मेधावी ज्ञानविज्ञानतत्परः।', 'पलालमिव धान्यार्थी त्यजेद्ग्रन्थमशेषतः॥'],
      'बुद्धिमान् पुरुष ग्रन्थों का अभ्यास करके ज्ञान और विज्ञान में तत्पर हो जाए; फिर जैसे धान चाहने वाला भूसे को छोड़ देता है, वैसे ही वह ग्रन्थों को पूर्णतः छोड़ दे।',
      'Having studied the books, the intelligent one, intent on knowledge and realisation, should cast the books aside entirely, as one who wants grain throws away the husk.'
    ),
    M(
      ['गवामनेकवर्णानां क्षीरस्याप्येकवर्णता।', 'क्षीरवत्पश्यति ज्ञानं लिङ्गिनस्तु गवां यथा॥'],
      'गौएँ अनेक रंगों की होती हैं, पर उनके दूध का रंग एक ही होता है। ज्ञानी ज्ञान को दूध के समान (एक) देखता है, और (उसके) चिह्न-रूप (उपाधियों) को गौओं के समान (अनेक)।',
      'Cows are of many colours, yet their milk is of one colour. The wise see knowledge as the milk, and the many bearers of forms as the cows.'
    ),
    M(
      ['घृतमिव पयसि निगूढं भूते भूते च वसति विज्ञानम्।', 'सततं मन्थयितव्यं मनसा मन्थानभूतेन॥'],
      'जैसे दूध में घी छिपा रहता है, वैसे ही प्रत्येक प्राणी में विज्ञान (चैतन्य) निवास करता है। मन-रूपी मथानी से उसका निरन्तर मन्थन करना चाहिए।',
      'Like ghee hidden in milk, pure consciousness dwells in every being. It should be churned out constantly, with the mind as the churning stick.'
    ),
    M(
      ['ज्ञाननेत्रं समाधाय चोद्धरेद्वह्निवत्परम्।', 'निष्कलं निश्चलं शान्तं तद्ब्रह्माहमिति स्मृतम्॥'],
      'ज्ञान-रूपी नेत्र (मथानी की रस्सी) को लगाकर, (अरणि-मन्थन से) अग्नि की भाँति परम तत्त्व को प्रकट करे। वह अंशरहित, निश्चल और शान्त ब्रह्म "मैं हूँ" — ऐसा स्मरण किया गया है।',
      'Fixing the cord of knowledge, one should draw forth the Supreme as fire [is churned from the fire-sticks]. That partless, unmoving, peaceful Brahman — “I am That”: so it is taught.'
    ),
    M(
      ['सर्वभूताधिवासं यद्भूतेषु च वसत्यपि।', 'सर्वानुग्राहकत्वेन तदस्म्यहं वासुदेवः।', 'तदस्म्यहं वासुदेव इत्युपनिषत्॥'],
      'जो सब प्राणियों का निवास-स्थान है और जो सब प्राणियों में वास भी करता है, सब पर अनुग्रह करने के कारण (जो वासुदेव कहलाता है) — वह वासुदेव मैं हूँ; वह वासुदेव मैं हूँ। यह उपनिषद् है।',
      'That which is the abode of all beings and which also dwells in all beings, and which, as the giver of grace to all, [is called Vāsudeva] — I am That, Vāsudeva; I am That, Vāsudeva. Thus the Upaniṣad.'
    ),
  ],
};

/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Amṛtanāda — Kṛṣṇa Yajurveda, Yoga group in this catalogue. Thirty-eight
 * verses, undivided: leaving the books behind once Brahman is known, the
 * chariot of Om with Viṣṇu as charioteer, the six-limbed yoga (withdrawal,
 * meditation, breath-control, concentration, reasoning, absorption), the three
 * kinds of prāṇāyāma, seat and posture, the soundless syllable, the doors of
 * the body and the practitioner’s restraints, the fruits in three to six
 * months, the measures of the elements, the breath-count of a day and night,
 * and the seats and colours of the five prāṇas; closing with the one whose
 * breath pierces the crown and is not born again. Total 38 mantras.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'amritanada',
  muktika: 21,
  vedaHi: 'कृष्ण यजुर्वेद',
  vedaEn: 'Krishna Yajurveda',
  source: {
    baseText:
      'Kṛṣṇa Yajurveda Amṛtanāda Upaniṣad in 38 verses, as printed in the Ānandāśrama one-hundred-eight Upaniṣad collection and the Adyar Yoga Upaniṣads (with Upaniṣad-brahmayogin’s commentary); Devanagari written out from the printed text.',
    canonicalEdition:
      'Ānandāśrama Sanskrit Series, Upaniṣadāṃ Samuccayaḥ; The Yoga Upaniṣads, Adyar Library (ed. A. Mahadeva Sastri); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/amritanada.html',
      'https://www.wisdomlib.org/hinduism/book/amritanada-upanishad',
      'https://archive.org/details/TheYogaUpanishads',
    ],
    notes:
      '38 verses, undivided, numbered as in the Ānandāśrama / Adyar Yoga Upaniṣads: 1–4 discarding the books once Brahman is known, the chariot of Om driven by Viṣṇu, and the passage beyond the measures to the subtle state; 5–6 pratyāhāra and the six limbs of yoga; 7–14 breath-control burning the defects, the three prāṇāyāmas (recaka, pūraka, kumbhaka) and the mark of the tranquil one; 15–16 dhāraṇā, tarka and samādhi; 17–23 place, seat, posture, the drawing of breath with Om, gaze and the time-measure of practice; 24 the imperishable syllable; 25–27 the path of prāṇa, the doors and the things a yogin avoids; 28–29 fruits in three to six months; 30–31 the measures of the five elements and the half-measure; 32–33 the extent of prāṇa and the day-and-night breath count (1,13,180); 34–37 the seats and colours of the five prāṇas; 38 the breath that pierces the crown — no rebirth. Verse 9 is printed as three half-verses (the recaka/pūraka/kumbhaka line is joined to it), which is why the count is 38 rather than 39 as in some prints. Readings vary between prints in 3 (स्थित्वा रथपथस्थानं), 14 (काष्ठवत्पश्यते देहं), 21 (स्थूलातिस्थूलमात्रायां; some read स्थूलादिस्थूलसूक्ष्मं च), 23 (तालुमात्राविनिष्कम्पो), 24 (कथंचित् / कदाचित्), 32 (त्रिंशत्पर्वाङ्गुलः) and 35; the reading followed here is noted in the Devanagari. The Kṛṣṇa-Yajurvedic śānti-pāṭha (सह नाववतु) is page 1. Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै।', 'तेजस्वि नावधीतमस्तु मा विद्विषावहै॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (ब्रह्म) हम दोनों (गुरु-शिष्य) की साथ-साथ रक्षा करे, हम दोनों का साथ-साथ पालन करे; हम दोनों साथ-साथ सामर्थ्य प्राप्त करें। हमारा पढ़ा हुआ तेजस्वी हो; हम परस्पर द्वेष न करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'May That protect us both together; may That nourish us both together; may we work together with vigour. May what we study be luminous; may we never hate one another. Om, peace, peace, peace.'
  ),
  mantras: [
    M(
      ['शास्त्राण्यधीत्य मेधावी अभ्यस्य च पुनः पुनः।', 'परमं ब्रह्म विज्ञाय उल्कावत्तान्यथोत्सृजेत्॥'],
      'बुद्धिमान् साधक शास्त्रों का अध्ययन करके और उनका बार-बार अभ्यास करके, परब्रह्म को भली-भाँति जान लेने पर उन्हें (शास्त्रों को) उसी प्रकार त्याग दे जैसे (मार्ग दिख जाने पर) मशाल को त्याग दिया जाता है।',
      'Having studied the scriptures and practised them again and again, the wise one, once he has come to know the supreme Brahman, should then set them aside like a torch [once the way is seen].'
    ),
    M(
      ['ओंकाररथमारुह्य विष्णुं कृत्वाथ सारथिम्।', 'ब्रह्मलोकपदान्वेषी रुद्राराधनतत्परः॥'],
      'ओंकार-रूपी रथ पर आरूढ़ होकर और भगवान् विष्णु को सारथि बनाकर, ब्रह्मलोक के पद की खोज करने वाला साधक रुद्र की आराधना में तत्पर रहे।',
      'Mounting the chariot of Om, with Viṣṇu made the charioteer, the seeker of the state of the world of Brahman remains intent on the worship of Rudra.'
    ),
    M(
      ['तावद्रथेन गन्तव्यं यावद्रथपथि स्थितः।', 'स्थित्वा रथपथस्थानं रथमुत्सृज्य गच्छति॥'],
      'जब तक रथ के मार्ग पर स्थित है, तब तक रथ से ही चलना चाहिए। रथ-मार्ग के अन्तिम स्थान पर पहुँचकर (साधक) रथ को छोड़कर (आगे) जाता है।',
      'One should travel by the chariot as long as one is on the chariot-road. Having reached the end of the chariot-road, one leaves the chariot and goes on.'
    ),
    M(
      ['मात्रालिङ्गपदं त्यक्त्वा शब्दव्यञ्जनवर्जितम्।', 'अस्वरेण मकारेण पदं सूक्ष्मं च गच्छति॥'],
      'मात्रा, चिह्न और पद (के स्थूल रूप) को छोड़कर, स्वर-रहित मकार के द्वारा वह शब्द और व्यञ्जन से रहित सूक्ष्म पद को प्राप्त होता है।',
      'Giving up the measure, the mark and the word, one reaches, by the soundless ‘m’, the subtle state that is free of sound and consonant.'
    ),
    M(
      ['शब्दादिविषयान्पञ्च मनश्चैवातिचञ्चलम्।', 'चिन्तयेदात्मनो रश्मीन्प्रत्याहारः स उच्यते॥'],
      'शब्द आदि पाँचों विषयों को और अत्यन्त चञ्चल मन को भी आत्मा की ही किरणें समझकर उनका चिन्तन करे — यह प्रत्याहार कहलाता है।',
      'The five objects beginning with sound, and the mind too, which is exceedingly restless — one should contemplate them as the rays of the Self. This is called withdrawal (pratyāhāra).'
    ),
    M(
      ['प्रत्याहारस्तथा ध्यानं प्राणायामोऽथ धारणा।', 'तर्कश्चैव समाधिश्च षडङ्गो योग उच्यते॥'],
      'प्रत्याहार, ध्यान, प्राणायाम, धारणा, तर्क और समाधि — यह छः अङ्गों वाला योग कहा जाता है।',
      'Withdrawal, meditation, breath-control, concentration, reasoning and absorption — this is called the six-limbed yoga.'
    ),
    M(
      ['यथा पर्वतधातूनां दह्यन्ते धमनान्मलाः।', 'तथेन्द्रियकृता दोषा दह्यन्ते प्राणनिग्रहात्॥'],
      'जैसे पर्वत से निकली धातुओं के मल धौंकनी से धौंकने पर जल जाते हैं, वैसे ही इन्द्रियों द्वारा किए गए दोष प्राण के निग्रह से जल जाते हैं।',
      'As the impurities of ores from the mountain are burnt away by the blowing of the bellows, so the faults wrought by the senses are burnt away by the restraint of breath.'
    ),
    M(
      ['प्राणायामैर्दहेद्दोषान्धारणाभिश्च किल्बिषम्।', 'प्रत्याहारेण संसर्गान्ध्यानेनानीश्वरान्गुणान्॥'],
      'प्राणायामों से दोषों को, धारणाओं से पाप को, प्रत्याहार से (विषयों के) संसर्ग को और ध्यान से अनीश्वर (आत्मा को आच्छादित करने वाले) गुणों को भस्म कर दे।',
      'By breath-control one should burn the faults; by concentration, sin; by withdrawal, the contacts [with objects]; and by meditation, the qualities that are not of the Lord.'
    ),
    M(
      ['किल्बिषं हि क्षयं नीत्वा रुचिरं चैव चिन्तयेत्।', 'रुचिरं रेचकं चैव वायोराकर्षणं तथा।', 'प्राणायामास्त्रयः प्रोक्ता रेचपूरककुम्भकाः॥'],
      'पाप को क्षीण करके (साधक) रुचिर (प्रकाशमय परमात्मा) का चिन्तन करे। (प्राण का) रुचिर (रोकना), रेचक (बाहर निकालना) और वायु का आकर्षण (भीतर खींचना) — ये रेचक, पूरक और कुम्भक तीन प्राणायाम कहे गए हैं।',
      'Having brought sin to destruction, one should contemplate the Radiant. Holding, expelling, and the drawing in of air — these are said to be the three breath-controls: recaka, pūraka and kumbhaka.'
    ),
    M(
      ['सव्याहृतिं सप्रणवां गायत्रीं शिरसा सह।', 'त्रिः पठेदायतप्राणः प्राणायामः स उच्यते॥'],
      'प्राण को रोककर व्याहृतियों और प्रणव सहित गायत्री को उसके शिरोमन्त्र के साथ तीन बार पढ़े — यह प्राणायाम कहलाता है।',
      'With the breath held, one should recite three times the Gāyatrī together with the vyāhṛtis, the praṇava and its head-verse (śiras). This is called prāṇāyāma.'
    ),
    M(
      ['उत्क्षिप्य वायुमाकाशं शून्यं कृत्वा निरात्मकम्।', 'शून्यभावे नियुञ्जीयाद्रेचकस्येति लक्षणम्॥'],
      'वायु को ऊपर आकाश में फेंककर (बाहर निकालकर), (भीतर के स्थान को) शून्य और निरात्मक करके, मन को शून्य-भाव में लगाए — यह रेचक का लक्षण है।',
      'Casting the air out into space, making [the inner space] empty and void of self, one should fix [the mind] in the state of emptiness — this is the mark of recaka.'
    ),
    M(
      ['वक्त्रेणोत्पलनालेन तोयमाकर्षयेन्नरः।', 'एवं वायुर्ग्रहीतव्यः पूरकस्येति लक्षणम्॥'],
      'जैसे मनुष्य मुख से कमल की नाल द्वारा जल खींचता है, वैसे ही वायु को (धीरे-धीरे) ग्रहण करना चाहिए — यह पूरक का लक्षण है।',
      'As a man draws water through the stalk of a lotus with his mouth, so should the air be taken in — this is the mark of pūraka.'
    ),
    M(
      ['नोच्छ्वसेन्न च निश्वसेन्नैव गात्राणि चालयेत्।', 'एवं भावं नियुञ्जीयात्कुम्भकस्येति लक्षणम्॥'],
      'न श्वास ऊपर ले, न बाहर छोड़े और न अङ्गों को हिलाए; इस प्रकार (मन को) भाव में लगाए — यह कुम्भक का लक्षण है।',
      'One should neither breathe in nor breathe out, nor move the limbs; thus one should fix the mind in that state — this is the mark of kumbhaka.'
    ),
    M(
      ['अन्धवत्पश्य रूपाणि शब्दं बधिरवच्छृणु।', 'काष्ठवत्पश्यते देहं प्रशान्तस्येति लक्षणम्॥'],
      'रूपों को अन्धे की भाँति देखो, शब्द को बहरे की भाँति सुनो; जो देह को काठ की भाँति देखता है — यह प्रशान्त (साधक) का लक्षण है।',
      'See forms as one who is blind; hear sound as one who is deaf; one who looks upon the body as a log of wood — this is the mark of the tranquil one.'
    ),
    M(
      ['मनः संकल्पकं ध्यात्वा संक्षिप्यात्मनि बुद्धिमान्।', 'धारयित्वा तथात्मानं धारणा परिकीर्तिता॥'],
      'बुद्धिमान् साधक संकल्प करने वाले मन को (संकल्प-रूप) समझकर उसे आत्मा में समेट ले और इस प्रकार आत्मा में (मन को) धारण करे — यह धारणा कही गई है।',
      'The wise one, regarding the mind as that which forms intentions, draws it back into the Self and so holds it fixed in the Self — this is declared to be concentration (dhāraṇā).'
    ),
    M(
      ['आगमस्याविरोधेन ऊहनं तर्क उच्यते।', 'समं मन्येत यं लब्ध्वा स समाधिः प्रकीर्तितः॥'],
      'शास्त्र (आगम) के अविरोध से (उसके अनुकूल) किया गया ऊहापोह तर्क कहलाता है। जिसे प्राप्त करके (साधक) सब कुछ सम मानने लगे, वह समाधि कही गई है।',
      'Reflection that does not contradict scripture is called reasoning (tarka). That on attaining which one regards all as the same is declared to be absorption (samādhi).'
    ),
    M(
      ['भूमौ दर्भासने रम्ये सर्वदोषविवर्जिते।', 'कृत्वा मनोमयीं रक्षां जप्त्वा वै रथमण्डलम्॥'],
      'सब दोषों से रहित, रमणीय भूमि पर कुश के आसन पर (बैठकर), मन से ही (अपनी) रक्षा का विधान करके और रथमण्डल (ओंकार-रूप रथ के मन्त्र) का जप करके —',
      'On level ground free of every fault, on a pleasant seat of darbha grass, having made a protection of the mind and having recited the chariot-circle [of Om] —'
    ),
    M(
      ['पद्मकं स्वस्तिकं वापि भद्रासनमथापि वा।', 'बद्ध्वा योगासनं सम्यगुत्तराभिमुखः स्थितः॥'],
      'पद्मासन, स्वस्तिकासन अथवा भद्रासन — (इनमें से किसी) योगासन को भली-भाँति बाँधकर उत्तर की ओर मुख करके बैठे।',
      'Having rightly assumed a yogic posture — the lotus, the svastika or the bhadrāsana — one sits facing the north.'
    ),
    M(
      ['नासिकापुटमङ्गुल्या पिधायैकेन मारुतम्।', 'आकृष्य धारयेदग्निं शब्दमेव विचिन्तयेत्॥'],
      'अँगुली से नासिका के एक छिद्र को बन्द करके दूसरे से वायु को खींचकर (भीतर की) अग्नि को धारण करे और (प्रणव के) शब्द का ही चिन्तन करे।',
      'Closing one nostril with a finger and drawing in the air through the other, one should hold the fire [within] and contemplate the sound alone.'
    ),
    M(
      ['ओमित्येकाक्षरं ब्रह्म ओमित्येकेन रेचयेत्।', 'दिव्यमन्त्रेण बहुशः कुर्यादात्ममलच्युतिम्॥'],
      '‘ॐ’ — यह एक अक्षर ब्रह्म है; ‘ॐ’ — इसी एक (अक्षर) के साथ (वायु का) रेचन करे। इस दिव्य मन्त्र के द्वारा बार-बार (ऐसा करके) अपने मल को दूर करे।',
      '‘Om’ — the one syllable is Brahman; with that one ‘Om’ one should breathe out. By this divine mantra, done many times, one should rid oneself of one’s impurity.'
    ),
    M(
      ['पश्चाद्ध्यायीत पूर्वोक्तक्रमशो मन्त्रविद्बुधः।', 'स्थूलातिस्थूलमात्रायां नाभेरूर्ध्वमुपक्रमः॥'],
      'इसके पश्चात् मन्त्र को जानने वाला ज्ञानी पहले कहे हुए क्रम से ध्यान करे — स्थूल और अति-स्थूल मात्रा से आरम्भ करके नाभि से ऊपर की ओर।',
      'Afterwards the wise knower of the mantra should meditate in the order stated before, beginning with the gross and grosser measures, and moving upward from the navel.'
    ),
    M(
      ['तिर्यगूर्ध्वमधोदृष्टिं विहाय च महामतिः।', 'स्थिरस्थायी विनिष्कम्पः सदा योगं समभ्यसेत्॥'],
      'महाबुद्धिमान् साधक तिरछी, ऊपर और नीचे की दृष्टि को छोड़कर, स्थिर बैठकर और निष्कम्प होकर सदा योग का अभ्यास करे।',
      'Giving up the sideways, upward and downward gaze, the great-minded one, seated firm and unmoving, should always practise yoga.'
    ),
    M(
      ['तालुमात्राविनिष्कम्पो धारणायोजनं तथा।', 'द्वादशमात्रो योगस्तु कालतो नियमः स्मृतः॥'],
      'तालु (के स्थान) में मात्रा के साथ निष्कम्प रहना और उसी प्रकार धारणा का योजन करना (योग है); काल के अनुसार बारह मात्राओं वाला योग ही नियम माना गया है।',
      'Remaining unmoving with the measure at the palate, and so joining the concentration — the yoga of twelve measures is held to be the rule in terms of time.'
    ),
    M(
      ['अघोषमव्यञ्जनमस्वरं चाकण्ठताल्वोष्ठमनासिकं च।', 'अरेफजातमुभयोष्मवर्जितं यदक्षरं न क्षरते कथंचित्॥'],
      'जो घोष, व्यञ्जन और स्वर से रहित है; जो कण्ठ, तालु, ओष्ठ और नासिका से (उच्चारित) नहीं है; जो रेफ से उत्पन्न नहीं और दोनों ऊष्म वर्णों से भी रहित है — वह अक्षर (अविनाशी) है, जो कभी किसी प्रकार क्षीण नहीं होता।',
      'That which is without resonance, without consonant, without vowel, not of the throat, palate, lips or nose, not born of the ‘r’ and free of both sibilants — that is the Imperishable, which never perishes in any way.'
    ),
    M(
      ['येनासौ पश्यते मार्गं प्राणस्तेन हि गच्छति।', 'अतस्तमभ्यसेन्नित्यं यन्मार्गगमनाय वै॥'],
      'जिस (मार्ग) से यह (साधक) मार्ग को देखता है, उसी से प्राण जाता है। इसलिए उस मार्ग पर चलने के लिए उसका नित्य अभ्यास करना चाहिए।',
      'By the way through which he sees the path, by that the prāṇa goes. Therefore one should practise it constantly, for the sake of travelling that path.'
    ),
    M(
      ['हृद्द्वारं वायुद्वारं च मूर्धद्वारमतः परम्।', 'मोक्षद्वारं बिलं चैव सुषिरं मण्डलं विदुः॥'],
      'हृदय का द्वार, वायु का द्वार, उसके पश्चात् मूर्धा का द्वार और मोक्ष का द्वार — इन्हें (ज्ञानी) बिल, सुषिर (छिद्र) और मण्डल कहते हैं।',
      'The door of the heart, the door of the air, beyond it the door of the crown, and the door of liberation — these the knowers call the cave, the hollow and the circle.'
    ),
    M(
      ['भयं क्रोधमथालस्यमतिस्वप्नातिजागरम्।', 'अत्याहारमनाहारं नित्यं योगी विवर्जयेत्॥'],
      'भय, क्रोध, आलस्य, अधिक सोना, अधिक जागना, अधिक भोजन और भोजन न करना — इनका योगी सदा त्याग करे।',
      'Fear, anger, sloth, too much sleep, too much waking, too much food and no food — these the yogin should always avoid.'
    ),
    M(
      ['अनेन विधिना सम्यङ्नित्यमभ्यसतः क्रमात्।', 'स्वयमुत्पद्यते ज्ञानं त्रिभिर्मासैर्न संशयः॥'],
      'इस विधि से क्रमपूर्वक भली-भाँति नित्य अभ्यास करने वाले को तीन महीनों में स्वयं ही ज्ञान उत्पन्न हो जाता है — इसमें संशय नहीं।',
      'For one who practises rightly and constantly by this method, step by step, knowledge arises of itself in three months — there is no doubt.'
    ),
    M(
      ['चतुर्भिः पश्यते देवान्पञ्चभिस्तुल्यविक्रमः।', 'इच्छयाप्नोति कैवल्यं षष्ठे मासि न संशयः॥'],
      'चार महीनों में वह देवताओं का दर्शन करता है, पाँच में (उनके) समान पराक्रम वाला हो जाता है और छठे महीने में इच्छानुसार कैवल्य को प्राप्त कर लेता है — इसमें संशय नहीं।',
      'In four [months] he sees the gods; in five he becomes their equal in power; in the sixth month he attains aloneness (kaivalya) at will — there is no doubt.'
    ),
    M(
      ['पार्थिवः पञ्चमात्रस्तु चतुर्मात्रस्तु वारुणः।', 'आग्नेयस्तु त्रिमात्रोऽसौ वायव्यस्तु द्विमात्रकः॥'],
      'पृथ्वी-तत्त्व (की धारणा) पाँच मात्राओं की है, जल-तत्त्व की चार मात्राओं की, अग्नि-तत्त्व की तीन मात्राओं की और वायु-तत्त्व की दो मात्राओं की।',
      'The earthly [concentration] is of five measures, the watery of four; the fiery is of three measures, and the airy of two.'
    ),
    M(
      ['एकमात्रस्तथाकाशो ह्यर्धमात्रं तु चिन्तयेत्।', 'संधिं कृत्वा तु मनसा चिन्तयेदात्मनात्मनि॥'],
      'आकाश-तत्त्व एक मात्रा का है; फिर अर्धमात्रा का चिन्तन करे। मन से (इनका) संधान करके आत्मा के द्वारा आत्मा में (परमात्मा का) चिन्तन करे।',
      'Space is of one measure; then one should contemplate the half-measure. Joining them with the mind, one should contemplate the Self by the Self within the Self.'
    ),
    M(
      ['त्रिंशत्पर्वाङ्गुलः प्राणो यत्र प्राणः प्रतिष्ठितः।', 'एष प्राण इति ख्यातो बाह्यप्राणस्य गोचरः॥'],
      'प्राण तीस पर्वों वाली अँगुलियों (के परिमाण) का है, जहाँ प्राण प्रतिष्ठित है। यही प्राण कहा गया है, जो बाहरी प्राण का क्षेत्र है।',
      'The prāṇa extends thirty finger-joints, where the prāṇa is established. This is known as prāṇa, the range of the outer breath.'
    ),
    M(
      ['अशीतिश्च शतं चैव सहस्राणि त्रयोदश।', 'लक्षश्चैको विनिःश्वास अहोरात्रप्रमाणतः॥'],
      'एक दिन-रात के परिमाण में (मनुष्य के) श्वास एक लाख तेरह हजार एक सौ अस्सी होते हैं।',
      'One lakh, thirteen thousand, one hundred and eighty — such is the number of breaths in the measure of a day and night.'
    ),
    M(
      ['प्राण आद्यो हृदिस्थाने अपानस्तु पुनर्गुदे।', 'समानो नाभिदेशे तु उदानः कण्ठमाश्रितः॥'],
      'पहला (वायु) प्राण हृदय-स्थान में रहता है, अपान गुदा में, समान नाभि-प्रदेश में और उदान कण्ठ में आश्रित है।',
      'The first, prāṇa, is in the region of the heart; apāna in the anus; samāna in the region of the navel; and udāna dwells in the throat.'
    ),
    M(
      ['व्यानः सर्वेषु चाङ्गेषु सदा व्याप्य व्यवस्थितः।', 'अथ वर्णास्तु पञ्चानां प्राणादीनामनुक्रमात्॥'],
      'व्यान सब अङ्गों में सदा व्याप्त होकर स्थित रहता है। अब प्राण आदि पाँचों (वायुओं) के वर्ण क्रम से (कहे जाते हैं)।',
      'Vyāna abides pervading all the limbs at all times. Now the colours of the five, prāṇa and the rest, in order.'
    ),
    M(
      ['रक्तवर्णो मणिप्रख्यः प्राणो वायुः प्रकीर्तितः।', 'अपानस्तस्य मध्ये तु इन्द्रगोपसमप्रभः॥'],
      'प्राणवायु लाल वर्ण का, मणि के समान चमकने वाला कहा गया है। उसके मध्य में अपान है, जिसकी प्रभा इन्द्रगोप (बीरबहूटी) कीट के समान है।',
      'The prāṇa air is declared to be red in colour, shining like a gem. Apāna, in its midst, has the lustre of the indragopa insect.'
    ),
    M(
      ['समानस्तु द्वयोर्मध्ये गोक्षीरधवलप्रभः।', 'आपाण्डुर उदानश्च व्यानो ह्यर्चिःसमप्रभः॥'],
      'दोनों के मध्य में समान है, जिसकी प्रभा गाय के दूध के समान धवल है। उदान कुछ पीलापन लिए श्वेत (पाण्डुर) है और व्यान की प्रभा अग्नि की ज्वाला के समान है।',
      'Samāna, between the two, has a lustre white as cow’s milk; udāna is pale; and vyāna has the lustre of a flame.'
    ),
    M(
      ['यस्येदं मण्डलं भित्त्वा मारुतो याति मूर्धनि।', 'यत्र तत्र म्रियेद्वापि न स भूयोऽभिजायते।', 'न स भूयोऽभिजायत इत्युपनिषत्॥'],
      'जिसका प्राणवायु इस मण्डल को भेदकर मूर्धा में चला जाता है, वह कहीं भी मरे, फिर जन्म नहीं लेता; वह फिर जन्म नहीं लेता। यह उपनिषद् है।',
      'He whose breath pierces this circle and goes to the crown of the head — wherever he may die, he is not born again; he is not born again. Thus the Upaniṣad.'
    ),
  ],
};

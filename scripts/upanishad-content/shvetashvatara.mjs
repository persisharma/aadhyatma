/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Śvetāśvatara — Kṛṣṇa Yajurveda, Śaiva group. Six adhyāyas of
 * 16 · 17 · 21 · 22 · 14 · 23 = 113 mantras, cited adhyāya.mantra.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'shvetashvatara',
  muktika: 14,
  vedaHi: 'कृष्ण यजुर्वेद',
  vedaEn: 'Krishna Yajurveda',
  source: {
    baseText:
      'Kṛṣṇa Yajurveda recension with the Śāṅkara-bhāṣya ascribed to Śaṅkara, as printed in Gita Press "श्वेताश्वतरोपनिषद्"; Devanagari written out from the printed text.',
    canonicalEdition: 'Gita Press Gorakhpur, श्वेताश्वतरोपनिषद् (शांकरभाष्यार्थ सहित), code 1493',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/shvetashvatara.html',
      'https://www.wisdomlib.org/hinduism/book/shvetashvatara-upanishad',
      'https://archive.org/details/ShvetashvataraUpanishadGitaPress',
    ],
    notes:
      'Six adhyāyas of 16 · 17 · 21 · 22 · 14 · 23 mantras plus the Yajurvedic śānti-pāṭha (सह नाववतु) as page 1. Vedic anunāsika ligatures are written with the standard anusvāra. Devanagari was authored from memory of the printed text with no network source available at build time — a line-by-line check against the Gita Press scan is still owed.',
    retrievedOn: '2026-09-26',
  },
  shanti: M(
    ['ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै।', 'तेजस्वि नावधीतमस्तु मा विद्विषावहै॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (ब्रह्म) हम दोनों (गुरु-शिष्य) की साथ-साथ रक्षा करे, हम दोनों का साथ-साथ पालन करे; हम दोनों साथ-साथ सामर्थ्य प्राप्त करें। हमारा पढ़ा हुआ तेजस्वी हो; हम परस्पर द्वेष न करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'May That protect us both together; may That nourish us both together; may we work together with vigour. May what we study be luminous; may we never hate one another. Om, peace, peace, peace.'
  ),
  khandas: [
    // ── Adhyāya 1 ──────────────────────────────────────────────────────────
    [
      M(
        ['ॐ ब्रह्मवादिनो वदन्ति।', 'किं कारणं ब्रह्म कुतः स्म जाता जीवाम केन क्व च सम्प्रतिष्ठाः।', 'अधिष्ठिताः केन सुखेतरेषु वर्तामहे ब्रह्मविदो व्यवस्थाम्॥'],
        'ब्रह्मवादी (परस्पर) कहते हैं — (जगत् का) कारण क्या है? ब्रह्म (क्या है)? हम कहाँ से उत्पन्न हुए? किससे जीवित हैं? कहाँ स्थित हैं? हे ब्रह्मवेत्ताओं! किसके अधीन होकर हम सुख-दुःख में नियम से चलते हैं?',
        'Those who discourse on Brahman ask: What is the cause? Is it Brahman? Whence are we born? By what do we live? Where do we finally rest? O knowers of Brahman, governed by whom do we follow our course through joy and sorrow?'
      ),
      M(
        ['कालः स्वभावो नियतिर्यदृच्छा भूतानि योनिः पुरुष इति चिन्त्यम्।', 'संयोग एषां न त्वात्मभावादात्माप्यनीशः सुखदुःखहेतोः॥'],
        'काल, स्वभाव, नियति, यदृच्छा (संयोग), भूत (तत्त्व) या पुरुष (जीव) — इन्हें कारण मानकर विचारना चाहिए। इनका संयोग भी (कारण) नहीं, क्योंकि आत्मा (जीव) है (जो उन्हें भोगता है); पर जीव भी सुख-दुःख के कारण (कर्म) के अधीन होने से अनीश (असमर्थ) है।',
        'Time, inherent nature, necessity, chance, the elements, or the individual soul — should these be considered the cause? Not even their combination, since the self exists; yet the self too is powerless, being subject to the causes of joy and sorrow.'
      ),
      M(
        ['ते ध्यानयोगानुगता अपश्यन्देवात्मशक्तिं स्वगुणैर्निगूढाम्।', 'यः कारणानि निखिलानि तानि कालात्मयुक्तान्यधितिष्ठत्येकः॥'],
        'ध्यान-योग में लगे उन (ऋषियों) ने अपने गुणों से ढकी हुई उस देव (परमेश्वर) की आत्म-शक्ति को देखा, जो एक ही काल से लेकर जीव तक उन समस्त कारणों पर शासन करता है।',
        'Those who followed the yoga of meditation beheld the self-power of the Divine, hidden by its own qualities — the One who rules over all those causes, from time to the individual soul.'
      ),
      M(
        ['तमेकनेमिं त्रिवृतं षोडशान्तं शतार्धारं विंशतिप्रत्यराभिः।', 'अष्टकैः षड्भिर्विश्वरूपैकपाशं त्रिमार्गभेदं द्विनिमित्तैकमोहम्॥'],
        'उस (ब्रह्म-चक्र) को हम जानते हैं — एक नेमि (माया) वाला, तीन (गुणों) से युक्त, सोलह (कलाओं) में समाप्त होने वाला, पचास अरों (भावों) वाला, बीस प्रत्यरों (इन्द्रिय-विषय) वाला, छह अष्टकों वाला, विश्वरूप एक पाश (कामना) वाला, तीन मार्गों (धर्म-अधर्म-ज्ञान) में विभक्त, दो निमित्तों (पुण्य-पाप) से एक मोह उत्पन्न करने वाला।',
        'We meditate on Him as the wheel with one rim, three tyres, sixteen ends, fifty spokes, twenty counter-spokes, six sets of eight, one all-formed noose, three different paths, and one delusion arising from two causes.'
      ),
      M(
        ['पञ्चस्रोतोम्बुं पञ्चयोन्युग्रवक्रां पञ्चप्राणोर्मिं पञ्चबुद्ध्यादिमूलाम्।', 'पञ्चावर्तां पञ्चदुःखौघवेगां पञ्चाशद्भेदां पञ्चपर्वामधीमः॥'],
        'हम उस (संसार-) नदी को जानते हैं जिसका जल पाँच स्रोतों (इन्द्रियों) से आता है, जो पाँच योनियों (भूतों) से उग्र और टेढ़ी है, जिसकी लहरें पाँच प्राण हैं, जिसका मूल पाँच बुद्धि (ज्ञानेन्द्रियाँ) आदि हैं, जिसमें पाँच भँवर हैं, जिसका वेग पाँच दुःखों की धारा है, जो पचास भेदों वाली और पाँच पर्वों (क्लेशों) वाली है।',
        'We meditate on Him as the river whose waters are the five senses, fierce and winding from its five sources, whose waves are the five breaths, whose origin is the fivefold intellect, with five whirlpools, rushing with the five torrents of sorrow, with fifty branches and five stages.'
      ),
      M(
        ['सर्वाजीवे सर्वसंस्थे बृहन्ते अस्मिन्हंसो भ्राम्यते ब्रह्मचक्रे।', 'पृथगात्मानं प्रेरितारं च मत्वा जुष्टस्ततस्तेनामृतत्वमेति॥'],
        'सबको जीवन देने वाले, सबके आश्रय, इस विशाल ब्रह्म-चक्र में हंस (जीव) भटकता रहता है। जब वह अपने को (शरीर से) पृथक् और प्रेरक (ईश्वर) को (अपने से भिन्न) जानता है, तब उसके द्वारा अनुगृहीत होकर अमरत्व को प्राप्त होता है।',
        'In this vast wheel of Brahman, which gives life to all and in which all rest, the soul wanders like a swan. When it knows itself as distinct and knows the Impeller, then, favoured by Him, it attains immortality.'
      ),
      M(
        ['उद्गीतमेतत्परमं तु ब्रह्म तस्मिंस्त्रयं सुप्रतिष्ठाक्षरं च।', 'अत्रान्तरं ब्रह्मविदो विदित्वा लीना ब्रह्मणि तत्परा योनिमुक्ताः॥'],
        'यह परम ब्रह्म (वेदों में) गाया गया है; उसमें (भोक्ता, भोग्य, प्रेरक की) त्रयी सुप्रतिष्ठित है और वह अक्षर है। इसमें भेद (सार) को जानकर ब्रह्मवेत्ता ब्रह्म में लीन, उसमें तत्पर और जन्म से मुक्त हो जाते हैं।',
        'This supreme Brahman has been proclaimed; in it rest the triad, and it is the imperishable ground. Knowing the inner truth here, the knowers of Brahman, devoted to it, merge in Brahman and are freed from rebirth.'
      ),
      M(
        ['संयुक्तमेतत्क्षरमक्षरं च व्यक्ताव्यक्तं भरते विश्वमीशः।', 'अनीशश्चात्मा बध्यते भोक्तृभावाज्ज्ञात्वा देवं मुच्यते सर्वपाशैः॥'],
        'ईश्वर इस क्षर-अक्षर, व्यक्त-अव्यक्त के संयोग-रूप विश्व को धारण करता है। अनीश (असमर्थ) जीव भोक्ता-भाव से बँधता है; उस देव को जानकर वह सब पाशों से मुक्त हो जाता है।',
        'The Lord upholds this universe, a union of the perishable and the imperishable, the manifest and the unmanifest. The powerless soul is bound by its sense of being the enjoyer; knowing the Divine, it is released from all bonds.'
      ),
      M(
        ['ज्ञाज्ञौ द्वावजावीशनीशावजा ह्येका भोक्तृभोग्यार्थयुक्ता।', 'अनन्तश्चात्मा विश्वरूपो ह्यकर्ता त्रयं यदा विन्दते ब्रह्ममेतत्॥'],
        'ज्ञ (ईश्वर) और अज्ञ (जीव) — दोनों अजन्मा हैं; एक समर्थ, दूसरा असमर्थ। एक (प्रकृति) भी अजन्मा है, जो भोक्ता के भोग्य पदार्थों से युक्त है। और (परम) आत्मा अनन्त, विश्वरूप, अकर्ता है। जब (साधक) इन तीनों को (ब्रह्म-रूप) जान लेता है, तब वह यह ब्रह्म है।',
        'Two are unborn — the knower and the ignorant, the Lord and the powerless soul; unborn too is the one (nature), joined to the enjoyer and his objects. And the Self is infinite, of universal form, a non-doer. When one finds these three as Brahman — that is Brahman.'
      ),
      M(
        ['क्षरं प्रधानममृताक्षरं हरः क्षरात्मानावीशते देव एकः।', 'तस्याभिध्यानाद्योजनात्तत्त्वभावाद्भूयश्चान्ते विश्वमायानिवृत्तिः॥'],
        'प्रधान (प्रकृति) क्षर है; हर (परमेश्वर) अमृत और अक्षर है। एक देव क्षर (प्रकृति) और आत्मा (जीव) दोनों पर शासन करता है। उसके ध्यान से, (उसमें) योग से, (उसके) तत्त्व-भाव से — अन्त में समस्त विश्व-माया की निवृत्ति हो जाती है।',
        'Nature is perishable; Hara, the Lord, is immortal and imperishable. The one God rules over the perishable and over the soul. By meditating on Him, by union with Him, by becoming one with His truth, at last all the world\'s illusion ceases.'
      ),
      M(
        ['ज्ञात्वा देवं सर्वपाशापहानिः क्षीणैः क्लेशैर्जन्ममृत्युप्रहाणिः।', 'तस्याभिध्यानात्तृतीयं देहभेदे विश्वैश्वर्यं केवल आप्तकामः॥'],
        'देव को जानने से सब पाश नष्ट हो जाते हैं; क्लेश क्षीण होने पर जन्म-मृत्यु का नाश होता है। उसके ध्यान से देह छूटने पर तीसरी (अवस्था) — विश्वैश्वर्य मिलता है; (और अन्त में) वह केवल (एकाकी ब्रह्म-रूप), आप्तकाम हो जाता है।',
        'Knowing the Divine, all bonds fall away; with the afflictions worn out, birth and death cease. By meditating on Him one gains, at the body\'s dissolution, the third state, lordship over all; and finally one is alone, all desires fulfilled.'
      ),
      M(
        ['एतज्ज्ञेयं नित्यमेवात्मसंस्थं नातः परं वेदितव्यं हि किञ्चित्।', 'भोक्ता भोग्यं प्रेरितारं च मत्वा सर्वं प्रोक्तं त्रिविधं ब्रह्ममेतत्॥'],
        'यह नित्य, आत्मा में स्थित (तत्त्व) जानने योग्य है; इससे परे कुछ भी जानने योग्य नहीं है। भोक्ता (जीव), भोग्य (जगत्) और प्रेरक (ईश्वर) को जानकर — यह सब त्रिविध ब्रह्म कहा गया है।',
        'This eternal truth abiding in the self is to be known; beyond it there is nothing whatever to be known. Knowing the enjoyer, the enjoyed and the Impeller, all has been said: this threefold reality is Brahman.'
      ),
      M(
        ['वह्नेर्यथा योनिगतस्य मूर्तिर्न दृश्यते नैव च लिङ्गनाशः।', 'स भूय एवेन्धनयोनिगृह्यस्तद्वोभयं वै प्रणवेन देहे॥'],
        'जैसे अपने योनि (काष्ठ) में स्थित अग्नि का रूप दिखाई नहीं देता, फिर भी उसके सूक्ष्म रूप का नाश नहीं होता, और वह ईंधन-रूप योनि (के मन्थन) से फिर पकड़ में आ जाता है — वैसे ही (जीव और परमात्मा) दोनों प्रणव (के अभ्यास) से देह में (प्रत्यक्ष होते हैं)।',
        'As the form of fire latent in its source is not seen, yet its subtle form is not destroyed, and it is seized again by churning the fuel — so both are grasped in the body by means of Om.'
      ),
      M(
        ['स्वदेहमरणिं कृत्वा प्रणवं चोत्तरारणिम्।', 'ध्याननिर्मथनाभ्यासाद्देवं पश्येन्निगूढवत्॥'],
        'अपने शरीर को नीचे की अरणि और प्रणव को ऊपर की अरणि बनाकर, ध्यान-रूपी मन्थन के अभ्यास से (साधक) छिपे हुए (अग्नि) की तरह देव को देखे।',
        'Making one\'s own body the lower fire-stick and Om the upper, by the practice of churning that is meditation one should see the Divine, as one sees the hidden fire.'
      ),
      M(
        ['तिलेषु तैलं दधिनीव सर्पिरापः स्रोतःस्वरणीषु चाग्निः।', 'एवमात्माऽत्मनि गृह्यतेऽसौ सत्येनैनं तपसा योऽनुपश्यति॥'],
        'जैसे तिलों में तेल, दही में घी, स्रोतों में जल और अरणियों में अग्नि (छिपा है) — वैसे ही वह आत्मा अपने भीतर (बुद्धि में) पकड़ा जाता है, जो उसे सत्य और तप से देखता है।',
        'As oil in sesame seeds, butter in curds, water in underground streams, fire in the fire-sticks — so is that Self grasped within one\'s own self by one who sees Him through truth and austerity.'
      ),
      M(
        ['सर्वव्यापिनमात्मानं क्षीरे सर्पिरिवार्पितम्।', 'आत्मविद्यातपोमूलं तद्ब्रह्मोपनिषत्परं तद्ब्रह्मोपनिषत्परम्॥'],
        'दूध में घी की तरह (सब में) व्याप्त सर्वव्यापी आत्मा को, जो आत्मविद्या और तप का मूल है — वह उपनिषदों का परम ब्रह्म है, वह उपनिषदों का परम ब्रह्म है।',
        'The all-pervading Self, present in all as butter in milk, the root of self-knowledge and austerity — that is the supreme Brahman of the Upaniṣads; that is the supreme Brahman of the Upaniṣads.'
      ),
    ],
    // ── Adhyāya 2 — Yoga ───────────────────────────────────────────────────
    [
      M(
        ['युञ्जानः प्रथमं मनस्तत्त्वाय सविता धियः।', 'अग्नेर्ज्योतिर्निचाय्य पृथिव्या अध्याभरत्॥'],
        'तत्त्व (ज्ञान) के लिए पहले मन और बुद्धियों को (योग में) जोड़ते हुए सविता (देव) ने अग्नि की ज्योति को पहचानकर उसे पृथ्वी से ऊपर लाया।',
        'Yoking first the mind and the thoughts to the truth, Savitṛ discerned the light of fire and brought it forth from the earth.'
      ),
      M(
        ['युक्तेन मनसा वयं देवस्य सवितुः सवे।', 'सुवर्गेयाय शक्त्या॥'],
        'सविता देव की प्रेरणा में, योग-युक्त मन से, हम अपनी शक्ति भर स्वर्ग (प्राप्ति) के लिए (प्रयत्न करते हैं)।',
        'With mind yoked, under the impulse of the god Savitṛ, we strive with all our strength for the heavenly goal.'
      ),
      M(
        ['युक्त्वाय मनसा देवान्सुवर्यतो धिया दिवम्।', 'बृहज्ज्योतिः करिष्यतः सविता प्रसुवाति तान्॥'],
        'मन से देवों (इन्द्रियों) को योग में जोड़कर, बुद्धि द्वारा स्वर्ग (प्रकाश) की ओर जाते हुए, महान् ज्योति को प्रकट करने वाले (साधकों) को सविता प्रेरित करे।',
        'Yoking the senses with the mind, moving by thought toward the light of heaven — may Savitṛ inspire those who would make the great light manifest.'
      ),
      M(
        ['युञ्जते मन उत युञ्जते धियो विप्रा विप्रस्य बृहतो विपश्चितः।', 'वि होत्रा दधे वयुनाविदेक इन्मही देवस्य सवितुः परिष्टुतिः॥'],
        'महान्, विवेकी, सर्वज्ञ (परमेश्वर) के (ध्यान में) विप्र मन को जोड़ते हैं, बुद्धियों को जोड़ते हैं। मार्ग को जानने वाला वह एक ही यज्ञ-कर्मों का विधान करता है। सविता देव की महती स्तुति है।',
        'The wise yoke their minds, they yoke their thoughts, to the great, discerning, all-knowing One. He alone, knower of the ways, ordains the rites of worship. Great is the praise of the god Savitṛ.'
      ),
      M(
        ['युजे वां ब्रह्म पूर्व्यं नमोभिर्विश्लोक एतु पथ्येव सूरेः।', 'शृण्वन्तु विश्वे अमृतस्य पुत्रा आ ये धामानि दिव्यानि तस्थुः॥'],
        'मैं नमस्कारों से तुम दोनों (मन-बुद्धि) को प्राचीन ब्रह्म में जोड़ता हूँ। सूर्य के मार्ग-सा मेरा यह श्लोक विस्तृत हो। अमृत के पुत्र सब सुनें — जो दिव्य धामों में स्थित हैं।',
        'With salutations I yoke you both to the ancient Brahman. May my verse go forth like the sun on its path. Let all the children of immortality hear — even those who dwell in celestial abodes.'
      ),
      M(
        ['अग्निर्यत्राभिमथ्यते वायुर्यत्राधिरुध्यते।', 'सोमो यत्रातिरिच्यते तत्र सञ्जायते मनः॥'],
        'जहाँ अग्नि मथी जाती है, जहाँ वायु नियन्त्रित की जाती है, जहाँ सोम (रस) प्रवाहित होता है — वहाँ (योगयुक्त) मन उत्पन्न होता है।',
        'Where fire is kindled by churning, where the breath is controlled, where the soma flows in abundance — there the mind is born anew.'
      ),
      M(
        ['सवित्रा प्रसवेन जुषेत ब्रह्म पूर्व्यम्।', 'तत्र योनिं कृणवसे न हि ते पूर्तमक्षिपत्॥'],
        'सविता की प्रेरणा से प्राचीन ब्रह्म का सेवन करो। उसमें अपना आश्रय (योनि) बनाओ; (तब) तेरा पूर्व-पुण्य तुझे (बन्धन में) नहीं डालेगा।',
        'By the impulse of Savitṛ, delight in the ancient Brahman. Make your dwelling there; then your past deeds will not bind you.'
      ),
      M(
        ['त्रिरुन्नतं स्थाप्य समं शरीरं हृदीन्द्रियाणि मनसा सन्निवेश्य।', 'ब्रह्मोडुपेन प्रतरेत विद्वान्स्रोतांसि सर्वाणि भयावहानि॥'],
        'शरीर के तीन भागों (छाती, गर्दन, सिर) को ऊँचा और सम रखकर, इन्द्रियों को मन के द्वारा हृदय में स्थापित करके, विद्वान् ब्रह्म-रूपी नाव से सभी भयदायक (संसार-) स्रोतों को पार करे।',
        'Holding the body steady with its three upper parts erect, drawing the senses with the mind into the heart, the wise one should cross all the fearful streams with the boat of Brahman.'
      ),
      M(
        ['प्राणान्प्रपीड्येह संयुक्तचेष्टः क्षीणे प्राणे नासिकयोच्छ्वसीत।', 'दुष्टाश्वयुक्तमिव वाहमेनं विद्वान्मनो धारयेताप्रमत्तः॥'],
        'यहाँ (इस शरीर में) क्रियाओं को संयत रखकर प्राणों को नियन्त्रित करे और प्राण क्षीण होने पर नासिका से धीरे साँस छोड़े। दुष्ट घोड़ों से जुड़े रथ की तरह इस मन को विद्वान् सावधान रहकर वश में रखे।',
        'Restraining the breaths here, with movements controlled, one should breathe out gently through the nostrils when the breath is spent. The wise one, ever alert, should hold the mind as a driver holds a chariot yoked to restive horses.'
      ),
      M(
        ['समे शुचौ शर्करावह्निवालुकाविवर्जिते शब्दजलाश्रयादिभिः।', 'मनोऽनुकूले न तु चक्षुपीडने गुहानिवाताश्रयणे प्रयोजयेत्॥'],
        'सम, शुद्ध, कंकड़-अग्नि-बालू से रहित, शब्द और जलाशय आदि (के कोलाहल) से दूर, मन के अनुकूल, नेत्रों को न चुभने वाले, गुफा-जैसे वायुरहित आश्रय में (योग का) अभ्यास करे।',
        'In a level, clean place free of pebbles, fire and sand, free of noise and standing water, pleasing to the mind and not painful to the eye, in a sheltered, windless spot like a cave — there one should practise yoga.'
      ),
      M(
        ['नीहारधूमार्कानिलानलानां खद्योतविद्युत्स्फटिकशशीनाम्।', 'एतानि रूपाणि पुरःसराणि ब्रह्मण्यभिव्यक्तिकराणि योगे॥'],
        'कुहरा, धूम, सूर्य, वायु, अग्नि, खद्योत (जुगनू), विद्युत्, स्फटिक और चन्द्र — ये रूप योग में ब्रह्म की अभिव्यक्ति से पहले प्रकट होने वाले (चिह्न) हैं।',
        'Mist, smoke, sun, wind, fire, fireflies, lightning, crystal and moon — these are the forms that appear as forerunners, heralding the manifestation of Brahman in yoga.'
      ),
      M(
        ['पृथ्व्यप्तेजोऽनिलखे समुत्थिते पञ्चात्मके योगगुणे प्रवृत्ते।', 'न तस्य रोगो न जरा न मृत्युः प्राप्तस्य योगाग्निमयं शरीरम्॥'],
        'पृथ्वी, जल, तेज, वायु और आकाश — इन पाँच के (वश में आने पर) पाँच प्रकार का योग-गुण प्रवृत्त होता है। जिसने योगाग्निमय शरीर पा लिया है, उसे न रोग है, न जरा, न मृत्यु।',
        'When the fivefold quality of yoga arises with mastery over earth, water, fire, air and space, then for one who has gained a body made of the fire of yoga there is no disease, no old age, no death.'
      ),
      M(
        ['लघुत्वमारोग्यमलोलुपत्वं वर्णप्रसादं स्वरसौष्ठवं च।', 'गन्धः शुभो मूत्रपुरीषमल्पं योगप्रवृत्तिं प्रथमां वदन्ति॥'],
        'शरीर की लघुता, आरोग्य, निर्लोभता, वर्ण की निर्मलता, स्वर की मधुरता, शुभ गन्ध और मल-मूत्र की अल्पता — इन्हें योग की प्रथम प्रवृत्ति (लक्षण) कहते हैं।',
        'Lightness, health, freedom from craving, clearness of complexion, sweetness of voice, a pleasant odour and scanty excretions — these, they say, are the first signs of progress in yoga.'
      ),
      M(
        ['यथैव बिम्बं मृदयोपलिप्तं तेजोमयं भ्राजते तत्सुधान्तम्।', 'तद्वात्मतत्त्वं प्रसमीक्ष्य देही एकः कृतार्थो भवते वीतशोकः॥'],
        'जैसे मिट्टी से ढका हुआ (सोने का) बिम्ब भली प्रकार साफ किये जाने पर तेजोमय होकर चमकता है, वैसे ही आत्म-तत्त्व को साक्षात् देखकर देहधारी एक (अद्वैत), कृतार्थ और शोकरहित हो जाता है।',
        'As a mirror covered with dust shines brightly when well cleaned, so the embodied one, having seen the truth of the Self, becomes one, fulfilled and free from sorrow.'
      ),
      M(
        ['यदात्मतत्त्वेन तु ब्रह्मतत्त्वं दीपोपमेनेह युक्तः प्रपश्येत्।', 'अजं ध्रुवं सर्वतत्त्वैर्विशुद्धं ज्ञात्वा देवं मुच्यते सर्वपाशैः॥'],
        'जब योगयुक्त (साधक) दीपक-सदृश आत्म-तत्त्व द्वारा यहाँ ब्रह्म-तत्त्व को देखता है — उस अजन्मा, ध्रुव, सब तत्त्वों से शुद्ध देव को जानकर वह सब पाशों से मुक्त हो जाता है।',
        'When the yogin here perceives the truth of Brahman through the truth of the Self, like a lamp — knowing the Divine, unborn, unchanging, free of all elements, he is released from all bonds.'
      ),
      M(
        ['एषो ह देवः प्रदिशोऽनु सर्वाः पूर्वो ह जातः स उ गर्भे अन्तः।', 'स एव जातः स जनिष्यमाणः प्रत्यङ्जनांस्तिष्ठति सर्वतोमुखः॥'],
        'यह देव सब दिशाओं में व्याप्त है; वह पहले (हिरण्यगर्भ रूप में) उत्पन्न हुआ और वही गर्भ के भीतर है। वही उत्पन्न हुआ है, वही उत्पन्न होगा; वह सर्वतोमुख (होकर) सब जनों के भीतर स्थित है।',
        'This God pervades all the directions; He was born first, and He is within the womb. He alone has been born, He will be born; He stands facing all, within every being.'
      ),
      M(
        ['यो देवोऽग्नौ योऽप्सु यो विश्वं भुवनमाविवेश।', 'य ओषधीषु यो वनस्पतिषु तस्मै देवाय नमो नमः॥'],
        'जो देव अग्नि में है, जो जल में है, जो समस्त भुवन में प्रविष्ट है, जो ओषधियों में है, जो वनस्पतियों में है — उस देव को बार-बार नमस्कार।',
        'The God who is in fire, who is in water, who has entered the whole world, who is in the herbs, who is in the trees — to that God, salutation, salutation.'
      ),
    ],
    // ── Adhyāya 3 — Rudra, the one Lord ────────────────────────────────────
    [
      M(
        ['य एको जालवानीशत ईशनीभिः सर्वांल्लोकानीशत ईशनीभिः।', 'य एवैक उद्भवे सम्भवे च य एतद्विदुरमृतास्ते भवन्ति॥'],
        'जो एक, माया-जाल का स्वामी, अपनी ईशन-शक्तियों से शासन करता है — सब लोकों पर अपनी शक्तियों से शासन करता है; जो (जगत् की) उत्पत्ति और स्थिति में एक ही है — जो इसे जानते हैं, वे अमर हो जाते हैं।',
        'He who is one, the wielder of the net, rules by His ruling powers — rules all the worlds by His powers; He who alone is the same in their arising and their continuance — those who know this become immortal.'
      ),
      M(
        ['एको हि रुद्रो न द्वितीयाय तस्थुर्य इमांल्लोकानीशत ईशनीभिः।', 'प्रत्यङ्जनांस्तिष्ठति सञ्चुकोचान्तकाले संसृज्य विश्वा भुवनानि गोपाः॥'],
        'रुद्र एक ही है; (ज्ञानी) दूसरे को स्वीकार नहीं करते — जो इन लोकों पर अपनी शक्तियों से शासन करता है। वह सब जनों के भीतर स्थित है; सब भुवनों को रचकर, रक्षक (वह) अन्तकाल में उन्हें समेट लेता है।',
        'Rudra is one; they admit no second — He who rules these worlds by His powers. He stands within all beings; having created all the worlds, He, their protector, draws them in at the end of time.'
      ),
      M(
        ['विश्वतश्चक्षुरुत विश्वतोमुखो विश्वतोबाहुरुत विश्वतस्पात्।', 'सं बाहुभ्यां धमति सं पतत्रैर्द्यावाभूमी जनयन्देव एकः॥'],
        'सब ओर नेत्र वाला, सब ओर मुख वाला, सब ओर बाहु वाला और सब ओर पैर वाला वह एक देव द्युलोक और पृथ्वी को उत्पन्न करता हुआ (मनुष्यों को) बाहुओं से और (पक्षियों को) पंखों से युक्त करता है।',
        'With eyes on every side, faces on every side, arms on every side, feet on every side — the one God, creating heaven and earth, fashions them with His arms and with wings.'
      ),
      M(
        ['यो देवानां प्रभवश्चोद्भवश्च विश्वाधिपो रुद्रो महर्षिः।', 'हिरण्यगर्भं जनयामास पूर्वं स नो बुद्ध्या शुभया संयुनक्तु॥'],
        'जो देवों का उद्गम और उन्नति (का कारण) है, विश्व का अधिपति, महर्षि (सर्वज्ञ) रुद्र है, जिसने पहले हिरण्यगर्भ को उत्पन्न किया — वह हमें शुभ बुद्धि से युक्त करे।',
        'He who is the source and the origin of the gods, the lord of all, Rudra the great seer, who of old brought forth Hiraṇyagarbha — may He endow us with clear understanding.'
      ),
      M(
        ['या ते रुद्र शिवा तनूरघोराऽपापकाशिनी।', 'तया नस्तनुवा शन्तमया गिरिशन्ताभिचाकशीहि॥'],
        'हे रुद्र! तुम्हारा जो शिव (मंगलमय), अघोर (शान्त) और पाप को दूर करने वाला रूप है — हे पर्वत पर बसकर सुख देने वाले! उस परम कल्याणकारी रूप से हमें देखो।',
        'O Rudra, that body of yours which is gracious, not terrible, revealing no evil — with that most benign body, O dweller on the mountain who brings peace, look upon us.'
      ),
      M(
        ['यामिषुं गिरिशन्त हस्ते बिभर्ष्यस्तवे।', 'शिवां गिरित्र तां कुरु मा हिंसीः पुरुषं जगत्॥'],
        'हे गिरिशन्त! जो बाण तुम हाथ में फेंकने के लिए धारण करते हो — हे पर्वत के रक्षक! उसे शान्त करो; पुरुष और जगत् की हिंसा न करो।',
        'O dweller on the mountain, the arrow you hold in your hand to shoot — make it benign, O guardian of the mountain; do not harm man or the world.'
      ),
      M(
        ['ततः परं ब्रह्म परं बृहन्तं यथानिकायं सर्वभूतेषु गूढम्।', 'विश्वस्यैकं परिवेष्टितारमीशं तं ज्ञात्वामृता भवन्ति॥'],
        'उससे (जगत् से) परे, परम, महान्, प्रत्येक शरीर के अनुसार सब भूतों में छिपे हुए, विश्व को घेरे रहने वाले उस एक ईश्वर को जानकर (मनुष्य) अमर हो जाते हैं।',
        'Higher than this, the supreme Brahman, the vast one, hidden in all beings according to their bodies, the one who encompasses the universe — knowing Him as the Lord, they become immortal.'
      ),
      M(
        ['वेदाहमेतं पुरुषं महान्तमादित्यवर्णं तमसः परस्तात्।', 'तमेव विदित्वाति मृत्युमेति नान्यः पन्था विद्यतेऽयनाय॥'],
        'मैं इस महान् पुरुष को जानता हूँ, जो सूर्य-सा प्रकाशमान और अन्धकार से परे है। उसी को जानकर (मनुष्य) मृत्यु को पार करता है; (मोक्ष-) गमन के लिए दूसरा मार्ग नहीं है।',
        'I know this great Person, luminous like the sun, beyond darkness. Knowing Him alone one passes beyond death; there is no other path for going.'
      ),
      M(
        ['यस्मात्परं नापरमस्ति किञ्चिद्यस्मान्नाणीयो न ज्यायोऽस्ति कश्चित्।', 'वृक्ष इव स्तब्धो दिवि तिष्ठत्येकस्तेनेदं पूर्णं पुरुषेण सर्वम्॥'],
        'जिससे परे या भिन्न कुछ भी नहीं है, जिससे सूक्ष्मतर या महत्तर कोई नहीं है, जो वृक्ष की तरह निश्चल होकर अपने प्रकाश (स्व-महिमा) में एक स्थित है — उस पुरुष से यह सब पूर्ण है।',
        'Than whom there is nothing higher or other, than whom there is nothing smaller or greater, who stands alone, unmoving as a tree, in His own light — by that Person is all this filled.'
      ),
      M(
        ['ततो यदुत्तरतरं तदरूपमनामयम्।', 'य एतद्विदुरमृतास्ते भवन्ति अथेतरे दुःखमेवापियन्ति॥'],
        'उस (जगत्) से जो अत्यन्त परे है, वह रूपरहित और रोगरहित (दोषरहित) है। जो इसे जानते हैं वे अमर हो जाते हैं; और दूसरे दुःख ही को प्राप्त होते हैं।',
        'That which is far higher than this world is formless and free from ill. Those who know it become immortal; the rest go only to sorrow.'
      ),
      M(
        ['सर्वाननशिरोग्रीवः सर्वभूतगुहाशयः।', 'सर्वव्यापी स भगवांस्तस्मात्सर्वगतः शिवः॥'],
        'सब मुख, सिर और ग्रीवाएँ जिसकी हैं, जो सब भूतों की हृदय-गुहा में स्थित है, वह भगवान् सर्वव्यापी है; इसलिए वह शिव सर्वगत है।',
        'His are all faces, heads and necks; He dwells in the heart-cave of all beings; He, the Lord, pervades all; therefore Śiva is present everywhere.'
      ),
      M(
        ['महान्प्रभुर्वै पुरुषः सत्त्वस्यैष प्रवर्तकः।', 'सुनिर्मलामिमां प्राप्तिमीशानो ज्योतिरव्ययः॥'],
        'वह पुरुष महान् प्रभु है; वही सत्त्व (अन्तःकरण) का प्रवर्तक है, इस अत्यन्त निर्मल प्राप्ति (मोक्ष) का शासक, अविनाशी ज्योति है।',
        'That Person is the great Lord; He sets the mind in motion; He is the ruler who grants this pure attainment, the imperishable light.'
      ),
      M(
        ['अङ्गुष्ठमात्रः पुरुषोऽन्तरात्मा सदा जनानां हृदये सन्निविष्टः।', 'हृदा मन्वीशो मनसाभिक्लृप्तो य एतद्विदुरमृतास्ते भवन्ति॥'],
        'अंगुष्ठ-मात्र (परिमाण वाला) पुरुष, अन्तरात्मा, सदा जनों के हृदय में स्थित है। वह ईश हृदय, मनन और मन से प्रकट होता है; जो इसे जानते हैं वे अमर हो जाते हैं।',
        'The Person of the size of a thumb, the inner Self, ever dwells in the heart of beings. He, the Lord, is revealed through the heart, through reflection and through the mind; those who know this become immortal.'
      ),
      M(
        ['सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात्।', 'स भूमिं विश्वतो वृत्वात्यतिष्ठद्दशाङ्गुलम्॥'],
        'वह पुरुष सहस्र सिरों वाला, सहस्र नेत्रों वाला और सहस्र पैरों वाला है। वह पृथ्वी (ब्रह्माण्ड) को सब ओर से घेरकर दस अंगुल (उससे परे) भी स्थित है।',
        'The Person has a thousand heads, a thousand eyes, a thousand feet. Encompassing the earth on every side, He stands beyond it by ten fingers\' breadth.'
      ),
      M(
        ['पुरुष एवेदं सर्वं यद्भूतं यच्च भव्यम्।', 'उतामृतत्वस्येशानो यदन्नेनातिरोहति॥'],
        'जो हो चुका और जो होने वाला है — यह सब पुरुष ही है। वह अमरत्व का स्वामी है और जो अन्न से बढ़ता है (उस जगत् का) भी।',
        'The Person alone is all this, what has been and what shall be. He is the lord of immortality and of all that grows by food.'
      ),
      M(
        ['सर्वतः पाणिपादं तत्सर्वतोऽक्षिशिरोमुखम्।', 'सर्वतः श्रुतिमल्लोके सर्वमावृत्य तिष्ठति॥'],
        'सब ओर हाथ-पैर वाला, सब ओर नेत्र, सिर और मुख वाला, सब ओर कानों वाला वह (ब्रह्म) लोक में सबको व्याप्त करके स्थित है।',
        'With hands and feet everywhere, eyes, heads and faces everywhere, ears everywhere — That stands in the world enveloping all.'
      ),
      M(
        ['सर्वेन्द्रियगुणाभासं सर्वेन्द्रियविवर्जितम्।', 'सर्वस्य प्रभुमीशानं सर्वस्य शरणं बृहत्॥'],
        'सब इन्द्रियों के गुणों को प्रकाशित करने वाला, (फिर भी) सब इन्द्रियों से रहित, सबका प्रभु और शासक, सबका आश्रय, महान् (वह ब्रह्म है)।',
        'Shining through the qualities of all the senses, yet devoid of all senses; the master and ruler of all, the great refuge of all.'
      ),
      M(
        ['नवद्वारे पुरे देही हंसो लेलायते बहिः।', 'वशी सर्वस्य लोकस्य स्थावरस्य चरस्य च॥'],
        'नौ द्वारों वाले (शरीर-) नगर में देही हंस (जीव) बाहर (विषयों में) चंचल होता है — (वस्तुतः वह) समस्त स्थावर और जंगम लोक का नियन्ता है।',
        'In the city of nine gates the embodied swan flutters outward — He who is the master of the whole world, of all that stands and all that moves.'
      ),
      M(
        ['अपाणिपादो जवनो ग्रहीता पश्यत्यचक्षुः स शृणोत्यकर्णः।', 'स वेत्ति वेद्यं न च तस्यास्ति वेत्ता तमाहुरग्र्यं पुरुषं महान्तम्॥'],
        'हाथ-पैर से रहित (होकर भी) वह वेगवान् और ग्रहण करने वाला है; बिना नेत्र देखता है, बिना कान सुनता है। वह जानने योग्य सबको जानता है, पर उसका कोई ज्ञाता नहीं है। उसे अग्रगण्य महान् पुरुष कहते हैं।',
        'Without hands or feet He is swift and grasps; without eyes He sees, without ears He hears. He knows all that is to be known, but of Him there is no knower. They call Him the foremost, the great Person.'
      ),
      M(
        ['अणोरणीयान्महतो महीयानात्मा गुहायां निहितोऽस्य जन्तोः।', 'तमक्रतुं पश्यति वीतशोको धातुः प्रसादान्महिमानमीशम्॥'],
        'अणु से अणु और महान् से महान् आत्मा इस जीव की हृदय-गुहा में स्थित है। धाता (ईश्वर/इन्द्रिय-निग्रह) की कृपा से शोकरहित (साधक) उस निष्काम ईश की महिमा को देखता है।',
        'Subtler than the subtle, greater than the great, the Self is set in the heart-cave of this creature. By the grace of the Creator one freed from sorrow sees Him, the desireless Lord, and His majesty.'
      ),
      M(
        ['वेदाहमेतमजरं पुराणं सर्वात्मानं सर्वगतं विभुत्वात्।', 'जन्मनिरोधं प्रवदन्ति यस्य ब्रह्मवादिनो हि प्रवदन्ति नित्यम्॥'],
        'मैं इस अजर, पुराण, सर्वात्मा को जानता हूँ, जो विभुत्व से सर्वगत है; जिसका जन्म-निरोध (जन्म का अभाव) ब्रह्मवादी कहते हैं और उसे नित्य कहते हैं।',
        'I know this ageless, ancient one, the Self of all, present everywhere by His all-pervading nature; of whom those who discourse on Brahman declare that birth is stopped, and whom they declare eternal.'
      ),
    ],
    // ── Adhyāya 4 — The one God of many forms ─────────────────────────────
    [
      M(
        ['य एकोऽवर्णो बहुधा शक्तियोगाद्वर्णाननेकान्निहितार्थो दधाति।', 'वि चैति चान्ते विश्वमादौ स देवः स नो बुद्ध्या शुभया संयुनक्तु॥'],
        'जो एक, वर्णरहित (होकर भी) अपनी शक्ति के योग से गुप्त प्रयोजन से अनेक वर्णों (रूपों) को धारण करता है; जिसमें आदि में विश्व (उत्पन्न होकर) अन्त में लीन हो जाता है — वह देव हमें शुभ बुद्धि से युक्त करे।',
        'He who is one and without colour, yet by the manifold use of His power assumes many colours for a hidden purpose; into whom the universe dissolves at the end, from whom it arose in the beginning — may that God endow us with clear understanding.'
      ),
      M(
        ['तदेवाग्निस्तदादित्यस्तद्वायुस्तदु चन्द्रमाः।', 'तदेव शुक्रं तद्ब्रह्म तदापस्तत्प्रजापतिः॥'],
        'वही अग्नि है, वही सूर्य है, वही वायु है, वही चन्द्रमा है। वही शुक्र (नक्षत्र-प्रकाश) है, वही ब्रह्म (हिरण्यगर्भ) है, वही जल है, वही प्रजापति है।',
        'That alone is fire, That is the sun, That is the wind, That is the moon. That is the bright one, That is Brahmā, That is the waters, That is Prajāpati.'
      ),
      M(
        ['त्वं स्त्री त्वं पुमानसि त्वं कुमार उत वा कुमारी।', 'त्वं जीर्णो दण्डेन वञ्चसि त्वं जातो भवसि विश्वतोमुखः॥'],
        'तू स्त्री है, तू पुरुष है, तू कुमार है और कुमारी भी। तू ही वृद्ध होकर लाठी के सहारे चलता है; तू ही जन्म लेकर सर्वतोमुख होता है।',
        'You are woman, you are man; you are the youth and the maiden too. You are the old man tottering with a staff; you, being born, become facing every way.'
      ),
      M(
        ['नीलः पतङ्गो हरितो लोहिताक्षस्तडिद्गर्भ ऋतवः समुद्राः।', 'अनादिमत्त्वं विभुत्वेन वर्तसे यतो जातानि भुवनानि विश्वा॥'],
        'तू नीला पतंग (भ्रमर/पक्षी) है, हरा और लाल आँखों वाला (तोता) है, विद्युत् को गर्भ में रखने वाला (मेघ) है, ऋतुएँ और समुद्र है। तू अनादि है; विभुत्व से (सब में) वर्तमान है; तुझसे समस्त भुवन उत्पन्न हुए हैं।',
        'You are the dark-blue bird, the green one with red eyes, the cloud with lightning in its womb, the seasons and the seas. You are without beginning; you exist as the all-pervading one, from whom all the worlds are born.'
      ),
      M(
        ['अजामेकां लोहितशुक्लकृष्णां बह्वीः प्रजाः सृजमानां सरूपाः।', 'अजो ह्येको जुषमाणोऽनुशेते जहात्येनां भुक्तभोगामजोऽन्यः॥'],
        'लाल, श्वेत और काले (रज, सत्त्व, तम) रंगों वाली, अपने समान अनेक प्रजाओं को रचने वाली एक अजा (प्रकृति) है। एक अज (जीव) उसका सेवन करता हुआ उसके साथ लगा रहता है; दूसरा अज (ज्ञानी) भोग चुकी उसे त्याग देता है।',
        'There is one unborn female, red, white and black, producing many offspring like herself. One unborn male lies with her, enjoying her; another unborn male leaves her when her enjoyment is done.'
      ),
      M(
        ['द्वा सुपर्णा सयुजा सखाया समानं वृक्षं परिषस्वजाते।', 'तयोरन्यः पिप्पलं स्वाद्वत्त्यनश्नन्नन्यो अभिचाकशीति॥'],
        'सदा साथ रहने वाले दो सखा पक्षी एक ही वृक्ष (शरीर) पर बसे हैं। उनमें एक (जीव) स्वादिष्ट पीपल-फल (कर्मफल) खाता है; दूसरा (ईश्वर) न खाता हुआ केवल देखता रहता है।',
        'Two birds, close companions, cling to the same tree. Of the two, one eats the sweet fruit; the other looks on without eating.'
      ),
      M(
        ['समाने वृक्षे पुरुषो निमग्नोऽनीशया शोचति मुह्यमानः।', 'जुष्टं यदा पश्यत्यन्यमीशमस्य महिमानमिति वीतशोकः॥'],
        'उसी वृक्ष पर (बैठा) पुरुष (जीव) डूबा हुआ, अपनी असमर्थता से मोहित होकर शोक करता है। जब वह (सबसे) सेवित दूसरे ईश को और उसकी महिमा को देखता है, तब शोकरहित हो जाता है।',
        'On the same tree the person, sunk and deluded, grieves at his own helplessness. When he sees the other, the Lord who is worshipped, and His greatness, he becomes free from sorrow.'
      ),
      M(
        ['ऋचो अक्षरे परमे व्योमन्यस्मिन्देवा अधि विश्वे निषेदुः।', 'यस्तं न वेद किमृचा करिष्यति य इत्तद्विदुस्त इमे समासते॥'],
        'जिस अक्षर, परम आकाश (ब्रह्म) में ऋचाएँ (वेद) हैं और जिसमें सब देवता आश्रित हैं — जो उसे नहीं जानता, वह ऋचा से क्या करेगा? जो उसे जानते हैं, वे ही (ब्रह्म में) स्थित होते हैं।',
        'The hymns dwell in the imperishable, supreme space, in which all the gods are seated. What can one who does not know Him do with the hymns? Those who know Him — they indeed abide in Him.'
      ),
      M(
        ['छन्दांसि यज्ञाः क्रतवो व्रतानि भूतं भव्यं यच्च वेदा वदन्ति।', 'अस्मान्मायी सृजते विश्वमेतत्तस्मिंश्चान्यो मायया सन्निरुद्धः॥'],
        'छन्द (वेद), यज्ञ, क्रतु, व्रत, भूत, भविष्य और जो वेद कहते हैं — यह सब विश्व मायावी (ईश्वर) इससे (अक्षर से) रचता है; और उसमें दूसरा (जीव) माया से बँधा हुआ है।',
        'The Vedas, the sacrifices, the rites, the vows, the past, the future and all the Vedas declare — from this the wielder of māyā creates this whole universe, and in it the other is confined by māyā.'
      ),
      M(
        ['मायां तु प्रकृतिं विद्यान्मायिनं तु महेश्वरम्।', 'तस्यावयवभूतैस्तु व्याप्तं सर्वमिदं जगत्॥'],
        'माया को प्रकृति जानो और मायावी को महेश्वर। उसके अवयव-रूप (भूतों) से यह सारा जगत् व्याप्त है।',
        'Know then that nature is māyā, and the great Lord is the wielder of māyā. This whole world is pervaded by beings that are parts of Him.'
      ),
      M(
        ['यो योनिं योनिमधितिष्ठत्येको यस्मिन्निदं सं च वि चैति सर्वम्।', 'तमीशानं वरदं देवमीड्यं निचाय्येमां शान्तिमत्यन्तमेति॥'],
        'जो एक प्रत्येक योनि (कारण) पर अधिष्ठित है, जिसमें यह सब एक होता और विलीन होता है — उस वरदायक, स्तुत्य ईशान देव को साक्षात् करके (साधक) इस अत्यन्त शान्ति को प्राप्त होता है।',
        'He who alone presides over every source, in whom all this comes together and dissolves — having realised Him, the ruler, the giver of boons, the adorable God, one attains this peace forever.'
      ),
      M(
        ['यो देवानां प्रभवश्चोद्भवश्च विश्वाधिपो रुद्रो महर्षिः।', 'हिरण्यगर्भं पश्यत जायमानं स नो बुद्ध्या शुभया संयुनक्तु॥'],
        'जो देवों का उद्गम और उन्नति (का कारण) है, विश्व का अधिपति, महर्षि रुद्र है, जिसने हिरण्यगर्भ को उत्पन्न होते देखा — वह हमें शुभ बुद्धि से युक्त करे।',
        'He who is the source and the origin of the gods, the lord of all, Rudra the great seer, who beheld Hiraṇyagarbha being born — may He endow us with clear understanding.'
      ),
      M(
        ['यो देवानामधिपो यस्मिंल्लोका अधिश्रिताः।', 'य ईशे अस्य द्विपदश्चतुष्पदः कस्मै देवाय हविषा विधेम॥'],
        'जो देवों का अधिपति है, जिसमें लोक आश्रित हैं, जो इन दो पैर और चार पैर वालों पर शासन करता है — उस (आनन्दरूप) देव के लिए हम हवि से यजन करें।',
        'He who is the overlord of the gods, in whom the worlds rest, who rules over these two-footed and four-footed beings — to which God shall we offer our oblation? To Him, the blissful one.'
      ),
      M(
        ['सूक्ष्मातिसूक्ष्मं कलिलस्य मध्ये विश्वस्य स्रष्टारमनेकरूपम्।', 'विश्वस्यैकं परिवेष्टितारं ज्ञात्वा शिवं शान्तिमत्यन्तमेति॥'],
        'सूक्ष्म से भी अति सूक्ष्म, (संसार-) कोलाहल के मध्य में स्थित, विश्व के अनेकरूप स्रष्टा, विश्व को घेरे रहने वाले उस एक शिव को जानकर (साधक) अत्यन्त शान्ति को प्राप्त होता है।',
        'Subtler than the subtlest, in the midst of this confusion, the creator of the universe in many forms, the one who encompasses all — knowing Him as Śiva, the auspicious, one attains peace forever.'
      ),
      M(
        ['स एव काले भुवनस्य गोप्ता विश्वाधिपः सर्वभूतेषु गूढः।', 'यस्मिन्युक्ता ब्रह्मर्षयो देवताश्च तमेवं ज्ञात्वा मृत्युपाशांश्छिनत्ति॥'],
        'वही (सृष्टि-) काल में भुवन का रक्षक, विश्व का अधिपति, सब भूतों में छिपा हुआ है; जिसमें ब्रह्मर्षि और देवता युक्त (लीन) हैं — उसे इस प्रकार जानकर (साधक) मृत्यु के पाशों को काट देता है।',
        'He alone is the guardian of the world in time, the lord of all, hidden in all beings, in whom the seers of Brahman and the gods are united. Knowing Him thus, one cuts the snares of death.'
      ),
      M(
        ['घृतात्परं मण्डमिवातिसूक्ष्मं ज्ञात्वा शिवं सर्वभूतेषु गूढम्।', 'विश्वस्यैकं परिवेष्टितारं ज्ञात्वा देवं मुच्यते सर्वपाशैः॥'],
        'घी के ऊपर की मलाई (सार) से भी अति सूक्ष्म, सब भूतों में छिपे हुए शिव को जानकर, विश्व को घेरे रहने वाले उस एक देव को जानकर (साधक) सब पाशों से मुक्त हो जाता है।',
        'Knowing Śiva, hidden in all beings, subtler than the finest cream on clarified butter, knowing the one God who encompasses the universe — one is released from all bonds.'
      ),
      M(
        ['एष देवो विश्वकर्मा महात्मा सदा जनानां हृदये सन्निविष्टः।', 'हृदा मनीषा मनसाभिक्लृप्तो य एतद्विदुरमृतास्ते भवन्ति॥'],
        'यह विश्वकर्मा, महात्मा देव सदा जनों के हृदय में स्थित है। वह हृदय, बुद्धि और मन से प्रकट होता है; जो इसे जानते हैं वे अमर हो जाते हैं।',
        'This God, the maker of all, the great Self, ever dwells in the heart of beings. He is revealed through the heart, through insight and through the mind; those who know this become immortal.'
      ),
      M(
        ['यदाऽतमस्तन्न दिवा न रात्रिर्न सन्नचासच्छिव एव केवलः।', 'तदक्षरं तत्सवितुर्वरेण्यं प्रज्ञा च तस्मात्प्रसृता पुराणी॥'],
        'जब अन्धकार (अज्ञान) नहीं रहता, तब न दिन है न रात, न सत् है न असत् — केवल शिव ही है। वह अक्षर है, वह सविता का वरणीय (तेज) है; और उससे पुरातन प्रज्ञा प्रसृत हुई है।',
        'When there is no darkness, then there is neither day nor night, neither being nor non-being — only Śiva alone. That is the imperishable, that is the adorable light of Savitṛ; and from it has flowed the ancient wisdom.'
      ),
      M(
        ['नैनमूर्ध्वं न तिर्यञ्चं न मध्ये परिजग्रभत्।', 'न तस्य प्रतिमा अस्ति यस्य नाम महद्यशः॥'],
        'उसे कोई न ऊपर, न तिरछे, न मध्य में पकड़ सका। जिसका नाम ही महान् यश है, उसकी कोई प्रतिमा (उपमा) नहीं है।',
        'None has grasped Him above, across or in the middle. There is no likeness of Him whose name is Great Glory.'
      ),
      M(
        ['न सन्दृशे तिष्ठति रूपमस्य न चक्षुषा पश्यति कश्चनैनम्।', 'हृदा हृदिस्थं मनसा य एनमेवं विदुरमृतास्ते भवन्ति॥'],
        'उसका रूप दृष्टि-क्षेत्र में नहीं आता; उसे कोई नेत्र से नहीं देखता। हृदय में स्थित उसे जो हृदय और मन से (ध्यान द्वारा) इस प्रकार जानते हैं, वे अमर हो जाते हैं।',
        'His form does not stand within sight; no one sees Him with the eye. Those who know Him thus, dwelling in the heart, by the heart and the mind — they become immortal.'
      ),
      M(
        ['अजात इत्येवं कश्चिद्भीरुः प्रपद्यते।', 'रुद्र यत्ते दक्षिणं मुखं तेन मां पाहि नित्यम्॥'],
        '"तू अजन्मा है" — ऐसा (जानकर) कोई (संसार से) भयभीत तेरी शरण लेता है। हे रुद्र! तेरा जो दक्षिण (अनुग्रहशील) मुख है, उससे मेरी सदा रक्षा कर।',
        '"You are unborn" — so some fearful one takes refuge in you. O Rudra, with that face of yours which is gracious, protect me always.'
      ),
      M(
        ['मा नस्तोके तनये मा न आयुषि मा नो गोषु मा नो अश्वेषु रीरिषः।', 'वीरान्मा नो रुद्र भामितोऽवधीर्हविष्मन्तः सदमित्त्वा हवामहे॥'],
        'हे रुद्र! हमारे बच्चों, सन्तानों, आयु, गौओं और घोड़ों को हानि न पहुँचा। क्रुद्ध होकर हमारे वीरों का वध न कर। हवि लेकर हम सदा तुझे ही पुकारते हैं।',
        'Harm not our children or our descendants, our life, our cattle or our horses. Slay not our heroes in your anger, O Rudra. Bearing oblations, we ever call upon you.'
      ),
    ],
    // ── Adhyāya 5 — Knowledge and ignorance ───────────────────────────────
    [
      M(
        ['द्वे अक्षरे ब्रह्मपरे त्वनन्ते विद्याविद्ये निहिते यत्र गूढे।', 'क्षरं त्वविद्या ह्यमृतं तु विद्या विद्याविद्ये ईशते यस्तु सोऽन्यः॥'],
        'अक्षर, अनन्त, परब्रह्म में विद्या और अविद्या दोनों गूढ़ रूप से स्थित हैं। अविद्या क्षर (नाशवान्) है और विद्या अमृत है; किन्तु जो विद्या और अविद्या पर शासन करता है, वह (इन दोनों से) भिन्न है।',
        'In the imperishable, infinite, supreme Brahman are hidden the two, knowledge and ignorance. Ignorance is perishable, knowledge is immortal; but He who rules over both knowledge and ignorance is other than they.'
      ),
      M(
        ['यो योनिं योनिमधितिष्ठत्येको विश्वानि रूपाणि योनीश्च सर्वाः।', 'ऋषिं प्रसूतं कपिलं यस्तमग्रे ज्ञानैर्बिभर्ति जायमानं च पश्येत्॥'],
        'जो एक प्रत्येक योनि पर, समस्त रूपों और सब योनियों पर अधिष्ठित है; जो आदि में उत्पन्न कपिल (हिरण्यगर्भ) ऋषि को ज्ञानों से पुष्ट करता है और उसे जन्म लेते देखता है —',
        'He who alone presides over every source, over all forms and all sources; who in the beginning bore the seer Kapila (Hiraṇyagarbha) when he was born, and filled him with knowledge, and watched him being born —'
      ),
      M(
        ['एकैकं जालं बहुधा विकुर्वन्नस्मिन्क्षेत्रे संहरत्येष देवः।', 'भूयः सृष्ट्वा यतयस्तथेशः सर्वाधिपत्यं कुरुते महात्मा॥'],
        'यह देव एक-एक जाल (जगत्) को अनेक प्रकार से फैलाकर इस क्षेत्र में फिर समेट लेता है। यति (प्रजापति) आदि को फिर रचकर वह ईश, महात्मा, सब पर आधिपत्य करता है।',
        'This God, spreading out each net in many ways, gathers it in again within this field. Having created once more the lords of beings, the great Lord exercises sovereignty over all.'
      ),
      M(
        ['सर्वा दिश ऊर्ध्वमधश्च तिर्यक्प्रकाशयन्भ्राजते यद्वनड्वान्।', 'एवं स देवो भगवान्वरेण्यो योनिस्वभावानधितिष्ठत्येकः॥'],
        'जैसे सूर्य ऊपर, नीचे और तिरछे — सब दिशाओं को प्रकाशित करता हुआ चमकता है, वैसे ही वह वरणीय भगवान् देव एक ही (सब) योनियों और स्वभावों पर अधिष्ठित है।',
        'As the sun shines, illumining all the directions, above, below and across, so that adorable God, the Lord, alone presides over all sources and natures.'
      ),
      M(
        ['यच्च स्वभावं पचति विश्वयोनिः पाच्यांश्च सर्वान्परिणामयेद्यः।', 'सर्वमेतद्विश्वमधितिष्ठत्येको गुणांश्च सर्वान्विनियोजयेद्यः॥'],
        'जो विश्व-योनि (ईश्वर) स्वभाव (प्रकृति) को परिपक्व करता है और सब परिपाक्य (जीवों) को परिणत करता है; जो एक इस सारे विश्व पर अधिष्ठित है और सब गुणों को नियोजित करता है —',
        'He, the source of all, who ripens nature and transforms all that is to be ripened; who alone presides over this whole universe and directs all the qualities —'
      ),
      M(
        ['तद्वेदगुह्योपनिषत्सु गूढं तद्ब्रह्मा वेदते ब्रह्मयोनिम्।', 'ये पूर्वं देवा ऋषयश्च तद्विदुस्ते तन्मया अमृता वै बभूवुः॥'],
        'वह वेद के गुह्य (भाग) उपनिषदों में छिपा है; ब्रह्मा उसे ब्रह्म (वेद) की योनि जानते हैं। पूर्वकाल के जो देव और ऋषि उसे जानते थे, वे तन्मय होकर अमर हो गये।',
        'That is hidden in the Upaniṣads, the secret part of the Veda; Brahmā knows it as the source of the Veda. The gods and seers of old who knew it became one with it and immortal.'
      ),
      M(
        ['गुणान्वयो यः फलकर्मकर्ता कृतस्य तस्यैव स चोपभोक्ता।', 'स विश्वरूपस्त्रिगुणस्त्रिवर्त्मा प्राणाधिपः सञ्चरति स्वकर्मभिः॥'],
        'जो गुणों से युक्त, फलदायक कर्मों का कर्ता है, वही अपने किये का भोक्ता भी है। वह विश्वरूप, त्रिगुण, तीन मार्गों (ऊँच-नीच-मध्य गति) वाला, प्राणों का अधिपति (जीव) अपने कर्मों से (योनियों में) भ्रमण करता है।',
        'He who is joined to the qualities and does works that bear fruit — he is the enjoyer of what he has done. Of all forms, of three qualities, of three paths, lord of the vital breaths, he wanders according to his own deeds.'
      ),
      M(
        ['अङ्गुष्ठमात्रो रवितुल्यरूपः सङ्कल्पाहङ्कारसमन्वितो यः।', 'बुद्धेर्गुणेनात्मगुणेन चैव आराग्रमात्रो ह्यपरोऽपि दृष्टः॥'],
        'जो अंगुष्ठ-मात्र, सूर्य-सदृश प्रकाशरूप, संकल्प और अहंकार से युक्त है; बुद्धि के गुण और शरीर के गुण से (युक्त) वह दूसरा (जीव) सूई की नोक के बराबर (सूक्ष्म) भी देखा गया है।',
        'Of the size of a thumb, of a form like the sun, endowed with will and self-sense; by virtue of the qualities of the intellect and of the body, this other, the soul, is seen to be even of the size of an awl\'s point.'
      ),
      M(
        ['वालाग्रशतभागस्य शतधा कल्पितस्य च।', 'भागो जीवः स विज्ञेयः स चानन्त्याय कल्पते॥'],
        'बाल की नोक के सौवें भाग को फिर सौ भागों में विभक्त करने पर जो भाग हो — जीव को उतना (सूक्ष्म) जानना चाहिए; और वही अनन्तता (ब्रह्म-भाव) के योग्य होता है।',
        'The soul should be known as a part of the hundredth part of the tip of a hair, divided again a hundredfold; and yet it is capable of infinity.'
      ),
      M(
        ['नैव स्त्री न पुमानेष न चैवायं नपुंसकः।', 'यद्यच्छरीरमादत्ते तेने तेने स युज्यते॥'],
        'यह (जीव) न स्त्री है, न पुरुष है, न नपुंसक है। जो-जो शरीर ग्रहण करता है, उस-उस से युक्त हो जाता है।',
        'It is neither female nor male, nor is it neuter. Whatever body it takes on, with that it becomes joined.'
      ),
      M(
        ['सङ्कल्पनस्पर्शनदृष्टिमोहैर्ग्रासाम्बुवृष्ट्या चात्मविवृद्धिजन्म।', 'कर्मानुगान्यनुक्रमेण देही स्थानेषु रूपाण्यभिसम्प्रपद्यते॥'],
        'संकल्प, स्पर्श, दृष्टि और मोह से, तथा अन्न-जल की वर्षा से (जीव-) आत्मा की वृद्धि और जन्म होता है। देहधारी क्रम से कर्मों के अनुसार (विभिन्न) स्थानों में रूपों को प्राप्त होता है।',
        'Through intention, touch, sight and delusion, and through the rain of food and drink, comes the growth and birth of the embodied self. According to its deeds, in due order, the embodied one takes on forms in various states.'
      ),
      M(
        ['स्थूलानि सूक्ष्माणि बहूनि चैव रूपाणि देही स्वगुणैर्वृणोति।', 'क्रियागुणैरात्मगुणैश्च तेषां संयोगहेतुरपरोऽपि दृष्टः॥'],
        'देहधारी अपने गुणों से स्थूल, सूक्ष्म और बहुत-से रूपों को चुनता है। कर्म के गुणों और अपने (मन के) गुणों के कारण उनके संयोग का हेतु वह (जीव) दूसरा (ईश्वर से भिन्न) भी देखा गया है।',
        'The embodied one chooses many forms, gross and subtle, according to its own qualities. By the qualities of its actions and of its mind it is seen as the cause of their union, and as another.'
      ),
      M(
        ['अनाद्यनन्तं कलिलस्य मध्ये विश्वस्य स्रष्टारमनेकरूपम्।', 'विश्वस्यैकं परिवेष्टितारं ज्ञात्वा देवं मुच्यते सर्वपाशैः॥'],
        'आदि-अन्त से रहित, (संसार-) कोलाहल के मध्य में स्थित, विश्व के अनेकरूप स्रष्टा, विश्व को घेरे रहने वाले उस एक देव को जानकर (साधक) सब पाशों से मुक्त हो जाता है।',
        'Without beginning or end, in the midst of this confusion, the creator of the universe in many forms, the one who encompasses all — knowing that God, one is released from all bonds.'
      ),
      M(
        ['भावग्राह्यमनीडाख्यं भावाभावकरं शिवम्।', 'कलासर्गकरं देवं ये विदुस्ते जहुस्तनुम्॥'],
        'जो शुद्ध भाव (मन) से ग्राह्य, "अनीड" (शरीररहित) नाम वाला, भाव (सृष्टि) और अभाव (प्रलय) करने वाला, शिव, कलाओं (तत्त्वों) की सृष्टि करने वाला देव है — जो उसे जानते हैं, वे शरीर (के बन्धन) को छोड़ देते हैं।',
        'He who is to be grasped by pure feeling, called the bodiless, who causes being and non-being, the auspicious one, the God who creates the parts of the world — those who know Him have left the body behind.'
      ),
    ],
    // ── Adhyāya 6 — The supreme Lord ───────────────────────────────────────
    [
      M(
        ['स्वभावमेके कवयो वदन्ति कालं तथान्ये परिमुह्यमानाः।', 'देवस्यैष महिमा तु लोके येनेदं भ्राम्यते ब्रह्मचक्रम्॥'],
        'कुछ विचारक (जगत् का कारण) स्वभाव को कहते हैं, दूसरे मोहित होकर काल को। किन्तु यह लोक में देव की ही महिमा है जिससे यह ब्रह्म-चक्र घुमाया जाता है।',
        'Some sages speak of inherent nature, others, deluded, of time. But it is the greatness of God in the world by which this wheel of Brahman is made to turn.'
      ),
      M(
        ['येनावृतं नित्यमिदं हि सर्वं ज्ञः कालकारो गुणी सर्वविद्यः।', 'तेनेशितं कर्म विवर्तते ह पृथिव्यप्तेजोऽनिलखानि चिन्त्यम्॥'],
        'जिससे यह सब सदा आवृत है, जो ज्ञाता, काल का भी कर्ता, गुणी (सर्वगुणसम्पन्न) और सर्वज्ञ है — उससे शासित होकर (सृष्टि-) कर्म प्रवृत्त होता है, जिसे पृथ्वी, जल, तेज, वायु और आकाश (के रूप में) समझना चाहिए।',
        'He by whom all this is ever enveloped — the knower, the maker of time, possessed of all qualities, all-knowing — governed by Him the work of creation unfolds, to be understood as earth, water, fire, air and space.'
      ),
      M(
        ['तत्कर्म कृत्वा विनिवर्त्य भूयस्तत्त्वस्य तत्त्वेन समेत्य योगम्।', 'एकेन द्वाभ्यां त्रिभिरष्टभिर्वा कालेन चैवात्मगुणैश्च सूक्ष्मैः॥'],
        'वह (कर्म) करके फिर उससे निवृत्त होकर, तत्त्व (परमात्मा) के साथ तत्त्व (अपने वास्तविक स्वरूप) से योग को प्राप्त करके — एक, दो, तीन या आठ (तत्त्वों) से, काल से और सूक्ष्म आत्म-गुणों से (जीव जो जुड़ा था, उससे मुक्त होता है)।',
        'Having done that work and withdrawn again, having entered into union with the Real through the real self — the soul, joined to one, two, three or eight principles, to time and to the subtle qualities of the self, is freed from them.'
      ),
      M(
        ['आरभ्य कर्माणि गुणान्वितानि भावांश्च सर्वान्विनियोजयेद्यः।', 'तेषामभावे कृतकर्मनाशः कर्मक्षये याति स तत्त्वतोऽन्यः॥'],
        'जो गुणों से युक्त कर्मों को आरम्भ करके सब भावों (फलों) को (ईश्वर को) समर्पित करता है — उनके (आसक्ति के) अभाव में किये कर्मों का नाश हो जाता है; कर्म क्षय होने पर वह तत्त्व से भिन्न (दूसरा, मुक्त) हो जाता है।',
        'He who, having undertaken works joined to the qualities, dedicates all their results to God — in the absence of attachment his past works perish; and when his works are exhausted he goes on, other in truth than he was.'
      ),
      M(
        ['आदिः स संयोगनिमित्तहेतुः परस्त्रिकालादकलोऽपि दृष्टः।', 'तं विश्वरूपं भवभूतमीड्यं देवं स्वचित्तस्थमुपास्य पूर्वम्॥'],
        'वह आदि (कारण) है, (जीव-प्रकृति के) संयोग का निमित्त-कारण है, तीनों कालों से परे और कलारहित (अखण्ड) देखा गया है। उस विश्वरूप, संसार के मूल, स्तुत्य देव की अपने चित्त में स्थित रूप से पहले उपासना करके —',
        'He is the beginning, the efficient cause of the conjunction, beyond the three times, seen also as without parts. Having first worshipped that adorable God of universal form, the source of all becoming, as dwelling in one\'s own mind —'
      ),
      M(
        ['स वृक्षकालाकृतिभिः परोऽन्यो यस्मात्प्रपञ्चः परिवर्ततेऽयम्।', 'धर्मावहं पापनुदं भगेशं ज्ञात्वात्मस्थममृतं विश्वधाम॥'],
        'वह (संसार-) वृक्ष, काल और आकृतियों से परे और भिन्न है, जिससे यह प्रपञ्च चलता है। धर्म को लाने वाले, पाप को दूर करने वाले, ऐश्वर्य के स्वामी, अपने में स्थित, अमृत, विश्व के आधार उसे जानकर —',
        'He is higher and other than the tree of the world, than time and than forms; from Him this manifold world revolves. Knowing Him who brings righteousness, removes sin, the lord of prosperity, abiding in oneself, immortal, the abode of all —'
      ),
      M(
        ['तमीश्वराणां परमं महेश्वरं तं देवतानां परमं च दैवतम्।', 'पतिं पतीनां परमं परस्ताद्विदाम देवं भुवनेशमीड्यम्॥'],
        'उसे ईश्वरों में परम महेश्वर, देवताओं में परम देवता, पतियों में परम पति, (सबसे) परे स्थित, भुवनों के स्वामी, स्तुत्य देव को हम जानें।',
        'Him, the supreme great Lord of lords, the supreme God of gods, the supreme master of masters, beyond the beyond — may we know Him, the adorable God, lord of the worlds.'
      ),
      M(
        ['न तस्य कार्यं करणं च विद्यते न तत्समश्चाभ्यधिकश्च दृश्यते।', 'परास्य शक्तिर्विविधैव श्रूयते स्वाभाविकी ज्ञानबलक्रिया च॥'],
        'उसका न कोई (करने योग्य) कार्य है, न कोई करण (इन्द्रिय/साधन)। उसके समान या उससे अधिक कोई नहीं देखा जाता। उसकी परा शक्ति विविध प्रकार की सुनी जाती है — स्वाभाविक ज्ञान, बल और क्रिया।',
        'He has no work to do and no instrument; none is seen equal to Him or greater. His supreme power is revealed as manifold — inherent knowledge, strength and action.'
      ),
      M(
        ['न तस्य कश्चित्पतिरस्ति लोके न चेशिता नैव च तस्य लिङ्गम्।', 'स कारणं करणाधिपाधिपो न चास्य कश्चिज्जनिता न चाधिपः॥'],
        'लोक में उसका कोई स्वामी नहीं है, न कोई शासक, न उसका कोई लिङ्ग (चिह्न)। वह (सबका) कारण है, इन्द्रियों के अधिपति (जीव) का भी अधिपति है। उसका कोई जनक नहीं, न कोई अधिपति।',
        'He has no master in the world, no ruler, nor any mark. He is the cause, the lord of the lords of the senses; He has no progenitor and no overlord.'
      ),
      M(
        ['यस्तन्तुनाभ इव तन्तुभिः प्रधानजैः स्वभावतः।', 'देव एकः स्वमावृणोति स नो दधातु ब्रह्माप्ययम्॥'],
        'जो एक देव मकड़ी की तरह प्रधान (प्रकृति) से उत्पन्न तन्तुओं से स्वभाव से अपने को ढक लेता है — वह हमें ब्रह्म में लय (ब्रह्म-प्राप्ति) प्रदान करे।',
        'The one God who, like a spider, covers Himself by His own nature with threads produced from nature — may He grant us absorption into Brahman.'
      ),
      M(
        ['एको देवः सर्वभूतेषु गूढः सर्वव्यापी सर्वभूतान्तरात्मा।', 'कर्माध्यक्षः सर्वभूताधिवासः साक्षी चेता केवलो निर्गुणश्च॥'],
        'एक देव सब भूतों में छिपा है — सर्वव्यापी, सब भूतों का अन्तरात्मा, कर्मों का अध्यक्ष, सब भूतों का निवास, साक्षी, चेतन, केवल (अद्वैत) और निर्गुण।',
        'The one God hidden in all beings, all-pervading, the inner Self of all beings, the overseer of actions, the dwelling of all beings, the witness, the consciousness, alone and without qualities.'
      ),
      M(
        ['एको वशी निष्क्रियाणां बहूनामेकं बीजं बहुधा यः करोति।', 'तमात्मस्थं येऽनुपश्यन्ति धीरास्तेषां सुखं शाश्वतं नेतरेषाम्॥'],
        'जो एक नियन्ता (कर्म-रहित) बहुतों का (नियामक) है, जो एक बीज को अनेक प्रकार का बनाता है — अपने में स्थित उसे जो धीर पुरुष देखते हैं, उन्हीं को शाश्वत सुख है, दूसरों को नहीं।',
        'The one controller of the many who are themselves inactive, who makes the one seed manifold — the wise who see Him abiding in themselves, theirs is eternal happiness, and no others\'.'
      ),
      M(
        ['नित्यो नित्यानां चेतनश्चेतनानामेको बहूनां यो विदधाति कामान्।', 'तत्कारणं सांख्ययोगाधिगम्यं ज्ञात्वा देवं मुच्यते सर्वपाशैः॥'],
        'जो नित्यों में नित्य, चेतनों में चेतन है, जो एक बहुतों की कामनाएँ पूर्ण करता है — सांख्य (ज्ञान) और योग से प्राप्त होने योग्य उस कारण-रूप देव को जानकर (साधक) सब पाशों से मुक्त हो जाता है।',
        'The eternal among eternals, the conscious among the conscious, the one who fulfils the desires of the many — knowing that cause, that God, attainable through knowledge and yoga, one is released from all bonds.'
      ),
      M(
        ['न तत्र सूर्यो भाति न चन्द्रतारकं नेमा विद्युतो भान्ति कुतोऽयमग्निः।', 'तमेव भान्तमनुभाति सर्वं तस्य भासा सर्वमिदं विभाति॥'],
        'वहाँ न सूर्य प्रकाशित होता है, न चन्द्र और तारे, न ये बिजलियाँ चमकती हैं — फिर यह अग्नि कैसे? उस प्रकाशमान के पीछे ही सब प्रकाशित होता है; उसके प्रकाश से यह सब प्रकाशित है।',
        'There the sun does not shine, nor the moon and stars, nor do these lightnings shine — how then this fire? Everything shines only after Him who shines; by His light all this is illumined.'
      ),
      M(
        ['एको हंसो भुवनस्यास्य मध्ये स एवाग्निः सलिले सन्निविष्टः।', 'तमेव विदित्वाति मृत्युमेति नान्यः पन्था विद्यतेऽयनाय॥'],
        'इस भुवन के मध्य में एक हंस (परमात्मा) है; वही जल में स्थित अग्नि है। उसी को जानकर (मनुष्य) मृत्यु को पार करता है; (मोक्ष-) गमन के लिए दूसरा मार्ग नहीं है।',
        'The one swan in the midst of this world — He alone is the fire that has entered the waters. Knowing Him alone one passes beyond death; there is no other path for going.'
      ),
      M(
        ['स विश्वकृद्विश्वविदात्मयोनिर्ज्ञः कालकारो गुणी सर्वविद्यः।', 'प्रधानक्षेत्रज्ञपतिर्गुणेशः संसारमोक्षस्थितिबन्धहेतुः॥'],
        'वह विश्व का कर्ता, विश्व का ज्ञाता, स्वयं अपना कारण, ज्ञाता, काल का कर्ता, गुणी, सर्वज्ञ, प्रधान (प्रकृति) और क्षेत्रज्ञ (जीव) का स्वामी, गुणों का ईश, संसार से मोक्ष का तथा (संसार में) स्थिति और बन्धन का कारण है।',
        'He is the maker of all, the knower of all, His own source, the knower, the maker of time, possessed of qualities, all-knowing, the lord of nature and of the knower of the field, the master of the qualities, the cause of liberation from the world and of continuance and bondage in it.'
      ),
      M(
        ['स तन्मयो ह्यमृत ईशसंस्थो ज्ञः सर्वगो भुवनस्यास्य गोप्ता।', 'य ईशे अस्य जगतो नित्यमेव नान्यो हेतुर्विद्यत ईशनाय॥'],
        'वह तन्मय (उस स्वरूप में स्थित), अमृत, ईश-रूप में स्थित, ज्ञाता, सर्वगत, इस भुवन का रक्षक है, जो इस जगत् पर नित्य शासन करता है; शासन के लिए दूसरा कोई हेतु नहीं है।',
        'He is one with That, immortal, abiding as the Lord, the knower, present everywhere, the guardian of this world, who rules this universe forever; there is no other cause for its ruling.'
      ),
      M(
        ['यो ब्रह्माणं विदधाति पूर्वं यो वै वेदांश्च प्रहिणोति तस्मै।', 'तं ह देवमात्मबुद्धिप्रकाशं मुमुक्षुर्वै शरणमहं प्रपद्ये॥'],
        'जो पहले ब्रह्मा को रचता है, जो उसे वेद प्रदान करता है — उस आत्म-बुद्धि को प्रकाशित करने वाले देव की मैं मुमुक्षु शरण लेता हूँ।',
        'He who in the beginning creates Brahmā, and who delivers the Vedas to him — in that God, who illumines the knowledge of the Self, I, seeking liberation, take refuge.'
      ),
      M(
        ['निष्कलं निष्क्रियं शान्तं निरवद्यं निरञ्जनम्।', 'अमृतस्य परं सेतुं दग्धेन्धनमिवानलम्॥'],
        '(मैं उसकी शरण लेता हूँ) जो निष्कल (अखण्ड), निष्क्रिय, शान्त, निर्दोष, निर्लेप, अमृत का परम सेतु, ईंधन जल जाने पर (शान्त) अग्नि के समान है।',
        '(I take refuge in Him) who is without parts, without action, tranquil, blameless, unstained, the supreme bridge to immortality, like a fire whose fuel is burnt out.'
      ),
      M(
        ['यदा चर्मवदाकाशं वेष्टयिष्यन्ति मानवाः।', 'तदा देवमविज्ञाय दुःखस्यान्तो भविष्यति॥'],
        'जब मनुष्य आकाश को चर्म की तरह लपेट सकेंगे, तभी देव को जाने बिना दुःख का अन्त होगा (अर्थात् कभी नहीं)।',
        'When men shall roll up space like a piece of leather, then shall there be an end of sorrow without knowing God — that is, never.'
      ),
      M(
        ['तपःप्रभावाद्देवप्रसादाच्च ब्रह्म ह श्वेताश्वतरोऽथ विद्वान्।', 'अत्याश्रमिभ्यः परमं पवित्रं प्रोवाच सम्यगृषिसङ्घजुष्टम्॥'],
        'तप के प्रभाव और देव की कृपा से विद्वान् श्वेताश्वतर ने ब्रह्म को जाना; फिर ऋषि-समूह से सम्मानित, परम पवित्र (इस ज्ञान) को आश्रमों से परे स्थित (संन्यासियों) को भली प्रकार कहा।',
        'By the power of austerity and the grace of God the wise Śvetāśvatara knew Brahman; then he rightly taught this most holy knowledge, cherished by the company of seers, to those beyond the stages of life.'
      ),
      M(
        ['वेदान्ते परमं गुह्यं पुराकल्पे प्रचोदितम्।', 'नाप्रशान्ताय दातव्यं नापुत्रायाशिष्याय वा पुनः॥'],
        'वेदान्त का यह परम गुह्य (ज्ञान) पूर्व कल्प में कहा गया था। इसे अशान्त (चित्त वाले) को न दे, और जो पुत्र या शिष्य न हो उसे भी न दे।',
        'This supreme secret of the Vedānta was proclaimed in a former age. It should not be given to one whose mind is not at peace, nor to one who is not a son or a disciple.'
      ),
      M(
        ['यस्य देवे परा भक्तिर्यथा देवे तथा गुरौ।', 'तस्यैते कथिता ह्यर्थाः प्रकाशन्ते महात्मनः प्रकाशन्ते महात्मन इति॥'],
        'जिसकी देव में परा भक्ति है, और जैसी देव में वैसी गुरु में — उस महात्मा के लिए ही ये कहे गये अर्थ प्रकाशित होते हैं, महात्मा के लिए प्रकाशित होते हैं।',
        'He who has supreme devotion to God, and to his teacher as to God — to that great soul these truths here declared shine forth; to that great soul they shine forth.'
      ),
    ],
  ],
};

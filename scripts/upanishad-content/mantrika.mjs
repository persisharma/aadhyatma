/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Māntrika — Śukla Yajurveda, Sāmānya-Vedānta group in this catalogue. Twenty
 * verses, undivided, closely related to the Cūlikā: the eight-footed, pure,
 * three-threaded Swan seen within by those established in sattva; the unborn
 * cow of prakṛti, white, black and red, milked by the many and enjoyed by the
 * one Lord; the same Lord praised by the Adhvaryus, Hotṛs, Sāmagas and
 * Atharvans, counted by the Sāṅkhyas as the twenty-sixth or twenty-seventh;
 * and the dissolution of all beings in him like rivers in the sea.
 * Total 20 mantras.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'mantrika',
  muktika: 32,
  vedaHi: 'शुक्ल यजुर्वेद',
  vedaEn: 'Shukla Yajurveda',
  source: {
    baseText:
      'Śukla Yajurveda Māntrika Upaniṣad in 20 verses, as printed in the Adyar Library "Sāmānya Vedānta Upaniṣads" (with Upaniṣad-brahmayogin\'s commentary) and the Gita Press one-hundred-eight Upaniṣad collection; Devanagari written out from the printed text.',
    canonicalEdition: 'Adyar Library, The Sāmānya Vedānta Upaniṣads (ed. A. Mahadeva Sastri, 1921); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/mantrika.html',
      'https://www.wisdomlib.org/hinduism/book/mantrika-upanishad',
      'https://archive.org/details/SamanyaVedantaUpanishads',
    ],
    notes:
      '20 verses, undivided, following the printed numbering: 1–4 the eight-footed, pure, three-threaded Swan, seen within by those established in sattva, and the unborn eight-formed prakṛti presided over by him; 5–7 the cow without beginning or end, white, black and red, milked by all yet enjoyed at will by the one Lord; 8–13 the golden bird praised by Adhvaryus, Hotṛs, Sāma-singers and Atharvans under many names (Kāla, Prāṇa, Rudra, Prajāpati, Virāṭ, Puruṣa); 14–16 the Sāṅkhya counts (twenty-sixth, twenty-seventh, twenty-four principles) and the one pure Lord seen by the eye of knowledge; 17–20 all beings dissolving in him like rivers in the sea and rising again like bubbles, closing with इत्युपनिषत्. The Yajurvedic śānti-pāṭha (पूर्णमदः) is page 1. The text runs parallel to the Atharvavedic Cūlikā, and readings vary between prints and between the two texts, notably in verse 2 (भिन्ने तमसि वैखरे), verse 7 (प्रसभं विभुः), verse 9 (सप्तवैधैस्तु, some prints सप्तवेदैस्तु), verse 11 (the list of Atharvan hymn-names) and verse 19. Least certain from memory: verses 9, 11 and 19 (second half, एवं स भगवान्देवं पश्यन्त्यन्ये पुनः पुनः). Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।', 'पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (परब्रह्म) पूर्ण है, यह (जगत्) भी पूर्ण है; पूर्ण से ही पूर्ण प्रकट होता है। पूर्ण में से पूर्ण को निकाल लेने पर भी पूर्ण ही शेष रहता है। ॐ शान्तिः शान्तिः शान्तिः।',
    'That is full; this is full. From the full, the full arises. Taking the full from the full, the full alone remains. Om, peace, peace, peace.'
  ),
  mantras: [
    M(
      ['अष्टपादं शुचिं हंसं त्रिसूत्रमणुमव्ययम्।', 'त्रिवर्त्मानं तेजसोऽहं सर्वतः पश्यन्न पश्यति॥'],
      'आठ पादों वाले, पवित्र, तीन सूत्रों वाले, सूक्ष्म और अविनाशी, तीन मार्गों वाले, तेजोमय उस हंस (परमात्मा) को — जो सब ओर से देखता हुआ भी (मोहग्रस्त जीव द्वारा) देखा नहीं जाता — (जानना चाहिए)।',
      'The eight-footed, pure Swan, three-threaded, subtle and imperishable, of three paths, radiant — though he sees on every side, he is not seen (by the deluded).'
    ),
    M(
      ['भूतसंमोहने काले भिन्ने तमसि वैखरे।', 'अन्तः पश्यन्ति सत्त्वस्था निर्गुणं गुणगह्वरे॥'],
      'जब प्राणियों को मोहित करने वाला काल होता है और स्थूल अन्धकार छिन्न हो जाता है, तब सत्त्व में स्थित जन गुणों की गुफा (हृदय) के भीतर उस निर्गुण को देखते हैं।',
      'At the time when beings are deluded, when the gross darkness is pierced, those established in sattva see within, in the cavern of the guṇas, the one beyond the guṇas.'
    ),
    M(
      ['अशक्यः सोऽन्यथा द्रष्टुं ध्यायमानः कुमारकैः।', 'विकारजननीमज्ञामष्टरूपामजां ध्रुवाम्॥'],
      'अन्य किसी प्रकार से उसे देखा नहीं जा सकता; (विवेकहीन) बालक-बुद्धि जन तो विकारों को जन्म देने वाली, अज्ञानरूपा, आठ रूपों वाली, अजन्मा और स्थिर (प्रकृति) का ही ध्यान करते हैं।',
      'He cannot be seen otherwise. The childish meditate instead on her who gives birth to the modifications — ignorant, eight-formed, unborn and constant (prakṛti).'
    ),
    M(
      ['ध्यायतेऽध्यासिता तेन तन्यते प्रेर्यते पुनः।', 'सूयते पुरुषार्थं च तेनैवाधिष्ठितं जगत्॥'],
      'उस (परमात्मा) से अधिष्ठित होकर वह (प्रकृति) चिन्तन करती है, विस्तृत होती है और फिर प्रेरित होती है; वह पुरुष के प्रयोजन के लिए (जगत् को) उत्पन्न करती है — इस प्रकार यह जगत् उसी से अधिष्ठित है।',
      'Presided over by him she broods, is spread out and is impelled again; she brings forth for the sake of the Puruṣa — so the world is presided over by him alone.'
    ),
    M(
      ['गौरनाद्यन्तवती सा जनित्री भूतभाविनी।', 'सितासिता च रक्ता च सर्वकामदुघा विभोः॥'],
      'वह (प्रकृति) आदि और अन्त से रहित गौ है, सबको जन्म देने वाली और प्राणियों को उत्पन्न करने वाली; वह श्वेत, कृष्ण और रक्त वर्ण की है, और विभु (परमात्मा) के लिए सब कामनाओं को दुहने वाली है।',
      'She is the cow without beginning or end, the mother who brings beings into existence; white, black and red, she yields every desire for the all-pervading Lord.'
    ),
    M(
      ['पिबन्त्येनामविषयामविज्ञातां कुमारकाः।', 'एकस्तु पिबते देवः स्वच्छन्दोऽत्र वशानुगः॥'],
      'अज्ञानी जन इस (गौ) का पान करते हैं, जो (उनके लिए) न विषय बनती है और न जानी जाती है; किन्तु एक देव (परमात्मा) ही स्वच्छन्द होकर इसका पान करता है, और यह उसके वश में चलती है।',
      'The childish drink of her, who is neither grasped as an object nor understood; but the one God drinks of her at his own will, and she follows his control.'
    ),
    M(
      ['ध्यानक्रियाभ्यां भगवान्भुङ्क्तेऽसौ प्रसभं विभुः।', 'सर्वसाधारणीं दोग्ध्रीं पीयमानां तु यज्वभिः॥'],
      'वह भगवान् विभु ध्यान और कर्म के द्वारा उस (गौ) का बलपूर्वक भोग करता है, जो सबके लिए समान रूप से दूध देने वाली है और यज्ञ करने वालों द्वारा पी जाती है।',
      'Through meditation and rite the all-pervading Lord enjoys her mightily — the milch-cow common to all, drunk from by the sacrificers.'
    ),
    M(
      ['पश्यन्त्यस्यां महात्मानः सुवर्णं पिप्पलाशनम्।', 'उदासीनं ध्रुवं हंसं स्नातकाध्वर्यवो जगुः॥'],
      'महात्मा जन इस (प्रकृति) में पीपल के फल खाने वाले सुवर्ण (पक्षी — जीव) को देखते हैं; और स्नातक अध्वर्यु (उसके साथी) उदासीन, स्थिर हंस (परमात्मा) का गान करते हैं।',
      'In her the great-souled see the golden bird that eats the pippala fruit; the Adhvaryus who have completed their study sing of the indifferent, steadfast Swan.'
    ),
    M(
      ['शंसन्तमनुशंसन्ति बह्वृचाः शास्त्रकोविदाः।', 'रथन्तरं बृहत्साम सप्तवैधैस्तु गीयते॥'],
      'शास्त्रों में निपुण ऋग्वेदी (होता) स्तुति करते हुए उसी की अनुस्तुति करते हैं; रथन्तर और बृहत् साम के रूप में सात प्रकार के विधानों द्वारा उसी का गान किया जाता है।',
      'The Ṛgvedins learned in the śāstras praise him who is praised; as the Rathantara and the Bṛhat Sāman he is sung in the sevenfold rites.'
    ),
    M(
      ['मन्त्रोपनिषदं ब्रह्म पदक्रमसमन्वितम्।', 'पठन्ति भार्गवा ह्येते ह्यथर्वाणो भृगूत्तमाः॥'],
      'भृगुवंश के श्रेष्ठ ये भार्गव अथर्ववेदी पद और क्रम से युक्त मन्त्र-उपनिषद् रूप ब्रह्म का पाठ करते हैं।',
      'These Bhārgavas, the Atharvans foremost among the Bhṛgus, recite Brahman as the mantra-Upaniṣad, with its pada and krama readings.'
    ),
    M(
      ['सब्रह्मचारिवृत्तिश्च स्तम्भोऽथ पलितस्तथा।', 'अनड्वान्रोहितोच्छिष्टः पश्यन्तो बहुविस्तरम्॥'],
      'ब्रह्मचारी, व्रात्य, स्कम्भ (स्तम्भ), पलित, अनड्वान्, रोहित और उच्छिष्ट — (अथर्ववेद के इन सूक्तों में) उसे बहुत विस्तार से देखते हुए (वे उसकी स्तुति करते हैं)।',
      'As the Brahmacārin and his way of life, as the Pillar (Skambha), the Grey-haired one, the Draught-ox, the Red one (Rohita) and the Remainder (Ucchiṣṭa) — seeing him in great expanse (the Atharvans praise him).'
    ),
    M(
      ['कालः प्राणश्च भगवान्मृत्युः शर्वो महेश्वरः।', 'उग्रो भवश्च रुद्रश्च ससुरः सासुरस्तथा॥'],
      'काल, प्राण, भगवान्, मृत्यु, शर्व, महेश्वर, उग्र, भव और रुद्र — देवताओं सहित और असुरों सहित भी (वही है)।',
      'As Time, as Breath, as the Lord, as Death, Śarva, Maheśvara, Ugra, Bhava and Rudra — with the gods and with the asuras too.'
    ),
    M(
      ['प्रजापतिर्विराट्चैव पुरुषः सलिलमेव च।', 'स्तूयते मन्त्रसंस्तुत्यैरथर्वविदितैर्विभुः॥'],
      'प्रजापति, विराट्, पुरुष और सलिल (आदि जल) — इन रूपों में अथर्ववेद में विदित मन्त्र-स्तुतियों द्वारा उसी विभु की स्तुति की जाती है।',
      'As Prajāpati, Virāṭ, Puruṣa and the primal Waters, the all-pervading one is praised with the mantra-hymns known to the Atharvans.'
    ),
    M(
      ['तं षड्विंशक इत्येते सप्तविंशं तथापरे।', 'पुरुषं निर्गुणं साङ्ख्यमथर्वशिरसो विदुः॥'],
      'कुछ लोग उसे छब्बीसवाँ (तत्त्व) कहते हैं, दूसरे सत्ताईसवाँ; अथर्वशिरस् के जानने वाले उसे निर्गुण, सांख्य-प्रतिपादित पुरुष जानते हैं।',
      'Some call him the twenty-sixth, others the twenty-seventh; those of the Atharvaśiras know him as the Puruṣa beyond the guṇas, the one taught by Sāṅkhya.'
    ),
    M(
      ['चतुर्विंशतिसंख्यातं व्यक्तमव्यक्तमेव च।', 'अद्वैतं द्वैतमित्याहुस्त्रिधा तं पञ्चधा तथा॥'],
      'उसे चौबीस तत्त्वों के रूप में गिना गया, व्यक्त और अव्यक्त भी; अद्वैत और द्वैत भी कहते हैं, तथा तीन प्रकार का और पाँच प्रकार का भी।',
      'He is counted as the twenty-four principles, as the manifest and the unmanifest; they call him non-dual and dual, threefold and fivefold as well.'
    ),
    M(
      ['ब्रह्माद्यं स्थावरान्तं च पश्यन्ति ज्ञानचक्षुषः।', 'तमेकमेव पश्यन्ति परिशुभ्रं विभुं द्विजाः॥'],
      'ज्ञान-नेत्र वाले द्विज ब्रह्मा से लेकर स्थावर पर्यन्त (सब कुछ) देखते हैं, और (उसमें) उसी एक, परम शुद्ध, विभु (परमात्मा) को ही देखते हैं।',
      'Those whose eye is knowledge see (all) from Brahmā down to the unmoving; and in it the twice-born see that one alone, the utterly pure, all-pervading Lord.'
    ),
    M(
      ['यस्मिन्सर्वमिदं प्रोतं ब्रह्म स्थावरजङ्गमम्।', 'तस्मिन्नेव लयं यान्ति स्रवन्त्यः सागरे यथा॥'],
      'जिस (ब्रह्म) में यह सारा स्थावर-जंगम जगत् पिरोया हुआ है, उसी में सब कुछ वैसे ही लीन हो जाता है जैसे नदियाँ समुद्र में।',
      'That Brahman in which all this, moving and unmoving, is woven — in that alone all things dissolve, as flowing rivers into the sea.'
    ),
    M(
      ['यस्मिन्भावाः प्रलीयन्ते लीनाश्चाव्यक्ततां ययुः।', 'पश्यन्ति व्यक्ततां भूयो जायन्ते बुद्बुदा इव॥'],
      'जिसमें सब भाव (पदार्थ) विलीन होते हैं और लीन होकर अव्यक्त हो जाते हैं, और फिर व्यक्त होकर बुलबुलों की भाँति उत्पन्न होते हैं — (उसे ज्ञानी देखते हैं)।',
      'In whom all beings dissolve and, dissolved, pass into the unmanifest; again they come to be manifest and are born like bubbles.'
    ),
    M(
      ['क्षेत्रज्ञाधिष्ठितं चैव कारणैर्विद्यते पुनः।', 'एवं स भगवान्देवं पश्यन्त्यन्ये पुनः पुनः॥'],
      'क्षेत्रज्ञ (आत्मा) से अधिष्ठित होकर (यह जगत्) कारणों के द्वारा फिर-फिर अस्तित्व में आता है। इस प्रकार वह भगवान् (सबका आधार) है; और अन्य जन उस देव को बार-बार (विविध रूपों में) देखते हैं।',
      'Presided over by the Knower of the field, (the world) comes into being again through its causes. Thus is he the Lord; and others see that God again and again.'
    ),
    M(
      ['ब्रह्म ब्रह्मेत्यथायान्ति ये विदुर्ब्राह्मणास्तथा।', 'अत्रैव ते लयं यान्ति लीनाश्चाव्यक्तशालिनः॥', 'लीनाश्चाव्यक्तशालिन इत्युपनिषत्॥'],
      'जो ब्राह्मण उसे "ब्रह्म, ब्रह्म" — इस प्रकार जान लेते हैं, वे यहीं उसमें लय को प्राप्त होते हैं, और लीन होकर अव्यक्त में शोभित होते हैं। "लीन होकर अव्यक्त में शोभित होते हैं" — यह उपनिषद् है।',
      'Those Brāhmaṇas who know him as "Brahman, Brahman" go to him; here itself they are dissolved, and, dissolved, they abide resplendent in the unmanifest. "Dissolved, they abide resplendent in the unmanifest" — thus the Upaniṣad.'
    ),
  ],
};

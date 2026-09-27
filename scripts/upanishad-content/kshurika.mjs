/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Kṣurikā — Kṛṣṇa Yajurveda, Yoga group in this catalogue. Twenty-five verses,
 * undivided: the "dagger" dhāraṇā that ends rebirth — the silent place and
 * seat, the tortoise-like withdrawal of the senses, filling the self with Om
 * in twelve measures, fixing the breath and leading it through the vital
 * points from the ankles upward, the white suṣumnā among the coloured nāḍīs,
 * the red-lotus heart-space, and the sharp knife of the purified mind that
 * severs the hundred nāḍīs while leaving suṣumnā alone; closing with the swan
 * that breaks its snare, the lamp that burns out, and the one who, freed from
 * every desire, is bound no more. Total 25 mantras.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'kshurika',
  muktika: 31,
  vedaHi: 'कृष्ण यजुर्वेद',
  vedaEn: 'Krishna Yajurveda',
  source: {
    baseText:
      'Kṛṣṇa Yajurveda Kṣurikā Upaniṣad in 25 verses, as printed in the Ānandāśrama one-hundred-eight Upaniṣad collection and the Adyar Yoga Upaniṣads (with Upaniṣad-brahmayogin’s commentary); Devanagari written out from the printed text.',
    canonicalEdition:
      'Ānandāśrama Sanskrit Series, Upaniṣadāṃ Samuccayaḥ; The Yoga Upaniṣads, Adyar Library (ed. A. Mahadeva Sastri); Gita Press, उपनिषद् अंक',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/kshurika.html',
      'https://www.wisdomlib.org/hinduism/book/kshurika-upanishad',
      'https://archive.org/details/TheYogaUpanishads',
    ],
    notes:
      '25 verses, undivided, numbered as in the Adyar Yoga Upaniṣads / sanskritdocuments print: 1–2 the dagger-dhāraṇā declared and the silent place; 3–5 withdrawal of the senses, filling the self with Om in twelve measures, holding and slowly releasing the breath; 6–7 fixing the breath at the vital points — ankles, shanks, knees, thighs, anus, generative organ — and the navel as the seat of vāyu; 8–10 suṣumnā among the coloured nāḍīs, the white subtle nāḍī along which prāṇa is drawn like the spider’s thread, and the red-lotus heart (dahara-puṇḍarīka); 11–14 the knife of the mind cutting at the marmas (the indravajra of the shanks, the thighs); 15–20 the hundred-and-one nāḍīs at the throat, iḍā, piṅgalā and suṣumnā, all severed save suṣumnā, and the scent-and-oil simile; 21–25 the one who has conquered the mind, the swan breaking its snare, the lamp that burns out, and the knife of prāṇāyāma whetted on dispassion — freed from all desires he is not bound again. The Kṛṣṇa-Yajurvedic śānti-pāṭha (सह नाववतु) is page 1. Readings vary between prints; the least certain verses here are 11 (तां नाडीं पूरयन्यतः), 13 (मर्मजङ्घानुकीर्तनम्), 14 (चतुरभ्यासयोगेन), 17 (प्रतिनाडीषु तैतिलम्, a notoriously obscure reading — some prints give तैतिलम् / तैतिलाः), 19 (वास्यति तैलिकम्) and 20 (सा नाडीति विभावयेत्); the reading followed here is the one given in the Devanagari. Devanagari was authored from memory of the printed text because the network policy blocks the Sanskrit source hosts — a line-by-line scan check against the printed edition is still owed.',
    retrievedOn: '2026-09-27',
  },
  shanti: M(
    ['ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै।', 'तेजस्वि नावधीतमस्तु मा विद्विषावहै॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (ब्रह्म) हम दोनों (गुरु-शिष्य) की साथ-साथ रक्षा करे, हम दोनों का साथ-साथ पालन करे; हम दोनों साथ-साथ सामर्थ्य प्राप्त करें। हमारा पढ़ा हुआ तेजस्वी हो; हम परस्पर द्वेष न करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'May That protect us both together; may That nourish us both together; may we work together with vigour. May what we study be luminous; may we never hate one another. Om, peace, peace, peace.'
  ),
  mantras: [
    M(
      ['क्षुरिकां सम्प्रवक्ष्यामि धारणां योगसिद्धये।', 'यां प्राप्य न पुनर्जन्म योगयुक्तस्य जायते॥'],
      'योग की सिद्धि के लिए मैं क्षुरिका (छुरी) नामक धारणा का वर्णन करता हूँ, जिसे प्राप्त कर लेने पर योगयुक्त पुरुष का फिर जन्म नहीं होता।',
      'I shall now declare the Kṣurikā, the “dagger” concentration, for the perfection of yoga — attaining which, the one joined in yoga is not born again.'
    ),
    M(
      ['वेदतत्त्वार्थविहितं यथोक्तं हि स्वयंभुवा।', 'निःशब्दं देशमास्थाय तत्रासनमवस्थितः॥'],
      'यह वेद के तत्त्वार्थ के अनुसार विहित है, जैसा कि स्वयम्भू (ब्रह्मा) ने कहा है। (साधक) शब्दरहित (निर्जन, शान्त) स्थान का आश्रय लेकर वहाँ आसन पर स्थित हो।',
      'It is ordained by the true meaning of the Veda, just as the Self-born declared it. Resorting to a soundless place, one should be seated there on a seat.'
    ),
    M(
      ['कूर्मोऽङ्गानीव संहृत्य मनो हृदि निरुध्य च।', 'मात्राद्वादशयोगेन प्रणवेन शनैः शनैः॥'],
      'जैसे कछुआ अपने अङ्गों को समेट लेता है, वैसे ही (इन्द्रियों को) समेटकर और मन को हृदय में रोककर, बारह मात्राओं के योग से प्रणव (ॐ) के द्वारा धीरे-धीरे—',
      'Drawing in the senses as a tortoise draws in its limbs, and restraining the mind in the heart, with Om measured in twelve units, slowly, slowly —'
    ),
    M(
      ['पूरयेत्सर्वमात्मानं सर्वद्वारं निरुध्य च।', 'उरोमुखकटिग्रीवं किञ्चिद्धृदयमुन्नतम्॥'],
      '—सब द्वारों को रोककर सम्पूर्ण शरीर को (प्राण से) भर ले। छाती, मुख, कमर और गर्दन (सीधे रखे) और हृदय को कुछ ऊपर उठा हुआ रखे।',
      '— one should fill the whole self [with breath], closing all the doors, keeping chest, face, hips and neck [erect] and the heart slightly raised.'
    ),
    M(
      ['प्राणान्सन्धारयेत्तस्मिन्नासाभ्यन्तरचारिणः।', 'भूत्वा तत्र गतप्राणः शनैरथ समुत्सृजेत्॥'],
      'नासिका के भीतर विचरने वाले प्राणों को वहाँ (हृदय में) धारण करे। वहाँ प्राण को रोके हुए (स्थिर) होकर फिर धीरे-धीरे उसे छोड़े।',
      'The breaths that move within the nostrils one should hold there; having become one whose breath is stilled there, one should then slowly release it.'
    ),
    M(
      ['स्थिरमात्रादृढं कृत्वा अङ्गुष्ठेन समाहितः।', 'द्वे गुल्फे तु प्रकुर्वीत जङ्घे चैव त्रयस्त्रयः॥'],
      'मात्रा को स्थिर और दृढ़ करके, एकाग्रचित्त होकर अँगूठे से (आरम्भ कर) दोनों टखनों में और फिर दोनों पिण्डलियों में तीन-तीन बार (धारणा) करे।',
      'Making the measure steady and firm, collected, beginning from the great toe, one should practise [the dhāraṇā] at the two ankles, and likewise at the two shanks, three times each.'
    ),
    M(
      ['द्वे जानुनी तथोरुभ्यां गुदे शिश्ने त्रयस्त्रयः।', 'वायोरायतनं चात्र नाभिदेशे समाश्रयेत्॥'],
      'इसी प्रकार दोनों घुटनों में, दोनों जाँघों में, गुदा में और उपस्थ (जननेन्द्रिय) में तीन-तीन बार करे। फिर यहाँ नाभि-प्रदेश में स्थित वायु के आयतन (निवास-स्थान) का आश्रय ले।',
      'So too at the two knees, at the thighs, at the anus and at the generative organ, three times each. Then one should take hold of the abode of vāyu, here in the region of the navel.'
    ),
    M(
      ['तत्र नाडी सुषुम्ना तु नाडीभिर्बहुभिर्वृता।', 'अणु रक्ताश्च पीताश्च कृष्णास्ताम्रा विलोहिताः॥'],
      'वहाँ सुषुम्ना नाड़ी है, जो बहुत-सी नाड़ियों से घिरी हुई है—जो सूक्ष्म हैं और लाल, पीली, काली, ताँबे जैसी तथा गहरी लाल हैं।',
      'There is the nāḍī suṣumnā, surrounded by many nāḍīs — subtle ones, red and yellow, black, copper-coloured and deep red.'
    ),
    M(
      ['अतिसूक्ष्मां च तन्वीं च शुक्लां नाडीं समाश्रयेत्।', 'तत्र संचारयेत्प्राणानूर्णनाभीव तन्तुना॥'],
      'अत्यन्त सूक्ष्म, पतली और श्वेत नाड़ी का आश्रय ले और उसमें प्राणों का संचार करे, जैसे मकड़ी अपने तन्तु के सहारे चलती है।',
      'One should take hold of the nāḍī that is exceedingly subtle, slender and white, and there make the breaths move, as a spider moves along its thread.'
    ),
    M(
      ['ततो रक्तोत्पलाभासं पुरुषायतनं महत्।', 'दहरं पुण्डरीकं तद्वेदान्तेषु निगद्यते॥'],
      'तब लाल कमल के समान आभा वाला, पुरुष (आत्मा) का महान् निवास-स्थान (मिलता है), जिसे वेदान्तों में दहर-पुण्डरीक (हृदय-कमल का सूक्ष्म आकाश) कहा गया है।',
      'Then there is the great abode of the Person, shining like a red lotus — that which is called in the Vedāntas the small lotus, the dahara-puṇḍarīka.'
    ),
    M(
      ['तद्भित्त्वा कण्ठमायाति तां नाडीं पूरयन्यतः।', 'मनसस्तु क्षुरं गृह्य सुतीक्ष्णं बुद्धिनिर्मलम्॥'],
      'उसे भेदकर, उस नाड़ी को (प्राण से) भरते हुए संयमी साधक कण्ठ तक आता है। (तब) मन रूपी अत्यन्त तीक्ष्ण छुरी को, जो बुद्धि से निर्मल की गई है, ग्रहण करके—',
      'Piercing that, the restrained one comes to the throat, filling that nāḍī. Then, taking up the knife of the mind — very sharp, made clean by the intellect —'
    ),
    M(
      ['पादस्योपरि यन्मध्ये तद्रूपं नाम कृन्तयेत्।', 'मनोद्वारेण तीक्ष्णेन योगमाश्रित्य नित्यशः॥'],
      '—पैर के ऊपर मध्य में जो (मर्म-स्थान) है, उस रूप और नाम को काट डाले। तीक्ष्ण मन के द्वार से, नित्य योग का आश्रय लेकर (ऐसा करे)।',
      '— one should cut away that form and name which lies in the middle above the foot, by the sharp door of the mind, resorting to yoga constantly.'
    ),
    M(
      ['इन्द्रवज्र इति प्रोक्तं मर्मजङ्घानुकीर्तनम्।', 'तद्ध्यानबलयोगेन धारणाभिर्निकृन्तयेत्॥'],
      'पिण्डली में जो मर्म-स्थान बताया गया है, वह "इन्द्रवज्र" कहलाता है। उसे ध्यान के बल के योग से धारणाओं द्वारा काट डाले।',
      'The vital point spoken of in the shank is called indravajra. By the power of meditation joined with concentrations one should sever it.'
    ),
    M(
      ['ऊर्वोर्मध्ये तु संस्थाप्य मर्मप्राणविमोचनम्।', 'चतुरभ्यासयोगेन छिन्देदनभिशङ्कितः॥'],
      'दोनों जाँघों के मध्य में (मन को) स्थापित करके, मर्म से प्राण को मुक्त करने वाले उस (स्थान) को चार प्रकार के अभ्यास के योग से निःशङ्क होकर काट डाले।',
      'Fixing [the mind] in the middle of the thighs, at the point that releases the breath from the vital spot, one should cut it without hesitation by the fourfold practice.'
    ),
    M(
      ['ततः कण्ठान्तरे योगी समूहं नाडिसंचयम्।', 'एकोत्तरं नाडिशतं तासां मध्ये वरा स्मृताः॥'],
      'तब योगी कण्ठ के भीतर नाड़ियों के समूह (को जाने)। एक सौ एक नाड़ियाँ हैं; उनके बीच (तीन) श्रेष्ठ मानी गयी हैं।',
      'Then, within the throat, the yogin [knows] the cluster, the gathering of nāḍīs: a hundred and one nāḍīs, and among them [three] are held to be the best.'
    ),
    M(
      ['सुषुम्ना तु परे लीना विरजा ब्रह्मरूपिणी।', 'इडा तिष्ठति वामेन पिङ्गला दक्षिणेन च॥'],
      'सुषुम्ना परम (तत्त्व) में लीन है, रजोगुण से रहित (निर्मल) और ब्रह्मस्वरूपिणी है। इडा बायीं ओर और पिङ्गला दायीं ओर स्थित है।',
      'Suṣumnā is merged in the Supreme — stainless, of the form of Brahman. Iḍā stands on the left and piṅgalā on the right.'
    ),
    M(
      ['तयोर्मध्ये वरं स्थानं यस्तं वेद स वेदवित्।', 'द्वासप्ततिसहस्राणि प्रतिनाडीषु तैतिलम्॥'],
      'उन दोनों के मध्य में श्रेष्ठ स्थान है; जो उसे जानता है, वही वेद का ज्ञाता है। बहत्तर हज़ार (नाड़ियाँ) हैं, जो प्रत्येक नाड़ी में (शाखाओं के रूप में) फैली हुई हैं।',
      'Between the two is the supreme place; whoever knows it is the knower of the Veda. There are seventy-two thousand [nāḍīs], branching out in each nāḍī.'
    ),
    M(
      ['छिद्यते ध्यानयोगेन सुषुम्नैका न छिद्यते।', 'योगनिर्मलधारेण क्षुरेणानलवर्चसा॥'],
      '(वे सब) ध्यानयोग से काटी जाती हैं; केवल एक सुषुम्ना नहीं काटी जाती। योग से निर्मल धार वाली, अग्नि के समान तेजस्वी छुरी से—',
      'They are cut by the yoga of meditation; suṣumnā alone is not cut. With the knife whose edge is made clean by yoga, blazing like fire —'
    ),
    M(
      ['छिन्देन्नाडीशतं धीरः प्रभावादिह जन्मनि।', 'जातीपुष्पसमायोगैर्यथा वास्यति तैलिकम्॥'],
      '—धीर साधक (योग के) प्रभाव से इसी जन्म में सौ नाड़ियों को काट दे। जैसे चमेली के फूलों के संयोग से तेली तेल को सुगन्धित कर देता है—',
      '— the steadfast one should cut the hundred nāḍīs by its power, here in this very birth. As the oil-presser perfumes [the oil] by steeping it with jasmine flowers —'
    ),
    M(
      ['एवं शुभाशुभैर्भावैः सा नाडीति विभावयेत्।', 'तद्भाविताः प्रपद्यन्ते पुनर्जन्मविवर्जिताः॥'],
      '—वैसे ही शुभ और अशुभ भावों से वह नाड़ी (सुवासित होती है), ऐसा समझे। उस (सुषुम्ना) की भावना करने वाले पुनर्जन्म से रहित (पद को) प्राप्त होते हैं।',
      '— so, one should understand, is that nāḍī [scented] by good and evil dispositions. Those who have steeped themselves in it attain [the state] free from rebirth.'
    ),
    M(
      ['तपोविजितचित्तस्तु निःशब्दं देशमास्थितः।', 'निःसङ्गतत्त्वयोगज्ञो निरपेक्षः शनैः शनैः॥'],
      'तप से चित्त को जीत लेने वाला, शब्दरहित स्थान में स्थित, आसक्तिरहित, तत्त्व और योग का ज्ञाता तथा अपेक्षा-रहित (साधक) धीरे-धीरे—',
      'One whose mind is conquered by austerity, abiding in a soundless place, unattached, knowing the truth and yoga, free of expectation — slowly, slowly —'
    ),
    M(
      ['पाशं छित्त्वा यथा हंसो निर्विशङ्कं खमुत्क्रमेत्।', 'छिन्नपाशस्तथा जीवः संसारं तरते सदा॥'],
      'जैसे हंस जाल को काटकर निःशङ्क होकर आकाश में उड़ जाता है, वैसे ही जिसके बन्धन कट गए हैं, वह जीव सदा के लिए संसार को पार कर जाता है।',
      'As a swan, having cut the snare, flies up into the sky without fear, so the soul whose bonds are cut crosses over saṃsāra for ever.'
    ),
    M(
      ['यथा निर्वाणकाले तु दीपो दग्ध्वा लयं व्रजेत्।', 'तथा सर्वाणि कर्माणि योगी दग्ध्वा लयं व्रजेत्॥'],
      'जैसे बुझने के समय दीपक (तेल-बत्ती को) जलाकर लीन हो जाता है, वैसे ही योगी सब कर्मों को जलाकर लय को प्राप्त होता है।',
      'As a lamp at the time of its going out burns [its fuel] away and passes into dissolution, so the yogin, having burnt away all actions, passes into dissolution.'
    ),
    M(
      ['प्राणायामसुतीक्ष्णेन मात्राधारेण योगवित्।', 'वैराग्योपलघृष्टेन छित्त्वा तं तु न बध्यते॥'],
      'योगवेत्ता प्राणायाम से अत्यन्त तीक्ष्ण की गई, मात्रा रूपी धार वाली तथा वैराग्य रूपी पत्थर पर घिसी गई (छुरी) से उस (बन्धन के सूत्र) को काटकर फिर नहीं बँधता।',
      'The knower of yoga, cutting that [thread] with [the knife] made keen by prāṇāyāma, whose edge is the measure, whetted on the stone of dispassion, is bound no more.'
    ),
    M(
      ['अमृतत्वं समाप्नोति यदा कामात्स मुच्यते।', 'सर्वेषणाविनिर्मुक्तश्छित्त्वा तं तु न बध्यते॥', 'इत्युपनिषत्॥'],
      'जब वह कामना से मुक्त हो जाता है, तब अमृतत्व को प्राप्त करता है। सब एषणाओं (इच्छाओं) से पूर्णतः मुक्त होकर, उस (बन्धन) को काटकर वह फिर नहीं बँधता। यह उपनिषद् है।',
      'He attains immortality when he is freed from desire. Wholly released from every craving, having cut that [bond], he is bound no more. Thus the Upaniṣad.'
    ),
  ],
};

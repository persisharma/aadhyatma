/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 *
 * Taittirīya — Kṛṣṇa Yajurveda (Taittirīya Āraṇyaka 7–9). Three vallīs —
 * Śikṣā (12 anuvākas), Brahmānanda (9), Bhṛgu (10) = 31 — cited vallī.anuvāka.
 * Each anuvāka is one page; the prose is split into lines at its traditional
 * danda groups.
 */
const M = (lines, meaningHi, meaningEn) => ({ lines, meaningHi, meaningEn });

export default {
  slug: 'taittiriya',
  muktika: 7,
  vedaHi: 'कृष्ण यजुर्वेद',
  vedaEn: 'Krishna Yajurveda',
  source: {
    baseText:
      'Kṛṣṇa Yajurveda (Taittirīya Āraṇyaka, prapāṭhakas 7–9) with Śāṅkara-bhāṣya, as printed in Gita Press "ईशादि नौ उपनिषद्"; Devanagari written out from the printed text.',
    canonicalEdition: 'Gita Press Gorakhpur, ईशादि नौ उपनिषद् (शांकरभाष्यार्थ सहित), code 66',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/taittiriya.html',
      'https://www.wisdomlib.org/hinduism/book/taittiriya-upanishad-shankara-bhashya',
      'https://archive.org/details/IshadiNauUpanishadGitaPress',
    ],
    notes:
      '31 anuvākas (Śikṣā 12 · Brahmānanda 9 · Bhṛgu 10), one per page, plus the Yajurvedic śānti-pāṭha (सह नाववतु) as page 1; the Śikṣā-vallī\'s own opening and closing peace-prayers stay as anuvākas 1.1 and 1.12. Vedic svara marks, pluta (३) and anunāsika ligatures are written with plain letters so the lines render cleanly. Devanagari was authored from memory of the printed text with no network source available at build time — a line-by-line check against the Gita Press scan is still owed.',
    retrievedOn: '2026-09-26',
  },
  shanti: M(
    ['ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै।', 'तेजस्वि नावधीतमस्तु मा विद्विषावहै॥', 'ॐ शान्तिः शान्तिः शान्तिः॥'],
    'वह (ब्रह्म) हम दोनों (गुरु-शिष्य) की साथ-साथ रक्षा करे, हम दोनों का साथ-साथ पालन करे; हम दोनों साथ-साथ सामर्थ्य प्राप्त करें। हमारा पढ़ा हुआ तेजस्वी हो; हम परस्पर द्वेष न करें। ॐ शान्तिः शान्तिः शान्तिः।',
    'May That protect us both together; may That nourish us both together; may we work together with vigour. May what we study be luminous; may we never hate one another. Om, peace, peace, peace.'
  ),
  khandas: [
    // ── Śikṣā Vallī ────────────────────────────────────────────────────────
    [
      M(
        [
          'ॐ शं नो मित्रः शं वरुणः। शं नो भवत्वर्यमा। शं न इन्द्रो बृहस्पतिः। शं नो विष्णुरुरुक्रमः।',
          'नमो ब्रह्मणे। नमस्ते वायो। त्वमेव प्रत्यक्षं ब्रह्मासि। त्वामेव प्रत्यक्षं ब्रह्म वदिष्यामि। ऋतं वदिष्यामि। सत्यं वदिष्यामि।',
          'तन्मामवतु। तद्वक्तारमवतु। अवतु माम्। अवतु वक्तारम्।',
          'ॐ शान्तिः शान्तिः शान्तिः॥',
        ],
        'मित्र हमारे लिए कल्याणकारी हों, वरुण कल्याणकारी हों, अर्यमा हमारे लिए कल्याणकारी हों; इन्द्र और बृहस्पति हमारे लिए कल्याणकारी हों; विशाल पगों वाले विष्णु हमारे लिए कल्याणकारी हों। ब्रह्म को नमस्कार। हे वायु! तुम्हें नमस्कार। तुम ही प्रत्यक्ष ब्रह्म हो; तुम्हीं को मैं प्रत्यक्ष ब्रह्म कहूँगा। मैं ऋत (यथार्थ) कहूँगा, सत्य कहूँगा। वह मेरी रक्षा करे, वह वक्ता (आचार्य) की रक्षा करे; मेरी रक्षा करे, वक्ता की रक्षा करे। ॐ शान्तिः शान्तिः शान्तिः।',
        'May Mitra be gracious to us, and Varuṇa; may Aryaman be gracious to us; may Indra and Bṛhaspati be gracious to us; may Viṣṇu of wide strides be gracious to us. Salutation to Brahman. Salutation to you, O Vāyu. You alone are the visible Brahman; you alone I shall call the visible Brahman. I shall speak what is right; I shall speak the truth. May That protect me; may That protect the teacher; protect me, protect the teacher. Om, peace, peace, peace.'
      ),
      M(
        ['ॐ शीक्षां व्याख्यास्यामः। वर्णः स्वरः। मात्रा बलम्। साम सन्तानः।', 'इत्युक्तः शीक्षाध्यायः॥'],
        'अब हम शिक्षा (उच्चारण-शास्त्र) की व्याख्या करेंगे — वर्ण, स्वर, मात्रा, बल (प्रयत्न), साम (समता) और सन्तान (संहिता/सन्धि)। इस प्रकार शिक्षा-अध्याय कहा गया।',
        'We shall now explain phonetics: the letters, the accents, the quantity, the effort, the even tone and the joining of sounds. Thus the chapter on phonetics has been declared.'
      ),
      M(
        [
          'सह नौ यशः। सह नौ ब्रह्मवर्चसम्। अथातः संहिताया उपनिषदं व्याख्यास्यामः। पञ्चस्वधिकरणेषु। अधिलोकमधिज्यौतिषमधिविद्यमधिप्रजमध्यात्मम्। ता महासंहिता इत्याचक्षते।',
          'अथाधिलोकम्। पृथिवी पूर्वरूपम्। द्यौरुत्तररूपम्। आकाशः सन्धिः। वायुः सन्धानम्। इत्यधिलोकम्।',
          'अथाधिज्यौतिषम्। अग्निः पूर्वरूपम्। आदित्य उत्तररूपम्। आपः सन्धिः। वैद्युतः सन्धानम्। इत्यधिज्यौतिषम्।',
          'अथाधिविद्यम्। आचार्यः पूर्वरूपम्। अन्तेवास्युत्तररूपम्। विद्या सन्धिः। प्रवचनं सन्धानम्। इत्यधिविद्यम्।',
          'अथाधिप्रजम्। माता पूर्वरूपम्। पितोत्तररूपम्। प्रजा सन्धिः। प्रजननं सन्धानम्। इत्यधिप्रजम्।',
          'अथाध्यात्मम्। अधरा हनुः पूर्वरूपम्। उत्तरा हनुरुत्तररूपम्। वाक् सन्धिः। जिह्वा सन्धानम्। इत्यध्यात्मम्।',
          'इतीमा महासंहिताः। य एवमेता महासंहिता व्याख्याता वेद। सन्धीयते प्रजया पशुभिः। ब्रह्मवर्चसेनान्नाद्येन सुवर्ग्येण लोकेन॥',
        ],
        'हम दोनों (गुरु-शिष्य) को साथ-साथ यश मिले, साथ-साथ ब्रह्मतेज मिले। अब संहिता (सन्धि) की उपनिषद् (रहस्य-उपासना) की व्याख्या पाँच अधिकरणों में करेंगे — लोक, ज्योति, विद्या, प्रजा और आत्मा के विषय में; इन्हें महासंहिताएँ कहते हैं। लोक-विषयक: पृथ्वी पूर्वरूप, द्युलोक उत्तररूप, आकाश सन्धि, वायु सन्धान (जोड़ने वाला)। ज्योति-विषयक: अग्नि पूर्वरूप, सूर्य उत्तररूप, जल सन्धि, विद्युत् सन्धान। विद्या-विषयक: आचार्य पूर्वरूप, शिष्य उत्तररूप, विद्या सन्धि, प्रवचन सन्धान। प्रजा-विषयक: माता पूर्वरूप, पिता उत्तररूप, सन्तान सन्धि, प्रजनन सन्धान। आत्म-विषयक: नीचे का जबड़ा पूर्वरूप, ऊपर का जबड़ा उत्तररूप, वाणी सन्धि, जिह्वा सन्धान। ये महासंहिताएँ हैं। जो इस प्रकार व्याख्यात महासंहिताओं को जानता है, वह सन्तान, पशु, ब्रह्मतेज, अन्न और स्वर्गलोक से संयुक्त होता है।',
        'May glory be ours together; may the radiance of sacred knowledge be ours together. Now we shall explain the secret teaching of the conjunctions, in five subjects: the worlds, the lights, knowledge, offspring and the body. These are called the great conjunctions. Regarding the worlds: earth is the first form, heaven the second, space the junction, wind the joiner. Regarding the lights: fire is the first form, the sun the second, water the junction, lightning the joiner. Regarding knowledge: the teacher is the first form, the pupil the second, knowledge the junction, teaching the joiner. Regarding offspring: the mother is the first form, the father the second, the child the junction, procreation the joiner. Regarding the body: the lower jaw is the first form, the upper jaw the second, speech the junction, the tongue the joiner. These are the great conjunctions. One who knows these great conjunctions as thus explained is joined with offspring, cattle, spiritual radiance, food and the heavenly world.'
      ),
      M(
        [
          'यश्छन्दसामृषभो विश्वरूपः। छन्दोभ्योऽध्यमृतात्सम्बभूव। स मेन्द्रो मेधया स्पृणोतु। अमृतस्य देव धारणो भूयासम्।',
          'शरीरं मे विचर्षणम्। जिह्वा मे मधुमत्तमा। कर्णाभ्यां भूरि विश्रुवम्। ब्रह्मणः कोशोऽसि मेधया पिहितः। श्रुतं मे गोपाय।',
          'आवहन्ती वितन्वाना। कुर्वाणाऽचीरमात्मनः। वासांसि मम गावश्च। अन्नपाने च सर्वदा। ततो मे श्रियमावह। लोमशां पशुभिः सह स्वाहा।',
          'आ मा यन्तु ब्रह्मचारिणः स्वाहा। वि मा यन्तु ब्रह्मचारिणः स्वाहा। प्र मा यन्तु ब्रह्मचारिणः स्वाहा। दमायन्तु ब्रह्मचारिणः स्वाहा। शमायन्तु ब्रह्मचारिणः स्वाहा।',
          'यशो जनेऽसानि स्वाहा। श्रेयान् वस्यसोऽसानि स्वाहा। तं त्वा भग प्रविशानि स्वाहा। स मा भग प्रविश स्वाहा। तस्मिन् सहस्रशाखे। नि भगाहं त्वयि मृजे स्वाहा।',
          'यथाऽऽपः प्रवता यन्ति। यथा मासा अहर्जरम्। एवं मां ब्रह्मचारिणः। धातरायन्तु सर्वतः स्वाहा। प्रतिवेशोऽसि प्र मा भाहि प्र मा पद्यस्व॥',
        ],
        'जो (ओंकार) वेदों में श्रेष्ठ, विश्वरूप और अमृत-रूप वेदों से प्रकट हुआ है — वह इन्द्र (परमेश्वर) मुझे मेधा से पुष्ट करे। हे देव! मैं अमृत (ज्ञान) का धारण करने वाला बनूँ। मेरा शरीर समर्थ हो; मेरी जिह्वा अत्यन्त मधुर हो; मैं कानों से बहुत सुनूँ। तू (ओंकार) ब्रह्म का कोश है, मेधा से ढका हुआ; मेरे सुने हुए की रक्षा कर। (श्री) मेरे लिए लाती हुई, बढ़ाती हुई, शीघ्र ही अपने वस्त्र, गौएँ और अन्न-पान सर्वदा बनाती हुई — वह रोमश पशुओं सहित श्री मुझे प्राप्त हो — स्वाहा। ब्रह्मचारी मेरे पास आएँ — स्वाहा; विविध दिशाओं से आएँ — स्वाहा; मेरे सामने आएँ — स्वाहा; वे इन्द्रिय-निग्रही हों — स्वाहा; शान्त हों — स्वाहा। मैं लोगों में यशस्वी होऊँ — स्वाहा; धनवानों में श्रेष्ठ होऊँ — स्वाहा। हे भगवन्! मैं तुझमें प्रवेश करूँ — स्वाहा; हे भगवन्! तू मुझमें प्रवेश कर — स्वाहा। हे भगवन्! उस सहस्र शाखाओं वाले तुझमें मैं अपने (पाप) धोता हूँ — स्वाहा। जैसे जल ढाल की ओर जाते हैं, जैसे महीने संवत्सर में जाते हैं — हे धाता! वैसे ही ब्रह्मचारी सब ओर से मेरे पास आएँ — स्वाहा। तू (मेरा) आश्रय है; मुझमें प्रकाशित हो; मुझे प्राप्त हो।',
        'May He who is the bull among the Vedic hymns, of universal form, who arose from the immortal hymns — may that Indra strengthen me with wisdom. O God, may I be a bearer of immortality. May my body be fit, my tongue exceedingly sweet, may I hear much with my ears. You (Om) are the sheath of Brahman, covered by wisdom; guard what I have heard. Bringing and spreading prosperity, soon making for me garments, cattle, food and drink at all times — bring me that fortune, with woolly cattle — svāhā. May students come to me — svāhā; may they come from every side — svāhā; may they come forward — svāhā; may they be self-controlled — svāhā; may they be peaceful — svāhā. May I be famed among people — svāhā; may I be better than the wealthy — svāhā. O Lord, may I enter into you — svāhā; O Lord, enter into me — svāhā. In you, O Lord of a thousand branches, I cleanse myself — svāhā. As waters flow downward, as the months into the year, so, O Sustainer, may students come to me from every side — svāhā. You are my refuge; shine upon me; come to me.'
      ),
      M(
        [
          'भूर्भुवः सुवरिति वा एतास्तिस्रो व्याहृतयः। तासामु ह स्मैतां चतुर्थीम्। माहाचमस्यः प्रवेदयते। मह इति। तद्ब्रह्म। स आत्मा। अङ्गान्यन्या देवताः।',
          'भूरिति वा अयं लोकः। भुव इत्यन्तरिक्षम्। सुवरित्यसौ लोकः। मह इत्यादित्यः। आदित्येन वाव सर्वे लोका महीयन्ते।',
          'भूरिति वा अग्निः। भुव इति वायुः। सुवरित्यादित्यः। मह इति चन्द्रमाः। चन्द्रमसा वाव सर्वाणि ज्योतींषि महीयन्ते।',
          'भूरिति वा ऋचः। भुव इति सामानि। सुवरिति यजूंषि। मह इति ब्रह्म। ब्रह्मणा वाव सर्वे वेदा महीयन्ते।',
          'भूरिति वै प्राणः। भुव इत्यपानः। सुवरिति व्यानः। मह इत्यन्नम्। अन्नेन वाव सर्वे प्राणा महीयन्ते।',
          'ता वा एताश्चतस्रश्चतुर्धा। चतस्रश्चतस्रो व्याहृतयः। ता यो वेद। स वेद ब्रह्म। सर्वेऽस्मै देवा बलिमावहन्ति॥',
        ],
        'भूः, भुवः, सुवः — ये तीन व्याहृतियाँ हैं। उनकी चौथी "महः" को महाचमस के पुत्र (ऋषि) ने जाना। वह ब्रह्म है, वह आत्मा है; अन्य देवता उसके अंग हैं। भूः यह लोक है, भुवः अन्तरिक्ष, सुवः वह (स्वर्ग) लोक, महः सूर्य; सूर्य से ही सब लोक महिमा पाते हैं। भूः अग्नि है, भुवः वायु, सुवः सूर्य, महः चन्द्रमा; चन्द्रमा से ही सब ज्योतियाँ महिमा पाती हैं। भूः ऋचाएँ हैं, भुवः साम, सुवः यजुष्, महः ब्रह्म (ओंकार); ब्रह्म से ही सब वेद महिमा पाते हैं। भूः प्राण है, भुवः अपान, सुवः व्यान, महः अन्न; अन्न से ही सब प्राण महिमा पाते हैं। ये चार व्याहृतियाँ चार-चार प्रकार की हैं — चार-चार व्याहृतियाँ। जो इन्हें जानता है, वह ब्रह्म को जानता है; सब देवता उसके लिए भेंट लाते हैं।',
        'Bhūḥ, Bhuvaḥ, Suvaḥ — these are the three utterances. A fourth, Mahaḥ, the son of Mahācamasa made known. That is Brahman, that is the Self; the other gods are its limbs. Bhūḥ is this world, Bhuvaḥ the mid-region, Suvaḥ the world beyond, Mahaḥ the sun; by the sun all worlds are made great. Bhūḥ is fire, Bhuvaḥ air, Suvaḥ the sun, Mahaḥ the moon; by the moon all lights are made great. Bhūḥ is the Ṛk verses, Bhuvaḥ the Sāma, Suvaḥ the Yajus, Mahaḥ Brahman (Om); by Brahman all the Vedas are made great. Bhūḥ is the in-breath, Bhuvaḥ the out-breath, Suvaḥ the diffused breath, Mahaḥ food; by food all breaths are made great. These four are fourfold — four times four utterances. One who knows them knows Brahman; all the gods bring him tribute.'
      ),
      M(
        [
          'स य एषोऽन्तर्हृदय आकाशः। तस्मिन्नयं पुरुषो मनोमयः। अमृतो हिरण्मयः।',
          'अन्तरेण तालुके। य एष स्तन इवावलम्बते। सेन्द्रयोनिः। यत्रासौ केशान्तो विवर्तते। व्यपोह्य शीर्षकपाले।',
          'भूरित्यग्नौ प्रतितिष्ठति। भुव इति वायौ। सुवरित्यादित्ये। मह इति ब्रह्मणि। आप्नोति स्वाराज्यम्। आप्नोति मनसस्पतिम्। वाक्पतिश्चक्षुष्पतिः। श्रोत्रपतिर्विज्ञानपतिः। एतत्ततो भवति।',
          'आकाशशरीरं ब्रह्म। सत्यात्म प्राणारामं मन आनन्दम्। शान्तिसमृद्धममृतम्। इति प्राचीनयोग्योपास्स्व॥',
        ],
        'यह जो हृदय के भीतर आकाश है, उसमें यह मनोमय, अमृत, हिरण्मय (ज्योतिर्मय) पुरुष है। दोनों तालुओं के बीच जो स्तन की तरह लटकता है (उससे ऊपर), जहाँ केशों का मूल फटता है, सिर के कपालों को अलग करके — वह इन्द्र (ब्रह्म) का मार्ग है। (उस मार्ग से निकलकर) वह "भूः" कहकर अग्नि में प्रतिष्ठित होता है, "भुवः" से वायु में, "सुवः" से सूर्य में, "महः" से ब्रह्म में। वह स्वाराज्य पाता है; मन के स्वामी को पाता है; वाणी, नेत्र, श्रोत्र और विज्ञान का स्वामी होता है। इससे और यह होता है — वह आकाश-शरीर, सत्य-आत्मा, प्राण में रमने वाला, मन में आनन्दित, शान्ति से समृद्ध, अमृत ब्रह्म हो जाता है। हे प्राचीनयोग्य! ऐसी उपासना करो।',
        'In this space within the heart dwells the Person made of mind, immortal, golden. Between the two palates, above what hangs like a nipple, where the roots of the hair part, pushing apart the bones of the skull — that is the path of Indra (Brahman). Departing by it, he rests in fire with "Bhūḥ," in air with "Bhuvaḥ," in the sun with "Suvaḥ," in Brahman with "Mahaḥ." He attains self-sovereignty; he attains the lord of the mind; he becomes lord of speech, of sight, of hearing, of understanding. And this he becomes: Brahman whose body is space, whose self is truth, who delights in life, rejoices in mind, is rich in peace, immortal. Thus, O Prācīnayogya, meditate.'
      ),
      M(
        [
          'पृथिव्यन्तरिक्षं द्यौर्दिशोऽवान्तरदिशाः। अग्निर्वायुरादित्यश्चन्द्रमा नक्षत्राणि। आप ओषधयो वनस्पतय आकाश आत्मा। इत्यधिभूतम्।',
          'अथाध्यात्मम्। प्राणो व्यानोऽपान उदानः समानः। चक्षुः श्रोत्रं मनो वाक् त्वक्। चर्म मांसं स्नावास्थि मज्जा।',
          'एतदधिविधाय ऋषिरवोचत्। पाङ्क्तं वा इदं सर्वम्। पाङ्क्तेनैव पाङ्क्तं स्पृणोतीति॥',
        ],
        'पृथ्वी, अन्तरिक्ष, द्युलोक, दिशाएँ और उपदिशाएँ; अग्नि, वायु, सूर्य, चन्द्रमा और नक्षत्र; जल, ओषधियाँ, वनस्पतियाँ, आकाश और आत्मा (विराट् शरीर) — यह अधिभूत (बाह्य) पंक्तियाँ हैं। अब अध्यात्म — प्राण, व्यान, अपान, उदान, समान; नेत्र, श्रोत्र, मन, वाणी, त्वचा; चर्म, मांस, स्नायु, अस्थि, मज्जा। इसका विधान करके ऋषि ने कहा — "यह सब पाङ्क्त (पाँच-पाँच का) है; पाङ्क्त (आध्यात्मिक) से ही पाङ्क्त (बाह्य) को पुष्ट करता है।"',
        'Earth, mid-region, heaven, the directions and the intermediate directions; fire, air, sun, moon and stars; water, herbs, trees, space and the body — this concerns the outer world. Now concerning the self: the in-breath, diffused breath, out-breath, up-breath and equalising breath; eye, ear, mind, speech and skin; skin, flesh, sinew, bone and marrow. Having ordained this, the sage said: "All this is fivefold; by the fivefold within one makes firm the fivefold without."'
      ),
      M(
        [
          'ओमिति ब्रह्म। ओमितीदं सर्वम्। ओमित्येतदनुकृतिर्ह स्म वा अप्यो श्रावयेत्याश्रावयन्ति। ओमिति सामानि गायन्ति। ओं शोमिति शस्त्राणि शंसन्ति।',
          'ओमित्यध्वर्युः प्रतिगरं प्रतिगृणाति। ओमिति ब्रह्मा प्रसौति। ओमित्यग्निहोत्रमनुजानाति।',
          'ओमिति ब्राह्मणः प्रवक्ष्यन्नाह ब्रह्मोपाप्नवानीति। ब्रह्मैवोपाप्नोति॥',
        ],
        'ॐ ब्रह्म है। ॐ यह सब है। ॐ अनुकृति (स्वीकृति) है — "ओ श्रावय" कहकर (होता को) सुनवाते हैं। ॐ कहकर साम गाते हैं; "ओं शोम्" कहकर शस्त्र (स्तुतियाँ) पढ़ते हैं। ॐ कहकर अध्वर्यु प्रतिगर (उत्तर) देता है; ॐ कहकर ब्रह्मा (ऋत्विक्) अनुमति देता है; ॐ कहकर अग्निहोत्र की अनुज्ञा देता है। ब्राह्मण (वेद) पढ़ने से पहले ॐ कहता है — "मैं ब्रह्म को प्राप्त करूँ"; और वह ब्रह्म को ही प्राप्त करता है।',
        'Om is Brahman. Om is all this. Om is assent: with "O, make them hear" they cause the recitation to be heard. With Om they sing the Sāma chants; with "Om, śom" they recite the praises. With Om the adhvaryu priest gives the response; with Om the brahmā priest gives leave; with Om one assents to the fire-offering. A brāhmaṇa about to recite says Om, "May I attain Brahman" — and Brahman indeed he attains.'
      ),
      M(
        [
          'ऋतं च स्वाध्यायप्रवचने च। सत्यं च स्वाध्यायप्रवचने च। तपश्च स्वाध्यायप्रवचने च। दमश्च स्वाध्यायप्रवचने च। शमश्च स्वाध्यायप्रवचने च।',
          'अग्नयश्च स्वाध्यायप्रवचने च। अग्निहोत्रं च स्वाध्यायप्रवचने च। अतिथयश्च स्वाध्यायप्रवचने च। मानुषं च स्वाध्यायप्रवचने च।',
          'प्रजा च स्वाध्यायप्रवचने च। प्रजनश्च स्वाध्यायप्रवचने च। प्रजातिश्च स्वाध्यायप्रवचने च।',
          'सत्यमिति सत्यवचा राथीतरः। तप इति तपोनित्यः पौरुशिष्टिः। स्वाध्यायप्रवचने एवेति नाको मौद्गल्यः। तद्धि तपस्तद्धि तपः॥',
        ],
        'ऋत (यथार्थ आचरण) और साथ में स्वाध्याय-प्रवचन; सत्य और स्वाध्याय-प्रवचन; तप और स्वाध्याय-प्रवचन; दम (इन्द्रिय-निग्रह) और स्वाध्याय-प्रवचन; शम (मन की शान्ति) और स्वाध्याय-प्रवचन; अग्नियाँ (अग्न्याधान) और स्वाध्याय-प्रवचन; अग्निहोत्र और स्वाध्याय-प्रवचन; अतिथि-सेवा और स्वाध्याय-प्रवचन; मानवीय व्यवहार और स्वाध्याय-प्रवचन; सन्तान और स्वाध्याय-प्रवचन; प्रजनन और स्वाध्याय-प्रवचन; वंश-परम्परा और स्वाध्याय-प्रवचन (— ये सब कर्तव्य हैं)। रथीतर-गोत्री सत्यवचा कहते हैं — "सत्य ही (मुख्य है)"; पुरुशिष्ट-पुत्र तपोनित्य कहते हैं — "तप ही"; मुद्गल-पुत्र नाक कहते हैं — "स्वाध्याय-प्रवचन ही; क्योंकि वही तप है, वही तप है।"',
        'Right conduct, together with study and teaching; truth, with study and teaching; austerity, with study and teaching; self-restraint, with study and teaching; tranquillity, with study and teaching; the sacred fires, with study and teaching; the fire-offering, with study and teaching; hospitality to guests, with study and teaching; kindness to people, with study and teaching; children, with study and teaching; begetting, with study and teaching; the continuance of the line, with study and teaching. "Truth alone," says Satyavacas of the Rāthītara line; "austerity alone," says Taponitya son of Puruśiṣṭa; "study and teaching alone," says Nāka son of Mudgala — "for that is austerity, that indeed is austerity."'
      ),
      M(
        [
          'अहं वृक्षस्य रेरिवा। कीर्तिः पृष्ठं गिरेरिव। ऊर्ध्वपवित्रो वाजिनीव स्वमृतमस्मि। द्रविणं सवर्चसम्। सुमेधा अमृतोक्षितः।',
          'इति त्रिशङ्कोर्वेदानुवचनम्॥',
        ],
        '"मैं (संसार-) वृक्ष को प्रेरित करने (उखाड़ने) वाला हूँ। मेरी कीर्ति पर्वत के शिखर-सी ऊँची है। मैं परम पवित्र (ब्रह्म) का मूल हूँ; सूर्य में जो अमृत है, वैसा शुद्ध अमृत मैं हूँ। मैं तेजोमय धन हूँ, उत्तम मेधा वाला, अमृत से सिक्त हूँ।" — यह त्रिशंकु का वेद-अनुभव कथन है।',
        '"I am the mover of the tree (of the world). My fame is high as a mountain peak. I am the pure source on high; like the nectar in the sun, I am pure immortality. I am radiant wealth, of excellent wisdom, sprinkled with immortality." — This is Triśaṅku\'s declaration after realising the Veda.'
      ),
      M(
        [
          'वेदमनूच्याचार्योऽन्तेवासिनमनुशास्ति। सत्यं वद। धर्मं चर। स्वाध्यायान्मा प्रमदः। आचार्याय प्रियं धनमाहृत्य प्रजातन्तुं मा व्यवच्छेत्सीः।',
          'सत्यान्न प्रमदितव्यम्। धर्मान्न प्रमदितव्यम्। कुशलान्न प्रमदितव्यम्। भूत्यै न प्रमदितव्यम्। स्वाध्यायप्रवचनाभ्यां न प्रमदितव्यम्। देवपितृकार्याभ्यां न प्रमदितव्यम्।',
          'मातृदेवो भव। पितृदेवो भव। आचार्यदेवो भव। अतिथिदेवो भव। यान्यनवद्यानि कर्माणि। तानि सेवितव्यानि। नो इतराणि। यान्यस्माकं सुचरितानि। तानि त्वयोपास्यानि। नो इतराणि।',
          'ये के चास्मच्छ्रेयांसो ब्राह्मणाः। तेषां त्वयाऽऽसनेन प्रश्वसितव्यम्। श्रद्धया देयम्। अश्रद्धयाऽदेयम्। श्रिया देयम्। ह्रिया देयम्। भिया देयम्। संविदा देयम्।',
          'अथ यदि ते कर्मविचिकित्सा वा वृत्तविचिकित्सा वा स्यात्। ये तत्र ब्राह्मणाः सम्मर्शिनः। युक्ता आयुक्ताः। अलूक्षा धर्मकामाः स्युः। यथा ते तत्र वर्तेरन्। तथा तत्र वर्तेथाः।',
          'अथाभ्याख्यातेषु। ये तत्र ब्राह्मणाः सम्मर्शिनः। युक्ता आयुक्ताः। अलूक्षा धर्मकामाः स्युः। यथा ते तेषु वर्तेरन्। तथा तेषु वर्तेथाः।',
          'एष आदेशः। एष उपदेशः। एषा वेदोपनिषत्। एतदनुशासनम्। एवमुपास्यम्। एवमु चैतदुपास्यम्॥',
        ],
        'वेद पढ़ाकर आचार्य शिष्य को उपदेश देता है — सत्य बोलो। धर्म का आचरण करो। स्वाध्याय में प्रमाद न करो। आचार्य को प्रिय धन (दक्षिणा) देकर सन्तान-परम्परा का विच्छेद न करो। सत्य से, धर्म से, कुशल (कल्याण-कर्म) से, ऐश्वर्य (के उपाय) से, स्वाध्याय-प्रवचन से, देव और पितृ-कार्यों से प्रमाद न करना। माता को देव मानो, पिता को देव मानो, आचार्य को देव मानो, अतिथि को देव मानो। जो कर्म निर्दोष हैं, उन्हीं का सेवन करो, दूसरों का नहीं। हमारे जो अच्छे आचरण हैं, उन्हीं का अनुसरण करो, दूसरों का नहीं। जो ब्राह्मण हमसे श्रेष्ठ हों, उन्हें आसन देकर (उनके सामने) श्वास भी सम्भलकर लो। श्रद्धा से दो; अश्रद्धा से न दो। श्री (सामर्थ्य) के अनुसार दो; लज्जा से दो; भय से दो; समझदारी से दो। यदि तुम्हें कर्म या आचरण में संदेह हो, तो वहाँ जो विचारशील, कर्म में लगे, स्वतन्त्र विचार वाले, कोमल और धर्म-कामी ब्राह्मण हों — वे जैसा करें, तुम वैसा करो। आरोपित (दोषी) लोगों के प्रति भी, वैसे ब्राह्मण जैसा व्यवहार करें, वैसा तुम करो। यह आदेश है, यह उपदेश है, यह वेद का रहस्य है, यह अनुशासन है। ऐसा आचरण करना चाहिए; ऐसा ही आचरण करना चाहिए।',
        'Having taught the Veda, the teacher instructs the pupil: Speak the truth. Practise righteousness. Do not neglect study. Having brought the teacher the wealth he desires, do not cut off the line of offspring. Do not swerve from truth, from righteousness, from welfare, from prosperity, from study and teaching, from duties to the gods and the ancestors. Be one for whom the mother is a god, the father a god, the teacher a god, the guest a god. Do only those deeds that are blameless, not others. Follow only those of our practices that are good, not others. To brāhmaṇas better than we, give a seat and let your breath be still before them. Give with faith; do not give without faith. Give according to your means; give with modesty; give with awe; give with understanding. If you have any doubt about an action or about conduct, act as would the brāhmaṇas there who are thoughtful, devoted, independent, gentle and lovers of righteousness. Toward those who are accused, act as such brāhmaṇas would act. This is the command, this the teaching, this the secret of the Veda, this the instruction. Thus should one live; thus indeed should one live.'
      ),
      M(
        [
          'शं नो मित्रः शं वरुणः। शं नो भवत्वर्यमा। शं न इन्द्रो बृहस्पतिः। शं नो विष्णुरुरुक्रमः।',
          'नमो ब्रह्मणे। नमस्ते वायो। त्वमेव प्रत्यक्षं ब्रह्मासि। त्वामेव प्रत्यक्षं ब्रह्मावादिषम्। ऋतमवादिषम्। सत्यमवादिषम्।',
          'तन्मामावीत्। तद्वक्तारमावीत्। आवीन्माम्। आवीद्वक्तारम्।',
          'ॐ शान्तिः शान्तिः शान्तिः॥',
        ],
        'मित्र हमारे लिए कल्याणकारी हों, वरुण कल्याणकारी हों, अर्यमा हमारे लिए कल्याणकारी हों; इन्द्र और बृहस्पति हमारे लिए कल्याणकारी हों; विशाल पगों वाले विष्णु हमारे लिए कल्याणकारी हों। ब्रह्म को नमस्कार। हे वायु! तुम्हें नमस्कार। तुम ही प्रत्यक्ष ब्रह्म हो; तुम्हीं को मैंने प्रत्यक्ष ब्रह्म कहा। मैंने ऋत कहा, सत्य कहा। उसने मेरी रक्षा की, उसने वक्ता की रक्षा की; मेरी रक्षा की, वक्ता की रक्षा की। ॐ शान्तिः शान्तिः शान्तिः।',
        'May Mitra be gracious to us, and Varuṇa; may Aryaman be gracious to us; may Indra and Bṛhaspati be gracious to us; may Viṣṇu of wide strides be gracious to us. Salutation to Brahman. Salutation to you, O Vāyu. You alone are the visible Brahman; you alone I have called the visible Brahman. I have spoken what is right; I have spoken the truth. It has protected me; it has protected the teacher; it protected me, it protected the teacher. Om, peace, peace, peace.'
      ),
    ],
    // ── Brahmānanda Vallī ─────────────────────────────────────────────────
    [
      M(
        [
          'ॐ ब्रह्मविदाप्नोति परम्। तदेषाऽभ्युक्ता। सत्यं ज्ञानमनन्तं ब्रह्म। यो वेद निहितं गुहायां परमे व्योमन्। सोऽश्नुते सर्वान् कामान् सह। ब्रह्मणा विपश्चितेति।',
          'तस्माद्वा एतस्मादात्मन आकाशः सम्भूतः। आकाशाद्वायुः। वायोरग्निः। अग्नेरापः। अद्भ्यः पृथिवी। पृथिव्या ओषधयः। ओषधीभ्योऽन्नम्। अन्नात्पुरुषः।',
          'स वा एष पुरुषोऽन्नरसमयः। तस्येदमेव शिरः। अयं दक्षिणः पक्षः। अयमुत्तरः पक्षः। अयमात्मा। इदं पुच्छं प्रतिष्ठा। तदप्येष श्लोको भवति॥',
        ],
        'ब्रह्म को जानने वाला परम (ब्रह्म) को प्राप्त करता है। इस विषय में यह (ऋचा) कही गई है — "ब्रह्म सत्य, ज्ञान और अनन्त है। जो उसे हृदय-गुहा में और परम आकाश में स्थित जानता है, वह सर्वज्ञ ब्रह्म के साथ (एक होकर) सब कामनाओं का एक साथ भोग करता है।" उस इस आत्मा से आकाश उत्पन्न हुआ; आकाश से वायु; वायु से अग्नि; अग्नि से जल; जल से पृथ्वी; पृथ्वी से ओषधियाँ; ओषधियों से अन्न; अन्न से पुरुष। वह यह पुरुष अन्न-रस से बना है। यही (सिर) उसका सिर है; यह दक्षिण पक्ष (दायाँ हाथ), यह उत्तर पक्ष (बायाँ हाथ), यह (मध्य भाग) आत्मा, और यह (नाभि से नीचे) पुच्छ-रूप प्रतिष्ठा है। इस विषय में यह श्लोक है —',
        'The knower of Brahman attains the highest. On this it is said: "Brahman is truth, knowledge, infinity. One who knows it hidden in the cave of the heart and in the supreme space enjoys all desires at once, together with the all-knowing Brahman." From this Self arose space; from space, air; from air, fire; from fire, water; from water, earth; from earth, plants; from plants, food; from food, the person. This person is made of the essence of food. This is his head; this the right side; this the left side; this the trunk; this the lower part, the foundation. On this there is the verse:'
      ),
      M(
        [
          'अन्नाद्वै प्रजाः प्रजायन्ते। याः काश्च पृथिवीं श्रिताः। अथो अन्नेनैव जीवन्ति। अथैनदपि यन्त्यन्ततः। अन्नं हि भूतानां ज्येष्ठम्। तस्मात् सर्वौषधमुच्यते।',
          'सर्वं वै तेऽन्नमाप्नुवन्ति। येऽन्नं ब्रह्मोपासते। अन्नं हि भूतानां ज्येष्ठम्। तस्मात् सर्वौषधमुच्यते। अन्नाद् भूतानि जायन्ते। जातान्यन्नेन वर्धन्ते। अद्यतेऽत्ति च भूतानि। तस्मादन्नं तदुच्यत इति।',
          'तस्माद्वा एतस्मादन्नरसमयात्। अन्योऽन्तर आत्मा प्राणमयः। तेनैष पूर्णः। स वा एष पुरुषविध एव। तस्य पुरुषविधताम्। अन्वयं पुरुषविधः।',
          'तस्य प्राण एव शिरः। व्यानो दक्षिणः पक्षः। अपान उत्तरः पक्षः। आकाश आत्मा। पृथिवी पुच्छं प्रतिष्ठा। तदप्येष श्लोको भवति॥',
        ],
        '"पृथ्वी पर आश्रित जो भी प्रजा है, वह अन्न से ही उत्पन्न होती है; अन्न से ही जीवित रहती है; और अन्त में अन्न में ही लीन होती है। अन्न ही भूतों में ज्येष्ठ है, इसलिए सर्वौषध कहा जाता है। जो अन्न को ब्रह्म-रूप से उपासते हैं, वे सब अन्न प्राप्त करते हैं। अन्न ही भूतों में ज्येष्ठ है, इसलिए सर्वौषध कहलाता है। अन्न से भूत उत्पन्न होते हैं, उत्पन्न होकर अन्न से बढ़ते हैं। यह (भूतों द्वारा) खाया जाता है और भूतों को खाता है, इसलिए अन्न कहलाता है।" इस अन्न-रसमय (शरीर) से भिन्न, इसके भीतर प्राणमय आत्मा है; उससे यह पूर्ण है। वह भी पुरुष के आकार का ही है; उस (अन्नमय) के पुरुष-आकार के अनुसार यह भी पुरुष-आकार है। उसका प्राण ही सिर है, व्यान दक्षिण पक्ष, अपान उत्तर पक्ष, आकाश (समान) आत्मा, पृथ्वी पुच्छ-रूप प्रतिष्ठा। इस विषय में यह श्लोक है —',
        '"From food are born all creatures that dwell on earth; by food alone they live; and into it they pass at the end. Food is the eldest of beings; therefore it is called the medicine of all. Those who worship food as Brahman obtain all food. Food is the eldest of beings; therefore it is called the medicine of all. From food beings are born; born, they grow by food. It is eaten and it eats beings; therefore it is called food." Other than this self made of food, within it, is the self made of breath; by it this one is filled. It too has the form of a person; after the person-form of the former is the person-form of this. Its head is the in-breath, its right side the diffused breath, its left side the out-breath, its trunk space, its foundation the earth. On this there is the verse:'
      ),
      M(
        [
          'प्राणं देवा अनु प्राणन्ति। मनुष्याः पशवश्च ये। प्राणो हि भूतानामायुः। तस्मात् सर्वायुषमुच्यते। सर्वमेव त आयुर्यन्ति। ये प्राणं ब्रह्मोपासते। प्राणो हि भूतानामायुः। तस्मात् सर्वायुषमुच्यत इति।',
          'तस्यैष एव शारीर आत्मा। यः पूर्वस्य। तस्माद्वा एतस्मात् प्राणमयात्। अन्योऽन्तर आत्मा मनोमयः। तेनैष पूर्णः। स वा एष पुरुषविध एव। तस्य पुरुषविधताम्। अन्वयं पुरुषविधः।',
          'तस्य यजुरेव शिरः। ऋग्दक्षिणः पक्षः। सामोत्तरः पक्षः। आदेश आत्मा। अथर्वाङ्गिरसः पुच्छं प्रतिष्ठा। तदप्येष श्लोको भवति॥',
        ],
        '"देवता, मनुष्य और पशु — सब प्राण के अनुसार प्राण-क्रिया करते हैं। प्राण ही भूतों की आयु है, इसलिए सर्वायुष कहलाता है। जो प्राण को ब्रह्म-रूप से उपासते हैं, वे पूर्ण आयु पाते हैं। प्राण ही भूतों की आयु है, इसलिए सर्वायुष कहलाता है।" यह (प्राणमय) ही पूर्व (अन्नमय) का शरीरस्थ आत्मा है। इस प्राणमय से भिन्न, इसके भीतर मनोमय आत्मा है; उससे यह पूर्ण है। वह भी पुरुष-आकार का है; उसके पुरुष-आकार के अनुसार यह भी पुरुष-आकार है। उसका यजुष् ही सिर है, ऋक् दक्षिण पक्ष, साम उत्तर पक्ष, आदेश (ब्राह्मण-भाग) आत्मा, अथर्व-अङ्गिरस (मन्त्र) पुच्छ-रूप प्रतिष्ठा। इस विषय में यह श्लोक है —',
        '"Gods, men and beasts breathe after the breath. Breath is the life of beings; therefore it is called the life of all. Those who worship breath as Brahman attain the full span of life. Breath is the life of beings; therefore it is called the life of all." This (breath-self) is the embodied self of the former. Other than this self made of breath, within it, is the self made of mind; by it this one is filled. It too has the form of a person; after the person-form of the former is the person-form of this. Its head is the Yajus, its right side the Ṛk, its left side the Sāma, its trunk the injunctions, its foundation the Atharva-Aṅgirasa hymns. On this there is the verse:'
      ),
      M(
        [
          'यतो वाचो निवर्तन्ते। अप्राप्य मनसा सह। आनन्दं ब्रह्मणो विद्वान्। न बिभेति कदाचनेति।',
          'तस्यैष एव शारीर आत्मा। यः पूर्वस्य। तस्माद्वा एतस्मान्मनोमयात्। अन्योऽन्तर आत्मा विज्ञानमयः। तेनैष पूर्णः। स वा एष पुरुषविध एव। तस्य पुरुषविधताम्। अन्वयं पुरुषविधः।',
          'तस्य श्रद्धैव शिरः। ऋतं दक्षिणः पक्षः। सत्यमुत्तरः पक्षः। योग आत्मा। महः पुच्छं प्रतिष्ठा। तदप्येष श्लोको भवति॥',
        ],
        '"जहाँ से वाणी मन के साथ (उसे) न पाकर लौट आती है — ब्रह्म के उस आनन्द को जानने वाला कभी भय नहीं करता।" यह (मनोमय) ही पूर्व (प्राणमय) का शरीरस्थ आत्मा है। इस मनोमय से भिन्न, इसके भीतर विज्ञानमय आत्मा है; उससे यह पूर्ण है। वह भी पुरुष-आकार का है; उसके पुरुष-आकार के अनुसार यह भी पुरुष-आकार है। उसकी श्रद्धा ही सिर है, ऋत दक्षिण पक्ष, सत्य उत्तर पक्ष, योग (समाधान) आत्मा, महः (महत्तत्त्व) पुच्छ-रूप प्रतिष्ठा। इस विषय में यह श्लोक है —',
        '"From which words turn back, together with the mind, unable to reach it — one who knows that bliss of Brahman never fears." This (mind-self) is the embodied self of the former. Other than this self made of mind, within it, is the self made of understanding; by it this one is filled. It too has the form of a person; after the person-form of the former is the person-form of this. Its head is faith, its right side rightness, its left side truth, its trunk concentration, its foundation the Great (cosmic intellect). On this there is the verse:'
      ),
      M(
        [
          'विज्ञानं यज्ञं तनुते। कर्माणि तनुतेऽपि च। विज्ञानं देवाः सर्वे। ब्रह्म ज्येष्ठमुपासते। विज्ञानं ब्रह्म चेद्वेद। तस्माच्चेन्न प्रमाद्यति। शरीरे पाप्मनो हित्वा। सर्वान् कामान् समश्नुत इति।',
          'तस्यैष एव शारीर आत्मा। यः पूर्वस्य। तस्माद्वा एतस्माद्विज्ञानमयात्। अन्योऽन्तर आत्माऽऽनन्दमयः। तेनैष पूर्णः। स वा एष पुरुषविध एव। तस्य पुरुषविधताम्। अन्वयं पुरुषविधः।',
          'तस्य प्रियमेव शिरः। मोदो दक्षिणः पक्षः। प्रमोद उत्तरः पक्षः। आनन्द आत्मा। ब्रह्म पुच्छं प्रतिष्ठा। तदप्येष श्लोको भवति॥',
        ],
        '"विज्ञान यज्ञ का विस्तार करता है और कर्मों का भी विस्तार करता है। सब देवता ज्येष्ठ ब्रह्म-रूप विज्ञान की उपासना करते हैं। यदि (कोई) विज्ञान को ब्रह्म जानता है और उससे प्रमाद नहीं करता, तो शरीर में पापों को छोड़कर सब कामनाओं का भोग करता है।" यह (विज्ञानमय) ही पूर्व (मनोमय) का शरीरस्थ आत्मा है। इस विज्ञानमय से भिन्न, इसके भीतर आनन्दमय आत्मा है; उससे यह पूर्ण है। वह भी पुरुष-आकार का है; उसके पुरुष-आकार के अनुसार यह भी पुरुष-आकार है। उसका प्रिय ही सिर है, मोद दक्षिण पक्ष, प्रमोद उत्तर पक्ष, आनन्द आत्मा, ब्रह्म पुच्छ-रूप प्रतिष्ठा। इस विषय में यह श्लोक है —',
        '"Understanding performs the sacrifice; it performs the rites too. All the gods worship understanding as Brahman, the eldest. If one knows understanding as Brahman and does not swerve from it, one leaves behind sins in the body and attains all desires." This (understanding-self) is the embodied self of the former. Other than this self made of understanding, within it, is the self made of bliss; by it this one is filled. It too has the form of a person; after the person-form of the former is the person-form of this. Its head is joy, its right side delight, its left side great delight, its trunk bliss, its foundation Brahman. On this there is the verse:'
      ),
      M(
        [
          'असन्नेव स भवति। असद्ब्रह्मेति वेद चेत्। अस्ति ब्रह्मेति चेद्वेद। सन्तमेनं ततो विदुरिति। तस्यैष एव शारीर आत्मा। यः पूर्वस्य।',
          'अथातोऽनुप्रश्नाः। उताविद्वानमुं लोकं प्रेत्य। कश्चन गच्छति। आहो विद्वानमुं लोकं प्रेत्य। कश्चित्समश्नुत उ।',
          'सोऽकामयत। बहु स्यां प्रजायेयेति। स तपोऽतप्यत। स तपस्तप्त्वा। इदं सर्वमसृजत। यदिदं किञ्च। तत्सृष्ट्वा। तदेवानुप्राविशत्।',
          'तदनुप्रविश्य। सच्च त्यच्चाभवत्। निरुक्तं चानिरुक्तं च। निलयनं चानिलयनं च। विज्ञानं चाविज्ञानं च। सत्यं चानृतं च सत्यमभवत्। यदिदं किञ्च। तत्सत्यमित्याचक्षते। तदप्येष श्लोको भवति॥',
        ],
        '"यदि कोई जानता है कि ब्रह्म असत् है, तो वह स्वयं असत् हो जाता है। यदि जानता है कि ब्रह्म है, तो उससे (ज्ञानी) उसे सत् जानते हैं।" यह (आनन्दमय) ही पूर्व (विज्ञानमय) का शरीरस्थ आत्मा है। अब इसके अनुप्रश्न — क्या अविद्वान् इस लोक से जाकर उस लोक (ब्रह्म) को प्राप्त होता है? अथवा क्या विद्वान् इस लोक से जाकर उस लोक को प्राप्त होता है? उस (ब्रह्म) ने कामना की — "मैं बहुत होऊँ, उत्पन्न होऊँ।" उसने तप (विचार) किया; तप करके यह सब रचा, जो कुछ यह है। उसे रचकर उसी में अनुप्रविष्ट हुआ। अनुप्रविष्ट होकर वह सत् (मूर्त) और त्यत् (अमूर्त) हुआ; निरुक्त और अनिरुक्त, आश्रय और अनाश्रय, विज्ञान (चेतन) और अविज्ञान (जड़), सत्य और अनृत — सब सत्य (ब्रह्म) ही हुआ। जो कुछ यह है, उसे "सत्य" कहते हैं। इस विषय में यह श्लोक है —',
        '"If one knows Brahman as non-existent, one becomes non-existent oneself. If one knows that Brahman is, then the wise know him as existent." This (bliss-self) is the embodied self of the former. Now the further questions: Does anyone who does not know, on departing this world, reach that world? Or does one who knows, on departing, attain it? He desired: "May I be many; may I be born." He performed austerity; having done so, he created all this, whatever there is. Having created it, he entered into it. Having entered, he became the formed and the formless, the defined and the undefined, the supported and the unsupported, the conscious and the unconscious, the real and the unreal — he became the Real. Whatever there is, they call the Real. On this there is the verse:'
      ),
      M(
        [
          'असद्वा इदमग्र आसीत्। ततो वै सदजायत। तदात्मानं स्वयमकुरुत। तस्मात्तत्सुकृतमुच्यत इति।',
          'यद्वै तत् सुकृतम्। रसो वै सः। रसं ह्येवायं लब्ध्वाऽऽनन्दी भवति। को ह्येवान्यात्कः प्राण्यात्। यदेष आकाश आनन्दो न स्यात्। एष ह्येवाऽऽनन्दयाति।',
          'यदा ह्येवैष एतस्मिन्नदृश्येऽनात्म्येऽनिरुक्तेऽनिलयनेऽभयं प्रतिष्ठां विन्दते। अथ सोऽभयं गतो भवति। यदा ह्येवैष एतस्मिन्नुदरमन्तरं कुरुते। अथ तस्य भयं भवति। तत्त्वेव भयं विदुषोऽमन्वानस्य। तदप्येष श्लोको भवति॥',
        ],
        '"पहले यह असत् (अव्यक्त) ही था; उससे सत् (व्यक्त) उत्पन्न हुआ। उसने अपने को स्वयं बनाया; इसलिए वह सुकृत (स्वयंकृत) कहलाता है।" जो वह सुकृत है, वह रस ही है। रस को ही पाकर यह (जीव) आनन्दित होता है। यदि यह आकाश-स्वरूप आनन्द न होता, तो कौन जीता, कौन साँस लेता? यही (सबको) आनन्दित करता है। जब यह (साधक) इस अदृश्य, अशरीर, अनिरुक्त, अनाश्रय (ब्रह्म) में अभय प्रतिष्ठा पा लेता है, तब वह अभय को प्राप्त हो जाता है। किन्तु जब इसमें थोड़ा भी अन्तर (भेद) करता है, तब उसे भय होता है। वही भय (अपने को) विद्वान् मानने वाले अविचारी का है। इस विषय में यह श्लोक है —',
        '"In the beginning this was the unmanifest; from it the manifest was born. It made itself by itself; therefore it is called the well-made." That which is the well-made is indeed the essence. Obtaining that essence, one becomes blissful. Who could live, who could breathe, if this bliss were not in the space (of the heart)? It is this that gives bliss. When one finds fearless footing in this invisible, bodiless, undefined, unsupported Brahman, one attains fearlessness. But when one makes even a slight difference in it, one comes to fear. That indeed is the fear of one who thinks himself wise but does not reflect. On this there is the verse:'
      ),
      M(
        [
          'भीषाऽस्माद्वातः पवते। भीषोदेति सूर्यः। भीषाऽस्मादग्निश्चेन्द्रश्च। मृत्युर्धावति पञ्चम इति।',
          'सैषाऽऽनन्दस्य मीमांसा भवति। युवा स्यात्साधुयुवाऽध्यायकः। आशिष्ठो द्रढिष्ठो बलिष्ठः। तस्येयं पृथिवी सर्वा वित्तस्य पूर्णा स्यात्। स एको मानुष आनन्दः।',
          'ते ये शतं मानुषा आनन्दाः। स एको मनुष्यगन्धर्वाणामानन्दः। श्रोत्रियस्य चाकामहतस्य। ते ये शतं मनुष्यगन्धर्वाणामानन्दाः। स एको देवगन्धर्वाणामानन्दः। श्रोत्रियस्य चाकामहतस्य।',
          'ते ये शतं देवगन्धर्वाणामानन्दाः। स एकः पितृणां चिरलोकलोकानामानन्दः। श्रोत्रियस्य चाकामहतस्य। ते ये शतं पितृणां चिरलोकलोकानामानन्दाः। स एक आजानजानां देवानामानन्दः। श्रोत्रियस्य चाकामहतस्य।',
          'ते ये शतमाजानजानां देवानामानन्दाः। स एकः कर्मदेवानां देवानामानन्दः। ये कर्मणा देवानपियन्ति। श्रोत्रियस्य चाकामहतस्य। ते ये शतं कर्मदेवानां देवानामानन्दाः। स एको देवानामानन्दः। श्रोत्रियस्य चाकामहतस्य।',
          'ते ये शतं देवानामानन्दाः। स एक इन्द्रस्याऽऽनन्दः। श्रोत्रियस्य चाकामहतस्य। ते ये शतमिन्द्रस्याऽऽनन्दाः। स एको बृहस्पतेरानन्दः। श्रोत्रियस्य चाकामहतस्य। ते ये शतं बृहस्पतेरानन्दाः। स एकः प्रजापतेरानन्दः। श्रोत्रियस्य चाकामहतस्य। ते ये शतं प्रजापतेरानन्दाः। स एको ब्रह्मण आनन्दः। श्रोत्रियस्य चाकामहतस्य।',
          'स यश्चायं पुरुषे। यश्चासावादित्ये। स एकः। स य एवंवित्। अस्माल्लोकात्प्रेत्य। एतमन्नमयमात्मानमुपसङ्क्रामति। एतं प्राणमयमात्मानमुपसङ्क्रामति। एतं मनोमयमात्मानमुपसङ्क्रामति। एतं विज्ञानमयमात्मानमुपसङ्क्रामति। एतमानन्दमयमात्मानमुपसङ्क्रामति। तदप्येष श्लोको भवति॥',
        ],
        '"इसके भय से वायु बहता है, भय से सूर्य उदय होता है; इसके भय से अग्नि और इन्द्र, और पाँचवाँ मृत्यु दौड़ता है।" अब आनन्द की यह मीमांसा है — कोई युवा हो, साधु, वेदपाठी, अत्यन्त आशावान्, दृढ़ और बलवान्; और धन से भरी यह सारी पृथ्वी उसकी हो — यह एक मानुष आनन्द है। ऐसे सौ मानुष आनन्द मनुष्य-गन्धर्वों का एक आनन्द है — और उस श्रोत्रिय (वेदज्ञ) का भी जो कामनाओं से अनाहत है। सौ मनुष्य-गन्धर्व आनन्द देव-गन्धर्वों का एक आनन्द है — और कामना-रहित श्रोत्रिय का। सौ देव-गन्धर्व आनन्द चिरलोक-वासी पितरों का एक आनन्द है — और कामना-रहित श्रोत्रिय का। सौ पितृ-आनन्द आजानज (जन्म से) देवों का एक आनन्द है — और कामना-रहित श्रोत्रिय का। सौ आजानज-देव आनन्द कर्मदेवों का एक आनन्द है, जो कर्म से देवत्व पाते हैं — और कामना-रहित श्रोत्रिय का। सौ कर्मदेव आनन्द देवों का एक आनन्द है — और कामना-रहित श्रोत्रिय का। सौ देव-आनन्द इन्द्र का एक आनन्द है — और कामना-रहित श्रोत्रिय का। सौ इन्द्र-आनन्द बृहस्पति का एक आनन्द है — और कामना-रहित श्रोत्रिय का। सौ बृहस्पति-आनन्द प्रजापति का एक आनन्द है — और कामना-रहित श्रोत्रिय का। सौ प्रजापति-आनन्द ब्रह्मा का एक आनन्द है — और कामना-रहित श्रोत्रिय का। जो यह पुरुष में है और जो वह सूर्य में है — वह एक है। जो इस प्रकार जानता है, वह इस लोक से जाकर इस अन्नमय आत्मा को प्राप्त होता है, इस प्राणमय आत्मा को, इस मनोमय आत्मा को, इस विज्ञानमय आत्मा को, इस आनन्दमय आत्मा को प्राप्त होता है (और उन सबको पार करता है)। इस विषय में यह श्लोक है —',
        '"From fear of Him the wind blows; from fear the sun rises; from fear of Him fire and Indra, and death the fifth, run." Now this is the reckoning of bliss. Suppose a youth, a good youth, learned in the Veda, most hopeful, most firm, most strong, and the whole earth full of wealth were his — that is one measure of human bliss. A hundred such human blisses are one bliss of the human gandharvas — and of a knower of the Veda untouched by desire. A hundred blisses of the human gandharvas are one bliss of the divine gandharvas — and of the desireless knower. A hundred blisses of the divine gandharvas are one bliss of the fathers in their long-enduring world — and of the desireless knower. A hundred blisses of the fathers are one bliss of the gods born so by nature — and of the desireless knower. A hundred such are one bliss of the gods who became gods by their deeds — and of the desireless knower. A hundred such are one bliss of the gods — and of the desireless knower. A hundred blisses of the gods are one bliss of Indra — and of the desireless knower. A hundred blisses of Indra are one bliss of Bṛhaspati — and of the desireless knower. A hundred blisses of Bṛhaspati are one bliss of Prajāpati — and of the desireless knower. A hundred blisses of Prajāpati are one bliss of Brahmā — and of the desireless knower. He who is here in the person and he who is there in the sun — he is one. One who knows thus, departing this world, passes on to this self made of food, to this self made of breath, to this self made of mind, to this self made of understanding, to this self made of bliss. On this there is the verse:'
      ),
      M(
        [
          'यतो वाचो निवर्तन्ते। अप्राप्य मनसा सह। आनन्दं ब्रह्मणो विद्वान्। न बिभेति कुतश्चनेति।',
          'एतं ह वाव न तपति। किमहं साधु नाकरवम्। किमहं पापमकरवमिति। स य एवं विद्वानेते आत्मानं स्पृणुते। उभे ह्येवैष एते आत्मानं स्पृणुते। य एवं वेद। इत्युपनिषत्॥',
        ],
        '"जहाँ से वाणी मन के साथ (उसे) न पाकर लौट आती है — ब्रह्म के उस आनन्द को जानने वाला किसी से भय नहीं करता।" उसे ये (विचार) नहीं तपाते — "मैंने अच्छा काम क्यों नहीं किया? मैंने पाप क्यों किया?" जो इस प्रकार जानता है, वह इन दोनों (पुण्य-पाप) से अपने को छुड़ा लेता है; वह इन दोनों को आत्म-रूप में देखकर (उनसे) मुक्त होता है। जो इस प्रकार जानता है — यह उपनिषद् है।',
        '"From which words turn back, together with the mind, unable to reach it — one who knows that bliss of Brahman fears nothing from anywhere." Such thoughts do not torment him: "Why did I not do good? Why did I do evil?" One who knows thus frees himself from both of these; for he sees both as the Self and is released from them. One who knows thus — this is the secret teaching.'
      ),
    ],
    // ── Bhṛgu Vallī ────────────────────────────────────────────────────────
    [
      M(
        [
          'भृगुर्वै वारुणिः। वरुणं पितरमुपससार। अधीहि भगवो ब्रह्मेति। तस्मा एतत्प्रोवाच। अन्नं प्राणं चक्षुः श्रोत्रं मनो वाचमिति।',
          'तं होवाच। यतो वा इमानि भूतानि जायन्ते। येन जातानि जीवन्ति। यत्प्रयन्त्यभिसंविशन्ति। तद्विजिज्ञासस्व। तद्ब्रह्मेति। स तपोऽतप्यत। स तपस्तप्त्वा॥',
        ],
        'वरुण के पुत्र भृगु अपने पिता वरुण के पास गये — "भगवन्! मुझे ब्रह्म पढ़ाइये।" उन्हें (वरुण ने) यह कहा — "अन्न, प्राण, नेत्र, श्रोत्र, मन और वाणी (ब्रह्म के द्वार हैं)।" फिर कहा — "जिससे ये भूत उत्पन्न होते हैं, जिससे उत्पन्न होकर जीवित रहते हैं, जिसमें जाते हुए प्रवेश करते हैं — उसे जानने की इच्छा करो; वह ब्रह्म है।" भृगु ने तप किया; तप करके —',
        'Bhṛgu, son of Varuṇa, approached his father Varuṇa: "Sir, teach me Brahman." He told him this: "Food, breath, eye, ear, mind, speech (are the doors to Brahman)." And he said: "That from which these beings are born, by which, once born, they live, into which they enter when they depart — seek to know that; that is Brahman." He performed austerity; having done so —'
      ),
      M(
        [
          'अन्नं ब्रह्मेति व्यजानात्। अन्नाद्ध्येव खल्विमानि भूतानि जायन्ते। अन्नेन जातानि जीवन्ति। अन्नं प्रयन्त्यभिसंविशन्तीति।',
          'तद्विज्ञाय। पुनरेव वरुणं पितरमुपससार। अधीहि भगवो ब्रह्मेति। तं होवाच। तपसा ब्रह्म विजिज्ञासस्व। तपो ब्रह्मेति। स तपोऽतप्यत। स तपस्तप्त्वा॥',
        ],
        '— उन्होंने जाना कि अन्न ब्रह्म है; क्योंकि अन्न से ही ये भूत उत्पन्न होते हैं, अन्न से जीवित रहते हैं और जाते हुए अन्न में प्रवेश करते हैं। यह जानकर वे फिर पिता वरुण के पास गये — "भगवन्! मुझे ब्रह्म पढ़ाइये।" उन्होंने कहा — "तप से ब्रह्म को जानने की इच्छा करो; तप ही ब्रह्म (का साधन) है।" भृगु ने तप किया; तप करके —',
        '— he understood that food is Brahman; for from food indeed these beings are born, by food they live, into food they enter when they depart. Having understood this, he again approached his father Varuṇa: "Sir, teach me Brahman." He said: "Seek to know Brahman through austerity; austerity is Brahman." He performed austerity; having done so —'
      ),
      M(
        [
          'प्राणो ब्रह्मेति व्यजानात्। प्राणाद्ध्येव खल्विमानि भूतानि जायन्ते। प्राणेन जातानि जीवन्ति। प्राणं प्रयन्त्यभिसंविशन्तीति।',
          'तद्विज्ञाय। पुनरेव वरुणं पितरमुपससार। अधीहि भगवो ब्रह्मेति। तं होवाच। तपसा ब्रह्म विजिज्ञासस्व। तपो ब्रह्मेति। स तपोऽतप्यत। स तपस्तप्त्वा॥',
        ],
        '— उन्होंने जाना कि प्राण ब्रह्म है; क्योंकि प्राण से ही ये भूत उत्पन्न होते हैं, प्राण से जीवित रहते हैं और जाते हुए प्राण में प्रवेश करते हैं। यह जानकर वे फिर पिता वरुण के पास गये — "भगवन्! मुझे ब्रह्म पढ़ाइये।" उन्होंने कहा — "तप से ब्रह्म को जानने की इच्छा करो; तप ही ब्रह्म है।" भृगु ने तप किया; तप करके —',
        '— he understood that breath is Brahman; for from breath indeed these beings are born, by breath they live, into breath they enter when they depart. Having understood this, he again approached his father Varuṇa: "Sir, teach me Brahman." He said: "Seek to know Brahman through austerity; austerity is Brahman." He performed austerity; having done so —'
      ),
      M(
        [
          'मनो ब्रह्मेति व्यजानात्। मनसो ह्येव खल्विमानि भूतानि जायन्ते। मनसा जातानि जीवन्ति। मनः प्रयन्त्यभिसंविशन्तीति।',
          'तद्विज्ञाय। पुनरेव वरुणं पितरमुपससार। अधीहि भगवो ब्रह्मेति। तं होवाच। तपसा ब्रह्म विजिज्ञासस्व। तपो ब्रह्मेति। स तपोऽतप्यत। स तपस्तप्त्वा॥',
        ],
        '— उन्होंने जाना कि मन ब्रह्म है; क्योंकि मन से ही ये भूत उत्पन्न होते हैं, मन से जीवित रहते हैं और जाते हुए मन में प्रवेश करते हैं। यह जानकर वे फिर पिता वरुण के पास गये — "भगवन्! मुझे ब्रह्म पढ़ाइये।" उन्होंने कहा — "तप से ब्रह्म को जानने की इच्छा करो; तप ही ब्रह्म है।" भृगु ने तप किया; तप करके —',
        '— he understood that mind is Brahman; for from mind indeed these beings are born, by mind they live, into mind they enter when they depart. Having understood this, he again approached his father Varuṇa: "Sir, teach me Brahman." He said: "Seek to know Brahman through austerity; austerity is Brahman." He performed austerity; having done so —'
      ),
      M(
        [
          'विज्ञानं ब्रह्मेति व्यजानात्। विज्ञानाद्ध्येव खल्विमानि भूतानि जायन्ते। विज्ञानेन जातानि जीवन्ति। विज्ञानं प्रयन्त्यभिसंविशन्तीति।',
          'तद्विज्ञाय। पुनरेव वरुणं पितरमुपससार। अधीहि भगवो ब्रह्मेति। तं होवाच। तपसा ब्रह्म विजिज्ञासस्व। तपो ब्रह्मेति। स तपोऽतप्यत। स तपस्तप्त्वा॥',
        ],
        '— उन्होंने जाना कि विज्ञान ब्रह्म है; क्योंकि विज्ञान से ही ये भूत उत्पन्न होते हैं, विज्ञान से जीवित रहते हैं और जाते हुए विज्ञान में प्रवेश करते हैं। यह जानकर वे फिर पिता वरुण के पास गये — "भगवन्! मुझे ब्रह्म पढ़ाइये।" उन्होंने कहा — "तप से ब्रह्म को जानने की इच्छा करो; तप ही ब्रह्म है।" भृगु ने तप किया; तप करके —',
        '— he understood that understanding is Brahman; for from understanding indeed these beings are born, by understanding they live, into understanding they enter when they depart. Having understood this, he again approached his father Varuṇa: "Sir, teach me Brahman." He said: "Seek to know Brahman through austerity; austerity is Brahman." He performed austerity; having done so —'
      ),
      M(
        [
          'आनन्दो ब्रह्मेति व्यजानात्। आनन्दाद्ध्येव खल्विमानि भूतानि जायन्ते। आनन्देन जातानि जीवन्ति। आनन्दं प्रयन्त्यभिसंविशन्तीति।',
          'सैषा भार्गवी वारुणी विद्या। परमे व्योमन्प्रतिष्ठिता। स य एवं वेद प्रतितिष्ठति। अन्नवानन्नादो भवति। महान्भवति प्रजया पशुभिर्ब्रह्मवर्चसेन। महान् कीर्त्या॥',
        ],
        '— उन्होंने जाना कि आनन्द ब्रह्म है; क्योंकि आनन्द से ही ये भूत उत्पन्न होते हैं, आनन्द से जीवित रहते हैं और जाते हुए आनन्द में प्रवेश करते हैं। यह भृगु द्वारा प्राप्त, वरुण द्वारा दी गई विद्या है, जो परम आकाश (हृदय) में प्रतिष्ठित है। जो इस प्रकार जानता है, वह प्रतिष्ठित होता है; अन्नवान् और अन्न का भोक्ता होता है; सन्तान, पशु और ब्रह्मतेज से महान् होता है; कीर्ति से महान् होता है।',
        '— he understood that bliss is Brahman; for from bliss indeed these beings are born, by bliss they live, into bliss they enter when they depart. This is the knowledge of Bhṛgu taught by Varuṇa, established in the supreme space of the heart. One who knows thus becomes established; he becomes possessed of food and an eater of food; he becomes great in offspring, cattle and spiritual radiance; great in fame.'
      ),
      M(
        [
          'अन्नं न निन्द्यात्। तद्व्रतम्। प्राणो वा अन्नम्। शरीरमन्नादम्। प्राणे शरीरं प्रतिष्ठितम्। शरीरे प्राणः प्रतिष्ठितः। तदेतदन्नमन्ने प्रतिष्ठितम्।',
          'स य एतदन्नमन्ने प्रतिष्ठितं वेद प्रतितिष्ठति। अन्नवानन्नादो भवति। महान्भवति प्रजया पशुभिर्ब्रह्मवर्चसेन। महान् कीर्त्या॥',
        ],
        'अन्न की निन्दा न करे — यह व्रत है। प्राण ही अन्न है, शरीर अन्न का भोक्ता है। प्राण में शरीर प्रतिष्ठित है और शरीर में प्राण प्रतिष्ठित है; इस प्रकार यह अन्न अन्न में प्रतिष्ठित है। जो इस अन्न को अन्न में प्रतिष्ठित जानता है, वह प्रतिष्ठित होता है; अन्नवान् और अन्न का भोक्ता होता है; सन्तान, पशु और ब्रह्मतेज से महान् होता है; कीर्ति से महान् होता है।',
        'One should not speak ill of food — that is the vow. Breath is food; the body is the eater of food. The body rests on breath, and breath rests on the body; thus food rests on food. One who knows this food as resting on food becomes established; he becomes possessed of food and an eater of food; he becomes great in offspring, cattle and spiritual radiance; great in fame.'
      ),
      M(
        [
          'अन्नं न परिचक्षीत। तद्व्रतम्। आपो वा अन्नम्। ज्योतिरन्नादम्। अप्सु ज्योतिः प्रतिष्ठितम्। ज्योतिष्यापः प्रतिष्ठिताः। तदेतदन्नमन्ने प्रतिष्ठितम्।',
          'स य एतदन्नमन्ने प्रतिष्ठितं वेद प्रतितिष्ठति। अन्नवानन्नादो भवति। महान्भवति प्रजया पशुभिर्ब्रह्मवर्चसेन। महान् कीर्त्या॥',
        ],
        'अन्न का तिरस्कार न करे — यह व्रत है। जल ही अन्न है, ज्योति (अग्नि) अन्न का भोक्ता है। जल में ज्योति प्रतिष्ठित है और ज्योति में जल प्रतिष्ठित है; इस प्रकार यह अन्न अन्न में प्रतिष्ठित है। जो इस अन्न को अन्न में प्रतिष्ठित जानता है, वह प्रतिष्ठित होता है; अन्नवान् और अन्न का भोक्ता होता है; सन्तान, पशु और ब्रह्मतेज से महान् होता है; कीर्ति से महान् होता है।',
        'One should not reject food — that is the vow. Water is food; light is the eater of food. Light rests on water, and water rests on light; thus food rests on food. One who knows this food as resting on food becomes established; he becomes possessed of food and an eater of food; he becomes great in offspring, cattle and spiritual radiance; great in fame.'
      ),
      M(
        [
          'अन्नं बहु कुर्वीत। तद्व्रतम्। पृथिवी वा अन्नम्। आकाशोऽन्नादः। पृथिव्यामाकाशः प्रतिष्ठितः। आकाशे पृथिवी प्रतिष्ठिता। तदेतदन्नमन्ने प्रतिष्ठितम्।',
          'स य एतदन्नमन्ने प्रतिष्ठितं वेद प्रतितिष्ठति। अन्नवानन्नादो भवति। महान्भवति प्रजया पशुभिर्ब्रह्मवर्चसेन। महान् कीर्त्या॥',
        ],
        'अन्न को बहुत बढ़ाये — यह व्रत है। पृथ्वी ही अन्न है, आकाश अन्न का भोक्ता है। पृथ्वी में आकाश प्रतिष्ठित है और आकाश में पृथ्वी प्रतिष्ठित है; इस प्रकार यह अन्न अन्न में प्रतिष्ठित है। जो इस अन्न को अन्न में प्रतिष्ठित जानता है, वह प्रतिष्ठित होता है; अन्नवान् और अन्न का भोक्ता होता है; सन्तान, पशु और ब्रह्मतेज से महान् होता है; कीर्ति से महान् होता है।',
        'One should make food plentiful — that is the vow. Earth is food; space is the eater of food. Space rests on earth, and earth rests on space; thus food rests on food. One who knows this food as resting on food becomes established; he becomes possessed of food and an eater of food; he becomes great in offspring, cattle and spiritual radiance; great in fame.'
      ),
      M(
        [
          'न कञ्चन वसतौ प्रत्याचक्षीत। तद्व्रतम्। तस्माद्यया कया च विधया बह्वन्नं प्राप्नुयात्। अराध्यस्मै अन्नमित्याचक्षते।',
          'एतद्वै मुखतोऽन्नं राद्धम्। मुखतोऽस्मा अन्नं राध्यते। एतद्वै मध्यतोऽन्नं राद्धम्। मध्यतोऽस्मा अन्नं राध्यते। एतद्वा अन्ततोऽन्नं राद्धम्। अन्ततोऽस्मा अन्नं राध्यते। य एवं वेद।',
          'क्षेम इति वाचि। योगक्षेम इति प्राणापानयोः। कर्मेति हस्तयोः। गतिरिति पादयोः। विमुक्तिरिति पायौ। इति मानुषीः समाज्ञाः।',
          'अथ दैवीः। तृप्तिरिति वृष्टौ। बलमिति विद्युति। यश इति पशुषु। ज्योतिरिति नक्षत्रेषु। प्रजातिरमृतमानन्द इत्युपस्थे। सर्वमित्याकाशे।',
          'तत्प्रतिष्ठेत्युपासीत। प्रतिष्ठावान् भवति। तन्मह इत्युपासीत। महान्भवति। तन्मन इत्युपासीत। मानवान्भवति। तन्नम इत्युपासीत। नम्यन्तेऽस्मै कामाः। तद्ब्रह्मेत्युपासीत। ब्रह्मवान्भवति। तद्ब्रह्मणः परिमर इत्युपासीत। पर्येणं म्रियन्ते द्विषन्तः सपत्नाः। परि येऽप्रिया भ्रातृव्याः।',
          'स यश्चायं पुरुषे। यश्चासावादित्ये। स एकः। स य एवंवित्। अस्माल्लोकात्प्रेत्य। एतमन्नमयमात्मानमुपसङ्क्रम्य। एतं प्राणमयमात्मानमुपसङ्क्रम्य। एतं मनोमयमात्मानमुपसङ्क्रम्य। एतं विज्ञानमयमात्मानमुपसङ्क्रम्य। एतमानन्दमयमात्मानमुपसङ्क्रम्य। इमांल्लोकान्कामान्नी कामरूप्यनुसञ्चरन्। एतत् साम गायन्नास्ते।',
          'हावु हावु हावु। अहमन्नमहमन्नमहमन्नम्। अहमन्नादोऽहमन्नादोऽहमन्नादः। अहं श्लोककृदहं श्लोककृदहं श्लोककृत्। अहमस्मि प्रथमजा ऋतस्य। पूर्वं देवेभ्योऽमृतस्य नाभायि। यो मा ददाति स इदेव मावाः। अहमन्नमन्नमदन्तमाद्मि। अहं विश्वं भुवनमभ्यभवाम्। सुवर्न ज्योतीः। य एवं वेद। इत्युपनिषत्॥',
        ],
        'अपने घर में (आश्रय चाहने वाले) किसी को भी मना न करे — यह व्रत है। इसलिए जिस किसी उपाय से बहुत अन्न प्राप्त करे। (अतिथि के लिए) कहते हैं — "इसके लिए अन्न तैयार है।" जो यह अन्न (अतिथि को) आरम्भ में (आदर से) दिया जाता है, उसे आरम्भ में अन्न मिलता है; जो मध्य में दिया जाता है, उसे मध्य में मिलता है; जो अन्त में दिया जाता है, उसे अन्त में मिलता है — जो इस प्रकार जानता है। (ब्रह्म की उपासना) वाणी में क्षेम-रूप से, प्राण-अपान में योगक्षेम-रूप से, हाथों में कर्म-रूप से, पैरों में गति-रूप से, गुदा में विसर्जन-रूप से — ये मानवी (शरीर-सम्बन्धी) उपासनाएँ हैं। अब दैवी — वृष्टि में तृप्ति-रूप से, विद्युत् में बल-रूप से, पशुओं में यश-रूप से, नक्षत्रों में ज्योति-रूप से, उपस्थ में प्रजनन, अमृत और आनन्द-रूप से, आकाश में सर्व-रूप से। उसे "प्रतिष्ठा" रूप से उपासे — प्रतिष्ठावान् होता है। "महः" रूप से उपासे — महान् होता है। "मन" रूप से उपासे — मननशील होता है। "नमः" रूप से उपासे — कामनाएँ उसके सामने नत होती हैं। "ब्रह्म" रूप से उपासे — ब्रह्मवान् होता है। "ब्रह्म का परिमर (जिसमें सब मरते हैं)" रूप से उपासे — उसके द्वेषी शत्रु और अप्रिय प्रतिद्वन्द्वी उसके चारों ओर मर जाते हैं। जो यह पुरुष में है और जो वह सूर्य में है — वह एक है। जो इस प्रकार जानता है, वह इस लोक से जाकर अन्नमय, प्राणमय, मनोमय, विज्ञानमय और आनन्दमय आत्मा को पार करके, इच्छानुसार अन्न और रूप वाला होकर इन लोकों में विचरता हुआ, यह साम गाता रहता है — "हावु! हावु! हावु! मैं अन्न हूँ, मैं अन्न हूँ, मैं अन्न हूँ। मैं अन्न का भोक्ता हूँ, अन्न का भोक्ता हूँ, अन्न का भोक्ता हूँ। मैं श्लोककार (दोनों को जोड़ने वाला) हूँ, श्लोककार हूँ, श्लोककार हूँ। मैं ऋत (यज्ञ) का प्रथमजात हूँ, देवों से भी पहले, अमृत का केन्द्र। जो मुझे (अन्न) देता है, वही मुझे बचाता है। मैं अन्न हूँ; अन्न खाने वाले को मैं खाता हूँ। मैंने सारे विश्व को अभिभूत कर लिया है। मैं सूर्य-सा ज्योतिर्मय हूँ।" — जो इस प्रकार जानता है। यह उपनिषद् है।',
        'One should not turn anyone away from one\'s dwelling — that is the vow. Therefore one should gather plenty of food by whatever means. They say (to a guest), "Food is ready for him." Food given respectfully at the outset is repaid at the outset; food given midway is repaid midway; food given at the end is repaid at the end — for one who knows thus. (Meditate on Brahman) as security in speech, as acquisition and preservation in the in-breath and out-breath, as action in the hands, as movement in the feet, as evacuation in the organ of excretion — these are the human meditations. Now the divine: as satisfaction in rain, as strength in lightning, as fame in cattle, as light in the stars, as procreation, immortality and bliss in the organ of generation, as everything in space. Meditate on it as the support — one becomes supported. As greatness — one becomes great. As mind — one becomes thoughtful. As homage — desires bow before one. As Brahman — one becomes possessed of Brahman. As the dying-around of Brahman — one\'s hating enemies and unloved rivals die around one. He who is here in the person and he who is there in the sun — he is one. One who knows thus, departing this world, passes beyond the self made of food, of breath, of mind, of understanding and of bliss, and, wandering these worlds eating what he wishes and taking what form he wishes, sits singing this chant: "Hāvu! Hāvu! Hāvu! I am food, I am food, I am food. I am the eater of food, the eater of food, the eater of food. I am the maker of verse, the maker of verse, the maker of verse. I am the first-born of the Real, before the gods, the centre of immortality. Whoever gives me, he indeed preserves me. I, food, eat the eater of food. I have overcome the whole world. I am luminous like the sun." — for one who knows thus. This is the secret teaching.'
      ),
    ],
  ],
};

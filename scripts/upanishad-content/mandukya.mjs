/**
 * Authored content for one Upanishad — consumed by scripts/build-upanishad.mjs.
 * `muktika` is the text's fixed number in the Muktika canon (1–108) and is the
 * reader's `chapter` id forever; `slug` must match `registry.ts`.
 */
export default {
  slug: 'mandukya',
  muktika: 6,
  vedaHi: 'अथर्ववेद',
  vedaEn: 'Atharvaveda',
  source: {
    baseText:
      'Atharvaveda recension of the twelve mantras (without Gauḍapāda\'s kārikās) with Śāṅkara-bhāṣya, as printed in Gita Press "ईशादि नौ उपनिषद्"; Devanagari cross-checked against sanskritdocuments.org.',
    canonicalEdition: 'Gita Press Gorakhpur, ईशादि नौ उपनिषद् (शांकरभाष्यार्थ सहित), code 66',
    referenceUrls: [
      'https://sanskritdocuments.org/doc_upanishhat/mandukya.html',
      'https://www.wisdomlib.org/hinduism/book/mandukya-upanishad-gaudapa-karika-and-shankara-bhashya',
      'https://archive.org/details/IshadiNauUpanishadGitaPress',
      'https://sanskritdocuments.org/doc_upanishhat/',
    ],
    notes:
      '12 mantras plus the Atharvavedic śānti-pāṭha (भद्रं कर्णेभिः) as page 1. Gauḍapāda\'s kārikās are not part of the mūla text and are not included. Vedic anunāsika ligatures are written with the standard anusvāra.',
    retrievedOn: '2026-09-25',
  },
  shanti: {
    lines: [
      'ॐ भद्रं कर्णेभिः शृणुयाम देवाः भद्रं पश्येमाक्षभिर्यजत्राः।',
      'स्थिरैरङ्गैस्तुष्टुवांसस्तनूभिर्व्यशेम देवहितं यदायुः।',
      'स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः।',
      'स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु॥',
      'ॐ शान्तिः शान्तिः शान्तिः॥',
    ],
    meaningHi:
      'हे देवों! हम कानों से शुभ सुनें; हे यज्ञार्ह देवों! हम नेत्रों से शुभ देखें। स्थिर अंगों और शरीरों से आपकी स्तुति करते हुए हम देवों के हित की आयु प्राप्त करें। महान यशस्वी इन्द्र हमारा कल्याण करें; सर्वज्ञ पूषा हमारा कल्याण करें; अरिष्टनेमि तार्क्ष्य (गरुड़) हमारा कल्याण करें; बृहस्पति हमारा कल्याण करें। ॐ शान्तिः शान्तिः शान्तिः।',
    meaningEn:
      'O gods, may we hear what is auspicious with our ears; O you worthy of worship, may we see what is auspicious with our eyes. Praising you with steady limbs and bodies, may we live the full span the gods have allotted. May Indra of great renown bless us; may all-knowing Pūṣan bless us; may Tārkṣya (Garuḍa) of unhindered course bless us; may Bṛhaspati grant us well-being. Om, peace, peace, peace.',
  },
  mantras: [
    {
      lines: ['ॐ ओमित्येतदक्षरमिदं सर्वं तस्योपव्याख्यानं भूतं भवद्भविष्यदिति सर्वमोङ्कार एव।', 'यच्चान्यत्त्रिकालातीतं तदप्योङ्कार एव॥'],
      meaningHi:
        'ॐ — यह अक्षर ही यह सब कुछ है। इसकी स्पष्ट व्याख्या यह है — जो भूत, वर्तमान और भविष्य है, वह सब ओंकार ही है; और जो कुछ तीनों कालों से परे है, वह भी ओंकार ही है।',
      meaningEn:
        'Om — this syllable is all this. Its clear explanation: whatever is past, present and future is all Oṁkāra alone; and whatever else lies beyond the three times is Oṁkāra too.',
    },
    {
      lines: ['सर्वं ह्येतद्ब्रह्मायमात्मा ब्रह्म सोऽयमात्मा चतुष्पात्॥'],
      meaningHi: 'यह सब निश्चय ही ब्रह्म है। यह आत्मा ब्रह्म है। वह यह आत्मा चार पादों (अवस्थाओं) वाला है।',
      meaningEn: 'All this is indeed Brahman. This Self is Brahman. This same Self has four quarters (pādas).',
    },
    {
      lines: ['जागरितस्थानो बहिष्प्रज्ञः सप्ताङ्ग एकोनविंशतिमुखः स्थूलभुग्वैश्वानरः प्रथमः पादः॥'],
      meaningHi:
        'जागृत अवस्था में रहने वाला, बाहर की ओर प्रज्ञा वाला, सात अंगों और उन्नीस मुखों (पाँच ज्ञानेन्द्रियाँ, पाँच कर्मेन्द्रियाँ, पाँच प्राण, मन, बुद्धि, अहंकार, चित्त) वाला, स्थूल विषयों का भोग करने वाला वैश्वानर पहला पाद है।',
      meaningEn:
        'The first quarter is Vaiśvānara: its field is the waking state, its awareness turned outward, having seven limbs and nineteen mouths (the five senses, five organs of action, five vital airs, mind, intellect, ego and memory), the enjoyer of gross objects.',
    },
    {
      lines: ['स्वप्नस्थानोऽन्तःप्रज्ञः सप्ताङ्ग एकोनविंशतिमुखः प्रविविक्तभुक्तैजसो द्वितीयः पादः॥'],
      meaningHi:
        'स्वप्न अवस्था में रहने वाला, भीतर की ओर प्रज्ञा वाला, सात अंगों और उन्नीस मुखों वाला, सूक्ष्म (मानसिक) विषयों का भोग करने वाला तैजस दूसरा पाद है।',
      meaningEn:
        'The second quarter is Taijasa: its field is the dream state, its awareness turned inward, having seven limbs and nineteen mouths, the enjoyer of subtle (mental) objects.',
    },
    {
      lines: ['यत्र सुप्तो न कञ्चन कामं कामयते न कञ्चन स्वप्नं पश्यति तत्सुषुप्तम्।', 'सुषुप्तस्थान एकीभूतः प्रज्ञानघन एवानन्दमयो ह्यानन्दभुक् चेतोमुखः प्राज्ञस्तृतीयः पादः॥'],
      meaningHi:
        'जहाँ सोया हुआ पुरुष न किसी कामना की इच्छा करता है और न कोई स्वप्न देखता है, वह सुषुप्ति है। सुषुप्ति अवस्था में रहने वाला, एकीभूत, प्रज्ञान का घन (ठोस पिण्ड) मात्र, आनन्दमय, आनन्द का भोग करने वाला, चेतना (जागृत-स्वप्न) का द्वार प्राज्ञ तीसरा पाद है।',
      meaningEn:
        'Where the sleeper desires no desire and sees no dream — that is deep sleep. The third quarter is Prājña: its field is deep sleep, unified, a mass of pure awareness, full of bliss, the enjoyer of bliss, the doorway to the other two states of consciousness.',
    },
    {
      lines: ['एष सर्वेश्वर एष सर्वज्ञ एषोऽन्तर्याम्येष योनिः सर्वस्य प्रभवाप्ययौ हि भूतानाम्॥'],
      meaningHi:
        'यही सबका ईश्वर है, यही सर्वज्ञ है, यही अन्तर्यामी है, यही सबका उद्गम-स्थान है; क्योंकि यही समस्त प्राणियों की उत्पत्ति और लय (का स्थान) है।',
      meaningEn:
        'This is the Lord of all; this is the knower of all; this is the inner controller; this is the source of all — for this is the origin and the dissolution of all beings.',
    },
    {
      lines: ['नान्तःप्रज्ञं न बहिष्प्रज्ञं नोभयतःप्रज्ञं न प्रज्ञानघनं न प्रज्ञं नाप्रज्ञम्।', 'अदृष्टमव्यवहार्यमग्राह्यमलक्षणमचिन्त्यमव्यपदेश्यमेकात्मप्रत्ययसारं प्रपञ्चोपशमं शान्तं शिवमद्वैतं चतुर्थं मन्यन्ते स आत्मा स विज्ञेयः॥'],
      meaningHi:
        'जो न भीतर की ओर प्रज्ञा वाला है, न बाहर की ओर, न दोनों ओर; न प्रज्ञान-घन है, न प्रज्ञ है, न अप्रज्ञ; जो अदृष्ट, अव्यवहार्य, अग्राह्य, लक्षणरहित, अचिन्त्य, अनिर्देश्य है; जिसका सार एक आत्मा की प्रतीति है; जो प्रपंच का उपशम, शान्त, शिव और अद्वैत है — उसे ज्ञानी चौथा (तुरीय) मानते हैं। वही आत्मा है; वही जानने योग्य है।',
      meaningEn:
        'Not aware inwardly, not aware outwardly, not aware both ways; not a mass of awareness, not aware, not unaware; unseen, beyond dealing, ungraspable, without mark, unthinkable, indescribable; its essence the certainty of the one Self; the cessation of all phenomena, tranquil, auspicious, non-dual — this the wise consider the fourth (Turīya). That is the Self; that is to be known.',
    },
    {
      lines: ['सोऽयमात्माध्यक्षरमोङ्कारोऽधिमात्रं पादा मात्रा मात्राश्च पादा अकार उकारो मकार इति॥'],
      meaningHi:
        'वही यह आत्मा अक्षर-दृष्टि से ओंकार है। मात्राओं की दृष्टि से (आत्मा के) पाद ही मात्राएँ हैं और मात्राएँ ही पाद हैं — अकार, उकार और मकार।',
      meaningEn:
        'This same Self, regarded as the syllable, is Oṁkāra. Regarded by its measures, the quarters are the measures and the measures are the quarters — the letters a, u and m.',
    },
    {
      lines: ['जागरितस्थानो वैश्वानरोऽकारः प्रथमा मात्राऽऽप्तेरादिमत्त्वाद्वा।', 'आप्नोति ह वै सर्वान्कामानादिश्च भवति य एवं वेद॥'],
      meaningHi:
        'जागृत अवस्था वाला वैश्वानर पहली मात्रा अकार है — व्यापकता (आप्ति) के कारण अथवा आदि (प्रथम) होने के कारण। जो इसे इस प्रकार जानता है, वह समस्त कामनाओं को प्राप्त करता है और (सबमें) प्रथम होता है।',
      meaningEn:
        'Vaiśvānara, whose field is the waking state, is the first measure, a — because of pervasiveness (āpti) or because of being first (ādi). One who knows this obtains all desires and becomes first.',
    },
    {
      lines: ['स्वप्नस्थानस्तैजस उकारो द्वितीया मात्रोत्कर्षादुभयत्वाद्वा।', 'उत्कर्षति ह वै ज्ञानसन्ततिं समानश्च भवति नास्याब्रह्मवित्कुले भवति य एवं वेद॥'],
      meaningHi:
        'स्वप्न अवस्था वाला तैजस दूसरी मात्रा उकार है — उत्कर्ष (श्रेष्ठता) के कारण अथवा उभयत्व (दोनों के बीच होने) के कारण। जो इसे इस प्रकार जानता है, वह ज्ञान की परम्परा को बढ़ाता है, सबके प्रति समान होता है, और उसके कुल में कोई ब्रह्म को न जानने वाला नहीं होता।',
      meaningEn:
        'Taijasa, whose field is the dream state, is the second measure, u — because of superiority (utkarṣa) or because of being in between (ubhayatva). One who knows this exalts the stream of knowledge, becomes equal to all, and none ignorant of Brahman is born in his family.',
    },
    {
      lines: ['सुषुप्तस्थानः प्राज्ञो मकारस्तृतीया मात्रा मितेरपीतेर्वा।', 'मिनोति ह वा इदं सर्वमपीतिश्च भवति य एवं वेद॥'],
      meaningHi:
        'सुषुप्ति अवस्था वाला प्राज्ञ तीसरी मात्रा मकार है — माप (मिति) के कारण अथवा लय (अपीति) के कारण। जो इसे इस प्रकार जानता है, वह इस सबको माप लेता (यथार्थ जान लेता) है और (सबका) लय-स्थान हो जाता है।',
      meaningEn:
        'Prājña, whose field is deep sleep, is the third measure, m — because of measuring (miti) or because of absorption (apīti). One who knows this measures (knows the truth of) all this and becomes the place of its absorption.',
    },
    {
      lines: ['अमात्रश्चतुर्थोऽव्यवहार्यः प्रपञ्चोपशमः शिवोऽद्वैत एवमोङ्कार आत्मैव।', 'संविशत्यात्मनाऽऽत्मानं य एवं वेद॥'],
      meaningHi:
        'मात्रारहित चौथा (तुरीय) अव्यवहार्य, प्रपंच का उपशम, शिव और अद्वैत है। इस प्रकार ओंकार आत्मा ही है। जो इसे इस प्रकार जानता है, वह आत्मा से ही आत्मा में प्रवेश कर जाता है।',
      meaningEn:
        'The fourth is without measure — beyond dealing, the cessation of all phenomena, auspicious, non-dual. Thus Oṁkāra is the Self itself. One who knows this enters the Self by the Self.',
    },
  ],
};

import type { VidhiEntry } from './types';

const DRIK_SHIVA =
  'https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-puja-vidhi.html';

/** महाशिवरात्रि पूजन — household night worship with Shiva-linga abhisheka. */
export const mahaShivaratriPuja: VidhiEntry = {
  id: 'maha-shivaratri-puja',
  titleHi: 'महाशिवरात्रि पूजन',
  titleEn: 'Maha Shivaratri Pujan',
  festivalIds: ['maha-shivaratri'],
  deities: ['shiva'],
  conventionLineHi: 'संक्षिप्त गृह रात्रि-पूजन व अभिषेक',
  conventionLineEn: 'Concise household night worship and abhisheka',
  durationHintMin: 40,
  samagri: [
    { itemHi: 'शिवलिङ्ग या भगवान शिव का चित्र', itemEn: 'Shiva-linga or picture of Lord Shiva' },
    { itemHi: 'अभिषेक पात्र व थाली', itemEn: 'Abhisheka vessel & tray' },
    { itemHi: 'शुद्ध जल व गंगाजल', itemEn: 'Clean water & Gangajal' },
    { itemHi: 'दूध · दही · घी · शहद · शक्कर', itemEn: 'Milk · curd · ghee · honey · sugar' },
    { itemHi: 'बिल्वपत्र', itemEn: 'Bilva leaves' },
    { itemHi: 'सफेद पुष्प व माला', itemEn: 'White flowers & garland' },
    { itemHi: 'चन्दन व भस्म', itemEn: 'Chandan & sacred ash' },
    { itemHi: 'अक्षत', itemEn: 'Akshat' },
    { itemHi: 'धतूरा व आक पुष्प', itemEn: 'Datura & aak flowers', optional: true },
    { itemHi: 'वस्त्र या मौली', itemEn: 'Cloth or mauli', optional: true },
    { itemHi: 'धूप · दीप · घी · बाती · कपूर', itemEn: 'Dhoop · lamp · ghee · wick · camphor' },
    { itemHi: 'फल व व्रत का नैवेद्य', itemEn: 'Fruit & vrat naivedya' },
    { itemHi: 'पान · सुपारी · दक्षिणा', itemEn: 'Paan · betel nut · dakshina', optional: true },
    { itemHi: 'काला तिल', itemEn: 'Black sesame', optional: true },
  ],
  steps: [
    {
      id: 'vrat-taiyari', phase: 'prep', titleHi: 'व्रत व रात्रि-पूजा की तैयारी', titleEn: 'Prepare for the fast and night puja',
      instructionHi: 'अपने स्वास्थ्य के अनुरूप व्रत रखें, पूजा से पहले स्नान कर स्वच्छ वस्त्र पहनें और रात्रि-पूजा के लिए सामग्री एकत्र करें।',
      instructionEn: 'Observe the fast according to your health, bathe and wear clean clothes before puja, and gather the materials for night worship.',
    },
    {
      id: 'linga-sthapana', phase: 'prep', titleHi: 'शिवलिङ्ग स्थापना', titleEn: 'Place the Shiva-linga',
      instructionHi: 'शिवलिङ्ग को ऐसी थाली या अभिषेक पात्र में रखें जिससे अर्पित द्रव्य स्वच्छता से एकत्र हो सके; चित्र हो तो अभिषेक न करें।',
      instructionEn: 'Place the Shiva-linga in a tray that can collect the offerings cleanly; do not pour abhisheka liquids over a picture.',
    },
    {
      id: 'sankalp', phase: 'prep', titleHi: 'शिवरात्रि संकल्प', titleEn: 'Shivaratri sankalp',
      instructionHi: 'जल, अक्षत और पुष्प लेकर अपना नाम, गोत्र और तिथि बोलें तथा श्रद्धापूर्वक शिवरात्रि व्रत-पूजा का संकल्प लें।',
      instructionEn: 'Hold water, akshat and a flower; state your name, gotra and tithi, and resolve to perform the Shivaratri vrat-puja with devotion.',
    },
    {
      id: 'dhyana-avahana', phase: 'main', titleHi: 'ध्यान व आवाहन', titleEn: 'Dhyana & avahana',
      instructionHi: 'भगवान शिव का ध्यान करें, हाथ में पुष्प लेकर आवाहन करें और पुष्प शिवलिङ्ग या चित्र के समीप रखें।',
      instructionEn: 'Meditate on Lord Shiva, invoke Him while holding a flower, and place it beside the Shiva-linga or picture.',
    },
    {
      id: 'asana-padya-arghya', phase: 'main', titleHi: 'आसन, पाद्य व अर्घ्य', titleEn: 'Asana, padya & arghya',
      instructionHi: 'पुष्प से आसन और थोड़े जल से पाद्य, अर्घ्य तथा आचमन प्रतीक रूप में अर्पित करें।',
      instructionEn: 'Symbolically offer a seat with flowers and small amounts of water for padya, arghya and achamana.',
    },
    {
      id: 'jalabhisheka', phase: 'main', titleHi: 'जलाभिषेक', titleEn: 'Water abhisheka',
      instructionHi: 'शिवलिङ्ग पर शुद्ध जल या गंगाजल की पतली धारा चढ़ाएँ; जल व्यर्थ न बहाएँ।',
      instructionEn: 'Pour a gentle stream of clean water or Gangajal over the Shiva-linga without wasting water.',
    },
    {
      id: 'panchamrita', phase: 'main', titleHi: 'पञ्चामृत अभिषेक', titleEn: 'Panchamrit abhisheka',
      instructionHi: 'क्रम से दूध, दही, घी, शहद और शक्कर बहुत थोड़ी मात्रा में अर्पित करें। घर की रीति संक्षिप्त हो तो केवल जल और दूध पर्याप्त रखें।',
      instructionEn: 'Offer small quantities of milk, curd, ghee, honey and sugar in order. For a shorter family observance, use only water and milk.',
    },
    {
      id: 'shuddhodaka', phase: 'main', titleHi: 'शुद्धोदक स्नान', titleEn: 'Final clean-water bath',
      instructionHi: 'पञ्चामृत के बाद शुद्ध जल से शिवलिङ्ग को अच्छी तरह स्नान कराकर साफ करें।',
      instructionEn: 'After panchamrit, rinse and cleanse the Shiva-linga thoroughly with clean water.',
    },
    {
      id: 'gandha-bhasma', phase: 'main', titleHi: 'चन्दन व भस्म', titleEn: 'Chandan & sacred ash',
      instructionHi: 'चन्दन और भस्म अर्पित करें; शिवलिङ्ग पर कुमकुम या हल्दी लगाने के बजाय उन्हें पूजा-थाली तक सीमित रखें।',
      instructionEn: 'Offer chandan and sacred ash; keep kumkum and turmeric on the puja thali rather than applying them to the Shiva-linga.',
    },
    {
      id: 'bilva-pushpa', phase: 'main', titleHi: 'बिल्वपत्र व पुष्प', titleEn: 'Bilva leaves & flowers',
      instructionHi: 'स्वच्छ, अखण्ड बिल्वपत्र चिकनी ओर नीचे रखकर अर्पित करें, फिर सफेद पुष्प और उपलब्ध हो तो धतूरा या आक चढ़ाएँ।',
      instructionEn: 'Offer clean, unbroken bilva leaves with the smooth side down, followed by white flowers and, when available, datura or aak.',
    },
    {
      id: 'dhoop-deep', phase: 'main', titleHi: 'धूप व दीप', titleEn: 'Dhoop & dipa',
      instructionHi: 'धूप दिखाएँ और घी का दीपक घुमाकर प्रकाश अर्पित करें; दीप को बिल्वपत्र और वस्त्र से दूर रखें।',
      instructionEn: 'Present dhoop and circle the ghee lamp, keeping the flame away from bilva leaves and cloth.',
    },
    {
      id: 'naivedya', phase: 'main', titleHi: 'नैवेद्य', titleEn: 'Naivedya',
      instructionHi: 'फल, व्रत की मिठाई और जल अर्पित करें; सात्त्विक और बिना चखे नैवेद्य रखें।',
      instructionEn: 'Offer fruit, vrat sweets and water; keep the naivedya sattvic and untasted.',
    },
    {
      id: 'panchakshara-japa', phase: 'main', titleHi: 'पञ्चाक्षरी शिव-जप', titleEn: 'Panchakshara Shiva japa',
      instructionHi: 'शान्त होकर पञ्चाक्षरी शिव-मन्त्र का अपनी क्षमता अनुसार जप करें और मन को भगवान शिव में स्थिर रखें।',
      instructionEn: 'Sit quietly and repeat the Panchakshara Shiva mantra as many times as comfortable, keeping the mind on Lord Shiva.',
      // The five-syllable mula mantra the step names. The identical rendering
      // already ships verified in japam.json, shiv-chalisa.json and
      // shiva-strotam chapter 1 (§11.11 exempts a 1-line japa formula that has
      // no library *section* of its own to hand off to).
      mantra: {
        devanagari: 'ॐ नमः शिवाय',
        iast: 'oṁ namaḥ śivāya',
        sourceUrl: 'https://en.wikipedia.org/wiki/Om_Namah_Shivaya',
      },
    },
    {
      id: 'katha', phase: 'main', titleHi: 'महाशिवरात्रि व्रत कथा', titleEn: 'Maha Shivaratri vrat katha',
      instructionHi: 'परिवार सहित महाशिवरात्रि व्रत कथा पढ़ें या सुनें।',
      instructionEn: 'Read or listen to the Maha Shivaratri vrat katha with the family.',
      ref: { kind: 'katha', id: 'maha-shivaratri-vrat-katha' },
    },
    {
      id: 'aarti', phase: 'closing', titleHi: 'शिव आरती', titleEn: 'Shiva aarti',
      instructionHi: 'कपूर या घी के दीप से आरती करें और परिवार सहित ॐ जय शिव ओंकारा गाएँ।',
      instructionEn: 'Offer aarti with camphor or a ghee lamp and sing Om Jai Shiv Omkara with the family.',
      ref: { kind: 'section', id: 'om-jai-shiv-omkara' },
    },
    {
      id: 'kshama-jagaran', phase: 'closing', titleHi: 'क्षमा, जागरण व पारण', titleEn: 'Forgiveness, vigil & parana',
      instructionHi: 'पूजा की त्रुटियों के लिए क्षमा माँगें। इच्छा और स्वास्थ्य हो तो रात्रि-जागरण या चार प्रहर में जलाभिषेक करें; अगले दिन पञ्चाङ्ग के पारण समय में व्रत खोलें।',
      instructionEn: 'Ask forgiveness for any lapses. If health and circumstances allow, keep vigil or repeat water abhisheka in the four praharas; conclude the fast next day at the Panchang parana time.',
    },
  ],
  source: {
    canonicalEdition: 'Gita Press Nitya Karma Puja Prakash — Shiva Puja chapter',
    canonicalEditionUrls: ['https://archive.org/search?query=nitya+karma+puja+prakash+shiva+puja+gita+press'],
    canonicalEditionStatus: 'PENDING — the named Gita Press scan has not yet been checked character-by-character; the variable sankalpa and Puranic offering mantras are not published inline. Re-attempted 2026-08-14: archive.org egress is blocked from this authoring environment as well.',
    referenceUrls: [DRIK_SHIVA, 'https://hindunidhi.com/mahashivratri-vrat-katha-and-puja-vidhi/'],
    retrievedOn: '2026-08-13',
    notes: 'The selected DrikPanchang household Shivaratri procedure names the complete concise sequence: fasting and sankalpa, night worship, one or four praharas, abhisheka, bilva, gandha, dhoop-dipa, Panchakshara japa and next-day parana. HinduNidhi independently confirms fasting, night vigil, katha and Shiva worship. The entry adds the already-shipped katha and aarti at their natural points while omitting uncollated liturgical text. Instructions include material-specific handling and health/safety qualifications. 2026-08-14: the Panchakshara japa step now carries the five-syllable mula mantra inline — transcribed verbatim from the app’s own thrice-shipped verified rendering (japam.json, shiv-chalisa.json, shiva-strotam chapter 1) and re-confirmed against the cited public reference; longer Puranic offering mantras stay omitted pending the canonical scan.',
  },
};

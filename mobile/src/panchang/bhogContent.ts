/**
 * PRD-23 bhog / naivedya / vrat-food registry.
 *
 * This module is RN-free bundled data. `getBhogContent` and
 * `getBhogForVidhi` expose VERIFIED entries only: a draft remains invisible at
 * every call site. Food allowed during a fast, deity offerings, abhisheka
 * ingredients, and food that must not be offered are separate concepts here;
 * no surface is allowed to collapse them into one list.
 */
import type { BhogContentEntry } from './types';
import { EXTENDED_BHOG_CONTENT } from './bhogContentExtended';

const EKADASHI_RULE_IDS = [
  'kamada-ekadashi',
  'varuthini-ekadashi',
  'mohini-ekadashi',
  'apara-ekadashi',
  'yogini-ekadashi',
  'devshayani-ekadashi',
  'kamika-ekadashi',
  'putrada-ekadashi',
  'aja-ekadashi',
  'parivartini-ekadashi',
  'indira-ekadashi',
  'papankusha-ekadashi',
  'rama-ekadashi',
  'dev-uthani-ekadashi',
  'utpanna-ekadashi',
  'mokshada-ekadashi',
  'saphala-ekadashi',
  'shattila-ekadashi',
  'jaya-ekadashi',
  'vijaya-ekadashi',
  'amalaki-ekadashi',
  'papmochani-ekadashi',
  'mahadwadashi',
  'iskcon-ekadashi',
] as const;

const item = (id: string, textHi: string, textEn: string) => ({ id, textHi, textEn });
const grocery = (id: string, itemHi: string, itemEn: string, optional = false) => ({
  id,
  itemHi,
  itemEn,
  ...(optional ? { optional: true } : {}),
});

const DP_EKADASHI_FOOD =
  'https://www.drikpanchang.com/ekadashi/ekadashi-food/ekadashi-fasting-food.html?lang=hi';
const DP_EKADASHI_VIDHI =
  'https://www.drikpanchang.com/ekadashis/vidhi-vidhan/ekadashi-vrat-vidhi-vidhan.html';
const ISKCON_EKADASHI = 'https://www.iskconbangalore.org/blog/ekadashi/';

const ekadashiFood: BhogContentEntry = {
  id: 'ekadashi-food',
  titleHi: 'एकादशी का भोग और फलाहार',
  titleEn: 'Ekadashi offering and food',
  observanceIds: [...EKADASHI_RULE_IDS],
  vidhiIds: [],
  offerings: [
    item('fruit-offering', 'जो फलाहार लें, उसे पहले भगवान विष्णु को अर्पित करें।', 'Offer the fruit fare to Lord Vishnu before eating it.'),
  ],
  permittedDuringFast: [
    item('fruit-nuts', 'फल, मेवे और नारियल', 'Fruit, nuts, and coconut'),
    item('milk', 'दूध और परम्परा में मान्य दुग्ध पदार्थ', 'Milk and dairy accepted in your tradition'),
    item('staples', 'साबूदाना, सिंघाड़ा, आलू, शकरकन्द और मूँगफली', 'Sabudana, water chestnut, potato, sweet potato, and peanuts'),
  ],
  abstainedDuringFast: [
    item('grains-pulses', 'चावल, गेहूँ, अन्य अन्न, दालें और फलियाँ', 'Rice, wheat, other grains, lentils, and beans'),
    item('onion-garlic', 'प्याज, लहसुन और मांसाहार', 'Onion, garlic, and non-vegetarian food'),
  ],
  paranaMealHi:
    'द्वादशी के दिखाए गए पारण-काल में पहले भगवान को भोजन अर्पित करें; परम्परा अनुसार अन्नदान या भोजन कराने के बाद प्रसाद और घर का सात्त्विक भोजन ग्रहण करें।',
  paranaMealEn:
    'Within the Dwadashi parana window shown above, offer the meal first; after the customary food donation or feeding, take prasad and the household sattvik meal.',
  traditionNoteHi:
    'कुट्टू और सामक कुछ परिवारों में मान्य हैं और कुछ वैष्णव परम्पराओं में विवादित; अपने घर या सम्प्रदाय की रीति रखें।',
  traditionNoteEn:
    'Kuttu and samak are accepted in some households and disputed in some Vaishnava traditions; follow your family or sampradaya.',
  shoppingItems: [],
  status: 'verified',
  source: {
    referenceUrls: [DP_EKADASHI_FOOD, DP_EKADASHI_VIDHI, ISKCON_EKADASHI],
    verificationNote:
      'Verified 2026-08-25 against DrikPanchang food and vidhi pages plus ISKCON Bangalore: grains/beans are excluded, graduated fruit/milk forms are attested, food is offered before eating, and parana follows on Dwadashi.',
    variantNote:
      'DrikPanchang explicitly calls kuttu and samak disputed; they are not presented as universally permitted. The roadmap claim about not plucking Tulsi on Ekadashi is not shipped: Vaishnava references commonly name Dwadashi, while DrikPanchang gives a broader no-leaf-plucking rule on Ekadashi.',
  },
};

const nirjalaEkadashiFood: BhogContentEntry = {
  ...ekadashiFood,
  id: 'nirjala-ekadashi-food',
  titleHi: 'निर्जला एकादशी का पारण',
  titleEn: 'Nirjala Ekadashi parana',
  observanceIds: ['nirjala-ekadashi'],
  permittedDuringFast: [
    item('strict-nirjala', 'समर्थ व्रती के कठोर रूप में अन्न और जल दोनों वर्जित रहते हैं।', 'In the strict form for an able observer, both food and water are abstained.'),
  ],
  paranaMealHi:
    'द्वादशी के दिखाए गए पारण-काल में भगवान को अर्पण के बाद जल लेकर व्रत खोलें; फिर परम्परा अनुसार प्रसाद और सात्त्विक भोजन लें।',
  paranaMealEn:
    'Within the Dwadashi parana window shown above, break the fast with water after the offering; then take prasad and a sattvik meal according to tradition.',
  traditionNoteHi:
    'निर्जल, सजल और फलाहार रूप परिवार या सम्प्रदाय की परम्परा में भिन्न हो सकते हैं; अपनी मान्य रीति रखें।',
  traditionNoteEn:
    'Waterless, water-taking, and fruit-fare forms vary by family or sampradaya; follow the form accepted in your tradition.',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/ekadashis/nirjala/nirjala-ekadashi-vrat.html',
      'https://www.drikpanchang.com/ekadashis/parana/ekadashi-vrat-parana.html',
      ISKCON_EKADASHI,
    ],
    verificationNote:
      'Verified 2026-08-25 against DrikPanchang Nirjala/parana guidance and ISKCON Bangalore: the strict form excludes food and water, breaks after sunrise on Dwadashi, and health-based leniency is preserved.',
  },
};

const ganeshaBhog: BhogContentEntry = {
  id: 'ganesha-bhog',
  titleHi: 'श्री गणेश का नैवेद्य',
  titleEn: 'Naivedya for Shri Ganesha',
  observanceIds: ['ganesh-chaturthi', 'sankashti-chaturthi-vrat', 'vinayaka-chaturthi-vrat', 'sakat-chauth'],
  vidhiIds: ['ganesh-chaturthi-sthapana'],
  offerings: [
    item('modak', 'मोदक या लड्डू; उपलब्ध न हो तो फल और नारियल', 'Modak or laddoo; fruit and coconut if those are unavailable'),
    item('durva', 'कोमल दूर्वा और लाल पुष्प', 'Tender durva and red flowers'),
  ],
  permittedDuringFast: [
    item('sankashti-fare', 'संकष्टी व्रत में परिवार की रीति अनुसार फल, दूध या फलाहार', 'For Sankashti vrat, fruit, milk, or fruit fare according to family practice'),
  ],
  abstainedDuringFast: [
    item('grains-before-moonrise', 'चंद्रोदय से पहले अन्न; कठोरता परिवार-परम्परा अनुसार', 'Grains before moonrise; strictness follows family tradition'),
  ],
  doNotOffer: [
    item('tulsi', 'सामान्य गणेश-पूजा में तुलसी न चढ़ाएँ।', 'Do not offer Tulsi in ordinary Ganesha worship.'),
  ],
  paranaMealHi: 'संकष्टी में चंद्र-दर्शन और अर्घ्य के बाद श्री गणेश को नैवेद्य अर्पित कर वही प्रसाद लेकर व्रत खोलें।',
  paranaMealEn: 'On Sankashti, after moon-sighting and arghya, offer naivedya to Shri Ganesha and break the fast with that prasad.',
  traditionNoteHi:
    'कुछ प्रकाशित गणेश चतुर्थी पद्धतियाँ उसी पर्व के दिन तुलसी का अपवाद मानती हैं; अपने परिवार की विधि में ऐसा स्पष्ट हो तभी अपनाएँ।',
  traditionNoteEn:
    'Some published Ganesh Chaturthi procedures make a festival-day exception for Tulsi; use it only when your family vidhi explicitly does so.',
  shoppingItems: [
    grocery('rice-flour', 'मोदक के लिए चावल का आटा', 'Rice flour for homemade modak', true),
    grocery('jaggery-coconut', 'गुड़ और नारियल', 'Jaggery and coconut', true),
  ],
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.incredibleindia.gov.in/en/festivals-and-events/maharashtra/ganesh-chaturthi',
      'https://www.siddhivinayakdevsthan.org/Siddhivinayak/GaneshaPoojas.aspx',
      'https://www.siddhivinayak.org/pooja-details-2/',
    ],
    verificationNote:
      'Verified 2026-08-25 against Ministry of Tourism Ganesh Chaturthi guidance, Siddhivinayak Devsthan worship guidance, and Shree Siddhivinayak Ganapati Mandir Trust puja/prasad details: modak or laddoo, fruit/coconut, durva, and the ordinary Tulsi restriction are directly attested.',
    variantNote:
      'Some published Ganesh Chaturthi procedures allow Tulsi on that festival alone, so the UI states the ordinary rule and names the exception instead of claiming a universal ban.',
  },
};

const mahaShivaratriBhog: BhogContentEntry = {
  id: 'maha-shivaratri-bhog',
  titleHi: 'महाशिवरात्रि का नैवेद्य और फलाहार',
  titleEn: 'Maha Shivaratri offering and food',
  observanceIds: ['maha-shivaratri'],
  vidhiIds: ['maha-shivaratri-puja'],
  offerings: [
    item('fruit', 'बेर या अन्य ऋतुफल और स्वच्छ जल का नैवेद्य', 'Ber or other seasonal fruit, with clean water as naivedya'),
    item('bilva', 'बिल्वपत्र शिव-पूजा में अर्पित करें।', 'Offer bilva leaves in Shiva worship.'),
  ],
  permittedDuringFast: [
    item('fruit-milk', 'सरल रूप में दिन के समय फल और दूध', 'In the simpler form, fruit and milk during the day'),
  ],
  abstainedDuringFast: [
    item('night-fast', 'रात्रि-पूजा और जागरण में भोजन; कठोर रूप निर्जल भी हो सकता है।', 'Food during the night worship and vigil; the strict form may also be waterless.'),
  ],
  doNotOffer: [
    item('ketaki', 'केतकी और चम्पक के फूल शिव को न चढ़ाएँ।', 'Do not offer ketaki or champaka flowers to Shiva.'),
  ],
  paranaMealHi: 'अगले दिन दिखाए गए पारण-काल में स्नान और शिव-स्मरण के बाद प्रसाद लेकर सात्त्विक भोजन करें।',
  paranaMealEn: 'On the next day, within the parana window shown above, bathe, remember Shiva, take prasad, and then have a sattvik meal.',
  traditionNoteHi:
    'दूध, दही, घी, शहद और शक्कर यहाँ अभिषेक की सामग्री हैं; उन्हें नैवेद्य समझकर पीना आवश्यक नहीं है।',
  traditionNoteEn:
    'Milk, curd, ghee, honey, and sugar here are abhisheka materials; they are not automatically a required food offering or drink.',
  shoppingItems: [grocery('ber-fruit', 'बेर या ऋतुफल', 'Ber or seasonal fruit', true)],
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.incredibleindia.gov.in/en/festivals-and-events/maha-shivratri',
      'https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-puja-vidhi.html?lang=en',
      'https://www.swaminarayan.faith/scriptures/en/satsangi-jeevan/prakran-5/7',
      'https://www.wisdomlib.org/hinduism/book/shiva-purana-english/d/doc225982.html',
    ],
    verificationNote:
      'Verified 2026-08-25 against Ministry of Tourism and DrikPanchang for fast/abhisheka/bilva/fruit, with Satsangi Jivan and Shiva Purana 2.1.14.36 concordant on ketaki and champaka.',
  },
};

const janmashtamiBhog: BhogContentEntry = {
  id: 'janmashtami-bhog',
  titleHi: 'जन्माष्टमी का भोग और फलाहार',
  titleEn: 'Janmashtami bhog and food',
  observanceIds: ['janmashtami'],
  vidhiIds: [],
  offerings: [
    item('simple', 'माखन-मिश्री, फल, पेड़ा, खीर या पंजीरी में से उपलब्ध सात्त्विक भोग', 'An available sattvik offering such as makhan-mishri, fruit, peda, kheer, or panjiri'),
    item('simple-gita', 'सरल रूप में पत्ता, पुष्प, फल या जल भी भक्तिपूर्वक अर्पित किया जा सकता है।', 'In the simplest form, a leaf, flower, fruit, or water may be offered with devotion.'),
  ],
  permittedDuringFast: [
    item('fruit-root-milk', 'फल, मूल और दूध; समर्थ व्रती पूर्ण उपवास रखते हैं।', 'Fruit, roots, and milk; able observers may keep a complete fast.'),
  ],
  abstainedDuringFast: [
    item('grain', 'जन्म-पूजा तक अन्न', 'Grains until the birth puja'),
    item('onion-garlic', 'भोग में प्याज और लहसुन', 'Onion and garlic in the bhog'),
  ],
  paranaMealHi:
    'वैष्णव रीति में मध्यरात्रि आरती के बाद अनाज-रहित प्रसाद लिया जाता है और अन्न अगले दिन; स्मार्त पारण अष्टमी और रोहिणी की समाप्ति देखकर हो सकता है।',
  paranaMealEn:
    'In Vaishnava practice, take non-grain prasad after the midnight arati and grains the next day; Smarta parana may wait for the endings of Ashtami and Rohini.',
  traditionNoteHi:
    'छप्पन भोग अनिवार्य नहीं है; उपलब्ध, स्वच्छ और सात्त्विक अर्पण पर्याप्त है।',
  traditionNoteEn:
    'Chhapan bhog is not required; an available, clean, sattvik offering is sufficient.',
  shoppingItems: [],
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.iskconbangalore.org/wp-content/uploads/2019/02/English-Janmashtami-Vrata-Manual.pdf',
      'https://www.incredibleindia.gov.in/en/festivals-and-events/janmashtami',
      'https://www.incredibleindia.gov.in/en/uttar-pradesh/mathura/enjoy-a-taste-of-mathura',
    ],
    verificationNote:
      'Verified 2026-08-25 against the ISKCON Bangalore vrata manual and Ministry of Tourism Janmashtami/Mathura pages: sattvik no-onion/no-garlic bhog, simple fruit/water sufficiency, dairy sweets, makhan-mishri, and fasting until the birth worship.',
  },
};

const navratriBhog: BhogContentEntry = {
  id: 'navratri-bhog',
  titleHi: 'नवरात्रि का भोग और व्रत भोजन',
  titleEn: 'Navratri offering and vrat food',
  observanceIds: ['navratri-start'],
  vidhiIds: ['navratri-ghatasthapana'],
  offerings: [
    item('fruit-sweets', 'प्रतिदिन फल या घर की परम्परा का सात्त्विक मिष्ठान्न', 'Daily fruit or the sattvik sweet followed in your household'),
    item('kanya-prasad', 'अष्टमी या नवमी के कन्या पूजन में हलवा, चना और पूरी का प्रसाद', 'For Ashtami or Navami Kanya Pujan, halwa, chana, and puri as prasad'),
  ],
  permittedDuringFast: [
    item('flours', 'कुट्टू, सिंघाड़ा और राजगिरा का आटा', 'Kuttu, water-chestnut, and rajgira flour'),
    item('staples', 'साबूदाना, मखाना, सामक, फल, मेवे, दूध और दही', 'Sabudana, makhana, samak, fruit, nuts, milk, and curd'),
    item('salt', 'सेंधा नमक; सामान्य नमक नहीं', 'Rock salt; not common salt'),
  ],
  abstainedDuringFast: [
    item('grain-pulse', 'सामान्य अन्न और दालें; प्याज और लहसुन', 'Ordinary grains and pulses; onion and garlic'),
  ],
  paranaMealHi:
    'अष्टमी या नवमी पर कन्या पूजन से व्रत पूर्ण करने की परम्परा हो तो पहले कन्याओं को प्रसाद परोसें, फिर परिवार वही प्रसाद ग्रहण करे।',
  paranaMealEn:
    'Where the family concludes the vrat with Kanya Pujan on Ashtami or Navami, serve the prasad to the girls first, then the household takes the same prasad.',
  traditionNoteHi:
    'व्रत के दिन, समाप्ति की तिथि और सामग्री क्षेत्र व परिवार के अनुसार बदलती है; यहाँ उत्तर भारतीय प्रचलित रूप दिया है।',
  traditionNoteEn:
    'Fasting days, conclusion date, and ingredients vary by region and family; this is the common North Indian form.',
  shoppingItems: [
    grocery('rock-salt', 'सेंधा नमक', 'Rock salt'),
    grocery('fast-flour', 'कुट्टू, सिंघाड़ा या राजगिरा आटा', 'Kuttu, water-chestnut, or rajgira flour', true),
    grocery('sabudana-makhana', 'साबूदाना या मखाना', 'Sabudana or makhana', true),
  ],
  status: 'verified',
  source: {
    referenceUrls: [
      'https://nchm.gov.in/sites/default/files/2022-11/Indian_Food_Heritage.pdf',
      'https://www.newsonair.gov.in/festival-of-maha-ashtami-is-celebrated-with-full-devotion-in-punjab/',
      'https://www.utsav.gov.in/major-festival/navratri',
    ],
    verificationNote:
      'Verified 2026-08-25 against the Government of India NCHMCT food-heritage publication, Akashvani News report on Kanjak prasad, and Ministry of Tourism Utsav: fasting staples/rock salt and halwa-puri-chana are concordant.',
    variantNote: 'The ingredient list is explicitly framed as a common North Indian practice, not a pan-Indian mandate.',
  },
};

const karwaChauthBhog: BhogContentEntry = {
  id: 'karwa-chauth-bhog',
  titleHi: 'करवा चौथ की सरगी और पारण',
  titleEn: 'Karwa Chauth sargi and parana',
  observanceIds: ['karwa-chauth'],
  vidhiIds: ['karwa-chauth-puja'],
  offerings: [
    item('puja-sweets', 'चौथ माता और शिव परिवार को परिवार की रीति का फल या मिष्ठान्न', 'Fruit or sweets followed by the family for Chauth Mata and the Shiva family'),
  ],
  permittedDuringFast: [
    item('sargi', 'सूर्योदय से पहले सरगी; उसके बाद चंद्रोदय तक कठोर रूप में कुछ नहीं', 'Sargi before sunrise; in the strict form, nothing after that until moonrise'),
  ],
  abstainedDuringFast: [
    item('nirjala', 'सूर्योदय के बाद अन्न और जल', 'Food and water after sunrise'),
  ],
  paranaMealHi:
    'चंद्र-दर्शन और अर्घ्य के बाद पहले जल लें, फिर पूजा का प्रसाद और परिवार की परम्परा का भोजन ग्रहण करें।',
  paranaMealEn:
    'After moon-sighting and arghya, take water first, then the puja prasad and the meal followed by your family.',
  traditionNoteHi:
    'सरगी की थाली और व्रत खोलने का भोजन क्षेत्र और परिवार के अनुसार बदलता है; किसी एक मेनू को धार्मिक नियम न मानें।',
  traditionNoteEn:
    'The sargi plate and post-fast meal vary by region and household; do not treat one menu as a religious rule.',
  shoppingItems: [
    grocery('sargi-fruit', 'सरगी के लिए फल और मेवे', 'Fruit and nuts for sargi', true),
    grocery('parana-water', 'पारण के लिए जल', 'Water for parana'),
  ],
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/festivals/karwa-chauth/karwa-chauth-date-time.html',
      'https://www.incredibleindia.gov.in/en/festivals-and-events/karva-chauth',
    ],
    verificationNote:
      'Verified 2026-08-25 against DrikPanchang and Ministry of Tourism Incredible India: pre-dawn sargi, nirjala sunrise-to-moonrise observance, moon arghya, water first, and regional/family variation.',
  },
};

const diwaliLakshmiBhog: BhogContentEntry = {
  id: 'diwali-lakshmi-bhog',
  titleHi: 'दीपावली लक्ष्मी-गणेश नैवेद्य',
  titleEn: 'Diwali Lakshmi-Ganesha naivedya',
  observanceIds: ['diwali'],
  vidhiIds: ['diwali-lakshmi-ganesh-puja'],
  offerings: [
    item('diwali-naivedya', 'खील, बताशे, ऋतुफल और घर का सात्त्विक मिष्ठान्न', 'Puffed rice, batasha, seasonal fruit, and a household sattvik sweet'),
    item('simple', 'जो उपलब्ध हो उसे स्वच्छ पात्र में अर्पित करें; बड़ी थाली अनिवार्य नहीं है।', 'Offer what is available in a clean vessel; a large spread is not required.'),
  ],
  traditionNoteHi:
    'मिठाई, फल और खील उत्तर भारतीय दीपावली-पूजन का प्रचलित रूप हैं; क्षेत्रीय नैवेद्य अलग हो सकते हैं।',
  traditionNoteEn:
    'Sweets, fruit, and puffed rice are common in North Indian Diwali puja; regional naivedya may differ.',
  shoppingItems: [],
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/festivals/lakshmipuja/info/lakshmi-puja-samagri.html?lang=en',
      'https://chinmayanewyork.org/wp-content/uploads/2020/11/Lakshmi-Puja-Vidhi-Final.pdf',
    ],
    verificationNote:
      'Verified 2026-08-25 against DrikPanchang Lakshmi Puja samagri and Chinmaya Mission New York puja guide: sweets, fruit, nuts, and the simple available-offering principle are concordant; puffed rice is specific to the North Indian source.',
    variantNote: 'Puffed rice and batasha are presented as common North Indian practice, not a universal Lakshmi rule.',
  },
};

const satyanarayanBhog: BhogContentEntry = {
  id: 'satyanarayan-bhog',
  titleHi: 'श्री सत्यनारायण प्रसाद',
  titleEn: 'Shri Satyanarayan prasad',
  observanceIds: ['purnima-vrat', 'shree-satyanarayan-vrat'],
  vidhiIds: ['satyanarayan-puja'],
  offerings: [
    item('sheera', 'सूजी या गेहूँ के आटे का घी-शक्कर वाला शीरा या पंजीरी', 'Semolina or wheat-flour sheera/panjiri with ghee and sugar'),
    item('fruit-tulsi', 'केला, ऋतुफल और तुलसी दल सहित नैवेद्य', 'Naivedya with banana, seasonal fruit, and Tulsi leaves'),
  ],
  permittedDuringFast: [
    item('family-form', 'पूजा से पहले फलाहार या उपवास का रूप परिवार-परम्परा अनुसार', 'Before the puja, fruit fare or fasting according to family practice'),
  ],
  paranaMealHi: 'कथा और आरती के बाद पहले भगवान का प्रसाद आदर से ग्रहण करें; उसके बाद परिवार का सात्त्विक भोजन लें।',
  paranaMealEn: 'After the katha and arati, respectfully take the Lord’s prasad first; then have the household sattvik meal.',
  traditionNoteHi:
    'उत्तर भारत में पंजीरी या सूजी का प्रसाद और दक्षिण भारतीय पद्धतियों में रवा केसरी जैसे रूप मिलते हैं; दोनों को एक ही अनिवार्य नुस्खा न मानें।',
  traditionNoteEn:
    'North Indian panjiri or semolina prasad and South Indian rava-kesari forms are both attested; do not treat one recipe as universal.',
  shoppingItems: [
    grocery('semolina-flour', 'सूजी या गेहूँ का आटा', 'Semolina or wheat flour'),
    grocery('ghee-sugar', 'प्रसाद के लिए घी और शक्कर', 'Ghee and sugar for prasad'),
    grocery('banana', 'पके केले', 'Ripe bananas'),
  ],
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/hindu-gods/trimurti/lord-vishnu/puja-vidhi/satyanarayan-puja-vidhi.html?lang=en',
      'https://www.nrsaicentre.org.uk/wp-content/uploads/2021/02/Satyanarayan-puja-items-preparation-and-prasadam-method.pdf',
      'https://b-temple.org/wp-content/uploads/2024/06/Satyanarayana-Puja.pdf',
    ],
    verificationNote:
      'Verified 2026-08-25 against DrikPanchang plus two Hindu temple/community puja sheets: fruit/sweets/Tulsi and semolina-or-wheat prasad with ghee/sugar/banana are concordant; rava-kesari is retained as a named regional form.',
  },
};

const hanumanJayantiBhog: BhogContentEntry = {
  id: 'hanuman-jayanti-bhog',
  titleHi: 'हनुमान जयंती का भोग',
  titleEn: 'Hanuman Jayanti bhog',
  observanceIds: ['hanuman-jayanti'],
  vidhiIds: [],
  offerings: [
    item('laddoo', 'लड्डू या घर की परम्परा का पका हुआ मिष्ठान्न', 'Laddoo or the cooked sweet followed in your household'),
    item('fruit-coconut', 'सरल रूप में केला, ऋतुफल या नारियल', 'In a simple form, banana, seasonal fruit, or coconut'),
  ],
  traditionNoteHi:
    'उत्तर भारतीय हनुमान मन्दिरों में लड्डू प्रचलित हैं; दक्षिण भारतीय अंजनेय मन्दिरों में मक्खन, वड़ा-माला, पायसम या अवल जैसे अलग नैवेद्य मिलते हैं।',
  traditionNoteEn:
    'Laddoo is common at North Indian Hanuman temples; South Indian Anjaneya temples also use distinct offerings such as butter, vada-mala, payasam, or aval.',
  shoppingItems: [],
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/destinations/varanasi/spiritual.html',
      'https://www.incredibleindia.gov.in/en/west-bengal/kalimpong/hanuman-temple',
      'https://www.iskconbangalore.org/sri-hanuman-jayanti/',
      'https://pangodehanumanswamytemple.com/Vazhipadu/',
      'https://www.drikpanchang.com/hindu-gods/hanuman/puja-vidhi/hanuman-puja-vidhi.html?lang=en',
    ],
    verificationNote:
      'Verified 2026-08-25 against Ministry of Tourism temple pages, ISKCON Bangalore, Sree Hanuman Swamy Temple Pangode, and DrikPanchang Hanuman Puja: laddoo or another cooked sweet, fruit/coconut, and the named North/South temple variants are directly attested.',
    variantNote: 'The earlier boondi/besan-laddoo and gur-chana wording was narrowed because the strongest reviewed sources established laddoo and regional temple offerings, not those recipes as universal Hanuman Jayanti rules.',
  },
};

/** Every authored profile, drafts included. */
export const BHOG_CONTENT: readonly BhogContentEntry[] = [
  ekadashiFood,
  nirjalaEkadashiFood,
  ganeshaBhog,
  mahaShivaratriBhog,
  janmashtamiBhog,
  navratriBhog,
  karwaChauthBhog,
  diwaliLakshmiBhog,
  satyanarayanBhog,
  hanumanJayantiBhog,
  ...EXTENDED_BHOG_CONTENT,
];

const BHOG_BY_ID: ReadonlyMap<string, BhogContentEntry> = new Map(
  BHOG_CONTENT.map((entry) => [entry.id, entry] as const)
);

export function isBhogEntryExposed(entry: BhogContentEntry): boolean {
  return entry.status === 'verified';
}

export function getBhogContent(id: string): BhogContentEntry | null {
  const entry = BHOG_BY_ID.get(id) ?? null;
  return entry && isBhogEntryExposed(entry) ? entry : null;
}

export function getBhogForVidhi(vidhiId: string): BhogContentEntry | null {
  return BHOG_CONTENT.find((entry) => isBhogEntryExposed(entry) && entry.vidhiIds.includes(vidhiId)) ?? null;
}

(function assertBhogInvariants() {
  const ids = new Set<string>();
  for (const entry of BHOG_CONTENT) {
    if (ids.has(entry.id)) throw new Error(`bhogContent: duplicate id '${entry.id}'`);
    ids.add(entry.id);
    if (!entry.titleHi.trim() || !entry.titleEn.trim()) throw new Error(`bhogContent: ${entry.id} has no title`);
    if (entry.observanceIds.length === 0) throw new Error(`bhogContent: ${entry.id} has no observance`);
    if (entry.offerings.length === 0) throw new Error(`bhogContent: ${entry.id} has no offering`);
    if (entry.source.referenceUrls.length < 2) throw new Error(`bhogContent: ${entry.id} needs >=2 sources`);
    if (!entry.source.verificationNote.trim()) throw new Error(`bhogContent: ${entry.id} has no verification note`);
    if (Boolean(entry.paranaMealHi?.trim()) !== Boolean(entry.paranaMealEn?.trim())) {
      throw new Error(`bhogContent: ${entry.id} has a one-sided parana meal`);
    }
    const guidance = [
      ...entry.offerings,
      ...(entry.permittedDuringFast ?? []),
      ...(entry.abstainedDuringFast ?? []),
      ...(entry.doNotOffer ?? []),
    ];
    const guidanceIds = new Set<string>();
    for (const row of guidance) {
      if (guidanceIds.has(row.id)) throw new Error(`bhogContent: ${entry.id} duplicate row '${row.id}'`);
      guidanceIds.add(row.id);
      if (!row.textHi.trim() || !row.textEn.trim()) throw new Error(`bhogContent: ${entry.id} empty row '${row.id}'`);
    }
    const shoppingIds = new Set<string>();
    for (const row of entry.shoppingItems) {
      if (shoppingIds.has(row.id)) throw new Error(`bhogContent: ${entry.id} duplicate grocery '${row.id}'`);
      shoppingIds.add(row.id);
      if (!row.itemHi.trim() || !row.itemEn.trim()) throw new Error(`bhogContent: ${entry.id} empty grocery '${row.id}'`);
    }
  }
})();

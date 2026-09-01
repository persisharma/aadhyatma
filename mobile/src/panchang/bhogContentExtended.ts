/**
 * PRD-23 phases 2 and 3: source-reviewed long-tail vrat food profiles.
 *
 * These entries intentionally prefer a short, directly attested answer over a
 * composed menu. Regional dishes are named as regional; a fast-permitted food
 * is never silently promoted to naivedya.
 */
import type { BhogContentEntry } from './types';

const item = (id: string, textHi: string, textEn: string) => ({ id, textHi, textEn });

type ProfileSeed = Omit<BhogContentEntry, 'vidhiIds' | 'shoppingItems' | 'status'>;
const profile = (seed: ProfileSeed): BhogContentEntry => ({
  ...seed,
  vidhiIds: [],
  shoppingItems: [],
  status: 'verified',
});

const DP = 'https://www.drikpanchang.com';
const UTSAV = 'https://www.utsav.gov.in';

const hartalikaTeejBhog = profile({
  id: 'hartalika-teej-bhog',
  titleHi: 'हरतालिका तीज का अर्पण और पारण',
  titleEn: 'Hartalika Teej offering and parana',
  observanceIds: ['hartalika-teej'],
  offerings: [item('fruit-sweets', 'मां पार्वती को फल, मिष्ठान्न और पुष्प अर्पित करें।', 'Offer fruit, sweets, and flowers to Maa Parvati.')],
  permittedDuringFast: [item('strict-form', 'प्रचलित कठोर रूप में दिन भर अन्न और जल नहीं लिया जाता।', 'In the customary strict form, food and water are not taken during the day.')],
  paranaMealHi: 'पूजा पूर्ण होने के बाद अपने परिवार की रीति के समय प्रसाद लेकर व्रत खोलें।',
  paranaMealEn: 'After completing the worship, break the fast with prasad at the time followed by your family.',
  traditionNoteHi: 'तीज के नाम, दिन और व्रत की कठोरता क्षेत्र के अनुसार बदलते हैं; यह हरतालिका का प्रचलित उत्तर-पश्चिमी रूप है।',
  traditionNoteEn: 'Teej names, dates, and strictness vary by region; this is the common north-western Hartalika form.',
  source: {
    referenceUrls: [
      'https://www.incredibleindia.gov.in/en/festivals-and-events/teej',
      `${UTSAV}/view-event/hartalika-teej-2025-1`,
    ],
    verificationNote: 'Verified 2026-08-26: both Ministry of Tourism sources attest Parvati worship, fruit/flower offerings, and fasting; the Utsav record specifies the nirjala form.',
    variantNote: 'The entry names the regional scope instead of applying one Teej menu to every Teej tradition.',
  },
});

const hariyaliTeejBhog = profile({
  id: 'hariyali-teej-bhog',
  titleHi: 'हरियाली तीज का अर्पण और पकवान',
  titleEn: 'Hariyali Teej offering and festive food',
  observanceIds: ['hariyali-teej'],
  offerings: [item('parvati-offering', 'तीज माता (मां पार्वती) को पुष्प, फल और मिष्ठान्न अर्पित करें।', 'Offer flowers, fruit, and sweets to Teej Mata (Maa Parvati).')],
  permittedDuringFast: [item('family-form', 'स्त्रियां सौभाग्य के लिए व्रत रखती हैं; निर्जल या फलाहार रूप परिवार की रीति से निश्चित करें।', 'Women keep the vrat for marital well-being; settle the waterless or fruit-fare form by your family custom.')],
  paranaMealHi: 'पूजा के उपरांत परिवार की रीति से व्रत खोलें; घेवर इस पर्व का प्रचलित पकवान है।',
  paranaMealEn: 'Break the fast after the worship according to your family custom; ghewar is the sweet customarily associated with this festival.',
  traditionNoteHi: 'झूला, मेहंदी और घेवर श्रावणी तीज का प्रचलित उत्तर-पश्चिमी रूप हैं; नाम और रीति क्षेत्र के अनुसार बदलते हैं।',
  traditionNoteEn: 'Swings, mehndi, and ghewar belong to the common north-western Shravana Teej form; names and customs vary by region.',
  source: {
    referenceUrls: [
      `${UTSAV}/view-event/teej-festival`,
      'https://www.incredibleindia.gov.in/en/festivals-and-events/teej',
    ],
    verificationNote:
      'Verified 2026-08-30 via search excerpts of both Ministry of Tourism pages (direct fetch blocked by the network egress proxy): both attest the women’s monsoon vrat to Parvati/Teej Mata for the husband’s wellness, swings and mehndi, and the Utsav record names ghewar as the sweet closely associated with the festival.',
    variantNote: 'Fast strictness is left to family custom rather than asserting one universal nirjala rule.',
  },
});

const kajariTeejBhog = profile({
  id: 'kajari-teej-bhog',
  titleHi: 'कजरी तीज का अर्पण, नीम पूजन और सातू',
  titleEn: 'Kajari Teej offering, neem worship, and sattu',
  observanceIds: ['kajari-teej'],
  offerings: [item('neem-offering', 'नीम (नीमड़ी माता) का कुमकुम, अक्षत, हल्दी और मेहंदी से पूजन कर फल-मिष्ठान्न अर्पित करें।', 'Worship the neem (Neemdi Mata) with kumkum, akshata, haldi, and mehndi, offering fruit and sweets.')],
  permittedDuringFast: [item('strict-form', 'प्रचलित कठोर रूप में दिन भर निर्जल व्रत रखा जाता है।', 'In the customary strict form, a waterless fast is kept through the day.')],
  paranaMealHi: 'रात्रि में चंद्र दर्शन और अर्घ्य के बाद परम्परा से सातू ग्रहण कर व्रत खोलें — इसी से इसका सातुड़ी तीज नाम है।',
  paranaMealEn: 'After sighting the moon at night and offering arghya, the fast is traditionally broken with sattu — the source of its Satudi Teej name.',
  traditionNoteHi: 'यह राजस्थान का प्रचलित कजली/सातुड़ी रूप है (बूंदी का तीज मेला प्रसिद्ध है); नाम और रीति क्षेत्र के अनुसार बदलते हैं।',
  traditionNoteEn: 'This is the common Rajasthani Kajli/Satudi form (the Bundi Teej fair is its best-known celebration); names and customs vary by region.',
  source: {
    referenceUrls: [
      `${UTSAV}/view-event/kajli-teej-festival`,
      'https://www.prokerala.com/festivals/kajari-teej.html',
    ],
    verificationNote:
      'Verified 2026-08-30 via search excerpts of both pages (direct fetch blocked by the network egress proxy): the Utsav record attests the Bundi Kajli Teej celebration, and the Prokerala page the nirjala fast, neem pooja, moon offering, and breaking the fast with sattu; the sattu claim is additionally concordant across the surveyed festival pages.',
    variantNote: 'The sattu parana and neem worship are named as the Rajasthani form, not generalized to every Kajari Teej region.',
  },
});

const bahulaChaturthiBhog = profile({
  id: 'bahula-chaturthi-bhog',
  titleHi: 'बहुला चतुर्थी (बोल चौथ) का व्रत-भोजन',
  titleEn: 'Bahula Chaturthi (Bol Choth) vrat food',
  observanceIds: ['bahula-chaturthi'],
  offerings: [item('gau-puja', 'संध्या गोधूलि बेला में गौ माता और बछड़े का पूजन कर परिवार की रीति का नैवेद्य अर्पित करें।', 'Worship the cow and calf at the evening Godhuli hour, offering the naivedya prescribed by your family custom.')],
  permittedDuringFast: [item('millet-fare', 'प्रकाशित रीति में इस दिन बाजरे जैसे मोटे अनाज के व्यंजन लिए जाते हैं।', 'In the published custom, millet-based dishes are taken on this day.')],
  abstainedDuringFast: [item('no-milk', 'गौ-सम्मान में दूध और दुग्ध-निर्मित पदार्थ इस दिन नहीं लिए जाते।', 'In honour of the cow, milk and milk-made products are not taken this day.')],
  paranaMealHi: 'संध्या के गौ-पूजन और चंद्रोदय के उपरांत व्रत पूर्ण कर भोजन लें।',
  paranaMealEn: 'Complete the vrat after the evening cow worship and moonrise, then take the meal.',
  traditionNoteHi: 'गुजरात में यह बोल चौथ और मध्य प्रदेश में बहुला चतुर्थी नाम से प्रचलित है; रीति क्षेत्र के अनुसार बदलती है।',
  traditionNoteEn: 'Known as Bol Choth in Gujarat and Bahula Chaturthi in Madhya Pradesh; customs vary by region.',
  source: {
    referenceUrls: [
      `${DP}/gujarati/festivals/bol-choth/bol-choth-date-time.html`,
      'https://www.bhaktibharat.com/en/festival/bahula-chauth',
    ],
    verificationNote:
      'Verified 2026-08-30 via search excerpts of both pages (direct fetch blocked by the network egress proxy): both attest the day-long fast with evening cow-and-calf worship concluded after Godhuli puja and moonrise; the DrikPanchang Bol Choth record attests abstaining from milk and milk-made products with millet-based food, and the Gujarat/Madhya Pradesh naming split.',
    variantNote: 'The milk abstention and millet fare are transcribed from the Bol Choth record, not generalized beyond it; the naivedya itself is left to family custom.',
  },
});

const bhadwaChauthBhog = profile({
  id: 'bhadwa-chauth-bhog',
  titleHi: 'भादवा चौथ का चूरमा भोग और पारण',
  titleEn: 'Bhadwa Chauth churma offering and parana',
  observanceIds: ['bhadwa-chauth'],
  offerings: [item('churma-laddu', 'चौथ माता और विनायक जी को चूरमे के लड्डू का भोग लगाएं — प्रचलित रीति में पांच लड्डू: चौथ माता, विनायक जी, ब्राह्मण, पुत्र और व्रती के लिए।', 'Offer churma laddus to Chauth Mata and Vinayak Ji — in the customary form five laddus: for Chauth Mata, Vinayak Ji, a brahmin, the son, and the vrati herself.')],
  permittedDuringFast: [item('day-fast', 'दिन भर व्रत रखा जाता है; कठोरता परिवार की रीति से निश्चित करें।', 'A day-long fast is kept; settle its strictness by your family custom.')],
  paranaMealHi: 'संध्या चंद्रोदय पर चंद्रमा को अर्घ्य देकर, सास को बायना देकर आशीर्वाद लें, फिर प्रसाद और भोजन ग्रहण करें।',
  paranaMealEn: 'Offer arghya to the moon at the evening moonrise, present the bayana to the mother-in-law for her blessing, then take the prasad and the meal.',
  traditionNoteHi: 'यह राजस्थान की चौथ माता परम्परा (चौथ का बरवाड़ा, सवाई माधोपुर) का रूप है — उसी तिथि के गुजराती बोल चौथ (गौ-पूजन) से भिन्न।',
  traditionNoteEn: 'This is the Rajasthani Chauth Mata form (Chauth Ka Barwara, Sawai Madhopur) — distinct from the Gujarati Bol Choth cow worship on the same tithi.',
  source: {
    referenceUrls: [
      'https://aartisandhya.com/vrat-katha/bhadwa-chauth-mata-ki-vrat-katha',
      'https://athshri.com/bhadwa-chauth-vrat-katha/',
    ],
    verificationNote:
      'Verified 2026-08-30 via search excerpts of the surveyed Bhadwa Chauth vrat-katha pages (direct fetch blocked by the network egress proxy): both attest the Chauth Mata + Vinayak Ji worship, the day fast concluded with the evening moon arghya and the bayana to the mother-in-law; the five-churma-laddu distribution is transcribed from the same record set.',
    variantNote: 'Named as the Rajasthani Chauth Mata form; the same tithi’s Gujarati Bol Choth keeps its own separate profile rather than being merged.',
  },
});

const rishiPanchamiBhog = profile({
  id: 'rishi-panchami-bhog',
  titleHi: 'ऋषि पंचमी का नैवेद्य और फलाहार',
  titleEn: 'Rishi Panchami naivedya and food',
  observanceIds: ['rishi-panchami'],
  offerings: [item('puja-offering', 'सप्तर्षियों को फल, अक्षत और घर की विधि का नैवेद्य अर्पित करें।', 'Offer fruit, akshata, and the naivedya prescribed by your household vidhi to the Saptarishis.')],
  permittedDuringFast: [item('forms', 'परम्परा के अनुसार निर्जल या फल और दूध वाला फलाहार।', 'According to tradition, either a waterless fast or fruit and milk.')],
  abstainedDuringFast: [item('cultivated-food', 'महाराष्ट्रीय रीति में उस दिन हाथ से उगाया अन्न नहीं लिया जाता।', 'In the documented Maharashtrian form, hand-cultivated food is not taken that day.')],
  traditionNoteHi: 'महाराष्ट्र का ऋषि पंचमी भाजी भोजन एक क्षेत्रीय पारण परम्परा है, सार्वभौम नियम नहीं।',
  traditionNoteEn: 'The Maharashtrian Rishi Panchami bhaji meal is a regional parana tradition, not a universal rule.',
  source: {
    referenceUrls: [
      `${UTSAV}/view-event/rishi-panchami-bhai-panchami-1`,
      'https://www.gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer/RATNAGIRI/people_holidays.html',
    ],
    verificationNote: 'Verified 2026-08-26 against Ministry of Tourism Utsav and the Maharashtra Gazetteer: both attest the vrat; nirjala/phalahar and the Maharashtrian cultivated-food restriction are kept distinct.',
    variantNote: 'Bhai Panchami communities and the Maharashtrian bhaji conclusion are not generalized.',
  },
});

const durvaAshtamiBhog = profile({
  id: 'durva-ashtami-bhog',
  titleHi: 'दूर्वा अष्टमी का नैवेद्य',
  titleEn: 'Durva Ashtami naivedya',
  observanceIds: ['durva-ashtami'],
  offerings: [
    item('durva', 'दूर्वा और पुष्प अर्पित करें।', 'Offer durva and flowers.'),
    item('fruit', 'खजूर, नारियल, अंगूर, बेल या उपलब्ध ऋतुफल में से नैवेद्य रखें।', 'Use an available offering such as dates, coconut, grapes, wood apple, or seasonal fruit.'),
  ],
  permittedDuringFast: [item('whole-day', 'प्रकाशित विधि में दिन भर व्रत है; फलाहार का रूप परिवार से निश्चित करें।', 'The published procedure keeps a day-long fast; confirm any fruit-fare form with your family.')],
  traditionNoteHi: 'दूर्वा अष्टमी की विधि में शिव-पार्वती पूजन भी मिलता है; इसे केवल गणेश चतुर्थी का दूसरा नाम न मानें।',
  traditionNoteEn: 'Published Durva Ashtami procedure also includes Shiva-Parvati worship; do not treat it as another name for Ganesh Chaturthi.',
  source: {
    referenceUrls: [
      `${DP}/vrats/ashtami/durva-ashtami/durva-ashtami-date-time.html?lang=en`,
      'https://www.incredibleindia.gov.in/en/festivals-and-events/maharashtra/ganesh-chaturthi',
    ],
    verificationNote: 'Verified 2026-08-26: DrikPanchang directly lists durva, fruit, naivedya and the day-long vrat; Ministry of Tourism independently attests durva as a sacred Ganesha offering.',
    variantNote: 'Only the directly listed fruits are shown, as alternatives rather than a required seven-fruit purchase.',
  },
});

const anantChaturdashiBhog = profile({
  id: 'anant-chaturdashi-bhog',
  titleHi: 'अनंत चतुर्दशी का नैवेद्य',
  titleEn: 'Anant Chaturdashi naivedya',
  observanceIds: ['anant-chaturdashi'],
  offerings: [item('fruit-sweet', 'भगवान अनंत को फल और घर की परम्परा का मिष्ठान्न अर्पित करें।', 'Offer fruit and the household’s traditional sweet to Lord Ananta.')],
  permittedDuringFast: [item('day-fast', 'प्रकाशित पद्धतियों में दिन का व्रत है।', 'Published procedures attest a daytime fast.')],
  paranaMealHi: 'संध्या की पूजा के बाद प्रसाद लेकर परिवार की रीति से व्रत खोलें।',
  paranaMealEn: 'After the evening worship, take prasad and conclude according to family practice.',
  traditionNoteHi: 'मीठे कद्दू की पूरी एक प्रकाशित क्षेत्रीय नैवेद्य है; फल या घर का मिष्ठान्न सरल विकल्प है।',
  traditionNoteEn: 'Sweet-pumpkin puri is one published regional naivedya; fruit or the household sweet is the simpler alternative.',
  source: {
    referenceUrls: ['https://www.sanatan.org/en/a/72.html', 'https://ebooks.tirumala.org/download?id=25132'],
    verificationNote: 'Verified 2026-08-26 against Sanatan Sanstha and TTD Sapthagiri: fruit/sweets, a daytime fast, and post-worship conclusion are concordant; pumpkin puri is scoped regionally.',
    variantNote: 'The fourteen-item/thirteen-year ritual variants are not converted into a required shopping list.',
  },
});

const kojagaraBhog = profile({
  id: 'kojagara-bhog',
  titleHi: 'कोजागरा पूर्णिमा का भोग',
  titleEn: 'Kojagara Purnima bhog',
  observanceIds: ['kojagara-puja'],
  offerings: [
    item('kheer-milk', 'क्षेत्र की रीति में खीर या दूध का भोग चन्द्रप्रकाश में रखकर बाद में प्रसाद लें।', 'Where customary, place kheer or milk in moonlight and later take it as prasad.'),
    item('rice-coconut', 'महाराष्ट्रीय विधि में चावल या पोहा और नारियल-जल भी अर्पित होते हैं।', 'The Maharashtrian procedure also attests rice or flattened rice with coconut water.'),
  ],
  permittedDuringFast: [item('day-fast', 'दिन के व्रत के बाद रात्रि-पूजा और जागरण में प्रसाद लिया जाता है।', 'After the daytime fast, prasad is taken with the night worship and vigil.')],
  traditionNoteHi: 'बंगाल, ओडिशा, महाराष्ट्र और मध्य भारत के कोजागरा भोग अलग हैं; खीर को सार्वभौम लक्ष्मी-पूजा नियम न मानें।',
  traditionNoteEn: 'Kojagara bhog differs across Bengal, Odisha, Maharashtra, and central India; kheer is not a universal Lakshmi-puja rule.',
  source: {
    referenceUrls: [
      'https://maharashtratourism.gov.in/festivals/kojagiri-purnima/',
      'https://www.mahalaxmimandirpune.org/news-events.php',
      'https://vishwakosh.marathi.gov.in/21130/',
    ],
    verificationNote: 'Verified 2026-08-26 against Maharashtra Tourism, Shri Mahalaxmi Mandir Pune, and Marathi Vishwakosh: kheer/milk, regional rice-coconut forms, daytime fast, and night vigil are directly attested.',
    variantNote: 'Distinct Bengali harvest bhog is acknowledged but not merged into the Maharashtrian form.',
  },
});

const ahoiAshtamiBhog = profile({
  id: 'ahoi-ashtami-bhog',
  titleHi: 'अहोई अष्टमी का भोग और पारण',
  titleEn: 'Ahoi Ashtami offering and parana',
  observanceIds: ['ahoi-ashtami'],
  offerings: [item('halwa-puri', 'प्रचलित उत्तर भारतीय विधि में हलवा, पूरी और पुए का अर्पण होता है।', 'The common North Indian procedure offers halwa, puri, and pua.')],
  permittedDuringFast: [item('strict', 'संकल्प के कठोर रूप में तारा या चन्द्र-दर्शन तक अन्न और जल नहीं लिया जाता।', 'In the strict sankalpa, food and water are not taken until star- or moon-sighting.')],
  paranaMealHi: 'परिवार की रीति के अनुसार तारों या चन्द्रमा को अर्घ्य देकर प्रसाद से व्रत खोलें।',
  paranaMealEn: 'Following family practice, give arghya to the stars or moon and break the fast with prasad.',
  traditionNoteHi: 'तारा-दर्शन और चन्द्र-दर्शन दोनों प्रकाशित परम्पराएँ हैं; ऐप किसी एक को सार्वभौम नहीं बनाता।',
  traditionNoteEn: 'Star-sighting and moon-sighting are both published traditions; neither is presented as universal.',
  source: {
    referenceUrls: [
      `${DP}/festivals/ahoi-ashtami/info/ahoi-ashtami-puja-vidhi.html`,
      'https://nchm.gov.in/sites/default/files/2022-11/Indian_Food_Heritage.pdf',
    ],
    verificationNote: 'Verified 2026-08-26 against DrikPanchang procedure and the Government of India NCHMCT food-heritage record: the strict fast, offering foods, and family-dependent star/moon conclusion are retained.',
    variantNote: 'The North Indian menu is labelled regional.',
  },
});

const chhathBhog = profile({
  id: 'chhath-bhog',
  titleHi: 'छठ का प्रसाद और खरना',
  titleEn: 'Chhath prasad and Kharna',
  observanceIds: ['chhath-puja'],
  offerings: [
    item('thekua-fruit', 'संध्या और उषा अर्घ्य के सूप में ठेकुआ, ऋतुफल, नारियल और गन्ना रखा जाता है।', 'The Sandhya and Usha Arghya baskets include thekua, seasonal fruit, coconut, and sugarcane.'),
    item('rice-laddoo', 'परम्परा में चावल का लड्डू या कसार भी अर्पित होता है।', 'Rice laddoo or kasar is also offered in the regional tradition.'),
  ],
  permittedDuringFast: [item('kharna', 'खरना में सूर्यास्त के बाद गुड़ की खीर और रोटी का एक प्रसाद-भोजन होता है; इसके बाद निर्जल व्रत आरम्भ होता है।', 'At Kharna, a single sunset prasad meal of jaggery kheer and roti precedes the waterless fast.')],
  abstainedDuringFast: [item('nirjala', 'खरना के बाद उषा अर्घ्य तक अन्न और जल।', 'Food and water from after Kharna until Usha Arghya.')],
  paranaMealHi: 'उषा अर्घ्य के बाद प्रसाद और जल लेकर व्रत खोलें।',
  paranaMealEn: 'After Usha Arghya, conclude with water and prasad.',
  traditionNoteHi: 'छठ का प्रसाद बिहार और पूर्वांचल की विशिष्ट शुद्धता-विधि से बनता है; सामग्री को सामान्य फलाहार से न मिलाएँ।',
  traditionNoteEn: 'Chhath prasad follows a specific Bihar-Purvanchal purity discipline; do not merge it with generic fruit-fare.',
  source: {
    referenceUrls: [
      'https://biharbhawan.gov.in/docs/eMagazine/Newsletter_Dec_2025.pdf',
      'https://tourism.bihar.gov.in/en/experiences/food-and-cuisine/sweet/thekua',
      'https://newsonair.gov.in/bulletins-detail/parikrama-537/',
    ],
    verificationNote: 'Verified 2026-08-26 against Government of Bihar, Bihar Tourism, and Akashvani: thekua, Kharna kheer/roti, fruit/sugarcane, rice sweets, the 36-hour nirjala period, and Usha-Arghya parana are concordant.',
  },
});

const akshayaNavamiBhog = profile({
  id: 'akshaya-navami-bhog',
  titleHi: 'अक्षय नवमी का अर्पण',
  titleEn: 'Akshaya Navami offering',
  observanceIds: ['akshaya-navami'],
  offerings: [item('amla-fruit', 'आंवला वृक्ष की पूजा करें; उपलब्ध हो तो आंवला या ऋतुफल अर्पित करें।', 'Worship the amla tree; where available, offer amla or seasonal fruit.')],
  permittedDuringFast: [item('family-fast', 'उपवास या पूजा के बाद भोजन का रूप परिवार और क्षेत्र की रीति से रखें।', 'Follow the household and regional form for fasting or the post-puja meal.')],
  traditionNoteHi: 'आंवला-वृक्ष के नीचे भोजन और दान की परम्पराएँ क्षेत्रीय हैं; कोई एक व्यंजन अनिवार्य नहीं है।',
  traditionNoteEn: 'Meals beneath the amla tree and food-giving customs are regional; no single dish is required.',
  source: {
    referenceUrls: [
      `${DP}/festivals/akshaya-navami/akshaya-navami-date-time.html?lang=en&year=2026`,
      'https://rarebooksocietyofindia.org/book_archive/196174216674_10154430905566675.pdf',
      'https://vedicprayers.com/wp-content/uploads/2024/07/akshay-navami-english.pdf',
    ],
    verificationNote: 'Verified 2026-08-26 against DrikPanchang, a published historical reference, and a procedural booklet: amla worship, food-giving, and the regional meal custom are attested without inventing a fixed menu.',
    variantNote: 'Jagaddhatri Puja on the same tithi is a separate regional observance and is not merged here.',
  },
});

const pradoshBhog = profile({
  id: 'pradosh-bhog',
  titleHi: 'प्रदोष व्रत का अर्पण और पारण',
  titleEn: 'Pradosh offering and parana',
  observanceIds: ['pradosh-vrat-shukla', 'pradosh-vrat-krishna'],
  offerings: [item('shiva-fruit', 'शिव-पूजा में फल और जल अर्पित करें; बिल्वपत्र पूजा की सामग्री है।', 'Offer fruit and water in Shiva worship; bilva is a worship item.')],
  permittedDuringFast: [item('day-fast', 'प्रकाशित मंदिर परम्परा में दिन भर व्रत रखकर सन्ध्या में प्रदोष पूजा होती है।', 'Published temple practice keeps the fast through the day until the evening Pradosh worship.')],
  paranaMealHi: 'प्रदोष पूजा पूर्ण होने के बाद प्रसाद लेकर परिवार की रीति का सात्त्विक भोजन करें।',
  paranaMealEn: 'After Pradosh worship, take prasad and the sattvik meal followed by your household.',
  traditionNoteHi: 'शुक्ल और कृष्ण दोनों त्रयोदशी पर प्रदोष होता है; फलाहार या पूर्ण उपवास का रूप परम्परा से तय करें।',
  traditionNoteEn: 'Pradosh occurs in both fortnights; choose fruit-fare or a complete fast according to tradition.',
  source: {
    referenceUrls: [
      `${DP}/vrats/pradoshdates.html`,
      'https://nyganeshtemple.org/pradosham/',
      'https://www.ganapati.org/pradhosham',
    ],
    verificationNote: 'Verified 2026-08-26 against DrikPanchang and two independent temples: both fortnights, day fasting, sunset Shiva worship, and post-puja conclusion are concordant.',
  },
});

const dwadashiBhog = profile({
  id: 'dwadashi-bhog',
  titleHi: 'द्वादशी व्रत का विष्णु नैवेद्य',
  titleEn: 'Dwadashi Vishnu naivedya',
  observanceIds: ['dwadashi-vrat-shukla', 'dwadashi-vrat-krishna'],
  offerings: [item('vishnu-offering', 'भगवान विष्णु को तुलसी, फल और घर की विधि का नैवेद्य अर्पित करें।', 'Offer Tulsi, fruit, and the naivedya prescribed by your household vidhi to Lord Vishnu.')],
  permittedDuringFast: [item('specific-vrat', 'मास की प्रत्येक द्वादशी का नाम और व्रत-विधान अलग हो सकता है; उसी व्रत की भोजन-विधि रखें।', 'Each monthly Dwadashi may have a distinct name and vrata rule; follow that observance’s food discipline.')],
  paranaMealHi: 'व्रत की निर्धारित समाप्ति पर पहले नैवेद्य अर्पित करें; फिर प्रसाद और दान की परम्परा पूरी करके भोजन लें।',
  paranaMealEn: 'At the prescribed conclusion, offer naivedya first; then take prasad after completing the customary food-giving.',
  traditionNoteHi: 'यह स्वतंत्र द्वादशी व्रत है; इसे एकादशी के पारण-भोजन का सामान्य नाम न मानें।',
  traditionNoteEn: 'This is an independent Dwadashi vrata family; do not reduce it to a generic name for Ekadashi parana.',
  source: {
    referenceUrls: [
      `${DP}/dwadashi/dwadashi-dates.html?time-format=24hour`,
      'https://www.nepaljyotish.org/en/vrat-katha/dwadashi/madana-dwadashi/',
    ],
    verificationNote: 'Verified 2026-08-26 against DrikPanchang’s monthly Dwadashi corpus and an independent published Dwadashi procedure: Vishnu worship, naivedya, fasting, charity, and month-specific variance are directly attested.',
    variantNote: 'The entry deliberately avoids one food list for twelve distinct monthly Dwadashi traditions.',
  },
});

const recurringShivaBhog = profile({
  id: 'recurring-shiva-bhog',
  titleHi: 'मासिक शिवरात्रि और सावन सोमवार का फलाहार',
  titleEn: 'Monthly Shivaratri and Sawan Monday food',
  observanceIds: ['masik-shivaratri', 'sawan-somwar-vrat'],
  offerings: [item('fruit-bilva', 'शिव को फल, जल और बिल्वपत्र अर्पित करें।', 'Offer fruit, water, and bilva leaves to Shiva.')],
  permittedDuringFast: [item('fruit-milk', 'परम्परा के अनुसार फल, दूध या एक समय का फलाहार; कठोर रूप पूर्ण उपवास हो सकता है।', 'According to tradition, fruit, milk, or one fruit-fare meal; the strict form may be a complete fast.')],
  abstainedDuringFast: [item('grains', 'फलाहार रूप में सामान्य अन्न और दालें।', 'Ordinary grains and pulses in the fruit-fare form.')],
  paranaMealHi: 'मासिक शिवरात्रि में अगले दिन और सोमवार व्रत में सन्ध्या-पूजा के बाद, अपनी परम्परा के समय प्रसाद लें।',
  paranaMealEn: 'For Masik Shivaratri conclude the next day, and for Monday vrat after evening worship, at the time followed by your tradition.',
  traditionNoteHi: 'दोनों शिव-व्रतों का अर्पण समान हो सकता है, पर व्रत खोलने का समय समान नहीं है।',
  traditionNoteEn: 'The Shiva offering may be shared, but the two vratas do not share the same conclusion time.',
  source: {
    referenceUrls: [
      'https://www.incredibleindia.gov.in/en/festivals-and-events/maha-shivratri',
      'https://www.baps.org/cultureandheritage/Traditions/AnnualCelebrationsandFestivals/MahaShivRatri.aspx',
      'https://www.gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer/RATNAGIRI/people_holidays.html',
    ],
    verificationNote: 'Verified 2026-08-26 against Ministry of Tourism, BAPS, and Maharashtra Gazetteer records: fruit/milk forms, bilva, monthly/night and Sawan-Monday traditions are attested; conclusion times remain separate.',
    variantNote: 'Maha Shivaratri keeps its own profile because vigil and prohibition claims are more specific.',
  },
});

const pitruOffering = profile({
  id: 'pitru-offering',
  titleHi: 'अमावस्या और श्राद्ध का अन्न-अर्पण',
  titleEn: 'Amavasya and Shraddha food offering',
  observanceIds: ['amavasya-vrat', 'shraddha-dates'],
  offerings: [
    item('til-water', 'तर्पण में जल और काले तिल अर्पित किए जाते हैं।', 'Tarpana uses water and black sesame.'),
    item('pinda-food', 'पूर्ण श्राद्ध में पिण्ड और परिवार-परम्परा का भोजन अर्पण अलग विधि से होता है।', 'A full Shraddha separately offers pinda and the food prescribed by family tradition.'),
  ],
  permittedDuringFast: [item('amavasya-fast', 'अमावस्या का उपवास और श्राद्धकर्ता का भोजन-विधान कुलाचार के अनुसार रखें।', 'Keep the Amavasya fast and the performer’s Shraddha meal discipline according to family tradition.')],
  traditionNoteHi: 'तर्पण, पिण्डदान, ब्राह्मण-भोजन और स्वयं व्रती का भोजन चार अलग विषय हैं; ऐप इन्हें एक सूची नहीं बनाता।',
  traditionNoteEn: 'Tarpana, pinda, feeding others, and the observer’s own meal are four distinct matters; the app does not merge them.',
  source: {
    referenceUrls: [
      'https://bstdc.bihar.gov.in/pitripakshamela/about.php',
      'https://nchm.gov.in/sites/default/files/2022-11/Indian_Food_Heritage.pdf',
      'https://kamakoti.org/kamakoti/varaha/bookview.php?chapnum=22',
    ],
    verificationNote: 'Verified 2026-08-26 against Bihar Tourism, Government of India NCHMCT, and Kanchi Kamakoti Peetham: water/til tarpan, pinda/food offerings, Amavasya fasting, and family-lineage variance are directly attested.',
    variantNote: 'No universal Shraddha menu is shipped because published regional food forms differ sharply.',
  },
});

const skandaSashtiBhog = profile({
  id: 'skanda-sashti-bhog',
  titleHi: 'स्कंद षष्ठी का अर्पण और व्रत',
  titleEn: 'Skanda Sashti offering and fast',
  observanceIds: ['skanda-sashti'],
  offerings: [item('fruit', 'भगवान स्कंद को फल अर्पित करें; मन्दिर की विशेष नैवेद्य परम्परा हो तो वही रखें।', 'Offer fruit to Lord Skanda; follow the temple’s own naivedya tradition where one is prescribed.')],
  permittedDuringFast: [item('partial-full', 'मासिक षष्ठी में आंशिक या पूर्ण व्रत; वार्षिक कंद षष्ठी में कुछ परम्पराएँ छह दिन व्रत रखती हैं।', 'Monthly Sashti may use a partial or full fast; some annual Kanda Sashti traditions fast for six days.')],
  traditionNoteHi: 'मासिक स्कंद षष्ठी और तमिल छह-दिवसीय कंद षष्ठी एक ही अवधि का व्रत नहीं हैं।',
  traditionNoteEn: 'Monthly Skanda Sashti and the Tamil six-day Kanda Sashti do not have the same duration.',
  source: {
    referenceUrls: [
      `${UTSAV}/public/view-event/kandhar-sasti-festival-2024-arulmigu-subramaniya-swamy-temple-tiruchendur-1`,
      'https://www.thazhakara.org/page?id=30',
      'https://shivadurgatemple.org/events/skanda-shasti-mahotsava/',
    ],
    verificationNote: 'Verified 2026-08-26 against a Tamil Nadu HRCE/Ministry of Tourism event and two independent temples: monthly partial/full fasting and the annual six-day form are directly distinguished.',
    variantNote: 'No invented pan-Indian Murugan menu is shown.',
  },
});

const deviVratBhog = profile({
  id: 'devi-vrat-bhog',
  titleHi: 'दुर्गा और देवी-व्रत का सरल अर्पण',
  titleEn: 'Simple offering for Durga and Devi vratas',
  observanceIds: ['masik-durgashtami', 'ashoka-ashtami', 'asha-dashami'],
  offerings: [item('fruit-sweet', 'देवी को फल, पुष्प और घर की विधि का सात्त्विक मिष्ठान्न अर्पित करें।', 'Offer fruit, flowers, and the sattvik sweet prescribed by your household vidhi to Devi.')],
  permittedDuringFast: [item('family-form', 'पूर्ण उपवास, फलाहार या एक समय भोजन में से वही रूप रखें जो इस विशिष्ट व्रत की परम्परा में हो।', 'Use the complete-fast, fruit-fare, or one-meal form prescribed for that specific vrata.')],
  traditionNoteHi: 'दुर्गाष्टमी, अशोकाष्टमी और आशा दशमी अलग व्रत हैं; साझा प्रोफाइल केवल सीधे प्रमाणित सरल अर्पण दिखाती है।',
  traditionNoteEn: 'Durgashtami, Ashoka Ashtami, and Asha Dashami are distinct vratas; this shared profile shows only the directly supported simple offering.',
  source: {
    referenceUrls: [
      'https://maharashtratourism.gov.in/festivals/ghatasthapana/',
      `${DP}/vrats/dashami/asha-dashami/asha-dashami-vrat-date-time.html?year=2026`,
      'https://www.utsav.gov.in/public/major-festival/navratri',
    ],
    verificationNote: 'Verified 2026-08-26 against Maharashtra Tourism, Ministry of Tourism Utsav, and DrikPanchang: Devi worship, fruit/naivedya, fasting, and observance-specific variation are directly attested.',
    variantNote: 'Navratri’s detailed North Indian food list is not copied into these monthly and regional vratas.',
  },
});

const kalashtamiBhog = profile({
  id: 'kalashtami-bhog',
  titleHi: 'कालाष्टमी का भैरव अर्पण',
  titleEn: 'Kalashtami Bhairava offering',
  observanceIds: ['masik-kalashtami'],
  offerings: [item('fruit-sesame', 'काल भैरव को फल और काले तिल अर्पित करें; दीपक का तेल भोजन नहीं है।', 'Offer fruit and black sesame to Kala Bhairava; lamp oil is not food.')],
  permittedDuringFast: [item('partial-full', 'प्रकाशित परम्पराओं में पूर्ण या आंशिक दिन-व्रत दोनों मिलते हैं।', 'Published traditions attest both complete and partial daytime fasts.')],
  traditionNoteHi: 'भैरव मन्दिरों के नैवेद्य क्षेत्र और सम्प्रदाय से बदलते हैं; तेल-दीप को खाने योग्य अर्पण न मानें।',
  traditionNoteEn: 'Bhairava temple naivedya varies by region and sampradaya; do not treat lamp oil as an edible offering.',
  source: {
    referenceUrls: [
      'https://blog.bhairavapeedam.org/the-divine-benefits-of-worshipping-kala-bhairava-on-ashtami/',
      'https://www.atmajyotifoundation.org/article/kaal-bhairav-jayanti',
    ],
    verificationNote: 'Verified 2026-08-26 against two independent Bhairava institutions: fasting, fruit, black sesame and lamp worship are concordant; edible and lamp materials remain separate.',
    variantNote: 'Curd-rice and vada-mala are temple-specific and therefore not presented as universal.',
  },
});

const krishnaMonthlyBhog = profile({
  id: 'krishna-monthly-bhog',
  titleHi: 'मासिक कृष्णाष्टमी का भोग',
  titleEn: 'Monthly Krishnashtami bhog',
  observanceIds: ['masik-krishna-janmashtami'],
  offerings: [item('fruit-dairy', 'श्री कृष्ण को फल या घर की रीति का दूध से बना सात्त्विक भोग अर्पित करें।', 'Offer fruit or the household’s sattvik milk-based bhog to Shri Krishna.')],
  permittedDuringFast: [item('fruit-milk', 'फल, जल या दूध वाला रूप; सामान्य अन्न व्रत पूर्ण होने तक न लें।', 'Use a fruit, water, or milk form; avoid ordinary grains until the vrata concludes.')],
  traditionNoteHi: 'मासिक कृष्णाष्टमी को वार्षिक जन्माष्टमी का छप्पन-भोग या मध्यरात्रि-पारण स्वतः लागू नहीं होता।',
  traditionNoteEn: 'The annual Janmashtami spread and midnight parana do not automatically apply to monthly Krishnashtami.',
  source: {
    referenceUrls: [
      'https://www.iskconbangalore.org/wp-content/uploads/2019/02/English-Janmashtami-Vrata-Manual.pdf',
      'https://majuli.assam.gov.in/tourist-place-detail/276',
    ],
    verificationNote: 'Verified 2026-08-26 against ISKCON Bangalore and Government of Assam records: Krishna fasting, simple offerings, fruit/milk and regional offering variance are attested; annual-only details are excluded.',
    variantNote: 'The Assam Satra prohibition/offerings are regional and not generalized.',
  },
});

const mangalaGauriBhog = profile({
  id: 'mangala-gauri-bhog',
  titleHi: 'मंगला गौरी व्रत का अर्पण',
  titleEn: 'Mangala Gauri vrata offering',
  observanceIds: ['mangala-gauri-vrat'],
  offerings: [item('fruit-sweets', 'मां मंगला गौरी को फल और मिष्ठान्न अर्पित करें।', 'Offer fruit and sweets to Maa Mangala Gauri.')],
  permittedDuringFast: [item('tuesday-fast', 'श्रावण के मंगलवार का व्रत परिवार की रीति के अनुसार पूर्ण, फलाहार या एक समय भोजन हो सकता है।', 'The Shravan Tuesday fast may be complete, fruit-fare, or one meal according to family practice.')],
  traditionNoteHi: 'गया की प्रकाशित विधि में सात फल और पांच मिठाइयां हैं; इन्हें हर परिवार की अनिवार्य संख्या न मानें।',
  traditionNoteEn: 'The published Gaya practice uses seven fruits and five sweets; those counts are not universal requirements.',
  source: {
    referenceUrls: [
      'https://www.incredibleindia.gov.in/en/bihar/gaya/mangla-gauri-temple',
      'https://tourism.bihar.gov.in/en/destinations/gaya/mangala-gauri',
      'https://www.gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer/RATNAGIRI/people_holidays.html',
    ],
    verificationNote: 'Verified 2026-08-26 against Ministry of Tourism, Bihar Tourism, and Maharashtra Gazetteer: Shravan Tuesday fasting and fruit/sweet offerings are attested with regional differences.',
    variantNote: 'The Gaya offering counts are labelled as one temple tradition.',
  },
});

const varalakshmiBhog = profile({
  id: 'varalakshmi-bhog',
  titleHi: 'वरलक्ष्मी व्रत का नैवेद्य',
  titleEn: 'Varalakshmi vrata naivedya',
  observanceIds: ['varalakshmi-vrat'],
  offerings: [item('fruit-sweet', 'फल, नारियल और घर की दक्षिण भारतीय परम्परा का नैवेद्य अर्पित करें।', 'Offer fruit, coconut, and the naivedya followed in your South Indian household tradition.')],
  permittedDuringFast: [item('until-puja', 'कुछ परम्पराओं में पूजा तक उपवास या भोजन-विराम रखा जाता है।', 'Some traditions fast or defer the meal until the puja.')],
  paranaMealHi: 'आरती के बाद नैवेद्य को प्रसाद रूप में परिवार और आमंत्रित महिलाओं में बांटें।',
  paranaMealEn: 'After arati, share the naivedya as prasad with family and invited women.',
  traditionNoteHi: 'सुंडल, खीर, मोदक, इडली, पोंगल और अन्य पकवान अलग घरों और मन्दिरों की परम्पराएँ हैं; फल सरल अर्पण है।',
  traditionNoteEn: 'Sundal, kheer, modak, idli, pongal, and other dishes belong to different household and temple traditions; fruit is the simple offering.',
  source: {
    referenceUrls: [
      'https://www.tirumala.org/PatAtThiruchanoorSevas.aspx',
      'https://srirajarajeswaripeetham.org/event/srrp-sri-varalakshmi-vratham-2026/',
      'https://www.ourhindutemple.org/pooja-festival-event/vara-lakshmi-vratham',
    ],
    verificationNote: 'Verified 2026-08-26 against TTD and two independent temples: fruit/coconut, naivedya, prasad sharing, and varied cooked dishes are directly attested.',
    variantNote: 'No temple’s multi-dish list is made compulsory for household worship.',
  },
});

const vatSavitriBhog = profile({
  id: 'vat-savitri-bhog',
  titleHi: 'वट सावित्री व्रत का अर्पण',
  titleEn: 'Vat Savitri vrata offering',
  observanceIds: ['vat-savitri-vrat'],
  offerings: [item('fruit-water', 'वटवृक्ष को जल देकर फल और पुष्प अर्पित करें।', 'Offer water, fruit, and flowers at the banyan tree.')],
  permittedDuringFast: [item('fruit-milk', 'कुछ महाराष्ट्रीय परम्पराओं में तीन दिन फल, कन्द और दूध; अन्य परिवार एक दिन का व्रत रखते हैं।', 'Some Maharashtrian traditions use fruit, roots, and milk for three days; other households keep a one-day fast.')],
  traditionNoteHi: 'उत्तर भारत में अमावस्या और महाराष्ट्र में पूर्णिमा का विधान मिलता है; ऐप स्थानीय पंचांग और कुलाचार को प्राथमिकता देता है।',
  traditionNoteEn: 'North Indian Amavasya and Maharashtrian Purnima forms are both attested; use the local calendar and family tradition.',
  source: {
    referenceUrls: [
      'https://vishwakosh.marathi.gov.in/32242/',
      'https://www.gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer/RATNAGIRI/people_holidays.html',
      'https://betastate.bihar.gov.in/file_2/FileUpload/2025/Jun/09-Jun-2025/23/DyPage/d0e68745-f0ff-44e3-93c9-68b4dfbe5581.pdf',
    ],
    verificationNote: 'Verified 2026-08-26 against Marathi Vishwakosh, Maharashtra Gazetteer, and a Government of Bihar cultural publication: fruit/milk fasting and the Amavasya/Purnima regional split are attested.',
    variantNote: 'The profile preserves the regional calendar split.',
  },
});

const jivitputrikaBhog = profile({
  id: 'jivitputrika-bhog',
  titleHi: 'जीवित्पुत्रिका का नहाय-खाय और पारण',
  titleEn: 'Jivitputrika Nahai-Khai and parana',
  observanceIds: ['jivitputrika-vrat'],
  offerings: [item('regional-food', 'पारण का भोजन पहले देव-अर्पण करके प्रसाद रूप में लें।', 'Offer the parana meal first and then take it as prasad.')],
  permittedDuringFast: [item('nahai-khai', 'पहले दिन नहाय-खाय का स्वच्छ शाकाहारी भोजन; अगले दिन कठोर निर्जल व्रत।', 'The first day has a clean vegetarian Nahai-Khai meal; the next day is a strict waterless fast.')],
  abstainedDuringFast: [item('nirjala', 'मुख्य व्रत-दिन अन्न और जल।', 'Food and water on the main fasting day.')],
  paranaMealHi: 'अगली सुबह मुहूर्त में चावल-आटे का दलिया और खीरा, या क्षेत्रानुसार नोनी साग और मड़ुआ रोटी से पारण होता है।',
  paranaMealEn: 'The next-morning parana uses rice-flour porridge and cucumber, or regionally noni greens and madua roti.',
  traditionNoteHi: 'जीतिया बिहार, झारखण्ड, पूर्वी उत्तर प्रदेश और नेपाल में अलग भोजन-रूप रखता है; पारण सूची क्षेत्रीय है।',
  traditionNoteEn: 'Jitiya food differs across Bihar, Jharkhand, eastern Uttar Pradesh, and Nepal; the parana list is regional.',
  source: {
    referenceUrls: [
      `${UTSAV}/view-event/jivitputrika-vrat`,
      'https://betastate.bihar.gov.in/file_2/FileUpload/2025/Jun/09-Jun-2025/23/DyPage/d0e68745-f0ff-44e3-93c9-68b4dfbe5581.pdf',
    ],
    verificationNote: 'Verified 2026-08-26 against Bihar Tourism/Ministry of Tourism and a Government of Bihar publication: three-day structure, strict fasting, next-morning parana, and regional foods are directly attested.',
    variantNote: 'The named foods are presented as Bihar-area variants, not universal requirements.',
  },
});

const mahalakshmiVratBhog = profile({
  id: 'mahalakshmi-vrat-bhog',
  titleHi: 'महालक्ष्मी व्रत का सरल नैवेद्य',
  titleEn: 'Simple Mahalakshmi vrata naivedya',
  observanceIds: ['mahalakshmi-vrat'],
  offerings: [item('fruit-sweet', 'मां महालक्ष्मी को फल, नारियल और घर का सात्त्विक मिष्ठान्न अर्पित करें।', 'Offer fruit, coconut, and a household sattvik sweet to Maa Mahalakshmi.')],
  permittedDuringFast: [item('family-form', 'सोलह-दिवसीय या एक-दिवसीय पालन और भोजन-विधि क्षेत्र व परिवार से निश्चित करें।', 'Confirm the sixteen-day or one-day form and its food discipline with your regional and family tradition.')],
  traditionNoteHi: 'महाराष्ट्रीय ज्येष्ठा गौरी, उत्तर भारतीय महालक्ष्मी व्रत और दक्षिण भारतीय वरलक्ष्मी एक ही भोजन-विधि नहीं हैं।',
  traditionNoteEn: 'Maharashtrian Jyeshtha Gauri, North Indian Mahalakshmi vrata, and South Indian Varalakshmi do not share one food procedure.',
  source: {
    referenceUrls: [
      `${DP}/vrats/ashtami/durva-ashtami/durva-ashtami-date-time.html?lang=en`,
      'https://www.gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer/RATNAGIRI/people_holidays.html',
      'https://www.mahalaxmimandirpune.org/news-events.php',
    ],
    verificationNote: 'Verified 2026-08-26 against DrikPanchang, Maharashtra Gazetteer, and Shri Mahalaxmi Mandir Pune: the Bhadrapada Mahalakshmi observance and simple fruit/sweet temple offerings are attested; regional traditions remain separate.',
    variantNote: 'Varalakshmi retains a separate South Indian profile.',
  },
});

const purushottamMaasBhog = profile({
  id: 'purushottam-maas-bhog',
  titleHi: 'पुरुषोत्तम मास का भोजन-संकल्प',
  titleEn: 'Purushottam Maas food vow',
  observanceIds: ['purushottam-maas'],
  offerings: [item('krishna-offering', 'श्री पुरुषोत्तम कृष्ण को अपने संकल्प के अनुकूल सात्त्विक भोजन पहले अर्पित करें।', 'First offer Shri Purushottama Krishna the sattvik food allowed by your vow.')],
  permittedDuringFast: [item('forms', 'प्रकाशित रूपों में एक समय भोजन, रात्रि-भोजन, फलाहार या सरल हविष्य भोजन मिलते हैं।', 'Published forms include one meal, a night meal, fruit-fare, or simple havishya food.')],
  abstainedDuringFast: [item('vow-specific', 'जिस सामग्री का त्याग संकल्प में लिया हो, पूरे मास वही नियम रखें।', 'Keep throughout the month whatever ingredient renunciation was taken in the vow.')],
  traditionNoteHi: 'सम्प्रदायों की अनुमत और वर्जित सामग्री अलग है; एक सम्प्रदाय की विस्तृत सूची को सार्वभौम न मानें।',
  traditionNoteEn: 'Permitted and abstained ingredients differ by sampradaya; do not universalize one lineage’s detailed list.',
  source: {
    referenceUrls: [
      'https://www.sanatan.org/en/adhik-maas',
      'https://www.swaminarayan.org/festivals/prushottammas/',
      'https://bhaktivinodainstitute.org/the-glories-of-purusottama-masa/',
    ],
    verificationNote: 'Verified 2026-08-26 against Sanatan Sanstha, BAPS/Swaminarayan, and Bhaktivinoda Institute: one-meal, night-meal, fruit and havishya forms are attested, with materially different lineage lists.',
    variantNote: 'Only the concordant high-level forms are rendered.',
  },
});

const chaturmasaBhog = profile({
  id: 'chaturmasa-bhog',
  titleHi: 'चातुर्मास का आहार-संकल्प',
  titleEn: 'Chaturmasa food vow',
  observanceIds: ['chaturmasa'],
  offerings: [item('daily-thal', 'भोजन लेने से पहले अपने इष्ट को अर्पित करें।', 'Offer the meal to your chosen deity before eating.')],
  permittedDuringFast: [item('austerity', 'एक समय भोजन या अन्य व्रत केवल अपने सम्प्रदाय और क्षमता के अनुसार लें।', 'Adopt one-meal or another austerity only according to your sampradaya and capacity.')],
  abstainedDuringFast: [item('baps-rule', 'BAPS परम्परा में बैंगन, सफेद-लाल मूली, मोगरी और गन्ना छोड़ा जाता है।', 'In BAPS practice, brinjal, white and red radish, mogri, and sugarcane are abstained.')],
  traditionNoteHi: 'चातुर्मास के त्याग वैष्णव, स्वामिनारायण, जैन और क्षेत्रीय परम्पराओं में अलग हैं; दिखी सूची केवल BAPS रीति है।',
  traditionNoteEn: 'Chaturmasa renunciations differ across Vaishnava, Swaminarayan, Jain, and regional traditions; the shown list is specifically BAPS practice.',
  source: {
    referenceUrls: [
      'https://www.baps.org/Announcement/2025/Chaturmas-Niyams-2025-28720.aspx',
      `${DP}/calendars/hindu/months/chaturmasa/hindu-calendar-chaturmasa.html`,
      'https://ignca.gov.in/Asi_data/19776.pdf',
    ],
    verificationNote: 'Verified 2026-08-26 against BAPS, DrikPanchang/Dharma Sindhu summary, and IGNCA: Chaturmasa is a range with lineage-specific vows; the ingredient list is explicitly scoped to BAPS.',
    variantNote: 'No cross-sampradaya universal restriction list is claimed.',
  },
});

const weekdayVratBhog = profile({
  id: 'weekday-vrat-bhog',
  titleHi: 'वार-व्रत का भोजन और अर्पण',
  titleEn: 'Weekday vrata food and offering',
  observanceIds: ['navagraha-weekday-fasts', 'deity-weekday-fasts'],
  offerings: [item('chosen-deity', 'जिस ग्रह या देवता का संकल्प हो, उसी की प्रकाशित विधि का फल, पुष्प या नैवेद्य अर्पित करें।', 'Offer the fruit, flowers, or naivedya prescribed for the planet or deity named in your vow.')],
  permittedDuringFast: [item('forms', 'वार-व्रत में एक समय भोजन, फलाहार और पूर्ण उपवास—तीनों रूप मिलते हैं।', 'Weekday vratas include one-meal, fruit-fare, and complete-fast forms.')],
  traditionNoteHi: 'एक ही वार अलग क्षेत्रों में ग्रह, देवता या गुरु से जुड़ सकता है; रंग या भोजन की एक सार्वभौम तालिका विश्वसनीय नहीं है।',
  traditionNoteEn: 'One weekday may be linked to a planet, deity, or guru in different regions; a universal colour-and-food table would be unreliable.',
  source: {
    referenceUrls: [
      'https://www.gazetteers.maharashtra.gov.in/cultural.maharashtra.gov.in/english/gazetteer/parbhani/chapters/people/main_frame.htm',
      `${DP}/vrats/weekdays/deities-weekdays-fasting.html`,
      'https://www.trimbakeshwar.org/articles/Which-days-are-for-which-Hindu-Gods',
    ],
    verificationNote: 'Verified 2026-08-26 against Maharashtra Gazetteer, DrikPanchang’s Saptavara corpus, and Trimbakeshwar temple guidance: weekday mappings and fasting forms vary, so only the safe selection rule is rendered.',
    variantNote: 'The profile explicitly refuses a fabricated universal planet-food matrix.',
  },
});

const dashavataraBhog = profile({
  id: 'dashavatara-bhog',
  titleHi: 'दशावतार व्रत का नैवेद्य',
  titleEn: 'Dashavatara vrata naivedya',
  observanceIds: ['dashavatara-vrat'],
  offerings: [item('grain-ghee', 'व्रतराज की प्रकाशित विधि में थोड़े अन्न के आटे से घी में बना नैवेद्य अर्पित होता है।', 'The published Vrataraja procedure offers a small grain-flour preparation cooked in ghee.')],
  permittedDuringFast: [item('vrat-form', 'दिन के व्रत का रूप अपनी वैष्णव परम्परा से निश्चित करें।', 'Confirm the daytime fast form with your Vaishnava tradition.')],
  traditionNoteHi: 'दस वर्षों के दस अलग पकवान एक दीर्घ उद्यापन-विधि हैं; ऐप उन्हें एक दिन की खरीदारी सूची नहीं बनाता।',
  traditionNoteEn: 'The ten foods across ten years belong to a long observance cycle; the app does not turn them into a one-day shopping list.',
  source: {
    referenceUrls: [
      `${DP}/vrats/dashami/dashavatara/dashavatara-vrat-date-time.html?lang=en&year=2024`,
      'https://www.hindu-blog.com/2010/09/dashavatar-dasami-vrat-dasavatar-vrat.html',
      'https://nationalmuseumindia.gov.in/uploads/collections/1611212140_Dashavatara%20or%20Avatars%20of%20Vishnu.pdf',
    ],
    verificationNote: 'Verified 2026-08-26 against DrikPanchang/Vrataraja, an independent observance reference, and National Museum context: grain-flour naivedya and Vishnu’s ten forms are attested without flattening the ten-year cycle.',
    variantNote: 'The exact annual preparations remain review metadata, not a required menu.',
  },
});

const gangaurBhog = profile({
  id: 'gangaur-bhog',
  titleHi: 'गणगौर का व्रत और अर्पण',
  titleEn: 'Gangaur fast and offering',
  observanceIds: ['gangaur'],
  offerings: [item('sweet-fruit', 'ईसर-गौरी को फल या परिवार की राजस्थानी परम्परा का मिष्ठान्न अर्पित करें।', 'Offer Isar-Gauri fruit or the sweet followed in your Rajasthani household tradition.')],
  permittedDuringFast: [item('one-meal', 'प्रकाशित राजस्थान परम्परा में अठारह दिनों तक एक समय भोजन रखा जाता है।', 'The published Rajasthan tradition keeps one meal daily through the eighteen-day observance.')],
  traditionNoteHi: 'सिंजारा की मिठाई उपहार है; उसे हर दिन का अनिवार्य नैवेद्य न मानें।',
  traditionNoteEn: 'Sinjara sweets are gifts; they are not a required daily naivedya.',
  source: {
    referenceUrls: [
      `${UTSAV}/view-event/gangaur-festival-1`,
      `${UTSAV}/view-event/gangaur-festival`,
      'https://www.tourism.rajasthan.gov.in/',
    ],
    verificationNote: 'Verified 2026-08-26 against two Ministry of Tourism/Rajasthan Tourism event records and the organizing department: the one-meal form, wheat-grass ritual, and Sinjara sweets are directly attested.',
    variantNote: 'Gift food and deity offering remain separate.',
  },
});

const jayaparvatiBhog = profile({
  id: 'jayaparvati-bhog',
  titleHi: 'जयापार्वती व्रत का अलूणा भोजन',
  titleEn: 'Jayaparvati salt-free vrata food',
  observanceIds: ['jayaparvati-vrat'],
  offerings: [item('fruit-coconut', 'मां पार्वती को ऋतुफल और नारियल अर्पित करें।', 'Offer seasonal fruit and coconut to Maa Parvati.')],
  permittedDuringFast: [item('fruit-dairy', 'फल, दूध, दही, मेवे या दूध से बना सरल अलूणा भोजन।', 'Fruit, milk, curd, nuts, or a simple salt-free milk preparation.')],
  abstainedDuringFast: [item('salt-grain', 'पांच दिनों में नमक; कई गुजराती परम्पराओं में गेहूँ और सामान्य अन्न भी।', 'Salt for five days; in many Gujarati traditions, wheat and ordinary grains as well.')],
  paranaMealHi: 'अन्तिम पूजा के बाद नमक, गेहूँ की रोटी और सब्जी वाले भोजन से व्रत पूरा करने की गुजराती परम्परा है।',
  paranaMealEn: 'A Gujarati conclusion uses a meal with salt, wheat roti, and vegetables after the final worship.',
  traditionNoteHi: 'अलूणा की सीमा परिवार से बदलती है; नमक-त्याग साझा है पर पूरी अन्न-सूची सार्वभौम नहीं।',
  traditionNoteEn: 'The scope of aluna varies by household; salt abstention is common, but the full grain list is not universal.',
  source: {
    referenceUrls: [
      'https://www.baps.org/Calendar.aspx',
      'https://www.shrimadbhagvatam.org/vrat-katha/jaya-parvati/',
      'https://ebooks.tirumala.org/download?id=25105',
    ],
    verificationNote: 'Verified 2026-08-26 against BAPS calendar, an independent published procedure, and TTD Sapthagiri: the five-day Gujarati vrat, salt-free food, fruit/coconut, and salted wheat conclusion are attested.',
    variantNote: 'Grain abstention is described as common rather than universal.',
  },
});

const shitalaBhog = profile({
  id: 'shitala-bhog',
  titleHi: 'शीतला सप्तमी का ठंडा भोग',
  titleEn: 'Shitala Saptami cool bhog',
  observanceIds: ['shitala-saptami'],
  offerings: [item('previous-day-food', 'क्षेत्रीय शीतला परम्परा में भोजन एक दिन पहले पकाकर ठंडा होने पर अर्पित किया जाता है।', 'In the regional Shitala tradition, food is cooked the previous day and offered after it cools.')],
  abstainedDuringFast: [item('no-fresh-fire', 'पूजा-दिन नया गरम भोजन पकाना उस परम्परा में नहीं किया जाता।', 'That tradition does not cook a fresh hot meal on the worship day.')],
  traditionNoteHi: 'बंगाल की शीतल षष्ठी, गुजरात की शीतला सातम और राजस्थान की बसोड़ा तिथियां और पकवान अलग हैं।',
  traditionNoteEn: 'Bengal Shitala Shashti, Gujarat Shitala Satam, and Rajasthan Basoda differ in date and dishes.',
  source: {
    referenceUrls: [
      'https://nchm.gov.in/sites/default/files/2025-01/Indian_Food_Heritage.pdf',
      'https://censusindia.gov.in/nada/index.php/catalog/30162/download/33343/23370_1961_FAI.pdf',
    ],
    verificationNote: 'Verified 2026-08-26 against Government of India NCHMCT and Census of India festival records: previous-day cooking, cool offering, and regional date/name differences are directly attested.',
    variantNote: 'No specific cold dish is universalized.',
  },
});

const bachhBarasBhog = profile({
  id: 'bachh-baras-bhog',
  titleHi: 'बछ बारस का गौ-अर्पण और भोजन',
  titleEn: 'Bachh Baras cow offering and food',
  observanceIds: ['bachh-baras'],
  offerings: [item('cow-feed', 'गाय और बछड़े को भीगा चना, मूंग या हरा चारा अर्पित करें।', 'Offer soaked gram, mung, or green fodder to the cow and calf.')],
  permittedDuringFast: [item('regional-food', 'राजस्थानी रूप में बाजरा, मोठ, चना या बेसन से बना भोजन लिया जाता है।', 'The Rajasthani form uses foods made from bajra, moth beans, gram, or besan.')],
  abstainedDuringFast: [item('cow-milk-grain', 'राजस्थानी रूप में गाय का दूध-दही, गेहूँ और चावल नहीं लिया जाता।', 'The Rajasthani form abstains from cow milk/curd, wheat, and rice.')],
  traditionNoteHi: 'महाराष्ट्र की वसु बारस और राजस्थान की बछ बारस में भोजन-विधि अलग हो सकती है; यह राजस्थानी रूप है।',
  traditionNoteEn: 'Maharashtrian Vasu Baras and Rajasthani Bachh Baras may differ in food practice; this is the Rajasthani form.',
  source: {
    referenceUrls: [
      `${UTSAV}/public/view-event/bach-baras-1`,
      `${DP}/festivals/bachha-baras/bachha-baras-dwadashi-date-time.html`,
      'https://sanskara.in/rituals/bachwaaras?ln=en',
    ],
    verificationNote: 'Verified 2026-08-26 against Ministry of Tourism Utsav, DrikPanchang, and an independent regional ritual record: cow/calf worship and the Rajasthan food restrictions are concordant.',
    variantNote: 'The restrictions are explicitly labelled Rajasthani and are not applied to Vasu Baras everywhere.',
  },
});

export const EXTENDED_BHOG_CONTENT: readonly BhogContentEntry[] = [
  hartalikaTeejBhog,
  hariyaliTeejBhog,
  kajariTeejBhog,
  bahulaChaturthiBhog,
  bhadwaChauthBhog,
  rishiPanchamiBhog,
  durvaAshtamiBhog,
  anantChaturdashiBhog,
  kojagaraBhog,
  ahoiAshtamiBhog,
  chhathBhog,
  akshayaNavamiBhog,
  pradoshBhog,
  dwadashiBhog,
  recurringShivaBhog,
  pitruOffering,
  skandaSashtiBhog,
  deviVratBhog,
  kalashtamiBhog,
  krishnaMonthlyBhog,
  mangalaGauriBhog,
  varalakshmiBhog,
  vatSavitriBhog,
  jivitputrikaBhog,
  mahalakshmiVratBhog,
  purushottamMaasBhog,
  chaturmasaBhog,
  weekdayVratBhog,
  dashavataraBhog,
  gangaurBhog,
  jayaparvatiBhog,
  shitalaBhog,
  bachhBarasBhog,
];

import type { VidhiEntry } from './types';

const DRIK_KARWA =
  'https://www.drikpanchang.com/festivals/karwa-chauth/info/karwa-chauth-puja-vidhi.html';

/** करवा चौथ पूजन — North-Indian Karak Chaturthi household observance. */
export const karwaChauthPuja: VidhiEntry = {
  id: 'karwa-chauth-puja',
  titleHi: 'करवा चौथ पूजन',
  titleEn: 'Karwa Chauth Pujan',
  festivalIds: ['karwa-chauth'],
  deities: ['parvati', 'shiva', 'ganesha', 'kartikeya'],
  conventionLineHi: 'उत्तर भारतीय करक चतुर्थी परम्परा',
  conventionLineEn: 'North Indian Karak Chaturthi tradition',
  durationHintMin: 30,
  samagri: [
    { itemHi: 'मिट्टी या धातु का करवा', itemEn: 'Earthen or metal karwa', qty: '1' },
    { itemHi: 'करवा का ढक्कन व टोंटी', itemEn: 'Karwa lid and spout' },
    { itemHi: 'गौरा/चौथ माता का चित्र', itemEn: 'Picture of Gaura/Chauth Mata' },
    { itemHi: 'शिव परिवार का चित्र', itemEn: 'Picture of Shiva family', optional: true },
    { itemHi: 'चौकी व लाल वस्त्र', itemEn: 'Chowki & red cloth' },
    { itemHi: 'रोली · कुमकुम · सिन्दूर · अक्षत', itemEn: 'Roli · kumkum · sindoor · akshat' },
    { itemHi: 'मौली', itemEn: 'Mauli' },
    { itemHi: 'पुष्प', itemEn: 'Flowers' },
    { itemHi: 'धूप · दीप · घी · बाती', itemEn: 'Dhoop · lamp · ghee · wick' },
    { itemHi: 'फल · मिठाई · पूरी/हलवा', itemEn: 'Fruit · sweets · puri/halwa' },
    { itemHi: 'जल या दूध', itemEn: 'Water or milk' },
    { itemHi: 'चन्द्र अर्घ्य का लोटा', itemEn: 'Lota for moon arghya' },
    { itemHi: 'छलनी', itemEn: 'Sieve', optional: true },
    { itemHi: 'दान के लिए वस्त्र/दक्षिणा', itemEn: 'Cloth/dakshina for donation', optional: true },
  ],
  steps: [
    {
      id: 'pratah-sankalp', phase: 'prep', titleHi: 'प्रातः व्रत-संकल्प', titleEn: 'Morning vrat sankalp',
      instructionHi: 'स्नान के बाद अपने स्वास्थ्य और पारिवारिक परम्परा के अनुरूप व्रत का संकल्प लें और चन्द्र-दर्शन के बाद पारण का निश्चय करें।',
      instructionEn: 'After bathing, take the vrat sankalp according to your health and family tradition, resolving to conclude it after moon sighting.',
    },
    {
      id: 'vedi-sajja', phase: 'prep', titleHi: 'पूजा वेदी सज्जा', titleEn: 'Prepare the puja altar',
      instructionHi: 'चौकी पर लाल वस्त्र बिछाकर गौरा या चौथ माता तथा शिव परिवार का चित्र स्थापित करें; सामने अक्षत का छोटा मंडल बनाएँ।',
      instructionEn: 'Cover the chowki with red cloth, place Gaura or Chauth Mata and the Shiva family image, and make a small akshat mandala in front.',
    },
    {
      id: 'karwa-thali', phase: 'prep', titleHi: 'करवा व थाली तैयार करें', titleEn: 'Prepare the karwa and thali',
      instructionHi: 'करवे में जल या दूध भरकर मौली बाँधें; ढक्कन पर रोली-अक्षत, फल, मिठाई और पूजा की थाली सजाएँ।',
      instructionEn: 'Fill the karwa with water or milk and tie mauli around it; arrange roli-akshat, fruit, sweets and the puja thali on its lid.',
    },
    {
      id: 'deep-ganesh', phase: 'main', titleHi: 'दीप व गणेश पूजन', titleEn: 'Lamp and Ganesha worship',
      instructionHi: 'दीप जलाकर श्री गणेश का स्मरण करें और गन्ध, पुष्प, अक्षत तथा नैवेद्य अर्पित कर पूजा निर्विघ्न होने की प्रार्थना करें।',
      instructionEn: 'Light the lamp, remember Shri Ganesha, and offer fragrance, flowers, akshat and naivedya while praying for an unobstructed puja.',
    },
    {
      id: 'gaura-puja', phase: 'main', titleHi: 'गौरा व चौथ माता पूजन', titleEn: 'Gaura and Chauth Mata puja',
      instructionHi: 'गौरा और चौथ माता रूप में माँ पार्वती को रोली, सिन्दूर, अक्षत, पुष्प और नैवेद्य अर्पित करें।',
      instructionEn: 'Worship Maa Parvati as Gaura and Chauth Mata with roli, sindoor, akshat, flowers and naivedya.',
    },
    {
      id: 'shiva-parivar', phase: 'main', titleHi: 'शिव परिवार पूजन', titleEn: 'Shiva family worship',
      instructionHi: 'क्रम से भगवान शिव, कार्तिकेय और श्री गणेश को पुष्प, अक्षत और नैवेद्य अर्पित करें।',
      instructionEn: 'Offer flowers, akshat and naivedya in order to Lord Shiva, Kartikeya and Shri Ganesha.',
    },
    {
      id: 'karwa-offering', phase: 'main', titleHi: 'करवा अर्पण', titleEn: 'Offer the karwa',
      instructionHi: 'भरे हुए करवे पर रोली-अक्षत लगाकर उसे चौथ माता के सम्मुख रखें और परिवार के सौभाग्य व मंगल की प्रार्थना करें।',
      instructionEn: 'Apply roli and akshat to the filled karwa, place it before Chauth Mata, and pray for the family’s well-being.',
    },
    {
      id: 'katha', phase: 'main', titleHi: 'करवा चौथ व्रत कथा', titleEn: 'Karwa Chauth vrat katha',
      instructionHi: 'समूह या परिवार के साथ करवा चौथ व्रत कथा सुनें; कथा के समय करवा और पूजा-थाली अपने सामने रखें।',
      instructionEn: 'Listen to the Karwa Chauth vrat katha with the group or family, keeping the karwa and puja thali before you.',
      ref: { kind: 'katha', id: 'karwa-chauth-vrat-katha' },
    },
    {
      id: 'thali-phera', phase: 'main', titleHi: 'थाली फेरना व आशीर्वाद', titleEn: 'Pass the thali and receive blessings',
      instructionHi: 'पारिवारिक रीति हो तो गीत या कथा के साथ पूजा-थाली फेरें और परिवार की वरिष्ठ सुहागिनों का आशीर्वाद लें।',
      instructionEn: 'Where followed in the family, pass the puja thali with the traditional song or story and receive blessings from senior married women.',
    },
    {
      id: 'karwa-dana', phase: 'main', titleHi: 'करवा दान', titleEn: 'Karwa dana',
      instructionHi: 'परम्परा अनुसार करवा, वस्त्र या दक्षिणा किसी ब्राह्मण अथवा पात्र सुहागिन को सम्मानपूर्वक अर्पित करें।',
      instructionEn: 'According to tradition, respectfully offer the karwa, cloth or dakshina to a Brahmin or an eligible married woman.',
    },
    {
      id: 'chandra-arghya', phase: 'closing', titleHi: 'चन्द्र-दर्शन व अर्घ्य', titleEn: 'Moon sighting & arghya',
      instructionHi: 'चन्द्रमा उदय होने पर दर्शन करें, लोटे से धीरे-धीरे जल का अर्घ्य दें और दीप दिखाकर प्रणाम करें। छलनी का प्रयोग केवल अपनी पारिवारिक रीति हो तो करें।',
      instructionEn: 'After moonrise, view the Moon, pour water slowly as arghya, show the lamp and bow. Use a sieve only if it belongs to your family custom.',
    },
    {
      id: 'parana-prasad', phase: 'closing', titleHi: 'पारण व प्रसाद', titleEn: 'Parana & prasad',
      instructionHi: 'पारिवारिक रीति अनुसार जल ग्रहण कर व्रत खोलें, चौथ माता को प्रणाम करें और प्रसाद बाँटें। स्वास्थ्य की आवश्यकता को व्रत से ऊपर रखें।',
      instructionEn: 'According to family custom, receive water and conclude the fast, bow to Chauth Mata, and share prasad. Put health needs before fasting rules.',
    },
  ],
  source: {
    canonicalEdition: 'Dharmasindhu, Nirnayasindhu and Vratraj — Karak Chaturthi sections',
    canonicalEditionUrls: [
      'https://archive.org/search?query=dharmasindhu+karak+chaturthi',
      'https://archive.org/search?query=vratraj+karak+chaturthi',
    ],
    canonicalEditionStatus: 'PENDING — the named Sanskrit/Hindi editions have not yet been opened and collated in this workspace; exact sankalpa and dana mantras remain omitted.',
    referenceUrls: [
      DRIK_KARWA,
      'https://www.narayanseva.org/hi/is-tarah-se-manaen-karava-chauth-parv/',
    ],
    retrievedOn: '2026-08-13',
    notes: 'DrikPanchang explicitly grounds the observance in Dharmasindhu, Nirnayasindhu and Vratraj and names Parvati-first Shiva-family worship, katha, karwa dana and moonrise completion. Narayan Seva independently confirms the morning sankalpa, prepared karwa, Parvati-Shiva-Ganesha worship, katha, moon arghya and parana sequence. Regional customs such as the sieve and thali rotation are marked conditional rather than universal.',
  },
};

import type { VidhiEntry } from './types';

const DRIK_GHATA =
  'https://www.drikpanchang.com/navratri/info/ghatasthapana-puja-vidhi.html';

/** नवरात्रि घटस्थापना — grain-bed kalash installation and day-one worship. */
export const navratriGhatasthapana: VidhiEntry = {
  id: 'navratri-ghatasthapana',
  titleHi: 'नवरात्रि घटस्थापना',
  titleEn: 'Navratri Ghatasthapana',
  festivalIds: ['navratri-start'],
  deities: ['durga'],
  conventionLineHi: 'शारदीय नवरात्रि गृह घटस्थापना',
  conventionLineEn: 'Sharad Navratri household Ghatasthapana',
  durationHintMin: 40,
  samagri: [
    { itemHi: 'चौड़ा मिट्टी का पात्र', itemEn: 'Wide earthen pot', qty: '1' },
    { itemHi: 'स्वच्छ मिट्टी', itemEn: 'Clean soil' },
    { itemHi: 'सप्तधान्य या जौ', itemEn: 'Seven grains or barley seeds' },
    { itemHi: 'ताम्र/पीतल/मिट्टी का कलश', itemEn: 'Copper/brass/clay kalash', qty: '1' },
    { itemHi: 'गंगाजल या शुद्ध जल', itemEn: 'Gangajal or clean water' },
    { itemHi: 'सुपारी · सिक्का · अक्षत · दूर्वा · इत्र', itemEn: 'Betel nut · coin · akshat · durva · perfume' },
    { itemHi: 'आम या अशोक के पाँच पत्ते', itemEn: 'Five mango or Ashoka leaves' },
    { itemHi: 'कलश का ढक्कन या कटोरी', itemEn: 'Kalash lid or small bowl' },
    { itemHi: 'साबुत नारियल', itemEn: 'Whole coconut', qty: '1' },
    { itemHi: 'लाल वस्त्र व मौली', itemEn: 'Red cloth & mauli' },
    { itemHi: 'कुमकुम · हल्दी · चन्दन', itemEn: 'Kumkum · turmeric · chandan' },
    { itemHi: 'पुष्प व माला', itemEn: 'Flowers & garland' },
    { itemHi: 'धूप · दीप · घी/तेल · बाती', itemEn: 'Dhoop · lamp · ghee/oil · wick' },
    { itemHi: 'फल व मिठाई', itemEn: 'Fruit & sweets' },
    { itemHi: 'माँ दुर्गा का चित्र', itemEn: 'Picture of Maa Durga', optional: true },
  ],
  steps: [
    {
      id: 'muhurat-sthana', phase: 'prep', titleHi: 'मुहूर्त व स्थान', titleEn: 'Choose the muhurat and place',
      instructionHi: 'पञ्चाङ्ग में अपने नगर का घटस्थापना मुहूर्त देखें और दिन के पहले भाग में स्वच्छ पूजा स्थान तैयार करें; रात्रि में स्थापना न करें।',
      instructionEn: 'Check the city-specific Ghatasthapana muhurat in Panchang and prepare a clean shrine during the first part of the day; do not install the kalash at night.',
    },
    {
      id: 'samagri-sajja', phase: 'prep', titleHi: 'सामग्री सज्जा', titleEn: 'Arrange the materials',
      instructionHi: 'मिट्टी, बीज, कलश, जल, पत्ते, नारियल, वस्त्र और पाँच उपचार एक साथ रख लें ताकि स्थापना बीच में न रुके।',
      instructionEn: 'Arrange the soil, seeds, kalash, water, leaves, coconut, cloth and five offerings together so the installation is not interrupted.',
    },
    {
      id: 'sankalp', phase: 'prep', titleHi: 'नवरात्रि संकल्प', titleEn: 'Navratri sankalp',
      instructionHi: 'जल, अक्षत और पुष्प लेकर नौ दिनों की देवी-आराधना, संयम और परिवार के मंगल का संकल्प लें।',
      instructionEn: 'Hold water, akshat and a flower and resolve to observe nine days of Devi worship, self-discipline and prayer for the family’s well-being.',
    },
    {
      id: 'mrida-prathama', phase: 'main', titleHi: 'मिट्टी की पहली परत', titleEn: 'First layer of soil',
      instructionHi: 'चौड़े पात्र में स्वच्छ मिट्टी की पहली परत बिछाकर उस पर सप्तधान्य या जौ समान रूप से फैलाएँ।',
      instructionEn: 'Spread the first layer of clean soil in the wide pot and distribute the seven grains or barley evenly over it.',
    },
    {
      id: 'dhanya-parata', phase: 'main', titleHi: 'धान्य की तीन परतें', titleEn: 'Build the grain bed',
      instructionHi: 'मिट्टी और बीज की दूसरी परत किनारों पर, फिर मिट्टी की तीसरी परत बिछाएँ; जमाने भर के लिए थोड़ा जल छिड़कें।',
      instructionEn: 'Add a second soil-and-seed layer near the rim, then a final soil layer; sprinkle only enough water to settle it.',
    },
    {
      id: 'kalash-jala', phase: 'main', titleHi: 'कलश में जल भरें', titleEn: 'Fill the kalash',
      instructionHi: 'कलश के कण्ठ पर मौली बाँधें, उसमें शुद्ध जल भरकर सुपारी, सिक्का, अक्षत, दूर्वा और थोड़ा इत्र डालें।',
      instructionEn: 'Tie mauli around the kalash neck, fill it with clean water, and add betel nut, a coin, akshat, durva and a little perfume.',
    },
    {
      id: 'patra-dhakkana', phase: 'main', titleHi: 'पत्ते व ढक्कन', titleEn: 'Arrange leaves and lid',
      instructionHi: 'कलश के मुख पर पाँच आम या अशोक के पत्ते रखें, ढक्कन या कटोरी रखकर उस पर अक्षत भरें।',
      instructionEn: 'Arrange five mango or Ashoka leaves at the mouth, place the lid or small bowl over them, and fill it with akshat.',
    },
    {
      id: 'narikela', phase: 'main', titleHi: 'नारियल तैयार करें', titleEn: 'Prepare the coconut',
      instructionHi: 'साबुत नारियल को लाल वस्त्र में लपेटकर मौली से बाँधें और उसका शीर्ष ऊपर रखते हुए ढक्कन पर रखें।',
      instructionEn: 'Wrap the whole coconut in red cloth, secure it with mauli, and place it upright over the lid.',
    },
    {
      id: 'ghata-sthapana', phase: 'main', titleHi: 'घट स्थापना', titleEn: 'Install the ghata',
      instructionHi: 'तैयार कलश को बोए हुए धान्य-पात्र के मध्य स्थिर रखें, कुमकुम-चन्दन का तिलक करें और पुष्प-माला अर्पित करें।',
      instructionEn: 'Set the prepared kalash firmly in the centre of the grain bed, apply kumkum and chandan, and offer flowers and a garland.',
    },
    {
      id: 'durga-avahana', phase: 'main', titleHi: 'माँ दुर्गा का आवाहन', titleEn: 'Invoke Maa Durga',
      instructionHi: 'हाथ में अक्षत-पुष्प लेकर माँ दुर्गा से नौ दिनों तक कलश में विराजने और पूजा स्वीकार करने की प्रार्थना करें।',
      instructionEn: 'Hold akshat and flowers and request Maa Durga to reside in the kalash and accept the worship through the nine nights.',
    },
    {
      id: 'panchopachara', phase: 'main', titleHi: 'पञ्चोपचार पूजा', titleEn: 'Panchopachara puja',
      instructionHi: 'क्रम से गन्ध, पुष्प, धूप, दीप और फल-मिठाई का नैवेद्य अर्पित करें।',
      instructionEn: 'Offer the five upacharas in order: fragrance, flowers, dhoop, dipa, and fruit or sweets as naivedya.',
    },
    {
      id: 'devi-stuti', phase: 'main', titleHi: 'या देवी सर्वभूतेषु — देवी स्तुति', titleEn: 'Ya Devi Sarvabhuteshu — Devi stuti',
      instructionHi: 'हाथ जोड़कर देवी महात्म्य की "या देवी सर्वभूतेषु" स्तुति का पाठ करें — शक्ति रूप में विराजमान देवी की वन्दना।',
      instructionEn: 'With folded hands, recite the "Ya Devi Sarvabhuteshu" stuti from the Devi Mahatmya — salutations to the Goddess who resides in all beings as Shakti.',
      ref: { kind: 'section', id: 'durga-stotram' },
    },
    {
      id: 'day-one-katha', phase: 'main', titleHi: 'नवरात्रि आरम्भ पाठ', titleEn: 'Navratri opening reading',
      instructionHi: 'परिवार सहित नवरात्रि आरम्भ की कथा पढ़ें और पहले दिन माँ शैलपुत्री का स्मरण करें।',
      instructionEn: 'Read the Navratri opening story with the family and remember Maa Shailaputri on the first day.',
      ref: { kind: 'katha', id: 'navratri-start-katha' },
    },
    {
      id: 'aarti', phase: 'closing', titleHi: 'माँ दुर्गा की आरती', titleEn: 'Maa Durga aarti',
      instructionHi: 'दीप से आरती करें और परिवार सहित जय अम्बे गौरी गाएँ।',
      instructionEn: 'Offer aarti with the lamp and sing Jai Ambe Gauri with the family.',
      ref: { kind: 'section', id: 'jai-ambe-gauri' },
    },
    {
      id: 'nava-dina-seva', phase: 'closing', titleHi: 'नौ दिनों की सेवा', titleEn: 'Care through the nine days',
      instructionHi: 'प्रतिदिन थोड़ा जल देकर अंकुर नम रखें और दीप केवल सुरक्षित निगरानी में जलाएँ। दशमी पर परिवार की परम्परा अनुसार घट का विसर्जन करें।',
      instructionEn: 'Moisten the sprouts lightly each day and keep a lamp burning only under safe supervision. On Dashami, conclude and immerse the ghata according to family tradition.',
    },
  ],
  source: {
    canonicalEdition: 'Gita Press Nitya Karma Puja Prakash — Kalash Sthapana and Devi Puja chapters',
    canonicalEditionUrls: ['https://archive.org/details/NityaKarmaPujaPrakashGitaPressGorakhpur'],
    canonicalEditionStatus: 'VERIFIED 2026-08-19 — opened Gita Press code 592, Nitya Karma Puja Prakash (Vikrama Samvat 2072, twelfth reprint), confirmed the publisher imprint, and collated the Kalash Sthapana chapter (printed page 202 onward) against the kalash-worship spine of this instruction-only sequence. Variable ghatasthapana mantras remain intentionally omitted.',
    referenceUrls: [DRIK_GHATA, 'https://www.vedkosh.com/festivals/ghatasthapana'],
    retrievedOn: '2026-08-19',
    notes: 'The canonical chapter confirms the kalash placement and worship sequence. The physical three-layer grain bed, filled kalash, leaves, wrapped coconut, Devi avahana and Panchopachara sequence also agrees across both cited procedures. The entry avoids unattended-flame instructions and keeps variable sankalpa/mantra wording instruction-only. 2026-08-14: a Devi-stuti step now hands off to the shipped, verified durga-stotram section ("Ya Devi Sarvabhuteshu", Devi Mahatmya ch. 5) — reference, never re-typed (§11.11/PRD-19 §3.3).',
  },
};

import type { VidhiEntry } from './types';

const GITA_PRESS_NITYA_KARMA =
  'https://archive.org/details/NityaKarmaPujaPrakashGitaPressGorakhpur';
const DHARMA_SINDHU_SHRADDHA =
  'https://www.kamakoti.org/kamakoti/dharmasindhu/bookview.php?chapnum=26';
const DRIK_SHRADDHA_DATES =
  'https://www.drikpanchang.com/shraddha/pitru-paksha-shraddha-dates.html';
const DRIK_SHRADDHA_DAYS =
  'https://www.drikpanchang.com/shraddha/info/shraddha-days.html';

/**
 * A deliberately narrow household tila-tarpana remembrance guide.
 *
 * This is not presented as a complete parvana-shraddha. Branch-specific
 * orientation, sacred-thread positions, addressee order and every formula are
 * left to the family's tradition or officiant; no mantra is approximated.
 */
export const shraddhaTarpanVidhi: VidhiEntry = {
  id: 'shraddha-tarpan-vidhi',
  titleHi: 'पितृ तिल-तर्पण स्मरण',
  titleEn: 'Pitru Tila-Tarpana Remembrance',
  anchor: 'personal-tithi',
  festivalIds: [],
  deities: [],
  conventionLineHi: 'गृहस्थ तिल-तर्पण की सीमित, मन्त्र-रहित स्मरण मार्गदर्शिका',
  conventionLineEn: 'A limited, mantra-free household tila-tarpana remembrance guide',
  durationHintMin: 20,
  samagri: [
    { itemHi: 'शुद्ध जल', itemEn: 'Clean water' },
    { itemHi: 'स्वच्छ तर्पण पात्र', itemEn: 'Clean offering vessel' },
    { itemHi: 'अर्पित जल समेटने के लिए अलग पात्र या थाली', itemEn: 'Separate bowl or tray to collect the offered water' },
    { itemHi: 'काला तिल', itemEn: 'Black sesame' },
    { itemHi: 'कुश या दर्भ', itemEn: 'Kusha or darbha', optional: true },
    { itemHi: 'स्वच्छ आसन', itemEn: 'Clean seat or mat' },
    { itemHi: 'साफ कपड़ा', itemEn: 'Clean cloth' },
    { itemHi: 'पुष्प', itemEn: 'Flowers', optional: true },
  ],
  steps: [
    {
      id: 'scope',
      phase: 'prep',
      titleHi: 'इस मार्गदर्शिका की सीमा',
      titleEn: 'Know the scope of this guide',
      instructionHi: 'यह घर पर किया जाने वाला सीमित तिल-तर्पण स्मरण है, सम्पूर्ण श्राद्ध नहीं। पिण्डदान, होम, भोजन और शाखा-विशेष विधान के लिए अपनी पारिवारिक परम्परा या योग्य आचार्य का मार्गदर्शन लें।',
      instructionEn: 'This is a limited household tila-tarpana remembrance, not a complete Shraddha. Follow your family tradition or a qualified officiant for pinda, homa, bhojana and branch-specific rites.',
    },
    {
      id: 'time-and-tradition',
      phase: 'prep',
      titleHi: 'तिथि और पारिवारिक रीति देखें',
      titleEn: 'Confirm the date and family practice',
      instructionHi: 'पुण्यतिथि या पितृ पक्ष की दिखाई गई तिथि देखें। परिवार में समय, दिशा या विधान निश्चित हो तो उसी को प्राथमिकता दें; यह मार्गदर्शिका उनका स्थान नहीं लेती।',
      instructionEn: 'Confirm the displayed annual or Pitru Paksha date. Give priority to any timing, direction or method followed by your family; this guide does not replace it.',
    },
    {
      id: 'prepare-place',
      phase: 'prep',
      titleHi: 'स्वच्छ स्थान तैयार करें',
      titleEn: 'Prepare a clean place',
      instructionHi: 'शान्त, स्वच्छ स्थान पर आसन रखें। जल चढ़ाने वाला पात्र और अर्पित जल समेटने का पात्र अलग रखें; इस संक्षिप्त विधि में अग्नि या जलाशय की आवश्यकता नहीं है।',
      instructionEn: 'Set a seat in a quiet, clean place. Keep the offering vessel separate from the bowl that will collect the water; this concise guide needs neither a flame nor a water body.',
    },
    {
      id: 'sankalpa-marker',
      phase: 'prep',
      titleHi: 'स्मरण का संकल्प',
      titleEn: 'Set the remembrance intention',
      instructionHi: 'जिन पितरों का स्मरण कर रहे हैं, उन्हें मन में याद करें। नाम, गोत्र और संकल्प-वाक्य केवल अपनी पारिवारिक रीति के अनुसार बोलें; यहाँ कोई निश्चित मन्त्र या सूत्र नहीं दिया गया है।',
      instructionEn: 'Bring to mind the ancestors being remembered. State names, gotra or a sankalpa formula only according to your family practice; this guide supplies no fixed mantra or formula.',
    },
    {
      id: 'prepare-tila-water',
      phase: 'main',
      titleHi: 'तिल-जल तैयार करें',
      titleEn: 'Prepare sesame water',
      instructionHi: 'स्वच्छ जल में थोड़ा काला तिल रखें। कुश या दर्भ का प्रयोग केवल तभी करें जब वह आपकी पारिवारिक रीति में हो और उसका सही उपयोग ज्ञात हो।',
      instructionEn: 'Place a small amount of black sesame in clean water. Use kusha or darbha only when it belongs to your family practice and you know its proper use.',
    },
    {
      id: 'offer-water',
      phase: 'main',
      titleHi: 'तिल-जल अर्पित करें',
      titleEn: 'Offer the sesame water',
      instructionHi: 'पितरों का श्रद्धापूर्वक स्मरण करते हुए थोड़ा तिल-जल नीचे रखे स्वच्छ पात्र में अर्पित करें। संख्या, दिशा, यज्ञोपवीत की स्थिति और क्रम अपनी परम्परा के अनुसार रखें; अनजान सूत्र की नकल न करें।',
      instructionEn: 'Remember the ancestors reverently and offer a small stream of sesame water into the clean vessel below. Follow your tradition for count, direction, sacred-thread position and order; do not imitate an unfamiliar formula.',
    },
    {
      id: 'silent-remembrance',
      phase: 'main',
      titleHi: 'मौन स्मरण',
      titleEn: 'Pause in remembrance',
      instructionHi: 'कुछ समय मौन बैठें, कृतज्ञता व्यक्त करें और परिवार के दिवंगत सदस्यों को स्मरण करें। यह भावपूर्ण विराम किसी पूर्ण श्राद्ध-विधान का विकल्प नहीं है।',
      instructionEn: 'Sit quietly for a few moments, express gratitude and remember departed family members. This reflective pause is not a substitute for a complete Shraddha rite.',
    },
    {
      id: 'gita-15',
      phase: 'main',
      titleHi: 'वैकल्पिक गीता पाठ — अध्याय १५',
      titleEn: 'Optional Gita reading — Chapter 15',
      instructionHi: 'इच्छा हो तो भगवद् गीता का पन्द्रहवाँ अध्याय स्मरण-पाठ के रूप में पढ़ें। यह पाठ तर्पण या श्राद्ध-विधान का स्थान नहीं लेता।',
      instructionEn: 'If desired, read Bhagavad Gita Chapter 15 as remembrance. This reading does not replace tarpana or Shraddha rites.',
      ref: { kind: 'gita', chapter: 15 },
    },
    {
      id: 'gita-2',
      phase: 'main',
      titleHi: 'वैकल्पिक गीता पाठ — अध्याय २',
      titleEn: 'Optional Gita reading — Chapter 2',
      instructionHi: 'परिवार की इच्छा हो तो भगवद् गीता का दूसरा अध्याय पढ़ें और फिर इसी विधि पर लौटें। इसे अनिवार्य कर्म या श्राद्ध का विकल्प न मानें।',
      instructionEn: 'If the family wishes, read Bhagavad Gita Chapter 2 and then return here. Treat it as optional remembrance, not an obligatory act or a substitute for Shraddha.',
      ref: { kind: 'gita', chapter: 2 },
    },
    {
      id: 'close-and-clean',
      phase: 'closing',
      titleHi: 'समापन और स्वच्छता',
      titleEn: 'Conclude and clean up',
      instructionHi: 'नमस्कार कर स्मरण पूर्ण करें। समेटे हुए जल का निस्तारण अपनी पारिवारिक रीति और स्थानीय स्वच्छता नियमों के अनुसार करें; सार्वजनिक जल या स्थान को दूषित न करें, फिर पात्र और हाथ साफ करें।',
      instructionEn: 'Bow and conclude the remembrance. Dispose of the collected water according to family practice and local hygiene rules without polluting public water or spaces, then clean the vessels and your hands.',
    },
  ],
  source: {
    canonicalEdition: 'Gita Press Nitya Karma Puja Prakash, code 592 — Tarpana chapter, printed pp. 103–116',
    canonicalEditionUrls: [GITA_PRESS_NITYA_KARMA],
    canonicalEditionStatus: 'VERIFIED 2026-08-19 for this narrow, instruction-only household boundary. The publisher imprint and Tarpana chapter were opened and checked for the materials and ordered rite family. No mantra, gotra/name formula, direction, sacred-thread rule or branch-specific sequence is transcribed into this entry.',
    referenceUrls: [DHARMA_SINDHU_SHRADDHA, DRIK_SHRADDHA_DATES, DRIK_SHRADDHA_DAYS],
    retrievedOn: '2026-08-19',
    notes: 'The entry intentionally does not claim to be complete Shraddha. Dharma Sindhu distinguishes tila-tarpana/anukalpa from parvana-shraddha and records substantial branch- and circumstance-specific procedure. DrikPanchang supplies the tithi-day and timing context plus a regional-variation warning. The two Gita hand-offs are optional remembrance readings already present in Pitru Smaran, never substitutions for ritual. Any future mantra or expanded parvana flow needs separate qualified review.',
  },
};

import { upvasEntry } from '../_helpers';

/** Annual Maha Shivaratri only; monthly Shivaratri needs its own sourced entry. */
export default upvasEntry({
  id: 'maha-shivaratri-upvas',
  fastType: 'night-vigil',
  fastTypeNoteHi: 'रात्रि जागरण — चार प्रहर की शिव पूजा',
  fastTypeNoteEn: 'A night vigil — Shiva puja through the four watches of the night',
  window: {
    kind: 'day-and-night-vigil',
    textHi: 'चतुर्दशी के दिन उपवास और रात्रि भर जागरण करते हुए शिव पूजा; पारण अगले दिन होता है।',
    textEn: 'A fast through the Chaturdashi day and Shiva worship through a night-long vigil; parana falls the next day.',
  },
  parana: {
    kind: 'text-only',
    textHi:
      'दृक पंचांग परम्परा में अगले दिन स्नान के बाद सूर्योदय से चतुर्दशी तिथि की समाप्ति से पहले पारण किया जाता है। कुछ परम्पराएँ रात्रि पूजा पूरी होने के बाद व्रत खोलती हैं; अपने संप्रदाय की रीति मानें।',
    textEn:
      'In the DrikPanchang convention, parana is done after bathing on the next day, from sunrise until Chaturdashi tithi ends. Some traditions break the fast after completing the night puja; follow your sampradaya’s practice.',
  },
  strictnessHi:
    'कोई निर्जल, कोई फलाहार रूप में रखता है; रात्रि के चार प्रहरों की पूजा और जागरण इस व्रत का मुख्य अंग है। परंपरा अनुसार बालक, वृद्ध एवं अस्वस्थ छूट रख सकते हैं।',
  strictnessEn:
    'Some keep it waterless and some on fruit fare; worship through the night’s four watches and the vigil itself are the vrat’s heart. Traditionally children, the elderly, and the unwell may observe leniently.',
  whoObservesHi: 'वार्षिक महाशिवरात्रि व्रत रखने वाले शिव उपासक।',
  whoObservesEn: 'Shiva devotees observing the annual Maha Shivaratri.',
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-date-time.html',
      'https://chinmayanewyork.org/shiva/',
      'https://nyganeshtemple.org/sivaratri2026/',
    ],
    verificationNote:
      'Verified 2026-08-19 against DrikPanchang, Chinmaya Mission New York, and Sri Maha Vallabha Ganapati Devasthanam: day fast, night vigil, four-phase/prahar worship, fasting leniency, and the explicitly divergent parana practices. This entry is annual-only because the sources do not support applying every Maha-specific row to Masik Shivaratri.',
  },
});

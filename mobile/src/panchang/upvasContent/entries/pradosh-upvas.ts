import { upvasEntry } from '../_helpers';

/** Shared by `pradosh-vrat-shukla` and `pradosh-vrat-krishna`. */
export default upvasEntry({
  id: 'pradosh-upvas',
  fastType: 'one-meal',
  fastTypeNoteHi: 'दिन भर उपवास — प्रदोष काल की शिव पूजा के उपरांत भोजन',
  fastTypeNoteEn: 'A day-long fast — the meal follows the Shiva puja of the pradosh hour',
  window: {
    kind: 'sunrise-to-parana',
    textHi: 'त्रयोदशी के सूर्योदय से संध्या के प्रदोष काल (सूर्यास्त के आसपास की वेला) की शिव पूजा तक।',
    textEn: 'From sunrise on Trayodashi until the Shiva puja of the evening pradosh hour (the period around sunset).',
  },
  parana: {
    kind: 'text-only',
    textHi: 'संध्या के प्रदोष काल में शिव पूजा के उपरांत व्रत खोला जाता है।',
    textEn: 'The fast is broken after the Shiva puja during the evening pradosh hour.',
  },
  strictnessHi:
    'दिन भर उपवास रखते हुए प्रदोष काल में शिव पूजा की जाती है और पूजा के बाद व्रत खोला जाता है।',
  strictnessEn:
    'The observance keeps the fast through the day, places Shiva puja in pradosh kaal, and breaks the fast after that puja.',
  whoObservesHi: 'शिव उपासक; शुक्ल एवं कृष्ण दोनों पक्षों की त्रयोदशी को।',
  whoObservesEn: 'Shiva devotees; on the Trayodashi of both the bright and dark fortnights.',
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/vrats/pradoshdates.html',
      'https://nyganeshtemple.org/pradosham/',
    ],
    verificationNote:
      'Verified 2026-08-19 against DrikPanchang and Sri Maha Vallabha Ganapati Devasthanam: both bright- and dark-fortnight Trayodashi, a day fast, Shiva puja in the sunset-linked pradosh period, and breaking the fast after that puja.',
  },
});

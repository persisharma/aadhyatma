import { upvasEntry } from '../_helpers';

/** करवा चौथ — the §6.3 composition case (the rule also carries `vidhiId: 'karwa-chauth-puja'`). */
export default upvasEntry({
  id: 'karwa-chauth-upvas',
  fastType: 'nirjala',
  fastTypeNoteHi: 'चंद्रोदय तक — जल भी वर्जित',
  fastTypeNoteEn: 'Until moonrise — even water is abstained',
  window: {
    kind: 'sunrise-to-moonrise',
    textHi: 'सूर्योदय (भोर की सरगी के बाद) से रात्रि के चंद्र दर्शन तक निर्जल उपवास।',
    textEn: 'A waterless fast from sunrise (after the pre-dawn sargi) until the night’s moon-sighting.',
  },
  parana: {
    kind: 'same-day-after-moonrise',
    textHi: 'चंद्र दर्शन और चंद्रमा को अर्घ्य देने के उपरांत जल ग्रहण कर व्रत खोलें।',
    textEn: 'Break the fast by taking water after sighting the moon and offering it arghya.',
  },
  strictnessHi:
    'यह व्रत सूर्योदय के बाद अन्न और जल दोनों के बिना रखा जाता है। सरगी एवं चंद्र-दर्शन की रीति क्षेत्र और परिवार के अनुसार भिन्न हो सकती है।',
  strictnessEn:
    'This fast is kept without food or water after sunrise. The sargi and moon-sighting customs may vary by region and family.',
  whoObservesHi: 'सुहागिन स्त्रियाँ पति की दीर्घायु हेतु; कई क्षेत्रों में अविवाहित युवतियाँ भी रखती हैं।',
  whoObservesEn: 'Married women, for the long life of their husbands; in many regions unmarried young women also keep it.',
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/festivals/karwa-chauth/karwa-chauth-date-time.html',
      'https://www.incredibleindia.gov.in/en/festivals-and-events/karva-chauth',
    ],
    verificationNote:
      'Verified 2026-08-19 against DrikPanchang and the Ministry of Tourism Incredible India festival account: nirjala sunrise-to-moonrise window, pre-sunrise sargi, moon offering followed by water/food, and the married-women core with an attested unmarried-women regional practice.',
  },
});

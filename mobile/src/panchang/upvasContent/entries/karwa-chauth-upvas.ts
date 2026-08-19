import { DRAFT_EGRESS_NOTE, upvasEntry } from '../_helpers';

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
    'सरगी और फलाहार की रीति परिवार एवं क्षेत्र की परम्परा अनुसार भिन्न रहती है। परंपरा अनुसार अस्वस्थ एवं गर्भवती छूट रख सकती हैं।',
  strictnessEn:
    'The sargi and any fruit fare vary with family and regional tradition. Traditionally the unwell and expectant mothers may observe leniently.',
  whoObservesHi: 'सुहागिन स्त्रियाँ पति की दीर्घायु हेतु; कई क्षेत्रों में अविवाहित युवतियाँ भी रखती हैं।',
  whoObservesEn: 'Married women, for the long life of their husbands; in many regions unmarried young women also keep it.',
  status: 'draft',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/festivals/karwa-chauth/legends/karwa-chauth-legends.html',
      'https://en.wikipedia.org/wiki/Karva_Chauth',
    ],
    verificationNote:
      DRAFT_EGRESS_NOTE +
      'Rows to verify: nirjala sunrise-to-moonrise window; sargi convention; arghya-then-water sequence; who-observes.',
  },
});

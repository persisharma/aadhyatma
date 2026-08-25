import { upvasEntry } from '../_helpers';

export default upvasEntry({
  id: 'sankashti-chaturthi-upvas',
  fastType: 'phalahar',
  fastTypeNoteHi: 'चंद्रोदय तक फलाहार — अन्न वर्जित',
  fastTypeNoteEn: 'Fruit fare until moonrise — grains are abstained',
  window: {
    kind: 'sunrise-to-moonrise',
    textHi: 'चतुर्थी के सूर्योदय से रात्रि के चंद्रोदय तक; दिन में फलाहार लिया जा सकता है।',
    textEn: 'From sunrise on Chaturthi until the night’s moonrise; fruit fare may be taken during the day.',
  },
  parana: {
    kind: 'same-day-after-moonrise',
    textHi: 'रात्रि में चंद्र दर्शन और चंद्रमा को अर्घ्य देने के उपरांत गणेश पूजा कर व्रत खोलें।',
    textEn: 'Break the fast at night after sighting the moon and offering it arghya, following the Ganesha puja.',
  },
  strictnessHi:
    'दिन का उपवास संध्या की गणेश पूजा, चंद्र दर्शन और चंद्रमा को अर्घ्य देने के बाद पूर्ण किया जाता है।',
  strictnessEn:
    'The day fast is completed after the evening Ganesha worship, sighting the moon, and offering arghya to it.',
  whoObservesHi: 'गणेश उपासक; प्रत्येक कृष्ण पक्ष की चतुर्थी को।',
  whoObservesEn: 'Ganesha devotees; on the Chaturthi of every dark fortnight.',
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/vrats/sankashti-chaturthi-dates.html',
      'https://www.ganapati.org/sankatahara-chaturthi',
      'https://saveca.ca/SANKASHTAHARA%20GANAPATHI%20VRATHAM.PDF',
    ],
    verificationNote:
      'Verified 2026-08-19 against DrikPanchang, Maha Ganapati Temple of Arizona, and Sankara Vedic Culture and Arts: monthly Krishna-Paksha Chaturthi, sunrise-to-moonrise fasting, evening Ganesha worship, moon sighting, and arghya before completion of the vrat.',
  },
});

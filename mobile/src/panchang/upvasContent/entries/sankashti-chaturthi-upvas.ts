import { DRAFT_EGRESS_NOTE, upvasEntry } from '../_helpers';

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
    'कोई निर्जल और कोई फलाहार रूप में रखता है; व्रत चंद्र दर्शन से ही पूर्ण माना जाता है। परंपरा अनुसार बालक, वृद्ध एवं अस्वस्थ छूट रख सकते हैं।',
  strictnessEn:
    'Some keep it waterless and some on fruit fare; the vrat is held complete only upon sighting the moon. Traditionally children, the elderly, and the unwell may observe leniently.',
  whoObservesHi: 'गणेश उपासक; प्रत्येक कृष्ण पक्ष की चतुर्थी को।',
  whoObservesEn: 'Ganesha devotees; on the Chaturthi of every dark fortnight.',
  status: 'draft',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/vrat-katha/sankashti/sankashti-chaturthi-vrat-katha.html',
      'https://en.wikipedia.org/wiki/Sankashti_Chaturthi',
    ],
    verificationNote:
      DRAFT_EGRESS_NOTE +
      'Rows to verify: moonrise-bound window; arghya-then-break sequence; strictness variants.',
  },
});

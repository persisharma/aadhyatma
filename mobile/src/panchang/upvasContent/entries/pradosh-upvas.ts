import { DRAFT_EGRESS_NOTE, upvasEntry } from '../_helpers';

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
    'कोई निर्जल और कोई फलाहार रूप में रखता है; पूजा के उपरांत एक-भुक्त भोजन की रीति प्रचलित है। परंपरा अनुसार बालक, वृद्ध एवं अस्वस्थ छूट रख सकते हैं।',
  strictnessEn:
    'Some keep it waterless and some on fruit fare; a single meal after the puja is the common practice. Traditionally children, the elderly, and the unwell may observe leniently.',
  whoObservesHi: 'शिव उपासक; शुक्ल एवं कृष्ण दोनों पक्षों की त्रयोदशी को।',
  whoObservesEn: 'Shiva devotees; on the Trayodashi of both the bright and dark fortnights.',
  status: 'draft',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/vrat-katha/pradosha/pradosha-vrat-katha.html',
      'https://en.wikipedia.org/wiki/Pradosha',
    ],
    verificationNote:
      DRAFT_EGRESS_NOTE +
      'Rows to verify: day fast ending at the pradosh-kaal puja; definition of the pradosh hour; strictness variants.',
  },
});

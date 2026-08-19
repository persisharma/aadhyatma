import { DRAFT_EGRESS_NOTE, upvasEntry } from '../_helpers';

/**
 * Shared by `purnima-vrat` and `shree-satyanarayan-vrat` — the §6.3 composition
 * case (both rules carry `vidhiId: 'satyanarayan-puja'`).
 */
export default upvasEntry({
  id: 'purnima-satyanarayan-upvas',
  fastType: 'one-meal',
  fastTypeNoteHi: 'एक भुक्त / फलाहार — संध्या पूजा के उपरांत भोजन',
  fastTypeNoteEn: 'One meal / fruit fare — the meal follows the evening puja',
  window: {
    kind: 'sunrise-to-parana',
    textHi: 'पूर्णिमा के सूर्योदय से संध्या की सत्यनारायण पूजा और कथा तक उपवास रखा जाता है।',
    textEn: 'The fast is kept from sunrise on Purnima until the evening Satyanarayan puja and katha.',
  },
  parana: {
    kind: 'text-only',
    textHi: 'संध्या में सत्यनारायण पूजा एवं कथा-श्रवण के उपरांत प्रसाद ग्रहण कर व्रत खोलें।',
    textEn: 'Break the fast after the evening Satyanarayan puja and hearing of the katha, by taking the prasad.',
  },
  strictnessHi:
    'कोई निर्जल, कोई फलाहार और कोई एक-भुक्त रूप में रखता है — परिवार-परम्परा अनुसार। परंपरा अनुसार बालक, वृद्ध एवं अस्वस्थ छूट रख सकते हैं।',
  strictnessEn:
    'Some keep it waterless, some on fruit fare, and some as a single meal — as family tradition holds. Traditionally children, the elderly, and the unwell may observe leniently.',
  whoObservesHi: 'पूर्णिमा व्रती एवं सत्यनारायण पूजा करने वाले परिवार।',
  whoObservesEn: 'Purnima vrat keepers and families performing the Satyanarayan puja.',
  status: 'draft',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/vrat-katha/satyanarayana/satyanarayana-vrat-katha.html',
      'https://en.wikipedia.org/wiki/Satyanarayan_Puja',
    ],
    verificationNote:
      DRAFT_EGRESS_NOTE +
      'Rows to verify: day fast ending at the evening puja; prasad as the fast-breaking; strictness variants.',
  },
});

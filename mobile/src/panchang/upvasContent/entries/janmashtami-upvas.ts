import { DRAFT_EGRESS_NOTE, upvasEntry } from '../_helpers';

/** Shared by `janmashtami` (annual) and `masik-krishna-janmashtami` (monthly). */
export default upvasEntry({
  id: 'janmashtami-upvas',
  fastType: 'phalahar',
  fastTypeNoteHi: 'मध्यरात्रि की जन्म पूजा तक फलाहार',
  fastTypeNoteEn: 'Fruit fare until the midnight birth puja',
  window: {
    kind: 'sunrise-to-parana',
    textHi: 'अष्टमी के सूर्योदय से मध्यरात्रि (निशीथ काल) की कृष्ण जन्म पूजा तक; दिन में फलाहार लिया जा सकता है।',
    textEn: 'From sunrise on Ashtami until the midnight (nishith-hour) puja of Krishna’s birth; fruit fare may be taken during the day.',
  },
  parana: {
    kind: 'text-only',
    textHi:
      'परंपरा अनुसार निशीथ की जन्म पूजा के उपरांत पारण किया जाता है; कई परम्पराएँ अगले दिन सूर्योदय के बाद अष्टमी तिथि व रोहिणी नक्षत्र की समाप्ति के अनुसार पारण करती हैं।',
    textEn:
      'By common tradition the fast is broken after the midnight birth puja; several traditions do parana after the next sunrise, according to the ending of Ashtami tithi and Rohini nakshatra.',
  },
  strictnessHi:
    'कोई निर्जल और कोई फलाहार रूप में रखता है; व्रत का केंद्र मध्यरात्रि की जन्म पूजा है। परंपरा अनुसार बालक, वृद्ध एवं अस्वस्थ छूट रख सकते हैं।',
  strictnessEn:
    'Some keep it waterless and some on fruit fare; the midnight birth puja is the vrat’s centre. Traditionally children, the elderly, and the unwell may observe leniently.',
  whoObservesHi: 'कृष्ण उपासक; वार्षिक जन्माष्टमी और प्रत्येक कृष्ण अष्टमी की मासिक जन्माष्टमी को।',
  whoObservesEn: 'Krishna devotees; on the annual Janmashtami and on every dark-fortnight Ashtami for the monthly vrat.',
  status: 'draft',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/vrat-katha/vrat-katha.html',
      'https://en.wikipedia.org/wiki/Krishna_Janmashtami',
    ],
    verificationNote:
      DRAFT_EGRESS_NOTE +
      'Rows to verify: fast-until-nishith-puja window; the post-midnight vs next-morning (tithi/Rohini-end) parana split — the split is why parana stays text-only.',
  },
});

import { upvasEntry } from '../_helpers';

/**
 * Shared by `purnima-vrat` and `shree-satyanarayan-vrat` — the §6.3 composition
 * case (both rules carry `vidhiId: 'satyanarayan-puja'`).
 */
export default upvasEntry({
  id: 'purnima-satyanarayan-upvas',
  fastType: 'one-meal',
  fastTypeNoteHi: 'दिन का उपवास — संध्या पूजा के उपरांत प्रसाद और भोजन',
  fastTypeNoteEn: 'A day fast — prasad and the meal follow the evening puja',
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
    'पूजा प्रातः या संध्या में की जा सकती है; संध्या पूजा में कथा और आरती के बाद पंचामृत एवं प्रसाद ग्रहण कर व्रत खोलने की रीति है।',
  strictnessEn:
    'The puja may be performed in the morning or evening; with evening puja, the fast is broken with panchamrit and prasad after the katha and arati.',
  whoObservesHi: 'पूर्णिमा व्रती एवं सत्यनारायण पूजा करने वाले परिवार।',
  whoObservesEn: 'Purnima vrat keepers and families performing the Satyanarayan puja.',
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/vrats/satyanarayandates.html',
      'https://www.srimatham.com/uploads/5/5/4/9/5549439/satya_narayana_puja.pdf',
      'https://annavaramdevasthanam.nic.in/SevaDetails/SriVariVratham',
    ],
    verificationNote:
      'Verified 2026-08-19 against DrikPanchang, Sri Matham\'s published Satya Narayana Puja text, and the Government of Andhra Pradesh Annavaram Devasthanam account: day fast, evening puja and katha, and fast-breaking with panchamrit/prasad. The temple source independently attests the centrality of hearing the vrata katha.',
  },
});

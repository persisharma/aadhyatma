import { DRAFT_EGRESS_NOTE, upvasEntry } from '../_helpers';

/** Shared by `maha-shivaratri` (annual; carries `vidhiId`) and `masik-shivaratri` (monthly). */
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
      'अगले दिन स्नान के बाद सूर्योदय के उपरांत पारण करने की परंपरा प्रचलित है; कई परम्पराएँ चतुर्दशी तिथि रहते ही पारण करने का निर्देश देती हैं।',
    textEn:
      'The prevailing tradition is to break the fast after bathing, following sunrise the next day; several traditions direct that parana be done while Chaturdashi tithi still prevails.',
  },
  strictnessHi:
    'कोई निर्जल, कोई फलाहार रूप में रखता है; रात्रि के चार प्रहरों की पूजा और जागरण इस व्रत का मुख्य अंग है। परंपरा अनुसार बालक, वृद्ध एवं अस्वस्थ छूट रख सकते हैं।',
  strictnessEn:
    'Some keep it waterless and some on fruit fare; worship through the night’s four watches and the vigil itself are the vrat’s heart. Traditionally children, the elderly, and the unwell may observe leniently.',
  whoObservesHi: 'शिव उपासक; महाशिवरात्रि वार्षिक है और मासिक शिवरात्रि प्रत्येक कृष्ण चतुर्दशी को।',
  whoObservesEn: 'Shiva devotees; Maha Shivaratri is annual, and Masik Shivaratri falls on every dark-fortnight Chaturdashi.',
  status: 'draft',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/vrat-katha/maha-shivaratri/maha-shivaratri-vrat-katha.html',
      'https://en.wikipedia.org/wiki/Maha_Shivaratri',
    ],
    verificationNote:
      DRAFT_EGRESS_NOTE +
      'Rows to verify: day-fast + four-prahar night vigil; next-day parana conventions (post-sunrise vs within-Chaturdashi) — the split is why parana stays text-only.',
  },
});

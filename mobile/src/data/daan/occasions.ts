/**
 * दान-by-occasion (PRD-26 §10.1) — every row keys to REAL observance/festival
 * solver rule ids (verified against precomputedObservances.ts / festivals.ts).
 * Exact `ruleIds` always win over `ruleIdSuffixes` families (see index.ts).
 * A day with no attested daan tradition has NO row: hosts render nothing.
 * ⚠ `source` blocks are review-only provenance — never rendered. Shipped
 * verified in-repo content (katha/vidhi text that itself carries the
 * tradition) counts as one reference, named by path.
 */
import type { DaanOccasionEntry } from './types';

export const DAAN_OCCASION_ENTRIES: readonly DaanOccasionEntry[] = [
  // ── Tier 1 · the great daan days ─────────────────────────────────────────
  {
    id: 'makar-sankranti',
    ruleIds: ['makar-sankranti'],
    titleHi: 'मकर संक्रान्ति का दान',
    titleEn: 'Makar Sankranti daan',
    whyHi:
      'सूर्य के उत्तरायण होने का पर्व — परम्परा इस संधि-काल को देने का दिन कहती है: जो प्रकाश बढ़ रहा है, उसे बाँटा जाता है। शीत ऋतु में स्निग्ध तिल शरीर और दीप दोनों को पोषण देता है।',
    whyEn:
      'The sun turns north — tradition calls this junction a day for giving: the light that grows is shared. In winter, oil-rich til nourishes both body and lamp.',
    items: [
      { id: 'til-gud', nameHi: 'तिल-गुड़', nameEn: 'Til-gud', reasonHi: 'शीत में स्निग्ध पोषण — संक्रान्ति का मूल दान', reasonEn: 'warming nourishment in winter — the root Sankranti gift' },
      { id: 'khichdi', nameHi: 'खिचड़ी / अन्न', nameEn: 'Khichdi / anna', reasonHi: 'अन्न-दान सर्वोपरि — अनुशासन पर्व की शिक्षा', reasonEn: 'anna-daan comes first — the Anuśāsana teaching' },
      { id: 'vastra', nameHi: 'वस्त्र / कम्बल', nameEn: 'Cloth / blanket', reasonHi: 'माघ की ठिठुरन में सबसे प्रत्यक्ष आवश्यकता', reasonEn: 'the most immediate need of the Magha cold' },
      { id: 'gau-gras', nameHi: 'गौ-ग्रास', nameEn: 'Gau-gras', reasonHi: 'गौ सेवा — मन्त्र व विधि app में उपलब्ध', reasonEn: 'gau seva — mantras and vidhi ship in the app' },
    ],
    daanKathaId: 'karna',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://en.wikipedia.org/wiki/Makar_Sankranti',
        'https://www.drikpanchang.com/festivals/makar-sankranti/makar-sankranti-date-time.html',
      ],
      verificationNote:
        '2026-09-01: til-gud, khichdi and daan-on-snana concordant across both pages (Uttarayana junction; til/khichdi traditions named).',
    },
  },
  {
    id: 'sankranti-snana-daan',
    ruleIds: [],
    ruleIdSuffixes: ['-sankranti'],
    titleHi: 'संक्रान्ति स्नान-दान',
    titleEn: 'Sankranti snana-daan',
    whyHi:
      'हर सौर संक्रमण — सूर्य का नई राशि में प्रवेश — परम्परा में स्नान-दान का पुण्यकाल है। कर्क संक्रान्ति से दक्षिणायन आरम्भ होता है, इसलिए उसका दान-महत्व विशेष कहा गया है।',
    whyEn:
      'Every solar ingress — the sun entering a new rashi — is a snana-daan punyakala in the tradition. Karka Sankranti opens Dakshinayana, so its giving carries special weight.',
    items: [
      { id: 'snana-daan', nameHi: 'स्नान के बाद यथाशक्ति दान', nameEn: 'Daan after the bath, per one’s means', reasonHi: 'संक्रमण-काल का पारम्परिक क्रम — स्नान, फिर दान', reasonEn: 'the traditional order of the junction — bathe, then give' },
      { id: 'anna', nameHi: 'अन्न', nameEn: 'Anna', reasonHi: 'ऋतु-संधि पर अन्न सबसे सार्वभौम पात्र-दान है', reasonEn: 'at a season-junction, food is the most universal gift' },
    ],
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.drikpanchang.com/sankranti/sankranti-dates.html',
        'https://en.wikipedia.org/wiki/Sankranti',
      ],
      verificationNote:
        '2026-09-01: sankranti as snana-daan punyakala concordant (Drik lists per-sankranti punya kala windows; Wikipedia describes the ingress observance). The Karka/Dakshinayana weight stated as tradition, no fruit-claims.',
    },
  },
  {
    id: 'akshaya-tritiya',
    ruleIds: ['akshaya-tritiya'],
    titleHi: 'अक्षय तृतीया का दान',
    titleEn: 'Akshaya Tritiya daan',
    whyHi:
      'वैशाख शुक्ल तृतीया — परम्परा कहती है कि इस तिथि पर श्रद्धा से किया गया छोटा-सा दान भी अक्षय हो जाता है। ग्रीष्म के द्वार पर जल, छाया और अन्न देना ही इस दिन का स्वरूप है।',
    whyEn:
      'Vaishakha shukla tritiya — the tradition says even a small gift given with shraddha on this tithi becomes akshaya, undiminishing. At summer’s door, its giving is water, shade and food.',
    items: [
      { id: 'jal-ghata', nameHi: 'जल से भरा घड़ा', nameEn: 'A filled water pot', reasonHi: 'ग्रीष्म के आरम्भ पर जल-दान — कथा में यही पहला दान है', reasonEn: 'water at the start of summer — the katha’s own first gift' },
      { id: 'pankha-chhata', nameHi: 'पंखा / छाता', nameEn: 'Fan / umbrella', reasonHi: 'धूप से छाया देना — इस तिथि की पारम्परिक सूची', reasonEn: 'shade from the sun — this tithi’s traditional list' },
      { id: 'anna-jau-chana', nameHi: 'अन्न · जौ-चना', nameEn: 'Anna · barley-chana', reasonHi: 'कथा में धर्मदास का जल-अन्न दान अक्षय फल देता है', reasonEn: 'in the katha, Dharmadas’s water-and-grain gift bears undiminishing fruit' },
    ],
    kathaId: 'akshaya-tritiya-vrat-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/akshaya-tritiya-vrat-katha.ts (shipped, verified)',
        'https://www.drikpanchang.com/vrat-katha/akshaya-tritiya/akshaya-tritiya-vrat-katha.html',
      ],
      verificationNote:
        '2026-09-01: the item list (jala-ghata, chhata/pankha, jau-chana-gud, anna) is carried verbatim inside the app’s own shipped verified katha text; external page concordant.',
    },
  },
  {
    id: 'pitru-paksha',
    ruleIds: ['shraddha-dates'],
    titleHi: 'पितृ पक्ष का दान',
    titleEn: 'Pitru Paksha daan',
    whyHi:
      'आश्विन कृष्ण पक्ष — पितरों के स्मरण का पखवाड़ा। श्राद्ध की परम्परा में तर्पण के साथ अन्न-दान और भोजन कराना ही पितृ-तृप्ति का घरेलू रूप है।',
    whyEn:
      'The Ashvina krishna fortnight of remembering one’s ancestors. In the shraddha tradition, anna-daan and feeding — alongside tarpana — is the household form of pitru-tripti.',
    items: [
      { id: 'anna-bhojan', nameHi: 'अन्न-दान · भोजन', nameEn: 'Anna-daan · bhojan', reasonHi: 'श्राद्ध का केन्द्र — भोजन कराना', reasonEn: 'the centre of shraddha — feeding' },
      { id: 'til', nameHi: 'तिल', nameEn: 'Til', reasonHi: 'तिल-तर्पण की ही सामग्री — स्मरण का द्रव्य', reasonEn: 'the very substance of til-tarpana' },
      { id: 'vastra', nameHi: 'वस्त्र', nameEn: 'Cloth', reasonHi: 'श्राद्ध-दान की पारम्परिक सूची में', reasonEn: 'in the traditional shraddha-daan list' },
    ],
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/data/vidhi/shraddha-tarpan-vidhi.ts (shipped: hands pinda-daan/bhojan to family tradition)',
        'https://www.drikpanchang.com/shraddha/shraddha-dates.html',
      ],
      verificationNote:
        '2026-09-01: anna/til/vastra as the household shraddha gifts concordant with the shipped tarpan vidhi’s own framing and the external shraddha reference; ancestor details never surface here (PRD-17 privacy stance).',
    },
  },
  {
    id: 'akshaya-navami',
    ruleIds: ['akshaya-navami'],
    titleHi: 'अक्षय नवमी का दान',
    titleEn: 'Akshaya Navami daan',
    whyHi:
      'कार्तिक शुक्ल नवमी — आँवला वृक्ष के पूजन का दिन। कथा कहती है कि इस दिन आँवले की छाया में कराया गया भोजन और दिया गया दान अक्षय होता है।',
    whyEn:
      'Kartika shukla navami — the day of the amla tree. The katha says food served and gifts given in its shade this day become akshaya.',
    items: [
      { id: 'bhojan-amla', nameHi: 'आँवले की छाया में भोजन', nameEn: 'Bhojan under the amla', reasonHi: 'कथा का केन्द्रीय दृश्य — सबको एक पंक्ति में भोजन', reasonEn: 'the katha’s central scene — all fed in one row' },
      { id: 'amla-anna', nameHi: 'आँवला · अन्न', nameEn: 'Amla · anna', reasonHi: 'इस नवमी की पारम्परिक दान-वस्तुएँ', reasonEn: 'this navami’s traditional gifts' },
    ],
    kathaId: 'akshaya-navami-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/akshaya-navami-katha.ts (shipped, verified)',
        'https://www.drikpanchang.com/festivals/amla-navami/amla-navami-date-time.html',
      ],
      verificationNote:
        '2026-09-01: the shade-bhojan and akshaya-daan teaching is the shipped katha’s own text; external page concordant on the amla-navami observance.',
    },
  },
  {
    id: 'guru-purnima',
    ruleIds: ['guru-purnima'],
    titleHi: 'गुरु पूर्णिमा का दान',
    titleEn: 'Guru Purnima daan',
    whyHi:
      'आषाढ़ पूर्णिमा — व्यास-पूजन का दिन। इस दिन का दान गुरु-दक्षिणा और विद्या-दान है: जिसने सिखाया उसका सम्मान, और जो सीख रहा है उसकी सहायता।',
    whyEn:
      'Ashadha purnima — the day of Vyasa-pujan. Its giving is guru-dakshina and vidya-daan: honouring the one who taught, and helping the one still learning.',
    items: [
      { id: 'dakshina', nameHi: 'गुरु-दक्षिणा', nameEn: 'Guru-dakshina', reasonHi: 'फल-पुष्प-वस्त्र सहित सम्मान — परम्परा का क्रम', reasonEn: 'honour with fruit, flower and cloth — the traditional form' },
      { id: 'vidya', nameHi: 'विद्या-दान', nameEn: 'Vidya-daan', reasonHi: 'पुस्तकें, शुल्क, शिक्षण — सीखने वाले की सहायता', reasonEn: 'books, fees, teaching — helping a learner' },
    ],
    kathaId: 'guru-purnima-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.timeanddate.com/holidays/hindu/guru-purnima',
        'https://www.drikpanchang.com/festivals/guru-purnima/guru-purnima-date-time.html',
      ],
      verificationNote:
        '2026-09-01: guru-dakshina (fees/presents; fruit-flower-cloth offerings) concordant across both pages.',
    },
  },
  {
    id: 'vasant-panchami',
    ruleIds: ['vasant-panchami'],
    titleHi: 'वसंत पंचमी का दान',
    titleEn: 'Vasant Panchami daan',
    whyHi:
      'माघ शुक्ल पंचमी — सरस्वती पूजन और विद्यारम्भ का दिन। इस दिन का स्वाभाविक दान विद्या-दान है।',
    whyEn:
      'Magha shukla panchami — Saraswati pujan and vidyarambha. Its natural giving is vidya-daan.',
    items: [
      { id: 'vidya', nameHi: 'विद्या-दान', nameEn: 'Vidya-daan', reasonHi: 'पुस्तकें, लेखन-सामग्री, किसी बच्चे का शुल्क', reasonEn: 'books, writing materials, a child’s school fees' },
    ],
    kathaId: 'vasant-panchami-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.drikpanchang.com/hindu-festivals/vasant-panchami/vasant-panchami.html',
        'https://en.wikipedia.org/wiki/Vasant_Panchami',
      ],
      verificationNote:
        '2026-09-01: Saraswati worship with books placed before her and vidyarambha concordant; vidya-daan stated as the day’s natural gift, no fruit-claims.',
    },
  },
  {
    id: 'ganga-days',
    ruleIds: ['ganga-dussehra', 'ganga-saptami'],
    titleHi: 'गंगा पर्व का दान',
    titleEn: 'Ganga parva daan',
    whyHi:
      'गंगा अवतरण के दिन — जल के पर्व का दान जल ही है: प्याऊ, शरबत, जल-पात्र। ज्येष्ठ की धूप में यह सबसे प्रत्यक्ष सेवा है।',
    whyEn:
      'The days of Ganga’s descent — a water festival’s giving is water itself: a pyau, sherbet, water vessels. In the Jyeshtha heat this is the most immediate seva.',
    items: [
      { id: 'jal', nameHi: 'जल-दान · प्याऊ', nameEn: 'Jal-daan · pyau', reasonHi: 'ज्येष्ठ की धूप में जल ही पात्र-दान है', reasonEn: 'in the Jyeshtha sun, water is the fitting gift' },
    ],
    kathaId: 'ganga-dussehra-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.drikpanchang.com/festivals/ganga-dussehra/ganga-dussehra-date-time.html',
        'https://en.wikipedia.org/wiki/Ganga_Dussehra',
      ],
      verificationNote:
        '2026-09-01: Ganga-avatarana observance concordant; jal-daan/pyau stated as the seasonal traditional form (Jyeshtha), no fruit-claims.',
    },
  },
  {
    id: 'govardhan-annakut',
    ruleIds: ['govardhan-puja'],
    titleHi: 'गोवर्धन · अन्नकूट का दान',
    titleEn: 'Govardhan · Annakut daan',
    whyHi:
      'कार्तिक शुक्ल प्रतिपदा — अन्नकूट का ही अर्थ है अन्न का पर्वत, जो बाँटने के लिए रचा जाता है। यही दिन बलि-प्रतिपदा भी है — दान में अहंकार गला देने वाले राजा का स्मरण।',
    whyEn:
      'Kartika shukla pratipada — Annakut literally means a mountain of food, built to be shared. The same day is Bali Pratipada — remembering the king whose giving dissolved his own ego.',
    items: [
      { id: 'anna', nameHi: 'अन्न-दान', nameEn: 'Anna-daan', reasonHi: 'अन्नकूट का प्रसाद बाँटना ही पर्व का रूप है', reasonEn: 'sharing the Annakut prasada is the festival’s own form' },
      { id: 'gau-seva', nameHi: 'गौ-सेवा', nameEn: 'Gau-seva', reasonHi: 'गोवर्धन गौ-धन का पर्व है', reasonEn: 'Govardhan is the festival of the cow-wealth' },
    ],
    kathaId: 'govardhan-puja-katha',
    daanKathaId: 'bali-vamana',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/govardhan-puja-katha.ts (shipped, verified)',
        'https://www.drikpanchang.com/festivals/govardhan-puja/govardhan-puja-date-time.html',
      ],
      verificationNote:
        '2026-09-01: Annakut as shared food-offering and the Bali-Pratipada coincidence concordant (Drik lists both on Kartika shukla pratipada).',
    },
  },
  {
    id: 'bachh-baras',
    ruleIds: ['bachh-baras'],
    titleHi: 'बछ बारस — गौ-सेवा',
    titleEn: 'Bachh Baras — gau-seva',
    whyHi: 'गोवत्स द्वादशी — गाय और बछड़े के पूजन का दिन; इस दिन की सेवा गौ-ग्रास और चारा है।',
    whyEn: 'Govatsa dwadashi — the day of the cow and calf; its seva is gau-gras and fodder.',
    items: [
      { id: 'gau-gras', nameHi: 'गौ-ग्रास · चारा', nameEn: 'Gau-gras · fodder', reasonHi: 'पर्व का ही विधान — गौ माता को पहला ग्रास', reasonEn: 'the observance’s own form — the first morsel to the cow' },
    ],
    kathaId: 'bachh-baras-vrat-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/bachh-baras-vrat-katha.ts (shipped, verified)',
        'https://www.drikpanchang.com/festivals/govatsa-dwadashi/govatsa-dwadashi-date-time.html',
      ],
      verificationNote: '2026-09-01: cow-and-calf worship with feeding concordant with the shipped katha and the external page.',
    },
  },
  {
    id: 'deep-parv',
    ruleIds: ['dhanteras', 'diwali'],
    titleHi: 'दीप पर्व का दान',
    titleEn: 'Deep parva daan',
    whyHi:
      'धनतेरस से दीपावली तक दीपों का पर्व है — दीप-दान इसका पारम्परिक रूप है, धनतेरस की संध्या का यम-दीप उसका सबसे पुराना अंग।',
    whyEn:
      'From Dhanteras to Diwali runs the festival of lamps — deep-daan is its traditional form, the Yama-deepam of Dhanteras evening its oldest limb.',
    items: [
      { id: 'deep', nameHi: 'दीप-दान · यम-दीप', nameEn: 'Deep-daan · Yama-deepam', reasonHi: 'धनतेरस की संध्या का विधान', reasonEn: 'the Dhanteras-evening observance' },
      { id: 'anna-mithai', nameHi: 'अन्न · मिठाई बाँटना', nameEn: 'Sharing anna · sweets', reasonHi: 'पर्व का प्रकाश बाँटे बिना अधूरा है', reasonEn: 'the festival’s light is incomplete unshared' },
    ],
    kathaId: 'dhanteras-legends',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/dhanteras-legends.ts (shipped, verified)',
        'https://www.drikpanchang.com/diwali/dhantrayodashi/yama-deepam-date-time.html',
      ],
      verificationNote: '2026-09-01: Yama-deepam as the Dhanteras-evening lamp rite concordant (Drik lists it as a dated observance).',
    },
  },
  {
    id: 'kartik-deep',
    ruleIds: ['karthigai-vrat'],
    titleHi: 'कार्तिक दीप का दान',
    titleEn: 'Kartika deepa daan',
    whyHi:
      'कार्तिक पूर्णिमा की सन्ध्या दीपों की है — देव दीपावली और कार्त्तिगै दीपम् दोनों इसी का रूप हैं। दीप-दान इस पूर्णिमा का पारम्परिक दान है।',
    whyEn:
      'Kartika purnima’s evening belongs to lamps — Dev Deepavali and Karthigai Deepam are both its forms. Deep-daan is this purnima’s traditional gift.',
    items: [
      { id: 'deep', nameHi: 'दीप-दान', nameEn: 'Deep-daan', reasonHi: 'घाट, मंदिर या द्वार पर दीप — पर्व का ही रूप', reasonEn: 'a lamp at the ghat, temple or door — the festival’s own form' },
    ],
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.drikpanchang.com/festivals/dev-diwali/dev-diwali-date-time.html',
        'https://en.wikipedia.org/wiki/Karthika_Deepam',
      ],
      verificationNote: '2026-09-01: the lamp-festival character of Kartika purnima (Dev Deepavali ghat lamps; Karthigai Deepam) concordant.',
    },
  },
  {
    id: 'chhath',
    ruleIds: ['chhath-puja'],
    titleHi: 'छठ का प्रसाद-दान',
    titleEn: 'Chhath prasada sharing',
    whyHi: 'सूर्य षष्ठी का महाव्रत — घाट पर ठेकुआ और प्रसाद का वितरण इस पर्व की जीवित परम्परा है।',
    whyEn: 'The great vrat of Surya shashthi — sharing thekua and prasada at the ghat is this festival’s living tradition.',
    items: [
      { id: 'thekua', nameHi: 'ठेकुआ · प्रसाद', nameEn: 'Thekua · prasada', reasonHi: 'घाट पर सबको प्रसाद — व्रत का समापन', reasonEn: 'prasada to all at the ghat — the vrat’s closing' },
    ],
    kathaId: 'chhath-puja-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/chhath-puja-katha.ts (shipped, verified)',
        'https://en.wikipedia.org/wiki/Chhath',
      ],
      verificationNote: '2026-09-01: thekua as the vrat’s prasada, distributed after the arghya, concordant.',
    },
  },

  // ── Tier 2 · the recurring tithi cadence ─────────────────────────────────
  {
    id: 'amavasya',
    ruleIds: ['amavasya-vrat'],
    titleHi: 'अमावस्या का दान',
    titleEn: 'Amavasya daan',
    whyHi:
      'हर अमावस्या पितृ-स्मरण की तिथि है — तिल-जल तर्पण के साथ अन्न-वस्त्र का दान उसका घरेलू रूप है। सोमवार की अमावस्या (सोमवती) पर परम्परा इसे विशेष कहती है।',
    whyEn:
      'Every amavasya is a tithi of remembering the ancestors — anna-vastra daan alongside til-jal tarpana is its household form. On a Monday amavasya (Somvati) the tradition marks it as special.',
    items: [
      { id: 'til-jal', nameHi: 'तिल-जल', nameEn: 'Til-jal', reasonHi: 'तर्पण की ही सामग्री', reasonEn: 'the substance of tarpana itself' },
      { id: 'anna-vastra', nameHi: 'अन्न-वस्त्र', nameEn: 'Anna-vastra', reasonHi: 'कथा में यही अमावस्या का दान है', reasonEn: 'the katha’s own amavasya gift' },
    ],
    kathaId: 'amavasya-vrat-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/amavasya-vrat-katha.ts (shipped, verified)',
        'https://www.drikpanchang.com/amavasya/amavasya-dates.html',
      ],
      verificationNote:
        '2026-09-01: til-jal tarpana + anna-vastra daan is the shipped katha’s own text (सोना की अमावस्या-चर्या); Somvati elevation stated as tradition.',
    },
  },
  {
    id: 'purnima',
    ruleIds: ['purnima-vrat', 'shree-satyanarayan-vrat'],
    titleHi: 'पूर्णिमा का दान',
    titleEn: 'Purnima daan',
    whyHi:
      'पूर्णिमा व्रत और सत्यनारायण कथा का समापन प्रसाद-वितरण है — खीर/पंचामृत और अन्न बाँटना ही इस तिथि का दान।',
    whyEn:
      'The purnima vrat and Satyanarayan katha close with prasada — sharing kheer/panchamrita and anna is this tithi’s giving.',
    items: [
      { id: 'prasad', nameHi: 'प्रसाद-वितरण · खीर', nameEn: 'Prasada sharing · kheer', reasonHi: 'कथा का विधान ही वितरण पर पूर्ण होता है', reasonEn: 'the katha’s own rite completes in distribution' },
      { id: 'anna', nameHi: 'अन्न', nameEn: 'Anna', reasonHi: 'पूर्णता की तिथि पर अन्न-दान', reasonEn: 'anna on the tithi of fullness' },
    ],
    kathaId: 'satyanarayana-vrat-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/satyanarayana-vrat.ts (shipped, verified)',
        'https://www.drikpanchang.com/purnima/purnima-dates.html',
      ],
      verificationNote:
        '2026-09-01: prasada distribution as the Satyanarayan closing is the shipped katha’s own frame; purnima-daan stated as tradition, no fruit-claims.',
    },
  },
  {
    id: 'ekadashi-parana',
    ruleIds: [],
    ruleIdSuffixes: ['-ekadashi'],
    titleHi: 'एकादशी — पारण का अन्न',
    titleEn: 'Ekadashi — anna at parana',
    whyHi:
      'एकादशी व्रत की परम्परा पारण के साथ अन्न-दान की है — व्रती स्वयं अन्न से दूर रहकर, द्वादशी पर पहले किसी और को अन्न देता है।',
    whyEn:
      'The ekadashi tradition pairs the fast with anna-daan at parana — having abstained, the vrati first gives food to another on dwadashi.',
    items: [
      { id: 'anna-parana', nameHi: 'पारण पर अन्न-दान', nameEn: 'Anna at parana', reasonHi: 'व्रत का पूरक — पहले देना, फिर पाना', reasonEn: 'the fast’s complement — give first, then eat' },
    ],
    kathaId: 'ekadashi-vrat-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'https://www.drikpanchang.com/ekadashi/ekadashi.html',
        'https://www.drikpanchang.com/legends/ekadashi/ekadashi-vrat-katha.html',
      ],
      verificationNote:
        '2026-09-01: the parana convention (dwadashi break, giving before eating stated in the vrat traditions) taken from the Drik ekadashi corpus; stated as tradition, no fruit-claims.',
    },
  },
  {
    id: 'shattila-ekadashi',
    ruleIds: ['shattila-ekadashi'],
    titleHi: 'षटतिला एकादशी — छह प्रकार का तिल',
    titleEn: 'Shattila Ekadashi — the six-fold til',
    whyHi:
      'माघ कृष्ण एकादशी का नाम ही षटतिला है — तिल के छह प्रयोग: स्नान, उबटन, हवन, तर्पण, भोजन और दान। तिल-दान इस दिन स्पष्ट विधान है।',
    whyEn:
      'The Magha krishna ekadashi is named Shattila — six uses of til: bath, ubtan, havan, tarpana, food and daan. Til-daan is this day’s explicit form.',
    items: [
      { id: 'til-daan', nameHi: 'तिल-दान', nameEn: 'Til-daan', reasonHi: 'छह प्रयोगों में छठा — दान', reasonEn: 'the sixth of the six uses — giving' },
    ],
    kathaId: 'shattila-ekadashi-katha',
    status: 'verified',
    source: {
      referenceUrls: [
        'mobile/src/panchang/kathaContent/entries/shattila-ekadashi-katha.ts (shipped, verified)',
        'https://www.drikpanchang.com/ekadashis/shattila/legends/shattila-ekadashi-vrat-katha.html',
      ],
      verificationNote: '2026-09-01: the six-fold til (ṣaṭ-tila) naming with daan as one use concordant with the shipped katha and the external page.',
    },
  },
];

export function getDaanOccasions(): readonly DaanOccasionEntry[] {
  return DAAN_OCCASION_ENTRIES.filter((entry) => entry.status === 'verified');
}

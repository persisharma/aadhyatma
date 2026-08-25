import { upvasEntry } from '../_helpers';

/**
 * Shared entry for the Ekadashi family (every EKADASHI_RULES id except
 * निर्जला, which has its own stricter entry) — the same sharing mechanism as
 * the generic `ekadashi-vrat-katha`.
 */
export default upvasEntry({
  id: 'ekadashi-upvas',
  fastType: 'phalahar',
  fastTypeNoteHi: 'अन्न वर्जित — फलाहार; निर्जल रखना वैकल्पिक कठोर रूप',
  fastTypeNoteEn: 'Grains are abstained — fruit fare; a waterless fast is an optional stricter form',
  window: {
    kind: 'sunrise-to-parana',
    textHi:
      'एकादशी के सूर्योदय से द्वादशी के दिन पारण तक। कई परम्पराओं में दशमी की संध्या से ही सात्त्विक, एक-भुक्त आहार लिया जाता है।',
    textEn:
      'From sunrise on Ekadashi until parana on the Dwadashi day. In many traditions a single sattvik meal is taken from Dashami evening onward.',
  },
  parana: {
    kind: 'next-day-sunrise-tithi-bound',
    boundTithi: 12,
    textHi:
      'द्वादशी के दिन सूर्योदय के बाद, द्वादशी तिथि रहते पारण करें; हरि वासर (द्वादशी का प्रथम चतुर्थांश) में पारण वर्जित माना जाता है। यदि द्वादशी सूर्योदय से पूर्व ही समाप्त हो जाए तो सूर्योदय के बाद पारण करें।',
    textEn:
      'Break the fast after sunrise on the Dwadashi day, while Dwadashi tithi prevails; parana during Hari Vasara (the first quarter of Dwadashi) is held to be prohibited. If Dwadashi ends before sunrise, break the fast after sunrise.',
  },
  strictnessHi:
    'निर्जल, केवल जल, फलाहार या एक-भुक्त — कठोरता परिवार-परम्परा अनुसार चुनी जाती है। स्मार्त और वैष्णव परम्पराओं में एकादशी के दिन-निर्णय में अंतर हो सकता है। परंपरा अनुसार बालक, वृद्ध एवं अस्वस्थ फलाहार में छूट रख सकते हैं।',
  strictnessEn:
    'Waterless, water-only, fruit fare, or one meal — the strictness follows family tradition. Smarta and Vaishnava traditions may differ on which day the Ekadashi is observed. Traditionally children, the elderly, and the unwell may observe leniently with fruit fare.',
  whoObservesHi: 'विष्णु उपासक एवं एकादशी व्रती।',
  whoObservesEn: 'Vishnu devotees and those who keep the Ekadashi vrat.',
  status: 'verified',
  source: {
    referenceUrls: [
      'https://www.drikpanchang.com/ekadashis/parana/ekadashi-vrat-parana.html',
      'https://www.iskconbangalore.org/blog/ekadashi/',
    ],
    verificationNote:
      'Verified 2026-08-19 against the full DrikPanchang parana article and ISKCON Bangalore Ekadashi guide: grain abstention and graduated fasting forms, next-day post-sunrise parana, the Dwadashi/Hari-Vasara boundary, and health/age-based leniency. DrikPanchang separately attests the Smarta/Vaishnava date divergence.',
  },
});

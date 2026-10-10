/**
 * "Know the nine grahas" — the GENERIC reference (design.md §79).
 *
 * This is the teaching surface: what each graha is, for anyone, independent of
 * any chart. It is deliberately separate from the personal reading
 * (`grahaReadingNarrative.ts`), so the chart card can stay a reading and not a
 * datasheet. The nature and signifies lines below are authored; the name,
 * meaning, maitri and weekday shown on the reference screen are reused from the
 * already-reviewed tables (GRAHA_PLAIN, maitri, GRAHA_UPAY).
 *
 * Generic educational copy — the §14.3.5 bans (no fate, illness, commerce,
 * fear) still hold and are scanned by grahaReference.test.ts.
 */

import type { Graha } from './kundali';

export type GrahaReferenceEntry = {
  /** One or two plain sentences on the graha's nature and role. */
  natureHi: string;
  natureEn: string;
  /** The life areas it naturally governs, as a short phrase. */
  signifiesHi: string;
  signifiesEn: string;
};

export const GRAHA_REFERENCE: Readonly<Record<Graha, GrahaReferenceEntry>> = {
  sun: {
    natureHi: 'सूर्य आत्मा, पिता और अधिकार का कारक है — वह भीतर का प्रकाश जिससे आत्मविश्वास, तेज और नेतृत्व आता है। परम्परा इसे ग्रहों का राजा कहती है।',
    natureEn: 'The Sun stands for the soul, the father and authority — the inner light from which confidence, vitality and leadership come. Tradition calls it the king among the grahas.',
    signifiesHi: 'स्वयं · पिता · तेज · नेतृत्व',
    signifiesEn: 'the self · father · vitality · leadership',
  },
  moon: {
    natureHi: 'चन्द्र मन, भावनाओं और माता का कारक है। वह मन की लय और कोमलता को दर्शाता है, और यही जन्म-नक्षत्र तथा विम्शोत्तरी दशा का आधार भी है।',
    natureEn: 'The Moon stands for the mind, the emotions and the mother. It shows the rhythm and tenderness of feeling, and it also seeds the birth nakshatra and the Vimshottari sequence.',
    signifiesHi: 'मन · माता · भाव · शांति',
    signifiesEn: 'the mind · mother · feeling · ease',
  },
  mars: {
    natureHi: 'मंगल ऊर्जा, साहस और परिश्रम का कारक है — काम में उतरने का बल और रक्षा करने की वृत्ति। परम्परा इसे ग्रहों का सेनापति कहती है।',
    natureEn: 'Mars stands for energy, courage and drive — the force to act and the instinct to protect. Tradition calls it the commander among the grahas.',
    signifiesHi: 'साहस · ऊर्जा · भाई · भूमि',
    signifiesEn: 'courage · energy · siblings · land',
  },
  mercury: {
    natureHi: 'बुध बुद्धि, वाणी और व्यापार का कारक है — सीखने, समझने और बात रखने की कुशलता। परम्परा इसे ग्रहों का युवराज कहती है।',
    natureEn: 'Mercury stands for intellect, speech and commerce — the skill to learn, grasp and express. Tradition calls it the young prince among the grahas.',
    signifiesHi: 'बुद्धि · वाणी · व्यापार · सीखना',
    signifiesEn: 'intellect · speech · trade · learning',
  },
  jupiter: {
    natureHi: 'गुरु (बृहस्पति) ज्ञान, धर्म और विस्तार का कारक है — शिक्षक, मार्गदर्शक और शुभ का दाता। परम्परा इसे ग्रहों का गुरु कहती है।',
    natureEn: 'Jupiter stands for wisdom, dharma and growth — the teacher, the guide and the giver of grace. Tradition calls it the preceptor among the grahas.',
    signifiesHi: 'ज्ञान · धर्म · संतान · समृद्धि',
    signifiesEn: 'wisdom · dharma · children · abundance',
  },
  venus: {
    natureHi: 'शुक्र प्रेम, सौंदर्य और कला का कारक है — संबंध, सुख और सृजन की ओर झुकाव। परम्परा इसे दैत्यों का गुरु कहती है।',
    natureEn: 'Venus stands for love, beauty and art — the pull toward relationship, comfort and creation. Tradition calls it the preceptor of a second lineage of sages.',
    signifiesHi: 'प्रेम · सौंदर्य · कला · साझेदारी',
    signifiesEn: 'love · beauty · art · partnership',
  },
  saturn: {
    natureHi: 'शनि अनुशासन, समय और धैर्य का कारक है — परिश्रम, संरचना और कर्म का न्याय। वह जल्दी नहीं, पर टिकाऊ फल देता है, और परम्परा इसे न्यायाधीश मानती है।',
    natureEn: 'Saturn stands for discipline, time and patience — labour, structure and the justice of one’s own deeds. It gives not quickly but lastingly, and tradition regards it as the judge among the grahas.',
    signifiesHi: 'अनुशासन · परिश्रम · धैर्य · सेवा',
    signifiesEn: 'discipline · labour · patience · service',
  },
  rahu: {
    natureHi: 'राहु छाया-ग्रह है — महत्वाकांक्षा, तीव्र इच्छा और अपरिचित की ओर खिंचाव का कारक। वह अचानक वृद्धि और नएपन से जुड़ा है।',
    natureEn: 'Rahu is a shadow graha — it stands for ambition, intense desire and a pull toward the unfamiliar. It is linked with sudden rise and with the new.',
    signifiesHi: 'महत्वाकांक्षा · इच्छा · विदेश · नवीनता',
    signifiesEn: 'ambition · desire · foreign lands · the new',
  },
  ketu: {
    natureHi: 'केतु छाया-ग्रह है — वैराग्य, अंतर्दृष्टि और आध्यात्मिक खोज का कारक। वह पकड़ छोड़ना और भीतर मुड़ना सिखाता है।',
    natureEn: 'Ketu is a shadow graha — it stands for detachment, insight and spiritual seeking. It teaches letting go and the turn inward.',
    signifiesHi: 'वैराग्य · अंतर्दृष्टि · मोक्ष · मुक्ति',
    signifiesEn: 'detachment · insight · moksha · release',
  },
};

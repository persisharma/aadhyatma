/**
 * दान के प्रयोजन — the CAUSE axis (PRD-26 §5.1, RULEBOOK §27.12).
 *
 * Two axes exist and must not be conflated:
 *   - `DaanCategory` (ledger.ts) is the **dravya** — WHAT was given (anna,
 *     vastra, til, deep, shram…). It is what the खाता records.
 *   - `DaanCause` (here) is the **प्रयोजन** — WHOM the giving serves (food
 *     relief, gaushala, children, elders, animals…). It is how the दान-द्वार
 *     is organised and how an occasion points at the right door.
 *
 * MAHATVA (RULEBOOK §27.14): every cause carries the reason its daan is held
 * dear — the द्वार explains before it lists, and the explanation is the larger
 * half of the screen. A cause that makes a **scriptural or textual claim**
 * MUST carry the paired `citeHi`/`citeEn` and a review-only `source`; a cause
 * whose mahatva is plain tradition-register prose (what the giving actually
 * relieves) carries neither — an invented citation is worse than none.
 *
 * PURPOSE BRIDGE (`purposeId`): the app already ships an intent taxonomy for
 * TEXTS (`data/purposes.ts` — protection, knowledge, health, wealth…). Only
 * the two causes whose names ARE that vocabulary are bridged — विद्या →
 * `knowledge`, आरोग्य → `health`. `wealth`/`prosperity` are deliberately NOT
 * bridged: pointing "give here" at a prosperity intent is the fruit-promise
 * the §2 stance guard bans. An unbridged cause is honest; an invented bridge
 * is not (RULEBOOK §27.9).
 */
import type { PurposeId } from '@/data/purposes';
import type { DaanCause, DaanSource } from './types';

export type DaanCauseMeta = {
  id: DaanCause;
  nameHi: string;
  nameEn: string;
  /** One line: whom this serves — rendered under the cause heading. */
  whomHi: string;
  whomEn: string;
  /** Why this daan is held dear — the द्वार's teaching, above the places. */
  mahatvaHi: string;
  mahatvaEn: string;
  /** Present ONLY where the mahatva makes a textual claim; paired with `source`. */
  citeHi?: string;
  citeEn?: string;
  /** Review-only. Required exactly when `citeHi`/`citeEn` are present. */
  source?: DaanSource;
  /** Only where the app's own text-intent vocabulary already names it. */
  purposeId?: PurposeId;
};

/** Display order: the dharmic ordering — anna first (the §10 Anuśāsana spine). */
export const DAAN_CAUSES: readonly DaanCauseMeta[] = [
  {
    id: 'anna',
    nameHi: 'अन्न-जल सेवा', nameEn: 'Food & water',
    whomHi: 'भूखे और प्यासे — अन्नक्षेत्र, मध्याह्न भोजन, प्याऊ',
    whomEn: 'the hungry and thirsty — anna-kshetras, mid-day meals, water',
    mahatvaHi:
      'शरशय्या पर भीष्म युधिष्ठिर से कहते हैं कि अन्न-दान से बड़ा कोई दान नहीं — प्राणी अन्न से ही जन्मते हैं और अन्न से ही जीते हैं। जो भूखे को भोजन देता है, वह उसे एक दिन का जीवन देता है; इसीलिए हर पर्व की दान-सूची में अन्न पहले आता है। भूख वह अभाव है जो प्रतिदिन लौटता है, और अन्न-दान वह दान है जो प्रतिदिन दिया जा सकता है।',
    mahatvaEn:
      'From the bed of arrows Bhīṣma tells Yudhiṣṭhira that no gift exceeds anna-daan — beings are born of food and live by food. To feed the hungry is to give a day of life; this is why anna heads every festival’s list of gifts. Hunger is the lack that returns every day, and anna-daan the gift that can be made every day.',
    citeHi: 'महाभारत · अनुशासन (दानधर्म) पर्व',
    citeEn: 'Mahābhārata · Anuśāsana (Dāna-dharma) Parva',
    source: {
      referenceUrls: [
        'mobile/src/data/daan/principles.ts (anna-daan-supremacy, verified 2026-09-01)',
        'https://sacred-texts.com/hin/m13/m13a022.htm',
      ],
      verificationNote:
        '2026-09-05: restates the already-verified anna-daan-supremacy principle row (Anuśāsana-parva dāna-dharma teaching) as the cause mahatva; cross-checked against the Ganguli translation. Teaching summary with citation — no verse transcription.',
    },
  },
  {
    id: 'gau',
    nameHi: 'गौ-सेवा', nameEn: 'Gau seva',
    whomHi: 'गौवंश — गौशाला, चारा, गौ-ग्रास',
    whomEn: 'cows — gaushalas, fodder, gau-gras',
    mahatvaHi:
      'गाय भारतीय परम्परा में कामधेनु मानी गई है, और श्रीकृष्ण का नाम ही गोविन्द — गायों को आनन्द देने वाला — है। इसीलिए भोजन से पहले पहली रोटी गौ-ग्रास के लिए निकालने की रीति चली आई: दान की शुरुआत उससे जो माँग नहीं सकता। आज यही सेवा गौशाला के चारे, चिकित्सा और वृद्ध-अशक्त गौवंश के आश्रय के रूप में होती है।',
    mahatvaEn:
      'In this tradition the cow is Kāmadhenu, and Krishna’s very name — Govinda — means the one who delights the cows. Hence the old household rule of setting aside the first roti as gau-gras before anyone eats: giving begins with the one who cannot ask. Today that same seva takes the form of fodder, treatment, and shelter for old and infirm cattle in a gaushala.',
    citeHi: 'गौ-सेवा विधि (ऐप में) · महाभारत, अनुशासन पर्व की गौ-महिमा',
    citeEn: 'The app’s own Gau Seva vidhi · the gau-mahima of the Anuśāsana Parva',
    source: {
      referenceUrls: [
        'mobile/src/data/sanskar/gau-seva.json (bundled, verified 2026-05-30)',
        'https://sanskritdocuments.org/doc_deities_misc/gosevAstuti.html',
      ],
      verificationNote:
        '2026-09-05: the Kāmadhenu/Govinda framing and the gau-gras practice are taken from the app’s own already-verified gau-seva vidhi; cross-checked against the Go-sevā-stuti on Sanskrit Documents. Summary only.',
    },
  },
  {
    id: 'bal',
    nameHi: 'बाल-सेवा', nameEn: 'Children',
    whomHi: 'बच्चे — पोषण, सुरक्षा, विद्यालय',
    whomEn: 'children — nutrition, protection, schooling',
    mahatvaHi:
      'नवरात्रि की कन्या-पूजन की रीति यही सिखाती है — बालिका को देवी मानकर भोजन, वस्त्र और दक्षिणा देना। परम्परा बच्चे में देवता देखती है, इसलिए बाल-सेवा दया नहीं, आदर है। भूखा या अनपढ़ रह गया बच्चा एक दिन का नहीं, पूरे जीवन का अभाव ढोता है; यहाँ दिया गया अन्न, पुस्तक या सुरक्षा वहीं तक जाती है।',
    mahatvaEn:
      'Navratri’s kanya-pujan teaches it directly — a young girl is honoured as the Devi and given food, cloth and dakshina. The tradition sees a deity in the child, so serving children is respect, not pity. A child left hungry or unschooled carries the lack for a lifetime, not for a day; food, a book or safety given here reaches that far.',
    citeHi: 'नवरात्रि कन्या-पूजन की परम्परा',
    citeEn: 'The Navratri kanya-pujan tradition',
    source: {
      referenceUrls: [
        'mobile/src/data/daan/occasions.ts (navratri-kanya-bhoj, verified 2026-09-02)',
        'https://www.drikpanchang.com/navratri/kanya-pujan.html',
      ],
      verificationNote:
        '2026-09-05: restates the already-verified navratri-kanya-bhoj occasion row (kanya-pujan: bhojan, vastra, dakshina) as the cause mahatva; cross-checked against Drik Panchang’s kanya-pujan page.',
    },
  },
  {
    id: 'vriddha',
    nameHi: 'वृद्ध-सेवा', nameEn: 'Elder care',
    whomHi: 'वृद्धजन — आश्रय, चिकित्सा, आजीविका',
    whomEn: 'elders — shelter, medical care, livelihood',
    mahatvaHi:
      'जिस पीढ़ी ने पहले दिया, उसे अन्त में अभाव में छोड़ देना गृहस्थ-धर्म की सबसे बड़ी चूक मानी गई है। वृद्धावस्था का अभाव प्रायः अन्न का नहीं, अकेलेपन, औषधि और आश्रय का होता है — और वह किसी से माँगा नहीं जाता। इसीलिए यह सेवा प्रायः चुपचाप की जाती है: बुज़ुर्ग का उपचार, चश्मा, दवा, या दो समय का भोजन।',
    mahatvaEn:
      'To let the generation that gave first end in want is held to be the householder’s gravest lapse. What old age lacks is usually not food but medicine, shelter and company — and none of it is easily asked for. So this seva is usually done quietly: an elder’s treatment, spectacles, medicines, or two meals a day.',
  },
  {
    id: 'vidya',
    nameHi: 'विद्या-दान', nameEn: 'Education',
    whomHi: 'विद्यार्थी — पुस्तकें, शुल्क, शिक्षण',
    whomEn: 'learners — books, fees, teaching',
    mahatvaHi:
      'गुरु पूर्णिमा और वसंत पंचमी दोनों पर विद्या-दान की रीति है — पुस्तक, लेखनी, शुल्क या स्वयं पढ़ाने का समय। विद्या वह एक दान है जो देने से घटती नहीं; और यह पात्र को आगे देने योग्य बना देती है, इसलिए परम्परा इसे अन्न-दान के बाद रखती है।',
    mahatvaEn:
      'Both Guru Purnima and Vasant Panchami carry the practice of vidya-daan — a book, a pen, a term’s fees, or one’s own hours of teaching. Knowledge is the one gift that does not diminish in the giving; and it leaves the receiver able to give in turn, which is why tradition places it next after anna-daan.',
    citeHi: 'गुरु पूर्णिमा एवं वसंत पंचमी की दान-परम्परा',
    citeEn: 'The daan tradition of Guru Purnima and Vasant Panchami',
    source: {
      referenceUrls: [
        'mobile/src/data/daan/occasions.ts (guru-purnima, vasant-panchami — verified 2026-09-01)',
        'https://www.drikpanchang.com/festivals/guru-purnima/guru-purnima-date-time.html',
      ],
      verificationNote:
        '2026-09-05: restates the already-verified guru-purnima and vasant-panchami occasion rows (vidya-daan items) as the cause mahatva; cross-checked against Drik Panchang.',
    },
    purposeId: 'knowledge',
  },
  {
    id: 'arogya',
    nameHi: 'आरोग्य-सेवा', nameEn: 'Health',
    whomHi: 'रोगी — चिकित्सा, रक्त-दान, औषधि',
    whomEn: 'the ill — medical care, blood donation, medicine',
    mahatvaHi:
      'औषध-दान और अभय-दान — रोगी को उपचार देना और भय से मुक्त करना — दान-सूचियों में सदा साथ आते हैं, क्योंकि रोग में अभाव और भय एक साथ आते हैं। रक्त-दान इसी का आज का रूप है: यहाँ दिया गया धन नहीं, शरीर से निकला वह दान है जिसका कोई मूल्य नहीं लगाया जा सकता और जिसे टाला भी नहीं जा सकता।',
    mahatvaEn:
      'Aushadha-daan and abhaya-daan — giving a sick person treatment, and giving them freedom from fear — travel together in the old lists, because illness brings want and fear at once. Blood donation is this in its present form: what is given is not money but something out of one’s own body, which cannot be priced and cannot be postponed.',
    purposeId: 'health',
  },
  {
    id: 'vastra',
    nameHi: 'वस्त्र-सेवा', nameEn: 'Clothing',
    whomHi: 'ठिठुरते हुए — वस्त्र, कम्बल, गरिमा',
    whomEn: 'those without cover — cloth, blankets, dignity',
    mahatvaHi:
      'मकर संक्रान्ति और अमावस्या पर वस्त्र, कम्बल और तिल दान की रीति ऋतु से बँधी है — दान वहाँ दिया जाता है जहाँ अभाव उसी समय है। वस्त्र केवल शीत से नहीं बचाता, वह लज्जा और गरिमा की रक्षा करता है; इसीलिए द्रौपदी की कथा में वस्त्र ही रक्षा का प्रतीक बनता है।',
    mahatvaEn:
      'The practice of giving cloth, blankets and til on Makar Sankranti and on amavasya is tied to the season — the gift is made where the want is, when it is. Cloth does not only keep out cold; it guards dignity, which is why in Draupadi’s story it is cloth itself that becomes the emblem of protection.',
    citeHi: 'मकर संक्रान्ति एवं अमावस्या की दान-परम्परा',
    citeEn: 'The daan tradition of Makar Sankranti and amavasya',
    source: {
      referenceUrls: [
        'mobile/src/data/daan/occasions.ts (makar-sankranti, amavasya — verified 2026-09-01)',
        'https://www.drikpanchang.com/festivals/makar-sankranti/makar-sankranti-date-time.html',
      ],
      verificationNote:
        '2026-09-05: restates the already-verified makar-sankranti and amavasya occasion rows (vastra/kambal/til items, the ritu reasoning) as the cause mahatva; cross-checked against Drik Panchang.',
    },
  },
  {
    id: 'jeev',
    nameHi: 'जीव-सेवा', nameEn: 'Animals & birds',
    whomHi: 'पशु-पक्षी — आश्रय, चिकित्सा, दाना-पानी',
    whomEn: 'animals and birds — shelter, treatment, feed and water',
    mahatvaHi:
      'गृहस्थ की पंचबलि-परम्परा में एक भाग सदा पशु-पक्षियों का रहा है — छत पर दाना, आँगन में जल। यह वह दान है जिसका न कोई प्रत्युपकार सम्भव है, न धन्यवाद; इसीलिए परम्परा इसे निष्काम दान की सबसे सरल कसौटी मानती है। ग्रीष्म में रखा जल-पात्र और घायल पशु का उपचार आज भी वही सेवा है।',
    mahatvaEn:
      'In the householder’s panchabali practice one share always belonged to animals and birds — grain on the roof, water in the courtyard. This is the gift that can bring back no return and no thanks; tradition therefore treats it as the plainest test of giving without expectation. A water bowl set out in summer, or treatment for an injured animal, is that same seva today.',
  },
  {
    id: 'aapada',
    nameHi: 'आपदा-राहत', nameEn: 'Disaster relief',
    whomHi: 'आपदा-पीड़ित — तत्काल राहत और पुनर्वास',
    whomEn: 'those struck by disaster — immediate relief and rebuilding',
    mahatvaHi:
      'दान का एक अंग देश-काल है — सुपात्र वही है जिसे इसी समय आवश्यकता हो। बाढ़, भूकम्प या अकाल में वह काल सामने आ खड़ा होता है, और तब दान पर्व की प्रतीक्षा नहीं करता। यहाँ दिया गया सीधे अन्न, आश्रय और पुनर्निर्माण बनता है — और लौटने में देर हुई तो व्यर्थ हो जाता है।',
    mahatvaEn:
      'One limb of giving is desha-kāla — the fit receiver is the one whose need is now. Flood, earthquake or famine puts that "now" in front of you, and then giving does not wait for a festival. What is given here becomes food, shelter and rebuilding directly — and given late, it is wasted.',
  },
];

const CAUSE_BY_ID = new Map(DAAN_CAUSES.map((cause) => [cause.id, cause] as const));

export function getDaanCause(id: DaanCause): DaanCauseMeta | null {
  return CAUSE_BY_ID.get(id) ?? null;
}

/** The cause a text-intent purpose honestly names, or null (never invented). */
export function causeForPurpose(purposeId: PurposeId): DaanCauseMeta | null {
  return DAAN_CAUSES.find((cause) => cause.purposeId === purposeId) ?? null;
}

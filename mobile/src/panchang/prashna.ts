import { computeGocharSnapshot, findNextIngress, SLOW_INGRESS_SCAN_DAYS } from './gochar';
import { DASHA_LORD_KEYWORDS_EN, DASHA_LORD_KEYWORDS_HI } from './dashaReading';
import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  HOUSE_THEME_EN,
  HOUSE_THEME_HI,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  getCurrentDasha,
  indiaDateKey,
} from './kundali';
import type { DashaLord, Graha, GrahaPosition, KundaliChart } from './kundali';
import {
  DIGNITY_LABEL_EN,
  DIGNITY_LABEL_HI,
  DUSTHANA_HOUSES,
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  ageBandAt,
  dignityOfPosition,
  type AgeBand,
  type BasisNode,
} from './kundaliBasis';
import { RASHI_LORD_BY_INDEX } from './kundaliYoga';
import type { KundaliReportPracticeId } from './kundaliReportModel';
import { getPurpose, type PrashnaPurpose, type PurposeId } from './prashnaPurposes';
import {
  ageBetween,
  ageLabelEn,
  ageLabelHi,
  bhavaLabelEn,
  bhavaLabelHi,
  formatIstDateEn,
  formatIstDateHi,
} from './reportFormat';

/**
 * प्रश्न — a purpose-driven reading, composed the way an astrologer gives it
 * (PRD-43 Wave D; RULEBOOK §14.3).
 *
 * Five deterministic passes over data the chart already carries:
 *   1. gather  — the purpose's bhavas (sign, lord, lord's seat, occupants) and
 *                its karakas (seat, dignity);
 *   2. weigh   — each fact becomes a signed factor WITH its basis attached at
 *                creation (§14.3.1 — there is no later "add sourcing" step);
 *   3. time    — the running Maha/Antar lords and the slow transits, as dated
 *                windows (§14.3.4), never event dates;
 *   4. resolve — strength is COUNTED from independent agreeing groups; one
 *                factor can never render प्रबल; contradiction is shown, not
 *                resolved in the flattering direction (§14.3.3);
 *   5. speak   — sentences assembled from the phrase tables below, keyed on
 *                (purpose × strength × age band); nothing authored per chart.
 *
 * Pure: no React, storage, wall clock, randomness or network. The answer is
 * plain JSON. A purpose closed by the subject's derived age returns a gated
 * answer with NO reading (§14.3.5).
 */

export type PrashnaStrength = 'prabal' | 'madhyam' | 'ksheen';
export type FactorPolarity = 'support' | 'resist' | 'qualify';

export type PrashnaFactor = {
  id: string;
  polarity: FactorPolarity;
  /** 2 = primary-bhava or karaka-in-bhava grade; 1 = ordinary. */
  weight: 1 | 2;
  /** Independence group — strength counts DISTINCT groups, not factors. */
  group: string;
  textHi: string;
  textEn: string;
  basis: readonly BasisNode[];
};

export type PrashnaChain = { labelHi: string; labelEn: string; basis: readonly BasisNode[] };

export type PrashnaWindow = {
  id: string;
  startKey: string;
  endKey: string | null;
  labelHi: string;
  labelEn: string;
  textHi: string;
  textEn: string;
  /** Runs at the report date. */
  current: boolean;
  /** Touches the purpose's bhavas or karakas. */
  relevant: boolean;
  basis: readonly BasisNode[];
};

export type PrashnaAnswer = {
  answerVersion: 1;
  purposeId: PurposeId;
  purposeNameHi: string;
  purposeNameEn: string;
  generatedDateKey: string;
  asOfLabelHi: string;
  asOfLabelEn: string;
  ageBand: AgeBand;
  ageLabelHi: string;
  ageLabelEn: string;
  gated: boolean;
  gateReasonHi: string | null;
  gateReasonEn: string | null;
  strength: PrashnaStrength | null;
  supportGroups: number;
  resistGroups: number;
  saarTitleHi: string;
  saarTitleEn: string;
  saarBodyHi: string;
  saarBodyEn: string;
  aadhaarIntroHi: string;
  aadhaarIntroEn: string;
  chains: readonly PrashnaChain[];
  supports: readonly PrashnaFactor[];
  resists: readonly PrashnaFactor[];
  qualifies: readonly PrashnaFactor[];
  kaalIntroHi: string;
  kaalIntroEn: string;
  windows: readonly PrashnaWindow[];
  dishaHi: readonly string[];
  dishaEn: readonly string[];
  practiceSourceId: KundaliReportPracticeId;
  practiceNoteHi: string;
  practiceNoteEn: string;
  footerHi: string;
  footerEn: string;
};

export type PrashnaOptions = {
  /** Days scanned for future ingress; 0 still includes the current snapshot. */
  gocharScanDays?: number;
};

const NATURAL_BENEFICS: readonly Graha[] = ['jupiter', 'venus', 'mercury', 'moon'];
const MAX_WINDOWS = 4;
const MAX_CHAINS = 5;

/* ------------------------------------------------------------------ */
/*  Phrase tables                                                      */
/* ------------------------------------------------------------------ */

type Pair = { hi: string; en: string };
const P = (hi: string, en: string): Pair => ({ hi, en });

const SAAR: Readonly<Record<PurposeId, Readonly<Record<PrashnaStrength, Pair>>>> = {
  vidya: {
    prabal: P('पढ़ाई की नींव मज़बूत है — गति अपनी, पर पकड़ पक्की।', 'The foundation for study is strong — at its own pace, but with a firm grip.'),
    madhyam: P('पढ़ाई में बल और बाधा दोनों हैं — सही दिशा चुनना अकेले परिश्रम से अधिक मायने रखता है।', 'Study shows both support and resistance — choosing the right direction matters more than effort alone.'),
    ksheen: P('पढ़ाई में सहज बल कम है — यहाँ ढाँचा और धैर्य ही रास्ता बनाते हैं।', 'Natural support for study is thin — structure and patience make the road here.'),
  },
  vyapar: {
    prabal: P('उद्यम के लिए कुंडली तैयार है — आरम्भ का काल चुनें।', 'The chart is ready for enterprise — choose the window to begin.'),
    madhyam: P('उद्यम सम्भव है, पर शर्तों पर — साझेदारी और पूँजी में सावधानी।', 'Enterprise is workable, on terms — care in partnership and capital.'),
    ksheen: P('स्वतंत्र उद्यम के लिए सहज बल कम है — परम्परा पहले सेवा में स्थिरता की सलाह देती है।', 'Natural support for independent enterprise is thin — tradition counsels steadiness in service first.'),
  },
  naukri: {
    prabal: P('पद और साख का काल है — जहाँ हैं वहीं विस्तार माँगें।', 'A time of standing and recognition — ask for growth where you are.'),
    madhyam: P('नौकरी में स्थिरता है, बदलाव धीमा — हर प्रस्ताव लिखित में लें।', 'Service is steady and change is slow — take every offer in writing.'),
    ksheen: P('कार्यक्षेत्र में बल अभी कम है — प्रतीक्षा और कौशल जोड़ने का काल।', 'Support at work is thin just now — a time for patience and for adding skills.'),
  },
  dhan: {
    prabal: P('संचय और आय दोनों सधे हैं — संपत्ति का निर्णय सोच-समझकर।', 'Both saving and income are well-founded — property decisions with deliberation.'),
    madhyam: P('आय ठीक है, संचय में अनुशासन चाहिए।', 'Income holds; saving asks for discipline.'),
    ksheen: P('धन-भाव अभी कम सहारा देते हैं — ख़र्च का ढाँचा पहले, निवेश बाद में।', 'The wealth houses lend little support just now — structure spending first, invest later.'),
  },
  vivah: {
    prabal: P('साथ के लिए कुंडली अनुकूल है — किसी एक मिलान के लिए गुण-मिलान देखें।', 'The chart favours partnership — see Guna Milan for a specific match.'),
    madhyam: P('साथ सम्भव है, पर अपेक्षाएँ स्पष्ट कहनी होंगी।', 'Partnership is workable; expectations need to be spoken plainly.'),
    ksheen: P('सप्तम भाव में सहज बल कम है — परम्परा धैर्य और समय की सलाह देती है।', 'Natural support in the 7th is thin — tradition counsels patience and time.'),
  },
  santan: {
    prabal: P('संतान-भाव सशक्त है।', 'The house of children is strong.'),
    madhyam: P('संतान-भाव में बल और बाधा दोनों — परम्परा गुरु के काल की ओर देखती है।', 'Both support and resistance in the house of children — tradition looks to Jupiter’s periods.'),
    ksheen: P('संतान-भाव को सहारा कम है — यह धैर्य का विषय है; चिकित्सक की सलाह का विकल्प नहीं।', 'The house of children has thin support — a matter for patience; this does not replace medical advice.'),
  },
  swasthya: {
    prabal: P('प्रकृति सुदृढ़ है — दिनचर्या इसे बनाए रखती है।', 'The constitution is robust — routine keeps it so.'),
    madhyam: P('प्रकृति ठीक है, पर दिनचर्या माँगती है।', 'The constitution holds, but asks for routine.'),
    ksheen: P('प्रकृति संवेदनशील है — नींद, भोजन और विश्राम का समय सबसे पहले।', 'The constitution is sensitive — sleep, meals and rest come first.'),
  },
  yatra: {
    prabal: P('स्थान-परिवर्तन और यात्रा के लिए कुंडली अनुकूल है।', 'The chart favours movement and travel.'),
    madhyam: P('यात्रा सम्भव है; लम्बे प्रवास के लिए काल देखें।', 'Travel is workable; for a long stay, mind the window.'),
    ksheen: P('दूर जाने में सहज बल कम है — निकट और छोटे बदलाव अधिक सधते हैं।', 'Natural support for going far is thin — near and small moves sit better.'),
  },
  man: {
    prabal: P('मन स्थिर है — इसे थामने वाली आदतें पहले से हैं।', 'The mind is steady — the habits that hold it are already there.'),
    madhyam: P('मन में लय है पर बेचैनी भी — दिनचर्या इसे थामती है।', 'The mind has rhythm and restlessness both — routine holds it.'),
    ksheen: P('मन को सहारा चाहिए — एकांत, नींद और एक नियमित साधना।', 'The mind asks for support — solitude, sleep and one regular practice.'),
  },
};

/** Purpose-specific direction lines, by strength. */
const DISHA: Readonly<Record<PurposeId, Readonly<Record<PrashnaStrength, readonly Pair[]>>>> = {
  vidya: {
    prabal: [P('पढ़ने का एक निश्चित समय बनाएँ — घंटे बढ़ाने से कम, रोज़ उसी समय बैठने से अधिक लाभ।', 'Fix one regular study time — sitting at the same hour daily does more than adding hours.'), P('रुचि वाले विषय को गहराई दें; बाकी में नियमितता पर्याप्त है।', 'Go deep on the subject of interest; regularity is enough in the rest.')],
    madhyam: [P('विषय चुनने में समय लगाएँ — जो सहज लगे, उसी पर टिकें।', 'Take time choosing subjects — stay with what comes naturally.'), P('हर विषय का कम से कम एक सत्र पूरा करें, फिर बदलें।', 'Finish at least one full term of a subject before changing.')],
    ksheen: [P('ढाँचा पहले: समय-सारिणी, छोटे लक्ष्य, रोज़ की समीक्षा।', 'Structure first: a timetable, small goals, a daily review.'), P('एक अच्छा शिक्षक या समूह खोजें — अकेले पढ़ना यहाँ कठिन पड़ता है।', 'Find a good teacher or group — studying alone sits hard here.')],
  },
  vyapar: {
    prabal: [P('स्वतंत्र रूप से आरम्भ करें; कार्य ऐसा चुनें जिसमें रुचि या सेवा हो।', 'Begin independently; choose work with interest or service in it.'), P('आरम्भ की तिथि मुहूर्त खोजक से चुनें।', 'Choose the starting date with the Muhurat finder.')],
    madhyam: [P('छोटे से आरम्भ करें और छह महीने का लेखा रखें, फिर बढ़ाएँ।', 'Start small and keep six months of accounts before scaling.'), P('साझेदारी हो तो हर शर्त लिखित।', 'If there is a partner, every term in writing.')],
    ksheen: [P('अभी कौशल और पूँजी जोड़ें; उद्यम के लिए अगला अनुकूल काल देखें।', 'Add skill and capital now; watch for the next supportive window for enterprise.'), P('पहले किसी चलते व्यापार में अनुभव लें।', 'Gain experience in a running business first.')],
  },
  naukri: {
    prabal: [P('भीतर विस्तार और नई भूमिका माँगें — यह काल इसके लिए अनुकूल माना जाता है।', 'Ask for growth and a new role where you are — tradition reads this as a supportive time for it.'), P('साख पर काम करें: दिखने वाले काम, लिखित उपलब्धि।', 'Work on standing: visible work, written record.')],
    madhyam: [P('प्रस्ताव आएँ तो लिखित रूप में लें और महीने भर सोचें।', 'Take any offer in writing and sit with it a month.'), P('असंतोष के दिन कोई अन्तिम निर्णय न लें।', 'Make no final decision on a day of discontent.')],
    ksheen: [P('कौशल जोड़ें, प्रमाण-पत्र लें — बदलाव के लिए अगला काल देखें।', 'Add skills and credentials — watch for the next window before changing.'), P('वरिष्ठों से सम्बन्ध बनाए रखें।', 'Keep relationships with seniors steady.')],
  },
  dhan: {
    prabal: [P('आय के दूसरे स्रोत पर काम करें; संपत्ति का निर्णय किसी एक विश्वस्त व्यक्ति से कहकर लें।', 'Work on a second source of income; take property decisions after saying them aloud to one trusted person.'), P('यह वित्तीय सलाह नहीं है — निवेश का निर्णय अपने सलाहकार से लें।', 'This is not financial advice — take investment decisions with your adviser.')],
    madhyam: [P('मासिक बचत का नियम तय करें, राशि छोटी हो तो भी।', 'Fix a monthly saving rule, however small the amount.'), P('यह वित्तीय सलाह नहीं है — निवेश का निर्णय अपने सलाहकार से लें।', 'This is not financial advice — take investment decisions with your adviser.')],
    ksheen: [P('ख़र्च का ढाँचा पहले — तीन महीने का लेखा रखें।', 'Structure spending first — keep three months of accounts.'), P('यह वित्तीय सलाह नहीं है — निवेश का निर्णय अपने सलाहकार से लें।', 'This is not financial advice — take investment decisions with your adviser.')],
  },
  vivah: {
    prabal: [P('किसी एक कुंडली से मिलान के लिए गुण-मिलान देखें।', 'For a specific match, see Guna Milan.'), P('विवाह की तिथि मुहूर्त खोजक से चुनें।', 'Choose the wedding date with the Muhurat finder.')],
    madhyam: [P('अपेक्षाएँ पहले कहें — घर, काम, परिवार — फिर आगे बढ़ें।', 'Speak expectations first — home, work, family — then proceed.'), P('विवाह-निर्णय व्यक्तियों और परिवारों के अपने विवेक का विषय है।', 'Marriage decisions remain a matter for the people and families involved.')],
    ksheen: [P('जल्दी नहीं — परम्परा यहाँ समय देने की सलाह देती है।', 'No haste — tradition counsels giving this time.'), P('विवाह-निर्णय व्यक्तियों और परिवारों के अपने विवेक का विषय है।', 'Marriage decisions remain a matter for the people and families involved.')],
  },
  santan: {
    prabal: [P('गुरु के काल और गुरुवार को परिवार के संकल्प के लिए परम्परा अनुकूल मानती है।', 'Tradition reads Jupiter’s periods and Thursdays as supportive for a family resolve.')],
    madhyam: [P('गुरु की दशा या गोचर का काल देखें।', 'Watch for a Jupiter dasha or transit window.'), P('चिकित्सा-सम्बन्धी प्रश्न चिकित्सक से — यह पृष्ठ उसका विकल्प नहीं।', 'Medical questions go to a doctor — this page does not replace one.')],
    ksheen: [P('यह धैर्य का विषय है; परम्परा गुरु की साधना की ओर देखती है।', 'A matter for patience; tradition looks to Jupiter’s practice.'), P('चिकित्सा-सम्बन्धी प्रश्न चिकित्सक से — यह पृष्ठ उसका विकल्प नहीं।', 'Medical questions go to a doctor — this page does not replace one.')],
  },
  swasthya: {
    prabal: [P('सोने-उठने और भोजन का समय स्थिर रखें — यही इस प्रकृति का सहारा है।', 'Keep sleep, waking and meal times fixed — that is what this constitution rests on.'), P('कोई भी लक्षण दिखे तो चिकित्सक — यह पृष्ठ उसका विकल्प नहीं है।', 'Any symptom goes to a doctor — this page does not replace one.')],
    madhyam: [P('रोज़ शारीरिक गतिविधि, प्रतिस्पर्धा के रूप में नहीं।', 'Daily physical activity, not as competition.'), P('कोई भी लक्षण दिखे तो चिकित्सक — यह पृष्ठ उसका विकल्प नहीं है।', 'Any symptom goes to a doctor — this page does not replace one.')],
    ksheen: [P('नींद पहले, फिर भोजन का समय, फिर बाकी।', 'Sleep first, then meal times, then the rest.'), P('कोई भी लक्षण दिखे तो चिकित्सक — यह पृष्ठ उसका विकल्प नहीं है।', 'Any symptom goes to a doctor — this page does not replace one.')],
  },
  yatra: {
    prabal: [P('यात्रा की तिथि मुहूर्त खोजक से चुनें।', 'Choose the travel date with the Muhurat finder.'), P('लम्बे प्रवास के लिए दशा का काल देखें।', 'For a long stay, mind the dasha window.')],
    madhyam: [P('छोटी यात्रा से आरम्भ करें; स्थायी परिवर्तन काल देखकर।', 'Begin with short journeys; a permanent move by the window.'), P('यात्रा की तिथि मुहूर्त खोजक से चुनें।', 'Choose the travel date with the Muhurat finder.')],
    ksheen: [P('निकट के बदलाव पहले; दूर का निर्णय अगले अनुकूल काल में।', 'Near changes first; a distant decision in the next supportive window.')],
  },
  man: {
    prabal: [P('जो आदतें मन थामती हैं, उन्हें नाम दें और बचाएँ।', 'Name the habits that hold the mind, and protect them.')],
    madhyam: [P('सोने का समय तय — इस कुंडली में सबसे अधिक असर इसी एक बात का है।', 'A fixed sleep time — the one thing with the most effect in this chart.'), P('रोज़ एक छोटी साधना, एक ही समय।', 'One small practice daily, at one time.')],
    ksheen: [P('एकांत का समय रोज़; नींद पहले।', 'Time alone every day; sleep first.'), P('मन भारी रहे तो किसी से कहें — परामर्शदाता से भी। यह पृष्ठ उसका विकल्प नहीं।', 'If the mind stays heavy, tell someone — a counsellor too. This page does not replace one.')],
  },
};

const PARENT_REGISTER: Readonly<Record<Exclude<AgeBand, 'adult'>, Pair>> = {
  child: P('माता-पिता के लिए: यह देखने और प्रोत्साहित करने के लिए है — बच्चे का स्वभाव अभी बन रहा है; दबाव या तुलना के लिए नहीं।', 'For a parent: this is for noticing and encouraging — a child’s nature is still forming; not for pressure or comparison.'),
  adolescent: P('माता-पिता के लिए: जहाँ सहज बल है वहाँ प्रोत्साहन, जहाँ धैर्य चाहिए वहाँ समय — निर्णय किशोर के साथ, उसके लिए नहीं।', 'For a parent: encouragement where ease lies, time where patience is asked — decisions with the teenager, not for them.'),
};

const STRENGTH_LABEL_HI: Readonly<Record<PrashnaStrength, string>> = { prabal: 'प्रबल', madhyam: 'मध्यम', ksheen: 'क्षीण' };
const STRENGTH_LABEL_EN: Readonly<Record<PrashnaStrength, string>> = { prabal: 'strong', madhyam: 'moderate', ksheen: 'weak' };

export { STRENGTH_LABEL_EN, STRENGTH_LABEL_HI };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function pos(chart: KundaliChart, graha: Graha): GrahaPosition {
  const found = chart.grahas.find((position) => position.graha === graha);
  if (!found) throw new Error(`${graha} position is required`);
  return found;
}

function lordOf(chart: KundaliChart, house: number): Graha {
  return RASHI_LORD_BY_INDEX[chart.houses[house - 1]];
}

function grahaNode(position: GrahaPosition): BasisNode {
  return {
    kind: 'graha',
    graha: position.graha,
    house: position.house,
    dignity: dignityOfPosition(position),
    ...(position.retrograde ? { retrograde: true } : {}),
  };
}

function theme(house: number): Pair {
  return P(HOUSE_THEME_HI[house - 1], HOUSE_THEME_EN[house - 1]);
}

function isStrongHouse(house: number): boolean {
  return KENDRA_HOUSES.includes(house) || TRIKONA_HOUSES.includes(house);
}

function factor(
  id: string,
  polarity: FactorPolarity,
  weight: 1 | 2,
  group: string,
  text: Pair,
  basis: readonly BasisNode[]
): PrashnaFactor {
  if (basis.length === 0) throw new Error(`factor ${id} has no basis`);
  return { id, polarity, weight, group, textHi: text.hi, textEn: text.en, basis };
}

/* ------------------------------------------------------------------ */
/*  Pass 1 + 2 — gather and weigh                                       */
/* ------------------------------------------------------------------ */

function weighBhava(chart: KundaliChart, purpose: PrashnaPurpose, house: number, primary: boolean): PrashnaFactor[] {
  const out: PrashnaFactor[] = [];
  const rashi = chart.houses[house - 1];
  const lord = lordOf(chart, house);
  const seat = pos(chart, lord);
  const bhavaNode: BasisNode = { kind: 'bhava', house, rashiIndex: rashi };
  const lordNode: BasisNode = { kind: 'lord', graha: lord, ofHouse: house, inHouse: seat.house };
  const w: 1 | 2 = primary ? 2 : 1;
  const lordHi = GRAHA_NAMES_HI[lord];
  const lordEn = GRAHA_NAMES_EN[lord];
  const label = P(bhavaLabelHi(house), bhavaLabelEn(house));
  const th = theme(house);

  // The lord's seat.
  if (seat.house === house) {
    out.push(factor(`lord-${house}-own-bhava`, 'support', 2, `lord-${house}`,
      P(`${label.hi} (${th.hi}) का स्वामी ${lordHi} अपने ही भाव में है — परम्परा इसे विषय का अपने पाँव पर खड़ा होना कहती है।`,
        `The lord of the ${label.en} (${th.en}), ${lordEn}, sits in its own house — tradition calls this the matter standing on its own feet.`),
      [bhavaNode, lordNode, grahaNode(seat)]));
  } else if (isStrongHouse(seat.house)) {
    out.push(factor(`lord-${house}-strong`, 'support', w, `lord-${house}`,
      P(`${label.hi} का स्वामी ${lordHi} ${bhavaLabelHi(seat.house)} (${KENDRA_HOUSES.includes(seat.house) ? 'केन्द्र' : 'त्रिकोण'}) में है — परम्परा में विषय को स्थिर सहारा।`,
        `The lord of the ${label.en}, ${lordEn}, sits in the ${bhavaLabelEn(seat.house)} (${KENDRA_HOUSES.includes(seat.house) ? 'a kendra' : 'a trikona'}) — steady support for the matter in tradition.`),
      [bhavaNode, lordNode]));
  } else if (DUSTHANA_HOUSES.includes(seat.house)) {
    out.push(factor(`lord-${house}-dusthana`, 'resist', w, `lord-${house}`,
      P(`${label.hi} का स्वामी ${lordHi} ${bhavaLabelHi(seat.house)} (दुःस्थान) में है — परम्परा में विषय देर से और प्रयास से खुलता है।`,
        `The lord of the ${label.en}, ${lordEn}, sits in the ${bhavaLabelEn(seat.house)} (a dusthana) — in tradition the matter opens late and through effort.`),
      [bhavaNode, lordNode]));
  } else if (seat.house === 11) {
    out.push(factor(`lord-${house}-labha`, 'support', 1, `lord-${house}`,
      P(`${label.hi} का स्वामी ${lordHi} एकादश (लाभ) भाव में है — परम्परा में विषय से लाभ का संकेत।`,
        `The lord of the ${label.en}, ${lordEn}, sits in the 11th (gains) — tradition reads gain from the matter.`),
      [bhavaNode, lordNode]));
  } else {
    out.push(factor(`lord-${house}-neutral`, 'qualify', 1, `lord-${house}`,
      P(`${label.hi} का स्वामी ${lordHi} ${bhavaLabelHi(seat.house)} में है — विषय ${theme(seat.house).hi} से जुड़कर चलता है।`,
        `The lord of the ${label.en}, ${lordEn}, sits in the ${bhavaLabelEn(seat.house)} — the matter runs tied to ${theme(seat.house).en}.`),
      [bhavaNode, lordNode]));
  }

  // The lord's dignity.
  const dignity = dignityOfPosition(seat);
  if (dignity === 'exalted' || dignity === 'own') {
    out.push(factor(`lord-${house}-dignity`, 'support', 1, `lord-${house}-dignity`,
      P(`${lordHi} ${DIGNITY_LABEL_HI[dignity]} (${RASHI_NAMES_HI[seat.rashiIndex]}) है — स्वामी का बल विषय को मिलता है।`,
        `${lordEn} is ${DIGNITY_LABEL_EN[dignity]} (${RASHI_NAMES_EN[seat.rashiIndex]}) — the lord’s strength reaches the matter.`),
      [grahaNode(seat)]));
  } else if (dignity === 'debilitated') {
    out.push(factor(`lord-${house}-dignity`, 'resist', 1, `lord-${house}-dignity`,
      P(`${lordHi} नीच (${RASHI_NAMES_HI[seat.rashiIndex]}) है — स्वामी को यहाँ अधिक प्रयास चाहिए।`,
        `${lordEn} is debilitated (${RASHI_NAMES_EN[seat.rashiIndex]}) — the lord needs more effort here.`),
      [grahaNode(seat)]));
  }
  if (seat.retrograde && lord !== 'rahu' && lord !== 'ketu') {
    out.push(factor(`lord-${house}-retro`, 'qualify', 1, `lord-${house}-retro`,
      P(`${lordHi} वक्री है — परम्परा में विषय की गति असमान, बार-बार लौटकर देखने वाली।`,
        `${lordEn} is retrograde — tradition reads the matter’s pace as uneven, returning to itself.`),
      [grahaNode(seat)]));
  }

  // Occupants.
  const occupants = chart.grahas.filter((position) => position.house === house);
  for (const occupant of occupants) {
    const g = occupant.graha;
    const gHi = GRAHA_NAMES_HI[g];
    const gEn = GRAHA_NAMES_EN[g];
    if (purpose.karakas.includes(g)) {
      out.push(factor(`occ-${house}-${g}-karaka`, 'support', 2, `occ-${house}-${g}`,
        P(`${gHi} — इस विषय का कारक — ${label.hi} में ही बैठा है; परम्परा में रुचि और क्षमता एक ही ओर।`,
          `${gEn} — this matter’s karaka — sits in the ${label.en} itself; tradition reads interest and aptitude as aligned.`),
        [bhavaNode, grahaNode(occupant)]));
    } else if (NATURAL_BENEFICS.includes(g)) {
      out.push(factor(`occ-${house}-${g}`, 'support', 1, `occ-${house}-${g}`,
        P(`${gHi} ${label.hi} में है — परम्परा में एक सौम्य ग्रह भाव को सहज बनाता है।`,
          `${gEn} occupies the ${label.en} — a natural benefic eases a house in tradition.`),
        [bhavaNode, grahaNode(occupant)]));
    } else {
      out.push(factor(`occ-${house}-${g}`, 'resist', 1, `occ-${house}-${g}`,
        P(`${gHi} ${label.hi} में है — परम्परा में यह भाव अनुशासन और प्रयास माँगता है, यह क्षमता नहीं, गति की बात है।`,
          `${gEn} occupies the ${label.en} — tradition reads the house as asking for discipline and effort; a statement about pace, not capacity.`),
        [bhavaNode, grahaNode(occupant)]));
    }
  }
  return out;
}

function weighKaraka(chart: KundaliChart, purpose: PrashnaPurpose, graha: Graha): PrashnaFactor[] {
  const out: PrashnaFactor[] = [];
  const seat = pos(chart, graha);
  const gHi = GRAHA_NAMES_HI[graha];
  const gEn = GRAHA_NAMES_EN[graha];
  const node = grahaNode(seat);
  // Karaka seated in a purpose bhava is handled as an occupant (weight 2) above.
  if (!purpose.bhavas.includes(seat.house)) {
    if (isStrongHouse(seat.house)) {
      out.push(factor(`karaka-${graha}-strong`, 'support', 1, `karaka-${graha}`,
        P(`कारक ${gHi} ${bhavaLabelHi(seat.house)} (${KENDRA_HOUSES.includes(seat.house) ? 'केन्द्र' : 'त्रिकोण'}) में है — कारक बलवान।`,
          `The karaka ${gEn} sits in the ${bhavaLabelEn(seat.house)} (${KENDRA_HOUSES.includes(seat.house) ? 'a kendra' : 'a trikona'}) — a strong karaka.`),
        [node]));
    } else if (DUSTHANA_HOUSES.includes(seat.house)) {
      out.push(factor(`karaka-${graha}-dusthana`, 'resist', 1, `karaka-${graha}`,
        P(`कारक ${gHi} ${bhavaLabelHi(seat.house)} (दुःस्थान) में है — कारक को सहारा कम।`,
          `The karaka ${gEn} sits in the ${bhavaLabelEn(seat.house)} (a dusthana) — thin support for the karaka.`),
        [node]));
    }
  }
  const dignity = dignityOfPosition(seat);
  if (dignity === 'exalted' || dignity === 'own') {
    out.push(factor(`karaka-${graha}-dignity`, 'support', 1, `karaka-${graha}-dignity`,
      P(`कारक ${gHi} ${DIGNITY_LABEL_HI[dignity]} है — कारक का अपना बल।`,
        `The karaka ${gEn} is ${DIGNITY_LABEL_EN[dignity]} — the karaka’s own strength.`),
      [node]));
  } else if (dignity === 'debilitated') {
    out.push(factor(`karaka-${graha}-dignity`, 'resist', 1, `karaka-${graha}-dignity`,
      P(`कारक ${gHi} नीच है — विषय में मन का असंतोष या झिझक; निर्णय किसी से कहकर लें।`,
        `The karaka ${gEn} is debilitated — discontent or hesitation in the matter; take decisions after saying them aloud to someone.`),
      [node]));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Pass 3 — time                                                       */
/* ------------------------------------------------------------------ */

function lordTouches(chart: KundaliChart, purpose: PrashnaPurpose, lord: DashaLord): number | null {
  for (const house of purpose.bhavas) {
    if (lordOf(chart, house) === lord) return house;
  }
  const seat = pos(chart, lord);
  if (purpose.bhavas.includes(seat.house)) return seat.house;
  return null;
}

function dashaWindow(
  chart: KundaliChart,
  purpose: PrashnaPurpose,
  level: 'maha' | 'antar',
  lord: DashaLord,
  start: Date,
  end: Date,
  current: boolean,
  mahaLord?: DashaLord
): PrashnaWindow {
  const touched = lordTouches(chart, purpose, lord);
  const isKaraka = purpose.karakas.includes(lord);
  const relevant = touched !== null || isKaraka;
  const lHi = GRAHA_NAMES_HI[lord];
  const lEn = GRAHA_NAMES_EN[lord];
  const levelHi = level === 'maha' ? 'महादशा' : 'अन्तर्दशा';
  const levelEn = level === 'maha' ? 'Mahadasha' : 'Antardasha';
  const inHi = level === 'antar' && mahaLord ? ` (${GRAHA_NAMES_HI[mahaLord]} महादशा में)` : '';
  const inEn = level === 'antar' && mahaLord ? ` (within the ${GRAHA_NAMES_EN[mahaLord]} Mahadasha)` : '';
  let textHi: string;
  let textEn: string;
  if (touched !== null) {
    textHi = `${lHi} ${levelHi}${inHi} — ${lHi} आपके ${bhavaLabelHi(touched)} (${theme(touched).hi}) से जुड़ा है; यह अवधि इस विषय से जुड़ी है, पर संबंध अपने-आप अनुकूलता नहीं है।`;
    textEn = `${lEn} ${levelEn}${inEn} — ${lEn} is tied to your ${bhavaLabelEn(touched)} (${theme(touched).en}); this period is relevant to the topic; relevance alone does not establish a supportive window.`;
  } else if (isKaraka) {
    textHi = `${lHi} ${levelHi}${inHi} — इस विषय का कारक अपनी अवधि में; इससे अपने-आप अनुकूलता नहीं निकलती।`;
    textEn = `${lEn} ${levelEn}${inEn} — this matter’s karaka in its own period; this makes it relevant, not necessarily a supportive window.`;
  } else {
    textHi = `${lHi} ${levelHi}${inHi} — इन भावों से सीधे जुड़ी नहीं; पृष्ठभूमि का स्वर ${DASHA_LORD_KEYWORDS_HI[lord]} का है — इस विषय के समय पर निष्कर्ष सीमित है।`;
    textEn = `${lEn} ${levelEn}${inEn} — not tied to these houses; the background tone is ${DASHA_LORD_KEYWORDS_EN[lord]} — there is limited basis for judging timing for this topic.`;
  }
  return {
    id: `${level}-${lord}-${indiaDateKey(start)}`,
    startKey: indiaDateKey(start),
    endKey: indiaDateKey(end),
    labelHi: `${formatIstDateHi(start)} → ${formatIstDateHi(end)}`,
    labelEn: `${formatIstDateEn(start)} → ${formatIstDateEn(end)}`,
    textHi,
    textEn,
    current,
    relevant,
    basis: [
      { kind: 'dasha', level, lord, startKey: indiaDateKey(start), endKey: indiaDateKey(end) },
      ...(touched !== null ? [lordOf(chart, touched) === lord
        ? { kind: 'lord', graha: lord, ofHouse: touched, inHouse: pos(chart, lord).house } as BasisNode
        : grahaNode(pos(chart, lord))] : []),
    ],
  };
}

function timeWindows(chart: KundaliChart, purpose: PrashnaPurpose, now: Date, scanDays: number): { windows: PrashnaWindow[]; factors: PrashnaFactor[] } {
  const windows: PrashnaWindow[] = [];
  const factors: PrashnaFactor[] = [];
  const current = getCurrentDasha(chart, now);
  if (current) {
    windows.push(dashaWindow(chart, purpose, 'maha', current.maha.lord, current.maha.start, current.maha.end, true));
    if (current.antar) {
      windows.push(dashaWindow(chart, purpose, 'antar', current.antar.lord, current.antar.start, current.antar.end, true, current.maha.lord));
      // The next sub-period that touches these houses.
      const later = chart.vimshottari.flatMap(maha => maha.antardashas.map(antar => ({ ...antar, mahaLord: maha.lord })))
        .filter(antar => antar.start.getTime() >= current.antar!.end.getTime());
      const nextRelevant = later.find((antar) => lordTouches(chart, purpose, antar.lord) !== null || purpose.karakas.includes(antar.lord));
      if (nextRelevant) {
        windows.push(dashaWindow(chart, purpose, 'antar', nextRelevant.lord, nextRelevant.start, nextRelevant.end, false, nextRelevant.mahaLord));
      }
    }
    const mahaTouch = lordTouches(chart, purpose, current.maha.lord) !== null || purpose.karakas.includes(current.maha.lord);
    const antarTouch = current.antar ? (lordTouches(chart, purpose, current.antar.lord) !== null || purpose.karakas.includes(current.antar.lord)) : false;
    if (mahaTouch || antarTouch) {
      const lord = mahaTouch ? current.maha.lord : current.antar!.lord;
      factors.push(factor('dasha-relevant', 'qualify', 1, 'dasha',
        P(`चल रही ${GRAHA_NAMES_HI[lord]} ${mahaTouch ? 'महादशा' : 'अन्तर्दशा'} इस विषय के भावों को छूती है — यह संबंध है, अनुकूलता का निष्कर्ष नहीं।`,
          `The running ${GRAHA_NAMES_EN[lord]} ${mahaTouch ? 'Mahadasha' : 'Antardasha'} touches this matter’s houses — this establishes relevance, not favourability.`),
        [{ kind: 'dasha', level: mahaTouch ? 'maha' : 'antar', lord, startKey: indiaDateKey(mahaTouch ? current.maha.start : current.antar!.start), endKey: indiaDateKey(mahaTouch ? current.maha.end : current.antar!.end) }]));
    }
  }

  {
    const snapshot = computeGocharSnapshot(chart, now);
    for (const graha of ['jupiter', 'saturn'] as const) {
      const transit = snapshot.transits.find((entry) => entry.graha === graha);
      if (!transit || !purpose.bhavas.includes(transit.houseFromLagna)) continue;
      const ingress = scanDays > 0 ? findNextIngress(graha, now, scanDays) : null;
      const endKey = ingress ? indiaDateKey(ingress.at) : null;
      const gHi = GRAHA_NAMES_HI[graha];
      const gEn = GRAHA_NAMES_EN[graha];
      const h = transit.houseFromLagna;
      const until = ingress ? P(` ${formatIstDateHi(ingress.at)} तक`, ` until ${formatIstDateEn(ingress.at)}`) : P('', '');
      const isJupiter = graha === 'jupiter';
      windows.push({
        id: `gochar-${graha}-${snapshot.dateKey}`,
        startKey: snapshot.dateKey,
        endKey,
        labelHi: `${formatIstDateHi(now)}${until.hi ? ` →${until.hi.replace(' तक', '')}` : ' से'}`,
        labelEn: `${formatIstDateEn(now)}${until.en ? ` →${until.en.replace(' until', '')}` : ' onward'}`,
        textHi: isJupiter
          ? `गुरु का गोचर आपके ${bhavaLabelHi(h)} (${theme(h).hi}) से${until.hi} — इस विषय से जुड़ा गोचर; अन्य संकेतों के साथ पढ़ें।`
          : `शनि का गोचर आपके ${bhavaLabelHi(h)} (${theme(h).hi}) से${until.hi} — परम्परा इसे धीमा, ढाँचे वाला और धैर्य माँगने वाला काल कहती है।`,
        textEn: isJupiter
          ? `Jupiter transits your ${bhavaLabelEn(h)} (${theme(h).en})${until.en} — a transit relevant to this topic; read it with the other indications.`
          : `Saturn transits your ${bhavaLabelEn(h)} (${theme(h).en})${until.en} — a window tradition reads as slow, structured and demanding of patience.`,
        current: true,
        relevant: true,
        basis: [{ kind: 'gochar', graha, fromMoonHouse: transit.houseFromMoon, fromLagnaHouse: h, asOfKey: snapshot.dateKey }],
      });
      factors.push(factor(`gochar-${graha}`, 'qualify', 1, `gochar-${graha}`,
        P(`${gHi} इस समय ${bhavaLabelHi(h)} से गोचर कर रहा है।`, `${gEn} is transiting the ${bhavaLabelEn(h)} just now.`),
        [{ kind: 'gochar', graha, fromMoonHouse: transit.houseFromMoon, fromLagnaHouse: h, asOfKey: snapshot.dateKey }]));
    }
  }

  return { windows: windows.slice(0, MAX_WINDOWS), factors };
}

/* ------------------------------------------------------------------ */
/*  Pass 4 — resolve                                                    */
/* ------------------------------------------------------------------ */

export function resolveStrength(factors: readonly PrashnaFactor[]): { strength: PrashnaStrength; supportGroups: number; resistGroups: number } {
  const supportGroups = new Set(factors.filter((f) => f.polarity === 'support').map((f) => f.group)).size;
  const resistGroups = new Set(factors.filter((f) => f.polarity === 'resist').map((f) => f.group)).size;
  const strongResist = factors.some((f) => f.polarity === 'resist' && f.weight === 2);
  let strength: PrashnaStrength;
  if (supportGroups <= 1 || resistGroups >= supportGroups) strength = 'ksheen';
  else if (supportGroups >= 3 && !strongResist && resistGroups * 2 < supportGroups) strength = 'prabal';
  else strength = 'madhyam';
  return { strength, supportGroups, resistGroups };
}

/* ------------------------------------------------------------------ */
/*  Pass 5 — speak                                                      */
/* ------------------------------------------------------------------ */

function rank(factors: readonly PrashnaFactor[]): PrashnaFactor[] {
  return [...factors].sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
}

export function buildPrashnaAnswer(
  chart: KundaliChart,
  purposeId: PurposeId,
  now: Date,
  options?: PrashnaOptions
): PrashnaAnswer {
  const purpose = getPurpose(purposeId);
  const band = ageBandAt(chart, now);
  const age = ageBetween(chart.input.date, now);
  const asOfHi = formatIstDateHi(now);
  const asOfEn = formatIstDateEn(now);
  const base = {
    answerVersion: 1 as const,
    purposeId,
    purposeNameHi: purpose.nameHi,
    purposeNameEn: purpose.nameEn,
    generatedDateKey: indiaDateKey(now),
    asOfLabelHi: asOfHi,
    asOfLabelEn: asOfEn,
    ageBand: band,
    ageLabelHi: ageLabelHi(age),
    ageLabelEn: ageLabelEn(age),
    practiceSourceId: purpose.practiceSourceId,
    footerHi: `${asOfHi} की स्थिति के अनुसार। यह पारम्परिक ज्योतिष की दृष्टि है — निश्चित भविष्यवाणी नहीं। ज्योतिषीय आधार विस्तार में देख सकते हैं।`,
    footerEn: `As of ${asOfEn}. A view from traditional Jyotish — not a certain prediction. Chart interpretations have an expandable basis.`,
  };

  // §14.3.5 — a closed purpose renders NO reading.
  if (age.years < purpose.minAge) {
    return {
      ...base,
      gated: true,
      gateReasonHi: `${purpose.nameHi} का विवेचन ${purpose.minAge} वर्ष की आयु के बाद ही किया जाता है — इस कुंडली की आयु अभी ${ageLabelHi(age)} है।`,
      gateReasonEn: `${purpose.nameEn} is read only from age ${purpose.minAge} — this chart’s age is ${ageLabelEn(age)} as of today.`,
      strength: null,
      supportGroups: 0,
      resistGroups: 0,
      saarTitleHi: '',
      saarTitleEn: '',
      saarBodyHi: '',
      saarBodyEn: '',
      aadhaarIntroHi: '',
      aadhaarIntroEn: '',
      chains: [],
      supports: [],
      resists: [],
      qualifies: [],
      kaalIntroHi: '',
      kaalIntroEn: '',
      windows: [],
      dishaHi: [],
      dishaEn: [],
      practiceNoteHi: '',
      practiceNoteEn: '',
    };
  }

  // 1 + 2
  const factors: PrashnaFactor[] = [];
  purpose.bhavas.forEach((house, index) => factors.push(...weighBhava(chart, purpose, house, index === 0)));
  for (const karaka of purpose.karakas) factors.push(...weighKaraka(chart, purpose, karaka));
  // 3
  const scanDays = options?.gocharScanDays ?? SLOW_INGRESS_SCAN_DAYS;
  const timed = timeWindows(chart, purpose, now, scanDays);
  factors.push(...timed.factors);
  // 4
  const { strength, supportGroups, resistGroups } = resolveStrength(factors);
  const supports = rank(factors.filter((f) => f.polarity === 'support'));
  const resists = rank(factors.filter((f) => f.polarity === 'resist'));
  const qualifies = rank(factors.filter((f) => f.polarity === 'qualify'));

  // 5 — सार
  const saar = SAAR[purposeId][strength];
  const lead = supports[0];
  const counter = resists[0];
  const saarBodyHi = `${supportGroups} कारक पक्ष में, ${resistGroups} विपक्ष में।${lead ? ` ${lead.textHi}` : ''}${counter ? ` पर — ${counter.textHi}` : ''}${purpose.noPrognosis ? ' यहाँ केवल प्रकृति और दिनचर्या पढ़ी जाती है — यह रोग-विचार नहीं है।' : ''}`;
  const saarBodyEn = `${supportGroups} factor${supportGroups === 1 ? '' : 's'} in favour, ${resistGroups} against.${lead ? ` ${lead.textEn}` : ''}${counter ? ` But — ${counter.textEn}` : ''}${purpose.noPrognosis ? ' Only constitution and routine are read here — this is not a diagnosis.' : ''}`;

  // आधार — one chain per top factor, capped.
  const chainSource = [...supports, ...resists, ...qualifies].slice(0, MAX_CHAINS);
  const chains: PrashnaChain[] = chainSource.map((f) => ({ labelHi: f.textHi.split(' — ')[0], labelEn: f.textEn.split(' — ')[0], basis: f.basis }));

  // दिशा
  const dishaHi: string[] = [];
  const dishaEn: string[] = [];
  if (band !== 'adult') {
    dishaHi.push(PARENT_REGISTER[band].hi);
    dishaEn.push(PARENT_REGISTER[band].en);
  }
  for (const line of DISHA[purposeId][strength]) {
    dishaHi.push(line.hi);
    dishaEn.push(line.en);
  }
  if (resists.some((f) => f.id.endsWith('-dusthana'))) {
    dishaHi.push('इस विषय का एक स्वामी दुःस्थान में है — निर्णय धीमे, और हर व्यवस्था लिखित में।');
    dishaEn.push('One of this matter’s lords sits in a dusthana — decide slowly, and put every arrangement in writing.');
  }
  const relevantNow = timed.windows.some((w) => w.current && w.relevant);
  if (timed.windows.length > 0) {
    if (relevantNow) {
      dishaHi.push('चल रही अवधि इस विषय को छूती है — इससे अपने-आप आरम्भ या विस्तार की अनुकूलता नहीं निकलती; काल खंड में तिथियाँ देखें।');
      dishaEn.push('The running period touches this matter — this alone does not establish a supportive window for beginning or expanding; see the timing section.');
    } else {
      dishaHi.push('चल रही अवधि इस विषय से दूर है — इस विषय के लिए समय पर निष्कर्ष सीमित है।');
      dishaEn.push('The running period sits away from this matter — there is limited basis for judging timing for this topic.');
    }
  }

  const kaal = P(
    'ये अवधियाँ दशा और गोचर से निकली हैं। विषय से संबंध अपने-आप अनुकूलता या परिणाम नहीं बताता।',
    'These periods come from the dasha sequence and slow transits. Topic relevance alone does not establish favourability or an outcome.'
  );

  return {
    ...base,
    gated: false,
    gateReasonHi: null,
    gateReasonEn: null,
    strength,
    supportGroups,
    resistGroups,
    saarTitleHi: saar.hi,
    saarTitleEn: saar.en,
    saarBodyHi,
    saarBodyEn,
    aadhaarIntroHi: `${STRENGTH_LABEL_HI[strength]} संकेत — ${supportGroups} स्वतंत्र कारक एक दिशा में${resistGroups ? `, ${resistGroups} विपरीत` : ''}। नीचे हर संकेत का आधार है।`,
    aadhaarIntroEn: `A ${STRENGTH_LABEL_EN[strength]} indication — ${supportGroups} independent factor${supportGroups === 1 ? '' : 's'} pointing one way${resistGroups ? `, ${resistGroups} against` : ''}. Every line below names its basis.`,
    chains,
    supports,
    resists,
    qualifies,
    kaalIntroHi: kaal.hi,
    kaalIntroEn: kaal.en,
    windows: timed.windows,
    dishaHi,
    dishaEn,
    practiceNoteHi: `${purpose.nameHi} के कारक ${purpose.karakas.map((g) => GRAHA_NAMES_HI[g]).join(' और ')} के स्मरण की पारम्परिक रीति।`,
    practiceNoteEn: `The traditional way of remembering ${purpose.nameEn.toLowerCase()}’s karaka${purpose.karakas.length > 1 ? 's' : ''}, ${purpose.karakas.map((g) => GRAHA_NAMES_EN[g]).join(' and ')}.`,
  };
}

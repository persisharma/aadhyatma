import { computeSadeSati } from './gochar';
import { buildDashaPairReading, DASHA_LORD_THEME_EN, DASHA_LORD_THEME_HI } from './dashaReading';
import {
  DASHA_YEARS,
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  HOUSE_THEME_EN,
  HOUSE_THEME_HI,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  getCurrentDasha,
  indiaDateKey,
} from './kundali';
import type { Graha, KundaliChart } from './kundali';
import { ageBandAt, dignityOfPosition, type AgeBand, type BasisNode } from './kundaliBasis';
import { computeCombinations } from './kundaliYoga';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from './names';
import {
  ageBetween,
  ageLabelEn,
  ageLabelHi,
  ageYears,
  bhavaLabelEn,
  bhavaLabelHi,
  formatIstDateEn,
  formatIstDateHi,
} from './reportFormat';
import type {
  KundaliReportFact,
  KundaliReportModel,
  KundaliReportSection,
} from './kundaliReportModel';

/**
 * Compiled Kundali report engine — PRD-20 Phase 6, rebuilt by PRD-43.
 *
 * Pure: explicit chart + display meta + "now" in, a serializable
 * `KundaliReportModel` out. The reading now moves placement → combination →
 * indication (RULEBOOK §14.3): every interpretive section carries the
 * `basis` chain it was derived from, sentences are composed from typed phrase
 * tables (never authored per chart), timing is a dated window, and every
 * transit statement is stamped with the report's own date. Mangal Dosha ships
 * engine-complete but display-gated off pending product/content review; Kaal
 * Sarp is excluded by explicit decision (PRD-20 §4).
 */

/** Classical sign lords, rashi index order (Mesha … Meena). */
export const RASHI_LORD: readonly Graha[] = [
  'mars',
  'venus',
  'mercury',
  'moon',
  'sun',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'saturn',
  'jupiter',
];

const RASHI_QUALITY_HI = [
  'पहल, सीधापन और ऊर्जा',
  'स्थिरता, धैर्य और संचय',
  'जिज्ञासा, संवाद और चपलता',
  'पोषण, स्मृति और संवेदना',
  'तेज, नेतृत्व और आत्मविश्वास',
  'विश्लेषण, सेवा और शुद्धता',
  'संतुलन, सौन्दर्य और संबंध',
  'गहराई, दृढ़ता और परिवर्तन',
  'विस्तार, धर्म और आशा',
  'अनुशासन, कर्म और व्यावहारिकता',
  'चिंतन, समुदाय और नवीनता',
  'करुणा, कल्पना और श्रद्धा',
] as const;

const RASHI_QUALITY_EN = [
  'initiative, directness, and energy',
  'steadiness, patience, and preservation',
  'curiosity, communication, and quickness',
  'nurture, memory, and sensitivity',
  'radiance, leadership, and confidence',
  'analysis, service, and refinement',
  'balance, beauty, and relationship',
  'depth, resolve, and transformation',
  'expansion, dharma, and optimism',
  'discipline, work, and practicality',
  'contemplation, community, and originality',
  'compassion, imagination, and faith',
] as const;

const NAKSHATRA_QUALITY_HI = [
  'तत्परता और आरोग्य',
  'धारण और संयम',
  'तेज और शुद्धि',
  'सृजन और पोषण',
  'खोज और कोमलता',
  'तीव्रता और नवीनीकरण',
  'पुनरागमन और आश्रय',
  'पोषण और श्रद्धा',
  'सूक्ष्मता और अंतर्दृष्टि',
  'परम्परा और गरिमा',
  'विश्राम और आनन्द',
  'मैत्री और वचन',
  'कौशल और हस्तकला',
  'रचना और सौन्दर्य',
  'स्वतंत्रता और लचीलापन',
  'लक्ष्य और निष्ठा',
  'मित्रता और भक्ति',
  'वरिष्ठता और रक्षण',
  'जड़ और जिज्ञासा',
  'उत्साह और दृढ़ आशा',
  'स्थायी प्रयास और मर्यादा',
  'श्रवण और सीख',
  'लय और समृद्धि',
  'एकांत और उपचार',
  'तप और गहन चिंतन',
  'स्थिरता और करुणा',
  'करुणा और मार्गदर्शन',
] as const;

const NAKSHATRA_QUALITY_EN = [
  'swiftness and healing',
  'bearing and restraint',
  'fire and purification',
  'growth and nourishment',
  'seeking and gentleness',
  'intensity and renewal',
  'return and shelter',
  'nourishment and reverence',
  'subtlety and insight',
  'ancestry and dignity',
  'ease and delight',
  'friendship and commitment',
  'skill and craft',
  'design and beauty',
  'independence and flexibility',
  'purpose and dedication',
  'friendship and devotion',
  'seniority and guardianship',
  'roots and inquiry',
  'vigour and steadfast hope',
  'lasting effort and principle',
  'listening and learning',
  'rhythm and abundance',
  'solitude and healing',
  'austerity and deep thought',
  'steadiness and compassion',
  'kindness and guidance',
] as const;

type LifeArea = {
  id: string;
  titleHi: string;
  titleEn: string;
  houses: readonly number[];
};

/**
 * Age-aware life areas (PRD-43 §5.4). Section IDS are stable across bands so
 * the serialized model, the handoff and the order test never fork; only the
 * title, the house set and the copy register change. A 13-year-old does not
 * get a 7th-bhava partnership section.
 */
const LIFE_AREAS_BY_BAND: Readonly<Record<AgeBand, readonly LifeArea[]>> = {
  adult: [
    { id: 'career', titleHi: 'कर्म और कार्यक्षेत्र', titleEn: 'Career and work', houses: [10] },
    { id: 'relationships', titleHi: 'संबंध', titleEn: 'Relationships', houses: [7] },
    { id: 'wealth', titleHi: 'संसाधन और लाभ', titleEn: 'Resources and gains', houses: [2, 11] },
    { id: 'wellbeing', titleHi: 'स्वयं और दिनचर्या', titleEn: 'Self and routine', houses: [1, 6] },
    { id: 'learning', titleHi: 'गृह-सुख और विद्या', titleEn: 'Home and learning', houses: [4, 5] },
    { id: 'dharma', titleHi: 'धर्म और भाग्य-दृष्टि', titleEn: 'Dharma and fortune', houses: [9] },
  ],
  adolescent: [
    { id: 'career', titleHi: 'सीख, प्रतिभा और आगे की दिशा', titleEn: 'Learning, talents and future direction', houses: [10, 5] },
    { id: 'relationships', titleHi: 'मित्रता, सहकार्य और सामाजिक स्वभाव', titleEn: 'Friends, teamwork and social nature', houses: [7, 3, 11] },
    { id: 'wealth', titleHi: 'संसाधन और सहारा', titleEn: 'Resources and support', houses: [2, 11] },
    { id: 'wellbeing', titleHi: 'स्वयं और दिनचर्या', titleEn: 'Self and routine', houses: [1, 6] },
    { id: 'learning', titleHi: 'घर और पढ़ाई का वातावरण', titleEn: 'Home and study environment', houses: [4, 9] },
    { id: 'dharma', titleHi: 'श्रद्धा और मार्गदर्शक', titleEn: 'Faith and mentors', houses: [9] },
  ],
  child: [
    { id: 'career', titleHi: 'सीख और स्वाभाविक प्रतिभा', titleEn: 'Learning and natural talents', houses: [5, 4] },
    { id: 'relationships', titleHi: 'मित्र और खेल-संगी', titleEn: 'Friends and playmates', houses: [3, 11] },
    { id: 'wealth', titleHi: 'सहारा और संसाधन', titleEn: 'Support and resources', houses: [2] },
    { id: 'wellbeing', titleHi: 'स्वयं और दिनचर्या', titleEn: 'Self and routine', houses: [1, 6] },
    { id: 'learning', titleHi: 'घर का वातावरण', titleEn: 'Home environment', houses: [4] },
    { id: 'dharma', titleHi: 'श्रद्धा और बड़ों का मार्गदर्शन', titleEn: 'Faith and elders’ guidance', houses: [9] },
  ],
};

/** Classical Mangal placements from the Lagna; the from-Moon variant is a
 * secondary convention some traditions also read. */
export const MANGAL_HOUSES: readonly number[] = [1, 2, 4, 7, 8, 12];

export type MangalDosha = {
  presentFromLagna: boolean;
  houseFromLagna: number;
  presentFromMoon: boolean;
  houseFromMoon: number;
};

export function computeMangalDosha(chart: KundaliChart): MangalDosha {
  const mars = chart.grahas.find((position) => position.graha === 'mars');
  const moon = chart.grahas.find((position) => position.graha === 'moon');
  if (!mars || !moon) throw new Error('Mars and Moon positions are required');
  const houseFromMoon = ((mars.rashiIndex - moon.rashiIndex + 12) % 12) + 1;
  return {
    presentFromLagna: MANGAL_HOUSES.includes(mars.house),
    houseFromLagna: mars.house,
    presentFromMoon: MANGAL_HOUSES.includes(houseFromMoon),
    houseFromMoon,
  };
}

export type KundaliReportMeta = {
  name: string | null;
  birthDateLabelHi: string;
  birthDateLabelEn: string;
  birthTimeLabel: string | null;
  cityNameHi: string;
  cityNameEn: string;
};

export type KundaliReportOptions = {
  /** Display gate for the Mangal Dosha observation — OFF pending product/content
   * review (PRD-20 §4). The engine and tests stay complete either way. */
  includeMangalDosha?: boolean;
  /** Forwarded to computeSadeSati; 0 skips the Saturn boundary scan. */
  sadeSatiBoundaryScanDays?: number;
};

function fact(
  id: string,
  labelHi: string,
  labelEn: string,
  valueHi: string,
  valueEn: string
): KundaliReportFact {
  return { id, labelHi, labelEn, valueHi, valueEn };
}

function grahaListLabel(grahas: readonly Graha[], hi: boolean): string {
  if (grahas.length === 0) return hi ? 'कोई ग्रह नहीं' : 'none';
  return grahas.map((graha) => (hi ? GRAHA_NAMES_HI[graha] : GRAHA_NAMES_EN[graha])).join(', ');
}

/** Register per age band for the life-area closing line — what the reader
 * does with the section, not a disclaimer. */
const AREA_REGISTER_HI: Readonly<Record<AgeBand, string>> = {
  adult: 'इन भावों को एक साथ पढ़ें — स्वामी की स्थिति बताती है विषय कहाँ से बल पाता है, और ग्रह बताते हैं वह किस रंग में दिखता है।',
  adolescent: 'माता-पिता के लिए: यह भाग बताता है कि किस दिशा में सहज बल है और कहाँ धैर्य चाहिए — प्रोत्साहन के लिए, तुलना या दबाव के लिए नहीं।',
  child: 'माता-पिता के लिए: यह भाग देखने और प्रोत्साहित करने के लिए है — बच्चे का स्वभाव अभी बन रहा है, यह उसका पहला रेखाचित्र है।',
};

const AREA_REGISTER_EN: Readonly<Record<AgeBand, string>> = {
  adult: 'Read these houses together — the lord’s seat says where the theme draws its strength, and the occupants say what colour it shows in.',
  adolescent: 'For a parent: this part says where ease lies and where patience is asked for — for encouragement, not comparison or pressure.',
  child: 'For a parent: this part is for noticing and encouraging — a child’s nature is still forming, and this is its first sketch.',
};

function lifeAreaSection(chart: KundaliChart, area: LifeArea, band: AgeBand): KundaliReportSection {
  const bodyHi: string[] = [];
  const bodyEn: string[] = [];
  const facts: KundaliReportFact[] = [];
  const basis: BasisNode[] = [];

  for (const house of area.houses) {
    const rashi = chart.houses[house - 1];
    const lord = RASHI_LORD[rashi];
    const lordNatal = chart.grahas.find((position) => position.graha === lord)!;
    const occupants = chart.grahas
      .filter((position) => position.house === house)
      .map((position) => position.graha);

    const occupantsHi =
      occupants.length > 0
        ? `इस भाव में ${grahaListLabel(occupants, true)} स्थित ${occupants.length === 1 ? 'है' : 'हैं'}।`
        : 'इस भाव में कोई ग्रह नहीं है — परम्परा तब भाव को उसके स्वामी की स्थिति से पढ़ती है।';
    const occupantsEn =
      occupants.length > 0
        ? `Grahas placed here: ${grahaListLabel(occupants, false)}.`
        : 'No graha occupies this house — tradition then reads the house through its lord.';

    bodyHi.push(
      `${bhavaLabelHi(house)} (${HOUSE_THEME_HI[house - 1]}) में ${RASHI_NAMES_HI[rashi]} राशि है; परम्परा इस राशि को ${RASHI_QUALITY_HI[rashi]} से जोड़ती है। भाव का स्वामी ${GRAHA_NAMES_HI[lord]} आपकी कुंडली में ${bhavaLabelHi(lordNatal.house)} में स्थित है। ${occupantsHi}`
    );
    bodyEn.push(
      `The ${bhavaLabelEn(house)} (${HOUSE_THEME_EN[house - 1]}) holds ${RASHI_NAMES_EN[rashi]}; tradition links this sign with ${RASHI_QUALITY_EN[rashi]}. Its lord ${GRAHA_NAMES_EN[lord]} sits in the ${bhavaLabelEn(lordNatal.house)} of your chart. ${occupantsEn}`
    );
    facts.push(
      fact(
        `${area.id}-house-${house}`,
        bhavaLabelHi(house),
        bhavaLabelEn(house),
        `${RASHI_NAMES_HI[rashi]} · स्वामी ${GRAHA_NAMES_HI[lord]}`,
        `${RASHI_NAMES_EN[rashi]} · lord ${GRAHA_NAMES_EN[lord]}`
      )
    );
    basis.push({ kind: 'bhava', house, rashiIndex: rashi });
    basis.push({ kind: 'lord', graha: lord, ofHouse: house, inHouse: lordNatal.house });
    for (const graha of occupants) {
      const position = chart.grahas.find((entry) => entry.graha === graha)!;
      basis.push({ kind: 'graha', graha, house, dignity: dignityOfPosition(position) });
    }
  }

  bodyHi.push(AREA_REGISTER_HI[band]);
  bodyEn.push(AREA_REGISTER_EN[band]);

  return {
    id: area.id,
    eyebrowHi: 'जीवन-क्षेत्र',
    eyebrowEn: 'Life area',
    titleHi: area.titleHi,
    titleEn: area.titleEn,
    bodyHi,
    bodyEn,
    facts,
    basis,
  };
}

function isoKey(date: Date): string {
  return indiaDateKey(date);
}

export function buildKundaliReport(
  chart: KundaliChart,
  meta: KundaliReportMeta,
  now: Date,
  options?: KundaliReportOptions
): KundaliReportModel {
  const moon = chart.grahas.find((position) => position.graha === 'moon');
  if (!moon) throw new Error('Moon position is required');
  const lagna = chart.lagnaRashiIndex;
  const birth = chart.input.date;
  const band = ageBandAt(chart, now);
  const age = ageBetween(birth, now);
  const asOfHi = formatIstDateHi(now);
  const asOfEn = formatIstDateEn(now);
  const sections: KundaliReportSection[] = [];

  // — Birth details + chart summary (facts only; no basis).
  const summary: KundaliReportSection = {
    id: 'summary',
    eyebrowHi: 'परिचय',
    eyebrowEn: 'Overview',
    titleHi: 'जन्म विवरण और कुंडली सार',
    titleEn: 'Birth details and chart summary',
    bodyHi: [
      'यह विवेचन आपकी सहेजी गई जन्म कुंडली से उसी लाहिड़ी (चित्रपक्ष) अयनांश और पूर्ण-राशि भाव पद्धति पर बना है जो ऐप की कुंडली में प्रयुक्त होती है।',
    ],
    bodyEn: [
      'This reading is compiled from your saved birth chart, on the same Lahiri (Chitrapaksha) ayanamsa and whole-sign houses the app’s Kundali uses.',
    ],
    facts: [
      ...(meta.name ? [fact('name', 'नाम', 'Name', meta.name, meta.name)] : []),
      fact('birth-date', 'जन्म तिथि', 'Birth date', meta.birthDateLabelHi, meta.birthDateLabelEn),
      ...(meta.birthTimeLabel
        ? [fact('birth-time', 'जन्म समय', 'Birth time', meta.birthTimeLabel, meta.birthTimeLabel)]
        : []),
      fact('birth-city', 'जन्म स्थान', 'Birth place', meta.cityNameHi, meta.cityNameEn),
      fact('age', 'आयु (इस तिथि को)', 'Age (as of this date)', ageLabelHi(age), ageLabelEn(age)),
      fact('lagna', 'लग्न', 'Lagna', RASHI_NAMES_HI[lagna], `${RASHI_NAMES_EN[lagna]} · ${RASHI_NAMES_WESTERN[lagna]} rising`),
      fact(
        'moon-rashi',
        'चन्द्र राशि',
        'Moon sign',
        RASHI_NAMES_HI[moon.rashiIndex],
        `${RASHI_NAMES_EN[moon.rashiIndex]} · ${RASHI_NAMES_WESTERN[moon.rashiIndex]}`
      ),
      fact(
        'nakshatra',
        'जन्म नक्षत्र',
        'Janma nakshatra',
        `${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} · पद ${moon.pada}`,
        `${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} · pada ${moon.pada}`
      ),
    ],
  };

  // — Lagna reading.
  const lagnaLord = RASHI_LORD[lagna];
  const lagnaLordNatal = chart.grahas.find((position) => position.graha === lagnaLord)!;
  const lagnaSection: KundaliReportSection = {
    id: 'lagna',
    eyebrowHi: 'आरम्भ बिंदु',
    eyebrowEn: 'Starting point',
    titleHi: `${RASHI_NAMES_HI[lagna]} लग्न`,
    titleEn: `${RASHI_NAMES_EN[lagna]} Lagna`,
    bodyHi: [
      `जन्म के समय पूर्वी क्षितिज पर ${RASHI_NAMES_HI[lagna]} राशि उदित थी — परम्परा इस राशि को ${RASHI_QUALITY_HI[lagna]} से जोड़ती है और इसी से प्रथम भाव आरम्भ होता है।`,
      `लग्न का स्वामी ${GRAHA_NAMES_HI[lagnaLord]} आपकी कुंडली में ${bhavaLabelHi(lagnaLordNatal.house)} (${HOUSE_THEME_HI[lagnaLordNatal.house - 1]}) में स्थित है — परम्परा में लग्नेश की स्थिति पूरे विवेचन की एक प्रमुख धुरी मानी जाती है, और आगे के संयोग-खंड में इसे विस्तार से पढ़ा गया है।`,
    ],
    bodyEn: [
      `${RASHI_NAMES_EN[lagna]} was rising on the eastern horizon at birth — tradition links this sign with ${RASHI_QUALITY_EN[lagna]}, and the first house begins here.`,
      `The Lagna lord ${GRAHA_NAMES_EN[lagnaLord]} sits in the ${bhavaLabelEn(lagnaLordNatal.house)} (${HOUSE_THEME_EN[lagnaLordNatal.house - 1]}) of your chart — tradition treats the Lagna lord’s placement as a main axis of the whole reading, and the combinations section below reads it in full.`,
    ],
    facts: [
      fact(
        'lagna-lord',
        'लग्नेश',
        'Lagna lord',
        `${GRAHA_NAMES_HI[lagnaLord]} · ${bhavaLabelHi(lagnaLordNatal.house)}`,
        `${GRAHA_NAMES_EN[lagnaLord]} · ${bhavaLabelEn(lagnaLordNatal.house)}`
      ),
    ],
    basis: [
      { kind: 'bhava', house: 1, rashiIndex: lagna },
      { kind: 'lord', graha: lagnaLord, ofHouse: 1, inHouse: lagnaLordNatal.house },
    ],
  };

  // — Moon + janma nakshatra reading.
  const moonSection: KundaliReportSection = {
    id: 'moon',
    eyebrowHi: 'अन्तर लय',
    eyebrowEn: 'Inner rhythm',
    titleHi: `${RASHI_NAMES_HI[moon.rashiIndex]} चन्द्र · ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} नक्षत्र`,
    titleEn: `${RASHI_NAMES_EN[moon.rashiIndex]} Moon · ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} nakshatra`,
    bodyHi: [
      `आपका चन्द्र ${RASHI_NAMES_HI[moon.rashiIndex]} राशि में, ${bhavaLabelHi(moon.house)} (${HOUSE_THEME_HI[moon.house - 1]}) में है — परम्परा मन की लय को इस राशि के गुणों (${RASHI_QUALITY_HI[moon.rashiIndex]}) और इस भाव के विषयों की दृष्टि से पढ़ती है।`,
      `जन्म नक्षत्र ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} (पद ${moon.pada}) है, जिसे परम्परा ${NAKSHATRA_QUALITY_HI[moon.nakshatraIndex]} से जोड़ती है। यही नक्षत्र विम्शोत्तरी दशा-क्रम और तारा बल का आधार भी है।`,
    ],
    bodyEn: [
      `Your Moon is in ${RASHI_NAMES_EN[moon.rashiIndex]}, in the ${bhavaLabelEn(moon.house)} (${HOUSE_THEME_EN[moon.house - 1]}) — tradition reads the mind’s rhythm through this sign’s qualities (${RASHI_QUALITY_EN[moon.rashiIndex]}) and this house’s themes.`,
      `The janma nakshatra is ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} (pada ${moon.pada}), which tradition links with ${NAKSHATRA_QUALITY_EN[moon.nakshatraIndex]}. This nakshatra also seeds the Vimshottari sequence and tara bala.`,
    ],
    facts: [],
    basis: [{ kind: 'graha', graha: 'moon', house: moon.house, dignity: dignityOfPosition(moon) }],
  };

  // — Combinations: what the placements do together.
  const combinations = computeCombinations(chart);
  const combinationsSection: KundaliReportSection = {
    id: 'combinations',
    eyebrowHi: 'संयोग',
    eyebrowEn: 'Combinations',
    titleHi: 'ग्रह एक साथ क्या कहते हैं',
    titleEn: 'What the placements say together',
    bodyHi: combinations.map((combination) => `${combination.titleHi} — ${combination.bodyHi}`),
    bodyEn: combinations.map((combination) => `${combination.titleEn} — ${combination.bodyEn}`),
    facts: combinations.map((combination) =>
      fact(
        combination.id,
        combination.kind === 'yoga' ? 'योग' : combination.kind === 'conjunction' ? 'युति' : combination.kind === 'dignity' ? 'बल' : 'लग्नेश',
        combination.kind === 'yoga' ? 'Yoga' : combination.kind === 'conjunction' ? 'Conjunction' : combination.kind === 'dignity' ? 'Dignity' : 'Lagna lord',
        combination.titleHi,
        combination.titleEn
      )
    ),
    basis: combinations.flatMap((combination) => combination.basis),
  };

  // — Life areas, by age band.
  const areaSections = LIFE_AREAS_BY_BAND[band].map((area) => lifeAreaSection(chart, area, band));

  // — Classical observations, stamped with the report date (PRD-20 §4 triage).
  const sadeSati = computeSadeSati(chart, now, { boundaryScanDays: options?.sadeSatiBoundaryScanDays });
  const observationBodyHi = [`${asOfHi} की स्थिति: ${sadeSati.bodyHi}`];
  const observationBodyEn = [`As of ${asOfEn}: ${sadeSati.bodyEn}`];
  if (sadeSati.nextTransitionAt) {
    observationBodyHi.push(
      `शनि का अगला राशि-परिवर्तन ${formatIstDateHi(sadeSati.nextTransitionAt)} को है — उस दिन से यह अवलोकन बदलता है।`
    );
    observationBodyEn.push(
      `Saturn’s next sign change falls on ${formatIstDateEn(sadeSati.nextTransitionAt)} — this observation changes from that day.`
    );
  } else {
    observationBodyHi.push('यह अवलोकन ऊपर लिखी तिथि का है — शनि की राशि बदलने पर यह बदलता है; इसे स्थायी न पढ़ें।');
    observationBodyEn.push('This observation is dated as above — it changes when Saturn changes sign; do not read it as permanent.');
  }
  const observationFacts: KundaliReportFact[] = [
    fact(
      'as-of',
      'स्थिति की तिथि',
      'As of',
      asOfHi,
      asOfEn
    ),
    fact(
      'sade-sati',
      'साढ़े साती',
      'Sade Sati',
      sadeSati.headlineHi.replace('साढ़े साती · ', ''),
      sadeSati.headlineEn.replace('Sade Sati · ', '')
    ),
  ];
  if (options?.includeMangalDosha) {
    const mangal = computeMangalDosha(chart);
    if (mangal.presentFromLagna || mangal.presentFromMoon) {
      observationBodyHi.push(
        `मंगल आपकी कुंडली में लग्न से ${bhavaLabelHi(mangal.houseFromLagna)} और चन्द्र से ${bhavaLabelHi(mangal.houseFromMoon)} में है — परम्परा की कुछ धाराएँ इनमें से (1, 2, 4, 7, 8, 12) भावों की स्थिति को मांगलिक योग कहती हैं। बड़ी संख्या में कुंडलियों में यह योग मिलता है; परम्परा इसे धैर्य और नियमित साधना का विषय मानती है, भय का नहीं। विवाह-निर्णय व्यक्तियों और परिवारों के अपने विवेक के विषय हैं।`
      );
      observationBodyEn.push(
        `Mars sits in the ${bhavaLabelEn(mangal.houseFromLagna)} from the Lagna and the ${bhavaLabelEn(mangal.houseFromMoon)} from the Moon — some streams of tradition call a placement in houses 1, 2, 4, 7, 8, or 12 a Mangal yoga. A large share of charts carry it; tradition treats it as a matter of patience and steady practice, not fear. Marriage decisions remain a matter for the people and families involved.`
      );
    } else {
      observationBodyHi.push(
        `मंगल आपकी कुंडली में लग्न से ${bhavaLabelHi(mangal.houseFromLagna)} में है — प्रचलित मांगलिक भावों (1, 2, 4, 7, 8, 12) में नहीं।`
      );
      observationBodyEn.push(
        `Mars sits in the ${bhavaLabelEn(mangal.houseFromLagna)} from the Lagna — outside the conventional Mangal houses (1, 2, 4, 7, 8, 12).`
      );
    }
  }
  const observationsSection: KundaliReportSection = {
    id: 'observations',
    eyebrowHi: 'पारम्परिक अवलोकन',
    eyebrowEn: 'Traditional observations',
    titleHi: 'गोचर व योग की वर्तमान स्थिति',
    titleEn: 'Current classical observations',
    bodyHi: observationBodyHi,
    bodyEn: observationBodyEn,
    facts: observationFacts,
    basis: [
      { kind: 'gochar', graha: 'saturn', fromMoonHouse: sadeSati.houseFromMoon, asOfKey: isoKey(now) },
    ],
    ...(sadeSati.phase !== 'none' ? { practiceSourceId: 'shani-ashtakam' as const } : {}),
  };

  // — Vimshottari: dates first, age second, the birth-time balance named.
  const current = getCurrentDasha(chart, now);
  const pair = buildDashaPairReading(chart, now);
  const timelineHi: string[] = [];
  const timelineEn: string[] = [];
  const vimshottariBasis: BasisNode[] = [];
  for (const period of chart.vimshottari) {
    const activeAtBirth = period.start.getTime() <= birth.getTime() && birth.getTime() < period.end.getTime();
    const currentFlag = current?.maha === period;
    const lordHi = GRAHA_NAMES_HI[period.lord];
    const lordEn = GRAHA_NAMES_EN[period.lord];
    const endAge = ageBetween(birth, period.end);
    if (activeAtBirth) {
      const balance = ageBetween(birth, period.end);
      timelineHi.push(
        `${lordHi} महादशा${currentFlag ? ' (वर्तमान)' : ''} · जन्म के समय चल रही → ${formatIstDateHi(period.end)} (आयु ${ageLabelHi(endAge)} तक) · जन्म पर शेष ${ageLabelHi(balance)}, पूर्ण अवधि ${DASHA_YEARS[period.lord]} वर्ष — ${DASHA_LORD_THEME_HI[period.lord]}`
      );
      timelineEn.push(
        `${lordEn} Mahadasha${currentFlag ? ' (current)' : ''} · active at birth → ${formatIstDateEn(period.end)} (until age ${ageLabelEn(endAge)}) · balance at birth ${ageLabelEn(balance)} of the full ${DASHA_YEARS[period.lord]} y — ${DASHA_LORD_THEME_EN[period.lord]}`
      );
    } else {
      timelineHi.push(
        `${lordHi} महादशा${currentFlag ? ' (वर्तमान)' : ''} · ${formatIstDateHi(period.start)} → ${formatIstDateHi(period.end)} (आयु ${ageYears(birth, period.start)}–${ageYears(birth, period.end)}) — ${DASHA_LORD_THEME_HI[period.lord]}`
      );
      timelineEn.push(
        `${lordEn} Mahadasha${currentFlag ? ' (current)' : ''} · ${formatIstDateEn(period.start)} → ${formatIstDateEn(period.end)} (ages ${ageYears(birth, period.start)}–${ageYears(birth, period.end)}) — ${DASHA_LORD_THEME_EN[period.lord]}`
      );
    }
    if (currentFlag) {
      vimshottariBasis.push({ kind: 'dasha', level: 'maha', lord: period.lord, startKey: isoKey(period.start), endKey: isoKey(period.end) });
    }
  }
  timelineHi.push('दशा-क्रम समय पर विचार की पारम्परिक पद्धति है — अवधियाँ अनुकूल काल बताती हैं, किसी घटना की तिथि नहीं।');
  timelineEn.push('The dasha sequence is a traditional way of reflecting on time — periods name supportive windows, never the date of an event.');
  if (pair) vimshottariBasis.push(...pair.basis);

  const vimshottariSection: KundaliReportSection = {
    id: 'vimshottari',
    eyebrowHi: 'समय दृष्टि',
    eyebrowEn: 'Timing lens',
    titleHi: 'विम्शोत्तरी दशा — तिथियों में जीवन-यात्रा',
    titleEn: 'Vimshottari Dasha — a dated life view',
    bodyHi: [...(pair ? pair.bodyHi : []), ...timelineHi],
    bodyEn: [...(pair ? pair.bodyEn : []), ...timelineEn],
    facts: current
      ? [
        fact(
          'current-dasha',
          'वर्तमान अवधि',
          'Current period',
          `${GRAHA_NAMES_HI[current.maha.lord]} महादशा${current.antar ? ` · ${GRAHA_NAMES_HI[current.antar.lord]} अन्तर्दशा` : ''}`,
          `${GRAHA_NAMES_EN[current.maha.lord]} Mahadasha${current.antar ? ` · ${GRAHA_NAMES_EN[current.antar.lord]} Antardasha` : ''}`
        ),
        fact(
          'current-maha-dates',
          'महादशा',
          'Mahadasha',
          `${formatIstDateHi(current.maha.start)} → ${formatIstDateHi(current.maha.end)}`,
          `${formatIstDateEn(current.maha.start)} → ${formatIstDateEn(current.maha.end)}`
        ),
        ...(current.antar
          ? [
            fact(
              'current-antar-dates',
              'अन्तर्दशा',
              'Antardasha',
              `${formatIstDateHi(current.antar.start)} → ${formatIstDateHi(current.antar.end)}`,
              `${formatIstDateEn(current.antar.start)} → ${formatIstDateEn(current.antar.end)}`
            ),
          ]
          : []),
      ]
      : [],
    basis: vimshottariBasis,
  };

  // — Snapshot: a PROJECTION of the sections above, never a new claim. Each
  // fact's id IS the section it is drawn from (pinned by test).
  const snapshotFacts: KundaliReportFact[] = [
    fact(
      'lagna',
      'लग्न',
      'Lagna',
      `${RASHI_NAMES_HI[lagna]} लग्न · लग्नेश ${GRAHA_NAMES_HI[lagnaLord]} ${bhavaLabelHi(lagnaLordNatal.house)} में`,
      `${RASHI_NAMES_EN[lagna]} Lagna · lord ${GRAHA_NAMES_EN[lagnaLord]} in the ${bhavaLabelEn(lagnaLordNatal.house)}`
    ),
    fact(
      'moon',
      'चन्द्र',
      'Moon',
      `${RASHI_NAMES_HI[moon.rashiIndex]} चन्द्र · ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} ${moon.pada} · ${bhavaLabelHi(moon.house)}`,
      `${RASHI_NAMES_EN[moon.rashiIndex]} Moon · ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} ${moon.pada} · ${bhavaLabelEn(moon.house)}`
    ),
    ...(combinations.length > 0
      ? [fact('combinations', 'प्रमुख संयोग', 'Key combination', combinations[0].titleHi, combinations[0].titleEn)]
      : []),
    ...(current
      ? [
        fact(
          'vimshottari',
          'चल रही दशा',
          'Running period',
          `${GRAHA_NAMES_HI[current.maha.lord]} महादशा${current.antar ? ` · ${GRAHA_NAMES_HI[current.antar.lord]} अन्तर्दशा` : ''} · ${formatIstDateHi(current.maha.end)} तक`,
          `${GRAHA_NAMES_EN[current.maha.lord]} Mahadasha${current.antar ? ` · ${GRAHA_NAMES_EN[current.antar.lord]} Antardasha` : ''} · until ${formatIstDateEn(current.maha.end)}`
        ),
      ]
      : []),
    fact(
      'observations',
      'गोचर',
      'Transit',
      `${sadeSati.headlineHi} · ${asOfHi}`,
      `${sadeSati.headlineEn} · as of ${asOfEn}`
    ),
    ...(band !== 'adult'
      ? [
        fact(
          'career',
          'विवेचन का रूप',
          'Reading register',
          `आयु ${ageLabelHi(age)} — जीवन-क्षेत्र सीख और मित्रता पर केन्द्रित, माता-पिता के लिए`,
          `Age ${ageLabelEn(age)} — life areas centre on learning and friendship, addressed to a parent`
        ),
      ]
      : []),
  ];
  const snapshotSection: KundaliReportSection = {
    id: 'snapshot',
    eyebrowHi: 'साठ सेकंड में',
    eyebrowEn: 'In sixty seconds',
    titleHi: 'आपकी कुंडली, एक नज़र में',
    titleEn: 'Your Kundali in sixty seconds',
    bodyHi: ['हर पंक्ति नीचे के किसी खंड से ली गई है — विस्तार और आधार वहाँ है।'],
    bodyEn: ['Every line is drawn from a section below — the detail and its basis live there.'],
    facts: snapshotFacts,
  };

  sections.push(
    snapshotSection,
    summary,
    lagnaSection,
    moonSection,
    combinationsSection,
    ...areaSections,
    observationsSection,
    vimshottariSection
  );

  return {
    reportVersion: 2,
    generatedDateKey: indiaDateKey(now),
    asOfLabelHi: asOfHi,
    asOfLabelEn: asOfEn,
    name: meta.name,
    birthDateLabelHi: meta.birthDateLabelHi,
    birthDateLabelEn: meta.birthDateLabelEn,
    birthTimeLabel: meta.birthTimeLabel,
    cityNameHi: meta.cityNameHi,
    cityNameEn: meta.cityNameEn,
    ageBand: band,
    ageLabelHi: ageLabelHi(age),
    ageLabelEn: ageLabelEn(age),
    lagnaRashiIndex: lagna,
    moonRashiIndex: moon.rashiIndex,
    moonNakshatraIndex: moon.nakshatraIndex,
    moonPada: moon.pada,
    sections,
    disclaimerHi:
      'यह विवेचन पारम्परिक ज्योतिष की दृष्टि है — मार्गदर्शन और चिंतन के लिए, निश्चित भविष्यवाणी नहीं। स्वास्थ्य, धन या विधिक निर्णयों का आधार नहीं।',
    disclaimerEn:
      'This reading is a view from traditional Jyotish — for guidance and reflection, not a certain prediction. It is not a basis for medical, financial, or legal decisions.',
  };
}

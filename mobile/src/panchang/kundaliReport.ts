import { computeSadeSati } from './gochar';
import { DASHA_LORD_THEME_EN, DASHA_LORD_THEME_HI } from './dashaReading';
import {
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
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from './names';
import type {
  KundaliReportFact,
  KundaliReportModel,
  KundaliReportSection,
} from './kundaliReportModel';

/**
 * Compiled Kundali report engine — PRD-20 Phase 6.
 *
 * Pure: explicit chart + display meta + "now" in, a serializable
 * `KundaliReportModel` out. Every sentence is structural, tradition-framed
 * copy composed from typed phrase tables (RULEBOOK §14.3): what a placement
 * is traditionally associated with — never a personality verdict, an event
 * claim, or fear copy. Mangal Dosha ships engine-complete but display-gated
 * off pending product/content review; Kaal Sarp is excluded by explicit
 * decision (PRD-20 §4).
 */

const DAY_MS = 86_400_000;
const YEAR_MS = 365.2425 * DAY_MS;

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

const LIFE_AREAS: readonly LifeArea[] = [
  { id: 'career', titleHi: 'कर्म और कार्यक्षेत्र', titleEn: 'Career and work', houses: [10] },
  { id: 'relationships', titleHi: 'संबंध', titleEn: 'Relationships', houses: [7] },
  { id: 'wealth', titleHi: 'संसाधन और लाभ', titleEn: 'Resources and gains', houses: [2, 11] },
  { id: 'wellbeing', titleHi: 'स्वयं और दिनचर्या', titleEn: 'Self and routine', houses: [1, 6] },
  { id: 'learning', titleHi: 'गृह-सुख और विद्या', titleEn: 'Home and learning', houses: [4, 5] },
  { id: 'dharma', titleHi: 'धर्म और भाग्य-दृष्टि', titleEn: 'Dharma and fortune', houses: [9] },
];

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
  return grahas
    .map((graha) => (hi ? GRAHA_NAMES_HI[graha] : GRAHA_NAMES_EN[graha]))
    .join(hi ? ', ' : ', ');
}

function lifeAreaSection(chart: KundaliChart, area: LifeArea): KundaliReportSection {
  const bodyHi: string[] = [];
  const bodyEn: string[] = [];
  const facts: KundaliReportFact[] = [];

  for (const house of area.houses) {
    const rashi = chart.houses[house - 1];
    const lord = RASHI_LORD[rashi];
    const lordNatal = chart.grahas.find((position) => position.graha === lord)!;
    const occupants = chart.grahas
      .filter((position) => position.house === house)
      .map((position) => position.graha);

    const occupantsHi =
      occupants.length > 0
        ? `भाव में ${grahaListLabel(occupants, true)} स्थित ${occupants.length === 1 ? 'है' : 'हैं'}।`
        : 'भाव में कोई ग्रह नहीं है — परम्परा में तब भाव स्वामी की स्थिति देखी जाती है।';
    const occupantsEn =
      occupants.length > 0
        ? `Grahas placed here: ${grahaListLabel(occupants, false)}.`
        : 'No graha occupies this house — tradition then reads the house through its lord.';

    bodyHi.push(
      `${house} भाव (${HOUSE_THEME_HI[house - 1]}) में ${RASHI_NAMES_HI[rashi]} राशि है; परम्परा इस राशि को ${RASHI_QUALITY_HI[rashi]} से जोड़ती है। भाव का स्वामी ${GRAHA_NAMES_HI[lord]} आपकी कुंडली में ${lordNatal.house} भाव में स्थित है। ${occupantsHi}`
    );
    bodyEn.push(
      `The ${house}th bhava (${HOUSE_THEME_EN[house - 1]}) holds ${RASHI_NAMES_EN[rashi]}; tradition links this sign with ${RASHI_QUALITY_EN[rashi]}. Its lord ${GRAHA_NAMES_EN[lord]} sits in the ${lordNatal.house}th bhava of your chart. ${occupantsEn}`
    );
    facts.push(
      fact(
        `${area.id}-house-${house}`,
        `${house} भाव`,
        `${house}th bhava`,
        `${RASHI_NAMES_HI[rashi]} · स्वामी ${GRAHA_NAMES_HI[lord]}`,
        `${RASHI_NAMES_EN[rashi]} · lord ${GRAHA_NAMES_EN[lord]}`
      )
    );
  }

  bodyHi.push('यह भावों की संरचनात्मक दृष्टि है — जीवन के निर्णय आपके अपने विवेक के विषय हैं।');
  bodyEn.push('This is a structural view of the houses — life decisions remain a matter of your own judgement.');

  return {
    id: area.id,
    eyebrowHi: 'जीवन-क्षेत्र',
    eyebrowEn: 'Life area',
    titleHi: area.titleHi,
    titleEn: area.titleEn,
    bodyHi,
    bodyEn,
    facts,
  };
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
  const sections: KundaliReportSection[] = [];

  // 1 — Birth details + chart summary.
  sections.push({
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
      ...(meta.name
        ? [fact('name', 'नाम', 'Name', meta.name, meta.name)]
        : []),
      fact('birth-date', 'जन्म तिथि', 'Birth date', meta.birthDateLabelHi, meta.birthDateLabelEn),
      ...(meta.birthTimeLabel
        ? [fact('birth-time', 'जन्म समय', 'Birth time', meta.birthTimeLabel, meta.birthTimeLabel)]
        : []),
      fact('birth-city', 'जन्म स्थान', 'Birth place', meta.cityNameHi, meta.cityNameEn),
      fact(
        'lagna',
        'लग्न',
        'Lagna',
        RASHI_NAMES_HI[lagna],
        `${RASHI_NAMES_EN[lagna]} · ${RASHI_NAMES_WESTERN[lagna]} rising`
      ),
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
  });

  // 2 — Lagna reading.
  const lagnaLord = RASHI_LORD[lagna];
  const lagnaLordNatal = chart.grahas.find((position) => position.graha === lagnaLord)!;
  sections.push({
    id: 'lagna',
    eyebrowHi: 'आरम्भ बिंदु',
    eyebrowEn: 'Starting point',
    titleHi: `${RASHI_NAMES_HI[lagna]} लग्न`,
    titleEn: `${RASHI_NAMES_EN[lagna]} Lagna`,
    bodyHi: [
      `जन्म के समय पूर्वी क्षितिज पर ${RASHI_NAMES_HI[lagna]} राशि उदित थी — परम्परा इस राशि को ${RASHI_QUALITY_HI[lagna]} से जोड़ती है और इसी से प्रथम भाव आरम्भ होता है।`,
      `लग्न का स्वामी ${GRAHA_NAMES_HI[lagnaLord]} आपकी कुंडली में ${lagnaLordNatal.house} भाव (${HOUSE_THEME_HI[lagnaLordNatal.house - 1]}) में स्थित है — परम्परा में लग्नेश की स्थिति पूरे विवेचन की एक प्रमुख धुरी मानी जाती है। यह स्वभाव का निर्णय नहीं, पढ़ने का आरम्भिक कोण है।`,
    ],
    bodyEn: [
      `${RASHI_NAMES_EN[lagna]} was rising on the eastern horizon at birth — tradition links this sign with ${RASHI_QUALITY_EN[lagna]}, and the first house begins here.`,
      `The Lagna lord ${GRAHA_NAMES_EN[lagnaLord]} sits in the ${lagnaLordNatal.house}th bhava (${HOUSE_THEME_EN[lagnaLordNatal.house - 1]}) of your chart — tradition treats the Lagna lord’s placement as a main axis of the whole reading. It is a starting lens, not a verdict on character.`,
    ],
    facts: [
      fact(
        'lagna-lord',
        'लग्नेश',
        'Lagna lord',
        `${GRAHA_NAMES_HI[lagnaLord]} · ${lagnaLordNatal.house} भाव`,
        `${GRAHA_NAMES_EN[lagnaLord]} · ${lagnaLordNatal.house}th bhava`
      ),
    ],
  });

  // 3 — Moon + janma nakshatra reading.
  sections.push({
    id: 'moon',
    eyebrowHi: 'अन्तर लय',
    eyebrowEn: 'Inner rhythm',
    titleHi: `${RASHI_NAMES_HI[moon.rashiIndex]} चन्द्र · ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} नक्षत्र`,
    titleEn: `${RASHI_NAMES_EN[moon.rashiIndex]} Moon · ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} nakshatra`,
    bodyHi: [
      `आपका चन्द्र ${RASHI_NAMES_HI[moon.rashiIndex]} राशि में है — परम्परा मन की लय को इस राशि के गुणों (${RASHI_QUALITY_HI[moon.rashiIndex]}) की दृष्टि से पढ़ती है।`,
      `जन्म नक्षत्र ${NAKSHATRA_NAMES_HI[moon.nakshatraIndex]} (पद ${moon.pada}) है, जिसे परम्परा ${NAKSHATRA_QUALITY_HI[moon.nakshatraIndex]} से जोड़ती है। यही नक्षत्र विम्शोत्तरी दशा-क्रम और तारा बल का आधार भी है। यह चिंतन का साधन है, स्थायी व्यक्तित्व-निर्णय नहीं।`,
    ],
    bodyEn: [
      `Your Moon is in ${RASHI_NAMES_EN[moon.rashiIndex]} — tradition reads the mind’s rhythm through this sign’s qualities (${RASHI_QUALITY_EN[moon.rashiIndex]}).`,
      `The janma nakshatra is ${NAKSHATRA_NAMES_EN[moon.nakshatraIndex]} (pada ${moon.pada}), which tradition links with ${NAKSHATRA_QUALITY_EN[moon.nakshatraIndex]}. This nakshatra also seeds the Vimshottari sequence and tara bala. A reflection aid, not a personality verdict.`,
    ],
    facts: [],
  });

  // 4–9 — Life areas.
  for (const area of LIFE_AREAS) {
    sections.push(lifeAreaSection(chart, area));
  }

  // 10 — Classical observations (safety-triaged; PRD-20 §4).
  const sadeSati = computeSadeSati(chart, now, {
    boundaryScanDays: options?.sadeSatiBoundaryScanDays,
  });
  const observationBodyHi = [sadeSati.bodyHi];
  const observationBodyEn = [sadeSati.bodyEn];
  const observationFacts: KundaliReportFact[] = [
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
        `मंगल आपकी कुंडली में लग्न से ${mangal.houseFromLagna} भाव और चन्द्र से ${mangal.houseFromMoon} भाव में है — परम्परा की कुछ धाराएँ इनमें से (1, 2, 4, 7, 8, 12) भावों की स्थिति को मांगलिक योग कहती हैं। बड़ी संख्या में कुंडलियों में यह योग मिलता है; परम्परा इसे धैर्य और नियमित साधना का विषय मानती है, भय का नहीं। विवाह-निर्णय व्यक्तियों और परिवारों के अपने विवेक के विषय हैं।`
      );
      observationBodyEn.push(
        `Mars sits in the ${mangal.houseFromLagna}th bhava from the Lagna and the ${mangal.houseFromMoon}th from the Moon — some streams of tradition call a placement in houses 1, 2, 4, 7, 8, or 12 a Mangal yoga. A large share of charts carry it; tradition treats it as a matter of patience and steady practice, not fear. Marriage decisions remain a matter for the people and families involved.`
      );
    } else {
      observationBodyHi.push(
        `मंगल आपकी कुंडली में लग्न से ${mangal.houseFromLagna} भाव में है — प्रचलित मांगलिक भावों (1, 2, 4, 7, 8, 12) में नहीं।`
      );
      observationBodyEn.push(
        `Mars sits in the ${mangal.houseFromLagna}th bhava from the Lagna — outside the conventional Mangal houses (1, 2, 4, 7, 8, 12).`
      );
    }
  }
  sections.push({
    id: 'observations',
    eyebrowHi: 'पारम्परिक अवलोकन',
    eyebrowEn: 'Traditional observations',
    titleHi: 'गोचर व योग की वर्तमान स्थिति',
    titleEn: 'Current classical observations',
    bodyHi: observationBodyHi,
    bodyEn: observationBodyEn,
    facts: observationFacts,
    ...(sadeSati.phase !== 'none' ? { practiceSourceId: 'shani-ashtakam' as const } : {}),
  });

  // 11 — Vimshottari life-year narrative.
  const birthMs = chart.input.date.getTime();
  const current = getCurrentDasha(chart, now);
  const timelineHi: string[] = [];
  const timelineEn: string[] = [];
  for (const period of chart.vimshottari) {
    const ageStart = Math.max(0, Math.floor((period.start.getTime() - birthMs) / YEAR_MS));
    const ageEnd = Math.floor((period.end.getTime() - birthMs) / YEAR_MS);
    const currentFlag = current?.maha === period;
    timelineHi.push(
      `आयु ${ageStart}–${ageEnd} वर्ष · ${GRAHA_NAMES_HI[period.lord]} महादशा${currentFlag ? ' (वर्तमान)' : ''} — ${DASHA_LORD_THEME_HI[period.lord]}`
    );
    timelineEn.push(
      `Age ${ageStart}–${ageEnd} · ${GRAHA_NAMES_EN[period.lord]} Mahadasha${currentFlag ? ' (current)' : ''} — ${DASHA_LORD_THEME_EN[period.lord]}`
    );
  }
  timelineHi.push('दशा-क्रम समय पर विचार की पारम्परिक पद्धति है — यह किसी घटना की सूचना या गारंटी नहीं देता।');
  timelineEn.push('The dasha sequence is a traditional way of reflecting on time — it does not announce or guarantee any event.');
  sections.push({
    id: 'vimshottari',
    eyebrowHi: 'समय दृष्टि',
    eyebrowEn: 'Timing lens',
    titleHi: 'विम्शोत्तरी दशा — जीवन-वर्षों की झलक',
    titleEn: 'Vimshottari Dasha — a life-year view',
    bodyHi: timelineHi,
    bodyEn: timelineEn,
    facts: current
      ? [
        fact(
          'current-dasha',
          'वर्तमान अवधि',
          'Current period',
          `${GRAHA_NAMES_HI[current.maha.lord]} महादशा${current.antar ? ` · ${GRAHA_NAMES_HI[current.antar.lord]} अन्तर्दशा` : ''}`,
          `${GRAHA_NAMES_EN[current.maha.lord]} Mahadasha${current.antar ? ` · ${GRAHA_NAMES_EN[current.antar.lord]} Antardasha` : ''}`
        ),
      ]
      : [],
  });

  return {
    reportVersion: 1,
    generatedDateKey: indiaDateKey(now),
    name: meta.name,
    birthDateLabelHi: meta.birthDateLabelHi,
    birthDateLabelEn: meta.birthDateLabelEn,
    birthTimeLabel: meta.birthTimeLabel,
    cityNameHi: meta.cityNameHi,
    cityNameEn: meta.cityNameEn,
    lagnaRashiIndex: lagna,
    moonRashiIndex: moon.rashiIndex,
    moonNakshatraIndex: moon.nakshatraIndex,
    moonPada: moon.pada,
    sections,
    disclaimerHi:
      'यह विवेचन पारम्परिक ज्योतिष की संरचनात्मक दृष्टि है — मार्गदर्शन और चिंतन के लिए, निश्चित भविष्यवाणी नहीं। स्वास्थ्य, धन या विधिक निर्णयों का आधार नहीं।',
    disclaimerEn:
      'This reading is a structural view from traditional Jyotish — for guidance and reflection, not a certain prediction. It is not a basis for medical, financial, or legal decisions.',
  };
}

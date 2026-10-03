import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  GRAHA_ORDER,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
} from './kundali';
import type { Graha, GrahaPosition, KundaliChart } from './kundali';
import {
  DIGNITY_LABEL_EN,
  DIGNITY_LABEL_HI,
  DUSTHANA_HOUSES,
  KENDRA_HOUSES,
  TRIKONA_HOUSES,
  dignityOfPosition,
  houseClassEn,
  houseClassHi,
  houseTheme,
  type AgeBand,
  type BasisNode,
  type Dignity,
} from './kundaliBasis';
import { bhavaLabelEn, bhavaLabelHi } from './reportFormat';

/**
 * Combinations engine — PRD-43 Wave B.
 *
 * The report read every placement alone: "Saturn is in the 1st" and, three
 * sections later, "Rahu is in the 1st". A reader's FIRST move is to notice
 * they share a house. This module finds what placements do together —
 * conjunctions, the Lagna lord's seat, dignities, and a small allow-listed set
 * of classical yogas — ranks them deterministically, and caps the list so a
 * reading never becomes a twenty-item yoga inventory.
 *
 * Pure: chart in, typed data out. Every combination carries its `basis`
 * from the moment it is created (RULEBOOK §14.3.1); copy is composed from the
 * tables below, never authored per chart (§14.3.2).
 */

export type CombinationKind = 'lagna-lord' | 'conjunction' | 'dignity' | 'yoga';

export type KundaliCombination = {
  id: string;
  kind: CombinationKind;
  grahas: readonly Graha[];
  house: number | null;
  rashiIndex: number | null;
  /** Deterministic rank. Never shown to users as a score. */
  weight: number;
  titleHi: string;
  titleEn: string;
  bodyHi: string;
  bodyEn: string;
  basis: readonly BasisNode[];
};

export type YogaId =
  | 'budhaditya'
  | 'gajakesari'
  | 'chandra-mangal'
  | 'kendra-trikona'
  | 'dhana';

export type YogaDefinition = {
  id: YogaId;
  nameHi: string;
  nameEn: string;
  /** What tradition associates the yoga with — never a verdict. */
  themeHi: string;
  themeEn: string;
  weight: number;
  source: {
    /** Two independent published sources concur (RULEBOOK §10). All false at
     * ship; the engine test pins that no entry claims otherwise. */
    verified: boolean;
    referenceUrls: readonly string[];
    notes: string;
  };
};

export const YOGA_DEFINITIONS: readonly YogaDefinition[] = [
  {
    id: 'budhaditya',
    nameHi: 'सूर्य–बुध सम्बन्ध · बुधादित्य योग (पारम्परिक एक-राशि नियम)',
    nameEn: 'Sun–Mercury association · Budhaditya yoga (traditional same-sign rule)',
    themeHi: 'सूर्य और बुध का एक राशि में होना — परम्परा इसे स्पष्ट बुद्धि, संवाद और सीखने की तत्परता से जोड़ती है। एक-राशि नियम हर ऐसी कुंडली में योग गिनता है; अंशों में निकटता जितनी अधिक, परम्परा इसे उतना ही सघन पढ़ती है — इसलिए इसे सम्बन्ध की तरह पढ़ें, हर कुंडली में समान बल का योग नहीं।',
    themeEn: 'Sun and Mercury sharing a sign — tradition links it with clear thinking, articulate speech and a readiness to learn. The same-sign rule counts the yoga in every such chart; the closer the two stand by degree, the more concentrated tradition reads it — so read this as an association, not a yoga of equal strength in every chart.',
    weight: 75,
    source: { verified: false, referenceUrls: [], notes: 'BPHS; Phaladeepika ch. 6. Two-source review pending.' },
  },
  {
    id: 'gajakesari',
    nameHi: 'गजकेसरी योग',
    nameEn: 'Gajakesari yoga',
    themeHi: 'गुरु का चन्द्र से केन्द्र में होना — परम्परा इसे विवेक, प्रतिष्ठा और दबाव में स्थिर मन से जोड़ती है।',
    themeEn: 'Jupiter in a kendra from the Moon — tradition links it with sound judgement, standing, and a mind that steadies under pressure.',
    weight: 78,
    source: { verified: false, referenceUrls: [], notes: 'BPHS; Phaladeepika ch. 6. Two-source review pending.' },
  },
  {
    id: 'chandra-mangal',
    nameHi: 'चन्द्र–मंगल सम्बन्ध · चन्द्र-मंगल योग (पारम्परिक एक-राशि नियम)',
    nameEn: 'Moon–Mars association · Chandra-Mangal yoga (traditional same-sign rule)',
    themeHi: 'चन्द्र और मंगल का एक राशि में होना — परम्परा इसे उद्यम, कमाने की क्षमता और भावनाओं की तीव्रता से जोड़ती है। एक-राशि नियम हर ऐसी कुंडली में योग गिनता है; अंशों में निकटता जितनी अधिक, परम्परा इसे उतना ही सघन पढ़ती है।',
    themeEn: 'Moon and Mars sharing a sign — tradition links it with enterprise, earning capacity, and intensity of feeling. The same-sign rule counts the yoga in every such chart; the closer the two stand by degree, the more concentrated tradition reads it.',
    weight: 72,
    source: { verified: false, referenceUrls: [], notes: 'BPHS; Saravali. Two-source review pending.' },
  },
  {
    id: 'kendra-trikona',
    nameHi: 'केन्द्र-त्रिकोण सम्बन्ध (राजयोग)',
    nameEn: 'Kendra–trikona association (raja yoga family)',
    themeHi: 'एक केन्द्र का स्वामी और एक त्रिकोण का स्वामी साथ या परस्पर स्थान बदलकर — परम्परा इसे अधिकार, उन्नति और सुयोग से जोड़ती है।',
    themeEn: 'A kendra lord and a trikona lord together or in mutual exchange — tradition links it with authority, rise, and timely opportunity.',
    weight: 85,
    source: { verified: false, referenceUrls: [], notes: 'BPHS ch. 41 (Raja yoga). Two-source review pending.' },
  },
  {
    id: 'dhana',
    nameHi: 'धन योग',
    nameEn: 'Dhana yoga',
    themeHi: 'द्वितीय और एकादश भाव के स्वामियों का सम्बन्ध — परम्परा इसे संचय और आय के स्रोतों से जोड़ती है।',
    themeEn: 'The lords of the 2nd and 11th in association — tradition links it with accumulation and sources of income.',
    weight: 68,
    source: { verified: false, referenceUrls: [], notes: 'BPHS ch. 42 (Dhana yoga). Two-source review pending.' },
  },
];

/** Same table as `kundaliReport.RASHI_LORD`; duplicated here to avoid the import cycle. */
export const RASHI_LORD_BY_INDEX: readonly Graha[] = [
  'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
];

export const GRAHA_KEYWORD_HI: Readonly<Record<Graha, string>> = {
  sun: 'आत्मबल और अधिकार',
  moon: 'मन और पोषण',
  mars: 'ऊर्जा और साहस',
  mercury: 'बुद्धि और संवाद',
  jupiter: 'विद्या और विस्तार',
  venus: 'सौन्दर्य और संबंध',
  saturn: 'अनुशासन और धैर्य',
  rahu: 'महत्वाकांक्षा और नवीनता',
  ketu: 'विरक्ति और अंतर्दृष्टि',
};

export const GRAHA_KEYWORD_EN: Readonly<Record<Graha, string>> = {
  sun: 'vitality and authority',
  moon: 'mind and nurture',
  mars: 'energy and courage',
  mercury: 'intellect and speech',
  jupiter: 'learning and expansion',
  venus: 'beauty and relationship',
  saturn: 'discipline and patience',
  rahu: 'ambition and novelty',
  ketu: 'detachment and insight',
};

const DEFAULT_CAP = 6;

function pos(chart: KundaliChart, graha: Graha): GrahaPosition {
  const found = chart.grahas.find((position) => position.graha === graha);
  if (!found) throw new Error(`${graha} position is required`);
  return found;
}

function lordOfHouse(chart: KundaliChart, house: number): Graha {
  return RASHI_LORD_BY_INDEX[chart.houses[house - 1]];
}

function names(grahas: readonly Graha[], hi: boolean): string {
  return grahas.map((graha) => (hi ? GRAHA_NAMES_HI[graha] : GRAHA_NAMES_EN[graha])).join(hi ? ' और ' : ' and ');
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

/**
 * Orb inside which a same-sign pair is also called a CLOSE conjunction. The
 * engine groups by whole sign (the classical bhava rule); the degree gap is
 * always stated so "together" never implies a tight conjunction it did not
 * measure. 10° is the wider of the two common orbs (8°/10°).
 */
export const CLOSE_CONJUNCTION_ORB_DEGREES = 10;

/** Largest gap by degree among grahas that share a sign. */
export function separationWithinSign(group: readonly GrahaPosition[]): number {
  const degrees = group.map((position) => position.degreeInRashi);
  return Math.max(...degrees) - Math.min(...degrees);
}

/** `10°32′` — whole minutes, never a decimal degree in copy. */
export function formatSeparation(degrees: number): string {
  const totalMinutes = Math.round(degrees * 60);
  const whole = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${whole}°${String(minutes).padStart(2, '0')}′`;
}

/** The nodes are always retrograde, so naming it says nothing — planets only. */
function retrogradePlanets(group: readonly GrahaPosition[]): readonly GrahaPosition[] {
  return group.filter((position) => position.retrograde && position.graha !== 'rahu' && position.graha !== 'ketu');
}

function retrogradeNamesHi(group: readonly GrahaPosition[]): string {
  const names = retrogradePlanets(group).map((position) => GRAHA_NAMES_HI[position.graha]);
  if (names.length === 0) return '';
  return ` ${names.join(' और ')} वक्री ${names.length === 1 ? 'है' : 'हैं'}।`;
}

function retrogradeNamesEn(group: readonly GrahaPosition[]): string {
  const names = retrogradePlanets(group).map((position) => GRAHA_NAMES_EN[position.graha]);
  if (names.length === 0) return '';
  return ` ${names.join(' and ')} ${names.length === 1 ? 'is' : 'are'} retrograde.`;
}

/** The degree-gap sentence every same-sign pairing carries (RULEBOOK §14.3.2). */
function separationClauseHi(group: readonly GrahaPosition[]): string {
  const gap = separationWithinSign(group);
  const label = formatSeparation(gap);
  return gap <= CLOSE_CONJUNCTION_ORB_DEGREES
    ? `अंशों में ये लगभग ${label} के भीतर हैं — राशि से भी और अंश से भी निकट युति।${retrogradeNamesHi(group)}`
    : `अंशों में ये लगभग ${label} दूर हैं — पूर्ण-राशि पद्धति इन्हें एक भाव में रखती है; यह अंशों की निकट युति नहीं है।${retrogradeNamesHi(group)}`;
}

function separationClauseEn(group: readonly GrahaPosition[]): string {
  const gap = separationWithinSign(group);
  const label = formatSeparation(gap);
  return gap <= CLOSE_CONJUNCTION_ORB_DEGREES
    ? `By degree they stand within about ${label} of each other — a close conjunction by degree as well as by sign.${retrogradeNamesEn(group)}`
    : `By degree they stand about ${label} apart — the whole-sign reading places them in one bhava; this is not a tight conjunction.${retrogradeNamesEn(group)}`;
}

/**
 * Register per age band, appended to conjunction and yoga bodies only. For a
 * child the placement is recorded as something to notice over time — never a
 * settled trait (PRD-43 §5.4; the September 2026 child-chart review).
 */
const CHILD_FRAME_HI: Readonly<Record<'conjunction' | 'yoga', string>> = {
  conjunction: 'इस आयु में इसे केवल समय के साथ देखने की बात समझें — तय स्वभाव नहीं।',
  yoga: 'बच्चे के लिए यह योग एक शास्त्रीय स्थिति के रूप में दर्ज है — यह खेल और सीख में वर्षों में कैसे दिखता है, यह देखने की बात है, तय गुण नहीं।',
};

const CHILD_FRAME_EN: Readonly<Record<'conjunction' | 'yoga', string>> = {
  conjunction: 'At this age, treat this only as something to observe over time — not a fixed trait.',
  yoga: 'For a child, the yoga is recorded as a classical placement — how it shows in play and learning over the years is something to watch, not a settled trait.',
};

function frameForBand(kind: 'conjunction' | 'yoga', band: AgeBand | undefined, hi: boolean): string {
  if (band !== 'child') return '';
  return ` ${hi ? CHILD_FRAME_HI[kind] : CHILD_FRAME_EN[kind]}`;
}

/* ------------------------------------------------------------------ */
/*  1. Lagna lord                                                       */
/* ------------------------------------------------------------------ */

const LAGNA_LORD_CLASS_HI: Record<'lagna' | 'kendra' | 'trikona' | 'dusthana' | 'other', string> = {
  lagna: 'लग्नेश लग्न में ही है — परम्परा इसे आत्म-बल, स्थिर पहचान और अपने बल पर टिकने की प्रवृत्ति से जोड़ती है।',
  kendra: 'लग्नेश केन्द्र में है — परम्परा इसे जीवन के मुख्य स्तम्भों (घर, संबंध, कर्म) से सीधा जुड़ाव और टिकाऊ बल कहती है।',
  trikona: 'लग्नेश त्रिकोण में है — परम्परा इसे भाग्य, विद्या और सुयोग के साथ आत्म-प्रकाश से जोड़ती है।',
  dusthana: 'लग्नेश दुःस्थान में है — परम्परा इसे संघर्ष से गढ़े गए व्यक्तित्व और देर से मिलने वाली स्थिरता से जोड़ती है; यह क्षमता नहीं, मार्ग की बात है।',
  other: 'लग्नेश एक सामान्य भाव में है — परम्परा में लग्नेश की स्थिति पूरे विवेचन की एक प्रमुख धुरी है, इसलिए यह भाव स्वभाव का पहला रंग देता है।',
};

const LAGNA_LORD_CLASS_EN: Record<'lagna' | 'kendra' | 'trikona' | 'dusthana' | 'other', string> = {
  lagna: 'The Lagna lord sits in the Lagna itself — tradition links this with self-reliance, a settled sense of identity, and standing on one’s own strength.',
  kendra: 'The Lagna lord sits in a kendra — tradition reads this as a direct tie to life’s main pillars (home, relationship, work) and durable strength.',
  trikona: 'The Lagna lord sits in a trikona — tradition links this with fortune, learning and timely opportunity alongside self-expression.',
  dusthana: 'The Lagna lord sits in a dusthana — tradition links this with a character shaped by effort and a stability that arrives late; a statement about the road, not the capacity.',
  other: 'The Lagna lord sits in a neutral house — tradition treats the Lagna lord’s seat as a main axis of the whole reading, so this house gives the first colour of temperament.',
};

function lagnaLordCombination(chart: KundaliChart): KundaliCombination {
  const lord = lordOfHouse(chart, 1);
  const seat = pos(chart, lord);
  const cls: keyof typeof LAGNA_LORD_CLASS_HI =
    seat.house === 1
      ? 'lagna'
      : KENDRA_HOUSES.includes(seat.house)
        ? 'kendra'
        : TRIKONA_HOUSES.includes(seat.house)
          ? 'trikona'
          : DUSTHANA_HOUSES.includes(seat.house)
            ? 'dusthana'
            : 'other';
  const dignity = dignityOfPosition(seat);
  const dignityHi = dignity === 'neutral' ? '' : ` ${GRAHA_NAMES_HI[lord]} यहाँ ${DIGNITY_LABEL_HI[dignity]} है, जो इस संकेत को ${dignity === 'debilitated' ? 'धीमा' : 'और पक्का'} करता है।`;
  const dignityEn = dignity === 'neutral' ? '' : ` ${GRAHA_NAMES_EN[lord]} is ${DIGNITY_LABEL_EN[dignity]} here, which ${dignity === 'debilitated' ? 'slows' : 'firms up'} that indication.`;
  return {
    id: `lagna-lord-${lord}-${seat.house}`,
    kind: 'lagna-lord',
    grahas: [lord],
    house: seat.house,
    rashiIndex: seat.rashiIndex,
    weight: 100,
    titleHi: `लग्नेश ${GRAHA_NAMES_HI[lord]} · ${bhavaLabelHi(seat.house)} (${houseClassHi(seat.house)})`,
    titleEn: `Lagna lord ${GRAHA_NAMES_EN[lord]} · ${bhavaLabelEn(seat.house)} (${houseClassEn(seat.house)})`,
    bodyHi: `${LAGNA_LORD_CLASS_HI[cls]}${dignityHi}`,
    bodyEn: `${LAGNA_LORD_CLASS_EN[cls]}${dignityEn}`,
    basis: [
      { kind: 'bhava', house: 1, rashiIndex: chart.lagnaRashiIndex },
      { kind: 'lord', graha: lord, ofHouse: 1, inHouse: seat.house },
      grahaNode(seat),
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  2. Conjunctions                                                     */
/* ------------------------------------------------------------------ */

function conjunctions(chart: KundaliChart, band?: AgeBand): KundaliCombination[] {
  const byHouse = new Map<number, GrahaPosition[]>();
  for (const graha of GRAHA_ORDER) {
    const position = pos(chart, graha);
    const list = byHouse.get(position.house) ?? [];
    list.push(position);
    byHouse.set(position.house, list);
  }
  const out: KundaliCombination[] = [];
  for (const [house, group] of [...byHouse.entries()].sort((a, b) => a[0] - b[0])) {
    if (group.length < 2) continue;
    const grahas = group.map((position) => position.graha);
    const theme = houseTheme(house);
    const rashi = chart.houses[house - 1];
    const keywordsHi = grahas.map((graha) => `${GRAHA_NAMES_HI[graha]} (${GRAHA_KEYWORD_HI[graha]})`).join(', ');
    const keywordsEn = grahas.map((graha) => `${GRAHA_NAMES_EN[graha]} (${GRAHA_KEYWORD_EN[graha]})`).join(', ');
    out.push({
      id: `conj-${grahas.join('-')}-${house}`,
      kind: 'conjunction',
      grahas,
      house,
      rashiIndex: rashi,
      weight: 80 + group.length * 4 + (KENDRA_HOUSES.includes(house) ? 6 : 0),
      titleHi: `${names(grahas, true)} एक ही भाव में · ${bhavaLabelHi(house)}`,
      titleEn: `${names(grahas, false)} in the same bhava · ${bhavaLabelEn(house)}`,
      bodyHi: `${keywordsHi} — ये ${RASHI_NAMES_HI[rashi]} राशि में, ${bhavaLabelHi(house)} (${theme.hi}) में एक ही भाव में हैं। ${separationClauseHi(group)} परम्परा में एक भाव के ग्रह अपने विषय आपस में मिला देते हैं: यहाँ ${theme.hi} के विषय इन सब के रंग में एक साथ पढ़े जाते हैं, अलग-अलग नहीं।${frameForBand('conjunction', band, true)}`,
      bodyEn: `${keywordsEn} — share ${RASHI_NAMES_EN[rashi]} in the ${bhavaLabelEn(house)} (${theme.en}). ${separationClauseEn(group)} Tradition reads grahas in one house as blending their significations: matters of ${theme.en} here carry all of these colours at once, not one at a time.${frameForBand('conjunction', band, false)}`,
      basis: [
        { kind: 'bhava', house, rashiIndex: rashi },
        ...group.map(grahaNode),
      ],
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  3. Dignity                                                          */
/* ------------------------------------------------------------------ */

const DIGNITY_BODY_HI: Record<Exclude<Dignity, 'neutral'>, (graha: Graha, house: number) => string> = {
  exalted: (graha, house) => `${GRAHA_NAMES_HI[graha]} उच्च राशि में है — परम्परा में ${GRAHA_KEYWORD_HI[graha]} के विषय यहाँ अपने पूरे बल में माने जाते हैं, और ${bhavaLabelHi(house)} (${houseTheme(house).hi}) में यह बल दिखता है।`,
  own: (graha, house) => `${GRAHA_NAMES_HI[graha]} अपनी ही राशि में है — परम्परा इसे स्थिर, सहज बल कहती है: ${GRAHA_KEYWORD_HI[graha]} के विषय ${bhavaLabelHi(house)} (${houseTheme(house).hi}) में सधे हुए रहते हैं।`,
  debilitated: (graha, house) => `${GRAHA_NAMES_HI[graha]} नीच राशि में है — परम्परा में ${GRAHA_KEYWORD_HI[graha]} के विषय यहाँ अधिक प्रयास माँगते हैं; ${bhavaLabelHi(house)} (${houseTheme(house).hi}) में यह धैर्य का क्षेत्र है, अभाव का नहीं।`,
};

const DIGNITY_BODY_EN: Record<Exclude<Dignity, 'neutral'>, (graha: Graha, house: number) => string> = {
  exalted: (graha, house) => `${GRAHA_NAMES_EN[graha]} is exalted — tradition treats matters of ${GRAHA_KEYWORD_EN[graha]} as running at full strength, and the ${bhavaLabelEn(house)} (${houseTheme(house).en}) is where that strength shows.`,
  own: (graha, house) => `${GRAHA_NAMES_EN[graha]} is in its own sign — tradition calls this steady, unforced strength: matters of ${GRAHA_KEYWORD_EN[graha]} stay well-founded in the ${bhavaLabelEn(house)} (${houseTheme(house).en}).`,
  debilitated: (graha, house) => `${GRAHA_NAMES_EN[graha]} is debilitated — tradition reads matters of ${GRAHA_KEYWORD_EN[graha]} as asking for more effort here; the ${bhavaLabelEn(house)} (${houseTheme(house).en}) is a field for patience, not a lack.`,
};

function dignities(chart: KundaliChart): KundaliCombination[] {
  const out: KundaliCombination[] = [];
  for (const graha of GRAHA_ORDER) {
    const position = pos(chart, graha);
    const dignity = dignityOfPosition(position);
    if (dignity === 'neutral') continue;
    out.push({
      id: `dignity-${graha}-${dignity}`,
      kind: 'dignity',
      grahas: [graha],
      house: position.house,
      rashiIndex: position.rashiIndex,
      weight: dignity === 'exalted' ? 70 : dignity === 'debilitated' ? 65 : 55,
      titleHi: `${GRAHA_NAMES_HI[graha]} ${DIGNITY_LABEL_HI[dignity]} · ${RASHI_NAMES_HI[position.rashiIndex]}, ${bhavaLabelHi(position.house)}`,
      titleEn: `${GRAHA_NAMES_EN[graha]} ${DIGNITY_LABEL_EN[dignity]} · ${RASHI_NAMES_EN[position.rashiIndex]}, ${bhavaLabelEn(position.house)}`,
      bodyHi: DIGNITY_BODY_HI[dignity](graha, position.house),
      bodyEn: DIGNITY_BODY_EN[dignity](graha, position.house),
      basis: [grahaNode(position)],
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  4. Allow-listed yogas                                               */
/* ------------------------------------------------------------------ */

function yogaDef(id: YogaId): YogaDefinition {
  return YOGA_DEFINITIONS.find((definition) => definition.id === id)!;
}

function yogaCombination(
  def: YogaDefinition,
  grahas: readonly Graha[],
  house: number | null,
  rashiIndex: number | null,
  basis: readonly BasisNode[],
  detailHi: string,
  detailEn: string,
  band?: AgeBand
): KundaliCombination {
  return {
    id: `yoga-${def.id}`,
    kind: 'yoga',
    grahas,
    house,
    rashiIndex,
    weight: def.weight,
    titleHi: def.nameHi,
    titleEn: def.nameEn,
    bodyHi: `${detailHi} ${def.themeHi}${frameForBand('yoga', band, true)}`,
    bodyEn: `${detailEn} ${def.themeEn}${frameForBand('yoga', band, false)}`,
    basis: [{ kind: 'yoga', yogaId: def.id }, ...basis],
  };
}

function sameHouse(a: GrahaPosition, b: GrahaPosition): boolean {
  return a.house === b.house;
}

/** Parivartana: each sits in a sign the other rules. */
function exchanged(chart: KundaliChart, a: Graha, b: Graha): boolean {
  const pa = pos(chart, a);
  const pb = pos(chart, b);
  return RASHI_LORD_BY_INDEX[pa.rashiIndex] === b && RASHI_LORD_BY_INDEX[pb.rashiIndex] === a;
}

function yogas(chart: KundaliChart, band?: AgeBand): KundaliCombination[] {
  const out: KundaliCombination[] = [];
  const sun = pos(chart, 'sun');
  const moon = pos(chart, 'moon');
  const mars = pos(chart, 'mars');
  const mercury = pos(chart, 'mercury');
  const jupiter = pos(chart, 'jupiter');

  if (sameHouse(sun, mercury)) {
    out.push(
      yogaCombination(
        yogaDef('budhaditya'),
        ['sun', 'mercury'],
        sun.house,
        sun.rashiIndex,
        [grahaNode(sun), grahaNode(mercury)],
        `सूर्य और बुध ${bhavaLabelHi(sun.house)} (${houseTheme(sun.house).hi}) में एक ही राशि में हैं। ${separationClauseHi([sun, mercury])}`,
        `Sun and Mercury share the ${bhavaLabelEn(sun.house)} (${houseTheme(sun.house).en}). ${separationClauseEn([sun, mercury])}`,
        band
      )
    );
  }

  const jupiterFromMoon = ((jupiter.rashiIndex - moon.rashiIndex + 12) % 12) + 1;
  if (KENDRA_HOUSES.includes(jupiterFromMoon)) {
    out.push(
      yogaCombination(
        yogaDef('gajakesari'),
        ['jupiter', 'moon'],
        jupiter.house,
        jupiter.rashiIndex,
        [grahaNode(moon), grahaNode(jupiter)],
        `गुरु चन्द्र से ${bhavaLabelHi(jupiterFromMoon)} (केन्द्र) में है।`,
        `Jupiter stands in the ${bhavaLabelEn(jupiterFromMoon)} (a kendra) from the Moon.`,
        band
      )
    );
  }

  if (sameHouse(moon, mars)) {
    out.push(
      yogaCombination(
        yogaDef('chandra-mangal'),
        ['moon', 'mars'],
        moon.house,
        moon.rashiIndex,
        [grahaNode(moon), grahaNode(mars)],
        `चन्द्र और मंगल ${bhavaLabelHi(moon.house)} (${houseTheme(moon.house).hi}) में एक ही राशि में हैं। ${separationClauseHi([moon, mars])}`,
        `Moon and Mars share the ${bhavaLabelEn(moon.house)} (${houseTheme(moon.house).en}). ${separationClauseEn([moon, mars])}`,
        band
      )
    );
  }

  // Kendra–trikona: lords of 4/7/10 with lords of 5/9 (the Lagna lord counts
  // on both sides classically; excluded here so the Lagna-lord card is not
  // double-counted).
  const kendraLords = [4, 7, 10].map((house) => ({ house, lord: lordOfHouse(chart, house) }));
  const trikonaLords = [5, 9].map((house) => ({ house, lord: lordOfHouse(chart, house) }));
  let kendraTrikona: KundaliCombination | null = null;
  for (const k of kendraLords) {
    for (const t of trikonaLords) {
      if (k.lord === t.lord) continue;
      const pk = pos(chart, k.lord);
      const pt = pos(chart, t.lord);
      const together = sameHouse(pk, pt);
      const swap = exchanged(chart, k.lord, t.lord);
      if (!together && !swap) continue;
      const candidate = yogaCombination(
        yogaDef('kendra-trikona'),
        [k.lord, t.lord],
        together ? pk.house : null,
        together ? pk.rashiIndex : null,
        [
          { kind: 'lord', graha: k.lord, ofHouse: k.house, inHouse: pk.house },
          { kind: 'lord', graha: t.lord, ofHouse: t.house, inHouse: pt.house },
        ],
        together
          ? `${bhavaLabelHi(k.house)} का स्वामी ${GRAHA_NAMES_HI[k.lord]} और ${bhavaLabelHi(t.house)} का स्वामी ${GRAHA_NAMES_HI[t.lord]} ${bhavaLabelHi(pk.house)} में साथ हैं।`
          : `${bhavaLabelHi(k.house)} का स्वामी ${GRAHA_NAMES_HI[k.lord]} और ${bhavaLabelHi(t.house)} का स्वामी ${GRAHA_NAMES_HI[t.lord]} परस्पर राशि-परिवर्तन में हैं।`,
        together
          ? `The lord of the ${bhavaLabelEn(k.house)}, ${GRAHA_NAMES_EN[k.lord]}, and the lord of the ${bhavaLabelEn(t.house)}, ${GRAHA_NAMES_EN[t.lord]}, share the ${bhavaLabelEn(pk.house)}.`
          : `The lord of the ${bhavaLabelEn(k.house)}, ${GRAHA_NAMES_EN[k.lord]}, and the lord of the ${bhavaLabelEn(t.house)}, ${GRAHA_NAMES_EN[t.lord]}, are in mutual exchange.`,
        band
      );
      if (!kendraTrikona) kendraTrikona = candidate;
    }
  }
  if (kendraTrikona) out.push(kendraTrikona);

  const lord2 = lordOfHouse(chart, 2);
  const lord11 = lordOfHouse(chart, 11);
  const p2 = pos(chart, lord2);
  const p11 = pos(chart, lord11);
  const dhanaTogether = lord2 !== lord11 && sameHouse(p2, p11);
  const dhanaSwap = lord2 !== lord11 && exchanged(chart, lord2, lord11);
  const dhanaSeated = [2, 11].includes(p2.house) && [2, 11].includes(p11.house);
  if (dhanaTogether || dhanaSwap || dhanaSeated) {
    out.push(
      yogaCombination(
        yogaDef('dhana'),
        lord2 === lord11 ? [lord2] : [lord2, lord11],
        dhanaTogether ? p2.house : null,
        dhanaTogether ? p2.rashiIndex : null,
        [
          { kind: 'lord', graha: lord2, ofHouse: 2, inHouse: p2.house },
          { kind: 'lord', graha: lord11, ofHouse: 11, inHouse: p11.house },
        ],
        dhanaTogether
          ? `द्वितीयेश ${GRAHA_NAMES_HI[lord2]} और एकादशेश ${GRAHA_NAMES_HI[lord11]} ${bhavaLabelHi(p2.house)} में साथ हैं।`
          : dhanaSwap
            ? `द्वितीयेश ${GRAHA_NAMES_HI[lord2]} और एकादशेश ${GRAHA_NAMES_HI[lord11]} परस्पर राशि-परिवर्तन में हैं।`
            : `द्वितीय और एकादश भाव के स्वामी धन-भावों (द्वितीय/एकादश) में ही स्थित हैं।`,
        dhanaTogether
          ? `The lord of the 2nd, ${GRAHA_NAMES_EN[lord2]}, and the lord of the 11th, ${GRAHA_NAMES_EN[lord11]}, share the ${bhavaLabelEn(p2.house)}.`
          : dhanaSwap
            ? `The lord of the 2nd, ${GRAHA_NAMES_EN[lord2]}, and the lord of the 11th, ${GRAHA_NAMES_EN[lord11]}, are in mutual exchange.`
            : `The lords of the 2nd and 11th both sit in the wealth houses (2nd/11th).`,
        band
      )
    );
  }

  return out;
}

/* ------------------------------------------------------------------ */
/*  Rank and cap                                                        */
/* ------------------------------------------------------------------ */

export function computeCombinations(
  chart: KundaliChart,
  options?: { cap?: number; band?: AgeBand }
): readonly KundaliCombination[] {
  const cap = options?.cap ?? DEFAULT_CAP;
  const band = options?.band;
  const all = [lagnaLordCombination(chart), ...conjunctions(chart, band), ...yogas(chart, band), ...dignities(chart)];
  for (const combination of all) {
    if (combination.basis.length === 0) throw new Error(`combination ${combination.id} has no basis`);
  }
  return all
    .sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id))
    .slice(0, cap);
}

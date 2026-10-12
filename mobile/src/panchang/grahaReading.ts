import { GRAHA_NAMES_EN, GRAHA_NAMES_HI, GRAHA_ORDER, RASHI_NAMES_EN, RASHI_NAMES_HI, RASHI_NAMES_WESTERN } from './kundali';
import type { Graha, GrahaPosition, KundaliChart } from './kundali';
import {
  COMBUSTION_ORB_DEG,
  DUSTHANA_HOUSES,
  KENDRA_HOUSES,
  NATURAL_BENEFICS,
  TRIKONA_HOUSES,
  dignityOfPosition,
  elongationDeg,
  housesRuledBy,
  maitriRow,
  signLordOf,
  signRelationOf,
  type BasisNode,
  type Dignity,
} from './kundaliBasis';
import {
  BHAVA_PLAIN,
  EMPTY_HOUSE_LINE,
  EMPTY_HOUSES_COPY,
  FACTOR_REASON,
  GRAHA_BHAVA_READINGS,
  GRAHA_PLAIN,
  GRAHA_UPAY,
  KARAKA_LABEL,
  MAITRI_LABELS,
  MANTRA_COUNT,
  RETROGRADE_NOTE,
  SIGN_STRENGTH,
  TONE_LABEL,
  TONE_LINE,
  UPAY_INTRO,
  type GrahaFactorId,
} from './grahaReadingContent';
import type { KundaliEmptyHouse, KundaliEmptyHouses, KundaliGrahaCard, KundaliGrahaMaitri, KundaliGrahaTone } from './kundaliReportModel';
import { NARRATIVE_GRAHAS, composeNarrative } from './grahaReadingNarrative';
import { BHAVA_ORDINAL_HI, bhavaLabelHi, ordinalEn } from './reportFormat';

/**
 * Graha-by-graha reading — RULEBOOK §14.7.
 *
 * Pure: a chart in, nine plain-language cards out, one per graha in
 * `GRAHA_ORDER`. Each card's label is COUNTED from four independent factor
 * groups — the sign, the house, the graha's lordship for this Lagna, and
 * combustion — each of which votes `supports`, `cautions` or nothing; the
 * label is never a score (the convention and its simplifications:
 * docs/roadmap/conventions/graha-reading-v1.md). Every line is a short bullet
 * composed from the typed tables in `grahaReadingContent.ts`; none is written
 * per chart.
 */

export type GrahaFactorGroup = 'sign' | 'house' | 'lordship' | 'combustion';

export type GrahaFactor = {
  id: GrahaFactorId;
  group: GrahaFactorGroup;
  vote: 'supports' | 'cautions';
  /** The ruled houses that cast a lordship vote. */
  houses?: readonly number[];
};

/** Digbala — the house where each planet gains directional strength. */
const DIG_BALA_HOUSE: Partial<Record<Graha, number>> = {
  jupiter: 1,
  mercury: 1,
  moon: 4,
  venus: 4,
  saturn: 7,
  sun: 10,
  mars: 10,
};

const DEMANDING_LORDSHIPS: readonly number[] = [3, 6, 8, 11];
/** Kendra houses other than the Lagna — a yogakaraka rules one of these and a trikona. */
const PILLAR_HOUSES: readonly number[] = KENDRA_HOUSES.filter((house) => house !== 1);
const BLESSING_HOUSES: readonly number[] = TRIKONA_HOUSES.filter((house) => house !== 1);

function isNode(graha: Graha): boolean {
  return graha === 'rahu' || graha === 'ketu';
}

/** The sign group: dignity speaks first, else the graha's relation to the sign lord. */
export function signFactor(graha: Graha, rashiIndex: number, dignity: Dignity): GrahaFactor | null {
  if (dignity === 'exalted') return { id: 'sign-exalted', group: 'sign', vote: 'supports' };
  if (dignity === 'own') return { id: 'sign-own', group: 'sign', vote: 'supports' };
  if (dignity === 'debilitated') return { id: 'sign-debilitated', group: 'sign', vote: 'cautions' };
  const relation = signRelationOf(graha, rashiIndex);
  if (relation === 'friend') return { id: 'sign-friend', group: 'sign', vote: 'supports' };
  if (relation === 'enemy') return { id: 'sign-enemy', group: 'sign', vote: 'cautions' };
  return null;
}

/**
 * The house group. Natural benefics do well in kendras and trikonas; natural
 * malefics (the nodes included) in the houses of effort and growth; every
 * graha gives in the 11th; dig-bala counts in its own house. Benefics in a
 * dusthana and malefics in the 8th or 12th caution. The 2nd, and the 3rd for
 * a benefic, cast no vote.
 */
export function houseFactor(graha: Graha, house: number): GrahaFactor | null {
  if (DIG_BALA_HOUSE[graha] === house) return { id: 'house-digbala', group: 'house', vote: 'supports' };
  if (house === 11) return { id: 'house-gains', group: 'house', vote: 'supports' };
  if (NATURAL_BENEFICS.includes(graha)) {
    if (KENDRA_HOUSES.includes(house) || TRIKONA_HOUSES.includes(house)) {
      return { id: 'house-benefic-strong', group: 'house', vote: 'supports' };
    }
    if (DUSTHANA_HOUSES.includes(house)) return { id: 'house-benefic-dusthana', group: 'house', vote: 'cautions' };
    return null;
  }
  if (house === 3 || house === 6 || house === 10) return { id: 'house-malefic-growth', group: 'house', vote: 'supports' };
  if (house === 8 || house === 12) return { id: 'house-malefic-hidden', group: 'house', vote: 'cautions' };
  return null;
}

/**
 * The lordship group (BPHS's functional rules, simplified): the Lagna lord,
 * a yogakaraka (a kendra and a trikona together) and a trikona lord support;
 * a graha that rules only houses among 2/4/7/10/12 casts no vote; one that
 * rules any of 3/6/8/11 without a trikona cautions. The nodes rule nothing.
 */
export function lordshipFactor(ruled: readonly number[]): GrahaFactor | null {
  if (ruled.length === 0) return null;
  if (ruled.includes(1)) return { id: 'lord-lagna', group: 'lordship', vote: 'supports', houses: [1] };
  const pillar = ruled.filter((house) => PILLAR_HOUSES.includes(house));
  const blessing = ruled.filter((house) => BLESSING_HOUSES.includes(house));
  if (pillar.length > 0 && blessing.length > 0) {
    return { id: 'lord-yogakaraka', group: 'lordship', vote: 'supports', houses: [...ruled] };
  }
  if (blessing.length > 0) return { id: 'lord-trikona', group: 'lordship', vote: 'supports', houses: blessing };
  const demanding = ruled.filter((house) => DEMANDING_LORDSHIPS.includes(house));
  if (demanding.length > 0) return { id: 'lord-demanding', group: 'lordship', vote: 'cautions', houses: demanding };
  return null;
}

/** Degrees from the Sun when the graha is inside its combustion orb, else null. */
export function combustionSeparation(position: GrahaPosition, sun: GrahaPosition): number | null {
  const orb = COMBUSTION_ORB_DEG[position.graha];
  if (orb === undefined) return null;
  const separation = elongationDeg(position.siderealLongitude, sun.siderealLongitude);
  return separation < orb ? separation : null;
}

/** All votes one way → that way; any disagreement, or no vote at all → mixed (§14.6's rule). */
export function resolveGrahaTone(factors: readonly GrahaFactor[]): KundaliGrahaTone {
  const supports = factors.filter((factor) => factor.vote === 'supports').length;
  const cautions = factors.filter((factor) => factor.vote === 'cautions').length;
  if (supports > 0 && cautions === 0) return 'supportive';
  if (cautions > 0 && supports === 0) return 'care';
  return 'mixed';
}

function houseEn(house: number): string {
  return `${ordinalEn(house)} house`;
}

/** A graha named inside an English sentence: `the Sun`, `the Moon`, `Jupiter`. */
export function grahaInSentenceEn(graha: Graha): string {
  return graha === 'sun' || graha === 'moon' ? `the ${GRAHA_NAMES_EN[graha]}` : GRAHA_NAMES_EN[graha];
}

function namesList(grahas: readonly Graha[], hi: boolean): string {
  if (grahas.length === 0) return hi ? MAITRI_LABELS.none.hi : MAITRI_LABELS.none.en;
  return grahas.map((graha) => (hi ? GRAHA_NAMES_HI[graha] : GRAHA_NAMES_EN[graha])).join(', ');
}

/** Whom a planet counts as friend, enemy and neutral, as name lists; null for the nodes. */
export function maitriNames(graha: Graha): KundaliGrahaMaitri | null {
  const row = maitriRow(graha);
  if (!row) return null;
  return {
    friendsHi: namesList(row.friends, true),
    friendsEn: namesList(row.friends, false),
    enemiesHi: namesList(row.enemies, true),
    enemiesEn: namesList(row.enemies, false),
    neutralHi: namesList(row.neutral, true),
    neutralEn: namesList(row.neutral, false),
  };
}

/** `इस भाव का कारक (संरक्षक): गुरु` / `This house’s karaka (guardian): Jupiter`. */
export function karakaLine(house: number, hi: boolean): string {
  return `${hi ? KARAKA_LABEL.hi : KARAKA_LABEL.en}: ${namesList(BHAVA_PLAIN[house - 1].karakas, hi)}`;
}

/** The houses inside a reason bullet: `षष्ठ और एकादश भाव` / `6th and 11th houses`. */
export function ruledLabel(houses: readonly number[], hi: boolean): string {
  if (hi) return `${houses.map((house) => BHAVA_ORDINAL_HI[house - 1]).join(' और ')} भाव`;
  const ordinals = houses.map((house) => ordinalEn(house));
  return houses.length === 1 ? `${ordinals[0]} house` : `${ordinals.join(' and ')} houses`;
}

/** One bullet per ruled house: `षष्ठ भाव — काम और प्रतियोगिता` / `6th house — work and competition`. */
function rulesList(houses: readonly number[], hi: boolean): readonly string[] {
  return houses.map((house) =>
    hi ? `${bhavaLabelHi(house)} — ${BHAVA_PLAIN[house - 1].shortHi}` : `${houseEn(house)} — ${BHAVA_PLAIN[house - 1].shortEn}`
  );
}

function grahaCard(chart: KundaliChart, position: GrahaPosition, sun: GrahaPosition): KundaliGrahaCard {
  const { graha, house, rashiIndex } = position;
  const node = isNode(graha);
  const plain = GRAHA_PLAIN[graha];
  const dignity = dignityOfPosition(position);
  const relation = signRelationOf(graha, rashiIndex);
  const ruled = housesRuledBy(graha, chart.lagnaRashiIndex);
  const separation = combustionSeparation(position, sun);

  const factors: GrahaFactor[] = [];
  const sign = signFactor(graha, rashiIndex, dignity);
  if (sign) factors.push(sign);
  const placement = houseFactor(graha, house);
  if (placement) factors.push(placement);
  const lordship = lordshipFactor(ruled);
  if (lordship) factors.push(lordship);
  if (separation !== null) factors.push({ id: 'combust', group: 'combustion', vote: 'cautions' });
  const tone = resolveGrahaTone(factors);

  const lord = signLordOf(rashiIndex);
  const signContext = {
    grahaHi: GRAHA_NAMES_HI[graha],
    grahaEn: grahaInSentenceEn(graha),
    rashiHi: RASHI_NAMES_HI[rashiIndex],
    rashiEn: `${RASHI_NAMES_EN[rashiIndex]} (${RASHI_NAMES_WESTERN[rashiIndex]})`,
    lordHi: GRAHA_NAMES_HI[lord],
    lordEn: grahaInSentenceEn(lord),
  };
  const reasons = factors.map((factor) => {
    const text = FACTOR_REASON[factor.id]({
      ...signContext,
      houseHi: bhavaLabelHi(house),
      houseEn: houseEn(house),
      ruledHi: factor.houses ? ruledLabel(factor.houses, true) : '',
      ruledEn: factor.houses ? ruledLabel(factor.houses, false) : '',
      ruledCount: factor.houses?.length ?? 0,
      degreesFromSun: Math.round(separation ?? 0),
    });
    return { id: factor.id, vote: factor.vote, textHi: text.hi, textEn: text.en };
  });

  const strengthKey = node ? 'node' : dignity !== 'neutral' ? dignity : relation ?? 'neutral';
  const strength = SIGN_STRENGTH[strengthKey](signContext);
  // Combustion votes, so its reason bullet says it; retrograde motion does not.
  const notes = position.retrograde && !node ? [RETROGRADE_NOTE] : [];

  const reading = GRAHA_BHAVA_READINGS[graha][house - 1];
  const upay = GRAHA_UPAY[graha];
  const intro = tone === 'supportive' ? UPAY_INTRO.keep : UPAY_INTRO.steady;
  const toneLine = tone === 'mixed' && factors.length === 0 ? TONE_LINE.quiet : TONE_LINE[tone];

  // The आधार chain, built with the card (§14.3.1): the placement with every
  // fact that voted on it, then one lord node per house the graha rules.
  const basis: BasisNode[] = [
    {
      kind: 'graha',
      graha,
      house,
      dignity,
      ...(position.retrograde && !node ? { retrograde: true } : {}),
      ...(relation === 'friend' || relation === 'enemy' ? { signRelation: relation } : {}),
      ...(separation !== null ? { combust: true } : {}),
    },
    ...ruled.map((ofHouse): BasisNode => ({ kind: 'lord', graha, ofHouse, inHouse: house })),
  ];

  // The narrative-voice reading (nav-voice pilot): present only for piloted
  // grahas. The screen chooses narrative-vs-legacy by the review flag.
  const narrative = NARRATIVE_GRAHAS.has(graha)
    ? composeNarrative({
      graha,
      house,
      dignity,
      relation,
      ruledHouses: ruled,
      combust: separation !== null,
      retrograde: position.retrograde && !node,
    })
    : null;

  return {
    id: `graha-${graha}`,
    graha,
    house,
    rashiIndex,
    nameHi: plain.nameHi,
    nameEn: plain.nameEn,
    meaningHi: plain.meaningHi,
    meaningEn: plain.meaningEn,
    placeHi: `${bhavaLabelHi(house)} — ${BHAVA_PLAIN[house - 1].hi}`,
    placeEn: `${houseEn(house)} — ${BHAVA_PLAIN[house - 1].en}`,
    strengthHi: strength.hi,
    strengthEn: strength.en,
    notesHi: notes.map((note) => note.hi),
    notesEn: notes.map((note) => note.en),
    karakaHi: karakaLine(house, true),
    karakaEn: karakaLine(house, false),
    maitri: maitriNames(graha),
    tone,
    toneLabelHi: TONE_LABEL[tone].hi,
    toneLabelEn: TONE_LABEL[tone].en,
    toneLineHi: toneLine.hi,
    toneLineEn: toneLine.en,
    givesHi: reading.givesHi,
    givesEn: reading.givesEn,
    careHi: reading.careHi,
    careEn: reading.careEn,
    rulesHi: rulesList(ruled, true),
    rulesEn: rulesList(ruled, false),
    reasons,
    upay: {
      introHi: intro.hi,
      introEn: intro.en,
      vaarHi: upay.vaarHi,
      vaarEn: upay.vaarEn,
      daanHi: upay.daanHi,
      daanEn: upay.daanEn,
      sevaHi: upay.sevaHi,
      sevaEn: upay.sevaEn,
      mantraHi: upay.mantraHi,
      mantraEn: upay.mantraEn,
      mantraCountHi: MANTRA_COUNT.hi,
      mantraCountEn: MANTRA_COUNT.en,
      practiceSourceId: upay.practiceSourceId,
    },
    basis,
    ...(narrative ? { narrative } : {}),
  };
}

/** Nine cards, one per graha in `GRAHA_ORDER`. */
export function buildGrahaReadings(chart: KundaliChart): readonly KundaliGrahaCard[] {
  const sun = chart.grahas.find((position) => position.graha === 'sun');
  if (!sun) throw new Error('Sun position is required');
  return GRAHA_ORDER.map((graha) => {
    const position = chart.grahas.find((entry) => entry.graha === graha);
    if (!position) throw new Error(`${graha} position is required`);
    const card = grahaCard(chart, position, sun);
    if (card.basis.length === 0) throw new Error(`${graha} card has an empty basis`);
    return card;
  });
}

/**
 * The houses no graha occupies (review note, 4 Oct 2026). Nine grahas share
 * twelve houses, so at least three are always empty; each is read through its
 * lord — where the lord sits. Information only: it carries no label and casts
 * no vote. Houses in order, 1 to 12.
 */
export function buildEmptyHouses(chart: KundaliChart): KundaliEmptyHouses {
  const occupied = new Set(chart.grahas.map((position) => position.house));
  const houses = chart.houses.flatMap((rashiIndex, index): KundaliEmptyHouse[] => {
    const house = index + 1;
    if (occupied.has(house)) return [];
    const lord = signLordOf(rashiIndex);
    const seat = chart.grahas.find((position) => position.graha === lord);
    if (!seat) throw new Error(`${lord} position is required`);
    const line = EMPTY_HOUSE_LINE({
      houseHi: bhavaLabelHi(house),
      houseEn: houseEn(house),
      shortHi: BHAVA_PLAIN[house - 1].shortHi,
      shortEn: BHAVA_PLAIN[house - 1].shortEn,
      lordHi: GRAHA_NAMES_HI[lord],
      lordEn: grahaInSentenceEn(lord),
      seatHi: bhavaLabelHi(seat.house),
      seatEn: houseEn(seat.house),
      seatShortHi: BHAVA_PLAIN[seat.house - 1].shortHi,
      seatShortEn: BHAVA_PLAIN[seat.house - 1].shortEn,
    });
    return [
      {
        house,
        rashiIndex,
        lord,
        lordHouse: seat.house,
        lineHi: line.hi,
        lineEn: line.en,
        basis: [
          { kind: 'bhava', house, rashiIndex },
          { kind: 'lord', graha: lord, ofHouse: house, inHouse: seat.house },
        ],
      },
    ];
  });
  return {
    titleHi: EMPTY_HOUSES_COPY.title.hi,
    titleEn: EMPTY_HOUSES_COPY.title.en,
    introHi: EMPTY_HOUSES_COPY.intro.map((bullet) => bullet.hi),
    introEn: EMPTY_HOUSES_COPY.intro.map((bullet) => bullet.en),
    houses,
  };
}

import { DAAN_CAUSES } from '../data/daan/causes';
import { getDaanVaarEntry } from '../data/daan/vaar';
import { buildDashaPractice, type DashaUpay } from './dashaPractice';
import { DASHA_GUIDE_COPY, DASHA_LORD_LESSONS } from './dashaGuideContent';
import { DASHA_LORD_KEYWORDS_EN, DASHA_LORD_KEYWORDS_HI, DASHA_LORD_THEME_EN, DASHA_LORD_THEME_HI } from './dashaReading';
import { buildGrahaReadings, grahaInSentenceEn } from './grahaReading';
import { BHAVA_PLAIN, GRAHA_PLAIN, GRAHA_UPAY, narrativeReadingsApproved } from './grahaReadingContent';
import { narrativeCell } from './grahaReadingNarrative';
import { GRAHA_REFERENCE } from './grahaReference';
import {
  DASHA_YEARS,
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  RASHI_NAMES_HI,
  getCurrentDasha,
  type DashaLord,
  type DashaPeriod,
  type KundaliChart,
} from './kundali';
import { ageBandAt, type BasisNode, type Dignity, type Maitri } from './kundaliBasis';
import type { PurposeId } from './prashnaPurposes';
import { BHAVA_ORDINAL_HI, ageYears, formatIstDateEn, ordinalEn } from './reportFormat';

/**
 * Mahadasha guide — one period explained in five steps (design.md §51e).
 *
 * Pure composition over reviewed tables: the period from `chart.vimshottari`,
 * the lord's meaning (`GRAHA_PLAIN`, `GRAHA_REFERENCE`, `DASHA_LORD_THEME`),
 * its placement in THIS chart (the graha card and its narrative cell), and the
 * practice (`buildDashaPractice` → `GRAHA_UPAY`, §14.3.5). The only new words
 * are the explanatory lines in `dashaGuideContent.ts`.
 *
 * Offered only for an adult subject and only for the running or an upcoming
 * Mahadasha: a period that has ended asks for nothing now (owner review,
 * 13 Nov 2026), and a minor's surfaces never instruct (§14.3.5).
 */

export type GuideText = { hi: string; en: string };

export type DashaGuideTurn = {
  lord: DashaLord;
  years: number;
  isThis: boolean;
  isNow: boolean;
};

export type DashaGuideAntar = {
  lord: DashaLord;
  datesEn: string;
  isNow: boolean;
};

export type DashaGuideQuestion = { q: GuideText; a: GuideText };

export type DashaGuide = {
  lord: DashaLord;
  status: 'current' | 'upcoming';
  title: GuideText;
  /** `16 Jan 2028 — 16 Jan 2047` — the same day the Dasha tab prints. */
  datesEn: string;
  years: number;
  /** Running period only. */
  progress: { percent: number; elapsedEn: string; leftEn: string } | null;
  /** Upcoming period only: how long until it begins, and after which lord. */
  begins: GuideText | null;
  turn: GuideText;
  facts: readonly { label: GuideText; value: GuideText; sub: GuideText }[];
  cycle: readonly DashaGuideTurn[];
  /** The nine Antardashas, listed only for the running period. */
  antars: readonly DashaGuideAntar[];

  meaning: GuideText;
  nature: GuideText;
  signifies: { hi: readonly string[]; en: readonly string[] };
  theme: GuideText;
  lessonsTitle: GuideText;
  lessons: readonly { word: GuideText; plain: GuideText }[];

  house: number;
  houseHelp: GuideText;
  houseTile: { value: GuideText; sub: GuideText };
  signTile: { value: GuideText; sub: GuideText };
  reading: { hi: readonly string[]; en: readonly string[] };
  tend: GuideText;
  rules: { hi: readonly string[]; en: readonly string[] };

  weekday: number;
  upay: DashaUpay;
  dayHelp: GuideText;
  daanItems: { hi: readonly string[]; en: readonly string[] };
  /** The vaar table's trailing note (`— the vaar of vidya-daan`), when it has one. */
  daanNote: GuideText | null;
  daanCauses: readonly { id: string; name: GuideText }[];
  sevaItems: { hi: readonly string[]; en: readonly string[] };
  malaHelp: GuideText;

  why: readonly DashaGuideQuestion[];
  chartQuestion: DashaGuideQuestion & {
    quote: GuideText;
    caveat: GuideText;
    /** Prashna purpose whose primary bhava is this house, when the subject may open it. */
    prashnaPurpose: PurposeId | null;
  };
  note: GuideText;
  basis: readonly BasisNode[];
};

const MONTH_MS = (365.2425 / 12) * 86_400_000;

/**
 * `14 y 9 m` / `1 y 3 m` / `20 d` — the Dasha tab's own span format, shared so
 * the tab and the guide can never print different remainders for one period.
 */
export function formatDashaSpan(milliseconds: number, roundUp = false): string {
  const round = roundUp ? Math.ceil : Math.floor;
  const totalMonths = Math.max(0, round(milliseconds / MONTH_MS));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years && months) return `${years} y ${months} m`;
  if (years) return `${years} y`;
  // Antardashas are as short as ~3.6 months, so their edges need day
  // granularity — "0 m elapsed" would read as a stopped clock.
  if (!months) return `${Math.max(0, round(milliseconds / 86_400_000))} d`;
  return `${months} m`;
}

/** Whether the guide (and its doors on the Dasha tab) is offered for this period. */
export function dashaGuideOffered(chart: KundaliChart, period: Pick<DashaPeriod, 'end'>, at: Date): boolean {
  return ageBandAt(chart, at) === 'adult' && period.end.getTime() > at.getTime();
}

/**
 * The bhava → Prashna purpose door: only where a purpose's PRIMARY bhava is
 * this house, and never into the safety-limited topics (swasthya, man,
 * santan) — a period guide is not the place to open those (§14.3.5).
 */
const HOUSE_PURPOSE: Readonly<Partial<Record<number, PurposeId>>> = {
  2: 'dhan',
  5: 'vidya',
  7: 'vivah',
  9: 'yatra',
  10: 'naukri',
};
/** Mirrors `PRASHNA_PURPOSES[].minAge` for the mapped purposes (pinned by test). */
export const GUIDE_PURPOSE_MIN_AGE: Readonly<Partial<Record<PurposeId, number>>> = {
  dhan: 18,
  vidya: 0,
  vivah: 21,
  yatra: 0,
  naukri: 18,
};

function istDate(date: Date): string {
  return formatIstDateEn(date);
}

function sentences(text: string, hi: boolean): string[] {
  const parts = hi ? text.split(/(?<=।)\s+/) : text.split(/(?<=[.!?])\s+/);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function upperFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stripStop(text: string): string {
  return text.replace(/[।.]\s*$/, '').trim();
}

/** `तिल, तेल, काला वस्त्र, लोहा` → four chips; `X — note` keeps the note apart. */
function daanParts(text: string, hi: boolean): { items: string[]; note: string | null } {
  const [head, ...tail] = text.split(' — ');
  const joiner = hi ? /,\s*|\s+और\s+/ : /,\s*|\s+and\s+/;
  const items = head.split(joiner).map((item) => item.trim()).filter(Boolean);
  return { items, note: tail.length > 0 ? tail.join(' — ').trim() : null };
}

/** A seva line split at `;` and at `, and` / `, और` into one action per bullet. */
function sevaParts(text: string, hi: boolean): string[] {
  const joiner = hi ? /;\s*|,\s+और\s+/ : /;\s*|,\s+and\s+/;
  return text
    .split(joiner)
    .map((part) => stripStop(part))
    .filter(Boolean)
    .map((part) => (hi ? part : upperFirst(part)));
}

export function buildDashaGuide(chart: KundaliChart, lord: DashaLord, at: Date): DashaGuide | null {
  const index = chart.vimshottari.findIndex((period) => period.lord === lord);
  if (index < 0) return null;
  const period = chart.vimshottari[index];
  if (!dashaGuideOffered(chart, period, at)) return null;
  const practice = buildDashaPractice(chart, period, at);
  const card = buildGrahaReadings(chart).find((entry) => entry.graha === lord);
  if (!practice || !card) return null;

  const current = getCurrentDasha(chart, at);
  const isCurrent = current?.maha === period;
  const nowIndex = current ? chart.vimshottari.indexOf(current.maha) : -1;
  const lordHi = GRAHA_NAMES_HI[lord];
  const lordEn = GRAHA_NAMES_EN[lord];
  const lordSentenceEn = grahaInSentenceEn(lord);
  const years = DASHA_YEARS[lord];
  const birth = chart.input.date;
  const startAge = period.start.getTime() <= birth.getTime() ? 0 : ageYears(birth, period.start);
  const endAge = ageYears(birth, period.end);
  const fromBirth = period.start.getTime() <= birth.getTime();
  const datesEn = `${istDate(period.start)} — ${istDate(period.end)}`;

  const elapsed = at.getTime() - period.start.getTime();
  const remaining = period.end.getTime() - at.getTime();
  const progress = isCurrent
    ? {
      percent: Math.max(0, Math.min(100, (elapsed / (period.end.getTime() - period.start.getTime())) * 100)),
      elapsedEn: formatDashaSpan(elapsed),
      leftEn: formatDashaSpan(remaining, true),
    }
    : null;
  const nowLord = current?.maha.lord ?? null;
  const begins: GuideText | null = !isCurrent
    ? {
      hi: `${formatDashaSpan(period.start.getTime() - at.getTime(), true)} में आरम्भ${index === nowIndex + 1 && nowLord ? ` — ${GRAHA_NAMES_HI[nowLord]} महादशा के बाद` : ''}`,
      en: `Begins in ${formatDashaSpan(period.start.getTime() - at.getTime(), true)}${index === nowIndex + 1 && nowLord ? ` — after the ${GRAHA_NAMES_EN[nowLord]} Mahadasha` : ''}`,
    }
    : null;

  const spanHi = fromBirth ? `जन्म से ${endAge} वर्ष की आयु तक` : `${startAge} से ${endAge} वर्ष की आयु तक`;
  const spanEn = fromBirth ? `from birth to age ${endAge}` : `from age ${startAge} to age ${endAge}`;
  const turn: GuideText = isCurrent
    ? {
      hi: `${lordHi} की बारी ${years} वर्ष की है। आपके लिए यह ${spanHi} है — अभी यही चल रही है, और ${progress!.leftEn} शेष हैं।`,
      en: `${upperFirst(lordSentenceEn)}’s turn lasts ${years} years. For you it runs ${spanEn} — it is running now, with ${progress!.leftEn} left.`,
    }
    : {
      hi: `${lordHi} की बारी ${years} वर्ष की है। आपके लिए यह ${spanHi} चलेगी।${nowLord ? ` अभी ${GRAHA_NAMES_HI[nowLord]} की बारी चल रही है।` : ''}`,
      en: `${upperFirst(lordSentenceEn)}’s turn lasts ${years} years. For you it runs ${spanEn}.${nowLord ? ` ${upperFirst(grahaInSentenceEn(nowLord))}’s turn is running now.` : ''}`,
    };

  const facts = [
    {
      label: { hi: 'आरम्भ', en: isCurrent ? 'Started' : 'Starts' },
      value: { hi: istDate(period.start), en: istDate(period.start) },
      sub: fromBirth ? { hi: 'जन्म से पहले', en: 'before birth' } : { hi: `आयु ${startAge}`, en: `age ${startAge}` },
    },
    {
      label: { hi: 'समाप्ति', en: 'Ends' },
      value: { hi: istDate(period.end), en: istDate(period.end) },
      sub: { hi: `आयु ${endAge}`, en: `age ${endAge}` },
    },
    {
      label: { hi: 'अवधि', en: 'Lasts' },
      value: { hi: `${years} वर्ष`, en: `${years} years` },
      sub: { hi: '120 में से', en: 'of 120' },
    },
  ];

  const cycle = chart.vimshottari.map((entry, turnIndex) => ({
    lord: entry.lord,
    years: DASHA_YEARS[entry.lord],
    isThis: turnIndex === index,
    isNow: turnIndex === nowIndex,
  }));
  const antars = isCurrent
    ? period.antardashas.map((antar) => ({
      lord: antar.lord,
      datesEn: `${istDate(antar.start)} — ${istDate(antar.end)}`,
      isNow: antar === current?.antar,
    }))
    : [];

  const plain = GRAHA_PLAIN[lord];
  const reference = GRAHA_REFERENCE[lord];
  const keywordsHi = DASHA_LORD_KEYWORDS_HI[lord].split(', ');
  const keywordsEn = DASHA_LORD_KEYWORDS_EN[lord].split(', ');
  const lessons = DASHA_LORD_LESSONS[lord].map((plainLine, lessonIndex) => ({
    word: { hi: keywordsHi[lessonIndex] ?? '', en: upperFirst(keywordsEn[lessonIndex] ?? '') },
    plain: plainLine,
  }));

  // The card's own graha node carries the dignity and sign relation it voted on.
  const grahaNode = card.basis.find((node) => node.kind === 'graha') as
    | { kind: 'graha'; house: number; dignity: Dignity; signRelation?: Maitri }
    | undefined;
  const house = card.house;
  const bhava = BHAVA_PLAIN[house - 1];
  const showNarrative = narrativeReadingsApproved() && card.narrative !== undefined;
  const cell = showNarrative && grahaNode
    ? narrativeCell(lord, house, grahaNode.dignity, grahaNode.signRelation ?? null)
    : null;
  const reading = showNarrative && card.narrative
    ? { hi: sentences(card.narrative.leadHi, true), en: sentences(card.narrative.leadEn, false) }
    : { hi: card.givesHi, en: card.givesEn };
  const tend = showNarrative && card.narrative
    ? { hi: card.narrative.tendHi, en: card.narrative.tendEn }
    : { hi: card.careHi[0] ?? '', en: card.careEn[0] ?? '' };
  // The cell is "where it sits. what that means here." — quoted whole: a weak
  // placement's second sentence ("But with each turn…") needs its first.
  const quote = cell
    ? { hi: cell.leadHi, en: cell.leadEn }
    : { hi: card.givesHi[0] ?? '', en: card.givesEn[0] ?? '' };
  const strengthSub = (text: string) => {
    const [, ...rest] = text.split(' — ');
    return rest.length > 0 ? rest.join(' — ') : text;
  };
  const rashiIndex = chart.grahas.find((position) => position.graha === lord)?.rashiIndex ?? 0;
  const signEn = card.strengthEn.match(/^In ([^—]+?) —/)?.[1]?.trim() ?? card.strengthEn;

  const row = GRAHA_UPAY[lord];
  const daanHi = daanParts(row.daanHi, true);
  const daanEn = daanParts(row.daanEn, false);
  const vaar = getDaanVaarEntry(row.weekday);
  const daanCauses = (vaar.causes ?? [])
    .map((id) => DAAN_CAUSES.find((cause) => cause.id === id))
    .filter((cause): cause is (typeof DAAN_CAUSES)[number] => cause !== undefined)
    .map((cause) => ({ id: cause.id, name: { hi: cause.nameHi, en: cause.nameEn } }));
  const dayHi = row.vaarHi;
  const dayEn = row.vaarEn;
  const node = lord === 'rahu' || lord === 'ketu';
  const nodeDayHi = lord === 'rahu' ? 'शनि का वार, शनिवार (शनिवत् राहु)' : 'मंगल का वार, मंगलवार (कुजवत् केतु)';
  const nodeDayEn = lord === 'rahu' ? 'Saturn’s day, Saturday (shanivat Rahu)' : 'Mars’s day, Tuesday (kujavat Ketu)';

  const why: DashaGuideQuestion[] = [
    {
      q: { hi: `${lordHi} का ही उपाय क्यों?`, en: `Why ${lordSentenceEn}’s practice?` },
      a: {
        hi: `इन ${years} वर्षों का स्वामी ${lordHi} है, इसलिए परम्परा में इस काल में ${lordHi} का ही उपाय रखा जाता है — किसी और ग्रह का नहीं।`,
        en: `${upperFirst(lordSentenceEn)} rules these ${years} years, so tradition keeps ${lordSentenceEn}’s own practice through them — not another graha’s.`,
      },
    },
    {
      q: { hi: `${dayHi} ही क्यों?`, en: `Why ${dayEn}?` },
      a: node
        ? {
          hi: `${lordHi} का अपना कोई वार नहीं; परम्परा इसे ${nodeDayHi} देती है। दान भी उसी वार-परम्परा से आता है।`,
          en: `${lordEn} has no weekday of its own; tradition gives it ${nodeDayEn}. The daan comes from the same weekday tradition.`,
        }
        : {
          hi: `${dayHi} ${lordHi} का वार है; वार और दान वार-परम्परा से आते हैं।`,
          en: `${dayEn} is ${lordSentenceEn}’s day; the day and the daan come from the weekday (vaar) tradition.`,
        },
    },
    {
      q: { hi: 'यही सेवा क्यों?', en: 'Why this seva?' },
      a: {
        hi: `सेवा वही है जो ${lordHi} का स्वभाव है — ${DASHA_LORD_KEYWORDS_HI[lord]}।`,
        en: `The seva follows what ${lordSentenceEn} stands for — ${DASHA_LORD_KEYWORDS_EN[lord]}.`,
      },
    },
    {
      q: { hi: 'एक माला ही क्यों?', en: 'Why one mala?' },
      a: {
        hi: `मंत्र ${lordHi} का बीज मंत्र है: हर ${dayHi} एक माला — एक स्थिर अभ्यास, पूरी करने की गिनती नहीं।`,
        en: `The mantra is ${lordSentenceEn}’s seed (beej) mantra: one mala each ${dayEn} — a steady habit, not a number to finish.`,
      },
    },
  ];

  const purpose = HOUSE_PURPOSE[house] ?? null;
  const subjectAge = ageYears(birth, at);
  const prashnaPurpose = purpose !== null && subjectAge >= (GUIDE_PURPOSE_MIN_AGE[purpose] ?? Infinity) ? purpose : null;
  const houseHi = `${BHAVA_ORDINAL_HI[house - 1]} भाव`;
  const houseEn = `${ordinalEn(house)} house`;

  return {
    lord,
    status: isCurrent ? 'current' : 'upcoming',
    title: { hi: `${lordHi} महादशा`, en: `${lordEn} Mahadasha` },
    datesEn,
    years,
    progress,
    begins,
    turn,
    facts,
    cycle,
    antars,

    meaning: { hi: `${plain.nameHi} — ${plain.meaningHi}`, en: `${plain.nameEn} — ${plain.meaningEn}` },
    nature: { hi: reference.natureHi, en: reference.natureEn },
    signifies: { hi: reference.signifiesHi.split(' · '), en: reference.signifiesEn.split(' · ') },
    theme: { hi: DASHA_LORD_THEME_HI[lord], en: DASHA_LORD_THEME_EN[lord] },
    lessonsTitle: { hi: `परम्परा में ${lordHi} की अवधि इन तीन बातों से जुड़ी है`, en: `Tradition ties a ${lordEn} period to three things` },
    lessons,

    house,
    houseHelp: {
      hi: `कुंडली में 12 भाव होते हैं, और हर भाव जीवन के एक हिस्से का होता है। आपकी कुंडली में ${lordHi} ${houseHi} में बैठा है।`,
      en: `A chart has 12 houses, and each house is one part of life. In your chart ${lordSentenceEn} sits in the ${houseEn}.`,
    },
    houseTile: { value: { hi: houseHi, en: houseEn }, sub: { hi: bhava.hi, en: bhava.en } },
    signTile: {
      value: { hi: RASHI_NAMES_HI[rashiIndex], en: signEn },
      sub: { hi: strengthSub(card.strengthHi), en: strengthSub(card.strengthEn) },
    },
    reading,
    tend,
    rules: { hi: card.rulesHi, en: card.rulesEn },

    weekday: row.weekday,
    upay: practice.upay,
    dayHelp: {
      hi: `${dayHi} ${node ? `इस अवधि में ${lordHi} के लिए रखा जाने वाला दिन` : `${lordHi} का अपना दिन`} है। नीचे की तीनों बातें ${dayHi} को रखें।`,
      en: `${dayEn} is ${node ? `the day kept for ${lordEn}` : `${lordSentenceEn}’s own day`}. Keep the three things below on ${dayEn}s.`,
    },
    daanItems: { hi: daanHi.items, en: daanEn.items },
    daanNote: daanHi.note && daanEn.note ? { hi: daanHi.note, en: daanEn.note } : null,
    daanCauses,
    sevaItems: { hi: sevaParts(row.sevaHi, true), en: sevaParts(row.sevaEn, false) },
    malaHelp: {
      hi: `माला में 108 मनके होते हैं। पूरा एक फेरा एक माला है — हर ${dayHi} एक बार।`,
      en: `A mala is a string of 108 beads. One full round is one mala — once every ${dayEn}.`,
    },

    why,
    chartQuestion: {
      q: { hi: `${bhava.shortHi} पर इसका क्या असर है?`, en: `What does this mean for ${bhava.shortEn}?` },
      a: {
        hi: `आपकी कुंडली में ${lordHi} ${houseHi} में है — यह ${bhava.hi} का भाव है — इसलिए परम्परा इस अवधि को जीवन के इसी हिस्से की दृष्टि से पढ़ती है।`,
        en: `In your chart ${lordSentenceEn} sits in the ${houseEn} — the house of ${bhava.en} — so tradition reads this period through that part of life.`,
      },
      quote,
      caveat: DASHA_GUIDE_COPY.chartCaveat,
      prashnaPurpose,
    },
    note: { hi: practice.noteHi, en: practice.noteEn },
    basis: [...practice.basis, ...card.basis],
  };
}

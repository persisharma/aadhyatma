import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  HOUSE_THEME_EN,
  HOUSE_THEME_HI,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  getCurrentDasha,
} from './kundali';
import type { DashaLord, KundaliChart } from './kundali';
import { maitriOf, type BasisNode, type Maitri } from './kundaliBasis';
import { bhavaLabelEn, bhavaLabelHi, formatIstDateEn, formatIstDateHi } from './reportFormat';

/**
 * Dasha reading — PRD-20 Phase 4.
 *
 * Pure composition of the current Vimshottari period into structural,
 * guidance-framed copy (RULEBOOK §14.3): what the running lords are
 * traditionally associated with and where they sit in THIS chart. Never a
 * prediction, verdict, or event claim. The per-lord theme tables are reused
 * verbatim by the compiled Kundali report (Phase 6).
 */

export type DashaReading = {
  mahaLord: DashaLord;
  antarLord: DashaLord | null;
  mahaStart: Date;
  mahaEnd: Date;
  antarStart: Date | null;
  antarEnd: Date | null;
  /** The Mahadasha lord's natal placement in this chart. */
  natalRashiIndex: number;
  natalHouse: number;
  titleHi: string;
  titleEn: string;
  themeHi: string;
  themeEn: string;
  placementHi: string;
  placementEn: string;
  antarHi: string | null;
  antarEn: string | null;
};

/** Classical significations per Vimshottari lord — structural, never verdicts. */
export const DASHA_LORD_THEME_HI: Readonly<Record<DashaLord, string>> = {
  ketu: 'परम्परा में केतु की अवधि को सरलता, विरक्ति और भीतर की ओर मुड़ने से जोड़ा जाता है — कम में संतोष और साधना पर सहज ध्यान।',
  venus: 'परम्परा में शुक्र की अवधि को संबंध, कला, सौन्दर्य और जीवन की सहजता से जोड़ा जाता है — रुचियों और रिश्तों को समय देने का काल।',
  sun: 'परम्परा में सूर्य की अवधि को आत्मबल, कर्तव्य और स्पष्टता से जोड़ा जाता है — अपनी भूमिका को सीधे और सादे ढंग से निभाने का काल।',
  moon: 'परम्परा में चन्द्र की अवधि को मन, पोषण और भावनात्मक लय से जोड़ा जाता है — अपनों और अपने मन की देखभाल पर ध्यान का काल।',
  mars: 'परम्परा में मंगल की अवधि को ऊर्जा, साहस और परिश्रम से जोड़ा जाता है — प्रयास को दिशा और संयम देने का काल।',
  rahu: 'परम्परा में राहु की अवधि को नवीनता, महत्वाकांक्षा और अपरिचित दिशाओं से जोड़ा जाता है — नए विषयों को धैर्य और विवेक से परखने का काल।',
  jupiter: 'परम्परा में गुरु की अवधि को विद्या, विस्तार और धर्म से जोड़ा जाता है — सीखने, सिखाने और श्रद्धा के विषयों का काल।',
  saturn: 'परम्परा में शनि की अवधि को अनुशासन, धैर्य और सेवा से जोड़ा जाता है — धीमे, नियमित और ईमानदार प्रयास का काल।',
  mercury: 'परम्परा में बुध की अवधि को बुद्धि, संवाद और विश्लेषण से जोड़ा जाता है — पढ़ने, लिखने और सोच-समझ कर बोलने का काल।',
};

export const DASHA_LORD_THEME_EN: Readonly<Record<DashaLord, string>> = {
  ketu: 'Tradition links a Ketu period with simplicity, detachment, and turning inward — contentment with less and easy attention to practice.',
  venus: 'Tradition links a Venus period with relationships, art, beauty, and ease — a time for giving interests and bonds their space.',
  sun: 'Tradition links a Sun period with vitality, duty, and clarity — carrying one’s role plainly and directly.',
  moon: 'Tradition links a Moon period with the mind, nurture, and emotional rhythm — attention to loved ones and one’s own inner weather.',
  mars: 'Tradition links a Mars period with energy, courage, and effort — giving exertion both direction and restraint.',
  rahu: 'Tradition links a Rahu period with novelty, ambition, and unfamiliar directions — weighing new pursuits with patience and discernment.',
  jupiter: 'Tradition links a Jupiter period with learning, expansion, and dharma — a time for study, teaching, and matters of faith.',
  saturn: 'Tradition links a Saturn period with discipline, patience, and service — slow, steady, honest effort.',
  mercury: 'Tradition links a Mercury period with intellect, communication, and analysis — reading, writing, and speaking with care.',
};

export function buildDashaReading(
  chart: KundaliChart,
  at: Date
): DashaReading | null {
  const current = getCurrentDasha(chart, at);
  if (!current) return null;
  const mahaLord = current.maha.lord;
  const antarLord = current.antar?.lord ?? null;
  const natal = chart.grahas.find((position) => position.graha === mahaLord);
  if (!natal) return null;

  const mahaHi = GRAHA_NAMES_HI[mahaLord];
  const mahaEn = GRAHA_NAMES_EN[mahaLord];
  const titleHi = antarLord
    ? `${mahaHi} महादशा · ${GRAHA_NAMES_HI[antarLord]} अन्तर्दशा`
    : `${mahaHi} महादशा`;
  const titleEn = antarLord
    ? `${mahaEn} Mahadasha · ${GRAHA_NAMES_EN[antarLord]} Antardasha`
    : `${mahaEn} Mahadasha`;

  const placementHi = `आपकी कुंडली में ${mahaHi} ${RASHI_NAMES_HI[natal.rashiIndex]} राशि में, ${natal.house} भाव (${HOUSE_THEME_HI[natal.house - 1]}) में स्थित है — परम्परा में इस अवधि के विषय इसी स्थान की दृष्टि से पढ़े जाते हैं।`;
  const placementEn = `In your chart ${mahaEn} sits in ${RASHI_NAMES_EN[natal.rashiIndex]}, in the ${natal.house}th bhava (${HOUSE_THEME_EN[natal.house - 1]}) — tradition reads this period’s themes through that placement.`;

  let antarHi: string | null = null;
  let antarEn: string | null = null;
  if (antarLord) {
    const antarNatal = chart.grahas.find((position) => position.graha === antarLord);
    const antarHouseHi = antarNatal
      ? ` (जन्म में ${antarNatal.house} भाव, ${HOUSE_THEME_HI[antarNatal.house - 1]})`
      : '';
    const antarHouseEn = antarNatal
      ? ` (natally in the ${antarNatal.house}th bhava, ${HOUSE_THEME_EN[antarNatal.house - 1]})`
      : '';
    antarHi = `इस समय ${GRAHA_NAMES_HI[antarLord]} की अन्तर्दशा है${antarHouseHi} — मुख्य अवधि का स्वर बना रहता है और यह उसमें अपना रंग जोड़ती है।`;
    antarEn = `The running Antardasha belongs to ${GRAHA_NAMES_EN[antarLord]}${antarHouseEn} — the main period keeps its tone while this adds its own shade.`;
  }

  return {
    mahaLord,
    antarLord,
    mahaStart: current.maha.start,
    mahaEnd: current.maha.end,
    antarStart: current.antar?.start ?? null,
    antarEnd: current.antar?.end ?? null,
    natalRashiIndex: natal.rashiIndex,
    natalHouse: natal.house,
    titleHi,
    titleEn,
    themeHi: DASHA_LORD_THEME_HI[mahaLord],
    themeEn: DASHA_LORD_THEME_EN[mahaLord],
    placementHi,
    placementEn,
    antarHi,
    antarEn,
  };
}

/* ------------------------------------------------------------------ */
/*  Maha × Antar pair reading — PRD-43 Wave B                          */
/* ------------------------------------------------------------------ */

/** Three-word shade per lord, for the sub-period clause. */
export const DASHA_LORD_KEYWORDS_HI: Readonly<Record<DashaLord, string>> = {
  ketu: 'सरलता, विरक्ति, भीतर की ओर मुड़ना',
  venus: 'संबंध, कला, सहजता',
  sun: 'आत्मबल, कर्तव्य, स्पष्टता',
  moon: 'मन, पोषण, भावनात्मक लय',
  mars: 'ऊर्जा, साहस, परिश्रम',
  rahu: 'नवीनता, महत्वाकांक्षा, अपरिचित दिशाएँ',
  jupiter: 'विद्या, विस्तार, धर्म',
  saturn: 'अनुशासन, धैर्य, सेवा',
  mercury: 'बुद्धि, संवाद, विश्लेषण',
};

export const DASHA_LORD_KEYWORDS_EN: Readonly<Record<DashaLord, string>> = {
  ketu: 'simplicity, detachment, turning inward',
  venus: 'relationship, art, ease',
  sun: 'vitality, duty, clarity',
  moon: 'mind, nurture, emotional rhythm',
  mars: 'energy, courage, effort',
  rahu: 'novelty, ambition, unfamiliar directions',
  jupiter: 'learning, expansion, dharma',
  saturn: 'discipline, patience, service',
  mercury: 'intellect, communication, analysis',
};

const PAIR_RELATION_HI: Readonly<Record<Maitri, string>> = {
  friend: 'परम्परा में ये दोनों ग्रह परस्पर मित्र हैं — अन्तर्दशा महादशा के स्वर को सहारा देती है, और दोनों के विषय एक ही दिशा में चलते हैं।',
  neutral: 'परम्परा में ये दोनों ग्रह परस्पर सम हैं — अन्तर्दशा अपना अलग रंग जोड़ती है, महादशा के स्वर से टकराती नहीं।',
  enemy: 'परम्परा में ये दोनों ग्रह परस्पर विरोधी लय के हैं — अन्तर्दशा महादशा के स्वर को खींचती है; इसे परम्परा बदलती रुचियों और धैर्य के काल की तरह पढ़ती है, न कि किसी निश्चित दिशा के।',
};

const PAIR_RELATION_EN: Readonly<Record<Maitri, string>> = {
  friend: 'Tradition counts these two lords as friends — the sub-period supports the main period’s tone, and their themes pull the same way.',
  neutral: 'Tradition counts these two lords as neutral to each other — the sub-period adds its own shade without cutting across the main period’s tone.',
  enemy: 'Tradition counts these two lords as pulling in different directions — the sub-period tugs at the main period’s tone; tradition reads this as a stretch of shifting interests asking for patience, not as a fixed direction.',
};

export type DashaPairReading = {
  mahaLord: DashaLord;
  antarLord: DashaLord;
  relation: Maitri;
  antarNatalHouse: number;
  titleHi: string;
  titleEn: string;
  /** Three composed paragraphs, index-aligned across languages. */
  bodyHi: readonly string[];
  bodyEn: readonly string[];
  basis: readonly BasisNode[];
};

/**
 * The running Mahadasha × Antardasha as one reading: both themes, how the two
 * lords regard each other (naisargika maitri), and where the Antardasha lord
 * sits natally — the part that makes it about THIS chart. Null outside the
 * 120-year table or at a float boundary where no Antardasha contains `at`.
 */
export function buildDashaPairReading(chart: KundaliChart, at: Date): DashaPairReading | null {
  const current = getCurrentDasha(chart, at);
  if (!current || !current.antar) return null;
  const mahaLord = current.maha.lord;
  const antarLord = current.antar.lord;
  const antarNatal = chart.grahas.find((position) => position.graha === antarLord);
  if (!antarNatal) return null;
  const relation = maitriOf(mahaLord, antarLord);
  const mahaHi = GRAHA_NAMES_HI[mahaLord];
  const mahaEn = GRAHA_NAMES_EN[mahaLord];
  const antarHi = GRAHA_NAMES_HI[antarLord];
  const antarEn = GRAHA_NAMES_EN[antarLord];
  const seatHi = `${bhavaLabelHi(antarNatal.house)} (${HOUSE_THEME_HI[antarNatal.house - 1]})`;
  const seatEn = `${bhavaLabelEn(antarNatal.house)} (${HOUSE_THEME_EN[antarNatal.house - 1]})`;

  const bodyHi = [
    `${mahaHi} महादशा ${formatIstDateHi(current.maha.start)} से ${formatIstDateHi(current.maha.end)} तक — ${DASHA_LORD_KEYWORDS_HI[mahaLord]} का काल। इसके भीतर ${antarHi} की अन्तर्दशा ${formatIstDateHi(current.antar.start)} से ${formatIstDateHi(current.antar.end)} तक चल रही है — ${DASHA_LORD_KEYWORDS_HI[antarLord]} का उप-काल।`,
    PAIR_RELATION_HI[relation],
    mahaLord === antarLord
      ? `${antarHi} की अपनी ही अन्तर्दशा — परम्परा में महादशा का स्वर सबसे सघन इसी उप-काल में होता है।`
      : `आपकी कुंडली में ${antarHi} ${seatHi} में है — परम्परा इस उप-काल के विषयों को उसी भाव की दृष्टि से पढ़ती है: ${HOUSE_THEME_HI[antarNatal.house - 1]} पर इस समय ${antarHi} का रंग है।`,
  ];
  const bodyEn = [
    `The ${mahaEn} Mahadasha runs ${formatIstDateEn(current.maha.start)} → ${formatIstDateEn(current.maha.end)} — a period of ${DASHA_LORD_KEYWORDS_EN[mahaLord]}. Inside it, the ${antarEn} Antardasha runs ${formatIstDateEn(current.antar.start)} → ${formatIstDateEn(current.antar.end)} — a sub-period of ${DASHA_LORD_KEYWORDS_EN[antarLord]}.`,
    PAIR_RELATION_EN[relation],
    mahaLord === antarLord
      ? `${antarEn}’s own Antardasha — tradition treats this sub-period as where the Mahadasha’s tone runs most concentrated.`
      : `In this chart ${antarEn} sits in the ${seatEn} — tradition reads this sub-period’s themes through that house: matters of ${HOUSE_THEME_EN[antarNatal.house - 1]} carry ${antarEn}’s colour just now.`,
  ];

  return {
    mahaLord,
    antarLord,
    relation,
    antarNatalHouse: antarNatal.house,
    titleHi: `${mahaHi} महादशा · ${antarHi} अन्तर्दशा`,
    titleEn: `${mahaEn} Mahadasha · ${antarEn} Antardasha`,
    bodyHi,
    bodyEn,
    basis: [
      { kind: 'dasha', level: 'maha', lord: mahaLord, startKey: current.maha.start.toISOString().slice(0, 10), endKey: current.maha.end.toISOString().slice(0, 10) },
      { kind: 'dasha', level: 'antar', lord: antarLord, startKey: current.antar.start.toISOString().slice(0, 10), endKey: current.antar.end.toISOString().slice(0, 10) },
      { kind: 'relation', from: mahaLord, to: antarLord, relation },
      { kind: 'graha', graha: antarLord, house: antarNatal.house, dignity: 'neutral' },
    ],
  };
}

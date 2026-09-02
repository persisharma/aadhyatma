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

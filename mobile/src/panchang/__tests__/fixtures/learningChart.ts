/** Hand-built rendering facts, not a person's astronomical birth record. */
import { computeVimshottariDasha, computeWholeSignHouses, houseForRashi, GRAHA_ORDER, type Graha, type KundaliChart } from '../../kundali';

const SIGNS: Record<Graha, number> = { sun: 7, moon: 11, mars: 3, mercury: 7, jupiter: 1, venus: 9, saturn: 10, rahu: 11, ketu: 5 };

/** Epoch/age offsets and the null coordinate origin contain no user input. */
export function syntheticLearningChart(adult: boolean, at = new Date()): KundaliChart {
  const birth = adult ? new Date(0) : new Date(at.getTime());
  const lagnaRashiIndex = 5;
  const grahas = GRAHA_ORDER.map(graha => {
    const rashiIndex = SIGNS[graha];
    const siderealLongitude = rashiIndex * 30 + 5;
    const span = 360 / 27;
    return {
      graha, rashiIndex, siderealLongitude, degreeInRashi: 5,
      nakshatraIndex: Math.floor(siderealLongitude / span),
      pada: Math.floor((siderealLongitude % span) / (span / 4)) + 1,
      house: houseForRashi(rashiIndex, lagnaRashiIndex),
      retrograde: graha === 'rahu' || graha === 'ketu',
    };
  });
  return {
    input: { date: birth, latitude: 0, longitude: 0, timezone: 'Asia/Kolkata' },
    ayanamsa: 0, lagnaLongitude: lagnaRashiIndex * 30, lagnaRashiIndex,
    houses: computeWholeSignHouses(lagnaRashiIndex), grahas,
    vimshottari: computeVimshottariDasha(grahas.find(position => position.graha === 'moon')!.siderealLongitude, birth),
  };
}

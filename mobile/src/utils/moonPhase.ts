/** A tithi-based illustration, not a continuous ephemeris: 0–14 wax, 15–29 wane. */
export function moonPhaseForTithi(tithiIndex: number) {
  const index = Math.max(0, Math.min(29, Math.trunc(Number.isFinite(tithiIndex) ? tithiIndex : 14)));
  const waxing = index < 15;
  const steps = waxing ? index + 1 : 29 - index;
  const cosine = Math.cos(steps * Math.PI / 15);
  return { index, waxing, illuminatedFraction: (1 - cosine) / 2, terminator: cosine };
}

/** Lit limb of a spherical disc: an outer semicircle and an elliptical terminator. */
export function moonLitPath(tithiIndex: number, center = 256, radius = 216): string | null {
  const phase = moonPhaseForTithi(tithiIndex);
  if (phase.illuminatedFraction === 0) return null;
  if (phase.illuminatedFraction === 1) {
    return `M${center} ${center - radius} A${radius} ${radius} 0 1 1 ${center} ${center + radius} A${radius} ${radius} 0 1 1 ${center} ${center - radius} Z`;
  }
  const outerSweep = phase.waxing ? 1 : 0;
  const innerSweep = phase.terminator >= 0 ? 1 - outerSweep : outerSweep;
  const rx = Math.abs(phase.terminator) * radius;
  return `M${center} ${center - radius} A${radius} ${radius} 0 0 ${outerSweep} ${center} ${center + radius} A${rx} ${radius} 0 0 ${innerSweep} ${center} ${center - radius} Z`;
}

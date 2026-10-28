import { moonLitPath, moonPhaseForTithi } from '../moonPhase';

test('Purnima is fully illuminated and Amavasya has no lit limb', () => {
  expect(moonPhaseForTithi(14).illuminatedFraction).toBe(1);
  expect(moonLitPath(14)).not.toBeNull();
  expect(moonPhaseForTithi(29).illuminatedFraction).toBe(0);
  expect(moonLitPath(29)).toBeNull();
});

test('all fifteen waxing tithis grow to full, then all fifteen waning tithis diminish to dark', () => {
  const phases = Array.from({ length: 30 }, (_, index) => moonPhaseForTithi(index));
  for (let i = 1; i <= 14; i++) expect(phases[i].illuminatedFraction).toBeGreaterThan(phases[i - 1].illuminatedFraction);
  for (let i = 15; i <= 29; i++) expect(phases[i].illuminatedFraction).toBeLessThan(phases[i - 1].illuminatedFraction);
  for (let i = 0; i < 14; i++) {
    expect(phases[i].waxing).toBe(true);
    expect(phases[28 - i].waxing).toBe(false);
    expect(phases[i].illuminatedFraction).toBeCloseTo(phases[28 - i].illuminatedFraction);
  }
});

test('waxing and waning crescents use opposite outer limbs', () => {
  expect(moonLitPath(0)).toContain('A216 216 0 0 1');
  expect(moonLitPath(28)).toContain('A216 216 0 0 0');
});

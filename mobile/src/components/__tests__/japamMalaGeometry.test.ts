import {
  malaBeadAngle,
  malaBeadState,
  malaDirection,
  malaMarkerBead,
  malaRotation,
  MALA_SUMERU_GAP_DEG,
} from '../japamMalaGeometry';

describe('japam mala geometry', () => {
  test('beads span the ring, leaving the Sumeru gap at the bottom', () => {
    expect(malaBeadAngle(0)).toBe(90 + MALA_SUMERU_GAP_DEG);
    expect(malaBeadAngle(107)).toBeCloseTo(450 - MALA_SUMERU_GAP_DEG);
  });

  test('direction flips every completed round, so the Sumeru is never crossed', () => {
    expect(malaDirection(0)).toBe(1);
    expect(malaDirection(1)).toBe(-1);
    expect(malaDirection(2)).toBe(1);
  });

  test('the marker bead walks forward on even rounds and back on odd rounds', () => {
    expect(malaMarkerBead(0, 1)).toBe(0);
    expect(malaMarkerBead(47, 1)).toBe(47);
    expect(malaMarkerBead(0, -1)).toBe(107);
    expect(malaMarkerBead(47, -1)).toBe(60);
  });

  test('the round rollover keeps the marker on the same bead (no full spin)', () => {
    // bead 107 of an even round → count resets to 0 on the next (odd) round
    const before = malaMarkerBead(107, malaDirection(0));
    const after = malaMarkerBead(0, malaDirection(1));
    expect(after).toBe(before);
    expect(malaRotation(after)).toBe(malaRotation(before));
  });

  test('rotation brings the marker bead to the top (270°)', () => {
    for (const pos of [0, 30, 107]) {
      expect(malaRotation(pos) + malaBeadAngle(pos)).toBeCloseTo(270);
    }
  });

  test('bead states follow the direction of travel', () => {
    expect(malaBeadState(10, 10, 1)).toBe('current');
    expect(malaBeadState(9, 10, 1)).toBe('chanted');
    expect(malaBeadState(11, 10, 1)).toBe('ahead');
    expect(malaBeadState(11, 10, -1)).toBe('chanted');
    expect(malaBeadState(9, 10, -1)).toBe('ahead');
  });
});

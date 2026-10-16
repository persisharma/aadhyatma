import { coverRect } from '../coverRect';

describe('coverRect (object-fit: cover)', () => {
  test('a 4:5 source exactly fills a 4:5 box without cropping', () => {
    expect(coverRect(1122, 1402.5, 92, 115)).toEqual({ scale: 92 / 1122, width: 92, height: 115, left: 0, top: 0 });
  });

  test('a 2:1 painting in a 4:5 thumb crops the sides around the centre by default', () => {
    const rect = coverRect(960, 480, 92, 115);
    expect(rect.height).toBeCloseTo(115);
    expect(rect.width).toBeCloseTo(230);
    expect(rect.left).toBeCloseTo(-69);
    expect(rect.top).toBe(0);
  });

  test('a focal point moves the crop but never opens a gap at either edge', () => {
    expect(coverRect(960, 480, 92, 115, 0.68).left).toBeCloseTo(92 / 2 - 0.68 * 230);
    expect(coverRect(960, 480, 92, 115, 0).left).toBe(0);
    expect(coverRect(960, 480, 92, 115, 1).left).toBeCloseTo(92 - 230);
  });

  test('a box taller than the source ratio scales by height and keeps the top anchored when asked', () => {
    const rect = coverRect(4, 4, 92, 140, 0.5, 0);
    expect(rect.height).toBe(140);
    expect(rect.width).toBe(140);
    expect(rect.top).toBe(0);
    expect(rect.left).toBe(-24);
  });
});

import {
  placeTourCard,
  tabItemRect,
  inflateRect,
  sameRect,
  CARD_GAP,
} from '@/components/tour/placement';

const screen = { width: 390, height: 844 };
const insets = { top: 47, bottom: 34 };

describe('placeTourCard', () => {
  test('target near the top → card hugs just below it, arrow up', () => {
    const target = { x: 20, y: 100, width: 350, height: 80 }; // bottom = 180
    const p = placeTourCard(target, screen, insets);
    expect(p.arrow).toBe('up');
    expect(p.top).toBe(180 + CARD_GAP);
    expect(p.bottom).toBeUndefined();
  });

  test('bottom-tab target → card hugs just above it, arrow down (no full-screen gap)', () => {
    const target = { x: 0, y: 750, width: 78, height: 60 };
    const p = placeTourCard(target, screen, insets);
    expect(p.arrow).toBe('down');
    // Card bottom anchored right above the target, NOT at the screen top.
    expect(p.bottom).toBe(844 - 750 + CARD_GAP);
    expect(p.top).toBeUndefined();
  });

  test('large target that fills the screen → card pins above the bottom inset (controls stay on-screen), arrow up', () => {
    const big = { x: 20, y: 120, width: 360, height: 600 }; // neither side fits a card
    const p = placeTourCard(big, screen, insets);
    expect(p.arrow).toBe('up');
    expect(p.bottom).toBe(insets.bottom + 8);
    expect(p.top).toBeUndefined();
  });

  test('arrow is nudged under the target centre, clamped inside the card box', () => {
    // Target centre far right → arrow clamps to the card's right edge.
    const right = placeTourCard({ x: 340, y: 700, width: 40, height: 50 }, screen, insets);
    const slotWidth = 390 - 2 * 20;
    expect(right.arrowLeft).toBe(slotWidth - 22);
    // Target centre far left → arrow clamps to 0.
    const left = placeTourCard({ x: 0, y: 700, width: 20, height: 50 }, screen, insets);
    expect(left.arrowLeft).toBe(0);
    // Centred target → arrow near the middle of the slot.
    const mid = placeTourCard({ x: 175, y: 700, width: 40, height: 50 }, screen, insets);
    expect(mid.arrowLeft).toBeGreaterThan(150);
    expect(mid.arrowLeft).toBeLessThan(180);
  });
});

describe('sameRect', () => {
  test('equal to the nearest pixel', () => {
    expect(sameRect({ x: 1.2, y: 2.4, width: 3, height: 4 }, { x: 1, y: 2, width: 3, height: 4 })).toBe(true);
    expect(sameRect({ x: 1, y: 2, width: 3, height: 4 }, { x: 9, y: 2, width: 3, height: 4 })).toBe(false);
    expect(sameRect(null, null)).toBe(true);
    expect(sameRect(null, { x: 0, y: 0, width: 1, height: 1 })).toBe(false);
  });
});

describe('tabItemRect', () => {
  test('computes an equal-width slot above the bottom inset', () => {
    const r = tabItemRect(0, 5, screen, 34);
    expect(r).toEqual({ x: 0, y: 844 - (60 + 34), width: 78, height: 60 });
  });

  test('indexes across the bar (3rd of 5 tabs)', () => {
    const r = tabItemRect(2, 5, screen, 0);
    expect(r.x).toBe(156);
    expect(r.width).toBe(78);
    expect(r.y).toBe(844 - 60);
  });
});

describe('inflateRect', () => {
  test('grows on every side and clamps origin to >= 0', () => {
    expect(inflateRect({ x: 4, y: 2, width: 10, height: 10 }, 6)).toEqual({
      x: 0,
      y: 0,
      width: 22,
      height: 22,
    });
  });
});

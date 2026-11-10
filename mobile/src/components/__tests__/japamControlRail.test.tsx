import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Path, Circle } from 'react-native-svg';
import JapamMala from '../JapamMala';
import { malaOuterReach } from '../japamMalaGeometry';
import {
  distanceToRail,
  fitMalaBesideRail,
  fitMandalaBesideRail,
  RAIL_CLEARANCE,
  RAIL_HEIGHT,
  RAIL_KEEP_OUT,
  railBox,
} from '../japamControlRail';
import { ThemeProvider } from '@/theme/ThemeContext';

jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => true }));

/** Every coordinate pair in an SVG path's d (M/L commands only, as JapamMala draws). */
const points = (d: string) => {
  const nums = d.replace(/[MLZ]/g, ' ').trim().split(/\s+/).map(Number);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) out.push([nums[i], nums[i + 1]]);
  return out;
};

describe('control column geometry (design.md §35)', () => {
  test('the always-shown column: three 44 dp buttons 8 apart, 64 dp in from the right edge', () => {
    expect(RAIL_HEIGHT).toBe(148);
    expect(RAIL_CLEARANCE).toBe(64);
    expect(RAIL_KEEP_OUT).toBe(RAIL_HEIGHT);
    expect(railBox(390, 530)).toEqual({ left: 326, top: 370, bottom: 522 });
  });

  test.each([230, 262, 302, 330])('malaOuterReach(%i) covers everything the mala draws, tassel included', async (size) => {
    let tree: TestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = TestRenderer.create(<ThemeProvider><JapamMala count={0} rounds={0} size={size} playing={false} notice={null} hint="" /></ThemeProvider>);
    });
    const c = size / 2;
    let far = 0;
    // The rotating layer is the size × size Svg (the top marker is fixed and drawn apart).
    const layer = tree!.root.findAll((n) => n.props.width === size && n.props.height === size && n.findAllByType(Path).length > 0)[0];
    for (const p of layer.findAllByType(Path)) {
      for (const [x, y] of points(String(p.props.d))) far = Math.max(far, Math.hypot(x - c, y - c));
    }
    for (const ci of layer.findAllByType(Circle)) {
      const { cx, cy, r } = ci.props;
      if (typeof cx === 'number' && typeof r === 'number') far = Math.max(far, Math.hypot(cx - c, cy - c) + r);
    }
    expect(far).toBeGreaterThan(size / 2 - 40);
    expect(malaOuterReach(size)).toBeGreaterThanOrEqual(far - 1e-6);
    act(() => tree!.unmount());
  });

  test('a ring that fits returns unchanged; the fit never goes below the floor', () => {
    // Tall viewport: the ring sits well above the column.
    expect(fitMalaBesideRail({ width: 440, viewport: 640, head: 63, size: 330, min: 230 })).toBe(330);
    // Tight viewports shrink only as far as needed, and never below the floor.
    expect(fitMalaBesideRail({ width: 390, viewport: 530, head: 63, size: 330, min: 230 })).toBe(300);
    expect(fitMalaBesideRail({ width: 320, viewport: 300, head: 120, size: 260, min: 230 })).toBe(230);
    expect(fitMandalaBesideRail({ width: 390, viewport: 530, size: 340, min: 280 })).toBe(340);
    expect(fitMandalaBesideRail({ width: 375, viewport: 425, size: 340, min: 280 })).toBe(292);
    expect(fitMandalaBesideRail({ width: 320, viewport: 320, size: 296, min: 280 })).toBe(280);
  });

  test('distance is zero inside the box and grows away from it', () => {
    expect(distanceToRail(390, 530, 360, 450)).toBe(0);
    expect(distanceToRail(390, 530, 195, 450)).toBe(131);
    expect(distanceToRail(390, 530, 326, 300)).toBe(70);
  });
});

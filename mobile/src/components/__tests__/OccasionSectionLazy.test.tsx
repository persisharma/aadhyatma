import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import OccasionSection from '../OccasionSection';
let mockIllustratedLoads = 0;
jest.mock('../CompactOccasionCard', () => 'Summary');
jest.mock('../OccasionTimingsCard', () => { mockIllustratedLoads++; return { __esModule: true, default: 'Illustrated' }; });
test('Panchang does not evaluate the illustrated card graph; Vrat loads it on demand', () => {
  const props = { items: [], date: new Date(2026, 10, 8), place: 'Jaipur', onOpenVrat() {} };
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<OccasionSection presentation="summary" {...props} />); });
  expect(mockIllustratedLoads).toBe(0);
  act(() => tree.update(<OccasionSection presentation="illustrated" {...props} />));
  expect(mockIllustratedLoads).toBe(1);
  act(() => tree.unmount());
});

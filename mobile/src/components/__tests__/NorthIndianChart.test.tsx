import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { computeKundali } from '@/panchang/kundali';
import NorthIndianChart, { buildChartAccessibilityLabel } from '../NorthIndianChart';

const chart = computeKundali({
  date: new Date('1992-08-14T00:12:00.000Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 500,
  timezone: 'Asia/Kolkata',
});

test('North Indian chart exposes all twelve houses and grahas accessibly', () => {
  const label = buildChartAccessibilityLabel(chart);
  expect(label).toContain('House 1');
  expect(label).toContain('House 12');
  expect(label).toContain('Moon');
  expect(label).toContain('Sun');

  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<NorthIndianChart chart={chart} />);
  });
  expect(tree.root.findByProps({ testID: 'north-indian-chart' }).props.accessibilityLabel).toBe(label);
});

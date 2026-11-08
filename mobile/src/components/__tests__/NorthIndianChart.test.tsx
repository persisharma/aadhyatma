import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { syntheticLearningChart } from '@/panchang/__tests__/fixtures/learningChart';
import NorthIndianChart, { buildChartAccessibilityLabel, chartGrahaAbbreviation } from '../NorthIndianChart';

const chart = syntheticLearningChart(true);

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

test('every interactive polygon opens its actual fixed house', () => {
  const select = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<NorthIndianChart chart={chart} lang="hi" onSelectHouse={select} />); });
  for (let house = 1; house <= 12; house++) {
    const cell = tree.root.findByProps({ testID: `kundali-house-${house}` });
    expect(cell.props.accessibilityLabel).toContain(`Explore house ${house},`);
    act(() => cell.props.onPress());
    expect(select).toHaveBeenLastCalledWith(house);
  }
  act(() => tree.unmount());
});


test('interactive chart shows every graha short form, including shared houses', () => {
  const fixture = syntheticLearningChart(true);
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<NorthIndianChart chart={fixture} lang="en" onSelectHouse={jest.fn()} />); });
  const label = tree.root.findByProps({ testID: 'kundali-house-grahas-3' });
  expect(label.findAll(node => typeof node.props.children === 'string').map(node => node.props.children)).toContain('Su Me');
  expect(chartGrahaAbbreviation('mercury', 'en')).toBe('Me');
  expect(chartGrahaAbbreviation('moon', 'hi')).toBe('चं');
  expect(chartGrahaAbbreviation('sun', 'gu')).toBe('સૂ');
  expect(chartGrahaAbbreviation('sun', 'kn')).toBe('ಸೂ');
  act(() => tree.unmount());
});

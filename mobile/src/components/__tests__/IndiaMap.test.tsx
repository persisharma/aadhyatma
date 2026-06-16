import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

// Render react-native-svg primitives as plain Views so props (d, fillOpacity…)
// are inspectable and no native module is required.
jest.mock('react-native-svg', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  const mk = () => (props: Record<string, unknown>) =>
    ReactLib.createElement(View, props, props.children as React.ReactNode);
  const Svg = mk();
  return { __esModule: true, default: Svg, Svg, Path: mk(), G: mk() };
});

import IndiaMap, { projectLatLng } from '../IndiaMap';
import { INDIA_PROJECTION } from '../indiaMapPaths.generated';
import { temples } from '@/data/theerth/temples';

test('projectLatLng maps the bounding-box corners exactly', () => {
  const { lngMin, lngMax, latMin, latMax, width, height } = INDIA_PROJECTION;
  const tl = projectLatLng(latMax, lngMin);
  assert.ok(Math.abs(tl.x) < 1e-6 && Math.abs(tl.y) < 1e-6, 'top-left → (0,0)');
  const br = projectLatLng(latMin, lngMax);
  assert.ok(
    Math.abs(br.x - width) < 1e-6 && Math.abs(br.y - height) < 1e-6,
    'bottom-right → (width,height)',
  );
  const mid = projectLatLng((latMin + latMax) / 2, (lngMin + lngMax) / 2);
  assert.ok(Math.abs(mid.x - width / 2) < 1e-6 && Math.abs(mid.y - height / 2) < 1e-6);
});

test('every temple projects within the map viewport', () => {
  const { width, height } = INDIA_PROJECTION;
  for (const t of temples) {
    const p = projectLatLng(t.coordinates.lat, t.coordinates.lng);
    assert.ok(
      p.x >= 0 && p.x <= width && p.y >= 0 && p.y <= height,
      `${t.id} projected off-map: (${p.x},${p.y})`,
    );
  }
});

test('renders a tappable pin per pin and reports its id on press', () => {
  const calls: string[] = [];
  const pins = [
    { id: 'somnath', lat: 20.888, lng: 70.402, label: 'Somnath' },
    { id: 'kedarnath', lat: 30.735, lng: 79.067, label: 'Kedarnath' },
  ];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <IndiaMap pins={pins} width={300} onPinPress={(id) => calls.push(id)} />,
    );
  });
  const somnathPin = tree.root.find(
    (n) => n.props.accessibilityLabel === 'Somnath' && typeof n.props.onPress === 'function',
  );
  act(() => {
    somnathPin.props.onPress();
  });
  assert.deepEqual(calls, ['somnath']);
});

test('warns (dev) when a pin is out of bounds', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  act(() => {
    TestRenderer.create(
      <IndiaMap
        pins={[{ id: 'bad', lat: 0, lng: 0, label: 'Bad' }]}
        width={300}
        onPinPress={() => {}}
      />,
    );
  });
  assert.ok(
    warn.mock.calls.some((c) => String(c[0]).includes('out of bounds')),
    'expected an out-of-bounds warning',
  );
  warn.mockRestore();
});

test('highlightStateEn fills exactly one state region', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <IndiaMap pins={[]} width={300} onPinPress={() => {}} highlightStateEn="Gujarat" />,
    );
  });
  const filled = tree.root.findAll((n) => n.props.fillOpacity === 0.12);
  assert.ok(filled.length >= 1, 'highlight should be applied');
  // Dedupe composite+host instances of the same element by their path data.
  const distinct = new Set(filled.map((n) => n.props.d));
  assert.equal(distinct.size, 1, 'exactly one distinct state path filled');
});

test('no state is filled without a highlight', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<IndiaMap pins={[]} width={300} onPinPress={() => {}} />);
  });
  const filled = tree.root.findAll((n) => n.props.fillOpacity === 0.12);
  assert.equal(filled.length, 0);
});

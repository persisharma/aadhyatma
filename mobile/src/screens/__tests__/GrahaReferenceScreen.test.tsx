import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { GitaLanguageProvider } from '@/data/gita/language';
import { GRAHA_ORDER } from '@/panchang/kundali';

const GrahaReferenceScreen = jest.requireActual<typeof import('../GrahaReferenceScreen')>(
  '../GrahaReferenceScreen'
).default;

function render(params?: { focusGraha?: string }) {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() } as never;
  const route = { params, key: 'r', name: 'GrahaReference' } as never;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <GrahaReferenceScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>
    );
  });
  return tree;
}

function hasTestID(tree: TestRenderer.ReactTestRenderer, id: string): boolean {
  return tree.root.findAll((node) => node.props?.testID === id).length > 0;
}

test('lists all nine grahas, every detail collapsed by default', () => {
  const tree = render(undefined);
  for (const graha of GRAHA_ORDER) {
    assert.ok(hasTestID(tree, `graha-ref-row-${graha}`), `${graha} row renders`);
    assert.ok(!hasTestID(tree, `graha-ref-detail-${graha}`), `${graha} detail collapsed`);
  }
});

test('focusGraha opens that graha expanded (the chart card deep-link)', () => {
  const tree = render({ focusGraha: 'saturn' });
  assert.ok(hasTestID(tree, 'graha-ref-detail-saturn'), 'saturn detail open');
  assert.ok(!hasTestID(tree, 'graha-ref-detail-sun'), 'others stay collapsed');
});

test('tapping a graha toggles its detail', () => {
  const tree = render(undefined);
  const row = tree.root.find((node) => node.props?.testID === 'graha-ref-row-sun');
  act(() => row.props.onPress());
  assert.ok(hasTestID(tree, 'graha-ref-detail-sun'), 'sun detail opens on tap');
  act(() => row.props.onPress());
  assert.ok(!hasTestID(tree, 'graha-ref-detail-sun'), 'sun detail closes on second tap');
});

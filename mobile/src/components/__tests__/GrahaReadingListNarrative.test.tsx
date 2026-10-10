import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { GitaLanguageProvider } from '@/data/gita/language';
import { buildGrahaReadings } from '@/panchang/grahaReading';
import { computeKundali } from '@/panchang/kundali';

const GrahaReadingList = jest.requireActual<typeof import('../GrahaReadingList')>(
  '../GrahaReadingList'
).default;

const chart = computeKundali({
  date: new Date('1992-08-14T00:12:00.000Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 500,
  timezone: 'Asia/Kolkata',
});
const cards = buildGrahaReadings(chart);
const saturn = cards.find((card) => card.graha === 'saturn')!;

function allText(tree: TestRenderer.ReactTestRenderer): string {
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (node == null) return;
    if (typeof node === 'string') {
      out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    walk((node as { children?: unknown }).children);
  };
  walk(tree.toJSON());
  return out.join(' ');
}

function render(node: React.ReactElement, dev: boolean) {
  const prev = (global as { __DEV__?: boolean }).__DEV__;
  (global as { __DEV__?: boolean }).__DEV__ = dev;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<GitaLanguageProvider initialLang="en">{node}</GitaLanguageProvider>);
  });
  (global as { __DEV__?: boolean }).__DEV__ = prev;
  return tree;
}

test('every graha now carries a narrative, nodes included', () => {
  assert.ok(saturn.narrative, 'saturn card has narrative fields');
  assert.match(saturn.narrative!.leadEn, /Saturn/);
  for (const card of cards) {
    assert.ok(card.narrative, `${card.graha} card has narrative fields`);
    assert.ok(card.narrative!.leadEn.trim().length > 0 && card.narrative!.tendEn.trim().length > 0);
  }
});

test('in dev, the opened Saturn card shows the narrative voice, not the legacy bullets', () => {
  const tree = render(<GrahaReadingList cards={[saturn]} introHi={[]} introEn={[]} lang="en" onPractice={() => {}} />, true);
  const row = tree.root.find((node) => node.props?.testID === 'graha-row-saturn');
  act(() => row.props.onPress());
  const text = allText(tree);
  assert.match(text, /One thing to tend:/, 'the tend line renders');
  assert.doesNotMatch(text, /What it gives/, 'the legacy bullets are replaced');
});

test('the learn link appears only when onLearnGraha is provided', () => {
  const withLink = render(
    <GrahaReadingList cards={[saturn]} introHi={[]} introEn={[]} lang="en" onPractice={() => {}} onLearnGraha={() => {}} />,
    true,
  );
  const row = withLink.root.find((node) => node.props?.testID === 'graha-row-saturn');
  act(() => row.props.onPress());
  assert.ok(
    withLink.root.findAll((node) => node.props?.testID === 'graha-learn-saturn').length > 0,
    'learn link renders when the callback is set',
  );
});

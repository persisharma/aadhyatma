import React from 'react';
import { Image, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import ShareCardMount from '../ShareCardMount';
import type { ShareableCard } from '@/utils/shareVerse';

let cardReady: (ready: boolean) => void = () => {};
const card = (over: Partial<ShareableCard> = {}): ShareableCard => ({
  kind: 'card', sourceId: 'panchang.today', width: 340,
  title: { hi: 'पंचांग साझा करें', en: 'Share panchang', gu: 'પંચાંગ શેર કરો', kn: 'ಪಂಚಾಂಗ ಹಂಚಿ' },
  tagNameHi: 'पंचांग', tagNameEn: 'Panchang',
  render: ({ onReady }) => { cardReady = onReady; return <Text>card</Text>; },
  caption: () => ({ sectionName: 'आज का पंचांग', label: '', firstLine: '' }),
  ...over,
});
function mount(content: ShareableCard, onHeight: jest.Mock) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<ThemeProvider><ShareCardMount content={content} lang="hi" onHeight={onHeight} /></ThemeProvider>); });
  return tree;
}
const layout = (tree: TestRenderer.ReactTestRenderer, height: number) =>
  act(() => tree.root.findByProps({ testID: 'share-card-mount' }).props.onLayout({ nativeEvent: { layout: { height } } }));
const texts = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text).map(t => [].concat(t.props.children).join(''));

it('adds the brand + download strip and reports height only once the mark has painted', () => {
  const onHeight = jest.fn();
  const tree = mount(card(), onHeight);
  expect(texts(tree)).toEqual(expect.arrayContaining(['वेदांश', 'vedansh.app/get']));
  layout(tree, 900);
  expect(onHeight).not.toHaveBeenCalled();
  act(() => tree.root.findByProps({ testID: 'share-card-brand-strip' }).findByType(Image).props.onLoad());
  expect(onHeight).toHaveBeenCalledWith(900);
});

it('a self-branded card with art (Suvichar) gets no strip and waits for its own readiness', () => {
  const onHeight = jest.fn();
  const tree = mount(card({ branded: true, awaitsArt: true }), onHeight);
  expect(tree.root.findAllByProps({ testID: 'share-card-brand-strip' })).toHaveLength(0);
  layout(tree, 1200);
  act(() => cardReady(false));
  expect(onHeight).not.toHaveBeenCalled();
  act(() => cardReady(true));
  expect(onHeight).toHaveBeenCalledWith(1200);
});

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import ShareFitFrame from '../ShareFitFrame';
import { ThemeProvider } from '@/theme/ThemeContext';
import { feedCanvas, storyCanvas, placeFeedCard, placeStoryCard } from '@/utils/shareStoryLayout';

jest.mock('../BackgroundLayer', () => 'BackgroundLayer');

function canvasAndScale(format: 'post' | 'story', cardHeight: number) {
  let tree: ReactTestRenderer;
  act(() => {
    tree = create(
      <ThemeProvider>
        <ShareFitFrame format={format} background={null} cardWidth={540} cardHeight={cardHeight}>
          <Text testID="card">x</Text>
        </ShareFitFrame>
      </ThemeProvider>
    );
  });
  const card = tree!.root.findByProps({ testID: 'card' });
  const placed = StyleSheet.flatten(card.parent!.props.style);
  const canvas = StyleSheet.flatten(tree!.root.findAllByType(View)[0].props.style);
  const scale = (placed.transform as { scale: number }[]).find(t => 'scale' in t)!.scale;
  act(() => tree!.unmount());
  return { canvas, scale };
}

it('a tall card scales down to fit the 4:5 feed canvas', () => {
  const { canvas, scale } = canvasAndScale('post', 1350);
  expect(canvas.width).toBe(feedCanvas.width);
  expect(canvas.height).toBe(feedCanvas.height);
  expect(scale).toBeCloseTo(placeFeedCard(540, 1350).scale, 5);
  expect(scale).toBeLessThan(1);
});

it('a short card is not scaled up, on a 9:16 story canvas', () => {
  const { canvas, scale } = canvasAndScale('story', 400);
  expect(canvas.width).toBe(storyCanvas.width);
  expect(canvas.height).toBe(storyCanvas.height);
  expect(scale).toBe(placeStoryCard(540, 400).scale);
  expect(scale).toBe(1);
});

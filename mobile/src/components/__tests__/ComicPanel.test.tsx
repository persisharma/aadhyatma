import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { getComicBook, comicPages } from '@/data/comicBooks';
import { typography } from '@/theme/typography';
import { scaleTypography } from '@/theme/fontScale';
let mockLarge = false;
jest.mock('react-native', () => ({ Text: 'Text', View: 'View' }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Path: 'Path' }));
jest.mock('@/components/ComicArt', () => ({
  __esModule: true, default: 'ComicArt',
  comicArtGeometry: (panel: any, width: number) => ({ height: width * panel.dimensions.height * panel.frame.height / (panel.dimensions.width * panel.frame.width) }),
}));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({ colors: {}, typography: require('@/theme/fontScale').scaleTypography(require('@/theme/typography').typography, mockLarge ? 1.15 : 1) }) }));
const { default: Panel } = require('../ComicPanel');
const { comicBalloonPath, comicSpeechGeometry } = require('@/data/comicSpeechLayouts');
const panels = comicPages(getComicBook('balakanda-v1')!).map(p => p.panel);
const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => { trees.splice(0).forEach(tree => act(() => tree.unmount())); mockLarge = false; });
test.each(['hi', 'en'] as const)('all 140 %s panels render complete reviewed text with shared app sizing', lang => {
  for (const large of [false, true]) {
    mockLarge = large;
    const token = lang === 'hi' ? 'meaning' : 'meaningEnglish';
    for (const panel of panels) {
      let tree!: TestRenderer.ReactTestRenderer;
      act(() => { tree = TestRenderer.create(<Panel panel={panel} language={lang} />); });
      const narration = tree.root.findAllByProps({ testID: 'comic-narration' });
      expect(narration).toHaveLength(panel[lang].narration ? 1 : 0);
      const text = narration[0];
      if (text) {
      expect(text.props.children).toBe(panel[lang].narration);
      expect(text.props.numberOfLines).toBeUndefined();
      expect(text.props.style.fontSize).toBe(scaleTypography(typography, large ? 1.15 : 1)[token].fontSize);
      }
      expect(tree.root.findByType('ComicArt' as any).props.panel.frame).toEqual(panel.frame);
      act(() => tree.unmount());
    }
  }
});
test('all speaking scenes place their full dialogue on the art with a reviewed tail target', () => {
  const { comicSpeechLayouts } = require('@/data/comicSpeechLayouts');
  expect(Object.keys(comicSpeechLayouts).sort()).toEqual(panels.filter(p => p.hi.dialogue).map(p => p.id).sort());
  for (const panel of panels.filter(p => p.speakerAnchor)) {
    const layout = comicSpeechLayouts[panel.id];
    for (const width of [272, 342, 720]) for (const textHeight of [48, 84, 140]) {
      const artHeight = width * panel.dimensions.height * panel.frame.height / (panel.dimensions.width * panel.frame.width);
      const g = comicSpeechGeometry(layout, width, artHeight, textHeight);
      expect(g.y).toBeLessThan(artHeight);
      expect(g.x).toBeGreaterThanOrEqual(0);
      expect(g.x + g.width).toBeLessThanOrEqual(width);
      if (require('@/data/comicSpeechLayouts').comicSpeechFits(layout, artHeight, textHeight)) expect(g.y + textHeight).toBeLessThanOrEqual(g.canvasHeight);
      expect(g.y).toBeGreaterThanOrEqual(0);
      expect(g.canvasHeight).toBe(artHeight);
      const d = comicBalloonPath(g.x, g.y, g.width, textHeight, width * layout.tipX, artHeight * layout.tipY, layout.tail);
      expect(d).not.toMatch(/NaN|Infinity/);
      expect(d.match(/ L /g)).toHaveLength(2);
      expect(d.endsWith('Z')).toBe(true);
    }
  }
});
test('dialogue follows the cast instead of a fixed top inset without shrinking text', () => {
  const panel = panels.find(p => p.id === 'bk-07-03')!;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Panel panel={panel} language="hi" />); });
  trees.push(tree);
  act(() => tree.root.findByProps({ testID: `comic-panel-${panel.id}` }).props.onLayout({ nativeEvent: { layout: { width: 276 } } }));
  const speech = tree.root.findByProps({ testID: 'comic-speech' });
  act(() => speech.props.onLayout({ nativeEvent: { layout: { height: 100 } } }));
  const scene = tree.root.findByProps({ testID: 'comic-scene' });
  expect(scene.findByProps({ testID: 'comic-speech' })).toBe(speech);
  expect(speech.props.style.position).toBe('absolute');
  expect(speech.props.style.top).toBeGreaterThan(40);
  expect(scene.props.style.minHeight).toBeGreaterThan(speech.props.style.top + 100);
  expect(tree.root.findByProps({ accessibilityLabel: `${panel.hi.speaker}: ${panel.hi.dialogue}` }).props.numberOfLines).toBeUndefined();
});
test('extreme accessibility text flows instead of covering characters', () => {
  const { comicSpeechLayouts, comicSpeechFits } = require('@/data/comicSpeechLayouts');
  for (const layout of Object.values(comicSpeechLayouts) as any[]) {
    expect(comicSpeechFits(layout, 400, 40)).toBe(true);
    expect(comicSpeechFits(layout, 400, 300)).toBe(false);
  }
  const panel = panels.find(p => p.id === 'bk-01-01')!;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Panel panel={panel} language="hi" />); });
  trees.push(tree);
  act(() => tree.root.findByProps({ testID: `comic-panel-${panel.id}` }).props.onLayout({ nativeEvent: { layout: { width: 304 } } }));
  act(() => tree.root.findByProps({ testID: 'comic-speech' }).props.onLayout({ nativeEvent: { layout: { height: 300 } } }));
  expect(tree.root.findByProps({ testID: 'comic-speech' }).props.style.position).toBe('relative');
  expect(tree.root.findAllByProps({ testID: 'comic-balloon-outline' })).toHaveLength(0);
});

test('tail ends at its reviewed speaker point instead of stopping after 30 points', () => {
  const d = comicBalloonPath(10, 200, 280, 60, 100, 50, 'top');
  expect(d).toContain('L 100 50');
  expect(d).not.toContain('L 100 170');
});

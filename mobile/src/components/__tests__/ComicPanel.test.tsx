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
const { default: Panel, comicBalloonPath } = require('../ComicPanel');
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
test('every flowing tail remains attached to its reviewed speaker at narrow and wide widths', () => {
  for (const panel of panels.filter(p => p.speakerAnchor)) {
    for (const width of [272, 342, 720]) {
      const speechWidth = width - 36;
      const tip = width * panel.speakerAnchor!.x - 18;
      const d = comicBalloonPath(speechWidth, 130, tip);
      expect(d).toContain(`L ${tip} 153`);
      expect(d.endsWith('Z')).toBe(true);
      expect(tip + 18).toBeCloseTo(width * panel.speakerAnchor!.x);
    }
  }
});
test('approved close-up uses a side balloon only while measured copy fits the clear art area', () => {
  const panel = panels.find(p => p.id === 'bk-05-03a')!;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Panel panel={panel} language="hi" />); });
  trees.push(tree);
  act(() => tree.root.findByProps({ testID: `comic-panel-${panel.id}` }).props.onLayout({ nativeEvent: { layout: { width: 346 } } }));
  const measurement = tree.root.findAllByType('Text' as any).find(n => n.props.onLayout)!;
  act(() => measurement.props.onLayout({ nativeEvent: { layout: { height: 40 } } }));
  expect(tree.root.findAllByProps({ accessibilityLabel: `${panel.hi.speaker}: ${panel.hi.dialogue}` })).toHaveLength(1);
  act(() => measurement.props.onLayout({ nativeEvent: { layout: { height: 400 } } }));
  expect(tree.root.findAllByProps({ accessibilityLabel: `${panel.hi.speaker}: ${panel.hi.dialogue}` })).toHaveLength(0);
  expect(tree.root.findAllByType('Text' as any).some(n => n.props.children === panel.hi.speaker)).toBe(true);
});

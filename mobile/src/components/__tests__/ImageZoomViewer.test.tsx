import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Modal, StyleSheet, Text } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';
import { lightColors } from '@/theme/colors';
import ImageZoomViewer from '../ImageZoomViewer';
import ZoomableArtwork from '../ZoomableArtwork';
import PagerNavBar from '../PagerNavBar';
import BookmarkButton from '../BookmarkButton';

const picture = 7; // a bundled require() is a number
async function render(node: React.ReactNode, lang: Lang = 'en') {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<SafeAreaInsetsContext.Provider value={{ top: 47, bottom: 34, left: 0, right: 0 }}>
      <GitaLanguageProvider initialLang={lang}><ThemeProvider>{node}</ThemeProvider></GitaLanguageProvider>
    </SafeAreaInsetsContext.Provider>);
  });
  return tree;
}
const press = (tree: TestRenderer.ReactTestRenderer, id: string) => tree.root.findAll(node => node.props.testID === id && typeof node.props.onPress === 'function').at(-1)!;
const text = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text).map(node => node.props.children).flat(Infinity).join(' ');
const layout = (tree: TestRenderer.ReactTestRenderer) => act(() => {
  tree.root.findAll(node => node.props.testID === 'image-viewer-stage' && typeof node.props.onLayout === 'function')[0]
    .props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 600 } } });
});

describe('ImageZoomViewer', () => {
  test('frames the picture explicitly and zooms with buttons, never past its limits', async () => {
    const onClose = jest.fn();
    const tree = await render(<ImageZoomViewer visible onClose={onClose} source={picture} title="Ten directions" caption="Four cardinal directions." />);
    layout(tree);
    // RULEBOOK §11.17: the frame owns the size (390 × 260 for a 3:2 picture), not the source pixels.
    const frame = tree.root.findAll(node => node.props.testID === 'image-viewer-picture').at(-1)!;
    expect(StyleSheet.flatten(frame.props.style)).toMatchObject({ width: 390, height: 260, overflow: 'hidden' });
    expect(text(tree)).toContain('1×');
    expect(press(tree, 'image-viewer-zoom-out').props.disabled).toBe(true);
    for (const level of ['1.75×', '2.5×', '3×']) {
      act(() => press(tree, 'image-viewer-zoom-in').props.onPress());
      expect(text(tree)).toContain(level);
    }
    expect(press(tree, 'image-viewer-zoom-in').props.disabled).toBe(true);
    act(() => press(tree, 'image-viewer-zoom-out').props.onPress());
    expect(text(tree)).toContain('2.5×');
    expect(text(tree)).toContain('Four cardinal directions.');
    expect(text(tree)).toContain('Pinch or double-tap to zoom');
    act(() => press(tree, 'image-viewer-close').props.onPress());
    expect(onClose).toHaveBeenCalledTimes(1);
    // Android Back closes it too.
    act(() => tree.root.findByType(Modal).props.onRequestClose());
    expect(onClose).toHaveBeenCalledTimes(2);
    act(() => tree.unmount());
  });

  test.each<Lang>(['hi', 'gu', 'kn'])('labels its controls in %s and uses the night palette', async lang => {
    const tree = await render(<ImageZoomViewer visible onClose={jest.fn()} source={picture} title="दिशा" />, lang);
    expect(press(tree, 'image-viewer-close').props.accessibilityLabel).not.toBe('Close picture');
    expect(press(tree, 'image-viewer-zoom-in').props.accessibilityLabel).not.toBe('Zoom in');
    const root = tree.root.findAll(node => node.props.testID === 'image-viewer').at(-1)!;
    expect(StyleSheet.flatten(root.props.style)).toMatchObject({ backgroundColor: lightColors.skyNightTop, paddingTop: 47, paddingBottom: 34 });
    act(() => tree.unmount());
  });
});

describe('ZoomableArtwork', () => {
  test('is one labelled button that opens the viewer, after telling the page first', async () => {
    const onOpen = jest.fn();
    const tree = await render(<ZoomableArtwork testID="plate" source={picture} title="Ten directions" caption="Four cardinal directions." showLabel onOpen={onOpen}>
      <Text>art</Text>
    </ZoomableArtwork>);
    const button = press(tree, 'plate');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('View picture larger. Four cardinal directions.');
    expect(text(tree)).toContain('Enlarge');
    // The viewer is not mounted until asked for.
    expect(tree.root.findAllByType(Modal)).toHaveLength(0);
    act(() => button.props.onPress());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByType(Modal)).toHaveLength(1);
    act(() => press(tree, 'image-viewer-close').props.onPress());
    expect(tree.root.findAllByType(Modal)).toHaveLength(0);
    act(() => tree.unmount());
  });

  test('the icon-only chip carries no visible label', async () => {
    const tree = await render(<ZoomableArtwork source={picture} title="Ganesha"><Text>art</Text></ZoomableArtwork>);
    expect(text(tree)).not.toContain('Enlarge');
    act(() => tree.unmount());
  });
});

describe('PagerNavBar', () => {
  const bar = (page: number, handlers = { onPrevious: jest.fn(), onNext: jest.fn() }) => render(
    <PagerNavBar page={page} total={3} {...handlers} previousLabel="Previous page" nextLabel="Next page" finishLabel="Finish" pageLabel={`Page ${page + 1} / 3`} nextTestID="next" />);

  test('first page: previous is disabled, one current dot of three', async () => {
    const handlers = { onPrevious: jest.fn(), onNext: jest.fn() };
    const tree = await bar(0, handlers);
    expect(press(tree, 'pager-previous').props.disabled).toBe(true);
    const dots = tree.root.findAll(node => node.props.testID === 'pager-dots').at(-1)!;
    expect(dots.props.accessibilityLabel).toBe('Page 1 / 3');
    const widths = dots.findAll(node => typeof node.type === 'string' && node.props.testID === undefined).map(node => StyleSheet.flatten(node.props.style).width);
    expect(widths).toEqual([18, 6, 6]);
    act(() => press(tree, 'next').props.onPress());
    expect(handlers.onNext).toHaveBeenCalledTimes(1);
    expect(press(tree, 'next').props.accessibilityLabel).toBe('Next page');
    act(() => tree.unmount());
  });

  test('last page: next becomes the finish action; both targets clear 48pt', async () => {
    const handlers = { onPrevious: jest.fn(), onNext: jest.fn() };
    const tree = await bar(2, handlers);
    expect(press(tree, 'next').props.accessibilityLabel).toBe('Finish');
    expect(press(tree, 'pager-previous').props.disabled).toBe(false);
    act(() => press(tree, 'pager-previous').props.onPress());
    expect(handlers.onPrevious).toHaveBeenCalledTimes(1);
    for (const id of ['pager-previous', 'next']) {
      const target = tree.root.findAll(node => typeof node.type === 'string' && node.props.testID === id)[0];
      expect(StyleSheet.flatten(target.props.style)).toMatchObject({ width: 48, height: 48 });
    }
    act(() => tree.unmount());
  });
});

test('BookmarkButton keeps its reader labels unless a screen names what the heart saves', async () => {
  const tree = await render(<><BookmarkButton isBookmarked={false} onToggle={jest.fn()} /><BookmarkButton testID="named" isBookmarked onToggle={jest.fn()} accessibilityLabel="Remove saved lesson" /></>);
  const labels = tree.root.findAll(node => typeof node.type === 'string' && node.props.accessibilityRole === 'button').map(node => node.props.accessibilityLabel);
  expect(labels).toEqual(['Add bookmark', 'Remove saved lesson']);
  act(() => tree.unmount());
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import BookmarkButton from '../BookmarkButton';
import ShareButton from '../ShareButton';
import ReaderHeader from '../ReaderHeader';

jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));

jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => true }));

function render(element: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(element); });
  return tree;
}

describe('reader action targets', () => {
  test.each([
    ['bookmark', <BookmarkButton isBookmarked={false} onToggle={() => undefined} />, 34],
    ['share', <ShareButton onPress={() => undefined} />, 34],
    ['back', <ReaderHeader title="Chalisa" onBack={() => undefined} sideWidth={44} />, 44],
  ])('%s has an actual minimum target while retaining its visible circle', (_, element, circleSize) => {
    const tree = render(element as React.ReactElement);
    const action = tree.root.findAll(node => node.props.accessibilityRole === 'button')[0];
    const style = StyleSheet.flatten(typeof action.props.style === 'function' ? action.props.style({ pressed: false }) : action.props.style);
    expect(style.width).toBeGreaterThanOrEqual(48);
    expect(style.height).toBeGreaterThanOrEqual(48);
    const circle = action.findAllByType(View).find(node => StyleSheet.flatten(node.props.style)?.borderRadius === Number(circleSize) / 2);
    expect(StyleSheet.flatten(circle!.props.style).width).toBe(circleSize);
    act(() => tree.unmount());
  });

  test('bookmark still toggles and share keeps long-press and busy behavior', () => {
    const toggle = jest.fn();
    const bookmark = render(<BookmarkButton isBookmarked onToggle={toggle} />);
    const action = bookmark.root.findAll(node => node.props.accessibilityRole === 'button')[0];
    expect(action.props.accessibilityState.selected).toBe(true);
    act(() => action.props.onPress());
    expect(toggle).toHaveBeenCalledTimes(1);
    const share = render(<ShareButton onPress={() => undefined} onLongPress={toggle} busy />);
    expect(share.root.findAll(node => node.props.accessibilityRole === 'button')[0].props.disabled).toBe(true);
    expect(share.root.findAll(node => node.props.accessibilityRole === 'button')[0].props.onLongPress).toBe(toggle);
    act(() => { bookmark.unmount(); share.unmount(); });
  });
});

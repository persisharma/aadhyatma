import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { GitaLanguageProvider } from '@/data/gita/language';
import { getGitaSaarChapter } from '@/data/gita-saar';
import GitaSaarVersePage from '../GitaSaarVersePage';

const mockScrollTo = jest.fn();

jest.mock('../AutoSlideScrollView', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(function MockAutoSlideScrollView(props: React.PropsWithChildren, ref: React.Ref<unknown>) {
      React.useImperativeHandle(ref, () => ({ scrollTo: mockScrollTo }));
      return React.createElement(View, props, props.children);
    }),
  };
});

test('opening the original Gita text brings its newly laid out panel into view', () => {
  const frame = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0);
    return 1;
  });
  const verse = getGitaSaarChapter(5).verses[0];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <GitaSaarVersePage verse={verse} sourceId="gita-saar" width={393} />
      </GitaLanguageProvider>
    );
  });
  const toggle = tree.root.findByProps({ testID: 'gita-saar-source-toggle' });
  act(() => toggle.props.onPress());
  const original = tree.root.findByProps({ testID: 'gita-saar-original' });
  act(() => original.props.onLayout({ nativeEvent: { layout: { y: 1200 } } }));
  expect(mockScrollTo).toHaveBeenCalledWith({ y: 1188, animated: true });
  act(() => tree.unmount());
  frame.mockRestore();
  mockScrollTo.mockClear();
});

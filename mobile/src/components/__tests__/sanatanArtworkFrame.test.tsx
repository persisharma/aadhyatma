import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, StyleSheet, View } from 'react-native';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import SanatanHomeCard from '../SanatanHomeCard';
import { Painting } from '../sanatan/Primitives';
import { getSanatanTopics } from '@/data/sanatan-parichay';

/** RN Image.ios/Android applies source width/height before the supplied style.
 * Include those defaults: an aspectRatio-only Image incorrectly keeps 640dp.
 */
function assertFramed(tree: TestRenderer.ReactTestRenderer, small = false) {
  const image = tree.root.findByType(Image);
  const nativeImageStyle = StyleSheet.flatten([{ width: 960, height: 640 }, image.props.style]);
  expect(nativeImageStyle).toMatchObject({ position: 'absolute', width: '100%', height: '100%' });
  const frame = tree.root.findAll(node => node.type === View && node.props.testID === image.props.testID.replace(/-image$/, ''))[0];
  expect(frame).toBeDefined();
  const style = StyleSheet.flatten(frame.props.style);
  expect(style.overflow).toBe('hidden');
  if (small) expect(style).toMatchObject({ width: 81, height: 54 });
  else {
    expect(style).toMatchObject({ width: '100%', aspectRatio: 1.5 });
    expect(style.height).toBeUndefined();
  }
}

test.each<Lang>(['hi', 'en', 'gu', 'kn'])('Home image cannot retain the bundled height in %s', async lang => {
  const onPress = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<GitaLanguageProvider initialLang={lang}>
    <SanatanHomeCard onPress={onPress} onPressIn={jest.fn()} onPressOut={jest.fn()} />
  </GitaLanguageProvider>); });
  assertFramed(tree);
  act(() => tree.root.findAll(node => node.props.testID === 'home-sanatan-card')[0].props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

describe.each(getSanatanTopics())('$id artwork', topic => {
  test.each([false, true])('uses a native-safe frame (small=%s)', small => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => { tree = TestRenderer.create(<Painting id={topic.id} small={small} />); });
    assertFramed(tree, small);
    act(() => tree.unmount());
  });
});

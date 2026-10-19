import React from 'react';
import { StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { DevotionalVerseBody, DevotionalFooter } from '../DevotionalFrame';
import { splitDevotionalMeaning } from '@/utils/devotionalShareLayout';

it('retains the complete long meaning and all commentary paragraphs', () => {
  const meaning = 'A complete meaning. '.repeat(100) + '\n\nFirst commentary.\n\nSecond commentary.';
  let tree: ReactTestRenderer;
  act(() => { tree = create(<DevotionalVerseBody header="Test" verse="Om" meaning={meaning} lang="en" art="shiva" verseStyle={{}} meaningStyle={{}} exportMode />); });
  const text = tree!.root.findByProps({ testID: 'devotional-share-meaning' }).props.children;
  const commentary = tree!.root.findByProps({ testID: 'devotional-share-commentary' }).props.children;
  expect(text + '\n\n' + commentary).toBe(meaning);
  const frame = tree!.root.findByProps({ testID: 'devotional-meaning-frame' });
  const style = StyleSheet.flatten(frame.props.style);
  expect(style.paddingHorizontal).toBeGreaterThan(20);
  expect(style.height).toBeUndefined();
  expect(style.maxHeight).toBeUndefined();
  act(() => tree!.unmount());
});

it('does not invent commentary for a single-paragraph meaning', () => {
  expect(splitDevotionalMeaning('One complete paragraph.')).toEqual({ meaning: 'One complete paragraph.', commentary: '' });
  expect(splitDevotionalMeaning('')).toEqual({ meaning: '', commentary: '' });
});

it('keeps footer scenery in its own flow box rather than behind content', () => {
  let tree: ReactTestRenderer;
  act(() => { tree = create(<DevotionalFooter art="durga" width={324} />); });
  const style = StyleSheet.flatten(tree!.root.findByProps({ testID: 'devotional-footer' }).props.style);
  expect(style.height).toBe(48);
  expect(style.position).toBeUndefined();
  act(() => tree!.unmount());
});

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import ObservancePreviewCard from '../ObservancePreviewCard';
import ObservanceTodaySummary from '../ObservanceTodaySummary';
import AreaFilterChips from '../AreaFilterChips';
import { observanceCountdown, observanceIcon, observanceMonth } from '@/panchang/observancePresentation';
import type { ObservanceRule } from '@/panchang/types';

const rule = {
  id: 'fixture', category: 'vrat', nameHi: 'संकष्टी चतुर्थी व्रत', nameEn: 'Sankashti Chaturthi Vrat',
  deityHi: 'श्री गणेश', deityEn: 'Shri Ganesh',
  shortDescriptionHi: 'व्रत का पूरा विवरण।', shortDescriptionEn: 'The complete description remains available.',
} as ObservanceRule;
const trees: TestRenderer.ReactTestRenderer[] = [];
function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(node); });
  trees.push(tree);
  return tree;
}
afterEach(() => act(() => trees.splice(0).forEach(tree => tree.unmount())));

test.each(['row', 'tile'] as const)('%s keeps save and detail as independent sibling targets', layout => {
  const onOpen = jest.fn();
  const onToggle = jest.fn();
  const tree = render(<ObservancePreviewCard rule={rule} lang="en" layout={layout} dateLabel="29 Oct" following={false} onPress={onOpen} onToggleFollow={onToggle} />);
  const buttons = tree.root.findAll(node => node.props.accessibilityRole === 'button');
  const star = buttons.find(node => node.props.accessibilityLabel === 'Follow Sankashti Chaturthi Vrat')!;
  const open = buttons.find(node => node.props.accessibilityLabel === rule.nameEn)!;
  act(() => star.props.onPress());
  expect(onToggle).toHaveBeenCalledTimes(1);
  expect(onOpen).not.toHaveBeenCalled();
  expect(star.parent).toBe(open.parent);
  expect(StyleSheet.flatten(typeof star.props.style === 'function' ? star.props.style({ pressed: false }) : star.props.style)).toMatchObject({ width: 44, height: 44 });
  act(() => open.props.onPress());
  expect(onOpen).toHaveBeenCalledTimes(1);
  const title = tree.root.findAllByType(Text).find(node => node.props.children === rule.nameEn)!;
  expect(title.props.numberOfLines).toBeUndefined();
});

test('selected stars announce the saved state and unfollow action', () => {
  const tree = render(<ObservancePreviewCard rule={rule} lang="hi" following onPress={jest.fn()} onToggleFollow={jest.fn()} />);
  const star = tree.root.findAll(node => node.props.accessibilityRole === 'button').find(node => node.props.accessibilityLabel === `Unfollow ${rule.nameEn}`)!;
  expect(star.props.accessibilityState).toEqual({ selected: true });
});

test('today summary expands without dropping any description', () => {
  const tree = render(<ObservanceTodaySummary rule={rule} titleHi={rule.nameHi} titleEn={rule.nameEn} lang="en" />);
  const description = () => tree.root.findAllByType(Text).find(node => node.props.testID === 'observance-summary-fixture')!;
  expect(description().props.children).toBe(rule.shortDescriptionEn);
  expect(description().props.numberOfLines).toBe(2);
  act(() => tree.root.find(node => node.props.accessibilityRole === 'button').props.onPress());
  expect(description().props.numberOfLines).toBeUndefined();
  expect(tree.root.find(node => node.props.accessibilityRole === 'button').props.accessibilityState).toEqual({ expanded: true });
  act(() => tree.root.find(node => node.props.accessibilityRole === 'button').props.onPress());
  expect(description().props.numberOfLines).toBe(2);
});

test('saved filter is usable even in a category with no regional tags', () => {
  const onSaved = jest.fn();
  const onArea = jest.fn();
  const tree = render(<AreaFilterChips areas={[]} value="all" lang="en" followingOnly onFollowingOnlyChange={onSaved} onChange={onArea} />);
  const saved = tree.root.findAll(node => node.props.accessibilityRole === 'button').find(node => node.props.accessibilityLabel === 'Show saved observances')!;
  expect(saved.props.accessibilityState.selected).toBe(true);
  act(() => saved.props.onPress());
  expect(onSaved).toHaveBeenLastCalledWith(false);
  act(() => tree.root.findAll(node => node.props.accessibilityRole === 'button').find(node => node.props.accessibilityLabel === 'Area: all')!.props.onPress());
  expect(onArea).toHaveBeenCalledWith('all');
  expect(onSaved).toHaveBeenLastCalledWith(false);
});

test('artwork matches explicit identities and uses neutral paintings for unsupported forms', () => {
  expect(observanceIcon(rule)).toBe('ganesha');
  expect(observanceIcon({ category: 'vrat', deityEn: 'Kala Bhairava' })).toBe('vrat');
  expect(observanceIcon({ category: 'festival', deityEn: 'Maharishi Valmiki' })).toBe('granth');
  expect(observanceIcon({ category: 'festival', deityEn: 'Unknown' })).toBe('aarti');
});

test('month headings distinguish years and countdowns compare civil days', () => {
  const today = new Date(2026, 11, 31, 23, 59);
  expect(observanceMonth(today, today, 'en')).toBe('December');
  expect(observanceMonth(new Date(2027, 0, 1), today, 'en')).toBe('January 2027');
  expect(observanceMonth(null, today, 'en')).toBe('Other observances');
  expect(observanceCountdown(today, today, 'hi')).toBe('आज');
  expect(observanceCountdown(new Date(2027, 0, 1), today, 'en')).toBe('Tomorrow');
  expect(observanceCountdown(new Date(2027, 0, 3), today, 'hi')).toBe('3 दिन शेष');
});

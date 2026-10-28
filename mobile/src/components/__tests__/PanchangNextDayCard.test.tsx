import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import PanchangNextDayCard from '../PanchangNextDayCard';
import type { ResolvedObservance } from '@/panchang/types';
import { OBSERVANCE_RULES } from '@/panchang/festivals';

const mockToggleReminder = jest.fn();
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('@/contexts/VratFollowContext', () => ({ useVratFollows: () => ({ isFollowing: () => false }) }));
jest.mock('../useVratReminderAction', () => ({
  useVratReminderAction: () => ({ toggleReminder: mockToggleReminder, reminderSheet: null, reminderOnFor: () => false }),
}));

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach(tree => tree.unmount()));
  mockToggleReminder.mockClear();
});

function render(items: ResolvedObservance[], isToday = true, onOpen = jest.fn()) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<PanchangNextDayCard items={items} lang="en" isToday={isToday} onOpen={onOpen} />); });
  trees.push(tree);
  return tree;
}

const item = (id: string, date = new Date(2026, 8, 29)): ResolvedObservance => ({
  rule: OBSERVANCE_RULES.find(rule => rule.id === id)!, date,
});
const text = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text).map(node => node.props.children).join(' ');

test('renders no empty card when the next day has no observance', () => {
  expect(render([]).toJSON()).toBeNull();
});

test('lists every next-day observance and opens the correct rule', () => {
  const onOpen = jest.fn();
  const tree = render([item('purnima-vrat'), item('amavasya-vrat')], true, onOpen);
  const rows = tree.root.findAll(node => typeof node.props.onPress === 'function' && node.props.testID?.startsWith('panchang-next-day-'));
  expect(new Set(rows.map(row => row.props.testID)).size).toBe(2);
  expect(text(tree)).toContain('Tomorrow');
  act(() => rows.find(row => row.props.testID === 'panchang-next-day-amavasya-vrat')!.props.onPress());
  expect(onOpen).toHaveBeenCalledWith('amavasya-vrat');
});

test('browsing another date says next day instead of claiming tomorrow', () => {
  const tree = render([item('purnima-vrat')], false);
  expect(text(tree)).toContain('Next day');
  expect(text(tree)).not.toContain('Tomorrow');
});

test('keeps the published Sankashti occurrence and Angarki title', () => {
  const tree = render([item('sankashti-chaturthi-vrat')]);
  expect(text(tree)).toContain('(Angarki) Vrat');
  expect(text(tree)).toContain('Vighnaraja Sankashti Chaturthi');
});

test('saving a named occurrence uses its original rule without opening details', () => {
  const onOpen = jest.fn();
  const occurrence = item('sankashti-chaturthi-vrat');
  const tree = render([occurrence], false, onOpen);
  const reminder = tree.root.findAll(node => node.props.accessibilityRole === 'button')
    .find(node => node.props.testID === 'observance-reminder-sankashti-chaturthi-vrat')!;
  act(() => reminder.props.onPress());
  expect(mockToggleReminder).toHaveBeenCalledWith(occurrence.rule);
  expect(onOpen).not.toHaveBeenCalled();
  expect(text(tree)).toContain('Vighnaraja Sankashti Chaturthi');
});

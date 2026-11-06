import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList, Text, TextInput } from 'react-native';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { ShareProvider } from '@/utils/shareVerse';
import { getSanatanTopic } from '@/data/sanatan-parichay';
import SanatanParichayScreen from '../SanatanParichayScreen';
import SanatanReaderScreen from '../SanatanReaderScreen';
import ExploreDiagram from '@/components/sanatan/ExploreDiagram';

// Playback has its own device/controller suites. Here the real pager/store owns progress.
jest.mock('@/screens/_useAutoSlide', () => ({ useReaderPlayback: () => ({ readAloud: { stop: jest.fn() }, autoSlide: { stop: jest.fn() } }) }));
jest.mock('@/components/readAloud/ReadAloudButton', () => () => null);
jest.mock('@/components/AutoSlideButton', () => () => null);
const navigation = { goBack: jest.fn(), push: jest.fn(), navigate: jest.fn() };
type HubProps = React.ComponentProps<typeof SanatanParichayScreen>;
type ReaderProps = React.ComponentProps<typeof SanatanReaderScreen>;
function text(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType(Text).map(node => node.props.children).flat(Infinity).join(' ');
}
async function render(node: React.ReactNode, lang: Lang = 'en') {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<GitaLanguageProvider initialLang={lang}><ShareProvider>{node}</ShareProvider></GitaLanguageProvider>); });
  return tree;
}
afterEach(() => jest.clearAllMocks());
test('question search opens the exact collection and keeps the query on Back', async () => {
  const tree = await render(<SanatanParichayScreen navigation={navigation as unknown as HubProps['navigation']} route={{ key: 'hub', name: 'SanatanParichay' }} />);
  act(() => tree.root.findByType(TextInput).props.onChangeText('33 koti devta'));
  const target = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === 'Thirty-three devata')[0];
  expect(target).toBeDefined();
  act(() => target.props.onPress());
  expect(navigation.push).toHaveBeenCalledWith('SanatanParichay', { topicId: 'thirty' });
  expect(tree.root.findByType(TextInput).props.value).toBe('33 koti devta');
  act(() => tree.unmount());
});
test.each<Lang>(['hi','en','gu','kn'])('reader renders complete authored prose in %s and follows the visible page', async lang => {
  const topic = getSanatanTopic('symbols')!;
  const tree = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
    route={{ key: 'lesson', name: 'SanatanReader', params: { topicId: topic.id, initialPage: 0 } }} />, lang);
  for (const paragraph of contentByLang(lang, ...topic.pages[0]).split(/\n\s*\n/)) expect(text(tree)).toContain(paragraph);
  const list = tree.root.findByType(FlatList);
  await act(async () => { list.props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: list.props.getItemLayout(null, 1).length } } }); });
  expect(text(tree)).toMatch(/2\s*\/3/);
  act(() => tree.unmount());
});
test('unknown reader IDs do not substitute another deity or start playback', async () => {
  const tree = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
    route={{ key: 'bad', name: 'SanatanReader', params: { topicId: 'unknown', initialPage: 0 } }} />);
  expect(text(tree)).toContain('This introduction is unavailable.');
  expect(tree.root.findAllByType(FlatList)).toHaveLength(0);
  act(() => tree.unmount());
});
test('directions include the selected above/below source, and Dashavatara lists stay separate', async () => {
  const tree = await render(<ExploreDiagram topic={getSanatanTopic('dikpal')!} onCollection={jest.fn()} />);
  const above = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === 'Above')[0];
  act(() => above.props.onPress());
  expect(text(tree)).toContain('Above · Brahma');
  act(() => tree.unmount());
  const avatars = await render(<ExploreDiagram topic={getSanatanTopic('forms')!} onCollection={jest.fn()} />);
  expect(text(avatars)).toContain('9. Krishna');
  const jayadeva = avatars.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === 'Jayadeva')[0];
  act(() => jayadeva.props.onPress());
  expect(text(avatars)).toContain('9. Buddha');
  expect(text(avatars)).not.toContain('9. Krishna');
  act(() => avatars.unmount());
});

test('finishing persists the final page and clears resume before returning', async () => {
  const tree = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
    route={{ key: 'finish', name: 'SanatanReader', params: { topicId: 'dikpal', initialPage: 2 } }} />);
  const finish = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === 'Finish introduction')[0];
  await act(async () => finish.props.onPress());
  expect(navigation.goBack).toHaveBeenCalledTimes(1);
  const writes = jest.mocked(AsyncStorage.setItem).mock.calls.filter(([key]) => key === '@vedansh/sanatan-learning-v1');
  const stored = JSON.parse(writes.at(-1)![1]);
  expect(stored.resume).toBeNull();
  expect(stored.read.dikpal).toContain(2);
  act(() => tree.unmount());
});

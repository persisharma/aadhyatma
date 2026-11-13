import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList, Modal, Text, TextInput } from 'react-native';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { ShareProvider } from '@/utils/shareVerse';
import { getSanatanTopics, getSanatanTopic, getSanatanReadingPages } from '@/data/sanatan-parichay';
import SanatanParichayScreen from '../SanatanParichayScreen';
import SanatanReaderScreen from '../SanatanReaderScreen';
import ExploreDiagram from '@/components/sanatan/ExploreDiagram';
import SwastikaGuide from '@/components/sanatan/SwastikaGuide';
import { Path, Circle } from 'react-native-svg';
import * as sharing from '@/utils/shareVerse';
import { ThemeProvider } from '@/theme/ThemeContext';

let mockReadingFactor = 1;
jest.mock('@/contexts/FontScaleContext', () => ({ useFontScale: () => ({ factor: mockReadingFactor }) }));

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
  await act(async () => { tree = TestRenderer.create(<GitaLanguageProvider initialLang={lang}><ThemeProvider><ShareProvider>{node}</ShareProvider></ThemeProvider></GitaLanguageProvider>); });
  return tree;
}
afterEach(() => { jest.clearAllMocks(); jest.restoreAllMocks(); mockReadingFactor = 1; });
test('question search opens the exact collection and keeps the query on Back', async () => {
  const tree = await render(<SanatanParichayScreen navigation={navigation as unknown as HubProps['navigation']} route={{ key: 'hub', name: 'SanatanParichay' }} />);
  const input = tree.root.findByType(TextInput);
  expect(input.props.autoCorrect).toBe(false);
  expect(input.props.autoCapitalize).toBe('none');
  expect(input.props.returnKeyType).toBe('search');
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
  const above = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.testID === 'sanatan-direction-8')[0];
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


for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
  for (const factor of [1, 1.15]) {
    test(`${lang}/${factor}: every collection has working page doors without a bibliography modal`, async () => {
      mockReadingFactor = factor;
      for (const topic of getSanatanTopics()) {
        const tree = await render(<SanatanParichayScreen navigation={navigation as unknown as HubProps['navigation']}
          route={{ key: topic.id, name: 'SanatanParichay', params: { topicId: topic.id } }} />, lang);
        expect(tree.root.findAllByType(Modal)).toHaveLength(0);
        expect(text(tree)).not.toMatch(/Sources & context|स्रोत और सन्दर्भ|IMD Positional|Object 37397/);
        for (let i = 0; i < 3; i++) {
          const label = contentByLang(lang, ...topic.pageTitles![i]);
          const target = tree.root.findAll(n => n.props.accessibilityRole === 'button' && n.props.accessibilityLabel === label)[0];
          expect(target).toBeDefined();
          act(() => target.props.onPress());
          expect(navigation.navigate).toHaveBeenLastCalledWith('SanatanReader', { topicId: topic.id, initialPage: i });
        }
        act(() => tree.unmount());
      }
    });
  }
  test(`${lang}: page and whole-lesson shares contain exactly the authored prose`, async () => {
    const share = jest.fn(async (_content: sharing.ShareableContent, _lang: Lang) => {});
    jest.spyOn(sharing, 'useShare').mockReturnValue({ share, dismiss: jest.fn(), busy: false });
    const topic = getSanatanTopic('deity')!;
    const tree = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
      route={{ key: 'share', name: 'SanatanReader', params: { topicId: topic.id, initialPage: 0 } }} />, lang);
    expect(tree.root.findAllByType(Modal)).toHaveLength(0);
    const button = tree.root.findAll(n => n.props.accessibilityRole === 'button' && n.props.accessibilityLabel === contentByLang(lang, 'साझा करें', 'Share'))[0];
    await act(async () => button.props.onPress());
    const payload = share.mock.calls[0][0] as unknown as sharing.ShareableProse;
    expect(payload.scopes[0].blocks).toEqual([{ kind: 'para', hi: getSanatanReadingPages(topic)[0][0], en: getSanatanReadingPages(topic)[0][1] }]);
    expect(payload.scopes[1].blocks).toEqual(getSanatanReadingPages(topic).map(([hi, en]) => ({ kind: 'para', hi, en })));
    act(() => tree.unmount());
  });
}

for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
  for (const factor of [1, 1.15]) {
    test(`${lang}/${factor}: swastika drawing page has all three stages and shares complete instructions`, async () => {
      mockReadingFactor = factor;
      const share = jest.fn(async (_content: sharing.ShareableContent, _lang: Lang) => {});
      jest.spyOn(sharing, 'useShare').mockReturnValue({ share, dismiss: jest.fn(), busy: false });
      const topic = getSanatanTopic('symbols')!;
      const tree = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
        route={{ key: 'drawing', name: 'SanatanReader', params: { topicId: 'symbols', initialPage: 2 } }} />, lang);
      expect(text(tree)).toMatch(/3\s*\/3/);
      for (let stage = 0; stage < 3; stage++) {
        expect(tree.root.findAll(node => node.props.testID === `swastika-stage-${stage}`).length).toBeGreaterThan(0);
      }
      for (const paragraph of contentByLang(lang, ...topic.pages[2]).split(/\n\s*\n/)) expect(text(tree)).toContain(paragraph.replace(/^\d+\.\s+/,''));
      const button = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === contentByLang(lang, 'साझा करें', 'Share'))[0];
      await act(async () => button.props.onPress());
      const payload = share.mock.calls[0][0] as sharing.ShareableProse;
      expect(share.mock.calls[0][1]).toBe(lang);
      expect(payload.scopes[0].blocks).toEqual([{ kind: 'para', hi: getSanatanReadingPages(topic)[2][0], en: getSanatanReadingPages(topic)[2][1] }]);
      expect(payload.scopes[1].blocks).toHaveLength(3);
      act(() => tree.unmount());
    });
  }
}


test('drawing stages preserve four equal right-angle clockwise turns and add dots only at the end', async () => {
  const tree = await render(<SwastikaGuide mode="drawing" />);
  const stage = (index: number) => tree.root.findAll(node => node.props.testID === `swastika-stage-${index}`)[0];
  expect(stage(0).findAllByType(Path)).toHaveLength(1);
  expect(stage(0).findAllByType(Circle)).toHaveLength(0);
  expect(stage(1).findAllByType(Path)).toHaveLength(2);
  expect(stage(1).findAllByType(Circle)).toHaveLength(0);
  expect(stage(2).findAllByType(Circle)).toHaveLength(4);
  const bends = stage(1).findAllByType(Path)[1].props.d as string;
  const segments = [...bends.matchAll(/M(\d+) (\d+)([hHvV])(\d+)/g)];
  expect(segments).toHaveLength(4);
  for (const [, sx, sy, command, amount] of segments) {
    const x = Number(sx), y = Number(sy), n = Number(amount);
    const dx = command === 'h' ? n : command === 'H' ? n - x : 0;
    const dy = command === 'v' ? n : command === 'V' ? n - y : 0;
    // Dot product zero proves the bend is perpendicular to the radial arm.
    expect((x - 60) * dx + (y - 60) * dy).toBeCloseTo(0);
    // Positive cross product in screen coordinates proves clockwise turning.
    expect((x - 60) * dy - (y - 60) * dx).toBeGreaterThan(0);
    expect(Math.hypot(dx, dy)).toBe(43);
  }
  act(() => tree.unmount());
});

for (const lang of ['hi','en','gu','kn'] as const) for (const factor of [1,1.15]) {
 test(`${lang}/${factor}: all ten directions remain visible and above/below never alias south`,async()=>{
  mockReadingFactor=factor;
  const tree=await render(<ExploreDiagram topic={getSanatanTopic('dikpal')!} onCollection={jest.fn()}/>,lang);
  for(let i=0;i<10;i++)expect(tree.root.findAll(n=>n.props.testID===`sanatan-direction-${i}`).length).toBeGreaterThan(0);
  const tap=(i:number)=>tree.root.findAll(n=>n.props.testID===`sanatan-direction-${i}`)[0].props.onPress();
  for(let i=0;i<50;i++){act(()=>tap(i%10));}
  act(()=>tap(8));expect(text(tree)).toContain(contentByLang(lang,'ऊर्ध्व · ब्रह्मा','Above · Brahma'));
  act(()=>tap(9));expect(text(tree)).toContain(contentByLang(lang,'अधो · विष्णु','Below · Vishnu'));
  expect(tree.root.findAll(n=>n.props.testID==='sanatan-direction-4').length).toBeGreaterThan(0);
  act(()=>tree.unmount());
 });
}

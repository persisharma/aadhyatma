import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { FlatList, Modal, Text, TextInput } from 'react-native';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { ShareProvider } from '@/utils/shareVerse';
import { getSanatanTopics, getSanatanTopic, getSanatanReadingPages } from '@/data/sanatan-parichay';
import SanatanParichayScreen from '../SanatanParichayScreen';
import SanatanReaderScreen from '../SanatanReaderScreen';
import ExploreDiagram from '@/components/sanatan/ExploreDiagram';
import ListingCard from '@/components/ListingCard';
import BookmarkButton from '@/components/BookmarkButton';
import { directions } from '@/data/sanatan-parichay/knowledge';
import { experiences } from '@/data/sanatan-parichay/experience';
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
  // The app root owns the safe-area provider; the picture viewer reads its insets.
  await act(async () => { tree = TestRenderer.create(<SafeAreaInsetsContext.Provider value={{ top: 47, bottom: 34, left: 0, right: 0 }}><GitaLanguageProvider initialLang={lang}><ThemeProvider><ShareProvider>{node}</ShareProvider></ThemeProvider></GitaLanguageProvider></SafeAreaInsetsContext.Provider>); });
  return tree;
}
afterEach(() => { jest.clearAllMocks(); jest.restoreAllMocks(); mockReadingFactor = 1; });
// The innermost pressable carrying the testID (the shared card passes it down through two wrappers).
const byId = (tree: TestRenderer.ReactTestRenderer, id: string) => tree.root.findAll(node => node.props.testID === id && typeof node.props.onPress === 'function').at(-1)!;
const hostButtons = (tree: TestRenderer.ReactTestRenderer, label: string) => tree.root.findAll(node => typeof node.type === 'string' && node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === label);
test('question search opens the exact lesson and keeps the query on Back', async () => {
  const tree = await render(<SanatanParichayScreen navigation={navigation as unknown as HubProps['navigation']} route={{ key: 'hub', name: 'SanatanParichay' }} />);
  const input = tree.root.findByType(TextInput);
  expect(input.props.autoCorrect).toBe(false);
  expect(input.props.autoCapitalize).toBe('none');
  expect(input.props.returnKeyType).toBe('search');
  act(() => tree.root.findByType(TextInput).props.onChangeText('33 koti devta'));
  expect(tree.root.findAllByType(ListingCard).map(node => node.props.testID).filter(id => String(id).startsWith('sanatan-collection-'))).toEqual(['sanatan-collection-thirty']);
  const target = byId(tree, 'sanatan-collection-thirty');
  expect(target.props.accessibilityLabel).toBe('Thirty-three devata. The reckoning of thirty-three. 3 pages. Tap to open.');
  act(() => target.props.onPress());
  // No overview screen in between: a card opens the lesson's first page.
  expect(navigation.navigate).toHaveBeenCalledWith('SanatanReader', { topicId: 'thirty', initialPage: 0 });
  expect(navigation.push).not.toHaveBeenCalled();
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
  expect(text(tree)).toMatch(/2\s*\/\s*3/);
  act(() => tree.unmount());
});
test('unknown reader IDs do not substitute another deity or start playback', async () => {
  const tree = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
    route={{ key: 'bad', name: 'SanatanReader', params: { topicId: 'unknown', initialPage: 0 } }} />);
  expect(text(tree)).toContain('This introduction is unavailable.');
  expect(tree.root.findAllByType(FlatList)).toHaveLength(0);
  act(() => tree.unmount());
});
test('the figure page shows the painted teaching plate and its one-line caption', async () => {
  const tree = await render(<ExploreDiagram topic={getSanatanTopic('dikpal')!} />);
  expect(tree.root.findAll(node => node.props.testID === 'sanatan-explore-dikpal').length).toBeGreaterThan(0);
  const plate = byId(tree, 'sanatan-plate-dikpal');
  expect(plate.props.accessibilityRole).toBe('button');
  expect(plate.props.accessibilityLabel).toContain('View picture larger');
  expect(text(tree)).toContain('directions');
  // The ten painted names are also real text under the plate.
  for (const [, direction, , guardian] of directions) { expect(text(tree)).toContain(direction); expect(text(tree)).toContain(guardian); }
  expect(tree.root.findAllByType(Modal)).toHaveLength(0);
  act(() => plate.props.onPress());
  expect(tree.root.findAll(node => node.props.testID === 'image-viewer').length).toBeGreaterThan(0);
  act(() => byId(tree, 'image-viewer-close').props.onPress());
  expect(tree.root.findAll(node => node.props.testID === 'image-viewer')).toHaveLength(0);
  act(() => tree.unmount());
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
    test(`${lang}/${factor}: the hub lists every lesson on the shared card and opens its reader`, async () => {
      mockReadingFactor = factor;
      const tree = await render(<SanatanParichayScreen navigation={navigation as unknown as HubProps['navigation']}
        route={{ key: 'hub', name: 'SanatanParichay' }} />, lang);
      expect(tree.root.findAllByType(Modal)).toHaveLength(0);
      expect(text(tree)).not.toMatch(/Sources & context|स्रोत और सन्दर्भ|IMD Positional|Object 37397/);
      expect(text(tree)).toContain(contentByLang(lang, '13 परिचय · चित्रों के साथ सरल उत्तर', '13 introductions · simple answers with pictures'));
      expect(tree.root.findAllByType(ListingCard).filter(node => String(node.props.testID).startsWith('sanatan-collection-'))).toHaveLength(getSanatanTopics().length);
      for (const topic of getSanatanTopics()) {
        const row = tree.root.findAllByType(ListingCard).find(node => node.props.testID === `sanatan-collection-${topic.id}`)!;
        expect(row.props.eyebrow).toBe(contentByLang(lang, ...topic.name));
        expect(row.props.title).toBe(contentByLang(lang, ...topic.title));
        expect(row.props.meta).toBe(`3 ${contentByLang(lang, 'पृष्ठ', 'pages')}`);
        act(() => row.props.onPress());
        expect(navigation.navigate).toHaveBeenLastCalledWith('SanatanReader', { topicId: topic.id, initialPage: 0 });
      }
      act(() => tree.unmount());
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
      expect(text(tree)).toMatch(/3\s*\/\s*3/);
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

for (const lang of ['hi','en','gu','kn'] as const) {
 test(`${lang}: the figure page renders its painted plate, caption and legend`,async()=>{
  const tree=await render(<ExploreDiagram topic={getSanatanTopic('dikpal')!}/>,lang);
  expect(byId(tree,'sanatan-plate-dikpal')).toBeDefined();
  expect(text(tree)).toContain(contentByLang(lang,...experiences.dikpal.answer));
  expect(tree.root.findAll(n=>n.props.testID==='sanatan-legend-dikpal').length).toBeGreaterThan(0);
  for(const [direction,,guardian] of directions)expect(text(tree)).toContain(contentByLang(lang,direction,''));
  act(()=>tree.unmount());
 });
}

test('the fixed pager bar turns pages, and the first page has nothing before it', async () => {
  const tree = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
    route={{ key: 'pager', name: 'SanatanReader', params: { topicId: 'dikpal', initialPage: 0 } }} />);
  expect(byId(tree, 'pager-previous').props.disabled).toBe(true);
  expect(byId(tree, 'sanatan-next').props.accessibilityLabel).toBe('Next page');
  await act(async () => byId(tree, 'sanatan-next').props.onPress());
  expect(text(tree)).toMatch(/2\s*\/\s*3/);
  expect(byId(tree, 'pager-previous').props.disabled).toBe(false);
  await act(async () => byId(tree, 'sanatan-next').props.onPress());
  expect(byId(tree, 'sanatan-next').props.accessibilityLabel).toBe('Finish introduction');
  await act(async () => byId(tree, 'pager-previous').props.onPress());
  expect(text(tree)).toMatch(/2\s*\/\s*3/);
  const stored = JSON.parse(jest.mocked(AsyncStorage.setItem).mock.calls.filter(([key]) => key === '@vedansh/sanatan-learning-v1').at(-1)![1]);
  // Forward turns record the pages left; going back is not completion.
  expect(stored.read.dikpal).toEqual(expect.arrayContaining([0, 1]));
  expect(stored.resume).toEqual({ id: 'dikpal', page: 1 });
  act(() => tree.unmount());
});

test('the opening painting opens the shared viewer, and the reader has no end-of-page buttons', async () => {
  const tree = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
    route={{ key: 'zoom', name: 'SanatanReader', params: { topicId: 'deity', initialPage: 0 } }} />);
  // One fixed pair for the whole lesson, not a pair at the end of every page.
  expect(hostButtons(tree, 'Previous page')).toHaveLength(1);
  expect(hostButtons(tree, 'Next page')).toHaveLength(1);
  // The question the lesson answers stays in the journey, above its answer.
  expect(text(tree)).toContain('How do we recognise a deity?');
  act(() => byId(tree, 'sanatan-painting-deity').props.onPress());
  expect(tree.root.findAll(node => node.props.testID === 'image-viewer').length).toBeGreaterThan(0);
  expect(text(tree)).toContain('1×');
  act(() => byId(tree, 'image-viewer-zoom-in').props.onPress());
  expect(text(tree)).toContain('1.75×');
  act(() => tree.unmount());
});

test('saved and group filters narrow the hub, and resume opens the stored page', async () => {
  // Real store, driven through the reader: save one lesson and leave another on its last page.
  const saving = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
    route={{ key: 'save', name: 'SanatanReader', params: { topicId: 'time', initialPage: 0 } }} />);
  const wasSaved = saving.root.findAllByType(BookmarkButton)[0].props.isBookmarked;
  if (!wasSaved) await act(async () => saving.root.findAllByType(BookmarkButton)[0].props.onToggle());
  expect(saving.root.findAllByType(BookmarkButton)[0].props.isBookmarked).toBe(true);
  expect(saving.root.findAllByType(BookmarkButton)[0].props.accessibilityLabel).toBe('Remove saved lesson');
  act(() => saving.unmount());
  const leaving = await render(<SanatanReaderScreen navigation={navigation as unknown as ReaderProps['navigation']}
    route={{ key: 'leave', name: 'SanatanReader', params: { topicId: 'rishis', initialPage: 2 } }} />);
  act(() => leaving.unmount());

  const tree = await render(<SanatanParichayScreen navigation={navigation as unknown as HubProps['navigation']} route={{ key: 'hub', name: 'SanatanParichay' }} />);
  const rows = () => tree.root.findAllByType(ListingCard).map(node => String(node.props.testID)).filter(id => id.startsWith('sanatan-collection-')).map(id => id.replace('sanatan-collection-', ''));
  expect(rows()).toHaveLength(13);
  act(() => byId(tree, 'sanatan-resume').props.onPress());
  expect(navigation.navigate).toHaveBeenLastCalledWith('SanatanReader', { topicId: 'rishis', initialPage: 2 });
  act(() => byId(tree, 'sanatan-filter-time').props.onPress());
  expect(rows()).toEqual(['elements', 'time', 'texts', 'rishis']);
  act(() => tree.root.findAllByType(BookmarkButton)[0].props.onToggle());
  expect(rows()).toEqual(['time']);
  // The saved view hides the cross-link to another section.
  expect(tree.root.findAll(node => node.props.testID === 'sanatan-sanskar')).toHaveLength(0);
  act(() => tree.root.findAllByType(BookmarkButton)[0].props.onToggle());
  act(() => byId(tree, 'sanatan-filter-all').props.onPress());
  expect(rows()).toHaveLength(13);
  act(() => byId(tree, 'sanatan-sanskar').props.onPress());
  expect(navigation.navigate).toHaveBeenLastCalledWith('CategoryList', { categoryId: 'sanskar' });
  act(() => tree.unmount());
});

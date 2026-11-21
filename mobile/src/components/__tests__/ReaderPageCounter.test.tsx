import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import TestRenderer, { act } from 'react-test-renderer';
import { Modal, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';
import ReaderPageCounter from '../ReaderPageCounter';
import PageJumpSheet from '../PageJumpSheet';
import { useReaderJump } from '@/screens/_useReaderJump';

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => { act(() => trees.splice(0).forEach(tree => tree.unmount())); });
async function render(node: React.ReactNode, lang: Lang = 'en') {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<SafeAreaInsetsContext.Provider value={{ top: 47, bottom: 34, left: 0, right: 0 }}>
      <GitaLanguageProvider initialLang={lang}><ThemeProvider>{node}</ThemeProvider></GitaLanguageProvider>
    </SafeAreaInsetsContext.Provider>);
  });
  trees.push(tree);
  return tree;
}
const press = (tree: TestRenderer.ReactTestRenderer, id: string) => tree.root.findAll(node => node.props.testID === id && typeof node.props.onPress === 'function').at(-1)!;
const texts = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text).map(node => [node.props.children].flat(Infinity).join(''));

describe('ReaderPageCounter', () => {
  test('is a 48pt button that keeps the counter text readable to flows and opens the picker', async () => {
    const onOpen = jest.fn();
    const onJump = jest.fn();
    const tree = await render(<ReaderPageCounter current={3} total={12} onOpen={onOpen} onJump={onJump} />);
    const counter = press(tree, 'reader-page-counter');
    // The label is the counter itself (Maestro asserts "3 / 12"); the action is the hint.
    expect(counter.props).toMatchObject({ accessibilityRole: 'button', accessibilityLabel: '3 / 12', accessibilityHint: 'Go to page' });
    expect(StyleSheet.flatten(counter.props.style({ pressed: false }))).toMatchObject({ minHeight: 48, minWidth: 60 });
    expect(texts(tree)).toContain('3 / 12');
    expect(tree.root.findAllByType(Modal)).toHaveLength(0);

    act(() => counter.props.onPress());
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByType(Modal)).toHaveLength(1);
    // The page on screen is preselected.
    expect(press(tree, 'page-jump-page-3').props.accessibilityState).toEqual({ selected: true });

    act(() => press(tree, 'page-jump-page-9').props.onPress());
    expect(onJump).not.toHaveBeenCalled();
    expect(texts(tree)).toContain('Open page 9');
    act(() => press(tree, 'page-jump-open').props.onPress());
    expect(onJump).toHaveBeenCalledWith(9);
    expect(tree.root.findAllByType(Modal)).toHaveLength(0);
  });

  test('cancel and the backdrop close without moving the reader', async () => {
    const onJump = jest.fn();
    const tree = await render(<ReaderPageCounter current={1} total={5} onJump={onJump} />);
    for (const id of ['page-jump-cancel', 'page-jump-backdrop']) {
      act(() => press(tree, 'reader-page-counter').props.onPress());
      act(() => press(tree, 'page-jump-page-4').props.onPress());
      act(() => press(tree, id).props.onPress());
      expect(tree.root.findAllByType(Modal)).toHaveLength(0);
    }
    expect(onJump).not.toHaveBeenCalled();
  });

  test('stays plain text when there is nowhere to jump', async () => {
    const single = await render(<ReaderPageCounter current={1} total={1} onJump={jest.fn()} />);
    const inert = await render(<ReaderPageCounter current={2} total={6} />);
    for (const tree of [single, inert]) {
      expect(tree.root.findAll(node => node.props.accessibilityRole === 'button')).toHaveLength(0);
    }
    expect(texts(inert)).toContain('2 / 6');
  });

  test('hands the tap to a reader that owns its picker, with that reader’s own label', async () => {
    const onPress = jest.fn();
    const tree = await render(<ReaderPageCounter testID="gita-jump-trigger" current={5} total={47} onPress={onPress}
      accessibilityLabel="Go to verse" accessibilityValueText="1.5" />);
    const counter = press(tree, 'gita-jump-trigger');
    expect(counter.props).toMatchObject({ accessibilityLabel: 'Go to verse', accessibilityValue: { text: '1.5' } });
    expect(counter.props.accessibilityHint).toBeUndefined();
    act(() => counter.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByType(Modal)).toHaveLength(0);
  });
});

describe('PageJumpSheet', () => {
  test('accepts a typed page in any reading script and rejects pages outside the text', async () => {
    const onOpen = jest.fn();
    const tree = await render(<PageJumpSheet current={2} total={40} onOpen={onOpen} onClose={jest.fn()} />, 'hi');
    const input = () => tree.root.findByType(TextInput);
    expect(texts(tree)).toContain('पृष्ठ पर जाएँ');
    act(() => input().props.onChangeText('४१'));
    expect(texts(tree)).toContain('1 से 40 तक पृष्ठ संख्या डालें।');
    expect(press(tree, 'page-jump-open').props.disabled).toBe(true);
    act(() => press(tree, 'page-jump-open').props.onPress());
    expect(onOpen).not.toHaveBeenCalled();
    act(() => input().props.onChangeText('३७'));
    expect(texts(tree)).toContain('पृष्ठ 37 खोलें');
    act(() => input().props.onSubmitEditing());
    expect(onOpen).toHaveBeenCalledWith(37);
  });

  test('names each page instead of numbering a grid when the reader has page titles', async () => {
    const onOpen = jest.fn();
    const tree = await render(<PageJumpSheet current={1} total={3} titles={['Koti means kinds', '8 + 11 + 12 + 1 + 1', 'Beyond the count']} onOpen={onOpen} onClose={jest.fn()} />);
    expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
    expect(texts(tree)).toEqual(expect.arrayContaining(['1 · Koti means kinds', '3 · Beyond the count']));
    const row = press(tree, 'page-jump-page-3');
    expect(row.props.accessibilityLabel).toBe('Page 3. Beyond the count');
    expect(StyleSheet.flatten(row.props.style)).toMatchObject({ minHeight: 48, flexBasis: '100%' });
    act(() => row.props.onPress());
    act(() => press(tree, 'page-jump-open').props.onPress());
    expect(onOpen).toHaveBeenCalledWith(3);
  });

  test.each([['en', 'Go to page', 'Cancel'], ['hi', 'पृष्ठ पर जाएँ', 'रद्द करें'], ['gu', 'પૃષ્ઠ પર જાઓ', 'રદ કરો'], ['kn', 'ಪುಟಕ್ಕೆ ಹೋಗಿ', 'ರದ್ದುಮಾಡಿ']] as const)(
    'is fully localized in %s', async (lang, heading, cancel) => {
      const tree = await render(<PageJumpSheet current={1} total={8} onOpen={jest.fn()} onClose={jest.fn()} />, lang);
      expect(texts(tree)).toEqual(expect.arrayContaining([heading, cancel]));
    });
});

describe('useReaderJump', () => {
  test('stops hands-free reading on open and moves the pager past a previous-chapter card', () => {
    const scrollToIndex = jest.fn();
    const setCurrentIndex = jest.fn();
    const readAloud = { stop: jest.fn() };
    const autoSlide = { stop: jest.fn() };
    const jump = useReaderJump({ listRef: { current: { scrollToIndex } }, offset: 1, setCurrentIndex, readAloud, autoSlide });
    jump.onOpen();
    expect(readAloud.stop).toHaveBeenCalledTimes(1);
    expect(autoSlide.stop).toHaveBeenCalledTimes(1);
    jump.onJump(7);
    expect(setCurrentIndex).toHaveBeenCalledWith(6);
    expect(scrollToIndex).toHaveBeenCalledWith({ index: 7, animated: false });
  });
});

// RULEBOOK §3 "Reader page counter": a hand-rolled counter cannot jump, so no
// screen may draw one. New readers are covered automatically.
describe('every paged reader uses the shared counter', () => {
  const screens = path.resolve(__dirname, '..', '..', 'screens');
  const files = fs.readdirSync(screens).filter(name => name.endsWith('.tsx'));
  const read = (name: string) => fs.readFileSync(path.join(screens, name), 'utf8');

  test('no screen styles its own page counter', () => {
    expect(files.filter(name => read(name).includes('typography.pageCounter'))).toEqual([]);
  });

  test('each reader screen with a ReaderHeader counter renders ReaderPageCounter', () => {
    const readers = files.filter(name => /ReaderScreen\.tsx$/.test(name));
    expect(readers.length).toBeGreaterThanOrEqual(27);
    expect(readers.filter(name => !read(name).includes('<ReaderPageCounter'))).toEqual([]);
  });
});

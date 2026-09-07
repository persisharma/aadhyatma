import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, ScrollView, Text } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';
import LensPickerSheet from '../LensPickerSheet';

const mockSetLenses = jest.fn();
jest.mock('@/panchang/usePanchang', () => ({
  useObservanceLenses: () => [['jain'], mockSetLenses],
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

function render(lang: 'hi' | 'en' | 'gu' | 'kn' = 'en', group?: 'state' | 'tradition') {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <GitaLanguageProvider initialLang={lang}>
          <LensPickerSheet visible group={group} onClose={() => undefined} />
        </GitaLanguageProvider>
      </ThemeProvider>
    );
  });
  return tree;
}

const rowIds = (tree: TestRenderer.ReactTestRenderer) => {
  const candidates = tree.root.findAll((node) => node.props.testID?.startsWith('lens-row-'));
  return [...new Set(candidates.map((node) => node.props.testID as string))];
};

afterEach(() => mockSetLenses.mockClear());

test('renders fifteen grouped 44-point-or-larger checkbox controls when unscoped', () => {
  const tree = render();
  const candidates = tree.root.findAll((node) => node.props.testID?.startsWith('lens-row-'));
  const rows = [...new Set(candidates.map((node) => node.props.testID as string))].map((testID) =>
    candidates.find((node) => node.props.testID === testID && typeof node.props.style === 'function')!
  );
  expect(rows).toHaveLength(15);
  expect(rows.every((row) => row.props.accessibilityRole === 'checkbox')).toBe(true);
  expect(rows.every((row) => row.props.style({ pressed: false }).some((style: object) => ((style as { minHeight?: number }).minHeight ?? 0) >= 44))).toBe(true);
  const copy = tree.root.findAllByType(Text).map((node) => node.props.children).flat(Infinity).join(' ');
  expect(copy).toContain('By state · region');
  expect(copy).toContain('By tradition');
});

test('scopes to only the tradition section when group="tradition"', () => {
  const tree = render('en', 'tradition');
  expect(rowIds(tree).sort()).toEqual([
    'lens-row-gaudiya', 'lens-row-jain', 'lens-row-pushtimarg', 'lens-row-shaiva', 'lens-row-sri-vaishnava',
  ]);
  const copy = tree.root.findAllByType(Text).map((node) => node.props.children).flat(Infinity).join(' ');
  expect(copy).toContain('By tradition');
  expect(copy).not.toContain('By state · region');
  expect(copy).toContain('Tradition calendars');
});

test('scopes to only the ten state rows when group="state"', () => {
  const tree = render('en', 'state');
  const ids = rowIds(tree);
  expect(ids).toHaveLength(10);
  expect(ids).not.toContain('lens-row-jain');
  const copy = tree.root.findAllByType(Text).map((node) => node.props.children).flat(Infinity).join(' ');
  expect(copy).toContain('By state · region');
  expect(copy).not.toContain('By tradition');
});

test('reports checked state and toggles without a select-all shortcut', () => {
  const tree = render();
  const jain = tree.root.findByProps({ testID: 'lens-row-jain' });
  const tamil = tree.root.findByProps({ testID: 'lens-row-tamil' });
  expect(jain.props.accessibilityState).toEqual({ checked: true });
  expect(tamil.props.accessibilityState).toEqual({ checked: false });
  act(() => tamil.props.onPress());
  expect(mockSetLenses).toHaveBeenCalledWith(['jain', 'tamil']);
  expect(tree.root.findAllByType(Pressable).some((node) => /select all/i.test(node.props.accessibilityLabel ?? ''))).toBe(false);
});

test('Gujarati and Kannada render from the four-language content path', () => {
  const gu = render('gu').root.findAllByType(Text).map((node) => node.props.children).flat(Infinity).join(' ');
  const kn = render('kn').root.findAllByType(Text).map((node) => node.props.children).flat(Infinity).join(' ');
  expect(gu).toContain('રાજસ્થાન');
  expect(kn).toContain('ರಾಜಸ್ಥಾನ');
});

test('keeps every option reachable when text wraps on a small screen or at large Dynamic Type', () => {
  const tree = render();
  expect(tree.root.findAllByType(ScrollView)).toHaveLength(1);
  const row = tree.root.findByProps({ testID: 'lens-row-assam-northeast' });
  expect(row.findAllByType(Text).every((node) => node.props.numberOfLines == null)).toBe(true);
  expect(row.props.style({ pressed: false }).some((style: object) => (style as { height?: number }).height != null)).toBe(false);
});

import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

import { GitaLanguageProvider } from '@/data/gita/language';
import { computeKundali, type KundaliChart } from '@/panchang/kundali';

const mockNavigation = { goBack: jest.fn(), navigate: jest.fn() };
const mockRootNavigate = jest.fn();

const adultChart = computeKundali({
  date: new Date('1992-08-14T00:12:00.000Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  elevation: 500,
  timezone: 'Asia/Kolkata',
});
const childChart = computeKundali({
  date: new Date('2013-08-10T05:00:00.000Z'),
  latitude: 26.9124,
  longitude: 75.7873,
  timezone: 'Asia/Kolkata',
});

let mockKundaliState: {
  profile: unknown;
  chart: KundaliChart | null;
  hydrated: boolean;
  loadState: 'loading' | 'guest' | 'saved' | 'error';
} = { profile: null, chart: null, hydrated: true, loadState: 'guest' };

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => mockReact.useEffect(callback, [callback]),
  useNavigation: () => ({ navigate: mockRootNavigate }),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@/panchang/useKundali', () => ({
  ...jest.requireActual('@/panchang/useKundali'),
  useKundali: () => mockKundaliState,
}));

const PrashnaScreen = jest.requireActual<typeof import('../PrashnaScreen')>('../PrashnaScreen').default;

function render(params?: { purposeId?: string; questionId?: string }, lang: 'hi' | 'en' = 'en') {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <PrashnaScreen
          navigation={mockNavigation as any}
          route={{ key: 'Prashna-test', name: 'Prashna', params } as any}
        />
      </GitaLanguageProvider>
    );
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

const byTestId = (tree: TestRenderer.ReactTestRenderer, id: string) =>
  tree.root.findAll((node) => node.props.testID === id && typeof node.type !== 'string');

test('guest state explains the requirement and offers Create Kundali', () => {
  mockKundaliState = { profile: null, chart: null, hydrated: true, loadState: 'guest' };
  const tree = render();
  assert.ok(textOf(tree).includes('answers from your birth chart'));
  act(() => {
    tree.root.findByProps({ accessibilityLabel: 'Create Kundali' }).props.onPress();
  });
  assert.ok(mockRootNavigate.mock.calls.some((call) => call[0] === 'Kundali'));
  act(() => tree.unmount());
});

test('an adult chart leads with guidance and expands technical evidence on request', () => {
  mockKundaliState = {
    profile: { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: adultChart,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = render();
  const text = textOf(tree);
  assert.ok(text.includes('Aarav'));
  for (const id of ['vidya', 'vyapar', 'naukri', 'dhan', 'vivah', 'santan', 'swasthya', 'yatra', 'man']) {
    const tile = byTestId(tree, `purpose-${id}`)[0];
    assert.ok(tile, `purpose tile ${id}`);
    assert.equal(tile.props.accessibilityState.disabled, false, `${id} open for an adult`);
  }
  assert.ok(!text.includes('From age 18'));
  for (const label of ['What direction fits study now?', 'Why this answer', 'What to do now', 'Next period change']) assert.ok(text.includes(label));
  assert.ok(byTestId(tree, 'prashna-saar').length > 0);
  assert.equal(byTestId(tree, 'prashna-strength').length, 0);
  assert.equal(byTestId(tree, 'prashna-chain-0').length, 0);
  act(() => byTestId(tree, 'prashna-basis-toggle')[0].props.onPress());
  assert.equal(byTestId(tree, 'prashna-strength').length, 0);
  assert.ok(byTestId(tree, 'prashna-chain-0').length > 0);
  assert.match(text, /\d{1,2} [A-Z][a-z]{2} \d{4}\s+→\s+\d{1,2} [A-Z][a-z]{2} \d{4}/, 'dated window');
  assert.doesNotMatch(text, /\b(?:\d*[02-9])?[123]th bhava/);
  act(() => tree.unmount());
});

test('switching to business recomposes the answer and offers the Muhurat hand-off', () => {
  mockKundaliState = {
    profile: { name: 'Aarav', date: '1992-08-14', time: '05:42', cityId: 'ujjain' },
    chart: adultChart,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = render();
  const before = textOf(tree);
  assert.equal(tree.root.findAll((node) => node.props.accessibilityLabel === 'Open Muhurat finder').length, 0);
  act(() => {
    byTestId(tree, 'purpose-vyapar')[0].props.onPress();
  });
  const after = textOf(tree);
  assert.notEqual(before, after, 'answer recomposed');
  const muhurat = tree.root.findAll((node) => node.props.accessibilityLabel === 'Open Muhurat finder' && typeof node.props.onPress === 'function');
  assert.ok(muhurat.length > 0, 'business offers the Muhurat finder');
  act(() => muhurat[0].props.onPress());
  assert.ok(mockRootNavigate.mock.calls.some((call) => call[0] === 'MuhuratFinder'));
  act(() => tree.unmount());
});

test("a 13-year-old's chart dims the five adult purposes with their reason and shows no reading for them", () => {
  mockKundaliState = {
    profile: { name: 'Aaradhya', date: '2013-08-10', time: '10:30', cityId: 'jaipur' },
    chart: childChart,
    hydrated: true,
    loadState: 'saved',
  };
  const tree = render({ purposeId: 'vyapar' });
  const text = textOf(tree);
  for (const id of ['vyapar', 'naukri', 'dhan']) {
    assert.equal(byTestId(tree, `purpose-${id}`)[0].props.accessibilityState.disabled, true, `${id} closed`);
  }
  for (const id of ['vivah', 'santan']) {
    assert.equal(byTestId(tree, `purpose-${id}`)[0].props.accessibilityState.disabled, true, `${id} closed`);
  }
  for (const id of ['vidya', 'swasthya', 'yatra', 'man']) {
    assert.equal(byTestId(tree, `purpose-${id}`)[0].props.accessibilityState.disabled, false, `${id} open`);
  }
  assert.ok(text.includes('From age 18') && text.includes('From age 21'));
  // A closed purpose preselected by deep link shows the gate, never a reading.
  assert.ok(text.includes('read only from age 18'));
  assert.equal(byTestId(tree, 'prashna-saar').length, 0, 'no सार for a closed purpose');
  assert.equal(byTestId(tree, 'prashna-strength').length, 0);
  // Moving to an open purpose renders the parent-facing register.
  act(() => {
    byTestId(tree, 'purpose-vidya')[0].props.onPress();
  });
  const study = textOf(tree);
  assert.ok(byTestId(tree, 'prashna-saar').length > 0);
  assert.ok(study.includes('For a parent:'));
  act(() => tree.unmount());
});


test('career question changes phase guidance, clears basis and keeps report context', () => {
  mockKundaliState = { profile: { name: 'Aarav' }, chart: adultChart, hydrated: true, loadState: 'saved' };
  const tree = render({ purposeId: 'naukri' });
  act(() => byTestId(tree, 'question-job-first')[0].props.onPress());
  const first = textOf(tree);
  assert.ok(first.includes('How should I approach my first job?'));
  assert.ok(first.includes('Why this answer'));
  assert.ok(!first.includes('A practical plan'));
  act(() => byTestId(tree, 'prashna-basis-toggle')[0].props.onPress());
  assert.ok(byTestId(tree, 'prashna-chain-0').length);
  act(() => byTestId(tree, 'question-job-switch')[0].props.onPress());
  assert.notEqual(textOf(tree), first);
  assert.ok(textOf(tree).includes('Should I change jobs?'));
  assert.ok(textOf(tree).includes('In favour'));
  assert.ok(textOf(tree).includes('Reasons to pause'));
  assert.ok(byTestId(tree, 'phase-for-natal-10').length || byTestId(tree, 'phase-for-dasha-maha').length || byTestId(tree, 'phase-for-dasha-antar').length);
  assert.equal(byTestId(tree, 'prashna-chain-0').length, 0);
  const link = tree.root.findAll(n => n.props.accessibilityLabel === 'Open full Kundali reading' && typeof n.props.onPress === 'function')[0];
  act(() => link.props.onPress());
  assert.ok(mockRootNavigate.mock.calls.some(c => c[0] === 'KundaliReport' && c[1]?.prashnaContext?.questionId === 'job-switch'));
  act(() => byTestId(tree, 'purpose-vidya')[0].props.onPress());
  assert.equal(byTestId(tree, 'question-general')[0].props.accessibilityState.selected, true);
  act(() => tree.unmount());
});

test('Hindi job-switch answer leads with a decision and explains both sides', () => {
  mockKundaliState = { profile: { name: 'Aarav' }, chart: adultChart, hydrated: true, loadState: 'saved' };
  const tree = render({ purposeId: 'naukri' }, 'hi');
  act(() => byTestId(tree, 'question-job-switch')[0].props.onPress());
  const text = textOf(tree);
  assert.ok(text.includes('नौकरी बदलूँ?'));
  assert.ok(text.includes('पक्ष में'));
  assert.ok(text.includes('सावधानी का कारण'));
  assert.ok(text.includes('अब क्या करें'));
  assert.match(text, /जन्मकुंडली:|आज का गोचर:|चल रही महादशा:/);
  act(() => tree.unmount());
});

test('study, money, marriage and travel use the same decision layout and keep their hand-offs', () => {
  mockKundaliState = { profile: { name: 'Aarav' }, chart: adultChart, hydrated: true, loadState: 'saved' };
  const tree = render({ purposeId: 'vidya' });
  const prompts = [
    ['vidya', 'What direction fits study now?'],
    ['dhan', 'What should I do about money now?'],
    ['vivah', 'How should I approach marriage now?'],
    ['yatra', 'How should I approach travel or relocation?'],
  ] as const;
  for (const [purpose, prompt] of prompts) {
    act(() => byTestId(tree, `purpose-${purpose}`)[0].props.onPress());
    const text = textOf(tree);
    assert.ok(text.includes(prompt), purpose);
    assert.ok(text.includes('In favour') && text.includes('Reasons to pause') && text.includes('What to do now'), purpose);
  }
  assert.ok(tree.root.findAll(n => n.props.accessibilityLabel === 'Open Muhurat finder' && typeof n.props.onPress === 'function').length);
  act(() => byTestId(tree, 'purpose-vivah')[0].props.onPress());
  assert.ok(tree.root.findAll(n => n.props.accessibilityLabel === 'Open Guna Milan' && typeof n.props.onPress === 'function').length);
  act(() => tree.unmount());
});

test('health, mind and fertility lead with their boundary and no timed decision', () => {
  mockKundaliState = { profile: { name: 'Aarav' }, chart: adultChart, hydrated: true, loadState: 'saved' };
  const tree = render({ purposeId: 'swasthya' });
  for (const [purpose, headline] of [
    ['swasthya', 'A chart cannot assess health or symptoms.'],
    ['man', 'A chart cannot assess mental health.'],
    ['santan', 'A chart cannot establish fertility or its timing.'],
  ]) {
    act(() => byTestId(tree, `purpose-${purpose}`)[0].props.onPress());
    const text = textOf(tree);
    assert.ok(text.includes(headline), purpose);
    assert.ok(!text.includes('Why this answer'), purpose);
  }
  act(() => tree.unmount());
});

test('Ask hand-off opens the selected job-switch answer directly', () => {
  mockKundaliState = { profile: { name: 'Aarav' }, chart: adultChart, hydrated: true, loadState: 'saved' };
  const tree = render({ purposeId: 'naukri', questionId: 'job-switch' });
  assert.equal(byTestId(tree, 'question-job-switch')[0].props.accessibilityState.selected, true);
  assert.ok(textOf(tree).includes('Should I change jobs?'));
  act(() => tree.unmount());
});

test('changing the active person clears the previous question, checklist and expanded evidence', () => {
  mockKundaliState = { profile: { name: 'Aarav' }, chart: adultChart, hydrated: true, loadState: 'saved' };
  const tree = render({ purposeId: 'vidya' });
  act(() => byTestId(tree, 'question-study-exam')[0].props.onPress());
  act(() => byTestId(tree, 'prashna-basis-toggle')[0].props.onPress());
  mockKundaliState = { profile: { name: 'Aaradhya' }, chart: childChart, hydrated: true, loadState: 'saved' };
  act(() => tree.update(<GitaLanguageProvider initialLang="en"><PrashnaScreen navigation={mockNavigation as any}
    route={{ key: 'Prashna-test', name: 'Prashna', params: { purposeId: 'vidya' } } as any} /></GitaLanguageProvider>));
  assert.equal(byTestId(tree, 'question-general')[0].props.accessibilityState.selected, true);
  assert.equal(byTestId(tree, 'prashna-chain-0').length, 0);
  assert.equal(byTestId(tree, 'action-parent-listen')[0].props.accessibilityState.checked, false);
  assert.ok(textOf(tree).includes('Aaradhya') && textOf(tree).includes('For a parent:'));
  act(() => tree.unmount());
});

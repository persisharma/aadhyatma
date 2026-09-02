/**
 * AskAnswerCard / AskAbstainCard (PRD-25 Phase 1, design.md §67): the answer
 * renders its tag, headline, rows (निषेध rows in the avoid tone), the collapsed
 * working trail, provenance and actions; the primary action fires with its
 * target; the abstain card shows the decline copy for a stance-guard result
 * and did-you-mean chips for an ordinary miss.
 */
import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';
import AskAnswerCard, { AskAbstainCard } from '../AskAnswerCard';
import type { AskAnswer } from '@/ask/types';

jest.mock('expo-linear-gradient', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>) =>
      ReactLib.createElement(View, p, children),
  };
});

const answer: AskAnswer = {
  intentId: 'bhog.offer',
  family: 'bhog',
  tag: { hi: 'नैवेद्य · श्री गणेश', en: 'Naivedya' },
  headline: { hi: 'श्री गणेश का नैवेद्य', en: 'Naivedya for Shri Ganesha' },
  lines: [
    { label: { hi: 'अर्पित', en: 'Offer' }, value: { hi: 'मोदक या लड्डू', en: 'Modak or laddoo' } },
    { label: { hi: 'न चढ़ाएँ', en: 'Do not offer' }, value: { hi: 'तुलसी', en: 'Tulsi' }, tone: 'avoid' },
  ],
  working: ['deity ganesha → bhogId ganesha-bhog (status: verified)'],
  provenance: { hi: 'स्रोत-सत्यापित', en: 'Source-verified' },
  actions: [
    { label: { hi: 'व्रत विवरण', en: 'Observance' }, target: { tab: 'panchang', screen: 'ObservanceDetail', params: { ruleId: 'ganesh-chaturthi' } } },
    { label: { hi: 'पूजा विधि', en: 'Puja vidhi' }, target: { tab: 'home', screen: 'VidhiDetail', params: { vidhiId: 'ganesh-chaturthi-sthapana' } } },
  ],
  confidence: 'exact',
};

const texts = (r: ReactTestRenderer) => r.root.findAllByType(Text).map((t) => String(t.props.children ?? '').trim());
const flat = (r: ReactTestRenderer) => r.root.findAllByType(Text).map((t) => (Array.isArray(t.props.children) ? t.props.children.join('') : String(t.props.children ?? ''))).join('\n');

let tree: ReactTestRenderer | null = null;
afterEach(() => {
  act(() => tree?.unmount());
  tree = null;
});

test('renders tag, headline, rows, provenance and actions in Hindi', () => {
  const onAction = jest.fn();
  act(() => {
    tree = create(<AskAnswerCard answer={answer} lang="hi" onAction={onAction} />);
  });
  const all = flat(tree!);
  expect(all).toContain('नैवेद्य · श्री गणेश');
  expect(all).toContain('श्री गणेश का नैवेद्य');
  expect(all).toContain('मोदक या लड्डू');
  expect(all).toContain('तुलसी');
  expect(all).toContain('स्रोत-सत्यापित');
  expect(all).toContain('व्रत विवरण');
  // The working trail is collapsed until asked for.
  expect(all).not.toContain('bhogId ganesha-bhog');
});

test('the working trail expands on tap and the primary action fires with its target', () => {
  const onAction = jest.fn();
  act(() => {
    tree = create(<AskAnswerCard answer={answer} lang="en" onAction={onAction} />);
  });
  const toggle = tree!.root.findByProps({ accessibilityLabel: 'Show the working' });
  act(() => toggle.props.onPress());
  expect(flat(tree!)).toContain('bhogId ganesha-bhog');

  const primary = tree!.root.findByProps({ accessibilityLabel: 'Observance' });
  act(() => primary.props.onPress());
  expect(onAction).toHaveBeenCalledWith({ tab: 'panchang', screen: 'ObservanceDetail', params: { ruleId: 'ganesh-chaturthi' } });
});

test('English rendering uses the English half of every Localized string', () => {
  act(() => {
    tree = create(<AskAnswerCard answer={answer} lang="en" onAction={() => undefined} />);
  });
  const all = texts(tree!);
  expect(all).toContain('Naivedya for Shri Ganesha');
  expect(all).toContain('Modak or laddoo');
  expect(all).not.toContain('श्री गणेश का नैवेद्य');
});

test('abstain: an ordinary miss offers did-you-mean chips that re-ask', () => {
  const onSuggestion = jest.fn();
  act(() => {
    tree = create(
      <AskAbstainCard
        kind="none"
        lang="hi"
        libraryEmpty={false}
        onSuggestion={onSuggestion}
        suggestions={[{ question: { hi: 'एकादशी कब है?', en: 'When is Ekadashi?' } }]}
      />
    );
  });
  expect(flat(tree!)).toContain('इसका उत्तर अभी नहीं दे सकते।');
  const chip = tree!.root.findByProps({ accessibilityLabel: 'Ask: When is Ekadashi?' });
  act(() => chip.props.onPress());
  expect(onSuggestion).toHaveBeenCalledWith('एकादशी कब है?');
});

test('abstain: a stance-guard decline carries its own copy and no chips', () => {
  act(() => {
    tree = create(<AskAbstainCard kind="declined" lang="en" libraryEmpty onSuggestion={() => undefined} suggestions={[]} />);
  });
  const all = flat(tree!);
  expect(all).toContain('Vedansh does not answer those');
  expect(all).not.toContain('Perhaps you meant');
});

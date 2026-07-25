import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import DeityCard from '@/components/DeityCard';
import { GitaLanguageProvider } from '@/data/gita/language';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi">{node}</GitaLanguageProvider>);
  });
  return tree;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

describe('DeityCard NEW badge', () => {
  test('card with hasNew renders the NEW badge', () => {
    const tree = render(
      <DeityCard nameHi="शिव" nameEn="Shiva" itemCount="3 texts" hasNew onPress={() => undefined} />
    );
    expect(textOf(tree)).toMatch(/NEW/);
  });

  test('card without hasNew renders no NEW badge', () => {
    const tree = render(
      <DeityCard nameHi="शिव" nameEn="Shiva" itemCount="3 texts" onPress={() => undefined} />
    );
    expect(textOf(tree)).not.toMatch(/NEW/);
  });

  test('hasNew card includes " New." in its accessibility label', () => {
    const tree = render(
      <DeityCard nameHi="शिव" nameEn="Shiva" itemCount="3 texts" hasNew onPress={() => undefined} />
    );
    const labelled = tree.root.findAll(
      (n) =>
        typeof n.props?.accessibilityLabel === 'string' &&
        n.props.accessibilityLabel.includes('Shiva')
    );
    expect(labelled.length).toBeGreaterThan(0);
    expect(labelled[0].props.accessibilityLabel).toMatch(/New\./);
  });
});

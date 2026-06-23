import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import FeatureCard, { type FeatureSpotlight } from '@/components/FeatureCard';
import { GitaLanguageProvider } from '@/data/gita/language';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

const item: FeatureSpotlight = {
  key: 'daily-bhakti',
  eyebrowHi: 'आज',
  eyebrowEn: 'Today',
  titleHi: 'दैनिक भक्ति',
  titleEn: 'Daily Verse',
  descHi: 'हर दिन एक नया श्लोक।',
  descEn: 'A fresh shloka every day.',
  ctaHi: 'पढ़ें',
  ctaEn: 'Read',
  icon: null,
};

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<GitaLanguageProvider>{node}</GitaLanguageProvider>);
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

describe('FeatureCard', () => {
  test('renders eyebrow, both title scripts, description and CTA', () => {
    const tree = render(<FeatureCard item={item} width={300} onPress={() => undefined} />);
    const text = textOf(tree);
    expect(text).toMatch(/आज/); // eyebrow (hi default)
    expect(text).toMatch(/दैनिक भक्ति/); // primary title
    expect(text).toMatch(/Daily Verse/); // demoted secondary title
    expect(text).toMatch(/श्लोक/); // description
    expect(text).toMatch(/पढ़ें/); // CTA
  });

  test('hasNew swaps the eyebrow tag for a NEW badge', () => {
    const tree = render(
      <FeatureCard item={{ ...item, hasNew: true }} width={300} onPress={() => undefined} />
    );
    const text = textOf(tree);
    expect(text).toMatch(/NEW/);
    expect(text).not.toMatch(/आज/); // eyebrow replaced by the badge
  });

  test('fires onPress and carries an English accessibility label', () => {
    const onPress = jest.fn();
    const tree = render(<FeatureCard item={item} width={300} onPress={onPress} />);
    const pressable = tree.root.find(
      (n) =>
        typeof n.props?.accessibilityLabel === 'string' &&
        n.props.accessibilityLabel.includes('Daily Verse')
    );
    act(() => {
      pressable.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(pressable.props.accessibilityLabel).toMatch(/Tap to open\./);
  });
});

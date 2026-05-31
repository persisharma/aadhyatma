import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import CategoryCard from '@/components/CategoryCard';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

function render(node: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
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

describe('CategoryCard NEW badge', () => {
  test('active tile with hasNew renders the NEW badge', () => {
    const tree = render(
      <CategoryCard nameHi="स्तोत्रम्" nameEn="Hymns & Praise" status="active" hasNew onPress={() => undefined} />
    );
    expect(textOf(tree)).toMatch(/NEW/);
  });

  test('active tile without hasNew renders no NEW badge', () => {
    const tree = render(
      <CategoryCard nameHi="स्तोत्रम्" nameEn="Hymns & Praise" status="active" onPress={() => undefined} />
    );
    expect(textOf(tree)).not.toMatch(/NEW/);
  });

  test('hasNew active tile includes " New." in its accessibility label', () => {
    const tree = render(
      <CategoryCard nameHi="स्तोत्रम्" nameEn="Hymns & Praise" status="active" hasNew onPress={() => undefined} />
    );
    const labelled = tree.root.findAll(
      (n) =>
        typeof n.props?.accessibilityLabel === 'string' &&
        n.props.accessibilityLabel.includes('Hymns & Praise')
    );
    expect(labelled.length).toBeGreaterThan(0);
    expect(labelled[0].props.accessibilityLabel).toMatch(/New\./);
  });

  test('inactive (coming) tile shows SOON, never NEW', () => {
    const tree = render(<CategoryCard nameHi="आगामी" nameEn="Coming Soon" status="coming" hasNew />);
    const text = textOf(tree);
    expect(text).toMatch(/SOON/);
    expect(text).not.toMatch(/NEW/);
  });
});

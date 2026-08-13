import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';

import ObservanceDetailHero from '@/components/ObservanceDetailHero';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
});

async function render(node: React.ReactNode): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="hi">{node}</GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  trees.push(tree);
  return tree;
}

function renderedText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root.findAllByType(Text).map((node) => node.props.children).flat(Infinity).join(' ');
}

describe('ObservanceDetailHero', () => {
  test('renders the leading slot, caption, and next-date pill', async () => {
    const tree = await render(
      <ObservanceDetailHero
        leading={<Text>॥ ॐ ॥</Text>}
        title="पिताजी"
        caption={<Text>श्राद्ध तिथि: माघ कृष्ण अष्टमी</Text>}
        nextLabel="अगला · 31 जनवरी 2027"
        layout="smaran"
      />
    );

    expect(renderedText(tree)).toContain('॥ ॐ ॥');
    expect(renderedText(tree)).toContain('पिताजी');
    expect(renderedText(tree)).toContain('श्राद्ध तिथि: माघ कृष्ण अष्टमी');
    expect(renderedText(tree)).toContain('अगला · 31 जनवरी 2027');
    const pill = tree.root.findAll((node) => {
      const style = StyleSheet.flatten(node.props.style);
      return typeof node.type === 'string' && style?.paddingHorizontal === 16 && style?.paddingVertical === 7;
    });
    expect(pill).toHaveLength(1);
  });

  test('keeps optional slots absent for a title-only hero', async () => {
    const tree = await render(<ObservanceDetailHero title="एकादशी" />);
    expect(tree.root.findAllByType(Text)).toHaveLength(1);
    expect(renderedText(tree)).toBe('एकादशी');
  });
});

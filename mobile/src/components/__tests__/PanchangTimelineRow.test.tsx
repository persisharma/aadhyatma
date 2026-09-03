import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text, View } from 'react-native';

import PanchangTimelineRow from '@/components/PanchangTimelineRow';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';
import { lightColors } from '@/theme/colors';

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

describe('PanchangTimelineRow', () => {
  test('renders marker, date, title, and multiple family lines', async () => {
    const tree = await render(
      <PanchangTimelineRow
        markerColor={lightColors.saffron}
        dateLabel="14 सित"
        title="अष्टमी श्राद्ध"
        secondary={['॥ पिताजी', '॥ दादाजी']}
        accessibilityLabel="14 September, Ashtami Shraddha, Father, Grandfather"
        density="comfortable"
      />
    );

    const text = tree.root.findAllByType(Text).map((node) => node.props.children);
    expect(text).toEqual(['14 सित', 'अष्टमी श्राद्ध', '॥ पिताजी', '॥ दादाजी']);
    const marker = tree.root.findAllByType(View).filter((node) => {
      const style = StyleSheet.flatten(node.props.style);
      return style?.width === 8 && style?.height === 8 && style?.backgroundColor === lightColors.saffron;
    });
    expect(marker).toHaveLength(1);
  });

  test('omits secondary copy and the final divider when requested', async () => {
    const tree = await render(
      <PanchangTimelineRow
        markerColor={lightColors.gold}
        dateLabel="21 सित"
        title="सर्वपितृ अमावस्या"
        showDivider={false}
      />
    );

    expect(tree.root.findAllByType(Text)).toHaveLength(2);
    const row = tree.root.findAll((node) => StyleSheet.flatten(node.props.style)?.paddingVertical === 6)[0];
    expect(StyleSheet.flatten(row.props.style).borderBottomColor).toBe('transparent');
  });
});

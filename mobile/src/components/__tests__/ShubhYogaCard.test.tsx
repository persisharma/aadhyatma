import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';

import MuhuratChip from '@/components/MuhuratChip';
import ShubhYogaCard from '@/components/ShubhYogaCard';
import { SHUBH_YOGA_LABELS, type ShubhYogaWindow } from '@/panchang/shubhYoga';
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

function window(key: ShubhYogaWindow['key'], start: Date, end: Date, fromSunrise: boolean): ShubhYogaWindow {
  return { key, nameHi: SHUBH_YOGA_LABELS[key].hi, nameEn: SHUBH_YOGA_LABELS[key].en, start, end, fromSunrise };
}

const allText = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)))
    .join('\n');

describe('MuhuratChip', () => {
  test('yoga and dosha tones share the component and differ by tint + deep text colour', async () => {
    const tree = await render(
      <>
        <MuhuratChip label="सर्वार्थ सिद्धि योग" tone="yoga" testID="chip-yoga" />
        <MuhuratChip label="भद्रा (विष्टि करण)" tone="dosha" testID="chip-dosha" />
      </>
    );
    const styleOf = (id: string) =>
      StyleSheet.flatten(tree.root.findAll((n) => n.props.testID === id && n.type === Text)[0].props.style);
    const yoga = styleOf('chip-yoga');
    const dosha = styleOf('chip-dosha');
    expect(yoga.backgroundColor).toBe(lightColors.goldChipBg);
    expect(yoga.color).toBe(lightColors.saffronDeep);
    expect(dosha.backgroundColor).toBe(lightColors.avoidChipBg);
    expect(dosha.color).toBe(lightColors.avoidDeep);
  });
});

describe('ShubhYogaCard', () => {
  test('renders nothing at all when no yoga forms (absent is the answer, zero chrome)', async () => {
    const tree = await render(<ShubhYogaCard yogas={[]} referenceDay={new Date(2026, 9, 14)} />);
    expect(tree.root.findAll((n) => n.props.testID === 'shubh-yoga-card')).toHaveLength(0);
    expect(tree.root.findAllByType(Text)).toHaveLength(0);
  });

  test('a past-midnight end carries the formatEndInstant short-date suffix, never a 26:12 clock', async () => {
    const referenceDay = new Date(2026, 9, 14);
    const start = new Date(2026, 9, 14, 6, 30);
    const end = new Date(2026, 9, 15, 2, 12); // ends the NEXT civil morning
    const tree = await render(
      <ShubhYogaCard yogas={[window('sarvartha-siddhi', start, end, true)]} referenceDay={referenceDay} />
    );
    const text = allText(tree);
    expect(text).toContain('सर्वार्थ सिद्धि योग');
    expect(text).toContain('शुभ योग'); // the group eyebrow — never the bare योग field label
    expect(text).toContain('2:12 AM, 15 अक्टू');
    expect(text).not.toContain('26:12');
  });

  test('lists every window, in the order given, with its own range', async () => {
    const referenceDay = new Date(2026, 9, 19);
    const tree = await render(
      <ShubhYogaCard
        yogas={[
          window('amrita-siddhi', new Date(2026, 9, 19, 6, 31), new Date(2026, 9, 19, 23, 5), true),
          window('ravi', new Date(2026, 9, 19, 23, 5), new Date(2026, 9, 20, 6, 32), false),
        ]}
        referenceDay={referenceDay}
      />
    );
    const rows = tree.root.findAll(
      (n) =>
        typeof n.type === 'string' && // host nodes only, else composite wrappers double-count
        typeof n.props.testID === 'string' &&
        n.props.testID.startsWith('shubh-yoga-') &&
        n.props.testID !== 'shubh-yoga-card'
    );
    expect(rows.map((n) => n.props.testID)).toEqual(['shubh-yoga-amrita-siddhi', 'shubh-yoga-ravi']);
    const text = allText(tree);
    expect(text).toContain('अमृत सिद्धि योग');
    expect(text).toContain('रवि योग');
    expect(text).toContain('11:05 PM – 6:32 AM, 20 अक्टू');
  });
});

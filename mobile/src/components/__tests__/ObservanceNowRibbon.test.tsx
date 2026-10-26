/**
 * The observance ribbon above the Muhurat card (design.md §33). Before sunrise
 * the Hindu day is still yesterday's, so a festival kept last night is carried
 * over as "<name> night … until sunrise" — the Sharad Purnima case, kept at
 * nishita on the 25th and still running at 2 AM on the 26th.
 */
import React from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import ObservanceNowRibbon from '../ObservanceNowRibbon';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import type { ResolvedObservance } from '@/panchang/types';

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);

const item = (id: string, nameEn: string, deityEn: string, kathaId?: string): ResolvedObservance =>
  ({
    date: new Date(2026, 9, 25),
    rule: { id, nameHi: nameEn, nameEn, deityHi: deityEn, deityEn, kathaId },
  }) as unknown as ResolvedObservance;

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach((tree) => tree.unmount()));
});

async function render(items: ResolvedObservance[], tonight: boolean, onOpen = jest.fn()) {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang="en">
            <ObservanceNowRibbon items={items} tonight={tonight} sunrise={new Date(2026, 9, 26, 6, 11)} tithiIndex={14} onOpen={onOpen} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  trees.push(tree);
  return tree;
}

const texts = (tree: TestRenderer.ReactTestRenderer): string =>
  tree.root.findAllByType(Text)
    .flatMap((node) => node.findAll((n) => typeof n.props.children === 'string').map((n) => n.props.children as string))
    .join(' ');

test('before sunrise, last night\'s festival is carried over until sunrise', async () => {
  const onOpen = jest.fn();
  const tree = await render(
    [item('sharad-purnima', 'Sharad Purnima', 'Chandra Deva', 'k'), item('kojagara-puja', 'Kojagara Puja', 'Lakshmi')],
    true,
    onOpen
  );
  const out = texts(tree);
  expect(out).toContain('Sharad Purnima night');
  expect(out).toContain('Chandra Deva · until sunrise 6:11 AM');
  expect(out).toContain('+1');
  // Pressable is a memo'd forwardRef, so find the press target by its props.
  const ribbon = tree.root.findAll((n) => n.props.testID === 'observance-now-ribbon' && typeof n.props.onPress === 'function')[0];
  await act(async () => ribbon.props.onPress());
  expect(onOpen).toHaveBeenCalledWith('sharad-purnima');
});

test('on the day itself it names the observance and offers the katha when there is one', async () => {
  const out = texts(await render([item('valmiki-jayanti', 'Valmiki Jayanti', 'Maharshi Valmiki', 'k')], false));
  expect(out).toContain('Valmiki Jayanti');
  expect(out).not.toContain('night');
  expect(out).toContain('Read the katha');
});

test('nothing renders without an observance', async () => {
  const tree = await render([], false);
  expect(tree.toJSON()).toBeNull();
});

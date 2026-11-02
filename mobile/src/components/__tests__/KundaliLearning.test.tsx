import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import * as Native from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { GitaLanguageProvider } from '@/data/gita/language';
import { computeKundali } from '@/panchang/kundali';
import { KundaliExplorer, KundaliSummary } from '../KundaliLearning';

let mockFactor = 1;
jest.mock('@/contexts/FontScaleContext', () => ({ useFontScale: () => ({ factor: mockFactor, scale: mockFactor > 1 ? 'L' : 'M', isLoading: false, setScale: jest.fn() }) }));
const child = computeKundali({ date: new Date('2024-12-09T19:25:00Z'), latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' });
const adult = computeKundali({ date: new Date('1992-08-14T00:12:00Z'), latitude: 23.1765, longitude: 75.7885, timezone: 'Asia/Kolkata' });
const reference = jest.fn();
const roots: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => { act(() => roots.splice(0).forEach(root => root.unmount())); jest.restoreAllMocks(); mockFactor = 1; });
function render(node: React.ReactNode, lang: 'hi' | 'en' | 'gu' | 'kn' = 'en') {
  let root!: TestRenderer.ReactTestRenderer;
  act(() => { root = TestRenderer.create(<SafeAreaInsetsContext.Provider value={{ top: 0, right: 0, bottom: 20, left: 0 }}><GitaLanguageProvider initialLang={lang}>{node}</GitaLanguageProvider></SafeAreaInsetsContext.Provider>); });
  roots.push(root); return root;
}
const tap = (root: TestRenderer.ReactTestRenderer, props: Record<string, unknown>) => act(() => root.root.findByProps(props).props.onPress());
const text = (root: TestRenderer.ReactTestRenderer) => JSON.stringify(root.toJSON());

test('house 6 explains house 6, while house 1 identifies Virgo', () => {
  const root = render(<KundaliExplorer chart={child} mode="chart" onReference={reference} />);
  tap(root, { testID: 'kundali-house-6' }); expect(text(root)).toContain('House 6 · work and competition');
  tap(root, { accessibilityLabel: 'Done with Kundali explanation' });
  tap(root, { testID: 'kundali-house-1' }); expect(text(root)).toContain('House 1 · you yourself'); expect(text(root)).toContain('Kanya · Virgo');
});

test('empty house explanation follows the ruler and returns through sheet Back', () => {
  const root = render(<KundaliExplorer chart={child} mode="chart" onReference={reference} />);
  tap(root, { testID: 'kundali-house-2' }); expect(text(root)).toContain('Empty houses are normal');
  tap(root, { accessibilityLabel: 'Follow house ruler Venus' }); expect(text(root)).toContain('House 5');
  tap(root, { accessibilityLabel: 'Back in Kundali explanation' }); expect(text(root)).toContain('House 2 · family and savings');
});

test('adult meaning and its basis are reachable; the same door gives minors an introduction', () => {
  const root = render(<KundaliExplorer chart={adult} mode="grahas" onReference={reference} />);
  tap(root, { testID: 'kundali-graha-saturn' });
  expect(root.root.findByProps({ testID: 'kundali-reading-saturn' })).toBeTruthy();
  tap(root, { testID: 'kundali-why-saturn' }); expect(text(root)).toContain('Basis');
  const minor = render(<KundaliExplorer chart={child} mode="grahas" onReference={reference} />);
  tap(minor, { testID: 'kundali-graha-saturn' });
  expect(minor.root.findAllByProps({ testID: 'kundali-reading-saturn' })).toHaveLength(0);
});

test('all three Saar anchors open explanations', () => {
  const root = render(<KundaliSummary chart={child} at={new Date('2026-11-02')} onOpenTab={jest.fn()} />);
  for (const anchor of ['lagna', 'moon', 'nakshatra']) { tap(root, { testID: `kundali-summary-${anchor}` }); tap(root, { accessibilityLabel: 'Done with Kundali explanation' }); }
  expect(text(root)).toContain('Birth nakshatra');
});

describe.each(['hi', 'en', 'gu', 'kn'] as const)('%s reading layout', lang => {
  test.each([1, 1.15])('factor %s keeps all content reachable on compact/enlarged text', factor => {
    mockFactor = factor;
    jest.spyOn(Native, 'useWindowDimensions').mockReturnValue({ width: 320, height: 640, scale: 2, fontScale: 1.8 });
    const root = render(<KundaliExplorer chart={adult} mode="chart" onReference={reference} />, lang);
    expect(root.root.findByProps({ testID: 'kundali-view-picture' }).props.accessibilityState.selected).toBe(true);
    tap(root, { testID: 'kundali-view-topics' });
    for (let house = 1; house <= 12; house++) expect(root.root.findByProps({ testID: `kundali-house-topic-${house}` })).toBeTruthy();
    const grahas = render(<KundaliExplorer chart={adult} mode="grahas" onReference={reference} />, lang);
    for (const position of adult.grahas) {
      const tile = grahas.root.findByProps({ testID: `kundali-graha-${position.graha}` });
      expect(Native.StyleSheet.flatten(tile.props.style).width).toBe('100%');
    }
    tap(grahas, { testID: 'kundali-graha-saturn' });
    expect(grahas.root.findByProps({ accessibilityLabel: 'Done with Kundali explanation' })).toBeTruthy();
    const reading = grahas.root.findByProps({ testID: 'kundali-reading-saturn' });
    expect(reading.findAllByType(Native.Text).every(node => node.props.numberOfLines === undefined)).toBe(true);
  });
});

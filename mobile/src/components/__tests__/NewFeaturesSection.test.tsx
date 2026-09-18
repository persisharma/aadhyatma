/**
 * नया section (TRD-42 §4/§5). Pins the two behaviours the Discover carousel got
 * wrong: nothing renders when there is nothing new, and opening a card clears it.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import NewFeaturesSection from '@/components/NewFeaturesSection';
import { TilePressProvider, useTilePressController } from '@/contexts/TilePressContext';
import type { FeatureFeedEntry } from '@/data/home/featureFeed';

let mockPending: FeatureFeedEntry[] = [];
const mockMarkSeen = jest.fn();
const mockNavigate = jest.fn();
const mockRootNavigate = jest.fn();
let mockUseCount = 0;

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => {
    mockUseCount += 1;
    return mockUseCount % 2 === 1 ? { navigate: mockNavigate } : { navigate: mockRootNavigate };
  },
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@/contexts/FeatureSeenContext', () => ({
  useFeatureSeen: () => ({ isLoading: false, pending: mockPending, markFeatureSeen: mockMarkSeen }),
}));

const entry = (over: Partial<FeatureFeedEntry> = {}): FeatureFeedEntry => ({
  id: 'vastu-disha',
  version: '1.4.8',
  titleHi: 'वास्तु दिशा',
  titleEn: 'Vastu Disha',
  descHi: 'दिशा',
  descEn: 'Directions',
  thumb: 'वा',
  target: { tab: 'more', screen: 'VastuDisha' },
  ...over,
});

function Harness() {
  const controller = useTilePressController();
  return (
    <TilePressProvider value={controller}>
      <NewFeaturesSection />
    </TilePressProvider>
  );
}

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<Harness />);
  });
  return tree;
}

beforeEach(() => {
  mockUseCount = 0;
  mockPending = [];
  mockMarkSeen.mockClear();
  mockNavigate.mockClear();
  mockRootNavigate.mockClear();
});

describe('NewFeaturesSection', () => {
  it('renders nothing at all — not even its heading — when nothing is new', () => {
    // Present-or-absent is the whole vocabulary (§69). There is no "all caught
    // up" state, because that is a sentence nobody needs every morning.
    const tree = render();
    expect(tree.toJSON()).toBeNull();
    act(() => tree.unmount());
  });

  it('shows the heading and the pending cards', () => {
    mockPending = [entry(), entry({ id: 'home-widgets', titleHi: 'विजेट', titleEn: 'Widgets' })];
    const tree = render();
    const text = tree.root
      .findAllByType(Text)
      .map((n) => String(n.props.children ?? ''))
      .join(' | ');
    expect(text).toMatch(/नया/);
    expect(text).toMatch(/वास्तु दिशा/);
    expect(text).toMatch(/विजेट/);
    act(() => tree.unmount());
  });

  it('marks a card seen before navigating, so it cannot come back', () => {
    mockPending = [entry()];
    const tree = render();
    const card = tree.root.find(
      (n) => typeof n.props?.onPress === 'function' && n.props?.accessibilityRole === 'button'
    );
    act(() => card.props.onPress());
    expect(mockMarkSeen).toHaveBeenCalledWith('vastu-disha');
    act(() => tree.unmount());
  });

  it('routes More- and Panchang-bound targets through the initial:false helpers', () => {
    mockPending = [entry(), entry({ id: 'guna', target: { tab: 'panchang', screen: 'GunaMilan' } })];
    const tree = render();
    const cards = tree.root.findAll(
      (n) => typeof n.props?.onPress === 'function' && n.props?.accessibilityRole === 'button'
    );
    act(() => cards.forEach((c) => c.props.onPress()));
    const calls = mockRootNavigate.mock.calls;
    expect(calls.some(([tab, t]) => tab === 'MoreTab' && (t as { initial: boolean }).initial === false)).toBe(true);
    expect(calls.some(([tab, t]) => tab === 'PanchangTab' && (t as { initial: boolean }).initial === false)).toBe(true);
    act(() => tree.unmount());
  });
});

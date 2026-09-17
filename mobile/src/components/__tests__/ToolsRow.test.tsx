/**
 * उपकरण row (TRD-42 §5.2). Pins the two things that made the old scattered
 * arrangement unlearnable: a fixed order, and no lifecycle badge.
 */
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';
import ToolsRow from '@/components/ToolsRow';
import { HOME_TOOLS } from '@/data/home/tools';
import { TilePressProvider, useTilePressController } from '@/contexts/TilePressContext';

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
// ToolsRow calls useNavigation twice: the typed Home nav, then the root nav.
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => {
    mockUseCount += 1;
    return mockUseCount % 2 === 1 ? { navigate: mockNavigate } : { navigate: mockRootNavigate };
  },
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));

function Harness() {
  const controller = useTilePressController();
  return (
    <TilePressProvider value={controller}>
      <ToolsRow />
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
  mockNavigate.mockClear();
  mockRootNavigate.mockClear();
});

describe('ToolsRow', () => {
  it('renders every tool, in registry order', () => {
    const tree = render();
    // CategoryCard nests the same a11y label on several nodes; dedupe in order.
    const labels = [
      ...new Set(
        tree.root
          .findAll((n) => typeof n.props?.accessibilityLabel === 'string' && n.props?.accessibilityRole === 'button')
          .map((n) => n.props.accessibilityLabel as string)
      ),
    ];
    expect(labels).toHaveLength(HOME_TOOLS.length);
    HOME_TOOLS.forEach((tool, i) => {
      expect(labels[i]).toContain(tool.nameEn);
    });
    act(() => tree.unmount());
  });

  it('never shows a NEW badge', () => {
    // The two tiles this row replaced (कुंडली, मुहूर्त) hardcoded hasNew:true in
    // HomeScreen and wore a badge that could never clear. Feature novelty is
    // नया's job, and नया clears itself.
    const tree = render();
    const badges = tree.root.findAll(
      (n) => typeof n.props?.children === 'string' && n.props.children === 'NEW'
    );
    expect(badges).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('carries no पंचांग tile — the Today strip and the tab already open it', () => {
    expect(HOME_TOOLS.find((t) => t.id === ('panchang' as never))).toBeUndefined();
  });

  it('keeps the standing पितृ स्मरण door the Discover card used to provide', () => {
    expect(HOME_TOOLS.find((t) => t.id === 'pitru')).toBeDefined();
  });

  it('cross-tab tools dispatch through the root navigator, in-stack ones do not', () => {
    const tree = render();
    const buttons = tree.root.findAll(
      (n) => typeof n.props?.onPress === 'function' && n.props?.accessibilityRole === 'button'
    );
    act(() => {
      buttons.forEach((b) => b.props.onPress());
    });
    // In-stack: the vidhi catalog must push on the Home stack so Back retraces
    // the Home journey rather than the Panchang calendar.
    expect(mockNavigate).toHaveBeenCalledWith('VidhiCatalog');
    expect(mockNavigate).toHaveBeenCalledWith('TheerthMap', {});
    // Cross-tab: always via the root nav, always with initial:false.
    const crossTab = mockRootNavigate.mock.calls;
    expect(crossTab.some(([tab, target]) => tab === 'PanchangTab' && (target as { initial: boolean }).initial === false)).toBe(true);
    expect(crossTab.some(([tab, target]) => tab === 'MoreTab' && (target as { initial: boolean }).initial === false)).toBe(true);
    act(() => tree.unmount());
  });
});

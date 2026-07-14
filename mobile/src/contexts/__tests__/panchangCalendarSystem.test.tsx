import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import {
  usePanchangCalendarSystem,
  __resetCalendarSystemStoreForTests,
} from '@/panchang/usePanchang';

// Controllable AsyncStorage mock so the hydration race is testable.
let mockResolveGetItem: (value: string | null) => void = () => undefined;
const mockSetItem = jest.fn(() => Promise.resolve());
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(
    () =>
      new Promise<string | null>((resolve) => {
        mockResolveGetItem = resolve;
      })
  ),
  setItem: (...args: unknown[]) => mockSetItem(...(args as [])),
}));
// usePanchang imports PanchangLocationContext → expo-location (untransformed
// ESM); the hook under test never touches it, so stub the module out.
jest.mock('expo-location', () => ({}));

let latestSetter: ((next: 'purnimant' | 'amanta') => void) | null = null;

function Probe({ label }: { label: string }) {
  const [system, setSystem] = usePanchangCalendarSystem();
  latestSetter = setSystem;
  return <Text testID={label}>{`${label}:${system}`}</Text>;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

beforeEach(() => {
  __resetCalendarSystemStoreForTests();
  mockSetItem.mockClear();
  latestSetter = null;
});

describe('usePanchangCalendarSystem (module store)', () => {
  it('propagates a change to every mounted instance immediately', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <>
          <Probe label="panchangTab" />
          <Probe label="homeStrip" />
        </>
      );
    });
    expect(textOf(tree)).toBe('panchangTab:purnimant homeStrip:purnimant');

    act(() => latestSetter!('amanta'));
    // The stale-Home-strip bug: both instances must flip, not just the setter's.
    expect(textOf(tree)).toBe('panchangTab:amanta homeStrip:amanta');
    expect(mockSetItem).toHaveBeenCalledWith('@vedansh:panchang-calendar-system', 'amanta');
  });

  it('hydrates all instances from storage when no explicit choice was made', async () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Probe label="a" />);
    });
    await act(async () => {
      mockResolveGetItem('amanta');
    });
    expect(textOf(tree)).toBe('a:amanta');
  });

  it('a late hydration never clobbers an explicit in-session choice', async () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Probe label="a" />);
    });
    // User chooses purnimant (even as a same-value confirmation) while the
    // storage read is still in flight…
    act(() => latestSetter!('purnimant'));
    // …then the stale stored 'amanta' lands. It must NOT win.
    await act(async () => {
      mockResolveGetItem('amanta');
    });
    expect(textOf(tree)).toBe('a:purnimant');
    // And the explicit choice was persisted.
    expect(mockSetItem).toHaveBeenCalledWith('@vedansh:panchang-calendar-system', 'purnimant');
  });
});

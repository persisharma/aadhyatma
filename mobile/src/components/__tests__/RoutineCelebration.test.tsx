import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import RoutineCelebration from '@/components/RoutineCelebration';
import LotusMark from '@/components/LotusMark';

// react-test-renderer has no native UIManager, so an Animated `useNativeDriver`
// timing would call findNodeHandle on a missing renderer and crash. Mocking the
// helper downgrades these animations to the JS driver for the test.
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

// Count the gradient "petals" by their rendered host View (the mock forwards the
// `colors` array prop). Restrict to host nodes so the mock's composite wrapper
// isn't counted twice.
function gradientCount(tree: TestRenderer.ReactTestRenderer): number {
  return tree.root.findAll(
    (n) => typeof n.type === 'string' && Array.isArray(n.props?.colors)
  ).length;
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});

describe('LotusMark', () => {
  it('renders five fanned petals', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<LotusMark size={30} />);
    });
    expect(gradientCount(tree)).toBe(5);
  });
});

describe('RoutineCelebration', () => {
  it('mounts a full-width shower of layered flowers with the caption, and tears down cleanly', () => {
    const onDone = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<RoutineCelebration caption="साधना पूर्ण · आज" onDone={onDone} />);
    });
    expect(gradientCount(tree)).toBeGreaterThanOrEqual(48);
    const text = tree.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .flat(Number.POSITIVE_INFINITY)
      .join(' ');
    expect(text).toContain('साधना पूर्ण · आज');
    act(() => tree.unmount());
  });

  it('keeps the flower shower slow, then calls onDone once it has fully settled', () => {
    const onDone = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<RoutineCelebration caption="साधना पूर्ण · आज" onDone={onDone} />);
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(2400); // longer than the slower staggered fall + caption fade
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
});

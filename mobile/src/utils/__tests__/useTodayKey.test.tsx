import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, AppState } from 'react-native';
import { useTodayKey } from '../useTodayKey';

function Probe() {
  return <Text>{useTodayKey()}</Text>;
}

function textOf(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join('');
}

describe('useTodayKey', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns today and flips at the midnight tick', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 14, 23, 59, 0));
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Probe />);
    });
    expect(textOf(tree)).toBe(new Date(2026, 6, 14).toDateString());

    // Cross midnight: the scheduled tick (00:00:01) must roll the key over.
    act(() => {
      jest.setSystemTime(new Date(2026, 6, 15, 0, 0, 2));
      jest.advanceTimersByTime(2 * 60_000);
    });
    expect(textOf(tree)).toBe(new Date(2026, 6, 15).toDateString());
  });

  it('re-checks the day when the app returns to the foreground', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 14, 22, 0, 0));
    const listeners: Array<(state: 'active' | 'background') => void> = [];
    const addSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _type: string,
      handler: (state: 'active' | 'background') => void
    ) => {
      listeners.push(handler);
      return { remove: jest.fn() };
    }) as never);

    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<Probe />);
    });
    expect(textOf(tree)).toBe(new Date(2026, 6, 14).toDateString());

    // Backgrounded overnight (timers frozen); on 'active' the key must refresh.
    act(() => {
      jest.setSystemTime(new Date(2026, 6, 15, 7, 30, 0));
      listeners.forEach((l) => l('active'));
    });
    expect(textOf(tree)).toBe(new Date(2026, 6, 15).toDateString());

    addSpy.mockRestore();
  });
});

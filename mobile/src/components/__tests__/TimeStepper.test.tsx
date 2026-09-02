import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import TimeStepper from '../TimeStepper';
import type { TimeOfDay } from '@/notifications/pure';

/**
 * Pins the chevron press semantics: a step fires on PRESS (release), the
 * auto-repeat starts from LONG-PRESS, and nothing fires on press-in — so a
 * scroll drag that merely begins on a chevron (both host screens wrap the
 * stepper in a ScrollView) can never mutate the time.
 */

async function renderStepper(
  value: TimeOfDay,
  onChange: (next: TimeOfDay) => void,
  minuteStep = 1
): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <TimeStepper value={value} onChange={onChange} minuteStep={minuteStep} />
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return tree;
}

function chevron(tree: TestRenderer.ReactTestRenderer, label: string) {
  // The label also sits on the RepeatChevron wrapper — match the node that
  // actually carries the press handlers (the Pressable).
  const node = tree.root
    .findAll(
      (n) =>
        n.props.accessibilityLabel === label &&
        typeof n.props.onPress === 'function'
    )
    .at(0);
  if (!node) throw new Error(`No chevron labelled "${label}"`);
  return node;
}

describe('TimeStepper chevrons', () => {
  test('a tap (onPress) steps exactly once; press-in alone steps nothing', async () => {
    const onChange = jest.fn();
    const tree = await renderStepper({ hour: 6, minute: 0 }, onChange);
    const up = chevron(tree, 'Increase MIN');

    // Press-in (what a scroll drag would trigger before stealing the
    // gesture) must not mutate the time.
    await act(async () => {
      up.props.onPressIn?.();
    });
    expect(onChange).not.toHaveBeenCalled();

    await act(async () => {
      up.props.onPress();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ hour: 6, minute: 1 });

    await act(async () => {
      tree.unmount();
    });
  });

  test('long-press starts the auto-repeat; press-out stops it', async () => {
    jest.useFakeTimers();
    try {
      const onChange = jest.fn();
      const tree = await renderStepper({ hour: 6, minute: 0 }, onChange);
      const up = chevron(tree, 'Increase HR');

      act(() => {
        up.props.onLongPress();
      });
      expect(onChange).toHaveBeenCalledTimes(1); // immediate first repeat step

      act(() => {
        jest.advanceTimersByTime(90 * 3 + 5);
      });
      expect(onChange.mock.calls.length).toBeGreaterThanOrEqual(3);

      const countAtRelease = onChange.mock.calls.length;
      act(() => {
        up.props.onPressOut();
        jest.advanceTimersByTime(1000);
      });
      expect(onChange).toHaveBeenCalledTimes(countAtRelease);

      act(() => {
        tree.unmount();
      });
    } finally {
      jest.useRealTimers();
    }
  });
});

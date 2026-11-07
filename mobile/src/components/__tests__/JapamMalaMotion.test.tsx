import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated } from 'react-native';
import JapamMala from '../JapamMala';
import { ThemeProvider } from '@/theme/ThemeContext';

jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => false }));

test('the Mala audio pulse is native, non-interactive and stops with playback', async () => {
  const start = jest.fn();
  const stop = jest.fn();
  const timing = jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: jest.fn(), stop: jest.fn(), reset: jest.fn(),
  }));
  jest.spyOn(Animated, 'loop').mockReturnValue({ start, stop, reset: jest.fn() });
  let tree: TestRenderer.ReactTestRenderer | undefined;
  const display = (playing: boolean) => <ThemeProvider>
    <JapamMala count={0} rounds={0} size={300} playing={playing} hint="Tap to chant" />
  </ThemeProvider>;
  try {
    await act(async () => { tree = TestRenderer.create(display(true)); });
    const pulse = timing.mock.calls.filter(([, config]) => config.duration === 700);
    expect(pulse).toHaveLength(2);
    expect(pulse.every(([, config]) => config.useNativeDriver && config.isInteraction === false)).toBe(true);
    expect(start).toHaveBeenCalledTimes(1);
    await act(async () => { tree!.update(display(false)); });
    expect(stop).toHaveBeenCalledTimes(1);
  } finally {
    act(() => tree?.unmount());
    jest.restoreAllMocks();
  }
});

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import JapamAudioPlayer from '../JapamAudioPlayer';
import RateStepper from '../RateStepper';
import type { Lang } from '@/data/gita/language';
import { ThemeProvider } from '@/theme/ThemeContext';
import { infinityRecitationMs } from '../japamRecitationTiming';

const mockPlayer = {
  isLoaded: true, loop: false, shouldCorrectPitch: false,
  pause: jest.fn(), play: jest.fn(), seekTo: jest.fn(() => Promise.resolve()),
  setPlaybackRate: jest.fn(),
};
let mockStatus = { isLoaded: true, duration: 134 };
jest.mock('expo-audio', () => ({
  useAudioPlayer: () => mockPlayer,
  useAudioPlayerStatus: () => mockStatus,
}));
jest.mock('@/audio/audioSession', () => ({ ensureBackgroundAudioMode: jest.fn() }));
jest.mock('@/audio/playbackArbiter', () => ({ claimPlayback: jest.fn(), registerStopper: () => () => {} }));

let tree: TestRenderer.ReactTestRenderer | undefined;
beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(10000); mockStatus = { isLoaded: true, duration: 134 }; });
afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  jest.clearAllTimers(); jest.useRealTimers(); jest.clearAllMocks();
});

test('recording cadence is duration per recitation at natural tempo, without applying speed twice', async () => {
  const cadence = jest.fn();
  const rate = jest.fn();
  const display = () => <ThemeProvider><JapamAudioPlayer mantraId="hare-krishna-mahamantra" lang="hi"
    rate={1.5} onRateChange={rate} onIteration={jest.fn()} onRecitationDurationChange={cadence} /></ThemeProvider>;
  await act(async () => { tree = TestRenderer.create(display()); });
  expect(cadence).toHaveBeenLastCalledWith('hare-krishna-mahamantra', 33500);
  expect(mockPlayer.setPlaybackRate).toHaveBeenLastCalledWith(33500 / 25125, 'high');
  act(() => tree!.root.findByType(RateStepper).props.onChange(1.4));
  expect(rate).toHaveBeenCalledWith(1.4);
  mockStatus = { isLoaded: true, duration: 0 };
  await act(async () => { tree!.update(display()); });
  expect(cadence).toHaveBeenCalledTimes(1);
});

test.each([[16, 4000, 4500, 750], [3.52, 880, 990, 250]])('recording %ss uses a proportional period, with one count owner', async (duration, baseline, period, sampleSlack) => {
  mockStatus = { isLoaded: true, duration }; // Four utterances per recording.
  const iteration = jest.fn();
  const cadence = jest.fn();
  const display = () => <ThemeProvider><JapamAudioPlayer mantraId="hare-krishna-mahamantra" lang="hi"
    rate={1} onIteration={iteration} onRecitationDurationChange={cadence} /></ThemeProvider>;
  await act(async () => { tree = TestRenderer.create(display()); });
  expect(mockPlayer.setPlaybackRate).toHaveBeenLastCalledWith(baseline / period, 'high');
  expect(mockPlayer.shouldCorrectPitch).toBe(true);
  expect(cadence).toHaveBeenLastCalledWith('hare-krishna-mahamantra', baseline);
  expect(infinityRecitationMs(['हरे कृष्ण'], 1, cadence.mock.calls[0][1])).toBe(period);
  await act(async () => { tree!.root.findAll(node => node.props.accessibilityLabel === 'Play auto-chant')[0].props.onPress(); });
  act(() => { jest.advanceTimersByTime(250); }); // Existing wall-clock reducer primes its clock.
  act(() => { jest.advanceTimersByTime(baseline); });
  expect(iteration).not.toHaveBeenCalled();
  act(() => { jest.advanceTimersByTime(sampleSlack); }); // Padded boundary plus one existing 250ms sample.
  expect(iteration).toHaveBeenCalledTimes(1);
  expect(iteration).toHaveBeenLastCalledWith(1);
  mockStatus = { isLoaded: true, duration: 0 }; // Native loop seams retain the padded rate.
  await act(async () => { tree!.update(display()); });
  expect(mockPlayer.setPlaybackRate).toHaveBeenLastCalledWith(baseline / period, 'high');
  expect(cadence).toHaveBeenCalledTimes(1);
});

test('alarm autoplay configures the padded native rate before the first play', async () => {
  mockStatus = { isLoaded: true, duration: 16 };
  await act(async () => { tree = TestRenderer.create(<ThemeProvider>
    <JapamAudioPlayer mantraId="hare-krishna-mahamantra" lang="en" autoPlay onIteration={jest.fn()} />
  </ThemeProvider>); });
  expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  expect(mockPlayer.setPlaybackRate).toHaveBeenLastCalledWith(4000 / 4500, 'high');
  expect(mockPlayer.setPlaybackRate.mock.invocationCallOrder[0]).toBeLessThan(mockPlayer.play.mock.invocationCallOrder[0]);
});

test('silent Infinity retains tempo controls for mantras with no recording', async () => {
  const rate = jest.fn();
  await act(async () => { tree = TestRenderer.create(<ThemeProvider>
    <JapamAudioPlayer mantraId="radha-naam" lang="hi" rate={1} onRateChange={rate}
      showSilentTempo onIteration={jest.fn()} />
  </ThemeProvider>); });
  act(() => tree!.root.findAll(node => node.props.testID === 'japam-tempo-open')[0].props.onPress());
  const stepper = tree!.root.findByType(RateStepper);
  act(() => stepper.props.onChange(0.8));
  expect(rate).toHaveBeenCalledWith(0.8);
  expect(mockPlayer.play).not.toHaveBeenCalled();
});

test.each(['hi', 'en', 'gu', 'kn'] as Lang[])('Infinity speed opens and closes in %s without playing or counting', async lang => {
  const rate = jest.fn();
  const iteration = jest.fn();
  await act(async () => { tree = TestRenderer.create(<ThemeProvider>
    <JapamAudioPlayer mantraId="hare-krishna-mahamantra" lang={lang} rate={1} onRateChange={rate}
      showSilentTempo onIteration={iteration} />
  </ThemeProvider>); });
  act(() => tree!.root.findAll(node => node.props.testID === 'japam-tempo-open')[0].props.onPress());
  const stepper = tree!.root.findByType(RateStepper);
  expect(stepper.props).toMatchObject({ min: .5, max: 1.5, step: .1 });
  act(() => stepper.props.onChange(1.4));
  expect(rate).toHaveBeenCalledWith(1.4);
  act(() => tree!.root.findAll(node => node.props.testID === 'japam-tempo-close')[0].props.onPress());
  expect(tree!.root.findAll(node => node.props.testID === 'japam-tempo-open')[0].props.accessibilityState.expanded).toBe(false);
  expect(iteration).not.toHaveBeenCalled();
  expect(mockPlayer.play).not.toHaveBeenCalled();
});

test('switching recordings cannot reuse the previous file duration while the new clip loads', async () => {
  const cadence = jest.fn();
  const display = (id: string) => <ThemeProvider><JapamAudioPlayer mantraId={id} lang="en"
    onIteration={jest.fn()} onRecitationDurationChange={cadence} /></ThemeProvider>;
  await act(async () => { tree = TestRenderer.create(display('hare-krishna-mahamantra')); });
  mockStatus = { isLoaded: false, duration: 0 };
  await act(async () => { tree!.update(display('om-namah-shivaya')); });
  expect(cadence).not.toHaveBeenCalledWith('om-namah-shivaya', expect.anything());
});

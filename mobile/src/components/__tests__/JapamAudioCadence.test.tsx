import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import JapamAudioPlayer from '../JapamAudioPlayer';
import RateStepper from '../RateStepper';
import { ThemeProvider } from '@/theme/ThemeContext';

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
beforeEach(() => { jest.useFakeTimers(); mockStatus = { isLoaded: true, duration: 134 }; });
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
  expect(mockPlayer.setPlaybackRate).toHaveBeenLastCalledWith(1.5, 'high');
  act(() => tree!.root.findByType(RateStepper).props.onChange(1.4));
  expect(rate).toHaveBeenCalledWith(1.4);
  mockStatus = { isLoaded: true, duration: 0 };
  await act(async () => { tree!.update(display()); });
  expect(cadence).toHaveBeenCalledTimes(1);
});

test('silent Infinity retains tempo controls for mantras with no recording', async () => {
  const rate = jest.fn();
  await act(async () => { tree = TestRenderer.create(<ThemeProvider>
    <JapamAudioPlayer mantraId="radha-naam" lang="hi" rate={1} onRateChange={rate}
      showSilentTempo onIteration={jest.fn()} />
  </ThemeProvider>); });
  const stepper = tree!.root.findByType(RateStepper);
  act(() => stepper.props.onChange(0.8));
  expect(rate).toHaveBeenCalledWith(0.8);
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

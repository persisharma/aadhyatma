import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import type { AudioStatus } from 'expo-audio';

// Fake expo-audio player: capture the status listener so the test can drive
// load/playback state, and record play()/replace() calls.
jest.mock('expo-audio', () => {
  const listeners: Record<string, (s: unknown) => void> = {};
  const player = {
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    setPlaybackRate: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    clearLockScreenControls: jest.fn(),
    remove: jest.fn(),
    shouldCorrectPitch: false,
    loop: false,
    addListener: jest.fn((evt: string, cb: (s: unknown) => void) => {
      listeners[evt] = cb;
      return { remove: jest.fn() };
    }),
    _emit: (evt: string, s: unknown) => listeners[evt] && listeners[evt](s),
  };
  return { __esModule: true, createAudioPlayer: jest.fn(() => player), __player: player };
});

jest.mock('@/audio/audioSession', () => ({ ensureBackgroundAudioMode: jest.fn() }));
jest.mock('@assets/audio-library', () => ({
  getAudioSource: jest.fn(() => 1),
  hasRealAudio: jest.fn(() => true),
}));

import * as ExpoAudio from 'expo-audio';
import { AudioPlayerProvider, useAudioPlayerContext } from '@/contexts/AudioPlayerContext';
import type { AudioTrack } from '@/data/audio/tracks';

const mockPlayer = (ExpoAudio as unknown as { __player: {
  play: jest.Mock;
  replace: jest.Mock;
  _emit: (evt: string, s: Partial<AudioStatus>) => void;
} }).__player;

const track: AudioTrack = {
  id: 'hare-rama',
  titleHi: 'हरे राम',
  titleEn: 'Hare Rama',
  thumb: 'ह',
  artistEn: 'Mahamantra',
  deity: 'rama',
  kind: 'standalone',
  durationSec: 480,
};

let ctx: ReturnType<typeof useAudioPlayerContext>;
function Capture() {
  ctx = useAudioPlayerContext();
  return null;
}

function emitStatus(partial: Partial<AudioStatus>) {
  act(() => {
    mockPlayer._emit('playbackStatusUpdate', {
      isLoaded: false,
      playing: false,
      currentTime: 0,
      duration: 0,
      loop: false,
      ...partial,
    } as AudioStatus);
  });
}

beforeEach(() => {
  mockPlayer.play.mockClear();
  mockPlayer.replace.mockClear();
});

function mount() {
  act(() => {
    TestRenderer.create(
      <AudioPlayerProvider>
        <Capture />
      </AudioPlayerProvider>
    );
  });
}

describe('AudioPlayerContext.playTrack', () => {
  test('defers play() until the new source reports loaded', () => {
    mount();

    act(() => ctx.playTrack(track));
    expect(mockPlayer.replace).toHaveBeenCalledTimes(1);
    // play() before the source loads is a no-op in expo-audio, so we must NOT
    // fire it yet — doing so is what left long tracks paused.
    expect(mockPlayer.play).not.toHaveBeenCalled();

    // Source finishes loading → now it's safe to start.
    emitStatus({ isLoaded: true });
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);

    // Subsequent status ticks must not re-trigger play (idempotent).
    emitStatus({ isLoaded: true, playing: true, currentTime: 1 });
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });

  test('re-tapping the current track resumes immediately (already loaded)', () => {
    mount();

    act(() => ctx.playTrack(track));
    emitStatus({ isLoaded: true });
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);

    // Same track again → resume without waiting for a load event.
    act(() => ctx.playTrack(track));
    expect(mockPlayer.play).toHaveBeenCalledTimes(2);
    expect(mockPlayer.replace).toHaveBeenCalledTimes(1); // not reloaded
  });
});

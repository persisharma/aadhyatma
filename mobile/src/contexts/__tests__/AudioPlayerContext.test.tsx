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
import { registerStopper, __resetPlaybackArbiter } from '@/audio/playbackArbiter';
import { AUDIO_TRACKS, type AudioTrack } from '@/data/audio/tracks';

const mockPlayer = (ExpoAudio as unknown as { __player: {
  play: jest.Mock;
  replace: jest.Mock;
  loop: boolean;
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
      didJustFinish: false,
      ...partial,
    } as AudioStatus);
  });
}

/** Load `t` and drive it to the "playing" state the auto-advance gate expects. */
function startPlaying(t: AudioTrack) {
  act(() => ctx.playTrack(t));
  emitStatus({ isLoaded: true, playing: true, currentTime: 1, duration: t.durationSec ?? 100 });
}

/** Emit the end-of-track status for `t`. */
function emitFinished(t: AudioTrack, extra: Partial<AudioStatus> = {}) {
  const duration = t.durationSec ?? 100;
  emitStatus({ isLoaded: true, playing: false, currentTime: duration, duration, didJustFinish: true, ...extra });
}

beforeEach(() => {
  mockPlayer.play.mockClear();
  mockPlayer.replace.mockClear();
  mockPlayer.loop = false;
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

  test('claims playback so read-aloud and japam are silenced first', () => {
    // On iOS the audio session mixes rather than interrupts, so without this a
    // spoken verse and a recorded bhajan would play simultaneously.
    __resetPlaybackArbiter();
    const stopTts = jest.fn();
    const stopJapam = jest.fn();
    registerStopper('tts', stopTts);
    registerStopper('japam', stopJapam);

    mount();
    act(() => ctx.playTrack(track));

    expect(stopTts).toHaveBeenCalledTimes(1);
    expect(stopJapam).toHaveBeenCalledTimes(1);
  });
});

describe('AudioPlayerContext end-of-track auto-advance', () => {
  // `hasRealAudio` is mocked true, so the playable set is the whole catalog.
  const first = AUDIO_TRACKS[0];
  const second = AUDIO_TRACKS[1];
  const last = AUDIO_TRACKS[AUDIO_TRACKS.length - 1];

  test('plays the next track when the current one finishes', () => {
    mount();
    startPlaying(first);
    expect(ctx.currentTrack?.id).toBe(first.id);

    emitFinished(first);

    expect(ctx.currentTrack?.id).toBe(second.id);
    // The new source is loaded but not started until it reports ready.
    expect(mockPlayer.replace).toHaveBeenCalledTimes(2);
    emitStatus({ isLoaded: true, currentTime: 0, duration: second.durationSec ?? 100 });
    expect(mockPlayer.play).toHaveBeenCalledTimes(2); // first track + auto-advanced one
  });

  test('advances only once per ending, even as end-position ticks repeat', () => {
    mount();
    startPlaying(first);

    emitFinished(first);
    expect(ctx.currentTrack?.id).toBe(second.id);

    // Trailing ticks from the finished source must not skip a second track.
    emitFinished(first);
    emitFinished(first);
    expect(ctx.currentTrack?.id).toBe(second.id);
  });

  test('stays on the track when repeat is enabled', () => {
    mount();
    startPlaying(first);
    act(() => ctx.toggleLoop());
    expect(mockPlayer.loop).toBe(true);

    emitFinished(first);

    // Native looping restarts the same track — no advance.
    expect(ctx.currentTrack?.id).toBe(first.id);
    expect(mockPlayer.replace).toHaveBeenCalledTimes(1);
  });

  test('detects the ending by position when didJustFinish is never emitted', () => {
    mount();
    startPlaying(first);

    // Some platforms stop reporting `didJustFinish`; position at duration with
    // playback stopped is the fallback signal.
    emitFinished(first, { didJustFinish: false });

    expect(ctx.currentTrack?.id).toBe(second.id);
  });

  test('stops at the end of the library instead of wrapping to the top', () => {
    mount();
    startPlaying(last);

    emitFinished(last);

    expect(ctx.currentTrack?.id).toBe(last.id);
    expect(mockPlayer.replace).toHaveBeenCalledTimes(1);
  });

  test('re-arms after the ending so the next track also auto-advances', () => {
    mount();
    startPlaying(first);

    emitFinished(first);
    expect(ctx.currentTrack?.id).toBe(second.id);

    // Second track loads, plays through, and ends in turn.
    emitStatus({ isLoaded: true, playing: true, currentTime: 1, duration: second.durationSec ?? 100 });
    emitFinished(second);

    expect(ctx.currentTrack?.id).toBe(AUDIO_TRACKS[2].id);
  });
});

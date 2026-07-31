/**
 * The arbiter is what makes the app's three audio sources mutually exclusive. On iOS
 * the audio session mixes rather than interrupts, so a bug here does not fail loudly —
 * it plays a bhajan and a spoken verse simultaneously.
 */

import {
  __resetPlaybackArbiter,
  claimPlayback,
  registerStopper,
  type PlaybackKind,
} from '../playbackArbiter';

beforeEach(() => {
  __resetPlaybackArbiter();
});

describe('claimPlayback', () => {
  it('stops every other source', () => {
    const recorded = jest.fn();
    const japam = jest.fn();
    registerStopper('recorded', recorded);
    registerStopper('japam', japam);

    claimPlayback('tts');

    expect(recorded).toHaveBeenCalledTimes(1);
    expect(japam).toHaveBeenCalledTimes(1);
  });

  it('never stops the claiming source — it is about to play', () => {
    const tts = jest.fn();
    const recorded = jest.fn();
    registerStopper('tts', tts);
    registerStopper('recorded', recorded);

    claimPlayback('tts');

    expect(tts).not.toHaveBeenCalled();
    expect(recorded).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when nothing else is registered', () => {
    expect(() => claimPlayback('tts')).not.toThrow();
  });

  it('works in every direction', () => {
    const stops: Record<PlaybackKind, jest.Mock> = {
      recorded: jest.fn(),
      tts: jest.fn(),
      japam: jest.fn(),
    };
    for (const kind of Object.keys(stops) as PlaybackKind[]) registerStopper(kind, stops[kind]);

    claimPlayback('recorded');
    expect(stops.tts).toHaveBeenCalledTimes(1);
    expect(stops.japam).toHaveBeenCalledTimes(1);
    expect(stops.recorded).not.toHaveBeenCalled();

    claimPlayback('japam');
    expect(stops.recorded).toHaveBeenCalledTimes(1);
    expect(stops.tts).toHaveBeenCalledTimes(2);
  });

  it('keeps stopping the others when one stopper throws', () => {
    const bad = jest.fn(() => {
      throw new Error('player released');
    });
    const good = jest.fn();
    registerStopper('recorded', bad);
    registerStopper('japam', good);

    expect(() => claimPlayback('tts')).not.toThrow();
    expect(good).toHaveBeenCalledTimes(1);
  });
});

describe('registerStopper', () => {
  it('returns an unregister callback', () => {
    const stop = jest.fn();
    const unregister = registerStopper('recorded', stop);

    unregister();
    claimPlayback('tts');

    expect(stop).not.toHaveBeenCalled();
  });

  it('replaces an earlier stopper for the same kind', () => {
    const first = jest.fn();
    const second = jest.fn();
    registerStopper('recorded', first);
    registerStopper('recorded', second);

    claimPlayback('tts');

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('a stale unregister does not erase a newer registration', () => {
    // React can run the new mount's effect before the old one's cleanup; if cleanup
    // deleted unconditionally, the live player would silently stop being arbitrated.
    const stale = jest.fn();
    const live = jest.fn();
    const unregisterStale = registerStopper('recorded', stale);
    registerStopper('recorded', live);

    unregisterStale();
    claimPlayback('tts');

    expect(live).toHaveBeenCalledTimes(1);
    expect(stale).not.toHaveBeenCalled();
  });
});

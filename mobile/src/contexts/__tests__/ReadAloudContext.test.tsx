import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

// Fake expo-speech: capture each speak() call with its options and callbacks so the
// test can drive onStart/onDone/onError the way the native module would. Modelled on
// the expo-audio fake in AudioPlayerContext.test.tsx.
jest.mock('expo-speech', () => {
  const calls: { text: string; options: Record<string, unknown> }[] = [];
  return {
    __esModule: true,
    speak: jest.fn((text: string, options: Record<string, unknown>) => {
      calls.push({ text, options });
    }),
    stop: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    resume: jest.fn(() => Promise.resolve()),
    isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
    getAvailableVoicesAsync: jest.fn(() =>
      Promise.resolve([
        { identifier: 'hi-voice', name: 'Lekha', quality: 'Default', language: 'hi-IN' },
        { identifier: 'en-voice', name: 'Rishi', quality: 'Default', language: 'en-IN' },
      ])
    ),
    maxSpeechInputLength: 4000,
    __calls: calls,
  };
});

jest.mock('@/audio/audioSession', () => ({ ensureBackgroundAudioMode: jest.fn() }));

import * as Speech from 'expo-speech';
import { GitaLanguageProvider } from '@/data/gita/language';
import { ReadAloudPrefsProvider } from '@/contexts/ReadAloudPrefsContext';
import { ReadAloudProvider, useReadAloud, type ReadAloudSession } from '@/contexts/ReadAloudContext';
import { registerStopper, __resetPlaybackArbiter } from '@/audio/playbackArbiter';
import type { ReadAloudChunk } from '@/readAloud/verseScript';

type SpeechMock = {
  __calls: { text: string; options: Record<string, unknown> }[];
  speak: jest.Mock;
  stop: jest.Mock;
  pause: jest.Mock;
  getAvailableVoicesAsync: jest.Mock;
};
const speechMock = Speech as unknown as SpeechMock;

/** Fires the most recent utterance's onStart, as the engine would. */
function startLast() {
  const last = speechMock.__calls[speechMock.__calls.length - 1];
  act(() => {
    (last.options.onStart as (() => void) | undefined)?.();
  });
}

/** Fires the most recent utterance's onDone, chaining to the next chunk. */
function finishLast() {
  const last = speechMock.__calls[speechMock.__calls.length - 1];
  act(() => {
    (last.options.onDone as (() => void) | undefined)?.();
  });
}

function chunk(text: string): ReadAloudChunk {
  return { id: text, text, part: 'verse' };
}

/** Three pages: two speakable, page 2 a chapter sentinel. */
function makeSession(overrides: Partial<ReadAloudSession> = {}): ReadAloudSession & {
  scrollToPage: jest.Mock;
} {
  const scrollToPage = jest.fn();
  return {
    sourceId: 'hanuman-chalisa',
    totalPages: 3,
    chunksFor: (page: number) => {
      if (page === 0) return [chunk('line one'), chunk('line two')];
      if (page === 1) return [chunk('page two line')];
      return null; // sentinel
    },
    scrollToPage,
    ...overrides,
  } as ReadAloudSession & { scrollToPage: jest.Mock };
}

let ctx: ReturnType<typeof useReadAloud>;
function Capture() {
  ctx = useReadAloud();
  return null;
}

/**
 * Every test unmounts its tree in afterEach. Leaving providers mounted leaks their
 * AppState listeners and lets a late voice probe setState into a finished test — which
 * shows up as an act() warning and stops Jest from exiting.
 */
let tree: TestRenderer.ReactTestRenderer | null = null;

async function mount() {
  await act(async () => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ReadAloudPrefsProvider>
          <ReadAloudProvider>
            <Capture />
          </ReadAloudProvider>
        </ReadAloudPrefsProvider>
      </GitaLanguageProvider>
    );
  });
  // Let the voice probe and prefs hydration settle.
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
}

beforeEach(() => {
  speechMock.__calls.length = 0;
  speechMock.speak.mockClear();
  speechMock.stop.mockClear();
  speechMock.pause.mockClear();
  __resetPlaybackArbiter();
  jest.useRealTimers();
});

afterEach(() => {
  if (tree) {
    act(() => tree!.unmount());
    tree = null;
  }
  jest.useRealTimers();
});

describe('voice probe', () => {
  it('reports ready when a matching voice is installed', async () => {
    await mount();
    expect(ctx.availability).toBe('ready');
    expect(ctx.target).toBe('hi');
  });

  it('reports unavailable when no voice matches the reading language', async () => {
    speechMock.getAvailableVoicesAsync.mockResolvedValueOnce([
      { identifier: 'de', name: 'Anna', quality: 'Default', language: 'de-DE' },
    ]);
    await mount();
    expect(ctx.availability).toBe('unavailable');
  });

  it('never calls speak while unavailable', async () => {
    speechMock.getAvailableVoicesAsync.mockResolvedValueOnce([]);
    await mount();
    expect(ctx.availability).toBe('unavailable');

    const session = makeSession();
    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    // The reader gates on `unavailable` before calling start, but the controller
    // must not speak into a voiceless engine even if it is called.
    expect(ctx.availability).toBe('unavailable');
  });

  it('exposes the probed candidates for the settings sheet', async () => {
    await mount();
    expect(ctx.candidateVoices.map((v) => v.identifier)).toEqual(['hi-voice']);
  });
});

describe('the chunk loop', () => {
  it('speaks one chunk at a time and chains on onDone', async () => {
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });

    expect(speechMock.__calls).toHaveLength(1);
    expect(speechMock.__calls[0].text).toBe('line one');

    startLast();
    finishLast();

    expect(speechMock.__calls).toHaveLength(2);
    expect(speechMock.__calls[1].text).toBe('line two');
  });

  it('asks the reader to scroll, then speaks, when a page finishes', async () => {
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    startLast();
    finishLast(); // → line two
    startLast();
    finishLast(); // → page 1

    expect(session.scrollToPage).toHaveBeenCalledWith(1);
    expect(speechMock.__calls[speechMock.__calls.length - 1].text).toBe('page two line');
    expect(ctx.activePage).toBe(1);
  });

  it('stops at a chapter sentinel rather than reading across the boundary', async () => {
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    startLast();
    finishLast();
    startLast();
    finishLast(); // → page 1
    startLast();
    finishLast(); // page 2 is the sentinel

    expect(session.scrollToPage).not.toHaveBeenCalledWith(2);
    expect(ctx.status).toBe('idle');
    expect(ctx.activeSourceId).toBeNull();
  });

  it('skips a page with no speakable text instead of stalling', async () => {
    await mount();
    // Page 1 is an intro page with no lines; page 2 has text.
    const session = makeSession({
      totalPages: 3,
      chunksFor: (page: number) => {
        if (page === 0) return [chunk('first')];
        if (page === 1) return [];
        return [chunk('third')];
      },
    });

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    startLast();
    finishLast();

    expect(session.scrollToPage).toHaveBeenCalledWith(2);
    expect(session.scrollToPage).not.toHaveBeenCalledWith(1);
    expect(speechMock.__calls[speechMock.__calls.length - 1].text).toBe('third');
  });

  it('goes idle after the last page', async () => {
    await mount();
    const session = makeSession({
      totalPages: 1,
      chunksFor: () => [chunk('only')],
    });

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    startLast();
    finishLast();

    expect(ctx.status).toBe('idle');
  });

  it('ignores a stale onDone from a superseded session', async () => {
    await mount();
    const first = makeSession();

    await act(async () => {
      ctx.start(first, 0);
      await Promise.resolve();
    });
    const staleCall = speechMock.__calls[0];

    // A chapter replace starts a fresh session on the new screen instance.
    const second = makeSession({ sourceId: 'shiv-chalisa' });
    await act(async () => {
      ctx.start(second, 0);
      await Promise.resolve();
    });
    const countAfterRestart = speechMock.__calls.length;

    act(() => {
      (staleCall.options.onDone as (() => void) | undefined)?.();
    });

    expect(speechMock.__calls).toHaveLength(countAfterRestart);
    expect(ctx.activeSourceId).toBe('shiv-chalisa');
  });

  it('ends the session on onError', async () => {
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    act(() => {
      (speechMock.__calls[0].options.onError as ((e: Error) => void) | undefined)?.(
        new Error('engine failed')
      );
    });

    expect(ctx.status).toBe('idle');
  });
});

describe('pause and resume', () => {
  it('pauses by stopping the engine and NEVER calls Speech.pause', async () => {
    // Android's native module has no pause/resume at all, so the JS chunk loop
    // implements it on both platforms — keeping behaviour identical.
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    startLast();
    act(() => ctx.pause());

    expect(ctx.status).toBe('paused');
    expect(speechMock.pause).not.toHaveBeenCalled();
    expect(speechMock.stop).toHaveBeenCalled();
  });

  it('re-speaks the same chunk on resume', async () => {
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    startLast();
    finishLast(); // now on 'line two'
    startLast();
    act(() => ctx.pause());
    const beforeResume = speechMock.__calls.length;

    act(() => ctx.resume());

    expect(ctx.status).toBe('speaking');
    expect(speechMock.__calls).toHaveLength(beforeResume + 1);
    expect(speechMock.__calls[beforeResume].text).toBe('line two');
  });

  it('does not advance a page while paused', async () => {
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    startLast();
    const paused = speechMock.__calls[speechMock.__calls.length - 1];
    act(() => ctx.pause());

    // Some engines surface a stop as onDone; it must not chain.
    act(() => {
      (paused.options.onDone as (() => void) | undefined)?.();
    });

    expect(ctx.status).toBe('paused');
    expect(session.scrollToPage).not.toHaveBeenCalled();
  });
});

describe('the onStart watchdog', () => {
  it('flips to unavailable when the engine accepts a voice then stays silent', async () => {
    // The only defence against an OEM engine that reports LANG_AVAILABLE and then
    // emits nothing — neither platform fires onError for that.
    jest.useFakeTimers();
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    expect(ctx.status).toBe('speaking');

    // onStart never arrives.
    await act(async () => {
      jest.advanceTimersByTime(3100);
    });

    expect(ctx.status).toBe('idle');
    expect(ctx.availability).toBe('unavailable');
  });

  it('does not fire once onStart arrives', async () => {
    jest.useFakeTimers();
    await mount();
    const session = makeSession();

    await act(async () => {
      ctx.start(session, 0);
      await Promise.resolve();
    });
    startLast();

    await act(async () => {
      jest.advanceTimersByTime(3100);
    });

    expect(ctx.status).toBe('speaking');
    expect(ctx.availability).toBe('ready');
  });
});

describe('mutual exclusion', () => {
  it('silences recorded audio when speech starts', async () => {
    await mount();
    const stopRecorded = jest.fn();
    registerStopper('recorded', stopRecorded);

    await act(async () => {
      ctx.start(makeSession(), 0);
      await Promise.resolve();
    });

    expect(stopRecorded).toHaveBeenCalledTimes(1);
  });

  it('silences recorded audio for a settings-sheet preview too', async () => {
    await mount();
    const stopRecorded = jest.fn();
    registerStopper('recorded', stopRecorded);

    await act(async () => {
      ctx.speakPreview('श्री राम जय राम');
      await Promise.resolve();
    });

    expect(stopRecorded).toHaveBeenCalledTimes(1);
    expect(speechMock.__calls[speechMock.__calls.length - 1].text).toBe('श्री राम जय राम');
  });

  it('registers its own stopper so recorded audio can silence it', async () => {
    await mount();
    await act(async () => {
      ctx.start(makeSession(), 0);
      await Promise.resolve();
    });
    expect(ctx.status).toBe('speaking');

    // Simulate the recorded player claiming playback.
    const { claimPlayback } = jest.requireActual<typeof import('@/audio/playbackArbiter')>(
      '@/audio/playbackArbiter'
    );
    act(() => claimPlayback('recorded'));

    expect(ctx.status).toBe('idle');
  });
});

describe('speak options', () => {
  it('passes the persisted rate and the resolved voice', async () => {
    await mount();
    await act(async () => {
      ctx.start(makeSession(), 0);
      await Promise.resolve();
    });

    const opts = speechMock.__calls[0].options;
    expect(opts.rate).toBe(1);
    expect(opts.voice).toBe('hi-voice');
  });
});

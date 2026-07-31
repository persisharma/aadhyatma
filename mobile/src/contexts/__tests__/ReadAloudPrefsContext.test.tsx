import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

// Stateful AsyncStorage so hydration and persistence are both observable
// (the VratFollowContext recipe).
const mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    delete mockStore[k];
    return Promise.resolve();
  }),
}));

import {
  ReadAloudPrefsProvider,
  useReadAloudPrefs,
  parseReadAloudPrefs,
  READ_ALOUD_STORAGE_KEY,
} from '@/contexts/ReadAloudPrefsContext';
import { DEFAULT_READ_ALOUD_PREFS } from '@/readAloud/prefs';

let ctx: ReturnType<typeof useReadAloudPrefs>;
function Capture() {
  ctx = useReadAloudPrefs();
  return null;
}

let tree: TestRenderer.ReactTestRenderer | null = null;

async function mountAndHydrate() {
  await act(async () => {
    tree = TestRenderer.create(
      <ReadAloudPrefsProvider>
        <Capture />
      </ReadAloudPrefsProvider>
    );
  });
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  jest.clearAllMocks();
});

afterEach(() => {
  if (tree) {
    act(() => tree!.unmount());
    tree = null;
  }
});

describe('parseReadAloudPrefs', () => {
  it('returns defaults for absent, empty, and corrupt values', () => {
    expect(parseReadAloudPrefs(null)).toEqual(DEFAULT_READ_ALOUD_PREFS);
    expect(parseReadAloudPrefs('')).toEqual(DEFAULT_READ_ALOUD_PREFS);
    expect(parseReadAloudPrefs('{not json')).toEqual(DEFAULT_READ_ALOUD_PREFS);
    expect(parseReadAloudPrefs('"a string"')).toEqual(DEFAULT_READ_ALOUD_PREFS);
    expect(parseReadAloudPrefs('null')).toEqual(DEFAULT_READ_ALOUD_PREFS);
  });

  it('reads meaning ON by default', () => {
    expect(parseReadAloudPrefs('{}').readMeaning).toBe(true);
    expect(parseReadAloudPrefs('{}').readCommentary).toBe(false);
  });

  it('validates field by field, ignoring wrong types', () => {
    const parsed = parseReadAloudPrefs(
      JSON.stringify({ rate: 'fast', readMeaning: 'yes', readCommentary: 1, voiceByTarget: 'nope' })
    );
    expect(parsed).toEqual(DEFAULT_READ_ALOUD_PREFS);
  });

  it('clamps a stored rate outside the supported range', () => {
    expect(parseReadAloudPrefs(JSON.stringify({ rate: 9 })).rate).toBe(1.5);
    expect(parseReadAloudPrefs(JSON.stringify({ rate: 0.1 })).rate).toBe(0.5);
    expect(parseReadAloudPrefs(JSON.stringify({ rate: NaN })).rate).toBe(1);
  });

  it('keeps only string voice identifiers, per target', () => {
    const parsed = parseReadAloudPrefs(
      JSON.stringify({ voiceByTarget: { hi: 'hi-voice', en: 42, xx: 'ignored' } })
    );
    expect(parsed.voiceByTarget).toEqual({ hi: 'hi-voice' });
  });

  it('accepts a voice for all four reading languages', () => {
    // Read-aloud speaks each language in its own voice, so each gets its own slot —
    // there is no shared "the" voice.
    const parsed = parseReadAloudPrefs(
      JSON.stringify({ voiceByTarget: { hi: 'h', en: 'e', gu: 'g', kn: 'k' } })
    );
    expect(parsed.voiceByTarget).toEqual({ hi: 'h', en: 'e', gu: 'g', kn: 'k' });
  });

  it('drops an empty-string identifier rather than storing a hole', () => {
    expect(parseReadAloudPrefs(JSON.stringify({ voiceByTarget: { hi: '' } })).voiceByTarget).toEqual(
      {}
    );
  });
});

describe('ReadAloudPrefsProvider', () => {
  it('hydrates from storage', async () => {
    mockStore[READ_ALOUD_STORAGE_KEY] = JSON.stringify({
      rate: 1.2,
      readMeaning: false,
      readCommentary: true,
      voiceByTarget: { hi: 'saved-voice' },
    });

    await mountAndHydrate();

    expect(ctx.isLoading).toBe(false);
    expect(ctx.prefs.rate).toBe(1.2);
    expect(ctx.prefs.readMeaning).toBe(false);
    expect(ctx.prefs.readCommentary).toBe(true);
    expect(ctx.prefs.voiceByTarget.hi).toBe('saved-voice');
  });

  it('starts from defaults on a fresh install', async () => {
    await mountAndHydrate();
    expect(ctx.prefs).toEqual(DEFAULT_READ_ALOUD_PREFS);
  });

  it('uses the documented storage key', () => {
    expect(READ_ALOUD_STORAGE_KEY).toBe('@vedansh/read-aloud');
  });

  it('persists a rate change, clamped', async () => {
    await mountAndHydrate();

    await act(async () => {
      ctx.setRate(1.3);
    });
    expect(ctx.prefs.rate).toBe(1.3);
    expect(JSON.parse(mockStore[READ_ALOUD_STORAGE_KEY]).rate).toBe(1.3);

    await act(async () => {
      ctx.setRate(99);
    });
    expect(ctx.prefs.rate).toBe(1.5);
  });

  it('persists a per-target voice and clears it back to automatic', async () => {
    await mountAndHydrate();

    await act(async () => {
      ctx.setVoice('hi', 'hi-voice');
    });
    expect(ctx.prefs.voiceByTarget).toEqual({ hi: 'hi-voice' });

    await act(async () => {
      ctx.setVoice('hi', undefined);
    });
    expect(ctx.prefs.voiceByTarget).toEqual({});
    expect(JSON.parse(mockStore[READ_ALOUD_STORAGE_KEY]).voiceByTarget).toEqual({});
  });

  it('keeps the other targets when one is set', async () => {
    await mountAndHydrate();

    for (const [target, id] of [
      ['hi', 'hi-voice'],
      ['en', 'en-voice'],
      ['gu', 'gu-voice'],
      ['kn', 'kn-voice'],
    ] as const) {
      await act(async () => {
        ctx.setVoice(target, id);
      });
    }

    expect(ctx.prefs.voiceByTarget).toEqual({
      hi: 'hi-voice',
      en: 'en-voice',
      gu: 'gu-voice',
      kn: 'kn-voice',
    });
  });

  it('persists the what-to-read toggles', async () => {
    await mountAndHydrate();

    await act(async () => {
      ctx.setReadMeaning(false);
    });
    await act(async () => {
      ctx.setReadCommentary(true);
    });

    const stored = JSON.parse(mockStore[READ_ALOUD_STORAGE_KEY]);
    expect(stored.readMeaning).toBe(false);
    expect(stored.readCommentary).toBe(true);
  });

  it('composes two writes in the same tick instead of clobbering', async () => {
    // The prefsRef mirror exists for this: without it the second setState would be
    // computed from stale state and drop the first change.
    await mountAndHydrate();

    await act(async () => {
      ctx.setRate(0.8);
      ctx.setReadCommentary(true);
    });

    expect(ctx.prefs.rate).toBe(0.8);
    expect(ctx.prefs.readCommentary).toBe(true);
    const stored = JSON.parse(mockStore[READ_ALOUD_STORAGE_KEY]);
    expect(stored.rate).toBe(0.8);
    expect(stored.readCommentary).toBe(true);
  });

  it('survives storage that throws', async () => {
    const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('storage unavailable'));

    await mountAndHydrate();

    expect(ctx.isLoading).toBe(false);
    expect(ctx.prefs).toEqual(DEFAULT_READ_ALOUD_PREFS);
  });
});

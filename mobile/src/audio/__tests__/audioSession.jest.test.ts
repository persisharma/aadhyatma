/**
 * Regression guard for the Android "no volume" bug: expo-audio resolves
 * `interruptionMode ?? interruptionModeAndroid`, so passing the iOS value in
 * `interruptionMode` silently overrode Android's `duckOthers` with
 * `mixWithOthers` — under which the Android module never requests audio
 * focus, and Android 12+ force-mutes focus-less players whenever another app
 * holds focus (bit hardest on Android 16 devices). The session setup must
 * branch the single `interruptionMode` field per platform instead.
 */

let mockPlatformOS: 'ios' | 'android' = 'ios';

jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatformOS;
    },
    select: (spec: Record<string, unknown>) => spec[mockPlatformOS] ?? spec.default,
  },
}));

const mockSetAudioModeAsync = jest.fn();
jest.mock('expo-audio', () => ({
  setAudioModeAsync: (...args: unknown[]) => mockSetAudioModeAsync(...args),
}));

function freshEnsureBackgroundAudioMode(): () => Promise<void> {
  // The module memoises configuration in module state — re-require per test.
  jest.resetModules();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../audioSession').ensureBackgroundAudioMode;
}

beforeEach(() => {
  mockSetAudioModeAsync.mockReset().mockResolvedValue(undefined);
});

describe('ensureBackgroundAudioMode', () => {
  it('requests audio focus on Android via duckOthers', async () => {
    mockPlatformOS = 'android';
    await freshEnsureBackgroundAudioMode()();
    expect(mockSetAudioModeAsync).toHaveBeenCalledTimes(1);
    const mode = mockSetAudioModeAsync.mock.calls[0][0];
    expect(mode.interruptionMode).toBe('duckOthers');
    // The Android-only field must stay unused: expo-audio prefers
    // `interruptionMode` when both are set, which is how the bug shipped.
    expect(mode).not.toHaveProperty('interruptionModeAndroid');
  });

  it('mixes politely with other audio on iOS', async () => {
    mockPlatformOS = 'ios';
    await freshEnsureBackgroundAudioMode()();
    expect(mockSetAudioModeAsync).toHaveBeenCalledTimes(1);
    expect(mockSetAudioModeAsync.mock.calls[0][0].interruptionMode).toBe('mixWithOthers');
  });

  it('configures the native session once per app run', async () => {
    mockPlatformOS = 'android';
    const ensure = freshEnsureBackgroundAudioMode();
    await ensure();
    await ensure();
    expect(mockSetAudioModeAsync).toHaveBeenCalledTimes(1);
  });

  it('retries on the next call after a failure', async () => {
    mockPlatformOS = 'android';
    mockSetAudioModeAsync.mockRejectedValueOnce(new Error('native session busy'));
    const ensure = freshEnsureBackgroundAudioMode();
    await ensure();
    await ensure();
    expect(mockSetAudioModeAsync).toHaveBeenCalledTimes(2);
  });
});

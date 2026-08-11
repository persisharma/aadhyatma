// Global mocks for the Jest suite.
//
// AsyncStorage has no native module under Jest, so importing it throws
// "NativeModule: AsyncStorage is null". ThemeContext now reaches AsyncStorage
// transitively (via FontScaleContext), so every useTheme() consumer would need
// its own mock. Register the library's official in-memory mock once, globally.
// Suites that need to control storage still override this with their own
// jest.mock() (a file-level mock takes precedence over this setup mock).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// expo-speech ships untranspiled ESM and is outside the RN preset's
// transformIgnorePatterns, so Jest cannot even PARSE it — and it is reached
// transitively by every reader screen (ReaderHeader → ReadAloudButton →
// ReadAloudContext). Without a global stub all 20 reader suites fail to run.
// An inert stub is the right default: no reader test drives speech, and the
// suites that do (ReadAloudContext) override this with their own jest.mock().
// expo-audio has the same untranspiled-ESM problem as expo-speech, and it is now
// reached transitively by every reader screen (ReadAloudContext → audioSession →
// expo-audio), not just by AudioPlayerContext. Suites that actually drive playback
// (AudioPlayerContext, audioSession) override this with their own jest.mock().
jest.mock('expo-audio', () => {
  const player = {
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
    setPlaybackRate: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    clearLockScreenControls: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    isLoaded: false,
    loop: false,
    shouldCorrectPitch: false,
  };
  return {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    createAudioPlayer: jest.fn(() => player),
    useAudioPlayer: jest.fn(() => player),
    useAudioPlayerStatus: jest.fn(() => ({ isLoaded: false, playing: false })),
  };
});

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(() => Promise.resolve()),
  pause: jest.fn(() => Promise.resolve()),
  resume: jest.fn(() => Promise.resolve()),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
  maxSpeechInputLength: 4000,
}));

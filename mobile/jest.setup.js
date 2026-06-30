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

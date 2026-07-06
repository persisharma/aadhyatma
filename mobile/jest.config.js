module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Scoped to the dirs holding Jest-style suites. src/data/__tests__ and the
  // plain `*.test.ts` files in src/notifications/__tests__ are node:assert
  // scripts (run via tsx), NOT Jest tests — including them here makes Jest fail
  // with "zero tests" suites. Jest-style suites that must live next to a module
  // requiring RN/expo mocks (e.g. deepLink) use the `*.jest.test.{ts,tsx}`
  // suffix so they opt in here without dragging the tsx scripts along.
  testMatch: [
    '<rootDir>/src/screens/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/utils/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/contexts/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/components/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/theme/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/notifications/__tests__/**/*.jest.test.{ts,tsx}',
    '<rootDir>/src/data/__tests__/**/*.jest.test.{ts,tsx}',
  ],
  moduleNameMapper: {
    // Audio assets aren't transformed by the RN preset — stub them so a
    // require('*.mp3') resolves to an asset handle instead of failing to parse.
    '\\.(mp3|wav|m4a)$': '<rootDir>/jest/audioAssetStub.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
};

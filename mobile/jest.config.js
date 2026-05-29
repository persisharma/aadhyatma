module.exports = {
  preset: 'react-native',
  // Scoped to the dirs holding Jest-style suites. src/data/__tests__ and
  // src/notifications/__tests__ are node:assert scripts (run via tsx), NOT Jest
  // tests — including them here makes Jest fail with "zero tests" suites.
  testMatch: [
    '<rootDir>/src/screens/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/utils/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/contexts/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/components/__tests__/**/*.test.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
};

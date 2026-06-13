module.exports = {
  preset: 'react-native',
  testMatch: [
    '<rootDir>/src/screens/__tests__/**/*.test.tsx',
    '<rootDir>/src/components/__tests__/**/*.test.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
};

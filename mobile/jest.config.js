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
    '<rootDir>/src/navigation/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/theme/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/notifications/__tests__/**/*.jest.test.{ts,tsx}',
    // Panchang Jest suites live in the nested __tests__/jest/ dir: test:engine
    // globs __tests__/*.test.ts straight into `tsx --test`, which cannot run them.
    '<rootDir>/src/panchang/__tests__/**/*.jest.test.{ts,tsx}',
    '<rootDir>/src/audio/__tests__/**/*.jest.test.{ts,tsx}',
    '<rootDir>/src/data/__tests__/**/*.jest.test.{ts,tsx}',
    // src/readAloud holds no tsx scripts, so the plain suffix is safe here.
    '<rootDir>/src/readAloud/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/widgets/__tests__/**/*.jest.test.{ts,tsx}',
    // वास्तु दिशा (PRD-24): pure compass math + content registries — neither
    // dir holds tsx scripts, so the plain suffix is safe.
    '<rootDir>/src/vastu/__tests__/**/*.test.{ts,tsx}',
    '<rootDir>/src/data/vastu/__tests__/**/*.test.{ts,tsx}',
    // दान-पुण्य (PRD-26): content registries + pure ledger core — the dir
    // holds no tsx scripts, so the plain suffix is safe.
    '<rootDir>/src/data/daan/__tests__/**/*.test.{ts,tsx}',
  ],
  moduleNameMapper: {
    // Audio assets aren't transformed by the RN preset — stub them so a
    // require('*.mp3') resolves to an asset handle instead of failing to parse.
    '\\.(mp3|wav|m4a)$': '<rootDir>/jest/audioAssetStub.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
};

// Stub for `expo/virtual/env`.
//
// `babel-preset-expo` rewrites every `process.env.EXPO_PUBLIC_*` read into an
// import of this virtual module, which ships as untranspiled ESM outside the RN
// preset's transformIgnorePatterns — so Jest cannot even parse it, and any
// module reading an EXPO_PUBLIC_ var fails to load (same class of problem as the
// expo-speech / expo-constants stubs in jest.setup.js).
//
// The real module is just a pass-through to process.env, so this is a faithful
// stand-in: a suite can set process.env.EXPO_PUBLIC_* and the module under test
// sees it.
module.exports = { env: process.env };

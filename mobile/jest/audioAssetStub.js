// Jest stub for bundled audio assets (.mp3/.wav/.m4a). The React Native jest
// preset transforms image assets but not audio, so a raw require('*.mp3') would
// fail to parse. Tests only care that the require resolves to a truthy asset
// handle (a number, like Metro's real asset ids) — never the bytes.
module.exports = 1;

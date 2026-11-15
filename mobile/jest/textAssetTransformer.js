// Metro turns `require('…/k1_p01.txt')` into an asset handle (a number). Jest has
// no asset registry, and the RN preset only knows image/video extensions, so a
// `.txt` asset would otherwise be parsed as JavaScript. Hand back the file's own
// path instead: the test double for `valmiki-ramayan/partReader` reads it from disk,
// which keeps every corpus test on the REAL published parts.
module.exports = {
  process(_source, filename) {
    return { code: `module.exports = ${JSON.stringify(filename)};` };
  },
  getCacheKey(_source, filename) {
    return `text-asset:${filename}`;
  },
};

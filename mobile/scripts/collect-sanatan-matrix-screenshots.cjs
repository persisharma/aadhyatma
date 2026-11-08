const fs = require('node:fs');
const path = require('node:path');

const languages = ['Hindi', 'English', 'Gujarati', 'Kannada'];
const sizes = ['Standard', 'Large'];
const surfaces = ['home-frame-', 'hub-', 'collection-', '', 'diagram-'];

function collectSanatanMatrixScreenshots(root, output, suffix) {
  if (!/^(ios|android)-(standard|enlarged)$/.test(suffix)) throw Error('Invalid native matrix suffix');
  const expected = languages.flatMap(language => sizes.flatMap(size =>
    surfaces.map(surface => `sanatan-${surface}${language}-${size}-${suffix}.png`)));
  const found = new Map(expected.map(name => [name, []]));
  function visit(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && found.has(entry.name) &&
        path.basename(directory) === 'e2e-shots' && path.basename(path.dirname(directory)) === 'takeScreenshot') {
        found.get(entry.name).push(file);
      }
    }
  }
  visit(root);
  const invalid = [...found].filter(([, files]) => files.length !== 1);
  if (invalid.length) throw Error(`Expected one capture per matrix surface: ${invalid.map(([name, files]) => `${name} (${files.length})`).join(', ')}`);
  // Validate the entire set before writing, so partial evidence cannot look complete.
  fs.mkdirSync(output, { recursive: true });
  for (const [name, [file]] of found) fs.copyFileSync(file, path.join(output, name));
  return expected;
}

module.exports = { collectSanatanMatrixScreenshots };
if (require.main === module) {
  const [, , root, output, suffix] = process.argv;
  const captures = collectSanatanMatrixScreenshots(root, output, suffix);
  console.log(`Collected all ${captures.length} Sanatan matrix screenshots (${suffix}).`);
}

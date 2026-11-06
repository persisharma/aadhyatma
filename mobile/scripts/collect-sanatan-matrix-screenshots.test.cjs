const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { collectSanatanMatrixScreenshots } = require('./collect-sanatan-matrix-screenshots.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sanatan-captures-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const captures = path.join(root, 'tests', 'run-1', 'sanatan-parichay-language-size', 'takeScreenshot', 'e2e-shots');
  fs.mkdirSync(captures, { recursive: true });
  const names = [];
  for (const language of ['Hindi', 'English', 'Gujarati', 'Kannada']) {
    for (const size of ['Standard', 'Large']) {
      for (const surface of ['home-frame-', 'hub-', 'collection-', '', 'diagram-']) {
        const name = `sanatan-${surface}${language}-${size}-android-standard.png`;
        fs.writeFileSync(path.join(captures, name), `capture:${name}`);
        names.push(name);
      }
    }
  }
  return { root, captures, names, output: path.join(root, 'collected') };
}

test('collects every language/size/surface from pinned Maestro artifact paths, excluding other settings', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.captures, 'sanatan-hub-Hindi-Standard-android-enlarged.png'), 'other setting');
  const collected = collectSanatanMatrixScreenshots(path.join(f.root, 'tests'), f.output, 'android-standard');
  assert.equal(collected.length, 40);
  assert.deepEqual(fs.readdirSync(f.output).sort(), f.names.sort());
  for (const name of f.names) assert.equal(fs.readFileSync(path.join(f.output, name), 'utf8'), `capture:${name}`);
});

test('rejects an incomplete capture set before creating the output', t => {
  const f = fixture(t);
  fs.unlinkSync(path.join(f.captures, f.names[0]));
  assert.throws(() => collectSanatanMatrixScreenshots(path.join(f.root, 'tests'), f.output, 'android-standard'), /\(0\)/);
  assert.equal(fs.existsSync(f.output), false);
});

test('rejects duplicate captures from another run rather than silently mixing evidence', t => {
  const f = fixture(t);
  const duplicate = path.join(f.root, 'tests', 'run-2', 'same-flow', 'takeScreenshot', 'e2e-shots');
  fs.mkdirSync(duplicate, { recursive: true });
  fs.copyFileSync(path.join(f.captures, f.names[0]), path.join(duplicate, f.names[0]));
  assert.throws(() => collectSanatanMatrixScreenshots(path.join(f.root, 'tests'), f.output, 'android-standard'), /\(2\)/);
  assert.equal(fs.existsSync(f.output), false);
});

test('matrix flow preserves each native capture suffix and defaults only for local runs', () => {
  const source = fs.readFileSync(path.join(__dirname, '../.maestro/sanatan-parichay-language-size.yaml'), 'utf8');
  const assignment = source.match(/^\s+CAPTURE_SUFFIX:\s*(.+)$/m);
  assert.ok(assignment, 'The local/default capture suffix must be declared');
  const raw = assignment[1].trim();
  const value = raw.startsWith('"') ? JSON.parse(raw) : raw;
  const evaluate = context => value.startsWith('${') ? vm.runInNewContext(value.slice(2, -1), context) : value;
  for (const suffix of ['ios-standard', 'ios-enlarged', 'android-standard', 'android-enlarged']) {
    assert.equal(evaluate({ CAPTURE_SUFFIX: suffix }), suffix);
  }
  assert.equal(evaluate({}), 'local');
});

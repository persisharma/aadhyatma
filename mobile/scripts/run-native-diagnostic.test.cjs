const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { runNativeDiagnostic } = require('./run-native-diagnostic.cjs');

test('terminates a genuinely stuck command and reports timeout', () => {
  assert.equal(runNativeDiagnostic(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], 100), 124);
});
test('preserves a diagnostic command failure', () => {
  assert.equal(runNativeDiagnostic(process.execPath, ['-e', 'process.exit(7)']), 7);
});
test('preserves success', () => {
  assert.equal(runNativeDiagnostic(process.execPath, ['-e', 'process.exit(0)']), 0);
});
test('CLI applies an explicit native-flow deadline to a real stuck process', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'run-native-diagnostic.cjs'), '--timeout-ms', '100', process.execPath, '-e', 'setInterval(() => {}, 1000)'], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 124);
  assert.match(result.stderr, /timed out after 100ms/);
});
test('CLI rejects an invalid deadline before starting the command', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'run-native-diagnostic.cjs'), '--timeout-ms', 'invalid', process.execPath, '-e', 'console.log("SHOULD NOT RUN")'], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
});

const test = require('node:test');
const assert = require('node:assert/strict');
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

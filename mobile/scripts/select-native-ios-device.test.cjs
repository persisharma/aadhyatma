const test = require('node:test');
const assert = require('node:assert/strict');
const { selectNativeIosDevice } = require('./select-native-ios-device.cjs');
const old = 'com.apple.CoreSimulator.SimRuntime.iOS-18-5';
const target = 'com.apple.CoreSimulator.SimRuntime.iOS-26-2';
const phone = (name, udid, isAvailable = true) => ({ name, udid, isAvailable });
const inventory = { devices: {
  [old]: [phone('iPhone SE (3rd generation)', 'old-se')],
  [target]: [phone('iPhone 17 Pro', 'pro'), phone('iPhone 16e', 'compact'), phone('iPad mini', 'tablet')],
} };

test('runtime selection cannot silently fall back to the older compact phone', () => {
  assert.equal(selectNativeIosDevice(inventory, { runtime: target }), 'compact');
});
test('keeps the previous compact preference when no runtime was requested', () => {
  assert.equal(selectNativeIosDevice(inventory), 'old-se');
});
test('reuses the exact preflight device when it belongs to the selected runtime', () => {
  assert.equal(selectNativeIosDevice(inventory, { runtime: target, udid: 'pro' }), 'pro');
});
test('rejects a preselected phone from the wrong runtime', () => {
  assert.throws(() => selectNativeIosDevice(inventory, { runtime: target, udid: 'old-se' }), /unavailable/);
});
test('fails explicitly when the requested runtime is absent', () => {
  assert.throws(() => selectNativeIosDevice(inventory, { runtime: 'missing' }), /No available iPhone/);
});
test('does not select tablets or unavailable phones', () => {
  const devices = { devices: { [target]: [phone('iPhone 16e', 'unavailable', false), phone('iPad mini', 'tablet')] } };
  assert.throws(() => selectNativeIosDevice(devices, { runtime: target }), /No available iPhone/);
});

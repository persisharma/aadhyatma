const { test } = require('node:test');
const assert = require('node:assert/strict');
const { configureMetaTracking, META_APP_ID } = require('../metaTrackingConfig');

const base = { name: 'Vedansh', android: { blockedPermissions: ['android.permission.RECORD_AUDIO'] }, plugins: ['expo-font'], extra: { eas: { projectId: 'existing' } } };
const sdkToken = 'a'.repeat(32); // synthetic fixture, never a real token

test('enabled configuration preserves existing plugins/EAS and never exposes the client token', () => {
  const result = configureMetaTracking(base, { META_TRACKING_ENABLED: 'true', META_CLIENT_TOKEN: sdkToken });
  assert.equal(result.extra.metaTrackingEnabled, true);
  assert.deepEqual(result.extra.eas, base.extra.eas);
  assert.equal(result.plugins[0], 'expo-font');
  assert.equal(JSON.stringify(result).includes(sdkToken), false);
  assert.equal(base.plugins.length, 1);
  assert.deepEqual(result.android.blockedPermissions, ['android.permission.RECORD_AUDIO', 'android.permission.ACCESS_ADSERVICES_CUSTOM_AUDIENCE']);
});

test('tracking defaults off and rejects missing credentials or an unverified app mapping', () => {
  assert.equal(configureMetaTracking(base, {}).extra.metaTrackingEnabled, false);
  assert.throws(() => configureMetaTracking(base, { META_TRACKING_ENABLED: 'true' }), /META_CLIENT_TOKEN/);
  assert.throws(() => configureMetaTracking(base, { META_APP_ID: 'wrong' }), /verified/);
  assert.equal(configureMetaTracking(base, { META_APP_ID }).extra.metaTrackingEnabled, false);
});

test('production requires an explicit choice and supports disabling collection', () => {
  assert.throws(() => configureMetaTracking(base, { EAS_BUILD_PROFILE: 'production' }), /Production build/);
  assert.equal(configureMetaTracking(base, { EAS_BUILD_PROFILE: 'production', META_TRACKING_ENABLED: 'false' }).extra.metaTrackingEnabled, false);
});

test('an enabled production build preserves the verified mapping', () => {
  const result = configureMetaTracking(base, { EAS_BUILD_PROFILE: 'production', META_TRACKING_ENABLED: 'true', META_CLIENT_TOKEN: sdkToken });
  assert.deepEqual(result.plugins.at(-1), ['./plugins/withMetaAppEvents', { enabled: true, appId: META_APP_ID }]);
});

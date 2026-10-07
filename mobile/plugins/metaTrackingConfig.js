const META_APP_ID = '1128589089734962';
const TRACKING_PERMISSION = 'Allow Vedansh to measure which ads lead to app installs.';

function configureMetaTracking(config, env) {
  const enabled = env.META_TRACKING_ENABLED === 'true';
  const appId = env.META_APP_ID || META_APP_ID;
  const clientToken = env.META_CLIENT_TOKEN || '';
  if (appId !== META_APP_ID) {
    throw new Error('META_APP_ID does not match the verified Vedansh Meta app. Reverify platform mappings before changing it.');
  }
  if (enabled && !/^[a-f0-9]{32}$/i.test(clientToken)) {
    throw new Error('Enabled Meta tracking requires META_CLIENT_TOKEN from the build environment. Never use the app secret.');
  }
  if (env.EAS_BUILD_PROFILE === 'production' && !['true', 'false'].includes(env.META_TRACKING_ENABLED)) {
    throw new Error('Production build requires an explicit META_TRACKING_ENABLED=true or false. Enabled builds require SDK client configuration.');
  }
  return {
    ...config,
    android: {
      ...config.android,
      // Core SDK transitively requests Android's custom-audience permission.
      // Install measurement does not need device-side audience enrollment.
      blockedPermissions: [...new Set([
        ...(config.android?.blockedPermissions || []),
        'android.permission.ACCESS_ADSERVICES_CUSTOM_AUDIENCE',
      ])],
    },
    extra: {
      ...config.extra,
      metaTrackingEnabled: enabled,
    },
    plugins: [
      ...(config.plugins || []),
      ['expo-tracking-transparency', { userTrackingPermission: TRACKING_PERMISSION }],
      ['./plugins/withMetaAppEvents', { enabled, appId }],
    ],
  };
}

module.exports = { configureMetaTracking, META_APP_ID, TRACKING_PERMISSION };

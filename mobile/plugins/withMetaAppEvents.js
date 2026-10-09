const {
  AndroidConfig, withAndroidManifest, withInfoPlist, withStringsXml,
} = require('@expo/config-plugins');

function withMetaAppEvents(config, { enabled, appId }) {
  // Read inside the native plugin, so the token isn't serialized into the
  // public Expo manifest's plugins array or Constants.expoConfig.
  const clientToken = enabled ? process.env.META_CLIENT_TOKEN : '';
  config = withInfoPlist(config, (cfg) => {
    Object.assign(cfg.modResults, {
      VedanshMetaTrackingEnabled: enabled,
      FacebookAppID: appId,
      FacebookClientToken: clientToken,
      FacebookDisplayName: 'Vedansh',
      FacebookAutoInitEnabled: false,
      FacebookAutoLogAppEventsEnabled: false,
      FacebookAdvertiserIDCollectionEnabled: false,
      FacebookCodelessDebugLogEnabled: false,
      FBSDKAutoLogMetaDataEnabled: false,
    });
    // Meta network identifiers from the maintained Expo Meta plugin. This is
    // configuration only; an actual SKAdNetwork postback needs a store campaign.
    const ids = new Set((cfg.modResults.SKAdNetworkItems || []).map((item) => item.SKAdNetworkIdentifier));
    ids.add('v9wttpbfk9.skadnetwork');
    ids.add('n38lu8286q.skadnetwork');
    cfg.modResults.SKAdNetworkItems = [...ids].map((SKAdNetworkIdentifier) => ({ SKAdNetworkIdentifier }));
    return cfg;
  });
  config = withStringsXml(config, (cfg) => {
    cfg.modResults = AndroidConfig.Strings.setStringItem([
      { $: { name: 'facebook_app_id', translatable: 'false' }, _: appId },
      { $: { name: 'facebook_client_token', translatable: 'false' }, _: clientToken },
    ], cfg.modResults);
    return cfg;
  });
  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    const values = {
      'com.vedansh.meta.TRACKING_ENABLED': String(enabled),
      'com.facebook.sdk.ApplicationId': '@string/facebook_app_id',
      'com.facebook.sdk.ClientToken': '@string/facebook_client_token',
      'com.facebook.sdk.ApplicationName': 'Vedansh',
      'com.facebook.sdk.AutoInitEnabled': 'false',
      'com.facebook.sdk.AutoLogAppEventsEnabled': 'false',
      'com.facebook.sdk.AdvertiserIDCollectionEnabled': 'false',
      'com.facebook.sdk.CodelessDebugLogEnabled': 'false',
    };
    app['meta-data'] = (app['meta-data'] || []).filter((item) => !(item.$['android:name'] in values));
    for (const [name, value] of Object.entries(values)) {
      app['meta-data'].push({ $: { 'android:name': name, 'android:value': value } });
    }
    return cfg;
  });
}

module.exports = withMetaAppEvents;

const fs = require('fs');
const path = require('path');
const { withAndroidManifest, withDangerousMod, withMainApplication, withEntitlementsPlist, AndroidConfig } = require('@expo/config-plugins');

const GROUP = 'group.com.prashantsharma.vedansh.widgets';
const ANDROID_FILES = ['WidgetPayloadContract.kt', 'VedanshWidgetModule.kt', 'VedanshWidgetPackage.kt', 'VedanshWidgetProvider.kt'];

function withAndroidWidgetManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    app.receiver = app.receiver || [];
    const name = `${cfg.android.package}.widgets.VedanshWidgetProvider`;
    if (!app.receiver.some((r) => r.$?.['android:name'] === name)) {
      app.receiver.push({
        $: { 'android:name': name, 'android:exported': 'false', 'android:label': 'Vedansh' },
        'intent-filter': [{ action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }] }],
        'meta-data': [{ $: { 'android:name': 'android.appwidget.provider', 'android:resource': '@xml/vedansh_widget_info' } }],
      });
    }
    return cfg;
  });
}

function copyTree(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const src = path.join(source, entry.name); const dst = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(src, dst); else fs.copyFileSync(src, dst);
  }
}

function withAndroidWidgetSources(config) {
  return withDangerousMod(config, ['android', async (cfg) => {
    const pkg = cfg.android.package;
    if (!pkg) throw new Error('withHomeWidgets: android.package is required');
    const base = path.join(cfg.modRequest.projectRoot, 'plugins', 'home-widgets', 'android');
    const java = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'java', ...pkg.split('.'), 'widgets');
    fs.mkdirSync(java, { recursive: true });
    for (const file of ANDROID_FILES) {
      const body = fs.readFileSync(path.join(base, file), 'utf8').replace(/__APP_PACKAGE__/g, pkg);
      fs.writeFileSync(path.join(java, file), body);
    }
    copyTree(path.join(base, 'res'), path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res'));
    const fixtureTarget = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'raw', 'vedansh_widget_payload_v1_fixture.json');
    fs.mkdirSync(path.dirname(fixtureTarget), { recursive: true });
    fs.copyFileSync(path.join(cfg.modRequest.projectRoot, 'src', 'widgets', 'fixtures', 'widget-payload-v1.json'), fixtureTarget);
    return cfg;
  }]);
}

function withAndroidPackage(config) {
  return withMainApplication(config, (cfg) => {
    let body = cfg.modResults.contents;
    const pkg = cfg.android.package;
    const importLine = `import ${pkg}.widgets.VedanshWidgetPackage`;
    if (body.includes('add(VedanshWidgetPackage())')) return cfg;
    if (!body.includes(importLine)) body = body.replace(/(package [^\n]+\n)/, `$1\n${importLine}\n`);
    let done = false;
    body = body.replace(/PackageList\(this\)\.packages\.apply\s*\{/, (m) => { done = true; return `${m}\n          add(VedanshWidgetPackage())`; });
    if (!done) body = body.replace(/(\bval\s+packages\s*=\s*PackageList\(this\)\.packages[^\n]*\n)/, (m) => { done = true; return `${m}            packages.add(VedanshWidgetPackage())\n`; });
    if (!done) throw new Error('withHomeWidgets: unsupported MainApplication template');
    cfg.modResults.contents = body;
    return cfg;
  });
}

function withAppGroup(config) {
  return withEntitlementsPlist(config, (cfg) => {
    const groups = new Set(cfg.modResults['com.apple.security.application-groups'] || []);
    groups.add(GROUP);
    cfg.modResults['com.apple.security.application-groups'] = [...groups];
    return cfg;
  });
}

module.exports = function withHomeWidgets(config) {
  config = withAndroidWidgetManifest(config);
  config = withAndroidWidgetSources(config);
  config = withAndroidPackage(config);
  config = withAppGroup(config);
  // iOS extension generation is installed below by the dedicated target mod.
  config = require('./withHomeWidgetsIos')(config, { appGroup: GROUP });
  return config;
};

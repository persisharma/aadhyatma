/**
 * Expo config plugin: install the native Android pieces of the Japam alarm
 * module into a CNG prebuild.
 *
 * What it injects:
 *   - AndroidManifest entries:
 *       <receiver android:name=".japamalarm.JapamAlarmReceiver" />
 *       <receiver android:name=".japamalarm.JapamBootReceiver">
 *         <intent-filter><action BOOT_COMPLETED /></intent-filter>
 *       </receiver>
 *   - Kotlin source files under
 *       android/app/src/main/java/<package>/japamalarm/
 *     copied from `plugins/native-android/` in this repo.
 *   - Wires `JapamAlarmPackage()` into `MainApplication.kt`'s `getPackages()`.
 *
 * What it does NOT do (handled elsewhere):
 *   - Add permissions — those live in `app.json` → android.permissions[]
 *     because Expo's Android plugin honours that list, and listing them in
 *     two places drifts.
 *   - Add @notifee/react-native — Notifee autolinks via the standard RN
 *     autolinking pass during prebuild.
 *
 * Idempotent: re-running prebuild after editing the Kotlin sources will
 * overwrite the copied files with the latest version from `plugins/native-android/`.
 */

const fs = require('fs');
const path = require('path');
const {
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
  AndroidConfig,
} = require('@expo/config-plugins');

const KOTLIN_PACKAGE_SUBDIR = 'japamalarm';

const KOTLIN_FILES = [
  'JapamAlarmModule.kt',
  'JapamAlarmReceiver.kt',
  'JapamBootReceiver.kt',
  'JapamAlarmPackage.kt',
];

function addReceiver(manifest, name, intentFilterAction) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.receiver = application.receiver || [];
  // Idempotent — skip if already present.
  const exists = application.receiver.some(
    (r) => r.$ && r.$['android:name'] === name
  );
  if (exists) return manifest;
  const receiver = {
    $: {
      'android:name': name,
      'android:exported': 'false',
    },
  };
  if (intentFilterAction) {
    receiver['intent-filter'] = [
      {
        action: [{ $: { 'android:name': intentFilterAction } }],
      },
    ];
    // BOOT_COMPLETED needs to be exported and direct-boot-aware.
    receiver.$['android:exported'] = 'true';
    receiver.$['android:directBootAware'] = 'true';
  }
  application.receiver.push(receiver);
  return manifest;
}

const withManifestReceivers = (config) =>
  withAndroidManifest(config, (cfg) => {
    cfg.modResults = addReceiver(
      cfg.modResults,
      `${cfg.android.package}.japamalarm.JapamAlarmReceiver`,
      null
    );
    cfg.modResults = addReceiver(
      cfg.modResults,
      `${cfg.android.package}.japamalarm.JapamBootReceiver`,
      'android.intent.action.BOOT_COMPLETED'
    );
    return cfg;
  });

const withKotlinSources = (config) =>
  withDangerousMod(config, [
    'android',
    async (cfg) => {
      const pkg = cfg.android.package;
      if (!pkg) throw new Error('android.package not set in app.json');
      const projectRoot = cfg.modRequest.projectRoot;
      const platformProjectRoot = cfg.modRequest.platformProjectRoot;

      const srcDir = path.join(projectRoot, 'plugins', 'native-android');
      const javaPkgPath = pkg.replace(/\./g, path.sep);
      const destDir = path.join(
        platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        javaPkgPath,
        KOTLIN_PACKAGE_SUBDIR
      );
      fs.mkdirSync(destDir, { recursive: true });

      for (const file of KOTLIN_FILES) {
        const srcPath = path.join(srcDir, file);
        if (!fs.existsSync(srcPath)) {
          throw new Error(
            `withJapamAlarmNative: missing Kotlin source ${srcPath}`
          );
        }
        let body = fs.readFileSync(srcPath, 'utf8');
        // The Kotlin sources use a placeholder package; substitute the real
        // application id at prebuild time so we don't hard-code a bundle id.
        body = body.replace(
          /__APP_PACKAGE__/g,
          `${pkg}.${KOTLIN_PACKAGE_SUBDIR}`
        );
        fs.writeFileSync(path.join(destDir, file), body, 'utf8');
      }
      return cfg;
    },
  ]);

/** Insert `add(JapamAlarmPackage())` into `MainApplication.kt`'s
 *  `getPackages()` override. Idempotent — bails if already present. */
const withMainApplicationWiring = (config) =>
  withMainApplication(config, (cfg) => {
    let body = cfg.modResults.contents;
    const pkg = cfg.android.package;
    const importLine = `import ${pkg}.${KOTLIN_PACKAGE_SUBDIR}.JapamAlarmPackage`;

    if (body.includes(importLine)) return cfg;

    // 1. Add the import after the package declaration.
    body = body.replace(
      /(package [^\n]+\n)/,
      `$1\n${importLine}\n`
    );

    // 2. Add the registration inside getPackages() — Expo's MainApplication.kt
    //    template builds the list via PackageList(this).packages, then
    //    .apply { add(...) }. We insert into that apply block.
    if (
      !body.includes('add(JapamAlarmPackage())') &&
      body.includes('PackageList(this).packages')
    ) {
      body = body.replace(
        /PackageList\(this\)\.packages([\s\S]*?)\}/,
        (match, tail) => {
          if (tail.includes('add(JapamAlarmPackage())')) return match;
          return `PackageList(this).packages.apply {\n              add(JapamAlarmPackage())\n            }${tail}}`;
        }
      );
    }

    cfg.modResults.contents = body;
    return cfg;
  });

module.exports = function withJapamAlarmNative(config) {
  config = withManifestReceivers(config);
  config = withKotlinSources(config);
  config = withMainApplicationWiring(config);
  return config;
};

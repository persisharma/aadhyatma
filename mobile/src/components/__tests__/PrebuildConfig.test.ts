import { execFileSync } from 'node:child_process';
import path from 'node:path';

/**
 * What the config plugins actually produce, checked without a native build.
 *
 * The native projects are generated (CNG), so nothing in the repo shows the
 * manifest, the Gradle properties or the Info.plist a build will get. Several
 * plugins also work by setting a property the Expo template happens to read
 * (`withAndroidReleaseShrink`): if a template renames it on an SDK bump, R8
 * silently turns off and nothing fails. This runs Expo's own introspection —
 * every plugin's mods, no files written — and pins the entries the app relies
 * on, so an SDK or plugin change that drops one fails here instead of in a
 * release build.
 *
 * Not covered: plugins that patch generated source or the Xcode project
 * (`MainApplication`, the widget target). Introspection does not run those; they
 * already fail loudly at prebuild when their anchor is missing.
 */
const root = path.resolve(__dirname, '../../..');

type Manifest = {
  manifest: {
    'uses-permission'?: { $: Record<string, string> }[];
    application: { $: Record<string, string>; receiver?: { $: Record<string, string> }[] }[];
  };
};
type Introspection = {
  version: string;
  _internal: {
    modResults: {
      android: { manifest: Manifest; gradleProperties: { type: string; key?: string; value?: string }[] };
      ios: {
        infoPlist: Record<string, unknown>;
        entitlements: Record<string, unknown>;
        expoPlist: Record<string, unknown>;
        podfileProperties: Record<string, string>;
      };
    };
  };
};

let config: Introspection;

beforeAll(() => {
  const cli = require.resolve('expo/bin/cli', { paths: [root] });
  const out = execFileSync(process.execPath, [cli, 'config', '--type', 'introspect', '--json'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  config = JSON.parse(out) as Introspection;
}, 120_000);

const android = () => config._internal.modResults.android;
const ios = () => config._internal.modResults.ios;
const permissions = () => android().manifest.manifest['uses-permission'] ?? [];
const granted = () => permissions().filter((p) => p.$['tools:node'] !== 'remove').map((p) => p.$['android:name']);
const removed = () => permissions().filter((p) => p.$['tools:node'] === 'remove').map((p) => p.$['android:name']);

describe('Android manifest', () => {
  test('keeps the permissions alarms, reminders and playback need', () => {
    for (const name of [
      'SCHEDULE_EXACT_ALARM',
      'POST_NOTIFICATIONS',
      'RECEIVE_BOOT_COMPLETED',
      'WAKE_LOCK',
      'FOREGROUND_SERVICE',
      'FOREGROUND_SERVICE_MEDIA_PLAYBACK',
    ]) {
      expect(granted()).toContain(`android.permission.${name}`);
    }
  });

  test('removes the permissions the app must not request', () => {
    for (const name of [
      'ACTIVITY_RECOGNITION',
      'CAMERA',
      'RECORD_AUDIO',
      // The photo library opens through the system picker, which needs neither.
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ]) {
      expect(removed()).toContain(`android.permission.${name}`);
      expect(granted()).not.toContain(`android.permission.${name}`);
    }
    for (const name of ['USE_EXACT_ALARM', 'USE_FULL_SCREEN_INTENT', 'READ_MEDIA_IMAGES']) {
      expect(granted()).not.toContain(`android.permission.${name}`);
    }
  });

  test('registers the alarm and widget receivers, and exports only the boot receiver', () => {
    const receivers = android().manifest.manifest.application[0].receiver ?? [];
    const byName = new Map(receivers.map((r) => [r.$['android:name'].split('.').pop(), r.$['android:exported']]));
    for (const name of ['JapamAlarmReceiver', 'JapamAlarmActionReceiver', 'VedanshPanchangWidgetProvider', 'VedanshVerseWidgetProvider']) {
      expect(byName.get(name)).toBe('false');
    }
    expect(byName.get('JapamBootReceiver')).toBe('true');
  });
});

describe('Gradle properties', () => {
  const property = (key: string) => android().gradleProperties.find((p) => p.type === 'property' && p.key === key)?.value;

  test('release shrinking, the New Architecture and Hermes are on', () => {
    expect(property('android.enableMinifyInReleaseBuilds')).toBe('true');
    expect(property('android.enableShrinkResourcesInReleaseBuilds')).toBe('true');
    expect(property('newArchEnabled')).toBe('true');
    expect(property('hermesEnabled')).toBe('true');
  });
});

describe('iOS', () => {
  test('carries the usage strings for features the app has, and none for ones it does not', () => {
    const keys = Object.keys(ios().infoPlist);
    for (const key of ['NSAlarmKitUsageDescription', 'NSPhotoLibraryAddUsageDescription', 'NSLocationWhenInUseUsageDescription']) {
      expect(keys).toContain(key);
    }
    // No Face ID, camera or microphone feature exists; an unused usage string is
    // something App Review asks about.
    for (const key of ['NSFaceIDUsageDescription', 'NSCameraUsageDescription', 'NSMicrophoneUsageDescription']) {
      expect(keys).not.toContain(key);
    }
  });

  test('has the widget App Group and the runtime version an OTA is matched on', () => {
    expect(ios().entitlements['com.apple.security.application-groups']).toEqual(['group.com.prashantsharma.vedansh.widgets']);
    expect(ios().expoPlist.EXUpdatesRuntimeVersion).toBe(config.version);
    expect(ios().podfileProperties.newArchEnabled).toBe('true');
  });
});

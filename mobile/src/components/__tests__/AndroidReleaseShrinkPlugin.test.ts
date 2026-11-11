import fs from 'node:fs';
import path from 'node:path';

/**
 * plugins/withAndroidReleaseShrink.js — Android release builds shrink code and
 * resources, and the native code this repo owns is kept whole.
 * docs/engineering/android-low-end-performance-native-2026-11.md.
 */
const root = path.resolve(__dirname, '../../..');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const plugin = require('../../../plugins/withAndroidReleaseShrink.js');

test('both shrink properties are set, once, whatever was there before', () => {
  const before = [
    { type: 'comment', value: 'existing' },
    { type: 'property', key: 'newArchEnabled', value: 'true' },
    { type: 'property', key: 'android.enableMinifyInReleaseBuilds', value: 'false' },
  ];
  const after = plugin.applyShrinkProperties(before);
  const value = (key: string) =>
    after.filter((item: { type: string; key?: string }) => item.type === 'property' && item.key === key);
  expect(value('android.enableMinifyInReleaseBuilds')).toEqual([
    { type: 'property', key: 'android.enableMinifyInReleaseBuilds', value: 'true' },
  ]);
  expect(value('android.enableShrinkResourcesInReleaseBuilds')).toEqual([
    { type: 'property', key: 'android.enableShrinkResourcesInReleaseBuilds', value: 'true' },
  ]);
  // Unrelated properties and comments survive.
  expect(after).toContainEqual({ type: 'property', key: 'newArchEnabled', value: 'true' });
  expect(after).toContainEqual({ type: 'comment', value: 'existing' });
  // Applying it again changes nothing.
  expect(plugin.applyShrinkProperties(after)).toEqual(after);
});

test('the property names are the ones the Expo template reads', () => {
  // If a future SDK renames them the build would silently stop shrinking.
  expect(Object.keys(plugin.SHRINK_PROPERTIES)).toEqual([
    'android.enableMinifyInReleaseBuilds',
    'android.enableShrinkResourcesInReleaseBuilds',
  ]);
});

test('app-owned native code is kept whole, appended after the template rules', () => {
  const template = '# react-native-reanimated\n-keep class com.swmansion.reanimated.** { *; }\n';
  const out: string = plugin.addKeepRules(template, 'com.example.app');
  expect(out.startsWith(template.trimEnd())).toBe(true);
  expect(out).toContain('-keep class com.example.app.** { *; }');
  for (const pkg of plugin.LOCAL_MODULE_PACKAGES) expect(out).toContain(`-keep class ${pkg}.** { *; }`);
  // Re-running prebuild on the same file must not stack a second copy.
  expect(plugin.addKeepRules(out, 'com.example.app')).toBe(out);
});

test('every local Expo module with Android code is covered by a keep rule', () => {
  const modulesDir = path.join(root, 'modules');
  const packages = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.kt')) {
        const declared = /^package\s+([\w.]+)/m.exec(fs.readFileSync(full, 'utf8'));
        if (declared) packages.add(declared[1]);
      }
    }
  };
  walk(modulesDir);
  expect(packages.size).toBeGreaterThan(0);
  for (const pkg of packages) {
    expect(plugin.LOCAL_MODULE_PACKAGES.some((kept: string) => pkg === kept || pkg.startsWith(`${kept}.`))).toBe(true);
  }
});

test('native code injected by the other plugins lives under the app package', () => {
  // …which is what the first keep rule covers.
  for (const dir of ['plugins/native-android', 'plugins/home-widgets/android']) {
    for (const name of fs.readdirSync(path.join(root, dir)).filter((file) => file.endsWith('.kt'))) {
      const source = fs.readFileSync(path.join(root, dir, name), 'utf8');
      expect(source).toMatch(/^package __APP_PACKAGE__(\.[\w.]+)?$/m);
    }
  }
});

test('app.json registers the plugin', () => {
  const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  expect(expo.plugins).toContain('./plugins/withAndroidReleaseShrink.js');
});

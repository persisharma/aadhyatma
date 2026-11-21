import fs from 'node:fs';
import os from 'node:os';
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

describe('resources that are only reached by a name built at runtime', () => {
  /** Kotlin the config plugins copy into the app, and the local Expo modules. */
  const nativeSources = (): { file: string; source: string }[] => {
    const found: { file: string; source: string }[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(kt|java)$/.test(entry.name)) found.push({ file: full, source: fs.readFileSync(full, 'utf8') });
      }
    };
    for (const dir of ['plugins/native-android', 'plugins/home-widgets/android', 'modules']) walk(path.join(root, dir));
    return found;
  };
  const RESOURCE_TYPES = /"(raw|drawable|mipmap|string|layout|color|dimen|xml|font|array|style|bool|integer|anim|menu|id)"/;
  /** Resource types passed to `getIdentifier` anywhere in app-owned native code. */
  const typesLookedUpByName = (): Map<string, string[]> => {
    const types = new Map<string, string[]>();
    for (const { file, source } of nativeSources()) {
      for (const call of source.split('getIdentifier(').slice(1)) {
        const type = RESOURCE_TYPES.exec(call.slice(0, call.indexOf(')')))?.[1] ?? 'unrecognised';
        types.set(type, [...(types.get(type) ?? []), path.relative(root, file)]);
      }
    }
    return types;
  };

  test('the keep file keeps every raw resource and cannot collide with Expo’s own', () => {
    expect(plugin.RAW_KEEP_XML).toContain('tools:keep="@raw/*"');
    expect(plugin.RAW_KEEP_XML).toContain('xmlns:tools="http://schemas.android.com/tools"');
    // `@expo/cli` generates res/raw/keep.xml while bundling; a second `raw/keep` fails the build.
    expect(plugin.RAW_KEEP_FILE).not.toBe('keep.xml');
    expect(plugin.RAW_KEEP_FILE).toMatch(/^[a-z][a-z0-9_]*\.xml$/);
  });

  test('prebuild writes it into res/raw, creating the folder when no other plugin has', () => {
    const project = fs.mkdtempSync(path.join(os.tmpdir(), 'vedansh-shrink-'));
    try {
      const file: string = plugin.writeRawKeepFile(project);
      expect(file).toBe(path.join(project, 'app', 'src', 'main', 'res', 'raw', plugin.RAW_KEEP_FILE));
      expect(fs.readFileSync(file, 'utf8')).toBe(plugin.RAW_KEEP_XML);
      // Running prebuild again over the same project is harmless.
      plugin.writeRawKeepFile(project);
      expect(fs.readdirSync(path.dirname(file))).toEqual([plugin.RAW_KEEP_FILE]);
    } finally {
      fs.rmSync(project, { recursive: true, force: true });
    }
  });

  test('the Japam alarm sounds are raw resources found by mantra id', () => {
    const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
    const notifications = expo.plugins.find((entry: unknown) => Array.isArray(entry) && entry[0] === 'expo-notifications');
    // expo-notifications copies these into res/raw; nothing in native code names them.
    expect(notifications[1].sounds.length).toBeGreaterThan(0);
    const receiver = fs.readFileSync(path.join(root, 'plugins/native-android/JapamAlarmReceiver.kt'), 'utf8');
    expect(receiver).toMatch(/getIdentifier\(\s*resourceName,\s*"raw"/);
  });

  test('every resource type app-owned native code looks up by name has a keep', () => {
    const widgetKeep = fs.readFileSync(path.join(root, 'plugins/home-widgets/android/res/raw/vedansh_widget_keep.xml'), 'utf8');
    const covered: Record<string, boolean> = {
      raw: plugin.RAW_KEEP_XML.includes('tools:keep="@raw/*"'),
      drawable: /tools:keep="@drawable\//.test(widgetKeep),
    };
    const types = typesLookedUpByName();
    // The two lookups this was written for; if either moves, this guard is looking in the wrong place.
    expect([...types.keys()].sort()).toEqual(expect.arrayContaining(['drawable', 'raw']));
    for (const [type, files] of types) {
      // A new type here needs its own keep entry before resource shrinking can be trusted with it.
      expect({ type, files, kept: covered[type] === true }).toEqual({ type, files, kept: true });
    }
  });
});

test('app.json registers the plugin', () => {
  const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  expect(expo.plugins).toContain('./plugins/withAndroidReleaseShrink.js');
});

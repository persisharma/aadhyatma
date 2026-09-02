import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('startup coordinator keeps planner and Panchang graph behind a dynamic boundary', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src/widgets/WidgetCoordinator.tsx'), 'utf8');
  assert.doesNotMatch(source, /^import .*planPayload/m);
  assert.match(source, /await import\('\.\/planPayload'\)/);
  assert.match(source, /InteractionManager\.runAfterInteractions/);
  assert.match(source, /generation !== generationRef\.current/);
  assert.match(source, /deviceTimeZone/);
});

test('native consumers include recovery and freshness validation', () => {
  const android = fs.readFileSync(path.join(process.cwd(), 'plugins/home-widgets/android/WidgetPayloadContract.kt'), 'utf8') + fs.readFileSync(path.join(process.cwd(), 'plugins/home-widgets/android/VedanshWidgetProvider.kt'), 'utf8');
  const ios = fs.readFileSync(path.join(process.cwd(), 'plugins/home-widgets/ios/WidgetPayloadContract.swift'), 'utf8') + fs.readFileSync(path.join(process.cwd(), 'plugins/home-widgets/ios/VedanshWidgets.swift'), 'utf8');
  for (const source of [android, ios]) {
    assert.match(source, /schemaVersion/);
    assert.match(source, /validThrough/);
    assert.match(source, /Asia\/Kolkata/);
    assert.match(source, /ताज़ा/);
    assert.match(source, /vedansh:\/\/widget\/panchang\?date=/);
  }
});

test('iOS emits offline dated entries, one kind per content type, and registers copied fonts', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'plugins/home-widgets/ios/VedanshWidgets.swift'), 'utf8');
  const plist = fs.readFileSync(path.join(process.cwd(), 'plugins/home-widgets/ios/Info.plist'), 'utf8');
  assert.match(source, /payload\.panchang\.days/);
  assert.match(source, /payload\.verses\.days/);
  // Content and size are independent (design.md §59): one widget kind per content
  // type, each advertising its own families — see catalog.test.ts for the exact
  // family↔size parity with the in-app gallery.
  for (const kind of ['VedanshVerseWidget', 'VedanshPanchangWidget', 'VedanshJapamWidget']) {
    assert.match(source, new RegExp(`let kind = "${kind}"`));
  }
  assert.equal(source.match(/\.supportedFamilies\(/g)?.length, 3);
  assert.match(plist, /CFBundleExecutable/);
  assert.match(plist, /UIAppFonts/);
});

test('config plugins wire the canonical fixture into both native decoders', () => {
  const androidPlugin = fs.readFileSync(path.join(process.cwd(), 'plugins/withHomeWidgets.js'), 'utf8');
  const iosPlugin = fs.readFileSync(path.join(process.cwd(), 'plugins/withHomeWidgetsIos.js'), 'utf8');
  const fixture = fs.readFileSync(path.join(process.cwd(), 'src/widgets/fixtures/widget-payload-v1.json'), 'utf8');
  assert.doesNotThrow(() => JSON.parse(fixture));
  assert.match(androidPlugin, /widget-payload-v1\.json/);
  assert.match(iosPlugin, /widget-payload-v1\.json/);
  assert.match(iosPlugin, /WidgetPayloadContract\.swift/);
});

test('App resolves a cold widget URL before navigation mounts', () => {
  const app = fs.readFileSync(path.join(process.cwd(), 'App.tsx'), 'utf8');
  const tabs = fs.readFileSync(path.join(process.cwd(), 'src/navigation/TabNavigator.tsx'), 'utf8');
  assert.match(app, /Linking\.getInitialURL\(\)/);
  assert.match(app, /parseWidgetDeepLink\(url\)/);
  assert.match(app, /<RootNavigator initialWidgetTarget=\{initialWidgetTarget\}/);
  assert.doesNotMatch(app, /retryWidgetDeepLink/);
  assert.match(tabs, /initialRouteName=\{initialRouteName\}/);
  assert.match(tabs, /initialWidgetTarget\?\.kind === 'verse'/);
  assert.match(tabs, /\? 'DailyBhaktiTab'/);
});

test('widget planning selects indexed verses without materialising the complete pool', () => {
  const planner = fs.readFileSync(path.join(process.cwd(), 'src/widgets/planPayload.ts'), 'utf8');
  const scheduler = fs.readFileSync(path.join(process.cwd(), 'src/notifications/scheduler.ts'), 'utf8');
  const routineUnits = fs.readFileSync(path.join(process.cwd(), 'src/data/routine/units.ts'), 'utf8');
  const pool = fs.readFileSync(path.join(process.cwd(), 'src/data/versePool.ts'), 'utf8');
  assert.doesNotMatch(planner, /getVersePool\(/);
  assert.doesNotMatch(scheduler, /getVersePool\(/);
  assert.doesNotMatch(routineUnits, /getVersePool\(/);
  assert.match(planner, /getVerseAtPoolIndex/);
  assert.match(scheduler, /getVerseAtPoolIndex/);
  assert.match(pool, /function getVerseAtPoolIndex/);
  assert.doesNotMatch(pool.match(/export function findVerse[\s\S]*$/)?.[0] ?? '', /getVersePool\(/);
});

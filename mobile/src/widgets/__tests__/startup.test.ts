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

test('iOS emits offline dated entries, distinct ambient/Japam kinds, and registers copied fonts', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'plugins/home-widgets/ios/VedanshWidgets.swift'), 'utf8');
  const plist = fs.readFileSync(path.join(process.cwd(), 'plugins/home-widgets/ios/Info.plist'), 'utf8');
  assert.match(source, /payload\.panchang\.days/);
  assert.match(source, /payload\.verses\.days/);
  assert.match(source, /VedanshAmbientWidget/);
  assert.match(source, /VedanshJapamWidget/);
  assert.match(source, /\.systemSmall, \.accessoryCircular/);
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

test('App consumes the cold initial widget URL through the retry bridge', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'App.tsx'), 'utf8');
  assert.match(source, /Linking\.getInitialURL\(\)/);
  assert.match(source, /retryWidgetDeepLink\(url\)/);
});

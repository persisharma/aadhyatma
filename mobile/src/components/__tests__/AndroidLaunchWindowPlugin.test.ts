import fs from 'node:fs';
import path from 'node:path';
import { lightColors } from '@/theme/colors';

/**
 * plugins/withAndroidLaunchWindow.js — new Android builds must never veto the
 * activity's first draw (an undrawn window has no input focus, so a Back press
 * becomes a "No focused window" ANR), and the frames before React's LaunchCover
 * must be the splash ivory rather than the DayNight default.
 * docs/engineering/android-anr-audit-2026-11.md §5.
 */
const root = path.resolve(__dirname, '../../..');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const plugin = require('../../../plugins/withAndroidLaunchWindow.js');

const TEMPLATE = `class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-x
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
  }
}
`;

test('MainActivity clears the splash keep flag before the activity first draws', () => {
  const out: string = plugin.addSplashRelease(TEMPLATE);
  const release = out.indexOf('SplashScreenManager.hide()');
  expect(release).toBeGreaterThan(-1);
  expect(release).toBeLessThan(out.indexOf('super.onCreate(null)'));
  // The unqualified call must be backed by an import (see the regression test below).
  expect(out).toContain('import expo.modules.splashscreen.SplashScreenManager');
  // Re-running prebuild on the same file must not stack a second copy.
  expect(plugin.addSplashRelease(out)).toBe(out);
});

test('does not suppress expo-splash-screen’s SplashScreenManager import', () => {
  // Regression: expo-splash-screen's own withAndroidSplashMainActivity adds the
  // import with a naive String.includes() dedup, then inserts an *unqualified*
  // `SplashScreenManager.registerOnActivity(this)`. A fully-qualified call in our
  // injected code embeds the import's substring, fools that dedup, drops the import
  // and breaks `:app:compileReleaseKotlin`. Reproduce the pipeline and assert the
  // import is added exactly once.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { addImports } = require('@expo/config-plugins/build/android/codeMod');
  const raw = `package com.prashantsharma.vedansh

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreenManager.registerOnActivity(this)
    super.onCreate(null)
  }
}
`;
  const afterOurs: string = plugin.addSplashRelease(raw);
  const afterExpo: string = addImports(afterOurs, ['expo.modules.splashscreen.SplashScreenManager'], false);
  const imports = afterExpo.match(/^import expo\.modules\.splashscreen\.SplashScreenManager$/gm) ?? [];
  expect(imports).toHaveLength(1);
  expect(afterExpo).toContain('SplashScreenManager.hide()');
  expect(afterExpo).toContain('SplashScreenManager.registerOnActivity(this)');
});

test('the launch window background is the splash ivory', () => {
  const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  expect(plugin.LAUNCH_WINDOW_COLOR).toBe(expo.splash.backgroundColor);
  expect(plugin.LAUNCH_WINDOW_COLOR).toBe(lightColors.brandIvory);
  const colors = plugin.applyLaunchWindowColors({ resources: {} });
  expect(colors.resources.color).toEqual([
    { $: { name: 'vedansh_launch_window' }, _: '#FFF1D5' },
  ]);
  const styles = plugin.applyLaunchWindowStyles({
    resources: { style: [{ $: { name: 'AppTheme', parent: 'Theme.AppCompat.DayNight.NoActionBar' }, item: [] }] },
  });
  expect(styles.resources.style[0].item).toContainEqual({
    $: { name: 'android:windowBackground' },
    _: '@color/vedansh_launch_window',
  });
});

test('app.json registers the plugin', () => {
  const { expo } = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  expect(expo.plugins).toContain('./plugins/withAndroidLaunchWindow.js');
});

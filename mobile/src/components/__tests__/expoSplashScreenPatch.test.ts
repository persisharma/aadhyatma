import fs from 'node:fs';
import path from 'node:path';

/**
 * Play Vitals (Nov 2026, 1.5.5, Android 12L): a framework NPE in
 * SurfaceControl.checkNotReleased via ActivityThread.syncTransferSplashscreenViewTransaction.
 * That transfer only happens when an exit-animation listener is registered, and
 * expo-splash-screen registers its fade unconditionally.
 * patches/expo-splash-screen+<version>.patch skips the listener on API 31–32 only.
 * patch-package only WARNS on a version mismatch, so pin the file and the guard.
 */
const root = path.resolve(__dirname, '../../..');
const pkgDir = path.join(root, 'node_modules/expo-splash-screen');
const installed = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'))
  .version as string;

test('the expo-splash-screen patch matches the installed version', () => {
  expect(fs.existsSync(path.join(root, `patches/expo-splash-screen+${installed}.patch`))).toBe(
    true
  );
});

test('Android 12/12L skips the splash exit-animation listener; other levels keep it', () => {
  const source = fs.readFileSync(
    path.join(pkgDir, 'android/src/main/java/expo/modules/splashscreen/SplashScreenManager.kt'),
    'utf8'
  );
  const guard = source.indexOf(
    'Build.VERSION.SDK_INT == Build.VERSION_CODES.S || Build.VERSION.SDK_INT == Build.VERSION_CODES.S_V2'
  );
  const listener = source.indexOf('splashScreen.setOnExitAnimationListener');
  expect(guard).toBeGreaterThan(-1);
  expect(listener).toBeGreaterThan(guard);
  expect(source.slice(guard, listener)).toMatch(/return\s*\n/);
});

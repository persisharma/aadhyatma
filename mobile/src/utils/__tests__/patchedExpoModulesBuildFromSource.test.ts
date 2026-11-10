import fs from 'node:fs';
import path from 'node:path';

/**
 * Expo SDK 54 ships many modules as prebuilt AARs (`android.publication` in
 * expo-module.config.json, stored in the package's local-maven-repo). Autolinking
 * links that AAR instead of compiling android/src unless the project name matches
 * `expo.autolinking.android.buildFromSource` (expo-modules-autolinking
 * SettingsManager.configurePublication). A patch-package fix to such a module's
 * Kotlin/Java is therefore silently dropped from the build unless it is listed there.
 */
const root = path.resolve(__dirname, '../../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const buildFromSource: string[] = pkg.expo?.autolinking?.android?.buildFromSource ?? [];

const patchesDir = path.join(root, 'patches');
// patches/<name with / as +>+<version>.patch → [package name, patch text]
const patches = fs
  .readdirSync(patchesDir)
  .filter((file) => file.endsWith('.patch'))
  .map((file) => [
    file.replace(/\+[^+]+\.patch$/, '').replace(/\+/g, '/'),
    fs.readFileSync(path.join(patchesDir, file), 'utf8'),
  ]);

const prebuiltPatched = patches
  .filter(([name, patch]) => {
    const configPath = path.join(root, 'node_modules', name, 'expo-module.config.json');
    if (!fs.existsSync(configPath)) return false;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.android?.publication != null && /\/android\/src\//.test(patch);
  })
  .map(([name]) => name);

test('the guard sees the patched prebuilt Expo modules', () => {
  expect(prebuiltPatched).toEqual(
    expect.arrayContaining(['expo-notifications', 'expo-splash-screen', 'expo-speech'])
  );
});

test.each(prebuiltPatched)('%s is compiled from its patched source, not the prebuilt AAR', (name) => {
  expect(buildFromSource.some((pattern) => new RegExp(`^(?:${pattern})$`).test(name))).toBe(true);
});

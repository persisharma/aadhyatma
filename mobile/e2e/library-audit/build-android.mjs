// Build a test-only APK. Generated native configuration is restored afterwards.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const destination = path.resolve(process.argv[2] ?? '/tmp/vedansh-android/verse-audit.apk');
const gradle = path.join(root, 'android/app/build.gradle');
const manifest = path.join(root, 'android/app/src/main/AndroidManifest.xml');
if (!fs.existsSync(gradle)) throw new Error('Run expo prebuild --platform android first');
const originals = [gradle, manifest].map(file => [file, fs.readFileSync(file, 'utf8')]);
const run = (command, args, cwd = root) => {
  const result = spawnSync(command, args, { cwd, env: process.env, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} failed: ${result.status}`);
};
try {
  run('node', ['e2e/library-audit/prepare.mjs']);
  const entry = originals[0][1].replace(/^    entryFile = .*$/m,
    '    entryFile = file("../../e2e/library-audit/index.jsx")');
  const isolated = originals[1][1].replace(
    'android:name="expo.modules.updates.ENABLED" android:value="true"',
    'android:name="expo.modules.updates.ENABLED" android:value="false"');
  if (entry === originals[0][1] || isolated === originals[1][1]) {
    throw new Error('Native entry/Updates configuration did not match; refusing an ambiguous audit build');
  }
  fs.writeFileSync(gradle, entry);
  fs.writeFileSync(manifest, isolated);
  run('./gradlew', ['assembleRelease', '-PreactNativeArchitectures=arm64-v8a', '--max-workers=4'], path.join(root, 'android'));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, 'android/app/build/outputs/apk/release/app-release.apk'), destination);
  console.log(`Test-only audit APK: ${destination}`);
} finally {
  for (const [file, contents] of originals) fs.writeFileSync(file, contents);
}

import fs from 'node:fs';
import path from 'node:path';

/**
 * A notification small icon must be a simple drawable the system UI process can
 * load and tint across the binder. The Japam alarm notification used
 * context.applicationInfo.icon — the launcher's ADAPTIVE icon — which strict OEM
 * ROMs (e.g. vivo / Android 11) fail to render as a small icon, throwing
 * android.app.RemoteServiceException ("Bad notification posted"). It must use the
 * dedicated monochrome drawable bundled by the config plugin instead
 * (Android crash hardening, Nov 2026).
 */
const pluginsDir = path.resolve(__dirname, '../../../plugins');
const receiver = fs.readFileSync(
  path.join(pluginsDir, 'native-android', 'JapamAlarmReceiver.kt'),
  'utf8',
);
const configPlugin = fs.readFileSync(
  path.join(pluginsDir, 'withJapamAlarmNative.js'),
  'utf8',
);

test('the alarm notification never uses the adaptive launcher icon as its small icon', () => {
  expect(receiver).not.toMatch(/setSmallIcon\(\s*context\.applicationInfo\.icon\s*\)/);
  expect(receiver).toMatch(/\.setSmallIcon\(smallIconRes\(context\)\)/);
});

test('smallIconRes resolves the dedicated monochrome drawable', () => {
  expect(receiver).toMatch(/getIdentifier\(\s*"ic_japam_notification",\s*"drawable"/);
});

test('the dedicated notification drawable is bundled and copied by the config plugin', () => {
  const drawable = path.join(
    pluginsDir,
    'native-android',
    'res',
    'drawable',
    'ic_japam_notification.xml',
  );
  expect(fs.existsSync(drawable)).toBe(true);
  expect(fs.readFileSync(drawable, 'utf8')).toMatch(/<vector/);
  // The prebuild config plugin must copy it into res/drawable.
  expect(configPlugin).toMatch(/ic_japam_notification\.xml/);
  expect(configPlugin).toMatch(/'drawable'/);
});

import fs from 'node:fs';
import path from 'node:path';

/**
 * Play Vitals (3–10 Nov 2026, 1.5.5): tapping a local reminder on Android 12
 * (Samsung) crashed in NotificationForwarderActivity.onCreate with
 * "notification (null) and action (null) should not be null". Upstream fixed it
 * in expo/expo#43203 (SDK 55); the SDK 54 line stops at 0.32.17 without it, so
 * patches/expo-notifications+<version>.patch backports it. patch-package only
 * WARNS on a version mismatch, so pin both the file name and the patched source.
 */
const root = path.resolve(__dirname, '../../..');
const pkgDir = path.join(root, 'node_modules/expo-notifications');
const installed = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'))
  .version as string;
const serviceDir = path.join(
  pkgDir,
  'android/src/main/java/expo/modules/notifications/service'
);
const read = (file: string) => fs.readFileSync(path.join(serviceDir, file), 'utf8');

test('the expo-notifications patch matches the installed version', () => {
  expect(fs.existsSync(path.join(root, `patches/expo-notifications+${installed}.patch`))).toBe(
    true
  );
});

test('a notification tap whose extras cannot be read opens the app instead of crashing', () => {
  const activity = read('NotificationForwarderActivity.kt');
  expect(activity).toMatch(/try \{\s*val broadcastIntent =/);
  // RuntimeException also covers BadParcelableException from a corrupt extras parcel.
  expect(activity).toMatch(/catch \(e: RuntimeException\)/);
  expect(activity).toMatch(/catch \(fallback: RuntimeException\)/);
  expect(activity).toMatch(/getLaunchIntentForPackage\(packageName\)/);
  // finish() must run on both paths, outside the try.
  expect(activity).toMatch(/\}\s*finish\(\)\s*\}/);
});

test('the tap PendingIntent carries a byte-array copy that the forwarder falls back to', () => {
  const service = read('NotificationsService.kt');
  expect(service).toMatch(/putExtra\(NOTIFICATION_BYTES_KEY, it\)/);
  expect(service).toMatch(/putExtra\(NOTIFICATION_ACTION_BYTES_KEY, it\)/);
  expect(service).toMatch(
    /getParcelable<Notification>\(NOTIFICATION_KEY\) \?: unmarshalObject\(Notification\.CREATOR/
  );
  expect(service).toMatch(
    /getParcelable<NotificationAction>\(NOTIFICATION_ACTION_KEY\) \?: unmarshalObject\(NotificationAction\.CREATOR/
  );
});

import fs from 'node:fs';
import path from 'node:path';

const mobileRoot = path.resolve(__dirname, '../../..');

describe('Android Japam alarm permission policy', () => {
  test('uses user-granted exact alarms without requesting full-screen access', () => {
    const appConfig = JSON.parse(
      fs.readFileSync(path.join(mobileRoot, 'app.json'), 'utf8')
    );
    const permissions: string[] = appConfig.expo.android.permissions;

    expect(permissions).toContain('SCHEDULE_EXACT_ALARM');
    expect(permissions).not.toContain('USE_EXACT_ALARM');
    expect(permissions).not.toContain('USE_FULL_SCREEN_INTENT');
  });

  test('posts the alarm notification without a full-screen intent', () => {
    const receiver = fs.readFileSync(
      path.join(
        mobileRoot,
        'plugins/native-android/JapamAlarmReceiver.kt'
      ),
      'utf8'
    );

    expect(receiver).not.toContain('.setFullScreenIntent(');
    expect(receiver).toContain('.setCategory(NotificationCompat.CATEGORY_ALARM)');
    expect(receiver).toContain('AudioAttributes.USAGE_ALARM');
  });

  test('a notification that cannot be posted never ends the repeating alarm', () => {
    // The receiver runs in the background with nobody to report to. An exception
    // while creating the channel or posting (a revoked permission, a sound that
    // will not resolve) used to crash the process there and skip the re-arm, so
    // the alarm stopped repeating until the app was next opened.
    const receiver = fs.readFileSync(
      path.join(mobileRoot, 'plugins/native-android/JapamAlarmReceiver.kt'),
      'utf8'
    );
    const onReceive = receiver.slice(receiver.indexOf('override fun onReceive'));
    const post = onReceive.indexOf('postAlarmNotification(context');
    const rearm = onReceive.indexOf('rescheduleNextOccurrence(context');
    expect(post).toBeGreaterThan(-1);
    expect(rearm).toBeGreaterThan(post);
    // The post sits inside a try whose catch swallows the failure; the re-arm
    // comes after that block, so it runs either way.
    const guarded = onReceive.slice(0, rearm);
    expect(guarded).toMatch(/try \{\s*postAlarmNotification\(context[^}]*\} catch \(\w+: Throwable\)/);
  });

  test('provides the user-controlled exact-alarm settings flow', () => {
    const moduleSource = fs.readFileSync(
      path.join(mobileRoot, 'plugins/native-android/JapamAlarmModule.kt'),
      'utf8'
    );

    expect(moduleSource).toContain(
      'Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM'
    );
    expect(moduleSource).toContain('fun requestExactAlarmPermission');
  });
});

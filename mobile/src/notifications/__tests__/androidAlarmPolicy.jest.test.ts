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

package __APP_PACKAGE__

import android.app.AlarmManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/**
 * Re-arms every persisted Japam alarm after a device reboot.
 *
 * AlarmManager PendingIntents do NOT survive reboot. Without this receiver,
 * a user's 6 AM alarm dies silently if the phone updates and reboots
 * overnight. JapamAlarmModule persists the alarm list to SharedPreferences
 * on every schedule call; this receiver replays them.
 *
 * Skips already-passed fireAt values — those will be re-armed by the JS
 * layer on next app foreground when the JapamAlarmsContext reconciler runs.
 */
class JapamBootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED &&
            intent.action != Intent.ACTION_LOCKED_BOOT_COMPLETED &&
            intent.action != "android.intent.action.QUICKBOOT_POWERON" &&
            intent.action != "com.htc.intent.action.QUICKBOOT_POWERON") {
            return
        }

        val alarms = JapamAlarmModule.readPersistedAlarms(context)
        if (alarms.length() == 0) return

        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
        val now = System.currentTimeMillis()

        for (i in 0 until alarms.length()) {
            val a = alarms.optJSONObject(i) ?: continue
            val alarmId = a.optString("alarmId", null) ?: continue
            val mantraId = a.optString("mantraId", null) ?: continue
            val fireAt = a.optLong("fireAt", 0L)
            val label = if (a.has("label")) a.optString("label", null) else null
            if (fireAt <= now) {
                // Past — leave for JS reconciler on next foreground.
                continue
            }
            try {
                val pi = JapamAlarmModule.buildPendingIntent(
                    context, alarmId, mantraId, fireAt, label
                )
                if (canExact) {
                    val showPi = android.app.PendingIntent.getActivity(
                        context,
                        0,
                        context.packageManager.getLaunchIntentForPackage(context.packageName)
                            ?: Intent(),
                        android.app.PendingIntent.FLAG_UPDATE_CURRENT or
                            android.app.PendingIntent.FLAG_IMMUTABLE
                    )
                    am.setAlarmClock(AlarmManager.AlarmClockInfo(fireAt, showPi), pi)
                } else {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi)
                }
            } catch (_: Throwable) {
                // One alarm's failure shouldn't block the others.
            }
        }
    }
}

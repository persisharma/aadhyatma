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
 * When a reboot happens AFTER the stored fireAt (the alarm already fired, or
 * the device was off when it should have), it re-arms the next daily
 * occurrence rather than dropping the alarm; the JS reconciler still corrects
 * everything on the next app foreground.
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
            val storedFireAt = a.optLong("fireAt", 0L)
            if (storedFireAt <= 0L) continue
            val label = if (a.has("label")) a.optString("label", null) else null
            val repeatDaysEncoded =
                if (a.has("repeatDays")) a.optString("repeatDays", null) else null
            val repeatDays = JapamAlarmModule.parseRepeatDays(repeatDaysEncoded)
            // A reboot after the stored fire time leaves storedFireAt in the
            // past. Re-arm the next valid occurrence (preserving its wall-clock
            // time and honouring repeat days) instead of skipping, so a 6 AM
            // alarm survives an 8 AM reboot without waiting for the next app
            // foreground. A one-shot whose moment passed while the device was
            // off is gone — don't resurrect it for tomorrow.
            val fireAt =
                if (storedFireAt > now) storedFireAt
                else nextOccurrenceFrom(storedFireAt, now, repeatDays)
            if (fireAt <= 0L) continue
            try {
                val pi = JapamAlarmModule.buildPendingIntent(
                    context, alarmId, mantraId, fireAt, label, repeatDaysEncoded
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

    /**
     * Next epoch-ms occurrence of the wall-clock time encoded in [pastFireAt],
     * at or after [now], on a weekday allowed by [repeatDays] (null = daily;
     * empty = one-shot → returns 0 so the caller drops it). Mirrors the JS
     * `nextAlarmFireTimestamp` so reboot re-arm matches what the app
     * schedules on foreground.
     */
    private fun nextOccurrenceFrom(pastFireAt: Long, now: Long, repeatDays: Set<Int>?): Long {
        if (repeatDays != null && repeatDays.isEmpty()) return 0L
        val src = java.util.Calendar.getInstance().apply { timeInMillis = pastFireAt }
        val cal = java.util.Calendar.getInstance().apply {
            timeInMillis = now
            set(java.util.Calendar.HOUR_OF_DAY, src.get(java.util.Calendar.HOUR_OF_DAY))
            set(java.util.Calendar.MINUTE, src.get(java.util.Calendar.MINUTE))
            set(java.util.Calendar.SECOND, 0)
            set(java.util.Calendar.MILLISECOND, 0)
        }
        for (i in 0 until 8) {
            val jsDay = cal.get(java.util.Calendar.DAY_OF_WEEK) - 1
            val dayOk = repeatDays == null || repeatDays.contains(jsDay)
            if (cal.timeInMillis > now && dayOk) return cal.timeInMillis
            cal.add(java.util.Calendar.DAY_OF_YEAR, 1)
        }
        return cal.timeInMillis
    }
}

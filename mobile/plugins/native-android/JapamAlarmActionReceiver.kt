package __APP_PACKAGE__

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/**
 * Handles the Stop / Snooze action buttons that JapamAlarmReceiver attaches
 * to each posted alarm notification.
 *
 *   STOP  → dismiss the notification (it would auto-dismiss on tap, but the
 *           explicit Stop button is what the user expects on the lock-screen
 *           full-screen alert).
 *   SNOOZE_5M → dismiss the current notification, then schedule a one-shot
 *           fire 5 minutes from now using a snooze-suffixed alarmId so it
 *           coexists with the standard 24h re-arm that JapamAlarmReceiver
 *           already wrote when the alarm fired.
 *
 * Implemented as a separate receiver from JapamAlarmReceiver so the action-
 * button branch is small, doesn't share state with the firing logic, and
 * doesn't accidentally re-trigger the 24h re-arm path.
 */
class JapamAlarmActionReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_STOP = "com.vedansh.japam.ACTION_STOP"
        const val ACTION_SNOOZE_5M = "com.vedansh.japam.ACTION_SNOOZE_5M"
        const val SNOOZE_MS = 5L * 60L * 1000L
        const val SNOOZE_SUFFIX = ":snooze"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra(JapamAlarmModule.INTENT_EXTRA_ALARM_ID) ?: return
        val mantraId = intent.getStringExtra(JapamAlarmModule.INTENT_EXTRA_MANTRA_ID)
        val label = intent.getStringExtra(JapamAlarmModule.INTENT_EXTRA_LABEL)

        // Always dismiss the notification first — both actions imply "stop
        // making noise right now".
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.cancel(alarmId.hashCode())

        when (intent.action) {
            ACTION_STOP -> {
                /* nothing else to do — re-arm for the next day already happened
                   when the original alarm fired. */
            }
            ACTION_SNOOZE_5M -> {
                if (mantraId == null) return
                scheduleSnooze(context, alarmId, mantraId, label)
            }
        }
    }

    private fun scheduleSnooze(
        context: Context,
        baseAlarmId: String,
        mantraId: String,
        label: String?
    ) {
        val fireAt = System.currentTimeMillis() + SNOOZE_MS
        // Distinct PendingIntent request code so the snooze doesn't displace
        // the standard daily PendingIntent that's already armed.
        val snoozeAlarmId = baseAlarmId + SNOOZE_SUFFIX
        // Empty repeat-days: a snooze is inherently one-shot (the `:snooze`
        // suffix already blocks re-arm in the receiver; this makes it doubly so).
        val pi = JapamAlarmModule.buildPendingIntent(
            context, snoozeAlarmId, mantraId, fireAt, label, ""
        )
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
        try {
            if (canExact) {
                val showPi = PendingIntent.getActivity(
                    context,
                    0,
                    context.packageManager.getLaunchIntentForPackage(context.packageName)
                        ?: Intent(),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                am.setAlarmClock(AlarmManager.AlarmClockInfo(fireAt, showPi), pi)
            } else {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi)
            }
        } catch (_: Throwable) {
            /* non-fatal */
        }
    }
}

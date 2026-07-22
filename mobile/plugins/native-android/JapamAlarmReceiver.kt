package __APP_PACKAGE__

import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat

/**
 * Fired by AlarmManager.setAlarmClock at the scheduled minute. Responsible
 * for:
 *   - posting the alarm notification with the mantra sound + full-screen
 *     intent so the lock screen wakes;
 *   - attaching Stop / Snooze action buttons (handled by
 *     [JapamAlarmActionReceiver]);
 *   - re-arming the same alarm for its next repeat day (daily when no
 *     `repeatDays` extra rides along; the selected weekdays otherwise; never
 *     for a one-shot / empty extra) — UNLESS this fire is itself a snooze
 *     (alarmId carries `:snooze`), in which case the cycle is already armed
 *     under the base alarmId and re-arming would compound.
 *
 * Tap routing: the content PendingIntent launches an Activity carrying a
 * `vedansh://japam-alarm?...` deep link. Expo's intent-filter for the app's
 * scheme catches it, and the JS Linking listener routes it via deepLink.ts.
 */
class JapamAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra(JapamAlarmModule.INTENT_EXTRA_ALARM_ID) ?: return
        val mantraId = intent.getStringExtra(JapamAlarmModule.INTENT_EXTRA_MANTRA_ID) ?: return
        val fireAt = intent.getLongExtra(JapamAlarmModule.INTENT_EXTRA_FIRE_AT, 0L)
        val label = intent.getStringExtra(JapamAlarmModule.INTENT_EXTRA_LABEL)
        val repeatDaysEncoded = intent.getStringExtra(JapamAlarmModule.INTENT_EXTRA_REPEAT_DAYS)

        val isSnoozeFire = alarmId.endsWith(JapamAlarmActionReceiver.SNOOZE_SUFFIX)
        // For the action buttons we attribute Stop/Snooze to the BASE alarm
        // (a snooze that triggers another snooze should reference the same
        // logical alarm, not snowball its id).
        val baseAlarmId = if (isSnoozeFire) {
            alarmId.removeSuffix(JapamAlarmActionReceiver.SNOOZE_SUFFIX)
        } else alarmId

        // Orphaned snooze: the base alarm was deleted or disabled after the
        // user tapped Snooze (reconcile deliberately spares in-flight snooze
        // PendingIntents so opening the app mid-countdown doesn't lose the
        // re-ring). Suppress at fire time instead: if the base alarm is no
        // longer armed, the snooze must not ring.
        if (isSnoozeFire && !isAlarmStillArmed(context, baseAlarmId)) return

        postAlarmNotification(context, alarmId, baseAlarmId, mantraId, label)

        if (!isSnoozeFire) {
            rescheduleNextOccurrence(context, alarmId, mantraId, fireAt, label, repeatDaysEncoded)
        }
    }

    private fun isAlarmStillArmed(context: Context, alarmId: String): Boolean {
        val alarms = JapamAlarmModule.readPersistedAlarms(context)
        for (i in 0 until alarms.length()) {
            val a = alarms.optJSONObject(i) ?: continue
            if (a.optString("alarmId") == alarmId) return true
        }
        return false
    }

    private fun postAlarmNotification(
        context: Context,
        notificationKey: String,
        baseAlarmId: String,
        mantraId: String,
        label: String?
    ) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Per-mantra channel: Android 8+ binds sound at channel-creation time
        // so each mantra gets its own channel keyed by sanitised mantraId.
        // NAME-based resource URI, never the int resource id: raw ids renumber
        // on app updates while the channel keeps the URI it was created with,
        // which turns the alarm silent after an update.
        val soundResId = lookupSoundResource(context, mantraId)
        val soundUri: Uri? = if (soundResId != 0) {
            Uri.parse(
                "android.resource://${context.packageName}/raw/${mantraId.replace("-", "_")}"
            )
        } else null
        val channelId = if (soundResId != 0) "japam-alarm-$mantraId-v2" else "japam-alarm-default-v2"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ensureChannel(nm, channelId, soundUri)
        }

        // Tap → MainActivity via deep link → JS Linking listener → counter.
        val deepLink = Uri.parse(
            "vedansh://japam-alarm?alarmId=$baseAlarmId&mantraId=$mantraId"
        )
        val contentIntent = Intent(Intent.ACTION_VIEW, deepLink).apply {
            setPackage(context.packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val contentPi = PendingIntent.getActivity(
            context,
            notificationKey.hashCode(),
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopPi = buildActionPendingIntent(
            context,
            notificationKey,
            baseAlarmId,
            mantraId,
            label,
            JapamAlarmActionReceiver.ACTION_STOP,
            requestCodeOffset = 1
        )
        val snoozePi = buildActionPendingIntent(
            context,
            notificationKey,
            baseAlarmId,
            mantraId,
            label,
            JapamAlarmActionReceiver.ACTION_SNOOZE_5M,
            requestCodeOffset = 2
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(context.applicationInfo.icon)
            .setContentTitle(label?.takeIf { it.isNotBlank() } ?: "जप का समय · Japam time")
            .setContentText("Tap to begin chanting")
            .setContentIntent(contentPi)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setOngoing(false)
            .setFullScreenIntent(contentPi, true)
            .addAction(0, "Stop", stopPi)
            .addAction(0, "Snooze 5m", snoozePi)

        // Pre-Android-8 path: channel doesn't carry sound, so set it on the
        // notification builder directly, on the ALARM stream (see
        // ensureChannel). Falls back to the system default alarm ringtone
        // when no custom WAV is bundled for the mantra.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            builder.setSound(
                soundUri ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM),
                AudioManager.STREAM_ALARM
            )
            builder.setDefaults(Notification.DEFAULT_VIBRATE or Notification.DEFAULT_LIGHTS)
        }

        nm.notify(notificationKey.hashCode(), builder.build())
    }

    private fun buildActionPendingIntent(
        context: Context,
        notificationKey: String,
        baseAlarmId: String,
        mantraId: String,
        label: String?,
        action: String,
        requestCodeOffset: Int
    ): PendingIntent {
        val intent = Intent(context, JapamAlarmActionReceiver::class.java).apply {
            this.action = action
            putExtra(JapamAlarmModule.INTENT_EXTRA_ALARM_ID, baseAlarmId)
            // The notification is posted under notificationKey.hashCode()
            // (the snooze-suffixed id for a snooze fire); the action receiver
            // must dismiss THAT id, not the base alarm's.
            putExtra(JapamAlarmModule.INTENT_EXTRA_NOTIFICATION_KEY, notificationKey)
            putExtra(JapamAlarmModule.INTENT_EXTRA_MANTRA_ID, mantraId)
            if (label != null) putExtra(JapamAlarmModule.INTENT_EXTRA_LABEL, label)
        }
        return PendingIntent.getBroadcast(
            context,
            notificationKey.hashCode() + requestCodeOffset,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun ensureChannel(nm: NotificationManager, channelId: String, soundUri: Uri?) {
        // The retired v1 channels (same ids without the -v2 suffix) rang on
        // the NOTIFICATION stream, which vibrate/silent mode, DnD, and a
        // zeroed notification-volume slider all mute — the "alarm makes no
        // sound on Android" bug. A channel pins its sound + audio attributes
        // at creation, so the fix requires fresh channel ids; delete the v1
        // channel so it doesn't linger in the app's notification settings.
        nm.deleteNotificationChannel(channelId.removeSuffix("-v2"))
        // Idempotent — getNotificationChannel returns null if not yet created.
        if (nm.getNotificationChannel(channelId) != null) return
        val channel = NotificationChannel(
            channelId,
            "Japam Alarms",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Alarms with the mantra audio as the alarm tone."
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 250, 250, 250)
            // USAGE_ALARM: ring on the alarm stream — audible through
            // vibrate/silent and governed by the alarm volume slider, like
            // the Clock app and the AlarmKit tier on iOS.
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build()
            setSound(
                soundUri ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM),
                attrs
            )
        }
        nm.createNotificationChannel(channel)
    }

    /** Look up the bundled alarm WAV by mantraId. The expo-notifications
     *  config plugin copies WAVs from app.json's `sounds[]` into
     *  `android/app/src/main/res/raw/`, replacing hyphens with underscores.
     *  Returns 0 if no resource is bundled — the caller falls back to the
     *  system notification ringtone. */
    private fun lookupSoundResource(context: Context, mantraId: String): Int {
        val resourceName = mantraId.replace("-", "_")
        return context.resources.getIdentifier(
            resourceName,
            "raw",
            context.packageName
        )
    }

    private fun rescheduleNextOccurrence(
        context: Context,
        alarmId: String,
        mantraId: String,
        fireAt: Long,
        label: String?,
        repeatDaysEncoded: String?
    ) {
        if (fireAt <= 0) return
        val repeatDays = JapamAlarmModule.parseRepeatDays(repeatDaysEncoded)
        val next = JapamAlarmModule.nextOccurrenceAfter(fireAt, repeatDays)
        // One-shot (empty day set): fired once, nothing to re-arm. The JS
        // layer auto-disables the alarm on the next app foreground.
        if (next <= 0L) {
            removePersistedAlarm(context, alarmId)
            return
        }
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
        val pi = JapamAlarmModule.buildPendingIntent(
            context, alarmId, mantraId, next, label, repeatDaysEncoded
        )
        try {
            if (canExact) {
                val showPi = PendingIntent.getActivity(
                    context,
                    0,
                    context.packageManager.getLaunchIntentForPackage(context.packageName)
                        ?: Intent(),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                am.setAlarmClock(AlarmManager.AlarmClockInfo(next, showPi), pi)
            } else {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next, pi)
            }
            updatePersistedFireAt(context, alarmId, next)
        } catch (_: Throwable) {
            // Reschedule failure is non-fatal — JS reconciles on foreground.
        }
    }

    private fun removePersistedAlarm(context: Context, alarmId: String) {
        val existing = JapamAlarmModule.readPersistedAlarms(context)
        val out = org.json.JSONArray()
        for (i in 0 until existing.length()) {
            val a = existing.optJSONObject(i) ?: continue
            if (a.optString("alarmId") != alarmId) out.put(a)
        }
        JapamAlarmModule.persistAlarms(context, out)
    }

    private fun updatePersistedFireAt(context: Context, alarmId: String, fireAt: Long) {
        val existing = JapamAlarmModule.readPersistedAlarms(context)
        val out = org.json.JSONArray()
        for (i in 0 until existing.length()) {
            val a = existing.optJSONObject(i) ?: continue
            if (a.optString("alarmId") == alarmId) {
                a.put("fireAt", fireAt)
            }
            out.put(a)
        }
        JapamAlarmModule.persistAlarms(context, out)
    }
}

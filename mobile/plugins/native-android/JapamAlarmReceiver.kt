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
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat

/**
 * Fired by AlarmManager.setAlarmClock at the scheduled minute. Responsible
 * for:
 *   - posting the alarm notification with the mantra sound + full-screen
 *     intent so the lock screen wakes;
 *   - re-arming the same alarm 24h later (one-shot setAlarmClock doesn't
 *     repeat; we register the next occurrence on every fire).
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

        postAlarmNotification(context, alarmId, mantraId, label)
        reschedule24hLater(context, alarmId, mantraId, fireAt, label)
    }

    private fun postAlarmNotification(
        context: Context,
        alarmId: String,
        mantraId: String,
        label: String?
    ) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Per-mantra channel: Android 8+ binds sound at channel-creation time
        // so each mantra gets its own channel keyed by sanitised mantraId.
        val soundResId = lookupSoundResource(context, mantraId)
        val soundUri: Uri? = if (soundResId != 0) {
            Uri.parse("android.resource://${context.packageName}/$soundResId")
        } else null
        val channelId = if (soundResId != 0) "japam-alarm-$mantraId" else "japam-alarm-default"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ensureChannel(nm, channelId, soundUri)
        }

        // Content intent — opens the app via deep link so JS routes to the
        // counter with autoPlay=true. Using Uri.parse on the configured app
        // scheme; expo's android intent-filter for the scheme picks it up.
        val deepLink = Uri.parse(
            "vedansh://japam-alarm?alarmId=$alarmId&mantraId=$mantraId"
        )
        val contentIntent = Intent(Intent.ACTION_VIEW, deepLink).apply {
            setPackage(context.packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val contentPi = PendingIntent.getActivity(
            context,
            alarmId.hashCode(),
            contentIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(context.applicationInfo.icon)
            .setContentTitle(label?.takeIf { it.isNotBlank() } ?: "जप का समय · Japam time")
            .setContentText("Tap to begin chanting")
            .setContentIntent(contentPi)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setFullScreenIntent(contentPi, true)

        // Pre-Android-8 path: channel doesn't carry sound, so set it on the
        // notification builder directly. Falls back to the system default
        // alarm ringtone when no custom WAV is bundled for the mantra.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            builder.setSound(
                soundUri ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            )
            builder.setDefaults(Notification.DEFAULT_VIBRATE or Notification.DEFAULT_LIGHTS)
        }

        nm.notify(alarmId.hashCode(), builder.build())
    }

    private fun ensureChannel(nm: NotificationManager, channelId: String, soundUri: Uri?) {
        // Idempotent — getNotificationChannel returns null if not created yet.
        if (nm.getNotificationChannel(channelId) != null) return
        val channel = NotificationChannel(
            channelId,
            "Japam Alarms",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Alarms with the mantra audio as the alarm tone."
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 250, 250, 250)
            // Always set ALARM audio attributes so the system treats this as
            // an alarm-tier notification (correct volume control + the alarm
            // icon in the status bar). User explicitly opted out of DnD
            // bypass, so leave bypassDnd at its default (false).
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()
            setSound(
                soundUri ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION),
                attrs
            )
        }
        nm.createNotificationChannel(channel)
    }

    /** Look up the bundled alarm WAV by mantraId. The expo-notifications
     *  config plugin copies WAVs from app.json's `sounds[]` into
     *  `android/app/src/main/res/raw/`, replacing hyphens with underscores.
     *  Returns 0 if no resource is bundled — the caller falls back to the
     *  system alarm ringtone. */
    private fun lookupSoundResource(context: Context, mantraId: String): Int {
        val resourceName = mantraId.replace("-", "_")
        return context.resources.getIdentifier(
            resourceName,
            "raw",
            context.packageName
        )
    }

    private fun reschedule24hLater(
        context: Context,
        alarmId: String,
        mantraId: String,
        fireAt: Long,
        label: String?
    ) {
        if (fireAt <= 0) return
        val next = fireAt + 24L * 60L * 60L * 1000L
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
        val pi = JapamAlarmModule.buildPendingIntent(
            context, alarmId, mantraId, next, label
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
            // Persist the new fireAt so the boot receiver re-arms accurately.
            updatePersistedFireAt(context, alarmId, next)
        } catch (_: Throwable) {
            // Reschedule failure is non-fatal — the JS layer will reconcile on
            // next app foreground.
        }
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

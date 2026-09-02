package __APP_PACKAGE__

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.edit
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import org.json.JSONArray
import org.json.JSONObject

/**
 * JS bridge for the Japam alarm native module.
 *
 * Responsibilities:
 *   - schedule a one-shot exact alarm via [AlarmManager.setAlarmClock] for
 *     each enabled alarm. setAlarmClock is the only API that's exempt from
 *     Doze without conditions and shows the system alarm icon — exactly
 *     what a clock-app alarm uses.
 *   - cancel by id (`<receiver-action> + extra "alarmId"`).
 *   - persist the alarm list locally so [JapamBootReceiver] can re-arm them
 *     after a device reboot (PendingIntents do NOT survive reboot; the boot
 *     receiver replays them).
 *
 * Display of the alarm itself (high-importance lock-screen notification,
 * mantra sound, and Stop/Snooze actions) is handled by
 * [JapamAlarmReceiver].
 */
class JapamAlarmModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val PREFS_NAME = "japam-alarms-native"
        const val PREFS_KEY_ALARMS = "alarms"
        const val INTENT_EXTRA_ALARM_ID = "alarmId"
        const val INTENT_EXTRA_MANTRA_ID = "mantraId"
        const val INTENT_EXTRA_FIRE_AT = "fireAt"
        const val INTENT_EXTRA_LABEL = "label"
        /** The id the ringing notification was posted under (may be the
         *  `:snooze`-suffixed alarmId). Action buttons must cancel THIS id —
         *  cancelling the base alarmId would leave a snoozed ring visible. */
        const val INTENT_EXTRA_NOTIFICATION_KEY = "notificationKey"
        /**
         * Weekday recurrence carried through the PendingIntent so the receiver
         * can re-arm the right day. Encoded as a comma-joined list of JS
         * `getDay()` indices (0=Sun…6=Sat):
         *   - absent extra → daily,
         *   - "" (empty)   → one-shot: no re-arm after firing,
         *   - "1,3,5"      → weekly on those days.
         */
        const val INTENT_EXTRA_REPEAT_DAYS = "repeatDays"

        fun buildPendingIntent(
            context: Context,
            alarmId: String,
            mantraId: String,
            fireAt: Long,
            label: String?,
            repeatDays: String?,
            flags: Int = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        ): PendingIntent {
            val intent = Intent(context, JapamAlarmReceiver::class.java).apply {
                action = "com.vedansh.japam.ALARM_FIRE"
                putExtra(INTENT_EXTRA_ALARM_ID, alarmId)
                putExtra(INTENT_EXTRA_MANTRA_ID, mantraId)
                putExtra(INTENT_EXTRA_FIRE_AT, fireAt)
                if (label != null) putExtra(INTENT_EXTRA_LABEL, label)
                if (repeatDays != null) putExtra(INTENT_EXTRA_REPEAT_DAYS, repeatDays)
            }
            return PendingIntent.getBroadcast(
                context,
                alarmId.hashCode(),
                intent,
                flags
            )
        }

        /**
         * Next epoch-ms occurrence strictly after [afterMs] whose weekday is
         * allowed, preserving [afterMs]'s wall-clock time (Calendar-based, so
         * DST transitions keep the alarm at the same local time).
         *
         * [repeatDays]: null = daily; empty = none (returns 0 → caller must
         * not re-arm); else JS `getDay()` indices (0=Sun…6=Sat).
         */
        fun nextOccurrenceAfter(afterMs: Long, repeatDays: Set<Int>?): Long {
            if (repeatDays != null && repeatDays.isEmpty()) return 0L
            val cal = java.util.Calendar.getInstance().apply { timeInMillis = afterMs }
            for (i in 0 until 7) {
                cal.add(java.util.Calendar.DAY_OF_YEAR, 1)
                // Calendar.DAY_OF_WEEK is 1=Sunday…7=Saturday → JS getDay() + 1.
                val jsDay = cal.get(java.util.Calendar.DAY_OF_WEEK) - 1
                if (repeatDays == null || repeatDays.contains(jsDay)) {
                    return cal.timeInMillis
                }
            }
            return cal.timeInMillis
        }

        /** Parse the comma-joined extra back into the tri-state set (see
         *  [INTENT_EXTRA_REPEAT_DAYS]): null = daily, empty = one-shot. */
        fun parseRepeatDays(encoded: String?): Set<Int>? {
            if (encoded == null) return null
            if (encoded.isEmpty()) return emptySet()
            return encoded.split(',').mapNotNull { it.trim().toIntOrNull() }
                .filter { it in 0..6 }.toSet()
        }

        fun persistAlarms(context: Context, alarms: JSONArray) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit {
                putString(PREFS_KEY_ALARMS, alarms.toString())
            }
        }

        fun readPersistedAlarms(context: Context): JSONArray {
            val raw = context
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getString(PREFS_KEY_ALARMS, null) ?: return JSONArray()
            return try {
                JSONArray(raw)
            } catch (_: Throwable) {
                JSONArray()
            }
        }
    }

    override fun getName(): String = "JapamAlarmNative"

    /**
     * Schedule a single one-shot alarm. The JS scheduler computes the next
     * fire timestamp for each alarm and calls this once per alarm; after the
     * alarm fires, the receiver re-schedules the next-day occurrence.
     *
     * Required args object:
     *   - alarmId: string
     *   - mantraId: string
     *   - fireAt: number (epoch ms)
     *   - label?: string
     *   - repeatDays?: number[] | null  (null/absent = daily; [] = one-shot)
     *   - fixed?: boolean               (true = one-shot regardless of days)
     */
    @ReactMethod
    fun scheduleAlarm(args: com.facebook.react.bridge.ReadableMap, promise: Promise) {
        try {
            val alarmId = args.getString("alarmId")
                ?: return promise.reject("E_ARGS", "alarmId is required")
            val mantraId = args.getString("mantraId")
                ?: return promise.reject("E_ARGS", "mantraId is required")
            if (!args.hasKey("fireAt")) {
                return promise.reject("E_ARGS", "fireAt is required")
            }
            val fireAt = args.getDouble("fireAt").toLong()
            val label = if (args.hasKey("label") && !args.isNull("label")) args.getString("label") else null
            val fixed = args.hasKey("fixed") && !args.isNull("fixed") && args.getBoolean("fixed")
            // Tri-state recurrence, normalised to the intent-extra encoding.
            val repeatDaysEncoded: String? = when {
                fixed -> ""
                args.hasKey("repeatDays") && !args.isNull("repeatDays") -> {
                    val arr = args.getArray("repeatDays")
                    val days = mutableListOf<Int>()
                    if (arr != null) {
                        for (i in 0 until arr.size()) {
                            val d = arr.getInt(i)
                            if (d in 0..6) days.add(d)
                        }
                    }
                    days.sorted().joinToString(",")
                }
                else -> null
            }

            val ctx = reactApplicationContext
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            // Guard exact-alarm permission on Android 12+. If the user has not
            // granted SCHEDULE_EXACT_ALARM yet, fall back to setAndAllowWhileIdle
            // — still Doze-tolerant, just not the "alarm icon" tier.
            val canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()

            val pi = buildPendingIntent(ctx, alarmId, mantraId, fireAt, label, repeatDaysEncoded)
            val showPi = makeShowIntent(ctx)

            if (canExact) {
                val info = AlarmManager.AlarmClockInfo(fireAt, showPi)
                am.setAlarmClock(info, pi)
            } else {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi)
            }

            updatePersistedAlarm(ctx, alarmId, mantraId, fireAt, label, repeatDaysEncoded)

            val result: WritableMap = Arguments.createMap()
            result.putString("alarmId", alarmId)
            result.putDouble("fireAt", fireAt.toDouble())
            result.putBoolean("exact", canExact)
            promise.resolve(result)
        } catch (t: Throwable) {
            promise.reject("E_SCHEDULE", t.message, t)
        }
    }

    /** Cancel the AlarmManager PendingIntent registered under [alarmId] (a
     *  NO_CREATE miss is a successful no-op). [includeSnooze] also cancels
     *  the alarm's in-flight `alarmId:snooze` slot — used by the targeted
     *  per-alarm cancel, but NOT by cancelAll: reconcile calls cancelAll on
     *  every app foreground, and killing active snoozes there would lose a
     *  snoozed re-ring whenever the user opens the app mid-countdown.
     *  Orphaned snoozes (base alarm deleted/disabled) are instead suppressed
     *  at fire time by JapamAlarmReceiver. */
    private fun cancelPendingIntentsFor(
        ctx: Context,
        am: AlarmManager,
        alarmId: String,
        includeSnooze: Boolean
    ) {
        val ids = if (includeSnooze) {
            listOf(alarmId, alarmId + JapamAlarmActionReceiver.SNOOZE_SUFFIX)
        } else {
            listOf(alarmId)
        }
        for (id in ids) {
            val intent = Intent(ctx, JapamAlarmReceiver::class.java)
                .setAction("com.vedansh.japam.ALARM_FIRE")
                .putExtra(INTENT_EXTRA_ALARM_ID, id)
            val pi = PendingIntent.getBroadcast(
                ctx,
                id.hashCode(),
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            pi?.let { am.cancel(it); it.cancel() }
        }
    }

    @ReactMethod
    fun cancelAlarm(alarmId: String, promise: Promise) {
        try {
            val ctx = reactApplicationContext
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            cancelPendingIntentsFor(ctx, am, alarmId, includeSnooze = true)
            removePersistedAlarm(ctx, alarmId)
            promise.resolve(null)
        } catch (t: Throwable) {
            promise.reject("E_CANCEL", t.message, t)
        }
    }

    /** Cancel everything we own. Called by the JS scheduler before
     *  re-arming, so the on-device state matches the persisted list. */
    @ReactMethod
    fun cancelAll(promise: Promise) {
        try {
            val ctx = reactApplicationContext
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val alarms = readPersistedAlarms(ctx)
            for (i in 0 until alarms.length()) {
                val a = alarms.optJSONObject(i) ?: continue
                val alarmId = a.optString("alarmId", null) ?: continue
                cancelPendingIntentsFor(ctx, am, alarmId, includeSnooze = false)
            }
            persistAlarms(ctx, JSONArray())
            promise.resolve(null)
        } catch (t: Throwable) {
            promise.reject("E_CANCEL_ALL", t.message, t)
        }
    }

    /** Capability probe used by the JS layer to decide whether to use the
     *  native path or fall back to expo-notifications. */
    @ReactMethod
    fun getCapability(promise: Promise) {
        try {
            val ctx = reactApplicationContext
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            val exact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
            val result: WritableMap = Arguments.createMap()
            result.putBoolean("supported", true)
            result.putBoolean("canScheduleExact", exact)
            promise.resolve(result)
        } catch (t: Throwable) {
            promise.reject("E_CAPABILITY", t.message, t)
        }
    }

    /**
     * Opens Android's user-controlled "Alarms & reminders" special-access
     * screen. Vedansh's Japam alarm is a secondary app feature, so it uses
     * SCHEDULE_EXACT_ALARM (user granted) rather than the Play-restricted,
     * auto-granted USE_EXACT_ALARM permission.
     *
     * The promise reports whether the settings screen was opened (or exact
     * access was already available), not whether the user ultimately granted
     * access. JS refreshes [getCapability] when the app returns to foreground.
     */
    @ReactMethod
    fun requestExactAlarmPermission(promise: Promise) {
        try {
            val ctx = reactApplicationContext
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
                promise.resolve(true)
                return
            }
            val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            if (am.canScheduleExactAlarms()) {
                promise.resolve(true)
                return
            }
            val intent = Intent(
                Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
                Uri.parse("package:${ctx.packageName}")
            ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            ctx.startActivity(intent)
            promise.resolve(true)
        } catch (t: Throwable) {
            promise.reject("E_EXACT_ALARM_PERMISSION", t.message, t)
        }
    }

    private fun makeShowIntent(context: Context): PendingIntent {
        // The "show" PendingIntent is what the system launches if the user
        // taps the alarm icon in the status bar before fire time. Routing to
        // the launcher activity is the safe default.
        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
            ?: Intent(Intent.ACTION_VIEW)
        return PendingIntent.getActivity(
            context,
            0,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun updatePersistedAlarm(
        context: Context,
        alarmId: String,
        mantraId: String,
        fireAt: Long,
        label: String?,
        repeatDays: String?
    ) {
        val existing = readPersistedAlarms(context)
        val out = JSONArray()
        var inserted = false
        for (i in 0 until existing.length()) {
            val a = existing.optJSONObject(i) ?: continue
            if (a.optString("alarmId") == alarmId) {
                out.put(jsonAlarm(alarmId, mantraId, fireAt, label, repeatDays))
                inserted = true
            } else {
                out.put(a)
            }
        }
        if (!inserted) out.put(jsonAlarm(alarmId, mantraId, fireAt, label, repeatDays))
        persistAlarms(context, out)
    }

    private fun removePersistedAlarm(context: Context, alarmId: String) {
        val existing = readPersistedAlarms(context)
        val out = JSONArray()
        for (i in 0 until existing.length()) {
            val a = existing.optJSONObject(i) ?: continue
            if (a.optString("alarmId") != alarmId) out.put(a)
        }
        persistAlarms(context, out)
    }

    private fun jsonAlarm(
        alarmId: String,
        mantraId: String,
        fireAt: Long,
        label: String?,
        repeatDays: String?
    ): JSONObject {
        val o = JSONObject()
        o.put("alarmId", alarmId)
        o.put("mantraId", mantraId)
        o.put("fireAt", fireAt)
        if (label != null) o.put("label", label)
        // Absent key = daily (matches the intent-extra encoding).
        if (repeatDays != null) o.put("repeatDays", repeatDays)
        return o
    }

    @Suppress("unused")
    fun ignoredForLinter(arr: ReadableArray) {
        // Keeps `ReadableArray` import compile-checked while not actively used.
    }
}

package __APP_PACKAGE__.widgets

import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

internal object WidgetPayloadContract {
    sealed class State {
        data class Ready(val root: JSONObject) : State()
        data object Invalid : State()
        data object Expired : State()
    }

    private val languages = listOf("hi", "en", "gu", "kn")
    private val timeZones = TimeZone.getAvailableIDs().toSet()
    private val datePattern = Regex("^\\d{4}-\\d{2}-\\d{2}$")
    private val isoPattern = Regex("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$")

    fun decode(raw: String, nowMs: Long = System.currentTimeMillis()): State {
        return try {
            val root = JSONObject(raw)
            if (integer(root, "schemaVersion") != 1 || parseIso(string(root, "generatedAt")) == null ||
                string(root, "writerAppVersion").isNullOrEmpty() || string(root, "locale") !in languages) return State.Invalid
            val panchang = objectValue(root, "panchang") ?: return State.Invalid
            val verses = objectValue(root, "verses") ?: return State.Invalid
            val japam = objectValue(root, "japam") ?: return State.Invalid
            if (string(panchang, "timeZone") != "Asia/Kolkata" ||
                !validTimeZone(string(verses, "timeZone")) || !validTimeZone(string(japam, "timeZone")) ||
                string(panchang, "cityId") == null || !localized(objectValue(panchang, "cityLabel")) ||
                string(panchang, "calendarSystem") !in listOf("purnimant", "amanta")) return State.Invalid
            val pValid = parseIso(string(panchang, "validThrough")) ?: return State.Invalid
            val vValid = parseIso(string(verses, "validThrough")) ?: return State.Invalid
            val pDays = arrayValue(panchang, "days") ?: return State.Invalid
            val vDays = arrayValue(verses, "days") ?: return State.Invalid
            if (!validDays(pDays, ::validPanchangDay) || !validDays(vDays, ::validVerseDay) || !validJapam(japam)) return State.Invalid
            if (pValid < nowMs || vValid < nowMs) State.Expired else State.Ready(root)
        } catch (_: Exception) { State.Invalid }
    }

    fun currentDateKey(timeZone: String, date: Date = Date()): String =
        SimpleDateFormat("yyyy-MM-dd", Locale.US).apply { this.timeZone = TimeZone.getTimeZone(timeZone) }.format(date)

    /**
     * The tithi running at [nowMs] and its "तक …" line — the same forward scan
     * `runningTithi` performs in planner.ts and VedanshWidgets.swift. A tithi
     * hands over MID-DAY, so a provider that drew `tithi` (the sunrise tithi)
     * for the whole civil day disagreed with the app's own glance from the
     * handover until midnight. Falls back to `tithi` for a payload written
     * before `tithiSegments` existed.
     */
    fun runningTithi(day: JSONObject, nowMs: Long): Pair<JSONObject, JSONObject?> {
        val segments = day.optJSONArray("tithiSegments")
        if (segments == null || segments.length() == 0) return day.getJSONObject("tithi") to null
        for (index in 0 until segments.length()) {
            val segment = segments.optJSONObject(index) ?: continue
            val ends = parseIso(segment.opt("endsAt") as? String)
            if (ends == null || nowMs <= ends) return segment.getJSONObject("name") to segment.optJSONObject("till")
        }
        val last = segments.getJSONObject(segments.length() - 1)
        return last.getJSONObject("name") to last.optJSONObject("till")
    }

    /**
     * The next instant this surface's drawn facts stop being true: the next
     * tithi handover for the Panchang, and in both cases the next civil-day
     * rollover in the slice's own zone.
     *
     * `updatePeriodMillis` alone cannot carry this. It is capped at 30 minutes,
     * it does NOT wake a dozing device, and a handover is a minute-level fact —
     * which is how a placed widget sat on yesterday's date through a morning
     * and on a finished tithi through an afternoon. The provider turns this
     * into one AlarmManager wake-up per boundary.
     */
    fun nextBoundaryMs(slice: JSONObject, timeZone: String, includeTithi: Boolean, nowMs: Long): Long {
        var next = nextMidnightMs(timeZone, nowMs)
        if (!includeTithi) return next
        val days = slice.optJSONArray("days") ?: return next
        for (index in 0 until days.length()) {
            val segments = days.optJSONObject(index)?.optJSONArray("tithiSegments") ?: continue
            for (link in 0 until segments.length()) {
                val ends = parseIso(segments.optJSONObject(link)?.opt("endsAt") as? String) ?: continue
                if (ends > nowMs && ends + 1_000L < next) next = ends + 1_000L
            }
        }
        return next
    }

    /** One second past the next midnight in [timeZone], so the new day's key is already current. */
    private fun nextMidnightMs(timeZone: String, nowMs: Long): Long {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone(timeZone), Locale.US)
        calendar.timeInMillis = nowMs
        calendar.add(Calendar.DAY_OF_YEAR, 1)
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 1)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }

    private fun validDays(days: JSONArray, validator: (JSONObject) -> Boolean): Boolean {
        if (days.length() == 0) return false
        val keys = mutableSetOf<String>()
        for (index in 0 until days.length()) {
            val value = days.opt(index) as? JSONObject ?: return false
            val key = string(value, "dateKey") ?: return false
            if (!keys.add(key) || !validator(value)) return false
        }
        return true
    }

    private fun validPanchangDay(day: JSONObject): Boolean {
        val key = string(day, "dateKey") ?: return false
        return validDateKey(key) && localized(objectValue(day, "representedDate")) && localized(objectValue(day, "tithi")) &&
            (!day.has("vrat") || localized(objectValue(day, "vrat"))) && localized(objectValue(day, "sunrise")) &&
            validTithiSegments(day) &&
            localized(objectValue(day, "rahuKaal")) && (!day.has("abhijit") || localized(objectValue(day, "abhijit"))) &&
            string(day, "deepLink") == "vedansh://widget/panchang?date=$key"
    }

    /**
     * Ordered, single-ended, anchored to the sunrise tithi — what [runningTithi]'s
     * single forward scan relies on. An unterminated MIDDLE link would stop that
     * scan early for every later instant, so it fails the payload closed.
     */
    private fun validTithiSegments(day: JSONObject): Boolean {
        if (!day.has("tithiSegments")) return true
        val segments = arrayValue(day, "tithiSegments") ?: return false
        if (segments.length() == 0) return false
        var previous = Long.MIN_VALUE
        for (index in 0 until segments.length()) {
            val segment = segments.opt(index) as? JSONObject ?: return false
            if (!localized(objectValue(segment, "name"))) return false
            if (!segment.has("endsAt")) {
                if (index != segments.length() - 1 || segment.has("till")) return false
                continue
            }
            val ends = parseIso(string(segment, "endsAt")) ?: return false
            if (ends <= previous || !localized(objectValue(segment, "till"))) return false
            previous = ends
        }
        val first = objectValue(segments.getJSONObject(0), "name") ?: return false
        val sunrise = objectValue(day, "tithi") ?: return false
        return languages.all { string(first, it) == string(sunrise, it) }
    }

    private fun validVerseDay(day: JSONObject): Boolean {
        if (!validDateKey(string(day, "dateKey")) || string(day, "sourceId") == null ||
            (integer(day, "verseIndex") ?: -1) < 0 || (day.has("chapter") && (integer(day, "chapter") ?: 0) < 1)) return false
        val lines = objectValue(day, "lines") ?: return false
        if (!languages.all { lang ->
                val values = arrayValue(lines, lang) ?: return@all false
                values.length() > 0 && (0 until values.length()).all { values.opt(it) is String && (values.opt(it) as String).isNotEmpty() }
            }) return false
        val query = mutableMapOf("sourceId" to string(day, "sourceId")!!, "verseIndex" to integer(day, "verseIndex").toString())
        integer(day, "chapter")?.let { query["chapter"] = it.toString() }
        return localized(objectValue(day, "excerpt")) && localized(objectValue(day, "source")) &&
            localized(objectValue(day, "accessibilityLabel")) && exactLink(string(day, "deepLink"), "/verse", query)
    }

    private fun validJapam(japam: JSONObject): Boolean =
        validDateKey(string(japam, "dateKey")) && validTimeZone(string(japam, "timeZone")) &&
            listOf("totalBeads", "totalRounds", "japaStreak").all { (integer(japam, it) ?: -1) >= 0 } &&
            (!japam.has("lastUsedMantraId") || !string(japam, "lastUsedMantraId").isNullOrEmpty()) &&
            exactLink(string(japam, "deepLink"), "/japam", string(japam, "lastUsedMantraId")?.let { mapOf("mantraId" to it) } ?: emptyMap())

    private fun exactLink(raw: String?, path: String, expected: Map<String, String>): Boolean {
        if (raw == null) return false
        return try {
            val uri = android.net.Uri.parse(raw)
            if (uri.scheme != "vedansh" || uri.host != "widget" || uri.path != path || uri.fragment != null) return false
            val names = uri.queryParameterNames
            names.size == expected.size && names == expected.keys && names.all { uri.getQueryParameters(it).size == 1 && uri.getQueryParameter(it) == expected[it] }
        } catch (_: Exception) { false }
    }

    private fun localized(value: JSONObject?): Boolean = value != null && languages.all { string(value, it) != null }
    private fun validTimeZone(value: String?): Boolean = value != null && value in timeZones
    private fun validDateKey(value: String?): Boolean {
        if (value == null || !datePattern.matches(value)) return false
        return try { SimpleDateFormat("yyyy-MM-dd", Locale.US).apply { isLenient = false }.parse(value) != null } catch (_: Exception) { false }
    }
    private fun parseIso(value: String?): Long? {
        if (value == null || !isoPattern.matches(value)) return null
        return try { SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { isLenient = false; timeZone = TimeZone.getTimeZone("UTC") }.parse(value)?.time } catch (_: Exception) { null }
    }
    private fun string(value: JSONObject, key: String): String? = value.opt(key) as? String
    private fun integer(value: JSONObject, key: String): Int? = (value.opt(key) as? Number)?.toInt()?.takeIf { number -> (value.opt(key) as Number).toDouble() == number.toDouble() }
    private fun objectValue(value: JSONObject, key: String): JSONObject? = value.opt(key) as? JSONObject
    private fun arrayValue(value: JSONObject, key: String): JSONArray? = value.opt(key) as? JSONArray
}

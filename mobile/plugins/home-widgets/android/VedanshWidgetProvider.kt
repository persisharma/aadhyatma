package __APP_PACKAGE__.widgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.RemoteViews
import org.json.JSONObject

/**
 * One content type per provider (design.md §59), so the launcher's widget picker —
 * not a hard-coded width threshold — decides what the user places and at what size.
 * The verse provider defaults to the wide 4x2 cell it needs to show a shloka, the
 * Panchang provider to the 2x2 glance; both stay fully resizable.
 */
abstract class VedanshWidgetProvider(private val surface: Surface) : AppWidgetProvider() {
    enum class Surface { PANCHANG, VERSE }

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) = ids.forEach { render(context, manager, it, surface) }
    override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) = render(context, manager, id, surface)

    companion object {
        const val PREFS = "vedansh_widgets"
        const val PAYLOAD_KEY = "vedansh_widget_payload_v1"

        fun providerFor(surface: Surface): Class<out VedanshWidgetProvider> = when (surface) {
            Surface.PANCHANG -> VedanshPanchangWidgetProvider::class.java
            Surface.VERSE -> VedanshVerseWidgetProvider::class.java
        }

        fun updateAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            for (surface in Surface.values()) {
                val component = ComponentName(context, providerFor(surface))
                manager.getAppWidgetIds(component).forEach { render(context, manager, it, surface) }
            }
        }

        private fun layoutFor(surface: Surface) = when (surface) {
            Surface.PANCHANG -> __APP_PACKAGE__.R.layout.vedansh_widget_panchang
            Surface.VERSE -> __APP_PACKAGE__.R.layout.vedansh_widget_verse
        }

        // Section eyebrows are the one piece of widget copy the payload does not
        // carry; localized here in the same four languages the iOS extension uses.
        private fun verseKicker(locale: String) = when (locale) {
            "en" -> "TODAY'S VERSE"
            "gu" -> "આજનો શ્લોક"
            "kn" -> "ಇಂದಿನ ಶ್ಲೋಕ"
            else -> "आज का श्लोक"
        }

        private fun recovery(context: Context, manager: AppWidgetManager, id: Int, surface: Surface, expired: Boolean) {
            val views = RemoteViews(context.packageName, layoutFor(surface))
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_kicker, "वेदांश़ · VEDANSH")
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_title, if (expired) "ताज़ा करने हेतु वेदांश़ खोलें" else "विजेट तैयार करने हेतु वेदांश़ खोलें")
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_subtitle, if (expired) "Open Vedansh to refresh" else "Open Vedansh to prepare widgets")
            views.setViewVisibility(__APP_PACKAGE__.R.id.widget_subtitle, View.VISIBLE)
            // A reapplied RemoteViews only carries the actions it declares, so a view
            // that a previous (tall) render stretched to 8 lines keeps that state
            // unless this card sets it back.
            views.setInt(__APP_PACKAGE__.R.id.widget_title, "setMaxLines", 3)
            views.setViewVisibility(__APP_PACKAGE__.R.id.widget_meta, View.GONE)
            // This card already says "वेदांश़" in its eyebrow and again in both
            // message lines; the ॐ mark beside the eyebrow would be a fourth.
            views.setViewVisibility(__APP_PACKAGE__.R.id.widget_brand, View.GONE)
            val today = WidgetPayloadContract.currentDateKey("Asia/Kolkata")
            views.setOnClickPendingIntent(__APP_PACKAGE__.R.id.widget_root, link(context, "vedansh://widget/panchang?date=$today", requestCode(id, surface)))
            manager.updateAppWidget(id, views)
        }

        private fun render(context: Context, manager: AppWidgetManager, id: Int, surface: Surface) {
            val raw = context.getSharedPreferences(PREFS, 0).getString(PAYLOAD_KEY, null) ?: return recovery(context, manager, id, surface, false)
            try {
                val decoded = WidgetPayloadContract.decode(raw)
                if (decoded is WidgetPayloadContract.State.Expired) return recovery(context, manager, id, surface, true)
                val root = (decoded as? WidgetPayloadContract.State.Ready)?.root ?: return recovery(context, manager, id, surface, false)
                val locale = root.getString("locale")
                val options = manager.getAppWidgetOptions(id)
                val width = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 250)
                val height = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110)
                val views = RemoteViews(context.packageName, layoutFor(surface))
                // Same reapply trap as the recovery card's maxLines reset: a widget
                // that hit recovery once would keep its ॐ mark hidden for good
                // unless every content render puts it back.
                views.setViewVisibility(__APP_PACKAGE__.R.id.widget_brand, View.VISIBLE)
                when (surface) {
                    Surface.PANCHANG -> renderPanchang(context, views, root, locale, id, width)
                    Surface.VERSE -> renderVerse(context, views, root, locale, id, width, height)
                } ?: return recovery(context, manager, id, surface, true)
                manager.updateAppWidget(id, views)
            } catch (_: Exception) { recovery(context, manager, id, surface, false) }
        }

        /** Returns null when today's dated entry is absent, so the caller falls back to the refresh card. */
        private fun renderPanchang(context: Context, views: RemoteViews, root: JSONObject, locale: String, id: Int, width: Int): Unit? {
            val panchang = root.getJSONObject("panchang")
            val today = WidgetPayloadContract.currentDateKey("Asia/Kolkata")
            val days = panchang.getJSONArray("days")
            val pd = (0 until days.length()).map { days.getJSONObject(it) }.firstOrNull { it.getString("dateKey") == today } ?: return null
            val compact = width < 180
            val represented = pd.getJSONObject("representedDate").getString(locale)
            val city = panchang.getJSONObject("cityLabel").getString(locale)
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_kicker, if (compact) represented else "$represented · $city")
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_title, pd.getJSONObject("tithi").getString(locale))
            val vrat = pd.optJSONObject("vrat")?.getString(locale)
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_subtitle, vrat ?: "")
            views.setViewVisibility(__APP_PACKAGE__.R.id.widget_subtitle, if (vrat == null) View.GONE else View.VISIBLE)
            val sunrise = pd.getJSONObject("sunrise").getString(locale)
            val rahuKaal = pd.getJSONObject("rahuKaal").getString(locale)
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_meta, if (compact) sunrise else "$sunrise · $rahuKaal")
            views.setViewVisibility(__APP_PACKAGE__.R.id.widget_meta, View.VISIBLE)
            views.setOnClickPendingIntent(__APP_PACKAGE__.R.id.widget_root, link(context, pd.getString("deepLink"), requestCode(id, Surface.PANCHANG)))
            return Unit
        }

        private fun renderVerse(context: Context, views: RemoteViews, root: JSONObject, locale: String, id: Int, width: Int, height: Int): Unit? {
            val verses = root.getJSONObject("verses")
            val today = WidgetPayloadContract.currentDateKey(verses.getString("timeZone"))
            val days = verses.getJSONArray("days")
            val vd = (0 until days.length()).map { days.getJSONObject(it) }.firstOrNull { it.getString("dateKey") == today } ?: return null
            // Tall cells get the verse line-by-line from `lines`; wide-but-short
            // cells flow those same lines into the 3 lines they budget. Only a
            // narrow cell falls back to the planner's excerpt, whose character cap
            // is sized for that square — handing it to the default 4x2 cell was
            // the "shloka cut with space still on the card" bug: an 88-character
            // cap ellipsized a ~90-character two-line shloka while the third line
            // sat empty. The full verse has always been in the payload.
            val lines = vd.getJSONObject("lines").getJSONArray(locale)
            val padas = (0 until lines.length()).map { lines.getString(it).trim() }.filter { it.isNotEmpty() }
            val tall = height >= 180
            val narrow = width < 180
            val body = when {
                tall -> padas.joinToString("\n")
                narrow -> vd.getJSONObject("excerpt").getString(locale)
                else -> padas.joinToString(" · ")
            }
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_kicker, verseKicker(locale))
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_title, body)
            views.setInt(__APP_PACKAGE__.R.id.widget_title, "setMaxLines", if (tall) 8 else if (narrow) 4 else 3)
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_subtitle, vd.getJSONObject("source").getString(locale))
            views.setViewVisibility(__APP_PACKAGE__.R.id.widget_subtitle, if (narrow) View.GONE else View.VISIBLE)
            views.setViewVisibility(__APP_PACKAGE__.R.id.widget_meta, View.GONE)
            views.setContentDescription(__APP_PACKAGE__.R.id.widget_root, vd.getJSONObject("accessibilityLabel").getString(locale))
            views.setOnClickPendingIntent(__APP_PACKAGE__.R.id.widget_root, link(context, vd.getString("deepLink"), requestCode(id, Surface.VERSE)))
            return Unit
        }

        /** Each surface owns its own PendingIntent request-code space, so two placed widgets never share one. */
        private fun requestCode(id: Int, surface: Surface) = id * Surface.values().size + surface.ordinal

        private fun link(context: Context, value: String, requestCode: Int): PendingIntent {
            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()
            launch.action = Intent.ACTION_VIEW
            launch.data = Uri.parse(value)
            launch.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            return PendingIntent.getActivity(context, requestCode, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }
    }
}

class VedanshPanchangWidgetProvider : VedanshWidgetProvider(VedanshWidgetProvider.Surface.PANCHANG)
class VedanshVerseWidgetProvider : VedanshWidgetProvider(VedanshWidgetProvider.Surface.VERSE)

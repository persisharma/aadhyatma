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

class VedanshWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) = ids.forEach { render(context, manager, it) }
    override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) = render(context, manager, id)

    companion object {
        const val PREFS = "vedansh_widgets"
        const val PAYLOAD_KEY = "vedansh_widget_payload_v1"

        fun updateAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val component = ComponentName(context, VedanshWidgetProvider::class.java)
            manager.getAppWidgetIds(component).forEach { render(context, manager, it) }
        }

        private fun recovery(context: Context, manager: AppWidgetManager, id: Int, expired: Boolean) {
            val views = RemoteViews(context.packageName, __APP_PACKAGE__.R.layout.vedansh_widget)
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_kicker, "वेदांश़ · VEDANSH")
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_title, if (expired) "पंचांग ताज़ा करने हेतु वेदांश़ खोलें" else "विजेट तैयार करने हेतु वेदांश़ खोलें")
            views.setTextViewText(__APP_PACKAGE__.R.id.widget_subtitle, if (expired) "Open Vedansh to refresh" else "Open Vedansh to prepare widgets")
            views.setViewVisibility(__APP_PACKAGE__.R.id.widget_detail, View.GONE)
            val today = WidgetPayloadContract.currentDateKey("Asia/Kolkata")
            views.setOnClickPendingIntent(__APP_PACKAGE__.R.id.widget_root, link(context, "vedansh://widget/panchang?date=$today", id))
            manager.updateAppWidget(id, views)
        }

        private fun render(context: Context, manager: AppWidgetManager, id: Int) {
            val raw = context.getSharedPreferences(PREFS, 0).getString(PAYLOAD_KEY, null) ?: return recovery(context, manager, id, false)
            try {
                val decoded = WidgetPayloadContract.decode(raw)
                if (decoded is WidgetPayloadContract.State.Expired) return recovery(context, manager, id, true)
                val root = (decoded as? WidgetPayloadContract.State.Ready)?.root ?: return recovery(context, manager, id, false)
                val panchang = root.getJSONObject("panchang")
                val verses = root.getJSONObject("verses")
                val locale = root.getString("locale")
                val panchangToday = WidgetPayloadContract.currentDateKey("Asia/Kolkata")
                val verseToday = WidgetPayloadContract.currentDateKey(verses.getString("timeZone"))
                val pDays = panchang.getJSONArray("days")
                val vDays = verses.getJSONArray("days")
                val pd = (0 until pDays.length()).map { pDays.getJSONObject(it) }.firstOrNull { it.getString("dateKey") == panchangToday } ?: return recovery(context, manager, id, true)
                val vd = (0 until vDays.length()).map { vDays.getJSONObject(it) }.firstOrNull { it.getString("dateKey") == verseToday } ?: return recovery(context, manager, id, true)
                val width = manager.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 250)
                val views = RemoteViews(context.packageName, __APP_PACKAGE__.R.layout.vedansh_widget)
                val tithi = pd.getJSONObject("tithi").getString(locale)
                val represented = pd.getJSONObject("representedDate").getString(locale)
                val excerpt = vd.getJSONObject("excerpt").getString(locale)
                views.setTextViewText(__APP_PACKAGE__.R.id.widget_kicker, "$represented · ${panchang.getJSONObject("cityLabel").getString(locale)}")
                views.setTextViewText(__APP_PACKAGE__.R.id.widget_title, tithi)
                val sunrise = pd.getJSONObject("sunrise").getString(locale)
                val rahuKaal = pd.getJSONObject("rahuKaal").getString(locale)
                views.setTextViewText(__APP_PACKAGE__.R.id.widget_subtitle, if (width < 180) "ॐ वेदांश़" else "$sunrise · $rahuKaal")
                views.setTextViewText(__APP_PACKAGE__.R.id.widget_detail, excerpt)
                views.setContentDescription(__APP_PACKAGE__.R.id.widget_detail, vd.getJSONObject("accessibilityLabel").getString(locale))
                views.setViewVisibility(__APP_PACKAGE__.R.id.widget_detail, if (width < 245) View.GONE else View.VISIBLE)
                views.setOnClickPendingIntent(__APP_PACKAGE__.R.id.widget_panchang_zone, link(context, pd.getString("deepLink"), id * 2))
                views.setOnClickPendingIntent(__APP_PACKAGE__.R.id.widget_detail, link(context, vd.getString("deepLink"), id * 2 + 1))
                manager.updateAppWidget(id, views)
            } catch (_: Exception) { recovery(context, manager, id, false) }
        }

        private fun link(context: Context, value: String, requestCode: Int): PendingIntent {
            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: Intent()
            launch.action = Intent.ACTION_VIEW
            launch.data = Uri.parse(value)
            launch.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            return PendingIntent.getActivity(context, requestCode, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }
    }
}

package __APP_PACKAGE__.widgets

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class VedanshWidgetModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    init {
        if (__APP_PACKAGE__.BuildConfig.DEBUG) {
            val fixture = context.resources.openRawResource(__APP_PACKAGE__.R.raw.vedansh_widget_payload_v1_fixture)
                .bufferedReader().use { it.readText() }
            check(WidgetPayloadContract.decode(fixture) is WidgetPayloadContract.State.Ready) {
                "Bundled widget v1 fixture no longer matches the Android decoder"
            }
        }
    }

    override fun getName() = "VedanshWidget"

    @ReactMethod
    fun writePayload(payload: String, promise: Promise) {
        try {
            // One committed String is the atomic visibility boundary. Native
            // readers can see the old complete document or the new one, never
            // a partially-written set of fields.
            val ok = context.getSharedPreferences(VedanshWidgetProvider.PREFS, 0)
                .edit().putString(VedanshWidgetProvider.PAYLOAD_KEY, payload).commit()
            if (!ok) throw IllegalStateException("SharedPreferences commit failed")
            VedanshWidgetProvider.updateAll(context)
            promise.resolve(null)
        } catch (e: Exception) { promise.reject("E_WIDGET_WRITE", e) }
    }

    @ReactMethod
    fun readPayload(promise: Promise) {
        try {
            promise.resolve(context.getSharedPreferences(VedanshWidgetProvider.PREFS, 0)
                .getString(VedanshWidgetProvider.PAYLOAD_KEY, null))
        } catch (e: Exception) { promise.reject("E_WIDGET_READ", e) }
    }

    // AppWidgetManager.getInstance() is null on devices without home-screen
    // widget support (no FEATURE_APP_WIDGETS), and a throw from a legacy
    // @ReactMethod is not a promise rejection. Every path answers "unsupported".
    @ReactMethod
    fun isPinWidgetSupported(promise: Promise) {
        try {
            val manager: AppWidgetManager? = AppWidgetManager.getInstance(context)
            promise.resolve(Build.VERSION.SDK_INT >= 26 && manager?.isRequestPinAppWidgetSupported == true)
        } catch (_: Exception) { promise.resolve(false) }
    }

    /**
     * `content` picks which widget the launcher is asked to pin — the user chooses
     * per content type in the in-app gallery (design.md §59), not one catch-all.
     */
    @ReactMethod
    fun requestPinWidget(content: String?, promise: Promise) {
        if (Build.VERSION.SDK_INT < 26) { promise.resolve(false); return }
        try {
            val manager: AppWidgetManager? = AppWidgetManager.getInstance(context)
            if (manager == null || !manager.isRequestPinAppWidgetSupported) { promise.resolve(false); return }
            val surface = if (content == "verse") VedanshWidgetProvider.Surface.VERSE else VedanshWidgetProvider.Surface.PANCHANG
            val provider = ComponentName(context, VedanshWidgetProvider.providerFor(surface))
            promise.resolve(manager.requestPinAppWidget(provider, null, null))
        } catch (_: Exception) { promise.resolve(false) }
    }
}

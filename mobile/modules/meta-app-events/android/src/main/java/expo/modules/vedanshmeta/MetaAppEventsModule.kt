package expo.modules.vedanshmeta

import android.app.ActivityManager
import android.app.Application
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.os.SystemClock
import android.util.Log
import com.facebook.FacebookSdk
import com.facebook.appevents.AppEventsConstants
import com.facebook.appevents.AppEventsLogger
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

object MetaAppEventsTracker {
  private var initialized = false
  private var activated = false
  private var backgroundAt: Long? = null
  private const val SESSION_GAP_MS = 60_000L

  fun background() { backgroundAt = SystemClock.elapsedRealtime() }

  // Called only after the app UI is ready and active, on the main queue.
  fun activate(application: Application): Boolean {
    val processName = if (Build.VERSION.SDK_INT >= 28) Application.getProcessName() else {
      val manager = application.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      manager.runningAppProcesses?.firstOrNull { it.pid == Process.myPid() }?.processName
    }
    if (processName != application.packageName) return false
    try {
      @Suppress("DEPRECATION")
      val metadata = application.packageManager.getApplicationInfo(application.packageName, PackageManager.GET_META_DATA).metaData
      if (metadata?.getBoolean("com.vedansh.meta.TRACKING_ENABLED", false) != true) return false
      FacebookSdk.setAutoLogAppEventsEnabled(false)
      FacebookSdk.setAdvertiserIDCollectionEnabled(true)
      if (!initialized) {
        FacebookSdk.fullyInitialize()
        initialized = true
      }
      // Version-pinned SDK 18 install helper: its public activateApp() also
      // installs view/metadata observers, even with automatic logging disabled.
      // Do not register those observers for this app's private input screens.
      // The helper uses the SDK's persisted install deduplication and transport.
      // Re-audit this compatibility binding before changing the SDK version.
      FacebookSdk.publishInstallAsync(application, FacebookSdk.getApplicationId())
      val now = SystemClock.elapsedRealtime()
      if (!activated || backgroundAt?.let { now - it >= SESSION_GAP_MS } == true) {
        val logger = AppEventsLogger.newLogger(application)
        logger.logEvent(AppEventsConstants.EVENT_NAME_ACTIVATED_APP)
        logger.flush()
        activated = true
      }
      backgroundAt = null
      return true
    } catch (_: Exception) {
      // A configuration/network problem must not prevent the devotional app opening.
      Log.w("VedanshMeta", "App activation tracking could not initialize")
    }
    return false
  }
}

class MetaAppEventsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VedanshMetaAppEvents")
    OnActivityEntersBackground { MetaAppEventsTracker.background() }
    AsyncFunction("activate") {
      val application = appContext.reactContext?.applicationContext as? Application
      application?.let { MetaAppEventsTracker.activate(it) } ?: false
    }.runOnQueue(Queues.MAIN)
  }
}

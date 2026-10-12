import ExpoModulesCore
import FBSDKCoreKit
import AppTrackingTransparency

public class MetaAppEventsModule: Module {
  private var initialized = false

  private static var trackingEnabled: Bool {
    Bundle.main.object(forInfoDictionaryKey: "VedanshMetaTrackingEnabled") as? Bool == true
  }

  public func definition() -> ModuleDefinition {
    Name("VedanshMetaAppEvents")

    // The binary's flag, not the OTA manifest's: JS gates the ATT prompt on it.
    Constants(["enabled": MetaAppEventsModule.trackingEnabled])

    // No arbitrary event names, parameters, user IDs or user-data API is exposed.
    AsyncFunction("activate") { () -> Bool in
      guard MetaAppEventsModule.trackingEnabled else { return false }
      let authorized = ATTrackingManager.trackingAuthorizationStatus == .authorized
      Settings.shared.isAutoLogAppEventsEnabled = false
      Settings.shared.isAdvertiserIDCollectionEnabled = authorized
      // SDK 17+ reads ATT itself on iOS 17+. The older OS path still uses ATE.
      if #unavailable(iOS 17) {
        Settings.shared.isAdvertiserTrackingEnabled = authorized
      }
      if !self.initialized {
        // SDK 18 server configuration can enable these observers independently
        // of the automatic-event flag. Disable them before SDK initialization.
        // These exported SDK compatibility APIs are pinned and must be audited
        // again on any SDK upgrade; birth inputs must never reach AAM.
        _FeatureManager.shared.disableFeature(.AAM)
        _FeatureManager.shared.disableFeature(.codelessEvents)
        _FeatureManager.shared.disableFeature(.suggestedEvents)
        _FeatureManager.shared.disableFeature(.privacyProtection)
        ApplicationDelegate.shared.initializeSDK()
        self.initialized = true
      }
      AppEvents.shared.activateApp()
      return true
    }.runOnQueue(.main)
  }
}

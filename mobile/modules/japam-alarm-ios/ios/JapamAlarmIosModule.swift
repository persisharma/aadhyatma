// JapamAlarmIosModule.swift
//
// iOS 26+ AlarmKit-backed Japam alarms.
//
// Mirrors the JS contract used by the Android Kotlin module:
//   scheduleAlarm({ alarmId, mantraId, fireAt, label? })
//   cancelAlarm(alarmId)
//   cancelAll()
//   getCapability() -> { supported, canScheduleExact }
//   requestPermission() -> bool
//   getAuthorizationStatus() -> "granted" | "denied" | "undetermined"
//
// Alarms are scheduled as a DAILY recurring AlarmKit alarm (a relative
// schedule repeating every weekday), so the alarm re-arms itself with no app
// involvement and adjusts for timezone changes — AlarmKit owns the recurrence.
// `fireAt` (epoch ms) carries the time-of-day; the module extracts hour/minute
// from it.
//
// IDs in our app are strings; AlarmKit identifies alarms by `UUID`. The
// module persists a string→UUID mapping in UserDefaults so cancel-by-id
// stays addressable across launches.
//
// Every AlarmKit call sits behind `@available(iOS 26.0, *)` so the build
// compiles cleanly on Expo's default iOS deployment target (15.1); JS
// guards on Platform.Version before calling, so older devices never reach
// these branches.
//
// NOTE: AlarmKit requires the AlarmKit entitlement (requested from Apple) +
// the `NSAlarmKitUsageDescription` Info.plist key (injected by
// withJapamAlarmIos.js). Without the entitlement, scheduling fails at runtime.

import ExpoModulesCore
import Foundation
#if canImport(AlarmKit)
import AlarmKit
import ActivityKit
import SwiftUI
#endif

private let kMappingDefaultsKey = "japam-alarm.id-map.v1"

private func storedMapping() -> [String: String] {
  (UserDefaults.standard.dictionary(forKey: kMappingDefaultsKey) as? [String: String]) ?? [:]
}

private func setStoredMapping(_ map: [String: String]) {
  UserDefaults.standard.set(map, forKey: kMappingDefaultsKey)
}

private func uuidFor(alarmId: String) -> UUID {
  if let existing = storedMapping()[alarmId], let uuid = UUID(uuidString: existing) {
    return uuid
  }
  let fresh = UUID()
  var map = storedMapping()
  map[alarmId] = fresh.uuidString
  setStoredMapping(map)
  return fresh
}

private func forgetMapping(alarmId: String) {
  var map = storedMapping()
  map.removeValue(forKey: alarmId)
  setStoredMapping(map)
}

public class JapamAlarmIosModule: Module {
  public func definition() -> ModuleDefinition {
    Name("JapamAlarmIos")

    AsyncFunction("getCapability") { () -> [String: Any] in
      if #available(iOS 26.0, *) {
        return ["supported": true, "canScheduleExact": true]
      }
      return ["supported": false, "canScheduleExact": false]
    }

    AsyncFunction("requestPermission") { () -> Bool in
      if #available(iOS 26.0, *) {
        return await JapamAlarmIosService.requestPermission()
      }
      return false
    }

    AsyncFunction("getAuthorizationStatus") { () -> String in
      if #available(iOS 26.0, *) {
        return JapamAlarmIosService.authorizationStatus()
      }
      return "undetermined"
    }

    AsyncFunction("scheduleAlarm") {
      (args: [String: Any]) -> [String: Any] in
      guard let alarmId = args["alarmId"] as? String,
            let fireAtMs = (args["fireAt"] as? NSNumber)?.doubleValue
              ?? (args["fireAt"] as? Double) else {
        throw NSError(
          domain: "JapamAlarmIos",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "alarmId and fireAt are required"]
        )
      }
      let title = (args["label"] as? String) ?? "Japam time"
      // Bundled mantra-clip filename resolved in JS (getJapamAlarmSoundName);
      // nil when the mantra has no clip → falls back to the system alarm tone.
      let soundName = args["sound"] as? String

      if #available(iOS 26.0, *) {
        // The alarm repeats daily, so only the wall-clock time-of-day matters.
        let fireDate = Date(timeIntervalSince1970: fireAtMs / 1000.0)
        let comps = Calendar.current.dateComponents([.hour, .minute], from: fireDate)
        try await JapamAlarmIosService.schedule(
          alarmId: alarmId,
          hour: comps.hour ?? 0,
          minute: comps.minute ?? 0,
          title: title,
          soundName: soundName
        )
        return ["alarmId": alarmId, "fireAt": fireAtMs, "exact": true]
      }
      throw NSError(
        domain: "JapamAlarmIos",
        code: 2,
        userInfo: [NSLocalizedDescriptionKey: "AlarmKit requires iOS 26+"]
      )
    }

    AsyncFunction("cancelAlarm") { (alarmId: String) -> Void in
      if #available(iOS 26.0, *) {
        try? await JapamAlarmIosService.cancel(alarmId: alarmId)
      }
    }

    AsyncFunction("cancelAll") { () -> Void in
      if #available(iOS 26.0, *) {
        try? await JapamAlarmIosService.cancelAll()
      }
    }
  }
}

// MARK: - AlarmKit bridge (iOS 26+)

#if canImport(AlarmKit)

/// Empty metadata — AlarmKit requires a concrete `AlarmMetadata` type for the
/// alarm's attributes even when we render no custom Live Activity content.
@available(iOS 26.0, *)
struct JapamAlarmMetadata: AlarmMetadata {}

/// Thin wrapper around AlarmKit's `AlarmManager`. Lives in its own
/// availability-guarded type so the rest of the module doesn't have to
/// branch every call site.
@available(iOS 26.0, *)
enum JapamAlarmIosService {

  /// Saffron accent (matches the app's #B8621B) so the system associates these
  /// alarms with Vedansh and tells them apart from other apps' alarms.
  private static let tint = Color(red: 0.72, green: 0.38, blue: 0.11)

  static func requestPermission() async -> Bool {
    do {
      let status = try await AlarmManager.shared.requestAuthorization()
      return status == .authorized
    } catch {
      return false
    }
  }

  /// Current authorisation without prompting, mapped to the JS tri-state.
  static func authorizationStatus() -> String {
    switch AlarmManager.shared.authorizationState {
    case .authorized: return "granted"
    case .denied: return "denied"
    case .notDetermined: return "undetermined"
    @unknown default: return "undetermined"
    }
  }

  static func schedule(
    alarmId: String,
    hour: Int,
    minute: Int,
    title: String,
    soundName: String?
  ) async throws {
    // Cancel any prior alarm registered under the same JS id so the new
    // schedule replaces it cleanly (same semantics as Android's
    // FLAG_UPDATE_CURRENT on the PendingIntent).
    try? await cancel(alarmId: alarmId)

    let uuid = uuidFor(alarmId: alarmId)

    let stopButton = AlarmButton(
      text: "Stop",
      textColor: .white,
      systemImageName: "stop.circle"
    )
    let alert = AlarmPresentation.Alert(
      title: LocalizedStringResource(stringLiteral: title),
      stopButton: stopButton
    )
    let attributes = AlarmAttributes(
      presentation: AlarmPresentation(alert: alert),
      metadata: JapamAlarmMetadata(),
      tintColor: tint
    )

    // Daily recurrence: a relative schedule repeating on every weekday. The
    // system re-fires it each day and accounts for timezone changes, so we
    // never re-arm from JS (unlike Android's one-shot + boot receiver).
    let schedule = Alarm.Schedule.relative(
      Alarm.Schedule.Relative(
        time: Alarm.Schedule.Relative.Time(hour: hour, minute: minute),
        repeats: .weekly([
          .sunday, .monday, .tuesday, .wednesday, .thursday, .friday, .saturday,
        ])
      )
    )
    // Ring the bundled mantra clip via AlarmKit's custom-sound API. `.named`
    // resolves a file bundled into the app (the clip ships via the
    // expo-notifications `sounds` array); a nil name falls back to the system
    // alarm tone so mantras without a clip still ring.
    let alertSound: AlertConfiguration.AlertSound =
      soundName.map { AlertConfiguration.AlertSound.named($0) } ?? .default
    let config = AlarmManager.AlarmConfiguration(
      schedule: schedule,
      attributes: attributes,
      sound: alertSound
    )
    _ = try await AlarmManager.shared.schedule(id: uuid, configuration: config)
  }

  static func cancel(alarmId: String) async throws {
    let map = storedMapping()
    guard let uuidString = map[alarmId],
          let uuid = UUID(uuidString: uuidString) else { return }
    try? await AlarmManager.shared.cancel(id: uuid)
    forgetMapping(alarmId: alarmId)
  }

  static func cancelAll() async throws {
    let map = storedMapping()
    for (jsId, uuidString) in map {
      if let uuid = UUID(uuidString: uuidString) {
        try? await AlarmManager.shared.cancel(id: uuid)
      }
      forgetMapping(alarmId: jsId)
    }
  }
}

#else

// Build SDKs older than Xcode iOS 26 don't ship AlarmKit headers. Provide a
// stub so the module still compiles; the JS layer's iOS-26 runtime check
// prevents reaching this path on real devices below the threshold.
@available(iOS 26.0, *)
enum JapamAlarmIosService {
  static func requestPermission() async -> Bool { false }
  static func authorizationStatus() -> String { "undetermined" }
  static func schedule(
    alarmId: String, hour: Int, minute: Int, title: String, soundName: String?
  ) async throws {
    throw NSError(
      domain: "JapamAlarmIos",
      code: 99,
      userInfo: [NSLocalizedDescriptionKey: "AlarmKit not available in this SDK"]
    )
  }
  static func cancel(alarmId: String) async throws {}
  static func cancelAll() async throws {}
}

#endif

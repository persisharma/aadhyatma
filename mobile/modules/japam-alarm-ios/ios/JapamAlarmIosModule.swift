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
//
// IDs in our app are strings; AlarmKit identifies alarms by `UUID`. The
// module persists a string→UUID mapping in UserDefaults so cancel-by-id
// stays addressable across launches.
//
// Every AlarmKit call sits behind `@available(iOS 26.0, *)` so the build
// compiles cleanly on Expo's default iOS deployment target (15.1); JS
// guards on Platform.Version before calling, so older devices never reach
// these branches.

import ExpoModulesCore
import Foundation
#if canImport(AlarmKit)
import AlarmKit
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
      let soundName = args["mantraId"] as? String

      if #available(iOS 26.0, *) {
        try await JapamAlarmIosService.schedule(
          alarmId: alarmId,
          fireAt: Date(timeIntervalSince1970: fireAtMs / 1000.0),
          title: title,
          soundName: soundName.map { $0.replacingOccurrences(of: "-", with: "_") }
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

/// Thin wrapper around AlarmKit's `AlarmManager`. Lives in its own
/// availability-guarded type so the rest of the module doesn't have to
/// branch every call site.
@available(iOS 26.0, *)
enum JapamAlarmIosService {

  static func requestPermission() async -> Bool {
    do {
      let status = try await AlarmManager.shared.requestAuthorization()
      return status == .authorized
    } catch {
      return false
    }
  }

  static func schedule(
    alarmId: String,
    fireAt: Date,
    title: String,
    soundName: String?
  ) async throws {
    // Cancel any prior alarm registered under the same JS id so the new
    // schedule replaces it cleanly (same semantics as Android's
    // FLAG_UPDATE_CURRENT on the PendingIntent).
    try? await cancel(alarmId: alarmId)

    let uuid = uuidFor(alarmId: alarmId)
    let presentation = AlarmPresentation(
      alert: AlarmPresentation.Alert(
        title: LocalizedStringResource(stringLiteral: title),
        sound: soundName.flatMap { AlarmSound(named: $0) } ?? .default
      )
    )
    let alarm = Alarm(
      id: uuid,
      schedule: .fixed(fireAt),
      presentation: presentation
    )
    try await AlarmManager.shared.schedule(alarm)
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
  static func schedule(
    alarmId: String, fireAt: Date, title: String, soundName: String?
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

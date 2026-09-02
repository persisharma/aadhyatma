// JapamAlarmIosModule.swift
//
// iOS 26+ AlarmKit-backed Japam alarms.
//
// Mirrors the JS contract used by the Android Kotlin module:
//   scheduleAlarm({ alarmId, mantraId, fireAt, label?, sound?, repeatDays?, fixed? })
//   cancelAlarm(alarmId)
//   cancelAll()
//   getCapability() -> { supported, canScheduleExact }
//   requestPermission() -> bool
//   getAuthorizationStatus() -> "granted" | "denied" | "undetermined"
//
// Recurrence: `repeatDays` (JS getDay() indices, 0=Sun…6=Sat) selects the
// weekdays of a relative recurring AlarmKit schedule; absent/null means every
// day. `fixed: true` (one-time alarms, and each discrete occurrence while a
// skip-next is pending) schedules a non-recurring fixed alarm at `fireAt`
// instead. For recurring alarms `fireAt` (epoch ms) carries the time-of-day;
// the module extracts hour/minute from it. AlarmKit owns the recurrence and
// adjusts for timezone changes, so the app never re-arms from JS.
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
      // JS getDay() weekday indices; nil = every day. (NSNumber-bridged.)
      let repeatDays = (args["repeatDays"] as? [Any])?.compactMap {
        ($0 as? NSNumber)?.intValue
      }
      // One-shot when `fixed` is set OR repeatDays is an explicit empty array
      // — the wire contract (matching Android's Kotlin module) is that an
      // empty day set means "ring once"; falling through to a daily
      // recurrence here would fork the platforms.
      let fixed = ((args["fixed"] as? Bool) ?? false) || (repeatDays?.isEmpty == true)

      if #available(iOS 26.0, *) {
        let fireDate = Date(timeIntervalSince1970: fireAtMs / 1000.0)
        let comps = Calendar.current.dateComponents([.hour, .minute], from: fireDate)
        try await JapamAlarmIosService.schedule(
          alarmId: alarmId,
          hour: comps.hour ?? 0,
          minute: comps.minute ?? 0,
          title: title,
          soundName: soundName,
          repeatDays: repeatDays,
          fixedDate: fixed ? fireDate : nil
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

  /// Snooze length, mirroring the Android tier's 5-minute snooze.
  private static let snoozeSeconds: TimeInterval = 5 * 60

  /// JS `getDay()` index → AlarmKit weekday.
  private static let weekdayByJsDay: [Locale.Weekday] = [
    .sunday, .monday, .tuesday, .wednesday, .thursday, .friday, .saturday,
  ]

  /// True when the alarm registered under [uuid] is currently in its snooze
  /// countdown. Reconcile must leave such alarms alone — cancelling and
  /// re-scheduling would silently drop the T+5min re-ring the user asked for.
  private static func isCountingDown(_ uuid: UUID) -> Bool {
    let alarms = (try? AlarmManager.shared.alarms) ?? []
    return alarms.contains { alarm in
      guard alarm.id == uuid else { return false }
      if case .countdown = alarm.state { return true }
      return false
    }
  }

  static func schedule(
    alarmId: String,
    hour: Int,
    minute: Int,
    title: String,
    soundName: String?,
    repeatDays: [Int]?,
    fixedDate: Date?
  ) async throws {
    // An alarm mid-snooze keeps its countdown: skip the cancel+replace and
    // let the snoozed re-ring fire. The next reconcile (post-ring) applies
    // any pending edits.
    if let existing = storedMapping()[alarmId],
       let uuid = UUID(uuidString: existing),
       isCountingDown(uuid) {
      return
    }

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
    // Secondary "Snooze" button with countdown behaviour: tapping it silences
    // the alert and re-fires after `snoozeSeconds` — AlarmKit's native snooze.
    let snoozeButton = AlarmButton(
      text: "Snooze",
      textColor: .white,
      systemImageName: "zzz"
    )
    let alert = AlarmPresentation.Alert(
      title: LocalizedStringResource(stringLiteral: title),
      stopButton: stopButton,
      secondaryButton: snoozeButton,
      secondaryButtonBehavior: .countdown
    )
    // The countdown presentation is what the system shows while a snooze is
    // running (Live Activity with the remaining time + a Stop button).
    let countdown = AlarmPresentation.Countdown(
      title: LocalizedStringResource(stringLiteral: title),
      pauseButton: nil
    )
    let attributes = AlarmAttributes(
      presentation: AlarmPresentation(alert: alert, countdown: countdown),
      metadata: JapamAlarmMetadata(),
      tintColor: tint
    )

    // Recurrence: one-time alarms get a fixed date; repeating alarms get a
    // relative schedule on the selected weekdays (all seven when JS sends
    // none). The system re-fires it and accounts for timezone changes, so we
    // never re-arm from JS (unlike Android's one-shot + boot receiver).
    let schedule: Alarm.Schedule
    if let fixedDate {
      schedule = .fixed(fixedDate)
    } else {
      let days: [Locale.Weekday] =
        (repeatDays?.isEmpty == false)
          ? repeatDays!.compactMap { $0 >= 0 && $0 <= 6 ? weekdayByJsDay[$0] : nil }
          : Array(weekdayByJsDay)
      schedule = .relative(
        Alarm.Schedule.Relative(
          time: Alarm.Schedule.Relative.Time(hour: hour, minute: minute),
          repeats: .weekly(days)
        )
      )
    }
    // Ring the bundled mantra clip via AlarmKit's custom-sound API. `.named`
    // resolves a file bundled into the app (the clip ships via the
    // expo-notifications `sounds` array); a nil name falls back to the system
    // alarm tone so mantras without a clip still ring.
    let alertSound: AlertConfiguration.AlertSound =
      soundName.map { AlertConfiguration.AlertSound.named($0) } ?? .default
    let config = AlarmManager.AlarmConfiguration(
      countdownDuration: Alarm.CountdownDuration(preAlert: nil, postAlert: snoozeSeconds),
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
        // Spare alarms mid-snooze-countdown (and keep their mapping) so a
        // foreground reconcile can't swallow the snoozed re-ring; the
        // follow-up schedule() call skips them symmetrically.
        if isCountingDown(uuid) { continue }
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
    alarmId: String, hour: Int, minute: Int, title: String, soundName: String?,
    repeatDays: [Int]?, fixedDate: Date?
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

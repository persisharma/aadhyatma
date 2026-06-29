/**
 * Expo config plugin: iOS-side glue for the AlarmKit-backed Japam alarm
 * module (modules/japam-alarm-ios/).
 *
 * What it injects:
 *   - `NSAlarmKitUsageDescription` into Info.plist. AlarmKit refuses to
 *     schedule alarms without this string on iOS 26+; the user sees it in
 *     the authorisation prompt.
 *
 * What it does NOT do (handled elsewhere):
 *   - Autolinking the Swift module — local Expo modules under
 *     `modules/japam-alarm-ios/` are discovered automatically by
 *     `expo-modules-autolinking` during pod install.
 *   - Raising the iOS deployment target. The Swift code uses
 *     `@available(iOS 26.0, *)` guards so it compiles cleanly at Expo's
 *     default deployment target (15.1+); JS branches on `Platform.Version`
 *     before invoking the module, so older devices never reach the
 *     AlarmKit branch.
 */

const { withInfoPlist } = require('@expo/config-plugins');

const KEY = 'NSAlarmKitUsageDescription';
const DEFAULT_VALUE =
  'Vedansh schedules your Japam alarms with the system alarm so the mantra rings reliably at the time you choose.';

module.exports = function withJapamAlarmIos(config, props) {
  return withInfoPlist(config, (cfg) => {
    if (!cfg.modResults[KEY]) {
      cfg.modResults[KEY] = (props && props.usageDescription) || DEFAULT_VALUE;
    }
    return cfg;
  });
};

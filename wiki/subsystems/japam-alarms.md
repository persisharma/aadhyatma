---
title: Japam Alarms
type: subsystem
sources: [mobile/src/notifications/japamAlarms.ts, mobile/src/notifications/japamAlarmScheduler.ts, mobile/src/notifications/japamAlarmNative.ts, mobile/src/contexts/JapamAlarmsContext.tsx, mobile/src/screens/JapamAlarmsScreen.tsx, mobile/modules/japam-alarm-ios/ios/JapamAlarmIosModule.swift, mobile/plugins/native-android/JapamAlarmModule.kt, mobile/plugins/native-android/JapamAlarmReceiver.kt, mobile/plugins/native-android/JapamBootReceiver.kt, mobile/plugins/native-android/JapamAlarmActionReceiver.kt]
last_verified_date: 2026-07-06
confidence: high
status: current
---

## Summary

Japam Alarms let users schedule timed reminders to chant a mantra, with per-alarm on/off, an optional label, three repeat modes (daily / selected weekdays / one-time), and a skip-next feature. The alarm fires via a native AlarmKit/AlarmManager tier when available, falling back to `expo-notifications` WEEKLY triggers. All alarm state persists in AsyncStorage.

## Details

**Data model** (`notifications/japamAlarms.ts`): `JapamAlarm { id, mantraId, time: TimeOfDay, enabled, label?, repeatDays?, skipNextDate? }`.
- `repeatDays: undefined` — rings every day (backwards-compat with pre-repeat alarms).
- `repeatDays: [n, ...]` — rings on those `Date#getDay()` indices (sorted, deduplicated).
- `repeatDays: []` — **one-time sentinel**: rings at the next occurrence of `time`, then `JapamAlarmsContext` auto-disables it.
- `skipNextDate: 'YYYY-MM-DD'` — skips one firing on that local date; cleared automatically once the date has passed. Ignored for one-time alarms.

**Slot caps**:
- `MAX_JAPAM_ALARMS = 8` total alarms.
- `JAPAM_EXPO_SLOT_CAP = 24` expo pending-notification slots (protects the shared iOS 64-pending budget).

**Fire-time helpers** (pure, in `japamAlarms.ts`):
- `nextAlarmFireTimestamp(alarm, now)` — next epoch-ms fire honouring `repeatDays` + `skipNextDate`; bounded 15-day walk handles worst case (single weekday + skip on next occurrence = 14 days).
- `nextAlarmFireTimestamps(alarm, count, now)` — strictly-increasing list of fires; one-time alarms yield a single entry regardless of `count`.
- `skipOneshotPlan(alarm, count, now)` — discrete one-shot schedule covering a pending skip; first slot uses the base identifier, subsequent slots use `:occN` suffix.
- `isSkipPending(alarm, now)` — true while `skipNextDate` is today or a future date.
- `repeatSummary(repeatDays, isHi)` — human label: "Daily / Once / Weekdays / Weekends / Mon, Wed".
- `describeUntilFire(fireAtMs, nowMs, isHi)` — countdown copy ("in 7 hr 25 min").

**Scheduler** (`notifications/japamAlarmScheduler.ts`): reconciles the JS alarm list with the OS.
- Native tier: AlarmKit (iOS) / `AlarmManager` (Android) for precise timing.
- Expo fallback: WEEKLY triggers via `expo-notifications`.
- When a skip is pending on a recurrence tier, falls back to discrete one-shots: `ALARMKIT_SKIP_ONESHOT_COUNT = 7` / `EXPO_SKIP_ONESHOT_COUNT = 4`.

**Native modules**:
- iOS: `modules/japam-alarm-ios/ios/JapamAlarmIosModule.swift` — AlarmKit wrapper.
- Android: `plugins/native-android/JapamAlarmModule.kt` + `JapamAlarmReceiver.kt` (re-arms for next day) + `JapamBootReceiver.kt` (re-arms after device reboot) + `JapamAlarmActionReceiver.kt` (handles Snooze; `SNOOZE_MS = 5 min`, matching `SNOOZE_MINUTES = 5` in pure helpers).

**Context** (`contexts/JapamAlarmsContext.tsx`): CRUD on alarms, auto-disables one-time alarms after they fire, sweeps stale `skipNextDate` values on load.

**Screen** (`screens/JapamAlarmsScreen.tsx`): alarm list + inline editor. Editor shows a day-chip group (Sun … Sat) + a "Once" chip; a skip-next affordance for alarms with a pending skip.

**Testing**:
- `notifications/__tests__/japamAlarms.test.ts` — pure helpers via `tsx --test`.
- `notifications/__tests__/japamAlarmScheduler.jest.test.ts` — expo-notifications mock paths.
- `notifications/__tests__/japamAlarmNative.jest.test.ts` — native-tier mock paths.
- `contexts/__tests__/JapamAlarmsContext.test.tsx` — CRUD + one-time auto-disable.
- `screens/__tests__/JapamAlarmEditor.test.tsx` — editor UI.
- Maestro: `mobile/.maestro/japam-alarms-e2e.yaml`.

## Dependencies

- [[overview]] — `JapamAlarmsContext` provided in `App.tsx` (outer providers group).
- `notifications/pure.ts` — shares `TimeOfDay` type with daily-verse reminder scheduler.
- `expo-notifications` — fallback scheduling tier; also used for Snooze one-shots.

## Gotchas

- **`repeatDays: []` = one-time, not "disabled"** — the empty-array shape is the one-time sentinel; `undefined` means daily. `isOnceAlarm` and `repeatsDaily` distinguish the three modes.
- **iOS 64-pending budget** — expo WEEKLY triggers consume pending slots. `JAPAM_EXPO_SLOT_CAP = 24` leaves room for the daily-verse rolling window. Don't raise this without auditing total pending usage.
- **Skip forces one-shots on recurrence tiers** — a pending `skipNextDate` can't be expressed as a gap in a WEEKLY/AlarmKit recurrence rule. The scheduler replaces the standing recurrence with `N` discrete one-shots for the skip window, identified by the `:occN` suffix scheme.
- **Android reboot** — `JapamBootReceiver` re-arms all alarms after a device reboot. Without it, all alarms silently vanish on power cycle.
- **Snooze identifier exclusion** — snooze one-shots (`:snooze` suffix) are excluded from reconcile cancellation so a freshly-snoozed alarm isn't immediately cancelled by the next reconcile.
- **One-time alarms never skip** — `isSkipPending` returns false for one-time alarms; `skipNextDate` is documented as ignored for them but the scheduler double-checks via `isOnceAlarm`.

---
title: Japam Alarms
type: subsystem
sources: [mobile/app.json, mobile/src/notifications/japamAlarms.ts, mobile/src/notifications/japamAlarmScheduler.ts, mobile/src/notifications/japamAlarmNative.ts, mobile/src/contexts/JapamAlarmsContext.tsx, mobile/src/notifications/permissionState.ts, mobile/src/screens/JapamAlarmsScreen.tsx, mobile/assets/japam-alarm-sounds/index.ts, mobile/modules/japam-alarm-ios/ios/JapamAlarmIosModule.swift, mobile/plugins/native-android/JapamAlarmModule.kt, mobile/plugins/native-android/JapamAlarmReceiver.kt, mobile/plugins/native-android/JapamBootReceiver.kt, mobile/plugins/native-android/JapamAlarmActionReceiver.kt]
last_verified_date: 2026-07-24
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
- Android: `plugins/native-android/JapamAlarmModule.kt` + `JapamAlarmReceiver.kt` (re-arms for next day) + `JapamBootReceiver.kt` (re-arms after device reboot) + `JapamAlarmActionReceiver.kt` (handles Snooze; `SNOOZE_MS = 5 min`, matching `SNOOZE_MINUTES = 5` in pure helpers). The manifest declares user-controlled `SCHEDULE_EXACT_ALARM`, not the Play-restricted `USE_EXACT_ALARM` or `USE_FULL_SCREEN_INTENT`. `requestExactAlarmPermission()` opens Android's **Alarms & reminders** special-access screen; on return, the context refreshes `canScheduleExactAlarms()` and re-arms through `setAlarmClock()`. Until access is granted, the native module uses `setAndAllowWhileIdle()` as a Doze-tolerant but potentially delayed fallback.

**Alarm ring tune** (`assets/japam-alarm-sounds/index.ts`): per-mantra ≤30 s WAV clips (mono 22.05 kHz PCM — iOS notification-sound constraints). `getJapamAlarmSoundName(mantraId)` resolves the filename used by every tier: AlarmKit rings `.named(sound)`, the Android receiver looks up `res/raw/<mantra_id_with_underscores>`, and the expo tier creates one notification channel per mantra (`japam-alarm:<mantraId>:v2`) because Android 8+ pins a channel's sound at creation. Both Android tiers ring on the **alarm stream** (`USAGE_ALARM` / expo `audioAttributes.usage: ALARM`) so the alarm is audible through vibrate/silent and follows the alarm volume slider, matching AlarmKit's override-silent semantics on iOS. Clips bundled: `om-namah-shivaya`, `hare-krishna-mahamantra`, `gayatri-mantra` (the latter two are 28 s loudness-normalised excerpts cut from `assets/audio-library/` takes). `om-namo-bhagavate-vasudevaya` has no recording yet → system default tone.

**Context** (`contexts/JapamAlarmsContext.tsx`): CRUD on alarms, auto-disables one-time alarms after they fire, sweeps stale `skipNextDate` values on load, and separately tracks notification permission versus Android exact-alarm access. Returning from system settings refreshes both signals and triggers scheduler reconciliation.

**Screen** (`screens/JapamAlarmsScreen.tsx`): alarm list + inline editor. Editor shows a day-chip group (Sun … Sat) + a "Once" chip; a skip-next affordance for alarms with a pending skip. When an enabled Android alarm lacks exact access, an explanatory banner warns that Android may delay it and lets the user open **Alarms & reminders** settings.

**Testing**:
- `notifications/__tests__/japamAlarms.test.ts` — pure helpers via `tsx --test`.
- `notifications/__tests__/japamAlarmScheduler.jest.test.ts` — expo-notifications mock paths.
- `notifications/__tests__/japamAlarmNative.jest.test.ts` — native-tier mock paths.
- `notifications/__tests__/androidAlarmPolicy.jest.test.ts` — manifest/API guard against reintroducing `USE_EXACT_ALARM`, `USE_FULL_SCREEN_INTENT`, or `setFullScreenIntent`.
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
- **Never read expo's raw notification-permission status on Android** — `Notifications.getPermissionsAsync()` reports a *never requested* `POST_NOTIFICATIONS` as `denied` (it derives the status from `areNotificationsEnabled()`, false until granted), and never `undetermined`. Go through `notifications/permissionState.ts`, which folds in `canAskAgain` plus a persisted app-wide "we asked" flag (`@vedansh/notif-permission-asked`) to produce an effective status. Reading the raw status is what made the daily-verse reminder ship disabled on Android with no first-run prompt (Aug 2026).
- **Full-screen takeover is intentionally absent on Android** — Vedansh's alarm is a secondary feature, so the Play submission must not declare `USE_FULL_SCREEN_INTENT`. A high-importance `CATEGORY_ALARM` lock-screen notification still carries the mantra sound, tap target, Stop, and Snooze. Precise firing is a separate capability controlled by `SCHEDULE_EXACT_ALARM`.
- **Exact timing requires a user grant on new Android installs** — `SCHEDULE_EXACT_ALARM` is not pre-granted. Keep the explanatory screen banner and `ACTION_REQUEST_SCHEDULE_EXACT_ALARM` bridge paired; removing either leaves users on the inexact fallback without a recovery path.
- **Snooze identifier exclusion** — snooze one-shots (`:snooze` suffix) are excluded from reconcile cancellation so a freshly-snoozed alarm isn't immediately cancelled by the next reconcile.
- **One-time alarms never skip** — `isSkipPending` returns false for one-time alarms; `skipNextDate` is documented as ignored for them but the scheduler double-checks via `isOnceAlarm`.
- **Alarm clips need double registration** — a new mantra WAV must be added BOTH to `assets/japam-alarm-sounds/index.ts` AND to `app.json` → `expo-notifications.sounds[]`. The plugin copies the listed files into the native bundles (Android `res/raw/` with hyphens→underscores, iOS bundle root); missing either step silently falls back to the default chime.
- **Android channels are pinned at creation — attribute changes need new channel ids** — a `NotificationChannel`'s sound and audio attributes cannot be modified after creation. The July 2026 "no volume on Android" bug: v1 channels were created with `USAGE_NOTIFICATION`, so alarms played on the notification stream and vibrate/silent mode, DnD, or a zeroed notification-volume slider silenced them entirely. Fixed by moving to `USAGE_ALARM` (alarm stream, rings through silent like the Clock app) under **new `-v2`/`:v2` channel ids** on both the Kotlin and expo tiers; the v1 channels are deleted when the v2 one is ensured. Any future channel-attribute change must repeat this id-bump + delete dance. Also: the Kotlin channel sound URI must be **name-based** (`android.resource://<pkg>/raw/<name>`), never the int resource id — raw ids renumber across updates and a pinned int-id URI goes silently dead.
- **Clip WAV must be a bare `RIFF/WAVE/fmt /data` file — no `LIST` chunk** — iOS's notification / AlarmKit sound loader uses a minimal WAV parser that expects the `data` chunk immediately after `fmt ` and does not skip an intervening chunk. ffmpeg inserts a `LIST`/`INFO` metadata chunk (encoder tag, title, creator) between `fmt ` and `data` unless you pass `-map_metadata -1 -fflags +bitexact -flags +bitexact`; a clip carrying that chunk registers fine but silently fails to load and rings the default tone. This was the **real** July 2026 "alarm only rings Om Namah Shivaya" bug: #193 registered `hare-krishna-mahamantra` and `gayatri-mantra` correctly, but both were ffmpeg-encoded with a LIST chunk (the clean `om-namah-shivaya.wav` had none), so only that one ever played. Fixed by stripping the chunk to the canonical layout (audio PCM preserved byte-for-byte). Verify a new clip with a chunk dump — it must list only `fmt ` and `data`.

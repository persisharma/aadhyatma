# PRD-06 — Foundation Hardening: Tests, Local Crash Log, On-Device Backup

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | Continuous across v1.4 → v1.7 |
| **Window** | Weeks 27–39 (1 Jul – 30 Sep 2026) |
| **T-shirt size** | L (~8 dev-weeks, spread across the quarter) |
| **Owner** | TBA |

**Bundle-only constraint:** there is no third-party SDK that phones home, no cloud sync, no remote logging. Crash reports are buffered on-device and the user opts to share via the OS share sheet. Backup is a JSON file the user moves between devices through Files / iCloud Drive / AirDrop / email — Vedansh never sees the blob.

---

## 1. Problem

Three foundation gaps are dragging on every shipping decision:

1. **No reader smoke tests.** `RULEBOOK.md` §4.10 mandates a `<Pascal>ReaderScreen.test.tsx` per section. The `mobile/src/screens/__tests__/` directory **does not exist**. PR #31 (Balkand crash) shipped because `tsc` alone doesn't catch field-shape drift after a cast. Every future section is exposed to the same risk.
2. **Crash visibility is App-Store-dashboard-only.** Apple's own crash dashboard tells us crash rate and stack frames, but lags 24–48 h and gives no in-app context (which screen, what verse, what state). The bundle-only constraint rules out Sentry. We need an on-device crash record the user can voluntarily share.
3. **No backup.** `BookmarksContext`, `ReadingProgressContext`, `UserActivityContext` all live in `AsyncStorage`. An app uninstall / device migration wipes the streak data that the Sadhak Profile makes meaningful. The bundle-only constraint rules out cloud sync — we close the gap with **user-controlled export/import** instead.

These aren't features users see, but every one of PRD-01 through PRD-05 leans on them.

## 2. Goal

By end of Q3 2026:

- 100% of `*ReaderScreen` files have a co-located smoke test that mounts the screen with the chapter-1 fixture.
- An on-device crash log captures the last N errors with screen + state context, and surfaces a "Send report" affordance on next launch — opens the user's mail app via `expo-mail-composer` (or the OS share sheet as fallback). **Nothing transmitted without explicit user tap.**
- A user can export their bookmarks + reading progress + sadhak activity to a single `.json` file via the OS share sheet, and import that file on another device (or after a reinstall) to restore state.
- App Store Connect crash dashboard is checked weekly as the operational baseline.
- EAS build pipeline scripted so that store submissions take < 30 minutes from `git tag` to TestFlight upload.

## 3. Non-goals

- Sentry, Crashlytics, or any third-party crash service. Out by constraint.
- Cloud sync. Out by constraint.
- User accounts. Q4 at earliest.
- Server-side analytics. Out by constraint.
- `expo-updates` OTA. The OTA mechanism fetches a JS bundle from Expo's servers at runtime — this conflicts with the bundle-only stance. **Removed from this PRD.** Updates ship via App Store releases only.
- 100% test coverage. The goal is meaningful smoke-test coverage on the user-visible critical path.

## 4. User-visible behavior

### 4.1 Crash log

> When the app crashes (or hits a captured JS error), nothing visible happens that session. On next launch, a small parchment sheet appears: "Vedansh hit an issue last time. Send a short, anonymous report to the developers?" Tap **Send** → opens the mail composer with the buffered log pre-attached and a pre-filled subject. Tap **Discard** → log is cleared. **Nothing leaves the device unless I tap Send.**

### 4.2 Backup export

> In More → Backup, I tap **Export my data**. The app writes a `vedansh-backup-2026-09-15.json` file and opens the OS share sheet. I save it to Files, iCloud Drive, AirDrop to my new phone, or email to myself — my choice. The app does not upload anywhere.

### 4.3 Backup import

> On a fresh install, in More → Backup, I tap **Restore from file**. iOS opens its document picker. I pick the `vedansh-backup-*.json` I saved earlier. The app merges it in. My bookmarks, progress, and streaks come back.

## 5. Scope

### Track A — Reader smoke tests (weeks 27–30)

1. Add Jest + React Native Testing Library to `mobile/`. Configure `jest.config.js`, `jest.setup.ts`, `@testing-library/react-native`.
2. For each existing reader screen, scaffold `mobile/src/screens/__tests__/<Pascal>ReaderScreen.test.tsx`:
   - Mounts the screen with the chapter-1 / first-verse fixture from its data module.
   - Asserts the first verse text renders (Devanagari).
   - Asserts the language toggle button is present and pressable.
   - For chapter-based readers, asserts pager dot count matches verse count.
3. Wire tests into CI (GitHub Actions). Block merge on red CI for any PR touching `mobile/src`.
4. Update `RULEBOOK.md §4.10` to reflect the harness is live.

### Track B — Local crash log & in-app diagnostics (weeks 28–31)

1. Install a JS global error handler in `App.tsx` via `ErrorUtils.setGlobalHandler`. Wrap each top-level screen in a `<CrashBoundary>` React error boundary that funnels errors into the same sink.
2. New module `mobile/src/diagnostics/crashLog.ts`:
   - Ring buffer of last 20 entries in `AsyncStorage` under `@vedansh/crash-log`.
   - Entry shape: `{ ts, kind: 'fatal' | 'caught' | 'event', screen, message, stackHead /* 10 lines */, appVersion, osVersion, locale }`. **No PII, no verse text, no bookmark contents, no user-typed queries** — all values come from a pre-vetted whitelist.
3. On app launch, if buffer is non-empty and last entry is from a previous session, show the "Send report?" sheet (§4.1).
4. **Send mechanism:** `expo-mail-composer` with a pre-filled subject `[Vedansh] Crash report from v{ver}` and the log JSON as attachment. If mail isn't configured on the device, fall back to the OS share sheet (the user can pick "Save to Files" or anything else). Either way, the user is in the driver's seat.
5. **Local diagnostics ledger** for product metrics that previously would have gone to Sentry:
   - Same module exposes `logEvent(name, props)` where `name` is from a whitelist (notif_opt_in, audio_play, search_query, theme_change, share_initiated, …) and `props` are bounded primitives only (no free-form strings, no query text, no verse ids that could identify content preferences as PII).
   - Aggregated daily into `@vedansh/diagnostics-ledger`. The user can view their own ledger in a hidden "About → Diagnostics" screen and share it on request.
   - **PM consumption:** weekly review of TestFlight tester diagnostics shares + App Store Connect dashboards. We accept that fleet-wide quantitative measurement is harder than with a SaaS analytics tool; that's the price of bundle-only.

### Track C — On-device backup export/import (weeks 30–37)

1. New module `mobile/src/backup/backup.ts` exposing `exportBackup()` and `importBackup(uri)`.
2. **Export.** Serialize `bookmarks + readingProgress + userActivity + notificationPreferences + readingPreferences` into a single JSON, version-stamped:
   ```ts
   type BackupBlob = {
     version: 1;
     createdAt: string;        // ISO
     appVersion: string;       // e.g. '1.7.0'
     bookmarks: BookmarkRef[];
     readingProgress: Record<string, { chapterIndex: number; verseIndex: number; updatedAt: string }>;
     userActivity: Record<DateKey, DailyEntry>;
     notificationPreferences: NotificationPreferences;
     readingPreferences: ReadingPreferences;
   };
   ```
3. Write to a temp file via `expo-file-system`, then hand to `expo-sharing.shareAsync(uri)`. The OS share sheet takes it from there (Files, iCloud Drive, AirDrop, mail attachment, etc.).
4. **Import.** `expo-document-picker.getDocumentAsync({ type: 'application/json' })` → read file → validate against schema (zod, lightweight) → merge.
5. **Merge rules**, explicit and unit-tested:
   - `bookmarks`: union by `id`. Local wins on duplicate timestamp.
   - `readingProgress`: per `sourceId`, latest `updatedAt` wins.
   - `userActivity`: per `DateKey`, sum `reads` and **max** `japa` counters (re-importing same day twice does not double-count).
   - `notificationPreferences`, `readingPreferences`: imported overrides only if local is at defaults; otherwise we keep local and surface a one-line "Some preferences preserved from this device" toast.
6. **No "Backup ID" or codes.** The file is the artifact. Lose the file = lose the backup. We explain this clearly in the help text — the trade for not running any servers.
7. **Privacy:** the backup file contains nothing the app doesn't already store locally. It is plaintext JSON so a savvy user can inspect it before sharing.

### Track D — Build & release scripting (week 27, one-shot)

1. Add `scripts/eas-submit.sh` wrapping the `eas build && eas submit` flow with parameter checks (branch name, version bump prompts).
2. Document in `mobile/README.md` so anyone can ship without remembering flags.
3. **Removed** from earlier draft: OTA via `expo-updates`. The OTA mechanism fetches code from Expo's servers at runtime; that conflicts with bundle-only. All updates go through the App Store.

## 6. Technical sketch — crash log surface flow

```
App launch
  ↓
loadCrashBuffer()
  ↓
buffer.length > 0 && last entry from previous session?
  ↓ yes                                       ↓ no
show CrashReportSheet (parchment modal)       continue normally
  ↓
user taps:
  • Send → openMailComposer({ subject, body, attachments: [logUri] })
           ↓
           mail composer / share sheet handles delivery (user-controlled)
           ↓
           on dismiss → clearBuffer()
  • Discard → clearBuffer()
  • Later → leave buffer; ask again next launch (cap 3 asks)
```

No automatic send. No background upload. No "anonymous" silent transmission. The bundle-only stance is the user's privacy guarantee.

## 7. Success metrics

| Metric | Source | Target |
|---|---|---|
| `*ReaderScreen` smoke-test coverage | CI report | 100% of active sections |
| Crash-free sessions, iOS | App Store Connect | ≥ 99.5% |
| Crash-report send rate (when prompted) | Local counter | ≥ 30% (low expectations — users have to actively tap Send) |
| Backup export usage | Local counter | ≥ 15% of users within 30 days |
| Backup import success rate | Local counter (validate → merge → no thrown error) | ≥ 95% |
| Median time from `git tag` → TestFlight | Manual log | < 30 min |

## 8. Risks

| Risk | Mitigation |
|---|---|
| Without a fleet analytics SDK, we'll miss low-frequency bugs | TestFlight cohort + the local crash log + App Store Connect's free crash dashboard. Accept slower iteration on rare bugs as a deliberate trade. |
| User loses backup file and asks for "their data back" | Cannot recover — there's no cloud copy. Make this **extremely** explicit in the export flow's help text. Encourage users to email the backup to themselves as a copy. |
| Backup JSON schema drift between app versions breaks imports | Version-stamped blob; importer runs migration steps (`v1 → v2` etc.); imports from a higher version than the running app show "This backup is from a newer app version — please update Vedansh first." |
| Mail composer not configured on user's device → can't send crash report | Fallback to OS share sheet; user picks any sharing target. |
| RNTL setup with Expo SDK 54 is flaky | Pre-research in week 27 (1 day); if flaky, swap to Jest + react-test-renderer for smoke tests only. |
| Diagnostics ledger grows unbounded | Cap at 90 days; trim on each app launch. |
| User reads our crash log and is alarmed by what it contains | The log entry shape is small and audit-able. Show an example log in the help modal. |

## 9. Definition of done

- Every `*ReaderScreen` has a co-located smoke test that runs in CI.
- App Store Connect dashboard shows crash-free sessions ≥ 99.5% for 7 consecutive days in production.
- Crash-log prompt fires correctly in QA after a synthetic crash; sending opens the mail composer with the JSON attached.
- ≥ 15% of users export at least once within 30 days of launch (TestFlight cohort).
- A test "export → uninstall → reinstall → import" flow completes end-to-end in QA. State is restored.
- `scripts/eas-submit.sh` ships a build to TestFlight at least once during the quarter.

## 10. Open questions

1. Should the crash-report prompt offer a free-text field ("describe what you were doing") so users can add context, or keep it strictly attachment-only to minimize cognitive load? Recommend offer free-text **inside the mail composer** (where the user is already in a "write" mood); don't prompt for it in-app.
2. Should the backup file be encrypted with a user-chosen passphrase? Adds friction; the file already lives in user-chosen storage (iCloud Drive, Files). Recommend **no** for v1, **yes** as a v2 option.
3. Where does the "About → Diagnostics" hidden screen live? Recommend behind a 5-tap on the app version number in More tab (classic Easter-egg pattern; non-discoverable to regular users).
4. Do we want to surface "Last backup: 2026-09-15" in More → Backup as a nudge to re-export periodically? Recommend yes — backup files go stale fast as users accumulate progress.

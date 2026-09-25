---
title: Backup & Restore (बैकअप व पुनर्स्थापन)
type: subsystem
sources: [mobile/src/backup/registry.ts, mobile/src/backup/envelope.ts, mobile/src/backup/backupIo.ts, mobile/src/backup/backupMeta.ts, mobile/src/screens/BackupScreen.tsx, mobile/src/screens/MoreScreen.tsx, mobile/src/navigation/MoreStackNavigator.tsx, mobile/src/backup/__tests__/backup.test.ts, mobile/src/screens/__tests__/BackupScreen.test.tsx, mobile/.maestro/backup-restore-smoke.yaml, mobile/src/utils/derivedCacheReset.ts, docs/roadmap/prds/06-foundation-hardening.md, design.md, RULEBOOK.md]
last_verified_date: 2026-09-25
confidence: high
status: current
---

## Summary

PRD-06 Track C. Everything a user typed or chose — birth profiles, janma and pitru tithis, the kul
record, Guna Milan / Namkaran / Ghar Vastu inputs, the daan ledger, bookmarks, progress, streaks,
japam, routines, sankalp, follows, alarms, and preferences — lives only in this phone's
AsyncStorage. The bundle-only constraint forbids a cloud copy, so the transfer is **one JSON file
the user hands to the OS share sheet** (Files / iCloud Drive / Gmail / AirDrop) and picks back with
the OS document picker on the new phone. Vedansh never sees the blob and keeps no copy. Design:
design.md §75; contract: RULEBOOK §29.

## Shape

- `backup/registry.ts` — `BACKUP_KEYS`: every user-authored AsyncStorage key, exact, with a group
  (`family` · `practice` · `follows` · `preferences`) and bilingual label; `BACKUP_EXCLUDED_KEYS`:
  the deliberately-not-backed-up keys/prefixes (derived caches, OS-mirror bookkeeping, install
  identity, per-install lifecycle flags, the backup stamp). `isBackupKey` / `isExcludedKey`.
- `backup/envelope.ts` — pure, RN-free. `{ format: 'vedansh-backup', version: 1, exportedAt,
  appVersion, entries: { key: { json } | { raw } } }`. `buildBackupEnvelope(multiGet pairs)`,
  `parseBackupText(text)` → `{ok, envelope} | {ok:false, reason}` (`corrupt` · `not-a-backup` ·
  `kul-parampara-file` · `newer-version` · `empty`), `planRestoreWrites(envelope)` → multiSet pairs,
  `summarizeEnvelope` / `countItems` for the screen's per-group counts, `backupFilename(now)`.
- `backup/backupIo.ts` — the device glue: `readBackupEnvelope`, `exportBackup` (cache file →
  `Sharing.shareAsync`, then stamp), `pickBackupFile` (`expo-document-picker` → `File.text()` →
  parse), `applyRestore` (one `multiSet`), `reloadAfterRestore` (`Updates.reloadAsync`, false in
  Expo Go / dev client).
- `backup/backupMeta.ts` — `@vedansh/backup-meta` `{ lastExportedAt }` behind a tiny
  `useSyncExternalStore` store: `useLastBackupAt()` (undefined while hydrating, null = never) feeds
  the More row state and the screen's last-backup line.
- `screens/BackupScreen.tsx` — lede, "What a backup holds" card (last-backup line + four group
  counts + Export), "Bring it back on a new phone" card (Restore), one notice line, footer.
  Route `Backup` on the More stack via `getComponent`; door = the ⇅ row in the More hub's ऐप group
  after Home-Screen Widgets (`more-backup`, state `NEW` → export `shortDate`).

## Working Rules

- **Register every new user-authored key** in `BACKUP_KEYS` on the PR that adds the store, or
  exclude it with a stated reason. `backup.test.ts` scans `src/` for every `@vedansh` key literal
  and fails on any in neither list (RULEBOOK §29.1–2).
- **Restore is replace-per-store, registry-only.** The parser drops unknown keys and malformed
  values before the screen sees the envelope; a hand-edited file cannot plant `install-id` or a
  foreign key. Stores the file lacks are untouched. Field-level merge (PRD-06 §C.5) is deferred.
- **A store must tolerate being overwritten with an older shape of itself** — every store already
  migrates on read; keep that when changing a shape. Bump `BACKUP_VERSION` only when the envelope
  shape changes (a newer file is refused whole with an "update the app" notice).
- **The regional-lens pair travels together** (`panchang-lenses` + `panchang-lenses-seeded`) —
  `derivedCacheReset.ts` explains why one half alone hands back a calendar the user turned off.
- Maestro never opens the share sheet or the document picker; the e2e covers the door and the
  screen only. The format and the restore path are unit-pinned.

## Gotchas

- **Contexts hydrate once at mount** — there is no live re-hydrate path, so a restore MUST be
  followed by `Updates.reloadAsync()`. In Expo Go / dev client that is unavailable; the screen then
  shows "close and reopen Vedansh". A context that writes back on its own state change could, in
  principle, overwrite a restored key in the window before the reload; the reload is immediate.
- **Do not back up OS-mirror bookkeeping** (`notif-meta`, `notif-permission-asked`,
  `japam-alarms/once-armed`, `widget:last-plan-key-v1`) — carrying it to a new phone desyncs the
  schedulers, which duplicate or orphan real notifications. The preferences ARE carried and the
  schedulers rebuild the bookkeeping from them on launch (permission must be granted again on the
  new device).
- **`@vedansh/language` may be a bare string**, not JSON — the `{ raw }` arm exists for it; the
  round-trip test pins both arms.
- `expo-constants` and `expo-updates` are `require()`d lazily (untranspiled ESM Jest cannot parse
  — the `buildFingerprint.ts` rule); `BackupScreen.test.tsx` mocks `backupIo` wholesale.
- `expo-document-picker` is a **new native dependency** → import ships with a store release; export
  alone would have been OTA-able. Android's picker ignores the MIME list, so the parser is the gate.
- The Kul Parampara "hand-on" export (`panchang/kulParamparaShare.ts`, format
  `vedansh-kul-parampara`) is a different, narrower file; the restore screen names it rather than
  calling it garbage, and its own import is still unbuilt.

## Dependencies

[[panchang]] (birth profiles, janma/pitru tithis, kul record, lenses, city), [[routine]],
[[japam-alarms]], [[notifications]] (why meta is excluded), [[daan-punya]], [[vastu-disha]].

/**
 * The device side of backup & restore (PRD-06 Track C): read the registry's
 * keys out of AsyncStorage, hand the file to the OS share sheet (Files, iCloud
 * Drive, Gmail, AirDrop — the user's choice; Vedansh never sees the blob), and
 * on the way back let the OS document picker choose a file, validate it, and
 * write it in. No cloud, no upload target, no prompt.
 *
 * Kept apart from `envelope.ts` so the format stays RN-free and tsx-testable;
 * the screen mocks THIS module.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import {
  backupFilename,
  buildBackupEnvelope,
  parseBackupText,
  planRestoreWrites,
  type BackupEnvelope,
  type ParseResult,
} from './envelope';
import { BACKUP_KEYS } from './registry';
import { recordBackupExported } from './backupMeta';

/** Lazily read so `expo-constants` never enters the static module graph (Jest cannot parse it). */
function readAppVersion(): string {
  try {
    const Constants = require('expo-constants').default;
    return Constants?.expoConfig?.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/** Snapshot every registry key that is set on this device. */
export async function readBackupEnvelope(now: Date = new Date()): Promise<BackupEnvelope> {
  const pairs = await AsyncStorage.multiGet(BACKUP_KEYS.map((entry) => entry.key));
  return buildBackupEnvelope(pairs, { now, appVersion: readAppVersion() });
}

export type ExportOutcome = 'shared' | 'unavailable';

/**
 * Write the envelope to the cache directory and open the share sheet. Returns
 * `unavailable` when the OS offers no share sheet; throws on a write failure.
 * The "last backed up" stamp is recorded only after the sheet was presented.
 */
export async function exportBackup(now: Date = new Date()): Promise<ExportOutcome> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) return 'unavailable';
  const envelope = await readBackupEnvelope(now);
  const file = new File(Paths.cache, backupFilename(now));
  file.write(JSON.stringify(envelope, null, 2));
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Vedansh backup',
  });
  await recordBackupExported(now);
  return 'shared';
}

export type PickOutcome = { picked: false } | { picked: true; result: ParseResult };

/**
 * Let the user choose a backup file and validate it. Nothing is written here —
 * the screen shows what the file holds and asks before `applyRestore`.
 */
export async function pickBackupFile(): Promise<PickOutcome> {
  const picked = await DocumentPicker.getDocumentAsync({
    // iOS honours the UTI list; Android's picker is looser, so the parser is
    // the real gate (a non-backup JSON is reported, never written).
    type: ['application/json', 'public.json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || !picked.assets?.[0]) return { picked: false };
  const text = await new File(picked.assets[0].uri).text();
  return { picked: true, result: parseBackupText(text) };
}

/** Write the envelope's stores in one `multiSet`. Throws on storage failure. */
export async function applyRestore(envelope: BackupEnvelope): Promise<number> {
  const writes = planRestoreWrites(envelope);
  if (writes.length > 0) await AsyncStorage.multiSet(writes);
  return writes.length;
}

/**
 * Every context hydrates from AsyncStorage once, at mount — so after a restore
 * the JS tree must start over for the restored stores to be read. Returns
 * false when the runtime cannot reload (Expo Go / dev client, or a transient
 * native error); the screen then asks the user to restart the app.
 */
export async function reloadAfterRestore(): Promise<boolean> {
  try {
    const Updates = require('expo-updates');
    if (!Updates.isEnabled) return false;
    await Updates.reloadAsync();
    return true;
  } catch {
    return false;
  }
}

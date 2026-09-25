/**
 * "Last backed up" — the one nudge PRD-06 §10.4 asked for. A per-device stamp
 * (this device's file, not the data), so it is NOT in the backup registry.
 *
 * A tiny external store rather than a context: the More hub only needs a
 * string for one row state, and a provider for that would sit in the launch
 * graph of every screen. `useSyncExternalStore` hydrates on first subscribe.
 */
import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BACKUP_META_KEY = '@vedansh/backup-meta';

type BackupMeta = { lastExportedAt: number | null };

/** `undefined` = not hydrated yet; `null` = never backed up. */
let lastExportedAt: number | null | undefined;
let hydrating: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function parseMeta(raw: string | null): number | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<BackupMeta>;
    return typeof parsed.lastExportedAt === 'number' ? parsed.lastExportedAt : null;
  } catch {
    return null;
  }
}

function hydrate(): Promise<void> {
  if (!hydrating) {
    hydrating = AsyncStorage.getItem(BACKUP_META_KEY)
      .then((raw) => {
        if (lastExportedAt === undefined) {
          lastExportedAt = parseMeta(raw);
          emit();
        }
      })
      .catch(() => {
        if (lastExportedAt === undefined) {
          lastExportedAt = null;
          emit();
        }
      });
  }
  return hydrating;
}

export async function readLastBackupAt(): Promise<number | null> {
  await hydrate();
  return lastExportedAt ?? null;
}

/** Called by the export path after the share sheet was presented. */
export async function recordBackupExported(now: Date = new Date()): Promise<void> {
  lastExportedAt = now.getTime();
  emit();
  const meta: BackupMeta = { lastExportedAt: lastExportedAt };
  await AsyncStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta)).catch(() => undefined);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void hydrate();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): number | null | undefined {
  return lastExportedAt;
}

/** `undefined` while hydrating, `null` when never backed up, else epoch ms. */
export function useLastBackupAt(): number | null | undefined {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Test helper: forget the hydrated stamp so the next subscribe re-reads storage. */
export function __resetBackupMetaForTests(): void {
  lastExportedAt = undefined;
  hydrating = null;
  listeners.clear();
}
